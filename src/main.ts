import './style.css'
import { glass, sheen, type Effect } from './card-effects.ts'
import { cardFace, cardVars, hideTooltip, mountTooltip, showTooltip } from './card-view.ts'
import { place, swap, SOCKETS, type Item, type Row, type Size } from './board.ts'
import { ITEMS, type ItemDef } from './items.ts'

// Feel. Timings are the live client's code defaults; scales are measured from recordings.
const MOVE_MS = 300 // dropped card slides into its socket
const PUSH_MS = 200 // cards making room react right away (ease-out)
const HOVER_MS = 150
const HOVER_SCALE = 1.5
const DRAG_SCALE = HOVER_SCALE * 0.9 // live game shrinks the lifted card to 0.9 of its hover size
const DRAG_SCALE_MS = 100
const NUDGE = 0.3 // slot units a card bumps aside while you drag over it
const NUDGE_MS = 150
const NUDGE_BACK_MS = 75
const TILT_DEG = 6
const TILT_SPEED = 10 // exponential follow, per second
const OVERLAP: Record<Size, number> = { 1: 0.5, 2: 0.7, 3: 0.9 } // footprint width used to pick sockets
const DRAG_THRESHOLD_PX = 5

// Field layout in slot units (1 = one socket width), measured from the live game.
const GAP = 0.06
const CARD_H = 2 - GAP
const ROW_H = 2.07
const ROW_PAD = 0.12
const ROW_W = SOCKETS + ROW_PAD * 2
const SIDE = 2.2 // room left and right of the rows (day dial, keyword legend)
const STRIP_H = 1.95 // portrait / health / stash / gold strip above and below the rows
const PANEL_W = 1.95
const X0 = SIDE
const OPP_STRIP = 0.2
const OPP_ROW = OPP_STRIP + STRIP_H + 0.08
const BOARD_ROW = OPP_ROW + ROW_H + 0.1
const PLAYER_STRIP = BOARD_ROW + ROW_H + 0.1
const SCENE_W = SIDE * 2 + ROW_W
const SCENE_H = PLAYER_STRIP + STRIP_H + 0.2

const inOutQuint = (t: number) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2)
const outQuad = (t: number) => 1 - (1 - t) ** 2
const outCubic = (t: number) => 1 - (1 - t) ** 3
const linear = (t: number) => t

interface Pose { x: number; y: number; s: number }
interface Lane { name: string; row: Row; y: number; nudge: number; mine: boolean; el: HTMLElement }
interface Card {
  def: ItemDef
  item: Item
  lane: Lane
  el: HTMLElement
  pose: Pose
  tween: { from: Pose; to: Pose; t0: number; ms: number; ease: (t: number) => number } | null
  tilt: { x: number; y: number; tx: number; ty: number }
  hovered: boolean
  nudged: boolean
  effects: Effect[]
}

const scene = document.getElementById('scene')!
let u = 100
let press: { card: Card; x: number; y: number } | null = null
let drag: { card: Card; ox: number; oy: number } | null = null

/** Absolutely placed element, position and size in slot units. */
function box(cls: string, x: number, y: number, w: number, h: number, html = '') {
  const el = document.createElement('div')
  el.className = cls
  el.style.cssText = `left:calc(var(--u)*${x});top:calc(var(--u)*${y});width:calc(var(--u)*${w});height:calc(var(--u)*${h})`
  el.innerHTML = html
  scene.append(el)
  return el
}

function lane(name: string, y: number, nudge: number, mine: boolean, lo = 2, hi = 7): Lane {
  const curtain = `<div class="unlocked" style="left:calc(var(--u)*${ROW_PAD + lo - 0.1});width:calc(var(--u)*${hi - lo + 1.2})"></div>`
  return { name, row: { items: [], lo, hi }, y, nudge, mine, el: box(`row ${name}`, X0, y, ROW_W, ROW_H, curtain) }
}

// --- Field ---
const midX = X0 + ROW_W / 2
box('dial', X0 - 1.95, (OPP_ROW + BOARD_ROW + ROW_H) / 2 - 0.85, 1.7, 1.7, '<b>1</b><small>DAY</small>')

