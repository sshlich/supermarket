import assert from 'node:assert/strict'
import { overlaps } from './grid.ts'
import { applyDrop, artOf, boxOf, H, KINDS, turnArt, lift, planDrop, putBack, start, W, type State } from './world.ts'

const at = (s: State, id: number) => s.items.find(o => o.id === id)!

// The starting field is valid: everything inside, nothing overlapping.
{
  const s = start()
  for (const a of s.items) {
    const b = boxOf(a)
    assert.ok(b.x >= 0 && b.y >= 0 && b.x + b.w <= W && b.y + b.h <= H)
    for (const c of s.items) if (a !== c) assert.equal(overlaps(b, boxOf(c)), false)
  }
}
// Dropping on empty floor just moves it; on something else, that gives way.
{
  const s = start()
  const crate = at(s, 1)
  const h = lift(s, crate.id)!
  const p = planDrop(s, h, 20, 15, false)!
  assert.equal(p.moves.length, 0)
  applyDrop(s, h, p)
  assert.deepEqual([crate.x, crate.y], [20, 15])
  const h2 = lift(s, crate.id)!
  const p2 = planDrop(s, h2, 10, 3, false)! // onto the axe
  applyDrop(s, h2, p2)
  for (const a of s.items) for (const b of s.items) if (a !== b) assert.equal(overlaps(boxOf(a), boxOf(b)), false)
}
// Turning swaps width and height and keeps the shape; a cancelled lift puts it back.
{
  const s = start()
  const axe = at(s, 2)
  const h = lift(s, axe.id)!
  const p = planDrop(s, h, 10, 3, true)!
  assert.equal(p.rot, true)
  putBack(h)
  assert.deepEqual([axe.x, axe.y, axe.rot], [10, 3, false])
}
// Nothing goes past the edge.
{
  const s = start()
  const h = lift(s, 1)!
  const p = planDrop(s, h, 99, 99, false)!
  assert.deepEqual([p.x, p.y], [W - 4, H - 4])
}

// Art: every kind's drawing fits its footprint, and turning it four times gets it back.
{
  for (const [id, k] of Object.entries(KINDS)) {
    assert.equal(k.art.length, k.h, id)
    for (const row of k.art) assert.equal(row.length, k.w, id)
    let a = k.art
    for (let i = 0; i < 4; i++) a = turnArt(a)
    assert.deepEqual(a, k.art, id)
  }
  const s = start()
  const axe = s.items.find(o => o.kind === 'axe')!
  const flat = artOf({ ...axe, rot: true })
  assert.equal(flat.length, 4)
  assert.equal(flat[0].length, 6)
  assert.deepEqual(turnArt(['┌─', '│ ']), ['─┐', ' │']) // the corner ends up top right, opening down and left
}

console.log('world ok')
