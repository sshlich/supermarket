// The furnace: coal in its firebox, a match to it, and it burns in real time while the game is open. Each lump burns away
// in its own time (`burns` on the kind), then the next; when the last is gone the fire goes out. While it burns, two lumps of
// one ore in the crucible heat up together (`smelt` on the kind) and, once both are through, melt into one bar. Each thing in
// the fire carries how far along it is (`heat`, 0 to 1), which the page draws as a gauge on it. Pure rules, no page.

import { contents, find, KINDS, propsOf, remove, spawn, type Item, type State } from './world.ts'

/** Which slot is which (kinds.json): the crucible first, the firebox second. */
export const CRUCIBLE = 0, FIREBOX = 1
/** How many seconds a cold furnace takes to come up to full heat, and a hot one to go cold again (the dial; nothing waits on it). */
const WARM = 6, COOL = 25
/** Through: a little short of 1 still counts (steps of a quarter second do not add up exactly). */
const THROUGH = 1 - 1e-9

export const isFurnace = (it: Item) => !!KINDS[it.kind]?.furnace
export const isLit = (it: Item) => isFurnace(it) && propsOf(it).fire === 'lit'
const setFire = (f: Item, lit: boolean) => { if (lit) f.props = { ...f.props, fire: 'lit' }; else { delete f.props?.fire; if (f.props && !Object.keys(f.props).length) delete f.props } }

/** The fuel in a furnace's firebox, the lump already burning first, then left to right. */
export const fuelIn = (s: State, f: Item) => contents(s, f.id).filter(o => o.in!.slot === FIREBOX && KINDS[o.kind]?.burns)
  .sort((a, b) => (b.heat ?? 0) - (a.heat ?? 0) || a.x - b.x || a.y - b.y)
/** What the crucible will melt: the first `count` lumps of one ore (one kind, one metal), or nothing if there are not enough alike. */
export function charge(s: State, f: Item): Item[] {
  const ores = contents(s, f.id).filter(o => o.in!.slot === CRUCIBLE && KINDS[o.kind]?.smelt)
  const groups = new Map<string, Item[]>()
  for (const o of ores) { const k = o.kind + JSON.stringify(propsOf(o)); groups.set(k, [...groups.get(k) ?? [], o]) }
  for (const g of groups.values()) if (g.length >= KINDS[g[0].kind].smelt!.count) return g.slice(0, KINDS[g[0].kind].smelt!.count)
  return []
}

/** Light a furnace: 'lit', or why not ('no fuel'; already lit). */
export function light(s: State, f: Item): 'lit' | 'no fuel' | 'lit already' {
  if (isLit(f)) return 'lit already'
  if (!fuelIn(s, f).length) return 'no fuel'
  setFire(f, true)
  return 'lit'
}

/** What a stretch of time did: bars made, lumps of fuel burnt away, furnaces gone out, and whether anything new is in the fire (`changed`: the page draws it again). */
export interface Stoked { made: Item[]; burnt: number; out: Item[]; changed: boolean }

/**
 * `dt` seconds pass for every furnace (in steps of a quarter second, so a long gap burns through lumps one after another).
 * Things in `skip` (in hand) are left alone: neither burnt nor melted while they are held.
 */
export function stoke(s: State, dt: number, skip: number[] = []): Stoked {
  const r: Stoked = { made: [], burnt: 0, out: [], changed: false }
  for (let t = dt; t > 1e-9; t -= 0.25) step(s, Math.min(t, 0.25), skip, r)
  cool(s)
  return r
}
function step(s: State, dt: number, skip: number[], r: Stoked) {
  for (const f of s.items.filter(isFurnace)) {
    const lit = isLit(f)
    f.heat = Math.max(0, Math.min(1, (f.heat ?? 0) + (lit ? dt / WARM : -dt / COOL)))
    if (!f.heat) delete f.heat
    if (!lit) continue
    const fuel = fuelIn(s, f).filter(o => !skip.includes(o.id))
    if (!fuel.length) { setFire(f, false); r.out.push(f); r.changed = true; continue }
    const c = fuel[0]
    if (c.heat === undefined) r.changed = true // a new lump catches: it is drawn with its gauge
    c.heat = (c.heat ?? 0) + dt / KINDS[c.kind].burns!
    if (c.heat >= THROUGH) { remove(s, [c.id]); r.burnt++; r.changed = true }
    const ores = charge(s, f).filter(o => !skip.includes(o.id))
    const sm = ores[0] && KINDS[ores[0].kind].smelt!
    if (!sm || ores.length < sm.count) continue
    for (const o of ores) { if (o.heat === undefined) r.changed = true; o.heat = Math.min(1, (o.heat ?? 0) + dt / sm.secs); if (o.heat >= THROUGH) o.heat = 1 }
    if (ores.every(o => o.heat! >= 1)) {
      const props = propsOf(ores[0])
      remove(s, ores.map(o => o.id))
      const bar = spawn(s, sm.into, { host: f.id, slot: CRUCIBLE }, props, true) // (the ore it came from made room for it)
      if (bar) r.made.push(bar)
      r.changed = true
    }
  }
}

/** Ore taken out of the crucible cools: it starts again from cold. (A lump of coal taken out keeps what it has burnt.) */
export function cool(s: State) {
  for (const o of s.items) {
    if (o.heat === undefined || !KINDS[o.kind]?.smelt) continue
    const host = o.in && o.in.slot === CRUCIBLE ? find(s, o.in.host) : undefined
    if (!host || !isFurnace(host)) delete o.heat
  }
}

/** How far the crucible's charge has got (0 to 1), or null if there is nothing alike to melt. */
export function progress(s: State, f: Item): number | null {
  const ores = charge(s, f)
  return ores.length ? Math.min(...ores.map(o => o.heat ?? 0)) : null
}
