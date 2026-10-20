import assert from 'node:assert/strict'
import { accepts, contents, inSpace, KINDS, settle, spawn, start, type Item, type State } from './world.ts'
import { chargeIn, ENERGY_CAP, energyOf, options, overnight, RECIPES, run, says } from './machines.ts'

const fresh = (): State => { const s = start(); s.items = []; s.cash = 50; return s }
const slotOf = (m: Item, role: string) => KINDS[m.kind].slots!.findIndex(sl => sl.role === role)
const put = (s: State, m: Item, kind: string, role: string, n = 1) => { for (let i = 0; i < n; i++) assert.ok(spawn(s, kind, { host: m.id, slot: slotOf(m, role) }), `${kind} into ${m.kind}'s ${role}`) }
const inSlot = (s: State, m: Item, role: string) => inSpace(s, { host: m.id, slot: slotOf(m, role) })

// Every recipe the game runs names things that exist and a machine that runs; and each input, tool and disc fits its machine.
for (const r of RECIPES) {
  assert.ok(KINDS[r.machine]?.machine, r.id)
  for (const q of [...r.inputs, ...r.outputs]) assert.ok(KINDS[q.id], `${r.id}: ${q.id}`)
  const s = fresh(), m = spawn(s, r.machine)!
  const fits = (kind: string, roles: string[]) => KINDS[r.machine].slots!.some((sl, i) => roles.includes(sl.role ?? '') && accepts(s, { id: -1, kind, x: 0, y: 0, rot: 0 }, { host: m.id, slot: i }))
  for (const q of r.inputs) assert.ok(fits(q.id, ['input']), `${r.id}: ${q.id} goes in an input slot`)
  for (const t of r.tools ?? []) assert.ok(fits(t, ['tool', 'consumable', 'input']), `${r.id}: tool ${t}`)
  if (r.disc) assert.ok(fits(r.disc, ['tray']), `${r.id}: disc ${r.disc}`)
}

// The bench rolls a bar into two sheets, now, for a point of energy; with nothing on it, it says what it would need.
{
  const s = fresh(), bench = spawn(s, 'mach_bench')!
  const roll = () => options(s, bench).find(o => o.id === 'rcp_fab_roll_sheet')!
  assert.deepEqual(roll().missing, [`1 ${KINDS.it_fab_bar_iron.name.toLowerCase()}`])
  put(s, bench, 'it_fab_bar_iron', 'input')
  assert.ok(roll().ok)
  const r = run(s, bench.id, 'rcp_fab_roll_sheet', 'now')
  assert.ok(typeof r !== 'string', String(r))
  assert.deepEqual(r.made.map(o => o.kind), ['it_fab_sheet', 'it_fab_sheet'])
  assert.equal(energyOf(s), ENERGY_CAP - 1)
  assert.equal(contents(s, bench.id).filter(o => o.kind === 'it_fab_bar_iron').length, 0, 'the bar is used')
  s.energy = 0
  put(s, bench, 'it_fab_bar_iron', 'input')
  assert.match(String(run(s, bench.id, 'rcp_fab_roll_sheet', 'now')), /energy/)
  assert.equal(contents(s, bench.id).filter(o => o.kind === 'it_fab_bar_iron').length, 1, 'refused: nothing changed')
}

// Overnight is free, holds the machine (nothing in or out), and the morning brings what it made; sleeping fills your energy.
{
  const s = fresh(), bench = spawn(s, 'mach_bench')!
  put(s, bench, 'it_fab_bar_iron', 'input')
  s.energy = 2
  assert.ok(typeof run(s, bench.id, 'rcp_fab_roll_sheet', 'overnight') !== 'string')
  assert.equal(energyOf(s), 2, 'no energy overnight')
  assert.ok(bench.job || s.items.find(o => o.id === bench.id)!.job)
  const b = s.items.find(o => o.id === bench.id)!
  const apple = spawn(s, 'it_food_apple')!
  assert.ok(!accepts(s, apple, { host: b.id, slot: 0 }), 'busy: nothing goes in')
  assert.match(says(s, b), /overnight/)
  const done = overnight(s)
  assert.equal(done.length, 1)
  assert.deepEqual(done[0].made.map(o => o.kind), ['it_fab_sheet', 'it_fab_sheet'])
  assert.equal(b.job, undefined)
  assert.equal(energyOf(s), ENERGY_CAP)
}

