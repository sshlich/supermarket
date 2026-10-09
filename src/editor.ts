// The sprite editor: pick an item, build its drawing from shapes and effects (or edit the SVG), see it on the field exactly
// as the game draws it, save. Everything you do writes plain SVG into the source tab, so you can always read what it did.
import './style.css'
import './editor.css'
import { KINDS, kindCells } from './world.ts'
import { I, SHAPES, about, fmt, invert, move, mul, nearestSegment, parsePath, parsePoints, pathBounds, pathString, point, pointsAttr, scale, simplify, smoothPath, snapTo, splitSubpaths, transformAttr, turn, type M, type P, type Seg, type Shape } from './editor/geom.ts'

// Saving an item's size, name or colour rewrites kinds.json; the editor already holds the new values, so it should not reload.
if (import.meta.hot) import.meta.hot.accept('./world.ts', () => {})

const NS = 'http://www.w3.org/2000/svg'
const UNIT = 32 // sprite units per cell (see scripts/sprite.ts)
let ids = Object.keys(KINDS)
const NOT_DRAWN = ['defs', 'title', 'desc', 'style', 'metadata']

// ---------------------------------------------------------------- state

const saved: Record<string, string> = {} // what is on disk
const draft: Record<string, string> = {} // what is in the editor
const hist: Record<string, { stack: string[]; at: number; t: number }> = {}
const color: Record<string, string> = Object.fromEntries(ids.map(id => [id, KINDS[id].color])) // preview only
let cur = ids[0]
let sel: number | null = null // index among the drawn children of the sprite
let rot = false
let zoom = 56
let snap = 4 // units; 32 is a whole cell
let guides = { cells: true, units: false, box: true }
let tab: 'item' | 'props' | 'add' | 'fx' | 'ops' | 'lib' | 'src' = 'item'
let tool: 'select' | 'dots' | 'line' | 'free' = 'select'
let pen: { pts: P[]; hover: P | null } | null = null
let penWidth = 4
let penDetail = 1.5
let penSmooth = false
let libImports: { name: string; svg: string }[] = []
let iconResults: { name: string; svg: string }[] = []
let iconQuery = ''
let iconSet = 'game-icons'
let sets: { id: string; name: string; style: string; license: string; total: number }[] = []
let recolor = true
let fitPct = 80
let autosave = false
let newFill = 'currentColor'
let shape = 'rect'
let lockRatio = true
const shapeParams: Record<string, Record<string, number | string>> = {}
let live: SVGSVGElement | null = null // the sprite as drawn in the big preview: the thing operations change
let saveTimer = 0
let ready = false // every sprite has loaded
let autoFit = true // the big picture takes all the room there is, until you set the zoom yourself
const ui: { left: boolean; right: boolean; folds: Record<string, boolean> } = (() => {
  try { return { left: false, right: false, folds: {}, ...JSON.parse(localStorage.getItem('sprite-editor-ui') ?? '{}') } } catch { return { left: false, right: false, folds: {} } }
})()
const saveUi = () => { try { localStorage.setItem('sprite-editor-ui', JSON.stringify(ui)) } catch { /* private window */ } }

const root = document.getElementById('ed')!
const $ = <T extends Element>(sel: string) => root.querySelector<T>(sel)!
const api = (path: string, kind: string, init?: RequestInit) => fetch(`/__sprites${path}?kind=${kind}`, init).then(r => r.ok ? r.text() : Promise.reject(new Error(`${r.status} ${r.statusText}`)))
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
const dirty = (id: string) => draft[id] !== saved[id]
const vbox = (id: string) => ({ w: KINDS[id].w * UNIT, h: KINDS[id].h * UNIT })

// ---------------------------------------------------------------- reading and writing the sprite

/** Is this text an SVG the browser can draw? Returns the problem, or ''. */
function problem(text: string) {
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml')
  const err = doc.querySelector('parsererror')
  if (err) return err.textContent!.split('\n')[0]
  return doc.documentElement.tagName === 'svg' ? '' : 'the root element must be <svg>'
}

const drawn = (svg: SVGSVGElement) => [...svg.children].filter(e => !NOT_DRAWN.includes(e.localName)) as SVGGraphicsElement[]
const selEl = () => (live && sel !== null ? drawn(live)[sel] ?? null : null)

/** The sprite as text again: tidy, one element per line, editor bookkeeping and unused definitions gone. */
function serialize(svg: SVGSVGElement): string {
  const c = svg.cloneNode(true) as SVGSVGElement
  c.removeAttribute('data-live')
  for (const e of c.querySelectorAll('[data-i]')) e.removeAttribute('data-i')
  const text = new XMLSerializer().serializeToString(c)
  const used = (id: string) => text.split(`url(#${id})`).length > 1 || text.includes(`href="#${id}"`)
  for (const d of [...c.querySelectorAll('defs > *')]) if (d.id && !used(d.id)) d.remove()
  for (const d of [...c.querySelectorAll('defs')]) if (!d.children.length) d.remove()
  const attrs = [`xmlns="${NS}"`, ...[...c.attributes].filter(a => a.name !== 'xmlns').map(a => `${a.name}="${esc(a.value)}"`)].join(' ')
  const xs = new XMLSerializer()
  const kids = [...c.children].map(k => `  ${xs.serializeToString(k).replace(/ xmlns="[^"]*"/g, '')}`)
  return `<svg ${attrs}>\n${kids.join('\n')}\n</svg>\n`
}

function setDraft(text: string, coalesce = false) {
  if (text === draft[cur]) return
  const h = hist[cur]
  const now = Date.now()
  if (coalesce && now - h.t < 700 && h.at === h.stack.length - 1) h.stack[h.at] = text
  else { h.stack.length = h.at + 1; h.stack.push(text); h.at++; if (h.stack.length > 120) { h.stack.shift(); h.at-- } }
  h.t = now
  draft[cur] = text
  try { dirty(cur) ? localStorage.setItem(`sprite-draft:${cur}`, text) : localStorage.removeItem(`sprite-draft:${cur}`) } catch { /* private window */ }
  if (autosave) { clearTimeout(saveTimer); saveTimer = window.setTimeout(save, 500) }
}

/** Something changed the live sprite: write it back into the text and redraw. */
function commit() {
  if (!live) return
  setDraft(serialize(live))
  paint()
}

function undo(step: number) {
  const h = hist[cur]
  const at = h.at + step
  if (at < 0 || at >= h.stack.length) return
  h.at = at
  draft[cur] = h.stack[at]
  paint()
}

async function save() {
  if (problem(draft[cur])) return
  const status = $('[data-status]')
  try {
    await api('/save', cur, { method: 'POST', body: draft[cur] })
    saved[cur] = draft[cur]
    try { localStorage.removeItem(`sprite-draft:${cur}`) } catch { /* private window */ }
    const hidden = live ? drawn(live).filter(e => e.getAttribute('display') === 'none').length : 0
    status.textContent = hidden ? `saved · ${hidden} hidden layer${hidden > 1 ? 's are' : ' is'} saved hidden` : 'saved to the game'
    paint(false)
  } catch (e) { status.textContent = `not saved: ${(e as Error).message}` }
  setTimeout(() => { status.textContent = '' }, 2500)
}

// ---------------------------------------------------------------- geometry of the selection

type Box = { x: number; y: number; w: number; h: number }
const unitsOf = (x: number, y: number): [number, number] => { const p = new DOMPoint(x, y).matrixTransform(live!.getScreenCTM()!.inverse()); return [p.x, p.y] }

/** A box seen through a matrix: the smallest upright box that holds its four transformed corners. */
function mapBox(m: M, b: Box): Box {
  const xs: number[] = [], ys: number[] = []
  for (const [x, y] of [[b.x, b.y], [b.x + b.w, b.y], [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]] as const) { const p = point(m, x, y); xs.push(p[0]); ys.push(p[1]) }
  const x = Math.min(...xs), y = Math.min(...ys)
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y }
}
const unionBox = (a: Box, b: Box): Box => {
  const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y)
  return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y }
}

const parsed = new Map<string, Seg[]>()
/** A path's `d` parsed once and remembered, so repainting never parses it again. */
function segsOf(d: string): Seg[] {
  let s = parsed.get(d)
  if (!s) { s = parsePath(d); if (parsed.size > 300) parsed.clear(); parsed.set(d, s) }
  return s
}

/** Points along a simple element's outline, in its own coordinates (paths are measured exactly, elsewhere). */
function localPoints(el: Element): P[] | null {
  const tag = el.localName
  const num = (n: string) => +(el.getAttribute(n) ?? 0) || 0
  try {
    if (tag === 'polygon' || tag === 'polyline') return parsePoints(el.getAttribute('points') ?? '')
    if (tag === 'line') return [[num('x1'), num('y1')], [num('x2'), num('y2')]]
    if (tag === 'rect') { const x = num('x'), y = num('y'), w = num('width'), h = num('height'); return [[x, y], [x + w, y], [x, y + h], [x + w, y + h]] }
    if (tag === 'circle' || tag === 'ellipse') {
      const rx = tag === 'circle' ? num('r') : num('rx'), ry = tag === 'circle' ? num('r') : num('ry')
      return Array.from({ length: 48 }, (_, i) => [num('cx') + rx * Math.cos((i / 48) * 2 * Math.PI), num('cy') + ry * Math.sin((i / 48) * 2 * Math.PI)] as P)
    }
    const g = (el as SVGGraphicsElement).getBBox()
    return [[g.x, g.y], [g.x + g.width, g.y], [g.x, g.y + g.height], [g.x + g.width, g.y + g.height]]
  } catch { return null }
}

/** The tight box of what an element really draws, seen through the matrix `m` (its own transform, and its parents'). Groups add up their children. */
function inkBox(el: Element, m: M): Box | null {
  const tag = el.localName
  if (NOT_DRAWN.includes(tag) || el.getAttribute('display') === 'none') return null
  if (tag === 'g' || tag === 'svg') {
    let out: Box | null = null
    for (const c of el.children) {
      const cb = inkBox(c, mul(m, matrixOf(c as SVGGraphicsElement)))
      if (cb) out = out ? unionBox(out, cb) : cb
    }
    return out
  }
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
  if (tag === 'path') {
    const pb = pathBounds(segsOf(el.getAttribute('d') ?? ''), m)
    if (!pb) return null
    x0 = pb.x; y0 = pb.y; x1 = pb.x + pb.w; y1 = pb.y + pb.h
  } else {
    const pts = localPoints(el)
    if (!pts || !pts.length) return null
    for (const [px, py] of pts) { const [x, y] = point(m, px, py); if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y }
  }
  const stroke = el.getAttribute('stroke')
  const half = stroke && stroke !== 'none' ? ((+(el.getAttribute('stroke-width') ?? 1) || 0) / 2) * Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])) : 0
  return { x: x0 - half, y: y0 - half, w: x1 - x0 + 2 * half, h: y1 - y0 + 2 * half }
}

/** An element's box in sprite units, wherever it has been moved, turned or scaled to. */
function bbox(el: Element): Box {
  const ink = inkBox(el, matrixOf(el as SVGGraphicsElement))
  if (ink) return ink
  const r = el.getBoundingClientRect()
  const pts = [unitsOf(r.left, r.top), unitsOf(r.right, r.top), unitsOf(r.left, r.bottom), unitsOf(r.right, r.bottom)]
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1])
  const x = Math.min(...xs), y = Math.min(...ys)
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y }
}
const matrixOf = (el: SVGGraphicsElement): M => {
  const l = el.transform.baseVal
  const m = l.numberOfItems ? l.consolidate()!.matrix : null
  return m ? [m.a, m.b, m.c, m.d, m.e, m.f] : [...I]
}
function setMatrix(el: Element, m: M) {
  const a = transformAttr(m)
  if (a) el.setAttribute('transform', a)
  else el.removeAttribute('transform')
}
/** Do `m` (about the box centre, unless told otherwise) to the selected element. */
function transformSel(m: M, at?: [number, number]) {
  const el = selEl()
  if (!el) return
  const b = bbox(el)
  const [cx, cy] = at ?? [b.x + b.w / 2, b.y + b.h / 2]
  setMatrix(el, mul(about(m, cx, cy), matrixOf(el)))
}

// ---------------------------------------------------------------- painting: fills, strokes, effects

/** Set a presentation attribute on an element and, for a group, on everything inside that already sets it itself. */
function paintAttr(el: Element, name: string, value: string | null) {
  const apply = (e: Element) => value === null ? e.removeAttribute(name) : e.setAttribute(name, value)
  apply(el)
  if (el.localName === 'g') for (const e of el.querySelectorAll(`[${name}]`)) apply(e)
}
const attrOf = (el: Element, name: string) => el.getAttribute(name) ?? el.querySelector(`[${name}]`)?.getAttribute(name) ?? ''

function svgNode(markup: string): Element {
  const t = document.createElementNS(NS, 'svg')
  t.innerHTML = markup
  return t.firstElementChild!
}
function defs() {
  const found = live!.querySelector(':scope > defs')
  if (found) return found
  const d = document.createElementNS(NS, 'defs')
  live!.insertBefore(d, live!.firstChild)
  return d
}
/** An id no other part of any sprite uses (they all share one page in the game). */
function uid(base: string) {
  let n = 1
  while (live!.querySelector(`#${cur}-${base}-${n}`)) n++
  return `${cur}-${base}-${n}`
}
/** Add a definition (filter, gradient, pattern) and return the url() that refers to it. */
function define(base: string, make: (id: string) => string) {
  const id = uid(base)
  defs().appendChild(svgNode(make(id)))
  return `url(#${id})`
}

