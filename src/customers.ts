// Customers at the counter: residents of the station (data/station/residents.json), each from a deck, with what they buy
// and what they sell; what they want (the station's needs), what they bring, and how a deal with them goes. Pure data and
// rules, no page; the terminal in main.ts draws it and moves the things.

import { contents, KINDS, LIQUIDS, look, remove, spawn, worth, type Fill, type Item, type Space, type State } from './world.ts'
import RESIDENTS from '../data/station/residents.json' with { type: 'json' }
import NEEDS from '../data/station/needs.json' with { type: 'json' }
import DECKS from '../data/station/decks.json' with { type: 'json' }

/**
 * What a customer can want: the station's needs (needs.json). A thing serves the need its kind names (`need`), and a customer
 * sees that need among its tags (see offerOf). Each has a word for the chip, its description, and how a customer says it.
 */
const SAYS: Record<string, string> = { need_air: 'something for the air', need_water: 'water', need_food: 'something to eat', need_power: 'power, a cell', need_medicine: 'medicine', need_parts: 'parts or tools', need_comfort: 'something for comfort', need_luxury: 'something fine' }
export const TAGS: Record<string, { label: string; desc: string; say: string }> = Object.fromEntries(NEEDS.map(n => [n.id, { label: n.name.toLowerCase(), desc: n.desc, say: SAYS[n.id] ?? n.name.toLowerCase() }]))

/**
 * Three sorts. A buyer wants things and pays for them; a seller brings things (unloaded on the outside counter) and asks a
 * price for the lot; a trader brings things and wants things, and swaps.
 */
export type Role = 'buyer' | 'seller' | 'trader'
/** One thing a customer brings, as it should be made: its kind, its properties, its liquid, and pills already gone from a blister. */
export interface Goods { kind: string; props?: Record<string, string>; fill?: Fill | null; missing?: number; left?: number; age?: number }
/**
 * `rate` is how they price: what a buyer pays (over what things are worth) or a seller asks (under it). `brought` are the
 * ids of what they unloaded, still theirs until a deal; `ask` is a seller's price for all of it. A buyer's `budget` is the
 * money they have left (null: they have enough for anything) and `got` the wants they have bought already: they stay at
 * the counter until sent away, and buy again while they have money. `dealt`: a seller or trader has made their one deal. `slack`: how
 * much short of their own goods' worth a trader will settle for (you cover the rest in cash). `here`: they have stepped up
 * to the counter (unloaded and said hello), so a reload does not do it twice, nor leave it undone. `who`: the resident they are.
 */
export interface Customer { id: number; name: string; who?: string; role: Role; wants: string[]; rate: number; goods: Goods[]; brought: number[]; ask: number; budget: number | null; got: string[]; dealt?: boolean; slack?: number; here?: boolean }

const NAMES = ['Mara', 'Odell', 'Pim', 'Ines', 'Tobias', 'Wren', 'Hollis', 'Bea', 'Corvin', 'Dot', 'Ansel', 'Yuki']
const pick = <T>(list: T[], rand: () => number) => list[Math.floor(rand() * list.length)]

/** Who comes in: buyers, sellers and traders in these shares (sellers as often as buyers, so stock keeps coming in). */
export const MIX: Record<Role, number> = { buyer: 0.4, seller: 0.4, trader: 0.2 }
/**
 * What a buyer pays over worth: drawn in this range, nearer the top the richer their deck. The top fifth of it are nobles,
 * and talk like it (and carry half again the money).
 */
export const MARKUP = [0.1, 0.4]
const NOBLE = 1 + MARKUP[0] + 0.8 * (MARKUP[1] - MARKUP[0])
export const noble = (c: Customer) => c.role === 'buyer' && c.rate >= NOBLE - 1e-9

