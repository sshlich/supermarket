# Task 8: machines, statuses, modifiers, machine consumables

Read first: `../SEED.md` (6.9, 6.13, 6.14, 7.2, 7.4 especially), `../ids.json` `machines`, `statuses`, `modifiers`,
`STATION.md` sections 5-6, `src/furnace.ts`, `src/kinds.json` (furnace, computer). Wave A.

## You own and write
`machines.json`, `statuses.json`, `modifiers.json`, `items.mach.json`, `recipes.mach.json`, `discs.mach.json`.

## Scope and targets
| File | Target | Schema |
|---|---|---|
| machines.json | the 50 reserved (+ up to 4) | SEED 6.9 |
| statuses.json | 25-35 (12 reserved + new) | 6.13 |
| modifiers.json | 18-28 (16 reserved + new) | 6.14 |
| items.mach.json | 14-20 (4 reserved + new) | 6.8 |
| recipes.mach.json | 40-55 | 6.10 |
| discs.mach.json | the 7 reserved `disc_mach_*` (+ up to 3) | 6.11 |

## Machines
For every reserved machine: copy the pinned fields; write `desc`, footprint (`w`, `h`: phase 1 machines 2x2 to 3x4, phase
4 up to 6x6; the smelter keeps the furnace's 3x4, the terminal 3x3), `value` (inside the phase's `upgrade_cost` band,
since `upg_mach_*` sells it at about that price), `composition` (iron, light metal, copper, polymer, a little rare for
electronics), `slots` (input/output/cell/tray/tool/consumable grids, furnace-like), `cells_per_job`, `energy_per_job`,
`jobs`, `statuses`, `consumables`, `upgrades_to`. Do machines (`mach_radio`, `mach_modem`, `mach_broadcaster`,
`mach_terminal*`, `mach_mainframe`, `mach_scanner`, `mach_chiller`) carry `effects` with stats from `ids.json`.
`mach_hands`: `virtual: true`, footprint 1x1, value 0, composition `{}` (the only thing allowed an empty one).

## Statuses and modifiers
Machine statuses (jammed, hot, overclocked, worn, infected, unpowered, dusty, leaking, misaligned, ...), player statuses
(tired, wired, crash, fed, flagged, sore, focused, ...), station statuses (brownout, water rationing, lockdown, festival
mood, ...). Each with `effects`, `duration_days`, `caused_by`, `cleared_by`. Modifiers: the 16 reserved plus more (e.g.
`mod_dented`, `mod_monogrammed`, `mod_contraband_hidden`), each with `value_mult`, `applied_by`, `removed_by`.

## Items and recipes you write
Consumables: coolant, lubricant, water filter, air cartridge (reserved), plus spent filters (`wear.becomes`), a
jam-clearing kit, a fuse, a drive belt, a service manual (data), sealing tape, padding (packing material). Recipes:
machine consumables (chem bench with `disc_mach_consumables`; filters on the fabricator with `disc_mach_bp_filters`);
**do/modify recipes on general machines**: sealing a box (`mach_sealer`, `mods_add: ["mod_sealed"]`, target the three
boxes), clearing a jam (`mach_bench` or hands with a wrench: `clears: ["stat_jammed"]`, energy 1), cooling
(`mach_chiller`), scanning (`mach_scanner`: removes hidden flags, `effects`), labelling (`mach_labeller` with the two label
discs), repairing and refurbishing (`mach_bench`: `mod_damaged` -> `mod_refurbished`, consumes `it_fab_spare_part`).
**Machine blueprints**: build phase 1 machines on the fabricator (`disc_mach_bp_machines_1`), phase 2 on the precision
fabricator (`_2`), phase 3 on the autofab (`_3`): inputs are parts (bars, sheet, motor, circuit, housing) whose
composition must equal the machine's composition. Aim for 15-20 machine builds.

## Reserved IDs you depend on
All `mach_*`, `stat_*`, `mod_*` (yours); `it_fab_*` parts, `it_tech_motor`, `it_tech_circuit`, `it_tech_sensor`,
`it_tech_screen`, `it_tech_cable`, `it_core_carbon_dust`, `it_core_polymer_flake`, `it_core_reagent_dregs`,
`it_life_water`, `box_s`, `box_m`, `box_l`, `it_tech_slip`.

## Connectivity duties
- Every machine is used (recipes by other tasks, a generic rule, or `effects`). Every disc: `found` includes `"upgrade"`.
- Filters and coolant are bought by residents too (spine bunks): give them `needs` (`need_air`, `need_parts`).

## Tricky parts
- Machine compositions must be buildable: a blueprint recipe's input units equal the machine's composition units.
- Do not write recipes for the generic rules (recycle, copy, charge). Do write the charger's effects text.
