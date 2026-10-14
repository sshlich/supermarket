import './style.css'
import { BOOKS } from './books.ts'
import { act as screenAct, power as screenPower, screenHtml } from './computer.ts'
import { DISCS } from './discs.ts'
import { paintFill } from './fill.ts'
import { arrive, deal, dealt, greeting, open as canDeal, priceFor, stillWants, TAGS, type Customer, type Role } from './customers.ts'
import { openReader } from './reader.ts'
import { initMenu, toggleMenu } from './menu.ts'
import { handle, handleMany, shop } from './sound.ts'
import { applyDrop, canPour, cellsOf, contents, COUNTERS, dims, fillWith, find, LIQUIDS, look, moveInto, pour, propsOf, START_CASH, swatch, worth, H, hostsFor, inSpace, intoHost, isContainer, KINDS, lift, MAX_WINDOWS, planDrop, putBack, quarter, remove, sameSpace, settle, spaceFromKey, spaceKey, spaceOf, spawn, start, W, type Held, type Item, type Plan, type Counter, type Space, type State, type Win } from './world.ts'

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

// ---------------------------------------------------------------- the customer terminal

/**
 * The terminal beside the field: the customer at the counter, the line of those still waiting, which of their wants are
 * met, and what has been said. Saved apart from the field.
 */
interface Line { who: 'them' | 'you' | 'note'; text: string; name?: string }
interface Talk { open: boolean; n: number; customer: Customer | null; line: Customer[]; met: string[]; log: Line[] }
const TALK = 'field-v3-terminal'
const blankTalk = (open = false): Talk => ({ open, n: 0, customer: null, line: [], met: [], log: [] })
/** A saved customer from an older version (no role, or wants that no longer exist) is dropped, with the line. */
const current = (c: Customer | null | undefined) => !!c?.role && Array.isArray(c.got) && c.wants.every(t => t in TAGS)
let talk: Talk = ((): Talk => { try { const v = JSON.parse(localStorage.getItem(TALK) ?? 'null'); return v && Array.isArray(v.log) ? (current(v.customer) || !v.customer ? { ...blankTalk(), ...v, line: (v.line ?? []).filter(current) } : { ...blankTalk(v.open), n: v.n }) : blankTalk() } catch { return blankTalk() } })()
const saveTalk = () => { try { localStorage.setItem(TALK, JSON.stringify(talk)) } catch { /* private window */ } }

function load(): State | null {
  try { const v = JSON.parse(localStorage.getItem(SAVE) ?? 'null'); return v?.items ? settle(v) : null } catch { return null }
}
const save = () => { try { localStorage.setItem(SAVE, JSON.stringify(s)) } catch { /* private window */ } }

function fit() {
  // room for windows beside the field (about six squares each side), and for the counters above it
  const deep = H + Object.values(COUNTERS).reduce((n, c) => n + c.h, 0)
  cell = Math.floor(Math.max(14, Math.min(40, (innerWidth - 150) / (W + 12), (innerHeight - 110) / deep)))
  document.documentElement.style.setProperty('--cell', `${cell}px`)
}
/** After drawing, shrink the squares until all of it (counters to the note under the field) is on screen. */
function fitStage() {
  const stage = app.querySelector('.stage')
  const off = () => { const r = stage!.getBoundingClientRect(); return r.top < 6 || r.bottom > innerHeight - 4 }
  while (stage && cell > 14 && off()) {
    cell--
    document.documentElement.style.setProperty('--cell', `${cell}px`)
  }
}

// ---------------------------------------------------------------- drawing


/**
 * The page's one clock for looping animations (style.css): whatever is drawn into `el` starts its loops at minus the time
 * since the page loaded, so it is in step with everything else and with what it replaces.
 */
const setClock = (el: HTMLElement) => el.style.setProperty('--clock', `${-Math.round(performance.now())}ms`)

let uid = 0
/**
 * A thing's sprite as this one looks: its properties' colours swapped in, its own ids (two apples on the page must not share
 * a gradient), and for a container, `--in<n>` set to 0 for each empty square of its first slot (a blister shows its gaps).
 */
function spriteHtml(it: Item) {
  let svg = SPRITE[it.kind] ?? ''
  for (const [from, to] of Object.entries(look(it).colors)) svg = svg.replaceAll(new RegExp(from, 'gi'), to) // hex colours: nothing in them is special to a RegExp
  const u = `u${++uid}`
  svg = svg.replace(/id="([^"]+)"/g, `id="$1-${u}"`).replace(/url\(#([^)]+)\)/g, `url(#$1-${u})`).replace(/href="#([^"]+)"/g, `href="#$1-${u}"`)
  svg = paintFill(it.kind, svg, slot => inSpace(s, { host: it.id, slot }))
  const vars: string[] = []
  const slot = KINDS[it.kind].slots?.[0]
  if (slot && svg.includes('var(--in')) {
    const full = new Set(inSpace(s, { host: it.id, slot: 0 }).flatMap(o => cellsOf(o).map(([x, y]) => (o.y + y) * slot.w + o.x + x)))
    for (let i = 0; i < slot.w * slot.h; i++) if (!full.has(i)) vars.push(`--in${i}:0`)
  }
  if (KINDS[it.kind].holds) vars.push(...liquidVars(it))
  return vars.length ? svg.replace('<svg ', `<svg style="${vars.join(';')}" `) : svg
}
/** A vessel's sprite reads how full it is (`--fill`, 0 to 1) and what is in it (`--liquid`, `--liquid-o`). */
const level = (it: Item) => (it.fill?.amount ?? 0) / (KINDS[it.kind].holds || 1)
function liquidVars(it: Item, liquid = it.fill?.liquid) {
  const l = liquid ? LIQUIDS[liquid] : undefined
  return [`--fill:${level(it)}`, `--liquid:${l?.color ?? 'transparent'}`, `--liquid-o:${l?.opacity ?? 0}`]
}

