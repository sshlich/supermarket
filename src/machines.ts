// Machines (STATION.md sections 5 and 6): a station machine is a container whose slots have roles (input, output, cell, tray,
// tool), placed on the field like anything else. What it makes are the station's recipes (src/recipes.json, written by
// scripts/station-kinds.ts). A job needs its inputs in the input slots, its disc in the tray when the recipe names one, its
// tools in the machine, and charge in the cells in the cell slots. It runs one of two ways:
// - **now**: it costs your energy (a few a day, refilled when you sleep), and is done at once;
// - **overnight**: free, but the machine is held until morning (nothing in or out of it); a growing recipe takes nights.
// Two machines have no recipes written (SEED.md 7.2): the recycler gives anything back as its materials, a tenth lost to
// sludge (part-units kept in the machine for next time), and the charger fills cells for money.

import DATA from './recipes.json' with { type: 'json' }
import { contents, find, inSpace, KINDS, remove, spawn, type Item, type Space, type State } from './world.ts'

export interface Qty { id: string; n: number; chance?: number }
export interface Recipe { id: string; name: string; machine: string; disc?: string; inputs: Qty[]; outputs: Qty[]; tools?: string[]; energy: number; cells: number; time: string; nights?: number }
export const RECIPES = DATA.recipes as Recipe[]
const UNITS = DATA.units as Record<string, string>, SLUDGE = DATA.sludge
/** Energy a day (start.json `energy_cap`): what jobs started by hand cost. */
export const ENERGY_CAP = 7
/** What a unit of charge costs at the charger (a small cell holds 10 and costs 6 new). */
export const POWER_PRICE = 0.2
export const RECYCLE = 0.9

export const isMachine = (it: Item) => !!KINDS[it.kind]?.machine
export const energyOf = (s: State) => s.energy ?? ENERGY_CAP
export const recipesFor = (kind: string) => RECIPES.filter(r => r.machine === kind)
/** A cell's charge left (full when it has never been used). */
export const chargeOf = (it: Item) => it.charge ?? KINDS[it.kind]?.cell ?? 0
const slotsWith = (m: Item, role: string) => (KINDS[m.kind].slots ?? []).flatMap((sl, i) => sl.role === role ? [i] : [])
const inRole = (s: State, m: Item, role: string) => slotsWith(m, role).flatMap(i => inSpace(s, { host: m.id, slot: i }))
const cellsIn = (s: State, m: Item) => inRole(s, m, 'cell').filter(o => KINDS[o.kind].cell)
export const chargeIn = (s: State, m: Item) => cellsIn(s, m).reduce((n, c) => n + chargeOf(c), 0)
const count = (items: Item[], id: string) => items.filter(o => o.kind === id).length
const name = (id: string) => KINDS[id]?.name.toLowerCase() ?? id

/** One thing a machine could do now: a recipe (or its generic job), whether it can, and if not what is missing. */
export interface Option { id: string; name: string; ok: boolean; missing: string[]; now: boolean; overnight: boolean; energy: number; cells: number; nights: number; credits?: number; outs: Qty[] }

/** What this machine could do with what is in it: every recipe it has a disc for (or needs none), ready ones first, then nearest. */
export function options(s: State, m: Item): Option[] {
  const spec = KINDS[m.kind].machine
  if (!spec) return []
  if (spec.generic === 'recycle') return [recycleOption(s, m)]
  if (spec.generic === 'charge') return [chargeOption(s, m)]
  if (spec.generic) return []
  const ins = inRole(s, m, 'input'), all = contents(s, m.id), disc = inRole(s, m, 'tray').map(o => o.kind), charge = chargeIn(s, m), cellSlot = slotsWith(m, 'cell').length > 0
  const out: Option[] = []
  for (const r of recipesFor(m.kind)) {
    if (r.disc && !disc.includes(r.disc)) continue // a recipe on a disc shows once its disc is in the tray
    const missing: string[] = []
    for (const q of r.inputs) { const have = count(ins, q.id); if (have < q.n) missing.push(`${q.n - have} ${name(q.id)}`) }
    for (const t of r.tools ?? []) if (!count(all, t)) missing.push(`a ${name(t)} in it`)
    if (r.cells > 0 && cellSlot && charge < r.cells) missing.push(`${r.cells - charge} more charge`)
    const nights = r.time === 'nights' ? r.nights ?? 1 : 0
    out.push({ id: r.id, name: r.name, ok: !missing.length, missing, now: r.time !== 'nights', overnight: r.time !== 'instant', energy: r.time === 'instant' ? 0 : r.energy, cells: cellSlot ? r.cells : 0, nights: nights || 1, outs: r.outputs })
  }
  return out.sort((a, b) => Number(b.ok) - Number(a.ok) || a.missing.length - b.missing.length)
}

