// The workshop: what things are, where they sit, and what the night does to them.
// Everything is an item. Some items are containers: they hold other items, and can sit inside each other.
// Each night every item reacts to the environment of what it is in, and to its neighbours.

import { drop, firstFree, overlaps, pack, same, touches, turn, type Box } from './grid.ts'

export type Place = 'woods' | 'shore' | 'mine'
type Tag = 'container' | 'food' | 'fruit' | 'herb' | 'fish' | 'fuel' | 'wood' | 'ore' | 'metal' | 'tool' | 'living' | 'burns' | 'preserved' | 'liquid' | 'salt' | 'light' | 'drink'
/** What a container does to everything inside it. `lit` and `smoky` are worked out each night from what is burning. */
export type Prop = 'cold' | 'dry' | 'airy' | 'damp' | 'dark' | 'sealed' | 'fire' | 'lit' | 'smoky'

export interface Spec {
  w: number; h: number; desc: string
  env: Prop[]
  seals?: Prop[] // props of whatever this sits in that don't reach its contents
  accepts?: Tag[] // only things with one of these tags go in
}
export interface Kind {
  name: string; icon: string; color: string; w: number; h: number; stack: number; tags: Tag[]; blurb: string
  fresh?: number // nights before it rots
  moist?: number // % damp when found
  uses?: number
  shape?: string[] // footprint as rows, '#' filled; when set it gives w and h
  box?: Spec // it is a container
  // what the night does, as data the rules read:
  onFire?: string // becomes this on a lit fire
  smoke?: string // becomes this in smoke
  dries?: string // becomes this once dry
  softens?: string // becomes this again in the damp
  grows?: string // sprouts this beside itself in damp and dark
  ferments?: { with: string; into: string; nights: number } // sealed and dark, beside `with`
  ages?: boolean // gets better each night sealed in the dark
}

