// Runs (DESIGN section 11): walking a level site by site, a step at a time; bolts and hazards; the things you meet;
// search and harvest; the way home; and dying out there. Everything learned on the way goes into the Catalog.

import { HAZARDS, RESISTS } from '../data/hazards.ts'
import { LEVELS, type SiteDef } from '../data/levels.ts'
import { LOOT } from '../data/loot.ts'
import { RELIC_ROLLS } from '../data/relics.ts'
import { SP, SPECIES, type Species } from '../data/species.ts'
import { K, become, make, remove, stow } from './containers.ts'
import { belt, driftPerStep, prop } from './items.ts'
import { fact, learn } from './knowledge.ts'
import { pick, rand } from './rng.ts'
import type { Ev } from './sim.ts'
import { HP, type Item, type LevelState, type SiteState, type State } from './state.ts'

/** Section 11's numbers, in one place for tuning. */
export const R = {
  day: 12,           // steps in a day (5)
  scale: 40,         // encounter chance: 1 - exp(-Σw / scale) ...
  cap: 0.85,         // ... capped
  flee: 0.5,         // skittish groups that bolt on sight
  evade: 0.75,       // evade: base, less per point of awareness, more per LIGHT and (against Auditors) SIGNAL
  aware: 0.12,
  light: 0.1,
  signal: 0.1,
  rounds: 3,         // a fight lasts at most this many
  boltBack: 0.5,     // chance a thrown bolt is found again
  fade: 0.5,         // recent noise left after each step
  heal: 5,           // HP back for a night at home
  driftRest: 2,      // Drift eased by a night at home ...
  driftFloor: 20,    // ... never below the worst it has been, less this
  feeding: 0.2,      // chance of seeing something eat, on arriving
  unstable: 3,       // nights between hazard rerolls on Unstable levels
  reroll: 0.35,      // chance each site there gets a hazard
  noise: { move: 1, bolt: 1, fight: 15, kill: 3, fail: 10 },
}

export const siteDef = (level: string, site: string) => LEVELS[level].sites.find(x => x.id === site)!
export const siteAt = (s: State, level: string, site: string) => s.levels[level].sites.find(x => x.id === site)!
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

/** Where a line of the run goes: back to the view, and into the run's own log. */
function say(s: State, text: string, kind: Ev['kind'] = 'run'): Ev[] {
  if (kind === 'run') s.log.push({ day: s.day, kind: 'run', text })
  return [{ night: s.day, kind, text }]
}
const no = (s: State, text: string) => say(s, text, 'refused')

// ---------------------------------------------------------------- the belt and the kit

/** The best weapon on the belt. */
export const weapon = (s: State) => Math.max(0, ...s.C.belt.map(it => K[it.kind].weapon ?? 0))
/** A working tool on the belt (tools work only there, 10.5). */
export const tool = (s: State, kind: string) => s.C.belt.find(it => it.kind === kind && (it.cond ?? 0) > 0)
/** Wear a tool; worn out, it breaks into scrap. */
export function wear(s: State, it: Item, by: number): string {
  it.cond = Math.max(0, (it.cond ?? 100) - by)
  if (it.cond > 0) return ''
  const name = K[it.kind].name
  become(it, 'scrap', 1)
  return ` The ${name} breaks.`
}
/** Put what was found in the pack; what doesn't fit stays on the floor here. */
function bag(s: State, st: SiteState, found: Item[]): string {
  const left: string[] = []
  for (const it of found) {
    const was = it.n
    const n = stow(s, 'pack', it)
    if (n) { st.loot.push({ ...it, n }); left.push(`${n < was ? `${n} ` : ''}${K[it.kind].name}`) }
  }
  return left.length ? ` No room in the pack: ${left.join(', ')} left here.` : ''
}
const describe = (items: Item[]) => items.map(it => `${K[it.kind].relic ? 'something nobody can name' : K[it.kind].name}${it.n > 1 ? ` ×${it.n}` : ''}`).join(', ')

