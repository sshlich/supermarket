// Sprites that draw what is in them (or what they are). A kind with a painter here has a part of its sprite between
// `<!--fill-->` and `<!--/fill-->`: what is written there is the thing as it comes (whole, full), which the gallery and the
// footprint check see, and the game paints it over from the item itself: its contents (where each thing sits, how many,
// what colour) or its own seed. The blister does the same with CSS variables; this is for drawings that need more.

import { aged, dims, faceSeed, KINDS, leftOf, seedOf, sizeOf, swatch, type Item, type Layer } from './world.ts'

/** A painter gets the item and its contents by slot, and returns SVG in the sprite's own units (32 to a square). */
type Painter = (host: Item, inside: (slot: number) => Item[]) => string

const f = (n: number) => +n.toFixed(2)
/** A small, stable number from a thing's id: books are not all the same height, lighters not all the same colour. */
const seeded = (id: number, salt = 0) => { let x = (id * 2654435761 + salt * 40503) >>> 0; return () => { x = (x ^ (x << 13)) >>> 0; x = (x ^ (x >>> 17)) >>> 0; x = (x ^ (x << 5)) >>> 0; return x / 4294967296 } }

/** Two colours mixed: `t` of the way from a to b. */
const mix = (a: string, b: string, t: number) => '#' + [1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('')
/** Cheddar's colours for its age: pale yellow paste and a golden rind when new, orange paste and a brown rind aged. */
const cheddar = (it: Item) => {
  const t = aged(it)
  return { paste: mix('#f5c458', '#ec8a2a', t), light: mix('#fbdb8c', '#f4ad5c', t), rind: mix('#e09c38', '#bf621c', t), dark: mix('#b5701e', '#86410e', t), line: mix('#9a6418', '#6a3510', t) }
}
/** A closed smooth path through points (Catmull-Rom, as cubic Béziers): organic outlines. */
function smooth(pts: number[][]) {
  const n = pts.length
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n]
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`
  }
  return d + 'Z'
}
/** A round thing that is not quite round: radius `rad` around (cx, cy), its edge wandering by `w`, the same way all round. */
function roundish(r: () => number, cx: number, cy: number, rad: number, w: number, squash = 1) {
  const ph = [r() * 6.3, r() * 6.3, r() * 6.3]
  return (radius: number) => smooth(Array.from({ length: 28 }, (_, i) => {
    const a = i / 28 * 2 * Math.PI, k = 1 + w * (0.55 * Math.sin(2 * a + ph[0]) + 0.3 * Math.sin(3 * a + ph[1]) + 0.15 * Math.sin(5 * a + ph[2]))
    return [cx + radius * k * Math.cos(a), cy + radius * k * Math.sin(a) * squash]
  }))
}
/** Bits scattered over a disc of radius `rad` (fat in salami, holes in cheese), mostly small, a few large, never touching. */
function scatter(r: () => number, n: number, rad: number, small: number, big: number, gap = 1.25) {
  const out: number[][] = []
  for (let t = 0; t < 600 && out.length < n; t++) {
    const s = small + Math.pow(r(), 2.2) * (big - small), d = Math.sqrt(r()) * Math.max(0, rad - s), a = r() * 2 * Math.PI
    const x = d * Math.cos(a), y = d * Math.sin(a)
    if (out.every(([fx, fy, fs]) => Math.hypot(fx - x, fy - y) > (fs + s) * gap)) out.push([x, y, s])
  }
  return out
}
const specks = (seed: number, n: number, x0: number, x1: number, y0: number, y1: number, c: string) => { const r = seeded(seed); let out = ''; for (let i = 0; i < n; i++) out += `<circle cx="${f(x0 + r() * (x1 - x0))}" cy="${f(y0 + r() * (y1 - y0))}" r="${f(0.5 + r() * 0.8)}" fill="${c}" opacity="0.5"/>`; return out }

/** The holes of a slice of cheese (in its own 64 by 64), from its seed: three to seven, varied, some at its edge. */
function cheeseHoles(seed: number) {
  const r = seeded(seed, 21), j = () => (r() * 2 - 1) * 1.3
  const edge = `M${f(7 + j())} ${f(8 + j())}L${f(57 + j())} ${f(7 + j())}L${f(57.5 + j())} ${f(56.5 + j())}L${f(7 + j())} ${f(57 + j())}Z`
  const holes: number[][] = []
  for (let t = 0, k = 3 + Math.floor(r() * 5); t < 300 && holes.length < k; t++) {
    const s = 1.6 + Math.pow(r(), 1.8) * 6.2, nearEdge = r() < 0.3
    const x = nearEdge ? (r() < 0.5 ? 6 + r() * 3 : 55 + r() * 3) : 12 + r() * 40, y = nearEdge && r() < 0.5 ? (r() < 0.5 ? 7 + r() * 2 : 55 + r() * 2) : 12 + r() * 40
    if (holes.every(([hx, hy, hs]) => Math.hypot(hx - x, hy - y) > hs + s + 2)) holes.push([x, y, s, 0.8 + r() * 0.3, r() * 180])
  }
  return { edge, holes }
}
const holeAt = (x: number, y: number, s: number, q: number, a: number, grow = 0) => `cx="${f(x)}" cy="${f(y)}" rx="${f(s + grow)}" ry="${f(s * q + grow)}" transform="rotate(${f(a)} ${f(x)} ${f(y)})"`
/**
 * A slice of cheese: a slightly uneven square with its own holes right through it (the field shows through), some biting
 * into its edge, each with a darker rim and a lit lower lip.
 */
function cheeseSlice(c: ReturnType<typeof cheddar>, seed: number, id: string) {
  const { edge, holes } = cheeseHoles(seed)
  let out = `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.light}"/><stop offset="0.4" stop-color="${c.paste}"/><stop offset="1" stop-color="${mix(c.paste, c.dark, 0.2)}"/></linearGradient>`
    + `<mask id="${id}m"><path d="${edge}" fill="#ffffff" stroke="#ffffff" stroke-width="1.6" stroke-linejoin="round"/>${holes.map(([x, y, s, q, a]) => `<ellipse ${holeAt(x, y, s, q, a)} fill="#000000"/>`).join('')}</mask></defs>`
  out += `<g mask="url(#${id}m)"><path d="${edge}" fill="url(#${id}g)" stroke="${c.line}" stroke-width="1.6" stroke-linejoin="round"/>`
  for (const [x, y, s, q, a] of holes) out += `<ellipse ${holeAt(x, y, s, q, a, 0.9)} fill="none" stroke="${c.dark}" stroke-width="1.4" opacity="0.4"/><path d="M${f(x - s * 0.9)} ${f(y + s * q * 0.5)}Q${f(x)} ${f(y + s * q * 1.5)} ${f(x + s * 0.9)} ${f(y + s * q * 0.4)}" fill="none" stroke="${c.light}" stroke-width="0.9" opacity="0.85"/>`
  return out + `<path d="M10 22L30 9" stroke="#ffffff" stroke-width="5" opacity="0.07" stroke-linecap="round"/></g>`
}
/** The same holes seen in a cut face of cheese: not through it, but shaded hollows in the paste. */
function cheeseFace(c: ReturnType<typeof cheddar>, seed: number) {
  return cheeseHoles(seed).holes.map(([x, y, s, q, a]) => `<ellipse ${holeAt(x, y, s, q, a)} fill="${mix(c.paste, c.dark, 0.55)}"/><ellipse ${holeAt(x + s * 0.15, y + s * 0.2, s * 0.7, q, a)} fill="${mix(c.paste, c.dark, 0.25)}"/>`).join('')
}
/**
 * A slice of salami: deep red, darker toward its edge, flecked with fat (many small flecks, a few large, never touching)
 * and a few peppercorns, inside a rim of casing that is the same on every slice.
 */
