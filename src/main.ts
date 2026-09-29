import './style.css'
import { applyDrop, artOf, cellsOf, dims, find, H, KINDS, lift, planDrop, putBack, start, W, type Held, type Item, type Plan, type State } from './world.ts'

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

// Line glyphs as (north, east, south, west) strokes: 0 none, 1 single, 2 double. Drawn as vectors so they join across cells.
const SEG: Record<string, [number, number, number, number]> = {
  '─': [0, 1, 0, 1], '│': [1, 0, 1, 0], '┌': [0, 1, 1, 0], '┐': [0, 0, 1, 1], '└': [1, 1, 0, 0], '┘': [1, 0, 0, 1],
  '├': [1, 1, 1, 0], '┤': [1, 0, 1, 1], '┬': [0, 1, 1, 1], '┴': [1, 1, 0, 1], '┼': [1, 1, 1, 1],
  '═': [0, 2, 0, 2], '║': [2, 0, 2, 0], '╔': [0, 2, 2, 0], '╗': [0, 0, 2, 2], '╚': [2, 2, 0, 0], '╝': [2, 0, 0, 2],
  '╠': [2, 2, 2, 0], '╣': [2, 0, 2, 2], '╦': [0, 2, 2, 2], '╩': [2, 2, 0, 2], '╬': [2, 2, 2, 2],
  '╤': [0, 2, 1, 2], '╧': [1, 2, 0, 2], '╢': [2, 0, 2, 1], '╟': [2, 1, 2, 0], '╥': [0, 1, 2, 1], '╨': [2, 1, 0, 1],
  '╞': [1, 2, 1, 0], '╡': [1, 0, 1, 2], '╪': [1, 2, 1, 2], '╫': [2, 1, 2, 1],
}
const SW = 0.09 // stroke width, in cells
const D = 0.14 // half the gap of a double line

/** The path of one glyph in the cell at (x, y), in cell units; '' if it is drawn as text instead. */
function strokes(c: string, x: number, y: number): string {
  if (c === '/') return `M${x + 0.15} ${y + 0.85}L${x + 0.85} ${y + 0.15}`
  if (c === '\\') return `M${x + 0.15} ${y + 0.15}L${x + 0.85} ${y + 0.85}`
  const seg = SEG[c]
  if (!seg) return ''
  const [n, e, s, w] = seg
  const cx = x + 0.5, cy = y + 0.5
  const out: string[] = []
  const hd = e === 2 || w === 2, vd = n === 2 || s === 2
  if (e || w) {
    const half = vd ? D : SW / 2
    for (const side of hd ? [-1, 1] : [0]) {
      const y0 = cy + side * D
      const inner = (dir: number) => side === 0 || (dir > 0 ? (side < 0 ? n : s) : (side < 0 ? n : s)) // is the vertical on this line's side?
      const x1 = w ? x : cx + (inner(-1) && vd ? half : -half)
      const x2 = e ? x + 1 : cx + (inner(1) && vd ? -half : half)
      out.push(`M${x1} ${y0}H${x2}`)
    }
  }
  if (n || s) {
    const half = hd ? D : SW / 2
    for (const side of vd ? [-1, 1] : [0]) {
      const x0 = cx + side * D
      const inner = side === 0 || (side < 0 ? w : e)
      const y1 = n ? y : cy + (inner && hd ? half : -half)
      const y2 = s ? y + 1 : cy + (inner && hd ? -half : half)
      out.push(`M${x0} ${y1}V${y2}`)
    }
  }
  return out.join('')
}

/** One item: tinted rounded cells (like the grid's own squares) under its glyph drawing. */
function itemHtml(it: Item) {
  const k = KINDS[it.kind]
  const d = dims(it)
  const cells = cellsOf(it) ?? Array.from({ length: d.w * d.h }, (_, i) => [i % d.w, Math.floor(i / d.w)] as const)
  const art = artOf(it)
  let path = ''
  let text = ''
  art.forEach((row, y) => [...row].forEach((c, x) => {
    if (c === ' ') return
    const p = strokes(c, x, y)
    if (p) path += p
    else text += `<text x="${x + 0.5}" y="${y + 0.5}">${c === '<' ? '&lt;' : c === '&' ? '&amp;' : c}</text>`
  }))
  const squares = cells.map(([x, y]) => `<rect x="${x + 0.1}" y="${y + 0.1}" width="0.8" height="0.8" rx="0.08"/>`).join('')
  const hit = cells.map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1"/>`).join('') // whole cells, so there are no dead gaps between the squares
  return `<div class="item" data-id="${it.id}" style="--x:${it.x};--y:${it.y};--w:${d.w};--h:${d.h};--c:${k.color}">
    <svg viewBox="0 0 ${d.w} ${d.h}"><g class="sq">${squares}</g><path d="${path}"/>${text}<g class="hit">${hit}</g></svg></div>`
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
  const tiles = cells ? cells.map(([cx, cy]) => `<u class="gc" style="--cx:${cx};--cy:${cy}"></u>`).join('') : ''
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
