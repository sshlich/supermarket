// The Terminal (DESIGN 8, 13.1): a console inside the terminal. MAINT talks; access decides what else it does.

import { LEVELS } from '../data/levels.ts'
import { SPECIES } from '../data/species.ts'
import { reads, tier } from '../model/access.ts'
import type { Action } from '../model/apply.ts'
import { masons } from '../model/state.ts'
import { siteDef } from '../model/run.ts'
import { burialDay } from '../model/sim.ts'
import { act, s } from './game.ts'
import { UI } from './icons.ts'
import { esc } from './ui.ts'
import { define, paint } from './wm.ts'

let out: string[] = []
let visit = ''

const HELP: [string, string][] = [
  ['help', 'this'],
  ['present fragment', 'spend a Signature Fragment: access rises'],
  ['read', 'READ: exact tables for this stratum, and subscribe to it'],
  ['note tag <site>', 'NOTE: Scourers leave what lies there alone'],
  ['note subscribe <stratum>', 'NOTE: one more stratum on the feed'],
]

/** A level's exact table as MAINT prints it. */
function table(level: string) {
  const L = s.levels[level]
  const def = LEVELS[level]
  const rows = SPECIES.filter(sp => L.N[sp.id] !== undefined).map(sp => `  ${sp.name.toLowerCase().padEnd(14)}${String(Math.round(L.N[sp.id])).padStart(5)}`)
  const day = burialDay(s)
  return [`stratum ${def.floor} ${def.name.toLowerCase()}: film ${Math.round(100 * L.F / def.Fmax)}% · scrap ${Math.round(L.S)} · heat ${L.heat} · ${L.flooded ? 'flooded' : 'dry'} · masons ${masons(s, L)} · attention ${Math.round(L.A)}`,
    ...rows, day ? `gap between -213 and -214: closure projected, day ${day}.` : 'gap between -213 and -214: closed.']
}

function say(a: Action, echo: string) {
  const ev = act(a)
  out.push(`> ${echo}`, ...ev.map(e => e.kind === 'tier' ? `access: ${e.text}.` : e.text.toLowerCase()))
  if (a.type === 'read' && !ev.some(e => e.kind === 'refused')) out.push(...table(s.run!.level))
}

export function command(line: string) {
  const [verb, what, ...rest] = line.trim().toLowerCase().split(/\s+/)
  const arg = rest.join(' ')
  const find = <T extends { id: string; name: string }>(xs: T[]) => xs.find(x => x.id.toLowerCase() === arg || x.name.toLowerCase() === arg || x.name.toLowerCase().startsWith(arg))
  if (!verb) return
  if (verb === 'help') out.push('> help', ...HELP.map(([c, d]) => `  ${c.padEnd(26)}${d}`))
  else if (verb === 'present') say({ type: 'present' }, line)
  else if (verb === 'read') say({ type: 'read' }, line)
  else if (verb === 'note' && what === 'tag') {
    const site = find(LEVELS[s.run!.level].sites)
    if (site) say({ type: 'note', what: 'tag', id: site.id }, line)
    else out.push(`> ${line}`, 'no such site on record.')
  } else if (verb === 'note' && what === 'subscribe') {
    const L = find(Object.values(LEVELS))
    if (L) say({ type: 'note', what: 'subscribe', id: L.id }, line)
    else out.push(`> ${line}`, 'no such stratum on record.')
  } else out.push(`> ${line}`, 'maint: hello? (query malformed. discarding.)')
  paint('terminal')
}

function body() {
  const r = s.run
  if (!r?.term) return '<pre class="console">NO CARRIER.\n\nWalk to a terminal and wake it.</pre>'
  const here = `${s.day}:${r.site}`
  if (here !== visit) { visit = here; out = [] }
  const head = [
    `STRATA/98 MAINT CONSOLE ── ${siteDef(r.level, r.site).name.toUpperCase()} (${LEVELS[r.level].floor})`,
    `ACCESS: ${tier(s)} · FRAGMENTS ${s.access.fragments} OF 7${tier(s) === 'GUEST' && reads(s) ? ' · SIGNAL CARRIER: READS' : ''} · type help`,
    '', ...s.log.filter(l => l.kind === 'maint').slice(-5).map(l => `maint: ${l.text}`), '',
  ]
  const sites = LEVELS[r.level].sites.filter(x => s.know[`T:${x.id}:seen`])
  return `<pre class="console">${esc([...head, ...out].join('\n'))}</pre>
    <div class="term-cmds">
      <button data-on="cmd:present fragment">present fragment</button>
      <button data-on="cmd:read">read</button>
      <select id="term-tag">${sites.map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select><button data-on="tag">note tag</button>
      <select id="term-sub">${Object.values(LEVELS).filter(l => s.levels[l.id]).map(l => `<option value="${l.id}">${esc(l.name)}</option>`).join('')}</select><button data-on="sub">note subscribe</button>
    </div>
    <div class="field-row"><label for="term-in">&gt;</label><input id="term-in" type="text" autocomplete="off" spellcheck="false"></div>`
}

define({
  id: 'terminal', title: 'Terminal', icon: UI.terminal, x: 160, y: 60, w: 620, h: 460,
  body,
  bind: body => {
    const pre = body.querySelector('pre')!
    pre.scrollTop = pre.scrollHeight
    const input = body.querySelector<HTMLInputElement>('#term-in')
    input?.addEventListener('keydown', e => { if (e.key === 'Enter') { command(input.value); body.querySelector<HTMLInputElement>('#term-in')?.focus() } })
    input?.focus()
  },
  on: (cmd, arg, el) => {
    const pick = (id: string) => el.closest('.window-body')!.querySelector<HTMLSelectElement>(id)?.value ?? ''
    if (cmd === 'cmd') command(arg)
    if (cmd === 'tag') command(`note tag ${pick('#term-tag')}`)
    if (cmd === 'sub') command(`note subscribe ${pick('#term-sub')}`)
  },
})
