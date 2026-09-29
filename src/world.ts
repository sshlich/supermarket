// The workshop: what things are, where they sit, and what the night does to them.
// Everything is an item in a container; each night every item reacts to its container and its neighbours.

import { drop, firstFree, overlaps, pack, touches, type Box } from './grid.ts'

export type BoxId = 'basket' | 'crate' | 'cold' | 'hearth' | 'rack' | 'cellar' | 'barrel'
export type Place = 'woods' | 'shore' | 'mine'
type Tag = 'food' | 'fruit' | 'herb' | 'fish' | 'fuel' | 'wood' | 'ore' | 'metal' | 'tool' | 'living' | 'burns' | 'preserved' | 'liquid' | 'salt' | 'light' | 'drink'

export interface Kind {
  name: string; icon: string; color: string; w: number; h: number; stack: number; tags: Tag[]; blurb: string
  fresh?: number // nights before it rots
  moist?: number // % damp when found
  uses?: number
}

export const KINDS: Record<string, Kind> = {
  berries: { name: 'Brambleberries', icon: 'raspberry', color: '#e0506c', w: 1, h: 1, stack: 6, tags: ['food', 'fruit', 'burns'], fresh: 4, moist: 60, blurb: 'Sweet for four days, then not. Dry them, or seal them in beside yeast.' },
  driedBerries: { name: 'Dried Berries', icon: 'berries-bowl', color: '#b0586a', w: 1, h: 1, stack: 8, tags: ['food', 'fruit', 'preserved', 'burns'], blurb: 'Wrinkled and sweet. Keeps as long as it stays dry.' },
  moonleaf: { name: 'Moonleaf', icon: 'linden-leaf', color: '#9fdcc6', w: 1, h: 1, stack: 4, tags: ['herb', 'burns'], fresh: 3, moist: 70, blurb: 'Silver-backed leaf from the old wood. Wilts wet; dried, it is worth keeping.' },
  driedMoonleaf: { name: 'Dried Moonleaf', icon: 'herbs-bundle', color: '#d4d6a8', w: 1, h: 1, stack: 6, tags: ['herb', 'preserved', 'burns'], blurb: 'Crumbles to a sharp smell. Carried in the basket, it sharpens the eye for rare finds.' },
  firewood: { name: 'Firewood', icon: 'log', color: '#b98552', w: 2, h: 1, stack: 3, tags: ['fuel', 'wood'], moist: 0, blurb: 'Burns only when dry. Wet, it smoulders and smokes whatever is beside the fire.' },
  coal: { name: 'Coal', icon: 'coal-pile', color: '#7d828c', w: 1, h: 1, stack: 6, tags: ['fuel'], blurb: 'Hot, clean fuel from the mine. One lump keeps the hearth lit for a night.' },
  spores: { name: 'Glowcap Spores', icon: 'powder-bag', color: '#d9cff5', w: 1, h: 1, stack: 1, tags: ['living', 'burns'], blurb: 'Pale dust in a twist of cloth. Wants the damp and the dark, and room to grow beside it.' },
  glowcap: { name: 'Glowcap', icon: 'mushrooms-cluster', color: '#a8f070', w: 1, h: 1, stack: 4, tags: ['food', 'light', 'living', 'burns'], fresh: 4, blurb: 'Glows green for a few days after picking. Packed for the mine, it lights the deeper seams.' },
  yeast: { name: 'Wild Yeast', icon: 'bubbling-flask', color: '#eccf72', w: 1, h: 1, stack: 1, tags: ['living', 'burns'], blurb: 'A jar of something alive. Set fruit beside it in the dark and it makes wine. It never runs out.' },
  fish: { name: 'Silverfin', icon: 'double-fish', color: '#92bde0', w: 2, h: 1, stack: 1, tags: ['food', 'fish'], fresh: 2, blurb: 'Fresh today, a problem in two. Cold, salt or smoke will keep it.' },
  grilledFish: { name: 'Grilled Silverfin', icon: 'fish-cooked', color: '#e2a064', w: 2, h: 1, stack: 1, tags: ['food', 'fish'], fresh: 3, blurb: 'Good now. Not for long.' },
  smokedFish: { name: 'Smoked Silverfin', icon: 'fish-smoking', color: '#c08450', w: 2, h: 1, stack: 1, tags: ['food', 'fish', 'preserved'], blurb: 'Tastes of the hearth. Keeps for a long time.' },
  saltedFish: { name: 'Salted Silverfin', icon: 'double-fish', color: '#e6ecef', w: 2, h: 1, stack: 1, tags: ['food', 'fish', 'preserved'], blurb: 'Stiff with salt. Keeps for a long time.' },
  seawater: { name: 'Jar of Seawater', icon: 'mason-jar', color: '#4aa3cc', w: 1, h: 2, stack: 1, tags: ['liquid'], blurb: 'The grey sea in a jar. Boil it on a lit hearth and salt is left behind.' },
  saltJar: { name: 'Jar of Salt', icon: 'covered-jar', color: '#efece2', w: 1, h: 2, stack: 1, tags: ['salt'], uses: 3, blurb: 'Coarse grey salt. Raw fish laid beside it gets packed and keeps.' },
  emptyJar: { name: 'Empty Jar', icon: 'mason-jar', color: '#8b939a', w: 1, h: 2, stack: 1, tags: [], blurb: 'Pack it in the basket for the shore and it comes back full of seawater.' },
  copperOre: { name: 'Copper Ore', icon: 'gold-nuggets', color: '#e08a4c', w: 1, h: 1, stack: 4, tags: ['ore'], blurb: 'Green-streaked rock. A lit hearth smelts it.' },
  ironOre: { name: 'Iron Ore', icon: 'stone-pile', color: '#c0705e', w: 1, h: 1, stack: 4, tags: ['ore'], blurb: 'Heavy and rust-red. Lies deeper in the mine, where you need light.' },
  copperIngot: { name: 'Copper Ingot', icon: 'gold-bar', color: '#f09a5c', w: 1, h: 1, stack: 4, tags: ['metal'], blurb: 'Soft, warm metal. It is waiting for a better forge than this.' },
  ironIngot: { name: 'Iron Ingot', icon: 'metal-bar', color: '#b4bec9', w: 1, h: 1, stack: 4, tags: ['metal'], blurb: 'Set beside a worn tool on a lit hearth and the tool comes out mended.' },
  knife: { name: 'Knife', icon: 'bowie-knife', color: '#d3d8de', w: 1, h: 2, stack: 1, tags: ['tool'], blurb: 'In the basket for the woods: more moonleaf, cleanly cut. Rusts in the damp.' },
  pickaxe: { name: 'Pickaxe', icon: 'mining', color: '#d3d8de', w: 2, h: 2, stack: 1, tags: ['tool'], blurb: 'In the basket for the mine: more ore. Rusts in the damp.' },
  net: { name: 'Fishing Net', icon: 'fishing-net', color: '#dccf9e', w: 2, h: 2, stack: 1, tags: ['tool'], blurb: 'In the basket for the shore: more fish.' },
  berryWine: { name: 'Berry Wine', icon: 'wine-bottle', color: '#a33a66', w: 1, h: 1, stack: 3, tags: ['drink'], blurb: 'Gets better every night it spends in the dark of the barrel.' },
}
const ORDER = Object.keys(KINDS)

