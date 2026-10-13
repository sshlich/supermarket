import './style.css'
import { applyDrop, cellsOf, dims, find, H, hostsFor, inSpace, intoHost, isContainer, KINDS, lift, MAX_WINDOWS, planDrop, putBack, quarter, remove, sameSpace, settle, spaceKey, spaceOf, spawn, start, W, type Held, type Item, type Plan, type Space, type State, type Win } from './world.ts'

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
  // room for windows beside the field: about six squares each side
  cell = Math.floor(Math.max(14, Math.min(40, (innerWidth - 150) / (W + 12), (innerHeight - 150) / H)))
  document.documentElement.style.setProperty('--cell', `${cell}px`)
}
/** The tray wraps to more rows as kinds are added: after drawing, shrink the squares until all of it is on screen. */
function fitTray() {
  const tray = app.querySelector('.tray')
  while (tray && cell > 14 && tray.getBoundingClientRect().bottom > innerHeight - 4) {
    cell--
    document.documentElement.style.setProperty('--cell', `${cell}px`)
  }
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
  const kinds = Object.entries(KINDS)
  return `<div class="tray"><span>put on the field</span>${kinds.length ? '' : '<span class="none">no items yet: <a href="/editor.html">make one in the editor</a></span>'}${kinds.map(([id, k]) => `<button data-spawn="${id}" style="--c:${k.color}" title="${(k.desc ?? '').replace(/"/g, '&quot;')}"><i></i>${k.name}</button>`).join('')}<span class="grow"></span><button data-strict class="${strict ? 'on' : ''}" title="Strict: things only go where they fit and nothing else moves. Hold Shift while dragging to do the opposite for one move.">strict mode: ${strict ? 'on' : 'off'}</button><button data-clear>clear the field</button><button data-reset>start over</button></div>`
}

/** One open container: a window floating over the page, its insides a small grid for each of its slots. */
function winHtml(w: Win, z: number) {
  const it = find(s, w.id)!
  const k = KINDS[it.kind]
  const slots = (k.slots ?? []).map((sl, i) => {
    const note = [sl.name, sl.accepts?.length ? `${sl.accepts.join(', ')} only` : '', sl.rejects?.length ? `no ${sl.rejects.join(', ')}` : ''].filter(Boolean).join(' · ')
    return `<div class="slotbox">${note ? `<div class="slotnote">${note}</div>` : ''}<div class="grid" data-grid data-space="${it.id}:${i}" data-w="${sl.w}" data-h="${sl.h}" style="--w:${sl.w};--h:${sl.h}">${inSpace(s, { host: it.id, slot: i }).map(itemHtml).join('')}</div></div>`
  }).join('')
  return `<div class="win" data-win="${it.id}" style="left:${w.x}px;top:${w.y}px;z-index:${10 + z}"><div class="win-head" data-whead style="--c:${k.color}"><i></i><span>${k.name}</span><button data-wfold="${it.id}" title="Fold: keep just a tab along the top">–</button><button data-wclose="${it.id}" title="Close">✕</button></div>${slots}</div>`
}

/** The open windows where they were left, and the folded ones as tabs in the rack along the top edge. */
function windowsHtml() {
  const ws = s.windows ?? []
  const tabs = ws.filter(w => w.folded).map(w => { const k = KINDS[find(s, w.id)!.kind]; return `<button class="tab" data-wopen="${w.id}" style="--c:${k.color}" title="Unfold"><i></i>${k.name}</button>` }).join('')
  return ws.map((w, z) => (w.folded ? '' : winHtml(w, z))).join('') + (tabs ? `<div class="rack">${tabs}</div>` : '')
}

/** Keep every open window on screen (after a resize, or a window that opened near an edge): its header always stays reachable. */
function keepOnScreen() {
  for (const el of app.querySelectorAll<HTMLElement>('.win[data-win]')) {
    const w = winOf(+el.dataset.win!)
    if (!w) continue
    const r = el.getBoundingClientRect()
    const x = Math.round(Math.max(8, Math.min(innerWidth - r.width - 8, w.x))), y = Math.round(Math.max(8, Math.min(innerHeight - r.height - 8, w.y)))
    if (x === w.x && y === w.y) continue
    Object.assign(w, { x, y })
    Object.assign(el.style, { left: `${x}px`, top: `${y}px` })
  }
}
const winOf = (id: number) => s.windows?.find(w => w.id === id)

