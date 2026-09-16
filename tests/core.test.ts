import { describe, expect, it } from 'vitest';
import { content, instance, snapshot } from '../packages/content';
import { clone, enqueue, hash, roll } from '../packages/sim/src/determinism';
import { canPlace, neighbors, occupied, validateGeometry } from '../packages/sim/src/geometry';
import { makeCombatState, RulesMachine, simulate } from '../packages/sim/src/combat';
import { applyModifiers, attribute, evaluate, select, traits } from '../packages/sim/src/evaluate';
import { validateContent, validateSnapshot } from '../packages/sim/src/validation';
import type { Action, Content, Modifier, Task } from '../packages/sim/src/model';

export function rig(
  ids = ['rivet-lance', 'bitter-vial', 'spring-magazine'],
  enemy = ['folding-buckler'],
  catalog: Content = content,
) {
  const initial: [ReturnType<typeof snapshot>, ReturnType<typeof snapshot>] = [
    snapshot('a', 'A', ids, 300),
    snapshot('b', 'B', enemy, 300),
  ];
  const state = makeCombatState(catalog, initial, 'fixture');
  const machine = new RulesMachine(catalog, state);
  const source = state.entities[0];
  return {
    catalog,
    initial,
    state,
    machine,
    source,
    ctx: { content: catalog, state, source },
    owner: state.players[0],
    enemy: state.players[1],
  };
}
describe('Slice A — deterministic foundation', () => {
  it('validates the original catalog and all curated snapshots', () => {
    expect(() => validateContent(content)).not.toThrow();
  });
  it('orders by time, phase, priority, owner, position, then insertion', () => {
    const base: Task = {
      seq: 1,
      time: 0,
      phase: 30,
      priority: 0,
      owner: 0,
      position: 0,
      sourceId: 'a',
      kind: 'cast',
      parent: null,
      batch: null,
      depth: 0,
    };
    const queue: Task[] = [];
    for (const task of [
      { ...base, seq: 6, time: 1 },
      { ...base, seq: 5, position: 1 },
      { ...base, seq: 4, owner: 1 },
      { ...base, seq: 3, priority: -1 },
      { ...base, seq: 2, phase: 20 },
      base,
    ])
      enqueue(queue, task);
    expect(queue.map((t) => t.seq)).toEqual([2, 3, 1, 5, 4, 6]);
  });
  it('owns its RNG and separates named streams', () => {
    const a = {},
      b = {};
    const first = roll('seed', a, 'crit', 10000);
    roll('seed', a, 'shops', 100);
    expect(first).toEqual(roll('seed', b, 'crit', 10000));
    expect(roll('seed', a, 'crit', 10000)).toEqual(roll('seed', b, 'crit', 10000));
    expect(hash({ b: 1, a: 2 })).toBe(hash({ a: 2, b: 1 }));
  });
  it('uses contiguous sizes and adjacent item instances', () => {
    const items = [
      instance('echo-anvil', 'large', 0),
      instance('bitter-vial', 'small', 4),
      instance('rivet-lance', 'medium', 5),
    ];
    expect(occupied(content, items[0])).toEqual([0, 1, 2]);
    expect(neighbors(items, items[1]).left?.id).toBe('large');
    expect(neighbors(items, items[1]).right?.id).toBe('medium');
    expect(canPlace(content, items, items[1], 'board', 2, 10)).toBe(false);
    expect(canPlace(content, items, items[1], 'board', 3, 10)).toBe(true);
    expect(() =>
      validateGeometry(content, [...items, instance('folding-buckler', 'overlap', 1)], 10, 10),
    ).toThrow();
  });
  it('is pure and exactly deterministic including transcript and final hash', () => {
    const initial: [ReturnType<typeof snapshot>, ReturnType<typeof snapshot>] = [
      snapshot('a', 'A', ['rivet-lance']),
      snapshot('b', 'B', ['folding-buckler']),
    ];
    const frozen = clone(initial);
    const a = simulate(content, initial, 'golden'),
      b = simulate(content, initial, 'golden');
    expect(a.replay).toEqual(b.replay);
    expect(initial).toEqual(frozen);
    expect(a.replay.final.outcome).toBe('p0');
    expect(a.replay.events.some((e) => e.kind === 'death.committed')).toBe(true);
  });
  it('blocks invalid snapshots and incompatible versions', () => {
    const s = snapshot('a', 'A', ['rivet-lance']);
    s.contentVersion = 'unknown';
    expect(() => validateSnapshot(content, s)).toThrow();
  });
  it('absorbs normal Damage with Shield and reports the split', () => {
    const r = rig();
    r.enemy.shield = 8;
    r.machine.apply(r.source, r.enemy, { kind: 'damage', target: { side: 'enemy' } }, 20);
    expect(r.enemy.health).toBe(288);
    expect(r.enemy.shield).toBe(0);
    expect(r.machine.events.find((e) => e.kind === 'damage.dealt')?.payload).toMatchObject({
      attempted: 20,
      absorbed: 8,
      healthDamage: 12,
    });
  });
});
describe('Slice B — timers and interaction network', () => {
  it('keeps charging at zero ammo and retains a full timer until Reload', () => {
    const r = rig(['bitter-vial']);
    r.source.ammo = 0;
    r.machine.advance(3100);
    expect(r.source.progress).toBe(6200);
    expect(r.state.queue.some((t) => t.kind === 'cast')).toBe(false);
    r.machine.advance(4500);
    expect(r.source.progress).toBe(6200);
    r.machine.apply(r.source, r.source, { kind: 'reload', target: { side: 'self' }, amount: 1 }, 1);
    r.machine.advance(4500);
    expect(r.state.queue.find((t) => t.kind === 'cast')?.time).toBe(4500);
    r.machine.drain(true);
    expect(r.machine.events.find((e) => e.kind === 'use.started')?.time).toBe(4500);
    expect(r.source.ammo).toBe(0);
    expect(r.source.progress).toBe(0);
    expect(r.machine.events.filter((e) => e.kind === 'ammo.depleted')).toHaveLength(1);
  });
  it('does not restart a partly charged empty item when reloaded', () => {
    const r = rig(['bitter-vial']);
    r.source.ammo = 0;
    r.machine.advance(2000);
    r.machine.apply(r.source, r.source, { kind: 'reload', target: { side: 'self' }, amount: 'full' }, 0);
    expect(r.source.progress).toBe(4000);
    r.machine.advance(3100);
    r.machine.drain(true);
    expect(r.machine.events.find((e) => e.kind === 'use.started')?.time).toBe(3100);
  });
  it('Haste and Slow multiply rates without rewriting cooldown; Freeze stops progress', () => {
    const r = rig();
    r.machine.advance(500);
    expect(r.source.progress).toBe(1000);
    r.machine.apply(r.source, r.source, { kind: 'status', target: { side: 'self' }, status: 'haste' }, 1000);
    r.machine.advance(1000);
    expect(r.source.progress).toBe(3000);
    r.machine.apply(r.source, r.source, { kind: 'status', target: { side: 'self' }, status: 'slow' }, 1000);
    r.machine.advance(1200);
    expect(r.source.progress).toBe(3400);
    r.machine.apply(r.source, r.source, { kind: 'status', target: { side: 'self' }, status: 'freeze' }, 500);
    r.machine.advance(1500);
    expect(r.source.progress).toBe(3400);
    expect(attribute(r.ctx, r.source, 'cooldown').value).toBe(2600);
  });
  it('Charge clamps overflow and enqueues a single activation', () => {
    const r = rig();
    r.machine.apply(r.source, r.source, { kind: 'charge', target: { side: 'self' } }, 9000);
    expect(r.source.progress).toBe(5200);
    r.machine.advance(0);
    r.machine.advance(0);
    expect(r.state.queue.filter((t) => t.kind === 'cast' && t.sourceId === r.source.id)).toHaveLength(1);
  });
  it('crit shares one roll across outputs and multicast repeats actions', () => {
    const c = clone(content),
      def = c.definitions.find((d) => d.id === 'echo-anvil')!;
    def.tiers.bronze!.crit = 10000;
    const r = rig(['echo-anvil'], ['folding-buckler'], c);
    r.machine.advance(5900);
    r.machine.drain(true);
    r.machine.advance(6020);
    r.machine.drain(true);
    expect(r.machine.events.filter((e) => e.kind === 'crit.occurred')).toHaveLength(2);
    expect(r.owner.shield).toBe(28);
    expect(r.enemy.health).toBe(260);
    expect(r.machine.events.filter((e) => e.kind === 'damage.dealt').map((e) => e.payload.attempted)).toEqual(
      [26, 26],
    );
  });
  it('heals, reports overheal, and uses floor rounding for cleanse', () => {
    const r = rig();
    r.owner.health = 290;
    r.owner.burn = 19;
    r.owner.poison = 29;
    r.machine.apply(r.source, r.owner, { kind: 'heal', target: { side: 'owner' } }, 20);
    expect([r.owner.health, r.owner.burn, r.owner.poison]).toEqual([300, 18, 27]);
    expect(r.machine.events.find((e) => e.kind === 'heal.received')?.payload).toMatchObject({
      actual: 10,
      overheal: 10,
    });
  });
  it('Regen precedes Poison and shield halves odd Burn with floor rounding', () => {
    const r = rig([]);
    r.owner.health = 290;
    r.owner.regen = 5;
    r.owner.poison = 10;
    r.owner.burn = 5;
    r.owner.shield = 1;
    r.machine.schedule({ kind: 'tick', sourceId: 'system', phase: 10, time: 1000 });
    r.machine.advance(1000);
    r.machine.drain(true);
    expect(r.owner.poison).toBe(9);
    expect(r.owner.burn).toBe(4);
    expect(r.owner.health).toBe(285);
    expect(r.owner.shield).toBe(0);
    const kinds = r.machine.events.map((e) => e.kind);
    expect(kinds.indexOf('regen.ticked')).toBeLessThan(kinds.indexOf('poison.ticked'));
  });
  it('evaluates expressions, counts unique types, and selects without replacement', () => {
    const r = rig();
    expect(
      evaluate(r.ctx, {
        op: 'add',
        args: [
          { ref: 'source', key: 'damage' },
          { op: 'div', args: [9, 2] },
        ],
      }),
    ).toBe(20);
    expect(evaluate(r.ctx, { count: { side: 'allyItems' }, distinctTypes: true })).toBe(4);
    const selected = select(r.ctx, { side: 'allyItems', order: 'random', count: 10 });
    expect(new Set(selected.map((t) => t.id)).size).toBe(3);
    expect(select(r.ctx, { side: 'allyItems', spatial: 'right' }).map((t) => t.id)).toEqual(['p0:a-1']);
  });
  it('explains modifiers and recomputes board auras after stash/destroy/repair', () => {
    const r = rig(['workbench', 'rivet-lance']);
    const weapon = r.state.entities[1];
    expect(attribute(r.ctx, weapon, 'damage').value).toBe(24);
    r.source.location = 'stash';
    expect(attribute(r.ctx, weapon, 'damage').value).toBe(16);
    r.source.location = 'board';
    r.source.destroyed = true;
    expect(attribute(r.ctx, weapon, 'damage').value).toBe(16);
    r.source.destroyed = false;
    expect(attribute(r.ctx, weapon, 'damage').steps[0]).toMatchObject({ layer: 'aura', source: r.source.id });
  });
  it('composes setter, flat, percentage, multiplier, min and max in a documented order', () => {
    const mods: Modifier[] = [
      ['set', 20],
      ['add', 10],
      ['percent', 5000],
      ['multiply', 20000],
      ['min', 80],
      ['max', 50],
    ].map(([op, value], i) => ({
      id: String(i),
      sourceId: 'test',
      attribute: 'damage',
      op: op as Modifier['op'],
      value: Number(value),
      scope: 'combat',
    }));
    expect(applyModifiers(4, mods)).toBe(80);
  });
});
describe('Slice D — extended verbs', () => {
  it.each([
    'shield',
    'status',
    'cleanse',
    'modify',
    'flying',
    'destroy',
    'repair',
    'transform',
    'type',
    'meter',
    'slot',
    'publish',
    'enchant',
  ] as Action['kind'][])('resolves %s with observable behavior', (kind) => {
    const r = rig();
    const item = r.source;
    const actions: Partial<Record<Action['kind'], Action>> = {
      shield: { kind, target: { side: 'owner' } },
      status: { kind, target: { side: 'enemy' }, status: 'poison' },
      cleanse: { kind, target: { side: 'owner' }, statuses: ['poison'], mode: 'all' },
      modify: { kind, target: { side: 'self' }, attribute: 'damage', scope: 'permanent' },
      flying: { kind, target: { side: 'self' }, value: true },
      destroy: { kind, target: { side: 'self' } },
      repair: { kind, target: { side: 'self' } },
      transform: { kind, target: { side: 'self' }, pool: 'neutral' },
      type: { kind, target: { side: 'self' }, value: 'Aquatic' },
      meter: { kind, target: { side: 'owner' }, attribute: 'tempo' },
      slot: { kind, target: { side: 'self' }, attribute: 'heated', value: true },
      publish: { kind, target: { side: 'owner' }, event: 'custom.signal' },
      enchant: { kind, target: { side: 'self' }, value: 'cinder' },
    };
    r.owner.poison = 12;
    if (kind === 'repair') item.destroyed = true;
    const action = actions[kind]!;
    r.machine.apply(
      item,
      ['shield', 'cleanse', 'meter', 'publish'].includes(kind) ? r.owner : kind === 'status' ? r.enemy : item,
      action,
      10,
    );
    expect(r.machine.events.length).toBeGreaterThan(0);
    if (kind === 'shield') expect(r.owner.shield).toBe(10);
    if (kind === 'status') expect(r.enemy.poison).toBe(10);
    if (kind === 'cleanse') expect(r.owner.poison).toBe(0);
    if (kind === 'modify') expect(item.modifiers[0].value).toBe(10);
    if (kind === 'flying') expect(item.flying).toBe(true);
    if (kind === 'destroy') expect(item.destroyed).toBe(true);
    if (kind === 'repair') expect(item.destroyed).toBe(false);
    if (kind === 'transform') expect(item.generation).toBe(1);
    if (kind === 'type') expect(traits(content, item).types).toContain('Aquatic');
    if (kind === 'meter') expect(r.owner.meters.tempo).toBe(10);
    if (kind === 'slot') expect(r.owner.slots['0:heated']).toBe('true');
    if (kind === 'enchant') expect(traits(content, item).capabilities).toContain('Burn');
  });
  it('Flying halves Slow/Freeze and changes idempotently', () => {
    const r = rig();
    r.machine.apply(r.source, r.source, { kind: 'flying', target: { side: 'self' }, value: true }, 0);
    r.machine.apply(r.source, r.source, { kind: 'flying', target: { side: 'self' }, value: true }, 0);
    r.machine.apply(r.source, r.source, { kind: 'status', target: { side: 'self' }, status: 'freeze' }, 901);
    expect(r.source.statuses.freeze).toBe(450);
    expect(r.machine.events.filter((e) => e.kind === 'flying.started')).toHaveLength(1);
  });
  it('absorption and target exclusion are distinct policies', () => {
    const r = rig();
    r.source.enchantment = 'sheltered';
    r.machine.apply(r.source, r.source, { kind: 'destroy', target: { side: 'self' } }, 0);
    expect(r.source.destroyed).toBe(false);
    expect(select(r.ctx, { side: 'allyItems', excludeProtected: 'destroy' })).not.toContain(r.source);
    expect(r.machine.events.at(-1)?.kind).toBe('effect.absorbed');
  });
  it('Lifesteal counts actual shield plus health damage without cleansing', () => {
    const r = rig(['velvet-leech']);
    r.owner.health = 250;
    r.owner.burn = 20;
    r.enemy.shield = 10;
    r.machine.apply(r.source, r.enemy, { kind: 'damage', target: { side: 'enemy' } }, 20);
    expect(r.owner.health).toBe(270);
    expect(r.owner.burn).toBe(20);
  });
  it('offers a death-prevention window and commits afterward', () => {
    const r = rig(['return-token']);
    r.machine.apply(r.source, r.owner, { kind: 'damage', target: { side: 'owner' } }, 320);
    r.machine.drain(true);
    expect(r.owner.health).toBe(35);
    expect(r.state.outcome).toBe('ongoing');
    expect(r.machine.events.some((e) => e.kind === 'death.prevented')).toBe(true);
  });
  it('protects cycles with a diagnostic result', () => {
    const c = clone(content);
    c.rules.maxDepth = 10;
    c.definitions.find((d) => d.id === 'moss-jar')!.abilities = [
      {
        id: 'start',
        locations: ['board'],
        trigger: { event: 'combat.start' },
        actions: [{ kind: 'publish', target: { side: 'owner' }, event: 'loop' }],
      },
      {
        id: 'loop',
        locations: ['board'],
        trigger: { event: 'loop' },
        actions: [{ kind: 'publish', target: { side: 'owner' }, event: 'loop' }],
      },
    ];
    const r = simulate(c, [snapshot('a', 'A', ['moss-jar']), snapshot('b', 'B', [])], 'loop');
    expect(r.replay.final.outcome).toBe('error');
    expect(r.replay.final.error).toContain('Event safety limit');
  });
});
