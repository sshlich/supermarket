# Fabrication goods: reader's guide

These 46 items are the output of the station's metalworking, glass, polymer and tooling chains. Almost all of them are *made*, not found: only a few tools and glass vials turn up at scavenge sites, and a handful of tools are sold at Works hardware. They sit in the middle of the game's loop (scrap -> crusher/recycler -> materials -> machines -> goods -> sold).

- **Bars and stock** (iron, copper, light-metal, noble, rare-earth; sheets, wire, polymer sheet/tube/film) are smelted, cast, rolled or extruded from ore, scrap, slag, grit or polymer flake.
- **Parts** (fasteners, hinges, springs, gears, bearings, valves, housings) are stamped or cut from stock at the Fabricator, Precision fabricator or Autofab, and most of them feed other recipes, especially machine-building.
- **Containers** (bottles, jars, tins, tubs, crates) hold food, drink and medical goods made elsewhere.
- **Tools** (knife, wrench, pliers, cutters, loupe, torque driver, multitool) are goods that wear out and are wanted by orders.
- Most recipes need blueprint discs (Hardware, Spares, Hand tool, Precision, Heavy fab and so on) and the matching machine. Item tiers run 1 to 4; worth rises from 1$ for a vial to 180$ for a hull plate.
- Orders are named below by their id in plain words, with the requesting group in brackets.

## Iron and steel stock

### Iron bar (`it_fab_bar_iron`) — tier 1 · 3x2 · worth 8$
**What it is:** A grey bar cast in a mould, smelted from ore or scrap.
**Function:** The basic input for nearly every metal part and tool; also sells toward the parts need.
**Chain:** `Comes from:` Smelter, "Smelt iron" (2 iron ore -> 1 bar + 2 slag) or "Melt iron scrap" (2 iron scrap -> 1 bar). `Goes into:` Workbench "Roll steel sheet" (-> 2 steel sheets); Fabricator, Hardware blueprints: fasteners, tin cans, pipe, hinges; Fabricator, Spares blueprints: brackets, springs; and 22 more recipes.
**Note:** The ledger lists no shops, scavenge sites or orders for it; it is purely an intermediate.

### Steel sheet (`it_fab_sheet`) — tier 1 · 2x2 · worth 4$
**What it is:** A thin rolled sheet of steel with sharp edges.
**Function:** Intermediate stock for pipes, cans, rivets, tools and machines.
**Chain:** `Comes from:` Workbench "Roll steel sheet" (1 iron bar -> 2 sheets) or "Roll sheet from scrap" (2 iron scrap -> 2 sheets). `Goes into:` Workbench: pipe, tin cans, fasteners (rivets); Fabricator "Forge kitchen knives"; Precision fabricator "Machine valves" and "Build multitool"; and 5 more.

### Pipe (`it_fab_pipe`) — tier 2 · 1x3 · worth 10$
**What it is:** A length of steel pipe threaded at both ends.
**Function:** Structural part for water, gas and coolant lines; used in machine builds and wanted by an order.
**Chain:** `Comes from:` Fabricator "Thread pipe" (1 iron bar -> 2 pipes, Hardware blueprints); Workbench "Curl pipe from sheet" (1 steel sheet -> 1 pipe, instant). `Goes into:` Your hands "Braze regulator" (with a valve -> gas regulator); Fabricator "Build purifier"; Precision fabricator "Build extruder", "Build scrubber", "Build chiller". Wanted by the Union vat repair order (x2).

### Structural beam (`it_fab_beam`) — tier 4 · 4x1 · worth 80$
**What it is:** A rolled I-beam, four hands long, painted deck-grey.
**Function:** Heavy structural stock, wanted by the Company contract order and used in one machine build.
**Chain:** `Comes from:` Autofab, Heavy fab blueprints, "Roll structural beam" (2 iron bars -> 1 beam). `Goes into:` Autofab "Build loader arms" (Automata blueprints). Wanted by the Company contract order (x2).

### Hull plate (`it_fab_hull_plate`) — tier 4 · 4x3 · worth 180$
**What it is:** A layered steel and light-metal plate with stencils on one edge, big enough to span a breach.
**Function:** The most valuable item in this group; an end product wanted by an order.
**Chain:** `Comes from:` Autofab, Heavy fab blueprints, "Assemble hull plate" (2 iron bars + 1 light-metal bar). `Goes into:` no recipe uses it. Wanted by the Company contract order (x1).