/** Bring a window to the front (the last one is on top), without redrawing. */
function raise(id: number) {
  const ws = s.windows ?? []
  const w = winOf(id)
  if (!w || ws[ws.length - 1] === w) return
  s.windows = [...ws.filter(o => o !== w), w]
  s.windows.forEach((o, z) => { const el = app.querySelector<HTMLElement>(`.win[data-win="${o.id}"]`); if (el) el.style.zIndex = String(10 + z) })
  save()
}

/** Open a container in a new window beside it (right of it, or left if there is no room), or bring its window back if it is open already. */
function openWindow(it: Item) {
  const ws = s.windows ?? (s.windows = [])
  const open = winOf(it.id)
  if (open) {
    open.folded = false
    s.windows = [...ws.filter(o => o !== open), open]
    changed(new Map())
    app.querySelector(`.win[data-win="${it.id}"]`)?.animate([{ transform: 'scale(1.04)', boxShadow: '0 0 0 3px #c49c68' }, { transform: 'none' }], { duration: 450 })
    return
  }
  if (ws.length >= MAX_WINDOWS) { toast(`${MAX_WINDOWS} containers are open: close one first`); return }
  const r = app.querySelector(`.item[data-id="${it.id}"]`)!.getBoundingClientRect()
  const slots = KINDS[it.kind].slots ?? []
  const ww = Math.max(...slots.map(sl => sl.w)) * cell + 20 // a guess at its size; keepOnScreen corrects it once drawn
  ws.push({ id: it.id, x: Math.round(r.right + 12 + ww < innerWidth ? r.right + 12 : r.left - 12 - ww), y: Math.round(r.top) })
  pick([])
  changed()
  keepOnScreen()
  save()
}

