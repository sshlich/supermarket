import assert from 'node:assert/strict'
import { apply, type Action } from './apply.ts'
import { reads, tier } from './access.ts'
import { make, stow } from './containers.ts'
import { fact } from './knowledge.ts'
import { project } from './project.ts'
import { siteAt } from './run.ts'
import { newGame, type State } from './state.ts'

const act = (s: State, a: Action) => apply(s, a)
const at = (s: State, level: string, site: string) => { s.run = { level, site, noise: 0 }; return s }
const quiet = () => { const s = newGame(7); for (const L of Object.values(s.levels)) L.N = {}; return s }

// Tiers (8): 0 GUEST, 1 READ, 2 NOTE, 4 WRITE, 7 ROOT.
{
  const s = newGame(7)
  assert.deepEqual([0, 1, 2, 3, 4, 6, 7].map(n => { s.access.fragments = n; return tier(s) }), ['GUEST', 'READ', 'NOTE', 'NOTE', 'WRITE', 'WRITE', 'ROOT'])
}

// A terminal costs a step to wake. Presenting a fragment spends it: READ, and MAINT's greeting. READ gives exact
// tables for the terminal's level and the projected burial day, and subscribes it: the feed keeps it exact nightly.
{
  const s = at(newGame(7), 'ducts', 'pumpOffice')
  stow(s, 'pack', make(s, 'fragment'))
  assert.equal(act(s, { type: 'read' })[0].kind, 'refused', 'the terminal is asleep')
  act(s, { type: 'terminal' })
  assert.equal(s.step, 1)
  assert.equal(act(s, { type: 'read' })[0].kind, 'refused', 'GUEST cannot read')
  assert.equal(act(s, { type: 'present' })[0].text, 'READ')
  assert.ok(s.log.some(l => l.text.startsWith('it has been 11,408 years')) && s.log.some(l => l.text.includes('access: READ')))
  act(s, { type: 'read' })
  const eels = fact(s, 'S:eel:pop:ducts')!
  assert.deepEqual([eels.state, eels.value, eels.src], ['exact', 6, 'READ'])
  assert.equal(fact(s, 'seam:burialDay')?.value, 23)
  assert.deepEqual(s.access.subscribed, ['ducts'])
  act(s, { type: 'go', key: 'site:stairsUp' })
  act(s, { type: 'camp' })
  assert.deepEqual([fact(s, 'S:eel:pop:ducts')!.src, fact(s, 'S:eel:pop:ducts')!.day], ['feed', 1])
}

// SIGNAL 2 on the belt reads even at GUEST (10.5).
{
  const s = at(newGame(7), 'hall', 'console')
  assert.equal(reads(s), false)
  s.C.belt = [make(s, 'chimeShard')]
  assert.equal(reads(s), true)
}

// NOTE: tag a site (Scourers leave what lies there alone) and subscribe one more level, no more.
{
  const s = at(newGame(7), 'ducts', 'pumpOffice')
  s.access.fragments = 2
  act(s, { type: 'terminal' })
  s.know['T:longGallery:seen'] = { state: 'exact', value: true, day: 1, src: 'seen' }
  act(s, { type: 'note', what: 'tag', id: 'longGallery' })
  assert.equal(siteAt(s, 'galleries', 'longGallery').tagged, true)
  act(s, { type: 'note', what: 'subscribe', id: 'galleries' }) // the one extra NOTE allows
  act(s, { type: 'read' }) // reading subscribes the terminal's own level, free
  assert.deepEqual(s.access.subscribed, ['galleries', 'ducts'])
  s.know['L:stair:known'] = { state: 'exact', value: true, day: 1, src: 'seen' }
  assert.equal(act(s, { type: 'note', what: 'subscribe', id: 'stair' })[0].kind, 'refused')
}

// Levers (11.6): a step and attention each; their effect shows in the Level entry once pulled. The Heat Valve needs
// nothing; the Bulkhead needs the Pry Bar (and wears it 10); the Tower wants SIGNAL on the belt.
{
  const s = at(quiet(), 'galleries', 'valveGallery')
  assert.equal(fact(s, 'V:heatValve:effect'), undefined)
  act(s, { type: 'lever', id: 'heatValve' })
  assert.deepEqual([s.levels.galleries.heat, s.levels.galleries.A, s.step], [0, 6 * 0 + 5, 1])
  assert.ok(fact(s, 'V:heatValve:effect'))
  at(s, 'galleries', 'bulkhead')
  const bar = s.C.belt.find(o => o.kind === 'prybar')!
  act(s, { type: 'lever', id: 'bulkhead' })
  assert.deepEqual([s.connections.find(c => c.id === 'bulkhead')!.open, bar.cond], [true, 90])
  at(s, 'stair', 'auditTower')
  assert.equal(act(s, { type: 'lever', id: 'tower' })[0].kind, 'refused')
  s.C.belt.push(make(s, 'fragment'))
  act(s, { type: 'lever', id: 'tower' })
  assert.equal(s.levels.stair.A, 61) // 60, and the SIGNAL on the belt calls a little attention every step
}