export interface Container { id: BoxId; name: string; w: number; h: number; env: string; icon: string; blurb: string }
export const CONTAINERS: Container[] = [
  { id: 'basket', name: 'Basket', w: 6, h: 4, env: 'open air', icon: 'basket', blurb: 'Goes out with you each morning. Tools packed in it help; what you find comes home in it, if there is room.' },
  { id: 'crate', name: 'Crate', w: 8, h: 5, env: 'open air', icon: 'wooden-crate', blurb: 'Plain storage. Nothing happens here, except food going off.' },
  { id: 'cold', name: 'Cold Box', w: 5, h: 4, env: 'cold', icon: 'snowflake-2', blurb: 'Spring-fed and icy. Food keeps as long as it stays in here.' },
  { id: 'hearth', name: 'Hearth', w: 4, h: 3, env: 'fire · needs fuel', icon: 'campfire', blurb: 'Burns one dry fuel a night. Lit, it smelts ore, boils jars, cooks fish, dries wood, and burns whatever burns. With only wet wood in it, it smokes instead.' },
  { id: 'rack', name: 'Drying Rack', w: 6, h: 2, env: 'dry · airy', icon: 'clothesline', blurb: 'Dries anything damp. Flies find fish here.' },
  { id: 'cellar', name: 'Cellar Shelf', w: 6, h: 3, env: 'damp · dark', icon: 'cellar-barrels', blurb: 'Spores grow here. Iron rusts, dry things go soft.' },
  { id: 'barrel', name: 'Barrel', w: 3, h: 3, env: 'sealed · dark', icon: 'barrel', blurb: 'Fruit beside yeast ferments into wine, and wine gets better every night it stays.' },
]
export const BOX = Object.fromEntries(CONTAINERS.map(c => [c.id, c])) as Record<BoxId, Container>

