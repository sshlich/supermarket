// The market: a price index and an unmet-need level per tag, shocked by events, nudged by what the player trades.
// Pure rules, no page (ECONOMY.md section 3 and 5). One hour passes when a customer leaves.

import { TAGS } from './customers.ts'

/** What an event does to some tags: demand and supply multipliers at full strength (`dt`: a tag's own demand, where it differs), how long it lasts (hours), and how many hours until it starts (a rumor, until then). */
export interface Event { name: string; tags: string[]; d: number; s: number; dt?: Record<string, number>; hours: number; wait: number; age: number; real: boolean }
export interface Market { p: Record<string, number>; u: Record<string, number>; events: Event[]; hour: number }

// ponytail: the expected $ of one tag changing hands per day, in phase I. Impact is a fraction of it, so it must grow with the phase (x4 each) when phases exist.
export const FLOW = 25
export const ETA = 0.5

const TEMPLATES: { name: string; tags: string[]; d: number; s: number; dt?: Record<string, number> }[] = [
  { name: 'fever', tags: ['medicine'], d: 2, s: 1 },
  { name: 'convoy', tags: ['*'], d: 1, s: 2.5 },
  { name: 'cold snap', tags: ['fuel', 'food', 'light'], d: 1.7, s: 1, dt: { light: 1.3 } },
  { name: 'blockade', tags: ['*'], d: 1, s: 0.4 },
  { name: 'festival', tags: ['alcohol', 'valuable'], d: 1.8, s: 1 },
  { name: 'raid', tags: ['*'], d: 0.5, s: 1.6 },
]

export const newMarket = (): Market => ({ p: Object.fromEntries(Object.keys(TAGS).map(t => [t, 1])), u: Object.fromEntries(Object.keys(TAGS).map(t => [t, 0])), events: [], hour: 0 })

/** An event's strength now: full for its first third, then fading to nothing. */
const strength = (e: Event) => e.wait > 0 ? 0 : e.age < e.hours / 3 ? 1 : Math.max(0, 1 - (e.age - e.hours / 3) / (e.hours * 2 / 3))
const full = (e: Event, t: string, key: 'd' | 's') => (key === 'd' ? e.dt?.[t] : undefined) ?? e[key]
const mult = (m: Market, t: string, key: 'd' | 's') => m.events.reduce((n, e) => e.tags.includes(t) ? n * (1 + (full(e, t, key) - 1) * strength(e)) : n, 1)
/** Demand and supply multipliers on a tag from live events. */
export const demand = (m: Market, t: string) => mult(m, t, 'd')
export const supply = (m: Market, t: string) => mult(m, t, 's')
/** How likely each tag is to be asked for next: demand, and the need nobody met. */
export const weights = (m: Market): Record<string, number> => Object.fromEntries(Object.keys(TAGS).map(t => [t, demand(m, t) * (1 + m.u[t])]))
/** What a thing with these tags is worth now, as a multiple of its base worth (the mean index of its tags that count). */
export const index = (m: Market, tags: string[]) => { const ts = tags.filter(t => t in TAGS); return ts.length ? ts.reduce((n, t) => n + m.p[t], 0) / ts.length : 1 }
/** Rumors: events announced but not yet started (a quarter of them never happen). */
export const rumors = (m: Market) => m.events.filter(e => e.wait > 0)
export const live = (m: Market) => m.events.filter(e => e.wait <= 0 && strength(e) > 0)

/** The player moved `value` of a tag: selling to a buyer pushes its price down, buying from a seller pushes it up. */
export function impact(m: Market, tag: string, value: number, sold: boolean) {
  if (tag in m.p) m.p[tag] = Math.min(2.5, Math.max(0.5, m.p[tag] + (sold ? -1 : 1) * ETA * value / FLOW))
}
/** A customer left unserved on this tag: need builds. */
export const unmet = (m: Market, tag: string) => { if (tag in m.u) m.u[tag] = Math.min(0.5, m.u[tag] + 0.06) }

/** One hour: prices drift to where demand over supply says (half-life ~2.4 hours), need fades, events age, maybe a new one. */
export function tick(m: Market, rand: () => number, eventsPerDay = 1, perDay = 10) {
  m.hour++
  for (const t of Object.keys(TAGS)) {
    const target = Math.min(2.5, Math.max(0.5, demand(m, t) / supply(m, t) * (1 + m.u[t])))
    m.p[t] = Math.min(2.5, Math.max(0.5, m.p[t] + 0.25 * (target - m.p[t]) + (rand() - 0.5) * 0.06))
    m.u[t] *= 0.9
  }
  for (const e of m.events) e.wait > 0 ? e.wait-- : e.age++
  m.events = m.events.filter(e => e.wait > 0 || e.age < e.hours)
  if (m.events.length < 3 && rand() < eventsPerDay / perDay) {
    const tpl = TEMPLATES[Math.floor(rand() * TEMPLATES.length)]
    const pool = Object.keys(TAGS)
    const tags = tpl.tags[0] === '*' ? [pool[Math.floor(rand() * pool.length)]] : tpl.tags
    const announced = rand() < 0.7
    m.events.push({ ...tpl, tags, hours: 6 + Math.floor(rand() * 5), wait: announced ? 2 + Math.floor(rand() * 3) : 0, age: 0, real: !announced || rand() < 0.75 })
    // a rumor that is not real is dropped when it would have started
  }
  m.events = m.events.filter(e => e.real || e.wait > 0)
}