const EFFECTS: Record<string, { label: string; hint: string; apply(el: Element, k: number): void }> = {
  glow: { label: 'Glow', hint: 'a soft halo in the item colour', apply: (el, k) => el.setAttribute('filter', define('glow', id => `<filter id="${id}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur in="SourceGraphic" stdDeviation="${k}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`)) },
  shadow: { label: 'Drop shadow', hint: 'dark shadow underneath', apply: (el, k) => el.setAttribute('filter', define('shadow', id => `<filter id="${id}" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="${k / 2}" dy="${k / 2}" stdDeviation="${k / 2}" flood-color="#000" flood-opacity=".65"/></filter>`)) },
  blur: { label: 'Blur', hint: 'soften everything', apply: (el, k) => el.setAttribute('filter', define('blur', id => `<filter id="${id}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="${k}"/></filter>`)) },
  linear: { label: 'Fade top → bottom', hint: 'fill fades out downwards', apply: el => paintAttr(el, 'fill', define('fade', id => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor"/><stop offset="1" stop-color="currentColor" stop-opacity=".2"/></linearGradient>`)) },
  radial: { label: 'Fade from centre', hint: 'fill fades out towards the edge', apply: el => paintAttr(el, 'fill', define('spot', id => `<radialGradient id="${id}"><stop offset="0" stop-color="currentColor"/><stop offset="1" stop-color="currentColor" stop-opacity=".15"/></radialGradient>`)) },
  hatch: { label: 'Hatching', hint: 'diagonal lines instead of a solid fill', apply: (el, k) => paintAttr(el, 'fill', define('hatch', id => `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${k}" height="${k}" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="${k}" stroke="currentColor" stroke-width="${fmt(k / 3)}"/></pattern>`)) },
  outline: { label: 'Outline only', hint: 'no fill, just the edge', apply: (el, k) => { paintAttr(el, 'fill', 'none'); paintAttr(el, 'stroke', 'currentColor'); paintAttr(el, 'stroke-width', String(k)) } },
  dashed: { label: 'Dashed edge', hint: 'stroke as dashes', apply: (el, k) => { paintAttr(el, 'stroke', attrOf(el, 'stroke') && attrOf(el, 'stroke') !== 'none' ? attrOf(el, 'stroke') : 'currentColor'); paintAttr(el, 'stroke-width', attrOf(el, 'stroke-width') || '2'); paintAttr(el, 'stroke-dasharray', `${k} ${k}`) } },
  twin: { label: 'Shadow copy', hint: 'a dim copy behind, nudged aside', apply: (el, k) => { const c = el.cloneNode(true) as SVGGraphicsElement; c.removeAttribute('filter'); c.setAttribute('opacity', '.35'); setMatrix(c, mul(move(k, k), matrixOf(c))); el.parentNode!.insertBefore(c, el); sel = sel === null ? null : sel + 1 } },
  clear: { label: 'Remove effects', hint: 'back to a plain solid fill', apply: el => { el.removeAttribute('filter'); paintAttr(el, 'stroke-dasharray', null); if (attrOf(el, 'fill').startsWith('url(')) paintAttr(el, 'fill', 'currentColor') } },
}
const effectParams: Record<string, { label: string; value: number; min: number; max: number }> = {
  glow: { label: 'strength', value: 2.5, min: 0.5, max: 8 }, shadow: { label: 'distance', value: 3, min: 1, max: 10 }, blur: { label: 'amount', value: 1.5, min: 0.3, max: 6 },
  hatch: { label: 'spacing', value: 6, min: 3, max: 16 }, outline: { label: 'thickness', value: 3, min: 1, max: 12 }, dashed: { label: 'dash', value: 5, min: 2, max: 14 }, twin: { label: 'offset', value: 3, min: 1, max: 12 },
}
const fxValue: Record<string, number> = Object.fromEntries(Object.entries(effectParams).map(([k, v]) => [k, v.value]))

// ---------------------------------------------------------------- operations on the selection

const boxOfSprite = (): Box => ({ x: 0, y: 0, ...vbox(cur) })
function align(where: string) {
  const el = selEl()
  if (!el) return
  const b = bbox(el), f = boxOfSprite()
  const dx = where === 'left' ? f.x - b.x : where === 'right' ? f.x + f.w - (b.x + b.w) : where === 'hcenter' ? f.x + f.w / 2 - (b.x + b.w / 2) : 0
  const dy = where === 'top' ? f.y - b.y : where === 'bottom' ? f.y + f.h - (b.y + b.h) : where === 'vcenter' ? f.y + f.h / 2 - (b.y + b.h / 2) : 0
  setMatrix(el, mul(move(dx, dy), matrixOf(el)))
}
function fitToFootprint() {
  const el = selEl()
  if (!el) return
  const b = bbox(el), f = boxOfSprite()
  const s = Math.min((f.w * 0.9) / b.w, (f.h * 0.9) / b.h)
  transformSel(scale(s))
  align('hcenter'); align('vcenter')
}
function duplicate(mirror?: 'h' | 'v') {
  const el = selEl()
  if (!el || !live) return
  const c = el.cloneNode(true) as SVGGraphicsElement
  el.after(c)
  const f = boxOfSprite()
  if (mirror === 'h') setMatrix(c, mul(about(scale(-1, 1), f.w / 2, 0), matrixOf(c)))
  else if (mirror === 'v') setMatrix(c, mul(about(scale(1, -1), 0, f.h / 2), matrixOf(c)))
  else setMatrix(c, mul(move(snap * 2, snap * 2), matrixOf(c)))
  sel = drawn(live).indexOf(c)
}
function zorder(how: 'front' | 'forward' | 'backward' | 'back') {
  const el = selEl()
  if (!el || !live) return
  const all = drawn(live)
  const at = all.indexOf(el)
  const to = how === 'front' ? all.length - 1 : how === 'back' ? 0 : Math.max(0, Math.min(all.length - 1, at + (how === 'forward' ? 1 : -1)))
  if (to === at) return
  const other = all[to]
  if (to > at) other.after(el); else other.before(el)
  sel = to
}
function ungroup() {
  const el = selEl()
  if (!el || el.localName !== 'g' || !live) return
  const g = matrixOf(el)
  const first = drawn(live).indexOf(el)
  const kids = [...el.children] as SVGGraphicsElement[]
  for (const k of kids) { setMatrix(k, mul(g, matrixOf(k))); el.before(k) }
  el.remove()
  sel = first
}
function remove() {
  const el = selEl()
  if (!el || !live) return
  el.remove()
  const n = drawn(live).length
  sel = n ? Math.min(sel!, n - 1) : null
}

/** Polygon or polyline -> a smooth curve through the same points. */
function smoothSel() {
  const el = selEl()
  if (!isPoly(el)) return
  const closed = el.localName === 'polygon'
  const pts = parsePoints(el.getAttribute('points') ?? '')
  const p = document.createElementNS(NS, 'path')
  for (const a of [...el.attributes]) if (a.name !== 'points') p.setAttribute(a.name, a.value)
  p.setAttribute('d', smoothPath(pts, closed))
  el.replaceWith(p)
}
function simplifySel() {
  const el = selEl()
  if (!isPoly(el)) return
  const closed = el.localName === 'polygon'
  const pts = parsePoints(el.getAttribute('points') ?? '')
  const s = simplify(closed ? [...pts, pts[0]] : pts, 1.2)
  el.setAttribute('points', pointsAttr(closed ? s.slice(0, -1) : s))
}

/** Pull a compound path (one `d` with several shapes in it) into separate paths, one per shape, so pieces can be deleted, moved or coloured on their own. */
function breakApart() {
  const el = selEl()
  if (!el || !live) return
  let first: Element | null = null
  const split = (p: Element) => {
    if (p.localName !== 'path') return
    const subs = splitSubpaths(parsePath(p.getAttribute('d') ?? ''))
    if (subs.length < 2) return
    for (const sub of subs) { const c = p.cloneNode(false) as Element; c.setAttribute('d', pathString(sub)); p.before(c); first ??= c }
    p.remove()
  }
  if (el.localName === 'path') { split(el); if (first) sel = Math.max(0, drawn(live).indexOf(first as SVGGraphicsElement)) }
  else { for (const p of [...el.querySelectorAll('path')]) split(p); if (el.localName === 'g') ungroup() } // pieces of a group become layers of their own
}

const OPS: Record<string, { label: string; run(): void }> = {
  breakApart: { label: '✂ Break into pieces', run: breakApart },
  flipH: { label: '⇋ Flip left–right', run: () => transformSel(scale(-1, 1)) },
  flipV: { label: '⇅ Flip up–down', run: () => transformSel(scale(1, -1)) },
  rotL: { label: '⟲ Turn left 15°', run: () => transformSel(turn(-15)) },
  rotR: { label: '⟳ Turn right 15°', run: () => transformSel(turn(15)) },
  rot90: { label: '⟳ Turn 90°', run: () => transformSel(turn(90)) },
  bigger: { label: '＋ Bigger', run: () => transformSel(scale(1.1)) },
  smaller: { label: '－ Smaller', run: () => transformSel(scale(0.9)) },
  fit: { label: '⤢ Fit to the footprint', run: fitToFootprint },
  hcenter: { label: 'Centre across', run: () => align('hcenter') },
  vcenter: { label: 'Centre down', run: () => align('vcenter') },
  left: { label: 'To the left edge', run: () => align('left') },
  right: { label: 'To the right edge', run: () => align('right') },
  top: { label: 'To the top edge', run: () => align('top') },
  bottom: { label: 'To the bottom edge', run: () => align('bottom') },
  mirrorH: { label: 'Mirror copy, left–right', run: () => duplicate('h') },
  mirrorV: { label: 'Mirror copy, up–down', run: () => duplicate('v') },
  dup: { label: '⧉ Duplicate', run: () => duplicate() },
  front: { label: 'Bring to front', run: () => zorder('front') },
  forward: { label: 'Forward one', run: () => zorder('forward') },
  backward: { label: 'Back one', run: () => zorder('backward') },
  back: { label: 'Send to back', run: () => zorder('back') },
  ungroup: { label: 'Ungroup', run: ungroup },
  smooth: { label: '〰 Smooth into a curve', run: smoothSel },
  simplify: { label: '◇ Fewer points', run: simplifySel },
  del: { label: '🗑 Delete', run: remove },
}

function addShape() {
  if (!live) return
  const s: Shape = SHAPES[shape]
  const p = { ...Object.fromEntries(s.params.map(q => [q.key, 'value' in q ? q.value : q.text])), ...shapeParams[shape] }
  const { w, h } = vbox(cur)
  live.appendChild(svgNode(s.make(p, w / 2, h / 2, newFill)))
  sel = drawn(live).length - 1
  commit()
}

/** Start this sprite from another item's: scaled to fit this footprint, centred. */
function copyFrom(other: string) {
  const doc = new DOMParser().parseFromString(draft[other], 'image/svg+xml')
  const src = doc.documentElement
  const vb = (src.getAttribute('viewBox') ?? '0 0 32 32').split(/[\s,]+/).map(Number)
  const { w, h } = vbox(cur)
  const s = Math.min(w / vb[2], h / vb[3])
  const m: M = mul(move(w / 2, h / 2), mul(scale(s), move(-(vb[0] + vb[2] / 2), -(vb[1] + vb[3] / 2))))
  const xs = new XMLSerializer()
  const inner = [...src.children].map(k => `    ${xs.serializeToString(k).replace(/ xmlns="[^"]*"/g, '')}`).join('\n')
  setDraft(`<svg xmlns="${NS}" viewBox="0 0 ${w} ${h}">\n  <g transform="${transformAttr(m)}">\n${inner}\n  </g>\n</svg>\n`)
  sel = null
  paint()
}

// ---------------------------------------------------------------- drawing the page

function stageHtml(id: string, cell: number, pad: number, interactive: boolean) {
  const k = KINDS[id]
  const w = rot ? k.h : k.w
  const h = rot ? k.w : k.h
  const cells = kindCells(id, rot).map(([cx, cy]) => `<rect x="${cx + 0.1}" y="${cy + 0.1}" width="0.8" height="0.8" rx="0.08"/>`).join('')
  const lines: string[] = []
  if (interactive) {
    const { w: vw, h: vh } = vbox(id)
    if (guides.units) { for (let x = UNIT / 4; x < vw; x += UNIT / 4) if (x % UNIT) lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${vh}"/>`); for (let y = UNIT / 4; y < vh; y += UNIT / 4) if (y % UNIT) lines.push(`<line x1="0" y1="${y}" x2="${vw}" y2="${y}"/>`) }
    if (guides.cells) { for (let x = 0; x <= vw; x += UNIT) lines.push(`<line class="cell" x1="${x}" y1="0" x2="${x}" y2="${vh}"/>`); for (let y = 0; y <= vh; y += UNIT) lines.push(`<line class="cell" x1="0" y1="${y}" x2="${vw}" y2="${y}"/>`) }
    if (guides.box) lines.push(`<rect x="0" y="0" width="${vw}" height="${vh}"/>`)
  }
  const { w: vw, h: vh } = vbox(id)
  return `<div class="grid" style="--cell:${cell}px;--w:${w + pad * 2};--h:${h + pad * 2}">
    <div class="item" style="--x:${pad};--y:${pad};--w:${w};--h:${h};--c:${color[id]}">
      <svg viewBox="0 0 ${w} ${h}"><g class="sq">${cells}</g></svg>
      <div class="art" style="--kw:${k.w};--kh:${k.h};--r:${rot ? 90 : 0}deg">${draft[id] ?? ''}${interactive ? `<svg class="sub" viewBox="0 0 ${vw} ${vh}">${lines.join('')}<g class="pen"></g><g class="selg"></g></svg>` : ''}</div>
    </div></div>`
}

function layerLabel(el: Element) {
  const n = (a: string) => el.getAttribute(a)
  if (el.getAttribute('data-name')) return el.getAttribute('data-name')!
  switch (el.localName) {
    case 'rect': return `rectangle ${fmt(+(n('width') ?? 0))} × ${fmt(+(n('height') ?? 0))}`
    case 'circle': return `circle ⌀ ${fmt(+(n('r') ?? 0) * 2)}`
    case 'ellipse': return 'ellipse'
    case 'polygon': return `polygon · ${(n('points') ?? '').trim().split(/\s+/).length} points`
    case 'text': return `glyph “${el.textContent}”`
    case 'g': return `group · ${el.children.length}`
    default: return el.localName
  }
}

/** The layers, front first: each row selects, moves forward or back, hides, duplicates or deletes that layer, and can be dragged to a new place. */
function layersHtml(): string {
  const all = drawn(live!)
  if (!all.length) return '<li class="note">Empty. Add a shape.</li>'
  return all.map((el, i) => {
    const hidden = el.getAttribute('display') === 'none'
    return `<li class="${i === sel ? 'on' : ''} ${hidden ? 'hid' : ''}" data-layer="${i}" draggable="true"><span class="ln" title="double-click to rename">${esc(layerLabel(el))}</span>
      <button data-lop="eye" title="${hidden ? 'Show' : 'Hide'}">${hidden ? '◌' : '◉'}</button><button data-lop="up" title="Bring forward" ${i === all.length - 1 ? 'disabled' : ''}>▲</button><button data-lop="down" title="Send back" ${i === 0 ? 'disabled' : ''}>▼</button><button data-lop="dup" title="Duplicate">⧉</button><button data-lop="del" title="Delete">✕</button></li>`
  }).reverse().join('')
}

/** Move the layer at z-index `from` to `to` (0 is the back). */
function moveLayer(from: number, to: number) {
  if (!live || from === to) return
  const all = drawn(live)
  const el = all[from]
  const other = all[to]
  if (!el || !other) return
  if (to > from) other.after(el); else other.before(el)
  sel = to
}

let previewCell = 0
/** One item drawn on the field the way the game draws it (sprite over neutral squares), at cell x, y. */
function previewItem(id: string, x: number, y: number, turned: boolean) {
  const k = KINDS[id]
  const w = turned ? k.h : k.w, h = turned ? k.w : k.h
  const squares = kindCells(id, turned).map(([cx, cy]) => `<rect x="${cx + 0.1}" y="${cy + 0.1}" width="0.8" height="0.8" rx="0.08"/>`).join('')
  return { w, h, html: `<div class="item" style="--x:${x};--y:${y};--w:${w};--h:${h};--c:${color[id]}"><svg viewBox="0 0 ${w} ${h}"><g class="sq">${squares}</g></svg><div class="art" style="--kw:${k.w};--kh:${k.h};--r:${turned ? 90 : 0}deg">${draft[id] ?? ''}</div></div>` }
}
/** The biggest cell size at which this item, with a cell of field around it, fills the preview window. */
function previewCellFor() {
  const stage = root.querySelector<HTMLElement>('.stage.game')
  const big = root.querySelector<HTMLElement>('.stage.big')
  if (!stage || !big) return 24
  const k = KINDS[cur]
  const w = rot ? k.h : k.w, h = rot ? k.w : k.h
  const availW = stage.clientWidth - 2
  const availH = Math.max(160, big.getBoundingClientRect().height - 18)
  return Math.max(12, Math.min(120, Math.floor(Math.min(availW / (w + 2), availH / (h + 2)))))
}
/** Only this item, at game look, as large as the window to the right of the big picture allows. */
function paintPreview() {
  const box = root.querySelector<HTMLElement>('[data-real]')
  if (!box) return
  const k = KINDS[cur]
  const w = rot ? k.h : k.w, h = rot ? k.w : k.h
  previewCell = previewCellFor()
  box.innerHTML = `<div class="grid" style="--cell:${previewCell}px;--w:${w + 2};--h:${h + 2}">${previewItem(cur, 1, 1, rot).html}</div>`
  const cap = root.querySelector('[data-realcap]')
  if (cap) cap.textContent = `in game · ${k.name} at ${previewCell}px cells (the game uses about 22)`
}
new ResizeObserver(() => { if (previewCellFor() !== previewCell) paintPreview() }).observe(root)

const swatch = (value: string, title: string, on = false) => `<button class="sw ${on ? 'on' : ''}" data-fill="${esc(value)}" title="${esc(title)}" style="--s:${value === 'currentColor' ? 'var(--c)' : value}"></button>`
const num = (label: string, prop: string, v: number, step = 1) => `<label>${label}<input type="number" step="${step}" data-prop="${prop}" value="${fmt(v)}"></label>`

const PALETTE = ['#f0ece2', '#9a9aa2', '#3a3a44', '#000000', '#c9975a', '#8f6236', '#b98552', '#ff9a3c', '#e8c56a', '#7fb069', '#3fd0c0', '#5aa8e6', '#b0517f', '#d5606c']
/** The angle a matrix turns things by, in degrees. */
const angleOf = (m: M) => Math.round(Math.atan2(m[1], m[0]) * 180 / Math.PI * 10) / 10

/** A labelled slider with a number beside it; `key` says which property it changes. */
const slider = (label: string, key: string, v: number, min: number, max: number, step = 1, unit = '') =>
  `<div class="sl"><span>${label}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${fmt(Math.max(min, Math.min(max, v)))}" data-sl="${key}"><input type="number" step="${step}" value="${fmt(v)}" data-slnum="${key}"><small>${unit}</small></div>`
const swatches = (attr: 'fill' | 'stroke', cur_: string) => `<div class="swrow">${
  [['currentColor', 'item colour'], ['none', 'none'], ...PALETTE.map(c => [c, c])].map(([c, t]) => `<button class="sw ${cur_ === c ? 'on' : ''} ${c === 'none' ? 'none' : ''}" data-set="${attr}" data-val="${c}" title="${t}" style="--s:${c === 'currentColor' ? 'var(--c)' : c === 'none' ? 'transparent' : c}"></button>`).join('')
}<input type="color" data-colorpick="${attr}" value="${/^#[0-9a-f]{6}$/i.test(cur_) ? cur_ : '#c9975a'}" title="any colour"></div>`

function propsHtml(): string {
  const el = selEl()
  if (!el) return `<p class="note">Nothing selected. Click a shape in the picture or in the layers list, or add one from the <b>Add</b> tab.</p>`
  const b = bbox(el)
  const { w: vw, h: vh } = vbox(cur)
  const fill = attrOf(el, 'fill') || 'currentColor', stroke = attrOf(el, 'stroke') || 'none'
  const m = matrixOf(el)
  return `<div class="props">
    <h3>${esc(layerLabel(el))}</h3>
    <h4>Colour</h4>
    <div class="row col"><span>Fill</span>${swatches('fill', fill)}</div>
    <div class="row col"><span>Edge</span>${swatches('stroke', stroke)}</div>
    ${slider('Edge width', 'sw', +attrOf(el, 'stroke-width') || 0, 0, 16, 0.5, 'units')}
    ${slider('Opacity', 'opacity', +(el.getAttribute('opacity') ?? 1), 0, 1, 0.05)}
    <h4>Position <small>centre, in units (a cell is ${UNIT})</small></h4>
    ${slider('X', 'x', b.x + b.w / 2, -vw * 0.25, vw * 1.25, 0.5)}
    ${slider('Y', 'y', b.y + b.h / 2, -vh * 0.25, vh * 1.25, 0.5)}
    <h4>Size and turn</h4>
    ${slider('Width', 'w', b.w, 1, Math.max(vw, vh) * 1.6, 0.5)}
    ${slider('Height', 'h', b.h, 1, Math.max(vw, vh) * 1.6, 0.5)}
    <label class="chk left"><input type="checkbox" data-prop="lock" ${lockRatio ? 'checked' : ''}> keep the ratio (width and height move together)</label>
    ${slider('Turn', 'rot', angleOf(m), -180, 180, 1, '°')}
    <div class="row quick">${['flipH', 'flipV', 'rotL', 'rotR', 'rot90', 'smaller', 'bigger', 'hcenter', 'vcenter', 'fit'].map(o => `<button data-op="${o}">${OPS[o].label}</button>`).join('')}</div>
  </div>`
}

// ---------------------------------------------------------------- the item itself: name, colour, and its whole drawing

const saveKind = async (patch: Record<string, unknown>) => {
  const status = root.querySelector('[data-status]')
  try { await api('/kind', cur, { method: 'POST', body: JSON.stringify(patch) }); if (status) status.textContent = 'item saved'; setTimeout(() => { if (status) status.textContent = '' }, 2000) } catch (e) { if (status) status.textContent = `not saved: ${(e as Error).message}` }
}
async function setItemColor(v: string) {
  color[cur] = v
  KINDS[cur].color = v
  paint(false)
  await saveKind({ color: v })
}

/** Every drawn element's box together: where the whole drawing is. */
function drawingBox(): Box | null {
  if (!live) return null
  const els = drawn(live).filter(e => e.getAttribute('display') !== 'none')
  if (!els.length) return null
  const bs = els.map(bbox)
  const x = Math.min(...bs.map(b => b.x)), y = Math.min(...bs.map(b => b.y))
  return { x, y, w: Math.max(...bs.map(b => b.x + b.w)) - x, h: Math.max(...bs.map(b => b.y + b.h)) - y }
}

function itemHtml(): string {
  const k = KINDS[cur]
  const { w: vw, h: vh } = vbox(cur)
  const b = drawingBox()
  const layers = live ? drawn(live).length : 0
  const sp = `<div class="swrow">${PALETTE.map(c => `<button class="sw ${k.color.toLowerCase() === c ? 'on' : ''}" data-itemcolor data-val="${c}" title="${c}" style="--s:${c}"></button>`).join('')}<input type="color" data-itemcolorpick value="${k.color}" title="any colour"></div>`
  return `<div class="props">
    <h3>${esc(k.name)} <small>the item, not a shape</small></h3>
    <h4>Name <small>id: ${esc(cur)}</small></h4>
    <div class="row"><input type="text" data-itemname value="${esc(k.name)}" maxlength="40" style="flex:1"></div>
    <h4>Description <small>what a tooltip will say</small></h4>
    <textarea class="field" data-itemdesc rows="3" maxlength="2000" placeholder="A short description…">${esc(k.desc ?? '')}</textarea>
    <h4>Notes <small>just for you: where it drops, ideas, to-dos</small></h4>
    <textarea class="field" data-itemnotes rows="3" maxlength="2000" placeholder="Private notes…">${esc(k.notes ?? '')}</textarea>
    <h4>Tags <small>comma separated</small></h4>
    <div class="row"><input type="text" data-itemtags value="${esc((k.tags ?? []).join(', '))}" placeholder="drink, glass, fragile" style="flex:1"></div>
    <h4>Can be used on <small>one per line, "verb: target" (a kind id or a tag): held, this lights up its targets blue</small></h4>
    <textarea class="field" data-itemuses rows="3" maxlength="600" placeholder="pour: bottle&#10;slaughter: animal&#10;carve: wood">${esc((k.uses ?? []).map(u => `${u.verb}: ${u.on}`).join('\n'))}</textarea>
    <div class="row quick"><button data-dupitem>⧉ Duplicate this item</button><button data-delitem class="${armed === cur ? 'danger' : ''}">${armed === cur ? 'Really delete? Click again' : '🗑 Delete this item'}</button></div>
    <h4>Colour <small>the item's accent in the game; saved</small></h4>
    <div class="row col"><span></span>${sp}</div>
    <h4>What it takes on the field</h4>
    <p class="note">${k.w} × ${k.h} box${k.cells ? ', irregular' : ''} (${vw} × ${vh} units). Paint its squares in the <b>Footprint</b> panel on the left.</p>
    <h4>The whole drawing <small>${layers} layer${layers === 1 ? '' : 's'}, moved together</small></h4>
    ${b ? `${slider('X', 'wx', b.x + b.w / 2, -vw * 0.25, vw * 1.25, 0.5)}
    ${slider('Y', 'wy', b.y + b.h / 2, -vh * 0.25, vh * 1.25, 0.5)}
    ${slider('Size', 'ws', Math.round((Math.max(b.w / vw, b.h / vh)) * 100), 5, 250, 1, '%')}
    ${slider('Turn', 'wr', 0, -180, 180, 1, '°')}` : '<p class="note">Nothing drawn yet.</p>'}
    <div class="row quick"><button data-wop="centre">Centre it</button><button data-wop="fit">Fit to the footprint</button><button data-wop="flipH">⇋ Flip</button><button data-wop="flipV">⇅ Flip</button><button data-wop="rot90">⟳ 90°</button></div>
    <p class="note">Sizes are of the whole picture's outline, as a share of the footprint.</p>
  </div>`
}

let whole: { ms: [SVGGraphicsElement, M][]; b: Box } | null = null
function wholeStart() {
  const b = drawingBox()
  if (live && b) whole = { ms: drawn(live).map(e => [e, matrixOf(e)] as [SVGGraphicsElement, M]), b }
}
/** Move, size or turn every layer together, measured from where the drag began. */
function wholeApply(key: string, v: number) {
  if (!whole) wholeStart()
  if (!whole) return
  const { ms, b } = whole
  const { w: vw, h: vh } = vbox(cur)
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2
  let t: M = I
  if (key === 'wx') t = move(v - cx, 0)
  else if (key === 'wy') t = move(0, v - cy)
  else if (key === 'ws') t = about(scale(Math.max(0.02, (v / 100) / Math.max(b.w / vw, b.h / vh))), cx, cy)
  else if (key === 'wr') t = about(turn(v), cx, cy)
  for (const [el, m0] of ms) setMatrix(el, mul(t, m0))
  drawSelection()
}
function wholeOp(op: string) {
  if (!live) return
  wholeStart()
  if (!whole) return
  const { ms, b } = whole
  const { w: vw, h: vh } = vbox(cur)
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2
  let t: M = I
  if (op === 'centre') t = move(vw / 2 - cx, vh / 2 - cy)
  else if (op === 'fit') { const s = Math.min((vw * 0.9) / b.w, (vh * 0.9) / b.h); t = mul(move(vw / 2, vh / 2), mul(scale(s), move(-cx, -cy))) }
  else if (op === 'flipH') t = about(scale(-1, 1), cx, cy)
  else if (op === 'flipV') t = about(scale(1, -1), cx, cy)
  else if (op === 'rot90') t = about(turn(90), cx, cy)
  for (const [el, m0] of ms) setMatrix(el, mul(t, m0))
  whole = null
  commit()
}

// ---------------------------------------------------------------- sliders: live while dragging, kept on release

let start: { m: M; b: Box; rot: number } | null = null
function sliderStart() {
  const el = selEl()
  if (el) start = { m: matrixOf(el), b: bbox(el), rot: angleOf(matrixOf(el)) }
}
/** Apply a slider's value to the selected element, measured from where the drag began. */
function sliderApply(key: string, v: number) {
  const el = selEl()
  if (!el) return
  if (key === 'opacity') { el.setAttribute('opacity', String(v)); return }
  if (key === 'sw') { paintAttr(el, 'stroke-width', String(v)); if (v > 0 && !attrOf(el, 'stroke')) paintAttr(el, 'stroke', 'currentColor'); return }
  if (!start) sliderStart()
  const { m, b, rot } = start!
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2
  if (key === 'x') setMatrix(el, mul(move(v - cx, 0), m))
  else if (key === 'y') setMatrix(el, mul(move(0, v - cy), m))
  else if (key === 'w') setMatrix(el, mul(about(lockRatio ? scale(Math.max(0.02, v / b.w)) : scale(Math.max(0.02, v / b.w), 1), cx, cy), m))
  else if (key === 'h') setMatrix(el, mul(about(lockRatio ? scale(Math.max(0.02, v / b.h)) : scale(1, Math.max(0.02, v / b.h)), cx, cy), m))
  else if (key === 'rot') setMatrix(el, mul(about(turn(v - rot), cx, cy), m))
  drawSelection()
  // keep the other readouts honest while dragging
  const nb = bbox(el)
  const set = (k: string, val: number) => { for (const i of root.querySelectorAll<HTMLInputElement>(`[data-sl="${k}"], [data-slnum="${k}"]`)) if (i !== document.activeElement && k !== key) i.value = fmt(val) }
  set('x', nb.x + nb.w / 2); set('y', nb.y + nb.h / 2); set('w', nb.w); set('h', nb.h)
}

root.addEventListener('pointerdown', e => { const t = e.target as HTMLElement; if (t.matches?.('[data-sl]')) { if (/^w[xysr]$/.test(t.dataset.sl!)) wholeStart(); else sliderStart() } })
root.addEventListener('input', e => {
  const t = e.target as HTMLInputElement
  if (!t.dataset.sl) return
  if (/^w[xysr]$/.test(t.dataset.sl)) { wholeApply(t.dataset.sl, +t.value); const tw = root.querySelector<HTMLInputElement>(`[data-slnum="${t.dataset.sl}"]`); if (tw) tw.value = fmt(+t.value); return }
  sliderApply(t.dataset.sl, +t.value)
  const twin = root.querySelector<HTMLInputElement>(`[data-slnum="${t.dataset.sl}"]`)
  if (twin) twin.value = fmt(+t.value)
})
root.addEventListener('change', e => {
  const t = e.target as HTMLInputElement
  if (t.dataset.sl && /^w[xysr]$/.test(t.dataset.sl)) { wholeApply(t.dataset.sl, +t.value); whole = null; commit(); return }
  if (t.dataset.slnum && /^w[xysr]$/.test(t.dataset.slnum)) { wholeStart(); wholeApply(t.dataset.slnum, +t.value); whole = null; commit(); return }
  if (t.dataset.sl) { sliderApply(t.dataset.sl, +t.value); start = null; commit(); return }
  if (t.dataset.slnum) { sliderStart(); sliderApply(t.dataset.slnum, +t.value); start = null; commit(); return }
  if (t.dataset.itemname !== undefined) { const v = t.value.trim(); if (v) { KINDS[cur].name = v; saveKind({ name: v }); paint(false); for (const b of root.querySelectorAll<HTMLElement>(`.kinds button[data-kind="${cur}"] b`)) b.textContent = v } return }
  if (t.dataset.itemcolorpick !== undefined) { setItemColor(t.value); return }
  if (t.dataset.colorpick) { const el = selEl(); if (el) { paintAttr(el, t.dataset.colorpick, t.value); if (t.dataset.colorpick === 'stroke' && !+attrOf(el, 'stroke-width')) paintAttr(el, 'stroke-width', '3'); commit() } }
})
root.addEventListener('click', e => {
  const c = (e.target as HTMLElement).closest<HTMLElement>('button[data-itemcolor]')
  if (c) { setItemColor(c.dataset.val!); return }
  const w = (e.target as HTMLElement).closest<HTMLElement>('button[data-wop]')
  if (w) { wholeOp(w.dataset.wop!); return }
})
root.addEventListener('click', e => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('button[data-set]')
  const el = selEl()
  if (!b || !el) return
  const attr = b.dataset.set!, val = b.dataset.val!
  paintAttr(el, attr, val === 'none' && attr === 'stroke' ? null : val)
  if (attr === 'stroke' && val !== 'none' && !+attrOf(el, 'stroke-width')) paintAttr(el, 'stroke-width', '3')
  commit()
})

function addHtml(): string {
  const s = SHAPES[shape]
  const p = { ...Object.fromEntries(s.params.map(q => [q.key, 'value' in q ? q.value : q.text])), ...shapeParams[shape] }
  const colours = ['currentColor', '#ffffff', '#000000', '#8f6236', '#3fd0c0']
  return `<div class="shapes">${Object.entries(SHAPES).map(([id, sh]) => `<button data-shape="${id}" class="${id === shape ? 'on' : ''}">${sh.label}</button>`).join('')}</div>
    <div class="row shapeparams">${s.params.map(q => 'value' in q
      ? `<label>${q.label}<input type="number" data-sp="${q.key}" min="${q.min}" max="${q.max}" value="${p[q.key]}"></label>`
      : `<label>${q.label}<input type="text" maxlength="2" data-sp="${q.key}" value="${esc(String(p[q.key]))}" style="width:36px"></label>`).join('')}</div>
    <div class="row"><span>Fill</span>${colours.map(c => swatch(c, c === 'currentColor' ? 'item colour' : c, c === newFill)).join('')}<input type="color" data-newfill value="${/^#[0-9a-f]{6}$/i.test(newFill) ? newFill : '#c9975a'}"></div>
    <div class="acts"><button class="primary" data-addshape>Add ${s.label.toLowerCase()} to the middle</button></div>
    <p class="note">Then drag it, or use the corner handles. Fine-tune in <b>Properties</b>.</p>`
}

function fxHtml(): string {
  const has = !!selEl()
  return `${has ? '' : '<p class="note">Select a shape first: effects apply to the selected one.</p>'}
    <div class="fxlist">${Object.entries(EFFECTS).map(([id, e]) => {
      const p = effectParams[id]
      return `<div class="fx ${has ? '' : 'off'}"><button data-fx="${id}" ${has ? '' : 'disabled'} title="${esc(e.hint)}">${e.label}</button>${p ? `<label>${p.label}<input type="range" min="${p.min}" max="${p.max}" step="0.1" data-fxp="${id}" value="${fxValue[id]}"></label>` : ''}<small>${e.hint}</small></div>`
    }).join('')}</div>`
}

function opsHtml(): string {
  const has = !!selEl()
  const groups: [string, string[]][] = [
    ['Turn and size', ['flipH', 'flipV', 'rotL', 'rotR', 'rot90', 'bigger', 'smaller', 'fit']],
    ['Place in the footprint', ['hcenter', 'vcenter', 'left', 'right', 'top', 'bottom']],
    ['Copies', ['dup', 'mirrorH', 'mirrorV']],
    ['Order', ['front', 'forward', 'backward', 'back']],
    ['Cut and split', ['breakApart']],
    ['Points (polygons and lines)', ['smooth', 'simplify']],
    ['Other', ['ungroup', 'del']],
  ]
  return `${has ? '' : '<p class="note">Select a shape first.</p>'}${groups.map(([t, list]) => `<h3>${t}</h3><div class="opgrid">${list.map(o => `<button data-op="${o}" ${has ? '' : 'disabled'}>${OPS[o].label}</button>`).join('')}</div>`).join('')}`
}

let lastFp = ''
const thumbSig = new WeakMap<Element, string>()
function paint(withSource = true) {
  const bad = problem(draft[cur])
  const k = KINDS[cur]
  root.style.setProperty('--c', color[cur]) // the item colour, for swatches
  if (autoFit) { zoom = fitZoom(); const zs = root.querySelector<HTMLInputElement>('[data-zoom]'); if (zs) zs.value = String(zoom) }
  // the big stage
  const big = $('[data-big]')
  big.innerHTML = stageHtml(cur, zoom, 1, true)
  live = bad ? null : big.querySelector<SVGSVGElement>('.art > svg:not(.sub)')
  if (live) drawn(live).forEach((el, i) => el.setAttribute('data-i', String(i)))
  if (live && sel !== null && sel >= drawn(live).length) sel = drawn(live).length ? drawn(live).length - 1 : null
  if (!live) sel = null
  paintPreview()
  drawSelection()
  drawPen()
  // text and titles
  $('[data-title]').textContent = `${k.name} · ${k.w} × ${k.h} cells · ${k.w * UNIT} × ${k.h * UNIT} units`
  $('[data-err]').textContent = bad
  const ta = $<HTMLTextAreaElement>('[data-src]')
  if (withSource && document.activeElement !== ta) ta.value = draft[cur]
  $<HTMLInputElement>('[data-color]').value = color[cur]
  // side panel
  for (const t of root.querySelectorAll<HTMLElement>('[data-tab]')) t.classList.toggle('on', t.dataset.tab === tab)
  for (const p of root.querySelectorAll<HTMLElement>('[data-page]')) p.hidden = p.dataset.page !== tab
  // only the tab you are looking at is rebuilt; the others are drawn when you switch to them
  const pages: Record<string, () => string> = { item: itemHtml, add: addHtml, props: propsHtml, fx: fxHtml, ops: opsHtml }
  if (pages[tab]) $(`[data-page="${tab}"]`).innerHTML = pages[tab]()
  else if (tab === 'lib') renderLib()
  const fpSig = `${cur}:${k.w}x${k.h}:${k.cells?.join('/') ?? ''}`
  if (fpSig !== lastFp && !(document.activeElement instanceof HTMLInputElement && document.activeElement.matches('[data-fprw], [data-fprh]'))) { lastFp = fpSig; fpLoad(); $('[data-footprint]').innerHTML = footprintHtml() }
  for (const t of root.querySelectorAll<HTMLElement>('[data-tool]')) t.classList.toggle('on', t.dataset.tool === tool)
  root.querySelector('.stage.big')!.classList.toggle('penning', tool !== 'select')
  root.querySelector<HTMLElement>('.penopts')!.style.visibility = tool === 'select' ? 'hidden' : 'visible'
  $('[data-penhint]').textContent = tool === 'select' ? '' : tool === 'dots' ? 'click to place points · click the first point or double-click to close · Enter closes · ⌫ removes the last · Esc cancels'
    : tool === 'line' ? 'click to place points · double-click or Enter to finish · ⌫ removes the last · Esc cancels' : tool === 'free' ? 'press and drag to draw; letting go finishes (end near the start to close it)' : 'click shapes to select · double-click a point to remove it · click a + to add one'
  // items and layers
  for (const b of root.querySelectorAll<HTMLElement>('.kinds button')) {
    b.classList.toggle('on', b.dataset.kind === cur)
    b.classList.toggle('dirty', dirty(b.dataset.kind!))
    const t = b.querySelector<HTMLElement>('.thumb')!
    const sig = `${color[b.dataset.kind!]}${draft[b.dataset.kind!]}`
    if (thumbSig.get(t) !== sig) { thumbSig.set(t, sig); t.style.setProperty('--c', color[b.dataset.kind!]); t.innerHTML = draft[b.dataset.kind!] ?? '' }
  }
  $('[data-layers]').innerHTML = live ? layersHtml() : ''
  $<HTMLButtonElement>('[data-undo]').disabled = hist[cur].at <= 0
  $<HTMLButtonElement>('[data-redo]').disabled = hist[cur].at >= hist[cur].stack.length - 1
  $<HTMLButtonElement>('[data-save]').classList.toggle('dirty', dirty(cur))
}

const isPoly = (el: Element | null): el is SVGPolygonElement | SVGPolylineElement => !!el && (el.localName === 'polygon' || el.localName === 'polyline')
/** A polygon or polyline's points in sprite units (they are stored in the shape's own coordinates). */
const vertices = (el: Element): P[] => { const m = matrixOf(el as SVGGraphicsElement); return parsePoints(el.getAttribute('points') ?? '').map(([x, y]) => point(m, x, y)) }

/** The selection box and its four resize handles; for a polygon or polyline also a handle on every point and a "+" between them. */
function drawSelection() {
  const g = root.querySelector('.selg')
  const el = selEl()
  if (!g || !el) return
  const b = bbox(el)
  const hs = 9 / (zoom / UNIT)
  const corner = (name: string, x: number, y: number) => `<rect class="h" data-handle="${name}" x="${x - hs / 2}" y="${y - hs / 2}" width="${hs}" height="${hs}"/>`
  let nodes = ''
  if (isPoly(el)) {
    const pts = vertices(el)
    const closed = el.localName === 'polygon'
    const n = closed ? pts.length : pts.length - 1
    for (let i = 0; i < n; i++) { const a = pts[i], c = pts[(i + 1) % pts.length]; nodes += `<circle class="mid" data-mid="${i}" cx="${(a[0] + c[0]) / 2}" cy="${(a[1] + c[1]) / 2}" r="${hs * 0.32}"/>` }
    pts.forEach(([x, y], i) => { nodes += `<circle class="v" data-vertex="${i}" cx="${x}" cy="${y}" r="${hs * 0.5}"/>` })
  }
  g.innerHTML = `<rect class="box" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}"/>${corner('nw', b.x, b.y)}${corner('ne', b.x + b.w, b.y)}${corner('sw', b.x, b.y + b.h)}${corner('se', b.x + b.w, b.y + b.h)}${nodes}`
}

/** The pen's work in progress: the dots so far, joined, and a rubber band to the mouse. */
function drawPen() {
  const g = root.querySelector('.pen')
  if (!g) return
  if (!pen || !pen.pts.length) { g.innerHTML = ''; return }
  const r = 5 / (zoom / UNIT)
  const all = pen.hover ? [...pen.pts, pen.hover] : pen.pts
  const closing = tool === 'dots' && pen.pts.length >= 3 && pen.hover && Math.hypot(pen.hover[0] - pen.pts[0][0], pen.hover[1] - pen.pts[0][1]) < r * 2
  g.innerHTML = `<polyline class="wire" points="${pointsAttr(all)}"/>${closing ? `<circle class="close" cx="${pen.pts[0][0]}" cy="${pen.pts[0][1]}" r="${r * 1.7}"/>` : ''}${pen.pts.map(([x, y], i) => `<circle class="dot ${i === 0 ? 'first' : ''}" cx="${x}" cy="${y}" r="${r}"/>`).join('')}`
}

function select(i: number | null, goTo = false) {
  sel = i
  if (goTo && i !== null && tab === 'add') tab = 'props'
  paint()
}

function switchTo(id: string) {
  cur = id
  sel = null
  fpFor = ''
  pen = null
  tool = 'select'
  paint()
}

// ---------------------------------------------------------------- pointer: select, move, resize

type Drag = { move(e: PointerEvent): void; end(): void }
let drag: Drag | null = null

function startMove(e: PointerEvent, el: SVGGraphicsElement) {
  const m0 = matrixOf(el), b0 = bbox(el), [px, py] = unitsOf(e.clientX, e.clientY)
  let moved = false
  drag = {
    move(ev) {
      const [x, y] = unitsOf(ev.clientX, ev.clientY)
      const dx = snapTo(b0.x + (x - px), snap) - b0.x
      const dy = snapTo(b0.y + (y - py), snap) - b0.y
      if (Math.hypot(ev.clientX - e.clientX, ev.clientY - e.clientY) > 3) moved = true
      if (!moved) return
      setMatrix(el, mul(move(dx, dy), m0))
      drawSelection()
    },
    end() { if (moved) commit() },
  }
}

function startResize(e: PointerEvent, corner: string, el: SVGGraphicsElement) {
  const m0 = matrixOf(el), b0 = bbox(el)
  const ax = corner.includes('w') ? b0.x + b0.w : b0.x
  const ay = corner.includes('n') ? b0.y + b0.h : b0.y
  const cx = corner.includes('w') ? b0.x : b0.x + b0.w
  const cy = corner.includes('n') ? b0.y : b0.y + b0.h
  drag = {
    move(ev) {
      const [x, y] = unitsOf(ev.clientX, ev.clientY)
      let sx = Math.max(0.05, (x - ax) / (cx - ax || 1)), sy = Math.max(0.05, (y - ay) / (cy - ay || 1))
      if (!ev.altKey && lockRatio) { const s = Math.max(sx, sy); sx = sy = s }
      setMatrix(el, mul(about(scale(sx, sy), ax, ay), m0))
      drawSelection()
    },
    end: commit,
  }
}

const snapPt = ([x, y]: P): P => [snapTo(x, snap), snapTo(y, snap)]

/** Turn the pen's dots (or freehand line) into a real shape, select it and go back to the select tool. */
function finishPen(closed: boolean, pts = pen?.pts ?? []) {
  if (!live || pts.length < 2) { pen = null; drawPen(); return }
  const need = closed ? 3 : 2
  if (pts.length < need) { pen = null; drawPen(); return }
  const list = pointsAttr(pts)
  const stroke = `stroke="${newFill}" stroke-width="${fmt(penWidth)}" stroke-linecap="round" stroke-linejoin="round"`
  let markup: string
  if (penSmooth && pts.length >= 3) markup = closed ? `<path d="${smoothPath(pts, true)}" fill="${newFill}"/>` : `<path d="${smoothPath(pts, false)}" fill="none" ${stroke}/>`
  else markup = closed ? `<polygon points="${list}" fill="${newFill}"/>` : `<polyline points="${list}" fill="none" ${stroke}/>`
  live.appendChild(svgNode(markup))
  sel = drawn(live).length - 1
  pen = null
  tool = 'select'
  commit()
}

function startVertexDrag(el: SVGGraphicsElement, index: number) {
  drag = {
    move(ev) {
      const inv = invert(matrixOf(el))
      const [x, y] = point(inv, ...snapPt(unitsOf(ev.clientX, ev.clientY)))
      const pts = parsePoints(el.getAttribute('points') ?? '')
      pts[index] = [x, y]
      el.setAttribute('points', pointsAttr(pts))
      drawSelection()
    },
    end: commit,
  }
}

function pointerdown(e: PointerEvent) {
  if (!live || e.button !== 0) return
  // pen tools
  if (tool !== 'select') {
    const raw = unitsOf(e.clientX, e.clientY)
    if (tool === 'free') {
      const pts: P[] = [raw]
      pen = { pts, hover: null }
      drag = {
        move(ev) { const p = unitsOf(ev.clientX, ev.clientY); const l = pts[pts.length - 1]; if (Math.hypot(p[0] - l[0], p[1] - l[1]) > 0.8) { pts.push(p); drawPen() } },
        end() {
          const simple = simplify(pts, penDetail).map(p => (snap > 2 ? snapPt(p) : p))
          const closed = pts.length > 8 && Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) < 8
          finishPen(closed, closed ? simple.slice(0, -1) : simple)
        },
      }
      e.preventDefault()
      return
    }
    const p = snapPt(raw)
    if (!pen) pen = { pts: [], hover: null }
    const first = pen.pts[0]
    const near = first && Math.hypot(p[0] - first[0], p[1] - first[1]) < 10 / (zoom / UNIT)
    if (e.detail >= 2) { finishPen(tool === 'dots'); e.preventDefault(); return }
    if (tool === 'dots' && pen.pts.length >= 3 && near) { finishPen(true); e.preventDefault(); return }
    pen.pts.push(p)
    drawPen()
    e.preventDefault()
    return
  }
  // node editing on a polygon / polyline
  const target = e.target as Element
  const vertex = target.closest<HTMLElement>('[data-vertex]')
  const mid = target.closest<HTMLElement>('[data-mid]')
  const cur1 = selEl()
  if ((vertex || mid) && cur1 && isPoly(cur1)) {
    const pts = parsePoints(cur1.getAttribute('points') ?? '')
    if (vertex) {
      const i = +vertex.dataset.vertex!
      if (e.detail >= 2 && pts.length > (cur1.localName === 'polygon' ? 3 : 2)) { pts.splice(i, 1); cur1.setAttribute('points', pointsAttr(pts)); commit(); e.preventDefault(); return }
      startVertexDrag(cur1, i)
    } else {
      const i = +mid!.dataset.mid!
      const a = pts[i], c = pts[(i + 1) % pts.length]
      pts.splice(i + 1, 0, [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2])
      cur1.setAttribute('points', pointsAttr(pts))
      startVertexDrag(cur1, i + 1)
    }
    e.preventDefault()
    return
  }
  const handle = target.closest<HTMLElement>('[data-handle]')
  const el = selEl()
  if (handle && el) { startResize(e, handle.dataset.handle!, el); e.preventDefault(); return }
  const topOf = (n: Element) => { let x: Element | null = n; while (x && x.parentElement !== live) x = x.parentElement; return x && x.hasAttribute('data-i') ? x as SVGGraphicsElement : null }
  const hit = document.elementsFromPoint(e.clientX, e.clientY).map(topOf).find(Boolean) as SVGGraphicsElement | undefined
  if (hit) {
    const i = +hit.getAttribute('data-i')!
    if (i !== sel) { sel = i; paint(); drag = null }
    startMove(e, drawn(live)[i])
    e.preventDefault()
    return
  }
  if (el) {
    const b = bbox(el), [x, y] = unitsOf(e.clientX, e.clientY)
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) { startMove(e, el); e.preventDefault(); return }
  }
  select(null)
}

// ---------------------------------------------------------------- events

const inField = (t: EventTarget | null) => t instanceof HTMLElement && (t.matches('input, textarea, select') && !(t instanceof HTMLInputElement && (t.type === 'range' || t.type === 'checkbox' || t.type === 'color')))

root.addEventListener('pointerdown', e => { if ((e.target as Element).closest('[data-big]')) pointerdown(e) })
addEventListener('pointermove', e => drag?.move(e))
addEventListener('pointerup', () => { const d = drag; drag = null; d?.end() })

root.addEventListener('click', async e => {
  const t = (e.target as HTMLElement).closest<HTMLElement>('button, li[data-layer]')
  if (!t) return
  const d = t.dataset
  if (d.kind) switchTo(d.kind)
  else if (d.layer !== undefined && t.tagName === 'LI') select(+d.layer)
  else if (d.op) { OPS[d.op].run(); commit() }
  else if (d.fx) { const el = selEl(); if (el) { EFFECTS[d.fx].apply(el, fxValue[d.fx] ?? 0); commit() } }
  else if (d.shape) { shape = d.shape; paint() }
  else if (d.fill !== undefined) { newFill = d.fill; paint() }
  else if (d.tab) { tab = d.tab as typeof tab; paint() }
  else if ('addshape' in d) addShape()
  else if ('save' in d) save()
  else if ('undo' in d) undo(-1)
  else if ('redo' in d) undo(1)
  else if ('revert' in d) { setDraft(saved[cur]); sel = null; paint() }
  else if ('reset' in d) { setDraft(await api('/reset', cur)); sel = null; paint() }
  else if ('tidy' in d) { if (live) commit() }
  else if ('rotview' in d) { rot = !rot; paint() }
  else if ('fit' in d) { autoFit = true; paint() }
})

root.addEventListener('dblclick', e => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-shape]')
  if (b) { shape = b.dataset.shape!; addShape() }
})

