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

console.log('grid ok')
