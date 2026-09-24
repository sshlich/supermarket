import { ITEMS, type ItemKey } from './items.ts'

// What an hour can offer. Plain data: the run loop in main.ts interprets it.

interface Base { name: string; blurb: string; color: [string, string] }

/** Stocks items with any of `tags` (all items when omitted). */
export interface Merchant extends Base { kind: 'merchant'; tags?: string[] }

/** One pick in an event. Costs are negative gold. */
export interface Reward { label: string; text: string[]; gold?: number; income?: number; item?: ItemKey }
export interface GameEvent extends Base { kind: 'event'; options: (random: () => number) => Reward[] }

export interface Monster extends Base { kind: 'monster'; day: number; hp: number; items: ItemKey[]; gold: number; xp: number }

export type Encounter = Merchant | GameEvent | Monster

const keys = Object.keys(ITEMS) as ItemKey[]
const pick = <T,>(list: T[], random: () => number) => list[Math.floor(random() * list.length)]

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
    options: random => [0, 1, 2].map(() => {
      const item = pick(keys, random)
      return { label: ITEMS[item].name, text: ['Take this for free'], item }
    }),
  },
  {
    kind: 'event', name: 'Roadside Shrine', blurb: 'It hums when you get close.', color: ['#4a8a9a', '#123038'],
    options: () => [
      { label: 'Make an offering', text: ['Pay 4 gold', 'Gain 2 income'], gold: -4, income: 2 },
      { label: 'Walk on', text: ['Nothing happens'] },
    ],
  },
]

export const MONSTERS: Monster[] = [
  { kind: 'monster', name: 'Scrap Rat', blurb: 'Bites.', color: ['#7a6a5a', '#2a221a'], day: 1, hp: 100, items: ['rustBlade', 'rustBlade'], gold: 2, xp: 3 },
  { kind: 'monster', name: 'Bog Toad', blurb: 'Slow and toxic.', color: ['#4a7a4a', '#16261a'], day: 1, hp: 150, items: ['venomVial', 'ironPot'], gold: 2, xp: 3 },
  { kind: 'monster', name: 'Ember Imp', blurb: 'Sets things on fire.', color: ['#b0502a', '#3a140a'], day: 2, hp: 200, items: ['emberFlask', 'emberFlask', 'rustBlade'], gold: 3, xp: 3 },
  { kind: 'monster', name: 'Rust Golem', blurb: 'Hits once, hits hard.', color: ['#8a5a3a', '#2a1a10'], day: 2, hp: 280, items: ['siegeAnvil'], gold: 3, xp: 3 },
  { kind: 'monster', name: 'Clockwork Knight', blurb: 'Armored and patient.', color: ['#6a7a8a', '#1e242a'], day: 3, hp: 350, items: ['towerShield', 'handCannon'], gold: 4, xp: 4 },
  { kind: 'monster', name: 'Hive Queen', blurb: 'Never alone.', color: ['#9a8a2a', '#2e2a0c'], day: 4, hp: 450, items: ['brassBeetle', 'brassBeetle', 'venomVial', 'venomVial'], gold: 5, xp: 4 },
  { kind: 'monster', name: 'Iron Warden', blurb: 'The road ends here.', color: ['#5a5a6a', '#18181e'], day: 5, hp: 600, items: ['siegeAnvil', 'towerShield', 'sparkPistol', 'ironPot', 'rustBlade'], gold: 6, xp: 4 },
]

/** Three picks for a non-combat hour: always one merchant, the other two merchants or events. */
export function hourOptions(random: () => number): (Merchant | GameEvent)[] {
  const shuffled = <T,>(list: T[]) => [...list].sort(() => random() - 0.5)
  const [first, ...merchants] = shuffled(MERCHANTS)
  return [first, ...shuffled([...merchants, ...EVENTS]).slice(0, 2)].sort(() => random() - 0.5)
}

/** Three monsters around today's difficulty: the toughest ones unlocked so far, shuffled. */
export function monsterOptions(day: number, random: () => number): Monster[] {
  const open = MONSTERS.filter(m => m.day <= day).slice(-5)
  return [...open].sort(() => random() - 0.5).slice(0, 3)
}
