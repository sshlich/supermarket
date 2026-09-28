// Reading the world (M2): the Atlas and its Level entries, the Bestiary, the Ledger and MAINT's log.
// Every fact goes through the knowledge filter: ??? until learned, the truth only with ?omniscient.

import { HAZARDS } from '../data/hazards.ts'
import { LEVERS } from '../data/levers.ts'
import { CONNECTIONS, LEVELS, SEAM } from '../data/levels.ts'
import { SPECIES, type Species } from '../data/species.ts'
import { fact, knownConnection, knownLevel } from '../model/knowledge.ts'
import type { Cell } from '../model/state.ts'
import { project, type Projection } from '../model/project.ts'
import { terminalHere, tier } from '../model/access.ts'
import { stock, H } from '../model/seam.ts'
import { act, omni, s } from './game.ts'
import { UI } from './icons.ts'
import { blocks, cell, esc, icon, sortOf, spark, table, tip, trend, type Col } from './ui.ts'
import { define, paint } from './wm.ts'

const f = (key: string) => fact(s, key, omni)
const c = (key: string, show?: (v: Cell['value']) => string) => cell(f(key), s.day, show)
const pct = (v: Cell['value']) => typeof v === 'number' ? `${v}%` : esc(String(v))
const levelsKnown = () => Object.keys(s.levels).filter(id => knownLevel(s, id, omni))
const SHORT: Record<string, string> = { galleries: 'Galleries', ducts: 'Ducts', stair: 'Stair', hall: 'Hall', u0041: '0041' }

// ---------------------------------------------------------------- Atlas

let sel = 'galleries'
let proj: { level: string; lever: string; rows: Projection[] | null } | null = null

function map() {
  const known = levelsKnown()
  const at = (id: string) => id === 'seam' ? SEAM.at : LEVELS[id].at
  const shown = (id: string) => id === 'seam' || known.includes(id)
  const edges = s.connections.filter(c => knownConnection(s, c.id, omni) && shown(c.a) && shown(c.b)).map(c => {
    const [[x1, y1], [x2, y2]] = [at(c.a), at(c.b)]
    const def = CONNECTIONS.find(d => d.id === c.id)!
    const state = !c.open ? 'closed' : c.requires === 'drained' && [c.a, c.b].some(id => s.levels[id]?.flooded) ? 'impassable: flooded' : 'open'
    return `<g ${tip(`${def.type}, ${c.cost} step${c.cost > 1 ? 's' : ''}: ${state}`)}>
      <line class="edge ${state.split(':')[0]}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>
      <text class="cost" x="${(x1 + x2) / 2 + 2}" y="${(y1 + y2) / 2}">${c.cost}</text></g>`
  }).join('')
  const node = (id: string, name: string, floor: string, pal: string[], [x, y]: [number, number]) => `
    <g class="node ${sel === id ? 'sel' : ''}" ${id === 'seam' ? '' : `data-on="level:${id}"`} transform="translate(${x} ${y})">
      <rect x="-15" y="-5" width="30" height="10" fill="${pal[1]}" stroke="${pal[3]}"/>
      <text y="-0.6" fill="${pal[3]}">${esc(name)}</text><text class="floor" y="3.2" fill="${pal[2]}">${esc(floor)}</text></g>`
  // Fit what's known, with room for the labels; never zoom in past a third of the whole.
  const pts = [SEAM.at, ...known.map(id => LEVELS[id].at)]
  const [x0, x1] = [Math.min(...pts.map(p => p[0])), Math.max(...pts.map(p => p[0]))]
  const [y0, y1] = [Math.min(...pts.map(p => p[1])), Math.max(...pts.map(p => p[1]))]
  const [w, h] = [Math.max(x1 - x0 + 36, 64), Math.max(y1 - y0 + 16, 64)]
  const box = `${(x0 + x1) / 2 - w / 2} ${(y0 + y1) / 2 - h / 2} ${w} ${h}`
  return `<svg class="map" viewBox="${box}">${edges}${node('seam', SEAM.name, SEAM.floor, SEAM.palette, SEAM.at)}
    ${known.map(id => node(id, LEVELS[id].name, LEVELS[id].floor, LEVELS[id].palette, LEVELS[id].at)).join('')}</svg>`
}

/** Writable cells (8): at a terminal with WRITE and a write left this visit, the world's table takes a pencil. */
const writable = () => terminalHere(s) && !!s.run?.term && s.run.term.writes < 1 && (tier(s) === 'WRITE' || tier(s) === 'ROOT')
const pencil = (what: string, target: string, t: string) => writable() ? `<button class="pencil" data-on="write:${what}:${target}" ${tip(`WRITE: ${t} (+30 attention there; one write a visit).`)}>${icon('quill-ink')}</button>` : ''

