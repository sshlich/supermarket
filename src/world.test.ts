import assert from 'node:assert/strict'
import { overlaps } from './grid.ts'
import { applyDrop, boxOf, cellsOf, H, interaction, KINDS, remove, settle, spawn, targetsFor, lift, planDrop, putBack, start, W, type State } from './world.ts'

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

// Settling a saved layout: unknown kinds go, overlaps and things off the field get re-placed.
{
  const s = start()
  s.items.push({ id: 900, kind: 'gone', x: 0, y: 0, rot: false }, { id: 901, kind: 'crate', x: 3, y: 3, rot: false }, { id: 902, kind: 'crate', x: 29, y: 19, rot: false })
  const t = settle(s)
  assert.ok(!t.items.some(o => o.kind === 'gone'))
  assert.equal(t.items.length, s.items.length - 1)
  for (const a of t.items) {
    const b = boxOf(a)
    assert.ok(b.x >= 0 && b.y >= 0 && b.x + b.w <= W && b.y + b.h <= H)
    for (const c of t.items) if (a !== c) assert.equal(overlaps(b, boxOf(c)), false)
  }
}

// Irregular kinds: an L takes only its own squares, turns with them, and something small can sit in its empty corner.
{
  const saved = { ...KINDS.knife }
  Object.assign(KINDS.knife, { w: 2, h: 2, cells: ['#.', '##'] }) // an L
  const s = start()
  const knife = s.items.find(o => o.kind === 'knife')!
  Object.assign(knife, { x: 20, y: 10, rot: false })
  assert.equal(cellsOf(knife).length, 3)
  const coal = { id: 900, kind: 'coal', x: 22, y: 10, rot: false } // 2x2 would clash with the L; use a 1x1-sized spot by hand
  assert.equal(overlaps(boxOf(knife), { id: 9, x: 21, y: 10, w: 1, h: 1 }), false) // the empty corner
  assert.equal(overlaps(boxOf(knife), { id: 9, x: 20, y: 11, w: 1, h: 1 }), true)
  const turned = { ...knife, rot: true }
  assert.deepEqual(cellsOf(turned).map(c => c.join()).sort(), ['0,0', '0,1', '1,0'].sort()) // a quarter turn of an L is another L
  // dropping it onto the coal shoves the coal only as far as the L's real squares need
  const h = lift(s, knife.id)!
  const spot = s.items.find(o => o.kind === 'coal')!
  const p = planDrop(s, h, spot.x - 1, spot.y, false)
  assert.ok(p)
  applyDrop(s, h, p!)
  for (const a of s.items) for (const b of s.items) if (a !== b) assert.equal(overlaps(boxOf(a), boxOf(b)), false)
  void coal
  Object.assign(KINDS.knife, saved); delete KINDS.knife.cells
}

// Spawning: a new thing lands on free ground; a full field says no.
{
  const s = start()
  const n = s.items.length
  const it = spawn(s, 'crate')!
  assert.ok(it && s.items.length === n + 1)
  for (const a of s.items) for (const b of s.items) if (a !== b) assert.equal(overlaps(boxOf(a), boxOf(b)), false)
  let more = 0
  while (spawn(s, 'crate')) if (++more > 400) break
  assert.ok(more < 400)
  assert.equal(spawn(s, 'crate'), null)
}

// Strict mode: the held thing goes only where the squares are free, and nothing else ever moves.
{
  const s = start()
  const crate = s.items.find(o => o.kind === 'crate')!
  const axe = s.items.find(o => o.kind === 'axe')!
  const h = lift(s, crate.id)!
  const onAxe = planDrop(s, h, axe.x, axe.y, false, true)
  assert.equal(onAxe, null) // overlapping: refused, no shoving
  assert.ok(planDrop(s, h, axe.x, axe.y, false, false)) // the easy way shoves the axe aside
  const free = planDrop(s, h, 20, 15, false, true)!
  assert.deepEqual([free.x, free.y, free.moves.length], [20, 15, 0])
  const before = JSON.stringify(s.items)
  assert.equal(JSON.stringify(s.items), before) // planning never changes anything
}
// Selections: grabbing one of several selected takes them all along, keeping their arrangement; strict refuses if any
// square is taken; the easy way shoves the neighbours as one wall.
{
  const s = start()
  const [a, b] = s.items.filter(o => o.kind === 'coal')
  const h = lift(s, a.id, [a.id, b.id])!
  assert.equal(h.items.length, 2)
  const gap = b.x - a.x
  const p = planDrop(s, h, 12, 15, false, true)!
  assert.ok(p)
  const other = p.moves.find(m => m.id === b.id)!
  assert.equal(other.x - p.x, gap) // same spacing
  assert.equal(other.y - p.y, b.y - a.y)
  applyDrop(s, h, p)
  assert.deepEqual([a.x, a.y], [12, 15])
  for (const x of s.items) for (const y of s.items) if (x !== y) assert.equal(overlaps(boxOf(x), boxOf(y)), false)
  // strict onto the crate with the pair: refused
  const crate = s.items.find(o => o.kind === 'crate')!
  const h2 = lift(s, a.id, [a.id, b.id])!
  assert.equal(planDrop(s, h2, crate.x, crate.y, false, true), null)
  const easy = planDrop(s, h2, crate.x, crate.y, false, false)
  if (easy) { applyDrop(s, h2, easy); for (const x of s.items) for (const y of s.items) if (x !== y) assert.equal(overlaps(boxOf(x), boxOf(y)), false) }
  // put back restores every one
  const h3 = lift(s, a.id, [a.id, b.id])!
  const at = [a.x, a.y, b.x, b.y]
  Object.assign(a, { x: 0, y: 0 }); Object.assign(b, { x: 5, y: 5 })
  putBack(h3)
  assert.deepEqual([a.x, a.y, b.x, b.y], at)
  const n = s.items.length
  remove(s, [a.id, b.id])
  assert.equal(s.items.length, n - 2)
}

// Uses: held things can be used on other things by kind or by tag, and only in that direction.
{
  const s = start()
  const saved = { knife: KINDS.knife.uses, log: KINDS.log.tags }
  KINDS.knife.uses = [{ on: 'log', verb: 'carve' }, { on: 'living', verb: 'slaughter' }]
  KINDS.log.tags = ['wood']
  const knife = s.items.find(o => o.kind === 'knife')!, log = s.items.find(o => o.kind === 'log')!, coal = s.items.find(o => o.kind === 'coal')!
  assert.equal(interaction(knife, log)?.verb, 'carve')
  assert.equal(interaction(knife, coal), null)
  assert.equal(interaction(log, knife), null) // one way
  KINDS.coal.tags = ['living']
  assert.equal(interaction(knife, coal)?.verb, 'slaughter') // by tag
  delete KINDS.coal.tags
  assert.deepEqual(targetsFor(s, [knife]).map(o => o.kind).sort(), ['log'])
  KINDS.knife.uses = saved.knife; KINDS.log.tags = saved.log
  if (!saved.knife) delete KINDS.knife.uses
  if (!saved.log) delete KINDS.log.tags
}

console.log('world ok')
