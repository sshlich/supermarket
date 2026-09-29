import assert from 'node:assert/strict'
import { overlaps } from './grid.ts'
import { boxOf, applyDrop, find, forage, kids, lift, make, night, planDrop, send, start, stow, accepts, env, FIELD, type Item, type State } from './world.ts'

const NAMES = { basket: 'basket', crate: 'crate', cold: 'coldBox', hearth: 'hearth', rack: 'rack', cellar: 'shelf', barrel: 'barrel' } as const
type BoxId = keyof typeof NAMES
/** An empty workshop: the seven containers on the field, and `s.b` to find them by name. */
const empty = (): State & { b: Record<BoxId, number> } => {
  const s: State = { day: 1, place: 'woods', target: 0, items: [], open: [], seen: [], next: 1, log: [] }
  const b = {} as Record<BoxId, number>
  for (const [name, kind] of Object.entries(NAMES)) { const c = make(s, kind); s.items.push(c); b[name as BoxId] = c.id }
  return Object.assign(s, { b })
}
const put = (s: ReturnType<typeof empty>, box: BoxId | number, kind: string, x: number, y: number, extra: Partial<Item> = {}) => {
  const it = make(s, kind, { x, y, at: typeof box === 'number' ? box : s.b[box], ...extra })
  s.items.push(it)
  return it
}
const kinds = (s: ReturnType<typeof empty>, box: BoxId | number) => kids(s, typeof box === 'number' ? box : s.b[box]).map(o => `${o.kind}${o.n > 1 ? `x${o.n}` : ''}`).sort()

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
  assert.equal(stow(s, s.b.basket, make(s, 'berries', { n: 5 })), 0)
  assert.deepEqual(kinds(s, 'basket'), ['berriesx3', 'berriesx6'])
}
// A full basket leaves finds behind; tools in the basket help and wear.
{
  const s = empty()
  s.place = 'mine'
  const pick = put(s, 'basket', 'pickaxe', 0, 0)
  forage(s, () => 0)
  const ore = kids(s, s.b.basket).find(o => o.kind === 'copperOre')!
  assert.equal(ore.n, 4) // 1 + 3 for the pickaxe
  assert.equal(pick.cond, 90)
}
// Shift-click send: goes into a pile or a free spot; a partial send leaves the rest behind.
{
  const s = empty()
  const b = put(s, 'basket', 'berries', 0, 0, { n: 3 })
  put(s, 'crate', 'berries', 0, 0, { n: 4 })
  assert.equal(send(s, b.id, s.b.crate), true)
  assert.deepEqual(kinds(s, 'crate'), ['berriesx6', 'berries'].sort())
  assert.deepEqual(kinds(s, 'basket'), [])
}

// Dragging: onto a matching pile merges; squarely onto the same shape swaps; otherwise things shove aside.
{
  const s = empty()
  const a = put(s, 'crate', 'coal', 0, 0, { n: 2 })
  put(s, 'crate', 'coal', 3, 0, { n: 3 })
  let h = lift(s, a.id)!
  let p = planDrop(s, h, s.b.crate, 3, 0, false)!
  assert.equal(p.merge !== undefined, true)
  applyDrop(s, h, p)
  assert.deepEqual(kinds(s, 'crate'), ['coalx5'])

  const knife = put(s, 'basket', 'knife', 0, 0)
  const jar = put(s, 'crate', 'emptyJar', 5, 2)
  h = lift(s, knife.id)!
  p = planDrop(s, h, s.b.crate, 5, 2, false)!
  applyDrop(s, h, p)
  assert.deepEqual([knife.at, jar.at], [s.b.crate, s.b.basket])
  assert.deepEqual([jar.x, jar.y], [0, 0])
}
// Splitting a pile: half comes away; dropping it elsewhere makes a second pile.
{
  const s = empty()
  const a = put(s, 'crate', 'coal', 0, 0, { n: 5 })
  const h = lift(s, a.id, true)!
  assert.equal(h.item.n, 2)
  assert.equal(a.n, 3)
  applyDrop(s, h, planDrop(s, h, s.b.crate, 4, 4, false)!)
  assert.deepEqual(kinds(s, 'crate'), ['coalx2', 'coalx3'])
}

