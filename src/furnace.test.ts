import assert from 'node:assert/strict'
import { charge, cool, fuelIn, isLit, light, progress, stoke } from './furnace.ts'
import { find, inSpace, KINDS, settle, spawn, start, worth, type Item, type State } from './world.ts'

const near = (a: number | null | undefined, b: number, what = '') => assert.ok(a != null && Math.abs(a - b) < 1e-9, `${what} ${a} is not ${b}`)
/** A furnace on the field, with coal in its firebox and ore in its crucible. */
function furnace(coal: number, ores: Record<string, string>[]): { s: State; f: Item } {
  const s = start()
  const f = spawn(s, 'mach_smelter')!
  for (let i = 0; i < coal; i++) assert.ok(spawn(s, 'it_tech_cell_s', { host: f.id, slot: 1 }))
  for (const p of ores) assert.ok(spawn(s, p.metal === 'copper' ? 'it_core_ore_copper' : 'it_core_ore_iron', { host: f.id, slot: 0 }))
  return { s, f }
}

// The crucible takes two lumps of ore (2x2 each) and nothing else; the firebox four lumps of coal.
{
  const { s, f } = furnace(4, [{}, {}])
  assert.equal(spawn(s, 'it_core_ore_iron', { host: f.id, slot: 0 }), null, 'two lumps fill it')
  assert.equal(spawn(s, 'it_tech_cell_s', { host: f.id, slot: 1 }), null, 'four lumps fill it')
  assert.equal(spawn(s, 'it_tech_cell_s', { host: f.id, slot: 0 }), null, 'no coal in the crucible')
  assert.equal(charge(s, f).length, 2)
}
// No fuel, no fire. With coal it lights; a lump burns 15 seconds, then the next; the last gone, the fire goes out.
{
  const { s, f } = furnace(0, [])
  assert.equal(light(s, f), 'no fuel')
  assert.equal(isLit(f), false)
  const t = furnace(2, [])
  assert.equal(light(t.s, t.f), 'lit')
  assert.equal(light(t.s, t.f), 'lit already')
  let r = stoke(t.s, 7.5)
  assert.ok(r.changed, 'the first lump catching is news')
  near(fuelIn(t.s, t.f)[0].heat, 0.5)
  r = stoke(t.s, 7.5)
  assert.equal(r.burnt, 1)
  assert.equal(fuelIn(t.s, t.f).length, 1)
  r = stoke(t.s, 20)
  assert.equal(r.burnt, 1)
  assert.deepEqual(r.out.map(o => o.id), [t.f.id])
  assert.equal(isLit(t.f), false)
  assert.ok(t.f.heat! > 0 && t.f.heat! < 1, 'it cools slowly once out')
}
// Two lumps of iron ore melt into one iron bar (3x2) in 24 seconds of fire; it lands in the crucible.
{
  const { s, f } = furnace(2, [{}, {}])
  light(s, f)
  stoke(s, 12)
  near(progress(s, f), 0.5)
  const r = stoke(s, 12)
  assert.equal(r.made.length, 1)
  const bar = r.made[0]
  assert.equal(bar.kind, 'it_fab_bar_iron')
  assert.deepEqual(bar.in, { host: f.id, slot: 0 })
  assert.equal(inSpace(s, { host: f.id, slot: 0 }).length, 1, 'the ore is gone')
  assert.equal(worth(s, bar), KINDS.it_fab_bar_iron.price)
  assert.equal(progress(s, f), null)
}
// Copper makes copper; one of each metal melts nothing; the fire going out keeps how far it got.
{
  const c = furnace(2, [{ metal: 'copper' }, { metal: 'copper' }])
  light(c.s, c.f)
  assert.equal(stoke(c.s, 24).made[0].kind, 'it_fab_bar_copper')
  const m = furnace(2, [{}, { metal: 'copper' }])
  light(m.s, m.f)
  stoke(m.s, 10)
  assert.equal(progress(m.s, m.f), null)
  assert.ok(inSpace(m.s, { host: m.f.id, slot: 0 }).every(o => o.heat === undefined), 'a mixed pair does not heat')
  const k = furnace(1, [{}, {}])
  light(k.s, k.f)
  stoke(k.s, 20)
  assert.equal(isLit(k.f), false)
  near(progress(k.s, k.f), 15 / 24, 'heated while the coal lasted, and kept:')
}
// What is in hand is left alone; ore taken out of the crucible cools; a save keeps the heat and the fire.
{
  const { s, f } = furnace(2, [{}, {}])
  light(s, f)
  const ore = charge(s, f)[0]
  stoke(s, 5, [ore.id])
  assert.equal(ore.heat, undefined, 'held: not heated (and its pair waits for it)')
  stoke(s, 5)
  assert.ok(ore.heat! > 0)
  const kept = settle(JSON.parse(JSON.stringify(s)))
  assert.equal(find(kept, ore.id)!.heat, ore.heat)
  assert.ok(isLit(find(kept, f.id)!))
  delete ore.in
  cool(s)
  assert.equal(ore.heat, undefined)
}
console.log('furnace ok')
