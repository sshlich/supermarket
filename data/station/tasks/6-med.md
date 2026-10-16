# Task 6: medicine and chemistry

Read first: `../SEED.md`, `../ids.json`, `STATION.md` sections 3-4, 11, `src/kinds.json` (pill, blister, bandage,
antiseptic). Wave A.

## You own and write
`items.med.json`, `recipes.med.json`, `discs.med.json`.

## Scope and targets
| File | Target | Schema |
|---|---|---|
| items.med.json | 30-40 (8 reserved + new) | SEED 6.8 |
| recipes.med.json | 40-50 | 6.10 |
| discs.med.json | the 7 reserved `disc_med_*` (+ up to 3) | 6.11 |

Content: pills (painkiller, antibiotic, sleeping, plus antivirals, anti-radiation tabs for core, burn tabs), filled blisters
(one item per pill type, `container` with `fill` of 6 pills), wound care (bandage, gauze pad, burn gel, suture kit,
splint), antiseptic, saline, ethanol, solvents, reagents (purified reagent, acid, base), stims and sedatives (player
consumables, `use` with `energy_now` and `adds`), a first-aid kit (container), clinic bulk packs, ring medicine (phase 4:
regrowth gel, gene patch), and contraband drugs (`contraband: "drug"`, via `disc_med_narcotics`).

## Machines you use
`mach_chem_bench` (p2, `disc_med_chem_basics`, `disc_med_stimulants`), `mach_still` (ethanol: biomass -> reagent),
`mach_pill_press` (p2, `disc_med_analgesics`, `disc_med_sedatives`), `mach_loom` (gauze: recipes on the loom with
`disc: null`), `mach_synthesiser` (p3, `disc_med_antibiotics`, `_narcotics`, `_regenerative`), `mach_hands`
(filling blisters, kits).

## Reserved IDs you depend on
`it_core_reagent_dregs`, `it_core_biomass_paste`, `it_core_salt_cake`, `it_core_carbon_dust`, `it_life_water`,
`it_fab_vial`, `it_lux_cloth`, `it_food_sugar`, `it_food_oil`, `it_food_yeast`, `stat_wired`, `stat_crash`,
`stat_tired`.

## Connectivity duties
- Everything medical: `market_need: "need_medicine"`, `needs.need_medicine`. The clinic (`org_clinic`) and
  `res_orderly` will order them in bulk (task 10): make bulk-friendly packs.
- `it_med_ethanol` is lux's spirit and lighter-fuel input: produce it from 2+ recipes.
- Stims: `use: { target: "self", effects: [{ "stat": "energy_now", "op": "add", "value": 1 }], adds: ["stat_wired"] }`.
  Sleeping pills clear `stat_tired`.
- Every non-exempt disc: `found` includes `"upgrade"`. `disc_med_narcotics` is exempt: `found: ["mail", "seller"]`,
  `contraband: "drug"`.

## Tricky parts
- Pills are tiny (reagent 0.1): a press recipe that makes 6 pills from 1 reagent dreg must output the rest as something
  (another pill line, or `it_core_sludge` filler waste), not lose 40%.
- Filled blisters: composition is the empty card (pinned for `it_med_blister`); a filled-blister item is a new ID with
  `container.fill`, and the recipe lists the pills as separate inputs.
