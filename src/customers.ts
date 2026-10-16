// Customers at the counter: who they are, what they want (as tags), what they bring, and how a deal with them goes. Pure
// data and rules, no page; the terminal in main.ts draws it and moves the things.

import { contents, KINDS, LIQUIDS, look, remove, spawn, worth, type Fill, type Item, type Space, type State } from './world.ts'

/** The tags a customer can want (the same tags kinds carry): what people need to get by, not what things feel like. Each has a word for the tooltip and what a customer says about it. */
export const TAGS: Record<string, { label: string; desc: string; say: string }> = {
  food: { label: 'food', desc: 'Something to eat.', say: 'something to eat' },
  drink: { label: 'drink', desc: 'Something to drink.', say: 'something to drink' },
  alcohol: { label: 'alcohol', desc: 'A drink with alcohol in it.', say: 'something with alcohol in it' },
  medicine: { label: 'medicine', desc: 'Pills, dressings, anything that treats.', say: 'medicine' },
  light: { label: 'light', desc: 'Something to see by in the dark.', say: 'a light for the dark' },
  book: { label: 'book', desc: 'Something to read.', say: 'something to read' },
  fuel: { label: 'fuel', desc: 'Something to burn: for a lamp or a stove.', say: 'fuel for a lamp' },
  metal: { label: 'metal', desc: 'Iron or copper in bars, to be worked into something.', say: 'some metal, in bars' },
  valuable: { label: 'valuable', desc: 'Worth something to someone: to keep, or to trade on.', say: 'something of value' },
}

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
 * the counter until sent away, so they can buy again. `dealt`: a seller or trader has made their one deal. `slack`: how
 * much short of their own goods' worth a trader will settle for (you cover the rest in cash). `here`: they have stepped up
 * to the counter (unloaded and said hello), so a reload does not do it twice, nor leave it undone.
 */
export interface Customer { id: number; name: string; role: Role; wants: string[]; rate: number; goods: Goods[]; brought: number[]; ask: number; budget: number | null; got: string[]; dealt?: boolean; slack?: number; here?: boolean }

const NAMES = ['Mara', 'Odell', 'Pim', 'Ines', 'Tobias', 'Wren', 'Hollis', 'Bea', 'Corvin', 'Dot', 'Ansel', 'Yuki']
const pick = <T>(list: T[], rand: () => number) => list[Math.floor(rand() * list.length)]

/** A new customer: a buyer half the time, else a seller or (less often) a trader. */
export function arrive(id: number, rand: () => number = Math.random, weights?: Record<string, number>, lean?: (kind: string) => number): Customer {
  const r = rand()
  const role: Role = r < 0.5 ? 'buyer' : r < 0.8 ? 'seller' : 'trader'
  const wants: string[] = []
  if (role !== 'seller') {
    // each want is drawn without repeats, by `weights` when the market gives them (unmet need and events bring more of a tag)
    const pool = Object.keys(TAGS)
    for (let n = 1 + Math.floor(rand() * (role === 'buyer' ? 3 : 2)); n > 0; n--) {
      let r = rand() * pool.reduce((a, t) => a + (weights?.[t] ?? 1), 0)
      wants.push(...pool.splice(Math.max(0, pool.findIndex(t => (r -= weights?.[t] ?? 1) <= 0)), 1))
    }
  }
  const goods = role === 'buyer' ? [] : Array.from({ length: 1 + Math.floor(rand() * 3) }, () => bring(rand, lean))
  // ponytail: ECONOMY.md section 4. Ranges around a centre (a buyer pays about a quarter over worth, a seller asks about a fifth under), so a flip earns ~55%, not 100%
  const around = (mid: number, spread: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, mid + spread * (rand() + rand() + rand() - 1.5) * 2))
  const rate = role === 'buyer' ? around(1.25, 0.12, 1, 1.6) : role === 'seller' ? around(0.8, 0.1, 0.6, 1) : 1
  // most buyers count their money; some have plenty
  const budget = role === 'buyer' && rand() < 0.65 ? 5 + Math.floor(rand() * 36) : null
  return { id, name: pick(NAMES, rand), role, wants, rate, goods, brought: [], ask: 0, budget, got: [], ...(role === 'trader' ? { slack: 0.1 + rand() * 0.2 } : {}) }
}