/** What the recycler would give back for what is in its hopper: whole unit items per material, a tenth to sludge. */
function recycled(s: State, m: Item): { outs: Qty[]; residue: Record<string, number>; eaten: Item[] } {
  const eaten = inRole(s, m, 'input').filter(o => KINDS[o.kind].made && !KINDS[o.kind].machine)
  const mats: Record<string, number> = { ...(m.residue ?? {}) }
  for (const o of eaten) for (const [mat, n] of Object.entries(KINDS[o.kind].made!)) {
    mats[mat] = (mats[mat] ?? 0) + n * RECYCLE
    mats.sludge = (mats.sludge ?? 0) + n * (1 - RECYCLE)
  }
  const outs: Qty[] = [], residue: Record<string, number> = {}
  for (const [mat, n] of Object.entries(mats)) {
    const id = mat === 'sludge' ? SLUDGE : UNITS[mat], whole = Math.floor(n + 1e-9)
    if (id && whole > 0) outs.push({ id, n: whole })
    if (n - whole > 1e-9) residue[mat] = n - whole
  }
  return { outs, residue, eaten }
}
function recycleOption(s: State, m: Item): Option {
  const spec = KINDS[m.kind].machine!, r = recycled(s, m), missing: string[] = []
  if (!r.eaten.length) missing.push('something in the hopper')
  if (chargeIn(s, m) < spec.cells) missing.push(`${spec.cells - chargeIn(s, m)} more charge`)
  return { id: 'recycle', name: 'Recycle', ok: !missing.length, missing, now: true, overnight: true, energy: spec.energy, cells: spec.cells, nights: 1, outs: r.outs }
}
function chargeOption(s: State, m: Item): Option {
  const cells = inRole(s, m, 'input').filter(o => KINDS[o.kind].cell), want = cells.reduce((n, c) => n + KINDS[c.kind].cell! - chargeOf(c), 0)
  const credits = Math.ceil(want * POWER_PRICE), missing: string[] = []
  if (!cells.length) missing.push('a cell in the cradle'); else if (!want) missing.push('a cell that is not full')
  if (credits > (s.cash ?? 0)) missing.push(`${credits}$ for the power`)
  return { id: 'charge', name: 'Charge', ok: !missing.length, missing, now: true, overnight: true, energy: KINDS[m.kind].machine!.energy, cells: 0, nights: 1, credits, outs: [] }
}

/** Take charge from the cells in a machine, the emptiest first (so one runs flat and can go to the charger). */
function drain(s: State, m: Item, n: number) {
  for (const c of cellsIn(s, m).sort((a, b) => chargeOf(a) - chargeOf(b))) { const take = Math.min(n, chargeOf(c)); c.charge = chargeOf(c) - take; n -= take; if (n <= 0) break }
}
/** Put what a job made where it goes: the output slots, else the input slots, else the field beside it. Null if something found no room. */
function place(s: State, m: Item, outs: Qty[]): Item[] | null {
  const made: Item[] = []
  const spaces: Space[] = [...slotsWith(m, 'output'), ...slotsWith(m, 'input')].map(slot => ({ host: m.id, slot }))
  for (const q of outs) for (let i = 0; i < q.n; i++) {
    let it: Item | null = null
    for (const sp of spaces) if ((it = spawn(s, q.id, sp, {}, true))) break
    it ??= spawn(s, q.id, m.in ? { host: m.in.host, slot: m.in.slot } : m.at ? { at: m.at } : null) ?? spawn(s, q.id, null)
    if (!it) return null
    made.push(it)
  }
  return made
}
const roll = (outs: Qty[], rand: () => number) => outs.flatMap(q => !q.chance ? [q] : rand() < q.chance ? [{ id: q.id, n: q.n }] : [])

