// The Seam (M3): its containers and machines, the runner's kit, and the Catalog of things.

import type { Box } from '../data/items.ts'
import { DIALS, RELICS, TESTED, type Dial } from '../data/relics.ts'
import { beltEffects, homeEffects } from '../model/items.ts'
import { K } from '../model/containers.ts'
import { fact } from '../model/knowledge.ts'
import { MACHINES, type Machine } from '../model/seam.ts'
import { HP } from '../model/state.ts'
import { act, omni, s } from './game.ts'
import { UI } from './icons.ts'
import { boxHtml, itemName } from './items.ts'
import { cell, esc, icon, sortOf, table, tip, type Col } from './ui.ts'
import { define, open } from './wm.ts'

const tidyOn = (cmd: string, arg: string) => { if (cmd === 'tidy') act({ type: 'tidy', box: arg as Box }) }

// ---------------------------------------------------------------- the Seam

function seam() {
  const away = s.run ? `<p class="away-note">${esc(s.runner.name)} is out. The Seam's shelves are out of reach until the hatch.</p>` : ''
  const sw = (m: Machine) => `<input type="checkbox" id="m-${m}" data-on="machine:${m}" ${s.machines[m] ? 'checked' : ''}><label for="m-${m}" ${tip(MACHINES[m].blurb)}>${MACHINES[m].name}</label>`
  const cold = s.machines.cold ? 'COLD 2 while powered' : 'switched off: just a box'
  const charger = s.conduitTapped ? 'the conduit fills 3 a night' : 'no conduit tapped'
  return `${away}<div class="machines field-row">${(Object.keys(MACHINES) as Machine[]).map(sw).join('')}</div>
    <div class="boxes">
      ${boxHtml('stores')}
      <div class="col">${boxHtml('cold', cold)}${boxHtml('lead')}</div>
      <div class="col">${boxHtml('charger', charger)}${boxHtml('workbench')}</div>
    </div>`
}

define({
  id: 'seam', title: 'Seam', icon: UI.seam, x: 92, y: 6, w: 640, h: 420, desktop: true, start: true,
  body: seam,
  on: (cmd, arg) => {
    tidyOn(cmd, arg)
    if (cmd === 'machine') act({ type: 'machine', id: arg as Machine })
  },
})

// ---------------------------------------------------------------- the kit

function kit() {
  const r = s.runner
  const gauge = (v: number, max: number, cls = '') => `<div class="gauge ${cls}"><i style="width:${Math.max(0, Math.min(100, v / max * 100))}%"></i></div>`
  return `<div class="runner">
      <p><b>${esc(r.name)}</b> holds the terminal and the key to the hatch.</p>
      <p ${tip('Health. At 0 the runner is lost, and the pack and belt stay where they fell.')}>HP ${gauge(r.hp, HP, 'hp')} ${r.hp}/${HP}</p>
      <p ${tip('Drift: what carrying relics does to a person. It eases 2 a night at home, never below 20 under the worst it has been. At 100 the Accretion keeps them.')}>Drift ${gauge(r.drift, 100, 'drift')} ${Math.round(r.drift)}</p>
      <p><button data-on="run">${icon(UI.run)}${s.run ? 'Out on a run…' : 'Go out…'}</button></p>
    </div>
    ${boxHtml('belt')}${boxHtml('pack')}`
}

define({
  id: 'kit', title: 'Kit', icon: UI.kit, x: 738, y: 6, w: 240, h: 390, desktop: true, start: true, body: kit,
  on: (cmd, arg) => { tidyOn(cmd, arg); if (cmd === 'run') open('run') },
})

// ---------------------------------------------------------------- the Lab (10.4)

