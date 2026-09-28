// The Run window (DESIGN 11.3): the site you're at, what's here with you, the ways on, and what you can do.

import { vista } from '../art/vista.ts'
import { HAZARDS } from '../data/hazards.ts'
import { LEVERS } from '../data/levers.ts'
import { LEVELS } from '../data/levels.ts'
import { RELICS } from '../data/relics.ts'
import { SP } from '../data/species.ts'
import { K } from '../model/containers.ts'
import { fact } from '../model/knowledge.ts'
import { R, baitFor, encounterChance, evadeOdds, exits, leverState, pathHome, siteAt, siteDef, theirHit, tool, yourHit, type Choice } from '../model/run.ts'
import { HP } from '../model/state.ts'
import { act, omni, onChange, s } from './game.ts'
import { UI } from './icons.ts'
import { itemName } from './items.ts'
import { esc, icon, tip } from './ui.ts'
import { define, open } from './wm.ts'

const f = (key: string) => fact(s, key, omni)
const pct = (p: number) => `${Math.round(p * 100)}%`

function hazardText(site: string) {
  const c = f(`T:${site}:hazard`)
  if (!c) return `<span class="unk" ${tip('Unknown. Throw a bolt, carry a light, or find out the hard way.')}>???</span>`
  const age = c.day < s.day ? ` · d${c.day}` : ''
  return c.value === 'none' ? `<span ${tip(`Nothing found here, day ${c.day}.`)}>none${age}</span>` : `<b class="hz" ${tip(`${HAZARDS[c.value as string].name}: ${HAZARDS[c.value as string].prop} ${HAZARDS[c.value as string].level}. Known from ${c.src}, day ${c.day}.`)}>${esc(HAZARDS[c.value as string].name)}${age}</b>`
}

function pickRunner() {
  const last = s.log.filter(l => l.kind === 'event' && l.text.includes('did not come back')).at(-1)
  return `<div class="card death"><h2>${esc(last?.text ?? 'The terminal is waiting.')}</h2>
    <p>Somebody has to hold the terminal and the key to the hatch. Everything that was known is still known.</p>
    <p>${s.pick!.length ? s.pick!.map(n => `<button data-on="runner:${esc(n)}">${esc(n)}</button>`).join(' ') : 'There is nobody left.'}</p></div>`
}

function card() {
  const e = s.run!.enc!
  const sp = SP[e.sp]
  const alive = e.n - e.killed
  const known = (k: string) => !!f(`S:${sp.id}:${k}`)
  const odds = known('behaviour') ? ` (${pct(evadeOdds(s))})` : ''
  const fight = known('hp') && known('threat') ? ` (you ${yourHit(s)} a round against ${sp.hp} HP each; they ${sp.id === 'moth' ? 'rust your tools' : `hit ${theirHit(s)}`})` : ''
  const b = (c: Choice, label: string, t: string, off = false) => `<button data-on="choose:${c}" ${off ? 'disabled' : ''} ${tip(t)}>${label}</button>`
  return `<div class="card enc ${e.hostile ? 'hostile' : ''}">
    <p>${icon(sp.icon)}<b>${alive > 1 ? `${alive} ${esc(sp.name)}s` : `A ${esc(sp.name)}`}</b> · ${esc(sp.behaviour)}${e.round ? ` · fight, round ${e.round} of ${R.rounds}` : ''}${e.killed ? ` · ${e.killed} dead` : ''}</p>
    <p>${e.hostile ? 'They have seen you, and they are coming.' : 'They have seen you. They are not coming, yet: carry on, and you leave them be.'}</p>
    <div class="choices">
      ${b('evade', `Evade${odds}`, 'Slip past. If it fails they get a round on you, and the level hears it (+10).')}
      ${b('fight', `Fight${fight}`, 'Up to three rounds; you can evade between them. Loud: +15, and +3 a kill.')}
      ${b('backoff', 'Back off', `Back the way you came${s.run!.prev ? ` (${s.run!.prev.cost} step${s.run!.prev.cost > 1 ? 's' : ''})` : ''}. Hunters get a round on you first.`, !s.run!.prev)}
      ${b('leave', 'Let them be', 'Only if they let you.', e.hostile)}
    </div>${lure()}${uses('card')}</div>`
}

