import assert from 'node:assert/strict'
import { DIALS, RELICS, type Dial } from '../data/relics.ts'
import { apply, type Action } from './apply.ts'
import { make } from './containers.ts'
import { belt, driftPerStep, relicClass } from './items.ts'
import { fact } from './knowledge.ts'
import { encounterChance, siteAt, yourHit } from './run.ts'
import { homeNight } from './seam.ts'
import { masons, newGame, type State } from './state.ts'
import { reads } from './access.ts'

const act = (s: State, a: Action) => apply(s, a)
const quiet = () => { const s = newGame(7); for (const L of Object.values(s.levels)) L.N = {}; return s }
const at = (s: State, level: string, site: string) => { s.run = { level, site, noise: 0 }; return s }

// Class (10.4) from total magnitude and the rarest property reproduces Appendix D.
assert.deepEqual(Object.keys(RELICS).map(relicClass), ['C', 'C', 'B', 'B', 'C', 'B', 'A', 'A'])

// M6: each relic can be identified in 6 nights or fewer: one dial setting a night, one property each; knowing all
// of them shows its Class.
for (const kind of Object.keys(RELICS)) {
  const s = newGame(7)
  s.villagers = s.villagers.slice(0, 1)
  s.C.lab = [make(s, kind)]
  let nights = 0
  for (const dial of Object.keys(DIALS) as Dial[]) {
    s.lab.dial = dial
    homeNight(s)
    nights++
    if (fact(s, `R:${kind}:class`)) break
  }
  assert.ok(nights <= 6, `${kind}: ${nights} nights`)
  assert.equal(fact(s, `R:${kind}:class`)?.value, relicClass(kind))
  for (const [p, v] of Object.entries(RELICS[kind].props)) assert.equal(fact(s, `R:${kind}:${p}`)?.value, v)
}

// The Receiver is loud: the Seam's attention rises by the relic's SIGNAL ×5.
{
  const s = newGame(7)
  s.blackout = true
  s.C.lab = [make(s, 'chimeShard')]
  s.C.stores = []
  s.lab.dial = 'receiver'
  homeNight(s)
  assert.equal(s.seamA, 15 + 9) // the test, and the shard's own Signal leaking from the open bench
}

// M6: belt effects come from properties alone. Lightness hushes steps, a light shows hazards and helps evading,
// charge hits harder, preserving heals and resists rot, Signal reads terminals and calls attention, weight resists falls.
{
  const walk = (kinds: string[]) => {
    const s = at(quiet(), 'galleries', 'longGallery')
    s.C.belt = kinds.map(k => make(s, k))
    return s
  }
  const hush = walk(['hollowPair'])
  act(hush, { type: 'go', key: 'site:hatch' })
  assert.equal(hush.levels.galleries.A, 0, 'negative MASS: no noise')
  const lit = walk(['stubCandle'])
  act(lit, { type: 'go', key: 'site:grubNest' })
  assert.deepEqual([lit.runner.hp, fact(lit, 'T:grubNest:hazard')?.src], [10, 'belt'])
  const knot = walk(['hummingKnot'])
  knot.run!.enc = { sp: 'grub', n: 1, killed: 0, dmg: 0, round: 0, hostile: false }
  assert.equal(yourHit(knot), 1 + 3)
  const lung = walk(['wetLung'])
  lung.runner.hp = 5
  act(lung, { type: 'go', key: 'site:grubNest' })
  act(lung, { type: 'go', key: 'site:longGallery' })
  assert.equal(lung.runner.hp, 6, '+1 HP every 2 steps; the Rot Bloom resisted')
  const shard = walk(['chimeShard'])
  assert.equal(reads(shard), true)
  act(shard, { type: 'go', key: 'site:hatch' })
  assert.equal(shard.levels.galleries.A, 1 + 3, 'a move, and SIGNAL 3 for the step')
  const heavy = walk(['unbuilder'])
  assert.equal(belt(heavy).MASS, 3)
  // Drift a step: 1 for a Class C relic, 2 for B, 3 for A.
  assert.deepEqual([walk(['stillCoil']), walk(['chimeShard']), walk(['choirHeart'])].map(driftPerStep), [1, 2, 3])
  // What draws things draws them: a light makes moths and crabs likelier to find you.
  const s = at(newGame(7), 'galleries', 'longGallery')
  const before = encounterChance(s, 'galleries', 'longGallery')
  s.C.belt = [make(s, 'stubCandle')]
  assert.ok(encounterChance(s, 'galleries', 'longGallery') > before)
}

