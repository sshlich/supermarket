import './style.css'
import { applyDrop, boxOf, cellsOf, dims, find, H, interaction, KINDS, lift, planDrop, putBack, quarter, remove, settle, spawn, start, targetsFor, W, type Held, type Item, type Plan, type State } from './world.ts'

// One SVG per kind in src/sprites/, drawn in the item's own footprint (see the editor: /editor.html).
const files = import.meta.glob<string>('./sprites/*.svg', { query: '?raw', import: 'default', eager: true })
const SPRITE: Record<string, string> = Object.fromEntries(Object.entries(files).map(([p, svg]) => [p.slice('./sprites/'.length, -'.svg'.length), svg]))

// When an item's data or a sprite changes, the game reloads itself; the sprite editor, which shares the files, is left alone.
if (import.meta.hot) {
  import.meta.hot.accept('./world.ts', () => location.reload())
  import.meta.hot.accept(() => location.reload()) // a sprite was saved or added (they are imported here); only this page reloads
}

const SAVE = 'field-v3'
let s: State = load() ?? start()
let cell = 28
let selected = new Set<number>() // what is picked, to be moved or removed together
let strict = ((): boolean => { try { return localStorage.getItem('field-strict') === '1' } catch { return false } })()
let shiftHeld = false // held while dragging: does the opposite of the strict setting for this one move
const strictNow = () => strict !== shiftHeld

const app = document.getElementById('app')!

function load(): State | null {
  try { const v = JSON.parse(localStorage.getItem(SAVE) ?? 'null'); return v?.items ? settle(v) : null } catch { return null }
}
const save = () => { try { localStorage.setItem(SAVE, JSON.stringify(s)) } catch { /* private window */ } }

function fit() {
  cell = Math.floor(Math.max(16, Math.min(40, (innerWidth - 48) / W, (innerHeight - 150) / H)))
  document.documentElement.style.setProperty('--cell', `${cell}px`)
}

// ---------------------------------------------------------------- drawing

/** One item: neutral rounded squares over its cells, its sprite in the item's colour on top. */
function itemHtml(it: Item) {
  const k = KINDS[it.kind]
  const d = dims(it)
  const cells = cellsOf(it) // only the squares it takes, however odd the shape
  const squares = cells.map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1"/>`).join('') // the imprint: the field's own squares, lit lighter
  const hit = cells.map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1"/>`).join('')
  return `<div class="item ${selected.has(it.id) ? 'sel' : ''}" data-id="${it.id}" style="--x:${it.x};--y:${it.y};--w:${d.w};--h:${d.h};--c:${k.color}">
    <svg viewBox="0 0 ${d.w} ${d.h}"><g class="sq">${squares}</g><g class="hit">${hit}</g></svg>
    <div class="art" style="--kw:${k.w};--kh:${k.h};--r:${quarter(it.rot) * 90}deg">${SPRITE[it.kind] ?? ''}</div></div>`
}

/** The edge of a set of squares: a line wherever a square has no neighbour. Traces irregular shapes exactly. */
function outline(cells: [number, number][]) {
  const has = new Set(cells.map(([x, y]) => `${x},${y}`))
  let d = ''
  for (const [x, y] of cells) {
    if (!has.has(`${x},${y - 1}`)) d += `M${x} ${y}h1`
    if (!has.has(`${x},${y + 1}`)) d += `M${x} ${y + 1}h1`
    if (!has.has(`${x - 1},${y}`)) d += `M${x} ${y}v1`
    if (!has.has(`${x + 1},${y}`)) d += `M${x + 1} ${y}v1`
  }
  return d
}
/** Where an item's squares are on the field. */
const absCells = (it: Item): [number, number][] => cellsOf(it).map(([cx, cy]) => [it.x + cx, it.y + cy])

/** A row of buttons to put any kind of thing on the field, for trying new items out. */
function trayHtml() {
  return `<div class="tray"><span>put on the field</span>${Object.entries(KINDS).map(([id, k]) => `<button data-spawn="${id}" style="--c:${k.color}" title="${(k.desc ?? '').replace(/"/g, '&quot;')}"><i></i>${k.name}</button>`).join('')}<span class="grow"></span><button data-strict class="${strict ? 'on' : ''}" title="Strict: things only go where they fit and nothing else moves. Hold Shift while dragging to do the opposite for one move.">strict mode: ${strict ? 'on' : 'off'}</button><button data-clear>clear the field</button><button data-reset>start over</button></div>`
}

