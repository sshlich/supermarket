import './playback.css'
import { Fight, type FightEvent, type FightOptions, type Side, type SideSetup, type UnitDef } from './engine/combat.ts'
import { emit } from './fx.ts'
import { sfx } from './sfx.ts'

/** What playback needs from the page. Side 0 is the player, side 1 the opponent. */
export interface Stage {
  scene: HTMLElement
  cardEl(id: string): HTMLElement
  skillEl(id: string): HTMLElement | undefined
  transformed(id: string, def: UnitDef): void // redraw a card that transformed (for the fight, or for good)
  log(e: FightEvent): void // every event, as it plays
  hp: [HTMLElement, HTMLElement]
  portrait: [HTMLElement, HTMLElement]
  hovering(): boolean
  speed(): number // playback speed multiplier
}

const FINAL_BLOW_MS = 250 // game time before the end where slow-mo kicks in (5 frames, like the live client)
const SLOWMO = 0.2
const TIME_EASE = 6 // per second, time scale follows its target
const END_HOLD_MS = 1400 // real time after the last blow before the banner
const HITSTOP_MS = 70 // real time the fight holds still on a big hit (crits hold a little longer)
const BIG_HIT = 0.08 // share of max health that counts as a big hit

const COLOR: Partial<Record<FightEvent['kind'] | 'storm', string>> = {
  damage: '#ff4b3a', heal: '#7edc5a', shield: '#f5cc3d', burn: '#ff9b3a', poison: '#58d69b', regen: '#c2e25a', storm: '#e0c080', gold: '#f5c542',
}

