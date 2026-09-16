import { describe, expect, it } from 'vitest';
import { content, instance } from '../packages/content';
import { clone, hash } from '../packages/sim/src/determinism';
import {
  commandOptions,
  dispatch,
  importSnapshot,
  loadRun,
  newRun,
  rewardTargets,
  runSnapshot,
  saveRun,
} from '../packages/sim/src/run';
import { validateCommand, validateContent, validateRun } from '../packages/sim/src/validation';
import type { Command, Content, Run } from '../packages/sim/src/model';

type Input = Command extends infer C ? (C extends Command ? Omit<C, 'version' | 'revision'> : never) : never;
const act = (run: Run, input: Input, catalog: Content = content) =>
  dispatch(catalog, run, { version: 1, revision: run.revision, ...input }).state;
const start = (seed = 'run-test') => act(newRun(content, seed), { type: 'start', choice: 'economy' });
function choose(run: Run, catalog: Content = content): Run {
  const options = commandOptions(catalog, run);
  const choice = options.find((r) => !r.target && !r.item && !r.skill) ?? options[0];
  const target = rewardTargets(catalog, run, choice)[0];
  return act(run, { type: 'choose', choice: choice.id, ...(target ? { target: target.id } : {}) }, catalog);
}
describe('Slice C — construction and persistence', () => {
  it('starts all three packages with an active offensive item', () => {
    for (const reward of content.starts) {
      const run = act(newRun(content, 'start'), { type: 'start', choice: reward.id });
      expect(run.items.some((i) => i.defId === 'rivet-lance')).toBe(true);
      expect(run.phase).toBe('encounter');
    }
  });
  it('rejects stale/invalid commands without modifying the caller', () => {
    const run = start(),
      before = hash(run);
    expect(() => dispatch(content, run, { version: 1, revision: 0, type: 'leave' })).toThrow('Stale');
    expect(() => act(run, { type: 'buy', offer: 'no' })).toThrow();
    expect(hash(run)).toBe(before);
    expect(() =>
      validateCommand({ version: 1, revision: 1, type: 'move', item: 'i1', location: 'board', position: -1 }),
    ).toThrow();
  });
  it('saves and reloads every decision boundary in a complete journey to defeat', () => {
    let run = start();
    let boundaries = 0;
    // An empty board deterministically loses ordinary PvE and PvP, exercising last chance and defeat.
    run = act(run, { type: 'sell', item: run.items[0].id });
    const seen = new Set<string>();
    for (let step = 0; step < 200 && run.phase !== 'defeat'; step++) {
      const saved = loadRun(content, saveRun(content, run));
      expect(saved).toEqual(run);
      expect(() => validateRun(content, saved)).not.toThrow();
      boundaries++;
      seen.add(run.phase);
      if (run.phase === 'choice') run = choose(run);
      else if (run.phase === 'shop') run = act(run, { type: 'leave' });
      else if (run.phase === 'result') run = act(run, { type: 'continue' });
      else if (run.activeOpponent) run = act(run, { type: 'fight' });
      else if (run.hour === 2 || run.hour === 5) run = act(run, { type: 'select', id: run.candidates[0] });
      else {
        const id = run.candidates.find(
          (id) => content.encounters.find((e) => e.id === id)?.category === 'free',
        )!;
        run = act(run, { type: 'select', id });
      }
    }
    expect(run.phase).toBe('defeat');
    expect(run.lastChanceUsed).toBe(true);
    expect(boundaries).toBeGreaterThan(70);
    expect(seen).toContain('result');
  }, 30000);
  it('supports a complete victory state and does not consume Prestige on PvE loss', () => {
    const catalog = clone(content);
    catalog.rules.wins = 1;
    let run = start();
    run.hour = 2;
    run.candidates = ['monster-0-0'];
    run = act(run, { type: 'select', id: 'monster-0-0' });
    run.items = [];
    run = act(run, { type: 'fight' });
    const prestige = run.prestige;
    run = act(run, { type: 'continue' });
    expect(run.prestige).toBe(prestige);
    run.phase = 'encounter';
    run.pending = [];
    run.hour = 5;
    run.candidates = ['rival-0-0'];
    run.items = [instance('rivet-lance', 'strong', 0, 'diamond')];
    run.maxHealth = 2000;
    run = act(run, { type: 'select', id: 'rival-0-0' }, catalog);
    run = act(run, { type: 'fight' }, catalog);
    expect(run.battle?.outcome).toBe('p0');
    run = act(run, { type: 'continue' }, catalog);
    expect(run.phase).toBe('victory');
  });
  it('duplicate purchases preserve identity and permanent changes, replacing an incoming enchantment', () => {
    let run = start();
    const original = run.items[0];
    original.enchantment = 'venom';
    original.modifiers = [
      { id: 'perma', sourceId: 'fixture', attribute: 'damage', op: 'add', value: 7, scope: 'permanent' },
    ];
    run.phase = 'shop';
    run.selected = 'open-stalls';
    run.gold = 50;
    run.offers = [
      {
        id: 'duplicate',
        defId: original.defId,
        tier: 'bronze',
        enchantment: 'cinder',
        price: 5,
        sold: false,
      },
    ];
    run = act(run, { type: 'buy', offer: 'duplicate' });
    expect(run.items).toHaveLength(1);
    expect(run.items[0]).toMatchObject({
      id: original.id,
      tier: 'silver',
      enchantment: 'cinder',
      modifiers: original.modifiers,
    });
    expect(run.gold).toBe(45);
  });
  it('skill duplicate upgrades share the normal acquisition mechanism', () => {
    let run = start();
    run.phase = 'choice';
    run.pending = [
      { reason: 'fixture', rewards: [{ id: 'skill', label: 'skill', text: '', skill: 'opening-cushion' }] },
    ];
    run.afterChoices = 'encounter';
    run = act(run, { type: 'choose', choice: 'skill' });
    run.phase = 'choice';
    run.pending = [
      { reason: 'fixture', rewards: [{ id: 'skill', label: 'skill', text: '', skill: 'opening-cushion' }] },
    ];
    run = act(run, { type: 'choose', choice: 'skill' });
    expect(run.skills).toHaveLength(1);
    expect(run.skills[0].tier).toBe('silver');
  });
  it('queues each crossed level in sequence and completes the encounter hour exactly once', () => {
    let run = start();
    run.phase = 'choice';
    run.pending = [{ reason: 'A Quiet Table', rewards: [{ id: 'xp', label: 'xp', text: '', xp: 25 }] }];
    run.afterChoices = 'completeHour';
    run = act(run, { type: 'choose', choice: 'xp' });
    expect(run.level).toBe(4);
    expect(run.pending.map((p) => p.reason)).toEqual(['Level 2', 'Level 3', 'Level 4']);
    expect(run.hour).toBe(0);
    while (run.phase === 'choice') run = choose(run);
    expect(run.hour).toBe(1);
    expect(run.log.filter((e) => e.kind === 'hour.completed')).toHaveLength(1);
    expect(run.capacity).toBe(8);
  });
  it('applies explicitly stashed merchant abilities and removes board aura eligibility', () => {
    let run = start();
    run.items.push(instance('copper-ledger', 'ledger', 0, 'bronze', 'stash'));
    run.candidates = ['open-stalls'];
    const gold = run.gold;
    run = act(run, { type: 'select', id: 'open-stalls' });
    expect(run.gold).toBe(gold + 2);
    expect(run.log.some((e) => e.kind === 'ability.fired' && e.sourceId === 'ledger')).toBe(true);
  });
  it('quest purchase counters complete once and persist in saves', () => {
    let run = start();
    run.items.push(instance('survey-kit', 'quest', 0, 'bronze', 'stash'));
    run.phase = 'shop';
    run.selected = 'tool-cart';
    run.gold = 99;
    for (let i = 0; i < 3; i++) {
      run.offers = [
        { id: `o${i}`, defId: 'rivet-lance', tier: 'bronze', enchantment: null, price: 1, sold: false },
      ];
      run = act(run, { type: 'buy', offer: `o${i}` });
    }
    expect(run.items.find((i) => i.id === 'quest')?.memory.survey.completed).toBe(true);
    expect(run.items.find((i) => i.defId === 'rivet-lance')?.modifiers[0].value).toBe(7);
    expect(
      loadRun(content, saveRun(content, run)).items.find((i) => i.id === 'quest')?.memory.survey.progress,
    ).toBe(3);
  });
  it('round-trips curated snapshots and rejects tampered saves', () => {
    const run = start(),
      snap = runSnapshot(content, run);
    expect(importSnapshot(content, JSON.stringify(snap))).toEqual(snap);
    const data = JSON.parse(saveRun(content, run));
    data.state.gold++;
    expect(() => loadRun(content, JSON.stringify(data))).toThrow('checksum');
  });
  it('validates missing tiers, recursive auras, invalid pools, impossible targets and enchantments', () => {
    const missing = clone(content);
    delete missing.definitions[0].tiers.gold;
    expect(() => validateContent(missing)).toThrow('Missing tier');
    const aura = clone(content);
    aura.definitions[0].auras = [
      {
        id: 'bad',
        locations: ['board'],
        target: {
          side: 'allyItems',
          filters: [{ field: 'attribute', key: 'damage', compare: 'gt', value: 1 }],
        },
        attribute: 'damage',
        op: 'add',
        value: 1,
      },
    ];
    expect(() => validateContent(aura)).toThrow('Recursive');
    const pool = clone(content);
    pool.pools.neutral.push('missing');
    expect(() => validateContent(pool)).toThrow('pool');
    const target = clone(content);
    target.definitions[0].abilities[0].actions[0].target = { side: 'self' };
    expect(() => validateContent(target)).toThrow('Impossible');
    const enchant = clone(content);
    enchant.starts[0].enchantment = 'unsupported';
    expect(() => validateContent(enchant)).toThrow('Unsupported');
  });
});
