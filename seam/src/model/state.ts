// The whole game as plain, JSON-safe data (DESIGN 14.2), and a fresh one.

import { BOXES, START, type Box } from '../data/items.ts'
import { CONNECTIONS, LEVELS, type ConnectionDef, type LevelDef } from '../data/levels.ts'
import { VILLAGERS } from '../data/villagers.ts'
import { make, stow } from './containers.ts'

export type Prop = 'HEAT' | 'COLD' | 'CHARGE' | 'MASS' | 'LIGHT' | 'SIGNAL' | 'ROT' | 'SEAL'
export type Props = Partial<Record<Prop, number>>

export interface Item {
  id: number
  kind: string
  x: number
  y: number
  rot: boolean
  n: number
  fresh?: number     // nights before it rots
  cond?: number      // a tool's wear, 100 to 0
  rotten?: boolean
  props?: Props      // where this one differs from its kind (a cracked shard)
  runs?: number      // runs a shell lamp has been out on
  charges?: number   // shots left in it
}

export interface Runner { name: string; hp: number; drift: number; peak: number }
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
  villagers: string[]                         // everyone still alive, the runner too
  runner: Runner
  run?: { level: string; site: string }       // where the runner is, while out
  C: Record<Box, Item[]>                      // the Seam's containers and the runner's kit
  machines: { cold: boolean; moss: boolean; condenser: boolean }
  blackout: boolean
  conduitTapped: boolean
  seamA: number                               // the Seam's own attention
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

export const HP = 10

export function newGame(seed: number, know: State['know'] = {}): State {
  const s: State = {
    version: 1, seed, rng: seed, day: 1, step: 0, next: 1,
    villagers: [...VILLAGERS], runner: { name: VILLAGERS[0], hp: HP, drift: 0, peak: 0 },
    C: Object.fromEntries(Object.keys(BOXES).map(b => [b, []])) as unknown as State['C'],
    machines: { cold: true, moss: true, condenser: true },
    blackout: false, conduitTapped: false, seamA: 0, burial: 0,
    levels: Object.fromEntries(Object.values(LEVELS).filter(l => !l.appears).map(l => [l.id, level(l)])),
    connections: CONNECTIONS.filter(c => !c.appears).map(connection),
    know, log: [], hist: {}, flags: {},
  }
  for (const { box, kind, n } of START) stow(s, box, make(s, kind, { n }))
  return s
}
