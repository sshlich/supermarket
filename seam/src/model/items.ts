// The property language (DESIGN 10.1): rules act on properties, never on particular items.

import type { Box } from '../data/items.ts'
import { K, rectOf } from './containers.ts'
import { touches } from './grid.ts'
import type { Item, Prop, Props, State } from './state.ts'

export const PROPS: Prop[] = ['HEAT', 'COLD', 'CHARGE', 'MASS', 'LIGHT', 'SIGNAL', 'ROT', 'SEAL']

/** An item's properties: its kind's, then its own (a cracked shard), and rot on top of either. */
export function propsOf(it: Item): Props {
  const p: Props = { ...K[it.kind].props, ...it.props }
  if (it.rotten) p.ROT = Math.max(p.ROT ?? 0, 1)
  return p
}
export const prop = (it: Item, p: Prop) => propsOf(it)[p] ?? 0

/** Items that share an edge with `it` in its container. */
export const near = (s: State, box: Box, it: Item) => s.C[box].filter(o => o !== it && touches(rectOf(o), rectOf(it)))

/** A property summed over a container's items (a pile counts each of its pieces). */
export const total = (items: Item[], p: Prop) => items.reduce((a, it) => a + prop(it, p) * it.n, 0)

export const isFood = (it: Item) => (K[it.kind].food ?? 0) > 0 && !it.rotten

/** Everything on the belt is in hand (10.5): its properties add up. */
export function belt(s: State): Props {
  const out: Props = {}
  for (const it of s.C.belt) for (const [p, v] of Object.entries(propsOf(it)) as [Prop, number][]) out[p] = (out[p] ?? 0) + v * it.n
  return out
}

/** How rare a property is, for a relic's Class: lightness most of all. */
const rarity = (p: Prop, v: number) => p === 'MASS' ? (v < 0 ? 2 : 1) : p === 'CHARGE' || p === 'SIGNAL' ? 1 : 0
/** A relic's Class (10.4), from its total magnitude and its rarest property: D curio, C useful, B changes a life,
 * A changes a level. Reproduces every Class in Appendix D. */
export function relicClass(kind: string): 'A' | 'B' | 'C' | 'D' {
  const p = Object.entries(K[kind].props) as [Prop, number][]
  const score = p.reduce((a, [, v]) => a + Math.abs(v), 0) + Math.max(0, ...p.map(([k, v]) => rarity(k, v)))
  return score >= 6 ? 'A' : score >= 4 ? 'B' : score >= 2 ? 'C' : 'D'
}

/** Drift a step on the belt costs (10.5): 1 for each relic, 2 for Class B, 3 for Class A; sealed things none. */
export const driftPerStep = (s: State) => s.C.belt.reduce((a, it) => a + (!K[it.kind].relic || prop(it, 'SEAL') > 0 ? 0 : ({ A: 3, B: 2 } as Record<string, number>)[relicClass(it.kind)] ?? 1), 0)
