// The field: a grid of cells with things on it; two counters above it (outside and inside, for trading with customers); and
// containers with grids of their own. Nothing else yet.

import { drop, dropGroup, firstFree, footprintKey, nearest, overlaps, pack, turn, type Box } from './grid.ts'
import type { Goods } from './customers.ts'
import DATA from './kinds.json' with { type: 'json' }
import START from '../data/station/start.json' with { type: 'json' }
import { aliasOf } from './aliases.ts'

export const W = 25
export const H = 20

/**
 * The counters, the width of the field and four squares deep. What a customer wants to sell you is unloaded on the outside
 * one; what you want to sell them goes on the inside one, nearer the field.
 */
export type Counter = 'outside' | 'inside'
export const COUNTERS: Record<Counter, { w: number; h: number }> = { outside: { w: W, h: 4 }, inside: { w: W, h: 4 } }
/**
 * The places beside the field: the counters, the trash (emptied overnight, see `sleep`), the dock (boxes, to ship), and for
 * the night outside (outside.ts): you, a body (`back` takes one pack; `hand` is two hands), and `site`, the ground where
 * tonight's finds turn up. The hands are **flex slots**: each holds one thing, whatever its size (its `x` is which hand), so
 * `hand` is two slots wide and one deep.
 */
export type Place = Counter | 'trash' | 'dock' | 'back' | 'hand' | 'site' | 'glass'
export const PLACES: Record<Place, { w: number; h: number }> = { ...COUNTERS, trash: { w: 5, h: 6 }, dock: { w: 8, h: 6 }, back: { w: 3, h: 3 }, hand: { w: 2, h: 1 }, site: { w: 8, h: 8 }, glass: { w: 12, h: 3 } }
const isPlace = (c: unknown): c is Place => typeof c === 'string' && Object.hasOwn(PLACES, c)
/** Is it a place of flex slots (the hands): one thing a slot, any size? */
export const isFlex = (sp: Space) => !!sp && 'at' in sp && sp.at === 'hand'
/** The first flex slot free of anything but `it`, or null. */
const freeFlex = (s: State, sp: Space, it?: Item) => { const n = spaceSize(s, sp).w, taken = inSpace(s, sp).filter(o => o.id !== it?.id).map(o => o.x); for (let x = 0; x < n; x++) if (!taken.includes(x)) return x; return null }

/**
 * What a kind of thing is. `w` and `h` are its footprint's bounding box in cells; `cells`, when the footprint is not a plain
 * rectangle, says which squares inside it are taken ('#') and which are free ('.'). The rest is for people: a description
 * (for tooltips), private notes, tags (what customers ask for), a category (`cat`) and a price in coins.
 * `props` are what one thing of the kind can be on top of that: each property has values, the first one the default.
 */
export interface Kind { name: string; icon: string; color: string; w: number; h: number; cells?: string[]; desc?: string; notes?: string; tags?: string[]; slots?: Slot[]; cat?: string; price?: number; props?: Record<string, Record<string, Effect>>; holds?: number; liquid?: string; liquids?: string[]; read?: boolean; sound?: string; computer?: Machine; cut?: Cut; cuts?: boolean; ages?: boolean; stack?: Stack; furnace?: boolean; smelt?: Smelt; burns?: number; lights?: boolean; printer?: number; sheets?: number; seals?: boolean; fee?: number; wears?: number; sprite?: string; made?: Record<string, number>; need?: string; tier?: number; cell?: number; machine?: MachineSpec }
/** `holds`: it is a vessel and takes this many units of one liquid; `liquid`: a new one comes full of it; `liquids`: the only liquids it takes (a lighter: fuel); `read`: it opens as a book (see books.ts); `sound`: what it is made of, for how it sounds (see sound.ts); `computer`: its window is a screen (see computer.ts), and what the machine has; `cut`: a knife cuts pieces off it; `cuts`: it is a knife; `ages`: it ages (cheese, see AGE_DAYS); `furnace`: it smelts (see furnace.ts: its first slot is the crucible, its second the firebox); `smelt`: what it melts into; `burns`: it is fuel, and burns this many seconds; `lights`: it lights a furnace (a match is used up doing it); `printer`: it prints, plugged into a computer, and holds this many sheets; `sheets`: a ream, dropped on a printer it loads this many; `seals`: it tapes a box shut (a box is tagged `box`; sealed, nothing goes in or out until a knife cuts the tape); `fee`: what the carrier charges to take a box; `wears`: a tool good for this many nights out in your hand (outside.ts); `sprite`: drawn with another kind's sprite (every floppy disc is one picture); from the station data (scripts/station-kinds.ts): `made` what it is made of (materials and how much), `need` the station need it serves, `tier`. */
/**
 * A station machine the game runs (machines.ts): its `kind` (produce, modify, do), the time modes it runs in (`jobs`: now, or
 * over nights), the cells and energy a job costs when its recipe does not say, and for a machine with no recipes written
 * what it does instead (`generic`: recycle, charge, copy). `cell` on a kind is a cell's capacity.
 */
export interface MachineSpec { kind: string; jobs: string[]; cells: number; energy: number; generic?: string }
/** A computer's insides: `memory` (K) that programs run in, a hard disk of `disk` K (its drive C:), a processor of `speed` MHz. */
export interface Machine { memory: number; disk: number; speed: number }
/** What smelts into what: `count` of one kind (and the same properties: one metal) melt into one `into` in `secs` seconds of fire. */
export interface Smelt { into: string; count: number; secs: number }
/**
 * Something cut with a knife (a cheese wheel into wedges; a wedge, a ham into slices): `into` is what comes off, `count` how
 * many it starts with, `from` the side the pieces come off, 'left' or 'right' (it shrinks from there), `sizes` its footprint as it goes: a list
 * of [at least this many left, w, h], biggest first. `keeps`: what is left stays when the last piece comes off (an empty bag), and
 * a piece can be put back; it is taken off by hand (double-click) as well as with a knife.
 */
export interface Cut { into: string; count: number; from: string; sizes: number[][]; keeps?: boolean }
/**
 * Something made by laying things on something (a sandwich): it starts as `on` (a slice of bread) with one of `takes` laid on
 * it, holds up to `max` of them, and is finished once `lid` goes on top. Worth its parts times `open`, or `closed` once finished.
 */
export interface Stack { on: string; takes: string[]; lid: string; max: number; open: number; closed: number }
/** What a property's value does to a thing: another name, description or price, more tags, and colours swapped in its sprite (hex to hex; "none" hides whatever had that colour). */
export interface Effect { name?: string; desc?: string; tags?: string[]; price?: number; colors?: Record<string, string> }
/**
 * A container's inside: a small grid with its own rules. Most containers have one slot; some have several, named. `accepts`
 * and `rejects` are tags; nothing else is checked. `out`: things can only be taken out of it (a blister); `fill`: a new one
 * comes full of this kind, which takes on the container's properties (a blister of antibiotics holds antibiotics), `count`
 * of them at most (a cheese wheel is eight wedges, however they would pack). `role`: what the slot is for on a machine
 * (input, output, cell, tray, tool, consumable; machines.ts).
 */
export interface Slot { name?: string; role?: string; w: number; h: number; accepts?: string[]; rejects?: string[]; out?: boolean; fill?: string; count?: number }

/** What things are. Sizes are in field cells and every footprint is a plain rectangle; the data lives in kinds.json so the sprite editor can change it. */
export const KINDS: Record<string, Kind> = DATA

