import './style.css'
import {
  accepts, applyDrop, cellsOf, dims, env, FIELD, FIELD_H, FIELD_W, find, forecast, forecastDrop, gradeName, has, isBox, KINDS, kids, label, lift, nameOf, PLACES, planDrop, putBack, room, send, showsDamp, sleep, spec, start, tidy,
  type Held, type Item, type Note, type Place, type Plan, type State,
} from './world.ts'

const files = import.meta.glob<string>('./icons/*.svg', { query: '?raw', import: 'default', eager: true })
const ICON: Record<string, string> = Object.fromEntries(Object.entries(files).map(([p, svg]) => [p.slice('./icons/'.length, -'.svg'.length), svg]))
const icon = (name: string) => ICON[name] ?? ''

// Presentation only: some icons are drawn on a diagonal; turn them to lie along long items.
const TILT: Record<string, number> = { firewood: 45, knife: 45 }

const SAVE = 'inventory-v5'
let s: State = load() ?? start()
let fc = forecast(s)
let pulse = new Set<number>()
let born = new Set<number>()
let cell = 48

const app = document.getElementById('app')!
const tip = document.body.appendChild(Object.assign(document.createElement('div'), { className: 'tip' }))
const veil = document.body.appendChild(Object.assign(document.createElement('div'), { className: 'veil' }))

function load(): State | null {
  try { const v = JSON.parse(localStorage.getItem(SAVE) ?? 'null'); return v?.items ? v : null } catch { return null }
}
function save() {
  try { localStorage.setItem(SAVE, JSON.stringify(s)) } catch { /* private window: the toy still works, it just won't remember */ }
}

function fit() {
  cell = Math.floor(Math.max(34, Math.min(48, (innerWidth - 400) / 23)))
  document.documentElement.style.setProperty('--cell', `${cell}px`)
}

// ---------------------------------------------------------------- drawing

const PILE: [number, number, number][][] = [[[0, 0, 0.78]], [[-14, 10, 0.64], [14, -8, 0.64]], [[-17, 13, 0.58], [17, 11, 0.58], [0, -14, 0.58]]]

function itemHtml(it: Item, extra = '') {
  const k = KINDS[it.kind]
  const d = dims(it)
  const cls = [it.rotten && 'rotten', has(it, 'light') && !it.rotten && 'glow', pulse.has(it.id) && 'pulse', born.has(it.id) && 'born', (it.cond ?? 100) < 40 && 'rusty', isBox(it) && 'boxy'].filter(Boolean).join(' ')
  const tilt = TILT[it.kind] ?? 0
  const m = Math.min(k.w, k.h) * (tilt ? 1.5 : 1) * (k.shape ? 0.85 : 1)
  const copies = PILE[Math.min(k.stack > 1 ? it.n : 1, 3) - 1]
  const art = copies.map(([x, y, sc]) => `<i style="--px:${x}%;--py:${y}%;--s:${sc};--t:${tilt}deg">${icon(k.icon)}</i>`).join('')
  const cells = cellsOf(it)
  const tiles = cells ? cells.map(([x, y]) => `<u class="cell" style="--cx:${x};--cy:${y}"></u>`).join('') : ''
  return `<div class="item ${cls} ${cells ? 'shaped' : ''} ${extra}" data-id="${it.id}" style="--x:${it.x};--y:${it.y};--w:${d.w};--h:${d.h};--c:${k.color}">
    ${tiles}<div class="art" style="--kw:${k.w};--kh:${k.h};--m:${m};--r:${it.rot ? 90 : 0}deg">${art}</div>${badges(it)}</div>`
}

