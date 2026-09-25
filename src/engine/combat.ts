import type { Size } from '../board.ts'
import { select } from './targets.ts'

// ---------------------------------------------------------------- ability format
// An item's (or skill's) abilities are trigger -> (condition) -> actions, same shape as the live game.
// Action amounts default to the card's own stats, so the gems on the card are the numbers used.

export type CardStat = 'cooldown' | 'damage' | 'shield' | 'heal' | 'burn' | 'poison' | 'regen' | 'crit' | 'multicast' | 'ammo' | 'lifesteal'
export type PlayerEffect = 'damage' | 'heal' | 'shield' | 'burn' | 'poison' | 'regen'
export type CardEffect = 'haste' | 'slow' | 'freeze' | 'charge'
/** What an item can be immune to (Radiant). */
export type Immunity = 'freeze' | 'slow' | 'destroy'
/** Stats that can grow permanently: kept on the item for the rest of the run. Value raises its sell price. */
export type GrowStat = PlayerEffect | 'crit' | 'lifesteal' | 'value'

export interface Filter { tag?: string; size?: Size; has?: CardStat; not?: boolean }
export interface Targets {
  pick: 'self' | 'source' | 'neighbors' | 'left' | 'right' | 'leftmost' | 'rightmost' | 'mine' | 'enemy' | 'all'
  where?: Filter
  excludeSelf?: boolean
  random?: Value // pick this many at random from the matches
  destroyed?: boolean // pick destroyed items instead of working ones (Repair)
}
/** A number, one of the card's named vals (tier-resolved), a stat of another card, or a count of cards. */
export type Value = number | { val: string; times?: number } | { stat: CardStat; of: Targets; times?: number } | { count: Targets; times?: number }
export type Action =
  | { do: PlayerEffect; amount?: Value; to?: 'me' | 'enemy' }
  | { do: CardEffect; seconds: Value; targets: Targets }
  | { do: 'reload'; targets: Targets }
  | { do: 'modify'; stat: CardStat; add?: Value; mul?: number; targets: Targets } // for the rest of the fight
  | { do: 'destroy' | 'repair'; targets: Targets } // a destroyed item stops working for the rest of the fight
  | { do: 'cleanse'; what: ('burn' | 'poison' | 'slow' | 'freeze')[]; targets?: Targets } // Burn/Poison off you, Slow/Freeze off your items
  | { do: 'transform'; into?: string; targets: Targets; permanent?: boolean } // into a given item, or a random one of the same size
  // Run effects: they outlast the fight. In a fight they're logged and applied to the run afterwards
  // (Grow also counts right away); outside fights run-effects.ts applies them directly.
  | { do: 'grow'; stat: GrowStat; add: Value; targets: Targets }
  | { do: 'gold'; amount: Value }
  | { do: 'progress'; by?: Value } // this item's quest
  | { do: 'upgrade'; targets: Targets }
export type CombatTrigger =
  | { on: 'use' | 'fightStart' }
  | { on: 'itemUsed' | 'crit'; who?: Targets } // who defaults to any of my items
  | { on: 'performed'; effect: PlayerEffect | CardEffect; who?: Targets }
/** Between fights (run-effects.ts). Buy/sell: an item of yours matching `what` (any when omitted), or this one with `self`. */
export type RunTrigger = { on: 'buy' | 'sell'; what?: Filter; self?: boolean } | { on: 'win' | 'lose' | 'dayStart' | 'levelUp' }
export type Trigger = CombatTrigger | RunTrigger
/** `stash`: this also works while the item is in your stash (run triggers; the stash doesn't fight). */
export interface Ability { when: Trigger; if?: { count: Targets; atLeast: Value }; do: Action[]; stash?: boolean }
/** Recomputed every tick: additive auras first, then multipliers. */
export interface Aura { stat: CardStat; add?: Value; mul?: number; targets: Targets }

/** What the engine reads from an item or skill, already resolved at its tier. Skills have no size or cooldown. */
export interface UnitDef {
  key?: string
  tags: string[]
  size?: Size
  cooldown?: number // seconds
  stats: Partial<Record<PlayerEffect, number>>
  vals?: Record<string, number>
  multicast?: number
  ammo?: number
  crit?: number
  lifesteal?: number
  immune?: Immunity[]
  abilities: Ability[]
  auras?: Aura[]
}