/**
 * Run a machine's job: `now` (your energy, done at once) or `overnight` (free; the machine is held until morning). What it made
 * now (nothing yet overnight), or why it could not. Nothing changes when it cannot (no room for what it makes, say).
 */
export function run(s: State, machineId: number, id: string, mode: 'now' | 'overnight', rand = Math.random): { made: Item[] } | string {
  const m0 = find(s, machineId)
  if (!m0 || !isMachine(m0)) return 'not a machine'
  if (m0.job) return 'it is busy until morning'
  const opt = options(s, m0).find(o => o.id === id)
  if (!opt) return 'it cannot do that'
  if (!opt.ok) return `it needs ${opt.missing.join(', ')}`
  if (mode === 'now' && !opt.now) return 'that takes nights: leave it overnight'
  if (mode === 'overnight' && !opt.overnight) return 'that is done by hand, now'
  if (mode === 'now' && energyOf(s) < opt.energy) return `that takes ${opt.energy} energy, and you have ${energyOf(s)} left today`
  // tried on a copy first: if what it makes has no room, nothing has happened
  const t: State = structuredClone(s), m = find(t, machineId)!
  let outs: Qty[]
  if (id === 'recycle') { const r = recycled(t, m); remove(t, r.eaten.map(o => o.id)); outs = r.outs; m.residue = r.residue; if (!Object.keys(r.residue).length) delete m.residue }
  else if (id === 'charge') { for (const c of inRole(t, m, 'input')) if (KINDS[c.kind].cell) delete c.charge; t.cash = (t.cash ?? 0) - (opt.credits ?? 0); outs = [] }
  else {
    const r = RECIPES.find(x => x.id === id)!
    const ins = inRole(t, m, 'input')
    for (const q of r.inputs) remove(t, ins.filter(o => o.kind === q.id).slice(0, q.n).map(o => o.id))
    for (const tool of r.tools ?? []) { const it = contents(t, m.id).find(o => o.kind === tool)!, w = KINDS[tool].wears; if (w) { it.used = (it.used ?? 0) + 1; if (it.used >= w) remove(t, [it.id]) } }
    outs = roll(r.outputs, rand)
  }
  drain(t, m, opt.cells)
  if (mode === 'now') {
    t.energy = energyOf(t) - opt.energy
    const made = place(t, m, outs)
    if (!made) return 'no room for what it makes: clear its output first'
    Object.assign(s, t)
    return { made: made.map(o => find(s, o.id)!) }
  }
  m.job = { recipe: id, nights: opt.nights, outs }
  Object.assign(s, t)
  return { made: [] }
}

/** The night passes (call it as you sleep): jobs left overnight move on, and finished ones put out what they made; your energy is full again. What finished. */
export function overnight(s: State): { machine: Item; made: Item[] }[] {
  const done: { machine: Item; made: Item[] }[] = []
  for (const m of s.items.filter(o => o.job)) {
    const job = m.job!
    if (--job.nights > 0) continue
    delete m.job
    const made = place(s, m, job.outs) ?? [] // what found no room anywhere is lost: the morning says so
    done.push({ machine: m, made })
  }
  s.energy = ENERGY_CAP
  return done
}
/** What a machine is doing, in a line for its window and tooltip. */
export function says(s: State, m: Item): string {
  if (m.job) return `working overnight: ${m.job.recipe === 'recycle' ? 'recycling' : m.job.recipe === 'charge' ? 'charging' : RECIPES.find(r => r.id === m.job!.recipe)?.name.toLowerCase() ?? 'a job'}${m.job.nights > 1 ? `, ${m.job.nights} nights to go` : ', done by morning'}`
  const cells = cellsIn(s, m)
  return cells.length ? `charge ${chargeIn(s, m)} of ${cells.reduce((n, c) => n + KINDS[c.kind].cell!, 0)}` : slotsWith(m, 'cell').length ? 'no cell in it' : ''
}
export const outsText = (outs: Qty[]) => outs.map(q => `${q.n} ${name(q.id)}${q.chance ? ` (${Math.round(q.chance * 100)}%)` : ''}`).join(', ')
