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
  const t = Math.max(to.lo, Math.min(to.hi - item.size + 1, target))
  const covered = to.items.filter(o => o.pos < t + item.size && o.pos + o.size > t).sort((a, b) => a.pos - b.pos)
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
