# Authoring original content

Edit `packages/content/index.ts`, then run `npm run fixtures`, `npm test` and `npm run typecheck`. The small `item`, `skill`, `active` and `on` helpers build ordinary declarative data; the exported `content/catalog.v1.json` is the complete language-neutral result. New items, skills, encounters, monsters and opponents require no engine edits when they use the existing grammar.

The browser currently bundles the TypeScript catalog. Editing the exported JSON alone does not change the application. JSON is provided for inspection, validation and future ports. Keep `contentVersion` immutable for released saves; changing rules/content requires a new version and reviewed golden expectations.

## Definitions and instances

A definition needs a unique ASCII ID, original name/text, kind, pool, size, starting tier, visible types, capabilities, references, tier values, abilities, supported enchantments and shop eligibility. Standard items provide every tier from their starting tier through Diamond. Legendary provides its own terminal tier and is not an upgrade beyond Diamond. Buy and sell values are independent.

Types, capabilities and references are different fields. For example, an item reacting to Burn can have `references: ['BurnReference']` without `capabilities: ['Burn']`. A Poison output item has Poison capability. Enchantments explicitly add their output capabilities. Adding a type does not automatically add Damage, a cooldown, Ammo or any other behavior. The item helper derives basic output capabilities; custom definitions must declare theirs accurately.

Never put mutable progress or current Ammo on a definition. Instances track identity, tier, enchantment, permanent changes, acquisition order, counters and provenance; the combat layer owns temporary state. Generated copies may coexist, while ordinary acquisition uses duplicate-upgrade policy.

## An ability is data

```ts
{
  id: 'after-embers',
  locations: ['board'],
  trigger: {
    event: 'burn.applied',
    relation: 'owner',
    every: 2,
    scope: 'combat',
    oncePer: 'batch'
  },
  internalCooldown: 800,
  priority: -10,
  conditions: [
    { left: { ref: 'owner', key: 'health' }, op: 'lt', right: 100 }
  ],
  actions: [
    {
      kind: 'charge',
      target: { side: 'allyItems', spatial: 'right', filters: [{ field: 'cooldown' }] },
      amount: 650
    }
  ]
}
```

`activate` abilities participate in the normal cast pipeline. Reactions, skills and run lifecycle abilities share the same evaluator. `locations` is per ability, so one item can have a stashed economy ability and a board-only combat ability. Passive reactions do not themselves count as item use. Forced use is explicit.

`first` limits successful firings; `every` counts qualifying observed events; `scope` selects memory reset at combat/day/run. `oncePer` can deduplicate a parent or cast batch. Source relations are self, another allied item, any owner source, enemy, or unrestricted. Conditions run when the queued ability resolves, and the inspector records their numeric operands. Failed source/location/condition/limit checks are visible events.

A quest adds `quest: { required, scope, repeatable?, overflow? }`. Completion emits its event before a phase-25 reward task. To unlock an ability, predeclare it with a condition on a custom numeric attribute such as `unlocked`, then let the quest reward set that attribute. The completing event cannot use the newly enabled effect because its ordinary phase-20 reactions resolve before the unlock.

## Selectors and expressions

Selectors compose side, locations, geometry, filters, ordering and count:

| Field      | Supported choices                                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `side`     | self, owner, enemy, allyItems, enemyItems, allItems, eventSource, eventTargets, previous                                                                      |
| `spatial`  | left, right, adjacent, leftmost, rightmost                                                                                                                    |
| filters    | type, capability, reference, exact/ranged size, size relative to source, cooldown, Ammo full/empty/notFull, status, attribute comparison; each can be negated |
| order      | position, random, highest, lowest; ranking names an attribute                                                                                                 |
| additional | other, count, preferUnstatus, excludeProtected                                                                                                                |

Random selection is without replacement. Counts mean “up to N”; zero candidates fizzle only that action. AllItems still means item instances, not skills. Item-list selectors default to board location. Destroyed targets are not implicitly excluded: add a negated destroyed-status filter for active-only behavior, or a positive one for Repair. This allows both protected-target exclusion and selection followed by absorption.