/** Sliders show their effect while you drag (without redrawing the panel under your hand); the change is kept on release. */
root.addEventListener('input', e => {
  const t = e.target as HTMLInputElement
  if (t.matches('[data-src]')) { setDraft(t.value, true); paint(false) }
  else if (t.matches('[data-zoom]')) { autoFit = false; zoom = +t.value; paint() }
  else if (t.matches('[data-color]')) { color[cur] = t.value; paint(false) }
  else if (t.matches('[data-newfill]')) { newFill = t.value; paint() }
  else if (t.dataset.prop === 'opacity') { const el = selEl(); if (el) el.setAttribute('opacity', t.value) }
  else if (t.dataset.fxp) fxValue[t.dataset.fxp] = +t.value
})

root.addEventListener('change', e => {
  const t = e.target as HTMLInputElement | HTMLSelectElement
  const el = selEl()
  if (t.matches('[data-color]')) { setItemColor(t.value); return }
  if (t.matches('[data-snap]')) { snap = +t.value; return }
  if (t.matches('[data-copy]')) { if (t.value) copyFrom(t.value); (t as HTMLSelectElement).value = ''; return }
  if (t.matches('[data-auto]')) { autosave = (t as HTMLInputElement).checked; if (autosave) save(); return }
  if (t.dataset.grid) { guides = { ...guides, [t.dataset.grid]: (t as HTMLInputElement).checked }; paint(false); return }
  if (t.dataset.sp) { shapeParams[shape] = { ...shapeParams[shape], [t.dataset.sp]: t.type === 'number' ? +t.value : t.value }; return }
  if (t.dataset.fxp) { fxValue[t.dataset.fxp] = +t.value; return }
  if (!el || !t.dataset.prop) return
  const p = t.dataset.prop
  const b = bbox(el)
  const v = t.value
  if (p === 'fill-mode') paintAttr(el, 'fill', v === 'accent' ? 'currentColor' : v === 'none' ? 'none' : (attrOf(el, 'fill').startsWith('#') ? attrOf(el, 'fill') : '#c9975a'))
  else if (p === 'fill-color') paintAttr(el, 'fill', v)
  else if (p === 'stroke-mode') { paintAttr(el, 'stroke', v === 'none' ? null : v === 'accent' ? 'currentColor' : (attrOf(el, 'stroke').startsWith('#') ? attrOf(el, 'stroke') : '#ffffff')); if (v !== 'none' && !+attrOf(el, 'stroke-width')) paintAttr(el, 'stroke-width', '3') }
  else if (p === 'stroke-color') { paintAttr(el, 'stroke', v); if (!+attrOf(el, 'stroke-width')) paintAttr(el, 'stroke-width', '3') }
  else if (p === 'stroke-width') paintAttr(el, 'stroke-width', v)
  else if (p === 'opacity') el.setAttribute('opacity', v)
  else if (p === 'lock') { lockRatio = (t as HTMLInputElement).checked; return }
  else if (p === 'x') setMatrix(el, mul(move(+v - (b.x + b.w / 2), 0), matrixOf(el)))
  else if (p === 'y') setMatrix(el, mul(move(0, +v - (b.y + b.h / 2)), matrixOf(el)))
  else if (p === 'w' || p === 'h') {
    const sx = p === 'w' ? Math.max(0.1, +v) / b.w : lockRatio ? Math.max(0.1, +v) / b.h : 1
    const sy = p === 'h' ? Math.max(0.1, +v) / b.h : lockRatio ? Math.max(0.1, +v) / b.w : 1
    const s = p === 'w' ? sx : sy
    transformSel(lockRatio ? scale(s) : scale(sx, sy))
  }
  commit()
})

