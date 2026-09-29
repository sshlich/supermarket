import assert from 'node:assert/strict'
import { I, SHAPES, about, fmt, mul, move, point, scale, snapTo, transformAttr, turn } from './geom.ts'

// Matrices: translate then scale composes the way SVG does; identity gives no attribute.
assert.deepEqual(mul(move(10, 0), scale(2)), [2, 0, 0, 2, 10, 0])
assert.deepEqual(point(mul(move(10, 0), scale(2)), 1, 1), [12, 2])
assert.equal(transformAttr(I), null)
assert.equal(transformAttr(move(3, -4)), 'translate(3 -4)')
assert.equal(transformAttr(scale(2)), 'matrix(2 0 0 2 0 0)')
// Scaling about a point leaves that point where it is.
assert.deepEqual(point(about(scale(3), 5, 7), 5, 7), [5, 7])
// A quarter turn about the centre keeps the centre and moves the right edge to the bottom.
const q = about(turn(90), 10, 10)
const [px, py] = point(q, 20, 10)
assert.ok(Math.abs(px - 10) < 1e-9 && Math.abs(py - 20) < 1e-9)
assert.equal(fmt(-0.0001), '0')
assert.equal(fmt(1.23456), '1.235')
assert.equal(snapTo(13, 4), 12)

// Every generator makes well-formed markup around the given centre, and its parameters do something.
for (const [id, shape] of Object.entries(SHAPES)) {
  const p = Object.fromEntries(shape.params.map(q => [q.key, 'value' in q ? q.value : q.text]))
  const svg = shape.make(p, 32, 32, 'currentColor')
  assert.ok(/^<(rect|circle|ellipse|line|polygon|polyline|text)\b[^>]*\/?>/.test(svg), id)
  assert.ok(!svg.includes('NaN') && !svg.includes('undefined'), id)
}
const hex = SHAPES.polygon.make({ size: 20, n: 6 }, 0, 0, 'red')
assert.equal(hex.match(/,/g)!.length, 6)
const star = SHAPES.star.make({ size: 30, n: 5, i: 45 }, 0, 0, 'red')
assert.equal(star.match(/,/g)!.length, 10)
assert.ok(SHAPES.text.make({ ch: '<', size: 10 }, 0, 0, 'red').includes('&lt;'))

console.log('geom ok')