function salamiSlice(seed: number, id: string) {
  const r = seeded(seed, 11), cx = 32, cy = 32, R = 27.5
  const ring = salamiRing(r)
  let out = `<defs><radialGradient id="${id}m" cx="0.46" cy="0.42" r="0.6"><stop offset="0" stop-color="#b8404a"/><stop offset="0.72" stop-color="#9b2d36"/><stop offset="1" stop-color="#7a2029"/></radialGradient></defs>`
  out += `<path d="${ring(R)}" fill="#4b1714" stroke="#2e0d0b" stroke-width="0.8"/><path d="${ring(R - 0.9)}" fill="none" stroke="#6e2a24" stroke-width="0.6"/>`
  out += `<path d="${ring(R - 2.7)}" fill="url(#${id}m)"/>`
  for (const [x, y, sz] of scatter(r, 46, R - 4.4, 0.55, 2.9)) {
    const k = 5 + Math.floor(r() * 3), rot = r() * 6.3, sq = 0.7 + r() * 0.3
    const pts = Array.from({ length: k }, (_, i) => { const a = rot + i / k * 2 * Math.PI, q = sz * (0.72 + r() * 0.56); return [cx + x + q * Math.cos(a), cy + y + q * Math.sin(a) * sq] })
    out += `<path d="${smooth(pts)}" fill="#f2e3d8" stroke="#d6b0a2" stroke-width="0.35"/>`
  }
  for (let i = 0, n = 2 + Math.floor(r() * 5); i < n; i++) { const d = Math.sqrt(r()) * (R - 7), a = r() * 6.3; out += `<circle cx="${f(cx + d * Math.cos(a))}" cy="${f(cy + d * Math.sin(a))}" r="${f(0.65 + r() * 0.4)}" fill="#261010"/>` }
  return out + `<path d="M${cx - 17} ${cy - 14}Q${cx - 8} ${cy - 23} ${cx + 6} ${cy - 22}" fill="none" stroke="#ffffff" stroke-width="1.3" opacity="0.16" stroke-linecap="round"/>`
}

/** A salami slice's outline: never quite a circle (the same draws from its seed give the same one). */
const salamiRing = (r: () => number) => roundish(r, 32, 32, 27.5, 0.035, 0.97)

