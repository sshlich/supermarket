// Card art: a background gradient and up to three icons from src/icons (game-icons.net, CC BY 3.0).
// `npm run icons` copies any icon the content names into src/icons; see scripts/icons.ts.

/**
 * One icon. A bare name uses the layout's spot for it; the object form overrides any part:
 * x/y are % of the art (0..100, center of the icon), scale is the icon's size as a fraction of the
 * art's shorter side, rotate is degrees, flip mirrors it. `color` is a CSS color, a keyword name
 * ('burn', 'heal'...) for that keyword's color, or 'tier' for the card's tier color.
 */
export type IconSpec = string | { icon: string; color?: string; x?: number; y?: number; scale?: number; rotate?: number; flip?: boolean }

/**
 * How several icons share the card. Later icons draw on top of earlier ones.
 * - stack (default): the first icon is the subject, big and centered; the second sits over its
 *   lower-right corner, the third over its upper-left. Reads as "this, with that" (a flask with a flame).
 * - row: side by side along the card's long side (top to bottom on small cards). Reads as "these together".
 * - fan: overlapping and splayed like a hand of cards. Reads as "a bunch of these".
 */
export type Layout = 'stack' | 'row' | 'fan'

export interface Art { bg: [string, string]; icons: IconSpec[]; layout?: Layout }

export const MAX_ICONS = 3

export const iconName = (i: IconSpec) => (typeof i === 'string' ? i : i.icon)
