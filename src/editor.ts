// The sprite editor: pick an item, edit its SVG, see it on the field exactly as the game draws it, save.
import './style.css'
import './editor.css'
import { KINDS } from './world.ts'

const UNIT = 32 // sprite units per cell (see scripts/sprite.ts)
const ids = Object.keys(KINDS)
const saved: Record<string, string> = {} // what is on disk
const draft: Record<string, string> = {} // what is in the editor
const color: Record<string, string> = Object.fromEntries(ids.map(id => [id, KINDS[id].color])) // preview only
let cur = ids[0]
let rot = false
let zoom = 56
let grid = { cells: true, units: false, box: true }

const root = document.getElementById('ed')!
const api = (path: string, kind: string, init?: RequestInit) => fetch(`/__sprites${path}?kind=${kind}`, init).then(r => r.ok ? r.text() : Promise.reject(new Error(`${r.status} ${r.statusText}`)))

/** Is this text an SVG the browser can draw? Returns the problem, or ''. */
function problem(text: string) {
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml')
  const err = doc.querySelector('parsererror')
  if (err) return err.textContent!.split('\n')[0]
  return doc.documentElement.tagName === 'svg' ? '' : 'the root element must be <svg>'
}

/** The field's own cell, so the stage looks like the game. */
function stageHtml(id: string, cell: number, pad: number, subgrid: boolean) {
  const k = KINDS[id]
  const w = rot ? k.h : k.w
  const h = rot ? k.w : k.h
  const cells = Array.from({ length: w * h }, (_, i) => `<rect x="${(i % w) + 0.1}" y="${Math.floor(i / w) + 0.1}" width="0.8" height="0.8" rx="0.08"/>`).join('')
  const lines: string[] = []
  if (subgrid) {
    const vw = k.w * UNIT, vh = k.h * UNIT
    if (grid.units) { for (let x = 0; x <= vw; x += UNIT / 4) if (x % UNIT) lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${vh}"/>`); for (let y = 0; y <= vh; y += UNIT / 4) if (y % UNIT) lines.push(`<line x1="0" y1="${y}" x2="${vw}" y2="${y}"/>`) }
    if (grid.cells) { for (let x = 0; x <= vw; x += UNIT) lines.push(`<line class="cell" x1="${x}" y1="0" x2="${x}" y2="${vh}"/>`); for (let y = 0; y <= vh; y += UNIT) lines.push(`<line class="cell" x1="0" y1="${y}" x2="${vw}" y2="${y}"/>`) }
    if (grid.box) lines.push(`<rect x="0" y="0" width="${vw}" height="${vh}"/>`)
  }
  return `<div class="grid" style="--cell:${cell}px;--w:${w + pad * 2};--h:${h + pad * 2}">
    <div class="item" style="--x:${pad};--y:${pad};--w:${w};--h:${h};--c:${color[id]}">
      <svg viewBox="0 0 ${w} ${h}"><g class="sq">${cells}</g></svg>
      <div class="art" data-art style="--kw:${k.w};--kh:${k.h};--r:${rot ? 90 : 0}deg">${draft[id] ?? ''}${subgrid ? `<svg class="sub" viewBox="0 0 ${k.w * UNIT} ${k.h * UNIT}">${lines.join('')}</svg>` : ''}</div>
    </div></div>`
}

const SNIPPETS: Record<string, (cx: number, cy: number) => string> = {
  rect: (cx, cy) => `<rect x="${cx - 16}" y="${cy - 16}" width="32" height="32" rx="2" fill="currentColor"/>`,
  circle: (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="14" fill="currentColor"/>`,
  line: (cx, cy) => `<line x1="${cx - 20}" y1="${cy}" x2="${cx + 20}" y2="${cy}" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`,
  polygon: (cx, cy) => `<polygon points="${cx},${cy - 18} ${cx + 16},${cy + 12} ${cx - 16},${cy + 12}" fill="currentColor"/>`,
  path: (cx, cy) => `<path d="M${cx - 18} ${cy + 10} Q${cx} ${cy - 24} ${cx + 18} ${cy + 10}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`,
  dim: (cx, cy) => `<rect x="${cx - 12}" y="${cy - 12}" width="24" height="24" fill="currentColor" opacity=".45"/>`,
}

function shell() {
  root.innerHTML = `
    <aside class="panel kinds"><h2>Items</h2>${ids.map(id => `<button data-kind="${id}"><span class="thumb" data-thumb="${id}"></span><span><b>${KINDS[id].name}</b><small>${KINDS[id].w} × ${KINDS[id].h}</small></span></button>`).join('')}</aside>
    <main class="panel view">
      <div class="bar">
        <label>zoom <input type="range" min="24" max="96" value="${zoom}" data-zoom></label>
        <label>colour <input type="color" data-color></label>
        <label><input type="checkbox" data-grid="cells" ${grid.cells ? 'checked' : ''}> cells</label>
        <label><input type="checkbox" data-grid="units" ${grid.units ? 'checked' : ''}> quarter-cells</label>
        <label><input type="checkbox" data-grid="box" ${grid.box ? 'checked' : ''}> footprint</label>
        <button data-rot>turn 90°</button>
      </div>
      <div class="stages"><div class="stage"><span>big, with guides</span><div data-big></div></div><div class="stage"><span>in game (${'22'}px cells)</span><div data-real></div></div></div>
      <div class="err" data-err></div>
      <p class="note">A sprite is a plain SVG. Its viewBox is the item's footprint: ${UNIT} units per cell, so a 4 × 2 item is 128 × 64. Draw with <code>currentColor</code> and it takes the item's accent. Save writes <code>src/sprites/&lt;item&gt;.svg</code>; the game tab updates by itself.</p>
    </main>
    <section class="panel code">
      <h2 data-title></h2>
      <div class="tools">${Object.keys(SNIPPETS).map(n => `<button data-add="${n}">+ ${n}</button>`).join('')}</div>
      <textarea spellcheck="false" data-src></textarea>
      <div class="acts"><button class="primary" data-save>Save (⌘S)</button><button data-revert>Revert</button><button data-reset>Start from original icon</button><span class="note" data-status></span></div>
    </section>`
}

const $ = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)!
const dirty = (id: string) => draft[id] !== saved[id]

function paint() {
  const k = KINDS[cur]
  $('[data-big]').innerHTML = stageHtml(cur, zoom, 1, true)
  $('[data-real]').innerHTML = stageHtml(cur, 22, 1, false)
  $<HTMLInputElement>('[data-color]').value = color[cur]
  $('[data-title]').textContent = `${k.name} · ${k.w} × ${k.h} cells · ${k.w * UNIT} × ${k.h * UNIT} units`
  const bad = problem(draft[cur])
  $('[data-err]').textContent = bad
  for (const b of root.querySelectorAll<HTMLElement>('.kinds button')) {
    b.classList.toggle('on', b.dataset.kind === cur)
    b.classList.toggle('dirty', dirty(b.dataset.kind!))
    const t = b.querySelector<HTMLElement>('.thumb')!
    t.style.setProperty('--c', color[b.dataset.kind!])
    t.innerHTML = draft[b.dataset.kind!] ?? ''
  }
}

function select(id: string) {
  cur = id
  $<HTMLTextAreaElement>('[data-src]').value = draft[id]
  paint()
}

/** Put an SVG snippet in front of </svg>, centred in the viewBox. */
function insert(name: string) {
  const ta = $<HTMLTextAreaElement>('[data-src]')
  const k = KINDS[cur]
  const at = ta.value.lastIndexOf('</svg>')
  if (at < 0) return
  ta.value = `${ta.value.slice(0, at)}  ${SNIPPETS[name](k.w * UNIT / 2, k.h * UNIT / 2)}\n${ta.value.slice(at)}`
  draft[cur] = ta.value
  paint()
}

async function save() {
  if (problem(draft[cur])) return
  const status = $('[data-status]')
  try {
    await api('/save', cur, { method: 'POST', body: draft[cur] })
    saved[cur] = draft[cur]
    status.textContent = 'saved'
    paint()
  } catch (e) { status.textContent = `not saved: ${(e as Error).message}` }
  setTimeout(() => { status.textContent = '' }, 2500)
}

root.addEventListener('click', async e => {
  const t = (e.target as HTMLElement).closest<HTMLElement>('button')
  if (!t) return
  if (t.dataset.kind) select(t.dataset.kind)
  else if (t.dataset.add) insert(t.dataset.add)
  else if ('save' in t.dataset) save()
  else if ('revert' in t.dataset) { draft[cur] = saved[cur]; select(cur) }
  else if ('reset' in t.dataset) { draft[cur] = await api('/reset', cur); select(cur) }
  else if ('rot' in t.dataset) { rot = !rot; paint() }
})
root.addEventListener('input', e => {
  const t = e.target as HTMLInputElement
  if (t.matches('[data-src]')) { draft[cur] = t.value; paint() }
  else if (t.matches('[data-zoom]')) { zoom = +t.value; paint() }
  else if (t.matches('[data-color]')) { color[cur] = t.value; paint() }
  else if (t.dataset.grid) { grid = { ...grid, [t.dataset.grid]: t.checked }; paint() }
})
addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save() }
})

shell()
Promise.all(ids.map(async id => { saved[id] = draft[id] = await api('', id) })).then(() => select(cur))
