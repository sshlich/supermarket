import assert from 'node:assert/strict'
import { overlaps } from './grid.ts'
import { applyDrop, boxOf, forage, lift, make, night, planDrop, send, start, stow, where, type BoxId, type Item, type State } from './world.ts'

const empty = (): State => ({ day: 1, place: 'woods', target: 'crate', boxes: { basket: [], crate: [], cold: [], hearth: [], rack: [], cellar: [], barrel: [] }, seen: [], next: 1, log: [] })
const put = (s: State, box: BoxId, kind: string, x: number, y: number, extra: Partial<Item> = {}) => {
  const it = make(s, kind, { x, y, ...extra })
  s.boxes[box].push(it)
  return it
}
const kinds = (s: State, box: BoxId) => s.boxes[box].map(o => `${o.kind}${o.n > 1 ? `x${o.n}` : ''}`).sort()

// A lit hearth burns one fuel, smelts ore (keeping its grade), boils seawater to salt and burns herbs.
{
  const s = empty()
  put(s, 'hearth', 'coal', 0, 0, { n: 2 })
  const ore = put(s, 'hearth', 'copperOre', 1, 0, { n: 3, grade: 70 })
  put(s, 'hearth', 'seawater', 2, 0)
  put(s, 'hearth', 'moonleaf', 3, 0)
  night(s)
  assert.deepEqual(kinds(s, 'hearth'), ['coal', 'copperIngotx3', 'saltJar'])
  assert.equal(ore.grade, 70)
}
// No dry fuel: nothing smelts. Only wet wood: it smokes the fish beside it.
{
  const s = empty()
  put(s, 'hearth', 'copperOre', 0, 0)
  put(s, 'hearth', 'firewood', 0, 1, { moist: 60 })
  put(s, 'hearth', 'fish', 2, 1)
  night(s)
  assert.deepEqual(kinds(s, 'hearth'), ['copperOre', 'firewood', 'smokedFish'])
}
// A worn tool beside an iron ingot on a lit hearth is mended, using the ingot.
{
  const s = empty()
  put(s, 'hearth', 'coal', 3, 2)
  const knife = put(s, 'hearth', 'knife', 0, 0, { cond: 30 })
  put(s, 'hearth', 'ironIngot', 1, 0)
  night(s)
  assert.equal(knife.cond, 100)
  assert.deepEqual(kinds(s, 'hearth'), ['knife'])
}
// The rack dries moonleaf in two nights; fish on the rack go off twice as fast.
{
  const s = empty()
  const leaf = put(s, 'rack', 'moonleaf', 0, 0)
  const fish = put(s, 'rack', 'fish', 2, 0, { fresh: 2 })
  night(s)
  assert.equal(leaf.kind, 'moonleaf')
  assert.equal(fish.rotten, true)
  night(s)
  assert.equal(leaf.kind, 'driedMoonleaf')
}
// The cellar: spores sprout a glowcap beside them, then feed it; tools rust; dried leaf goes soft.
{
  const s = empty()
  put(s, 'cellar', 'spores', 0, 0)
  const knife = put(s, 'cellar', 'knife', 5, 0)
  const leaf = put(s, 'cellar', 'driedMoonleaf', 5, 2)
  night(s)
  assert.deepEqual(kinds(s, 'cellar'), ['glowcap', 'knife', 'moonleaf', 'spores'])
  assert.equal(knife.cond, 85)
  assert.equal(leaf.kind, 'moonleaf')
  night(s)
  assert.deepEqual(kinds(s, 'cellar'), ['glowcapx2', 'knife', 'moonleaf', 'spores'])
}
// The barrel: berries beside yeast ferment into wine on the third night; berries away from it just spoil.
{
  const s = empty()
  put(s, 'barrel', 'yeast', 0, 0)
  const b = put(s, 'barrel', 'berries', 1, 0, { n: 5 })
  const lone = put(s, 'barrel', 'berries', 2, 2, { n: 1 })
  night(s); night(s)
  assert.equal(b.kind, 'berries')
  night(s)
  assert.equal(b.kind, 'berryWine')
  assert.equal(b.n, 3)
  assert.equal(lone.fresh, 1)
  night(s)
  assert.equal(b.age, 1)
}
// Salt: raw fish beside a salt jar gets packed; the jar runs out after three.
{
  const s = empty()
  const jar = put(s, 'crate', 'saltJar', 2, 0)
  put(s, 'crate', 'fish', 0, 0)
  put(s, 'crate', 'fish', 0, 1)
  put(s, 'crate', 'fish', 3, 0)
  night(s)
  assert.deepEqual(kinds(s, 'crate'), ['emptyJar', 'saltedFish', 'saltedFish', 'saltedFish'])
  assert.equal(jar.kind, 'emptyJar')
}
// Rot spreads: berries beside something rotten lose two nights instead of one. The cold box stops all of it.
{
  const s = empty()
  put(s, 'crate', 'fish', 0, 0, { fresh: 0, rotten: true })
  const b = put(s, 'crate', 'berries', 2, 0)
  const cold = put(s, 'cold', 'fish', 0, 0)
  night(s)
  assert.equal(b.fresh, 2)
  assert.equal(cold.fresh, 2)
}