// The starting setup is valid: nothing overlaps inside any container.
{
  const s = start()
  for (const c of s.items.filter(o => kids(s, o.id).length))
    for (const a of kids(s, c.id)) for (const b of kids(s, c.id)) if (a !== b) assert.ok(!overlaps(boxOf(a), boxOf(b)))
  assert.ok(kids(s, s.target).length > 5)
}

// Containers: a lockbox takes only metal; nothing goes into itself or what it holds.
{
  const s = empty()
  const box = put(s, 'crate', 'lockbox', 0, 0)
  const chest = put(s, 'crate', 'chest', 3, 0)
  const ingot = make(s, 'copperIngot')
  assert.equal(accepts(s, box.id, ingot), true)
  assert.equal(accepts(s, box.id, make(s, 'coal')), false)
  assert.equal(stow(s, box.id, make(s, 'coal')), 1) // refused, all of it left over
  assert.equal(accepts(s, chest.id, chest), false)
  put(s, chest.id, 'lockbox', 0, 0)
  assert.equal(accepts(s, kids(s, chest.id)[0].id, chest), false) // no cycles
}
// Nesting: what the outer container does reaches what is inside, unless a container shuts it out.
{
  const s = empty()
  const chest = put(s, 'cold', 'chest', 0, 0)
  const fish = put(s, chest.id, 'fish', 0, 0, { fresh: 2 })
  const outside = put(s, 'crate', 'fish', 0, 0, { fresh: 2 })
  night(s)
  assert.equal(fish.fresh, 2) // stays cold inside a chest inside the cold box
  assert.equal(outside.fresh, 1)
  const damp = put(s, 'cellar', 'lockbox', 0, 0)
  const knife = put(s, damp.id, 'ironIngot', 0, 0)
  const tool = put(s, 'cellar', 'knife', 3, 0)
  night(s)
  assert.equal(env(s, damp.id).has('damp'), false)
  assert.equal(tool.cond, 85)
  assert.ok(knife) // metal in the lockbox is not a tool, but the point is the prop
  // A fire lights what is inside a chest set on it.
  const t = empty()
  put(t, 'hearth', 'coal', 0, 0)
  const c2 = put(t, 'hearth', 'chest', 1, 0)
  const ore = put(t, c2.id, 'copperOre', 0, 0)
  night(t)
  assert.equal(ore.kind, 'copperIngot')
  assert.equal(find(t, c2.id)!.at, t.b.hearth)
}
// Nesting is two deep at most: a chest in the crate is the limit, and a chest can't take a lockbox once it is in one.
{
  const s = empty()
  const chest = put(s, 'crate', 'chest', 0, 0)
  assert.equal(accepts(s, chest.id, make(s, 'coal')), true) // plain items always fit under the cap
  assert.equal(accepts(s, chest.id, make(s, 'lockbox')), false) // crate > chest > lockbox is three
  assert.equal(accepts(s, s.b.crate, chest), true)
  const loose = make(s, 'chest')
  const lock = make(s, 'lockbox')
  s.items.push(loose)
  stow(s, loose.id, lock) // a chest on the field takes a lockbox
  assert.equal(accepts(s, s.b.crate, loose), false) // but then it can't go into the crate
}
// Sending a container carries what is in it.
{
  const s = empty()
  const chest = put(s, 'crate', 'chest', 0, 0)
  put(s, chest.id, 'coal', 0, 0)
  assert.equal(send(s, chest.id, s.b.basket), true)
  assert.equal(find(s, chest.id)!.at, s.b.basket)
  assert.deepEqual(kinds(s, chest.id), ['coal'])
}

console.log('world ok')
