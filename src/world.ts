// The field: a grid of cells with things on it. Nothing else yet.

import { drop, dropGroup, firstFree, footprintKey, overlaps, turn, type Box } from './grid.ts'
import DATA from './kinds.json' with { type: 'json' }

export const W = 25
export const H = 20

/**
 * What a kind of thing is. `w` and `h` are its footprint's bounding box in cells; `cells`, when the footprint is not a plain
 * rectangle, says which squares inside it are taken ('#') and which are free ('.'). The rest is for people: a description
 * (for tooltips), private notes, and tags.
 */
export interface Kind { name: string; icon: string; color: string; w: number; h: number; cells?: string[]; desc?: string; notes?: string; tags?: string[]; uses?: Use[]; slots?: Slot[] }
/**
 * A container's inside, or one named zone of a machine: a small grid with its own rules. A plain container has one slot; a
 * machine has several (input, fuel, output...). `accepts` and `rejects` are tags; nothing else is checked.
 */
export interface Slot { name?: string; w: number; h: number; accepts?: string[]; rejects?: string[] }
/** Held, this can be used on another thing: `on` is a kind id or a tag ("pour" on a bottle, "slaughter" on anything tagged animal). */
export interface Use { on: string; verb: string }

/** What things are. Sizes are in field cells and every footprint is a plain rectangle; the data lives in kinds.json so the sprite editor can change it. */
export const KINDS: Record<string, Kind> = DATA

/** `rot` is how many quarter turns clockwise it has been turned (0 to 3): 2 is upside down. */
/** `in` says which container's slot it sits in (its x, y are then inside that slot's grid); no `in` means on the field. */
export interface Item { id: number; kind: string; x: number; y: number; rot: number; in?: { host: number; slot: number } }
/** `panels` are the open containers, docked to the sides: [left top, left bottom, right top, right bottom]. */
export interface State { items: Item[]; next: number; panels?: (number | null)[] }

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

// ---------------------------------------------------------------- places: the field, and the insides of containers

/** Somewhere things can sit: the field (null), or one slot of a container item. */
export type Space = { host: number; slot: number } | null
export const spaceOf = (it: Item): Space => it.in ?? null
export const sameSpace = (a: Space, b: Space) => (a?.host ?? 0) === (b?.host ?? 0) && (a?.slot ?? -1) === (b?.slot ?? -1)
export const spaceKey = (sp: Space) => sp ? `${sp.host}:${sp.slot}` : 'field'
export const isContainer = (kind: string) => !!KINDS[kind]?.slots?.length
export function spaceSize(s: State, sp: Space): { w: number; h: number } {
  if (!sp) return { w: W, h: H }
  const host = find(s, sp.host)
  const slot = host && KINDS[host.kind]?.slots?.[sp.slot]
  return slot ? { w: slot.w, h: slot.h } : { w: 0, h: 0 }
}
export const inSpace = (s: State, sp: Space) => s.items.filter(o => sameSpace(spaceOf(o), sp))
/** What is inside a container, in any of its slots. */
export const contents = (s: State, host: number) => s.items.filter(o => o.in?.host === host)

/** You can carry a container inside a container inside the field, and no deeper: no infinite space by chests in chests. */
export const MAX_NEST = 2
const chain = (s: State, id: number) => { const out: Item[] = []; for (let o = find(s, id); o; o = o.in ? find(s, o.in.host) : undefined) out.push(o); return out }
/** Is `id` the item `anc`, or somewhere inside it? */
const within = (s: State, id: number, anc: number) => chain(s, id).some(o => o.id === anc)
/** How many containers deep this item goes, itself included (0 for something that holds nothing). */
const height = (s: State, it: Item): number => isContainer(it.kind) ? 1 + Math.max(0, ...contents(s, it.id).map(o => height(s, o))) : 0

/** Would this space take that item? The field takes anything; a slot checks its tag rules, refuses cycles, and keeps the nesting limit. */
export function accepts(s: State, it: Item, sp: Space): boolean {
  if (!sp) return true
  const host = find(s, sp.host)
  const slot = host && KINDS[host.kind]?.slots?.[sp.slot]
  if (!host || !slot || within(s, sp.host, it.id)) return false
  const tags = KINDS[it.kind]?.tags ?? []
  if (slot.accepts?.length && !tags.some(t => slot.accepts!.includes(t))) return false
  if (tags.some(t => slot.rejects?.includes(t))) return false
  return chain(s, sp.host).length + height(s, it) <= MAX_NEST
}

// ---------------------------------------------------------------- dragging

/** What's in hand: the thing you grabbed (`item`) and whatever was selected with it in the same place (`items`, the grabbed one first), and where each was lifted from. */
export interface Held { item: Item; items: Item[]; space: Space; from: { x: number; y: number; rot: number }; froms: { id: number; x: number; y: number; rot: number; in?: { host: number; slot: number } }[] }
export interface Plan { space: Space; x: number; y: number; rot: number; moves: { id: number; x: number; y: number; rot: number; group?: boolean }[] }

