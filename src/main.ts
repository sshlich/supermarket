import './style.css'
import { BOOKS } from './books.ts'
import { deliver, morning, quote, ship, swapSales } from './orders.ts'
import { initComputer, power as screenPower, prune as pruneScreens, screenHtml } from './computer.ts'
import { kb, PIC_SIZE, programFile, PROGRAMS, SYSTEM_DISK, textSize } from './programs.ts'
import { DISCS } from './discs.ts'
import { charge, cool, CRUCIBLE, FIREBOX, fuelIn, isFurnace, isLit, light as kindle, progress, stoke } from './furnace.ts'
import { paintFill } from './fill.ts'
import { TAGS } from './customers.ts'
import { esc } from './html.ts'
import { openReader } from './reader.ts'
import { initMenu, toggleMenu } from './menu.ts'
import { floorFor, barred, goHome, goOut, inHand, named, nightsLeft, search, searchesFor, sells, shopOf, SHOPS, siteOf, SITES, tends, trade } from './outside.ts'
import { customer, customerSays, dialNote, dropped, initTerminal, notYours, reopen, restart, resume, sideHtml, theirs, typeOn } from './terminal.ts'
import { handle, handleMany, shop } from './sound.ts'
import { type Buys, worn, contents, isBox, sealed, pieceOf, type Print, refill, leftOf, PLACES, sleep, trash, accepts, applyDrop, canPour, canStack, cellsOf, closed, partsOf, stack, unstack, COUNTERS, cut, dims, sizeOf, fillWith, find, isSlot, LIQUIDS, look, pour, propsOf, START_CASH, swatch, worth, H, hostsFor, inSpace, intoHost, isContainer, KINDS, lift, MAX_WINDOWS, planDrop, putBack, quarter, remove, sameSpace, settle, spaceFromKey, spaceKey, spaceOf, spawn, start, W, type Held, type Item, type Plan, type Counter, type Space, type State, type Win } from './world.ts'

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
  let svg = paintFill(it, SPRITE[KINDS[it.kind].sprite ?? it.kind] ?? '', slot => inSpace(s, { host: it.id, slot })) // drawn from what is in it, before ids are made its own
  if (KINDS[it.kind].cut) { const { w, h } = sizeOf(it); svg = svg.replace(/viewBox="[^"]*"/, `viewBox="0 0 ${w * 32} ${h * 32}"`) } // drawn to the size it is now
  for (const [from, to] of Object.entries(look(it).colors)) svg = svg.replaceAll(new RegExp(from, 'gi'), to) // hex colours: nothing in them is special to a RegExp
  const u = `u${++uid}`
  svg = svg.replace(/id="([^"]+)"/g, `id="$1-${u}"`).replace(/url\(#([^)]+)\)/g, `url(#$1-${u})`).replace(/href="#([^"]+)"/g, `href="#$1-${u}"`)
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

/**
 * One item: neutral rounded squares over its cells, its sprite on top. Something in the fire (ore melting, coal burning
 * away) is drawn dark, with a second copy in its own colours below a line that rises as it goes (`--done`, 0 to 1).
 */
