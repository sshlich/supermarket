// STRATA/98 itself (DESIGN 13.1): desktop icons, draggable windows that remember where they were, the taskbar with
// the clock and End Day, a tray that pops MAINT balloons, Win98 tooltips, and the night falling over everything.

import { act, omni, onChange, read, restart, s, write } from './game.ts'
import { UI } from './icons.ts'
import { esc, icon, toggleSort } from './ui.ts'

export interface WinDef {
  id: string
  title: string
  icon: string
  x: number
  y: number
  w: number
  h: number
  body: () => string
  /** After each paint, for anything innerHTML can't do. */
  bind?: (body: HTMLElement) => void
  /** Clicks on [data-on="cmd:arg"] inside the window. */
  on?: (cmd: string, arg: string, el: HTMLElement) => void
  desktop?: boolean
  /** Open on a first visit. */
  start?: boolean
}

const defs = new Map<string, WinDef>()
export const define = (d: WinDef) => { defs.set(d.id, d) }

interface Geo { x: number; y: number; w: number; h: number; open: boolean; min: boolean }
const GEO = 'seam-ui-v1'
const geo: Record<string, Geo> = read(GEO) ?? {}
const saveGeo = () => write(GEO, geo)

let z = 10
let focused = ''
let busy = false
const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector<T>(sel)!
const winEl = (id: string) => document.querySelector<HTMLElement>(`.win[data-win="${id}"]`)
const wait = (ms: number) => new Promise(r => setTimeout(r, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms))

// ---------------------------------------------------------------- windows

export function open(id: string) {
  const d = defs.get(id)
  if (!d) return
  const g = geo[id] ??= { x: d.x, y: d.y, w: d.w, h: d.h, open: true, min: false }
  g.open = true
  g.min = false
  saveGeo()
  let el = winEl(id)
  if (!el) {
    el = document.createElement('div')
    el.className = 'win window opening'
    el.dataset.win = id
    el.innerHTML = `<div class="title-bar"><div class="title-bar-text">${icon(d.icon)}<span>${esc(d.title)}</span></div>
      <div class="title-bar-controls"><button aria-label="Minimize" data-min></button><button aria-label="Close" data-close></button></div></div>
      <div class="window-body"></div>`
    $('#desk').appendChild(el)
    // Remember a resize once the user lets go (the observer also fires while it happens).
    new ResizeObserver(() => { if (!el!.hidden) { g.w = el!.offsetWidth; g.h = el!.offsetHeight; saveGeo() } }).observe(el)
    el.addEventListener('animationend', () => el!.classList.remove('opening'), { once: true })
  }
  Object.assign(el.style, { left: `${g.x}px`, top: `${g.y}px`, width: `${g.w}px`, height: `${g.h}px` })
  el.hidden = false
  paint(id)
  focus(id)
}

function close(id: string, min = false) {
  const el = winEl(id)
  if (!el) return
  el.hidden = true
  geo[id].open = min
  geo[id].min = min
  saveGeo()
  if (focused === id) focused = ''
  tasks()
}

function focus(id: string) {
  const el = winEl(id)
  if (!el) return
  el.style.zIndex = String(++z)
  focused = id
  for (const w of document.querySelectorAll('.win .title-bar')) w.classList.toggle('inactive', w.parentElement !== el)
  tasks()
}

/** Redraw one window's contents, keeping its scroll. */
export function paint(id: string) {
  const el = winEl(id)
  const d = defs.get(id)
  if (!el || !d || el.hidden) return
  const body = el.querySelector<HTMLElement>('.window-body')!
  const top = body.scrollTop
  body.innerHTML = d.body()
  body.scrollTop = top
  d.bind?.(body)
}

function renderAll() {
  for (const id of defs.keys()) paint(id)
  tasks()
  const phase = ['dawn', 'day', 'dusk'][Math.min(2, Math.floor(s.step / 4))]
  $('.tray time').textContent = `Day ${s.day} · ${phase} · ${s.step}/12`
}

function tasks() {
  $('.tasks').innerHTML = [...defs.values()].filter(d => geo[d.id]?.open).map(d =>
    `<button class="task ${focused === d.id && !geo[d.id].min ? 'active' : ''}" data-task="${d.id}">${icon(d.icon)}<span>${esc(d.title)}</span></button>`).join('')
}

// ---------------------------------------------------------------- the night

async function endDay() {
  if (busy) return
  busy = true
  hideTip()
  const veil = $('.veil')
  veil.innerHTML = `<p>${icon(UI.night)}Night ${s.day}</p>`
  veil.classList.add('on')
  await wait(650)
  const ev = act({ type: 'endDay' })
  veil.innerHTML = `<p>Day ${s.day}</p>`
  await wait(500)
  veil.classList.remove('on')
  const said = s.log.filter(l => l.day === s.day - 1 && l.kind === 'maint').map(l => l.text)
  if (said.length) balloon(said)
  if (ev.some(e => e.kind === 'sweep')) document.body.animate([{ filter: 'none' }, { filter: 'invert(1) contrast(1.6)' }, { filter: 'none' }], { duration: 180 })
  busy = false
}

let balloonTimer = 0
function balloon(lines: string[]) {
  const b = $('.balloon')
  b.innerHTML = `<b>${icon(UI.maint)}MAINT</b>${lines.slice(0, 3).map(l => `<p>${esc(l)}</p>`).join('')}${lines.length > 3 ? `<p class="more">and ${lines.length - 3} more…</p>` : ''}`
  b.hidden = false
  b.classList.remove('in')
  void b.offsetWidth
  b.classList.add('in')
  clearTimeout(balloonTimer)
  balloonTimer = setTimeout(() => { b.hidden = true }, 9000)
}

