// The Aero layer (DESIGN 12.3, 13.4): the dead Authority's promotions, glossy and wrong. The boot splash, the pop-ups
// for new access, the brochures, and the terminal's screensaver. Everything else on the screen is dithered grit.

import { ADVERTS } from '../data/text.ts'
import { where } from '../model/containers.ts'
import { s } from './game.ts'
import { esc } from './ui.ts'

const em = (t: string) => esc(t).replace(/\*(.+?)\*/g, '<em>$1</em>')
const bubbles = () => Array.from({ length: 9 }, (_, i) => `<i style="--b:${i}"></i>`).join('')

/** A glossy panel over the desktop, until clicked away. */
export function aero(title: string, body: string, button = 'Continue') {
  document.querySelector('.aero-veil')?.remove()
  const el = document.body.appendChild(document.createElement('div'))
  el.className = 'aero-veil'
  el.innerHTML = `<div class="aero panel">${bubbles()}<span class="flare"></span><h1>${em(title)}</h1><p>${em(body)}</p><button class="pill">${esc(button)}</button></div>`
  el.addEventListener('click', e => { if ((e.target as HTMLElement).closest('.pill') || e.target === el) el.remove() })
}

/** The boot splash: shown while the reality layer is prepared, gone on a click or when it's ready. */
export function splash(): (min?: number) => Promise<void> {
  const el = document.body.appendChild(document.createElement('div'))
  el.className = 'aero-veil splash'
  const [brand, ...rest] = ADVERTS.splash.split(' · ')
  el.innerHTML = `<div class="aero sky">${bubbles()}<span class="flare"></span><h1>${esc(brand)}</h1><p>${rest.map(em).join('<br>')}</p><div class="loading"><b></b></div></div>`
  const shown = Date.now()
  let skip = false
  el.addEventListener('click', () => { skip = true })
  return async (min = 1600) => {
    while (!skip && Date.now() - shown < min) await new Promise(r => setTimeout(r, 50))
    el.classList.add('out')
    setTimeout(() => el.remove(), 400)
  }
}

/** Access rises: the Authority is delighted (READ and WRITE have their copy). */
addEventListener('seam:events', e => {
  for (const ev of (e as CustomEvent).detail as { kind: string; text: string }[])
    if (ev.kind === 'tier' && (ev.text === 'READ' || ev.text === 'WRITE')) aero(ev.text === 'READ' ? 'Welcome back, Citizen!' : 'Congratulations!', ADVERTS[ev.text].replace(/^(Welcome back, Citizen!|Congratulations!) /, ''))
})

/** Double-click a brochure to read it. */
addEventListener('dblclick', e => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('.box .item[data-id]')
  const at = el && where(s, +el.dataset.id!)
  if (at?.it.kind === 'brochure') aero('ACCRETION AUTHORITY', ADVERTS.brochures[((at.it.page ?? 1) - 1) % 4], 'Close')
})

/** A terminal nobody is using shows the Authority's screensaver. */
export const screensaver = () => `<div class="aero sky saver">${bubbles()}<span class="flare"></span><h1>ACCRETION AUTHORITY</h1><p><em>Building Tomorrow, Forever.</em></p></div>`
