import assert from 'node:assert/strict'
import { place, swap, type Item, type Size } from './board.ts'

const it = (id: string, size: Size, pos: number): Item => ({ id, size, pos })
const run = (items: Item[], id: string, target: number, same = true, lo = 0, hi = 9) => {
  const item = items.find(i => i.id === id) ?? { id, size: Number(id.slice(1)) as Size, pos: -1 }
  const out = place({ items: same ? items : items.filter(i => i.id !== id), lo, hi }, item, target, same ? item.pos : undefined)
  return out && Object.fromEntries([...out].sort((a, b) => a[1] - b[1]))
}

// Drag right onto a card: you land after it, it slides left into your old spot.
assert.deepEqual(run([it('A', 1, 0), it('B', 1, 1), it('C', 1, 2)], 'A', 2), { B: 0, C: 1, A: 2 })
// Drag left onto a card: you land before it, the rest shift right.
assert.deepEqual(run([it('A', 1, 0), it('B', 1, 1), it('C', 1, 2)], 'C', 0), { C: 0, A: 1, B: 2 })
// Moving into empty space leaves everyone else alone.
assert.deepEqual(run([it('A', 1, 0), it('B', 2, 2)], 'A', 6), { B: 2, A: 6 })
// Only the nearest gap gets used.
assert.deepEqual(run([it('A', 1, 0), it('B', 1, 2), it('C', 1, 3)], 'A', 3), { B: 1, C: 2, A: 3 })
// From another row: overlapped card goes to the side its center is on.
assert.deepEqual(run([it('B', 1, 3)], 'x2', 3, false), { B: 2, x2: 3 })
assert.deepEqual(run([it('B', 1, 4)], 'x2', 3, false), { x2: 3, B: 5 })
// ...unless there's no room there, then it goes the other way.
assert.deepEqual(run([it('A', 1, 0), it('B', 1, 1)], 'x1', 0, false, 0, 3), { x1: 0, A: 1, B: 2 })
// Dropped onto locked sockets: pulled into the unlocked range.
assert.deepEqual(run([], 'x1', 0, false, 2, 7), { x1: 2 })
assert.deepEqual(run([], 'x3', 9, false, 2, 7), { x3: 5 })
// No room at all.
assert.equal(run([it('A', 2, 2), it('B', 2, 4), it('C', 2, 6)], 'x1', 4, false, 2, 7), null)

console.log('board: ok')

// Swap: a medium from the stash onto a full board takes the two smalls' spot; they go where it was.
{
  const board = { items: [it('a', 1, 2), it('b', 1, 3), it('c', 2, 4), it('d', 2, 6)], lo: 2, hi: 7 }
  const stash = { items: [it('M', 2, 5), it('z', 1, 0)], lo: 0, hi: 9 }
  const out = swap(board, stash, stash.items[0], 2)!
  assert.deepEqual(Object.fromEntries(out.to), { c: 4, d: 6, M: 2 })
  assert.deepEqual(Object.fromEntries(out.from), { z: 0, a: 5, b: 6 })
  assert.deepEqual(out.covered.map(o => o.id), ['a', 'b'])
}
// Swap: a large onto a medium + small.
{
  const board = { items: [it('m', 2, 2), it('s', 1, 4), it('x', 3, 5)], lo: 2, hi: 7 }
  const stash = { items: [it('L', 3, 0)], lo: 0, hi: 9 }
  const out = swap(board, stash, stash.items[0], 2)!
  assert.deepEqual(Object.fromEntries(out.to), { x: 5, L: 2 })
  assert.deepEqual(Object.fromEntries(out.from), { m: 0, s: 2 })
}
// Swap fails if what's covered doesn't fit back.
{
  const board = { items: [it('a', 2, 0), it('b', 2, 2)], lo: 0, hi: 3 }
  const stash = { items: [it('S', 1, 0), it('y', 3, 1)], lo: 0, hi: 3 }
  assert.equal(swap(board, stash, stash.items[0], 0), null)
}

console.log('swap: ok')