box('panel', X0, OPP_STRIP, PANEL_W, STRIP_H, '<span>Skills</span>')
box('portrait enemy', midX - 0.9, OPP_STRIP + 0.05, 1.8, 1.45, '<span>Opponent</span>')
box('hp', X0 + PANEL_W + 0.05, OPP_STRIP + STRIP_H - 0.38, ROW_W - PANEL_W * 2 - 0.1, 0.34, '<i></i><span>400</span>')
box('panel gold', X0 + ROW_W - PANEL_W, OPP_STRIP, PANEL_W, STRIP_H, '<span>+5 » 3</span>')

const opponent = lane('opponent', OPP_ROW, NUDGE, false)
const stash = lane('stash', OPP_ROW, -NUDGE, true, 0, 9) // opens over the opponent's row
const board = lane('board', BOARD_ROW, NUDGE, true)
const lanes = [opponent, stash, board]

box('hp', X0 + PANEL_W + 0.05, PLAYER_STRIP + 0.04, ROW_W - PANEL_W * 2 - 0.1, 0.34, '<i></i><span>300</span>')
box('portrait', midX - 0.9, PLAYER_STRIP + 0.45, 1.8, 1.45, '<span>You</span>')
const toy = box('panel toy', X0, PLAYER_STRIP, PANEL_W, STRIP_H, '<span>Stash</span>')
box('panel gold', X0 + ROW_W - PANEL_W, PLAYER_STRIP, PANEL_W, STRIP_H, '<span>+5 » 15</span>')
mountTooltip(scene)

// --- Cards ---
const seed: [Lane, keyof typeof ITEMS, number][] = [
  [opponent, 'rustBlade', 3],
  [opponent, 'brassBeetle', 4],
  [opponent, 'ironPot', 6],
  [board, 'sparkPistol', 2],
  [board, 'handCannon', 3],
  [board, 'fieldKit', 5],
  [board, 'emberFlask', 6],
  [stash, 'towerShield', 0],
  [stash, 'siegeAnvil', 3],
  [stash, 'venomVial', 8],
]

const cards: Card[] = seed.map(([lane, key, pos], i) => {
  const def: ItemDef = ITEMS[key]
  const item: Item = { id: String(i), size: def.size, pos }
  lane.row.items.push(item)
  const el = document.createElement('div')
  el.className = lane.mine ? 'card' : 'card theirs'
  el.style.cssText = cardVars(def)
  el.innerHTML = cardFace(def)
  const pane = glass(el)
  el.querySelector('.art')!.after(pane.el) // glass sits over the art, under the frame and badges
  scene.append(el)
  const c: Card = { def, item, lane, el, pose: { x: 0, y: 0, s: 1 }, tween: null, tilt: { x: 0, y: 0, tx: 0, ty: 0 }, hovered: false, nudged: false, effects: [pane, sheen(pane.el)] }
  c.pose = rest(c)
  bind(c)
  return c
})

// --- Stash: click the chest to open it over the opponent's row; dragging over the chest peeks it open. ---
let stashOpen = false
let overToy = false
const stashVisible = () => stashOpen || overToy

function refreshStash() {
  const open = stashVisible()
  stash.el.classList.toggle('hidden', !open)
  opponent.el.classList.toggle('hidden', open)
  toy.classList.toggle('open', open)
  for (const c of cards) {
    const hidden = c.lane === stash ? !open : c.lane === opponent ? open : false
    c.el.classList.toggle('hidden', hidden && drag?.card !== c)
  }
}
toy.addEventListener('click', () => {
  stashOpen = !stashOpen
  refreshStash()
})
refreshStash()

function rest(c: Card): Pose {
  return { x: X0 + ROW_PAD + c.item.pos + c.item.size / 2, y: c.lane.y + ROW_H / 2 + (c.nudged ? c.lane.nudge : 0), s: 1 }
}

function tweenTo(c: Card, to: Pose, ms: number, ease: (t: number) => number) {
  c.tween = { from: { ...c.pose }, to, t0: performance.now(), ms, ease }
}

function toScene(e: PointerEvent) {
  const r = scene.getBoundingClientRect()
  return { x: (e.clientX - r.left) / u, y: (e.clientY - r.top) / u }
}