// ---------------------------------------------------------------- where you can go

export interface Exit { key: string; level: string; site: string; cost: number; via?: string; open: boolean; why?: string; home?: boolean }

/** The ways on from here: neighbouring sites (a step each) and connections (their cost). */
export function exits(s: State): Exit[] {
  const r = s.run!
  const here = siteDef(r.level, r.site)
  const out: Exit[] = here.links.map(id => {
    const under = siteDef(r.level, id).requires === 'drained' && s.levels[r.level].flooded
    return { key: `site:${id}`, level: r.level, site: id, cost: 1, open: !under, why: under ? 'under water' : undefined }
  })
  for (const cid of here.to ?? []) {
    const c = s.connections.find(c => c.id === cid)
    if (!c) continue // not built yet
    const other = c.a === r.level ? c.b : c.a
    const flooded = c.requires === 'drained' && [c.a, c.b].some(id => s.levels[id]?.flooded)
    const why = !c.open ? 'closed' : flooded ? 'flooded' : undefined
    if (other === 'seam') out.push({ key: `conn:${cid}`, level: 'seam', site: '', cost: c.cost, via: cid, open: !why, why, home: true })
    else out.push({ key: `conn:${cid}`, level: other, site: LEVELS[other].sites.find(x => x.to?.includes(cid))!.id, cost: c.cost, via: cid, open: !why, why })
  }
  return out
}

/** The shortest way home over what's known: sites walked before, connections seen. */
export function pathHome(s: State): { keys: string[]; cost: number } | null {
  const r = s.run
  if (!r) return null
  const node = (level: string, site: string) => `${level}:${site}`
  const dist = new Map<string, { cost: number; keys: string[] }>([[node(r.level, r.site), { cost: 0, keys: [] }]])
  const queue = [node(r.level, r.site)]
  let best: { keys: string[]; cost: number } | null = null
  while (queue.length) {
    queue.sort((a, b) => dist.get(a)!.cost - dist.get(b)!.cost)
    const at = queue.shift()!
    const [level, site] = at.split(':')
    const d = dist.get(at)!
    if (best && d.cost >= best.cost) break
    const saved = s.run
    s.run = { level, site, noise: 0 }
    const ways = exits(s)
    s.run = saved
    for (const x of ways) {
      if (!x.open) continue
      if (x.home) { if (!best || d.cost + x.cost < best.cost) best = { keys: [...d.keys, x.key], cost: d.cost + x.cost }; continue }
      if (!s.know[`T:${x.site}:seen`]) continue
      const to = node(x.level, x.site)
      if (!dist.has(to) || dist.get(to)!.cost > d.cost + x.cost) { dist.set(to, { cost: d.cost + x.cost, keys: [...d.keys, x.key] }); queue.push(to) }
    }
  }
  return best
}

// ---------------------------------------------------------------- steps

/** Spend steps out there (5): the belt's Signal calls attention, lightness hushes a move, preserving heals, relics cost Drift. */
function steps(s: State, n: number, L: LevelState, move: boolean) {
  const b = belt(s)
  for (let i = 0; i < n; i++) {
    s.step++
    s.run!.noise *= R.fade
    if ((b.SIGNAL ?? 0) > 0) noise(s, L, b.SIGNAL!)
    if ((b.ROT ?? 0) < 0 && s.step % 2 === 0) s.runner.hp = Math.min(HP, s.runner.hp + 1)
    s.runner.drift += driftPerStep(s)
    s.runner.peak = Math.max(s.runner.peak, s.runner.drift)
  }
  if (move && (b.MASS ?? 0) >= 0) noise(s, L, R.noise.move)
}
/** Attention the runner makes on a level; it also lingers as recent noise, which makes evading harder. */
function noise(s: State, L: LevelState, n: number) {
  L.A += n
  if (s.run) s.run.noise += n
}

// ---------------------------------------------------------------- going out, moving, coming home

