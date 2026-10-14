// The field: a grid of cells with things on it; two counters above it (outside and inside, for trading with customers); and
// containers with grids of their own. Nothing else yet.

import { drop, dropGroup, firstFree, footprintKey, overlaps, turn, type Box } from './grid.ts'
import DATA from './kinds.json' with { type: 'json' }

export const W = 25
export const H = 20

/**
 * The counters, the width of the field and four squares deep. What a customer wants to sell you is unloaded on the outside
 * one; what you want to sell them goes on the inside one, nearer the field.
 */
export type Counter = 'outside' | 'inside'
export const COUNTERS: Record<Counter, { w: number; h: number }> = { outside: { w: W, h: 4 }, inside: { w: W, h: 4 } }
const isCounter = (c: unknown): c is Counter => typeof c === 'string' && c in COUNTERS

/**
 * What a kind of thing is. `w` and `h` are its footprint's bounding box in cells; `cells`, when the footprint is not a plain
 * rectangle, says which squares inside it are taken ('#') and which are free ('.'). The rest is for people: a description
 * (for tooltips), private notes, tags (what customers ask for), a category (`cat`) and a price in coins.
 * `props` are what one thing of the kind can be on top of that: each property has values, the first one the default.
 */
export interface Kind { name: string; icon: string; color: string; w: number; h: number; cells?: string[]; desc?: string; notes?: string; tags?: string[]; slots?: Slot[]; cat?: string; price?: number; props?: Record<string, Record<string, Effect>>; holds?: number; liquid?: string; liquids?: string[]; read?: boolean; sound?: string; computer?: boolean }
/** `holds`: it is a vessel and takes this many units of one liquid; `liquid`: a new one comes full of it; `liquids`: the only liquids it takes (a lighter: fuel); `read`: it opens as a book (see books.ts); `sound`: what it is made of, for how it sounds (see sound.ts); `computer`: its window is a screen (see computer.ts). */
/** What a property's value does to a thing: another name, description or price, more tags, and colours swapped in its sprite (hex to hex; "none" hides whatever had that colour). */
export interface Effect { name?: string; desc?: string; tags?: string[]; price?: number; colors?: Record<string, string> }
/**
 * A container's inside: a small grid with its own rules. Most containers have one slot; some have several, named. `accepts`
 * and `rejects` are tags; nothing else is checked. `out`: things can only be taken out of it (a blister); `fill`: a new one
 * comes full of this kind, which takes on the container's properties (a blister of antibiotics holds antibiotics), `count`
 * of them at most (a cheese wheel is eight wedges, however they would pack).
 */
export interface Slot { name?: string; w: number; h: number; accepts?: string[]; rejects?: string[]; out?: boolean; fill?: string; count?: number }

/** What things are. Sizes are in field cells and every footprint is a plain rectangle; the data lives in kinds.json so the sprite editor can change it. */
export const KINDS: Record<string, Kind> = DATA

/** `rot` is how many quarter turns clockwise it has been turned (0 to 3): 2 is upside down. */
/** `in` says which container's slot it sits in (its x, y are then inside that slot's grid), `at` which counter it is on; neither means on the field. */
/** `props` are its property values where they are not the default (`{ origin: 'synthetic' }`); `fill` is the liquid in a vessel. */
export interface Item { id: number; kind: string; x: number; y: number; rot: number; in?: { host: number; slot: number }; at?: Counter; props?: Record<string, string>; fill?: Fill }
export interface Fill { liquid: string; amount: number }

/**
 * What can be in a vessel. Not things: a vessel holds whole units of one liquid. A liquid gives its vessel its tags (a bottle
 * of water is a drink) and is worth `price` a unit. `color` and `opacity` are how it looks through clear glass.
 */
export interface Liquid { name: string; color: string; opacity: number; tags: string[]; price: number; desc: string }
export const LIQUIDS: Record<string, Liquid> = {
  water: { name: 'water', color: '#8fbfd6', opacity: 0.4, tags: ['drink'], price: 1, desc: 'Clean, or near enough.' },
  wine: { name: 'wine', color: '#6a1a2a', opacity: 0.88, tags: ['drink', 'alcohol'], price: 2, desc: 'Red.' },
  spirit: { name: 'spirit', color: '#e2ecf2', opacity: 0.32, tags: ['alcohol', 'medicine'], price: 3, desc: 'Clear and strong: to drink, or to clean a wound.' },
  oil: { name: 'lamp oil', color: '#c99a2e', opacity: 0.82, tags: ['fuel'], price: 2, desc: 'Burns in a lamp or a stove.' },
}

