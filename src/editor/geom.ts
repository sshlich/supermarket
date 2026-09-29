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