// ---------------------------------------------------------------- rules
// Legacy client engine + docs/rules-decisions (archive branch) R03-R07, R19.

export const TICK = 50 // ms per combat frame
const STORM_AT = 30_000
const MAX_T = 90_000 // draw
const MAX_DEPTH = 32 // trigger chain guard

export type EventKind =
  | PlayerEffect | CardEffect | 'use' | 'skill' | 'reload' | 'modify' | 'destroy' | 'repair' | 'cleanse' | 'transform' | 'end'
  | 'grow' | 'gold' | 'progress' | 'upgrade' // run effects, applied after the fight
export interface FightEvent {
  t: number
  kind: EventKind
  side?: 0 | 1 // player affected (or the owner of the affected item)
  item?: string // item used / affected, or the skill that fired
  from?: string // source item id, or 'burn' | 'poison' | 'regen' | 'storm'
  amount?: number
  blocked?: number // damage absorbed by Shield
  crit?: boolean
  stat?: CardStat | GrowStat
  into?: string // on 'transform': the new item's key
  permanent?: boolean // on 'transform': kept after the fight
  winner?: -1 | 0 | 1 // on 'end'; -1 = draw
}

/** The host's content, for effects that need it: what an item transforms into (null: nothing fits). */
export interface FightOptions { transform?(def: UnitDef, into: string | undefined, random: () => number): UnitDef | null }

/** Items in board order. Skills listen for triggers and hold auras but are never targeted or used. */
export interface SideSetup { name: string; hp: number; items: { id: string; def: UnitDef }[]; skills?: { id: string; def: UnitDef }[] }

export interface Unit {
  id: string
  def: UnitDef
  owner: Side
  skill: boolean
  base: Record<CardStat, number> // item stats + in-fight modifications
  attrs: Record<CardStat, number> // base + auras
  progress: number // ms of cooldown charged
  haste: number // ms remaining
  slow: number
  freeze: number
  ammo: number
  crit: boolean // current use crit
  destroyed: boolean
}

export interface Side {
  index: 0 | 1
  name: string
  hp: number
  maxHp: number
  shield: number
  burn: number
  poison: number
  regen: number
  items: Unit[]
  skills: Unit[]
  foe: Side
}

function statsOf(def: UnitDef): Record<CardStat, number> {
  const s = def.stats
  return {
    cooldown: (def.cooldown ?? 0) * 1000,
    damage: s.damage ?? 0, shield: s.shield ?? 0, heal: s.heal ?? 0, burn: s.burn ?? 0, poison: s.poison ?? 0, regen: s.regen ?? 0,
    crit: def.crit ?? 0, multicast: def.multicast ?? 1, ammo: def.ammo ?? 0, lifesteal: def.lifesteal ?? 0,
  }
}


/** Seeded PRNG (mulberry32), so a fight replays identically from its seed. */
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let x = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

export class Fight {
  t = 0
  sides: [Side, Side]
  events: FightEvent[] = []
  winner: -1 | 0 | 1 | null = null // null while running
  private random: () => number
  private started = false
  private stormTicks = 0
  private depth = 0
  private opts: FightOptions

  constructor(a: SideSetup, b: SideSetup, seed = 1, opts: FightOptions = {}) {
    this.random = rng(seed)
    this.opts = opts
    const side = (s: SideSetup, index: 0 | 1): Side => {
      const p: Side = { index, name: s.name, hp: s.hp, maxHp: s.hp, shield: 0, burn: 0, poison: 0, regen: 0, items: [], skills: [], foe: null! }
      const unit = ({ id, def }: { id: string; def: UnitDef }, skill: boolean): Unit => {
        const base = statsOf(def)
        return { id, def, owner: p, skill, base, attrs: { ...base }, progress: 0, haste: 0, slow: 0, freeze: 0, ammo: base.ammo, crit: false, destroyed: false }
      }
      p.items = s.items.map(it => unit(it, false))
      p.skills = (s.skills ?? []).map(sk => unit(sk, true))
      return p
    }
    this.sides = [side(a, 0), side(b, 1)]
    this.sides[0].foe = this.sides[1]
    this.sides[1].foe = this.sides[0]
  }

  /** Play to the end. */
  run() {
    while (this.winner === null) this.step()
    return this
  }

