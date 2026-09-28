// Items in grids on screen (DESIGN 10, 13.5), adapted from the workshop toy: drag with a live landing preview and
// tonight's forecast, R or right-click to turn, alt-drag to split, shift-click to send, and FLIP glides.

import { BOXES, type Box } from '../data/items.ts'
import { reach } from '../model/apply.ts'
import { K, dims, grab, planDrop, where, type Held, type Plan } from '../model/containers.ts'
import { propsOf } from '../model/items.ts'
import { TESTED } from '../data/relics.ts'
import { lift } from '../art/icons.ts'
import { forecast, forecastDrop } from '../model/seam.ts'
import type { Item } from '../model/state.ts'
import { act, s } from './game.ts'
import { pixel } from '../art/icons.ts'
import { iconSize, UNKNOWN } from './look.ts'
import { esc, icon } from './ui.ts'

const cell = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cell')) || 34

/** Tonight's forecast, worked out once per change of state. */
let fc: { day: number; key: string; map: Map<number, string[]> } | null = null
function tonight(): Map<number, string[]> {
  const key = JSON.stringify([s.C, s.machines, s.blackout, s.seamA, s.villagers.length, s.conduitTapped, !!s.run])
  if (!fc || fc.key !== key || fc.day !== s.day) fc = { day: s.day, key, map: forecast(s) }
  return fc.map
}

export const itemName = (it: Item) => `${it.rotten ? 'Rotten ' : ''}${K[it.kind].relic && !s.know[`R:${it.kind}:class`] ? 'Unknown Relic' : K[it.kind].name}`

/** The tooltip: what it is, what it's worth, its state, and what tonight does to it where it lies. */
function itemTip(it: Item) {
  const k = K[it.kind]
  const unknown = k.relic && !s.know[`R:${it.kind}:class`]
  const lines = [`${itemName(it)}${it.n > 1 ? ` ×${it.n}` : ''}`, ...(unknown ? ['Nobody knows what this does. The lab can find out, a property a night; so can wearing it, riskier.'] : k.text)]
  const worth = (['food', 'water', 'power'] as const).filter(v => k[v]).map(v => `${v.toUpperCase()} ${k[v]}`)
  const props = unknown
    ? TESTED.map(p => [p, s.know[`R:${it.kind}:${p}`]] as const).filter(([, c]) => c && c.value !== 0).map(([p, c]) => `${p} ${c!.state === 'rough' ? c!.value : c!.value}`)
    : Object.entries(propsOf(it)).filter(([, v]) => v).map(([p, v]) => `${p} ${v}`)
  if (worth.length || props.length) lines.push([...worth, ...props].join(' · '))
  if (it.rotten) lines.push('Rotten: nobody will eat it, and it spreads to what it touches.')
  else if (it.fresh !== undefined) lines.push(`Fresh: ${it.fresh} night${it.fresh === 1 ? '' : 's'} left`)
  if (it.cond !== undefined) lines.push(`Condition: ${it.cond}%`)
  if (k.weapon) lines.push(`Weapon +${k.weapon} on the belt`)
  if (it.kind === 'brochure') lines.push('Double-click to read it.')
  const fx = tonight().get(it.id)
  lines.push(fx?.length ? `Tonight: ${fx.join('; ')}.` : 'Tonight: nothing happens to it here.')
  return lines.join('\n')
}

export function itemHtml(it: Item, extra = '') {
  const k = K[it.kind]
  const d = dims(it)
  const unknown = k.relic && !s.know[`R:${it.kind}:class`]
  const bar = it.rotten ? '' : it.fresh !== undefined && k.fresh ? `<span class="bar fresh" style="--v:${it.fresh / k.fresh}"></span>`
    : it.cond !== undefined ? `<span class="bar cond" style="--v:${it.cond / 100}"></span>` : ''
  const cls = [it.rotten && 'rotten', k.relic && 'relic', extra].filter(Boolean).join(' ')
  // Dithered pixels (13.3); a relic's two frames swap colours every 600 ms.
  const size = iconSize(k.w, k.h)
  const [name, a, b] = unknown ? ['cube', UNKNOWN[0], UNKNOWN[1]] : [k.icon, k.color, k.relic ? lift(k.color) : undefined]
  const frames = k.relic ? [pixel(name, size, a, b), pixel(name, size, b!, a)] : [pixel(name, size, a)]
  const art = frames.every(Boolean) ? frames.map(f => `<img src="${f}" alt="">`).join('') : icon(name)
  return `<div class="item ${cls}" data-id="${it.id}" data-tip="${esc(itemTip(it))}" style="--x:${it.x};--y:${it.y};--w:${d.w};--h:${d.h};--c:${unknown ? UNKNOWN[0] : k.color}">
    <i class="art ${k.relic ? 'shimmer' : ''}" style="--px:${size + 2};--r:${it.rot ? 90 : 0}deg">${art}</i>${bar}${it.n > 1 ? `<b class="n">${it.n}</b>` : ''}${it.rotten ? `<span class="fly">${icon('fly')}</span>` : ''}</div>`
}