An amount is an integer, a reference, a deterministic selector count, a distinct-type count, or an arithmetic expression. References include source/target derived attributes, owner/enemy state, tier values, event payloads and run counters. Operators are add, subtract, multiply, floor divide, min and max. Random selector counts, division by zero and unsafe intermediates are rejected. Duration and Charge amounts are milliseconds. Crit, Lifesteal and modifier ratios use basis points.

## Effect vocabulary

| Verb               | Resolution and authoring notes                                                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| damage             | Player target; Shield then Health, unless `bypassShield`. Logs damage stages; item Lifesteal is applied afterward.                              |
| shield / heal      | Player target. Heal logs attempted/actual/overheal; `cleanses: false` suppresses passive cleansing.                                             |
| status             | Burn, Poison and Regen target players. Haste, Slow, Freeze and other timed states target items. Durations stack.                                |
| cleanse            | `statuses`, `mode: flat/percent/all`, amount. Supports player Burn/Poison and item timed statuses.                                              |
| charge / reload    | Item targets. Reload amount is an integer or `full`. Empty Ammo does not stop charging.                                                         |
| modify             | Item/custom attribute or player maxHealth; operation plus explicit scope. Every numeric contribution is inspectable.                            |
| forceUse           | Enqueues a cast; respects location, destruction, Freeze and Ammo.                                                                               |
| destroy / repair   | Combat disable/restore, aura invalidation and queued-source generation checks.                                                                  |
| transform          | Named pool, compatible size and tier; explicit permanent scope or combat default.                                                               |
| flying             | Boolean start/stop with idempotent transitions.                                                                                                 |
| type               | Add a dynamic type; `mode: all` removes that added type. Combat/permanent scopes are supported. Intrinsic types are definition-owned.           |
| meter              | Gain/spend a named player meter. Add a condition before spending if insufficient resources should prevent an action.                            |
| slot               | Set/remove a named state on the first occupied slot of selected items. `note` stores a matching type. Heated and Chilled are independent names. |
| publish            | Emit a named event. `sandstorm.start` additionally requests the early storm boundary.                                                           |
| enchant            | Replace a compatible combat enchantment. Persistent enchanting is a run reward.                                                                 |
| resource           | Run Gold, Income, XP, maximum Health or Regen through lifecycle abilities; combat `scope: run` creates an explicit persistence record.          |
| upgrade / generate | Run lifecycle operations. Generate takes a pool and bypasses duplicate purchase merging. Do not use them as combat item generation.             |

Ordinary damage/status/destruction/flight operations are combat state, not ways to mutate future encounters. Type and Transform do not support temporary/day inheritance; use combat or permanent scope. Player resource changes use status/resource verbs, not an inert arbitrary attribute modifier. Unsupported player aura/modifier targets and unsupported scope combinations are rejected by semantic validation. Hero-specific meter acquisition rules beyond the canonical fixture are deliberately absent.

## Auras and enchantments

An aura has its own location, deterministic selector, attribute, modifier operation and value. Player auras currently support maximum Health; item auras support derived attributes. Destroy, Repair, movement, enchantment and Transform naturally change eligibility. Aura targets/conditions must not recursively depend on derived attributes; validation rejects those dependencies.

Each host declares its supported enchantment map. Omission means unsupported. Reusable templates are plain data and can be replaced per host; Copper Ledger demonstrates a purchase-triggered value-gain enchantment rather than Multicast. The original families are Leaden, Rime, Brisk, Warded, Mending, Venom, Cinder, Echo, Keen, Sheltered, Flint and Gilded. A host has at most one enchantment. Transform retains it only when supported.

## Encounters, rewards and opponents

Add encounters with category, day range, hours, weight, exclusion group, description, optional prerequisites, and rewards. A shop additionally names a pool, offer count, reroll cost, optional type discount and sale bonus. Offers use the shop stream; rerolls consume gold. Day thresholds, tier roll thresholds, enchantment odds/premiums, Prestige losses and cash fallback amounts are tunable in `content.rules`. Gold tier is checked before Silver against the same 0–99 roll. Enchantment keys are sorted before random selection. Reserved/locked offers are not implemented.

