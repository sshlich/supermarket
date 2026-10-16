# Task 4: fabrication (metals, polymer, glass, parts, tools)

Read first: `../SEED.md`, `../ids.json`, `STATION.md` sections 4-5, `src/furnace.ts` (how the smelter works today),
`src/kinds.json` (ore, ingot, knife, bottle). Wave A.

## You own and write
`items.fab.json`, `recipes.fab.json`, `discs.fab.json`.

## Scope and targets
| File | Target | Schema |
|---|---|---|
| items.fab.json | 40-50 (18 reserved + new) | SEED 6.8 |
| recipes.fab.json | 60-75 | 6.10 |
| discs.fab.json | the 8 reserved `disc_fab_*` (+ up to 3) | 6.11 |

Content: bars (iron, copper, light, noble), sheet, wire, pipe, fasteners, brackets, springs, gears, bearings, valves, seals,
hinges, spare parts in grades (spine-patched, standard, precision), tools (knife, wrench, pliers, cutter, torque driver,
multitool; tempered versions are `mod_tempered`, not new items), polymer goods (sheet, tube, film, tubs, crates), glass
(pane, vial, bottle, jar, lens), ceramics (tile, crucible liner), hull and structural plate (phase 4), printed fittings
from the 3D printer, refined rare and noble recovery (phase 4).

## Machines you use
`mach_smelter` (p1, no disc), `mach_bench` (rolling, cutting, simple bending; `time: "job"`), `mach_extruder` (p2),
`mach_kiln` (p2), `mach_fabricator` (p2, blueprint discs), `mach_fab_precision` (p3), `mach_printer_3d` (p3, card
discs), `mach_annealer` (p3, modify, `mod_tempered`), `mach_synthesiser` (p3, `disc_fab_synth_polymer`: new polymer from
carbon and gas), `mach_autofab` (p4), `mach_refinery` (p4, `disc_fab_refine`).

## Reserved IDs you depend on
`it_core_ore_iron`, `it_core_ore_copper`, `it_core_ore_light`, `it_core_slag`, `it_core_grit`, `it_core_scrap_iron`,
`it_core_scrap_copper`, `it_core_scrap_light`, `it_core_polymer_flake`, `it_core_noble_flake`, `it_core_rare_dust`,
`it_core_ewaste`, `it_core_carbon_dust`, `it_core_gas_bladder`, `it_core_reagent_dregs`, `it_mach_lubricant`,
`mod_tempered`, `mod_refurbished`.

## Connectivity duties
- Parts follow `market_need: "need_parts"`; tools have `wear` and `needs.need_parts`; `it_fab_spare_part` is what
  machines and the station consume when broken (stat_worn): make it from at least 3 recipes at different phases.
- Scrap must become bars too: a smelter recipe for each unit scrap (2 scrap -> 1 bar, no slag).
- Glass and vials feed med and lux; tins feed food; housings, sheet and wire feed tech: produce each from 2+ recipes.
- Every disc: `found` includes `"upgrade"`.

## Tricky parts
- Smelting ore: 2 ore (metal 1 + silicate 1 each) -> 1 bar (metal 2) + 2 slag. Pinned, balanced.
- The fabricator has `max_inputs: 3`, precision 4, autofab 5: plan recipe inputs around that.
- Refinery recovers fractional rare/noble from e-waste and slag: use `chance` outputs so expected mass balances.
- Value: a part is depth 2 (materials x16); a precision part depth 3; check SEED 7.3 bands.
