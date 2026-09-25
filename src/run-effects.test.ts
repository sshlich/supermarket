import assert from 'node:assert/strict'
import type { FightEvent } from './engine/combat.ts'
import { itemAt, type ItemKey, type RunState } from './items.ts'
import { fightOutcomes, runTrigger, type RunCard } from './run-effects.ts'
import { skillAt, type SkillKey } from './skills.ts'

const card = (id: string, key: ItemKey, place: 'board' | 'stash', run?: RunState): RunCard => ({ id, def: itemAt(key, undefined, undefined, run), place })
const skill = (id: string, key: SkillKey): RunCard => ({ id, def: skillAt(key), place: 'skill' })
const random = () => 0.5

// Buy, filtered by what was bought: Lucky Coin pays for Weapons only.
{
  const cards = [card('coin', 'luckyCoin', 'board'), card('blade', 'rustBlade', 'board'), card('pot', 'ironPot', 'stash')]
  assert.deepEqual(runTrigger({ on: 'buy', card: 'blade' }, cards, random), [{ kind: 'gold', amount: 1 }])
  assert.deepEqual(runTrigger({ on: 'buy', card: 'pot' }, cards, random), [])
}

// Sell: Coin Purse grows its value from the stash; Haggler, a skill, pays gold.
{
  const cards = [card('purse', 'coinPurse', 'stash'), card('blade', 'rustBlade', 'board'), skill('haggler', 'haggler')]
  assert.deepEqual(runTrigger({ on: 'sell', card: 'blade' }, cards, random), [
    { kind: 'grow', card: 'purse', stat: 'value', amount: 1 },
    { kind: 'gold', amount: 1 },
  ])
}

// Win: a Trophy Axe grows on the board but not in the stash; Veteran grows your leftmost item. Losing does neither.
{
  const cards = [card('blade', 'rustBlade', 'board'), card('axe', 'trophyAxe', 'board'), card('spare', 'trophyAxe', 'stash'), skill('vet', 'veteran')]
  assert.deepEqual(runTrigger({ on: 'win' }, cards, random), [
    { kind: 'grow', card: 'axe', stat: 'damage', amount: 4 },
    { kind: 'grow', card: 'blade', stat: 'damage', amount: 2 },
  ])
  assert.deepEqual(runTrigger({ on: 'lose' }, cards, random), [])
}

// Day start and quests: the Piggy Bank and the Strange Egg count from the stash, the Worn Compass counts wins.
{
  const cards = [card('pig', 'piggyBank', 'stash'), card('egg', 'strangeEgg', 'stash'), card('compass', 'wornCompass', 'board')]
  assert.deepEqual(runTrigger({ on: 'dayStart' }, cards, random), [
    { kind: 'grow', card: 'pig', stat: 'value', amount: 1 },
    { kind: 'progress', card: 'egg', amount: 1 },
  ])
  assert.deepEqual(runTrigger({ on: 'win' }, cards, random), [{ kind: 'progress', card: 'compass', amount: 1 }])
  assert.deepEqual(runTrigger({ on: 'win' }, [card('compass', 'wornCompass', 'board', { done: true })], random), []) // done: stops counting
}

// Fight effects only reach the run from your side, and fight-only transforms don't.
{
  const events: FightEvent[] = [
    { t: 1, kind: 'grow', side: 0, item: 'a', stat: 'damage', amount: 1 },
    { t: 1, kind: 'grow', side: 1, item: 'b', stat: 'damage', amount: 1 },
    { t: 2, kind: 'gold', side: 0, amount: 2 },
    { t: 3, kind: 'transform', side: 0, item: 'a', into: 'x' },
    { t: 3, kind: 'transform', side: 0, item: 'a', into: 'y', permanent: true },
    { t: 4, kind: 'progress', side: 0, item: 'a', amount: 1 },
  ]
  assert.deepEqual(fightOutcomes(events), [
    { kind: 'grow', card: 'a', stat: 'damage', amount: 1 },
    { kind: 'gold', amount: 2 },
    { kind: 'transform', card: 'a', into: 'y' },
    { kind: 'progress', card: 'a', amount: 1 },
  ])
}

console.log('run-effects: ok')
