// Where things go in a container grid when you drop, send or tidy. Pure geometry, no game rules.

/** A footprint: its bounding box, and, if it isn't a plain rectangle, the filled cells inside it (relative to x, y). `rot` is which way round it currently is. */
export interface Box { id: number; x: number; y: number; w: number; h: number; cells?: readonly (readonly [number, number])[]; rot?: boolean }

/** The same footprint turned a quarter, about its own box. */
export const turn = (b: Box): Box => {
  const t: Box = { ...b, w: b.h, h: b.w, rot: !b.rot }
  if (b.cells) t.cells = b.cells.map(([x, y]) => [b.h - 1 - y, x] as const)
  return t
}
/** A footprint that looks the same turned (so there's no point trying). */
export const same = (b: Box) => b.w === b.h && !b.cells

const filled = (b: Box): [number, number][] => {
  if (b.cells) return b.cells.map(([x, y]) => [b.x + x, b.y + y])
  const out: [number, number][] = []
  for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) out.push([b.x + x, b.y + y])
  return out
}

export const overlaps = (a: Box, b: Box) => {
  if (!(a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h)) return false
  if (!a.cells && !b.cells) return true
  const mine = new Set(filled(a).map(([x, y]) => `${x},${y}`))
  return filled(b).some(([x, y]) => mine.has(`${x},${y}`))
}
const inside = (W: number, H: number, b: Box) => b.x >= 0 && b.y >= 0 && b.x + b.w <= W && b.y + b.h <= H

/** Share an edge (not just a corner). */
export const touches = (a: Box, b: Box) => a.cells || b.cells
  ? filled(a).some(([ax, ay]) => filled(b).some(([bx, by]) => Math.abs(ax - bx) + Math.abs(ay - by) === 1))
  : ((a.x + a.w === b.x || b.x + b.w === a.x) && a.y < b.y + b.h && b.y < a.y + a.h) ||
  ((a.y + a.h === b.y || b.y + b.h === a.y) && a.x < b.x + b.w && b.x < a.x + a.w)

/** Nearest free spot to where `b` is now (either way round; turning costs a step). */
export function nearest(W: number, H: number, taken: Box[], b: Box): Box | null {
  let best: Box | null = null
  let bestCost = Infinity
  for (const [v, cost0] of same(b) ? [[b, 0] as const] : [[b, 0] as const, [turn(b), 1] as const]) {
    for (let y = 0; y + v.h <= H; y++) {
      for (let x = 0; x + v.w <= W; x++) {
        const c = { ...v, x, y }
        const cost = Math.abs(x - b.x) + Math.abs(y - b.y) + cost0
        if (cost < bestCost && !taken.some(t => overlaps(t, c))) { best = c; bestCost = cost }
      }
    }
  }
  return best
}

/** First free spot for a footprint in reading order, as-is first, then turned. */
export function firstFree(W: number, H: number, taken: Box[], shape: Box): { x: number; y: number; turned: boolean } | null {
  for (const [v, turned] of same(shape) ? [[shape, false] as const] : [[shape, false] as const, [turn(shape), true] as const]) {
    for (let y = 0; y + v.h <= H; y++)
      for (let x = 0; x + v.w <= W; x++)
        if (!taken.some(t => overlaps(t, { ...v, id: -1, x, y }))) return { x, y, turned }
  }
  return null
}

const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]] as const

/**
 * Shove everything `m` lands on one direction, a cell at a time, chaining into whatever those hit. Cell by cell (not box by
 * box) so an irregular thing gives way only as far as its actual shape needs, and slides past a neighbour's empty corner.
 */
function push(W: number, H: number, others: Box[], m: Box, [dx, dy]: readonly [number, number]): Box[] | null {
  const pos = others.map(o => ({ ...o }))
  // Things further along the push are settled after things nearer to it.
  pos.sort((a, b) => dx ? (a.x - b.x) * dx : (a.y - b.y) * dy)
  const pushers: Box[] = [m]
  for (const o of pos) {
    let moved = false
    while (pushers.some(p => overlaps(o, p))) {
      o.x += dx; o.y += dy
      moved = true
      if (!inside(W, H, o)) return null
    }
    if (moved) pushers.push(o)
  }
  // A shape can wrap round something that sorts later; if anything still touches, this direction does not work.
  const all = [m, ...pos]
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) if (overlaps(all[i], all[j])) return null
  return pos.filter(p => { const o = others.find(o => o.id === p.id)!; return p.x !== o.x || p.y !== o.y })
}