function badges(it: Item) {
  const k = KINDS[it.kind]
  let out = ''
  const bar = it.rotten ? null : it.fresh !== undefined && k.fresh ? it.fresh / k.fresh : it.cond !== undefined ? it.cond / 100 : null
  if (bar !== null) out += `<span class="bar ${it.cond !== undefined ? 'cond' : 'fresh'}" style="--v:${bar}"></span>`
  const age = it.age ?? 0
  const [dots, kind] = it.grade !== undefined ? [['Crude', 'Fair', 'Fine', 'Pure'].indexOf(gradeName(it.grade)) + 1, 'grade']
    : it.uses !== undefined ? [it.uses, 'uses'] : it.ferment ? [it.ferment, 'ferm'] : it.kind === 'berryWine' ? [age >= 7 ? 3 : age >= 3 ? 2 : 1, 'age'] : [0, '']
  if (dots) out += `<span class="dots ${kind}">${'<i></i>'.repeat(dots)}</span>`
  if (showsDamp(it) && it.moist! > 20) out += `<span class="wet${(it.moist ?? 0) >= 50 ? ' soaked' : ''}">${icon('water-drop')}</span>`
  if (it.rotten) out += `<span class="fly">${icon('fly')}</span>`
  if (it.n > 1) out += `<b class="n">${it.n}</b>`
  if (isBox(it)) out += `<b class="n" title="Double-click to open">${kids(s, it.id).length}</b>`
  return out
}

/** A fire's state tonight; null for anything that isn't a fire. */
function fire(c: Item): { cls: string; env: string } | null {
  if (!spec(c)!.env.includes('fire')) return null
  const p = env(s, c.id)
  if (p.has('lit')) return { cls: 'lit', env: 'lit tonight · burns 1 fuel' }
  if (p.has('smoky')) return { cls: 'smoky', env: 'wet wood only · will smoke' }
  return { cls: 'cold', env: 'cold · needs dry fuel' }
}

/** The containers you have open, as panels beside the floor. */
const panels = () => s.open.map(id => find(s, id)).filter((o): o is Item => !!o && isBox(o))

function boxHtml(c: Item) {
  const k = KINDS[c.kind]
  const { w, h } = room(s, c.id)
  const items = kids(s, c.id)
  const used = items.reduce((n, it) => n + dims(it).w * dims(it).h, 0)
  const f = fire(c)
  return `<section class="box box-${c.kind} ${f?.cls ?? ''}" data-box="${c.id}" style="--w:${w};--h:${h}">
    <header data-boxtip="${c.id}">
      <div><span class="bi">${icon(k.icon)}</span><b>${k.name}</b><span class="grow"></span>
        <button class="pin ${s.target === c.id ? 'on' : ''}" data-pin="${c.id}" title="Shift-click sends things here">⇥</button><button data-close="${c.id}" title="Close">✕</button></div>
      <div><span class="env">${f?.env ?? spec(c)!.desc}</span><span class="grow"></span><span class="fill">${used}/${w * h}</span>
        <button class="tidy" data-tidy="${c.id}" title="Merge piles and pack by kind">tidy</button></div>
    </header>
    <div class="grid" data-grid="${c.id}">${items.map(it => itemHtml(it)).join('')}</div>
  </section>`
}

/** The workshop floor: containers sit here, and you open them into panels. */
function floorHtml() {
  const items = kids(s, FIELD)
  return `<section class="box box-field" data-box="${FIELD}" style="--w:${FIELD_W};--h:${FIELD_H}">
    <header><div><b>Workshop floor</b><span class="grow"></span></div>
      <div><span class="env">double-click a container to open it · drop things onto one to put them inside</span></div></header>
    <div class="grid" data-grid="${FIELD}">${items.map(it => itemHtml(it)).join('')}</div>
  </section>`
}

function noteHtml(n: Note) {
  if (n.id === undefined || !n.kind) return `<li class="say">${n.text}</li>`
  const k = KINDS[n.kind]
  return `<li data-id="${n.id}" class="${n.mark ?? ''}" style="--c:${k.color}"><span class="li">${icon(k.icon)}</span><span><b>${k.name}</b> ${n.text}</span></li>`
}

function logHtml() {
  const split = s.log.findIndex(n => n.id === undefined)
  const night = split < 0 ? [] : s.log.slice(0, split)
  const loud = night.filter(n => !n.quiet)
  const quiet = night.length - loud.length
  const byBox = [...new Set(loud.map(n => n.box))].map(id => find(s, id!)).filter((c): c is Item => !!c)
    .map(c => [c, loud.filter(n => n.box === c.id)] as const)
  const morning = split < 0 ? s.log : s.log.slice(split)
  return `<h2>${s.day > 1 ? 'Last night' : 'The workshop'}</h2>
    ${byBox.map(([c, ns]) => `<h3>${icon(KINDS[c.kind].icon)}${KINDS[c.kind].name}</h3><ul>${ns.map(noteHtml).join('')}</ul>`).join('')}
    ${s.day > 1 && !loud.length ? '<p class="calm">A quiet night.</p>' : ''}
    ${quiet ? `<p class="calm">…and ${quiet} small change${quiet > 1 ? 's' : ''}. Hover things to see.</p>` : ''}
    <ul class="morning">${morning.map(noteHtml).join('')}</ul>`
}

