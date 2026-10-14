// The menu (Esc, or the button in the top left corner): a few plain controls. Sound effects on and off and their volume;
// music (none yet); strict handling; the debug panel; a new game. And the debug panel itself: a window that floats over
// the page (moved by its header, where it was left), with money and the field at the top and every kind of thing below,
// by category, one row each, with a button per variant (an apple or a synthetic one, a bottle empty or full of something).
// main.ts hands in what the controls do.

import { AGE_DAYS, KINDS, LIQUIDS, look, swatch } from './world.ts'
import { setVolume, shop, soundOn, toggleSound, volume } from './sound.ts'

export interface Hooks {
  strict(): boolean
  toggleStrict(): void
  /** Put a new thing on the field; false if there is no room. `liquid`: a vessel filled with it, or `''` empty. */
  spawn(kind: string, props: Record<string, string>, liquid?: string, age?: number): boolean
  addCash(n: number): void
  clearField(): void
  newGame(): void
}
let hooks: Hooks
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
const stored = <T>(key: string, fallback: T): T => { try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback } catch { return fallback } }

// ---------------------------------------------------------------- the menu

/**
 * Take an overlay away: it stops catching clicks at once and fades; it is removed when the fade ends or shortly after
 * anyway (a tab in the background never finishes its animations, and an invisible overlay must not be left on top).
 */
export function gone(el: HTMLElement) {
  el.style.pointerEvents = 'none'
  el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' }).onfinish = () => el.remove()
  setTimeout(() => el.remove(), 200)
}

let menu: HTMLElement | null = null
let sure = 0 // a new game needs a second click within a few seconds

function menuHtml() {
  const row = (label: string, control: string, note = '') => `<div class="mrow"><span>${label}${note ? `<small>${note}</small>` : ''}</span><span class="mctl">${control}</span></div>`
  return `<div class="menu-box"><div class="menu-title">menu<button data-m="close" title="Close (Esc)">✕</button></div>
    ${row('sound effects', `<button data-m="sound" class="${soundOn ? 'on' : ''}">${soundOn ? 'on' : 'off'}</button><input data-m="volume" type="range" min="0" max="100" value="${Math.round(volume * 100)}" ${soundOn ? '' : 'disabled'} aria-label="Volume">`)}
    ${row('music', '<button disabled>none yet</button>')}
    ${row('strict handling', `<button data-m="strict" class="${hooks.strict() ? 'on' : ''}">${hooks.strict() ? 'on' : 'off'}</button>`, 'things only go where they fit; S')}
    ${row('debug', '<button data-m="debug">open</button>', 'spawn things, money')}
    ${row('new game', `<button data-m="new" class="${sure ? 'warn' : ''}">${sure ? 'sure? click again' : 'start over'}</button>`, 'empties the shop')}
    <div class="menu-foot">Esc closes</div></div>`
}
const redrawMenu = () => { if (menu) menu.innerHTML = menuHtml() }

export const menuOpen = () => !!menu
export function toggleMenu() {
  shop('menu')
  if (menu) { const m = menu; menu = null; gone(m); return }
  sure = 0
  menu = document.body.appendChild(document.createElement('div'))
  menu.className = 'menu'
  menu.innerHTML = menuHtml()
  menu.querySelector('.menu-box')!.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 160, easing: 'ease-out' })
  menu.addEventListener('click', e => {
    const t = e.target as HTMLElement
    if (t === menu) return toggleMenu()
    const what = t.closest<HTMLElement>('[data-m]')?.dataset.m
    if (what === 'close') return toggleMenu()
    if (what === 'sound') { toggleSound(); shop('menu') }
    else if (what === 'strict') hooks.toggleStrict()
    else if (what === 'debug') { toggleMenu(); return openDebug() }
    else if (what === 'new') {
      if (!sure) { sure = window.setTimeout(() => { sure = 0; redrawMenu() }, 3000) }
      else { clearTimeout(sure); sure = 0; hooks.newGame(); return toggleMenu() }
    } else return
    redrawMenu()
  })
  menu.addEventListener('input', e => { const t = e.target as HTMLInputElement; if (t.dataset.m === 'volume') setVolume(+t.value / 100) })
  menu.addEventListener('change', e => { if ((e.target as HTMLElement).dataset.m === 'volume') shop('menu') }) // hear the new level
}
// While the menu is open, Esc closes it and nothing else reaches the page.
addEventListener('keydown', e => {
  if (!menu) return
  e.stopImmediatePropagation()
  if (e.key === 'Escape') toggleMenu()
}, true)

// ---------------------------------------------------------------- the debug panel

/** Category order; anything else comes after, by name. */
const CATS = ['food', 'sundries', 'medicine', 'tools', 'storage', 'furniture', 'tech']
let debug: HTMLElement | null = null
const pos = stored('debug-pos', { x: 16, y: 56 })

