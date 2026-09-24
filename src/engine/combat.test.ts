import assert from 'node:assert/strict'
import type { Enchant } from '../enchant.ts'
import { itemAt, type ItemKey } from '../items.ts'
import { skillAt, type SkillKey } from '../skills.ts'
import type { Tier } from '../tiers.ts'
import { Fight } from './combat.ts'

/** An item key, or [key, tier, enchantment]. */
type Key = ItemKey | [ItemKey, Tier?, Enchant?]
const def = (k: Key) => (typeof k === 'string' ? itemAt(k) : itemAt(k[0], k[1], k[2]))
const name = (k: Key) => (typeof k === 'string' ? k : k[0])
const side = (who: string, hp: number, keys: Key[], skills: SkillKey[] = []) => ({
  name: who,
  hp,
  items: keys.map((k, i) => ({ id: `${who}${i}:${name(k)}`, def: def(k) })),
  skills: skills.map(k => ({ id: `${who}:${k}`, def: skillAt(k) })),
})
const fight = (a: Key[], b: Key[], hpA = 100, hpB = 100, seed = 1, skillsA: SkillKey[] = [], skillsB: SkillKey[] = []) =>
  new Fight(side('A', hpA, a, skillsA), side('B', hpB, b, skillsB), seed)
const uses = (f: Fight, id: string) => f.events.filter(e => e.kind === 'use' && e.item?.endsWith(id)).map(e => e.t)
const until = (f: Fight, t: number) => {
  while (f.t < t && f.winner === null) f.step()
  return f
}

// Rust Blade: 5 damage every 3 s -> a 20 hp opponent dies on the 4th hit at 12 s.
{
  const f = fight(['rustBlade'], [], 100, 20).run()
  assert.equal(f.winner, 0)
  assert.equal(f.t, 12_000)
}

// Shield soaks damage before Health.
{
  const f = until(fight(['ironPot'], ['rustBlade']), 6000)
  const a = f.sides[0]
  assert.equal(a.hp, 95) // hit at 3 s before any shield
  assert.equal(a.shield, 5) // 10 shield at 5 s, hit for 5 at 6 s
}

// Burn ticks every 500 ms for its stack, losing 1 each tick: 4+3+2+1.
{
  const f = until(fight(['emberFlask'], []), 7000)
  assert.equal(f.sides[1].hp, 90)
  assert.equal(f.sides[1].burn, 0)
}

// Poison ticks every second and ignores Shield.
{
  const f = until(fight(['venomVial'], ['ironPot']), 6000)
  assert.equal(f.sides[1].hp, 91) // 3 at 4, 5 and 6 s
  assert.equal(f.sides[1].shield, 10)
}

// Multicast 3: every cast deals its damage and applies its burn, same frame.
{
  const f = until(fight(['handCannon'], [], 100, 200), 7000)
  assert.equal(f.sides[1].hp, 176)
  assert.equal(f.sides[1].burn, 6)
  assert.equal(f.events.filter(e => e.kind === 'use').length, 3)
}

// Brass Beetle is hasted 1 s when its neighbor is used at 3 s, so it fires at 4 s instead of 5 s.
{
  const f = until(fight(['rustBlade', 'brassBeetle'], [], 100, 1000), 5000)
  const first = f.events.find(e => e.kind === 'use' && e.item?.endsWith('brassBeetle'))
  assert.equal(first?.t, 4000)
}

// Ember Flask's aura gives the other Burn items +1 burn.
{
  const f = until(fight(['emberFlask', 'handCannon'], []), 100)
  const cannon = f.sides[0].items[1]
  assert.equal(cannon.attrs.burn, 3)
  assert.equal(cannon.base.burn, 2)
}

// Ammo 6: fires six times, then stays charged and silent.
{
  const f = fight(['sparkPistol'], [], 10_000, 10_000).run()
  assert.equal(f.events.filter(e => e.kind === 'use').length, 6)
  assert.equal(f.winner, -1) // storm doesn't finish 10k hp by 90 s
  assert.equal(f.t, 90_000)
}

// Storm from 30 s: 4, 9, 14, ... per second, through Shield. Both at 100 hp die together at 36 s.
{
  const f = fight([], []).run()
  assert.equal(f.winner, -1)
  assert.equal(f.t, 36_000)
}

