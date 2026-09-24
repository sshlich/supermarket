import { buyPrice } from './economy.ts'
import { ITEMS, type ItemKey } from './items.ts'

export const HOURS = 6 // per day
export const WINS_TO_WIN = 10
export const START_PRESTIGE = 20
export const PLAYER_HP = 300 // ponytail: flat until levels add health
export const RIVAL_SLOTS = 6

/** Hours 0,1,3,4: merchants/events. Hour 2: pick a monster. Hour 5: fight a rival. */
export const hourKind = (hour: number) => (hour === 2 ? 'monster' : hour === HOURS - 1 ? 'rival' : 'choice')

/** Losing to a rival costs more as days go on; monsters cost nothing. */
export const prestigeLoss = (day: number) => Math.min(12, day + 1)

const NAMES = ['Vex', 'Mara', 'Old Toll', 'Brine', 'Kestrel', 'Juno', 'Sable', 'Pike']

/**
 * A rival build for `day`: random items bought with a budget that grows each day, until nothing affordable
 * fits the board. ponytail: stands in for other players' snapshots.
 */
export function rival(day: number, random: () => number): { name: string; hp: number; items: ItemKey[] } {
  let budget = 6 + 8 * day
  let slots = RIVAL_SLOTS
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
  return { name: NAMES[Math.floor(random() * NAMES.length)], hp: PLAYER_HP, items }
}
