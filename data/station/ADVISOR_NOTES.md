# Advisor notes

## Launch order
- **Wave A, in parallel:** tasks 1-9. Each depends only on `ids.json`, so none waits on another. Task 9 writes `start.json`;
  until it exists, reachability is skipped, so the others see no reach errors in the meantime.
- **Wave B:** task 10 (people), once every `items.*.json` and `discs.*.json` exists. It is the only task that reads
  other workers' files.
- **Merge pass** (one agent or you): `node data/station/validate.mjs --strict --all`, then fix the cross-domain leftovers
  listed below. Expect 50-150 errors on the first full run; most will be reach and sink errors between domains.

## Main risks
1. **Value scale contradiction.** ECONOMY.md wants net x10 per phase, item worth x4 per tier (4/16/64/256), and also quotes
   $4/$40/$400/$4000. I followed x4 for items and x10 for upgrade prices (`ids.json` phases). Phase 4 then gets very
   expensive sinks bought with goods that are only 64x phase 1: volume (customers, orders, automation) has to carry
   the rest. The sim must decide this; flagged for the user.
2. **Two x4 axes.** Value = materials x 4^depth, and tier is roughly x4 too. Depth-3 items made of noble or rare materials
   come out at hundreds: fine for tier 3-4, but workers may bend `depth` to fit a price. The validator warns on 0.3x-3x.
3. **Closed-loop spirals.** The recycler (10% to sludge) plus the digester (sludge to biomass) plus the vat make
   biomass a near-perpetual loop: food could become free value. Watch the energy and cell cost per loop, and keep
   digester outputs low-value. The vent is the only matter sink besides sales and the tithe.
4. **Transmutation as a loophole.** Hydro, algae, digester, still, chem bench and synthesiser can turn cheap matter
   (water, salts, gas, carbon) into dearer matter (biomass, reagent, polymer). That is intended (it is where value
   comes from), but the synthesiser making polymer from gas could undercut the whole scrap economy in phase 3.
5. **Mass vs gameplay granularity.** Pills (0.1 reagent), slips (0.1 fibre) and slices (0.17 biomass) force fractional
   outputs or filler byproducts. Workers may add odd byproducts to balance; check they are not nonsense.
6. **Reachability is optimistic.** The fixpoint ignores credits, energy and cells: anything purchasable is "reachable".
   It catches dead ends, not affordability. Affordability is the sim's job.
7. **Need coverage asymmetry.** Air and power have few natural consumer items (filters, canisters, cells). Check that
   each need has 3+ items worth selling at the counter, not only at the clinic.
8. **Upgrade count is mostly mechanical.** About 100 of 120-150 upgrades are the fixed 1:1 machine crates and disc sales.
   That keeps workers in agreement but makes "sinks" look padded; the 25-45 free ones carry the design.

## Schema ambiguities I closed (watch for drift)
- Containers: composition is the empty shell; contents are separate recipe lines. Filled vessels are separate items.
- `modify` recipes do not mass-balance strictly (outputs <= inputs only).
- Hand recipes are instant, 0 energy, 0 cells; anything else costs at least 1 energy now or runs free overnight.
- Discs are things (footprint and composition from `ids.json` `media`); boxes are their own file but also things.
- Sinks via tags (`prefers_tags`, order `wants.tag`) count as use, so tag discipline matters more than it looks.

## After the merge, check
1. `--strict --all`: zero errors; read every warning category.
2. Tier spread (30/32/23/15%) and per-domain counts in the summary.
3. Each unit item has a non-recycle sink (polymer flake, grit, carbon dust, gas bladder are the likely orphans).
4. Each phase opens new recipes on new machines (BY PHASE table) and no phase is empty of sinks.
5. Spot-read 20 random descriptions for tone; grep for em dashes and puns.
6. Then: a graph export (nodes = IDs, edges = references) for visualising, and feed `market_need`, `needs`, decks and
   events into `scripts/econ-sim.ts`.
