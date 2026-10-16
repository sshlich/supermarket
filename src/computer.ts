// A computer's screen and the system behind it: what the wired terminal shows in its window. Off, it is dark glass.
// Switched on, it boots (a few lines of BIOS, a check of the drives), then shows a desktop in the dark-98 look: icons for
// the drives and the programs it has, windows that move, a taskbar with what is running and how much memory is left.
//
// The machine has stats (its kind's `computer`: memory, disk, speed). Drive A: is the disc in its tray (read-only); C: is
// its own disk, kept on the machine (`item.drive`), so files go where the machine goes. Programs (programs.ts) load from a
// drive at its speed, slower on a machine slower than they want, and take memory while they run; there is only so much.
// What the screen is doing (boot, windows, what is loading) lives here, by machine, in memory: the window around it is
// redrawn with the field, and the screen is drawn again from this. A machine on after a reload is at its desktop.

import type { Disc } from './discs.ts'
import { esc } from './html.ts'
import { ICONS, PIC_SIZE, PROGRAMS, SYSTEM_DISK, SYSTEM_MEMORY, kb, picUrl, programFile, textSize, type Drive, type File, type Os, type Win } from './programs.ts'
import { find, KINDS, type Item, type Machine, type State } from './world.ts'

/** What the screen needs from the page. */
export interface Hooks {
  state(): State
  /** What is written on the disc in a machine's tray, if any. */
  disc(id: number): Disc | null
  /** Draw a machine's screen again. */
  repaint(id: number): void
  save(): void
  sound(name: 'key' | 'seek' | 'menu' | 'bad'): void
  /** Light up these things on the field, or none. */
  show(ids: number[] | null): void
}
let h: Hooks

/** A floppy holds 1440K and reads at 200K a second; the hard disk reads at 900K. */
const DISC_SIZE = 1440, FLOPPY = 200, HARD = 900

interface Busy { text: string; start: number; ms: number; tick: number; done: number }
/** `boot`: how many boot lines are shown (Infinity once at the desktop); `wins`: open windows, the last on top; `busy`: a program loading or a file copying (one thing at a time), `queue` what waits for it. */
interface Screen { boot: number; timer: number; wins: Win[]; pid: number; busy: Busy | null; queue: (() => void)[]; alert: { title: string; text: string } | null }
const screens = new Map<number, Screen>()
const fresh = (boot: number): Screen => ({ boot, timer: 0, wins: [], pid: 1, busy: null, queue: [], alert: null })
/** A machine that is on but has no screen yet (a reload) is at its desktop already. */
const screenOf = (id: number): Screen => screens.get(id) ?? (screens.set(id, fresh(Infinity)), screens.get(id)!)
const machine = (id: number) => find(h.state(), id)
const specOf = (it: Item | undefined): Machine => (it && KINDS[it.kind]?.computer) || { memory: 640, disk: 2048, speed: 8 }

/** The files on a drive as programs see them. */
function filesOn(id: number, d: Drive): File[] | null {
  if (d === 'A') {
    const disc = h.disc(id)
    if (!disc) return null
    return disc.files.map(f => { const prog = programFile(f.name); return prog ? { name: f.name, drive: 'A', size: prog.size, prog } : { name: f.name, drive: 'A', size: textSize(f.text), text: f.text } })
  }
  return (machine(id)?.drive ?? []).map((f): File => {
    const prog = f.prog ? PROGRAMS[f.prog] : undefined
    if (prog) return { name: f.name, drive: 'C', size: prog.size, prog }
    if (f.pic !== undefined) return { name: f.name, drive: 'C', size: PIC_SIZE, pic: f.pic }
    return { name: f.name, drive: 'C', size: textSize(f.text ?? ''), text: f.text ?? '' }
  })
}
const sizeOf = (id: number, d: Drive) => d === 'A' ? DISC_SIZE : specOf(machine(id)).disk
const usedOn = (id: number, d: Drive) => (d === 'C' ? SYSTEM_DISK : 0) + (filesOn(id, d) ?? []).reduce((n, f) => n + f.size, 0)
const memUsed = (sc: Screen) => SYSTEM_MEMORY + sc.wins.reduce((n, w) => n + PROGRAMS[w.prog].memory, 0)