/** How much of the held vessel's liquid would pour into that one: all of it that fits, if that one is empty or holds the same. 0 if none. */
export function canPour(from: Item, to: Item): number {
  const cap = KINDS[to.kind]?.holds ?? 0
  const have = from.fill?.amount ?? 0
  if (!have || !cap || from.id === to.id || (to.fill && to.fill.liquid !== from.fill!.liquid)) return 0
  if (KINDS[to.kind].liquids && !KINDS[to.kind].liquids!.includes(from.fill!.liquid)) return 0
  return Math.min(have, cap - (to.fill?.amount ?? 0))
}
/** Pour one vessel into another (see canPour); an emptied vessel holds nothing. How much went. */
export function pour(from: Item, to: Item): number {
  const n = canPour(from, to)
  if (!n) return 0
  to.fill = { liquid: from.fill!.liquid, amount: (to.fill?.amount ?? 0) + n }
  from.fill!.amount -= n
  if (!from.fill!.amount) delete from.fill
  return n
}
/** Fill a vessel to the brim with a liquid, or empty it (null). */
export function fillWith(it: Item, liquid: string | null) {
  const cap = KINDS[it.kind]?.holds ?? 0
  if (cap && liquid && LIQUIDS[liquid] && (KINDS[it.kind].liquids?.includes(liquid) ?? true)) it.fill = { liquid, amount: cap }
  else delete it.fill
}
/**
 * An open container: a window floating over the page, showing the container's insides. `id` is the container item; `x`, `y`
 * are screen pixels (its top-left); a folded one shows only as a tab in the rack along the top edge.
 */
/** `full`: a computer's window filling the page (see computer.ts). */
export interface Win { id: number; x: number; y: number; folded?: boolean; full?: boolean }
/** `windows` are the open containers, the last one on top; `cash` is the money you have. */
export interface State { items: Item[]; next: number; windows?: Win[]; cash?: number }
/** What a new game starts with. */
export const START_CASH = 50

/** How many containers can be open at once. */
export const MAX_WINDOWS = 4

const SHAPES = new Map<string, { sig: string; box: Box }>()
/** A kind's footprint as the grid sees it, facing the way it is made. */
export function shapeOf(kind: string): Box {
  const k = KINDS[kind]
  const sig = `${k.w}x${k.h}:${k.cells?.join('/') ?? ''}`
  const hit = SHAPES.get(kind)
  if (hit && hit.sig === sig) return hit.box
  const box: Box = { id: -1, x: 0, y: 0, w: k.w, h: k.h }
  if (k.cells) box.cells = k.cells.flatMap((row, y) => [...row].flatMap((c, x) => c === '#' ? [[x, y] as const] : []))
  SHAPES.set(kind, { sig, box })
  return box
}
export const quarter = (n: number) => ((Math.round(Number(n)) % 4) + 4) % 4
export function boxOf(it: Item): Box {
  let b = shapeOf(it.kind)
  for (let i = 0; i < quarter(it.rot); i++) b = turn(b)
  return { ...b, id: it.id, x: it.x, y: it.y, rot: quarter(it.rot) }
}
export const dims = (it: Item) => { const b = boxOf(it); return { w: b.w, h: b.h } }
/** Every square an item takes, as it sits (relative to its top-left). */
export function cellsOf(it: Item): [number, number][] {
  const b = boxOf(it)
  return b.cells ? b.cells.map(([x, y]) => [x, y] as [number, number]) : Array.from({ length: b.w * b.h }, (_, i) => [i % b.w, Math.floor(i / b.w)] as [number, number])
}
/** The squares a kind takes at rest (or turned a quarter): what the editor draws and the footprint painter edits. */
export const kindCells = (kind: string, turned: boolean | number = 0) => cellsOf({ id: -1, kind, x: 0, y: 0, rot: Number(turned) })