/** `rot` is how many quarter turns clockwise it has been turned (0 to 3): 2 is upside down. */
/** `in` says which container's slot it sits in (its x, y are then inside that slot's grid), `at` which counter it is on; neither means on the field. */
/**
 * `props` are its property values where they are not the default (`{ origin: 'synthetic' }`); `fill` is the liquid in a
 * vessel; `left` how many pieces are left in something cut (all of them when missing); `age` how many days old it is;
 * `seed` what its generated look is drawn from (a slice's fat or holes), when it is not its id; `heat` how far along it is
 * in the fire, 0 to 1 (ore melting, coal burning away; for a furnace, how hot it is); `drive` what is on a computer's own disk,
 * `wall` the picture on its desktop (a file's name there); `link` the computer a printer is plugged into, `paper` the sheets
 * in it; `print` what is printed on it; `listed` its price on Swapline, while it is for sale there (see orders.ts); `used` how
 * many nights out a tool that wears has had; `sale` what a shop asks for one of its things at night (outside.ts), and
 * `bought` once it is in your pack, paid for (taken back out, it is theirs again); `charge` what is left in a cell (full when
 * missing); `job` what a machine is doing overnight, and `residue` the part-units a recycler keeps between jobs (machines.ts).
 */
export interface Item { id: number; kind: string; x: number; y: number; rot: number; in?: { host: number; slot: number }; at?: Place; props?: Record<string, string>; fill?: Fill; left?: number; age?: number; seed?: number; layers?: Layer[]; heat?: number; drive?: DriveFile[]; wall?: string; link?: number; paper?: number; print?: Print; listed?: number; used?: number; sale?: number; bought?: boolean; charge?: number; job?: Work; residue?: Record<string, number> }
/** What is printed on a sheet or a slip: a picture (`pic`), a text (`text`, with its `title`), or an order's slip (`job`: the order's number). */
export interface Print { pic?: string; text?: string; title?: string; job?: number }
/** A file on a computer's own disk (C:): a program (`prog`, by its id in computer.ts), a text (`text`) or a picture (`pic`, its pixels). */
export interface DriveFile { name: string; prog?: string; text?: string; pic?: string }
/** One thing laid on a sandwich, bottom first: what it was, its look and its age, so it comes back off as it went on. */
export interface Layer { kind: string; seed?: number; age?: number }
/** What a thing's generated look is drawn from. */
export const seedOf = (it: Item) => it.seed ?? it.id
/**
 * The look of the face where something was cut, with `n` pieces still in it: the pattern of the next slice to come off.
 * The knife hands that slice exactly this seed, and the face shows a new one after (its count has changed).
 */
export const faceSeed = (it: Item, n: number) => (Math.imul(seedOf(it) + 1, 2654435761) ^ Math.imul(n + 7, 40503)) >>> 0
export interface Fill { liquid: string; amount: number }

/**
 * What can be in a vessel. Not things: a vessel holds whole units of one liquid. A liquid gives its vessel its tags (a bottle
 * of water is a drink) and is worth `price` a unit. `color` and `opacity` are how it looks through clear glass.
 */
export interface Liquid { name: string; color: string; opacity: number; tags: string[]; price: number; desc: string }
export const LIQUIDS: Record<string, Liquid> = {
  water: { name: 'water', color: '#8fbfd6', opacity: 0.4, tags: ['drink'], price: 1, desc: 'Clean, or near enough.' },
  wine: { name: 'wine', color: '#6a1a2a', opacity: 0.88, tags: ['drink', 'alcohol'], price: 2, desc: 'Red.' },
  spirit: { name: 'spirit', color: '#e2ecf2', opacity: 0.32, tags: ['alcohol', 'medicine'], price: 3, desc: 'Clear and strong: to drink, or to clean a wound.' },
  oil: { name: 'lamp oil', color: '#c99a2e', opacity: 0.82, tags: ['fuel'], price: 2, desc: 'Burns in a lamp or a stove.' },
}

/** How much of the held vessel's liquid would pour into that one: all of it that fits, if that one is empty or holds the same. 0 if none. */
export function canPour(from: Item, to: Item): number {
  const cap = KINDS[to.kind]?.holds ?? 0
  const have = from.fill?.amount ?? 0
  if (!have || !cap || from.id === to.id || (to.fill && to.fill.liquid !== from.fill!.liquid)) return 0
  if (KINDS[to.kind].liquids && !KINDS[to.kind].liquids!.includes(from.fill!.liquid)) return 0
  return Math.min(have, cap - (to.fill?.amount ?? 0))
}
/** Pour one vessel into another (see canPour); an emptied vessel holds nothing. How much went. */
export function pour(from: Item, to: Item): number {
  const n = canPour(from, to)
  if (!n) return 0
  to.fill = { liquid: from.fill!.liquid, amount: (to.fill?.amount ?? 0) + n }
  from.fill!.amount -= n
  if (!from.fill!.amount) delete from.fill
  return n
}
/** Fill a vessel to the brim with a liquid, or empty it (null). */
export function fillWith(it: Item, liquid: string | null) {
  const cap = KINDS[it.kind]?.holds ?? 0
  if (cap && liquid && LIQUIDS[liquid] && (KINDS[it.kind].liquids?.includes(liquid) ?? true)) it.fill = { liquid, amount: cap }
  else delete it.fill
}
/**
 * An open container: a window floating over the page, showing the container's insides. `id` is the container item; `x`, `y`
 * are screen pixels (its top-left); a folded one shows only as a tab in the rack along the top edge.
 */
/** `full`: a computer's window filling the page (see computer.ts). */
export interface Win { id: number; x: number; y: number; folded?: boolean; full?: boolean }
/**
 * `windows` are the open containers, the last one on top; `cash` is the money you have; `day` which day it is (from 1, see
 * `sleep`); `night` the line is over and the evening has begun (outside.ts); `out` you are out at a site, with `left` searches;
 * `energy` what you have left today to start machine jobs by hand (machines.ts; full when missing).
 */
export interface State { items: Item[]; next: number; windows?: Win[]; cash?: number; day?: number; orders?: Order[]; web?: WebData; mail?: Mail[]; night?: boolean; out?: Out; energy?: number; story?: Record<string, number> }
/** A machine's overnight job: the recipe (or a generic job), the nights still to go, and what will come out of it. */
export interface Work { recipe: string; nights: number; outs: { id: string; n: number }[] }
/** Out tonight (outside.ts): at which place, how many searches are left, and at a shop what it buys. */
export interface Out { site: string; left: number; buys?: Buys }
/** What a shop buys from you, at `mult` of what a thing is worth: anything, things for some needs, or things with some tags. */
export interface Buys { any?: boolean; needs?: string[]; tags?: string[]; mult: number }
/**
 * A message on the terminal (orders.ts): an order from someone on the station (`job`), a note, spam, word of something sold
 * on Swapline or of a box paid for. `read` once opened.
 */
export interface Mail { id: number; day: number; from: string; subject: string; text: string; kind: 'order' | 'note' | 'spam' | 'sale' | 'paid'; read?: boolean; job?: Job }
/** What an order wants (`n` of each kind, whole), what it pays on delivery, the day it is due; where it has got to, and what it paid. */
export interface Job { wants: { kind: string; n: number }[]; pay: number; due: number; state: 'open' | 'taken' | 'done' | 'lapsed' | 'declined'; paid?: number }
/**
 * Something bought on the Wire (see orders.ts), on its way: its goods, made as customers' goods are; by drone (`at` is when
 * it lands, ms since 1970) or by freight (`at` is the morning it comes); `from` the shop.
 */
export interface Order { id: number; goods: Goods[]; by: 'drone' | 'freight'; at: number; from: string }
/** What the Wire remembers: the last order's number, swap listings sold, the guestbook, the bank's lines. */
export interface WebData { seq?: number; sold?: string[]; book?: { name: string; text: string; day: number }[]; log?: { day: number; text: string; amount: number }[] }
/** What a new game starts with. */
export const START_CASH = 50

/** How many containers can be open at once. */
export const MAX_WINDOWS = 4

