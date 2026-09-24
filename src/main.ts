import './style.css'
import { glass, sheen, type Effect } from './card-effects.ts'
import { cardFace, cardVars, hideTooltip, mountTooltip, showTooltip } from './card-view.ts'
import { place, swap, SOCKETS, type Item, type Row, type Size } from './board.ts'
import { buyPrice, OFFERS, REROLL_COST, sellPrice, spread, START_GOLD, START_INCOME } from './economy.ts'
import { ITEMS, type ItemDef } from './items.ts'
import { play } from './playback.ts'

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
const MID_Y = (OPP_ROW + BOARD_ROW + ROW_H) / 2

const inOutQuint = (t: number) => (t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2)
const outQuad = (t: number) => 1 - (1 - t) ** 2
const outCubic = (t: number) => 1 - (1 - t) ** 3
const linear = (t: number) => t

interface Pose { x: number; y: number; s: number }
interface Lane { name: string; row: Row; y: number; nudge: number; mine: boolean; shop: boolean; el: HTMLElement }
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
let fighting = false
let gold = START_GOLD
let income = START_INCOME
let mode: 'merchant' | 'opponent' = 'merchant' // what the top row shows
let stashOpen = false
let overToy = false // dragging over the stash chest
let overSell = false // dragging one of your cards over the merchant's row
const cards: Card[] = []

/** Absolutely placed element, position and size in slot units. */
function box(cls: string, x: number, y: number, w: number, h: number, html = '') {
  const el = document.createElement('div')
  el.className = cls
  el.style.cssText = `left:calc(var(--u)*${x});top:calc(var(--u)*${y});width:calc(var(--u)*${w});height:calc(var(--u)*${h})`
  el.innerHTML = html
  scene.append(el)
  return el
}

function lane(name: string, y: number, nudge: number, kind: 'mine' | 'theirs' | 'shop', lo = 2, hi = 7): Lane {
  const curtain = `<div class="unlocked" style="left:calc(var(--u)*${ROW_PAD + lo - 0.1});width:calc(var(--u)*${hi - lo + 1.2})"></div>`
  const el = box(`row ${name}`, X0, y, ROW_W, ROW_H, curtain)
  return { name, row: { items: [], lo, hi }, y, nudge, mine: kind === 'mine', shop: kind === 'shop', el }
}

// --- Field ---
const midX = X0 + ROW_W / 2
box('dial', X0 - 1.95, MID_Y - 0.85, 1.7, 1.7, '<b>1</b><small>DAY</small>')

const rerollBtn = box('panel reroll', X0, OPP_STRIP, PANEL_W, STRIP_H)
const topPortrait = box('portrait', midX - 0.9, OPP_STRIP + 0.05, 1.8, 1.45, '<span></span>')
const oppHp = box('hp', X0 + PANEL_W + 0.05, OPP_STRIP + STRIP_H - 0.38, ROW_W - PANEL_W * 2 - 0.1, 0.34, '<i></i><b></b><span>400</span>')
const oppGold = box('panel gold', X0 + ROW_W - PANEL_W, OPP_STRIP, PANEL_W, STRIP_H, '<span>+5 » 3</span>')

// The top row is the merchant's, the opponent's during a fight, or your stash while it's open.
const merchant = lane('merchant', OPP_ROW, -NUDGE, 'shop', 0, 9)
const opponent = lane('opponent', OPP_ROW, NUDGE, 'theirs')
const stash = lane('stash', OPP_ROW, -NUDGE, 'mine', 0, 9)
const board = lane('board', BOARD_ROW, NUDGE, 'mine')
const lanes = [merchant, opponent, stash, board]
const sellZone = box('sell', X0, OPP_ROW, ROW_W, ROW_H) // over the merchant's offers, under the dragged card

const myHp = box('hp', X0 + PANEL_W + 0.05, PLAYER_STRIP + 0.04, ROW_W - PANEL_W * 2 - 0.1, 0.34, '<i></i><b></b><span>300</span>')
const myPortrait = box('portrait', midX - 0.9, PLAYER_STRIP + 0.45, 1.8, 1.45, '<span>You</span>')
const toy = box('panel toy', X0, PLAYER_STRIP, PANEL_W, STRIP_H, '<span>Stash</span>')
const myGold = box('panel gold', X0 + ROW_W - PANEL_W, PLAYER_STRIP, PANEL_W, STRIP_H)
mountTooltip(scene)

