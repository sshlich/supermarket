import './choice.css'
import { glass } from './card-effects.ts'
import { cardFace, cardVars, hideTooltip, showInfo, type Info } from './card-view.ts'
import type { ItemDef } from './items.ts'

/** One pickable option. Shown as an encounter card with a badge, or as the item card itself. */
export interface Option {
  info: Info // tooltip content
  badge?: string // 'Merchant', 'Event', 'Monster'...
  color?: [string, string]
  item?: ItemDef
}

/**
 * The standard "pick one" screen: options laid out across `area` (scene units: left, top, width, height).
 * Hover shows the tooltip, click picks. `el` is exposed so the page can hide it (e.g. under the open stash).
 */
export function choose(scene: HTMLElement, area: { x: number; y: number; w: number; h: number }, options: Option[], u: () => number, sceneW: number) {
  const el = document.createElement('div')
  el.className = 'choices'
  el.style.cssText = `left:calc(var(--u)*${area.x});top:calc(var(--u)*${area.y});width:calc(var(--u)*${area.w});height:calc(var(--u)*${area.h})`
  scene.append(el)

  const picked = new Promise<number>(resolve => {
    options.forEach((o, i) => {
      const card = document.createElement('div')
      if (o.item) {
        card.className = 'choice card'
        card.style.cssText = cardVars(o.item)
        card.innerHTML = cardFace(o.item)
        card.querySelector('.art')!.after(glass(card).el)
        card.querySelector('.price')!.remove()
      } else {
        card.className = 'choice encounter'
        if (o.color) card.style.cssText = `--c1:${o.color[0]};--c2:${o.color[1]}`
        card.innerHTML = `<div class="face"><span>${o.info.title}</span></div>${o.badge ? `<div class="badge">${o.badge}</div>` : ''}`
      }
      card.animate([{ opacity: 0, translate: '0 calc(var(--u) * 0.3)' }, { opacity: 1, translate: '0 0' }], { duration: 260, delay: i * 70, fill: 'backwards', easing: 'ease-out' })
      card.addEventListener('mouseenter', () => {
        const r = card.getBoundingClientRect()
        const s = scene.getBoundingClientRect()
        const k = u()
        showInfo(o.info, { x: (r.left + r.width / 2 - s.left) / k, y: (r.top + r.height / 2 - s.top) / k, w: r.width / k, h: r.height / k }, k, sceneW)
      })
      card.addEventListener('mouseleave', hideTooltip)
      card.addEventListener('click', () => {
        hideTooltip()
        el.style.pointerEvents = 'none'
        card.animate([{ scale: '1.06' }, { scale: '1.15', opacity: 0 }], { duration: 220, easing: 'ease-in', fill: 'forwards' })
        el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, delay: 80, fill: 'forwards' }).finished.then(() => el.remove())
        resolve(i)
      })
      el.append(card)
    })
  })
  return { el, picked }
}
