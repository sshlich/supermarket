// What the player knows (DESIGN section 7). Every fact the UI can show has a key like "L:galleries:film" or
// "S:grub:pop:ducts"; its cell is unknown (absent), rough (a band) or exact, with the day and the source.
// Omniscient reads the truth instead. The night's voice lives here too: rumours, feeds and MAINT's lines.

import { LEVERS } from '../data/levers.ts'
import { CONNECTIONS, LEVELS } from '../data/levels.ts'
import { SP, SPECIES } from '../data/species.ts'
import { MAINT, RUMOURS } from '../data/text.ts'
import { pick, rand } from './rng.ts'
import { K } from './containers.ts'
import { relicClass } from './items.ts'
import { burialDay } from './sim.ts'
import { masons, type Cell, type LevelState, type State } from './state.ts'

type Value = Cell['value']

// ---------------------------------------------------------------- bands (7.2)

const cut = (n: number, steps: [number, string][]) => steps.findLast(([min]) => n >= min)![1]
/** Population bands: none (0), few (1-5), some (6-20), many (21-80), swarm (81+). */
export const band = (n: number) => cut(Math.round(n), [[0, 'none'], [1, 'few'], [6, 'some'], [21, 'many'], [81, 'swarm']])
/** A level's Entities: the same words for everything that lives there, counted four times as loose. */
export const entities = (L: LevelState) => cut(Math.round(Object.values(L.N).reduce((a, b) => a + b, 0)), [[0, 'none'], [1, 'few'], [21, 'some'], [81, 'many'], [321, 'swarm']])
const filmBand = (pct: number) => cut(pct, [[0, 'grey'], [30, 'patchy'], [70, 'thick']])
const attentionBand = (a: number) => cut(a, [[0, 'calm'], [20, 'noticed'], [50, 'watched'], [80, 'alarmed']])
/** A number that stands for a band, for sparklines of rough sightings. */
const MID: Record<string, number> = { none: 0, few: 3, some: 13, many: 50, swarm: 120 }
export const size = (mass: number) => cut(mass, [[0, 'tiny'], [0.5, 'small'], [1.5, 'medium'], [3, 'large'], [20, 'vast']])

// ---------------------------------------------------------------- facts

/** Which level each site is on (site ids are unique across the Accretion). */
export const SITE_LEVEL: Record<string, string> = Object.fromEntries(Object.values(LEVELS).flatMap(l => l.sites.map(x => [x.id, l.id])))
/** Nights hazard knowledge stays good on an Unstable level (7.3). */
const SHELF = 3

export const WHERE: Record<string, string> = { galleries: 'in the Galleries', ducts: 'in the Ducts', stair: 'on the Stair', hall: 'in the Choir Hall', u0041: 'up past the Stair' }

/** The world's answer to a fact, or undefined if it doesn't exist (yet). */
export function truth(s: State, key: string): Value | undefined {
  const [t, id, field, sub] = key.split(':')
  if (t === 'L') {
    const L = s.levels[id]
    const def = LEVELS[id]
    if (!L) return undefined
    switch (field) {
      case 'known': return true
      case 'class': return def.survival.cls
      case 'safety': return def.survival.safety
      case 'stability': return def.survival.stability
      case 'entities': return entities(L)
      case 'film': return Math.round(100 * L.F / def.Fmax)
      case 'scrap': return Math.round(L.S)
      case 'heat': return L.heat
      case 'flooded': return L.flooded
      case 'masons': return masons(s, L)
      case 'attention': return Math.round(L.A)
    }
  }
  if (t === 'S') {
    const sp = SP[id]
    switch (field) {
      case 'known': return true
      case 'size': return size(sp.mass)
      case 'behaviour': return sp.behaviour
      case 'diet': return sp.diet[sub] !== undefined ? 'eats' : 'no'
      case 'threat': return sp.threat
      case 'hp': return sp.hp
      case 'drops': return Object.keys(sp.drops).map(k => K[k]?.name ?? k).join(', ') || 'nothing'
      case 'props': return Object.entries(sp.props).map(([p, v]) => `${p} ${v}`).join(', ')
      case 'pop': return s.levels[sub] ? Math.round(s.levels[sub].N[id] ?? 0) : undefined
    }
  }
  if (t === 'C') return s.connections.some(c => c.id === id) || undefined
  if (t === 'T') {
    const L = s.levels[SITE_LEVEL[id]]
    const st = L?.sites.find(x => x.id === id)
    if (!st) return undefined
    if (field === 'seen') return true
    if (field === 'hazard') return st.hazard ?? 'none'
  }
  if (t === 'R') return field === 'class' ? relicClass(id) : field === 'finder' ? undefined : K[id]?.props[field as keyof (typeof K)[string]['props']] ?? 0
  if (t === 'V') return field === 'seen' ? true : field === 'effect' ? LEVERS[id]?.effect : undefined
  if (t === 'I') {
    const k = K[id]
    switch (field) {
      case 'known': return true
      case 'use': return k.uses
      case 'spoil': return k.fresh ?? 'keeps'
      case 'bait': return k.bait?.map(sp => SP[sp].name).join(', ') ?? 'nothing'
    }
  }
  if (key === 'seam:burialDay') return burialDay(s)
  return undefined
}

