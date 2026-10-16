// The programs a computer runs. Each is a file with stats: its size (K, on a disk), the memory it takes while it runs (K),
// the speed it wants (MHz: a slower machine loads it slower), and whether it is licensed (it starts only with its own disc
// in drive A:, so a copy on C: is no use without the original). Four come with the machine (in its ROM: nothing to
// install); the rest come on discs (src/discs/*.md, a file named like the program) and run from the disc or from C: once
// copied there. computer.ts is the system around them (drives, memory, windows, loading); a program only draws its window
// and answers what is done in it, through `Os`.

import { esc } from './html.ts'
import { contents, find, look, worth, type Item, type Machine, type State } from './world.ts'

export type Drive = 'A' | 'C'
/** A file as a program sees it: on a drive, its size in K, and what it is. */
export interface File { name: string; drive: Drive; size: number; prog?: Program; text?: string; pic?: string }
/** One window on the screen: the program running in it and its own state. */
export interface Win { pid: number; prog: string; x: number; y: number; min?: boolean; st: any }

/** What a program can ask of the machine it runs on. */
export interface Os {
  id: number
  spec: Machine
  state(): State
  /** The files on a drive (A: with no disc in it: null). */
  files(d: Drive): File[] | null
  label(d: Drive): string
  /** K used and K the drive holds. */
  used(d: Drive): { used: number; size: number }
  /** Memory: what the system and each running program take, and the total. */
  memory(): { system: number; parts: { name: string; k: number }[]; total: number }
  /** Write a file to C: (a text or a picture); an error to show if it cannot. */
  write(name: string, data: { text?: string; pic?: string }): string | null
  remove(name: string): void
  /** Copy a file from A: to C: (it takes a while, at the floppy's speed). */
  copy(name: string): void
  /** Open a file the way its kind is opened: a program runs, a text opens in Notepad, a picture in Paint. */
  open(f: File): void
  /** Run a program from a drive (or from the machine's ROM), with a file to open in it. */
  run(id: string, from?: Drive, file?: File): void
  alert(text: string, title?: string): void
  close(w: Win): void
  repaint(): void
  wall(name: string | null): void
  wallName(): string | null
  sound(name: 'key' | 'seek' | 'menu' | 'bad'): void
  /** Light up these things on the field (null: none). */
  show(ids: number[] | null): void
  windows(): Win[]
}

export interface Program {
  id: string; file: string; name: string; size: number; memory: number; speed: number; licensed?: boolean; rom?: boolean
  /** Its window's size on the 640x480 screen. */
  w: number; h: number
  icon: string
  /** A new window's state (with a file to open in it). */
  start(os: Os, file?: File): any
  body(os: Os, w: Win): string
  /** A button in its window was pressed (`data-act`), or something was right-clicked (`data-alt`). */
  act?(os: Os, w: Win, what: string): void
  /** A key in one of its fields (`data-in`). True if it was handled. */
  key?(os: Os, w: Win, e: KeyboardEvent): boolean
  /** The pointer pressed on something of its own (`data-press`): what to do as it moves, until it lets go. */
  press?(os: Os, w: Win, el: HTMLElement, e: PointerEvent): ((e: PointerEvent) => void) | void
  /** Its title bar, when it says more than its name. */
  title?(w: Win): string
}

// ---------------------------------------------------------------- sizes and names

/** A text's size on a disk, in K (at least 1). */
export const textSize = (t: string) => Math.max(1, Math.ceil(new Blob([t]).size / 1024))
export const PIC_W = 160, PIC_H = 120
/** A picture: 160 by 120, sixteen colours, half a byte a pixel. */
export const PIC_SIZE = Math.ceil(PIC_W * PIC_H / 2 / 1024)
export const kb = (k: number) => k >= 1024 ? `${+(k / 1024).toFixed(2)} MB` : `${k}K`
/** A name a file can have: up to eight letters or digits, a dot, and up to three more. */
export const fileName = (n: string, ext: string) => {
  const [base, e] = n.trim().toUpperCase().replace(/[^A-Z0-9_.-]/g, '').split('.')
  return base ? `${base.slice(0, 8)}.${(e || ext).slice(0, 3)}` : null
}

// ---------------------------------------------------------------- icons (16 by 16, drawn up as needed)

