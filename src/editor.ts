// The sprite editor: pick an item, build its drawing from shapes and effects (or edit the SVG), see it on the field exactly
// as the game draws it, save. Everything you do writes plain SVG into the source tab, so you can always read what it did.
import './style.css'
import './editor.css'
import { KINDS } from './world.ts'
import { I, SHAPES, about, fmt, invert, move, mul, nearestSegment, parsePoints, point, pointsAttr, scale, simplify, smoothPath, snapTo, transformAttr, turn, type M, type P, type Shape } from './editor/geom.ts'

const NS = 'http://www.w3.org/2000/svg'
const UNIT = 32 // sprite units per cell (see scripts/sprite.ts)
const ids = Object.keys(KINDS)
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
let tab: 'props' | 'add' | 'fx' | 'ops' | 'lib' | 'src' = 'add'
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
    status.textContent = 'saved to the game'
    paint(false)
  } catch (e) { status.textContent = `not saved: ${(e as Error).message}` }
  setTimeout(() => { status.textContent = '' }, 2500)
}

// ---------------------------------------------------------------- geometry of the selection

type Box = { x: number; y: number; w: number; h: number }
const unitsOf = (x: number, y: number): [number, number] => { const p = new DOMPoint(x, y).matrixTransform(live!.getScreenCTM()!.inverse()); return [p.x, p.y] }

/** An element's box in sprite units, wherever it has been moved, turned or scaled to. */
function bbox(el: Element): Box {
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

const OPS: Record<string, { label: string; run(): void }> = {
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
  const cells = Array.from({ length: w * h }, (_, i) => `<rect x="${(i % w) + 0.1}" y="${Math.floor(i / w) + 0.1}" width="0.8" height="0.8" rx="0.08"/>`).join('')
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

const swatch = (value: string, title: string, on = false) => `<button class="sw ${on ? 'on' : ''}" data-fill="${esc(value)}" title="${esc(title)}" style="--s:${value === 'currentColor' ? 'var(--c)' : value}"></button>`
const num = (label: string, prop: string, v: number, step = 1) => `<label>${label}<input type="number" step="${step}" data-prop="${prop}" value="${fmt(v)}"></label>`

function propsHtml(): string {
  const el = selEl()
  if (!el) return `<p class="note">Nothing selected. Click a shape in the picture or in the layers list, or add one from the <b>Add</b> tab.</p>`
  const b = bbox(el)
  const fill = attrOf(el, 'fill'), stroke = attrOf(el, 'stroke')
  const mode = (v: string) => v === '' || v === 'currentColor' ? 'accent' : v === 'none' ? 'none' : v.startsWith('url(') ? 'effect' : 'custom'
  const hex = (v: string) => /^#[0-9a-f]{6}$/i.test(v) ? v : '#888888'
  return `<div class="props">
    <h3>${layerLabel(el)}</h3>
    <div class="row"><span>Fill</span><select data-prop="fill-mode">${['accent', 'none', 'custom', 'effect'].map(m => `<option value="${m}" ${mode(fill) === m ? 'selected' : ''} ${m === 'effect' ? 'disabled' : ''}>${m === 'accent' ? 'item colour' : m}</option>`).join('')}</select><input type="color" data-prop="fill-color" value="${hex(fill)}"></div>
    <div class="row"><span>Edge</span><select data-prop="stroke-mode">${['none', 'accent', 'custom'].map(m => `<option value="${m}" ${(stroke === '' || stroke === 'none' ? 'none' : mode(stroke)) === m ? 'selected' : ''}>${m === 'accent' ? 'item colour' : m}</option>`).join('')}</select><input type="color" data-prop="stroke-color" value="${hex(stroke)}">${num('width', 'stroke-width', +attrOf(el, 'stroke-width') || 0, 0.5)}</div>
    <div class="row"><span>Opacity</span><input type="range" min="0" max="1" step="0.05" data-prop="opacity" value="${el.getAttribute('opacity') ?? 1}"></div>
    <div class="row"><span>Position</span>${num('x', 'x', b.x + b.w / 2, 0.5)}${num('y', 'y', b.y + b.h / 2, 0.5)}<small>centre</small></div>
    <div class="row"><span>Size</span>${num('w', 'w', b.w, 0.5)}${num('h', 'h', b.h, 0.5)}<label class="chk"><input type="checkbox" data-prop="lock" ${lockRatio ? 'checked' : ''}> keep ratio</label></div>
    <div class="row quick">${['flipH', 'flipV', 'rotL', 'rotR', 'rot90', 'smaller', 'bigger'].map(o => `<button data-op="${o}">${OPS[o].label}</button>`).join('')}</div>
  </div>`
}

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
    ['Points (polygons and lines)', ['smooth', 'simplify']],
    ['Other', ['ungroup', 'del']],
  ]
  return `${has ? '' : '<p class="note">Select a shape first.</p>'}${groups.map(([t, list]) => `<h3>${t}</h3><div class="opgrid">${list.map(o => `<button data-op="${o}" ${has ? '' : 'disabled'}>${OPS[o].label}</button>`).join('')}</div>`).join('')}`
}

