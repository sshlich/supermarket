// Small pieces every window uses: icons, tooltips, knowledge cells, sortable tables, bars and sparklines.

import type { Cell } from '../model/state.ts'

const files = import.meta.glob<string>('../icons/*.svg', { query: '?raw', import: 'default', eager: true })
const ICONS: Record<string, string> = Object.fromEntries(Object.entries(files).map(([p, svg]) => [p.slice('../icons/'.length, -'.svg'.length), svg]))
export const icon = (name: string) => ICONS[name] ?? ''
export const svg = icon

export const esc = (t: string | number) => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
/** A Win98 tooltip: plain text, newlines kept. */
export const tip = (t: string) => `data-tip="${esc(t)}"`

// ---------------------------------------------------------------- knowledge cells (13.1)

const FROM: Record<string, string> = {
  rumour: 'from a rumour in the Seam', seen: 'seen on a run', READ: 'read at a terminal', feed: "from MAINT's feed",
  lab: 'tested in the lab', bolt: 'a bolt found it', hazard: 'found the hard way', belt: 'felt on the belt',
  omniscient: 'debug: omniscient', home: 'the Seam knows it', harvest: 'from a kill', fight: 'from a fight', used: 'from using it',
}

/** ??? in dithered grey, rough in italics with its age, exact plain. Every cell says where it came from. */
export function cell(c: Cell | undefined, today: number, show: (v: Cell['value']) => string = v => esc(String(v))): string {
  if (!c) return `<span class="unk" ${tip('Unknown. Watch, test, read terminals, or take risks.')}>???</span>`
  const age = c.day < today ? `<small> · d${c.day}</small>` : ''
  const t = tip(`${c.state === 'exact' ? 'Exact' : 'Rough'}, ${FROM[c.src] ?? c.src}, day ${c.day}.`)
  return c.state === 'rough' ? `<i class="rough" ${t}>${show(c.value)}${age}</i>` : `<span class="exact" ${t}>${show(c.value)}${age}</span>`
}

/** A cell's value for sorting: unknowns sort last. */
export const sortOf = (c: Cell | undefined) => c === undefined ? undefined : typeof c.value === 'number' ? c.value : String(c.value)

// ---------------------------------------------------------------- tables

export interface Col<R> { head: string; cell: (r: R) => string; sort?: (r: R) => number | string | undefined; tip?: string; cls?: string }
const sorts: Record<string, { col: number; dir: 1 | -1 }> = {}
export function toggleSort(table: string, col: number) {
  const o = sorts[table]
  sorts[table] = { col, dir: o?.col === col ? (-o.dir as 1 | -1) : 1 }
}

/** A sunken, sortable table. Click a header to sort; again to reverse. Unknowns always sort last. */
export function table<R>(id: string, cols: Col<R>[], rows: R[], empty = 'Nothing here yet.'): string {
  const o = sorts[id]
  const sorted = o && cols[o.col]?.sort ? [...rows].sort((a, b) => {
    const [x, y] = [cols[o.col].sort!(a), cols[o.col].sort!(b)]
    if (x === undefined || y === undefined) return x === y ? 0 : x === undefined ? 1 : -1
    return (x < y ? -1 : x > y ? 1 : 0) * o.dir
  }) : rows
  const head = cols.map((c, i) => `<th ${c.sort ? `data-sort="${id}:${i}"` : ''} ${c.tip ? tip(c.tip) : ''} class="${c.cls ?? ''}">${c.head}${o?.col === i ? (o.dir > 0 ? ' ▴' : ' ▾') : ''}</th>`).join('')
  const body = sorted.length ? sorted.map(r => `<tr>${cols.map(c => `<td class="${c.cls ?? ''}">${c.cell(r)}</td>`).join('')}</tr>`).join('')
    : `<tr><td colspan="${cols.length}" class="empty">${empty}</td></tr>`
  return `<div class="sunken-panel"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`
}

// ---------------------------------------------------------------- small graphics

/** A segmented gauge, the way a 1998 terminal draws ██░░. */
export const blocks = (v: number, max: number, width = 4) => {
  const n = Math.max(0, Math.min(width, Math.round(v / max * width)))
  return `<span class="blocks">${'<i class="on"></i>'.repeat(n)}${'<i></i>'.repeat(width - n)}</span>`
}

/** A tiny line of the last sightings. */
export function spark(trail: [number, number][] | undefined): string {
  if (!trail || trail.length < 2) return ''
  const pts = trail.slice(-16)
  const max = Math.max(1, ...pts.map(p => p[1]))
  const [d0, d1] = [pts[0][0], pts.at(-1)![0]]
  const xy = pts.map(([d, n]) => `${(d1 === d0 ? 0 : (d - d0) / (d1 - d0) * 40).toFixed(1)},${(11 - n / max * 10).toFixed(1)}`).join(' ')
  return `<svg class="spark" viewBox="0 0 40 12" preserveAspectRatio="none"><polyline points="${xy}"/></svg>`
}

/** Rising, falling or steady since the sighting before last. */
export function trend(trail: [number, number][] | undefined): string {
  if (!trail || trail.length < 2) return ''
  const [a, b] = [trail.at(-2)![1], trail.at(-1)![1]]
  const r = a === 0 ? (b > 0 ? 2 : 1) : b / a
  return r > 1.1 ? `<b class="up" ${tip(`Up from ${a} to ${b}.`)}>▲</b>` : r < 0.9 ? `<b class="down" ${tip(`Down from ${a} to ${b}.`)}>▼</b>` : `<span ${tip('Steady.')}>▬</span>`
}
