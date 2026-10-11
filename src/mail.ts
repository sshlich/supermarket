// Mail: where work comes from. Messages arrive with the clock; accepting an offer prints its slip onto the board.
// Placeholder people, places, goods and prices (IDEAS.md, "Mail and drones: the first version"). Nothing is delivered yet:
// drones come next.

import { clock, everything, HOURS_A_DAY, matches, spawn, type Item, type Match, type State } from './world.ts'

export type MailType = 'offer' | 'bill' | 'notice' | 'log'
/** One line of what a job wants: `n` things that match (a kind, a tag, property tests, a liquid), and how it reads: in full, and short (one word, for a paper's top line). */
export interface Want extends Match { n: number; label: string; short: string }
/** A job's terms: what, where (a name, and how many hours away it is), by when (a tick), and the pay in credits. */
export interface Terms { want: Want[]; to: string; dist: number; due: number; pay: number }
/**
 * One message. `at` is the tick it arrived. An offer has `terms` and stays open until `expires`; a bill has an `amount`
 * due by `due`. A log is a drone's report. `state` moves from new to read when it is opened; an offer is accepted,
 * declined or expired, and an accepted one ends delivered or failed (`note` says how the last try went). `archived` moves
 * it out of the inbox.
 */
export interface Mail {
  id: number
  type: MailType
  from: string
  subject: string
  body: string
  at: number
  expires?: number
  terms?: Terms
  amount?: number
  due?: number
  state: 'new' | 'read' | 'accepted' | 'declined' | 'expired' | 'delivered' | 'failed'
  note?: string
  archived?: boolean
}

/** A tick as the clock reads it: "day 2 · 14:00", or short: "d2 14:00". */
export const when = (tick: number, short = false) => { const c = clock(tick), h = `${String(c.hour).padStart(2, '0')}:00`; return short ? `d${c.day} ${h}` : `day ${c.day} · ${h}` }
/** How long until a tick, from now: "5 h", or null once it has passed. */
export const left = (s: State, tick: number) => { const n = tick - (s.tick ?? 0); return n > 0 ? `${n} h` : null }

// ---------------------------------------------------------------- the tables

/** What people ask for: how to recognise it, how it reads, and what one is worth (credits, placeholder). */
const GOODS: Record<string, { match: Match; label: string; short: string; value: number; most: number }> = {
  cell: { match: { kind: 'cell', where: { charge: '>=80' } }, label: 'charged cell (80+)', short: 'cell', value: 3, most: 4 },
  coal: { match: { kind: 'coal' }, label: 'coal', short: 'coal', value: 2, most: 3 },
  log: { match: { kind: 'log' }, label: 'log', short: 'log', value: 2, most: 2 },
  kindling: { match: { kind: 'kindling' }, label: 'kindling', short: 'kindling', value: 1, most: 2 },
  water: { match: { kind: 'bottle', liquid: 'water', ml: '>=750' }, label: 'bottle of water (full)', short: 'water', value: 4, most: 2 },
  spirit: { match: { kind: 'bottle', liquid: 'spirit', ml: '>=250' }, label: 'bottle of spirit (250 ml+)', short: 'spirit', value: 12, most: 1 },
  candle: { match: { kind: 'candle' }, label: 'candle', short: 'candle', value: 2, most: 4 },
  rope: { match: { kind: 'rope' }, label: 'rope', short: 'rope', value: 3, most: 1 },
  lantern: { match: { kind: 'lantern' }, label: 'lantern', short: 'lantern', value: 6, most: 1 },
  matches: { match: { kind: 'matchbox' }, label: 'matchbox', short: 'matchbox', value: 1, most: 3 },
}

/** Who writes: a name, where they are and how many hours away, and what they tend to want. */
const SENDERS: { name: string; place: string; dist: number; wants: string[] }[] = [
  { name: 'Ada Marsh', place: 'the Pump House', dist: 1, wants: ['cell', 'coal'] },
  { name: 'Tomas Reyes', place: 'North Market', dist: 2, wants: ['candle', 'water', 'rope'] },
  { name: 'Depot stores', place: 'the Rail Depot', dist: 3, wants: ['coal', 'log', 'cell'] },
  { name: 'Dr Imre Vass', place: 'the Clinic', dist: 2, wants: ['spirit', 'water', 'candle'] },
  { name: 'Nell Okafor', place: 'the Ferry Landing', dist: 5, wants: ['rope', 'lantern', 'cell'] },
  { name: 'Holt Farm', place: 'Holt Farm', dist: 6, wants: ['matches', 'cell', 'lantern'] },
  { name: 'Pell\'s Bakery', place: 'Pell\'s Bakery', dist: 1, wants: ['log', 'kindling', 'coal'] },
  { name: 'Mira Sato', place: 'the Old School', dist: 4, wants: ['candle', 'cell', 'matches'] },
]

