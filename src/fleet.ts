// Drones: a drone is a container with a cargo bay and a cell slot; a launch pad is a container whose cradle takes a drone.
// Launched from the pad, the drone and everything in it leave the board. It gets to the job's place after the distance (in
// hours, at its speed), where the cargo is checked against the slip and paid, and it is back after as long again.
// Step 2 of "Mail and drones: the first version" (IDEAS.md). One drone kind, fixed stats, a timer, no map.

import { jobOf, mailById, post, when } from './mail.ts'
import { contents, find, KINDS, matches, place, propOf, type DroneStats, type Item, type State } from './world.ts'

/** A drone that is out: it and what it carries (drone first), the pad it left, the job, and when it left, arrives and is back. `done` once it has been to the place. */
export interface Flight { items: Item[]; pad: number; job: number; out: number; arrives: number; back: number; done?: boolean }

export const statsOf = (kind: string): DroneStats | undefined => KINDS[kind]?.drone
const slotNamed = (kind: string, name: string) => (KINDS[kind]?.slots ?? []).findIndex(sl => sl.name === name)
/** What is in one named slot of a drone, from a list of items (the board's, or a flight's). */
const inSlot = (items: Item[], drone: Item, name: string) => items.filter(o => o.in?.host === drone.id && o.in.slot === slotNamed(drone.kind, name))

/** Hours to a place `dist` hours away at this drone's speed (at least one), and the charge for there and back. */
export const hoursOut = (st: DroneStats, dist: number) => Math.max(1, Math.ceil(dist / st.speed))
export const chargeFor = (st: DroneStats, dist: number) => 2 * hoursOut(st, dist) * st.drain

export const droneOn = (s: State, pad: Item) => s.items.find(o => o.in?.host === pad.id && statsOf(o.kind))
export const flightOf = (s: State, jobId: number) => s.flights?.find(f => f.job === jobId)
export const flightsFrom = (s: State, padId: number) => (s.flights ?? []).filter(f => f.pad === padId)

/** Is the drone on this pad ready to go? Its slip, job and cell if so, or why not. `read`: the drone reads its cell's charge (on launch); otherwise an unread cell is given the benefit of the doubt. */
export function check(s: State, padId: number, read = false): { drone: Item; slip: Item; job: NonNullable<ReturnType<typeof jobOf>>; cell: Item; need: number; hours: number } | string {
  const pad = find(s, padId)
  const drone = pad && droneOn(s, pad)
  if (!drone) return 'no drone on the pad'
  const st = statsOf(drone.kind)!
  const slips = inSlot(s.items, drone, 'cargo').filter(o => KINDS[o.kind].tags?.includes('paper'))
  if (!slips.length) return 'no slip in the cargo: a drone flies a job'
  if (slips.length > 1) return 'one slip per trip'
  const job = jobOf(s, slips[0])
  if (!job?.terms) return 'the slip is blank'
  if (job.state !== 'accepted') return `the job in the cargo is ${job.state === 'delivered' ? 'done' : job.state}: take the slip out`
  const cell = inSlot(s.items, drone, 'cell')[0]
  if (!cell) return 'no cell in the drone'
  const unread = !!cell.hidden?.includes('charge')
  if (unread && read) { cell.hidden = cell.hidden!.filter(h => h !== 'charge'); if (!cell.hidden.length) delete cell.hidden }
  const need = chargeFor(st, job.terms.dist), hours = hoursOut(st, job.terms.dist)
  if ((read || !unread) && propOf(cell, 'charge') < need) return `not enough charge: ${job.terms.to} and back needs ${need}, the cell has ${propOf(cell, 'charge')}`
  return { drone, slip: slips[0], job, cell, need, hours }
}

/** Send the drone on this pad: it takes the charge for the whole trip from its cell, and it and its insides leave the board. */
export function launch(s: State, padId: number): Flight | string {
  const ok = check(s, padId, true)
  if (typeof ok === 'string') return ok
  ok.cell.p = { ...ok.cell.p, charge: propOf(ok.cell, 'charge') - ok.need }
  const ids = new Set([ok.drone.id, ...contents(s, ok.drone.id).map(o => o.id)])
  const items = [ok.drone, ...s.items.filter(o => ids.has(o.id) && o !== ok.drone)]
  s.items = s.items.filter(o => !ids.has(o.id))
  if (s.panels) s.panels = s.panels.map(p => (p !== null && ids.has(p) ? null : p))
  const t = s.tick ?? 0
  const f: Flight = { items, pad: padId, job: ok.job.id, out: t, arrives: t + ok.hours, back: t + 2 * ok.hours }
  ;(s.flights ??= []).push(f)
  return f
}

