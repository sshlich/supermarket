import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { defineConfig, type Plugin } from 'vite'
import { starter } from './scripts/sprite.ts'

/** The icon sets the editor can browse (all from the Iconify collection, installed as dev dependencies). */
const SETS = [
  { id: 'game-icons', name: 'game-icons', style: 'solid game art', license: 'CC BY 3.0' },
  { id: 'pixelarticons', name: 'Pixelarticons', style: 'pixel art', license: 'MIT' },
  { id: 'fluent-emoji-high-contrast', name: 'Fluent Emoji (outline)', style: 'objects and emoji', license: 'MIT' },
  { id: 'mdi', name: 'Material Design Icons', style: 'solid, huge variety', license: 'Apache 2.0' },
  { id: 'material-symbols', name: 'Material Symbols', style: 'solid and outline', license: 'Apache 2.0' },
  { id: 'tabler', name: 'Tabler', style: 'thin line', license: 'MIT' },
  { id: 'lucide', name: 'Lucide', style: 'line', license: 'ISC' },
  { id: 'ph', name: 'Phosphor', style: 'line, several weights', license: 'MIT' },
]

/** Dev only: the sprite editor reads and writes sprites, item sizes and imported SVGs through here. */
function sprites(): Plugin {
  const dir = new URL('./src/sprites/', import.meta.url)
  const imports = new URL('./src/imports/', import.meta.url)
  const kindsFile = new URL('./src/kinds.json', import.meta.url)
  type KindData = { name: string; icon: string; color: string; w: number; h: number; cells?: string[]; desc?: string; notes?: string; tags?: string[]; uses?: { on: string; verb: string }[] }
  const readKinds = (): Record<string, KindData> => JSON.parse(readFileSync(kindsFile, 'utf8'))
  const writeKinds = (k: Record<string, KindData>) => writeFileSync(kindsFile, JSON.stringify(k, null, 2) + '\n')
  /** A painted footprint, checked and trimmed to its box: the size it makes, and the cells if it is not a plain rectangle. */
  const footprint = (rows: unknown): { w: number; h: number; cells?: string[] } | string => {
    if (!Array.isArray(rows) || !rows.length || rows.length > 12 || rows.some(r => typeof r !== 'string' || !/^[#.]{1,12}$/.test(r))) return 'cells must be 1 to 12 rows of "#" and "." up to 12 wide'
    const on: [number, number][] = []
    rows.forEach((r: string, y) => [...r].forEach((c, x) => { if (c === '#') on.push([x, y]) }))
    if (!on.length) return 'a footprint needs at least one square'
    const x0 = Math.min(...on.map(c => c[0])), y0 = Math.min(...on.map(c => c[1]))
    const w = Math.max(...on.map(c => c[0])) - x0 + 1, h = Math.max(...on.map(c => c[1])) - y0 + 1
    if (on.length === w * h) return { w, h }
    const cells = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => on.some(c => c[0] - x0 === x && c[1] - y0 === y) ? '#' : '.').join(''))
    return { w, h, cells }
  }
  type IconData = { icons: Record<string, { body: string; width?: number; height?: number }>; aliases?: Record<string, { parent: string }>; width?: number; height?: number }
  const loaded: Record<string, { data: IconData; names: string[] }> = {}
  /** An icon set, read once: its data and every name in it (aliases included), sorted. */
  const iconSet = (id: string) => loaded[id] ??= (() => {
    const data: IconData = createRequire(import.meta.url)(`@iconify-json/${id}/icons.json`)
    return { data, names: [...Object.keys(data.icons), ...Object.keys(data.aliases ?? {})].sort() }
  })()
  return {
    name: 'sprites',
    configureServer(server) {
      server.middlewares.use('/__sprites', (req, res) => {
        const url = new URL(req.url ?? '/', 'http://x')
        const q = (k: string) => url.searchParams.get(k) ?? ''
        const kinds = readKinds()
        const say = (body: string, type = 'text/plain') => { res.setHeader('content-type', type); res.end(body) }
        const fail = (code: number, msg: string) => { res.statusCode = code; res.end(msg) }
        const svg = (body: string) => say(body, 'image/svg+xml')
        const json = (v: unknown) => say(JSON.stringify(v), 'application/json')
        const body = (then: (text: string) => void) => {
          let text = ''
          req.on('data', c => { text += c })
          req.on('end', () => text.length > 2_000_000 ? fail(413, 'too big') : then(text))
        }
        const safe = (n: string) => /^[a-z0-9][a-z0-9_-]{0,60}$/i.test(n) ? n : ''

        // imported SVGs
        if (url.pathname === '/imports') {
          mkdirSync(imports, { recursive: true })
          return json(readdirSync(imports).filter(f => f.endsWith('.svg')).sort().map(f => ({ name: f.slice(0, -4), svg: readFileSync(new URL(f, imports), 'utf8') })))
        }
        if (url.pathname === '/import' || url.pathname === '/import-delete') {
          const name = safe(q('name'))
          if (!name) return fail(400, 'bad name')
          const file = new URL(`${name}.svg`, imports)
          if (url.pathname === '/import-delete') { if (existsSync(file)) unlinkSync(file); return say('deleted') }
          return body(text => {
            if (!text.includes('<svg')) return fail(400, 'not an svg')
            mkdirSync(imports, { recursive: true })
            writeFileSync(file, text)
            say('imported')
          })
        }
        // icon sets: which there are, and a page of one, searched by name
        if (url.pathname === '/sets') return json(SETS.map(s => ({ ...s, total: iconSet(s.id).names.length })))
        if (url.pathname === '/icons') {
          const s = SETS.find(x => x.id === q('set')) ?? SETS[0]
          const { data, names } = iconSet(s.id)
          const term = q('q').toLowerCase().trim().replace(/\s+/g, '-')
          const hits = term ? names.filter(n => n.includes(term)) : names
          const at = Math.max(0, +q('offset') || 0), n = Math.min(300, +q('limit') || 60)
          return json({
            total: hits.length,
            items: hits.slice(at, at + n).map(name => {
              const i = data.icons[name] ?? data.icons[data.aliases?.[name]?.parent ?? '']
              const w = i.width ?? data.width ?? 16, h = i.height ?? data.height ?? 16
              return { name, svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${i.body}</svg>` }
            }),
          })
        }

        // making and removing kinds
        if (url.pathname === '/new') {
          const id = q('kind')
          if (!/^[a-z][a-z0-9-]{0,30}$/.test(id)) return fail(400, 'the id must be lowercase letters, digits and dashes, starting with a letter')
          if (kinds[id]) return fail(409, 'there is already one called that')
          return body(text => {
            let v: { name?: string; w?: number; h?: number; cells?: unknown; color?: string; desc?: string; from?: string }
            try { v = JSON.parse(text) } catch { return fail(400, 'not json') }
            const src = v.from ? kinds[v.from] : undefined
            if (v.from && !src) return fail(404, 'nothing to copy from')
            const name = (v.name ?? '').trim()
            if (!name || name.length > 40) return fail(400, 'name must be 1 to 40 characters')
            const fp = v.cells ? footprint(v.cells) : src ? { w: src.w, h: src.h, cells: src.cells } : { w: Math.max(1, Math.min(12, Math.round(v.w ?? 2))), h: Math.max(1, Math.min(12, Math.round(v.h ?? 2))) }
            if (typeof fp === 'string') return fail(400, fp)
            const color = typeof v.color === 'string' && /^#[0-9a-f]{6}$/i.test(v.color) ? v.color.toLowerCase() : (src?.color ?? '#b4bfcc')
            const made: KindData = { name, icon: '', color, w: fp.w, h: fp.h, ...(fp.cells ? { cells: fp.cells } : {}), ...(typeof v.desc === 'string' && v.desc.trim() ? { desc: v.desc.trim().slice(0, 2000) } : src?.desc ? { desc: src.desc } : {}), ...(src?.tags ? { tags: src.tags } : {}) }
            kinds[id] = made
            writeKinds(kinds)
            mkdirSync(dir, { recursive: true })
            const from = src && v.from ? new URL(`${v.from}.svg`, dir) : null
            writeFileSync(new URL(`${id}.svg`, dir), from && existsSync(from) ? readFileSync(from, 'utf8') : starter(made))
            say('created')
          })
        }
        if (url.pathname === '/delete') {
          const gone = q('kind')
          if (!kinds[gone]) return fail(404, 'no such kind')
          if (Object.keys(kinds).length < 2) return fail(400, 'keep at least one')
          delete kinds[gone]
          writeKinds(kinds)
          const f = new URL(`${gone}.svg`, dir)
          if (existsSync(f)) unlinkSync(f)
          return say('deleted')
        }

        // sprites and item sizes: only known kinds, so no path can be smuggled in
        const kind = q('kind')
        const k = kinds[kind]
        if (!k) return fail(404, 'no such kind')
        const file = new URL(`${kind}.svg`, dir)
        if (req.method === 'GET') return svg(existsSync(file) ? readFileSync(file, 'utf8') : starter(k))
        if (url.pathname === '/reset') return svg(starter(k))
        if (url.pathname === '/kind') {
          return body(text => {
            let v: { w?: number; h?: number; cells?: unknown; name?: string; color?: string; desc?: string; notes?: string; tags?: unknown; uses?: unknown }
            try { v = JSON.parse(text) } catch { return fail(400, 'not json') }
            const ok = (n: unknown) => Number.isInteger(n) && (n as number) >= 1 && (n as number) <= 12
            const next: KindData = { ...k }
            if (v.cells !== undefined) {
              const fp = footprint(v.cells)
              if (typeof fp === 'string') return fail(400, fp)
              next.w = fp.w; next.h = fp.h
              if (fp.cells) next.cells = fp.cells; else delete next.cells
            } else if (v.w !== undefined || v.h !== undefined) {
              if (!ok(v.w) || !ok(v.h)) return fail(400, 'w and h must be whole numbers from 1 to 12')
              next.w = v.w!; next.h = v.h!
              delete next.cells
            }
            if (v.name !== undefined) {
              if (typeof v.name !== 'string' || !v.name.trim() || v.name.length > 40) return fail(400, 'name must be 1 to 40 characters')
              next.name = v.name.trim()
            }
            if (v.color !== undefined) {
              if (typeof v.color !== 'string' || !/^#[0-9a-f]{6}$/i.test(v.color)) return fail(400, 'colour must look like #c9975a')
              next.color = v.color.toLowerCase()
            }
            for (const f of ['desc', 'notes'] as const) {
              if (v[f] === undefined) continue
              if (typeof v[f] !== 'string' || (v[f] as string).length > 2000) return fail(400, `${f} must be text up to 2000 characters`)
              if (v[f]) next[f] = v[f] as string; else delete next[f]
            }
            if (v.tags !== undefined) {
              if (!Array.isArray(v.tags) || v.tags.length > 20 || v.tags.some(t => typeof t !== 'string' || !t.trim() || t.length > 30)) return fail(400, 'tags must be up to 20 short words')
              if (v.tags.length) next.tags = (v.tags as string[]).map(t => t.trim()); else delete next.tags
            }
            if (v.uses !== undefined) {
              const u = v.uses as { on?: unknown; verb?: unknown }[]
              if (!Array.isArray(u) || u.length > 20 || u.some(x => !x || typeof x.on !== 'string' || typeof x.verb !== 'string' || !/^[a-z0-9-]{1,30}$/i.test(x.on) || !x.verb.trim() || x.verb.length > 30)) return fail(400, 'uses must be up to 20 of { on: a kind id or tag, verb: a short word }')
              if (u.length) next.uses = u.map(x => ({ on: x.on as string, verb: (x.verb as string).trim() })); else delete next.uses
            }
            kinds[kind] = next
            writeKinds(kinds)
            say('saved')
          })
        }
        body(text => {
          if (!text.includes('<svg')) return fail(400, 'not an svg')
          mkdirSync(dir, { recursive: true })
          writeFileSync(file, text)
          say('saved')
        })
      })
    },
  }
}

export default defineConfig({ plugins: [sprites()] })
