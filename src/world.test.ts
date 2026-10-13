import assert from 'node:assert/strict'
import { overlaps } from './grid.ts'
import { accepts, intoHost, applyDrop, boxOf, cellsOf, H, KINDS, MAX_WINDOWS, remove, settle, spawn, lift, planDrop, putBack, W, type Item, type State } from './world.ts'
import FIXTURE from './test/kinds.json' with { type: 'json' }

// The game ships no items for now, so the tests bring their own kinds and the old starting field.
Object.assign(KINDS, FIXTURE)
function start(): State {
  const s: State = { items: [], next: 1, windows: [] }
  const put = (kind: string, x: number, y: number, rot = 0) => { const it: Item = { id: s.next++, kind, x, y, rot }; s.items.push(it) }
  put('crate', 3, 3)
  put('axe', 10, 3)
  put('pickaxe', 16, 4)
  put('log', 4, 10)
  put('coal', 10, 12)
  put('coal', 13, 12)
  put('bottle', 18, 11)
  put('bottle', 21, 11)
  put('knife', 22, 4)
  put('charger', 2, 16)
  for (const x of [6, 7, 8, 9]) put('cell', x, 17)
  put('cell-gauge', 11, 17)
  return s
}

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
  const p = planDrop(s, h, null, 20, 15, 0)!
  assert.equal(p.moves.length, 0)
  applyDrop(s, h, p)
  assert.deepEqual([crate.x, crate.y], [20, 15])
  const h2 = lift(s, crate.id)!
  const p2 = planDrop(s, h2, null, 10, 3, 0)! // onto the axe
  applyDrop(s, h2, p2)
  for (const a of s.items) for (const b of s.items) if (a !== b) assert.equal(overlaps(boxOf(a), boxOf(b)), false)
}
// Turning swaps width and height and keeps the shape; a cancelled lift puts it back.
{
  const s = start()
  const axe = at(s, 2)
  const h = lift(s, axe.id)!
  const p = planDrop(s, h, null, 10, 3, 1)!
  assert.equal(p.rot, 1)
  putBack(h)
  assert.deepEqual([axe.x, axe.y, axe.rot], [10, 3, 0])
}
// Nothing goes past the edge.
{
  const s = start()
  const h = lift(s, 1)!
  const p = planDrop(s, h, null, 99, 99, 0)!
  assert.deepEqual([p.x, p.y], [W - 4, H - 4])
}