function itemHtml(it: Item) {
  const k = KINDS[it.kind]
  const d = dims(it)
  const cells = cellsOf(it) // only the squares it takes, however odd the shape
  const squares = cells.map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1"/>`).join('') // the imprint: the field's own squares, lit lighter
  const hit = cells.map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1"/>`).join('')
  const art = () => `<div class="art" style="--kw:${sizeOf(it).w};--kh:${sizeOf(it).h};--r:${quarter(it.rot) * 90}deg">${spriteHtml(it)}</div>`
  const fire = it.heat !== undefined && (k.smelt || k.burns)
  return `<div class="item ${selected.has(it.id) ? 'sel' : ''}${fire ? ' heating' : ''}" data-id="${it.id}" style="--x:${it.x};--y:${it.y};--w:${d.w};--h:${d.h};--c:${k.color}${fire ? `;--done:${it.heat!.toFixed(4)}` : ''}">
    <svg viewBox="0 0 ${d.w} ${d.h}"><g class="sq">${squares}</g><g class="hit">${hit}</g></svg>
    ${art()}${fire ? `<div class="hot">${art()}</div><i class="gauge"></i>` : ''}</div>`
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
  const note = dialNote(at)
  return `<div class="dial" data-dial="${at}" title="${at === 'outside' ? 'Outside counter' : 'Inside counter'}: what is on it is worth"><small>${at}</small>${cashText(inSpace(s, { at }).reduce((n, it) => n + worth(s, it), 0))}${note ? `<em>${esc(note)}</em>` : ''}</div>`
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
  if (k.furnace) return furnaceHtml(w, z)
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
/** How big the 640x480 screen is drawn: in a window, as big as leaves room for the field (never past its own size); filling the page, as big as fits. */
// (per unit of scale the machine is about 672 wide and 560 tall with its bezel, base and drive)
const screenScale = (full?: boolean) => full ? Math.max(1, Math.min((innerWidth - 60) / 672, (innerHeight - 80) / 560)) : Math.max(0.7, Math.min(1, (innerWidth - 420) / 672, (innerHeight - 120) / 560))
/**
 * A computer's window: the curved glass of a CRT in its beige bezel (the screen is computer.ts's), and under it the power
 * switch, its light, and the disc tray: a one-square slot that takes a floppy, handled like any other place.
 */
function pcHtml(w: Win, z: number) {
  const it = find(s, w.id)!
  const on = isOn(it)
  const tray = KINDS[it.kind].slots?.[0] ?? { w: 2, h: 2 }
  const k = screenScale(w.full) / screenScale(false) // the bezel's switch, light, name and drive grow with the screen
  return `<div class="win pc${w.full ? ' full' : ''}" data-win="${it.id}" style="left:${w.x}px;top:${w.y}px;z-index:${10 + z};--s:${screenScale(w.full).toFixed(3)};--k:${k.toFixed(3)}"><div class="win-head" data-whead style="--c:${swatch(it)}"><i></i><span>${esc(look(it).name)}</span><button data-wfull="${it.id}" title="${w.full ? 'Back to a window' : 'Fill the page'}">${w.full ? '⤡' : '⤢'}</button><button data-wfold="${it.id}" title="Fold: keep just a tab along the top">–</button><button data-wclose="${it.id}" title="Close">✕</button></div>
    <div class="crt"><div class="glass${on ? ' on' : ''}" data-screen="${it.id}">${screenHtml(it.id, on)}</div>
    <div class="crt-base"><button class="power${on ? ' on' : ''}" data-power="${it.id}" title="Power">&#9211;</button><i class="led${on ? ' on' : ''}"></i><span class="brand">WT-2</span>
    <div class="tray"><small>A:</small><div class="grid" data-grid data-space="${it.id}:0" data-w="${tray.w}" data-h="${tray.h}" style="--w:${tray.w};--h:${tray.h};--cell:${Math.round(cell * k)}px">${inSpace(s, { host: it.id, slot: 0 }).map(itemHtml).join('')}</div></div></div></div></div>`
}
/** Draw one machine's screen again, alone. */
function paintScreen(id: number) {
  const el = app.querySelector(`[data-screen="${id}"]`)
  const it = find(s, id)
  if (el && it) keepFocus(() => { setClock(el as HTMLElement); el.innerHTML = screenHtml(id, isOn(it)) })
}
/** A printer dropped on a computer: plugged into it (a computer has two ports), or out of it if it already was. */
const PORTS = 2
function plug(printer: Item, pc: Item) {
  if (printer.link === pc.id) { delete printer.link; toast('printer unplugged'); shop('menu'); return }
  if (s.items.filter(o => o.link === pc.id).length >= PORTS) { toast(`the ${look(pc).name.toLowerCase()} has no free port`); shop('bad'); return }
  printer.link = pc.id
  toast(`printer plugged into the ${look(pc).name.toLowerCase()}`)
  shop('menu')
}

/** The power switch: the property changes (the sprite on the field glows or goes dark), and the screen boots or goes black. */
function pressPower(id: number) {
  const it = find(s, id)
  if (!it) return
  const on = !isOn(it)
  if (on) it.props = { ...it.props, power: 'on' }
  else { delete it.props?.power; if (it.props && !Object.keys(it.props).length) delete it.props }
  shop(on ? 'powerOn' : 'powerOff')
  screenPower(id, on)
  changed(new Map())
}

// ---------------------------------------------------------------- the furnace's window: its iron front, the crucible, the firebox

/**
 * A furnace's window, drawn as the thing itself: a stovepipe with smoke when it burns, the iron front with its maker's plate,
 * the crucible in its arched firebrick mouth (glowing with the heat, sparks going up), the heat dial and a line saying what
 * it is doing, and under it the firebox behind its open door: the coal on a grate with flames over it. The crucible and the
 * firebox are places like any other; a match or a lighter dropped on the firebox lights it. How hot it is (`--heat`) and how
 * far along things are (`--done`) are set on the page as it burns, without drawing it again (paintHeat).
 */
function furnaceHtml(w: Win, z: number) {
  const it = find(s, w.id)!
  const slots = KINDS[it.kind].slots!
  const grid = (i: number) => `<div class="grid" data-grid data-space="${it.id}:${i}" data-w="${slots[i].w}" data-h="${slots[i].h}" style="--w:${slots[i].w};--h:${slots[i].h}">${inSpace(s, { host: it.id, slot: i }).map(itemHtml).join('')}</div>`
  const n = (k: number) => Array.from({ length: k }, (_, i) => `<i style="--i:${i}"></i>`).join('')
  return `<div class="win furnace${isLit(it) ? ' lit' : ''}" data-win="${it.id}" style="left:${w.x}px;top:${w.y}px;z-index:${10 + z};--heat:${(it.heat ?? 0).toFixed(3)}"><div class="win-head" data-whead style="--c:${swatch(it)}"><i></i><span>${esc(look(it).name)}</span><button data-wfold="${it.id}" title="Fold: keep just a tab along the top">–</button><button data-wclose="${it.id}" title="Close">✕</button></div>
    <div class="fz"><div class="fz-pipe"><span class="fz-smoke">${n(4)}</span></div>
      <div class="fz-body"><div class="fz-plate">MERROW FOUNDRY &middot; N&ordm; 2</div>
        <div class="fz-mouth"><div class="fz-glow"></div><div class="fz-sparks">${n(8)}</div>${grid(CRUCIBLE)}</div>
        <small class="fz-label">crucible &middot; two of one ore</small>
        <div class="fz-mid"><div class="fz-dial" title="How hot it is"><i></i><b></b></div><div class="fz-status" data-fstatus="${it.id}">${esc(furnaceSays(it))}</div></div>
        <div class="fz-firebox" data-ignite="${it.id}" title="Coal goes in here. Drop a match or a lighter on it to light it"><div class="fz-door"><i></i><i></i><i></i></div><div class="fz-fire">${grid(FIREBOX)}<div class="fz-flames">${n(6)}</div></div><div class="fz-grate"></div></div>
        <small class="fz-label">firebox &middot; coal</small></div>
      <div class="fz-feet"><i></i><i></i></div></div></div>`
}
/** What a furnace is doing, in a line. */
function furnaceSays(f: Item): string {
  const fuel = fuelIn(s, f).length, p = progress(s, f)
  const ores = inSpace(s, { host: f.id, slot: CRUCIBLE }).length
  const metal = p === null ? '' : look(charge(s, f)[0]).name.replace(/ ore$/i, '').toLowerCase()
  const last = fuel === 1 ? ' · last coal' : ''
  if (!isLit(f)) return !fuel ? 'cold. Coal in the firebox, then a match.' : p ? `out, the ${metal} ${Math.floor(p * 100)}% melted. Light it again.` : 'cold. Drop a match or a lighter on the firebox.'
  if (p === null) return (ores ? 'burning. It melts two lumps of the same ore.' : 'burning. Two lumps of ore go in the crucible.') + last
  return `melting ${metal}: ${Math.floor(p * 100)}%${last}`
}
/** As it burns: how hot each furnace is, how far along each thing in the fire is, and what each furnace's window says. */
function paintHeat() {
  for (const it of s.items) {
    if (it.heat === undefined) continue
    if (!isFurnace(it)) app.querySelector<HTMLElement>(`.item[data-id="${it.id}"]`)?.style.setProperty('--done', it.heat.toFixed(4))
  }
  for (const el of app.querySelectorAll<HTMLElement>('.win.furnace[data-win]')) {
    const f = find(s, +el.dataset.win!)
    if (!f) continue
    el.style.setProperty('--heat', (f.heat ?? 0).toFixed(3))
    const say = el.querySelector('[data-fstatus]')
    if (say) say.textContent = furnaceSays(f)
  }
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

/**
 * Draw something again without losing the field being typed in: whatever has focus and a `data-focus` key gets it back
 * afterwards, with its caret, selection and scroll (a computer's prompt or notes survive the field being redrawn); whatever
 * has a `data-scroll` key keeps how far it was scrolled (a page on the Wire).
 */
function keepFocus(draw: () => void) {
  const a = document.activeElement as HTMLInputElement | null, key = a?.dataset?.focus
  const was = key ? { s: a!.selectionStart, e: a!.selectionEnd, top: a!.scrollTop } : null
  const scrolled = [...document.querySelectorAll<HTMLElement>('[data-scroll]')].map(el => [el.dataset.scroll!, el.scrollTop] as const) // a page keeps its place
  draw()
  for (const [k, top] of scrolled) { const el = document.querySelector<HTMLElement>(`[data-scroll="${CSS.escape(k)}"]`); if (el) el.scrollTop = top }
  const b = key ? document.querySelector<HTMLInputElement>(`[data-focus="${key}"]`) : null
  if (!b || !was) return
  b.focus({ preventScroll: true })
  if (was.s !== null) b.setSelectionRange(was.s, was.e)
  b.scrollTop = was.top
}

/** Redraw everything; things that moved glide from where they were. */
function render(from = rects()) {
  document.querySelectorAll('.hl').forEach(el => el.remove()) // lights belong to a drag; none may outlive it
  setClock(app)
  keepFocus(() => app.innerHTML = `<div class="stage${s.out ? ' away' : ''}"><div class="center">${countersHtml()}<div class="field"><div class="grid" data-grid data-space="field" data-w="${W}" data-h="${H}" style="--w:${W};--h:${H}">${inSpace(s, null).map(itemHtml).join('')}</div></div><div class="toast" data-toast></div><aside class="side"${s.night ? ' hidden' : ''}>${sideHtml()}</aside>${s.night ? `<aside class="outing">${nightHtml()}</aside>` : ''}<aside class="lside">${cashHtml()}${dayHtml()}${trashHtml()}${dockHtml()}${youHtml()}</aside></div></div>${windowsHtml()}`)
  typeOn() // a line being typed carries on in the new terminal
  showToast()
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
  pruneScreens(id => { const it = find(s, id); return !!it && isOn(it) }) // a machine sold or cleared away stops booting
  cool(s) // ore taken out of a crucible starts again from cold
  save()
  render(from)
}

// ---------------------------------------------------------------- handling

/**
 * `uses` are the things the held one can be used on (`verb`: a vessel pours into them, a knife cuts them, a slice is laid on
 * them); `useOn` the one under the pointer now.
 */
interface Drag { held: Held; el: HTMLElement; gx: number; gy: number; rot: number; plan: Plan | null; key: string; hosts: Item[]; full: Item[]; blocked: Item | null; into: Item | null; space: Space; over: boolean; uses: Item[]; useOn: Item | null; verb: 'pour' | 'cut' | 'stack' | 'light' | 'plug' | 'load' | 'seal' | null }
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
  if (held.items.some(o => theirs(o.id) && !customer()!.brought.includes(o.id))) { press = null; notYours(); return } // out of a customer's container
  const el = document.body.appendChild(document.createElement('div'))
  el.className = 'floating'
  drag = { held, el, gx: press!.gx, gy: press!.gy, rot: held.item.rot, plan: null, key: '', hosts: [], full: [], blocked: null, into: null, space: null, over: false, uses: [], useOn: null, verb: null }
  const loose = held.items.some(o => theirs(o.id)) // a customer's things stay out of containers, theirs and yours
  if (!loose) for (const h of hostsFor(s, held.items)) if (!theirs(h.id)) (intoHost(s, held, h.id) ? drag.hosts : drag.full).push(h)
  const a = held.item, mine = (o: Item) => !theirs(o.id)
  const cold = KINDS[a.kind].lights ? s.items.filter(o => mine(o) && isFurnace(o) && !isLit(o)) : [] // a match, a lighter: furnaces to light
  if (held.items.length > 1 || theirs(a.id)) { /* a group, or a customer's thing: only moved */ }
  else if (cold.length) Object.assign(drag, { verb: 'light', uses: cold })
  else if (a.fill) Object.assign(drag, { verb: 'pour', uses: s.items.filter(o => mine(o) && canPour(a, o) > 0 && (!o.in || accepts(s, { ...o, fill: { liquid: a.fill!.liquid, amount: 1 } }, o.in))) }) // its slot must still take it full of that
  else if (KINDS[a.kind].cuts) Object.assign(drag, { verb: 'cut', uses: s.items.filter(o => mine(o) && (KINDS[o.kind].cut || sealed(o)) && o.id !== a.id) }) // a knife cuts food, and the tape on a box
  else if (KINDS[a.kind].printer) Object.assign(drag, { verb: 'plug', uses: s.items.filter(o => mine(o) && KINDS[o.kind].computer) }) // a printer goes on a computer to plug in (or out)
  else if (KINDS[a.kind].sheets) Object.assign(drag, { verb: 'load', uses: s.items.filter(o => mine(o) && KINDS[o.kind].printer && (o.paper ?? 0) < KINDS[o.kind].printer!) })
  else if (KINDS[a.kind].seals) Object.assign(drag, { verb: 'seal', uses: s.items.filter(o => mine(o) && isBox(o) && !sealed(o)) })
  else { const on = s.items.filter(o => mine(o) && (canStack(o, a) || KINDS[o.kind].cut?.keeps && KINDS[o.kind].cut!.into === a.kind && leftOf(o) < KINDS[o.kind].cut!.count)); if (on.length) Object.assign(drag, { verb: 'stack', uses: on }) } // bread on the field or a counter lays on a slice, or goes back into its bag
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
  // a match over a furnace window's firebox lights that furnace
  const ig = d.verb === 'light' ? document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-ignite]') : null
  const fire = ig && d.uses.find(o => o.id === +ig.dataset.ignite!)
  if (fire) {
    if (d.key === `ignite:${fire.id}`) return
    Object.assign(d, { key: `ignite:${fire.id}`, plan: null, into: null, blocked: null, over: true, useOn: fire })
    return paintGhosts(0, 0)
  }
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
  const useOn = d.uses.find(on) ?? null // a vessel dropped onto another pours into it, a knife onto cheese cuts it; either goes back where it was
  const host = useOn ? null : d.hosts.find(on) ?? null // dropped onto a container: goes inside it
  // over a container that would take it but is full: refused, and nothing gets shoved (one that never takes it is just another thing to rearrange)
  const blocked = host || useOn ? null : d.full.find(on) ?? null
  const key = `${spaceKey(sp)}:${x}:${y}:${d.rot}:${strictNow()}:${host?.id ?? ''}:${blocked?.id ?? ''}:${useOn?.id ?? ''}`
  if (key === d.key) return
  d.key = key
  d.over = true
  d.space = sp
  d.plan = host ? intoHost(s, d.held, host.id) : null
  d.into = d.plan ? host : null
  d.blocked = blocked
  d.useOn = useOn
  const shut = isSlot(sp) ? theirs(sp.host) || d.held.items.some(o => theirs(o.id)) : spaceKey(sp) === 'trash' && d.held.items.some(o => theirs(o.id))
  if (!d.plan && !blocked && !useOn && !shut) d.plan = planDrop(s, d.held, sp, x, y, d.rot, strictNow()) // nothing goes into a customer's container, nor any of theirs into one or the trash
  paintGhosts(x, y)
}

