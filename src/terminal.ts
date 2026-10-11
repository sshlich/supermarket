// The terminal: mail in its own view, beside the board (IDEAS.md, "Mail and drones: the first version"). Folders, a list
// of messages, and a reading pane where offers are accepted or declined and anything can be pulled out as a paper.

import { isOpen, left, slipFor, when, type Mail } from './mail.ts'
import { type State } from './world.ts'

export type Folder = 'inbox' | 'jobs' | 'archive'
export const FOLDERS: Record<Folder, string> = { inbox: 'Inbox', jobs: 'Jobs', archive: 'Archive' }

/** Looks to try the terminal in: the board's own text-mode look, Windows 98 in the board's colours, and plain Windows 98. */
export const SKINS = ['tui', 'dark98', '98'] as const
export type Skin = typeof SKINS[number]
const SKIN_NAMES: Record<Skin, string> = { tui: 'text mode', dark98: 'dark 98', '98': 'classic 98' }

export interface TermUi { folder: Folder; open: number | null; skin: Skin }

/** Which folder a message sits in: accepted jobs in Jobs; closed offers and archived messages in Archive; the rest in Inbox. */
export function folderOf(m: Mail): Folder {
  if (m.archived) return 'archive'
  if (m.type === 'offer') return m.state === 'accepted' ? 'jobs' : isOpen(m) ? 'inbox' : 'archive'
  return 'inbox'
}
/** A folder's messages, newest first. */
export const listOf = (s: State, f: Folder) => (s.mail ?? []).filter(m => folderOf(m) === f).sort((a, b) => b.at - a.at || b.id - a.id)
export const unread = (s: State) => (s.mail ?? []).filter(m => m.state === 'new').length

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
const paras = (t: string) => t.split('\n\n').map(p => `<p>${esc(p)}</p>`).join('')
const time = (tick: number) => when(tick).split(' · ')[1]

/** The short line under a message's subject: what it pays or costs, and how long is left. */
function meta(s: State, m: Mail): string {
  if (m.type === 'offer' && m.terms) {
    const pay = `${m.terms.pay} cr`
    if (isOpen(m)) return `${pay} · ${left(s, m.expires!) ?? 'closing'} to answer`
    if (m.state === 'accepted') return `${pay} · ${left(s, m.terms.due) ? `due in ${left(s, m.terms.due)}` : 'overdue'}`
    return `${pay} · ${m.state}`
  }
  if (m.type === 'bill') return `${m.amount} cr · due ${when(m.due!)}`
  return ''
}

function rowHtml(s: State, m: Mail, open: boolean) {
  const day = when(m.at).split(' · ')[0]
  return `<button class="msg ${m.state === 'new' ? 'new' : ''} ${open ? 'on' : ''}" data-msg="${m.id}"><i class="dot"></i><span class="type ${m.type}">${m.type}</span><span class="from">${esc(m.from)}</span><span class="at">${day} ${time(m.at)}</span><span class="subj">${esc(m.subject)}</span><span class="meta">${esc(meta(s, m))}</span></button>`
}

/** The terms of an offer, as a small table. */
export function termsHtml(s: State, m: Mail) {
  const t = m.terms!
  const due = left(s, t.due)
  return `<table class="terms">${t.want.map((w, i) => `<tr><th>${i ? '' : 'want'}</th><td>${w.n} × ${esc(w.label)}</td></tr>`).join('')}
    <tr><th>to</th><td>${esc(t.to)} · ${t.dist} h away</td></tr>
    <tr><th>by</th><td>${when(t.due)} <em class="${due ? '' : 'late'}">(${due ? `in ${due}` : 'overdue'})</em></td></tr>
    <tr><th>pay</th><td>${t.pay} cr</td></tr></table>`
}

function readHtml(s: State, m: Mail | undefined) {
  if (!m) return `<div class="read empty"><span>nothing selected</span></div>`
  const btn = (attr: string, label: string, title = '') => `<button ${attr}="${m.id}"${title ? ` title="${esc(title)}"` : ''}>${label}</button>`
  const pull = btn('data-pull', 'Pull out', 'Pull it out as a paper: pin it to keep it in view on the board')
  let note = '', acts = ''
  if (m.type === 'offer') {
    if (isOpen(m)) { note = `Open for ${left(s, m.expires!) ?? 'less than an hour'} more.`; acts = btn('data-accept', 'Accept', 'Its slip prints onto a free square of the board') + btn('data-decline', 'Decline') + pull }
    else if (m.state === 'accepted') { note = slipFor(s, m.id) ? 'Accepted. The slip is on your board.' : 'Accepted. The slip is gone.'; acts = (slipFor(s, m.id) ? btn('data-showslip', 'Show the slip') : '') + pull }
    else { note = m.state === 'expired' ? 'It closed before you answered.' : 'Declined.'; acts = pull }
  } else {
    if (m.type === 'bill') note = 'Credits come later: nothing can be paid yet.'
    acts = pull + (m.archived ? '' : btn('data-archive', 'Archive'))
  }
  const where = m.terms && m.terms.to !== m.from ? ` <span class="dim">(${esc(m.terms.to)})</span>` : ''
  return `<div class="read">
    <div class="head"><div><span class="k">from</span>${esc(m.from)}${where}</div><div><span class="k">sent</span>${when(m.at)}</div><div><span class="k">subject</span><b>${esc(m.subject)}</b></div></div>
    <div class="body">${paras(m.body)}${m.terms ? termsHtml(s, m) : ''}</div>
    ${note ? `<div class="note">${esc(note)}</div>` : ''}
    <div class="acts">${acts}</div>
  </div>`
}

export function terminalHtml(s: State, ui: TermUi) {
  const list = listOf(s, ui.folder)
  const open = (s.mail ?? []).find(m => m.id === ui.open && folderOf(m) === ui.folder)
  const tabs = (Object.keys(FOLDERS) as Folder[]).map(f => {
    const n = f === 'inbox' ? listOf(s, f).filter(m => m.state === 'new').length : listOf(s, f).length
    return `<button class="${f === ui.folder ? 'on' : ''}" data-folder="${f}">${FOLDERS[f]}${n ? ` <b>${n}</b>` : ''}</button>`
  }).join('')
  const jobs = listOf(s, 'jobs').length, offers = listOf(s, 'inbox').filter(isOpen).length
  return `<div class="term" data-skin="${ui.skin}"><div class="win">
    <div class="title"><span>Mail</span><span class="grow"></span><span class="clockline">${when(s.tick ?? 0)}</span><button class="x" data-view title="Back to the board (M or Esc)">✕</button></div>
    <div class="tabs">${tabs}</div>
    <div class="main">
      <div class="list">${list.map(m => rowHtml(s, m, m.id === open?.id)).join('') || `<div class="none">nothing here</div>`}</div>
      ${readHtml(s, open)}
    </div>
    <div class="status"><span>${unread(s)} new · ${offers} open offer${offers === 1 ? '' : 's'} · ${jobs} job${jobs === 1 ? '' : 's'}</span><span class="toast" data-toast></span><span class="grow"></span><button data-look title="Try another look for the terminal">look: ${SKIN_NAMES[ui.skin]}</button></div>
  </div></div>`
}
