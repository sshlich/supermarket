// Makes the game's kinds (src/kinds.json) from the station data (data/station): every item, machine, box and disc is a kind,
// by its station id. The station owns what a thing is (its name for new things, size, worth, tags, what it is made of, the
// need it serves, its slots); the game keeps what it added (colour, sound, sprite, behaviour: cutting, pouring, smelting,
// a computer's insides, properties). Kinds the station has no thing for (the pack, the computer's disc, a printed sheet, the
// tape gun) are left as they are. Run it again whenever the station data changes: it only rewrites the station's fields.
//   node scripts/station-kinds.ts            write src/kinds.json (and, the first time, move the old kinds' sprites)
//   node scripts/station-kinds.ts --missing  also list the kinds that have no sprite yet, by domain

import { existsSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { ALIASES, type Alias } from '../src/aliases.ts'

const D = new URL('../data/station/', import.meta.url), SRC = new URL('../src/', import.meta.url)
const load = (f: string) => JSON.parse(readFileSync(new URL(f, D), 'utf8'))
const files = readdirSync(D)
const domainFiles = (p: string) => files.filter(f => new RegExp(`^${p}\\.[a-z]+\\.json$`).test(f)).flatMap(load)
const items: any[] = domainFiles('items'), discs: any[] = domainFiles('discs')
const machines: any[] = load('machines.json'), boxes: any[] = load('boxes.json'), media = load('ids.json').media
const K: Record<string, any> = JSON.parse(readFileSync(new URL('kinds.json', SRC), 'utf8'))
const sprite = (id: string) => new URL(`sprites/${id}.svg`, SRC)
const GAME_ONLY = ['pack', 'disc', 'print', 'sealer'] // the game's own, with no station thing
const outside = load('outside.json')
const GEAR = new Set<string>(outside.sites.flatMap((x: any) => [x.gate?.tool, ...(x.bonus ?? []).map((b: any) => b.tool)]).filter(Boolean)) // what goes in your hand at night is a tool
const stationIds = new Set([...items, ...machines, ...boxes, ...discs].map(x => x.id))

// 1. the first time: each old kind moves to its station id (a split one becomes one kind per value, its colours baked into
//    a copy of its sprite), and what refers to it is pointed at the new ids
const target = (a: Alias, val?: string) => typeof a === 'string' ? a : a.to[val ?? ''] ?? Object.values(a.to)[0]
for (const [old, a] of Object.entries(ALIASES)) for (const id of typeof a === 'string' ? [a] : Object.values(a.to)) if (!stationIds.has(id)) throw new Error(`alias ${old} -> ${id}: no such station thing`)
const moved: string[] = []
for (const [old, a] of Object.entries(ALIASES)) {
  const k = K[old]
  if (!k) continue
  const svg = existsSync(sprite(old)) ? readFileSync(sprite(old), 'utf8') : null
  const variants = typeof a === 'string' ? [[undefined, a] as const] : Object.entries(a.to)
  for (const [val, id] of variants) {
    const n = structuredClone(k)
    let art = svg
    if (typeof a !== 'string') {
      const e = n.props?.[a.prop]?.[val!] ?? {}
      if (e.name) n.name = e.name
      if (e.desc) n.desc = e.desc
      if (e.price !== undefined) n.price = e.price
      for (const [from, to] of Object.entries<string>(e.colors ?? {})) art = art?.replaceAll(new RegExp(from, 'gi'), to) ?? null
      delete n.props[a.prop]
      if (!Object.keys(n.props).length) delete n.props
    }
    // what it refers to: the same value of a kind split the same way (copper ore smelts into a copper bar), else the first
    const ref = (kind: string) => { const b = ALIASES[kind]; return !b ? kind : typeof b === 'string' ? b : target(b, typeof a !== 'string' && b.prop === a.prop ? val : undefined) }
    if (n.cut) n.cut.into = ref(n.cut.into)
    if (n.smelt) n.smelt.into = ref(n.smelt.into)
    if (n.stack) Object.assign(n.stack, { on: ref(n.stack.on), lid: ref(n.stack.lid), takes: n.stack.takes.map(ref) })
    for (const sl of n.slots ?? []) { if (sl.fill) sl.fill = ref(sl.fill); if (sl.accepts) sl.accepts = sl.accepts.map((t: string) => t === 'coal' ? 'cell' : t) }
    K[id] = n
    if (art && !existsSync(sprite(id))) writeFileSync(sprite(id), art)
    moved.push(`${old}${val ? ` (${val})` : ''} -> ${id}`)
  }
  delete K[old]
  if (svg && existsSync(sprite(old))) unlinkSync(sprite(old))
}

// 2. every station thing is a kind
const MAT: Record<string, { color: string; sound: string }> = {
  mat_iron: { color: '#8d9297', sound: 'metal' }, mat_copper: { color: '#c27a4c', sound: 'metal' }, mat_lightmetal: { color: '#b8c0c8', sound: 'metal' },
  mat_noble: { color: '#d8b45a', sound: 'metal' }, mat_rare: { color: '#7a6aa8', sound: 'metal' }, mat_lithium: { color: '#a8b8a0', sound: 'stone' },
  mat_silicate: { color: '#9a9488', sound: 'stone' }, mat_carbon: { color: '#3a3a40', sound: 'coal' }, mat_polymer: { color: '#6a8aa8', sound: 'plastic' },
  mat_fibre: { color: '#c8b48a', sound: 'cloth' }, mat_biomass: { color: '#7a9a4a', sound: 'food' }, mat_water: { color: '#6aa8c8', sound: 'glass' },
  mat_salts: { color: '#d8d4c8', sound: 'stone' }, mat_reagent: { color: '#a85a8a', sound: 'glass' }, mat_volatiles: { color: '#a8c86a', sound: 'glass' },
  mat_sludge: { color: '#5a5040', sound: 'food' },
}
const main = (x: any) => Object.entries<number>(x.composition ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0]
const CAT: Record<string, string> = { core: 'materials', food: 'food', med: 'medicine', lux: 'sundries', tech: 'tech', life: 'sundries', fab: 'tools', mach: 'tools', fit: 'furniture' }
function catOf(x: any, kind: 'item' | 'machine' | 'box' | 'disc') {
  if (kind !== 'item') return { machine: 'machines', box: 'storage', disc: 'tech' }[kind]
  const t: string[] = x.tags ?? [], dom = x.id.split('_')[1]
  if (t.includes('tool')) return 'tools'
  if (t.some(s => ['bar', 'raw', 'scrap', 'ore', 'processed', 'sheet', 'wire'].includes(s))) return 'materials'
  return CAT[dom] ?? 'sundries'
}
/** The game's own tags for what customers ask for, from the station's. */
function gameTags(t: string[]) {
  const out = new Set(t)
  if (t.includes('bar')) out.add('metal')
  if (t.some(s => ['luxury', 'heirloom', 'jewellery', 'art'].includes(s))) out.add('valuable')
  if (t.includes('cell')) out.add('fuel')
  return [...out]
}
const slotsOf = (x: any) => (x.container?.slots ?? x.slots ?? []).map((sl: any) => ({ ...(sl.name ? { name: sl.name } : {}), w: sl.w, h: sl.h, ...(sl.accepts_tags?.length ? { accepts: sl.accepts_tags } : {}) }))
function put(x: any, kind: 'item' | 'machine' | 'box' | 'disc') {
  const was = K[x.id], k = was ?? {}
  const m = MAT[main(x)] ?? { color: '#8a8494', sound: 'thing' }
  const fill = x.container?.fill
  const slots = k.slots ?? slotsOf(x)
  if (!k.slots && slots.length && fill?.length === 1) Object.assign(slots[0], { fill: fill[0].id, count: fill[0].qty })
  const box = kind === 'box' && !slots.length ? [{ name: 'inside', w: x.inner_w, h: x.inner_h }] : []
  K[x.id] = {
    name: was?.name ?? x.name, icon: k.icon ?? '', color: k.color ?? m.color, sound: k.sound ?? m.sound,
    ...(k.sprite || kind === 'disc' ? { sprite: k.sprite ?? (x.media === 'card' ? 'card' : 'disc') } : {}),
    w: kind === 'disc' ? media[x.media]?.w ?? x.w : x.w, h: kind === 'disc' ? media[x.media]?.h ?? x.h : x.h,
    ...(k.cells && k.w === x.w && k.h === x.h ? { cells: k.cells } : {}),
    cat: k.cat ?? catOf(x, kind), price: x.value ?? x.price ?? k.price ?? 0,
    tags: [...new Set([...(k.tags ?? []), ...gameTags(x.tags ?? []), ...(kind === 'disc' && x.media !== 'card' ? ['disc'] : []), ...(GEAR.has(x.id) ? ['tool'] : [])])],
    desc: was?.desc ?? x.desc,
    ...Object.fromEntries(Object.entries(k).filter(([f]) => !['name', 'icon', 'color', 'sound', 'sprite', 'w', 'h', 'cells', 'cat', 'price', 'tags', 'desc', 'slots', 'made', 'need', 'tier'].includes(f))),
    ...(slots.length || box.length ? { slots: slots.length ? slots : box } : {}),
    ...(x.wear?.uses && !k.wears ? { wears: x.wear.uses } : {}),
    ...(x.composition ? { made: x.composition } : {}), ...(x.market_need ? { need: x.market_need } : {}), ...(x.tier ? { tier: x.tier } : {}),
  }
}
for (const x of items) put(x, 'item')
for (const x of machines) if (!x.virtual) put(x, 'machine')
for (const x of boxes) put(x, 'box')
for (const x of discs) put(x, 'disc')
// something made by laying things on something (a sandwich) is worth its makings: its own price is its base's (world.ts `Stack`)
for (const k of Object.values(K)) if (k.stack && K[k.stack.on]) k.price = K[k.stack.on].price

// 3. write: the game's own kinds first, then the station's by domain
const order = (id: string) => GAME_ONLY.includes(id) ? '0' + id : id
const out = Object.fromEntries(Object.keys(K).sort((a, b) => order(a) < order(b) ? -1 : 1).map(id => [id, K[id]]))
const strays = Object.keys(out).filter(id => !stationIds.has(id) && !GAME_ONLY.includes(id))
writeFileSync(new URL('kinds.json', SRC), JSON.stringify(out, null, 2) + '\n')
const art = (id: string) => existsSync(sprite(K[id].sprite ?? id))
const missing = Object.keys(out).filter(id => !art(id))
console.log(`${Object.keys(out).length} kinds (${items.length} items, ${machines.filter(m => !m.virtual).length} machines, ${boxes.length} boxes, ${discs.length} discs, ${GAME_ONLY.length} the game's own); ${moved.length} moved from old kinds; ${missing.length} without a sprite`)
if (moved.length) console.log('moved:', moved.join(', '))
if (strays.length) console.log('kinds that are neither station things nor the game\'s own:', strays.join(', '))
if (process.argv.includes('--missing')) {
  const by: Record<string, string[]> = {}
  for (const id of missing) { const d = id.startsWith('mach_') ? 'machines' : id.split('_')[1] ?? id; (by[d] ??= []).push(id) }
  for (const [d, ids] of Object.entries(by)) console.log(`${d} (${ids.length}): ${ids.join(' ')}`)
}