function clearGhosts() {
  document.querySelectorAll('.hl').forEach(el => el.remove())
  for (const el of app.querySelectorAll('.shoved')) el.classList.remove('shoved')
  for (const el of app.querySelectorAll('.ignite, .ignite-now')) el.classList.remove('ignite', 'ignite-now')
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
  const out: Light[] = [...d.hosts, ...d.uses].map(h => ({ sp: spaceOf(h), cells: absCells(h), kind: d.into?.id === h.id || d.useOn?.id === h.id ? 'usenow' : 'use' }))
  if (d.verb === 'light') for (const f of d.uses) app.querySelector(`[data-ignite="${f.id}"]`)?.classList.add(d.useOn?.id === f.id ? 'ignite-now' : 'ignite')
  if (d.useOn) { light(out); return }
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

/** A line under the field that says what just happened (for a few seconds, however often the page is drawn meanwhile). */
let toastTimer = 0
let toasting: string | null = null
function toast(text: string) {
  toasting = text
  showToast()
  clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => { toasting = null; app.querySelector('[data-toast]')?.classList.remove('on') }, 2600)
}
function showToast() {
  const el = app.querySelector<HTMLElement>('[data-toast]')
  if (!el || toasting === null) return
  el.textContent = toasting
  el.classList.add('on')
}

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