// --- Cards ---
let nextId = 0
function makeCard(lane: Lane, key: keyof typeof ITEMS, pos: number): Card {
  const def: ItemDef = ITEMS[key]
  const item: Item = { id: String(nextId++), size: def.size, pos }
  lane.row.items.push(item)
  const el = document.createElement('div')
  el.className = 'card'
  el.style.cssText = cardVars(def)
  el.innerHTML = cardFace(def)
  const pane = glass(el)
  el.querySelector('.art')!.after(pane.el) // glass sits over the art, under the frame and badges
  scene.append(el)
  const c: Card = { def, item, lane, el, pose: { x: 0, y: 0, s: 1 }, tween: null, tilt: { x: 0, y: 0, tx: 0, ty: 0 }, hovered: false, nudged: false, effects: [pane, sheen(pane.el)] }
  c.pose = rest(c)
  cards.push(c)
  setOwner(c)
  bind(c)
  return c
}

/** Price tag and cursor follow who owns the card: buy price at the merchant, sell value everywhere else. */
function setOwner(c: Card) {
  c.el.querySelector('.price')!.textContent = String(c.lane.shop ? buyPrice(c.def) : sellPrice(c.def))
  c.el.classList.toggle('theirs', !c.lane.mine && !c.lane.shop)
}

function removeCard(c: Card) {
  c.lane.row.items.splice(c.lane.row.items.indexOf(c.item), 1)
  cards.splice(cards.indexOf(c), 1)
  c.el.animate([{ opacity: 1 }, { opacity: 0, scale: '0.8' }], { duration: 220, easing: 'ease-in' }).finished.then(() => c.el.remove())
}

const seed: [Lane, keyof typeof ITEMS, number][] = [
  [opponent, 'rustBlade', 3],
  [opponent, 'brassBeetle', 4],
  [opponent, 'ironPot', 6],
  [board, 'sparkPistol', 2],
  [board, 'fieldKit', 3],
  [stash, 'towerShield', 0],
]
for (const [l, key, pos] of seed) makeCard(l, key, pos)

// --- Gold and the merchant ---
function renderGold() {
  myGold.innerHTML = `<span>+${income} » ${gold}</span>`
  rerollBtn.innerHTML = `<span>Reroll<br><b>${REROLL_COST}g</b></span>`
  rerollBtn.classList.toggle('disabled', gold < REROLL_COST)
}

function flash(el: HTMLElement, color: string) {
  el.animate([{ boxShadow: `0 0 0 calc(var(--u) * 0.06) ${color}, 0 0 calc(var(--u) * 0.4) ${color}` }, {}], { duration: 450, easing: 'ease-out' })
}

/** Fresh offers, spread evenly across the merchant's row. */
function rollOffers() {
  for (const c of cards.filter(c => c.lane === merchant)) removeCard(c)
  const keys = (Object.keys(ITEMS) as (keyof typeof ITEMS)[]).sort(() => Math.random() - 0.5)
  const picked: (keyof typeof ITEMS)[] = []
  let room = SOCKETS
  for (const k of keys) {
    if (picked.length === OFFERS) break
    if (ITEMS[k].size > room) continue
    picked.push(k)
    room -= ITEMS[k].size
  }
  const at = spread(picked.map(k => ITEMS[k].size))
  picked.forEach((k, i) => makeCard(merchant, k, at[i]).el.animate([{ opacity: 0, scale: '0.85' }, { opacity: 1, scale: '1' }], { duration: 250, delay: i * 60, fill: 'backwards', easing: 'ease-out' }))
  refreshTop()
}

rerollBtn.addEventListener('click', () => {
  if (fighting || mode !== 'merchant' || gold < REROLL_COST) return
  gold -= REROLL_COST
  renderGold()
  rollOffers()
})

