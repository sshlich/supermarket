// The field: a grid of cells with things on it. Nothing else yet.

import { drop, same, turn, type Box } from './grid.ts'

export const W = 30
export const H = 20

/** Which of an item's colours a layer is drawn in: its own, a secondary, or a brighter one for highlights. */
export type Tint = 'main' | 'alt' | 'hot'
/** glow / bloom: a blurred copy behind. blur: only the blurred copy. flicker, pulse, drift: slow movement. */
export type Fx = 'glow' | 'bloom' | 'blur' | 'flicker' | 'pulse' | 'drift'
/**
 * One drawing in an item's stack. `rows` is grid-aligned glyph art (one character per cell); `at` places loose glyphs
 * anywhere, in cells: [x, y, glyph, size?]. `dx`/`dy` slide the whole layer off the grid. Layers stack and brighten where they overlap.
 */
export interface Layer { rows?: string[]; at?: [number, number, string, number?][]; tint?: Tint; fx?: Fx[]; dx?: number; dy?: number; alpha?: number }
export interface Kind { name: string; icon: string; color: string; alt: string; w: number; h: number; shape?: string[]; art: Layer[] }

/** Sizes are in field cells. A `shape` (rows, '#' filled) gives an irregular footprint and sets w and h. */
export const KINDS: Record<string, Kind> = {
  crate: { name: 'Crate', icon: 'wooden-crate', color: '#c9975a', alt: '#8f6236', w: 4, h: 4, art: [
    { rows: ['╔══╗', '║  ║', '║  ║', '╚══╝'], fx: ['glow'] },
    { rows: ['    ', ' \\/ ', ' /\\ ', '    '], tint: 'alt', fx: ['flicker'] },
    { at: [[0.3, 0.3, '+', 0.6], [3.7, 0.3, '+', 0.6], [0.3, 3.7, '+', 0.6], [3.7, 3.7, '+', 0.6]], tint: 'hot', fx: ['pulse'] },
    { rows: ['╔══╗', '║  ║', '║  ║', '╚══╝'], tint: 'alt', fx: ['blur', 'drift'], dx: 0.07, dy: 0.05, alpha: 0.6 },
  ] },
  log: { name: 'Log', icon: 'log', color: '#b98552', alt: '#f0c890', w: 4, h: 2, art: [
    { rows: ['(≡≡)', '(≡≡)'], fx: ['glow'] },
    { at: [[0.5, 0.5, 'o', 0.8], [0.5, 1.5, 'o', 0.8]], tint: 'hot', fx: ['pulse'] },
    { rows: ['(≡≡)', '(≡≡)'], tint: 'alt', fx: ['blur', 'drift'], dx: 0.06, dy: -0.05, alpha: 0.5 },
  ] },
  coal: { name: 'Coal', icon: 'coal-pile', color: '#8a90a0', alt: '#5a5f6b', w: 2, h: 2, art: [
    { rows: ['#*', '*#'] },
    { rows: ['##', '##'], tint: 'alt', fx: ['blur'], alpha: 0.7 },
    { at: [[0.5, 0.5, '·', 1], [1.5, 1.5, '·', 1], [1.25, 0.3, '.', 0.7], [0.3, 1.4, '.', 0.7]], tint: 'hot', fx: ['flicker'] },
  ] },
  bottle: { name: 'Bottle', icon: 'jug', color: '#5aa8e6', alt: '#3fd0c0', w: 2, h: 4, art: [
    { rows: ['┌┐', '║║', '  ', '└┘'], fx: ['glow'] },
    { rows: ['  ', '  ', '~~', '  '], tint: 'alt', fx: ['bloom', 'drift'] },
    { at: [[0.5, 2.15, 'o', 0.5], [1.5, 1.85, 'o', 0.4]], tint: 'hot', fx: ['drift'] },
  ] },
  knife: { name: 'Knife', icon: 'bowie-knife', color: '#b4bfcc', alt: '#c9975a', w: 2, h: 4, art: [
    { rows: ['║ ', '║ ', '  ', '  '], fx: ['glow'] },
    { rows: ['  ', '  ', '╤═', '│ '], tint: 'alt' },
    { at: [[0.5, 0.3, '/', 0.8], [1.3, 0.9, '·', 0.8]], tint: 'hot', fx: ['flicker'] },
  ] },
  axe: { name: 'Axe', icon: 'battle-axe', color: '#b4bfcc', alt: '#a0703a', w: 4, h: 6, shape: ['####', '###.', '.##.', '.##.', '.##.', '.##.'], art: [
    { rows: ['┌──┐', '└┐  ', ' ││ ', ' ││ ', ' ││ ', ' └┘ '], fx: ['glow'] },
    { rows: ['    ', '  ▒ ', ' ▒▒ ', ' ▒▒ ', ' ▒▒ ', '    '], tint: 'alt', fx: ['blur'], alpha: 0.6 },
    { at: [[1.5, 0.5, '/', 0.9], [3.6, 0.55, '·', 0.8]], tint: 'hot', fx: ['flicker'] },
  ] },
  pickaxe: { name: 'Pickaxe', icon: 'war-pick', color: '#a6b2c0', alt: '#a0703a', w: 6, h: 4, shape: ['######', '######', '..##..', '..##..'], art: [
    { rows: ['┌────┐', '└─┐┌─┘', '  ││  ', '  └┘  '], fx: ['glow'] },
    { rows: ['      ', '      ', '  ▒▒  ', '  ▒▒  '], tint: 'alt', fx: ['blur'], alpha: 0.6 },
    { at: [[0.5, 0.5, '/', 0.8], [5.5, 0.5, '\\', 0.8]], tint: 'hot', fx: ['flicker'] },
  ] },
}
for (const k of Object.values(KINDS)) if (k.shape) { k.h = k.shape.length; k.w = Math.max(...k.shape.map(r => r.length)) }

