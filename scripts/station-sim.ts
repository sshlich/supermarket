// Headless sim of the station economy on a data slice (data/station/slices/phaseN.json, made by `node data/station/slice.mjs N`).
// `node scripts/station-sim.ts [phase=1] [days=14] [runs=200] [sellerMult=1] [customerMult=1]`. Three bots play the same days: `walkin` only trades with the line,
// `orders` also fills mail orders from stock, `maker` also runs machines and buys the machines and discs that pay. It models what
// the data holds (residents, sells/buys, budgets, orders, recipes, energy, cells, boxes, rent); it does not model events,
// the market index, the tithe, traders, the recycler, or the charger (cells are a cost per job, not a stock).

import { readFileSync } from 'node:fs'

const P = Number(process.argv[2] ?? 1), DAYS = Number(process.argv[3] ?? 14), RUNS = Number(process.argv[4] ?? 200), SELLERS = Number(process.argv[5] ?? 1) // CUSTOMERS multiplies the day's line; SELLERS multiplies how often a walk-in is a seller
const CUSTOMERS = Number(process.argv[6] ?? 1)
const dir = new URL('../data/station/', import.meta.url)
const S: any = JSON.parse(readFileSync(new URL(`slices/phase${P}.json`, dir), 'utf8'))
const PH: any = JSON.parse(readFileSync(new URL('phases.json', dir), 'utf8')).find((p: any) => p.id === `phase_${P}`)
const CARRIER: any = JSON.parse(readFileSync(new URL('carriers.json', dir), 'utf8'))[0]
const I: Record<string, any> = Object.fromEntries(S.items.map((i: any) => [i.id, i]))
const BOXES: any[] = JSON.parse(readFileSync(new URL('boxes.json', dir), 'utf8'))
const CELL = (I['it_tech_cell_s']?.value ?? 6) / (I['it_tech_cell_s']?.cell?.capacity ?? 10) // credits per cell used
const TRANSIT = 2, WAIT = 1 // days in the carrier's hands after sealing: waiting for a pickup, then the ride
const val = (id: string) => I[id]?.value ?? 0
const items = (list: any[]) => list.filter(w => w.id)
const worthOf = (wants: any[]) => items(wants).reduce((n, w) => n + val(w.id) * (w.qty ?? 1), 0)

