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
// and nothing else is known.
apply(s, { type: 'endDay' })
apply(s, { type: 'endDay' })
for (const id of ['galleries', 'ducts']) {
  const c = fact(s, `L:${id}:entities`)!
  assert.equal(c.state, 'rough')
  assert.equal(c.src, 'rumour')
}
assert.deepEqual(Object.keys(s.know).sort(), ['L:ducts:entities', 'L:galleries:entities'])
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

// The Catalog outlives the game: a new one starts knowing what the last one learned.
const next = newGame(8, s.know)
assert.equal(fact(next, 'S:grub:pop:galleries')!.value, grubs.value)

console.log('knowledge ok')
