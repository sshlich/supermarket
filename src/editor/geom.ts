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
