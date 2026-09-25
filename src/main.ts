import './style.css'
import { glass, sheen, type Effect } from './card-effects.ts'
import { cardFace, cardVars, hideTooltip, itemInfo, mountTooltip, showInfo, showTooltip, skillFace, skillInfo } from './card-view.ts'
import { bestFit, exchange, firstFree, place, SOCKETS, swap, under, type Item, type Row, type Size } from './board.ts'
import { buyPrice, REROLL_COST, sellPrice, spread, START_GOLD, START_INCOME } from './economy.ts'
import { canEnchant, ITEM_KEYS, itemAt, ITEMS, transformed, type ItemDef, type ItemKey, type RunState } from './items.ts'
import { fightOutcomes, runTrigger, type Outcome, type RunCard, type RunEvent } from './run-effects.ts'
import { KEYWORDS, type Keyword } from './keywords.ts'
import { ENCHANT_KEYS, ENCHANTS, rollEnchants, type Enchant } from './enchant.ts'
import { SKILL_KEYS, skillAt, SKILLS, type SkillDef, type SkillKey } from './skills.ts'
import { nextTier, TIER_ORDER, tierName, type Tier } from './tiers.ts'
import { choose, type Option } from './choice.ts'
import { rollStock } from './shop.ts'
import { hourOptions, loadout, monsterOptions, skillPick, type EventContext, type GameEvent, type Loadout, type Merchant, type Reward as EventReward, type SkillPick } from './encounters.ts'
import { boardSockets, HOURS, hourKind, lastChanceOptions, levelRewards, maxHp, prestigeLoss, rival, startPackages, START_PRESTIGE, WINS_TO_WIN, XP_PER_HOUR, XP_PER_LEVEL, type LastChance, type Reward, type StartPackage } from './run.ts'
import { play } from './playback.ts'
import type { UnitDef } from './engine/combat.ts'

// Test flags, e.g. ?gold=500&level=4&items=windupKey,rustBlade:gold:shielded&skills=quickHands:silver
// gold and level set the start; items (key[:tier[:enchant]]) replace the starting items; skills (key[:tier]) are learned.
// Any of them makes a test run: no start screen.
const flags = new URLSearchParams(location.search)
const testRun = ['gold', 'level', 'items', 'skills'].some(f => flags.has(f))
const flagList = (name: string) => (flags.get(name) ?? '').split(',').filter(Boolean).map(entry => entry.split(':'))

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
  key: ItemKey
  tier: Tier
  enchant?: Enchant
  def: ItemDef // at the card's current tier, with its enchantment and run state
  run: Required<RunState> // permanent gains and quest progress
  item: Item
  lane: Lane
  el: HTMLElement
  pose: Pose
  tween: { from: Pose; to: Pose; t0: number; ms: number; ease: (t: number) => number; done?: () => void } | null
  tilt: { x: number; y: number; tx: number; ty: number }
  hovered: boolean
  nudged: boolean
  flying: boolean // on its way into the closed stash: stays visible until it reaches the chest
  effects: Effect[]
}
interface Skill { key: SkillKey; def: SkillDef; id: string; el: HTMLElement }

const scene = document.getElementById('scene')!
let u = 100
let press: { card: Card; x: number; y: number } | null = null
let drag: { card: Card; ox: number; oy: number; sell: boolean } | null = null // sell: it's yours and selling is open
let fighting = false
let gold = Number(flags.get('gold') ?? START_GOLD)
let income = START_INCOME
let mode: 'choice' | 'merchant' | 'opponent' = 'choice' // what the top row shows
let day = 1
let hour = 0
let wins = 0
let level = Number(flags.get('level') ?? 1)
let xp = 0
let prestige = START_PRESTIGE
let lastChance = false // used up: the next loss once Prestige is gone ends the run
let shopTags: string[] | undefined // current merchant's stock filter
let choiceEl: HTMLElement | null = null
let stashOpen = false
let overToy = false // dragging over the stash chest
let overSell = false // dragging one of your cards over the sell zone (top row, outside fights)
const cards: Card[] = []
const mySkills: Skill[] = []
let theirSkills: Skill[] = []

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
  const el = box(`row ${name}`, X0, y, ROW_W, ROW_H, '<div class="unlocked"></div>')
  const l = { name, row: { items: [], lo, hi }, y, nudge, mine: kind === 'mine', shop: kind === 'shop', el }
  setUnlocked(l, lo, hi)
  return l
}

/** Unlocked sockets lo..hi, and the dark curtain that shows them. */
function setUnlocked(l: Lane, lo: number, hi: number) {
  l.row.lo = lo
  l.row.hi = hi
  const curtain = l.el.querySelector<HTMLElement>('.unlocked')!
  curtain.style.left = `calc(var(--u) * ${ROW_PAD + lo - 0.1})`
  curtain.style.width = `calc(var(--u) * ${hi - lo + 1.2})`
}

// --- Field ---
const midX = X0 + ROW_W / 2
const dial = box('dial', X0 - 1.95, MID_Y - 0.85, 1.7, 1.7)
const record = box('record', X0 - 1.95, MID_Y + 1.0, 1.7, 0.6)

const rerollBtn = box('panel reroll', X0, OPP_STRIP, PANEL_W, STRIP_H)
const topPortrait = box('portrait', midX - 0.9, OPP_STRIP + 0.05, 1.8, 1.45, '<span></span>')
const oppHp = box('hp', X0 + PANEL_W + 0.05, OPP_STRIP + STRIP_H - 0.38, ROW_W - PANEL_W * 2 - 0.1, 0.34, '<i></i><b></b><span>400</span>')

// The top row is the merchant's, the opponent's during a fight, or your stash while it's open.
const merchant = lane('merchant', OPP_ROW, -NUDGE, 'shop', 0, 9)
const opponent = lane('opponent', OPP_ROW, NUDGE, 'theirs', 0, 9)
const stash = lane('stash', OPP_ROW, -NUDGE, 'mine', 0, 9)
const board = lane('board', BOARD_ROW, NUDGE, 'mine', boardSockets(level).lo, boardSockets(level).hi)
const lanes = [merchant, opponent, stash, board]
const sellZone = box('sell', X0, OPP_ROW, ROW_W, ROW_H) // over the merchant's offers, under the dragged card

