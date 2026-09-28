import assert from 'node:assert/strict'
import { rand } from './rng.ts'

// Same seed, same luck; a different seed, different luck.
const draw = (seed: number) => { const s = { rng: seed }; return Array.from({ length: 5 }, () => rand(s)) }
assert.deepEqual(draw(7), draw(7))
assert.notDeepEqual(draw(7), draw(8))

// Uniform enough on [0, 1): a typo in the mixing shows up here.
const s = { rng: 7 }
const xs = Array.from({ length: 20000 }, () => rand(s))
assert.ok(xs.every(x => x >= 0 && x < 1))
assert.ok(Math.abs(xs.reduce((a, b) => a + b) / xs.length - 0.5) < 0.01)
for (let i = 0; i < 10; i++) assert.ok(Math.abs(xs.filter(x => Math.floor(x * 10) === i).length / xs.length - 0.1) < 0.01)

console.log('rng ok')
