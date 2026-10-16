# Task 9: progression (upgrades and sinks, the start, placed fittings)

Read first: `../SEED.md` (6.15, 6.16, 8.1 especially), `../ids.json`, `ECONOMY.md` sections 6-7 (phases, sinks: new verbs
and new sights, not percentages), `STATION.md` sections 6, 8, 8a. Wave A.

## You own and write
`upgrades.json`, `start.json`, `items.fit.json`, `recipes.fit.json` (may stay `[]`).

## Scope and targets
| File | Target | Schema |
|---|---|---|
| upgrades.json | 120-150 | SEED 6.15 |
| start.json | 1 object | 6.16 |
| items.fit.json | 18-26 (3 reserved + new) | 6.8 (with `fixture` or `container`) |
| recipes.fit.json | 0-10 | 6.10 |

## The fixed routes (SEED 6.15)
1. **49 machine crates**: `upg_mach_<name>` for every reserved machine except `mach_hands`. `phase` = the machine's phase,
   `grants: [machine]`, `cost.credits` about the machine's value (inside the phase band), `delivery: "crate"`.
   `requires`: the phase, plus the predecessor for upgraded models (`upg_mach_vat_industrial` requires `mach_vat`;
   `upg_mach_terminal_pro` requires `mach_terminal`; `upg_mach_autofab` requires `mach_fab_precision`).
2. **Disc sales**: `upg_<disc id>` for every reserved disc of kind recipe, blueprint or program not in
   `ids.json` `upgrade_exempt_discs`. `phase` = the disc's phase, `grants: [disc]`, `delivery: "mail"`, `requires` the
   machine it runs in (first entry of its `machines`).
3. **The other sinks (25-45)**, each a placed thing (`it_fit_*`) or a visible stat: dock grid steps (`tiers`), field size
   (bigger shop), bunks (energy cap +1 each: cot -> bunk -> berth -> cabin), display case (ceiling_mult), shelving, a
   cold cabinet, a sign or ad board, a second counter, carrier account perks, a safe (security), a strongroom for
   contraband (inspection_chance down), a ledger book, wholesale account, hireling slots (phase 4), a stall upgrade on
   the ring (phase 4, rent up, budgets up), insurance against breakdowns. Most of these grant an `it_fit_*` item you
   define, with `fixture.effects`.

## start.json
Phase 1, credits 50, energy cap 7, field 25x20, dock 6x4, `ctier_0`. Things: the wired terminal, the modem, the slip
printer, `disc_tech_prog_mail`, `disc_tech_prog_labels`, a few boxes of each size, small cells, a knife, some ore and
mixed scrap, a handful of carried-over goods (bread, cheese wedge, a painkiller blister, a candle, a book), the three
carried-over fittings. Programs: the four ROM programs. Keep it small: the first ten minutes are the user's to design.

## Reserved IDs you depend on
Every `mach_*` and `disc_*` (you sell them), `ctier_*`, `phase_*`, `box_*`, items you put in `start.json`, stats.

## Connectivity duties
- Every `requires` entry must be reachable by the upgrade's phase (validator check 10). Use phases and machines, not items
  that might not exist.
- Prices: ECONOMY.md `2-4 x net at unlock x 1.5^n` inside `ids.json` phases[].upgrade_cost; information sinks may be
  cheaper; income sinks get `payback_days` 4-8.
- Every `it_fit_*` is granted by an upgrade (its source) and has `fixture` or `container` (its use).

## Tricky parts
- Effects are numbers on stats from `ids.json` `stats` only. "+1 energy" is `{ "stat": "energy_cap", "op": "add", "value": 1 }`.
- Do not sell disc IDs that are exempt; they come through mail and sellers (task 10).
- The calendar is a free UI layer: never a sink.
