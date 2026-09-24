import './art-view.css'
import { iconName, MAX_ICONS, type Art, type IconSpec, type Layout } from './art.ts'
import { KEYWORDS, type Keyword } from './keywords.ts'

const files = import.meta.glob<string>('./icons/*.svg', { query: '?raw', import: 'default', eager: true })
const ICONS: Record<string, string> = Object.fromEntries(Object.entries(files).map(([path, svg]) => [path.slice('./icons/'.length, -'.svg'.length), svg]))

/** The art area's proportions: small cards are tall, medium cards and skills square, large cards wide. */
export type Shape = 'tall' | 'square' | 'wide'
/** Long side over short side for each shape (the art inside the card frame). */
const LONG: Record<Shape, number> = { tall: 2.2, square: 1, wide: 1.55 }

interface Spot { x: number; y: number; scale: number; rotate?: number }

/** Where the layout puts icon i of n. See `Layout` in art.ts for what each one is for. */
function spots(layout: Layout, n: number, shape: Shape): Spot[] {
  // Small cards are narrow but tall: icons can use more of the width without running out of room.
  const grow = (list: Spot[]) => (shape === 'tall' ? list.map(s => ({ ...s, scale: Math.min(0.92, s.scale * 1.2) })) : list)
  if (n <= 1) return grow([{ x: 50, y: 50, scale: 0.8 }])
  if (layout === 'row') {
    const scale = Math.min(0.8, (0.9 * LONG[shape]) / n)
    const along = (i: number) => ((i + 0.5) / n) * 100
    return Array.from({ length: n }, (_, i) => (shape === 'tall' ? { x: 50, y: along(i), scale } : { x: along(i), y: 50, scale }))
  }
  if (layout === 'fan') {
    return grow(n === 2
      ? [{ x: 42, y: 52, scale: 0.66, rotate: -14 }, { x: 58, y: 48, scale: 0.66, rotate: 14 }]
      : [{ x: 34, y: 55, scale: 0.58, rotate: -22 }, { x: 50, y: 46, scale: 0.6 }, { x: 66, y: 55, scale: 0.58, rotate: 22 }])
  }
  return grow(n === 2
    ? [{ x: 46, y: 45, scale: 0.72 }, { x: 72, y: 72, scale: 0.46 }]
    : [{ x: 50, y: 47, scale: 0.68 }, { x: 74, y: 74, scale: 0.42 }, { x: 26, y: 24, scale: 0.42 }])
}

const DEFAULT_COLOR = '#f2e6cc'
function color(c: string | undefined) {
  if (!c) return DEFAULT_COLOR
  if (c === 'tier') return 'var(--tier)'
  return KEYWORDS[c as Keyword]?.color ?? c
}

/** The icons for `art`, laid out for `shape`. Unknown icons show their name, so a typo is obvious. */
export function artIcons(art: Art, shape: Shape): string {
  const icons = art.icons.slice(0, MAX_ICONS)
  const at = spots(art.layout ?? 'stack', icons.length, shape)
  return icons
    .map((spec: IconSpec, i) => {
      const o = typeof spec === 'string' ? { icon: spec } : spec
      const s = { ...at[i], ...o }
      const svg = ICONS[iconName(spec)]
      const style = `--x:${s.x}%;--y:${s.y}%;--s:${s.scale};--r:${s.rotate ?? 0}deg;--f:${o.flip ? -1 : 1};color:${color(o.color)}`
      return svg ? `<div class="icon" style="${style}">${svg}</div>` : `<div class="icon missing" style="${style}">${iconName(spec)}</div>`
    })
    .join('')
}
