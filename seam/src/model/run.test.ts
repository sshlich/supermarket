import assert from 'node:assert/strict'
import { apply } from './apply.ts'
import { make } from './containers.ts'
import { fact } from './knowledge.ts'
import { R, encounterChance, evadeOdds, exits, pathHome, siteAt, theirHit, weights, yourHit } from './run.ts'
import { newGame, type State } from './state.ts'

const act = (s: State, a: Parameters<typeof apply>[1]) => apply(s, a)
const near = (a: number, b: number) => Math.abs(a - b) < 1e-9
/** A world with nothing alive anywhere, so walking is quiet unless a test says otherwise. */
const quiet = () => { const s = newGame(7); for (const L of Object.values(s.levels)) L.N = {}; return s }
const out = (s: State) => { act(s, { type: 'startRun' }); return s }

// Encounter odds (11.5): 1 - exp(-Σw/40), capped at 0.85; w = population × detection × what draws them. Eels only where
// there's water, and only while it's flooded.
{
  const s = out(newGame(7))
  const w = 80 * 0.3 + 150 * 0.05 + 10 * 0.5 + 5 * 0.4
  assert.ok(near(encounterChance(s, 'galleries', 'longGallery'), 1 - Math.exp(-w / 40)))
  s.C.belt = [make(s, 'shellLamp')] // LIGHT 1 draws moths and crabs: ×1.5
  assert.ok(near(weights(s, 'galleries', 'longGallery').reduce((a, [, x]) => a + x, 0), 80 * 0.3 + 150 * 0.05 * 1.5 + 10 * 0.5 * 1.5 + 5 * 0.4))
  const eel = (site: string) => weights(s, 'ducts', site).some(([sp]) => sp.id === 'eel')
  assert.deepEqual([eel('floodedHall'), eel('stairsUp')], [true, false])
  s.levels.galleries.N = { grub: 1000, moth: 1000 }
  assert.equal(encounterChance(s, 'galleries', 'longGallery'), R.cap)
}

// Evading and fighting (11.5): evade 0.75 - 0.12·awareness + 0.1·LIGHT - noise/100 in [0.05, 0.95]; you hit for
// 1 + weapon + the belt's CHARGE (not against machines); they hit for ceil(threat × alive × 0.5).
{
  const s = out(quiet())
  s.run!.enc = { sp: 'hound', n: 4, killed: 1, dmg: 0, round: 0, hostile: true }
  s.run!.noise = 0
  assert.ok(near(evadeOdds(s), 0.75 - 0.36))
  s.C.belt = [make(s, 'shellLamp', { x: 0 }), make(s, 'rebarSpear', { x: 2, rot: true })]
  s.run!.noise = 20
  assert.ok(near(evadeOdds(s), 0.75 - 0.36 + 0.1 - 0.2))
  assert.deepEqual([yourHit(s), theirHit(s)], [3, 5])
  s.C.belt.push(make(s, 'hummingKnot', { x: 0 }))
  assert.equal(yourHit(s), 6)
  s.run!.enc.sp = 'auditor'
  assert.equal(yourHit(s), 3)
}

// Going out and walking: the hatch costs its step, each site one more; visiting teaches the site, the level and its ways out.
{
  const s = out(quiet())
  assert.deepEqual([s.run!.level, s.run!.site, s.step], ['galleries', 'hatch', 1])
  act(s, { type: 'go', key: 'site:longGallery' })
  assert.deepEqual([s.run!.site, s.step], ['longGallery', 2])
  assert.ok(fact(s, 'T:longGallery:seen') && fact(s, 'L:galleries:heat')?.value === 2 && fact(s, 'L:galleries:film')?.state === 'rough')
  assert.deepEqual(exits(s).map(e => e.key).sort(), ['site:grubNest', 'site:hatch', 'site:masonWorks', 'site:valveGallery'])
}

