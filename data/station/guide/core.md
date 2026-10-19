# Core materials: reader's guide

These 32 items are the station's raw layer: scrap units, powders, liquids and gases, hauled ores and ice, bagged salvage lots, and a few rare tier-2 ingredients. None of them is a finished good. No ledger entry for this group is wanted by an order or granted by an upgrade, so none is sold directly to a need.

In the overall loop (scrap -> crusher/recycler -> materials -> machines -> goods -> sold), these are the first two steps. Bagged salvage (mixed scrap, e-waste, rags and so on) and hauled ore or ice are broken down mainly by the Crusher into unit materials (iron, copper, light scrap, grit, polymer flake, fibre lint and similar). The Refinery handles e-waste and a few other inputs. The Digester and Bioreactor turn sludge into food and water feedstock.

The unit materials then feed the Smelter (bars), Kiln (glass, ceramics), Extruder (polymer), Loom and Pulper (fibre), Vat (food), Cell press, Synthesiser and the Workbench or Fabricator. Those machines make the goods that are eventually sold. Entries below are grouped by role. "Worth" is the item's `value`; sizes are width x height in inventory cells.

## Metal and mineral units

### Iron scrap (`it_core_scrap_iron`) — tier 1 · 1x1 · worth 1$
**What it is:** A fist of bent, rust-red iron offcuts; one unit of iron.
**Function:** Basic iron feedstock for smelting, sheet rolling, spare parts and cell pressing. Its market need is parts.
**Chain:** `Comes from:` Salvage inflow. Found at Spine ducts (weight 0.9, 1-3 pieces) and Works slag heap (0.8, 1-3). Crusher recipes that make it: Crush mixed scrap, Crush iron ore, Crush hull offcuts (3 per 2), Crush rubble, Crush dead appliance. `Goes into:` Smelter: Melt iron scrap -> Iron bar. Workbench: Roll sheet from scrap -> Steel sheet; Patch a spare part -> Patched spare. Cell press: Press small cells (Cell chemistry). Scrubber: Sinter oxygen candle; and 4 more.
**Note:** Not sold in any shop.

### Copper scrap (`it_core_scrap_copper`) — tier 1 · 1x1 · worth 2$
**What it is:** Stripped copper, still curled from the conduit it came from; one unit of copper.
**Function:** Wire and tool stock. Smelted to bars, drawn to wire, or used in spare parts and jewellery.
**Chain:** `Comes from:` Salvage inflow. Found at Spine ducts (0.6, 1-2) and Core cableway (0.8, 1-3). Crusher: Crush wire tangle (3 per 2), Crush e-waste, Crush copper ore, Crush dead appliance, Crush mixed scrap (50% chance); also Refinery: Refine e-waste; and 1 more. `Goes into:` Smelter: Melt copper scrap -> Copper bar. Workbench: Draw wire from scrap -> Copper wire; Rework patched spares -> Spare part. Fabricator and Autofab: Fabricate or Batch spare parts. Jeweller's bench: Cast signet -> Signet ring; and 1 more.

### Light scrap (`it_core_scrap_light`) — tier 1 · 1x1 · worth 2$
**What it is:** Pale alloy bent off a ladder rail or duct frame; one unit of light metal, light enough for one hand.
**Function:** Light-metal feedstock for the Smelter, the 3D printer and a few small goods.
**Chain:** `Comes from:` Salvage inflow. Found at Spine ducts (0.5, 1-2) and Core cableway (0.5, 1-2). Crusher: Crush bauxite, Crush duct junk, Crush hull offcuts (2 per 2), Crush cell husks. `Goes into:` Smelter: Melt light scrap -> Light-metal bar. 3D printer: Print brackets -> Printed bracket; Print pipe fittings -> Printed fitting. Your hands: Fit splint -> Splint (with padding). Pill press: Press blister cards; and 4 more (Press heavy cells among them).