/** The residents who come to a stall in phase 1 (the game has no phases yet), the one a customer is, and their deck. */
const CAST = RESIDENTS.filter(r => r.phase_from === 'phase_1')
export const residentOf = (c: Customer) => RESIDENTS.find(r => r.id === c.who)
export const deckOf = (c: Customer) => DECKS.find(d => d.id === residentOf(c)?.deck)
/** Could a customer bring it? Not a sandwich (made, not brought), a machine, a fitting, a blueprint or contraband. */
const bringable = (kind: string) => { const k = KINDS[kind]; return !!k?.price && !k.stack && k.cat !== 'machines' && !k.tags?.some(t => t === 'fixture' || t === 'contraband') && !kind.startsWith('disc_') }
const weighted = <T>(list: T[], w: (x: T) => number, rand: () => number) => { let r = rand() * list.reduce((n, x) => n + w(x), 0); return list.find(x => (r -= w(x)) <= 0) ?? list[list.length - 1] }

/**
 * A new customer: a role by the MIX, then a resident who comes as that (as often as they do). A buyer or trader wants one
 * or two needs, those of the things on their list (`buys`; the market's `weights` pull on top); a seller or trader brings
 * things from theirs (`sells`). Buyers count their money (their resident's range).
 */
export function arrive(id: number, rand: () => number = Math.random, weights?: Record<string, number>, lean?: (kind: string) => number): Customer {
  const r = rand()
  const role: Role = r < MIX.buyer ? 'buyer' : r < MIX.buyer + MIX.seller ? 'seller' : 'trader'
  const res = weighted(CAST.filter(x => x.roles[role] > 0 && (role === 'buyer' || x.sells.some(bringable))), x => x.roles[role], rand)
  const wants: string[] = []
  if (role !== 'seller') {
    const pool = [...new Set(res.buys.map(k => KINDS[k]?.need ?? '').filter(n => n in TAGS))]
    const w = (n: string) => res.buys.filter(k => KINDS[k]?.need === n).length * (weights?.[n] ?? 1)
    for (let n = 1 + Math.floor(rand() * 2); n > 0 && pool.length; n--) { const t = weighted(pool, w, rand); wants.push(t); pool.splice(pool.indexOf(t), 1) }
  }
  const goods = role === 'buyer' ? [] : Array.from({ length: 1 + Math.floor(rand() * 3) }, () => bring(rand, lean, res.sells))
  // ponytail: ECONOMY.md section 4. A buyer pays the markup over worth; a seller asks a range around a fifth under it
  const around = (mid: number, spread: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, mid + spread * (rand() + rand() + rand() - 1.5) * 2))
  const rich = rand() ** (2 / (DECKS.find(d => d.id === res.deck)?.wealth ?? 1)) // a rich deck draws nearer the top
  const rate = role === 'buyer' ? 1 + MARKUP[0] + rich * (MARKUP[1] - MARKUP[0]) : role === 'seller' ? around(0.8, 0.1, 0.6, 1) : 1
  const budget = role === 'buyer' ? Math.round((res.budget[0] + rand() * (res.budget[1] - res.budget[0])) * (rate >= NOBLE - 1e-9 ? 1.5 : 1)) : null
  return { id, name: pick(NAMES, rand), who: res.id, role, wants, rate, goods, brought: [], ask: 0, budget, got: [], ...(role === 'trader' ? { slack: 0.1 + rand() * 0.2 } : {}) }
}

/**
 * Something a seller or trader brings, from their list (`from`) or anything: cheaper kinds more often (a cabinet rarely),
 * any of its property values, a vessel part full of something, a blister with some pills already gone. What people bring
 * is never quite new.
 */