export function startRun(s: State): Ev[] {
  if (s.run) return no(s, 'Already out.')
  if (s.pick) return no(s, 'Somebody has to take the terminal first.')
  const hatch = s.connections.find(c => c.a === 'seam')!
  if (s.step + hatch.cost > R.day) return no(s, 'Too late in the day to go out.')
  const site = LEVELS[hatch.b].sites.find(x => x.to?.includes(hatch.id))!.id
  for (const it of s.C.belt) {
    const lasts = K[it.kind].dims
    if (!lasts) continue
    it.runs = (it.runs ?? 0) + 1
    if (it.runs >= lasts) it.props = { ...it.props, LIGHT: 0 } // a shell lamp's light dies after so many runs
  }
  s.run = { level: hatch.b, site, noise: 0 }
  steps(s, hatch.cost, s.levels[hatch.b], true)
  return [...say(s, `${s.runner.name} climbs up through the hatch.`), ...arrive(s, hatch.b, site)]
}

export function go(s: State, key: string): Ev[] {
  const r = s.run
  if (!r) return no(s, 'At home.')
  if (r.enc) return no(s, 'Not with that in front of you.')
  const x = exits(s).find(e => e.key === key)
  if (!x) return no(s, 'No way there from here.')
  if (!x.open) return no(s, `That way is ${x.why}.`)
  if (s.step + x.cost > R.day) return no(s, 'Not enough of the day left. Camp here, or go back.')
  const prev = { level: r.level, site: r.site, cost: x.cost }
  steps(s, x.cost, s.levels[x.home ? r.level : x.level], true)
  if (s.runner.drift >= 100) return die(s, 'drift')
  if (x.home) { s.run = undefined; return say(s, 'Down through the hatch. Home.') }
  return arrive(s, x.level, x.site, prev)
}

/** Walk the known way home until something stops you: a thing in the way, a hazard, the end of the day. */
export function returnHome(s: State): Ev[] {
  const out: Ev[] = []
  for (let guard = 0; s.run && guard < 50; guard++) {
    const p = pathHome(s)
    if (!p) return [...out, ...no(s, 'No known way home from here.')]
    const hp = s.runner.hp
    out.push(...go(s, p.keys[0]))
    if (out.some(e => e.kind === 'refused') || s.run?.enc || s.runner.hp < hp) break
  }
  return out
}

/** Arriving somewhere (7.2, 11.4, 11.5): see it, find your bolts, the hazard, something eating, something to meet. */
function arrive(s: State, level: string, site: string, prev?: { level: string; site: string; cost: number }): Ev[] {
  Object.assign(s.run!, { level, site, prev })
  const st = siteAt(s, level, site)
  const out: Ev[] = []
  visit(s, level, site)
  out.push(...say(s, `${siteDef(level, site).name}. ${siteDef(level, site).text}`))
  if (st.bolts) {
    let back = 0
    for (let i = 0; i < st.bolts; i++) if (rand(s) < R.boltBack) back++
    st.bolts = 0
    if (back) out.push(...say(s, `You find ${back} of your bolts.${bag(s, st, [make(s, 'bolt', { n: back })])}`))
  }
  out.push(...hazard(s, level, site))
  if (s.runner.hp <= 0) return [...out, ...die(s, 'hp')]
  out.push(...feeding(s, level))
  out.push(...meet(s, level, site))
  return out
}

/** Visiting (7.2): the site, its ways out and levers, the level's look, and after a few days of it, how stable it is. */
function visit(s: State, level: string, site: string) {
  const d = siteDef(level, site)
  for (const f of ['known', 'class', 'safety', 'heat', 'flooded']) learn(s, `L:${level}:${f}`, 'exact', 'seen')
  for (const f of ['entities', 'film', 'scrap']) learn(s, `L:${level}:${f}`, 'rough', 'seen')
  learn(s, `T:${site}:seen`, 'exact', 'seen')
  for (const id of d.levers ?? []) learn(s, `V:${id}:seen`, 'exact', 'seen')
  for (const cid of d.to ?? []) {
    const c = s.connections.find(c => c.id === cid)
    if (!c) continue
    learn(s, `C:${cid}:known`, 'exact', 'seen')
    const other = c.a === level ? c.b : c.a
    if (other !== 'seam') learn(s, `L:${other}:known`, 'exact', 'seen')
  }
  const days = s.visits[level] ??= []
  if (!days.includes(s.day)) { days.push(s.day); if (days.length > 5) days.shift() }
  if (days.length >= 3) learn(s, `L:${level}:stability`, 'exact', 'seen')
}

