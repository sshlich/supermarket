import { describe, expect, it } from 'vitest';
import { content, instance, snapshot } from '../packages/content';
import { makeCombatState } from '../packages/sim/src/combat';
import { attribute } from '../packages/sim/src/evaluate';
import { definition } from '../packages/sim/src/geometry';
import { hash } from '../packages/sim/src/determinism';
import { abilityDescription, enchantmentLines, inspectedAttributes } from '../src/descriptions';
import { dropRecipients } from '../src/interactions';
import { newRun } from '../packages/sim/src/run';

function context() {
  const player = snapshot('inspect', 'You', ['rivet-lance', 'tuning-pin'], 175, 'silver', [
    'steady-aim',
    'opening-cushion',
  ]);
  const state = makeCombatState(content, [player, snapshot('opponent', 'Rival', ['rivet-lance'])], 'details');
  return { content, state, source: state.entities[0] };
}

describe('calculated right-click details', () => {
  it('includes skill-added attributes absent from the printed item, with their actual source', () => {
    const ctx = context();
    expect(inspectedAttributes(ctx)).toContain('crit');
    expect(attribute(ctx, ctx.source, 'crit')).toMatchObject({
      base: 0,
      value: 1500,
      steps: [expect.objectContaining({ layer: 'aura', source: 'p0:inspect-skill-0' })],
    });
    ctx.source.location = 'stash';
    expect(inspectedAttributes(ctx)).not.toContain('crit');
  });
  it('shows enchantment attributes and removes them when the enchantment changes', () => {
    const ctx = context();
    ctx.source.enchantment = 'keen';
    expect(inspectedAttributes(ctx)).toContain('crit');
    expect(attribute(ctx, ctx.source, 'crit').value).toBe(4000);
    ctx.source.enchantment = 'echo';
    expect(inspectedAttributes(ctx)).toContain('multicast');
    expect(attribute(ctx, ctx.source, 'multicast').value).toBe(2);
  });
  it('describes the current skill tier rather than repeating its base-tier prose', () => {
    const ctx = context();
    ctx.source = ctx.state.entities.find((e) => e.defId === 'opening-cushion')!;
    const ability = definition(content, ctx.source.defId).abilities[0];
    expect(abilityDescription(ctx, ability).text).toBe('Grant 35 Shield to you.');
  });
  it('distinguishes charge/cooldown units and permanent versus fight scope', () => {
    const ctx = context();
    ctx.source = ctx.state.entities.find((e) => e.defId === 'tuning-pin')!;
    const ability = definition(content, ctx.source.defId).abilities[0];
    expect(abilityDescription(ctx, ability).text).toContain('-0.18s Cooldown');
    expect(abilityDescription(ctx, ability).text).toContain('for the fight');
    ctx.source.enchantment = 'brisk';
    expect(enchantmentLines(ctx).join(' ')).toContain('0.85s');
  });
  it('keeps event/target-dependent amounts symbolic and does not consume RNG during inspection', () => {
    const ctx = context(),
      before = hash(ctx.state);
    const description = abilityDescription(ctx, {
      id: 'react',
      locations: ['board'],
      trigger: { event: 'damage.dealt' },
      actions: [{ kind: 'heal', target: { side: 'owner' }, amount: { ref: 'event', key: 'healthDamage' } }],
    });
    expect(description.text).toContain('event’s Health Damage');
    const conditionalModifier = abilityDescription(ctx, {
      id: 'percent',
      locations: ['board'],
      trigger: { event: 'damage.dealt' },
      actions: [
        {
          kind: 'modify',
          target: { side: 'self' },
          attribute: 'damage',
          op: 'percent',
          scope: 'combat',
          amount: { ref: 'event', key: 'healthDamage' },
        },
      ],
    });
    expect(conditionalModifier.text).not.toContain('NaN');
    expect(conditionalModifier.text).toContain('event’s Health Damage');
    expect(hash(ctx.state)).toBe(before);
  });
  it('highlights only the canonical duplicate recipient, but every legal enchant target', () => {
    const run = newRun(content, 'recipients');
    run.items = [
      instance('rivet-lance', 'first', 0),
      instance('rivet-lance', 'second', 2),
      instance('moss-jar', 'passive', 4),
    ];
    run.offers = [
      { id: 'offer', defId: 'rivet-lance', tier: 'bronze', enchantment: null, price: 4, sold: false },
    ];
    expect(dropRecipients(content, run, { kind: 'offer', id: 'offer' }).map((i) => i.id)).toEqual(['first']);
    run.phase = 'choice';
    run.pending = [
      {
        reason: 'Enchant',
        rewards: [{ id: 'reward', label: '', text: '', target: 'enchant', enchantment: 'brisk' }],
      },
    ];
    expect(dropRecipients(content, run, { kind: 'reward', id: 'reward' }).map((i) => i.id)).toEqual([
      'first',
      'second',
    ]);
  });
});
