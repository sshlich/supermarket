import './style.css'
import './terminal.css'
import './papers.css'
import { advance, applyDrop, applyUse, cellsOf, clock, contents, dims, find, findAnywhere, H, hostsFor, inSpace, interaction, intoHost, isContainer, isHidden, KINDS, LIQUIDS, capacityOf, lift, machineStatus, propDefs, propOf, planDrop, putBack, quarter, remove, sameSpace, settle, spaceKey, spaceOf, spawn, start, targetsFor, W, type Held, type Item, type Paper, type Plan, type Space, type State } from './world.ts'
import { accept, archive, catchUp, decline, jobOf, mailById, markRead, slipFor, wanted, when } from './mail.ts'
import { listOf, SKINS, terminalHtml, unread, type Folder, type Skin, type TermUi } from './terminal.ts'
import { mailOf, paperKey, papersHtml, shows, type View } from './papers.ts'
import { fly, launch, padStatus, statsOf } from './fleet.ts'

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
catchUp(s)
fly(s)
let cell = 28
let selected = new Set<number>() // what is picked, to be moved or removed together
let strict = ((): boolean => { try { return localStorage.getItem('field-strict') === '1' } catch { return false } })()
let shiftHeld = false // held while dragging: does the opposite of the strict setting for this one move
const strictNow = () => strict !== shiftHeld

const app = document.getElementById('app')!

/** A saved game; only pinned papers keep their place in it. */
function load(): State | null {
  try {
    const v = JSON.parse(localStorage.getItem(SAVE) ?? 'null')
    if (!v?.items) return null
    const st = settle(v)
    st.papers = (st.papers ?? []).filter(p => p.pinned)
    return st
  } catch { return null }
}
const save = () => { try { localStorage.setItem(SAVE, JSON.stringify(s)) } catch { /* private window */ } }
const stored = (k: string) => { try { return localStorage.getItem(k) } catch { return null } }
const store = (k: string, v: string) => { try { localStorage.setItem(k, v) } catch { /* private window */ } }

/** Which view is up: the board, or the terminal (mail); and where the terminal was left. */
let view: View = stored('view') === 'terminal' ? 'terminal' : 'board'
const ui: TermUi = { folder: 'inbox', open: null, skin: (SKINS as readonly string[]).includes(stored('term-skin') ?? '') ? stored('term-skin') as Skin : 'tui' }

/** How wide a docked panel is, in squares: the widest inside any container can be. */
const PW = Math.max(6, ...Object.values(KINDS).flatMap(k => (k.slots ?? []).map(sl => sl.w)))

