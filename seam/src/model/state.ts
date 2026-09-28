// The whole game as plain, JSON-safe data (DESIGN 14.2), and a fresh one.

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

/** A known fact: rough (a band) or exact, when it was learned and how (7.1). Absent means ???. */
export interface Cell { state: 'rough' | 'exact'; value: string | number | boolean; day: number; src: string; trail?: [number, number][] }

export interface LogLine { day: number; kind: 'maint' | 'rumour' | 'event'; text: string }

export interface State {
  version: 1
  seed: number
  rng: number
  day: number                                 // night `day` runs at the end of day `day`
  step: number                                // 0-11 on a run; a day has 12
  next: number                                // next item id
  villagers: string[]                         // everyone still alive at the Seam
  blackout: boolean
  burial: number                              // 0-100; at 100 the Seam is sealed
  levels: Record<string, LevelState>
  connections: Connection[]
  know: Record<string, Cell>                  // the Catalog: saved apart from the game, kept when it ends
  log: LogLine[]
  hist: Record<string, Record<string, number[]>> // the last nights' populations, per level and species
  flags: Record<string, boolean>              // scripted beats
}

export const level = (def: LevelDef): LevelState => ({
  id: def.id, F: def.F, S: def.S, C: 0, heat: def.heat, flooded: def.flooded, M: def.M, mHolds: [], A: 0,
  N: { ...def.N }, sites: def.sites.map(x => ({ id: x.id, loot: [] })),
})

export const connection = ({ id, a, b, cost, open, requires }: ConnectionDef): Connection => ({ id, a, b, cost, open, requires })

/** Mason activity after holds. */
export const masons = (s: State, L: LevelState) => Math.max(0, L.M + L.mHolds.reduce((a, h) => a + (s.day < h.until ? h.delta : 0), 0))

export function newGame(seed: number, know: State['know'] = {}): State {
  return {
    version: 1, seed, rng: seed, day: 1, step: 0, next: 1,
    villagers: [...VILLAGERS], blackout: false, burial: 0,
    levels: Object.fromEntries(Object.values(LEVELS).filter(l => !l.appears).map(l => [l.id, level(l)])),
    connections: CONNECTIONS.filter(c => !c.appears).map(connection),
    know, log: [], hist: {}, flags: {},
  }
}