/** Redraw everything; things that moved glide from where they were. */
function render(from = rects()) {
  document.querySelector('.hl')?.remove() // lights belong to a drag; none may outlive it
  app.innerHTML = `<div class="field" style="--w:${W};--h:${H}"><div class="grid" data-grid>${s.items.map(itemHtml).join('')}</div></div>${trayHtml()}<div class="toast" data-toast></div>`
  if (document.hidden) return // background tabs freeze animations on their first frame
  for (const el of app.querySelectorAll<HTMLElement>('.item[data-id]')) {
    const was = from.get(+el.dataset.id!)
    if (!was) continue
    const now = el.getBoundingClientRect()
    const dx = was.left - now.left
    const dy = was.top - now.top
    if (Math.abs(dx) + Math.abs(dy) < 1) continue
    el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 170, easing: 'cubic-bezier(.2, .8, .3, 1)' })
  }
}
const rects = () => new Map([...app.querySelectorAll<HTMLElement>('.item[data-id]')].map(el => [+el.dataset.id!, el.getBoundingClientRect()]))

function changed(from?: Map<number, DOMRect>) {
  selected = new Set([...selected].filter(id => find(s, id))) // things that are gone are no longer picked
  save()
  render(from)
}

// ---------------------------------------------------------------- handling

interface Drag { held: Held; el: HTMLElement; gx: number; gy: number; rot: number; plan: Plan | null; key: string; targets: Item[]; use: Item | null }
let press: { id: number; x: number; y: number; gx: number; gy: number; toggle: boolean; wasGroup: boolean } | null = null
let drag: Drag | null = null
let last: PointerEvent | null = null
let marquee: { x0: number; y0: number; add: boolean; el: HTMLElement } | null = null

const gridRect = () => app.querySelector('.grid')!.getBoundingClientRect()

/** Show what is selected without redrawing everything. */
function paintSelection() {
  for (const el of app.querySelectorAll<HTMLElement>('.item[data-id]')) el.classList.toggle('sel', selected.has(+el.dataset.id!))
}
const pick = (ids: Iterable<number>) => { selected = new Set(ids); paintSelection() }

app.addEventListener('pointerdown', e => {
  if (e.button !== 0 || drag) return
  const t = e.target as HTMLElement
  const el = t.closest<HTMLElement>('.item[data-id]')
  const r0 = gridRect()
  if (!el) {
    if (!t.closest('.grid')) return
    // empty ground: sweep out a rectangle to pick everything it touches
    const add = e.shiftKey || e.metaKey || e.ctrlKey
    if (!add) pick([])
    const box = document.createElement('div')
    box.className = 'marquee'
    app.querySelector('.grid')!.appendChild(box)
    marquee = { x0: e.clientX - r0.left, y0: e.clientY - r0.top, add, el: box }
    document.body.classList.add('sweeping')
    e.preventDefault()
    return
  }
  const id = +el.dataset.id!
  const r = el.getBoundingClientRect()
  const cmd = e.metaKey || e.ctrlKey
  if (cmd) { // ctrl / cmd-click adds or removes it from the selection; it can still be dragged if it is now in
    const next = new Set(selected)
    if (next.has(id)) { next.delete(id); pick(next); e.preventDefault(); return }
    next.add(id); pick(next)
  } else if (!selected.has(id)) pick([id])
  // Grab point measured from the item's footprint.
  press = { id, x: e.clientX, y: e.clientY, gx: e.clientX - r.left, gy: e.clientY - r.top, toggle: e.shiftKey && !cmd, wasGroup: selected.size > 1 }
  e.preventDefault()
})

addEventListener('pointermove', e => {
  last = e
  if (marquee) return sweep(e)
  if (press && !drag && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 4) begin()
  if (drag) move(e)
})

addEventListener('pointerup', () => {
  if (marquee) endSweep()
  else if (drag) finish(true)
  else if (press) {
    // a click, not a drag: shift-click toggles, a plain click on one of a group narrows it to that one
    if (press.toggle) { const n = new Set(selected); if (n.has(press.id) && n.size > 1) n.delete(press.id); pick(n) }
    else if (press.wasGroup) pick([press.id])
  }
  press = null
})

/** Which things the sweep rectangle touches right now. */
function sweepHits(): number[] {
  const q = marquee!
  const r = gridRect()
  const b = q.el.getBoundingClientRect()
  if (b.width < 3 && b.height < 3) return []
  const x0 = Math.floor((b.left - r.left) / cell), x1 = Math.ceil((b.right - r.left) / cell), y0 = Math.floor((b.top - r.top) / cell), y1 = Math.ceil((b.bottom - r.top) / cell)
  return s.items.filter(it => cellsOf(it).some(([cx, cy]) => it.x + cx >= x0 && it.x + cx < x1 && it.y + cy >= y0 && it.y + cy < y1)).map(it => it.id)
}

