import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { LEVELS } from '../data/levels.ts'
import { EFFECTS, masons, play, type Scripted } from './sim.ts'
import { newGame, type State } from './state.ts'

// Appendix J: the world headless from seed 7, each scenario against the untouched world (S1).
// A scripted effect lands the morning after its night; "night k" means the world as night k leaves it.
//
// The targets are the doc's. Its numbers weren't: with them the world collapses within 20 nights. What changed and why
// (doc values in brackets, all in data/species.ts and T in sim.ts):
// - film reach 0.04 [none]: grazers could eat half of all film every night, so it fell to ~1% and everything starved.
// - scrap reach 0.5 [none]: moths could strip half the scrap every night, so they boomed and crashed every other night.
// - vuln grub 0.2, crab 0.1, moth 0.05 [0.5, 0.3, 0.4]: predators ate prey faster than it can breed (crabs died out on
//   the Stair), and crabs fed on moths so well they reached 10× on the Galleries.
// - crab r 0.08 [0.12]: on film alone, Stair crabs grew past 2.5×.
// - hound r 0.2, song 0.15 [0.10, 0.08]: the same balance, twice as fast. S2 needs the Choir, not food, to be what
//   holds the hounds; and in S3 the hounds must reach the hatch before the Masons bury the Seam on night 23.
// - natural deaths 0.004, printing 0.05 [0.01, 0.02]: scourers settle near their start and spike after die-offs.
// - dry 0.5 [0.4]: stranded eels are gone within 5 nights (S5).

const script = (name: string): Scripted[] => JSON.parse(readFileSync(new URL(`../../scenarios/${name}`, import.meta.url), 'utf8'))

function run(actions: Scripted[] = [], nights = 60) {
  const s = newGame(7)
  const at: State[] = [structuredClone(s)]
  const raids: number[] = []
  play(s, actions, nights, (x, ev) => {
    at.push(structuredClone(x))
    for (const e of ev) if (e.kind === 'raid') raids.push(e.night)
  })
  return { s, at, raids }
}
const N = (x: State, level: string, sp: string) => x.levels[level]?.N[sp] ?? 0
const film = (x: State, level: string) => x.levels[level].F / LEVELS[level].Fmax

// S1: left alone for 60 nights, nothing dies out where it started, and every population ends within 0.4-2.5× its start.
// (UNNAMED-0041 isn't a starting level: the Masons register it on night 15.)
const S1 = run()
for (const [level, L] of Object.entries(S1.at[0].levels))
  for (const [sp, n0] of Object.entries(L.N)) {
    assert.ok(S1.at.every(x => N(x, level, sp) > 0), `S1: ${sp} died out on ${level}`)
    const r = N(S1.at[60], level, sp) / n0
    assert.ok(r >= 0.4 && r <= 2.5, `S1: ${sp} on ${level} ended at ${r.toFixed(2)}× its start`)
  }

// S2: silence the Choir on night 5, and by night 25 the Stair has at least twice S1's hounds.
const S2 = run(script('s2-silence-choir.json'), 25)
assert.ok(N(S2.at[25], 'stair', 'hound') >= 2 * N(S1.at[25], 'stair', 'hound'), 'S2')

// S3: S2 with the bulkhead open too: 6+ hounds on the Galleries by night 30 and a raid on the Seam by night 35.
// A sealed Seam can't be raided, and nobody holds the Masons off here, so in practice the raid has to beat night 23.
const S3 = run(script('s3-choir-and-bulkhead.json'), 35)
assert.ok(S3.at.slice(0, 31).some(x => N(x, 'galleries', 'hound') >= 6), 'S3: hounds')
assert.ok(S3.raids.length > 0 && S3.raids[0] <= 35, 'S3: raid')

// S4: close the Heat Valve on night 3: Galleries film ≤ 30% of S1's on night 10, grubs ≤ 40% of S1's on night 15.
const S4 = run(script('s4-heat-valve.json'), 15)
assert.ok(film(S4.at[10], 'galleries') <= 0.3 * film(S1.at[10], 'galleries'), 'S4: film')
assert.ok(N(S4.at[15], 'galleries', 'grub') <= 0.4 * N(S1.at[15], 'galleries', 'grub'), 'S4: grubs')

// S5: drain the sluice on night 3: eels ≤ 10% of their start by night 8; scourers reach 3× theirs on a night from 4 to 12.
const S5 = run(script('s5-drain-sluice.json'), 12)
assert.ok(N(S5.at[8], 'ducts', 'eel') <= 0.1 * N(S5.at[0], 'ducts', 'eel'), 'S5: eels')
assert.ok(S5.at.slice(4, 13).some(x => N(x, 'ducts', 'scourer') >= 3 * N(S5.at[0], 'ducts', 'scourer')), 'S5: scourers')

// S6: Stair attention to 100 on night 10: the sweep leaves ≤ 45% of the hounds, and scourers rise every night to 15.
const S6 = run(script('s6-sweep-stair.json'), 15)
assert.ok(N(S6.at[11], 'stair', 'hound') <= 0.45 * N(S6.at[10], 'stair', 'hound'), 'S6: hounds')
for (let k = 12; k <= 15; k++) assert.ok(N(S6.at[k], 'stair', 'scourer') > N(S6.at[k - 1], 'stair', 'scourer'), `S6: scourers on night ${k}`)

// S7: left alone, the Seam is buried between nights 20 and 26. Holds on the Galleries (nights 6, 16) and a moth lure
// (night 10) keep Burial under 100 on night 30.
const buried = S1.at.findIndex(x => x.flags.buried)
assert.ok(buried >= 20 && buried <= 26, `S7: buried on night ${buried}`)
assert.ok(run(script('s7-holds-and-lure.json'), 30).at[30].burial < 100, 'S7: holds')

// The moth lure (our reading of Appendix F): the moths corrode the Masons, slowing them for 10 nights, and boom on
// the plating they strip. The Ducts start without moths, so there the lure does nothing.
{
  const x = run([{ night: 10, do: 'mothLure', level: 'galleries' }], 13)
  assert.ok(N(x.at[13], 'galleries', 'moth') >= 1.5 * N(S1.at[13], 'galleries', 'moth'), 'lure: moths boom')
  assert.equal(masons(x.s, x.s.levels.galleries), x.s.levels.galleries.M - 1, 'lure: Masons slowed')
  const s = newGame(7)
  EFFECTS.mothLure(s, s.levels.ducts)
  assert.deepEqual(s, newGame(7), 'lure: no moths, no effect')
}

// S8: every scenario run twice gives byte-identical state, and a game saved as JSON and resumed plays out the same.
for (const f of readdirSync(new URL('../../scenarios/', import.meta.url))) {
  const a = script(f)
  assert.equal(JSON.stringify(run(a, 40).s), JSON.stringify(run(a, 40).s), `S8: ${f}`)
  const s = newGame(7)
  play(s, a, 20)
  const resumed: State = JSON.parse(JSON.stringify(s))
  play(resumed, a.map(x => ({ ...x, night: x.night - 20 })), 20)
  assert.equal(JSON.stringify(resumed), JSON.stringify(run(a, 40).s), `S8: ${f} resumed`)
}

console.log('sim ok')