// ---------------------------------------------------------------- the day, and the trash

/** Which day it is, under the money. A day is one line of customers: when the last of them has gone, you sleep. */
const dayHtml = () => `<div class="daydial" title="A day is one line of customers: when the last has gone, you sleep, and the trash is taken out"><small>day</small>${String(s.day ?? 1).padStart(2, '0')}</div>`

/** The last customer of the line has gone: the door shuts and the evening begins (the night is outside, see `nightHtml`). */
function dayOver() {
  if (s.night || sleeping) return
  s.night = true
  youOpen = true
  shop('bell')
  toast('the line has gone: the night is yours')
  changed(new Map())
}
/** You sleep: the page goes dark, the trash is taken out, the carrier takes the dock's boxes, and it is the next day. */
let sleeping = false
function sleepNow(home = '') {
  if (sleeping) return
  sleeping = true
  const was = s.day ?? 1
  const shipped = ship(s) // the carrier takes the dock's sealed boxes tonight; they are paid for on delivery, in the morning
  const gone = sleep(s)
  const post = morning(s).filter(m => m.kind === 'order').length
  save()
  const night = document.body.appendChild(document.createElement('div'))
  night.className = 'night'
  night.innerHTML = `<div><b>day ${was} is over</b><span>you sleep</span></div>`
  const dark = night.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, easing: 'ease-in', fill: 'forwards' })
  dark.onfinish = () => {
    if (gone.length) shop('trash')
    changed(new Map()) // drawn again in the dark: the trash is out, the day moves on
    setTimeout(arrivals, 2100) // the morning's freight, once the lights are up
    const news = [home, gone.length && `the trash went out (${gone.length} thing${gone.length === 1 ? '' : 's'})`, shipped.boxes && `${shipped.boxes} box${shipped.boxes === 1 ? '' : 'es'} delivered: ${shipped.net}$`, post && `${post} new order${post === 1 ? '' : 's'} by mail`].filter(Boolean)
    night.querySelector('div')!.innerHTML = `<b>day ${s.day}</b><span>${news.join(' · ') || 'morning'}</span>`
    if (shipped.net) setTimeout(() => { setCash((s.cash ?? 0) + shipped.net); shop('coinsIn') }, 1400)
    night.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, delay: 1100, easing: 'ease-out', fill: 'forwards' }).onfinish = () => { night.remove(); sleeping = false }
  }
}

let trashOpen = ((): boolean => { try { return localStorage.getItem('trash-open') === '1' } catch { return false } })()
/** The trash button under the money and, open, the bin under it: a place like a counter, for things to be thrown away. */
function trashHtml() {
  const n = trash(s).length
  const button = `<button class="term-btn trash-btn${trashOpen ? ' on' : ''}" data-trash title="Things to throw away">${ICON_TRASH} trash${n ? ` <small>${n}</small>` : ''}</button>`
  if (!trashOpen) return button
  const { w, h } = PLACES.trash
  return `${button}<div class="bin"><div class="grid" data-grid data-space="trash" data-w="${w}" data-h="${h}" style="--w:${w};--h:${h}">${trash(s).map(itemHtml).join('')}</div></div>`
}
let dockOpen = ((): boolean => { try { return localStorage.getItem('dock-open') === '1' } catch { return false } })()
/**
 * The dock, under the trash: a place for boxes only (orders.ts). Sealed boxes with their slips go with the carrier at night
 * and are paid for on delivery; the line under it says what is ready and what it will pay.
 */
function dockHtml() {
  const boxes = inSpace(s, { at: 'dock' }), quotes = boxes.map(b => quote(s, b))
  const ready = quotes.filter(q => q?.ships), pays = ready.reduce((n, q) => n + q!.pay - q!.fee, 0)
  const button = `<button class="term-btn dock-btn${dockOpen ? ' on' : ''}" data-dock title="Boxes to ship: the carrier comes at night">&#9636; dock${boxes.length ? ` <small>${boxes.length}</small>` : ''}</button>`
  if (!dockOpen) return button
  const { w, h } = PLACES.dock
  const note = !boxes.length ? 'boxes only: sealed, with their slip' : `${ready.length} of ${boxes.length} ready${ready.length ? `, pays ${pays}$` : ''} · pickup tonight`
  return `${button}<div class="bin dock"><div class="grid" data-grid data-space="dock" data-w="${w}" data-h="${h}" style="--w:${w};--h:${h}">${boxes.map(itemHtml).join('')}</div><small class="dock-note">${note}</small></div>`
}
// ---------------------------------------------------------------- the night: outside (outside.ts)