/** A slice of bread from above, as its own sprite draws it: the crust round it, the crumb full of small holes. */
const BREAD = 'M9 25C8 12 19 6 32 6C45 6 56 12 55 25C55 27 53 28 53 30L53 55C53 57.5 51.5 59 49 59L15 59C12.5 59 11 57.5 11 55L11 30C11 28 9 27 9 25Z'
const breadTop = (id: string) => `<defs><radialGradient id="${id}c" cx="0.45" cy="0.4" r="0.7"><stop offset="0" stop-color="#f3e4c2"/><stop offset="1" stop-color="#e2cb98"/></radialGradient></defs>`
  + `<path d="${BREAD}" fill="url(#${id}c)" stroke="#a9733f" stroke-width="3.2" stroke-linejoin="round"/><path d="${BREAD}" fill="none" stroke="#7e5228" stroke-width="0.8"/>`
  + '<g fill="#d6bb85" opacity="0.8"><ellipse cx="22" cy="22" rx="1.6" ry="1"/><ellipse cx="34" cy="18" rx="1.2" ry="0.8"/><ellipse cx="43" cy="27" rx="1.8" ry="1.1"/><ellipse cx="27" cy="33" rx="1.3" ry="0.9"/><ellipse cx="38" cy="40" rx="1.5" ry="1"/><ellipse cx="20" cy="45" rx="1.2" ry="0.8"/><ellipse cx="45" cy="50" rx="1.3" ry="0.9"/><ellipse cx="30" cy="51" rx="1.7" ry="1"/></g>'

/**
 * How a thing looks laid on a sandwich: its own face (the very slice, from its seed), its outline (to draw its edge), the
 * colour of that edge, how thick it is and how big, and how loosely it lies (turned, shifted).
 */
function layerArt(l: Layer, id: string) {
  const seed = l.seed ?? 0
  if (l.kind === 'cheeseslice') { const c = cheddar({ id: 0, x: 0, y: 0, rot: 0, ...l }); return { face: cheeseSlice(c, seed, id), edge: cheeseHoles(seed).edge, side: mix(c.paste, c.dark, 0.45), t: 2.4, k: 0.85, turn: 9, shift: 2.5 } }
  if (l.kind === 'salamislice') return { face: salamiSlice(seed, id), edge: salamiRing(seeded(seed, 11))(27.5), side: '#5e1e1b', t: 2, k: 0.68, turn: 0, shift: 8 }
  return { face: breadTop(id), edge: BREAD, side: '#a06e3c', t: 5, k: 1, turn: 3, shift: 1.2 }
}
/**
 * A sandwich, a little from above: its bread at the bottom and every layer on it in the order laid, each the very slice that
 * went on (cheese with its own holes, which show what is under them; salami with its own fat), lying a little loose so the
 * edges of the ones below show; the top one seen whole. A second slice of bread on top closes it.
 */
function sandwich(host: Item) {
  const st = KINDS[host.kind].stack!, sample = [{ kind: st.takes[0], seed: 3 }, { kind: st.takes[1], seed: 4 }, { kind: st.lid }] // the file's own look: one made
  const layers: Layer[] = [{ kind: st.on }, ...host.layers?.length ? host.layers : sample]
  const S = 1.1, Q = 0.52
  const arts = layers.map((l, i) => layerArt(l, `sw${host.id}l${i}`))
  let cy = 61 - 27 * S * Q - arts[0].t // the bread's lower edge sits at the bottom
  let out = `<ellipse cx="32" cy="${f(61 - arts[0].t * 0.4)}" rx="26" ry="4.5" fill="#000000" opacity="0.3"/>`
  arts.forEach((a, i) => {
    if (i) cy -= a.t
    const r = seeded(seedOf(host) * 31 + i, 41), turn = (r() * 2 - 1) * a.turn, dx = (r() * 2 - 1) * a.shift, dy = (r() * 2 - 1) * a.shift * 0.35
    const at = (y: number) => `translate(${f(32 + dx)} ${f(y + dy)}) scale(${f(S * a.k)} ${f(S * a.k * Q)}) rotate(${f(turn)}) translate(-32 -32)`
    for (let j = a.t; j > 0.05; j -= 0.7) out += `<path d="${a.edge}" fill="${j === a.t ? mix(a.side, '#000000', 0.35) : a.side}" transform="${at(cy + j)}"/>`
    out += `<g transform="${at(cy)}">${a.face}</g>`
  })
  return out
}

/**
 * A cheddar wheel: a squat cylinder seen a little from above, its sides bulging out a touch and its top a touch domed.
 * What is left of it is the part to the right (wedges come off the left), so it narrows from the left as it goes: one
 * sector of top, wall and paste for each wedge left; a cut face shows where it faces you.
 */
