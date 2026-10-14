// The reader: a book opened over the page (or in a window floating beside the field), two pages at a time. The text is cut into pages to fit the page size (chapters
// start on a new page; a paragraph that does not fit carries on overleaf). The open book sits on its cover; a page turns
// over the spine. Click the right page or press → to go on, the left page or ← to go back, Esc or outside to close.

import type { Book } from './books.ts'
import { gone } from './menu.ts'
import { handle } from './sound.ts'
import { esc } from './html.ts'

type Page = { t: 'end' } | { t: 'title' } | { t: 'text'; html: string; n: number }

/** *italics*; an asterisk without its pair (a paragraph cut between pages) is just an asterisk. */
const inline = (t: string) => esc(t).replace(/\*([^*]+)\*/g, '<em>$1</em>')

/** A page's size, and its type size, which goes with it. */
const sizes = (w: number, h: number) => `--pw:${w}px;--ph:${h}px;--fs:${(w / 22).toFixed(2)}px`

/** `turning`: a page in mid-turn, the leaf and the spread it lands on. */
let open: { el: HTMLElement; book: Book; pages: Page[]; spread: number; turning: { leaf: HTMLElement; to: number } | null } | null = null

/** Cut a book's text into pages of this size, measuring each page as it fills. */
function paginate(b: Book, w: number, h: number): Page[] {
  const probe = document.body.appendChild(document.createElement('div'))
  probe.className = 'reader-probe'
  probe.style.cssText = sizes(w, h)
  probe.innerHTML = `<div class="page"><div class="head">x</div><div class="body"></div><div class="folio">1</div></div>`
  const body = probe.querySelector<HTMLElement>('.body')!
  const fits = (html: string) => { body.innerHTML = html; return body.scrollHeight <= body.clientHeight + 1 }
  const texts: string[] = []
  let cur = ''
  const flush = () => { if (cur) texts.push(cur); cur = '' }
  let first = false
  for (const blk of b.blocks) {
    if ('h' in blk) { flush(); cur = `<h2>${inline(blk.h)}</h2>`; first = true; continue }
    let words = blk.p.split(' ')
    let cls = first ? 'first' : ''
    first = false
    while (words.length) {
      const para = (ws: string[], cut = false) => `<p class="${cls}${cut ? ' cut' : ''}">${inline(ws.join(' '))}</p>`
      if (fits(cur + para(words))) { cur += para(words); break }
      // as many words as fit on this page; the rest carries on overleaf, without an indent
      let lo = 0, hi = words.length
      while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (fits(cur + para(words.slice(0, mid), true))) lo = mid; else hi = mid - 1 }
      if (!lo && !cur) lo = 1 // a word longer than a page gets the page anyway
      if (lo) cur += para(words.slice(0, lo), true)
      flush()
      words = words.slice(lo)
      cls = 'cont'
    }
  }
  flush()
  probe.remove()
  const pages: Page[] = [{ t: 'end' }, { t: 'title' }, ...texts.map((html, i) => ({ t: 'text' as const, html, n: i + 1 }))]
  if (pages.length % 2) pages.push({ t: 'end' })
  return pages
}

function pageHtml(p: Page | undefined, b: Book) {
  if (!p || p.t === 'end') return '<div class="endpaper"></div>'
  if (p.t === 'title') return `<div class="title-page"><div class="t">${esc(b.title)}</div><div class="rule"></div>${b.author ? `<div class="a">${esc(b.author)}</div>` : ''}<div class="orn">&#10086;</div></div>`
  return `<div class="head">${esc(b.title)}</div><div class="body">${p.html}</div><div class="folio">${p.n}</div>`
}

/** What the bar under the book says: which pages are open. */
function where() {
  const o = open!
  const ns = [o.pages[o.spread * 2], o.pages[o.spread * 2 + 1]].flatMap(p => p?.t === 'text' ? [p.n] : [])
  const last = o.pages.reduce((n, p) => p.t === 'text' ? p.n : n, 0)
  return ns.length ? `${ns.join('–')} of ${last}` : o.spread ? 'the end' : 'title'
}

