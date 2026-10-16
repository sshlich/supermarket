import assert from 'node:assert/strict'
import { DRONE_MS, deliver, placeOrder, worthOf } from './orders.ts'
import { settle, spawn, start } from './world.ts'

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
