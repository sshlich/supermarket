import type { Size } from '../board.ts'
import type { ItemDef } from '../items.ts'

// ---------------------------------------------------------------- ability format
// An item's abilities are trigger -> (condition) -> actions, same shape as the live game.
// Action amounts default to the item's own stats, so the gems on the card are the numbers used.

export type CardStat = 'cooldown' | 'damage' | 'shield' | 'heal' | 'burn' | 'poison' | 'regen' | 'crit' | 'multicast' | 'ammo' | 'lifesteal'
export type PlayerEffect = 'damage' | 'heal' | 'shield' | 'burn' | 'poison' | 'regen'
export type CardEffect = 'haste' | 'slow' | 'freeze' | 'charge'

export interface Filter { tag?: string; size?: Size; has?: CardStat; not?: boolean }
export interface Targets {
  pick: 'self' | 'source' | 'neighbors' | 'left' | 'right' | 'leftmost' | 'rightmost' | 'mine' | 'enemy' | 'all'
  where?: Filter
  excludeSelf?: boolean
  random?: number // pick this many at random from the matches
}
export type Value = number | { stat: CardStat; of: Targets; times?: number } | { count: Targets; times?: number }
export type Action =
  | { do: PlayerEffect; amount?: Value; to?: 'me' | 'enemy' }
  | { do: CardEffect; seconds: Value; targets: Targets }
  | { do: 'reload'; targets: Targets }
  | { do: 'modify'; stat: CardStat; add: Value; targets: Targets } // lasts for the rest of the fight
export type Trigger =
  | { on: 'use' | 'fightStart' }
  | { on: 'itemUsed' | 'crit'; who?: Targets } // who defaults to any of my items
  | { on: 'performed'; effect: PlayerEffect | CardEffect; who?: Targets }
export interface Ability { when: Trigger; if?: { count: Targets; atLeast: number }; do: Action[] }
export interface Aura { stat: CardStat; add: Value; targets: Targets } // recomputed every tick

// ---------------------------------------------------------------- rules
// Legacy client engine + docs/rules-decisions (archive branch) R03-R07, R19.

export const TICK = 50 // ms per combat frame
const STORM_AT = 30_000
const MAX_T = 90_000 // draw
const MAX_DEPTH = 32 // trigger chain guard

export type EventKind = PlayerEffect | CardEffect | 'use' | 'reload' | 'modify' | 'end'
export interface FightEvent {
  t: number
  kind: EventKind
  side?: 0 | 1 // player affected (or the owner of the affected item)
  item?: string // item used / affected
  from?: string // source item id, or 'burn' | 'poison' | 'regen' | 'storm'
  amount?: number
  blocked?: number // damage absorbed by Shield
  crit?: boolean
  stat?: CardStat
  winner?: -1 | 0 | 1 // on 'end'; -1 = draw
}

export interface SideSetup { name: string; hp: number; items: { id: string; def: ItemDef }[] } // items in board order

export interface Unit {
  id: string
  def: ItemDef
  owner: Side
  base: Record<CardStat, number> // item stats + in-fight modifications
  attrs: Record<CardStat, number> // base + auras
  progress: number // ms of cooldown charged
  haste: number // ms remaining
  slow: number
  freeze: number
  ammo: number
  crit: boolean // current use crit
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
  foe: Side
}

