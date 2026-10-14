// Customers at the counter: who they are, what they want (as tags), what they bring, and how a deal with them goes. Pure
// data and rules, no page; the terminal in main.ts draws it and moves the things.

import { KINDS, LIQUIDS, type Fill } from './world.ts'

/** The tags a customer can want (the same tags kinds carry): what people need to get by, not what things feel like. Each has a word for the tooltip and what a customer says about it. */
export const TAGS: Record<string, { label: string; desc: string; say: string }> = {
  food: { label: 'food', desc: 'Something to eat.', say: 'something to eat' },
  drink: { label: 'drink', desc: 'Something to drink.', say: 'something to drink' },
  alcohol: { label: 'alcohol', desc: 'A drink with alcohol in it.', say: 'something with alcohol in it' },
  medicine: { label: 'medicine', desc: 'Pills, dressings, anything that treats.', say: 'medicine' },
  light: { label: 'light', desc: 'Something to see by in the dark.', say: 'a light for the dark' },
  book: { label: 'book', desc: 'Something to read.', say: 'something to read' },
  fuel: { label: 'fuel', desc: 'Something to burn: for a lamp or a stove.', say: 'fuel for a lamp' },
  valuable: { label: 'valuable', desc: 'Worth something to someone: to keep, or to trade on.', say: 'something of value' },
}

/**
 * Three sorts. A buyer wants things and pays for them; a seller brings things (unloaded on the outside counter) and asks a
 * price for the lot; a trader brings things and wants things, and swaps.
 */
export type Role = 'buyer' | 'seller' | 'trader'
/** One thing a customer brings, as it should be made: its kind, its properties, its liquid, and pills already gone from a blister. */
export interface Goods { kind: string; props?: Record<string, string>; fill?: Fill | null; missing?: number }
/**
 * `rate` is how they price: what a buyer pays (over what things are worth) or a seller asks (under it). `brought` are the
 * ids of what they unloaded, still theirs until a deal; `ask` is a seller's price for all of it. A buyer's `budget` is the
 * money they have left (null: they have enough for anything) and `got` the wants they have bought already: they stay at
 * the counter until sent away, so they can buy again. `dealt`: a seller or trader has made their one deal.
 */
export interface Customer { id: number; name: string; role: Role; wants: string[]; rate: number; goods: Goods[]; brought: number[]; ask: number; budget: number | null; got: string[]; dealt?: boolean }

const NAMES = ['Mara', 'Odell', 'Pim', 'Ines', 'Tobias', 'Wren', 'Hollis', 'Bea', 'Corvin', 'Dot', 'Ansel', 'Yuki']
const pick = <T>(list: T[], rand: () => number) => list[Math.floor(rand() * list.length)]

/** A new customer: a buyer half the time, else a seller or (less often) a trader. */
export function arrive(id: number, rand: () => number = Math.random): Customer {
  const r = rand()
  const role: Role = r < 0.5 ? 'buyer' : r < 0.8 ? 'seller' : 'trader'
  const wants: string[] = []
  if (role !== 'seller') { const pool = Object.keys(TAGS); for (let n = 1 + Math.floor(rand() * (role === 'buyer' ? 3 : 2)); n > 0; n--) wants.push(...pool.splice(Math.floor(rand() * pool.length), 1)) }
  const goods = role === 'buyer' ? [] : Array.from({ length: 1 + Math.floor(rand() * 3) }, () => bring(rand))
  const rate = role === 'buyer' ? 1.2 + rand() * 0.4 : role === 'seller' ? 0.5 + rand() * 0.4 : 1
  // most buyers count their money; some have plenty
  const budget = role === 'buyer' && rand() < 0.65 ? 5 + Math.floor(rand() * 36) : null
  return { id, name: pick(NAMES, rand), role, wants, rate, goods, brought: [], ask: 0, budget, got: [] }
}

/**
 * Something a seller or trader brings: cheaper kinds more often (a cabinet rarely), any of its property values, a vessel
 * part full of something, a blister with some pills already gone. What people bring is never quite new.
 */
