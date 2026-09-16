import type {
  Ability,
  AbilityMemory,
  Action,
  CombatFrame,
  CombatResult,
  CombatState,
  Content,
  Entity,
  Fighter,
  Instance,
  Modifier,
  Payload,
  SimEvent,
  Snapshot,
  Task,
} from './model';
import { canonical, clone, enqueue, hash, roll } from './determinism';
import { definition, validateGeometry } from './geometry';
import {
  abilities,
  attribute,
  compare,
  evaluate,
  isEntity,
  matches,
  select,
  traits,
  type EvalContext,
  type Target,
} from './evaluate';

export const freshMemory = (): AbilityMemory => ({
  seen: 0,
  fired: 0,
  last: -100000000,
  keys: [],
  progress: 0,
  completed: false,
});
export function entityFrom(instance: Instance, owner: string): Entity {
  return {
    ...clone(instance),
    owner,
    progress: 0,
    ammo: null,
    destroyed: false,
    flying: false,
    statuses: {},
    runtime: [],
    generation: 0,
  };
}
export function makeCombatState(
  content: Content,
  snapshots: [Snapshot, Snapshot],
  seed: string,
): CombatState {
  const state: CombatState = {
    version: 1,
    contentVersion: content.contentVersion,
    seed,
    time: 0,
    players: [],
    entities: [],
    rng: {},
    queue: [],
    nextSeq: 1,
    nextEvent: 1,
    outcome: 'ongoing',
    error: null,
    stormStart: content.rules.stormStart,
    processed: 0,
    persistent: [],
  };
  snapshots.forEach((snapshot, index) => {
    if (snapshot.version !== 1 || snapshot.contentVersion !== content.contentVersion)
      throw new Error('Incompatible snapshot version');
    validateGeometry(content, snapshot.items, snapshot.capacity, content.rules.stashCapacity);
    const owner = `p${index}`;
    state.players.push({
      id: owner,
      name: snapshot.name,
      health: snapshot.maxHealth,
      baseMaxHealth: snapshot.maxHealth,
      maxHealth: snapshot.maxHealth,
      shield: 0,
      burn: 0,
      poison: 0,
      regen: snapshot.regen,
      meters: {},
      counters: clone(snapshot.counters),
      slots: {},
      modifiers: [],
      capacity: snapshot.capacity,
    });
    for (const item of [...snapshot.items, ...snapshot.skills]) {
      const def = definition(content, item.defId);
      if (!def.tiers[item.tier]) throw new Error(`Unsupported tier ${item.defId}/${item.tier}`);
      if (item.enchantment && !def.enchantments[item.enchantment]) throw new Error('Unsupported enchantment');
      const entity = entityFrom(item, owner);
      entity.id = `${owner}:${item.id}`;
      // Only durable layers may cross the snapshot boundary.
      entity.modifiers = entity.modifiers.filter((m) => ['permanent', 'day', 'run'].includes(m.scope));
      for (const ability of abilities(content, entity)) {
        if ((ability.trigger.scope ?? 'combat') === 'combat') entity.memory[ability.id] = freshMemory();
      }
      state.entities.push(entity);
    }
  });
  for (const entity of state.entities) {
    const ctx = { content, state, source: entity };
    const max = attribute(ctx, entity, 'ammo').value;
    entity.ammo = max > 0 || traits(content, entity).capabilities.includes('Ammo') ? max : null;
    entity.flying = attribute(ctx, entity, 'flying').value > 0;
  }
  for (const player of state.players) {
    const source = state.entities.find((e) => e.owner === player.id);
    if (source)
      player.health = player.maxHealth = Math.max(
        1,
        attribute({ content, state, source }, player, 'maxHealth').value,
      );
  }
  return state;
}

export interface MachineOptions {
  frames?: boolean;
  runMode?: boolean;
  onRunAction?: (action: Action, source: Entity, targets: Target[], amount: number) => void;
}
/** All mutation is confined to this owned clone. Public entry points never mutate caller state. */
export class RulesMachine {
  readonly events: SimEvent[] = [];
  readonly frames: CombatFrame[] = [];
  private current: Task | null = null;
  private parent: number | null = null;
  private batch: number | null = null;
  private depth = 0;
  private timeEvents = 0;
  private lastTime = -1;
  constructor(
    readonly content: Content,
    readonly state: CombatState,
    private options: MachineOptions = {},
  ) {}

