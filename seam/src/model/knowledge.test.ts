import assert from 'node:assert/strict'
import { apply } from './apply.ts'
import { band, fact, learn } from './knowledge.ts'
import { newGame } from './state.ts'

// Population bands (7.2): none (0), few (1-5), some (6-20), many (21-80), swarm (81+), on the rounded count.
assert.deepEqual([0, 0.4, 1, 5, 6, 20, 21, 80, 81, 400].map(band), ['none', 'none', 'few', 'few', 'some', 'some', 'many', 'many', 'swarm', 'swarm'])

// A new game knows nothing; omniscient sees the truth.
const s = newGame(7)
assert.equal(fact(s, 'L:galleries:film'), undefined)
assert.equal(fact(s, 'S:grub:pop:galleries'), undefined)
assert.deepEqual([fact(s, 'L:galleries:film', true)?.value, fact(s, 'S:grub:pop:galleries', true)?.value], [75, 80])

// Each night someone listens at the walls: after two nights both home levels have a rough Entities band from rumours,
// and nothing else about the world is known (the Seam knows its own things by name).
apply(s, { type: 'endDay' })
apply(s, { type: 'endDay' })
for (const id of ['galleries', 'ducts']) {
  const c = fact(s, `L:${id}:entities`)!
  assert.equal(c.state, 'rough')
  assert.equal(c.src, 'rumour')
}
assert.deepEqual(Object.keys(s.know).filter(k => /^[LS]:/.test(k)).sort(), ['L:ducts:entities', 'L:galleries:entities'])
assert.ok(s.log.some(l => l.kind === 'rumour') && s.log.some(l => l.kind === 'maint' && l.text.startsWith('unregistered biomass detected: 40')))

// Sightings: rough is a band, exact is a number; a rough look never overwrites an exact one from the same day,
// and each sighting of a population leaves a point on its trail.
learn(s, 'S:grub:pop:galleries', 'exact', 'READ')
learn(s, 'S:grub:pop:galleries', 'rough', 'seen')
assert.equal(fact(s, 'S:grub:pop:galleries')!.state, 'exact')
s.day++
learn(s, 'S:grub:pop:galleries', 'rough', 'seen')
const grubs = fact(s, 'S:grub:pop:galleries')!
assert.deepEqual([grubs.state, grubs.value, grubs.trail!.length], ['rough', band(s.levels.galleries.N.grub), 2])

// The Catalog outlives the game: a new one starts knowing what the last one learned about what things are. Its
// head-counts and conditions are of a world years gone, so they start again as ??? (they used to show as today's).
learn(s, 'S:grub:hp', 'exact', 'fight')
const next = newGame(8, s.know)
assert.equal(fact(next, 'S:grub:hp')!.value, 2)
assert.equal(fact(next, 'S:grub:pop:galleries'), undefined)

// After a sweep, once the Scourers have eaten most of the debris, MAINT says the floor is clean.
{
  const t = newGame(7)
  t.levels.stair.A = 100
  for (let i = 0; i < 14; i++) apply(t, { type: 'endDay' })
  assert.ok(t.log.some(l => l.text.startsWith('disposal complete.')))
}

console.log('knowledge ok')
