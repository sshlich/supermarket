// Item icons (DESIGN 13.3): game-icons rasterised small, cut to 1 bit, inked in the thing's colour with a dark outline,
// and shown at twice their size, pixelated. Relics get two frames with their two colours swapped: a slow shimmer.

import { bayer, rgb } from './dither.ts'

const cache = new Map<string, string>()
const key = (name: string, size: number, ink: string, ink2 = '') => `${name}|${size}|${ink}|${ink2}`

/** A prepared icon's data URL (see prepare), or undefined if it was never asked for. */
export const pixel = (name: string, size: number, ink: string, ink2?: string) => cache.get(key(name, size, ink, ink2))

async function raster(svg: string, size: number, ink: string, ink2?: string): Promise<string> {
  const img = new Image()
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replaceAll('currentColor', '#fff'))}`
  await img.decode()
  const n = size + 2 // a pixel of room all round for the outline
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = n
  const g = canvas.getContext('2d')!
  g.drawImage(img, 1, 1, size, size)
  const src = g.getImageData(0, 0, n, n).data
  const on = (x: number, y: number) => x >= 0 && y >= 0 && x < n && y < n && src[(y * n + x) * 4 + 3] > 110
  const out = g.createImageData(n, n)
  const [a, b, dark] = [rgb(ink), rgb(ink2 ?? ink), rgb('#0d0d0b')]
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const c = on(x, y) ? (ink2 && bayer(x, y) < 0.5 ? b : a) : on(x - 1, y) || on(x + 1, y) || on(x, y - 1) || on(x, y + 1) ? dark : null
    if (!c) continue
    out.data.set([...c, 255], (y * n + x) * 4)
  }
  g.clearRect(0, 0, n, n)
  g.putImageData(out, 0, 0)
  return canvas.toDataURL()
}

/** Rasterise everything the screen will ask for, once, up front. */
export async function prepare(jobs: { svg: string; name: string; size: number; ink: string; ink2?: string }[]) {
  await Promise.all(jobs.map(async j => {
    const k = key(j.name, j.size, j.ink, j.ink2)
    if (!cache.has(k) && j.svg) cache.set(k, await raster(j.svg, j.size, j.ink, j.ink2).catch(() => ''))
  }))
}

/** A colour lifted toward white, for a relic's second shimmer colour. */
export const lift = (hex: string, by = 0.5) => `#${rgb(hex).map(v => Math.round(v + (255 - v) * by).toString(16).padStart(2, '0')).join('')}`
