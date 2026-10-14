// Sprites that draw what is in them (or what they are). A kind with a painter here has a part of its sprite between
// `<!--fill-->` and `<!--/fill-->`: what is written there is the thing as it comes (whole, full), which the gallery and the
// footprint check see, and the game paints it over from the item itself: its contents (where each thing sits, how many,
// what colour) or its own seed. The blister does the same with CSS variables; this is for drawings that need more.

import { dims, swatch, type Item } from './world.ts'

/** A painter gets the item and its contents by slot, and returns SVG in the sprite's own units (32 to a square). */
type Painter = (host: Item, inside: (slot: number) => Item[]) => string

const f = (n: number) => +n.toFixed(2)
/** A small, stable number from a thing's id: books are not all the same height, lighters not all the same colour. */
const seeded = (id: number, salt = 0) => { let x = (id * 2654435761 + salt * 40503) >>> 0; return () => { x = (x ^ (x << 13)) >>> 0; x = (x ^ (x >>> 17)) >>> 0; x = (x ^ (x << 5)) >>> 0; return x / 4294967296 } }

/** A wedge, or what is left of it, lying on its side: paste with holes, the rind along its back, a pale cut where slices went. */
function wedge(n: number) {
  const A = [10, 6], B = [8, 90], C = [92, 90], k = Math.max(0.07, n / 8)
  const at = (u: number, v: number) => [A[0] + u * (B[0] - A[0]) + v * (C[0] - A[0]), A[1] + u * (B[1] - A[1]) + v * (C[1] - A[1])]
  const P = at(1 - k, 0), Q = at(0, 1 - k)
  const pts = n >= 8 ? [A, B, C] : [P, B, C, Q]
  const r = seeded(7)
  const holes: number[][] = []
  for (let i = 0; i < 14; i++) { let u = r(), v = r(); if (u + v > 1) { u = 1 - u; v = 1 - v } const rr = 1.8 + r() * 3.6; if (u + v > 1 - k + 0.08 && u + v < 0.93) holes.push([...at(u, v), rr]) }
  return `<polygon points="${pts.map(p => p.map(f).join(',')).join(' ')}" fill="#efcf6c" stroke="#8f6a1c" stroke-width="1.2" stroke-linejoin="round"/>`
    + holes.map(([x, y, rr]) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rr)}" ry="${f(rr * 0.8)}" fill="#d8a83c"/>`).join('')
    + `<path d="M8 90L92 90" stroke="#b07a26" stroke-width="5" stroke-linecap="round"/>`
    + (n < 8 ? `<path d="M${P.map(f).join(' ')}L${Q.map(f).join(' ')}" stroke="#fbeaa8" stroke-width="2" stroke-linecap="round"/>` : '<path d="M14 18L13 80" stroke="#fff6cc" stroke-width="1.5" opacity="0.6"/>')
}

