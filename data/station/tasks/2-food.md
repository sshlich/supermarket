# Task 2: food (hydro, vat, galley, cutting)

Read first: `../SEED.md`, `../ids.json`, `STATION.md` sections 4-6 and 11, `src/kinds.json` (bread, sandwich, cheese,
salami, apple). Wave A.

## You own and write
`items.food.json`, `recipes.food.json`, `discs.food.json`.

## Scope and targets
| File | Target | Schema |
|---|---|---|
| items.food.json | 40-50 (13 reserved + new) | SEED 6.8 |
| recipes.food.json | 60-75 | 6.10 |
| discs.food.json | the 8 reserved `disc_food_*` (+ up to 3) | 6.11 |

Content: hydro crops (greens, beans, herbs, potatoes, fibre crops? no: fibre is lux's), seeds for each crop, vat staples
(ration bar, paste tubes, protein blocks, crackers), bakery (bread), dairy (cheese wheel/wedge/slice), charcuterie
(salami/slices), sugar, oil, yeast, galley meals (stew, noodles, dumplings, a ring dinner), sandwiches, tinned food
(uses `it_fab_tin`), ring fresh produce (apple, citrus, berries via `disc_food_hydro_orchard`), culture food from the
bioreactor (phase 4). Spine staples are cheap and synthetic; ring food is real and dear. Tiers 1-4 across the range.

## Machines you use
`mach_hydro_tray` (p1), `mach_vat` (p2), `mach_kitchen` (p2), `mach_hydro_rack` (p3), `mach_vat_industrial` (p3),
`mach_cellar` (p3, aging cheese: `kind: "modify"`, `mods_add: ["mod_aged"]`, nights), `mach_bioreactor` (p4),
`mach_hands` (cutting with `tools: ["it_fab_knife"]`, stacking sandwiches, opening tins).

## Reserved IDs you depend on (not yours)
`it_core_biomass_paste` (vat feed), `it_life_water`, `it_life_nutrient`, `it_life_algae`, `it_tech_lamp` (hydro tool),
`it_fab_tin`, `it_fab_knife`, `it_core_sludge` (bioreactor input), `mod_real`, `mod_synthetic`, `mod_aged`.

## Connectivity duties
- Every food item: `market_need: "need_food"` (or `need_luxury` for ring delicacies), and `needs` with need_food amounts
  (ration bar 0.5, a meal 1, a slice 0.1). Eaten items get `use` with `energy_now` (+1 for a meal, never more than +2) or
  `adds: ["stat_fed"]`.
- Sugar, oil and yeast are feedstock for lux (wine, spirit), med (salves) and life; make plenty of recipes produce them.
- Cutting recipes conserve mass exactly: wheel (biomass 8) -> 8 wedges (1 each); wedge -> 6 slices (0.17); salami -> 8
  slices (0.5); loaf -> 8 slices (0.5). The pinned `it_food_sandwich` (biomass 1.5) is 2 bread slices + 1 salami slice.
  A cheese sandwich weighs 1.17, so it is its own item (`it_food_sandwich_cheese`); likewise any other filling.
- Hydro recipes: `time: "nights"`, inputs seed + water + nutrient, `tools: ["it_tech_lamp"]`, outputs crop + seeds back
  (chance). Mass: seed, water, nutrient in; crop out; use the hydro transmutes.
- Every disc: `found` includes `"upgrade"` (SEED 6.15); `disc_food_hydro_greens` also `seller`.

## Tricky parts
- Vat recipes take `it_core_biomass_paste` (biomass 1 each) and maybe salts or water: count units.
- Keep the pinned values for the 13 reserved food items, including `it_food_sandwich` composition biomass 1.5.
- No spoilage (STATION section 14). Aging is a modifier, not a clock.