export const KINDS: Record<string, Kind> = {
  berries: { name: 'Brambleberries', icon: 'raspberry', color: '#e0506c', w: 1, h: 1, stack: 6, tags: ['food', 'fruit', 'burns'], fresh: 4, moist: 60, dries: 'driedBerries', ferments: { with: 'yeast', into: 'berryWine', nights: 3 }, blurb: 'Sweet for four days, then not. Dry them, or seal them in beside yeast.' },
  driedBerries: { name: 'Dried Berries', icon: 'berries-bowl', color: '#b0586a', w: 1, h: 1, stack: 8, tags: ['food', 'fruit', 'preserved', 'burns'], softens: 'berries', blurb: 'Wrinkled and sweet. Keeps as long as it stays dry.' },
  moonleaf: { name: 'Moonleaf', icon: 'linden-leaf', color: '#9fdcc6', w: 1, h: 1, stack: 4, tags: ['herb', 'burns'], fresh: 3, moist: 70, dries: 'driedMoonleaf', blurb: 'Silver-backed leaf from the old wood. Wilts wet; dried, it is worth keeping.' },
  driedMoonleaf: { name: 'Dried Moonleaf', icon: 'herbs-bundle', color: '#d4d6a8', w: 1, h: 1, stack: 6, tags: ['herb', 'preserved', 'burns'], softens: 'moonleaf', blurb: 'Crumbles to a sharp smell. Carried in the basket, it sharpens the eye for rare finds.' },
  firewood: { name: 'Firewood', icon: 'log', color: '#b98552', w: 2, h: 1, stack: 3, tags: ['fuel', 'wood'], moist: 0, blurb: 'Burns only when dry. Wet, it smoulders and smokes whatever is beside the fire.' },
  coal: { name: 'Coal', icon: 'coal-pile', color: '#7d828c', w: 1, h: 1, stack: 6, tags: ['fuel'], blurb: 'Hot, clean fuel from the mine. One lump keeps the hearth lit for a night.' },
  spores: { name: 'Glowcap Spores', icon: 'powder-bag', color: '#d9cff5', w: 1, h: 1, stack: 1, tags: ['living', 'burns'], grows: 'glowcap', blurb: 'Pale dust in a twist of cloth. Wants the damp and the dark, and room to grow beside it.' },
  glowcap: { name: 'Glowcap', icon: 'mushrooms-cluster', color: '#a8f070', w: 1, h: 1, stack: 4, tags: ['food', 'light', 'living', 'burns'], fresh: 4, blurb: 'Glows green for a few days after picking. Packed for the mine, it lights the deeper seams.' },
  yeast: { name: 'Wild Yeast', icon: 'bubbling-flask', color: '#eccf72', w: 1, h: 1, stack: 1, tags: ['living', 'burns'], blurb: 'A jar of something alive. Set fruit beside it in the dark and it makes wine. It never runs out.' },
  fish: { name: 'Silverfin', icon: 'double-fish', color: '#92bde0', w: 2, h: 1, stack: 1, tags: ['food', 'fish'], fresh: 2, onFire: 'grilledFish', smoke: 'smokedFish', blurb: 'Fresh today, a problem in two. Cold, salt or smoke will keep it.' },
  grilledFish: { name: 'Grilled Silverfin', icon: 'fish-cooked', color: '#e2a064', w: 2, h: 1, stack: 1, tags: ['food', 'fish'], fresh: 3, blurb: 'Good now. Not for long.' },
  smokedFish: { name: 'Smoked Silverfin', icon: 'fish-smoking', color: '#c08450', w: 2, h: 1, stack: 1, tags: ['food', 'fish', 'preserved'], blurb: 'Tastes of the hearth. Keeps for a long time.' },
  saltedFish: { name: 'Salted Silverfin', icon: 'double-fish', color: '#e6ecef', w: 2, h: 1, stack: 1, tags: ['food', 'fish', 'preserved'], blurb: 'Stiff with salt. Keeps for a long time.' },
  seawater: { name: 'Jar of Seawater', icon: 'mason-jar', color: '#4aa3cc', w: 1, h: 2, stack: 1, tags: ['liquid'], onFire: 'saltJar', blurb: 'The grey sea in a jar. Boil it on a lit hearth and salt is left behind.' },
  saltJar: { name: 'Jar of Salt', icon: 'covered-jar', color: '#efece2', w: 1, h: 2, stack: 1, tags: ['salt'], uses: 3, blurb: 'Coarse grey salt. Raw fish laid beside it gets packed and keeps.' },
  emptyJar: { name: 'Empty Jar', icon: 'mason-jar', color: '#8b939a', w: 1, h: 2, stack: 1, tags: [], blurb: 'Pack it in the basket for the shore and it comes back full of seawater.' },
  copperOre: { name: 'Copper Ore', icon: 'gold-nuggets', color: '#e08a4c', w: 1, h: 1, stack: 4, tags: ['ore'], onFire: 'copperIngot', blurb: 'Green-streaked rock. A lit hearth smelts it.' },
  ironOre: { name: 'Iron Ore', icon: 'stone-pile', color: '#c0705e', w: 1, h: 1, stack: 4, tags: ['ore'], onFire: 'ironIngot', blurb: 'Heavy and rust-red. Lies deeper in the mine, where you need light.' },
  copperIngot: { name: 'Copper Ingot', icon: 'gold-bar', color: '#f09a5c', w: 1, h: 1, stack: 4, tags: ['metal'], blurb: 'Soft, warm metal. It is waiting for a better forge than this.' },
  ironIngot: { name: 'Iron Ingot', icon: 'metal-bar', color: '#b4bec9', w: 1, h: 1, stack: 4, tags: ['metal'], blurb: 'Set beside a worn tool on a lit hearth and the tool comes out mended.' },
  knife: { name: 'Knife', icon: 'bowie-knife', color: '#d3d8de', w: 1, h: 2, stack: 1, tags: ['tool'], blurb: 'In the basket for the woods: more moonleaf, cleanly cut. Rusts in the damp.' },
  pickaxe: { name: 'Pickaxe', icon: 'mining', color: '#d3d8de', w: 3, h: 2, shape: ['###', '.#.'], stack: 1, tags: ['tool'], blurb: 'In the basket for the mine: more ore. Rusts in the damp.' },
  axe: { name: 'Axe', icon: 'battle-axe', color: '#d3d8de', w: 2, h: 3, shape: ['##', '#.', '#.'], stack: 1, tags: ['tool'], blurb: 'In the basket for the woods: more firewood, and dry. Rusts in the damp.' },
  net: { name: 'Fishing Net', icon: 'fishing-net', color: '#dccf9e', w: 2, h: 2, stack: 1, tags: ['tool'], blurb: 'In the basket for the shore: more fish.' },
  berryWine: { name: 'Berry Wine', icon: 'wine-bottle', color: '#a33a66', w: 1, h: 1, stack: 3, tags: ['drink'], ages: true, blurb: 'Gets better every night it spends in the dark of the barrel.' },
  // Containers. `w`/`h` is the footprint where it sits; `box` is what's inside.
  basket: { name: 'Basket', icon: 'basket', color: '#c9a36a', w: 2, h: 2, stack: 1, tags: ['container'], blurb: 'Goes out with you each morning. Tools packed in it help; what you find comes home in it, if there is room.',
    box: { w: 6, h: 4, env: [], desc: 'open air' } },
  crate: { name: 'Crate', icon: 'wooden-crate', color: '#a98553', w: 3, h: 2, stack: 1, tags: ['container'], blurb: 'Plain storage. Nothing happens here, except food going off.',
    box: { w: 8, h: 5, env: [], desc: 'open air' } },
  coldBox: { name: 'Cold Box', icon: 'snowflake-2', color: '#9cc9e6', w: 2, h: 2, stack: 1, tags: ['container'], blurb: 'Spring-fed and icy. Food keeps as long as it stays in here.',
    box: { w: 5, h: 4, env: ['cold'], desc: 'cold' } },
  hearth: { name: 'Hearth', icon: 'campfire', color: '#e8894a', w: 2, h: 2, stack: 1, tags: ['container'], blurb: 'Burns one dry fuel a night. Lit, it smelts ore, boils jars, cooks fish, dries wood, and burns whatever burns. With only wet wood in it, it smokes instead.',
    box: { w: 4, h: 3, env: ['fire'], desc: 'fire · needs fuel' } },
  rack: { name: 'Drying Rack', icon: 'clothesline', color: '#d9c48a', w: 3, h: 1, stack: 1, tags: ['container'], blurb: 'Dries anything damp. Flies find fish here.',
    box: { w: 6, h: 2, env: ['dry', 'airy'], desc: 'dry · airy' } },
  shelf: { name: 'Cellar Shelf', icon: 'cellar-barrels', color: '#7a8f6a', w: 3, h: 2, stack: 1, tags: ['container'], blurb: 'Spores grow here. Iron rusts, dry things go soft.',
    box: { w: 6, h: 3, env: ['damp', 'dark'], desc: 'damp · dark' } },
  barrel: { name: 'Barrel', icon: 'barrel', color: '#9b6a3f', w: 2, h: 2, stack: 1, tags: ['container'], blurb: 'Fruit beside yeast ferments into wine, and wine gets better every night it stays.',
    box: { w: 3, h: 3, env: ['sealed', 'dark'], desc: 'sealed · dark' } },
  chest: { name: 'Chest', icon: 'chest', color: '#b07c4a', w: 2, h: 2, stack: 1, tags: ['container'], blurb: 'Holds anything, and can be carried like anything else. Put it in the cold box and what is in it stays cold.',
    box: { w: 4, h: 3, env: [], desc: 'holds anything' } },
  lockbox: { name: 'Lockbox', icon: 'locked-chest', color: '#8f9aa6', w: 1, h: 1, stack: 1, tags: ['container'], blurb: 'Only metal goes in. Shuts out the damp, so nothing in it rusts.',
    box: { w: 3, h: 2, env: [], seals: ['damp'], accepts: ['metal'], desc: 'metal only · airtight' } },
}

