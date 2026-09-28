// The only way the view changes the game (DESIGN 14.3): apply(state, action) mutates it and says what happened.

import { HOME, type Box } from '../data/items.ts'
import { K, applyDrop, grab, planDrop, send, tidy, where } from './containers.ts'
import { learn, talk } from './knowledge.ts'
import { feeds, note, present, read, terminalHere, write, type Write } from './access.ts'
import type { Dial } from '../data/relics.ts'
import { choose, chooseRunner, go, harvest, nightRun, pullLever, returnHome, search, startRun, take, throwBolt, use, wake, type Choice } from './run.ts'
import { homeNight, type Machine } from './seam.ts'
import { world, type Ev } from './sim.ts'
import type { State } from './state.ts'

export type Action =
  | { type: 'endDay' }
  | { type: 'drop'; id: number; split?: boolean; box: Box; x: number; y: number; rot: boolean }
  | { type: 'send'; id: number; to: Box; all?: boolean }
  | { type: 'tidy'; box: Box }
  | { type: 'blackout' }
  | { type: 'machine'; id: Machine }
  | { type: 'startRun' }
  | { type: 'go'; key: string }
  | { type: 'returnHome' }
  | { type: 'bolt'; key: string }
  | { type: 'search' }
  | { type: 'harvest' }
  | { type: 'take'; id: number }
  | { type: 'choose'; choice: Choice; arg?: string }
  | { type: 'lever'; id: string }
  | { type: 'terminal' }
  | { type: 'present' }
  | { type: 'read' }
  | { type: 'note'; what: 'tag' | 'subscribe'; id: string }
  | { type: 'write'; what: Write; target: string }
  | { type: 'use'; id: number }
  | { type: 'dial'; dial?: Dial }
  | { type: 'camp' }
  | { type: 'runner'; name: string }

const say = (s: State, kind: Ev['kind'], text: string): Ev[] => [{ night: s.day, kind, text }]
/** Out on a run, only the pack and belt are within reach. */
export const reach = (s: State, box: Box) => !s.run || !HOME.includes(box)

export function apply(s: State, a: Action): Ev[] {
  const ev = act(s, a)
  see(s)
  return ev
}

function act(s: State, a: Action): Ev[] {
  if (s.end) return say(s, 'refused', 'The Seam has fallen.')
  const atTerminal = () => terminalHere(s) && !!s.run!.term
  switch (a.type) {
    case 'endDay': return s.run ? say(s, 'refused', 'Out on a run: camp, or come home first.') : endNight(s)
    case 'camp': return s.run ? [...endNight(s), ...wake(s)] : say(s, 'refused', 'At home: End Day instead.')
    case 'startRun': return startRun(s)
    case 'go': return go(s, a.key)
    case 'returnHome': return returnHome(s)
    case 'bolt': return throwBolt(s, a.key)
    case 'search': return search(s)
    case 'harvest': return harvest(s)
    case 'take': return take(s, a.id)
    case 'choose': return choose(s, a.choice, a.arg)
    case 'lever': return pullLever(s, a.id)
    case 'terminal': {
      if (!terminalHere(s)) return say(s, 'refused', 'No terminal here.')
      if (s.run!.enc) return say(s, 'refused', 'Not with that in front of you.')
      if (s.run!.term) return []
      if (s.step + 1 > 12) return say(s, 'refused', 'Not enough of the day left.')
      s.step++
      s.run!.term = { writes: 0 }
      return say(s, 'home', 'The terminal wakes.')
    }
    case 'present': return atTerminal() ? present(s) : say(s, 'refused', 'Not at a terminal.')
    case 'read': return atTerminal() ? read(s) : say(s, 'refused', 'Not at a terminal.')
    case 'note': return atTerminal() ? note(s, a.what, a.id) : say(s, 'refused', 'Not at a terminal.')
    case 'write': return atTerminal() ? write(s, a.what, a.target) : say(s, 'refused', 'Not at a terminal.')
    case 'use': return use(s, a.id)
    case 'dial':
      s.lab.dial = a.dial
      return []
    case 'runner': return chooseRunner(s, a.name)
    case 'drop': {
      const held = grab(s, a.id, a.split)
      const from = held && (held.from?.box ?? where(s, held.splitOf!)!.box)
      if (!held || !from || !reach(s, from) || !reach(s, a.box)) return say(s, 'refused', 'Out of reach.')
      const plan = planDrop(s, held, a.box, a.x, a.y, a.rot)
      if (!plan) return say(s, 'refused', 'No room there.')
      const kind = held.item.kind
      const onto = plan.recipe !== undefined ? where(s, plan.recipe)!.it.kind : ''
      const r = applyDrop(s, held, plan)
      if (!r.made) return []
      for (const k of [kind, onto]) learn(s, `I:${k}:use`, 'exact', 'used')
      const loud = K[kind].tool && onto === 'masonPlate' ? 5 : 0
      s.seamA += loud
      return say(s, 'made', `${K[kind].name} on ${K[onto].name}: ${K[r.made].name}${loud ? ' (loud)' : ''}${r.broke ? `. The ${K[kind].name} broke into scrap.` : ''}`)
    }
    case 'send': {
      const at = where(s, a.id)
      if (!at || !reach(s, at.box) || !reach(s, a.to)) return say(s, 'refused', 'Out of reach.')
      return send(s, a.id, a.to, a.all) ? [] : say(s, 'refused', `No room in the ${a.to}.`)
    }
    case 'tidy':
      if (!reach(s, a.box)) return say(s, 'refused', 'Out of reach.')
      tidy(s, a.box)
      return []
    case 'blackout':
      s.blackout = !s.blackout
      return say(s, 'home', s.blackout ? 'Blackout: the lamps are covered.' : 'The lamps are lit again.')
    case 'machine':
      s.machines[a.id] = !s.machines[a.id]
      return []
  }
}

/** The whole night (6.7): the Seam, then the world, the runner's night, then what the Seam hears and MAINT writes. */
function endNight(s: State): Ev[] {
  const { lit } = homeNight(s)
  const ev = world(s, s.blackout || !lit)
  for (const e of ev) if (e.kind === 'raid') s.log.push({ day: s.day, kind: 'event', text: `Glasshounds came through the hatch in the dark hours. ${e.lost!.join(', ')} ${e.lost!.length > 1 ? 'are' : 'is'} gone.` })
  ev.push(...nightRun(s, ev))
  talk(s, ev)
  feeds(s)
  s.day++
  s.step = 0
  // The long arc (4.2): buried or emptied, the Seam falls; through day 30, it holds (and play goes on).
  if (s.flags.buried) s.end = 'buried'
  else if (!s.villagers.length) s.end = 'empty'
  if (s.end) ev.push({ night: s.day - 1, kind: 'fell', text: s.end })
  else if (s.day === 31) {
    s.flags.held = true
    s.log.push({ day: 30, kind: 'event', text: 'The Seam holds. For now.' })
    ev.push({ night: 30, kind: 'held', text: 'The Seam holds. For now.' })
  }
  return ev
}

/** Anything in the Seam's hands is known by name (the Catalog's items table). */
function see(s: State) {
  for (const items of Object.values(s.C)) for (const it of items) {
    if (s.know[`I:${it.kind}:known`]) continue
    learn(s, `I:${it.kind}:known`, 'exact', 'home')
    learn(s, `I:${it.kind}:spoil`, 'exact', 'home') // the village knows how long things keep
  }
}