export const find = (s: State, id: number) => s.items.find(o => o.id === id)

/** A thing's property values, the defaults filled in. */
export function propsOf(it: Item): Record<string, string> {
  const defs = KINDS[it.kind]?.props ?? {}
  return Object.fromEntries(Object.entries(defs).map(([p, vals]) => [p, it.props?.[p] && it.props[p] in vals ? it.props[p] : Object.keys(vals)[0]]))
}
/** What a thing is with its properties applied: its name, description, tags, price and the colours swapped in its sprite. */
export function look(it: Item): { name: string; desc?: string; tags: string[]; price: number; colors: Record<string, string> } {
  const k = KINDS[it.kind]
  const out = { name: k.name, desc: k.desc, tags: [...k.tags ?? []], price: k.price ?? 0, colors: {} as Record<string, string> }
  for (const [p, v] of Object.entries(propsOf(it))) {
    const e = k.props![p][v]
    if (e.name) out.name = e.name
    if (e.desc) out.desc = e.desc
    if (e.tags) out.tags.push(...e.tags)
    if (e.price !== undefined) out.price = e.price
    Object.assign(out.colors, e.colors)
  }
  if (it.fill) out.tags.push(...LIQUIDS[it.fill.liquid]?.tags ?? [])
  return out
}
/** A thing's colour swatch (menu rows, window headers): its kind's colour, or what its properties turn that colour into. */
export const swatch = (it: Item) => { const c = KINDS[it.kind].color; return look(it).colors[c.toLowerCase()] ?? c }
/** What a thing is worth: its own price, its liquid, and everything inside it. */
export const worth = (s: State, it: Item): number => look(it).price + (it.fill ? (LIQUIDS[it.fill.liquid]?.price ?? 0) * it.fill.amount : 0) + contents(s, it.id).reduce((n, o) => n + worth(s, o), 0)

// ---------------------------------------------------------------- places: the field, and the insides of containers

/** Somewhere things can sit: the field (null), a counter, or one slot of a container item. */
export type Space = { host: number; slot: number } | { at: Counter } | null
export type SlotSpace = { host: number; slot: number }
/** Is this place inside a container (not the field or a counter)? */
export const isSlot = (sp: Space): sp is SlotSpace => !!sp && 'host' in sp
export const spaceOf = (it: Item): Space => it.in ?? (it.at ? { at: it.at } : null)
export const spaceKey = (sp: Space) => !sp ? 'field' : isSlot(sp) ? `${sp.host}:${sp.slot}` : sp.at
export const sameSpace = (a: Space, b: Space) => spaceKey(a) === spaceKey(b)
/** The place a grid's key names: "field", a counter, or "host:slot". */
export function spaceFromKey(k: string): Space {
  if (k === 'field') return null
  if (isCounter(k)) return { at: k }
  const [host, slot] = k.split(':').map(Number)
  return { host, slot }
}
export const isContainer = (kind: string) => !!KINDS[kind]?.slots?.length
const slotOf = (s: State, sp: SlotSpace) => { const host = find(s, sp.host); return host ? KINDS[host.kind]?.slots?.[sp.slot] : undefined }
export function spaceSize(s: State, sp: Space): { w: number; h: number } {
  if (!sp) return { w: W, h: H }
  if (!isSlot(sp)) return COUNTERS[sp.at]
  const host = find(s, sp.host)
  const slot = host && KINDS[host.kind]?.slots?.[sp.slot]
  return slot ? { w: slot.w, h: slot.h } : { w: 0, h: 0 }
}
export const inSpace = (s: State, sp: Space) => s.items.filter(o => sameSpace(spaceOf(o), sp))
/** What is inside a container, in any of its slots. */
export const contents = (s: State, host: number) => s.items.filter(o => o.in?.host === host)

/** Containers do not go in containers, except kinds tagged `vessel` (bottles and the like), which take a second level and no more. */
export const MAX_NEST = 2
const chain = (s: State, id: number) => { const out: Item[] = []; for (let o = find(s, id); o; o = o.in ? find(s, o.in.host) : undefined) out.push(o); return out }
/** Is `id` the item `anc`, or somewhere inside it? */
const within = (s: State, id: number, anc: number) => chain(s, id).some(o => o.id === anc)
/** How many containers deep this item goes, itself included (0 for something that holds nothing). */
const height = (s: State, it: Item): number => isContainer(it.kind) ? 1 + Math.max(0, ...contents(s, it.id).map(o => height(s, o))) : 0