addEventListener('keydown', e => {
  if (bOpen) return
  const mod = e.metaKey || e.ctrlKey
  if (mod && e.key === 's') { e.preventDefault(); save(); return }
  if (mod && e.key.toLowerCase() === 'z' && !inField(e.target)) { e.preventDefault(); undo(e.shiftKey ? 1 : -1); return }
  if (inField(e.target)) return
  if (pen || (!mod && !e.altKey && 'vplf'.includes(e.key.toLowerCase()) && e.key.length === 1)) return // the pen's own keys, below
  const el = selEl()
  if (mod && e.key === 'd' && el) { e.preventDefault(); duplicate(); commit(); return }
  if (!el) return
  if (mod && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) { e.preventDefault(); zorder(e.shiftKey ? (e.key === 'ArrowUp' ? 'front' : 'back') : (e.key === 'ArrowUp' ? 'forward' : 'backward')); commit(); return }
  const step = e.shiftKey ? snap * 4 : snap
  const arrows: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
  if (arrows[e.key]) { e.preventDefault(); setMatrix(el, mul(move(...arrows[e.key]), matrixOf(el))); commit() }
  else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); remove(); commit() }
  else if (e.key === '[') { transformSel(scale(0.9)); commit() }
  else if (e.key === ']') { transformSel(scale(1.1)); commit() }
  else if (e.key === 'Escape') select(null)
})