// ---------------------------------------------------------------- hazards (11.4, Appendix E)

/** A hazard hits on entering unless it's known and fresh (you step around it), a light shows it in time, or the belt resists it. */
function hazard(s: State, level: string, site: string): Ev[] {
  const st = siteAt(s, level, site)
  const key = `T:${site}:hazard`
  const hz = st.hazard ? HAZARDS[st.hazard] : undefined
  const knew = fact(s, key)?.value === (st.hazard ?? 'none')
  if (!hz) { learn(s, key, 'exact', 'seen'); return [] }
  if (knew) return say(s, `You step around the ${hz.name}.`)
  const b = belt(s)
  if ((b.LIGHT ?? 0) >= 1) { learn(s, key, 'exact', 'belt'); return say(s, `Your light finds the ${hz.name} before your feet do.`) }
  learn(s, key, 'exact', 'hazard')
  if (RESISTS[hz.prop](b) >= hz.level) return say(s, `${hz.name}. What's on your belt takes it for you.`)
  const L = s.levels[level]
  const hurt: string[] = []
  if (hz.hp) { s.runner.hp -= hz.hp; hurt.push(`HP −${hz.hp}`) }
  if (hz.drainCells) {
    let drained = 0
    for (const it of s.C.pack.filter(o => o.kind === 'cell')) for (let i = it.n; i > 0; i--) if (rand(s) < hz.drainCells) { drained++; it.n--; stow(s, 'pack', make(s, 'emptyCell')) }
    s.C.pack = s.C.pack.filter(o => o.n > 0)
    if (drained) hurt.push(`${drained} Cell${drained > 1 ? 's' : ''} drained`)
  }
  if (hz.spoil || hz.fresh) for (const it of s.C.pack) {
    if (it.fresh === undefined || it.rotten) continue
    it.fresh = Math.min(K[it.kind].fresh!, Math.max(0, it.fresh - (hz.spoil ?? 0) + (hz.fresh ?? 0)))
    if (it.fresh === 0) it.rotten = true
  }
  if (hz.spoil) hurt.push('the food in the pack turns')
  if (hz.dropHeaviest && s.C.pack.length) {
    const heavy = [...s.C.pack].sort((a, b) => prop(b, 'MASS') * b.n - prop(a, 'MASS') * a.n || K[b.kind].w * K[b.kind].h - K[a.kind].w * K[a.kind].h)[0]
    remove(s, 'pack', heavy)
    st.loot.push({ ...heavy })
    hurt.push(`the ${K[heavy.kind].name} is torn from the pack`)
  }
  if (hz.attention) { noise(s, L, hz.attention); hurt.push('something far away hums back') }
  if (hz.drift) { s.runner.drift += hz.drift; s.runner.peak = Math.max(s.runner.peak, s.runner.drift); hurt.push(`Drift +${hz.drift}`) }
  return say(s, `${hz.name}! ${hurt.join('; ')}.`)
}

