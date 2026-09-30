// Pure helpers for the sprite editor: 2D matrices as SVG writes them, and the shape generators. No DOM in here, so it runs under node.

/** [a, b, c, d, e, f], the same six numbers as SVG's matrix(). */
export type M = [number, number, number, number, number, number]
export const I: M = [1, 0, 0, 1, 0, 0]

/** Apply `b` first, then `a` (so mul(a, b) is "a after b", like matrix multiplication). */
export const mul = (a: M, b: M): M => [
  a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
  a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
  a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5],
]
export const move = (dx: number, dy: number): M => [1, 0, 0, 1, dx, dy]
export const scale = (sx: number, sy = sx): M => [sx, 0, 0, sy, 0, 0]
export const turn = (deg: number): M => { const r = deg * Math.PI / 180; return [Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0] }
/** Do `m` about the point (x, y) instead of the origin. */
export const about = (m: M, x: number, y: number): M => mul(move(x, y), mul(m, move(-x, -y)))
export const invert = (m: M): M => {
  const det = m[0] * m[3] - m[1] * m[2] || 1e-12
  return [m[3] / det, -m[1] / det, -m[2] / det, m[0] / det, (m[2] * m[5] - m[3] * m[4]) / det, (m[1] * m[4] - m[0] * m[5]) / det]
}
export const point = (m: M, x: number, y: number): [number, number] => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]

/** Short numbers: at most 3 decimals, no trailing zeros, no "-0". */
export const fmt = (n: number) => String(+n.toFixed(3) + 0)

/** The transform attribute for a matrix: nothing for identity, translate() when that is all it is, else matrix(). */
export function transformAttr(m: M): string | null {
  if (m.every((v, i) => Math.abs(v - I[i]) < 1e-6)) return null
  if (Math.abs(m[0] - 1) < 1e-6 && Math.abs(m[1]) < 1e-6 && Math.abs(m[2]) < 1e-6 && Math.abs(m[3] - 1) < 1e-6) return `translate(${fmt(m[4])} ${fmt(m[5])})`
  return `matrix(${m.map(fmt).join(' ')})`
}

export const snapTo = (v: number, step: number) => Math.round(v / step) * step

// ---------------------------------------------------------------- shape generators

export type Param = { key: string; label: string; value: number; min: number; max: number; step?: number } | { key: string; label: string; text: string }
export interface Shape { label: string; params: Param[]; make(p: Record<string, number | string>, cx: number, cy: number, fill: string): string }

const pts = (list: [number, number][]) => list.map(([x, y]) => `${fmt(x)},${fmt(y)}`).join(' ')
/** n points on a circle of radius r, starting at the top. */
const ring = (n: number, r: number, cx: number, cy: number, start = -90): [number, number][] =>
  Array.from({ length: n }, (_, i) => { const a = (start + (360 * i) / n) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)] })
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

const size = (value = 24): Param => ({ key: 'size', label: 'size', value, min: 2, max: 240 })
const N = (label: string, value: number, min: number, max: number): Param => ({ key: 'n', label, value, min, max })