const myHp = box('hp', X0 + PANEL_W + 0.05, PLAYER_STRIP + 0.04, ROW_W - PANEL_W * 2 - 0.1, 0.34, '<i></i><b></b><span></span>')
const myPortrait = box('portrait', midX - 0.9, PLAYER_STRIP + 0.45, 1.8, 1.45, '<span>You</span><b class="level"></b>')
const toy = box('panel toy', X0, PLAYER_STRIP, PANEL_W, STRIP_H, '<div class="fill"></div><span>Stash</span>')
const myXp = box('xp', midX - 0.55, PLAYER_STRIP + 1.96, 1.45, 0.12) // under the portrait, beside the level badge
const myGold = box('panel gold', X0 + ROW_W - PANEL_W, PLAYER_STRIP, PANEL_W, STRIP_H)
mountTooltip(scene)

// --- Cards ---
let nextId = 0
function makeCard(lane: Lane, key: ItemKey, pos: number, tier: Tier = ITEMS[key].tier, enchant?: Enchant): Card {
  const def = itemAt(key, tier, enchant)
  const item: Item = { id: String(nextId++), size: def.size, pos }
  lane.row.items.push(item)
  const el = document.createElement('div')
  el.className = 'card'
  scene.append(el)
  const c: Card = { key, tier, enchant, def, run: { perm: {}, progress: 0, done: false }, item, lane, el, pose: { x: 0, y: 0, s: 1 }, tween: null, tilt: { x: 0, y: 0, tx: 0, ty: 0 }, hovered: false, nudged: false, flying: false, effects: [] }
  renderFace(c)
  c.pose = rest(c)
  cards.push(c)
  setOwner(c)
  bind(c)
  return c
}

/** (Re)draw the card face for its current def (or another one, while it's transformed in a fight). */
function renderFace(c: Card, def = c.def) {
  c.el.style.removeProperty('--ench')
  for (const kv of cardVars(def).split(';')) c.el.style.setProperty(...(kv.split(':') as [string, string]))
  c.el.innerHTML = cardFace(def)
  const pane = glass(c.el)
  c.el.querySelector('.art')!.after(pane.el) // glass sits over the art, under the frame and badges
  c.effects = [pane, sheen(pane.el)]
}

/** Your items: board and stash. */
const mine = () => cards.filter(c => c.lane.mine)

/** Your oldest copy of `key` that can still go up a tier, if any. */
const upgradeTarget = (key: ItemKey) => mine().find(o => o.key === key && nextTier(o.tier))

/** Change a card's tier and/or enchantment, with a little pop. */
function remake(c: Card, tier: Tier, enchant: Enchant | undefined, color: string) {
  c.tier = tier
  c.enchant = enchant
  refresh(c)
  c.el.animate([{ scale: '1' }, { scale: '1.18' }, { scale: '1' }], { duration: 420, easing: 'ease-out' })
  flash(c.el, color)
  refreshTop()
}

/** Recompute a card from its key, tier, enchantment and run state, and redraw it. */
function refresh(c: Card) {
  c.def = itemAt(c.key, c.tier, c.enchant, c.run)
  renderFace(c)
  setOwner(c)
}

/** One tier up: new stats, frame and value. Its enchantment (or a new one) and anything it has grown come along. */
function upgrade(c: Card, enchant = c.enchant) {
  remake(c, nextTier(c.tier)!, enchant, 'var(--tier)')
  toast(`${c.def.name} upgraded to ${tierName(c.tier)}!`)
}

/** Enchant (or re-enchant) one of your items. */
function enchantCard(c: Card, e: Enchant) {
  remake(c, c.tier, e, ENCHANTS[e].color)
  toast(`${c.def.name} is now ${ENCHANTS[e].name}!`)
}

const canEnchantCard = (c: Card, e: Enchant) => c.enchant !== e && canEnchant(c.key, e)

// --- Skills: badges beside the portraits. Yours below, the opponent's (during fights) above. ---
const SKILL = 0.62 // badge size, slot units
const SKILL_GAP = 0.08
const SKILL_SLOTS = 12

/** Slot i: alternating left and right of the portrait, nearest columns first, two rows. */
function skillSpot(side: 0 | 1, i: number) {
  const k = Math.floor(i / 4)
  const right = Math.floor(i / 2) % 2 === 1
  const x = right ? midX + 1.1 + k * (SKILL + SKILL_GAP) : midX - 1.1 - SKILL - k * (SKILL + SKILL_GAP) // clear of the level badge
  const y = (side === 0 ? PLAYER_STRIP + 0.5 : OPP_STRIP + 0.12) + (i % 2) * (SKILL + SKILL_GAP)
  return { x, y }
}

function makeSkill(key: SkillKey, tier: Tier): Skill {
  const def = skillAt(key, tier)
  const el = box('skill', 0, 0, SKILL, SKILL, skillFace(def))
  const s: Skill = { key, def, id: `skill${nextId++}`, el }
  el.addEventListener('mouseenter', () => {
    const r = el.getBoundingClientRect()
    const sr = scene.getBoundingClientRect()
    showInfo(skillInfo(s.def), { x: (r.left + r.width / 2 - sr.left) / u, y: (r.top + r.height / 2 - sr.top) / u, w: SKILL, h: SKILL }, u, SCENE_W)
  })
  el.addEventListener('mouseleave', hideTooltip)
  return s
}

function layoutSkills(list: Skill[], side: 0 | 1) {
  list.slice(0, SKILL_SLOTS).forEach((s, i) => {
    const { x, y } = skillSpot(side, i)
    s.el.style.left = `calc(var(--u) * ${x})`
    s.el.style.top = `calc(var(--u) * ${y})`
  })
}

const ownedSkill = (key: SkillKey) => mySkills.find(s => s.key === key)
/** A skill you can take: new, or one you have that isn't maxed. */
const canLearn = (key: SkillKey) => !ownedSkill(key) || nextTier(ownedSkill(key)!.def.tier) !== null
/** What taking `key` (offered at `tier`) gives you: the skill at that tier, or your copy one tier up. */
function learnPreview(key: SkillKey, tier: Tier) {
  const owned = ownedSkill(key)
  return owned ? skillAt(key, nextTier(owned.def.tier)!) : skillAt(key, tier)
}

