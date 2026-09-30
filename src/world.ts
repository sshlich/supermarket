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
export interface Kind { name: string; icon: string; color: string; w: number; h: number; cells?: string[]; desc?: string; notes?: string; tags?: string[]; uses?: Use[] }
/** Held, this can be used on another thing: `on` is a kind id or a tag ("pour" on a bottle, "slaughter" on anything tagged animal). */
export interface Use { on: string; verb: string }

/** What things are. Sizes are in field cells and every footprint is a plain rectangle; the data lives in kinds.json so the sprite editor can change it. */
export const KINDS: Record<string, Kind> = DATA

/** `rot` is how many quarter turns clockwise it has been turned (0 to 3): 2 is upside down. */
export interface Item { id: number; kind: string; x: number; y: number; rot: number }
export interface State { items: Item[]; next: number }

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

// ---------------------------------------------------------------- dragging

/** What's in hand: the thing you grabbed (`item`) and whatever was selected with it (`items`, the grabbed one first), and where each was lifted from. */
export interface Held { item: Item; items: Item[]; from: { x: number; y: number; rot: number }; froms: { id: number; x: number; y: number; rot: number }[] }
export interface Plan { x: number; y: number; rot: number; moves: { id: number; x: number; y: number; rot: number; group?: boolean }[] }

/** Pick up an item; if it is one of several selected, the whole selection comes with it. */
export function lift(s: State, id: number, selected: number[] = []): Held | null {
  const it = find(s, id)
  if (!it) return null
  const rest = selected.includes(id) ? selected.filter(i => i !== id).map(i => find(s, i)).filter((o): o is Item => !!o) : []
  const items = [it, ...rest]
  return { item: it, items, from: { x: it.x, y: it.y, rot: it.rot }, froms: items.map(o => ({ id: o.id, x: o.x, y: o.y, rot: o.rot })) }
}

/**
 * Where the held thing goes if dropped with its top-left at (x, y). In the easy way (`strict` false) whatever is in the way
 * gives way: a straight swap, a shove, a hop, or turning. In strict mode nothing else ever moves: it goes there only if the
 * squares are free, and otherwise it is refused (null).
 */
export function planDrop(s: State, held: Held, x: number, y: number, rot: number, strict = false, turnedOnce = false): Plan | null {
  if (held.items.length > 1) return planGroup(s, held, x, y, strict)
  const it = held.item
  const d = dims({ ...it, rot })
  const others = s.items.filter(o => o.id !== it.id)
  const m: Box = { ...boxOf({ ...it, rot }), x: Math.max(0, Math.min(W - d.w, x)), y: Math.max(0, Math.min(H - d.h, y)) }
  if (d.w > W || d.h > H) return null
  if (strict) return others.some(o => overlaps(boxOf(o), m)) ? null : { x: m.x, y: m.y, rot, moves: [] }

  // Dropped squarely onto something of the same shape: they trade places.
  const hits = others.filter(o => { const b = boxOf(o); return b.x < m.x + m.w && m.x < b.x + b.w && b.y < m.y + m.h && m.y < b.y + b.h })
  if (hits.length === 1 && !m.cells && !boxOf(hits[0]).cells) {
    const hb = boxOf(hits[0])
    if (hb.x === m.x && hb.y === m.y && hb.w === m.w && hb.h === m.h)
      return { x: m.x, y: m.y, rot, moves: [{ id: hits[0].id, x: held.from.x, y: held.from.y, rot: quarter(hits[0].rot + held.from.rot - rot) }] }
  }

  const res = drop(W, H, others.map(boxOf), m, { x: held.from.x, y: held.from.y })
  if (res) {
    const [me, ...rest] = res
    return { x: me.x, y: me.y, rot, moves: rest.map(r => ({ id: r.id, x: r.x, y: r.y, rot: r.rot ?? 0 })) }
  }
  // Nowhere as it is: try each other way round that is a different footprint (turning a square changes nothing, so that is not tried).
  if (!turnedOnce) {
    for (let i = 1; i < 4; i++) {
      const r2 = quarter(rot + i)
      if (footprintKey(boxOf({ ...it, rot: r2 })) === footprintKey(m)) continue
      const p = planDrop(s, held, x, y, r2, false, true)
      if (p) return p
    }
  }
  return null
}

