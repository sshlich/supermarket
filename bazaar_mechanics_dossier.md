# Bazaar-Style Autobattler Mechanics Dossier

## Purpose and reference build

This document specifies the systemic baseline for a private, desktop-first prototype inspired by *The Bazaar*. It is a mechanics dossier, not a catalog of copied content. Names, artwork, writing, exact item designs, and balance values in the prototype should be original placeholders. The target is behavioral fidelity: the same classes of state, decisions, interactions, and automatic-combat problems should be representable.

The research snapshot is Season 18, patch 18.2, dated September 6, 2026. Bazaar DB identifies 18.2 as its current data version; official Steam announcements show patch 18.0 released September 2, 2026.^1 Patch-specific balance values are evidence about the system, not permanent requirements for the prototype.

The live game is not a stable formal ruleset. Tooltips, community databases, patch notes, and observed behavior sometimes conflict. Accordingly, this dossier uses four confidence labels:

- **Confirmed:** supported by a current first-party source or multiple current structured sources.
- **Strong:** supported by a current structured database or recent specialist guide.
- **Provisional:** supported mainly by older documentation or repeatable community observation.
- **Open:** exact behavior requires controlled in-game testing.

## Product baseline

The target product is a run-based, asynchronous autobattler with unlimited decision time outside combat. A player improves a board through a sequence of encounters, then watches hands-off deterministic combat against monsters and saved opponent builds. The official game describes its PvP as asynchronous drafting; a player may leave and resume without holding up another player.^2

For the first prototype:

- One original content pool substitutes for heroes.
- Opponents are curated snapshots rather than networked ghosts.
- A successful run should usually last 40–60 minutes.
- The simulation is local and deterministic.
- Rules and calculated values are inspectable.
- Custom resource networks and crafting systems are explicitly postponed.
- Accounts, monetization, cosmetics, rankings, tournaments, and live operations are excluded.

## 1. Run state and run termination

### 1.1 Persistent run state

The minimum run aggregate is:

| Field | Meaning |
|---|---|
| Run seed | Root of all deterministic random streams |
| Content version | Immutable rules/content snapshot used by the run |
| Day and hour | Current location in the run clock |
| Wins | PvP victories; ten wins is the standard successful-run threshold |
| Prestige | Run-level loss buffer; PvP losses reduce it |
| Last-chance state | Whether the one-time recovery event has been consumed |
| Gold | Spendable currency |
| Income | Recurring gold source |
| XP and level | Run progression and reward cadence |
| Maximum health | Base combat survivability |
| Permanent Regen | Player-level combat regeneration, if granted |
| Board | Ordered active item instances |
| Stash | Ordered inactive item instances |
| Skills | Ordered passive ability instances |
| Run counters | Purchases, sales, transforms, fights, item-type counts, and other historical facts |
| Encounter history | Seen/selected encounters and day-local exclusion data |
| Pending choices | Unresolved level-up, reward, shop, enchant, or target selections |

The standard goal is ten PvP wins. A PvP loss removes Prestige based on day. Reaching zero or below invokes one last-chance choice rather than immediately ending the run; published descriptions list a random Diamond item, a random enchantment, or 20 gold plus 5 XP as the three live rewards.^3 The subsequent terminal condition must be represented separately from numerical Prestige because restoring Prestige does not necessarily reset every death-state rule.

### 1.2 Day/hour state machine

Each day contains six resolved hours:

| Hour index | Baseline content |
|---|---|
| 0 | Choice among merchants/events/free rewards |
| 1 | Choice among merchants/events/free rewards |
| 2 | Choice among PvE monsters, followed by combat |
| 3 | Choice among merchants/events/free rewards |
| 4 | Choice among merchants/events/free rewards |
| 5 | PvP ghost/snapshot combat |

This six-hour pattern is well documented, though some sources number the same positions as hours 1–6.^4 The engine should use zero-based internal indices and presentation labels independently.

A normal noncombat hour proceeds through:

1. Generate three encounter candidates from the eligible pools.
2. Expose previews and conditional options.
3. Player selects one candidate.
4. Enter the encounter and resolve any nested purchases or choices.
5. Mark the encounter resolved.
6. Apply hour-completion XP and hour-boundary triggers according to an explicit ordering rule.
7. Resolve all queued level-ups before advancing, except where the live game intentionally defers them.
8. Advance the clock and generate the next choice.

The live structure normally presents a mixture of a vendor, an event, and a free option, but this is a generation tendency rather than a hard type requirement.^4 The encounter generator therefore needs weighted slots, eligibility predicates, day ranges, hero/pool restrictions, rarity, and duplicate-suppression rules.

### 1.3 Start-of-run choice

The live game has three broad starting packages: economy, an enchanted small item, or a skill. Current published guidance reports a base of 8 gold and 5 income before the chosen package, with the economy package bringing the total to 20 gold and 7 income.^5 For the prototype, preserve the three-way decision structure but use tunable original values.

### 1.4 XP and levels

The live model uses 8 XP per level, and ordinary resolved hours grant XP. Leveling grants maximum health/board progression and a choice from level-specific reward encounters.^6 Current level rewards are partially fixed and partially content-pool-specific: examples include an enchanted Bronze small item or Bronze skill at level 2, item/loot choices at level 3, an upgrade or Silver item at level 4, and fixed skill tiers at later milestones.^7

Required engine behavior:

- XP gains may cross more than one level.
- Each gained level enqueues exactly one level-up choice unless a rule explicitly replaces it.
- Choices resolve sequentially because an earlier reward may affect eligibility for later rewards.
- Level reward tables are data, not code.
- A content pool may override or add choices at particular levels.
- Maximum health changes must define whether current health changes proportionally, by the delta, or not at all.

The prototype should not initially reproduce every live level table. It should reproduce the table-driven mechanism and enough milestones to cover item grants, loot, skills, upgrades, enchantments, health, and content-pool-specific options.

## 2. Board, stash, and spatial semantics

### 2.1 Capacity and sizes

The live board and stash each reach ten slots. The combat board begins smaller and expands through early levels. Items occupy contiguous capacity based on size: Small = 1 slot, Medium = 2, Large = 3.^8

The board is an ordered one-dimensional geometry. Every item instance must retain:

- First occupied slot
- Size/width
- Left and right neighbors
- All occupied slots
- Whether it is leftmost/rightmost among active items
- Distance or relative direction when an ability requires it