  /** Advance one 50 ms frame; returns the events it produced. */
  step(): FightEvent[] {
    if (this.winner !== null) return []
    const from = this.events.length
    if (!this.started) {
      this.started = true
      this.auras()
      for (const u of this.units()) for (const ab of u.def.abilities) if (ab.when.on === 'fightStart') this.ability(u, ab, u)
    }
    this.t += TICK
    this.auras()
    this.statuses()
    for (const p of this.sides) for (const u of p.items) this.charge(u)
    if (!this.decided() && this.t >= MAX_T) this.end(-1)
    return this.events.slice(from)
  }

  /** Everything with abilities: both boards, then both sides' skills. */
  private units() {
    return [...this.sides[0].items, ...this.sides[1].items, ...this.sides[0].skills, ...this.sides[1].skills]
  }

  private log(e: Omit<FightEvent, 't'>) {
    this.events.push({ t: this.t, ...e })
  }

  private end(winner: -1 | 0 | 1) {
    this.winner = winner
    this.log({ kind: 'end', winner })
  }

  private decided() {
    if (this.winner !== null) return true
    const [a, b] = this.sides.map(p => p.hp <= 0)
    if (a || b) this.end(a && b ? -1 : a ? 1 : 0)
    return this.winner !== null
  }

  // R06: at whole seconds Regen, then Poison; every 500 ms Burn; then the storm. p0 before p1 in each stage.
  private statuses() {
    const [a, b] = this.sides
    if (this.t % 1000 === 0) {
      for (const p of [a, b]) if (p.regen > 0 && p.hp < p.maxHp) this.heal(p, p.regen, 'regen')
      for (const p of [a, b]) {
        if (p.poison <= 0) continue
        p.hp -= p.poison
        this.log({ kind: 'damage', side: p.index, amount: p.poison, blocked: 0, from: 'poison' })
      }
    }
    if (this.t % 500 === 0) {
      for (const p of [a, b]) {
        if (p.burn <= 0) continue
        const amount = p.shield > 0 ? Math.floor(p.burn / 2) : p.burn // Shield halves Burn
        if (amount > 0) this.damage(p, amount, 'burn')
        p.burn -= 1
      }
    }
    // R19: storm from 30 s, each second, min(1000, 4 + 5 * tick), bypasses Shield.
    if (this.t >= STORM_AT && this.t % 1000 === 0) {
      const amount = Math.min(1000, 4 + 5 * this.stormTicks++)
      for (const p of [a, b]) {
        p.hp -= amount
        this.log({ kind: 'damage', side: p.index, amount, blocked: 0, from: 'storm' })
      }
    }
    this.decided()
  }

  // Legacy engine: timers tick down, then progress += ceil(50 * haste 2x * slow 0.5x), capped at cooldown / 20.
  // Frozen items don't charge. An item out of Ammo stays fully charged until reloaded (R04).
  private charge(u: Unit) {
    const cd = u.attrs.cooldown
    if (cd <= 0 || u.destroyed || this.winner !== null) return
    const frozen = u.freeze > 0
    const rate = (u.haste > 0 ? 2 : 1) * (u.slow > 0 ? 0.5 : 1)
    u.haste = Math.max(0, u.haste - TICK)
    u.slow = Math.max(0, u.slow - TICK)
    u.freeze = Math.max(0, u.freeze - TICK)
    if (frozen) return
    u.progress = Math.min(cd, u.progress + Math.min(Math.ceil(TICK * rate), cd / 20))
    if (u.progress >= cd && !(u.attrs.ammo > 0 && u.ammo <= 0)) {
      u.progress = 0
      this.use(u)
    }
  }

  // One crit roll shared by every cast of a multicast (live client behavior).
  // ponytail: multicast casts resolve in the same frame; spread them out in playback if needed.
  private use(u: Unit) {
    if (u.attrs.ammo > 0) u.ammo -= 1
    u.crit = this.random() * 100 < u.attrs.crit
    for (let i = 0; i < Math.max(1, u.attrs.multicast) && !this.decided(); i++) {
      this.log({ kind: 'use', side: u.owner.index, item: u.id, crit: u.crit })
      for (const ab of u.def.abilities) if (ab.when.on === 'use') this.ability(u, ab, u)
      this.emit('itemUsed', u)
      if (u.crit) this.emit('crit', u)
    }
    u.crit = false
  }

