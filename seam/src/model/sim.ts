// The world underneath (DESIGN section 6). Each night every level's film grows and its species eat, breed, starve
// and migrate; attention fades or brings a sweep; the Masons build toward the Seam; hounds may find the hatch.
// Pure and deterministic: no DOM, and all luck comes from the state's rng.

import { LEVELS, CONNECTIONS, SCHEDULE } from '../data/levels.ts'
import { SP, SPECIES, type Species } from '../data/species.ts'
import { pick, rand } from './rng.ts'
import { connection, level, type Connection, type LevelState, type State } from './state.ts'

/** The design's numbers, in one place for tuning. Where a tuned value differs, the doc's is noted and sim.test.ts says why. */
export const T = {
  filmRate: 0.25,  // logistic film growth per point of heat
  filmSeed: 2,     // film that settles each night on a warm level
  filmCold: 0.75,  // share of film left each night on a cold level
  scrapPerM: 2,
  appetite: 0.15,  // biomass wanted per unit of body mass, per night
  bite: 0.5,       // most of any one food a species can eat in a night
  // How much of a resource consumers can reach, like a species' vuln (the doc has none: 1).
  reach: { film: 0.04, scrap: 0.5, corpses: 1 } as Record<string, number>,
  fed: 0.6,        // satiation where births start and starvation stops
  mortality: 0.004, // natural deaths per night (doc 0.01)
  gone: 0.5,       // below this a population is locally extinct
  dry: 0.5,        // share of a flooded-habitat species lost each night out of water (doc 0.4)
  rot: 0.9,        // share of corpses left each night
  migrants: 0.25,  // share that leaves when hungry or crowded
  hungry: 0.4,
  crowded: 1.3,
  swept: 0.4,      // share of each unsigned population left after a sweep
  sweepAt: 100,
  afterSweep: 30,
  fade: 0.8,       // attention left each night without a sweep
  auditorDays: 2,
  huskChance: 0.15,
  burialPerM: 1.5,
  raidAt: 6,       // hounds on the hatch level
  raidMax: 3,      // people lost in one raid
  choirDies: 10,   // nights from silence to death
  holdNights: 10,  // a WRITE maintenance hold (M = 0)
  lureNights: 10,  // a moth lure (M −1)
  lureScrap: 40,   // plating the lured moths strip off the Masons, and boom on
}

export interface Ev { night: number; kind: 'migrate' | 'extinct' | 'sweep' | 'raid' | 'buried' | 'masons' | 'level' | 'choir' | 'script'; text: string }

const RES = { film: 'F', scrap: 'S', corpses: 'C' } as const
const res = (f: string) => RES[f as keyof typeof RES] as 'F' | 'S' | 'C' | undefined
/** How much of food `f` there is to eat: a resource, or the reachable biomass of a prey species. */
const avail = (L: LevelState, f: string) => { const r = res(f); return r ? L[r] * T.reach[f] : (L.N[f] ?? 0) * SP[f].mass * SP[f].vuln }
function eat(L: LevelState, f: string, amount: number) {
  const r = res(f)
  if (r) L[r] -= amount
  else L.N[f] -= amount / SP[f].mass
}
/** Food on a level for a species, each food weighted by its share of the diet. */
function food(L: LevelState, sp: Species) {
  const w = Object.values(sp.diet).reduce((a, b) => a + b, 0)
  return Object.entries(sp.diet).reduce((a, [f, x]) => a + avail(L, f) * x / w, 0)
}

// Consumers eat largest first. The Choir feeds by song instead.
const EATERS = SPECIES.filter(sp => Object.keys(sp.diet).length && !sp.sings).sort((a, b) => b.mass - a.mass)

const name = (id: string) => LEVELS[id].name
const passable = (s: State, c: Connection) => c.open && (c.requires !== 'drained' || ![c.a, c.b].some(id => s.levels[id]?.flooded))
export const neighbours = (s: State, id: string) =>
  s.connections.filter(c => passable(s, c) && (c.a === id || c.b === id)).map(c => c.a === id ? c.b : c.a).filter(o => s.levels[o])
