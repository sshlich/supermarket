import assert from 'node:assert/strict'
import { check, fly, launch, padStatus } from './fleet.ts'
import { accept, catchUp, offer } from './mail.ts'
import { accepts, advance, applyDrop, find, lift, planDrop, start, type Item, type State } from './world.ts'

const seeded = (seed: number) => () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
const first = (s: State, kind: string) => s.items.find(o => o.kind === kind && !o.in)!
/** Put an item into a slot of a container, at (x, y) or in the first free spot (strictly: nothing else moves). */
function into(s: State, it: Item, host: Item, slot: number, at?: [number, number]) {
  const h = lift(s, it.id)!
  for (const [x, y] of at ? [at] : Array.from({ length: 36 }, (_, i) => [i % 6, Math.floor(i / 6)])) { const p = planDrop(s, h, { host: host.id, slot }, x, y, 0, true); if (p) { applyDrop(s, h, p); return } }
  throw new Error(`no room for ${it.kind}`)
}
/** A board with the drone on the pad, a cell in it and a job for two coal, two hours away, due at hour 20, paying 10. */
function ready(charge = 100) {
  const s = start()
  const pad = first(s, 'launch-pad'), drone = first(s, 'drone')
  into(s, drone, pad, 0)
  const cell = first(s, 'cell')
  cell.p!.charge = charge
  into(s, cell, drone, 1)
  const o = offer(s, 0, seeded(1))
  o.terms = { want: [{ kind: 'coal', n: 2, label: 'coal', short: 'coal' }], to: 'the Depot', dist: 2, due: 20, pay: 10 }
  const slip = accept(s, o.id) as Item
  into(s, slip, drone, 0, [3, 2]) // in the corner, leaving room for two coal
  return { s, pad, drone, cell, o, slip, coal: s.items.filter(c => c.kind === 'coal') }
}

// A launch pad's cradle takes a drone (a container, because the slot names its tag); a crate does not.
{
  const s = start()
  const drone = first(s, 'drone')
  assert.equal(accepts(s, drone, { host: first(s, 'launch-pad').id, slot: 0 }), true)
  assert.equal(accepts(s, drone, { host: first(s, 'crate').id, slot: 0 }), false)
  assert.equal(accepts(s, first(s, 'cell'), { host: drone.id, slot: 1 }), true)
  assert.equal(accepts(s, first(s, 'coal'), { host: drone.id, slot: 1 }), false) // the cell slot takes cells only
}

// Before it can go: a drone on the pad, a slip in the cargo, a cell with the charge for there and back (2 h each way at 8 an hour).
{
  const s = start()
  assert.equal(check(s, first(s, 'launch-pad').id), 'no drone on the pad')
  const r = ready(20)
  assert.match(launch(r.s, r.pad.id) as string, /not enough charge: the Depot and back needs 32, the cell has 20/)
  assert.equal(r.s.items.includes(r.drone), true)
}

// Launch: the charge for the trip is taken, and the drone leaves the board with everything in it.
{
  const r = ready()
  for (const c of r.coal) into(r.s, c, r.drone, 0)
  assert.match(padStatus(r.s, r.pad), /^ready: the Depot, 2 h out, needs 32 charge/)
  const f = launch(r.s, r.pad.id)
  assert.ok(typeof f !== 'string')
  assert.deepEqual([f.arrives, f.back], [2, 4])
  assert.equal(r.cell.p!.charge, 68)
  for (const it of [r.drone, r.cell, r.slip, ...r.coal]) assert.equal(find(r.s, it.id), undefined)
  assert.match(padStatus(r.s, r.pad), /drone out, back d1 12:00/)
  // there: delivered and paid, the coal handed over, a log written
  advance(r.s, 1); fly(r.s)
  assert.equal(r.o.state, 'accepted')
  advance(r.s, 1); fly(r.s)
  assert.equal(r.o.state, 'delivered')
  assert.equal(r.s.credits, 10)
  assert.equal(f.items.some(o => o.kind === 'coal'), false)
  const log = r.s.mail!.find(m => m.type === 'log')!
  assert.equal(log.at, 2)
  assert.match(log.subject, /Delivered to the Depot: 10 cr/)
  // back: in the pad's cradle, with the slip and the cell
  advance(r.s, 2); fly(r.s)
  assert.equal(r.s.flights!.length, 0)
  assert.equal(find(r.s, r.drone.id)?.in?.host, r.pad.id)
  assert.equal(find(r.s, r.slip.id)?.in?.host, r.drone.id)
  assert.equal(find(r.s, r.cell.id)?.in?.host, r.drone.id)
}

// Something missing: refused, everything comes back, and the job stays open to try again.
{
  const r = ready()
  into(r.s, r.coal[0], r.drone, 0)
  launch(r.s, r.pad.id)
  advance(r.s, 4); fly(r.s)
  assert.equal(r.o.state, 'accepted')
  assert.match(r.o.note!, /refused: 1 of 2 coal missing/)
  assert.equal(r.s.credits ?? 0, 0)
  assert.equal(find(r.s, r.coal[0].id)?.in?.host, r.drone.id)
  into(r.s, r.coal[1], r.drone, 0)
  assert.ok(typeof launch(r.s, r.pad.id) !== 'string')
}

// Late: it gets there after the deadline, and the job has failed.
{
  const r = ready()
  for (const c of r.coal) into(r.s, c, r.drone, 0)
  r.o.terms!.due = 1
  launch(r.s, r.pad.id)
  advance(r.s, 2); fly(r.s)
  assert.equal(r.o.state, 'failed')
  assert.equal(r.s.credits ?? 0, 0)
}

// A job left on the board past its deadline fails; one in the air is left to the drone.
{
  const r = ready()
  catchUp(r.s, seeded(2))
  advance(r.s, 21); catchUp(r.s, seeded(3))
  assert.equal(r.o.state, 'failed')
  assert.equal(launch(r.s, r.pad.id), 'the job in the cargo is failed: take the slip out')
}

// Back to a pad that has another drone on it: it lands on the board instead.
{
  const r = ready()
  for (const c of r.coal) into(r.s, c, r.drone, 0)
  launch(r.s, r.pad.id)
  const other: Item = { id: r.s.next++, kind: 'drone', x: 0, y: 0, rot: 0 }
  r.s.items.push(other)
  into(r.s, other, r.pad, 0)
  advance(r.s, 4); fly(r.s)
  assert.equal(find(r.s, r.drone.id)?.in, undefined)
}

console.log('fleet ok')
