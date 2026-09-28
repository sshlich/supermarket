// The reality layer, prepared at boot (DESIGN 13.3): every item, relic and desktop icon as dithered pixels.

import { lift, prepare } from '../art/icons.ts'
import { K } from '../model/containers.ts'
import { UI } from './icons.ts'
import { svg } from './ui.ts'

/** Icons are rasterised at 12 pixels a cell of their shorter side, and shown twice that. */
export const iconSize = (w: number, h: number) => Math.min(w, h) === 1 ? 12 : 24
export const DESK = 16
export const UNKNOWN = ['#b0a0d0', '#6a5a8a']

export function prepareLook() {
  const jobs: { name: string; size: number; ink: string; ink2?: string }[] = Object.values(K).flatMap(k => {
    const size = iconSize(k.w, k.h)
    return k.relic
      ? [{ name: k.icon, size, ink: k.color, ink2: lift(k.color) }, { name: k.icon, size, ink: lift(k.color), ink2: k.color }]
      : [{ name: k.icon, size, ink: k.color }]
  })
  for (const size of [12, 24]) jobs.push({ name: 'cube', size, ink: UNKNOWN[0], ink2: UNKNOWN[1] }, { name: 'cube', size, ink: UNKNOWN[1], ink2: UNKNOWN[0] })
  jobs.push(...Object.values(UI).map(name => ({ name, size: DESK, ink: '#efe9cf' })))
  return prepare(jobs.map(j => ({ ...j, svg: svg(j.name) })))
}