/** A container: its name, what it does, how full it is, and its grid. */
export function boxHtml(box: Box, note = '') {
  const b = BOXES[box]
  const used = s.C[box].reduce((n, it) => n + dims(it).w * dims(it).h, 0)
  const off = !reach(s, box)
  return `<section class="box ${off ? 'away' : ''}" data-box="${box}" style="--w:${b.w};--h:${b.h}">
    <header data-tip="${esc(`${b.name} (${note || b.env}): ${b.blurb}\n${used} of ${b.w * b.h} spaces used.`)}">${icon(b.icon)}<b>${b.name}</b>
      <span class="fill">${used}/${b.w * b.h}</span><button class="tidy" data-on="tidy:${box}" data-tip="Tidy: merge piles and pack by kind." ${off ? 'disabled' : ''}>${icon('broom')}</button></header>
    <div class="grid" data-grid="${box}">${s.C[box].map(it => itemHtml(it)).join('')}</div>
  </section>`
}

// ---------------------------------------------------------------- dragging

interface Drag { id: number; split: boolean; held: Held; el: HTMLElement; gx: number; gy: number; rot: boolean; plan: Plan | null; at: string; box: Box | null; x: number; y: number }
let press: { id: number; x: number; y: number; alt: boolean; gx: number; gy: number } | null = null
let drag: Drag | null = null
let last: PointerEvent | null = null
const $$ = (sel: string) => [...document.querySelectorAll<HTMLElement>(sel)]

const rects = () => new Map($$('.box .item[data-id]').map(el => [+el.dataset.id!, el.getBoundingClientRect()]))
/** Things that moved glide from where they were (the workshop's FLIP). */
function glide(from: Map<number, DOMRect>) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  for (const el of $$('.box .item[data-id]')) {
    const was = from.get(+el.dataset.id!)
    if (!was) continue
    const now = el.getBoundingClientRect()
    const [dx, dy] = [was.left - now.left, was.top - now.top]
    if (Math.abs(dx) + Math.abs(dy) > 1) el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 170, easing: 'cubic-bezier(.2, .8, .3, 1)' })
  }
}
function shake(id: number) {
  document.querySelector(`.box .item[data-id="${id}"]`)?.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'none' }], { duration: 220 })
}

function begin() {
  const p = press!
  press = null
  const held = grab(s, p.id, p.alt)
  if (!held) return
  document.body.classList.add('dragging')
  const el = document.body.appendChild(document.createElement('div'))
  el.className = 'floating'
  drag = { id: p.id, split: p.alt && held.from === null, held, el, gx: p.gx, gy: p.gy, rot: held.item.rot, plan: null, at: '', box: null, x: 0, y: 0 }
  if (held.from) document.querySelector(`.box .item[data-id="${p.id}"]`)?.classList.add('lifted')
  paintFloating()
}
const paintFloating = () => { drag!.el.innerHTML = `${itemHtml({ ...drag!.held.item, rot: drag!.rot, x: 0, y: 0 })}<div class="droptip"></div>` }

function turn() {
  const d = drag!
  if (K[d.held.item.kind].w === K[d.held.item.kind].h) return
  d.rot = !d.rot;
  [d.gx, d.gy] = [d.gy, d.gx]
  d.at = ''
  paintFloating()
  if (last) move(last)
}

function clearGhosts() {
  for (const g of $$('.ghost')) g.remove()
  for (const el of $$('.shoved')) el.classList.remove('shoved')
}
const ghost = (box: Box, x: number, y: number, w: number, h: number, cls: string) =>
  document.querySelector(`[data-grid="${box}"]`)?.insertAdjacentHTML('beforeend', `<div class="ghost ${cls}" style="--x:${x};--y:${y};--w:${w};--h:${h}"></div>`)