/** The system as a program sees it, on machine `id`. */
function osFor(id: number): Os {
  const sc = screenOf(id)
  const os: Os = {
    id,
    spec: specOf(machine(id)),
    state: () => h.state(),
    files: d => filesOn(id, d),
    label: d => d === 'A' ? h.disc(id)?.label ?? 'EMPTY' : 'HARD DISK',
    used: d => ({ used: usedOn(id, d), size: sizeOf(id, d) }),
    memory: () => ({ system: SYSTEM_MEMORY, parts: sc.wins.map(w => ({ name: PROGRAMS[w.prog].name, k: PROGRAMS[w.prog].memory })), total: os.spec.memory }),
    write(name, data) {
      const it = machine(id)
      if (!it) return 'The machine is gone.'
      const list = it.drive ?? [], old = list.find(f => f.name === name)
      if (old?.prog) return `${name} is a program on C:. Choose another name.`
      const size = data.pic !== undefined ? PIC_SIZE : textSize(data.text ?? ''), was = old ? (old.pic !== undefined ? PIC_SIZE : textSize(old.text ?? '')) : 0
      const free = sizeOf(id, 'C') - usedOn(id, 'C')
      if (size - was > free) return `Not enough room on C: for ${name}. It needs ${kb(size)}; ${kb(free)} is free.`
      it.drive = [...list.filter(f => f.name !== name), { name, ...data }]
      h.save()
      return null
    },
    remove(name) {
      const it = machine(id)
      if (!it?.drive) return
      it.drive = it.drive.filter(f => f.name !== name)
      if (!it.drive.length) delete it.drive
      if (it.wall === name) delete it.wall
      h.save()
      os.repaint()
    },
    copy(name) {
      const f = filesOn(id, 'A')?.find(o => o.name === name)
      if (!f) return
      const it = machine(id), there = it?.drive?.find(o => o.name === name)
      if (there) return os.alert(`${name} is already on C:.`)
      const free = sizeOf(id, 'C') - usedOn(id, 'C')
      if (f.size > free) return os.alert(`Not enough room on C: for ${name}. It needs ${kb(f.size)}; ${kb(free)} is free.`)
      if (sc.busy) { sc.queue.push(() => os.copy(name)); return }
      const disc = h.disc(id)
      work(id, `Copying ${name} to C:`, f.size / FLOPPY * 1000, true, () => {
        if (h.disc(id) !== disc) return os.alert(`Copy failed: the disc was taken out of drive A:.`)
        const m = machine(id)
        if (!m) return
        m.drive = [...m.drive ?? [], f.prog ? { name, prog: f.prog.id } : f.pic !== undefined ? { name, pic: f.pic } : { name, text: f.text ?? '' }]
        h.save()
      })
    },
    open(f) {
      if (f.prog) return os.run(f.prog.id, f.drive)
      if (f.text !== undefined) return os.run('notepad', undefined, f)
      const paint = ['C', 'A'].map(d => filesOn(id, d as Drive)?.find(o => o.prog?.id === 'paint')).find(Boolean)
      if (!paint) return os.alert('Nothing on this machine opens pictures. PAINT.EXE would.')
      os.run('paint', paint.drive, f)
    },
    run(pid, from, file) {
      const p = PROGRAMS[pid]
      if (!p) return
      if (sc.busy) { sc.queue.push(() => os.run(pid, from, file)); return } // it waits its turn
      const free = os.spec.memory - memUsed(sc)
      if (p.memory > free) return os.alert(`Not enough memory to run ${p.file}. It needs ${p.memory}K; ${free}K is free. Close something first.`, 'Out of memory')
      if (p.licensed && !filesOn(id, 'A')?.some(f => f.prog?.id === pid)) return os.alert(`${p.file} is licensed. Put its original disc in drive A: to start it.`, 'Licence check')
      const slow = Math.max(1, p.speed / os.spec.speed)
      const ms = p.rom ? 150 : p.size / (from === 'A' ? FLOPPY : HARD) * 1000 * slow
      const disc = h.disc(id)
      work(id, `Loading ${p.file}${slow > 1 ? ' (slow machine)' : ''}`, ms, from === 'A', () => {
        if (from === 'A' && h.disc(id) !== disc) return os.alert('Error reading drive A:. The disc was taken out.')
        const n = sc.pid++
        sc.wins.push({ pid: n, prog: pid, x: Math.max(0, Math.min(640 - p.w, 64 + 26 * (n % 7))), y: Math.max(0, Math.min(458 - p.h, 14 + 22 * (n % 7))), st: p.start(os, file) })
        return n
      })
    },
    alert(text, title = 'WT-DOS') { sc.alert = { title, text }; h.sound('bad'); os.repaint() },
    close(w) { sc.wins = sc.wins.filter(o => o !== w); if (w.prog === 'stock') h.show(null); os.repaint() },
    repaint: () => h.repaint(id),
    wall(name) { const it = machine(id); if (!it) return; if (name) it.wall = name; else delete it.wall; h.save(); os.repaint() },
    wallName: () => machine(id)?.wall ?? null,
    sound: n => h.sound(n),
    show: ids => h.show(ids),
    windows: () => sc.wins,
  }
  return os
}

