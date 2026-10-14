// The reader: a book opened over the page, two pages at a time. The text is cut into pages to fit the page size (chapters
// start on a new page; a paragraph that does not fit carries on overleaf). The open book sits on its cover; a page turns
// over the spine. Click the right page or press → to go on, the left page or ← to go back, Esc or outside to close.

import type { Book } from './books.ts'

type Page = { t: 'end' } | { t: 'title' } | { t: 'text'; html: string; n: number }

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
/** *italics*; an asterisk without its pair (a paragraph cut between pages) is just an asterisk. */
const inline = (t: string) => esc(t).replace(/\*([^*]+)\*/g, '<em>$1</em>')

/** A page's size, and its type size, which goes with it. */
const sizes = (w: number, h: number) => `--pw:${w}px;--ph:${h}px;--fs:${(w / 22).toFixed(2)}px`

let open: { el: HTMLElement; book: Book; pages: Page[]; spread: number; busy: boolean } | null = null

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
  if (!o || o.busy) return
  const to = o.spread + dir
  if (to < 0 || to * 2 >= o.pages.length) return
  o.busy = true
  const spread = o.el.querySelector<HTMLElement>('.spread')!
  const [front, back] = dir > 0 ? [o.pages[o.spread * 2 + 1], o.pages[to * 2]] : [o.pages[o.spread * 2], o.pages[to * 2 + 1]]
  const leaf = spread.appendChild(document.createElement('div'))
  leaf.className = `leaf ${dir > 0 ? 'fwd' : 'back'}`
  leaf.innerHTML = `<div class="face front page ${dir > 0 ? 'right' : 'left'}">${pageHtml(front, o.book)}</div><div class="face back page ${dir > 0 ? 'left' : 'right'}">${pageHtml(back, o.book)}</div>`
  // under the leaf, the page it uncovers is already there
  o.el.querySelector(dir > 0 ? '.page.right' : '.page.left')!.innerHTML = pageHtml(dir > 0 ? o.pages[to * 2 + 1] : o.pages[to * 2], o.book)
  const done = () => { o.spread = to; draw(); leaf.remove(); o.busy = false }
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return done()
  leaf.animate([{ transform: 'rotateY(0deg)' }, { transform: `rotateY(${dir > 0 ? -180 : 180}deg)` }], { duration: 620, easing: 'cubic-bezier(.45, .05, .35, 1)' }).onfinish = done
  for (const f of leaf.querySelectorAll('.face')) f.animate([{ '--shade': '0' }, { '--shade': '0.35' }, { '--shade': '0' }], { duration: 620 })
}

function close() {
  const o = open
  if (!o) return
  open = null
  o.el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160 }).onfinish = () => o.el.remove()
}

/** Open a book over the page, at its title. */
export function openReader(book: Book) {
  if (open) close()
  // two pages side by side, as large as fits the window, about as tall as a real book page
  let w = Math.min(340, Math.max(200, (innerWidth - 160) / 2)), h = Math.round(w * 1.45)
  if (h > innerHeight - 130) { h = innerHeight - 130; w = Math.round(h / 1.45) }
  const el = document.body.appendChild(document.createElement('div'))
  el.className = 'reader'
  el.style.cssText = `${sizes(w, h)};--cover:${book.cover}`
  el.innerHTML = `<div class="spread"><div class="page left" data-turn="-1"></div><div class="page right" data-turn="1"></div></div>
    <div class="reader-bar"><button data-turn="-1" title="Back (←)">‹</button><span data-where></span><button data-turn="1" title="On (→)">›</button><button data-close title="Close (Esc)">close</button></div>`
  open = { el, book, pages: paginate(book, w, h), spread: 0, busy: false }
  draw()
  el.querySelector('.spread')!.animate([{ opacity: 0, transform: 'translateY(14px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 240, easing: 'ease-out' })
  el.addEventListener('click', e => {
    const t = e.target as HTMLElement
    if (t === el || t.closest('[data-close]')) return close()
    const b = t.closest<HTMLElement>('[data-turn]')
    if (b) turn(+b.dataset.turn! as 1 | -1)
  })
}

// While a book is open, the keys are the book's: nothing reaches the field.
addEventListener('keydown', e => {
  if (!open) return
  e.stopImmediatePropagation()
  e.preventDefault()
  if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') turn(1)
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') turn(-1)
  else if (e.key === 'Escape') close()
}, true)
