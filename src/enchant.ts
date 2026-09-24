import type { Ability, Action, Aura, Value } from './engine/combat.ts'
import type { ItemDef } from './items.ts'
import { T1, T2, type Stat } from './tiers.ts'

// Enchantments are rules over an item's own numbers, so one rule covers every item and scales with its
// tier. An item can override any enchantment (or opt out of it) in its `enchants` field.

export type Enchant = 'shielded' | 'restorative' | 'obsidian' | 'fiery' | 'toxic' | 'mossy' | 'heavy' | 'turbo' | 'frozen' | 'shiny'
type Effect = 'slow' | 'haste' | 'freeze'

interface EnchantInfo {
  name: string
  color: string
  rare?: boolean // legendary rare: offered far less often
  stat?: Stat // T1/T2 enchantments
  effect?: Effect // Heavy, Turbo, Frozen
  text: string[] // what the rule does, for the pick screen
}

const T1_TEXT = (s: string) => [`Doubles this item's <${s}>`, `Or adds <${s}> equal to its biggest T1 number`]
const T2_TEXT = (s: string) => [`Doubles this item's <${s}>`, `Or adds <${s}> equal to 10% of its biggest T1 number`]
const EFFECT_TEXT = (s: string) => [`Doubles this item's <${s}> duration`, `Or it also <${s}>s an item when used`]

export const ENCHANTS: Record<Enchant, EnchantInfo> = {
  shielded: { name: 'Shielded', color: '#f5cc3d', stat: 'shield', text: T1_TEXT('Shield') },
  restorative: { name: 'Restorative', color: '#7edc5a', stat: 'heal', text: T1_TEXT('Heal') },
  obsidian: { name: 'Obsidian', color: '#b07cff', stat: 'damage', rare: true, text: T1_TEXT('Damage') },
  fiery: { name: 'Fiery', color: '#ff9b3a', stat: 'burn', text: T2_TEXT('Burn') },
  toxic: { name: 'Toxic', color: '#58d69b', stat: 'poison', text: T2_TEXT('Poison') },
  mossy: { name: 'Mossy', color: '#c2e25a', stat: 'regen', text: T2_TEXT('Regen') },
  heavy: { name: 'Heavy', color: '#c39bff', effect: 'slow', text: EFFECT_TEXT('Slow') },
  turbo: { name: 'Turbo', color: '#63d2ff', effect: 'haste', text: EFFECT_TEXT('Haste') },
  frozen: { name: 'Frozen', color: '#7fdcff', effect: 'freeze', rare: true, text: EFFECT_TEXT('Freeze') },
  shiny: { name: 'Shiny', color: '#fff3a0', rare: true, text: ['+1 <Multicast>'] },
}
export const ENCHANT_KEYS = Object.keys(ENCHANTS) as Enchant[]

const NAME: Record<Stat, string> = { damage: 'Damage', shield: 'Shield', heal: 'Heal', burn: 'Burn', poison: 'Poison', regen: 'Regen' }
const ADD_LINE: Record<Stat, string> = {
  damage: 'Deal [damage] <Damage>',
  shield: 'Gain [shield] <Shield>',
  heal: '<Heal> [heal]',
  burn: '<Burn> [burn]',
  poison: '<Poison> [poison]',
  regen: 'Gain [regen] <Regen>',
}

/** How much of `to` one point of `from` is worth: same class 1, T1 -> T2 a tenth, T2 -> T1 ten times. */
export const worth = (from: Stat, to: Stat) => (T1.includes(from) === T1.includes(to) ? 1 : T1.includes(from) ? 0.1 : 10)

/** `v` scaled by k. Plain numbers stay whole (at least 1); references get a multiplier. */
function scaled(v: Value, k: number): Value {
  if (typeof v === 'number') return k === 2 ? v * 2 : Math.max(1, Math.round(v * k))
  return { ...v, times: (v.times ?? 1) * k }
}

/** Biggest stat of `group` the item has, if any. */
function biggest(def: ItemDef, group: Stat[]): [Stat, number] | null {
  const have = group.map(s => [s, def.stats[s] ?? 0] as [Stat, number]).filter(([, v]) => v > 0)
  return have.sort((a, b) => b[1] - a[1])[0] ?? null
}

/** The ability that performs `stat` (or the first one that's a use, else the first one): where added effects go. */
function hostFor(def: ItemDef, stat?: Stat): Ability | undefined {
  return (stat && def.abilities.find(ab => ab.do.some(a => a.do === stat))) ?? def.abilities.find(ab => ab.when.on === 'use') ?? def.abilities[0]
}

/** Stat gains: in-fight modifications and auras that raise a T1/T2 stat. */
function gains(def: ItemDef) {
  const out: ({ stat: Stat; aura: Aura } | { stat: Stat; action: Extract<Action, { do: 'modify' }>; ability: Ability })[] = []
  const isStat = (s: string): s is Stat => (T1 as string[]).includes(s) || (T2 as string[]).includes(s)
  for (const aura of def.auras ?? []) if (isStat(aura.stat)) out.push({ stat: aura.stat, aura })
  for (const ability of def.abilities) for (const action of ability.do) if (action.do === 'modify' && isStat(action.stat)) out.push({ stat: action.stat, action, ability })
  return out
}

