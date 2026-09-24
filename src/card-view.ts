import './card-view.css'
import { artIcons, type Shape } from './art-view.ts'
import { KEYWORDS, STAT_ORDER, TIER_COLOR, type ItemDef, type Keyword } from './items.ts'

const SIZE_NAME = { 1: 'Small', 2: 'Medium', 3: 'Large' }
const SHAPE: Record<1 | 2 | 3, Shape> = { 1: 'tall', 2: 'square', 3: 'wide' }

/** Style vars a card element needs for its face. */
export const cardVars = (def: ItemDef) => `--size:${def.size};--tier:${TIER_COLOR[def.tier]};--c1:${def.art.bg[0]};--c2:${def.art.bg[1]}`

/** Card face, bottom to top: art, (glass goes here), frame, gems, multicast tag, price tag, ammo pips. */
export function cardFace(def: ItemDef): string {
  const gems = STAT_ORDER.filter(s => def.stats[s] !== undefined)
    .map(s => `<div class="gem" style="--kw:${KEYWORDS[s].color}">${def.stats[s]}</div>`)
    .join('')
  return [
    `<div class="art">${def.art.icons.length ? artIcons(def.art, SHAPE[def.size]) : `<span>${def.name}</span>`}</div>`,
    `<div class="frame"></div>`,
    gems && `<div class="gems">${gems}</div>`,
    def.multicast && `<div class="multicast">x${def.multicast}</div>`,
    `<div class="price"></div>`, // text set by the page: buy price in a shop, sell value otherwise
    def.ammo && `<div class="ammo">${'<i></i>'.repeat(def.ammo)}</div>`,
  ]
    .filter(Boolean)
    .join('')
}

/** `[burn]` -> icon + values.burn, `[burn 2]` -> icon + 2, `<Burn>` -> colored keyword. */
function rich(line: string, used: Set<Keyword>, values: Record<string, number> = {}) {
  return line.replace(/\[(\w+)(?: ([\d.]+))?\]|<(\w+)>/g, (match, kw: string | undefined, value: string | undefined, word: string | undefined) => {
    const key = (kw ?? word!).toLowerCase() as Keyword
    const k = KEYWORDS[key]
    if (!k) return match
    used.add(key)
    return `<span class="kw" style="--kw:${k.color}">${kw ? k.icon + (value ?? values[key] ?? '?') : word}</span>`
  })
}

const tip = document.createElement('div')
tip.className = 'tooltip'
const legend = document.createElement('div')
legend.className = 'legend'

export function mountTooltip(scene: HTMLElement) {
  scene.append(tip, legend)
}

/** Anything shown in the standard tooltip frame: items, encounters, choices. */
export interface Info { title: string; tags?: string[]; text: string[]; cooldown?: number; values?: Record<string, number> }

export const itemInfo = (def: ItemDef): Info => ({ title: def.name, tags: [SIZE_NAME[def.size], ...def.tags], text: def.text, cooldown: def.cooldown, values: def.stats })

export function showTooltip(def: ItemDef, card: Box, u: number, sceneW: number) {
  showInfo(itemInfo(def), card, u, sceneW)
}

/** Scene units: center x/y, width, height. */
export interface Box { x: number; y: number; w: number; h: number }

/**
 * Show the tooltip above `card`, or below it if there's no room above. Keywords used in the text are
 * explained in the legend.
 */
export function showInfo(info: Info, card: Box, u: number, sceneW: number) {
  const used = new Set<Keyword>()
  const lines = info.text.map(l => `<li>${rich(l, used, info.values)}</li>`).join('')
  const cooldown = info.cooldown ? `<div class="cooldown"><b>${info.cooldown.toFixed(1)}</b><small>SEC</small></div>` : ''
  const tags = info.tags?.length ? `<div class="tags">${info.tags.map(t => `<span>${t}</span>`).join('')}</div>` : ''
  tip.innerHTML = tags + `<div class="title">${info.title}</div>` + `<div class="body${cooldown ? '' : ' plain'}">${cooldown}<ul>${lines}</ul></div>`
  const explained = [...used].filter(k => KEYWORDS[k].desc)
  legend.innerHTML = explained
    .map(k => `<div><h4 style="--kw:${KEYWORDS[k].color}">${KEYWORDS[k].icon}${KEYWORDS[k].name}</h4><p>${KEYWORDS[k].desc}</p></div>`)
    .join('')

  const tw = tip.offsetWidth / u
  const th = tip.offsetHeight / u
  const gemRoom = 0.2
  let top = card.y - card.h / 2 - gemRoom - th
  if (top < 0.05) top = card.y + card.h / 2 + 0.1
  const left = Math.max(0.5, Math.min(sceneW - tw - 0.05, card.x - card.w / 2 - 0.13))
  tip.style.left = `${left * u}px`
  tip.style.top = `${top * u}px`
  tip.classList.add('show')
  legend.classList.toggle('show', explained.length > 0)
}

export function hideTooltip() {
  tip.classList.remove('show')
  legend.classList.remove('show')
}
