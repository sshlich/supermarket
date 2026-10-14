// Sprites that draw what is in them. A kind with a painter here has an empty `<g class="fill"></g>` in its sprite, and the
// painter fills it from the container's contents: where each thing sits inside and what colour it is. (The blister does
// the same with CSS variables; this is for drawings that depend on more than "is this square full".)

import { dims, swatch, type Item } from './world.ts'

/** Each painter gets the container's contents by slot and returns SVG in the sprite's own units (32 to a square). */
type Painter = (inside: (slot: number) => Item[]) => string

/** A small, stable number from a thing (its id): books are not all the same height. */
const jitter = (it: Item, n: number) => ((it.id * 2654435761) >>> 0) % n

const PAINTERS: Record<string, Painter> = {
  /**
   * The disc holder: twelve black plastic shelves, each holding one disc lying flat, seen from the front, so only its thin
   * edge shows, in its own colour. The holder's inside is 2 by 6; square n (left to right, top row first) is shelf n.
   */
  discrack: inside => {
    const top = 7, shelf = 82 / 12
    return inside(0).map(d => {
      const n = d.y * 2 + d.x
      const y = top + (n + 1) * shelf - 0.6 - 2.7
      return `<rect x="10.5" y="${y.toFixed(2)}" width="43" height="2.7" rx="0.5" fill="${swatch(d)}"/>`
        + `<rect x="10.5" y="${y.toFixed(2)}" width="43" height="0.55" fill="#ffffff" opacity="0.22"/>`
        + `<rect x="49.5" y="${y.toFixed(2)}" width="4" height="2.7" fill="#000000" opacity="0.28"/>`
    }).join('')
  },
  /**
   * The bookshelf: two shelves, each 12 squares wide and 3 high inside. A book standing (2 wide, 3 high) shows its spine
   * where it stands, in its cover's colour, a little shorter or taller than its neighbours; a book lying down (3 wide, 2
   * high) shows as a flat block resting where it lies.
   */
  bookshelf: inside => {
    const left = 9, col = 110 / 12, row = 51 / 3, tops = [9, 68]
    return [0, 1].map(slot => inside(slot).map(b => {
      const { w, h } = dims(b)
      const c = swatch(b), floor = tops[slot] + (b.y + h) * row
      if (h >= w) {
        const height = row * 3 * (0.8 + jitter(b, 16) / 100), x = left + b.x * col + 0.7, width = w * col - 1.4, y = floor - height
        return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${width.toFixed(2)}" height="${height.toFixed(2)}" rx="1" fill="${c}" stroke="#1a110b" stroke-width="0.7"/>`
          + `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="1.6" height="${height.toFixed(2)}" fill="#ffffff" opacity="0.14"/>`
          + `<rect x="${(x + width - 2).toFixed(2)}" y="${y.toFixed(2)}" width="2" height="${height.toFixed(2)}" fill="#000000" opacity="0.25"/>`
          + `<g fill="#b8975a" opacity="0.75"><rect x="${(x + 1.5).toFixed(2)}" y="${(y + 4).toFixed(2)}" width="${(width - 3).toFixed(2)}" height="1.2"/><rect x="${(x + 1.5).toFixed(2)}" y="${(floor - 6).toFixed(2)}" width="${(width - 3).toFixed(2)}" height="1.2"/></g>`
          + `<rect x="${(x + 3).toFixed(2)}" y="${(y + height * 0.32).toFixed(2)}" width="${(width - 6).toFixed(2)}" height="${(height * 0.22).toFixed(2)}" fill="#000000" opacity="0.28"/>`
      }
      const height = row * 0.95, x = left + b.x * col + 0.5, width = w * col - 1
      return `<rect x="${x.toFixed(2)}" y="${(floor - height).toFixed(2)}" width="${width.toFixed(2)}" height="${height.toFixed(2)}" rx="1" fill="${c}" stroke="#1a110b" stroke-width="0.7"/>`
        + `<rect x="${(x + 3).toFixed(2)}" y="${(floor - height + 3).toFixed(2)}" width="${(width - 6).toFixed(2)}" height="1.2" fill="#b8975a" opacity="0.7"/>`
    }).join('')).join('')
  },
}

/** A container's sprite with its contents painted in, if its kind has a painter and its sprite a place for them. */
export function paintFill(kind: string, svg: string, inside: (slot: number) => Item[]) {
  const p = PAINTERS[kind] as Painter | undefined
  return p && svg.includes('<g class="fill"></g>') ? svg.replace('<g class="fill"></g>', `<g class="fill">${p(inside)}</g>`) : svg
}