  /** Something happened to `src`; run every listening ability whose `who` includes it. */
  private emit(on: 'itemUsed' | 'crit' | 'performed', src: Unit, effect?: PlayerEffect | CardEffect) {
    if (this.depth >= MAX_DEPTH) return
    this.depth++
    for (const u of this.units()) {
      if (u.destroyed) continue
      for (const ab of u.def.abilities) {
        const w = ab.when
        if (w.on !== on || (w.on === 'performed' && w.effect !== effect)) continue
        const who = 'who' in w ? w.who : undefined
        // No `who`: any of my items. For "when you Burn" and the like, my skills count as me too.
        if (who ? !this.resolve(who, u, src).includes(src) : on === 'performed' ? src.owner !== u.owner : !u.owner.items.includes(src)) continue
        this.ability(u, ab, src)
      }
    }
    this.depth--
  }

  private ability(u: Unit, ab: Ability, src: Unit) {
    if (this.winner !== null) return
    if (ab.if && this.resolve(ab.if.count, u, src).length < this.value(ab.if.atLeast, u, src)) return
    if (u.skill) this.log({ kind: 'skill', side: u.owner.index, item: u.id })
    for (const a of ab.do) this.act(u, a, src)
  }

  private act(u: Unit, a: Action, src: Unit) {
    const me = u.owner
    switch (a.do) {
      case 'damage':
      case 'heal':
      case 'shield':
      case 'burn':
      case 'poison':
      case 'regen': {
        let amount = a.amount === undefined ? u.attrs[a.do] : this.value(a.amount, u, src)
        if (u.crit) amount *= 2
        amount = Math.round(amount)
        if (amount <= 0) return
        const hostile = a.do === 'damage' || a.do === 'burn' || a.do === 'poison'
        const p = (a.to ?? (hostile ? 'enemy' : 'me')) === 'me' ? me : me.foe
        if (a.do === 'damage') this.damage(p, amount, u)
        else if (a.do === 'heal') this.heal(p, amount, u.id)
        else {
          p[a.do] += amount
          this.log({ kind: a.do, side: p.index, amount, from: u.id })
        }
        this.emit('performed', u, a.do)
        return
      }
      case 'haste':
      case 'slow':
      case 'freeze':
      case 'charge': {
        const ms = this.value(a.seconds, u, src) * 1000
        for (const t of this.resolve(a.targets, u, src, a.do)) {
          if (a.do === 'charge') t.progress = Math.min(t.attrs.cooldown, t.progress + ms)
          else t[a.do] += ms // R03: durations stack
          this.log({ kind: a.do, side: t.owner.index, item: t.id, amount: ms, from: u.id })
        }
        this.emit('performed', u, a.do)
        return
      }
      case 'reload':
        // ponytail: a reloaded item that was sitting fully charged fires on the next frame, not this one.
        for (const t of this.resolve(a.targets, u, src)) {
          t.ammo = t.attrs.ammo
          this.log({ kind: 'reload', side: t.owner.index, item: t.id, from: u.id })
        }
        return
      case 'modify': {
        const v = a.add === undefined ? 0 : this.value(a.add, u, src)
        for (const t of this.resolve(a.targets, u, src)) {
          const before = t.base[a.stat]
          t.base[a.stat] = (before + v) * (a.mul ?? 1)
          t.attrs[a.stat] += t.base[a.stat] - before
          this.log({ kind: 'modify', side: t.owner.index, item: t.id, stat: a.stat, amount: t.base[a.stat] - before, from: u.id })
        }
        return
      }
      case 'destroy':
      case 'repair':
        for (const t of this.resolve(a.targets, u, src, a.do)) {
          t.destroyed = a.do === 'destroy'
          this.log({ kind: a.do, side: t.owner.index, item: t.id, from: u.id })
        }
        return
      case 'cleanse': {
        for (const s of ['burn', 'poison'] as const) if (a.what.includes(s)) me[s] = 0
        for (const t of this.resolve(a.targets ?? { pick: 'mine' }, u, src)) for (const s of ['slow', 'freeze'] as const) if (a.what.includes(s)) t[s] = 0
        this.log({ kind: 'cleanse', side: me.index, from: u.id })
        return
      }
      case 'transform':
        for (const t of this.resolve(a.targets, u, src)) {
          const def = this.opts.transform?.(t.def, a.into, this.random)
          if (!def) continue
          t.def = def
          t.base = statsOf(def)
          t.attrs = { ...t.base }
          t.progress = 0
          t.ammo = t.base.ammo
          this.log({ kind: 'transform', side: t.owner.index, item: t.id, into: def.key, permanent: a.permanent, from: u.id })
        }
        return
      case 'grow': {
        const v = this.value(a.add, u, src)
        for (const t of this.resolve(a.targets, u, src)) {
          if (a.stat !== 'value') {
            t.base[a.stat] += v
            t.attrs[a.stat] += v
          }
          this.log({ kind: 'grow', side: t.owner.index, item: t.id, stat: a.stat, amount: v, from: u.id })
        }
        return
      }
      case 'gold':
        this.log({ kind: 'gold', side: me.index, amount: this.value(a.amount, u, src), from: u.id })
        return
      case 'progress':
        this.log({ kind: 'progress', side: me.index, item: u.id, amount: a.by === undefined ? 1 : this.value(a.by, u, src) })
        return
      case 'upgrade':
        for (const t of this.resolve(a.targets, u, src)) this.log({ kind: 'upgrade', side: t.owner.index, item: t.id, from: u.id })
    }
  }

