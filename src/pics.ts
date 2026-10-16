// Pictures as the computers keep them: 160 by 120, sixteen colours, one hex digit a pixel (a disc packs them two a byte:
// see discs.ts and scripts/pics.py, which reads PALETTE from here). picUrl turns one into an image the page can show.

export const PIC_W = 160, PIC_H = 120
/** A picture: 160 by 120, sixteen colours, half a byte a pixel. */
export const PIC_SIZE = Math.ceil(PIC_W * PIC_H / 2 / 1024)

export const PALETTE = ['#000000', '#7f7f7f', '#c3c3c3', '#ffffff', '#7a1f1f', '#d03a2f', '#e08a3a', '#f2d272', '#2f5a2a', '#5c9a4a', '#1f4a6a', '#4a8ad0', '#3a2f6a', '#9a6ad0', '#6a4a2a', '#e8b8a0']
/** A picture's pixels as an image the page can show (the last few are kept). */
const pics = new Map<string, string>()
export function picUrl(px: string) {
  const hit = pics.get(px)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = PIC_W; c.height = PIC_H
  const g = c.getContext('2d')!, img = g.createImageData(PIC_W, PIC_H)
  const rgb = PALETTE.map(h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)))
  for (let i = 0; i < PIC_W * PIC_H; i++) { const [r, gg, b] = rgb[parseInt(px[i] ?? '0', 16)] ?? rgb[0]; img.data.set([r, gg, b, 255], i * 4) }
  g.putImageData(img, 0, 0)
  const url = c.toDataURL()
  pics.set(px, url)
  if (pics.size > 12) pics.delete(pics.keys().next().value!)
  return url
}
