# Task 3: life support (water and air)

Read first: `../SEED.md`, `../ids.json`, `STATION.md` sections 3-5, 9, 11. Wave A.

## You own and write
`items.life.json`, `recipes.life.json`, `discs.life.json`.

## Scope and targets
| File | Target | Schema |
|---|---|---|
| items.life.json | 22-28 (6 reserved + new) | SEED 6.8 |
| recipes.life.json | 30-40 | 6.10 |
| discs.life.json | the 2 reserved `disc_life_*` (+ up to 3) | 6.11 |

Content: water in many forms (pouch, jug, distilled, medical saline-grade water, ice melt, a ration of water for the
spine), gas (oxygen canister, hydrogen canister, a CO2 bladder, breathing mask refill), air goods sold to residents (a bunk
air purifier puck, a sealed rebreather mask, emergency oxygen candle: this one is fire, so mark it `contraband: "fire"`
or make it a chemical one), nutrient mixes, algae (mat, dried algae flakes as cheap spine food? no, that is food's:
make algae feedstock only), brine, a water-tester strip.

## Machines you use
`mach_purifier` (p1; tools `it_mach_water_filter`), `mach_electrolyser` (p2), `mach_scrubber` (p2; tools
`it_mach_air_filter`, disc `disc_life_scrubber_profiles` for advanced recipes), `mach_algae_tank` (p2, nights, disc
`disc_life_algae_strains` for advanced strains), `mach_still` (distilled water, no disc), `mach_hands` (filling and
emptying canisters).

## Reserved IDs you depend on
`it_core_greywater`, `it_core_ice`, `it_core_salt_cake`, `it_core_gas_bladder`, `it_core_biomass_paste`,
`it_mach_water_filter`, `it_mach_air_filter`, `it_fab_bottle`, `it_fab_valve`, `it_fab_pipe`, `it_fab_polymer_sheet`.

## Connectivity duties
- Every water item `market_need: "need_water"` with `needs.need_water`; air items `need_air`. These are the spine's
  staples: cheap, high-volume, thin margins.
- `it_life_nutrient` and `it_life_algae` must be produced by several recipes (food depends on them); `it_life_water` by at
  least 3.
- Canisters: filling a canister is a hand or machine recipe that consumes `it_life_canister` + gas and outputs the filled
  item; using/emptying returns the canister.
- Every disc: `found` includes `"upgrade"`.

## Tricky parts
- Ice is water 2 + volatiles 1: the purifier gives 2 water and must output the gas (a gas bladder) or put it in `loss`
  (max 10%: it is 33%, so output it).
- Electrolyser transmutes water into volatiles only; the scrubber turns volatiles into carbon (CO2 capture: output
  `it_core_carbon_dust`).
- Filters are tools (wear), not inputs: a purifier recipe lists `tools: ["it_mach_water_filter"]`.