export function bring(rand: () => number = Math.random, lean: (kind: string) => number = () => 1, from?: string[]): Goods {
  const ids = (from ?? []).filter(bringable)
  const pool = (ids.length ? ids : Object.keys(KINDS).filter(bringable)).map(kind => [kind, KINDS[kind]] as const)
  const wt = ([n, k]: (typeof pool)[number]) => lean(n) / Math.sqrt(1 + k.price!)
  let r = rand() * pool.reduce((n, e) => n + wt(e), 0)
  const [kind, k] = pool.find(e => (r -= wt(e)) <= 0) ?? pool[0]
  const g: Goods = { kind }
  const props = Object.entries(k.props ?? {})
  // ponytail: a property that is a state, not what the thing is (a machine's power, a furnace's fire), is left at its default
  if (props.length) g.props = Object.fromEntries(props.filter(([p]) => p !== 'power' && p !== 'fire').map(([p, vals]) => [p, pick(Object.keys(vals), rand)]))
  if (k.holds) { const liquid = k.liquid ?? pick(Object.keys(LIQUIDS), rand); g.fill = { liquid, amount: 1 + Math.floor(rand() * k.holds) } }
  if (k.slots?.some(sl => sl.fill)) g.missing = Math.floor(rand() * 4)
  if (k.cut) g.left = 2 + Math.floor(rand() * (k.cut.count - 1)) // something already cut into, or whole
  return g
}

/** Make one thing a customer brings, in a place: its properties, its liquid, pills already gone, a cheese already cut into. Null if there is no room. */
export function unpack(s: State, g: Goods, space: Space, rand: () => number = Math.random): Item | null {
  const it = spawn(s, g.kind, space, g.props ?? {})
  if (!it) return null
  if (g.fill !== undefined) { if (g.fill) it.fill = { ...g.fill }; else delete it.fill }
  if (g.missing) remove(s, contents(s, it.id).map(o => ({ o, r: rand() })).sort((a, b) => a.r - b.r).slice(0, g.missing).map(({ o }) => o.id))
  if (g.left !== undefined && g.left < (KINDS[g.kind].cut?.count ?? 0)) it.left = g.left
  if (g.age) it.age = g.age
  return it
}

const list = (words: string[]) => words.length > 1 ? `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}` : words[0]
const wanted = (c: Customer) => list(c.wants.map(t => TAGS[t]?.say ?? t))

/** How a buyer talks: plainly, or (a noble) with manners. */
const cap = (t: string) => t[0].toUpperCase() + t.slice(1)
const TALK = {
  plain: {
    hello: (c: Customer, line: string) => `${line} I'm after ${wanted(c)}. I've got ${c.budget}$.`,
    paid: (p: number) => `Here's ${p}$.`, done: (p: number) => `That's what I came for. Here's ${p}$.`, more: (p: number, m: string) => `Here's ${p}$. I still need ${m}.`,
    afford: (p: number) => `That's all I can pay for. Here's ${p}$.`, short: (p: number, b: number) => `That's ${p}$. I've only got ${b}$.`,
    none: 'None of this is what I came for.', empty: 'The counter is empty. Is this a joke?', broke: "I'm out of money.",
  },
  noble: {
    hello: (c: Customer) => [`Good day to you. I find myself in want of ${wanted(c)}, and I am told yours is a decent counter. I have ${c.budget}$ about me.`,
      `Ah, what a quaint little stall. ${cap(wanted(c))}, if you would be so kind; nothing shabby. I carry ${c.budget}$.`,
      `My steward is indisposed, so I am obliged to shop myself. ${cap(wanted(c))}, please. ${c.budget}$ ought to cover it, I trust.`][c.id % 3],
    paid: (p: number) => `Splendid. ${p}$, with my compliments to the house.`, done: (p: number) => `Precisely what I came for. ${p}$, and my thanks.`,
    more: (p: number, m: string) => `${p}$. Do keep looking: I should still like ${m}.`, afford: (p: number) => `I shall take what my purse allows today: ${p}$.`,
    short: (p: number, b: number) => `Goodness, ${p}$? I carry only ${b}$ about my person.`,
    none: 'I am afraid none of this is quite what I had in mind.', empty: 'Is the counter meant to be bare? How droll.', broke: 'I have indulged quite enough for one day, thank you.',
  },
}
const talkOf = (c: Customer) => noble(c) ? TALK.noble : TALK.plain