const svg = (d: string) => `<svg viewBox="0 0 16 16" shape-rendering="crispEdges">${d}</svg>`
export const ICONS = {
  floppy: svg('<path d="M2 1.5h10l2.5 2.5v10.5h-12.5z" fill="#3a4a66" stroke="#0d1018" stroke-width=".6"/><rect x="4.5" y="1.5" width="6" height="4.5" fill="#c6ccd4"/><rect x="8" y="2.2" width="1.6" height="3" fill="#2a2e36"/><rect x="3.5" y="8.5" width="9" height="5.5" fill="#e6e0d0"/>'),
  disk: svg('<rect x="1" y="4" width="14" height="8" rx="1" fill="#8e8a96" stroke="#16141a" stroke-width=".6"/><rect x="1" y="9" width="14" height="3" fill="#6a6674"/><rect x="11" y="10" width="2" height="1" fill="#5fd36c"/><rect x="3" y="6" width="6" height="1" fill="#c9c3d6"/>'),
  page: svg('<path d="M3 1h7l3 3v11H3z" fill="#e8e4da" stroke="#2a2a30" stroke-width=".6"/><path d="M10 1v3h3" fill="#c8c2b4" stroke="#2a2a30" stroke-width=".6"/><path d="M5 6.5h6M5 8.5h6M5 10.5h4" stroke="#6a7088" stroke-width=".8"/>'),
  pic: svg('<rect x="1.5" y="2.5" width="13" height="11" fill="#2b5a6a" stroke="#16141a" stroke-width=".6"/><path d="M1.5 11l4-4 3 3 2-2 4 4v1.5h-13z" fill="#5c8a4a"/><circle cx="11" cy="5.5" r="1.5" fill="#e8c860"/>'),
  exe: svg('<rect x="1.5" y="2.5" width="13" height="11" fill="#c9c3d6" stroke="#16141a" stroke-width=".6"/><rect x="1.5" y="2.5" width="13" height="2.5" fill="#4b3a55"/><rect x="3.5" y="7" width="9" height="1" fill="#6a6474"/><rect x="3.5" y="9.5" width="6" height="1" fill="#6a6474"/>'),
  prompt: svg('<rect x="1" y="2" width="14" height="12" fill="#050807" stroke="#8a8494" stroke-width=".6"/><path d="M3 5l2.5 2L3 9" fill="none" stroke="#8fe0a6" stroke-width="1"/><rect x="7" y="9" width="4" height="1" fill="#8fe0a6"/>'),
  notepad: svg('<rect x="3" y="1.5" width="10" height="13" fill="#e8e4da" stroke="#2a2a30" stroke-width=".6"/><path d="M3 1.5h10v2H3z" fill="#5a7ab0"/><path d="M5 6h6M5 8h6M5 10h6M5 12h3" stroke="#6a7088" stroke-width=".8"/>'),
  system: svg('<rect x="1.5" y="2" width="13" height="9" fill="#b8b09a" stroke="#16141a" stroke-width=".6"/><rect x="3" y="3.5" width="10" height="6" fill="#15382e"/><path d="M4 8l2-2 2 1 3-3" fill="none" stroke="#86d9a0" stroke-width=".8"/><rect x="5" y="11" width="6" height="2" fill="#8f8873"/><rect x="3.5" y="13" width="9" height="1.5" fill="#b8b09a" stroke="#16141a" stroke-width=".4"/>'),
  paint: svg('<path d="M2 14c1-4 3-5 5-4s1 4-5 4z" fill="#c25a3c"/><path d="M6.5 9.5L13 2.5l1 1-6.5 7z" fill="#d39a3a" stroke="#16141a" stroke-width=".5"/><circle cx="4" cy="4" r="1.6" fill="#5a7ab0"/><circle cx="9" cy="12.5" r="1.4" fill="#e8c860"/>'),
  stock: svg('<rect x="1.5" y="1.5" width="13" height="13" fill="#e8e4da" stroke="#2a2a30" stroke-width=".6"/><path d="M1.5 5h13M1.5 8.5h13M1.5 12h13M6 1.5v13" stroke="#8a8494" stroke-width=".6"/><rect x="8" y="9.5" width="5" height="1.5" fill="#2fae5c"/><rect x="8" y="6" width="3" height="1.5" fill="#2fae5c"/>'),
  mines: svg('<path d="M8 1.5v3M8 12.5v3M1 8.5h3M12 8.5h3M3 3.5l2 2M11 11.5l2 2M13 3.5l-2 2M3 13.5l2-2" stroke="#c9c3d6" stroke-width="1.2"/><circle cx="8" cy="8.5" r="4.5" fill="#16141a" stroke="#c9c3d6" stroke-width=".7"/><rect x="5.5" y="6" width="2" height="2" fill="#e6e3dc"/>'),
}
const fileIcon = (f: File) => f.prog ? ICONS[f.prog.id as keyof typeof ICONS] ?? ICONS.exe : f.pic ? ICONS.pic : ICONS.page

