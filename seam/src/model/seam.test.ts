import assert from 'node:assert/strict'
import type { Box } from '../data/items.ts'
import { apply } from './apply.ts'
import { make } from './containers.ts'
import { H, forecast, homeNight } from './seam.ts'
import { newGame, type Item, type State } from './state.ts'

const empty = (): State => { const s = newGame(1); for (const b of Object.keys(s.C) as Box[]) s.C[b] = []; return s }
const put = (s: State, box: Box, kind: string, x: number, y: number, extra: Partial<Item> = {}) => {
  const it = make(s, kind, { x, y, ...extra })
  s.C[box].push(it)
  return it
}
const endDay = (s: State) => apply(s, { type: 'endDay' })

// M3: left alone with the starting stock, the Ledger shows shortfalls by about day 4, and people are lost.
{
  const s = newGame(7)
  let first = 0
  for (let d = 1; d <= 8 && !first; d++) {
    endDay(s)
    if (s.log.some(l => l.kind === 'event' && l.text.startsWith('Short'))) first = d
  }
  assert.ok(first >= 3 && first <= 5, `first shortfall on night ${first}`)
  assert.ok(s.villagers.length < 40)
  assert.ok(s.villagers.includes(s.runner.name), 'the runner is the last to go')
}

// M3: blackout stops raids (a scripted test). So does a Seam too poor to light its lamps.
{
  const raided = (setup: (s: State) => void) => {
    const s = newGame(7)
    s.levels.galleries.N.hound = 12
    setup(s)
    return endDay(s).some(e => e.kind === 'raid')
  }
  assert.equal(raided(() => {}), true)
  assert.equal(raided(s => apply(s, { type: 'blackout' })), false)
  assert.equal(raided(s => { s.C.stores = s.C.stores.filter(it => it.kind !== 'cell') }), false)
}

// Power: lamps first (2), then the Cold Locker, the moss racks and the condenser, one Cell each; the racks and the
// condenser make their share overnight. Something glowing at home (a Stub Candle, LIGHT 2) spares a Cell for the lamps.
{
  const s = empty()
  put(s, 'stores', 'cell', 0, 0, { n: 4 })
  put(s, 'stores', 'tallow', 1, 0, { n: 4 })
  put(s, 'stores', 'water', 2, 0)
  put(s, 'stores', 'water', 3, 0)
  const { lit } = homeNight(s)
  assert.equal(lit, true)
  const n = (kind: string) => s.C.stores.filter(o => o.kind === kind).reduce((a, o) => a + o.n, 0)
  // 2 lamps + the locker + the racks; no Cell left for the condenser, and the 40 drank both canisters.
  assert.deepEqual([n('cell'), n('emptyCell'), n('moss'), n('water'), n('tallow')], [0, 4, 2, 0, 2])
  const t = empty()
  put(t, 'stores', 'cell', 0, 0, { n: 1 })
  put(t, 'workbench', 'stubCandle', 0, 0)
  assert.equal(homeNight(t).lit, true)
}

// Spoilage (10.2-10.3): a night off, faster beside rot; nothing beside something cold; beside something that preserves
// (ROT < 0) it keeps.
{
  const s = empty()
  s.villagers = []
  const plain = put(s, 'workbench', 'moss', 3, 2)
  const rotting = put(s, 'workbench', 'moss', 3, 0)
  put(s, 'workbench', 'grubCarcass', 1, 0, { rotten: true, fresh: 0 })
  const cool = put(s, 'workbench', 'moss', 0, 2)
  put(s, 'workbench', 'glassTooth', 1, 2)
  const kept = put(s, 'pack', 'moss', 0, 0)
  put(s, 'pack', 'wetLung', 1, 0)
  homeNight(s)
  assert.deepEqual([plain.fresh, rotting.fresh, cool.fresh, kept.fresh], [2, 1, 3, 3])
}
// The running Cold Locker stops spoiling; the village eats what spoils soonest first, and never what's rotten.
{
  const s = empty()
  s.villagers = s.villagers.slice(0, 1)
  put(s, 'stores', 'cell', 7, 4, { n: 3 })
  const cold = put(s, 'cold', 'moss', 0, 0, { n: 3 })
  const rotten = put(s, 'stores', 'moss', 0, 0, { rotten: true, fresh: 0 })
  const tallow = put(s, 'stores', 'tallow', 3, 3)
  homeNight(s)
  assert.deepEqual([cold.n, cold.fresh, tallow.n], [2, 3, 1])
  assert.ok(s.C.stores.includes(rotten))
}

// The Charger: the tapped conduit fills 3 Empty Cells a night, a Humming Knot (CHARGE 3) inside one more. Elsewhere
// anything with CHARGE 3 or more fills an Empty Cell it touches.
{
  const s = empty()
  s.conduitTapped = true
  put(s, 'charger', 'emptyCell', 0, 0, { n: 4 })
  put(s, 'charger', 'emptyCell', 1, 0, { n: 2 })
  put(s, 'charger', 'hummingKnot', 2, 1)
  put(s, 'lead', 'emptyCell', 0, 0, { n: 2 })
  put(s, 'lead', 'choirHeart', 1, 0)
  homeNight(s)
  const n = (box: Box, kind: string) => s.C[box].filter(o => o.kind === kind).reduce((a, o) => a + o.n, 0)
  assert.deepEqual([n('charger', 'cell'), n('charger', 'emptyCell'), n('lead', 'cell')], [4, 2, 1])
}

// Signal leaks from anything loose at the Seam (+3 a night per point), not from the Lead Box. At 100 the Seam is
// audited: four people and some of the Stores are taken, and its attention drops to 30.
{
  const s = empty()
  s.blackout = true
  s.villagers = s.villagers.slice(0, 10)
  put(s, 'stores', 'tallow', 0, 0, { n: 2 })
  put(s, 'stores', 'water', 1, 0)
  put(s, 'stores', 'water', 2, 0)
  put(s, 'workbench', 'chimeShard', 0, 0)
  put(s, 'lead', 'chimeShard', 0, 0)
  homeNight(s)
  assert.equal(s.seamA, 9)
  s.seamA = 99
  homeNight(s)
  assert.deepEqual([s.villagers.length, s.seamA], [10 - H.auditPeople, H.afterAudit])
}

// The forecast is a dry run: it says what tonight will do and changes nothing.
{
  const s = newGame(7)
  const before = JSON.stringify(s)
  const f = forecast(s)
  assert.equal(JSON.stringify(s), before)
  const moss = s.C.stores.find(o => o.kind === 'moss')!
  assert.ok(f.get(moss.id)!.some(t => t.includes('eaten')))
}

console.log('seam ok')