export const PLACES: Record<Place, { name: string; icon: string; blurb: string }> = {
  woods: { name: 'Woods', icon: 'forest', blurb: 'Berries, moonleaf, wet wood, sometimes spores or yeast. A knife helps.' },
  shore: { name: 'Shore', icon: 'waves', blurb: 'Fish and driftwood. Empty jars come back full of seawater. A net helps.' },
  mine: { name: 'Mine', icon: 'mine-wagon', blurb: 'Copper ore and coal. A pickaxe helps; a glowcap lights the way to iron.' },
}

export interface Item {
  id: number; kind: string; x: number; y: number; rot: boolean; n: number
  fresh?: number; moist?: number; grade?: number; cond?: number; age?: number; ferment?: number; uses?: number; rotten?: boolean
}
export interface Note { text: string; id?: number; box?: BoxId; kind?: string; quiet?: boolean; mark?: 'find' | 'new' }
export interface State { day: number; place: Place; target: BoxId; boxes: Record<BoxId, Item[]>; seen: string[]; next: number; log: Note[] }

export const has = (it: Item, t: Tag) => KINDS[it.kind].tags.includes(t)
export const dims = (it: Item) => { const k = KINDS[it.kind]; return it.rot ? { w: k.h, h: k.w } : { w: k.w, h: k.h } }
export const boxOf = (it: Item): Box => ({ id: it.id, x: it.x, y: it.y, ...dims(it) })

export function make(s: State, kind: string, extra: Partial<Item> = {}): Item {
  const k = KINDS[kind]
  return { id: s.next++, kind, x: 0, y: 0, rot: false, n: 1, fresh: k.fresh, moist: k.moist, uses: k.uses, cond: k.tags.includes('tool') ? 100 : undefined, ...extra }
}

function become(it: Item, kind: string, extra: Partial<Item> = {}) {
  const k = KINDS[kind]
  Object.assign(it, { kind, fresh: k.fresh, moist: k.moist, uses: k.uses, ferment: undefined, age: undefined, rotten: undefined }, extra)
}

export function where(s: State, id: number): { box: BoxId; it: Item } | null {
  for (const box of Object.keys(s.boxes) as BoxId[]) {
    const it = s.boxes[box].find(o => o.id === id)
    if (it) return { box, it }
  }
  return null
}

/** Damp only matters to name for things you burn or dry for keeping: wood and herbs. */
export const showsDamp = (it: Item) => it.moist !== undefined && (has(it, 'wood') || has(it, 'herb'))

const GRADES = [[85, 'Pure'], [65, 'Fine'], [45, 'Fair'], [0, 'Crude']] as const
export const gradeName = (g: number) => GRADES.find(([min]) => g >= min)![1]

/** The name as the player sees it: "Fine Copper Ore", "Rotten Silverfin", "Wet Firewood". */
export function label(it: Item) {
  const name = KINDS[it.kind].name
  if (it.rotten) return `Rotten ${name}`
  if (it.grade !== undefined) return `${gradeName(it.grade)} ${name}`
  if (it.kind === 'berryWine') return `${(it.age ?? 0) >= 7 ? 'Old' : (it.age ?? 0) >= 3 ? 'Aged' : 'Young'} ${name}`
  if (it.cond !== undefined && it.cond < 40) return `Rusty ${name}`
  if (showsDamp(it) && it.moist! >= 50) return `Wet ${name}`
  if (showsDamp(it) && it.moist! > 20) return `Damp ${name}`
  return name
}

// ---------------------------------------------------------------- stacks

export const canMerge = (into: Item, it: Item) =>
  into.id !== it.id && into.kind === it.kind && into.n < KINDS[it.kind].stack &&
  !into.rotten === !it.rotten && (into.ferment ?? 0) === (it.ferment ?? 0)

/** Move `take` of `it` onto `into`; numbers blend by weight, freshness takes the worse. */
function mergeInto(into: Item, it: Item, take: number) {
  const blend = (a?: number, b?: number) => a === undefined || b === undefined ? a ?? b : Math.round((a * into.n + b * take) / (into.n + take))
  into.grade = blend(into.grade, it.grade)
  into.moist = blend(into.moist, it.moist)
  if (it.fresh !== undefined) into.fresh = Math.min(into.fresh ?? it.fresh, it.fresh)
  if (it.age !== undefined) into.age = Math.min(into.age ?? it.age, it.age)
  into.n += take
  it.n -= take
}