/** Would this space take that item? The field and the counters take anything; a slot checks its tag rules, refuses cycles, and keeps the nesting limit. A take-out-only slot keeps only what is already in it. */
export function accepts(s: State, it: Item, sp: Space): boolean {
  if (!isSlot(sp)) return true
  const host = find(s, sp.host)
  const slot = host && KINDS[host.kind]?.slots?.[sp.slot]
  if (!host || !slot || within(s, sp.host, it.id)) return false
  if (slot.out && !sameSpace(spaceOf(it), sp)) return false
  const tags = look(it).tags
  if (isContainer(it.kind) && !tags.includes('vessel')) return false // only specialised containers (a water bottle) go inside another
  if (slot.accepts?.length && !tags.some(t => slot.accepts!.includes(t))) return false
  if (tags.some(t => slot.rejects?.includes(t))) return false
  return chain(s, sp.host).length + height(s, it) <= MAX_NEST
}

// ---------------------------------------------------------------- dragging

/** What's in hand: the thing you grabbed (`item`) and whatever was selected with it in the same place (`items`, the grabbed one first), and where each was lifted from. */
export interface Held { item: Item; items: Item[]; space: Space; from: { x: number; y: number; rot: number }; froms: { id: number; x: number; y: number; rot: number; space: Space }[] }
export interface Plan { space: Space; x: number; y: number; rot: number; moves: { id: number; x: number; y: number; rot: number; group?: boolean }[] }

/** Pick up an item; if it is one of several selected in the same place, they all come with it. */
export function lift(s: State, id: number, selected: number[] = []): Held | null {
  const it = find(s, id)
  if (!it) return null
  const here = spaceOf(it)
  const rest = selected.includes(id) ? selected.filter(i => i !== id).map(i => find(s, i)).filter((o): o is Item => !!o && sameSpace(spaceOf(o), here)) : []
  const items = [it, ...rest]
  return { item: it, items, space: here, from: { x: it.x, y: it.y, rot: it.rot }, froms: items.map(o => ({ id: o.id, x: o.x, y: o.y, rot: o.rot, space: spaceOf(o) })) }
}

/**
 * Where the held thing goes if dropped in `space` with its top-left at (x, y). The easy way (`strict` false): whatever is in
 * the way gives way (a straight swap, a shove, a hop, or turning). Strict: nothing else ever moves; it goes there only if the
 * squares are free, and is otherwise refused (null). A space that will not take it (wrong kind, too deep, no room) refuses too.
 */
export function planDrop(s: State, held: Held, space: Space, x: number, y: number, rot: number, strict = false, turnedOnce = false): Plan | null {
  if (isSlot(space) && slotOf(s, space)?.out) return null // nothing goes into a take-out-only slot, not even back to another spot in it
  if (held.items.some(o => !accepts(s, o, space))) return null
  const { w: SW, h: SH } = spaceSize(s, space)
  if (!SW || !SH) return null
  if (held.items.length > 1) return planGroup(s, held, space, x, y, strict)
  const it = held.item
  const d = dims({ ...it, rot })
  const others = inSpace(s, space).filter(o => o.id !== it.id)
  const m: Box = { ...boxOf({ ...it, rot }), x: Math.max(0, Math.min(SW - d.w, x)), y: Math.max(0, Math.min(SH - d.h, y)) }
  const tooBig = d.w > SW || d.h > SH // too big this way round: only turning can help (relaxed mode)
  if (strict) return tooBig || others.some(o => overlaps(boxOf(o), m)) ? null : { space, x: m.x, y: m.y, rot, moves: [] }

  // Dropped squarely onto something of the same shape, from the same place: they trade places.
  const hits = others.filter(o => { const b = boxOf(o); return b.x < m.x + m.w && m.x < b.x + b.w && b.y < m.y + m.h && m.y < b.y + b.h })
  if (sameSpace(space, held.space) && hits.length === 1 && !m.cells && !boxOf(hits[0]).cells) {
    const hb = boxOf(hits[0])
    if (hb.x === m.x && hb.y === m.y && hb.w === m.w && hb.h === m.h)
      return { space, x: m.x, y: m.y, rot, moves: [{ id: hits[0].id, x: held.from.x, y: held.from.y, rot: quarter(hits[0].rot + held.from.rot - rot) }] }
  }

  const res = tooBig ? null : drop(SW, SH, others.map(boxOf), m, sameSpace(space, held.space) ? { x: held.from.x, y: held.from.y } : undefined)
  if (res) {
    const [me, ...rest] = res
    return { space, x: me.x, y: me.y, rot, moves: rest.map(r => ({ id: r.id, x: r.x, y: r.y, rot: r.rot ?? 0 })) }
  }
  // Nowhere as it is: try each other way round that is a different footprint (turning a square changes nothing, so that is not tried).
  if (!turnedOnce) {
    for (let i = 1; i < 4; i++) {
      const r2 = quarter(rot + i)
      if (footprintKey(boxOf({ ...it, rot: r2 })) === footprintKey(m)) continue
      const p = planDrop(s, held, space, x, y, r2, false, true)
      if (p) return p
    }
  }
  return null
}