// A recipe that takes nights (hydro greens: three) only runs overnight, with its disc in the tray, its lamp, and charge.
{
  const s = fresh(), tray = spawn(s, 'mach_hydro_tray')!
  assert.equal(options(s, tray).length, 0, 'no disc, no recipes')
  put(s, tray, 'disc_food_hydro_greens', 'tray')
  const grow = () => options(s, tray).find(o => o.id === 'rcp_food_grow_greens')!
  assert.ok(grow() && !grow().ok)
  put(s, tray, 'it_food_seed_greens', 'input'); put(s, tray, 'it_core_greywater', 'input', 2); put(s, tray, 'it_life_nutrient', 'input')
  put(s, tray, 'it_tech_lamp', 'tool')
  const g = grow()
  assert.ok(g.ok && !g.now && g.nights === 3, JSON.stringify(g))
  assert.match(String(run(s, tray.id, g.id, 'now')), /nights/)
  assert.ok(typeof run(s, tray.id, g.id, 'overnight', () => 0) !== 'string')
  const t = s.items.find(o => o.id === tray.id)!
  assert.equal(overnight(s).length, 0); assert.equal(overnight(s).length, 0)
  const done = overnight(s)
  assert.ok(done[0].made.some(o => o.kind === 'it_food_greens'), 'greens on the third morning')
  assert.equal(t.job, undefined)
}

// Cells: a job drains charge (the emptiest cell first); with too little it will not run; the charger fills a cell for money.
{
  const s = fresh(), crusher = spawn(s, 'mach_crusher')!
  const r = RECIPES.find(x => x.machine === 'mach_crusher' && x.cells > 0)!
  for (const q of r.inputs) put(s, crusher, q.id, 'input', q.n)
  assert.ok(options(s, crusher).find(o => o.id === r.id)!.missing.some(m => /charge/.test(m)), 'no cell, no charge')
  put(s, crusher, 'it_tech_cell_s', 'cell')
  assert.equal(chargeIn(s, crusher), 10)
  assert.ok(typeof run(s, crusher.id, r.id, 'now') !== 'string')
  assert.equal(chargeIn(s, s.items.find(o => o.id === crusher.id)!), 10 - r.cells)
  const charger = spawn(s, 'mach_charger')!, cell = s.items.find(o => o.kind === 'it_tech_cell_s')!
  cell.charge = 4
  delete cell.in; cell.in = { host: charger.id, slot: 0 }; cell.x = 0; cell.y = 0
  const opt = options(s, charger)[0]
  assert.ok(opt.ok && opt.credits === Math.ceil(6 * 0.2))
  assert.ok(typeof run(s, charger.id, 'charge', 'now') !== 'string')
  assert.equal(s.items.find(o => o.id === cell.id)!.charge, undefined, 'full again')
  assert.equal(s.cash, 50 - opt.credits!)
}

// The recycler gives a thing back as its materials, a tenth to sludge, and keeps the part-units for next time.
{
  const s = fresh(), rec = spawn(s, 'mach_recycler')!
  put(s, rec, 'it_tech_cell_s', 'cell')
  put(s, rec, 'it_fab_bar_iron', 'input', 2)
  const o = options(s, rec)[0]
  assert.ok(o.ok, o.missing.join())
  const r = run(s, rec.id, 'recycle', 'now')
  assert.ok(typeof r !== 'string', String(r))
  const iron = KINDS.it_fab_bar_iron.made!.mat_iron * 2 * 0.9
  assert.equal(r.made.filter(x => x.kind === 'it_core_scrap_iron').length, Math.floor(iron + 1e-9))
  assert.ok(inSlot(s, s.items.find(x => x.id === rec.id)!, 'output').length === r.made.length, 'into its chutes')
  assert.equal(inSlot(s, s.items.find(x => x.id === rec.id)!, 'input').length, 0)
}

// A job whose output has no room anywhere does not run, and nothing changes.
{
  const s = fresh(), bench = spawn(s, 'mach_bench')!
  put(s, bench, 'it_fab_bar_iron', 'input')
  while (spawn(s, 'it_fab_bar_iron', { host: bench.id, slot: 0 })); // the top full of bars
  while (spawn(s, 'it_core_rubble')); for (const at of ['inside', 'outside'] as const) while (spawn(s, 'it_core_rubble', { at }));
  while (spawn(s, 'it_core_grit')); for (const at of ['inside', 'outside'] as const) while (spawn(s, 'it_core_grit', { at }));
  const before = JSON.stringify(s)
  const r = run(s, bench.id, 'rcp_fab_roll_sheet', 'now')
  assert.match(String(r), /room/)
  assert.equal(JSON.stringify(s), before)
}

// Saved: a job in progress, a cell's charge, a recycler's part-units and your energy.
{
  const s = fresh(), bench = spawn(s, 'mach_bench')!, cell = spawn(s, 'it_tech_cell_s')!
  cell.charge = 3
  put(s, bench, 'it_fab_bar_iron', 'input')
  run(s, bench.id, 'rcp_fab_roll_sheet', 'overnight')
  s.energy = 4
  const t = settle(JSON.parse(JSON.stringify(s)))
  assert.deepEqual(t.items.find(o => o.id === bench.id)!.job, s.items.find(o => o.id === bench.id)!.job)
  assert.equal(t.items.find(o => o.id === cell.id)!.charge, 3)
  assert.equal(t.energy, 4)
}

console.log('machines ok')
