// The customer terminal beside the field: who is at the counter, the line of those still waiting, which of their wants are
// met, and what has been said; the controls under it (dismiss, next, and the big deal button), and the deal itself, played
// out on the counters. customers.ts holds the rules of a deal; main.ts hands in the field and what it can do (`initTerminal`).
// The terminal's state is saved apart from the field.

import { arrive, deal, dealt, deckOf, greeting, isPackage, offerOf, open as canDeal, priceFor, residentOf, takes, TAGS, unpack, type Customer, type Role } from './customers.ts'
import { esc } from './html.ts'
import { shop } from './sound.ts'
import { contents, find, inSpace, moveInto, under, worth, type Counter, type Item, type State } from './world.ts'

/** What the terminal needs from the page. */
export interface Hooks {
  /** The field as it is now (a new game replaces it). */
  state(): State
  /** Save and redraw everything; things that moved glide from `from`. */
  changed(from?: Map<number, DOMRect>): void
  /** Where every thing on the page is drawn now. */
  rects(): Map<number, DOMRect>
  /** Things leave the shop: they fade where they were and are removed (the caller redraws). */
  vanish(ids: number[]): void
  toast(text: string): void
  setCash(n: number): void
  sound(it: Item, action: 'drop'): void
  /** Is something being dragged? */
  dragging(): boolean
  /** Redraw the counters' dials (they say what the customer makes of what is on them). */
  paintDials(): void
  /** The tooltip under the pointer may be gone: hide it. */
  hideTip(): void
  /** The last customer of the line has gone: the day is over. */
  dayOver(): void
  /** After hours (the night, outside.ts): the door stays shut and no new line forms until morning. */
  closed(): boolean
}
let h: Hooks
const app = document.getElementById('app')!

interface Line { who: 'them' | 'you' | 'note'; text: string; name?: string }
interface Talk { open: boolean; n: number; customer: Customer | null; line: Customer[]; met: string[]; log: Line[] }
const TALK = 'field-v3-terminal'
const blankTalk = (open = false): Talk => ({ open, n: 0, customer: null, line: [], met: [], log: [] })
/** A saved customer from an older version (no role, or wants that no longer exist) is dropped, with the line. */
const current = (c: Customer | null | undefined) => !!c?.role && Array.isArray(c.got) && c.wants.every(t => t in TAGS)
let talk: Talk = ((): Talk => { try { const v = JSON.parse(localStorage.getItem(TALK) ?? 'null'); return v && Array.isArray(v.log) ? (current(v.customer) || !v.customer ? { ...blankTalk(), ...v, line: (v.line ?? []).filter(current) } : { ...blankTalk(v.open), n: v.n }) : blankTalk() } catch { return blankTalk() } })()
// saved before customers knew whether they had stepped up: one who has spoken has
if (talk.customer && talk.customer.here === undefined) talk.customer.here = talk.log.some(l => l.who === 'them')
const saveTalk = () => { try { localStorage.setItem(TALK, JSON.stringify(talk)) } catch { /* private window */ } }

/** The one at the counter, if anyone. */
export const customer = () => talk.customer

// ---------------------------------------------------------------- whose things are whose

/**
 * A customer's things are theirs until you deal: you can move them about, look inside them, but not take anything out of
 * them, put anything in, cut, pour or build on them. (When they leave, they take what they brought and all that is in it.)
 */
export const theirs = (id: number): boolean => !!talk.customer?.brought.length && under(h.state(), id, talk.customer.brought)
export const notYours = () => { h.toast(`${talk.customer?.name ?? 'the customer'}'s: not yours until you deal`); shop('bad') }

/** What the customer at the counter makes of what is on a counter (for its dial): what a seller asks outside, what a buyer would pay or a trader take inside. */
export function dialNote(at: Counter): string {
  const s = h.state(), c = talk.customer
  if (c && at === 'outside' && c.role === 'seller' && !c.dealt && c.brought.length) return `${c.name} asks ${c.ask}$`
  if (!c || at !== 'inside' || !canDeal(c) || c.role === 'seller') return ''
  const offers = inSpace(s, { at }).filter(it => !c.brought.includes(it.id)).map(it => offerOf(s, it))
  const wanted = takes(c, offers).reduce((n, o) => n + o.worth, 0)
  if (!wanted) return ''
  if (c.role === 'trader') return `${c.name} takes ${wanted}$`
  const r = deal(c, offers, 0, 0) // short of money, they pay for what they can: `!` says not all of it
  return `${c.name} pays ${r.done ? r.pay : 0}$${!r.done || r.pay < priceFor(c, wanted) ? '!' : ''}`
}