function upgradeSkill(s: Skill) {
  s.def = skillAt(s.key, nextTier(s.def.tier)!)
  s.el.innerHTML = skillFace(s.def)
  s.el.animate([{ scale: '1' }, { scale: '1.3' }, { scale: '1' }], { duration: 420, easing: 'ease-out' })
  toast(`${s.def.name} upgraded to ${tierName(s.def.tier)}!`)
}

/** Take a skill: new ones join your badges, ones you have go up a tier. */
function learn(key: SkillKey, tier: Tier) {
  const owned = ownedSkill(key)
  if (owned) return upgradeSkill(owned)
  const s = makeSkill(key, tier)
  mySkills.push(s)
  layoutSkills(mySkills, 0)
  s.el.animate([{ opacity: 0, scale: '1.6' }, { opacity: 1, scale: '1' }], { duration: 320, easing: 'ease-out' })
  toast(`Learned ${s.def.name}!`)
}

/** Offers that would upgrade something you own get an arrow. */
function markUpgrades() {
  for (const c of cards) if (c.lane.shop) c.el.classList.toggle('upgrades', !!upgradeTarget(c.key))
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

/** What every run starts with. */
function starterKit() {
  makeCard(board, 'sparkPistol', 3)
  makeCard(board, 'fieldKit', 4)
  makeCard(stash, 'towerShield', 0)
}

// --- Gold and the merchant ---
function renderGold() {
  myGold.innerHTML = `<span>+${income} » ${gold}</span>`
  rerollBtn.innerHTML = `<span>Reroll<br><b>${REROLL_COST}g</b></span>`
  rerollBtn.classList.toggle('disabled', gold < REROLL_COST)
}

const toastEl = box('toast', X0, BOARD_ROW + ROW_H / 2 - 0.3, ROW_W, 0.6)
function toast(text: string) {
  toastEl.textContent = text
  toastEl.getAnimations().forEach(a => a.cancel())
  toastEl.animate([{ opacity: 0, translate: '0 10px' }, { opacity: 1, translate: '0 0', offset: 0.12 }, { opacity: 1, offset: 0.75 }, { opacity: 0 }], { duration: 1600, easing: 'ease-out' })
}

function flash(el: HTMLElement, color: string) {
  el.animate([{ boxShadow: `0 0 0 calc(var(--u) * 0.06) ${color}, 0 0 calc(var(--u) * 0.4) ${color}` }, {}], { duration: 450, easing: 'ease-out' })
}

/**
 * Fresh stock filling the merchant's whole row (tiers by day, sometimes enchanted: see shop.ts), from items with
 * any of `tags` (everything when none). Items you own and can't upgrade any further aren't offered.
 */
function rollOffers(tags?: string[]) {
  for (const c of cards.filter(c => c.lane === merchant)) removeCard(c)
  const maxed = (k: ItemKey) => mine().some(c => c.key === k) && !upgradeTarget(k)
  const pool = ITEM_KEYS.filter(k => (!tags || ITEMS[k].tags.some(t => tags.includes(t))) && !maxed(k))
  const stock = rollStock(day, pool, Math.random, SOCKETS)
  const at = spread(stock.map(o => ITEMS[o.key].size))
  stock.forEach((o, i) => makeCard(merchant, o.key, at[i], o.tier, o.enchant).el.animate([{ opacity: 0, scale: '0.85' }, { opacity: 1, scale: '1' }], { duration: 250, delay: i * 60, fill: 'backwards', easing: 'ease-out' }))
  refreshTop()
}

rerollBtn.addEventListener('click', () => {
  if (fighting || mode !== 'merchant' || gold < REROLL_COST) return
  gold -= REROLL_COST
  renderGold()
  rollOffers(shopTags)
})

function refreshTop() {
  const shown = (l: Lane) => (l === stash ? stashOpen : l === merchant ? !stashOpen && mode === 'merchant' : l === opponent ? !stashOpen && mode === 'opponent' : true)
  for (const l of lanes) l.el.classList.toggle('hidden', !shown(l))
  for (const c of cards) c.el.classList.toggle('hidden', !shown(c.lane) && drag?.card !== c && !c.flying)
  choiceEl?.classList.toggle('hidden', stashOpen)
  sellZone.classList.toggle('sellable', !!drag?.sell && !stashOpen) // the sell zone covers the top row, so not while it shows your stash
  markUpgrades()
  renderStash()
  toy.classList.toggle('open', stashOpen || overToy) // also glows while a card is held over it
  oppHp.classList.toggle('hidden', mode !== 'opponent')
  rerollBtn.classList.toggle('hidden', mode !== 'merchant')
}

/** Who's across from you: name and portrait colors. */
function setTop(title: string, color?: [string, string]) {
  topPortrait.querySelector('span')!.textContent = title
  topPortrait.style.background = color ? `linear-gradient(160deg, ${color[0]}, ${color[1]})` : ''
}

function renderClock() {
  const pips = Array.from({ length: HOURS }, (_, i) => `<i class="${i < hour ? 'done' : i === hour ? 'now' : ''}${hourKind(i) === 'choice' ? '' : ' fight'}"></i>`).join('')
  dial.innerHTML = `<small>DAY</small><b>${day}</b><div class="pips">${pips}</div>`
  record.innerHTML = `<span>Wins <b>${wins}/${WINS_TO_WIN}</b></span><span>Prestige <b>${Math.max(0, prestige)}</b></span>${lastChance ? '<span class="warn">Last chance</span>' : ''}`
}

function renderLevel() {
  myXp.innerHTML = Array.from({ length: XP_PER_LEVEL }, (_, i) => `<i class="${i < xp ? 'on' : ''}"></i>`).join('')
  myPortrait.querySelector('.level')!.textContent = String(level)
  if (!fighting) resetBar(myHp, maxHp(level))
}

/** Stash pips: one per socket, lit for each one an item takes up. */
function renderStash() {
  const used = stash.row.items.reduce((n, it) => n + it.size, 0)
  toy.querySelector('.fill')!.innerHTML = Array.from({ length: SOCKETS }, (_, i) => `<i class="${i < used ? 'on' : ''}"></i>`).join('')
}

toy.addEventListener('click', () => {
  stashOpen = !stashOpen
  refreshTop()
})

// --- Buttons: Leave (merchants) and playback speed ---
const actionBtn = box('fight-btn hidden', X0 + ROW_W + 0.35, MID_Y - 0.35, 1.5, 0.7)
function waitButton(label: string) {
  actionBtn.textContent = label
  actionBtn.classList.remove('hidden')
  return new Promise<void>(resolve =>
    actionBtn.addEventListener('click', () => {
      actionBtn.classList.add('hidden')
      resolve()
    }, { once: true }),
  )
}

const SPEEDS = [0.5, 1, 2, 4]
const speedBox = box('speed', X0 + ROW_W + 0.35, MID_Y + 0.55, 1.5, 0.5,
  `<input type="range" min="0" max="${SPEEDS.length - 1}" step="1" value="1" aria-label="Playback speed">` +
  `<div class="ticks">${SPEEDS.map(v => `<span>${v}×</span>`).join('')}</div>`)
const speedInput = speedBox.querySelector('input')!
const showSpeed = () => speedBox.querySelectorAll('.ticks span').forEach((t, i) => t.classList.toggle('on', i === +speedInput.value))
speedInput.addEventListener('input', showSpeed)
showSpeed()

// --- The run: days of six hours. Choices, a monster at hour 3, a rival at the end of the day. ---

/** Show a pick-one screen over the top row; resolves with the chosen index. */
async function pick(options: Option[]) {
  const c = choose(scene, { x: X0, y: OPP_ROW, w: ROW_W, h: ROW_H }, options, () => u, SCENE_W)
  choiceEl = c.el
  refreshTop()
  const i = await c.picked
  choiceEl = null
  return i
}

/** Add an item to the first free spot on the board, else the stash (compacted to fit). False if there's no room. */
function give(key: ItemKey, tier?: Tier, enchant?: Enchant) {
  const size = ITEMS[key].size
  let dest = board
  let at = firstFree(board.row, size)
  if (at === null) {
    const fit = bestFit(stash.row, { id: 'new', size })
    if (!fit) return false
    shift(stash, fit)
    dest = stash
    at = fit.get('new')!
  }
  const c = makeCard(dest, key, at, tier, enchant)
  c.el.animate([{ opacity: 0, scale: '1.3' }, { opacity: 1, scale: '1' }], { duration: 300, easing: 'ease-out' })
  if (dest === stash && !stashOpen) flash(toy, '#f0c24a')
  refreshTop()
  return true
}

interface Foe { name: string; hp: number; items: Loadout[]; skills?: SkillPick[]; color?: [string, string] }

/** Lay out a build on the opponent's row (skills by their portrait) and play the fight. */
async function fight({ name, hp, items, skills = [], color }: Foe) {
  for (const c of cards.filter(c => c.lane === opponent)) removeCard(c)
  const build = items.map(loadout)
  const total = build.reduce((n, l) => n + ITEMS[l.key].size, 0)
  let at = Math.floor((SOCKETS - total) / 2)
  for (const l of build) {
    makeCard(opponent, l.key, at, l.tier, l.enchant)
    at += ITEMS[l.key].size
  }
  theirSkills = skills.map(skillPick).map(sp => makeSkill(sp.key, sp.tier))
  layoutSkills(theirSkills, 1)
  const curtain = opponent.el.querySelector<HTMLElement>('.unlocked')!
  curtain.style.left = `calc(var(--u) * ${ROW_PAD + Math.floor((SOCKETS - total) / 2) - 0.1})`
  curtain.style.width = `calc(var(--u) * ${total + 0.2})`

  fighting = true
  stashOpen = false
  mode = 'opponent'
  setTop(name, color)
  resetBar(oppHp, hp)
  refreshTop()
  const setup = (who: string, maxHp: number, l: Lane, skills: Skill[]) => ({
    name: who,
    hp: maxHp,
    items: cards.filter(c => c.lane === l).sort((a, b) => a.item.pos - b.item.pos).map(c => ({ id: c.item.id, def: c.def })),
    skills: skills.map(s => ({ id: s.id, def: s.def })),
  })
  const stage = {
    scene,
    cardEl: (id: string) => cards.find(c => c.item.id === id)!.el,
    skillEl: (id: string) => [...mySkills, ...theirSkills].find(s => s.id === id)?.el,
    transformed: (id: string, def: UnitDef) => renderFace(cards.find(c => c.item.id === id)!, def as ItemDef),
    hp: [myHp, oppHp] as [HTMLElement, HTMLElement],
    portrait: [myPortrait, topPortrait] as [HTMLElement, HTMLElement],
    hovering: () => cards.some(c => c.hovered),
    speed: () => SPEEDS[+speedInput.value],
  }
  const transform = (def: UnitDef, into: string | undefined, random: () => number) => transformed(def as ItemDef, into as ItemKey | undefined, random)
  const { winner, events } = await play(setup('You', maxHp(level), board, mySkills), setup(name, hp, opponent, theirSkills), (Math.random() * 2 ** 31) | 0, stage, { transform })
  resetBar(myHp, maxHp(level)) // health doesn't carry over: everyone starts each fight full, like the live game
  for (const s of theirSkills) s.el.remove()
  theirSkills = []
  if (events.some(e => e.kind === 'transform')) for (const c of cards.filter(c => c.lane === board)) renderFace(c) // back from fight-only transforms
  fighting = false
  applyOutcomes(fightOutcomes(events)) // what the fight did to the run: growth, gold, quest progress...
  react({ on: winner === 0 ? 'win' : 'lose' })
  return winner
}

function resetBar(el: HTMLElement, hp: number) {
  el.querySelector('i')!.style.width = '100%'
  el.querySelector('b')!.style.width = '0'
  el.querySelector('span')!.textContent = String(hp)
}

async function visit(m: Merchant) {
  mode = 'merchant'
  shopTags = m.tags
  setTop(m.name, m.color)
  rollOffers(m.tags)
  await waitButton('Leave')
  for (const c of cards.filter(c => c.lane === merchant)) removeCard(c)
}

const eventContext = (): EventContext => ({
  day,
  canLearn,
  canEnchant: e => mine().some(c => canEnchantCard(c, e)),
})

const skillOption = (key: SkillKey, tier: Tier): Option => {
  const def = learnPreview(key, tier)
  return { info: skillInfo(def), skill: def, upgrades: !!ownedSkill(key) }
}
const enchantOption = (e: Enchant): Option => ({
  info: { title: ENCHANTS[e].name, tags: ['Enchantment', ...(ENCHANTS[e].rare ? ['Legendary rare'] : [])], text: ENCHANTS[e].text },
  badge: 'Enchant',
  color: [ENCHANTS[e].color, '#1a1420'],
})

/** Pick which of your items gets `e`; each option shows the item as it would be. */
async function enchantPick(e: Enchant) {
  const eligible = mine().filter(c => canEnchantCard(c, e))
  if (!eligible.length) return
  setTop(ENCHANTS[e].name, [ENCHANTS[e].color, '#1a1420'])
  const preview = (c: Card) => itemAt(c.key, c.tier, e, c.run)
  enchantCard(eligible[await pick(eligible.map(c => ({ info: itemInfo(preview(c)), item: preview(c) })))], e)
}

async function runEvent(e: GameEvent) {
  setTop(e.name, e.color)
  const rewards: EventReward[] = e.options(Math.random, eventContext())
  if (!rewards.length) rewards.push({ label: 'Walk on', text: ['Nothing here for you'] })
  for (;;) {
    const r = rewards[await pick(rewards.map(r =>
      r.item ? { info: itemInfo(itemAt(r.item, r.tier)), item: itemAt(r.item, r.tier) }
      : r.skill ? skillOption(r.skill, r.tier ?? SKILLS[r.skill].tier)
      : r.enchant ? enchantOption(r.enchant)
      : { info: { title: r.label, text: r.text }, badge: e.name, color: e.color }))]
    if (r.gold && r.gold < 0 && gold < -r.gold) {
      noGold()
      continue
    }
    if (r.item && !give(r.item, r.tier)) {
      toast('No room: sell something first')
      continue
    }
    if (r.skill) learn(r.skill, r.tier ?? SKILLS[r.skill].tier)
    if (r.enchant) await enchantPick(r.enchant)
    gold += r.gold ?? 0
    income += r.income ?? 0
    renderGold()
    if (r.gold || r.income) flash(myGold, '#f0c24a')
    return
  }
}

async function choiceHour() {
  mode = 'choice'
  setTop(`Hour ${hour + 1}`)
  const opts = hourOptions(Math.random)
  const enc = opts[await pick(opts.map(e => ({
    info: { title: e.name, tags: [e.kind === 'merchant' ? 'Merchant' : 'Event'], text: [e.blurb] },
    badge: e.kind === 'merchant' ? 'Merchant' : 'Event',
    color: e.color,
  })))]
  if (enc.kind === 'merchant') await visit(enc)
  else await runEvent(enc)
}

async function monsterHour() {
  mode = 'choice'
  setTop('Monsters')
  const ms = monsterOptions(day, Math.random)
  const carried = (l: Loadout) => {
    const { key, enchant } = loadout(l)
    return enchant ? `${ENCHANTS[enchant].name} ${ITEMS[key].name}` : ITEMS[key].name
  }
  const m = ms[await pick(ms.map(m => ({
    info: {
      title: m.name,
      tags: ['Monster', `Health ${m.hp}`],
      text: [m.blurb, `Reward: ${m.gold} gold`, `Carries ${m.items.map(carried).join(', ')}`, ...(m.skills?.length ? [`Skills: ${m.skills.map(sp => SKILLS[skillPick(sp).key].name).join(', ')}`] : [])],
    },
    badge: 'Monster',
    color: m.color,
  })))]
  if ((await fight(m)) === 0) {
    gold += m.gold
    renderGold()
    flash(myGold, '#f0c24a')
    toast(`+${m.gold} gold, +${m.xp} XP`)
    await gainXp(m.xp)
  }
}

/** XP in; every full bar is a level: more health, a bigger board, and a reward pick. */
async function gainXp(n: number) {
  xp += n
  renderLevel()
  while (xp >= XP_PER_LEVEL) {
    xp -= XP_PER_LEVEL
    level++
    const { lo, hi } = boardSockets(level)
    setUnlocked(board, lo, hi)
    renderLevel()
    flash(myPortrait, '#f0c24a')
    toast(`Level ${level}! +50 health, bigger board`)
    react({ on: 'levelUp' })
    await levelUp()
  }
}

// --- Run effects: what your cards do between fights, and what fights leave behind (run-effects.ts). ---

/** Your cards as run effects see them: the board in order, the stash, your skills. */
function runCards(): RunCard[] {
  const inOrder = (l: Lane) => cards.filter(c => c.lane === l).sort((a, b) => a.item.pos - b.item.pos)
  return [
    ...inOrder(board).map(c => ({ id: c.item.id, def: c.def, place: 'board' as const })),
    ...inOrder(stash).map(c => ({ id: c.item.id, def: c.def, place: 'stash' as const })),
    ...mySkills.map(s => ({ id: s.id, def: s.def, place: 'skill' as const })),
  ]
}

/** Something happened between fights: your cards react. */
function react(event: RunEvent) {
  applyOutcomes(runTrigger(event, runCards(), Math.random))
}

const fmtNum = (n: number) => String(Math.round(n * 100) / 100)

function applyOutcomes(list: Outcome[]) {
  for (const o of list) {
    if (o.kind === 'gold') {
      gold += o.amount
      renderGold()
      flash(myGold, '#f0c24a')
      floatOver(myGold, `+${fmtNum(o.amount)}g`, KEYWORDS.gold.color)
      continue
    }
    const c = cards.find(k => k.item.id === o.card && k.lane.mine)
    if (!c) continue // a skill, or an item that's gone (just sold)
    if (o.kind === 'grow') {
      c.run.perm[o.stat] = (c.run.perm[o.stat] ?? 0) + o.amount
      refresh(c)
      floatOver(c, `+${fmtNum(o.amount)}`, KEYWORDS[o.stat as Keyword].color)
    } else if (o.kind === 'progress') {
      if (!c.def.quest || c.run.done) continue
      c.run.progress += o.amount
      if (c.run.progress >= c.def.quest.goal) completeQuest(c)
      else refresh(c)
    } else if (o.kind === 'upgrade') {
      if (nextTier(c.tier)) upgrade(c)
    } else {
      transformCard(c, o.into as ItemKey | undefined)
    }
  }
}

/** A quest's reward: the item keeps it for good, or goes up a tier, or turns into another item. */
function completeQuest(c: Card) {
  const reward = c.def.quest!.reward
  const name = c.def.name
  c.run.done = true
  if (reward.transform) transformCard(c, reward.transform as ItemKey)
  else if (reward.upgrade && nextTier(c.tier)) upgrade(c)
  else remake(c, c.tier, c.enchant, '#f5d77a')
  toast(`Quest complete: ${name}!`)
}

/** Permanently turn a card into another item of its size; tier and enchantment carry over when they can, run state doesn't. */
function transformCard(c: Card, into?: ItemKey) {
  const next = transformed(c.def, into, Math.random)
  if (!next || next.size !== c.item.size) return
  const name = c.def.name
  c.key = next.key
  c.run = { perm: {}, progress: 0, done: false }
  remake(c, next.tier, next.enchant, KEYWORDS.transform.color)
  toast(`${name} became ${c.def.name}!`)
}

/** A number rising off a card (off the chest, if the card is in the closed stash) or a panel. */
function floatOver(target: Card | HTMLElement, text: string, color: string) {
  const el = target instanceof HTMLElement ? target : target.el.classList.contains('hidden') ? toy : target.el
  const r = el.getBoundingClientRect()
  const s = scene.getBoundingClientRect()
  const f = document.createElement('div')
  f.className = 'float'
  f.textContent = text
  f.style.color = color
  f.style.left = `${r.left + r.width / 2 - s.left}px`
  f.style.top = `${r.top + r.height / 3 - s.top}px`
  scene.append(f)
  f.addEventListener('animationend', () => f.remove())
}

const LEVEL_COLOR: [string, string] = ['#c8a040', '#3c2c0c']

/** Skills you could be offered at `tier`: starting at or below it, and not maxed if you have them. */
const learnable = (tier: Tier) => SKILL_KEYS.filter(k => TIER_ORDER.indexOf(SKILLS[k].tier) <= TIER_ORDER.indexOf(tier) && canLearn(k))
const enchantable = () => ENCHANT_KEYS.filter(e => mine().some(c => canEnchantCard(c, e)))

/** The level-up reward: pick a kind of reward, then for items, skills, upgrades and enchantments, pick which one. */
async function levelUp() {
  mode = 'choice'
  setTop(`Level ${level}`, LEVEL_COLOR)
  const upgradable = [...mine().filter(c => nextTier(c.tier)), ...mySkills.filter(s => nextTier(s.def.tier))]
  const rewards = levelRewards(level).filter(r =>
    r.kind === 'upgrade' ? upgradable.length : r.kind === 'enchant' ? enchantable().length : r.kind === 'skill' ? learnable(r.tier).length : true)
  if (!rewards.length) rewards.push({ kind: 'gold', amount: 10 })
  const title = (r: Reward) =>
    r.kind === 'item' ? `${tierName(r.tier)} item`
    : r.kind === 'skill' ? `${tierName(r.tier)} skill`
    : r.kind === 'upgrade' ? 'Upgrade'
    : r.kind === 'enchant' ? 'Enchant an item'
    : r.kind === 'gold' ? `${r.amount} gold` : `+${r.amount} income`
  const text = (r: Reward) =>
    r.kind === 'item' ? ['Choose one of three items']
    : r.kind === 'skill' ? ['Choose one of three skills', 'One you have goes up a tier']
    : r.kind === 'upgrade' ? ['Choose one of your items or skills to go up a tier']
    : r.kind === 'enchant' ? ['Choose an enchantment, then the item']
    : r.kind === 'gold' ? [`Gain ${r.amount} gold`] : [`Gain ${r.amount} income every day`]
  const r = rewards[await pick(rewards.map(r => ({ info: { title: title(r), tags: ['Reward'], text: text(r) }, badge: 'Reward', color: LEVEL_COLOR })))]

  if (r.kind === 'gold') gold += r.amount
  if (r.kind === 'income') income += r.amount
  if (r.kind === 'gold' || r.kind === 'income') {
    renderGold()
    flash(myGold, '#f0c24a')
  }
  if (r.kind === 'upgrade') {
    const some = [...upgradable].sort(() => Math.random() - 0.5).slice(0, 4)
    const option = (x: Card | Skill): Option => {
      if ('item' in x) {
        const next = itemAt(x.key, nextTier(x.tier)!, x.enchant, x.run)
        return { info: itemInfo(next), item: next }
      }
      const next = skillAt(x.key, nextTier(x.def.tier)!)
      return { info: skillInfo(next), skill: next }
    }
    const x = some[await pick(some.map(option))]
    if ('item' in x) upgrade(x)
    else upgradeSkill(x)
  }
  if (r.kind === 'item') {
    // Items that can come at this tier (no item below its starting tier).
    const keys = ITEM_KEYS.filter(k => TIER_ORDER.indexOf(ITEMS[k].tier) >= 0 && TIER_ORDER.indexOf(ITEMS[k].tier) <= TIER_ORDER.indexOf(r.tier))
    const three = [...keys].sort(() => Math.random() - 0.5).slice(0, 3)
    for (;;) {
      const k = three[await pick(three.map(k => ({ info: itemInfo(itemAt(k, r.tier)), item: itemAt(k, r.tier) })))]
      if (give(k, r.tier)) break
      toast('No room: sell something first')
    }
  }
  if (r.kind === 'skill') {
    const three = learnable(r.tier).sort(() => Math.random() - 0.5).slice(0, 3)
    learn(three[await pick(three.map(k => skillOption(k, r.tier)))], r.tier)
  }
  if (r.kind === 'enchant') {
    const three = rollEnchants(3, Math.random, e => enchantable().includes(e))
    await enchantPick(three[await pick(three.map(enchantOption))])
  }
}

/** End of day. Wins count toward the run; losses and draws cost Prestige. True when the run is over. */
async function rivalHour() {
  const r = rival(day, Math.random)
  const won = (await fight({ ...r, color: ['#a05a5a', '#3c1e1e'] })) === 0
  if (won) wins++
  else {
    const had = prestige > 0
    prestige -= prestigeLoss(day)
    toast(`-${prestigeLoss(day)} prestige`)
    if (had && prestige <= 0 && !lastChance) {
      await lastChancePick()
      return false
    }
  }
  renderClock()
  if (wins < WINS_TO_WIN && (won || prestige > 0)) return false // only a loss with no Prestige left ends it
  const el = box(`banner ${wins >= WINS_TO_WIN ? 'win' : 'loss'}`, 0, 0, 0, 0,
    `<h2>${wins >= WINS_TO_WIN ? 'Run complete!' : 'Out of prestige'}</h2><p>${wins} wins by day ${day}</p><button>New run</button>`)
  el.style.cssText = '' // let the banner size itself
  // ponytail: a reload is a full reset until runs have state worth keeping.
  el.querySelector('button')!.addEventListener('click', () => location.reload())
  return true
}

/** Prestige just ran out: one last chance, a pick of three. The next loss ends the run. */
async function lastChancePick() {
  lastChance = true
  prestige = 0
  renderClock()
  mode = 'choice'
  const color: [string, string] = ['#b03a3a', '#2e0c0c']
  setTop('Last chance', color)
  const options = lastChanceOptions(Math.random, e => enchantable().includes(e))
  const option = (o: LastChance): Option =>
    o.kind === 'diamond' ? { info: itemInfo(itemAt(o.key, 'diamond')), item: itemAt(o.key, 'diamond') }
    : o.kind === 'enchant' ? { ...enchantOption(o.enchant), badge: 'Last chance' }
    : { info: { title: `${o.gold} gold and ${o.xp} XP`, tags: ['Last chance'], text: [`Gain ${o.gold} gold`, `Gain ${o.xp} XP`] }, badge: 'Last chance', color }
  for (;;) {
    const o = options[await pick(options.map(option))]
    if (o.kind === 'diamond' && !give(o.key, 'diamond')) {
      toast('No room: sell something first')
      continue
    }
    if (o.kind === 'enchant') await enchantPick(o.enchant)
    if (o.kind === 'gold') {
      gold += o.gold
      renderGold()
      flash(myGold, '#f0c24a')
      await gainXp(o.xp)
    }
    return
  }
}

async function runLoop() {
  for (;;) {
    for (hour = 0; hour < HOURS; hour++) {
      renderClock()
      const kind = hourKind(hour)
      if (kind === 'choice') await choiceHour()
      else if (kind === 'monster') await monsterHour()
      else if (await rivalHour()) return
      await gainXp(XP_PER_HOUR)
    }
    day++
    gold += income
    renderGold()
    flash(myGold, '#f0c24a')
    toast(`Day ${day}: +${income} gold`)
    react({ on: 'dayStart' })
  }
}

// --- Dragging ---
function rest(c: Card): Pose {
  return { x: X0 + ROW_PAD + c.item.pos + c.item.size / 2, y: c.lane.y + ROW_H / 2 + (c.nudged ? c.lane.nudge : 0), s: 1 }
}

function tweenTo(c: Card, to: Pose, ms: number, ease: (t: number) => number, done?: () => void) {
  c.tween = { from: { ...c.pose }, to, t0: performance.now(), ms, ease, done }
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
  const droppable = stashOpen ? [stash, board] : [board]
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
    const clicked = press?.card === c && !drag
    press = null
    if (drag?.card === c) drop()
    else if (clicked && c.lane.shop && !fighting) quickBuy(c)
  }
  el.addEventListener('pointerup', up)
  el.addEventListener('pointercancel', up)
}

