// Checks sprites against their kinds (src/kinds.json): the file is there, it is one well-formed <svg> whose viewBox is the
// footprint at 32 units a square, and, drawn in a real browser, every square the kind takes is at least 15% covered and every
// square it leaves free under 2% (the rule of scripts/footprints.ts). Can also lay the sprites out on a sheet to look at.
//   node scripts/check-sprites.mjs [kind or prefix*...] [--sheet out.png] [--chrome path] [--pw path/to/playwright-core]
// Needs playwright-core and a Chromium (defaults: the scratchpad install, ~/.cache/ms-playwright/chromium-*/).

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { pathToFileURL } from 'node:url'

const args = process.argv.slice(2), opt = n => { const i = args.indexOf(n); return i < 0 ? null : args.splice(i, 2)[1] }
const sheet = opt('--sheet'), chrome = opt('--chrome') ?? (() => { const d = `${homedir()}/.cache/ms-playwright`; const c = existsSync(d) && readdirSync(d).find(x => /^chromium-\d+$/.test(x)); return c ? `${d}/${c}/chrome-linux64/chrome` : null })()
const pw = opt('--pw') ?? process.env.PLAYWRIGHT_CORE
const K = JSON.parse(readFileSync(new URL('../src/kinds.json', import.meta.url), 'utf8'))
const ids = Object.keys(K).filter(id => !args.length || args.some(a => id === a || (a.endsWith('*') && id.startsWith(a.slice(0, -1)))))
const file = id => new URL(`../src/sprites/${K[id].sprite ?? id}.svg`, import.meta.url)
const cellsOf = k => k.cells ? k.cells.flatMap((row, y) => [...row].flatMap((c, x) => c === '#' ? [[x, y]] : [])) : Array.from({ length: k.w * k.h }, (_, i) => [i % k.w, Math.floor(i / k.w)])

const problems = [], shapes = []
for (const id of ids) {
  const k = K[id]
  if (!existsSync(file(id))) { problems.push(`${id}: no sprite (src/sprites/${k.sprite ?? id}.svg)`); continue }
  const svg = readFileSync(file(id), 'utf8')
  const vb = /<svg[^>]*viewBox="([^"]+)"/.exec(svg)?.[1]?.trim().split(/[\s,]+/).map(Number)
  if (!vb) { problems.push(`${id}: no <svg viewBox>`); continue }
  if (k.sprite ? false : vb[2] !== k.w * 32 || vb[3] !== k.h * 32) problems.push(`${id}: viewBox ${vb.join(' ')} but the footprint is ${k.w}x${k.h} (0 0 ${k.w * 32} ${k.h * 32})`)
  if (/<script|on[a-z]+=|href="http/i.test(svg)) problems.push(`${id}: scripts, handlers or outside links`)
  shapes.push({ id, svg, w: k.w, h: k.h, cells: cellsOf(k), shared: !!k.sprite })
}

if (!pw && !existsSync('node_modules/playwright-core')) console.log('(no playwright-core: only the files were checked; pass --pw <dir>/node_modules/playwright-core)')
else if (shapes.length) {
  const { chromium } = await import(pathToFileURL(`${pw ?? 'node_modules/playwright-core'}/index.mjs`).href)
  const b = await chromium.launch(chrome ? { executablePath: chrome } : {})
  const p = await b.newPage()
  const errors = []
  p.on('pageerror', e => errors.push(String(e)))
  await p.setContent('<!doctype html><body style="margin:0;background:#1d1a22"></body>')
  // coverage: draw each at 1px a unit on a canvas, read the alpha per square
  const cover = await p.evaluate(async list => {
    const out = {}
    for (const s of list) {
      const c = document.createElement('canvas'); c.width = s.w * 32; c.height = s.h * 32
      const g = c.getContext('2d'), img = new Image()
      const ok = await new Promise(r => { img.onload = () => r(true); img.onerror = () => r(false); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s.svg) })
      if (!ok) { out[s.id] = null; continue }
      g.drawImage(img, 0, 0, c.width, c.height)
      const a = g.getImageData(0, 0, c.width, c.height).data, sq = []
      for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) { let n = 0; for (let j = 0; j < 32; j++) for (let i = 0; i < 32; i++) if (a[((y * 32 + j) * c.width + x * 32 + i) * 4 + 3] > 24) n++; sq.push(n / 1024) }
      out[s.id] = sq
    }
    return out
  }, shapes)
  for (const s of shapes) {
    const sq = cover[s.id]
    if (!sq) { problems.push(`${s.id}: does not draw (not a valid SVG image)`); continue }
    const taken = new Set(s.cells.map(([x, y]) => y * s.w + x))
    const thin = [...taken].filter(i => sq[i] < 0.15), spill = sq.map((v, i) => [v, i]).filter(([v, i]) => !taken.has(i) && v >= 0.02)
    if (thin.length) problems.push(`${s.id}: ${thin.length} of its ${taken.size} squares under 15% drawn (${thin.map(i => `${i % s.w},${Math.floor(i / s.w)}:${Math.round(sq[i] * 100)}%`).join(' ')})`)
    if (spill.length) problems.push(`${s.id}: drawn into ${spill.length} free square(s)`)
  }
  if (sheet) { // every sprite on field squares, its id under it, for looking at
    const cell = 40
    const html = shapes.map(s => `<figure style="margin:6px;display:inline-flex;flex-direction:column;align-items:center;vertical-align:top;font:10px monospace;color:#c9b88f"><div style="width:${s.w * cell}px;height:${s.h * cell}px;background:#2a2533 repeating-linear-gradient(0deg,#3a3444 0 1px,transparent 1px ${cell}px),repeating-linear-gradient(90deg,#3a3444 0 1px,transparent 1px ${cell}px)">${s.svg.replace('<svg ', `<svg width="${s.w * cell}" height="${s.h * cell}" `)}</div><figcaption style="max-width:${Math.max(s.w * cell, 90)}px;overflow-wrap:anywhere">${s.id.replace(/^(it|mach)_/, '')}</figcaption></figure>`).join('')
    await p.setViewportSize({ width: 1400, height: 900 })
    await p.setContent(`<!doctype html><body style="margin:8px;background:#141217">${html}</body>`)
    await p.screenshot({ path: sheet, fullPage: true })
    console.log(`sheet: ${sheet}`)
  }
  if (errors.length) problems.push(...errors)
  await b.close()
}
console.log(problems.length ? problems.join('\n') : `${ids.length} sprites ok`)
process.exit(problems.length ? 1 : 0)
