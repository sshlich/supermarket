import { cardAt, grows, pathsOf, reachable, tiers, type CardBase, type Num, type Resolved, type Tier } from './tiers.ts'

// Skills: passive cards off the board. Same abilities, auras, stats and upgrade paths as items, but no
// size and no cooldown, so they're never "used": they react to triggers and hold auras. Taking a skill
// you already have upgrades it one tier.

export type SkillSpec = CardBase<Num>
export interface SkillDef extends CardBase<number>, Resolved { key: SkillKey }

// Placeholder skills, one per kind of hook: fight start, aura, item used, positional trigger,
// "when you <effect>", crit trigger, condition, lifesteal.
export const SKILLS = {
  openingGuard: {
    name: 'Opening Guard', tier: 'bronze', tags: ['Armor'],
    stats: { shield: 15 },
    text: ['At the start of each fight, gain [shield] <Shield>'],
    abilities: [{ when: { on: 'fightStart' }, do: [{ do: 'shield' }] }],
    art: { bg: ['#6a6a3a', '#22220e'], icons: ['checked-shield'] },
  },
  sharpEye: {
    name: 'Sharp Eye', tier: 'bronze', tags: ['Weapon'],
    stats: {}, vals: { bonus: tiers(10, 15, 20, 25) },
    text: ['Your Weapons have +[crit bonus]% <Crit> chance'],
    abilities: [],
    auras: [{ stat: 'crit', add: { val: 'bonus' }, targets: { pick: 'mine', where: { tag: 'Weapon' } } }],
    art: { bg: ['#7a3a6a', '#240e20'], icons: ['eye-target'] },
  },
  kindling: {
    name: 'Kindling', tier: 'silver', tags: ['Weapon'],
    stats: { burn: 2 },
    text: ['When you use a Weapon, <Burn> [burn]'],
    abilities: [{ when: { on: 'itemUsed', who: { pick: 'mine', where: { tag: 'Weapon' } } }, do: [{ do: 'burn' }] }],
    art: { bg: ['#9a4a1a', '#2e1406'], icons: ['sword-brandish', { icon: 'fire', color: 'burn' }] },
  },
  quickHands: {
    name: 'Quick Hands', tier: 'bronze', tags: [],
    stats: {}, vals: { charge: tiers(1, 1, 2, 3) },
    text: ['When you use your leftmost item, <Charge> your rightmost item [charge] second(s)'],
    abilities: [{ when: { on: 'itemUsed', who: { pick: 'leftmost' } }, do: [{ do: 'charge', seconds: { val: 'charge' }, targets: { pick: 'rightmost' } }] }],
    art: { bg: ['#3a6a8a', '#0e1e2a'], icons: ['glowing-hands'] },
  },
  herbalist: {
    name: 'Herbalist', tier: 'bronze', tags: ['Potion'],
    stats: { regen: 1 },
    text: ['When you <Heal>, gain [regen] <Regen>'],
    abilities: [{ when: { on: 'performed', effect: 'heal' }, do: [{ do: 'regen' }] }],
    art: { bg: ['#4a7a2a', '#16240c'], icons: ['leaf-swirl'] },
  },
  coldSnap: {
    name: 'Cold Snap', tier: 'gold', tags: [],
    stats: {}, vals: { freeze: tiers(1, 1.5) },
    text: ['When one of your items crits, <Freeze> an enemy item for [freeze] second(s)'],
    abilities: [{ when: { on: 'crit' }, do: [{ do: 'freeze', seconds: { val: 'freeze' }, targets: { pick: 'enemy', where: { has: 'cooldown' }, random: 1 } }] }],
    art: { bg: ['#3a7a9a', '#0e222e'], icons: ['ice-bolt'] },
  },
  ironWill: {
    name: 'Iron Will', tier: 'silver', tags: ['Armor'],
    stats: { shield: 40 },
    text: ['At the start of each fight, if you have 2 or more Armor items, gain [shield] <Shield>'],
    abilities: [{ when: { on: 'fightStart' }, if: { count: { pick: 'mine', where: { tag: 'Armor' } }, atLeast: 2 }, do: [{ do: 'shield' }] }],
    art: { bg: ['#5a5a6a', '#1a1a22'], icons: ['mailed-fist'] },
  },
  bloodthirst: {
    name: 'Bloodthirst', tier: 'gold', tags: ['Weapon'],
    stats: {}, vals: { bonus: grows(20, 1.5) },
    text: ['Your Weapons have +[lifesteal bonus]% <Lifesteal>'],
    abilities: [],
    auras: [{ stat: 'lifesteal', add: { val: 'bonus' }, targets: { pick: 'mine', where: { tag: 'Weapon' } } }],
    art: { bg: ['#8a1a3a', '#2a0610'], icons: ['fangs'] },
  },
  // Run effects on skills.
  goldRush: {
    name: 'Gold Rush', tier: 'silver', tags: [],
    stats: {}, vals: { gold: 1 },
    text: ['When one of your items crits, gain [gold] <Gold>'],
    abilities: [{ when: { on: 'crit' }, do: [{ do: 'gold', amount: { val: 'gold' } }] }],
    art: { bg: ['#9a7a1a', '#2e2406'], icons: ['gold-bar'] },
  },
  veteran: {
    name: 'Veteran', tier: 'bronze', tags: [],
    stats: {}, vals: { gain: grows(2) },
    text: ['When you win a fight, your leftmost item permanently gains +[damage gain] <Damage>'],
    abilities: [{ when: { on: 'win' }, do: [{ do: 'grow', stat: 'damage', add: { val: 'gain' }, targets: { pick: 'leftmost' } }] }],
    art: { bg: ['#6a4a2a', '#20140a'], icons: ['medal'] },
  },
  haggler: {
    name: 'Haggler', tier: 'bronze', tags: [],
    stats: {}, vals: { gold: 1 },
    text: ['When you sell an item, gain [gold] <Gold>'],
    abilities: [{ when: { on: 'sell' }, do: [{ do: 'gold', amount: { val: 'gold' } }] }],
    art: { bg: ['#4a6a4a', '#142014'], icons: ['shaking-hands'] },
  },
} satisfies Record<string, SkillSpec>

export type SkillKey = keyof typeof SKILLS
export const SKILL_KEYS = Object.keys(SKILLS) as SkillKey[]

/** A skill at `tier` (its starting tier by default), with its upgrade paths filled in. */
export function skillAt(key: SkillKey, tier: Tier = SKILLS[key].tier): SkillDef {
  const spec: SkillSpec = SKILLS[key]
  const one = (t: Tier): SkillDef => ({ ...cardAt(spec, t), key, start: spec.tier, paths: {} })
  const def = one(tier)
  def.paths = pathsOf(reachable(spec.tier).map(one))
  return def
}
