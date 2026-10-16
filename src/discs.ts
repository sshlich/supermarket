// Discs: floppies with a few files on them, read on a computer. Each disc is a Markdown file in src/discs/ (copy
// _template.md): its label, the colour of its plastic, a line for the tooltip and maybe a price at the top, then its files, each starting
// with `# NAME.TXT`; a file named like a program (`# PAINT.EXE`, see programs.ts) is that program, and a `.PIC` is a picture. Files starting with _ are left out. Like books, every disc becomes a value of the disc kind's `content`
// property, so a floppy on the field is one particular disc. Imported for that effect before anything is loaded.

import { KINDS, type Effect } from './world.ts'

/** A file on a disc: a text, or a picture (`pic`: its pixels, one hex digit each, as Paint keeps them). */
export interface DiscFile { name: string; text: string; pic?: string }
/** A picture on a disc is written packed, two pixels a byte, in base64 (scripts/pics.py makes them): back to one digit a pixel. */
const unpack = (b64: string) => [...atob(b64.replace(/\s+/g, ''))].map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
export interface Disc { id: string; label: string; colour: string; blurb: string; price?: number; files: DiscFile[] }

export function parseDisc(id: string, text: string): Disc {
  const m = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  const meta: Record<string, string> = {}
  for (const line of (m?.[1] ?? '').split('\n')) { const i = line.indexOf(':'); if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim() }
  const files = (m ? m[2] : text).split(/^# /m).map(f => f.trim()).filter(Boolean).map((f): DiscFile => {
    const nl = f.indexOf('\n'), name = (nl < 0 ? f : f.slice(0, nl)).trim().toUpperCase(), body = nl < 0 ? '' : f.slice(nl + 1).trim()
    return name.endsWith('.PIC') ? { name, text: '', pic: unpack(body) } : { name, text: body }
  })
  return { id, label: meta.label || id.toUpperCase(), colour: /^#[0-9a-f]{6}$/i.test(meta.colour ?? '') ? meta.colour : '#3a3d44', blurb: meta.blurb || '', ...(Number(meta.price) > 0 ? { price: Math.round(Number(meta.price)) } : {}), files }
}

const sources = import.meta.glob<string>('./discs/*.md', { query: '?raw', import: 'default', eager: true })
export const DISCS: Record<string, Disc> = Object.fromEntries(Object.entries(sources)
  .map(([path, text]) => [path.slice('./discs/'.length, -'.md'.length), text] as const)
  .filter(([id]) => !id.startsWith('_'))
  .map(([id, text]) => parseDisc(id, text))
  .sort((a, b) => a.label.localeCompare(b.label))
  .map(d => [d.id, d]))

const kind = KINDS.disc
if (kind && Object.keys(DISCS).length) kind.props = { content: Object.fromEntries(Object.values(DISCS).map(d => [d.id, { name: `Disc "${d.label}"`, desc: d.blurb, colors: { '#3a3d44': d.colour }, ...(d.price ? { price: d.price } : {}) } satisfies Effect])) }