“Adjacent” means the immediately neighboring item instance, not every item sharing a slot boundary. A Large item still has at most one neighbor on each side.

### 2.2 Board versus stash

Board items participate in combat. Stashed items normally do not activate and do not contribute passive combat effects, but individual abilities may explicitly function from the stash. Bazaar DB exposes stash rules at the ability level, which implies that activity location belongs to each ability rather than to the item as a whole.^1

Consequences for the engine:

- An item may contain one ability active everywhere and another active only on the board.
- Out-of-combat triggers such as “when you visit a merchant” can work from the stash if configured.
- Board-only auras must be removed and recomputed when an item moves.
- Selling must be possible outside merchant screens.
- Rearrangement must be allowed before combat and during most encounter screens, but never after the combat snapshot is locked.

### 2.3 Identity and ownership

An item definition and item instance are different entities. Every acquired item instance needs a unique ID and mutable instance state. Duplicate definitions can coexist when they were generated rather than purchased; they do not automatically merge merely because they sit together in inventory.^9

## 3. Item model

### 3.1 Definition fields

An item definition requires at least:

```ts
interface ItemDefinition {
  id: string;
  nameKey: string;
  ownerPool: string | "common" | "monster";
  size: 1 | 2 | 3;
  startingTier: "bronze" | "silver" | "gold" | "diamond" | "legendary";
  visibleTypes: string[];
  capabilityTags: string[];
  referenceTags: string[];
  tierData: Partial<Record<StandardTier, ItemTierData>>;
  abilities: AbilityDefinition[];
  enchantments: Partial<Record<EnchantmentId, EnchantmentDefinition>>;
  shopRules: ShopEligibility;
}
```

An instance additionally stores current tier, enchantment, permanent attribute deltas, counters, quest progress, copied/added types, and provenance.

### 3.2 Visible item types

The patch 18.2 database indexes the following visible or content-family types:^10

- Apparel
- Aquatic
- Core
- Dinosaur
- Dragon
- Drone
- Food
- Friend
- Instrument
- Loot
- Potion
- Property
- Ray
- Reagent
- Relic
- Tech
- Tool
- Toy
- Trap
- Vehicle
- Weapon

These types are non-exclusive. A single item can be, for example, a Friend + Weapon + Dragon. Type counts therefore operate on unique type identifiers, not the number of tag occurrences.

Types serve several independent purposes:

- Merchant pool membership
- Ability targeting
- Conditions and scaling
- Skill synergy
- Transform pool restrictions
- Quest progress
- Dynamic type acquisition
- User-facing build language

Do not encode type meaning in an enum switch. Content can add types, and some effects add random types during a run.

### 3.3 Capability tags and reference tags

The current structured tag inventory distinguishes what a card does from what it references.^10 Representative capability tags are:

- Ammo
- Burn
- Charge
- Cooldown
- Crit
- Damage
- Experience
- Flying
- Freeze
- Gold
- Haste
- Heal
- Health
- Income
- Level
- Lifesteal
- Package
- Poison
- Quest
- Rage
- Regen
- Shield
- Slow
- SpawnMusicNote
- Tempo
- Ticket
- Value
- AbsorbDestroy, AbsorbFreeze, AbsorbSlow

Reference tags include AmmoReference, BurnReference, ChilledReference, CritReference, DamageReference, EconomyReference, FlyingReference, FreezeReference, HasteReference, HealReference, HealthReference, HeatedReference, PoisonReference, PotionReference, RageReference, RegenReference, ShieldReference, SlowReference, TechReference, and TempoReference.

This separation is critical. “Burn 5” makes an item a Burn output item; “when you Burn, Charge this” references Burn but should not make the item eligible for “your Burn items have +2 Burn.” Enchantments can add output capabilities and therefore change eligibility dynamically.

### 3.4 Attributes

An item can have tier-scaled or derived attributes including:

- Buy price and sell value
- Cooldown
- Maximum/current ammo
- Crit chance
- Multicast count
- Damage
- Shield
- Heal
- Regen
- Burn
- Poison
- Slow duration/target count
- Freeze duration/target count
- Haste duration/target count
- Charge amount/target count
- Custom numeric variables

Not every item exposes every attribute. A value may be absent at one tier and present at another. Attribute computation must support additive bonuses, flat reductions, percentage changes, multipliers, setters, minima/maxima, and values derived from other entities.

### 3.5 Active, passive, aura, and triggered abilities

An item may contain several independently configured abilities:

- **Cooldown activation:** fires when its timer fills and it has ammo if ammo-bound.
- **Reactive trigger:** responds to a published game event.
- **Aura:** continuously modifies eligible entities while its source is valid.
- **Lifecycle trigger:** start of combat/day/hour, purchase, sale, level-up, transform, death threshold, and similar.
- **Quest:** observes progress and unlocks or applies a reward.

Items without a cooldown cannot be “used” merely because a passive trigger resolves. “Use” is a specific activation event, and passive-only items should not satisfy “when you use another item.”^11 Forced-use effects are an explicit exception and must invoke the same item-use pipeline as a natural activation unless content says otherwise.

## 4. Tiers, upgrades, value, and enchantments

### 4.1 Standard tiers

The standard progression is Bronze → Silver → Gold → Diamond. Legendary is a separate terminal starting tier rather than the next normal upgrade step. Current databases expose all five as searchable tiers.^10

An upgrade:

- Advances one standard tier.
- Re-evaluates the definition’s tier data.
- Preserves instance identity and permanent modifications unless a rule says otherwise.
- Improves only the attributes/effects configured to scale; upgrading does not guarantee that every number changes.^9
- Increases ordinary item value according to content data.

Diamond items cannot be upgraded through the ordinary tier chain. A player-owned Diamond copy is removed from ordinary purchase options in the documented live rules.^9

### 4.2 Duplicate purchase upgrade

Buying an eligible duplicate upgrades the owned copy rather than creating an ordinary second copy. The live game treats several reward acquisitions selected from a presented card as purchases for this purpose. Generated items that bypass the buy interaction can coexist and do not necessarily merge.^9

The resolution algorithm must define:

1. Which owned instance is the upgrade target when duplicates exist.
2. Whether the acquired copy’s enchantment replaces the target’s enchantment.
3. Which permanent mutations survive.
4. Whether purchase triggers see an acquired item, upgraded item, or both.
5. When gold is paid relative to buy and upgrade triggers.