function wheel(host: Item) {
  const n = leftOf(host) || 8, a = n * 22.5, c = cheddar(host)
  const cx = 64, cy = 30, rx = 58, ry = 18, h = 40, R = Math.PI / 180
  const P = (t: number, dy = 0) => `${f(cx + rx * Math.cos(t * R))} ${f(cy + dy + ry * Math.sin(t * R))}`
  const tx = sizeOf(host).w * 32 - 128 + (n <= 4 ? 2 : 0)
  let out = `<defs><linearGradient id="wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c.rind}"/><stop offset="0.35" stop-color="${mix(c.rind, '#ffffff', 0.12)}"/><stop offset="1" stop-color="${c.dark}"/></linearGradient>`
    + `<radialGradient id="top" cx="0.45" cy="0.4" r="0.7"><stop offset="0" stop-color="${mix(c.rind, '#ffffff', 0.25)}"/><stop offset="1" stop-color="${c.rind}"/></radialGradient></defs><g transform="translate(${tx} 0)">`
  const face = (t: number, fill: string) => `<path d="M${cx} ${cy}L${P(t)}L${P(t, h)}L${cx} ${cy + h}Z" fill="${fill}" stroke="${c.line}" stroke-width="0.9" stroke-linejoin="round"/>` + specks(t + 50, 6, cx + Math.min(0, rx * Math.cos(t * R)) + 3, cx + Math.max(0, rx * Math.cos(t * R)) - 3, cy + 4, cy + h - 2, c.dark)
  if (n < 8 && a > 90) out += face(-a, c.paste) // the back cut faces you once more than half is left
  const w1 = Math.min(a, 180)
  out += `<path d="M${P(0)}A${rx} ${ry} 0 0 1 ${P(w1)}${w1 >= 180 ? `Q${cx - rx - 5} ${cy + h / 2} ${P(180, h)}` : `L${P(w1, h)}`}A${rx} ${ry} 0 0 0 ${P(0, h)}Q${cx + rx + 5} ${cy + h / 2} ${P(0)}Z" fill="url(#wall)" stroke="${c.line}" stroke-width="1" stroke-linejoin="round"/>`
  out += `<path d="M${P(4, h * 0.55)}A${rx} ${ry} 0 0 1 ${P(Math.min(w1, 176), h * 0.55)}" fill="none" stroke="${c.dark}" stroke-width="0.8" opacity="0.35"/>`
  if (n < 8 && a < 90) out += face(a, c.light) // the front cut faces you while less than half is left
  out += n >= 8 ? `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#top)" stroke="${c.line}" stroke-width="1"/>`
    : `<path d="M${cx} ${cy}L${P(-a)}A${rx} ${ry} 0 ${2 * a > 180 ? 1 : 0} 1 ${P(a)}Z" fill="url(#top)" stroke="${c.line}" stroke-width="1" stroke-linejoin="round"/><path d="M${P(-a)}L${cx} ${cy}L${P(a)}" fill="none" stroke="${c.light}" stroke-width="1.4" stroke-linejoin="round"/>`
  out += n >= 8 ? `<ellipse cx="${cx}" cy="${cy}" rx="${rx - 7}" ry="${ry - 2.5}" fill="none" stroke="${c.dark}" stroke-width="0.8" opacity="0.3"/>`
    : `<path d="M${f(cx + (rx - 7) * Math.cos(-a * R))} ${f(cy + (ry - 2.5) * Math.sin(-a * R))}A${rx - 7} ${ry - 2.5} 0 ${2 * a > 180 ? 1 : 0} 1 ${f(cx + (rx - 7) * Math.cos(a * R))} ${f(cy + (ry - 2.5) * Math.sin(a * R))}" fill="none" stroke="${c.dark}" stroke-width="0.8" opacity="0.3"/>`
  if (n >= 8) out += `<path d="M${P(200)}A${rx} ${ry} 0 0 1 ${P(250)}" fill="none" stroke="#ffffff" stroke-width="1.4" opacity="0.35" stroke-linecap="round"/>` // the light on the back rim, while there is a back
  return out + '</g>'
}

/**
 * A cheese wedge, a little from above and in front, like a cut of good cheese on a board: its front (one cut face) a
 * rectangle the full height of the wheel, its top the wheel's own top, the rind at the left and back, the thin end to the
 * right. Slices come off the thin end, and the face left there shows the next slice: its holes, exactly (from the seed the
 * knife will hand that slice). Smooth golden paste, round holes in the front (one breaking its edge), knife scrapes on top.
 */
