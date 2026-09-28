// The reality layer (DESIGN 13.3): Bayer 8×8 ordered dithering of a luminance field to a 2-4 colour palette.

const B8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
]
/** The Bayer threshold at a pixel, in (0, 1). */
export const bayer = (x: number, y: number) => (B8[(y & 7) * 8 + (x & 7)] + 0.5) / 64

export const rgb = (hex: string): [number, number, number] => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number]

/** Luminance (0 dark .. 1 light) to the palette, darkest first, with ordered dithering between neighbouring colours. */
export function dither(lum: Float32Array, w: number, h: number, palette: string[]): ImageData {
  const cols = palette.map(rgb)
  const out = new ImageData(w, h)
  const n = cols.length - 1
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const v = Math.max(0, Math.min(1, lum[y * w + x])) * n
    const base = Math.floor(v)
    const c = cols[Math.min(n, v - base > bayer(x, y) ? base + 1 : base)]
    const i = (y * w + x) * 4
    out.data[i] = c[0]
    out.data[i + 1] = c[1]
    out.data[i + 2] = c[2]
    out.data[i + 3] = 255
  }
  return out
}
