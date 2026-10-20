import assert from 'node:assert/strict'
import { demand, impact, index, live, newMarket, rumors, supply, tick, unmet, weights } from './market.ts'

let seed = 3
const rand = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296 }

// selling pushes a tag's price down, buying from a seller up; always inside the clamp
{
  const m = newMarket()
  impact(m, 'need_food', 10, true)
  assert.ok(m.p.need_food < 1)
  impact(m, 'need_comfort', 10, false)
  assert.ok(m.p.need_comfort > 1)
  for (let i = 0; i < 50; i++) impact(m, 'need_food', 100, true)
  assert.equal(m.p.need_food, 0.5)
  assert.equal(index(m, ['vessel']), 1) // a tag that does not count
}
// prices drift back, need builds and fades
{
  const m = newMarket()
  m.p.need_food = 0.6
  for (let i = 0; i < 20; i++) tick(m, () => 0.5, 0) // no noise, no events
  assert.ok(Math.abs(m.p.need_food - 1) < 0.02)
  unmet(m, 'need_water'); unmet(m, 'need_water')
  assert.ok(weights(m).need_water > weights(m).need_food)
}
// over a long run: prices stay in range, events come and go, a rumor is announced before it starts, some never happen
{
  const m = newMarket()
  let evs = 0, announced = 0, started = 0
  const seen = new Set<unknown>(), began = new Set<unknown>()
  for (let h = 0; h < 20000; h++) {
    tick(m, rand)
    for (const t of Object.values(m.p)) assert.ok(t >= 0.5 && t <= 2.5)
    assert.ok(m.events.length <= 3)
    for (const e of rumors(m)) seen.add(e)
    for (const e of live(m)) began.add(e)
    evs += m.events.length
  }
  announced = seen.size; started = [...seen].filter(e => began.has(e)).length
  assert.ok(evs > 0 && announced > 100)
  assert.ok(started < announced && started > announced * 0.5, `${started}/${announced}`) // about a quarter are false
  assert.ok(demand(newMarket(), 'need_food') === 1 && supply(newMarket(), 'need_food') === 1)
}
// a cold snap: fuel and food twice as wanted nearly, light less so
{
  const m = newMarket()
  m.events.push({ name: 'cold snap', tags: ['need_power', 'need_food', 'need_comfort'], d: 1.7, s: 1, dt: { need_comfort: 1.3 }, hours: 6, wait: 0, age: 0, real: true })
  assert.equal(demand(m, 'need_food'), 1.7)
  assert.ok(Math.abs(demand(m, 'need_comfort') - 1.3) < 1e-9)
}
console.log('market ok')
