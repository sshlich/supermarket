// The gallery (dev server only: /gallery.html). Every kind on its own patch of field, drawn the way the game draws it, with
// its footprint and a check of how well the drawing fills it (the rule of scripts/footprints.ts, measured in the browser, so
// it needs nothing installed). Or everything on one field, placed the way the game places things. Reloads when a sprite or an
// item changes.

import './style.css'
import './gallery.css'
import { firstFree, type Box } from './grid.ts'
import { KINDS, boxOf, cellsOf, dims, kindCells, quarter, type Item } from './world.ts'

const files = import.meta.glob<string>('./sprites/*.svg', { query: '?raw', import: 'default', eager: true })
const SPRITE: Record<string, string> = Object.fromEntries(Object.entries(files).map(([p, svg]) => [p.slice('./sprites/'.length, -'.svg'.length), svg]))
// Other versions of some sprites, to compare styles: src/sprites/styles/<style>/<kind>.svg. The game never loads these.
const styleFiles = import.meta.glob<string>('./sprites/styles/*/*.svg', { query: '?raw', import: 'default', eager: true })
const VERSIONS: Record<string, Record<string, string>> = {}
for (const [p, svg] of Object.entries(styleFiles)) {
  const [style, file] = p.slice('./sprites/styles/'.length).split('/')
  ;(VERSIONS[style] ??= {})[file.slice(0, -'.svg'.length)] = svg
}
const ORDER = ['simple', 'flat'] // most detailed first
const STYLES = ['drawn', ...Object.keys(VERSIONS).sort((a, b) => ((ORDER.indexOf(a) + 1) || 99) - ((ORDER.indexOf(b) + 1) || 99) || a.localeCompare(b))]
/** A kind's sprite in a style, falling back to the drawn one. */
const spriteOf = (kind: string, style: string) => VERSIONS[style]?.[kind] ?? SPRITE[kind]
const hasVersions = (kind: string) => STYLES.some(st => st !== 'drawn' && VERSIONS[st][kind])

if (import.meta.hot) {
  import.meta.hot.accept('./world.ts', () => location.reload())
  import.meta.hot.accept(() => location.reload())
}

const app = document.getElementById('gal')!
const ids = Object.keys(KINDS)
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')

/** What the page shows, remembered between visits. */
interface View { mode: 'cards' | 'field' | 'compare'; style: string; cell: number; rot: number; prints: boolean; check: boolean; group: boolean; q: string }
const SAVE = 'gallery-view'
const v: View = { mode: 'cards', style: 'drawn', cell: 34, rot: 0, prints: false, check: true, group: false, q: '', ...(() => { try { return JSON.parse(localStorage.getItem(SAVE) ?? '{}') } catch { return {} } })() }
v.cell = Math.max(14, Math.min(64, Math.round(+v.cell) || 34))
v.rot = quarter(v.rot)
if (!STYLES.includes(v.style)) v.style = 'drawn'
const keep = () => { try { localStorage.setItem(SAVE, JSON.stringify(v)) } catch { /* private window */ } }

/** One thing, the same markup the game uses (main.ts itemHtml), so the game's styles draw it: footprint squares, then the art. */
function itemHtml(it: Item, svg = spriteOf(it.kind, v.style)) {
  const k = KINDS[it.kind]
  const d = dims(it)
  const squares = cellsOf(it).map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1"/>`).join('')
  return `<div class="item" style="--x:${it.x};--y:${it.y};--w:${d.w};--h:${d.h};--c:${k.color}">
    <svg viewBox="0 0 ${d.w} ${d.h}"><g class="sq">${squares}</g><g class="hit"><title>${esc(k.name)}</title>${squares}</g></svg>
    <div class="art" style="--kw:${k.w};--kh:${k.h};--r:${quarter(it.rot) * 90}deg">${svg ?? ''}</div></div>`
}