/** Several selected things dropped together, keeping their places relative to each other (and their turn). */
function planGroup(s: State, held: Held, space: Space, x: number, y: number, strict: boolean): Plan | null {
  const { w: SW, h: SH } = spaceSize(s, space)
  const ids = new Set(held.items.map(o => o.id))
  const others = inSpace(s, space).filter(o => !ids.has(o.id))
  const rel = held.items.map((o, i) => ({ o, dx: held.froms[i].x - held.from.x, dy: held.froms[i].y - held.from.y }))
  const minDx = Math.min(...rel.map(r => r.dx)), maxDx = Math.max(...rel.map(r => r.dx + dims(r.o).w))
  const minDy = Math.min(...rel.map(r => r.dy)), maxDy = Math.max(...rel.map(r => r.dy + dims(r.o).h))
  if (maxDx - minDx > SW || maxDy - minDy > SH) return null
  const tx = Math.max(-minDx, Math.min(SW - maxDx, x)), ty = Math.max(-minDy, Math.min(SH - maxDy, y))
  const boxes = rel.map(r => ({ ...boxOf(r.o), x: tx + r.dx, y: ty + r.dy }))
  const members = boxes.slice(1).map(b => ({ id: b.id, x: b.x, y: b.y, rot: b.rot ?? 0, group: true }))
  if (strict) return others.some(o => boxes.some(b => overlaps(boxOf(o), b))) ? null : { space, x: tx, y: ty, rot: held.item.rot, moves: members }
  const res = dropGroup(SW, SH, others.map(boxOf), boxes, sameSpace(space, held.space) ? { x: held.from.x, y: held.from.y } : undefined)
  if (!res) return null
  return { space, x: tx, y: ty, rot: held.item.rot, moves: [...members, ...res.slice(boxes.length).map(r => ({ id: r.id, x: r.x, y: r.y, rot: r.rot ?? 0 }))] }
}

/** Dropped onto a container itself: into the first of its slots that takes the lot and has room, on the first free spots. */
export function intoHost(s: State, held: Held, hostId: number): Plan | null {
  const host = find(s, hostId)
  if (!host || held.items.some(o => o.id === hostId || within(s, hostId, o.id))) return null
  const slots = KINDS[host.kind]?.slots ?? []
  for (let i = 0; i < slots.length; i++) {
    const space: Space = { host: hostId, slot: i }
    if (held.items.some(o => !accepts(s, o, space))) continue
    const taken = inSpace(s, space).filter(o => !held.items.includes(o)).map(boxOf)
    const placed: Box[] = []
    for (const o of held.items) {
      const spot = firstFree(slots[i].w, slots[i].h, [...taken, ...placed], { ...boxOf(o), x: 0, y: 0 })
      if (!spot) break
      placed.push({ ...spot.box, id: o.id, x: spot.x, y: spot.y })
    }
    if (placed.length < held.items.length) continue
    const [a, ...rest] = placed
    return { space, x: a.x, y: a.y, rot: a.rot ?? 0, moves: rest.map(b => ({ id: b.id, x: b.x, y: b.y, rot: b.rot ?? 0, group: true })) }
  }
  return null
}