/** Put `it` into `box`: top up matching piles, then free spots (squeezing things together if needed). Returns what didn't fit. */
export function stow(s: State, box: BoxId, it: Item): number {
  const k = KINDS[it.kind]
  const items = s.boxes[box]
  const { w: W, h: H } = BOX[box]
  for (const o of items) if (it.n > 0 && canMerge(o, it)) mergeInto(o, it, Math.min(it.n, k.stack - o.n))
  let first = true
  while (it.n > 0) {
    let spot = firstFree(W, H, items.map(boxOf), k.w, k.h)
    if (!spot && tidy(s, box, { w: k.w, h: k.h })) spot = firstFree(W, H, items.map(boxOf), k.w, k.h)
    if (!spot) break
    const n = Math.min(it.n, k.stack)
    items.push({ ...it, id: first ? it.id : s.next++, n, x: spot.x, y: spot.y, rot: spot.turned })
    first = false
    it.n -= n
  }
  return it.n
}

/** Merge piles and pack the container neatly by kind. `room` also keeps a spot that size free. */
export function tidy(s: State, box: BoxId, room?: { w: number; h: number }): boolean {
  const items = s.boxes[box]
  const { w: W, h: H } = BOX[box]
  const merged: Item[] = []
  for (const it of [...items].sort((a, b) => b.n - a.n)) {
    for (const o of merged) if (it.n > 0 && canMerge(o, it)) mergeInto(o, it, Math.min(it.n, KINDS[it.kind].stack - o.n))
    if (it.n > 0) merged.push(it)
  }
  const plain = (it: Item): Box => ({ id: it.id, x: 0, y: 0, w: KINDS[it.kind].w, h: KINDS[it.kind].h })
  const byKind = [...merged].sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind) || (b.grade ?? 0) - (a.grade ?? 0))
  const extra = room ? [{ id: -1, x: 0, y: 0, ...room }] : []
  const packed = pack(W, H, [...byKind.map(plain), ...extra]) ??
    pack(W, H, [...byKind.map(plain), ...extra].sort((a, b) => b.w * b.h - a.w * a.h))
  items.length = 0
  if (!packed) { items.push(...merged); return false } // merging alone still helps
  for (const p of packed) {
    const it = merged.find(o => o.id === p.id)
    if (!it) continue
    Object.assign(it, { x: p.x, y: p.y, rot: p.w !== KINDS[it.kind].w })
    items.push(it)
  }
  return true
}

/** Shift-click: send an item (or every item of its kind) to another container. */
export function send(s: State, id: number, to: BoxId, all = false): boolean {
  const at = where(s, id)
  if (!at || at.box === to) return false
  const src = s.boxes[at.box]
  let moved = false
  for (const it of all ? src.filter(o => o.kind === at.it.kind) : [at.it]) {
    src.splice(src.indexOf(it), 1)
    const was = it.n
    const left = stow(s, to, { ...it })
    if (left < was) moved = true
    if (left) src.push({ ...it, n: left, id: s.boxes[to].some(o => o.id === it.id) ? s.next++ : it.id })
  }
  return moved
}

// ---------------------------------------------------------------- dragging

/** What's in hand: an item lifted from a spot, or half a pile split off another item (`from` null). */
export interface Held { item: Item; from: { box: BoxId; x: number; y: number; rot: boolean } | null; splitOf?: number }
export interface Plan {
  box: BoxId; x: number; y: number; rot: boolean
  moves: { id: number; box: BoxId; x: number; y: number; rot: boolean }[]
  merge?: number // drops onto this pile instead
}

export function lift(s: State, id: number, split = false): Held | null {
  const at = where(s, id)
  if (!at) return null
  const { box, it } = at
  if (split && it.n > 1) {
    const n = Math.floor(it.n / 2)
    it.n -= n
    return { item: { ...it, id: s.next++, n }, from: null, splitOf: it.id }
  }
  return { item: it, from: { box, x: it.x, y: it.y, rot: it.rot } }
}

