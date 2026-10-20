import assert from 'node:assert/strict'
import { accepts, inSpace, KINDS, PRESETS, settle, sleep, spawn, start, worn, type Item, type Space, type State } from './world.ts'
import { barred, floorFor, GEAR, goHome, goOut, inHand, nightsLeft, search, searchesFor, shopOf, SHOPS, siteOf, SITES, trade } from './outside.ts'

const ducts = siteOf('site_spine_ducts')!, bunks = siteOf('site_dark_bunks')!
const TORCH = 'it_tech_torch', WRENCH = 'it_fab_wrench', MASK = 'it_life_mask_refill'
// a new game comes with a pack on your back; these tests start from nothing on you
const night = (): State => { const s = start(); s.items = []; s.night = true; return s }
const move = (s: State, it: Item, to: Space) => { const from = it.in ? { ...it.in } : it.at ? { at: it.at } : null; delete it.in; delete it.at; if (to && 'host' in to) it.in = to; else if (to) it.at = to.at; it.x = 0; it.y = 0; return trade(s, [{ it, from }]) }

// The night's places come from the station data; every find exists, and every lock and bonus is a tool you can hold.
assert.equal(SITES.length, 10)
assert.equal(SHOPS.length, 5)
for (const site of SITES) for (const f of site.finds) assert.ok(KINDS[f.kind], `${site.id}: ${f.kind}`)
for (const t of GEAR) { assert.ok(KINDS[t]?.tags?.includes('tool'), `${t} is a tool`); const s = start(); assert.ok(accepts(s, spawn(s, t)!, { at: 'hand' }), `${t} goes in a hand`) }

// A new game has a pack on your back. Your back takes one pack and nothing else; your hand one tool and nothing else.
{
  assert.equal(worn(start())?.kind, 'pack')
  const s = start(); s.items = []
  const pack = spawn(s, 'pack', { at: 'back' })!, apple = spawn(s, 'it_food_apple')!, pack2 = spawn(s, 'pack')!
  assert.equal(worn(s)?.id, pack.id)
  assert.ok(!accepts(s, apple, { at: 'back' }), 'an apple is not a pack')
  assert.ok(!accepts(s, pack2, { at: 'back' }), 'one pack at a time')
  const torch = spawn(s, TORCH, { at: 'hand' })!, knife = spawn(s, 'it_fab_knife')!
  assert.equal(inHand(s)?.id, torch.id)
  assert.ok(!accepts(s, knife, { at: 'hand' }), 'one tool at a time')
  assert.ok(!accepts(s, apple, { at: 'site' }), 'nobody is out: the site takes nothing')
}

// No pack, no going out; a locked site needs its tool in your hand, and a bonus tool adds searches.
{
  const s = night()
  assert.match(barred(s, ducts)!, /pack/)
  spawn(s, 'pack', { at: 'back' })
  assert.equal(barred(s, ducts), null)
  assert.match(barred(s, bunks)!, /torch/)
  assert.equal(searchesFor(s, ducts), ducts.searches)
  spawn(s, TORCH, { at: 'hand' })
  assert.equal(barred(s, bunks), null)
  assert.equal(searchesFor(s, ducts), ducts.searches + 2)
}

// Out at a site: each search turns up a find on the ground, the searches run down, and only the ground and the pack are in reach.
{
  const s = night()
  const pack = spawn(s, 'pack', { at: 'back' })!, apple = spawn(s, 'it_food_apple')!
  assert.equal(goOut(s, ducts.id), null)
  assert.equal(s.out?.left, ducts.searches)
  assert.match(goOut(s, ducts.id)!, /already/)
  let finds = 0
  for (let i = 0; i < ducts.searches; i++) { const r = search(s, () => 0.01); assert.ok(Array.isArray(r)); finds += r.length }
  assert.equal(search(s), 'done')
  assert.equal(inSpace(s, { at: 'site' }).length, finds)
  const find = inSpace(s, { at: 'site' })[0]
  assert.ok(accepts(s, find, { host: pack.id, slot: 0 }), 'a find goes into the pack')
  assert.ok(!accepts(s, find, null), 'not onto the field: you are not home')
  assert.ok(!accepts(s, apple, { host: pack.id, slot: 0 }), 'nothing at home is in reach')
  move(s, find, { host: pack.id, slot: 0 })
  const back = goHome(s)
  assert.equal(back.left, finds - 1)
  assert.equal(s.out, undefined)
  assert.equal(inSpace(s, { at: 'site' }).length, 0)
  assert.equal(inSpace(s, { host: pack.id, slot: 0 }).length, 1)
  assert.ok(accepts(s, apple, { host: pack.id, slot: 0 }), 'home again: everything is in reach')
}

// A search with no room on the ground is not spent.
{
  const s = night()
  spawn(s, 'pack', { at: 'back' })
  goOut(s, 'site_slag_heap')
  for (let i = 0; i < 99; i++) while (spawn(s, 'it_core_rubble', { at: 'site' })); // the ground is full of rubble
  const left = s.out!.left
  assert.equal(search(s, () => 0.99), 'full')
  assert.equal(s.out!.left, left)
}

// A refill in your hand is used up going in; the tool in your hand wears a night when it served the place, and is gone worn through.
{
  const s = night()
  spawn(s, 'pack', { at: 'back' })
  spawn(s, MASK, { at: 'hand' })
  assert.equal(goOut(s, 'site_dead_scrubber'), null)
  assert.equal(inHand(s), undefined, 'the refill is used up')
  goHome(s)
  const torch = spawn(s, TORCH, { at: 'hand' })!
  goOut(s, bunks.id); goHome(s)
  assert.equal(torch.used, 1)
  assert.equal(nightsLeft(torch), KINDS[TORCH].wears! - 1)
  torch.used = KINDS[TORCH].wears! - 1
  goOut(s, bunks.id)
  assert.equal(goHome(s).spent?.kind, TORCH)
  assert.equal(inHand(s), undefined)
  const wrench = spawn(s, WRENCH, { at: 'hand' })!
  goOut(s, ducts.id); goHome(s)
  assert.equal(wrench.used, undefined, 'a wrench does nothing in the ducts, and does not wear there')
}

