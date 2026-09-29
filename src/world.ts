// The field: a grid of cells with things on it. Nothing else yet.

import { drop, same, type Box } from './grid.ts'

export const W = 30
export const H = 20

export interface Kind { name: string; icon: string; color: string; w: number; h: number }

/** Sizes are in field cells. Every footprint is a plain rectangle. */
export const KINDS: Record<string, Kind> = {
  crate: { name: 'Crate', icon: 'wooden-crate', color: '#c9975a', w: 4, h: 4 },
  log: { name: 'Log', icon: 'log', color: '#b98552', w: 4, h: 2 },
  coal: { name: 'Coal', icon: 'coal-pile', color: '#8a90a0', w: 2, h: 2 },
  bottle: { name: 'Bottle', icon: 'jug', color: '#5aa8e6', w: 2, h: 4 },
  knife: { name: 'Knife', icon: 'bowie-knife', color: '#b4bfcc', w: 2, h: 4 },
  axe: { name: 'Axe', icon: 'battle-axe', color: '#b4bfcc', w: 4, h: 6 },
  pickaxe: { name: 'Pickaxe', icon: 'war-pick', color: '#a6b2c0', w: 6, h: 4 },
}

export interface Item { id: number; kind: string; x: number; y: number; rot: boolean }
export interface State { items: Item[]; next: number }

/** An item's footprint as the grid sees it. */
export const boxOf = (it: Item): Box => {
  const k = KINDS[it.kind]
  return { id: it.id, x: it.x, y: it.y, w: it.rot ? k.h : k.w, h: it.rot ? k.w : k.h, rot: it.rot }
}
export const dims = (it: Item) => { const b = boxOf(it); return { w: b.w, h: b.h } }

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
  if (hits.length === 1) {
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