/** Where the held item goes if dropped with its top-left at (x, y): onto a pile, a straight swap, a shove, or turned. */
export function planDrop(s: State, held: Held, box: BoxId, x: number, y: number, rot: boolean, turnedOnce = false): Plan | null {
  const it = held.item
  const { w: W, h: H } = BOX[box]
  const d = dims({ ...it, rot })
  const others = s.boxes[box].filter(o => o.id !== it.id)
  const m: Box = { id: it.id, x: Math.max(0, Math.min(W - d.w, x)), y: Math.max(0, Math.min(H - d.h, y)), w: d.w, h: d.h }
  if (d.w > W || d.h > H) return turnedOnce ? null : planDrop(s, held, box, x, y, !rot, true)
  const hits = others.filter(o => overlaps(boxOf(o), m))

  const pile = hits.find(o => canMerge(o, it))
  if (pile) return { box, x: pile.x, y: pile.y, rot: pile.rot, moves: [], merge: pile.id }

  // Dropped squarely onto something the same shape: they trade places.
  const from = held.from
  if (from && hits.length === 1) {
    const hb = boxOf(hits[0])
    if (hb.x === m.x && hb.y === m.y && hb.w === m.w && hb.h === m.h)
      return { box, x: m.x, y: m.y, rot, moves: [{ id: hits[0].id, box: from.box, x: from.x, y: from.y, rot: hits[0].rot !== (from.rot !== rot) }] }
  }

  const res = drop(W, H, others.map(boxOf), m, from?.box === box ? { x: from.x, y: from.y } : undefined)
  if (res) {
    const [me, ...rest] = res
    return {
      box, x: me.x, y: me.y, rot,
      moves: rest.map(r => { const o = others.find(o => o.id === r.id)!; return { id: r.id, box, x: r.x, y: r.y, rot: r.w !== dims(o).w ? !o.rot : o.rot } }),
    }
  }
  if (!turnedOnce && d.w !== d.h) {
    const turned = planDrop(s, held, box, x, y, !rot, true)
    if (turned) return turned
  }
  // Can't make room here: the one thing in the way goes back where the held item came from, if it fits there.
  if (from && hits.length === 1) {
    const h = hits[0]
    const fromOthers = s.boxes[from.box].filter(o => o.id !== it.id && o.id !== h.id).map(boxOf)
    for (const hr of [h.rot, !h.rot]) {
      const spot = { id: h.id, x: from.x, y: from.y, ...dims({ ...h, rot: hr }) }
      const fits = spot.x + spot.w <= BOX[from.box].w && spot.y + spot.h <= BOX[from.box].h
      if (fits && !fromOthers.some(o => overlaps(o, spot)) && !(from.box === box && overlaps(spot, m)))
        return { box, x: m.x, y: m.y, rot, moves: [{ id: h.id, box: from.box, x: from.x, y: from.y, rot: hr }] }
    }
  }
  return null
}

export function applyDrop(s: State, held: Held, plan: Plan) {
  const take = (id: number) => {
    const at = where(s, id)
    if (at) s.boxes[at.box].splice(s.boxes[at.box].indexOf(at.it), 1)
    return at?.it
  }
  const it = held.item
  take(it.id)
  if (plan.merge !== undefined) {
    const into = where(s, plan.merge)!.it
    mergeInto(into, it, Math.min(it.n, KINDS[it.kind].stack - into.n))
    if (it.n > 0) putBack(s, held)
    return
  }
  for (const mv of plan.moves) {
    const o = take(mv.id)!
    Object.assign(o, { x: mv.x, y: mv.y, rot: mv.rot })
    s.boxes[mv.box].push(o)
  }
  Object.assign(it, { x: plan.x, y: plan.y, rot: plan.rot })
  s.boxes[plan.box].push(it)
}

/** Nothing happened: a lifted item stays put, a split-off half rejoins its pile. */
export function putBack(s: State, held: Held) {
  if (held.from) {
    if (!where(s, held.item.id)) s.boxes[held.from.box].push(Object.assign(held.item, { x: held.from.x, y: held.from.y, rot: held.from.rot }))
  } else {
    const orig = held.splitOf !== undefined ? where(s, held.splitOf) : null
    if (orig) orig.it.n += held.item.n
  }
}

// ---------------------------------------------------------------- the night