/** One item: neutral rounded squares over its cells, its sprite on top. */
function itemHtml(it: Item) {
  const k = KINDS[it.kind]
  const d = dims(it)
  const cells = cellsOf(it) // only the squares it takes, however odd the shape
  const squares = cells.map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1"/>`).join('') // the imprint: the field's own squares, lit lighter
  const hit = cells.map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1"/>`).join('')
  return `<div class="item ${selected.has(it.id) ? 'sel' : ''}" data-id="${it.id}" style="--x:${it.x};--y:${it.y};--w:${d.w};--h:${d.h};--c:${k.color}">
    <svg viewBox="0 0 ${d.w} ${d.h}"><g class="sq">${squares}</g><g class="hit">${hit}</g></svg>
    <div class="art" style="--kw:${k.w};--kh:${k.h};--r:${quarter(it.rot) * 90}deg">${spriteHtml(it)}</div></div>`
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

/**
 * A counter's dial, beside it: what is on it altogether, and under that what the customer at the counter makes of it (what
 * a seller asks for their things outside; what a buyer would pay for what they want inside, or what a trader would take).
 */
function dialHtml(at: Counter) {
  const here = inSpace(s, { at })
  const sum = (list: Item[]) => list.reduce((n, it) => n + worth(s, it), 0)
  const c = talk.customer
  let note = ''
  if (c && at === 'outside' && c.role === 'seller' && !c.dealt && c.brought.length) note = `${c.name} asks ${c.ask}$`
  else if (c && at === 'inside' && canDeal(c) && c.role !== 'seller') {
    const wants = c.role === 'buyer' ? stillWants(c) : c.wants
    const wanted = here.filter(it => !c.brought.includes(it.id) && tagsIn(it).some(t => wants.includes(t)))
    if (wanted.length) {
      const pay = priceFor(c, sum(wanted))
      note = c.role === 'buyer' ? `${c.name} pays ${pay}$${c.budget !== null && pay > c.budget ? '!' : ''}` : `${c.name} takes ${sum(wanted)}$`
    }
  }
  return `<div class="dial" data-dial="${at}" title="${at === 'outside' ? 'Outside counter' : 'Inside counter'}: what is on it is worth"><small>${at}</small>${cashText(sum(here))}${note ? `<em>${esc(note)}</em>` : ''}</div>`
}
/** Redraw the counters' dials alone (the customer changed, not the things). */
function paintDials() {
  for (const at of Object.keys(COUNTERS) as Counter[]) app.querySelector(`[data-dial="${at}"]`)?.replaceWith(Object.assign(document.createElement('template'), { innerHTML: dialHtml(at) }).content)
}

/** The two counters above the field: the outside one (what customers bring), then the inside one (what you sell), close together. */
function countersHtml() {
  return `<div class="counters">${(Object.keys(COUNTERS) as Counter[]).map(c => `<div class="counter">${dialHtml(c)}<div class="grid" data-grid data-space="${c}" data-w="${COUNTERS[c].w}" data-h="${COUNTERS[c].h}" style="--w:${COUNTERS[c].w};--h:${COUNTERS[c].h}">${inSpace(s, { at: c }).map(itemHtml).join('')}</div></div>`).join('')}</div>`
}

/** One open container: a window floating over the page, its insides a small grid for each of its slots. */
function winHtml(w: Win, z: number) {
  const it = find(s, w.id)!
  const k = KINDS[it.kind]
  if (k.computer) return pcHtml(w, z)
  const slots = (k.slots ?? []).map((sl, i) => {
    const note = [sl.name, sl.accepts?.length ? `${sl.accepts.join(', ')} only` : '', sl.rejects?.length ? `no ${sl.rejects.join(', ')}` : '', sl.out ? 'take out only' : ''].filter(Boolean).join(' · ')
    return `<div class="slotbox">${note ? `<div class="slotnote">${note}</div>` : ''}<div class="grid" data-grid data-space="${it.id}:${i}" data-w="${sl.w}" data-h="${sl.h}" style="--w:${sl.w};--h:${sl.h}">${inSpace(s, { host: it.id, slot: i }).map(itemHtml).join('')}</div></div>`
  }).join('')
  return `<div class="win" data-win="${it.id}" style="left:${w.x}px;top:${w.y}px;z-index:${10 + z}"><div class="win-head" data-whead style="--c:${swatch(it)}"><i></i><span>${esc(look(it).name)}</span><button data-wfold="${it.id}" title="Fold: keep just a tab along the top">–</button><button data-wclose="${it.id}" title="Close">✕</button></div>${slots}</div>`
}

/** The open windows where they were left, and the folded ones as tabs in the rack along the top edge. */
function windowsHtml() {
  const ws = s.windows ?? []
  const tabs = ws.filter(w => w.folded).map(w => { const it = find(s, w.id)!; return `<button class="tab" data-wopen="${w.id}" style="--c:${swatch(it)}" title="Unfold"><i></i>${esc(look(it).name)}</button>` }).join('')
  return ws.map((w, z) => (w.folded ? '' : winHtml(w, z))).join('') + (tabs ? `<div class="rack">${tabs}</div>` : '')
}

// ---------------------------------------------------------------- the wired terminal's window: a CRT, its power and its disc tray

const isOn = (it: Item) => propsOf(it).power === 'on'
/** The disc in a machine's tray, if any, as what is written on it. */
function discIn(id: number) {
  const d = inSpace(s, { host: id, slot: 0 })[0]
  return d ? DISCS[propsOf(d).content] ?? null : null
}
/** How big the screen is drawn: a little over its own size in a window, as big as fits filling the page. */
const screenScale = (full?: boolean) => full ? Math.max(1.2, Math.min((innerWidth - 120) / 320, (innerHeight - 190) / 240)) : 1.15
/**
 * A computer's window: the curved glass of a CRT in its beige bezel (the screen is computer.ts's), and under it the power
 * switch, its light, and the disc tray: a one-square slot that takes a floppy, handled like any other place.
 */
function pcHtml(w: Win, z: number) {
  const it = find(s, w.id)!
  const on = isOn(it)
  return `<div class="win pc${w.full ? ' full' : ''}" data-win="${it.id}" style="left:${w.x}px;top:${w.y}px;z-index:${10 + z};--s:${screenScale(w.full).toFixed(3)}"><div class="win-head" data-whead style="--c:${swatch(it)}"><i></i><span>${esc(look(it).name)}</span><button data-wfull="${it.id}" title="${w.full ? 'Back to a window' : 'Fill the page'}">${w.full ? '⤡' : '⤢'}</button><button data-wfold="${it.id}" title="Fold: keep just a tab along the top">–</button><button data-wclose="${it.id}" title="Close">✕</button></div>
    <div class="crt"><div class="glass${on ? ' on' : ''}" data-screen="${it.id}">${screenHtml(it.id, on, discIn(it.id))}</div>
    <div class="crt-base"><button class="power${on ? ' on' : ''}" data-power="${it.id}" title="Power">&#9211;</button><i class="led${on ? ' on' : ''}"></i><span class="brand">WT-2</span>
    <div class="tray"><small>A:</small><div class="grid" data-grid data-space="${it.id}:0" data-w="1" data-h="1" style="--w:1;--h:1">${inSpace(s, { host: it.id, slot: 0 }).map(itemHtml).join('')}</div></div></div></div></div>`
}
/** Draw one machine's screen again, alone. */
function paintScreen(id: number) {
  const el = app.querySelector(`[data-screen="${id}"]`)
  const it = find(s, id)
  if (el && it) { setClock(el as HTMLElement); el.innerHTML = screenHtml(id, isOn(it), discIn(id)) }
}
/** The power switch: the property changes (the sprite on the field glows or goes dark), and the screen boots or goes black. */
function pressPower(id: number) {
  const it = find(s, id)
  if (!it) return
  const on = !isOn(it)
  if (on) it.props = { ...it.props, power: 'on' }
  else { delete it.props?.power; if (it.props && !Object.keys(it.props).length) delete it.props }
  shop(on ? 'powerOn' : 'powerOff')
  screenPower(id, on, discIn(id), () => paintScreen(id), () => shop('key'))
  changed(new Map())
}

/** Keep every open window on screen (after a resize, or a window that opened near an edge): its header always stays reachable. */
function keepOnScreen() {
  for (const el of app.querySelectorAll<HTMLElement>('.win[data-win]')) {
    const w = winOf(+el.dataset.win!)
    if (!w || w.full) continue // a window filling the page is placed by its style
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
  sound(it, 'use')
  pick([])
  changed()
  keepOnScreen()
  save()
}

/** Redraw everything; things that moved glide from where they were. */
function render(from = rects()) {
  document.querySelectorAll('.hl').forEach(el => el.remove()) // lights belong to a drag; none may outlive it
  setClock(app)
  app.innerHTML = `<div class="stage"><div class="center">${countersHtml()}<div class="field"><div class="grid" data-grid data-space="field" data-w="${W}" data-h="${H}" style="--w:${W};--h:${H}">${inSpace(s, null).map(itemHtml).join('')}</div></div><div class="toast" data-toast></div><aside class="side">${sideHtml()}</aside>${cashHtml()}</div></div>${windowsHtml()}`
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

/** `pours` are the vessels the held one would pour into; `pourInto` the one under the pointer now. */
interface Drag { held: Held; el: HTMLElement; gx: number; gy: number; rot: number; plan: Plan | null; key: string; hosts: Item[]; full: Item[]; blocked: Item | null; into: Item | null; space: Space; over: boolean; pours: Item[]; pourInto: Item | null }
let press: { id: number; x: number; y: number; gx: number; gy: number; toggle: boolean; wasGroup: boolean } | null = null
let drag: Drag | null = null
let last: PointerEvent | null = null
let marquee: { x0: number; y0: number; add: boolean; el: HTMLElement; grid: HTMLElement; space: Space } | null = null
let winDrag: { win: Win; el: HTMLElement; dx: number; dy: number } | null = null

const spaceAt = (g: HTMLElement): Space => spaceFromKey(g.dataset.space!)
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
  if (w && !w.full && t.closest('[data-whead]') && !t.closest('button')) { // grab a window by its header to move it anywhere
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
  // a redraw can swap the hovered thing for a new element the pointer never "enters", so no pointerout comes: check here
  const t = e.target as HTMLElement
  if (hoverId !== null && !t.closest?.(`.item[data-id="${hoverId}"]`)) hideTip()
  if (hoverId === null && tip.classList.contains('on') && !t.closest?.('[data-tag]')) tip.classList.remove('on')
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
  else if (e.key === 'Escape') { if (selected.size) pick([]); else toggleMenu() }
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
  drag = { held, el, gx: press!.gx, gy: press!.gy, rot: held.item.rot, plan: null, key: '', hosts: [], full: [], blocked: null, into: null, space: null, over: false, pours: [], pourInto: null }
  for (const h of hostsFor(s, held.items)) (intoHost(s, held, h.id) ? drag.hosts : drag.full).push(h)
  if (held.items.length === 1) drag.pours = s.items.filter(o => canPour(held.item, o) > 0)
  press = null
  for (const it of held.items) app.querySelector(`.item[data-id="${it.id}"]`)?.classList.add('lifted')
  sounds(held.items, 'lift')
  paintFloating()
  hideTip()
  document.body.classList.add('dragging')
}

/** What is in hand, drawn where it sits relative to the one you hold. */
function paintFloating() {
  const d = drag!
  const a = d.held.item
  setClock(d.el)
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
  const pourInto = d.pours.find(on) ?? null // a vessel dropped onto another pours into it, and goes back where it was
  const host = pourInto ? null : d.hosts.find(on) ?? null // dropped onto a container: goes inside it
  // over a container that would take it but is full: refused, and nothing gets shoved (one that never takes it is just another thing to rearrange)
  const blocked = host || pourInto ? null : d.full.find(on) ?? null
  const key = `${spaceKey(sp)}:${x}:${y}:${d.rot}:${strictNow()}:${host?.id ?? ''}:${blocked?.id ?? ''}:${pourInto?.id ?? ''}`
  if (key === d.key) return
  d.key = key
  d.over = true
  d.space = sp
  d.plan = host ? intoHost(s, d.held, host.id) : null
  d.into = d.plan ? host : null
  d.blocked = blocked
  d.pourInto = pourInto
  if (!d.plan && !blocked && !pourInto) d.plan = planDrop(s, d.held, sp, x, y, d.rot, strictNow())
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
  const out: Light[] = [...d.hosts, ...d.pours].map(h => ({ sp: spaceOf(h), cells: absCells(h), kind: d.into?.id === h.id || d.pourInto?.id === h.id ? 'usenow' : 'use' }))
  if (d.pourInto) { light(out); return }
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

// ---------------------------------------------------------------- the terminal, drawn and played

/** A wanted tag as a short word; hovering it says what it is. Lit when what is on the counter meets it. */
const tagChip = (t: string, met: boolean, i: number) => `<span class="tag${met ? ' met' : ''}" data-tag="${esc(t)}" style="--i:${i}">${esc(TAGS[t]?.label ?? t)}</span>`

/** What the big button says for each sort of customer. */
const DEAL: Record<Role, { label: string; title: string }> = {
  buyer: { label: 'SELL', title: 'Sell them what they want from the inside counter' },
  seller: { label: 'BUY', title: 'Buy what they unloaded on the outside counter, at their price' },
  trader: { label: 'SWAP', title: 'Swap what they want from the inside counter for what they brought' },
}

const svg = (d: string) => `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square">${d}</svg>`
const ICON = {
  dismiss: svg('<path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/>'), // send away
  next: svg('<path d="M3 3.5l5 4.5-5 4.5M9 3.5l5 4.5-5 4.5"/>'), // call the next in line
  door: svg('<path d="M3.5 14V2.5h6V14M2 14h12M7.5 8.2v.1M12 6l2 2-2 2M10 8h4"/>'), // open the door
}

/** The button on the side of the field and, when it is open, the terminal under it: the conversation, and below it the controls (dismiss and next on the left, the big deal button on the right). */
function sideHtml(fresh = false) {
  const c = talk.customer
  const button = `<button class="term-btn${talk.open ? ' on' : ''}" data-term title="Talk to the customer">&gt;_ customers</button>`
  if (!talk.open) return button
  const lines = talk.log.map((l, i) => l.who === 'them' ? `<div class="them" data-line="${i}"><b>${esc(l.name ?? '')}</b> <span>${esc(l.text)}</span></div>` : `<div class="${l.who}">${l.who === 'you' ? '$ ' : ''}${esc(l.text)}</div>`).join('')
  const off = c ? '' : ' disabled'
  const shut = c && canDeal(c) ? '' : ' disabled'
  const waiting = talk.line.length ? `${talk.line.length} waiting` : 'nobody else waiting'
  const lit = (t: string) => c?.got.includes(t) || talk.met.includes(t)
  const money = c?.role === 'buyer' && c.budget !== null ? `<span class="tag ask" style="--i:${c.wants.length}" title="What they have left to spend">has ${c.budget}$</span>` : ''
  const head = c ? `<span>customer ${c.id}: ${esc(c.name)} <small>· ${waiting}</small></span><span class="wants">${c.role === 'seller' ? (c.ask ? `<span class="tag ask" style="--i:0">asks ${c.ask}$</span>` : '') : c.wants.map((t, i) => tagChip(t, lit(t), i)).join('') + money}</span>`
    : `<span>nobody at the counter <small>· ${talk.line.length ? waiting : 'the line is empty'}</small></span>`
  const next = c || talk.line.length ? 'next customer' : 'let them in'
  const big = c ? DEAL[c.role] : DEAL.buyer
  return `${button}<div class="term"><div class="term-head${fresh ? ' fresh' : ''}">${head}</div>
    <div class="term-screen"><div class="term-log" data-termlog>${lines}</div></div>
    <div class="term-ask"><div class="ask-side"><button class="no" data-say="dismiss"${off} title="Send them away, with whatever they brought" aria-label="dismiss">${ICON.dismiss}</button><button class="go" data-say="next" title="${c || talk.line.length ? 'Call the next one in line' : 'Open the door: a new line forms'}" aria-label="${next}">${c || talk.line.length ? ICON.next : ICON.door}</button></div><button class="sell" data-say="deal"${shut} title="${big.title}">${big.label}</button></div></div>`
}

let seq = 0 // bumped by every move that changes who is at the counter: a slower one still going notices and gives up
let typer = 0
const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms))
/** Redraw just the terminal (the field is left alone), scrolled to the latest line. `type` types out the newest line of the customer's, a letter at a time. */
function renderTerm(o: { fresh?: boolean; type?: boolean } = {}) {
  const side = app.querySelector('.side')
  if (!side) return
  clearInterval(typer)
  tip.classList.remove('on') // the tag under the pointer may be gone: no pointerout will come for it
  side.innerHTML = sideHtml(o.fresh)
  const log = side.querySelector<HTMLElement>('[data-termlog]')
  if (log) log.scrollTop = log.scrollHeight
  paintDials()
  const line = o.type && talk.log.length ? side.querySelector<HTMLElement>(`[data-line="${talk.log.length - 1}"]`) : null
  const span = line?.querySelector('span')
  if (line && span) {
    const full = span.textContent ?? ''
    let n = 0
    span.textContent = ''
    line.classList.add('typing')
    typer = window.setInterval(() => {
      span.textContent = full.slice(0, ++n)
      if (n % 2 && full[n - 1] !== ' ') shop('key')
      if (log) log.scrollTop = log.scrollHeight
      if (n >= full.length || !line.isConnected) { clearInterval(typer); line.classList.remove('typing') }
    }, 16)
  }
  saveTalk()
}
const typeTime = (text: string) => text.length * 16

/** Things leave the shop: they lift off and fade where they were, and are gone (the caller redraws). */
function vanish(ids: number[]) {
  ids = ids.filter(id => find(s, id))
  if (!ids.length) return
  for (const id of ids) {
    const el = app.querySelector<HTMLElement>(`.item[data-id="${id}"]`)
    if (!el) continue
    const r = el.getBoundingClientRect()
    const ghost = document.body.appendChild(el.cloneNode(true) as HTMLElement)
    Object.assign(ghost.style, { position: 'fixed', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, zIndex: '40', pointerEvents: 'none' })
    ghost.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-24px) scale(.9)' }], { duration: 320, easing: 'ease-in' }).onfinish = () => ghost.remove()
  }
  remove(s, ids)
}
/** The customer goes, taking back whatever they brought and you did not deal for, wherever it got to. */
function leave() {
  const c = talk.customer
  if (c?.brought.length) { vanish(c.brought); changed(new Map()); shop('leave') }
}
/** The screen is wiped: a scan line sweeps down and the conversation fades behind it, then nobody is at the counter. False if something else happened meanwhile. */
async function wipe(): Promise<boolean> {
  const my = ++seq
  const screen = app.querySelector('.term-screen')
  if (screen && talk.open && talk.log.length) { screen.classList.add('wipe'); shop('wipe'); await wait(480) }
  if (my !== seq) return false
  Object.assign(talk, { customer: null, met: [], log: [] })
  renderTerm()
  return true
}
/** A new line forms when the door opens. */
// ponytail: line length is random (3 to 7) for now; it should come from something in the game later (reputation, stock, the street)
const newLine = () => Array.from({ length: 3 + Math.floor(Math.random() * 5) }, () => arrive(++talk.n))
/** A seller or trader puts down what they brought on the outside counter, one thing after another; a seller then names a price for the lot. */
function unload(c: Customer) {
  for (const g of c.goods) {
    const it = spawn(s, g.kind, { at: 'outside' }, g.props ?? {})
    if (!it) continue // no room left on the counter
    if (g.fill !== undefined) { if (g.fill) it.fill = { ...g.fill }; else delete it.fill }
    if (g.missing) remove(s, contents(s, it.id).sort(() => Math.random() - 0.5).slice(0, g.missing).map(o => o.id))
    c.brought.push(it.id)
  }
  if (c.role === 'seller') c.ask = Math.max(1, Math.round(c.brought.reduce((n, id) => n + worth(s, find(s, id)!), 0) * c.rate))
  if (!c.brought.length) return
  changed(new Map())
  c.brought.forEach((id, i) => setTimeout(() => { const it = find(s, id); if (it) sound(it, 'drop') }, i * 110 + 120))
  c.brought.forEach((id, i) => app.querySelector(`.item[data-id="${id}"]`)?.animate([{ opacity: 0, transform: 'translateY(-60%)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: i * 110, easing: 'ease-out', fill: 'backwards' }))
}
/**
 * The next one in line steps up (whoever was there leaves first, with their things). With nobody there and nobody waiting,
 * the door opens and a new line forms. A newcomer's wants fade in, a seller or trader unloads, and they start talking.
 */
async function callNext() {
  const had = !!talk.customer
  leave()
  if (!(await wipe())) return
  if (!talk.line.length) { if (had) return; talk.line = newLine(); shop('bell') }
  const my = seq
  const c = talk.customer = talk.line.shift()!
  talk.log.push({ who: 'note', text: `customer ${c.id} at the counter...` })
  renderTerm({ fresh: true })
  await wait(420)
  if (my !== seq) return
  unload(c)
  talk.log.push({ who: 'them', name: c.name, text: greeting(c) })
  renderTerm({ type: true })
}
/** Send the one at the counter away, with what they brought. */
async function dismiss() {
  leave()
  await wipe()
}
/** The tags of a thing on the counter as a customer sees them: its own, and those of whatever is inside it. */
const tagsIn = (it: Item): string[] => [...look(it).tags, ...contents(s, it.id).flatMap(tagsIn)]
/**
 * The big button: SELL to a buyer, BUY from a seller, SWAP with a trader (see `deal` in customers.ts). What is yours on the
 * inside counter is offered; their own things are not yours to offer. If it goes through, money moves, what they take
 * leaves and what they brought is yours. They stay: a buyer can buy again while they still want something.
 */
function doDeal() {
  const c = talk.customer
  if (!c) return
  c.brought = c.brought.filter(id => find(s, id))
  const offered = inSpace(s, { at: 'inside' }).filter(it => !c.brought.includes(it.id)).map(it => ({ id: it.id, tags: tagsIn(it), worth: worth(s, it) }))
  const theirs = c.brought.reduce((n, id) => n + worth(s, find(s, id)!), 0)
  const r = deal(c, offered, s.cash ?? 0, theirs)
  talk.met = c.role === 'trader' ? r.met : []
  if (r.done) dealt(c, r)
  talk.log.push({ who: 'you', text: DEAL[c.role].label }, { who: 'them', name: c.name, text: r.say })
  renderTerm({ type: true })
  if (!r.done) return
  // what they take leaves; what you got slides across from the outside counter to the inside one (what fits)
  const got = c.brought.map(id => find(s, id)!).filter(it => it.at === 'outside')
  c.brought = []
  if (r.pay) { setCash((s.cash ?? 0) + r.pay); shop(r.pay > 0 ? 'coinsIn' : 'coinsOut') }
  const from = rects()
  vanish(r.take)
  for (const it of got) moveInto(s, it, { at: 'inside' })
  changed(from)
  saveTalk() // what they brought is yours now: a reload must not let them take it back
  // they stay at the counter until you dismiss them or call the next one
}
function say(what: string) {
  if (what === 'next') callNext()
  else if (what === 'dismiss') dismiss()
  else if (what === 'deal') doDeal()
}
/** Open or close the terminal; opening it with nobody there calls the next one (or lets a line in). */
function toggleTerm() {
  talk.open = !talk.open
  if (talk.open && !talk.customer) return void callNext()
  renderTerm()
}

// ---------------------------------------------------------------- money: a black dial with green digits, on the main screen

let cashShown = s.cash ?? START_CASH
/** Six digits, the leading zeros dim, then $. */
function cashText(n: number) {
  const t = String(Math.max(0, Math.round(n))).padStart(6, '0')
  const lead = t.match(/^0*(?=\d)/)![0]
  return `<span class="lead">${lead}</span>${t.slice(lead.length)}<b>$</b>`
}
const cashHtml = () => `<div class="cash" data-cash title="Your money">${cashText(cashShown)}</div>`
/** Money changes: the dial counts to the new sum, and glows. */
function setCash(v: number) {
  const from = cashShown, t0 = performance.now()
  s.cash = v
  save()
  const step = (t: number) => {
    const k = Math.min(1, (t - t0) / 700)
    cashShown = k < 1 ? from + (v - from) * (1 - (1 - k) ** 3) : v
    const el = app.querySelector('[data-cash]')
    if (el) el.innerHTML = cashText(cashShown)
    if (k < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
  app.querySelector('[data-cash]')?.animate([{ boxShadow: `inset 0 0 0 1px #1d2a20, 0 0 18px ${v >= from ? 'rgba(74, 224, 122, .55)' : 'rgba(224, 96, 74, .55)'}` }, { boxShadow: 'inset 0 0 0 1px #1d2a20, 0 0 0 transparent' }], { duration: 900 })
}

/** Let go: `drop` puts it where the ghost says, otherwise it goes back. */
function finish(drop: boolean) {
  const d = drag!
  drag = null
  document.body.classList.remove('dragging')
  clearGhosts()
  const from = rects()
  d.el.querySelectorAll<HTMLElement>('.item').forEach((el, i) => from.set(d.held.items[i].id, el.getBoundingClientRect()))
  const a = d.held.item, b = d.pourInto
  const was = b && drop ? { liquid: a.fill!.liquid, a: level(a), b: level(b), n: 0 } : null
  if (was && b) { was.n = pour(a, b); putBack(d.held); sound(a, 'use') }
  else if (drop && d.plan) { applyDrop(s, d.held, d.plan); sounds(d.held.items, 'drop') }
  else { putBack(d.held); if (drop && d.over) shop('bad'); else sounds(d.held.items, 'drop') }
  d.el.remove()
  changed(from)
  if (was && b) {
    slosh(a, was.a, was.liquid)
    slosh(b, was.b, was.liquid)
    toast(`poured ${was.n} of ${LIQUIDS[was.liquid].name} into the ${look(b).name.toLowerCase()}`)
  }
}
/** A thing makes the sound of what it is made of; several at once, each material once (see handleMany). */
const sound = (it: Item, action: 'lift' | 'drop' | 'use') => handle(KINDS[it.kind]?.sound, action)
const sounds = (items: Item[], action: 'lift' | 'drop') => handleMany(items.map(it => KINDS[it.kind]?.sound), action)

/** A vessel's level moves from where it was to where it is now, in the colour of what was poured. */
function slosh(it: Item, from: number, liquid: string) {
  const svg = app.querySelector<SVGElement>(`.item[data-id="${it.id}"] .art svg`)
  const [, colour, opacity] = liquidVars(it, liquid).map(v => v.split(':')[1])
  svg?.animate([{ '--fill': String(from), '--liquid': colour, '--liquid-o': opacity }, { '--fill': String(level(it)), '--liquid': colour, '--liquid-o': opacity }], { duration: 700, easing: 'cubic-bezier(.4, 0, .3, 1)' })
}

// ---------------------------------------------------------------- tooltip

const tip = document.body.appendChild(document.createElement('div'))
tip.className = 'tip'
let hoverId: number | null = null
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

/** Name, its properties where they are not the default, [tags], what it is worth, the description, and what can be done with it. */
function tipHtml(it: Item) {
  const k = KINDS[it.kind]
  const l = look(it)
  const rows = [`<b>${esc(l.name)}</b>`]
  const odd = Object.entries(propsOf(it)).filter(([p, v]) => !k.props![p][v].name && v !== Object.keys(k.props![p])[0]).map(([, v]) => v)
  if (odd.length) rows.push(`<div class="prop">${esc(odd.join(', '))}</div>`)
  const cap = k.holds
  if (cap) { const f = it.fill, liq = f && LIQUIDS[f.liquid]; rows.push(`<div class="liquid">${liq ? `<i style="background:${liq.color}"></i>${esc(liq.name)}, ${f.amount} of ${cap}` : `empty (holds ${cap})`}</div>`) }
  const tags = l.tags.filter(t => t !== 'vessel' && !odd.includes(t))
  if (tags.length) rows.push(`<div class="tags">[${esc(tags.join(', '))}]</div>`)
  // the money: what it is worth and what that is made of, and what the one at the counter would make of it
  const value = worth(s, it)
  const wet = it.fill ? (LIQUIDS[it.fill.liquid]?.price ?? 0) * it.fill.amount : 0
  const parts = [wet && `${l.price} + ${wet} ${LIQUIDS[it.fill!.liquid].name}`, value - l.price - wet && `${l.price} + ${value - l.price - wet} inside`].filter(Boolean)
  rows.push(`<div class="price"><span class="dollars">${value}$</span><small>${parts.join(', ') || 'worth'} · ${esc(k.cat ?? '')} · ${k.w}×${k.h}</small></div>`)
  const who = customerSays(it, value)
  if (who) rows.push(`<div class="who">${who}</div>`)
  if (l.desc) rows.push(`<p>${esc(l.desc)}</p>`)
  if (isContainer(it.kind)) rows.push(`<div class="hint">double-click to open</div>`)
  if (k.read) rows.push(`<div class="hint">double-click to read</div>`)
  if (it.fill) rows.push(`<div class="hint">drop it on another bottle to pour</div>`)
  return rows.join('')
}
/** What the customer at the counter makes of a thing: theirs, what a buyer would pay for it, whether a trader wants it. */
function customerSays(it: Item, value: number): string {
  const c = talk.customer
  if (!c) return ''
  const name = esc(c.name)
  if (c.brought.includes(it.id)) return c.role === 'seller' && !c.dealt ? `${name}'s: part of a ${c.ask}$ lot` : `${name}'s, until you deal`
  if (!canDeal(c) || c.role === 'seller') return ''
  const wants = c.role === 'buyer' ? stillWants(c) : c.wants
  if (!tagsIn(it).some(t => wants.includes(t))) return `${name} does not want this`
  if (c.role === 'trader') return `${name} wants this`
  const pay = priceFor(c, value)
  return `${name} would pay ${pay}$${c.budget !== null && pay > c.budget ? ` (has ${c.budget}$)` : ''}`
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
app.addEventListener('pointerover', e => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-tag]')
  const t = el && TAGS[el.dataset.tag!]
  if (!el || !t) return
  tip.innerHTML = `<b>${esc(t.label)}</b><p>${esc(t.desc)}</p>`
  tip.classList.add('on')
  const r = el.getBoundingClientRect(), b = tip.getBoundingClientRect()
  tip.style.transform = `translate(${Math.max(8, Math.min(innerWidth - b.width - 8, r.left))}px, ${r.bottom + 8}px)`
})
app.addEventListener('pointerout', e => {
  if ((e.target as HTMLElement).closest('[data-tag]')) tip.classList.remove('on')
  const el = (e.target as HTMLElement).closest('.item[data-id]')
  if (el && (e.relatedTarget as HTMLElement | null)?.closest?.('.item[data-id]') !== el) hideTip()
})

// what the menu's controls do (menu.ts)
initMenu({
  strict: () => strict,
  toggleStrict,
  spawn(kind, props, liquid) {
    const it = spawn(s, kind, null, props)
    if (!it) return false
    if (liquid !== undefined) fillWith(it, liquid || null)
    sound(it, 'drop')
    changed()
    app.querySelector(`.item[data-id="${it.id}"]`)?.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], { duration: 180 })
    return true
  },
  addCash(n) { setCash((s.cash ?? 0) + n); shop('coinsIn') },
  clearField() { s.items = []; s.windows = []; selected = new Set(); changed(new Map()) },
  newGame() { s = start(); cashShown = s.cash!; selected = new Set(); seq++; talk = blankTalk(talk.open); changed(new Map()); if (talk.open) callNext() },
})

addEventListener('resize', () => { fit(); render(new Map()); fitStage(); keepOnScreen() })
fit()
render(new Map())
fitStage()
keepOnScreen()

app.addEventListener('click', e => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('button')
  if (!b) return
  if (b.dataset.wclose) { s.windows = (s.windows ?? []).filter(w => w.id !== +b.dataset.wclose!); changed(new Map()); return }
  if (b.dataset.wfold) { const w = winOf(+b.dataset.wfold); if (w) w.folded = true; changed(new Map()); return }
  if (b.dataset.wopen) { const it = find(s, +b.dataset.wopen); if (it) openWindow(it); return }
  if (b.dataset.wfull) { const w = winOf(+b.dataset.wfull); if (w) w.full = !w.full; shop('menu'); changed(new Map()); keepOnScreen(); return }
  if (b.dataset.power) { pressPower(+b.dataset.power); return }
  if (b.dataset.pc) { const id = +b.dataset.pc; screenAct(id, b.dataset.act!, discIn(id), () => paintScreen(id), () => shop('seek')); return }
  if ('term' in b.dataset) { toggleTerm(); return }
  if (b.dataset.say) { say(b.dataset.say); return }
})

/** Double-click a container to open its insides in a window beside it, or a book to read it. */
app.addEventListener('dblclick', e => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('.item[data-id]')
  const it = el && find(s, +el.dataset.id!)
  if (it && isContainer(it.kind)) openWindow(it)
  else if (it && KINDS[it.kind].read && BOOKS[propsOf(it).title]) { hideTip(); openReader(BOOKS[propsOf(it).title]) }
})