The documented live behavior says that an incoming different enchantment replaces the existing one during a duplicate upgrade.^12 This must be an explicit policy, not an accidental overwrite.

### 4.3 Buy price and sell value

Buy price and sell value are independent attributes, even when base content commonly prices selling at half of buying. The live game permits effects that permanently or temporarily change Value and merchants that pay bonuses for certain tiers or sizes. A current deep-mechanics page, for example, exposes separate `BuyPrice`, `SellPrice`, custom value-gain attributes, triggered mutations, and multiplicative auras.^13

Therefore:

- Never derive sell value from current buy price at runtime.
- Track base, permanent, aura, and combat-only value separately.
- “Value during combat” must not change ordinary sale proceeds.
- A multiplier can apply to gain amounts rather than to the current value; these are different effects.
- Costs, affordability checks, discounts, and payment are distinct events.

### 4.4 Enchantments

An item can hold at most one enchantment. Applying another replaces it. Transforming attempts to retain the enchantment only if the resulting item supports that enchantment.^12 The canonical enchantment families are:

| Enchantment | Systemic purpose |
|---|---|
| Heavy | Add or improve Slow behavior |
| Icy | Add or improve Freeze behavior |
| Turbo | Add or improve Haste behavior |
| Shielded | Add or improve Shield behavior |
| Restorative | Add or improve Heal behavior |
| Toxic | Add or improve Poison behavior |
| Fiery | Add or improve Burn behavior |
| Shiny | Add or improve Multicast or double a relevant gain |
| Deadly | Add or improve Crit behavior |
| Radiant | Prevent or absorb Freeze, Slow, and Destroy targeting/effects |
| Obsidian | Add or improve Damage behavior |
| Golden | Add or improve Value behavior |

The live implementation is host-specific. An enchantment may add an active output, add a trigger, multiply an existing output, create an aura, or be unsupported. For example, a passive economy item can implement Golden as doubled sell value gain and Shiny as doubling the amount it grants, rather than receiving combat Multicast.^13 Treat each item/enchantment pairing as data generated from reusable templates with per-host overrides.

## 5. Skills and quests

### 5.1 Skills

Skills are passive cards outside board capacity. They use the same underlying ability vocabulary as items: triggers, conditions, target selectors, actions, counters, tiers, and priorities. Current databases classify skills with capability/reference tags just like items.^10

Skill state requires:

- Definition ID and tier
- Acquisition order
- Per-fight and per-run counters
- One-shot flags
- Permanent mutations already applied
- Ability enablement and source validity

Skills may:

- Add passive stats or auras.
- React to item use or status application.
- Trigger at combat thresholds.
- Grant out-of-combat resources.
- Modify targeting or durations.
- Charge, Haste, Slow, Freeze, or otherwise operate on items.

No separate hard-coded “skill engine” should exist. Skills and items should publish and consume the same event contracts, differing mainly in board geometry, cooldown capability, and location rules.

### 5.2 Quests

Quest items expose a progress requirement and an additional reward ability. Current quests commonly count purchases of categories or combat thresholds.^14 The data model must keep:

- Quest predicate/event subscription
- Required count or threshold
- Current progress
- Scope: combat, day, or run
- Whether progress can overflow
- Completion timing
- One-time versus repeatable status
- Reward mutations, abilities, or types

Completion should enqueue a quest-completed event before the unlocked reward becomes available unless a content-specific rule says the completing event can also trigger the reward.

## 6. Combat snapshot and lifecycle

### 6.1 Snapshot isolation

Combat begins from immutable snapshots of both participants’ run state. Combat mutations occur on derived combat entities. Only explicitly persistent effects write back to the run after combat.

Create distinct layers:

1. Definition values
2. Permanent instance mutations
3. Board/skill aura modifications
4. Combat-start modifications
5. Fight-only accumulated modifications
6. Temporary status/time modifiers

This prevents “for the fight” buffs from leaking into the run and makes tooltips explainable.

### 6.2 Recommended combat phases

The exact live ordering is not fully published. The prototype must nevertheless define a canonical deterministic order:

1. Clone run snapshots.
2. Validate board occupancy and source ownership.
3. Rebuild tags and derived attributes.
4. Register auras and continuous modifiers.
5. Recompute derived maximum health and starting health.
6. Initialize ammo, cooldown progress, counters, statuses, and special meters.
7. Publish pre-combat setup events.
8. Resolve start-of-combat skills and items through the priority queue.
9. Start the logical clock.
10. Advance to the next scheduled event time.
11. Resolve status ticks, timer completions, queued reactions, deaths, and timeout effects in a deterministic order.
12. End immediately when a terminal outcome is committed.
13. Produce a replay/event log and apply authorized persistent write-backs.

### 6.3 Logical time

The simulator should be discrete-event, not frame-driven. Store time as integer microticks or milliseconds. Never use floating-point equality for simultaneous cooldowns.

Each active cooldown item has:

- Base and effective cooldown duration
- Accumulated charge/progress
- Current rate multiplier
- Freeze state/duration
- Slow and Haste state/duration
- Earliest timer-completion time and earliest eligible activation time
- Ammo eligibility, tracked independently from cooldown progress
- Destroyed/disabled state
- Forced-use queue state

The simulation advances directly to the next status expiration, periodic tick, activation, or queued delayed effect. Phaser merely animates a replay produced by the simulator.

### 6.4 Event and ability queue

Every emitted event carries:

```ts
interface GameEvent {
  id: bigint;
  time: number;
  kind: EventKind;
  sourceId?: EntityId;
  ownerId?: PlayerId;
  targets: EntityId[];
  parentEventId?: bigint;
  batchId?: bigint;
  payload: Record<string, number | string | boolean>;
}
```

Every triggered ability should record source, trigger, conditions, priority, target selector, action sequence, internal cooldown, use limit, and persistence scope.

Current extracted card pages expose ability priorities such as Low and Medium, confirming priority is ability-level data.^13 Community testing indicates that tied natural activations often appear left-to-right, while hidden ability priority and acquisition/creation order can override that intuition. Multicast and reaction effects can also be separated by short internal delays.^15 This area is **Open** and must have a dedicated empirical test suite. The prototype should define and expose its own stable ordering even if the live game contains bugs or implementation leakage.

### 6.5 Atomicity and batches

