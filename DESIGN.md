# Design notes

Where the game stands, what's decided, and what's still open. Last updated 2026-09-25.

## Running it

```sh
npm install        # once
npm run dev        # game at http://localhost:5173/, card gallery at /gallery.html (dev only)
npm test
npm run icons      # after using new icon names in items/skills (see scripts/icons.ts)
```

Test flags start a test run that doesn't save and has no start screen:
`?gold=500&level=4&items=windupKey,rustBlade:gold:shielded&skills=quickHands:silver`
(items: `key[:tier[:enchant]]`, skills: `key[:tier]`).

## What's built

- **Board and stash:** drag and drop, pushing and swapping, merchants, selling. A drop on the chest goes into the stash and compacts it if the free space is split up.
- **Combat engine** (`src/engine/combat.ts`): data-driven abilities (trigger → condition → actions), auras, deterministic from a seed. It covers Damage, Heal, Shield, Burn, Poison, Regen, Haste, Slow, Freeze, Charge, Reload, Crit, Multicast, Ammo, Lifesteal, Destroy/Repair, Transform, Cleanse, multipliers, immunity, and run effects (permanent Grow, Gold, quest Progress, Upgrade).
- **Tiers and upgrade paths** (`src/tiers.ts`), **enchantment rules** (`src/enchant.ts`), **skills** (`src/skills.ts`), **quests and permanent growth** (`src/items.ts`, `src/run-effects.ts`).
- **The run:** 6-hour days (choice, choice, monster, choice, choice, rival), XP and levels, events, a start pick, a last chance, 10 wins to finish. Shops roll tiers by day (`src/shop.ts`). The run saves every hour and a resume replays that hour exactly (`src/save.ts`).
- **Presentation:** icon art with stacking layouts (`src/art.ts`), tier paths in tooltips, a fight log panel (`src/fight-log.ts`).
- **Content:** placeholder and test content only. It exists to exercise every mechanic; real items come later.

## Decided rules

- **PvE only**, for now.
- **Stat classes:** T1 = Damage, Heal, Shield. T2 = Burn, Poison, Regen.
- **Upgrades:** T1 and T2 values double per tier by default (5 → 10 → 20 → 40). Any number can have its own path: `tiers(…)`, `grows(…)`, `steps(…)`.
- **Enchantments are rules over an item's own numbers:**
  - If the item already has the enchantment's stat, it doubles.
  - A T1 enchantment adds its stat equal to the item's biggest T1 number.
  - A T2 enchantment adds 10% of that.
  - Scalers get their gain doubled, or a parallel gain for the other stat.
  - Heavy, Turbo and Frozen add Slow, Haste or Freeze.
  - Shiny adds +1 Multicast; Radiant gives immunity.
  - Shiny, Frozen and Obsidian are legendary rare.
  - Any item can override the rule.
- **Skills upgrade** when you take one you already have (or by other means).

## Agreed base work (before the big content push)

1. **Split the run rules out of the UI.** `main.ts` is about 1,360 lines with around 20 globals, and the run's rules are mixed in with drag handling and animation. We need a plain run model (state plus actions) that the view draws and sends actions to. That unlocks headless tests and simulation, reliable saves, new screens, and a reimagined loop without a rewrite.
2. **One vocabulary for effects and conditions.** Today there are five separate reward shapes (level-up, event, start package, last chance, quest reward) plus run effects. They should all become one language, e.g. "pay 5 gold; if you have a Weapon, it permanently gains 10 Damage; set flag *met the smith*". Events, quests, stations and rewards would all use it.
3. **Item text vs behaviour.** Tooltip text is written separately from abilities and can drift. Either generate the standard lines from the ability data (with room for flavour text) or add a test that checks them against each other.
4. Agreed in spirit, format undecided:
   - The run's structure as data rather than code.
   - Persistence beyond one run (unlockables, versioned saves).

Also worth doing, none of it needing a redesign:
- **Engine vocabulary:** values that read run state (gold, level, flags), counters ("every 3rd use"), richer conditions (health thresholds) and more triggers (when hit, shield breaks, kills).
- **Proper screens:** map, camp and stations, instead of repurposing the top row.
- **Headless balance simulation.**