const SHAPES = new Map<string, { sig: string; box: Box }>()
/** A kind's footprint as the grid sees it, facing the way it is made. */
export function shapeOf(kind: string): Box {
  const k = KINDS[kind]
  const sig = `${k.w}x${k.h}:${k.cells?.join('/') ?? ''}`
  const hit = SHAPES.get(kind)
  if (hit && hit.sig === sig) return hit.box
  const box: Box = { id: -1, x: 0, y: 0, w: k.w, h: k.h }
  if (k.cells) box.cells = k.cells.flatMap((row, y) => [...row].flatMap((c, x) => c === '#' ? [[x, y] as const] : []))
  SHAPES.set(kind, { sig, box })
  return box
}
/** How many pieces are left in something cut (0 for anything else). */
export const leftOf = (it: Item) => { const c = KINDS[it.kind]?.cut, n = Math.round(Number(it.left ?? c?.count)); return c ? c.keeps ? Math.max(0, Math.min(c.count, Number.isNaN(n) ? c.count : n)) : Math.max(1, Math.min(c.count, n || c.count)) : 0 }
/** A thing's footprint before turning: its kind's, or for something being cut, the size for what is left of it. */
export function sizeOf(it: Item): { w: number; h: number } {
  const k = KINDS[it.kind], c = k.cut
  if (!c) return { w: k.w, h: k.h }
  const n = leftOf(it), size = c.sizes.find(([min]) => n >= min) ?? c.sizes[c.sizes.length - 1]
  return { w: size[1], h: size[2] }
}
const shapeOfItem = (it: Item): Box => KINDS[it.kind]?.cut ? { id: -1, x: 0, y: 0, ...sizeOf(it) } : shapeOf(it.kind)
export const quarter = (n: number) => ((Math.round(Number(n)) % 4) + 4) % 4
export function boxOf(it: Item): Box {
  let b = shapeOfItem(it)
  for (let i = 0; i < quarter(it.rot); i++) b = turn(b)
  return { ...b, id: it.id, x: it.x, y: it.y, rot: quarter(it.rot) }
}
export const dims = (it: Item) => { const b = boxOf(it); return { w: b.w, h: b.h } }
/** Every square an item takes, as it sits (relative to its top-left). */
export function cellsOf(it: Item): [number, number][] {
  const b = boxOf(it)
  return b.cells ? b.cells.map(([x, y]) => [x, y] as [number, number]) : Array.from({ length: b.w * b.h }, (_, i) => [i % b.w, Math.floor(i / b.w)] as [number, number])
}
/** The squares a kind takes at rest (or turned a quarter): what the editor draws and the footprint painter edits. */
export const kindCells = (kind: string, turned: boolean | number = 0) => cellsOf({ id: -1, kind, x: 0, y: 0, rot: Number(turned) })

export const find = (s: State, id: number) => s.items.find(o => o.id === id)

/** A thing's property values, the defaults filled in. */
export function propsOf(it: Item): Record<string, string> {
  const defs = KINDS[it.kind]?.props ?? {}
  return Object.fromEntries(Object.entries(defs).map(([p, vals]) => [p, it.props?.[p] && it.props[p] in vals ? it.props[p] : Object.keys(vals)[0]]))
}
/** What a thing is with its properties applied: its name, description, tags, price and the colours swapped in its sprite. */
export function look(it: Item): { name: string; desc?: string; tags: string[]; price: number; colors: Record<string, string> } {
  const k = KINDS[it.kind]
  const out = { name: k.name, desc: k.desc, tags: [...k.tags ?? []], price: k.price ?? 0, colors: {} as Record<string, string> }
  for (const [p, v] of Object.entries(propsOf(it))) {
    const e = k.props![p][v]
    if (e.name) out.name = e.name
    if (e.desc) out.desc = e.desc
    if (e.tags) out.tags.push(...e.tags)
    if (e.price !== undefined) out.price = e.price
    Object.assign(out.colors, e.colors)
  }
  if (it.fill) out.tags.push(...LIQUIDS[it.fill.liquid]?.tags ?? [])
  // something cut is worth its pieces (as old as it is), so cutting it neither makes nor loses money
  const piece = k.cut && KINDS[k.cut.into] ? k.cut.into : null
  if (piece) out.price = leftOf(it) * look({ id: 0, kind: piece, x: 0, y: 0, rot: 0, ...(it.age ? { age: it.age } : {}) }).price
  else if (k.cut) out.price = Math.round(out.price * leftOf(it) / k.cut.count)
  if (k.stack) { const done = closed(it); out.price = Math.ceil(partsOf(it) * (done ? k.stack.closed : k.stack.open)); if (!done) out.name = `Open ${out.name[0].toLowerCase()}${out.name.slice(1)}` }
  if (k.ages && (it.age ?? 0) >= AGE_DAYS) { out.name = `Aged ${out.name[0].toLowerCase()}${out.name.slice(1)}`; if (!piece) out.price = Math.round(out.price * 1.5) }
  return out
}
/**
 * How many days a cheese takes to age: on the way it turns from pale cheddar to orange (`aged` is how far along, 0 to 1),
 * and after it is called aged and is worth more. Nothing counts days yet: a thing's `age` is set where it comes from (the
 * debug panel), for later.
 */
export const AGE_DAYS = 10
export const aged = (it: Item) => Math.max(0, Math.min(1, (it.age ?? 0) / AGE_DAYS))
/** What a sandwich's makings are worth: its bread and everything laid on it. */
export const partsOf = (it: Item) => (KINDS[it.kind].price ?? 0) + (it.layers ?? []).reduce((n, l) => n + look({ id: 0, x: 0, y: 0, rot: 0, ...l }).price, 0)
/** Is it finished (its lid on)? */
export const closed = (it: Item) => { const st = KINDS[it.kind]?.stack, l = it.layers ?? []; return !!st && l.length > 1 && l[l.length - 1].kind === st.lid }
/** A thing's colour swatch (menu rows, window headers): its kind's colour, or what its properties turn that colour into. */
export const swatch = (it: Item) => { const c = KINDS[it.kind].color; return look(it).colors[c.toLowerCase()] ?? c }
/** What a thing is worth: its own price, its liquid, and everything inside it. */
export const worth = (s: State, it: Item): number => look(it).price + (it.fill ? (LIQUIDS[it.fill.liquid]?.price ?? 0) * it.fill.amount : 0) + contents(s, it.id).reduce((n, o) => n + worth(s, o), 0)

// ---------------------------------------------------------------- places: the field, and the insides of containers

/** Somewhere things can sit: the field (null), a counter or the trash, or one slot of a container item. */
export type Space = { host: number; slot: number } | { at: Place } | null
export type SlotSpace = { host: number; slot: number }
/** Is this place inside a container (not the field or a counter)? */
export const isSlot = (sp: Space): sp is SlotSpace => !!sp && 'host' in sp
export const spaceOf = (it: Item): Space => it.in ?? (it.at ? { at: it.at } : null)
export const spaceKey = (sp: Space) => !sp ? 'field' : isSlot(sp) ? `${sp.host}:${sp.slot}` : sp.at
export const sameSpace = (a: Space, b: Space) => spaceKey(a) === spaceKey(b)
/** The place a grid's key names: "field", a counter, "trash", or "host:slot". */
export function spaceFromKey(k: string): Space {
  if (k === 'field') return null
  if (isPlace(k)) return { at: k }
  const [host, slot] = k.split(':').map(Number)
  return { host, slot }
}
export const isContainer = (kind: string) => !!KINDS[kind]?.slots?.length
const slotOf = (s: State, sp: SlotSpace) => { const host = find(s, sp.host); return host ? KINDS[host.kind]?.slots?.[sp.slot] : undefined }
export function spaceSize(s: State, sp: Space): { w: number; h: number } {
  if (!sp) return { w: W, h: H }
  if (!isSlot(sp)) return PLACES[sp.at]
  const host = find(s, sp.host)
  const slot = host && KINDS[host.kind]?.slots?.[sp.slot]
  return slot ? { w: slot.w, h: slot.h } : { w: 0, h: 0 }
}
export const inSpace = (s: State, sp: Space) => s.items.filter(o => sameSpace(spaceOf(o), sp))
/** What is inside a container, in any of its slots. */
export const contents = (s: State, host: number) => s.items.filter(o => o.in?.host === host)