const NOTICES: { from: string; subject: string; body: string }[] = [
  { from: 'North Market', subject: 'Tap closed tomorrow morning', body: 'The North Market tap is off tomorrow until noon for repairs. Fill up today.' },
  { from: 'Depot stores', subject: 'Coal wanted all week', body: 'The Rail Depot is short of coal. Offers from the depot this week pay a little better.' },
  { from: 'Nell Okafor', subject: 'Lost: a brown knapsack', body: 'Left near the Ferry Landing on the evening boat. Two straps, one mended. A reward if it comes back.' },
  { from: 'Mira Sato', subject: 'Cells are short', body: 'Nobody has charged cells to spare this week. If you have a rack running, people will write.' },
]

const RENT = 125 // a week, rising 2% a month, rounded up (decided 2026-10-10)
const WEEK = 7 // days
const MONTH = 28 // days

// ---------------------------------------------------------------- arrival

type Roll = () => number
const pick = <T>(list: T[], roll: Roll) => list[Math.floor(roll() * list.length) % list.length]
const between = (lo: number, hi: number, roll: Roll) => lo + Math.floor(roll() * (hi - lo + 1))

export function post(s: State, m: Omit<Mail, 'id' | 'state'>): Mail {
  const mail: Mail = { id: s.mailNext ?? 1, state: 'new', ...m }
  s.mailNext = mail.id + 1
  ;(s.mail ??= []).push(mail)
  return mail
}

/** A job from one of the senders: one or two lines of what they want, a deadline, the pay, and how long it stays open. */
export function offer(s: State, t: number, roll: Roll = Math.random): Mail {
  const who = pick(SENDERS, roll)
  const ids = [pick(who.wants, roll)]
  if (roll() < 0.3) { const more = who.wants.filter(g => !ids.includes(g)); if (more.length) ids.push(pick(more, roll)) }
  const want: Want[] = ids.map(g => ({ ...GOODS[g].match, n: between(1, GOODS[g].most, roll), label: GOODS[g].label, short: GOODS[g].short }))
  const worth = ids.reduce((sum, g, i) => sum + GOODS[g].value * want[i].n, 0)
  const pay = Math.round(worth * (1.2 + roll() * 0.3) + who.dist * 2)
  const due = t + who.dist * 2 + between(4, 16, roll)
  const list = want.map(w => `${w.n} × ${w.label}`).join(' and ')
  const lines = [
    `Need ${list} at ${who.place} by ${when(due)}. ${pay} cr on delivery.`,
    `Could you bring ${list} to ${who.place}? It has to be here by ${when(due)}. I pay ${pay} cr when it arrives.`,
    `Looking for ${list}, delivered to ${who.place} (${who.dist} h out) before ${when(due)}. Paying ${pay} cr.`,
  ]
  return post(s, {
    type: 'offer', from: who.name, at: t, expires: t + between(3, 10, roll),
    subject: want.map(w => `${w.n} × ${w.label}`).join(', '),
    body: who.name === who.place ? pick(lines, roll) : `${pick(lines, roll)}\n\n${who.name}`, // people sign their mail
    terms: { want, to: who.place, dist: who.dist, due, pay },
  })
}

/** The rent bill for the week that starts on `day`: fixed, and up 2% each month. */
function rent(s: State, t: number, day: number) {
  const month = Math.floor((day - 1) / MONTH)
  const amount = Math.ceil(RENT * 1.02 ** month)
  const week = Math.floor((day - 1) / WEEK) + 1
  const due = (day - 1 + WEEK - 1) * HOURS_A_DAY + HOURS_A_DAY - 1 // the week's last hour
  post(s, { type: 'bill', from: 'Rent office', at: t, amount, due, subject: `Rent, week ${week}: ${amount} cr`, body: `Rent for your bay, week ${week}: ${amount} cr, due by ${when(due)}.\n\nRent goes up 2% at the start of every month.` })
}