function fit() {
  cell = Math.floor(Math.max(14, Math.min(40, (innerWidth - 150) / (W + 2 * PW), (innerHeight - 150) / H)))
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
    ${it.liquid ? `<i class="gauge" style="--f:${it.liquid.ml / (capacityOf(it) || 1)};--lc:${LIQUIDS[it.liquid.type]?.color ?? '#888'}"></i>` : ''}${propMark(it)}
    <div class="art" style="--kw:${k.w};--kh:${k.h};--r:${quarter(it.rot) * 90}deg">${SPRITE[it.kind] ?? ''}</div></div>`
}

/** An item's first "strip" property, drawn on it: a strip up the right edge, or a "?" while nobody has read it. */
function propMark(it: Item) {
  const g = Object.entries(propDefs(it.kind)).find(([, d]) => d.show === 'strip')
  if (!g) return ''
  const [name, d] = g
  if (isHidden(it, name)) return '<i class="unknown">?</i>'
  return `<i class="gauge right" style="--f:${Math.min(1, propOf(it, name) / (d.max || 1))};--lc:${d.color ?? '#e6e3dc'}"></i>`
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
  return `<div class="tray"><span>put on the field</span>${Object.entries(KINDS).filter(([, k]) => !k.legacy).map(([id, k]) => `<button data-spawn="${id}" style="--c:${k.color}" title="${(k.desc ?? '').replace(/"/g, '&quot;')}"><i></i>${k.name}</button>`).join('')}<span class="grow"></span><button data-strict class="${strict ? 'on' : ''}" title="Strict: things only go where they fit and nothing else moves. Hold Shift while dragging to do the opposite for one move.">strict mode: ${strict ? 'on' : 'off'}</button><button data-clear>clear the field</button><button data-reset>start over</button></div>`
}

/** One docked panel: the insides of a container, a small grid for each of its slots. Empty docks are drawn faintly so they can be dropped on. */
function panelHtml(dock: number, id: number | null) {
  const it = id === null ? undefined : find(s, id)
  if (!it) return `<div class="panel empty" data-dock="${dock}"><span>empty dock</span></div>`
  const k = KINDS[it.kind]
  const slots = (k.slots ?? []).map((sl, i) => {
    const note = [sl.name, sl.accepts?.length ? `${sl.accepts.join(', ')} only` : '', sl.rejects?.length ? `no ${sl.rejects.join(', ')}` : ''].filter(Boolean).join(' · ')
    return `<div class="slotbox">${note ? `<div class="slotnote">${note}</div>` : ''}<div class="grid" data-grid data-space="${it.id}:${i}" data-w="${sl.w}" data-h="${sl.h}" style="--w:${sl.w};--h:${sl.h}">${inSpace(s, { host: it.id, slot: i }).map(itemHtml).join('')}</div></div>`
  }).join('')
  // a launch pad: a launch button, and a line under the head saying whether its drone can go (or when it is back)
  const pad = k.tags?.includes('pad')
  const launchBtn = pad ? `<button class="launch" data-launch="${it.id}" title="Send the drone on this pad with the job in its cargo">launch</button>` : ''
  const padNote = pad ? `<div class="padnote">${esc(padStatus(s, it))}</div>` : ''
  return `<div class="panel" data-dock="${dock}"><div class="panel-head" data-head style="--c:${k.color}"><i></i><span>${k.name}</span>${k.machine ? `<em>${machineStatus(s, it).join(' · ') || 'idle'}</em>` : ''}${launchBtn}<button data-close="${it.id}" title="Close">✕</button></div>${padNote}${slots}</div>`
}

const clockText = () => { const c = clock(s.tick); return `day ${c.day} · ${String(c.hour).padStart(2, '0')}:00${s.power ? ` · ${s.power} hu` : ''}` }

const ICON_MAIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 6l9 7 9-7"/></svg>'
const ICON_BOARD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>'

/** The corner: the way to the other view (with the unread count), and the clock. */
function cornerHtml() {
  const n = unread(s)
  const toggle = view === 'board'
    ? `<button class="viewbtn" data-view title="The terminal: mail (M)">${ICON_MAIL}<span>mail</span>${n ? `<b>${n}</b>` : ''}</button>`
    : `<button class="viewbtn" data-view title="Back to the board (M or Esc)">${ICON_BOARD}<span>board</span></button>`
  return `<div class="corner"><span class="credits" title="Credits: what the jobs have paid">${s.credits ?? 0} cr</span>${toggle}<button class="clock" data-tick title="Let an hour pass${s.power ? ` · machines have drawn ${s.power} hu of power` : ''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span>${clockText()}</span></button></div>`
}

