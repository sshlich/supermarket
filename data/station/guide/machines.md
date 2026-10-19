# Machines: a reader's guide

Machines are the verbs of the station loop. Matter comes in through scrap, crates and hauls, a machine turns it into something worth more or something the next machine can use, and the result is sold, shipped on an order or fed back in. A job costs cell charge (the machine's fuel, refilled at the Charger for credits) and, unless it runs overnight, a point of your daily energy. Hand work is instant and free; everything else is either a daytime `job` or a slow `nights` run that holds the machine till morning. Three kinds exist: **produce** (inputs to outputs), **modify** (change an item that already exists: seal, label, age, refurbish) and **do** (scan, vent, print, compute, clear a jam).

Nearly every machine arrives as a credit-priced crate upgrade gated by the game's phase, and many bigger machines are also buildable from recipes. Costs climb about 4x per phase: phase 1 (Scraps) is 30-150 credit gear to turn scrap into bars, water and power; phase 2 (Trade) adds the digester, vat, fabricator, kiln, vent and food/medicine lines, with vents and digesters keeping the matter loop closed; phase 3 (Workshop) brings precision fabrication, assemblers, cell presses and the synthesiser (a few cost 14,000-28,000 and some need a lower machine owned); phase 4 (Concern) holds the endgame upgrades (Refinery, Autofab, Mainframe, costs up to 380,000). Most machine upgrades chain: a base machine upgrades to a bigger one, and some recipes need a disc or blueprint in the machine's tray.

Counts below are recipes that run on each machine; the sections follow in phase then kind order. Recipe lists show the highest-value outputs first and are samples, not complete.

| Phase | Kind | Machines |
|---|---|---|
| phase 1 | produce | Your hands (63), Smelter (8), Recycler (0), Crusher (15), Purifier (5), Hydro tray (7), Slip printer (2) |
| phase 1 | modify | Workbench (33), Box sealer (3) |
| phase 1 | do | Charger (0), Wired terminal (4), Modem (0), Scanner (3), Radio (0) |
| phase 2 | produce | Digester (5), Vat (13), Fabricator (44), Extruder (5), Kiln (12), Electrolyser (1), Scrubber (4), Algae tank (5), Still (8), Chem bench (19), Pill press (5), Loom (14), Pulper (3), Galley (11), Document printer (6), Disc copier (0) |
| phase 2 | modify | Labeller (3) |
| phase 2 | do | Chiller (2), Vent port (6) |
| phase 3 | produce | Hydro rack (8), Industrial vat (9), Precision fabricator (11), 3D printer (8), Assembler (16), Cell press (6), Synthesiser (9), Jeweller's bench (5), Banner printer (2) |
| phase 3 | modify | Cellar (5), Annealer (2) |
| phase 3 | do | Broadcaster (0), Workstation (1) |
| phase 4 | produce | Autofab (13), Bioreactor (6), Refinery (5) |
| phase 4 | do | Mainframe (1) |

### Your hands (`mach_hands`) — phase 1 · produce · 1x1
**What it is:** Two hands and a bench of habit. Cutting, stacking, filling, packing: instant, no cells, no energy.
**Function:** job types: job. Base cost 0 cell / 0 energy per job; recipes cost 0 cells (cell charge) and 0 energy; time: instant x63. Can suffer: Tired, Sore.
**Chain:** `Gets you:` always owned (virtual). `Takes in -> makes:` Polymer crate, 2 Painkiller blister, 2 Antibiotic blister -> Ward pack; Polymer tub, 2 Burn gel, 2 Burn tab blister -> Burn pack; Blister card, 6 Antiviral -> Antiviral blister; Blister card, 6 Anti-radiation tab -> Anti-rad blister; Cheese wheel -> 8 Cheese wedge; and 58 more. Discs: none needed. `Leads to:` no further machine.
**Note:** Virtual: not a thing, always owned. Hand recipes are instant, 0 energy, 0 cells.

### Smelter (`mach_smelter`) — phase 1 · produce · 3x4
**What it is:** The old cast-iron furnace, its firebox gutted for a cell rack. Two ore in, one bar out.
**Function:** job types: job. Base cost 1 cell / 1 energy per job; recipes cost 0-2 cells (cell charge) and 1 energy; time: job x8; recipe risks: Hot. Can suffer: Hot, Jammed, Unpowered, Worn, Dusty. Wears through Lubricant, Coolant.
**Chain:** `Gets you:` upgrade Smelter crate (40 credits; requires Scraps phase; crate); buildable: Build smelter. `Takes in -> makes:` 2 Noble flake -> 2 Noble bar; 2 Copper ore -> Copper bar, 2 Slag; 2 Bauxite -> Light-metal bar, 2 Slag; 2 Iron ore -> Iron bar, 2 Slag; Rake the crucible: clears Jammed, Hot; and 3 more. Discs: none needed. `Leads to:` upgrades to Refinery.
**Note:** Keeps the furnace footprint 3x4 and its ore-in crucible. Composition is iron and firebrick (silicate).

### Recycler (`mach_recycler`) — phase 1 · produce · 3x3
**What it is:** A grinding drum and a row of sorting chutes. Anything in, materials out, a tenth to sludge.
**Function:** job types: job, nights. Base cost 1 cell / 1 energy per job; no recipes run on it. Can suffer: Jammed, Unpowered, Worn, Dusty, Slipping, Hot. Wears through Drive belt, Lubricant. Runs the generic 'recycle' rule instead of written recipes.
**Chain:** `Gets you:` upgrade Recycler crate (60 credits; requires Scraps phase; crate); buildable: Build recycler. `Takes in -> makes:` nothing (no recipes). `Leads to:` no further machine.

### Crusher (`mach_crusher`) — phase 1 · produce · 3x3
**What it is:** Twin toothed rollers over a steel hopper. Breaks mixed scrap, e-waste and ice into sorted lumps.
**Function:** job types: job. Base cost 2 cell / 2 energy per job; recipes cost 1-2 cells (cell charge) and 1 energy; time: job x15; recipe risks: Jammed. Can suffer: Jammed, Unpowered, Worn, Dusty, Slipping, Hot. Wears through Drive belt, Lubricant.
**Chain:** `Gets you:` upgrade Crusher crate (120 credits; requires Scraps phase; crate); buildable: Build crusher. `Takes in -> makes:` E-waste -> Copper scrap, Polymer flake, Rare dust (30%), Noble flake (10%); 2 Dead appliance -> 3 Iron scrap, 2 Copper scrap, 2 Polymer flake, Rare dust (20%); 2 Dead cell husk -> Light scrap, Lithium salt, Carbon dust; 2 Spent filters -> 2 Carbon dust, Fibre lint, Salt cake; 2 Rubble -> 4 Grit, Iron scrap, Carbon dust; and 10 more. Discs: none needed. `Leads to:` no further machine.

### Purifier (`mach_purifier`) — phase 1 · produce · 2x3
**What it is:** A tall tank with a pump and a filter sleeve. Greywater or melted ice goes in, clean water comes out.
**Function:** job types: job. Base cost 1 cell / 1 energy per job; recipes cost 1-2 cells (cell charge) and 1 energy; time: job x5; recipe risks: Worn. Can suffer: Jammed, Unpowered, Worn, Clogged, Leaking. Wears through Water filter, Sealant.
**Chain:** `Gets you:` upgrade Purifier crate (80 credits; requires Scraps phase; crate); buildable: Build purifier. `Takes in -> makes:` 4 Greywater -> 4 Water pouch; Ice block -> Meltwater, Gas bladder; and 3 more. Discs: none needed. `Leads to:` no further machine.

### Hydro tray (`mach_hydro_tray`) — phase 1 · produce · 3x2
**What it is:** A shallow polymer tray with a drip line and a lamp bracket. Seed, water and light turn over nights to crops.
**Function:** job types: nights. Base cost 1 cell / 0 energy per job; recipes cost 1 cells (cell charge) and 0 energy; time: nights x7; recipe risks: Hot. Can suffer: Leaking, Unpowered, Dusty. Wears through Grow lamp, Sealant. Transmutes: Water to Biomass, Salts to Biomass, Volatiles to Biomass.
**Chain:** `Gets you:` upgrade Hydro tray crate (70 credits; requires Scraps phase; crate). `Takes in -> makes:` Tomato seed, 2 Water pouch, Nutrient mix -> Tomatoes, Tomato seed (70%), Greywater (90%), Salt cake (6%) [Hydro greens]; Herb seed, 2 Water pouch, Nutrient mix -> Herb bunch, Herb seed (70%), Greywater (40%), Salt cake (56%) [Hydro greens]; Bean seed, Greywater, Nutrient mix -> Broad beans, Bean seed (70%) [Hydro greens]; Greens seed, 2 Greywater, Nutrient mix -> Salad greens, Greens seed (70%), Greywater (50%), Salt cake (46%) [Hydro greens]; Seed potato, Greywater, Nutrient mix -> Potatoes, Seed potato (70%) [Hydro greens]; and 2 more. Discs: Hydro greens. `Leads to:` upgrades to Hydro rack.

### Slip printer (`mach_printer_s`) — phase 1 · produce · 2x2
**What it is:** A thermal slot printer with a roll of paper tape. Order slips, labels and receipts, a strip at a time.
**Function:** job types: job. Base cost 1 cell / 1 energy per job; recipes cost 1 cells (cell charge) and 1 energy; time: job x2. Can suffer: Jammed, Unpowered, Worn, Dusty. Wears through Drive belt, Fuse.
**Chain:** `Gets you:` upgrade Slip printer crate (55 credits; requires Scraps phase; crate); buildable: Build slip printer. `Takes in -> makes:` Paper -> Label roll; Paper -> 5 Order slip. Discs: none needed. `Leads to:` upgrades to Document printer.

### Workbench (`mach_bench`) — phase 1 · modify · 3x2
**What it is:** A steel bench with a vice, a roller and a rack of hand tools. Repair, refill, bundle, refurbish.
**Function:** job types: job. Base cost 0 cell / 1 energy per job; recipes cost 0 cells (cell charge) and 0-2 energy; time: job x31, instant x2; recipe risks: Worn. Can suffer: Dusty, Misaligned. Wears through Lubricant, Spare part.
**Chain:** `Gets you:` upgrade Workbench crate (90 credits; requires Scraps phase; crate); buildable: Build workbench. `Takes in -> makes:` 10 Patched spare, 2 Iron scrap, 3 Copper scrap -> 10 Spare part; 2 Light-metal sheet, Polymer flake -> 2 Device housing; 4 Iron scrap, Polymer flake -> 5 Patched spare; 2 Polymer sheet, Fibre lint -> 2 Drive belt; Light-metal bar -> 2 Light-metal sheet; and 28 more. Discs: none needed. `Leads to:` no further machine.

### Box sealer (`mach_sealer`) — phase 1 · modify · 2x2
**What it is:** A clamp frame with a tape head and a hot wire. Run a packed box through and it comes out sealed.
**Function:** job types: job. Base cost 1 cell / 1 energy per job; recipes cost 1 cells (cell charge) and 1 energy; time: job x3; recipe risks: Misaligned. Can suffer: Jammed, Unpowered, Worn, Misaligned, Slipping. Wears through Sealing tape, Drive belt.
**Chain:** `Gets you:` upgrade Box sealer crate (60 credits; requires Scraps phase; crate); buildable: Build box sealer. `Takes in -> makes:` Sealing tape -> any Small box / gains Sealed; Sealing tape -> any Medium box / gains Sealed; 2 Sealing tape -> any Large box / gains Sealed. Discs: none needed. `Leads to:` no further machine.

### Charger (`mach_charger`) — phase 1 · do · 2x2
**What it is:** A wall-fed cradle that trickles station power into a spent cell. Billed by the charge, at the power price.
**Function:** job types: job, nights. Base cost 0 cell / 0 energy per job; no recipes run on it. Can suffer: Unpowered, Tripped, Hot. Wears through Fuse. Runs the generic 'charge' rule instead of written recipes.
**Chain:** `Gets you:` upgrade Charger crate (30 credits; requires Scraps phase; crate); buildable: Build charger. `Takes in -> makes:` nothing (no recipes). `Leads to:` gates upgrade Cell bank, Night tariff (needs it owned).
**Note:** Generic rule: any cell in the cradle is refilled; no matter moves. The effects text is the visible price.

### Wired terminal (`mach_terminal`) — phase 1 · do · 3x3
**What it is:** An all-in-one machine with a curved green screen and a floppy drive. It runs on a cell and a wall socket.
**Function:** job types: job. Base cost 1 cell / 0 energy per job; recipes cost 1 cells (cell charge) and 1-2 energy; time: job x4; recipe risks: Unpowered. Can suffer: Infected, Unpowered, Dusty, Tripped. Wears through Fuse.
**Chain:** `Gets you:` upgrade Wired terminal crate (150 credits; requires Scraps phase; crate). `Takes in -> makes:` Flash the controller: clears Infected; Scrub a disc: clears Infected [Scrub disc]; Poll the machines: clears Unpowered [Diagnostics disc]; Close the day book: Need arrows for tomorrow, from today's sales [Ledger disc]. Discs: Diagnostics disc, Ledger disc, Scrub disc. `Leads to:` upgrades to Workstation.
**Note:** Numbers carried from src/kinds.json (memory 640, disk 2048, speed 8).

### Modem (`mach_modem`) — phase 1 · do · 2x1
**What it is:** A beige box with a handset cradle and a line jack. Plugs into the terminal: no modem, no mail.
**Function:** job types: job. Base cost 0 cell / 0 energy per job; no recipes run on it. Can suffer: Unpowered, Tripped. Wears through Fuse.
**Chain:** `Gets you:` upgrade Modem crate (45 credits; requires Scraps phase; crate). `Takes in -> makes:` nothing (no recipes). `Leads to:` gates upgrade Pigeonholes (needs it owned).
**Note:** orders_per_day add is the modem share of the phase rate; task 10 owns the base rate. No recipes run on it in the data (see Leads to for what it gates).

### Scanner (`mach_scanner`) — phase 1 · do · 2x2
**What it is:** A flat bed under a hooded lamp, wired to a sensor head. Shows what a box or a disc is hiding.
**Function:** job types: job. Base cost 1 cell / 1 energy per job; recipes cost 1 cells (cell charge) and 1 energy; time: job x3. Can suffer: Jammed, Unpowered, Worn, Misaligned, Dusty. Wears through Cleaning kit.
**Chain:** `Gets you:` upgrade Scanner crate (140 credits; requires Scraps phase; crate); buildable: Build scanner. `Takes in -> makes:` Scan a box: any packaging/container / loses Hidden goods / Shows false bottoms and hidden contents; Scan a disc: any media/data/program / Shows mod_infected, mod_bad_sector and mod_cracked on a disc; Scan for contraband: any contraband/fire/drug/luxury / Marks contraband and fakes (mod_counterfeit, mod_stolen); inspection chance -5% for a day. Discs: none needed. `Leads to:` gates upgrade Strongroom (needs it owned).

### Radio (`mach_radio`) — phase 1 · do · 2x2
**What it is:** A scuffed engineers' set tuned to the maintenance bands. Chatter about breakdowns before they happen.
**Function:** job types: job. Base cost 0.5 cell / 0 energy per job; no recipes run on it. Can suffer: Unpowered, Tripped, Dusty. Wears through Fuse.
**Chain:** `Gets you:` upgrade Radio crate (100 credits; requires Scraps phase; crate); buildable: Build radio. `Takes in -> makes:` nothing (no recipes). `Leads to:` gates upgrade Roof aerial (needs it owned).
**Note:** No recipes run on it in the data.

### Digester (`mach_digester`) — phase 2 · produce · 3x3
**What it is:** A sealed iron tun with a stirrer and a vent line. Sludge sours and settles into paste over nights.
**Function:** job types: nights. Base cost 2 cell / 1 energy per job; recipes cost 1 cells (cell charge) and 0 energy; time: nights x5. Can suffer: Jammed, Unpowered, Worn, Leaking, Clogged. Wears through Sealant, Lubricant. Transmutes: Sludge to Biomass, Sludge to Salts, Sludge to Volatiles, Sludge to Water.
**Chain:** `Gets you:` upgrade Digester crate (600 credits; requires Trade phase; crate). `Takes in -> makes:` 8 Sludge -> 5 Biomass paste, Greywater, Gas bladder, Salt cake; 4 Sludge -> 2 Salt cake, Biomass paste, Greywater; 4 Sludge -> 2 Gas bladder, Greywater, Biomass paste; 4 Sludge -> 3 Greywater, Salt cake; and 1 more. Discs: none needed. `Leads to:` upgrades to Bioreactor.

### Vat (`mach_vat`) — phase 2 · produce · 3x3
**What it is:** A square steel vat with a paddle and a press head. Biomass paste goes in; a disc decides what comes out.
**Function:** job types: job, nights. Base cost 3 cell / 2 energy per job; recipes cost 2 cells (cell charge) and 0-1 energy; time: job x11, nights x2; recipe risks: Jammed. Can suffer: Jammed, Unpowered, Worn, Hot, Infected, Dusty. Wears through Lubricant, Cleaning kit.
**Chain:** `Gets you:` upgrade Vat crate (1200 credits; requires Trade phase; crate). `Takes in -> makes:` 5 Biomass paste, 3 Sugar, Yeast culture -> Cheese wheel [Vat dairy]; Sugar, Water pouch -> 2 Apple [Vat staples]; 2 Biomass paste, Sugar, Plant oil -> Salami [Vat charcuterie]; 2 Biomass paste, Plant oil -> Sausage [Vat charcuterie]; 5 Biomass paste, Salt cake -> 2 Protein block [Vat staples]; and 8 more. Discs: Vat bakery, Vat charcuterie, Vat dairy, Vat staples. `Leads to:` upgrades to Industrial vat.

### Fabricator (`mach_fabricator`) — phase 2 · produce · 3x3
**What it is:** A gantry with a feed hopper and a heated bed. A blueprint disc tells it what to make from bar and polymer.
**Function:** job types: job, nights. Base cost 3 cell / 2 energy per job; recipes cost 2-5 cells (cell charge) and 1-2 energy; time: job x44; recipe risks: Jammed, Flagged, Hot, Misaligned. Can suffer: Jammed, Unpowered, Worn, Hot, Misaligned, Infected, Overclocked. Wears through Lubricant, Drive belt, Coolant.
**Chain:** `Gets you:` upgrade Fabricator crate (2200 credits; requires Trade phase; crate); buildable: Build fabricator. `Takes in -> makes:` 5 Glass pane, Rare dust, 5 Polymer sheet -> 10 Screen [Circuit blueprints]; 3 Copper ore, Rare dust, 3 Polymer sheet -> 10 Circuit board, Slag [Circuit blueprints]; 5 Iron bar, 3 Copper scrap, 2 Polymer flake -> 10 Spare part [Spares blueprints]; 2 Copper wire, Rare dust, Grit -> 10 Sensor [Circuit blueprints]; 2 Device housing -> 4 Refillable lighter, Polymer flake [Fire blueprints]; and 39 more. Discs: Circuit blueprints, Filter blueprints, Fire blueprints, Hand tool blueprints, Hardware blueprints, Lamp blueprints, Machine blueprints I, Spares blueprints. `Leads to:` upgrades to Precision fabricator.

### Extruder (`mach_extruder`) — phase 2 · produce · 3x2
**What it is:** A heated barrel and a die plate. Polymer flake goes in the top and sheet, tube or film comes out.
**Function:** job types: job. Base cost 3 cell / 2 energy per job; recipes cost 2-3 cells (cell charge) and 1 energy; time: job x5; recipe risks: Hot. Can suffer: Jammed, Unpowered, Worn, Hot, Clogged, Overclocked. Wears through Coolant, Lubricant.
**Chain:** `Gets you:` upgrade Extruder crate (800 credits; requires Trade phase; crate); buildable: Build extruder. `Takes in -> makes:` 2 Polymer flake -> Polymer crate; Polymer flake -> 2 Polymer tub; Polymer flake -> Polymer sheet; Polymer flake -> 2 Polymer tube; Polymer flake -> 4 Polymer film. Discs: none needed. `Leads to:` no further machine.

### Kiln (`mach_kiln`) — phase 2 · produce · 3x3
**What it is:** A brick drum on cells with a thick lid. Grit and slag fuse into glass, vials and ceramic.
**Function:** job types: job, nights. Base cost 4 cell / 2 energy per job; recipes cost 2-4 cells (cell charge) and 1 energy; time: job x12; recipe risks: Hot. Can suffer: Jammed, Unpowered, Worn, Hot, Dusty. Wears through Coolant.
**Chain:** `Gets you:` upgrade Kiln crate (900 credits; requires Trade phase; crate); buildable: Build kiln. `Takes in -> makes:` Glass pane -> 2 Glass lens; 4 Slag, Carbon dust -> 2 Crucible liner; 3 Grit -> Glazed vase; 3 Grit -> 2 Glass jar; 2 Slag -> Ceramic tile; and 7 more. Discs: none needed. `Leads to:` no further machine.

### Electrolyser (`mach_electrolyser`) — phase 2 · produce · 2x3
**What it is:** Twin steel plates in a clear-glass tank, wired to a heavy rectifier. Water splits into gas.
**Function:** job types: job, nights. Base cost 5 cell / 2 energy per job; recipes cost 4 cells (cell charge) and 1 energy; time: job x1. Can suffer: Jammed, Unpowered, Worn, Hot, Leaking, Tripped. Wears through Fuse, Sealant, Coolant. Transmutes: Water to Volatiles.
**Chain:** `Gets you:` upgrade Electrolyser crate (1100 credits; requires Trade phase; crate). `Takes in -> makes:` 2 Water pouch -> 2 Gas bladder. Discs: none needed. `Leads to:` no further machine.

### Scrubber (`mach_scrubber`) — phase 2 · produce · 2x3
**What it is:** A fan box with a slot for an air cartridge. Pulls foul air through carbon; the cartridge does the work.
**Function:** job types: job, nights. Base cost 2 cell / 1 energy per job; recipes cost 3-4 cells (cell charge) and 1-2 energy; time: job x4; recipe risks: Hot. Can suffer: Jammed, Unpowered, Worn, Clogged, Dusty. Wears through Air cartridge, Drive belt. Transmutes: Volatiles to Carbon.
**Chain:** `Gets you:` upgrade Scrubber crate (1000 credits; requires Trade phase; crate); buildable: Build scrubber. `Takes in -> makes:` 2 Salt cake, Iron scrap -> Oxygen candle [Scrubber profiles]; 2 Spent puck -> 2 Air puck, Gas bladder [Scrubber profiles]; 4 Foul air bladder -> 3 Carbon dust, Gas bladder [Scrubber profiles]; and 1 more. Discs: Scrubber profiles. `Leads to:` gates upgrade Scrubber profiles disc (needs it owned).

### Algae tank (`mach_algae_tank`) — phase 2 · produce · 3x3
**What it is:** A tall glass tank of green water with a lamp rack and an air stone. Grows biomass and breathes out.
**Function:** job types: nights. Base cost 2 cell / 1 energy per job; recipes cost 2-4 cells (cell charge) and 0 energy; time: nights x5. Can suffer: Jammed, Unpowered, Worn, Leaking, Infected, Dusty. Wears through Grow lamp, Sealant. Transmutes: Water to Biomass, Salts to Biomass, Volatiles to Biomass.
**Chain:** `Gets you:` upgrade Algae tank crate (1300 credits; requires Trade phase; crate). `Takes in -> makes:` 5 Nutrient mix, 4 Foul air bladder, 5 Greywater -> 10 Algae mat; 4 Foul air bladder, Greywater -> 2 Dense algae [Algae strains]; and 3 more. Discs: Algae strains. `Leads to:` gates upgrade Algae strains disc (needs it owned).

### Still (`mach_still`) — phase 2 · produce · 2x3
**What it is:** A copper pot, a coil and a drip jar. Ferments and distils slowly, and smells of both.
**Function:** job types: job, nights. Base cost 2 cell / 1 energy per job; recipes cost 2-4 cells (cell charge) and 0-2 energy; time: job x7, nights x1; recipe risks: Hot, Flagged. Can suffer: Jammed, Unpowered, Worn, Hot, Leaking. Wears through Sealant, Coolant. Transmutes: Biomass to Reagent.
**Chain:** `Gets you:` upgrade Still crate (1500 credits; requires Trade phase; crate). `Takes in -> makes:` Sugar wash, Bottle -> Spirit bottle [Vintner]; Wine must, Bottle -> Wine bottle [Vintner]; 3 Algae mat, Bottle -> Moonshine; 5 Brine, Biomass paste -> 5 Nutrient mix, 5 Water pouch; 2 Brine -> 2 Distilled water, 2 Salt cake; and 3 more. Discs: Chem basics, Vintner. `Leads to:` gates upgrade Vintner disc (needs it owned).

### Chem bench (`mach_chem_bench`) — phase 2 · produce · 3x2
**What it is:** A fume-stained steel bench with burettes, a hot ring and a rack of vials. Reagents, solvents, coolant.
**Function:** job types: job, nights. Base cost 2 cell / 1 energy per job; recipes cost 1-5 cells (cell charge) and 1-2 energy; time: job x19; recipe risks: Hot. Can suffer: Jammed, Unpowered, Worn, Hot, Leaking, Dusty. Wears through Cleaning kit, Sealant. Transmutes: Biomass to Reagent, Salts to Reagent, Carbon to Reagent, Volatiles to Reagent.
**Chain:** `Gets you:` upgrade Chem bench crate (1800 credits; requires Trade phase; crate). `Takes in -> makes:` Ethanol, Glass vial, Biomass paste -> Scent vial [Perfumery]; 5 Reagent dregs, Polymer flake -> 10 Lubricant [Consumable recipes]; Purified reagent -> 5 Stim [Stimulants]; Solvent, Glass vial -> 2 Blue ampoule [Narcotics]; 4 Greywater, 2 Reagent dregs, Polymer flake -> 4 Coolant [Consumable recipes]; and 14 more. Discs: Chem basics, Consumable recipes, Narcotics, Perfumery, Stimulants. `Leads to:` gates upgrade Chemistry basics disc, Stimulants disc, Perfumery disc, Consumables disc (needs it owned).

### Pill press (`mach_pill_press`) — phase 2 · produce · 2x2
**What it is:** A turret press with a hopper of powder and a tray of dies. A hundred small thumps a minute.
**Function:** job types: job. Base cost 2 cell / 1 energy per job; recipes cost 2 cells (cell charge) and 1 energy; time: job x5; recipe risks: Jammed. Can suffer: Jammed, Unpowered, Worn, Dusty, Misaligned. Wears through Lubricant, Cleaning kit.
**Chain:** `Gets you:` upgrade Pill press crate (1600 credits; requires Trade phase; crate). `Takes in -> makes:` Purified reagent, Carbon dust -> 10 Burn tab [Analgesics]; Purified reagent -> 10 Sleeping pill [Sedatives]; Purified reagent, Salt cake -> 5 Calmer [Sedatives]; Purified reagent -> 10 Painkiller [Analgesics]; Polymer flake, Light scrap -> 10 Blister card. Discs: Analgesics, Sedatives. `Leads to:` gates upgrade Analgesics disc, Sedatives disc (needs it owned).

### Loom (`mach_loom`) — phase 2 · produce · 4x3
**What it is:** A wide loom rebuilt in light alloy, with a heddle drive. Fibre goes in; cloth and gauze come off.
**Function:** job types: job, nights. Base cost 3 cell / 2 energy per job; recipes cost 2-4 cells (cell charge) and 1-2 energy; time: job x14. Can suffer: Jammed, Unpowered, Worn, Slipping, Dusty. Wears through Drive belt, Lubricant.
**Chain:** `Gets you:` upgrade Loom crate (1400 credits; requires Trade phase; crate). `Takes in -> makes:` 4 Cloth, Polymer sheet -> Ring coat [Garments]; 3 Cloth -> Blanket [Garments]; 2 Rags -> Woven rug [Garments]; 2 Cloth, Polymer flake -> Curtain [Garments]; 2 Cloth, 2 Fasteners -> Spine overalls [Garments]; and 9 more. Discs: Garments. `Leads to:` gates upgrade Garment patterns disc (needs it owned).

### Pulper (`mach_pulper`) — phase 2 · produce · 2x2
**What it is:** A tub with a paddle and a screen. Rags and lint soak into slurry and press out as paper.
**Function:** job types: job. Base cost 2 cell / 1 energy per job; recipes cost 2 cells (cell charge) and 1 energy; time: job x3. Can suffer: Jammed, Unpowered, Worn, Clogged, Leaking. Wears through Drive belt, Sealant.
**Chain:** `Gets you:` upgrade Pulper crate (700 credits; requires Trade phase; crate). `Takes in -> makes:` Rags -> 4 Paper; 3 Paper -> Pasteboard; and 1 more. Discs: none needed. `Leads to:` no further machine.

### Galley (`mach_kitchen`) — phase 2 · produce · 3x2
**What it is:** A hot plate, a pan well and a fan on cells. No flame, no smoke, and a pot of something warm.
**Function:** job types: job. Base cost 2 cell / 1 energy per job; recipes cost 1-2 cells (cell charge) and 1 energy; time: job x11. Can suffer: Jammed, Unpowered, Worn, Hot, Dusty. Wears through Cleaning kit, Fuse.
**Chain:** `Gets you:` upgrade Galley crate (900 credits; requires Trade phase; crate). `Takes in -> makes:` Terrine, 2 Apple, Citrus -> Ring dinner; Hot stew, Tin can -> Tinned stew; Potatoes, 2 Biomass paste, Stock cube -> Hot stew; 2 Biomass paste, Herb bunch, Plant oil -> 2 Dumpling; 2 Biomass paste, Water pouch, Stock cube -> Noodle bowl; and 6 more. Discs: none needed. `Leads to:` no further machine.

### Document printer (`mach_printer_m`) — phase 2 · produce · 3x2
**What it is:** A flat-bed press with an ink well and a paper tray. Manuals, posters and books, a sheet at a time.
**Function:** job types: job, nights. Base cost 2 cell / 1 energy per job; recipes cost 1-3 cells (cell charge) and 1 energy; time: job x6. Can suffer: Jammed, Unpowered, Worn, Dusty, Misaligned, Slipping. Wears through Drive belt, Cleaning kit.
**Chain:** `Gets you:` upgrade Document printer crate (1100 credits; requires Trade phase; crate). `Takes in -> makes:` 3 Paper, Carbon dust -> 2 Handbook; 4 Paper, Carbon dust -> 2 Service manual; 2 Paper, Carbon dust -> 2 Notice poster; 3 Paper, Carbon dust -> Printed book; 4 Paper, Carbon dust -> 2 Pamphlet; and 1 more. Discs: none needed. `Leads to:` upgrades to Banner printer.

### Disc copier (`mach_copier`) — phase 2 · produce · 2x2
**What it is:** A twin-drive disc cradle with a bar of green lights. Reads one disc, writes another, and does not ask.
**Function:** job types: job. Base cost 2 cell / 1 energy per job; no recipes run on it. Can suffer: Jammed, Unpowered, Worn, Infected, Dusty. Wears through Cleaning kit. Runs the generic 'copy' rule instead of written recipes.
**Chain:** `Gets you:` upgrade Disc copier crate (650 credits; requires Trade phase; crate). `Takes in -> makes:` nothing (no recipes). `Leads to:` no further machine.
**Note:** Generic rule: any copyable, unlicensed disc and a blank of the same media become two discs.

### Labeller (`mach_labeller`) — phase 2 · modify · 2x2
**What it is:** A hand-fed gummer with a disc-driven print head. Sticks a grade or a licence on whatever you slide through.
**Function:** job types: job. Base cost 1 cell / 1 energy per job; recipes cost 1 cells (cell charge) and 1 energy; time: job x3. Can suffer: Jammed, Unpowered, Worn, Misaligned. Wears through Label roll.
**Chain:** `Gets you:` upgrade Labeller crate (800 credits; requires Trade phase; crate). `Takes in -> makes:` Label roll -> any luxury/food/drink/garment/jewellery/scent / gains Ring label [Ring label set]; Label roll -> any medicine/device/computer/chemical/program / gains Company label [Company label set]; 2 Label roll -> any garment/jewellery/book/luxury/furnishing / gains Monogrammed [Ring label set]. Discs: Company label set, Ring label set. `Leads to:` gates upgrade Ring labels disc, Company labels disc (needs it owned).

### Chiller (`mach_chiller`) — phase 2 · do · 2x2
**What it is:** A finned radiator box with a pump and two hoses. Pulls heat out of whatever it stands beside.
**Function:** job types: job, nights. Base cost 2 cell / 1 energy per job; recipes cost 2-4 cells (cell charge) and 0-1 energy; time: job x1, nights x1. Can suffer: Jammed, Unpowered, Worn, Leaking, Dusty. Wears through Coolant, Sealant.
**Chain:** `Gets you:` upgrade Chiller crate (500 credits; requires Trade phase; crate); buildable: Build chiller. `Takes in -> makes:` Chill a neighbour: clears Hot; Coolant -> clears Hot, Overclocked. Discs: none needed. `Leads to:` gates upgrade Cold cabinet (needs it owned).

### Vent port (`mach_vent`) — phase 2 · do · 2x2
**What it is:** A hatch on a rail with a bolted collar. Sludge and waste go through for a fee and do not come back.
**Function:** job types: job. Base cost 1 cell / 1 energy per job; recipes cost 1 cells (cell charge) and 1 energy; time: job x6. Can suffer: Jammed, Unpowered, Worn, Clogged, Tripped. Wears through Lubricant, Fuse.
**Chain:** `Gets you:` upgrade Vent port crate (400 credits; requires Trade phase; crate). `Takes in -> makes:` 4 Sludge -> matter lost to vent, 2 credit fee; 4 Greywater -> matter lost to vent, 3 credit fee; 4 Gas bladder -> matter lost to vent, 3 credit fee; 4 Salt cake -> matter lost to vent, 1.5 credit fee; 6 Slag -> matter lost to vent, 3 credit fee; and 1 more. Discs: none needed. `Leads to:` no further machine.
**Note:** The outflow port: matter leaves the loop in its recipes (loss) for a credit fee.

### Hydro rack (`mach_hydro_rack`) — phase 3 · produce · 3x4
**What it is:** Four tiers of trays under strip lamps, with a drip line down one side. Fruit, herbs and fibre crops.
**Function:** job types: nights. Base cost 6 cell / 1 energy per job; recipes cost 2-3 cells (cell charge) and 0 energy; time: nights x8; recipe risks: Hot. Can suffer: Jammed, Unpowered, Worn, Leaking, Infected, Dusty. Wears through Grow lamp, Sealant. Transmutes: Water to Biomass, Salts to Biomass, Volatiles to Biomass.
**Chain:** `Gets you:` upgrade Hydro rack crate (6000 credits; requires Workshop phase; crate). `Takes in -> makes:` Citrus graft, 2 Water pouch, Nutrient mix -> 3 Citrus, Citrus graft [Hydro orchard]; Berry cutting, Water pouch, Nutrient mix -> 4 Berries, Berry cutting [Hydro orchard]; Tomato seed, 4 Water pouch, 3 Nutrient mix -> 3 Tomatoes, Tomato seed (70%), Greywater (70%), Salt cake (6%) [Hydro greens]; Apple graft, 2 Water pouch, 2 Nutrient mix -> 4 Apple, Apple graft [Hydro orchard]; Herb seed, 5 Water pouch, 3 Nutrient mix -> 3 Herb bunch, Herb seed (70%), Greywater (20%), 2 Salt cake (78%) [Hydro greens]; and 3 more. Discs: Hydro greens, Hydro orchard. `Leads to:` gates upgrade Hydro orchard disc (needs it owned).

### Industrial vat (`mach_vat_industrial`) — phase 3 · produce · 4x4
**What it is:** A riveted cauldron the size of a bunk with a screw press. Big batches, gourmet discs, overnight runs.
**Function:** job types: job, nights. Base cost 10 cell / 2 energy per job; recipes cost 4 cells (cell charge) and 0 energy; time: nights x9; recipe risks: Hot. Can suffer: Jammed, Unpowered, Worn, Hot, Infected, Dusty. Wears through Lubricant, Coolant.
**Chain:** `Gets you:` upgrade Industrial vat crate (14000 credits; requires Workshop phase, Vat; crate). `Takes in -> makes:` 10 Biomass paste, 6 Sugar, 2 Yeast culture -> 2 Cheese wheel [Vat dairy]; 2 Biomass paste, Plant oil, Herb bunch -> Terrine [Vat gourmet]; Cheese spread, Herb bunch -> Herb cheese [Vat gourmet]; Sugar, 2 Berries, Glass vial -> Fruit jelly [Vat gourmet]; 15 Biomass paste, 3 Salt cake -> 6 Protein block [Vat staples]; and 4 more. Discs: Vat bakery, Vat charcuterie, Vat dairy, Vat gourmet, Vat staples. `Leads to:` gates upgrade Vat gourmet disc (needs it owned).

### Precision fabricator (`mach_fab_precision`) — phase 3 · produce · 4x3
**What it is:** A closed cabinet with a granite bed and a probe arm. Tight tolerances: bearings, valves, machine parts.
**Function:** job types: job, nights. Base cost 8 cell / 2 energy per job; recipes cost 6 cells (cell charge) and 2-3 energy; time: job x11; recipe risks: Jammed, Hot, Misaligned. Can suffer: Jammed, Unpowered, Worn, Hot, Misaligned, Infected, Overclocked. Wears through Lubricant, Coolant, Service manual.
**Chain:** `Gets you:` upgrade Precision fabricator crate (22000 credits; requires Workshop phase; crate); buildable: Build precision fabricator. `Takes in -> makes:` Spring, Gear, Bearing, Polymer tube -> Torque driver [Precision blueprints]; Steel sheet, Light-metal sheet, Polymer tube -> Multitool [Precision blueprints]; Spring, Gear, Bearing, Seal -> Precision spare [Precision blueprints]; Iron bar -> 4 Bearing [Precision blueprints]; Steel sheet, 2 Copper wire -> 2 Valve [Precision blueprints]; and 6 more. Discs: Machine blueprints II, Precision blueprints. `Leads to:` upgrades to Autofab.

### 3D printer (`mach_printer_3d`) — phase 3 · produce · 3x3
**What it is:** A glass-hooded gantry that lays polymer and light metal in threads. It reads its models off a memory card.
**Function:** job types: job, nights. Base cost 8 cell / 2 energy per job; recipes cost 6-8 cells (cell charge) and 2 energy; time: job x8; recipe risks: Jammed. Can suffer: Jammed, Unpowered, Worn, Hot, Clogged, Misaligned. Wears through Coolant, Cleaning kit.
**Chain:** `Gets you:` upgrade 3D printer crate (18000 credits; requires Workshop phase; crate). `Takes in -> makes:` 2 Polymer sheet, Noble flake -> Gilt ornament [Model art]; 4 Polymer sheet -> Polymer sculpture [Model art]; Light-metal bar, Polymer flake -> 2 Device housing [Fitting models]; 2 Polymer flake, 2 Light scrap -> 3 Key fob [Gadget models]; 2 Polymer flake, Light scrap -> 4 Printed bracket [Fitting models]; and 3 more. Discs: Fitting models, Gadget models, Model art. `Leads to:` gates upgrade Fittings models disc, Gadget models disc, Art models disc (needs it owned).

### Assembler (`mach_assembler`) — phase 3 · produce · 4x3
**What it is:** A cage of jointed arms over a jig. Boards, chips and housings snap together into whole devices.
**Function:** job types: job, nights. Base cost 8 cell / 2 energy per job; recipes cost 8-10 cells (cell charge) and 2-3 energy; time: job x16; recipe risks: Hot, Jammed. Can suffer: Jammed, Unpowered, Worn, Misaligned, Infected, Dusty. Wears through Lubricant, Cleaning kit.
**Chain:** `Gets you:` upgrade Assembler crate (20000 credits; requires Workshop phase; crate). `Takes in -> makes:` 2 Circuit board, 2 Memory module, Screen, Noble bar -> Desk unit [Computer blueprints]; 4 Rare dust, 2 Grit, Noble flake -> 20 Chip [Computer blueprints]; 2 Circuit board, Memory module, Screen, Keypad -> Laptop terminal [Computer blueprints]; Circuit board, Speaker, Keypad, Device housing -> Handset [Device blueprints]; Circuit board, 2 Speaker, Device housing, Cable -> Radio set [Device blueprints]; and 11 more. Discs: Computer blueprints, Device blueprints. `Leads to:` gates upgrade Device blueprints disc, Computer blueprints disc (needs it owned).

### Cell press (`mach_cell_press`) — phase 3 · produce · 3x3
**What it is:** A hydraulic press with a clean sleeve. Lithium, metal and reagent are squeezed into charged cells.
**Function:** job types: job, nights. Base cost 10 cell / 3 energy per job; recipes cost 10-16 cells (cell charge) and 0-3 energy; time: job x3, nights x3; recipe risks: Hot, Leaking. Can suffer: Jammed, Unpowered, Worn, Hot, Leaking, Tripped. Wears through Coolant, Fuse.
**Chain:** `Gets you:` upgrade Cell press crate (16000 credits; requires Workshop phase; crate). `Takes in -> makes:` 4 Lithium salt, 2 Light scrap, 3 Reagent dregs -> 2 Heavy cell [Cell chemistry]; 3 Lithium salt, 3 Iron scrap, 3 Reagent dregs -> 5 Cell [Cell chemistry]; 2 Lithium salt, 3 Iron scrap, 2 Reagent dregs -> 10 Small cell [Cell chemistry]; and 3 more. Discs: Cell chemistry. `Leads to:` gates upgrade Cell blueprints disc (needs it owned).

### Synthesiser (`mach_synthesiser`) — phase 3 · produce · 3x4
**What it is:** A cabinet of reaction coils, cold traps and gas bottles. Builds molecules to order from a card.
**Function:** job types: job, nights. Base cost 12 cell / 3 energy per job; recipes cost 8-30 cells (cell charge) and 2-3 energy; time: job x7, nights x2; recipe risks: Hot. Can suffer: Jammed, Unpowered, Worn, Hot, Leaking, Clogged. Wears through Coolant, Sealant. Transmutes: Carbon to Polymer, Volatiles to Polymer, Reagent to Polymer, Biomass to Reagent, Carbon to Reagent, Salts to Reagent.
**Chain:** `Gets you:` upgrade Synthesiser crate (28000 credits; requires Workshop phase; crate). `Takes in -> makes:` 5 Regrowth gel, Noble flake -> 5 Gene patch [Regenerative]; 5 Burn gel, Rare dust -> 5 Regrowth gel [Regenerative]; 2 Base flask, Rare dust, Biomass paste -> 10 Antiviral, Purified reagent, Carbon dust, Grit [Antibiotics]; Purified reagent, 2 Lithium salt, Salt cake -> 10 Anti-radiation tab [Antibiotics]; 2 Acid flask, 2 Biomass paste -> 10 Antibiotic, Purified reagent, Biomass paste, Salt cake, Grit [Antibiotics]; and 4 more. Discs: Antibiotics, Narcotics, Polymer synthesis, Regenerative. `Leads to:` gates upgrade Polymer synthesis disc, Antibiotics disc, Regenerative disc (needs it owned).

### Jeweller's bench (`mach_jeweller`) — phase 3 · produce · 3x2
**What it is:** A fine bench under a loupe lamp, with a micro torch, a jig and a lock-drawer. Noble metal stays here.
**Function:** job types: job. Base cost 4 cell / 2 energy per job; recipes cost 3-8 cells (cell charge) and 1-2 energy; time: job x5. Can suffer: Jammed, Unpowered, Worn, Misaligned, Dusty. Wears through Cleaning kit, Lubricant.
**Chain:** `Gets you:` upgrade Jeweller's bench crate (12000 credits; requires Workshop phase; crate). `Takes in -> makes:` Noble flake, Copper scrap -> Signet ring [Jewellery]; Noble flake -> Gold chain [Jewellery]; Noble flake -> 2 Locket [Jewellery]; 2 Copper wire -> 2 Copper ring [Jewellery]; Engrave: any jewellery / gains Engraved [Jewellery]. Discs: Jewellery. `Leads to:` gates upgrade Jewellery models disc, Locked vitrine (needs it owned).

### Banner printer (`mach_printer_l`) — phase 3 · produce · 4x3
**What it is:** A wide roller press on legs, with four ink wells and a take-up spool. Banners, art prints, ad sheets.
**Function:** job types: job, nights. Base cost 6 cell / 2 energy per job; recipes cost 4 cells (cell charge) and 1 energy; time: job x2. Can suffer: Jammed, Unpowered, Worn, Slipping, Misaligned, Dusty. Wears through Drive belt, Cleaning kit.
**Chain:** `Gets you:` upgrade Banner printer crate (9000 credits; requires Workshop phase; crate). `Takes in -> makes:` 2 Cloth, Carbon dust -> Cloth banner; 4 Paper, Carbon dust -> Art print. Discs: none needed. `Leads to:` no further machine.

### Cellar (`mach_cellar`) — phase 3 · modify · 3x3
**What it is:** A cold insulated cabinet with a rack of shelves and a slow fan. Cheese and wine improve if you leave them.
**Function:** job types: nights. Base cost 4 cell / 0 energy per job; recipes cost 1 cells (cell charge) and 0 energy; time: nights x5. Can suffer: Jammed, Unpowered, Worn, Leaking, Dusty. Wears through Coolant, Sealant.
**Chain:** `Gets you:` upgrade Cellar crate (7000 credits; requires Workshop phase; crate). `Takes in -> makes:` Age cheese wheel: any Cheese wheel / gains Aged; Age cheese wedge: any Cheese wedge / gains Aged; Age herb cheese: any Herb cheese / gains Aged; Age wine: any Wine bottle / gains Aged; Age spirit: any Spirit bottle / gains Aged. Discs: none needed. `Leads to:` no further machine.

### Annealer (`mach_annealer`) — phase 3 · modify · 3x3
**What it is:** A drum furnace with a quench tank and a timer. Heated and cooled by the book, tools last longer.
**Function:** job types: job, nights. Base cost 8 cell / 2 energy per job; recipes cost 5 cells (cell charge) and 2 energy; time: job x2; recipe risks: Hot. Can suffer: Jammed, Unpowered, Worn, Hot, Leaking. Wears through Coolant.
**Chain:** `Gets you:` upgrade Annealer crate (6500 credits; requires Workshop phase; crate); buildable: Build annealer. `Takes in -> makes:` Carbon dust -> ; Carbon dust -> . Discs: none needed. `Leads to:` no further machine.

### Broadcaster (`mach_broadcaster`) — phase 3 · do · 2x3
**What it is:** A rack transmitter with a feed encoder and a disc tray. Pushes your ad onto the deck screens.
**Function:** job types: job, nights. Base cost 6 cell / 2 energy per job; no recipes run on it. Can suffer: Jammed, Unpowered, Worn, Infected, Tripped. Wears through Fuse.
**Chain:** `Gets you:` upgrade Broadcaster crate (11000 credits; requires Workshop phase; crate). `Takes in -> makes:` nothing (no recipes). `Leads to:` no further machine.
**Note:** No recipes run on it in the data.

### Workstation (`mach_terminal_pro`) — phase 3 · do · 4x3
**What it is:** A tower with a tall green screen, twin drives and a bay of ports. Bigger memory, more devices, scripts.
**Function:** job types: job. Base cost 5 cell / 0 energy per job; recipes cost 2 cells (cell charge) and 1 energy; time: job x1. Can suffer: Jammed, Unpowered, Worn, Infected, Dusty, Tripped. Wears through Fuse, Cleaning kit.
**Chain:** `Gets you:` upgrade Workstation crate (15000 credits; requires Workshop phase, Wired terminal; crate). `Takes in -> makes:` Run the forecast: Events are rumoured two days earlier [Forecast card]. Discs: Forecast card. `Leads to:` upgrades to Mainframe.

### Autofab (`mach_autofab`) — phase 4 · produce · 6x4
**What it is:** A hall-length fabricator with a robot arm, a parts silo and a conveyor. Any blueprint, batches overnight.
**Function:** job types: job, nights. Base cost 24 cell / 3 energy per job; recipes cost 12-28 cells (cell charge) and 0-3 energy; time: job x2, nights x11; recipe risks: Jammed, Misaligned, Hot. Can suffer: Jammed, Unpowered, Worn, Hot, Misaligned, Infected, Overclocked, Slipping. Wears through Lubricant, Coolant, Drive belt, Service manual.
**Chain:** `Gets you:` upgrade Autofab crate (160000 credits; requires Concern phase, Precision fabricator; crate). `Takes in -> makes:` 8 Rare dust, 4 Grit, 2 Noble flake -> 40 Chip [Computer blueprints]; 4 Circuit board, 4 Speaker, 4 Keypad, 4 Device housing -> 4 Handset [Device blueprints]; 2 Motor, 2 Circuit board, 2 Sensor, Device housing, Rare-earth ingot -> Service drone [Automata blueprints]; 6 Copper ore, 2 Rare dust, 6 Polymer sheet -> 20 Circuit board, 2 Slag [Circuit blueprints]; 2 Motor, 4 Bearing, Circuit board, Structural beam, Sensor -> Loader arm [Automata blueprints]; and 8 more. Discs: Automata blueprints, Circuit blueprints, Computer blueprints, Device blueprints, Heavy fab blueprints, Machine blueprints III, Precision blueprints, Spares blueprints. `Leads to:` gates upgrade Heavy blueprints disc, Automata blueprints disc, Machine plans, third disc (needs it owned).

### Bioreactor (`mach_bioreactor`) — phase 4 · produce · 5x5
**What it is:** A glass-lined tank the height of the deck, with spargers and a sample port. Sludge in, culture food out.
**Function:** job types: nights. Base cost 18 cell / 2 energy per job; recipes cost 8-12 cells (cell charge) and 0 energy; time: nights x6; recipe risks: Hot, Infected. Can suffer: Jammed, Unpowered, Worn, Leaking, Infected, Clogged. Wears through Sealant, Coolant. Transmutes: Sludge to Biomass, Water to Biomass, Salts to Biomass, Volatiles to Biomass.
**Chain:** `Gets you:` upgrade Bioreactor crate (120000 credits; requires Concern phase; crate). `Takes in -> makes:` 2 Sludge, Culture mat, Herb bunch, Plant oil -> 2 Culture steak [Bio cultures]; 3 Sludge, 3 Algae mat, Nutrient mix -> 2 Culture mat, Greywater [Bio cultures]; 12 Sludge -> 12 Biomass paste; and 3 more. Discs: Bio cultures. `Leads to:` gates upgrade Bio cultures disc (needs it owned).

### Refinery (`mach_refinery`) — phase 4 · produce · 6x5
**What it is:** A column of crucibles and cold traps, chimney bolted to the hull. Pulls rare earths and noble metal from slag.
**Function:** job types: job, nights. Base cost 28 cell / 4 energy per job; recipes cost 20-30 cells (cell charge) and 0-3 energy; time: job x4, nights x1; recipe risks: Hot. Can suffer: Jammed, Unpowered, Worn, Hot, Leaking, Dusty. Wears through Coolant, Sealant, Lubricant.
**Chain:** `Gets you:` upgrade Refinery crate (140000 credits; requires Concern phase; crate). `Takes in -> makes:` 3 Rare dust -> 3 Rare-earth ingot [Refinery profiles]; 10 E-waste -> 10 Copper scrap, 10 Polymer flake, 3 Rare dust, Noble flake [Refinery profiles]; 10 Chip -> 2 Rare dust, Grit, Noble flake (50%) [Refinery profiles]; and 2 more. Discs: Refinery profiles. `Leads to:` gates upgrade Refining profiles disc (needs it owned).

### Mainframe (`mach_mainframe`) — phase 4 · do · 5x4
**What it is:** A cabinet bank behind a locked cage, humming and warm. Runs every machine on the field and the market clients.
**Function:** job types: job. Base cost 20 cell / 0 energy per job; recipes cost 5 cells (cell charge) and 0 energy; time: nights x1. Can suffer: Jammed, Unpowered, Worn, Infected, Hot, Dusty, Tripped. Wears through Fuse, Coolant.
**Chain:** `Gets you:` upgrade Mainframe crate (380000 credits; requires Concern phase, Workstation; crate). `Takes in -> makes:` Run the scripts: Scripted machines run overnight at the mainframe's rate [Automation card]. Discs: Automation card. `Leads to:` gates upgrade Load governor (needs it owned).
