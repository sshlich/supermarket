// Builds graph.json (nodes + edges) from the data files, for a viewer. Usage: node graph.mjs > graph.json
import { readFileSync, readdirSync } from 'node:fs'
const load = f => JSON.parse(readFileSync(new URL(f, import.meta.url), 'utf8'))
const files = readdirSync(new URL('.', import.meta.url)).filter(f => f.endsWith('.json') && !f.includes('example'))
const all = p => files.filter(f => f.startsWith(p)).flatMap(f => load(f))
const items = all('items.'), recipes = all('recipes.'), discs = all('discs.'), upgrades = load('upgrades.json')
const machines = load('machines.json'), programs = load('programs.json'), residents = load('residents.json'), needs = load('needs.json')
const ph = s => +String(s ?? '').replace('phase_', '') || 0
const nodes = new Map(), edges = []
const node = (id, type, name, extra = {}) => nodes.set(id, { id, type, name, ...extra })
const edge = (s, t, kind, extra = {}) => { if (nodes.has(s) && nodes.has(t) && s !== t) edges.push({ s, t, kind, ...extra }) }
const producedAt = {}
for (const r of recipes) for (const o of r.outputs ?? []) producedAt[o.id] = Math.min(producedAt[o.id] ?? 9, ph(r.phase))
for (const i of items) node(i.id, 'item', i.name, { dom: i.id.split('_')[1], tier: i.tier, value: i.value, ph: Math.min(producedAt[i.id] ?? 9, i.inflow ? ph(i.inflow.phase) : 9) % 9 || ph(i.inflow?.phase) || i.tier, contra: !!i.contraband })
for (const m of machines) node(m.id, 'machine', m.name, { ph: ph(m.phase), tier: m.tier })
for (const d of discs) node(d.id, 'disc', d.name, { ph: ph(d.phase), tier: d.tier, contra: !!d.contraband })
for (const p of programs) node(p.id, 'program', p.name, { ph: ph(p.phase) })
for (const u of upgrades) node(u.id, 'upgrade', u.name, { ph: ph(u.phase), cost: u.cost?.credits })
for (const n of needs) node(n.id, 'need', n.name)
for (const r of residents) node(r.id, 'resident', r.name, { ph: ph(r.phase_from) })
const seen = new Set(), once = (k, f) => { if (!seen.has(k)) { seen.add(k); f() } }
for (const r of recipes) {
  for (const o of r.outputs ?? []) {
    for (const i of r.inputs ?? []) once(`mk|${i.id}|${o.id}|${r.machine}`, () => edge(i.id, o.id, 'make', { m: r.machine, r: r.id }))
    once(`mp|${r.machine}|${o.id}`, () => edge(r.machine, o.id, 'produces'))
    if (r.disc) once(`dk|${r.disc}|${o.id}`, () => edge(r.disc, o.id, 'recipe'))
  }
}
for (const u of upgrades) {
  for (const g of u.grants ?? []) edge(u.id, g, 'grants')
  for (const q of u.requires ?? []) if (!q.startsWith('phase_')) edge(q, u.id, 'requires')
}
for (const i of items) if (i.market_need) edge(i.id, i.market_need, 'serves')
for (const r of residents) { for (const s of r.sells ?? []) edge(r.id, s.id ?? s, 'sells'); for (const b of r.buys ?? []) edge(b.id ?? b, r.id, 'buys') }
for (const p of programs) for (const m of p.loads_into ?? p.machines ?? []) edge(p.id, m, 'runs on')
const deg = {}
for (const e of edges) { deg[e.s] = (deg[e.s] ?? 0) + 1; deg[e.t] = (deg[e.t] ?? 0) + 1 }
const out = [...nodes.values()].map(n => ({ ...n, deg: deg[n.id] ?? 0 }))
console.log(JSON.stringify({ nodes: out, edges }))