// ---------------------------------------------------------------- footprint: which squares the item takes

const FP = 12 // the painter is a 12 x 12 patch of squares
let fpCells: boolean[] = []
let fpOrigin: [number, number] = [0, 0] // where the saved footprint's top-left sits in the painter
let fpFor = ''
let painting: boolean | null = null

/** Load the painter with the item's saved footprint, placed with room to grow on the left and top. */
function fpLoad() {
  const k = KINDS[cur]
  const ox = Math.max(0, Math.min(FP - k.w, 2)), oy = Math.max(0, Math.min(FP - k.h, 2))
  fpCells = Array<boolean>(FP * FP).fill(false)
  for (const [x, y] of kindCells(cur)) fpCells[(y + oy) * FP + x + ox] = true
  fpOrigin = [ox, oy]
  fpFor = cur
}
/** What is painted: its box, how many squares, whether it hangs together. Null if nothing is painted. */
function fpInfo() {
  const on: [number, number][] = []
  fpCells.forEach((v, i) => { if (v) on.push([i % FP, Math.floor(i / FP)]) })
  if (!on.length) return null
  const x0 = Math.min(...on.map(c => c[0])), y0 = Math.min(...on.map(c => c[1]))
  const w = Math.max(...on.map(c => c[0])) - x0 + 1, h = Math.max(...on.map(c => c[1])) - y0 + 1
  const key = (x: number, y: number) => y * FP + x
  const seen = new Set<number>([key(...on[0])])
  const queue = [on[0]]
  while (queue.length) {
    const [x, y] = queue.pop()!
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]] as const) if (nx >= 0 && ny >= 0 && nx < FP && ny < FP && fpCells[key(nx, ny)] && !seen.has(key(nx, ny))) { seen.add(key(nx, ny)); queue.push([nx, ny]) }
  }
  const rows = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => fpCells[key(x0 + x, y0 + y)] ? '#' : '.').join(''))
  return { x0, y0, w, h, count: on.length, connected: seen.size === on.length, rows, full: on.length === w * h }
}
const fpChanged = () => { const i = fpInfo(); const k = KINDS[cur]; if (!i) return false; const cur_ = kindCells(cur).map(c => c.join()).sort().join(';'); const now = fpCells.flatMap((v, n) => v ? [`${(n % FP) - i.x0},${Math.floor(n / FP) - i.y0}`] : []).sort().join(';'); return cur_ !== now || i.w !== k.w || i.h !== k.h }

function fpInfoText() {
  const i = fpInfo()
  if (!i) return 'nothing painted: a footprint needs at least one square'
  return `${i.w} × ${i.h} box · ${i.count} square${i.count === 1 ? '' : 's'}${i.connected ? '' : ' · ⚠ in separate pieces'}${i.full ? '' : ' · irregular'}`
}
/** Update the painter's squares and its readout without rebuilding it (so a drag keeps working). */
function fpRefresh() {
  const saved = new Set(kindCells(cur).map(([x, y]) => (y + fpOrigin[1]) * FP + x + fpOrigin[0]))
  root.querySelectorAll<HTMLElement>('[data-fpc]').forEach(el => { const i = +el.dataset.fpc!; el.classList.toggle('on', fpCells[i]); el.classList.toggle('was', saved.has(i) && !fpCells[i]) })
  const t = root.querySelector('[data-fpinfo]')
  if (t) t.textContent = fpInfoText()
  const b = root.querySelector<HTMLButtonElement>('[data-fpapply]')
  if (b) b.disabled = !fpInfo() || !fpChanged()
}

/** Save the painted footprint: the item's squares change, and the drawing is kept in place (or scaled to the new box). */
async function applyFootprint() {
  const info = fpInfo()
  const status = $('[data-status]')
  if (!info) return
  if (!live) { status.textContent = 'fix the SVG first'; return }
  const k = KINDS[cur]
  const oldVb = vbox(cur)
  k.w = info.w; k.h = info.h
  if (info.full) delete k.cells; else k.cells = info.rows
  const nu = vbox(cur)
  const scaleIt = $<HTMLInputElement>('[data-fpscale]').checked
  const t: M = scaleIt
    ? (() => { const s = Math.min(nu.w / oldVb.w, nu.h / oldVb.h); return mul(move(nu.w / 2, nu.h / 2), mul(scale(s), move(-oldVb.w / 2, -oldVb.h / 2))) })()
    : move((fpOrigin[0] - info.x0) * UNIT, (fpOrigin[1] - info.y0) * UNIT)
  for (const el of drawn(live)) setMatrix(el, mul(t, matrixOf(el)))
  live.setAttribute('viewBox', `0 0 ${nu.w} ${nu.h}`)
  commit()
  await save()
  try { await api('/kind', cur, { method: 'POST', body: JSON.stringify({ cells: info.rows }) }); status.textContent = `${k.name} now takes ${info.count} square${info.count === 1 ? '' : 's'}` } catch (e) { status.textContent = `footprint not saved: ${(e as Error).message}` }
  fpLoad()
  lastFp = ''
  paint()
}

function footprintHtml() {
  if (fpFor !== cur || !fpCells.length) fpLoad()
  const saved = new Set(kindCells(cur).map(([x, y]) => (y + fpOrigin[1]) * FP + x + fpOrigin[0]))
  const cells = fpCells.map((v, i) => `<i data-fpc="${i}" class="${v ? 'on' : ''} ${saved.has(i) && !v ? 'was' : ''}"></i>`).join('')
  return `<div class="fp"><div class="fppick" data-fppick title="Pencil: press and drag to switch squares on or off">${cells}</div>
    <div class="fpinfo" data-fpinfo>${esc(fpInfoText())}</div>
    <div class="fptools"><button data-fptool="clear">Clear</button><button data-fptool="invert" title="Flip every square inside the box">Invert</button><button data-fptool="reset">Reset</button>
      <label>rectangle <input type="number" min="1" max="12" value="${KINDS[cur].w}" data-fprw>×<input type="number" min="1" max="12" value="${KINDS[cur].h}" data-fprh></label><button data-fptool="rect">Fill</button></div>
    <label class="chk"><input type="checkbox" data-fpscale> scale the drawing to the new box (otherwise it stays where it is)</label>
    <button class="primary" data-fpapply ${fpInfo() && fpChanged() ? '' : 'disabled'}>Apply and save</button></div>`
}

