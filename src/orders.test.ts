import assert from 'node:assert/strict'
import { chance, DRONE_MS, deliver, morning, orderFor, placeOrder, quote, ship, swapSales, worthOf } from './orders.ts'
import { find, KINDS, settle, spawn, start } from './world.ts'

// an order is numbered, comes by drone when its time is up or by freight the next morning, and lands on the outside counter first
{
  const s = start()
  const drone = placeOrder(s, [{ kind: 'apple' }, { kind: 'wine' }], 'drone', 'Company Store', 1000)
  const freight = placeOrder(s, [{ kind: 'knife' }], 'freight', 'Company Store', 1000)
  assert.equal(freight.id, drone.id + 1)
  assert.deepEqual(deliver(s, 1000 + DRONE_MS - 1), []) // not yet
  const came = deliver(s, 1000 + DRONE_MS)
  assert.deepEqual(came.map(c => c.items.map(i => [i.kind, i.at])), [[['apple', 'outside'], ['wine', 'outside']]])
  assert.equal(came[0].items[1].fill?.amount, 4) // a new bottle comes full (it holds four)
  assert.deepEqual(s.orders!.map(o => o.id), [freight.id]) // freight waits for the morning
  s.day = 2
  assert.deepEqual(deliver(s).map(c => c.items[0].kind), ['knife'])
  assert.equal(s.orders, undefined)
  console.log('orders ok')
}

// what has no room anywhere waits, and comes once there is room; a used thing comes as it was sold
{
  const s = start()
  for (const at of ['outside', 'inside'] as const) while (spawn(s, 'cabinet', { at }));
  while (spawn(s, 'cabinet'));
  placeOrder(s, [{ kind: 'cabinet' }, { kind: 'bread', left: 3 }], 'freight', 'Swapline')
  s.day = 2
  const first = deliver(s)
  assert.deepEqual(first.map(c => c.items.map(i => [i.kind, i.left])), [[['bread', 3]]]) // the bread squeezed in, the cabinet did not
  assert.equal(s.orders![0].goods[0].kind, 'cabinet')
  s.items = s.items.filter(o => o.kind !== 'cabinet' || o.at !== 'outside')
  assert.deepEqual(deliver(s).map(c => c.items[0].kind), ['cabinet'])
  // orders and the Wire's memory survive a save
  placeOrder(s, [{ kind: 'apple' }, { kind: 'gone' }], 'drone', 'Company Store')
  s.web!.book = [{ name: 'a', text: 'b', day: 1 }]
  const t = settle(JSON.parse(JSON.stringify(s)))
  assert.deepEqual([t.orders!.length, t.orders![0].goods.map(g => g.kind), t.web!.book!.length], [1, ['apple'], 1])
  assert.equal(worthOf({ kind: 'bread' }), 8) // eight slices
  console.log('no room, saves ok')
}

// mail: the first morning brings the welcome and orders; an order nobody takes lapses after its day
{
  const s = start()
  const first = morning(s)
  assert.equal(first[0].subject, 'Welcome to the Wire')
  const orders = first.filter(m => m.kind === 'order')
  assert.ok(orders.length >= 2 && orders.every(m => m.job!.pay >= 2 && m.job!.due > 1 && m.job!.wants.every(w => KINDS[w.kind] && w.n >= 1)))
  assert.ok(!morning(s).some(m => m.subject === 'Welcome to the Wire')) // once
  s.day = 99
  morning(s)
  assert.ok(orders.every(m => m.job!.state === 'lapsed'))
  console.log('mail ok')
}

// shipping: a sealed box in the dock with its slip and the goods ships at night and pays on delivery, less the fee;
// short or late pays less; no slip, or not sealed, and it stays
{
  const s = start()
  s.mail = []
  const m = orderFor(s, () => 0.1) // the first sender wants a bread bag (whole) for 1 day+
  m.job = { wants: [{ kind: 'apple', n: 2 }], pay: 20, due: 3, state: 'taken' }
  s.mail.push(m)
  const box = spawn(s, 'box_s', { at: 'dock' })!
  const slip = spawn(s, 'slip', { host: box.id, slot: 0 })!
  slip.print = { job: m.id }
  spawn(s, 'apple', { host: box.id, slot: 0 })
  assert.deepEqual(ship(s), { boxes: 0, net: 0 }) // not sealed: it stays
  box.props = { tape: 'sealed' }
  assert.equal(spawn(s, 'apple', { host: box.id, slot: 0 }), null) // taped shut: nothing goes in
  assert.equal(settle(JSON.parse(JSON.stringify(s))).items.filter(o => o.in?.host === box.id).length, 2) // and a save keeps what is in it
  const q = quote(s, box)!
  assert.deepEqual([q.have, q.wanted, q.pay, q.fee, q.ships], [1, 2, 10, 2, true]) // one apple of two: half the pay
  const empty = spawn(s, 'box_m', { at: 'dock' })!
  empty.props = { tape: 'sealed' }
  assert.deepEqual(ship(s), { boxes: 1, net: 8 })
  assert.deepEqual([find(s, box.id), find(s, slip.id), find(s, empty.id)?.kind, m.job.state, m.job.paid], [undefined, undefined, 'box_m', 'done', 8]) // the slipless box is still there
  assert.ok(s.mail.some(x => x.kind === 'paid' && x.text.includes('8$')))
  // the dock takes boxes and nothing else
  assert.equal(spawn(s, 'apple', { at: 'dock' }), null)
  // late: four fifths
  const m2 = orderFor(s, () => 0.1); m2.job = { wants: [{ kind: 'apple', n: 1 }], pay: 10, due: 1, state: 'taken' }; s.mail.push(m2)
  const b2 = spawn(s, 'box_s', { at: 'dock' })!; const sl2 = spawn(s, 'slip', { host: b2.id, slot: 0 })!; sl2.print = { job: m2.id }; spawn(s, 'apple', { host: b2.id, slot: 0 }); b2.props = { tape: 'sealed' }
  assert.equal(quote(s, b2)!.pay, 8)
  console.log('shipping ok')
}

// Swapline: a listing sells sooner the cheaper it is; sold, it is gone and pays less Swapline's tenth; a thing on a counter does not sell
{
  assert.ok(chance(5, 10) > chance(10, 10) && chance(10, 10) > chance(20, 10) && chance(1000, 10) === 0.02)
  const s = start()
  const apple = spawn(s, 'apple')!, other = spawn(s, 'apple', { at: 'inside' })!
  apple.listed = 3; other.listed = 3
  const sold = swapSales(s, () => 0)
  assert.deepEqual([sold.length, sold[0].net, find(s, apple.id), !!find(s, other.id)], [1, 2, undefined, true]) // a dollar at least to Swapline
  assert.equal(swapSales(s, () => 0.99).length, 0)
  console.log('swapline ok')
}