/** Containers do not go in containers, except kinds tagged `vessel` (bottles and the like), which take a second level and no more. */
export const MAX_NEST = 2
/** An item and the containers it is in, innermost first (a broken save's loop is walked once). */
const chain = (s: State, id: number) => { const out: Item[] = []; for (let o = find(s, id); o && !out.includes(o); o = o.in ? find(s, o.in.host) : undefined) out.push(o); return out }
/** Is `id` the item `anc`, or somewhere inside it? */
const within = (s: State, id: number, anc: number) => chain(s, id).some(o => o.id === anc)
/** Is `id` one of `ids`, or somewhere inside one of them? */
export const under = (s: State, id: number, ids: number[]) => chain(s, id).some(o => ids.includes(o.id))
/** How many containers deep this item goes, itself included (0 for something that holds nothing). */
const height = (s: State, it: Item, seen = new Set<number>()): number => isContainer(it.kind) && !seen.has(it.id) ? (seen.add(it.id), 1 + Math.max(0, ...contents(s, it.id).map(o => height(s, o, seen)))) : 0

/**
 * The window (`glass`) and the inside counter are the shop's advert: what is out draws the people who need it. A thing in the
 * window pulls twice as hard as one on the counter. The weight each need gets in tomorrow's line (1 with nothing out), and how
 * many more people come for a full window (one for every three things in it, at most two). Things in the window are shown, not sold.
 */
export const GLASS_PULL = 2, PULL_STEP = 0.2
export function pull(s: State): Record<string, number> {
  const w: Record<string, number> = {}
  for (const [at, k] of [['inside', 1], ['glass', GLASS_PULL]] as const) for (const it of inSpace(s, { at })) { const n = KINDS[it.kind]?.need; if (n) w[n] = (w[n] ?? 1) + PULL_STEP * k }
  return w
}
export const footfall = (s: State) => Math.min(2, Math.floor(inSpace(s, { at: 'glass' }).length / 3))

/** The pack on your back, if there is one. */
export const worn = (s: State) => inSpace(s, { at: 'back' })[0] as Item | undefined
/** Out at a site, only the ground there, your hands and the inside of the pack on your back are within reach. */
const reach = (s: State, sp: Space) => isSlot(sp) ? sp.host === worn(s)?.id : placeOf(sp) === 'site' || placeOf(sp) === 'hand'
/** Which place beside the field a space is, if it is one. */
const placeOf = (sp: Space) => sp && !isSlot(sp) ? sp.at : null
/**
 * Would this space take that item? The field, the counters and the trash take anything; the dock takes boxes; your back one
 * pack and your hand one tool; the ground at a site only what is out there with you. A slot checks its tag rules, refuses
 * cycles, and keeps the nesting limit. A take-out-only slot keeps only what is already in it. Out at a site, nothing at
 * home is in reach.
 */
export function accepts(s: State, it: Item, sp: Space): boolean {
  if ((it.in && find(s, it.in.host)?.job) || (isSlot(sp) && find(s, sp.host)?.job)) return false // a machine busy overnight holds what is in it
  if (s.out && !(reach(s, sp) && (reach(s, spaceOf(it)) || !s.items.includes(it)))) return false // (something new turns up where it is made)
  const at = placeOf(sp)
  if (s.out?.buys) { // at a shop: buy only what you can pay for; lay down only what they buy (their own goods go back freely)
    const b = s.out.buys, k = KINDS[it.kind]
    if (at === 'site' && it.sale === undefined && s.items.includes(it) && !(b.any || (b.needs ?? []).includes(k?.need ?? '') || look(it).tags.some(t => (b.tags ?? []).includes(t)))) return false
    if (isSlot(sp) && it.sale !== undefined && !it.bought && (s.cash ?? 0) < it.sale) return false
  }
  if (at === 'site') return !!s.out
  if (at === 'glass') { const tg = look(it).tags; return !isBox(it) && (!tg.includes('fixture') || tg.includes('glass')) } // the window shows goods, not machines, furniture or parcels (a fixture tagged `glass` is made for it)
  if (at === 'back') return look(it).tags.includes('pack') && inSpace(s, sp).every(o => o.id === it.id)
  if (at === 'hand') return freeFlex(s, sp, it) !== null // anything, while a hand is free
  if (!isSlot(sp)) return sp?.at !== 'dock' || isBox(it) // the dock takes boxes, to ship
  const host = find(s, sp.host)
  if (host && sealed(host) && !sameSpace(spaceOf(it), sp)) return false // taped shut: what is in it stays, nothing new goes in
  const slot = host && KINDS[host.kind]?.slots?.[sp.slot]
  if (!host || !slot || within(s, sp.host, it.id)) return false
  if (slot.out && !sameSpace(spaceOf(it), sp)) return false
  const tags = look(it).tags
  if (isContainer(it.kind) && !tags.includes('vessel')) return false // only specialised containers (a water bottle) go inside another
  if (slot.accepts?.length && !tags.some(t => slot.accepts!.includes(t))) return false
  if (tags.some(t => slot.rejects?.includes(t))) return false
  return chain(s, sp.host).length + height(s, it) <= MAX_NEST
}

/** Boxes, for shipping: sealed, nothing goes in or out (see `Kind.seals`). */
export const isBox = (it: Item) => !!KINDS[it.kind]?.tags?.includes('box')
export const sealed = (it: Item) => isBox(it) && propsOf(it).tape === 'sealed'

// ---------------------------------------------------------------- dragging

/** What's in hand: the thing you grabbed (`item`) and whatever was selected with it in the same place (`items`, the grabbed one first), and where each was lifted from. */
export interface Held { item: Item; items: Item[]; space: Space; from: { x: number; y: number; rot: number }; froms: { id: number; x: number; y: number; rot: number; space: Space }[] }
export interface Plan { space: Space; x: number; y: number; rot: number; moves: { id: number; x: number; y: number; rot: number; group?: boolean }[] }

/** Pick up an item; if it is one of several selected in the same place, they all come with it. */
export function lift(s: State, id: number, selected: number[] = []): Held | null {
  const it = find(s, id)
  if (!it) return null
  const here = spaceOf(it)
  const rest = selected.includes(id) ? selected.filter(i => i !== id).map(i => find(s, i)).filter((o): o is Item => !!o && sameSpace(spaceOf(o), here)) : []
  const items = [it, ...rest]
  return { item: it, items, space: here, from: { x: it.x, y: it.y, rot: it.rot }, froms: items.map(o => ({ id: o.id, x: o.x, y: o.y, rot: o.rot, space: spaceOf(o) })) }
}

/**
 * Where the held thing goes if dropped in `space` with its top-left at (x, y). The easy way (`strict` false): whatever is in
 * the way gives way (a straight swap, a shove, a hop, or turning). Strict: nothing else ever moves; it goes there only if the
 * squares are free, and is otherwise refused (null). A space that will not take it (wrong kind, too deep, no room) refuses too.
 */
