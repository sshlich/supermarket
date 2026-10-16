// A computer's screen and the system behind it: what the wired terminal shows in its window. Off, it is dark glass.
// Switched on, it boots (a few lines of BIOS, a check of the drives), then shows a desktop in the dark-98 look: icons for
// the drives and the programs it has, windows that move, a taskbar with what is running and how much memory is left.
//
// The machine has stats (its kind's `computer`: memory, disk, speed). Drive A: is the disc in its tray (read-only); C: is
// its own disk, kept on the machine (`item.drive`), so files go where the machine goes. Programs (programs.ts) load from a
// drive at its speed, slower on a machine slower than they want, and take memory while they run; there is only so much.
// What the screen is doing (boot, windows, what is loading) lives here, by machine, in memory: the window around it is
// redrawn with the field, and the screen is drawn again from this. A machine on after a reload is at its desktop.

import type { Goods } from './customers.ts'
import type { Disc } from './discs.ts'
import { esc } from './html.ts'
import { BREAD } from './fill.ts'
import { ICONS, PIC_SIZE, PROGRAMS, SYSTEM_DISK, SYSTEM_MEMORY, kb, picUrl, programFile, textSize, type Drive, type File, type Os, type Win } from './programs.ts'
import { find, KINDS, type Item, type Machine, type Print, type State } from './world.ts'

/** What the screen needs from the page. */
export interface Hooks {
  state(): State
  /** What is written on the disc in a machine's tray, if any. */
  disc(id: number): Disc | null
  /** Draw a machine's screen again. */
  repaint(id: number): void
  save(): void
  sound(name: 'key' | 'seek' | 'menu' | 'bad' | 'startup' | 'dial' | 'print'): void
  /** Light up these things on the field, or none. */
  show(ids: number[] | null): void
  /** The shop's money, and paying from it (false if there is not enough). */
  cash(): number
  pay(n: number): boolean
  /** A thing's sprite as the field draws it, as it would be made. */
  art(g: Goods): string
  /** The printer plugged into a machine, if any; and a sheet off it (false if there was no room for it). */
  printer(id: number): Item | undefined
  printed(printer: Item, job: Print): boolean
}
let h: Hooks

/** A floppy holds 1440K and reads at 200K a second; the hard disk reads at 900K. */
const DISC_SIZE = 1440, FLOPPY = 200, HARD = 900

/** `prog`: the program loading, whose splash shows while it does. */
interface Busy { text: string; start: number; ms: number; tick: number; done: number; prog?: string }
/** `on`: when it was switched on (the boot plays from then); `wins`: open windows, the last on top; `busy`: a program loading or a file copying (one thing at a time), `queue` what waits for it. */
interface Screen { on: number; timer: number; wins: Win[]; pid: number; busy: Busy | null; queue: (() => void)[]; alert: { title: string; text: string } | null; online: boolean; idle: number; saver: boolean }
const screens = new Map<number, Screen>()
/** When each machine was switched off, for the picture collapsing to a dot. */
const offs = new Map<number, number>()
const fresh = (on: number): Screen => ({ on, timer: 0, wins: [], pid: 1, busy: null, queue: [], alert: null, online: false, idle: performance.now(), saver: false })
/** A machine that is on but has no screen yet (a reload) is at its desktop already. */
const screenOf = (id: number): Screen => screens.get(id) ?? (screens.set(id, fresh(-Infinity)), screens.get(id)!)
/** The boot, in ms from the switch: the tube warms up, the BIOS checks the machine, the system's splash, then the desktop. */
const WARM = 900, POST = 2500, SPLASH = 2300, BOOT = WARM + POST + SPLASH
const booted = (sc: Screen) => performance.now() - sc.on >= BOOT
const machine = (id: number) => find(h.state(), id)
const specOf = (it: Item | undefined): Machine => (it && KINDS[it.kind]?.computer) || { memory: 640, disk: 2048, speed: 8 }