export function throwBolt(s: State, key: string): Ev[] {
  const r = s.run
  if (!r) return no(s, 'At home.')
  const x = exits(s).find(e => e.key === key && !e.home)
  const bolt = s.C.pack.find(it => it.kind === 'bolt') ?? s.C.belt.find(it => it.kind === 'bolt')
  if (!x) return no(s, 'Nowhere to throw it.')
  if (!bolt) return no(s, 'No bolts left.')
  remove(s, s.C.pack.includes(bolt) ? 'pack' : 'belt', bolt, 1)
  const st = siteAt(s, x.level, x.site)
  st.bolts = (st.bolts ?? 0) + 1
  noise(s, s.levels[r.level], R.noise.bolt)
  learn(s, `T:${x.site}:hazard`, 'exact', 'bolt')
  learn(s, 'I:bolt:use', 'exact', 'used')
  const hz = st.hazard ? HAZARDS[st.hazard] : undefined
  return say(s, `A bolt toward the ${siteDef(x.level, x.site).name}: ${hz ? hz.reveal : 'it lands, rolls, and nothing happens.'}`)
}

// ---------------------------------------------------------------- the things you meet (11.5)

/** Who might notice you at a site, and how much: population × detection × what draws them. */
export function weights(s: State, level: string, site: string): [Species, number][] {
  const L = s.levels[level]
  const d = siteDef(level, site)
  const b = belt(s)
  const out: [Species, number][] = []
  for (const sp of SPECIES) {
    const w = sp.id === 'auditor' ? ((L.auditorsUntil ?? 0) >= s.day ? sp.detect : 0) : sp.mass > 0 ? (L.N[sp.id] ?? 0) * sp.detect : 0
    if (w <= 0) continue
    if (sp.habitat === 'flooded' && !(d.wet && L.flooded)) continue
    if (sp.lairOnly && d.lair !== sp.id) continue
    out.push([sp, w * (sp.drawnBy ? 1 + Math.max(0, b[sp.drawnBy] ?? 0) / 2 : 1)])
  }
  return out
}
/** The chance of meeting anything on arrival: 1 - exp(-Σw/40), at most 0.85. */
export const encounterChance = (s: State, level: string, site: string) => Math.min(R.cap, 1 - Math.exp(-weights(s, level, site).reduce((a, [, w]) => a + w, 0) / R.scale))

/** Carrying remains or more than 4 FOOD makes scavengers take an interest. */
const tempting = (s: State) => s.C.pack.some(it => it.kind === 'grubCarcass' || it.rotten) || s.C.pack.reduce((a, it) => a + (it.rotten ? 0 : (K[it.kind].food ?? 0) * it.n), 0) > 4

function meet(s: State, level: string, site: string, night = false): Ev[] {
  const ws = weights(s, level, site)
  const total = ws.reduce((a, [, w]) => a + w, 0)
  if (!total || rand(s) >= encounterChance(s, level, site)) return []
  let x = rand(s) * total
  const sp = ws.find(([, w]) => (x -= w) < 0)?.[0] ?? ws.at(-1)![0]
  const L = s.levels[level]
  const there = sp.mass > 0 ? Math.ceil(L.N[sp.id]) : sp.pack
  const n = Math.max(1, Math.min(there, Math.round(Math.min(there, sp.pack) * (0.5 + rand(s)))))
  const known = !!s.know[`S:${sp.id}:known`]
  if (sp.behaviour === 'skittish' && rand(s) < R.flee) return say(s, known ? `${sp.name}s scatter before you're close.` : 'Something pale scatters before you can see it.')
  for (const f of ['known', 'size', 'behaviour']) learn(s, `S:${sp.id}:${f}`, 'exact', 'seen')
  if (sp.mass > 0) learn(s, `S:${sp.id}:pop:${level}`, 'rough', 'seen')
  const d = siteDef(level, site)
  const hostile = sp.behaviour === 'hunter' || (sp.behaviour === 'territorial' && d.type === 'nest') || (sp.behaviour === 'scavenger' && tempting(s))
  s.run!.enc = { sp: sp.id, n, killed: 0, dmg: 0, round: 0, hostile }
  return say(s, `${night ? 'You wake to ' : ''}${n > 1 ? `${n} ${sp.name}s` : `a ${sp.name}`}${night ? '.' : `${n > 1 ? ' are' : ' is'} here.`}${hostile ? ' They have seen you.' : ''}`)
}

