import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { defineConfig, type Plugin } from 'vite'
import { fromIcon } from './scripts/sprite.ts'

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
  const readKinds = (): Record<string, { name: string; icon: string; color: string; w: number; h: number }> => JSON.parse(readFileSync(kindsFile, 'utf8'))
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

        // sprites and item sizes: only known kinds, so no path can be smuggled in
        const kind = q('kind')
        const k = kinds[kind]
        if (!k) return fail(404, 'no such kind')
        const file = new URL(`${kind}.svg`, dir)
        if (req.method === 'GET') return svg(existsSync(file) ? readFileSync(file, 'utf8') : fromIcon(k.icon, k.w, k.h))
        if (url.pathname === '/reset') return svg(fromIcon(k.icon, k.w, k.h))
        if (url.pathname === '/kind') {
          return body(text => {
            let v: { w?: number; h?: number }
            try { v = JSON.parse(text) } catch { return fail(400, 'not json') }
            const ok = (n: unknown) => Number.isInteger(n) && (n as number) >= 1 && (n as number) <= 12
            if (!ok(v.w) || !ok(v.h)) return fail(400, 'w and h must be whole numbers from 1 to 12')
            kinds[kind] = { ...k, w: v.w!, h: v.h! }
            writeFileSync(kindsFile, JSON.stringify(kinds, null, 2) + '\n')
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