// ---------------------------------------------------------------- what a window is made of

const btn = (act: string, label: string, extra = '') => `<button class="b98" data-act="${esc(act)}"${extra}>${label}</button>`
/** A meter: parts of a whole, each its own colour, the rest free. */
const meter = (parts: { k: number; c: string; name: string }[], total: number) => `<div class="meter">${parts.map(p => `<i style="width:${(100 * p.k / total).toFixed(2)}%;background:${p.c}" title="${esc(p.name)}: ${kb(p.k)}"></i>`).join('')}</div>`
const PARTS = ['#8c6a4a', '#5a7ab0', '#c25a3c', '#5c8a4a', '#b07ab0', '#d39a3a', '#4a8a8a']

// ---------------------------------------------------------------- Files: what is on A: and C:

const files: Program = {
  id: 'files', file: 'FILES.EXE', name: 'Files', size: 0, memory: 32, speed: 1, rom: true, w: 380, h: 270, icon: ICONS.disk,
  start: (_, f) => ({ drive: f?.drive ?? 'C', sel: null as string | null }),
  title: w => `${w.st.drive}:\\ - Files`,
  body(os, w) {
    const d: Drive = w.st.drive, list = os.files(d), { used, size } = os.used(d)
    const tabs = (['A', 'C'] as Drive[]).map(x => `<button class="tab98${x === d ? ' on' : ''}" data-act="drive:${x}">${x}:</button>`).join('') + `<span class="tab-label">${esc(os.label(d))}</span>`
    if (!list) return `<div class="bar98">${tabs}</div><div class="pane98 err98"><b>!</b><span>A:\\ is not accessible.<br>The device is not ready.</span></div>`
    const sel = list.find(f => f.name === w.st.sel)
    const rows = list.map(f => `<button class="row98${f.name === w.st.sel ? ' on' : ''}" data-act="sel:${esc(f.name)}" data-open="${esc(f.name)}"><i>${fileIcon(f)}</i><span>${esc(f.name)}</span><small>${f.prog ? `${f.prog.licensed ? 'licensed · ' : ''}needs ${f.prog.memory}K` : f.pic ? 'picture' : 'text'}</small><em>${kb(f.size)}</em></button>`).join('') || '<div class="note98">No files.</div>'
    const tools = [btn('open', 'Open', sel ? '' : ' disabled'), d === 'A' ? btn('copy', 'Copy to C:', sel ? '' : ' disabled') : btn('del', 'Delete', sel ? '' : ' disabled'), d === 'C' && sel?.pic ? btn('wall', os.wallName() === sel.name ? 'Wallpaper off' : 'Wallpaper') : ''].join('')
    return `<div class="bar98">${tabs}</div><div class="pane98 list98">${rows}</div><div class="bar98">${tools}<span class="grow"></span></div><div class="status98">${list.length} file${list.length === 1 ? '' : 's'} · ${kb(used)} used · ${kb(size - used)} free${d === 'A' ? ' · read only' : ''}</div>`
  },
  act(os, w, what) {
    const list = os.files(w.st.drive) ?? [], sel = list.find(f => f.name === w.st.sel)
    if (what.startsWith('drive:')) { w.st.drive = what.slice(6); w.st.sel = null }
    else if (what.startsWith('sel:')) w.st.sel = what.slice(4)
    else if (what.startsWith('open:')) { const f = list.find(o => o.name === what.slice(5)); if (f) os.open(f) }
    else if (what === 'open' && sel) os.open(sel)
    else if (what === 'copy' && sel) os.copy(sel.name)
    else if (what === 'del' && sel) { os.remove(sel.name); w.st.sel = null }
    else if (what === 'wall' && sel) os.wall(os.wallName() === sel.name ? null : sel.name)
    os.repaint()
  },
}

