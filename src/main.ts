import './style.css'
import { applyDrop, boxOf, cellsOf, dims, find, H, KINDS, lift, planDrop, putBack, remove, settle, spawn, start, W, type Held, type Item, type Plan, type State } from './world.ts'

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
  const squares = cells.map(([x, y]) => `<rect x="${x + 0.1}" y="${y + 0.1}" width="0.8" height="0.8" rx="0.08"/>`).join('')
  const hit = cells.map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1"/>`).join('')
  // the outline of the footprint, shown when the item is selected: an edge wherever a square has no neighbour
  const has = new Set(cells.map(([x, y]) => `${x},${y}`))
  let edge = ''
  for (const [x, y] of cells) {
    if (!has.has(`${x},${y - 1}`)) edge += `M${x} ${y}h1`
    if (!has.has(`${x},${y + 1}`)) edge += `M${x} ${y + 1}h1`
    if (!has.has(`${x - 1},${y}`)) edge += `M${x} ${y}v1`
    if (!has.has(`${x + 1},${y}`)) edge += `M${x + 1} ${y}v1`
  } // whole cells, so there are no dead gaps between the squares
  return `<div class="item ${selected.has(it.id) ? 'sel' : ''}" data-id="${it.id}" style="--x:${it.x};--y:${it.y};--w:${d.w};--h:${d.h};--c:${k.color}">
    <svg viewBox="0 0 ${d.w} ${d.h}"><g class="sq">${squares}</g><path class="selline" d="${edge}"/><g class="hit">${hit}</g></svg>
    <div class="art" style="--kw:${k.w};--kh:${k.h};--r:${it.rot ? 90 : 0}deg">${SPRITE[it.kind] ?? ''}</div></div>`
}

/** A row of buttons to put any kind of thing on the field, for trying new items out. */
function trayHtml() {
  return `<div class="tray"><span>put on the field</span>${Object.entries(KINDS).map(([id, k]) => `<button data-spawn="${id}" style="--c:${k.color}" title="${(k.desc ?? '').replace(/"/g, '&quot;')}"><i></i>${k.name}</button>`).join('')}<span class="grow"></span><button data-strict class="${strict ? 'on' : ''}" title="Strict: things only go where they fit and nothing else moves. Hold Shift while dragging to do the opposite for one move.">strict mode: ${strict ? 'on' : 'off'}</button><button data-clear>clear the field</button><button data-reset>start over</button></div>`
}