/** What a rough sighting of a fact shows: its band. Facts without bands are always exact. */
function roughen(key: string, v: Value): Value {
  const [t, , field] = key.split(':')
  if (typeof v !== 'number') return v
  if (t === 'S' && field === 'pop') return band(v)
  if (t === 'L' && field === 'film') return filmBand(v)
  if (t === 'L' && field === 'scrap') return band(v)
  if (t === 'L' && field === 'attention') return attentionBand(v)
  if (t === 'R') return v > 0 ? '≥ 1' : v < 0 ? 'below 0' : '0'
  return v
}

/** Learn a fact as it stands now. A rough sighting never overwrites an exact one from the same day. */
export function learn(s: State, key: string, state: Cell['state'], src: string) {
  const v = truth(s, key)
  if (v === undefined) return
  const old = s.know[key]
  if (old && old.state === 'exact' && state === 'rough' && old.day === s.day) return
  const value = state === 'rough' ? roughen(key, v) : v
  const cell: Cell = { state, value, day: s.day, src }
  if (key.includes(':pop:')) cell.trail = [...old?.trail ?? [], [s.day, typeof value === 'number' ? value : MID[value as string]] as [number, number]].slice(-20)
  s.know[key] = cell
}

/** A fact as the player sees it: a cell, or undefined for ???. Omniscient sees the truth. */
export function fact(s: State, key: string, omni = false): Cell | undefined {
  if (omni) {
    const v = truth(s, key)
    if (v === undefined) return undefined
    const [t, id, field, sub] = key.split(':')
    const trail = t === 'S' && field === 'pop' ? (s.hist[sub]?.[id] ?? []).map((n, i, a) => [s.day - a.length + i, n] as [number, number]) : undefined
    return { state: 'exact', value: v, day: s.day, src: 'omniscient', trail }
  }
  const c = s.know[key]
  // 7.3: on Unstable levels, what you knew about a site's hazard goes stale after a few nights.
  if (c && key.startsWith('T:') && key.endsWith(':hazard') && LEVELS[SITE_LEVEL[key.split(':')[1]]].survival.stability === 'Unstable' && s.day - c.day > SHELF) return undefined
  return c
}

/** Levels the player knows of: home, and any they've learned about. */
export const knownLevel = (s: State, id: string, omni = false) => !!s.levels[id] && (omni || !!LEVELS[id].home || !!s.know[`L:${id}:known`])
/** Home knows its own ways out: the hatch and the stairs between the home levels. */
export const knownConnection = (s: State, id: string, omni = false) => {
  const c = CONNECTIONS.find(c => c.id === id)!
  const home = (x: string) => x === 'seam' || !!LEVELS[x]?.home
  return truth(s, `C:${id}`) !== undefined && (omni || (home(c.a) && home(c.b)) || !!s.know[`C:${id}:known`])
}

// ---------------------------------------------------------------- the night's voice (6.7 steps 7-8)

export interface Heard { kind: string; level?: string; n?: number; species?: string }
const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''))

