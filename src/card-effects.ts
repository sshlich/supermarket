import './card-effects.css'

/** Where the cursor is over the card, -1..1 from the center (right and down are +), and how hovered it is (0..1). */
export interface Look { nx: number; ny: number; hover: number }
export interface Effect { el: HTMLElement; update: (look: Look) => void }

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

/** Glass pane over the art: faint film plus a bevelled rim that shows more on the side tilting toward you. */
export function glass(parent: HTMLElement): Effect {
  const el = document.createElement('div')
  el.className = 'glass'
  parent.append(el)
  return {
    el,
    update({ nx, ny }) {
      el.style.setProperty('--glass-x', `${nx}`)
      el.style.setProperty('--glass-y', `${ny}`)
    },
  }
}

/**
 * Textured diagonal sheen. Like the live game, it only reacts while the cursor is in the card's top-right
 * quadrant: moving from the center toward that corner sweeps the band across, against the cursor.
 */
export function sheen(parent: HTMLElement): Effect {
  const el = document.createElement('div')
  el.className = 'sheen'
  parent.append(el)
  return {
    el,
    update({ nx, ny, hover }) {
      const progress = (clamp01(nx) + clamp01(-ny)) / 2
      el.style.setProperty('--sheen-p', `${100 - progress * 100}%`)
      el.style.setProperty('--sheen-o', `${hover * clamp01(progress * 3)}`)
    },
  }
}
