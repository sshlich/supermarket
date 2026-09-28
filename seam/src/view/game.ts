// The game as the view holds it: one state, changed only through apply(), saved after every change.
// The Catalog (what's known) is saved apart, and outlives the game (DESIGN 7.5, 14.4).

import { apply, type Action } from '../model/apply.ts'
import type { Ev } from '../model/sim.ts'
import { newGame, type State } from '../model/state.ts'

const SAVE = 'seam-save-v1'
const CATALOG = 'seam-catalog-v1'

/** ?omniscient: every fact shows its truth (debug). */
export const omni = new URLSearchParams(location.search).has('omniscient')

export function read<T>(key: string): T | null {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') } catch { return null }
}
export function write(key: string, v: unknown) {
  try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* private window or full storage: the game still runs */ }
}

const seed = () => Math.floor(Math.random() * 2 ** 31)
/** A save from an older build (missing what this one needs) starts a new game; the Catalog carries over. */
const fits = (x: Partial<State> | null): x is Omit<State, 'know'> => x?.version === 1 && !!x.levels && !!x.hist && Array.isArray(x.log) && !!x.C && !!x.runner && !!x.access && !!x.visits

export let s: State = (() => {
  const know = read<State['know']>(CATALOG) ?? {}
  const saved = read<Partial<State>>(SAVE)
  return fits(saved) ? { ...saved, know } : newGame(seed(), know)
})()

function save() {
  const { know, ...game } = s
  write(SAVE, game)
  write(CATALOG, know)
}

const watchers: (() => void)[] = []
export const onChange = (f: () => void) => watchers.push(f)
const changed = () => { save(); for (const f of watchers) f() }

export function act(a: Action): Ev[] {
  const ev = apply(s, a)
  changed()
  return ev
}

/** Years later, another pocket finds the old terminal: a new game that keeps the Catalog. */
export function restart() {
  s = newGame(seed(), s.know)
  changed()
}

// Dev builds only: the console can look at the game (window.seam.s()) and act on it.
if (import.meta.env.DEV) Object.assign(window, { seam: { s: () => s, act } })