// Hazards (11.4): a bolt shows one before you go, and then you step around it; walking in blind takes it the hard
// way; the belt can resist it; a light shows it as you step in.
{
  const s = out(quiet())
  act(s, { type: 'go', key: 'site:longGallery' })
  const bolts = () => s.C.pack.filter(o => o.kind === 'bolt').reduce((a, o) => a + o.n, 0)
  act(s, { type: 'bolt', key: 'site:valveGallery' })
  assert.deepEqual([bolts(), fact(s, 'T:valveGallery:hazard')?.value], [11, 'arc'])
  act(s, { type: 'go', key: 'site:valveGallery' })
  assert.equal(s.runner.hp, 10)
  act(s, { type: 'go', key: 'site:longGallery' })
  act(s, { type: 'go', key: 'site:grubNest' })
  assert.equal(s.runner.hp, 9, 'the Rot Bloom, the hard way')
  assert.equal(fact(s, 'T:grubNest:hazard')?.src, 'hazard')

  const t = out(quiet())
  t.C.belt = [make(t, 'wetLung')] // ROT -2 resists a level-2 Rot Bloom
  act(t, { type: 'go', key: 'site:longGallery' })
  act(t, { type: 'go', key: 'site:grubNest' })
  assert.equal(t.runner.hp, 10)
  const u = out(quiet())
  u.C.belt = [make(u, 'stubCandle')]
  act(u, { type: 'go', key: 'site:longGallery' })
  act(u, { type: 'go', key: 'site:grubNest' })
  assert.deepEqual([u.runner.hp, fact(u, 'T:grubNest:hazard')?.src], [10, 'belt'])
}

// On Unstable levels, what you knew of a hazard goes stale after 3 nights (7.3).
{
  const s = quiet()
  s.know['T:glassFall:hazard'] = { state: 'exact', value: 'glassRain', day: 1, src: 'bolt' }
  s.know['T:valveGallery:hazard'] = { state: 'exact', value: 'arc', day: 1, src: 'bolt' }
  s.day = 5
  assert.deepEqual([fact(s, 'T:glassFall:hazard'), fact(s, 'T:valveGallery:hazard')?.value], [undefined, 'arc'])
}

// Search once per site (not nests): 2-4 things from the level's table, into the pack.
{
  const s = out(quiet())
  act(s, { type: 'go', key: 'site:longGallery' })
  const before = s.C.pack.reduce((a, o) => a + o.n, 0)
  act(s, { type: 'search' })
  assert.ok(s.C.pack.reduce((a, o) => a + o.n, 0) > before)
  assert.equal(act(s, { type: 'search' })[0].kind, 'refused')
}

// M4: fight grubs, harvest them with the Cutter, bring the food home; the kills show in the next night's numbers,
// and the Bestiary has learned what grubs are, what they drop and how tough they are.
{
  const twin = newGame(7)
  const s = out(newGame(7))
  act(twin, { type: 'startRun' })
  for (const x of [s, twin]) { x.C.belt.push(make(x, 'rebarSpear', { x: 0, rot: true })); x.C.belt = x.C.belt.filter(o => o.kind !== 'prybar') }
  s.run!.enc = { sp: 'grub', n: 6, killed: 0, dmg: 0, round: 0, hostile: false }
  const grubs = s.levels.galleries.N.grub
  act(s, { type: 'choose', choice: 'fight' })
  act(s, { type: 'choose', choice: 'fight' })
  act(s, { type: 'choose', choice: 'fight' })
  assert.equal(s.run!.enc, undefined)
  assert.equal(s.levels.galleries.N.grub, grubs - 4) // 3 rounds of 3 damage against 2 HP each
  assert.deepEqual(siteAt(s, 'galleries', 'hatch').remains, [{ species: 'grub', n: 4 }])
  act(s, { type: 'harvest' })
  assert.equal(s.C.pack.filter(o => o.kind === 'grubCarcass').length, 4)
  assert.deepEqual(['hp', 'drops', 'threat'].map(f => fact(s, `S:grub:${f}`)?.value), [2, 'Grub Carcass', 0])
  act(s, { type: 'returnHome' })
  act(twin, { type: 'returnHome' })
  assert.equal(s.run, undefined)
  act(s, { type: 'endDay' })
  act(twin, { type: 'endDay' })
  assert.equal(twin.day, s.day) // both had their night (the twin used to be stuck out behind a group of scourers)
  assert.ok(s.levels.galleries.N.grub < twin.levels.galleries.N.grub - 2) // 4 killed; fewer grubs breed a little better
}