// ---------------------------------------------------------------- Notepad: read a text, write your own

const notepad: Program = {
  id: 'notepad', file: 'NOTEPAD.EXE', name: 'Notepad', size: 0, memory: 48, speed: 1, rom: true, w: 380, h: 300, icon: ICONS.notepad,
  start(os, f) {
    const taken = new Set((os.files('C') ?? []).map(o => o.name))
    let n = 1
    while (taken.has(`NOTE${n}.TXT`)) n++
    return { name: f?.name ?? `NOTE${n}.TXT`, text: f?.text ?? '', from: f?.drive ?? null, saved: !!f }
  },
  title: w => `${w.st.name}${w.st.saved ? '' : ' *'} - Notepad`,
  body(os, w) {
    return `<textarea class="text98" data-in="text" data-focus="${os.id}:${w.pid}:text" spellcheck="false">${esc(w.st.text)}</textarea>
      <div class="bar98"><span>Save on C: as</span><input class="in98" data-in="name" data-focus="${os.id}:${w.pid}:name" value="${esc(w.st.name)}" maxlength="12">${btn('save', 'Save')}<span class="grow"></span><small>${kb(textSize(w.st.text))}</small></div>`
  },
  act(os, w, what) {
    if (what !== 'save') return
    const name = fileName(w.st.name, 'TXT')
    if (!name) return os.alert('A file needs a name.')
    const err = os.write(name, { text: w.st.text })
    if (err) return os.alert(err)
    Object.assign(w.st, { name, from: 'C', saved: true })
    os.repaint()
  },
  key(os, w, e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); notepad.act!(os, w, 'save'); return true }
    if (w.st.saved && (e.target as HTMLElement).dataset.in === 'text' && e.key.length === 1) { w.st.saved = false; queueMicrotask(() => os.repaint()) }
    return false
  },
}

// ---------------------------------------------------------------- the prompt: the machine by typing

