const svg = (d: string) => `<svg class="ico" viewBox="0 0 16 16"><path d="${d}"/></svg>`

export type Keyword =
  | 'damage' | 'shield' | 'heal' | 'burn' | 'poison' | 'regen'
  | 'haste' | 'slow' | 'freeze' | 'charge' | 'reload' | 'crit' | 'lifesteal' | 'multicast' | 'ammo'

/** Keywords color their word and value in descriptions; ones with `desc` also get a legend entry. */
export const KEYWORDS: Record<Keyword, { name: string; color: string; icon: string; desc?: string }> = {
  damage: { name: 'Damage', color: '#ff5a44', icon: svg('M8 0l1.8 5 5.2-1.5-4 4.5 4 4.5-5.2-1.5L8 16l-1.8-5L1 12.5l4-4.5-4-4.5L6.2 5z') },
  shield: { name: 'Shield', color: '#f5cc3d', icon: svg('M8 1l6 2v5c0 4-3 6.5-6 7.5C5 14.5 2 12 2 8V3z'), desc: 'Blocks incoming Damage until it breaks. Poison slips past it.' },
  heal: { name: 'Heal', color: '#7edc5a', icon: svg('M6 1h4v5h5v4h-5v5H6v-5H1V6h5z'), desc: 'Restores Health, up to your maximum.' },
  burn: { name: 'Burn', color: '#ff9b3a', icon: svg('M8 0c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3C7 6 6 3 8 0z'), desc: 'Hurts the enemy twice a second, getting weaker with every tick.' },
  poison: { name: 'Poison', color: '#58d69b', icon: svg('M8 0S2.5 7 2.5 10.5a5.5 5.5 0 0 0 11 0C13.5 7 8 0 8 0z'), desc: 'Hurts the enemy every second and ignores Shield.' },
  regen: { name: 'Regen', color: '#c2e25a', icon: svg('M14 1C7 1 3 5 3 10c0 1.5.4 3 1 4l1.2-.8C6.5 9.5 9 7 12 5.5 9.5 7.5 7.8 10 7 13.5 12.5 14 15 8 14 1z'), desc: 'Heals you every second.' },
  haste: { name: 'Haste', color: '#63d2ff', icon: svg('M1 2l6 6-6 6zm7 0l6 6-6 6z'), desc: 'The item charges twice as fast.' },
  slow: { name: 'Slow', color: '#c39bff', icon: svg('M3 1h10v2L9 8l4 5v2H3v-2l4-5-4-5z'), desc: 'The item charges half as fast.' },
  freeze: { name: 'Freeze', color: '#7fdcff', icon: svg('M7 0h2v16H7zM0 7h16v2H0zM2.3 3.7l1.4-1.4 10 10-1.4 1.4zM12.3 2.3l1.4 1.4-10 10-1.4-1.4z'), desc: 'The item stops charging.' },
  charge: { name: 'Charge', color: '#ffe066', icon: svg('M9 0L2 9h5l-1 7 7-9H8z'), desc: 'Instantly fills part of an item\'s cooldown.' },
  reload: { name: 'Reload', color: '#f2d27a', icon: svg('M8 2a6 6 0 1 0 6 6h-2a4 4 0 1 1-4-4v3l4-4-4-4z'), desc: 'Refills an item\'s Ammo.' },
  crit: { name: 'Crit', color: '#ff7ad0', icon: svg('M7 0h2v4H7zM7 12h2v4H7zM0 7h4v2H0zM12 7h4v2h-4zM8 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6z'), desc: 'Chance for a use to have double effect.' },
  lifesteal: { name: 'Lifesteal', color: '#e0507a', icon: svg('M4 1h8l-1 6-3 8-3-8z'), desc: 'Heals you for that share of the Damage this deals.' },
  multicast: { name: 'Multicast', color: '#f3e3c3', icon: svg('M2 3l6-2 6 2v2L8 3 2 5zm0 5l6-2 6 2v2L8 8l-6 2zm0 5l6-2 6 2v2l-6-2-6 2z'), desc: 'Each use triggers the effect this many times.' },
  ammo: { name: 'Ammo', color: '#f2d27a', icon: svg('M6 1h4a2 3 0 0 1 2 3v11H4V4a2 3 0 0 1 2-3z'), desc: 'Uses per fight. When it runs out the item stops firing.' },
}