function lab() {
  const relic = s.C.lab.find(it => K[it.kind].relic)
  const dial = (d: Dial) => `<input type="radio" name="dial" id="dial-${d}" data-on="dial:${d}" ${s.lab.dial === d ? 'checked' : ''}><label for="dial-${d}" ${tip(DIALS[d].blurb)}>${DIALS[d].name}</label>`
  return `${boxHtml('lab')}
    <fieldset><legend>Stimulus</legend><div class="dials">${(Object.keys(DIALS) as Dial[]).map(dial).join('')}
      <input type="radio" name="dial" id="dial-off" data-on="dial:" ${s.lab.dial ? '' : 'checked'}><label for="dial-off">Off</label></div></fieldset>
    <p><b>Last night:</b> ${esc(s.lab.last ?? 'nothing tested.')}</p>
    <p class="empty">${relic ? `Tonight: the ${esc(itemName(relic))} on the ${s.lab.dial ? DIALS[s.lab.dial].name.toLowerCase() : 'bench, with the dial off'}.${s.lab.dial && DIALS[s.lab.dial].props.every(p => s.know[`R:${relic.kind}:${p}`]?.state === 'exact') ? ' That is already known: turn the dial.' : ''}` : 'Put a relic on the bench, set the dial, and end the day. One property a night.'}</p>`
}

define({
  id: 'lab', title: 'Lab', icon: UI.lab, x: 300, y: 120, w: 300, h: 330, desktop: true, body: lab,
  on: (cmd, arg) => { tidyOn(cmd, arg); if (cmd === 'dial') act({ type: 'dial', dial: (arg || undefined) as Dial | undefined }) },
})

// ---------------------------------------------------------------- the Catalog

function catalog() {
  const known = Object.values(K).filter(k => !k.relic && (omni || s.know[`I:${k.id}:known`]))
  const f = (id: string, field: string) => fact(s, `I:${id}:${field}`, omni)
  const col = (head: string, field: string, t?: string): Col<(typeof known)[number]> => ({ head, tip: t, cell: k => cell(f(k.id, field), s.day), sort: k => sortOf(f(k.id, field)) })
  const relics = Object.values(RELICS).filter(r => omni || TESTED.some(p => s.know[`R:${r.id}:${p}`]) || s.know[`I:${r.id}:known`])
  const r = (id: string, field: string) => fact(s, `R:${id}:${field}`, omni)
  const knownProps = (id: string) => Object.fromEntries(TESTED.map(p => [p, r(id, p)]).filter(([, c]) => c && typeof (c as { value: unknown }).value === 'number').map(([p, c]) => [p, (c as { value: number }).value]))
  const effects = (list: string[]) => list.length ? esc(list.join('; ')) : '<span class="unk">???</span>'
  const relicTable = table('catalog-relics', [
    { head: 'Relic', cell: x => r(x.id, 'class') ? `${icon(x.icon)}${esc(x.name)}` : `${icon('cube')}<i>Unknown Relic</i>`, sort: x => r(x.id, 'class') ? x.name : 'zz' },
    ...TESTED.map((p): Col<typeof relics[number]> => ({ head: p, cell: x => cell(r(x.id, p), s.day), sort: x => sortOf(r(x.id, p)) })),
    { head: 'Class', cell: x => cell(r(x.id, 'class'), s.day), sort: x => sortOf(r(x.id, 'class')) },
    { head: 'At home', cls: 'wrap', cell: x => effects(homeEffects(knownProps(x.id))) },
    { head: 'On the belt', cls: 'wrap', cell: x => effects(beltEffects(knownProps(x.id))) },
    { head: 'Found by', cls: 'wrap', cell: x => { const who = r(x.id, 'finder'); return who && r(x.id, 'class') ? `<i ${tip(`"${x.quote}" (${who.value})`)}>"${esc(x.quote.slice(0, 28))}…" — ${esc(String(who.value))}</i>` : who ? esc(String(who.value)) : '' } },
  ], relics, 'No relics yet.')
  return `<h3>Relics</h3>${relicTable}<h3>Things</h3>${table('catalog-items', [
    { head: 'Name', cell: k => `${icon(k.icon)}${esc(k.name)}`, sort: k => k.name },
    { head: 'Size', cell: k => `${k.w}×${k.h}`, sort: k => k.w * k.h },
    col('Use', 'use', 'Learned by using it once.'),
    col('Keeps', 'spoil', 'Nights before it rots.'),
    col('Bait for', 'bait', 'Learned by luring something with it.'),
  ], known, 'Nothing catalogued yet.')}`
}

define({ id: 'catalog', title: 'Catalog', icon: UI.catalog, x: 260, y: 90, w: 640, h: 380, desktop: true, body: catalog })