// Stowing tops up piles first, then takes free spots.
{
  const s = empty()
  put(s, 'basket', 'berries', 0, 0, { n: 4 })
  assert.equal(stow(s, 'basket', make(s, 'berries', { n: 5 })), 0)
  assert.deepEqual(kinds(s, 'basket'), ['berriesx3', 'berriesx6'])
}
// A full basket leaves finds behind; tools in the basket help and wear.
{
  const s = empty()
  s.place = 'mine'
  const pick = put(s, 'basket', 'pickaxe', 0, 0)
  forage(s, () => 0)
  const ore = s.boxes.basket.find(o => o.kind === 'copperOre')!
  assert.equal(ore.n, 4) // 1 + 3 for the pickaxe
  assert.equal(pick.cond, 90)
}
// Shift-click send: goes into a pile or a free spot; a partial send leaves the rest behind.
{
  const s = empty()
  const b = put(s, 'basket', 'berries', 0, 0, { n: 3 })
  put(s, 'crate', 'berries', 0, 0, { n: 4 })
  assert.equal(send(s, b.id, 'crate'), true)
  assert.deepEqual(kinds(s, 'crate'), ['berriesx6', 'berries'].sort())
  assert.deepEqual(kinds(s, 'basket'), [])
}

// Dragging: onto a matching pile merges; squarely onto the same shape swaps; otherwise things shove aside.
{
  const s = empty()
  const a = put(s, 'crate', 'coal', 0, 0, { n: 2 })
  put(s, 'crate', 'coal', 3, 0, { n: 3 })
  let h = lift(s, a.id)!
  let p = planDrop(s, h, 'crate', 3, 0, false)!
  assert.equal(p.merge !== undefined, true)
  applyDrop(s, h, p)
  assert.deepEqual(kinds(s, 'crate'), ['coalx5'])

  const knife = put(s, 'basket', 'knife', 0, 0)
  const jar = put(s, 'crate', 'emptyJar', 5, 2)
  h = lift(s, knife.id)!
  p = planDrop(s, h, 'crate', 5, 2, false)!
  applyDrop(s, h, p)
  assert.deepEqual([where(s, knife.id)!.box, where(s, jar.id)!.box], ['crate', 'basket'])
  assert.deepEqual([jar.x, jar.y], [0, 0])
}
// Splitting a pile: half comes away; dropping it elsewhere makes a second pile.
{
  const s = empty()
  const a = put(s, 'crate', 'coal', 0, 0, { n: 5 })
  const h = lift(s, a.id, true)!
  assert.equal(h.item.n, 2)
  assert.equal(a.n, 3)
  applyDrop(s, h, planDrop(s, h, 'crate', 4, 4, false)!)
  assert.deepEqual(kinds(s, 'crate'), ['coalx2', 'coalx3'])
}

// The starting setup is valid: nothing overlaps.
{
  const s = start()
  for (const items of Object.values(s.boxes))
    for (const a of items) for (const b of items) if (a !== b) assert.ok(!overlaps(boxOf(a), boxOf(b)))
  assert.ok(s.boxes.crate.length > 5 && s.boxes.basket.length > 4)
}

console.log('world ok')