const HELP = [
  'DIR            the files on this drive',
  'A: or C:       change drive',
  'TYPE name      show a text',
  'COPY name      copy a file from A: to C:',
  'DEL name       delete a file on C:',
  'REN old new    rename a file on C:',
  'MEM            memory, what is running',
  'name           run a program, open a file',
  'VER  CLS  EXIT',
]
const prompt: Program = {
  id: 'prompt', file: 'PROMPT.EXE', name: 'Prompt', size: 0, memory: 24, speed: 1, rom: true, w: 440, h: 280, icon: ICONS.prompt,
  start: () => ({ cwd: 'C', lines: ['WT-DOS 3.1  (C) WIRED SYSTEMS', 'Type HELP for the commands.', ''], cmd: '', hist: [] as string[], hi: 0 }),
  title: () => 'Prompt',
  body(os, w) {
    return `<div class="dos" data-act="focus">${w.st.lines.map((l: string) => esc(l) || '&nbsp;').join('<br>')}<div class="dos-in"><span>${w.st.cwd}:\\&gt;</span><input data-in="cmd" data-focus="${os.id}:${w.pid}:cmd" value="${esc(w.st.cmd)}" spellcheck="false" autocomplete="off"></div></div>`
  },
  act(os, w, what) { if (what === 'focus') document.querySelector<HTMLInputElement>(`[data-focus="${os.id}:${w.pid}:cmd"]`)?.focus() },
  key(os, w, e) {
    const st = w.st
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      st.hi = Math.max(0, Math.min(st.hist.length, st.hi + (e.key === 'ArrowUp' ? -1 : 1)))
      st.cmd = st.hist[st.hi] ?? ''
      os.repaint()
      return true
    }
    if (e.key !== 'Enter') return false
    const line = st.cmd.trim()
    st.lines.push(`${st.cwd}:\\>${st.cmd}`)
    st.cmd = ''
    if (line) { st.hist.push(line); st.hist = st.hist.slice(-30) }
    st.hi = st.hist.length
    const out = line ? command(os, w, line) : []
    if (out === null) return true // the window closed
    st.lines.push(...out, '')
    st.lines = st.lines.slice(-200)
    os.repaint()
    queueMicrotask(() => { const el = document.querySelector(`[data-focus="${os.id}:${w.pid}:cmd"]`)?.closest('.dos'); if (el) el.scrollTop = el.scrollHeight })
    return true
  },
}
/** One command at the prompt: what it prints (null if the prompt itself closed). */
function command(os: Os, w: Win, line: string): string[] | null {
  const [verb, ...args] = line.split(/\s+/), v = verb.toUpperCase(), st = w.st
  const find = (d: Drive, n: string) => (os.files(d) ?? []).find(f => f.name === n.toUpperCase() || f.name === `${n.toUpperCase()}.EXE`)
  if (v === 'HELP') return HELP
  if (v === 'CLS') { st.lines = []; return [] }
  if (v === 'EXIT') { os.close(w); return null }
  if (v === 'VER') return ['WT-DOS 3.1', `WT-2, ${os.spec.speed} MHz, ${os.spec.memory}K memory, ${kb(os.spec.disk)} disk`]
  if (v === 'A:' || v === 'C:') { if (v === 'A:' && !os.files('A')) return ['Not ready reading drive A:']; st.cwd = v[0]; return [] }
  if (v === 'DIR') {
    const list = os.files(st.cwd)
    if (!list) return ['Not ready reading drive A:']
    const { used, size } = os.used(st.cwd)
    return [` Volume in drive ${st.cwd} is ${os.label(st.cwd)}`, '', ...list.map(f => `${f.name.padEnd(13)}${String(f.size).padStart(5)}K  ${f.prog ? 'program' : f.pic ? 'picture' : 'text'}`), `${String(list.length).padStart(9)} file(s)  ${kb(size - used)} free`]
  }
  if (v === 'MEM') {
    const m = os.memory(), used = m.system + m.parts.reduce((n, p) => n + p.k, 0)
    return [`${String(m.total).padStart(6)}K total memory`, `${String(m.system).padStart(6)}K WT-DOS`, ...m.parts.map(p => `${String(p.k).padStart(6)}K ${p.name}`), `${String(m.total - used).padStart(6)}K free`]
  }
  if (v === 'TYPE') {
    const f = args[0] && find(st.cwd, args[0])
    if (!f) return ['File not found']
    return f.text !== undefined ? f.text.split('\n') : ['That is not a text.']
  }
  if (v === 'COPY') {
    const f = args[0] && find('A', args[0])
    if (!f) return ['File not found on A:']
    os.copy(f.name)
    return []
  }
  if (v === 'DEL') {
    if (st.cwd !== 'C') return ['Write-protect error writing drive A:']
    const f = args[0] && find('C', args[0])
    if (!f) return ['File not found']
    os.remove(f.name)
    return ['1 file deleted']
  }
  if (v === 'REN') {
    if (st.cwd !== 'C') return ['Write-protect error writing drive A:']
    const f = args[0] && find('C', args[0]), to = args[1] && fileName(args[1], f && f.name.split('.')[1] || 'TXT')
    if (!f || !to) return ['Usage: REN old new']
    if (f.prog) return ['A program keeps its name.']
    if (find('C', to)) return [`${to} already exists`]
    os.remove(f.name)
    os.write(to, f.pic ? { pic: f.pic } : { text: f.text ?? '' })
    return []
  }
  const rom = Object.values(PROGRAMS).find(p => p.rom && (p.id === v.toLowerCase() || p.file === v))
  if (rom) { os.run(rom.id); return [] }
  const f = find(st.cwd, verb)
  if (f) { os.open(f); return [] }
  return ['Bad command or file name']
}

// ---------------------------------------------------------------- System: what the machine has and what is using it

