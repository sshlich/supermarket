import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { iconName, MAX_ICONS } from './art.ts'
import { enchantRule, ENCHANT_KEYS } from './enchant.ts'
import { canEnchant, ITEM_KEYS, itemAt, ITEMS } from './items.ts'
import { SKILL_KEYS, skillAt, SKILLS } from './skills.ts'
import { at, grows, nextTier, steps, tiers } from './tiers.ts'

// ---------------------------------------------------------------- upgrade paths

// Paths: explicit lists (short ones repeat their last value), x2 growth, steps.
assert.deepEqual([0, 1, 2, 3].map(s => at(tiers(1, 1, 2, 3), s)), [1, 1, 2, 3])
assert.deepEqual([0, 1, 2, 3].map(s => at(tiers(8, 7), s)), [8, 7, 7, 7])
assert.deepEqual([0, 1, 2, 3].map(s => at(grows(5), s)), [5, 10, 20, 40])
assert.deepEqual([0, 1, 2, 3].map(s => at(steps(6, -1), s)), [6, 5, 4, 3])

// T1/T2 stats double per tier from the starting tier; other plain numbers stay put.
assert.deepEqual(itemAt('rustBlade', 'diamond').stats, { damage: 40 }) // 5 -> 10 -> 20 -> 40
assert.deepEqual(itemAt('towerShield', 'gold').stats, { shield: 40 }) // silver 20 -> gold 40
assert.deepEqual(itemAt('handCannon', 'diamond').stats, { damage: 16, burn: 4 }) // gold 8/2 -> diamond
assert.deepEqual(itemAt('herbPouch', 'gold').stats, { heal: 32, regen: 8 })
assert.equal(itemAt('rustBlade', 'diamond').cooldown, 3)
assert.equal(itemAt('handCannon', 'diamond').multicast, 3)

// Custom paths: a cooldown that drops, a haste that climbs, an irregular charge, a crit chance.
assert.deepEqual(itemAt('tarPot').paths.cooldown, [6, 5, 4, 3])
assert.equal(itemAt('tarPot', 'gold').cooldown, 4)
assert.deepEqual(itemAt('marchingDrum').paths.haste, [1, 2, 3, 4])
assert.deepEqual(itemAt('windupKey').paths.charge, [1, 1, 2, 3])
assert.deepEqual(itemAt('luckyDagger').paths.crit, [25, 35, 45, 55])
assert.deepEqual(itemAt('frostLantern').paths.targets, [1, 2, 3]) // silver start: three tiers
assert.equal(itemAt('frostLantern').paths.freeze, undefined) // doesn't change, so no path

// Legendary is its own single tier.
assert.equal(nextTier('legendary'), null)
assert.equal(itemAt('blizzardOrb').tier, 'legendary')
assert.throws(() => itemAt('rustBlade', 'legendary'))
assert.throws(() => itemAt('towerShield', 'bronze')) // below its starting tier

// ---------------------------------------------------------------- enchantments

const ench = (key: Parameters<typeof itemAt>[0], e: Parameters<typeof itemAt>[2], tier?: Parameters<typeof itemAt>[1]) => itemAt(key, tier, e)

// T1 onto a T1 item: adds the stat equal to its biggest T1 number, on the same use.
{
  const d = ench('rustBlade', 'shielded')
  assert.deepEqual(d.stats, { damage: 5, shield: 5 })
  assert.deepEqual(d.abilities[0].do.map(a => a.do), ['damage', 'shield'])
  assert.equal(d.enchant, 'shielded')
}
// ...and it grows with the item: a Diamond Shielded Rust Blade is 40 / 40.
assert.deepEqual(ench('rustBlade', 'shielded', 'diamond').stats, { damage: 40, shield: 40 })
assert.deepEqual(ench('rustBlade', 'shielded').paths.shield, [5, 10, 20, 40])

// Matching enchantment doubles what's there.
assert.deepEqual(ench('rustBlade', 'obsidian').stats, { damage: 10 })
assert.deepEqual(ench('ironPot', 'shielded').stats, { shield: 20 })
assert.deepEqual(ench('emberFlask', 'fiery').stats, { burn: 8 })

// T2 onto a T1 item: 10% of its biggest T1 number (at least 1).
assert.deepEqual(ench('siegeAnvil', 'fiery').stats, { damage: 30, shield: 15, burn: 3 })
assert.deepEqual(ench('rustBlade', 'toxic').stats, { damage: 5, poison: 1 })