function refreshTop() {
  const stashOn = stashOpen || overToy
  const shown = (l: Lane) => (l === stash ? stashOn : l === merchant ? !stashOn && mode === 'merchant' : l === opponent ? !stashOn && mode === 'opponent' : true)
  for (const l of lanes) l.el.classList.toggle('hidden', !shown(l))
  for (const c of cards) c.el.classList.toggle('hidden', !shown(c.lane) && drag?.card !== c)
  toy.classList.toggle('open', stashOn)
  topPortrait.querySelector('span')!.textContent = mode === 'merchant' ? 'Merchant' : 'Opponent'
  topPortrait.classList.toggle('merchant', mode === 'merchant')
  topPortrait.classList.toggle('enemy', mode === 'opponent')
  oppHp.classList.toggle('hidden', mode !== 'opponent')
  oppGold.classList.toggle('hidden', mode !== 'opponent')
  rerollBtn.classList.toggle('hidden', mode !== 'merchant')
}

toy.addEventListener('click', () => {
  stashOpen = !stashOpen
  refreshTop()
})

// --- Fight: board vs opponent, played out on the field. ---
const fightBtn = box('fight-btn', X0 + ROW_W + 0.35, MID_Y - 0.35, 1.5, 0.7, 'Fight!')
const SPEEDS = [0.5, 1, 2, 4]
const speedBox = box('speed', X0 + ROW_W + 0.35, MID_Y + 0.55, 1.5, 0.5,
  `<input type="range" min="0" max="${SPEEDS.length - 1}" step="1" value="1" aria-label="Playback speed">` +
  `<div class="ticks">${SPEEDS.map(v => `<span>${v}×</span>`).join('')}</div>`)
const speedInput = speedBox.querySelector('input')!
const showSpeed = () => speedBox.querySelectorAll('.ticks span').forEach((t, i) => t.classList.toggle('on', i === +speedInput.value))
speedInput.addEventListener('input', showSpeed)
showSpeed()

fightBtn.addEventListener('click', async () => {
  if (fighting || drag) return
  fighting = true
  stashOpen = false
  mode = 'opponent'
  refreshTop()
  const setup = (name: string, hp: number, l: Lane) => ({
    name,
    hp,
    items: cards.filter(c => c.lane === l).sort((a, b) => a.item.pos - b.item.pos).map(c => ({ id: c.item.id, def: c.def })),
  })
  await play(setup('You', 300, board), setup('Opponent', 400, opponent), (Math.random() * 2 ** 31) | 0, {
    scene,
    cardEl: id => cards.find(c => c.item.id === id)!.el,
    hp: [myHp, oppHp],
    portrait: [myPortrait, topPortrait],
    hovering: () => cards.some(c => c.hovered),
    speed: () => SPEEDS[+speedInput.value],
  })
  // Health doesn't carry over: everyone starts each fight full, like the live game.
  for (const [el, hp] of [[myHp, 300], [oppHp, 400]] as const) {
    el.querySelector('i')!.style.width = '100%'
    el.querySelector('b')!.style.width = '0'
    el.querySelector('span')!.textContent = String(hp)
  }
  // ponytail: income after every fight and a fresh merchant stand in for the day loop.
  gold += income
  renderGold()
  flash(myGold, '#f0c24a')
  mode = 'merchant'
  rollOffers()
  fighting = false
})

// --- Dragging ---
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

const inside = (e: PointerEvent, el: HTMLElement) => {
  const r = el.getBoundingClientRect()
  return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
}

// Which lane and sockets the dragged card is over. Like the live game: a shrunk footprint of the card
// picks the sockets it overlaps; if it's over nothing, it snaps to the nearest socket of its own lane.
function target(c: Card): { lane: Lane; sockets: number[] } {
  const { x, y } = c.pose
  const droppable = stashOpen || overToy ? [stash, board] : [board]
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
    if (e.button !== 0 || drag || fighting || !(c.lane.mine || c.lane.shop)) return
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
  if (c.lane.mine && mode === 'merchant') {
    sellZone.innerHTML = `<span>Sell for <b>${sellPrice(c.def)}g</b></span>`
    sellZone.classList.add('sellable')
  }
}