const PAINTERS: Record<string, Painter> = {
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
    const n = inside(0).length, full = n >= 8, L = 97 * n / 8, x1 = 8 + L, e = x1 + 3, R = Math.min(10, L / 2)
    let out = ''
    if (n) {
      out += `<rect x="8" y="11" width="${f(L)}" height="46" rx="${f(Math.min(12, L / 2))}" ry="11" fill="url(#crust)"/>`
      for (let k = 1; k < n; k++) out += `<path d="M${f(8 + k * 97 / 8)} 12Q${f(7 + k * 97 / 8)} 34 ${f(8 + k * 97 / 8)} 56" fill="none" stroke="#8e5f31" stroke-width="0.9" opacity="0.5"/>`
      if (!full) out += `<rect x="${f(x1 - 3.5)}" y="13" width="3.5" height="42" rx="1.5" fill="#ead6ad"/>`
    } else out += '<g fill="#c99a5e" opacity="0.8"><circle cx="30" cy="38" r="1"/><circle cx="52" cy="41" r="0.8"/><circle cx="74" cy="37" r="1.1"/><circle cx="90" cy="40" r="0.7"/></g>'
    // the label is printed on the bag: on the loaf while the loaf is under it, smaller on the flat bag after
    out += n >= 6
      ? '<rect x="40" y="22" width="32" height="24" rx="1.5" fill="#ece6d8"/><circle cx="50" cy="34" r="6.5" fill="#d39a3a"/><circle cx="50" cy="34" r="2.5" fill="#ece6d8"/><rect x="60" y="27" width="8.5" height="6" fill="#2f4866"/><rect x="60" y="35.5" width="8.5" height="2" fill="#2f4866"/><rect x="40" y="43" width="32" height="3" fill="#c25a3c"/>'
      : '<rect x="42" y="27" width="28" height="15" rx="1.2" fill="#ece6d8"/><circle cx="50" cy="34" r="4.5" fill="#d39a3a"/><rect x="58" y="30" width="8" height="4" fill="#2f4866"/><rect x="42" y="40" width="28" height="2" fill="#c25a3c"/>'
    const film = full ? 'M6 23C6 11 13 8.5 24 8.5L92 8.5C103 9 108 14 108 24L108 54C108 58 105 59.5 100 59.5L12 59.5C8 59.5 6 58 6 54Z'
      : n ? `M6 ${f(8.5 + R)}Q6 8.5 ${f(6 + R)} 8.5L${f(e - R)} 8.5Q${f(e)} 8.5 ${f(e)} ${f(8.5 + R)}L${f(e)} 21Q${f(e)} 24 ${f(e + 4)} 24L105 24L105 44L${f(e + 4)} 44Q${f(e)} 44 ${f(e)} 47L${f(e)} ${f(59.5 - R)}Q${f(e)} 59.5 ${f(e - R)} 59.5L${f(6 + R)} 59.5Q6 59.5 6 ${f(59.5 - R)}Z`
      : 'M6 28Q6 24 10 24L105 24L105 44L10 44Q6 44 6 40Z'
    out += `<path d="${film}" fill="url(#film)" stroke="#e6edf0" stroke-width="1" stroke-opacity="0.6"/>`
    out += `<path d="${full ? 'M105 12C110 17 113 26 114 30L114 40C113 44 110 51 105 57' : 'M105 24C109 26 112 28 114 30L114 40C112 42 109 44 105 44'}" fill="#dfe7ea" fill-opacity="0.35" stroke="#e6edf0" stroke-opacity="0.75" stroke-width="1"/>`
    out += full ? '<path d="M14 14C30 11.5 60 11.5 84 12.5" fill="none" stroke="#ffffff" stroke-opacity="0.6" stroke-width="1.6" stroke-linecap="round"/><path d="M20 53L44 53" stroke="#ffffff" stroke-opacity="0.35" stroke-width="1.2" stroke-linecap="round"/><path d="M62 9L70 9L56 59L48 59Z" fill="#ffffff" fill-opacity="0.08"/>'
      : `${L > 24 ? `<path d="M14 13C${f(14 + L * 0.3)} 11.5 ${f(e - 12)} 11.5 ${f(e - 6)} 12.5" fill="none" stroke="#ffffff" stroke-opacity="0.55" stroke-width="1.4" stroke-linecap="round"/>` : ''}<path d="M${f(Math.max(12, e + 6))} 26.5L100 26.5" stroke="#ffffff" stroke-opacity="0.4" stroke-width="1" stroke-linecap="round"/>`
    return out
  },
  /** A cheese wheel from above: one sector for each wedge still in it (eight when new), the pale paste where it was cut, on its paper. */
  cheesewheel: (_, inside) => {
    const n = inside(0).length, cx = 64, cy = 64, R = 45
    const pt = (a: number, r = R) => `${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))}`
    let out = `<circle cx="64" cy="64" r="47" fill="#d8cfb8" opacity="0.55"/>`
    for (let k = 0; k < n; k++) {
      const a0 = -Math.PI / 2 + k * Math.PI / 4, a1 = a0 + Math.PI / 4
      out += `<path d="M${cx} ${cy}L${pt(a0)}A${R} ${R} 0 0 1 ${pt(a1)}Z" fill="url(#rind)"/><path d="M${pt(a0)}A${R} ${R} 0 0 1 ${pt(a1)}" fill="none" stroke="#8f5f1c" stroke-width="4"/><path d="M${pt(a0, 37)}A37 37 0 0 1 ${pt(a1, 37)}" fill="none" stroke="#8f5f1c" stroke-width="0.8" opacity="0.4"/>`
    }
    if (n && n < 8) {
      const a0 = -Math.PI / 2, a1 = a0 + n * Math.PI / 4
      out += `<path d="M${cx} ${cy}L${pt(a0, R - 1)}M${cx} ${cy}L${pt(a1, R - 1)}" stroke="#fbeaa8" stroke-width="2.5" stroke-linecap="round"/>`
    }
    return out
  },
  /** A wedge: slices come off its thin end, so what is left is closer and closer to its rind (the rind is what is left at last). */
  cheesewedge: (_, inside) => wedge(inside(0).length),
  /** A ham: the log is as long as the slices left in it; its cut end shows the pink face, its netting goes on round what is left. */
  ham: (_, inside) => {
    const n = inside(0).length, L = 110 * n / 8, x1 = 9 + L
    if (!n) return `<path d="M10 40C16 34 22 46 28 40" fill="none" stroke="#e8d8c8" stroke-width="1.2"/>`
    let out = `<rect x="9" y="10" width="${f(L)}" height="46" rx="${f(Math.min(16, L / 2))}" ry="20" fill="url(#ham)" stroke="#7a3a36" stroke-width="1"/>`
    out += `<g fill="none" stroke="#f3dccc" stroke-width="0.8" opacity="0.55">`
    for (let x = 16; x < x1 - 4; x += 9) out += `<path d="M${x} 11L${f(x + 8)} 55"/><path d="M${f(x + 8)} 11L${x} 55"/>`
    out += `</g><path d="M14 22C${f(14 + L * 0.3)} 18 ${f(14 + L * 0.6)} 26 ${f(x1 - 6)} 20" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.25"/>`
    if (n < 8) out += `<ellipse cx="${f(x1 - 4)}" cy="33" rx="5" ry="22" fill="#e9a29c" stroke="#f6e0d4" stroke-width="2"/><path d="M${f(x1 - 6)} 22Q${f(x1 - 2)} 30 ${f(x1 - 5)} 40" fill="none" stroke="#f8e4dc" stroke-width="0.8"/>`
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
