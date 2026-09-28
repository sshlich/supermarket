// Appendix E: hazards. One applies on entering a site unless it's known (a bolt, a light, an earlier fall) or the
// belt resists it: the belt's total of the resisting property must reach the hazard's level.

import type { Prop } from '../model/state.ts'

export interface Hazard {
  id: string
  name: string
  prop: Prop
  level: number
  hp?: number
  drainCells?: number     // each charged Cell in the pack empties with this chance
  spoil?: number          // food in the pack loses this many nights
  fresh?: number          // food in the pack gains this many (a small mercy)
  dropHeaviest?: true     // the heaviest thing in the pack stays here
  attention?: number
  drift?: number
  reveal: string          // what a bolt shows
}

export const HAZARDS: Record<string, Hazard> = Object.fromEntries(([
  { id: 'arc', name: 'Arc Field', prop: 'CHARGE', level: 2, hp: 3, drainCells: 0.5, reveal: 'The bolt jumps sideways and sparks before it lands.' },
  { id: 'rotBloom', name: 'Rot Bloom', prop: 'ROT', level: 2, hp: 1, spoil: 2, reveal: 'The bolt lands soft, and comes up furred.' },
  { id: 'frost', name: 'Frost Vent', prop: 'COLD', level: 2, hp: 2, fresh: 1, reveal: "The bolt rings like it's frozen." },
  { id: 'glassRain', name: 'Glass Rain', prop: 'MASS', level: 2, hp: 3, reveal: 'Something above lets go of a shard for every sound you make.' },
  { id: 'gravity', name: 'Gravity Well', prop: 'MASS', level: 3, hp: 4, dropHeaviest: true, reveal: "The bolt falls faster than it should, and doesn't bounce." },
  { id: 'signalHum', name: 'Signal Hum', prop: 'SIGNAL', level: 2, attention: 20, drift: 5, reveal: 'The bolt hums on landing, and something far away hums back.' },
] as Hazard[]).map(h => [h.id, h]))

/** What on the belt resists a hazard of each property (10.5): heat resists cold and cold heat, lightness or weight
 * resists mass, preserving (negative ROT) resists rot; the rest by their own property. */
export const RESISTS: Record<Prop, (belt: Partial<Record<Prop, number>>) => number> = {
  HEAT: b => b.COLD ?? 0,
  COLD: b => b.HEAT ?? 0,
  MASS: b => Math.abs(b.MASS ?? 0),
  ROT: b => Math.max(0, -(b.ROT ?? 0)),
  CHARGE: b => b.CHARGE ?? 0,
  LIGHT: b => b.LIGHT ?? 0,
  SIGNAL: b => b.SIGNAL ?? 0,
  SEAL: b => b.SEAL ?? 0,
}
