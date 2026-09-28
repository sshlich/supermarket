import assert from 'node:assert/strict'
import type { Box } from '../data/items.ts'
import { applyDrop, grab, make, planDrop, rectOf, send, stow, tidy, where } from './containers.ts'
import { overlaps } from './grid.ts'
import { newGame, type Item, type State } from './state.ts'

const empty = (): State => { const s = newGame(1); for (const b of Object.keys(s.C) as Box[]) s.C[b] = []; return s }
const put = (s: State, box: Box, kind: string, x: number, y: number, extra: Partial<Item> = {}) => {
  const it = make(s, kind, { x, y, ...extra })
  s.C[box].push(it)
  return it
}
const kinds = (s: State, box: Box) => s.C[box].map(o => `${o.kind}${o.n > 1 ? `x${o.n}` : ''}`).sort()
const drag = (s: State, id: number, box: Box, x: number, y: number, split = false) => {
  const h = grab(s, id, split)!
  const p = planDrop(s, h, box, x, y, h.item.rot)!
  return applyDrop(s, h, p)
}

// The starting stock (9.3): 12 FOOD, 10 WATER, 8 Cells, 4 empty, and the kit; nothing overlaps.
{
  const s = newGame(7)
  const count = (kind: string) => Object.values(s.C).flat().filter(o => o.kind === kind).reduce((a, o) => a + o.n, 0)
  assert.deepEqual(['tallow', 'moss', 'water', 'cell', 'emptyCell', 'bolt', 'cutter', 'prybar', 'film'].map(count), [4, 4, 5, 8, 4, 12, 1, 1, 3])
  assert.deepEqual(kinds(s, 'belt'), ['cutter', 'prybar'])
  for (const items of Object.values(s.C)) for (const a of items) for (const b of items) if (a !== b) assert.ok(!overlaps(rectOf(a), rectOf(b)))
}

// Stowing tops up piles first, then takes free spots; tidy merges what it can.
{
  const s = empty()
  put(s, 'stores', 'moss', 0, 0, { n: 3 })
  assert.equal(stow(s, 'stores', make(s, 'moss', { n: 3 })), 0)
  assert.deepEqual(kinds(s, 'stores'), ['mossx2', 'mossx4'])
  put(s, 'stores', 'moss', 5, 4, { n: 1 })
  tidy(s, 'stores')
  assert.deepEqual(kinds(s, 'stores'), ['mossx3', 'mossx4'])
}

// Shift-click send: into a pile or a free spot.
{
  const s = empty()
  const b = put(s, 'pack', 'scrap', 0, 0, { n: 4 })
  put(s, 'stores', 'scrap', 0, 0, { n: 5 })
  assert.equal(send(s, b.id, 'stores'), true)
  assert.deepEqual(kinds(s, 'stores'), ['scrapx3', 'scrapx6'])
  assert.deepEqual(kinds(s, 'pack'), [])
}

// Dragging: onto a matching pile merges; squarely onto the same shape swaps; splitting takes half.
{
  const s = empty()
  const a = put(s, 'stores', 'cell', 0, 0, { n: 2 })
  put(s, 'stores', 'cell', 3, 0, { n: 1 })
  drag(s, a.id, 'stores', 3, 0)
  assert.deepEqual(kinds(s, 'stores'), ['cellx3'])
  const w = put(s, 'pack', 'water', 0, 0)
  const c = put(s, 'stores', 'liveWire', 5, 2)
  drag(s, w.id, 'stores', 5, 2)
  assert.deepEqual([where(s, w.id)!.box, where(s, c.id)!.box], ['stores', 'pack'])
  const pile = put(s, 'workbench', 'bolt', 0, 0, { n: 9 })
  drag(s, pile.id, 'workbench', 3, 2, true)
  assert.deepEqual(kinds(s, 'workbench'), ['boltx4', 'boltx5'])
}

// Recipes (C.3) happen on the Workbench and in the pack: the Cutter renders a carcass (and wears), glass teeth edge
// a spear, a Pry Bar breaks a plate into scrap, a live wire fills one cell of a pile. Not in the Stores.
{
  const s = empty()
  const cutter = put(s, 'belt', 'cutter', 0, 0)
  const carcass = put(s, 'workbench', 'grubCarcass', 0, 0)
  assert.equal(drag(s, cutter.id, 'workbench', 0, 0).made, 'tallow')
  assert.deepEqual([carcass.kind, cutter.cond, where(s, cutter.id)!.box], ['tallow', 98, 'belt'])

  const teeth = put(s, 'pack', 'glassTooth', 0, 0, { n: 4 })
  const spear = put(s, 'pack', 'rebarSpear', 2, 0, { rot: true })
  drag(s, teeth.id, 'pack', 2, 0)
  assert.deepEqual([spear.kind, teeth.n], ['glassSpear', 1])

  const bar = put(s, 'belt', 'prybar', 2, 0)
  put(s, 'workbench', 'masonPlate', 2, 0)
  drag(s, bar.id, 'workbench', 2, 0)
  assert.ok(kinds(s, 'workbench').includes('scrapx4'))

  const wire = put(s, 'pack', 'liveWire', 4, 0)
  put(s, 'pack', 'emptyCell', 5, 3, { n: 3 })
  drag(s, wire.id, 'pack', 5, 3)
  assert.deepEqual(kinds(s, 'pack').filter(k => k.includes('ell')), ['cell', 'emptyCellx2'])
  assert.equal(where(s, wire.id), null)

  const worn = put(s, 'stores', 'cutter', 7, 0, { cond: 2 })
  const meat = put(s, 'stores', 'grubCarcass', 0, 4)
  const h = grab(s, worn.id)!
  assert.equal(planDrop(s, h, 'stores', 0, 4, false)?.recipe, undefined)
  s.C.workbench.push(Object.assign(s.C.stores.splice(s.C.stores.indexOf(meat), 1)[0], { x: 2, y: 2 }))
  const r = drag(s, worn.id, 'workbench', 2, 2)
  assert.equal(r.broke, true)
  assert.equal(worn.kind, 'scrap')
}

console.log('containers ok')
