// Access (DESIGN section 8): Signature Fragments presented at a terminal raise the tier for the rest of the game.
// GUEST sees MAINT's chatter; READ gets a level's exact tables and a nightly feed; NOTE tags sites and subscribes one
// more level; WRITE edits the world (M6).

import { LEVELS } from '../data/levels.ts'
import { SPECIES } from '../data/species.ts'
import { MAINT } from '../data/text.ts'
import { remove } from './containers.ts'
import { belt } from './items.ts'
import { EFFECTS } from './sim.ts'
import { learn } from './knowledge.ts'
import { siteDef } from './run.ts'
import type { Ev } from './sim.ts'
import { CONNECTIONS } from '../data/levels.ts'
import type { State } from './state.ts'

export type Tier = 'GUEST' | 'READ' | 'NOTE' | 'WRITE' | 'ROOT'
export const TIERS: [number, Tier][] = [[0, 'GUEST'], [1, 'READ'], [2, 'NOTE'], [4, 'WRITE'], [7, 'ROOT']]
export const tier = (s: State): Tier => TIERS.findLast(([n]) => s.access.fragments >= n)![1]
const at = (s: State, t: Tier) => s.access.fragments >= TIERS.find(x => x[1] === t)![0]
/** Terminals read for READ access, or for SIGNAL 2 on the belt even at GUEST (10.5). */
export const reads = (s: State) => at(s, 'READ') || (belt(s).SIGNAL ?? 0) >= 2

const say = (s: State, kind: Ev['kind'], text: string): Ev[] => [{ night: s.day, kind, text }]
const maint = (s: State, text: string) => s.log.push({ day: s.day, kind: 'maint', text })
const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''))

/** Whether the runner stands at a terminal: the Pump Office, the Console, or (at WRITE) the kiosk in UNNAMED-0041. */
export const terminalHere = (s: State) => {
  if (!s.run) return false
  const d = siteDef(s.run.level, s.run.site)
  return d.type === 'terminal' || (!!d.kiosk && at(s, 'WRITE'))
}

export function present(s: State): Ev[] {
  const box = s.C.pack.some(it => it.kind === 'fragment') ? 'pack' : s.C.belt.some(it => it.kind === 'fragment') ? 'belt' : null
  if (!box) return say(s, 'refused', 'No fragment to present.')
  remove(s, box, s.C[box].find(it => it.kind === 'fragment')!, 1)
  const before = tier(s)
  s.access.fragments++
  if (s.access.fragments === 1) maint(s, MAINT.lastLogin)
  maint(s, fill(MAINT.fragment, { n: s.access.fragments, tier: tier(s) }))
  learn(s, 'I:fragment:use', 'exact', 'used')
  return tier(s) !== before ? say(s, 'tier', tier(s)) : say(s, 'home', `Fragment accepted: ${s.access.fragments} of 7.`)
}

/** READ (8): exact tables for the terminal's level, a snapshot, and the projected day the Seam is sealed. */
export function read(s: State): Ev[] {
  if (!s.run) return say(s, 'refused', 'No terminal here.')
  if (!reads(s)) return say(s, 'refused', 'ACCESS: GUEST. Present a Signature to read.')
  const level = s.run.level
  snapshot(s, level, 'READ')
  learn(s, 'seam:burialDay', 'exact', 'READ')
  if (!s.access.subscribed.includes(level)) s.access.subscribed.push(level)
  return say(s, 'home', `Read ${LEVELS[level].name}: subscribed.`)
}

/** Everything a terminal knows about a level, learned exactly. */
export function snapshot(s: State, level: string, src: string) {
  for (const f of ['known', 'class', 'safety', 'stability', 'entities', 'film', 'scrap', 'heat', 'flooded', 'masons', 'attention']) learn(s, `L:${level}:${f}`, 'exact', src)
  for (const sp of SPECIES) if (s.levels[level].N[sp.id] !== undefined) {
    learn(s, `S:${sp.id}:known`, 'exact', src)
    learn(s, `S:${sp.id}:pop:${level}`, 'exact', src)
  }
}