function html() {
  const kinds = Object.keys(KINDS).length
  return `<header class="top">
      <div class="brand"><h1>The Workshop</h1><span class="day">Day ${s.day}</span></div>
      <div class="found" title="Kinds of things you've had in the workshop">${icon('sparkles')}Found ${s.seen.length} of ${kinds}</div>
      <div class="go"><span>Tomorrow, go to</span>${(Object.keys(PLACES) as Place[]).map(p =>
        `<button class="place ${s.place === p ? 'on' : ''}" data-place="${p}">${icon(PLACES[p].icon)}${PLACES[p].name}</button>`).join('')}
        <em>${PLACES[s.place].blurb}</em></div>
      <button class="sleep">${icon('night-sleep')}Sleep</button>
    </header>
    <div class="room">
      <main class="wall">
        ${floorHtml()}
        <div class="row">${panels().map(boxHtml).join('')}</div>
      </main>
      <aside class="log">${logHtml()}</aside>
    </div>
    <footer class="help">
      <span><kbd>drag</kbd> move</span><span><kbd>R</kbd> / <kbd>right-click</kbd> turn while dragging</span>
      <span><kbd>shift</kbd>-click send to ⇥</span><span><kbd>⌘/ctrl</kbd>+<kbd>shift</kbd>-click send all of a kind</span>
      <span><kbd>alt</kbd>-drag split a pile</span><span><kbd>double-click</kbd> a chest to open it</span><span>hover anything to see what tonight will do</span>
      <button class="reset" data-reset>start over</button>
    </footer>`
}

/** Redraw everything; things that moved glide from where they were. */
function render(from = rects()) {
  app.innerHTML = html()
  if (document.hidden) from = new Map() // background tabs freeze animations on their first frame
  for (const el of app.querySelectorAll<HTMLElement>('.item[data-id]')) {
    const was = from.get(+el.dataset.id!)
    if (!was) continue
    const now = el.getBoundingClientRect()
    const dx = was.left - now.left
    const dy = was.top - now.top
    if (Math.abs(dx) + Math.abs(dy) < 1) continue
    el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 170, easing: 'cubic-bezier(.2, .8, .3, 1)' })
  }
  pulse = new Set()
  born = new Set()
}
const rects = () => new Map([...app.querySelectorAll<HTMLElement>('.item[data-id]')].map(el => [+el.dataset.id!, el.getBoundingClientRect()]))

function changed(from?: Map<number, DOMRect>) {
  hideTip()
  save()
  fc = forecast(s)
  render(from)
}

// ---------------------------------------------------------------- tooltips

function place(el: Element, below = false) {
  const r = el.getBoundingClientRect()
  tip.classList.add('on')
  const t = tip.getBoundingClientRect()
  let x = below ? r.left : r.right + 12
  let y = below ? r.bottom + 10 : r.top
  if (x + t.width > innerWidth - 8) x = below ? innerWidth - 8 - t.width : r.left - 12 - t.width
  if (y + t.height > innerHeight - 8) y = innerHeight - 8 - t.height
  tip.style.transform = `translate(${Math.max(8, x)}px, ${Math.max(8, y)}px)`
}
const hideTip = () => tip.classList.remove('on')

