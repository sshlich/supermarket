// The only source of luck. mulberry32, with its seed kept in the state, so a saved game replays the same way.

export function rand(s: { rng: number }): number {
  let t = (s.rng = (s.rng + 0x6d2b79f5) | 0)
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/** One of `xs`, evenly. */
export const pick = <T>(s: { rng: number }, xs: readonly T[]): T => xs[Math.floor(rand(s) * xs.length)]