/** Several selected things dropped together, keeping their places relative to each other (and their turn). */
function planGroup(s: State, held: Held, x: number, y: number, strict: boolean): Plan | null {
  const ids = new Set(held.items.map(o => o.id))
  const others = s.items.filter(o => !ids.has(o.id))
  const rel = held.items.map((o, i) => ({ o, dx: held.froms[i].x - held.from.x, dy: held.froms[i].y - held.from.y }))
  const minDx = Math.min(...rel.map(r => r.dx)), maxDx = Math.max(...rel.map(r => r.dx + dims(r.o).w))
  const minDy = Math.min(...rel.map(r => r.dy)), maxDy = Math.max(...rel.map(r => r.dy + dims(r.o).h))
  if (maxDx - minDx > W || maxDy - minDy > H) return null
  const tx = Math.max(-minDx, Math.min(W - maxDx, x)), ty = Math.max(-minDy, Math.min(H - maxDy, y))
  const boxes = rel.map(r => ({ ...boxOf(r.o), x: tx + r.dx, y: ty + r.dy }))
  const members = boxes.slice(1).map(b => ({ id: b.id, x: b.x, y: b.y, rot: b.rot ?? 0, group: true }))
  if (strict) return others.some(o => boxes.some(b => overlaps(boxOf(o), b))) ? null : { x: tx, y: ty, rot: held.item.rot, moves: members }
  const res = dropGroup(W, H, others.map(boxOf), boxes, { x: held.from.x, y: held.from.y })
  if (!res) return null
  return { x: tx, y: ty, rot: held.item.rot, moves: [...members, ...res.slice(boxes.length).map(r => ({ id: r.id, x: r.x, y: r.y, rot: r.rot ?? 0 }))] }
}

export function applyDrop(s: State, held: Held, plan: Plan) {
  for (const mv of plan.moves) Object.assign(find(s, mv.id)!, { x: mv.x, y: mv.y, rot: mv.rot })
  Object.assign(held.item, { x: plan.x, y: plan.y, rot: plan.rot })
}

/** Nothing happened: everything lifted goes back where it was. */
export function putBack(held: Held) { held.items.forEach((o, i) => Object.assign(o, { x: held.froms[i].x, y: held.froms[i].y, rot: held.froms[i].rot })) }

/** Take things off the field. */
export function remove(s: State, ids: number[]) { s.items = s.items.filter(o => !ids.includes(o.id)) }

/** What holding `held` over `target` would do, if anything: the first of the held kind's `uses` that names the target's kind or one of its tags. */
export function interaction(held: Item, target: Item): Use | null {
  const tags = KINDS[target.kind].tags ?? []
  return (KINDS[held.kind].uses ?? []).find(u => u.on === target.kind || tags.includes(u.on)) ?? null
}
/** Everything on the field the held thing can be used on. */
export const targetsFor = (s: State, held: Item[]) => s.items.filter(o => !held.includes(o) && interaction(held[0], o))

/** After sizes or kinds changed under a saved layout: drop things that no longer exist, and re-place anything that now overlaps or hangs off the field. */
export function settle(s: State): State {
  const kept: Item[] = []
  for (const raw of s.items) {
    if (!KINDS[raw.kind]) continue
    const it = { ...raw, rot: quarter(raw.rot) } // saved layouts from before four-way turning have true / false here
    const b = boxOf(it)
    const fits = b.x >= 0 && b.y >= 0 && b.x + b.w <= W && b.y + b.h <= H && !kept.some(o => overlaps(boxOf(o), b))
    if (fits) { kept.push(it); continue }
    const spot = firstFree(W, H, kept.map(boxOf), { ...boxOf({ ...it, rot: 0 }), x: 0, y: 0 })
    if (spot) kept.push({ ...it, x: spot.x, y: spot.y, rot: spot.rot })
  }
  return { ...s, items: kept }
}

/** Put a new thing of this kind on the first free spot of the field (turned if that is the only way it fits). Null if there is no room. */
export function spawn(s: State, kind: string): Item | null {
  const spot = firstFree(W, H, s.items.map(boxOf), shapeOf(kind))
  if (!spot) return null
  const it: Item = { id: s.next++, kind, x: spot.x, y: spot.y, rot: spot.rot }
  s.items.push(it)
  return it
}

export function start(): State {
  const s: State = { items: [], next: 1 }
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
