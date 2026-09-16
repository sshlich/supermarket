import Ajv from 'ajv';
import type {
  Ability,
  Action,
  Aura,
  Command,
  Content,
  Definition,
  Replay,
  Run,
  Selector,
  Snapshot,
} from './model';
import { TIERS } from './model';
import { validateGeometry } from './geometry';

type Schema = Record<string, unknown>;
const str: Schema = { type: 'string', maxLength: 2000 },
  int: Schema = { type: 'integer', minimum: -100000000, maximum: 100000000 };
const nonnegative: Schema = { ...int, minimum: 0 },
  bool: Schema = { type: 'boolean' },
  nullable = (s: Schema): Schema => ({ anyOf: [s, { type: 'null' }] });
const en = (...values: (string | number | boolean)[]): Schema => ({ enum: values });
const arr = (items: Schema, maxItems = 1000): Schema => ({ type: 'array', items, maxItems });
const obj = (properties: Record<string, Schema>, required = Object.keys(properties)): Schema => ({
  type: 'object',
  properties,
  required,
  additionalProperties: false,
});
const dict = (value: Schema): Schema => ({
  type: 'object',
  additionalProperties: value,
  propertyNames: { not: { enum: ['__proto__', 'prototype', 'constructor'] } },
});
const ref = (name: string): Schema => ({ $ref: `#/$defs/${name}` });
const tier = en(...TIERS),
  location = en('board', 'stash', 'skills'),
  scope = en('permanent', 'run', 'day', 'combat', 'timed', 'activation');
const compare = en('eq', 'ne', 'lt', 'lte', 'gt', 'gte'),
  version = { const: 1 };
