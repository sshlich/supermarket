// The only way the view changes the game (DESIGN 14.3): apply(state, action) mutates it and says what happened.

import { talk } from './knowledge.ts'
import { world, type Ev } from './sim.ts'
import type { State } from './state.ts'

export type Action = { type: 'endDay' }

export function apply(s: State, a: Action): Ev[] {
  switch (a.type) {
    case 'endDay': return endNight(s)
  }
}

/** The whole night (6.7): the world moves, then the Seam hears about it and MAINT writes it down. */
function endNight(s: State): Ev[] {
  const ev = world(s, s.blackout)
  talk(s, ev)
  s.day++
  s.step = 0
  return ev
}
