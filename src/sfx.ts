// Sound: small synthesized blips, thunks and hits (WebAudio). Nothing is loaded: every sound is a few square,
// triangle or noise notes, in the spirit of the screen. Each play is detuned a little so repeats don't drone,
// and each sound has a minimum gap so a burst of events doesn't stack into noise.

const VOLUME = 0.5
const MUTE_KEY = 'bazaar-like:muted'

let ac: AudioContext | null = null
let out: GainNode
let noiseBuf: AudioBuffer
let muted = (() => {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false
  }
})()

// Browsers only let sound start after a click or key press.
const wake = () => {
  if (!ac) {
    ac = new AudioContext()
    out = ac.createGain()
    out.gain.value = VOLUME
    out.connect(ac.createDynamicsCompressor()).connect(ac.destination)
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  if (ac.state === 'suspended') ac.resume()
}
addEventListener('pointerdown', wake)
addEventListener('keydown', wake)

export const isMuted = () => muted
export function setMuted(on: boolean) {
  muted = on
  try {
    localStorage.setItem(MUTE_KEY, on ? '1' : '0')
  } catch {}
}

interface Note { at?: number; vol?: number; slide?: number; attack?: number }

const detune = () => 1 + (Math.random() - 0.5) * 0.06

/** One pitched note: `freq` Hz for `dur` s, sliding to freq × slide, fading out. */
function tone(freq: number, dur: number, type: OscillatorType = 'square', { at = 0, vol = 0.15, slide = 1, attack = 0.003 }: Note = {}) {
  const t = ac!.currentTime + at
  const f = freq * detune()
  const o = ac!.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(f, t)
  if (slide !== 1) o.frequency.exponentialRampToValueAtTime(f * slide, t + dur)
  o.connect(envelope(t, dur, vol, attack))
  o.start(t)
  o.stop(t + dur + 0.02)
}

/** A burst of filtered noise around `freq` Hz (the filter sweeps to freq × slide). */
function noise(dur: number, freq: number, { at = 0, vol = 0.15, slide = 1, attack = 0.002 }: Note = {}, q = 1) {
  const t = ac!.currentTime + at
  const src = ac!.createBufferSource()
  src.buffer = noiseBuf
  src.playbackRate.value = detune()
  const filter = ac!.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = q
  filter.frequency.setValueAtTime(freq, t)
  if (slide !== 1) filter.frequency.exponentialRampToValueAtTime(freq * slide, t + dur)
  src.connect(filter).connect(envelope(t, dur, vol, attack))
  src.start(t, Math.random() * 0.5)
  src.stop(t + dur + 0.02)
}

function envelope(t: number, dur: number, vol: number, attack: number) {
  const g = ac!.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(vol, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0005, t + dur)
  g.connect(out)
  return g
}

const notes = (list: number[], step: number, dur: number, type: OscillatorType, vol: number) =>
  list.forEach((f, i) => tone(f, i === list.length - 1 ? dur * 2.5 : dur, type, { at: i * step, vol }))

const lastPlayed: Record<string, number> = {}
/** A sound that plays only when the page may make sound, and not more often than every `gap` ms. */
function sound<A extends unknown[]>(name: string, gap: number, play: (...args: A) => void) {
  return (...args: A) => {
    if (!ac || muted || ac.state !== 'running') return
    const now = performance.now()
    if (now - (lastPlayed[name] ?? -Infinity) < gap) return
    lastPlayed[name] = now
    play(...args)
  }
}

export const sfx = {
  // Handling
  hover: sound('hover', 40, () => tone(1900, 0.025, 'square', { vol: 0.025 })),
  pick: sound('pick', 30, () => tone(380, 0.07, 'square', { vol: 0.07, slide: 1.9 })),
  drop: sound('drop', 30, () => {
    tone(170, 0.1, 'triangle', { vol: 0.35, slide: 0.45 })
    noise(0.035, 1400, { vol: 0.1 })
  }),
  push: sound('push', 50, () => noise(0.07, 700, { vol: 0.07, slide: 0.5 }, 0.7)),
  stow: sound('stow', 30, () => {
    noise(0.12, 500, { vol: 0.1, slide: 0.4 })
    tone(260, 0.08, 'triangle', { vol: 0.2, slide: 0.6, at: 0.05 })
  }),
  open: sound('open', 60, () => {
    noise(0.14, 400, { vol: 0.08, slide: 3 }, 0.8)
    tone(200, 0.12, 'triangle', { vol: 0.18, slide: 1.8 })
  }),
  close: sound('close', 60, () => {
    noise(0.1, 1200, { vol: 0.07, slide: 0.35 }, 0.8)
    tone(300, 0.1, 'triangle', { vol: 0.18, slide: 0.55 })
  }),
  choose: sound('choose', 60, () => {
    tone(660, 0.05, 'square', { vol: 0.09 })
    tone(990, 0.1, 'square', { vol: 0.09, at: 0.05 })
  }),
  toast: sound('toast', 120, () => tone(1250, 0.04, 'square', { vol: 0.04 })),
  deny: sound('deny', 150, () => {
    tone(150, 0.1, 'sawtooth', { vol: 0.09 })
    tone(115, 0.16, 'sawtooth', { vol: 0.09, at: 0.09 })
  }),

  // Money and growth
  buy: sound('buy', 40, () => {
    tone(1320, 0.05, 'square', { vol: 0.08 })
    tone(990, 0.12, 'square', { vol: 0.08, at: 0.05 })
  }),
  gold: sound('gold', 60, () => {
    tone(988, 0.06, 'square', { vol: 0.08 })
    tone(1319, 0.16, 'square', { vol: 0.08, at: 0.06 })
  }),
  reroll: sound('reroll', 80, () => {
    for (let i = 0; i < 4; i++) noise(0.03, 2500 + i * 600, { vol: 0.08, at: i * 0.04 })
    tone(700, 0.08, 'square', { vol: 0.05, at: 0.16, slide: 1.4 })
  }),
  upgrade: sound('upgrade', 100, () => notes([1047, 1319, 1568, 2093], 0.045, 0.06, 'triangle', 0.14)),
  levelUp: sound('levelUp', 300, () => notes([523, 659, 784, 1047, 1319], 0.07, 0.08, 'square', 0.08)),

  // Fights
  use: sound('use', 25, (theirs: boolean) => tone(theirs ? 330 : 440, 0.045, 'square', { vol: 0.045, slide: 1.35 })),
  skill: sound('skill', 60, () => tone(880, 0.08, 'triangle', { vol: 0.08, slide: 1.5 })),
  hit: sound('hit', 30, (share: number, crit: boolean) => {
    const k = Math.min(1, share * 6) // bigger share of health, bigger thump
    noise(0.06 + k * 0.12, 900, { vol: 0.14 + k * 0.2, slide: 0.4 }, 0.8)
    tone(130, 0.08 + k * 0.15, 'triangle', { vol: 0.25 + k * 0.3, slide: 0.45 })
    if (crit) tone(2200, 0.07, 'square', { vol: 0.07, slide: 0.7 })
  }),
  block: sound('block', 40, () => {
    tone(1500, 0.05, 'square', { vol: 0.05, slide: 0.85 })
    noise(0.04, 4000, { vol: 0.06 })
  }),
  shield: sound('shield', 60, () => {
    tone(780, 0.06, 'square', { vol: 0.06 })
    tone(1170, 0.1, 'triangle', { vol: 0.08, at: 0.04 })
  }),
  heal: sound('heal', 60, () => tone(520, 0.14, 'triangle', { vol: 0.12, slide: 1.6 })),
  regen: sound('regen', 250, () => tone(1400, 0.05, 'triangle', { vol: 0.03, slide: 1.2 })),
  burn: sound('burn', 90, () => noise(0.05, 3200, { vol: 0.05 }, 0.5)),
  poison: sound('poison', 90, () => tone(180, 0.08, 'sine', { vol: 0.09, slide: 2 })),
  shatter: sound('shatter', 100, () => {
    noise(0.35, 6000, { vol: 0.22, slide: 0.25 }, 0.6)
    tone(1760, 0.12, 'square', { vol: 0.05, slide: 0.5 })
  }),
  destroy: sound('destroy', 80, () => {
    noise(0.25, 300, { vol: 0.25, slide: 0.5 }, 0.6)
    tone(110, 0.25, 'sawtooth', { vol: 0.12, slide: 0.5 })
  }),
  win: sound('win', 500, () => notes([523, 659, 784, 1047], 0.1, 0.1, 'square', 0.1)),
  lose: sound('lose', 500, () => notes([392, 330, 262, 196], 0.16, 0.14, 'triangle', 0.16)),
}