// ---------------------------------------------------------------- tooltips

let tipFor: Element | null = null
function showTip(el: Element, e: PointerEvent) {
  const t = $('.tip')
  if (tipFor !== el) { t.textContent = (el as HTMLElement).dataset.tip!; tipFor = el }
  t.classList.add('on')
  const r = t.getBoundingClientRect()
  t.style.transform = `translate(${Math.min(e.clientX + 12, innerWidth - r.width - 4)}px, ${Math.min(e.clientY + 18, innerHeight - r.height - 4)}px)`
}
function hideTip() { $('.tip').classList.remove('on'); tipFor = null }

// ---------------------------------------------------------------- boot

export function boot() {
  const app = document.getElementById('app')!
  app.innerHTML = `
    <main id="desk">
      <nav class="icons">${[...defs.values()].filter(d => d.desktop).map(d => `<button class="icon" data-open="${d.id}">${icon(d.icon)}<span>${esc(d.title)}</span></button>`).join('')}</nav>
    </main>
    <footer class="taskbar">
      <button class="start" data-start>${icon(UI.start)}<b>STRATA</b>/98</button>
      <div class="tasks"></div>
      ${omni ? '<span class="omni" data-tip="?omniscient is on: every table shows the truth.">OMNISCIENT</span>' : ''}
      <button class="endday" data-endday>${icon(UI.night)}End Day</button>
      <div class="tray"><button class="tray-icon" data-open="maint" data-tip="MAINT">${icon(UI.maint)}</button><time></time></div>
    </footer>
    <div class="menu window" hidden>
      <div class="title-bar"><div class="title-bar-text">STRATA/98</div></div>
      <div class="window-body">
        ${[...defs.values()].map(d => `<button data-open="${d.id}">${icon(d.icon)}${esc(d.title)}</button>`).join('')}
        <hr><button data-new>${icon(UI.start)}New game…</button>
      </div>
    </div>
    <div class="tip"></div><div class="veil"></div><div class="balloon" data-open="maint" hidden></div>`

  const first = !Object.keys(geo).length
  for (const d of defs.values()) if (first ? d.start : geo[d.id]?.open && !geo[d.id].min) open(d.id)
  onChange(renderAll)
  renderAll()

  let press: { id: string; dx: number; dy: number } | null = null
  addEventListener('pointerdown', e => {
    const t = e.target as HTMLElement
    const w = t.closest<HTMLElement>('.win')
    if (w) focus(w.dataset.win!)
    if (!t.closest('.menu, [data-start]')) $('.menu').hidden = true
    const bar = t.closest('.win .title-bar')
    if (bar && !t.closest('button') && w) {
      press = { id: w.dataset.win!, dx: e.clientX - w.offsetLeft, dy: e.clientY - w.offsetTop }
      e.preventDefault()
    }
  })
  addEventListener('pointermove', e => {
    if (press) {
      const g = geo[press.id]
      const desk = $('#desk')
      g.x = Math.max(-g.w + 80, Math.min(desk.clientWidth - 80, e.clientX - press.dx))
      g.y = Math.max(0, Math.min(desk.clientHeight - 24, e.clientY - press.dy))
      Object.assign(winEl(press.id)!.style, { left: `${g.x}px`, top: `${g.y}px` })
      return
    }
    const el = (e.target as HTMLElement).closest?.('[data-tip]')
    if (document.body.classList.contains('dragging')) hideTip()
    else if (el) showTip(el, e)
    else if (tipFor) hideTip()
  })
  addEventListener('pointerup', () => { if (press) { saveGeo(); press = null } })

  addEventListener('click', e => {
    const t = e.target as HTMLElement
    const w = t.closest<HTMLElement>('.win')
    const on = t.closest<HTMLElement>('[data-on]')
    if (t.closest('[data-close]') && w) return close(w.dataset.win!)
    if (t.closest('[data-min]') && w) return close(w.dataset.win!, true)
    const sort = t.closest<HTMLElement>('[data-sort]')?.dataset.sort
    if (sort && w) { const [tb, col] = sort.split(':'); toggleSort(tb, +col); return paint(w.dataset.win!) }
    if (on && w) {
      const [cmd, ...arg] = on.dataset.on!.split(':')
      return defs.get(w.dataset.win!)?.on?.(cmd, arg.join(':'), on)
    }
    const task = t.closest<HTMLElement>('[data-task]')?.dataset.task
    if (task) return focused === task && !geo[task].min ? close(task, true) : open(task)
    if (t.closest('[data-start]')) { $('.menu').hidden = !$('.menu').hidden; return }
    if (t.closest('[data-endday]')) return void endDay()
    const again = t.closest<HTMLElement>('[data-new]')
    if (again) {
      // Asks twice, in place (no browser dialogs: they'd block the page).
      if (Date.now() - armed < 4000) { $('.menu').hidden = true; again.lastChild!.textContent = 'New game…'; return restart() }
      armed = Date.now()
      again.lastChild!.textContent = 'Sure? Click again. What you know is kept.'
      setTimeout(() => { again.lastChild!.textContent = 'New game…' }, 4000)
      return
    }
    const id = t.closest<HTMLElement>('[data-open]:not(.icon)')?.dataset.open
    if (id) { $('.menu').hidden = true; $('.balloon').hidden = true; open(id) }
  })
  // Desktop icons open on a double click, like the real thing.
  addEventListener('dblclick', e => {
    const id = (e.target as HTMLElement).closest<HTMLElement>('.icon[data-open]')?.dataset.open
    if (id) open(id)
  })
  addEventListener('keydown', e => { if (e.key === 'Escape') $('.menu').hidden = true })
}

let armed = 0
