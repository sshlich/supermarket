import type { FightEvent } from './engine/combat.ts'

// Fight events as readable lines: who did what, to whom, and why (the trigger behind it). Lines use the
// tooltip markup ([damage 5], <Burn>), and the caller supplies names already marked up as yours or theirs.

export interface LogNames {
  card(id: string): string // an item or skill in the fight
  side(i: 0 | 1): string // "You", or the opponent
  item(key: string): string // any item by key (what something transformed into)
}

const STAT: Record<string, string> = {
  damage: '<Damage>', shield: '<Shield>', heal: '<Heal>', burn: '<Burn>', poison: '<Poison>', regen: '<Regen>',
  crit: '<Crit> chance', lifesteal: '<Lifesteal>', multicast: '<Multicast>', ammo: '<Ammo>', cooldown: 'cooldown', value: '<Value>',
}
const PERFORMED: Record<string, string> = {
  damage: 'dealt damage', heal: 'healed', shield: 'gave Shield', burn: 'applied <Burn>', poison: 'applied <Poison>', regen: 'gave <Regen>',
  haste: 'used <Haste>', slow: 'used <Slow>', freeze: 'used <Freeze>', charge: 'used <Charge>',
}
const secs = (ms: number) => Math.round(ms / 100) / 10
const num = (n: number) => Math.round(n * 100) / 100

/** The line for `e`, or null for events that don't need one (a skill firing shows as the cause of what it did). */
export function describe(e: FightEvent, n: LogNames): string | null {
  const by = e.from && !['burn', 'poison', 'regen', 'storm'].includes(e.from) ? n.card(e.from) : ''
  const side = e.side === undefined ? '' : n.side(e.side)
  const it = e.item ? n.card(e.item) : ''
  const obj = e.item && e.item === e.from ? 'itself' : it // what a card did something to
  const a = e.amount ?? 0
  let line: string
  switch (e.kind) {
    case 'use': line = `${it} used${e.crit ? ': <Crit>!' : ''}`; break
    case 'damage':
      if (e.from === 'burn' || e.from === 'poison') line = `<${e.from === 'burn' ? 'Burn' : 'Poison'}> hurt ${side} for [damage ${a}]`
      else if (e.from === 'storm') line = `The storm hurt ${side} for [damage ${a}]`
      else line = `${by} hit ${side} for [damage ${a}]${e.blocked ? `, ${e.blocked} blocked by <Shield>` : ''}`
      break
    case 'heal': line = e.from === 'regen' ? `<Regen> healed ${side} for [heal ${a}]` : `${by} healed ${side} for [heal ${a}]`; break
    case 'shield': line = `${by} gave ${side} [shield ${a}]`; break
    case 'burn':
    case 'poison': line = `${by} applied [${e.kind} ${a}] to ${side}`; break
    case 'regen': line = `${by} gave ${side} [regen ${a}]`; break
    case 'haste': line = `${by} hasted ${obj} for [haste ${secs(a)}]s`; break
    case 'slow': line = `${by} slowed ${obj} for [slow ${secs(a)}]s`; break
    case 'freeze': line = `${by} froze ${obj} for [freeze ${secs(a)}]s`; break
    case 'charge': line = `${by} charged ${obj} [charge ${secs(a)}]s`; break
    case 'reload': line = `${by} reloaded ${obj}`; break
    case 'modify': {
      const v = e.stat === 'cooldown' ? secs(a) : num(a)
      line = `${it} ${a >= 0 ? 'gained' : 'lost'} ${Math.abs(v)}${e.stat === 'cooldown' ? 's' : ''} ${STAT[e.stat!] ?? e.stat} for this fight${by && e.from !== e.item ? ` (${by})` : ''}`
      break
    }
    case 'destroy': line = `${by} <Destroy>ed ${obj}`; break
    case 'repair': line = `${by} <Repair>ed ${obj}`; break
    case 'cleanse': line = `${by} <Cleanse>d ${side}`; break
    case 'transform': line = `${by} <Transform>ed ${obj} into ${e.into ? n.item(e.into) : 'something'}${e.permanent ? '' : ' for this fight'}`; break
    case 'grow': line = `${it} permanently gained +${num(a)} ${STAT[e.stat!] ?? e.stat}${by && e.from !== e.item ? ` (${by})` : ''}`; break
    case 'gold': line = `${by} earned [gold ${a}] <Gold> for ${side}`; break
    case 'progress': line = `${it}: quest +${num(a)}`; break
    case 'upgrade': line = `${it} will upgrade after the fight${by ? ` (${by})` : ''}`; break
    case 'end': return e.winner === -1 ? 'Draw.' : `${n.side(e.winner as 0 | 1)} won!`
    default: return null // 'skill'
  }
  return line + because(e, n)
}

/** Why it happened, when it wasn't simply the item being used. */
function because(e: FightEvent, n: LogNames): string {
  const c = e.cause
  if (!c || c.on === 'use') return ''
  if (c.on === 'fightStart') return ' <i>at the start of the fight</i>'
  if (c.on === 'itemUsed') return ` <i>when ${n.card(c.by)} was used</i>`
  if (c.on === 'crit') return ` <i>when ${n.card(c.by)} crit</i>`
  if (c.on === 'performed') return ` <i>when ${n.card(c.by)} ${PERFORMED[c.effect!] ?? c.effect}</i>`
  return ''
}