## Copper, light metal and rare metals

### Copper bar (`it_fab_bar_copper`) — tier 2 · 3x2 · worth 16$
**What it is:** A dull red bar with a green bloom at the ends.
**Function:** Starting stock for wire, motors and boards.
**Chain:** `Comes from:` Smelter, "Smelt copper" (2 copper ore -> 1 bar + 2 slag) or "Melt copper scrap" (2 scrap -> 1 bar). `Goes into:` Workbench "Draw copper wire"; Autofab "Batch valves"; Fabricator "Build charger"; Fabricator "Wind motors" (with an iron bar -> 2 motors).

### Copper wire (`it_fab_wire`) — tier 1 · 1x1 · worth 4$
**What it is:** A coil of bare copper a few metres long.
**Function:** Intermediate for valves, fuses, rings and many machine builds.
**Chain:** `Comes from:` Workbench "Draw copper wire" (1 copper bar -> 4 wire) or "Draw wire from scrap" (2 copper scrap -> 4 wire). `Goes into:` Precision fabricator "Machine valves"; Jeweller's bench "Set copper ring"; Workbench "Pack fuses"; builds of the smelter, extruder, kiln, annealer; and 12 more.

### Light-metal bar (`it_fab_bar_light`) — tier 2 · 3x2 · worth 16$
**What it is:** A pale, frosted bar that is light for its size.
**Function:** Stock for device housings, ring plate and hull plate.
**Chain:** `Comes from:` Smelter, "Smelt bauxite" (2 bauxite -> 1 bar + 2 slag) or "Melt light scrap" (2 light scrap -> 1 bar). `Goes into:` Workbench "Roll light-metal sheet"; housing recipes at the Fabricator, 3D printer and Autofab; Autofab "Assemble hull plate" and "Build annealer".

### Light-metal sheet (`it_fab_light_sheet`) — tier 2 · 2x2 · worth 8$
**What it is:** A pale sheet soft enough to cut with shears.
**Function:** Intermediate for housings and light devices.
**Chain:** `Comes from:` Workbench "Roll light-metal sheet" (1 light-metal bar -> 2 sheets). `Goes into:` Workbench "Fold device housings"; Precision fabricator "Build multitool"; Fabricator "Mount work lights"; Assembler "Assemble fans".

### Noble bar (`it_fab_bar_noble`) — tier 3 · 2x1 · worth 100$
**What it is:** A small, heavy bar, warm to the hand, counted one by one by jewellers and chip lines.
**Function:** High-value stock; one computer recipe uses it and one order wants it.
**Chain:** `Comes from:` Smelter, "Cast noble bar" (2 noble flake -> 2 bars). `Goes into:` Assembler "Assemble desk units" (Computer blueprints). Wanted by the Fence stolen-goods order (x1).

### Rare-earth ingot (`it_fab_rare_ingot`) — tier 4 · 2x1 · worth 48$
**What it is:** A dark, brittle, heavy ingot; magnets, chips and lamps start here.
**Function:** Input for service drones.
**Chain:** `Comes from:` Refinery (refinery profiles), "Cast rare-earth ingots" (3 rare dust -> 3 ingots). `Goes into:` Autofab "Build service drones" (Automata blueprints). No orders want it.

## Fasteners and small parts

### Fasteners (`it_fab_fasteners`) — tier 1 · 1x1 · worth 6$
**What it is:** A tin of bolts and rivets.
**Function:** General joining part used in tools, garments, kits, filters and machine builds.
**Chain:** `Comes from:` Fabricator "Stamp fasteners" (1 iron bar -> 4); Workbench "Cut rivets from sheet" (1 steel sheet -> 2); Your hands "Unpick overalls" (spine overalls -> 2 cloth + 2 fasteners). `Goes into:` Workbench "Mount a loupe", "Assemble jam kits"; Fabricator "Forge kitchen knives", "Fabricate water filters", "Build workbench"; Loom "Sew overalls"; and 4 more.

