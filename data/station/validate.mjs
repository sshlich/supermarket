#!/usr/bin/env node
// Validates the station data set against SEED.md: shape, IDs, references, pinned fields, mass balance, sources and
// sinks, reachability over the four phases, and the people/needs/decks wiring. No dependencies.
//
//   node data/station/validate.mjs              check the real files
//   node data/station/validate.mjs --examples   also load *.example.json for files that are missing
//   node data/station/validate.mjs --all        print every message (default: at most 40 per category)
//   node data/station/validate.mjs --strict     missing files and reserved-but-undefined IDs are errors
//   node data/station/validate.mjs --mine=items.food.json,recipes.food.json   only messages about your files
//
// Exit code 1 when there are errors.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const ARGS = new Set(process.argv.slice(2))
const EXAMPLES = ARGS.has('--examples'), ALL = ARGS.has('--all'), STRICT = ARGS.has('--strict')
const CAP = ALL ? Infinity : 40
// --mine=items.food.json,recipes.food.json : only print messages about IDs defined in (or naming) those files
const MINE = (process.argv.find(a => a.startsWith('--mine=')) || '').slice(7).split(',').filter(Boolean)

// ------------------------------------------------------------------ messages
const msgs = { error: new Map(), warn: new Map() }
const add = (lvl, cat, where, text) => { const m = msgs[lvl]; if (!m.has(cat)) m.set(cat, []); m.get(cat).push(`${where}: ${text}`) }
const err = (cat, where, text) => add('error', cat, where, text)
const warn = (cat, where, text) => add('warn', cat, where, text)

// ------------------------------------------------------------------ the registry
let IDS
try { IDS = JSON.parse(fs.readFileSync(path.join(DIR, 'ids.json'), 'utf8')) }
catch (e) { console.error(`FATAL: cannot read ids.json (${e.message})`); process.exit(1) }

const PREFIX = { material: 'mat_', need: 'need_', system: 'sys_', deck: 'deck_', phase: 'phase_', box: 'box_', carrier: 'ctier_', item: 'it_', recipe: 'rcp_', disc: 'disc_', machine: 'mach_', status: 'stat_', modifier: 'mod_', program: 'prog_', upgrade: 'upg_', resident: 'res_', org: 'org_', order: 'ord_', event: 'evt_' }
const TYPE_OF_PREFIX = Object.fromEntries(Object.entries(PREFIX).map(([t, p]) => [p, t]))
const typeOfId = id => { const m = /^([a-z]+_)/.exec(id); return m ? TYPE_OF_PREFIX[m[1]] : undefined }
const REF = /^(mat|need|sys|deck|phase|box|ctier|it|rcp|disc|mach|stat|mod|prog|upg|res|org|ord|evt)_[a-z0-9_]+$/
const ID_FORM = /^[a-z][a-z0-9_]*$/

const SINGLETONS = { 'materials.json': 'material', 'needs.json': 'need', 'systems.json': 'system', 'decks.json': 'deck', 'phases.json': 'phase', 'boxes.json': 'box', 'carriers.json': 'carrier', 'machines.json': 'machine', 'statuses.json': 'status', 'modifiers.json': 'modifier', 'programs.json': 'program', 'upgrades.json': 'upgrade', 'residents.json': 'resident', 'orgs.json': 'org', 'orders.json': 'order', 'events.json': 'event', 'start.json': 'start' }
const DOMAIN_FILE = /^(items|recipes|discs)\.([a-z]+)\.json$/
const DOMAINS = Object.keys(IDS.domains || {})
const PHASES = (IDS.phases || []).map(p => p.id)
const phaseIdx = p => { const i = PHASES.indexOf(p); return i < 0 ? null : i + 1 }
const STAT_KEYS = new Set((IDS.stats || []).map(s => s.key))
const TAGS = new Set(IDS.tags || [])
const CHANNELS = new Set(Object.keys(IDS.inflow_channels || {}))
const CONTRA = new Set(IDS.contraband_classes || [])
const MATS = Object.fromEntries((IDS.materials || []).map(m => [m.id, m]))
const MEDIA = IDS.media || {}

// reserved: id -> { type, pin }
const reserved = new Map()
const reserve = (list, type, f = x => x) => { for (const x of list || []) reserved.set(x.id, { type, pin: f(x) }) }
reserve(IDS.materials, 'material'); reserve(IDS.needs, 'need'); reserve(IDS.decks, 'deck'); reserve(IDS.phases, 'phase')
reserve(IDS.systems, 'system'); reserve(IDS.boxes, 'box'); reserve(IDS.carrier_tiers, 'carrier'); reserve(IDS.residents, 'resident')
reserve(IDS.orgs, 'org'); reserve(IDS.machines, 'machine'); reserve(IDS.items, 'item'); reserve(IDS.programs, 'program')
reserve(IDS.statuses, 'status'); reserve(IDS.modifiers, 'modifier')
reserve(IDS.discs, 'disc', d => ({ ...d, w: MEDIA[d.media]?.w, h: MEDIA[d.media]?.h, composition: MEDIA[d.media]?.composition }))