// Which lane and sockets the dragged card is over. Like the live game: a shrunk footprint of the card
// picks the sockets it overlaps; if it's over nothing, it snaps to the nearest socket of its own lane.
function target(c: Card): { lane: Lane; sockets: number[] } {
  const { x, y } = c.pose
  const droppable = stashVisible() ? [stash, board] : [board]
  const lane = droppable
    .map(l => ({ l, d: Math.abs(y - (l.y + ROW_H / 2)) }))
    .filter(({ d }) => d < (ROW_H + CARD_H) / 2)
    .sort((a, b) => a.d - b.d)[0]?.l
  if (lane) {
    const hw = (c.item.size * OVERLAP[c.item.size]) / 2
    const sockets: number[] = []
    for (let i = lane.row.lo; i <= lane.row.hi; i++) {
      const left = X0 + ROW_PAD + i
      if (left < x + hw && left + 1 > x - hw) sockets.push(i)
    }
    if (sockets.length) return { lane, sockets }
  }
  const nearest = Math.round(x - X0 - ROW_PAD - c.item.size / 2)
  return { lane: c.lane, sockets: [Math.max(0, Math.min(SOCKETS - 1, nearest))] }
}

function setHover(c: Card, on: boolean) {
  c.hovered = on
  if (on) {
    const to = { ...rest(c), s: HOVER_SCALE }
    tweenTo(c, to, HOVER_MS, outQuad)
    showTooltip(c.def, { x: to.x, y: to.y, w: (c.item.size - GAP) * HOVER_SCALE, h: CARD_H * HOVER_SCALE }, u, SCENE_W)
  } else {
    c.tilt.tx = c.tilt.ty = 0
    tweenTo(c, rest(c), MOVE_MS, inOutQuint)
    hideTooltip()
  }
}

function bind(c: Card) {
  const { el } = c
  el.addEventListener('pointerdown', e => {
    if (e.button !== 0 || drag || !c.lane.mine) return
    el.setPointerCapture(e.pointerId)
    press = { card: c, x: e.clientX, y: e.clientY }
  })
  el.addEventListener('pointermove', e => {
    if (press?.card === c && !drag && Math.hypot(e.clientX - press.x, e.clientY - press.y) > DRAG_THRESHOLD_PX) beginDrag(c, e)
    if (drag) {
      if (drag.card === c) dragMove(e)
      return
    }
    if (!c.hovered && !c.tween) setHover(c, true)
    if (c.hovered) {
      const p = toScene(e)
      const nx = (p.x - c.pose.x) / (((c.item.size - GAP) / 2) * c.pose.s)
      const ny = (p.y - c.pose.y) / ((CARD_H / 2) * c.pose.s)
      c.tilt.tx = -Math.max(-1, Math.min(1, ny)) * TILT_DEG // the side under the cursor dips away
      c.tilt.ty = Math.max(-1, Math.min(1, nx)) * TILT_DEG
    }
  })
  el.addEventListener('pointerleave', () => {
    if (c.hovered && !drag) setHover(c, false)
  })
  const up = () => {
    press = null
    if (drag?.card === c) drop()
  }
  el.addEventListener('pointerup', up)
  el.addEventListener('pointercancel', up)
}

function beginDrag(c: Card, e: PointerEvent) {
  c.hovered = false
  c.tilt.tx = c.tilt.ty = 0
  hideTooltip()
  const p = toScene(e)
  drag = { card: c, ox: c.pose.x - p.x, oy: c.pose.y - p.y }
  tweenTo(c, { ...c.pose, s: DRAG_SCALE }, DRAG_SCALE_MS, linear)
  c.el.classList.add('lifted', 'dragging')
}

function dragMove(e: PointerEvent) {
  const c = drag!.card
  const p = toScene(e)
  c.pose.x = p.x + drag!.ox
  c.pose.y = p.y + drag!.oy

  const r = toy.getBoundingClientRect()
  const over = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
  if (over !== overToy) {
    overToy = over
    refreshStash()
  }

  const t = target(c)
  for (const o of cards) {
    if (o === c) continue
    const want = !overToy && o.lane === t.lane && t.sockets.some(s => s >= o.item.pos && s < o.item.pos + o.item.size)
    if (want !== o.nudged) {
      o.nudged = want
      tweenTo(o, rest(o), want ? NUDGE_MS : NUDGE_BACK_MS, outQuad)
    }
  }
}

