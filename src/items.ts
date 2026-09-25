import type { Size } from './board.ts'
import type { Ability, Action, Aura, GrowStat, Immunity, Trigger } from './engine/combat.ts'
import { enchantRule, type Enchant } from './enchant.ts'
import { at, cardAt, grows, pathsOf, reachable, statAt, stepOf, steps, tiers, type CardBase, type Num, type Resolved, type Stat, type Tier } from './tiers.ts'

interface ItemBase<N> extends CardBase<N> {
  size: Size
  cooldown?: N // seconds; none = passive
  multicast?: N
  ammo?: N
  immune?: Immunity[]
  quest?: Quest<N>
}

/**
 * A quest: every time `on` happens (in a fight or between fights; `stash` counts it from the stash too),
 * progress goes up by one. At `goal` it's done, once: the reward joins the item for good.
 */
export interface Quest<N> {
  on: Trigger
  goal: N
  text: string // what to do; {goal} reads the goal
  stash?: boolean
  reward: QuestReward<N>
}
/**
 * Stats add to the item's, vals and multicast/crit replace, abilities/auras and text join it for good.
 * Or it upgrades, or becomes another item (then `text` only describes the reward).
 */
export interface QuestReward<N> {
  text: string[]
  stats?: Partial<Record<Stat, N>>
  vals?: Record<string, N>
  multicast?: N
  crit?: N
  abilities?: Ability[]
  auras?: Aura[]
  upgrade?: boolean // goes up a tier
  transform?: string // an item key: becomes that item, same size (keeps its tier and enchantment when it can)
}

/** What an item picks up during a run, on top of its tier and enchantment. */
export interface RunState {
  perm?: Partial<Record<GrowStat, number>> // permanent gains
  progress?: number // quest progress
  done?: boolean // quest completed
}

/** An item as written below: numbers may be upgrade paths (see tiers.ts). */
export interface ItemSpec extends ItemBase<Num> {
  /**
   * Per-item enchantments: a function replaces the rule in enchant.ts (it gets the item at its tier and
   * can call `enchantRule` itself to build on it), `false` means this item can't take that enchantment.
   */
  enchants?: Partial<Record<Enchant, false | ((def: ItemDef) => ItemDef | null)>>
}

/** An item at one tier (and maybe enchanted, with its run state): plain numbers, what the engine and the card view use. */
export interface ItemDef extends ItemBase<number>, Resolved {
  key: ItemKey
  enchant?: Enchant
  enchantText?: string[] // what the enchantment added, for the tooltip
  value: number // sell value on top of the price (grown)
  perm: Partial<Record<GrowStat, number>> // permanent gains, for the tooltip
  progress: number
  done: boolean
}

/** The common case: when this item is used, do these. */
const onUse = (...actions: Action[]): Ability => ({ when: { on: 'use' }, do: actions })

// ---------------------------------------------------------------------------------------------------------
// Placeholder content. The second half is a test set: between them they use every effect, trigger,
// target and value the engine has, several kinds of upgrade path, and every enchantment case
// (T1/T2 items, scalers, auras, passives, items the rules can't enchant). Real items come later.