function feeding(s: State, level: string): Ev[] {
  if (rand(s) >= R.feeding) return []
  const L = s.levels[level]
  const eaters = SPECIES.filter(sp => (L.N[sp.id] ?? 0) >= 1 && s.know[`S:${sp.id}:known`] && Object.keys(sp.diet).some(f => !s.know[`S:${sp.id}:diet:${f}`]))
  if (!eaters.length) return []
  const sp = pick(s, eaters)
  const f = Object.keys(sp.diet).find(x => !s.know[`S:${sp.id}:diet:${x}`])!
  learn(s, `S:${sp.id}:diet:${f}`, 'exact', 'seen')
  const what = SP[f] ? `${SP[f].name.toLowerCase()}s` : f === 'film' ? 'the film on the pipes' : f
  return say(s, `You watch ${sp.name.toLowerCase()}s eat ${what}.`)
}

/** Evading: 0.75, less 0.12 a point of their awareness, plus 0.1 a point of LIGHT (and of SIGNAL, against Auditors),
 * less recent noise / 100; between 0.05 and 0.95. */
export function evadeOdds(s: State): number {
  const e = s.run!.enc!
  const sp = SP[e.sp]
  const b = belt(s)
  return clamp(R.evade - R.aware * sp.aware + (b.LIGHT ?? 0) * R.light + (sp.id === 'auditor' ? (b.SIGNAL ?? 0) * R.signal : 0) - s.run!.noise / 100, 0.05, 0.95)
}
/** What a round of theirs does: HP (threat × those alive × 0.5, rounded up), or rust on every metal tool, for moths. */
export const theirHit = (s: State) => { const e = s.run!.enc!; return Math.ceil(SP[e.sp].threat * (e.n - e.killed) * 0.5) }
/** What a round of yours does: 1, plus the best weapon, plus the belt's CHARGE against anything organic. */
export const yourHit = (s: State) => 1 + weapon(s) + (SP[s.run!.enc!.sp].machine ? 0 : Math.max(0, belt(s).CHARGE ?? 0))

function hitBack(s: State): string {
  const e = s.run!.enc!
  const sp = SP[e.sp]
  if (e.n - e.killed <= 0) return ''
  if (sp.id === 'moth') {
    const tools = s.C.belt.filter(it => K[it.kind].metal && it.cond !== undefined)
    return tools.length ? ` The swarm settles on your tools: ${tools.map(t => `${K[t.kind].name} −10${wear(s, t, 10)}`).join(', ')}.` : ' The swarm finds nothing on you worth eating.'
  }
  const dmg = theirHit(s)
  s.runner.hp -= dmg
  return dmg ? ` They hit back: HP −${dmg}.` : ''
}

export type Choice = 'evade' | 'fight' | 'backoff' | 'leave'