function wedge(host: Item) {
  const n = leftOf(host) || 6, c = cheddar(host), r = seeded(seedOf(host), 31), id = `wg${host.id}`
  const TX = 89, top = 31, bottom = 60, R = 83, dx = 0.55, dy = -0.4, q = 0.7071
  const s = R * (1 - n / 6), xr = TX - s // the thin end, cut back by s
  const B = [TX - R * q + R * q * dx, top + R * q * dy] // where the back cut meets the rind
  const C = [xr + s * dx, top + s * dy] // the top back corner of the face at the thin end
  const right = Math.max(xr, C[0]) + 1.5, k = Math.min(1, (sizeOf(host).w * 32 - 2) / (right - 3))
  const ky = sizeOf(host).w < 2 ? 1 : k // the last bit, one square wide, still stands its two squares tall: drawn narrower, not smaller
  const topFace = `M6 ${top}L${f(xr)} ${top}L${f(C[0])} ${f(C[1])}L${f(B[0])} ${f(B[1])}C${f(B[0] - 24)} ${f(B[1] - 4)} 2 ${top - 19} 6 ${top}Z`
  let out = `<defs><linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.light}"/><stop offset="0.18" stop-color="${c.paste}"/><stop offset="1" stop-color="${mix(c.paste, c.dark, 0.28)}"/></linearGradient>`
    + `<linearGradient id="${id}t" x1="1" y1="1" x2="0.3" y2="0"><stop offset="0" stop-color="${c.light}"/><stop offset="1" stop-color="${mix(c.light, c.paste, 0.5)}"/></linearGradient>`
    + `<clipPath id="${id}c"><path d="${topFace}"/></clipPath>`
    + `<clipPath id="${id}e"><path d="M${f(xr)} ${top}L${f(xr)} ${bottom}L${f(C[0])} ${f(bottom + s * dy)}L${f(C[0])} ${f(C[1])}Z"/></clipPath></defs>`
    + `<g transform="translate(${f(1 - 3 * k)} ${f(61 - 61 * ky)}) scale(${f(k)} ${f(ky)})">`
  out += `<path d="${topFace}" fill="url(#${id}t)" stroke="${c.line}" stroke-width="0.7" stroke-linejoin="round"/>`
  out += `<g clip-path="url(#${id}c)" fill="none">` // knife scrapes: faint arcs round the wheel's middle (the thin end)
  for (let i = 0; i < 9; i++) { const rad = 20 + i * 7.5 + r() * 4, a0 = Math.PI + 0.12 + r() * 0.1, a1 = Math.PI + 0.62 + r() * 0.2; out += `<path d="M${f(TX + rad * Math.cos(a0))} ${f(top + rad * Math.sin(a0) * 0.75)}A${f(rad)} ${f(rad * 0.75)} 0 0 1 ${f(TX + rad * Math.cos(a1))} ${f(top + rad * Math.sin(a1) * 0.75)}" stroke="${i % 3 ? '#ffffff' : c.dark}" stroke-width="${f(0.4 + r() * 0.5)}" opacity="${i % 3 ? 0.22 : 0.08}"/>` }
  out += `</g><path d="M${f(B[0])} ${f(B[1])}C${f(B[0] - 24)} ${f(B[1] - 4)} 2 ${top - 19} 6 ${top}" fill="none" stroke="${c.rind}" stroke-width="2.4" stroke-linecap="round"/>`
  // the front, its rind edge at the left
  out += `<path d="M7.5 ${top}L${f(xr - 1.5)} ${top}Q${f(xr)} ${top} ${f(xr)} ${top + 1.5}L${f(xr)} ${bottom - 1.5}Q${f(xr)} ${bottom} ${f(xr - 1.5)} ${bottom}L7.5 ${bottom}Q6 ${bottom} 6 ${bottom - 1.5}L6 ${top + 1.5}Q6 ${top} 7.5 ${top}Z" fill="url(#${id}f)" stroke="${c.line}" stroke-width="0.7"/>`
  out += `<path d="M6.8 ${top + 1}L6.8 ${bottom - 1}" stroke="${c.rind}" stroke-width="2.2" stroke-linecap="round"/>`
  out += `<path d="M9 ${top + 0.8}L${f(xr - 2)} ${top + 0.8}" stroke="#ffffff" stroke-width="1.3" opacity="0.45" stroke-linecap="round"/>`
  const hole = (x: number, y: number, rx: number, ry: number) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${mix(c.paste, c.dark, 0.55)}"/><ellipse cx="${f(x - rx * 0.18)}" cy="${f(y + ry * 0.22)}" rx="${f(rx * 0.72)}" ry="${f(ry * 0.68)}" fill="${mix(c.paste, c.dark, 0.25)}"/><path d="M${f(x - rx * 0.85)} ${f(y + ry * 0.45)}Q${f(x)} ${f(y + ry * 1.25)} ${f(x + rx * 0.8)} ${f(y + ry * 0.55)}" fill="none" stroke="${c.light}" stroke-width="0.8" opacity="0.8"/>`
  for (let i = 0, m = 2 + Math.floor(r() * 3); i < m; i++) { const rr = 2.1 + r() * 2.8, x = 11 + r() * (xr - 16), y = top + 7 + r() * (bottom - top - 12); if (xr - 6 > 12 && x + rr < xr - 2) out += hole(x, y, rr, rr * 0.92) }
  if (r() < 0.75 && xr - 6 > 16) out += hole(10 + r() * (xr - 20), top + 0.6, 3 + r() * 1.4, 2.4) // one breaking the edge
  // the face at the thin end, once it has been cut: paste, and the next slice's holes on it
  if (n < 6) {
    out += `<path d="M${f(xr)} ${top}L${f(xr)} ${bottom}L${f(C[0])} ${f(bottom + s * dy)}L${f(C[0])} ${f(C[1])}Z" fill="${mix(c.light, c.paste, 0.3)}" stroke="${c.line}" stroke-width="0.7" stroke-linejoin="round"/>`
    out += `<g clip-path="url(#${id}e)"><g transform="matrix(${f(s * dx / 64)} ${f(s * dy / 64)} 0 ${f((bottom - top) / 64)} ${f(xr)} ${top})">${cheeseFace(c, faceSeed(host, n))}</g></g>`
    out += `<path d="M${f(xr)} ${top}L${f(C[0])} ${f(C[1])}" stroke="#ffffff" stroke-width="0.9" opacity="0.5"/>`
  }
  return out + '</g>'
}