A single item use may have several actions and one crit roll. Recent guidance says a crit on a multi-output item doubles all eligible active outputs from that activation together.^14 Multicast repeats the item’s effect multiple times rather than multiplying its displayed number.^14

Recommended rules:

- Validate the use once.
- Spend ammo once per cast unless content overrides it.
- Roll crit once per cast.
- Execute ordered actions within the cast.
- Publish granular result events after each action.
- Publish one item-used event after the cast’s active sequence.
- Schedule additional multicast casts as distinct casts within the same use batch.
- Re-check target availability for each multicast cast.
- Apply internal delays through data rather than animation callbacks.

The live game’s exact distinction between a “use,” a multicast cast, and triggered sub-actions needs controlled verification because many cards count these differently.

## 7. Core combat effects

### 7.1 Damage and health

Ordinary damage removes Shield first, then Health. Poison bypasses Shield. Damage must report attempted, mitigated, absorbed, and health-damage amounts because different triggers can care about different stages.

Maximum-health changes and current-health changes are separate actions. Death is a proposed terminal event that replacement effects may intercept: invulnerability, revive, “first time you would die,” or similar abilities require a death-prevention window before combat ends.

### 7.2 Shield

Shield is a nonnegative combat resource that absorbs ordinary damage one-for-one. Poison ignores it. The presence of Shield halves incoming Burn damage, even when the Shield amount is much smaller than the Burn tick.^16 Questions to freeze in the prototype rules include rounding of halved odd Burn values and whether the “has Shield” check occurs before or after same-timestamp damage.

### 7.3 Heal and overheal

Heal restores Health up to maximum Health. Current August 2026 guidance says healing cleanses 10% of Burn and Poison, while older wiki text reports 5%; the live-reference value should be verified in game before implementation freeze.^14 Healing should emit attempted heal, actual heal, overheal, and cleanse events separately. Lifesteal healing is documented as not cleansing Burn or Poison.^17

### 7.4 Regeneration

Regen is a player status that heals once per second. Current guidance describes a heal equal to the Regen amount each tick.^14 Older detailed documentation says Regen removes Poison before Poison damage on the same second, which makes tick ordering material.^18 This ordering is **Provisional** until tested on patch 18.2.

An item that “gains Regen for the fight” usually increases the player’s Regen status; it does not store a private repeating timer unless the ability text and data say otherwise. Crit-eligible active Regen grants can double the granted Regen.

### 7.5 Burn

Burn:

- Stacks additively.
- Damages its owner twice per second.
- Decreases by one after each damage tick.
- Has its tick damage halved while the owner has any Shield.^16
- Can be reduced by healing/cleanse effects.

Burn application and Burn damage are different events. “When you Burn” normally means applying Burn, not taking a Burn tick, but the event vocabulary must distinguish source, recipient, amount applied, and amount actually added.

### 7.6 Poison

Poison:

- Stacks additively.
- Damages once per second for the current Poison amount.
- Does not decay merely by ticking.
- Bypasses Shield.^19
- Can be reduced by healing, Regen interactions, or explicit Cleanse.

As with Burn, application and periodic damage are separate events.

### 7.7 Cleanse

Cleanse removes some or all debuffs/status quantities. It must specify:

- Status set affected
- Flat, percentage, or complete removal
- Rounding policy
- Whether item statuses and player statuses are both included
- Target selection

“Cleanse half” and healing’s passive partial cleanse should use the same underlying status-removal action with different parameters.

### 7.8 Haste

Haste makes an item’s cooldown progress at twice its normal rate while active.^14 It stacks duration, but targeting commonly prefers an eligible non-Hasted item before adding duration to an already Hasted one.^20

Haste changes progress rate, not the item’s printed cooldown. It must not retroactively double progress already accumulated. An item can be simultaneously Hasted and Slowed; the exact live net rate is **Open** and must be tested rather than assumed.

### 7.9 Slow

Slow makes cooldown progress occur at half normal speed while active; older formal wording describes this as a 100% cooldown increase.^14 Slow durations stack, and random targeting commonly prefers a non-Slowed eligible item.^21 Like Haste, Slow affects rate rather than rewriting the permanent cooldown attribute.

### 7.10 Freeze

Freeze stops cooldown progress and prevents natural activation for its duration.^14 Freeze durations stack. Target selection is often constrained by size or explicit predicates. Forced-use behavior while Frozen and activation at the exact expiration timestamp are **Open**.

### 7.11 Charge

Charge immediately advances an item’s current cooldown progress by a duration amount.^14 It is not Haste and has no lasting status. Required rules:

- Clamp progress to the activation threshold unless overcharge is explicitly retained.
- A Charge that fills the timer queues an activation rather than recursively executing inside the current action.
- Define whether multiple simultaneous Charges can be coalesced.
- Ineligible, passive, destroyed, or out-of-ammo targets must follow selector rules rather than silently accepting progress.

### 7.12 Cooldown modification

Permanent, fight-only, and conditional cooldown changes alter effective cooldown duration. Flat and percentage changes require a documented stacking order and minimum cooldown. If an effective cooldown falls below current progress, the item should queue activation at the current timestamp.

Do not conflate:

- Reduce cooldown duration
- Charge current progress
- Haste progress rate
- Force-use now
- Halve the first cooldown

### 7.13 Ammo and Reload

Ammo limits activation, not cooldown charging. At zero Ammo, an item continues accumulating cooldown progress normally. When it reaches full charge, it remains fully charged but cannot activate. If it subsequently gains Ammo, it becomes eligible to activate immediately because the cooldown requirement is already satisfied. Ammo resets between fights. This behavior supersedes the simplified wording in some public keyword guides and was corrected through experienced live-play validation on September 15, 2026.

The activation gate should therefore be modeled as two independent predicates:

```text
timerReady = cooldownProgress >= effectiveCooldown
resourceReady = item has no Ammo requirement OR currentAmmo > 0
canActivate = timerReady AND resourceReady AND not Frozen AND not Destroyed
```

Reload with a number restores that much Ammo; unqualified Reload restores to maximum. Random reload effects may target already-full Ammo items in documented behavior, potentially wasting the effect.^22

Track current Ammo, base maximum, permanent maximum modifications, combat-only maximum modifications, and cooldown progress separately. “Runs out of Ammo” should trigger only on the transition from positive to zero. Reloading a fully charged zero-Ammo item must enqueue its activation at the current logical timestamp; it must not reset or restart that item’s cooldown merely because Ammo was absent.