  context(source: Entity, event?: SimEvent): EvalContext {
    return {
      content: this.content,
      state: this.state,
      source,
      event,
      trace: (kind, targets, payload) => {
        this.emit(kind, source.id, targets, payload, false);
      },
    };
  }
  private sourceOwner(id: string): string {
    return (
      this.state.entities.find((e) => e.id === id)?.owner ??
      this.state.players.find((p) => p.id === id)?.id ??
      ''
    );
  }
  emit(
    kind: string,
    sourceId: string,
    targets: string[] = [],
    payload: Payload = {},
    publish = true,
  ): SimEvent {
    if (this.state.time !== this.lastTime) {
      this.timeEvents = 0;
      this.lastTime = this.state.time;
    }
    if (
      ++this.timeEvents > this.content.rules.maxEventsPerTime ||
      this.events.length >= this.content.rules.maxEvents ||
      this.depth > this.content.rules.maxDepth
    ) {
      throw new Error(
        `Event safety limit at ${this.state.time}ms: ${kind}; depth=${this.depth}; source=${sourceId}; parent=${this.parent}`,
      );
    }
    const event: SimEvent = {
      id: this.state.nextEvent++,
      time: this.state.time,
      kind,
      sourceId,
      ownerId: this.sourceOwner(sourceId),
      targets,
      parent: this.parent,
      batch: this.batch,
      depth: this.depth,
      payload,
      hash: '',
    };
    if (publish)
      this.schedule({ kind: 'signal', sourceId, phase: 5, event, parent: event.id, depth: event.depth });
    event.hash = hash({
      time: this.state.time,
      players: this.state.players,
      entities: this.state.entities,
      rng: this.state.rng,
      nextEvent: this.state.nextEvent,
    });
    this.events.push(event);
    if (this.options.frames) this.frames.push(this.frame());
    return event;
  }
  frame(): CombatFrame {
    return clone({
      time: this.state.time,
      players: this.state.players,
      entities: this.state.entities,
      outcome: this.state.outcome,
    });
  }
  schedule(input: Pick<Task, 'kind' | 'sourceId' | 'phase'> & Partial<Task>): void {
    const source = this.state.entities.find((e) => e.id === input.sourceId);
    const task: Task = {
      seq: this.state.nextSeq++,
      time: this.state.time,
      priority: 0,
      owner: source?.owner === 'p1' ? 1 : 0,
      position: source?.location === 'skills' ? 100 + source.acquired : (source?.position ?? -1),
      parent: this.parent,
      batch: this.batch,
      depth: this.depth + 1,
      ...input,
    };
    enqueue(this.state.queue, task);
  }
  initialize(): void {
    this.emit('combat.setup', 'system', [], { seed: this.state.seed });
    this.emit('combat.start', 'system');
    this.schedule({ kind: 'tick', sourceId: 'system', phase: 10, time: 500, tick: 'periodic' });
  }
  drain(atTimeOnly = false): void {
    while (this.state.queue.length && this.state.outcome === 'ongoing') {
      const task = this.state.queue[0];
      if (atTimeOnly && task.time > this.state.time) break;
      if (task.time > this.state.time) this.advance(task.time);
      this.state.queue.shift();
      this.process(task);
    }
  }
  private process(task: Task): void {
    this.current = task;
    this.parent = task.parent;
    this.batch = task.batch;
    this.depth = task.depth;
    if (++this.state.processed > this.content.rules.maxEvents * 3) throw new Error('Task safety limit');
    const source = this.state.entities.find((e) => e.id === task.sourceId);
    if (task.kind === 'signal' && task.event) this.react(task.event);
    if (task.kind === 'ability' && source && task.ability && task.event) {
      if (task.generation !== undefined && task.generation !== source.generation)
        this.emit(
          'ability.failed',
          source.id,
          [],
          { ability: task.ability.id, reason: 'source generation changed' },
          false,
        );
      else this.resolveAbility(source, task.ability, task.event);
    }
    if (task.kind === 'questReward' && source && task.ability) {
      if (
        source.destroyed ||
        source.generation !== task.generation ||
        !task.ability.locations.includes(source.location)
      )
        this.emit(
          'ability.failed',
          source.id,
          [],
          { ability: task.ability.id, reason: 'quest reward source invalid' },
          false,
        );
      else {
        const fired = this.emit(
          'ability.fired',
          source.id,
          [],
          { ability: task.ability.id, trigger: 'quest.completed', reason: 'deferred quest reward' },
          false,
        );
        this.parent = fired.id;
        this.actions(source, task.ability.actions, task.event);
      }
    }
    if (task.kind === 'cast' && source) this.cast(source, task);
    if (task.kind === 'tick') this.tick();
    if (task.kind === 'death') this.commitDeath();
    this.current = null;
    this.parent = null;
    this.batch = null;
    this.depth = 0;
    if (!this.options.runMode) this.checkReady();
  }
  private react(event: SimEvent): void {
    for (const source of this.state.entities) {
      for (const ability of abilities(this.content, source)) {
        if (ability.trigger.event !== event.kind || event.kind === 'activate') continue;
        this.schedule({
          kind: 'ability',
          sourceId: source.id,
          phase: 20,
          priority: ability.priority ?? 0,
          ability,
          event,
          parent: event.id,
          depth: event.depth + 1,
          generation: source.generation,
        });
      }
    }
  }
  private resolveAbility(source: Entity, ability: Ability, event: SimEvent, crit = false): void {
    const ctx = this.context(source, event),
      trigger = ability.trigger;
    let reason = '';
    let questComplete = false;
    const conditionReport: { left: number; op: string; right: number; passed: boolean }[] = [];
    const origin = this.state.entities.find((e) => e.id === event.sourceId);
    if (!ability.locations.includes(source.location)) reason = 'source location is ineligible';
    else if (source.destroyed) reason = 'source is destroyed';
    else if (trigger.relation === 'self' && event.sourceId !== source.id) reason = 'requires this item';
    else if (
      trigger.relation === 'other' &&
      (event.sourceId === source.id || event.ownerId !== source.owner || !origin)
    )
      reason = 'requires another allied item';
    else if (trigger.relation === 'owner' && event.ownerId !== source.owner) reason = 'requires owner event';
    else if (trigger.relation === 'enemy' && (event.ownerId === source.owner || !event.ownerId))
      reason = 'requires enemy event';
    else if (trigger.source?.length && (!origin || trigger.source.some((p) => !matches(ctx, origin, p))))
      reason = 'trigger source predicate failed';
    const memory = (source.memory[ability.id] ??= freshMemory());
    if (!reason) {
      memory.seen++;
      if (trigger.first !== undefined && memory.fired >= trigger.first) reason = 'first-N use limit reached';
      else if (trigger.every && memory.seen % trigger.every !== 0)
        reason = `waiting for every ${trigger.every} events`;
      else if (this.state.time - memory.last < (ability.internalCooldown ?? 0)) reason = 'internal cooldown';
      else if (
        ability.conditions?.some((c) => {
          const left = evaluate(ctx, c.left),
            right = evaluate(ctx, c.right),
            passed = compare(left, c.op, right);
          conditionReport.push({ left, op: c.op, right, passed });
          return !passed;
        })
      )
        reason = 'condition failed';
      const key =
        trigger.oncePer === 'batch' ? `b${event.batch ?? event.id}` : `p${event.parent ?? event.id}`;
      if (!reason && trigger.oncePer && memory.keys.includes(key)) reason = `already used for ${key}`;
      if (!reason && trigger.oncePer) memory.keys.push(key);
    }
    if (!reason && ability.quest) {
      if (memory.completed && !ability.quest.repeatable) reason = 'quest already completed';
      else {
        memory.progress++;
        this.emit('quest.progressed', source.id, [source.id], {
          ability: ability.id,
          progress: memory.progress,
          required: ability.quest.required,
        });
        if (memory.progress < ability.quest.required) reason = 'quest needs more progress';
        else {
          memory.completed = true;
          memory.progress = ability.quest.repeatable
            ? ability.quest.overflow
              ? memory.progress - ability.quest.required
              : 0
            : ability.quest.required;
          this.emit('quest.completed', source.id, [source.id], { ability: ability.id });
          questComplete = true;
        }
      }
    }
    if (reason) {
      this.emit(
        'ability.failed',
        source.id,
        [],
        {
          ability: ability.id,
          trigger: event.kind,
          reason,
          conditions: canonical(conditionReport),
          seen: memory.seen,
          fired: memory.fired,
        },
        false,
      );
      return;
    }
    memory.fired++;
    memory.last = this.state.time;
    if (questComplete) {
      this.schedule({
        kind: 'questReward',
        sourceId: source.id,
        phase: 25,
        ability,
        event,
        generation: source.generation,
        parent: this.events.at(-1)?.id ?? event.id,
      });
      return;
    }
    const fired = this.emit(
      'ability.fired',
      source.id,
      [],
      {
        ability: ability.id,
        trigger: event.kind,
        reason: 'location, source, conditions and limits passed',
        conditions: canonical(conditionReport),
        seen: memory.seen,
        fired: memory.fired,
      },
      false,
    );
    this.parent = fired.id;
    this.depth++;
    this.actions(source, ability.actions, event, crit);
    if (event.kind !== 'activate')
      for (const e of this.state.entities) e.runtime = e.runtime.filter((m) => m.scope !== 'activation');
  }
  private cooldown(entity: Entity): number {
    return attribute(this.context(entity), entity, 'cooldown').value;
  }
  private rate(entity: Entity): number {
    if (entity.destroyed || (entity.statuses.freeze ?? 0) > this.state.time) return 0;
    return (
      ((entity.statuses.haste ?? 0) > this.state.time ? 4 : 2) /
      ((entity.statuses.slow ?? 0) > this.state.time ? 2 : 1)
    );
  }
  private eligible(entity: Entity, forced = false): string {
    if (entity.location !== 'board') return 'not on board';
    if (entity.destroyed) return 'destroyed';
    if ((entity.statuses.freeze ?? 0) > this.state.time) return 'frozen';
    if (entity.ammo !== null && entity.ammo <= 0) return 'zero ammo; charge retained';
    if (!forced && entity.progress < this.cooldown(entity) * 2) return 'timer not ready';
    return '';
  }
  private checkReady(): void {
    for (const entity of this.state.entities) {
      if (entity.location !== 'board' || this.cooldown(entity) <= 0 || this.eligible(entity)) continue;
      if (this.state.queue.some((q) => q.kind === 'cast' && q.sourceId === entity.id && !q.forced)) continue;
      const ready = this.emit('timer.ready', entity.id, [entity.id], {
        progress: entity.progress,
        cooldown: this.cooldown(entity),
        ammo: entity.ammo ?? -1,
      });
      this.schedule({
        kind: 'cast',
        sourceId: entity.id,
        phase: 30,
        cast: 0,
        generation: entity.generation,
        parent: ready.id,
        depth: ready.depth + 1,
      });
    }
  }
  nextTime(): number {
    let next = Math.min(this.state.queue[0]?.time ?? this.content.rules.timeout, this.content.rules.timeout);
    for (const e of this.state.entities) {
      for (const expires of Object.values(e.statuses))
        if (expires > this.state.time) next = Math.min(next, expires);
      for (const m of e.runtime)
        if (m.expires !== undefined && m.expires > this.state.time) next = Math.min(next, m.expires);
      if (e.location !== 'board' || e.destroyed) continue;
      const cd = this.cooldown(e),
        rate = this.rate(e);
      if (cd > 0 && rate > 0 && e.progress < cd * 2)
        next = Math.min(next, this.state.time + Math.ceil((cd * 2 - e.progress) / rate));
    }
    return next;
  }
  advance(time: number): void {
    if (time < this.state.time) throw new Error('Time moved backwards');
    const delta = time - this.state.time;
    const filled: Entity[] = [];
    for (const e of this.state.entities) {
      if (e.location === 'board' && !e.destroyed && this.cooldown(e) > 0) {
        const threshold = this.cooldown(e) * 2,
          before = e.progress;
        e.progress = Math.min(threshold, e.progress + delta * this.rate(e));
        if (before < threshold && e.progress >= threshold) filled.push(e);
      }
    }
    this.state.time = time;
    for (const e of this.state.entities) {
      for (const key of Object.keys(e.statuses).sort())
        if (e.statuses[key] <= time) {
          delete e.statuses[key];
          this.emit(`${key}.expired`, e.id, [e.id]);
        }
      for (const m of e.runtime.filter((m) => m.expires !== undefined && m.expires <= time))
        this.emit('modifier.expired', m.sourceId, [e.id], { attribute: m.attribute, modifier: m.id });
      e.runtime = e.runtime.filter((m) => m.expires === undefined || m.expires > time);
    }
    for (const p of this.state.players)
      if (p.meters.enrageUntil && p.meters.enrageUntil <= time) {
        delete p.meters.enrageUntil;
        this.emit('enrage.ended', p.id, [p.id]);
      }
    this.refreshMaxHealth();
    for (const e of filled)
      this.emit('timer.filled', e.id, [e.id], {
        progress: e.progress,
        resourceReady: e.ammo === null || e.ammo > 0,
        explanation: e.ammo === 0 ? 'Fully charged; waiting for Ammo' : 'Timer gate passed',
      });
    this.checkReady();
  }
  private cast(source: Entity, task: Task): void {
    if (task.generation !== source.generation) {
      this.emit('cast.failed', source.id, [], { reason: 'source generation changed' }, false);
      return;
    }
    const reason = this.eligible(source, task.forced || (task.cast ?? 0) > 0);
    if (reason) {
      this.emit('cast.failed', source.id, [], { reason }, false);
      return;
    }
    const ctx = this.context(source),
      cast = task.cast ?? 0;
    const total = task.totalCasts ?? Math.min(16, attribute(ctx, source, 'multicast').value);
    if (cast === 0) {
      this.batch = this.state.nextEvent;
      source.progress = 0;
    }
    const start = this.emit(cast === 0 ? 'use.started' : 'cast.started', source.id, [source.id], {
      cast,
      total,
      forced: task.forced ?? false,
    });
    this.parent = start.id;
    this.depth++;
    if (task.forced) this.emit('item.forcedUsed', source.id, [source.id]);
    // Resource gate is checked above; spend once at each cast's start, before its effects.
    if (source.ammo !== null) {
      source.ammo--;
      this.emit('ammo.spent', source.id, [source.id], { amount: 1, remaining: source.ammo });
      if (source.ammo === 0) this.emit('ammo.depleted', source.id, [source.id], { from: 1, to: 0 });
    }
    const chance = Math.min(10000, attribute(ctx, source, 'crit').value);
    const rng = roll(this.state.seed, this.state.rng, 'crit', 10000);
    const crit = rng.value < chance;
    this.emit(
      'rng',
      source.id,
      [source.id],
      { stream: 'crit', raw: rng.raw, roll: rng.value, chance, crit },
      false,
    );
    if (crit) this.emit('crit.occurred', source.id, [source.id], { cast });
    for (const ability of abilities(this.content, source).filter((a) => a.trigger.event === 'activate')) {
      this.resolveAbility(source, ability, { ...start, kind: 'activate' }, crit);
    }
    this.emit('cast.resolved', source.id, [source.id], { cast, total });
    this.emit('item.used', source.id, [source.id], {
      cast,
      total,
      size: definition(this.content, source.defId).size,
    });
    source.counters.uses = (source.counters.uses ?? 0) + 1;
    const player = this.state.players.find((p) => p.id === source.owner)!;
    if (player.meters.rageEnabled)
      this.gainMeter(player, 'rage', definition(this.content, source.defId).size * 9, source);
    for (const entity of this.state.entities)
      entity.runtime = entity.runtime.filter((m) => m.scope !== 'activation');
    if (cast + 1 < total)
      this.schedule({
        kind: 'cast',
        sourceId: source.id,
        phase: 30,
        time: this.state.time + this.content.rules.multicastInterval,
        cast: cast + 1,
        totalCasts: total,
        forced: task.forced ?? false,
        batch: this.batch,
        generation: source.generation,
        parent: start.id,
        depth: task.depth,
      });
    this.proposeDeaths();
  }
  actions(source: Entity, actions: Action[], event?: SimEvent, crit = false): void {
    let previous: Target[] = [];
    for (const action of actions) {
      const ctx = { ...this.context(source, event), previous };
      const targets = select(ctx, action.target);
      for (const target of targets) {
        const eligibleCrit =
          (action.critEligible !== false && ['damage', 'shield', 'heal'].includes(action.kind)) ||
          (action.critEligible !== false &&
            action.kind === 'status' &&
            ['burn', 'poison', 'regen'].includes(action.status ?? ''));
        const raw = action.amount === 'full' ? 0 : evaluate({ ...ctx, target }, action.amount ?? 0);
        const amount = raw * (crit && eligibleCrit ? 2 : 1);
        this.emit(
          'calculation',
          source.id,
          [target.id],
          {
            action: action.kind,
            expression: canonical(action.amount ?? 0),
            base: raw,
            crit: crit && eligibleCrit,
            result: amount,
          },
          false,
        );
        this.apply(source, target, action, amount);
      }
      previous = targets;
    }
  }
  apply(source: Entity, target: Target, action: Action, amount: number): void {
    const ctx = this.context(source),
      nonnegative = Math.max(0, amount);
    if (action.kind === 'damage' && !isEntity(target))
      this.damage(source, target, nonnegative, action.bypassShield ?? false, 'damage');
    if (action.kind === 'shield' && !isEntity(target)) {
      target.shield += nonnegative;
      this.emit('shield.gained', source.id, [target.id], { amount: nonnegative, shield: target.shield });
    }
    if (action.kind === 'heal' && !isEntity(target))
      this.heal(source, target, nonnegative, action.cleanses !== false, 'heal');
    if (action.kind === 'status') {
      const status = action.status!;
      if (!isEntity(target) && ['burn', 'poison', 'regen'].includes(status)) {
        const key = status as 'burn' | 'poison' | 'regen';
        target[key] += nonnegative;
        this.emit(`${status}.${status === 'regen' ? 'gained' : 'applied'}`, source.id, [target.id], {
          amount: nonnegative,
          total: target[key],
        });
      } else if (isEntity(target) && !target.destroyed) {
        if (traits(this.content, target).protections.includes(status)) {
          this.emit('effect.absorbed', source.id, [target.id], { effect: status });
          return;
        }
        const duration =
          target.flying && ['freeze', 'slow'].includes(status) ? Math.floor(nonnegative / 2) : nonnegative;
        const stacked = (target.statuses[status] ?? 0) > this.state.time;
        target.statuses[status] = Math.max(this.state.time, target.statuses[status] ?? 0) + duration;
        this.emit(`${status}.${stacked ? 'stacked' : 'applied'}`, source.id, [target.id], {
          amount: duration,
          attempted: nonnegative,
          expires: target.statuses[status],
        });
      }
    }
    if (action.kind === 'cleanse')
      this.cleanse(source, target, action.statuses ?? ['burn', 'poison'], nonnegative, action.mode ?? 'flat');
    if (action.kind === 'charge' && isEntity(target) && !target.destroyed && this.cooldown(target) > 0) {
      const before = target.progress;
      target.progress = Math.min(this.cooldown(target) * 2, target.progress + nonnegative * 2);
      this.emit('item.charged', source.id, [target.id], {
        amount: nonnegative,
        actualUnits: target.progress - before,
        progress: target.progress,
      });
    }
    if (action.kind === 'reload' && isEntity(target) && target.ammo !== null && !target.destroyed) {
      const before = target.ammo,
        max = attribute(ctx, target, 'ammo').value;
      target.ammo = action.amount === 'full' ? max : Math.min(max, target.ammo + nonnegative);
      this.emit('ammo.reloaded', source.id, [target.id], {
        amount: target.ammo - before,
        ammo: target.ammo,
        progress: target.progress,
      });
    }
    if (action.kind === 'modify') {
      const m: Modifier = {
        id: `m${this.state.nextEvent}`,
        sourceId: source.id,
        attribute: action.attribute!,
        op: action.op ?? 'add',
        value: amount,
        scope: action.scope ?? 'combat',
      };
      if (m.scope === 'timed') m.expires = this.state.time + (action.duration ?? 1000);
      const before = attribute(ctx, target, m.attribute).value;
      if (isEntity(target))
        (m.scope === 'permanent' || m.scope === 'day' ? target.modifiers : target.runtime).push(m);
      else target.modifiers.push(m);
      this.refreshMaxHealth();
      this.emit('attribute.modified', source.id, [target.id], {
        attribute: m.attribute,
        op: m.op,
        scope: m.scope,
        amount,
        before,
        after: attribute(ctx, target, m.attribute).value,
      });
      if (this.options.runMode || m.scope === 'run')
        this.options.onRunAction?.(action, source, [target], amount);
    }
    if (action.kind === 'forceUse' && isEntity(target))
      this.schedule({
        kind: 'cast',
        sourceId: target.id,
        phase: 30,
        forced: true,
        cast: 0,
        generation: target.generation,
      });
    if (action.kind === 'destroy' && isEntity(target) && !target.destroyed) {
      if (traits(this.content, target).protections.includes('destroy'))
        this.emit('effect.absorbed', source.id, [target.id], { effect: 'destroy' });
      else {
        this.emit('item.pendingDestroy', source.id, [target.id]);
        target.destroyed = true;
        target.generation++;
        this.emit('item.destroyed', source.id, [target.id]);
      }
    }
    if (action.kind === 'repair' && isEntity(target) && target.destroyed) {
      this.emit('item.pendingRepair', source.id, [target.id]);
      target.destroyed = false;
      target.generation++;
      this.emit('item.repaired', source.id, [target.id], {
        progress: target.progress,
        ammo: target.ammo ?? -1,
        policy: 'preserve progress, ammo, statuses and counters',
      });
    }
    if (action.kind === 'flying' && isEntity(target)) {
      const flying = action.value !== false;
      if (target.flying !== flying) {
        target.flying = flying;
        this.emit(`flying.${flying ? 'started' : 'stopped'}`, source.id, [target.id]);
      }
    }
    if (action.kind === 'transform' && isEntity(target)) this.transform(source, target, action.pool!);
    if (action.kind === 'type' && isEntity(target)) {
      const type = String(action.value);
      if (action.mode === 'all') target.addedTypes = target.addedTypes.filter((t) => t !== type);
      else if (!target.addedTypes.includes(type)) target.addedTypes.push(type);
      this.emit(action.mode === 'all' ? 'type.removed' : 'type.added', source.id, [target.id], { type });
    }
    if (action.kind === 'meter' && !isEntity(target))
      this.gainMeter(target, action.attribute!, amount, source);
    if (action.kind === 'slot' && isEntity(target)) {
      const owner = this.state.players.find((p) => p.id === target.owner)!;
      const key = `${target.position}:${action.attribute}`,
        before = owner.slots[key];
      if (action.value === false) delete owner.slots[key];
      else owner.slots[key] = String(action.value);
      if (before !== owner.slots[key]) {
        this.emit('slot.changed', source.id, [target.id], {
          slot: target.position,
          state: action.attribute!,
          value: action.value ?? true,
        });
        this.emit(
          `slot.${before === undefined ? 'started' : owner.slots[key] === undefined ? 'stopped' : 'updated'}`,
          source.id,
          [target.id],
          { slot: target.position, state: action.attribute! },
        );
      }
    }
    if (action.kind === 'publish') {
      if (action.event === 'sandstorm.start')
        this.state.stormStart = Math.min(
          this.state.stormStart,
          (Math.floor(this.state.time / 500) + 1) * 500,
        );
      this.emit(action.event!, source.id, [target.id], { amount });
    }
    if (action.kind === 'enchant' && isEntity(target)) {
      if (!definition(this.content, target.defId).enchantments[String(action.value)])
        throw new Error('Unsupported enchantment');
      target.enchantment = String(action.value);
      this.emit('item.enchanted', source.id, [target.id], { enchantment: target.enchantment });
    }
    if (['resource', 'upgrade', 'generate'].includes(action.kind)) {
      if (this.options.runMode) this.options.onRunAction?.(action, source, [target], amount);
      else if (action.kind === 'resource' && !isEntity(target)) {
        target.counters[action.attribute!] = (target.counters[action.attribute!] ?? 0) + amount;
        this.emit('resource.changed', source.id, [target.id], {
          resource: action.attribute!,
          amount,
          scope: action.scope ?? 'combat',
        });
      }
    }
    if (!this.options.runMode) {
      if (['permanent', 'run', 'day'].includes(action.scope ?? ''))
        this.state.persistent.push({
          owner: isEntity(target) ? target.owner : target.id,
          targetId: target.id,
          action: clone(action),
          amount,
        });
      this.refreshMaxHealth();
      this.proposeDeaths();
      const parent = this.parent;
      this.parent = this.events.at(-1)?.id ?? parent;
      this.checkReady();
      this.parent = parent;
    }
  }
  private refreshMaxHealth(): void {
    for (const player of this.state.players) {
      const source = this.state.entities.find((e) => e.owner === player.id);
      if (!source) continue;
      const derived = Math.max(1, attribute(this.context(source), player, 'maxHealth').value);
      if (derived !== player.maxHealth) {
        const before = player.maxHealth;
        player.health = Math.min(derived, player.health + derived - before);
        player.maxHealth = derived;
        this.emit('health.maximumChanged', player.id, [player.id], {
          before,
          after: derived,
          health: player.health,
        });
      }
    }
  }
  private damage(
    source: Entity | null,
    target: Fighter,
    amount: number,
    bypass: boolean,
    kind: string,
  ): void {
    const src = source?.id ?? 'system';
    this.emit('damage.attempted', src, [target.id], { attempted: amount, kind, bypassShield: bypass });
    const absorbed = bypass ? 0 : Math.min(target.shield, amount);
    target.shield -= absorbed;
    const healthDamage = Math.min(Math.max(0, target.health), amount - absorbed);
    const before = target.health;
    target.health -= amount - absorbed;
    if (absorbed) {
      this.emit('shield.lost', src, [target.id], { amount: absorbed });
      this.emit('damage.blocked', src, [target.id], { amount: absorbed });
    }
    this.emit('damage.dealt', src, [target.id], {
      attempted: amount,
      mitigated: 0,
      absorbed,
      healthDamage,
      kind,
      health: target.health,
    });
    if (before * 2 > target.maxHealth && target.health * 2 <= target.maxHealth)
      this.emit('health.threshold', target.id, [target.id], { percent: 50 });
    if (source && kind === 'damage') {
      const lifesteal = attribute(this.context(source), source, 'lifesteal').value;
      if (lifesteal > 0)
        this.heal(
          source,
          this.state.players.find((p) => p.id === source.owner)!,
          Math.floor(((absorbed + healthDamage) * lifesteal) / 10000),
          false,
          'lifesteal',
        );
    }
  }
  private heal(
    source: Entity | null,
    target: Fighter,
    amount: number,
    cleanses: boolean,
    kind: string,
  ): void {
    const src = source?.id ?? target.id;
    this.emit('heal.attempted', src, [target.id], { attempted: amount, kind });
    const actual = Math.min(amount, Math.max(0, target.maxHealth - target.health));
    target.health += actual;
    this.emit('heal.received', src, [target.id], {
      attempted: amount,
      actual,
      overheal: amount - actual,
      kind,
    });
    if (amount > actual) this.emit('heal.overhealed', src, [target.id], { amount: amount - actual });
    if (cleanses && amount > 0)
      this.cleanse(source, target, ['burn', 'poison'], this.content.rules.healCleansePercent, 'percent');
  }
  private cleanse(
    source: Entity | null,
    target: Target,
    statuses: string[],
    amount: number,
    mode: string,
  ): void {
    for (const status of statuses) {
      if (isEntity(target)) {
        const before = Math.max(0, (target.statuses[status] ?? 0) - this.state.time);
        const removed =
          mode === 'all'
            ? before
            : mode === 'percent'
              ? Math.floor((before * amount) / 100)
              : Math.min(before, amount);
        if (!removed) continue;
        if (before === removed) delete target.statuses[status];
        else target.statuses[status] = this.state.time + before - removed;
        this.emit(`${status}.removed`, source?.id ?? target.id, [target.id], { amount: removed });
      } else if (['burn', 'poison'].includes(status)) {
        const key = status as 'burn' | 'poison',
          before = target[key];
        const removed =
          mode === 'all'
            ? before
            : mode === 'percent'
              ? Math.min(before, Math.floor((before * amount) / 100))
              : Math.min(before, amount);
        target[key] -= removed;
        this.emit(`${status}.cleansed`, source?.id ?? target.id, [target.id], {
          amount: removed,
          before,
          after: target[key],
          mode,
        });
      }
    }
  }
  private transform(source: Entity, target: Entity, pool: string): void {
    const size = definition(this.content, target.defId).size;
    const candidates = this.content.pools[pool].filter((id) => {
      const d = definition(this.content, id);
      return d.size === size && d.kind === 'item' && d.startingTier !== 'legendary' && !!d.tiers[target.tier];
    });
    if (!candidates.length || target.tier === 'legendary') {
      this.emit('transform.failed', source.id, [target.id], { reason: 'no compatible result' });
      return;
    }
    const rng = roll(this.state.seed, this.state.rng, 'transform', candidates.length);
    this.emit('rng', source.id, [target.id], { stream: 'transform', raw: rng.raw, roll: rng.value }, false);
    const previous = target.defId;
    target.defId = candidates[rng.value];
    target.modifiers = [];
    target.addedTypes = [];
    target.memory = {};
    target.counters = {};
    target.runtime = [];
    target.statuses = {};
    target.progress = 0;
    target.destroyed = false;
    target.generation++;
    if (target.enchantment && !definition(this.content, target.defId).enchantments[target.enchantment])
      target.enchantment = null;
    const ctx = this.context(target),
      max = attribute(ctx, target, 'ammo').value;
    target.ammo = max > 0 || traits(this.content, target).capabilities.includes('Ammo') ? max : null;
    target.flying = attribute(ctx, target, 'flying').value > 0;
    target.provenance += ` > transform:${previous}`;
    this.emit('item.transformed', source.id, [target.id], {
      previous,
      result: target.defId,
      scope: this.options.runMode ? 'permanent' : 'combat',
    });
  }
  private gainMeter(target: Fighter, key: string, amount: number, source: Entity): void {
    target.meters[key] = Math.max(0, (target.meters[key] ?? 0) + amount);
    this.emit(`${key}.gained`, source.id, [target.id], { amount, total: target.meters[key] });
    if (key === 'rage' && target.meters.rage >= 100) {
      target.meters.rage -= 100;
      target.meters.enrageUntil = this.state.time + 5000;
      for (const item of this.state.entities.filter((e) => e.owner === target.id && e.location === 'board')) {
        this.cleanse(source, item, ['slow', 'freeze'], 0, 'all');
        this.apply(
          source,
          item,
          {
            kind: 'modify',
            target: { side: 'self' },
            attribute: 'cooldown',
            op: 'percent',
            scope: 'timed',
            duration: 5000,
          },
          -1000,
        );
      }
      this.emit('enrage.started', source.id, [target.id], { duration: 5000 });
    }
  }
  private tick(): void {
    const time = this.state.time;
    // Same-second order: Regen heal/cleanse, Poison, Burn, Sandstorm. Owners p0 then p1 within a stage.
    if (time % 1000 === 0) {
      for (const p of this.state.players) {
        if (p.regen > 0) {
          this.emit('regen.ticked', p.id, [p.id], { amount: p.regen });
          this.heal(null, p, p.regen, true, 'regen');
        }
        if (p.meters.tempoEnabled) {
          p.meters.tempo = (p.meters.tempo ?? 0) + 1;
          this.emit('tempo.gained', p.id, [p.id], { amount: 1, total: p.meters.tempo });
        }
      }
      for (const p of this.state.players)
        if (p.poison > 0) {
          this.emit('poison.ticked', p.id, [p.id], { amount: p.poison });
          this.damage(null, p, p.poison, true, 'poison');
        }
    }
    for (const p of this.state.players)
      if (p.burn > 0) {
        const amount = p.shield > 0 ? Math.floor(p.burn / 2) : p.burn;
        this.emit('burn.ticked', p.id, [p.id], { stacks: p.burn, amount, mitigated: p.burn - amount });
        this.damage(null, p, amount, false, 'burn');
        p.burn--;
      }
    const r = this.content.rules;
    if (time >= this.state.stormStart && (time - this.state.stormStart) % r.stormInterval === 0) {
      if (time === this.state.stormStart) this.emit('sandstorm.started', 'system');
      const amount = Math.min(
        r.stormCap,
        r.stormBase + Math.floor((time - this.state.stormStart) / r.stormInterval) * r.stormStep,
      );
      this.emit('sandstorm.ticked', 'system', ['p0', 'p1'], { amount });
      for (const p of this.state.players)
        this.damage(null, p, amount, r.stormMitigation === 'bypass', 'sandstorm');
    }
    this.proposeDeaths();
    this.schedule({
      kind: 'tick',
      sourceId: 'system',
      phase: 10,
      time: time + 500,
      tick: 'periodic',
      depth: 0,
      parent: null,
      batch: null,
    });
  }
  private proposeDeaths(): void {
    for (const p of this.state.players)
      if (p.health <= 0 && !this.state.queue.some((t) => t.kind === 'death' && t.sourceId === p.id)) {
        const event = this.emit('death.proposed', p.id, [p.id], { health: p.health });
        this.schedule({ kind: 'death', sourceId: p.id, phase: 90, parent: event.id, depth: event.depth + 1 });
      }
  }
  private commitDeath(): void {
    const dead = this.state.players.filter((p) => p.health <= 0);
    if (!dead.length) {
      this.emit('death.prevented', this.current?.sourceId ?? 'system');
      return;
    }
    this.state.outcome = dead.length === 2 ? 'draw' : dead[0].id === 'p0' ? 'p1' : 'p0';
    this.emit(
      'death.committed',
      dead[0].id,
      dead.map((p) => p.id),
      { outcome: this.state.outcome },
      false,
    );
    this.emit('combat.end', 'system', [], { outcome: this.state.outcome }, false);
    this.state.queue = [];
  }
  run(): void {
    try {
      this.initialize();
      while (this.state.outcome === 'ongoing') {
        this.drain(true);
        if (this.state.outcome !== 'ongoing') break;
        if (this.state.time >= this.content.rules.timeout) {
          const [a, b] = this.state.players;
          this.state.outcome =
            this.content.rules.timeoutPolicy === 'highestHealth' && a.health !== b.health
              ? a.health > b.health
                ? 'p0'
                : 'p1'
              : 'draw';
          this.state.queue = [];
          this.emit('combat.timeout', 'system', [], { outcome: this.state.outcome }, false);
          break;
        }
        const next = this.nextTime();
        if (next <= this.state.time) throw new Error('Clock deadlock');
        this.advance(next);
      }
    } catch (error) {
      this.state.outcome = 'error';
      this.state.error = error instanceof Error ? error.message : String(error);
      this.state.queue = [];
    }
  }
}

export function simulate(
  content: Content,
  initial: [Snapshot, Snapshot],
  seed: string,
  options: { frames?: boolean } = {},
): CombatResult {
  const state = makeCombatState(content, initial, seed),
    machine = new RulesMachine(content, state, options);
  machine.run();
  const finalHash = hash(state),
    digest = hash(machine.events);
  return {
    replay: {
      version: 1,
      contentVersion: content.contentVersion,
      seed,
      initial: clone(initial),
      commands: [],
      events: machine.events,
      finalHash,
      digest,
      final: state,
    },
    frames: machine.frames,
  };
}
