import type {
  Ability,
  Action,
  Content,
  Definition,
  Enchantment,
  Instance,
  Numbers,
  Opponent,
  Reward,
  Selector,
  Snapshot,
  Tier,
} from '../sim/src/model';

const self: Selector = { side: 'self' },
  owner: Selector = { side: 'owner' },
  enemy: Selector = { side: 'enemy' };
const allies: Selector = { side: 'allyItems' },
  foes: Selector = { side: 'enemyItems' };
const ref = (key: string) => ({ ref: 'source' as const, key });
const active = (id: string, actions: Action[]): Ability => ({
  id,
  trigger: { event: 'activate' },
  locations: ['board'],
  actions,
});
const on = (id: string, event: string, actions: Action[], extra: Partial<Ability> = {}): Ability => ({
  id,
  trigger: { event, relation: 'owner' },
  locations: ['board'],
  actions,
  ...extra,
});
const output = (kind: Action['kind'], key: string, target: Selector = enemy): Action => ({
  kind,
  target,
  amount: ref(key),
});
const status = (status: string, target: Selector, amount: number | ReturnType<typeof ref>): Action => ({
  kind: 'status',
  status,
  target,
  amount,
});
const cooldownFilter = { field: 'cooldown' as const };
const foeRandom: Selector = {
  ...foes,
  filters: [cooldownFilter, { field: 'status', key: 'destroyed', not: true }],
  order: 'random',
  count: 1,
};
const allEnchantments: Record<string, Enchantment> = {
  leaden: {
    abilities: [active('leaden', [status('slow', { ...foeRandom, preferUnstatus: 'slow' }, 650)])],
    capabilities: ['Slow'],
  },
  rime: { abilities: [active('rime', [status('freeze', foeRandom, 350)])], capabilities: ['Freeze'] },
  brisk: {
    abilities: [
      active('brisk', [
        status(
          'haste',
          {
            ...allies,
            other: true,
            filters: [cooldownFilter],
            order: 'random',
            count: 1,
            preferUnstatus: 'haste',
          },
          850,
        ),
      ]),
    ],
    capabilities: ['Haste'],
  },
  warded: {
    abilities: [active('warded', [{ kind: 'shield', target: owner, amount: 5 }])],
    capabilities: ['Shield'],
  },
  mending: {
    abilities: [active('mending', [{ kind: 'heal', target: owner, amount: 6 }])],
    capabilities: ['Heal'],
  },
  venom: { abilities: [active('venom', [status('poison', enemy, 2)])], capabilities: ['Poison'] },
  cinder: { abilities: [active('cinder', [status('burn', enemy, 3)])], capabilities: ['Burn'] },
  echo: { attributes: { multicast: 1 }, capabilities: ['Multicast'] },
  keen: { attributes: { crit: 2500 }, capabilities: ['Crit'] },
  sheltered: {
    protections: ['slow', 'freeze', 'destroy'],
    capabilities: ['AbsorbSlow', 'AbsorbFreeze', 'AbsorbDestroy'],
  },
  flint: {
    abilities: [active('flint', [{ kind: 'damage', target: enemy, amount: 6 }])],
    capabilities: ['Damage'],
  },
  gilded: { attributes: { sell: 7 }, capabilities: ['Value'] },
};
function item(
  id: string,
  name: string,
  size: 1 | 2 | 3,
  types: string[],
  stats: Numbers,
  abilities: Ability[],
  text: string,
  extra: Partial<Definition> = {},
): Definition {
  const tierStats = (factor: number): Numbers =>
    Object.fromEntries(
      Object.entries(stats).map(([k, v]) => [
        k,
        ['damage', 'shield', 'heal', 'regen', 'burn', 'poison'].includes(k) ? v * factor : v,
      ]),
    );
  const base = { buy: 3 + size * 2, sell: 1 + size, ...stats };
  const tiers = Object.fromEntries(
    (['bronze', 'silver', 'gold', 'diamond'] as Tier[]).map((tier, i) => [
      tier,
      { ...base, ...tierStats(i + 1), buy: base.buy + 3 * i, sell: base.sell + 2 * i },
    ]),
  );
  const capabilities = [
    ...new Set(
      abilities
        .flatMap((a) => a.actions.map((x) => (x.kind === 'status' ? String(x.status) : x.kind)))
        .filter((x) => !['publish', 'modify'].includes(x))
        .map((x) => x[0].toUpperCase() + x.slice(1)),
    ),
  ];
  if (stats.cooldown) capabilities.push('Cooldown');
  if (stats.ammo !== undefined) capabilities.push('Ammo');
  if (stats.crit) capabilities.push('Crit');
  if (stats.multicast && stats.multicast > 1) capabilities.push('Multicast');
  const enchants = stats.cooldown
    ? allEnchantments
    : { gilded: allEnchantments.gilded, sheltered: allEnchantments.sheltered };
  return {
    id,
    name,
    size,
    types,
    kind: 'item',
    pool: 'neutral',
    startingTier: 'bronze',
    capabilities,
    references: [],
    tiers,
    abilities,
    text,
    enchantments: enchants,
    shop: { enabled: true, weight: 3, minDay: 1 },
    ...extra,
  };
}
const definitions: Definition[] = [
  item(
    'rivet-lance',
    'Rivet Lance',
    2,
    ['Weapon', 'Tool'],
    { cooldown: 2600, damage: 16 },
    [active('thrust', [output('damage', 'damage')])],
    'A steady strike. A useful spine for a growing board.',
  ),
  item(
    'folding-buckler',
    'Folding Buckler',
    1,
    ['Apparel', 'Tool'],
    { cooldown: 3300, shield: 12 },
    [active('guard', [output('shield', 'shield', owner)])],
    'Build Shield before the next blow lands.',
  ),
  item(
    'ember-kettle',
    'Ember Kettle',
    2,
    ['Food', 'Tool'],
    { cooldown: 4900, burn: 7 },
    [active('steam', [status('burn', enemy, ref('burn'))])],
    'Apply Burn. Burn ticks every half second and decays.',
  ),
  item(
    'bitter-vial',
    'Bitter Vial',
    1,
    ['Potion'],
    { cooldown: 3100, poison: 6, ammo: 2 },
    [active('spill', [status('poison', enemy, ref('poison'))])],
    'Two doses. The timer continues filling when the vial is empty.',
  ),
  item(
    'spring-magazine',
    'Spring Magazine',
    1,
    ['Tech', 'Tool'],
    { cooldown: 6700 },
    [
      active('refill', [
        {
          kind: 'reload',
          target: { ...allies, spatial: 'left', filters: [{ field: 'ammo' }] },
          amount: 'full',
        },
      ]),
    ],
    'Fully reload the item immediately to its left.',
  ),
  item(
    'paced-courier',
    'Paced Courier',
    2,
    ['Companion', 'Vehicle'],
    { cooldown: 5600 },
    [active('pace', [status('haste', { ...allies, spatial: 'adjacent', filters: [cooldownFilter] }, 1800)])],
    'Haste adjacent cooldown items for 1.8 seconds.',
  ),
  item(
    'winter-fan',
    'Winter Fan',
    2,
    ['Tech'],
    { cooldown: 6500 },
    [
      active('chill', [
        status(
          'freeze',
          { ...foeRandom, filters: [cooldownFilter, { field: 'size', value: 2, compare: 'lte' }] },
          1100,
        ),
      ]),
    ],
    'Freeze one random small or medium enemy cooldown item.',
  ),
  item(
    'tar-roller',
    'Tar Roller',
    2,
    ['Tool'],
    { cooldown: 5200 },
    [active('tar', [status('slow', { ...foeRandom, preferUnstatus: 'slow' }, 2200)])],
    'Slow a random enemy timer. Prefer one that is not already Slowed.',
  ),
  item(
    'minute-hand',
    'Minute Hand',
    1,
    ['Relic'],
    { cooldown: 3400 },
    [
      active('nudge', [
        { kind: 'charge', target: { ...allies, spatial: 'right', filters: [cooldownFilter] }, amount: 950 },
      ]),
    ],
    'Charge the item to its right by 0.95 seconds.',
  ),
  item(
    'tea-tray',
    'Tea Tray',
    2,
    ['Food'],
    { cooldown: 4700, heal: 18, regen: 1 },
    [active('serve', [output('heal', 'heal', owner), status('regen', owner, ref('regen'))])],
    'Heal and gain Regen. Ordinary healing also partially cleanses.',
  ),
  item(
    'moss-jar',
    'Moss Jar',
    1,
    ['Reagent', 'Relic'],
    { regen: 3 },
    [
      on('root', 'combat.start', [status('regen', owner, ref('regen'))], {
        trigger: { event: 'combat.start' },
      }),
    ],
    'At combat start, gain Regen.',
  ),
  item(
    'echo-anvil',
    'Echo Anvil',
    3,
    ['Weapon', 'Instrument'],
    { cooldown: 5900, damage: 13, shield: 7, multicast: 2, crit: 2000 },
    [active('ring', [output('damage', 'damage'), output('shield', 'shield', owner)])],
    'Two separate casts. Each rolls one shared crit for its Damage and Shield.',
  ),
  item(
    'velvet-leech',
    'Velvet Leech',
    2,
    ['Weapon', 'Companion'],
    { cooldown: 3700, damage: 14, lifesteal: 10000 },
    [active('sip', [output('damage', 'damage')])],
    'Heal for Shield and Health damage dealt. Lifesteal does not cleanse.',
    { references: ['HealReference'], capabilities: ['Damage', 'Lifesteal', 'Cooldown'] },
  ),
  item(
    'kite-engine',
    'Kite Engine',
    3,
    ['Vehicle', 'Weapon'],
    { cooldown: 4000, damage: 25, flying: 1 },
    [active('dive', [output('damage', 'damage')])],
    'Starts Flying. Incoming Slow and Freeze durations are halved.',
    { capabilities: ['Damage', 'Flying', 'Cooldown'] },
  ),
  item(
    'scrap-magnet',
    'Scrap Magnet',
    2,
    ['Tech', 'Tool'],
    { cooldown: 11500 },
    [
      active('disassemble', [
        { kind: 'destroy', target: { ...foeRandom, order: 'lowest', attribute: 'sell' } },
      ]),
    ],
    'Disable the eligible enemy cooldown item with the lowest sell value.',
  ),
  item(
    'patch-drone',
    'Patch Drone',
    1,
    ['Tech', 'Companion'],
    { cooldown: 6400, shield: 5 },
    [
      active('patch', [
        { kind: 'repair', target: { ...allies, filters: [{ field: 'status', key: 'destroyed' }], count: 1 } },
        output('shield', 'shield', owner),
      ]),
    ],
    'Repair the first destroyed ally, then gain Shield.',
  ),
  item(
    'clearwater-flask',
    'Clearwater Flask',
    1,
    ['Potion'],
    { cooldown: 5800, heal: 9, ammo: 3 },
    [
      active('wash', [
        { kind: 'cleanse', target: owner, statuses: ['burn', 'poison'], mode: 'percent', amount: 50 },
        output('heal', 'heal', owner),
      ]),
    ],
    'Cleanse half of Burn and Poison, then Heal.',
  ),
  item(
    'copper-ledger',
    'Copper Ledger',
    1,
    ['Relic'],
    {},
    [
      on('visit', 'merchant.visited', [{ kind: 'resource', target: owner, attribute: 'gold', amount: 2 }], {
        locations: ['board', 'stash'],
        trigger: { event: 'merchant.visited', relation: 'owner', scope: 'run' },
      }),
      on(
        'save-value',
        'item.bought',
        [{ kind: 'modify', target: self, attribute: 'sell', op: 'add', scope: 'permanent', amount: 1 }],
        { locations: ['board', 'stash'], trigger: { event: 'item.bought', relation: 'owner', scope: 'run' } },
      ),
    ],
    'From board or stash: gain 2 gold on merchant visits and permanently gain 1 sell value on purchases.',
    {
      enchantments: {
        gilded: {
          abilities: [
            on(
              'gold-extra',
              'item.bought',
              [{ kind: 'modify', target: self, attribute: 'sell', scope: 'permanent', amount: 1 }],
              {
                locations: ['board', 'stash'],
                trigger: { event: 'item.bought', relation: 'owner', scope: 'run' },
              },
            ),
          ],
        },
        sheltered: allEnchantments.sheltered,
      },
    },
  ),
  item(
    'survey-kit',
    'Survey Kit',
    2,
    ['Tool', 'Relic'],
    {},
    [
      on(
        'survey',
        'item.bought',
        [
          {
            kind: 'modify',
            target: {
              ...allies,
              location: ['board', 'stash'],
              filters: [{ field: 'type', value: 'Weapon' }],
            },
            attribute: 'damage',
            scope: 'permanent',
            amount: 7,
          },
        ],
        {
          locations: ['board', 'stash'],
          trigger: {
            event: 'item.bought',
            relation: 'owner',
            scope: 'run',
            source: [{ field: 'type', value: 'Tool' }],
          },
          quest: { required: 3, scope: 'run' },
        },
      ),
    ],
    'Quest: buy 3 Tools. Permanently give all owned Weapons +7 Damage.',
  ),
  item(
    'warm-coil',
    'Warm Coil',
    1,
    ['Tech'],
    { cooldown: 4500, damage: 7 },
    [
      active('coil', [output('damage', 'damage')]),
      on('heat-feed', 'burn.applied', [{ kind: 'charge', target: self, amount: 450 }], {
        trigger: { event: 'burn.applied', relation: 'owner' },
        internalCooldown: 500,
      }),
    ],
    'When you apply Burn, Charge this by 0.45 seconds (0.5 second internal cooldown).',
    { references: ['BurnReference'], capabilities: ['Damage', 'Charge', 'Cooldown'] },
  ),
  item(
    'workbench',
    'Pocket Workbench',
    2,
    ['Property', 'Tool'],
    {},
    [],
    'While on board, adjacent Weapons have +8 Damage.',
    {
      auras: [
        {
          id: 'edge',
          locations: ['board'],
          target: { ...allies, spatial: 'adjacent', filters: [{ field: 'type', value: 'Weapon' }] },
          attribute: 'damage',
          op: 'add',
          value: 8,
        },
      ],
      references: ['DamageReference'],
    },
  ),
  item(
    'prism-box',
    'Prism Box',
    2,
    ['Relic'],
    { cooldown: 13000 },
    [
      active('recast', [
        {
          kind: 'transform',
          target: {
            ...allies,
            other: true,
            filters: [{ field: 'size', compare: 'eq', value: 1 }],
            order: 'random',
            count: 1,
          },
          pool: 'neutral',
        },
      ]),
    ],
    'Transform one other small ally into a random same-size item for this fight.',
  ),
  item(
    'tuning-pin',
    'Tuning Pin',
    1,
    ['Instrument', 'Tool'],
    { cooldown: 4200 },
    [
      active('tune', [
        {
          kind: 'modify',
          target: {
            ...allies,
            other: true,
            order: 'highest',
            attribute: 'cooldown',
            filters: [cooldownFilter],
            count: 1,
          },
          attribute: 'cooldown',
          op: 'add',
          amount: -180,
          scope: 'combat',
        },
      ]),
    ],
    'Reduce the longest allied cooldown by 0.18 seconds for the fight.',
  ),
  item(
    'second-bell',
    'Second Bell',
    1,
    ['Instrument'],
    {},
    [
      on('echo-use', 'item.used', [{ kind: 'forceUse', target: { side: 'eventSource' } }], {
        trigger: { event: 'item.used', relation: 'other', every: 5, first: 2, oncePer: 'batch' },
        internalCooldown: 1800,
      }),
    ],
    'Every fifth other allied item use: force that item to cast. Twice per fight.',
  ),
  item(
    'rain-stitch',
    'Rain Stitch',
    1,
    ['Apparel'],
    { cooldown: 5200, shield: 9 },
    [
      active('stitch', [
        output('shield', 'shield', owner),
        { kind: 'type', target: { ...allies, spatial: 'right' }, value: 'Aquatic', scope: 'combat' },
      ]),
    ],
    'Gain Shield and give the right neighbor the Aquatic type for the fight.',
  ),
  item(
    'lift-ribbon',
    'Lift Ribbon',
    1,
    ['Apparel'],
    { cooldown: 6200 },
    [
      active('lift', [
        {
          kind: 'flying',
          target: { ...allies, other: true, order: 'highest', attribute: 'damage', count: 1 },
          value: true,
        },
      ]),
    ],
    'Make the other ally with the most Damage Flying.',
  ),
  item(
    'sand-hourglass',
    'Sand Hourglass',
    2,
    ['Relic'],
    { cooldown: 12000, damage: 10 },
    [
      active('sand', [
        output('damage', 'damage'),
        { kind: 'publish', event: 'sandstorm.start', target: owner },
      ]),
    ],
    'Deal Damage and bring the storm forward.',
  ),
  item(
    'return-token',
    'Return Token',
    1,
    ['Relic'],
    {},
    [
      on('return', 'death.proposed', [{ kind: 'heal', target: owner, amount: 55, cleanses: false }], {
        trigger: { event: 'death.proposed', relation: 'owner', first: 1 },
      }),
    ],
    'The first time you would die each fight, Heal 55 before death is committed.',
  ),
  item(
    'sealed-star',
    'Sealed Star',
    3,
    ['Relic', 'Weapon'],
    { cooldown: 4400, damage: 56 },
    [active('starlight', [output('damage', 'damage')])],
    'A rare terminal-tier relic.',
    {
      startingTier: 'legendary',
      tiers: { legendary: { cooldown: 4400, damage: 56, buy: 28, sell: 14 } },
      shop: { enabled: false, weight: 1, minDay: 8 },
      enchantments: { sheltered: allEnchantments.sheltered },
    },
  ),
];
function skill(
  id: string,
  name: string,
  text: string,
  abilities: Ability[],
  extra: Partial<Definition> = {},
): Definition {
  return item(
    id,
    name,
    1,
    [],
    {},
    abilities.map((a) => ({ ...a, locations: ['skills'] })),
    text,
    { kind: 'skill', shop: { enabled: false, weight: 1, minDay: 1 }, enchantments: {}, ...extra },
  );
}
definitions.push(
  skill(
    'opening-cushion',
    'Opening Cushion',
    'Start combat with 20 Shield.',
    [
      on('cushion', 'combat.start', [{ kind: 'shield', target: owner, amount: ref('shield') }], {
        trigger: { event: 'combat.start' },
      }),
    ],
    {
      tiers: {
        bronze: { shield: 20 },
        silver: { shield: 35 },
        gold: { shield: 50 },
        diamond: { shield: 70 },
      },
    },
  ),
  skill(
    'cinder-memory',
    'Cinder Memory',
    'Every third allied use applies 2 Burn.',
    [
      on('memory', 'item.used', [status('burn', enemy, ref('burn'))], {
        trigger: { event: 'item.used', relation: 'owner', every: 3 },
      }),
    ],
    { tiers: { bronze: { burn: 2 }, silver: { burn: 3 }, gold: { burn: 4 }, diamond: { burn: 5 } } },
  ),
  skill(
    'careful-hands',
    'Careful Hands',
    'Once each second, gaining Shield Charges the leftmost Weapon by 0.25 seconds.',
    [
      on(
        'hands',
        'shield.gained',
        [
          {
            kind: 'charge',
            target: { ...allies, filters: [{ field: 'type', value: 'Weapon' }], spatial: 'leftmost' },
            amount: 250,
          },
        ],
        { internalCooldown: 1000 },
      ),
    ],
  ),
  skill('spare-change', 'Spare Change', 'Gain 1 gold at each hour completion.', [
    on('change', 'hour.completed', [{ kind: 'resource', target: owner, attribute: 'gold', amount: 1 }], {
      trigger: { event: 'hour.completed', relation: 'owner', scope: 'run' },
    }),
  ]),
  skill('steady-aim', 'Steady Aim', 'Your Weapons have +15% crit chance.', [], {
    auras: [
      {
        id: 'aim',
        locations: ['skills'],
        target: { ...allies, filters: [{ field: 'type', value: 'Weapon' }] },
        attribute: 'crit',
        op: 'add',
        value: 1500,
      },
    ],
  }),
  skill('soothing-hum', 'Soothing Hum', 'After applying Poison, Heal 4. At most once per second.', [
    on('hum', 'poison.applied', [{ kind: 'heal', target: owner, amount: 4 }], { internalCooldown: 1000 }),
  ]),
  skill('field-notes', 'Field Notes', 'The first two purchases each day grant 1 XP.', [
    on('notes', 'item.bought', [{ kind: 'resource', target: owner, attribute: 'xp', amount: 1 }], {
      trigger: { event: 'item.bought', relation: 'owner', scope: 'day', first: 2 },
    }),
  ]),
  skill('weather-eye', 'Weather Eye', 'At half Health, cleanse all Burn and Poison once per fight.', [
    on(
      'eye',
      'health.threshold',
      [{ kind: 'cleanse', target: owner, statuses: ['burn', 'poison'], mode: 'all' }],
      { trigger: { event: 'health.threshold', relation: 'owner', first: 1 } },
    ),
  ]),
);

