import './style.css'
import './gallery.css'
import { glass } from './card-effects.ts'
import { cardFace, cardVars, hideTooltip, itemInfo, mountTooltip, showInfo, skillFace, skillInfo, type Info } from './card-view.ts'
import { ENCHANT_KEYS, ENCHANTS, type Enchant } from './enchant.ts'
import { canEnchant, ITEM_KEYS, itemAt, ITEMS } from './items.ts'
import { SKILL_KEYS, skillAt, SKILLS } from './skills.ts'
import { reachable, TIER_ORDER, tierName, type Tier } from './tiers.ts'

// Dev page (npm run dev, then /gallery.html): every item and skill at a chosen tier and enchantment,
// with the in-game tooltip on hover. Edit items.ts / skills.ts and it reloads.

const U = 72 // px per slot
const scene = document.getElementById('scene')!
scene.style.setProperty('--u', `${U}px`)
mountTooltip(scene)

let tier: Tier | 'start' = 'start'
let enchant: Enchant | '' = ''

const controls = document.createElement('div')
controls.className = 'controls'
controls.innerHTML = `
  <label>Tier <select name="tier"><option value="start">Starting</option>${TIER_ORDER.map(t => `<option value="${t}">${tierName(t)}</option>`).join('')}</select></label>
  <label>Enchantment <select name="enchant"><option value="">None</option>${ENCHANT_KEYS.map(e => `<option value="${e}">${ENCHANTS[e].name}</option>`).join('')}</select></label>`
controls.addEventListener('change', e => {
  const el = e.target as HTMLSelectElement
  if (el.name === 'tier') tier = el.value as Tier | 'start'
  else enchant = el.value as Enchant | ''
  render()
})
const grid = document.createElement('div')
const page = document.createElement('div')
page.className = 'page'
page.append(controls, grid)
scene.append(page)

/** The chosen tier if this card can be it, else the nearest it can reach. */
function tierFor(start: Tier): Tier {
  const can = reachable(start)
  if (tier === 'start') return start
  return can.includes(tier) ? tier : TIER_ORDER.indexOf(tier) < TIER_ORDER.indexOf(can[0]) ? can[0] : can[can.length - 1]
}

function hover(el: HTMLElement, info: () => Info) {
  el.addEventListener('mouseenter', () => {
    const r = el.getBoundingClientRect()
    const s = scene.getBoundingClientRect()
    showInfo(info(), { x: (r.left + r.width / 2 - s.left) / U, y: (r.top + r.height / 2 - s.top) / U, w: r.width / U, h: r.height / U }, U, s.width / U)
  })
  el.addEventListener('mouseleave', hideTooltip)
}

function render() {
  hideTooltip()
  grid.innerHTML = '<h2>Items</h2><div class="items"></div><h2>Skills</h2><div class="skills"></div>'
  for (const key of ITEM_KEYS) {
    const e = enchant && canEnchant(key, enchant) ? enchant : undefined
    const def = itemAt(key, tierFor(ITEMS[key].tier), e)
    const cell = document.createElement('div')
    cell.className = 'cell'
    const card = document.createElement('div')
    card.className = 'card'
    card.style.cssText = cardVars(def)
    card.innerHTML = cardFace(def)
    card.querySelector('.art')!.after(glass(card).el)
    card.querySelector('.price')!.remove()
    hover(card, () => itemInfo(def))
    cell.append(card)
    cell.insertAdjacentHTML('beforeend', `<small>${key}${enchant && !e ? ` <em>no ${ENCHANTS[enchant].name}</em>` : ''}</small>`)
    grid.querySelector('.items')!.append(cell)
  }
  for (const key of SKILL_KEYS) {
    const def = skillAt(key, tierFor(SKILLS[key].tier))
    const cell = document.createElement('div')
    cell.className = 'cell'
    const badge = document.createElement('div')
    badge.className = 'badge'
    badge.innerHTML = skillFace(def)
    hover(badge, () => skillInfo(def))
    cell.append(badge)
    cell.insertAdjacentHTML('beforeend', `<small>${key}</small>`)
    grid.querySelector('.skills')!.append(cell)
  }
}
render()