export const SHAPES: Record<string, Shape> = {
  rect: { label: 'Rectangle', params: [size(32), { key: 'h', label: 'height', value: 24, min: 2, max: 240 }], make: (p, cx, cy, f) => `<rect x="${fmt(cx - +p.size / 2)}" y="${fmt(cy - +p.h / 2)}" width="${fmt(+p.size)}" height="${fmt(+p.h)}" fill="${f}"/>` },
  rounded: { label: 'Rounded rect', params: [size(32), { key: 'h', label: 'height', value: 24, min: 2, max: 240 }, { key: 'r', label: 'corner', value: 6, min: 0, max: 60 }], make: (p, cx, cy, f) => `<rect x="${fmt(cx - +p.size / 2)}" y="${fmt(cy - +p.h / 2)}" width="${fmt(+p.size)}" height="${fmt(+p.h)}" rx="${fmt(+p.r)}" fill="${f}"/>` },
  circle: { label: 'Circle', params: [size(28)], make: (p, cx, cy, f) => `<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(+p.size / 2)}" fill="${f}"/>` },
  ellipse: { label: 'Ellipse', params: [size(40), { key: 'h', label: 'height', value: 22, min: 2, max: 240 }], make: (p, cx, cy, f) => `<ellipse cx="${fmt(cx)}" cy="${fmt(cy)}" rx="${fmt(+p.size / 2)}" ry="${fmt(+p.h / 2)}" fill="${f}"/>` },
  ring: { label: 'Ring', params: [size(32), { key: 'w', label: 'thickness', value: 5, min: 1, max: 40 }], make: (p, cx, cy, f) => `<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(+p.size / 2 - +p.w / 2)}" fill="none" stroke="${f}" stroke-width="${fmt(+p.w)}"/>` },
  line: { label: 'Line', params: [size(40), { key: 'w', label: 'thickness', value: 4, min: 1, max: 40 }], make: (p, cx, cy, f) => `<line x1="${fmt(cx - +p.size / 2)}" y1="${fmt(cy)}" x2="${fmt(cx + +p.size / 2)}" y2="${fmt(cy)}" stroke="${f}" stroke-width="${fmt(+p.w)}" stroke-linecap="round"/>` },
  zigzag: { label: 'Zigzag', params: [size(48), N('teeth', 4, 2, 12), { key: 'w', label: 'thickness', value: 3, min: 1, max: 20 }], make: (p, cx, cy, f) => {
    const n = Math.round(+p.n), out: [number, number][] = []
    for (let i = 0; i <= n * 2; i++) out.push([cx - +p.size / 2 + (+p.size * i) / (n * 2), cy + (i % 2 ? 8 : -8)])
    return `<polyline points="${pts(out)}" fill="none" stroke="${f}" stroke-width="${fmt(+p.w)}" stroke-linejoin="round" stroke-linecap="round"/>`
  } },
  triangle: { label: 'Triangle', params: [size(32)], make: (p, cx, cy, f) => `<polygon points="${pts(ring(3, +p.size / 2, cx, cy + +p.size / 8))}" fill="${f}"/>` },
  diamond: { label: 'Diamond', params: [size(32)], make: (p, cx, cy, f) => `<polygon points="${pts(ring(4, +p.size / 2, cx, cy))}" fill="${f}"/>` },
  polygon: { label: 'Polygon', params: [size(32), N('sides', 6, 3, 16)], make: (p, cx, cy, f) => `<polygon points="${pts(ring(Math.round(+p.n), +p.size / 2, cx, cy))}" fill="${f}"/>` },
  star: { label: 'Star', params: [size(36), N('points', 5, 3, 12), { key: 'i', label: 'inner %', value: 45, min: 10, max: 90 }], make: (p, cx, cy, f) => {
    const n = Math.round(+p.n), R = +p.size / 2, r = R * +p.i / 100
    const out: [number, number][] = []
    for (let i = 0; i < n * 2; i++) { const a = (-90 + (180 * i) / n) * Math.PI / 180, rr = i % 2 ? r : R; out.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]) }
    return `<polygon points="${pts(out)}" fill="${f}"/>`
  } },
  cross: { label: 'Cross', params: [size(32), { key: 'w', label: 'arm', value: 10, min: 2, max: 60 }], make: (p, cx, cy, f) => {
    const s = +p.size / 2, a = +p.w / 2
    return `<polygon points="${pts([[cx - a, cy - s], [cx + a, cy - s], [cx + a, cy - a], [cx + s, cy - a], [cx + s, cy + a], [cx + a, cy + a], [cx + a, cy + s], [cx - a, cy + s], [cx - a, cy + a], [cx - s, cy + a], [cx - s, cy - a], [cx - a, cy - a]])}" fill="${f}"/>`
  } },
  arrow: { label: 'Arrow', params: [size(44), { key: 'w', label: 'shaft', value: 10, min: 2, max: 40 }], make: (p, cx, cy, f) => {
    const s = +p.size / 2, a = +p.w / 2, head = Math.min(s * 0.8, 18)
    return `<polygon points="${pts([[cx - s, cy - a], [cx + s - head, cy - a], [cx + s - head, cy - head], [cx + s, cy], [cx + s - head, cy + head], [cx + s - head, cy + a], [cx - s, cy + a]])}" fill="${f}"/>`
  } },
  chevron: { label: 'Chevron', params: [size(28), { key: 'w', label: 'thickness', value: 6, min: 1, max: 30 }], make: (p, cx, cy, f) => `<polyline points="${pts([[cx - +p.size / 2, cy - +p.size / 2], [cx, cy], [cx - +p.size / 2, cy + +p.size / 2]])}" fill="none" stroke="${f}" stroke-width="${fmt(+p.w)}" stroke-linejoin="miter" stroke-linecap="butt"/>` },
  text: { label: 'Glyph', params: [{ key: 'ch', label: 'character', text: '#' }, size(24)], make: (p, cx, cy, f) => `<text x="${fmt(cx)}" y="${fmt(cy)}" font-family="ui-monospace, Menlo, monospace" font-size="${fmt(+p.size)}" text-anchor="middle" dominant-baseline="central" fill="${f}">${esc(String(p.ch || '#'))}</text>` },
}

