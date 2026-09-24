export type Size = 1 | 2 | 3
export interface Item { id: string; size: Size; pos: number } // pos = leftmost socket
export interface Row { items: Item[]; lo: number; hi: number } // unlocked sockets lo..hi, inclusive

export const SOCKETS = 10

/**
 * Where every item in `row` ends up if `item` is dropped with its left edge on `target`.
 * `from` is the item's current socket when it moves within this row (undefined = comes from elsewhere).
 * Items keep their order and move as little as possible; returns null if it can't fit.
 *
 * Moving right onto a card puts you after it (it shifts left into the gap you left), moving left
 * puts you before it. Coming from another row, an overlapped card goes to whichever side its
 * center is on, falling back to the other side if there's no room.
 */
export function place(row: Row, item: { id: string; size: Size }, target: number, from?: number): Map<string, number> | null {
  const others = row.items.filter(i => i.id !== item.id).sort((a, b) => a.pos - b.pos)
  const dir = from === undefined ? 0 : Math.sign(target - from)
  const end = target + item.size
  const overlaps = (o: Item) => o.pos < end && o.pos + o.size > target
  const leftRoom = target - row.lo - others.filter(o => !overlaps(o) && o.pos < target).reduce((n, o) => n + o.size, 0)

  const left: Item[] = []
  const right: Item[] = []
  for (const o of others) {
    let goesLeft: boolean
    if (!overlaps(o)) goesLeft = o.pos < target
    else if (dir !== 0) goesLeft = dir > 0
    else goesLeft = o.pos * 2 + o.size <= target * 2 + item.size && o.size <= leftRoom
    ;(goesLeft ? left : right).push(o)
  }

  // Keep the item where it was dropped if possible, otherwise the nearest spot where everything fits.
  for (let k = 0; k < SOCKETS; k++) {
    for (const p of k ? [target - k, target + k] : [target]) {
      const out = pack(p)
      if (out) return out
    }
  }
  return null

  function pack(p: number) {
    // ponytail: the whole left/right split is fixed up front; only the dropped item's spot is searched.
    if (p < row.lo || p + item.size - 1 > row.hi) return null
    const out = new Map([[item.id, p]])
    let limit = p
    for (let i = left.length - 1; i >= 0; i--) {
      const q = Math.min(left[i].pos, limit - left[i].size)
      if (q < row.lo) return null
      out.set(left[i].id, q)
      limit = q
    }
    limit = p + item.size
    for (const o of right) {
      const q = Math.max(o.pos, limit)
      if (q + o.size - 1 > row.hi) return null
      out.set(o.id, q)
      limit = q + o.size
    }
    return out
  }
}

/**
 * `item` (currently in `from`) doesn't fit into `to` by pushing, so it takes sockets `target..` and
 * whatever it covers goes back to `from`, starting where `item` was. Null if those don't fit either.
 */
export function swap(to: Row, from: Row, item: Item, target: number) {
  const { t, items: covered } = under(to, item, target)
  const toPos = new Map(to.items.filter(o => !covered.includes(o)).map(o => [o.id, o.pos]))
  toPos.set(item.id, t)

  let rest = from.items.filter(o => o.id !== item.id).map(o => ({ ...o }))
  let at = item.pos
  for (const c of covered) {
    const out = place({ ...from, items: rest }, c, at)
    if (!out) return null
    rest = [...rest, { ...c }].map(o => ({ ...o, pos: out.get(o.id)! }))
    at = out.get(c.id)! + c.size
  }
  return { to: toPos, from: new Map(rest.map(o => [o.id, o.pos])), covered }
}

const clamp = (row: Row, size: number, target: number) => Math.max(row.lo, Math.min(row.hi - size + 1, target))

/** Items other than `item` under it with its left edge on `target` (pulled into the unlocked range), and whether it covers all of them completely. */
export function under(row: Row, item: { id: string; size: Size }, target: number) {
  const t = clamp(row, item.size, target)
  const items = row.items.filter(o => o.id !== item.id && o.pos < t + item.size && o.pos + o.size > t).sort((a, b) => a.pos - b.pos)
  return { t, items, full: items.length > 0 && items.every(o => o.pos >= t && o.pos + o.size <= t + item.size) }
}

/**
 * Dropped squarely over whole items: they trade places with it, landing left-aligned in the sockets it
 * vacated in `from` (which may be `to`). Null unless the drop fully covers at least one item.
 */
export function exchange(to: Row, from: Row, item: Item, target: number) {
  const { t, items: covered, full } = under(to, item, target)
  if (!full) return null
  const toPos = new Map(to.items.filter(o => o.id !== item.id && !covered.includes(o)).map(o => [o.id, o.pos]))
  toPos.set(item.id, t)
  const fromPos = to === from ? toPos : new Map(from.items.filter(o => o.id !== item.id).map(o => [o.id, o.pos]))
  // Vacated sockets: its old spot, minus any overlap with the new one when it moved within the row.
  let at = to === from && t < item.pos ? Math.max(item.pos, t + item.size) : item.pos
  for (const c of covered) {
    fromPos.set(c.id, at)
    at += c.size
  }
  return { to: toPos, from: fromPos, covered }
}

/** Leftmost unlocked spot where `size` fits without moving anything, or null. */
export function firstFree(row: Row, size: number): number | null {
  for (let p = row.lo; p + size - 1 <= row.hi; p++) if (!row.items.some(o => o.pos < p + size && o.pos + o.size > p)) return p
  return null
}

/**
 * Where `item` goes in `row` with the least shuffling, when the exact spot doesn't matter (the stash).
 * Every drop spot is tried, pushing the others aside in order, and the arrangement that moves them least
 * wins: a free gap costs nothing, otherwise the row compacts to open one. Null if it doesn't fit even then.
 */
export function bestFit(row: Row, item: { id: string; size: Size }): Map<string, number> | null {
  let best: Map<string, number> | null = null
  let cost = Infinity
  for (let t = row.lo; t + item.size - 1 <= row.hi; t++) {
    const out = place(row, item, t)
    if (!out) continue
    const moved = row.items.reduce((n, o) => n + (o.id === item.id ? 0 : Math.abs(out.get(o.id)! - o.pos)), 0)
    if (moved < cost) [best, cost] = [out, moved]
  }
  return best
}