/** Redraw everything; things that moved glide from where they were. */
function render(from = rects()) {
  document.querySelectorAll('.hl').forEach(el => el.remove()) // lights belong to a drag; none may outlive it
  app.innerHTML = `<div class="stage"><div class="center"><div class="field"><div class="grid" data-grid data-space="field" data-w="${W}" data-h="${H}" style="--w:${W};--h:${H}">${inSpace(s, null).map(itemHtml).join('')}</div></div>${trayHtml()}<div class="toast" data-toast></div></div></div>${windowsHtml()}`
  if (hoverId !== null) showTip()
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

interface Drag { held: Held; el: HTMLElement; gx: number; gy: number; rot: number; plan: Plan | null; key: string; hosts: Item[]; full: Item[]; blocked: Item | null; into: Item | null; space: Space; over: boolean }
let press: { id: number; x: number; y: number; gx: number; gy: number; toggle: boolean; wasGroup: boolean } | null = null
let drag: Drag | null = null
let last: PointerEvent | null = null
let marquee: { x0: number; y0: number; add: boolean; el: HTMLElement; grid: HTMLElement; space: Space } | null = null
let winDrag: { win: Win; el: HTMLElement; dx: number; dy: number } | null = null

const spaceAt = (g: HTMLElement): Space => { const k = g.dataset.space!; if (k === 'field') return null; const [host, slot] = k.split(':').map(Number); return { host, slot } }
const gridOf = (sp: Space) => app.querySelector<HTMLElement>(`.grid[data-space="${spaceKey(sp)}"]`)
/** The grid under a screen point, if any: only the topmost thing there counts, so a window covers the field (or another window) behind it. */
const gridUnder = (x: number, y: number) => document.elementFromPoint(x, y)?.closest<HTMLElement>('.grid[data-space]') ?? null

/** Show what is selected without redrawing everything. */
function paintSelection() {
  for (const el of app.querySelectorAll<HTMLElement>('.item[data-id]')) el.classList.toggle('sel', selected.has(+el.dataset.id!))
}
const pick = (ids: Iterable<number>) => { selected = new Set(ids); paintSelection() }

app.addEventListener('pointerdown', e => {
  if (e.button !== 0 || drag) return
  const t = e.target as HTMLElement
  const el = t.closest<HTMLElement>('.item[data-id]')
  const winEl = t.closest<HTMLElement>('.win[data-win]')
  if (winEl) raise(+winEl.dataset.win!) // touching a window brings it to the front
  const w = winEl && winOf(+winEl.dataset.win!)
  if (w && t.closest('[data-whead]') && !t.closest('button')) { // grab a window by its header to move it anywhere
    winDrag = { win: w, el: winEl, dx: e.clientX - w.x, dy: e.clientY - w.y }
    winEl.classList.add('grabbed')
    document.body.classList.add('dragging')
    hideTip()
    e.preventDefault()
    return
  }
  const grid = t.closest<HTMLElement>('.grid[data-space]')
  if (!el) {
    if (!grid) return
    const r0 = grid.getBoundingClientRect()
    // empty ground: sweep out a rectangle to pick everything it touches
    const add = e.shiftKey || e.metaKey || e.ctrlKey
    if (!add) pick([])
    const box = document.createElement('div')
    box.className = 'marquee'
    grid.appendChild(box)
    marquee = { x0: e.clientX - r0.left, y0: e.clientY - r0.top, add, el: box, grid, space: spaceAt(grid) }
    hideTip()
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
  if (winDrag) return moveWindow(e)
  if (press && !drag && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 4) begin()
  if (drag) move(e)
})

addEventListener('pointerup', () => {
  if (marquee) endSweep()
  else if (winDrag) endWindowDrag()
  else if (drag) finish(true)
  else if (press) {
    // a click, not a drag: shift-click toggles, a plain click on one of a group narrows it to that one
    if (press.toggle) { const n = new Set(selected); if (n.has(press.id) && n.size > 1) n.delete(press.id); pick(n) }
    else if (press.wasGroup) pick([press.id])
  }
  press = null
})

/** A window follows the pointer by its header; part of it always stays on screen, so it can be grabbed again. */
function moveWindow(e: PointerEvent) {
  const d = winDrag!
  const r = d.el.getBoundingClientRect()
  d.win.x = Math.round(Math.max(60 - r.width, Math.min(innerWidth - 60, e.clientX - d.dx)))
  d.win.y = Math.round(Math.max(0, Math.min(innerHeight - 30, e.clientY - d.dy)))
  Object.assign(d.el.style, { left: `${d.win.x}px`, top: `${d.win.y}px` })
}
function endWindowDrag() {
  winDrag!.el.classList.remove('grabbed')
  winDrag = null
  document.body.classList.remove('dragging')
  save()
}

/** Which things the sweep rectangle touches right now. */
function sweepHits(): number[] {
  const q = marquee!
  const r = q.grid.getBoundingClientRect()
  const b = q.el.getBoundingClientRect()
  if (b.width < 3 && b.height < 3) return []
  const x0 = Math.floor((b.left - r.left) / cell), x1 = Math.ceil((b.right - r.left) / cell), y0 = Math.floor((b.top - r.top) / cell), y1 = Math.ceil((b.bottom - r.top) / cell)
  return inSpace(s, q.space).filter(it => cellsOf(it).some(([cx, cy]) => it.x + cx >= x0 && it.x + cx < x1 && it.y + cy >= y0 && it.y + cy < y1)).map(it => it.id)
}

function sweep(e: PointerEvent) {
  const q = marquee!
  const r = q.grid.getBoundingClientRect()
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
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') { e.preventDefault(); pick(inSpace(s, null).map(o => o.id)) }
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
  drag = { held, el, gx: press!.gx, gy: press!.gy, rot: held.item.rot, plan: null, key: '', hosts: [], full: [], blocked: null, into: null, space: null, over: false }
  for (const h of hostsFor(s, held.items)) (intoHost(s, held, h.id) ? drag.hosts : drag.full).push(h)
  press = null
  for (const it of held.items) app.querySelector(`.item[data-id="${it.id}"]`)?.classList.add('lifted')
  paintFloating()
  hideTip()
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
  // a long item grabbed by its end would leave the pointer off it once turned: keep the pointer on the item
  d.gx = Math.max(cell / 2, Math.min(after.w * cell - cell / 2, d.gx))
  d.gy = Math.max(cell / 2, Math.min(after.h * cell - cell / 2, d.gy))
  d.key = ''
  paintFloating()
  if (last) move(last)
}

function move(e: PointerEvent) {
  const d = drag!
  d.el.style.transform = `translate(${e.clientX - d.gx}px, ${e.clientY - d.gy}px)`
  const g = gridUnder(e.clientX, e.clientY)
  if (!g) { // over no grid: nothing to drop on, it would go back
    if (d.key === 'none') return
    Object.assign(d, { key: 'none', plan: null, into: null, blocked: null, over: false })
    return paintGhosts(0, 0)
  }
  const sp = spaceAt(g)
  const r = g.getBoundingClientRect()
  const x = Math.round((e.clientX - d.gx - r.left) / cell)
  const y = Math.round((e.clientY - d.gy - r.top) / cell)
  const px = Math.floor((e.clientX - r.left) / cell), py = Math.floor((e.clientY - r.top) / cell)
  const on = (t: Item) => sameSpace(spaceOf(t), sp) && cellsOf(t).some(([cx, cy]) => t.x + cx === px && t.y + cy === py)
  const host = d.hosts.find(on) ?? null // dropped onto a container: goes inside it
  // over a container that would take it but is full: refused, and nothing gets shoved (one that never takes it is just another thing to rearrange)
  const blocked = host ? null : d.full.find(on) ?? null
  const key = `${spaceKey(sp)}:${x}:${y}:${d.rot}:${strictNow()}:${host?.id ?? ''}:${blocked?.id ?? ''}`
  if (key === d.key) return
  d.key = key
  d.over = true
  d.space = sp
  d.plan = host ? intoHost(s, d.held, host.id) : null
  d.into = d.plan ? host : null
  d.blocked = blocked
  if (!d.plan && !blocked) d.plan = planDrop(s, d.held, sp, x, y, d.rot, strictNow())
  paintGhosts(x, y)
}

function clearGhosts() {
  document.querySelectorAll('.hl').forEach(el => el.remove())
  for (const el of app.querySelectorAll('.shoved')) el.classList.remove('shoved')
}

type Light = { sp: Space; cells: [number, number][]; kind: 'ok' | 'bad' | 'use' | 'usenow' | 'land' | 'shove' }
/** Light up squares: each thing is one filled shape (a single path, so an irregular footprint is one piece, not a heap of squares). One overlay per grid. */
function light(list: Light[]) {
  const by = new Map<string, Light[]>()
  for (const l of list) by.set(spaceKey(l.sp), [...(by.get(spaceKey(l.sp)) ?? []), l])
  for (const [k, ls] of by) {
    const grid = app.querySelector<HTMLElement>(`.grid[data-space="${k}"]`)
    if (!grid) continue // that container is not open
    const shapes = ls.map(l => `<path class="hl-${l.kind}" d="${l.cells.map(([x, y]) => `M${x} ${y}h1v1h-1z`).join('')}"/><path class="hl-edge hl-${l.kind}" d="${outline(l.cells)}"/>`).join('')
    // fixed over the grid and above the thing in hand, so the tint shows through whatever is being held
    const g = grid.getBoundingClientRect()
    document.body.insertAdjacentHTML('beforeend', `<svg class="hl" viewBox="0 0 ${grid.dataset.w} ${grid.dataset.h}" style="left:${g.left}px;top:${g.top}px;width:${g.width}px;height:${g.height}px">${shapes}</svg>`)
  }
}

/**
 * What to show while dragging. Any container that would take the held thing gets blue squares (bright when dropping onto it
 * puts it inside). In strict mode the squares it would take
 * go green if they are all free and red if not. In the relaxed mode there is no such light: just a plain outline of where it
 * lands (and dashed outlines for what gives way), and red only if there is truly no way to place it.
 */
function paintGhosts(x: number, y: number) {
  clearGhosts()
  const d = drag!
  const p = d.plan
  const a = d.held.item
  const out: Light[] = d.hosts.map(h => ({ sp: spaceOf(h), cells: absCells(h), kind: d.into?.id === h.id ? 'usenow' : 'use' }))
  if (d.blocked) { light([...out, { sp: spaceOf(d.blocked), cells: absCells(d.blocked), kind: 'bad' }]); return }
  if (!p) {
    // refused: red where each thing would go
    if (d.over) {
      const { w: SW, h: SH } = { w: +(gridOf(d.space)?.dataset.w ?? W), h: +(gridOf(d.space)?.dataset.h ?? H) }
      for (const it of d.held.items) {
        const rot = it === a ? d.rot : it.rot
        const dd = dims({ ...it, rot })
        const rx = it === a ? x : x + (it.x - a.x), ry = it === a ? y : y + (it.y - a.y)
        out.push({ sp: d.space, cells: absCells({ ...it, rot, x: Math.max(0, Math.min(SW - dd.w, rx)), y: Math.max(0, Math.min(SH - dd.h, ry)) }), kind: 'bad' })
      }
    }
    light(out)
    return
  }
  const landing = strictNow() ? 'ok' : 'land'
  if (!d.into) out.push({ sp: p.space, cells: absCells({ ...a, x: p.x, y: p.y, rot: p.rot }), kind: landing })
  for (const mv of p.moves) {
    const o = find(s, mv.id)!
    if (d.into && !mv.group) continue
    out.push({ sp: p.space, cells: absCells({ ...o, x: mv.x, y: mv.y, rot: mv.rot }), kind: mv.group ? landing : 'shove' })
    if (!mv.group) app.querySelector(`.item[data-id="${mv.id}"]`)?.classList.add('shoved')
  }
  light(out)
}

/** A line under the field that says what just happened. */
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
  if (drop && d.plan) applyDrop(s, d.held, d.plan)
  else putBack(d.held)
  d.el.remove()
  changed(from)
}

// ---------------------------------------------------------------- tooltip

const tip = document.body.appendChild(document.createElement('div'))
tip.className = 'tip'
let hoverId: number | null = null
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

/** Name, [tags], the description, and what can be done with it. */
function tipHtml(it: Item) {
  const k = KINDS[it.kind]
  const rows = [`<b>${esc(k.name)}</b>`]
  if (k.tags?.length) rows.push(`<div class="tags">[${esc(k.tags.join(', '))}]</div>`)
  if (k.desc) rows.push(`<p>${esc(k.desc)}</p>`)
  if (isContainer(it.kind)) rows.push(`<div class="hint">double-click to open</div>`)
  return rows.join('')
}
/** Show the tooltip beside the hovered item (to its right, or its left if there is no room), kept on screen. */
function showTip() {
  const it = hoverId === null || drag || marquee || winDrag ? undefined : find(s, hoverId)
  const el = it && app.querySelector<HTMLElement>(`.item[data-id="${it.id}"]`)
  if (!it || !el) { hideTip(); return }
  tip.innerHTML = tipHtml(it)
  tip.classList.add('on')
  const r = el.getBoundingClientRect(), t = tip.getBoundingClientRect()
  const left = r.right + 10 + t.width < innerWidth - 8 ? r.right + 10 : Math.max(8, r.left - 10 - t.width)
  tip.style.transform = `translate(${left}px, ${Math.max(8, Math.min(innerHeight - t.height - 8, r.top))}px)`
}
function hideTip() { hoverId = null; tip.classList.remove('on') }
app.addEventListener('pointerover', e => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('.item[data-id]')
  if (!el || drag || marquee || winDrag || +el.dataset.id! === hoverId) return
  hoverId = +el.dataset.id!
  showTip()
})
app.addEventListener('pointerout', e => {
  const el = (e.target as HTMLElement).closest('.item[data-id]')
  if (el && (e.relatedTarget as HTMLElement | null)?.closest?.('.item[data-id]') !== el) hideTip()
})