/** Their first words: a line of their own (their resident's), then a seller's price for the lot, or what they came for. A noble greets you properly. */
export function greeting(c: Customer): string {
  const lines = residentOf(c)?.lines ?? [], line = lines.length ? lines[c.id % lines.length] : 'Hello.'
  if (c.role === 'seller') return c.brought.length ? `${line} ${c.ask}$ for the lot.` : 'No room on your counter for my things.'
  if (c.role === 'trader') return c.brought.length ? `${line} I'll swap these for ${wanted(c)}.` : 'No room on your counter for my things.'
  return talkOf(c).hello(c, line)
}
/** What a buyer has not bought yet. */
export const stillWants = (c: Customer) => c.wants.filter(w => !c.got.includes(w))
/** Can this customer still deal? A buyer while they have money; a seller or trader until their one deal. */
export const open = (c: Customer) => c.role === 'buyer' ? (c.budget ?? 1) >= 1 : !c.dealt && c.brought.length > 0
/** What a buyer would pay for these, at their rate. */
export const priceFor = (c: Customer, worth: number) => Math.max(1, Math.round(worth * c.rate))

/**
 * A thing on the inside counter, as a customer sees it: its tags and what it is worth. A package (a container that comes
 * full: a blister, a bag of bread, a matchbox) is one thing, its tags and worth those of all it holds. Any other container
 * is itself (`worth` without what is in it) plus its `parts`, each seen on its own: a cabinet holding an apple sells the
 * apple to someone who wants food, not the cabinet. Its tags include the need it serves (what customers want).
 */
export interface Offer { id: number; kind?: string; tags: string[]; worth: number; parts?: Offer[] }
/** Is it a package: a container that comes full, sold with what is in it? */
export const isPackage = (kind: string) => !!KINDS[kind]?.slots?.some(sl => sl.fill)
const tagsOf = (it: Item) => [...look(it).tags, ...KINDS[it.kind]?.need ? [KINDS[it.kind].need!] : []]
const tagsIn = (s: State, it: Item): string[] => [...tagsOf(it), ...contents(s, it.id).flatMap(o => tagsIn(s, o))]
/** How a customer sees a thing (see Offer). */
export function offerOf(s: State, it: Item): Offer {
  if (isPackage(it.kind)) return { id: it.id, kind: it.kind, tags: [...new Set(tagsIn(s, it))], worth: worth(s, it) }
  const kids = contents(s, it.id)
  const own = { id: it.id, kind: it.kind, tags: tagsOf(it), worth: worth(s, it) - kids.reduce((n, o) => n + worth(s, o), 0) }
  return kids.length ? { ...own, parts: kids.map(o => offerOf(s, o)) } : own
}
/** What of these a customer who wants `wants` would take: each thing with a wanted tag, and, inside any container, whatever they want of what it holds. */
export const picked = (offers: Offer[], wants: string[], avoid: (o: Offer) => boolean = () => false): Offer[] => offers.flatMap(o => [...(o.tags.some(t => wants.includes(t)) && !avoid(o) ? [o] : []), ...picked(o.parts ?? [], wants, avoid)])
/** What this customer would take of these: what serves what they want, less what their sort avoids (unless it is on their own list). */
export const takes = (c: Customer, offers: Offer[]): Offer[] => {
  const r = residentOf(c)
  return picked(offers, c.wants, o => !!r && !r.buys.includes(o.kind ?? '') && o.tags.some(t => r.avoids_tags.includes(t)))
}

/**
 * Press the deal button. What is on the inside counter (`offered`), the cash you have, and what the customer's own goods
 * are worth (`theirs`) decide it: `done` if it goes through, `take` what they take off the inside counter, `pay` what
 * changes hands (positive to you), `met` which wants it covers, `say` their answer. A buyer takes what serves a need they
 * want and pays over its worth while their money lasts (short of it, what they can pay for); a seller wants their price; a trader takes what they want if it
 * is worth most of what they brought, and the difference is paid in cash. Nobody leaves: they stay until sent away.
 */
