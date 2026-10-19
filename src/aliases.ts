// The game's kinds before it took the station's items (data/station, 2026-10-19), and what each one is now. A kind that was
// one thing with a property (ore of iron or copper, a pill of three sorts) became one station item per value. Used once by
// scripts/station-kinds.ts to carry the old kinds' game fields over, and by `settle` (world.ts) to mend old saves.

export type Alias = string | { prop: string; to: Record<string, string> }

export const ALIASES: Record<string, Alias> = {
  apple: 'it_food_apple', bread: 'it_food_bread', breadslice: 'it_food_bread_slice', sandwich: 'it_food_sandwich',
  cheesewheel: 'it_food_cheese_wheel', cheesewedge: 'it_food_cheese_wedge', cheeseslice: 'it_food_cheese_slice',
  salami: 'it_food_salami', salamislice: 'it_food_salami_slice',
  wine: 'it_lux_wine', candle: 'it_lux_candle', book: 'it_lux_book', locket: 'it_lux_locket',
  matchbox: 'it_lux_matchbox', match: 'it_lux_match', lighter: 'it_lux_lighter', zippo: 'it_lux_zippo', paper: 'it_lux_paper',
  pill: { prop: 'type', to: { painkiller: 'it_med_painkiller', antibiotic: 'it_med_antibiotic', sleeping: 'it_med_sleeping_pill' } },
  blister: { prop: 'type', to: { painkiller: 'it_med_fb_painkiller', antibiotic: 'it_med_fb_antibiotic', sleeping: 'it_med_fb_sleeping_pill' } },
  bandage: 'it_med_bandage', antiseptic: 'it_med_antiseptic',
  bottle: 'it_fab_bottle', knife: 'it_fab_knife', wrench: 'it_fab_wrench',
  ore: { prop: 'metal', to: { iron: 'it_core_ore_iron', copper: 'it_core_ore_copper' } },
  ingot: { prop: 'metal', to: { iron: 'it_fab_bar_iron', copper: 'it_fab_bar_copper' } },
  coal: 'it_tech_cell_s', torch: 'it_tech_torch', slip: 'it_tech_slip',
  cabinet: 'it_fit_cabinet', discrack: 'it_fit_disc_rack', bookshelf: 'it_fit_bookshelf',
  computer: 'mach_terminal', furnace: 'mach_smelter', printer: 'mach_printer_s',
}

/** What an old kind is now, given its properties (the first value of a split property when it has none). */
export function aliasOf(kind: string, props?: Record<string, string>): string | null {
  const a = ALIASES[kind]
  if (!a) return null
  if (typeof a === 'string') return a
  return a.to[props?.[a.prop] ?? ''] ?? Object.values(a.to)[0]
}
