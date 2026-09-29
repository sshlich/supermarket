// A sprite is a plain SVG whose viewBox is the item's footprint: UNIT units per cell, so a 4 x 2 item is 128 x 64.
// It draws in currentColor, so the game tints it with the item's accent. This builds a first sprite from a game-icons icon.

import { readFileSync } from 'node:fs'

export const UNIT = 32

/** The sprite an item starts with: its icon, centred and sized the way the game used to draw it. */
export function fromIcon(iconName: string, w: number, h: number): string {
  const svg = readFileSync(new URL(`../src/icons/${iconName}.svg`, import.meta.url), 'utf8')
  const body = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>[\s\S]*$/, '').trim()
  const lo = Math.min(w, h)
  const size = lo * (1 + 0.25 * (Math.min(2, Math.max(w, h) / lo) - 1)) * 0.78 * UNIT // the icon's edge, in units
  const s = size / 512
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w * UNIT} ${h * UNIT}">
  <g transform="translate(${(w * UNIT) / 2} ${(h * UNIT) / 2}) scale(${+s.toFixed(4)}) translate(-256 -256)">${body}</g>
</svg>
`
}