/** Relics on the belt with a Use (Appendix D): in an encounter, or (the Unbuilder) at a Mason Works. */
function uses(where: 'card' | 'site') {
  const list = s.C.belt.filter(it => RELICS[it.kind]?.use && (where === 'card') === (RELICS[it.kind].use !== 'fire'))
  const verb: Record<string, string> = { flare: 'Flare the candle', present: 'Present the shard', fire: 'Fire the Unbuilder' }
  // An unidentified relic can still be tried: that's one way to learn what it does.
  const label = (it: (typeof list)[number]) => itemName(it) === 'Unknown Relic' ? ['Try the Unknown Relic', 'Nobody knows what it does. Hold it up and see.'] : [verb[RELICS[it.kind].use!], RELICS[it.kind].uses]
  return list.length ? `<p class="lure">${list.map(it => `<button data-on="use:${it.id}" ${tip(label(it)[1])}>${label(it)[0]}</button>`).join(' ')}</p>` : ''
}

/** Lure (11.5): bait from the pack leads them away, to a site next door or out of the level. */
function lure() {
  const e = s.run!.enc!
  const bait = baitFor(s, e.sp)
  if (!bait) return ''
  const ways = exits(s).filter(x => x.open && !x.home)
  return `<p class="lure">Lure them with the ${esc(K[bait.kind].name)} toward: ${ways.map(x =>
    `<button data-on="lure:${x.key}" ${tip(x.level !== s.run!.level ? 'Out of this level entirely.' : 'Onto a hazard, some won\'t come out. Into the Audit Tower, the tower hears them.')}>${esc(siteDef(x.level, x.site).name)}</button>`).join(' ')}</p>`
}

function run() {
  if (s.pick) return pickRunner()
  if (!s.run) {
    const late = s.step + 1 > R.day
    return `<div class="card"><h2>At the Seam</h2><p>${esc(s.runner.name)} is home. HP ${s.runner.hp}/${HP}, Drift ${Math.round(s.runner.drift)}.</p>
      <p>Pack the belt first: tools only work there. Bolts and bait work from the pack.</p>
      <p><button data-on="start" ${late ? 'disabled' : ''}>${icon(UI.run)}Go out through the hatch (1 step)</button> ${late ? '<small>Too late today.</small>' : ''}</p></div>
      ${recent()}`
  }
  const r = s.run
  const L = LEVELS[r.level]
  const d = siteDef(r.level, r.site)
  const st = siteAt(s, r.level, r.site)
  const left = R.day - s.step
  const busy = !!r.enc?.hostile // anything else you can walk away from
  const bolts = [...s.C.pack, ...s.C.belt].some(it => it.kind === 'bolt')
  const ways = exits(s).map(x => {
    const name = x.home ? 'The Seam' : `${siteDef(x.level, x.site).name}${x.level !== r.level ? ` <small>(${esc(LEVELS[x.level].name)})</small>` : ''}`
    const via = x.via ? ` <small>by the ${esc(x.via)}</small>` : ''
    const off = busy || !x.open || x.cost > left
    return `<tr><td>${name}${via}</td><td>${x.home ? '' : hazardText(x.site)}</td><td>${x.why ? `<i>${esc(x.why)}</i>` : ''}</td>
      <td>${x.home ? '' : `<button data-on="bolt:${x.key}" ${busy || !bolts ? 'disabled' : ''} ${tip(bolts ? 'Throw a bolt that way: it shows what waits there (+1 attention). Half the time you find it again.' : 'No bolts left in the pack or on the belt.')}>Bolt</button>`}</td>
      <td><button data-on="go:${x.key}" ${off ? 'disabled' : ''}>Go · ${x.cost}</button></td></tr>`
  }).join('')
  const home = pathHome(s)
  const cutter = tool(s, 'cutter')
  const remains = st.remains.map(x => `${x.n} ${SP[x.species].name}${x.n > 1 ? 's' : ''}`).join(', ')
  const levers = (d.levers ?? []).map(id => {
    const v = LEVERS[id]
    const known = f(`V:${id}:effect`)
    const needs = [v.tool && `the ${K[v.tool].name} on the belt (wears ${v.wear})`, v.spend && !(id === 'conduitTap' && s.flags.tapWired) && `${v.spend[1]} ${K[v.spend[0]].name} from the pack`, v.belt && `${v.belt[0]} ${v.belt[1]} on the belt`].filter(Boolean)
    const now = leverState(s, id)
    return `<button data-on="lever:${id}" ${busy || left < 1 ? 'disabled' : ''} ${tip(`${v.name}. ${known ? known.value : 'What it does: ???'}\nNeeds: ${needs.join(', ') || 'nothing'}. 1 step${v.attention ? `, +${v.attention} attention` : ''}.`)}>${esc(v.name)}${now ? ` (${now})` : ''}</button>`
  }).join('')
  const terminal = d.type === 'terminal' ? `<button data-on="terminal" ${busy || (!r.term && left < 1) ? 'disabled' : ''} ${tip('Wake the terminal: 1 step. MAINT, and whatever your access lets you do.')}>${icon(UI.terminal)}Terminal${r.term ? ' (awake)' : ''}</button>` : ''
  const loot = st.loot.map(it => `<li>${icon(itemName(it) === 'Unknown Relic' ? 'cube' : K[it.kind].icon)}${esc(itemName(it))}${it.n > 1 ? ` ×${it.n}` : ''} <button data-on="take:${it.id}" ${busy ? 'disabled' : ''}>Take</button></li>`).join('')
  const chance = f(`L:${r.level}:entities`) ? `<span ${tip('The chance of meeting something on arriving here, from what lives on this level.')}>meeting something: ${pct(encounterChance(s, r.level, r.site))}</span>` : ''
  return `
    <div class="site">
      <img class="vista" src="${vista(r.site, r.level, d.type, L.palette)}" alt="">
      <h2>${esc(d.name.toUpperCase())} <small>${esc(L.name)} (${esc(L.floor)})</small></h2>
      <p class="lore">${esc(d.text)}</p>
      <p>Hazard here: ${hazardText(r.site)} · Step ${s.step}/${R.day} · HP ${s.runner.hp}/${HP} · Drift ${Math.round(s.runner.drift)}${chance ? ` · ${chance}` : ''}</p>
    </div>
    ${r.enc ? card() : ''}
    <h3>Ways on</h3>
    <div class="sunken-panel"><table class="ways">${ways}</table></div>
    <h3>Here</h3>
    ${levers || terminal ? `<p class="acts">${levers}${terminal}</p>` : ''}
    ${d.type === 'works' && !busy ? uses('site') : ''}
    <p class="acts">
      <button data-on="search" ${busy || st.searched || d.type === 'nest' || left < 1 ? 'disabled' : ''} ${tip(d.type === 'nest' ? 'A nest: nothing to search. Harvest what you kill.' : 'Search the site once: 1 step.')}>Search${st.searched ? 'ed' : ''}</button>
      <button data-on="harvest" ${busy || !remains || !cutter || left < 1 ? 'disabled' : ''} ${tip(cutter ? 'Harvest the remains here with the Cutter: 1 step.' : 'Harvesting needs the Cutter on the belt.')}>Harvest${remains ? ` ${remains}` : ''}</button>
      <button data-on="return" ${busy || !home || home.cost > left ? 'disabled' : ''} ${tip(!home ? 'No known way home from here.' : home.cost > left ? `Home is ${home.cost} steps away and ${left} ${left === 1 ? 'is' : 'are'} left today. Camp, or walk part of the way.` : 'Walk the known way home. Things can still happen on the way.')}>Return home${home ? ` · ${home.cost} step${home.cost > 1 ? 's' : ''}` : ''}</button>
      <button data-on="camp" ${busy ? 'disabled' : ''} ${tip('Sleep here. The night runs; something may find you; and the Seam has to manage without you.')}>Camp</button>
    </p>
    ${loot ? `<h3>On the floor${st.fell ? ` (${esc(st.fell)} fell here)` : ''}</h3><ul class="floor">${loot}</ul>` : ''}
    ${recent()}`
}

