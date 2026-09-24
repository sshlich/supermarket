import assert from 'node:assert/strict'
import { ITEMS } from '../items.ts'
import { Fight } from './combat.ts'

type Key = keyof typeof ITEMS
const side = (name: string, hp: number, keys: Key[]) => ({ name, hp, items: keys.map((k, i) => ({ id: `${name}${i}:${k}`, def: ITEMS[k] })) })
const fight = (a: Key[], b: Key[], hpA = 100, hpB = 100, seed = 1) => new Fight(side('A', hpA, a), side('B', hpB, b), seed)
const until = (f: Fight, t: number) => {
  while (f.t < t && f.winner === null) f.step()
  return f
}

// Rust Blade: 5 damage every 3 s -> a 20 hp opponent dies on the 4th hit at 12 s.
{
  const f = fight(['rustBlade'], [], 100, 20).run()
  assert.equal(f.winner, 0)
  assert.equal(f.t, 12_000)
}

// Shield soaks damage before Health.
{
  const f = until(fight(['ironPot'], ['rustBlade']), 6000)
  const a = f.sides[0]
  assert.equal(a.hp, 95) // hit at 3 s before any shield
  assert.equal(a.shield, 5) // 10 shield at 5 s, hit for 5 at 6 s
}

// Burn ticks every 500 ms for its stack, losing 1 each tick: 4+3+2+1.
{
  const f = until(fight(['emberFlask'], []), 7000)
  assert.equal(f.sides[1].hp, 90)
  assert.equal(f.sides[1].burn, 0)
}

// Poison ticks every second and ignores Shield.
{
  const f = until(fight(['venomVial'], ['ironPot']), 6000)
  assert.equal(f.sides[1].hp, 91) // 3 at 4, 5 and 6 s
  assert.equal(f.sides[1].shield, 10)
}

// Multicast 3: every cast deals its damage and applies its burn, same frame.
{
  const f = until(fight(['handCannon'], [], 100, 200), 7000)
  assert.equal(f.sides[1].hp, 176)
  assert.equal(f.sides[1].burn, 6)
  assert.equal(f.events.filter(e => e.kind === 'use').length, 3)
}

// Brass Beetle is hasted 1 s when its neighbor is used at 3 s, so it fires at 4 s instead of 5 s.
{
  const f = until(fight(['rustBlade', 'brassBeetle'], [], 100, 1000), 5000)
  const first = f.events.find(e => e.kind === 'use' && e.item?.endsWith('brassBeetle'))
  assert.equal(first?.t, 4000)
}

// Ember Flask's aura gives the other Burn items +1 burn.
{
  const f = until(fight(['emberFlask', 'handCannon'], []), 100)
  const cannon = f.sides[0].items[1]
  assert.equal(cannon.attrs.burn, 3)
  assert.equal(cannon.base.burn, 2)
}

// Ammo 6: fires six times, then stays charged and silent.
{
  const f = fight(['sparkPistol'], [], 10_000, 10_000).run()
  assert.equal(f.events.filter(e => e.kind === 'use').length, 6)
  assert.equal(f.winner, -1) // storm doesn't finish 10k hp by 90 s
  assert.equal(f.t, 90_000)
}

// Storm from 30 s: 4, 9, 14, ... per second, through Shield. Both at 100 hp die together at 36 s.
{
  const f = fight([], []).run()
  assert.equal(f.winner, -1)
  assert.equal(f.t, 36_000)
}

// Same seed, same fight (random Haste targets).
{
  const run = (seed: number) => JSON.stringify(fight(['fieldKit', 'rustBlade', 'handCannon'], ['siegeAnvil', 'venomVial'], 300, 300, seed).run().events)
  assert.equal(run(42), run(42))
}

console.log('combat: ok')
