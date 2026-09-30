import assert from 'node:assert/strict'
import { drop, firstFree, overlaps, pack, touches, turn, type Box } from './grid.ts'

const b = (id: number, x: number, y: number, w = 1, h = 1): Box => ({ id, x, y, w, h })
const run = (W: number, H: number, others: Box[], m: Box, toward?: { x: number; y: number }) => {
  const out = drop(W, H, others, m, toward)
  return out && Object.fromEntries(out.map(o => [o.id, [o.x, o.y, o.w, o.h]]))
}

// Empty spot: nothing else moves.
assert.deepEqual(run(3, 3, [b(1, 0, 0)], b(9, 2, 2)), { 9: [2, 2, 1, 1] })
// Off the edge: pulled back in.
assert.deepEqual(run(3, 3, [], b(9, 2, 2, 2, 1)), { 9: [1, 2, 2, 1] })

// A shove beats a hop: the bar under the drop slides down one.
assert.deepEqual(run(2, 3, [b(1, 0, 0), b(2, 0, 1, 2, 1)], b(9, 0, 1, 2, 1)), { 9: [0, 1, 2, 1], 2: [0, 2, 2, 1] })
// Shoves chain: dropping at the front of a row nudges the whole row along.
assert.deepEqual(run(4, 1, [b(1, 0, 0), b(2, 1, 0), b(3, 2, 0)], b(9, 0, 0)), { 9: [0, 0, 1, 1], 1: [1, 0, 1, 1], 2: [2, 0, 1, 1], 3: [3, 0, 1, 1] })
// Full row: A (from 0) dropped onto C slides C and B back into the gap A left, keeping their order.
assert.deepEqual(run(3, 1, [b(2, 1, 0), b(3, 2, 0)], b(1, 2, 0), { x: 0, y: 0 }), { 1: [2, 0, 1, 1], 3: [1, 0, 1, 1], 2: [0, 0, 1, 1] })

// Nowhere to shove: the one in the way hops to the nearest gap (here, the far corner).
const full = [b(1, 0, 0), b(2, 1, 0), b(3, 2, 0), b(4, 0, 1), b(5, 1, 1), b(6, 2, 1), b(7, 0, 2), b(8, 1, 2)]
assert.deepEqual(run(3, 3, full, b(9, 0, 0)), { 9: [0, 0, 1, 1], 1: [2, 2, 1, 1] })

// A long thing that only fits turned gets turned when it hops.
assert.deepEqual(run(2, 2, [b(1, 0, 0, 2, 1)], b(9, 0, 0, 1, 1)), { 9: [0, 0, 1, 1], 1: [0, 1, 2, 1] })

// Free cells exist but are split up: everything reshuffles.
assert.deepEqual(run(3, 2, [b(1, 1, 0), b(2, 0, 1), b(3, 2, 1)], b(9, 0, 0, 2, 1)) !== null, true)
// Truly full: no.
assert.equal(run(2, 1, [b(1, 0, 0), b(2, 1, 0)], b(9, 0, 0)), null)

// Touching means sharing an edge.
assert.equal(touches(b(1, 0, 0), b(2, 1, 0)), true)
assert.equal(touches(b(1, 0, 0), b(2, 1, 1)), false)
assert.equal(touches(b(1, 0, 0, 2, 1), b(2, 1, 1)), true)

// Packing fills from the top-left and turns what only fits turned.
assert.deepEqual(pack(2, 3, [b(1, 0, 0, 2, 2), b(2, 0, 0, 2, 1)]), [b(1, 0, 0, 2, 2), b(2, 0, 2, 2, 1)])
assert.deepEqual(pack(1, 3, [b(1, 0, 0, 2, 1)]), [{ ...b(1, 0, 0, 1, 2), rot: true }])
assert.equal(pack(2, 2, [b(1, 0, 0, 2, 2), b(2, 0, 0)]), null)