/**
 * Something a seller or trader brings: cheaper kinds more often (a cabinet rarely), any of its property values, a vessel
 * part full of something, a blister with some pills already gone. What people bring is never quite new.
 */
export function bring(rand: () => number = Math.random, lean: (kind: string) => number = () => 1): Goods {
  const pool = Object.entries(KINDS).filter(([, k]) => k.price && !k.stack) // a sandwich is made, not brought
  const wt = ([n, k]: [string, (typeof pool)[number][1]]) => lean(n) / k.price!
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

/**
 * A thing on the inside counter, as a customer sees it: its tags and what it is worth. A package (a container that comes
 * full: a blister, a bag of bread, a matchbox) is one thing, its tags and worth those of all it holds. Any other container
 * is itself (`worth` without what is in it) plus its `parts`, each seen on its own: a cabinet holding an apple sells the
 * apple to someone who wants food, not the cabinet.
 */
export interface Offer { id: number; tags: string[]; worth: number; parts?: Offer[] }
/** Is it a package: a container that comes full, sold with what is in it? */
export const isPackage = (kind: string) => !!KINDS[kind]?.slots?.some(sl => sl.fill)
const tagsIn = (s: State, it: Item): string[] => [...look(it).tags, ...contents(s, it.id).flatMap(o => tagsIn(s, o))]
/** How a customer sees a thing (see Offer). */
export function offerOf(s: State, it: Item): Offer {
  if (isPackage(it.kind)) return { id: it.id, tags: [...new Set(tagsIn(s, it))], worth: worth(s, it) }
  const kids = contents(s, it.id)
  const own = { id: it.id, tags: look(it).tags, worth: worth(s, it) - kids.reduce((n, o) => n + worth(s, o), 0) }
  return kids.length ? { ...own, parts: kids.map(o => offerOf(s, o)) } : own
}
/** What of these a customer who wants `wants` would take: each thing with a wanted tag, and, inside any container, whatever they want of what it holds. */
export const picked = (offers: Offer[], wants: string[]): Offer[] => offers.flatMap(o => [...(o.tags.some(t => wants.includes(t)) ? [o] : []), ...picked(o.parts ?? [], wants)])

/**
 * Press the deal button. What is on the inside counter (`offered`), the cash you have, and what the customer's own goods
 * are worth (`theirs`) decide it: `done` if it goes through, `take` what they take off the inside counter, `pay` what
 * changes hands (positive to you), `met` which wants it covers, `say` their answer. A buyer takes what has a tag they still
 * want and pays over its worth, if their budget runs to it; a seller wants their price; a trader takes what they want if it
 * is worth most of what they brought, and the difference is paid in cash. Nobody leaves: they stay until sent away.
 */
export function deal(c: Customer, offered: Offer[], cash: number, theirs: number): { done: boolean; take: number[]; pay: number; met: string[]; say: string } {
  const wants = c.role === 'buyer' ? stillWants(c) : c.wants
  const take = picked(offered, wants)
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
    // at worth, with some slack; the difference is settled in cash either way (positive: they pay you), so a near miss is never a dead end
    const short = Math.ceil(theirs * (1 - (c.slack ?? 0.2)) - value)
    if (short > 0) return no(`That's not worth what I brought. Add about ${short}$ more.${missing.length ? ` And I still want ${list(missing)}.` : ''}`)
    const pay = Math.round(value - theirs)
    if (pay < 0 && cash < -pay) return no(`Close, but you'd owe me ${-pay}$ and you haven't got it.`)
    return { done: true, take: take.map(o => o.id), pay, met, say: pay > 0 ? `Fair trade, and ${pay}$ for the difference.` : pay < 0 ? `Close enough. You owe me ${-pay}$.` : 'Fair trade.' }
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