const system: Program = {
  id: 'system', file: 'SYSTEM.EXE', name: 'System', size: 0, memory: 16, speed: 1, rom: true, w: 330, h: 290, icon: ICONS.system,
  start: () => ({}),
  title: () => 'System',
  body(os) {
    const m = os.memory(), mUsed = m.system + m.parts.reduce((n, p) => n + p.k, 0)
    const c = os.used('C'), a = os.files('A') ? os.used('A') : null
    const cFiles = os.files('C') ?? []
    return `<div class="pane98 sys98">
      <div class="sys-head"><i>${ICONS.system}</i><div><b>WT-2 Personal Terminal</b><br>WT-DOS 3.1 · ${os.spec.speed} MHz</div></div>
      <h4>Memory <small>${kb(m.total - mUsed)} free of ${kb(m.total)}</small></h4>
      ${meter([{ k: m.system, c: '#6a6474', name: 'WT-DOS' }, ...m.parts.map((p, i) => ({ k: p.k, c: PARTS[i % PARTS.length], name: p.name }))], m.total)}
      <div class="legend">${[`<span><i style="background:#6a6474"></i>WT-DOS ${m.system}K</span>`, ...m.parts.map((p, i) => `<span><i style="background:${PARTS[i % PARTS.length]}"></i>${esc(p.name)} ${p.k}K</span>`)].join('')}</div>
      <h4>Hard disk C: <small>${kb(c.size - c.used)} free of ${kb(c.size)}</small></h4>
      ${meter([{ k: SYSTEM_DISK, c: '#6a6474', name: 'WT-DOS' }, ...cFiles.map((f, i) => ({ k: f.size, c: PARTS[i % PARTS.length], name: f.name }))], c.size)}
      <h4>Drive A: <small>${a ? `${esc(os.label('A'))} · ${kb(a.size - a.used)} free` : 'empty'}</small></h4>
      ${a ? meter([{ k: a.used, c: '#5a7ab0', name: 'files' }], a.size) : ''}
    </div>`
  },
}

// ---------------------------------------------------------------- Paint: sixteen colours, a pen, a brush and a fill