/** One row per kind: its colour, name, size and price, then a button per variant. */
function debugHtml() {
  const kinds = Object.entries(KINDS)
  const cats = [...new Set(kinds.map(([, k]) => k.cat ?? 'other'))].sort((a, b) => ((CATS.indexOf(a) + 1) || 99) - ((CATS.indexOf(b) + 1) || 99) || a.localeCompare(b))
  const rows = (id: string) => {
    const k = KINDS[id]
    const [prop, vals] = Object.entries(k.props ?? {})[0] ?? []
    const variants: { label: string; props: Record<string, string>; liquid?: string; age?: number; c: string }[] =
      prop ? Object.keys(vals).map(v => { const it = { id: 0, kind: id, x: 0, y: 0, rot: 0, props: { [prop]: v } }; return { label: vals[v].name ?? v, props: { [prop]: v }, c: swatch(it) } })
      : k.holds && !k.liquid ? ['', ...(k.liquids ?? Object.keys(LIQUIDS))].map(l => ({ label: l ? LIQUIDS[l].name : 'empty', props: {}, liquid: l, c: l ? LIQUIDS[l].color : k.color }))
      : k.ages ? [{ label: 'fresh', props: {}, c: k.color }, { label: 'aged', props: {}, age: AGE_DAYS + 2, c: '#e8932e' }]
      : [{ label: 'spawn', props: {}, c: k.color }]
    const buttons = variants.map(v => `<button data-kind="${id}" data-props="${esc(JSON.stringify(v.props))}"${v.liquid !== undefined ? ` data-liquid="${v.liquid}"` : ''}${v.age ? ` data-age="${v.age}"` : ''} style="--c:${v.c}"><i></i>${esc(v.label)}</button>`).join('')
    return `<div class="drow"><i style="background:${look({ id: 0, kind: id, x: 0, y: 0, rot: 0 }).colors[k.color.toLowerCase()] ?? k.color}"></i><b title="${esc(k.desc ?? '')}">${esc(k.name)}</b><small>${k.w}×${k.h}</small><small>${k.price ?? 0}$</small><span class="dvars">${buttons}</span></div>`
  }
  const spawn = kinds.length ? cats.map(c => `<div class="dcat">${esc(c)}</div>${kinds.filter(([, k]) => (k.cat ?? 'other') === c).map(([id]) => rows(id)).join('')}`).join('')
    : '<div class="dnote">no kinds yet: <a href="/editor.html">make one in the editor</a></div>'
  return `<div class="dhead" data-grab><span>debug</span><button data-d="close" title="Close">✕</button></div>
    <div class="dbody"><div class="dline"><span>money</span><button data-d="cash">+100$</button></div>
    <div class="dline"><span>field</span><button data-d="clear">clear the field</button></div>
    <div class="dcat">spawn <small>on the field, first free spot</small></div>${spawn}</div>`
}

function keepOnScreen() {
  const r = debug!.getBoundingClientRect()
  pos.x = Math.round(Math.max(8 - r.width + 80, Math.min(innerWidth - 80, pos.x)))
  pos.y = Math.round(Math.max(8, Math.min(innerHeight - 40, pos.y)))
  Object.assign(debug!.style, { left: `${pos.x}px`, top: `${pos.y}px` })
}

export function openDebug() {
  if (debug) { debug.animate([{ transform: 'scale(1.03)' }, { transform: 'none' }], { duration: 200 }); return }
  debug = document.body.appendChild(document.createElement('div'))
  debug.className = 'debug'
  debug.innerHTML = debugHtml()
  keepOnScreen()
  debug.addEventListener('click', e => {
    const t = e.target as HTMLElement
    const b = t.closest<HTMLElement>('button')
    if (!b) return
    if (b.dataset.d === 'close') { debug!.remove(); debug = null; return }
    if (b.dataset.d === 'cash') return hooks.addCash(100)
    if (b.dataset.d === 'clear') return hooks.clearField()
    if (b.dataset.kind && !hooks.spawn(b.dataset.kind, JSON.parse(b.dataset.props || '{}'), b.dataset.liquid, Number(b.dataset.age) || undefined)) b.animate([{ transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'none' }], { duration: 200 })
  })
  debug.addEventListener('pointerdown', e => {
    const t = e.target as HTMLElement
    if (!t.closest('[data-grab]') || t.closest('button')) return
    const dx = e.clientX - pos.x, dy = e.clientY - pos.y
    const move = (m: PointerEvent) => { pos.x = m.clientX - dx; pos.y = m.clientY - dy; keepOnScreen() }
    const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); debug?.classList.remove('grabbed'); try { localStorage.setItem('debug-pos', JSON.stringify(pos)) } catch { /* private window */ } }
    addEventListener('pointermove', move)
    addEventListener('pointerup', up)
    debug!.classList.add('grabbed')
    e.preventDefault()
  })
}

/** Wire up the menu: what its controls do, and the button in the corner that opens it. */
export function initMenu(h: Hooks) {
  hooks = h
  const b = document.body.appendChild(document.createElement('button'))
  b.className = 'menu-btn'
  b.title = 'Menu (Esc)'
  b.innerHTML = '&#8801; menu'
  b.addEventListener('click', toggleMenu)
}
