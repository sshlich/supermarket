import './style.css'
import { applyDrop, cellsOf, dims, find, H, KINDS, lift, planDrop, putBack, start, W, type Held, type Item, type Plan, type State } from './world.ts'

const files = import.meta.glob<string>('./icons/*.svg', { query: '?raw', import: 'default', eager: true })
const ICON: Record<string, string> = Object.fromEntries(Object.entries(files).map(([p, svg]) => [p.slice('./icons/'.length, -'.svg'.length), svg]))

const SAVE = 'field-v1'
let s: State = load() ?? start()
let cell = 28

const app = document.getElementById('app')!

function load(): State | null {
  try { const v = JSON.parse(localStorage.getItem(SAVE) ?? 'null'); return v?.items ? v : null } catch { return null }
}
const save = () => { try { localStorage.setItem(SAVE, JSON.stringify(s)) } catch { /* private window */ } }

function fit() {
  cell = Math.floor(Math.max(16, Math.min(40, (innerWidth - 48) / W, (innerHeight - 90) / H)))
  document.documentElement.style.setProperty('--cell', `${cell}px`)
}

// ---------------------------------------------------------------- drawing

/** Horizontal runs of filled cells, so a silhouette is a handful of rectangles, not one per cell. */
function runs(cells: readonly (readonly [number, number])[]) {
  const rows = new Map<number, number[]>()
  for (const [x, y] of cells) rows.set(y, [...rows.get(y) ?? [], x])
  const out: [number, number, number][] = []
  for (const [y, xs] of rows) {
    xs.sort((a, b) => a - b)
    for (let i = 0, from = 0; i < xs.length; i++)
      if (i === xs.length - 1 || xs[i + 1] !== xs[i] + 1) { out.push([xs[from], y, xs[i] - xs[from] + 1]); from = i + 1 }
  }
  return out
}
/** A CSS mask that keeps exactly the filled cells: one silhouette, no seams. */
function maskOf(cells: readonly (readonly [number, number])[]) {
  const g = runs(cells).map(([x, y, n]) => `linear-gradient(#000 0 0) calc(var(--cell) * ${x}) calc(var(--cell) * ${y}) / calc(var(--cell) * ${n}) var(--cell) no-repeat`).join(',')
  return `-webkit-mask:${g};mask:${g}`
}

function itemHtml(it: Item) {
  const k = KINDS[it.kind]
  const d = dims(it)
  const cells = cellsOf(it)
  // a shaped thing's icon sits at the middle of its filled cells, not of its box
  const [ox, oy] = cells ? [cells.reduce((n, [x]) => n + x + 0.5, 0) / cells.length - d.w / 2, cells.reduce((n, [, y]) => n + y + 0.5, 0) / cells.length - d.h / 2] : [0, 0]
  const lo = Math.min(k.w, k.h)
  const m = lo * (1 + 0.25 * (Math.min(2, Math.max(k.w, k.h) / lo) - 1)) * (k.shape ? 0.85 : 1)
  return `<div class="item ${cells ? 'shaped' : ''}" data-id="${it.id}" style="--x:${it.x};--y:${it.y};--w:${d.w};--h:${d.h};--c:${k.color}">
    ${cells ? `<u class="body" style="${maskOf(cells)}"></u>` : ''}
    <div class="art" style="--kw:${k.w};--kh:${k.h};--m:${m};--r:${it.rot ? 90 : 0}deg;--ox:${ox};--oy:${oy}"><i>${ICON[k.icon] ?? ''}</i></div></div>`
}

/** Redraw everything; things that moved glide from where they were. */
function render(from = rects()) {
  app.innerHTML = `<div class="field" style="--w:${W};--h:${H}"><div class="grid" data-grid>${s.items.map(itemHtml).join('')}</div></div>`
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
  // Grab point measured from the item's footprint (the tile sits 1px inside it).
  press = { id: +el.dataset.id!, x: e.clientX, y: e.clientY, gx: e.clientX - r.left + 1, gy: e.clientY - r.top + 1 }
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
  if (k.w === k.h && !k.shape) return
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

function ghost(x: number, y: number, w: number, h: number, cls: string, cells: ReturnType<typeof cellsOf>) {
  const tiles = cells ? `<u class="gc" style="${maskOf(cells)}"></u>` : ''
  app.querySelector('.grid')!.insertAdjacentHTML('beforeend', `<div class="ghost ${cls} ${cells ? 'shaped' : ''}" style="--x:${x};--y:${y};--w:${w};--h:${h}">${tiles}</div>`)
}

function paintGhosts(x: number, y: number) {
  clearGhosts()
  const d = drag!
  const p = d.plan
  if (!p) {
    const dd = dims({ ...d.held.item, rot: d.rot })
    ghost(Math.max(0, Math.min(W - dd.w, x)), Math.max(0, Math.min(H - dd.h, y)), dd.w, dd.h, 'bad', cellsOf({ ...d.held.item, rot: d.rot }))
    return
  }
  const dd = dims({ ...d.held.item, rot: p.rot })
  ghost(p.x, p.y, dd.w, dd.h, 'land', cellsOf({ ...d.held.item, rot: p.rot }))
  for (const mv of p.moves) {
    const o = find(s, mv.id)!
    const md = dims({ ...o, rot: mv.rot })
    ghost(mv.x, mv.y, md.w, md.h, 'shove', cellsOf({ ...o, rot: mv.rot }))
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