// Same seed, same fight (random Haste targets).
{
  const run = (seed: number) => JSON.stringify(fight(['fieldKit', 'rustBlade', 'handCannon'], ['siegeAnvil', 'venomVial'], 300, 300, seed).run().events)
  assert.equal(run(42), run(42))
}

// ---------------------------------------------------------------- test set: one check per mechanic

// Frost Lantern freezes more items as it goes up: 1 at Silver, 3 at Diamond.
{
  const frozen = (tier: Tier) => until(fight([['frostLantern', tier]], ['rustBlade', 'ironPot', 'sparkPistol']), 6000).events.filter(e => e.kind === 'freeze').length
  assert.equal(frozen('silver'), 1)
  assert.equal(frozen('diamond'), 3)
}

// Tar Pot's cooldown drops with tier: 6 s at Bronze, 3 s at Diamond.
{
  assert.equal(uses(until(fight(['tarPot'], ['rustBlade']), 6000), 'tarPot')[0], 6000)
  assert.equal(uses(until(fight([['tarPot', 'diamond']], ['rustBlade']), 6000), 'tarPot')[0], 3000)
}

// Wind-up Key charges its neighbors 1 s (Bronze), 3 s (Diamond): the Rust Blade's first use moves up.
{
  assert.equal(uses(until(fight(['windupKey', 'rustBlade'], [], 100, 1000), 5000), 'rustBlade')[1], 5000) // 3 s, key at 4 s: 5 s instead of 6 s
  assert.equal(uses(until(fight([['windupKey', 'diamond'], 'rustBlade'], [], 100, 1000), 5000), 'rustBlade')[1], 4000)
}

// Ammo Crate reloads the Spark Pistol, so it fires more than its 6 shots.
{
  const f = fight(['sparkPistol', 'ammoCrate'], [], 10_000, 10_000).run()
  assert.ok(uses(f, 'sparkPistol').length > 6)
  assert.ok(f.events.some(e => e.kind === 'reload'))
}

// Herb Pouch: Regen heals every second.
{
  const f = until(fight(['herbPouch'], ['rustBlade']), 7000)
  assert.ok(f.events.some(e => e.kind === 'heal' && e.from === 'regen'))
}

// Leech Knife heals for half its damage at Silver.
{
  const f = until(fight(['leechKnife'], ['rustBlade']), 4000)
  const hit = f.events.find(e => e.kind === 'damage' && e.from?.endsWith('leechKnife'))!
  const heal = f.events.find(e => e.kind === 'heal' && e.from?.endsWith('leechKnife'))!
  assert.equal(heal.amount, hit.amount! / 2)
}

// Whetstone gives adjacent Weapons +4 damage (Bronze), +32 (Diamond), but not non-Weapons.
{
  const f = until(fight(['rustBlade', 'whetstone', 'ironPot'], []), 100)
  assert.equal(f.sides[0].items[0].attrs.damage, 9)
  assert.equal(f.sides[0].items[2].attrs.damage, 0)
  assert.equal(until(fight(['rustBlade', ['whetstone', 'diamond']], []), 100).sides[0].items[0].attrs.damage, 37)
}

// Hungry Sword hits for 10, then 15, 20...
{
  const f = until(fight(['hungrySword'], [], 100, 1000), 15_000)
  assert.deepEqual(f.events.filter(e => e.kind === 'damage' && e.from?.endsWith('hungrySword')).map(e => e.amount), [10, 15, 20])
}

// Kindling Torch gains Burn whenever you Burn, including from a skill.
{
  const f = until(fight(['kindlingTorch', 'rustBlade'], [], 100, 1000, 1, ['kindling']), 4000)
  assert.equal(f.sides[0].items[0].attrs.burn, 3 + 2) // Rust Blade at 3 s (Kindling burns), its own use at 4 s
}

// Signal Flare hastes the leftmost item and charges the rightmost.
{
  const f = until(fight(['rustBlade', 'signalFlare', 'ironPot'], []), 6000)
  const flare = f.events.filter(e => e.from?.endsWith('signalFlare'))
  assert.ok(flare.some(e => e.kind === 'haste' && e.item?.endsWith('rustBlade')))
  assert.ok(flare.some(e => e.kind === 'charge' && e.item?.endsWith('ironPot')))
}

// Mirror Shield: shield = twice the left item's damage, heal = the right item's shield.
{
  const f = until(fight(['rustBlade', 'mirrorShield', 'ironPot'], ['rustBlade']), 6000)
  assert.ok(f.events.some(e => e.kind === 'shield' && e.from?.endsWith('mirrorShield') && e.amount === 10))
  assert.ok(f.events.some(e => e.kind === 'heal' && e.from?.endsWith('mirrorShield') && e.amount === 10))
}

