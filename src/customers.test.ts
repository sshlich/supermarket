import assert from 'node:assert/strict'
import { arrive, bring, deal, dealt, greeting, MARKUP, MIX, noble, offerOf, open, picked, residentOf, takes, TAGS, unpack, type Customer } from './customers.ts'
import { contents, KINDS, moveInto, spawn, start, worth } from './world.ts'

// customers are residents: buyers and traders want one or two needs, those of what is on their own list; sellers and
// traders bring things from theirs; buyers pay 10 to 40% over worth and count their money
const many = Array.from({ length: 3000 }, (_, i) => arrive(i))
for (const c of many.slice(0, 400)) {
  const r = residentOf(c)!
  assert.ok(r && r.roles[c.role] > 0, `${c.who} comes as a ${c.role}`)
  assert.equal(new Set(c.wants).size, c.wants.length)
  assert.ok(c.wants.every(t => t in TAGS && r.buys.some(k => KINDS[k]?.need === t)), `${c.who} wants ${c.wants}`)
  assert.equal(c.wants.length === 0, c.role === 'seller')
  assert.equal(c.goods.length === 0, c.role === 'buyer')
  assert.ok(c.goods.every(g => r.sells.includes(g.kind) && (!g.fill || g.fill.amount <= KINDS[g.kind].holds!)), `${c.who} brings ${c.goods.map(g => g.kind)}`)
  if (c.role === 'buyer') assert.ok(c.rate >= 1 + MARKUP[0] - 1e-9 && c.rate <= 1 + MARKUP[1] + 1e-9 && c.budget! >= 1)
  assert.ok(greeting(c).length > 0)
}
// as many sellers as buyers come in, by the mix; nobles are the top of the markup, and the ring has more of them than the spine
for (const role of ['buyer', 'seller', 'trader'] as const) assert.ok(Math.abs(many.filter(c => c.role === role).length / many.length - MIX[role]) < 0.04, role)
const share = (deck: string) => { const b = many.filter(c => c.role === 'buyer' && residentOf(c)!.deck === deck); return b.filter(noble).length / b.length }
assert.ok(share('deck_ring') > share('deck_spine'), 'the rich are nobles more often')
const posh = many.find(c => noble(c))!
assert.ok(greeting(posh).length > 0 && !greeting(posh).startsWith("I'm after"))
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
const food = { id: 10, tags: ['food', 'need_food'], worth: 4 }, wine = { id: 11, tags: ['drink', 'need_luxury'], worth: 9 }, book = { id: 12, tags: ['book', 'need_luxury'], worth: 7 }
const pill = { id: 13, tags: ['need_medicine'], worth: 2 }

