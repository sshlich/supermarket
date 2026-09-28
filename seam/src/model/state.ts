// The whole game as plain, JSON-safe data (DESIGN 14.2), and a fresh one.
// Milestones add what they need: containers and the village (M3), runs (M4), access (M5-M6).

import { CONNECTIONS, LEVELS, type ConnectionDef, type LevelDef } from '../data/levels.ts'
import { VILLAGERS } from '../data/villagers.ts'

export type Prop = 'HEAT' | 'COLD' | 'CHARGE' | 'MASS' | 'LIGHT' | 'SIGNAL' | 'ROT' | 'SEAL'
export type Props = Partial<Record<Prop, number>>

export interface Item { id: number; kind: string; x: number; y: number; rot: boolean; n: number }
export interface SiteState { id: string; loot: Item[] }

export interface LevelState {
  id: string
  F: number                                   // film
  S: number                                   // scrap
  C: number                                   // corpses (biomass)
  heat: 0 | 1 | 2
  flooded: boolean
  M: number                                   // Mason activity before holds
  mHolds: { until: number; delta: number }[]  // each counts while day < until
  A: number                                   // attention
  N: Record<string, number>                   // population by species; floats, shown rounded
  sites: SiteState[]
  auditorsUntil?: number                      // last day Auditors walk here after a sweep
  choirSilenced?: number                      // the day its song stopped
}

export interface Connection { id: string; a: string; b: string; cost: number; open: boolean; requires?: 'drained' }

export interface State {
  version: 1
  seed: number
  rng: number
  day: number                                 // night `day` runs at the end of day `day`
  next: number                                // next item id
  villagers: string[]                         // everyone still alive at the Seam
  blackout: boolean
  burial: number                              // 0-100; at 100 the Seam is sealed
  levels: Record<string, LevelState>
  connections: Connection[]
  flags: Record<string, boolean>              // scripted beats
}

export const level = (def: LevelDef): LevelState => ({
  id: def.id, F: def.F, S: def.S, C: 0, heat: def.heat, flooded: def.flooded, M: def.M, mHolds: [], A: 0,
  N: { ...def.N }, sites: def.sites.map(x => ({ id: x.id, loot: [] })),
})

export const connection = ({ id, a, b, cost, open, requires }: ConnectionDef): Connection => ({ id, a, b, cost, open, requires })

export function newGame(seed: number): State {
  return {
    version: 1, seed, rng: seed, day: 1, next: 1,
    villagers: [...VILLAGERS], blackout: false, burial: 0,
    levels: Object.fromEntries(Object.values(LEVELS).filter(l => !l.appears).map(l => [l.id, level(l)])),
    connections: CONNECTIONS.filter(c => !c.appears).map(connection),
    flags: {},
  }
}