export function instance(
  defId: string,
  id: string,
  position = 0,
  tier: Tier = 'bronze',
  location: Instance['location'] = 'board',
): Instance {
  return {
    id,
    defId,
    tier,
    enchantment: null,
    location,
    position,
    acquired: position,
    modifiers: [],
    addedTypes: [],
    counters: {},
    memory: {},
    provenance: 'content',
  };
}
export function snapshot(
  id: string,
  name: string,
  ids: string[],
  health = 140,
  tier: Tier = 'bronze',
  skills: string[] = [],
): Snapshot {
  let position = 0;
  const items = ids.map((defId, i) => {
    const item = instance(defId, `${id}-${i}`, position, tier);
    position += definitions.find((d) => d.id === defId)!.size;
    return item;
  });
  return {
    version: 1,
    contentVersion: 'night-market-1',
    id,
    name,
    day: 1,
    level: 1,
    maxHealth: health,
    regen: 0,
    capacity: 10,
    items,
    skills: skills.map((defId, i) => instance(defId, `${id}-skill-${i}`, i, tier, 'skills')),
    counters: {},
    difficulty: 1,
  };
}
const opponents: Opponent[] = [];
const builds = [
  {
    name: 'Tin Watch',
    ids: ['rivet-lance', 'folding-buckler', 'minute-hand'],
    drop: 'rivet-lance',
    skill: 'opening-cushion',
  },
  {
    name: 'Lantern Keeper',
    ids: ['ember-kettle', 'warm-coil', 'tea-tray'],
    drop: 'ember-kettle',
    skill: 'cinder-memory',
  },
  {
    name: 'Marsh Runner',
    ids: ['bitter-vial', 'spring-magazine', 'velvet-leech'],
    drop: 'bitter-vial',
    skill: 'soothing-hum',
  },
  {
    name: 'Gutter Sentry',
    ids: ['velvet-leech', 'moss-jar', 'tar-roller'],
    drop: 'velvet-leech',
    skill: 'weather-eye',
  },
];
for (let band = 0; band < 5; band++)
  for (let i = 0; i < builds.length; i++)
    for (const category of ['monster', 'rival'] as const) {
      const build = builds[i],
        tier = (['bronze', 'silver', 'silver', 'gold', 'diamond'] as Tier[])[band];
      const ids = [...build.ids];
      if (band >= 1) ids.push(i === 0 ? 'paced-courier' : i === 1 ? 'folding-buckler' : 'tar-roller');
      if (band >= 3) ids.push('minute-hand');
      const snap = snapshot(
        `${category}-${band}-${i}`,
        `${build.name} ${['I', 'II', 'III', 'IV', 'V'][band]}`,
        ids,
        (category === 'monster' ? 85 : 125) + band * 90 + i * 15,
        tier,
        band ? [build.skill] : [],
      );
      snap.day = band * 3 + 1;
      snap.level = band * 3 + 1;
      snap.difficulty = i + 1;
      opponents.push({
        snapshot: snap,
        minDay: band * 3 + 1,
        maxDay: band === 4 ? 99 : band * 3 + 3,
        category,
        rewards: [{ id: 'spoils', label: 'Spoils', text: 'Guaranteed on victory', gold: 3 + band, xp: 3 }],
        drops: [build.drop, 'folding-buckler', build.skill],
      });
    }