// ------------------------------------------------------------------ load files
const present = fs.readdirSync(DIR)
const expected = new Set(Object.values(IDS.domains || {}).flatMap(d => d.files || []))
const files = []        // { name, type, domain, data, example }
const fileStatus = []   // for the summary
const loadOne = (name, real) => {
  const type = SINGLETONS[name] ?? (DOMAIN_FILE.exec(name)?.[1] === 'items' ? 'item' : DOMAIN_FILE.exec(name)?.[1] === 'recipes' ? 'recipe' : DOMAIN_FILE.exec(name)?.[1] === 'discs' ? 'disc' : null)
  const domain = DOMAIN_FILE.exec(name)?.[2] ?? null
  let data
  try { data = JSON.parse(fs.readFileSync(path.join(DIR, real), 'utf8')) }
  catch (e) { err('json', real, `does not parse: ${e.message}`); fileStatus.push({ name, state: 'BAD JSON', n: 0 }); return }
  if (type === 'start') { if (!data || Array.isArray(data) || typeof data !== 'object') { err('shape', real, 'must be one object'); return } }
  else if (!Array.isArray(data)) { err('shape', real, 'must be a JSON array of objects'); fileStatus.push({ name, state: 'BAD SHAPE', n: 0 }); return }
  if (domain && !DOMAINS.includes(domain)) warn('files', real, `unknown domain "${domain}"`)
  files.push({ name, real, type, domain, data, example: real !== name })
  fileStatus.push({ name, state: real !== name ? 'example' : 'ok', n: type === 'start' ? 1 : data.length })
}
const candidates = new Set([...expected, ...present.filter(f => (SINGLETONS[f] || DOMAIN_FILE.test(f)))])
for (const name of [...candidates].sort()) {
  if (present.includes(name)) loadOne(name, name)
  else if (EXAMPLES && present.includes(name.replace(/\.json$/, '.example.json'))) loadOne(name, name.replace(/\.json$/, '.example.json'))
  else { fileStatus.push({ name, state: 'MISSING', n: 0 }); if (STRICT) err('files', name, 'missing') }
}
if (EXAMPLES) for (const f of present.filter(f => f.endsWith('.example.json'))) {
  const base = f.replace(/\.example\.json$/, '.json')
  if (!candidates.has(base)) loadOne(base, f)
}
for (const f of present) if (f.endsWith('.json') && f !== 'ids.json' && !f.endsWith('.example.json') && !candidates.has(f)) warn('files', f, 'not a recognised data file name (ignored)')

// ------------------------------------------------------------------ index entities
const defs = new Map() // id -> { type, file, o, domain }
let START = null
const byType = t => [...defs.values()].filter(d => d.type === t)
for (const f of files) {
  if (f.type === 'start') { START = f.data; continue }
  f.data.forEach((o, i) => {
    const where = `${f.real}[${i}]`
    if (!o || typeof o !== 'object' || Array.isArray(o)) { err('shape', where, 'entry is not an object'); return }
    if (typeof o.id !== 'string') { err('shape', where, 'missing string id'); return }
    if (!ID_FORM.test(o.id) || o.id.length > 40) err('ids', o.id, 'bad id form (lowercase snake_case, <= 40 chars)')
    const pre = PREFIX[f.type]
    if (!o.id.startsWith(pre)) err('ids', o.id, `wrong prefix for ${f.real} (want ${pre})`)
    if (f.domain && ['item', 'recipe', 'disc'].includes(f.type)) {
      const want = `${pre}${f.domain}_`
      if (!o.id.startsWith(want)) err('ids', o.id, `outside the domain prefix ${want}`)
    }
    if (defs.has(o.id)) err('ids', o.id, `duplicate (also in ${defs.get(o.id).file})`)
    else defs.set(o.id, { type: f.type, file: f.real, o, domain: f.domain })
  })
}
const known = id => defs.has(id) || reserved.has(id)
const get = id => defs.get(id)?.o ?? reserved.get(id)?.pin
const isDefined = id => defs.has(id)