/** Run one night. Mutates `s` and says what happened; quiet notes are small changes (shown on hover, not in the log). */
export function night(s: State): Note[] {
  const notes: Note[] = []
  const B = s.boxes
  const say = (box: BoxId, it: Item, text: string, quiet = false) => notes.push({ id: it.id, box, kind: it.kind, text, quiet })
  const near = (box: BoxId, it: Item) => B[box].filter(o => o !== it && touches(boxOf(o), boxOf(it)))
  const remove = (box: BoxId, it: Item) => B[box].splice(B[box].indexOf(it), 1)
  const use = (box: BoxId, it: Item) => { if (--it.n <= 0) remove(box, it) }
  const rottenAtDusk = new Set(Object.values(B).flat().filter(o => o.rotten).map(o => o.id))

  // The hearth takes one dry fuel. Without one, wet wood only smoulders.
  const fuel = B.hearth.filter(o => has(o, 'fuel') && (o.moist ?? 0) <= 20).sort((a, b) => a.y - b.y || a.x - b.x)[0]
  const lit = !!fuel
  const smoky = !lit && B.hearth.some(o => has(o, 'wood'))
  if (fuel) { say('hearth', fuel, 'burns to keep the hearth lit'); use('hearth', fuel) }

  for (const it of [...B.hearth]) {
    if (lit) {
      if (it.rotten) { say('hearth', it, 'burns away'); remove('hearth', it) }
      else if (has(it, 'ore')) { const to = it.kind === 'copperOre' ? 'copperIngot' : 'ironIngot'; say('hearth', it, `smelts into ${KINDS[to].name}`); become(it, to) }
      else if (it.kind === 'seawater') { say('hearth', it, 'boils down, leaving a jar of salt'); become(it, 'saltJar') }
      else if (it.kind === 'fish') { say('hearth', it, 'cooks through'); become(it, 'grilledFish') }
      else if (has(it, 'burns')) { say('hearth', it, 'catches fire and burns to ash'); remove('hearth', it) }
      else if (has(it, 'wood') && it.moist) { const m = it.moist; it.moist = Math.max(0, m - 40); say('hearth', it, `dries by the fire (${m}% → ${it.moist}% damp)`, true) }
      else if (has(it, 'tool') && (it.cond ?? 100) < 100) {
        const ingot = near('hearth', it).find(o => o.kind === 'ironIngot')
        if (ingot) { say('hearth', it, `is mended with an iron ingot (${it.cond}% → 100%)`); it.cond = 100; use('hearth', ingot) }
      }
    } else if (smoky) {
      if (it.kind === 'fish' && !it.rotten) { say('hearth', it, 'is smoked by the smouldering wood'); become(it, 'smokedFish') }
      else if (has(it, 'wood') && it.moist) { const m = it.moist; it.moist = Math.max(0, m - 15); say('hearth', it, `smoulders and steams (${m}% → ${it.moist}% damp)`, true) }
    }
  }

  for (const it of [...B.rack]) {
    if (!it.moist) continue
    const m = it.moist
    it.moist = Math.max(0, m - 35)
    const dried = it.kind === 'moonleaf' ? 'driedMoonleaf' : it.kind === 'berries' ? 'driedBerries' : null
    if (dried && it.moist <= 20 && !it.rotten) { say('rack', it, `is dry: now ${KINDS[dried].name}`); become(it, dried) }
    else say('rack', it, `dries in the air (${m}% → ${it.moist}% damp)`, true)
  }

  for (const it of [...B.cellar]) {
    if (has(it, 'tool')) { const c = it.cond ?? 100; it.cond = Math.max(0, c - 15); say('cellar', it, `rusts in the damp (${c}% → ${it.cond}%)`) }
    else if (it.kind === 'driedMoonleaf' || it.kind === 'driedBerries') {
      const back = it.kind === 'driedMoonleaf' ? 'moonleaf' : 'berries'
      say('cellar', it, `goes soft in the damp: ${KINDS[back].name} again`); become(it, back, { moist: 50 })
    } else if (it.moist !== undefined && it.moist < 90) { const m = it.moist; it.moist = Math.min(90, m + 25); say('cellar', it, `soaks up the damp (${m}% → ${it.moist}%)`, true) }
    else if (it.kind === 'spores') grow(it)
  }
  function grow(sp: Item) {
    const cap = near('cellar', sp).find(o => o.kind === 'glowcap' && !o.rotten && o.n < KINDS.glowcap.stack)
    if (cap) { cap.n++; cap.fresh = KINDS.glowcap.fresh; say('cellar', sp, 'feeds the glowcaps beside it (+1)'); return }
    const b = boxOf(sp)
    const cells: [number, number][] = []
    for (let y = b.y; y < b.y + b.h; y++) cells.push([b.x + b.w, y], [b.x - 1, y])
    for (let x = b.x; x < b.x + b.w; x++) cells.push([x, b.y + b.h], [x, b.y - 1])
    const taken = B.cellar.map(boxOf)
    const free = cells.find(([x, y]) => x >= 0 && y >= 0 && x < BOX.cellar.w && y < BOX.cellar.h && !taken.some(t => overlaps(t, { id: -1, x, y, w: 1, h: 1 })))
    if (!free) { say('cellar', sp, 'needs a free spot beside it to sprout', true); return }
    B.cellar.push(make(s, 'glowcap', { x: free[0], y: free[1] }))
    say('cellar', sp, 'sprouts a glowcap beside it')
  }

  for (const it of [...B.barrel]) {
    if (it.kind === 'berries' && !it.rotten) {
      if (!near('barrel', it).some(o => o.kind === 'yeast')) { say('barrel', it, 'needs yeast beside it to ferment', true); continue }
      it.ferment = (it.ferment ?? 0) + 1
      if (it.ferment < 3) say('barrel', it, `ferments (${it.ferment}/3)`)
      else { say('barrel', it, 'has become Berry Wine'); become(it, 'berryWine', { n: Math.ceil(it.n / 2), age: 0 }) }
    } else if (it.kind === 'berryWine') {
      it.age = (it.age ?? 0) + 1
      say('barrel', it, it.age === 3 ? 'has aged: now Aged Berry Wine' : it.age === 7 ? 'has aged: now Old Berry Wine' : `ages in the dark (${it.age} nights)`, it.age !== 3 && it.age !== 7)
    }
  }

  // Salt keeps raw fish anywhere but the fire.
  for (const box of Object.keys(B) as BoxId[]) {
    if (box === 'hearth' && lit) continue
    for (const it of [...B[box]]) {
      if (it.kind !== 'fish' || it.rotten) continue
      const jar = near(box, it).find(o => o.kind === 'saltJar')
      if (!jar) continue
      say(box, it, 'is packed in salt and will keep'); become(it, 'saltedFish')
      jar.uses = (jar.uses ?? 1) - 1
      if (!jar.uses) { say(box, jar, 'is used up'); become(jar, 'emptyJar') }
    }
  }

  // Food goes off, faster beside rot, faster still with flies on the rack. The cold stops it.
  for (const box of Object.keys(B) as BoxId[]) {
    for (const it of B[box]) {
      if (it.fresh === undefined || it.rotten || has(it, 'preserved')) continue
      if (box === 'cold') { say(box, it, 'keeps in the cold', true); continue }
      if (box === 'cellar' && it.kind === 'glowcap') { say(box, it, 'thrives in the damp dark', true); continue }
      if (box === 'barrel' && it.ferment) continue
      const byRot = near(box, it).some(o => rottenAtDusk.has(o.id))
      const flies = box === 'rack' && has(it, 'fish')
      const f = it.fresh
      it.fresh = Math.max(0, f - 1 - (byRot ? 1 : 0) - (flies ? 1 : 0))
      const why = byRot ? ', faster beside rot' : flies ? ', flies at it' : ''
      if (!it.fresh) { it.rotten = true; say(box, it, `rots${why}`) }
      else say(box, it, `goes off a little${why} (${f} → ${it.fresh} nights left)`, true)
    }
  }
  return notes
}

