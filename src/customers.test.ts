import assert from 'node:assert/strict'
import { arrive, bring, deal, dealt, greeting, offerOf, open, picked, TAGS, unpack, type Customer } from './customers.ts'
import { contents, KINDS, moveInto, spawn, start, worth } from './world.ts'

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
assert.ok(kinds.filter(k => k === 'it_food_apple').length > kinds.filter(k => k === 'it_fit_cabinet').length)
assert.ok(kinds.every(k => !KINDS[k].stack)) // a sandwich is made, never brought
// what is brought is made as it was meant: a blister two pills short, a wheel already cut into
{
  const s = start()
  const b = unpack(s, { kind: 'it_med_fb_painkiller', missing: 2 }, { at: 'outside' })!
  assert.equal(contents(s, b.id).length, 4)
  const w = unpack(s, { kind: 'it_food_cheese_wheel', left: 3 }, { at: 'outside' })!
  assert.equal(w.left, 3)
}

const who = (role: Customer['role'], wants: string[], extra: Partial<Customer> = {}): Customer => ({ id: 1, name: 'Test', role, wants, rate: 1.5, goods: [], brought: [], ask: 0, budget: null, got: [], ...extra })
const food = { id: 10, tags: ['food'], worth: 4 }, wine = { id: 11, tags: ['drink', 'alcohol'], worth: 9 }, book = { id: 12, tags: ['book'], worth: 7 }

// a buyer takes what they want, pays over its worth, and leaves the rest
{
  const c = who('buyer', ['food', 'medicine'])
  assert.equal(deal(c, [], 0, 0).done, false)
  assert.equal(deal(c, [book], 0, 0).done, false)
  const r = deal(c, [food, book], 0, 0)
  assert.deepEqual([r.done, r.take, r.pay, r.met], [true, [10], 6, ['food']])
  assert.ok(r.say.includes(TAGS.medicine.say)) // still wants the rest
  // they stay: what they bought is off the list, and they buy the rest later
  dealt(c, r)
  assert.ok(open(c))
  assert.equal(deal(c, [food], 0, 0).done, false) // has food already
  const pill = { id: 13, tags: ['medicine'], worth: 2 }
  assert.ok(deal(c, [pill], 0, 0).done)
  dealt(c, deal(c, [pill], 0, 0))
  assert.ok(!open(c))
  assert.equal(deal(c, [pill], 0, 0).done, false)
}
// a buyer with a budget cannot pay more than they have, and spends it down
{
  const c = who('buyer', ['book', 'food'], { budget: 12 })
  const r = deal(c, [book, food], 0, 0) // 11 * 1.5 = 16.5 -> 17 > 12
  assert.equal(r.done, false)
  assert.ok(r.say.includes('12$'))
  const r2 = deal(c, [book], 0, 0)
  assert.ok(r2.done && r2.pay === 11)
  dealt(c, r2)
  assert.equal(c.budget, 1)
  assert.equal(deal(c, [food], 0, 0).done, false) // 6 > 1
}
// a seller wants their price, and nothing else
{
  const c = who('seller', [], { brought: [5, 6], ask: 20 })
  assert.equal(deal(c, [], 19, 0).done, false)
  assert.deepEqual(deal(c, [book], 20, 0).take, [])
  assert.equal(deal(c, [], 20, 0).pay, -20)
  dealt(c, deal(c, [], 20, 0))
  assert.ok(!open(c) && !deal(c, [], 99, 0).done) // one deal
  assert.equal(deal(who('seller', [], { ask: 0 }), [], 99, 0).done, false) // nothing on the counter to buy
}
// a trader swaps if what they want is worth most of what they brought; cash settles the difference either way
{
  const c = who('trader', ['drink'], { brought: [5], slack: 0.2 })
  assert.equal(deal(c, [food], 0, 10).done, false)
  const no = deal(c, [wine], 0, 12) // 9 < 12 * 0.8
  assert.ok(!no.done && no.say.includes('Add about 1$ more'))
  assert.deepEqual(deal(c, [wine, food], 5, 11), { done: true, take: [11], pay: -2, met: ['drink'], say: 'Close enough. You owe me 2$.' })
  assert.equal(deal(c, [wine], 1, 11).done, false) // cannot cover the 2$
  assert.deepEqual(deal(c, [wine], 0, 9), { done: true, take: [11], pay: 0, met: ['drink'], say: 'Fair trade.' })
  assert.equal(deal(c, [wine], 0, 5).pay, 4) // worth more than they brought: they pay the rest
}
// the spread: a flip earns well under double
{
  const flips = Array.from({ length: 2000 }, () => { const c = arrive(1); return c.role === 'buyer' ? c.rate : c.role === 'seller' ? 1 / c.rate : 0 }).filter(Boolean)
  const mean = flips.reduce((a, b) => a + b, 0) / flips.length
  assert.ok(mean > 1.1 && mean < 1.4, String(mean))
}
// how a customer sees a container: a package (it comes full) is one thing with all it holds; any other container is
// itself, and what is in it is seen thing by thing. A food buyer takes the apple out of a cabinet, not the cabinet and the lockets.
{
  const s = start()
  const cab = spawn(s, 'it_fit_cabinet', { at: 'inside' })!, apple = spawn(s, 'it_food_apple')!, l1 = spawn(s, 'it_lux_locket')!, l2 = spawn(s, 'it_lux_locket')!
  for (const o of [apple, l1, l2]) assert.ok(moveInto(s, o, { host: cab.id, slot: 0 }))
  const o = offerOf(s, cab)
  assert.equal(o.worth + o.parts!.reduce((n, p) => n + p.worth, 0), worth(s, cab))
  assert.deepEqual(picked([o], ['food']).map(p => p.id), [apple.id])
  const c = who('buyer', ['food'])
  const r = deal(c, [o], 0, 0)
  assert.deepEqual([r.done, r.take, r.pay], [true, [apple.id], Math.round(worth(s, apple) * c.rate)])
  // a blister is medicine with its pills, whole
  const b = spawn(s, 'it_med_fb_painkiller', { at: 'inside' })!
  const ob = offerOf(s, b)
  assert.deepEqual([ob.parts, ob.worth, picked([ob], ['medicine']).map(p => p.id)], [undefined, worth(s, b), [b.id]])
  // a computer is valuable for itself: taken without the disc in its tray, unless that is wanted too
  const pc = spawn(s, 'mach_terminal', { at: 'inside' })!, disc = spawn(s, 'disc')!
  assert.ok(moveInto(s, disc, { host: pc.id, slot: 0 }))
  const op = offerOf(s, pc)
  assert.deepEqual(picked([op], ['valuable']).map(p => p.id), [pc.id])
  assert.equal(picked([op], ['valuable'])[0].worth, worth(s, pc) - worth(s, disc))
}
console.log('customers ok')