/** Play a fight on the stage in real time; resolves when the player dismisses the banner, with everything that happened. */
export function play(a: SideSetup, b: SideSetup, seed: number, stage: Stage, opts: FightOptions = {}): Promise<{ winner: -1 | 0 | 1; events: FightEvent[] }> {
  const fight = new Fight(a, b, seed, opts)
  const endsAt = new Fight(a, b, seed, opts).run().t // same seed, same fight: know when the final blow lands
  const units = fight.sides.flatMap(s => s.items)
  const overlays = new Map(units.map(unit => [unit, overlay(stage.cardEl(unit.id))]))
  stage.scene.classList.add('fighting')

  let game = 0
  let scale = 1
  let last = performance.now()
  let endedAt = 0
  let holdUntil = 0 // hit-stop
  const auras = [aura(stage.portrait[0], true), aura(stage.portrait[1], false)]

  return new Promise(resolve => {
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const target = stage.hovering() ? 0 : game >= endsAt - FINAL_BLOW_MS ? SLOWMO : 1
      scale += (target - scale) * (1 - Math.exp(-TIME_EASE * dt))
      if (now >= holdUntil) game += dt * 1000 * scale * stage.speed()
      while (fight.winner === null && fight.t + 50 <= game) for (const e of fight.step()) show(e)

      for (const [unit, o] of overlays) {
        o.cd.style.setProperty('--cd', unit.attrs.cooldown > 0 ? `${unit.progress / unit.attrs.cooldown}` : '1')
        const [kind, ms] = unit.freeze > 0 ? ['freeze', unit.freeze] : unit.slow > 0 ? ['slow', unit.slow] : unit.haste > 0 ? ['haste', unit.haste] : ['', 0]
        o.timer.className = `timer ${kind}`
        o.timer.textContent = ms ? (ms / 1000).toFixed(1) : ''
        o.pips.forEach((p, i) => p.classList.toggle('spent', i >= unit.ammo))
      }
      fight.sides.forEach((s, i) => {
        bar(stage.hp[i], s)
        auras[i].update(s, dt)
      })

      if (fight.winner !== null && !endedAt) endedAt = now
      if (endedAt && now - endedAt > END_HOLD_MS) return banner(fight.winner!)
      requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)

    function banner(winner: -1 | 0 | 1) {
      const el = document.createElement('div')
      el.className = `banner ${winner === 0 ? 'win' : winner === 1 ? 'loss' : 'draw'}`
      ;(winner === 0 ? sfx.win : sfx.lose)()
      el.innerHTML = `<h2>${winner === 0 ? 'Victory!' : winner === 1 ? 'Defeat' : 'Draw'}</h2><button>Continue</button>`
      stage.scene.append(el)
      el.querySelector('button')!.addEventListener('click', () => {
        el.remove()
        for (const o of overlays.values()) o.remove()
        for (const a of auras) a.remove()
        stage.scene.classList.remove('fighting')
        resolve({ winner, events: fight.events })
      })
    }
  })

  function show(e: FightEvent) {
    stage.log(e)
    const unit = e.item ? units.find(u => u.id === e.item) : undefined
    if (unit && (e.kind === 'destroy' || e.kind === 'repair')) {
      ;(e.kind === 'destroy' ? sfx.destroy : sfx.upgrade)()
      return overlays.get(unit)!.destroyed(e.kind === 'destroy')
    }
    if (unit && e.kind === 'grow') return overlays.get(unit)!.flash('#f5d77a')
    if (unit && e.kind === 'transform') {
      overlays.get(unit)!.remove()
      stage.transformed(unit.id, unit.def)
      overlays.set(unit, overlay(stage.cardEl(unit.id)))
      return
    }
    if (e.kind === 'skill') {
      sfx.skill()
      stage.skillEl(e.item!)?.animate([{ scale: '1', filter: 'brightness(1)' }, { scale: '1.25', filter: 'brightness(1.8)' }, { scale: '1', filter: 'brightness(1)' }], { duration: 320, easing: 'ease-out' })
      return
    }
    if (e.kind === 'use') {
      sfx.use(e.side === 1)
      const el = stage.cardEl(e.item!)
      el.animate([{ scale: '1' }, { scale: '1.08' }, { scale: '1' }], { duration: 220, easing: 'ease-out' })
      overlays.get(units.find(u => u.id === e.item)!)!.flash(e.crit ? '#ffd24a' : '#ffffff')
      return
    }
    if (e.side === undefined || !(e.kind in COLOR)) return
    const p = stage.portrait[e.side]
    const sign = e.kind === 'damage' ? '-' : '+'
    const from = e.from === 'storm' || e.from === 'burn' || e.from === 'poison' || e.from === 'regen' ? e.from : e.kind
    float(p, `${sign}${e.amount}`, COLOR[from]!, e.amount!)
    const u = p.offsetWidth / 1.8
    const at = { x: p.offsetLeft + p.offsetWidth / 2, y: p.offsetTop + p.offsetHeight / 2, w: p.offsetWidth * 0.5, h: p.offsetHeight * 0.4 }
    const share = (e.amount ?? 0) / fight.sides[e.side].maxHp
    if (e.kind === 'damage' && e.amount! > 0) {
      const tick = e.from === 'burn' || e.from === 'poison'
      if (e.from === 'burn') sfx.burn()
      else if (e.from === 'poison') sfx.poison()
      else sfx.hit(share, !!e.crit)
      emit(tick ? 2 : Math.min(18, 4 + Math.round(share * 60)), { ...at, colors: tick ? [COLOR[from]!] : ['#fff', '#ffd0c0', COLOR.damage!], vx: u * 1.4, vy: -u * 0.6, vyJitter: u * 0.9, gravity: u * 3, life: 0.45, size: Math.max(2, Math.round(u * 0.05)) })
      const m = Math.min(9, 2 + share * 70) // shake grows with the hit
      p.animate([{ translate: '0 0' }, { translate: `${-m}px ${m * 0.6}px` }, { translate: `${m * 0.7}px ${-m * 0.5}px` }, { translate: '0 0' }], { duration: 170 })
      if (!tick && (e.crit || share >= BIG_HIT)) holdUntil = performance.now() + HITSTOP_MS * (e.crit ? 1.4 : 1)
      if (!tick && e.side === 0 && share >= BIG_HIT) stage.scene.animate([{ transform: 'none' }, { transform: `translate(${m * 0.5}px, ${-m * 0.4}px)` }, { transform: 'none' }], { duration: 140 })
    }
    if (e.blocked) sfx.block()
    if (e.kind === 'shield') sfx.shield()
    if (e.kind === 'heal') (e.from === 'regen' ? sfx.regen : sfx.heal)()
    if (e.blocked) emit(Math.min(10, 3 + e.blocked / 5), { ...at, colors: ['#ffe27a', '#fff3b0'], vx: u * 1.2, vy: -u * 0.4, vyJitter: u * 0.6, gravity: u * 2.5, life: 0.35, size: Math.max(2, Math.round(u * 0.04)) })
    if (e.kind === 'heal' && e.from !== 'regen') emit(6, { ...at, colors: ['#7edc5a', '#c8ffb0'], vx: u * 0.2, vy: -u * 0.5, vyJitter: u * 0.2, life: 0.8, size: Math.max(2, Math.round(u * 0.045)), flicker: true })
  }
}