// a buyer takes what they want, pays over its worth, leaves the rest, and buys on while they have money
{
  const c = who('buyer', ['need_food', 'need_medicine'], { budget: 20 })
  assert.equal(deal(c, [], 0, 0).done, false)
  assert.equal(deal(c, [book], 0, 0).done, false)
  const r = deal(c, [food, book], 0, 0)
  assert.deepEqual([r.done, r.take, r.pay, r.met], [true, [10], 6, ['need_food']])
  assert.ok(r.say.includes(TAGS.need_medicine.say)) // still wants the rest
  dealt(c, r)
  assert.ok(open(c))
  assert.ok(deal(c, [food], 0, 0).done, 'more food: they still have money')
  dealt(c, deal(c, [pill], 0, 0))
  assert.deepEqual(c.got, ['need_food', 'need_medicine'])
  assert.equal(c.budget, 11)
  assert.ok(open(c), 'everything they came for, and money left: still buying')
}
// short of money for all of it, a buyer takes what they can pay for, the dearest first; broke, they are done
{
  const c = who('buyer', ['need_luxury', 'need_food'], { budget: 12 })
  const r = deal(c, [book, food], 0, 0) // 11 * 1.5 = 16.5 -> 17 > 12: the book alone, 11
  assert.ok(r.done && r.pay === 11 && r.take.length === 1 && r.take[0] === book.id)
  dealt(c, r)
  assert.equal(c.budget, 1)
  const no = deal(c, [food], 0, 0) // 6 > 1
  assert.ok(!no.done && no.say.includes('1$'))
  const broke = who('buyer', ['need_food'], { budget: 0 })
  assert.ok(!open(broke) && !deal(broke, [food], 0, 0).done)
}
// a resident avoids some sorts of thing, unless it is on their own list: the ring household buys a synthetic cheese wheel, not synthetic paste
{
  const c = who('buyer', ['need_food'], { who: 'res_household', budget: 999 })
  const wheel = { id: 20, kind: 'it_food_cheese_wheel', tags: ['food', 'synthetic', 'need_food'], worth: 48 }, paste = { id: 21, kind: 'it_food_paste_tube', tags: ['food', 'synthetic', 'need_food'], worth: 3 }
  assert.deepEqual(takes(c, [wheel, paste]).map(o => o.id), [20])
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
  const c = who('trader', ['need_luxury'], { brought: [5], slack: 0.2 })
  assert.equal(deal(c, [food], 0, 10).done, false)
  const no = deal(c, [wine], 0, 12) // 9 < 12 * 0.8
  assert.ok(!no.done && no.say.includes('Add about 1$ more'))
  assert.deepEqual(deal(c, [wine, food], 5, 11), { done: true, take: [11], pay: -2, met: ['need_luxury'], say: 'Close enough. You owe me 2$.' })
  assert.equal(deal(c, [wine], 1, 11).done, false) // cannot cover the 2$
  assert.deepEqual(deal(c, [wine], 0, 9), { done: true, take: [11], pay: 0, met: ['need_luxury'], say: 'Fair trade.' })
  assert.equal(deal(c, [wine], 0, 5).pay, 4) // worth more than they brought: they pay the rest
}
// the spread: a flip earns well under double
{
  const flips = many.map(c => c.role === 'buyer' ? c.rate : c.role === 'seller' ? 1 / c.rate : 0).filter(Boolean)
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
  assert.deepEqual(picked([o], ['need_food']).map(p => p.id), [apple.id])
  const c = who('buyer', ['need_food'])
  const r = deal(c, [o], 0, 0)
  assert.deepEqual([r.done, r.take, r.pay], [true, [apple.id], Math.round(worth(s, apple) * c.rate)])
  // a blister is medicine with its pills, whole
  const b = spawn(s, 'it_med_fb_painkiller', { at: 'inside' })!
  const ob = offerOf(s, b)
  assert.deepEqual([ob.parts, ob.worth, picked([ob], ['need_medicine']).map(p => p.id)], [undefined, worth(s, b), [b.id]])
  // a computer is valuable for itself: taken without the disc in its tray, unless that is wanted too
  const pc = spawn(s, 'mach_terminal', { at: 'inside' })!, disc = spawn(s, 'disc')!
  assert.ok(moveInto(s, disc, { host: pc.id, slot: 0 }))
  const op = offerOf(s, pc)
  assert.deepEqual(picked([op], ['valuable']).map(p => p.id), [pc.id])
  assert.equal(picked([op], ['valuable'])[0].worth, worth(s, pc) - worth(s, disc))
}
console.log('customers ok')

// The story's people (story.ts): day 1 brings Pim's overstock and Wren, in that order, and a one-off does not come twice; Mara
// keeps coming from day 2 until she is served; her locket and Pim's ore wait for the deals they follow.
{
  const { scripted, finish } = await import('./story.ts')
  const { start } = await import('./world.ts')
  let n = 0
  const s = start(), id = () => ++n
  const d1 = scripted(s, 1, id)
  assert.deepEqual(d1.map(c => c.beat), ['pim_overstock', 'wren_payday'])
  assert.equal(d1[0].role, 'seller'); assert.equal(d1[0].goods.length, 5); assert.ok(d1[1].wants.length === 1 && d1[1].budget === 30)
  assert.deepEqual(scripted(s, 1, id), [], 'a one-off does not come twice')
  assert.deepEqual(scripted(s, 2, id).map(c => c.beat), ['mara_water', 'skip_fence'])
  assert.deepEqual(scripted(s, 3, id).map(c => c.beat), ['mara_water', 'corvin_inspector'], 'Pim waits until the overstock is bought')
  finish(s, d1[0])
  assert.ok(scripted(s, 4, id).some(c => c.beat === 'pim_regular'), 'Pim comes back once his overstock was bought')
  const mara = scripted(s, 5, id).find(c => c.beat === 'mara_water')!
  assert.ok(mara, 'Mara comes until she is served')
  assert.ok(finish(s, mara)?.includes('Fair price'))
  assert.ok(scripted(s, 6, id).some(c => c.beat === 'mara_locket'), 'her locket comes once she is served')
  console.log('story ok')
}
