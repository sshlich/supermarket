// Books: things you can open and read. Each book is a Markdown file in src/books/ (copy _template.md): a title, an author,
// a cover colour and a line for the tooltip at the top, then the text. Files starting with _ are left out. Every book
// becomes a value of the book kind's `title` property, so a book on the field is one particular book: its name, its blurb
// and its cover colour (swapped into the sprite) come from its file. Imported for that effect before anything is loaded.

import { KINDS, type Effect } from './world.ts'

/** A chapter heading, or a paragraph (which may hold *italics*). */
export type Block = { h: string } | { p: string }
export interface Book { id: string; title: string; author: string; cover: string; blurb: string; blocks: Block[] }

/** A book file: `---` lines around `key: value` lines, then blank lines between paragraphs and `# ` before a chapter's name. */
export function parse(id: string, text: string): Book {
  const m = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  const meta: Record<string, string> = {}
  for (const line of (m?.[1] ?? '').split('\n')) { const i = line.indexOf(':'); if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim() }
  const body = m ? m[2] : text
  const blocks: Block[] = body.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean).map(b => b.startsWith('# ') ? { h: b.slice(2).trim() } : { p: b.replace(/\s*\n\s*/g, ' ') })
  return { id, title: meta.title || id, author: meta.author || '', cover: /^#[0-9a-f]{6}$/i.test(meta.cover ?? '') ? meta.cover : '#5e3a2c', blurb: meta.blurb || '', blocks }
}

const files = import.meta.glob<string>('./books/*.md', { query: '?raw', import: 'default', eager: true })
export const BOOKS: Record<string, Book> = Object.fromEntries(Object.entries(files)
  .map(([path, text]) => path.slice('./books/'.length, -'.md'.length) === '_template' ? null : parse(path.slice('./books/'.length, -'.md'.length), text))
  .filter((b): b is Book => !!b && !b.id.startsWith('_'))
  .sort((a, b) => a.title.localeCompare(b.title))
  .map(b => [b.id, b]))

/** Mix a colour towards white (k > 0) or black (k < 0). */
function shade(hex: string, k: number) {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)).map(v => Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('')
}
/** A cover colour as the book sprite's leather: its light, middle and dark, the spine, and the worn corners. */
const coverColors = (cover: string): Record<string, string> => ({ '#76493a': shade(cover, 0.14), '#5e3a2c': cover, '#462a20': shade(cover, -0.25), '#3f261d': shade(cover, -0.33), '#8c6450': shade(cover, 0.3), '#a87866': shade(cover, 0.42) })

const kind = KINDS.book
if (kind && Object.keys(BOOKS).length) kind.props = { title: Object.fromEntries(Object.values(BOOKS).map(b => [b.id, { name: b.title, desc: `${b.author ? `By ${b.author}. ` : ''}${b.blurb}`, colors: coverColors(b.cover) } satisfies Effect])) }