/** What the customer at the counter makes of a thing (for its tooltip): theirs, what a buyer would pay for it, whether a trader wants it. */
export function customerSays(it: Item): string {
  const c = talk.customer
  if (!c) return ''
  const name = esc(c.name)
  if (c.brought.includes(it.id)) return c.role === 'seller' && !c.dealt ? `${name}'s: part of a ${c.ask}$ lot` : `${name}'s, until you deal`
  if (!canDeal(c) || c.role === 'seller') return ''
  const take = takes(c, [offerOf(h.state(), it)])
  if (!take.length) return `${name} does not want this`
  const what = take.some(o => o.id === it.id) ? 'this' : 'what is in this'
  if (c.role === 'trader') return `${name} wants ${what}`
  const pay = priceFor(c, take.reduce((n, o) => n + o.worth, 0))
  return `${name} would pay ${pay}$${what === 'this' ? '' : ' for what is in this'}${c.budget !== null && pay > c.budget ? ` (has ${c.budget}$)` : ''}`
}

// ---------------------------------------------------------------- drawn

/** A wanted tag as a short word; hovering it says what it is. Lit when what is on the counter meets it. */
const tagChip = (t: string, met: boolean, i: number) => `<span class="tag${met ? ' met' : ''}" data-tag="${esc(t)}" style="--i:${i}">${esc(TAGS[t]?.label ?? t)}</span>`

/** What the big button says for each sort of customer. */
const DEAL: Record<Role, { label: string; title: string }> = {
  buyer: { label: 'SELL', title: 'Sell them what they want from the inside counter' },
  seller: { label: 'BUY', title: 'Buy what they unloaded on the outside counter, at their price' },
  trader: { label: 'SWAP', title: 'Swap what they want from the inside counter for what they brought' },
}

const svg = (d: string) => `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square">${d}</svg>`
const ICON = {
  dismiss: svg('<path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/>'), // send away
  next: svg('<path d="M3 3.5l5 4.5-5 4.5M9 3.5l5 4.5-5 4.5"/>'), // call the next in line
  door: svg('<path d="M3.5 14V2.5h6V14M2 14h12M7.5 8.2v.1M12 6l2 2-2 2M10 8h4"/>'), // open the door
}

/** The button on the side of the field and, when it is open, the terminal under it: the conversation, and below it the controls (dismiss and next on the left, the big deal button on the right). */
export function sideHtml(fresh = false) {
  const c = talk.customer
  const button = `<button class="term-btn${talk.open ? ' on' : ''}" data-term title="Talk to the customer">&gt;_ customers</button>`
  if (!talk.open) return button
  const lines = talk.log.map((l, i) => l.who === 'them' ? `<div class="them" data-line="${i}"><b>${esc(l.name ?? '')}</b> <span>${esc(l.text)}</span></div>` : `<div class="${l.who}">${l.who === 'you' ? '$ ' : ''}${esc(l.text)}</div>`).join('')
  const off = c ? '' : ' disabled'
  const shut = c && canDeal(c) ? '' : ' disabled'
  const waiting = talk.line.length ? `${talk.line.length} waiting` : 'nobody else waiting'
  const lit = (t: string) => c?.got.includes(t) || talk.met.includes(t)
  const money = c?.role === 'buyer' && c.budget !== null ? `<span class="tag ask" style="--i:${c.wants.length}" title="What they have left to spend">has ${c.budget}$</span>` : ''
  const who = c && residentOf(c), from = who ? ` <small class="who" title="${esc(who.desc)}">${esc(who.name.toLowerCase())}, ${esc(deckOf(c!)?.name ?? '')}</small>` : ''
  const head = c ? `<span>customer ${c.id}: ${esc(c.name)} <small>· ${waiting}</small>${from}</span><span class="wants">${c.role === 'seller' ? (c.ask ? `<span class="tag ask" style="--i:0">asks ${c.ask}$</span>` : '') : c.wants.map((t, i) => tagChip(t, lit(t), i)).join('') + money}</span>`
    : `<span>nobody at the counter <small>· ${talk.line.length ? waiting : 'the line is empty'}</small></span>`
  const next = c || talk.line.length ? 'next customer' : 'let them in'
  const big = c ? DEAL[c.role] : DEAL.buyer
  return `${button}<div class="term"><div class="term-head${fresh ? ' fresh' : ''}">${head}</div>
    <div class="term-screen"><div class="term-log" data-termlog>${lines}</div></div>
    <div class="term-ask"><div class="ask-side"><button class="no" data-say="dismiss"${off} title="Send them away, with whatever they brought" aria-label="dismiss">${ICON.dismiss}</button><button class="go" data-say="next" title="${c || talk.line.length ? 'Call the next one in line' : 'Open the door: a new line forms'}" aria-label="${next}">${c || talk.line.length ? ICON.next : ICON.door}</button></div><button class="sell" data-say="deal"${shut} title="${big.title}">${big.label}</button></div></div>`
}

