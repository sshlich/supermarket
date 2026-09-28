// "What would happen" (DESIGN 11.6): the world run forward a week on a copy built only from what the player knows.
// Rough populations count as the middle of their band, unknown ones not at all; so better knowledge, better forecasts.

import { LEVELS } from '../data/levels.ts'
import { SPECIES } from '../data/species.ts'
import { fact } from './knowledge.ts'
import { EFFECTS, world } from './sim.ts'
import type { Cell, State } from './state.ts'

const MID: Record<string, number> = { none: 0, few: 3, some: 13, many: 50, swarm: 120 }
const FILM: Record<string, number> = { grey: 15, patchy: 50, thick: 85 }
const num = (c: Cell | undefined, bands: Record<string, number>, otherwise: number) => !c ? otherwise : typeof c.value === 'number' ? c.value : bands[c.value as string] ?? otherwise

export interface Projection { species: string; now: number; then: number; rough: boolean }

/** The known species of `level`, a week on, as the player's knowledge sees it; with `lever` pulled first, if its
 * effect is known. Null if the lever's effect isn't. */
export function project(s: State, level: string, lever?: string, nights = 7): Projection[] | null {
  if (lever && !fact(s, `V:${lever}:effect`)) return null
  const c: State = structuredClone(s)
  const rough = new Set<string>()
  for (const L of Object.values(c.levels)) {
    const id = L.id
    const k = (f: string) => fact(s, `L:${id}:${f}`)
    L.F = num(k('film'), FILM, 50) / 100 * LEVELS[id].Fmax
    L.S = num(k('scrap'), MID, 10)
    L.heat = (k('heat')?.value as 0 | 1 | 2) ?? 1
    L.flooded = (k('flooded')?.value as boolean) ?? false
    L.M = num(k('masons'), {}, 0)
    L.mHolds = []
    L.A = num(k('attention'), { calm: 10, noticed: 35, watched: 65, alarmed: 90 }, 0)
    for (const sp of SPECIES) {
      if (!sp.mass || sp.sings) continue
      const p = fact(s, `S:${sp.id}:pop:${id}`)
      if (p?.state === 'rough') rough.add(`${id}:${sp.id}`)
      if (p) L.N[sp.id] = num(p, MID, 0)
      else if (L.N[sp.id] !== undefined) L.N[sp.id] = 0
    }
  }
  if (lever) EFFECTS[lever](c, c.levels[level])
  const now = { ...c.levels[level].N }
  for (let i = 0; i < nights; i++) { world(c, c.blackout); c.day++ }
  return SPECIES.filter(sp => sp.mass && !sp.sings && fact(s, `S:${sp.id}:pop:${level}`)).map(sp => ({
    species: sp.id, now: now[sp.id] ?? 0, then: c.levels[level].N[sp.id] ?? 0, rough: rough.has(`${level}:${sp.id}`),
  }))
}