export function planDrop(s: State, held: Held, space: Space, x: number, y: number, rot: number, strict = false, turnedOnce = false): Plan | null {
  if (isSlot(space) && slotOf(s, space)?.out) return null // nothing goes into a take-out-only slot, not even back to another spot in it
  if (held.items.some(o => !accepts(s, o, space))) return null
  if ((placeOf(space) === 'back' || placeOf(space) === 'hand') && held.items.length > 1) return null // one pack; one thing a hand
  if (isFlex(space)) { // into the hand it is over, or the other if that one is full; hand to hand, the two swap
    const it = held.item, want = Math.max(0, Math.min(spaceSize(s, space).w - 1, x)), there = inSpace(s, space).find(o => o.x === want && o.id !== it.id)
    if (!there) return { space, x: want, y: 0, rot: it.rot, moves: [] }
    if (sameSpace(held.space, space)) return { space, x: want, y: 0, rot: it.rot, moves: [{ id: there.id, x: held.from.x, y: 0, rot: there.rot }] }
    const other = freeFlex(s, space, it)
    return other === null ? null : { space, x: other, y: 0, rot: it.rot, moves: [] }
  }
  const { w: SW, h: SH } = spaceSize(s, space)
  if (!SW || !SH) return null
  if (held.items.length > 1) return planGroup(s, held, space, x, y, strict) ?? (isSlot(space) ? packInto(s, held, space) : null) // a lot that will not go in as it lies is packed in
  const it = held.item
  const d = dims({ ...it, rot })
  const others = inSpace(s, space).filter(o => o.id !== it.id)
  const m: Box = { ...boxOf({ ...it, rot }), x: Math.max(0, Math.min(SW - d.w, x)), y: Math.max(0, Math.min(SH - d.h, y)) }
  const tooBig = d.w > SW || d.h > SH // too big this way round: only turning can help (relaxed mode)
  if (strict) return tooBig || others.some(o => overlaps(boxOf(o), m)) ? null : { space, x: m.x, y: m.y, rot, moves: [] }

  // Dropped squarely onto something of the same shape, from the same place: they trade places.
  const hits = others.filter(o => { const b = boxOf(o); return b.x < m.x + m.w && m.x < b.x + b.w && b.y < m.y + m.h && m.y < b.y + b.h })
  if (sameSpace(space, held.space) && hits.length === 1 && !m.cells && !boxOf(hits[0]).cells) {
    const hb = boxOf(hits[0])
    if (hb.x === m.x && hb.y === m.y && hb.w === m.w && hb.h === m.h)
      return { space, x: m.x, y: m.y, rot, moves: [{ id: hits[0].id, x: held.from.x, y: held.from.y, rot: quarter(hits[0].rot + held.from.rot - rot) }] }
  }

  const res = tooBig ? null : drop(SW, SH, others.map(boxOf), m, sameSpace(space, held.space) ? { x: held.from.x, y: held.from.y } : undefined)
  if (res) {
    const [me, ...rest] = res
    return { space, x: me.x, y: me.y, rot, moves: rest.map(r => ({ id: r.id, x: r.x, y: r.y, rot: r.rot ?? 0 })) }
  }
  // Nowhere as it is: try each other way round that is a different footprint (turning a square changes nothing, so that is not tried).
  if (!turnedOnce) {
    for (let i = 1; i < 4; i++) {
      const r2 = quarter(rot + i)
      if (footprintKey(boxOf({ ...it, rot: r2 })) === footprintKey(m)) continue
      const p = planDrop(s, held, space, x, y, r2, false, true)
      if (p) return p
    }
  }
  return null
}

/** Several selected things dropped together, keeping their places relative to each other (and their turn). */
function planGroup(s: State, held: Held, space: Space, x: number, y: number, strict: boolean): Plan | null {
  const { w: SW, h: SH } = spaceSize(s, space)
  const ids = new Set(held.items.map(o => o.id))
  const others = inSpace(s, space).filter(o => !ids.has(o.id))
  const rel = held.items.map((o, i) => ({ o, dx: held.froms[i].x - held.from.x, dy: held.froms[i].y - held.from.y }))
  const minDx = Math.min(...rel.map(r => r.dx)), maxDx = Math.max(...rel.map(r => r.dx + dims(r.o).w))
  const minDy = Math.min(...rel.map(r => r.dy)), maxDy = Math.max(...rel.map(r => r.dy + dims(r.o).h))
  if (maxDx - minDx > SW || maxDy - minDy > SH) return null
  const tx = Math.max(-minDx, Math.min(SW - maxDx, x)), ty = Math.max(-minDy, Math.min(SH - maxDy, y))
  const boxes = rel.map(r => ({ ...boxOf(r.o), x: tx + r.dx, y: ty + r.dy }))
  const members = boxes.slice(1).map(b => ({ id: b.id, x: b.x, y: b.y, rot: b.rot ?? 0, group: true }))
  if (strict) return others.some(o => boxes.some(b => overlaps(boxOf(o), b))) ? null : { space, x: tx, y: ty, rot: held.item.rot, moves: members }
  const res = dropGroup(SW, SH, others.map(boxOf), boxes, sameSpace(space, held.space) ? { x: held.from.x, y: held.from.y } : undefined)
  if (!res) return null
  return { space, x: tx, y: ty, rot: held.item.rot, moves: [...members, ...res.slice(boxes.length).map(r => ({ id: r.id, x: r.x, y: r.y, rot: r.rot ?? 0 }))] }
}

/**
 * Pack what is held into a container's slot (every one of them must be one it takes): around what is there, or failing that
 * with what is there packed again too (it shifts about inside). Where each goes, or null.
 */
function packInto(s: State, held: Held, space: SlotSpace): Plan | null {
  const slot = slotOf(s, space)
  if (!slot || held.items.some(o => !accepts(s, o, space))) return null
  const there = inSpace(s, space).filter(o => !held.items.includes(o)), shape = (o: Item) => ({ ...boxOf(o), x: 0, y: 0 })
  const around = pack(slot.w, slot.h, there.map(boxOf), held.items.map(shape))
  const placed = around ?? pack(slot.w, slot.h, [], [...held.items, ...there].map(shape))
  if (!placed) return null
  const [a, ...rest] = placed, n = held.items.length
  return { space, x: a.x, y: a.y, rot: a.rot ?? 0, moves: rest.map((b, i) => ({ id: b.id, x: b.x, y: b.y, rot: b.rot ?? 0, ...i + 1 < n ? { group: true } : {} })) }
}
/** Dropped onto a container itself: into the first of its slots that takes the lot and has room for it, packed in (see `pack`). */
export function intoHost(s: State, held: Held, hostId: number): Plan | null {
  const host = find(s, hostId)
  if (!host || held.items.some(o => o.id === hostId || within(s, hostId, o.id))) return null
  for (let i = 0; i < (KINDS[host.kind]?.slots ?? []).length; i++) { const p = packInto(s, held, { host: hostId, slot: i }); if (p) return p }
  return null
}

/** Put an item in a place (its x, y are then in that place's grid). */
const setIn = (o: Item, sp: Space) => {
  delete o.in; delete o.at
  if (isSlot(sp)) o.in = { host: sp.host, slot: sp.slot }
  else if (sp) o.at = sp.at
}

export function applyDrop(s: State, held: Held, plan: Plan) {
  for (const mv of plan.moves) {
    const o = find(s, mv.id)!
    Object.assign(o, { x: mv.x, y: mv.y, rot: mv.rot })
    if (mv.group) setIn(o, plan.space)
  }
  Object.assign(held.item, { x: plan.x, y: plan.y, rot: plan.rot })
  setIn(held.item, plan.space)
}

/** Nothing happened: everything lifted goes back where it was. */
export function putBack(held: Held) {
  held.items.forEach((o, i) => { const f = held.froms[i]; Object.assign(o, { x: f.x, y: f.y, rot: f.rot }); setIn(o, f.space) })
}

/** Take things off the field, and whatever was inside them. */
export function remove(s: State, ids: number[]) {
  const gone = new Set(ids)
  for (let grew = true; grew;) { grew = false; for (const o of s.items) if (!gone.has(o.id) && o.in && gone.has(o.in.host)) { gone.add(o.id); grew = true } }
  s.items = s.items.filter(o => !gone.has(o.id))
  if (s.windows) s.windows = s.windows.filter(w => !gone.has(w.id))
}

