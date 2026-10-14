// Sounds, all made on the spot with Web Audio (nothing to load): short tones and filtered noise, a little different every
// time. The rule: quiet and soft, never in the way, but each one recognisable. Everything goes through a gentle low-pass
// so nothing is shrill. Things sound like what they are made of: a kind's `sound` in kinds.json names its material, and
// each material has a sound for being picked up, put down and used (poured, opened). The rest are for the shop: a bell
// when a line comes in, coins, a refusal, the terminal's keys, a page turning. On/off and volume are in the menu.

type Action = 'lift' | 'drop' | 'use' | 'turn'

let ctx: AudioContext | null = null
let master: GainNode
let noiseBuf: AudioBuffer
const stored = <T>(key: string, fallback: T): T => { try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback } catch { return fallback } }
const store = (key: string, v: unknown) => { try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* private window */ } }
export let soundOn = stored('sound-on', true)
/** 0 to 1. */
export let volume = stored('sound-volume', 0.7)
const LEVEL = 0.4 // what full volume means: still not loud
export function toggleSound() { soundOn = !soundOn; store('sound-on', soundOn); return soundOn }
export function setVolume(v: number) {
  volume = Math.max(0, Math.min(1, v))
  store('sound-volume', volume)
  if (ctx) master.gain.value = LEVEL * volume
}

/** The audio context, made on first use (always after a click or a key, so the browser lets it play). */
function ac() {
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = LEVEL * volume
    const soft = ctx.createBiquadFilter() // takes the edge off everything
    soft.type = 'lowpass'
    soft.frequency.value = 4800
    master.connect(soft).connect(ctx.destination)
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}
/** While a group sounds (see `handleMany`): how late this part starts and how loud it is, for every tone and noise in it. */
let shift = 0, damp = 1
/** A little off every time, so nothing sounds like a machine gun. */
const vary = (v: number, k = 0.06) => v * (1 + (Math.random() * 2 - 1) * k)

interface Shape { d: number; g: number; a?: number; at?: number; to?: number }
/** A tone: frequency `f`, gliding to `to`, fading over `d` seconds. */
function tone(f: number, o: Shape & { type?: OscillatorType }) {
  const c = ac(), t = c.currentTime + (o.at ?? 0) + shift
  const osc = c.createOscillator()
  osc.type = o.type ?? 'sine'
  osc.frequency.setValueAtTime(f, t)
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + o.d)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(o.g * damp, t + (o.a ?? 0.006))
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.d)
  osc.connect(g).connect(master)
  osc.start(t)
  osc.stop(t + o.d + 0.02)
}
/** Noise through a filter at `f` (sweeping to `to`): rustles, clicks, thuds, crinkles. */
function noise(f: number, o: Shape & { type?: BiquadFilterType; q?: number }) {
  const c = ac(), t = c.currentTime + (o.at ?? 0) + shift
  const src = c.createBufferSource()
  src.buffer = noiseBuf
  const filter = c.createBiquadFilter()
  filter.type = o.type ?? 'bandpass'
  filter.frequency.setValueAtTime(f, t)
  if (o.to) filter.frequency.exponentialRampToValueAtTime(o.to, t + o.d)
  filter.Q.value = o.q ?? 1
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(o.g * damp, t + (o.a ?? 0.004))
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.d)
  src.connect(filter).connect(g).connect(master)
  src.start(t, Math.random() * 0.5)
  src.stop(t + o.d + 0.02)
}
const times = (n: number, gap: number, f: (i: number, at: number) => void) => { for (let i = 0; i < n; i++) f(i, i * gap + Math.random() * gap * 0.4) }
const crinkle = (n: number, g: number) => times(n, 0.024, (_, at) => noise(vary(4200, 0.2), { d: 0.016, g, q: 1.5, at }))