let youOpen = ((): boolean => { try { return localStorage.getItem('you-open') === '1' } catch { return false } })()
/** You, under the dock: a body with two places, the pack on your back and the tool in your hand. Always open at night. */
function youHtml() {
  const pack = worn(s), tool = inHand(s), open = youOpen || !!s.night
  const button = `<button class="term-btn you-btn${open ? ' on' : ''}" data-you title="What you take out at night: a pack on your back, one tool in your hand">&#9673; you</button>`
  if (!open) return button
  const slot = (at: 'back' | 'hand', label: string) => { const { w, h } = PLACES[at]; return `<div class="body-slot"><small>${label}</small><div class="grid" data-grid data-space="${at}" data-w="${w}" data-h="${h}" style="--w:${w};--h:${h}">${inSpace(s, { at }).map(itemHtml).join('')}</div></div>` }
  const note = !pack ? 'no pack: nothing to carry finds in' : tool && nightsLeft(tool) !== null ? `${esc(look(tool).name.toLowerCase())}: ${nightsLeft(tool)} nights left in it` : tool ? `${esc(look(tool).name.toLowerCase())} in hand` : 'nothing in hand'
  return `${button}<div class="bin body">${slot('back', 'back')}${slot('hand', 'hand')}<small class="dock-note">${note}</small></div>`
}
/**
 * The night, where the customers' terminal was. In the evening, the map: each site with its searches (with what is in your
 * hand now), its lock, what it tends to turn up; go to one, or stay in and sleep. Out at a site: the ground, where each search
 * turns up a find to take into the pack (its window opens), the searches left, and the way home.
 */
function nightHtml() {
  const site = siteOf(s.out?.site), store = shopOf(s.out?.site)
  const { w, h } = PLACES.site
  const ground = (cls: string) => `<div class="bin ${cls}"><div class="grid" data-grid data-space="site" data-w="${w}" data-h="${h}" style="--w:${w};--h:${h}">${inSpace(s, { at: 'site' }).map(itemHtml).join('')}</div></div>`
  if (site && s.out) {
    const left = s.out.left
    return `<div class="night-head"><b>${esc(site.name)}</b><small>${esc(site.deck)} · night of day ${s.day ?? 1}</small></div><p class="night-desc">${esc(site.desc)}</p>
      ${ground('site')}<small class="dock-note">drag what you want into your pack; what is left here stays here</small>
      <div class="night-acts"><button class="term-btn" data-search${left ? '' : ' disabled'}>search <small>${left} left</small></button><button class="term-btn" data-home>go home and sleep</button></div>`
  }
  if (store && s.out) {
    return `<div class="night-head"><b>${esc(store.name)}</b><small>${esc(store.deck)} · night of day ${s.day ?? 1}</small></div><p class="night-desc">${esc(store.desc)}</p>
      ${ground('site shop')}<small class="dock-note">their counter: take a thing into your pack to buy it (back out, it is theirs again); lay one of yours down to sell it to them${buysText(store.buys) ? `: they buy ${buysText(store.buys)}` : ''}</small>
      <div class="night-acts"><button class="term-btn" data-home>go home and sleep</button></div>`
  }
  const lockText = (x: (typeof SITES)[number]) => x.lock ? ` · needs ${a(KINDS[x.lock.tool].name)}${x.lock.consume ? ' (used up)' : ''}` : ''
  const rows = SITES.map(x => {
    const why = barred(s, x), n = searchesFor(s, x), more = n - x.searches
    return `<div class="site-row${why ? ' shut' : ''}"><div><b>${esc(x.name)}</b> <small>${esc(x.deck)}</small></div>
      <small>${n} searches${more ? ` (+${more} with the ${esc(look(inHand(s)!).name.toLowerCase())})` : ''}${esc(lockText(x))}${x.bonus.length && !more ? ` · ${x.bonus.map(b => esc(a(KINDS[b.tool].name))).join(' or ')} finds more` : ''}</small>
      <small class="tends">tends to turn up ${esc(tends(x).join(', '))}</small>
      <button class="term-btn" data-go="${x.id}"${why ? ` disabled title="${esc(why)}"` : ` title="${esc(x.desc)}"`}>${why ? esc(why) : 'go'}</button></div>`
  }).join('')
  const shops = SHOPS.map(x => {
    const why = barred(s, x)
    return `<div class="site-row shop-row${why ? ' shut' : ''}"><div><b>${esc(x.name)}</b> <small>${esc(x.deck)} · a shop</small></div>
      ${x.sells.length ? `<small class="tends">sells ${esc(sells(x).join(', '))}</small>` : ''}<small>buys ${esc(buysText(x.buys))}</small>
      <button class="term-btn" data-go="${x.id}"${why ? ` disabled title="${esc(why)}"` : ''}>${why ? esc(why) : 'go'}</button></div>`
  }).join('')
  return `<div class="night-head"><b>night</b><small>day ${s.day ?? 1} · the door is shut</small></div><p class="night-desc">One outing tonight, with what is on you (under the dock): a site to scavenge, or a shop. Put a pack on your back and, if you have one, a tool in your hand.</p>${rows}<div class="night-sub">shops</div>${shops}<div class="night-acts"><button class="term-btn" data-stayin>stay in and sleep</button></div>`
}
const a = (name: string) => `${/^[aeiou]/i.test(name) ? 'an' : 'a'} ${name.toLowerCase()}`
/** What a shop buys, in words: "anything at 35% of its worth", "parts at 50%". */
function buysText(b: Buys) {
  const what = b.any ? 'anything' : [...(b.needs ?? []).map(n => n.replace(/^need_/, '')), ...(b.tags ?? []).map(t => `${t}s`)].join(' and ')
  return what ? `${what} at ${Math.round(b.mult * 100)}% of its worth` : ''
}
function goingOut(id: string) {
  const why = goOut(s, id)
  if (why) { toast(why); shop('bad'); return }
  shop('menu')
  pick([])
  changed(new Map())
  const pack = worn(s)
  if (pack && !winOf(pack.id)) openWindow(pack) // the pack opens: finds go in it
}
function searching() {
  const r = search(s)
  if (r === 'done') { toast('nothing left to search here tonight'); return }
  if (r === 'full') { toast('no room on the ground: take something, or leave it'); shop('bad'); return }
  sound(r[0], 'drop')
  toast(`${s.out!.left ? `${s.out!.left} left · ` : 'that was the last search · '}found ${named(r)}`)
  changed()
  r.forEach(it => pop(it))
}
function home() {
  const pack = worn(s), came = pack ? contents(s, pack.id).length : 0
  const { spent } = goHome(s)
  sleepNow([came ? `home with ${came} thing${came === 1 ? '' : 's'} in the pack` : 'home empty-handed', spent && `the ${look(spent).name.toLowerCase()} is worn through`].filter(Boolean).join(' · '))
}