const defs: Record<string, Schema> = {
  Numbers: dict(int),
  Payload: dict({ anyOf: [str, int, bool] }),
  Modifier: obj(
    {
      id: str,
      sourceId: str,
      attribute: str,
      op: en('add', 'percent', 'multiply', 'set', 'min', 'max'),
      value: int,
      scope,
      expires: nonnegative,
      castId: nonnegative,
    },
    ['id', 'sourceId', 'attribute', 'op', 'value', 'scope'],
  ),
  Memory: obj({
    seen: nonnegative,
    fired: nonnegative,
    last: int,
    keys: arr(str, 100000),
    progress: nonnegative,
    completed: bool,
  }),
  Predicate: obj(
    {
      field: en(
        'type',
        'capability',
        'reference',
        'size',
        'cooldown',
        'ammo',
        'status',
        'attribute',
        'relativeSize',
      ),
      key: str,
      value: { anyOf: [str, int, bool] },
      compare,
      not: bool,
    },
    ['field'],
  ),
  Selector: obj(
    {
      side: en(
        'self',
        'owner',
        'enemy',
        'allyItems',
        'enemyItems',
        'allItems',
        'eventSource',
        'eventTargets',
        'previous',
      ),
      location: arr(location, 3),
      spatial: en('left', 'right', 'adjacent', 'leftmost', 'rightmost'),
      other: bool,
      filters: arr(ref('Predicate'), 20),
      order: en('position', 'random', 'highest', 'lowest'),
      attribute: str,
      count: { type: 'integer', minimum: 0, maximum: 30 },
      preferUnstatus: str,
      excludeProtected: str,
    },
    ['side'],
  ),
  Expr: {
    anyOf: [
      int,
      obj({ ref: en('source', 'target', 'owner', 'enemy', 'event', 'counter', 'tier'), key: str }),
      obj({ count: ref('Selector'), distinctTypes: bool }, ['count']),
      obj({
        op: en('add', 'sub', 'mul', 'div', 'min', 'max'),
        args: { ...arr(ref('Expr'), 20), minItems: 1 },
      }),
    ],
  },
  Condition: obj({ left: ref('Expr'), op: compare, right: ref('Expr') }),
  Trigger: obj(
    {
      event: str,
      relation: en('any', 'self', 'other', 'owner', 'enemy'),
      source: arr(ref('Predicate'), 20),
      every: { type: 'integer', minimum: 1 },
      first: nonnegative,
      scope: en('combat', 'day', 'run'),
      oncePer: en('parent', 'batch'),
    },
    ['event'],
  ),
  Action: obj(
    {
      kind: en(
        'damage',
        'shield',
        'heal',
        'status',
        'cleanse',
        'charge',
        'reload',
        'modify',
        'forceUse',
        'destroy',
        'repair',
        'transform',
        'publish',
        'flying',
        'resource',
        'type',
        'meter',
        'slot',
        'enchant',
        'upgrade',
        'generate',
      ),
      target: ref('Selector'),
      amount: { anyOf: [ref('Expr'), { const: 'full' }] },
      attribute: str,
      op: en('add', 'percent', 'multiply', 'set', 'min', 'max'),
      scope,
      duration: nonnegative,
      status: str,
      statuses: arr(str, 20),
      mode: en('flat', 'percent', 'all'),
      cleanses: bool,
      bypassShield: bool,
      pool: str,
      event: str,
      value: { anyOf: [str, bool] },
      critEligible: bool,
    },
    ['kind', 'target'],
  ),
  Ability: obj(
    {
      id: str,
      trigger: ref('Trigger'),
      locations: { ...arr(location, 3), minItems: 1 },
      conditions: arr(ref('Condition'), 20),
      priority: int,
      internalCooldown: nonnegative,
      actions: arr(ref('Action'), 30),
      quest: obj(
        {
          required: { type: 'integer', minimum: 1 },
          scope: en('combat', 'day', 'run'),
          repeatable: bool,
          overflow: bool,
        },
        ['required', 'scope'],
      ),
    },
    ['id', 'trigger', 'locations', 'actions'],
  ),
  Aura: obj(
    {
      id: str,
      locations: arr(location, 3),
      target: ref('Selector'),
      attribute: str,
      op: en('add', 'percent', 'multiply', 'set', 'min', 'max'),
      value: int,
      conditions: arr(ref('Condition'), 20),
    },
    ['id', 'locations', 'target', 'attribute', 'op', 'value'],
  ),
  Enchantment: obj(
    {
      attributes: ref('Numbers'),
      abilities: arr(ref('Ability'), 30),
      auras: arr(ref('Aura'), 30),
      capabilities: arr(str, 50),
      protections: arr(str, 20),
    },
    [],
  ),
  Definition: obj(
    {
      id: str,
      name: str,
      text: str,
      pool: str,
      kind: en('item', 'skill'),
      size: en(1, 2, 3),
      startingTier: tier,
      types: arr(str, 30),
      capabilities: arr(str, 60),
      references: arr(str, 60),
      tiers: {
        type: 'object',
        properties: Object.fromEntries(TIERS.map((t) => [t, ref('Numbers')])),
        additionalProperties: false,
      },
      abilities: arr(ref('Ability'), 30),
      auras: arr(ref('Aura'), 30),
      enchantments: dict(ref('Enchantment')),
      shop: obj({ enabled: bool, weight: nonnegative, minDay: nonnegative }),
    },
    [
      'id',
      'name',
      'text',
      'pool',
      'kind',
      'size',
      'startingTier',
      'types',
      'capabilities',
      'references',
      'tiers',
      'abilities',
      'enchantments',
      'shop',
    ],
  ),
  Instance: obj({
    id: str,
    defId: str,
    tier,
    enchantment: nullable(str),
    location,
    position: nonnegative,
    acquired: nonnegative,
    modifiers: arr(ref('Modifier')),
    addedTypes: arr(str, 50),
    counters: ref('Numbers'),
    memory: dict(ref('Memory')),
    provenance: str,
  }),
  Snapshot: obj({
    version,
    contentVersion: str,
    id: str,
    name: str,
    day: nonnegative,
    level: nonnegative,
    maxHealth: { type: 'integer', minimum: 1, maximum: 10000000 },
    regen: nonnegative,
    capacity: { type: 'integer', minimum: 1, maximum: 10 },
    items: arr(ref('Instance'), 20),
    skills: arr(ref('Instance'), 100),
    counters: ref('Numbers'),
    difficulty: nonnegative,
  }),
  Reward: obj(
    {
      id: str,
      label: str,
      text: str,
      gold: int,
      xp: nonnegative,
      health: nonnegative,
      income: int,
      item: str,
      skill: str,
      tier,
      enchantment: str,
      target: en('upgrade', 'enchant', 'transform'),
    },
    ['id', 'label', 'text'],
  ),
  Encounter: obj(
    {
      id: str,
      name: str,
      text: str,
      category: en('shop', 'event', 'free'),
      weight: nonnegative,
      minDay: nonnegative,
      maxDay: nonnegative,
      hours: arr({ type: 'integer', minimum: 0, maximum: 5 }, 6),
      exclusion: str,
      prerequisites: arr(ref('Condition'), 20),
      pool: str,
      offerCount: nonnegative,
      rerollCost: nonnegative,
      discount: obj({ type: str, amount: nonnegative }),
      sellBonus: nonnegative,
      rewards: arr(ref('Reward'), 20),
    },
    ['id', 'name', 'text', 'category', 'weight', 'minDay', 'maxDay', 'hours', 'exclusion', 'rewards'],
  ),
  Opponent: obj({
    snapshot: ref('Snapshot'),
    minDay: nonnegative,
    maxDay: nonnegative,
    category: en('monster', 'rival'),
    rewards: arr(ref('Reward'), 20),
    drops: arr(str, 50),
  }),
  Event: obj({
    id: nonnegative,
    time: nonnegative,
    kind: str,
    sourceId: str,
    ownerId: str,
    targets: arr(str, 100),
    parent: nullable(nonnegative),
    batch: nullable(nonnegative),
    depth: nonnegative,
    payload: ref('Payload'),
    hash: str,
  }),
  Fighter: obj({
    id: str,
    name: str,
    maxHealth: int,
    health: int,
    shield: nonnegative,
    burn: nonnegative,
    poison: nonnegative,
    regen: nonnegative,
    meters: ref('Numbers'),
    counters: ref('Numbers'),
    capacity: nonnegative,
    slots: dict(str),
    modifiers: arr(ref('Modifier')),
  }),
  Offer: obj({ id: str, defId: str, tier, enchantment: nullable(str), price: nonnegative, sold: bool }),
  Choice: obj({ reason: str, rewards: arr(ref('Reward'), 20) }),
};
defs.Entity = obj({
  ...(defs.Instance.properties as Record<string, Schema>),
  owner: str,
  progress: nonnegative,
  ammo: nullable(nonnegative),
  destroyed: bool,
  flying: bool,
  statuses: ref('Numbers'),
  runtime: arr(ref('Modifier')),
  generation: nonnegative,
});
defs.Task = obj(
  {
    seq: nonnegative,
    time: nonnegative,
    phase: int,
    priority: int,
    owner: nonnegative,
    position: int,
    sourceId: str,
    kind: en('signal', 'ability', 'cast', 'tick', 'death'),
    parent: nullable(nonnegative),
    batch: nullable(nonnegative),
    depth: nonnegative,
    event: ref('Event'),
    ability: ref('Ability'),
    cast: nonnegative,
    totalCasts: nonnegative,
    forced: bool,
    generation: nonnegative,
    tick: str,
  },
  ['seq', 'time', 'phase', 'priority', 'owner', 'position', 'sourceId', 'kind', 'parent', 'batch', 'depth'],
);
defs.CombatState = obj({
  version,
  contentVersion: str,
  seed: str,
  time: nonnegative,
  players: arr(ref('Fighter'), 2),
  entities: arr(ref('Entity'), 240),
  rng: ref('Numbers'),
  queue: arr(ref('Task'), 20000),
  nextSeq: nonnegative,
  nextEvent: nonnegative,
  outcome: en('ongoing', 'p0', 'p1', 'draw', 'error'),
  error: nullable(str),
  stormStart: nonnegative,
  processed: nonnegative,
});
// Unsigned PRNG words exceed ordinary bounded content values.
defs.Numbers = dict({ type: 'integer', minimum: -4294967295, maximum: 4294967295 });
defs.Payload = dict({ anyOf: [str, { type: 'integer', minimum: -4294967295, maximum: 4294967295 }, bool] });
const command = (type: string, fields: Record<string, Schema> = {}, optional: string[] = []): Schema =>
  obj({ version, revision: nonnegative, type: { const: type }, ...fields }, [
    'version',
    'revision',
    'type',
    ...Object.keys(fields).filter((k) => !optional.includes(k)),
  ]);