addEventListener('resize', () => { fit(); render(new Map()); fitTray(); keepOnScreen() })
fit()
render(new Map())
fitTray()
keepOnScreen()

app.addEventListener('click', e => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('button')
  if (!b) return
  if (b.dataset.wclose) { s.windows = (s.windows ?? []).filter(w => w.id !== +b.dataset.wclose!); changed(new Map()); return }
  if (b.dataset.wfold) { const w = winOf(+b.dataset.wfold); if (w) w.folded = true; changed(new Map()); return }
  if (b.dataset.wopen) { const it = find(s, +b.dataset.wopen); if (it) openWindow(it); return }
  if (b.dataset.spawn) { const it = spawn(s, b.dataset.spawn); if (it) { changed(); app.querySelector(`.item[data-id="${it.id}"]`)?.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], { duration: 180 }) } else b.animate([{ transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'none' }], { duration: 200 }) }
  else if ('strict' in b.dataset) toggleStrict()
  else if ('clear' in b.dataset) { s.items = []; s.windows = []; selected = new Set(); changed(new Map()) }
  else if ('reset' in b.dataset) { s = start(); selected = new Set(); changed(new Map()) }
})

/** Double-click a container to open its insides in a window beside it. */
app.addEventListener('dblclick', e => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('.item[data-id]')
  const it = el && find(s, +el.dataset.id!)
  if (it && isContainer(it.kind)) openWindow(it)
})