/**
 * At the place: on time and everything there, the goods are handed over and the job is paid; late, the job has failed;
 * something missing, it is refused and the job stays open (it can go again before the deadline). Whatever is not handed
 * over (the slip, spare goods, refused goods) comes back. Each arrival writes a flight log.
 */
function deliver(s: State, f: Flight) {
  f.done = true
  const m = mailById(s, f.job)
  const t = m?.terms
  if (!m || !t) return
  const drone = f.items[0]
  const cargo = inSlot(f.items, drone, 'cargo').filter(o => o.job !== m.id)
  const used = new Set<number>()
  const short: string[] = []
  for (const w of t.want) {
    let have = 0
    for (const o of cargo) if (have < w.n && !used.has(o.id) && matches(o, w)) { used.add(o.id); have++ }
    if (have < w.n) short.push(`${w.n - have} of ${w.n} ${w.short}`)
  }
  const name = KINDS[drone.kind].name
  const log = (subject: string, body: string) => post(s, { type: 'log', from: name, at: f.arrives, subject, body })
  if (f.arrives > t.due) {
    m.state = 'failed'
    m.note = 'late: refused'
    log(`Late at ${t.to}`, `Got to ${t.to} at ${when(f.arrives)}, after the deadline (${when(t.due)}). Refused. Everything is coming back, due ${when(f.back)}.`)
  } else if (short.length) {
    m.note = `refused: ${short.join(', ')} missing`
    log(`Refused at ${t.to}`, `Got to ${t.to} at ${when(f.arrives)}. Refused: ${short.join(', ')} missing. Everything is coming back, due ${when(f.back)}. The job stays open until ${when(t.due)}.`)
  } else {
    f.items = f.items.filter(o => !used.has(o.id))
    s.credits = (s.credits ?? 0) + t.pay
    m.state = 'delivered'
    m.note = `paid ${t.pay} cr`
    log(`Delivered to ${t.to}: ${t.pay} cr`, `Delivered ${t.want.map(w => `${w.n} × ${w.label}`).join(' and ')} to ${t.to} at ${when(f.arrives)}. Paid ${t.pay} cr. Back ${when(f.back)}.`)
  }
}

/** Back: into the pad's cradle if it is still there and free, otherwise on the first free squares of the board. False if there is no room yet. */
function land(s: State, f: Flight): boolean {
  const [drone, ...rest] = f.items
  const pad = find(s, f.pad)
  if (!(pad && place(s, drone, { host: pad.id, slot: 0 })) && !place(s, drone, null)) return false
  s.items.push(...rest)
  s.flights = s.flights!.filter(x => x !== f)
  return true
}

/** Bring the drones up to the clock: each delivers once it gets there and lands once it is back. Returns what happened, for the player. */
export function fly(s: State): string[] {
  const now = s.tick ?? 0
  const said: string[] = []
  for (const f of s.flights ?? []) if (!f.done && now >= f.arrives) { deliver(s, f); const m = mailById(s, f.job); said.push(`${m?.terms?.to ?? 'the drone'}: ${m?.note ?? 'arrived'}`) }
  for (const f of [...(s.flights ?? [])]) if (f.done && now >= f.back && land(s, f)) said.push('a drone is back')
  return said
}

/** What a pad says: its drone is out (back when), or ready to go (where), or why it cannot go, or that it is empty. */
export function padStatus(s: State, pad: Item): string {
  const out = flightsFrom(s, pad.id).map(f => `drone out, back ${when(f.back, true)}`)
  if (!droneOn(s, pad)) return out[0] ?? 'empty'
  const ok = check(s, pad.id)
  return typeof ok === 'string' ? ok : `ready: ${ok.job.terms!.to}, ${ok.hours} h out, needs ${ok.need} charge${ok.cell.hidden?.includes('charge') ? ' (cell unread)' : ''}`
}