function paint(withSource = true) {
  const bad = problem(draft[cur])
  const k = KINDS[cur]
  root.style.setProperty('--c', color[cur]) // the item colour, for swatches
  // the big stage
  const big = $('[data-big]')
  big.innerHTML = stageHtml(cur, zoom, 1, true)
  live = bad ? null : big.querySelector<SVGSVGElement>('.art > svg:not(.sub)')
  if (live) drawn(live).forEach((el, i) => el.setAttribute('data-i', String(i)))
  if (live && sel !== null && sel >= drawn(live).length) sel = drawn(live).length ? drawn(live).length - 1 : null
  if (!live) sel = null
  $('[data-real]').innerHTML = stageHtml(cur, 22, 1, false)
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
  $('[data-page="props"]').innerHTML = propsHtml()
  $('[data-page="add"]').innerHTML = addHtml()
  $('[data-page="fx"]').innerHTML = fxHtml()
  $('[data-page="ops"]').innerHTML = opsHtml()
  renderLib()
  if (!(document.activeElement instanceof HTMLInputElement && document.activeElement.matches('[data-fpw], [data-fph]'))) { fpW = fpW || k.w; fpH = fpH || k.h; $('[data-footprint]').innerHTML = footprintHtml() }
  for (const t of root.querySelectorAll<HTMLElement>('[data-tool]')) t.classList.toggle('on', t.dataset.tool === tool)
  root.querySelector('.stage.big')!.classList.toggle('penning', tool !== 'select')
  root.querySelector<HTMLElement>('.penopts')!.style.visibility = tool === 'select' ? 'hidden' : 'visible'
  $('[data-penhint]').textContent = tool === 'dots' ? 'click to place points · click the first point or double-click to close · Enter closes · ⌫ removes the last · Esc cancels'
    : tool === 'line' ? 'click to place points · double-click or Enter to finish · ⌫ removes the last · Esc cancels' : tool === 'free' ? 'press and drag to draw; letting go finishes (end near the start to close it)' : 'click shapes to select · double-click a point to remove it · click a + to add one'
  // items and layers
  for (const b of root.querySelectorAll<HTMLElement>('.kinds button')) {
    b.classList.toggle('on', b.dataset.kind === cur)
    b.classList.toggle('dirty', dirty(b.dataset.kind!))
    const t = b.querySelector<HTMLElement>('.thumb')!
    t.style.setProperty('--c', color[b.dataset.kind!])
    t.innerHTML = draft[b.dataset.kind!] ?? ''
  }
  $('[data-layers]').innerHTML = live ? drawn(live).map((el, i) => `<li class="${i === sel ? 'on' : ''}" data-layer="${i}"><span>${layerLabel(el)}</span><button data-op="dup" title="Duplicate">⧉</button><button data-op="del" title="Delete">✕</button></li>`).reverse().join('') || '<li class="note">Empty. Add a shape.</li>' : ''
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
  fpW = 0; fpH = 0
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
  else if ('fit' in d) { zoom = Math.max(24, Math.min(96, Math.floor(520 / Math.max(KINDS[cur].w, KINDS[cur].h + 0.01) / 1.15))); $<HTMLInputElement>('[data-zoom]').value = String(zoom); paint() }
})

root.addEventListener('dblclick', e => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('[data-shape]')
  if (b) { shape = b.dataset.shape!; addShape() }
})

/** Sliders show their effect while you drag (without redrawing the panel under your hand); the change is kept on release. */
root.addEventListener('input', e => {
  const t = e.target as HTMLInputElement
  if (t.matches('[data-src]')) { setDraft(t.value, true); paint(false) }
  else if (t.matches('[data-zoom]')) { zoom = +t.value; paint() }
  else if (t.matches('[data-color]')) { color[cur] = t.value; paint(false) }
  else if (t.matches('[data-newfill]')) { newFill = t.value; paint() }
  else if (t.dataset.prop === 'opacity') { const el = selEl(); if (el) el.setAttribute('opacity', t.value) }
  else if (t.dataset.fxp) fxValue[t.dataset.fxp] = +t.value
})