// Use (Appendix D): the Stub Candle's flare scatters moths once a day; the Chime Shard stops the Auditors once and
// cracks; the Unbuilder at a Mason Works takes a course of building away for good, kills what's there, and wakes the level.
{
  const s = at(quiet(), 'galleries', 'longGallery')
  const candle = make(s, 'stubCandle')
  s.C.belt = [candle]
  s.run!.enc = { sp: 'moth', n: 20, killed: 0, dmg: 0, round: 0, hostile: true }
  act(s, { type: 'use', id: candle.id })
  assert.equal(s.run!.enc, undefined)
  s.run!.enc = { sp: 'moth', n: 20, killed: 0, dmg: 0, round: 0, hostile: true }
  assert.equal(act(s, { type: 'use', id: candle.id })[0].kind, 'refused')

  const shard = make(s, 'chimeShard')
  s.C.belt = [shard]
  s.run!.enc = { sp: 'auditor', n: 3, killed: 0, dmg: 0, round: 0, hostile: true }
  act(s, { type: 'use', id: shard.id })
  assert.deepEqual([s.run!.enc, shard.props?.SIGNAL], [undefined, 1])

  const t = at(newGame(7), 'galleries', 'masonWorks')
  const gun = make(t, 'unbuilder')
  t.C.belt = [gun]
  const grubs = t.levels.galleries.N.grub
  act(t, { type: 'use', id: gun.id })
  assert.deepEqual([t.levels.galleries.M, gun.charges, t.levels.galleries.A >= 100, t.levels.galleries.N.grub < grubs], [0, 0, true, true])
  t.run = undefined
  const ev = act(t, { type: 'endDay' })
  assert.ok(ev.some(e => e.kind === 'sweep' && e.level === 'galleries'))
}

// WRITE (8): one edit a terminal visit, each +30 attention where it lands. A hold idles the Masons for 10 nights; a
// reroute opens or closes a way; a disposal request prints 20 Scourers that strip untagged floors.
{
  const s = at(quiet(), 'ducts', 'pumpOffice')
  s.access.fragments = 4
  act(s, { type: 'terminal' })
  act(s, { type: 'write', what: 'hold', target: 'galleries' })
  assert.deepEqual([masons(s, s.levels.galleries), s.levels.galleries.A], [0, 30])
  assert.ok(s.log.some(l => l.text === 'understood.'))
  assert.equal(act(s, { type: 'write', what: 'reroute', target: 'stairs' })[0].kind, 'refused', 'one write a visit')
  act(s, { type: 'go', key: 'site:stairsUp' })
  act(s, { type: 'go', key: 'site:pumpOffice' })
  act(s, { type: 'terminal' })
  s.know['C:bulkhead:known'] = { state: 'exact', value: true, day: 1, src: 'seen' }
  act(s, { type: 'write', what: 'reroute', target: 'bulkhead' })
  assert.equal(s.connections.find(c => c.id === 'bulkhead')!.open, true)

  const t = at(quiet(), 'ducts', 'pumpOffice')
  t.access.fragments = 4
  act(t, { type: 'terminal' })
  const [a, b] = [siteAt(t, 'galleries', 'longGallery'), siteAt(t, 'galleries', 'hatch')]
  a.loot.push(make(t, 'scrap'))
  b.loot.push(make(t, 'scrap'))
  b.tagged = true
  act(t, { type: 'write', what: 'dispose', target: 'galleries' })
  assert.deepEqual([t.levels.galleries.N.scourer, a.loot.length, b.loot.length], [20, 0, 1])
}

// The kiosk on UNNAMED-0041 answers only at WRITE.
{
  const s = at(quiet(), 'galleries', 'hatch')
  s.levels.u0041 = structuredClone(s.levels.galleries)
  at(s, 'u0041', 'rawFloor')
  assert.equal(act(s, { type: 'terminal' })[0].kind, 'refused')
  s.access.fragments = 4
  assert.notEqual(act(s, { type: 'terminal' })[0].kind, 'refused')
}

// Wearing a relic teaches it roughly, the risky way; the first runner to bring one home signs its entry.
{
  const s = at(quiet(), 'galleries', 'longGallery')
  s.C.belt = [make(s, 'stillCoil')]
  for (let i = 0; i < 20 && !fact(s, 'R:stillCoil:COLD'); i++) { act(s, { type: 'go', key: 'site:hatch' }); s.step = 0; act(s, { type: 'go', key: 'site:longGallery' }); s.step = 0 }
  assert.deepEqual([fact(s, 'R:stillCoil:COLD')?.state, fact(s, 'R:stillCoil:COLD')?.value], ['rough', '≥ 1'])
  act(s, { type: 'go', key: 'site:hatch' })
  act(s, { type: 'go', key: 'conn:hatch' })
  assert.equal(fact(s, 'R:stillCoil:finder')?.value, s.runner.name)
}

console.log('relics ok')
