// The Seam (DESIGN 9, 10.3): each night the village burns cells for light and machines, eats and drinks, loses the
// people it can't feed, and makes a little; then its containers act on what's in them. MAINT is silent about all of it.

import { BOXES, HOME, type Box } from '../data/items.ts'
import { DIALS, TESTED } from '../data/relics.ts'
import { MAINT } from '../data/text.ts'
import { K, applyDrop, become, grab, make, planDrop, remove, stow } from './containers.ts'
import { near, prop, total } from './items.ts'
import { learn } from './knowledge.ts'
import { pick, rand } from './rng.ts'
import type { Item, State } from './state.ts'

/** The Seam's numbers (section 9), in one place for tuning. */
export const H = {
  lamps: 2,        // POWER a night to keep the lamps lit
  perHead: 10,     // FOOD and WATER: one unit a night per ten people, rounded up
  moss: 2,         // Moss Cakes a night from powered racks
  condenser: 1,    // Water Canisters a night
  conduit: 3,      // Cells a night the tapped conduit fills in the Charger
  lights: 1,       // Seam attention a night the lamps are lit
  leak: 3,         // Seam attention a night per point of loose SIGNAL
  audit: 100,
  afterAudit: 30,
  auditPeople: 4,
  auditItems: 0.3, // chance each thing in the Stores is taken
}

export type Machine = 'cold' | 'moss' | 'condenser'
export const MACHINES: Record<Machine, { name: string; blurb: string }> = {
  cold: { name: 'Cold Locker', blurb: 'Keeps food from spoiling while it runs. 1 POWER a night.' },
  moss: { name: 'Moss Racks', blurb: `${H.moss} Moss Cakes a night, grown under the lamps: no light, no moss. 1 POWER a night.` },
  condenser: { name: 'Condenser', blurb: `${H.condenser} Water Canister a night from the lamps' warm air. 1 POWER a night.` },
}

export interface Note { id: number; box: Box; text: string; quiet?: boolean }

/** Where the Seam's things are tonight: its furniture, and the kit when the runner is home. */
export const homeBoxes = (s: State): Box[] => s.run ? HOME : [...HOME, 'pack', 'belt']
/** Things at home that can reach the outside: everything but what's in the Lead Box. */
export const loose = (s: State) => homeBoxes(s).filter(b => b !== 'lead').flatMap(b => s.C[b])
/** Light at home from things that glow: every two LIGHT spares a POWER for the lamps. */
export const glow = (s: State) => Math.floor(total(loose(s), 'LIGHT') / 2)

const units = (s: State, kind: string, boxes: Box[]) => boxes.reduce((a, b) => a + s.C[b].filter(it => it.kind === kind).reduce((n, it) => n + it.n, 0), 0)
/** FOOD, WATER and POWER in store, and what a night takes. */
export function stock(s: State) {
  const count = (key: 'food' | 'water' | 'power', boxes: Box[]) => boxes.reduce((a, b) => a + s.C[b].reduce((n, it) => n + (it.rotten ? 0 : (K[it.kind][key] ?? 0) * it.n), 0), 0)
  const people = Math.ceil(s.villagers.length / H.perHead)
  const machines = (Object.keys(s.machines) as Machine[]).filter(m => s.machines[m]).length
  return {
    food: { have: count('food', ['stores', 'cold']), need: people },
    water: { have: count('water', ['stores']), need: people },
    power: { have: count('power', ['stores']), need: (s.blackout ? 0 : Math.max(0, H.lamps - glow(s))) + machines },
  }
}

/** Someone the village loses: never the runner while anyone else is left. */
function lose(s: State, n: number): string[] {
  const out: string[] = []
  for (let i = 0; i < n && s.villagers.length; i++) {
    const others = s.villagers.filter(v => v !== s.runner.name)
    const who = others.length ? pick(s, others) : s.runner.name
    s.villagers.splice(s.villagers.indexOf(who), 1)
    out.push(who)
  }
  return out
}