for (const k of Object.values(KINDS)) if (k.shape) { k.h = k.shape.length; k.w = Math.max(...k.shape.map(r => r.length)) }
const ORDER = Object.keys(KINDS)

/** A kind's footprint as the grid sees it, facing the way it is made. */
const SHAPES = new Map<string, Box>()
export function shapeOf(kind: string): Box {
  let b = SHAPES.get(kind)
  if (!b) {
    const k = KINDS[kind]
    b = { id: -1, x: 0, y: 0, w: k.w, h: k.h }
    if (k.shape) b.cells = k.shape.flatMap((row, y) => [...row].flatMap((c, x) => c === '#' ? [[x, y] as const] : []))
    SHAPES.set(kind, b)
  }
  return b
}

/** The field: the workshop floor containers sit on. Its id is 0. */
export const FIELD = 0
export const FIELD_W = 10
export const FIELD_H = 6

export const PLACES: Record<Place, { name: string; icon: string; blurb: string }> = {
  woods: { name: 'Woods', icon: 'forest', blurb: 'Berries, moonleaf, wet wood, sometimes spores or yeast. A knife helps.' },
  shore: { name: 'Shore', icon: 'waves', blurb: 'Fish and driftwood. Empty jars come back full of seawater. A net helps.' },
  mine: { name: 'Mine', icon: 'mine-wagon', blurb: 'Copper ore and coal. A pickaxe helps; a glowcap lights the way to iron.' },
}

export interface Item {
  id: number; kind: string; at: number; x: number; y: number; rot: boolean; n: number
  fresh?: number; moist?: number; grade?: number; cond?: number; age?: number; ferment?: number; uses?: number; rotten?: boolean
}
export interface Note { text: string; id?: number; box?: number; kind?: string; quiet?: boolean; mark?: 'find' | 'new' }
export interface State { day: number; place: Place; target: number; items: Item[]; open: number[]; seen: string[]; next: number; log: Note[] }

export const has = (it: Item, t: Tag) => KINDS[it.kind].tags.includes(t)
export const boxOf = (it: Item): Box => ({ ...(it.rot ? turn(shapeOf(it.kind)) : shapeOf(it.kind)), id: it.id, x: it.x, y: it.y })
export const dims = (it: Item) => { const b = boxOf(it); return { w: b.w, h: b.h } }
/** The filled cells of an item as it sits (relative to its top-left), or null for a plain rectangle. */
export const cellsOf = (it: Item) => boxOf(it).cells ?? null

// ---------------------------------------------------------------- containers

export const find = (s: State, id: number) => s.items.find(o => o.id === id)
export const spec = (it: Item) => KINDS[it.kind].box
export const isBox = (it: Item) => !!spec(it)
export const kids = (s: State, id: number) => s.items.filter(o => o.at === id)
/** Containers sitting on the field, in the order they were made. */
export const tops = (s: State) => kids(s, FIELD).filter(isBox)
/** Inside size of a container, or of the floor. */
export const room = (s: State, id: number) => id === FIELD ? { w: FIELD_W, h: FIELD_H } : spec(find(s, id)!)!