function itemTip(it: Item) {
  const k = KINDS[it.kind]
  const rows: [string, string][] = []
  if (k.stack > 1) rows.push(['Pile', `${it.n} of ${k.stack}`])
  if (it.rotten) rows.push(['Fresh', 'rotten, and spreading to what it touches'])
  else if (it.fresh !== undefined) rows.push(['Fresh', `${it.fresh} night${it.fresh === 1 ? '' : 's'} left`])
  if (it.moist !== undefined && (it.moist > 0 || has(it, 'fuel'))) rows.push(['Damp', `${it.moist}%${it.moist > 20 && has(it, 'fuel') ? ', too wet to burn' : ''}`])
  if (it.grade !== undefined) rows.push(['Grade', `${gradeName(it.grade)} (${it.grade})`])
  if (it.cond !== undefined) rows.push(['Condition', `${it.cond}%${it.cond < 40 ? ', too worn to help' : ''}`])
  if (it.uses !== undefined) rows.push(['Salt', `${it.uses} fish left`])
  if (it.ferment) rows.push(['Fermenting', `${it.ferment} of 3 nights`])
  if (it.age !== undefined) rows.push(['Aged', `${it.age} night${it.age === 1 ? '' : 's'}`])
  const lines = fc.get(it.id) ?? []
  tip.innerHTML = `<h3 style="--c:${k.color}">${label(it)}</h3><p>${k.blurb}</p>
    ${rows.length ? `<dl>${rows.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('')}</dl>` : ''}
    <h4>Tonight, in the ${nameOf(s, it.at)}</h4>
    ${lines.length ? `<ul>${lines.map(l => `<li>${l}</li>`).join('')}</ul>` : '<p class="none">Nothing happens to it here.</p>'}`
}

function boxTip(id: number) {
  const c = find(s, id)
  if (!c) return hideTip()
  const k = KINDS[c.kind]
  const f = fire(c)
  tip.innerHTML = `<h3>${k.name}</h3><p>${k.blurb}</p>${f ? `<p class="none">${f.env}</p>` : ''}${s.target === id ? '<p class="none">Shift-click sends things here.</p>' : ''}`
}

let lit: Element | null = null
function hover(e: PointerEvent) {
  const t = e.target as HTMLElement
  const itemEl = t.closest?.('.item[data-id]')
  const head = t.closest?.<HTMLElement>('[data-boxtip]')
  const li = t.closest?.<HTMLElement>('.log li[data-id]')
  const spot = li && app.querySelector(`.wall .item[data-id="${li.dataset.id}"]`)
  if (spot !== lit) { lit?.classList.remove('spot'); spot?.classList.add('spot'); lit = spot ?? null }
  if (itemEl) {
    const it = find(s, +(itemEl as HTMLElement).dataset.id!)
    if (!it) return hideTip()
    itemTip(it)
    place(itemEl)
  } else if (head) {
    boxTip(+head.dataset.boxtip!)
    place(head, true)
  } else hideTip()
}

// ---------------------------------------------------------------- handling

interface Drag { held: Held; el: HTMLElement; gx: number; gy: number; rot: boolean; plan: Plan | null; key: string; box: number | null }
let press: { id: number; x: number; y: number; alt: boolean; gx: number; gy: number } | null = null
let drag: Drag | null = null
let last: PointerEvent | null = null

app.addEventListener('pointerdown', e => {
  if (e.button !== 0 || drag || busy) return
  const el = (e.target as HTMLElement).closest<HTMLElement>('.item[data-id]')
  if (!el) return
  const r = el.getBoundingClientRect()
  // Grab point measured from the item's footprint (the tile sits 2px inside it).
  press = { id: +el.dataset.id!, x: e.clientX, y: e.clientY, alt: e.altKey, gx: e.clientX - r.left + 2, gy: e.clientY - r.top + 2 }
  e.preventDefault()
})

addEventListener('pointermove', e => {
  last = e
  if (press && !drag && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 4) begin()
  if (drag) move(e)
  else hover(e)
})

addEventListener('pointerup', e => {
  if (drag) return finish()
  if (press && e.shiftKey) quickSend(press.id, e.metaKey || e.ctrlKey)
  press = null
})

addEventListener('contextmenu', e => {
  if (!drag) return
  e.preventDefault()
  turn()
})

addEventListener('keydown', e => {
  if (drag && (e.key === 'r' || e.key === 'R')) turn()
  if (drag && e.key === 'Escape') cancel()
})

function begin() {
  const held = lift(s, press!.id, press!.alt)
  if (!held) { press = null; return }
  hideTip()
  const el = document.body.appendChild(document.createElement('div'))
  el.className = 'floating'
  drag = { held, el, gx: press!.gx, gy: press!.gy, rot: held.item.rot, plan: null, key: '', box: null }
  press = null
  if (held.from) app.querySelector(`.item[data-id="${held.item.id}"]`)?.classList.add('lifted')
  else render() // the pile it came from is smaller now
  paintFloating()
  document.body.classList.add('dragging')
}

