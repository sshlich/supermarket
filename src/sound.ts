// Sounds, all made on the spot with Web Audio (nothing to load): short tones and filtered noise, a little different every
// time. Things sound like what they are made of: a kind's `sound` in kinds.json names its material, and each material has
// a sound for being picked up, put down and used (poured, opened). The rest are for the shop: a bell when a line comes in,
// coins, a refusal, the terminal's keys, a page turning. Off with the button under the field (remembered).

type Action = 'lift' | 'drop' | 'use' | 'turn'

let ctx: AudioContext | null = null
let master: GainNode
let noiseBuf: AudioBuffer
export let soundOn = (() => { try { return localStorage.getItem('sound') !== '0' } catch { return true } })()
export function toggleSound() {
  soundOn = !soundOn
  try { localStorage.setItem('sound', soundOn ? '1' : '0') } catch { /* private window */ }
  return soundOn
}

/** The audio context, made on first use (always after a click or a key, so the browser lets it play). */
function ac() {
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = 0.55
    master.connect(ctx.destination)
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}
/** A little off every time, so nothing sounds like a machine gun. */
const vary = (v: number, k = 0.06) => v * (1 + (Math.random() * 2 - 1) * k)

interface Shape { d: number; g: number; a?: number; at?: number; to?: number }
/** A tone: frequency `f`, gliding to `to`, fading over `d` seconds. */
function tone(f: number, o: Shape & { type?: OscillatorType }) {
  const c = ac(), t = c.currentTime + (o.at ?? 0)
  const osc = c.createOscillator()
  osc.type = o.type ?? 'sine'
  osc.frequency.setValueAtTime(f, t)
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + o.d)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(o.g, t + (o.a ?? 0.004))
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.d)
  osc.connect(g).connect(master)
  osc.start(t)
  osc.stop(t + o.d + 0.02)
}
/** Noise through a filter at `f` (sweeping to `to`): rustles, clicks, thuds, crinkles. */
function noise(f: number, o: Shape & { type?: BiquadFilterType; q?: number }) {
  const c = ac(), t = c.currentTime + (o.at ?? 0)
  const src = c.createBufferSource()
  src.buffer = noiseBuf
  const filter = c.createBiquadFilter()
  filter.type = o.type ?? 'bandpass'
  filter.frequency.setValueAtTime(f, t)
  if (o.to) filter.frequency.exponentialRampToValueAtTime(o.to, t + o.d)
  filter.Q.value = o.q ?? 1
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(o.g, t + (o.a ?? 0.003))
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.d)
  src.connect(filter).connect(g).connect(master)
  src.start(t, Math.random() * 0.5)
  src.stop(t + o.d + 0.02)
}
const times = (n: number, gap: number, f: (i: number, at: number) => void) => { for (let i = 0; i < n; i++) f(i, i * gap + Math.random() * gap * 0.4) }
const crinkle = (n: number, g: number) => times(n, 0.022, (_, at) => noise(vary(6500, 0.2), { d: 0.018, g, type: 'highpass', at }))