// ------------------------------------------------------------------ schema
const T = {
  str: v => typeof v === 'string' && v.length > 0,
  num: v => typeof v === 'number' && Number.isFinite(v),
  int: v => Number.isInteger(v),
  bool: v => typeof v === 'boolean',
  arr: v => Array.isArray(v),
  obj: v => !!v && typeof v === 'object' && !Array.isArray(v),
  tier: v => [1, 2, 3, 4].includes(v),
  depth: v => [0, 1, 2, 3, 4].includes(v),
  phase: v => PHASES.includes(v),
  ref: v => typeof v === 'string' && REF.test(v),
  refOrNull: v => v === null || (typeof v === 'string' && REF.test(v)),
  comp: v => T.obj(v) && Object.entries(v).every(([k, n]) => k.startsWith('mat_') && T.num(n) && n > 0),
  numOrNull: v => v === null || T.num(v),
  contra: v => v === false || v === undefined || CONTRA.has(v),
}
const en = (...vals) => Object.assign(v => vals.includes(v), { vals })
const THING = { id: 'str', name: 'str', desc: 'str', w: 'int', h: 'int', tier: 'tier', value: 'num', composition: 'comp', tags: 'arr' }
const SPEC = {
  material: { id: 'str', name: 'str', desc: 'str', state: en('solid', 'liquid', 'gas'), base_value: 'num', unit_item: 'ref' },
  need: { id: 'str', name: 'str', desc: 'str', gauge_start: 'num', per_capita: 'num', systems: 'arr' },
  system: { id: 'str', name: 'str', desc: 'str', deck: 'ref', supply: 'arr' },
  deck: { id: 'str', name: 'str', desc: 'str', wealth: 'num', population_share: 'num', transit_days: 'num', wants: 'obj' },
  phase: { id: 'str', name: 'str', budget_scale: 'num' },
  box: { ...THING, inner_w: 'int', inner_h: 'int', price: 'num', fee: 'num' },
  carrier: { id: 'str', name: 'str', spend: 'num', pickups_per_day: 'num', fee_mult: 'num' },
  item: { ...THING, depth: 'depth', market_need: 'ref' },
  machine: { ...THING, kind: en('produce', 'modify', 'do'), phase: 'phase', tray: 'bool', max_inputs: 'int', slots: 'arr' },
  recipe: { id: 'str', name: 'str', kind: en('produce', 'modify', 'do'), machine: 'ref', disc: 'refOrNull', inputs: 'arr', energy: 'int', cells: 'num', time: en('instant', 'job', 'nights'), phase: 'phase' },
  disc: { ...THING, kind: en('recipe', 'blueprint', 'program', 'blank', 'data'), media: en(...Object.keys(MEDIA)), phase: 'phase', machines: 'arr' },
  program: { id: 'str', name: 'str', file: 'str', desc: 'str', size_kb: 'num', memory_kb: 'num', runs_on: 'arr', phase: 'phase' },
  status: { id: 'str', name: 'str', desc: 'str', applies_to: en('machine', 'player', 'station') },
  modifier: { id: 'str', name: 'str', desc: 'str' },
  upgrade: { id: 'str', name: 'str', desc: 'str', phase: 'phase', kind: en('capability', 'information', 'space', 'handling', 'energy', 'logistics', 'channel', 'security', 'cosmetic'), cost: 'obj', requires: 'arr', delivery: en('crate', 'mail', 'instant') },
  resident: { id: 'str', name: 'str', deck: 'ref', desc: 'str', phase_from: 'phase', roles: 'obj', budget: 'arr', wants: 'obj', sells: 'arr', contraband: en('buys', 'sells', 'both', 'reports', 'none') },
  org: { id: 'str', name: 'str', desc: 'str' },
  order: { id: 'str', name: 'str', kind: en('order', 'bulk', 'rush', 'standing', 'charity', 'repair', 'black', 'tithe', 'memo', 'spam'), sender: 'ref', deck: 'ref', phase_from: 'phase', wants: 'arr', price_mult: 'num', due_days: 'int', boxes: 'arr' },
  event: { id: 'str', name: 'str', kind: en('breakdown', 'convoy', 'strike', 'blockade', 'festival', 'epidemic', 'policy', 'accident', 'raid', 'inspection', 'macro', 'windfall'), phase_from: 'phase', weight: 'num', duration_days: 'num', shocks: 'arr' },
}
const OPTIONAL = { // checked only when present
  item: { needs: 'obj', decks: 'obj', value_basis: en('craft', 'rarity'), contraband: 'contra', heirloom: 'bool', inflow: 'obj', wear: 'obj', use: 'obj', cell: 'obj', container: 'obj', fixture: 'obj', recyclable: 'bool', mods: 'arr' },
  recipe: { tools: 'arr', outputs: 'arr', loss: 'comp', nights: 'int', credits: 'num', target: 'obj', mods_add: 'arr', mods_remove: 'arr', effects: 'arr', clears: 'arr', risks: 'obj' },
  disc: { programs: 'arr', copyable: 'bool', licensed: 'bool', contraband: 'contra', found: 'arr', data_effects: 'arr' },
  machine: { transmutes: 'arr', port: 'bool', virtual: 'bool', cells_per_job: 'num', energy_per_job: 'int', jobs: 'arr', statuses: 'arr', consumables: 'arr', effects: 'arr', requires: 'arr' },
  upgrade: { grants: 'arr', effects: 'arr', tiers: 'arr', payback_days: 'num' },
  program: { licensed: 'bool', rom: 'bool', loads_into: 'arr', effects: 'arr', requires: 'arr', contraband: 'contra', novelty: 'bool' },
  status: { effects: 'arr', duration_days: 'numOrNull', caused_by: 'arr', cleared_by: v => v === 'sleep' || Array.isArray(v) },
  modifier: { applies_to_tags: 'arr', value_mult: 'num', effects: 'arr', hidden: 'bool', contraband: 'contra', applied_by: 'arr', removed_by: 'arr' },
  order: { attachments: 'arr', recurring_days: v => v === null || Number.isInteger(v), contraband: 'contra', weight: 'num', late: 'obj', penalty: 'obj' },
  event: { systems: 'arr', decks: 'arr', effects: 'arr', spawns_orders: 'arr', rumor: v => v === null || T.obj(v), followups: 'arr', requires: 'arr' },
}
const checkField = (where, k, v, t) => {
  const f = typeof t === 'function' ? t : T[t]
  if (!f(v)) err('schema', where, `field "${k}" ${v === undefined ? 'is missing' : `has a bad value ${JSON.stringify(v).slice(0, 60)}`}${t.vals ? ` (allowed: ${t.vals.join('|')})` : ''}`)
}
for (const [id, d] of defs) {
  const spec = SPEC[d.type]; if (!spec) continue
  for (const [k, t] of Object.entries(spec)) checkField(id, k, d.o[k], t)
  for (const [k, t] of Object.entries(OPTIONAL[d.type] || {})) if (d.o[k] !== undefined) checkField(id, k, d.o[k], t)
  if (typeof d.o.desc === 'string' && d.o.desc.length > 110) warn('style', id, `desc is ${d.o.desc.length} chars (max 110)`)
  if (typeof d.o.desc === 'string' && /—/.test(d.o.desc)) warn('style', id, 'desc uses an em dash')
}
if (START) for (const [k, t] of Object.entries({ credits: 'num', energy_cap: 'int', phase: 'phase', carrier: 'ref', field: 'obj', dock: 'obj', things: 'arr' })) checkField('start.json', k, START[k], t)

// ------------------------------------------------------------------ references, stats, tags
const TEXT_KEYS = new Set(['name', 'desc', 'notes', 'text', 'label', 'file', 'brief', 'mail_text', 'lines', 'shortage_text', 'glut_text', 'unlock_text', 'carried_from', 'stat', 'tags', 'prefers_tags', 'avoids_tags', 'accepts_tags', 'applies_to_tags', 'adds_tags', 'removes_tags', 'id'])
const TAG_KEYS = new Set(['tags', 'prefers_tags', 'avoids_tags', 'accepts_tags', 'applies_to_tags', 'adds_tags', 'removes_tags'])
const unknownTags = new Map()
function walk(v, key, where, root) {
  if (TAG_KEYS.has(key) && Array.isArray(v)) { for (const t of v) if (!TAGS.has(t)) unknownTags.set(t, (unknownTags.get(t) || 0) + 1); return }
  if (key === 'tag' && typeof v === 'string') { if (!TAGS.has(v)) unknownTags.set(v, (unknownTags.get(v) || 0) + 1); return }
  if (TEXT_KEYS.has(key) && !(key === 'id' && !root)) return
  if (typeof v === 'string') { if (REF.test(v) && !known(v)) err('refs', where, `unknown reference ${v}`); return }
  if (Array.isArray(v)) { v.forEach(x => walk(x, key, where, false)); return }
  if (v && typeof v === 'object') {
    if ('stat' in v) {
      if (!STAT_KEYS.has(v.stat)) err('effects', where, `unknown stat "${v.stat}" (see ids.json stats)`)
      if (!['add', 'mul', 'set'].includes(v.op)) err('effects', where, `effect op "${v.op}" must be add|mul|set`)
      if (!T.num(v.value)) err('effects', where, `effect value must be a number (stat ${v.stat})`)
    }
    for (const [k, x] of Object.entries(v)) {
      if (REF.test(k) && !known(k)) err('refs', where, `unknown reference ${k} (as a key)`)
      walk(x, k, where, false)
    }
  }
}
for (const [id, d] of defs) for (const [k, v] of Object.entries(d.o)) if (k !== 'id') walk(v, k, id, false)
if (START) walk(START, '', 'start.json', false)
for (const [t, n] of unknownTags) warn('tags', `tag "${t}"`, `not in ids.json tags (${n} uses)`)