export const PALETTE = ['#000000', '#7f7f7f', '#c3c3c3', '#ffffff', '#7a1f1f', '#d03a2f', '#e08a3a', '#f2d272', '#2f5a2a', '#5c9a4a', '#1f4a6a', '#4a8ad0', '#3a2f6a', '#9a6ad0', '#6a4a2a', '#e8b8a0']
const blank = () => '3'.repeat(PIC_W * PIC_H) // white
/** A picture's pixels as an image the page can show (the last few are kept). */
const pics = new Map<string, string>()
export function picUrl(px: string) {
  const hit = pics.get(px)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = PIC_W; c.height = PIC_H
  const g = c.getContext('2d')!, img = g.createImageData(PIC_W, PIC_H)
  const rgb = PALETTE.map(h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)))
  for (let i = 0; i < PIC_W * PIC_H; i++) { const [r, gg, b] = rgb[parseInt(px[i] ?? '0', 16)] ?? rgb[0]; img.data.set([r, gg, b, 255], i * 4) }
  g.putImageData(img, 0, 0)
  const url = c.toDataURL()
  pics.set(px, url)
  if (pics.size > 12) pics.delete(pics.keys().next().value!)
  return url
}
const paint: Program = {
  id: 'paint', file: 'PAINT.EXE', name: 'Paint', size: 640, memory: 256, speed: 12, w: 372, h: 344, icon: ICONS.paint,
  start(os, f) {
    const taken = new Set((os.files('C') ?? []).map(o => o.name))
    let n = 1
    while (taken.has(`PIC${n}.PIC`)) n++
    return { name: f?.pic ? f.name : `PIC${n}.PIC`, px: f?.pic && f.pic.length === PIC_W * PIC_H ? f.pic : blank(), col: 0, tool: 'pen', saved: !!f?.pic }
  },
  title: w => `${w.st.name}${w.st.saved ? '' : ' *'} - Paint`,
  body(os, w) {
    const st = w.st
    const tools = [['pen', 'Pen'], ['brush', 'Brush'], ['fill', 'Fill']].map(([t, l]) => `<button class="b98${st.tool === t ? ' on' : ''}" data-act="tool:${t}">${l}</button>`).join('')
    const swatches = PALETTE.map((c, i) => `<button class="sw98${st.col === i ? ' on' : ''}" style="background:${c}" data-act="col:${i}" title="${c}"></button>`).join('')
    return `<div class="bar98">${tools}<span class="grow"></span>${btn('new', 'New')}</div>
      <div class="canvas98"><img data-press="draw" src="${picUrl(st.px)}" width="${PIC_W * 2}" height="${PIC_H * 2}" draggable="false" alt=""></div>
      <div class="bar98 swatches">${swatches}</div>
      <div class="bar98"><span>Save on C: as</span><input class="in98" data-in="name" data-focus="${os.id}:${w.pid}:name" value="${esc(st.name)}" maxlength="12">${btn('save', 'Save')}${btn('wall', 'Wallpaper')}<span class="grow"></span><small>${kb(PIC_SIZE)}</small></div>`
  },
  act(os, w, what) {
    const st = w.st
    if (what.startsWith('tool:')) st.tool = what.slice(5)
    else if (what.startsWith('col:')) st.col = +what.slice(4)
    else if (what === 'new') Object.assign(st, { px: blank(), saved: false })
    else if (what === 'save' || what === 'wall') {
      const name = fileName(st.name, 'PIC')
      if (!name) return os.alert('A picture needs a name.')
      const err = os.write(name, { pic: st.px })
      if (err) return os.alert(err)
      Object.assign(st, { name, saved: true })
      if (what === 'wall') os.wall(name)
    }
    os.repaint()
  },
  press(os, w, el, e) {
    const st = w.st
    const at = (ev: PointerEvent) => { const r = el.getBoundingClientRect(); return [Math.floor((ev.clientX - r.left) / r.width * PIC_W), Math.floor((ev.clientY - r.top) / r.height * PIC_H)] }
    const px = st.px.split('')
    const c = st.col.toString(16)
    const put = (x: number, y: number) => { if (x >= 0 && y >= 0 && x < PIC_W && y < PIC_H) px[y * PIC_W + x] = c }
    const dab = (x: number, y: number) => { if (st.tool === 'brush') { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) put(x + dx, y + dy) } else put(x, y) }
    const show = () => { st.px = px.join(''); st.saved = false; (el as HTMLImageElement).src = picUrl(st.px) }
    let [lx, ly] = at(e)
    if (st.tool === 'fill') { // everything of the colour under the pointer that touches it, by its sides
      const from = px[ly * PIC_W + lx]
      if (from === undefined || from === c) return
      const todo = [[lx, ly]]
      while (todo.length) {
        const [x, y] = todo.pop()!
        if (x < 0 || y < 0 || x >= PIC_W || y >= PIC_H || px[y * PIC_W + x] !== from) continue
        px[y * PIC_W + x] = c
        todo.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
      }
      show(); os.repaint()
      return
    }
    dab(lx, ly); show()
    return ev => { // a line from where it was to where it is, so a fast stroke has no gaps
      const [x, y] = at(ev), n = Math.max(Math.abs(x - lx), Math.abs(y - ly), 1)
      for (let i = 1; i <= n; i++) dab(Math.round(lx + (x - lx) * i / n), Math.round(ly + (y - ly) * i / n))
      lx = x; ly = y
      show()
    }
  },
}

// ---------------------------------------------------------------- Stocktake: everything you own, counted and valued

/** What you own: everything on the field and in what is on it (not on the counters, not in the trash), by what it is. */
function stocktake(s: State) {
  const root = (it: Item): Item => { let o = it; while (o.in) { const h = find(s, o.in.host); if (!h) break; o = h } return o }
  const rows = new Map<string, { name: string; ids: number[]; worth: number }>()
  for (const it of s.items) {
    if (root(it).at) continue
    const own = worth(s, it) - contents(s, it.id).reduce((n, o) => n + worth(s, o), 0)
    const name = look(it).name
    const r = rows.get(name) ?? rows.set(name, { name, ids: [], worth: 0 }).get(name)!
    r.ids.push(it.id); r.worth += own
  }
  return [...rows.values()].sort((a, b) => b.worth - a.worth || a.name.localeCompare(b.name))
}
const stock: Program = {
  id: 'stock', file: 'STOCK.EXE', name: 'Stocktake', size: 380, memory: 192, speed: 8, licensed: true, w: 400, h: 320, icon: ICONS.stock,
  start: () => ({}),
  title: () => 'Stocktake Pro',
  body(os) {
    const rows = stocktake(os.state()), total = rows.reduce((n, r) => n + r.worth, 0), count = rows.reduce((n, r) => n + r.ids.length, 0)
    const body = rows.map(r => `<tr data-things="${r.ids.join(',')}"><td>${esc(r.name)}</td><td>${r.ids.length}</td><td>${r.worth}$</td></tr>`).join('')
    return `<div class="pane98 tbl98"><table><thead><tr><th>Thing</th><th>Count</th><th>Worth</th></tr></thead><tbody>${body || '<tr><td colspan="3">Nothing on the field.</td></tr>'}</tbody></table></div>
      <div class="status98">${count} thing${count === 1 ? '' : 's'} · worth ${total}$ · point at a line to find them</div>`
  },
}

