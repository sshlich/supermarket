# Live-game validation backlog

No controlled live-game experiments were performed during implementation. The supplied dossier remains the source authority; these questions are not settled by passing prototype tests. The Ammo charging rule is already authoritative from the user's correction and must not be weakened while researching unrelated timings.

For each experiment, record reference patch/date, exact starting boards and skills, locations/tiers/enchantments, seed if available, multiple trials, and a timestamped video. Change one variable at a time. Compare the observed trace with a minimal fixture before changing the corresponding rule in `rules-decisions.md`.

| Dossier question                         | Controlled experiment                                                                                                        | Prototype decision to revisit |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 1. Start-of-combat order                 | Mirror two item and two skill start triggers; exchange board positions and acquisition order.                                | R02                           |
| 2. Natural activation ties               | Same-duration items with distinguishable outputs on both owners; reorder, reacquire, reconnect.                              | R02                           |
| 3. Reactions/multicast delays            | Record one item with multiple casts plus a reactive Charger; count use and cast events.                                      | R05                           |
| 4. Snapshot versus live conditions       | Two same-time effects change the predicate of a third trigger.                                                               | R02, R17                      |
| 5. Burn/Poison/Shield/Heal event meaning | Separate application, zero amount, blocked effect, tick, actual heal and overheal cases.                                     | R06, R07                      |
| 6. Haste plus Slow/target preference     | Apply independently and together at fixed partial progress; repeat with already affected candidates.                         | R03                           |
| 7. Freeze expiration ties                | Align full charge and expiration, including fully charged empty items reloaded at that instant.                              | R03, R04                      |
| 8. Charge overflow                       | Overfill once and with two simultaneous Chargers; measure following cooldown.                                                | R04                           |
| 9. Crit granularity                      | Multi-output item with multicast and bounded Ammo; compare outputs and ammo spent per wave.                                  | R05                           |
| 10. Lifesteal basis                      | Equal damage against no Shield, partial Shield, full Shield and near-dead targets.                                           | R08                           |
| 11. Healing cleanse                      | Try odd stack counts, small heals, full-health overheal and Lifesteal. Confirm current percentage/rounding.                  | R07                           |
| 12. Periodic tick order                  | Align Regen, Poison, odd Burn with one Shield, and storm on one second.                                                      | R06                           |
| 13. Sandstorm/timeout                    | Use near-stalemate boards; record first tick, curve, cap, mitigation, early start and tie.                                   | R19                           |
| 14. Destroyed auras/queued actions       | Destroy a passive aura source and a ready active item during a reaction chain.                                               | R10                           |
| 15. Repair inheritance                   | Destroy with partial charge, empty Ammo, status durations and spent one-shot; repair later.                                  | R10                           |
| 16. Forced use gates                     | Force use while Frozen, destroyed, empty, full and on a passive-only item.                                                   | R03, R05                      |
| 17. Transform inheritance                | Add mutations/types/quest progress/enchantment; transform in and out of combat. Test the same definition as a random result. | R12                           |
| 18. Protection semantics                 | Include protected and unprotected candidates; distinguish exclusion from successful targeting followed by absorption.        | R10                           |
| 19. Duplicate target selection           | Own generated copies with differing acquisition order, tier and enchantment; purchase a duplicate.                           | R13                           |
| 20. Hour boundaries                      | Cross multiple levels from an encounter and from a merchant trigger at the final hour. Inspect income and reward ordering.   | R15, R16                      |
| 21. Location rules                       | Repeat each lifecycle trigger with its source in board, stash and destroyed state where possible.                            | R01, R23                      |
| 22. Infinite-loop limits                 | Observe safe, controlled self-referential Charge/forced-use cases; record cutoff rather than assuming an event budget.       | R24                           |

Additional focused questions: whether intrinsic Flying counts as “started Flying”; exact temporary type and slot inheritance; activation-scoped buffs created by post-cast reactions; whether enchantment-derived tags survive disabled state for targeting; and exact behavior when an incoming higher-tier duplicate upgrades a lower-tier owned copy.

## Product playtesting backlog

- Measure three or more human full runs. The desired 40–60 minutes is currently supported only by the number of decision/combat checkpoints, not by observed session lengths.
- Tune rival difficulty, shop tier odds and reward economy across weak, balanced and optimized builds. The command-only `lantern-47` test proves ten wins are attainable; it is not evidence of balanced difficulty.
- Test long-term inspector usability on dense trigger builds and at 1080–1440 px widths. Browser automation currently verifies the core flow at 1512 px.
- A future Godot/LÖVE implementation should run the JSON fixtures verbatim. No cross-language result has yet been measured.