const FAN = 0.45 // slot units between numbers that spawn close together
const recent = new WeakMap<HTMLElement, number[]>()

/**
 * Floating number rising off an element; bigger hits are bigger. Numbers that land close together fan
 * out left/right of the anchor (0, -1, +1, -2, +2 ...) with a little random jitter, so bursts stay readable.
 */
function float(anchor: HTMLElement, text: string, color: string, amount: number) {
  const now = performance.now()
  const times = (recent.get(anchor) ?? []).filter(t => now - t < 450)
  times.push(now)
  recent.set(anchor, times)
  const n = times.length - 1
  const slot = (n % 2 ? -1 : 1) * Math.ceil(n / 2)
  const u = anchor.offsetWidth / 1.8 // portraits are 1.8 slots wide
  const el = document.createElement('div')
  el.className = 'float'
  el.textContent = text
  el.style.color = color
  el.style.setProperty('--big', `${Math.min(1, amount / 60)}`)
  el.style.setProperty('--dx', `${(Math.random() - 0.5) * 0.5 * u}px`)
  el.style.left = `${anchor.offsetLeft + anchor.offsetWidth / 2 + (slot * FAN + (Math.random() - 0.5) * 0.25) * u}px`
  el.style.top = `${anchor.offsetTop + anchor.offsetHeight * (0.5 + (Math.random() - 0.5) * 0.25)}px`
  anchor.parentElement!.append(el)
  el.addEventListener('animationend', () => el.remove())
}

/** Health bar: health fill, shield overlay, and the status numbers. */
function bar(el: HTMLElement, s: Side) {
  const fill = el.querySelector('i')!
  const shield = el.querySelector('b')!
  const text = el.querySelector('span')!
  fill.style.width = `${(Math.max(0, s.hp) / s.maxHp) * 100}%`
  shield.style.width = `${Math.min(1, s.shield / s.maxHp) * 100}%`
  const parts = [`<em>${Math.max(0, Math.ceil(s.hp))}</em>`]
  if (s.shield > 0) parts.push(`<em class="shield">${s.shield}</em>`)
  if (s.burn > 0) parts.push(`<em class="burn">${s.burn}</em>`)
  if (s.poison > 0) parts.push(`<em class="poison">${s.poison}</em>`)
  if (s.regen > 0) parts.push(`<em class="regen">${s.regen}</em>`)
  const html = parts.join('')
  if (text.innerHTML !== html) text.innerHTML = html
}

/** Per-card combat layers: cooldown dimmer with its scan line, flash, timer badge, ammo pips. */
function overlay(card: HTMLElement) {
  const cd = document.createElement('div')
  cd.className = 'cd'
  const flash = document.createElement('div')
  flash.className = 'flash'
  const timer = document.createElement('div')
  timer.className = 'timer'
  card.querySelector('.frame')!.before(cd, flash)
  card.append(timer)
  return {
    cd,
    timer,
    pips: [...card.querySelectorAll<HTMLElement>('.ammo i')],
    flash(color: string) {
      flash.style.setProperty('--flash', color)
      flash.animate([{ opacity: 0.9 }, { opacity: 0 }], { duration: 280, easing: 'ease-out' })
    },
    destroyed(on: boolean) {
      card.classList.toggle('destroyed', on)
      card.animate([{ translate: '0 0' }, { translate: '-3px 2px' }, { translate: '3px -2px' }, { translate: '0 0' }], { duration: 200 })
    },
    remove() {
      cd.remove()
      flash.remove()
      timer.remove()
      card.classList.remove('destroyed')
      card.querySelectorAll('.ammo i').forEach(p => p.classList.remove('spent'))
    },
  }
}

type Status = 'burn' | 'poison' | 'shield' | 'regen' | 'low'
const STATUSES: Status[] = ['burn', 'poison', 'shield', 'regen', 'low']
const AURA_EASE = 6 // per second: auras grow and fade instead of popping
const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

/**
 * How much each status matters to a side right now, 0..1: any amount shows (a floor), and more as it
 * threatens more of the health left. Burn counts what's left of it all told, Poison ten seconds of it.
 */