// ---------------------------------------------------------------- import: files, pasted code, the game-icons set

/** Parse an SVG and strip anything that runs or reaches out. Null if it is not an SVG. */
function cleanSvg(text: string): SVGSVGElement | null {
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml')
  if (doc.querySelector('parsererror') || doc.documentElement.localName !== 'svg') return null
  for (const e of doc.querySelectorAll('script, foreignObject, iframe, object, embed')) e.remove()
  for (const e of doc.querySelectorAll('*')) for (const a of [...e.attributes]) {
    if (/^on/i.test(a.name)) e.removeAttribute(a.name)
    if ((a.name === 'href' || a.name === 'xlink:href') && !a.value.startsWith('#')) e.removeAttribute(a.name)
  }
  return doc.documentElement as unknown as SVGSVGElement
}

/** Make every fill and stroke colour the item's colour, so an imported picture follows the item like the rest. */
function recolorAll(root_: Element) {
  for (const e of [root_, ...root_.querySelectorAll('*')]) {
    for (const name of ['fill', 'stroke']) { const v = e.getAttribute(name); if (v !== null && v !== 'none' && v !== 'transparent' && !v.startsWith('url(')) e.setAttribute(name, 'currentColor') }
    const st = e.getAttribute('style')
    if (st) e.setAttribute('style', st.replace(/(^|;)\s*(fill|stroke)\s*:\s*(?!none|url)[^;]+/gi, '$1$2:currentColor'))
  }
}

/** An imported SVG as a <g>, scaled to fit the footprint (fitPct %) and centred; null if it will not parse. */
function importGroup(text: string): string | null {
  const svg = cleanSvg(text)
  if (!svg) return null
  let vb = (svg.getAttribute('viewBox') ?? '').split(/[\s,]+/).map(Number)
  if (vb.length !== 4 || vb.some(Number.isNaN)) vb = [0, 0, parseFloat(svg.getAttribute('width') ?? '') || 100, parseFloat(svg.getAttribute('height') ?? '') || 100]
  const { w, h } = vbox(cur)
  const s = Math.min((w * fitPct) / 100 / vb[2], (h * fitPct) / 100 / vb[3])
  const m = mul(move(w / 2, h / 2), mul(scale(s), move(-(vb[0] + vb[2] / 2), -(vb[1] + vb[3] / 2))))
  if (recolor) recolorAll(svg)
  const inherit = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'].filter(a => svg.hasAttribute(a) || (recolor && a === 'fill')).map(a => ` ${a}="${recolor && (a === 'fill' || a === 'stroke') ? 'currentColor' : svg.getAttribute(a) ?? 'currentColor'}"`).join('')
  const xs = new XMLSerializer()
  const inner = [...svg.children].map(k => xs.serializeToString(k).replace(/ xmlns="[^"]*"/g, '')).join('')
  return `<g transform="${transformAttr(m)}"${inherit}>${inner}</g>`
}

function addImport(text: string) {
  const g = importGroup(text)
  const status = $('[data-status]')
  if (!g || !live) { status.textContent = !live ? 'fix the SVG first' : 'that is not an SVG'; return }
  live.appendChild(svgNode(g))
  sel = drawn(live).length - 1
  tab = 'props'
  commit()
}
function replaceWithImport(text: string) {
  const g = importGroup(text)
  if (!g) { $('[data-status]').textContent = 'that is not an SVG'; return }
  const { w, h } = vbox(cur)
  setDraft(`<svg xmlns="${NS}" viewBox="0 0 ${w} ${h}">\n  ${g}\n</svg>\n`)
  sel = null
  paint()
}

const libKey = (key: string) => (key.startsWith('imp:') ? libImports : iconResults).find(x => x.name === key.slice(4))?.svg ?? ''
const slug = (s: string) => s.toLowerCase().replace(/\.svg$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'import'

async function loadImports() {
  try { libImports = JSON.parse(await fetch('/__sprites/imports').then(r => r.text())) } catch { libImports = [] }
  renderLib()
}
async function saveImport(name: string, text: string) {
  await fetch(`/__sprites/import?name=${encodeURIComponent(name)}`, { method: 'POST', body: text })
}
async function importFiles(files: FileList | File[], toSprite: boolean) {
  const list = [...files].filter(f => f.name.toLowerCase().endsWith('.svg') || f.type === 'image/svg+xml')
  if (!list.length) { $('[data-status]').textContent = 'only .svg files'; return }
  for (const f of list) { const text = await f.text(); if (cleanSvg(text)) await saveImport(slug(f.name), text) }
  await loadImports()
  if (toSprite && list.length === 1) addImport(await list[0].text())
}
let iconTimer = 0
const iconsUrl = (set: string, q: string, offset = 0, limit = 60) => `/__sprites/icons?set=${encodeURIComponent(set)}&q=${encodeURIComponent(q)}&offset=${offset}&limit=${limit}`
async function fetchIcons(set: string, q: string, offset = 0, limit = 60): Promise<{ total: number; items: { name: string; svg: string }[] }> {
  try { return JSON.parse(await fetch(iconsUrl(set, q, offset, limit)).then(r => r.text())) } catch { return { total: 0, items: [] } }
}
async function searchIcons(q: string) {
  iconQuery = q
  iconResults = (await fetchIcons(iconSet, q)).items
  const box = root.querySelector('[data-iconres]')
  if (box) box.innerHTML = thumbs(iconResults, 'ico')
}
async function loadSets() {
  try { sets = JSON.parse(await fetch('/__sprites/sets').then(r => r.text())) } catch { sets = [] }
  renderLib()
}

function thumbs(list: { name: string; svg: string }[], src: 'imp' | 'ico') {
  if (!list.length) return `<p class="note">${src === 'imp' ? 'Nothing imported yet.' : 'Type to search 4,000 icons.'}</p>`
  return list.map(x => `<div class="thumbx" title="${esc(x.name)}"><span class="tv">${x.svg}</span><small>${esc(x.name)}</small>
    <span class="tb"><button data-libadd="${src}:${esc(x.name)}">add</button><button data-libreplace="${src}:${esc(x.name)}">replace</button>${src === 'imp' ? `<button data-libdel="${esc(x.name)}" title="Delete from the library">✕</button>` : `<button data-libkeep="${esc(x.name)}" title="Keep in your imports">keep</button>`}</span></div>`).join('')
}

function libHtml() {
  return `<div class="drop" data-drop>Drop SVG files here, or paste SVG code anywhere (⌘V).<br><label class="filebtn">choose files…<input type="file" accept=".svg,image/svg+xml" multiple data-file hidden></label></div>
    <div class="row"><label><input type="checkbox" data-recolor ${recolor ? 'checked' : ''}> use the item colour</label><label>fit <input type="number" min="10" max="100" step="5" data-fitpct value="${fitPct}" style="width:54px">%</label></div>
    <h3>Your imports</h3><div class="thumbs" data-imps>${thumbs(libImports, 'imp')}</div>
    <h3>Icon sets <small>${sets.reduce((n, s) => n + s.total, 0).toLocaleString()} icons</small></h3>
    <div class="row"><select data-set>${sets.map(s => `<option value="${s.id}" ${s.id === iconSet ? 'selected' : ''}>${esc(s.name)} · ${s.total.toLocaleString()} · ${esc(s.style)}</option>`).join('')}</select></div>
    <input type="search" class="search" data-iconq value="${esc(iconQuery)}" placeholder="search this set: axe, gear, potion…">
    <button class="bigbtn" data-openbrowser>⤢ Open the big browser (all sets, big thumbnails)</button>
    <div class="thumbs" data-iconres>${thumbs(iconResults, 'ico')}</div>`
}
function renderLib() { const p = root.querySelector('[data-page="lib"]'); if (p && tab === 'lib' && document.activeElement?.getAttribute('data-iconq') === null) p.innerHTML = libHtml() }

// ---------------------------------------------------------------- events for the tools, footprint and library

function setTool(t: typeof tool) {
  tool = t
  pen = null
  paint(false)
}

root.addEventListener('click', async e => {
  const t = (e.target as HTMLElement).closest<HTMLElement>('button')
  if (!t) return
  const d = t.dataset
  if (d.tool) setTool(d.tool as typeof tool)
  else if ('fpapply' in d) applyFootprint()
  else if (d.libadd) addImport(libKey(d.libadd))
  else if (d.libreplace) replaceWithImport(libKey(d.libreplace))
  else if (d.libdel) { await fetch(`/__sprites/import-delete?name=${encodeURIComponent(d.libdel)}`, { method: 'POST' }); loadImports() }
  else if (d.libkeep) { const x = iconResults.find(i => i.name === d.libkeep); if (x) { await saveImport(slug(x.name), x.svg); loadImports() } }
})

root.addEventListener('input', e => {
  const t = e.target as HTMLInputElement
  if (t.matches('[data-iconq]')) { clearTimeout(iconTimer); iconTimer = window.setTimeout(() => searchIcons(t.value), 250) }
  else if (t.matches('[data-penwidth]')) penWidth = Math.max(1, +t.value || 4)
  else if (t.matches('[data-pendetail]')) penDetail = +t.value
})
root.addEventListener('change', e => {
  const t = e.target as HTMLInputElement
  if (t.matches('[data-pensmooth]')) penSmooth = t.checked
  else if (t.matches('[data-set]')) { iconSet = t.value; searchIcons(iconQuery) }
  else if (t.matches('[data-recolor]')) recolor = t.checked
  else if (t.matches('[data-fitpct]')) fitPct = Math.max(10, Math.min(100, +t.value || 80))
  else if (t.matches('[data-file]') && t.files) { importFiles(t.files, false); t.value = '' }
})

/** The rubber band from the last dot to the mouse. */
root.addEventListener('pointermove', e => {
  if (!pen || tool === 'free' || !(e.target as Element).closest('[data-big]')) return
  pen.hover = snapPt(unitsOf(e.clientX, e.clientY))
  drawPen()
})

/** Dropping SVG files: on the picture they go into the sprite (and the library); on the library page, only the library. */
root.addEventListener('dragover', e => { if (e.dataTransfer?.types.includes('Files')) e.preventDefault() })
root.addEventListener('drop', e => {
  const files = e.dataTransfer?.files
  if (!files?.length) return
  e.preventDefault()
  importFiles(files, !!(e.target as Element).closest('[data-big]'))
})
/** Pasting SVG code anywhere outside a text field adds it to the sprite and keeps a copy in the library. */
addEventListener('paste', e => {
  if (inField(e.target)) return
  const text = e.clipboardData?.getData('text') ?? ''
  if (!text.includes('<svg') || !cleanSvg(text)) return
  e.preventDefault()
  addImport(text)
  saveImport(`pasted-${Date.now() % 1_000_000}`, text).then(loadImports)
})

/** The pen's own keys, and V / P / L / F to change tool. */
addEventListener('keydown', e => {
  if (bOpen || inField(e.target) || e.metaKey || e.ctrlKey || e.altKey) return
  if (pen && tool !== 'free') {
    if (e.key === 'Enter') { e.preventDefault(); finishPen(tool === 'dots'); return }
    if (e.key === 'Backspace') { e.preventDefault(); pen.pts.pop(); drawPen(); return }
    if (e.key === 'Escape') { pen = null; drawPen(); return }
  }
  if (e.key === 'Escape' && tool !== 'select') { setTool('select'); return }
  const map: Record<string, typeof tool> = { v: 'select', p: 'dots', l: 'line', f: 'free' }
  if (e.key.length === 1 && map[e.key.toLowerCase()]) setTool(map[e.key.toLowerCase()])
})

// ---------------------------------------------------------------- import by parts: keep only some pieces of a picture

const INHERITED = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'fill-rule', 'clip-rule', 'fill-opacity', 'stroke-opacity', 'opacity']
/** An SVG cut into its pieces: every drawn shape, and every separate shape inside a compound path, with the transforms and colours it inherited written onto it. */
function svgParts(text: string): { vb: string; parts: string[] } | null {
  const svg = cleanSvg(text)
  if (!svg) return null
  const vb = svg.getAttribute('viewBox') ?? `0 0 ${parseFloat(svg.getAttribute('width') ?? '') || 100} ${parseFloat(svg.getAttribute('height') ?? '') || 100}`
  const xs = new XMLSerializer()
  const parts: string[] = []
  const emit = (el: Element, chain: string[], inh: Record<string, string>) => {
    const c = el.cloneNode(el.localName === 'path' ? false : true) as Element
    if (el.localName === 'path') for (const a of [...el.attributes]) c.setAttribute(a.name, a.value)
    c.removeAttribute('transform')
    if (chain.length) c.setAttribute('transform', chain.join(' '))
    for (const [k, v] of Object.entries(inh)) if (!c.hasAttribute(k)) c.setAttribute(k, v)
    parts.push(xs.serializeToString(c).replace(/ xmlns="[^"]*"/g, ''))
    return c
  }
  const walk = (el: Element, chain: string[], inh: Record<string, string>) => {
    if (NOT_DRAWN.includes(el.localName)) return
    const own = el.getAttribute('transform')
    const next = own ? [...chain, own] : chain
    const inh2 = { ...inh }
    for (const k of INHERITED) { const v = el.getAttribute(k); if (v !== null) inh2[k] = v }
    if (el.localName === 'g' || el.localName === 'svg') { for (const c of el.children) walk(c, next, inh2); return }
    if (el.localName === 'path') {
      const subs = splitSubpaths(parsePath(el.getAttribute('d') ?? ''))
      if (subs.length > 1) {
        for (const sub of subs.slice(0, 400)) { const p = document.createElementNS(NS, 'path'); for (const a of [...el.attributes]) p.setAttribute(a.name, a.value); p.setAttribute('d', pathString(sub)); emit(p, next, inh2) }
        return
      }
    }
    emit(el, next, inh2)
  }
  walk(svg, [], {})
  return { vb, parts: parts.slice(0, 400) }
}

// ---------------------------------------------------------------- the big icon browser

let bOpen = false
let bSet = 'game-icons' // an icon set id, or 'imports' for your own
let bQuery = ''
let bSize = 96
let bItems: { name: string; svg: string }[] = []
let bTotal = 0
let bSel = -1
let bLoading = false
let bToken = 0
let bTimer = 0
let bWatch: IntersectionObserver | null = null
let bPartsOn = false
let bParts: { markup: string; on: boolean }[] = []
let bVb = ''

const bEl = () => document.querySelector<HTMLElement>('.browser')
const bq = <T extends Element>(sel: string) => bEl()!.querySelector<T>(sel)!

function browserShell() {
  const imp = libImports.length
  return `<header>
      <b>Icon browser</b>
      <input type="search" data-bquery placeholder="search by name (axe, potion, gear…)" value="${esc(bQuery)}">
      <label>size <input type="range" min="48" max="220" step="4" value="${bSize}" data-bsize></label>
      <span class="bcount" data-bcount></span>
      <span class="grow"></span>
      <label><input type="checkbox" data-recolor2 ${recolor ? 'checked' : ''}> use the item colour</label>
      <button data-bclose>✕ Close <kbd>Esc</kbd></button>
    </header>
    <div class="bbody">
      <nav class="bsets">
        <h2>Sets</h2>
        ${sets.map(s => `<button data-bset="${s.id}" class="${s.id === bSet ? 'on' : ''}"><b>${esc(s.name)}</b><small>${s.total.toLocaleString()} · ${esc(s.style)}</small></button>`).join('')}
        <h2>Yours</h2>
        <button data-bset="imports" class="${bSet === 'imports' ? 'on' : ''}"><b>Your imports</b><small>${imp} in src/imports</small></button>
        <p class="note">Hover a picture for its name. Click to select, double-click to add. Arrow keys move, <kbd>Enter</kbd> adds, <kbd>⇧Enter</kbd> adds and closes, <kbd>/</kbd> searches.</p>
      </nav>
      <div class="bgrid" data-bgrid style="--bs:${bSize}px"></div>
      <aside class="bdetail" data-bdetail></aside>
    </div>`
}

function openBrowser() {
  if (!bEl()) { const d = document.createElement('div'); d.className = 'browser'; document.body.appendChild(d) }
  bOpen = true
  bEl()!.hidden = false
  bEl()!.innerHTML = browserShell()
  bWatch?.disconnect()
  bReset()
  bq<HTMLInputElement>('[data-bquery]').focus()
}
function closeBrowser() { bOpen = false; bWatch?.disconnect(); const e = bEl(); if (e) e.hidden = true }

function bCell(x: { name: string; svg: string }, i: number) {
  return `<button class="bcell ${i === bSel ? 'on' : ''}" data-bi="${i}" title="${esc(x.name)}"><span class="btv">${x.svg}</span><small>${esc(x.name)}</small></button>`
}
function bCount() {
  const c = bq('[data-bcount]')
  c.textContent = bLoading && !bItems.length ? 'loading…' : `${bItems.length.toLocaleString()} of ${bTotal.toLocaleString()}`
}

/** Start again from the top: a new set or a new search. */
function bReset() {
  bToken++
  bItems = []; bTotal = 0; bSel = -1
  bq('[data-bgrid]').innerHTML = ''
  bDetail()
  bMore()
}

/** Load the next page and add its cells to the end of the grid. */
async function bMore() {
  if (bLoading || (bItems.length && bItems.length >= bTotal)) return
  bLoading = true
  const token = bToken
  bCount()
  let page: { total: number; items: { name: string; svg: string }[] }
  if (bSet === 'imports') {
    const q = bQuery.toLowerCase().trim()
    const all = libImports.filter(x => !q || x.name.toLowerCase().includes(q))
    page = { total: all.length, items: all.slice(bItems.length, bItems.length + 120) }
  } else page = await fetchIcons(bSet, bQuery, bItems.length, 120)
  if (token !== bToken || !bOpen) { bLoading = false; return }
  const start = bItems.length
  bItems.push(...page.items)
  bTotal = page.total
  const grid = bq('[data-bgrid]')
  grid.querySelector('.bmore')?.remove()
  grid.insertAdjacentHTML('beforeend', page.items.map((x, i) => bCell(x, start + i)).join(''))
  if (bItems.length < bTotal) {
    grid.insertAdjacentHTML('beforeend', '<div class="bmore">loading more…</div>')
    bWatch?.disconnect()
    bWatch = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) bMore() }, { root: grid, rootMargin: '600px' })
    bWatch.observe(grid.querySelector('.bmore')!)
  }
  bLoading = false
  bCount()
  if (!bItems.length) grid.innerHTML = '<p class="note" style="padding:20px">Nothing matches that. Try a shorter word.</p>'
}

