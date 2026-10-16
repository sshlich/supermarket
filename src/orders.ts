// The shop's business on the Wire. Buying: an order is paid when it is placed and comes later, by drone (in about a minute, for a fee) or by
// freight (the next morning, free). It lands on the outside counter, where things come in, or on the field, or on the
// inside counter, wherever there is room; what has no room yet waits and comes as soon as there is. Selling: orders come
// by mail every morning, and ship in sealed boxes from the dock at night, paid on delivery; and what you list on Swapline
// sells over time, at a price people take.

import { unpack, type Goods } from './customers.ts'
import { contents, inSpace, KINDS, leftOf, look, remove, sealed, worth, type Item, type Mail, type Order, type Space, type State } from './world.ts'

/** A drone takes 45 seconds and costs 3$; freight is free and comes the next morning. */
export const DRONE_MS = 45_000, DRONE_FEE = 3
/** Where a delivery is put down, in order of trying. */
const DROPS: Space[] = [{ at: 'outside' }, null, { at: 'inside' }]

/** What a thing as it would be made is worth (made for the sake of it, in a place of its own, and thrown away). */
export function worthOf(g: Goods): number {
  const t: State = { items: [], next: 1 }
  const it = unpack(t, g, null, () => 0.5)
  return it ? worth(t, it) : 0
}

/** Order these goods: on its way from now, with a number. */
export function placeOrder(s: State, goods: Goods[], by: Order['by'], from: string, now = Date.now()): Order {
  const web = s.web ??= {}
  web.seq = (web.seq ?? 1040) + 1
  const o: Order = { id: web.seq, goods, by, at: by === 'drone' ? now + DRONE_MS : (s.day ?? 1) + 1, from }
  ;(s.orders ??= []).push(o)
  return o
}
/** Is it here: a drone whose time has come, freight on its morning. */
const due = (s: State, o: Order, now: number) => o.by === 'drone' ? now >= o.at : (s.day ?? 1) >= o.at

/** Put down whatever has come: each order's goods where there is room. What came, by order; what found no room stays on its way. */
export function deliver(s: State, now = Date.now()): { order: Order; items: Item[] }[] {
  const out: { order: Order; items: Item[] }[] = []
  for (const o of s.orders ?? []) {
    if (!due(s, o, now)) continue
    const items: Item[] = [], left: Goods[] = []
    for (const g of o.goods) {
      const it = DROPS.reduce<Item | null>((got, sp) => got ?? unpack(s, g, sp), null)
      if (it) items.push(it); else left.push(g)
    }
    o.goods = left
    if (items.length) out.push({ order: o, items })
  }
  s.orders = (s.orders ?? []).filter(o => o.goods.length)
  if (!s.orders.length) delete s.orders
  return out
}

// ---------------------------------------------------------------- mail: orders from the station