function draw() {
  const o = open!
  o.el.querySelector('.page.left')!.innerHTML = pageHtml(o.pages[o.spread * 2], o.book)
  o.el.querySelector('.page.right')!.innerHTML = pageHtml(o.pages[o.spread * 2 + 1], o.book)
  o.el.querySelector('[data-where]')!.textContent = where()
  o.el.querySelector<HTMLButtonElement>('[data-turn="-1"]')!.disabled = o.spread === 0
  o.el.querySelector<HTMLButtonElement>('[data-turn="1"]')!.disabled = o.spread * 2 + 2 >= o.pages.length
}

/** Turn a page: a leaf lifts off one side and falls over the spine, showing the next (or last) page on its back. */
function turn(dir: 1 | -1) {
  const o = open
  if (!o || o.turning) return
  const to = o.spread + dir
  if (to < 0 || to * 2 >= o.pages.length) return
  const spread = o.el.querySelector<HTMLElement>('.spread')!
  const [front, back] = dir > 0 ? [o.pages[o.spread * 2 + 1], o.pages[to * 2]] : [o.pages[o.spread * 2], o.pages[to * 2 + 1]]
  const leaf = spread.appendChild(document.createElement('div'))
  leaf.className = `leaf ${dir > 0 ? 'fwd' : 'back'}`
  const turning = o.turning = { leaf, to }
  leaf.innerHTML = `<div class="face front page ${dir > 0 ? 'right' : 'left'}">${pageHtml(front, o.book)}</div><div class="face back page ${dir > 0 ? 'left' : 'right'}">${pageHtml(back, o.book)}</div>`
  // under the leaf, the page it uncovers is already there
  o.el.querySelector(dir > 0 ? '.page.right' : '.page.left')!.innerHTML = pageHtml(dir > 0 ? o.pages[to * 2 + 1] : o.pages[to * 2], o.book)
  handle('paper', 'turn')
  // (the book may have been closed or laid out again meanwhile: then this turn is over already)
  const done = () => { if (open !== o || o.turning !== turning) return; o.spread = to; o.turning = null; draw(); leaf.remove() }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return done()
  leaf.animate([{ transform: 'rotateY(0deg)' }, { transform: `rotateY(${dir > 0 ? -180 : 180}deg)` }], { duration: 620, easing: 'cubic-bezier(.45, .05, .35, 1)' }).onfinish = done
  for (const f of leaf.querySelectorAll('.face')) f.animate([{ '--shade': '0' }, { '--shade': '0.35' }, { '--shade': '0' }], { duration: 620 })
}

function close() {
  const o = open
  if (!o) return
  open = null
  gone(o.el)
}

/**
 * Two ways to read: over the whole page (`full`), or in a window of its own that floats beside the field (`float`), moved
 * by its header, so you can read and work at once. Which, and where the window was, are remembered.
 */
type Mode = 'full' | 'float'
const remembered = <T>(key: string, fallback: T): T => { try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback } catch { return fallback } }
const keep = (key: string, v: unknown) => { try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* private window */ } }
let mode: Mode = remembered<Mode>('reader-mode', 'full')
const pos = remembered('reader-pos', { x: 24, y: 80 })

/** A page's width and height for a mode: as large as fits (full), or small enough to sit beside the field (float). */
function pageSize(m: Mode): [number, number] {
  if (m === 'float') { const w = Math.round(Math.min(230, Math.max(160, (innerWidth - 80) / 2))); return [w, Math.round(w * 1.45)] }
  let w = Math.min(340, Math.max(200, (innerWidth - 160) / 2)), h = Math.round(w * 1.45)
  if (h > innerHeight - 130) { h = innerHeight - 130; w = Math.round(h / 1.45) }
  return [w, h]
}

