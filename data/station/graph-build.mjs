// node graph-build.mjs  ->  graph.html (the viewer with the data embedded)
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
const data = execFileSync('node', [new URL('graph.mjs', import.meta.url).pathname], { maxBuffer: 1 << 28 }).toString().trim()
writeFileSync(new URL('graph.html', import.meta.url), readFileSync(new URL('graph.tpl.html', import.meta.url), 'utf8').replace('/*DATA*/null', () => data))
