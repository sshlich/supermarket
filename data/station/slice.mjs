// node slice.mjs [phase=1]  ->  slices/phase<N>.json: just what exists up to that phase, plus a printed summary.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
const dir = new URL('.', import.meta.url), P = +(process.argv[2] ?? 1)
const load = f => JSON.parse(readFileSync(new URL(f, dir), 'utf8'))
const all = p => readdirSync(dir).filter(f => f.startsWith(p) && f.endsWith('.json') && !f.includes('example')).flatMap(load)
const ph = s => +String(s ?? '').slice(-1) || 0
const items = all('items.'), recipes = all('recipes.'), discs = all('discs.'), machines = load('machines.json')
const upgrades = load('upgrades.json'), orders = load('orders.json'), events = load('events.json'), residents = load('residents.json'), start = load('start.json')
const mach = new Set(machines.filter(m => ph(m.phase) <= P).map(m => m.id))
const rec = recipes.filter(r => ph(r.phase) <= P && mach.has(r.machine))
const res = residents.filter(r => ph(r.phase_from) <= P)
const have = new Set(start.things.map(t => t.id))
for (const i of items) if (i.inflow && ph(i.inflow.phase) <= P) have.add(i.id)
for (const r of res) for (const s of r.sells ?? []) have.add(s)
let grew = true; while (grew) { grew = false; for (const r of rec) if ((r.inputs ?? []).every(x => have.has(x.id)) ) for (const o of r.outputs ?? []) if (!have.has(o.id)) { have.add(o.id); grew = true } }
const I = Object.fromEntries(items.map(i => [i.id, i]))
const ord = orders.filter(o => ph(o.phase_from) <= P && ph(o.phase_to ?? 'phase_4') >= P)
const ownable = ord.filter(o => (o.wants ?? []).every(w => !w.id || have.has(w.id)))
const slice = {
  phase: P, start,
  machines: machines.filter(m => mach.has(m.id)), recipes: rec, items: items.filter(i => have.has(i.id)),
  discs: discs.filter(d => ph(d.phase) <= P), upgrades: upgrades.filter(u => ph(u.phase) <= P),
  residents: res, orders: ord, events: events.filter(e => ph(e.phase_from) <= P),
}
writeFileSync(new URL(`slices/phase${P}.json`, dir), JSON.stringify(slice, null, 1))
const val = o => (o.wants ?? []).reduce((s, w) => s + (I[w.id]?.value ?? 0) * (w.qty ?? 1), 0)
const ov = ord.map(val).filter(Boolean).sort((a, b) => a - b), cost = slice.upgrades.map(u => u.cost?.credits ?? 0).sort((a, b) => a - b)
console.log(`phase ${P}: ${slice.items.length} items you can hold, ${rec.length} recipes on ${mach.size} machines, ${res.length} residents, ${ord.length} orders (${ownable.length} fully fillable), ${slice.events.length} events`)
console.log(`order want-value: min ${ov[0]}, median ${ov[ov.length >> 1]}, max ${ov.at(-1)}; upgrades: ${cost.length}, cheapest ${cost[0]}, median ${cost[cost.length >> 1]}, total ${cost.reduce((a, b) => a + b, 0)}`)
console.log('not fillable:', ord.filter(o => !ownable.includes(o)).map(o => o.id + ':' + o.wants.filter(w => w.id && !have.has(w.id)).map(w => w.id).join('+')).join(' | ') || 'none')