### 7.14 Critical effects

Crit chance belongs to an activation-capable item. A successful crit doubles eligible active Damage, Heal, Shield, Regen, Burn, and Poison outputs.^14 Passive/aura values generally do not roll crit unless explicitly implemented as an active output. Crit chance may exceed 100%; whether excess chance has meaning is **Open** and should default to a clamped single crit unless content demands otherwise.

### 7.15 Multicast

Multicast causes an item’s effect to occur multiple times on use.^14 It is an integer cast count. Each cast can reselect targets and can be interrupted by death or source invalidation if the engine checks terminal state between casts. Community observation reports a short interval between multicast waves rather than truly simultaneous resolution.^15 The prototype should make `multicastInterval` explicit and testable.

### 7.16 Lifesteal

Lifesteal heals the attacker based on damage dealt. Current shorthand says equal to damage dealt.^14 Older references clarify that Lifesteal healing does not cleanse Burn or Poison.^17 Define whether “damage dealt” means pre-Shield damage, Shield damage plus health damage, or only health damage; this is **Open** for empirical testing.

### 7.17 Destroy, Repair, and absorption

Destroyed items are disabled: they cannot activate and their passive effects cease.^14 Repair returns one destroyed item to functionality. Required state transitions:

```text
active → pending_destroy → destroyed → pending_repair → active
```

Destroy immunity/absorption must resolve before state transition. Repair must define cooldown progress, statuses, ammo, auras, and one-time counters on return. The live tooltip definition does not fully specify these details, so each is an empirical test case.

### 7.18 Flying

Flying is an item state. Items can start and stop Flying, and both transitions can trigger abilities. While Flying, Freeze and Slow durations applied to the item are halved.^14 Flying does not inherently Haste an item; its other benefits come from content. Start/stop must be idempotent: attempting to start an already Flying item should not publish a new “started Flying” event unless explicitly forced.

### 7.19 Transform

Transform replaces an item with a random item of the same size from the allowed owner pool. Current guidance says the new result remains within the player’s hero pool even when transforming a neutral or off-pool item, and retains the previous enchantment only if applicable.^14 Older encounter documentation also preserves tier.^23 Legendary items are generally excluded.

Transformation must define inheritance for:

- Tier
- Enchantment
- Permanent attribute mutations
- Added types
- Quest progress
- Cooldown progress and ammo if performed in combat
- Instance identity/provenance

The recommended prototype baseline preserves tier and enchantment compatibility but discards definition-specific permanent mutations unless an effect explicitly transfers them.

### 7.20 Rage and Enrage

Rage is a hero-specific meter in the live game. Item uses add size-dependent Rage; reaching 100 triggers Enrage. Current guidance describes Enrage as clearing Slow and Freeze and reducing cooldowns by 10% for five seconds.^14 It belongs in the complete engine inventory but can be deferred from the first neutral content pool.

### 7.21 Heated and Chilled

Heated and Chilled are hero-specific states applied to items or board slots, referenced by content for additional behavior.^14 These are not ordinary Burn/Freeze aliases. The general engine requirement is support for extensible item and slot states with start/stop/change events. Their exact acquisition, slot persistence, and interaction rules require a Jules-focused validation pass.

### 7.22 Notes and Tempo

Notes and Tempo are current Dragons-specific systems. Each second produces Tempo, which items can spend or reference. Musical Notes are slot-based and grant 10% cooldown reduction to their associated item type.^14 The patch 18.2 tag set includes Instrument, SpawnMusicNote, Tempo, and TempoReference.^10 These systems validate the need for generic meters and slot modifiers but are not required in the first neutral prototype.

### 7.23 Sandstorm and combat timeout

The Sandstorm begins after approximately 30 seconds in the current commonly documented model and applies escalating damage to both players; some items can start it early.^24 Public sources do not provide a reliable current patch 18.2 damage sequence, maximum tick, terminal timeout, or tie policy. These details are **Open**.

The prototype must still have a deterministic stalemate breaker. Store it as a data-driven periodic effect with start time, tick interval, damage curve, mitigation policy, maximum duration, and tie policy.

## 8. Targeting and selection

Target selectors must compose predicates rather than rely on bespoke item code. Required spatial and property selectors include:

- Self
- Owner or opponent
- Left/right neighbor
- Adjacent items
- Leftmost/rightmost eligible item
- All items
- Other items
- Random one/N/up-to-N
- Size equal/smaller/larger
- Exact size or size range
- Has/does-not-have visible type
- Has capability/reference tag
- Has cooldown
- Ammo/full/not full/out of ammo
- Hasted/Slowed/Frozen/Flying/Destroyed
- Highest/lowest value, damage, cooldown, or another attribute
- Previously selected target
- Source of the triggering event

For random selection, define whether targets are chosen with or without replacement. “Up to N” must never fail because fewer than N targets exist. A selector should return an empty set cleanly; the action then fizzles without preventing unrelated actions in the same ability.

Radiant/absorb effects create a distinction between target eligibility and effect negation. A protected item may be excluded from random targeting or selected and absorb the effect depending on the exact ability. Both modes must be representable.

## 9. Trigger vocabulary

The minimum event vocabulary should cover:

### Run and encounter events

- Run started
- Day started/ended
- Hour started/completed
- Encounter offered/selected/completed
- Merchant visited
- Shop rerolled
- Item offered/acquired/bought/generated/sold
- Gold gained/spent
- Income gained/changed/paid
- XP gained and level gained
- Item upgraded, enchanted, or transformed
- Type added/removed
- Quest progressed/completed

### Combat lifecycle events

- Combat setup/start/end
- Item timer filled
- Item use started/resolved
- Multicast cast started/resolved
- Item forced-used
- Damage attempted/dealt/blocked
- Shield gained/lost
- Heal attempted/received/overhealed
- Regen gained/ticked
- Burn/Poison applied, ticked, cleansed
- Haste/Slow/Freeze applied, stacked, expired, removed
- Item charged
- Ammo spent/reloaded/depleted
- Crit occurred
- Item destroyed/repaired
- Item started/stopped Flying
- Rage gained and Enrage started/ended
- Health threshold crossed
- Death proposed/prevented/committed
- Sandstorm started/ticked

### Trigger qualifiers

Abilities require qualifiers such as:

- First time each fight/day/run
- First N times
- Every Nth time
- While a condition is true
- If/when the owner or enemy satisfies a condition
- Another item versus any item versus this item
- Active source still valid
- Internal cooldown elapsed
- Once per parent event or once per batch