/** Is `id` the container `anc`, or somewhere inside it? */
export function within(s: State, id: number, anc: number): boolean {
  for (let o = find(s, id); o; o = find(s, o.at)) if (o.id === anc) return true
  return false
}

/** Containers may nest two deep (a bottle in a machine); usually one. No infinite space by chests in chests. */
export const MAX_NEST = 2
/** How many containers deep `cid` is, itself included: on the field = 1. */
const depth = (s: State, cid: number): number => { const c = find(s, cid); return c && isBox(c) ? 1 + depth(s, c.at) : 0 }
/** How many containers deep an item is: 0 for a plain item, 1 for a lockbox, 2 for a chest holding one. */
const height = (s: State, it: Item): number => isBox(it) ? 1 + Math.max(0, ...kids(s, it.id).map(o => height(s, o))) : 0

/** Would this container take that item? Not if it is closed to that kind, or is inside the item itself. */
export function accepts(s: State, cid: number, it: Item): boolean {
  if (cid === FIELD) return isBox(it) && height(s, it) <= MAX_NEST
  const c = find(s, cid)
  const b = c && spec(c)
  if (!b || within(s, cid, it.id)) return false
  if (depth(s, cid) + height(s, it) > MAX_NEST) return false
  return !b.accepts || KINDS[it.kind].tags.some(t => b.accepts!.includes(t))
}

const fuelOf = (s: State, cid: number) =>
  kids(s, cid).filter(o => has(o, 'fuel') && (o.moist ?? 0) <= 20).sort((a, b) => a.y - b.y || a.x - b.x)[0]

/** What a container does to its contents tonight: its own props, plus whatever reaches it from the container it sits in. */
export function env(s: State, cid: number): Set<Prop> {
  const c = find(s, cid)!
  const b = spec(c)!
  const out = new Set<Prop>(b.env)
  const up = find(s, c.at) && isBox(find(s, c.at)!) ? env(s, c.at) : new Set<Prop>()
  for (const p of up) if (!b.seals?.includes(p)) out.add(p)
  if (b.env.includes('fire')) {
    if (fuelOf(s, cid)) out.add('lit')
    else if (kids(s, cid).some(o => has(o, 'wood'))) out.add('smoky')
  }
  return out
}

// ---------------------------------------------------------------- items

export function make(s: State, kind: string, extra: Partial<Item> = {}): Item {
  const k = KINDS[kind]
  return { id: s.next++, kind, at: FIELD, x: 0, y: 0, rot: false, n: 1, fresh: k.fresh, moist: k.moist, uses: k.uses, cond: k.tags.includes('tool') ? 100 : undefined, ...extra }
}

function become(it: Item, kind: string, extra: Partial<Item> = {}) {
  const k = KINDS[kind]
  Object.assign(it, { kind, fresh: k.fresh, moist: k.moist, uses: k.uses, ferment: undefined, age: undefined, rotten: undefined }, extra)
}

/** The name of the thing a container sits in, for tooltips ("the crate"). */
export const nameOf = (s: State, id: number) => find(s, id) ? KINDS[find(s, id)!.kind].name.toLowerCase() : 'workshop'

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

const take = (s: State, it: Item) => { const i = s.items.indexOf(it); if (i >= 0) s.items.splice(i, 1) }

/** Put `it` (not in the world yet) into container `cid`: top up matching piles, then free spots (squeezing things together if needed). Returns what didn't fit. */
export function stow(s: State, cid: number, it: Item): number {
  if (!accepts(s, cid, it)) return it.n
  const k = KINDS[it.kind]
  const { w: W, h: H } = room(s, cid)
  for (const o of kids(s, cid)) if (it.n > 0 && canMerge(o, it)) mergeInto(o, it, Math.min(it.n, k.stack - o.n))
  let first = true
  while (it.n > 0) {
    let spot = firstFree(W, H, kids(s, cid).map(boxOf), shapeOf(it.kind))
    if (!spot && tidy(s, cid, shapeOf(it.kind))) spot = firstFree(W, H, kids(s, cid).map(boxOf), shapeOf(it.kind))
    if (!spot) break
    const n = Math.min(it.n, k.stack)
    s.items.push({ ...it, id: first ? it.id : s.next++, at: cid, n, x: spot.x, y: spot.y, rot: spot.turned })
    first = false
    it.n -= n
  }
  return it.n
}