let seq = 0 // bumped by every move that changes who is at the counter: a slower one still going notices and gives up
let typer = 0
/** The customer's line being typed out: which line of the log, and how many letters are showing. Kept apart from the page, so a redraw carries on where it was. */
let typing: { i: number; n: number } | null = null
const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms))
/** Redraw just the terminal (the field is left alone), scrolled to the latest line. `type` types out the newest line of the customer's, a letter at a time. */
function renderTerm(o: { fresh?: boolean; type?: boolean } = {}) {
  const side = app.querySelector('.side')
  if (!side) return
  h.hideTip() // the tag under the pointer may be gone: no pointerout will come for it
  side.innerHTML = sideHtml(o.fresh)
  const log = side.querySelector<HTMLElement>('[data-termlog]')
  if (log) log.scrollTop = log.scrollHeight
  h.paintDials()
  if (o.type && talk.log.length) typing = { i: talk.log.length - 1, n: 0 }
  typeOn()
  saveTalk()
}
/** Type the line in `typing` on into the terminal as it is drawn now, from where it had got to (the page calls this after every redraw). */
export function typeOn() {
  clearInterval(typer)
  const t = typing
  const line = t && app.querySelector<HTMLElement>(`.side [data-line="${t.i}"]`)
  const span = line?.querySelector('span')
  const full = t && talk.log[t.i]?.text
  if (!t || !line || !span || !full) { typing = null; return }
  const log = app.querySelector<HTMLElement>('.side [data-termlog]')
  span.textContent = full.slice(0, t.n)
  line.classList.add('typing')
  typer = window.setInterval(() => {
    span.textContent = full.slice(0, ++t.n)
    if (t.n % 2 && full[t.n - 1] !== ' ') shop('key')
    if (log) log.scrollTop = log.scrollHeight
    if (t.n >= full.length || !line.isConnected) { clearInterval(typer); line.classList.remove('typing'); if (typing === t && t.n >= full.length) typing = null }
  }, 16)
}

// ---------------------------------------------------------------- played

