import type {
  Command,
  Content,
  Instance,
  Offer,
  Opponent,
  Reward,
  Run,
  Snapshot,
  Tier,
  Transition,
} from './model';
import { TIERS } from './model';
import { clone, hash, roll } from './determinism';
import { canPlace, definition, firstFit } from './geometry';
import { applyModifiers, attribute, compare, evaluate, isEntity } from './evaluate';
import { entityFrom, freshMemory, makeCombatState, RulesMachine, simulate } from './combat';
import { validateCommand, validateReplay, validateRun, validateSnapshot } from './validation';

export function newRun(content: Content, seed: string): Run {
  const r = content.rules;
  return {
    version: 1,
    contentVersion: content.contentVersion,
    seed: seed || 'evening',
    revision: 0,
    rng: {},
    day: 1,
    hour: 0,
    wins: 0,
    prestige: r.prestige,
    lastChanceUsed: false,
    gold: r.startingGold,
    income: r.startingIncome,
    xp: 0,
    level: 1,
    maxHealth: r.startingHealth,
    regen: 0,
    capacity: r.startingCapacity,
    items: [],
    skills: [],
    nextId: 1,
    counters: {},
    history: [],
    dayHistory: [],
    phase: 'start',
    candidates: [],
    selected: null,
    offers: [],
    pending: [],
    afterChoices: 'encounter',
    activeOpponent: null,
    battle: null,
    log: [],
    commands: [],
    nextEvent: 1,
  };
}
export function prestigeLoss(content: Content, day: number): number {
  return Math.min(content.rules.prestigeLossCap, day + content.rules.prestigeLossBase);
}
export function runSnapshot(content: Content, run: Run): Snapshot {
  return {
    version: 1,
    contentVersion: content.contentVersion,
    id: `run-${run.seed}-${run.day}`,
    name: 'Your caravan',
    day: run.day,
    level: run.level,
    maxHealth: run.maxHealth,
    regen: run.regen,
    capacity: run.capacity,
    items: clone(run.items),
    skills: clone(run.skills),
    counters: clone(run.counters),
    difficulty: 0,
  };
}
function blankSnapshot(content: Content): Snapshot {
  return {
    version: 1,
    contentVersion: content.contentVersion,
    id: 'empty',
    name: 'Empty',
    day: 1,
    level: 1,
    maxHealth: 1,
    regen: 0,
    capacity: 10,
    items: [],
    skills: [],
    counters: {},
    difficulty: 0,
  };
}
export function runContext(content: Content, run: Run) {
  const state = makeCombatState(content, [runSnapshot(content, run), blankSnapshot(content)], run.seed);
  state.entities = [...run.items, ...run.skills].map((i) => entityFrom(i, 'p0'));
  for (const entity of state.entities) {
    const def = definition(content, entity.defId);
    entity.ammo = def.tiers[entity.tier]?.ammo ?? null;
  }
  state.players[0].counters = {
    ...run.counters,
    gold: run.gold,
    income: run.income,
    xp: run.xp,
    level: run.level,
    day: run.day,
    hour: run.hour,
    wins: run.wins,
  };
  return state;
}
export function itemValue(
  content: Content,
  run: Run,
  item: Instance,
  key: string,
): ReturnType<typeof attribute> {
  const state = runContext(content, run),
    source = state.entities.find((e) => e.id === item.id) ?? entityFrom(item, 'p0');
  return attribute({ content, state, source }, source, key);
}
export function upgradeTarget(run: Run, defId: string): Instance | undefined {
  return [...run.items, ...run.skills]
    .filter((i) => i.defId === defId && i.tier !== 'diamond' && i.tier !== 'legendary')
    .sort((a, b) => a.acquired - b.acquired || a.position - b.position)[0];
}
export function rewardTargets(content: Content, run: Run, reward: Reward): Instance[] {
  if (reward.target === 'upgrade')
    return run.items.filter(
      (i) =>
        i.tier !== 'diamond' &&
        i.tier !== 'legendary' &&
        definition(content, i.defId).tiers[TIERS[TIERS.indexOf(i.tier) + 1]],
    );
  if (reward.target === 'enchant')
    return run.items.filter((i) => !!definition(content, i.defId).enchantments[reward.enchantment!]);
  if (reward.target === 'transform') return run.items.filter((i) => i.tier !== 'legendary');
  return [];
}
function availableRewards(content: Content, run: Run, rewards: Reward[]): Reward[] {
  const available = rewards.filter(
    (r) =>
      (!r.target || rewardTargets(content, run, r).length > 0) &&
      ![...run.items, ...run.skills].some(
        (i) => i.defId === (r.item ?? r.skill) && (i.tier === 'diamond' || i.tier === 'legendary'),
      ),
  );
  return available.length
    ? available
    : [
        {
          id: 'fallback',
          label: 'Market credit',
          text: `No eligible targets remain. Take ${content.rules.fallbackCash} gold.`,
          gold: content.rules.fallbackCash,
        },
      ];
}