/** The files on a drive as programs see them. */
function filesOn(id: number, d: Drive): File[] | null {
  if (d === 'A') {
    const disc = h.disc(id)
    if (!disc) return null
    return disc.files.map((f): File => {
      const prog = programFile(f.name)
      if (prog) return { name: f.name, drive: 'A', size: prog.size, prog }
      return f.pic !== undefined ? { name: f.name, drive: 'A', size: PIC_SIZE, pic: f.pic } : { name: f.name, drive: 'A', size: textSize(f.text), text: f.text }
    })
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
      os.run(f.text !== undefined ? 'notepad' : 'pictures', undefined, f)
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
      }, pid)
    },
    alert(text, title = 'WT-DOS') { sc.alert = { title, text }; h.sound('bad'); os.repaint() },
    close(w) { sc.wins = sc.wins.filter(o => o !== w); if (w.prog === 'stock') h.show(null); os.repaint() },
    repaint: () => h.repaint(id),
    wall(name) { const it = machine(id); if (!it) return; if (name) it.wall = name; else delete it.wall; h.save(); os.repaint() },
    wallName: () => machine(id)?.wall ?? null,
    sound: n => h.sound(n),
    show: ids => h.show(ids),
    windows: () => sc.wins,
    program: pid => PROGRAMS[pid],
    online: () => sc.online,
    connect: () => { sc.online = true },
    download(name, data, size, rate) {
      if (sc.busy) { sc.queue.push(() => os.download(name, data, size, rate)); return }
      if (machine(id)?.drive?.some(f => f.name === name)) return os.alert(`${name} is already on C:.`)
      const free = sizeOf(id, 'C') - usedOn(id, 'C')
      if (size > free) return os.alert(`Not enough room on C: for ${name}. It needs ${kb(size)}; ${kb(free)} is free.`)
      work(id, `Downloading ${name}`, size / rate * 1000, false, () => {
        if (!sc.online) return os.alert(`The line dropped. ${name} did not arrive.`)
        const err = os.write(name, data)
        if (err) os.alert(err)
      })
    },
    cash: () => h.cash(),
    pay(n, what) {
      if (!h.pay(n)) return false
      const s = h.state(), web = s.web ??= {}
      web.log = [...web.log ?? [], { day: s.day ?? 1, text: what, amount: -n }].slice(-30)
      h.save()
      return true
    },
    art: g => h.art(g),
    saver: () => { sc.saver = true; os.repaint() },
    print(job, title) {
      if (sc.busy) { sc.queue.push(() => os.print(job, title)); return }
      const pr = h.printer(id)
      if (!pr) return os.alert('No printer is plugged in. Drop a printer on this computer to plug it in.', 'Print')
      if (!((pr.paper ?? 0) > 0)) return os.alert('The printer is out of paper. Drop a ream of paper on it.', 'Print')
      h.sound('print')
      work(id, `Printing ${title}`, 2600, false, () => { if (!h.printed(pr, job)) os.alert('The printout had nowhere to go: the field is full.', 'Print') })
    },
    save: () => h.save(),
  }
  return os
}

/**
 * The machine works on one thing for a while (a program loading, a file copying), with a bar on the taskbar; a floppy
 * whirrs. If what it did opened a window (`done` says which), that window takes the keys.
 */