function move(e: PointerEvent) {
  const d = drag!
  d.el.style.transform = `translate(${e.clientX - d.gx}px, ${e.clientY - d.gy}px)`
  const grid = document.elementsFromPoint(e.clientX, e.clientY).map(n => n.closest<HTMLElement>('.grid[data-grid]')).find(Boolean)
  const box = grid?.dataset.grid as Box | undefined
  if (!grid || !box || !reach(s, box)) { if (d.at) { d.at = ''; d.plan = null; d.box = null; clearGhosts() } return }
  const r = grid.getBoundingClientRect()
  const x = Math.round((e.clientX - d.gx - r.left) / cell())
  const y = Math.round((e.clientY - d.gy - r.top) / cell())
  const at = `${box}:${x}:${y}:${d.rot}`
  if (at === d.at) return
  Object.assign(d, { at, box, x, y, plan: planDrop(s, d.held, box, x, y, d.rot) })
  clearGhosts()
  const p = d.plan
  const said = p ? forecastDrop(s, d.id, d.split, box, x, y, d.rot) : []
  const made = p?.recipe !== undefined ? `Makes something of the ${itemName(where(s, p.recipe)!.it)}. ` : ''
  d.el.querySelector('.droptip')!.textContent = !p ? `No room in the ${BOXES[box].name}.` : `${made}Tonight, here: ${said.length ? said.join('; ') : 'nothing happens to it'}.`
  const dd = dims({ ...d.held.item, rot: p?.rot ?? d.rot })
  if (!p) return ghost(box, Math.max(0, Math.min(BOXES[box].w - dd.w, x)), Math.max(0, Math.min(BOXES[box].h - dd.h, y)), dd.w, dd.h, 'bad')
  const target = p.recipe ?? p.merge
  if (target !== undefined) {
    const t = where(s, target)!.it
    const td = dims(t)
    return ghost(box, t.x, t.y, td.w, td.h, p.recipe !== undefined ? 'recipe' : 'merge')
  }
  ghost(box, p.x, p.y, dd.w, dd.h, 'land')
  for (const mv of p.moves) {
    const o = where(s, mv.id)!.it
    const md = dims({ ...o, rot: mv.rot })
    ghost(mv.box, mv.x, mv.y, md.w, md.h, 'shove')
    document.querySelector(`.box .item[data-id="${mv.id}"]`)?.classList.add('shoved')
  }
}

function finish(cancel = false) {
  const d = drag!
  drag = null
  document.body.classList.remove('dragging')
  clearGhosts()
  const from = rects()
  from.set(d.split ? -1 : d.id, d.el.firstElementChild!.getBoundingClientRect())
  d.el.remove()
  document.querySelector('.lifted')?.classList.remove('lifted')
  if (!cancel && d.plan && d.box) act({ type: 'drop', id: d.id, split: d.split, box: d.box, x: d.x, y: d.y, rot: d.rot })
  glide(from)
}

/** Shift-click sends between home and the pack (on a run, between the pack and the belt); ctrl or cmd sends the whole kind. */
function quickSend(id: number, all: boolean) {
  const at = where(s, id)
  if (!at) return
  const to: Box = s.run ? (at.box === 'pack' ? 'belt' : 'pack') : at.box === 'pack' || at.box === 'belt' ? 'stores' : 'pack'
  const from = rects()
  const ev = act({ type: 'send', id, to, all })
  if (ev.some(e => e.kind === 'refused')) shake(id)
  else glide(from)
}

export function bindItems() {
  addEventListener('pointerdown', e => {
    if (e.button !== 0 || drag) return
    const el = (e.target as HTMLElement).closest<HTMLElement>('.box .item[data-id]')
    if (!el || el.closest('.away')) return
    const r = el.getBoundingClientRect()
    press = { id: +el.dataset.id!, x: e.clientX, y: e.clientY, alt: e.altKey, gx: e.clientX - r.left + 2, gy: e.clientY - r.top + 2 }
    e.preventDefault()
  })
  addEventListener('pointermove', e => {
    last = e
    if (press && !drag && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 4) begin()
    if (drag) move(e)
  })
  addEventListener('pointerup', e => {
    if (drag) return finish()
    if (press && e.shiftKey) quickSend(press.id, e.metaKey || e.ctrlKey)
    press = null
  })
  addEventListener('contextmenu', e => { if (drag) { e.preventDefault(); turn() } })
  addEventListener('keydown', e => {
    if (drag && (e.key === 'r' || e.key === 'R')) turn()
    if (drag && e.key === 'Escape') finish(true)
  })
}

export const dragging = () => !!drag
