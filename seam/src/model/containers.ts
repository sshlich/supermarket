// Items in grids (DESIGN 10.2, 10.3), adapted from the workshop toy: piles, stowing, tidying, sending, and where a
// dragged item lands (onto a pile, a straight swap, a shove, turned, or into a recipe).

import { BOXES, KINDS, RECIPES, type Box, type Kind, type Recipe } from '../data/items.ts'
import { RELICS } from '../data/relics.ts'
import { drop as gridDrop, firstFree, overlaps, pack, type Box as Rect } from './grid.ts'
import type { Item, State } from './state.ts'

/** Every kind of thing, relics included. */
export const K: Record<string, Kind> = { ...KINDS, ...RELICS }
const ORDER = Object.keys(K)

export const dims = (it: Item) => { const k = K[it.kind]; return it.rot ? { w: k.h, h: k.w } : { w: k.w, h: k.h } }
export const rectOf = (it: Item): Rect => ({ id: it.id, x: it.x, y: it.y, ...dims(it) })

export function make(s: State, kind: string, extra: Partial<Item> = {}): Item {
  const k = K[kind]
  const it: Item = { id: s.next++, kind, x: 0, y: 0, rot: false, n: 1 }
  if (k.fresh !== undefined) it.fresh = k.fresh
  if (k.tool) it.cond = 100
  if ((k as { charges?: number }).charges) it.charges = (k as { charges?: number }).charges
  return Object.assign(it, extra)
}

/** Turn an item into another kind where it lies (a recipe, a charged cell). */
export function become(it: Item, kind: string, n = it.n) {
  const k = K[kind]
  for (const f of ['fresh', 'cond', 'rotten', 'props', 'runs', 'charges'] as const) delete it[f]
  Object.assign(it, { kind, n }, k.fresh !== undefined ? { fresh: k.fresh } : {}, k.tool ? { cond: 100 } : {})
  if (!K[kind].w || dims(it).w > BOXES.stores.w) it.rot = false
}

export function where(s: State, id: number): { box: Box; it: Item } | null {
  for (const box of Object.keys(s.C) as Box[]) {
    const it = s.C[box].find(o => o.id === id)
    if (it) return { box, it }
  }
  return null
}

export function remove(s: State, box: Box, it: Item, n = it.n) {
  it.n -= n
  if (it.n <= 0) s.C[box].splice(s.C[box].indexOf(it), 1)
}

// ---------------------------------------------------------------- piles

const same = (a?: object, b?: object) => JSON.stringify(a ?? {}) === JSON.stringify(b ?? {})
export const canMerge = (into: Item, it: Item) =>
  into.id !== it.id && into.kind === it.kind && into.n < K[it.kind].stack && !into.rotten === !it.rotten && same(into.props, it.props)

/** Move `take` of `it` onto `into`. A pile is as fresh as its stalest part. */
function mergeInto(into: Item, it: Item, take: number) {
  if (it.fresh !== undefined) into.fresh = Math.min(into.fresh ?? it.fresh, it.fresh)
  into.n += take
  it.n -= take
}

/** Put `it` into `box`: top up matching piles, then free spots (squeezing things together if needed). Returns what didn't fit. */
export function stow(s: State, box: Box, it: Item): number {
  const k = K[it.kind]
  const items = s.C[box]
  const { w: W, h: H } = BOXES[box]
  for (const o of items) if (it.n > 0 && canMerge(o, it)) mergeInto(o, it, Math.min(it.n, k.stack - o.n))
  let first = true
  while (it.n > 0) {
    let spot = firstFree(W, H, items.map(rectOf), k.w, k.h)
    if (!spot && tidy(s, box, { w: k.w, h: k.h })) spot = firstFree(W, H, items.map(rectOf), k.w, k.h)
    if (!spot) break
    const n = Math.min(it.n, k.stack)
    items.push({ ...it, id: first ? it.id : s.next++, n, x: spot.x, y: spot.y, rot: spot.turned })
    first = false
    it.n -= n
  }
  return it.n
}

