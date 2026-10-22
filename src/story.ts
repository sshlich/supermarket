// Scripted encounters (data/station/story.json): named people who come on a set day with set goods and words, some of them
// again and again until you serve them, some only once you have dealt with someone else. Pure rules, no page: the terminal
// puts them at the front of the day's line (`scripted`) and tells us when one of them has dealt (`finish`).

import { KINDS, type State } from './world.ts'
import { TAGS, type Customer, type Goods, type Role } from './customers.ts'
import STORY from '../data/station/story.json' with { type: 'json' }

interface Beat { id: string; day: number; who: string; name: string; role: Role; goods?: string[]; need?: string; budget?: number; rate: number; again?: boolean; after?: string; line: string; thanks?: string }
const BEATS = STORY.beats as Beat[]

/** 1: they have come at least once; 2: the deal is done. */
const status = (s: State, id: string) => s.story?.[id] ?? 0
/** The need your own things serve most (what a scripted buyer who comes for 'auto' wants): what is on the field and the counters. */
const stocked = (s: State) => {
  const n: Record<string, number> = {}
  for (const it of s.items) if (!it.in && it.at !== 'back' && it.at !== 'hand') { const k = KINDS[it.kind]?.need; if (k && k in TAGS) n[k] = (n[k] ?? 0) + 1 }
  return Object.entries(n).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'need_food'
}

/** Is this beat due today? On its day or after it, not done, and not yet come unless they keep coming; with the one it follows done. */
const due = (s: State, b: Beat, day: number) => day >= b.day && status(s, b.id) < (b.again ? 2 : 1) && (!b.after || status(s, b.after) === 2)

/** Today's scripted customers, in order. Each is marked as having come (so a one-off does not come twice). */
export function scripted(s: State, day: number, nextId: () => number): Customer[] {
  const out: Customer[] = []
  for (const b of BEATS) {
    if (!due(s, b, day)) continue
    s.story = { ...s.story, [b.id]: Math.max(1, status(s, b.id)) }
    const goods: Goods[] = (b.goods ?? []).map(kind => ({ kind }))
    out.push({ id: nextId(), name: b.name, who: b.who, role: b.role, wants: b.role === 'seller' ? [] : [b.need === 'auto' ? stocked(s) : b.need!], rate: b.rate, goods, brought: [], ask: 0,
      budget: b.role === 'buyer' ? (b.budget ?? null) : null, got: [], line: b.line, beat: b.id })
  }
  return out
}

/** A scripted customer's deal is done: mark it, and say what they say after it (if anything). */
export function finish(s: State, c: Customer): string | undefined {
  const b = BEATS.find(x => x.id === c.beat)
  if (!b) return undefined
  s.story = { ...s.story, [b.id]: 2 }
  return b.thanks
}