function beginDrag(c: Card, e: PointerEvent) {
  c.hovered = false
  c.tilt.tx = c.tilt.ty = 0
  hideTooltip()
  const p = toScene(e)
  drag = { card: c, ox: c.pose.x - p.x, oy: c.pose.y - p.y, sell: c.lane.mine && mode !== 'opponent' }
  tweenTo(c, { ...c.pose, s: DRAG_SCALE }, DRAG_SCALE_MS, linear)
  c.el.classList.add('lifted', 'dragging')
  sellZone.innerHTML = `<span>Sell for <b>${sellPrice(c.def)}g</b></span>`
  refreshTop()
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
  overSell = sellZone.classList.contains('sellable') && inside(e, sellZone)
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
    react({ on: 'sell', card: c.item.id }) // before it goes: sell triggers can look at it
    removeCard(c)
  } else if (overToy) {
    if (from !== stash) stashIt(c)
  } else {
    const t = target(c)
    if (from.shop) {
      if (t.lane !== from) buy(c, t.lane, t.sockets[0])
    } else if (t.lane === from) {
      apply(from, exchange(from.row, from.row, c.item, t.sockets[0])?.to ?? place(from.row, c.item, t.sockets[0], c.item.pos))
    } else {
      transfer(c, t.lane, t.sockets[0])
    }
  }
  const intoChest = overToy && c.lane === stash && !stashOpen
  overToy = overSell = false

  for (const o of cards) {
    const b = before.get(o)!
    const moved = o.item.pos !== b.pos || o.lane !== b.lane
    const wasNudged = o.nudged
    o.nudged = false
    if (o === c && intoChest) flyIntoChest(o)
    else if (o === c) tweenTo(o, rest(o), MOVE_MS, inOutQuint)
    else if (moved) tweenTo(o, rest(o), o.lane !== b.lane ? MOVE_MS : PUSH_MS, outCubic)
    else if (wasNudged) tweenTo(o, rest(o), NUDGE_BACK_MS, outQuad)
  }
  refreshTop()
}

