// Writes into each painted sprite (fill.ts) what its painter draws for the thing as it comes: a new one, full. That is what
// the gallery and the footprint check see; the game paints over it from each item.
//   node scripts/fills.ts

import { readFileSync, writeFileSync } from 'node:fs'
import { paintDefault } from '../src/fill.ts'
import { inSpace, KINDS, spawn, type State } from '../src/world.ts'

for (const kind of Object.keys(KINDS)) {
  const s: State = { items: [], next: 1, windows: [] }
  const it = spawn(s, kind)
  const svg = it && paintDefault(kind, it, slot => inSpace(s, { host: it.id, slot }))
  if (svg === undefined || !it) continue
  const file = new URL(`../src/sprites/${kind}.svg`, import.meta.url)
  const old = readFileSync(file, 'utf8')
  const next = old.replace(/<!--fill-->[\s\S]*?<!--\/fill-->/, `<!--fill-->${svg}<!--/fill-->`)
  if (next !== old) { writeFileSync(file, next); console.log(`painted ${kind}`) }
}
