// Pixel particles on one canvas over the scene: embers, bubbles, sparkles, shards, sparks.
// Positions are scene px (the same space as offsetLeft/offsetTop of the scene's children).

export interface Burst {
  x: number // where, and how far around it (a box: x ± w/2, y ± h/2)
  y: number
  w?: number
  h?: number
  colors: string[]
  vx?: number // speed spread each way, px/s
  vy?: number // base vertical speed, px/s (negative rises)
  vyJitter?: number
  gravity?: number // px/s²
  life: number // seconds
  size: number // px, drawn as squares
  flicker?: boolean
}

interface Particle { x: number; y: number; vx: number; vy: number; g: number; age: number; life: number; color: string; size: number; flicker: boolean }

const canvas = document.createElement('canvas')
canvas.className = 'fx'
const ctx = canvas.getContext('2d')!
const live: Particle[] = []
let last = 0

export function mountFx(scene: HTMLElement) {
  scene.append(canvas)
}

const pick = <T>(list: T[]) => list[Math.floor(Math.random() * list.length)]
const spread = (v = 0) => (Math.random() * 2 - 1) * v

export function emit(n: number, b: Burst) {
  for (let i = 0; i < n; i++) {
    live.push({
      x: b.x + spread((b.w ?? 0) / 2),
      y: b.y + spread((b.h ?? 0) / 2),
      vx: spread(b.vx),
      vy: (b.vy ?? 0) + spread(b.vyJitter),
      g: b.gravity ?? 0,
      age: 0,
      life: b.life * (0.6 + Math.random() * 0.6),
      color: pick(b.colors),
      size: b.size,
      flicker: !!b.flicker,
    })
  }
  if (!last) {
    last = performance.now()
    requestAnimationFrame(frame)
  }
}

function frame(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  const scene = canvas.parentElement!
  const dpr = devicePixelRatio
  const w = Math.round(scene.offsetWidth * dpr)
  const h = Math.round(scene.offsetHeight * dpr)
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w
    canvas.height = h
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, scene.offsetWidth, scene.offsetHeight)
  for (let i = live.length - 1; i >= 0; i--) {
    const p = live[i]
    p.age += dt
    if (p.age >= p.life) {
      live.splice(i, 1)
      continue
    }
    p.vy += p.g * dt
    p.x += p.vx * dt
    p.y += p.vy * dt
    const k = 1 - p.age / p.life
    ctx.globalAlpha = p.flicker && Math.random() < 0.25 ? 0.3 : Math.min(1, k * 2)
    ctx.fillStyle = p.color
    const s = Math.max(1, Math.round(p.size * (0.5 + k / 2)))
    ctx.fillRect(Math.round(p.x - s / 2), Math.round(p.y - s / 2), s, s)
  }
  if (live.length) requestAnimationFrame(frame)
  else {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    last = 0
  }
}
