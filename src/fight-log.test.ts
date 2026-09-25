import assert from 'node:assert/strict'
import { Fight } from './engine/combat.ts'
import { describe } from './fight-log.ts'
import { itemAt, ITEMS, transformed, type ItemDef, type ItemKey } from './items.ts'
import { skillAt, type SkillKey } from './skills.ts'

const side = (who: string, keys: ItemKey[], skills: SkillKey[] = []) => ({
  name: who,
  hp: 300,
  items: keys.map((k, i) => ({ id: `${who}${i}`, def: itemAt(k) })),
  skills: skills.map(k => ({ id: `${who}:${k}`, def: skillAt(k) })),
})
const names = {
  card: (id: string) => `[${id}]`,
  side: (i: 0 | 1) => (i === 0 ? 'You' : 'Them'),
  item: (key: string) => ITEMS[key as ItemKey]?.name ?? key,
}
const transform = (d: unknown, into: string | undefined, r: () => number) => transformed(d as ItemDef, into as ItemKey | undefined, r)

// Every event but a skill firing gets a line, across fights using most mechanics.
const fights = [
  new Fight(side('A', ['rustBlade', 'brassBeetle', 'emberFlask', 'fieldKit'], ['kindling']), side('B', ['venomVial', 'ironPot', 'frostLantern', 'tarPot'], ['openingGuard'])),
  new Fight(side('A', ['wreckingBall', 'trickMirror', 'rustBlade', 'bloodstone']), side('B', ['repairKit', 'antidote', 'luckyDagger', 'warBanner'], ['goldRush']), 2, { transform }),
]
for (const f of fights) {
  f.run()
  for (const e of f.events) {
    const line = describe(e, names)
    if (e.kind === 'skill') assert.equal(line, null)
    else assert.ok(line && !line.includes('undefined'), `${e.kind}: ${line}`)
  }
}

// Why: an effect set off by another card says so; plain uses don't.
{
  const f = fights[0]
  const beetleHaste = f.events.find(e => e.kind === 'haste' && e.item === 'A1')!
  assert.match(describe(beetleHaste, names)!, /^\[A1\] hasted itself for \[haste 1\]s <i>when \[A0\] was used<\/i>$/)
  const kindlingBurn = f.events.find(e => e.kind === 'burn' && e.from === 'A:kindling')!
  assert.match(describe(kindlingBurn, names)!, /^\[A:kindling\] applied \[burn 2\] to Them <i>when \[A\d\] was used<\/i>$/)
  assert.equal(describe(f.events.find(e => e.kind === 'shield' && e.cause?.on === 'use')!, names), `[B1] gave Them [shield 10]`)
  assert.match(describe(f.events.find(e => e.kind === 'shield' && e.cause?.on === 'fightStart')!, names)!, /at the start of the fight/)
  assert.equal(describe({ t: 0, kind: 'end', winner: 0 }, names), 'You won!')
}

console.log('fight-log: ok')
