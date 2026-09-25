import assert from 'node:assert/strict'
import { buyPrice } from './economy.ts'
import { hourOptions, monsterOptions } from './encounters.ts'
import { ITEMS } from './items.ts'
import { boardSockets, hourKind, levelRewards, maxHp, prestigeLoss, rival, rivalLevel } from './run.ts'
import { SKILLS } from './skills.ts'

assert.deepEqual([0, 1, 2, 3, 4, 5].map(hourKind), ['choice', 'choice', 'monster', 'choice', 'choice', 'rival'])
assert.equal(prestigeLoss(1), 2)
assert.equal(prestigeLoss(20), 12)

// Rivals fit their board and their budget, and get richer with days.
let seed = 1
const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
for (const day of [1, 3, 8]) {
  for (let i = 0; i < 50; i++) {
    const r = rival(day, random)
    const { lo, hi } = boardSockets(rivalLevel(day))
    assert.ok(r.items.reduce((n, k) => n + ITEMS[k].size, 0) <= hi - lo + 1)
    assert.equal(r.hp, maxHp(rivalLevel(day)))
    assert.ok(r.items.reduce((n, k) => n + buyPrice(ITEMS[k]), 0) <= 6 + 8 * day)
    assert.ok(r.items.length > 0)
    assert.equal(r.skills.length, Math.floor(day / 2)) // a skill every other day
    assert.equal(new Set(r.skills.map(s => s.key)).size, r.skills.length)
    assert.ok(r.skills.every(s => SKILLS[s.key]))
    assert.equal(r.skills.length, Math.floor(day / 2)) // a skill every other day
    assert.equal(new Set(r.skills.map(s => s.key)).size, r.skills.length)
    assert.ok(r.skills.every(s => SKILLS[s.key]))
  }
}

// Every non-combat hour offers three distinct picks, at least one merchant; monsters come three at a time.
for (let i = 0; i < 50; i++) {
  const opts = hourOptions(random)
  assert.equal(opts.length, 3)
  assert.equal(new Set(opts).size, 3)
  assert.ok(opts.some(o => o.kind === 'merchant'))
}
assert.equal(monsterOptions(1, random).length, 2) // only two day-1 monsters exist
assert.equal(monsterOptions(5, random).length, 3)
assert.ok(monsterOptions(5, random).every(m => m.day >= 2)) // the five toughest unlocked

// Levels: 300 hp at level 1, board 4 -> 6 -> 8 -> 10 sockets, centered.
assert.equal(maxHp(1), 300)
assert.deepEqual([1, 2, 3, 4, 9].map(boardSockets), [{ lo: 3, hi: 6 }, { lo: 2, hi: 7 }, { lo: 1, hi: 8 }, { lo: 0, hi: 9 }, { lo: 0, hi: 9 }])
assert.equal(levelRewards(2).length, 3)
assert.ok(levelRewards(12).some(r => r.kind === 'upgrade'))
assert.ok(levelRewards(2).some(r => r.kind === 'skill'))
assert.ok(levelRewards(3).some(r => r.kind === 'enchant'))

console.log('run: ok')