/**
 * The machine works on one thing for a while (a program loading, a file copying), with a bar on the taskbar; a floppy
 * whirrs. If what it did opened a window (`done` says which), that window takes the keys.
 */
function work(id: number, text: string, ms: number, floppy: boolean, done: () => number | void) {
  const sc = screenOf(id)
  if (floppy) h.sound('seek')
  const b: Busy = { text, start: performance.now(), ms, tick: 0, done: 0 }
  sc.busy = b
  let n = 0
  b.tick = window.setInterval(() => { if (floppy && ++n % 6 === 0) h.sound('seek'); h.repaint(id) }, 110)
  b.done = window.setTimeout(() => {
    clearInterval(b.tick)
    sc.busy = null
    const pid = done()
    h.repaint(id)
    if (pid) document.querySelector<HTMLElement>(`[data-screen="${id}"] .w98[data-pid="${pid}"] [data-focus]`)?.focus({ preventScroll: true })
    sc.queue.shift()?.()
  }, ms)
  h.repaint(id)
}
const stop = (sc: Screen) => { clearInterval(sc.timer); sc.queue = []; if (sc.busy) { clearInterval(sc.busy.tick); clearTimeout(sc.busy.done) } }

const bootLines = (spec: Machine, disc: Disc | null) => ['WT-2 PERSONAL TERMINAL', 'BIOS 1.07  WIRED SYSTEMS', '', `PROCESSOR ........... ${spec.speed} MHz`, `MEMORY TEST ......... ${spec.memory}K OK`, `HARD DISK C: ........ ${spec.disk}K`, `DRIVE A: ............ ${disc ? 'DISC' : 'NO DISC'}`, '', 'LOADING WT-DOS 3.1', 'STARTING DESKTOP']

/** One window: its title bar (minimise, close) and what its program draws in it. */
function winHtml(os: Os, w: Win, z: number, top: boolean) {
  const p = PROGRAMS[w.prog]
  return `<div class="w98${top ? ' active' : ''}" data-pid="${w.pid}" style="left:${w.x}px;top:${w.y}px;width:${p.w}px;height:${p.h}px;z-index:${z + 1}">
    <div class="w98-bar"><i>${p.icon}</i><span>${esc(p.title?.(w) ?? p.name)}</span><button data-os="min:${w.pid}" title="Minimise">_</button><button data-os="close:${w.pid}" title="Close">×</button></div>
    <div class="w98-body">${p.body(os, w)}</div></div>`
}

/** What the screen of machine `id` shows: nothing (off), the boot text, or the desktop with what is open on it. */
export function screenHtml(id: number, on: boolean): string {
  if (!on) return '<div class="display off"></div>'
  const sc = screenOf(id), it = machine(id), spec = specOf(it), disc = h.disc(id)
  const lines = bootLines(spec, disc)
  if (sc.boot < lines.length + 2) return `<div class="display boot">${lines.slice(0, sc.boot).map(l => esc(l) || '&nbsp;').join('<br>')}<span class="cur">_</span></div>`
  const os = osFor(id)
  const wall = it?.wall && it.drive?.find(f => f.name === it.wall)?.pic
  const installed = (filesOn(id, 'C') ?? []).filter(f => f.prog)
  const icon = (act: string, svg: string, label: string) => `<button class="d-icon" data-os="${act}"><i>${svg}</i><span>${esc(label)}</span></button>`
  const icons = [icon('drive:A', ICONS.floppy, 'A:'), icon('drive:C', ICONS.disk, 'C:'), icon('run:prompt', ICONS.prompt, 'Prompt'), icon('run:notepad', ICONS.notepad, 'Notepad'), icon('run:system', ICONS.system, 'System'),
    ...installed.map(f => icon(`open:${f.name}`, f.prog!.icon, f.prog!.name))].join('')
  const shown = sc.wins.filter(w => !w.min), top = shown[shown.length - 1]
  const windows = sc.wins.map((w, z) => w.min ? '' : winHtml(os, w, z, w === top)).join('')
  const alert = sc.alert ? `<div class="modal98"><div class="w98 active alert98"><div class="w98-bar"><span>${esc(sc.alert.title)}</span></div><div class="w98-body"><div class="err98"><b>!</b><span>${esc(sc.alert.text)}</span></div><div class="btns98"><button class="b98" data-os="ok">OK</button></div></div></div></div>` : ''
  const free = spec.memory - memUsed(sc)
  // the taskbar: what is running, in the order it was started (a button stays where it is), what is loading, memory left
  const busy = sc.busy ? `<span class="tb-busy"><span>${esc(sc.busy.text)}</span><i style="--p:${Math.min(1, (performance.now() - sc.busy.start) / sc.busy.ms).toFixed(3)}"></i></span>` : ''
  const tasks = [...sc.wins].sort((a, b) => a.pid - b.pid).map(w => `<button class="tb-task${w === top ? ' on' : ''}" data-os="task:${w.pid}"><i>${PROGRAMS[w.prog].icon}</i><span>${esc(PROGRAMS[w.prog].name)}</span></button>`).join('')
  return `<div class="display desk${wall ? ' walled' : ''}"${wall ? ` style="background-image:url(${picUrl(wall)})"` : ''}>
    <div class="d-icons">${icons}</div>${windows}${alert}
    <div class="taskbar"><span class="tb-os">WT-DOS</span><span class="tb-tasks">${tasks}</span>${busy}<span class="tb-tray" title="Memory free of ${spec.memory}K">${free}K free</span><span class="tb-tray">A: ${disc ? 'ready' : 'empty'}</span></div></div>`
}