/**
 * Dropped on the chest: into the stash wherever it fits, compacting the stash if the free space is split up
 * (see bestFit), or back where it came from if it doesn't fit at all. Merchant items are bought on the way.
 */
function stashIt(c: Card) {
  if (c.lane.shop) {
    if (gold < buyPrice(c.def)) return noGold()
    if (buyUpgrade(c)) return
  }
  const fit = bestFit(stash.row, c.item)
  if (!fit) return toast('No room in your stash')
  const bought = c.lane.shop
  if (bought) {
    gold -= buyPrice(c.def)
    renderGold()
  }
  moveLane(c, stash)
  apply(stash, fit)
  setOwner(c)
  if (bought) react({ on: 'buy', card: c.item.id })
}

const CHEST = { x: X0 + PANEL_W / 2, y: PLAYER_STRIP + STRIP_H / 2 }
/** A card that just went into the closed stash shrinks into the chest, then waits at its stash spot, hidden. */
function flyIntoChest(c: Card) {
  c.flying = true
  flash(toy, '#f0c24a')
  tweenTo(c, { ...CHEST, s: 0.25 }, MOVE_MS, inOutQuint, () => {
    c.flying = false
    c.pose = rest(c)
    refreshTop()
  })
}

/** Move a row's cards to `positions` (ids it doesn't know are ignored), sliding the ones that moved. */
function shift(l: Lane, positions: Map<string, number>) {
  for (const o of cards) {
    const to = positions.get(o.item.id)
    if (o.lane !== l || to === undefined || to === o.item.pos) continue
    o.item.pos = to
    tweenTo(o, rest(o), PUSH_MS, outCubic)
  }
}

