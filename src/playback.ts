import './playback.css'
import { Fight, type FightEvent, type Side, type SideSetup } from './engine/combat.ts'

/** What playback needs from the page. Side 0 is the player, side 1 the opponent. */
export interface Stage {
  scene: HTMLElement
  cardEl(id: string): HTMLElement
  hp: [HTMLElement, HTMLElement]
  portrait: [HTMLElement, HTMLElement]
  hovering(): boolean
  speed(): number // playback speed multiplier
}

const FINAL_BLOW_MS = 250 // game time before the end where slow-mo kicks in (5 frames, like the live client)
const SLOWMO = 0.2
const TIME_EASE = 6 // per second, time scale follows its target
const END_HOLD_MS = 1400 // real time after the last blow before the banner

const COLOR: Partial<Record<FightEvent['kind'] | 'storm', string>> = {
  damage: '#ff4b3a', heal: '#7edc5a', shield: '#f5cc3d', burn: '#ff9b3a', poison: '#58d69b', regen: '#9be27a', storm: '#e0c080',
}

/** Play a fight on the stage in real time; resolves with the winner when the player dismisses the banner. */
export function play(a: SideSetup, b: SideSetup, seed: number, stage: Stage): Promise<-1 | 0 | 1> {
  const fight = new Fight(a, b, seed)
  const endsAt = new Fight(a, b, seed).run().t // same seed, same fight: know when the final blow lands
  const units = fight.sides.flatMap(s => s.items)
  const overlays = new Map(units.map(unit => [unit, overlay(stage.cardEl(unit.id))]))
  stage.scene.classList.add('fighting')

  let game = 0
  let scale = 1
  let last = performance.now()
  let endedAt = 0

  return new Promise(resolve => {
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const target = stage.hovering() ? 0 : game >= endsAt - FINAL_BLOW_MS ? SLOWMO : 1
      scale += (target - scale) * (1 - Math.exp(-TIME_EASE * dt))
      game += dt * 1000 * scale * stage.speed()
      while (fight.winner === null && fight.t + 50 <= game) for (const e of fight.step()) show(e)

      for (const [unit, o] of overlays) {
        o.cd.style.setProperty('--cd', unit.attrs.cooldown > 0 ? `${unit.progress / unit.attrs.cooldown}` : '1')
        const [kind, ms] = unit.freeze > 0 ? ['freeze', unit.freeze] : unit.slow > 0 ? ['slow', unit.slow] : unit.haste > 0 ? ['haste', unit.haste] : ['', 0]
        o.timer.className = `timer ${kind}`
        o.timer.textContent = ms ? (ms / 1000).toFixed(1) : ''
        o.pips.forEach((p, i) => p.classList.toggle('spent', i >= unit.ammo))
      }
      fight.sides.forEach((s, i) => bar(stage.hp[i], s))

      if (fight.winner !== null && !endedAt) endedAt = now
      if (endedAt && now - endedAt > END_HOLD_MS) return banner(fight.winner!)
      requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)

    function banner(winner: -1 | 0 | 1) {
      const el = document.createElement('div')
      el.className = `banner ${winner === 0 ? 'win' : winner === 1 ? 'loss' : 'draw'}`
      el.innerHTML = `<h2>${winner === 0 ? 'Victory!' : winner === 1 ? 'Defeat' : 'Draw'}</h2><button>Continue</button>`
      stage.scene.append(el)
      el.querySelector('button')!.addEventListener('click', () => {
        el.remove()
        for (const o of overlays.values()) o.remove()
        stage.scene.classList.remove('fighting')
        resolve(winner)
      })
    }
  })

  function show(e: FightEvent) {
    if (e.kind === 'use') {
      const el = stage.cardEl(e.item!)
      el.animate([{ scale: '1' }, { scale: '1.08' }, { scale: '1' }], { duration: 220, easing: 'ease-out' })
      overlays.get(units.find(u => u.id === e.item)!)!.flash(e.crit ? '#ffd24a' : '#ffffff')
      return
    }
    if (e.side === undefined || !(e.kind in COLOR)) return
    const p = stage.portrait[e.side]
    const sign = e.kind === 'damage' ? '-' : '+'
    float(p, `${sign}${e.amount}`, COLOR[e.from === 'storm' ? 'storm' : e.from === 'burn' ? 'burn' : e.from === 'poison' ? 'poison' : e.kind]!, e.amount!)
    if (e.kind === 'damage' && e.amount! > 0) p.animate([{ translate: '0 0' }, { translate: '-3px 2px' }, { translate: '3px -2px' }, { translate: '0 0' }], { duration: 160 })
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
    remove() {
      cd.remove()
      flash.remove()
      timer.remove()
      card.querySelectorAll('.ammo i').forEach(p => p.classList.remove('spent'))
    },
  }
}