root.addEventListener('change', e => {
  const t = e.target as HTMLInputElement | HTMLSelectElement
  const el = selEl()
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
  const step = e.shiftKey ? snap * 4 : snap
  const arrows: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
  if (arrows[e.key]) { e.preventDefault(); setMatrix(el, mul(move(...arrows[e.key]), matrixOf(el))); commit() }
  else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); remove(); commit() }
  else if (e.key === '[') { transformSel(scale(0.9)); commit() }
  else if (e.key === ']') { transformSel(scale(1.1)); commit() }
  else if (e.key === 'Escape') select(null)
})

// ---------------------------------------------------------------- footprint: which squares the item takes

let fpW = 0, fpH = 0
/** Change the item's size on the field: the drawing is moved (and, if asked, scaled) with it, then both are saved. */
async function applyFootprint() {
  const k = KINDS[cur]
  const w = Math.max(1, Math.min(12, Math.round(fpW))), h = Math.max(1, Math.min(12, Math.round(fpH)))
  const status = $('[data-status]')
  if (!live) { status.textContent = 'fix the SVG first'; return }
  if (w === k.w && h === k.h) { status.textContent = 'that is already the size'; return }
  const old = vbox(cur)
  k.w = w; k.h = h
  const nu = vbox(cur)
  const scaleIt = $<HTMLInputElement>('[data-fpscale]').checked
  const s = scaleIt ? Math.min(nu.w / old.w, nu.h / old.h) : 1
  const t = mul(move(nu.w / 2, nu.h / 2), mul(scale(s), move(-old.w / 2, -old.h / 2)))
  for (const el of drawn(live)) setMatrix(el, mul(t, matrixOf(el)))
  live.setAttribute('viewBox', `0 0 ${nu.w} ${nu.h}`)
  commit()
  await save()
  try { await api('/kind', cur, { method: 'POST', body: JSON.stringify({ w, h }) }); status.textContent = `${k.name} now takes ${w} × ${h}` } catch (e) { status.textContent = `size not saved: ${(e as Error).message}` }
}