// ---------------------------------------------------------------- pen tools: dots, freehand, smoothing

export type P = [number, number]
export const parsePoints = (s: string): P[] => {
  const n = s.trim().split(/[\s,]+/).map(Number).filter(v => !Number.isNaN(v))
  const out: P[] = []
  for (let i = 0; i + 1 < n.length; i += 2) out.push([n[i], n[i + 1]])
  return out
}
export const pointsAttr = (p: P[]) => p.map(([x, y]) => `${fmt(x)},${fmt(y)}`).join(' ')

const distToSegment = ([px, py]: P, [ax, ay]: P, [bx, by]: P) => {
  const dx = bx - ax, dy = by - ay
  const l = dx * dx + dy * dy
  const t = l ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l)) : 0
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

/** Ramer–Douglas–Peucker: the fewest points that keep the line within `eps` of what was drawn. */
export function simplify(pts: P[], eps: number): P[] {
  if (pts.length < 3) return pts
  let far = 0, at = 0
  for (let i = 1; i < pts.length - 1; i++) { const d = distToSegment(pts[i], pts[0], pts[pts.length - 1]); if (d > far) { far = d; at = i } }
  if (far <= eps) return [pts[0], pts[pts.length - 1]]
  return [...simplify(pts.slice(0, at + 1), eps).slice(0, -1), ...simplify(pts.slice(at), eps)]
}

/** A smooth curve through the points (Catmull–Rom, written as cubic Béziers), closed or open. */
export function smoothPath(pts: P[], closed: boolean, tension = 0.5): string {
  const n = pts.length
  if (n < 3) return `M${pts.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join('L')}`
  const at = (i: number): P => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]
  let d = `M${fmt(pts[0][0])} ${fmt(pts[0][1])}`
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2)
    const k = tension / 3 * 2 // 1/3 of the way for the usual 0.5 tension
    d += `C${fmt(p1[0] + (p2[0] - p0[0]) * k / 2)} ${fmt(p1[1] + (p2[1] - p0[1]) * k / 2)} ${fmt(p2[0] - (p3[0] - p1[0]) * k / 2)} ${fmt(p2[1] - (p3[1] - p1[1]) * k / 2)} ${fmt(p2[0])} ${fmt(p2[1])}`
  }
  return closed ? d + 'Z' : d
}

/** The index of the segment nearest to a point (segment i joins point i and i+1; the last joins back to the first when closed). */
export function nearestSegment(pts: P[], p: P, closed: boolean): { i: number; d: number } {
  let best = { i: 0, d: Infinity }
  const n = closed ? pts.length : pts.length - 1
  for (let i = 0; i < n; i++) { const d = distToSegment(p, pts[i], pts[(i + 1) % pts.length]); if (d < best.d) best = { i, d } }
  return best
}

// ---------------------------------------------------------------- paths: parse once, then bounds and pieces without asking the browser

/** A path as absolute moves, lines and cubic curves only (everything else is converted). */
export type Seg = ['M', number, number] | ['L', number, number] | ['C', number, number, number, number, number, number] | ['Z']

const angle = (ux: number, uy: number, vx: number, vy: number) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy)