/** Pick up an item; if it is one of several selected in the same place, they all come with it. */
export function lift(s: State, id: number, selected: number[] = []): Held | null {
  const it = find(s, id)
  if (!it) return null
  const here = spaceOf(it)
  const rest = selected.includes(id) ? selected.filter(i => i !== id).map(i => find(s, i)).filter((o): o is Item => !!o && sameSpace(spaceOf(o), here)) : []
  const items = [it, ...rest]
  return { item: it, items, space: here, from: { x: it.x, y: it.y, rot: it.rot }, froms: items.map(o => ({ id: o.id, x: o.x, y: o.y, rot: o.rot, in: o.in ? { ...o.in } : undefined })) }
}

/**
 * Where the held thing goes if dropped in `space` with its top-left at (x, y). The easy way (`strict` false): whatever is in
 * the way gives way (a straight swap, a shove, a hop, or turning). Strict: nothing else ever moves; it goes there only if the
 * squares are free, and is otherwise refused (null). A space that will not take it (wrong kind, too deep, no room) refuses too.
 */
export function planDrop(s: State, held: Held, space: Space, x: number, y: number, rot: number, strict = false, turnedOnce = false): Plan | null {
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

const setIn = (o: Item, sp: Space) => { if (sp) o.in = { host: sp.host, slot: sp.slot }; else delete o.in }

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
  held.items.forEach((o, i) => { const f = held.froms[i]; Object.assign(o, { x: f.x, y: f.y, rot: f.rot }); setIn(o, f.in ?? null) })
}

/** Take things off the field, and whatever was inside them. */
export function remove(s: State, ids: number[]) {
  const gone = new Set(ids)
  for (let grew = true; grew;) { grew = false; for (const o of s.items) if (!gone.has(o.id) && o.in && gone.has(o.in.host)) { gone.add(o.id); grew = true } }
  s.items = s.items.filter(o => !gone.has(o.id))
  if (s.panels) s.panels = s.panels.map(p => (p !== null && gone.has(p) ? null : p))
}

/** What holding `held` over `target` would do, if anything: the first of the held kind's `uses` that names the target's kind or one of its tags. */
export function interaction(held: Item, target: Item): Use | null {
  const tags = KINDS[target.kind].tags ?? []
  return (KINDS[held.kind].uses ?? []).find(u => u.on === target.kind || tags.includes(u.on)) ?? null
}
/** Everything the held thing can be used on (anywhere; what is on screen is the page's business). */
export const targetsFor = (s: State, held: Item[]) => s.items.filter(o => !held.includes(o) && interaction(held[0], o))

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

/**
 * After sizes or kinds changed under a saved layout: drop things that no longer exist, send things whose container is gone
 * (or now refuses them) out to the field, and re-place anything that now overlaps or hangs off its grid.
 */
export function settle(s: State): State {
  let items = s.items.filter(o => KINDS[o.kind]).map(o => ({ ...o, rot: quarter(o.rot) }))
  const state: State = { ...s, items }
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
    if (sp) stray.push(...lost.map(o => ({ ...o, in: undefined }))); // lost from a slot: to the field
  }
  // whatever did not fit its slot lands on the field, in the first free spots
  const field = out.filter(o => !o.in)
  for (const o of stray) { const spot = firstFree(W, H, field.map(boxOf), { ...boxOf({ ...o, rot: 0 }), x: 0, y: 0 }); if (spot) { const put = { ...o, x: spot.x, y: spot.y, rot: spot.rot }; delete put.in; out.push(put); field.push(put) } }
  const ids = new Set(out.map(o => o.id))
  return { ...s, items: out, panels: (s.panels ?? [null, null, null, null]).map(p => (p !== null && ids.has(p) && isContainer(out.find(o => o.id === p)!.kind) ? p : null)) }
}

/** Put a new thing of this kind on the first free spot of a place (the field unless told otherwise), turned if that is the only way it fits. Null if there is no room. */
export function spawn(s: State, kind: string, space: Space = null): Item | null {
  const { w, h } = spaceSize(s, space)
  const it: Item = { id: s.next, kind, x: 0, y: 0, rot: 0 }
  if (space) it.in = { host: space.host, slot: space.slot }
  if (!accepts(s, it, space)) return null
  const spot = firstFree(w, h, inSpace(s, space).map(boxOf), shapeOf(kind))
  if (!spot) return null
  s.next++
  Object.assign(it, { x: spot.x, y: spot.y, rot: spot.rot })
  s.items.push(it)
  return it
}

export function start(): State {
  const s: State = { items: [], next: 1, panels: [null, null, null, null] }
  const put = (kind: string, x: number, y: number, rot = 0) => s.items.push({ id: s.next++, kind, x, y, rot })
  put('crate', 3, 3)
  put('axe', 10, 3)
  put('pickaxe', 16, 4)
  put('log', 4, 10)
  put('coal', 10, 12)
  put('coal', 13, 12)
  put('bottle', 18, 11)
  put('knife', 22, 4)
  return s
}