defs.Command = {
  oneOf: [
    command('start', { choice: str }),
    command('select', { id: str }),
    command('buy', { offer: str }),
    command('sell', { item: str }),
    command('move', {
      item: str,
      location: en('board', 'stash'),
      position: { type: 'integer', minimum: 0, maximum: 9 },
    }),
    command('reroll'),
    command('leave'),
    command('fight'),
    command('continue'),
    command('choose', { choice: str, target: str }, ['target']),
  ],
};
defs.Run = obj({
  version,
  contentVersion: str,
  seed: str,
  revision: nonnegative,
  rng: ref('Numbers'),
  day: nonnegative,
  hour: { type: 'integer', minimum: 0, maximum: 5 },
  wins: nonnegative,
  prestige: int,
  lastChanceUsed: bool,
  gold: nonnegative,
  income: nonnegative,
  xp: nonnegative,
  level: nonnegative,
  maxHealth: { type: 'integer', minimum: 1 },
  regen: nonnegative,
  capacity: { type: 'integer', minimum: 1, maximum: 10 },
  items: arr(ref('Instance'), 20),
  skills: arr(ref('Instance'), 100),
  nextId: nonnegative,
  counters: ref('Numbers'),
  history: arr(str, 10000),
  dayHistory: arr(str, 100),
  phase: en('start', 'encounter', 'shop', 'choice', 'combat', 'result', 'victory', 'defeat'),
  candidates: arr(str, 10),
  selected: nullable(str),
  offers: arr(ref('Offer'), 20),
  pending: arr(ref('Choice'), 100),
  afterChoices: en('advance', 'encounter', 'terminal'),
  activeOpponent: nullable(str),
  battle: nullable(obj({ outcome: en('ongoing', 'p0', 'p1', 'draw', 'error'), finalHash: str, seed: str })),
  log: arr(ref('Event'), 100000),
  commands: arr(ref('Command'), 20000),
  nextEvent: nonnegative,
});
const ruleNames = [
  'minCooldown',
  'multicastInterval',
  'healCleansePercent',
  'stormStart',
  'stormInterval',
  'stormBase',
  'stormStep',
  'stormCap',
  'timeout',
  'maxDepth',
  'maxEvents',
  'maxEventsPerTime',
  'wins',
  'prestige',
  'xpPerLevel',
  'hourXp',
  'startingGold',
  'startingIncome',
  'startingHealth',
  'healthPerLevel',
  'startingCapacity',
  'stashCapacity',
  'lastChancePrestige',
  'prestigeLossBase',
  'prestigeLossCap',
  'shopSilverDay',
  'shopSilverThreshold',
  'shopGoldDay',
  'shopGoldThreshold',
  'shopEnchantChance',
  'shopEnchantPremium',
  'dropCash',
  'fallbackCash',
];
(defs.CombatState.properties as Record<string, Schema>).persistent = arr(
  obj({ owner: str, targetId: str, action: ref('Action'), amount: int }),
  10000,
);
(defs.CombatState.required as string[]).push('persistent');
(defs.Fighter.properties as Record<string, Schema>).baseMaxHealth = int;
(defs.Fighter.required as string[]).push('baseMaxHealth');
(defs.Task.properties as Record<string, Schema>).kind = en(
  'signal',
  'ability',
  'questReward',
  'cast',
  'tick',
  'death',
);
(defs.Run.properties as Record<string, Schema>).afterChoices = en(
  'advance',
  'encounter',
  'terminal',
  'completeHour',
  'shop',
);
defs.Content = obj({
  version,
  contentVersion: str,
  rules: obj({
    ...Object.fromEntries(ruleNames.map((k) => [k, nonnegative])),
    stormMitigation: en('bypass', 'shield'),
    timeoutPolicy: en('draw', 'highestHealth'),
  }),
  definitions: arr(ref('Definition')),
  pools: dict(arr(str)),
  encounters: arr(ref('Encounter')),
  opponents: arr(ref('Opponent')),
  starts: arr(ref('Reward'), 10),
  levels: dict(arr(ref('Reward'), 20)),
  lastChance: arr(ref('Reward'), 10),
});
defs.Replay = obj({
  version,
  contentVersion: str,
  seed: str,
  initial: { type: 'array', items: ref('Snapshot'), minItems: 2, maxItems: 2 },
  commands: arr(ref('Command'), 20000),
  events: arr(ref('Event'), 100000),
  finalHash: str,
  digest: str,
  final: ref('CombatState'),
});
export const schemas = Object.fromEntries(
  ['Content', 'Snapshot', 'Command', 'Run', 'Replay'].map((name) => [
    name,
    {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $id: `https://night-market.invalid/schema/v1/${name.toLowerCase()}.json`,
      $defs: defs,
      ...ref(name),
    },
  ]),
);
const ajv = new Ajv({ allErrors: true, strict: false });
const validators = Object.fromEntries(
  Object.entries(schemas).map(([name, schema]) => [name, ajv.compile(schema)]),
);
export function validateShape(name: string, data: unknown): void {
  const validator = validators[name];
  if (!validator(data))
    throw new Error(
      `Invalid ${name}: ${ajv.errorsText(validator.errors, { separator: '; ' }).slice(0, 1400)}`,
    );
}
function unique(values: string[], label: string): void {
  if (new Set(values).size !== values.length) throw new Error(`Duplicate ${label}`);
}
function checkSelector(selector: Selector, aura = false): void {
  if (selector.spatial && ['owner', 'enemy'].includes(selector.side))
    throw new Error('Impossible spatial player target');
  if (
    aura &&
    (selector.order === 'random' ||
      selector.order === 'highest' ||
      selector.order === 'lowest' ||
      selector.filters?.some((p) => p.field === 'attribute'))
  )
    throw new Error('Recursive or nondeterministic aura target');
}
function checkAura(aura: Aura): void {
  checkSelector(aura.target, true);
  if (aura.conditions?.some((c) => JSON.stringify(c).match(/"ref":"(source|target|owner|enemy)"|"count"/)))
    throw new Error('Recursive aura expression');
  if (['owner', 'enemy'].includes(aura.target.side) && aura.attribute !== 'maxHealth')
    throw new Error('Player auras support maxHealth; use status/resource actions for other player resources');
}
function checkAction(content: Content, action: Action): void {
  checkSelector(action.target);
  const fields: Partial<Record<Action['kind'], string[]>> = {
    status: ['status', 'amount'],
    modify: ['attribute', 'scope', 'amount'],
    transform: ['pool'],
    publish: ['event'],
    resource: ['attribute', 'amount'],
    type: ['value'],
    meter: ['attribute', 'amount'],
    slot: ['attribute', 'value'],
    enchant: ['value'],
    generate: ['pool'],
  };
  for (const field of fields[action.kind] ?? [])
    if (!(field in action)) throw new Error(`Action ${action.kind} requires ${field}`);
  if (action.pool && !content.pools[action.pool]) throw new Error(`Invalid pool ${action.pool}`);
  if (
    ['damage', 'shield', 'heal'].includes(action.kind) &&
    ['self', 'allyItems', 'enemyItems', 'allItems'].includes(action.target.side)
  )
    throw new Error('Impossible item target for player effect');
  if (
    ['charge', 'reload', 'forceUse', 'destroy', 'repair', 'transform', 'flying'].includes(action.kind) &&
    ['owner', 'enemy'].includes(action.target.side)
  )
    throw new Error('Impossible player target for item effect');
  if (action.scope === 'timed' && !action.duration) throw new Error('Timed mutation needs duration');
  if (
    action.kind === 'modify' &&
    ['owner', 'enemy'].includes(action.target.side) &&
    action.attribute !== 'maxHealth'
  )
    throw new Error('Player attribute modifiers support maxHealth; use status/resource actions');
  if (
    ['type', 'transform'].includes(action.kind) &&
    ['day', 'timed', 'activation'].includes(action.scope ?? '')
  )
    throw new Error('Type/Transform mutations support combat or permanent scope');
  if (
    [
      'damage',
      'shield',
      'heal',
      'status',
      'cleanse',
      'charge',
      'reload',
      'destroy',
      'repair',
      'flying',
      'enchant',
    ].includes(action.kind) &&
    action.scope &&
    action.scope !== 'combat'
  )
    throw new Error(`${action.kind} uses combat scope; persistent run choices use the run reducer`);
  if (
    action.kind === 'status' &&
    ['owner', 'enemy'].includes(action.target.side) &&
    !['burn', 'poison', 'regen'].includes(action.status!)
  )
    throw new Error('Item status cannot target a player');
  if (
    action.kind === 'status' &&
    ['self', 'allyItems', 'enemyItems'].includes(action.target.side) &&
    ['burn', 'poison', 'regen'].includes(action.status!)
  )
    throw new Error('Player status cannot target an item');
}
function checkAbility(content: Content, ability: Ability): void {
  for (const action of ability.actions) checkAction(content, action);
  if (ability.quest && ability.quest.scope !== (ability.trigger.scope ?? 'combat'))
    throw new Error('Quest and trigger scope mismatch');
}
function checkDefinition(content: Content, def: Definition): void {
  const needed =
    def.startingTier === 'legendary' ? ['legendary'] : TIERS.slice(TIERS.indexOf(def.startingTier), 4);
  for (const t of needed)
    if (!def.tiers[t as keyof typeof def.tiers]) throw new Error(`Missing tier data: ${def.id}/${t}`);
  unique(
    def.abilities.map((a) => a.id),
    `ability in ${def.id}`,
  );
  for (const ability of def.abilities) checkAbility(content, ability);
  for (const aura of def.auras ?? []) checkAura(aura);
  for (const enchant of Object.values(def.enchantments)) {
    for (const a of enchant.abilities ?? []) checkAbility(content, a);
    for (const a of enchant.auras ?? []) checkAura(a);
  }
}
export function validateSnapshot(content: Content, data: unknown): asserts data is Snapshot {
  validateShape('Snapshot', data);
  const snapshot = data as Snapshot;
  if (snapshot.contentVersion !== content.contentVersion)
    throw new Error('Snapshot content version mismatch');
  validateGeometry(content, snapshot.items, snapshot.capacity, content.rules.stashCapacity);
  unique(
    [...snapshot.items, ...snapshot.skills].map((i) => i.id),
    'snapshot ID',
  );
  for (const item of [...snapshot.items, ...snapshot.skills]) {
    const def = content.definitions.find((d) => d.id === item.defId);
    if (!def || !def.tiers[item.tier]) throw new Error('Unknown snapshot definition/tier');
    if (item.enchantment && !def.enchantments[item.enchantment])
      throw new Error('Unsupported snapshot enchantment');
    if ((def.kind === 'skill') !== (item.location === 'skills')) throw new Error('Invalid skill location');
    if (item.modifiers.some((m) => !['permanent', 'day', 'run'].includes(m.scope)))
      throw new Error('Snapshot contains a transient modifier');
  }
}
export function validateContent(data: unknown): asserts data is Content {
  validateShape('Content', data);
  const content = data as Content;
  unique(
    content.definitions.map((d) => d.id),
    'definition',
  );
  unique(
    content.encounters.map((e) => e.id),
    'encounter',
  );
  unique(
    content.opponents.map((o) => o.snapshot.id),
    'opponent',
  );
  for (const def of content.definitions) checkDefinition(content, def);
  for (const pool of Object.values(content.pools))
    for (const id of pool)
      if (!content.definitions.some((d) => d.id === id)) throw new Error(`Invalid pool reference ${id}`);
  for (const encounter of content.encounters) {
    if (encounter.category === 'shop' && (!encounter.pool || !content.pools[encounter.pool]))
      throw new Error('Invalid merchant pool');
  }
  const rewards = [
    ...content.starts,
    ...content.lastChance,
    ...Object.values(content.levels).flat(),
    ...content.encounters.flatMap((e) => e.rewards),
    ...content.opponents.flatMap((o) => o.rewards),
  ];
  for (const r of rewards) {
    const id = r.item ?? r.skill;
    if (!id) continue;
    const def = content.definitions.find((d) => d.id === id);
    if (!def || !def.tiers[r.tier ?? def.startingTier]) throw new Error(`Invalid reward reference ${id}`);
    if (r.enchantment && !def.enchantments[r.enchantment]) throw new Error('Unsupported reward enchantment');
  }
  for (const o of content.opponents) {
    validateSnapshot(content, o.snapshot);
    for (const id of o.drops)
      if (!content.definitions.some((d) => d.id === id)) throw new Error('Invalid drop reference');
  }
  const r = content.rules;
  if (
    !r.xpPerLevel ||
    !r.minCooldown ||
    !r.stormInterval ||
    !r.maxDepth ||
    r.stormInterval % 500 !== 0 ||
    r.stormStart < 500 ||
    r.stormStart % 500 !== 0 ||
    r.timeout <= r.stormStart ||
    r.startingCapacity > 10 ||
    r.stashCapacity > 10
  )
    throw new Error('Invalid timing/capacity rule');
}
export function validateCommand(data: unknown): asserts data is Command {
  validateShape('Command', data);
}
export function validateRun(content: Content, data: unknown): asserts data is Run {
  validateShape('Run', data);
  const run = data as Run;
  validateSnapshot(content, {
    version: 1,
    contentVersion: run.contentVersion,
    id: 'save',
    name: 'save',
    day: run.day,
    level: run.level,
    maxHealth: run.maxHealth,
    regen: run.regen,
    capacity: run.capacity,
    items: run.items,
    skills: run.skills,
    counters: run.counters,
    difficulty: 0,
  });
  if (run.phase === 'combat') throw new Error('Save is not at a choice boundary');
  if (
    run.selected &&
    !content.encounters.some((e) => e.id === run.selected) &&
    !content.opponents.some((o) => o.snapshot.id === run.selected)
  )
    throw new Error('Unknown selected encounter');
}
export function validateReplay(content: Content, data: unknown): asserts data is Replay {
  validateShape('Replay', data);
  const replay = data as Replay;
  if (replay.contentVersion !== content.contentVersion) throw new Error('Replay content version mismatch');
  for (const snapshot of replay.initial) validateSnapshot(content, snapshot);
}