export function choose(s: State, c: Choice): Ev[] {
  const r = s.run
  const e = r?.enc
  if (!r || !e) return no(s, 'Nothing to deal with.')
  const sp = SP[e.sp]
  const L = s.levels[r.level]
  const end = (t: string) => { r.enc = undefined; return say(s, t) }
  const after = (out: Ev[]) => s.runner.hp <= 0 ? [...out, ...die(s, 'hp')] : out

  if (c === 'leave') return e.hostile ? no(s, "They won't let you.") : end('You let them be.')
  if (c === 'evade') {
    if (rand(s) < evadeOdds(s)) return end('You slip past.')
    noise(s, L, R.noise.fail)
    return after(say(s, `They catch you.${hitBack(s)}`))
  }
  if (c === 'backoff') {
    if (!r.prev) return no(s, 'Nowhere to back off to.')
    if (s.step + r.prev.cost > R.day) return no(s, 'Not enough of the day left to go back.')
    const hit = e.hostile ? hitBack(s) : ''
    if (s.runner.hp <= 0) return after(say(s, `You turn to go.${hit}`))
    r.enc = undefined
    const back = r.prev
    steps(s, back.cost, s.levels[back.level], true)
    return [...say(s, `You back away.${hit}`), ...arrive(s, back.level, back.site)]
  }
  // A round of fighting (at most three; you may evade between them).
  const first = e.round === 0
  e.dmg += yourHit(s)
  const dead = Math.min(e.n, Math.floor(e.dmg / sp.hp))
  const kills = dead - e.killed
  e.killed = dead
  e.round++
  if (first) noise(s, L, R.noise.fight)
  learn(s, `S:${sp.id}:threat`, 'exact', 'fight')
  const st = siteAt(s, r.level, r.site)
  if (kills > 0) {
    noise(s, L, R.noise.kill * kills)
    learn(s, `S:${sp.id}:hp`, 'exact', 'fight')
    if (sp.mass > 0) {
      L.N[sp.id] = Math.max(0, (L.N[sp.id] ?? 0) - kills)
      L.C += kills * sp.mass
    }
    const rem = st.remains.find(x => x.species === sp.id)
    if (rem) rem.n += kills
    else st.remains.push({ species: sp.id, n: kills })
  }
  const hit = hitBack(s)
  const told = `You strike${kills ? `: ${kills} dead` : ''}.${hit}`
  if (e.killed >= e.n) return after(end(`${told} None are left standing.`))
  if (e.round >= R.rounds) return after(end(`${told} The rest melt away.`))
  return after(say(s, told))
}

// ---------------------------------------------------------------- search, harvest, take

const roll = <T>(s: State, table: [T, number, number?][]) => {
  let x = rand(s) * table.reduce((a, t) => a + t[1], 0)
  return table.find(t => (x -= t[1]) < 0) ?? table.at(-1)!
}
const relicRoll = (s: State) => make(s, roll(s, RELIC_ROLLS)[0])
const found = (s: State, kind: string, n = 1) => kind === 'relic' ? relicRoll(s) : make(s, kind, kind === 'brochure' ? { page: 1 + Math.floor(rand(s) * 4) } : { n })

export function search(s: State): Ev[] {
  const r = s.run
  if (!r) return no(s, 'At home.')
  if (r.enc) return no(s, 'Not with that in front of you.')
  const d: SiteDef = siteDef(r.level, r.site)
  const st = siteAt(s, r.level, r.site)
  if (d.type === 'nest') return no(s, 'Nothing here but the nest. Harvest what you kill.')
  if (st.searched) return no(s, 'Already searched.')
  if (s.step + 1 > R.day) return no(s, 'Not enough of the day left.')
  steps(s, 1, s.levels[r.level], false)
  st.searched = true
  const got = d.loot ? d.loot.map(k => found(s, k)) : Array.from({ length: 2 + Math.floor(rand(s) * 3) }, () => { const [k, , n] = roll(s, LOOT[r.level]); return found(s, k, n) })
  return say(s, `You search the ${d.name}: ${describe(got)}.${bag(s, st, got)}`)
}

export function harvest(s: State): Ev[] {
  const r = s.run
  if (!r) return no(s, 'At home.')
  if (r.enc) return no(s, 'Not with that in front of you.')
  const st = siteAt(s, r.level, r.site)
  const cutter = tool(s, 'cutter')
  if (!st.remains.length) return no(s, 'Nothing here to harvest.')
  if (!cutter) return no(s, 'Harvesting needs the Cutter on the belt.')
  if (s.step + 1 > R.day) return no(s, 'Not enough of the day left.')
  steps(s, 1, s.levels[r.level], false)
  const got: Item[] = []
  for (const rem of st.remains) {
    const sp = SP[rem.species]
    for (const [kind, n] of Object.entries(sp.drops)) {
      const count = sp.id === 'auditor' ? Array.from({ length: rem.n }).filter(() => rand(s) < 0.15).length : n * rem.n
      if (count) got.push(make(s, kind, { n: count }))
    }
    for (const f of ['drops', 'props', 'hp']) learn(s, `S:${sp.id}:${f}`, 'exact', 'harvest')
  }
  st.remains = []
  const broke = wear(s, cutter, 1)
  return say(s, `You harvest what's left: ${got.length ? describe(got) : 'nothing worth carrying'}.${broke}${bag(s, st, got)}`)
}