  private damage(p: Side, amount: number, from: Unit | 'burn') {
    const blocked = Math.min(p.shield, amount)
    p.shield -= blocked
    p.hp -= amount - blocked
    this.log({ kind: 'damage', side: p.index, amount, blocked, from: typeof from === 'string' ? from : from.id })
    if (typeof from !== 'string' && from.attrs.lifesteal > 0) this.heal(from.owner, Math.round((amount * from.attrs.lifesteal) / 100), from.id, false)
  }

  // R07: ordinary healing (Regen included) cleanses 10% of Burn and Poison; Lifesteal doesn't.
  private heal(p: Side, amount: number, from: string, cleanse = true) {
    if (cleanse) {
      p.burn -= Math.floor(p.burn * 0.1)
      p.poison -= Math.floor(p.poison * 0.1)
    }
    p.hp = Math.min(p.maxHp, p.hp + amount)
    this.log({ kind: 'heal', side: p.index, amount, from })
  }

  // Additive auras in two passes, so one that reads another's result settles; then multipliers once.
  // A destroyed item's auras stop.
  private auras() {
    const all = this.units()
    const live = all.filter(u => !u.destroyed)
    for (const u of all) u.attrs = { ...u.base }
    for (let pass = 0; pass < 2; pass++) {
      const next = new Map(all.map(u => [u, { ...u.base }]))
      for (const u of live) {
        for (const au of u.def.auras ?? []) {
          if (au.add === undefined) continue
          const v = this.value(au.add, u, u)
          for (const t of this.resolve(au.targets, u, u)) next.get(t)![au.stat] += v
        }
      }
      for (const u of all) u.attrs = next.get(u)!
    }
    for (const u of live) for (const au of u.def.auras ?? []) if (au.mul !== undefined) for (const t of this.resolve(au.targets, u, u)) t.attrs[au.stat] *= au.mul
  }

  private value(v: Value, self: Unit, src: Unit): number {
    if (typeof v === 'number') return v
    if ('val' in v) return (self.def.vals?.[v.val] ?? 0) * (v.times ?? 1)
    if ('count' in v) return this.resolve(v.count, self, src).length * (v.times ?? 1)
    const [first] = this.resolve(v.of, self, src)
    return (first ? first.attrs[v.stat] : 0) * (v.times ?? 1)
  }

  /** Targets for `self`; with `effect`, items immune to it are skipped (so random picks aren't wasted on them). */
  private resolve(tg: Targets, self: Unit, src: Unit, effect?: string): Unit[] {
    return select(tg, self, src, {
      mine: self.owner.items, // a skill isn't in here: it has no neighbors
      foe: self.owner.foe.items,
      tags: u => u.def.tags,
      size: u => u.def.size,
      has: (u, stat) => u.attrs[stat] > 0,
      destroyed: u => u.destroyed,
      random: this.random,
      value: v => this.value(v, self, src),
      eligible: effect ? u => !u.def.immune?.includes(effect as Immunity) : undefined,
    })
  }
}