const levels: Content['levels'] = {
  '2': [
    {
      id: 'small',
      label: 'Enchanted small',
      text: 'A cinder-enchanted Minute Hand.',
      item: 'minute-hand',
      enchantment: 'cinder',
    },
    { id: 'skill', label: 'Opening Cushion', text: 'Start fights with Shield.', skill: 'opening-cushion' },
    { id: 'reserve', label: 'Healthy reserves', text: '+28 maximum Health and 5 gold.', health: 28, gold: 5 },
  ],
  '3': [
    { id: 'tool', label: 'Pocket Workbench', text: 'Build around adjacency.', item: 'workbench' },
    { id: 'aim', label: 'Steady Aim', text: 'Weapon crit aura.', skill: 'steady-aim' },
    { id: 'cash', label: 'Market purse', text: '9 gold.', gold: 9 },
  ],
  '4': [
    { id: 'upgrade', label: 'Upgrade an item', text: 'Advance one standard tier.', target: 'upgrade' },
    {
      id: 'silver',
      label: 'Silver Tea Tray',
      text: 'A stronger restorative item.',
      item: 'tea-tray',
      tier: 'silver',
    },
    { id: 'income', label: 'Steady trade', text: '+2 income.', income: 2 },
  ],
  '5': [
    {
      id: 'enchant',
      label: 'Shelter an item',
      text: 'Absorb Freeze, Slow and Destroy.',
      target: 'enchant',
      enchantment: 'sheltered',
    },
    {
      id: 'skill',
      label: 'Cinder Memory',
      text: 'A Silver passive.',
      skill: 'cinder-memory',
      tier: 'silver',
    },
    { id: 'health', label: 'Long breath', text: '+50 maximum Health.', health: 50 },
  ],
  default: [
    { id: 'upgrade', label: 'Upgrade an item', text: 'Advance one standard tier.', target: 'upgrade' },
    { id: 'gift', label: 'Echo Anvil', text: 'A Gold multicast item.', item: 'echo-anvil', tier: 'gold' },
    { id: 'health', label: 'Endurance', text: '+40 maximum Health and 6 gold.', health: 40, gold: 6 },
  ],
};
export const content: Content = {
  version: 1,
  contentVersion: 'night-market-1',
  rules: {
    minCooldown: 200,
    multicastInterval: 120,
    healCleansePercent: 10,
    stormStart: 30000,
    stormInterval: 1000,
    stormBase: 4,
    stormStep: 5,
    stormCap: 1000,
    stormMitigation: 'bypass',
    timeout: 90000,
    timeoutPolicy: 'draw',
    maxDepth: 64,
    maxEvents: 18000,
    maxEventsPerTime: 1800,
    wins: 10,
    prestige: 24,
    xpPerLevel: 8,
    hourXp: 1,
    startingGold: 9,
    startingIncome: 5,
    startingHealth: 175,
    healthPerLevel: 24,
    startingCapacity: 5,
    stashCapacity: 10,
    lastChancePrestige: 1,
    prestigeLossBase: 1,
    prestigeLossCap: 12,
    shopSilverDay: 4,
    shopSilverThreshold: 45,
    shopGoldDay: 9,
    shopGoldThreshold: 25,
    shopEnchantChance: 12,
    shopEnchantPremium: 3,
    dropCash: 4,
    fallbackCash: 6,
  },
  definitions,
  pools: {
    neutral: definitions.filter((d) => d.kind === 'item' && d.startingTier !== 'legendary').map((d) => d.id),
    tools: definitions.filter((d) => d.kind === 'item' && d.types.includes('Tool')).map((d) => d.id),
    volatile: definitions
      .filter((d) =>
        ['ember-kettle', 'bitter-vial', 'warm-coil', 'winter-fan', 'tar-roller', 'clearwater-flask'].includes(
          d.id,
        ),
      )
      .map((d) => d.id),
    skills: definitions.filter((d) => d.kind === 'skill').map((d) => d.id),
  },
  starts: [
    {
      id: 'economy',
      label: 'A stall of your own',
      text: '+11 gold and +2 income. Includes a Rivet Lance.',
      gold: 11,
      income: 2,
      item: 'rivet-lance',
    },
    {
      id: 'enchanted',
      label: 'A warm little secret',
      text: 'A cinder-enchanted Folding Buckler and a Rivet Lance.',
      item: 'folding-buckler',
      enchantment: 'cinder',
    },
    {
      id: 'skill',
      label: 'Learn the evening rhythm',
      text: 'Cinder Memory, a Rivet Lance, and +20 maximum Health.',
      skill: 'cinder-memory',
      health: 20,
    },
  ],
  levels,
  lastChance: [
    {
      id: 'diamond',
      label: 'One last instrument',
      text: 'A Diamond Echo Anvil.',
      item: 'echo-anvil',
      tier: 'diamond',
    },
    {
      id: 'enchant',
      label: 'A sheltered future',
      text: 'Enchant an item with Sheltered.',
      target: 'enchant',
      enchantment: 'sheltered',
    },
    { id: 'capital', label: 'A fresh line of credit', text: '18 gold and 6 XP.', gold: 18, xp: 6 },
  ],
  encounters: [
    {
      id: 'open-stalls',
      name: 'The Open Stalls',
      text: 'A broad selection from the evening market.',
      category: 'shop',
      weight: 5,
      minDay: 1,
      maxDay: 99,
      hours: [0, 1, 3, 4],
      exclusion: 'general',
      pool: 'neutral',
      offerCount: 5,
      rerollCost: 2,
      rewards: [],
    },
    {
      id: 'tool-cart',
      name: 'The Tool Cart',
      text: 'Tools for surprising neighbors. Tools cost 1 less.',
      category: 'shop',
      weight: 4,
      minDay: 1,
      maxDay: 99,
      hours: [0, 1, 3, 4],
      exclusion: 'tools',
      pool: 'tools',
      offerCount: 4,
      rerollCost: 2,
      discount: { type: 'Tool', amount: 1 },
      sellBonus: 1,
      rewards: [],
    },
    {
      id: 'glass-stall',
      name: 'Glass & Weather',
      text: 'Status effects in small containers.',
      category: 'shop',
      weight: 3,
      minDay: 1,
      maxDay: 99,
      hours: [0, 1, 3, 4],
      exclusion: 'glass',
      pool: 'volatile',
      offerCount: 4,
      rerollCost: 3,
      rewards: [],
    },
    {
      id: 'quiet-table',
      name: 'A Quiet Table',
      text: 'Rest, study, or improve your trade.',
      category: 'event',
      weight: 4,
      minDay: 1,
      maxDay: 99,
      hours: [0, 1, 3, 4],
      exclusion: 'rest',
      rewards: [
        { id: 'rest', label: 'Rest', text: '+24 maximum Health.', health: 24 },
        { id: 'study', label: 'Study', text: '+3 XP.', xp: 3 },
        { id: 'trade', label: 'Make a connection', text: '+1 income.', income: 1 },
      ],
    },
    {
      id: 'repair-bench',
      name: 'The Patient Artisan',
      text: 'Improve a familiar object or take payment.',
      category: 'event',
      weight: 3,
      minDay: 2,
      maxDay: 99,
      hours: [0, 1, 3, 4],
      exclusion: 'artisan',
      rewards: [
        { id: 'upgrade', label: 'Refine', text: 'Upgrade one item.', target: 'upgrade' },
        {
          id: 'transform',
          label: 'Reimagine',
          text: 'Transform one item into another of the same size and tier.',
          target: 'transform',
        },
        { id: 'gold', label: 'Help out', text: '+5 gold.', gold: 5 },
      ],
    },
    {
      id: 'night-school',
      name: 'Night School',
      text: 'Choose a passive skill. Skills occupy no board space.',
      category: 'event',
      weight: 3,
      minDay: 1,
      maxDay: 99,
      hours: [0, 1, 3, 4],
      exclusion: 'school',
      rewards: [
        { id: 'hands', label: 'Careful Hands', text: 'Shield charges a Weapon.', skill: 'careful-hands' },
        { id: 'notes', label: 'Field Notes', text: 'Earn XP from purchases.', skill: 'field-notes' },
        { id: 'change', label: 'Spare Change', text: 'Gold every hour.', skill: 'spare-change' },
      ],
    },
    {
      id: 'rain-altar',
      name: 'The Rain Altar',
      text: 'Choose an enchantment for a compatible item.',
      category: 'event',
      weight: 2,
      minDay: 2,
      maxDay: 99,
      hours: [0, 1, 3, 4],
      exclusion: 'altar',
      rewards: [
        {
          id: 'venom',
          label: 'Venom',
          text: 'Add Poison to an active item.',
          target: 'enchant',
          enchantment: 'venom',
        },
        { id: 'echo', label: 'Echo', text: 'Add one cast.', target: 'enchant', enchantment: 'echo' },
        { id: 'gold', label: 'Collect offerings', text: '+6 gold.', gold: 6 },
      ],
    },
    {
      id: 'found-purse',
      name: 'A Forgotten Purse',
      text: 'A small windfall, no obligations.',
      category: 'free',
      weight: 5,
      minDay: 1,
      maxDay: 99,
      hours: [0, 1, 3, 4],
      exclusion: 'purse',
      rewards: [{ id: 'purse', label: 'Collect', text: '+5 gold.', gold: 5 }],
    },
    {
      id: 'gift-crate',
      name: 'An Unclaimed Crate',
      text: 'Choose a small item or sell the crate.',
      category: 'free',
      weight: 4,
      minDay: 1,
      maxDay: 99,
      hours: [0, 1, 3, 4],
      exclusion: 'crate',
      rewards: [
        { id: 'vial', label: 'Bitter Vial', text: 'A Poison item.', item: 'bitter-vial' },
        { id: 'ledger', label: 'Copper Ledger', text: 'A stash economy item.', item: 'copper-ledger' },
        { id: 'gold', label: 'Sell the crate', text: '+4 gold.', gold: 4 },
      ],
    },
  ],
  opponents,
};
export const rewardLabel = (reward: Reward): string => reward.label;