/** What each material sounds like. Anything without one is a plain thing. */
const MATERIALS: Record<string, Partial<Record<Action, () => void>>> = {
  thing: {
    lift: () => noise(vary(800), { d: 0.05, g: 0.05, q: 0.7 }),
    drop: () => { tone(vary(130), { d: 0.09, g: 0.12, to: 85 }); noise(500, { d: 0.05, g: 0.05, type: 'lowpass' }) },
  },
  glass: { // a low, round clink, not a ping
    lift: () => { tone(vary(1250), { d: 0.08, g: 0.022 }); tone(vary(1870), { d: 0.05, g: 0.008, at: 0.008 }) },
    drop: () => { tone(vary(140), { d: 0.07, g: 0.09, to: 95 }); tone(vary(1050), { d: 0.18, g: 0.03, at: 0.004 }); tone(vary(1580), { d: 0.12, g: 0.012, at: 0.006 }) },
    use: () => { times(6, 0.1, (_, at) => { const f = vary(260, 0.25); tone(f, { d: 0.08, g: 0.06, at, to: f * 1.6 }) }); noise(600, { d: 0.7, g: 0.025, type: 'lowpass', a: 0.1 }) },
  },
  paper: {
    lift: () => noise(vary(2000), { d: 0.09, g: 0.06, q: 0.7, to: 3200 }),
    drop: () => { tone(vary(105), { d: 0.11, g: 0.14, to: 70 }); noise(650, { d: 0.08, g: 0.06, type: 'lowpass' }) },
    use: () => noise(vary(1500), { d: 0.3, g: 0.06, q: 0.6, to: 3000, a: 0.05 }),
    turn: () => noise(vary(1100), { d: 0.34, g: 0.05, q: 0.5, to: 3400, a: 0.09 }),
  },
  metal: {
    lift: () => { tone(vary(380), { type: 'triangle', d: 0.18, g: 0.03 }); tone(vary(600), { type: 'triangle', d: 0.12, g: 0.015 }) },
    drop: () => { noise(vary(800), { d: 0.07, g: 0.12, q: 2 }); tone(vary(150), { d: 0.3, g: 0.12, to: 105 }); tone(vary(980), { d: 0.35, g: 0.018 }) },
    use: () => times(7, 0.045, (_, at) => noise(vary(2000, 0.2), { d: 0.025, g: 0.05, q: 3, at })),
  },
  foil: {
    lift: () => crinkle(4, 0.035),
    drop: () => { crinkle(3, 0.035); tone(vary(700), { d: 0.04, g: 0.025 }) },
    use: () => { crinkle(3, 0.03); noise(1500, { d: 0.04, g: 0.06, q: 3, at: 0.06 }) },
  },
  pill: {
    lift: () => tone(vary(1150, 0.1), { d: 0.03, g: 0.02 }),
    drop: () => { tone(vary(900, 0.1), { d: 0.04, g: 0.03 }); tone(vary(1050, 0.1), { d: 0.03, g: 0.016, at: 0.06 }) },
  },
  food: {
    lift: () => noise(vary(550), { d: 0.05, g: 0.05, type: 'lowpass' }),
    drop: () => { tone(vary(90), { d: 0.13, g: 0.16, to: 60 }); noise(450, { d: 0.05, g: 0.06, type: 'lowpass' }) },
  },
  wrap: {
    lift: () => crinkle(5, 0.025),
    drop: () => { crinkle(4, 0.022); tone(vary(100), { d: 0.11, g: 0.11, to: 70 }) },
  },
  cloth: {
    lift: () => noise(vary(1000), { d: 0.07, g: 0.04, q: 0.5 }),
    drop: () => { noise(450, { d: 0.1, g: 0.06, type: 'lowpass' }); tone(vary(80), { d: 0.08, g: 0.07 }) },
  },
  wax: {
    lift: () => tone(vary(480), { type: 'triangle', d: 0.05, g: 0.025 }),
    drop: () => { tone(vary(300), { type: 'triangle', d: 0.08, g: 0.06 }); tone(vary(200), { d: 0.08, g: 0.06 }) },
  },
  machine: { // a heavy plastic case
    lift: () => { noise(vary(400), { d: 0.08, g: 0.06, type: 'lowpass' }); tone(vary(220), { type: 'triangle', d: 0.06, g: 0.015 }) },
    drop: () => { tone(vary(85), { d: 0.18, g: 0.2, to: 55 }); noise(380, { d: 0.09, g: 0.09, type: 'lowpass' }); noise(vary(1400), { d: 0.03, g: 0.03, q: 2, at: 0.05 }) },
  },
  plastic: { // something light and hollow in plastic
    lift: () => noise(vary(1100), { d: 0.04, g: 0.04, q: 1.5 }),
    drop: () => { tone(vary(240), { type: 'triangle', d: 0.07, g: 0.06, to: 170 }); noise(vary(900), { d: 0.04, g: 0.05, q: 1.2 }) },
  },
  wood: { // a soft knock
    lift: () => noise(vary(700), { d: 0.05, g: 0.05, q: 0.8 }),
    drop: () => { tone(vary(170), { type: 'triangle', d: 0.12, g: 0.1, to: 120 }); noise(500, { d: 0.07, g: 0.07, type: 'lowpass' }); tone(vary(340), { type: 'triangle', d: 0.05, g: 0.02, at: 0.09 }) },
  },
  disc: { // a floppy: a light plastic tick, its shutter
    lift: () => noise(vary(2200), { d: 0.02, g: 0.03, q: 2 }),
    drop: () => { noise(vary(1800), { d: 0.025, g: 0.05, q: 2 }); tone(vary(600), { type: 'triangle', d: 0.03, g: 0.015, at: 0.03 }) },
  },
  gold: {
    lift: () => times(3, 0.035, (_, at) => tone(vary(2900, 0.12), { d: 0.05, g: 0.012, at })),
    drop: () => { tone(vary(1760, 0.02), { d: 0.35, g: 0.03 }); tone(vary(2640, 0.02), { d: 0.22, g: 0.012 }) },
  },
}

