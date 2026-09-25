import { ENCHANTS, rollEnchants, type Enchant } from './enchant.ts'
import { ITEM_KEYS, ITEMS, type ItemKey } from './items.ts'
import { rollOffer } from './shop.ts'
import { SKILL_KEYS, SKILLS, type SkillKey } from './skills.ts'
import { TIER_ORDER, type Tier } from './tiers.ts'

// What an hour can offer. Plain data: the run loop in main.ts interprets it.

interface Base { name: string; blurb: string; color: [string, string] }

/** An opponent's item: its key, or a key with a tier (starting tier by default) and an enchantment. */
export type Loadout = ItemKey | { key: ItemKey; tier?: Tier; enchant?: Enchant }
/** An opponent's skill: its key (at its starting tier), or a key with a tier. */
export type SkillPick = SkillKey | { key: SkillKey; tier: Tier }
export const loadout = (l: Loadout) => (typeof l === 'string' ? { key: l } : l)
export const skillPick = (s: SkillPick) => (typeof s === 'string' ? { key: s, tier: SKILLS[s].tier } : s)

/** Stocks items with any of `tags` (all items when omitted). */
export interface Merchant extends Base { kind: 'merchant'; tags?: string[] }

/** One pick in an event. Costs are negative gold. An enchantment is then applied to an item you choose. */
export interface Reward { label: string; text: string[]; gold?: number; income?: number; item?: ItemKey; skill?: SkillKey; tier?: Tier; enchant?: Enchant }
/** What events can ask about the run. */
export interface EventContext { day: number; canLearn(skill: SkillKey): boolean; canEnchant(e: Enchant): boolean }
export interface GameEvent extends Base { kind: 'event'; options: (random: () => number, ctx: EventContext) => Reward[] }

export interface Monster extends Base { kind: 'monster'; day: number; hp: number; items: Loadout[]; skills?: SkillPick[]; gold: number; xp: number }

export type Encounter = Merchant | GameEvent | Monster

const shuffled = <T,>(list: T[], random: () => number) => [...list].sort(() => random() - 0.5)

/** The tier trainers and rivals hand skills out at on `day`. */
export const skillTier = (day: number): Tier => (day <= 2 ? 'bronze' : day <= 5 ? 'silver' : 'gold')

export const MERCHANTS: Merchant[] = [
  { kind: 'merchant', name: 'Odd Trader', blurb: 'A bit of everything.', color: ['#5aa07a', '#1e3c2c'] },
  { kind: 'merchant', name: 'Weaponsmith', blurb: 'Weapons only.', color: ['#a0605a', '#3c1e1e'], tags: ['Weapon'] },
  { kind: 'merchant', name: 'Apothecary', blurb: 'Potions and friends.', color: ['#7a5aa0', '#2c1e3c'], tags: ['Potion', 'Friend'] },
  { kind: 'merchant', name: 'Tinker', blurb: 'Tech, tools and armor.', color: ['#5a7aa0', '#1e2a3c'], tags: ['Tech', 'Tool', 'Armor'] },
]

export const EVENTS: GameEvent[] = [
  {
    kind: 'event', name: 'Lucky Find', blurb: 'A purse in the dust.', color: ['#b0904a', '#3c2e14'],
    options: () => [
      { label: 'Pocket it', text: ['Gain 5 gold'], gold: 5 },
      { label: 'Invest it', text: ['Gain 1 income'], income: 1 },
    ],
  },
  {
    kind: 'event', name: 'Loot Cart', blurb: 'Take one, quickly.', color: ['#8a6a3a', '#2a1e0c'],
    options: (random, ctx) => [0, 1, 2].map(() => {
      const { key, tier } = rollOffer(ctx.day, ITEM_KEYS, random)!
      return { label: ITEMS[key].name, text: ['Take this for free'], item: key, tier }
    }),
  },
  {
    kind: 'event', name: 'Roadside Shrine', blurb: 'It hums when you get close.', color: ['#4a8a9a', '#123038'],
    options: () => [
      { label: 'Make an offering', text: ['Pay 4 gold', 'Gain 2 income'], gold: -4, income: 2 },
      { label: 'Walk on', text: ['Nothing happens'] },
    ],
  },
  {
    kind: 'event', name: 'Wandering Mentor', blurb: 'Teaches one trick, then moves on.', color: ['#5a7a4a', '#1a2a14'],
    options: (random, ctx) => {
      const tier = skillTier(ctx.day)
      const open = SKILL_KEYS.filter(k => TIER_ORDER.indexOf(SKILLS[k].tier) <= TIER_ORDER.indexOf(tier) && ctx.canLearn(k))
      return shuffled(open, random).slice(0, 3).map(skill => ({ label: SKILLS[skill].name, text: ['Learn this skill'], skill, tier }))
    },
  },
  {
    kind: 'event', name: 'Enchanter', blurb: 'Picks up your things and hums at them.', color: ['#7a4a9a', '#241430'],
    options: (random, ctx) => rollEnchants(3, random, ctx.canEnchant).map(e => ({ label: ENCHANTS[e].name, text: ENCHANTS[e].text, enchant: e })),
  },
]