## Presentation wants

- **Item trigger animations:** something travels from the item to a portrait. The opponent's for Damage, Burn and Poison; yours for Heal, Shield and Regen.
- **Shield:** an overlay on the HP bar. Above max HP the bar stays full and always shows the shield number.
- **Status visuals** (proposal): Burn embers and a pulse per tick, a Poison tint and drips, Regen sparkles, and a shield that cracks when hit and shatters when it breaks.
- **Upgrade and enchant stations:** show an empty slot and drag an item into it, instead of picking from cards.

## Gameplay direction (still forming)

What the user wants:
- **Expedition + downtime.** On an expedition you fight monsters and go through locations and events. In downtime you craft, upgrade, train and so on.
- **Roleplay** is short choices, with some conditional or unlockable options.
- **Progression** happens mainly inside a long run. Unlockables that make starts easier may come later.
- **Crafting and upgrading are the path:** start in easy zones, bring things back, craft and buy, then go to more rewarding and riskier zones. Items found vs made: about 60/40.
- **Party-based** would be nice (an expedition is several people with support roles), but it's unclear how it fits the current UI.
- **Wear:** worn items get big debuffs and break if used after that, which gives a reason to go back and recover.
- **Losing** is undecided: maybe losing random equipment, or the party returning barely alive and needing to rest or heal.

Concerns raised:
- If health carries between fights, Heal and Regen builds become the answer to sustain and dominate.
- A time or interaction limit alone gives no way to optimise an expedition, unless there are power-gated shortcuts.
- The current Bazaar-like visuals don't sell the expedition fantasy.

### Proposals on the table (not decided)

- **Wear as the pressure, not health.** Combat health resets every fight, as now. Fights wear down the items that took part; worn items are debuffed and broken ones stop working until repaired. Healing can't fix wear, so heal builds stay one combat style. Repair items or a tinkerer extend an expedition but cost board space.
  - The limit is how much your gear can take. Players play with it through route choice, risk, skipped fights and shortcuts (keys or tools that open paths).
- **Party members as cards on the board.** Recruited, persistent characters stand in the board's formation. They work with adjacent gear ("adjacent Weapons +20% crit" = Duelist) and support neighbours through auras. The engine already does neighbours, tags and auras.
  - Characters level and train in downtime and get injured. On a loss the party comes back hurt, injured characters carry debuffs until they rest, and loot you hadn't brought home yet is lost.
  - The portrait is the expedition as a whole, with one shared health pool, so there's no per-character health or targeting.
- **Layout: the top half is the world, the bottom half is you.** The board, stash, skills and portrait stay constant. The top area shows the map, an event card (art plus choices), an enemy, a station or a merchant. Add location backdrops, a map screen and a camp screen. The fight screen stays as it is.
- **Items get a second job:**
  - Tags act as keys in events ("a Tool pries the door open", "a Light reveals the passage").
  - Materials and salvage.
  - Crafting and upgrading replace the buy-a-duplicate rule; the tier system stays.
  - Consumables between fights.
  - Wear.
- **Setting directions:**
  - Frontier expedition with an outpost you build up.
  - Salvage divers in ruins with a workshop (fits the current scrap and clockwork feel).
  - A caravan with towns as downtime.

### Open questions

1. Characters as cards on a shared board, or separate heroes with their own health and item slots? (Proposal: cards.)
2. Wear as the main pressure, with health resetting each fight?
3. What does a whole run aim for: a final region or boss, a season of N expeditions, or open-ended?
4. What does losing cost?
5. Which setting?
6. How does item power grow in practice: crafting with materials, upgrading at stations, growth with use? What does each cost?

## Suggested next steps

1. Settle the open questions above, since they shape item design.
2. Base work 1 and 2 (run model, one effects vocabulary). These are needed whatever the loop ends up being.
3. The VFX and station UI wants, which are independent of the loop decisions.
4. Then the loop itself (expedition and downtime screens, wear, party), and after that the real items.
