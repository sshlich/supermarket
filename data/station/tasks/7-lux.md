# Task 7: comfort, luxury, heirlooms, contraband fire, paper and cloth

Read first: `../SEED.md`, `../ids.json`, `STATION.md` sections 4, 11, `src/kinds.json` (wine, candle, book, locket,
matchbox, match, lighter, zippo). Wave A.

## You own and write
`items.lux.json`, `recipes.lux.json`, `discs.lux.json`.

## Scope and targets
| File | Target | Schema |
|---|---|---|
| items.lux.json | 40-50 (10 reserved + new) | SEED 6.8 |
| recipes.lux.json | 40-55 | 6.10 |
| discs.lux.json | the 6 reserved `disc_lux_*` (+ up to 3) | 6.11 |

Content: paper and cloth (feedstock for med, tech, packing), garments (spine overalls, a ring coat, gloves, a scarf),
furnishings (blanket, cushion, curtain: comfort for bunks), hygiene (soap, scent, cosmetics via `disc_lux_perfumery`),
drink (wine, spirit, a spine moonshine: `contraband: "unlicensed"`), books (old: heirloom, `value_basis: "rarity"`; new
printed ones: craft), jewellery (ring, chain, the locket), art (print, banner, sculpture via 3D printer models), toys and
games (cards, dice, a carved piece), fire contraband (candle, matchbox, match, lighter, zippo, a flint striker, a lamp
that burns oil), heirlooms with no recipe at all (an old photograph, a watch, a real wooden thing) that only come from
`salvage` or `seller`.

## Machines you use
`mach_pulper` (paper), `mach_loom` (cloth, garments; `disc_lux_garments` for garments), `mach_still` (`disc_lux_vintner`),
`mach_chem_bench` (`disc_lux_perfumery`, soap without disc), `mach_fabricator` (`disc_lux_bp_fire`), `mach_jeweller`
(p3), `mach_printer_m` (books in sheets), `mach_printer_l` (p3, banners and art), `mach_printer_3d` (`disc_lux_model_art`),
`mach_cellar` (aging wine: modify, `mod_aged`), `mach_kiln` (ceramics: cups, a vase), `mach_bench` (engraving is
`mod_engraved` on the jeweller), `mach_hands` (filling a matchbox, a zippo).

## Reserved IDs you depend on
`it_core_fibre_lint`, `it_core_rags`, `it_food_sugar`, `it_food_yeast`, `it_food_oil`, `it_med_ethanol`, `it_fab_bottle`,
`it_fab_bar_noble`, `it_core_noble_flake`, `it_fab_polymer_sheet`, `it_life_water`, `mod_aged`, `mod_engraved`,
`mod_real`, `mod_label_ring`.

## Connectivity duties
- `it_lux_paper` and `it_lux_cloth`: each from 2+ recipes (tech prints on paper, med makes bandages from cloth).
- Comfort items: `market_need: "need_comfort"` with `needs.need_comfort`; luxury: `need_luxury`. Ring-weighted `decks`.
- Contraband: `contraband: "fire"` for anything that burns, plus `heirloom` where it is old. They need a source
  (`salvage`, `seller`, or the fabricator with `disc_lux_bp_fire`) and a use (residents buy them; the fence trades them).
- `disc_lux_bp_fire` is exempt from the upgrade route: `found: ["mail", "seller"]`, `contraband: "fire"`. All other lux
  discs: `found` includes `"upgrade"`.

## Tricky parts
- Matchbox and zippo are containers: matchbox `container.fill` 10 `it_lux_match`; the zippo holds fuel (a fill of
  `it_med_ethanol`? simpler: a "lighter fluid" item of your own).
- Wine bottle composition is pinned and includes its glass: the still recipe consumes `it_fab_bottle` plus contents.
- Heirlooms with `value_basis: "rarity"` skip the value-depth check; still keep them inside their tier band.