/** Containers that would take the held thing (some slot accepts it and it is not already inside). */
export const hostsFor = (s: State, held: Item[]) => s.items.filter(o => isContainer(o.kind) && !held.some(h => h.id === o.id || h.in?.host === o.id) && (KINDS[o.kind].slots ?? []).some((_, i) => held.every(h => accepts(s, h, { host: o.id, slot: i }))))

/** Lay items out in a w x h space: keep what is valid, re-place what overlaps or hangs off (turning if it must); return what fits and what does not. */
function layout(items: Item[], w: number, h: number): { kept: Item[]; lost: Item[] } {
  const kept: Item[] = [], lost: Item[] = []
  for (const it of items) {
    const b = boxOf(it)
    if (b.x >= 0 && b.y >= 0 && b.x + b.w <= w && b.y + b.h <= h && !kept.some(o => overlaps(boxOf(o), b))) { kept.push(it); continue }
    const spot = firstFree(w, h, kept.map(boxOf), { ...boxOf({ ...it, rot: 0 }), x: 0, y: 0 })
    if (spot) kept.push({ ...it, x: spot.x, y: spot.y, rot: spot.rot }); else lost.push(it)
  }
  return { kept, lost }
}

/** Flex slots (the hands): one thing a slot, in the slot it names if that is free, else the next free one. */
function flexLayout(items: Item[], n: number): { kept: Item[]; lost: Item[] } {
  const kept: Item[] = [], lost: Item[] = []
  for (const it of items) {
    const want = Number.isInteger(it.x) && it.x >= 0 && it.x < n && !kept.some(o => o.x === it.x) ? it.x : [...Array(n).keys()].find(x => !kept.some(o => o.x === x))
    if (want === undefined) lost.push(it); else kept.push({ ...it, x: want, y: 0 })
  }
  return { kept, lost }
}
/** A liquid only in a vessel, only one that exists, and no more than the vessel holds. */
function cleanFill(o: Item): { fill?: Fill } {
  const cap = KINDS[o.kind]?.holds ?? 0
  const n = Math.min(cap, Math.floor(Number(o.fill?.amount) || 0))
  return o.fill && LIQUIDS[o.fill.liquid] && n > 0 ? { fill: { liquid: o.fill.liquid, amount: n } } : {}
}
/** How much is left of something cut, how old a thing that ages is, and what its look is drawn from, where they make sense. */
function cleanCut(o: Item): { left?: number; age?: number; heat?: number; used?: number; sale?: number; bought?: boolean; charge?: number; job?: Work; residue?: Record<string, number> } {
  const k = KINDS[o.kind], c = k?.cut, n = Math.round(Number(o.left)), heat = Number(o.heat), used = Math.round(Number(o.used))
  const cap = k?.cell, charge = Number(o.charge), job = o.job && typeof o.job.recipe === 'string' && Array.isArray(o.job.outs) ? { job: { recipe: o.job.recipe, nights: Math.max(1, Math.round(Number(o.job.nights)) || 1), outs: o.job.outs.filter(x => KINDS[x?.id] && x.n > 0) } } : {}
  return { ...(cap && Number.isFinite(charge) && charge >= 0 && charge < cap ? { charge } : {}), ...(k?.machine ? job : {}), ...(k?.machine && o.residue && typeof o.residue === 'object' ? { residue: o.residue } : {}), ...(Number(o.sale) > 0 ? { sale: Math.round(Number(o.sale)) } : {}), ...(o.bought === true ? { bought: true } : {}), ...(c && n >= (c.keeps ? 0 : 1) && n < c.count ? { left: n } : {}), ...(k?.wears && used > 0 ? { used: Math.min(k.wears - 1, used) } : {}), ...((k?.furnace || k?.smelt || k?.burns) && heat > 0 ? { heat: Math.min(1, heat) } : {}), ...(KINDS[o.kind]?.ages && Number(o.age) > 0 ? { age: Number(o.age) } : {}), ...(Number.isFinite(o.seed) ? { seed: Number(o.seed) } : {}) }
}
/** A sandwich's layers, of kinds that still exist (no more than it holds); one with nothing on it is its bread again. */
function cleanLayers(o: Item): { kind?: string; layers?: Layer[] } {
  const st = KINDS[o.kind]?.stack
  if (!st) return {}
  const layers = (Array.isArray(o.layers) ? o.layers : []).filter(l => KINDS[l?.kind]).slice(0, st.max + 1)
    .map(l => ({ kind: l.kind, ...(Number.isFinite(l.seed) ? { seed: Number(l.seed) } : {}), ...(Number(l.age) > 0 ? { age: Number(l.age) } : {}) }))
  return layers.length ? { layers } : { kind: st.on }
}
/** A printer's link and paper, what is printed on a sheet, a price on Swapline: kept where they make sense (a link to a computer that is gone is dropped after). */
function cleanPrinted(o: Item): { link?: number; paper?: number; print?: Print; listed?: number } {
  const k = KINDS[o.kind], str = (v: unknown) => typeof v === 'string' ? v : undefined, p = o.print
  const print = p && typeof p === 'object' ? Object.fromEntries(Object.entries({ pic: str(p.pic), text: str(p.text), title: str(p.title), job: Number.isInteger(p.job) ? p.job : undefined }).filter(([, v]) => v !== undefined)) as Print : null
  return { ...(k?.printer && Number.isInteger(o.link) ? { link: o.link } : {}), ...(k?.printer && Number(o.paper) > 0 ? { paper: Math.min(k.printer, Math.round(Number(o.paper))) } : {}), ...(print && Object.keys(print).length ? { print } : {}), ...(Number(o.listed) > 0 ? { listed: Math.round(Number(o.listed)) } : {}) }
}
/** A computer's disk: files with a name, each one thing (a program, a text or a picture), and its wallpaper if that file is still there. */
function cleanDrive(o: Item): { drive?: DriveFile[]; wall?: string } {
  if (!KINDS[o.kind]?.computer || !Array.isArray(o.drive)) return {}
  const str = (v: unknown) => typeof v === 'string' ? v : undefined
  const drive: DriveFile[] = o.drive.filter(f => typeof f?.name === 'string' && f.name.trim()).map((f): DriveFile => ({ name: f.name.trim().toUpperCase().slice(0, 12), ...(str(f.prog) ? { prog: f.prog } : str(f.pic) ? { pic: f.pic } : { text: str(f.text) ?? '' }) }))
    .filter((f, i, all) => all.findIndex(g => g.name === f.name) === i)
  return drive.length ? { drive, ...(drive.some(f => f.name === o.wall && f.pic) ? { wall: o.wall } : {}) } : {}
}
/** Only properties the kind still has, with values it still knows, and none that are the default. */
function cleanProps(o: Item): { props?: Record<string, string> } {
  const defs = KINDS[o.kind]?.props ?? {}
  const kept = Object.entries(o.props ?? {}).filter(([p, v]) => defs[p] && v in defs[p] && Object.keys(defs[p])[0] !== v)
  return kept.length ? { props: Object.fromEntries(kept) } : {}
}

/**
 * After sizes or kinds changed under a saved layout: drop things that no longer exist, send things whose container is gone
 * (or now refuses them) out to the field, and re-place anything that now overlaps or hangs off its grid.
 */
