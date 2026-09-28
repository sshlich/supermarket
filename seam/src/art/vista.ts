// Seeded vistas (DESIGN 13.3): a gradient, layered silhouettes, grain, then dithered to the level's palette. Scale is
// the point: every picture has something enormous in it, and a person, very small.

import { dither } from './dither.ts'

export const W = 200
export const H = 72
const cache = new Map<string, string>()

/** A small seeded generator (mulberry32 over a string hash), so a place always looks the same. */
function seeded(key: string) {
  let h = 2166136261
  for (const ch of key) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return () => {
    h = (h + 0x6d2b79f5) | 0
    let t = Math.imul(h ^ (h >>> 15), h | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

class Canvas {
  lum = new Float32Array(W * H)
  put(x: number, y: number, v: number) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < W && y < H) this.lum[y * W + x] = v }
  rect(x: number, y: number, w: number, h: number, v: number) { for (let j = Math.max(0, Math.round(y)); j < Math.min(H, Math.round(y + h)); j++) for (let i = Math.max(0, Math.round(x)); i < Math.min(W, Math.round(x + w)); i++) this.lum[j * W + i] = v }
  line(x0: number, y0: number, x1: number, y1: number, v: number) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let k = 0; k <= n; k++) this.put(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, v) }
  gradient(stops: [number, number][]) {
    for (let y = 0; y < H; y++) {
      const t = y / (H - 1)
      const i = Math.max(0, stops.findIndex(([at]) => at >= t) - 1)
      const [a, va] = stops[i], [b, vb] = stops[Math.min(i + 1, stops.length - 1)]
      const v = b === a ? va : va + (vb - va) * (t - a) / (b - a)
      for (let x = 0; x < W; x++) this.lum[y * W + x] = v
    }
  }
  glow(cx: number, cy: number, r: number, v: number) {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const d = Math.hypot((x - cx) / 1.6, y - cy) / r
      if (d < 1) this.lum[y * W + x] = Math.max(this.lum[y * W + x], v * (1 - d) + this.lum[y * W + x] * d)
    }
  }
  ellipse(cx: number, cy: number, rx: number, ry: number, v: number) { for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) if ((x / rx) ** 2 + (y / ry) ** 2 <= 1) this.put(cx + x, cy + y, v) }
  /** A person, for scale: two pixels wide at most, five tall. */
  person(x: number, floor: number, v = 0.02) { this.rect(x, floor - 4, 1, 4, v); this.put(x, floor - 5, v); this.put(x + 1, floor - 3, v) }
}

const FLOOR = 60

/** The level's world: what's enormous there. */
function level(c: Canvas, scene: string, r: () => number) {
  if (scene === 'galleries') {
    c.gradient([[0, 0.22], [0.5, 0.62], [0.8, 0.3], [1, 0.12]])
    for (const [y, h] of [[4, 7], [15, 5], [24, 3]]) { c.rect(0, y, W, h, 0.3); c.rect(0, y, W, 1, 0.7) } // conduits as wide as streets
    for (let x = 8 + r() * 10; x < W; x += 26 + r() * 12) c.rect(x, 27, 3, FLOOR - 27, 0.26)
  } else if (scene === 'ducts') {
    c.gradient([[0, 0.08], [0.55, 0.42], [0.56, 0.3], [1, 0.05]])
    for (let x = 6; x < W; x += 34) for (let a = 0; a < Math.PI; a += 0.03) c.put(x + 14 + Math.cos(a) * 14, 40 - Math.sin(a) * 16, 0.62) // duct mouths
    for (let y = 41; y < H; y++) for (let x = 0; x < W; x++) { // a second ceiling beneath the water
      const src = c.lum[(80 - y) * W + x]
      c.lum[y * W + x] = y % 3 === 0 ? 0.05 : src * 0.55
    }
  } else if (scene === 'stair') {
    c.gradient([[0, 0.85], [0.45, 0.45], [1, 0.1]])
    for (let x = 4; x < W; x += 12) { c.rect(x, 0, 1, H, 0.95); if (r() < 0.4) c.line(x, r() * 30, x + 6 + r() * 6, 20 + r() * 30, 0.9) } // glass, cracked
    for (let k = 0; k < 18; k++) c.rect(20 + k * 9, FLOOR - 4 - k * 3.3, 11, 2, 0.1) // twenty floors of stairs
  } else if (scene === 'hall') {
    c.gradient([[0, 0.05], [0.6, 0.2], [1, 0.08]])
    c.glow(W / 2, 34, 32, 0.95) // something at the far end, singing
    for (let k = 0; k < 6; k++) {
      const w = 180 - k * 28, h = 66 - k * 9
      for (let a = 0; a < Math.PI; a += 0.01) c.put(W / 2 + Math.cos(a) * w / 2, FLOOR - Math.pow(Math.sin(a), 0.6) * h, 0.35 + k * 0.08)
    }
  } else if (scene === 'u0041') {
    c.gradient([[0, 0.5], [1, 0.38]])
    for (let row = 0; row < 4; row++) for (let x = 0; x < W; x += 16 - row * 3) c.rect(x + row * 5, 3 + row * 6, 5 - row, 1, 1) // the lights are already on
    for (let x = -W; x < 2 * W; x += 20) c.line(W / 2, 30, x, H, 0.3)
    c.rect(0, 30, W, 1, 0.3)
  } else { // the Seam: a crawlspace between floors
    c.gradient([[0, 0.05], [0.25, 0.1], [0.3, 0.4], [1, 0.15]])
    for (const x of [30, 90, 150]) c.glow(x, 32, 16, 0.85) // lamps over the moss
    for (let x = 12; x < W; x += 22) c.rect(x, 22, 2, FLOOR - 22, 0.12)
  }
}

