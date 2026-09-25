import assert from 'node:assert/strict'
import { clean } from './save.ts'

// Saves survive content changes: unknown items/skills go, impossible tiers fall back, garbage is refused.
{
  const save = clean({
    v: 1, seed: 1, day: 3, hour: 2, wins: 1, prestige: 18, lastChance: false, gold: 9, income: 5, level: 2, xp: 3,
    board: [{ key: 'rustBlade', tier: 'gold', run: { perm: { damage: 2 } }, pos: 3 }, { key: 'gone', tier: 'bronze', run: {}, pos: 4 }],
    stash: [{ key: 'towerShield', tier: 'bronze', enchant: 'nonsense', run: {}, pos: 0 }],
    skills: [{ key: 'sharpEye', tier: 'silver' }, { key: 'forgotten', tier: 'bronze' }],
  })!
  assert.deepEqual(save.board.map(it => it.key), ['rustBlade'])
  assert.equal(save.stash[0].tier, 'silver') // Tower Shield starts at Silver
  assert.equal(save.stash[0].enchant, undefined)
  assert.deepEqual(save.skills, [{ key: 'sharpEye', tier: 'silver' }])
  assert.equal(clean({ v: 2 }), null)
  assert.equal(clean('junk'), null)
}

console.log('save: ok')
