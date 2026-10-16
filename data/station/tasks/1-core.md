# Task 1: core (the frame, raw matter, waste)

Read first: `../SEED.md` (all of it), `../ids.json`, `/Users/sshlich/Projects/supermarket/STATION.md` sections 3, 4, 8, 9.
Wave A. Run `node data/station/validate.mjs` as you go.

## You own and write
`materials.json`, `needs.json`, `systems.json`, `decks.json`, `phases.json`, `boxes.json`, `carriers.json`,
`items.core.json`, `recipes.core.json`. Nothing else.

## Scope and targets
| File | Target | Schema |
|---|---|---|
| materials.json | the 16 reserved | SEED 6.1 |
| needs.json | the 8 reserved | 6.2 |
| systems.json | the 12 reserved | 6.3 |
| decks.json | the 7 reserved | 6.4 |
| phases.json | the 4 reserved | 6.5 |
| boxes.json | the 3 reserved | 6.6 |
| carriers.json | the 5 reserved | 6.7 |
| items.core.json | 28-34 (24 reserved + 4-10 new) | 6.8 |
| recipes.core.json | 22-30 | 6.10 |

New core items (your choice, prefix `it_core_`): salvage lots and junk that the spine and dock throw up, e.g. duct junk,
hull offcuts, a dead appliance, a salvage crate (a `container` with `fill`), rubble. All raw (depth 0), tier 1-2, each with
`inflow` (haul, salvage or seller) and a composition that recycles into something useful.

Recipes you write (machines from `ids.json`): `mach_crusher` (mixed scrap, e-waste, rags, ice, your new junk into unit
items: better yield than the recycler, no sludge), `mach_digester` (`time: "nights"`: sludge into biomass, salts, gas, water
via its transmutes), `mach_vent` (sludge and waste out: `loss` up to 100%, a `credits` fee), and `mach_bioreactor` sludge
digestion (the food worker owns its culture-food recipes). Do not write recycler recipes (generic rule, SEED 7.2).

## Pinned values to copy exactly
Everything under `ids.json` materials, needs (old_tags), decks, phases, systems (deck, supply needs), boxes, carrier_tiers,
and the 24 reserved `it_core_*` items.

## Connectivity duties
- Every material: `unit_item` as pinned, `inflow`/`outflow` channels filled honestly (sludge leaves by `vent`; water,
  ore and ice come in by `haul`; nothing but sludge, exports, the tithe and consumption leaves).
- Every system: `supply` shares (per need, the systems' shares sum to 0.7-0.95) and 2-4 `repair_items` drawn from reserved
  IDs (e.g. `it_fab_valve`, `it_fab_spare_part`, `it_mach_air_filter`, `it_tech_circuit`). Orders and events hang off these.
- Every deck: `wants` covering all 8 needs with weights that make the divide physical (spine: water, food, air high;
  ring: luxury, comfort high), `prefers_tags`, `contraband_tolerance`.
- Every raw item has `inflow`; every unit item is someone's feedstock (see the list below; leave a `notes` if not).
- Boxes: `tags` include `container` and `packaging`; `inflow` is `crate` (bought ahead).

## Who consumes your unit items (for your notes; they write those recipes)
greywater, ice -> life (purifier); salt cake, gas bladder -> life; biomass paste -> food (vat); polymer flake, grit, slag,
ores, scraps, noble flake -> fab; lithium salt, rare dust -> tech; reagent dregs -> med; carbon dust -> machines (filters);
fibre lint, rags -> lux (pulper, loom); sludge -> you (digester, vent).

## Tricky parts
- Mass balance on the crusher: e-waste has fractional rare and noble; output whole unit items with `chance` so the expected
  value balances (SEED 7.1).
- Digester: nights 2-3, energy 0, `time: "nights"`. Its transmutes come only from sludge.
- Needs gauges and prices: keep `price_floor` 0.5 and `price_cap` 2.5 (ECONOMY.md section 3).
- Phase `budget_scale` 1 / 4 / 16 / 64 and rent 5 / 50 / 500 / 5000 (pinned).