// War Banner: haste at fight start, 10 shield per Weapon, and damage only with 3+ Weapons.
{
  const two = until(fight(['warBanner', 'rustBlade', 'rustBlade'], [], 100, 1000), 8000)
  assert.ok(two.events.some(e => e.kind === 'haste' && e.t === 0))
  assert.ok(two.events.some(e => e.kind === 'shield' && e.amount === 20))
  assert.ok(!two.events.some(e => e.kind === 'damage' && e.from?.endsWith('warBanner')))
  const three = until(fight(['warBanner', 'rustBlade', 'rustBlade', 'rustBlade'], [], 100, 1000), 8000)
  assert.ok(three.events.some(e => e.kind === 'damage' && e.from?.endsWith('warBanner') && e.amount === 30))
}

// Blizzard Orb: slows everything, freezes enemy non-Weapons, hastes your small items.
{
  const f = until(fight(['blizzardOrb', 'rustBlade'], ['rustBlade', 'ironPot']), 9000)
  const orb = f.events.filter(e => e.from?.endsWith('blizzardOrb'))
  assert.equal(orb.filter(e => e.kind === 'slow').length, 4)
  assert.deepEqual(orb.filter(e => e.kind === 'freeze').map(e => e.item), ['B1:ironPot'])
  assert.deepEqual(orb.filter(e => e.kind === 'haste').map(e => e.item), ['A1:rustBlade'])
}

// Echo Bell charges whichever neighbor was just used.
{
  const f = until(fight(['rustBlade', 'echoBell'], [], 100, 1000), 3000)
  assert.ok(f.events.some(e => e.kind === 'charge' && e.item === 'A0:rustBlade' && e.t === 3000))
}

// Lucky Dagger crits sometimes (seeded), and a crit charges it.
{
  const f = fight([['luckyDagger', 'diamond']], [], 100, 10_000, 7).run()
  assert.ok(f.events.some(e => e.kind === 'use' && e.crit))
  assert.ok(f.events.some(e => e.kind === 'charge' && e.item?.endsWith('luckyDagger')))
}

// ---------------------------------------------------------------- skills

// Opening Guard: shield at fight start; the skill logs that it fired.
{
  const f = until(fight([], [], 100, 100, 1, ['openingGuard']), 50)
  assert.equal(f.sides[0].shield, 15)
  assert.ok(f.events.some(e => e.kind === 'skill' && e.item === 'A:openingGuard'))
}

// Sharp Eye: an aura from a skill on your Weapons only.
{
  const f = until(fight(['rustBlade', 'ironPot'], [], 100, 100, 1, ['sharpEye']), 50)
  assert.equal(f.sides[0].items[0].attrs.crit, 10)
  assert.equal(f.sides[0].items[1].attrs.crit, 0)
}

// Quick Hands: using the leftmost item charges the rightmost; a skill has no neighbors.
{
  const f = until(fight(['rustBlade', 'ironPot'], [], 100, 1000, 1, ['quickHands']), 3000)
  assert.ok(f.events.some(e => e.kind === 'charge' && e.item === 'A1:ironPot' && e.t === 3000))
}

// Herbalist: healing grants Regen. Iron Will: needs two Armor items.
{
  assert.ok(until(fight(['fieldKit'], [], 100, 100, 1, ['herbalist']), 4000).sides[0].regen > 0)
  assert.equal(until(fight(['ironPot'], [], 100, 100, 1, ['ironWill']), 50).sides[0].shield, 0)
  assert.equal(until(fight(['ironPot', 'towerShield'], [], 100, 100, 1, ['ironWill']), 50).sides[0].shield, 40)
}

// Enemy skills work for the enemy: B's Opening Guard shields B.
{
  const f = until(fight([], [], 100, 100, 1, [], ['openingGuard']), 50)
  assert.equal(f.sides[1].shield, 15)
  assert.equal(f.sides[0].shield, 0)
}

// Enchanted items fight with their enchantment: Shielded Rust Blade gains 5 shield per use.
{
  const f = until(fight([['rustBlade', undefined, 'shielded']], []), 3000)
  assert.equal(f.sides[0].shield, 5)
}

console.log('combat: ok')