function bSelect(i: number, scroll = false) {
  bSel = i
  bPartsOn = false
  for (const c of bEl()!.querySelectorAll('.bcell.on')) c.classList.remove('on')
  const cell = bEl()!.querySelector<HTMLElement>(`.bcell[data-bi="${i}"]`)
  cell?.classList.add('on')
  if (scroll) cell?.scrollIntoView({ block: 'nearest' })
  bDetail()
}

function bDetail() {
  const box = bq('[data-bdetail]')
  const x = bItems[bSel]
  if (!x) { box.innerHTML = `<p class="note">Select a picture to see it big, then add it to <b>${esc(KINDS[cur].name)}</b> (${KINDS[cur].w} × ${KINDS[cur].h}).</p>`; return }
  const s = sets.find(t => t.id === bSet)
  const dims = /viewBox="0 0 (\d+) (\d+)"/.exec(x.svg)
  const kept = bParts.filter(p => p.on).length
  const preview = bPartsOn ? `<svg viewBox="${esc(bVb)}">${bParts.map((p, i) => `<g data-part="${i}" class="${p.on ? '' : 'off'}">${p.markup}</g>`).join('')}</svg>` : x.svg
  box.innerHTML = `<div class="bprev ${bPartsOn ? 'cutting' : ''}" style="--c:${color[cur]}">${preview}</div>
    <h3>${esc(x.name)}</h3>
    <p class="note">${s ? `${esc(s.name)} · ${esc(s.license)}` : 'your import'}${dims ? ` · ${dims[1]} × ${dims[2]} grid` : ''}</p>
    ${bPartsOn ? `<div class="acts"><b>${kept} of ${bParts.length} parts kept</b><button data-bpall>all</button><button data-bpnone>none</button><button data-bpinv>invert</button></div><p class="note">Click a part in the picture to drop it or bring it back.</p>` : `<div class="acts"><button data-bparts>✂ Choose parts…</button></div>`}
    <label class="row"><span>fit</span><input type="number" min="10" max="100" step="5" data-fitpct2 value="${fitPct}" style="width:54px">%&nbsp;of the footprint</label>
    <div class="acts"><button class="primary" data-badd>Add to ${esc(KINDS[cur].name)}</button><button data-baddclose>Add and close</button></div>
    <div class="acts"><button data-breplace>Replace the sprite</button>${bSet === 'imports' ? '<button data-bdel>Delete import</button>' : '<button data-bkeep>Keep in my imports</button>'}</div>
    <p class="note" data-bnote></p>`
}

async function bAct(what: 'add' | 'addclose' | 'replace' | 'keep' | 'del') {
  const x = bItems[bSel]
  if (!x) return
  const note = () => bq<HTMLElement>('[data-bnote]')
  const text = bPartsOn ? `<svg xmlns="${NS}" viewBox="${bVb}">${bParts.filter(p => p.on).map(p => p.markup).join('')}</svg>` : x.svg
  if (what === 'add' || what === 'addclose') { addImport(text); if (what === 'addclose') closeBrowser(); else if (note()) note().textContent = `added to ${KINDS[cur].name} ✓` }
  else if (what === 'replace') { replaceWithImport(text); closeBrowser() }
  else if (what === 'keep') { await saveImport(slug(x.name), x.svg); await loadImports(); note().textContent = 'kept in your imports ✓' }
  else if (what === 'del') { await fetch(`/__sprites/import-delete?name=${encodeURIComponent(x.name)}`, { method: 'POST' }); await loadImports(); bReset() }
}

const bcols = () => getComputedStyle(bq('[data-bgrid]')).gridTemplateColumns.split(' ').length

bEl()?.remove()
document.addEventListener('click', e => {
  const t = e.target as HTMLElement
  if (t.closest('[data-openbrowser]')) { openBrowser(); return }
  if (!bOpen) return
  const cell = t.closest<HTMLElement>('.bcell')
  if (cell) { bSelect(+cell.dataset.bi!); return }
  const set = t.closest<HTMLElement>('[data-bset]')
  if (set) { bSet = set.dataset.bset!; for (const b of bEl()!.querySelectorAll('[data-bset]')) b.classList.toggle('on', (b as HTMLElement).dataset.bset === bSet); bReset(); return }
  if (t.closest('[data-bclose]')) closeBrowser()
  else if (t.closest('[data-bparts]')) {
    const p = svgParts(bItems[bSel]?.svg ?? '')
    if (p && p.parts.length) { bVb = p.vb; bParts = p.parts.map(markup => ({ markup, on: true })); bPartsOn = true; bDetail() }
  }
  else if (t.closest('[data-bpall]')) { bParts.forEach(p => { p.on = true }); bDetail() }
  else if (t.closest('[data-bpnone]')) { bParts.forEach(p => { p.on = false }); bDetail() }
  else if (t.closest('[data-bpinv]')) { bParts.forEach(p => { p.on = !p.on }); bDetail() }
  else if (t.closest('[data-part]')) { const g = t.closest<SVGElement>('[data-part]')!; const p = bParts[+g.getAttribute('data-part')!]; if (p) { p.on = !p.on; bDetail() } }
  else if (t.closest('[data-badd]')) bAct('add')
  else if (t.closest('[data-baddclose]')) bAct('addclose')
  else if (t.closest('[data-breplace]')) bAct('replace')
  else if (t.closest('[data-bkeep]')) bAct('keep')
  else if (t.closest('[data-bdel]')) bAct('del')
})
document.addEventListener('dblclick', e => { const cell = (e.target as HTMLElement).closest<HTMLElement>('.bcell'); if (bOpen && cell) { bSelect(+cell.dataset.bi!); bAct('addclose') } })
document.addEventListener('input', e => {
  const t = e.target as HTMLInputElement
  if (!bOpen) return
  if (t.matches('[data-bquery]')) { clearTimeout(bTimer); bTimer = window.setTimeout(() => { bQuery = t.value; bReset() }, 250) }
  else if (t.matches('[data-bsize]')) { bSize = +t.value; bq<HTMLElement>('[data-bgrid]').style.setProperty('--bs', `${bSize}px`) }
})
document.addEventListener('change', e => {
  const t = e.target as HTMLInputElement
  if (!bOpen) return
  if (t.matches('[data-recolor2]')) { recolor = t.checked; bDetail() }
  else if (t.matches('[data-fitpct2]')) fitPct = Math.max(10, Math.min(100, +t.value || 80))
})
addEventListener('keydown', e => {
  if (!bOpen) return
  const inSearch = (e.target as HTMLElement).matches?.('input[type=search]')
  if (e.key === 'Escape') { e.preventDefault(); if (inSearch && bQuery) { (e.target as HTMLInputElement).value = ''; bQuery = ''; bReset() } else closeBrowser(); return }
  if (e.key === '/' && !inSearch) { e.preventDefault(); bq<HTMLInputElement>('[data-bquery]').focus(); return }
  if (inSearch && !['ArrowDown', 'Enter'].includes(e.key)) return
  const move = ({ ArrowLeft: -1, ArrowRight: 1, ArrowUp: -bcols(), ArrowDown: bcols() } as Record<string, number>)[e.key]
  if (move !== undefined) { e.preventDefault(); (document.activeElement as HTMLElement)?.blur(); const n = Math.max(0, Math.min(bItems.length - 1, (bSel < 0 ? 0 : bSel + move))); if (bItems.length) bSelect(n, true); return }
  if (e.key === 'Enter' && bSel >= 0) { e.preventDefault(); bAct(e.shiftKey ? 'addclose' : 'add') }
}, true)

// ---------------------------------------------------------------- layers: order, hide, rename

/** Put a layer directly in front of or behind another one. */
function placeLayer(from: number, target: number, front: boolean) {
  if (!live || from === target) return
  const all = drawn(live)
  const el = all[from], ref = all[target]
  if (!el || !ref) return
  if (front) ref.after(el); else ref.before(el)
  sel = drawn(live).indexOf(el)
}

root.addEventListener('click', e => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-lop]')
  if (!b || !live) return
  const i = +b.closest<HTMLElement>('li[data-layer]')!.dataset.layer!
  const el = drawn(live)[i]
  sel = i
  switch (b.dataset.lop) {
    case 'eye': if (el.getAttribute('display') === 'none') el.removeAttribute('display'); else el.setAttribute('display', 'none'); break
    case 'up': moveLayer(i, i + 1); break
    case 'down': moveLayer(i, i - 1); break
    case 'dup': duplicate(); break
    case 'del': remove(); break
  }
  commit()
})

let dragLayer = -1
root.addEventListener('dragstart', e => {
  const li = (e.target as HTMLElement).closest<HTMLElement>('li[data-layer]')
  if (!li) return
  dragLayer = +li.dataset.layer!
  e.dataTransfer!.effectAllowed = 'move'
  e.dataTransfer!.setData('text/plain', `layer:${dragLayer}`)
})
root.addEventListener('dragover', e => {
  const li = (e.target as HTMLElement).closest<HTMLElement>('li[data-layer]')
  if (!li || dragLayer < 0) return
  e.preventDefault()
  const r = li.getBoundingClientRect()
  for (const x of root.querySelectorAll('.layers li.over-top, .layers li.over-bottom')) x.classList.remove('over-top', 'over-bottom')
  li.classList.add(e.clientY < r.top + r.height / 2 ? 'over-top' : 'over-bottom')
})
root.addEventListener('drop', e => {
  const li = (e.target as HTMLElement).closest<HTMLElement>('li[data-layer]')
  if (!li || dragLayer < 0) return
  e.preventDefault()
  const r = li.getBoundingClientRect()
  const front = e.clientY < r.top + r.height / 2 // the list shows the front layer first, so the upper half means "in front of"
  const from = dragLayer
  dragLayer = -1
  placeLayer(from, +li.dataset.layer!, front)
  commit()
})
root.addEventListener('dragend', () => { dragLayer = -1; for (const x of root.querySelectorAll('.layers li.over-top, .layers li.over-bottom')) x.classList.remove('over-top', 'over-bottom') })

/** Double-click a layer's name to call it something; the name is kept in the SVG as data-name. */
root.addEventListener('dblclick', e => {
  const ln = (e.target as HTMLElement).closest<HTMLElement>('.ln')
  if (!ln || !live) return
  const i = +ln.closest<HTMLElement>('li[data-layer]')!.dataset.layer!
  const el = drawn(live)[i]
  const input = document.createElement('input')
  input.className = 'lnedit'
  input.value = layerLabel(el)
  ln.replaceWith(input)
  input.focus(); input.select()
  let done = false
  const finish = (ok: boolean) => {
    if (done) return
    done = true
    if (!ok) return paint()
    const v = input.value.trim()
    if (v) el.setAttribute('data-name', v); else el.removeAttribute('data-name')
    commit()
  }
  input.addEventListener('keydown', ev => { ev.stopPropagation(); if (ev.key === 'Enter') finish(true); else if (ev.key === 'Escape') finish(false) })
  input.addEventListener('blur', () => finish(true))
})

// ---------------------------------------------------------------- room to work: fold panels, fit the picture to the space

/** The zoom at which the big picture fills the room the middle panel has, leaving space beside it for the in-game preview. */
function fitZoom() {
  const view = root.querySelector<HTMLElement>('.view')
  const stages = root.querySelector<HTMLElement>('.stages')
  if (!view || !stages) return zoom
  const k = KINDS[cur]
  const w = (rot ? k.h : k.w) + 2, h = (rot ? k.w : k.h) + 2
  const availH = view.clientHeight - stages.offsetTop - 28
  const availW = view.clientWidth - 260
  return Math.max(20, Math.min(160, Math.floor(Math.min(availH / h, availW / w))))
}

function applyUi() {
  root.classList.toggle('left-off', ui.left)
  root.classList.toggle('right-off', ui.right)
  for (const d of root.querySelectorAll<HTMLDetailsElement>('details[data-fold]')) {
    const want = ui.folds[d.dataset.fold!]
    if (want !== undefined) d.open = want
  }
}
root.addEventListener('click', e => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-collapse]')
  if (!b) return
  const side = b.dataset.collapse as 'left' | 'right'
  ui[side] = !ui[side]
  saveUi(); applyUi()
})
root.addEventListener('toggle', e => {
  const d = e.target as HTMLDetailsElement
  if (d.matches?.('details[data-fold]')) { ui.folds[d.dataset.fold!] = d.open; saveUi() }
}, true)
new ResizeObserver(() => { if (ready && autoFit && fitZoom() !== zoom) paint(false) }).observe(root)