function statsOf(def: ItemDef): Record<CardStat, number> {
  const s = def.stats
  return {
    cooldown: (def.cooldown ?? 0) * 1000,
    damage: s.damage ?? 0, shield: s.shield ?? 0, heal: s.heal ?? 0, burn: s.burn ?? 0, poison: s.poison ?? 0,
    regen: 0, crit: def.crit ?? 0, multicast: def.multicast ?? 1, ammo: def.ammo ?? 0, lifesteal: 0,
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

  constructor(a: SideSetup, b: SideSetup, seed = 1) {
    this.random = rng(seed)
    const side = (s: SideSetup, index: 0 | 1): Side => {
      const p: Side = { index, name: s.name, hp: s.hp, maxHp: s.hp, shield: 0, burn: 0, poison: 0, regen: 0, items: [], foe: null! }
      p.items = s.items.map(({ id, def }) => {
        const base = statsOf(def)
        return { id, def, owner: p, base, attrs: { ...base }, progress: 0, haste: 0, slow: 0, freeze: 0, ammo: base.ammo, crit: false }
      })
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

  private units() {
    return [...this.sides[0].items, ...this.sides[1].items]
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
    if (cd <= 0 || this.winner !== null) return
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
      for (const ab of u.def.abilities) {
        const w = ab.when
        if (w.on !== on || (w.on === 'performed' && w.effect !== effect)) continue
        if (!this.resolve(('who' in w && w.who) || { pick: 'mine' }, u, src).includes(src)) continue
        this.ability(u, ab, src)
      }
    }
    this.depth--
  }

  private ability(u: Unit, ab: Ability, src: Unit) {
    if (this.winner !== null) return
    if (ab.if && this.resolve(ab.if.count, u, src).length < ab.if.atLeast) return
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
        for (const t of this.resolve(a.targets, u, src)) {
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
        const v = this.value(a.add, u, src)
        for (const t of this.resolve(a.targets, u, src)) {
          t.base[a.stat] += v
          t.attrs[a.stat] += v
          this.log({ kind: 'modify', side: t.owner.index, item: t.id, stat: a.stat, amount: v, from: u.id })
        }
      }
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

  // Two passes so an aura that reads another aura's result settles.
  private auras() {
    const all = this.units()
    for (const u of all) u.attrs = { ...u.base }
    for (let pass = 0; pass < 2; pass++) {
      const next = new Map(all.map(u => [u, { ...u.base }]))
      for (const u of all) {
        for (const au of u.def.auras ?? []) {
          const v = this.value(au.add, u, u)
          for (const t of this.resolve(au.targets, u, u)) next.get(t)![au.stat] += v
        }
      }
      for (const u of all) u.attrs = next.get(u)!
    }
  }

  private value(v: Value, self: Unit, src: Unit): number {
    if (typeof v === 'number') return v
    if ('count' in v) return this.resolve(v.count, self, src).length * (v.times ?? 1)
    const [first] = this.resolve(v.of, self, src)
    return (first ? first.attrs[v.stat] : 0) * (v.times ?? 1)
  }

  private resolve(tg: Targets, self: Unit, src: Unit): Unit[] {
    const mine = self.owner.items
    const i = mine.indexOf(self)
    let out: Unit[]
    switch (tg.pick) {
      case 'self': out = [self]; break
      case 'source': out = [src]; break
      case 'mine': out = [...mine]; break
      case 'enemy': out = [...self.owner.foe.items]; break
      case 'all': out = this.units(); break
      case 'neighbors': out = [mine[i - 1], mine[i + 1]].filter(Boolean); break // R01: adjacent items, gaps don't matter
      case 'left': out = [mine[i - 1]].filter(Boolean); break
      case 'right': out = [mine[i + 1]].filter(Boolean); break
      case 'leftmost': out = mine.slice(0, 1); break
      case 'rightmost': out = mine.slice(-1); break
    }
    if (tg.excludeSelf) out = out.filter(u => u !== self)
    const f = tg.where
    if (f) out = out.filter(u => (((!f.tag || u.def.tags.includes(f.tag)) && (!f.size || u.def.size === f.size) && (!f.has || u.attrs[f.has] > 0)) !== !!f.not))
    if (tg.random !== undefined) {
      for (let k = out.length - 1; k > 0; k--) {
        const j = Math.floor(this.random() * (k + 1))
        ;[out[k], out[j]] = [out[j], out[k]]
      }
      out = out.slice(0, tg.random)
    }
    return out
  }
}
