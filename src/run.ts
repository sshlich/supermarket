import { buyPrice } from './economy.ts'
import { skillTier, type Loadout, type SkillPick } from './encounters.ts'
import { ENCHANT_KEYS, rollEnchants, type Enchant } from './enchant.ts'
import { canEnchant, ITEM_KEYS, ITEMS, type ItemKey } from './items.ts'
import { pickOne } from './random.ts'
import { offerPrice, rollOffer } from './shop.ts'
import { SKILL_KEYS, SKILLS, type SkillKey } from './skills.ts'
import { TIER_ORDER, type Tier } from './tiers.ts'

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

/**
 * What a level-up can offer. Each level offers every entry that applies; 'item', 'skill', 'upgrade' and
 * 'enchant' open a second pick (upgrade covers items and skills).
 */
export type Reward =
  | { kind: 'item'; tier: Tier }
  | { kind: 'skill'; tier: Tier }
  | { kind: 'upgrade' }
  | { kind: 'enchant' }
  | { kind: 'gold'; amount: number }
  | { kind: 'income'; amount: number }
const LEVEL_REWARDS: Record<number, Reward[]> = {
  2: [{ kind: 'skill', tier: 'bronze' }, { kind: 'item', tier: 'bronze' }, { kind: 'gold', amount: 10 }],
  3: [{ kind: 'item', tier: 'silver' }, { kind: 'upgrade' }, { kind: 'enchant' }],
  4: [{ kind: 'skill', tier: 'silver' }, { kind: 'upgrade' }, { kind: 'income', amount: 2 }],
  5: [{ kind: 'enchant' }, { kind: 'item', tier: 'gold' }, { kind: 'gold', amount: 15 }],
}
const LATER_REWARDS: Reward[] = [{ kind: 'skill', tier: 'gold' }, { kind: 'upgrade' }, { kind: 'enchant' }]
export const levelRewards = (level: number) => LEVEL_REWARDS[level] ?? LATER_REWARDS

/** Hours 0,1,3,4: merchants/events. Hour 2: pick a monster. Hour 5: fight a rival. */
export const hourKind = (hour: number) => (hour === 2 ? 'monster' : hour === HOURS - 1 ? 'rival' : 'choice')

/** Losing to a rival costs more as days go on; monsters cost nothing. */
export const prestigeLoss = (day: number) => Math.min(12, day + 1)

const NAMES = ['Vex', 'Mara', 'Old Toll', 'Brine', 'Kestrel', 'Juno', 'Sable', 'Pike']

/** Rivals are assumed to be about a level ahead of the day number. */
export const rivalLevel = (day: number) => day + 1

/**
 * A rival build for `day`: items shopped like a merchant's offers (tiers by day) with a budget that grows each
 * day, until nothing affordable fits their board, plus a skill every other day.
 * ponytail: a generated stand-in until rivals are designed.
 */
export function rival(day: number, random: () => number): { name: string; hp: number; items: Loadout[]; skills: SkillPick[] } {
  let budget = 6 + 8 * day
  const { lo, hi } = boardSockets(rivalLevel(day))
  let slots = hi - lo + 1
  const items: Loadout[] = []
  for (;;) {
    const o = rollOffer(day, ITEM_KEYS, random, (k, tier) => ITEMS[k].size <= slots && buyPrice({ size: ITEMS[k].size, tier }) <= budget)
    if (!o) break
    if (o.enchant && offerPrice(o) > budget) delete o.enchant // can't afford the enchanted version
    items.push(o)
    budget -= offerPrice(o)
    slots -= ITEMS[o.key].size
  }
  const tier = skillTier(day)
  const open = SKILL_KEYS.filter(k => TIER_ORDER.indexOf(SKILLS[k].tier) <= TIER_ORDER.indexOf(tier)).sort(() => random() - 0.5)
  const skills = open.slice(0, Math.min(4, Math.floor(day / 2))).map(key => ({ key, tier }))
  return { name: NAMES[Math.floor(random() * NAMES.length)], hp: maxHp(rivalLevel(day)), items, skills }
}

/** The start-of-run pick: some economy, an enchanted small item, or a skill. */
export type StartPackage =
  | { kind: 'economy'; gold: number; income: number }
  | { kind: 'item'; key: ItemKey; enchant: Enchant }
  | { kind: 'skill'; key: SkillKey }

export function startPackages(random: () => number): StartPackage[] {
  const smalls = ITEM_KEYS.filter(k => ITEMS[k].size === 1 && ITEMS[k].tier === 'bronze' && ENCHANT_KEYS.some(e => canEnchant(k, e)))
  const key = pickOne(smalls, random)
  return [
    { kind: 'economy', gold: 8, income: 2 },
    { kind: 'item', key, enchant: rollEnchants(1, random, e => canEnchant(key, e))[0] },
    { kind: 'skill', key: pickOne(SKILL_KEYS.filter(k => SKILLS[k].tier === 'bronze'), random) },
  ]
}

/**
 * The one last chance when Prestige runs out: a Diamond item, a random enchantment for one of your items, or
 * gold and XP. The next loss after it ends the run. `enchantable` says which enchantments you could use.
 */
export type LastChance = { kind: 'diamond'; key: ItemKey } | { kind: 'enchant'; enchant: Enchant } | { kind: 'gold'; gold: number; xp: number }

export function lastChanceOptions(random: () => number, enchantable: (e: Enchant) => boolean): LastChance[] {
  const diamonds = ITEM_KEYS.filter(k => ITEMS[k].tier !== 'legendary')
  const [enchant] = rollEnchants(1, random, enchantable)
  return [
    { kind: 'diamond', key: pickOne(diamonds, random) },
    ...(enchant ? [{ kind: 'enchant' as const, enchant }] : []),
    { kind: 'gold', gold: 20, xp: 5 },
  ]
}
