// Copies the icons the field's things name from game-icons.net (via @iconify-json/game-icons, CC BY 3.0) into src/icons/.
//   node scripts/icons.ts

import { mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { KINDS } from '../src/world.ts'

const set: { icons: Record<string, { body: string }> } = createRequire(import.meta.url)('@iconify-json/game-icons/icons.json')
const dir = new URL('../src/icons/', import.meta.url)
mkdirSync(dir, { recursive: true })
const names = new Set(Object.values(KINDS).map(k => k.icon))
for (const name of names) {
  const icon = set.icons[name]
  if (!icon) { console.error(`no icon "${name}"`); process.exitCode = 1; continue }
  writeFileSync(new URL(`${name}.svg`, dir), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${icon.body}</svg>\n`)
}
console.log(`${names.size} icons`)