/** Each thing `m` lands on hops to the nearest free spot. */
function relocate(W: number, H: number, others: Box[], m: Box, hits: Box[]): Box[] | null {
  const taken = [m, ...others.filter(o => !hits.includes(o))]
  const out: Box[] = []
  for (const h of [...hits].sort((a, b) => b.w * b.h - a.w * a.h)) {
    const s = nearest(W, H, taken, h)
    if (!s) return null
    taken.push(s)
    out.push(s)
  }
  return out
}

/** Last resort: everyone else re-settles around `m`, each as close to where it was as it can. */
function reflow(W: number, H: number, others: Box[], m: Box): Box[] | null {
  let best: Box[] | null = null
  for (const order of [(a: Box, b: Box) => a.y - b.y || a.x - b.x, (a: Box, b: Box) => b.w * b.h - a.w * a.h]) {
    const taken = [m]
    let ok = true
    for (const o of [...others].sort(order)) {
      const s = nearest(W, H, taken, o)
      if (!s) { ok = false; break }
      taken.push(s)
    }
    if (ok && (!best || cost(others, taken.slice(1)) < cost(others, best))) best = taken.slice(1)
  }
  return best && best.filter(b => { const o = others.find(o => o.id === b.id)!; return b.x !== o.x || b.y !== o.y || !!b.rot !== !!o.rot })
}

function cost(others: Box[], moves: Box[]) {
  let n = 0
  for (const b of moves) {
    const o = others.find(o => o.id === b.id)!
    n += Math.abs(b.x - o.x) + Math.abs(b.y - o.y) + (!!b.rot !== !!o.rot ? 1 : 0)
  }
  return n
}

/**
 * Drop `m` (already at its target spot) among `others`. Returns the new spots of `m` and of everything
 * that has to make way, or null if it can't fit. Things move as little as possible: a straight shove,
 * else a hop to the nearest gap, else everyone shuffles. `toward` breaks ties: shove toward that point
 * (the spot the dragged thing left).
 */
export function drop(W: number, H: number, others: Box[], m: Box, toward?: { x: number; y: number }): Box[] | null {
  m = { ...m, x: Math.max(0, Math.min(W - m.w, m.x)), y: Math.max(0, Math.min(H - m.h, m.y)) }
  if (m.w > W || m.h > H) return null
  const hits = others.filter(o => overlaps(o, m))
  if (!hits.length) return [m]

  let best: Box[] | null = null
  let bestCost = Infinity
  const consider = (moves: Box[] | null, extra: number) => {
    if (!moves) return
    const c = cost(others, moves) + extra
    if (c < bestCost) { best = moves; bestCost = c }
  }
  const dirs = toward ? [...DIRS].sort((a, b) => lean(b, m, toward) - lean(a, m, toward)) : DIRS
  for (const d of dirs) consider(push(W, H, others, m, d), 0)
  consider(relocate(W, H, others, m, hits), 2 * hits.length) // hopping reads worse than shoving
  if (!best) consider(reflow(W, H, others, m), 0)
  return best && [m, ...best as Box[]]
}

const lean = ([dx, dy]: readonly [number, number], m: Box, t: { x: number; y: number }) => dx * Math.sign(t.x - m.x) + dy * Math.sign(t.y - m.y)

/** Pack boxes (in the given order) from the top-left, turning any that only fit turned. */
export function pack(W: number, H: number, boxes: Box[]): Box[] | null {
  const out: Box[] = []
  for (const b of boxes) {
    const s = firstFree(W, H, out, b)
    if (!s) return null
    out.push({ ...(s.turned ? turn(b) : b), x: s.x, y: s.y })
  }
  return out
}
