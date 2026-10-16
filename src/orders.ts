// Buying on the Wire: an order is paid when it is placed and comes later, by drone (in about a minute, for a fee) or by
// freight (the next morning, free). It lands on the outside counter, where things come in, or on the field, or on the
// inside counter, wherever there is room; what has no room yet waits and comes as soon as there is.

import { unpack, type Goods } from './customers.ts'
import { worth, type Item, type Order, type Space, type State } from './world.ts'

/** A drone takes 45 seconds and costs 3$; freight is free and comes the next morning. */
export const DRONE_MS = 45_000, DRONE_FEE = 3
/** Where a delivery is put down, in order of trying. */
const DROPS: Space[] = [{ at: 'outside' }, null, { at: 'inside' }]

/** What a thing as it would be made is worth (made for the sake of it, in a place of its own, and thrown away). */
export function worthOf(g: Goods): number {
  const t: State = { items: [], next: 1 }
  const it = unpack(t, g, null, () => 0.5)
  return it ? worth(t, it) : 0
}

/** Order these goods: on its way from now, with a number. */
export function placeOrder(s: State, goods: Goods[], by: Order['by'], from: string, now = Date.now()): Order {
  const web = s.web ??= {}
  web.seq = (web.seq ?? 1040) + 1
  const o: Order = { id: web.seq, goods, by, at: by === 'drone' ? now + DRONE_MS : (s.day ?? 1) + 1, from }
  ;(s.orders ??= []).push(o)
  return o
}
/** Is it here: a drone whose time has come, freight on its morning. */
const due = (s: State, o: Order, now: number) => o.by === 'drone' ? now >= o.at : (s.day ?? 1) >= o.at

/** Put down whatever has come: each order's goods where there is room. What came, by order; what found no room stays on its way. */
export function deliver(s: State, now = Date.now()): { order: Order; items: Item[] }[] {
  const out: { order: Order; items: Item[] }[] = []
  for (const o of s.orders ?? []) {
    if (!due(s, o, now)) continue
    const items: Item[] = [], left: Goods[] = []
    for (const g of o.goods) {
      const it = DROPS.reduce<Item | null>((got, sp) => got ?? unpack(s, g, sp), null)
      if (it) items.push(it); else left.push(g)
    }
    o.goods = left
    if (items.length) out.push({ order: o, items })
  }
  s.orders = (s.orders ?? []).filter(o => o.goods.length)
  if (!s.orders.length) delete s.orders
  return out
}
