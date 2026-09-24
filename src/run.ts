import { buyPrice } from './economy.ts'
import { ITEMS, type ItemKey, type Tier } from './items.ts'

export const HOURS = 6 // per day
export const WINS_TO_WIN = 10
export const START_PRESTIGE = 20
export const XP_PER_LEVEL = 8
export const XP_PER_HOUR = 1

/** 300 health at level 1, +50 per level. */
export const maxHp = (level: number) => 250 + 50 * level

/** Board sockets unlocked at `level`: 4, 6, 8, then all 10, centered in the row. */
export function boardSockets(level: number) {
  const n = Math.min(10, 2 + 2 * level)
  const lo = (10 - n) / 2
  return { lo, hi: lo + n - 1 }
}

/** What a level-up can offer. Each level offers every entry; picking 'item' or 'upgrade' opens a second pick. */
export type Reward = { kind: 'item'; tier: Tier } | { kind: 'upgrade' } | { kind: 'gold'; amount: number } | { kind: 'income'; amount: number }
const LEVEL_REWARDS: Record<number, Reward[]> = {
  2: [{ kind: 'item', tier: 'bronze' }, { kind: 'gold', amount: 10 }, { kind: 'income', amount: 1 }],
  3: [{ kind: 'item', tier: 'silver' }, { kind: 'upgrade' }, { kind: 'gold', amount: 15 }],
  4: [{ kind: 'upgrade' }, { kind: 'item', tier: 'gold' }, { kind: 'income', amount: 2 }],
}
const LATER_REWARDS: Reward[] = [{ kind: 'upgrade' }, { kind: 'item', tier: 'gold' }, { kind: 'gold', amount: 20 }]
export const levelRewards = (level: number) => LEVEL_REWARDS[level] ?? LATER_REWARDS

/** Hours 0,1,3,4: merchants/events. Hour 2: pick a monster. Hour 5: fight a rival. */
export const hourKind = (hour: number) => (hour === 2 ? 'monster' : hour === HOURS - 1 ? 'rival' : 'choice')

/** Losing to a rival costs more as days go on; monsters cost nothing. */
export const prestigeLoss = (day: number) => Math.min(12, day + 1)

const NAMES = ['Vex', 'Mara', 'Old Toll', 'Brine', 'Kestrel', 'Juno', 'Sable', 'Pike']

/** Rivals are assumed to be about a level ahead of the day number. */
export const rivalLevel = (day: number) => day + 1

/**
 * A rival build for `day`: random items bought with a budget that grows each day, until nothing affordable
 * fits their board. ponytail: stands in for other players' snapshots.
 */
export function rival(day: number, random: () => number): { name: string; hp: number; items: ItemKey[] } {
  let budget = 6 + 8 * day
  const { lo, hi } = boardSockets(rivalLevel(day))
  let slots = hi - lo + 1
  const items: ItemKey[] = []
  const keys = Object.keys(ITEMS) as ItemKey[]
  for (;;) {
    const fits = keys.filter(k => ITEMS[k].size <= slots && buyPrice(ITEMS[k]) <= budget)
    if (!fits.length) break
    const k = fits[Math.floor(random() * fits.length)]
    items.push(k)
    budget -= buyPrice(ITEMS[k])
    slots -= ITEMS[k].size
  }
  return { name: NAMES[Math.floor(random() * NAMES.length)], hp: maxHp(rivalLevel(day)), items }
}