/** The Level entry (13.2): a page per level, Backrooms-style. */
function entry(id: string) {
  const def = LEVELS[id]
  const k = (field: string, show?: (v: Cell['value']) => string) => c(`L:${id}:${field}`, show)
  const conns = s.connections.filter(x => (x.a === id || x.b === id) && knownConnection(s, x.id, omni))
  const species = SPECIES.filter(sp => sp.mass > 0 && (omni ? s.levels[id].N[sp.id] !== undefined : !!s.know[`S:${sp.id}:known`]))
  const pop = (sp: Species) => f(`S:${sp.id}:pop:${id}`)
  return `
    <h2>${esc(def.name.toUpperCase())} <small>(${esc(def.floor)})</small></h2>
    <p class="class">Survival class ${k('class')} · ${k('safety')} · ${k('stability')} · ${k('entities')} entities</p>
    <div class="vista" style="background: linear-gradient(${def.palette[3]}, ${def.palette[2]} 20%, ${def.palette[1]} 55%, ${def.palette[0]})"></div>
    <p class="lore">${esc(def.text)}</p>
    <p class="stats">Film ${k('film', pct)} · Scrap ${k('scrap')} · Heat ${k('heat')} · ${k('flooded', v => v ? 'flooded' : 'dry')}
      · Masons ${k('masons', v => blocks(v as number, 3, 3))}${pencil('hold', id, 'a maintenance hold, the Masons idle 10 nights')} · Attention ${k('attention', v => typeof v === 'number' ? blocks(v, 100) : esc(String(v)))}</p>
    <h3>Species</h3>
    ${table(`entry-${id}`, [
      { head: 'Species', cell: sp => `${icon(sp.icon)}${esc(sp.name)}`, sort: sp => sp.name },
      { head: 'Population', cell: sp => `${cell(pop(sp), s.day)}${sp.id === 'scourer' ? pencil('dispose', id, 'a disposal request, 20 Scourers') : ''}`, sort: sp => sortOf(pop(sp)) },
      { head: 'Trend', cell: sp => `${spark(pop(sp)?.trail)}${trend(pop(sp)?.trail)}` },
    ] as Col<Species>[], species, 'Nothing seen here yet.')}
    <h3>Connections</h3>
    ${conns.length ? `<ul>${conns.map(x => {
      const other = x.a === id ? x.b : x.a
      const d = CONNECTIONS.find(d => d.id === x.id)!
      return `<li>${esc(d.type)} to ${esc(other === 'seam' ? SEAM.name : knownLevel(s, other, omni) ? LEVELS[other].name : '???')}, ${x.cost} step${x.cost > 1 ? 's' : ''}${x.open ? '' : ', closed'}${other === 'seam' ? '' : pencil('reroute', x.id, x.open ? 'close it' : 'open it')}</li>`
    }).join('')}</ul>` : '<p class="empty">None known.</p>'}
    <h3>Sites</h3>
    ${table(`sites-${id}`, [
      { head: 'Site', cell: x => esc(x.name), sort: x => x.name },
      { head: 'Type', cell: x => esc(x.type), sort: x => x.type },
      { head: 'Hazard', cell: x => c(`T:${x.id}:hazard`, v => v === 'none' ? 'none' : `<b class="hz">${esc(HAZARDS[v as string].name)}</b>`), sort: x => sortOf(f(`T:${x.id}:hazard`)) },
    ] as Col<(typeof def.sites)[number]>[], def.sites.filter(x => omni || s.know[`T:${x.id}:seen`]), 'Nobody has walked it yet.')}
    ${levers(id)}`
}