function sweep(e: PointerEvent) {
  const q = marquee!
  const r = gridRect()
  const x = Math.max(0, Math.min(r.width, e.clientX - r.left)), y = Math.max(0, Math.min(r.height, e.clientY - r.top))
  Object.assign(q.el.style, { left: `${Math.min(q.x0, x)}px`, top: `${Math.min(q.y0, y)}px`, width: `${Math.abs(x - q.x0)}px`, height: `${Math.abs(y - q.y0)}px` })
  // show what the rectangle would pick as you sweep, and nothing else (hovering is off while sweeping)
  const hit = new Set(sweepHits())
  for (const el of app.querySelectorAll<HTMLElement>('.item[data-id]')) el.classList.toggle('pre', hit.has(+el.dataset.id!))
}
function endSweep() {
  const q = marquee!
  const hit = sweepHits()
  marquee = null
  q.el.remove()
  document.body.classList.remove('sweeping')
  for (const el of app.querySelectorAll('.item.pre')) el.classList.remove('pre')
  pick(q.add ? [...selected, ...hit] : hit)
}

addEventListener('contextmenu', e => {
  if (!drag) return
  e.preventDefault()
  turn()
})

addEventListener('keydown', e => {
  if (e.key === 'Shift' && !shiftHeld) { shiftHeld = true; if (drag) { drag.key = ''; if (last) move(last) } }
  const typing = (e.target as HTMLElement).matches?.('input, textarea')
  if (typing) return
  if (drag) {
    if (e.key === 'r' || e.key === 'R') turn()
    else if (e.key === 'q' || e.key === 'Q') turn(true)
    else if (e.key === 'Escape') finish(false)
    return
  }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') { e.preventDefault(); pick(s.items.map(o => o.id)) }
  else if (e.key === 'Escape') pick([])
  else if ((e.key === 'Delete' || e.key === 'Backspace') && selected.size) { e.preventDefault(); remove(s, [...selected]); selected = new Set(); changed(new Map()) }
  else if (e.key.toLowerCase() === 's' && !e.metaKey && !e.ctrlKey) toggleStrict()
})
addEventListener('keyup', e => {
  if (e.key === 'Shift' && shiftHeld) { shiftHeld = false; if (drag) { drag.key = ''; if (last) move(last) } }
})
addEventListener('blur', () => { shiftHeld = false })

function toggleStrict() {
  strict = !strict
  try { localStorage.setItem('field-strict', strict ? '1' : '0') } catch { /* private window */ }
  const b = app.querySelector('[data-strict]')
  if (b) { b.classList.toggle('on', strict); b.textContent = `strict mode: ${strict ? 'on' : 'off'}` }
  if (drag) { drag.key = ''; if (last) move(last) }
}

function begin() {
  const held = lift(s, press!.id, [...selected])
  if (!held) { press = null; return }
  const el = document.body.appendChild(document.createElement('div'))
  el.className = 'floating'
  drag = { held, el, gx: press!.gx, gy: press!.gy, rot: held.item.rot, plan: null, key: '', targets: targetsFor(s, held.items), use: null }
  press = null
  for (const it of held.items) app.querySelector(`.item[data-id="${it.id}"]`)?.classList.add('lifted')
  paintFloating()
  document.body.classList.add('dragging')
}

/** What is in hand, drawn where it sits relative to the one you hold. */
function paintFloating() {
  const d = drag!
  const a = d.held.item
  d.el.innerHTML = d.held.items.map(it => itemHtml({ ...it, rot: it === a ? d.rot : it.rot, x: it.x - a.x, y: it.y - a.y })).join('')
}

/** Turn what is in hand a quarter (clockwise, or back): four ways round, so upside down is two turns. */
function turn(back = false) {
  const d = drag!
  if (d.held.items.length > 1) return // a group keeps its arrangement
  const before = dims({ ...d.held.item, rot: d.rot })
  d.rot = quarter(d.rot + (back ? 3 : 1))
  // it turns about its own centre, which stays where it was on screen (the pointer keeps its place on the screen, not on the item)
  const after = dims({ ...d.held.item, rot: d.rot })
  const w = before.w * cell, h = before.h * cell
  d.gx += (after.w * cell - w) / 2
  d.gy += (after.h * cell - h) / 2
  d.key = ''
  paintFloating()
  if (last) move(last)
}

function move(e: PointerEvent) {
  const d = drag!
  d.el.style.transform = `translate(${e.clientX - d.gx}px, ${e.clientY - d.gy}px)`
  const r = gridRect()
  const x = Math.round((e.clientX - d.gx - r.left) / cell)
  const y = Math.round((e.clientY - d.gy - r.top) / cell)
  const under = d.targets.find(t => absCells(t).some(([cx, cy]) => cx === Math.floor((e.clientX - r.left) / cell) && cy === Math.floor((e.clientY - r.top) / cell))) ?? null
  const key = `${x}:${y}:${d.rot}:${strictNow()}:${under?.id ?? ''}`
  if (key === d.key) return
  d.key = key
  d.use = under
  d.plan = planDrop(s, d.held, x, y, d.rot, strictNow())
  paintGhosts(x, y)
}