/** The customer goes, taking back whatever they brought and you did not deal for, wherever it got to. */
function leave() {
  const c = talk.customer
  if (c?.brought.length) { h.vanish(c.brought); h.changed(new Map()); shop('leave') }
}
/** The screen is wiped: a scan line sweeps down and the conversation fades behind it, then nobody is at the counter. False if something else happened meanwhile. */
async function wipe(): Promise<boolean> {
  const my = ++seq
  const screen = app.querySelector('.term-screen')
  if (screen && talk.open && talk.log.length) { screen.classList.add('wipe'); shop('wipe'); await wait(480) }
  if (my !== seq) return false
  Object.assign(talk, { customer: null, met: [], log: [] })
  renderTerm()
  return true
}
/** A new line forms when the door opens. */
// ponytail: line length is random (3 to 7) for now; it should come from something in the game later (reputation, stock, the street)
const newLine = () => Array.from({ length: 3 + Math.floor(Math.random() * 5) }, () => arrive(++talk.n))
/** A seller or trader puts down what they brought on the outside counter, one thing after another; a seller then names a price for the lot. */
function unload(c: Customer) {
  const s = h.state()
  for (const g of c.goods) {
    const it = unpack(s, g, { at: 'outside' })
    if (it) c.brought.push(it.id) // (none: no room left on the counter)
  }
  if (c.role === 'seller') c.ask = Math.max(1, Math.round(c.brought.reduce((n, id) => n + worth(s, find(s, id)!), 0) * c.rate))
  if (!c.brought.length) return
  h.changed(new Map())
  c.brought.forEach((id, i) => setTimeout(() => { const it = find(h.state(), id); if (it) h.sound(it, 'drop') }, i * 110 + 120))
  c.brought.forEach((id, i) => app.querySelector(`.item[data-id="${id}"]`)?.animate([{ opacity: 0, transform: 'translateY(-60%)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: i * 110, easing: 'ease-out', fill: 'backwards' }))
}
/**
 * The next one in line steps up (whoever was there leaves first, with their things). With nobody there and nobody waiting,
 * the door opens and a new line forms. A newcomer's wants fade in, a seller or trader unloads, and they start talking.
 */
async function callNext() {
  if (h.closed()) return
  const had = !!talk.customer
  leave()
  if (!(await wipe())) return
  if (!talk.line.length) { if (had) return void h.dayOver(); talk.line = newLine(); shop('bell') }
  const my = seq
  const c = talk.customer = talk.line.shift()!
  talk.log.push({ who: 'note', text: `customer ${c.id} at the counter...` })
  renderTerm({ fresh: true })
  await wait(420)
  await dragDone() // nothing lands on a counter under a thing being dragged
  if (my !== seq) return
  stepUp(c)
}
/** The one at the counter unloads (a seller or trader) and says what they came for. Once only: a reload half way through finishes it. */
function stepUp(c: Customer) {
  if (c.here) return
  c.here = true
  unload(c)
  talk.log.push({ who: 'them', name: c.name, text: greeting(c) })
  renderTerm({ type: true })
}
/** Wait until nothing is being dragged (the page calls `dropped` when a drag ends). */
let afterDrag: (() => void)[] = []
const dragDone = () => h.dragging() ? new Promise<void>(r => afterDrag.push(r)) : Promise.resolve()
export function dropped() {
  const waiting = afterDrag
  afterDrag = []
  waiting.forEach(r => r())
}
/** Send the one at the counter away, with what they brought; if they were the last of the line, the day is over. */
async function dismiss() {
  leave()
  if (await wipe() && !talk.line.length) h.dayOver()
}
/**
 * The big button: SELL to a buyer, BUY from a seller, SWAP with a trader (see `deal` in customers.ts). What is yours on the
 * inside counter is offered; their own things are not yours to offer. If it goes through, money moves, what they take
 * leaves and what they brought is yours. They stay: a buyer can buy again while they still want something.
 */
function doDeal() {
  const s = h.state(), c = talk.customer
  if (!c) return
  c.brought = c.brought.filter(id => find(s, id))
  const offered = inSpace(s, { at: 'inside' }).filter(it => !c.brought.includes(it.id)).map(it => offerOf(s, it))
  const theirs = c.brought.reduce((n, id) => n + worth(s, find(s, id)!), 0)
  const r = deal(c, offered, s.cash ?? 0, theirs)
  talk.met = c.role === 'trader' ? r.met : []
  if (r.done) dealt(c, r)
  talk.log.push({ who: 'you', text: DEAL[c.role].label }, { who: 'them', name: c.name, text: r.say })
  renderTerm({ type: true })
  if (!r.done) return
  // what they take leaves; what you got slides across from the outside counter to the inside one (what fits)
  const got = c.brought.map(id => find(s, id)!).filter(it => it.at === 'outside')
  c.brought = []
  if (r.pay) { h.setCash((s.cash ?? 0) + r.pay); shop(r.pay > 0 ? 'coinsIn' : 'coinsOut') }
  const from = h.rects()
  // a container they take for itself leaves what they did not want in it behind, on the inside counter (or the field); a package goes whole
  const taking = new Set(r.take)
  for (const id of r.take) { const it = find(s, id); if (it && !isPackage(it.kind)) for (const o of contents(s, id)) if (!taking.has(o.id)) moveInto(s, o, { at: 'inside' }) || moveInto(s, o, null) }
  h.vanish(r.take)
  for (const it of got) moveInto(s, it, { at: 'inside' })
  h.changed(from)
  saveTalk() // what they brought is yours now: a reload must not let them take it back
  // they stay at the counter until you dismiss them or call the next one
}

/** Open or close the terminal; opening it with nobody there calls the next one (or lets a line in). */
function toggleTerm() {
  talk.open = !talk.open
  if (talk.open && !talk.customer && !h.closed()) return void callNext()
  renderTerm()
}

/** A new game: nobody at the counter, nobody waiting; with the terminal open, a new line comes in (call after the page is drawn). */
export function restart() {
  seq++
  talk = blankTalk(talk.open)
  saveTalk()
}
export const reopen = () => { if (talk.open) callNext() }

/** Wire up the terminal: what it needs from the page, its buttons, and a customer who was half way through stepping up when the page was left. */
export function initTerminal(hooks: Hooks) {
  h = hooks
  app.addEventListener('click', e => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('button')
    if (!b) return
    if ('term' in b.dataset) toggleTerm()
    else if (b.dataset.say === 'next') callNext()
    else if (b.dataset.say === 'dismiss') dismiss()
    else if (b.dataset.say === 'deal') doDeal()
  })
}
/** After the page is first drawn: a reload between someone stepping up and their unloading finishes it. */
export const resume = () => { if (talk.customer && !talk.customer.here) stepUp(talk.customer) }
