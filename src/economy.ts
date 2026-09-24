import type { ItemDef, Tier } from './items.ts'

const TIER_MULT: Record<Tier, number> = { bronze: 1, silver: 2, gold: 4, diamond: 8, legendary: 12 }

/** Small bronze 2, medium 4, large 6; each tier doubles (legendary x12). */
export const buyPrice = (d: ItemDef) => d.size * 2 * TIER_MULT[d.tier]
export const sellPrice = (d: ItemDef) => Math.max(1, Math.floor(buyPrice(d) / 2))

export const START_GOLD = 12
export const START_INCOME = 5
export const REROLL_COST = 1
export const OFFERS = 4

/** Left sockets that spread items of `sizes` evenly across a row, centered, in order. */
export function spread(sizes: number[], sockets = 10): number[] {
  const free = sockets - sizes.reduce((a, b) => a + b, 0)
  const gap = Math.max(0, Math.floor(free / (sizes.length + 1)))
  let at = Math.floor((free - gap * (sizes.length - 1)) / 2)
  return sizes.map(s => {
    const pos = at
    at += s + gap
    return pos
  })
}