/** Redraw everything; things that moved glide from where they were. */
function render(from = rects()) {
  app.innerHTML = `<div class="field" style="--w:${W};--h:${H}"><div class="grid" data-grid>${s.items.map(itemHtml).join('')}</div></div>${trayHtml()}`
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

interface Drag { held: Held; el: HTMLElement; gx: number; gy: number; rot: boolean; plan: Plan | null; key: string }
let press: { id: number; x: number; y: number; gx: number; gy: number; toggle: boolean; wasGroup: boolean } | null = null
let drag: Drag | null = null
let last: PointerEvent | null = null
let marquee: { x0: number; y0: number; add: boolean; el: HTMLElement } | null = null

const field = () => app.querySelector<HTMLElement>('.field')
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

function sweep(e: PointerEvent) {
  const q = marquee!
  const r = gridRect()
  const x = Math.max(0, Math.min(r.width, e.clientX - r.left)), y = Math.max(0, Math.min(r.height, e.clientY - r.top))
  Object.assign(q.el.style, { left: `${Math.min(q.x0, x)}px`, top: `${Math.min(q.y0, y)}px`, width: `${Math.abs(x - q.x0)}px`, height: `${Math.abs(y - q.y0)}px` })
}
function endSweep() {
  const q = marquee!
  marquee = null
  const r = gridRect()
  const b = q.el.getBoundingClientRect()
  q.el.remove()
  if (b.width < 3 && b.height < 3) return
  const x0 = Math.floor((b.left - r.left) / cell), x1 = Math.ceil((b.right - r.left) / cell), y0 = Math.floor((b.top - r.top) / cell), y1 = Math.ceil((b.bottom - r.top) / cell)
  const hit = s.items.filter(it => { const o = boxOf(it); return cellsOf(it).some(([cx, cy]) => o.x + cx >= x0 && o.x + cx < x1 && o.y + cy >= y0 && o.y + cy < y1) }).map(it => it.id)
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
  drag = { held, el, gx: press!.gx, gy: press!.gy, rot: held.item.rot, plan: null, key: '' }
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

function turn() {
  const d = drag!
  if (d.held.items.length > 1) return // a group keeps its arrangement
  const k = KINDS[d.held.item.kind]
  if (k.w === k.h && !k.cells) return
  d.rot = !d.rot;
  [d.gx, d.gy] = [d.gy, d.gx]
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
  const key = `${x}:${y}:${d.rot}:${strictNow()}`
  if (key === d.key) return
  d.key = key
  d.plan = planDrop(s, d.held, x, y, d.rot, strictNow())
  paintGhosts(x, y)
  const over = e.clientX > r.left - 40 && e.clientX < r.right + 40 && e.clientY > r.top - 40 && e.clientY < r.bottom + 40
  const f = field()
  f?.classList.toggle('can', over && !!d.plan)
  f?.classList.toggle('cant', over && !d.plan)
}

function clearGhosts() {
  for (const g of app.querySelectorAll('.ghost')) g.remove()
  for (const el of app.querySelectorAll('.shoved')) el.classList.remove('shoved')
}

function ghost(x: number, y: number, w: number, h: number, cls: string, cells: [number, number][] | null) {
  const tiles = cells ? cells.map(([cx, cy]) => `<u class="gc" style="--cx:${cx};--cy:${cy}"></u>`).join('') : ''
  app.querySelector('.grid')!.insertAdjacentHTML('beforeend', `<div class="ghost ${cls} ${cells ? 'shaped' : ''}" style="--x:${x};--y:${y};--w:${w};--h:${h}">${tiles}</div>`)
}

/** The item's squares if it is not a plain rectangle, for the ghost to copy. */
const shaped = (it: Item) => { const b = boxOf(it); return b.cells ? cellsOf(it) : null }

function paintGhosts(x: number, y: number) {
  clearGhosts()
  const d = drag!
  const p = d.plan
  if (!p) {
    // refused: outline where each thing would go, in red
    const a = d.held.item
    for (const it of d.held.items) {
      const dd = dims({ ...it, rot: it === a ? d.rot : it.rot })
      const rx = it === a ? x : x + (it.x - a.x), ry = it === a ? y : y + (it.y - a.y)
      ghost(Math.max(0, Math.min(W - dd.w, rx)), Math.max(0, Math.min(H - dd.h, ry)), dd.w, dd.h, 'bad', shaped({ ...it, rot: it === a ? d.rot : it.rot }))
    }
    return
  }
  const dd = dims({ ...d.held.item, rot: p.rot })
  ghost(p.x, p.y, dd.w, dd.h, 'land', shaped({ ...d.held.item, rot: p.rot }))
  for (const mv of p.moves) {
    const o = find(s, mv.id)!
    const md = dims({ ...o, rot: mv.rot })
    ghost(mv.x, mv.y, md.w, md.h, mv.group ? 'land' : 'shove', shaped({ ...o, rot: mv.rot }))
    if (!mv.group) app.querySelector(`.item[data-id="${mv.id}"]`)?.classList.add('shoved')
  }
}

/** Let go: `drop` puts it where the ghost says, otherwise it goes back. */
function finish(drop: boolean) {
  const d = drag!
  drag = null
  document.body.classList.remove('dragging')
  const f = field()
  f?.classList.remove('can', 'cant')
  const from = rects()
  d.el.querySelectorAll<HTMLElement>('.item').forEach((el, i) => from.set(d.held.items[i].id, el.getBoundingClientRect()))
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