function clearGhosts() {
  document.querySelector('.hl')?.remove()
  for (const el of app.querySelectorAll('.shoved')) el.classList.remove('shoved')
}

type Light = { cells: [number, number][]; kind: 'ok' | 'bad' | 'use' | 'usenow' | 'land' | 'shove' }
/** Light up squares: each thing is one filled shape (a single path, so an irregular footprint is one piece, not a heap of squares). */
function light(list: Light[]) {
  const shapes = list.map(l => `<path class="hl-${l.kind}" d="${l.cells.map(([x, y]) => `M${x} ${y}h1v1h-1z`).join('')}"/><path class="hl-edge hl-${l.kind}" d="${outline(l.cells)}"/>`).join('')
  // fixed over the field and above the thing in hand, so the tint shows through whatever is being held
  const g = gridRect()
  document.body.insertAdjacentHTML('beforeend', `<svg class="hl" viewBox="0 0 ${W} ${H}" style="left:${g.left}px;top:${g.top}px;width:${g.width}px;height:${g.height}px">${shapes}</svg>`)
}

/**
 * What to show while dragging. Anything the held thing can be used on gets blue squares (bright under the pointer).
 * In strict mode the squares it would take go green if they are all free and red if not. In the relaxed mode there is no
 * such light: just a plain outline of where it lands (and dashed outlines for what gives way), and red only if there is
 * truly no way to place it.
 */
function paintGhosts(x: number, y: number) {
  clearGhosts()
  const d = drag!
  const p = d.plan
  const a = d.held.item
  const out: Light[] = d.targets.map(t => ({ cells: absCells(t), kind: d.use?.id === t.id ? 'usenow' : 'use' }))
  if (d.use) { light(out); return } // using it, not placing it
  if (!p) {
    // refused: red where each thing would go
    for (const it of d.held.items) {
      const rot = it === a ? d.rot : it.rot
      const dd = dims({ ...it, rot })
      const rx = it === a ? x : x + (it.x - a.x), ry = it === a ? y : y + (it.y - a.y)
      out.push({ cells: absCells({ ...it, rot, x: Math.max(0, Math.min(W - dd.w, rx)), y: Math.max(0, Math.min(H - dd.h, ry)) }), kind: 'bad' })
    }
    light(out)
    return
  }
  const landing = strictNow() ? 'ok' : 'land'
  out.push({ cells: absCells({ ...a, x: p.x, y: p.y, rot: p.rot }), kind: landing })
  for (const mv of p.moves) {
    const o = find(s, mv.id)!
    out.push({ cells: absCells({ ...o, x: mv.x, y: mv.y, rot: mv.rot }), kind: mv.group ? landing : 'shove' })
    if (!mv.group) app.querySelector(`.item[data-id="${mv.id}"]`)?.classList.add('shoved')
  }
  light(out)
}

/** A line under the field that says what just happened (uses have no effects yet, only this note). */
let toastTimer = 0
function toast(text: string) {
  const el = app.querySelector<HTMLElement>('[data-toast]')
  if (!el) return
  el.textContent = text
  el.classList.add('on')
  clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => el.classList.remove('on'), 2600)
}

/** Let go: `drop` puts it where the ghost says, otherwise it goes back. */
function finish(drop: boolean) {
  const d = drag!
  drag = null
  document.body.classList.remove('dragging')
  clearGhosts()
  const from = rects()
  d.el.querySelectorAll<HTMLElement>('.item').forEach((el, i) => from.set(d.held.items[i].id, el.getBoundingClientRect()))
  const use = drop && d.use ? interaction(d.held.item, d.use) : null
  if (use && d.use) { putBack(d.held); changed(from); toast(`${KINDS[d.held.item.kind].name} → ${KINDS[d.use.kind].name}: ${use.verb}  (uses have no effect yet)`); d.el.remove(); return }
  if (drop && d.plan) applyDrop(s, d.held, d.plan)
  else putBack(d.held)
  d.el.remove()
  changed(from)
}

addEventListener('resize', () => { fit(); render(new Map()) })
fit()
render(new Map())

app.addEventListener('click', e => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('button')
  if (!b) return
  if (b.dataset.spawn) { const it = spawn(s, b.dataset.spawn); if (it) { changed(); app.querySelector(`.item[data-id="${it.id}"]`)?.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], { duration: 180 }) } else b.animate([{ transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'none' }], { duration: 200 }) }
  else if ('strict' in b.dataset) toggleStrict()
  else if ('clear' in b.dataset) { s.items = []; selected = new Set(); changed(new Map()) }
  else if ('reset' in b.dataset) { s = start(); selected = new Set(); changed(new Map()) }
})