/** Tonight at home (6.7 steps 1-2). Returns whether the lamps were lit: a dark Seam isn't found by hounds. */
export function homeNight(s: State, notes: Note[] = []): { lit: boolean } {
  const note = (box: Box, it: Item, text: string, quiet = false) => notes.push({ id: it.id, box, text, quiet })
  const event = (text: string) => s.log.push({ day: s.day, kind: 'event', text })
  const name = (it: Item) => K[it.kind].name

  // ---- power: the lamps first, then the machines, one Cell for each POWER
  const burn = () => {
    const cell = s.C.stores.find(it => it.kind === 'cell')
    if (!cell) return false
    note('stores', cell, 'burned tonight for power')
    learn(s, 'I:cell:use', 'exact', 'used')
    if (cell.n === 1) become(cell, 'emptyCell')
    else { cell.n--; stow(s, 'stores', make(s, 'emptyCell')) }
    return true
  }
  const cellsFor = (n: number) => units(s, 'cell', ['stores']) >= n && Array.from({ length: n }).every(burn)
  const lit = !s.blackout && cellsFor(Math.max(0, H.lamps - glow(s)))
  const on = {
    cold: s.machines.cold && cellsFor(1),
    moss: s.machines.moss && lit && cellsFor(1),
    condenser: s.machines.condenser && lit && cellsFor(1),
  }
  // Machines switched on that stood idle (in a blackout, the racks and the condenser are dark on purpose). One line.
  const idle = (Object.keys(on) as Machine[]).filter(m => s.machines[m] && !on[m] && !(s.blackout && m !== 'cold'))
  const names = idle.map(m => `the ${MACHINES[m].name}`).join(idle.length > 2 ? ', ' : ' and ').replace(/, (?=[^,]*$)/, ', and ')
  if (!s.blackout && !lit) event(`Not enough Cells for the lamps. The Seam sat in the dark${idle.length ? `, and ${names} stood idle` : ''}.`)
  else if (idle.length) event(`No Cells left for ${names}. ${idle.length > 1 ? 'They' : 'It'} stood idle.`)

  // ---- eating and drinking, soonest to spoil first; each unit short costs someone
  const consume = (key: 'food' | 'water', need: number, boxes: Box[]) => {
    const pile = boxes.flatMap(b => s.C[b].filter(it => (K[it.kind][key] ?? 0) > 0 && !it.rotten).map(it => ({ b, it })))
      .sort((a, b) => (a.it.fresh ?? 1e9) - (b.it.fresh ?? 1e9))
    let got = 0
    for (const { b, it } of pile) while (got < need && it.n > 0) {
      got += K[it.kind][key]!
      note(b, it, key === 'food' ? 'eaten tonight' : 'drunk tonight')
      learn(s, `I:${it.kind}:use`, 'exact', 'used')
      remove(s, b, it, 1)
    }
    return Math.max(0, need - got)
  }
  const need = Math.ceil(s.villagers.length / H.perHead)
  const short = { food: consume('food', need, ['stores', 'cold']), water: consume('water', need, ['stores']) }
  if (short.food + short.water) {
    const gone = lose(s, short.food + short.water)
    event(`Short ${[short.food && `${short.food} FOOD`, short.water && `${short.water} WATER`].filter(Boolean).join(' and ')}. ${gone.join(', ')} left in the night, or didn't wake.`)
  }

  // ---- what the machines make overnight
  const make1 = (kind: string, n: number) => { const left = stow(s, 'stores', make(s, kind, { n })); if (left) event(`No room in the Stores: ${left} ${K[kind].name} lost.`) }
  if (on.moss) make1('moss', H.moss)
  if (on.condenser) make1('water', H.condenser)

  // ---- the containers (10.3): spoilage, decided at dusk for everything at once, then applied
  const turns: [Box, Item, number, string][] = []
  for (const box of Object.keys(s.C) as Box[]) for (const it of s.C[box]) {
    if (it.fresh === undefined || it.rotten) continue
    if (box === 'cold' && on.cold) { note(box, it, 'keeps in the running Cold Locker', true); continue }
    const nb = near(s, box, it)
    const cold = nb.find(o => prop(o, 'COLD') >= 1)
    if (cold) { note(box, it, `keeps beside the ${name(cold)}`, true); continue }
    const why: string[] = []
    let d = 1
    if (nb.some(o => prop(o, 'HEAT') >= 2)) { d++; why.push('beside heat') }
    if (nb.some(o => prop(o, 'ROT') > 0)) { d++; why.push('beside rot') }
    if (nb.some(o => prop(o, 'ROT') < 0)) { d--; why.push('beside something that preserves') }
    turns.push([box, it, d, why.length ? `, ${why.join(' and ')}` : ''])
  }
  const rotted: Record<string, number> = {}
  for (const [box, it, d, why] of turns) {
    if (d <= 0) { note(box, it, `keeps tonight${why}`, true); continue }
    const was = it.fresh!
    it.fresh = Math.max(0, was - d)
    if (it.fresh === 0) {
      it.rotten = true
      note(box, it, `rots${why}`)
      rotted[`${name(it)} in the ${BOXES[box].name}`] = (rotted[`${name(it)} in the ${BOXES[box].name}`] ?? 0) + it.n
    } else note(box, it, `goes off${why} (${was} → ${it.fresh} nights left)`, true)
  }
  for (const [what, n] of Object.entries(rotted)) event(`${n > 1 ? `${n}× ` : ''}${what} rotted.`)

  // ---- the Charger: the tapped conduit, and half of any CHARGE inside it, fill Empty Cells
  const fill = (box: Box, piles: Item[], n: number, why: string) => {
    for (const it of piles) while (n > 0 && it.n > 0) {
      n--
      note(box, it, `charged ${why}`)
      learn(s, 'I:emptyCell:use', 'exact', 'used')
      if (it.n === 1) { become(it, 'cell'); break }
      it.n--
      stow(s, box, make(s, 'cell'))
    }
  }
  const empties = (box: Box) => s.C[box].filter(o => o.kind === 'emptyCell')
  fill('charger', empties('charger'), (s.conduitTapped ? H.conduit : 0) + s.C.charger.reduce((a, it) => a + Math.floor(prop(it, 'CHARGE') / 2) * it.n, 0), 'in the Charger')
  // Elsewhere, anything with CHARGE 3 or more fills one Empty Cell it touches.
  for (const box of Object.keys(s.C) as Box[]) {
    if (box === 'charger') continue
    for (const cell of empties(box)) {
      const src = near(s, box, cell).find(o => prop(o, 'CHARGE') >= 3)
      if (src) fill(box, [cell], 1, `beside the ${name(src)}`)
    }
  }

  // ---- the lab (10.4): the dial tests the first relic on the bench for one property, overnight
  const relic = s.C.lab.find(it => K[it.kind].relic)
  s.lab.last = undefined
  if (relic && s.lab.dial) {
    const d = DIALS[s.lab.dial]
    for (const p of d.props) learn(s, `R:${relic.kind}:${p}`, 'exact', 'lab')
    if (s.lab.dial === 'receiver') s.seamA += prop(relic, 'SIGNAL') * 5
    if (TESTED.every(p => s.know[`R:${relic.kind}:${p}`]?.state === 'exact')) learn(s, `R:${relic.kind}:class`, 'exact', 'lab')
    s.lab.last = `${d.name}: ${d.props.map(p => `${p} ${prop(relic, p)}`).join(', ')}.`
    note('lab', relic, `tested on the ${d.name.toLowerCase()} tonight`)
  }

  // ---- attention: lit lamps, and Signal leaking from whatever isn't sealed
  if (lit) s.seamA += H.lights
  for (const box of homeBoxes(s).filter(b => b !== 'lead')) for (const it of s.C[box]) {
    const sig = prop(it, 'SIGNAL') * it.n
    if (sig > 0) { s.seamA += sig * H.leak; note(box, it, `leaks Signal into the walls (+${sig * H.leak} attention at the Seam)`) }
  }
  if (s.seamA >= H.audit) {
    const gone = lose(s, H.auditPeople)
    const taken = s.C.stores.filter(() => rand(s) < H.auditItems)
    for (const it of taken) remove(s, 'stores', it)
    s.seamA = H.afterAudit
    s.log.push({ day: s.day, kind: 'maint', text: MAINT.audit.replace('{n}', String(gone.length)) })
    event(`The Auditors came between the floors. ${gone.join(', ')} ${gone.length > 1 ? 'were' : 'was'} reclassified. ${taken.length} things were taken from the Stores.`)
  }
  return { lit }
}

/** What tonight would do to a dragged item if dropped here (a dry run of the drop, then of the night). */
export function forecastDrop(s: State, id: number, split: boolean, box: Box, x: number, y: number, rot: boolean): string[] {
  const c = structuredClone(s)
  const held = grab(c, id, split)
  const plan = held && planDrop(c, held, box, x, y, rot)
  if (!held || !plan) return []
  const next = c.next
  applyDrop(c, held, plan)
  const landed = plan.recipe ?? plan.merge ?? (held.splitOf !== undefined ? next : id)
  return forecast(c).get(landed) ?? []
}

/** What tonight would do to each item, as things stand (a dry run on a copy). */
export function forecast(s: State): Map<number, string[]> {
  const notes: Note[] = []
  homeNight(structuredClone(s), notes)
  const out = new Map<number, string[]>()
  for (const n of notes) out.set(n.id, [...out.get(n.id) ?? [], n.text])
  // A pile eaten one by one reads once, with a count.
  for (const [id, lines] of out) out.set(id, [...new Set(lines)].map(l => { const k = lines.filter(x => x === l).length; return k > 1 ? `${l} (×${k})` : l }))
  return out
}