export function settle(s: State): State {
  // a kind from before the station's items is what it became (old saves; see aliases.ts), in items, orders and mail
  const now = (kind: string, props?: Record<string, string>) => KINDS[kind] ? kind : aliasOf(kind, props) ?? kind
  s = { ...s, items: (Array.isArray(s.items) ? s.items : []).map(o => o && !KINDS[o.kind] ? { ...o, kind: now(o.kind, o.props) } : o), ...(Array.isArray(s.orders) ? { orders: s.orders.map(o => ({ ...o, goods: (o.goods ?? []).map(g => g && !KINDS[g.kind] ? { ...g, kind: now(g.kind, g.props) } : g) })) } : {}), ...(Array.isArray(s.mail) ? { mail: s.mail.map(m => m?.job ? { ...m, job: { ...m.job, wants: (m.job.wants ?? []).map(w => ({ ...w, kind: now(w.kind) })) } } : m) } : {}) }
  // only what an item still is: no old properties, liquids or machine state (and nothing on a counter that does not exist)
  // (and each id once: a broken save's duplicates would collide)
  const ids0 = new Set<number>()
  const items: Item[] = s.items.filter(o => KINDS[o.kind] && Number.isInteger(o.id) && !ids0.has(o.id) && ids0.add(o.id)).map(o => ({ id: o.id, kind: o.kind, x: o.x, y: o.y, rot: quarter(o.rot), ...(o.in ? { in: o.in } : isPlace(o.at) ? { at: o.at } : {}), ...cleanProps(o), ...cleanFill(o), ...cleanCut(o), ...cleanDrive(o), ...cleanPrinted(o), ...cleanLayers(o) }))
  const next = Math.max(Math.round(Number(s.next)) || 1, ...items.map(o => o.id + 1))
  const state: State = { items, next }
  // pass 1: anything in a slot that does not exist, or that its slot now refuses, goes back out to the field
  const evict = (o: Item) => { delete o.in }
  for (const o of items) {
    if (!o.in) continue
    const host = items.find(h => h.id === o.in!.host)
    if (!host || !KINDS[host.kind]?.slots?.[o.in.slot]) evict(o)
  }
  for (const o of items) if (o.in && !accepts(state, o, o.in)) evict(o)
  // pass 2: each place on its own
  let out: Item[] = []
  const stray: Item[] = []
  const spaces = new Map<string, { sp: Space; list: Item[] }>()
  for (const o of items) { const k = spaceKey(spaceOf(o)); if (!spaces.has(k)) spaces.set(k, { sp: spaceOf(o), list: [] }); spaces.get(k)!.list.push(o) }
  for (const { sp, list } of spaces.values()) {
    const { w, h } = spaceSize(state, sp)
    const { kept, lost } = isFlex(sp) ? flexLayout(list, w) : layout(list, w, h)
    out.push(...kept)
    stray.push(...lost)
  }
  // whatever did not fit its place lands on the field in the first free spot, or failing that on a counter
  const places: Space[] = [null, { at: 'inside' }, { at: 'outside' }]
  const taken = new Map(places.map(p => [spaceKey(p), out.filter(o => sameSpace(spaceOf(o), p)).map(boxOf)]))
  for (const o of stray) {
    for (const p of places) {
      const { w, h } = spaceSize(state, p), boxes = taken.get(spaceKey(p))!
      const spot = firstFree(w, h, boxes, { ...boxOf({ ...o, rot: 0 }), x: 0, y: 0 })
      if (!spot) continue
      const put = { ...o, x: spot.x, y: spot.y, rot: spot.rot }
      setIn(put, p)
      out.push(put)
      boxes.push(boxOf(put))
      break
    }
  }
  // what found no place at all is gone, and whatever was inside it
  for (let n = -1; n !== out.length;) { n = out.length; const here = new Set(out.map(o => o.id)); out = out.filter(o => !o.in || here.has(o.in.host)) }
  const ids = new Set(out.map(o => o.id))
  // windows of containers that are gone (or no longer containers) close; old saves' docked panels are not carried over
  const windows = (s.windows ?? []).filter(w => ids.has(w.id) && isContainer(out.find(o => o.id === w.id)!.kind)).slice(-MAX_WINDOWS)
  // orders on their way keep what still exists; the Wire's memory is kept as it was
  const orders = (Array.isArray(s.orders) ? s.orders : []).map(o => ({ ...o, goods: (o.goods ?? []).filter(g => KINDS[g?.kind]) })).filter(o => o.goods.length && Number.isFinite(o.at))
  const energy = Number.isFinite(Number(s.energy)) && s.energy !== undefined ? { energy: Math.max(0, Number(s.energy)) } : {}
  const night = s.night === true || !!s.out ? { night: true } : {}, gone = s.out && typeof s.out.site === 'string' ? { out: { site: s.out.site, left: Math.max(0, Math.round(Number(s.out.left)) || 0), ...(s.out.buys && typeof s.out.buys === 'object' ? { buys: s.out.buys } : {}) } } : {}
  return { items: out, next, windows, cash: Math.max(0, Math.round(Number(s.cash ?? START_CASH)) || 0), day: Math.max(1, Math.round(Number(s.day)) || 1), ...night, ...gone, ...energy, ...(orders.length ? { orders } : {}), ...(s.story && typeof s.story === 'object' ? { story: s.story } : {}), ...(s.web && typeof s.web === 'object' ? { web: s.web } : {}), ...(Array.isArray(s.mail) ? { mail: s.mail.filter(m => m && Number.isInteger(m.id) && (!m.job || m.job.wants?.every(x => KINDS[x.kind]))) } : {}) }
}

/**
 * Cut a piece off with a knife: one comes off, or, when two are left, the last cut splits them and the thing is gone. It
 * shrinks from its cut side, its other side staying where it was; the pieces (as old as it is) go on the nearest free spots
 * beside it, or the field. Null, with nothing changed, if there is no room for them.
 */
/** Where the top-left of something cut moves when it goes from the footprint `before` to `after` (it keeps its side away from the cut), turned as it lies. */
function shift(c: Cut, rot: number, before: { w: number; h: number }, after: { w: number; h: number }): [number, number] {
  const W0 = before.w, H0 = before.h, x0 = c.from === 'right' ? 0 : W0 - after.w, x1 = x0 + after.w, y1 = after.h
  return [[x0, 0], [H0 - y1, x0], [W0 - x1, H0 - y1], [0, W0 - x1]][quarter(rot)] as [number, number]
}
export function cut(s: State, it: Item): Item[] | null {
  const c = KINDS[it.kind]?.cut
  const at = s.items.indexOf(it)
  if (!c || !KINDS[c.into] || at < 0) return null
  const n = leftOf(it), pieces = c.keeps ? Math.min(n, 1) : n <= 2 ? n : 1, gone = !c.keeps && n - pieces <= 0
  if (!pieces) return null
  const was = { x: it.x, y: it.y, left: it.left }, before = sizeOf(it)
  // the cut side, as it lies: 'left' or 'right' of the thing as made, turned with it
  const r = quarter(it.rot), d = c.from === 'right' ? 1 : -1
  const side: [number, number] = [[d, 0], [0, d], [-d, 0], [0, -d]][r] as [number, number]
  if (gone) s.items.splice(at, 1)
  else {
    it.left = n - pieces
    // what is left, inside the old footprint as made (against the side away from the cut), turned the way it lies
    const [dx, dy] = shift(c, it.rot, before, sizeOf(it))
    it.x += dx; it.y += dy
  }
  const made: Item[] = []
  for (let i = 0; i < pieces; i++) {
    const p = pieceOf(s, c.into, it, side)
    if (!p) break
    if (it.age !== undefined) p.age = it.age
    p.seed = faceSeed(it, n - i) // the slice that comes off is the face that was showing
    made.push(p)
  }
  if (made.length === pieces) return made
  remove(s, made.map(p => p.id)) // no room: everything as it was
  if (gone) s.items.splice(at, 0, it)
  else { it.x = was.x; it.y = was.y; if (was.left === undefined) delete it.left; else it.left = was.left }
  return null
}