/** An SVG elliptical arc as one to four cubic curves. */
function arcToCubics(x0: number, y0: number, rx: number, ry: number, rot: number, fa: number, fs: number, x: number, y: number): Seg[] {
  if (!rx || !ry || (x0 === x && y0 === y)) return [['L', x, y]]
  rx = Math.abs(rx); ry = Math.abs(ry)
  const phi = (rot * Math.PI) / 180, cos = Math.cos(phi), sin = Math.sin(phi)
  const dx = (x0 - x) / 2, dy = (y0 - y) / 2
  const x1 = cos * dx + sin * dy, y1 = -sin * dx + cos * dy
  const lam = (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry)
  if (lam > 1) { rx *= Math.sqrt(lam); ry *= Math.sqrt(lam) }
  const num = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1
  const den = rx * rx * y1 * y1 + ry * ry * x1 * x1
  const coef = (fa === fs ? -1 : 1) * Math.sqrt(Math.max(0, num / den))
  const cxp = (coef * rx * y1) / ry, cyp = (-coef * ry * x1) / rx
  const cx = cos * cxp - sin * cyp + (x0 + x) / 2, cy = sin * cxp + cos * cyp + (y0 + y) / 2
  const t1 = angle(1, 0, (x1 - cxp) / rx, (y1 - cyp) / ry)
  let dt = angle((x1 - cxp) / rx, (y1 - cyp) / ry, (-x1 - cxp) / rx, (-y1 - cyp) / ry)
  if (!fs && dt > 0) dt -= 2 * Math.PI
  if (fs && dt < 0) dt += 2 * Math.PI
  const n = Math.max(1, Math.ceil(Math.abs(dt) / (Math.PI / 2) - 1e-9))
  const step = dt / n, k = (4 / 3) * Math.tan(step / 4)
  const at = (t: number): [number, number, number, number] => { // point and its tangent on the unit circle, mapped through the ellipse
    const c = Math.cos(t), s = Math.sin(t)
    return [cx + rx * c * cos - ry * s * sin, cy + rx * c * sin + ry * s * cos, -rx * s * cos - ry * c * sin, -rx * s * sin + ry * c * cos]
  }
  const out: Seg[] = []
  for (let i = 0; i < n; i++) {
    const a = at(t1 + i * step), b = at(t1 + (i + 1) * step)
    out.push(['C', a[0] + k * a[2], a[1] + k * a[3], b[0] - k * b[2], b[1] - k * b[3], i === n - 1 ? x : b[0], i === n - 1 ? y : b[1]])
  }
  return out
}