/** A thing of this material picked up, put down or used. */
export function handle(material: string | undefined, action: Action) {
  if (!soundOn || !volume) return
  const m = MATERIALS[material ?? 'thing'] ?? MATERIALS.thing
  ;(m[action] ?? MATERIALS.thing[action === 'use' ? 'drop' : action as 'lift' | 'drop'])?.()
}
/**
 * Several things picked up or put down at once. Each material sounds once, however many of it there are, the most common
 * first; at most three, each a beat after the last and softer, so a bottle, a book and some pills come through as three
 * clear sounds rather than a mush.
 */
export function handleMany(materials: (string | undefined)[], action: Action) {
  const count = new Map<string, number>()
  for (const m of materials) count.set(m ?? 'thing', (count.get(m ?? 'thing') ?? 0) + 1)
  const order = [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([m]) => m)
  order.forEach((m, i) => {
    shift = i * 0.045
    damp = order.length > 1 ? 0.75 - i * 0.12 : 1
    handle(m, action)
  })
  shift = 0
  damp = 1
}

/** The shop's own sounds. */
const SHOP = {
  bad: () => { tone(170, { type: 'triangle', d: 0.1, g: 0.03, to: 125 }); tone(130, { type: 'triangle', d: 0.12, g: 0.025, at: 0.07, to: 95 }) },
  coinsIn: () => { tone(1320, { d: 0.12, g: 0.03 }); tone(1760, { d: 0.35, g: 0.03, at: 0.07 }) },
  coinsOut: () => { tone(990, { d: 0.1, g: 0.03 }); tone(740, { d: 0.28, g: 0.03, at: 0.08 }) },
  bell: () => { tone(1047, { d: 0.6, g: 0.03 }); tone(1397, { d: 0.8, g: 0.025, at: 0.13 }) },
  key: () => noise(vary(2600, 0.2), { d: 0.012, g: 0.012, q: 2 }),
  wipe: () => noise(450, { d: 0.45, g: 0.02, q: 0.6, to: 3200, a: 0.15 }),
  leave: () => noise(vary(800), { d: 0.25, g: 0.02, q: 0.5, to: 300, a: 0.05 }),
  menu: () => tone(660, { type: 'triangle', d: 0.06, g: 0.02 }),
  // a machine's switch: a soft thunk, the tube's low hum coming up (or dying away)
  powerOn: () => { noise(300, { d: 0.08, g: 0.08, type: 'lowpass' }); tone(55, { d: 1.1, g: 0.05, a: 0.4 }); tone(110, { type: 'triangle', d: 0.9, g: 0.012, a: 0.5, at: 0.1 }) },
  powerOff: () => { noise(300, { d: 0.08, g: 0.07, type: 'lowpass' }); tone(110, { type: 'triangle', d: 0.5, g: 0.015, to: 60 }) },
  // the drive reading: a few soft head clicks over a short whirr
  seek: () => { tone(160, { type: 'triangle', d: 0.6, g: 0.012, a: 0.08 }); times(5, 0.09, (_, at) => noise(vary(1300, 0.15), { d: 0.02, g: 0.035, q: 4, at: at + 0.05 })) },
}
export function shop(name: keyof typeof SHOP) {
  if (soundOn && volume) SHOP[name]()
}
