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

// Art: every layer fits its footprint, and turning the drawing four times gets it back.
{
  for (const [id, k] of Object.entries(KINDS)) {
    for (const l of k.art) {
      if (l.rows) { assert.equal(l.rows.length, k.h, id); for (const row of l.rows) assert.equal(row.length, k.w, id) }
      for (const [x, y] of l.at ?? []) assert.ok(x >= 0 && x <= k.w && y >= 0 && y <= k.h, id)
    }
  }
  const s = start()
  const axe = s.items.find(o => o.kind === 'axe')!
  const turned = artOf({ ...axe, rot: true })
  assert.equal(turned[0].rows!.length, 4)
  assert.equal(turned[0].rows![0].length, 6)
  assert.deepEqual(turnArt(['┌─', '│ ']), ['─┐', ' │']) // the corner ends up top right, opening down and left
  // a loose glyph at the top left ends up at the top right
  const [x, y] = artOf({ ...axe, rot: true })[2].at![0]
  assert.ok(Math.abs(x - (6 - 0.5)) < 1e-9 && Math.abs(y - 1.5) < 1e-9)
}

console.log('world ok')