/** Build the reader for the current mode: pages cut to its size, at about the same place in the book as before. */
function layout() {
  const o = open!
  if (o.turning) { o.spread = o.turning.to; o.turning = null } // a page in mid-turn lands first, then the book is cut again
  const [w, h] = pageSize(mode)
  const before = o.pages.length
  o.pages = paginate(o.book, w, h)
  o.spread = before ? Math.min(Math.round(o.spread * o.pages.length / before), Math.ceil(o.pages.length / 2) - 1) : 0
  o.el.className = `reader ${mode}`
  o.el.style.cssText = `${sizes(w, h)};--cover:${o.book.cover}${mode === 'float' ? `;left:${pos.x}px;top:${pos.y}px` : ''}`
  const head = mode === 'float' ? `<div class="reader-head" data-grab><span>${esc(o.book.title)}</span><button data-mode title="Read over the whole page">full</button><button data-close title="Close">✕</button></div>` : ''
  const tail = mode === 'full' ? `<button data-mode title="Read in a window beside the field">float</button><button data-close title="Close (Esc)">close</button>` : ''
  o.el.innerHTML = `${head}<div class="spread"><div class="page left" data-turn="-1"></div><div class="page right" data-turn="1"></div></div>
    <div class="reader-bar"><button data-turn="-1" title="Back (←)">‹</button><span data-where></span><button data-turn="1" title="On (→)">›</button>${tail}</div>`
  draw()
  if (mode === 'float') keepOnScreen()
}
function keepOnScreen() {
  const r = open!.el.getBoundingClientRect()
  pos.x = Math.round(Math.max(8, Math.min(innerWidth - r.width - 8, pos.x)))
  pos.y = Math.round(Math.max(8, Math.min(innerHeight - r.height - 8, pos.y)))
  Object.assign(open!.el.style, { left: `${pos.x}px`, top: `${pos.y}px` })
}

/** Open a book at its title, the way it was last read. */
export function openReader(book: Book) {
  if (open) close()
  const el = document.body.appendChild(document.createElement('div'))
  open = { el, book, pages: [], spread: 0, turning: null }
  layout()
  handle('paper', 'use')
  el.animate([{ opacity: 0, transform: 'translateY(14px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: 'ease-out' })
  el.addEventListener('click', e => {
    const t = e.target as HTMLElement
    if ((t === el && mode === 'full') || t.closest('[data-close]')) return close()
    if (t.closest('[data-mode]')) { mode = mode === 'full' ? 'float' : 'full'; keep('reader-mode', mode); return layout() }
    const b = t.closest<HTMLElement>('[data-turn]')
    if (b) turn(+b.dataset.turn! as 1 | -1)
  })
  // the floating window moves by its header
  el.addEventListener('pointerdown', e => {
    const t = e.target as HTMLElement
    if (mode !== 'float' || !t.closest('[data-grab]') || t.closest('button')) return
    const dx = e.clientX - pos.x, dy = e.clientY - pos.y
    const move = (m: PointerEvent) => { pos.x = m.clientX - dx; pos.y = m.clientY - dy; keepOnScreen() }
    const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); el.classList.remove('grabbed'); keep('reader-pos', pos) }
    addEventListener('pointermove', move)
    addEventListener('pointerup', up)
    el.classList.add('grabbed')
    e.preventDefault()
  })
}

// While a book is open over the page, the keys are the book's: nothing reaches the field. Floating beside it, the book only
// takes the arrows (and page keys), and the field keeps the rest.
const TURNS: Record<string, 1 | -1> = { ArrowRight: 1, PageDown: 1, ' ': 1, ArrowLeft: -1, PageUp: -1 }
addEventListener('keydown', e => {
  if (!open || (mode === 'float' && (e.key === ' ' || !(e.key in TURNS)))) return
  e.stopImmediatePropagation()
  if (e.key in TURNS) { e.preventDefault(); turn(TURNS[e.key]) }
  else if (e.key === 'Escape') { e.preventDefault(); close() } // other keys still do what the browser does (reload, copy, tab)
}, true)
let resizing = 0
addEventListener('resize', () => { cancelAnimationFrame(resizing); resizing = requestAnimationFrame(() => { if (open?.el.isConnected) layout() }) })