export function deal(c: Customer, offered: Offer[], cash: number, theirs: number): { done: boolean; take: number[]; pay: number; met: string[]; say: string } {
  const wants = c.wants, talk = talkOf(c)
  let take = takes(c, offered)
  let met = wants.filter(w => take.some(o => o.tags.includes(w)))
  const no = (say: string) => ({ done: false, take: [], pay: 0, met, say })
  const value = take.reduce((n, o) => n + o.worth, 0)
  if (c.role === 'seller') {
    if (c.dealt) return no("That's all I had.")
    if (!c.brought.length) return no('No room on your counter for my things.')
    if (cash < c.ask) return no(`You can't afford it. ${c.ask}$, not a coin less.`)
    return { done: true, take: [], pay: -c.ask, met, say: 'Pleasure doing business.' }
  }
  if (c.role === 'trader' && c.dealt) return no("We're square.")
  if (c.role === 'trader' && !c.brought.length) return no('No room on your counter for my things.')
  if (c.role === 'buyer' && !open(c)) return no(talk.broke)
  if (!offered.length) return no(c.role === 'buyer' ? talk.empty : 'The counter is empty. Is this a joke?')
  if (!take.length) return no(c.role === 'buyer' ? talk.none : 'None of this is what I came for.')
  const missing = (c.role === 'buyer' ? stillWants(c) : wants).filter(w => !met.includes(w)).map(t => TAGS[t]?.say ?? t)
  if (c.role === 'trader') {
    // at worth, with some slack; the difference is settled in cash either way (positive: they pay you), so a near miss is never a dead end
    const short = Math.ceil(theirs * (1 - (c.slack ?? 0.2)) - value)
    if (short > 0) return no(`That's not worth what I brought. Add about ${short}$ more.${missing.length ? ` And I still want ${list(missing)}.` : ''}`)
    const pay = Math.round(value - theirs)
    if (pay < 0 && cash < -pay) return no(`Close, but you'd owe me ${-pay}$ and you haven't got it.`)
    return { done: true, take: take.map(o => o.id), pay, met, say: pay > 0 ? `Fair trade, and ${pay}$ for the difference.` : pay < 0 ? `Close enough. You owe me ${-pay}$.` : 'Fair trade.' }
  }
  // a buyer short of money for all of it takes what they can pay for, the dearest first
  const budget = c.budget ?? Infinity, all = priceFor(c, value)
  if (all > budget) {
    const fit: Offer[] = []
    for (const o of [...take].sort((a, b) => b.worth - a.worth)) if (priceFor(c, fit.reduce((n, f) => n + f.worth, 0) + o.worth) <= budget) fit.push(o)
    if (!fit.length) return no(talk.short(all, budget))
    take = fit
    met = wants.filter(w => take.some(o => o.tags.includes(w)))
  }
  const pay = priceFor(c, take.reduce((n, o) => n + o.worth, 0))
  const left = stillWants(c).filter(w => !met.includes(w))
  const say = all > budget ? talk.afford(pay) : left.length ? talk.more(pay, list(left.map(t => TAGS[t]?.say ?? t))) : stillWants(c).length ? talk.done(pay) : talk.paid(pay)
  return { done: true, take: take.map(o => o.id), pay, met, say }
}
/** After a deal went through: a buyer has those wants lit and less money (and buys on while it lasts); a seller or trader is done. */
export function dealt(c: Customer, r: { pay: number; met: string[] }) {
  if (c.role === 'buyer') { c.got.push(...r.met.filter(t => !c.got.includes(t))); if (c.budget !== null) c.budget -= r.pay }
  else c.dealt = true
}