### Hinge (`it_fab_hinge`) — tier 1 · 1x1 · worth 6$
**What it is:** Two leaves and a pin, for doors, lids and cabinets.
**Function:** A part sold on the parts need; no recipe or order uses it.
**Chain:** `Comes from:` Fabricator "Forge hinges" (1 iron bar -> 4, Hardware blueprints). `Goes into:` nothing in the ledger.
**Note:** Dead end for crafting; only value is its sale price.

### Bracket (`it_fab_bracket`) — tier 1 · 2x1 · worth 7$
**What it is:** An L of bent steel with two slots, for fixing shelves, pipes and cables to a wall.
**Function:** Structural part sold on the parts need.
**Chain:** `Comes from:` Fabricator "Press brackets" (1 iron bar -> 4, Spares blueprints). `Goes into:` nothing in the ledger.
**Note:** Dead end for crafting.

### Spring (`it_fab_spring`) — tier 2 · 1x1 · worth 6$
**What it is:** Coiled wire in a short cylinder.
**Function:** Machine part for precision goods and relays.
**Chain:** `Comes from:` Fabricator "Coil springs" (1 iron bar -> 4, Spares blueprints). `Goes into:` Precision fabricator "Match precision spare" and "Build torque driver"; Fabricator "Wind relays" (4 copper wire + 2 springs + polymer flake -> 4 relays).

### Gear (`it_fab_gear`) — tier 2 · 1x1 · worth 9$
**What it is:** A cut steel gear with a keyed bore.
**Function:** Machine part for precision goods and clocks.
**Chain:** `Comes from:` Fabricator "Cut gears" (1 iron bar -> 4, Spares blueprints). `Goes into:` Precision fabricator "Match precision spare" and "Build torque driver"; Assembler "Assemble wall clocks".

### Bearing (`it_fab_bearing`) — tier 2 · 1x1 · worth 10$
**What it is:** A sealed ball bearing in a greased race.
**Function:** Machine part for precision goods, machine builds and several repair orders.
**Chain:** `Comes from:` Precision fabricator "Grind bearings" (1 iron bar -> 4); Autofab "Batch bearings" (4 iron bars -> 16, takes "nights"). `Goes into:` Precision fabricator "Match precision spare", "Build torque driver", "Build fabricator"; Fabricator "Build crusher"; Autofab "Build precision fabricator", "Build loader arms". Wanted by the Hauler crane repair order (x3), Hauler ice cutters order (x2) and Fitter foundry repair order (x3).

### Seal (`it_fab_seal`) — tier 2 · 1x1 · worth 12$
**What it is:** A ring of grey polymer that keeps a line from weeping.
**Function:** Machine part; only feeds precision spares.
**Chain:** `Comes from:` Workbench "Cut seals from film" (2 polymer film -> 1); Precision fabricator "Mould seals" (2 polymer tubes -> 2). `Goes into:` Precision fabricator "Match precision spare" only.

### Valve (`it_fab_valve`) — tier 2 · 1x1 · worth 20$
**What it is:** A brass-seated valve with a hand wheel, for water and gas lines.
**Function:** Machine part for purifier, scrubber and chiller builds, and wanted by repair orders.
**Chain:** `Comes from:` Precision fabricator "Machine valves" (1 steel sheet + 2 copper wire -> 2); Autofab "Batch valves" (2 steel sheets + 1 copper bar -> 4, takes "nights"). `Goes into:` Your hands "Braze regulator"; Fabricator "Build purifier"; Precision fabricator "Build scrubber" and "Build chiller". Wanted by the Engineer reactor repair order (x2), Union vat repair order (x2) and Council farm repair order (x2).

### Spare part (`it_fab_spare_part`) — tier 2 · 2x1 · worth 20$
**What it is:** The generic cast body, bush or gasket the station runs on.
**Function:** Consumed by repair actions and wanted by repair orders.
**Chain:** `Comes from:` Workbench "Rework patched spares" (10 patched spares + 2 iron scrap + 3 copper scrap -> 10); Fabricator "Fabricate spare parts" (5 iron bars + 3 copper scrap + 2 polymer flake -> 10); Autofab "Batch spare parts" (same inputs, takes "nights"). `Goes into:` Workbench "Swap worn parts" (with lubricant) and "Repair goods", which are actions rather than product recipes. Wanted by the Hauler crane repair order (x1) and Engineer reactor repair order (x2).