### Grit (`it_core_grit`) — tier 1 · 1x1 · worth 0.2$
**What it is:** Coarse pale sand ground from stone and old glass; one unit of silicate.
**Function:** The Kiln's main feedstock: glass, bottles, jars, cups, vases. Also a minor ingredient elsewhere (for example Build sensors).
**Chain:** `Comes from:` Salvage inflow. Found at Works slag heap (0.7, 1-3). Crusher: Crush rubble (4 per 2), Crush slag, Crush iron ore, Crush copper ore, Crush bauxite; also byproduct of Strip circuit boards (Refinery) and Synthesise antivirals; and 3 more. `Goes into:` Kiln: Melt grit to pane -> Glass pane; Blow vials from grit -> Glass vial; Blow bottle from grit -> Bottle; Press jars -> Glass jar; Fire cups -> Clay cup; and 6 more.

### Carbon dust (`it_core_carbon_dust`) — tier 1 · 1x1 · worth 0.5$
**What it is:** Black dust that coats the hand and stays, from old filters, burnt husks and duct soot.
**Function:** Feedstock for filters, steel and polymer synthesis, plus a consumable for the Annealer.
**Chain:** `Comes from:` Salvage inflow. Found at Works slag heap (0.6, 1-2). Crusher: Crush spent filters (2 per 2), Crush rubble, Crush cell husks. Scrubber: Scrub foul air, Strip foul air deep; and 1 more (Synthesise antivirals). `Goes into:` Synthesiser: Synthesise polymer and Synthesise from dregs -> Polymer flake. Kiln: Fire crucible liners -> Crucible liner. Annealer: Temper a tool, Temper a machine part. Your hands: Press air pucks -> Air puck; and 17 more.

### Slag (`it_core_slag`) — tier 1 · 1x1 · worth 0.2$
**What it is:** Glassy grey clinker raked out of the smelter.
**Function:** A waste byproduct the Kiln can use (glass, bottles, tiles). Can also be vented.
**Chain:** `Comes from:` Smelter byproduct: Smelt iron, copper or bauxite (2 per job); Fabricator and Autofab: Etch circuit boards. Also salvage inflow, found at Works slag heap (0.9, 1-4). `Goes into:` Crusher: Crush slag -> Grit. Kiln: Melt slag to pane -> Glass pane; Blow vials from slag; Blow bottle from slag; Fire tile -> Ceramic tile. Vent port: Vent slag (discards it); and 3 more.
**Note:** Tagged waste; venting it is an option if the Kiln is not wanted.

## Ores and ice (hauled)

### Iron ore (`it_core_ore_iron`) — tier 1 · 2x2 · worth 1.5$
**What it is:** Red-brown rock off the ore haul, banded with rust.
**Function:** Smelter feed; two lumps make an iron bar.
**Chain:** `Comes from:` Haul inflow (the ore haul system); also sold at the Dock counter. No recipe makes it. `Goes into:` Smelter: Smelt iron -> Iron bar plus 2 Slag. Crusher: Crush iron ore -> Iron scrap plus Grit.

### Copper ore (`it_core_ore_copper`) — tier 1 · 2x2 · worth 2.5$
**What it is:** Green-crusted rock off the haul; smells of pennies when crushed.
**Function:** Smelter feed, and the raw input for circuit boards.
**Chain:** `Comes from:` Haul inflow; sold at the Dock counter. No recipe makes it. `Goes into:` Smelter: Smelt copper -> Copper bar plus Slag. Crusher: Crush copper ore. Fabricator (Circuit blueprints): Etch circuit boards -> Circuit board. Autofab: Etch circuit boards in bulk.

### Bauxite (`it_core_ore_light`) — tier 1 · 2x2 · worth 2.5$
**What it is:** Pitted red-brown ore, light for its size.
**Function:** The only source of fresh light metal, per its description.
**Chain:** `Comes from:` Haul inflow; sold at the Dock counter. No recipe makes it. `Goes into:` Smelter: Smelt bauxite -> Light-metal bar plus 2 Slag. Crusher: Crush bauxite -> Light scrap plus Grit.

