# Architecture

## Boundaries

```text
src/main.ts                  DOM board/stash, menus, details, inspector, replay cursor
src/drag.ts                  pointer gestures, footprint/recipient previews, cancellation
src/interactions.ts          drop validation and staged serializable commands
src/descriptions.ts          calculated descriptions and contributing attribute discovery
src/art.ts                   original atlas mapping; presentation only
src/board.ts                 Phaser scene: combat particles and floating values
        │ validated JSON command
        ▼
packages/sim/src/run.ts      pure run reducer and choice-boundary persistence
        │ immutable combat snapshots + seed
        ▼
packages/sim/src/combat.ts   owned state clone, event/ability queue, effects
        │ events + final state + hashes
        ▼
client playback             frame lookup only; pause/speed/step never change results

packages/content/index.ts   declarative definitions and small template builders
content/*.json              exported catalog and curated snapshots
schemas/v1/*.json           language-neutral Draft-07 schemas
tests/golden/*.json         standalone content + snapshots + seed + exact transcript
```

The source package exports from `packages/sim/src/index.ts`. It imports neither Phaser nor DOM, Node, storage, audio, network or wall-clock APIs. A separate TypeScript compilation excludes DOM and Node globals, and ESLint guards forbidden imports, ambient randomness, and clocks. AJV validates JSON-shaped input; it does not perform network resolution. The client uses [Phaser 3](https://docs.phaser.io/phaser/getting-started/what-is-phaser) with a [Vite build](https://vite.dev/guide/), without a desktop wrapper.

## Domain separation

Definitions contain independent size, visible types, capabilities, references, tier tables, enchantment mappings, shop eligibility, abilities and auras. Instances contain identity, acquisition order, location, position, tier, enchantment, permanent/day modifiers, added types, ability memories and provenance. Combat entities add charge, Ammo, status expirations, destruction, flight, temporary modifiers and a generation counter. Players hold health resources, generic meters and slot states. Skills are ordinary ability sources with `skills` location, outside board capacity.

Board placement uses contiguous widths of 1, 2 or 3 slots. Neighbors are the immediately previous/next item in board order, including across a gap; a Large item has at most two. Every selector explicitly defines locations. Stashed items never receive natural cooldown activations, even if an ability can listen from the stash.

## Deterministic execution

The combat API clones its inputs. A `RulesMachine` mutates only this owned clone. The public `dispatch(content, state, command)` likewise clones a run, validates the command and its revision, and returns a transition. Failure throws without committing the clone. Imports additionally validate schema, version, geometry and definition references.

Time is integer milliseconds. Cooldown progress uses **half-millisecond units**: ordinary progress gains 2 units per millisecond, Haste 4, Slow 1, Haste plus Slow 2, Freeze 0. No fractional progress or floating-point equality is needed. The simulator advances to the nearest queued task, timer completion, status/modifier expiration or timeout. The status scheduler has 500 ms checkpoints; empty checkpoints emit no fictitious gameplay event.

Tasks sort by `(time, phase, ability priority, owner, position, insertion sequence)`. Lower numbers go first. Signals use phase 5, periodic effects 10, reactive abilities 20, deferred quest rewards 25, natural/forced/multicast casts 30, and death commitment 90. Within one cast, actions execute in data order before its queued reactions. New reactions preempt pending casts at the same time. A queued source generation must still match after Destroy, Repair or Transform. Skills use positions `100 + acquired`; owner `p0` precedes `p1`. The exact reference-game ordering is not claimed.

One cast validates source, freeze, charge and Ammo gates, resets progress for a new use, spends one Ammo, rolls one crit, resolves ordered active abilities, publishes cast resolution and item-used, then schedules any next multicast wave. Every active ability uses the same condition/qualifier evaluator as a reaction. Death replacements run before phase-90 commitment. Simultaneous lethal actions can draw.

**Timer readiness and Ammo readiness are independent.** Empty items keep charging. A full empty item waits without restarting. Reload or Charge can enqueue an eligible activation at the current timestamp; effects never recursively call an item's cast routine. The inspector links readiness to its cause.

Runtime safety limits are in content: maximum causal depth, events per timestamp, total events, plus a task-count guard. A violation yields an `error` result with time, source and parent diagnostics. The run reducer refuses to commit it as a normal combat outcome.

## Expressions, modifiers and effects

`evaluate.ts` provides arithmetic, source/target/player/tier/event/counter references, unique-type counts and target selectors. Evaluation does not mutate state. Random counts are rejected; randomness belongs to explicit selection. Unsafe intermediate expression arithmetic throws. Fixed-point modifier ratios use internal integer BigInt intermediates, then return bounded integer numbers; no BigInt crosses the JSON boundary.

Attribute layers are definition → persistent modifiers → enchantment attributes → auras → fight/timed modifiers → matching slot Note → rule floor. Within a layer, setters, additions, percentage deltas, multipliers, upper bounds (`min`) and lower bounds (`max`) run in that order; equal operations sort by modifier ID. Percentage and multiplier parameters are basis points (10,000 = 100%). Each step reports source, layer, before, operation and after. The minimum active cooldown is data-driven.

Auras query current source validity and geometry on demand. Their selectors cannot be random, rank by derived attributes, or predicate on derived attributes. Aura conditions cannot read source/target/player derived values or nested counts. This deliberately rejects cyclic dependencies instead of requiring a fixed-point solver. Player maximum-health auras initialize starting health before combat and disappear when their source is destroyed.

Effects are shared verbs, not item subclasses. Combat and run lifecycle events enter the same ability interpreter. Run-only resource, generation and upgrade operations use a controlled callback into the run reducer. Permanent combat changes produce explicit persistence records; ordinary damage, status, charge, Ammo, flight and destruction stay in the fight. Item modifiers are copied back only from surviving identities with matching definitions, except an explicitly permanent Transform.

## Randomness, hashes and portable formats

`roll` uses project-owned xorshift32 with rejection sampling. Each stream begins from FNV-1a of `seed + '/' + streamName` (zero replaced by 1). Encounter, shop, reward, opponent, target, crit and transform streams are independent. Combat receives a seed derived from run seed, day, hour and fight index, so shop rerolls do not consume combat randomness.

Canonical JSON sorts object keys lexicographically by UTF-16 code units, preserves array order, writes integer JSON numbers, omits undefined object properties, and rejects undefined array values/non-integer numbers. FNV-1a hashes UTF-16 code units, with unsigned 32-bit multiplication after each step. Hex hashes are eight lowercase digits. IDs in authored content are ASCII. This is a diagnostic hash, not a signature or security boundary.

Each event hash covers `{ time, players, entities, rng, nextEvent }` at that event. It is a world-state hash, not a pending-queue hash. The final hash covers the entire `CombatState`, including queue, persistence records, sequence counters and outcome. The transcript digest hashes the ordered event array. Diagnostic expression and selector strings use the same canonical encoding, so JSON property order cannot change the digest.

Every golden file embeds its immutable fixture content/version/hash plus a versioned Replay: initial snapshots, seed, commands, ordered events, final state, final hash and digest. The standalone combat fixture's command list is empty because snapshots and seed are its complete input. A run save contains the actual revisioned command history. A future port must compare exact event arrays, not just winner or total damage. No second-language port is present yet.

## Persistence and client playback

Run saves use a versioned envelope and a checksum over state, including commands and lifecycle events. Each noncombat choice is a safe persistence boundary. A result stores its winner/hash/seed and resumes reward resolution without fighting again; a full inspector transcript is a separate replay export. Oversized imports and incompatible content versions are rejected. Formats currently reject incompatible versions; migration logic will be added when a second format exists.

Frames are optional client convenience snapshots captured after events. They are excluded from the replay format and hashes; importing a replay regenerates them. Local storage, files, browser clocks, playback interpolation and Phaser objects all remain in the client. A future server or Colyseus adapter can invoke the same command API, but no networking has been added.

## Client interaction and inspection

Items have no selection mode. Pointer capture tracks one drag gesture, with a grabbed-slot offset for multi-slot items. Geometry previews reuse the simulation's placement and upgrade rules. The gesture stores the starting revision and cancels if the scene changes; Escape, right-click, pointer cancellation, lost capture and window blur also cancel. Reward and duplicate recipients come from the run's actual eligibility helpers.

`commitDrop` stages buy/reward acquisition followed by precise placement on owned state copies. The live run is replaced only when all commands succeed, so a lifecycle trigger that fills the requested space cannot leave a partially committed purchase. Rearrangement undo dispatches inverse move commands; it cannot rewind purchases, sales, rewards or RNG. The command/replay formats remain unchanged.

The detailed item view uses the simulation's attribute and expression evaluators, including attributes introduced only by auras or enchantments. Event/target-dependent values remain symbolic until their event supplies the operands. The simulator's per-event calculation trace is authoritative for resolved effects. Readable descriptions supplement the original ability JSON and counters.

The inspector docks beside the battle. Filter inputs and the transcript rows stay mounted during playback; only the current row and event details change. Manual transcript scrolling turns off following, and source names, IDs and payload explanations are searchable. Modal inspection and menus pause presentation time. Practice/replay state is explicitly cleared when a real run is loaded or resumed; practice displays its own snapshot skills/capacity and never persists mutations to the run.