// No T1: T2 -> T2 is equal, T2 -> T1 is x10.
assert.deepEqual(ench('venomVial', 'fiery').stats, { poison: 3, burn: 3 })
assert.deepEqual(ench('venomVial', 'shielded').stats, { poison: 3, shield: 30 })

// Scalers: a matching enchantment doubles the gain; another one adds a parallel gain.
{
  const obsidian = ench('hungrySword', 'obsidian')
  assert.equal(obsidian.stats.damage, 20)
  assert.deepEqual(obsidian.abilities[0].do.find(a => a.do === 'modify'), { do: 'modify', stat: 'damage', add: { val: 'gain', times: 2 }, targets: { pick: 'self' } })
  const mossy = ench('kindlingTorch', 'mossy')
  assert.equal(mossy.stats.regen, 3) // T2 -> T2 base
  assert.ok(mossy.abilities[1].do.some(a => a.do === 'modify' && a.stat === 'regen')) // and gains Regen as it gains Burn
}

// Auras count as gains: Obsidian doubles a Whetstone's bonus, Fiery makes it hand out Burn too.
assert.deepEqual(ench('whetstone', 'obsidian').auras![0].add, { val: 'bonus', times: 2 })
assert.equal(ench('whetstone', 'fiery').auras!.length, 2)

// Heavy/Turbo/Frozen: add the effect to the use, or double one that's there.
{
  const heavy = ench('rustBlade', 'heavy')
  assert.ok(heavy.abilities[0].do.some(a => a.do === 'slow'))
  assert.equal(heavy.vals!.heavy, 0.5) // 3 s cooldown: 0.6x of 1 s, rounded to the half second
  assert.equal(ench('siegeAnvil', 'heavy').vals!.heavy, 2) // slow item, 9 s: capped at 2x
  const turbo = ench('marchingDrum', 'turbo')
  assert.deepEqual(turbo.abilities[0].do.find(a => a.do === 'haste'), { do: 'haste', seconds: { val: 'haste', times: 2 }, targets: { pick: 'neighbors', where: { has: 'cooldown' } } })
}

// Shiny: +1 Multicast.
assert.equal(ench('rustBlade', 'shiny').multicast, 2)
assert.equal(ench('handCannon', 'shiny').multicast, 4)

// What the rules can't work with: Mirror Shield has no stats of its own; passives can't be Heavy or Shiny.
assert.equal(canEnchant('mirrorShield', 'shielded'), false)
assert.equal(canEnchant('mirrorShield', 'heavy'), true)
assert.equal(canEnchant('echoBell', 'shiny'), false)
assert.equal(canEnchant('echoBell', 'heavy'), false)
assert.equal(enchantRule(itemAt('echoBell'), 'turbo'), null)
assert.deepEqual(ench('mirrorShield', 'shielded').stats, {}) // not applicable: comes back unenchanted
assert.equal(ench('mirrorShield', 'shielded').enchant, undefined)

// The rule never touches the item it was given.
{
  const d = itemAt('rustBlade')
  enchantRule(d, 'shielded')
  assert.deepEqual(d.abilities[0].do.map(a => a.do), ['damage'])
}

// Every item can take at least one enchantment, or it's a passive with nothing to build on.
for (const k of ITEM_KEYS) assert.ok(ENCHANT_KEYS.some(e => canEnchant(k, e)) || !ITEMS[k].abilities.length || !('cooldown' in ITEMS[k]), k)

// ---------------------------------------------------------------- skills

assert.deepEqual(skillAt('openingGuard', 'diamond').stats, { shield: 120 }) // 15 doubles like an item stat
assert.deepEqual(skillAt('quickHands').paths.charge, [1, 1, 2, 3])
assert.deepEqual(skillAt('coldSnap').paths.freeze, [1, 1.5]) // gold start: gold, diamond
assert.equal(skillAt('bloodthirst', 'diamond').vals!.bonus, 30)

// ---------------------------------------------------------------- art

// Every icon the content names has a file (run `npm run icons` if this fails), at most three per card.
for (const c of [...Object.values(ITEMS), ...Object.values(SKILLS)]) {
  assert.ok(c.art.icons.length <= MAX_ICONS, `${c.name}: at most ${MAX_ICONS} icons`)
  for (const i of c.art.icons) assert.ok(existsSync(new URL(`./icons/${iconName(i)}.svg`, import.meta.url)), `missing icon ${iconName(i)}: npm run icons`)
}
assert.ok(SKILL_KEYS.length >= 8)

console.log('items: ok')