Event recursion must be bounded. Use a maximum chain depth, maximum events per timestamp, and diagnostic failure rather than silently hanging on an infinite loop.

## 10. Permanence and reset scopes

Every mutation must declare one scope:

| Scope | Reset point | Example |
|---|---|---|
| Definition | Content version change | Printed base value |
| Permanent instance | Item leaves run | “Permanently gains 5 Damage” |
| Run/player | Run ends | Maximum Health or Income gain |
| Day | Next day begins | Rare day-bound counters |
| Combat | Fight ends | “For the fight” scaling |
| Timed | Duration expires | Haste or Freeze |
| Activation | Cast completes | Crit roll and temporary target set |

Words such as “gain,” “has,” “for the fight,” “permanently,” and “while” must compile to explicit mutation scopes. Tooltip wording must be generated from the same structured data where practical.

## 11. Encounters, merchants, and PvE

### 11.1 Encounter definition

An encounter needs:

- ID, display metadata, rarity, and category
- Eligible days/hours
- Weight and mutual-exclusion groups
- Content-pool restrictions
- Prerequisites and conditional option unlocks
- Repeat rules
- Preview information
- Nested choices and target requirements
- Costs and rewards
- Completion events

### 11.2 Merchants

Merchants differ by pool breadth, type filters, rarity, offered tiers, offer count, reroll price, buy/sell modifiers, and day availability. Shops are temporary views over deterministic offer generation. A reroll consumes currency, increments relevant counters, and replaces eligible offers using the shop RNG stream.

The shop system must be capable of:

- Duplicate offers that upgrade an owned item
- Enchanted offers with adjusted price
- Locked or reserved offers if later desired
- Conditional discounts
- Cross-pool items
- Tier odds that vary by day
- Removing unavailable max-tier duplicates

### 11.3 PvE monsters

The player chooses one of three monsters. Each preview must show the monster board, skills, health, difficulty/tier, fixed rewards, and possible drops. Current published values scale guaranteed PvE rewards by encounter tier: Bronze 2 gold/3 XP, Silver 3/3, Gold 4/3, Diamond 5/4, Legendary 6/4.^25 Treat these as tunable snapshot values.

On victory, a drop is selected from the configured monster item/skill pool. Defeat normally forfeits victory rewards without reducing Prestige. PvE opponent definitions are ordinary combat snapshots plus reward metadata.

## 12. Curated opponents and later ghost PvP

The local prototype should store curated opponent snapshots by day and difficulty band. Each snapshot contains only combat-relevant state plus presentation metadata and content version.

```ts
interface OpponentSnapshot {
  id: string;
  contentVersion: string;
  day: number;
  level: number;
  maxHealth: number;
  permanentRegen: number;
  items: SerializedItemInstance[];
  skills: SerializedSkillInstance[];
  sourceLabel: string;
  difficultyBand: number;
}
```

Selection should prevent immediate repeats and optionally weight opponents by observed performance. The real game matches asynchronous ghost builds, allowing combat without queue time.^2 Later online support should upload a sanitized immutable snapshot at the PvP checkpoint, not trust a client-supplied combat result.

## 13. Randomness and replayability

All randomness must flow through named deterministic streams derived from the run seed:

- Encounter generation
- Shop offers and rerolls
- Rewards/drops
- Combat target selection
- Crit rolls
- Transform results
- Opponent selection

Stream separation prevents an animation or unrelated shop query from changing combat results. A replay stores content version, initial snapshots, seed/stream states, player choices, and the final event digest. Every simulation should be runnable headlessly at accelerated speed.

## 14. Rules transparency and developer tooling

The prototype should expose more information than the reference game, especially during development:

- Base, permanent, aura, and combat values separately
- Effective cooldown and all modifiers
- Visible types, capability tags, and reference tags
- Ability priority and internal cooldown
- Source of every mutation
- Target eligibility explanation
- Exact trigger counters
- Combat timeline with parent/child event relationships
- RNG seed and roll results
- Snapshot export/import
- Slow motion, pause, step-one-event, and jump-to-next-activation
- Determinism check and state hash

The essential internal tool is a battle inspector, not polished combat animation. It should answer “why did this fire, why did it not fire, why was this target selected, and where did this number come from?”

## 15. Recommended declarative ability representation

```ts
interface AbilityDefinition {
  id: string;
  sourceLocations: ("board" | "stash" | "skills")[];
  trigger: TriggerSpec;
  conditions: ConditionSpec[];
  priority: "highest" | "high" | "medium" | "low" | "lowest";
  once?: OncePolicy;
  internalCooldownMs?: number;
  targets: TargetSpec[];
  actions: ActionSpec[];
}

type ActionSpec =
  | { kind: "damage"; amount: ValueExpr; target: TargetRef }
  | { kind: "shield"; amount: ValueExpr; target: TargetRef }
  | { kind: "heal"; amount: ValueExpr; target: TargetRef; cleanses: boolean }
  | { kind: "applyStatus"; status: StatusId; amount: ValueExpr; target: TargetRef }
  | { kind: "charge"; milliseconds: ValueExpr; target: TargetRef }
  | { kind: "reload"; amount: ValueExpr | "full"; target: TargetRef }
  | { kind: "modifyAttribute"; attribute: AttributeId; operation: ModifierOp; scope: Scope }
  | { kind: "forceUse"; target: TargetRef }
  | { kind: "destroy"; target: TargetRef }
  | { kind: "repair"; target: TargetRef }
  | { kind: "transform"; target: TargetRef; pool: PoolSpec }
  | { kind: "publish"; event: EventKind };
```

Expressions must reference tier values, source/target attributes, player state, counts, event payloads, adjacent items, and run counters. The evaluator should be pure and inspectable.

## 16. Baseline implementation slices

### Slice A: simulation skeleton

- Board geometry and snapshots
- Logical clock/event queue
- Cooldown items
- Damage, Shield, Health, death
- Deterministic target selection and replay log

### Slice B: main interaction network

- Haste, Slow, Freeze, Charge
- Burn, Poison, Heal, Regen
- Crit, Multicast, Ammo, Reload
- Skills and reactive triggers
- Adjacency and type targeting

### Slice C: run construction