/** Pick up something lying here. */
export function take(s: State, id: number): Ev[] {
  const r = s.run
  if (!r) return no(s, 'At home.')
  const st = siteAt(s, r.level, r.site)
  const it = st.loot.find(o => o.id === id)
  if (!it) return no(s, 'Not here.')
  const was = it.n
  const left = stow(s, 'pack', { ...it })
  if (left === was) return no(s, 'No room in the pack.')
  if (left) it.n = left
  else st.loot.splice(st.loot.indexOf(it), 1)
  return say(s, `You take the ${K[it.kind].name}${was - left > 1 ? ` ×${was - left}` : ''}.`)
}

// ---------------------------------------------------------------- dying, and who's next (11.7)

export function die(s: State, how: 'hp' | 'drift' | 'swept'): Ev[] {
  const r = s.run!
  const who = s.runner.name
  const st = siteAt(s, r.level, r.site)
  for (const box of ['pack', 'belt'] as const) { st.loot.push(...s.C[box]); s.C[box] = [] }
  st.fell = who
  s.villagers = s.villagers.filter(v => v !== who)
  s.run = undefined
  s.runner.hp = 0
  const pool = [...s.villagers]
  s.pick = []
  while (pool.length && s.pick.length < 3) s.pick.push(pool.splice(Math.floor(rand(s) * pool.length), 1)[0])
  const why = { hp: '', drift: ' The Accretion kept them.', swept: ' The Auditors swept the level in the night.' }[how]
  s.log.push({ day: s.day, kind: 'event', text: `${who} did not come back.${why}` })
  return say(s, `${who} did not come back.${why}`, 'died')
}

export function chooseRunner(s: State, name: string): Ev[] {
  if (!s.pick?.includes(name)) return no(s, 'Not one of them.')
  s.runner = { name, hp: HP, drift: 0, peak: 0 }
  s.pick = undefined
  s.log.push({ day: s.day, kind: 'event', text: `${name} takes the terminal and the key to the hatch.` })
  return say(s, `${name} takes the terminal.`, 'home')
}

// ---------------------------------------------------------------- the night, for runs

/** After the world's night: rest at home, or survive the dark out there; remains go, hazards shift, Scourers tidy. */
export function nightRun(s: State, ev: Ev[]): Ev[] {
  const out: Ev[] = []
  if (!s.run && !s.pick) {
    s.runner.hp = Math.min(HP, s.runner.hp + R.heal)
    s.runner.drift = Math.max(0, s.runner.peak - R.driftFloor, s.runner.drift - R.driftRest)
  } else if (s.run && ev.some(e => e.kind === 'sweep' && e.level === s.run!.level)) out.push(...die(s, 'swept'))
  for (const L of Object.values(s.levels)) {
    const def = LEVELS[L.id]
    for (const st of L.sites) st.remains = []
    // Unstable levels shift their hazards every few nights, among the kinds found there.
    const pool = [...new Set(def.sites.map(x => x.hazard).filter(Boolean))] as string[]
    if (def.survival.stability === 'Unstable' && pool.length && s.day % R.unstable === 0)
      for (const st of L.sites) { st.hazard = rand(s) < R.reroll ? pick(s, pool) : undefined; st.rolled = s.day }
    // Scourers strip one thing a night from whatever lies on an untagged floor, if there are enough of them (11.7).
    if ((L.N.scourer ?? 0) >= 5) {
      const floors = L.sites.filter(st => st.loot.length && !st.tagged)
      if (floors.length) { const st = pick(s, floors); st.loot.splice(Math.floor(rand(s) * st.loot.length), 1) }
    }
  }
  return out
}

/** A camp's night encounter roll, at dawn (5). */
export const wake = (s: State): Ev[] => s.run ? meet(s, s.run.level, s.run.site, true) : []