/** Morning: bring back what the day's place gives, helped by what's packed in the basket. */
export function forage(s: State, rand = Math.random): Note[] {
  const notes: Note[] = []
  const basket = s.boxes.basket
  const roll = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1))
  const grade = () => roll(25, 95)
  const tool = (kind: string) => basket.find(o => o.kind === kind && (o.cond ?? 0) >= 40)
  const wear = (t: Item) => { const c = t.cond!; t.cond = c - 10; notes.push({ id: t.id, box: 'basket', kind: t.kind, text: `helped, and wore a little (${c}% → ${t.cond}%)` }) }
  const finds: Item[] = []
  const add = (kind: string, n: number, extra: Partial<Item> = {}) => { if (n > 0) finds.push(make(s, kind, { n, ...extra })) }

  if (s.place === 'woods') {
    add('berries', roll(2, 5))
    const knife = tool('knife')
    add('moonleaf', roll(1, 2) + (knife ? 2 : 0))
    if (knife) wear(knife)
    add('firewood', 1, { moist: 60 })
    if (rand() < 0.35) add('spores', 1)
    const sharp = basket.some(o => o.kind === 'driedMoonleaf')
    if (rand() < (sharp ? 0.6 : 0.15)) add('yeast', 1)
  } else if (s.place === 'shore') {
    const net = tool('net')
    add('fish', roll(1, 2) + (net ? 2 : 0))
    if (net) wear(net)
    for (const jar of basket.filter(o => o.kind === 'emptyJar')) { notes.push({ id: jar.id, box: 'basket', kind: jar.kind, text: 'came back full of seawater' }); become(jar, 'seawater') }
    if (rand() < 0.25) add('seawater', 1)
    if (rand() < 0.5) add('firewood', 1, { moist: 80 })
  } else {
    const pick = tool('pickaxe')
    add('copperOre', roll(1, 3) + (pick ? 3 : 0), { grade: grade() })
    if (pick) wear(pick)
    const light = basket.find(o => o.kind === 'glowcap' && !o.rotten)
    if (light) {
      add('ironOre', roll(2, 3), { grade: grade() })
      notes.push({ id: light.id, box: 'basket', kind: light.kind, text: 'lit the deep seams, and was used up' })
      if (--light.n <= 0) basket.splice(basket.indexOf(light), 1)
    } else if (rand() < 0.2) add('ironOre', 1, { grade: grade() })
    add('coal', roll(1, 2))
  }

  for (const f of finds) {
    const n = f.n
    const left = stow(s, 'basket', f)
    const what = [f.grade !== undefined && gradeName(f.grade), showsDamp(f) && f.moist! >= 50 && 'wet'].filter(Boolean).join(', ')
    const got = n - left ? `× ${n - left}${what ? ` (${what})` : ''}` : 'none of it'
    notes.push({ id: f.id, box: 'basket', kind: f.kind, mark: 'find', text: `${got}${left ? ` · ${left} left behind, no room in the basket` : ''}` })
  }
  return notes
}