/** Mason activity after holds. */
export const masons = (s: State, L: LevelState) => Math.max(0, L.M + L.mHolds.reduce((a, h) => a + (s.day < h.until ? h.delta : 0), 0))
const hatchLevel = (s: State) => s.connections.find(c => c.a === 'seam')!.b

/** Run one night. Mutates `s`; returns what happened, for the log and the CLI. */
export function night(s: State): Ev[] {
  const ev: Ev[] = []
  const say = (kind: Ev['kind'], text: string) => ev.push({ night: s.day, kind, text })
  // TODO(M3): the Seam eats, drinks and burns cells, then its containers act (6.7 steps 1-2).

  // Hounds at the hatch at nightfall come through unless the Seam is dark; they eat there, not on the level.
  // (6.6 over 6.7's order: counted at nightfall, so the raiders can count as fed that night.)
  const hatch = s.levels[hatchLevel(s)]
  const raiders = SPECIES.filter(sp => sp.raids).reduce((a, sp) => a + (hatch.N[sp.id] ?? 0), 0)
  const raid = raiders >= T.raidAt && !s.blackout && !s.flags.buried && s.villagers.length > 0
  const was = Object.fromEntries(Object.values(s.levels).map(L => [L.id, { ...L.N }]))

  const sat: Record<string, Record<string, number>> = {}
  for (const L of Object.values(s.levels)) sat[L.id] = live(s, L, raid && L === hatch)
  sing(s, say)
  migrate(s, sat, say)
  for (const L of Object.values(s.levels)) attend(s, L, say)
  if (raid) { // they came at nightfall, before tonight's building could close the gap
    const lost: string[] = []
    for (let i = Math.min(T.raidMax, Math.ceil(raiders / T.raidAt)); i > 0 && s.villagers.length; i--)
      lost.push(...s.villagers.splice(Math.floor(rand(s) * s.villagers.length), 1))
    say('raid', `${Math.round(raiders)} glasshounds through the hatch: ${lost.join(', ')} lost`)
  }
  build(s, say)
  for (const L of Object.values(s.levels))
    for (const [id, n] of Object.entries(L.N))
      if (n > 0 && n < T.gone) {
        L.N[id] = 0
        if ((was[L.id]?.[id] ?? 0) >= T.gone) say('extinct', `${SP[id].name} gone from ${name(L.id)}`)
      }
  // TODO(M2): rumours, feeds and MAINT lines from tonight's events (6.7 steps 7-8); autosave.
  s.day++
  return ev
}

/** One level's film, scrap and species (6.3 steps 1-6). Returns how well each species ate. */
function live(s: State, L: LevelState, raided: boolean): Record<string, number> {
  const { Fmax } = LEVELS[L.id]
  L.F = L.heat ? L.F + T.filmRate * L.heat * L.F * (1 - L.F / Fmax) + T.filmSeed : L.F * T.filmCold
  L.S += T.scrapPerM * masons(s, L)

  const sat: Record<string, number> = {}
  for (const sp of EATERS) {
    const n = L.N[sp.id]
    if (!n) continue
    if (raided && sp.raids) { sat[sp.id] = 1; continue }
    // Demand splits by preference over the foods there are; a short food isn't made up from the others.
    const want = n * sp.mass * T.appetite
    const foods = Object.keys(sp.diet).filter(f => avail(L, f) > 0)
    const w = foods.reduce((a, f) => a + sp.diet[f], 0)
    let ate = 0
    for (const f of foods) {
      const bite = Math.min(want * sp.diet[f] / w, T.bite * avail(L, f))
      eat(L, f, bite)
      ate += bite
    }
    sat[sp.id] = ate / want
  }

  for (const sp of SPECIES) {
    const n = L.N[sp.id]
    if (!n || sp.sings) continue
    const fed = sat[sp.id] ?? 0
    const births = fed >= T.fed ? n * sp.r * (fed - T.fed) / (1 - T.fed) : 0
    const dead = (fed < T.fed ? n * sp.d * (T.fed - fed) / T.fed : 0) + n * T.mortality
    L.N[sp.id] = n + births - dead
    L.C += dead * sp.mass
    if (sp.habitat === 'flooded' && !L.flooded) {
      const lost = L.N[sp.id] * T.dry
      L.N[sp.id] -= lost
      L.C += lost * sp.mass
    }
  }
  for (const sp of SPECIES) if (sp.printed) L.N[sp.id] = (L.N[sp.id] ?? 0) + sp.printed * L.C / sp.mass
  L.C *= T.rot
  return sat
}