export function bring(rand: () => number = Math.random): Goods {
  const pool = Object.entries(KINDS).filter(([, k]) => k.price)
  let r = rand() * pool.reduce((n, [, k]) => n + 1 / k.price!, 0)
  const [kind, k] = pool.find(([, k]) => (r -= 1 / k.price!) <= 0) ?? pool[0]
  const g: Goods = { kind }
  const props = Object.entries(k.props ?? {})
  // ponytail: a property that is a state, not what the thing is (a machine's power), is left at its default; a list of one for now
  if (props.length) g.props = Object.fromEntries(props.filter(([p]) => p !== 'power').map(([p, vals]) => [p, pick(Object.keys(vals), rand)]))
  if (k.holds) { const liquid = k.liquid ?? pick(Object.keys(LIQUIDS), rand); g.fill = { liquid, amount: 1 + Math.floor(rand() * k.holds) } }
  if (k.slots?.some(sl => sl.fill)) g.missing = Math.floor(rand() * 4)
  return g
}

const list = (words: string[]) => words.length > 1 ? `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}` : words[0]
const wanted = (c: Customer) => list(c.wants.map(t => TAGS[t]?.say ?? t))

/** Their first words. A seller names the price for everything they unloaded; a buyer who counts their money says how much they have. */
export function greeting(c: Customer): string {
  if (c.role === 'seller') return c.brought.length ? `I've got a few things to sell. ${c.ask}$ for the lot.` : 'No room on your counter for my things.'
  if (c.role === 'trader') return c.brought.length ? `I'll swap these for ${wanted(c)}.` : 'No room on your counter for my things.'
  return `Hello. I'm looking for ${wanted(c)}.${c.budget !== null ? ` I've got ${c.budget}$.` : ''}`
}
/** What a buyer still wants. */
export const stillWants = (c: Customer) => c.wants.filter(w => !c.got.includes(w))
/** Can this customer still deal? A buyer while they want something; a seller or trader until their one deal. */
export const open = (c: Customer) => c.role === 'buyer' ? stillWants(c).length > 0 : !c.dealt && c.brought.length > 0
/** What a buyer would pay for these, at their rate. */
export const priceFor = (c: Customer, worth: number) => Math.max(1, Math.round(worth * c.rate))

/** A thing on the inside counter, as a customer sees it: its tags (and those of whatever is inside it) and what it is worth. */
export interface Offer { id: number; tags: string[]; worth: number }

/**
 * Press the deal button. What is on the inside counter (`offered`), the cash you have, and what the customer's own goods
 * are worth (`theirs`) decide it: `done` if it goes through, `take` what they take off the inside counter, `pay` what
 * changes hands (positive to you), `met` which wants it covers, `say` their answer. A buyer takes what has a tag they still
 * want and pays over its worth, if their budget runs to it; a seller wants their price; a trader takes what they want if it
 * is worth most of what they brought, and no money moves. Nobody leaves: they stay until sent away.
 */
export function deal(c: Customer, offered: Offer[], cash: number, theirs: number): { done: boolean; take: number[]; pay: number; met: string[]; say: string } {
  const wants = c.role === 'buyer' ? stillWants(c) : c.wants
  const take = offered.filter(o => o.tags.some(t => wants.includes(t)))
  const met = wants.filter(w => take.some(o => o.tags.includes(w)))
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
  if (c.role === 'buyer' && !wants.length) return no('I have what I came for.')
  if (!offered.length) return no('The counter is empty. Is this a joke?')
  if (!take.length) return no('None of this is what I came for.')
  const missing = wants.filter(w => !met.includes(w)).map(t => TAGS[t]?.say ?? t)
  if (c.role === 'trader') {
    if (value < theirs * 0.8) return no(`That's not worth what I brought.${missing.length ? ` And I still want ${list(missing)}.` : ''}`)
    return { done: true, take: take.map(o => o.id), pay: 0, met, say: 'Fair trade.' }
  }
  const pay = priceFor(c, value)
  if (c.budget !== null && pay > c.budget) return no(`That's ${pay}$. I've only got ${c.budget}$.`)
  return { done: true, take: take.map(o => o.id), pay, met, say: missing.length ? `Here's ${pay}$. I still need ${list(missing)}.` : `That's everything. Here's ${pay}$.` }
}
/** After a deal went through: a buyer has those wants and less money; a seller or trader is done. */
export function dealt(c: Customer, r: { pay: number; met: string[] }) {
  if (c.role === 'buyer') { c.got.push(...r.met); if (c.budget !== null) c.budget -= r.pay }
  else c.dealt = true
}
