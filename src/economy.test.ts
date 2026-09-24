import assert from 'node:assert/strict'
import { buyPrice, sellPrice, spread } from './economy.ts'
import { ITEMS } from './items.ts'

assert.equal(buyPrice(ITEMS.rustBlade), 2) // small bronze
assert.equal(buyPrice(ITEMS.handCannon), 16) // medium gold
assert.equal(buyPrice(ITEMS.siegeAnvil), 6) // large bronze
assert.equal(sellPrice(ITEMS.rustBlade), 1)
assert.equal(sellPrice(ITEMS.venomVial), 8) // small diamond: 16 / 2

assert.deepEqual(spread([1, 2, 1]), [2, 4, 7]) // 1-socket gaps, centered
assert.deepEqual(spread([3, 3, 3, 1]), [0, 3, 6, 9]) // exactly full
for (const sizes of [[1], [2, 2], [1, 2, 3], [3, 3, 2, 1], [1, 1, 1, 1, 1]]) {
  const pos = spread(sizes)
  pos.forEach((p, i) => assert.ok(p >= 0 && p + sizes[i] <= 10 && (i === 0 || p >= pos[i - 1] + sizes[i - 1]), `${sizes}: ${pos}`))
}

console.log('economy: ok')
