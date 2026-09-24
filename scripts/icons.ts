// Copies icons from game-icons.net (via @iconify-json/game-icons, CC BY 3.0) into src/icons/ as SVG files.
// Only what's copied ends up in the game, and any SVG you drop into src/icons/ works the same way.
//
//   npm run icons              copy every icon the items and skills name that's missing
//   npm run icons -- fire key  copy these (to try them out)
//   npm run icons -- ?sword    list icon names containing "sword"
//
// Browse the whole set at https://game-icons.net (names there match, minus the author folder).

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { iconName } from '../src/art.ts'
import { ITEMS } from '../src/items.ts'
import { SKILLS } from '../src/skills.ts'

const set: { icons: Record<string, { body: string }> } = createRequire(import.meta.url)('@iconify-json/game-icons/icons.json')
const dir = new URL('../src/icons/', import.meta.url)
const args = process.argv.slice(2)

if (args[0]?.startsWith('?')) {
  const word = args[0].slice(1)
  console.log(Object.keys(set.icons).filter(n => n.includes(word)).join('\n'))
  process.exit(0)
}

const wanted = args.length ? args : [...new Set([...Object.values(ITEMS), ...Object.values(SKILLS)].flatMap(c => c.art.icons.map(iconName)))]
mkdirSync(dir, { recursive: true })
let added = 0
let failed = false
for (const name of wanted) {
  const file = new URL(`${name}.svg`, dir)
  if (existsSync(file)) continue
  const icon = set.icons[name]
  if (!icon) {
    const near = Object.keys(set.icons).filter(n => n.includes(name.split('-')[0])).slice(0, 8)
    console.error(`no icon "${name}"${near.length ? ` (try: ${near.join(', ')})` : ''}`)
    failed = true
    continue
  }
  writeFileSync(file, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${icon.body}</svg>\n`)
  console.log(`+ ${name}`)
  added++
}
console.log(`${added} added`)
if (failed) process.exit(1)