Reward tables support item/skill acquisition, tier and compatible enchantment, gold, income, XP, maximum Health and upgrade/enchant/Transform target choices. Level tables are keyed by level with a default fallback. Target eligibility is recomputed when each pending choice is reached. Empty target sets are excluded, with a cash fallback if no option remains.

Create monsters and rivals with the `snapshot`/`instance` helpers or equivalent JSON. A snapshot contains only combat-relevant state, identity, content version and presentation metadata. Wrap it with category, day band, guaranteed rewards and a drop pool. Monster wins offer the rolled drop or gold. Rival wins count toward the run; the previous selected snapshot is excluded when alternatives exist. Keep at least four snapshots in a day/category band to retain three nonrepeating previews.

## Stalemate rules

`content.rules` declares `stormStart`, `stormInterval`, `stormBase`, `stormStep`, `stormCap`, `stormMitigation`, `timeout`, and `timeoutPolicy`. The curve is `min(stormCap, stormBase + tickIndex * stormStep)`. Start/interval use 500 ms checkpoints, with a configured start of at least 500 ms. Early-start effects choose the next strictly future checkpoint. Mitigation is `bypass` or `shield`; timeout is `draw` or `highestHealth` (current Health, with equal values drawing). These are original provisional settings, not verified live values.

## Coverage examples

| Content / fixture                                      | Purpose                                                                                                           |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Rivet Lance + Folding Buckler                          | Basic timers, Damage/Shield and geometry                                                                          |
| Bitter Vial + Spring Magazine                          | Ammo, empty-ready waiting and left-neighbor Reload                                                                |
| Ember Kettle + Warm Coil                               | Output versus reference tags; reactive Charge and internal cooldown                                               |
| Winter Fan / Tar Roller / Paced Courier / Minute Hand  | Status preference, size filters, adjacency and progress changes                                                   |
| Tea Tray / Moss Jar / Clearwater Flask / Velvet Leech  | Heal, Regen, Cleanse, Lifesteal and status ticks                                                                  |
| Echo Anvil                                             | Large size, Crit and separate multicast casts                                                                     |
| Pocket Workbench / Steady Aim                          | Board and skill auras; type eligibility                                                                           |
| Scrap Magnet + Patch Drone / Kite Engine + Lift Ribbon | Destroy, Repair, flight and protection                                                                            |
| Prism Box / artisan / Rain Stitch                      | Combat and permanent Transform; dynamic types                                                                     |
| Copper Ledger / Field Notes / Survey Kit               | Stash lifecycle rules, independent value, day counters and quests                                                 |
| Second Bell / Return Token / Sand Hourglass            | Forced use, bounded qualifiers, death replacement and early storm                                                 |
| `scopes-and-meters` golden                             | Rage/Enrage, Tempo, Notes, Heated/Chilled and persistence infrastructure                                          |
| `conformance.test.ts`                                  | Remaining selectors, expression operators, scope boundaries, run-only verbs, Legendary behavior and safety guards |

Validate schema **and** semantics, add a small focused scenario with expected arithmetic, then regenerate the relevant golden fixture deliberately. A new enum entry without an action resolver and a behavioral test is not implemented content support.

## Presentation assets and rule text

`src/art.ts` maps item IDs into the original atlas in `public/art/items.png`; skills may reuse a related object illustration. Add artwork/mappings in the client without adding asset dependencies to the simulation. The visual direction and generation provenance are documented in `docs/visual-direction.md` and `docs/art-prompts.md`.

Right-click effect descriptions are built from ability data, with current-tier amounts read through the evaluator. Keep the authored `text` useful as a base description, but never use it as a second source of numerical rules. New effect/selector grammar should receive readable wording in `src/descriptions.ts` as well as resolver/validation support; full structured rules and event calculation traces remain inspectable. Test enchantment/aura-only attributes so they are not silently omitted from details.