const ICON_TRASH = '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2.5 4h11M6 4V2.5h4V4M4 4l.8 9.5h6.4L12 4M6.8 6.5v5M9.2 6.5v5"/></svg>'
function toggleTrash() {
  trashOpen = !trashOpen
  try { localStorage.setItem('trash-open', trashOpen ? '1' : '0') } catch { /* private window */ }
  shop('menu')
  render(new Map())
}
/** Is it in the trash, or inside something that is? */
const binned = (it: Item) => { let o: Item | undefined = it; while (o?.in) o = find(s, o.in.host); return o?.at === 'trash' }


// ---------------------------------------------------------------- money: a black dial with green digits, on the main screen

let cashShown = s.cash ?? START_CASH
let cashRaf = 0
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
  cancelAnimationFrame(cashRaf) // a count still going gives way to this one, from where it had got to
  s.cash = v
  save()
  const step = (t: number) => {
    const k = Math.min(1, (t - t0) / 700)
    cashShown = k < 1 ? from + (v - from) * (1 - (1 - k) ** 3) : v
    const el = app.querySelector('[data-cash]')
    if (el) el.innerHTML = cashText(cashShown)
    if (k < 1) cashRaf = requestAnimationFrame(step)
  }
  cashRaf = requestAnimationFrame(step)
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
  const a = d.held.item, b = d.useOn
  const was = b && drop && d.verb === 'pour' ? { liquid: a.fill!.liquid, a: level(a), b: level(b), n: 0 } : null
  let made: Item[] | null = null, laid = false, lit: ReturnType<typeof kindle> | null = null
  if (b && drop && d.verb === 'light') {
    lit = kindle(s, b)
    if (lit === 'lit' && a.kind === 'it_lux_match') remove(s, [a.id]) // a match is used up; a lighter goes back
    else putBack(d.held)
    shop(lit === 'lit' ? 'ignite' : 'bad')
  }
  else if (was && b) { was.n = pour(a, b); putBack(d.held); sound(a, 'use') }
  else if (b && drop && d.verb === 'stack' && KINDS[b.kind].cut?.keeps) { sound(a, 'drop'); laid = refill(s, b, a); if (!laid) { putBack(d.held); shop('bad') } } // back into its bag
  else if (b && drop && d.verb === 'stack') { sound(a, 'drop'); laid = stack(s, b, a); if (!laid) putBack(d.held) }
  else if (b && drop && d.verb === 'cut' && sealed(b)) { delete b.props!.tape; putBack(d.held); shop('cut'); laid = true } // the tape cut: the box opens
  else if (b && drop && d.verb === 'cut') { made = cut(s, b); putBack(d.held); if (made) shop('cut'); else shop('bad') }
  else if (b && drop && d.verb === 'plug') { putBack(d.held); plug(a, b) }
  else if (b && drop && d.verb === 'load') { b.paper = Math.min(KINDS[b.kind].printer!, (b.paper ?? 0) + KINDS[a.kind].sheets!); remove(s, [a.id]); sound(a, 'drop'); toast(`${b.paper} sheets in the printer`); laid = true }
  else if (b && drop && d.verb === 'seal') { b.props = { ...b.props, tape: 'sealed' }; s.windows = (s.windows ?? []).filter(w => w.id !== b.id); putBack(d.held); sound(b, 'drop'); laid = true }
  else if (drop && d.plan) {
    applyDrop(s, d.held, d.plan); sounds(d.held.items, 'drop')
    if (s.out?.buys) { // at a shop at night: what changed hands (outside.ts)
      const t = trade(s, d.held.items.map((it, i) => ({ it, from: d.held.froms[i].space })))
      const said = [t.bought.length && `bought ${t.bought.map(o => look(o).name.toLowerCase()).join(', ')} for ${t.cost}$`, t.back.length && `put back ${t.back.map(o => look(o).name.toLowerCase()).join(', ')}`, t.sold.length && `sold ${t.sold.map(x => x.name).join(', ')} for ${t.paid}$`].filter(Boolean)
      if (said.length) { const now = s.cash ?? 0; s.cash = now + t.cost - t.paid; setCash(now); toast(said.join(' · ')); shop(t.paid || t.cost < 0 ? 'coinsIn' : 'coinsOut') } // the dial counts from what it was
    }
  }
  else { putBack(d.held); if (drop && d.over) shop('bad'); else sounds(d.held.items, 'drop') }
  d.el.remove()
  changed(from)
  if (made) for (const p of made) pop(p)
  if (b && drop && d.verb === 'cut' && !made && !laid) toast('no room for the piece')
  if (lit) toast(lit === 'lit' ? `the ${look(b!).name.toLowerCase()} is lit` : 'nothing to burn: coal goes in the firebox')
  if (laid && b) pop(b, 0.92)
  if (was && b) {
    slosh(a, was.a, was.liquid)
    slosh(b, was.b, was.liquid)
    toast(`poured ${was.n} of ${LIQUIDS[was.liquid].name} into the ${look(b).name.toLowerCase()}`)
  }
  dropped()
}
/** Something new (or just changed) pops into place. */
const pop = (it: Item, from = 0.7) => app.querySelector(`.item[data-id="${it.id}"]`)?.animate([{ opacity: from < 0.9 ? 0 : 1, transform: `scale(${from})` }, { opacity: 1, transform: 'none' }], { duration: 220, easing: 'ease-out' })
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
  if (k.stack) parts.push(`${partsOf(it)} + ${value - partsOf(it)} for the making`)
  rows.push(`<div class="price"><span class="dollars">${value}$</span><small>${parts.join(', ') || 'worth'} · ${esc(k.cat ?? '')} · ${k.w}×${k.h}</small></div>`)
  const who = customerSays(it)
  if (who) rows.push(`<div class="who">${who}</div>`)
  if (l.desc) rows.push(`<p>${esc(l.desc)}</p>`)
  if (binned(it)) rows.push(`<div class="hint">in the trash</div>`)
  if (isContainer(it.kind) && !sealed(it)) rows.push(`<div class="hint">double-click to open</div>`)
  if (k.read) rows.push(`<div class="hint">double-click to read</div>`)
  if (k.stack) rows.push(`<div class="hint">${closed(it) ? 'finished' : 'double-click to take the top off'}</div>`)
  if (it.fill) rows.push(`<div class="hint">drop it on another bottle to pour</div>`)
  if (k.printer) rows.push(`<div class="spec">${it.paper ?? 0} sheet${it.paper === 1 ? '' : 's'} of paper (holds ${k.printer})<br>${it.link !== undefined && find(s, it.link) ? `plugged into the ${esc(look(find(s, it.link)!).name.toLowerCase())}` : 'not plugged in: drop it on a computer'}</div>`)
  if (it.print?.title && !it.print.job) rows.push(`<div class="spec">"${esc(it.print.title)}"${it.print.text ? `<br>${esc(it.print.text.slice(0, 90))}${it.print.text.length > 90 ? '...' : ''}` : ''}</div>`)
  if (it.print?.job !== undefined) { const m = s.mail?.find(x => x.id === it.print!.job); rows.push(`<div class="spec">order #${it.print.job}${m?.job ? `: ${esc(m.job.wants.map(w => `${w.n} × ${KINDS[w.kind].name.toLowerCase()}`).join(', '))} for ${esc(m.from.split(',')[0])}, due day ${m.job.due}` : ''}</div>`) }
  if (isBox(it)) { // interactive visibility: what this box would bring if it shipped tonight
    const q = quote(s, it), n = contents(s, it.id).length
    rows.push(`<div class="spec">${n ? `${n} thing${n === 1 ? '' : 's'} inside` : 'empty'}${q ? `<br>order #${q.mail.id}: ${q.have} of ${q.wanted} wanted${q.late ? ', late' : ''} · pays ${q.pay - q.fee}$ after the ${q.fee}$ fee` : n ? '<br>no slip inside: it will not ship' : ''}${sealed(it) ? '' : '<br>not taped: it will not ship'}</div>`)
  }
  if (it.listed) rows.push(`<div class="who">on Swapline at ${it.listed}$</div>`)
  if (it.sale !== undefined) rows.push(`<div class="who">${it.bought ? `bought for ${it.sale}$ (put it back to return it)` : `theirs: ${it.sale}$ (take it into your pack to buy it)`}</div>`)
  if (s.out?.buys && it.sale === undefined && it.in?.host === worn(s)?.id) { const f = floorFor(s.out.buys, it); rows.push(`<div class="who">${f === null ? 'they do not buy this' : `they would pay ${f}$`}</div>`) }
  if (nightsLeft(it) !== null) rows.push(`<div class="spec">good for ${nightsLeft(it)} more night${nightsLeft(it) === 1 ? '' : 's'} out in your hand</div>`)
  if (k.computer) { // what the machine has, and how full its disk is
    const used = SYSTEM_DISK + (it.drive ?? []).reduce((n, f) => n + (f.prog ? PROGRAMS[f.prog]?.size ?? 0 : f.pic !== undefined ? PIC_SIZE : textSize(f.text ?? '')), 0)
    rows.push(`<div class="spec">${k.computer.speed} MHz · ${kb(k.computer.memory)} memory · ${kb(k.computer.disk)} disk, ${kb(k.computer.disk - used)} free</div>`)
  }
  const disc = k.tags?.includes('disc') ? DISCS[propsOf(it).content] : null
  if (disc) { // what is on it: each program and text, and the pictures counted
    const pics = disc.files.filter(f => f.pic !== undefined)
    const lines = disc.files.filter(f => f.pic === undefined).map(f => { const p = programFile(f.name); return `${esc(f.name)} ${p ? `${kb(p.size)} · runs in ${p.memory}K, wants ${p.speed} MHz${p.licensed ? ' · licensed' : ''}` : kb(textSize(f.text))}` })
    if (pics.length) lines.push(`${pics.length} picture${pics.length === 1 ? '' : 's'}, ${kb(pics.length * PIC_SIZE)}`)
    rows.push(`<div class="spec">${lines.join('<br>')}</div>`)
  }
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
  spawn(kind, props, liquid, age) {
    const it = spawn(s, kind, null, props)
    if (!it) return false
    if (liquid !== undefined) fillWith(it, liquid || null)
    if (age) it.age = age
    sound(it, 'drop')
    changed()
    app.querySelector(`.item[data-id="${it.id}"]`)?.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], { duration: 180 })
    return true
  },
  addCash(n) { setCash((s.cash ?? 0) + n); shop('coinsIn') },
  clearField() { s.items = []; s.windows = []; selected = new Set(); changed(new Map()) },
  sleep: () => s.out ? home() : sleepNow(), // ends the day and the night now, whatever is going on
  newGame() { cancelAnimationFrame(cashRaf); s = start(); cashShown = s.cash!; selected = new Set(); restart(); changed(new Map()); reopen() },
})

