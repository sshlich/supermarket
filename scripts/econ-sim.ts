// Headless economy sim: drives customers.ts (and market.ts when it exists) with bots and prints the numbers ECONOMY.md
// sets targets for. `node scripts/econ-sim.ts [days] [runs]`. No page: each thing is made in a scratch field the way the
// game makes it, and seen the way a customer sees it (customers.ts), so its worth and tags are the game's.

import { arrive, deal, dealt, offerOf, stillWants, open, unpack, TAGS, type Customer, type Goods, type Offer } from '../src/customers.ts'
import { start } from '../src/world.ts'
import { impact, index, live, newMarket, rumors, tick, unmet, weights, type Market } from '../src/market.ts'

const DAYS = Number(process.argv[2] ?? 12), RUNS = Number(process.argv[3] ?? 300), PER_DAY = Number(process.argv[5] ?? 10), CAP = 80
const START_CASH = 50, MARKET = process.argv[4] === 'market'

function rng(seed: number) { return () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }

interface Stock extends Offer { cost: number; base: number }
let nextId = 1
/** What a customer's goods are as the counter sees them: the tags that count, and what they are worth, as the game makes and prices them. */
function make(g: Goods, rand: () => number = Math.random): { tags: string[]; worth: number } {
  const s = start()
  const it = unpack(s, g, null, rand)
  if (!it) throw new Error(`no room on an empty field for ${g.kind}`)
  const o = offerOf(s, it) // what people bring comes empty if it is not a package, so it is one thing
  return { tags: o.tags.filter(t => t in TAGS), worth: o.worth }
}

type Policy = 'all' | 'smart' | 'spec'
interface Day { net: number; rev: number; cogs: number; cash: number; served: number; buyers: number; missed: number; tagRev: Record<string, number>; pMin: number; pMax: number; events: number }

function runOne(policy: Policy, seed: number, days: number): Day[] {
  const rand = rng(seed)
  let cash = START_CASH
  let inv: Stock[] = []
  const out: Day[] = []
  let id = 0
  const m: Market | null = MARKET ? newMarket() : null
  const idx = (tags: string[]) => m ? index(m, tags) : 1
  const kindTags: Record<string, string[]> = {}
  const lean = (k: string) => idx(kindTags[k] ??= make({ kind: k }).tags)
  for (let day = 0; day < days; day++) {
    const d: Day = { net: 0, rev: 0, cogs: 0, cash: 0, served: 0, buyers: 0, missed: 0, tagRev: {}, pMin: 9, pMax: 0, events: 0 }
    const before = cash + inv.reduce((n, s) => n + s.cost, 0)
    for (let h = 0; h < PER_DAY; h++) {
      for (const s of inv) s.worth = s.base * idx(s.tags)
      const c: Customer = arrive(++id, rand, m ? weights(m) : undefined, m ? lean : undefined)
      const goods = c.goods.map(g => { const x = make(g, rand); return { id: nextId++, ...x, base: x.worth, worth: x.worth * idx(x.tags) } })
      // the spec bot holds what an event is about to make dear, and buys on a rumor
      const hot = new Set(m && policy === 'spec' ? [...rumors(m), ...live(m)].filter(e => e.d > 1 || e.s < 1).flatMap(e => e.tags) : [])
      c.brought = goods.map(g => g.id)
      if (c.role === 'seller') c.ask = Math.max(1, Math.round(goods.reduce((n, g) => n + g.worth, 0) * c.rate))
      const theirs = goods.reduce((n, g) => n + g.worth, 0)
      for (let tries = 0; tries < 3 && open(c); tries++) {
        let offer: Stock[] = []
        if (c.role === 'seller') {
          const fits = inv.length + goods.length <= CAP
          if (!fits || cash < c.ask || (policy !== 'all' && c.ask > (goods.some(g => g.tags.some(t => hot.has(t))) ? 1.05 : 0.85) * theirs)) break
        } else {
          const wants = c.role === 'buyer' ? stillWants(c) : c.wants
          const held = (s: Stock) => inv.length < 60 && s.tags.some(t => hot.has(t) && m!.p[t] < 1.3)
          const match = (w: string) => inv.filter(s => s.tags.includes(w) && !held(s)).sort((a, b) => a.worth - b.worth)
          if (policy === 'all') offer = inv.filter(s => s.tags.some(t => wants.includes(t)))
          else for (const w of wants) {
            // the dearest thing that goes through for this want on its own (buyer), the cheapest that covers it (trader)
            const cand = c.role === 'buyer' ? match(w).reverse() : match(w)
            const ok = cand.find(s => deal(c, [...offer, s], cash, theirs).done)
            if (ok && !offer.includes(ok)) offer.push(ok)
          }
        }
        const r = deal(c, offer, cash, theirs)
        if (!r.done) break
        dealt(c, r)
        const gave = inv.filter(s => r.take.includes(s.id))
        const costGiven = gave.reduce((n, s) => n + s.cost, 0)
        inv = inv.filter(s => !r.take.includes(s.id))
        cash += r.pay
        if (c.role === 'seller') for (const g of goods) { inv.push({ ...g, cost: c.ask * g.worth / theirs }); if (m) for (const t of g.tags) impact(m, t, g.worth / g.tags.length, false) }
        else if (c.role === 'trader') { const paid = costGiven - r.pay; for (const g of goods) inv.push({ ...g, cost: paid * g.worth / theirs }) }
        // what you sold moves its price down, a thing's worth split across the tags it was wanted for (as buying splits it up)
        if (c.role !== 'seller' && m) for (const s of gave) { const ts = s.tags.filter(t => c.wants.includes(t)); for (const t of ts) impact(m, t, s.worth / ts.length, true) }
        // the margin is on sales: a swap is an exchange (what you gave becomes the cost of what you got), not revenue and its cost
        if (c.role === 'buyer') {
          const value = gave.reduce((n, s) => n + s.worth, 0)
          d.rev += r.pay; d.cogs += costGiven
          for (const s of gave) { const ts = s.tags.filter(t => c.wants.includes(t)); for (const t of ts) d.tagRev[t] = (d.tagRev[t] ?? 0) + r.pay * s.worth / (value || 1) / ts.length }
        }
      }
      if (m) { if (c.role === 'buyer') stillWants(c).forEach(t => unmet(m, t)); tick(m, rand, 1, PER_DAY); d.events += m.events.filter(e => e.wait <= 0 && e.age === 0).length; for (const v of Object.values(m.p)) { d.pMin = Math.min(d.pMin, v); d.pMax = Math.max(d.pMax, v) } }
      if (c.role === 'buyer') { d.buyers++; if (!stillWants(c).length) d.served++; d.missed += stillWants(c).length }
    }
    d.cash = cash
    d.net = cash + inv.reduce((n, s) => n + s.cost, 0) - before
    out.push(d)
  }
  return out
}

