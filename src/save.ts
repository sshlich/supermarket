import type { Enchant } from './enchant.ts'
import { ENCHANTS } from './enchant.ts'
import { ITEMS, type ItemKey, type RunState } from './items.ts'
import { SKILLS, type SkillKey } from './skills.ts'
import { reachable, type Tier } from './tiers.ts'

// The run in localStorage, written at the start of every hour together with that hour's seed: reloading
// puts you back at the start of the hour and replays it exactly (same offers, events, fights).

export interface SavedItem { key: ItemKey; tier: Tier; enchant?: Enchant; run: RunState; pos: number }
export interface Save {
  v: 1
  seed: number // this hour's seed
  day: number
  hour: number
  wins: number
  prestige: number
  lastChance: boolean
  gold: number
  income: number
  level: number
  xp: number
  board: SavedItem[]
  stash: SavedItem[]
  skills: { key: SkillKey; tier: Tier }[]
}

const KEY = 'bazaar-like:run'

// Storage can be missing or throw (private windows, blocked site data): saving is best effort.
export function writeSave(save: Save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save))
  } catch {}
}

export function clearSave() {
  try {
    localStorage.removeItem(KEY)
  } catch {}
}

export function readSave(): Save | null {
  try {
    return clean(JSON.parse(localStorage.getItem(KEY) ?? 'null'))
  } catch {
    return null
  }
}

/**
 * A usable save or null. Content changes between versions don't break an old save: items and skills that no
 * longer exist are dropped, tiers they can't be any more fall back to their starting tier, unknown enchantments go.
 */
export function clean(s: unknown): Save | null {
  const save = s as Save | null
  if (!save || save.v !== 1 || !Array.isArray(save.board) || !Array.isArray(save.stash) || !Array.isArray(save.skills)) return null
  const tierFor = (start: Tier, t: Tier) => (reachable(start).includes(t) ? t : start)
  const item = (it: SavedItem): SavedItem | null => {
    if (!(it?.key in ITEMS)) return null
    return { key: it.key, tier: tierFor(ITEMS[it.key].tier, it.tier), enchant: it.enchant && it.enchant in ENCHANTS ? it.enchant : undefined, run: it.run ?? {}, pos: it.pos | 0 }
  }
  const items = (list: SavedItem[]) => list.map(item).filter((it): it is SavedItem => it !== null)
  return {
    ...save,
    board: items(save.board),
    stash: items(save.stash),
    skills: save.skills.filter(sk => sk?.key in SKILLS).map(sk => ({ key: sk.key, tier: tierFor(SKILLS[sk.key].tier, sk.tier) })),
  }
}