/** Merge piles and pack the container neatly by kind. `room` also keeps a spot that size free. */
export function tidy(s: State, box: Box, room?: { w: number; h: number }): boolean {
  const items = s.C[box]
  const { w: W, h: H } = BOXES[box]
  const merged: Item[] = []
  for (const it of [...items].sort((a, b) => b.n - a.n)) {
    for (const o of merged) if (it.n > 0 && canMerge(o, it)) mergeInto(o, it, Math.min(it.n, K[it.kind].stack - o.n))
    if (it.n > 0) merged.push(it)
  }
  const plain = (it: Item): Rect => ({ id: it.id, x: 0, y: 0, w: K[it.kind].w, h: K[it.kind].h })
  const byKind = [...merged].sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind) || (a.fresh ?? 0) - (b.fresh ?? 0))
  const extra = room ? [{ id: -1, x: 0, y: 0, ...room }] : []
  const packed = pack(W, H, [...byKind.map(plain), ...extra]) ?? pack(W, H, [...byKind.map(plain), ...extra].sort((a, b) => b.w * b.h - a.w * a.h))
  items.length = 0
  if (!packed) { items.push(...merged); return false } // merging alone still helps
  for (const p of packed) {
    const it = merged.find(o => o.id === p.id)
    if (!it) continue
    Object.assign(it, { x: p.x, y: p.y, rot: p.w !== K[it.kind].w })
    items.push(it)
  }
  return true
}

/** Shift-click: send an item (or every item of its kind) to another container. */
export function send(s: State, id: number, to: Box, all = false): boolean {
  const at = where(s, id)
  if (!at || at.box === to) return false
  const src = s.C[at.box]
  let moved = false
  for (const it of all ? src.filter(o => o.kind === at.it.kind) : [at.it]) {
    src.splice(src.indexOf(it), 1)
    const was = it.n
    const left = stow(s, to, { ...it })
    if (left < was) moved = true
    if (left) src.push({ ...it, n: left, id: s.C[to].some(o => o.id === it.id) ? s.next++ : it.id })
  }
  return moved
}

// ---------------------------------------------------------------- dragging

/** What's in hand: an item lifted from its spot, or half a pile split off another (`from` null, id -1 until dropped). */
export interface Held { item: Item; from: { box: Box; x: number; y: number; rot: boolean } | null; splitOf?: number }
export interface Plan {
  box: Box
  x: number
  y: number
  rot: boolean
  moves: { id: number; box: Box; x: number; y: number; rot: boolean }[]
  merge?: number     // drops onto this pile instead
  recipe?: number    // makes something of this item instead
}

/** What would be in hand if `id` were picked up. Changes nothing. */
export function grab(s: State, id: number, split = false): Held | null {
  const at = where(s, id)
  if (!at) return null
  if (split && at.it.n > 1) return { item: { ...at.it, id: -1, n: Math.floor(at.it.n / 2) }, from: null, splitOf: at.it.id }
  return { item: at.it, from: { box: at.box, x: at.it.x, y: at.it.y, rot: at.it.rot } }
}

/** A recipe for dragging `a` onto `b`, if they have one and `a` can pay for it. */
export function recipeFor(a: Item, b: Item): Recipe | undefined {
  const r = RECIPES.find(r => r.drag === a.kind && r.onto === b.kind)
  return r && a.n >= (r.spend ?? 1) && !b.rotten && (a.cond === undefined || a.cond > 0) ? r : undefined
}
/** Recipes happen on the Workbench and in the pack (10.3). */
const CRAFT: Box[] = ['workbench', 'pack']