// what a computer's screen needs from the page (computer.ts)
initComputer({
  state: () => s,
  disc: discIn,
  repaint: paintScreen,
  save,
  sound: name => shop(name),
  show(ids) {
    if (drag) return // the lights are the drag's
    document.querySelectorAll('.hl').forEach(el => el.remove())
    if (!ids) return
    light(ids.map(id => find(s, id)).filter((o): o is Item => !!o).map(o => ({ sp: spaceOf(o), cells: absCells(o), kind: 'usenow' })))
    document.querySelectorAll('.hl').forEach(el => el.classList.add('hl-find'))
  },
  cash: () => s.cash ?? 0,
  pay(n) {
    if ((s.cash ?? 0) < n) return false
    setCash((s.cash ?? 0) - n)
    shop('coinsOut')
    return true
  },
  printer: pc => s.items.find(o => KINDS[o.kind].printer && o.link === pc),
  printed(printer, job) { // the sheet comes out beside the printer: a slip for an order, a page or a picture otherwise
    const pr = find(s, printer.id)
    if (!pr) return false
    const p = pieceOf(s, job.job !== undefined ? 'it_tech_slip' : 'print', pr, [0, 1])
    if (!p) return false
    p.print = job
    if (job.pic) p.props = { face: 'picture' }
    pr.paper = (pr.paper ?? 1) - 1
    if (!pr.paper) delete pr.paper
    changed()
    pop(p)
    return true
  },
  art(g) { // as it would be made: a used thing as it is (a bread bag half eaten, a bottle half drunk), a new one full
    const k = KINDS[g.kind]
    const fill = g.fill === undefined ? (k.liquid && k.holds ? { liquid: k.liquid, amount: k.holds } : undefined) : g.fill ?? undefined
    const it: Item = { id: -1, kind: g.kind, x: 0, y: 0, rot: 0, ...(g.props ? { props: g.props } : {}), ...(fill ? { fill } : {}), ...(g.left !== undefined ? { left: g.left } : {}), ...(g.age ? { age: g.age } : {}) }
    return spriteHtml(it).replace(/--in\d+:0;?/g, '')
  },
})