const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1)
for (const policy of (MARKET ? ['all', 'smart', 'spec'] : ['all', 'smart']) as Policy[]) {
  const runs = Array.from({ length: RUNS }, (_, i) => runOne(policy, 1000 + i, DAYS))
  console.log(`\n== ${policy}${MARKET ? ' (market)' : ''}: ${RUNS} runs x ${DAYS} days x ${PER_DAY} customers`)
  if (MARKET) console.log('price index over the run: lowest', Math.min(...runs.flat().map(x => x.pMin)).toFixed(2), 'highest', Math.max(...runs.flat().map(x => x.pMax)).toFixed(2), '; events per day', avg(runs.flat().map(x => x.events)).toFixed(2))
  console.log('day   net   cash  margin  served  missed/day  loss%')
  for (let d = 0; d < DAYS; d++) {
    const col = runs.map(r => r[d])
    const rev = avg(col.map(x => x.rev)), cogs = avg(col.map(x => x.cogs))
    console.log(String(d + 1).padStart(3), avg(col.map(x => x.net)).toFixed(1).padStart(6), avg(col.map(x => x.cash)).toFixed(0).padStart(6),
      ((rev ? (rev - cogs) / rev : 0) * 100).toFixed(0).padStart(6) + '%', (avg(col.map(x => x.served / (x.buyers || 1))) * 100).toFixed(0).padStart(6) + '%',
      avg(col.map(x => x.missed)).toFixed(1).padStart(10), (col.filter(x => x.net < 0).length / col.length * 100).toFixed(0).padStart(6))
  }
  const all = runs.flat(), tagTotal: Record<string, number> = {}
  for (const x of all) for (const [t, v] of Object.entries(x.tagRev)) tagTotal[t] = (tagTotal[t] ?? 0) + v
  const sum = Object.values(tagTotal).reduce((a, b) => a + b, 0)
  console.log('revenue share by tag:', Object.entries(tagTotal).sort((a, b) => b[1] - a[1]).map(([t, v]) => `${t} ${(v / sum * 100).toFixed(0)}%`).join(', '))
}