// A shop: tonight's stock is on its counter at its price; taking a thing into the pack buys it, putting it back returns it,
// and one you cannot pay for stays. One of yours laid on the counter sells at their floor, if they buy that sort of thing.
{
  const s = night(); s.cash = 40
  const pack = spawn(s, 'pack', { at: 'back' })!
  const hw = shopOf('shop_hardware')!
  assert.equal(goOut(s, hw.id), null)
  const stock = inSpace(s, { at: 'site' })
  assert.ok(stock.length > 0 && stock.every(o => o.sale! > 0), 'each thing has its price')
  assert.equal(stock.filter(o => o.kind === TORCH).length, hw.sells.find(g => g.kind === TORCH)!.perDay)
  for (const g of hw.sells) assert.equal(stock.filter(o => o.kind === g.kind).length, g.perDay, `${g.kind}: the day's restock, even what they would not buy back`)
  const mask = stock.find(o => o.kind === MASK)!, torch = stock.find(o => o.kind === TORCH)!
  const t1 = move(s, mask, { host: pack.id, slot: 0 })
  assert.equal(t1.cost, mask.sale)
  assert.equal(s.cash, 40 - mask.sale!)
  move(s, mask, { at: 'site' })
  assert.equal(s.cash, 40, 'put back, the money comes back')
  s.cash = torch.sale! - 1
  assert.ok(!accepts(s, torch, { host: pack.id, slot: 0 }), 'not enough money for the torch')
  s.cash = 40
  const knife = spawn(s, 'it_fab_knife', { host: pack.id, slot: 0 })!, bread = spawn(s, 'it_food_bread', { host: pack.id, slot: 0 })!
  assert.ok(accepts(s, knife, { at: 'site' }), 'hardware buys tools')
  assert.ok(!accepts(s, bread, { at: 'site' }), 'hardware does not buy bread')
  const t2 = move(s, knife, { at: 'site' })
  assert.equal(t2.paid, floorFor(hw.buys, knife))
  assert.ok(!s.items.includes(knife), 'sold: it is theirs, gone')
  move(s, mask, { host: pack.id, slot: 0 })
  goHome(s)
  assert.equal(inSpace(s, { at: 'site' }).length, 0, 'the counter goes with the shop')
  assert.equal(mask.sale, undefined, 'what came home is yours')
  assert.equal(s.out, undefined)
}
// The scrap yard takes anything, at its floor.
{
  const s = night()
  const pack = spawn(s, 'pack', { at: 'back' })!
  goOut(s, 'shop_scrap_yard')
  const bread = spawn(s, 'it_food_bread', { host: pack.id, slot: 0 })!
  assert.ok(accepts(s, bread, { at: 'site' }))
  assert.equal(floorFor(shopOf('shop_scrap_yard')!.buys, bread), Math.floor(KINDS.it_food_bread.price! * 0.35))
}

// Saved and loaded: being out, the searches left, the finds on the ground, a shop's prices and a tool's wear are kept; sleeping ends the night.
{
  const s = night()
  spawn(s, 'pack', { at: 'back' })
  const torch = spawn(s, TORCH, { at: 'hand' })!
  torch.used = 3
  goOut(s, bunks.id); search(s)
  const t = settle(JSON.parse(JSON.stringify(s)))
  assert.deepEqual(t.out, s.out)
  assert.equal(t.night, true)
  assert.equal(inSpace(t, { at: 'site' }).length, inSpace(s, { at: 'site' }).length)
  assert.equal(t.items.find(o => o.kind === TORCH)?.used, 3)
  goHome(t); sleep(t)
  assert.equal(t.night, undefined)
  const u = night(); spawn(u, 'pack', { at: 'back' }); goOut(u, 'shop_dock_counter')
  const v = settle(JSON.parse(JSON.stringify(u)))
  assert.deepEqual(v.out?.buys, u.out?.buys)
  assert.equal(inSpace(v, { at: 'site' })[0].sale, inSpace(u, { at: 'site' })[0].sale)
}

// An old save's kinds are what they became: ore of copper is copper ore, a sleeping-pill blister its station blister.
{
  const t = settle({ items: [{ id: 1, kind: 'ore', x: 0, y: 0, rot: 0, props: { metal: 'copper' } }, { id: 2, kind: 'blister', x: 4, y: 0, rot: 0, props: { type: 'sleeping' } }, { id: 3, kind: 'furnace', x: 8, y: 0, rot: 0 }], next: 4 } as State)
  assert.deepEqual(t.items.map(o => o.kind), ['it_core_ore_copper', 'it_med_fb_sleeping_pill', 'mach_smelter'])
}

console.log('outside ok')

// Every preset starts the game with all it brings: its money, each of its things on the field, its tool in hand, the pack on your back.
assert.ok(PRESETS.length >= 3)
for (const p of PRESETS) {
  const s = start(p), field = inSpace(s, null)
  assert.equal(s.cash, p.credits, p.id)
  for (const t of p.things) assert.equal(field.filter(o => o.kind === t.id).length, t.qty, `${p.id}: ${t.id}`)
  assert.equal(field.length, p.things.reduce((n, t) => n + t.qty, 0), `${p.id}: nothing else on the field`)
  assert.equal(inHand(s)?.kind, p.hand, `${p.id}: in hand`)
  assert.equal(worn(s)?.kind, 'pack', `${p.id}: a pack`)
}