export const ITEMS = {
  handCannon: {
    name: 'Hand Cannon', size: 2, tier: 'gold', tags: ['Weapon'], cooldown: 7,
    stats: { damage: 8, burn: 2 }, multicast: 3,
    text: ['Deal [damage] <Damage>', '<Burn> [burn]', '<Multicast>: [multicast]'],
    abilities: [onUse({ do: 'damage' }, { do: 'burn' })],
    art: { bg: ['#6f7684', '#2b2f38'], icons: ['cannon', { icon: 'fire', color: 'burn' }] },
  },
  sparkPistol: {
    name: 'Spark Pistol', size: 1, tier: 'bronze', tags: ['Weapon', 'Tech'], cooldown: 4,
    stats: { damage: 10 }, ammo: 6,
    text: ['Deal [damage] <Damage>', '<Ammo> [ammo]'],
    abilities: [onUse({ do: 'damage' })],
    art: { bg: ['#7c6a4a', '#2c2418'], icons: ['pistol-gun', { icon: 'sparkles', color: '#9ee4ff' }] },
  },
  towerShield: {
    name: 'Tower Shield', size: 2, tier: 'silver', tags: ['Armor'], cooldown: 6,
    stats: { shield: 20 },
    text: ['Gain [shield] <Shield>'],
    abilities: [onUse({ do: 'shield' })],
    art: { bg: ['#4f6282', '#1b2232'], icons: ['roman-shield'] },
  },
  emberFlask: {
    name: 'Ember Flask', size: 1, tier: 'gold', tags: ['Potion'], cooldown: 5,
    stats: { burn: 4 },
    text: ['<Burn> [burn]', 'Your other <Burn> items gain [burn 1]'],
    abilities: [onUse({ do: 'burn' })],
    auras: [{ stat: 'burn', add: 1, targets: { pick: 'mine', excludeSelf: true, where: { has: 'burn' } } }],
    art: { bg: ['#9a4a2a', '#2e140c'], icons: ['round-bottom-flask', { icon: 'flame', color: 'burn' }] },
  },
  fieldKit: {
    name: 'Field Kit', size: 1, tier: 'bronze', tags: ['Tool', 'Friend'], cooldown: 4,
    stats: { heal: 10 },
    text: ['<Heal> [heal]', '<Haste> an item for [haste 1] second(s)'],
    abilities: [onUse({ do: 'heal' }, { do: 'haste', seconds: 1, targets: { pick: 'mine', excludeSelf: true, where: { has: 'cooldown' }, random: 1 } })],
    art: { bg: ['#c27a3a', '#3a2010'], icons: ['medical-pack', { icon: 'heart-plus', color: 'heal' }] },
  },
  siegeAnvil: {
    name: 'Siege Anvil', size: 3, tier: 'bronze', tags: ['Tool', 'Weapon'], cooldown: 9,
    stats: { damage: 30, shield: 15 },
    text: ['Deal [damage] <Damage>', 'Gain [shield] <Shield>'],
    abilities: [onUse({ do: 'damage' }, { do: 'shield' })],
    art: { bg: ['#6a5040', '#221812'], icons: ['anvil', { icon: 'flat-hammer', rotate: -30 }] },
  },
  venomVial: {
    name: 'Venom Vial', size: 1, tier: 'diamond', tags: ['Potion'], cooldown: 3,
    stats: { poison: 3 },
    text: ['<Poison> [poison]'],
    abilities: [onUse({ do: 'poison' })],
    art: { bg: ['#2f7a62', '#0e2a22'], icons: ['vial', { icon: 'drop', color: 'poison' }] },
  },
  brassBeetle: {
    name: 'Brass Beetle', size: 2, tier: 'silver', tags: ['Friend', 'Tech'], cooldown: 5,
    stats: { damage: 12 },
    text: ['Deal [damage] <Damage>', 'When you use an adjacent item, <Haste> this for [haste 1] second'],
    abilities: [
      onUse({ do: 'damage' }),
      { when: { on: 'itemUsed', who: { pick: 'neighbors' } }, do: [{ do: 'haste', seconds: 1, targets: { pick: 'self' } }] },
    ],
    art: { bg: ['#8a6a2a', '#2a200c'], icons: ['scarab-beetle', { icon: 'gears', color: '#e8b860' }] },
  },
  rustBlade: {
    name: 'Rust Blade', size: 1, tier: 'bronze', tags: ['Weapon'], cooldown: 3,
    stats: { damage: 5 },
    text: ['Deal [damage] <Damage>'],
    abilities: [onUse({ do: 'damage' })],
    art: { bg: ['#7a4a3a', '#2e1a14'], icons: ['rusty-sword'] },
  },
  ironPot: {
    name: 'Iron Pot', size: 1, tier: 'bronze', tags: ['Armor'], cooldown: 5,
    stats: { shield: 10 },
    text: ['Gain [shield] <Shield>'],
    abilities: [onUse({ do: 'shield' })],
    art: { bg: ['#5a5a62', '#1c1c22'], icons: ['cooking-pot'] },
  },

  // --- Test set ---

  // Freeze; the number of targets grows with tier.
  frostLantern: {
    name: 'Frost Lantern', size: 2, tier: 'silver', tags: ['Tech'], cooldown: 6,
    stats: {}, vals: { targets: tiers(1, 2, 3), freeze: 1 },
    text: ['<Freeze> {targets} enemy item(s) for [freeze] second(s)'],
    abilities: [onUse({ do: 'freeze', seconds: { val: 'freeze' }, targets: { pick: 'enemy', where: { has: 'cooldown' }, random: { val: 'targets' } } })],
    art: { bg: ['#4a6a8a', '#15202e'], icons: ['lantern', { icon: 'snowflake-2', color: 'freeze' }] },
  },
  // Slow; the cooldown drops with tier.
  tarPot: {
    name: 'Tar Pot', size: 1, tier: 'bronze', tags: ['Tool'], cooldown: tiers(6, 5, 4, 3),
    stats: {}, vals: { slow: 2 },
    text: ['<Slow> an enemy item for [slow] second(s)'],
    abilities: [onUse({ do: 'slow', seconds: { val: 'slow' }, targets: { pick: 'enemy', where: { has: 'cooldown' }, random: 1 } })],
    art: { bg: ['#4a3a5a', '#16101e'], icons: ['pouring-pot', { icon: 'droplets', color: 'slow' }] },
  },
  // Charge neighbors; an irregular path.
  windupKey: {
    name: 'Wind-up Key', size: 1, tier: 'bronze', tags: ['Tool'], cooldown: 4,
    stats: {}, vals: { charge: tiers(1, 1, 2, 3) },
    text: ['<Charge> adjacent items [charge] second(s)'],
    abilities: [onUse({ do: 'charge', seconds: { val: 'charge' }, targets: { pick: 'neighbors', where: { has: 'cooldown' } } })],
    art: { bg: ['#8a7a4a', '#2a2412'], icons: ['key', { icon: 'clockwise-rotation', color: 'charge' }] },
  },
  // Haste neighbors; +1 second per tier.
  marchingDrum: {
    name: 'Marching Drum', size: 2, tier: 'bronze', tags: ['Instrument'], cooldown: 5,
    stats: {}, vals: { haste: steps(1, 1) },
    text: ['<Haste> adjacent items for [haste] second(s)'],
    abilities: [onUse({ do: 'haste', seconds: { val: 'haste' }, targets: { pick: 'neighbors', where: { has: 'cooldown' } } })],
    art: { bg: ['#9a5a3a', '#2e1a10'], icons: ['drum'] },
  },
  // Reload, filtering by a stat.
  ammoCrate: {
    name: 'Ammo Crate', size: 2, tier: 'silver', tags: ['Tool'], cooldown: 7,
    stats: { shield: 10 },
    text: ['<Reload> your <Ammo> items', 'Gain [shield] <Shield>'],
    abilities: [onUse({ do: 'reload', targets: { pick: 'mine', where: { has: 'ammo' } } }, { do: 'shield' })],
    art: { bg: ['#6a5a3a', '#221c10'], icons: ['wooden-crate', { icon: 'bullets', color: 'ammo' }] },
  },
  // Heal and Regen.
  herbPouch: {
    name: 'Herb Pouch', size: 1, tier: 'bronze', tags: ['Potion'], cooldown: 5,
    stats: { heal: 8, regen: 2 },
    text: ['<Heal> [heal]', 'Gain [regen] <Regen>'],
    abilities: [onUse({ do: 'heal' }, { do: 'regen' })],
    art: { bg: ['#4a7a3a', '#142410'], icons: ['herbs-bundle'] },
  },
  // Crit, with its own crit path, and a crit trigger on itself.
  luckyDagger: {
    name: 'Lucky Dagger', size: 1, tier: 'bronze', tags: ['Weapon'], cooldown: 3,
    stats: { damage: 4 }, crit: tiers(25, 35, 45, 55),
    text: ['Deal [damage] <Damage>', '[crit]% <Crit> chance', 'When this crits, <Charge> it [charge 1] second(s)'],
    abilities: [onUse({ do: 'damage' }), { when: { on: 'crit', who: { pick: 'self' } }, do: [{ do: 'charge', seconds: 1, targets: { pick: 'self' } }] }],
    art: { bg: ['#3a6a5a', '#10221c'], icons: ['plain-dagger', { icon: 'clover', color: '#7ee07e' }] },
  },
  // Lifesteal.
  leechKnife: {
    name: 'Leech Knife', size: 1, tier: 'silver', tags: ['Weapon'], cooldown: 4,
    stats: { damage: 8 }, lifesteal: tiers(50, 75, 100),
    text: ['Deal [damage] <Damage>', '<Lifesteal> [lifesteal]%'],
    abilities: [onUse({ do: 'damage' })],
    art: { bg: ['#7a2a3a', '#240c12'], icons: ['curvy-knife', { icon: 'leeching-worm', color: 'lifesteal' }] },
  },
  // Passive aura on neighbors, filtered by tag.
  whetstone: {
    name: 'Whetstone', size: 1, tier: 'bronze', tags: ['Tool'],
    stats: {}, vals: { bonus: grows(4) },
    text: ['Adjacent Weapons have +[damage bonus] <Damage>'],
    abilities: [],
    auras: [{ stat: 'damage', add: { val: 'bonus' }, targets: { pick: 'neighbors', where: { tag: 'Weapon' } } }],
    art: { bg: ['#6a6a72', '#202026'], icons: ['stone-block', { icon: 'broadsword', rotate: 45, x: 66, y: 34 }] },
  },
  // A T1 scaler: gains Damage each use.
  hungrySword: {
    name: 'Hungry Sword', size: 2, tier: 'bronze', tags: ['Weapon'], cooldown: 5,
    stats: { damage: 10 }, vals: { gain: grows(5) },
    text: ['Deal [damage] <Damage>', 'Then this gains +[damage gain] <Damage> for the fight'],
    abilities: [onUse({ do: 'damage' }, { do: 'modify', stat: 'damage', add: { val: 'gain' }, targets: { pick: 'self' } })],
    art: { bg: ['#8a3a3a', '#2a1010'], icons: ['broadsword', { icon: 'fangs', color: 'damage' }] },
  },
  // A T2 scaler on a "when you Burn" trigger.
  kindlingTorch: {
    name: 'Kindling Torch', size: 1, tier: 'silver', tags: ['Tool'], cooldown: 4,
    stats: { burn: 3 }, vals: { gain: 1 },
    text: ['<Burn> [burn]', 'When you <Burn>, this gains +[burn gain] <Burn> for the fight'],
    abilities: [
      onUse({ do: 'burn' }),
      { when: { on: 'performed', effect: 'burn' }, do: [{ do: 'modify', stat: 'burn', add: { val: 'gain' }, targets: { pick: 'self' } }] },
    ],
    art: { bg: ['#9a5a2a', '#2e1a0a'], icons: ['torch'] },
  },
  // Leftmost and rightmost.
  signalFlare: {
    name: 'Signal Flare', size: 1, tier: 'bronze', tags: ['Tech'], cooldown: 6,
    stats: {},
    text: ['<Haste> your leftmost item for [haste 2] second(s)', '<Charge> your rightmost item [charge 1] second(s)'],
    abilities: [onUse({ do: 'haste', seconds: 2, targets: { pick: 'leftmost' } }, { do: 'charge', seconds: 1, targets: { pick: 'rightmost' } })],
    art: { bg: ['#8a3a5a', '#2a101c'], icons: ['firework-rocket'] },
  },
  // Amounts read from other items' stats; left and right.
  mirrorShield: {
    name: 'Mirror Shield', size: 2, tier: 'silver', tags: ['Armor'], cooldown: tiers(6, 5, 4),
    stats: {},
    text: ['Gain <Shield> equal to twice the <Damage> of the item to the left', '<Heal> equal to the <Shield> of the item to the right'],
    abilities: [onUse(
      { do: 'shield', amount: { stat: 'damage', of: { pick: 'left' }, times: 2 } },
      { do: 'heal', amount: { stat: 'shield', of: { pick: 'right' } } },
    )],
    art: { bg: ['#5a7a9a', '#18222e'], icons: ['shield-reflect'] },
  },
  // Fight start, a count-based amount and a condition.
  warBanner: {
    name: 'War Banner', size: 3, tier: 'gold', tags: ['Tool'], cooldown: 8,
    stats: { damage: 30 }, vals: { haste: 1 },
    text: [
      'At the start of each fight, <Haste> your items for [haste] second(s)',
      'Gain [shield 10] <Shield> for each of your Weapons',
      'If you have 3 or more Weapons, deal [damage] <Damage>',
    ],
    abilities: [
      { when: { on: 'fightStart' }, do: [{ do: 'haste', seconds: { val: 'haste' }, targets: { pick: 'mine', where: { has: 'cooldown' } } }] },
      onUse({ do: 'shield', amount: { count: { pick: 'mine', where: { tag: 'Weapon' } }, times: 10 } }),
      { when: { on: 'use' }, if: { count: { pick: 'mine', where: { tag: 'Weapon' } }, atLeast: 3 }, do: [{ do: 'damage' }] },
    ],
    art: { bg: ['#7a2a2a', '#240a0a'], layout: 'row', icons: ['tattered-banner', 'crossed-swords', { icon: 'tattered-banner', flip: true }] },
  },
  // Legendary. Every item on both sides, a negated filter, a size filter.
  blizzardOrb: {
    name: 'Blizzard Orb', size: 2, tier: 'legendary', tags: ['Tech'], cooldown: 9,
    stats: {},
    text: ['<Slow> all items for [slow 1] second(s)', '<Freeze> enemy non-Weapon items for [freeze 1] second(s)', '<Haste> your Small items for [haste 2] second(s)'],
    abilities: [onUse(
      { do: 'slow', seconds: 1, targets: { pick: 'all', where: { has: 'cooldown' } } },
      { do: 'freeze', seconds: 1, targets: { pick: 'enemy', where: { tag: 'Weapon', not: true } } },
      { do: 'haste', seconds: 2, targets: { pick: 'mine', where: { size: 1 } } },
    )],
    art: { bg: ['#5a8aba', '#10203a'], icons: ['frozen-orb', { icon: 'snowflake-1', color: 'freeze' }, { icon: 'snowflake-2', color: 'freeze' }] },
  },
  // A passive that reacts: charges whichever neighbor was just used.
  echoBell: {
    name: 'Echo Bell', size: 1, tier: 'bronze', tags: ['Instrument'],
    stats: {}, vals: { charge: tiers(0.5, 1, 1, 1.5) },
    text: ['When you use an adjacent item, <Charge> it [charge] second(s)'],
    abilities: [{ when: { on: 'itemUsed', who: { pick: 'neighbors' } }, do: [{ do: 'charge', seconds: { val: 'charge' }, targets: { pick: 'source' } }] }],
    art: { bg: ['#9a8a4a', '#2e2812'], icons: ['ringing-bell'] },
  },

  // --- Test set: run effects, quests, destroy/repair, transform, cleanse, multipliers ---

  // Permanent growth after a win.
  trophyAxe: {
    name: 'Trophy Axe', size: 2, tier: 'bronze', tags: ['Weapon'], cooldown: 6,
    stats: { damage: 12 }, vals: { gain: grows(4) },
    text: ['Deal [damage] <Damage>', 'When you win a fight, this permanently gains +[damage gain] <Damage>'],
    abilities: [onUse({ do: 'damage' }), { when: { on: 'win' }, do: [{ do: 'grow', stat: 'damage', add: { val: 'gain' }, targets: { pick: 'self' } }] }],
    art: { bg: ['#8a5a2a', '#2a1a0a'], icons: ['battle-axe', { icon: 'laurel-crown', color: '#f2c64e' }] },
  },
  // Value growth each day, working from the stash.
  piggyBank: {
    name: 'Piggy Bank', size: 1, tier: 'bronze', tags: ['Tool'],
    stats: {}, vals: { gain: grows(1) },
    text: ['At the start of each day, this gains [value gain] <Value>', 'Works from your stash'],
    abilities: [{ when: { on: 'dayStart' }, stash: true, do: [{ do: 'grow', stat: 'value', add: { val: 'gain' }, targets: { pick: 'self' } }] }],
    art: { bg: ['#b06a8a', '#3a1a2a'], icons: ['piggy-bank'] },
  },
  // Permanent growth during a fight, on another item.
  bloodstone: {
    name: 'Bloodstone', size: 1, tier: 'silver', tags: ['Relic'],
    stats: {},
    text: ['When you use an adjacent Weapon, it permanently gains +[damage 1] <Damage>'],
    abilities: [{ when: { on: 'itemUsed', who: { pick: 'neighbors', where: { tag: 'Weapon' } } }, do: [{ do: 'grow', stat: 'damage', add: 1, targets: { pick: 'source' } }] }],
    art: { bg: ['#7a1a2a', '#22060c'], icons: ['crystal-growth', { icon: 'drop', color: 'damage' }] },
  },
  // Sell trigger, from the stash too.
  coinPurse: {
    name: 'Coin Purse', size: 1, tier: 'bronze', tags: ['Tool'],
    stats: {}, vals: { gain: grows(1) },
    text: ['When you sell an item, this gains [value gain] <Value>', 'Works from your stash'],
    abilities: [{ when: { on: 'sell' }, stash: true, do: [{ do: 'grow', stat: 'value', add: { val: 'gain' }, targets: { pick: 'self' } }] }],
    art: { bg: ['#8a6a3a', '#2a1e0c'], icons: ['swap-bag', { icon: 'two-coins', color: 'gold' }] },
  },
  // Buy trigger filtered by what was bought; gold.
  luckyCoin: {
    name: 'Lucky Coin', size: 1, tier: 'silver', tags: ['Relic'],
    stats: {}, vals: { gold: 1 },
    text: ['When you buy a Weapon, gain [gold] <Gold>'],
    abilities: [{ when: { on: 'buy', what: { tag: 'Weapon' } }, do: [{ do: 'gold', amount: { val: 'gold' } }] }],
    art: { bg: ['#9a8a3a', '#2e2810'], icons: ['coinflip'] },
  },
  // Quest counted in fights, rewarded with a stat.
  squireSword: {
    name: 'Squire Sword', size: 2, tier: 'bronze', tags: ['Weapon'], cooldown: 5,
    stats: { damage: 10 },
    text: ['Deal [damage] <Damage>'],
    quest: { on: { on: 'use' }, goal: 15, text: 'Use this {goal} times', reward: { text: ['<Multicast>: [multicast 2]'], multicast: 2 } },
    abilities: [onUse({ do: 'damage' })],
    art: { bg: ['#5a6a7a', '#1a2028'], icons: ['broadsword', { icon: 'scroll-unfurled', color: '#e8d8a8' }] },
  },
  // Quest counted between fights, rewarded with an upgrade.
  wornCompass: {
    name: 'Worn Compass', size: 1, tier: 'bronze', tags: ['Tool'], cooldown: 5,
    stats: {},
    text: ['<Charge> adjacent items [charge 1] second(s)'],
    quest: { on: { on: 'win' }, goal: 2, text: 'Win {goal} fights', reward: { text: ['Goes up a tier'], upgrade: true } },
    abilities: [onUse({ do: 'charge', seconds: 1, targets: { pick: 'neighbors', where: { has: 'cooldown' } } })],
    art: { bg: ['#6a5a3a', '#201a10'], icons: ['compass'] },
  },
  // Quest from the stash, rewarded by turning into another item.
  strangeEgg: {
    name: 'Strange Egg', size: 2, tier: 'bronze', tags: ['Friend'],
    stats: {},
    text: ['Something is moving inside'],
    quest: { on: { on: 'dayStart' }, goal: 2, stash: true, text: 'Keep it for {goal} days (works from your stash)', reward: { text: ['Hatches into a Brass Beetle'], transform: 'brassBeetle' } },
    abilities: [],
    art: { bg: ['#6a8a5a', '#1a2a14'], icons: ['egg-clutch'] },
  },
  // Destroy.
  wreckingBall: {
    name: 'Wrecking Ball', size: 3, tier: 'silver', tags: ['Weapon', 'Tool'], cooldown: 9,
    stats: { damage: 20 },
    text: ['Deal [damage] <Damage>', '<Destroy> an enemy Small item'],
    abilities: [onUse({ do: 'damage' }, { do: 'destroy', targets: { pick: 'enemy', where: { size: 1 }, random: 1 } })],
    art: { bg: ['#5a5a5a', '#1a1a1a'], icons: ['wrecking-ball'] },
  },
  // Repair.
  repairKit: {
    name: 'Repair Kit', size: 1, tier: 'bronze', tags: ['Tool'], cooldown: 5,
    stats: { heal: 10 },
    text: ['<Repair> one of your destroyed items', '<Heal> [heal]'],
    abilities: [onUse({ do: 'repair', targets: { pick: 'mine', destroyed: true, random: 1 } }, { do: 'heal' })],
    art: { bg: ['#3a7a6a', '#0e2420'], icons: ['toolbox'] },
  },
  // Transform for the fight.
  trickMirror: {
    name: 'Trick Mirror', size: 1, tier: 'silver', tags: ['Tech'], cooldown: 6,
    stats: {},
    text: ['<Transform> the item to the right into a random item of its size, for this fight'],
    abilities: [onUse({ do: 'transform', targets: { pick: 'right' } })],
    art: { bg: ['#6a3a8a', '#1e1028'], icons: ['mirror-mirror'] },
  },
  // Cleanse, on you and your items.
  antidote: {
    name: 'Antidote', size: 1, tier: 'bronze', tags: ['Potion'], cooldown: 4,
    stats: { heal: 5 },
    text: ['<Cleanse> your Burn and Poison', 'Your items shake off <Slow> and <Freeze>', '<Heal> [heal]'],
    abilities: [onUse({ do: 'cleanse', what: ['burn', 'poison', 'slow', 'freeze'] }, { do: 'heal' })],
    art: { bg: ['#4a8a8a', '#102626'], icons: ['potion-ball', { icon: 'sparkles', color: 'cleanse' }] },
  },
  // A multiplying aura.
  warHorn: {
    name: 'War Horn', size: 2, tier: 'gold', tags: ['Instrument'],
    stats: {},
    text: ['Your Weapons deal double <Damage>'],
    abilities: [],
    auras: [{ stat: 'damage', mul: 2, targets: { pick: 'mine', where: { tag: 'Weapon' } } }],
    art: { bg: ['#8a6a2a', '#2a1e0a'], icons: ['horn-internal'] },
  },
  // A multiplying modification for the fight.
  focusLens: {
    name: 'Focus Lens', size: 1, tier: 'silver', tags: ['Tech'], cooldown: 7,
    stats: {},
    text: ['Double the <Damage> of the item to the right, for this fight'],
    abilities: [onUse({ do: 'modify', stat: 'damage', mul: 2, targets: { pick: 'right' } })],
    art: { bg: ['#3a6a9a', '#0e1e2e'], icons: ['magnifying-glass'] },
  },
} satisfies Record<string, ItemSpec>