/** A kind on a patch of field one square bigger all round, with what it is underneath. */
function card(id: string) {
  const k = KINDS[id]
  const it: Item = { id: 0, kind: id, x: 1, y: 1, rot: v.rot }
  const d = dims(it)
  const lines = [
    `${id} · ${k.w}×${k.h}${k.cells ? ` · ${k.cells.join('/')}` : ''}`,
    k.slots?.length ? `holds ${k.slots.map(s => `${s.name ? s.name + ' ' : ''}${s.w}×${s.h}${s.accepts?.length ? ` (${s.accepts.join(', ')})` : ''}`).join(', ')}` : '',
    k.machine ? `machine: ${k.machine}` : '',
  ].filter(Boolean)
  return `<figure class="card" style="--gw:${d.w + 2}" title="${esc(k.desc ?? '')}">
    <div class="grid" style="--w:${d.w + 2};--h:${d.h + 2}">${itemHtml(it)}</div>
    <figcaption><b><i style="background:${k.color}"></i>${esc(k.name)}</b>${lines.map(l => `<small>${esc(l)}</small>`).join('')}${k.tags?.length ? `<small class="tags">${k.tags.map(esc).join(', ')}</small>` : ''}${v.style !== 'drawn' && !VERSIONS[v.style]?.[id] ? `<small>no ${esc(v.style)} version: drawn one shown</small>` : ''}${spriteOf(id, v.style) ? `<small class="fit" data-fit="${id}" data-style="${VERSIONS[v.style]?.[id] ? v.style : 'drawn'}">measuring…</small>` : '<small class="fit off">no sprite yet</small>'}</figcaption>
  </figure>`
}

/** Every version of a kind side by side, each on its own patch with its own fit line. */
function compare(id: string) {
  const k = KINDS[id]
  const it: Item = { id: 0, kind: id, x: 1, y: 1, rot: v.rot }
  const d = dims(it)
  const one = (st: string) => VERSIONS[st]?.[id] || st === 'drawn'
    ? `<figure class="card" style="--gw:${d.w + 2}"><div class="grid" style="--w:${d.w + 2};--h:${d.h + 2}">${itemHtml(it, st === 'drawn' ? SPRITE[id] : VERSIONS[st][id])}</div><figcaption><b>${esc(st)}</b>${(st === 'drawn' ? SPRITE[id] : VERSIONS[st][id]) ? `<small class="fit" data-fit="${id}" data-style="${st}">measuring…</small>` : '<small class="fit off">no sprite yet</small>'}</figcaption></figure>`
    : `<figure class="card none" style="--gw:${d.w + 2}"><div class="grid" style="--w:${d.w + 2};--h:${d.h + 2}"></div><figcaption><b>${esc(st)}</b><small>not drawn in this style</small></figcaption></figure>`
  return `<section class="versions"><h2><i style="background:${k.color}"></i>${esc(k.name)} <small>${id} · ${k.w}×${k.h}</small></h2><div class="cards">${STYLES.map(one).join('')}</div></section>`
}

/** Everything on one field as wide as the window: biggest first, each in the first free spot, as `spawn` places things. */
function field(list: string[]) {
  const room = app.querySelector<HTMLElement>('[data-main]')!.clientWidth - 2 // the page's width inside its margins, less the rim
  const cols = Math.max(...list.map(id => Math.max(KINDS[id].w, KINDS[id].h)), Math.floor(room / v.cell))
  const taken: Box[] = []
  const items: Item[] = []
  for (const id of [...list].sort((a, b) => kindCells(b).length - kindCells(a).length)) {
    const spot = firstFree(cols, 4000, taken, boxOf({ id: 0, kind: id, x: 0, y: 0, rot: v.rot }))
    if (!spot) continue
    const n = items.length + 1
    taken.push({ ...spot.box, id: n, x: spot.x, y: spot.y })
    items.push({ id: n, kind: id, x: spot.x, y: spot.y, rot: spot.rot })
  }
  const rows = Math.max(1, ...taken.map(b => b.y + b.h))
  return `<div class="one"><div class="grid" style="--w:${cols};--h:${rows}">${items.map(it => itemHtml(it)).join('')}</div></div>`
}