const PAINTERS: Record<string, Painter> = {
  sandwich,
  /**
   * The disc holder: eight black plastic shelves, each holding one disc lying flat, seen from the front, so only its thin
   * edge shows, in its own colour, with the label wrapped over it. Inside it is 4 by 8: a disc's square (2 by 2) row by row is its shelf.
   */
  discrack: (_, inside) => {
    const top = 7, shelf = 82 / 8
    return inside(0).map(d => {
      const n = Math.min(7, Math.floor(d.y / 2) * 2 + Math.min(1, Math.floor(d.x / 2)))
      const y = f(top + (n + 1) * shelf - 0.6 - 3.6)
      return `<rect x="10.5" y="${y}" width="43" height="3.6" rx="0.6" fill="${swatch(d)}"/><rect x="18" y="${y}" width="27" height="1.2" fill="#e8e2d2" opacity="0.85"/>`
        + `<rect x="10.5" y="${y}" width="43" height="0.5" fill="#ffffff" opacity="0.2"/><rect x="49.5" y="${y}" width="4" height="3.6" fill="#000000" opacity="0.28"/>`
    }).join('')
  },
  /**
   * The bookshelf: two shelves, each 12 squares wide and 3 high inside. A book standing shows its spine where it stands, in
   * its cover's colour, a little shorter or taller than its neighbours; a book lying down shows as a flat block where it lies.
   */
  bookshelf: (_, inside) => {
    const left = 9, col = 110 / 12, row = 51 / 3, tops = [9, 68]
    return [0, 1].map(slot => inside(slot).map(b => {
      const { w, h } = dims(b)
      const c = swatch(b), floor = tops[slot] + (b.y + h) * row
      if (h >= w) {
        const height = row * 3 * (0.8 + seeded(b.id)() * 0.16), x = left + b.x * col + 0.7, width = w * col - 1.4, y = floor - height
        return `<rect x="${f(x)}" y="${f(y)}" width="${f(width)}" height="${f(height)}" rx="1" fill="${c}" stroke="#1a110b" stroke-width="0.7"/>`
          + `<rect x="${f(x)}" y="${f(y)}" width="1.6" height="${f(height)}" fill="#ffffff" opacity="0.14"/><rect x="${f(x + width - 2)}" y="${f(y)}" width="2" height="${f(height)}" fill="#000000" opacity="0.25"/>`
          + `<g fill="#b8975a" opacity="0.75"><rect x="${f(x + 1.5)}" y="${f(y + 4)}" width="${f(width - 3)}" height="1.2"/><rect x="${f(x + 1.5)}" y="${f(floor - 6)}" width="${f(width - 3)}" height="1.2"/></g>`
          + `<rect x="${f(x + 3)}" y="${f(y + height * 0.32)}" width="${f(width - 6)}" height="${f(height * 0.22)}" fill="#000000" opacity="0.28"/>`
      }
      const height = row * 0.95, x = left + b.x * col + 0.5, width = w * col - 1
      return `<rect x="${f(x)}" y="${f(floor - height)}" width="${f(width)}" height="${f(height)}" rx="1" fill="${c}" stroke="#1a110b" stroke-width="0.7"/><rect x="${f(x + 3)}" y="${f(floor - height + 3)}" width="${f(width - 6)}" height="1.2" fill="#b8975a" opacity="0.7"/>`
    }).join('')).join('')
  },
  /**
   * Sliced bread: the loaf is as long as the slices left in it (eight when new), cut lines between them, the cut end pale.
   * The bag stays the same length: past the loaf it lies flat to the twist and its clip; empty, it is a flat bag of crumbs.
   */
  bread: (_, inside) => {
    const n = inside(0).length, full = n >= 8, S = 9, L = S * n, x0 = 6, x1 = x0 + L, T = 18, B = 50, bagR = 82 // a slice is 9 wide; the loaf is 32 tall
    let out = ''
    if (n) {
      const r = Math.min(9, L) // the heel is rounded; the end that was cut is square
      out += `<path d="M${f(x0 + r)} ${T}L${f(x1)} ${T}L${f(x1)} ${B}L${f(x0 + r)} ${B}Q${x0} ${B} ${x0} ${f(B - r)}L${x0} ${f(T + r)}Q${x0} ${T} ${f(x0 + r)} ${T}Z" fill="url(#crust)"/>`
      for (let k = 1; k < n; k++) out += `<path d="M${x0 + k * S} ${T + 1}Q${x0 + k * S - 1} 34 ${x0 + k * S} ${B - 1}" fill="none" stroke="#8e5f31" stroke-width="0.9" opacity="0.5"/>`
      if (!full) out += `<rect x="${f(x1 - 3)}" y="${T}" width="3" height="${B - T}" fill="#ead6ad"/><path d="M${f(x1)} ${T}V${B}" stroke="#a9733f" stroke-width="0.8"/>`
    }
    if (!full) { // crumbs on the bottom of the empty part
      const r = seeded(11), c0 = n ? x1 + 4 : 10
      out += '<g fill="#c99a5e" opacity="0.8">'
      for (let i = 0; i < 7; i++) { const x = c0 + r() * (bagR - 4 - c0); if (x < bagR - 4) out += `<circle cx="${f(x)}" cy="${f(47 + r() * 3)}" r="${f(0.6 + r() * 0.6)}"/>` }
      out += '</g>'
    }
    out += '<rect x="26" y="26" width="24" height="16" rx="1.5" fill="#ece6d8"/><circle cx="33" cy="34" r="4.5" fill="#d39a3a"/><circle cx="33" cy="34" r="1.8" fill="#ece6d8"/><rect x="40" y="29.5" width="7" height="4.5" fill="#2f4866"/><rect x="40" y="35.5" width="7" height="1.6" fill="#2f4866"/><rect x="26" y="39.5" width="24" height="2.5" fill="#c25a3c"/>'
    // the bag: always its full shape; where it is empty it sags a little and creases
    const e = Math.max(18, x1)
    out += `<path d="M4 29C4 18 9 15 17 15L${full ? 66 : f(e)} 15${full ? '' : `Q${f((e + bagR) / 2)} 18 ${bagR - 2} 15.5`}C${bagR + 2} 16 ${bagR + 4} 19 ${bagR + 4} 28L${bagR + 4} 40C${bagR + 4} 49 ${bagR} 53 ${bagR - 4} 53L10 53C6 53 4 51 4 47Z" fill="url(#film)" stroke="#e6edf0" stroke-width="1" stroke-opacity="0.6"/>`
    if (!full) {
      out += '<g fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="0.8">'
      for (let x = (n ? x1 + 3 : 10) + 4; x < bagR - 2; x += 10) out += `<path d="M${f(x)} 19Q${f(x + 3)} 34 ${f(x - 2)} 49"/>`
      out += '</g>'
    }
    out += `<path d="M${bagR - 3} 17C${bagR + 1} 20 ${bagR + 3} 27 ${bagR + 4} 30L${bagR + 4} 38C${bagR + 3} 41 ${bagR + 1} 48 ${bagR - 3} 51" fill="#dfe7ea" fill-opacity="0.35" stroke="#e6edf0" stroke-opacity="0.75" stroke-width="1"/>`
    out += `<path d="M10 19C22 17.5 ${full ? '44 17.5 60 18' : `${f(Math.max(24, x1 - 14))} 17.5 ${f(Math.max(26, x1 - 3))} 18`}" fill="none" stroke="#ffffff" stroke-opacity="0.6" stroke-width="1.6" stroke-linecap="round"/><path d="M14 48L32 48" stroke="#ffffff" stroke-opacity="0.35" stroke-width="1.2" stroke-linecap="round"/>`
    return out
  },
  cheesewheel: host => wheel(host),
  cheesewedge: host => wedge(host),
  cheeseslice: host => cheeseSlice(cheddar(host), seedOf(host), `cs${host.id}`),
  salamislice: host => salamiSlice(seedOf(host), `sl${host.id}`),
  /**
   * A salami: a cured sausage in its dark casing, dusted with white bloom, string round it, tied at its ends; cut, its end
   * shows a face like its slices. It shortens from the cut end as slices come off.
   */
  salami: host => {
    const n = leftOf(host) || 8, L = 112 * n / 8, x0 = 6, x1 = x0 + L, top = 9, bot = 55, R = (bot - top) / 2, mid = (top + bot) / 2
    const r = seeded(host.id, 5), id = `sa${host.id}`
    const body = n >= 8 ? `M${x0 + R} ${top}L${f(x1 - R)} ${top}A${R} ${R} 0 0 1 ${f(x1 - R)} ${bot}L${x0 + R} ${bot}A${R} ${R} 0 0 1 ${x0 + R} ${top}Z`
      : `M${x0 + R} ${top}L${f(x1)} ${top}L${f(x1)} ${bot}L${x0 + R} ${bot}A${R} ${R} 0 0 1 ${x0 + R} ${top}Z`
    let out = `<defs><linearGradient id="${id}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a3430"/><stop offset="0.3" stop-color="#6a2420"/><stop offset="1" stop-color="#3e110f"/></linearGradient><clipPath id="${id}k"><path d="${body}"/></clipPath></defs>`
    out += `<path d="${body}" fill="url(#${id}c)"/>`
    out += `<g clip-path="url(#${id}k)">`
    for (let i = 0; i < Math.round(22 * n / 8) + 4; i++) out += `<ellipse cx="${f(x0 + r() * L)}" cy="${f(top + r() * (bot - top))}" rx="${f(1.5 + r() * 5)}" ry="${f(0.8 + r() * 2.2)}" fill="#efe6dc" opacity="${f(0.08 + r() * 0.16)}"/>`
    for (let i = 0; i < 5; i++) { const y = top + 6 + r() * (bot - top - 12); out += `<path d="M${x0 + 4} ${f(y)}C${f(x0 + L * 0.3)} ${f(y + (r() * 2 - 1) * 3)} ${f(x0 + L * 0.7)} ${f(y + (r() * 2 - 1) * 3)} ${f(x1)} ${f(y)}" fill="none" stroke="#2a0b0a" stroke-width="0.5" opacity="0.4"/>` }
    for (let x = x0 + 14; x < x1 - 4; x += 15) out += `<path d="M${x} ${top - 1}Q${x + 4} ${mid} ${x + 1} ${bot + 1}" fill="none" stroke="#d9c8a2" stroke-width="0.9" opacity="0.85"/>`
    out += `<path d="M${x0 + 8} ${top + 7}L${f(x1 - 6)} ${top + 7}" stroke="#ffffff" stroke-width="2" opacity="0.12" stroke-linecap="round"/></g>`
    out += `<path d="${body}" fill="none" stroke="#2a0b0a" stroke-width="0.9"/>`
    out += `<path d="M${x0 + 1} ${mid - 3}Q${x0 - 3} ${mid} ${x0 + 1} ${mid + 3}M${x0 + 1} ${mid}L${x0 - 2.5} ${mid + 6}" fill="none" stroke="#d9c8a2" stroke-width="1.1" stroke-linecap="round"/>` // the knot at its far end
    if (n >= 8) out += `<path d="M${f(x1 - 1)} ${mid - 3}Q${f(x1 + 3)} ${mid} ${f(x1 - 1)} ${mid + 3}" fill="none" stroke="#d9c8a2" stroke-width="1.1" stroke-linecap="round"/>`
    else { // the cut end, turned a little toward you: the next slice, exactly as it will come off
      const ax = 11 / 27.5, ay = R / 27.5
      out += `<g transform="matrix(${f(ax)} 0 0 ${f(ay)} ${f(x1 - 32 * ax)} ${f(mid - 32 * ay)})">${salamiSlice(faceSeed(host, n), `${id}f`)}</g>`
    }
    return out
  },
  /** A matchbox, its drawer slid half out: one match for each in it (ten when new), lying side by side, heads to the right. */
  matchbox: (_, inside) => {
    const n = Math.min(10, inside(0).length)
    let out = '<rect x="20" y="6" width="41" height="21" rx="1" fill="#d9b98a" stroke="#6e5232" stroke-width="0.8"/><rect x="22" y="8" width="37" height="17" fill="#b8956a"/>'
    for (let i = 0; i < n; i++) { const y = f(23.4 - i * 1.65); out += `<rect x="23" y="${y}" width="31" height="1.25" rx="0.4" fill="#ecd7a6"/><ellipse cx="55.4" cy="${f(+y + 0.62)}" rx="2.1" ry="1" fill="#8a2a22"/>` }
    return out
  },
  /**
   * A disposable lighter: every one is its own, picked from its id: a plastic colour, and solid, two-toned, striped, spotted,
   * banded or swirled. The hood, the wheel and the button are the same on all of them.
   */
  lighter: host => {
    const r = seeded(host.id, 3)
    const COLOURS = ['#c8322e', '#2f63b4', '#e3b623', '#2f9a52', '#1e1e22', '#e9e6dc', '#e2742a', '#d75a9a', '#6a4aa8', '#1f9a9a', '#8fbf3a', '#4a5866']
    const c1 = COLOURS[Math.floor(r() * COLOURS.length)], c2 = COLOURS[Math.floor(r() * COLOURS.length)]
    const style = Math.floor(r() * 6), id = `lt${host.id}`
    const body = 'M8 20C8 18.5 9 18 10.5 18L21.5 18C23 18 24 18.5 24 20L24 59C24 60.5 23 61 21.5 61L10.5 61C9 61 8 60.5 8 59Z'
    let out = `<defs><clipPath id="${id}"><path d="${body}"/></clipPath>${style === 1 ? `<linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>` : ''}</defs>`
    out += `<path d="${body}" fill="${style === 1 ? `url(#${id}g)` : c1}"/><g clip-path="url(#${id})">`
    if (style === 2) for (let y = 10; y < 70; y += 7) out += `<path d="M2 ${y}L30 ${y - 10}L30 ${y - 6}L2 ${y + 4}Z" fill="${c2}"/>`
    if (style === 3) for (let i = 0; i < 9; i++) out += `<circle cx="${f(10 + r() * 12)}" cy="${f(22 + r() * 36)}" r="${f(1 + r() * 1.6)}" fill="${c2}"/>`
    if (style === 4) out += `<rect x="6" y="${f(30 + r() * 10)}" width="20" height="12" fill="${c2}"/><rect x="6" y="${f(32 + r() * 6)}" width="20" height="1" fill="#ffffff" opacity="0.6"/>`
    if (style === 5) out += `<path d="M6 ${f(26 + r() * 8)}C14 ${f(20 + r() * 20)} 18 ${f(40 + r() * 10)} 28 ${f(34 + r() * 14)}L28 64L6 64Z" fill="${c2}" opacity="0.85"/>`
    out += `<rect x="8" y="18" width="4" height="43" fill="#ffffff" opacity="0.22"/><rect x="20" y="18" width="4" height="43" fill="#000000" opacity="0.18"/></g>`
    out += `<path d="${body}" fill="none" stroke="#151518" stroke-width="0.9"/>`
    out += `<circle cx="13" cy="10" r="4.6" fill="#3a3a40" stroke="#151518" stroke-width="0.7"/><path d="M9.5 8.5H16.5M9.2 10H16.8M9.5 11.5H16.5" stroke="#6a6a72" stroke-width="0.6"/>`
    out += `<path d="M9 19L9 9.5C9 8 10 7 11.5 7L20 7L23 11L23 19Z" fill="#c9cdd2" stroke="#55595f" stroke-width="0.8"/><g fill="#55595f"><circle cx="18" cy="11" r="0.7"/><circle cx="20.5" cy="11" r="0.7"/><circle cx="18" cy="13.5" r="0.7"/><circle cx="20.5" cy="13.5" r="0.7"/></g>`
    out += `<rect x="16" y="14.5" width="7" height="4" rx="1" fill="${style % 2 ? '#1e1e22' : c1}" stroke="#151518" stroke-width="0.6"/>`
    return out
  },
}

const FILL = /<!--fill-->[\s\S]*?<!--\/fill-->/
/** A sprite painted from its item, if its kind has a painter and its sprite a place for it. */
export function paintFill(host: Item, svg: string, inside: (slot: number) => Item[]) {
  const p = PAINTERS[host.kind] as Painter | undefined
  return p && FILL.test(svg) ? svg.replace(FILL, `<!--fill-->${p(host, inside)}<!--/fill-->`) : svg
}
/** What a painter draws for a thing as it comes (for the sprite files themselves: scripts/fills.ts). */
export const paintDefault = (kind: string, host: Item, inside: (slot: number) => Item[]) => (PAINTERS[kind] as Painter | undefined)?.(host, inside)
