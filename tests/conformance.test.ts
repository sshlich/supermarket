import { describe, expect, it } from 'vitest';
import { content, instance, snapshot } from '../packages/content';
import { canonical, clone, hash } from '../packages/sim/src/determinism';
import { makeCombatState, RulesMachine, simulate } from '../packages/sim/src/combat';
import { attribute, evaluate, matches, select, traits } from '../packages/sim/src/evaluate';
import { commandOptions, dispatch, loadRun, newRun, saveRun } from '../packages/sim/src/run';
import { playRun } from '../scripts/play-run';
import type { Ability, Action, Run, Selector, SimEvent } from '../packages/sim/src/model';

function setup(ids = ['rivet-lance', 'bitter-vial', 'warm-coil', 'echo-anvil']) {
  const state = makeCombatState(
    content,
    [snapshot('a', 'A', ids, 400), snapshot('b', 'B', ['winter-fan', 'folding-buckler'], 400)],
    'conformance',
  );
  const machine = new RulesMachine(content, state),
    source = state.entities[0],
    ctx = { content, state, source };
  return { state, machine, source, ctx };
}
describe('selector and expression conformance', () => {
  it.each([
    [{ side: 'self' }, ['p0:a-0']],
    [{ side: 'owner' }, ['p0']],
    [{ side: 'enemy' }, ['p1']],
    [{ side: 'allyItems', other: true }, ['p0:a-1', 'p0:a-2', 'p0:a-3']],
    [{ side: 'allyItems', spatial: 'leftmost' }, ['p0:a-0']],
    [{ side: 'allyItems', spatial: 'rightmost' }, ['p0:a-3']],
    [{ side: 'allyItems', filters: [{ field: 'size', compare: 'gte', value: 2 }] }, ['p0:a-0', 'p0:a-3']],
    [{ side: 'allyItems', filters: [{ field: 'relativeSize', compare: 'lt' }] }, ['p0:a-1', 'p0:a-2']],
    [{ side: 'allyItems', filters: [{ field: 'type', value: 'Weapon', not: true }] }, ['p0:a-1', 'p0:a-2']],
    [{ side: 'allyItems', filters: [{ field: 'capability', value: 'Burn' }] }, []],
    [{ side: 'allyItems', filters: [{ field: 'reference', value: 'BurnReference' }] }, ['p0:a-2']],
    [{ side: 'allyItems', order: 'highest', attribute: 'damage', count: 1 }, ['p0:a-0']],
    [{ side: 'allyItems', order: 'lowest', attribute: 'damage', count: 1 }, ['p0:a-1']],
  ] as [Selector, string[]][])('selects %j', (selector, expected) => {
    const r = setup();
    expect(select(r.ctx, selector).map((t) => t.id)).toEqual(expected);
  });
  it('selects event source, event recipients and previous target sets', () => {
    const r = setup(),
      event: SimEvent = {
        id: 1,
        time: 0,
        kind: 'sample',
        sourceId: 'p1:b-0',
        ownerId: 'p1',
        targets: ['p0:a-1'],
        parent: null,
        batch: null,
        depth: 0,
        payload: { amount: 9 },
        hash: '',
      };
    expect(select({ ...r.ctx, event }, { side: 'eventSource' }).map((t) => t.id)).toEqual(['p1:b-0']);
    expect(select({ ...r.ctx, event }, { side: 'eventTargets' }).map((t) => t.id)).toEqual(['p0:a-1']);
    expect(select({ ...r.ctx, previous: [r.source] }, { side: 'previous' })).toEqual([r.source]);
    expect(evaluate({ ...r.ctx, event }, { ref: 'event', key: 'amount' })).toBe(9);
  });
  it('separates ammo eligibility from timer capability and statuses', () => {
    const r = setup(),
      vial = r.state.entities[1];
    expect(matches(r.ctx, vial, { field: 'ammo', value: 'full' })).toBe(true);
    vial.ammo = 0;
    expect(matches(r.ctx, vial, { field: 'ammo', value: 'empty' })).toBe(true);
    expect(matches(r.ctx, vial, { field: 'ammo', value: 'notFull' })).toBe(true);
    expect(matches(r.ctx, vial, { field: 'cooldown' })).toBe(true);
    vial.statuses.haste = 500;
    expect(matches(r.ctx, vial, { field: 'status', key: 'haste' })).toBe(true);
  });
  it('keeps expression evaluation pure, handles all operators and rejects unsafe arithmetic', () => {
    const r = setup(),
      before = hash(r.state);
    expect(
      evaluate(r.ctx, {
        op: 'max',
        args: [
          { op: 'min', args: [8, 3] },
          { op: 'sub', args: [10, 4] },
        ],
      }),
    ).toBe(6);
    expect(evaluate(r.ctx, { op: 'mul', args: [3, 4] })).toBe(12);
    expect(evaluate(r.ctx, { ref: 'tier', key: 'damage' })).toBe(16);
    expect(hash(r.state)).toBe(before);
    expect(() => evaluate(r.ctx, { op: 'div', args: [2, 0] })).toThrow();
    expect(() => evaluate(r.ctx, { op: 'mul', args: [100000000, 100000000] })).toThrow('overflow');
    expect(() => evaluate(r.ctx, { count: { side: 'allyItems', order: 'random' } })).toThrow('randomness');
  });
  it('recomputes capability and type layers through enchantment, destroy and repair', () => {
    const r = setup();
    r.source.enchantment = 'cinder';
    expect(traits(content, r.source).capabilities).toContain('Burn');
    r.machine.apply(r.source, r.source, { kind: 'type', target: { side: 'self' }, value: 'Aquatic' }, 0);
    expect(traits(content, r.source).types).toContain('Aquatic');
    r.machine.apply(r.source, r.source, { kind: 'destroy', target: { side: 'self' } }, 0);
    expect(traits(content, r.source).capabilities).toEqual([]);
    r.machine.apply(r.source, r.source, { kind: 'repair', target: { side: 'self' } }, 0);
    expect(traits(content, r.source).capabilities).toContain('Burn');
    r.machine.apply(
      r.source,
      r.source,
      { kind: 'type', target: { side: 'self' }, value: 'Aquatic', mode: 'all' },
      0,
    );
    expect(traits(content, r.source).types).not.toContain('Aquatic');
  });
});
describe('timing, scopes, and trigger conformance', () => {
  it('Reload immediately queues a charged empty item with causal ancestry, even before advancing time', () => {
    const r = setup(['bitter-vial']);
    r.source.ammo = 0;
    r.machine.advance(3100);
    r.machine.apply(r.source, r.source, { kind: 'reload', target: { side: 'self' }, amount: 1 }, 1);
    expect(r.state.queue.find((q) => q.kind === 'cast')?.time).toBe(3100);
    const ready = r.machine.events.find((e) => e.kind === 'timer.ready')!;
    expect(r.machine.events.find((e) => e.id === ready.parent)?.kind).toBe('ammo.reloaded');
  });
  it('a frozen, fully charged item retains ammo and starts at exact expiry', () => {
    const r = setup(['bitter-vial']);
    r.source.ammo = 0;
    r.machine.advance(3100);
    r.machine.apply(r.source, r.source, { kind: 'status', target: { side: 'self' }, status: 'freeze' }, 1000);
    r.machine.apply(r.source, r.source, { kind: 'reload', target: { side: 'self' }, amount: 1 }, 1);
    expect(r.state.queue.filter((q) => q.kind === 'cast')).toHaveLength(0);
    expect(r.source.progress).toBe(6200);
    r.machine.advance(4100);
    r.machine.drain(true);
    expect(r.machine.events.find((e) => e.kind === 'use.started')?.time).toBe(4100);
  });
  it('forced use respects resource, freeze, and destroy gates', () => {
    for (const gate of ['ammo', 'freeze', 'destroy']) {
      const r = setup(['bitter-vial']);
      if (gate === 'ammo') r.source.ammo = 0;
      if (gate === 'freeze') r.source.statuses.freeze = 1000;
      if (gate === 'destroy') r.source.destroyed = true;
      r.machine.apply(r.source, r.source, { kind: 'forceUse', target: { side: 'self' } }, 0);
      r.machine.drain(true);
      expect(r.machine.events.some((e) => e.kind === 'item.used')).toBe(false);
      expect(r.machine.events.some((e) => e.kind === 'cast.failed')).toBe(true);
    }
  });
  it('shortening cooldown below accumulated progress queues activation at the same timestamp', () => {
    const r = setup(['rivet-lance']);
    r.machine.advance(2000);
    r.machine.apply(
      r.source,
      r.source,
      { kind: 'modify', target: { side: 'self' }, attribute: 'cooldown', scope: 'combat', op: 'add' },
      -1000,
    );
    expect(r.state.queue.find((t) => t.kind === 'cast')?.time).toBe(2000);
  });
  it('resets combat and timed modifiers while explicitly permanent ones survive save/load', () => {
    const c = clone(content),
      def = c.definitions.find((d) => d.id === 'rivet-lance')!;
    def.abilities.push({
      id: 'scopes',
      locations: ['board'],
      trigger: { event: 'combat.start' },
      actions: [
        { kind: 'modify', target: { side: 'self' }, attribute: 'damage', amount: 3, scope: 'permanent' },
        { kind: 'modify', target: { side: 'self' }, attribute: 'damage', amount: 70, scope: 'combat' },
        { kind: 'type', target: { side: 'self' }, value: 'Aquatic', scope: 'permanent' },
        { kind: 'modify', target: { side: 'owner' }, attribute: 'maxHealth', amount: 12, scope: 'run' },
        { kind: 'resource', target: { side: 'owner' }, attribute: 'gold', amount: 4, scope: 'run' },
      ],
    });
    let run = dispatch(c, newRun(c, 'persistence'), {
      version: 1,
      revision: 0,
      type: 'start',
      choice: 'economy',
    }).state;
    run.hour = 2;
    run.candidates = ['monster-0-0'];
    run.activeOpponent = 'monster-0-0';
    const before = { health: run.maxHealth, gold: run.gold };
    run = dispatch(c, run, { version: 1, revision: run.revision, type: 'fight' }).state;
    run = loadRun(c, saveRun(c, run));
    expect(run.items[0].modifiers.map((m) => m.value)).toEqual([3]);
    expect(run.items[0].addedTypes).toContain('Aquatic');
    expect(run.maxHealth).toBe(before.health + 12);
    expect(run.gold).toBe(before.gold + 4);
    const r = setup(['rivet-lance']);
    r.machine.apply(
      r.source,
      r.source,
      { kind: 'modify', target: { side: 'self' }, attribute: 'damage', scope: 'timed', duration: 500 },
      8,
    );
    expect(attribute(r.ctx, r.source, 'damage').value).toBe(24);
    r.machine.advance(500);
    expect(attribute(r.ctx, r.source, 'damage').value).toBe(16);
    expect(r.machine.events.some((e) => e.kind === 'modifier.expired')).toBe(true);
  });
  it('activation-scoped mutations expire when the cast completes', () => {
    const c = clone(content),
      def = c.definitions.find((d) => d.id === 'rivet-lance')!;
    def.abilities[0].actions.unshift({
      kind: 'modify',
      target: { side: 'self' },
      attribute: 'damage',
      amount: 10,
      scope: 'activation',
    });
    const result = simulate(c, [snapshot('a', 'A', ['rivet-lance']), snapshot('b', 'B', [])], 'activation');
    expect(
      result.replay.events
        .filter((e) => e.kind === 'damage.dealt' && e.sourceId === 'p0:a-0')
        .map((e) => e.payload.attempted)
        .every((v) => v === 26),
    ).toBe(true);
    expect(result.replay.final.entities[0].runtime).toEqual([]);
  });
  it('skills and item auras modify max Health before combat and disappear on Destroy', () => {
    const c = clone(content);
    c.definitions.find((d) => d.id === 'moss-jar')!.auras = [
      {
        id: 'vitality',
        locations: ['board'],
        target: { side: 'owner' },
        attribute: 'maxHealth',
        op: 'add',
        value: 40,
      },
    ];
    const state = makeCombatState(
        c,
        [snapshot('a', 'A', ['moss-jar'], 100), snapshot('b', 'B', [], 100)],
        'hp',
      ),
      machine = new RulesMachine(c, state),
      source = state.entities[0];
    expect(state.players[0].health).toBe(140);
    machine.apply(source, source, { kind: 'destroy', target: { side: 'self' } }, 0);
    expect(state.players[0].maxHealth).toBe(100);
    expect(state.players[0].health).toBe(100);
  });
  it('records condition operands and enforces first-N, every-N, batch limits and internal cooldowns', () => {
    const c = clone(content),
      a: Ability = {
        id: 'bounded',
        locations: ['board'],
        trigger: { event: 'test', relation: 'owner', every: 2, first: 2, oncePer: 'batch' },
        internalCooldown: 1000,
        conditions: [{ left: { ref: 'event', key: 'amount' }, op: 'gte', right: 5 }],
        actions: [{ kind: 'shield', target: { side: 'owner' }, amount: 2 }],
      };
    c.definitions.find((d) => d.id === 'moss-jar')!.abilities = [a];
    const state = makeCombatState(
        c,
        [snapshot('a', 'A', ['moss-jar']), snapshot('b', 'B', [])],
        'qualifiers',
      ),
      machine = new RulesMachine(c, state);
    for (let n = 0; n < 8; n++) {
      machine.emit('test', state.entities[0].id, [], { amount: n < 2 ? 1 : 8 });
      machine.drain(true);
    }
    expect(state.players[0].shield).toBe(2);
    expect(
      machine.events.some((e) => e.kind === 'ability.failed' && e.payload.reason === 'internal cooldown'),
    ).toBe(true);
    const failure = machine.events.find(
      (e) => e.kind === 'ability.failed' && e.payload.reason === 'condition failed',
    );
    expect(failure?.payload.conditions).toContain('"left":1');
    state.time = 1000;
    for (let n = 0; n < 4; n++) {
      machine.emit('test', state.entities[0].id, [], { amount: 8 });
      machine.drain(true);
    }
    expect(state.players[0].shield).toBe(4);
  });
  it('bounds event count per timestamp independently of depth', () => {
    const c = clone(content);
    c.rules.maxEventsPerTime = 8;
    const result = simulate(c, [snapshot('a', 'A', ['echo-anvil']), snapshot('b', 'B', [])], 'limit');
    expect(result.replay.final.outcome).toBe('error');
    expect(result.replay.final.error).toContain('Event safety limit');
  });
  it.each(['batch', 'parent'] as const)('limits reactions once per %s', (oncePer) => {
    const c = clone(content);
    c.definitions.find((d) => d.id === 'moss-jar')!.abilities = [
      {
        id: 'once',
        locations: ['board'],
        trigger: { event: 'test', oncePer },
        actions: [{ kind: 'shield', target: { side: 'owner' }, amount: 3 }],
      },
    ];
    const state = makeCombatState(c, [snapshot('a', 'A', ['moss-jar']), snapshot('b', 'B', [])], 'once'),
      machine = new RulesMachine(c, state);
    for (let id = 1; id <= 2; id++)
      machine.schedule({
        kind: 'signal',
        sourceId: state.entities[0].id,
        phase: 5,
        event: {
          id,
          time: 0,
          kind: 'test',
          sourceId: state.entities[0].id,
          ownerId: 'p0',
          targets: [],
          parent: 75,
          batch: 80,
          depth: 0,
          payload: {},
          hash: '',
        },
      });
    machine.drain(true);
    expect(state.players[0].shield).toBe(3);
    expect(machine.events.some((e) => String(e.payload.reason).includes('already used'))).toBe(true);
  });
  it('publishes quest completion before unlocking rewards, without reusing the completing event', () => {
    const c = clone(content);
    c.definitions.find((d) => d.id === 'moss-jar')!.abilities = [
      {
        id: 'quest',
        locations: ['board'],
        trigger: { event: 'test' },
        quest: { required: 1, scope: 'combat' },
        actions: [
          { kind: 'modify', target: { side: 'self' }, attribute: 'unlocked', amount: 1, scope: 'combat' },
        ],
      },
      {
        id: 'reward',
        locations: ['board'],
        trigger: { event: 'test' },
        conditions: [{ left: { ref: 'source', key: 'unlocked' }, op: 'gte', right: 1 }],
        actions: [{ kind: 'shield', target: { side: 'owner' }, amount: 7 }],
      },
    ];
    const state = makeCombatState(c, [snapshot('a', 'A', ['moss-jar']), snapshot('b', 'B', [])], 'quest'),
      machine = new RulesMachine(c, state);
    machine.emit('test', state.entities[0].id);
    machine.drain(true);
    expect(state.players[0].shield).toBe(0);
    const kinds = machine.events.map((e) => e.kind);
    expect(kinds.indexOf('quest.completed')).toBeLessThan(kinds.indexOf('attribute.modified'));
    machine.emit('test', state.entities[0].id);
    machine.drain(true);
    expect(state.players[0].shield).toBe(7);
  });
  it('has a deterministic timeout tie and escalating storm', () => {
    const c = clone(content);
    c.rules.timeout = 32000;
    c.rules.stormBase = 1;
    c.rules.stormStep = 1;
    const result = simulate(
      c,
      [snapshot('a', 'A', [], 1000), snapshot('b', 'B', [], 1000)],
      'timeout',
    ).replay;
    expect(result.final.outcome).toBe('draw');
    expect(result.events.filter((e) => e.kind === 'sandstorm.ticked').map((e) => e.payload.amount)).toEqual([
      1, 2, 3,
    ]);
    expect(result.events.at(-1)?.kind).toBe('combat.timeout');
  });
  it('applies the configured storm cap and mitigation policy', () => {
    for (const mitigation of ['bypass', 'shield'] as const) {
      const c = clone(content);
      Object.assign(c.rules, {
        stormStart: 500,
        stormBase: 10,
        stormStep: 10,
        stormCap: 15,
        stormMitigation: mitigation,
        timeout: 2500,
      });
      c.definitions.find((d) => d.id === 'rivet-lance')!.abilities = [
        {
          id: 'initial-shield',
          locations: ['board'],
          trigger: { event: 'combat.start' },
          actions: [{ kind: 'shield', target: { side: 'owner' }, amount: 50 }],
        },
      ];
      const result = simulate(
        c,
        [snapshot('a', 'A', ['rivet-lance'], 100), snapshot('b', 'B', [], 100)],
        'storm',
      ).replay;
      expect(result.events.filter((e) => e.kind === 'sandstorm.ticked').map((e) => e.payload.amount)).toEqual(
        [10, 15, 15],
      );
      expect(result.final.players[0].health).toBe(mitigation === 'shield' ? 100 : 60);
      expect(result.final.players[0].shield).toBe(mitigation === 'shield' ? 10 : 50);
      expect(result.final.players[1].health).toBe(60);
    }
  });
  it('resolves timeout by the declared policy, with equal-health ties remaining draws', () => {
    for (const [policy, left, right, outcome] of [
      ['draw', 100, 200, 'draw'],
      ['highestHealth', 200, 100, 'p0'],
      ['highestHealth', 100, 200, 'p1'],
      ['highestHealth', 100, 100, 'draw'],
    ] as const) {
      const c = clone(content);
      Object.assign(c.rules, { timeoutPolicy: policy, stormStart: 500, stormCap: 0, timeout: 1000 });
      const result = simulate(
        c,
        [snapshot('a', 'A', [], left), snapshot('b', 'B', [], right)],
        'timeout-policy',
      ).replay;
      expect(result.final.outcome).toBe(outcome);
      expect(result.events.at(-1)?.payload.outcome).toBe(outcome);
    }
  });
  it('starts an early storm at the next future checkpoint, including requests exactly on a tick', () => {
    for (const requestedAt of [0, 12000]) {
      const c = clone(content);
      Object.assign(c.rules, { stormStart: 13000, timeout: 14000 });
      if (!requestedAt)
        c.definitions.find((d) => d.id === 'sand-hourglass')!.abilities = [
          {
            id: 'early-storm',
            locations: ['board'],
            trigger: { event: 'combat.start' },
            actions: [{ kind: 'publish', event: 'sandstorm.start', target: { side: 'owner' } }],
          },
        ];
      const result = simulate(
        c,
        [snapshot('a', 'A', ['sand-hourglass'], 1000), snapshot('b', 'B', [], 1000)],
        'early-storm',
      ).replay;
      expect(result.events.filter((e) => e.kind === 'sandstorm.started').map((e) => e.time)).toEqual([
        requestedAt + 500,
      ]);
      const firstTick = result.events.find((e) => e.kind === 'sandstorm.ticked')!;
      expect(firstTick.time).toBe(requestedAt + 500);
      expect(firstTick.payload.amount).toBe(c.rules.stormBase);
    }
  });
});
describe('run conformance', () => {
  it('combines player aura modifiers by operation rather than source array order', () => {
    const c = clone(content);
    c.definitions.find((d) => d.id === 'moss-jar')!.auras = [
      {
        id: 'flat',
        locations: ['board'],
        target: { side: 'owner' },
        attribute: 'maxHealth',
        op: 'add',
        value: 40,
      },
    ];
    c.definitions.find((d) => d.id === 'return-token')!.auras = [
      {
        id: 'percent',
        locations: ['board'],
        target: { side: 'owner' },
        attribute: 'maxHealth',
        op: 'percent',
        value: 5000,
      },
    ];
    const a = snapshot('a', 'A', ['moss-jar', 'return-token'], 100),
      b = clone(a);
    b.items.reverse();
    expect(makeCombatState(c, [a, snapshot('b', 'B', [])], 'auras').players[0].maxHealth).toBe(210);
    expect(makeCombatState(c, [b, snapshot('b', 'B', [])], 'auras').players[0].maxHealth).toBe(210);
  });
  it('produces identical shop offers after content dictionary keys are canonicalized', () => {
    const sorted = JSON.parse(canonical(content)) as typeof content;
    const run = dispatch(content, newRun(content, 'shop-key-order'), {
      version: 1,
      revision: 0,
      type: 'start',
      choice: 'economy',
    }).state;
    run.candidates = ['open-stalls'];
    run.gold = 99;
    const a = dispatch(content, run, {
      version: 1,
      revision: run.revision,
      type: 'select',
      id: 'open-stalls',
    }).state;
    const b = dispatch(sorted, run, {
      version: 1,
      revision: run.revision,
      type: 'select',
      id: 'open-stalls',
    }).state;
    expect(a).toEqual(b);
    for (let i = 0; i < 8; i++) {
      const ra = dispatch(content, a, { version: 1, revision: a.revision, type: 'reroll' }).state;
      const rb = dispatch(sorted, b, { version: 1, revision: b.revision, type: 'reroll' }).state;
      expect(ra).toEqual(rb);
      Object.assign(a, ra);
      Object.assign(b, rb);
    }
  });
  it('reaches ten wins from an unmodified normal start using only commands', () => {
    const result = playRun('lantern-47');
    expect(result.phase).toBe('victory');
    expect(result.wins).toBe(10);
    expect(result.day).toBe(10);
  }, 30000);
  it('resolves run-only Generate, Resource and Upgrade through the shared ability vocabulary', () => {
    const c = clone(content);
    c.pools.test = ['bitter-vial'];
    const def = c.definitions.find((d) => d.id === 'copper-ledger')!;
    const actions: Action[] = [
      { kind: 'resource', target: { side: 'owner' }, attribute: 'income', amount: 1 },
      { kind: 'generate', target: { side: 'owner' }, pool: 'test' },
      { kind: 'upgrade', target: { side: 'self' } },
    ];
    def.abilities = [
      {
        id: 'run-verbs',
        trigger: { event: 'merchant.visited', relation: 'owner', scope: 'run' },
        locations: ['stash'],
        actions,
      },
    ];
    let run = dispatch(c, newRun(c, 'runverbs'), {
      version: 1,
      revision: 0,
      type: 'start',
      choice: 'economy',
    }).state;
    run.items.push(
      instance(def.id, 'ledger', 0, 'bronze', 'stash'),
      instance('bitter-vial', 'original-vial', 2),
    );
    run.candidates = ['open-stalls'];
    const income = run.income;
    run = dispatch(c, run, { version: 1, revision: run.revision, type: 'select', id: 'open-stalls' }).state;
    expect(run.income).toBe(income + 1);
    expect(run.items.some((i) => i.defId === 'bitter-vial' && i.provenance === 'generated')).toBe(true);
    expect(run.items.find((i) => i.id === 'ledger')?.tier).toBe('silver');
    expect(run.items.filter((i) => i.defId === 'bitter-vial')).toHaveLength(2);
    expect(
      run.log.find((e) => e.kind === 'item.generated' && e.payload.definition === 'bitter-vial')?.ownerId,
    ).toBe('p0');
  });
  it('keeps Legendary separate from the standard upgrade chain', () => {
    const initial = snapshot('a', 'A', [], 200);
    initial.items = [instance('sealed-star', 'legend', 0, 'legendary')];
    const result = simulate(content, [initial, snapshot('b', 'B', ['rivet-lance'], 100)], 'legend').replay;
    expect(
      result.events.find((e) => e.kind === 'damage.dealt' && e.sourceId === 'p0:legend')?.payload.attempted,
    ).toBe(56);
    expect(result.final.outcome).toBe('p0');
  });
  it('excludes max-tier reward duplicates and supports swaps without temporary space', () => {
    let run = dispatch(content, newRun(content, 'swap'), {
      version: 1,
      revision: 0,
      type: 'start',
      choice: 'economy',
    }).state;
    run.items[0].tier = 'diamond';
    run.items.push(instance('tea-tray', 'tea', 2));
    run = dispatch(content, run, {
      version: 1,
      revision: run.revision,
      type: 'move',
      item: run.items[0].id,
      location: 'board',
      position: 2,
    }).state;
    expect(run.items.find((i) => i.id === 'tea')?.position).toBe(0);
    run.phase = 'choice';
    run.pending = [
      {
        reason: 'fixture',
        rewards: [
          { id: 'duplicate', label: 'duplicate', text: '', item: 'rivet-lance' },
          { id: 'cash', label: 'cash', text: '', gold: 1 },
        ],
      },
    ];
    expect(commandOptions(content, run).map((r) => r.id)).toEqual(['cash']);
  });
  it('resets day-scoped modifiers and counters at the day boundary', () => {
    let run: Run = dispatch(content, newRun(content, 'day'), {
      version: 1,
      revision: 0,
      type: 'start',
      choice: 'economy',
    }).state;
    run.items[0].modifiers.push({
      id: 'day',
      sourceId: 'test',
      attribute: 'sell',
      value: 20,
      op: 'add',
      scope: 'day',
    });
    run.skills.push({
      ...instance('field-notes', 'notes', 0, 'bronze', 'skills'),
      memory: { notes: { seen: 8, fired: 2, last: 0, keys: [], progress: 0, completed: false } },
    });
    run.hour = 5;
    run.phase = 'choice';
    run.pending = [{ reason: 'Level 4', rewards: [{ id: 'cash', label: 'cash', text: '', gold: 1 }] }];
    run.afterChoices = 'advance';
    run = dispatch(content, run, {
      version: 1,
      revision: run.revision,
      type: 'choose',
      choice: 'cash',
    }).state;
    expect(run.day).toBe(2);
    expect(run.items[0].modifiers).toEqual([]);
    expect(run.skills[0].memory.notes.fired).toBe(0);
  });
});