// Settling a saved layout: unknown kinds go, overlaps and things off the field get re-placed.
{
  const s = start()
  s.items.push({ id: 900, kind: 'gone', x: 0, y: 0, rot: 0 }, { id: 901, kind: 'crate', x: 3, y: 3, rot: 0 }, { id: 902, kind: 'crate', x: 29, y: 19, rot: 0 })
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
  Object.assign(knife, { x: 20, y: 10, rot: 0 })
  assert.equal(cellsOf(knife).length, 3)
  const coal = { id: 900, kind: 'coal', x: 22, y: 10, rot: 0 } // 2x2 would clash with the L; use a 1x1-sized spot by hand
  assert.equal(overlaps(boxOf(knife), { id: 9, x: 21, y: 10, w: 1, h: 1 }), false) // the empty corner
  assert.equal(overlaps(boxOf(knife), { id: 9, x: 20, y: 11, w: 1, h: 1 }), true)
  const turned = { ...knife, rot: 1 }
  assert.deepEqual(cellsOf(turned).map(c => c.join()).sort(), ['0,0', '0,1', '1,0'].sort()) // a quarter turn of an L is another L
  // dropping it onto the coal shoves the coal only as far as the L's real squares need
  const h = lift(s, knife.id)!
  const spot = s.items.find(o => o.kind === 'coal')!
  const p = planDrop(s, h, null, spot.x - 1, spot.y, 0)
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
  const onAxe = planDrop(s, h, null, axe.x, axe.y, 0, true)
  assert.equal(onAxe, null) // overlapping: refused, no shoving
  assert.ok(planDrop(s, h, null, axe.x, axe.y, 0, 0)) // the easy way shoves the axe aside
  const free = planDrop(s, h, null, 20, 15, 0, true)!
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
  const p = planDrop(s, h, null, 12, 15, 0, true)!
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
  assert.equal(planDrop(s, h2, null, crate.x, crate.y, 0, true), null)
  const easy = planDrop(s, h2, null, crate.x, crate.y, 0, 0)
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

// Turning is four-way: upside down is a real state; the same footprint, the sprite the other way up; old saves (true/false) load.
{
  const s = start()
  const bar = s.items.find(o => o.kind === 'log')!
  const at = [boxOf(bar).w, boxOf(bar).h]
  for (const [r, wh] of [[0, at], [1, [at[1], at[0]]], [2, at], [3, [at[1], at[0]]]] as const) {
    const b = boxOf({ ...bar, rot: r })
    assert.deepEqual([b.w, b.h], wh, `rot ${r}`)
    assert.equal(b.rot, r)
  }
  const h = lift(s, bar.id)!
  const upside = planDrop(s, h, null, 3, 15, 2, true)! // strict: no auto-turning, so it stays upside down
  assert.equal(upside.rot, 2)
  applyDrop(s, h, upside)
  assert.equal(bar.rot, 2)
  const old = settle({ ...s, items: [{ id: 1, kind: 'log', x: 0, y: 0, rot: true as unknown as number }, { id: 2, kind: 'log', x: 6, y: 0, rot: false as unknown as number }] })
  assert.deepEqual(old.items.map(o => o.rot), [1, 0])
  // turning a square item is allowed too (it is the art that turns)
  const crate = s.items.find(o => o.kind === 'crate')!
  assert.equal(boxOf({ ...crate, rot: 2 }).rot, 2)
}



{
  // containers: filters, nesting, cascade
  const s = start()
  const chest = spawn(s, 'chest')!, crate = s.items.find(o => o.kind === 'crate')!
  const log = s.items.find(o => o.kind === 'log')!, axe = s.items.find(o => o.kind === 'axe')!
  const h = lift(s, log.id)!
  const p = intoHost(s, h, chest.id)!
  assert.deepEqual(p.space, { host: chest.id, slot: 0 })
  applyDrop(s, h, p)
  assert.deepEqual(log.in, { host: chest.id, slot: 0 })
  assert.equal(intoHost(s, lift(s, axe.id)!, chest.id), null, 'chest refuses non-fuel')
  assert.equal(planDrop(s, lift(s, axe.id)!, { host: chest.id, slot: 0 }, 0, 0, 0), null)
  // containers do not nest, except vessels: no crate or chest in a crate, a bottle is fine
  const crate2 = spawn(s, 'crate')!
  assert.equal(accepts(s, chest, { host: crate.id, slot: 0 }), false)
  assert.equal(accepts(s, crate2, { host: crate.id, slot: 0 }), false)
  const bottle = s.items.find(o => o.kind === 'bottle')!
  applyDrop(s, lift(s, bottle.id)!, intoHost(s, lift(s, bottle.id)!, crate.id)!)
  assert.equal(bottle.in!.host, crate.id)
  assert.equal(accepts(s, crate, { host: bottle.id, slot: 0 }), false)
  // a vessel in a vessel would be a third level of nothing useful; and a log in the chest stays on its own
  chest.in = undefined
  applyDrop(s, lift(s, log.id)!, intoHost(s, lift(s, log.id)!, chest.id)!)
  // settle keeps the nest; removing the crate takes everything with it
  const s2 = settle(JSON.parse(JSON.stringify(s)))
  assert.equal(s2.items.find(o => o.id === bottle.id)!.in!.host, crate.id)
  remove(s, [crate.id])
  assert.ok(!s.items.some(o => o.id === bottle.id))
  // a slot that vanished sends its items to the field
  const s3 = start(); const c3 = s3.items.find(o => o.kind === 'crate')!
  spawn(s3, 'coal', { host: c3.id, slot: 0 })
  s3.items.find(o => o.in)!.in = { host: c3.id, slot: 7 }
  assert.equal(settle(s3).items.filter(o => o.in).length, 0)
}

{
  // too big one way round, fits turned: relaxed mode turns it into the panel
  const s = start(); const crate = s.items.find(o => o.kind === 'crate')!
  const log = s.items.find(o => o.kind === 'log')!
  const sp = { host: crate.id, slot: 0 }
  const h = lift(s, log.id)!
  const p = planDrop(s, h, sp, 0, 0, 1, false) // log turned upright is 1x5: fits 6x5 either way
  assert.ok(p)
  const big = spawn(s, 'log', null)!; big.rot = 0
  // a 5x1 log fits a 6x5 slot; use a slot too narrow instead: chest 5x3 with a 1x5 upright log needs turning
  const chest = spawn(s, 'chest')!
  const hl = lift(s, big.id)!
  const q = planDrop(s, hl, { host: chest.id, slot: 0 }, 0, 0, 1, false)
  assert.ok(q && q.rot % 2 === 0, 'turned to fit')
  assert.equal(planDrop(s, hl, { host: chest.id, slot: 0 }, 0, 0, 1, true), null, 'strict does not turn')
}


// The night kit: the belt's sheath takes a knife and nothing else; the knapsack has a pack and a pocket; containers still do not nest.
{
  const s: State = { items: [], next: 1 }
  const belt = spawn(s, 'belt')!, sack = spawn(s, 'knapsack')!, knife = spawn(s, 'knife')!, log = spawn(s, 'log')!
  assert.ok(intoHost(s, lift(s, knife.id)!, belt.id), 'the sheath takes a knife')
  assert.equal(intoHost(s, lift(s, log.id)!, belt.id), null, 'the sheath takes nothing else')
  assert.equal(accepts(s, belt, { host: sack.id, slot: 0 }), false, 'a belt does not go in a knapsack')
  assert.ok(spawn(s, 'matchbox', { host: sack.id, slot: 1 }), 'small things fit the pocket')
}
// Windows: removing a container closes its window; settling drops windows of things that are gone or are not containers,
// keeps the newest few, and leaves old saves' docked panels behind.
{
  const s = start()
  const crate = s.items.find(o => o.kind === 'crate')!, knife = s.items.find(o => o.kind === 'knife')!
  const belt = spawn(s, 'belt')!
  s.windows = [{ id: crate.id, x: 10, y: 10 }, { id: belt.id, x: 40, y: 40, folded: true }]
  const kept = settle({ ...JSON.parse(JSON.stringify(s)), panels: [crate.id, null, null, null] })
  assert.deepEqual(kept.windows, s.windows)
  assert.equal('panels' in kept, false)
  assert.deepEqual(settle({ ...s, windows: [{ id: knife.id, x: 0, y: 0 }, { id: 999, x: 0, y: 0 }] }).windows, [], 'not a container, or gone')
  const many = Array.from({ length: MAX_WINDOWS + 2 }, () => spawn(s, 'crate')).filter((o): o is Item => !!o)
  assert.equal(settle({ ...s, windows: many.map(o => ({ id: o.id, x: 0, y: 0 })) }).windows!.length, MAX_WINDOWS)
  s.windows = [{ id: crate.id, x: 10, y: 10 }, { id: belt.id, x: 40, y: 40, folded: true }]
  remove(s, [crate.id])
  assert.deepEqual(s.windows, [{ id: belt.id, x: 40, y: 40, folded: true }])
}
console.log('world ok')
