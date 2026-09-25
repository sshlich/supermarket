/** Seeded PRNG (mulberry32): the same seed gives the same sequence, so fights and saved hours replay exactly. */
export function rng(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let x = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

/** A fresh seed from `random`. */
export const seedFrom = (random: () => number) => (random() * 2 ** 31) | 0

/** A random element of `list`. */
export const pickOne = <T,>(list: T[], random: () => number): T => list[Math.floor(random() * list.length)]

/** A copy of `list` in random order (Fisher-Yates). */
export function shuffled<T>(list: T[], random: () => number): T[] {
  const out = [...list]
  for (let k = out.length - 1; k > 0; k--) {
    const j = Math.floor(random() * (k + 1))
    ;[out[k], out[j]] = [out[j], out[k]]
  }
  return out
}