/** Levers seen on a level, what each is known to do, its terminals, and the week-ahead projection (11.6). */
function levers(id: string) {
  const def = LEVELS[id]
  const seen = def.sites.flatMap(x => (x.levers ?? []).map(l => ({ l, site: x }))).filter(({ l }) => omni || s.know[`V:${l}:seen`])
    .filter((x, i, a) => a.findIndex(y => y.l === x.l) === i)
  const terms = def.sites.filter(x => x.type === 'terminal' && (omni || s.know[`T:${x.id}:seen`]))
  const pullable = seen.filter(({ l }) => f(`V:${l}:effect`))
  const p = proj?.level === id ? proj : null
  const band = (n: number, rough: boolean) => rough ? `<i>${esc(['none', 'few', 'some', 'many', 'swarm'][n < 0.5 ? 0 : n < 5.5 ? 1 : n < 20.5 ? 2 : n < 80.5 ? 3 : 4])}</i>` : String(Math.round(n))
  return `<h3>Levers</h3>
    ${seen.length ? `<ul>${seen.map(({ l, site }) => `<li><b>${esc(LEVERS[l].name)}</b> at the ${esc(site.name)}: ${c(`V:${l}:effect`)}</li>`).join('')}</ul>` : '<p class="empty">None seen.</p>'}
    <h3>Terminals</h3>
    ${terms.length ? `<ul>${terms.map(x => `<li>${esc(x.name)}${s.access.subscribed.includes(id) ? ' (subscribed)' : ''}</li>`).join('')}</ul>` : '<p class="empty">None seen.</p>'}
    <h3>What would happen…</h3>
    <p class="field-row"><select id="proj-lever"><option value="">as things stand</option>${pullable.map(({ l }) => `<option value="${l}" ${p?.lever === l ? 'selected' : ''}>if the ${esc(LEVERS[l].name)} is pulled</option>`).join('')}</select>
      <button data-on="project:${id}" ${tip('Runs the world a week forward on a copy made only of what you know. Unknown numbers stay unknown; rough ones stay rough.')}>Run it forward a week</button></p>
    ${p ? p.rows?.length ? table(`proj-${id}`, [
      { head: 'Species', cell: r => esc(SPECIES.find(x => x.id === r.species)!.name) },
      { head: 'As known now', cell: r => band(r.now, r.rough) },
      { head: 'In a week', cell: r => band(r.then, r.rough) },
    ] as Col<Projection>[], p.rows) : '<p class="empty">Too little is known here to say. Unknown numbers stay ???.</p>' : ''}`
}

define({
  id: 'atlas', title: 'Atlas', icon: UI.atlas, x: 150, y: 40, w: 760, h: 540, desktop: true,
  body: () => `<div class="atlas"><div class="pane">${map()}</div><div class="page">${entry(sel)}</div></div>`,
  on: (cmd, arg, el) => {
    if (cmd === 'level') { sel = arg; proj = null; paint('atlas') }
    if (cmd === 'write') { const [what, target] = arg.split(':'); act({ type: 'write', what: what as 'hold' | 'dispose' | 'reroute', target }) }
    if (cmd === 'project') {
      const lever = el.closest('.window-body')!.querySelector<HTMLSelectElement>('#proj-lever')?.value ?? ''
      proj = { level: arg, lever, rows: project(s, arg, lever || undefined) }
      paint('atlas')
    }
  },
})

// ---------------------------------------------------------------- Bestiary

function bestiary() {
  const rows = SPECIES.filter(sp => sp.mass > 0 && (omni || !!s.know[`S:${sp.id}:known`]))
  const k = (sp: Species, field: string) => f(`S:${sp.id}:${field}`)
  const col = (head: string, field: string): Col<Species> => ({ head, cell: sp => cell(k(sp, field), s.day), sort: sp => sortOf(k(sp, field)) })
  const diet = (sp: Species) => {
    const foods = Object.keys(sp.diet)
    const known = foods.filter(x => k(sp, `diet:${x}`))
    return known.map(esc).join(', ') + (known.length < foods.length ? `${known.length ? ', ' : ''}<span class="unk">???</span>` : '')
  }
  return table('bestiary', [
    { head: 'Name', cell: sp => `${icon(sp.icon)}${esc(sp.name)}`, sort: sp => sp.name },
    col('Size', 'size'), col('Behaviour', 'behaviour'),
    { head: 'Diet', cell: diet },
    col('Threat', 'threat'), col('HP', 'hp'), col('Drops', 'drops'), col('Props', 'props'),
    ...levelsKnown().map((id): Col<Species> => ({
      head: SHORT[id], tip: `Population ${LEVELS[id].name === 'UNNAMED-0041' ? 'on' : 'in the'} ${LEVELS[id].name}`, cls: 'pop',
      cell: sp => { const p = k(sp, `pop:${id}`); return `${cell(p, s.day)}${spark(p?.trail)}${trend(p?.trail)}` },
      sort: sp => sortOf(k(sp, `pop:${id}`)),
    })),
  ], rows, 'No entries. Nothing has been seen yet.')
}

define({ id: 'bestiary', title: 'Bestiary', icon: UI.bestiary, x: 150, y: 70, w: 900, h: 330, desktop: true, body: bestiary })