/** First time you've held something: note it. */
function discover(s: State): Note[] {
  const notes: Note[] = []
  for (const [box, items] of Object.entries(s.boxes) as [BoxId, Item[]][])
    for (const it of items)
      if (!s.seen.includes(it.kind)) { s.seen.push(it.kind); notes.push({ id: it.id, box, kind: it.kind, mark: 'new', text: 'first one you have found' }) }
  return notes
}

export function sleep(s: State, rand = Math.random): Note[] {
  const notes = night(s)
  s.day++
  notes.push({ text: `Day ${s.day}. You went to the ${PLACES[s.place].name.toLowerCase()} and brought back:` }, ...forage(s, rand), ...discover(s))
  s.log = notes
  return notes
}

/** What tonight would do to each item, as things stand. */
export function forecast(s: State): Map<number, string[]> {
  const out = new Map<number, string[]>()
  for (const n of night(structuredClone(s))) if (n.id !== undefined) out.set(n.id, [...out.get(n.id) ?? [], n.text])
  return out
}

/** What tonight would do to the held item if dropped by this plan. */
export function forecastDrop(s: State, held: Held, plan: Plan): string[] {
  const c = structuredClone(s)
  const h = structuredClone(held)
  applyDrop(c, h, plan)
  const id = plan.merge ?? h.item.id
  return night(c).filter(n => n.id === id).map(n => n.text)
}

export function start(): State {
  const s: State = { day: 1, place: 'woods', target: 'crate', boxes: { basket: [], crate: [], cold: [], hearth: [], rack: [], cellar: [], barrel: [] }, seen: [], next: 1, log: [] }
  const put = (box: BoxId, kind: string, extra: Partial<Item> = {}) => stow(s, box, make(s, kind, extra))
  put('crate', 'pickaxe', { cond: 65 })
  put('crate', 'net', { cond: 90 })
  put('crate', 'knife', { cond: 80 })
  put('crate', 'coal', { n: 3 })
  put('crate', 'firewood', { n: 2 })
  put('crate', 'copperOre', { n: 3, grade: 58 })
  put('crate', 'ironIngot', { grade: 62 })
  put('crate', 'emptyJar')
  put('crate', 'seawater')
  put('basket', 'fish', { fresh: 2 })
  put('basket', 'firewood', { moist: 60 })
  put('basket', 'berries', { n: 5 })
  put('basket', 'moonleaf', { n: 3 })
  put('basket', 'spores')
  put('basket', 'yeast')
  discover(s)
  s.log = [{ text: 'Day 1. You came back from the woods with a full basket. The fish won’t keep long.' }]
  return s
}