/** Something of the system was pressed: a desktop icon, a window's minimise or close, a task on the taskbar, an alert's OK. */
function osAct(os: Os, sc: Screen, what: string) {
  const [verb, arg] = what.split(/:(.*)/)
  const w = sc.wins.find(o => o.pid === +arg)
  if (verb === 'ok') sc.alert = null
  else if (sc.alert) return
  else if (verb === 'drive') os.run('files', undefined, { name: '', drive: arg as Drive, size: 0 })
  else if (verb === 'run') os.run(arg)
  else if (verb === 'open') { const f = filesOn(os.id, 'C')?.find(o => o.name === arg); if (f) os.open(f) }
  else if (verb === 'close' && w) return os.close(w)
  else if (verb === 'min' && w) { w.min = true; if (w.prog === 'stock') h.show(null) }
  else if (verb === 'task' && w) {
    const shown = sc.wins.filter(o => !o.min)
    if (w.min) { w.min = false; sc.wins = [...sc.wins.filter(o => o !== w), w] }
    else if (shown[shown.length - 1] === w) w.min = true
    else sc.wins = [...sc.wins.filter(o => o !== w), w]
  }
  h.sound('menu')
  os.repaint()
}

/** The power switch was pressed: on, the machine boots a line at a time; off, it forgets what was running. */
export function power(id: number, on: boolean) {
  const old = screens.get(id)
  if (old) stop(old)
  if (!on) { screens.delete(id); return }
  const sc = fresh(0)
  screens.set(id, sc)
  const total = bootLines(specOf(machine(id)), h.disc(id)).length + 2
  sc.timer = window.setInterval(() => {
    sc.boot++
    if (sc.boot < total - 1) h.sound('key')
    if (sc.boot >= total) { clearInterval(sc.timer); sc.boot = Infinity }
    h.repaint(id)
  }, 240)
}

/** Forget the screens of machines that are gone or off (sold, cleared away), and stop whatever they were doing. */
export function prune(keep: (id: number) => boolean) {
  for (const [id, sc] of screens) if (!keep(id)) { stop(sc); screens.delete(id) }
}

// ---------------------------------------------------------------- the pointer and the keys, on a screen

/** The machine and its screen under an element, once it is at its desktop. */
function at(el: Element | null) {
  const glass = el?.closest<HTMLElement>('[data-screen]')
  const id = glass ? +glass.dataset.screen! : NaN
  const sc = screens.get(id)
  return sc && sc.boot === Infinity && machine(id) ? { id, sc, glass: glass!, os: osFor(id) } : null
}
const winAt = (sc: Screen, el: Element) => { const we = el.closest<HTMLElement>('[data-pid]'); return we ? sc.wins.find(w => w.pid === +we.dataset.pid!) ?? null : null }