### Patched spare (`it_fab_spare_patched`) — tier 1 · 2x1 · worth 6$
**What it is:** A spare welded from two broken ones.
**Function:** A cheap scrap-based route to spare parts, and a repair input.
**Chain:** `Comes from:` Workbench "Patch a spare part" (4 iron scrap + 1 polymer flake -> 5). `Goes into:` Workbench "Rework patched spares" (10 -> 10 spare parts); Workbench "Refurbish a tool" (with lubricant, a modify action).

### Precision spare (`it_fab_spare_precision`) — tier 3 · 2x1 · worth 80$
**What it is:** A matched spring, gear, bearing and seal in a sealed sleeve, ring-grade.
**Function:** A high-value end product; no consumer or order in the ledger.
**Chain:** `Comes from:` Precision fabricator "Match precision spare" (1 each of spring, gear, bearing, seal). `Goes into:` nothing in the ledger.
**Note:** Tagged ring-grade; sale only.

### Device housing (`it_fab_housing`) — tier 2 · 2x2 · worth 30$
**What it is:** A pale metal shell with screw posts and a polymer lid.
**Function:** Case for devices, so a key input to machine and gadget builds.
**Chain:** `Comes from:` four routes: Workbench "Fold device housings" (2 light-metal sheets + polymer flake -> 2); Fabricator "Fabricate housings"; 3D printer "Print housings"; Autofab "Batch housings" (-> 4, takes "nights"). `Goes into:` Fabricator "Press zippo cases", "Build oil lamp", "Build charger", "Build slip printer", "Build scanner", "Build radio" and 6 more. Wanted by the Clerk store repair order (x1).

## Printed parts (3D printer)

### Printed clip (`it_fab_print_clip`) — tier 2 · 1x1 · worth 2$
**What it is:** A polymer snap clip for cables, tubes and panels.
**Function:** Cheap fastener; sold on value only.
**Chain:** `Comes from:` 3D printer, Fitting models, "Print clips" (1 polymer flake -> 4). `Goes into:` nothing in the ledger.

### Printed bracket (`it_fab_print_bracket`) — tier 2 · 2x1 · worth 6$
**What it is:** A light polymer bracket with a metal core.
**Function:** Structural part, a polymer alternative to the pressed bracket.
**Chain:** `Comes from:` 3D printer "Print brackets" (2 polymer flake + 1 light scrap -> 4). `Goes into:` nothing in the ledger.

### Printed fitting (`it_fab_print_fitting`) — tier 2 · 1x1 · worth 9$
**What it is:** A printed pipe elbow or tee with no seam.
**Function:** Pipe-run part, sold on value only.
**Chain:** `Comes from:` 3D printer "Print pipe fittings" (1 polymer flake + 1 light scrap -> 2). `Goes into:` nothing in the ledger.

## Polymer stock

### Polymer sheet (`it_fab_polymer_sheet`) — tier 1 · 2x2 · worth 4$
**What it is:** Flat grey polymer, warm from the extruder, for housings, tubs and patches.
**Function:** Intermediate for housings, crates, garments, filters and sculptures.
**Chain:** `Comes from:` Extruder "Extrude polymer sheet" (1 polymer flake -> 1). `Goes into:` Fabricator "Mould crate" and "Fabricate housings"; Autofab "Batch housings"; Your hands "Assemble rebreather"; Loom "Tailor ring coat"; 3D printer "Print sculpture"; and 11 more. Wanted by the Household solar repair order (x2).

### Polymer tube (`it_fab_polymer_tube`) — tier 1 · 1x2 · worth 2$
**What it is:** A flexible grey tube a metre long, for drips, drains and cable runs.
**Function:** Intermediate for seals and several tools.
**Chain:** `Comes from:` Extruder "Extrude tube" (1 flake -> 2). `Goes into:` Precision fabricator "Mould seals", "Build torque driver", "Build multitool"; Your hands "Hang saline drip"; Fabricator "Make torches".

### Polymer film (`it_fab_polymer_film`) — tier 1 · 2x2 · worth 1$
**What it is:** Thin clear film in a roll, for wrapping and sealing.
**Function:** Only used to cut seals.
**Chain:** `Comes from:` Extruder "Blow film" (1 flake -> 4). `Goes into:` Workbench "Cut seals from film" only.