// The Conduit Tap takes a Live Wire once; after that it switches off and on freely, and the Charger fills 3 a night.
{
  const s = at(quiet(), 'galleries', 'valveGallery')
  assert.equal(act(s, { type: 'lever', id: 'conduitTap' })[0].kind, 'refused')
  stow(s, 'pack', make(s, 'liveWire'))
  act(s, { type: 'lever', id: 'conduitTap' })
  assert.deepEqual([s.conduitTapped, s.C.pack.some(o => o.kind === 'liveWire')], [true, false])
  act(s, { type: 'lever', id: 'conduitTap' })
  act(s, { type: 'lever', id: 'conduitTap' })
  assert.equal(s.conduitTapped, true)
}

// Lure (11.5): bait in the pack leads a group away: into another level (the populations move), or onto a hazard here
// (half of them don't come out).
{
  const s = at(newGame(7), 'galleries', 'longGallery')
  stow(s, 'pack', make(s, 'film', { n: 3 }))
  const [g, d] = [s.levels.galleries.N.grub, s.levels.ducts.N.grub]
  s.run!.enc = { sp: 'grub', n: 6, killed: 0, dmg: 0, round: 0, hostile: false }
  act(s, { type: 'choose', choice: 'lure', arg: 'site:grubNest' }) // the Rot Bloom
  assert.equal(s.levels.galleries.N.grub, g - 3)
  assert.ok(fact(s, 'I:film:bait') && fact(s, 'S:grub:diet:film'))
  at(s, 'galleries', 'stairsDown')
  s.run!.enc = { sp: 'grub', n: 4, killed: 0, dmg: 0, round: 0, hostile: false }
  act(s, { type: 'choose', choice: 'lure', arg: 'conn:stairs' })
  assert.deepEqual([s.levels.galleries.N.grub, s.levels.ducts.N.grub], [g - 7, d + 4])
}

// "What would happen" (11.6): only what's known goes in. Nothing known, nothing projected; an unseen lever can't be
// projected; with the Galleries read, closing the Heat Valve shows the grubs falling.
{
  const s = at(newGame(7), 'galleries', 'valveGallery')
  assert.deepEqual(project(s, 'galleries'), [])
  assert.equal(project(s, 'galleries', 'heatValve'), null)
  s.know['V:heatValve:effect'] = { state: 'exact', value: 'x', day: 1, src: 'pulled' }
  for (const f of ['film', 'heat', 'scrap', 'masons', 'attention']) s.know[`L:galleries:${f}`] = { state: 'exact', value: f === 'film' ? 75 : f === 'heat' ? 2 : f === 'scrap' ? 60 : f === 'masons' ? 1 : 0, day: 1, src: 'READ' }
  s.know['S:grub:pop:galleries'] = { state: 'exact', value: 80, day: 1, src: 'READ' }
  const [asIs, pulled] = [project(s, 'galleries')!, project(s, 'galleries', 'heatValve')!]
  assert.deepEqual(asIs.map(p => p.species), ['grub'])
  assert.ok(pulled[0].then < asIs[0].then * 0.5)
}

// The long arc (4.2): buried, the Seam falls and nothing more can be done; through day 30 alive, it holds.
{
  const s = newGame(7)
  s.burial = 99.5
  act(s, { type: 'endDay' })
  assert.equal(s.end, 'buried')
  assert.equal(act(s, { type: 'endDay' })[0].kind, 'refused')
  const t = newGame(7)
  t.day = 30
  t.burial = 0
  for (const L of Object.values(t.levels)) L.M = 0
  stow(t, 'stores', make(t, 'tallow', { n: 4 }))
  const ev = act(t, { type: 'endDay' })
  assert.equal(t.flags.held, true)
  assert.ok(ev.some(e => e.kind === 'held'))
}

// M5, in play: silencing the Choir with the bulkhead open brings hound raids on the Seam within about ten days, and
// the villagers hear it coming (claws in the Galleries) before the first raid.
{
  const s = newGame(7)
  s.machines = { cold: false, moss: false, condenser: false }
  // Kept fed and lit, a night at a time, so only the hounds can empty the Seam.
  const night = () => {
    s.C.stores = []
    stow(s, 'stores', make(s, 'tallow', { n: 2 }))
    for (let i = 0; i < 2; i++) stow(s, 'stores', make(s, 'water'))
    stow(s, 'stores', make(s, 'cell', { n: 2 }))
    return act(s, { type: 'endDay' })
  }
  for (let d = 1; d < 5; d++) night()
  act(at(s, 'hall', 'pipeOrgan'), { type: 'lever', id: 'resonancePipe' })
  act(at(s, 'galleries', 'bulkhead'), { type: 'lever', id: 'bulkhead' })
  s.run = undefined
  let raid = 0
  for (let d = 5; d <= 25 && !raid; d++) if (night().some(e => e.kind === 'raid')) raid = d
  const claws = s.log.find(l => l.kind === 'rumour' && l.text.includes('heard claws'))
  assert.ok(raid >= 12 && raid <= 17, `first raid on night ${raid}`)
  assert.ok(claws && claws.day < raid, 'the claws were heard first')
}

console.log('access ok')