function rng(seed: number) { return () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
const around = (r: () => number, m: number, sd: number, lo: number, hi: number) => { let g = 0; for (let i = 0; i < 6; i++) g += r(); return Math.min(hi, Math.max(lo, m + (g - 3) * sd * 2)) }
const between = (r: () => number, [a, b]: number[]) => a + r() * (b - a)
const weighted = <T,>(r: () => number, xs: T[], w: (x: T) => number): T => { const t = xs.reduce((n, x) => n + w(x), 0); let k = r() * t; for (const x of xs) if ((k -= w(x)) <= 0) return x; return xs[xs.length - 1] }

type Policy = 'walkin' | 'orders' | 'maker'
interface Day { cash: number; net: number; walkin: number; orderPay: number; filled: number; expired: number; missed: number; jobs: number; energy: number; stockValue: number; machines: number; bought: number }

function runOne(policy: Policy, seed: number): { days: Day[]; firstBuy: number; owned: string[] } {
  const r = rng(seed)
  let cash = S.start.credits
  const stock = new Map<string, { q: number; c: number }>() // quantity and total cost basis
  const add = (id: string, q: number, cost: number) => { const s = stock.get(id) ?? { q: 0, c: 0 }; s.q += q; s.c += cost; stock.set(id, s) }
  const take = (id: string, q: number) => { const s = stock.get(id)!; const c = s.c * q / s.q; s.q -= q; s.c -= c; if (s.q <= 1e-9) stock.delete(id); return c }
  const have = (id: string) => stock.get(id)?.q ?? 0
  const owned = new Set<string>(['mach_hands']), discs = new Set<string>(), ups = new Set<string>()
  for (const t of S.start.things) { if (t.id.startsWith('mach_')) owned.add(t.id); else if (t.id.startsWith('disc_')) discs.add(t.id); else if (I[t.id]) add(t.id, t.qty, val(t.id) * 0.7 * t.qty) }
  for (const t of S.start.things) if (t.id.startsWith('box_')) add(t.id, t.qty, 0)
  let capEnergy = S.start.energy_cap
  let pending: any[] = [], pay: { day: number; amt: number }[] = [], night: { day: number; outs: any[]; cost: number }[] = []
  const days: Day[] = []
  let firstBuy = -1
  const orderDefs = S.orders.filter((o: any) => ['order', 'charity', 'rush', 'bulk', 'repair', 'standing'].includes(o.kind) && !o.contraband && (o.weight ?? 1) > 0 && items(o.wants).length)
  const worth = () => [...stock].reduce((n, [id, s]) => n + s.c, 0)
  const inflight = () => pay.reduce((n, p) => n + p.amt, 0)
  const sellers = S.residents.filter((x: any) => (x.sells ?? []).length), cast = S.residents

  // an informed player buys what somebody wants: a resident's list, a pending order, or (maker) what a paying recipe eats
  const buysAll = new Set<string>(S.residents.flatMap((x: any) => x.buys ?? []))
  let feeds = new Set<string>()
  const refreshFeeds = () => { feeds = new Set(policy !== 'maker' ? [] : S.recipes.filter((rc: any) => owned.has(rc.machine) && (!rc.disc || discs.has(rc.disc)) && rc.outputs?.length && worthOf(rc.outputs) - worthOf(rc.inputs) - (rc.cells ?? 0) * CELL > 0.25).flatMap((rc: any) => rc.inputs.map((x: any) => x.id))) }
  const demanded = (id: string) => buysAll.has(id) || (!!I[id]?.market_need && val(id) <= 40) || need(id) > 0 || feeds.has(id)
  const reserved = (id: string) => policy === 'walkin' ? 0 : pending.reduce((n, o) => n + (o.def.wants.find((w: any) => w.id === id)?.qty ?? 0), 0)
  const need = (id: string) => Math.max(0, reserved(id) - have(id))

  function fill(d: number, D: Day) {
    pending.sort((a, b) => a.due - b.due)
    for (const o of [...pending]) {
      if (!items(o.def.wants).every((w: any) => have(w.id) >= w.qty)) continue
      const area = items(o.def.wants).reduce((n: number, w: any) => n + (I[w.id]?.w ?? 1) * (I[w.id]?.h ?? 1) * w.qty, 0)
      const box = BOXES.find((b: any) => b.inner_w * b.inner_h >= area) ?? BOXES[BOXES.length - 1]
      const fee = box.fee * CARRIER.fee_mult, boxCost = have(box.id) >= 1 ? 0 : box.price
      const arrive = d + WAIT + TRANSIT, late = arrive > o.due
      const reward = worthOf(o.def.wants) * o.def.price_mult * (late ? (o.def.late?.pay_mult ?? 0.8) : 1)
      let cost = 0; for (const w of items(o.def.wants)) cost += take(w.id, w.qty)
      if (have(box.id) >= 1) take(box.id, 1)
      if (reward < cost + fee + boxCost) { for (const w of items(o.def.wants)) add(w.id, w.qty, cost * val(w.id) * w.qty / Math.max(1e-9, worthOf(o.def.wants))); continue }
      cash -= fee + boxCost; pay.push({ day: arrive, amt: reward }); pending = pending.filter(x => x !== o); D.filled++
    }
  }

  // best runnable recipe by profit: out value - in value - cells; null if none pays
  function bestRecipe(energyLeft: number, nights: boolean, busy: Set<string>) {
    let best: any = null, bestM = 0.25
    for (const rc of S.recipes) {
      if (!owned.has(rc.machine) || busy.has(rc.machine) || (rc.disc && !discs.has(rc.disc)) || (rc.time === 'nights') !== nights) continue
      if (!rc.outputs?.length) continue
      const e = nights ? 0 : rc.energy ?? 0
      if (e > energyLeft || !rc.inputs.every((x: any) => have(x.id) >= x.qty)) continue
      if (rc.inputs.some((x: any) => have(x.id) - x.qty < reserved(x.id) && reserved(x.id) > 0)) continue
      const m = worthOf(rc.outputs) - worthOf(rc.inputs) - (rc.cells ?? 0) * CELL
      if (m > bestM) { best = rc; bestM = m }
    }
    return best
  }
  function make(d: number, D: Day, energyLeft: { v: number }, nights: boolean) {
    const busy = new Set<string>()
    for (let n = 0; n < 40; n++) {
      const rc = bestRecipe(energyLeft.v, nights, busy); if (!rc) break
      let cost = (rc.cells ?? 0) * CELL; for (const x of rc.inputs) cost += take(x.id, x.qty)
      cash -= (rc.cells ?? 0) * CELL; D.jobs++
      if (nights) { busy.add(rc.machine); night.push({ day: d + 1, outs: rc.outputs, cost }) }
      else { energyLeft.v -= rc.energy ?? 0; D.energy += rc.energy ?? 0; const t = worthOf(rc.outputs) || 1; for (const o of rc.outputs) add(o.id, o.qty, cost * val(o.id) * o.qty / t) }
    }
  }

  // what a purchase unlocks: the best few recipes it makes runnable (that we can plausibly feed), per credit
  const sourced = new Set<string>([...stock.keys(), ...S.residents.flatMap((x: any) => x.sells ?? []), ...S.items.filter((i: any) => i.inflow).map((i: any) => i.id)])
  function score(u: any) {
    const m2 = new Set([...owned, ...(u.grants ?? []).filter((g: string) => g.startsWith('mach_'))]), d2 = new Set([...discs, ...(u.grants ?? []).filter((g: string) => g.startsWith('disc_'))])
    const ms = S.recipes.filter((rc: any) => m2.has(rc.machine) && (!rc.disc || d2.has(rc.disc)) && !(owned.has(rc.machine) && (!rc.disc || discs.has(rc.disc))) && rc.outputs?.length && rc.inputs.every((x: any) => sourced.has(x.id)))
      .map((rc: any) => worthOf(rc.outputs) - worthOf(rc.inputs) - (rc.cells ?? 0) * CELL).filter((m: number) => m > 0).sort((a: number, b: number) => b - a)
    return ms.slice(0, 3).reduce((a: number, b: number) => a + b, 0)
  }
  function shop(d: number, D: Day) {
    for (let k = 0; k < 3; k++) {
      let best: any = null, bs = 0
      for (const u of S.upgrades) {
        const price = u.cost?.credits ?? 0
        if (ups.has(u.id) || price > cash - 15 || !(u.grants ?? []).length || !(u.requires ?? []).every((q: string) => q.startsWith('phase_') || owned.has(q) || ups.has(q) || discs.has(q))) continue
        if ((u.grants as string[]).every(g => owned.has(g) || discs.has(g))) continue
        const s = score(u) / price; if (s > bs) { best = u; bs = s }
      }
      if (!best) return
      cash -= best.cost.credits; ups.add(best.id); D.bought++; if (firstBuy < 0) firstBuy = d
      for (const g of best.grants) { if (g.startsWith('mach_')) owned.add(g); else if (g.startsWith('disc_')) discs.add(g) }
    }
  }

  for (let d = 0; d < DAYS; d++) {
    const D: Day = { cash: 0, net: 0, walkin: 0, orderPay: 0, filled: 0, expired: 0, missed: 0, jobs: 0, energy: 0, stockValue: 0, machines: 0, bought: 0 }
    const before = cash + worth() + inflight()
    const energy = { v: capEnergy }
    refreshFeeds()
    for (const j of night.filter(j => j.day <= d)) { const t = worthOf(j.outs) || 1; for (const o of j.outs) add(o.id, o.qty, j.cost * val(o.id) * o.qty / t) }
    night = night.filter(j => j.day > d)
    for (const p of pay.filter(p => p.day <= d)) { cash += p.amt; D.orderPay += p.amt }
    pay = pay.filter(p => p.day > d)
    if (policy !== 'walkin') {
      for (let k = Math.round(between(r, PH.orders_per_day)); k > 0 && pending.length < 8; k--) { const def = weighted(r, orderDefs, (o: any) => o.weight ?? 1); pending.push({ def, due: d + (def.due_days ?? 5) }) }
      for (const o of pending.filter(o => o.due < d)) D.expired++
      pending = pending.filter(o => o.due >= d)
      fill(d, D); if (policy === 'maker') make(d, D, energy, false)
    }
    const n = Math.round(between(r, PH.customers_per_day) * CUSTOMERS)
    for (let c = 0; c < n; c++) {
      const res = cast[Math.floor(r() * cast.length)]
      const role = weighted(r, ['buyer', 'seller', 'trader'], (k: string) => (res.roles[k] ?? 0) * (k === 'seller' ? SELLERS : 1))
      if (role === 'seller') {
        const sells = res.sells ?? []; if (!sells.length) continue
        let ask = 0; const goods: string[] = []
        for (let k = 1 + Math.floor(r() * 3); k > 0; k--) { const id = weighted(r, sells, (x: string) => 1 / Math.sqrt(1 + val(x))); goods.push(id); ask += val(id) * (1 - around(r, 0.2, 0.05, 0, 0.4)) }
        const total = goods.reduce((n2, g) => n2 + val(g), 0), wanted = goods.some(g => need(g) > 0)
        if (cash < ask || ask < 0.01) continue
        if (goods.reduce((n2, g) => n2 + (demanded(g) ? val(g) : 0), 0) < 0.7 * total) continue
        if (policy !== 'walkin' && ask > (wanted ? 1.0 : 0.85) * total) continue
        if (policy === 'walkin' && ask > 0.97 * total) continue
        cash -= ask; for (const g of goods) add(g, 1, ask * val(g) / (total || 1))
      } else {
        // a buyer wants needs (food, parts...); any spare thing that serves the need and they would not avoid will do, the dearest they can afford
        let budget = between(r, res.budget) * (PH.budget_scale ?? 1)
        const needs = Object.keys(res.wants), nw = (k: string) => res.wants[k] ?? 0
        for (let k = 1 + Math.floor(r() * 3); k > 0; k--) {
          const want = weighted(r, needs, nw)
          const m = around(r, 0.25, 0.06, 0, 0.6)
          let pick: string | null = null, pp = 0
          for (const [id, st] of stock) {
            const it = I[id]; if (!it || it.market_need !== want || st.q - reserved(id) < 1 || it.tags?.some((t: string) => (res.avoids_tags ?? []).includes(t))) continue
            const price = Math.min(val(id) * (1 + m) * ((res.buys ?? []).includes(id) || it.tags?.some((t: string) => (res.prefers_tags ?? []).includes(t)) ? 1.1 : 1), budget)
            if (price < 1 || (policy !== 'walkin' && price < st.c / st.q * 1.05)) continue
            if (price > pp) { pick = id; pp = price }
          }
          if (!pick) { D.missed++; continue }
          take(pick, 1); cash += pp; budget -= pp; D.walkin += pp
        }
      }
      if (policy !== 'walkin') { fill(d, D); if (policy === 'maker') make(d, D, energy, false) }
    }
    if (policy === 'maker') { make(d, D, energy, false); make(d, D, energy, true); shop(d, D) }
    cash -= PH.rent_per_day ?? 0
    D.cash = cash; D.stockValue = worth(); D.machines = owned.size; D.net = cash + worth() + inflight() - before
    days.push(D)
  }
  return { days, firstBuy, owned: [...ups] }
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1)
const med = (xs: number[]) => [...xs].sort((a, b) => a - b)[xs.length >> 1]
const pad = (s: any, n: number) => String(s).padStart(n)
console.log(`phase ${P}: ${DAYS} days, ${RUNS} runs, ${S.items.length} items, ${S.recipes.length} recipes, ${S.orders.length} orders, rent ${PH.rent_per_day}/day, ${PH.customers_per_day} customers, ${PH.orders_per_day} orders a day\n`)
for (const policy of ['walkin', 'orders', 'maker'] as Policy[]) {
  const res = Array.from({ length: RUNS }, (_, i) => runOne(policy, 1000 + i))
  console.log(`== ${policy} ==`)
  console.log(' day   cash    net  walkin  ordPay  filled expired missed jobs  energy  machines bought')
  for (const d of [0, 1, 2, 3, 5, 7, 9, 11, DAYS - 1].filter((x, i, a) => x < DAYS && a.indexOf(x) === i)) {
    const f = (k: keyof Day) => mean(res.map(x => x.days[d][k]))
    console.log(`${pad(d + 1, 4)} ${pad(f('cash').toFixed(0), 6)} ${pad(f('net').toFixed(1), 6)} ${pad(f('walkin').toFixed(1), 7)} ${pad(f('orderPay').toFixed(1), 7)} ${pad(f('filled').toFixed(1), 7)} ${pad(f('expired').toFixed(1), 7)} ${pad(f('missed').toFixed(1), 6)} ${pad(f('jobs').toFixed(1), 4)} ${pad(f('energy').toFixed(1), 7)} ${pad(f('machines').toFixed(1), 8)} ${pad(f('bought').toFixed(2), 6)}`)
  }
  const fin = res.map(x => x.days[DAYS - 1].cash), broke = res.filter(x => x.days.some(d => d.cash < 0)).length
  const fb = res.map(x => x.firstBuy).filter(x => x >= 0)
  console.log(`final cash: median ${med(fin).toFixed(0)}, p10 ${[...fin].sort((a, b) => a - b)[Math.floor(RUNS * .1)].toFixed(0)}, p90 ${[...fin].sort((a, b) => a - b)[Math.floor(RUNS * .9)].toFixed(0)}; runs that went negative: ${broke}`)
  if (policy === 'maker') {
    const c: Record<string, number> = {}; for (const x of res) for (const u of x.owned) c[u] = (c[u] ?? 0) + 1
    console.log(`first purchase on day ${fb.length ? med(fb) + 1 : 'never'} (${fb.length}/${RUNS} runs); most bought: ${Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k.replace('upg_', '')} ${(100 * v / RUNS).toFixed(0)}%`).join(', ')}`)
  }
  console.log()
}