/** Redraw everything; things that moved glide from where they were. */
function render(from = rects()) {
  document.querySelectorAll('.hl').forEach(el => el.remove()) // lights belong to a drag; none may outlive it
  paperLit = null
  s.papers = (s.papers ?? []).filter(p => p.item !== undefined ? !!findAnywhere(s, p.item) : !!mailById(s, p.mail!)) // a paper goes with its slip (which may be out in a drone)
  if (view === 'terminal') {
    hideTip()
    const scroll = app.querySelector('.term .list')?.scrollTop ?? 0
    app.innerHTML = terminalHtml(s, ui) + cornerHtml() + papersHtml(s, view)
    const list = app.querySelector('.term .list')
    if (list) list.scrollTop = scroll
    return
  }
  const p = s.panels ?? (s.panels = [null, null, null, null])
  app.innerHTML = `<div class="stage" style="--pw:${PW}"><div class="dock">${panelHtml(0, p[0])}${panelHtml(1, p[1])}</div><div class="center"><div class="field"><div class="grid" data-grid data-space="field" data-w="${W}" data-h="${H}" style="--w:${W};--h:${H}">${inSpace(s, null).map(itemHtml).join('')}</div></div>${trayHtml()}<div class="toast" data-toast></div></div><div class="dock">${panelHtml(2, p[2])}${panelHtml(3, p[3])}</div></div>${cornerHtml()}${papersHtml(s, view)}`
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
  const before = unread(s)
  catchUp(s) // mail arrives with the hours
  const flown = fly(s) // and drones get there and back
  const fresh = unread(s) - before
  save()
  render(from)
  const said = [...flown, fresh > 0 ? `${fresh} new message${fresh === 1 ? '' : 's'}` : ''].filter(Boolean)
  if (said.length) toast(said.join(' · '))
}

/** Go to the board or the terminal. The terminal opens on the newest message of its folder if none is open. */
function setView(v: View) {
  view = v
  store('view', v)
  if (v === 'terminal' && ui.open === null) { ui.open = listOf(s, ui.folder)[0]?.id ?? null; if (ui.open !== null) markRead(s, ui.open) }
  hideTip()
  save()
  render(new Map())
  if (v === 'board') fitTray()
}

/** Open a paper (a slip on the board, or a message pulled out of the terminal) on top of the others; one paper per thing. */
function openPaper(ref: { item?: number; mail?: number }) {
  const ps = s.papers ?? (s.papers = [])
  const key = paperKey(ref as Paper)
  let p = ps.find(q => paperKey(q) === key)
  if (p) { ps.splice(ps.indexOf(p), 1); p.folded = false; if (!p.pinned) p.view = view }
  else { const n = ps.filter(q => shows(q, view) && !q.folded).length % 8; p = { ...ref, x: Math.round(innerWidth / 2 - 150 + n * 26), y: Math.round(innerHeight * 0.16 + n * 26), view } }
  ps.push(p)
  save()
  render(new Map())
  app.querySelector(`.paper[data-paper="${key}"]`)?.animate([{ opacity: 0, translate: '0 -10px' }, { opacity: 1, translate: '0 0' }], { duration: 170, easing: 'ease-out' })
}
const paperAt = (key: string) => (s.papers ?? []).find(p => paperKey(p) === key)

// ---------------------------------------------------------------- handling

interface Drag { held: Held; el: HTMLElement; gx: number; gy: number; rot: number; plan: Plan | null; key: string; targets: Item[]; hosts: Item[]; full: Item[]; blocked: Item | null; use: Item | null; into: Item | null; space: Space; over: boolean }
let press: { id: number; x: number; y: number; gx: number; gy: number; toggle: boolean; wasGroup: boolean } | null = null
let drag: Drag | null = null
let last: PointerEvent | null = null
let marquee: { x0: number; y0: number; add: boolean; el: HTMLElement; grid: HTMLElement; space: Space } | null = null
let panelDrag: { dock: number; el: HTMLElement } | null = null
let paperDrag: { p: Paper; el: HTMLElement; dx: number; dy: number } | null = null
let paperLit: string | null = null // the paper whose wanted goods are lit on the board

const spaceAt = (g: HTMLElement): Space => { const k = g.dataset.space!; if (k === 'field') return null; const [host, slot] = k.split(':').map(Number); return { host, slot } }
const gridOf = (sp: Space) => app.querySelector<HTMLElement>(`.grid[data-space="${spaceKey(sp)}"]`)
/** The grid under a screen point, if any. */
const gridUnder = (x: number, y: number) => [...app.querySelectorAll<HTMLElement>('.grid[data-space]')].find(g => { const r = g.getBoundingClientRect(); return x >= r.left && x < r.right && y >= r.top && y < r.bottom }) ?? null
const dockUnder = (x: number, y: number) => [...app.querySelectorAll<HTMLElement>('.panel[data-dock]')].find(p => { const r = p.getBoundingClientRect(); return x >= r.left && x < r.right && y >= r.top && y < r.bottom }) ?? null