// The way home goes over known ground only, and costs what it costs.
{
  const s = out(quiet())
  act(s, { type: 'go', key: 'site:longGallery' })
  act(s, { type: 'go', key: 'site:valveGallery' })
  assert.deepEqual(pathHome(s), { keys: ['site:longGallery', 'site:hatch', 'conn:hatch'], cost: 3 })
}

// The day ends at step 12: then camp, and the night runs out there; home, rest heals.
{
  const s = out(quiet())
  s.step = 11
  act(s, { type: 'go', key: 'site:longGallery' })
  assert.equal(act(s, { type: 'go', key: 'site:hatch' })[0].kind, 'refused')
  assert.equal(act(s, { type: 'endDay' })[0].kind, 'refused')
  act(s, { type: 'camp' })
  assert.deepEqual([s.day, s.step, s.run?.site], [2, 0, 'longGallery'])
}

// Dying (11.7): the pack and belt stay where they fell, the village loses a person, three could take the terminal.
{
  const s = out(quiet())
  s.levels.galleries.N.hound = 12
  s.runner.hp = 2
  s.run!.enc = { sp: 'hound', n: 4, killed: 0, dmg: 0, round: 0, hostile: true }
  const ev = act(s, { type: 'choose', choice: 'fight' })
  assert.equal(ev.at(-1)!.kind, 'died')
  assert.equal(s.run, undefined)
  assert.equal(s.villagers.includes('Oda'), false)
  const st = siteAt(s, 'galleries', 'hatch')
  assert.deepEqual([st.fell, st.loot.some(o => o.kind === 'cutter'), s.C.belt.length, s.pick!.length], ['Oda', true, 0, 3])
  assert.equal(act(s, { type: 'startRun' })[0].kind, 'refused')
  act(s, { type: 'runner', name: s.pick![1] })
  assert.equal(s.pick, undefined)
  assert.equal(s.runner.hp, 10)
}

// A Gravity Well tears the heaviest thing from the pack and leaves it at the site, whole (it used to land as a ×0 ghost).
{
  const s = out(quiet())
  const st = siteAt(s, 'galleries', 'longGallery')
  st.hazard = 'gravity'
  s.C.pack = [make(s, 'scrap', { n: 5, x: 0 }), make(s, 'film', { x: 1 })]
  act(s, { type: 'go', key: 'site:longGallery' })
  assert.deepEqual([st.loot.map(o => `${o.kind}×${o.n}`), s.C.pack.map(o => o.kind)], [['scrap×5'], ['film']])
  assert.equal(act(s, { type: 'take', id: st.loot[0].id })[0].kind, 'run')
  assert.equal(s.C.pack.find(o => o.kind === 'scrap')?.n, 5)
}

// Return home says so up front when the way is longer than the day, instead of walking part of it and stopping.
{
  const s = out(quiet())
  act(s, { type: 'go', key: 'site:longGallery' })
  act(s, { type: 'go', key: 'site:masonWorks' })
  s.step = 10
  assert.equal(act(s, { type: 'returnHome' })[0].kind, 'refused')
  assert.equal(s.run!.site, 'masonWorks')
  s.step = 9
  act(s, { type: 'returnHome' })
  assert.equal(s.run, undefined)
}

// A group that isn't coming for you doesn't hold you: walk on and you leave them be. Hunters hold you.
{
  const s = out(quiet())
  s.run!.enc = { sp: 'grub', n: 6, killed: 0, dmg: 0, round: 0, hostile: false }
  act(s, { type: 'go', key: 'site:longGallery' })
  assert.deepEqual([s.run!.site, s.run!.enc], ['longGallery', undefined])
  s.run!.enc = { sp: 'hound', n: 2, killed: 0, dmg: 0, round: 0, hostile: true }
  assert.equal(act(s, { type: 'go', key: 'site:hatch' })[0].kind, 'refused')
  assert.equal(act(s, { type: 'search' })[0].kind, 'refused')
}

// Two-way levers say which way they went.
{
  const s = out(quiet())
  act(s, { type: 'go', key: 'site:longGallery' })
  act(s, { type: 'go', key: 'site:valveGallery' })
  s.runner.hp = 10
  assert.match(act(s, { type: 'lever', id: 'heatValve' })[0].text, /heat is off/)
  assert.match(act(s, { type: 'lever', id: 'heatValve' })[0].text, /heat is on/)
}

console.log('run ok')