/** Put a piece back into what it came off (a slice into its bag): it grows back where it shrank from, if the room is free. False, with nothing changed, if not. */
export function refill(s: State, pack: Item, piece: Item): boolean {
  const c = KINDS[pack.kind]?.cut, n = leftOf(pack)
  if (!c?.keeps || piece.kind !== c.into || n >= c.count) return false
  const was = { x: pack.x, y: pack.y, left: pack.left }, small = sizeOf(pack)
  if (n + 1 >= c.count) delete pack.left; else pack.left = n + 1
  const [dx, dy] = shift(c, pack.rot, sizeOf(pack), small)
  pack.x -= dx; pack.y -= dy
  const { w, h } = spaceSize(s, spaceOf(pack)), b = boxOf(pack)
  if (b.x >= 0 && b.y >= 0 && b.x + b.w <= w && b.y + b.h <= h && inSpace(s, spaceOf(pack)).every(o => o.id === pack.id || o.id === piece.id || !overlaps(boxOf(o), b))) { remove(s, [piece.id]); return true }
  pack.x = was.x; pack.y = was.y
  if (was.left === undefined) delete pack.left; else pack.left = was.left
  return false
}

/** A new piece of something (cut off it, taken off it): on the free spot nearest the side it comes off (`side`, a step: right unless told), or anywhere on the field. */
export function pieceOf(s: State, kind: string, from: Item, side: [number, number] = [1, 0]): Item | null {
  const p = spawn(s, kind, spaceOf(from)) ?? spawn(s, kind, null)
  if (!p || !sameSpace(spaceOf(p), spaceOf(from))) return p
  const { w, h } = spaceSize(s, spaceOf(p))
  const f = dims(from), pb = boxOf({ ...p, rot: 0 })
  const x = side[0] > 0 ? from.x + f.w : side[0] < 0 ? from.x - pb.w : from.x
  const y = side[1] > 0 ? from.y + f.h : side[1] < 0 ? from.y - pb.h : from.y
  const b = nearest(w, h, inSpace(s, spaceOf(p)).filter(o => o.id !== p.id).map(boxOf), { ...pb, x, y })
  if (b) Object.assign(p, { x: b.x, y: b.y, rot: b.rot ?? 0 })
  return p
}

// ---------------------------------------------------------------- sandwiches

/** The kind a thing turns into when something is laid on it (a slice of bread: a sandwich). */
const madeFrom = (kind: string) => KINDS[kind]?.stack ? kind : Object.keys(KINDS).find(k => KINDS[k].stack?.on === kind)
/** Can `top` be laid on `base`? A filling while there is room, the lid once there is at least one filling; nothing on a finished one, nor on bread still in its bag. */
export function canStack(base: Item, top: Item): boolean {
  const kind = madeFrom(base.kind), st = kind && KINDS[kind].stack
  if (!st || base.in || base.id === top.id || top.layers?.length || closed(base)) return false
  const n = base.layers?.length ?? 0
  return st.takes.includes(top.kind) ? n < st.max : top.kind === st.lid && n > 0
}
/** Lay `top` on `base`: a slice of bread becomes a sandwich; the thing laid on is one of its layers now. */
export function stack(s: State, base: Item, top: Item): boolean {
  if (!canStack(base, top)) return false
  base.kind = madeFrom(base.kind)!
  base.layers = [...base.layers ?? [], { kind: top.kind, seed: seedOf(top), ...(top.age ? { age: top.age } : {}) }]
  remove(s, [top.id])
  return true
}
/** Take the top layer off an unfinished sandwich, onto the nearest free spot beside it (or the field); the last one off leaves the bread. */
export function unstack(s: State, it: Item): Item | null {
  const st = KINDS[it.kind]?.stack, top = it.layers?.[it.layers.length - 1]
  if (!st || !top || closed(it)) return null
  const p = pieceOf(s, top.kind, it)
  if (!p) return null
  if (top.seed !== undefined) p.seed = top.seed
  if (top.age) p.age = top.age
  it.layers!.pop()
  if (!it.layers!.length) { delete it.layers; it.kind = st.on }
  return p
}

/** Move a thing (and whatever is inside it) to the first free spot of a place, turned if that is the only way it fits. False if there is no room. */
export function moveInto(s: State, it: Item, space: Space): boolean {
  if (isFlex(space)) { const x = freeFlex(s, space, it); if (x === null || !accepts(s, it, space)) return false; Object.assign(it, { x, y: 0 }); setIn(it, space); return true }
  const { w, h } = spaceSize(s, space)
  const spot = firstFree(w, h, inSpace(s, space).filter(o => o.id !== it.id).map(boxOf), shapeOfItem(it))
  if (!spot || !accepts(s, it, space)) return false
  Object.assign(it, { x: spot.x, y: spot.y, rot: spot.rot })
  setIn(it, space)
  return true
}

/**
 * Put a new thing of this kind, with these properties, on the first free spot of a place (the field unless told otherwise),
 * turned if that is the only way it fits. Null if there is no room. A container whose slot has `fill` comes full of it; a
 * vessel comes full of its `liquid`.
 */
export function spawn(s: State, kind: string, space: Space = null, props: Record<string, string> = {}, fill = false): Item | null {
  const { w, h } = spaceSize(s, space)
  const it: Item = { id: s.next, kind, x: 0, y: 0, rot: 0, ...cleanProps({ id: 0, kind, x: 0, y: 0, rot: 0, props }) }
  if (!fill && !accepts(s, it, space)) return null // asked before it is put there: a take-out-only slot takes nothing new
  setIn(it, space)
  const flex = isFlex(space) ? freeFlex(s, space) : null
  const spot = isFlex(space) ? flex === null ? null : { x: flex, y: 0, rot: 0 } : firstFree(w, h, inSpace(s, space).map(boxOf), shapeOfItem(it))
  if (!spot) return null
  s.next++
  Object.assign(it, { x: spot.x, y: spot.y, rot: spot.rot })
  s.items.push(it)
  fillWith(it, KINDS[kind].liquid ?? null)
  KINDS[kind].slots?.forEach((sl, slot) => { if (sl.fill && KINDS[sl.fill]) for (let n = 0; n < (sl.count ?? Infinity) && spawn(s, sl.fill, { host: it.id, slot }, propsOf(it), true); n++); })
  return it
}

/** A way to start (`presets` in data/station/start.json, picked at a new game): its money, things on the field, a tool in hand. */
export interface Preset { id: string; name: string; line: string; credits: number; things: { id: string; qty: number }[]; hand?: string }
export const PRESETS: Preset[] = START.presets
/**
 * A new game on the first day, a canvas pack on your back (for the night, outside.ts), and what the preset brings: its money,
 * its things on the field (the biggest first, so they pack from the corner) and its tool in your hand. No preset: an empty
 * field and a little money.
 */
export function start(kit?: Preset): State {
  const s: State = { items: [], next: 1, windows: [], cash: kit?.credits ?? START_CASH, day: 1 }
  if (KINDS.pack) spawn(s, 'pack', { at: 'back' })
  if (kit?.hand) spawn(s, kit.hand, { at: 'hand' })
  const area = (id: string) => KINDS[id].w * KINDS[id].h
  for (const t of [...kit?.things ?? []].sort((a, b) => area(b.id) - area(a.id))) for (let i = 0; i < t.qty; i++) spawn(s, t.id)
  return s
}

/** What is in the trash (the things themselves; what is inside them goes with them). */
export const trash = (s: State) => inSpace(s, { at: 'trash' })
/** Empty the trash: what is in it is gone, with whatever is inside it. The ids that went (not their insides). */
export function emptyTrash(s: State): number[] {
  const gone = trash(s).map(o => o.id)
  remove(s, gone)
  return gone
}
/**
 * The day is over (the last customer of the line has gone) and you sleep: the trash is taken out overnight, and it is the
 * next day. A day is one line of customers, however long; nothing else counts time. The ids that went out with the trash.
 */
export function sleep(s: State): number[] {
  const gone = emptyTrash(s)
  delete s.night
  s.day = (s.day ?? 1) + 1
  return gone
}