/** Merge piles and pack the container neatly by kind. `spare` also keeps a spot that size free. */
export function tidy(s: State, cid: number, spare?: Box): boolean {
  const items = kids(s, cid)
  const { w: W, h: H } = room(s, cid)
  const merged: Item[] = []
  for (const it of [...items].sort((a, b) => b.n - a.n)) {
    for (const o of merged) if (it.n > 0 && canMerge(o, it)) mergeInto(o, it, Math.min(it.n, KINDS[it.kind].stack - o.n))
    if (it.n > 0) merged.push(it)
  }
  for (const it of items) if (!merged.includes(it)) take(s, it) // emptied by merging
  const plain = (it: Item): Box => ({ ...shapeOf(it.kind), id: it.id })
  const byKind = [...merged].sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind) || (b.grade ?? 0) - (a.grade ?? 0))
  const extra = spare ? [{ ...spare, id: -1 }] : []
  const packed = pack(W, H, [...byKind.map(plain), ...extra]) ??
    pack(W, H, [...byKind.map(plain), ...extra].sort((a, b) => b.w * b.h - a.w * a.h))
  if (!packed) return false // merging alone still helps
  for (const p of packed) {
    const it = merged.find(o => o.id === p.id)
    if (it) Object.assign(it, { x: p.x, y: p.y, rot: !!p.rot })
  }
  return true
}

/** Shift-click: send an item (or every item of its kind) to another container. */
export function send(s: State, id: number, to: number, all = false): boolean {
  const it0 = find(s, id)
  if (!it0 || it0.at === to) return false
  let moved = false
  for (const it of all ? kids(s, it0.at).filter(o => o.kind === it0.kind) : [it0]) {
    if (!accepts(s, to, it)) continue
    const from = it.at
    take(s, it)
    const was = it.n
    const left = stow(s, to, { ...it })
    if (left < was) moved = true
    if (left) s.items.push({ ...it, n: left, at: from, id: kids(s, to).some(o => o.id === it.id) ? s.next++ : it.id })
  }
  return moved
}

// ---------------------------------------------------------------- dragging

/** What's in hand: an item lifted from a spot, or half a pile split off another item (`from` null). */
export interface Held { item: Item; from: { at: number; x: number; y: number; rot: boolean } | null; splitOf?: number }
export interface Plan {
  at: number; x: number; y: number; rot: boolean
  moves: { id: number; at: number; x: number; y: number; rot: boolean }[]
  merge?: number // drops onto this pile instead
}

export function lift(s: State, id: number, split = false): Held | null {
  const it = find(s, id)
  if (!it) return null
  if (split && it.n > 1) {
    const n = Math.floor(it.n / 2)
    it.n -= n
    return { item: { ...it, id: s.next++, n }, from: null, splitOf: it.id }
  }
  return { item: it, from: { at: it.at, x: it.x, y: it.y, rot: it.rot } }
}

/** Where the held item goes if dropped with its top-left at (x, y): onto a pile, a straight swap, a shove, or turned. */
export function planDrop(s: State, held: Held, at: number, x: number, y: number, rot: boolean, turnedOnce = false): Plan | null {
  const it = held.item
  const direct = accepts(s, at, it) // the floor takes only containers, but anything can go into one lying on it
  const { w: W, h: H } = room(s, at)
  const d = dims({ ...it, rot })
  const others = kids(s, at).filter(o => o.id !== it.id)
  const m: Box = { ...boxOf({ ...it, rot }), x: Math.max(0, Math.min(W - d.w, x)), y: Math.max(0, Math.min(H - d.h, y)) }
  if (d.w > W || d.h > H) return turnedOnce ? null : planDrop(s, held, at, x, y, !rot, true)
  const hits = others.filter(o => overlaps(boxOf(o), m))

  // Dropped onto a container that takes it: it goes inside, onto a pile or the first free spot.
  const cx = m.x + Math.floor(m.w / 2), cy = m.y + Math.floor(m.h / 2)
  const cell = { id: -1, x: cx, y: cy, w: 1, h: 1 }
  const into = hits.length === 1 && isBox(hits[0]) && overlaps(boxOf(hits[0]), cell) && accepts(s, hits[0].id, it) ? hits[0] : null
  if (into) {
    const inner = kids(s, into.id)
    const p = inner.find(o => canMerge(o, it))
    if (p) return { at: into.id, x: p.x, y: p.y, rot: p.rot, moves: [], merge: p.id }
    const { w: iw, h: ih } = room(s, into.id)
    const spot = firstFree(iw, ih, inner.map(boxOf), boxOf({ ...it, rot }))
    if (spot) return { at: into.id, x: spot.x, y: spot.y, rot: spot.turned ? !rot : rot, moves: [] }
  }
  if (!direct) return null

  const pile = hits.find(o => canMerge(o, it))
  if (pile) return { at, x: pile.x, y: pile.y, rot: pile.rot, moves: [], merge: pile.id }

  // Dropped squarely onto something the same shape: they trade places.
  const from = held.from
  if (from && hits.length === 1 && accepts(s, from.at, hits[0]) && !m.cells && !boxOf(hits[0]).cells) {
    const hb = boxOf(hits[0])
    if (hb.x === m.x && hb.y === m.y && hb.w === m.w && hb.h === m.h)
      return { at, x: m.x, y: m.y, rot, moves: [{ id: hits[0].id, at: from.at, x: from.x, y: from.y, rot: hits[0].rot !== (from.rot !== rot) }] }
  }

  const res = drop(W, H, others.map(boxOf), m, from?.at === at ? { x: from.x, y: from.y } : undefined)
  if (res) {
    const [me, ...rest] = res
    return {
      at, x: me.x, y: me.y, rot,
      moves: rest.map(r => ({ id: r.id, at, x: r.x, y: r.y, rot: !!r.rot })),
    }
  }
  if (!turnedOnce && !same(m)) {
    const turned = planDrop(s, held, at, x, y, !rot, true)
    if (turned) return turned
  }
  // Can't make room here: the one thing in the way goes back where the held item came from, if it fits there.
  if (from && hits.length === 1 && accepts(s, from.at, hits[0])) {
    const h = hits[0]
    const fromOthers = kids(s, from.at).filter(o => o.id !== it.id && o.id !== h.id).map(boxOf)
    const fb = room(s, from.at)
    for (const hr of [h.rot, !h.rot]) {
      const spot = { ...boxOf({ ...h, rot: hr }), x: from.x, y: from.y }
      const fits = spot.x + spot.w <= fb.w && spot.y + spot.h <= fb.h
      if (fits && !fromOthers.some(o => overlaps(o, spot)) && !(from.at === at && overlaps(spot, m)))
        return { at, x: m.x, y: m.y, rot, moves: [{ id: h.id, at: from.at, x: from.x, y: from.y, rot: hr }] }
    }
  }
  return null
}

