// Settings (DESIGN 13.5-13.6): the CRT overlay and sound, both off to begin with.

import { place, setSound, thud } from '../art/sound.ts'
import { onChange, read, s, write } from './game.ts'
import { UI } from './icons.ts'
import { define } from './wm.ts'

const KEY = 'seam-settings-v1'
const prefs: { crt: boolean; sound: boolean } = { crt: false, sound: false, ...read(KEY) }
const apply = () => {
  document.body.classList.toggle('crt', prefs.crt)
  setSound(prefs.sound)
  const L = s.run ? s.levels[s.run.level] : null
  place(s.run?.level ?? 'seam', !!L && ['stair', 'hall'].includes(L.id) && (s.levels.hall?.N.choir ?? 0) > 0 && s.levels.hall.choirSilenced === undefined)
}
onChange(apply)
addEventListener('seam:night', () => { for (let i = 0; i < 3; i++) setTimeout(thud, 150 + i * 380) })

define({
  id: 'settings', title: 'Settings', icon: UI.settings, x: 520, y: 200, w: 300, h: 190,
  body: () => `
    <p class="field-row"><input type="checkbox" id="set-crt" data-on="crt" ${prefs.crt ? 'checked' : ''}><label for="set-crt">CRT: scanlines, curve, vignette</label></p>
    <p class="field-row"><input type="checkbox" id="set-sound" data-on="sound" ${prefs.sound ? 'checked' : ''}><label for="set-sound">Sound: the drone of where you are</label></p>
    <p class="empty">Motion follows your system's reduced-motion setting.</p>`,
  on: cmd => {
    if (cmd === 'crt') prefs.crt = !prefs.crt
    if (cmd === 'sound') prefs.sound = !prefs.sound
    write(KEY, prefs)
    apply()
  },
})

export const applySettings = apply