// ------------------------------------------------------------------ pinned fields
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const sameComp = (a = {}, b = {}) => { const ks = new Set([...Object.keys(a), ...Object.keys(b)]); return [...ks].every(k => Math.abs((a[k] || 0) - (b[k] || 0)) < 1e-9) }
const sameSet = (a = [], b = []) => same([...a].sort(), [...b].sort())
const pairKey = ps => (ps || []).map(p => p.join('>')).sort().join(',')
const PINS = {
  item: ['w', 'h', 'tier', 'depth', 'value', '#composition'],
  machine: ['kind', 'phase', 'tray', 'max_inputs', '~port', '~generic', '~virtual', '@transmutes'],
  disc: ['kind', 'media', 'phase', 'w', 'h', '#composition', '%machines', '%programs'],
  box: ['w', 'h', 'inner_w', 'inner_h', 'price', 'fee', '#composition'],
  material: ['state', 'base_value', 'unit_item'],
  deck: ['wealth', 'population_share', 'transit_days'],
  phase: ['net_per_day', 'bank', 'rent_per_day', 'typical_item_value', 'upgrade_cost', 'customers_per_day'],
  carrier: ['spend'], resident: ['deck'], need: ['%old_tags'], system: ['deck'],
}
for (const [id, d] of defs) {
  const r = reserved.get(id); if (!r) continue
  if (r.type !== d.type) { err('pinned', id, `reserved as a ${r.type}, defined as a ${d.type}`); continue }
  for (const spec of PINS[d.type] || []) {
    const mode = /^[#~@%]/.test(spec) ? spec[0] : '', k = mode ? spec.slice(1) : spec
    const a = d.o[k], b = r.pin[k]
    const ok = mode === '#' ? sameComp(a, b) : mode === '~' ? (a ?? false) === (b ?? false) : mode === '@' ? pairKey(a) === pairKey(b) : mode === '%' ? sameSet(a, b) : same(a, b)
    if (!ok) err('pinned', id, `"${k}" is ${JSON.stringify(a)}, ids.json pins ${JSON.stringify(b)}`)
  }
  if (d.type === 'program' && r.pin.existing && d.o.file !== r.pin.file) err('pinned', id, `file must stay ${r.pin.file}`)
  if (d.type === 'system' && Array.isArray(d.o.supply) && !sameSet(d.o.supply.map(s => s.need), r.pin.needs)) err('pinned', id, `supply needs must be ${r.pin.needs.join(', ')}`)
}
// the owner must define what is reserved to it
const reservedUndefined = []
const fileOwnerLoaded = id => {
  const t = reserved.get(id).type
  const dom = ['item', 'disc'].includes(t) ? reserved.get(id).pin.owner : null
  const name = dom ? `${t === 'item' ? 'items' : 'discs'}.${dom}.json` : Object.entries(SINGLETONS).find(([, v]) => v === t)?.[0]
  return files.some(f => f.name === name)
}
for (const id of reserved.keys()) if (!defs.has(id) && fileOwnerLoaded(id)) reservedUndefined.push(id)
if (STRICT) for (const id of reservedUndefined) err('reserved', id, 'reserved but not defined by its owner file')
else {
  const byFile = new Map()
  for (const id of reservedUndefined) { const t = reserved.get(id).type, dom = reserved.get(id).pin.owner; const f = ['item', 'disc'].includes(t) ? `${t}s.${dom}.json` : Object.entries(SINGLETONS).find(([, v]) => v === t)?.[0]; byFile.set(f, [...(byFile.get(f) || []), id]) }
  for (const [f, ids] of byFile) warn('reserved', f, `${ids.length} reserved IDs not defined yet: ${ids.slice(0, 6).join(', ')}${ids.length > 6 ? ', ...' : ''}`)
}

// ------------------------------------------------------------------ helpers over things
const machineOf = id => get(id)
const compOf = id => {
  const o = get(id); if (!o) return null
  if (o.composition) return o.composition
  if (o.media && MEDIA[o.media]) return MEDIA[o.media].composition
  return null
}
const units = c => Object.values(c || {}).reduce((s, n) => s + n, 0)
const matValue = c => Object.entries(c || {}).reduce((s, [m, n]) => s + n * (MATS[m]?.base_value ?? 0), 0)
const valueOf = id => get(id)?.value ?? 0
const tagsOf = id => get(id)?.tags || []

// value rule for the registry itself and for defined items
const valueCheck = (where, o) => {
  if (o.value_basis === 'rarity' || !T.comp(o.composition) || !T.depth(o.depth)) return
  const exp = matValue(o.composition) * 4 ** o.depth
  if (exp > 0 && (o.value < exp * 0.3 || o.value > exp * 3)) warn('value', where, `value ${o.value} vs expected ~${exp.toFixed(2)} (materials x 4^depth); band 0.3x-3x`)
  const band = IDS.tiers?.[o.tier]?.value_band
  if (band && (o.value < band[0] || o.value > band[1])) warn('value', where, `value ${o.value} outside tier ${o.tier} band ${band.join('-')}`)
}
for (const it of IDS.items || []) if (!defs.has(it.id)) valueCheck(`[ids.json] ${it.id}`, it)
for (const d of byType('item')) valueCheck(d.o.id, d.o)
for (const m of IDS.materials || []) if (!(IDS.items || []).some(i => i.id === m.unit_item)) err('registry', m.id, `unit_item ${m.unit_item} is not a reserved item`)

// ------------------------------------------------------------------ recipes: machine, disc, mass, value
const UPGRADE_EXEMPT = new Set(IDS.upgrade_exempt_discs || [])
const TOL = n => Math.max(0.05 * n, 0.05)
for (const d of byType('recipe')) {
  const r = d.o, id = r.id, m = machineOf(r.machine)
  if (!m) continue // dangling machine already reported
  if (r.disc) {
    const dk = get(r.disc)
    if (!m.tray) err('recipes', id, `names disc ${r.disc} but ${r.machine} has no tray`)
    if (dk && Array.isArray(dk.machines) && !dk.machines.includes(r.machine)) err('recipes', id, `disc ${r.disc} does not list ${r.machine}`)
  }
  const inputs = Array.isArray(r.inputs) ? r.inputs : [], outputs = Array.isArray(r.outputs) ? r.outputs : []
  for (const q of [...inputs, ...outputs]) if (!T.int(q?.qty) || q.qty < 1) err('recipes', id, `qty for ${q?.id} must be an int >= 1`)
  if (Number.isInteger(m.max_inputs) && new Set(inputs.map(q => q.id)).size > m.max_inputs) err('recipes', id, `${new Set(inputs.map(q => q.id)).size} input lines, ${r.machine} takes ${m.max_inputs}`)
  if (r.time === 'instant' && !['mach_hands', 'mach_bench'].includes(r.machine)) err('recipes', id, 'time "instant" is only for mach_hands and mach_bench')
  if (r.machine === 'mach_hands' && (r.time !== 'instant' || r.energy !== 0 || r.cells !== 0)) err('recipes', id, 'hand recipes are instant, energy 0, cells 0')
  if (r.time === 'job' && !(r.energy >= 1)) err('recipes', id, 'a "job" costs at least 1 energy (it is free only overnight)')
  if (r.time === 'nights' && !(Number.isInteger(r.nights) && r.nights >= 1 && r.nights <= 7)) err('recipes', id, 'time "nights" needs nights 1-7')
  if (T.int(r.energy) && (r.energy < 0 || r.energy > 4)) err('recipes', id, 'energy must be 0-4')
  if (r.kind === 'produce' && !outputs.length) err('recipes', id, 'a produce recipe needs outputs')
  if (r.kind === 'modify' && !(r.target && (r.target.ids?.length || r.target.tags?.length))) err('recipes', id, 'a modify recipe needs target.ids or target.tags')
  if (r.kind === 'do' && !(r.effects?.length || r.clears?.length || outputs.length)) warn('recipes', id, 'a do recipe with no effects, clears or outputs does nothing')
  // mass
  const inM = {}, outM = {}, missing = []
  const addC = (acc, q, mult) => { const c = compOf(q.id); if (!c) { missing.push(q.id); return } for (const [k, n] of Object.entries(c)) acc[k] = (acc[k] || 0) + n * q.qty * mult }
  inputs.forEach(q => addC(inM, q, 1)); outputs.forEach(q => addC(outM, q, q.chance ?? 1))
  if (missing.length) { warn('mass', id, `cannot balance yet: no composition for ${[...new Set(missing)].join(', ')}`); continue }
  const lossU = units(r.loss), inU = units(inM), outU = units(outM)
  if (r.kind === 'produce') {
    if (Math.abs(inU - outU - lossU) > TOL(inU)) err('mass', id, `in ${inU.toFixed(2)} units, out ${outU.toFixed(2)} + loss ${lossU.toFixed(2)}`)
    if (lossU > 0.1 * inU + 1e-9 && !m.port) err('mass', id, `loss ${lossU.toFixed(2)} is over 10% of input (only port machines vent)`)
    const delta = {}
    for (const k of new Set([...Object.keys(inM), ...Object.keys(outM), ...Object.keys(r.loss || {})])) delta[k] = (outM[k] || 0) + (r.loss?.[k] || 0) - (inM[k] || 0)
    const pairs = m.transmutes || []
    let created = 0; const froms = new Set()
    for (const [k, dl] of Object.entries(delta)) if (dl > TOL(inM[k] || 0) && dl > 0.05) {
      const ok = pairs.filter(p => p[1] === k).map(p => p[0])
      if (!ok.length) err('mass', id, `creates ${dl.toFixed(2)} ${k} and ${r.machine} cannot transmute into it`)
      created += dl; ok.forEach(f => froms.add(f))
    }
    const consumed = [...froms].reduce((s, f) => s + Math.max(0, -(delta[f] || 0)), 0)
    if (created > 0 && created > consumed + TOL(inU)) err('mass', id, `creates ${created.toFixed(2)} units but its transmute sources only lose ${consumed.toFixed(2)}`)
    // value
    const vin = inputs.reduce((s, q) => s + valueOf(q.id) * q.qty, 0), vout = outputs.reduce((s, q) => s + valueOf(q.id) * q.qty * (q.chance ?? 1), 0)
    const exempt = ['mach_recycler', 'mach_digester', 'mach_vent', 'mach_crusher', 'mach_hands'].includes(r.machine)
    if (!exempt && vin > 0 && vout < 0.8 * vin) warn('value', id, `outputs worth ${vout.toFixed(2)} < 0.8 x inputs ${vin.toFixed(2)}`)
    if (!exempt && vin > 0 && vout > 6 * vin + 2) warn('value', id, `outputs worth ${vout.toFixed(2)} > 6 x inputs ${vin.toFixed(2)}`)
  } else if (outU > inU + TOL(inU)) err('mass', id, `${r.kind} recipe outputs ${outU.toFixed(2)} units from ${inU.toFixed(2)}`)
}

// ------------------------------------------------------------------ sources, sinks, reachability
const recipes = byType('recipe').map(d => d.o)
const items = byType('item').map(d => d.o)
const residents = byType('resident').map(d => d.o)
const orders = byType('order').map(d => d.o)
const upgrades = byType('upgrade').map(d => d.o)
const machines = byType('machine').map(d => d.o)
const discs = byType('disc').map(d => d.o)
const programs = byType('program').map(d => d.o)
const has = t => files.some(f => f.type === t)

const unitItemOfMat = Object.fromEntries((IDS.materials || []).map(m => [m.id, m.unit_item]))
const allThingsWithComp = () => [...defs.values()].filter(d => ['item', 'box', 'disc', 'machine'].includes(d.type)).map(d => d.o)
const ctierPhase = id => Math.min(4, Math.max(1, Number(id.split('_')[1]) || 1))
const recyclerKnown = known('mach_recycler')

const first = new Map() // id -> phase index first owned / run
const own = (id, k) => { if (!first.has(id)) { first.set(id, k); return true } return false }
const owned = (id, k) => id === 'mach_hands' || (first.has(id) && first.get(id) <= k)
const reqOk = (req, k) => (req || []).every(x => x.startsWith('phase_') ? (phaseIdx(x) ?? 9) <= k : x.startsWith('ctier_') ? ctierPhase(x) <= k : owned(x, k))
const thingPhaseOk = (id, k) => { const o = get(id); const p = o?.phase ? phaseIdx(o.phase) : 1; return (p ?? 1) <= k }

for (let k = 1; k <= 4; k++) {
  let changed = true, guard = 0
  while (changed && guard++ < 200) {
    changed = false
    const o = (id) => { if (own(id, k)) changed = true }
    o('mach_hands')
    if (START && (phaseIdx(START.phase) ?? 1) <= k) { (START.things || []).forEach(q => q?.id && o(q.id)); (START.programs || []).forEach(o); if (START.carrier) o(START.carrier) }
    for (const it of items) if (it.inflow && (phaseIdx(it.inflow.phase) ?? 1) <= k) o(it.id)
    for (const dk of discs) if ((dk.found || []).some(c => CHANNELS.has(c)) && (phaseIdx(dk.phase) ?? 1) <= k) o(dk.id)
    for (const r of residents) if ((phaseIdx(r.phase_from) ?? 1) <= k) (r.sells || []).forEach(o)
    for (const od of orders) if ((phaseIdx(od.phase_from) ?? 1) <= k) (od.attachments || []).forEach(o)
    for (const u of upgrades) if ((phaseIdx(u.phase) ?? 9) <= k && reqOk(u.requires, k) && (u.cost?.items || []).every(q => owned(q.id, k))) { o(u.id); (u.grants || []).forEach(g => { if (thingPhaseOk(g, k) || !g.startsWith('mach_')) o(g) }) }
    for (const x of [...first.keys()]) { const c = get(x)?.container; if (c && owned(x, k)) (c.fill || []).forEach(q => o(q.id)) }
    for (const dk of [...first.keys()]) if (dk.startsWith('disc_') && owned(dk, k)) (get(dk)?.programs || []).forEach(o)
    for (const r of recipes) {
      if (!owned(r.machine, k) || (r.disc && !owned(r.disc, k))) continue
      if (!(r.inputs || []).every(q => owned(q.id, k)) || !(r.tools || []).every(t => owned(t, k))) continue
      if (r.kind === 'modify' && r.target?.ids?.length && !r.target.ids.some(t => owned(t, k))) continue
      o(r.id); (r.outputs || []).forEach(q => { if (!q.id.startsWith('mach_') || thingPhaseOk(q.id, k)) o(q.id) })
    }
    if (recyclerKnown && owned('mach_recycler', k)) o(unitItemOfMat.mat_sludge)
    if (recyclerKnown && owned('mach_recycler', k)) for (const t of allThingsWithComp()) if (owned(t.id, k) && t.recyclable !== false) for (const m of Object.keys(t.composition || {})) if (unitItemOfMat[m]) o(unitItemOfMat[m])
  }
}
const P = k => `phase_${k}`
const unreachable = (list, what) => { for (const x of list) if (!first.has(x.id)) err('reach', x.id, `${what} is never reachable from start.json`) }
if (START) {
  unreachable(items, 'item'); unreachable(machines.filter(m => !m.virtual), 'machine'); unreachable(discs, 'disc'); unreachable(programs.filter(p => !p.rom), 'program')
  unreachable(upgrades, 'upgrade'); unreachable(recipes, 'recipe (never runnable)')
  for (const it of items) if (first.has(it.id) && first.get(it.id) > it.tier) warn('reach', it.id, `tier ${it.tier} but first reachable in ${P(first.get(it.id))}`)
  for (const u of upgrades) if (first.has(u.id) && first.get(u.id) > (phaseIdx(u.phase) ?? 9)) err('reach', u.id, `requires cannot be met by its own ${u.phase} (first in ${P(first.get(u.id))})`)
} else if (defs.size) warn('reach', 'start.json', 'missing: reachability not checked')

// sources and sinks for items
const outIds = new Set(recipes.flatMap(r => (r.outputs || []).map(q => q.id)))
if (recyclerKnown) for (const m of Object.values(unitItemOfMat)) outIds.add(m)
const sold = new Set(residents.flatMap(r => r.sells || []))
const granted = new Set(upgrades.flatMap(u => u.grants || []))
const startIds = new Set((START?.things || []).map(q => q.id))
const attached = new Set(orders.flatMap(o => o.attachments || []))
const filled = new Set([...defs.values()].flatMap(d => (d.o.container?.fill || []).map(q => q.id)))
const inUse = new Set(), targetTags = new Set(), wantTags = new Map(), wantNeeds = new Set()
for (const r of recipes) { (r.inputs || []).forEach(q => inUse.add(q.id)); (r.tools || []).forEach(t => inUse.add(t)); (r.target?.ids || []).forEach(t => inUse.add(t)); (r.target?.tags || []).forEach(t => targetTags.add(t)) }
for (const o of orders) for (const w of o.wants || []) { if (w.id) inUse.add(w.id); if (w.tag) wantTags.set(w.tag, Math.min(wantTags.get(w.tag) ?? 9, w.min_tier ?? 1)); if (w.need) wantNeeds.add(w.need) }
for (const r of residents) { (r.buys || []).forEach(x => inUse.add(x)); (r.prefers_tags || []).forEach(t => wantTags.set(t, Math.min(wantTags.get(t) ?? 9, 1))) }
for (const u of upgrades) { (u.cost?.items || []).forEach(q => inUse.add(q.id)); (u.tiers || []).forEach(t => (t.cost?.items || []).forEach(q => inUse.add(q.id))) }
for (const m of machines) (m.consumables || []).forEach(x => inUse.add(x))
for (const it of items) {
  const src = outIds.has(it.id) || it.inflow || sold.has(it.id) || granted.has(it.id) || startIds.has(it.id) || attached.has(it.id) || filled.has(it.id)
  if (!src) err('source', it.id, 'no source (recipe output, inflow, seller, upgrade, start, attachment or container fill)')
  const sink = inUse.has(it.id) || (it.needs && Object.values(it.needs).some(n => n > 0)) || it.use || it.cell || it.fixture || it.container
    || (it.tags || []).some(t => targetTags.has(t) || (wantTags.has(t) && it.tier >= wantTags.get(t)))
    || Object.keys(it.needs || {}).some(n => wantNeeds.has(n))
  if (!sink) (it.recyclable === false ? err : warn)('sink', it.id, it.recyclable === false ? 'no sink at all (not even recyclable)' : 'recycle-only sink: no recipe, need, buyer, order or use')
  if (it.inflow?.channel === 'seller' && has('resident') && !sold.has(it.id)) warn('source', it.id, 'inflow "seller" but no resident sells it')
  if (it.inflow?.channel === 'mail' && has('order') && !attached.has(it.id)) warn('source', it.id, 'inflow "mail" but no order attaches it')
  if (it.inflow && !CHANNELS.has(it.inflow.channel)) err('schema', it.id, `inflow.channel "${it.inflow.channel}" unknown`)
  if (it.wear && !(T.int(it.wear.uses) && it.wear.uses >= 1)) err('schema', it.id, 'wear.uses must be an int >= 1')
}
for (const dk of discs) {
  if ((dk.found || []).includes('upgrade') && has('upgrade') && !granted.has(dk.id)) warn('source', dk.id, 'found "upgrade" but no upgrade grants it')
  if ((dk.found || []).includes('seller') && has('resident') && !sold.has(dk.id)) warn('source', dk.id, 'found "seller" but no resident sells it')
  if ((dk.found || []).includes('mail') && has('order') && !attached.has(dk.id)) warn('source', dk.id, 'found "mail" but no order attaches it')
  if (['recipe', 'blueprint', 'program'].includes(dk.kind) && !UPGRADE_EXEMPT.has(dk.id) && has('upgrade') && !granted.has(dk.id)) err('source', dk.id, `${dk.kind} disc must be sold by an upgrade (upg_${dk.id})`)
}

// machines and discs must do something
const progHosts = new Set(programs.flatMap(p => [...(p.runs_on || []), ...(p.loads_into || [])]))
for (const m of machines) {
  const used = recipes.some(r => r.machine === m.id) || m.generic || (m.effects || []).length || progHosts.has(m.id) || m.virtual
  if (!used) err('use', m.id, 'machine with no recipe, generic rule, effects or programs')
  if (has('upgrade') && !m.virtual && !granted.has(m.id) && !outIds.has(m.id) && !sold.has(m.id) && !startIds.has(m.id)) err('source', m.id, 'machine is not granted by an upgrade, built by a recipe, sold, or in start.json')
}
for (const dk of discs) {
  const used = recipes.some(r => r.disc === dk.id) || (dk.programs || []).length || dk.kind === 'blank' || (dk.data_effects || []).length
  if (!used) err('use', dk.id, 'disc unlocks nothing (no recipe names it, no programs, not blank, no data_effects)')
}
// statuses, modifiers
const appliedMods = new Set(recipes.flatMap(r => r.mods_add || []))
for (const d of byType('modifier')) if (!(d.o.applied_by || []).length && !appliedMods.has(d.o.id)) warn('wiring', d.o.id, 'modifier never applied (no applied_by, no recipe mods_add)')
const causedStats = new Set([...recipes.flatMap(r => Object.keys(r.risks || {})), ...programs.flatMap(p => p.adds || []), ...byType('event').flatMap(e => e.o.adds || []), ...items.flatMap(i => i.use?.adds || [])])
const clearedStats = new Set([...recipes.flatMap(r => r.clears || []), ...items.flatMap(i => i.use?.clears || [])])
for (const d of byType('status')) {
  if (!(d.o.caused_by || []).length && !causedStats.has(d.o.id)) warn('wiring', d.o.id, 'status never caused')
  if (d.o.cleared_by !== 'sleep' && !(d.o.cleared_by || []).length && !clearedStats.has(d.o.id) && d.o.duration_days == null) warn('wiring', d.o.id, 'status never cleared and has no duration')
}

// needs, decks, systems, orders
const allItemFiles = DOMAINS.filter(d => IDS.domains[d].items).every(d => files.some(f => f.name === `items.${d}.json` && !f.example))
if (allItemFiles) for (const n of IDS.needs || []) {
  const c = items.filter(i => (i.needs?.[n.id] ?? 0) > 0).length
  if (c < 3) err('wiring', n.id, `served by ${c} items (want >= 3)`)
}
if (has('resident')) {
  for (const n of IDS.needs || []) if (!residents.some(r => (r.wants?.[n.id] ?? 0) > 0)) err('wiring', n.id, 'no resident wants it')
  for (const dk of IDS.decks || []) if (!residents.some(r => r.deck === dk.id)) err('wiring', dk.id, 'no resident lives here')
}
if (has('order')) {
  for (const dk of IDS.decks || []) if (!orders.some(o => o.deck === dk.id)) err('wiring', dk.id, 'no order ships here')
  const area = id => { const o = get(id); return (o?.w ?? 0) * (o?.h ?? 0) }
  for (const o of orders) {
    for (const w of o.wants || []) if (!w.id && !w.tag && !w.need) err('orders', o.id, 'a want needs id, tag or need')
    const need = (o.wants || []).filter(w => w.id).reduce((s, w) => s + area(w.id) * (w.qty || 1), 0)
    const cap = Math.max(0, ...(o.boxes || []).map(b => (get(b)?.inner_w ?? 0) * (get(b)?.inner_h ?? 0)))
    if (o.kind !== 'memo' && o.kind !== 'spam' && (o.boxes || []).length && need > cap) err('orders', o.id, `wants take ${need} squares, largest allowed box holds ${cap}`)
  }
}
if (has('event')) {
  const evs = byType('event').map(d => d.o)
  for (const s of IDS.systems || []) if (!evs.some(e => (e.systems || []).includes(s.id))) err('wiring', s.id, 'no event names this system')
  for (const n of IDS.needs || []) if (!evs.some(e => (e.shocks || []).some(x => x.need === n.id))) warn('wiring', n.id, 'no event shocks this need')
}

// ------------------------------------------------------------------ counts vs targets
const TARGETS = {
  'items.core.json': [28, 34], 'items.food.json': [40, 50], 'items.life.json': [22, 28], 'items.fab.json': [40, 50], 'items.tech.json': [35, 45], 'items.med.json': [30, 40], 'items.lux.json': [40, 50], 'items.mach.json': [14, 20], 'items.fit.json': [18, 26],
  'recipes.core.json': [22, 30], 'recipes.food.json': [60, 75], 'recipes.life.json': [30, 40], 'recipes.fab.json': [60, 75], 'recipes.tech.json': [45, 60], 'recipes.med.json': [40, 50], 'recipes.lux.json': [40, 55], 'recipes.mach.json': [40, 55], 'recipes.fit.json': [0, 10],
  'materials.json': [16, 16], 'needs.json': [8, 8], 'systems.json': [12, 12], 'decks.json': [7, 7], 'phases.json': [4, 4], 'boxes.json': [3, 3], 'carriers.json': [5, 5],
  'machines.json': [50, 54], 'programs.json': [22, 28], 'statuses.json': [25, 35], 'modifiers.json': [18, 28], 'upgrades.json': [120, 150], 'residents.json': [12, 12], 'orgs.json': [7, 7], 'orders.json': [70, 90], 'events.json': [45, 60],
}
for (const s of fileStatus) { const t = TARGETS[s.name]; if (t && s.state === 'ok' && (s.n < t[0] || s.n > t[1])) warn('counts', s.name, `${s.n} entries, target ${t[0]}-${t[1]}`) }

// ------------------------------------------------------------------ report
const pad = (s, n) => String(s).padEnd(n), lpad = (s, n) => String(s).padStart(n)
const errsIn = name => [...msgs.error.values()].flat().filter(m => defs.get(m.split(':')[0])?.file === name || m.startsWith(name)).length
console.log('\nSTATION DATA: files')
console.log(`  ${pad('file', 22)} ${pad('state', 9)} ${lpad('n', 5)} ${lpad('err', 5)}`)
for (const s of fileStatus) console.log(`  ${pad(s.name, 22)} ${pad(s.state, 9)} ${lpad(s.n, 5)} ${lpad(errsIn(s.state === 'example' ? s.name.replace(/\.json$/, '.example.json') : s.name), 5)}`)

const tierRows = {}
for (const d of byType('item')) { const k = d.domain || '?'; tierRows[k] ??= [0, 0, 0, 0, 0]; tierRows[k][(d.o.tier || 0)]++ }
if (Object.keys(tierRows).length) {
  console.log('\nITEMS by tier')
  console.log(`  ${pad('domain', 8)} ${lpad('t1', 5)} ${lpad('t2', 5)} ${lpad('t3', 5)} ${lpad('t4', 5)} ${lpad('all', 5)}`)
  const tot = [0, 0, 0, 0, 0]
  for (const [k, r] of Object.entries(tierRows).sort()) { console.log(`  ${pad(k, 8)} ${[1, 2, 3, 4].map(i => lpad(r[i], 5)).join(' ')} ${lpad(r.slice(1).reduce((a, b) => a + b, 0), 5)}`); r.forEach((n, i) => tot[i] += n) }
  const all = tot.slice(1).reduce((a, b) => a + b, 0)
  console.log(`  ${pad('total', 8)} ${[1, 2, 3, 4].map(i => lpad(tot[i], 5)).join(' ')} ${lpad(all, 5)}`)
  if (all >= 50) for (const t of [1, 2, 3, 4]) { const b = IDS.tiers?.[t]?.share_of_items; if (b && (tot[t] / all < b[0] - 0.03 || tot[t] / all > b[1] + 0.03)) warn('counts', `tier ${t}`, `${(100 * tot[t] / all).toFixed(0)}% of items, target ${b.map(x => x * 100).join('-')}%`) }
}
const phaseRows = (list, label) => { if (!list.length) return; const c = [0, 0, 0, 0]; list.forEach(x => { const p = phaseIdx(x.phase); if (p) c[p - 1]++ }); console.log(`  ${pad(label, 10)} ${c.map(n => lpad(n, 5)).join(' ')} ${lpad(list.length, 5)}`) }
if (machines.length || recipes.length || upgrades.length || discs.length) {
  console.log('\nBY PHASE')
  console.log(`  ${pad('', 10)} ${lpad('p1', 5)} ${lpad('p2', 5)} ${lpad('p3', 5)} ${lpad('p4', 5)} ${lpad('all', 5)}`)
  phaseRows(machines, 'machines'); phaseRows(recipes, 'recipes'); phaseRows(discs, 'discs'); phaseRows(upgrades, 'upgrades'); phaseRows(programs, 'programs')
}
if (START) {
  const reach = [1, 2, 3, 4].map(k => [...first.values()].filter(v => v === k).length)
  console.log(`\nREACH  newly reachable per phase: ${reach.join(' / ')}  (of ${defs.size} defined ids)`)
}
const dump = (lvl, title) => {
  const m = msgs[lvl]; const n = [...m.values()].reduce((s, a) => s + a.length, 0)
  if (MINE.length) for (const [cat, list] of [...m]) { const keep = list.filter(x => { const w = x.split(':')[0]; return MINE.some(f => defs.get(w)?.file?.replace('.example.json', '.json') === f || w.startsWith(f) || x.includes(f)) }); if (keep.length) m.set(cat, keep); else m.delete(cat) }
  console.log(`\n${title}: ${MINE.length ? `${[...m.values()].reduce((s, a) => s + a.length, 0)} yours of ${n}` : n}`)
  for (const [cat, list] of m) { console.log(`  [${cat}] ${list.length}`); list.slice(0, CAP).forEach(x => console.log(`    ${x}`)); if (list.length > CAP) console.log(`    ... ${list.length - CAP} more (--all)`) }
  return n
}
const nw = dump('warn', 'WARNINGS'), ne = dump('error', 'ERRORS')
const missing = fileStatus.filter(s => s.state === 'MISSING').length
console.log(`\n${ne ? 'FAIL' : 'OK'}: ${ne} errors, ${nw} warnings, ${missing} files missing${missing && !STRICT ? ' (not an error without --strict)' : ''}\n`)
process.exit(ne ? 1 : 0)
