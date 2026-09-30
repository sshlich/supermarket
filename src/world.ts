// The field: a grid of cells with things on it. Nothing else yet.

import { drop, firstFree, overlaps, same, turn, type Box } from './grid.ts'
import DATA from './kinds.json' with { type: 'json' }

export const W = 30
export const H = 20

/**
 * What a kind of thing is. `w` and `h` are its footprint's bounding box in cells; `cells`, when the footprint is not a plain
 * rectangle, says which squares inside it are taken ('#') and which are free ('.'). The rest is for people: a description
 * (for tooltips), private notes, and tags.
 */
export interface Kind { name: string; icon: string; color: string; w: number; h: number; cells?: string[]; desc?: string; notes?: string; tags?: string[] }

/** What things are. Sizes are in field cells and every footprint is a plain rectangle; the data lives in kinds.json so the sprite editor can change it. */
export const KINDS: Record<string, Kind> = DATA

export interface Item { id: number; kind: string; x: number; y: number; rot: boolean }
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
export const boxOf = (it: Item): Box => ({ ...(it.rot ? turn(shapeOf(it.kind)) : shapeOf(it.kind)), id: it.id, x: it.x, y: it.y })
export const dims = (it: Item) => { const b = boxOf(it); return { w: b.w, h: b.h } }
/** Every square an item takes, as it sits (relative to its top-left). */
export function cellsOf(it: Item): [number, number][] {
  const b = boxOf(it)
  return b.cells ? b.cells.map(([x, y]) => [x, y] as [number, number]) : Array.from({ length: b.w * b.h }, (_, i) => [i % b.w, Math.floor(i / b.w)] as [number, number])
}
/** The squares a kind takes at rest (or turned a quarter): what the editor draws and the footprint painter edits. */
export const kindCells = (kind: string, turned = false) => cellsOf({ id: -1, kind, x: 0, y: 0, rot: turned })

export const find = (s: State, id: number) => s.items.find(o => o.id === id)

// ---------------------------------------------------------------- dragging

/** What's in hand, and where it was lifted from. */
export interface Held { item: Item; from: { x: number; y: number; rot: boolean } }
export interface Plan { x: number; y: number; rot: boolean; moves: { id: number; x: number; y: number; rot: boolean }[] }

export function lift(s: State, id: number): Held | null {
  const it = find(s, id)
  return it ? { item: it, from: { x: it.x, y: it.y, rot: it.rot } } : null
}

/** Where the held item goes if dropped with its top-left at (x, y): a straight swap, a shove, a hop, or turned. Null if it can't fit. */
export function planDrop(s: State, held: Held, x: number, y: number, rot: boolean, turnedOnce = false): Plan | null {
  const it = held.item
  const d = dims({ ...it, rot })
  const others = s.items.filter(o => o.id !== it.id)
  const m: Box = { ...boxOf({ ...it, rot }), x: Math.max(0, Math.min(W - d.w, x)), y: Math.max(0, Math.min(H - d.h, y)) }
  if (d.w > W || d.h > H) return null

  // Dropped squarely onto something of the same shape: they trade places.
  const hits = others.filter(o => { const b = boxOf(o); return b.x < m.x + m.w && m.x < b.x + b.w && b.y < m.y + m.h && m.y < b.y + b.h })
  if (hits.length === 1 && !m.cells && !boxOf(hits[0]).cells) {
    const hb = boxOf(hits[0])
    if (hb.x === m.x && hb.y === m.y && hb.w === m.w && hb.h === m.h)
      return { x: m.x, y: m.y, rot, moves: [{ id: hits[0].id, x: held.from.x, y: held.from.y, rot: hits[0].rot !== (held.from.rot !== rot) }] }
  }

  const res = drop(W, H, others.map(boxOf), m, { x: held.from.x, y: held.from.y })
  if (res) {
    const [me, ...rest] = res
    return { x: me.x, y: me.y, rot, moves: rest.map(r => ({ id: r.id, x: r.x, y: r.y, rot: !!r.rot })) }
  }
  if (!turnedOnce && !same(m)) return planDrop(s, held, x, y, !rot, true)
  return null
}

export function applyDrop(s: State, held: Held, plan: Plan) {
  for (const mv of plan.moves) Object.assign(find(s, mv.id)!, { x: mv.x, y: mv.y, rot: mv.rot })
  Object.assign(held.item, { x: plan.x, y: plan.y, rot: plan.rot })
}

/** Nothing happened: the item goes back where it was. */
export const putBack = (held: Held) => Object.assign(held.item, held.from)

/** After sizes or kinds changed under a saved layout: drop things that no longer exist, and re-place anything that now overlaps or hangs off the field. */
export function settle(s: State): State {
  const kept: Item[] = []
  for (const it of s.items) {
    if (!KINDS[it.kind]) continue
    const b = boxOf(it)
    const fits = b.x >= 0 && b.y >= 0 && b.x + b.w <= W && b.y + b.h <= H && !kept.some(o => overlaps(boxOf(o), b))
    if (fits) { kept.push(it); continue }
    const spot = firstFree(W, H, kept.map(boxOf), { ...boxOf({ ...it, rot: false }), x: 0, y: 0 })
    if (spot) kept.push({ ...it, x: spot.x, y: spot.y, rot: spot.turned })
  }
  return { ...s, items: kept }
}

/** Put a new thing of this kind on the first free spot of the field (turned if that is the only way it fits). Null if there is no room. */
export function spawn(s: State, kind: string): Item | null {
  const spot = firstFree(W, H, s.items.map(boxOf), shapeOf(kind))
  if (!spot) return null
  const it: Item = { id: s.next++, kind, x: spot.x, y: spot.y, rot: spot.turned }
  s.items.push(it)
  return it
}

export function start(): State {
  const s: State = { items: [], next: 1 }
  const put = (kind: string, x: number, y: number, rot = false) => s.items.push({ id: s.next++, kind, x, y, rot })
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
