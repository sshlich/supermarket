// Writes a starting sprite for every kind that has none (or every kind, with --all) into src/sprites/.
//   node scripts/sprites.ts [--all]

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { KINDS } from '../src/world.ts'
import { starter } from './sprite.ts'

const dir = new URL('../src/sprites/', import.meta.url)
mkdirSync(dir, { recursive: true })
let n = 0
for (const [id, k] of Object.entries(KINDS)) {
  const file = new URL(`${id}.svg`, dir)
  if (existsSync(file) && !process.argv.includes('--all')) continue
  writeFileSync(file, starter(k))
  n++
}
console.log(`${n} sprites written`)