// ---------------------------------------------------------------- Mines: a game on a cheap disc

const MW = 9, MH = 9, MN = 10
const mines: Program = {
  id: 'mines', file: 'MINES.EXE', name: 'Mines', size: 96, memory: 64, speed: 4, w: 232, h: 268, icon: ICONS.mines,
  start: () => ({ mines: [] as number[], cells: '.'.repeat(MW * MH), over: null as null | 'won' | 'lost' }),
  title: () => 'Mines',
  body(_, w) {
    const st = w.st, flags = [...st.cells].filter(c => c === 'f').length
    const near = (i: number) => around(i).filter(j => st.mines.includes(j)).length
    const cells = [...st.cells].map((c: string, i: number) => {
      const boom = st.over && st.mines.includes(i)
      if (c === 'o') { const n = near(i); return `<span class="mc open n${n}">${n || ''}</span>` }
      return `<button class="mc${boom ? ' boom' : ''}" data-act="dig:${i}" data-alt="flag:${i}">${boom ? '✹' : c === 'f' ? '⚑' : ''}</button>`
    }).join('')
    return `<div class="bar98"><small>${MN - flags} left</small><span class="grow"></span><button class="b98 face" data-act="new" title="A new game">${st.over === 'lost' ? 'x_x' : st.over === 'won' ? 'B-)' : ':-)'}</button><span class="grow"></span><small>${st.over === 'won' ? 'cleared' : st.over ? 'boom' : 'playing'}</small></div><div class="mines98" style="--mw:${MW}">${cells}</div><div class="status98">click: dig · right-click: flag</div>`
  },
  act(os, w, what) {
    const st = w.st
    if (what === 'new') { Object.assign(st, mines.start(os)); os.repaint(); return }
    if (st.over) return
    const i = +what.split(':')[1]
    if (what.startsWith('flag:')) { if (st.cells[i] !== 'o') st.cells = set(st.cells, i, st.cells[i] === 'f' ? '.' : 'f') }
    else if (st.cells[i] === '.') {
      if (!st.mines.length) { // the first square dug is never a mine, nor next to one
        const safe = new Set([i, ...around(i)]), pool = [...Array(MW * MH).keys()].filter(j => !safe.has(j))
        while (st.mines.length < MN) st.mines.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0])
      }
      if (st.mines.includes(i)) { st.over = 'lost'; os.sound('bad') }
      else {
        const todo = [i]
        while (todo.length) {
          const j = todo.pop()!
          if (st.cells[j] === 'o') continue
          st.cells = set(st.cells, j, 'o')
          if (!around(j).some(k => st.mines.includes(k))) todo.push(...around(j).filter(k => st.cells[k] === '.'))
        }
        if ([...st.cells].filter(c => c !== 'o').length === MN) st.over = 'won'
      }
    }
    os.repaint()
  },
}
const around = (i: number) => { const x = i % MW, y = Math.floor(i / MW), out: number[] = []; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && x + dx >= 0 && x + dx < MW && y + dy >= 0 && y + dy < MH) out.push((y + dy) * MW + x + dx); return out }
const set = (s: string, i: number, c: string) => s.slice(0, i) + c + s.slice(i + 1)

// ----------------------------------------------------------------

/** What the system itself takes: memory while the machine is on, and room on C:. */
export const SYSTEM_MEMORY = 160, SYSTEM_DISK = 520
export const PROGRAMS: Record<string, Program> = { files, notepad, prompt, system, paint, stock, mines }
/** The program a file on a disc is, by its name. */
export const programFile = (name: string) => Object.values(PROGRAMS).find(p => !p.rom && p.file === name.toUpperCase())