export function applyDrop(s: State, held: Held, plan: Plan) {
  const it = held.item
  take(s, it)
  if (plan.merge !== undefined) {
    const into = find(s, plan.merge)!
    mergeInto(into, it, Math.min(it.n, KINDS[it.kind].stack - into.n))
    if (it.n > 0) putBack(s, held)
    return
  }
  for (const mv of plan.moves) Object.assign(find(s, mv.id)!, { at: mv.at, x: mv.x, y: mv.y, rot: mv.rot })
  s.items.push(Object.assign(it, { at: plan.at, x: plan.x, y: plan.y, rot: plan.rot }))
}

/** Nothing happened: a lifted item stays put, a split-off half rejoins its pile. */
export function putBack(s: State, held: Held) {
  if (held.from) {
    if (!find(s, held.item.id)) s.items.push(Object.assign(held.item, { at: held.from.at, x: held.from.x, y: held.from.y, rot: held.from.rot }))
  } else {
    const orig = held.splitOf !== undefined ? find(s, held.splitOf) : null
    if (orig) orig.n += held.item.n
  }
}

// ---------------------------------------------------------------- the night

/** Run one night. Mutates `s` and says what happened; quiet notes are small changes (shown on hover, not in the log). */
export function night(s: State): Note[] {
  const notes: Note[] = []
  const say = (it: Item, text: string, quiet = false) => notes.push({ id: it.id, box: it.at, kind: it.kind, text, quiet })
  const near = (it: Item) => kids(s, it.at).filter(o => o !== it && touches(boxOf(o), boxOf(it)))
  const use = (it: Item) => { if (--it.n <= 0) take(s, it) }
  const rottenAtDusk = new Set(s.items.filter(o => o.rotten).map(o => o.id))

  const boxes = s.items.filter(isBox)
  const E = new Map(boxes.map(c => [c.id, env(s, c.id)])) // worked out before anything burns
  const each = (f: (it: Item, p: Set<Prop>) => void) => { for (const c of boxes) for (const it of kids(s, c.id)) f(it, E.get(c.id)!) }

  // A fire takes one dry fuel. Without one, wet wood only smoulders.
  for (const c of boxes) {
    const fuel = spec(c)!.env.includes('fire') && E.get(c.id)!.has('lit') ? fuelOf(s, c.id) : undefined
    if (fuel) { say(fuel, 'burns to keep the fire lit'); use(fuel) }
  }

  each((it, p) => {
    if (p.has('lit')) {
      const k = KINDS[it.kind]
      if (it.rotten) { say(it, 'burns away'); take(s, it) }
      else if (k.onFire) { say(it, k.onFire === 'saltJar' ? 'boils down, leaving a jar of salt' : k.onFire === 'grilledFish' ? 'cooks through' : `smelts into ${KINDS[k.onFire].name}`); become(it, k.onFire) }
      else if (has(it, 'burns')) { say(it, 'catches fire and burns to ash'); take(s, it) }
      else if (has(it, 'wood') && it.moist) { const m = it.moist; it.moist = Math.max(0, m - 40); say(it, `dries by the fire (${m}% → ${it.moist}% damp)`, true) }
      else if (has(it, 'tool') && (it.cond ?? 100) < 100) {
        const ingot = near(it).find(o => o.kind === 'ironIngot')
        if (ingot) { say(it, `is mended with an iron ingot (${it.cond}% → 100%)`); it.cond = 100; use(ingot) }
      }
    } else if (p.has('smoky')) {
      const k = KINDS[it.kind]
      if (k.smoke && !it.rotten) { say(it, 'is smoked by the smouldering wood'); become(it, k.smoke) }
      else if (has(it, 'wood') && it.moist) { const m = it.moist; it.moist = Math.max(0, m - 15); say(it, `smoulders and steams (${m}% → ${it.moist}% damp)`, true) }
    }
  })

  each((it, p) => {
    if (!(p.has('dry') && p.has('airy')) || !it.moist) return
    const m = it.moist
    it.moist = Math.max(0, m - 35)
    const dried = KINDS[it.kind].dries
    if (dried && it.moist <= 20 && !it.rotten) { say(it, `is dry: now ${KINDS[dried].name}`); become(it, dried) }
    else say(it, `dries in the air (${m}% → ${it.moist}% damp)`, true)
  })

  each((it, p) => {
    if (!p.has('damp')) return
    const k = KINDS[it.kind]
    if (has(it, 'tool')) { const c = it.cond ?? 100; it.cond = Math.max(0, c - 15); say(it, `rusts in the damp (${c}% → ${it.cond}%)`) }
    else if (k.softens) { say(it, `goes soft in the damp: ${KINDS[k.softens].name} again`); become(it, k.softens, { moist: 50 }) }
    else if (it.moist !== undefined && it.moist < 90) { const m = it.moist; it.moist = Math.min(90, m + 25); say(it, `soaks up the damp (${m}% → ${it.moist}%)`, true) }
    else if (k.grows && p.has('dark')) grow(it, k.grows)
  })
  function grow(sp: Item, kind: string) {
    const c = find(s, sp.at)!
    const cap = near(sp).find(o => o.kind === kind && !o.rotten && o.n < KINDS[kind].stack)
    if (cap) { cap.n++; cap.fresh = KINDS[kind].fresh; say(sp, `feeds the ${KINDS[kind].name.toLowerCase()}s beside it (+1)`); return }
    const b = boxOf(sp)
    const cells: [number, number][] = []
    for (let y = b.y; y < b.y + b.h; y++) cells.push([b.x + b.w, y], [b.x - 1, y])
    for (let x = b.x; x < b.x + b.w; x++) cells.push([x, b.y + b.h], [x, b.y - 1])
    const taken = kids(s, c.id).map(boxOf)
    const free = cells.find(([x, y]) => x >= 0 && y >= 0 && x < room(s, c.id).w && y < room(s, c.id).h && !taken.some(t => overlaps(t, { id: -1, x, y, w: 1, h: 1 })))
    if (!free) { say(sp, 'needs a free spot beside it to sprout', true); return }
    s.items.push(make(s, kind, { at: c.id, x: free[0], y: free[1] }))
    say(sp, `sprouts a ${KINDS[kind].name.toLowerCase()} beside it`)
  }

  each((it, p) => {
    if (!(p.has('sealed') && p.has('dark'))) return
    const f = KINDS[it.kind].ferments
    if (f && !it.rotten) {
      if (!near(it).some(o => o.kind === f.with)) { say(it, `needs ${KINDS[f.with].name.toLowerCase()} beside it to ferment`, true); return }
      it.ferment = (it.ferment ?? 0) + 1
      if (it.ferment < f.nights) say(it, `ferments (${it.ferment}/${f.nights})`)
      else { say(it, `has become ${KINDS[f.into].name}`); become(it, f.into, { n: Math.ceil(it.n / 2), age: 0 }) }
    } else if (KINDS[it.kind].ages) {
      it.age = (it.age ?? 0) + 1
      say(it, it.age === 3 ? `has aged: now Aged ${KINDS[it.kind].name}` : it.age === 7 ? `has aged: now Old ${KINDS[it.kind].name}` : `ages in the dark (${it.age} nights)`, it.age !== 3 && it.age !== 7)
    }
  })

  // Salt keeps raw fish anywhere but the fire.
  each((it, p) => {
    if (it.kind !== 'fish' || it.rotten || p.has('lit')) return
    const jar = near(it).find(o => o.kind === 'saltJar')
    if (!jar) return
    say(it, 'is packed in salt and will keep'); become(it, 'saltedFish')
    jar.uses = (jar.uses ?? 1) - 1
    if (!jar.uses) { say(jar, 'is used up'); become(jar, 'emptyJar') }
  })

  // Food goes off, faster beside rot, faster still with flies on the rack. The cold stops it.
  each((it, p) => {
    if (it.fresh === undefined || it.rotten || has(it, 'preserved')) return
    if (p.has('cold')) return say(it, 'keeps in the cold', true)
    if (p.has('damp') && p.has('dark') && has(it, 'light')) return say(it, 'thrives in the damp dark', true)
    if (p.has('sealed') && it.ferment) return
    const byRot = near(it).some(o => rottenAtDusk.has(o.id))
    const flies = p.has('airy') && has(it, 'fish')
    const f = it.fresh
    it.fresh = Math.max(0, f - 1 - (byRot ? 1 : 0) - (flies ? 1 : 0))
    const why = byRot ? ', faster beside rot' : flies ? ', flies at it' : ''
    if (!it.fresh) { it.rotten = true; say(it, `rots${why}`) }
    else say(it, `goes off a little${why} (${f} → ${it.fresh} nights left)`, true)
  })
  return notes
}

