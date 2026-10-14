import assert from 'node:assert/strict'
import { arrive, bring, deal, greeting, TAGS, type Customer } from './customers.ts'
import { KINDS } from './world.ts'

// customers: buyers and traders want one or more known tags, sellers none; sellers and traders bring things that exist
for (let i = 0; i < 300; i++) {
  const c = arrive(i)
  assert.equal(new Set(c.wants).size, c.wants.length)
  assert.ok(c.wants.every(t => t in TAGS))
  assert.equal(c.wants.length === 0, c.role === 'seller')
  assert.equal(c.goods.length === 0, c.role === 'buyer')
  assert.ok(c.goods.every(g => KINDS[g.kind] && (!g.fill || g.fill.amount <= KINDS[g.kind].holds!)))
  assert.ok(greeting(c).length > 0)
}
// what people bring is mostly cheap: over many, apples outnumber cabinets
const kinds = Array.from({ length: 2000 }, () => bring().kind)
assert.ok(kinds.filter(k => k === 'apple').length > kinds.filter(k => k === 'cabinet').length)

const who = (role: Customer['role'], wants: string[], extra: Partial<Customer> = {}): Customer => ({ id: 1, name: 'Test', role, wants, rate: 1.5, goods: [], brought: [], ask: 0, ...extra })
const food = { id: 10, tags: ['food'], worth: 4 }, wine = { id: 11, tags: ['drink', 'alcohol'], worth: 9 }, book = { id: 12, tags: ['book'], worth: 7 }

// a buyer takes what they want, pays over its worth, and leaves the rest
{
  const c = who('buyer', ['food', 'medicine'])
  assert.equal(deal(c, [], 0, 0).done, false)
  assert.equal(deal(c, [book], 0, 0).done, false)
  const r = deal(c, [food, book], 0, 0)
  assert.deepEqual([r.done, r.take, r.pay, r.met], [true, [10], 6, ['food']])
  assert.ok(r.say.includes(TAGS.medicine.say)) // still wants the rest
}
// a seller wants their price, and nothing else
{
  const c = who('seller', [], { brought: [5, 6], ask: 20 })
  assert.equal(deal(c, [], 19, 0).done, false)
  assert.deepEqual(deal(c, [book], 20, 0).take, [])
  assert.equal(deal(c, [], 20, 0).pay, -20)
  assert.equal(deal(who('seller', [], { ask: 0 }), [], 99, 0).done, false) // nothing on the counter to buy
}
// a trader swaps if what they want is worth most of what they brought
{
  const c = who('trader', ['drink'], { brought: [5] })
  assert.equal(deal(c, [food], 0, 10).done, false)
  assert.equal(deal(c, [wine], 0, 12).done, false) // 9 < 0.8 * 12
  assert.deepEqual(deal(c, [wine, food], 0, 11), { done: true, take: [11], pay: 0, met: ['drink'], say: 'Fair trade.' })
}
console.log('customers ok')
