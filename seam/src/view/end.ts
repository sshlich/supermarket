// How a game ends (DESIGN 4.2-4.3): through day 30 the Seam holds, and play goes on; buried or emptied, it falls, and
// years later another pocket finds the old terminal (a new game that keeps the Catalog).

import { onChange, restart, s } from './game.ts'
import { UI } from './icons.ts'
import { esc } from './ui.ts'
import { close, define, open } from './wm.ts'

// What's already been shown: a reload into a held or fallen Seam doesn't show it again.
let shown = s.end ?? (s.flags.held ? 'held' : '')
onChange(() => {
  const now = s.end ?? (s.flags.held ? 'held' : '')
  if (now && now !== shown) open('end')
  if (!now) close('end') // a new game: nothing to announce
  shown = now
})

function body() {
  const people = s.villagers.length
  if (!s.end) return `<div class="endcard"><h2>The Seam holds. For now.</h2>
    <p>Day ${s.day - 1} is over. ${people} ${people === 1 ? 'person is' : 'people are'} still here, and the Masons are ${Math.floor(s.burial)}% of the way to closing the gap.</p>
    <p>The world goes on. So can you.</p><p><button data-on="close">Keep going</button></p></div>`
  const why = s.end === 'buried' ? 'The Masons closed the gap between -213 and -214. The Seam is a wall now.' : 'There is nobody left in the Seam.'
  return `<div class="endcard fell"><h2>The Seam has fallen.</h2><p>${esc(why)}</p>
    <p><i>Years later, another pocket finds the old terminal. Everything this one learned is still in it.</i></p>
    <p><button data-on="again">Begin again</button></p></div>`
}

define({
  id: 'end', title: 'STRATA/98', icon: UI.maint, x: 470, y: 220, w: 440, h: 230, body,
  on: cmd => {
    if (cmd === 'again') restart()
    if (cmd === 'close') close('end')
  },
})