/** Put an item in a place (its x, y are then in that place's grid). */
const setIn = (o: Item, sp: Space) => {
  delete o.in; delete o.at
  if (isSlot(sp)) o.in = { host: sp.host, slot: sp.slot }
  else if (sp) o.at = sp.at
}

export function applyDrop(s: State, held: Held, plan: Plan) {
  for (const mv of plan.moves) {
    const o = find(s, mv.id)!
    Object.assign(o, { x: mv.x, y: mv.y, rot: mv.rot })
    if (mv.group) setIn(o, plan.space)
  }
  Object.assign(held.item, { x: plan.x, y: plan.y, rot: plan.rot })
  setIn(held.item, plan.space)
}

/** Nothing happened: everything lifted goes back where it was. */
export function putBack(held: Held) {
  held.items.forEach((o, i) => { const f = held.froms[i]; Object.assign(o, { x: f.x, y: f.y, rot: f.rot }); setIn(o, f.space) })
}

/** Take things off the field, and whatever was inside them. */
export function remove(s: State, ids: number[]) {
  const gone = new Set(ids)
  for (let grew = true; grew;) { grew = false; for (const o of s.items) if (!gone.has(o.id) && o.in && gone.has(o.in.host)) { gone.add(o.id); grew = true } }
  s.items = s.items.filter(o => !gone.has(o.id))
  if (s.windows) s.windows = s.windows.filter(w => !gone.has(w.id))
}

/** Containers that would take the held thing (some slot accepts it and it is not already inside). */
export const hostsFor = (s: State, held: Item[]) => s.items.filter(o => isContainer(o.kind) && !held.some(h => h.id === o.id || h.in?.host === o.id) && (KINDS[o.kind].slots ?? []).some((_, i) => held.every(h => accepts(s, h, { host: o.id, slot: i }))))

/** Lay items out in a w x h space: keep what is valid, re-place what overlaps or hangs off (turning if it must); return what fits and what does not. */
function layout(items: Item[], w: number, h: number): { kept: Item[]; lost: Item[] } {
  const kept: Item[] = [], lost: Item[] = []
  for (const it of items) {
    const b = boxOf(it)
    if (b.x >= 0 && b.y >= 0 && b.x + b.w <= w && b.y + b.h <= h && !kept.some(o => overlaps(boxOf(o), b))) { kept.push(it); continue }
    const spot = firstFree(w, h, kept.map(boxOf), { ...boxOf({ ...it, rot: 0 }), x: 0, y: 0 })
    if (spot) kept.push({ ...it, x: spot.x, y: spot.y, rot: spot.rot }); else lost.push(it)
  }
  return { kept, lost }
}

/** A liquid only in a vessel, only one that exists, and no more than the vessel holds. */
function cleanFill(o: Item): { fill?: Fill } {
  const cap = KINDS[o.kind]?.holds ?? 0
  const n = Math.min(cap, Math.floor(Number(o.fill?.amount) || 0))
  return o.fill && LIQUIDS[o.fill.liquid] && n > 0 ? { fill: { liquid: o.fill.liquid, amount: n } } : {}
}
/** Only properties the kind still has, with values it still knows, and none that are the default. */
function cleanProps(o: Item): { props?: Record<string, string> } {
  const defs = KINDS[o.kind]?.props ?? {}
  const kept = Object.entries(o.props ?? {}).filter(([p, v]) => defs[p] && v in defs[p] && Object.keys(defs[p])[0] !== v)
  return kept.length ? { props: Object.fromEntries(kept) } : {}
}

/**
 * After sizes or kinds changed under a saved layout: drop things that no longer exist, send things whose container is gone
 * (or now refuses them) out to the field, and re-place anything that now overlaps or hangs off its grid.
 */