/** What each material sounds like. Anything without one is a plain thing. */
const MATERIALS: Record<string, Partial<Record<Action, () => void>>> = {
  thing: {
    lift: () => noise(vary(900), { d: 0.05, g: 0.08, q: 0.7 }),
    drop: () => { tone(vary(140), { d: 0.1, g: 0.2, to: 90 }); noise(600, { d: 0.05, g: 0.08, type: 'lowpass' }) },
  },
  glass: {
    lift: () => { tone(vary(2400), { d: 0.12, g: 0.06 }); tone(vary(3600), { d: 0.08, g: 0.03, at: 0.01 }) },
    drop: () => { noise(3000, { d: 0.025, g: 0.12, type: 'highpass' }); tone(vary(1800), { d: 0.28, g: 0.09 }); tone(vary(2750), { d: 0.2, g: 0.05, at: 0.004 }); tone(vary(150), { d: 0.08, g: 0.12, to: 100 }) },
    use: () => { times(6, 0.1, (_, at) => { const f = vary(320, 0.3); tone(f, { d: 0.08, g: 0.1, at, to: f * 1.7 }) }); noise(700, { d: 0.7, g: 0.04, type: 'lowpass', a: 0.1 }) },
  },
  paper: {
    lift: () => noise(vary(2500), { d: 0.09, g: 0.1, q: 0.7, to: 4000 }),
    drop: () => { tone(vary(110), { d: 0.12, g: 0.22, to: 70 }); noise(700, { d: 0.08, g: 0.1, type: 'lowpass' }) },
    use: () => noise(vary(1800), { d: 0.3, g: 0.1, q: 0.6, to: 3500, a: 0.05 }),
    turn: () => { noise(vary(1200), { d: 0.34, g: 0.08, q: 0.5, to: 4200, a: 0.09 }); noise(vary(5000), { d: 0.05, g: 0.04, type: 'highpass', at: 0.3 }) },
  },
  metal: {
    lift: () => { tone(vary(420), { type: 'triangle', d: 0.2, g: 0.05 }); tone(vary(663), { type: 'triangle', d: 0.15, g: 0.03 }) },
    drop: () => { noise(vary(900), { d: 0.07, g: 0.22, q: 2 }); tone(vary(160), { d: 0.32, g: 0.2, to: 110 }); tone(vary(1240), { d: 0.45, g: 0.04 }); tone(vary(1873), { d: 0.3, g: 0.025 }) },
    use: () => times(8, 0.045, (_, at) => noise(vary(2600, 0.2), { d: 0.025, g: 0.1, q: 4, at })),
  },
  foil: {
    lift: () => crinkle(4, 0.06),
    drop: () => { crinkle(3, 0.06); tone(vary(900), { d: 0.04, g: 0.05 }) },
    use: () => { crinkle(3, 0.05); noise(1800, { d: 0.04, g: 0.12, q: 3, at: 0.06 }) },
  },
  pill: {
    lift: () => tone(vary(1500, 0.1), { d: 0.03, g: 0.04 }),
    drop: () => { tone(vary(1100, 0.1), { d: 0.04, g: 0.06 }); tone(vary(1300, 0.1), { d: 0.03, g: 0.035, at: 0.06 }); tone(vary(1250, 0.1), { d: 0.02, g: 0.02, at: 0.1 }) },
  },
  food: {
    lift: () => noise(vary(600), { d: 0.05, g: 0.08, type: 'lowpass' }),
    drop: () => { tone(vary(95), { d: 0.14, g: 0.28, to: 60 }); noise(500, { d: 0.05, g: 0.1, type: 'lowpass' }) },
  },
  wrap: {
    lift: () => crinkle(5, 0.04),
    drop: () => { crinkle(4, 0.035); tone(vary(105), { d: 0.12, g: 0.18, to: 70 }) },
  },
  cloth: {
    lift: () => noise(vary(1200), { d: 0.07, g: 0.06, q: 0.5 }),
    drop: () => { noise(500, { d: 0.1, g: 0.1, type: 'lowpass' }); tone(vary(80), { d: 0.08, g: 0.1 }) },
  },
  wax: {
    lift: () => tone(vary(520), { type: 'triangle', d: 0.05, g: 0.04 }),
    drop: () => { tone(vary(330), { type: 'triangle', d: 0.08, g: 0.1 }); tone(vary(210), { d: 0.08, g: 0.1 }) },
  },
  gold: {
    lift: () => times(4, 0.03, (_, at) => tone(vary(4400, 0.15), { d: 0.05, g: 0.025, at })),
    drop: () => { tone(vary(2637, 0.02), { d: 0.4, g: 0.06 }); tone(vary(3951, 0.02), { d: 0.28, g: 0.03 }); times(3, 0.03, (_, at) => tone(vary(4600, 0.15), { d: 0.04, g: 0.02, at: at + 0.02 })) },
  },
}

/** A thing of this material picked up, put down or used. */
export function handle(material: string | undefined, action: Action) {
  if (!soundOn) return
  const m = MATERIALS[material ?? 'thing'] ?? MATERIALS.thing
  ;(m[action] ?? MATERIALS.thing[action === 'use' ? 'drop' : action as 'lift' | 'drop'])?.()
}

/** The shop's own sounds. */
const SHOP = {
  bad: () => { tone(180, { type: 'square', d: 0.1, g: 0.035, to: 130 }); tone(140, { type: 'square', d: 0.12, g: 0.03, at: 0.07, to: 95 }) },
  coinsIn: () => { tone(1975, { d: 0.12, g: 0.06 }); tone(2637, { d: 0.4, g: 0.06, at: 0.07 }); noise(7000, { d: 0.03, g: 0.03, type: 'highpass', at: 0.07 }) },
  coinsOut: () => { tone(1318, { d: 0.1, g: 0.05 }); tone(988, { d: 0.3, g: 0.05, at: 0.08 }) },
  bell: () => { tone(1568, { d: 0.6, g: 0.05 }); tone(2093, { d: 0.8, g: 0.04, at: 0.13 }); tone(3136, { d: 0.3, g: 0.015, at: 0.13 }) },
  key: () => noise(vary(3500, 0.2), { d: 0.012, g: 0.02, q: 2 }),
  wipe: () => noise(500, { d: 0.45, g: 0.035, q: 0.6, to: 4500, a: 0.15 }),
  leave: () => noise(vary(900), { d: 0.25, g: 0.03, q: 0.5, to: 300, a: 0.05 }),
}
export function shop(name: keyof typeof SHOP) {
  if (soundOn) SHOP[name]()
}