// ---------------------------------------------------------------- the fit check

const IN = 0.15, OUT = 0.02, PX = 32 // as scripts/footprints.ts: taken squares 15%+ drawn, free ones under 2%, one pixel per unit
interface Fit { ok: boolean; low: number; high: number; map: string }
const measured = new Map<string, Promise<Fit | null>>()

/** Draw the sprite at one pixel per unit and add up its opacity over each square. */
function measure(id: string, svg: string): Promise<Fit | null> {
  const k = KINDS[id]
  const w = k.w * PX, h = k.h * PX
  const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
  doc.documentElement.setAttribute('width', String(w))
  doc.documentElement.setAttribute('height', String(h))
  const img = new Image()
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(doc).replace(/currentColor/g, '#fff'))}`
  return img.decode().then(() => {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const g = c.getContext('2d')!
    g.drawImage(img, 0, 0, w, h)
    const a = g.getImageData(0, 0, w, h).data
    const taken = new Set(kindCells(id).map(([x, y]) => `${x},${y}`))
    let ok = true, low = 1, high = 0
    const rows: string[] = []
    for (let y = 0; y < k.h; y++) {
      const row: string[] = []
      for (let x = 0; x < k.w; x++) {
        let sum = 0
        for (let py = y * PX; py < (y + 1) * PX; py++) for (let px = x * PX; px < (x + 1) * PX; px++) sum += a[(py * w + px) * 4 + 3]
        const f = sum / (PX * PX * 255), inside = taken.has(`${x},${y}`), good = inside ? f >= IN : f < OUT
        if (!good) ok = false
        if (inside) low = Math.min(low, f); else high = Math.max(high, f)
        row.push(`${inside ? '#' : '.'}${String(Math.round(f * 100)).padStart(3)}%${good ? ' ' : '!'}`)
      }
      rows.push(row.join(' '))
    }
    return { ok, low, high, map: rows.join('\n') }
  }, () => null)
}

/** Fill in each card's fit line (measured once per kind; hover it for the coverage of every square). */
function fits() {
  for (const el of app.querySelectorAll<HTMLElement>('[data-fit]')) {
    const id = el.dataset.fit!, st = el.dataset.style ?? 'drawn', key = `${st}:${id}`
    const svg = st === 'drawn' ? SPRITE[id] : VERSIONS[st]?.[id]
    if (!svg) continue
    if (!measured.has(key)) measured.set(key, measure(id, svg))
    measured.get(key)!.then(f => {
      if (!f) { el.textContent = 'could not draw it'; el.classList.add('off'); return }
      const pct = (n: number) => `${Math.round(n * 100)}%`
      el.classList.toggle('ok', f.ok)
      el.classList.toggle('off', !f.ok)
      el.textContent = `${f.ok ? 'fits' : 'off its footprint'} · thinnest ${pct(f.low)}, outside ${pct(f.high)}`
      el.title = `drawn per square (# taken, . free; ! breaks the rule)\n${f.map}`
    })
  }
}

// ---------------------------------------------------------------- the page

