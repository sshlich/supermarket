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