- Day/hour state machine
- Shops, gold, income, buying/selling
- XP, levels, board expansion
- Item tiers and duplicate upgrades
- PvE monsters and curated opponents
- Prestige, wins, last chance, termination

### Slice D: extended live mechanics

- Enchantments
- Transform and quests
- Destroy, Repair, Cleanse, Lifesteal
- Flying
- Extensible meters and slot states needed later for Rage, Heated/Chilled, Notes, and Tempo

No custom systems begin until Slices A–D pass deterministic and rule-conformance tests.

## 17. Empirical validation backlog

The following questions cannot safely be settled from public documentation alone. They should be tested in the live game using controlled boards, video capture, and frame/time analysis:

1. Exact start-of-combat order across player skills, player items, opponent skills, and opponent items.
2. Tie-breaking for simultaneous natural activations: priority, acquisition order, board position, owner order, and reconnect behavior.
3. Internal cooldown and delay between multicast casts and queued reactions.
4. Whether trigger conditions snapshot as a simultaneous batch or re-evaluate before each resolution.
5. Exact event represented by “when you Burn/Poison/Shield/Heal.”
6. Haste + Slow net rate and stacked-duration targeting.
7. Freeze expiration versus activation at the same timestamp.
8. Charge overflow and multiple Charges at the same timestamp.
9. Crit granularity on multi-action and multicast items.
10. Lifesteal basis before/after Shield and mitigation.
11. Current healing cleanse percentage and rounding.
12. Exact order of Regen, Poison, Burn, and Sandstorm ticks at the same second.
13. Sandstorm start time, sequence, tick interval, cap, timeout, and tie policy in patch 18.2.
14. Destroy removal of auras and queued activations.
15. Repair restoration of cooldown progress, ammo, status, and once-per-fight counters.
16. Forced use while Frozen, destroyed, or out of ammo.
17. Transform inheritance for permanent buffs, dynamic types, quests, ammo, and combat state.
18. Radiant and absorb effects: exclusion from targeting versus absorption after selection.
19. Duplicate-upgrade target selection when multiple copies exist.
20. Precise hour-boundary order for XP, start-of-hour/day effects, income, and level-up choices.
21. Board/stash eligibility for each trigger class.
22. Maximum event-chain depth or live infinite-loop safeguards.

These are not secondary polish questions. Several determine the architecture of the event queue and must be frozen before a large item set is authored.

## 18. Conformance criteria for the solid baseline

The baseline is “solid” only when:

- Re-running a combat with the same snapshots, seed, and content version produces the same event digest.
- Moving an item changes only geometry-dependent behavior and documented tie-breaking.
- Every displayed derived number can identify its contributing modifiers.
- Every ability can explain why it triggered or failed.
- Combat-only changes disappear after combat; permanent changes survive save/load.
- Board and stash abilities obey per-ability location rules.
- Tags are recomputed correctly after enchant, transform, dynamic type changes, destroy, and repair.
- A headless test can simulate at least 10,000 ordinary combats without divergence, deadlock, or unbounded event growth.
- Content validation rejects missing tier data, impossible targets, unsupported enchantments, recursive auras, and invalid pool references.
- The complete prototype run can be saved and resumed at every noncombat choice boundary.
- Curated opponent snapshots remain reproducible after serialization.

## 19. Findings and design implications

The reference game is not fundamentally a collection of item scripts. It is an event-driven rules engine whose content happens to be displayed as items and skills. Its depth comes from a small set of reusable verbs crossing several classification systems:

- Spatial classification: size, position, adjacency, board/stash
- Semantic classification: visible item types
- Mechanical classification: output and reference tags
- Temporal classification: cooldown, trigger, lifecycle, persistence scope
- Progression classification: tier, enchantment, quest, permanent mutations

Faithful implementation depends more on preserving those layers and their event semantics than on copying individual cards. A compact original content set can test the full architecture if it intentionally covers each interaction pair and edge case.

The most consequential remaining research is not another item catalog. It is controlled validation of timing, ordering, targeting, and persistence. The user’s high-level experience with the live game is especially valuable here: disputed cases should be turned into small test boards and compared against recorded live behavior before the prototype’s canonical rules are frozen.

## 20. Framework portability contract

The rules engine must not import Phaser, browser APIs, rendering objects, audio, input, wall-clock timers, or network clients. It accepts serializable commands and snapshots and returns serializable state transitions and replay events. The client owns presentation only.

The portable boundary is:

```text
Client/engine → validated command → pure run/combat simulation
Simulation → events + new state + deterministic hash → client/engine
```

Content definitions, save files, opponent snapshots, commands, and replay events should have versioned JSON Schemas. A framework port must pass the same language-neutral golden fixtures: given a content version, initial snapshot, commands, and seed, it must produce the same ordered event transcript and final state hash.

This makes a later engine change feasible but not free:

- Phaser → another JavaScript renderer can retain the TypeScript simulation directly.
- Phaser → Godot requires rewriting the presentation and normally porting the TypeScript simulation to GDScript or C#, because Godot officially supports GDScript, C#, and C/C++ rather than TypeScript.^26 A local Node sidecar could retain the TypeScript engine, but it adds deployment and IPC complexity.
- Phaser → LÖVE requires rewriting the presentation and porting the simulation to Lua, unless the original TypeScript simulator remains an external authoritative process.
- Colyseus does not force a renderer choice. Its current client documentation exposes TypeScript, C#, Lua, and GDScript clients, so either Godot or LÖVE can communicate with a future Colyseus backend.^27 The Godot native extension is currently described as beta; the C# NuGet path is more mature.^28

For this project, a pure TypeScript simulation plus language-neutral fixtures is the best balance. Writing the first simulator in a cross-engine native language solely to anticipate a hypothetical port would increase prototype complexity prematurely. If a Godot port becomes definite, reimplement the simulation against the fixtures rather than translating UI-coupled code.

LÖVE is technically capable of the complete game. Lua is well suited to data-driven rules, deterministic queues, and rapid iteration, and desktop distribution is supported through `.love` packages and platform executables.^29 The main cost is tooling: LÖVE is a framework rather than a scene/UI editor, and its own wiki directs developers to a collection of third-party GUI libraries.^30 A content-dense board game requires substantial custom work for layout, focus/navigation, scrolling, rich tooltips, drag-and-drop, responsive panels, text rendering, and editor/debug tooling.

If implemented in LÖVE, determinism requires extra discipline:

