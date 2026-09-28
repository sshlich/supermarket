// The world with nobody watching (DESIGN 14.5): a population table every few nights, and what happened in between.
//   node seam/sim/cli.ts [--seed 7] [--days 60] [--every 5] [--scenario scenarios/s2-silence-choir.json]

import { existsSync, readFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import { LEVELS } from '../src/data/levels.ts'
import { SPECIES } from '../src/data/species.ts'
import { masons, play, type Ev, type Scripted } from '../src/model/sim.ts'
import { newGame, type State } from '../src/model/state.ts'

const { values: o } = parseArgs({
  options: {
    seed: { type: 'string', default: '7' },
    days: { type: 'string', default: '60' },
    every: { type: 'string', default: '5' },
    scenario: { type: 'string' },
  },
})
const [seed, days, every] = [o.seed, o.days, o.every].map(Number)
if (![seed, days, every].every(Number.isInteger) || days < 1 || every < 1) throw new Error('--seed, --days and --every take whole numbers')
// A scenario path works from here or from seam/.
const file = o.scenario && (existsSync(o.scenario) ? o.scenario : new URL(`../${o.scenario}`, import.meta.url))
const script: Scripted[] = file ? JSON.parse(readFileSync(file, 'utf8')) : []

const POP = SPECIES.filter(sp => sp.mass > 0) // Auditors and Masons aren't populations
const cell = (n: number | undefined) => n ? String(Math.round(n)) : '·'
const row = (label: string, cells: string[], widths: number[]) => label.padEnd(16) + cells.map((c, i) => c.padStart(widths[i])).join('')
const W = [6, 7, 6, 5, 3, 2, ...POP.map(sp => Math.max(6, sp.id.length + 2))]

function table(s: State, night: number) {
  const seam = s.flags.buried ? 'sealed' : `${s.villagers.length} people`
  console.log(`\n── night ${night} ${'─'.repeat(4)} Burial ${Math.floor(s.burial)}% · the Seam: ${seam}`)
  console.log(row('', ['film', 'scrap', 'dead', 'att', 'M', '│', ...POP.map(sp => sp.id)], W))
  for (const L of Object.values(s.levels))
    console.log(row(LEVELS[L.id].name, [`${Math.round(100 * L.F / LEVELS[L.id].Fmax)}%`, cell(L.S), cell(L.C), cell(L.A), String(masons(s, L)), '│', ...POP.map(sp => cell(L.N[sp.id]))], W))
}

const s = newGame(seed)
console.log(`SEAM, the world headless · seed ${seed} · ${days} nights · ${o.scenario ?? 'no script'}`)
for (const a of script) console.log(`  after night ${a.night}: ${a.do} at ${LEVELS[a.level]?.name ?? a.level}${a.value === undefined ? '' : ` = ${a.value}`}`)
table(s, 0)
let events: Ev[] = []
const tally: Record<string, number> = {}
play(s, script, days, (x, ev) => {
  events.push(...ev)
  for (const e of ev) tally[e.kind] = (tally[e.kind] ?? 0) + 1
  const night = x.day - 1
  if (night % every && night !== days) return
  for (const e of events) console.log(`  n${String(e.night).padEnd(3)} ${e.kind.padEnd(8)} ${e.text}`)
  events = []
  table(x, night)
})
console.log(`\n${Object.entries(tally).map(([k, n]) => `${n} ${k}`).join(' · ')}`)