/** NOTE (8): tag a site (Scourers leave what lies there alone), or subscribe to one more level from any terminal. */
export function note(s: State, what: 'tag' | 'subscribe', id: string): Ev[] {
  if (!at(s, 'NOTE')) return say(s, 'refused', 'ACCESS: NOTE required.')
  if (what === 'tag') {
    const L = Object.values(s.levels).find(L => L.sites.some(x => x.id === id))
    if (!L || !s.know[`T:${id}:seen`]) return say(s, 'refused', 'No such site on record.')
    const st = L.sites.find(x => x.id === id)!
    st.tagged = !st.tagged
    return say(s, 'home', `${siteDef(L.id, id).name} ${st.tagged ? 'tagged' : 'untagged'}.`)
  }
  if (!s.levels[id] || !s.know[`L:${id}:known`] && !LEVELS[id].home) return say(s, 'refused', 'No such stratum on record.')
  if (s.access.subscribed.includes(id)) return say(s, 'refused', 'Already subscribed.')
  if (s.access.extra >= 1) return say(s, 'refused', 'One more subscription is all NOTE allows.')
  s.access.extra++
  s.access.subscribed.push(id)
  return say(s, 'home', `Subscribed to ${LEVELS[id].name}.`)
}

export type Write = 'hold' | 'dispose' | 'reroute'
const WRITE_NOISE = 30

/** WRITE (8): one edit per terminal visit, anywhere on record, each +30 attention where it lands. A maintenance hold
 * idles a level's Masons for 10 nights; a disposal request prints 20 Scourers, who clear the corpses and strip what
 * lies on untagged floors; a reroute opens or closes a connection. */
export function write(s: State, what: Write, target: string): Ev[] {
  if (!at(s, 'WRITE')) return say(s, 'refused', 'ACCESS: WRITE required.')
  if ((s.run?.term?.writes ?? 1) >= 1) return say(s, 'refused', 'One write a visit. Walk away and come back.')
  const known = (id: string) => !!s.levels[id] && (!!s.know[`L:${id}:known`] || !!LEVELS[id].home)
  let level = target
  if (what === 'reroute') {
    const c = s.connections.find(c => c.id === target)
    if (!c || !s.know[`C:${target}:known`] && !CONNECTIONS.find(d => d.id === target && [d.a, d.b].every(x => x === 'seam' || LEVELS[x]?.home))) return say(s, 'refused', 'No such connection on record.')
    if (c.a === 'seam') return say(s, 'refused', 'That one is not the city\'s to close.')
    c.open = !c.open
    level = c.a === s.run!.level || c.b === s.run!.level ? s.run!.level : c.a
    maint(s, `connection ${c.id}: ${c.open ? 'open' : 'closed'}. rerouted on request. requester: [NAME NOT FOUND].`)
  } else {
    if (!known(target)) return say(s, 'refused', 'No such stratum on record.')
    const L = s.levels[target]
    if (what === 'hold') {
      EFFECTS.hold(s, L)
      for (const line of MAINT.hold) maint(s, line)
    } else {
      L.N.scourer = (L.N.scourer ?? 0) + 20
      L.C = 0
      for (const st of L.sites) if (!st.tagged) st.loot = []
      maint(s, `disposal request ${LEVELS[target].floor}: 20 units printed. floor will be clean.`)
    }
  }
  s.levels[level].A += WRITE_NOISE
  s.run!.term!.writes++
  return say(s, 'home', `${what === 'hold' ? 'Maintenance hold' : what === 'dispose' ? 'Disposal request' : 'Reroute'} accepted.`)
}

/** Nightly, for each subscribed level: the feed keeps the tables exact, and MAINT reports what changed by more than
 * a quarter over two nights (7.4). */
export function feeds(s: State) {
  for (const id of s.access.subscribed) {
    if (!s.levels[id]) continue
    snapshot(s, id, 'feed')
    // Louder with access (18.5): every third night, a status line for each subscribed stratum.
    if (s.day % 3 === 0) {
      const film = Math.round(100 * s.levels[id].F / LEVELS[id].Fmax)
      maint(s, fill(s.levels[id].heat ? MAINT.thermal : MAINT.cold, { floor: LEVELS[id].floor, film }))
    }
    for (const [sp, h] of Object.entries(s.hist[id] ?? {})) {
      if (h.length < 3) continue
      const [then, now] = [h.at(-3)!, h.at(-1)!]
      if (then < 1 && now < 1) continue
      const d = then ? (now - then) / then : 1
      if (Math.abs(d) > 0.25) maint(s, fill(MAINT.feed, { floor: LEVELS[id].floor, species: SPECIES.find(x => x.id === sp)!.name.toLowerCase(), delta: `${d > 0 ? '+' : '−'}${Math.round(Math.abs(d) * 100)}` }))
    }
  }
}