export type ItemKey = keyof typeof ITEMS
export const ITEM_KEYS = Object.keys(ITEMS) as ItemKey[]

const spec = (key: ItemKey): ItemSpec => ITEMS[key]

/** One tier of an item with its quest state, before enchanting and permanent gains. */
function resolve(key: ItemKey, tier: Tier, run: RunState = {}): ItemDef {
  const { enchants: _, quest, ...s } = spec(key)
  const step = stepOf(s.tier, tier)
  const def: ItemDef = { ...cardAt(s, tier), key, start: s.tier, size: s.size, paths: {}, value: 0, perm: {}, progress: run.progress ?? 0, done: !!run.done }
  for (const k of ['cooldown', 'multicast', 'ammo'] as const) if (s[k] !== undefined) def[k] = at(s[k], step)
  if (!quest) return def
  const { stats, vals, multicast, crit, ...r } = quest.reward
  const reward: QuestReward<number> = { ...r, stats: stats && mapNums(stats, n => statAt(n, step)), vals: vals && mapNums(vals, n => at(n, step)) }
  if (multicast !== undefined) reward.multicast = at(multicast, step)
  if (crit !== undefined) reward.crit = at(crit, step)
  def.quest = { ...quest, goal: at(quest.goal, step), reward }
  if (!def.done) {
    // Counting: a plain ability, so fights and run-effects.ts count it like any other.
    def.abilities = [...def.abilities, { when: quest.on, stash: quest.stash, do: [{ do: 'progress' }] }]
    return def
  }
  for (const [k, v] of Object.entries(reward.stats ?? {})) def.stats[k as Stat] = (def.stats[k as Stat] ?? 0) + v
  def.vals = { ...def.vals, ...reward.vals }
  if (reward.multicast !== undefined) def.multicast = reward.multicast
  if (reward.crit !== undefined) def.crit = reward.crit
  def.abilities = [...def.abilities, ...(reward.abilities ?? [])]
  def.auras = [...(def.auras ?? []), ...(reward.auras ?? [])]
  if (!reward.upgrade && !reward.transform) def.text = [...def.text, ...reward.text] // those rewards happen once; nothing to keep saying
  return def
}