function work(id: number, text: string, ms: number, floppy: boolean, done: () => number | void, prog?: string) {
  const sc = screenOf(id)
  if (floppy) h.sound('seek')
  const b: Busy = { text, start: performance.now(), ms, tick: 0, done: 0, prog }
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

// ---------------------------------------------------------------- the boot, after the old machines'

/** The BIOS's lines, each with when it appears (ms into the check); the memory counts up to what there is, then says OK. */
function postLines(spec: Machine, disc: Disc | null, t: number) {
  const mem = t < 300 ? 0 : Math.min(spec.memory, Math.floor((t - 300) / 1200 * spec.memory / 16) * 16)
  return ([
    [0, 'WT-2 Personal Terminal'],
    [0, 'BIOS 1.07  (C) Wired Systems'],
    [0, ''],
    [200, `Processor   : WT-86 at ${spec.speed} MHz`],
    [300, `Memory test : ${String(mem).padStart(4)}K${mem >= spec.memory ? ' OK' : ''}`],
    [0, ''],
    [1650, `Hard disk C: ${spec.disk}K`],
    [1850, `Drive A:     ${disc ? `disc, "${disc.label}"` : 'no disc'}`],
    [0, ''],
    [2150, 'Starting WT-DOS ...'],
  ] as [number, string][]).filter(([at]) => t >= at).map(([, l]) => l)
}
/** The maker's mark, top right of the BIOS screen: a tube with a bolt in it. */
const MARK = '<svg viewBox="0 0 80 40"><rect x="2" y="2" width="36" height="28" rx="5" fill="none" stroke="#8fe0a6" stroke-width="2.5"/><path d="M22 7l-7 11h6l-3 9 9-13h-6l3-7z" fill="#8fe0a6"/><path d="M14 30v5h12v-5" fill="none" stroke="#8fe0a6" stroke-width="2.5"/><text x="44" y="16" fill="#8fe0a6" font-size="9" font-family="monospace" font-weight="700">WIRED</text><text x="44" y="27" fill="#5fae76" font-size="6.5" font-family="monospace">SAVES</text><text x="44" y="35" fill="#5fae76" font-size="6.5" font-family="monospace">POWER</text></svg>'
/** The splash: a view out of a station window (stars, a planet's edge), the system's name, and the bar that slides along the bottom. */
function splashHtml() {
  let r = 7, stars = ''
  const rand = () => (r = (r * 16807) % 2147483647) / 2147483647
  for (let i = 0; i < 90; i++) stars += `<i style="left:${(rand() * 640).toFixed(0)}px;top:${(rand() * 330).toFixed(0)}px;opacity:${(0.25 + rand() * 0.75).toFixed(2)}${rand() < 0.15 ? ';width:2px;height:2px' : ''}"></i>`
  return `<div class="display splash"><div class="stars">${stars}</div><div class="planet"></div>
    <div class="logo"><svg viewBox="0 0 40 32"><rect x="1.5" y="1.5" width="30" height="23" rx="4" fill="#16141a" stroke="#d8d4cc" stroke-width="2"/><path d="M7 9l5 4-5 4" fill="none" stroke="#8fe0a6" stroke-width="2"/><rect x="14" y="16" width="8" height="2" fill="#8fe0a6"/><rect x="10" y="26" width="12" height="4" fill="#d8d4cc"/></svg>
    <div><b>WT-DOS<sup>3.1</sup></b><small>Wired Systems</small></div></div>
    <div class="slide"></div><div class="splash-note">for the WT-2 Personal Terminal</div></div>`
}
/** What a machine shows while it boots, `t` ms after it was switched on. */
function bootHtml(id: number, t: number) {
  const warm = t < WARM + 300 ? ` style="--t:-${Math.round(t)}ms"` : ''
  if (t < WARM) return `<div class="display warm"${warm}></div>`
  if (t < WARM + POST) {
    const lines = postLines(specOf(machine(id)), h.disc(id), t - WARM)
    return `<div class="display boot"${warm}><div class="mark">${MARK}</div>${lines.map(l => esc(l) || '&nbsp;').join('<br>')}<span class="cur">_</span><div class="post-foot">Press DEL to enter SETUP · click to skip</div></div>`
  }
  return splashHtml()
}
// ---------------------------------------------------------------- the screensaver: bread, flying

/** After a minute with nobody at it, a machine's screen saves itself: slices of bread fly across it, flapping. */
const SAVER_MS = 60_000
/** A slice of bread with a pair of wings, or a slice of toast (the wings are white and flap from where they join). */
function slice(toast: boolean) {
  const wing = '<path d="M12 30C2 14 -14 6 -27 7C-22 12 -21 16 -25 20C-17 21 -12 24 -16 28C-8 29 -1 32 12 36Z" fill="#f4f1e8" stroke="#a8a090" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 31C-1 22 -10 17 -19 15M6 33C-2 28 -8 26 -13 26" fill="none" stroke="#c8c2b4" stroke-width="1"/>'
  return `<svg viewBox="-30 -4 124 72"><g class="wing">${wing}</g><g transform="translate(64 0) scale(-1 1)"><g class="wing">${wing}</g></g>
    <path d="${BREAD}" fill="${toast ? '#c98a48' : '#ecdcb4'}" stroke="${toast ? '#6a3e1c' : '#a9733f'}" stroke-width="3.4" stroke-linejoin="round"/>
    <g fill="${toast ? '#a8682c' : '#d6bb85'}"><ellipse cx="22" cy="24" rx="1.8" ry="1.1"/><ellipse cx="35" cy="19" rx="1.4" ry="0.9"/><ellipse cx="43" cy="30" rx="2" ry="1.2"/><ellipse cx="27" cy="36" rx="1.5" ry="1"/><ellipse cx="38" cy="44" rx="1.8" ry="1.1"/><ellipse cx="21" cy="48" rx="1.3" ry="0.9"/></g></svg>`
}
/** Bread across a black screen, each at its own height and speed, the odd one toasted. */
function saverHtml() {
  let r = 11
  const rand = () => (r = (r * 16807) % 2147483647) / 2147483647
  const flock = Array.from({ length: 10 }, (_, i) => `<i class="fly" style="left:${Math.round(260 + rand() * 820)}px;top:${Math.round(-420 + rand() * 520)}px;--d:${(9 + rand() * 7).toFixed(2)}s;--o:-${(rand() * 16).toFixed(2)}s;--s:${(0.75 + rand() * 0.5).toFixed(2)}">${slice(i % 4 === 3)}</i>`).join('')
  return `<div class="display saver">${flock}</div>`
}

/** A program's splash while it loads, as programs used to have: its name, who made it, a bar. */
function loadingHtml(b: Busy) {
  const p = b.prog ? PROGRAMS[b.prog] : undefined
  if (!p?.splash || b.ms < 400) return ''
  return `<div class="splash98"><i>${p.icon}</i><b>${esc(p.splash[0])}</b><small>${esc(p.splash[1])}</small><span class="tb-busy"><i style="--p:${Math.min(1, (performance.now() - b.start) / b.ms).toFixed(3)}"></i></span><small>${esc(b.text)}</small></div>`
}

/** One window: its title bar (minimise, close) and what its program draws in it. */
function winHtml(os: Os, w: Win, z: number, top: boolean) {
  const p = PROGRAMS[w.prog], body = p.body(os, w) // first: drawing it can settle what the title says (the page, the picture)
  return `<div class="w98${top ? ' active' : ''}" data-pid="${w.pid}" style="left:${w.x}px;top:${w.y}px;width:${p.w}px;height:${p.h}px;z-index:${z + 1}">
    <div class="w98-bar"><i>${p.icon}</i><span>${esc(p.title?.(w) ?? p.name)}</span><button data-os="min:${w.pid}" title="Minimise">_</button><button data-os="close:${w.pid}" title="Close">×</button></div>
    <div class="w98-body">${body}</div></div>`
}

/** What the screen of machine `id` shows: nothing (off), the boot text, or the desktop with what is open on it. */
export function screenHtml(id: number, on: boolean): string {
  if (!on) { const t = performance.now() - (offs.get(id) ?? -Infinity); return t < 800 ? `<div class="display off collapsing" style="--t:-${Math.round(t)}ms"><i></i></div>` : '<div class="display off"></div>' }
  const sc = screenOf(id), it = machine(id), spec = specOf(it), disc = h.disc(id)
  if (!booted(sc)) return bootHtml(id, performance.now() - sc.on)
  if (sc.saver) return saverHtml()
  const os = osFor(id)
  const wall = it?.wall && it.drive?.find(f => f.name === it.wall)?.pic
  const installed = (filesOn(id, 'C') ?? []).filter(f => f.prog)
  const icon = (act: string, svg: string, label: string) => `<button class="d-icon" data-os="${act}"><i>${svg}</i><span>${esc(label)}</span></button>`
  const icons = [icon('drive:A', ICONS.floppy, 'A:'), icon('drive:C', ICONS.disk, 'C:'), icon('run:prompt', ICONS.prompt, 'Prompt'), icon('run:notepad', ICONS.notepad, 'Notepad'), icon('run:system', ICONS.system, 'System'), icon('run:pictures', ICONS.pic, 'Pictures'), icon('run:web', PROGRAMS.web.icon, 'The Wire'), icon('run:mail', PROGRAMS.mail.icon, 'Wiremail'),
    ...installed.map(f => icon(`open:${f.name}`, f.prog!.icon, f.prog!.name))].join('')
  const shown = sc.wins.filter(w => !w.min), top = shown[shown.length - 1]
  const windows = sc.wins.map((w, z) => w.min ? '' : winHtml(os, w, z, w === top)).join('')
  const alert = sc.alert ? `<div class="modal98"><div class="w98 active alert98"><div class="w98-bar"><span>${esc(sc.alert.title)}</span></div><div class="w98-body"><div class="err98"><b>!</b><span>${esc(sc.alert.text)}</span></div><div class="btns98"><button class="b98" data-os="ok">OK</button></div></div></div></div>` : ''
  const free = spec.memory - memUsed(sc), unread = (h.state().mail ?? []).filter(m => !m.read).length
  // the taskbar: what is running, in the order it was started (a button stays where it is), what is loading, memory left
  const busy = sc.busy ? `<span class="tb-busy"><span>${esc(sc.busy.text)}</span><i style="--p:${Math.min(1, (performance.now() - sc.busy.start) / sc.busy.ms).toFixed(3)}"></i></span>` : ''
  const tasks = [...sc.wins].sort((a, b) => a.pid - b.pid).map(w => `<button class="tb-task${w === top ? ' on' : ''}" data-os="task:${w.pid}"><i>${PROGRAMS[w.prog].icon}</i><span>${esc(PROGRAMS[w.prog].name)}</span></button>`).join('')
  return `<div class="display desk${wall ? ' walled' : ''}"${wall ? ` style="background-image:url(${picUrl(wall)})"` : ''}>
    <div class="d-icons">${icons}</div>${windows}${sc.busy ? loadingHtml(sc.busy) : ''}${alert}
    <div class="taskbar"><span class="tb-os">WT-DOS</span><span class="tb-tasks">${tasks}</span>${busy}${unread ? `<button class="tb-tray mailtray" data-os="run:mail" title="Unread mail: open Wiremail">&#9993; ${unread}</button>` : ''}${sc.online ? '<span class="tb-tray online" title="Connected to the Wire at 28,800 bps">&#9679; Wire</span>' : ''}<span class="tb-tray" title="Memory free of ${spec.memory}K">${free}K free</span><span class="tb-tray">A: ${disc ? 'ready' : 'empty'}</span></div></div>`
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

/**
 * The power switch was pressed. On, the machine boots: the tube warms up, the BIOS ticks through its checks, the system's
 * splash comes up with its chime, and then the desktop. Off, the picture collapses to a dot and what was running is gone.
 */
export function power(id: number, on: boolean) {
  const old = screens.get(id)
  if (old) stop(old)
  if (!on) { screens.delete(id); offs.set(id, performance.now()); setTimeout(() => h.repaint(id), 820); return }
  offs.delete(id)
  const sc = fresh(performance.now())
  screens.set(id, sc)
  let shown = 0, chimed = false
  sc.timer = window.setInterval(() => {
    const t = performance.now() - sc.on
    const n = t >= WARM && t < WARM + POST ? postLines(specOf(machine(id)), h.disc(id), t - WARM).length : 0
    if (n > shown) h.sound('key')
    shown = Math.max(shown, n)
    if (t >= WARM + POST && !chimed) { chimed = true; h.sound('startup') }
    if (t >= BOOT) clearInterval(sc.timer)
    h.repaint(id)
  }, 80)
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
  return sc && booted(sc) && machine(id) ? { id, sc, glass: glass!, os: osFor(id) } : null
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
  // someone at the machine: it is not idle, and the bread goes away
  const touch = (e: Event) => {
    const glass = (e.target as HTMLElement)?.closest?.<HTMLElement>('[data-screen]'), sc = glass && screens.get(+glass.dataset.screen!)
    if (!sc) return
    sc.idle = performance.now()
    if (sc.saver) { sc.saver = false; h.repaint(+glass!.dataset.screen!); e.stopPropagation(); e.preventDefault() }
  }
  for (const type of ['pointermove', 'pointerdown', 'keydown', 'wheel']) document.addEventListener(type, touch, true)
  setInterval(() => { for (const [id, sc] of screens) if (!sc.saver && booted(sc) && !sc.busy && performance.now() - sc.idle > SAVER_MS) { sc.saver = true; h.repaint(id) } }, 2000)
  document.addEventListener('click', e => {
    const t = e.target as HTMLElement, m = at(t)
    const glass = t.closest<HTMLElement>('[data-screen]'), sc = glass && screens.get(+glass.dataset.screen!)
    if (sc && !booted(sc) && performance.now() - sc.on > WARM) { sc.on = performance.now() - BOOT; h.repaint(+glass!.dataset.screen!); return } // a click skips the boot
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