// things bought on the Wire land when they come: a drone's when its time is up, freight in the morning (orders.ts)
function arrivals() {
  const came = deliver(s)
  if (!came.length) return
  const n = came.reduce((k, c) => k + c.items.length, 0)
  shop('bell')
  toast(`delivery: ${n} thing${n === 1 ? '' : 's'} from ${[...new Set(came.map(c => c.order.from))].join(', ')}${s.orders?.length ? ' (no room for the rest yet)' : ''}`)
  changed()
  for (const c of came) for (const it of c.items) pop(it)
}
setInterval(() => { if (!drag && !sleeping && s.orders?.length) arrivals() }, 1500)
// what is listed on Swapline sells in time (orders.ts): the courier takes it, the money comes
setInterval(() => {
  if (drag || sleeping || !s.items.some(o => o.listed)) return
  const sold = swapSales(s)
  if (!sold.length) return
  setCash((s.cash ?? 0) + sold.reduce((n, x) => n + x.net, 0))
  shop('coinsIn')
  toast(sold.map(x => `sold on Swapline: ${x.name.toLowerCase()} to ${x.who}, ${x.net}$`).join(' · '))
  changed()
}, 20_000)
if (!s.mail) { morning(s); save() } // the first morning's mail, for a game from before there was any

// what the terminal needs from the page (terminal.ts)
initTerminal({
  state: () => s,
  changed,
  rects,
  vanish,
  toast,
  setCash,
  sound,
  dragging: () => !!drag,
  paintDials,
  hideTip: () => tip.classList.remove('on'),
  dayOver,
  closed: () => !!s.night,
})

// ---------------------------------------------------------------- the fire: furnaces burn in real time while the page is open

let fireAt = performance.now(), savedAt = 0
setInterval(() => {
  const now = performance.now(), dt = Math.min(5, (now - fireAt) / 1000) // (a tab in the background ticks slowly: it catches up, a little)
  fireAt = now
  if (!s.items.some(o => isFurnace(o) && (isLit(o) || o.heat))) return
  const r = stoke(s, dt, drag ? drag.held.items.map(o => o.id) : []) // what is in hand is not burnt
  if (r.out.length) shop('fireOut')
  if (r.made.length) shop('smelted')
  else if (app.querySelector('.win.furnace.lit') && Math.random() < dt * 0.6) shop('crackle')
  if (r.changed && !drag) { // (while something is in hand, the page is drawn again when it is put down)
    changed()
    for (const bar of r.made) cast(bar)
    if (r.made.length) toast(`${r.made.length > 1 ? `${r.made.length} bars` : `a bar of ${look(r.made[0]).name.replace(/ ingot$/i, '').toLowerCase()}`} cast`)
    if (r.out.length) toast(`the ${look(r.out[0]).name.toLowerCase()} has gone out`)
    return
  }
  paintHeat()
  if (r.changed || now - savedAt > 2000) { savedAt = now; save() }
}, 100)
/** A bar just cast: white-hot, cooling to its own colour. */
function cast(bar: Item) {
  app.querySelector(`.item[data-id="${bar.id}"] .art`)?.animate([
    { filter: 'brightness(2.4) sepia(1) saturate(4) hue-rotate(-18deg) drop-shadow(0 0 7px #ffb347)', transform: 'translate(-50%, -50%) rotate(var(--r)) scale(1.06)' },
    { filter: 'brightness(1.4) sepia(.6) saturate(2.5) hue-rotate(-18deg) drop-shadow(0 0 4px #ff7a2a)', offset: 0.35 },
    { filter: 'none', transform: 'translate(-50%, -50%) rotate(var(--r))' },
  ], { duration: 3200, easing: 'ease-out' })
}

let resizing = 0
addEventListener('resize', () => {
  cancelAnimationFrame(resizing)
  resizing = requestAnimationFrame(() => { if (drag) finish(false); fit(); render(new Map()); fitStage(); keepOnScreen() })
})
fit()
render(new Map())
fitStage()
keepOnScreen()
resume() // a reload between someone stepping up and their unloading: they finish stepping up

app.addEventListener('click', e => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('button')
  if (!b) return
  if (b.dataset.wclose) { s.windows = (s.windows ?? []).filter(w => w.id !== +b.dataset.wclose!); changed(new Map()); return }
  if (b.dataset.wfold) { const w = winOf(+b.dataset.wfold); if (w) w.folded = true; changed(new Map()); return }
  if (b.dataset.wopen) { const it = find(s, +b.dataset.wopen); if (it) openWindow(it); return }
  if (b.dataset.wfull) { const w = winOf(+b.dataset.wfull); if (w) w.full = !w.full; shop('menu'); changed(new Map()); keepOnScreen(); return }
  if (b.dataset.power) { pressPower(+b.dataset.power); return }
  if ('trash' in b.dataset) { toggleTrash(); return }
  if ('you' in b.dataset) { if (s.night) return; youOpen = !youOpen; try { localStorage.setItem('you-open', youOpen ? '1' : '0') } catch { /* private window */ } shop('menu'); render(new Map()); return }
  if (b.dataset.go) { goingOut(b.dataset.go); return }
  if ('search' in b.dataset) { searching(); return }
  if ('home' in b.dataset) { home(); return }
  if ('stayin' in b.dataset) { sleepNow(); return }
  if ('dock' in b.dataset) { dockOpen = !dockOpen; try { localStorage.setItem('dock-open', dockOpen ? '1' : '0') } catch { /* private window */ } shop('menu'); render(new Map()); return }
})

/** Double-click a container to open its insides in a window beside it, or a book to read it. */
app.addEventListener('dblclick', e => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('.item[data-id]')
  const it = el && find(s, +el.dataset.id!)
  if (it && sealed(it)) { toast('taped shut: cut the tape with a knife to open it'); shop('bad'); return }
  if (it?.print?.text) { hideTip(); openReader({ id: `print-${it.id}`, title: it.print.title ?? 'A printed page', author: 'off the printer', cover: '#f2ece0', blurb: '', blocks: it.print.text.split(/\n{2,}/).map(p => ({ p })) }); return }
  if (it && isContainer(it.kind)) openWindow(it)
  else if (it && KINDS[it.kind].read && BOOKS[propsOf(it).title]) { hideTip(); openReader(BOOKS[propsOf(it).title]) }
  else if (it && KINDS[it.kind].stack && !closed(it) && theirs(it.id)) notYours()
  else if (it && KINDS[it.kind].cut?.keeps && theirs(it.id)) notYours()
  else if (it && KINDS[it.kind].cut?.keeps) { const p = cut(s, it)?.[0]; if (!p) { toast(leftOf(it) ? 'no room for it' : 'it is empty'); return } sound(p, 'lift'); hideTip(); changed(); pop(p) } // a slice out of its bag
  else if (it && KINDS[it.kind].stack && !closed(it)) { const p = unstack(s, it); if (!p) { toast('no room for it'); return } sound(p, 'lift'); hideTip(); changed(); pop(p) }
})
