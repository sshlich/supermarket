// Checks each sprite against its footprint: every square the kind takes should be at least 15% covered by the drawing,
// and every square it leaves free under 2%. Prints a coverage map for anything that fails (or for the kinds named).
//   node scripts/footprints.ts [kind...]      (needs rsvg-convert: brew install librsvg)

import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { inflateSync } from 'node:zlib'
import { KINDS, kindCells } from '../src/world.ts'

const IN = 0.15, OUT = 0.02, PX = 32 // one pixel per sprite unit

/** Alpha channel of an 8-bit RGBA, non-interlaced PNG (what rsvg-convert writes). */
function alpha(png: Buffer): { w: number; h: number; a: Uint8Array } {
  let pos = 8, w = 0, h = 0
  const idat: Buffer[] = []
  while (pos < png.length) {
    const len = png.readUInt32BE(pos), type = png.toString('ascii', pos + 4, pos + 8), data = png.subarray(pos + 8, pos + 8 + len)
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); if (data[8] !== 8 || data[9] !== 6 || data[12]) throw new Error('expected 8-bit RGBA, not interlaced') }
    if (type === 'IDAT') idat.push(data)
    pos += 12 + len
  }
  const raw = inflateSync(Buffer.concat(idat)), row = w * 4, px = new Uint8Array(w * h * 4)
  for (let y = 0; y < h; y++) {
    const f = raw[y * (row + 1)], src = raw.subarray(y * (row + 1) + 1, (y + 1) * (row + 1)), o = y * row
    for (let x = 0; x < row; x++) {
      const a = x >= 4 ? px[o + x - 4] : 0, b = y ? px[o - row + x] : 0, c = x >= 4 && y ? px[o - row + x - 4] : 0
      const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c)
      px[o + x] = src[x] + [0, a, b, (a + b) >> 1, pa <= pb && pa <= pc ? a : pb <= pc ? b : c][f]
    }
  }
  const out = new Uint8Array(w * h)
  for (let i = 0; i < w * h; i++) out[i] = px[i * 4 + 3]
  return { w, h, a: out }
}

const only = process.argv.slice(2)
let bad = 0
for (const [id, k] of Object.entries(KINDS)) {
  const file = new URL(`../src/sprites/${id}.svg`, import.meta.url)
  if ((only.length && !only.includes(id)) || !existsSync(file)) continue
  const { a } = alpha(execFileSync('rsvg-convert', ['-w', String(k.w * PX), '-h', String(k.h * PX), file.pathname]))
  const taken = new Set(kindCells(id).map(([x, y]) => `${x},${y}`))
  const cover = (cx: number, cy: number) => {
    let sum = 0
    for (let y = cy * PX; y < (cy + 1) * PX; y++) for (let x = cx * PX; x < (cx + 1) * PX; x++) sum += a[y * k.w * PX + x]
    return sum / (PX * PX * 255)
  }
  const rows: string[] = []
  let fails = 0
  for (let y = 0; y < k.h; y++) {
    const cells: string[] = []
    for (let x = 0; x < k.w; x++) {
      const c = cover(x, y), inside = taken.has(`${x},${y}`), ok = inside ? c >= IN : c < OUT
      if (!ok) fails++
      cells.push(`${inside ? '#' : '.'}${String(Math.round(c * 100)).padStart(3)}%${ok ? ' ' : '!'}`)
    }
    rows.push('  ' + cells.join(' '))
  }
  if (fails) bad++
  if (fails || only.length) console.log(`${fails ? 'FAIL' : 'ok  '} ${id} ${k.w}x${k.h}\n${rows.join('\n')}`)
}
console.log(bad ? `${bad} sprite(s) off their footprint (# taken, . free; taken needs ${IN * 100}%+, free under ${OUT * 100}%)` : 'all sprites match their footprints')
process.exitCode = bad ? 1 : 0