### Ice block (`it_core_ice`) — tier 1 · 2x2 · worth 1.2$
**What it is:** A dirty block of comet ice, grey with dust; water and gas once melted.
**Function:** Water and gas source, via the Crusher or the Purifier.
**Chain:** `Comes from:` Haul inflow (the ice haul system); sold at the Dock counter. No recipe makes it. `Goes into:` Crusher: Crush ice -> 2 Greywater plus Gas bladder. Purifier: Purify ice -> 2 Water pouch plus Gas bladder; Melt ice -> Meltwater plus Gas bladder.

## Salvage lots (crushed or recycled)

### Mixed scrap (`it_core_scrap_mixed`) — tier 1 · 2x2 · worth 3$
**What it is:** A bagged lot of bent iron, plastic housings and a few lengths of wire.
**Function:** Crusher input; the crusher sorts it better than the recycler.
**Chain:** `Comes from:` Salvage inflow. Found at Works slag heap (0.5, 1 piece). No recipe makes it. `Goes into:` Crusher: Crush mixed scrap -> Iron scrap, Polymer flake, and Copper scrap (50% chance). Nothing else uses it.

### E-waste (`it_core_ewaste`) — tier 1 · 2x2 · worth 9$
**What it is:** A stack of dead boards and cracked screens.
**Function:** The route to rare dust and noble flakes, plus copper and polymer.
**Chain:** `Comes from:` Salvage inflow. Found at Dead scrubber bay (0.45), Core cableway (0.6), Sealed hatch row (0.5) and Junked terminals (0.6), 1-2 per find. No recipe makes it. `Goes into:` Crusher: Crush e-waste (Rare dust 30%, Noble flake 10%). Refinery: Refine e-waste (3 in, Rare dust 90%, Noble flake 30%); Refine e-waste in bulk (10 in, overnight).
**Note:** The description says it is worth more crushed than whole.

### Rags (`it_core_rags`) — tier 1 · 2x1 · worth 2$
**What it is:** A tied bundle of stained cloth off the spine bunks.
**Function:** Fibre for the Pulper and Loom; its market need is comfort.
**Chain:** `Comes from:` Salvage inflow. Found at Spine ducts (0.4, 1) and Dark bunks (0.7, 1-2). Also made by Your hands: Unravel rug <- Woven rug. `Goes into:` Crusher: Crush rags -> 2 Fibre lint. Pulper: Pulp rags -> 4 Paper. Loom: Weave rags -> 2 Cloth; Weave rug -> Woven rug. Your hands: Shred rags to padding -> 4 Padding; and 2 more (Pack cleaning kits among them).

### Duct junk (`it_core_duct_junk`) — tier 1 · 2x2 · worth 3$
**What it is:** A tangle of foil tape, fan housings and ducting pulled from the spine walls.
**Function:** Crusher input yielding light scrap, polymer flake and lint.
**Chain:** `Comes from:` Salvage inflow. Found at Spine ducts (0.5, 1). No recipe makes it. `Goes into:` Crusher: Crush duct junk (2 in) -> 2 Light scrap, Polymer flake, Fibre lint. Nothing else uses it.