/** Bring a window to the top without drawing the screen again (a click must land on what was pressed). */
function raise(sc: Screen, glass: HTMLElement, w: Win) {
  if (sc.wins[sc.wins.length - 1] === w) return
  sc.wins = [...sc.wins.filter(o => o !== w), w]
  sc.wins.forEach((o, z) => { const el = glass.querySelector<HTMLElement>(`.w98[data-pid="${o.pid}"]`); if (el) { el.style.zIndex = String(z + 1); el.classList.toggle('active', o === w) } })
  for (const t of glass.querySelectorAll<HTMLElement>('.tb-task')) t.classList.toggle('on', t.dataset.os === `task:${w.pid}`)
}

let showing = ''
const lastClick = { key: '', at: 0 }
export function initComputer(hooks: Hooks) {
  h = hooks
  document.addEventListener('click', e => {
    const t = e.target as HTMLElement, m = at(t)
    if (!m) return
    const ob = t.closest<HTMLElement>('[data-os]')
    if (ob) { osAct(m.os, m.sc, ob.dataset.os!); return }
    const a = t.closest<HTMLElement>('[data-act]'), w = winAt(m.sc, t)
    if (!a || !w || m.sc.alert) return
    // a second click on the same file opens it (counted here: the first click redraws the list, so the page sees no double-click)
    const f = t.closest<HTMLElement>('[data-open]'), key = f ? `${m.id}:${w.pid}:${f.dataset.open}` : ''
    if (key && key === lastClick.key && e.timeStamp - lastClick.at < 450) { lastClick.key = ''; PROGRAMS[w.prog].act?.(m.os, w, `open:${f!.dataset.open}`); return }
    lastClick.key = key; lastClick.at = e.timeStamp
    PROGRAMS[w.prog].act?.(m.os, w, a.dataset.act!)
  })
  document.addEventListener('contextmenu', e => {
    const t = e.target as HTMLElement, m = at(t)
    if (!m) return
    e.preventDefault()
    const a = t.closest<HTMLElement>('[data-alt]'), w = winAt(m.sc, t)
    if (a && w && !m.sc.alert) PROGRAMS[w.prog].act?.(m.os, w, a.dataset.alt!)
  })
  document.addEventListener('pointerdown', e => {
    const t = e.target as HTMLElement, m = at(t)
    if (!m || e.button !== 0) return
    const w = winAt(m.sc, t)
    if (!w || m.sc.alert) return
    raise(m.sc, m.glass, w)
    const scale = m.glass.getBoundingClientRect().width / 640
    let move: ((e: PointerEvent) => void) | void = undefined
    if (t.closest('.w98-bar') && !t.closest('button')) { // a window moves by its title bar, within the screen
      const x0 = w.x, y0 = w.y, cx = e.clientX, cy = e.clientY
      move = ev => {
        w.x = Math.round(Math.max(40 - PROGRAMS[w.prog].w, Math.min(600, x0 + (ev.clientX - cx) / scale)))
        w.y = Math.round(Math.max(0, Math.min(440, y0 + (ev.clientY - cy) / scale)))
        const el = m.glass.querySelector<HTMLElement>(`.w98[data-pid="${w.pid}"]`)
        if (el) Object.assign(el.style, { left: `${w.x}px`, top: `${w.y}px` })
      }
    } else {
      const p = t.closest<HTMLElement>('[data-press]')
      if (p) move = PROGRAMS[w.prog].press?.(m.os, w, p, e)
      if (!p) return
    }
    e.preventDefault()
    if (!move) return
    const up = () => { removeEventListener('pointermove', move as (e: PointerEvent) => void); removeEventListener('pointerup', up) }
    addEventListener('pointermove', move)
    addEventListener('pointerup', up)
  })
  document.addEventListener('input', e => {
    const t = e.target as HTMLInputElement, m = at(t), w = m && winAt(m.sc, t)
    if (w && t.dataset.in) w.st[t.dataset.in] = t.value
  })
  document.addEventListener('keydown', e => {
    const t = e.target as HTMLInputElement, m = at(t), w = m && winAt(m.sc, t)
    if (!m || !w || !t.dataset.in) return
    if (PROGRAMS[w.prog].key?.(m.os, w, e)) return
    if (e.key === 'Enter' && t.classList.contains('in98')) { e.preventDefault(); PROGRAMS[w.prog].act?.(m.os, w, 'save') }
  })
  // pointing at a line of the stocktake lights those things up on the field
  document.addEventListener('pointerover', e => {
    const t = e.target as HTMLElement, row = at(t) && t.closest<HTMLElement>('[data-things]')
    const key = row?.dataset.things ?? ''
    if (key === showing) return
    showing = key
    h.show(key ? key.split(',').map(Number) : null)
  })
}