export interface Item { id: number; kind: string; x: number; y: number; rot: boolean }
export interface State { items: Item[]; next: number }

const SHAPES = new Map<string, Box>()
/** A kind's footprint as the grid sees it, facing the way it is made. */
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
export const boxOf = (it: Item): Box => ({ ...(it.rot ? turn(shapeOf(it.kind)) : shapeOf(it.kind)), id: it.id, x: it.x, y: it.y })
export const dims = (it: Item) => { const b = boxOf(it); return { w: b.w, h: b.h } }
/** Quarter turn clockwise of a glyph, so drawn art turns with its item. Lines, corners and slashes change; letters stay. */
const TURN: Record<string, string> = {}
for (const cycle of ['┌┐┘└', '├┬┤┴', '─│', '═║', '╔╗╝╚', '╠╦╣╩', '╤╢╧╟', '╨╞╥╡', '╪╫', '/\\'])
  for (let i = 0; i < cycle.length; i++) TURN[cycle[i]] = cycle[(i + 1) % cycle.length]
export function turnArt(rows: string[]): string[] {
  const h = rows.length
  const w = Math.max(...rows.map(r => r.length))
  const out: string[] = []
  for (let x = 0; x < w; x++) {
    let row = ''
    for (let y = h - 1; y >= 0; y--) { const c = rows[y][x] ?? ' '; row += TURN[c] ?? c }
    out.push(row)
  }
  return out
}
/** A layer as the item sits: turned a quarter clockwise when `rot`, loose glyphs and slides included. */
function turnLayer(l: Layer, w: number, h: number): Layer {
  const out: Layer = { ...l }
  if (l.rows) out.rows = turnArt(l.rows)
  if (l.at) out.at = l.at.map(([x, y, c, s]) => [h - y, x, TURN[c] ?? c, s] as [number, number, string, number?])
  if (l.dx !== undefined || l.dy !== undefined) { out.dx = -(l.dy ?? 0); out.dy = l.dx ?? 0 }
  return out
}
/** The layers of an item's drawing as it sits. */
export const artOf = (it: Item): Layer[] => { const k = KINDS[it.kind]; return it.rot ? k.art.map(l => turnLayer(l, k.w, k.h)) : k.art }

/** The filled cells of an item as it sits (relative to its top-left), or null for a plain rectangle. */
export const cellsOf = (it: Item) => boxOf(it).cells ?? null

export const find = (s: State, id: number) => s.items.find(o => o.id === id)

// ---------------------------------------------------------------- dragging

/** What's in hand, and where it was lifted from. */
export interface Held { item: Item; from: { x: number; y: number; rot: boolean } }
export interface Plan { x: number; y: number; rot: boolean; moves: { id: number; x: number; y: number; rot: boolean }[] }

export function lift(s: State, id: number): Held | null {
  const it = find(s, id)
  return it ? { item: it, from: { x: it.x, y: it.y, rot: it.rot } } : null
}

/** Where the held item goes if dropped with its top-left at (x, y): a straight swap, a shove, a hop, or turned. Null if it can't fit. */
export function planDrop(s: State, held: Held, x: number, y: number, rot: boolean, turnedOnce = false): Plan | null {
  const it = held.item
  const d = dims({ ...it, rot })
  const others = s.items.filter(o => o.id !== it.id)
  const m: Box = { ...boxOf({ ...it, rot }), x: Math.max(0, Math.min(W - d.w, x)), y: Math.max(0, Math.min(H - d.h, y)) }
  if (d.w > W || d.h > H) return null

  // Dropped squarely onto something of the same plain shape: they trade places.
  const hits = others.filter(o => { const b = boxOf(o); return b.x < m.x + m.w && m.x < b.x + b.w && b.y < m.y + m.h && m.y < b.y + b.h })
  if (hits.length === 1 && !m.cells && !boxOf(hits[0]).cells) {
    const hb = boxOf(hits[0])
    if (hb.x === m.x && hb.y === m.y && hb.w === m.w && hb.h === m.h)
      return { x: m.x, y: m.y, rot, moves: [{ id: hits[0].id, x: held.from.x, y: held.from.y, rot: hits[0].rot !== (held.from.rot !== rot) }] }
  }

  const res = drop(W, H, others.map(boxOf), m, { x: held.from.x, y: held.from.y })
  if (res) {
    const [me, ...rest] = res
    return { x: me.x, y: me.y, rot, moves: rest.map(r => ({ id: r.id, x: r.x, y: r.y, rot: !!r.rot })) }
  }
  if (!turnedOnce && !same(m)) return planDrop(s, held, x, y, !rot, true)
  return null
}

export function applyDrop(s: State, held: Held, plan: Plan) {
  for (const mv of plan.moves) Object.assign(find(s, mv.id)!, { x: mv.x, y: mv.y, rot: mv.rot })
  Object.assign(held.item, { x: plan.x, y: plan.y, rot: plan.rot })
}

/** Nothing happened: the item goes back where it was. */
export const putBack = (held: Held) => Object.assign(held.item, held.from)

export function start(): State {
  const s: State = { items: [], next: 1 }
  const put = (kind: string, x: number, y: number, rot = false) => s.items.push({ id: s.next++, kind, x, y, rot })
  put('crate', 3, 3)
  put('axe', 10, 3)
  put('pickaxe', 16, 4)
  put('log', 4, 10)
  put('coal', 10, 12)
  put('coal', 13, 12)
  put('bottle', 18, 11)
  put('knife', 22, 4)
  return s
}