function paintFloating() {
  const d = drag!
  d.el.innerHTML = itemHtml({ ...d.held.item, rot: d.rot, x: 0, y: 0 })
}

function turn() {
  const d = drag!
  if (KINDS[d.held.item.kind].w === KINDS[d.held.item.kind].h) return
  d.rot = !d.rot;
  [d.gx, d.gy] = [d.gy, d.gx]
  d.key = ''
  paintFloating()
  if (last) move(last)
}

/** Resting a dragged thing over a container opens it, so nesting never costs a click. */
let dwell: { id: number; timer: number } | null = null
function hoverOpen(e: PointerEvent) {
  const el = document.elementsFromPoint(e.clientX, e.clientY).map(n => n.closest<HTMLElement>('.item.boxy[data-id]')).find(Boolean)
  const id = el ? +el.dataset.id! : null
  if (dwell?.id === id) return
  if (dwell) clearTimeout(dwell.timer)
  dwell = null
  if (id === null || id === drag!.held.item.id || s.open.includes(id)) return
  dwell = { id, timer: window.setTimeout(() => {
    dwell = null
    if (!drag || s.open.includes(id)) return
    s.open.push(id)
    render()
    drag.key = ''
    if (last) move(last)
  }, 450) }
}

function move(e: PointerEvent) {
  const d = drag!
  d.el.style.transform = `translate(${e.clientX - d.gx}px, ${e.clientY - d.gy}px)`
  hoverOpen(e)
  const boxEl = document.elementsFromPoint(e.clientX, e.clientY).map(n => n.closest('.box')).find(Boolean) as HTMLElement | undefined
  if (!boxEl) {
    if (d.key) { d.key = ''; d.plan = null; d.box = null; clearGhosts(); hideTip() }
    return
  }
  const box = +boxEl.dataset.box!
  const r = boxEl.querySelector('.grid')!.getBoundingClientRect()
  const x = Math.round((e.clientX - d.gx - r.left) / cell)
  const y = Math.round((e.clientY - d.gy - r.top) / cell)
  const key = `${box}:${x}:${y}:${d.rot}`
  if (key !== d.key) {
    d.key = key
    d.box = box
    d.plan = planDrop(s, d.held, box, x, y, d.rot)
    paintGhosts(box, x, y)
    dragTip(box)
  }
  place(d.el.firstElementChild!)
}

function clearGhosts() {
  for (const g of app.querySelectorAll('.ghost')) g.remove()
  for (const el of app.querySelectorAll('.shoved')) el.classList.remove('shoved')
}

function ghost(box: number, x: number, y: number, w: number, h: number, cls: string, cells: ReturnType<typeof cellsOf> = null) {
  const tiles = cells ? cells.map(([cx, cy]) => `<u class="gc" style="--cx:${cx};--cy:${cy}"></u>`).join('') : ''
  app.querySelector(`[data-grid="${box}"]`)!.insertAdjacentHTML('beforeend', `<div class="ghost ${cls} ${cells ? 'shaped' : ''}" style="--x:${x};--y:${y};--w:${w};--h:${h}">${tiles}</div>`)
}

function paintGhosts(box: number, x: number, y: number) {
  clearGhosts()
  const d = drag!
  const p = d.plan
  if (!p) {
    const dd = dims({ ...d.held.item, rot: d.rot })
    const b = room(s, box)
    ghost(box, Math.max(0, Math.min(b.w - dd.w, x)), Math.max(0, Math.min(b.h - dd.h, y)), dd.w, dd.h, 'bad', cellsOf({ ...d.held.item, rot: d.rot }))
    return
  }
  if (p.merge !== undefined) {
    const pile = find(s, p.merge)!
    const pd = dims(pile)
    ghost(box, pile.x, pile.y, pd.w, pd.h, 'merge')
    return
  }
  const dd = dims({ ...d.held.item, rot: p.rot })
  ghost(box, p.x, p.y, dd.w, dd.h, 'land', cellsOf({ ...d.held.item, rot: p.rot }))
  for (const mv of p.moves) {
    const o = find(s, mv.id)!
    const md = dims({ ...o, rot: mv.rot })
    ghost(mv.at, mv.x, mv.y, md.w, md.h, 'shove', cellsOf({ ...o, rot: mv.rot }))
    app.querySelector(`.item[data-id="${mv.id}"]`)?.classList.add('shoved')
  }
}