/** Who writes, from where, what they tend to want, how well they pay (over worth), how long they give, and how they put it. */
const SENDERS: { who: string; deck: string; wants: string[]; mult: [number, number]; due: [number, number]; most: number; lines: string[] }[] = [
  { who: 'bunk tenant', deck: 'the Spine', wants: ['bread', 'apple', 'bandage', 'antiseptic', 'breadslice', 'bottle'], mult: [1.0, 1.15], due: [3, 5], most: 3, lines: ['Four of us share a bunk and a bread bag. Pay on delivery, not before.', 'Whatever you can spare. We count it by the cup up here.', 'Same as last time, if there was a last time.'] },
  { who: 'clinic orderly', deck: 'the mid decks', wants: ['bandage', 'antiseptic', 'pill'], mult: [1.15, 1.3], due: [2, 4], most: 3, lines: ['For the clinic on spine 6. The ledger never balances, but it pays.', 'We are out again. Please hurry, people are waiting.'] },
  { who: 'foundry fitter', deck: 'the Works', wants: ['knife', 'ingot', 'bandage', 'coal', 'bread'], mult: [1.1, 1.25], due: [3, 5], most: 2, lines: ['Hard on tools, harder on hands. Send it to the Works gate.', 'The mill eats everything. Send what you have.'] },
  { who: 'smelter hand', deck: 'the Works', wants: ['ore', 'coal', 'wine'], mult: [1.05, 1.2], due: [3, 5], most: 2, lines: ['For after the shift. You know the sort.', 'Bars do not make themselves.'] },
  { who: 'station technician', deck: 'the mid decks', wants: ['disc', 'knife', 'lighter', 'paper'], mult: [1.1, 1.3], due: [3, 6], most: 2, lines: ['For the workshop on mid 3. Discs any colour.', 'Something always breaks. Something else needs fixing.'] },
  { who: 'company clerk', deck: 'the Hub', wants: ['paper', 'book', 'locket'], mult: [1.2, 1.4], due: [2, 4], most: 2, lines: ['In triplicate, please. Invoice the Hub.', 'For the office. Licensed, stamped, on time.'] },
  { who: 'ring household', deck: 'the Ring', wants: ['cheesewedge', 'salami', 'wine', 'apple', 'cheesewheel'], mult: [1.4, 1.7], due: [2, 3], most: 1, lines: ['For a dinner. We pay well, and we pay for speed.', 'Real food, please. The children have never had a whole apple.'] },
  { who: 'collector', deck: 'the Ring', wants: ['book', 'locket', 'zippo', 'lighter'], mult: [1.8, 2.2], due: [3, 6], most: 1, lines: ['Old things only. I pay double for a story.', 'I hear you have things nobody else has. Prove it.'] },
]
const NAMES = ['Wren', 'Odell', 'Ines', 'Hollis', 'Bea', 'Corvin', 'Dot', 'Ansel', 'Yuki', 'Marek', 'Saoirse', 'Tam', 'Lio', 'Pell', 'Mara', 'Ruth']
const SPAM: [string, string][] = [
  ['YOU HAVE WON A CELL!!!', 'Congratulations, shopkeeper! You have been selected to receive one (1) free power cell. Reply with your account number to claim. Offer ends today. Offer ends every day.'],
  ['Grow your hydro 300%', 'Tired of small tomatoes? Our lamp spectrum key unlocks the colours the Company keeps back. Only 40$. Do not tell the Company.'],
  ['Cheap licences, no questions', 'Any program, any machine. The licence check is a suggestion. Ask for the Fence at the dock, after the shift.'],
  ['Re: your account', 'Dear valued customer, your Company Credit account has been suspended. To restore it, reply with your password. Company Credit (not really).'],
]
const WELCOME = 'Your stall now has an account on the Wire. People on the station send their orders here.\n\nTo fill one: accept it, print its slip (you need a printer, plugged into this terminal, with paper), and pack the goods and the slip in a box. Tape the box shut with a tape gun and put it in your dock. The carrier comes at night; you are paid when it arrives, less the carrier\'s fee. Late, it pays less.\n\nBoxes, a tape gun, a printer and paper are at the Company Store (store.company).\n\nThe Company'

const mailSeq = (s: State) => { const web = s.web ??= {}; return web.seq = (web.seq ?? 1040) + 1 }
/** A number from a seed, the same each time (a day's mail is what it is). */
function seeded(seed: number) { let x = (seed * 2654435761) >>> 0 || 1; return () => { x = (x ^ (x << 13)) >>> 0; x = (x ^ (x >>> 17)) >>> 0; x = (x ^ (x << 5)) >>> 0; return x / 4294967296 } }
const pick = <T,>(xs: T[], r: () => number) => xs[Math.floor(r() * xs.length)]

/** One order, as someone on the station would write it. */
export function orderFor(s: State, r: () => number): Mail {
  const from = pick(SENDERS, r), day = s.day ?? 1
  const kinds = [...new Set(Array.from({ length: 1 + Math.floor(r() * 2) }, () => pick(from.wants, r)))].filter(k => KINDS[k])
  const wants = kinds.map(kind => ({ kind, n: 1 + Math.floor(r() * from.most) }))
  const mult = from.mult[0] + r() * (from.mult[1] - from.mult[0])
  const pay = Math.max(2, Math.round(wants.reduce((n, w) => n + worthOf({ kind: w.kind }) * w.n, 0) * mult))
  const due = day + from.due[0] + Math.floor(r() * (from.due[1] - from.due[0] + 1))
  const list = wants.map(w => `${w.n} × ${KINDS[w.kind].name.toLowerCase()}`).join(', ')
  return { id: mailSeq(s), day, from: `${pick(NAMES, r)}, ${from.who} (${from.deck})`, subject: `Order: ${list}`, text: pick(from.lines, r), kind: 'order', job: { wants, pay, due, state: 'open' } }
}

/**
 * The morning's mail: orders nobody took that are past their day lapse, and so do taken ones three days past it; two or
 * three new orders come, now and then some spam; the first morning brings the Company's welcome. The new messages.
 */
export function morning(s: State): Mail[] {
  const day = s.day ?? 1, r = seeded(day * 7907 + 3)
  const mail = s.mail ??= []
  for (const m of mail) if (m.job && ((m.job.state === 'open' && day > m.job.due) || (m.job.state === 'taken' && day > m.job.due + 3))) m.job.state = 'lapsed'
  const got: Mail[] = []
  if (!mail.length) got.push({ id: mailSeq(s), day, from: 'The Company (Wire accounts)', subject: 'Welcome to the Wire', text: WELCOME, kind: 'note' })
  for (let i = 0, n = 2 + (r() < 0.4 ? 1 : 0); i < n; i++) got.push(orderFor(s, r))
  if (r() < 0.35) { const [subject, text] = pick(SPAM, r); got.push({ id: mailSeq(s), day, from: pick(['prizes@wire', 'hydro.deals', 'a friend at the dock', 'Company Credit Security'], r), subject, text, kind: 'spam' }) }
  mail.push(...got)
  s.mail = mail.slice(-120)
  return got
}

