import { content, instance, snapshot } from '../packages/content';
import { clone } from '../packages/sim/src/determinism';
import type { Ability, Content, Snapshot } from '../packages/sim/src/model';
export interface Scenario {
  name: string;
  content: Content;
  initial: [Snapshot, Snapshot];
  seed: string;
}
function scenario(
  name: string,
  left: string[],
  right: string[],
  modify?: (c: Content, initial: [Snapshot, Snapshot]) => void,
): Scenario {
  const c = clone(content);
  c.contentVersion = `night-market-fixture-${name}-1`;
  c.opponents.forEach((o) => (o.snapshot.contentVersion = c.contentVersion));
  const initial: [Snapshot, Snapshot] = [
    snapshot('left', 'Fixture left', left, 400),
    snapshot('right', 'Fixture right', right, 400),
  ];
  initial.forEach((s) => (s.contentVersion = c.contentVersion));
  modify?.(c, initial);
  return { name, content: c, initial, seed: `golden/${name}/1` };
}
export function scenarios(): Scenario[] {
  return [
    scenario('ordering', ['rivet-lance', 'folding-buckler'], ['rivet-lance', 'folding-buckler']),
    scenario('ammo-ready', ['bitter-vial', 'spring-magazine'], ['tea-tray'], (c) => {
      c.definitions.find((d) => d.id === 'spring-magazine')!.tiers.bronze!.cooldown = 11000;
    }),
    scenario(
      'reaction-network',
      ['ember-kettle', 'warm-coil', 'minute-hand', 'echo-anvil'],
      ['winter-fan', 'tar-roller', 'velvet-leech'],
      (_c, initial) => {
        initial[0].skills = [
          instance('cinder-memory', 'skill-a', 0, 'silver', 'skills'),
          instance('careful-hands', 'skill-b', 1, 'bronze', 'skills'),
        ];
        initial[0].items[0].enchantment = 'warded';
        initial[1].items[2].enchantment = 'echo';
      },
    ),
    scenario(
      'destroy-repair',
      ['scrap-magnet', 'rivet-lance', 'workbench'],
      ['echo-anvil', 'patch-drone', 'kite-engine'],
    ),
    scenario(
      'transform',
      ['prism-box', 'bitter-vial', 'spring-magazine', 'clearwater-flask'],
      ['velvet-leech', 'ember-kettle'],
      (_c, initial) => {
        initial[0].items[1].enchantment = 'sheltered';
      },
    ),
    scenario(
      'scopes-and-meters',
      ['rivet-lance', 'folding-buckler'],
      ['tea-tray', 'folding-buckler'],
      (c, initial) => {
        const def = clone(c.definitions.find((d) => d.id === 'field-notes')!);
        def.id = 'fixture-meter-skill';
        def.name = 'Fixture meter observer';
        const ability: Ability = {
          id: 'enable',
          locations: ['skills'],
          trigger: { event: 'combat.start' },
          actions: [
            { kind: 'meter', target: { side: 'owner' }, attribute: 'rageEnabled', amount: 1 },
            { kind: 'meter', target: { side: 'owner' }, attribute: 'tempoEnabled', amount: 1 },
            {
              kind: 'slot',
              target: { side: 'allyItems', spatial: 'leftmost' },
              attribute: 'note',
              value: 'Weapon',
            },
            {
              kind: 'slot',
              target: { side: 'allyItems', spatial: 'rightmost' },
              attribute: 'heated',
              value: true,
            },
            {
              kind: 'status',
              target: { side: 'allyItems', spatial: 'rightmost' },
              status: 'chilled',
              amount: 700,
            },
            {
              kind: 'modify',
              target: { side: 'allyItems', spatial: 'leftmost' },
              attribute: 'damage',
              amount: 3,
              scope: 'permanent',
            },
            { kind: 'modify', target: { side: 'owner' }, attribute: 'maxHealth', amount: 10, scope: 'run' },
          ],
        };
        def.abilities = [
          ability,
          {
            id: 'spend',
            locations: ['skills'],
            trigger: { event: 'item.used', relation: 'owner', every: 3 },
            conditions: [{ left: { ref: 'owner', key: 'tempo' }, op: 'gte', right: 2 }],
            actions: [
              { kind: 'meter', target: { side: 'owner' }, attribute: 'tempo', amount: -2 },
              { kind: 'shield', target: { side: 'owner' }, amount: 5 },
            ],
          },
        ];
        c.definitions.push(def);
        initial[0].skills = [instance(def.id, 'meter-observer', 0, 'bronze', 'skills')];
        initial[0].maxHealth = 1000;
        initial[1].maxHealth = 1000;
      },
    ),
  ];
}