// ---------------------------------------------------------------- the item manager: make, copy, describe, remove

const kindButton = (id: string) => `<button data-kind="${id}" title="${esc(KINDS[id].desc ?? '')}"><span class="thumb"></span><span><b>${esc(KINDS[id].name)}</b><small>${KINDS[id].w} × ${KINDS[id].h}${KINDS[id].cells ? ' · shaped' : ''}</small></span></button>`
function kindsHtml() { return ids.map(kindButton).join('') }
const copyOptions = () => `<option value="">Copy from…</option>${ids.map(id => `<option value="${id}">${esc(KINDS[id].name)}</option>`).join('')}`

/** The list of items and the "copy from" menu, rebuilt after one is made or removed. */
function renderKinds() {
  $('.kinds').innerHTML = kindsHtml()
  $('[data-copy]').innerHTML = copyOptions()
  const f = root.querySelector<HTMLInputElement>('[data-kfilter]')
  if (f?.value) filterKinds(f.value)
}
function filterKinds(q: string) {
  const term = q.toLowerCase().trim()
  for (const b of root.querySelectorAll<HTMLElement>('.kinds button')) {
    const k = KINDS[b.dataset.kind!]
    b.hidden = !!term && ![b.dataset.kind, k.name, k.desc, ...(k.tags ?? [])].some(s => s?.toLowerCase().includes(term))
  }
}

const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/^[^a-z]+/, '').slice(0, 28) || 'item'
const uniqueId = (base: string) => { let id = slugify(base), n = 2; while (KINDS[id]) id = `${slugify(base)}-${n++}`; return id }

/** Bring a kind that now exists on disk into the editor: its sprite, history and place in the list. */
async function adopt(id: string, data: typeof KINDS[string]) {
  KINDS[id] = data
  ids = Object.keys(KINDS)
  saved[id] = draft[id] = await api('', id)
  hist[id] = { stack: [draft[id]], at: 0, t: 0 }
  color[id] = data.color
  renderKinds()
}

async function createItem(name: string, opts: { w: number; h: number; from?: string; color?: string; desc?: string }) {
  const status = root.querySelector('[data-status]')
  const id = uniqueId(name)
  const src = opts.from ? KINDS[opts.from] : null
  try { sessionStorage.setItem('sprite-editor-open', id) } catch { /* private window */ } // Vite reloads the page when a sprite file appears; this brings you back to the new item
  try {
    await api('/new', id, { method: 'POST', body: JSON.stringify({ name, w: opts.w, h: opts.h, from: opts.from, color: opts.color, desc: opts.desc }) })
  } catch (e) { if (status) status.textContent = `not created: ${(e as Error).message}`; return null }
  const data = { name, icon: '', color: opts.color ?? src?.color ?? '#b4bfcc', w: src?.w ?? opts.w, h: src?.h ?? opts.h, ...(src?.cells ? { cells: [...src.cells] } : {}), ...(opts.desc ? { desc: opts.desc } : src?.desc ? { desc: src.desc } : {}), ...(src?.tags ? { tags: [...src.tags] } : {}) }
  await adopt(id, data)
  switchTo(id)
  tab = 'item'
  paint()
  if (status) status.textContent = `made ${name}`
  return id
}

let armed = ''
async function deleteItem() {
  const id = cur
  if (ids.length < 2) { $('[data-status]').textContent = 'keep at least one item'; return }
  if (armed !== id) {
    armed = id
    paint(false)
    setTimeout(() => { if (armed === id) { armed = ''; paint(false) } }, 3500)
    return
  }
  armed = ''
  try { sessionStorage.setItem('sprite-editor-open', ids.find(i => i !== id) ?? '') } catch { /* private window */ }
  try { await api('/delete', id, { method: 'POST' }) } catch (e) { $('[data-status]').textContent = `not deleted: ${(e as Error).message}`; return }
  delete KINDS[id]; delete draft[id]; delete saved[id]; delete hist[id]
  try { localStorage.removeItem(`sprite-draft:${id}`) } catch { /* private window */ }
  ids = Object.keys(KINDS)
  renderKinds()
  switchTo(ids[0])
  $('[data-status]').textContent = 'deleted'
}

function openNewItem() {
  let d = document.querySelector<HTMLElement>('.modal')
  if (!d) { d = document.createElement('div'); d.className = 'modal'; document.body.appendChild(d) }
  d.hidden = false
  d.innerHTML = `<form class="card" data-newform>
      <h2>New item</h2>
      <label>Name<input type="text" name="name" maxlength="40" placeholder="Rainbow potion" required autofocus></label>
      <label>Start from<select name="from"><option value="">A blank sprite (outline of the footprint)</option>${ids.map(id => `<option value="${id}">A copy of ${esc(KINDS[id].name)} (drawing, size, shape, colour)</option>`).join('')}</select></label>
      <div class="two"><label>Width<input type="number" name="w" min="1" max="12" value="2"></label><label>Height<input type="number" name="h" min="1" max="12" value="2"></label></div>
      <p class="note">Width and height are used for a blank sprite; you can paint any shape afterwards in the Footprint panel. Then pick an icon in the Library tab or draw with the tools.</p>
      <label>Description<textarea name="desc" rows="2" placeholder="What is it, for the tooltip"></textarea></label>
      <div class="acts"><button class="primary" type="submit">Create</button><button type="button" data-newcancel>Cancel</button></div>
    </form>`
  d.querySelector<HTMLInputElement>('input[name=name]')!.focus()
}
const closeNewItem = () => { const d = document.querySelector<HTMLElement>('.modal'); if (d) d.hidden = true }
document.addEventListener('submit', async e => {
  const f = (e.target as HTMLElement).closest<HTMLFormElement>('[data-newform]')
  if (!f) return
  e.preventDefault()
  const v = new FormData(f)
  closeNewItem()
  await createItem(String(v.get('name')).trim(), { w: +(v.get('w') ?? 2) || 2, h: +(v.get('h') ?? 2) || 2, from: String(v.get('from') || '') || undefined, desc: String(v.get('desc') || '').trim() || undefined })
})
document.addEventListener('click', e => { if ((e.target as HTMLElement).closest('[data-newcancel]')) closeNewItem() })
addEventListener('keydown', e => { if (e.key === 'Escape' && document.querySelector<HTMLElement>('.modal:not([hidden])')) { closeNewItem(); e.stopPropagation() } }, true)

root.addEventListener('click', e => {
  const t = (e.target as HTMLElement).closest<HTMLElement>('button')
  if (!t) return
  if (t.matches('[data-newitem]')) openNewItem()
  else if (t.matches('[data-dupitem]')) createItem(`${KINDS[cur].name} copy`, { w: KINDS[cur].w, h: KINDS[cur].h, from: cur })
  else if (t.matches('[data-delitem]')) deleteItem()
  else if (t.dataset.fptool) {
    const tool_ = t.dataset.fptool
    const info = fpInfo()
    if (tool_ === 'clear') fpCells.fill(false)
    else if (tool_ === 'reset') fpLoad()
    else if (tool_ === 'invert') { const b = info ?? { x0: fpOrigin[0], y0: fpOrigin[1], w: KINDS[cur].w, h: KINDS[cur].h }; for (let y = b.y0; y < b.y0 + b.h; y++) for (let x = b.x0; x < b.x0 + b.w; x++) fpCells[y * FP + x] = !fpCells[y * FP + x] }
    else if (tool_ === 'rect') {
      const w = Math.max(1, Math.min(FP, +(root.querySelector<HTMLInputElement>('[data-fprw]')?.value || 1))), h = Math.max(1, Math.min(FP, +(root.querySelector<HTMLInputElement>('[data-fprh]')?.value || 1)))
      const x0 = Math.min(info?.x0 ?? fpOrigin[0], FP - w), y0 = Math.min(info?.y0 ?? fpOrigin[1], FP - h)
      fpCells.fill(false)
      for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) fpCells[y * FP + x] = true
    }
    fpRefresh()
  }
  else if ('fpapply' in t.dataset) applyFootprint()
})
root.addEventListener('input', e => { const t = e.target as HTMLInputElement; if (t.matches('[data-kfilter]')) filterKinds(t.value) })

// the painter: press on a square and drag; what the first square turns into is what the drag paints
root.addEventListener('pointerdown', e => {
  const c = (e.target as HTMLElement).closest<HTMLElement>('[data-fpc]')
  if (!c) return
  e.preventDefault()
  const i = +c.dataset.fpc!
  painting = !fpCells[i]
  fpCells[i] = painting
  fpRefresh()
})
addEventListener('pointermove', e => {
  if (painting === null) return
  const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-fpc]')
  if (!el) return
  const i = +el.dataset.fpc!
  if (fpCells[i] !== painting) { fpCells[i] = painting; fpRefresh() }
})
addEventListener('pointerup', () => { painting = null })

/** The text fields of an item save when you leave them. */
root.addEventListener('change', e => {
  const t = e.target as HTMLInputElement | HTMLTextAreaElement
  const k = KINDS[cur]
  if (t.matches('[data-itemdesc]')) { const v = t.value.trim(); if (v) k.desc = v; else delete k.desc; saveKind({ desc: v }) }
  else if (t.matches('[data-itemnotes]')) { const v = t.value.trim(); if (v) k.notes = v; else delete k.notes; saveKind({ notes: v }) }
  else if (t.matches('[data-itemuses]')) {
    const list = t.value.split('\n').map(l => l.split(':').map(s => s.trim())).filter(p => p.length === 2 && p[0] && p[1]).map(([verb, on]) => ({ ...k.uses?.find(u => u.on === on && u.verb === verb), on, verb })) // keeps a use's effects
    if (list.length) k.uses = list; else delete k.uses
    saveKind({ uses: list })
  }
  else if (t.matches('[data-itemtags]')) { const list = t.value.split(',').map(s => s.trim()).filter(Boolean); if (list.length) k.tags = list; else delete k.tags; saveKind({ tags: list }) }
})

// ---------------------------------------------------------------- the page

root.innerHTML = `
  <aside class="panel left">
    <div class="phead"><span>Items · Layers</span><button data-collapse="left" title="Fold this panel away">‹</button></div>
    <div class="pbody">
      <details class="fold" data-fold="items" open><summary>Items</summary>
        <div class="kbar"><button data-newitem>＋ New item</button><input type="search" data-kfilter placeholder="filter…"></div>
        <div class="kinds">${kindsHtml()}</div></details>
      <details class="fold" data-fold="footprint" open><summary>Footprint</summary><div data-footprint></div></details>
      <details class="fold" data-fold="layers" open><summary>Layers <small>(top is in front)</small></summary><ul class="layers" data-layers></ul></details>
    </div>
  </aside>
  <main class="panel view">
    <div class="bar">
      <button data-undo title="⌘Z">↶ Undo</button><button data-redo title="⇧⌘Z">↷ Redo</button>
      <label>zoom <input type="range" min="24" max="96" value="${zoom}" data-zoom></label><button data-fit title="Fill the room there is (this is on until you drag the zoom)">fit</button>
      <label>snap <select data-snap>${[[1, '1 unit'], [2, '1/16 cell'], [4, '1/8 cell'], [8, '1/4 cell'], [16, '1/2 cell'], [32, 'whole cell']].map(([v, l]) => `<option value="${v}" ${v === snap ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      <label>colour <input type="color" data-color></label>
      <label><input type="checkbox" data-grid="cells" checked> cells</label><label><input type="checkbox" data-grid="units"> quarter-cells</label><label><input type="checkbox" data-grid="box" checked> footprint</label>
      <button data-rotview>turn view 90°</button>
    </div>
    <div class="bar toolrow">
      <span>tools</span>${[['select', 'Select', 'V'], ['dots', 'Connect the dots', 'P'], ['line', 'Open line', 'L'], ['free', 'Freehand', 'F']].map(([t, l, k]) => `<button data-tool="${t}">${l} <kbd>${k}</kbd></button>`).join('')}
      <span class="penopts"><label>thickness <input type="number" min="1" max="30" step="0.5" data-penwidth value="${penWidth}"></label><label>detail <input type="range" min="0.3" max="6" step="0.1" data-pendetail value="${penDetail}" title="how many points freehand keeps: left = more"></label><label><input type="checkbox" data-pensmooth> smooth curve</label></span>
      <small data-penhint></small>
    </div>
    <div class="stages"><div class="stage big"><div data-big></div></div><div class="stage game"><span data-realcap>in game</span><div data-real></div></div></div>
    <div class="err" data-err></div>
    <details class="fold help" data-fold="help"><summary>Keys and tips</summary><p class="note">Keys: <kbd>←↑↓→</kbd> nudge (<kbd>⇧</kbd> ×4) · <kbd>[</kbd> <kbd>]</kbd> smaller / bigger · <kbd>⌘D</kbd> duplicate · <kbd>⌘↑</kbd><kbd>⌘↓</kbd> forward / back (<kbd>⇧</kbd> all the way) · <kbd>⌫</kbd> delete · <kbd>⌘Z</kbd> undo · <kbd>⌘S</kbd> save · hold <kbd>⌥</kbd> while resizing for free stretch. Draw in the item colour and it follows the item. A sprite is plain SVG at ${UNIT} units per cell, in <code>src/sprites/</code>.</p></details>
  </main>
  <section class="panel side">
    <div class="phead"><h2 data-title></h2><button data-collapse="right" title="Fold this panel away">›</button></div>
    <div class="pbody side-body">
    <div class="tabs">${[['item', 'Item'], ['add', 'Add'], ['props', 'Shape'], ['fx', 'Effects'], ['ops', 'Ops'], ['lib', 'Library'], ['src', 'SVG']].map(([t, l]) => `<button data-tab="${t}">${l}</button>`).join('')}</div>
    <div class="pages">
      <div data-page="item"></div><div data-page="add"></div><div data-page="props"></div><div data-page="fx"></div><div data-page="ops"></div><div data-page="lib"></div>
      <div data-page="src"><textarea spellcheck="false" data-src></textarea><div class="acts"><button data-tidy>Tidy</button></div></div>
    </div>
    <div class="acts foot">
      <button class="primary" data-save>Save to game (⌘S)</button><label><input type="checkbox" data-auto> autosave</label>
      <button data-revert>Revert</button><button data-reset>Original icon</button>
      <select data-copy>${copyOptions()}</select>
      <span class="note" data-status></span>
    </div>
    </div>
  </section>`

Promise.all(ids.map(async id => {
  saved[id] = await api('', id)
  let d = saved[id]
  try { d = localStorage.getItem(`sprite-draft:${id}`) ?? d } catch { /* private window */ }
  draft[id] = d
  hist[id] = { stack: [d], at: 0, t: 0 }
})).then(() => {
  try { const want = sessionStorage.getItem('sprite-editor-open'); sessionStorage.removeItem('sprite-editor-open'); if (want && KINDS[want]) { cur = want; tab = 'item' } } catch { /* private window */ }
  ready = true; applyUi(); paint(); loadImports(); loadSets(); searchIcons('') })