/** Where the held item goes if dropped with its top-left at (x, y): a recipe, a pile, a straight swap, a shove, or turned. */
export function planDrop(s: State, held: Held, box: Box, x: number, y: number, rot: boolean, turnedOnce = false): Plan | null {
  const it = held.item
  const { w: W, h: H } = BOXES[box]
  const d = dims({ ...it, rot })
  const others = s.C[box].filter(o => o.id !== it.id)
  const m: Rect = { id: it.id, x: Math.max(0, Math.min(W - d.w, x)), y: Math.max(0, Math.min(H - d.h, y)), w: d.w, h: d.h }
  if (d.w > W || d.h > H) return turnedOnce ? null : planDrop(s, held, box, x, y, !rot, true)
  const hits = others.filter(o => overlaps(rectOf(o), m))

  const target = CRAFT.includes(box) && hits.length === 1 && recipeFor(it, hits[0]) ? hits[0] : undefined
  if (target) return { box, x: target.x, y: target.y, rot: target.rot, moves: [], recipe: target.id }

  const pile = hits.find(o => canMerge(o, it))
  if (pile) return { box, x: pile.x, y: pile.y, rot: pile.rot, moves: [], merge: pile.id }

  // Dropped squarely onto something the same shape: they trade places.
  const from = held.from
  if (from && hits.length === 1) {
    const hb = rectOf(hits[0])
    if (hb.x === m.x && hb.y === m.y && hb.w === m.w && hb.h === m.h)
      return { box, x: m.x, y: m.y, rot, moves: [{ id: hits[0].id, box: from.box, x: from.x, y: from.y, rot: hits[0].rot !== (from.rot !== rot) }] }
  }

  const res = gridDrop(W, H, others.map(rectOf), m, from?.box === box ? { x: from.x, y: from.y } : undefined)
  if (res) {
    const [me, ...rest] = res
    return {
      box, x: me.x, y: me.y, rot,
      moves: rest.map(r => { const o = others.find(o => o.id === r.id)!; return { id: r.id, box, x: r.x, y: r.y, rot: r.w !== dims(o).w ? !o.rot : o.rot } }),
    }
  }
  if (!turnedOnce && d.w !== d.h) {
    const turned = planDrop(s, held, box, x, y, !rot, true)
    if (turned) return turned
  }
  // Can't make room here: the one thing in the way goes back where the held item came from, if it fits there.
  if (from && hits.length === 1) {
    const h = hits[0]
    const fromOthers = s.C[from.box].filter(o => o.id !== it.id && o.id !== h.id).map(rectOf)
    for (const hr of [h.rot, !h.rot]) {
      const spot = { id: h.id, x: from.x, y: from.y, ...dims({ ...h, rot: hr }) }
      const fits = spot.x + spot.w <= BOXES[from.box].w && spot.y + spot.h <= BOXES[from.box].h
      if (fits && !fromOthers.some(o => overlaps(o, spot)) && !(from.box === box && overlaps(spot, m)))
        return { box, x: m.x, y: m.y, rot, moves: [{ id: h.id, box: from.box, x: from.x, y: from.y, rot: hr }] }
    }
  }
  return null
}

/** Carry out a plan. A split-off half becomes a real item here. Returns what a recipe made, if one ran. */
export function applyDrop(s: State, held: Held, plan: Plan): { made?: string; wore?: Item; broke?: boolean } {
  const take = (id: number) => {
    const at = where(s, id)
    if (at) s.C[at.box].splice(s.C[at.box].indexOf(at.it), 1)
    return at?.it
  }
  let it = held.item
  if (held.splitOf !== undefined) {
    const orig = where(s, held.splitOf)
    if (!orig || orig.it.n <= it.n) return {}
    orig.it.n -= it.n
    it = { ...it, id: s.next++ }
  } else take(it.id)

  if (plan.recipe !== undefined) {
    const at = where(s, plan.recipe)!
    const r = recipeFor(it, at.it)!
    if (at.it.n > 1) { // one of a pile becomes the product, the rest stay
      at.it.n--
      stow(s, at.box, make(s, r.gives, { n: r.n }))
    } else become(at.it, r.gives, r.n)
    let broke = false
    if (r.wear && it.cond !== undefined) {
      it.cond = Math.max(0, it.cond - r.wear)
      if (it.cond === 0) { become(it, 'scrap', 1); broke = true } // a worn-out tool is scrap
    }
    it.n -= r.spend ?? 0
    if (it.n > 0) putBack(s, held, it)
    return { made: r.gives, wore: r.wear ? it : undefined, broke }
  }
  if (plan.merge !== undefined) {
    const into = where(s, plan.merge)!.it
    mergeInto(into, it, Math.min(it.n, K[it.kind].stack - into.n))
    if (it.n > 0) putBack(s, held, it)
    return {}
  }
  for (const mv of plan.moves) {
    const o = take(mv.id)!
    Object.assign(o, { x: mv.x, y: mv.y, rot: mv.rot })
    s.C[mv.box].push(o)
  }
  Object.assign(it, { x: plan.x, y: plan.y, rot: plan.rot })
  s.C[plan.box].push(it)
  return {}
}

/** What's left in hand goes back: to its spot if it had one, else onto the pile it was split from (or wherever it fits). */
function putBack(s: State, held: Held, it: Item) {
  if (held.from) {
    if (!where(s, it.id)) { Object.assign(it, { x: held.from.x, y: held.from.y, rot: held.from.rot }); s.C[held.from.box].push(it) }
    return
  }
  const orig = held.splitOf !== undefined ? where(s, held.splitOf) : null
  if (orig && canMerge(orig.it, it)) orig.it.n += it.n
  else if (orig) stow(s, orig.box, it)
}