### Hull offcuts (`it_core_hull_offcuts`) — tier 1 · 2x1 · worth 4$
**What it is:** Heavy plates and strips of hull alloy cut off during repairs and left on the dock.
**Function:** Crusher input that splits into iron and light metal.
**Chain:** `Comes from:` Salvage inflow. Found at Works slag heap (0.5, 1-2), Core cableway (0.4, 1) and Sealed hatch row (0.6, 1-2). No recipe makes it. `Goes into:` Crusher: Crush hull offcuts (2 in) -> 3 Iron scrap, 2 Light scrap. Nothing else uses it.
**Note:** The ledger notes it is left behind by dock repair crews (the ore haul's upkeep).

### Wire tangle (`it_core_wire_tangle`) — tier 1 · 2x1 · worth 4$
**What it is:** A knotted ball of half-stripped cable with a few cracked connectors.
**Function:** Crusher input that separates copper from insulation.
**Chain:** `Comes from:` Salvage inflow. Found at Spine ducts (0.3, 1) and Core cableway (0.7, 1-2). No recipe makes it. `Goes into:` Crusher: Crush wire tangle (2 in) -> 3 Copper scrap, Polymer flake. Nothing else uses it.

### Rubble (`it_core_rubble`) — tier 1 · 2x2 · worth 1$
**What it is:** A heavy bag of broken panel, concrete grit and old filter fill swept from the dock floor.
**Function:** Crushed for grit, iron flecks and carbon; or vented as waste.
**Chain:** `Comes from:` Salvage inflow. Found at Works slag heap (0.6, 1-2). No recipe makes it. `Goes into:` Crusher: Crush rubble (2 in) -> 4 Grit, Iron scrap, Carbon dust. Vent port: Vent rubble (3 in, discards).

### Spent filters (`it_core_filter_husks`) — tier 1 · 1x2 · worth 1.5$
**What it is:** Clogged cartridge husks from the scrubber bank, black inside.
**Function:** Crusher input giving carbon dust, lint and salt.
**Chain:** `Comes from:` Salvage inflow. Found at Spine ducts (0.4, 1), Dead scrubber bay (0.7, 1-2) and Flooded sump (0.4, 1-2). No recipe makes it. `Goes into:` Crusher: Crush spent filters (2 in) -> 2 Carbon dust, Fibre lint, Salt cake. Nothing else uses it.

### Salvage crate (`it_core_salvage_crate`) — tier 1 · 3x2 · worth 2$
**What it is:** A battered lidded crate from a clearance sale, packed with whatever a scavenger could not sell.
**Function:** A container whose contents are the point ("opening it is the point").
**Chain:** `Comes from:` Salvage inflow. Found at Works slag heap (weight 0.12, 1 piece) and Sealed hatch row (0.4, 1). No recipe makes it. `Goes into:` No recipe, order or upgrade in the ledger uses it.
**Note:** The ledger records no way to open it. Its composition is the empty shell (light metal 0.5, polymer 0.5), so the opening mechanic is not visible here.

## Fibre, polymer and biological feedstock

### Polymer flake (`it_core_polymer_flake`) — tier 1 · 1x1 · worth 1$
**What it is:** Grey chips of crushed plastic, bagged; warm when fresh.
**Function:** Extruder feedstock; it becomes sheet, tube, film, tubs and casing.
**Chain:** `Comes from:` Salvage inflow; found at Spine ducts (0.7, 1-3). Crusher: Crush mixed scrap, Crush e-waste, Crush duct junk, Crush wire tangle, Crush dead appliance; also Synthesiser: Synthesise polymer; and 6 more. `Goes into:` Extruder: Extrude polymer sheet, Extrude tube, Blow film, Press tubs. Workbench: Patch a spare part; Fold device housings; and 32 more.

### Fibre lint (`it_core_fibre_lint`) — tier 1 · 1x1 · worth 1$
**What it is:** A grey wad of lint and short fibre pulled from filters and bedding.
**Function:** Feedstock for paper, yarn and cloth. Its market need is comfort.
**Chain:** `Comes from:` Salvage inflow; found at Spine ducts (0.6, 1-2). Crusher: Crush rags (2 per rag), Crush duct junk, Crush spent filters. `Goes into:` Pulper: Pulp lint -> Paper. Workbench: Spin yarn -> Spun yarn. Loom: Weave lint -> Cloth; Stuff cushion -> Cushion (Garments). Your hands: Assemble rebreather; Cut tester strips; and 4 more.

### Biomass paste (`it_core_biomass_paste`) — tier 1 · 1x1 · worth 0.5$
**What it is:** A grey brick of pressed paste, cold and faintly sweet; what the vats are fed.
**Function:** Food feedstock for the Vat and Industrial vat. Its market need is food.
**Chain:** `Comes from:` Crate inflow; not found at any scavenge site. Digester (overnight): Digest sludge to paste (3 per 4 sludge), brine, gas, and Digest a full tank. Bioreactor: Culture sludge; Culture brine and gas; and 6 more. `Goes into:` Vat (Vat staples): Press ration bars, Squeeze paste tubes, Press protein blocks, Refine sugar. Industrial vat: batch versions of the same. Galley: Boil stock cubes; and 27 more.

### Sludge (`it_core_sludge`) — tier 1 · 1x2 · worth 0$
**What it is:** A sealed jug of brown slurry, what remains of other things.
**Function:** Digester and Bioreactor input, or vent-port waste. The ledger says the recycler's 10% ends up here.
**Chain:** `Comes from:` Salvage inflow. Workbench by-product of Rinse water filter and Rinse air cartridge. Not found at any scavenge site. `Goes into:` Digester: Digest sludge to paste, brine, gas or water, and Digest a full tank (8 in); Bioreactor: Culture sludge; Vent port: Vent sludge; and 6 more.
**Note:** Worth 0; tagged waste.

### Greywater (`it_core_greywater`) — tier 1 · 1x2 · worth 0.4$
**What it is:** A sealed flask of cloudy water; not drinkable until purified.
**Function:** Feedstock for the purifier and hydroponics; also coolant and the Bioreactor. Its market need is water.
**Chain:** `Comes from:` Haul inflow (meltwater from the ice haul); sold at the Dock counter. Crusher: Crush ice (2 per block). Digester: Digest sludge to water, brine, gas, and Digest a full tank; plus Hydro tray growing recipes; and 10 more. `Goes into:` Hydro tray (Hydro greens): Grow greens, Grow beans, Grow potatoes. Hydro rack: Rack greens. Bioreactor: Culture sludge. Chem bench: Brew coolant; Vent port: Vent foul water; and 9 more.

### Salt cake (`it_core_salt_cake`) — tier 1 · 1x1 · worth 0.4$
**What it is:** A pale crust of mineral salt scraped off the reclaim tanks and pressed into a cake.
**Function:** Feedstock for scrubbers and brine; also a food and saline ingredient. Its market need is water.
**Chain:** `Comes from:` Salvage inflow. Found at Dead scrubber bay (0.6, 1-3) and Flooded sump (0.5, 1-3). Crusher: Crush spent filters. Digester: Digest sludge to paste, brine, water, and Digest a full tank; plus Hydro tray: Grow greens (46% chance); and 9 more. `Goes into:` Vat: Press protein blocks; Industrial vat: Batch protein blocks; Bioreactor: Culture brine and gas; Galley: Boil stock cubes -> Stock cube; Your hands: Mix saline; Vent port: Vent salt cake; and 10 more.

### Gas bladder (`it_core_gas_bladder`) — tier 1 · 1x2 · worth 0.4$
**What it is:** A tight, flat bladder of mixed gas strapped to a carry-frame; do not puncture.
**Function:** Feedstock for the electrolyser, scrubbers and polymer synthesis; fills gas canisters. Its market need is air.
**Chain:** `Comes from:` Haul inflow; sold at the Dock counter. Crusher: Crush ice. Purifier: Purify ice, Melt ice. Electrolyser: Split water (2 pouches -> 2 bladders). Digester: Digest sludge to gas, and Digest a full tank; plus Scrubber: Scrub foul air; and 5 more. `Goes into:` Synthesiser: Synthesise polymer and Synthesise from dregs. Bioreactor: Culture brine and gas. Your hands: Fill oxygen canister; Fill hydrogen canister. Vent port: Vent gas; and 5 more.

## Chemicals, power and rare materials (tier 2 unless noted)

### Reagent dregs (`it_core_reagent_dregs`) — tier 1 · 1x1 · worth 1.5$
**What it is:** Dark mixed chemical dregs in a stoppered vial; a chemist can work with it.
**Function:** Chemistry feedstock for the Chem bench, cell chemistry and polymer synthesis. Its market need is medicine.
**Chain:** `Comes from:` Salvage inflow. Found at Dead scrubber bay (0.5, 1-2) and Flooded sump (0.6, 1-2). No recipe makes it. `Goes into:` Cell press: Press small cells, cells, heavy cells (Cell chemistry). Chem bench: Mix lighter fluid; Brew coolant. Synthesiser: Synthesise from dregs. Fabricator: Mould lighters; and 18 more.

### Lithium salt (`it_core_lithium_salt`) — tier 2 · 1x1 · worth 6$
**What it is:** White caking salt in a screw-top tub that holds a charge better than anything else.
**Function:** Cell feedstock; also an ingredient for anti-radiation tabs. Its market need is power.
**Chain:** `Comes from:` Crate inflow (phase 2); not found at any scavenge site. Crusher: Crush cell husks (1 per 2 husks). `Goes into:` Cell press (Cell chemistry): Press small cells, Press cells, Press heavy cells, plus overnight versions of small cells and cells. Synthesiser: Synthesise anti-radiation tabs. That is 7 recipes in all.

### Dead cell husk (`it_core_cell_husk`) — tier 2 · 1x1 · worth 5$
**What it is:** A drained cell casing split down the seam, with a little lithium still inside.
**Function:** Crusher input for lithium salt.
**Chain:** `Comes from:` Salvage inflow (phase 2). Found at Sealed hatch row (0.5, 1-2). No recipe makes it. `Goes into:` Crusher: Crush cell husks (2 in) -> Light scrap, Lithium salt, Carbon dust. Nothing else uses it.
**Note:** Dock chargers throw these out.

### Dead appliance (`it_core_dead_appliance`) — tier 2 · 3x2 · worth 7$
**What it is:** A black, heavy kettle, fan or heater plate cleared from vacated bunks.
**Function:** Crusher input yielding iron, copper, polymer and a trace of rare dust.
**Chain:** `Comes from:` Salvage inflow (phase 2). Found at Sealed hatch row (0.5, 1). No recipe makes it. `Goes into:` Crusher: Crush dead appliance (2 in) -> 3 Iron scrap, 2 Copper scrap, 2 Polymer flake, and Rare dust (20% chance). Nothing else uses it.

### Rare dust (`it_core_rare_dust`) — tier 2 · 1x1 · worth 12$
**What it is:** Grey, greasy dust that clings to the fingers; the magnets and chips are made of it.
**Function:** Tech feedstock for chips, magnets, sensors and circuit boards.
**Chain:** `Comes from:` Inflow is listed as seller (phase 2), but no shop in the ledger sells it. Crusher: Crush e-waste (30%), Crush dead appliance (20%). Refinery: Refine e-waste (90%), Refine e-waste in bulk, Strip circuit boards, Recover chip metals. `Goes into:` Refinery: Cast rare-earth ingots. Fabricator: Forge strikers; Etch circuit boards; Build sensors. Synthesiser: Synthesise antivirals; Synthesise regrowth gel; and 6 more.

### Noble flake (`it_core_noble_flake`) — tier 2 · 1x1 · worth 25$
**What it is:** A pinch of gold-bright flakes in a sealed foil twist that never tarnishes.
**Function:** Feedstock for electrical contacts and jewellery. Its market need is luxury.
**Chain:** `Comes from:` Inflow is listed as seller (phase 2), but no shop in the ledger sells it. Crusher: Crush e-waste (10%). Refinery: Refine e-waste (30%), Refine e-waste in bulk, Recover chip metals (50%). `Goes into:` Smelter: Cast noble bar. Jeweller's bench: Cast signet, Draw chain, Set locket. 3D printer: Print gilt ornament. Synthesiser: Print gene patches; and 2 more.