// ---------------------------------------------------------------- Ledger

function ledger() {
  const rumours = s.log.filter(l => l.kind === 'rumour' || l.kind === 'event').slice(-12).reverse()
  const st = stock(s)
  const row = (name: string, x: { have: number; need: number }, what: string) => {
    const nights = x.need ? Math.floor(x.have / x.need) : Infinity
    return `<tr class="${nights < 2 ? 'short' : ''}"><th>${name}</th><td>${x.have}</td><td>${x.need}</td>
      <td ${tip(what)}>${nights === Infinity ? '—' : `${nights} night${nights === 1 ? '' : 's'}`}</td></tr>`
  }
  const known = levelsKnown()
  const attention = known.map((id, i) => `<tr>${i ? '' : `<th rowspan="${known.length}">Attention</th>`}<td>${esc(LEVELS[id].name)}
    ${c(`L:${id}:attention`, v => typeof v === 'number' ? `${blocks(v, 100)} ${v}` : esc(String(v)))}</td></tr>`).join('')
  return `
    <div class="sunken-panel"><table class="stock">
      <tr><th></th><th>In store</th><th>A night</th><th>Lasts</th></tr>
      ${row('FOOD', st.food, `A unit a night for every ${H.perHead} people, from the Stores and the Cold Locker, soonest to spoil first.`)}
      ${row('WATER', st.water, `A unit a night for every ${H.perHead} people, from the Stores.`)}
      ${row('POWER', st.power, `Cells in the Stores. ${H.lamps} for the lamps (less any light at home), 1 for each machine switched on.`)}
    </table></div>
    <p class="field-row"><input type="checkbox" id="blackout" data-on="blackout" ${s.blackout ? 'checked' : ''}>
      <label for="blackout" ${tip('Cover the lamps: no raids find the hatch and the lights draw no attention. But no lamps means no moss and no water from the condenser.')}>Blackout</label></p>
    <div class="sunken-panel"><table class="ledger">
      <tr><th>Population</th><td ${tip(s.villagers.join(', '))}>${s.villagers.length}</td></tr>
      <tr><th>The Seam</th><td ${tip('The Seam\'s own attention: lit lamps, loud work, and Signal leaking from anything not in the Lead Box. At 100 the Auditors come between the floors.')}>
        <div class="gauge"><i style="width:${Math.min(100, s.seamA)}%"></i></div> ${Math.round(s.seamA)}</td></tr>
      <tr><th>Burial</th><td><div class="gauge" ${tip('How close the Masons are to sealing the Seam. At 100% it is over.')}><i style="width:${s.burial}%"></i></div> ${Math.floor(s.burial)}%
        · sealed by day ${c('seam:burialDay')}</td></tr>
      ${attention}
    </table></div>
    <h3>Word in the Seam</h3>
    <ul class="word">${rumours.map(l => `<li class="${l.kind}"><small>d${l.day}</small> ${esc(l.text)}</li>`).join('') || '<li class="empty">Nobody has said anything yet.</li>'}</ul>`
}

define({
  id: 'ledger', title: 'Ledger', icon: UI.ledger, x: 984, y: 6, w: 390, h: 600, desktop: true, start: true, body: ledger,
  on: cmd => { if (cmd === 'blackout') act({ type: 'blackout' }) },
})

// ---------------------------------------------------------------- MAINT

let filter = ''
const stamp = (day: number) => `[c${1284017 + day * 3}·d${String(day).padStart(2, '0')} night]`
const maintLines = () => s.log.filter(l => l.kind === 'maint' && (!filter || l.text.includes(filter.toLowerCase())))
  .map(l => `<span class="stamp">${stamp(l.day)}</span> maint: ${esc(l.text)}`).join('\n') || 'maint: (no entries.)'

define({
  id: 'maint', title: 'MAINT', icon: UI.maint, x: 92, y: 432, w: 640, h: 250, desktop: true, start: true,
  body: () => `<div class="field-row"><label for="maint-filter">Filter</label><input id="maint-filter" type="text" value="${esc(filter)}"></div><pre class="maint">${maintLines()}</pre>`,
  bind: body => {
    const pre = body.querySelector('pre')!
    pre.scrollTop = pre.scrollHeight
    body.querySelector('input')!.addEventListener('input', e => {
      filter = (e.target as HTMLInputElement).value
      pre.innerHTML = maintLines()
      pre.scrollTop = pre.scrollHeight
    })
  },
})
