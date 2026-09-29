import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import { KINDS } from './src/world.ts'
import { fromIcon } from './scripts/sprite.ts'

/** Dev only: the sprite editor reads and writes src/sprites/<kind>.svg through here. */
function sprites(): Plugin {
  const dir = new URL('./src/sprites/', import.meta.url)
  return {
    name: 'sprites',
    configureServer(server) {
      server.middlewares.use('/__sprites', (req, res) => {
        const url = new URL(req.url ?? '/', 'http://x')
        const kind = url.searchParams.get('kind') ?? ''
        const k = KINDS[kind] // only known kinds, so no path can be smuggled in
        if (!k) { res.statusCode = 404; return res.end('no such kind') }
        const file = new URL(`${kind}.svg`, dir)
        const send = (body: string) => { res.setHeader('content-type', 'image/svg+xml'); res.end(body) }
        if (req.method === 'GET') return send(existsSync(file) ? readFileSync(file, 'utf8') : fromIcon(k.icon, k.w, k.h))
        if (url.pathname === '/reset') return send(fromIcon(k.icon, k.w, k.h))
        let body = ''
        req.on('data', c => { body += c })
        req.on('end', () => {
          if (body.length > 2_000_000 || !body.includes('<svg')) { res.statusCode = 400; return res.end('not an svg') }
          mkdirSync(dir, { recursive: true })
          writeFileSync(file, body)
          res.end('saved')
        })
      })
    },
  }
}

export default defineConfig({ plugins: [sprites()] })
