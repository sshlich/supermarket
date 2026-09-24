import type { Size } from './board.ts'

export type Tier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'legendary'
export const TIER_COLOR: Record<Tier, string> = {
  bronze: '#c9814a',
  silver: '#c3d0dd',
  gold: '#f2c64e',
  diamond: '#86ecf7',
  legendary: '#e0609f',
}

const svg = (d: string) => `<svg class="ico" viewBox="0 0 16 16"><path d="${d}"/></svg>`

export type Keyword = 'damage' | 'shield' | 'heal' | 'burn' | 'poison' | 'haste' | 'multicast' | 'ammo'
/** Keywords color their word and value in descriptions; ones with `desc` also get a legend entry. */
export const KEYWORDS: Record<Keyword, { name: string; color: string; icon: string; desc?: string }> = {
  damage: { name: 'Damage', color: '#ff5a44', icon: svg('M8 0l1.8 5 5.2-1.5-4 4.5 4 4.5-5.2-1.5L8 16l-1.8-5L1 12.5l4-4.5-4-4.5L6.2 5z') },
  shield: { name: 'Shield', color: '#f5cc3d', icon: svg('M8 1l6 2v5c0 4-3 6.5-6 7.5C5 14.5 2 12 2 8V3z'), desc: 'Blocks incoming Damage until it breaks. Poison slips past it.' },
  heal: { name: 'Heal', color: '#7edc5a', icon: svg('M6 1h4v5h5v4h-5v5H6v-5H1V6h5z'), desc: 'Restores Health, up to your maximum.' },
  burn: { name: 'Burn', color: '#ff9b3a', icon: svg('M8 0c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3C7 6 6 3 8 0z'), desc: 'Hurts the enemy twice a second, getting weaker with every tick.' },
  poison: { name: 'Poison', color: '#58d69b', icon: svg('M8 0S2.5 7 2.5 10.5a5.5 5.5 0 0 0 11 0C13.5 7 8 0 8 0z'), desc: 'Hurts the enemy every second and ignores Shield.' },
  haste: { name: 'Haste', color: '#63d2ff', icon: svg('M1 2l6 6-6 6zm7 0l6 6-6 6z'), desc: 'The item charges twice as fast.' },
  multicast: { name: 'Multicast', color: '#f3e3c3', icon: svg('M2 3l6-2 6 2v2L8 3 2 5zm0 5l6-2 6 2v2L8 8l-6 2zm0 5l6-2 6 2v2l-6-2-6 2z'), desc: 'Each use triggers the effect this many times.' },
  ammo: { name: 'Ammo', color: '#f2d27a', icon: svg('M6 1h4a2 3 0 0 1 2 3v11H4V4a2 3 0 0 1 2-3z'), desc: 'Uses per fight. When it runs out the item stops firing.' },
}

export type Stat = 'damage' | 'shield' | 'heal' | 'burn' | 'poison'
export const STAT_ORDER: Stat[] = ['damage', 'shield', 'heal', 'burn', 'poison']

export interface ItemDef {
  name: string
  size: Size
  tier: Tier
  tags: string[]
  price: number
  cooldown?: number // seconds
  stats: Partial<Record<Stat, number>> // gems along the top edge
  multicast?: number
  ammo?: number
  /** Lines of description. `[burn 2]` = icon + value, `<Burn>` = colored keyword. */
  text: string[]
  art: [string, string] // placeholder art gradient until we have real art
}

export const ITEMS = {
  handCannon: {
    name: 'Hand Cannon', size: 2, tier: 'gold', tags: ['Weapon'], price: 16, cooldown: 7,
    stats: { damage: 8, burn: 2 }, multicast: 3,
    text: ['Deal [damage 8] <Damage>', '<Burn> [burn 2]', '<Multicast>: [multicast 3]'],
    art: ['#6f7684', '#2b2f38'],
  },
  sparkPistol: {
    name: 'Spark Pistol', size: 1, tier: 'bronze', tags: ['Weapon', 'Tech'], price: 2, cooldown: 4,
    stats: { damage: 10 }, ammo: 6,
    text: ['Deal [damage 10] <Damage>', '<Ammo> [ammo 6]'],
    art: ['#7c6a4a', '#2c2418'],
  },
  towerShield: {
    name: 'Tower Shield', size: 2, tier: 'silver', tags: ['Armor'], price: 8, cooldown: 6,
    stats: { shield: 20 },
    text: ['Gain [shield 20] <Shield>'],
    art: ['#4f6282', '#1b2232'],
  },
  emberFlask: {
    name: 'Ember Flask', size: 1, tier: 'gold', tags: ['Potion'], price: 8, cooldown: 5,
    stats: { burn: 4 },
    text: ['<Burn> [burn 4]', 'Your other <Burn> items gain [burn 1]'],
    art: ['#9a4a2a', '#2e140c'],
  },
  fieldKit: {
    name: 'Field Kit', size: 1, tier: 'bronze', tags: ['Tool', 'Friend'], price: 2, cooldown: 4,
    stats: { heal: 10 },
    text: ['<Heal> [heal 10]', '<Haste> an item for [haste 1] second(s)'],
    art: ['#c27a3a', '#3a2010'],
  },
  siegeAnvil: {
    name: 'Siege Anvil', size: 3, tier: 'bronze', tags: ['Tool', 'Weapon'], price: 6, cooldown: 9,
    stats: { damage: 30, shield: 15 },
    text: ['Deal [damage 30] <Damage>', 'Gain [shield 15] <Shield>'],
    art: ['#6a5040', '#221812'],
  },
  venomVial: {
    name: 'Venom Vial', size: 1, tier: 'diamond', tags: ['Potion'], price: 24, cooldown: 3,
    stats: { poison: 3 },
    text: ['<Poison> [poison 3]'],
    art: ['#2f7a62', '#0e2a22'],
  },
  brassBeetle: {
    name: 'Brass Beetle', size: 2, tier: 'silver', tags: ['Friend', 'Tech'], price: 8, cooldown: 5,
    stats: { damage: 12 },
    text: ['Deal [damage 12] <Damage>', 'When you use an adjacent item, <Haste> this for [haste 1] second'],
    art: ['#8a6a2a', '#2a200c'],
  },
  rustBlade: {
    name: 'Rust Blade', size: 1, tier: 'bronze', tags: ['Weapon'], price: 2, cooldown: 3,
    stats: { damage: 5 },
    text: ['Deal [damage 5] <Damage>'],
    art: ['#7a4a3a', '#2e1a14'],
  },
  ironPot: {
    name: 'Iron Pot', size: 1, tier: 'bronze', tags: ['Armor'], price: 2, cooldown: 5,
    stats: { shield: 10 },
    text: ['Gain [shield 10] <Shield>'],
    art: ['#5a5a62', '#1c1c22'],
  },
} satisfies Record<string, ItemDef>