/** What's particular to the site, in the foreground, standing on `FLOOR`. */
function site(c: Canvas, type: string, r: () => number, FLOOR: number) {
  if (type === 'nest') for (let k = 0; k < 7; k++) c.ellipse(20 + r() * 160, FLOOR + 2, 6 + r() * 10, 3 + r() * 3, 0.06)
  else if (type === 'tower') { c.rect(120, 2, 14, FLOOR - 2, 0.03); c.rect(126, FLOOR - 7, 2, 1, 1) }
  else if (type === 'works') {
    for (let x = 100; x < 190; x += 8) c.rect(x, 12, 1, FLOOR - 12, 0.1)
    for (let y = 14; y < FLOOR; y += 9) c.rect(100, y, 90, 1, 0.1)
    c.rect(150, 22, 16, FLOOR - 22, 0.02); c.rect(146, 26, 24, 6, 0.02) // a Mason, patient as a glacier
  } else if (type === 'terminal') { c.rect(128, FLOOR - 9, 12, 9, 0.05); c.rect(130, FLOOR - 8, 6, 4, 1) }
  else if (type === 'cache') for (let y = 20; y < FLOOR; y += 8) { c.rect(110, y, 70, 1, 0.08); for (let x = 112; x < 178; x += 9) if (r() < 0.5) c.rect(x, y - 3, 4, 3, 0.2) }
  else if (type === 'lever') for (let a = 0; a < 2 * Math.PI; a += 0.02) { c.put(140 + Math.cos(a) * 14, 34 + Math.sin(a) * 14, 0.05); if (a % 1.05 < 0.03) c.line(140, 34, 140 + Math.cos(a) * 14, 34 + Math.sin(a) * 14, 0.05) }
  else if (type === 'connection') { c.rect(128, 18, 3, FLOOR - 18, 0.05); c.rect(152, 18, 3, FLOOR - 18, 0.05); c.rect(128, 18, 27, 3, 0.05); c.rect(131, 21, 21, FLOOR - 21, 0.02) }
}

/** A picture of a place, as a data URL, dithered to `palette` (darkest first). */
export function vista(key: string, scene: string, type: string, palette: string[]): string {
  const id = `${key}|${scene}|${type}`
  const hit = cache.get(id)
  if (hit) return hit
  const r = seeded(id)
  const c = new Canvas()
  level(c, scene, r)
  // The floor you stand on; in the Ducts, a walkway at the waterline.
  const floor = scene === 'ducts' ? 40 : FLOOR
  if (scene === 'ducts') c.rect(40, floor, 110, 2, 0.02)
  else c.rect(0, FLOOR, W, H - FLOOR, Math.min(...c.lum.slice(FLOOR * W, FLOOR * W + W)) * 0.7 + 0.04)
  site(c, type, r, floor)
  c.person(70 + Math.floor(r() * 30), floor)
  for (let i = 0; i < c.lum.length; i++) c.lum[i] += (r() - 0.5) * 0.07
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  canvas.getContext('2d')!.putImageData(dither(c.lum, W, H, palette), 0, 0)
  const url = canvas.toDataURL()
  cache.set(id, url)
  return url
}