/** Rumours, feeds and MAINT's lines from tonight's world. Also keeps the population history. */
export function talk(s: State, heard: Heard[]) {
  const line = (kind: 'maint' | 'rumour' | 'event', text: string) => s.log.push({ day: s.day, kind, text })
  const maint = (text: string) => line('maint', text)
  const floor = (id: string) => LEVELS[id].floor
  /** A named villager if they're still alive, else whoever's around. */
  const who = (name?: string) => name && s.villagers.includes(name) ? name : pick(s, s.villagers)
  const rumour = (r: { who?: string; text: string }, v: Record<string, string> = {}) => s.villagers.length && line('rumour', fill(r.text, { who: who(r.who), ...v }))
  /** True the first night a condition holds, so a line isn't repeated every night it stays true. */
  const edge = (flag: string, now: boolean) => { const was = !!s.flags[flag]; if (now) s.flags[flag] = true; else delete s.flags[flag]; return now && !was }

  for (const h of heard) {
    if (h.kind === 'sweep') maint(fill(MAINT.sweep, { n: h.n ?? 0 }))
    if (h.kind === 'masons') {
      maint(fill(MAINT.schedule, { floor: floor(h.level!) }))
      if (LEVELS[h.level!].home) rumour(RUMOURS.warm)
    }
    if (h.kind === 'level') maint(fill(MAINT.stratum, { name: LEVELS[h.level!].name }))
    if (h.kind === 'choir') maint(fill(MAINT.choirDead, { floor: floor(h.level!) }))
    if (h.kind === 'buried') maint(MAINT.buried)
    if (h.kind === 'migrate' && SP[h.species!].mass >= 4) rumour(RUMOURS.moved, { where: WHERE[h.level!] })
  }

  if (s.day === 1) maint(fill(MAINT.biomass, { n: s.villagers.length }))
  for (const L of Object.values(s.levels)) {
    const def = LEVELS[L.id]
    if (L.choirSilenced === s.day) { maint(fill(MAINT.silenced, { floor: def.floor })); rumour(RUMOURS.silent) }
    if (def.sites.some(x => x.type === 'tower') && edge(`tower:${L.id}`, L.A >= 60)) maint(MAINT.tower)
    if (edge(`cold:${L.id}`, L.heat === 0 && def.heat > 0)) maint(fill(MAINT.cold, { floor: def.floor, film: truth(s, `L:${L.id}:film`)! as number }))
    if (def.flooded && !L.flooded !== !!s.flags[`drained:${L.id}`]) {
      edge(`drained:${L.id}`, !L.flooded)
      maint(fill(L.flooded ? MAINT.flooded : MAINT.drained, { floor: def.floor }))
      if (def.home) { rumour(L.flooded ? RUMOURS.flooded : RUMOURS.drained); learn(s, `L:${L.id}:flooded`, 'exact', 'rumour') }
    }
  }
  if (edge('residence', s.seamA >= 50)) maint(MAINT.residence)
  const g = s.levels.galleries
  if (edge('hounds', (g.N.hound ?? 0) >= 6)) maint(fill(MAINT.hounds, { floor: LEVELS.galleries.floor, n: Math.round(g.N.hound) }))
  if (edge('claws', (g.N.hound ?? 0) >= 3)) rumour(RUMOURS.claws)
  if (edge('grey', (truth(s, 'L:galleries:film') as number) < 30)) { rumour(RUMOURS.cold); learn(s, 'L:galleries:film', 'rough', 'rumour') }

  // Every night someone listens at the walls: the home levels' Entities, one a night, in turn.
  const home = Object.values(LEVELS).filter(l => l.home).map(l => l.id)
  const ear = home[s.day % home.length]
  learn(s, `L:${ear}:entities`, 'rough', 'rumour')
  rumour(RUMOURS[ear as 'galleries' | 'ducts'], { band: RUMOURS.bands[entities(s.levels[ear])] })
  if (rand(s) < 0.04) maint(MAINT.hello)

  for (const L of Object.values(s.levels)) for (const sp of SPECIES) {
    if (L.N[sp.id] === undefined) continue
    const h = (s.hist[L.id] ??= {})[sp.id] ??= []
    h.push(Math.round(L.N[sp.id] * 10) / 10)
    if (h.length > 30) h.shift()
  }
  if (s.log.length > 400) s.log.splice(0, s.log.length - 400)
}
