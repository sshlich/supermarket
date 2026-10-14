// A computer's screen: what the wired terminal shows in its window. Off, it is dark glass. Switched on, it boots (a few
// lines of BIOS, a check of the drive), then shows a small desktop in the dark-98 look: one icon, the A: drive, and a
// taskbar. Opening A: reads the disc in the tray and lists its files; a file opens in a viewer. What the screen is doing
// lives here, by machine, in memory: the window around it is redrawn with the field, and the screen is drawn again from this.

import type { Disc } from './discs.ts'
import { esc } from './html.ts'


/** `boot`: how many boot lines are shown (Infinity once at the desktop); `drive`: A: is open; `file`: the file being read. */
interface Screen { boot: number; drive: boolean; reading: boolean; file: string | null; timer: number }
const screens = new Map<number, Screen>()
/** A machine that is on but has no screen yet (a reload) is at its desktop already. */
const screenOf = (id: number): Screen => screens.get(id) ?? (screens.set(id, { boot: Infinity, drive: false, reading: false, file: null, timer: 0 }), screens.get(id)!)

const bootLines = (disc: Disc | null) => ['WT-2 PERSONAL TERMINAL', 'BIOS 1.07  WIRED SYSTEMS', '', 'MEMORY TEST ........ 640K OK', `DRIVE A: ........... ${disc ? 'DISC' : 'NO DISC'}`, '', 'STARTING DESKTOP']

const FLOPPY = '<svg viewBox="0 0 16 16"><path d="M2 1.5h10l2.5 2.5v10.5h-12.5z" fill="#3a4a66" stroke="#0d1018" stroke-width=".6"/><rect x="4.5" y="1.5" width="6" height="4.5" fill="#c6ccd4"/><rect x="8" y="2.2" width="1.6" height="3" fill="#2a2e36"/><rect x="3.5" y="8.5" width="9" height="5.5" fill="#e6e0d0"/></svg>'
const PAGE = '<svg viewBox="0 0 16 16"><path d="M3 1h7l3 3v11H3z" fill="#e8e4da" stroke="#2a2a30" stroke-width=".6"/><path d="M10 1v3h3" fill="#c8c2b4" stroke="#2a2a30" stroke-width=".6"/><path d="M5 6.5h6M5 8.5h6M5 10.5h4" stroke="#6a7088" stroke-width=".8"/></svg>'

/** One window on the screen, in the dark-98 look: a title bar with its close box, a sunken body. */
const win = (id: number, cls: string, title: string, close: string, body: string) => `<div class="w98 ${cls}"><div class="w98-bar"><span>${title}</span><button data-pc="${id}" data-act="${close}" title="Close">×</button></div><div class="w98-body">${body}</div></div>`

/** What the screen of machine `id` shows: nothing (off), the boot text, or the desktop with what is open on it. */
export function screenHtml(id: number, on: boolean, disc: Disc | null): string {
  if (!on) return '<div class="display off"></div>'
  const sc = screenOf(id)
  const lines = bootLines(disc)
  if (sc.boot < lines.length + 2) return `<div class="display boot">${lines.slice(0, sc.boot).map(l => esc(l) || '&nbsp;').join('<br>')}<span class="cur">_</span></div>`
  let windows = ''
  if (sc.drive) {
    const title = `A:\\${disc ? ` &nbsp;${esc(disc.label)}` : ''}`
    const body = sc.reading ? '<div class="w98-note">Reading A:...</div>'
      : !disc ? `<div class="w98-err"><b>!</b><span>A:\\ is not accessible.<br>The device is not ready.</span></div><div class="w98-btns"><button data-pc="${id}" data-act="close-drive">OK</button></div>`
      : disc.files.map(f => `<button class="w98-file" data-pc="${id}" data-act="file:${esc(f.name)}"><i>${PAGE}</i><span>${esc(f.name)}</span><small>${new Blob([f.text]).size} B</small></button>`).join('') + `<div class="w98-status">${disc.files.length} file${disc.files.length === 1 ? '' : 's'}</div>`
    windows += win(id, 'explorer', title, 'close-drive', body)
  }
  const file = sc.file && disc?.files.find(f => f.name === sc.file)
  if (file) windows += win(id, 'viewer', `${esc(file.name)} - Notepad`, 'close-file', `<pre>${esc(file.text)}</pre>`)
  return `<div class="display desk"><button class="d-icon" data-pc="${id}" data-act="drive"><i>${FLOPPY}</i><span>A:</span></button>${windows}
    <div class="taskbar"><span class="start">&#9635; Start</span><span class="tb-tray">A: ${disc ? 'ready' : 'empty'}</span></div></div>`
}

/** The power switch was pressed: on, the machine boots a line at a time (`repaint` draws the screen again); off, it forgets. */
export function power(id: number, on: boolean, disc: Disc | null, repaint: () => void, tick: () => void) {
  const old = screens.get(id)
  if (old) clearInterval(old.timer)
  if (!on) { screens.delete(id); return }
  const sc: Screen = { boot: 0, drive: false, reading: false, file: null, timer: 0 }
  screens.set(id, sc)
  const total = bootLines(disc).length + 2
  sc.timer = window.setInterval(() => {
    sc.boot++
    if (sc.boot < total - 1) tick()
    if (sc.boot >= total) { clearInterval(sc.timer); sc.boot = Infinity }
    repaint()
  }, 260)
}

/** Forget the screens of machines that are gone or off (sold, cleared away), and stop any that were still booting. */
export function prune(keep: (id: number) => boolean) {
  for (const [id, sc] of screens) if (!keep(id)) { clearInterval(sc.timer); screens.delete(id) }
}

/**
 * Something on the screen was clicked: the A: icon opens the drive (it reads for a moment if there is a disc), a file opens
 * in the viewer, the close boxes close. `seek` is the drive's sound; `repaint` draws the screen again.
 */
export function act(id: number, what: string, disc: Disc | null, repaint: () => void, seek: () => void) {
  const sc = screenOf(id)
  if (what === 'drive') {
    sc.drive = true
    if (disc) { sc.reading = true; seek(); setTimeout(() => { sc.reading = false; repaint() }, 650) }
  } else if (what === 'close-drive') { sc.drive = false; sc.file = null }
  else if (what === 'close-file') sc.file = null
  else if (what.startsWith('file:')) sc.file = what.slice(5)
  repaint()
}