// ---------------------------------------------------------------- shipping: the dock, the night's pickup

/** How many whole things of a kind you have on your floor, free to pack. */
export const stockOf = (s: State, kind: string) => s.items.filter(o => o.kind === kind && whole(o) && forSale(s, o)).length
/** Is a thing whole, as an order means it: something cut still uncut, a vessel full. */
const whole = (it: Item) => { const k = KINDS[it.kind]; return (!k.cut || leftOf(it) >= k.cut.count) && (!k.holds || (it.fill?.amount ?? 0) >= k.holds) }
const inside = (s: State, id: number): Item[] => contents(s, id).flatMap(o => [o, ...inside(s, o.id)])
/** What a box would bring if it shipped tonight: its order, how much of what is wanted is in it, what it pays on delivery less the fee. Null with no slip in it. */
export function quote(s: State, box: Item) {
  const things = inside(s, box.id)
  const slip = things.find(o => o.kind === 'slip' && o.print?.job !== undefined)
  const m = slip && s.mail?.find(x => x.id === slip.print!.job)
  if (!m?.job) return null
  const wanted = m.job.wants.reduce((n, w) => n + w.n, 0)
  const have = m.job.wants.reduce((n, w) => n + Math.min(w.n, things.filter(o => o.kind === w.kind && whole(o)).length), 0)
  const late = (s.day ?? 1) + 1 > m.job.due
  const pay = Math.round(m.job.pay * have / wanted * (late ? LATE : 1))
  const fee = KINDS[box.kind].fee ?? 0
  return { mail: m, have, wanted, late, pay, fee, ships: sealed(box) && (m.job.state === 'taken' || m.job.state === 'open') }
}
/** A late box pays four fifths. */
export const LATE = 0.8
/**
 * The night's pickup: every sealed box in the dock with its slip goes, and is paid on delivery in the morning (what it held
 * of the order, less if late, less the carrier's fee). What shipped, and the money.
 */
export function ship(s: State): { boxes: number; net: number } {
  let boxes = 0, net = 0
  for (const box of inSpace(s, { at: 'dock' })) {
    const q = quote(s, box)
    if (!q?.ships) continue
    remove(s, [box.id])
    q.mail.job!.state = 'done'
    q.mail.job!.paid = q.pay - q.fee
    boxes++; net += q.pay - q.fee
    const short = q.have < q.wanted ? ` It held ${q.have} of the ${q.wanted} things wanted.` : ''
    ;(s.mail ??= []).push({ id: mailSeq(s), day: (s.day ?? 1) + 1, from: 'The carrier', subject: `Delivered: order #${q.mail.id}`, text: `Order #${q.mail.id} reached ${q.mail.from.split(',')[0]}${q.late ? ', late' : ''}.${short} Paid ${q.pay}$, less the fee of ${q.fee}$: ${q.pay - q.fee}$ to your account.`, kind: 'paid' })
  }
  return { boxes, net }
}

// ---------------------------------------------------------------- Swapline: what you list sells, in time, at a price people take

/** Swapline keeps a tenth of a sale (a dollar at least). */
export const SWAP_CUT = 0.1
/** How likely a listing is to sell in one look (every 20 seconds): likelier the cheaper it is against what it is worth. */
export const chance = (price: number, worth: number) => worth <= 0 ? 0 : Math.max(0.02, Math.min(0.6, 0.35 * (1.6 - price / worth)))
/** Where a thing is, at the root: listed things sell only from your own floor (not from a counter, the dock, the trash, or a box taped shut). */
export const forSale = (s: State, it: Item) => { let o = it; while (o.in) { const h = s.items.find(x => x.id === o.in!.host); if (!h || sealed(h)) return false; o = h } return !o.at }
/** Look at every listing once: those that sell are gone (with whatever is in them), and the money, less Swapline's cut, comes. */
export function swapSales(s: State, r: () => number = Math.random): { name: string; price: number; net: number; who: string }[] {
  const sold: { name: string; price: number; net: number; who: string }[] = []
  for (const it of s.items.filter(o => o.listed)) {
    if (!forSale(s, it) || r() >= chance(it.listed!, worth(s, it))) continue
    const price = it.listed!, net = price - Math.max(1, Math.round(price * SWAP_CUT)), name = look(it).name, who = pick(NAMES, r)
    remove(s, [it.id])
    sold.push({ name, price, net, who })
    ;(s.mail ??= []).push({ id: mailSeq(s), day: s.day ?? 1, from: 'Swapline', subject: `Sold: ${name}`, text: `${who} bought your ${name.toLowerCase()} for ${price}$. A courier has collected it. Swapline keeps its cut: ${net}$ to your account.`, kind: 'sale' })
  }
  return sold
}