## Glass and ceramic

### Glass pane (`it_fab_glass_pane`) — tier 1 · 2x2 · worth 2$
**What it is:** Slightly green kiln glass with a bubble or two; cuts to a lens or window.
**Function:** Intermediate for lenses, screens, a smelter and clocks.
**Chain:** `Comes from:` Kiln "Melt slag to pane" (2 slag) or "Melt grit to pane" (2 grit), 1 pane each. `Goes into:` Kiln "Slump lenses"; Fabricator "Build smelter", "Blow screens" (5 panes -> 10 screens); Assembler "Assemble wall clocks". Wanted by the Council farm repair order (x2).

### Glass lens (`it_fab_lens`) — tier 2 · 1x1 · worth 6$
**What it is:** A small ground disc, clear at the middle.
**Function:** Input for loupes.
**Chain:** `Comes from:` Kiln "Slump lenses" (1 pane -> 2). `Goes into:` Workbench "Mount a loupe" only.

### Glass vial (`it_fab_vial`) — tier 1 · 1x1 · worth 1$
**What it is:** An empty stoppered glass tube that the clinic and the cellar both fill.
**Function:** Small container consumed by food, perfume, ethanol and lamp recipes.
**Chain:** `Comes from:` Kiln "Blow vials from slag" or "from grit" (1 -> 2 vials); scavenged at the Clinic back room (about 50% weight, 1-2 per find). `Goes into:` Industrial vat "Set fruit jelly"; Chem bench "Blend scent", "Grind cosmetic", "Distil ethanol"; Still "Distil sugar"; Fabricator "Build oil lamp"; and 8 more.

### Bottle (`it_fab_bottle`) — tier 1 · 1x3 · worth 1$
**What it is:** Clear glass with a cork, empty.
**Function:** Container for water, wine and spirits.
**Chain:** `Comes from:` Kiln "Blow bottle from slag" or "from grit" (1 -> 1); Your hands "Pour out bottle" (bottled water -> bottle + 2 distilled water). `Goes into:` Your hands "Bottle water"; Still "Bottle wine", "Distil spirit", "Run moonshine".
**Note:** Bottled water can be emptied back into a bottle, so it is a reusable container.

### Glass jar (`it_fab_jar`) — tier 1 · 1x2 · worth 2$
**What it is:** A wide-mouthed jar with a screw neck, for preserves or tablets.
**Function:** Container, sold on the comfort need.
**Chain:** `Comes from:` Kiln "Press jars" (3 grit -> 2). `Goes into:` nothing in the ledger.

### Ceramic tile (`it_fab_tile`) — tier 1 · 2x2 · worth 3$
**What it is:** A fired grey tile glazed on one side, for floors, benches and furnace walls.
**Function:** Comfort-need good.
**Chain:** `Comes from:` Kiln "Fire tile" (2 slag -> 1). `Goes into:` nothing in the ledger.

### Crucible liner (`it_fab_crucible_liner`) — tier 1 · 2x2 · worth 4$
**What it is:** A fired ceramic cup with a carbon skin that takes the heat so the smelter does not.
**Function:** A wearing consumable for the smelter.
**Chain:** `Comes from:` Kiln "Fire crucible liners" (4 slag + 1 carbon dust -> 2). `Goes into:` no recipe lists it as an input.
**Note:** Tagged consumable and "Wears"; the ledger does not show how the smelter uses it, so that mechanic is not documented here.

## Containers and packaging

### Tin can (`it_fab_tin`) — tier 1 · 1x1 · worth 2$
**What it is:** An empty can and lid, rolled and crimped.
**Function:** Packaging for the Galley's canned foods.
**Chain:** `Comes from:` Workbench "Fold tin cans" (1 steel sheet -> 2, instant); Fabricator "Stamp tin cans" (1 iron bar -> 4); Your hands "Open tinned beans", "Open tinned stew", "Open tinned apple" (returns the can). `Goes into:` Galley "Can beans", "Can stew", "Can apples".
**Note:** Reusable loop: opening a tinned food returns the can.

