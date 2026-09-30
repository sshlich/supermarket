import './style.css'
import { applyDrop, boxOf, cellsOf, dims, find, H, KINDS, lift, planDrop, putBack, settle, spawn, start, W, type Held, type Item, type Plan, type State } from './world.ts'

// One SVG per kind in src/sprites/, drawn in the item's own footprint (see the editor: /editor.html).
const files = import.meta.glob<string>('./sprites/*.svg', { query: '?raw', import: 'default', eager: true })
const SPRITE: Record<string, string> = Object.fromEntries(Object.entries(files).map(([p, svg]) => [p.slice('./sprites/'.length, -'.svg'.length), svg]))

// When an item's data or a sprite changes, the game reloads itself; the sprite editor, which shares the files, is left alone.
if (import.meta.hot) {
  import.meta.hot.accept('./world.ts', () => location.reload())
  import.meta.hot.accept(() => location.reload()) // a sprite was saved or added (they are imported here); only this page reloads
}

const SAVE = 'field-v2'
let s: State = load() ?? start()
let cell = 28

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
  const hit = cells.map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1"/>`).join('') // whole cells, so there are no dead gaps between the squares
  return `<div class="item" data-id="${it.id}" style="--x:${it.x};--y:${it.y};--w:${d.w};--h:${d.h};--c:${k.color}">
    <svg viewBox="0 0 ${d.w} ${d.h}"><g class="sq">${squares}</g><g class="hit">${hit}</g></svg>
    <div class="art" style="--kw:${k.w};--kh:${k.h};--r:${it.rot ? 90 : 0}deg">${SPRITE[it.kind] ?? ''}</div></div>`
}

/** A row of buttons to put any kind of thing on the field, for trying new items out. */
function trayHtml() {
  return `<div class="tray"><span>put on the field</span>${Object.entries(KINDS).map(([id, k]) => `<button data-spawn="${id}" style="--c:${k.color}" title="${(k.desc ?? '').replace(/"/g, '&quot;')}"><i></i>${k.name}</button>`).join('')}<span class="grow"></span><button data-clear>clear the field</button><button data-reset>start over</button></div>`
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
  save()
  render(from)
}

// ---------------------------------------------------------------- handling

interface Drag { held: Held; el: HTMLElement; gx: number; gy: number; rot: boolean; plan: Plan | null; key: string }
let press: { id: number; x: number; y: number; gx: number; gy: number } | null = null
let drag: Drag | null = null
let last: PointerEvent | null = null

app.addEventListener('pointerdown', e => {
  if (e.button !== 0 || drag) return
  const el = (e.target as HTMLElement).closest<HTMLElement>('.item[data-id]')
  if (!el) return
  const r = el.getBoundingClientRect()
  // Grab point measured from the item's footprint.
  press = { id: +el.dataset.id!, x: e.clientX, y: e.clientY, gx: e.clientX - r.left, gy: e.clientY - r.top }
  e.preventDefault()
})

addEventListener('pointermove', e => {
  last = e
  if (press && !drag && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 4) begin()
  if (drag) move(e)
})

addEventListener('pointerup', () => {
  if (drag) finish(true)
  press = null
})

addEventListener('contextmenu', e => {
  if (!drag) return
  e.preventDefault()
  turn()
})

addEventListener('keydown', e => {
  if (drag && (e.key === 'r' || e.key === 'R')) turn()
  if (drag && e.key === 'Escape') finish(false)
})

function begin() {
  const held = lift(s, press!.id)
  if (!held) { press = null; return }
  const el = document.body.appendChild(document.createElement('div'))
  el.className = 'floating'
  drag = { held, el, gx: press!.gx, gy: press!.gy, rot: held.item.rot, plan: null, key: '' }
  press = null
  app.querySelector(`.item[data-id="${held.item.id}"]`)?.classList.add('lifted')
  paintFloating()
  document.body.classList.add('dragging')
}

function paintFloating() {
  const d = drag!
  d.el.innerHTML = itemHtml({ ...d.held.item, rot: d.rot, x: 0, y: 0 })
}

function turn() {
  const d = drag!
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
  const r = app.querySelector('.grid')!.getBoundingClientRect()
  const x = Math.round((e.clientX - d.gx - r.left) / cell)
  const y = Math.round((e.clientY - d.gy - r.top) / cell)
  const key = `${x}:${y}:${d.rot}`
  if (key === d.key) return
  d.key = key
  d.plan = planDrop(s, d.held, x, y, d.rot)
  paintGhosts(x, y)
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
    const dd = dims({ ...d.held.item, rot: d.rot })
    ghost(Math.max(0, Math.min(W - dd.w, x)), Math.max(0, Math.min(H - dd.h, y)), dd.w, dd.h, 'bad', shaped({ ...d.held.item, rot: d.rot }))
    return
  }
  const dd = dims({ ...d.held.item, rot: p.rot })
  ghost(p.x, p.y, dd.w, dd.h, 'land', shaped({ ...d.held.item, rot: p.rot }))
  for (const mv of p.moves) {
    const o = find(s, mv.id)!
    const md = dims({ ...o, rot: mv.rot })
    ghost(mv.x, mv.y, md.w, md.h, 'shove', shaped({ ...o, rot: mv.rot }))
    app.querySelector(`.item[data-id="${mv.id}"]`)?.classList.add('shoved')
  }
}

/** Let go: `drop` puts it where the ghost says, otherwise it goes back. */
function finish(drop: boolean) {
  const d = drag!
  drag = null
  document.body.classList.remove('dragging')
  const from = rects()
  from.set(d.held.item.id, d.el.firstElementChild!.getBoundingClientRect())
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
  else if ('clear' in b.dataset) { s.items = []; changed(new Map()) }
  else if ('reset' in b.dataset) { s = start(); changed(new Map()) }
})