function dragTip(box: number) {
  const d = drag!
  const where_ = nameOf(s, box)
  if (!d.plan) { tip.innerHTML = `<p class="bad">${accepts(s, box, d.held.item) ? `No room in the ${where_}.` : `The ${where_} won’t take that.`}</p>`; return }
  const lines = forecastDrop(s, d.held, d.plan)
  const head = d.plan.merge !== undefined ? `Joins the pile. Tonight, in the ${where_}:` : `Tonight, in the ${where_}:`
  tip.innerHTML = `<h4>${head}</h4>${lines.length ? `<ul>${lines.map(l => `<li>${l}</li>`).join('')}</ul>` : '<p class="none">Nothing happens to it here.</p>'}`
}

function finish() {
  const d = drag!
  drag = null
  if (dwell) clearTimeout(dwell.timer)
  dwell = null
  document.body.classList.remove('dragging')
  hideTip()
  const from = rects()
  from.set(d.held.item.id, d.el.firstElementChild!.getBoundingClientRect())
  if (d.plan) applyDrop(s, d.held, d.plan)
  else putBack(s, d.held)
  d.el.remove()
  changed(from)
}

function cancel() {
  const d = drag!
  drag = null
  if (dwell) clearTimeout(dwell.timer)
  dwell = null
  document.body.classList.remove('dragging')
  hideTip()
  const from = rects()
  from.set(d.held.item.id, d.el.firstElementChild!.getBoundingClientRect())
  putBack(s, d.held)
  d.el.remove()
  changed(from)
}

function quickSend(id: number, all: boolean) {
  const it = find(s, id)
  if (!it) return
  const other = (kind: string) => s.items.find(o => o.kind === kind)!.id
  const to = it.at === s.target ? (find(s, s.target)?.kind === 'basket' ? other('crate') : other('basket')) : s.target
  const from = rects()
  if (send(s, id, to, all)) changed(from)
  else app.querySelector(`.item[data-id="${id}"]`)?.animate(
    [{ transform: 'translateX(0)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }], { duration: 220 })
}

// ---------------------------------------------------------------- buttons and the night

let busy = false
const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

async function night() {
  if (busy || drag) return
  busy = true
  hideTip()
  veil.innerHTML = `<div>${icon('night-sleep')}<p>Night ${s.day}</p></div>`
  veil.classList.add('on')
  await wait(700)
  const before = new Set(s.items.map(o => o.id))
  const notes = sleep(s)
  pulse = new Set(notes.filter(n => !n.quiet && n.id !== undefined && n.mark !== 'new').map(n => n.id!))
  born = new Set(s.items.map(o => o.id).filter(id => !before.has(id)))
  changed(new Map())
  veil.querySelector('p')!.textContent = `Day ${s.day}`
  await wait(500)
  veil.classList.remove('on')
  busy = false
}

app.addEventListener('dblclick', e => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('.item.boxy[data-id]')
  const id = el && +el.dataset.id!
  if (!id) return
  s.open = s.open.includes(id) ? s.open.filter(o => o !== id) : [...s.open, id]
  changed()
})

let resetArmed = false
app.addEventListener('click', e => {
  const t = e.target as HTMLElement
  const btn = t.closest<HTMLElement>('button')
  if (!btn) return
  if (btn.dataset.place) { s.place = btn.dataset.place as Place; changed() }
  else if (btn.dataset.pin) { s.target = +btn.dataset.pin; changed() }
  else if (btn.dataset.close) { s.open = s.open.filter(id => id !== +btn.dataset.close!); changed() }
  else if (btn.dataset.tidy) { const from = rects(); tidy(s, +btn.dataset.tidy); changed(from) }
  else if (btn.classList.contains('sleep')) night()
  else if (btn.dataset.reset !== undefined) {
    if (!resetArmed) { resetArmed = true; btn.textContent = 'sure? click again'; setTimeout(() => { resetArmed = false; btn.textContent = 'start over' }, 2500); return }
    resetArmed = false
    s = start()
    changed(new Map())
  }
})

addEventListener('resize', () => { fit(); render(new Map()) })
fit()
render(new Map())