/** The Choir's song draws hounds in from its level and one open connection away (6.3.7). Silenced, it dies. */
function sing(s: State, say: (k: Ev['kind'], t: string) => void) {
  for (const L of Object.values(s.levels)) for (const sp of SPECIES) {
    if (!sp.sings || !L.N[sp.id]) continue
    if (L.choirSilenced === undefined) {
      for (const id of [L.id, ...neighbours(s, L.id)])
        for (const prey of Object.keys(sp.diet)) if (s.levels[id].N[prey]) s.levels[id].N[prey] *= 1 - sp.sings
    } else if (s.day >= L.choirSilenced + T.choirDies) {
      L.N[sp.id] = 0
      L.C += sp.mass
      const lair = LEVELS[L.id].sites.find(x => x.lair === sp.id) ?? LEVELS[L.id].sites[0]
      for (const [kind, n] of Object.entries(sp.drops)) L.sites.find(x => x.id === lair.id)!.loot.push({ id: s.next++, kind, x: 0, y: 0, rot: false, n })
      say('choir', `${sp.name} dies; something is left at the ${lair.name}`)
    }
  }
}

/** Hungry or crowded migrants move a quarter of their number to the open neighbour with the most food per head (6.3.8). */
function migrate(s: State, sat: Record<string, Record<string, number>>, say: (k: Ev['kind'], t: string) => void) {
  const moves: { sp: Species; from: LevelState; to: LevelState; n: number }[] = []
  for (const L of Object.values(s.levels)) for (const sp of SPECIES) {
    const n = L.N[sp.id]
    if (!n || !sp.migrates) continue
    const here = food(L, sp)
    if (!((sat[L.id][sp.id] ?? 1) < T.hungry || n > T.crowded * here / (sp.mass * T.appetite))) continue
    // They go only where they'd eat better than here, counting themselves in once they arrive.
    const leaving = n * T.migrants
    let to: LevelState | undefined
    let best = here / n
    for (const id of neighbours(s, L.id)) {
      const O = s.levels[id]
      const perHead = food(O, sp) / ((O.N[sp.id] ?? 0) + leaving)
      if (perHead > best) { to = O; best = perHead }
    }
    if (to) moves.push({ sp, from: L, to, n: leaving })
  }
  for (const { sp, from, to, n } of moves) {
    from.N[sp.id] -= n
    to.N[sp.id] = (to.N[sp.id] ?? 0) + n
    if (n >= 1) say('migrate', `${sp.name} ×${Math.round(n)} ${name(from.id)} → ${name(to.id)}`)
  }
}