export const MONSTERS: Monster[] = [
  { kind: 'monster', name: 'Scrap Rat', blurb: 'Bites.', color: ['#7a6a5a', '#2a221a'], day: 1, hp: 100, items: ['rustBlade', 'rustBlade'], gold: 2, xp: 3 },
  { kind: 'monster', name: 'Bog Toad', blurb: 'Slow and toxic.', color: ['#4a7a4a', '#16261a'], day: 1, hp: 150, items: ['venomVial', 'ironPot'], gold: 2, xp: 3 },
  { kind: 'monster', name: 'Ember Imp', blurb: 'Sets things on fire.', color: ['#b0502a', '#3a140a'], day: 2, hp: 200, items: ['emberFlask', 'emberFlask', 'rustBlade'], skills: ['kindling'], gold: 3, xp: 3 },
  { kind: 'monster', name: 'Frost Wisp', blurb: 'Everything gets slow around it.', color: ['#4a7a9a', '#12222e'], day: 2, hp: 220, items: ['frostLantern', 'tarPot'], skills: ['openingGuard'], gold: 3, xp: 3 },
  { kind: 'monster', name: 'Rust Golem', blurb: 'Hits once, hits hard.', color: ['#8a5a3a', '#2a1a10'], day: 2, hp: 280, items: ['siegeAnvil'], gold: 3, xp: 3 },
  { kind: 'monster', name: 'Clockwork Knight', blurb: 'Armored and patient.', color: ['#6a7a8a', '#1e242a'], day: 3, hp: 350, items: ['towerShield', 'handCannon'], skills: ['openingGuard'], gold: 4, xp: 4 },
  { kind: 'monster', name: 'Tinker Gnome', blurb: 'Keeps everything wound up.', color: ['#8a7a3a', '#2a2410'], day: 3, hp: 320, items: ['windupKey', 'sparkPistol', 'ammoCrate', 'signalFlare'], skills: ['quickHands'], gold: 4, xp: 4 },
  { kind: 'monster', name: 'Scrap Wrecker', blurb: 'Breaks your little things.', color: ['#6a6a5a', '#1e1e18'], day: 3, hp: 340, items: ['wreckingBall', { key: 'repairKit', enchant: 'radiant' }], skills: ['veteran'], gold: 4, xp: 4 },
  { kind: 'monster', name: 'Hive Queen', blurb: 'Never alone.', color: ['#9a8a2a', '#2e2a0c'], day: 4, hp: 450, items: ['brassBeetle', 'brassBeetle', 'venomVial', 'venomVial'], skills: ['sharpEye'], gold: 5, xp: 4 },
  { kind: 'monster', name: 'Blood Bat', blurb: 'Drinks deep.', color: ['#8a2a3a', '#2a0a10'], day: 4, hp: 420, items: [{ key: 'leechKnife', enchant: 'obsidian' }, 'hungrySword', 'luckyDagger'], skills: ['bloodthirst', 'coldSnap'], gold: 5, xp: 4 },
  { kind: 'monster', name: 'Iron Warden', blurb: 'The road ends here.', color: ['#5a5a6a', '#18181e'], day: 5, hp: 600, items: [{ key: 'siegeAnvil', enchant: 'shielded' }, 'towerShield', 'sparkPistol', 'ironPot', 'rustBlade'], skills: ['ironWill'], gold: 6, xp: 4 },
]

/** Three picks for a non-combat hour: always one merchant, the other two merchants or events. */
export function hourOptions(random: () => number): (Merchant | GameEvent)[] {
  const [first, ...merchants] = shuffled(MERCHANTS, random)
  return shuffled([first, ...shuffled([...merchants, ...EVENTS], random).slice(0, 2)], random)
}

/** Three monsters around today's difficulty: the toughest ones unlocked so far, shuffled. */
export function monsterOptions(day: number, random: () => number): Monster[] {
  const open = MONSTERS.filter(m => m.day <= day).slice(-5)
  return shuffled(open, random).slice(0, 3)
}