/** Heavy/Turbo/Frozen strength: a base duration scaled by how slow the item is (0.5x..2x around a 5 s cooldown). */
function effectSeconds(def: ItemDef, e: Effect) {
  const base = { slow: 1, haste: 1, freeze: 0.5 }[e]
  const k = def.cooldown ? Math.max(0.5, Math.min(2, def.cooldown / 5)) : 1
  return Math.max(0.5, Math.round(base * k * 2) / 2)
}
const EFFECT_ACTION: Record<Effect, (v: Value) => Action> = {
  slow: seconds => ({ do: 'slow', seconds, targets: { pick: 'enemy', where: { has: 'cooldown' }, random: 1 } }),
  haste: seconds => ({ do: 'haste', seconds, targets: { pick: 'mine', excludeSelf: true, where: { has: 'cooldown' }, random: 1 } }),
  freeze: seconds => ({ do: 'freeze', seconds, targets: { pick: 'enemy', where: { has: 'cooldown' }, random: 1 } }),
}
const EFFECT_LINE: Record<Effect, (val: string) => string> = {
  slow: v => `<Slow> an enemy item for [slow ${v}] second(s)`,
  haste: v => `<Haste> another item for [haste ${v}] second(s)`,
  freeze: v => `<Freeze> an enemy item for [freeze ${v}] second(s)`,
}

/**
 * The rule for enchanting `def` (resolved at its tier) with `e`, or null when the rule has nothing to work with.
 *
 * - T1 (Shielded, Restorative, Obsidian) and T2 (Fiery, Toxic, Mossy): an item that already has the stat
 *   doubles it. Otherwise it gains the stat on the ability that performs its biggest T1 stat, worth that
 *   number (T1) or 10% of it (T2). With no T1 stat, its biggest T2 stat is used the same way (T2 -> T1 is x10).
 * - Items that gain stats in a fight (scaling, auras): a matching enchantment doubles the gain, any other
 *   T1/T2 enchantment adds a parallel gain of its own stat (a Burn scaler with Mossy also gains Regen).
 * - Heavy, Turbo, Frozen: double the item's Slow/Haste/Freeze durations, or add one to its use.
 * - Shiny: +1 Multicast.
 */
export function enchantRule(item: ItemDef, e: Enchant): ItemDef | null {
  const def = structuredClone(item)
  const info = ENCHANTS[e]
  const lines: string[] = []

  if (info.stat) {
    const s = info.stat
    if ((def.stats[s] ?? 0) > 0) {
      def.stats[s]! *= 2
      lines.push(`Double <${NAME[s]}>`)
    } else {
      const from = biggest(def, T1) ?? biggest(def, T2)
      const host = from && hostFor(def, from[0])
      if (from && host) {
        def.stats[s] = Math.max(1, Math.round(from[1] * worth(from[0], s)))
        host.do.push({ do: s })
        lines.push(ADD_LINE[s])
      }
    }
    for (const g of gains(def)) {
      if (g.stat === s) {
        if ('aura' in g) g.aura.add = scaled(g.aura.add, 2)
        else g.action.add = scaled(g.action.add, 2)
        lines.push(`Double its <${NAME[s]}> gain`)
      } else if ('aura' in g) {
        ;(def.auras ??= []).push({ ...g.aura, stat: s, add: scaled(g.aura.add, worth(g.stat, s)) })
        lines.push(`Also gives <${NAME[s]}> where it gives <${NAME[g.stat]}>`)
      } else {
        g.ability.do.push({ ...g.action, stat: s, add: scaled(g.action.add, worth(g.stat, s)) })
        lines.push(`Also gains <${NAME[s]}> when it gains <${NAME[g.stat]}>`)
      }
    }
  }

  if (info.effect) {
    const fx = info.effect
    const existing = def.abilities.flatMap(ab => ab.do).filter(a => a.do === fx)
    if (existing.length) {
      for (const a of existing) if ('seconds' in a) a.seconds = scaled(a.seconds, 2)
      lines.push(`Double <${fx[0].toUpperCase() + fx.slice(1)}> duration`)
    } else {
      const host = def.cooldown ? hostFor(def) : undefined
      if (host) {
        def.vals = { ...def.vals, [e]: effectSeconds(def, fx) }
        host.do.push(EFFECT_ACTION[fx]({ val: e }))
        lines.push(EFFECT_LINE[fx](e))
      }
    }
  }

  if (e === 'shiny' && def.cooldown) {
    def.multicast = (def.multicast ?? 1) + 1
    lines.push('<Multicast> +1')
  }

  return lines.length ? { ...def, enchant: e, enchantText: lines } : null
}