export function parsePath(d: string): Seg[] {
  const out: Seg[] = []
  let i = 0
  const sep = () => { while (i < d.length && /[\s,]/.test(d[i])) i++ }
  const num = () => { sep(); const re = /[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/y; re.lastIndex = i; const m = re.exec(d); if (!m) throw new Error('bad path'); i = re.lastIndex; return +m[0] }
  const flag = () => { sep(); return d[i++] === '1' ? 1 : 0 }
  let cx = 0, cy = 0, sx = 0, sy = 0, cmd = '', c2: P | null = null, q: P | null = null
  try {
    for (;;) {
      sep()
      if (i >= d.length) break
      if (/[A-Za-z]/.test(d[i])) cmd = d[i++]
      else if (cmd === 'M') cmd = 'L'
      else if (cmd === 'm') cmd = 'l'
      const rel = cmd === cmd.toLowerCase()
      const ox = rel ? cx : 0, oy = rel ? cy : 0
      const U = cmd.toUpperCase()
      let nc2: P | null = null, nq: P | null = null
      if (U === 'Z') { out.push(['Z']); cx = sx; cy = sy }
      else if (U === 'M') { const x = num() + ox, y = num() + oy; out.push(['M', x, y]); cx = sx = x; cy = sy = y }
      else if (U === 'L') { const x = num() + ox, y = num() + oy; out.push(['L', x, y]); cx = x; cy = y }
      else if (U === 'H') { const x = num() + ox; out.push(['L', x, cy]); cx = x }
      else if (U === 'V') { const y = num() + oy; out.push(['L', cx, y]); cy = y }
      else if (U === 'C') { const a = num() + ox, b = num() + oy, c = num() + ox, e = num() + oy, x = num() + ox, y = num() + oy; out.push(['C', a, b, c, e, x, y]); nc2 = [c, e]; cx = x; cy = y }
      else if (U === 'S') { const c = num() + ox, e = num() + oy, x = num() + ox, y = num() + oy; const a: number = c2 ? 2 * cx - c2[0] : cx, b: number = c2 ? 2 * cy - c2[1] : cy; out.push(['C', a, b, c, e, x, y]); nc2 = [c, e]; cx = x; cy = y }
      else if (U === 'Q') { const a = num() + ox, b = num() + oy, x = num() + ox, y = num() + oy; out.push(['C', cx + (2 / 3) * (a - cx), cy + (2 / 3) * (b - cy), x + (2 / 3) * (a - x), y + (2 / 3) * (b - y), x, y]); nq = [a, b]; cx = x; cy = y }
      else if (U === 'T') { const x = num() + ox, y = num() + oy; const a: number = q ? 2 * cx - q[0] : cx, b: number = q ? 2 * cy - q[1] : cy; out.push(['C', cx + (2 / 3) * (a - cx), cy + (2 / 3) * (b - cy), x + (2 / 3) * (a - x), y + (2 / 3) * (b - y), x, y]); nq = [a, b]; cx = x; cy = y }
      else if (U === 'A') { const rx = num(), ry = num(), rot = num(), fa = flag(), fs = flag(), x = num() + ox, y = num() + oy; out.push(...arcToCubics(cx, cy, rx, ry, rot, fa, fs, x, y)); cx = x; cy = y }
      else break
      c2 = nc2; q = nq
    }
  } catch { /* keep what parsed */ }
  return out
}

export const pathString = (segs: Seg[]) => segs.map(s => s[0] === 'Z' ? 'Z' : `${s[0]}${(s.slice(1) as number[]).map(fmt).join(' ')}`).join('')

/** One list of segments per subpath (each starting with its own M), so a compound path can be pulled apart. */
export function splitSubpaths(segs: Seg[]): Seg[][] {
  const out: Seg[][] = []
  let cur: Seg[] = []
  for (const s of segs) {
    if (s[0] === 'M' && cur.length) { out.push(cur); cur = [] }
    cur.push(s)
  }
  if (cur.length) out.push(cur)
  return out.filter(p => p.length > 1)
}

/** Where the curve leaves its box: the t values in (0, 1) at which one coordinate of a cubic stops changing. */
function cubicExtrema(p0: number, p1: number, p2: number, p3: number): number[] {
  const u = p1 - p0, v = p2 - p1, w = p3 - p2
  const A = u - 2 * v + w, B = 2 * (v - u), C = u
  const ts: number[] = []
  if (Math.abs(A) < 1e-12) { if (Math.abs(B) > 1e-12) ts.push(-C / B) }
  else { const D = B * B - 4 * A * C; if (D >= 0) { const r = Math.sqrt(D); ts.push((-B + r) / (2 * A), (-B - r) / (2 * A)) } }
  return ts.filter(t => t > 0 && t < 1)
}

/** The exact box of a path seen through a matrix: transform the curves (an affine map keeps them curves), then find their extremes. */
export function pathBounds(segs: Seg[], m: M): { x: number; y: number; w: number; h: number } | null {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
  const add = (x: number, y: number) => { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y }
  let cx = 0, cy = 0
  for (const s of segs) {
    if (s[0] === 'M' || s[0] === 'L') { [cx, cy] = point(m, s[1], s[2]); add(cx, cy) }
    else if (s[0] === 'C') {
      const a = point(m, s[1], s[2]), b = point(m, s[3], s[4]), e = point(m, s[5], s[6])
      add(e[0], e[1])
      for (const t of cubicExtrema(cx, a[0], b[0], e[0])) add(bez(cx, a[0], b[0], e[0], t), bez(cy, a[1], b[1], e[1], t))
      for (const t of cubicExtrema(cy, a[1], b[1], e[1])) add(bez(cx, a[0], b[0], e[0], t), bez(cy, a[1], b[1], e[1], t))
      cx = e[0]; cy = e[1]
    }
  }
  return Number.isFinite(x0) ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null
}
const bez = (p0: number, p1: number, p2: number, p3: number, t: number) => { const s = 1 - t; return s * s * s * p0 + 3 * s * s * t * p1 + 3 * s * t * t * p2 + t * t * t * p3 }