export function settle(s: State): State {
  // only what an item still is: no old properties, liquids or machine state (and nothing on a counter that does not exist)
  const items: Item[] = s.items.filter(o => KINDS[o.kind]).map(o => ({ id: o.id, kind: o.kind, x: o.x, y: o.y, rot: quarter(o.rot), ...(o.in ? { in: o.in } : isCounter(o.at) ? { at: o.at } : {}), ...cleanProps(o), ...cleanFill(o) }))
  const state: State = { items, next: s.next }
  // pass 1: anything in a slot that does not exist, or that its slot now refuses, goes back out to the field
  const evict = (o: Item) => { delete o.in }
  for (const o of items) {
    if (!o.in) continue
    const host = items.find(h => h.id === o.in!.host)
    if (!host || !KINDS[host.kind]?.slots?.[o.in.slot]) evict(o)
  }
  for (const o of items) if (o.in && !accepts(state, o, o.in)) evict(o)
  // pass 2: each place on its own
  const out: Item[] = []
  let stray: Item[] = []
  const spaces = new Map<string, { sp: Space; list: Item[] }>()
  for (const o of items) { const k = spaceKey(spaceOf(o)); if (!spaces.has(k)) spaces.set(k, { sp: spaceOf(o), list: [] }); spaces.get(k)!.list.push(o) }
  for (const { sp, list } of spaces.values()) {
    const { w, h } = spaceSize(state, sp)
    const { kept, lost } = layout(list, w, h)
    out.push(...kept)
    if (sp) stray.push(...lost) // lost from a slot or a counter: to the field
  }
  // whatever did not fit its slot lands on the field, in the first free spots
  const field = out.filter(o => !spaceOf(o))
  for (const o of stray) { const spot = firstFree(W, H, field.map(boxOf), { ...boxOf({ ...o, rot: 0 }), x: 0, y: 0 }); if (spot) { const put = { ...o, x: spot.x, y: spot.y, rot: spot.rot }; setIn(put, null); out.push(put); field.push(put) } }
  const ids = new Set(out.map(o => o.id))
  // windows of containers that are gone (or no longer containers) close; old saves' docked panels are not carried over
  const windows = (s.windows ?? []).filter(w => ids.has(w.id) && isContainer(out.find(o => o.id === w.id)!.kind)).slice(-MAX_WINDOWS)
  return { items: out, next: s.next, windows, cash: Math.max(0, Math.round(Number(s.cash ?? START_CASH)) || 0) }
}

/** Move a thing (and whatever is inside it) to the first free spot of a place, turned if that is the only way it fits. False if there is no room. */
export function moveInto(s: State, it: Item, space: Space): boolean {
  const { w, h } = spaceSize(s, space)
  const spot = firstFree(w, h, inSpace(s, space).filter(o => o.id !== it.id).map(boxOf), shapeOf(it.kind))
  if (!spot || !accepts(s, it, space)) return false
  Object.assign(it, { x: spot.x, y: spot.y, rot: spot.rot })
  setIn(it, space)
  return true
}

/**
 * Put a new thing of this kind, with these properties, on the first free spot of a place (the field unless told otherwise),
 * turned if that is the only way it fits. Null if there is no room. A container whose slot has `fill` comes full of it; a
 * vessel comes full of its `liquid`.
 */
export function spawn(s: State, kind: string, space: Space = null, props: Record<string, string> = {}, fill = false): Item | null {
  const { w, h } = spaceSize(s, space)
  const it: Item = { id: s.next, kind, x: 0, y: 0, rot: 0, ...cleanProps({ id: 0, kind, x: 0, y: 0, rot: 0, props }) }
  setIn(it, space)
  if (!fill && !accepts(s, it, space)) return null
  const spot = firstFree(w, h, inSpace(s, space).map(boxOf), shapeOf(kind))
  if (!spot) return null
  s.next++
  Object.assign(it, { x: spot.x, y: spot.y, rot: spot.rot })
  s.items.push(it)
  fillWith(it, KINDS[kind].liquid ?? null)
  KINDS[kind].slots?.forEach((sl, slot) => { if (sl.fill && KINDS[sl.fill]) for (let n = 0; n < (sl.count ?? Infinity) && spawn(s, sl.fill, { host: it.id, slot }, propsOf(it), true); n++); })
  return it
}

/** A new game: an empty field and a little money. */
export function start(): State {
  return { items: [], next: 1, windows: [], cash: START_CASH }
}