/** Show what is selected without redrawing everything. */
function paintSelection() {
  for (const el of app.querySelectorAll<HTMLElement>('.item[data-id]')) el.classList.toggle('sel', selected.has(+el.dataset.id!))
}
const pick = (ids: Iterable<number>) => { selected = new Set(ids); paintSelection() }

app.addEventListener('pointerdown', e => {
  if (e.button !== 0 || drag) return
  const t = e.target as HTMLElement
  const paper = t.closest<HTMLElement>('.paper[data-paper]')
  if (paper) { // grab a paper anywhere but its buttons to move it; it comes to the top
    const p = paperAt(paper.dataset.paper!)
    if (!p || t.closest('button')) return
    const ps = s.papers!
    ps.splice(ps.indexOf(p), 1)
    ps.push(p)
    paper.style.zIndex = String(100 + ps.length)
    paperDrag = { p, el: paper, dx: e.clientX - parseFloat(paper.style.left), dy: e.clientY - parseFloat(paper.style.top) }
    paper.classList.add('held')
    document.body.classList.add('dragging')
    hideTip()
    e.preventDefault()
    return
  }
  const el = t.closest<HTMLElement>('.item[data-id]')
  const head = t.closest<HTMLElement>('[data-head]')
  if (head && !t.closest('button')) { // grab a panel by its header to move it to another dock
    const panel = head.closest<HTMLElement>('.panel')!
    panelDrag = { dock: +panel.dataset.dock!, el: panel }
    panel.classList.add('grabbed')
    document.body.classList.add('dragging')
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
  if (paperDrag) { paperDrag.el.style.left = `${e.clientX - paperDrag.dx}px`; paperDrag.el.style.top = `${e.clientY - paperDrag.dy}px`; return }
  if (marquee) return sweep(e)
  if (panelDrag) { app.querySelectorAll('.panel.over').forEach(p => p.classList.remove('over')); const o = dockUnder(e.clientX, e.clientY); if (o && o !== panelDrag.el) o.classList.add('over'); return }
  if (press && !drag && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 4) begin()
  if (drag) move(e)
})

addEventListener('pointerup', () => {
  if (paperDrag) {
    const d = paperDrag
    paperDrag = null
    Object.assign(d.p, { x: Math.round(parseFloat(d.el.style.left)), y: Math.round(parseFloat(d.el.style.top)) })
    d.el.classList.remove('held')
    document.body.classList.remove('dragging')
    save()
  } else if (marquee) endSweep()
  else if (panelDrag) endPanelDrag()
  else if (drag) finish(true)
  else if (press) {
    // a click, not a drag: shift-click toggles, a plain click on one of a group narrows it to that one
    if (press.toggle) { const n = new Set(selected); if (n.has(press.id) && n.size > 1) n.delete(press.id); pick(n) }
    else if (press.wasGroup) pick([press.id])
  }
  press = null
})

/** Let go of a panel: it swaps docks with whatever dock it is over. */
function endPanelDrag() {
  const pd = panelDrag!
  panelDrag = null
  document.body.classList.remove('dragging')
  const o = dockUnder(last?.clientX ?? -1, last?.clientY ?? -1)
  if (o && o !== pd.el && s.panels) { const j = +o.dataset.dock!; [s.panels[pd.dock], s.panels[j]] = [s.panels[j], s.panels[pd.dock]]; changed(new Map()) }
  else { pd.el.classList.remove('grabbed'); app.querySelectorAll('.panel.over').forEach(p => p.classList.remove('over')) }
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
  if (e.key.toLowerCase() === 'm' && !e.metaKey && !e.ctrlKey && !e.altKey) { setView(view === 'board' ? 'terminal' : 'board'); return }
  if (view === 'terminal') { // the terminal's keys: up and down through the list, Esc back to the board
    if (e.key === 'Escape') setView('board')
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const list = listOf(s, ui.folder)
      const i = list.findIndex(m => m.id === ui.open)
      const next = list[Math.max(0, Math.min(list.length - 1, i < 0 ? 0 : i + (e.key === 'ArrowDown' ? 1 : -1)))]
      if (next) { ui.open = next.id; markRead(s, next.id); changed(new Map()); app.querySelector('.term .msg.on')?.scrollIntoView({ block: 'nearest' }) }
    }
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
  drag = { held, el, gx: press!.gx, gy: press!.gy, rot: held.item.rot, plan: null, key: '', targets: targetsFor(s, held.items), hosts: [], full: [], blocked: null, use: null, into: null, space: null, over: false }
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
    Object.assign(d, { key: 'none', plan: null, use: null, into: null, blocked: null, over: false })
    return paintGhosts(0, 0)
  }
  const sp = spaceAt(g)
  const r = g.getBoundingClientRect()
  const x = Math.round((e.clientX - d.gx - r.left) / cell)
  const y = Math.round((e.clientY - d.gy - r.top) / cell)
  const px = Math.floor((e.clientX - r.left) / cell), py = Math.floor((e.clientY - r.top) / cell)
  const on = (t: Item) => sameSpace(spaceOf(t), sp) && cellsOf(t).some(([cx, cy]) => t.x + cx === px && t.y + cy === py)
  const under = d.targets.find(on) ?? null
  const host = under ? null : d.hosts.find(on) ?? null // dropped onto a container: goes inside it
  // over a container that would take it but is full: refused, and nothing gets shoved (one that never takes it is just another thing to rearrange)
  const blocked = under || host ? null : d.full.find(on) ?? null
  const key = `${spaceKey(sp)}:${x}:${y}:${d.rot}:${strictNow()}:${under?.id ?? ''}:${host?.id ?? ''}:${blocked?.id ?? ''}`
  if (key === d.key) return
  d.key = key
  d.use = under
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
 * What to show while dragging. Anything the held thing can be used on gets blue squares (bright under the pointer), and so
 * does any container that would take it (bright when dropping onto it puts it inside). In strict mode the squares it would take
 * go green if they are all free and red if not. In the relaxed mode there is no such light: just a plain outline of where it
 * lands (and dashed outlines for what gives way), and red only if there is truly no way to place it.
 */
function paintGhosts(x: number, y: number) {
  clearGhosts()
  const d = drag!
  const p = d.plan
  const a = d.held.item
  const out: Light[] = d.targets.map(t => ({ sp: spaceOf(t), cells: absCells(t), kind: d.use?.id === t.id ? 'usenow' : 'use' }))
  for (const h of d.hosts) out.push({ sp: spaceOf(h), cells: absCells(h), kind: d.into?.id === h.id ? 'usenow' : 'use' })
  if (d.use) { light(out); return } // using it, not placing it
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
  const use = drop && d.use ? interaction(d.held.item, d.use) : null
  if (use && d.use) { putBack(d.held); const said = applyUse(s, d.held.item, d.use, use); changed(from); toast(said); d.el.remove(); return }
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
const meter = (label: string, f: number, text: string, color = '#e6e3dc') => `<div class="row"><span>${esc(label)}</span><i class="bar"><i style="width:${Math.round(Math.min(1, f) * 100)}%;background:${color}"></i></i><em>${esc(text)}</em></div>`

/** Name, [tags], how full it is, its shown properties ("?" while hidden), what a machine is doing, the description, and what can be done with it. */
function tipHtml(it: Item) {
  const k = KINDS[it.kind]
  const rows = [`<b>${esc(k.name)}</b>`]
  if (k.tags?.length) rows.push(`<div class="tags">[${esc(k.tags.join(', '))}]</div>`)
  if (capacityOf(it)) { const ml = it.liquid?.ml ?? 0, l = it.liquid && LIQUIDS[it.liquid.type]; rows.push(meter(it.liquid ? l?.name ?? it.liquid.type : 'empty', ml / capacityOf(it), `${ml} / ${capacityOf(it)} ml`, l?.color)) }
  for (const [name, d] of Object.entries(propDefs(it.kind))) {
    if (!d.show) continue
    const v = propOf(it, name)
    if (isHidden(it, name)) rows.push(`<div class="row"><span>${esc(name)}</span><em>?</em></div>`)
    else rows.push(d.show !== 'number' && d.max ? meter(name, v / d.max, `${v} / ${d.max}`, d.color) : `<div class="row"><span>${esc(name)}</span><em>${v}</em></div>`)
  }
  if (k.machine) rows.push(`<div class="status">${machineStatus(s, it).map(esc).join('<br>') || 'idle'}</div>`)
  const st = statsOf(it.kind)
  if (st) {
    const cellSlot = (k.slots ?? []).findIndex(sl => sl.name === 'cell')
    const cell = contents(s, it.id).find(o => o.in?.slot === cellSlot)
    const range = !cell ? 'no cell' : isHidden(cell, 'charge') ? 'cell unread' : `${Math.floor(propOf(cell, 'charge') / (2 * st.drain)) * st.speed} h out and back`
    rows.push(`<div class="row"><span>speed</span><em>${st.speed} (hours = distance)</em></div><div class="row"><span>burns</span><em>${st.drain} charge an hour</em></div><div class="row"><span>range</span><em>${range}</em></div>`)
  }
  if (k.tags?.includes('pad')) rows.push(`<div class="status">${esc(padStatus(s, it))}</div>`)
  const job = jobOf(s, it)?.terms
  if (job) rows.push(`<div class="row"><span>to</span><em>${esc(job.to)}</em></div><div class="row"><span>due</span><em>${when(job.due)}</em></div><div class="row"><span>pay</span><em>${job.pay} cr</em></div>`)
  if (k.desc) rows.push(`<p>${esc(k.desc)}</p>`)
  const hints = (k.uses ?? []).map(u => `drop onto a ${KINDS[u.on]?.name.toLowerCase() ?? u.on}: ${u.verb}`)
  if (isContainer(it.kind)) hints.push(k.tags?.includes('pad') ? 'double-click to open, and launch from there' : 'double-click to open')
  if (k.tags?.includes('paper')) hints.push('double-click to read')
  return rows.join('') + hints.map(h => `<div class="hint">${esc(h)}</div>`).join('')
}
/** Show the tooltip beside the hovered item (to its right, or its left if there is no room), kept on screen. */
function showTip() {
  const it = hoverId === null || drag || marquee || panelDrag ? undefined : find(s, hoverId)
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
  if (!el || drag || marquee || panelDrag || +el.dataset.id! === hoverId) return
  hoverId = +el.dataset.id!
  showTip()
})
app.addEventListener('pointerout', e => {
  const el = (e.target as HTMLElement).closest('.item[data-id]')
  if (el && (e.relatedTarget as HTMLElement | null)?.closest?.('.item[data-id]') !== el) hideTip()
})

addEventListener('resize', () => { fit(); render(new Map()); fitTray() })
fit()
setView(view) // draws whichever view was up, and saves the mail that just arrived

app.addEventListener('click', e => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('button')
  if (!b) return
  if ('tick' in b.dataset) { advance(s, 1); changed(); return }
  if ('view' in b.dataset) { setView(view === 'board' ? 'terminal' : 'board'); return }
  if (b.dataset.launch) { const f = launch(s, +b.dataset.launch); changed(new Map()); toast(typeof f === 'string' ? f : `launched: there ${when(f.arrives)}, back ${when(f.back)}`); return }
  if (clickTerminal(b) || clickPaper(b)) return
  if (b.dataset.close) { s.panels = (s.panels ?? []).map(p => (p === +b.dataset.close! ? null : p)); changed(new Map()); return }
  if (b.dataset.spawn) { const it = spawn(s, b.dataset.spawn); if (it) { changed(); app.querySelector(`.item[data-id="${it.id}"]`)?.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], { duration: 180 }) } else b.animate([{ transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'none' }], { duration: 200 }) }
  else if ('strict' in b.dataset) toggleStrict()
  else if ('clear' in b.dataset) { s.items = []; selected = new Set(); changed(new Map()) }
  else if ('reset' in b.dataset) { s = start(); selected = new Set(); ui.open = null; changed(new Map()) }
})

