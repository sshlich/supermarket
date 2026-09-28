// Sound (DESIGN 13.6, optional): a drone for where you are (a low sine and filtered noise), Masons thudding at night,
// and the Choir as a chord you hear from the Stair. Off until switched on; browsers wait for a click anyway.

const PITCH: Record<string, number> = { seam: 41, galleries: 55, ducts: 46, stair: 62, hall: 49, u0041: 58 }
let ctx: AudioContext | null = null
let out: GainNode
let tone: OscillatorNode
let hiss: BiquadFilterNode
let choir: GainNode

function start() {
  ctx = new AudioContext()
  out = ctx.createGain()
  out.gain.value = 0.06
  out.connect(ctx.destination)
  tone = ctx.createOscillator()
  tone.type = 'sine'
  tone.connect(out)
  tone.start()
  const noise = ctx.createBufferSource()
  noise.buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
  noise.buffer.getChannelData(0).forEach((_, i, a) => { a[i] = Math.random() * 2 - 1 })
  noise.loop = true
  hiss = ctx.createBiquadFilter()
  hiss.type = 'lowpass'
  const quiet = ctx.createGain()
  quiet.gain.value = 0.35
  noise.connect(hiss).connect(quiet).connect(out)
  noise.start()
  choir = ctx.createGain()
  choir.gain.value = 0
  choir.connect(out)
  for (const f of [220, 261.6, 329.6]) { const o = ctx.createOscillator(); o.frequency.value = f; o.connect(choir); o.start() }
}

export function setSound(on: boolean) {
  if (on && !ctx) start()
  if (ctx) void (on ? ctx.resume() : ctx.suspend())
}

/** Where the runner is: the Seam, or a level. The Choir sings to anyone on the Stair or in the Hall while it lives. */
export function place(level: string, choirNear: boolean) {
  if (!ctx) return
  const f = PITCH[level] ?? 44
  tone.frequency.setTargetAtTime(f, ctx.currentTime, 0.8)
  hiss.frequency.setTargetAtTime(f * 6, ctx.currentTime, 0.8)
  choir.gain.setTargetAtTime(choirNear ? 0.12 : 0, ctx.currentTime, 1.2)
}

/** A distant Mason, laying a course. */
export function thud() {
  if (!ctx || ctx.state !== 'running') return
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.frequency.setValueAtTime(70, ctx.currentTime)
  o.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + 0.5)
  g.gain.setValueAtTime(0.9, ctx.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
  o.connect(g).connect(out)
  o.start()
  o.stop(ctx.currentTime + 0.7)
}
