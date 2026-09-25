import type { CardStat, Filter, Targets, Value } from './combat.ts'

/** What target selection needs to know, in or out of a fight. */
export interface Pool<T> {
  mine: T[] // the chooser's side, board order (a skill, or anything off the board, has no neighbors)
  foe: T[]
  tags(t: T): string[]
  size(t: T): number | undefined
  has(t: T, stat: CardStat): boolean // it has this stat (Burn items, items with a cooldown...)
  destroyed(t: T): boolean
  random(): number
  value(v: Value): number // for random counts
  eligible?(t: T): boolean // e.g. not immune to the effect being applied
}

/**
 * The cards `tg` picks, for `self` reacting to `src`. Destroyed cards are left out unless the targets ask for
 * them (Repair). Random picks come last, from what's left.
 */
export function select<T>(tg: Targets, self: T, src: T, p: Pool<T>): T[] {
  const mine = p.mine
  const i = mine.indexOf(self)
  const beside = (j: number) => (i < 0 ? [] : [mine[j]].filter(Boolean))
  let out: T[]
  switch (tg.pick) {
    case 'self': out = [self]; break
    case 'source': out = [src]; break
    case 'mine': out = [...mine]; break
    case 'enemy': out = [...p.foe]; break
    case 'all': out = [...mine, ...p.foe]; break
    case 'neighbors': out = [...beside(i - 1), ...beside(i + 1)]; break // R01: adjacent items, gaps don't matter
    case 'left': out = beside(i - 1); break
    case 'right': out = beside(i + 1); break
    case 'leftmost': out = mine.slice(0, 1); break
    case 'rightmost': out = mine.slice(-1); break
  }
  if (tg.excludeSelf) out = out.filter(t => t !== self)
  out = out.filter(t => p.destroyed(t) === !!tg.destroyed && (!p.eligible || p.eligible(t)))
  if (tg.where) out = out.filter(t => matches(tg.where!, t, p))
  if (tg.random !== undefined) {
    for (let k = out.length - 1; k > 0; k--) {
      const j = Math.floor(p.random() * (k + 1))
      ;[out[k], out[j]] = [out[j], out[k]]
    }
    out = out.slice(0, p.value(tg.random))
  }
  return out
}

/** Whether `t` passes filter `f` (every field given must hold; `not` flips the whole thing). */
export function matches<T>(f: Filter, t: T, p: Pick<Pool<T>, 'tags' | 'size' | 'has'>): boolean {
  return ((!f.tag || p.tags(t).includes(f.tag)) && (!f.size || p.size(t) === f.size) && (!f.has || p.has(t, f.has))) !== !!f.not
}