/** The terminal's buttons: folders, messages, answering, pulling out, the look. True if it was one of them. */
function clickTerminal(b: HTMLElement): boolean {
  const d = b.dataset
  if (d.folder) { ui.folder = d.folder as Folder; ui.open = listOf(s, ui.folder)[0]?.id ?? null; if (ui.open !== null) markRead(s, ui.open); changed(new Map()); app.querySelector('.term .list')?.scrollTo(0, 0) }
  else if (d.msg) { ui.open = +d.msg; markRead(s, ui.open); changed(new Map()) }
  else if (d.accept) { const r = accept(s, +d.accept); changed(new Map()); toast(typeof r === 'string' ? r : 'accepted: the slip is on your board') }
  else if (d.decline) { decline(s, +d.decline); changed(new Map()) }
  else if (d.archive) { archive(s, +d.archive); changed(new Map()) }
  else if (d.pull) openPaper({ mail: +d.pull })
  else if (d.showslip) {
    const slip = slipFor(s, +d.showslip)
    if (!slip) return true
    setView('board')
    if (slip.in) { const host = find(s, slip.in.host); toast(`the slip is in the ${host ? KINDS[host.kind].name.toLowerCase() : 'container'}`) }
    else { pick([slip.id]); app.querySelector(`.item[data-id="${slip.id}"]`)?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.6)' }, { transform: 'scale(1)' }], { duration: 380, iterations: 2 }) }
  }
  else if ('look' in d) { ui.skin = SKINS[(SKINS.indexOf(ui.skin) + 1) % SKINS.length]; store('term-skin', ui.skin); render(new Map()) }
  else return false
  return true
}