/** Morning: bring back what the day's place gives, helped by what's packed in the basket. */
export function forage(s: State, rand = Math.random): Note[] {
  const notes: Note[] = []
  const bag = s.items.find(o => o.kind === 'basket')
  if (!bag) return notes
  const basket = kids(s, bag.id)
  const roll = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1))
  const grade = () => roll(25, 95)
  const tool = (kind: string) => basket.find(o => o.kind === kind && (o.cond ?? 0) >= 40)
  const wear = (t: Item) => { const c = t.cond!; t.cond = c - 10; notes.push({ id: t.id, box: bag.id, kind: t.kind, text: `helped, and wore a little (${c}% → ${t.cond}%)` }) }
  const finds: Item[] = []
  const add = (kind: string, n: number, extra: Partial<Item> = {}) => { if (n > 0) finds.push(make(s, kind, { n, ...extra })) }

  if (s.place === 'woods') {
    add('berries', roll(2, 5))
    const knife = tool('knife')
    add('moonleaf', roll(1, 2) + (knife ? 2 : 0))
    if (knife) wear(knife)
    const axe = tool('axe')
    add('firewood', 1 + (axe ? 1 : 0), { moist: axe ? 15 : 60 })
    if (axe) wear(axe)
    if (rand() < 0.35) add('spores', 1)
    const sharp = basket.some(o => o.kind === 'driedMoonleaf')
    if (rand() < (sharp ? 0.6 : 0.15)) add('yeast', 1)
  } else if (s.place === 'shore') {
    const net = tool('net')
    add('fish', roll(1, 2) + (net ? 2 : 0))
    if (net) wear(net)
    for (const jar of basket.filter(o => o.kind === 'emptyJar')) { notes.push({ id: jar.id, box: bag.id, kind: jar.kind, text: 'came back full of seawater' }); become(jar, 'seawater') }
    if (rand() < 0.25) add('seawater', 1)
    if (rand() < 0.5) add('firewood', 1, { moist: 80 })
  } else {
    const pick = tool('pickaxe')
    add('copperOre', roll(1, 3) + (pick ? 3 : 0), { grade: grade() })
    if (pick) wear(pick)
    const light = basket.find(o => o.kind === 'glowcap' && !o.rotten)
    if (light) {
      add('ironOre', roll(2, 3), { grade: grade() })
      notes.push({ id: light.id, box: bag.id, kind: light.kind, text: 'lit the deep seams, and was used up' })
      if (--light.n <= 0) take(s, light)
    } else if (rand() < 0.2) add('ironOre', 1, { grade: grade() })
    add('coal', roll(1, 2))
  }

  for (const f of finds) {
    const n = f.n
    const left = stow(s, bag.id, f)
    const what = [f.grade !== undefined && gradeName(f.grade), showsDamp(f) && f.moist! >= 50 && 'wet'].filter(Boolean).join(', ')
    const got = n - left ? `× ${n - left}${what ? ` (${what})` : ''}` : 'none of it'
    notes.push({ id: f.id, box: bag.id, kind: f.kind, mark: 'find', text: `${got}${left ? ` · ${left} left behind, no room in the basket` : ''}` })
  }
  return notes
}

