import assert from 'node:assert/strict'
import { buyPrice, sellPrice } from './economy.ts'
import { ITEM_KEYS, ITEMS } from './items.ts'
import { offerPrice, rollOffer, rollStock, rollTier } from './shop.ts'
import { reachable } from './tiers.ts'

let seed = 7
const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

// Tiers by day: only Bronze at first, higher tiers later.
for (let i = 0; i < 200; i++) assert.equal(rollTier(1, random), 'bronze')
const late = new Set(Array.from({ length: 400 }, () => rollTier(10, random)))
assert.ok(late.has('diamond') && late.has('gold') && !late.has('bronze'))

// Offers are always a tier the item can be (Legendary items only as Legendary); rolls fall to lower tiers when needed.
for (const day of [1, 4, 6, 10]) {
  for (let i = 0; i < 200; i++) {
    const o = rollOffer(day, ITEM_KEYS, random)!
    assert.ok(reachable(ITEMS[o.key].tier).includes(o.tier), `${o.key} as ${o.tier}`)
  }
}
assert.equal(rollOffer(1, ['towerShield'], random), null) // a Silver item can't be offered on a Bronze-only day

// Enchanted offers show up sometimes, and cost half again.
const offers = Array.from({ length: 500 }, () => rollOffer(3, ITEM_KEYS, random)!)
assert.ok(offers.some(o => o.enchant) && offers.filter(o => o.enchant).length < 150)
assert.equal(buyPrice({ size: 2, tier: 'silver', enchant: 'fiery' }), 12)
assert.equal(sellPrice({ size: 2, tier: 'silver', enchant: 'fiery' }), 6)
const enchanted = offers.find(o => o.enchant)!
assert.equal(offerPrice(enchanted), Math.ceil(offerPrice({ ...enchanted, enchant: undefined }) * 1.5))

// A stock fills the row without overflowing it.
for (let i = 0; i < 50; i++) assert.ok(rollStock(5, ITEM_KEYS, random).reduce((n, o) => n + ITEMS[o.key].size, 0) <= 10)

console.log('shop: ok')
