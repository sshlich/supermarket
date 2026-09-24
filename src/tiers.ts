import type { Art } from './art.ts'
import type { Ability, Aura } from './engine/combat.ts'

export type Tier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary'
export const TIER_COLOR: Record<Tier, string> = {
  bronze: '#c9814a',
  silver: '#c3d0dd',
  gold: '#f2c64e',
  diamond: '#86ecf7',
  legendary: '#e0609f',
}
export const tierName = (t: Tier) => t[0].toUpperCase() + t.slice(1)

/** Normal upgrade path. Legendary is a separate top tier that doesn't upgrade. */
export const TIER_ORDER: Tier[] = ['bronze', 'silver', 'gold', 'diamond']
export const nextTier = (t: Tier): Tier | null => (TIER_ORDER.includes(t) ? (TIER_ORDER[TIER_ORDER.indexOf(t) + 1] ?? null) : null)

/** Tiers a card starting at `start` can reach, in order. */
export const reachable = (start: Tier): Tier[] => (start === 'legendary' ? ['legendary'] : TIER_ORDER.slice(TIER_ORDER.indexOf(start)))

/** Upgrades from `start` to `tier` (0 at the starting tier). */
export function stepOf(start: Tier, tier: Tier) {
  const step = reachable(start).indexOf(tier)
  if (step < 0) throw new Error(`a ${start} card can't be ${tier}`)
  return step
}

// ---------------------------------------------------------------- upgrade paths

/**
 * A number that changes with tier, counted from the card's starting tier:
 * - `tiers(1, 2, 3, 4)`: one value per tier from the starting one (a Silver card lists silver, gold, diamond).
 *   A short list repeats its last value.
 * - `grows(5)`: x2 per tier (5, 10, 20, 40); `grows(5, 3)` for x3.
 * - `steps(1, 0.5)`: +0.5 per tier (1, 1.5, 2, 2.5). Negative steps work for cooldowns.
 * A plain number stays the same at every tier, except T1/T2 stats, which grow x2 by default.
 */
export type Path = { tiers: number[] } | { grows: number; by: number } | { steps: number; by: number }
export type Num = number | Path
export const tiers = (...values: number[]): Path => ({ tiers: values })
export const grows = (base: number, by = 2): Path => ({ grows: base, by })
export const steps = (base: number, by: number): Path => ({ steps: base, by })

export function at(n: Num, step: number): number {
  if (typeof n === 'number') return n
  if ('tiers' in n) return n.tiers[Math.min(step, n.tiers.length - 1)]
  if ('grows' in n) return n.grows * n.by ** step
  return n.steps + n.by * step
}

// ---------------------------------------------------------------- stats

/** Stats that show as gems on the card and that action amounts default to. */
export type Stat = 'damage' | 'shield' | 'heal' | 'burn' | 'poison' | 'regen'
export const STAT_ORDER: Stat[] = ['damage', 'shield', 'heal', 'burn', 'poison', 'regen']
/** T1 stats: the big numbers. T2 stats: statuses, worth about a tenth of a T1 number. */
export const T1: Stat[] = ['damage', 'heal', 'shield']
export const T2: Stat[] = ['burn', 'poison', 'regen']
/** A default stat path: T1 and T2 double per tier. */
const statAt = (n: Num, step: number) => (typeof n === 'number' ? n * 2 ** step : at(n, step))

// ---------------------------------------------------------------- cards

/** What items and skills share. `N` is Num while authoring, number once resolved at a tier. */
export interface CardBase<N> {
  name: string
  tier: Tier // starting tier while authoring, current tier once resolved
  tags: string[]
  stats: Partial<Record<Stat, N>> // action amounts default to these
  /** Any other numbers abilities and text use: `{ val: 'haste' }` in an ability, `[haste]` or `{haste}` in text. */
  vals?: Record<string, N>
  crit?: N // % chance
  lifesteal?: N // % of damage dealt
  abilities: Ability[]
  auras?: Aura[]
  /** Lines of description. `[burn]` = icon + this tier's burn, `[burn 2]` = icon + 2, `[burn gain]` = icon + vals.gain, `{count}` = vals.count, `<Burn>` = colored keyword. */
  text: string[]
  art: Art
}

/** Fields every resolved card carries on top of its numbers. */
export interface Resolved {
  key: string
  start: Tier
  /** Every number that differs between tiers, one entry per reachable tier, for tooltips. */
  paths: Record<string, number[]>
}

const mapNums = <N, M>(o: Record<string, N>, f: (n: N) => M) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(v)])) as Record<string, M>

/** A card's shared fields at `tier`. */
export function cardAt(spec: CardBase<Num>, tier: Tier): CardBase<number> {
  const step = stepOf(spec.tier, tier)
  const { vals, crit, lifesteal, ...rest } = spec
  const out: CardBase<number> = { ...rest, tier, stats: mapNums(spec.stats as Record<string, Num>, n => statAt(n, step)) }
  if (vals) out.vals = mapNums(vals, n => at(n, step))
  if (crit !== undefined) out.crit = at(crit, step)
  if (lifesteal !== undefined) out.lifesteal = at(lifesteal, step)
  return out
}

/** A resolved card's numbers by name: stats, vals, and the item fields that are set. */
export function numbers(c: CardBase<number> & { cooldown?: number; multicast?: number; ammo?: number }): Record<string, number> {
  const out: Record<string, number> = { ...c.stats, ...c.vals }
  for (const k of ['cooldown', 'multicast', 'ammo', 'crit', 'lifesteal'] as const) if (c[k] !== undefined) out[k] = c[k]!
  return out
}

/** Numbers that differ across the resolved copies of one card, one per tier. */
export function pathsOf(copies: CardBase<number>[]): Record<string, number[]> {
  const all = copies.map(numbers)
  const names = new Set(all.flatMap(n => Object.keys(n)))
  const out: Record<string, number[]> = {}
  for (const k of names) {
    const path = all.map(n => n[k] ?? 0)
    if (new Set(path).size > 1) out[k] = path
  }
  return out
}
