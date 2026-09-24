import './card-view.css'
import { artIcons, type Shape } from './art-view.ts'
import { ENCHANTS } from './enchant.ts'
import type { ItemDef } from './items.ts'
import { KEYWORDS, type Keyword } from './keywords.ts'
import type { SkillDef } from './skills.ts'
import { numbers, reachable, STAT_ORDER, TIER_COLOR, tierName, type Tier } from './tiers.ts'

const SIZE_NAME = { 1: 'Small', 2: 'Medium', 3: 'Large' }
const SHAPE: Record<1 | 2 | 3, Shape> = { 1: 'tall', 2: 'square', 3: 'wide' }

/** Style vars a card element needs for its face. */
export const cardVars = (def: ItemDef) =>
  `--size:${def.size};--tier:${TIER_COLOR[def.tier]};--c1:${def.art.bg[0]};--c2:${def.art.bg[1]}` + (def.enchant ? `;--ench:${ENCHANTS[def.enchant].color}` : '')

/** Card face, bottom to top: art, (glass goes here), enchant glow, frame, gems, multicast tag, price tag, ammo pips. */
export function cardFace(def: ItemDef): string {
  const gems = STAT_ORDER.filter(s => def.stats[s] !== undefined)
    .map(s => `<div class="gem" style="--kw:${KEYWORDS[s].color}">${fmt(def.stats[s]!)}</div>`)
    .join('')
  return [
    `<div class="art">${def.art.icons.length ? artIcons(def.art, SHAPE[def.size]) : `<span>${def.name}</span>`}</div>`,
    def.enchant && `<div class="ench"></div>`,
    `<div class="frame"></div>`,
    gems && `<div class="gems">${gems}</div>`,
    def.multicast && def.multicast > 1 && `<div class="multicast">x${def.multicast}</div>`,
    `<div class="price"></div>`, // text set by the page: buy price in a shop, sell value otherwise
    def.ammo && `<div class="ammo">${'<i></i>'.repeat(def.ammo)}</div>`,
  ]
    .filter(Boolean)
    .join('')
}

/** A skill's round badge: tier ring around its art. */
export function skillFace(def: SkillDef): string {
  return `<div class="skill-face" style="--tier:${TIER_COLOR[def.tier]};--c1:${def.art.bg[0]};--c2:${def.art.bg[1]}"><div class="art">${artIcons(def.art, 'square')}</div></div>`
}

const fmt = (n: number) => String(Math.round(n * 100) / 100)

/**
 * A named number for the tooltip. If it changes with tier, the whole path shows, each value in its tier's
 * color and the current one lit: 5 » 10 » 20 » 40.
 */
function num(name: string, info: Info): string {
  const path = info.paths?.[name]
  if (path && info.tiers) return `<span class="path">${path.map((v, i) => `<b class="${i === info.now ? 'now' : ''}" style="--t:${TIER_COLOR[info.tiers![i]]}">${fmt(v)}</b>`).join('<i>»</i>')}</span>`
  const v = info.values?.[name]
  return v === undefined ? '?' : fmt(v)
}

/** `[burn]` icon + burn, `[burn 2]` icon + 2, `[burn gain]` icon + the value named gain, `{count}` a plain value, `<Burn>` colored keyword. */
function rich(line: string, used: Set<Keyword>, info: Info) {
  return line.replace(/\[(\w+)(?: ([\w.]+))?\]|<(\w+)>|\{(\w+)\}/g, (match, kw: string | undefined, arg: string | undefined, word: string | undefined, plain: string | undefined) => {
    if (plain) return num(plain, info)
    const key = (kw ?? word!).toLowerCase() as Keyword
    const k = KEYWORDS[key]
    if (!k) return match
    used.add(key)
    const value = arg === undefined ? num(key, info) : /^[\d.]+$/.test(arg) ? arg : num(arg, info)
    return `<span class="kw" style="--kw:${k.color}">${kw ? k.icon + value : word}</span>`
  })
}

const tip = document.createElement('div')
tip.className = 'tooltip'
const legend = document.createElement('div')
legend.className = 'legend'

export function mountTooltip(scene: HTMLElement) {
  scene.append(tip, legend)
}

/** Anything shown in the standard tooltip frame: items, skills, encounters, choices. */
export interface Info {
  title: string
  tier?: Tier // a colored tier pill before the tags
  tags?: string[]
  text: string[]
  cooldown?: number
  values?: Record<string, number> // what [name] and {name} read
  paths?: Record<string, number[]> // names whose value changes with tier
  tiers?: Tier[] // the tier of each path entry
  now?: number // which path entry is current
  extra?: { title: string; color: string; text: string[] } // e.g. what an enchantment added
}

const pathInfo = (def: ItemDef | SkillDef) => {
  const tiers = reachable(def.start)
  return { values: numbers(def), paths: def.paths, tiers, now: tiers.indexOf(def.tier) }
}

export const itemInfo = (def: ItemDef): Info => ({
  title: def.enchant ? `${ENCHANTS[def.enchant].name} ${def.name}` : def.name,
  tier: def.tier,
  tags: [SIZE_NAME[def.size], ...def.tags],
  text: def.text,
  cooldown: def.cooldown,
  ...pathInfo(def),
  extra: def.enchant && { title: ENCHANTS[def.enchant].name, color: ENCHANTS[def.enchant].color, text: def.enchantText ?? [] },
})

export const skillInfo = (def: SkillDef): Info => ({ title: def.name, tier: def.tier, tags: ['Skill', ...def.tags], text: def.text, ...pathInfo(def) })

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
  const lines = info.text.map(l => `<li>${rich(l, used, info)}</li>`).join('')
  const extra = info.extra
    ? `<div class="extra" style="--ench:${info.extra.color}"><h5>${info.extra.title}</h5><ul>${info.extra.text.map(l => `<li>${rich(l, used, info)}</li>`).join('')}</ul></div>`
    : ''
  const cooldown = info.cooldown ? `<div class="cooldown"><b>${info.cooldown.toFixed(1)}</b><small>SEC</small></div>` : ''
  const pills = [
    info.tier && `<span class="tier" style="--t:${TIER_COLOR[info.tier]}">${tierName(info.tier)}</span>`,
    ...(info.tags ?? []).map(t => `<span>${t}</span>`),
    info.paths?.cooldown && `<span class="cd">Cooldown ${num('cooldown', info)}</span>`, // a cooldown that changes with tier
  ].filter(Boolean)
  const tags = pills.length ? `<div class="tags">${pills.join('')}</div>` : ''
  tip.innerHTML = tags + `<div class="title">${info.title}</div>` + `<div class="body${cooldown ? '' : ' plain'}">${cooldown}<ul>${lines}</ul>${extra}</div>`
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