const mapNums = <N, M>(o: Record<string, N>, f: (n: N) => M) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(v)])) as Record<string, M>

/** Permanent gains: stats and crit/lifesteal add up, value goes on the sell price. */
function grown(def: ItemDef, perm: RunState['perm'] = {}): ItemDef {
  const out = { ...def, stats: { ...def.stats }, perm }
  for (const [k, v] of Object.entries(perm) as [GrowStat, number][]) {
    if (k === 'value') out.value += v
    else if (k === 'crit' || k === 'lifesteal') out[k] = (out[k] ?? 0) + v
    else out.stats[k] = (out.stats[k] ?? 0) + v
  }
  return out
}

/** `def` with `e`: the item's own override if it has one, else the rule. Null if it can't take it. */
function enchanted(def: ItemDef, e: Enchant): ItemDef | null {
  const own = spec(def.key).enchants?.[e]
  if (own === false) return null
  const out = own ? own(structuredClone(def)) : enchantRule(def, e)
  return out && { ...out, enchant: e }
}

/**
 * An item at `tier` (its starting tier by default), optionally enchanted, with what it picked up in the run,
 * and its upgrade paths filled in. Order: tier, quest reward, permanent gains, then the enchantment (so an
 * enchantment doubles what the item has grown into).
 */
export function itemAt(key: ItemKey, tier: Tier = spec(key).tier, enchant?: Enchant, run: RunState = {}): ItemDef {
  const one = (t: Tier) => {
    const d = grown(resolve(key, t, run), run.perm)
    return (enchant && enchanted(d, enchant)) || d
  }
  const def = one(tier)
  def.paths = pathsOf(reachable(def.start).map(one))
  return def
}

/**
 * `def` turned into `into`, or into a random item of the same size (never a Legendary): the same tier when
 * the new item can be it (else its starting tier), and the enchantment if it can take it. Run state stays behind.
 */
export function transformed(def: ItemDef, into: ItemKey | undefined, random: () => number): ItemDef | null {
  const pool = into ? [into] : ITEM_KEYS.filter(k => k !== def.key && ITEMS[k].size === def.size && ITEMS[k].tier !== 'legendary')
  if (!pool.length) return null
  const key = pool[Math.floor(random() * pool.length)]
  const tier = reachable(ITEMS[key].tier).includes(def.tier) ? def.tier : ITEMS[key].tier
  return itemAt(key, tier, def.enchant && canEnchant(key, def.enchant) ? def.enchant : undefined)
}

/** Whether `key` can take enchantment `e` (checked at its starting tier). */
export const canEnchant = (key: ItemKey, e: Enchant) => enchanted(resolve(key, spec(key).tier), e) !== null
