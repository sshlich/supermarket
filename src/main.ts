import './style.css'
import { glass, sheen, type Effect } from './card-effects.ts'
import { place, swap, SOCKETS, type Item, type Row, type Size } from './board.ts'

// Feel. Timings are the live client's code defaults; scales are measured from recordings.
const MOVE_MS = 300 // dropped card slides into its socket
const PUSH_MS = 200 // cards making room react right away (ease-out)
const HOVER_MS = 150
const HOVER_SCALE = 1.25 // live game reads ~1.5x; toned down until the field is full size
const DRAG_SCALE = HOVER_SCALE * 0.9 // live game shrinks the lifted card to 0.9 of its hover size
const DRAG_SCALE_MS = 100
const NUDGE = 0.3 // slot units a card bumps aside while you drag over it
const NUDGE_MS = 150
const NUDGE_BACK_MS = 75
const TILT_DEG = 6
const TILT_SPEED = 10 // exponential follow, per second
const OVERLAP: Record<Size, number> = { 1: 0.5, 2: 0.7, 3: 0.9 } // footprint width used to pick sockets
const DRAG_THRESHOLD_PX = 5

// Layout, in slot units (1 = one socket width).
const GAP = 0.06
const CARD_H = 2 - GAP
const ROW_H = 2.1
const ROW_PAD = 0.3
const ROW_W = SOCKETS + ROW_PAD * 2
const ROW_GAP = 0.12
const SCENE_H = ROW_H * 2 + ROW_GAP

const inOutQuint = (t: number) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2)
const outQuad = (t: number) => 1 - (1 - t) ** 2
const outCubic = (t: number) => 1 - (1 - t) ** 3
const linear = (t: number) => t

interface Pose { x: number; y: number; s: number }
interface Lane { row: Row; y: number; nudge: number }
interface Card {
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

const stash: Lane = { row: { items: [], lo: 0, hi: 9 }, y: 0, nudge: -NUDGE }
const board: Lane = { row: { items: [], lo: 2, hi: 7 }, y: ROW_H + ROW_GAP, nudge: NUDGE }
const lanes = [stash, board]

for (const [lane, name] of [[stash, 'stash'], [board, 'board']] as const) {
  const el = document.createElement('div')
  el.className = `row ${name}`
  el.style.cssText = `top:calc(var(--u)*${lane.y});width:calc(var(--u)*${ROW_W});height:calc(var(--u)*${ROW_H})`
  const { lo, hi } = lane.row
  let html = `<div class="label">${name}</div>`
  html += `<div class="unlocked" style="left:calc(var(--u)*${ROW_PAD + lo - 0.2});width:calc(var(--u)*${hi - lo + 1.4});top:calc(var(--u)*0.08);bottom:calc(var(--u)*0.08)"></div>`
  for (let i = lo + 1; i <= hi; i++) html += `<div class="socket" style="left:calc(var(--u)*${ROW_PAD + i});top:calc(var(--u)*0.3);bottom:calc(var(--u)*0.3)"></div>`
  el.innerHTML = html
  scene.append(el)
}

const TIER = { bronze: '#c07a45', silver: '#b8c6d6', gold: '#f0c24a', diamond: '#7fe8f5' }
const seed: [Lane, string, Size, number, keyof typeof TIER, string][] = [
  [stash, 'Rocket Launcher', 2, 0, 'gold', '#5a6070'],
  [stash, 'SMG', 1, 3, 'silver', '#4a6a8a'],
  [stash, 'Anvil', 3, 5, 'bronze', '#6a5040'],
  [stash, 'Gem', 1, 9, 'diamond', '#3a7a8a'],
  [board, 'Dagger', 1, 2, 'bronze', '#7a4a3a'],
  [board, 'Shield', 2, 3, 'silver', '#4a5a7a'],
  [board, 'Bolt', 1, 6, 'gold', '#8a7a3a'],
]

const cards: Card[] = seed.map(([lane, name, size, pos, tier, color], i) => {
  const item: Item = { id: String(i), size, pos }
  lane.row.items.push(item)
  const el = document.createElement('div')
  el.className = 'card'
  el.style.cssText = `--size:${size};--tier:${TIER[tier]};--c1:${color};--c2:#15121a`
  el.innerHTML = `<div class="name">${name}</div>`
  const pane = glass(el)
  const effects = [pane, sheen(pane.el)]
  el.prepend(pane.el)
  scene.append(el)
  const c: Card = { item, lane, el, pose: { x: 0, y: 0, s: 1 }, tween: null, tilt: { x: 0, y: 0, tx: 0, ty: 0 }, hovered: false, nudged: false, effects }
  c.pose = rest(c)
  bind(c)
  return c
})

function rest(c: Card): Pose {
  return { x: ROW_PAD + c.item.pos + c.item.size / 2, y: c.lane.y + ROW_H / 2 + (c.nudged ? c.lane.nudge : 0), s: 1 }
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
  const lane = lanes
    .map(l => ({ l, d: Math.abs(y - (l.y + ROW_H / 2)) }))
    .filter(({ d }) => d < (ROW_H + CARD_H) / 2)
    .sort((a, b) => a.d - b.d)[0]?.l
  if (lane) {
    const hw = (c.item.size * OVERLAP[c.item.size]) / 2
    const sockets: number[] = []
    for (let i = lane.row.lo; i <= lane.row.hi; i++) if (ROW_PAD + i < x + hw && ROW_PAD + i + 1 > x - hw) sockets.push(i)
    if (sockets.length) return { lane, sockets }
  }
  const nearest = Math.round(x - ROW_PAD - c.item.size / 2)
  return { lane: c.lane, sockets: [Math.max(0, Math.min(SOCKETS - 1, nearest))] }
}

let press: { card: Card; x: number; y: number } | null = null
let drag: { card: Card; ox: number; oy: number } | null = null

function setHover(c: Card, on: boolean) {
  c.hovered = on
  if (on) {
    tweenTo(c, { ...rest(c), s: HOVER_SCALE }, HOVER_MS, outQuad)
  } else {
    c.tilt.tx = c.tilt.ty = 0
    tweenTo(c, rest(c), MOVE_MS, inOutQuint)
  }
}

function bind(c: Card) {
  const { el } = c
  el.addEventListener('pointerdown', e => {
    if (e.button !== 0 || drag) return
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
  const t = target(c)
  for (const o of cards) {
    if (o === c) continue
    const want = o.lane === t.lane && t.sockets.some(s => s >= o.item.pos && s < o.item.pos + o.item.size)
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
  const t = target(c)
  const from = c.lane
  const before = new Map(cards.map(o => [o, { pos: o.item.pos, lane: o.lane }]))
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
  for (const o of cards) {
    const b = before.get(o)!
    const moved = o.item.pos !== b.pos || o.lane !== b.lane
    const wasNudged = o.nudged
    o.nudged = false
    if (o === c) tweenTo(o, rest(o), MOVE_MS, inOutQuint)
    else if (moved) tweenTo(o, rest(o), o.lane !== b.lane ? MOVE_MS : PUSH_MS, outCubic)
    else if (wasNudged) tweenTo(o, rest(o), NUDGE_BACK_MS, outQuad)
  }
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
  u = Math.min((innerWidth * 0.94) / ROW_W, (innerHeight * 0.8) / SCENE_H)
  scene.style.setProperty('--u', `${u}px`)
  scene.style.width = `${ROW_W * u}px`
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