/**
 * Your card to another of your rows. Squarely over whole cards: they trade places with it. Otherwise push the
 * others aside, or if it can't fit, swap what it covers back to where it came from.
 */
function transfer(c: Card, dest: Lane, at: number) {
  const from = c.lane
  const exchanged = exchange(dest.row, from.row, c.item, at)
  const pushed = exchanged ? null : place(dest.row, c.item, at)
  const swapped = exchanged ?? (pushed ? null : swap(dest.row, from.row, c.item, at))
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

/**
 * Merchant card onto your board or stash. On the board, cards it covers completely (or covers at all, when
 * there's no room to push) go to the stash.
 */
function buy(c: Card, dest: Lane, at: number) {
  const price = buyPrice(c.def)
  if (gold < price) return noGold()
  if (buyUpgrade(c)) return
  const toStash = () => (dest === board ? swap(dest.row, stash.row, { ...c.item, pos: 0 }, at) : null)
  const first = under(dest.row, c.item, at).full ? toStash() : null
  const pushed = first ? null : place(dest.row, c.item, at)
  const swapped = first ?? (pushed ? null : toStash())
  if (!pushed && !swapped) return toast('No room there')
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
  react({ on: 'buy', card: c.item.id })
}

/** Buying something you already own upgrades your copy instead (live-game rule). */
function buyUpgrade(offer: Card) {
  const owned = upgradeTarget(offer.key)
  if (!owned) return false
  gold -= buyPrice(offer.def)
  renderGold()
  removeCard(offer)
  upgrade(owned, offer.enchant ?? owned.enchant) // an enchanted copy passes its enchantment on
  react({ on: 'buy', card: owned.item.id })
  return true
}

function noGold() {
  flash(myGold, '#e04040')
  toast('Not enough gold')
}

/** Click an offer: buy it into the first free spot on the board, else the stash (compacted to fit). */
function quickBuy(c: Card) {
  if (gold < buyPrice(c.def)) return noGold()
  if (buyUpgrade(c)) return
  const pos = firstFree(board.row, c.item.size)
  const fit = pos === null ? bestFit(stash.row, c.item) : null
  if (pos === null && !fit) return toast('No room on your board or in your stash')
  gold -= buyPrice(c.def)
  renderGold()
  if (fit) shift(stash, fit)
  moveLane(c, fit ? stash : board)
  c.item.pos = fit ? fit.get(c.item.id)! : pos!
  setOwner(c)
  c.hovered = false
  c.tilt.tx = c.tilt.ty = 0
  hideTooltip()
  if (c.lane === stash && !stashOpen) flyIntoChest(c)
  else tweenTo(c, rest(c), MOVE_MS, inOutQuint)
  refreshTop()
  react({ on: 'buy', card: c.item.id })
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
renderLevel()
renderClock()
startRun().then(runLoop)

// --- Starting a run ---

/** A new run (with its start pick), or a test run set up from the URL flags. */
async function startRun() {
  if (testRun) return applyFlags()
  starterKit()
  await startPick()
}

/** The start-of-run pick: some economy, an enchanted small item, or a skill. */
async function startPick() {
  mode = 'choice'
  setTop('New run')
  const packages = startPackages(Math.random)
  const option = (p: StartPackage): Option =>
    p.kind === 'economy' ? { info: { title: 'Nest egg', tags: ['Start'], text: [`Gain ${p.gold} gold`, `Gain ${p.income} income every day`] }, badge: 'Economy', color: ['#b0904a', '#3c2e14'] }
    : p.kind === 'item' ? { info: itemInfo(itemAt(p.key, undefined, p.enchant)), item: itemAt(p.key, undefined, p.enchant) }
    : skillOption(p.key, SKILLS[p.key].tier)
  const p = packages[await pick(packages.map(option))]
  if (p.kind === 'economy') {
    gold += p.gold
    income += p.income
    renderGold()
    flash(myGold, '#f0c24a')
  }
  if (p.kind === 'item') give(p.key, undefined, p.enchant)
  if (p.kind === 'skill') learn(p.key, SKILLS[p.key].tier)
}

/** A test run from the URL flags (see the top of the file). */
function applyFlags() {
  if (!flags.has('items')) starterKit()
  for (const [key, tier, enchant] of flagList('items')) {
    try {
      if (!(key in ITEMS)) throw new Error('no such item')
      give(key as ItemKey, (tier || undefined) as Tier | undefined, enchant as Enchant | undefined)
    } catch (err) {
      console.warn(`?items=${key}: ${err}`)
    }
  }
  for (const [key, tier] of flagList('skills')) {
    try {
      if (!(key in SKILLS)) throw new Error('no such skill')
      learn(key as SkillKey, (tier || SKILLS[key as SkillKey].tier) as Tier)
    } catch (err) {
      console.warn(`?skills=${key}: ${err}`)
    }
  }
  renderGold()
  refreshTop()
}

let last = performance.now()
function frame(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  const follow = 1 - Math.exp(-TILT_SPEED * dt)
  for (const c of cards) {
    if (c.tween) {
      const { from, to, t0, ms, ease, done } = c.tween
      const k = ease(Math.min(1, (now - t0) / ms))
      c.pose.s = from.s + (to.s - from.s) * k
      if (drag?.card !== c) {
        c.pose.x = from.x + (to.x - from.x) * k
        c.pose.y = from.y + (to.y - from.y) * k
      }
      if (now - t0 >= ms) {
        c.tween = null
        done?.()
      }
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