export function severity(s: Side): Record<Status, number> {
  const hp = Math.max(1, s.hp)
  return {
    burn: s.burn > 0 ? 0.3 + 0.7 * clamp01((s.burn * (s.burn + 1)) / 2 / hp) : 0,
    poison: s.poison > 0 ? 0.3 + 0.7 * clamp01((s.poison * 10) / hp) : 0,
    shield: s.shield > 0 ? 0.35 + 0.65 * clamp01((s.shield * 2) / s.maxHp) : 0,
    regen: s.regen > 0 ? 0.3 + 0.7 * clamp01((s.regen * 10) / s.maxHp) : 0,
    low: clamp01((0.35 - Math.max(0, s.hp) / s.maxHp) / 0.35),
  }
}

/**
 * A side's status auras. The portrait gets --burn, --poison, --shield, --regen and --low (0..1) for its CSS
 * layers, and gives off embers, bubbles and sparkles to match. Yours also tint the screen's edges once they're
 * severe, and a Shield that breaks shatters.
 */
function aura(portrait: HTMLElement, mine: boolean) {
  const level: Record<Status, number> = { burn: 0, poison: 0, shield: 0, regen: 0, low: 0 }
  const owed: Record<Status, number> = { burn: 0, poison: 0, shield: 0, regen: 0, low: 0 } // particles due
  let shieldWas = 0
  const edge = mine ? document.body.appendChild(Object.assign(document.createElement('div'), { className: 'edge' })) : null

  return {
    update(s: Side, dt: number) {
      const want = severity(s)
      const k = 1 - Math.exp(-AURA_EASE * dt)
      for (const st of STATUSES) {
        level[st] += (want[st] - level[st]) * k
        portrait.style.setProperty(`--${st}`, level[st].toFixed(3))
        if (edge) edge.style.setProperty(`--${st}`, clamp01((level[st] - 0.45) / 0.55).toFixed(3))
      }
      const p = portrait
      const u = p.offsetWidth / 1.8
      const size = Math.max(2, Math.round(u * 0.045))
      const cx = p.offsetLeft + p.offsetWidth / 2
      const spawn = (st: Status, perSecond: number, burst: Omit<Parameters<typeof emit>[1], 'x' | 'y'> & { y: number }) => {
        owed[st] += level[st] * perSecond * dt
        const n = Math.floor(owed[st])
        owed[st] -= n
        if (n) emit(n, { x: cx, ...burst })
      }
      spawn('burn', 40, { y: p.offsetTop + p.offsetHeight * 0.85, w: p.offsetWidth * 0.85, h: p.offsetHeight * 0.2, colors: ['#ffd24a', '#ff9b3a', '#ff5a2a'], vx: u * 0.15, vy: -u * 0.8, vyJitter: u * 0.3, gravity: -u * 0.4, life: 0.9, size, flicker: true })
      spawn('poison', 16, { y: p.offsetTop + p.offsetHeight * 0.6, w: p.offsetWidth * 0.8, h: p.offsetHeight * 0.6, colors: ['#58d69b', '#3aa070', '#b0f5d0'], vx: u * 0.06, vy: -u * 0.25, vyJitter: u * 0.1, life: 1.3, size })
      spawn('regen', 10, { y: p.offsetTop + p.offsetHeight * 0.5, w: p.offsetWidth * 0.9, h: p.offsetHeight * 0.8, colors: ['#c2e25a', '#efffc0'], vx: u * 0.05, vy: -u * 0.3, life: 1, size, flicker: true })
      if (shieldWas > 0 && s.shield <= 0) {
        emit(24, { x: cx, y: p.offsetTop + p.offsetHeight / 2, w: p.offsetWidth, h: p.offsetHeight, colors: ['#ffe27a', '#fff3b0', '#d8a520'], vx: u * 1.6, vy: -u * 0.8, vyJitter: u, gravity: u * 4, life: 0.7, size: size + 1 })
        p.animate([{ filter: 'brightness(2)' }, { filter: 'none' }], { duration: 250, easing: 'steps(3)' })
        sfx.shatter()
      }
      shieldWas = s.shield
    },
    remove() {
      for (const st of STATUSES) portrait.style.removeProperty(`--${st}`)
      edge?.remove()
    },
  }
}
