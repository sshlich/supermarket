// The sprite editor: pick an item, build its drawing from shapes and effects (or edit the SVG), see it on the field exactly
// as the game draws it, save. Everything you do writes plain SVG into the source tab, so you can always read what it did.
import './style.css'
import './editor.css'
import { KINDS } from './world.ts'
import { I, SHAPES, about, fmt, move, mul, scale, snapTo, transformAttr, turn, type M, type Shape } from './editor/geom.ts'

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
let tab: 'props' | 'add' | 'fx' | 'ops' | 'src' = 'add'
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
      <div class="art" style="--kw:${k.w};--kh:${k.h};--r:${rot ? 90 : 0}deg">${draft[id] ?? ''}${interactive ? `<svg class="sub" viewBox="0 0 ${vw} ${vh}">${lines.join('')}<g class="selg"></g></svg>` : ''}</div>
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

/** The selection box and its four resize handles, in sprite units. */
function drawSelection() {
  const g = root.querySelector('.selg')
  const el = selEl()
  if (!g || !el) return
  const b = bbox(el)
  const hs = 9 / (zoom / UNIT)
  const corner = (name: string, x: number, y: number) => `<rect class="h" data-handle="${name}" x="${x - hs / 2}" y="${y - hs / 2}" width="${hs}" height="${hs}"/>`
  g.innerHTML = `<rect class="box" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}"/>${corner('nw', b.x, b.y)}${corner('ne', b.x + b.w, b.y)}${corner('sw', b.x, b.y + b.h)}${corner('se', b.x + b.w, b.y + b.h)}`
}

function select(i: number | null, goTo = false) {
  sel = i
  if (goTo && i !== null && tab === 'add') tab = 'props'
  paint()
}

function switchTo(id: string) {
  cur = id
  sel = null
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

function pointerdown(e: PointerEvent) {
  if (!live || e.button !== 0) return
  const handle = (e.target as Element).closest<HTMLElement>('[data-handle]')
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
  const mod = e.metaKey || e.ctrlKey
  if (mod && e.key === 's') { e.preventDefault(); save(); return }
  if (mod && e.key.toLowerCase() === 'z' && !inField(e.target)) { e.preventDefault(); undo(e.shiftKey ? 1 : -1); return }
  if (inField(e.target)) return
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

// ---------------------------------------------------------------- the page

root.innerHTML = `
  <aside class="panel left">
    <h2>Items</h2>
    <div class="kinds">${ids.map(id => `<button data-kind="${id}"><span class="thumb"></span><span><b>${KINDS[id].name}</b><small>${KINDS[id].w} × ${KINDS[id].h}</small></span></button>`).join('')}</div>
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
    <div class="stages"><div class="stage big"><span>click to select · drag to move · corners resize · arrows nudge</span><div data-big></div></div><div class="stage"><span>in game (22px cells)</span><div data-real></div></div></div>
    <div class="err" data-err></div>
    <p class="note">Keys: <kbd>←↑↓→</kbd> nudge (<kbd>⇧</kbd> ×4) · <kbd>[</kbd> <kbd>]</kbd> smaller / bigger · <kbd>⌘D</kbd> duplicate · <kbd>⌫</kbd> delete · <kbd>⌘Z</kbd> undo · <kbd>⌘S</kbd> save · hold <kbd>⌥</kbd> while resizing for free stretch. Draw in the item colour and it follows the item. A sprite is plain SVG at ${UNIT} units per cell, in <code>src/sprites/</code>.</p>
  </main>
  <section class="panel side">
    <h2 data-title></h2>
    <div class="tabs">${[['add', 'Add'], ['props', 'Properties'], ['fx', 'Effects'], ['ops', 'Operations'], ['src', 'SVG']].map(([t, l]) => `<button data-tab="${t}">${l}</button>`).join('')}</div>
    <div class="pages">
      <div data-page="add"></div><div data-page="props"></div><div data-page="fx"></div><div data-page="ops"></div>
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
})).then(() => paint())