/** A paper's buttons, and the rack's tabs: close, pin, fold, unfold. True if it was one of them. */
function clickPaper(b: HTMLElement): boolean {
  const d = b.dataset
  const key = d.pclose ?? d.ppin ?? d.pfold ?? d.unfold
  const p = key === undefined ? undefined : paperAt(key)
  if (!p) return false
  if (d.pclose) s.papers = s.papers!.filter(q => q !== p)
  else if (d.ppin) { p.pinned = !p.pinned; if (!p.pinned) p.view = view }
  else if (d.pfold) p.folded = true
  else { p.folded = false; if (!p.pinned) p.view = view; s.papers = [...s.papers!.filter(q => q !== p), p] }
  changed(new Map())
  return true
}

/** Hovering a slip or an offer lights up everything on the board that would do for it. */
app.addEventListener('pointerover', e => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('.paper[data-paper], .tab[data-unfold]')
  const key = el?.dataset.paper ?? el?.dataset.unfold ?? null
  if (key === paperLit || drag || marquee || paperDrag) return
  paperLit = key
  clearGhosts()
  const p = key === null ? undefined : paperAt(key)
  const m = p && mailOf(s, p)
  if (view === 'board' && m?.terms) light(wanted(s, m).map(o => ({ sp: spaceOf(o), cells: absCells(o), kind: 'use' as const })))
})

/** Double-click a container to open its insides in the first free dock. */
app.addEventListener('dblclick', e => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('.item[data-id]')
  const it = el && find(s, +el.dataset.id!)
  if (it && KINDS[it.kind].tags?.includes('paper')) { openPaper({ item: it.id }); return }
  if (!it || !isContainer(it.kind)) return
  const panels = s.panels ?? (s.panels = [null, null, null, null])
  if (panels.includes(it.id)) { app.querySelector(`.panel[data-dock="${panels.indexOf(it.id)}"]`)?.animate([{ transform: 'scale(1.02)' }, { transform: 'none' }], { duration: 200 }); return }
  const free = panels.indexOf(null)
  if (free < 0) { toast('all four docks are in use: close one first'); return }
  panels[free] = it.id
  pick([])
  changed()
})