app.innerHTML = `<header><h1>Gallery <small data-count></small></h1><div class="tools">
  <span class="seg"><button data-mode="cards">one by one</button><button data-mode="field">one field</button>${STYLES.length > 1 ? '<button data-mode="compare">compare styles</button>' : ''}</span>
  ${STYLES.length > 1 ? `<span class="seg" data-styles title="which version to draw (one by one, one field)">${STYLES.map(st => `<button data-style="${st}">${st}</button>`).join('')}</span>` : ''}
  <label title="the size of a square">squares <input type="range" min="14" max="64" value="${v.cell}" data-cell><output data-cellout></output></label>
  <button data-turn title="turn everything a quarter clockwise (R)">turn <span data-rot></span></button>
  <label title="tint the squares each thing takes, as the game does when it is picked"><input type="checkbox" data-prints ${v.prints ? 'checked' : ''}> footprints</label>
  <label title="taken squares at least 15% drawn, free ones under 2% (the same rule as npm run footprints)"><input type="checkbox" data-check ${v.check ? 'checked' : ''}> fit check</label>
  <label><input type="checkbox" data-group ${v.group ? 'checked' : ''}> group by tag</label>
  <input type="search" placeholder="filter: name, id, tag" value="${esc(v.q)}" data-q>
</div></header><main data-main></main>`

function paint() {
  document.documentElement.style.setProperty('--cell', `${v.cell}px`)
  for (const b of app.querySelectorAll<HTMLElement>('[data-mode]')) b.classList.toggle('on', b.dataset.mode === v.mode)
  for (const b of app.querySelectorAll<HTMLElement>('[data-styles] [data-style]')) { b.classList.toggle('on', b.dataset.style === v.style); b.toggleAttribute('disabled', v.mode === 'compare') }
  app.querySelector('[data-rot]')!.textContent = `${v.rot * 90}°`
  app.querySelector('[data-cellout]')!.textContent = `${v.cell}px`
  const q = v.q.trim().toLowerCase()
  const all = v.mode === 'compare' ? ids.filter(hasVersions) : ids
  const list = q ? all.filter(id => [id, KINDS[id].name, KINDS[id].desc ?? '', ...(KINDS[id].tags ?? [])].some(s => s.toLowerCase().includes(q))) : all
  app.querySelector('[data-count]')!.textContent = v.mode === 'compare' ? `${list.length} kinds in ${STYLES.length} styles` : list.length === ids.length ? `${ids.length} kinds` : `${list.length} of ${ids.length} kinds`
  const main = app.querySelector<HTMLElement>('[data-main]')!
  main.classList.toggle('prints', v.prints)
  main.classList.toggle('nocheck', !v.check)
  if (!list.length) { main.innerHTML = '<p class="empty">nothing matches</p>'; return }
  if (v.mode === 'field') { main.innerHTML = field(list); return }
  if (v.mode === 'compare') { main.innerHTML = list.map(compare).join(''); fits(); return }
  if (!v.group) main.innerHTML = `<div class="cards">${list.map(card).join('')}</div>`
  else {
    const groups = new Map<string, string[]>()
    for (const id of list) { const t = KINDS[id].tags?.[0] ?? 'untagged'; groups.set(t, [...(groups.get(t) ?? []), id]) }
    main.innerHTML = [...groups].map(([t, g]) => `<section><h2>${esc(t)} <small>${g.length}</small></h2><div class="cards">${g.map(card).join('')}</div></section>`).join('')
  }
  fits()
}

const turnAll = () => { v.rot = quarter(v.rot + 1); keep(); paint() }
app.addEventListener('click', e => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('button')
  if (b?.dataset.mode) { v.mode = b.dataset.mode as View['mode']; keep(); paint() }
  else if (b?.dataset.style) { v.style = b.dataset.style; keep(); paint() }
  else if (b && 'turn' in b.dataset) turnAll()
})
app.addEventListener('input', e => {
  const t = e.target as HTMLInputElement
  if ('cell' in t.dataset) v.cell = +t.value
  else if ('q' in t.dataset) v.q = t.value
  else if ('prints' in t.dataset) v.prints = t.checked
  else if ('check' in t.dataset) v.check = t.checked
  else if ('group' in t.dataset) v.group = t.checked
  else return
  keep()
  paint()
})
addEventListener('keydown', e => {
  if ((e.key === 'r' || e.key === 'R') && !(e.target as HTMLElement).matches?.('input')) turnAll()
})
addEventListener('resize', () => { if (v.mode === 'field') paint() })
paint()