// Irregular shapes: an L (cells 0,0 0,1 1,1) leaves its empty corner free, and turns a quarter clockwise.
const L: Box = { id: 1, x: 0, y: 0, w: 2, h: 2, cells: [[0, 0], [0, 1], [1, 1]] }
assert.equal(overlaps(L, b(2, 1, 0)), false)
assert.equal(overlaps(L, b(2, 1, 1)), true)
assert.equal(touches(L, b(2, 1, 0)), true) // the free corner still has L on two sides
assert.deepEqual(turn(L).cells, [[1, 0], [0, 0], [0, 1]])
assert.deepEqual(firstFree(2, 2, [b(2, 1, 0)], L), { x: 0, y: 0, turned: false }) // fits round a 1x1 in its corner
assert.equal(firstFree(2, 2, [b(2, 0, 0)], L), null)
// A 1x1 dropped into an L's empty corner needs no shove.
assert.deepEqual(run(2, 2, [L], b(9, 1, 0)), { 9: [1, 0, 1, 1] })

// Cell-accurate shoving: an L whose empty corner is where the dropped thing lands is not moved at all, and a shove moves it
// only as far as its shape needs.
{
  const L2: Box = { id: 1, x: 0, y: 0, w: 3, h: 3, cells: [[0, 0], [1, 0], [2, 0], [0, 1], [0, 2]] } // a big corner, empty inside
  assert.deepEqual(run(3, 3, [L2], b(9, 2, 2)), { 9: [2, 2, 1, 1] })
  const r = drop(5, 3, [{ ...L2, x: 1 }], b(9, 1, 0), { x: 3, y: 0 })! // lands on the L's top-left: it slides one cell right, no more
  const moved = r.find(x => x.id === 1)!
  assert.equal(moved.x, 2)
}

// A fuzz: random irregular things on a small field, random drops. Whatever comes back must be a valid layout: inside the field,
// nothing overlapping, the dropped thing where it was aimed (or turned), and nothing thrown across the field.
{
  let seed = 12345
  const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296 }
  const shape = (id: number): Box => {
    const w = 1 + Math.floor(rnd() * 3), h = 1 + Math.floor(rnd() * 3)
    const cells: [number, number][] = []
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (rnd() < 0.75) cells.push([x, y])
    if (!cells.length) cells.push([0, 0])
    const xs = cells.map(c => c[0]), ys = cells.map(c => c[1])
    const nx = Math.min(...xs), ny = Math.min(...ys)
    const norm = cells.map(([x, y]) => [x - nx, y - ny] as [number, number])
    return { id, x: 0, y: 0, w: Math.max(...norm.map(c => c[0])) + 1, h: Math.max(...norm.map(c => c[1])) + 1, cells: norm }
  }
  let dropped = 0, refused = 0
  for (let round = 0; round < 300; round++) {
    const W = 8, H = 6
    const items: Box[] = []
    for (let i = 1; i <= 2 + Math.floor(rnd() * 6); i++) {
      const s = shape(i)
      const spot = firstFree(W, H, items, s)
      if (spot) items.push({ ...(spot.turned ? turn(s) : s), x: spot.x, y: spot.y })
    }
    const mine = items[Math.floor(rnd() * items.length)]
    const others = items.filter(o => o.id !== mine.id)
    const m: Box = { ...mine, x: Math.floor(rnd() * (W - mine.w + 1)), y: Math.floor(rnd() * (H - mine.h + 1)) }
    const out = drop(W, H, others, m, { x: mine.x, y: mine.y })
    if (!out) { refused++; continue }
    dropped++
    const all = [out[0], ...others.map(o => out.find(x => x.id === o.id) ?? o)] // drop() lists only what moved
    for (const a of all) assert.ok(a.x >= 0 && a.y >= 0 && a.x + a.w <= W && a.y + a.h <= H, 'inside the field')
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) assert.equal(overlaps(all[i], all[j]), false, 'no overlaps')
    assert.equal(all[0].id, mine.id)
    assert.deepEqual([all[0].x, all[0].y], [m.x, m.y], 'the dropped thing lands where it was aimed')
    for (const o of others) { const now = all.find(x => x.id === o.id)!; assert.ok(Math.abs(now.x - o.x) + Math.abs(now.y - o.y) <= W + H, 'nothing is thrown across the field') }
  }
  assert.ok(dropped > 200, `most drops work (${dropped} of 300, ${refused} refused)`)
}

console.log('grid ok')
