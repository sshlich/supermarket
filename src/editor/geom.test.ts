import assert from 'node:assert/strict'
import { I, SHAPES, invert, parsePath, pathBounds, pathString, splitSubpaths, about, fmt, mul, move, nearestSegment, parsePoints, pointsAttr, point, scale, simplify, smoothPath, snapTo, transformAttr, turn, type P } from './geom.ts'

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

// Inverting undoes a transform: a point sent through m and back is where it started.
const tm = mul(move(7, -3), mul(turn(30), scale(2, 3)))
const [ix, iy] = point(invert(tm), ...point(tm, 4, 9))
assert.ok(Math.abs(ix - 4) < 1e-9 && Math.abs(iy - 9) < 1e-9)

// Points round-trip through the attribute text; junk is skipped.
assert.deepEqual(parsePoints('1,2 3.5,4  5 6'), [[1, 2], [3.5, 4], [5, 6]])
assert.equal(pointsAttr([[1, 2], [3.5, 4]]), '1,2 3.5,4')
assert.deepEqual(parsePoints(''), [])

// Simplifying a wobbly straight line leaves its two ends; a corner survives.
const line: P[] = Array.from({ length: 21 }, (_, i) => [i * 2, (i % 2) * 0.2])
assert.deepEqual(simplify(line, 1), [line[0], line[20]])
const corner: P[] = [[0, 0], [10, 0], [20, 0], [20, 10], [20, 20]]
assert.deepEqual(simplify(corner, 1), [[0, 0], [20, 0], [20, 20]])

// A smooth path starts where the points start, has one curve per segment, and closes with Z when asked.
const tri: P[] = [[0, 0], [10, 0], [5, 8]]
assert.equal((smoothPath(tri, false).match(/C/g) ?? []).length, 2)
assert.equal((smoothPath(tri, true).match(/C/g) ?? []).length, 3)
assert.ok(smoothPath(tri, true).endsWith('Z') && smoothPath(tri, true).startsWith('M0 0'))
assert.ok(!smoothPath(tri, true).includes('NaN'))

// The nearest segment is the one a point sits on.
const sq: P[] = [[0, 0], [10, 0], [10, 10], [0, 10]]
assert.equal(nearestSegment(sq, [5, 1], true).i, 0)
assert.equal(nearestSegment(sq, [9, 5], true).i, 1)
assert.equal(nearestSegment(sq, [1, 5], true).i, 3) // the closing edge
assert.equal(nearestSegment(sq, [1, 8], false).i, 2) // open: no closing edge, so the nearest real one

// Paths: relative and absolute commands agree, and the box of a circle drawn with two arcs is its diameter.
const same = (a: string, b: string) => assert.deepEqual(parsePath(a).map(s => s.map(v => typeof v === 'number' ? +v.toFixed(6) : v)), parsePath(b).map(s => s.map(v => typeof v === 'number' ? +v.toFixed(6) : v)))
same('M10 10l20 0v20h-20z', 'M10 10L30 10L30 30L10 30Z')
same('M10 10H30V30H10Z', 'M10,10 L30,10 L30,30 L10,30 z')
const ring = pathBounds(parsePath('M0 50a50 50 0 1 0 100 0a50 50 0 1 0 -100 0z'), I)!
assert.ok(Math.abs(ring.x) < 1e-6 && Math.abs(ring.y) < 1e-6 && Math.abs(ring.w - 100) < 1e-6 && Math.abs(ring.h - 100) < 1e-6)
// a curve bulges past its endpoints: the box is the real curve, not the control points
const bump = pathBounds(parsePath('M0 0C0 40 100 40 100 0'), I)!
assert.ok(Math.abs(bump.h - 30) < 1e-6 && Math.abs(bump.w - 100) < 1e-6) // control points at 40, curve peaks at 30
// through a quarter turn about the origin, width and height swap
const turned = pathBounds(parsePath('M0 0L10 0L10 4L0 4Z'), turn(90))!
assert.ok(Math.abs(turned.w - 4) < 1e-9 && Math.abs(turned.h - 10) < 1e-9)
// compact arc flags ("a8 8 0 018 8") parse the way browsers read them
assert.equal(parsePath('M0 0a8 8 0 018 8').length, 2)
// smooth and quadratic shorthands become cubics; a compound path splits into its pieces
assert.ok(parsePath('M0 0Q10 10 20 0T40 0').every(s => s[0] === 'M' || s[0] === 'C'))
const compound = splitSubpaths(parsePath('M0 0h10v10z m20 0h10v10z M100 100l5 5'))
assert.equal(compound.length, 3)
assert.ok(pathString(compound[1]).startsWith('M20 0')) // the relative m was resolved against where the last piece ended
assert.equal(pathString(parsePath('M1 2L3 4Z')), 'M1 2L3 4Z')

console.log('geom ok')