function dragMove(e: PointerEvent) {
  const c = drag!.card
  const p = toScene(e)
  c.pose.x = p.x + drag!.ox
  c.pose.y = p.y + drag!.oy

  const toyNow = inside(e, toy)
  if (toyNow !== overToy) {
    overToy = toyNow
    refreshTop()
  }
  overSell = sellZone.classList.contains('sellable') && !stashOpen && !overToy && inside(e, sellZone)
  sellZone.classList.toggle('selling', overSell)

  const t = target(c)
  for (const o of cards) {
    if (o === c) continue
    const want = !overToy && !overSell && o.lane === t.lane && t.sockets.some(s => s >= o.item.pos && s < o.item.pos + o.item.size)
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
  sellZone.classList.remove('sellable', 'selling')
  const from = c.lane
  const before = new Map(cards.map(o => [o, { pos: o.item.pos, lane: o.lane }]))

  if (overSell) {
    gold += sellPrice(c.def)
    renderGold()
    flash(myGold, '#f0c24a')
    removeCard(c)
  } else {
    // Dropped on the chest: into the stash, pushed in from the left.
    const t = overToy ? { lane: stash, sockets: [0] } : target(c)
    if (from.shop) {
      if (t.lane !== from) buy(c, t.lane, t.sockets[0])
    } else if (t.lane === from) {
      if (!overToy) apply(from, place(from.row, c.item, t.sockets[0], c.item.pos))
    } else {
      transfer(c, t.lane, t.sockets[0])
    }
  }
  overToy = overSell = false

  for (const o of cards) {
    const b = before.get(o)!
    const moved = o.item.pos !== b.pos || o.lane !== b.lane
    const wasNudged = o.nudged
    o.nudged = false
    if (o === c) tweenTo(o, rest(o), MOVE_MS, inOutQuint)
    else if (moved) tweenTo(o, rest(o), o.lane !== b.lane ? MOVE_MS : PUSH_MS, outCubic)
    else if (wasNudged) tweenTo(o, rest(o), NUDGE_BACK_MS, outQuad)
  }
  refreshTop()
}

/** Your card to another of your rows: push the others aside, or swap what it covers back if it can't fit. */
function transfer(c: Card, dest: Lane, at: number) {
  const from = c.lane
  const pushed = place(dest.row, c.item, at)
  const swapped = pushed ? null : swap(dest.row, from.row, c.item, at)
  if (pushed) {
    moveLane(c, dest)
    apply(dest, pushed)
  } else if (swapped) {
    for (const o of swapped.covered) moveLane(cards.find(k => k.item === o)!, from)
    moveLane(c, dest)
    apply(dest, swapped.to)
    apply(from, swapped.from)
  }
}

/** Merchant card onto your board or stash. On a full board, what it covers goes to the stash. */
function buy(c: Card, dest: Lane, at: number) {
  const price = buyPrice(c.def)
  if (gold < price) return flash(myGold, '#e04040')
  const pushed = place(dest.row, c.item, at)
  const swapped = pushed || dest !== board ? null : swap(dest.row, stash.row, { ...c.item, pos: 0 }, at)
  if (!pushed && !swapped) return
  gold -= price
  renderGold()
  if (pushed) {
    moveLane(c, dest)
    apply(dest, pushed)
  } else if (swapped) {
    for (const o of swapped.covered) moveLane(cards.find(k => k.item === o)!, stash)
    moveLane(c, dest)
    apply(dest, swapped.to)
    apply(stash, swapped.from)
  }
  setOwner(c)
}

function moveLane(c: Card, l: Lane) {
  c.lane.row.items.splice(c.lane.row.items.indexOf(c.item), 1)
  l.row.items.push(c.item)
  c.lane = l
}

function apply(l: Lane, positions: Map<string, number> | null) {
  if (positions) for (const it of l.row.items) it.pos = positions.get(it.id)!
}

// --- Frame loop ---
function layout() {
  u = Math.min(innerWidth / SCENE_W, innerHeight / SCENE_H)
  scene.style.setProperty('--u', `${u}px`)
  scene.style.width = `${SCENE_W * u}px`
  scene.style.height = `${SCENE_H * u}px`
}
addEventListener('resize', layout)
layout()
renderGold()
rollOffers()

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