const recent = () => {
  const lines = s.log.filter(l => l.kind === 'run').slice(-6)
  return lines.length ? `<h3>Lately</h3><ul class="runlog">${lines.map(l => `<li><small>d${l.day}</small> ${esc(l.text)}</li>`).join('')}</ul>` : ''
}

// Somebody has to take the terminal: ask at once.
onChange(() => { if (s.pick) open('run') })

define({
  id: 'run', title: 'Run', icon: UI.run, x: 92, y: 6, w: 640, h: 690, desktop: true,
  body: run,
  on: (cmd, arg) => {
    if (cmd === 'start') { act({ type: 'startRun' }); open('kit') }
    if (cmd === 'go') act({ type: 'go', key: arg })
    if (cmd === 'bolt') act({ type: 'bolt', key: arg })
    if (cmd === 'search') act({ type: 'search' })
    if (cmd === 'harvest') act({ type: 'harvest' })
    if (cmd === 'take') act({ type: 'take', id: +arg })
    if (cmd === 'choose') act({ type: 'choose', choice: arg as Choice })
    if (cmd === 'lure') act({ type: 'choose', choice: 'lure', arg })
    if (cmd === 'lever') act({ type: 'lever', id: arg })
    if (cmd === 'use') act({ type: 'use', id: +arg })
    if (cmd === 'terminal') { act({ type: 'terminal' }); open('terminal') }
    if (cmd === 'return') act({ type: 'returnHome' })
    if (cmd === 'camp') document.querySelector<HTMLElement>('[data-endday]')?.click()
    if (cmd === 'runner') act({ type: 'runner', name: arg })
  },
})