/** First time you've held something: note it. */
function discover(s: State): Note[] {
  const notes: Note[] = []
  for (const it of s.items)
    if (!s.seen.includes(it.kind)) { s.seen.push(it.kind); notes.push({ id: it.id, box: it.at, kind: it.kind, mark: 'new', text: 'first one you have found' }) }
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
  const s: State = { day: 1, place: 'woods', target: 0, items: [], open: [], seen: [], next: 1, log: [] }
  // The workshop floor: where each container sits (cells of the field).
  const at: [string, number, number][] = [['basket', 0, 0], ['crate', 2, 0], ['coldBox', 5, 0], ['hearth', 0, 2], ['rack', 2, 2], ['shelf', 5, 2], ['barrel', 8, 0]]
  const id: Record<string, number> = {}
  for (const [kind, x, y] of at) { const c = make(s, kind, { x, y }); id[kind] = c.id; s.items.push(c) }
  s.target = id.crate
  s.open = [id.basket, id.crate]
  const put = (box: string, kind: string, extra: Partial<Item> = {}) => stow(s, id[box], make(s, kind, extra))
  put('crate', 'pickaxe', { cond: 65 })
  put('crate', 'net', { cond: 90 })
  put('crate', 'knife', { cond: 80 })
  put('crate', 'axe', { cond: 90 })
  put('crate', 'coal', { n: 3 })
  put('crate', 'firewood', { n: 2 })
  put('crate', 'copperOre', { n: 3, grade: 58 })
  put('crate', 'ironIngot', { grade: 62 })
  put('crate', 'emptyJar')
  put('crate', 'seawater')
  put('crate', 'chest')
  put('crate', 'lockbox')
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