/**
 * One hour of mail: open offers past their time expire, and accepted jobs past their deadline fail (unless a drone is on
 * its way with them: the drone finds out when it gets there). Each morning brings a batch (and the rent bill once a week);
 * some come during the day.
 */
function hour(s: State, t: number, roll: Roll, first: boolean) {
  for (const m of s.mail ?? []) {
    if (m.type === 'offer' && (m.state === 'new' || m.state === 'read') && m.expires !== undefined && m.expires <= t) m.state = 'expired'
    if (m.state === 'accepted' && m.terms && m.terms.due < t && !s.flights?.some(f => f.job === m.id && !f.done)) { m.state = 'failed'; m.note = 'not delivered in time' }
  }
  const { day } = clock(t)
  const morning = t % HOURS_A_DAY === 0
  if (first) post(s, { type: 'notice', from: 'Terminal', at: t, subject: 'How mail works', body: 'Offers come in every morning, and a few during the day. Each stays open for some hours.\n\nAccept one and its slip prints onto a free square of your board. Double-click the slip to read it; pin it to keep it in view while you work, fold it to keep just its top line.\n\nPack the goods with the slip. Drones come next: until then nothing is delivered and nothing is paid.' })
  if (morning || first) {
    if ((day - 1) % WEEK === 0) rent(s, t, day)
    for (let i = between(2, 4, roll); i > 0; i--) offer(s, t, roll)
    if (!first && roll() < 0.35) post(s, { type: 'notice', at: t, ...pick(NOTICES, roll) })
  } else if (roll() < 0.2) offer(s, t, roll)
}

/** Bring the mail up to the clock: every hour since it was last brought up, in order. A game that never had mail starts now. */
export function catchUp(s: State, roll: Roll = Math.random) {
  const now = s.tick ?? 0
  if (s.mailAt === undefined) { hour(s, now, roll, true); s.mailAt = now; return }
  for (let t = s.mailAt + 1; t <= now; t++) hour(s, t, roll, false)
  s.mailAt = Math.max(s.mailAt, now)
}

// ---------------------------------------------------------------- reading and answering

export const mailById = (s: State, id: number) => s.mail?.find(m => m.id === id)
export const isOpen = (m: Mail) => m.type === 'offer' && (m.state === 'new' || m.state === 'read')
export function markRead(s: State, id: number) { const m = mailById(s, id); if (m?.state === 'new') m.state = 'read' }

/** Take the job: its slip prints onto the first free squares of the board. Returns the slip, or why not. */
export function accept(s: State, id: number): Item | string {
  const m = mailById(s, id)
  if (!m || m.type !== 'offer' || !m.terms) return 'that is not an offer'
  if (!isOpen(m)) return `this offer is ${m.state}`
  const slip = spawn(s, 'slip')
  if (!slip) return 'no free squares on the board for the slip'
  slip.job = m.id
  m.state = 'accepted'
  return slip
}
export function decline(s: State, id: number) { const m = mailById(s, id); if (m && isOpen(m)) m.state = 'declined' }
/** Out of the inbox. An open offer cannot be archived: answer it first. */
export function archive(s: State, id: number) { const m = mailById(s, id); if (m && !isOpen(m) && m.state !== 'accepted') m.archived = true }

/** The offer a slip was printed for. */
export const jobOf = (s: State, it: Item) => it.job === undefined ? undefined : mailById(s, it.job)
/** The slip printed for an offer, if it is still about (on the board, or out in a drone). */
export const slipFor = (s: State, mailId: number) => everything(s).find(o => o.job === mailId)

/**
 * How much of a job is packed with its slip: the things in the same container slot as the slip that match each line (a
 * thing counts once, toward the first line it fits). A slip lying on the board is not packed.
 */
export function packed(s: State, slip: Item): { packed: boolean; lines: { want: Want; have: number }[] } | null {
  const terms = jobOf(s, slip)?.terms
  if (!terms) return null
  const beside = slip.in ? everything(s).filter(o => o.id !== slip.id && o.in?.host === slip.in!.host && o.in.slot === slip.in!.slot) : []
  const used = new Set<number>()
  const lines = terms.want.map(want => {
    let have = 0
    for (const o of beside) if (have < want.n && !used.has(o.id) && matches(o, want)) { used.add(o.id); have++ }
    return { want, have }
  })
  return { packed: !!slip.in, lines }
}

/** Everything anywhere that would do for a job (for lighting it up). */
export const wanted = (s: State, m: Mail) => s.items.filter(o => m.terms?.want.some(w => matches(o, w)))