- Never depend on Lua table/hash iteration order.
- Use ordered arrays and explicit stable sorts for queues and targets.
- Use a project-owned seeded PRNG rather than ambient randomness.
- Store logical time as integer ticks.
- Define numeric rounding at every percentage/halving boundary.
- Validate content outside the runtime or build a dedicated validator.
- Keep rendering callbacks from mutating simulation state.

LÖVE is therefore a good choice for a programmer who enjoys code-first UI and Lua, but Godot is likely easier for a solo developer who wants strong visual UI/layout tooling. Phaser remains the easiest route if TypeScript, browser-based inspection, and a future Node/Colyseus backend are priorities.

## Sources

1. Bazaar DB. “[Database for The Bazaar](https://bazaardb.gg/).” Patch 18.2, September 6, 2026; Valve/Tempo. “[The Bazaar announcements](https://steamcommunity.com/app/1617400/allnews/).” Patch 18.0, September 2, 2026.
2. AVY Entertainment. “[The Bazaar: Gameplay](https://playthebazaar.com/game).” Accessed September 2026; Mobalytics. “[What is The Bazaar?](https://mobalytics.gg/the-bazaar/guides/what-is-the-bazaar).” Updated August 19, 2025.
3. Mobalytics. “[The Bazaar Prestige Guide](https://mobalytics.gg/the-bazaar/guides/prestige).” Updated March 5, 2025.
4. Mobalytics. “[How Does a Day Work in The Bazaar?](https://mobalytics.gg/the-bazaar/guides/day-guide).” Updated August 14, 2025.
5. Mobalytics. “[All The Bazaar Start-of-Run Options Guide](https://mobalytics.gg/the-bazaar/guides/start-of-run-guide).” Updated July 7, 2025; Valve/Tempo. “[Patch 16.0: The Invasion Begins](https://steamcommunity.com/app/1617400/announcements/).” July 1, 2026.
6. The Bazaar Wiki. “[Level Up](https://thebazaar.wiki.gg/wiki/Level_Up).” Accessed September 2026.
7. Mobalytics. “[All The Bazaar Level Up Rewards Explained](https://mobalytics.gg/the-bazaar/guides/level-up-rewards).” Updated August 6, 2026; Bazaar DB. “[Level Up Rewards](https://bazaardb.gg/levelup-rewards).” Patch 18.2.
8. Game8. “[The Bazaar Gameplay and Story](https://game8.co/articles/reviews/the-bazaar-gameplay-and-story-info).” Updated March 5, 2026; Steam Community. “[Beginner’s Guide to The Bazaar](https://steamcommunity.com/sharedfiles/filedetails/?id=3573365196).” Updated November 9, 2025.
9. The Bazaar Wiki. “[Items](https://thebazaar.wiki.gg/wiki/Items).” Accessed September 2026.
10. Bazaar DB. “[Search Filters Syntax Reference](https://bazaardb.gg/docs).” Patch 18.2.
11. Valve Steam Community. “[Use another item…](https://steamcommunity.com/app/1617400/discussions/0/591780152569166263/).” Community mechanics discussion, 2025.
12. The Bazaar Wiki. “[Enchantment](https://thebazaar.wiki.gg/wiki/Enchantment).” Accessed September 2026.
13. Bazaar DB. “[Rewards Card: Deep Mechanics](https://bazaardb.gg/card/byv7bt647ddcptdxxf4zw6l1z3/Rewards-Card).” Patch 18.0, September 3, 2026.
14. Mobalytics. “[The Bazaar Keywords and Terms Guide](https://mobalytics.gg/the-bazaar/guides/keywords-and-terms).” Updated August 11, 2026.
15. Reddit r/PlayTheBazaar. “[For some reason, Streaming Setup raises item values from left to right](https://www.reddit.com/r/PlayTheBazaar/comments/1vwk0r4/for_some_reason_streaming_setup_raises_items/).” August 23, 2026; “[How do simultaneous item triggers resolve?](https://www.reddit.com/r/PlayTheBazaar/comments/1jbu9n6).” March 15, 2025. Community observations; not authoritative.
16. The Bazaar Wiki. “[Shield](https://thebazaar.wiki.gg/wiki/Shield).” Accessed September 2026; “[Burn](https://thebazaar.wiki.gg/wiki/Burn).” Accessed September 2026.
17. The Bazaar Wiki. “[Lifesteal](https://thebazaar.wiki.gg/wiki/Lifesteal).” Accessed September 2026.
18. The Bazaar Wiki. “[Regeneration](https://thebazaar.wiki.gg/wiki/Regeneration).” Accessed September 2026.
19. The Bazaar Wiki. “[Poison](https://thebazaar.wiki.gg/wiki/Poison).” Accessed September 2026.
20. The Bazaar Wiki. “[Haste](https://thebazaar.wiki.gg/wiki/Category%3AHaste_Items).” Accessed September 2026.
21. The Bazaar Wiki. “[Slow](https://thebazaar.wiki.gg/wiki/Slow).” Accessed September 2026.
22. The Bazaar Wiki. “[Reload](https://thebazaar.wiki.gg/wiki/Reload).” Accessed September 2026.
23. The Bazaar Wiki. “[Mandala](https://thebazaar.wiki.gg/wiki/Mandala).” Accessed September 2026.
24. Mobalytics. “[The Bazaar Pygmalien Guide](https://mobalytics.gg/the-bazaar/pygmalien-guide).” Accessed September 2026; “[The Bazaar Mak Guide](https://mobalytics.gg/the-bazaar/mak-guide).” Accessed September 2026.
25. Mobalytics. “[The Bazaar PvE Encounters and Drops](https://mobalytics.gg/the-bazaar/guides/pve-encounters-and-drops).” Updated September 9, 2026.
26. Godot Engine. “[Scripting languages](https://docs.godotengine.org/en/stable/getting_started/step_by_step/scripting_languages.html).” Stable documentation, accessed September 15, 2026.
27. Colyseus. “[Client SDK](https://docs.colyseus.io/sdk).” Accessed September 15, 2026.
28. Colyseus. “[SDK for Godot](https://docs.colyseus.io/getting-started/godot).” Accessed September 15, 2026.
29. LÖVE. “[Game Distribution](https://love2d.org/wiki/Game_Distribution).” Accessed September 15, 2026.
30. LÖVE. “[Graphical User Interface](https://love2d.org/wiki/Graphical_User_Interface).” Accessed September 15, 2026.
