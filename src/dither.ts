// Ordered dithering (4x4 Bayer): a gradient drawn in a few flat colors with a pixel pattern between them.
// Card art, skill badges, portraits and encounter faces are all dithered ramps; it's the game's texture.

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => v / 16)
const TEXELS = 22 // texels per slot unit
const cache = new Map<string, string>()

const rgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
const mix = (a: number[], b: number[], k: number) => a.map((v, i) => Math.round(v + (b[i] - v) * k))

/**
 * `c1` (top, lit) to `c2` (bottom) over a `w`×`h` slot-unit box, leaning like a 160° CSS gradient, with a
 * highlight a little above the middle. Returns a CSS url() of a tiny PNG, to draw with `image-rendering: pixelated`.
 */
export function ramp(c1: string, c2: string, w: number, h: number): string {
  const key = `${c1}${c2}${w}${h}`
  const hit = cache.get(key)
  if (hit) return hit
  const W = Math.max(1, Math.round(w * TEXELS))
  const H = Math.max(1, Math.round(h * TEXELS))
  const a = rgb(c1)
  const b = rgb(c2)
  const palette = [mix(a, [255, 255, 255], 0.16), a, mix(a, b, 0.5), b] // highlight, c1, halfway, c2
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(W, H)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const px = ((x + 0.5) / W) * w
      const py = ((y + 0.5) / H) * h
      const t = (0.34 * px + 0.94 * py) / (0.34 * w + 0.94 * h) // 0..1 along the gradient
      const glow = Math.max(0, 1 - Math.hypot(px - w / 2, py - h * 0.42) / (0.62 * Math.min(w, h)))
      const level = 1 + 2 * t - 1.2 * glow
      const c = palette[Math.max(0, Math.min(3, Math.floor(level + BAYER[(y % 4) * 4 + (x % 4)])))]
      img.data.set([...c, 255], (y * W + x) * 4)
    }
  }
  ctx.putImageData(img, 0, 0)
  const url = `url(${canvas.toDataURL()})`
  cache.set(key, url)
  return url
}