/** Attention fades, or the Auditors sweep: everything without a Signature becomes debris (6.4). */
function attend(s: State, L: LevelState, say: (k: Ev['kind'], t: string) => void) {
  if (L.A < T.sweepAt) { L.A *= T.fade; return }
  let killed = 0
  for (const [id, n] of Object.entries(L.N)) {
    if (!n || SP[id].signed) continue
    const k = n * (1 - T.swept)
    L.N[id] -= k
    L.C += k * SP[id].mass
    killed += k
  }
  L.A = T.afterSweep
  L.auditorsUntil = s.day + T.auditorDays
  // The husk isn't an item (nothing exists only to be tracked); its Fragment lies at a random site of the level.
  const husk = !s.flags.swept || rand(s) < T.huskChance
  s.flags.swept = true
  let where = ''
  if (husk) {
    const site = pick(s, L.sites)
    site.loot.push({ id: s.next++, kind: 'fragment', x: 0, y: 0, rot: false, n: 1 })
    where = `; an Auditor Husk at the ${LEVELS[L.id].sites.find(x => x.id === site.id)!.name}`
  }
  say('sweep', `${name(L.id)} swept: ${Math.round(killed)} reclassified as debris${where}`)
}

/** The Masons: Burial rises with the activity next to the Seam, the schedule advances, new strata appear (6.5). */
function build(s: State, say: (k: Ev['kind'], t: string) => void) {
  if (!s.flags.buried) {
    s.burial = Math.min(100, s.burial + T.burialPerM * Object.values(s.levels).reduce((a, L) => a + (LEVELS[L.id].buries ? masons(s, L) : 0), 0))
    if (s.burial >= 100) { s.flags.buried = true; say('buried', 'the Masons close the gap: the Seam is sealed') }
  }
  for (const e of SCHEDULE) if (e.day === s.day && s.levels[e.level]) {
    s.levels[e.level].M++
    say('masons', `schedule: ${name(e.level)} Masons ${s.levels[e.level].M - 1} → ${s.levels[e.level].M}`)
  }
  for (const def of Object.values(LEVELS)) if (def.appears === s.day) {
    s.levels[def.id] = level(def)
    s.connections.push(...CONNECTIONS.filter(c => c.appears === s.day).map(connection))
    say('level', `new stratum registered: ${def.name}`)
  }
  for (const L of Object.values(s.levels)) L.mHolds = L.mHolds.filter(h => s.day + 1 < h.until)
}

// ---------------------------------------------------------------- effects and scripts

/** What a lever or a terminal write does to the world. Runs and terminals (M4-M6) add their costs and checks. */
export const EFFECTS: Record<string, (s: State, L: LevelState, value?: number) => void> = {
  heatValve: (s, L) => { L.heat = L.heat ? 0 : LEVELS[L.id].heat },
  sluice: (s, L) => { L.flooded = !L.flooded },
  bulkhead: s => { const c = s.connections.find(c => c.id === 'bulkhead')!; c.open = !c.open },
  resonancePipe: (s, L) => { L.choirSilenced ??= s.day },
  // The lured moths corrode the Masons and boom on the plating they strip. No moths here, nothing to corrode.
  mothLure: (s, L) => {
    if (!L.N.moth) return
    L.mHolds.push({ until: s.day + T.lureNights, delta: -1 })
    L.S += T.lureScrap
  },
  hold: (s, L) => { L.mHolds.push({ until: s.day + T.holdNights, delta: -99 }) }, // WRITE maintenance hold: M = 0
  attention: (s, L, value = 0) => { L.A = value },                       // scenarios only
}

/** A scripted effect for headless runs (Appendix J): it lands the morning after night `night`. */
export interface Scripted { night: number; do: string; level: string; value?: number }

export function play(s: State, script: Scripted[], nights: number, each?: (s: State, ev: Ev[]) => void) {
  for (let k = 1; k <= nights; k++) {
    const ev = night(s)
    for (const a of script) if (a.night === k) {
      if (!EFFECTS[a.do] || !s.levels[a.level]) throw new Error(`night ${k}: no effect "${a.do}" at level "${a.level}"`)
      EFFECTS[a.do](s, s.levels[a.level], a.value)
      ev.push({ night: k, kind: 'script', text: `${a.do} at ${name(a.level)}${a.value === undefined ? '' : ` = ${a.value}`}` })
    }
    each?.(s, ev)
  }
}