### Polymer tub (`it_fab_tub`) — tier 1 · 2x2 · worth 4$
**What it is:** A squat tub with a snap lid, for paste, salve or screws.
**Function:** Medical packaging.
**Chain:** `Comes from:` Extruder "Press tubs" (1 flake -> 2); Your hands "Unpack first-aid kit" and "Unpack wound tub" (returns the tub with bandages and antiseptic). `Goes into:` Your hands "Pack first-aid kit", "Pack wound tub", "Pack burn tub".

### Polymer crate (`it_fab_crate`) — tier 2 · 3x2 · worth 12$
**What it is:** A ribbed polymer crate with handholds that stacks and rinses clean.
**Function:** Shipping container; wanted by an order and used for ward packs.
**Chain:** `Comes from:` Extruder "Press crate" (2 flake -> 1); Fabricator "Mould crate" (2 polymer sheets -> 1). `Goes into:` Your hands "Pack ward crate" (with painkiller and antibiotic blisters -> ward pack). Wanted by the Carrier boxes order (x2).

## Hand tools

### Kitchen knife (`it_fab_knife`) — tier 1 · 1x3 · worth 8$
**What it is:** Kitchen steel in a polymer grip; cuts cheese, salami, bread and sealed boxes.
**Function:** A wearing tool; wanted by an order.
**Chain:** `Comes from:` Fabricator "Forge kitchen knives" (2 steel sheets + fasteners + polymer flake -> 5, Hand tool blueprints). `Goes into:` Wanted by the Scavenger tools order (x1).
**Note:** Wears.

### Pliers (`it_fab_pliers`) — tier 1 · 1x2 · worth 12$
**What it is:** Flat jaws, a wire cutter and polymer grips.
**Function:** A wearing tool; wanted by an order.
**Chain:** `Comes from:` Fabricator "Forge pliers" (2 iron bars + 1 flake -> 5). `Goes into:` Wanted by the Scavenger tools order (x1).
**Note:** Wears.

### Wrench (`it_fab_wrench`) — tier 1 · 1x2 · worth 12$
**What it is:** A forged jaw on a long arm; clears jams and fits parts.
**Function:** A wearing tool wanted by several orders.
**Chain:** `Comes from:` Fabricator "Forge wrenches" (1 iron bar -> 2); bought at Works hardware (price x1.1); found as a bonus tool at the Works slag heap, and used as a gate item at the Core cableway. `Goes into:` Wanted by the Hauler ice cutters order (x2), Fitter tools order (x2), Fitter foundry repair order (x1).
**Note:** Wears.

### Cutters (`it_fab_cutter`) — tier 2 · 1x3 · worth 20$
**What it is:** Long-handled shears with a compound hinge, for bolts, rivets and strip.
**Function:** A wearing tool, apparently a gate-opening item.
**Chain:** `Comes from:` Fabricator "Forge cutters" (1 iron bar + 1 flake -> 2); bought at Works hardware (x1.2); listed as a gate item at the Sealed hatch row site. `Goes into:` no recipe or order.
**Note:** Wears.

### Loupe (`it_fab_loupe`) — tier 2 · 1x1 · worth 14$
**What it is:** A ground lens in a steel collar on a short stem; reads chip pins and flaws in a bar.
**Function:** A wearing inspection tool.
**Chain:** `Comes from:` Workbench "Mount a loupe" (1 glass lens + 1 fasteners); bought at Works hardware (x1.1); found as a bonus tool at the Clinic back room. `Goes into:` no recipe or order.
**Note:** Wears.

### Torque driver (`it_fab_torque_driver`) — tier 3 · 1x2 · worth 90$
**What it is:** A clicking driver set to a number on its collar.
**Function:** High-end ring-grade tool; no consumer in the ledger.
**Chain:** `Comes from:` Precision fabricator "Build torque driver" (spring + gear + bearing + polymer tube). `Goes into:` nothing in the ledger.
**Note:** Wears; tagged ring-grade.

### Multitool (`it_fab_multitool`) — tier 3 · 1x2 · worth 85$
**What it is:** A fold-out steel body with jaws, blade, driver and file; a fitter keeps it on a lanyard.
**Function:** High-end tool; no consumer in the ledger.
**Chain:** `Comes from:` Precision fabricator "Build multitool" (steel sheet + light-metal sheet + polymer tube). `Goes into:` nothing in the ledger.
**Note:** Wears.