class RunReducer {
  private activeMachine: RulesMachine | null = null;
  constructor(
    readonly content: Content,
    readonly run: Run,
  ) {}
  private count(key: string): void {
    this.run.counters[key] = (this.run.counters[key] ?? 0) + 1;
    if (this.activeMachine) this.activeMachine.state.players[0].counters[key] = this.run.counters[key];
  }
  signal(
    kind: string,
    sourceId = 'p0',
    payload: Record<string, string | number | boolean> = {},
    targets: string[] = [],
  ): void {
    if (this.activeMachine) {
      this.activeMachine.emit(kind, sourceId, targets, payload);
      return;
    }
    const state = runContext(this.content, this.run);
    state.nextEvent = this.run.nextEvent;
    state.rng = this.run.rng;
    state.time = (this.run.day * 6 + this.run.hour) * 100000;
    const machine = new RulesMachine(this.content, state, {
      runMode: true,
      onRunAction: (action, source, selected, amount) => {
        if (action.kind === 'resource') this.resource(action.attribute!, amount, source.id);
        if (action.kind === 'modify' && action.scope === 'run' && action.attribute === 'maxHealth')
          this.run.maxHealth = Math.max(1, this.run.maxHealth + amount);
        if (action.kind === 'upgrade')
          for (const target of selected) if (isEntity(target)) this.upgrade(target);
        if (action.kind === 'generate') {
          const pool = this.content.pools[action.pool!];
          const id = pool[roll(this.run.seed, this.run.rng, 'rewards', pool.length).value];
          this.acquire(id, undefined, null, false);
        }
      },
    });
    this.activeMachine = machine;
    try {
      machine.emit(kind, sourceId, targets, payload);
      machine.drain(true);
    } finally {
      this.activeMachine = null;
    }
    for (const entity of state.entities) {
      const original = [...this.run.items, ...this.run.skills].find((i) => i.id === entity.id);
      if (original) {
        for (const key of Object.keys(original) as (keyof Instance)[])
          Object.assign(original, { [key]: clone(entity[key]) });
      }
    }
    this.run.nextEvent = state.nextEvent;
    this.run.rng = state.rng;
    this.run.log.push(...machine.events);
  }
  resource(key: string, amount: number, sourceId = 'p0'): void {
    if (key === 'gold') {
      if (this.run.gold + amount < 0) throw new Error('Not enough gold');
      this.run.gold += amount;
      this.signal(amount >= 0 ? 'gold.gained' : 'gold.spent', sourceId, {
        amount: Math.abs(amount),
        gold: this.run.gold,
      });
    } else if (key === 'income') {
      this.run.income = Math.max(0, this.run.income + amount);
      this.signal('income.changed', sourceId, { amount, income: this.run.income });
    } else if (key === 'xp') {
      this.run.xp += amount;
      this.signal('xp.gained', sourceId, { amount });
      while (this.run.xp >= this.content.rules.xpPerLevel) {
        this.run.xp -= this.content.rules.xpPerLevel;
        this.run.level++;
        this.run.maxHealth += this.content.rules.healthPerLevel;
        this.run.capacity = Math.min(10, this.content.rules.startingCapacity + this.run.level - 1);
        this.run.pending.push({
          reason: `Level ${this.run.level}`,
          rewards: clone(this.content.levels[String(this.run.level)] ?? this.content.levels.default),
        });
        this.signal('level.gained', 'p0', {
          level: this.run.level,
          capacity: this.run.capacity,
          healthDelta: this.content.rules.healthPerLevel,
          maxHealth: this.run.maxHealth,
        });
      }
    } else if (key === 'health' || key === 'maxHealth') {
      this.run.maxHealth = Math.max(1, this.run.maxHealth + amount);
      this.signal('health.gained', sourceId, { amount });
    } else if (key === 'regen') {
      this.run.regen = Math.max(0, this.run.regen + amount);
      this.signal('regen.gained', sourceId, { amount });
    } else throw new Error(`Unknown run resource ${key}`);
    if (this.activeMachine)
      Object.assign(this.activeMachine.state.players[0].counters, {
        gold: this.run.gold,
        income: this.run.income,
        xp: this.run.xp,
        level: this.run.level,
        ...this.run.counters,
      });
  }
  upgrade(item: Instance): void {
    if (item.tier === 'diamond' || item.tier === 'legendary')
      throw new Error('This item is at its terminal tier');
    const next = TIERS[TIERS.indexOf(item.tier) + 1];
    if (!definition(this.content, item.defId).tiers[next]) throw new Error('Missing upgrade tier');
    item.tier = next;
    this.signal('item.upgraded', item.id, { tier: next }, [item.id]);
  }
  acquire(defId: string, tier?: Tier, enchantment: string | null = null, purchase = true): Instance {
    const def = definition(this.content, defId),
      existing = purchase ? upgradeTarget(this.run, defId) : undefined;
    if (existing) {
      if (enchantment) existing.enchantment = enchantment;
      this.upgrade(existing);
      this.count('purchases');
      this.signal('item.bought', existing.id, { upgrade: true, definition: defId }, [existing.id]);
      return existing;
    }
    if (
      purchase &&
      [...this.run.items, ...this.run.skills].some((i) => i.defId === defId && i.tier === 'diamond')
    )
      throw new Error('Already own a Diamond copy');
    const serial = this.run.nextId++;
    const item: Instance = {
      id: `i${serial}`,
      defId,
      tier: tier ?? def.startingTier,
      enchantment,
      location: def.kind === 'skill' ? 'skills' : 'board',
      position: 0,
      acquired: serial,
      modifiers: [],
      addedTypes: [],
      memory: {},
      counters: {},
      provenance: purchase ? 'purchased' : 'generated',
    };
    if (!def.tiers[item.tier]) throw new Error('Unavailable tier');
    if (enchantment && !def.enchantments[enchantment]) throw new Error('Unsupported enchantment');
    if (def.kind === 'skill') {
      item.position = this.run.skills.length;
      this.run.skills.push(item);
    } else {
      let position = firstFit(this.content, this.run.items, item, 'board', this.run.capacity);
      if (position < 0) {
        item.location = 'stash';
        position = firstFit(this.content, this.run.items, item, 'stash', this.content.rules.stashCapacity);
      }
      if (position < 0)
        throw new Error('No contiguous space. Sell or move an item before collecting this reward.');
      item.position = position;
      this.run.items.push(item);
    }
    if (this.activeMachine && !this.activeMachine.state.entities.some((e) => e.id === item.id))
      this.activeMachine.state.entities.push(entityFrom(item, 'p0'));
    this.signal('item.acquired', item.id, { definition: defId }, [item.id]);
    this.count(purchase ? 'purchases' : 'generated');
    this.signal(purchase ? 'item.bought' : 'item.generated', item.id, { definition: defId, upgrade: false }, [
      item.id,
    ]);
    return item;
  }
  reward(reward: Reward, targetId?: string): void {
    if (reward.target) {
      const target = rewardTargets(this.content, this.run, reward).find((i) => i.id === targetId);
      if (!target) throw new Error('Select an eligible reward target');
      if (reward.target === 'upgrade') this.upgrade(target);
      if (reward.target === 'enchant') {
        target.enchantment = reward.enchantment!;
        this.signal('item.enchanted', target.id, { enchantment: target.enchantment }, [target.id]);
      }
      if (reward.target === 'transform') {
        const def = definition(this.content, target.defId),
          pool = this.content.pools.neutral.filter((id) => {
            const d = definition(this.content, id);
            return d.size === def.size && !!d.tiers[target.tier] && d.startingTier !== 'legendary';
          });
        const previous = target.defId;
        target.defId = pool[roll(this.run.seed, this.run.rng, 'transform', pool.length).value];
        target.modifiers = [];
        target.addedTypes = [];
        target.counters = {};
        target.memory = {};
        if (target.enchantment && !definition(this.content, target.defId).enchantments[target.enchantment])
          target.enchantment = null;
        target.provenance += ` > transform:${previous}`;
        this.count('transforms');
        this.signal('item.transformed', target.id, { previous, result: target.defId }, [target.id]);
      }
    }
    if (reward.item) this.acquire(reward.item, reward.tier, reward.enchantment ?? null);
    if (reward.skill) this.acquire(reward.skill, reward.tier, null);
    if (reward.gold) this.resource('gold', reward.gold);
    if (reward.income) this.resource('income', reward.income);
    if (reward.health) this.resource('health', reward.health);
    if (reward.xp) this.resource('xp', reward.xp);
  }
  private weighted<T>(list: T[], weight: (t: T) => number, stream: string): T {
    if (!list.length) throw new Error('Empty eligible content pool');
    let value = roll(
      this.run.seed,
      this.run.rng,
      stream,
      list.reduce((s, t) => s + Math.max(1, weight(t)), 0),
    ).value;
    for (const item of list) {
      value -= Math.max(1, weight(item));
      if (value < 0) return item;
    }
    return list[list.length - 1];
  }
  generateEncounters(): void {
    this.run.phase = 'encounter';
    this.run.selected = null;
    this.run.activeOpponent = null;
    this.run.offers = [];
    if (this.run.hour === 2 || this.run.hour === 5) {
      const category = this.run.hour === 2 ? 'monster' : 'rival';
      const candidates = this.content.opponents.filter(
        (o) => o.category === category && o.minDay <= this.run.day && o.maxDay >= this.run.day,
      );
      const previous = this.run.history.filter((x) => x.startsWith(`${category}-`)).at(-1);
      const pool = candidates.filter((o) => o.snapshot.id !== previous);
      // Three previews where possible, excluding the previous selection in this category.
      const list = pool.length ? [...pool] : [...candidates];
      const result: Opponent[] = [];
      while (list.length && result.length < 3) {
        const i = roll(this.run.seed, this.run.rng, 'opponents', list.length).value;
        result.push(list.splice(i, 1)[0]);
      }
      this.run.candidates = result.map((o) => o.snapshot.id);
    } else {
      const state = runContext(this.content, this.run),
        source = state.entities[0];
      const eligible = this.content.encounters.filter(
        (e) =>
          e.minDay <= this.run.day &&
          e.maxDay >= this.run.day &&
          e.hours.includes(this.run.hour) &&
          (!e.prerequisites?.length ||
            (source &&
              e.prerequisites.every((c) =>
                compare(
                  evaluate({ content: this.content, state, source }, c.left),
                  c.op,
                  evaluate({ content: this.content, state, source }, c.right),
                ),
              ))),
      );
      this.run.candidates = [];
      for (const category of ['shop', 'event', 'free']) {
        const all = eligible.filter((e) => e.category === category);
        const fresh = all.filter((e) => !this.run.dayHistory.includes(e.exclusion));
        this.run.candidates.push(this.weighted(fresh.length ? fresh : all, (e) => e.weight, 'encounters').id);
      }
    }
    this.signal('encounter.offered', 'p0', { candidates: this.run.candidates.join(',') });
  }
  generateShop(): void {
    const shop = this.content.encounters.find((e) => e.id === this.run.selected)!;
    const pool = this.content.pools[shop.pool!]
      .map((id) => definition(this.content, id))
      .filter(
        (d) =>
          d.shop.enabled &&
          d.shop.minDay <= this.run.day &&
          !this.run.items.some((i) => i.defId === d.id && i.tier === 'diamond'),
      );
    this.run.offers = [];
    for (let index = 0; index < (shop.offerCount ?? 4) && pool.length; index++) {
      const def = this.weighted(pool, (d) => d.shop.weight, 'shops');
      pool.splice(pool.indexOf(def), 1);
      const chance = roll(this.run.seed, this.run.rng, 'shops', 100).value;
      const preferredTier: Tier =
        this.run.day >= this.content.rules.shopGoldDay && chance < this.content.rules.shopGoldThreshold
          ? 'gold'
          : this.run.day >= this.content.rules.shopSilverDay &&
              chance < this.content.rules.shopSilverThreshold
            ? 'silver'
            : def.startingTier;
      const tier = def.tiers[preferredTier] ? preferredTier : def.startingTier;
      const supported = Object.keys(def.enchantments).sort(),
        enchanted =
          roll(this.run.seed, this.run.rng, 'shops', 100).value < this.content.rules.shopEnchantChance;
      const enchantment =
        enchanted && supported.length
          ? supported[roll(this.run.seed, this.run.rng, 'shops', supported.length).value]
          : null;
      const price = Math.max(
        1,
        (def.tiers[tier]?.buy ?? 5) +
          (enchantment ? this.content.rules.shopEnchantPremium : 0) -
          (shop.discount && def.types.includes(shop.discount.type) ? shop.discount.amount : 0),
      );
      const offer: Offer = {
        id: `offer-${this.run.day}-${this.run.hour}-${this.run.counters.rerolls ?? 0}-${index}`,
        defId: def.id,
        tier,
        enchantment,
        price,
        sold: false,
      };
      this.run.offers.push(offer);
      this.signal('item.offered', 'p0', { definition: def.id, price }, [offer.id]);
    }
  }
  completeHour(): void {
    this.signal('encounter.completed', 'p0', { id: this.run.selected ?? 'none' });
    this.resource('xp', this.content.rules.hourXp);
    this.signal('hour.completed', 'p0', { day: this.run.day, hour: this.run.hour });
    this.run.afterChoices = 'advance';
    if (this.run.pending.length) {
      this.run.phase = 'choice';
      return;
    }
    this.advance();
  }
  advance(): void {
    if (this.run.hour === 5) {
      this.signal('day.ended', 'p0', { day: this.run.day });
      this.run.day++;
      this.run.hour = 0;
      this.run.dayHistory = [];
      for (const item of [...this.run.items, ...this.run.skills]) {
        item.modifiers = item.modifiers.filter((m) => m.scope !== 'day');
        const def = definition(this.content, item.defId);
        for (const a of [
          ...def.abilities,
          ...(item.enchantment ? (def.enchantments[item.enchantment]?.abilities ?? []) : []),
        ])
          if (a.trigger.scope === 'day') item.memory[a.id] = freshMemory();
      }
      this.resource('gold', this.run.income);
      this.signal('income.paid', 'p0', { amount: this.run.income });
      this.signal('day.started', 'p0', { day: this.run.day });
    } else this.run.hour++;
    this.signal('hour.started', 'p0', { day: this.run.day, hour: this.run.hour });
    this.generateEncounters();
    if (this.run.pending.length) {
      this.run.afterChoices = 'encounter';
      this.run.phase = 'choice';
    }
  }
  execute(command: Command): Transition['combat'] {
    const run = this.run;
    if (command.type === 'start') {
      if (run.phase !== 'start') throw new Error('Run already started');
      const chosen = this.content.starts.find((r) => r.id === command.choice);
      if (!chosen) throw new Error('Unknown starting package');
      this.reward(chosen);
      if (!run.items.some((i) => i.defId === 'rivet-lance'))
        this.acquire('rivet-lance', undefined, null, false);
      this.signal('run.started', 'p0');
      this.signal('day.started', 'p0', { day: 1 });
      this.signal('hour.started', 'p0', { hour: 0 });
      this.generateEncounters();
      return;
    }
    if (['start', 'victory', 'defeat', 'combat'].includes(run.phase))
      throw new Error('Command unavailable in this phase');
    if (command.type === 'move') {
      const item = run.items.find((i) => i.id === command.item);
      if (!item) throw new Error('Unknown item');
      if (
        !canPlace(
          this.content,
          run.items,
          item,
          command.location,
          command.position,
          command.location === 'board' ? run.capacity : this.content.rules.stashCapacity,
        )
      ) {
        const swap = run.items.find(
          (i) =>
            i.id !== item.id &&
            i.location === command.location &&
            i.position === command.position &&
            definition(this.content, i.defId).size === definition(this.content, item.defId).size,
        );
        if (!swap)
          throw new Error('Those slots are occupied or outside capacity. Equal-size items can swap.');
        const remaining = run.items.filter((i) => i.id !== item.id && i.id !== swap.id);
        if (
          !canPlace(
            this.content,
            remaining,
            swap,
            item.location,
            item.position,
            item.location === 'board' ? run.capacity : this.content.rules.stashCapacity,
          )
        )
          throw new Error('Swap does not fit');
        swap.location = item.location;
        swap.position = item.position;
      }
      item.location = command.location;
      item.position = command.position;
      this.signal('item.moved', item.id, { location: item.location, position: item.position });
      return;
    }
    if (command.type === 'sell') {
      const item = run.items.find((i) => i.id === command.item);
      if (!item) throw new Error('Unknown item');
      const bonus =
        run.phase === 'shop'
          ? (this.content.encounters.find((e) => e.id === run.selected)?.sellBonus ?? 0)
          : 0;
      const value = itemValue(this.content, run, item, 'sell').value + bonus;
      // Sale subscriptions see the outgoing source before removal; payment follows removal.
      this.count('sales');
      this.signal('item.sold', item.id, { value }, [item.id]);
      run.items = run.items.filter((i) => i.id !== item.id);
      this.resource('gold', value);
      return;
    }
    if (command.type === 'select') {
      if (run.phase !== 'encounter' || !run.candidates.includes(command.id))
        throw new Error('Encounter is not offered');
      run.selected = command.id;
      run.history.push(command.id);
      this.signal('encounter.selected', 'p0', { id: command.id });
      const opponent = this.content.opponents.find((o) => o.snapshot.id === command.id);
      if (opponent) {
        run.activeOpponent = opponent.snapshot.id;
        return;
      }
      const encounter = this.content.encounters.find((e) => e.id === command.id)!;
      run.dayHistory.push(encounter.exclusion);
      if (encounter.category === 'shop') {
        run.phase = 'shop';
        this.signal('merchant.visited', 'p0', { id: encounter.id });
        this.generateShop();
      } else {
        run.pending.unshift({ reason: encounter.name, rewards: clone(encounter.rewards) });
        run.afterChoices = 'completeHour';
        run.phase = 'choice';
      }
      return;
    }
    if (command.type === 'buy') {
      if (run.phase !== 'shop') throw new Error('Not at a merchant');
      const offer = run.offers.find((o) => o.id === command.offer);
      if (!offer || offer.sold) throw new Error('Offer unavailable');
      if (run.gold < offer.price) throw new Error('Not enough gold');
      this.resource('gold', -offer.price);
      this.acquire(offer.defId, offer.tier, offer.enchantment, true);
      offer.sold = true;
      for (const other of run.offers)
        if (run.items.some((i) => i.defId === other.defId && i.tier === 'diamond')) other.sold = true;
      if (run.pending.length) {
        run.afterChoices = 'shop';
        run.phase = 'choice';
      }
      return;
    }
    if (command.type === 'reroll') {
      if (run.phase !== 'shop') throw new Error('Not at a merchant');
      const shop = this.content.encounters.find((e) => e.id === run.selected)!;
      this.resource('gold', -(shop.rerollCost ?? 2));
      this.count('rerolls');
      this.signal('shop.rerolled', 'p0', { count: run.counters.rerolls });
      this.generateShop();
      return;
    }
    if (command.type === 'leave') {
      if (run.phase !== 'shop') throw new Error('Not at a merchant');
      this.completeHour();
      return;
    }
    if (command.type === 'choose') {
      if (run.phase !== 'choice' || !run.pending.length) throw new Error('No pending reward');
      const pending = run.pending[0],
        choice = availableRewards(this.content, run, pending.rewards).find((r) => r.id === command.choice);
      if (!choice) throw new Error('Reward is not eligible');
      run.pending.shift();
      this.reward(choice, command.target);
      if (run.pending.length) {
        run.phase = 'choice';
        return;
      }
      if (run.afterChoices === 'terminal') {
        run.phase = 'defeat';
        return;
      }
      if (run.afterChoices === 'completeHour') {
        this.completeHour();
        return;
      }
      if (run.afterChoices === 'shop') {
        run.phase = 'shop';
        return;
      }
      if (run.afterChoices === 'advance') this.advance();
      else run.phase = 'encounter';
      return;
    }
    if (command.type === 'fight') {
      if (run.phase !== 'encounter' || !run.activeOpponent) throw new Error('Select an opponent first');
      const opponent = this.content.opponents.find((o) => o.snapshot.id === run.activeOpponent)!;
      run.phase = 'combat';
      const seed = `${run.seed}/combat/${run.day}/${run.hour}/${run.counters.fights ?? 0}`;
      const result = simulate(this.content, [runSnapshot(this.content, run), opponent.snapshot], seed, {
        frames: true,
      });
      if (result.replay.final.outcome === 'error')
        throw new Error(`Combat rejected: ${result.replay.final.error}`);
      for (const combatItem of result.replay.final.entities.filter((e) => e.owner === 'p0')) {
        const item = [...run.items, ...run.skills].find((i) => `p0:${i.id}` === combatItem.id);
        if (!item || item.defId !== combatItem.defId) continue;
        item.modifiers = clone(combatItem.modifiers);
        for (const ability of definition(this.content, item.defId).abilities)
          if (ability.trigger.scope === 'run' || ability.trigger.scope === 'day') {
            if (combatItem.memory[ability.id]) item.memory[ability.id] = clone(combatItem.memory[ability.id]);
          }
      }
      for (const write of result.replay.final.persistent.filter((w) => w.owner === 'p0')) {
        const item = run.items.find((i) => `p0:${i.id}` === write.targetId);
        const final = result.replay.final.entities.find((e) => e.id === write.targetId);
        if (write.action.kind === 'type' && item && final) item.addedTypes = clone(final.addedTypes);
        if (write.action.kind === 'transform' && item && final) {
          item.defId = final.defId;
          item.tier = final.tier;
          item.enchantment = final.enchantment;
          item.modifiers = clone(final.modifiers);
          item.addedTypes = clone(final.addedTypes);
          item.memory = clone(final.memory);
        }
        if (write.action.kind === 'resource') this.resource(write.action.attribute!, write.amount);
        if (
          write.action.kind === 'modify' &&
          write.targetId === 'p0' &&
          write.action.attribute === 'maxHealth'
        ) {
          const after = applyModifiers(run.maxHealth, [
            {
              id: 'writeback',
              sourceId: 'combat',
              attribute: 'maxHealth',
              op: write.action.op ?? 'add',
              value: write.amount,
              scope: 'run',
            },
          ]);
          this.resource('health', after - run.maxHealth);
        }
      }
      this.count('fights');
      run.battle = { outcome: result.replay.final.outcome, finalHash: result.replay.finalHash, seed };
      run.phase = 'result';
      this.signal('combat.end', 'p0', { outcome: run.battle.outcome, hash: run.battle.finalHash });
      return result;
    }
    if (command.type === 'continue') {
      if (run.phase !== 'result' || !run.battle || !run.activeOpponent) throw new Error('No combat result');
      const opponent = this.content.opponents.find((o) => o.snapshot.id === run.activeOpponent)!;
      if (opponent.category === 'rival') {
        if (run.battle.outcome === 'p0') {
          run.wins++;
          this.signal('win.gained', 'p0', { wins: run.wins });
        } else {
          run.prestige -= prestigeLoss(this.content, run.day);
          this.signal('prestige.lost', 'p0', { prestige: run.prestige });
        }
        if (run.wins >= this.content.rules.wins) {
          run.phase = 'victory';
          return;
        }
        if (run.prestige <= 0) {
          if (run.lastChanceUsed) {
            run.phase = 'defeat';
            return;
          }
          run.lastChanceUsed = true;
          run.prestige = this.content.rules.lastChancePrestige;
          run.pending.unshift({ reason: 'Last chance', rewards: clone(this.content.lastChance) });
          run.phase = 'choice';
          run.afterChoices = 'completeHour';
          return;
        }
      } else if (run.battle.outcome === 'p0') {
        for (const reward of opponent.rewards) this.reward(reward);
        if (opponent.drops.length) {
          const id = opponent.drops[roll(run.seed, run.rng, 'rewards', opponent.drops.length).value],
            def = definition(this.content, id);
          run.pending.unshift({
            reason: 'Monster spoils',
            rewards: [
              {
                id: 'drop',
                label: def.name,
                text: 'Take the offered drop.',
                ...(def.kind === 'skill' ? { skill: id } : { item: id }),
              },
              {
                id: 'sell-drop',
                label: 'Take supplies',
                text: `Receive ${this.content.rules.dropCash} gold instead.`,
                gold: this.content.rules.dropCash,
              },
            ],
          });
        }
      }
      this.completeHour();
      return;
    }
  }
}
export function commandOptions(content: Content, run: Run): Reward[] {
  return run.phase === 'start'
    ? content.starts
    : run.pending[0]
      ? availableRewards(content, run, run.pending[0].rewards)
      : [];
}
export function dispatch(content: Content, input: Run, command: unknown): Transition {
  validateCommand(command);
  if (command.revision !== input.revision) throw new Error('Stale command revision');
  if (input.contentVersion !== content.contentVersion) throw new Error('Run content version mismatch');
  const state = clone(input),
    start = state.log.length,
    reducer = new RunReducer(content, state);
  const combat = reducer.execute(command);
  state.revision++;
  state.commands.push(clone(command));
  if (state.pending.length && ['encounter', 'shop'].includes(state.phase)) {
    state.afterChoices = state.phase === 'shop' ? 'shop' : 'encounter';
    state.phase = 'choice';
  }
  return { state, events: state.log.slice(start), hash: hash(state), ...(combat ? { combat } : {}) };
}
export function saveRun(content: Content, run: Run): string {
  validateRun(content, run);
  return JSON.stringify({ format: 'night-market-save', version: 1, checksum: hash(run), state: run });
}
function parseBounded(text: string): unknown {
  if (text.length > 12000000) throw new Error('Import exceeds 12 MB');
  return JSON.parse(text) as unknown;
}
export function loadRun(content: Content, text: string): Run {
  const data = parseBounded(text) as {
    format?: string;
    version?: number;
    checksum?: string;
    state?: unknown;
  };
  if (data?.format !== 'night-market-save' || data.version !== 1)
    throw new Error('Unsupported save envelope');
  validateRun(content, data.state);
  if (hash(data.state) !== data.checksum) throw new Error('Save checksum mismatch');
  return clone(data.state);
}
export function importSnapshot(content: Content, text: string): Snapshot {
  const data = parseBounded(text);
  validateSnapshot(content, data);
  return clone(data);
}
export function importReplay(content: Content, text: string): Transition['combat'] {
  const data = parseBounded(text);
  validateReplay(content, data);
  const result = simulate(content, data.initial, data.seed, { frames: true });
  if (
    result.replay.finalHash !== data.finalHash ||
    result.replay.digest !== data.digest ||
    hash(data.events) !== data.digest ||
    hash(data.final) !== data.finalHash
  )
    throw new Error('Replay determinism check failed');
  return result;
}
