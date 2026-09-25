import type { Size } from './board.ts'
import { buyPrice } from './economy.ts'
import { rollEnchants, type Enchant } from './enchant.ts'
import { canEnchant, ITEMS, type ItemKey } from './items.ts'
import { pickOne } from './random.ts'
import { reachable, TIER_ORDER, type Tier } from './tiers.ts'

// What merchants (and anything else handing out random items) offer: a tier rolled from the day's odds, then
// an item that can be that tier, sometimes enchanted.

/** Tier odds from `from` day on (weights, need not sum to 1). */
export const TIER_ODDS: { from: number; odds: Partial<Record<Tier, number>> }[] = [
  { from: 1, odds: { bronze: 1 } },
  { from: 3, odds: { bronze: 0.6, silver: 0.4 } },
  { from: 5, odds: { bronze: 0.3, silver: 0.5, gold: 0.2 } },
  { from: 7, odds: { silver: 0.4, gold: 0.45, diamond: 0.1, legendary: 0.05 } },
  { from: 9, odds: { silver: 0.2, gold: 0.5, diamond: 0.25, legendary: 0.05 } },
]
/** Chance that an offer comes enchanted; it costs 1.5x (see buyPrice). */
export const ENCHANTED_ODDS = 0.1

export const tierOdds = (day: number) => [...TIER_ODDS].reverse().find(o => day >= o.from)!.odds

export function rollTier(day: number, random: () => number): Tier {
  const odds = Object.entries(tierOdds(day)) as [Tier, number][]
  let r = random() * odds.reduce((n, [, w]) => n + w, 0)
  for (const [tier, w] of odds) if ((r -= w) < 0) return tier
  return odds[odds.length - 1][0]
}

export interface Offer { key: ItemKey; tier: Tier; enchant?: Enchant }

/** Items that can be `tier`: it's their starting tier or later (Legendary items are only ever Legendary). */
const canBe = (key: ItemKey, tier: Tier) => reachable(ITEMS[key].tier).includes(tier)

/**
 * One offer from `pool`: roll a tier, then an item that can be it. If none can, the next tier down is tried
 * (Legendary falls to Diamond), so a rare roll never comes up empty. `fits` narrows the items (size, price...).
 */
export function rollOffer(day: number, pool: ItemKey[], random: () => number, fits: (key: ItemKey, tier: Tier) => boolean = () => true): Offer | null {
  const rolled = rollTier(day, random)
  const tiers = rolled === 'legendary' ? ['legendary' as Tier, ...[...TIER_ORDER].reverse()] : TIER_ORDER.slice(0, TIER_ORDER.indexOf(rolled) + 1).reverse()
  for (const tier of tiers) {
    const can = pool.filter(k => canBe(k, tier) && fits(k, tier))
    if (!can.length) continue
    const key = pickOne(can, random)
    const enchant = random() < ENCHANTED_ODDS ? rollEnchants(1, random, e => canEnchant(key, e))[0] : undefined
    return { key, tier, enchant }
  }
  return null
}

/** A merchant's whole row: offers until nothing more fits in `sockets`. */
export function rollStock(day: number, pool: ItemKey[], random: () => number, sockets = 10): Offer[] {
  const out: Offer[] = []
  for (let room = sockets; room > 0; ) {
    const o = rollOffer(day, pool, random, k => ITEMS[k].size <= room)
    if (!o) break
    out.push(o)
    room -= ITEMS[o.key].size
  }
  return out
}

/** What an offer costs, enchantment included. */
export const offerPrice = (o: Offer) => buyPrice({ size: ITEMS[o.key].size as Size, tier: o.tier, enchant: o.enchant })