function drop() {
  const c = drag!.card
  drag = null
  c.el.classList.remove('lifted', 'dragging')
  const from = c.lane
  const before = new Map(cards.map(o => [o, { pos: o.item.pos, lane: o.lane }]))

  if (overToy) {
    // Dropped on the chest: into the stash, pushed in from the left.
    if (from !== stash) {
      const out = place(stash.row, c.item, 0)
      if (out) {
        moveLane(c, stash)
        apply(stash, out)
      }
    }
    overToy = false
  } else {
    const t = target(c)
    if (t.lane === from) {
      apply(from, place(from.row, c.item, t.sockets[0], c.item.pos))
    } else {
      const pushed = place(t.lane.row, c.item, t.sockets[0])
      const swapped = pushed ? null : swap(t.lane.row, from.row, c.item, t.sockets[0])
      if (pushed) {
        moveLane(c, t.lane)
        apply(t.lane, pushed)
      } else if (swapped) {
        for (const o of swapped.covered) moveLane(cards.find(k => k.item === o)!, from)
        moveLane(c, t.lane)
        apply(t.lane, swapped.to)
        apply(from, swapped.from)
      }
      // Neither fits: the card just returns.
    }
  }

  for (const o of cards) {
    const b = before.get(o)!
    const moved = o.item.pos !== b.pos || o.lane !== b.lane
    const wasNudged = o.nudged
    o.nudged = false
    if (o === c) tweenTo(o, rest(o), MOVE_MS, inOutQuint)
    else if (moved) tweenTo(o, rest(o), o.lane !== b.lane ? MOVE_MS : PUSH_MS, outCubic)
    else if (wasNudged) tweenTo(o, rest(o), NUDGE_BACK_MS, outQuad)
  }
  refreshStash()
}

function moveLane(c: Card, lane: Lane) {
  c.lane.row.items.splice(c.lane.row.items.indexOf(c.item), 1)
  lane.row.items.push(c.item)
  c.lane = lane
}

function apply(lane: Lane, positions: Map<string, number> | null) {
  if (positions) for (const it of lane.row.items) it.pos = positions.get(it.id)!
}

function layout() {
  u = Math.min(innerWidth / SCENE_W, innerHeight / SCENE_H)
  scene.style.setProperty('--u', `${u}px`)
  scene.style.width = `${SCENE_W * u}px`
  scene.style.height = `${SCENE_H * u}px`
}
addEventListener('resize', layout)
layout()

let last = performance.now()
function frame(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  const follow = 1 - Math.exp(-TILT_SPEED * dt)
  for (const c of cards) {
    if (c.tween) {
      const { from, to, t0, ms, ease } = c.tween
      const k = ease(Math.min(1, (now - t0) / ms))
      c.pose.s = from.s + (to.s - from.s) * k
      if (drag?.card !== c) {
        c.pose.x = from.x + (to.x - from.x) * k
        c.pose.y = from.y + (to.y - from.y) * k
      }
      if (now - t0 >= ms) c.tween = null
    }
    c.tilt.x += (c.tilt.tx - c.tilt.x) * follow
    c.tilt.y += (c.tilt.ty - c.tilt.y) * follow
    const look = {
      nx: c.tilt.y / TILT_DEG,
      ny: -c.tilt.x / TILT_DEG,
      hover: Math.max(0, Math.min(1, (c.pose.s - 1) / (HOVER_SCALE - 1))),
    }
    for (const fx of c.effects) fx.update(look)
    const w = (c.item.size - GAP) * u
    const h = CARD_H * u
    c.el.style.transform = `translate(${c.pose.x * u - w / 2}px, ${c.pose.y * u - h / 2}px) perspective(${8 * u}px) rotateX(${c.tilt.x}deg) rotateY(${c.tilt.y}deg) scale(${c.pose.s})`
    c.el.style.zIndex = drag?.card === c ? '100' : c.hovered ? '50' : c.tween ? '10' : '1'
  }
  requestAnimationFrame(frame)
}
requestAnimationFrame(frame)
