import type { Ability, Action, FightEvent, GrowStat, RunTrigger, Value } from './engine/combat.ts'
import { matches, select, type Pool } from './engine/targets.ts'
import type { ItemDef } from './items.ts'
import type { SkillDef } from './skills.ts'
import { numbers } from './tiers.ts'

// Between fights, cards react to run events with the same ability format they fight with. Only run
// effects do anything here (Grow, Gold, Progress, Upgrade, Transform); fight effects are skipped.
// Nothing is applied: callers get a list of outcomes and apply them (main.ts), which keeps this testable.

/** One of your cards: on the board (in order), in the stash, or a skill. */
export interface RunCard { id: string; def: ItemDef | SkillDef; place: 'board' | 'stash' | 'skill' }

export type RunEvent = { on: 'buy' | 'sell'; card: string } | { on: Exclude<RunTrigger['on'], 'buy' | 'sell'> }

export type Outcome =
  | { kind: 'grow'; card: string; stat: GrowStat; amount: number }
  | { kind: 'gold'; amount: number }
  | { kind: 'progress'; card: string; amount: number }
  | { kind: 'upgrade'; card: string }
  | { kind: 'transform'; card: string; into?: string }

const numbersOf = (c: RunCard) => numbers(c.def)

/**
 * What happens when `event` does. Board items and skills react; stash items only through abilities marked
 * `stash`. Buy/sell triggers see the item bought or sold (still in `cards`), which is also the `source`.
 */
export function runTrigger(event: RunEvent, cards: RunCard[], random: () => number): Outcome[] {
  const board = cards.filter(c => c.place === 'board')
  const src = 'card' in event ? cards.find(c => c.id === event.card) : undefined
  const out: Outcome[] = []

  const pool = (self: RunCard): Pool<RunCard> => ({
    mine: board,
    foe: [],
    tags: c => c.def.tags,
    size: c => ('size' in c.def ? c.def.size : undefined),
    has: (c, stat) => (numbersOf(c)[stat] ?? 0) > 0,
    destroyed: () => false,
    random,
    value: v => value(v, self),
  })
  const pick = (self: RunCard, tg: Parameters<typeof select>[0]) => select(tg, self, src ?? self, pool(self))
  function value(v: Value, self: RunCard): number {
    if (typeof v === 'number') return v
    if ('val' in v) return (self.def.vals?.[v.val] ?? 0) * (v.times ?? 1)
    if ('count' in v) return pick(self, v.count).length * (v.times ?? 1)
    const [first] = pick(self, v.of)
    return (first ? (numbersOf(first)[v.stat] ?? 0) : 0) * (v.times ?? 1)
  }

  const fires = (ab: Ability, self: RunCard) => {
    const w = ab.when
    if (w.on !== event.on || (self.place === 'stash' && !ab.stash)) return false
    if (w.on === 'buy' || w.on === 'sell') {
      if (!src) return false
      if (w.self) return src === self
      if (w.what && !matches(w.what, src, pool(self))) return false
    }
    return !ab.if || pick(self, ab.if.count).length >= value(ab.if.atLeast, self)
  }

  const act = (a: Action, self: RunCard) => {
    switch (a.do) {
      case 'grow': {
        const amount = value(a.add, self)
        for (const t of pick(self, a.targets)) out.push({ kind: 'grow', card: t.id, stat: a.stat, amount })
        return
      }
      case 'gold':
        out.push({ kind: 'gold', amount: value(a.amount, self) })
        return
      case 'progress':
        out.push({ kind: 'progress', card: self.id, amount: a.by === undefined ? 1 : value(a.by, self) })
        return
      case 'upgrade':
        for (const t of pick(self, a.targets)) out.push({ kind: 'upgrade', card: t.id })
        return
      case 'transform':
        for (const t of pick(self, a.targets)) out.push({ kind: 'transform', card: t.id, into: a.into })
    }
  }

  for (const c of cards) for (const ab of c.def.abilities) if (fires(ab, c)) for (const a of ab.do) act(a, c)
  return out
}

/** The run effects a fight logged for side 0 (you), in order: what to apply to the run after it. */
export function fightOutcomes(events: FightEvent[]): Outcome[] {
  const out: Outcome[] = []
  for (const e of events) {
    if (e.side !== 0) continue
    if (e.kind === 'grow') out.push({ kind: 'grow', card: e.item!, stat: e.stat as GrowStat, amount: e.amount! })
    else if (e.kind === 'gold') out.push({ kind: 'gold', amount: e.amount! })
    else if (e.kind === 'progress') out.push({ kind: 'progress', card: e.item!, amount: e.amount! })
    else if (e.kind === 'upgrade') out.push({ kind: 'upgrade', card: e.item! })
    else if (e.kind === 'transform' && e.permanent) out.push({ kind: 'transform', card: e.item!, into: e.into })
  }
  return out
}
