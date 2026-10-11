// Papers: slips and messages pulled out of the terminal, floating over the views (IDEAS.md, "Floating windows"). A paper has
// three controls: close, pin (it stays in every view and in a save), fold (down to its top line, in the rack along the top edge).

import { jobOf, left, mailById, packed, when, type Mail } from './mail.ts'
import { termsHtml } from './terminal.ts'
import { find, type Paper, type State } from './world.ts'

export type View = 'board' | 'terminal'
export const paperKey = (p: Paper) => p.item !== undefined ? `i${p.item}` : `m${p.mail}`
export const shows = (p: Paper, view: View) => !!p.pinned || p.view === view

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
const paras = (t: string) => t.split('\n\n').map(p => `<p>${esc(p)}</p>`).join('')

/** The offer or message a paper shows, if any (a blank slip shows none). */
export function mailOf(s: State, p: Paper): Mail | undefined {
  if (p.mail !== undefined) return mailById(s, p.mail)
  const slip = p.item === undefined ? undefined : find(s, p.item)
  return slip && jobOf(s, slip)
}

/** What a paper is made of, its top line (all that shows folded), and the rest. */
function content(s: State, p: Paper): { material: 'card' | 'carbon' | 'print'; top: string; body: string } {
  const m = mailOf(s, p)
  if (p.item !== undefined) {
    const slip = find(s, p.item)!
    if (!m?.terms) return { material: 'card', top: 'blank slip', body: '<p>Nothing is printed on it.</p>' }
    const t = m.terms
    const pk = packed(s, slip)!
    const count = pk.lines.map(l => pk.packed ? `${l.want.short} ${l.have}/${l.want.n}` : `${l.want.short} ×${l.want.n}`).join(', ')
    const due = left(s, t.due)
    const done = pk.lines.every(l => l.have >= l.want.n)
    return {
      material: 'card',
      top: `${esc(t.to)} · ${count} · due ${when(t.due, true)}`,
      body: `<div class="slip-head"><b>JOB SLIP</b><span>№ ${m.id}</span></div>
        <table class="terms"><tr><th>for</th><td>${esc(m.from)}</td></tr>
        <tr><th>to</th><td>${esc(t.to)} · ${t.dist} h away</td></tr>
        ${pk.lines.map((l, i) => `<tr><th>${i ? '' : 'want'}</th><td>${l.want.n} × ${esc(l.want.label)}<span class="have ${l.have >= l.want.n ? 'full' : ''}">${pk.packed ? `${l.have}/${l.want.n}` : ''}</span></td></tr>`).join('')}
        <tr><th>by</th><td>${when(t.due)} <em class="${due ? '' : 'late'}">(${due ? `in ${due}` : 'overdue'})</em></td></tr>
        <tr><th>pay</th><td>${t.pay} cr</td></tr></table>
        <div class="slip-foot">${!pk.packed ? 'Not packed: put it in with the goods.' : done ? 'Packed: everything is here.' : 'Packed: some of it is still missing.'}</div>`,
    }
  }
  if (!m) return { material: 'print', top: 'a lost message', body: '' }
  if (m.type === 'bill') return {
    material: 'carbon',
    top: `${esc(m.from)}: ${m.amount} cr · due ${when(m.due!, true)}`,
    body: `<div class="slip-head"><b>${esc(m.from.toUpperCase())}</b><span>copy</span></div>${paras(m.body)}<div class="stamp">due ${when(m.due!)}</div>`,
  }
  return {
    material: 'print',
    top: esc(m.subject),
    body: `<div class="slip-head"><b>${esc(m.from)}</b><span>${when(m.at)}</span></div><p class="subj">${esc(m.subject)}</p>${paras(m.body)}${m.terms && m.type === 'offer' ? termsHtml(s, m) : ''}`,
  }
}

const PIN = '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M10.5 1.5l4 4-1.4.6-2.6 2.6.3 3.3-1.3 1.3-2.8-2.8L3 14.2l-1.2.1.1-1.2 3.7-3.7-2.8-2.8L4.1 5.3l3.3.3L10 3z"/></svg>'

/** A small tilt each paper keeps, so a pile looks like paper. */
const tilt = (key: string) => { let h = 0; for (const c of key) h = (h * 31 + c.charCodeAt(0)) | 0; return ((Math.abs(h) % 25) - 12) / 10 }

function paperHtml(s: State, p: Paper, z: number) {
  const key = paperKey(p)
  const c = content(s, p)
  const x = Math.max(-200, Math.min(innerWidth - 80, p.x)), y = Math.max(0, Math.min(innerHeight - 60, p.y))
  return `<div class="paper ${c.material} ${p.pinned ? 'pinned' : ''}" data-paper="${key}" style="left:${x}px;top:${y}px;z-index:${100 + z};--tilt:${tilt(key)}deg">
    ${p.pinned ? '<i class="pushpin"></i>' : ''}
    <div class="sheet"><div class="ctl"><button data-pfold="${key}" title="Fold: keep just the top line">–</button><button data-ppin="${key}" class="${p.pinned ? 'on' : ''}" title="${p.pinned ? 'Unpin' : 'Pin: keep it in view everywhere, and in a save'}">${PIN}</button><button data-pclose="${key}" title="Close">✕</button></div>
    <div class="top">${c.top}</div>${c.body}</div></div>`
}

/** Every paper this view shows: the open ones where they were left, the folded ones as tabs in the rack. */
export function papersHtml(s: State, view: View) {
  const list = (s.papers ?? []).map((p, i) => ({ p, i })).filter(({ p }) => shows(p, view))
  const open = list.filter(({ p }) => !p.folded).map(({ p, i }) => paperHtml(s, p, i)).join('')
  const folded = list.filter(({ p }) => p.folded)
  const tabs = folded.map(({ p }) => { const c = content(s, p); return `<button class="tab ${c.material}" data-unfold="${paperKey(p)}" title="Unfold">${p.pinned ? PIN : ''}<span>${c.top}</span></button>` }).join('')
  return open + (tabs ? `<div class="rack">${tabs}</div>` : '')
}