function footprintHtml() {
  const k = KINDS[cur]
  fpW = fpW || k.w; fpH = fpH || k.h
  const cells = Array.from({ length: 144 }, (_, i) => { const x = i % 12, y = Math.floor(i / 12); return `<i data-fp="${x},${y}" class="${x < fpW && y < fpH ? 'on' : ''} ${x < k.w && y < k.h ? 'now' : ''}"></i>` }).join('')
  return `<div class="fp"><div class="fppick" data-fppick>${cells}</div>
    <div class="fpnums"><label>w <input type="number" min="1" max="12" data-fpw value="${fpW}"></label>×<label>h <input type="number" min="1" max="12" data-fph value="${fpH}"></label></div>
    <label class="chk"><input type="checkbox" data-fpscale checked> scale the drawing with it</label>
    <button data-fpapply>Apply and save (${fpW} × ${fpH})</button></div>`
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
function renderLib() { const p = root.querySelector('[data-page="lib"]'); if (p && document.activeElement?.getAttribute('data-iconq') === null) p.innerHTML = libHtml() }

// ---------------------------------------------------------------- events for the tools, footprint and library

function setTool(t: typeof tool) {
  tool = t
  pen = null
  paint(false)
}

root.addEventListener('click', async e => {
  const t = (e.target as HTMLElement).closest<HTMLElement>('button, [data-fp]')
  if (!t) return
  const d = t.dataset
  if (d.tool) setTool(d.tool as typeof tool)
  else if (d.fp) { const [x, y] = d.fp.split(',').map(Number); fpW = x + 1; fpH = y + 1; $('[data-footprint]').innerHTML = footprintHtml() }
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
  else if (t.matches('[data-fpw]')) { fpW = Math.max(1, Math.min(12, +t.value || 1)); $('[data-footprint]').innerHTML = footprintHtml() }
  else if (t.matches('[data-fph]')) { fpH = Math.max(1, Math.min(12, +t.value || 1)); $('[data-footprint]').innerHTML = footprintHtml() }
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
  box.innerHTML = `<div class="bprev" style="--c:${color[cur]}">${x.svg}</div>
    <h3>${esc(x.name)}</h3>
    <p class="note">${s ? `${esc(s.name)} · ${esc(s.license)}` : 'your import'}${dims ? ` · ${dims[1]} × ${dims[2]} grid` : ''}</p>
    <label class="row"><span>fit</span><input type="number" min="10" max="100" step="5" data-fitpct2 value="${fitPct}" style="width:54px">%&nbsp;of the footprint</label>
    <div class="acts"><button class="primary" data-badd>Add to ${esc(KINDS[cur].name)}</button><button data-baddclose>Add and close</button></div>
    <div class="acts"><button data-breplace>Replace the sprite</button>${bSet === 'imports' ? '<button data-bdel>Delete import</button>' : '<button data-bkeep>Keep in my imports</button>'}</div>
    <p class="note" data-bnote></p>`
}

async function bAct(what: 'add' | 'addclose' | 'replace' | 'keep' | 'del') {
  const x = bItems[bSel]
  if (!x) return
  const note = () => bq<HTMLElement>('[data-bnote]')
  if (what === 'add' || what === 'addclose') { addImport(x.svg); if (what === 'addclose') closeBrowser(); else if (note()) note().textContent = `added to ${KINDS[cur].name} ✓` }
  else if (what === 'replace') { replaceWithImport(x.svg); closeBrowser() }
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

// ---------------------------------------------------------------- the page

root.innerHTML = `
  <aside class="panel left">
    <h2>Items</h2>
    <div class="kinds">${ids.map(id => `<button data-kind="${id}"><span class="thumb"></span><span><b>${KINDS[id].name}</b><small>${KINDS[id].w} × ${KINDS[id].h}</small></span></button>`).join('')}</div>
    <h2>Footprint</h2>
    <div data-footprint></div>
    <h2>Layers <small>(top is in front)</small></h2>
    <ul class="layers" data-layers></ul>
  </aside>
  <main class="panel view">
    <div class="bar">
      <button data-undo title="⌘Z">↶ Undo</button><button data-redo title="⇧⌘Z">↷ Redo</button>
      <label>zoom <input type="range" min="24" max="96" value="${zoom}" data-zoom></label><button data-fit>fit</button>
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
    <div class="stages"><div class="stage big"><span>click to select · drag to move · corners resize · arrows nudge</span><div data-big></div></div><div class="stage"><span>in game (22px cells)</span><div data-real></div></div></div>
    <div class="err" data-err></div>
    <p class="note">Keys: <kbd>←↑↓→</kbd> nudge (<kbd>⇧</kbd> ×4) · <kbd>[</kbd> <kbd>]</kbd> smaller / bigger · <kbd>⌘D</kbd> duplicate · <kbd>⌫</kbd> delete · <kbd>⌘Z</kbd> undo · <kbd>⌘S</kbd> save · hold <kbd>⌥</kbd> while resizing for free stretch. Draw in the item colour and it follows the item. A sprite is plain SVG at ${UNIT} units per cell, in <code>src/sprites/</code>.</p>
  </main>
  <section class="panel side">
    <h2 data-title></h2>
    <div class="tabs">${[['add', 'Add'], ['props', 'Props'], ['fx', 'Effects'], ['ops', 'Ops'], ['lib', 'Library'], ['src', 'SVG']].map(([t, l]) => `<button data-tab="${t}">${l}</button>`).join('')}</div>
    <div class="pages">
      <div data-page="add"></div><div data-page="props"></div><div data-page="fx"></div><div data-page="ops"></div><div data-page="lib"></div>
      <div data-page="src"><textarea spellcheck="false" data-src></textarea><div class="acts"><button data-tidy>Tidy</button></div></div>
    </div>
    <div class="acts foot">
      <button class="primary" data-save>Save to game (⌘S)</button><label><input type="checkbox" data-auto> autosave</label>
      <button data-revert>Revert</button><button data-reset>Original icon</button>
      <select data-copy><option value="">Copy from…</option>${ids.map(id => `<option value="${id}">${KINDS[id].name}</option>`).join('')}</select>
      <span class="note" data-status></span>
    </div>
  </section>`

Promise.all(ids.map(async id => {
  saved[id] = await api('', id)
  let d = saved[id]
  try { d = localStorage.getItem(`sprite-draft:${id}`) ?? d } catch { /* private window */ }
  draft[id] = d
  hist[id] = { stack: [d], at: 0, t: 0 }
})).then(() => { paint(); loadImports(); loadSets(); searchIcons('') })
