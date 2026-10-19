# Reader's guide to the discs

A disc is a small item (a 2x2 floppy or a 1x1 memory card) that carries data a machine or the terminal needs. 67 exist across seven domains. Kinds, as they appear in the data: **blueprint** (plans for fabricators, assemblers and printers; the term is also used for models), **recipe** (profiles for process machines such as vats, benches, stills; most of the food, medicine and life discs), **program** (software the terminal runs, named in `programs.json`), **data** (a read-only file with effects) and **blank** (empty copy targets).

How you get them: most are sold as **upgrades** for credits, but only if you already own the machine the disc is for (the terminal for program discs); a few are **exempt** from that route and arrive only by **mail** (an order attachment), from **walk-in sellers** or from **salvage**. Other channels are crates, and company issue (the starter kit has the Mail and Labels discs). Prices climb with phase: roughly 30-1,500 credits in phases 1-2, 5,000-15,000 in phase 3, 90,000-150,000 in phase 4.

How they gate things: a recipe that names a disc runs only on a machine with a tray holding that disc, so the disc is the licence to a whole product line (and the Machine blueprints discs gate building the machines themselves). Program discs gate terminal software, whose effects are listed with each disc. Discs flagged copyable can be copied on the copier onto a blank of the same media; **licensed** ones refuse unless cracked (the Cracker program), and a copy may carry the infection modifier.

Phases are shown as digits. Domain, kind and phase of all 67 discs:

| Domain | Disc | Kind | Media | Phase |
|---|---|---|---|---|
| Fabrication | Hardware blueprints | blueprint | floppy | 2 |
| Fabrication | Hand tool blueprints | blueprint | floppy | 2 |
| Fabrication | Spares blueprints | blueprint | floppy | 2 |
| Fabrication | Precision blueprints | blueprint | card | 3 |
| Fabrication | Fitting models | blueprint | card | 3 |
| Fabrication | Polymer synthesis | recipe | card | 3 |
| Fabrication | Heavy fab blueprints | blueprint | card | 4 |
| Fabrication | Refinery profiles | recipe | card | 4 |
| Machines and consumables | Machine blueprints I | blueprint | floppy | 2 |
| Machines and consumables | Machine blueprints II | blueprint | card | 3 |
| Machines and consumables | Machine blueprints III | blueprint | card | 4 |
| Machines and consumables | Filter blueprints | blueprint | floppy | 2 |
| Machines and consumables | Consumable recipes | recipe | floppy | 2 |
| Machines and consumables | Ring label set | recipe | floppy | 2 |
| Machines and consumables | Company label set | recipe | card | 3 |
| Technology and terminal software | Circuit blueprints | blueprint | floppy | 2 |
| Technology and terminal software | Lamp blueprints | blueprint | floppy | 2 |
| Technology and terminal software | Cell chemistry | blueprint | card | 3 |
| Technology and terminal software | Device blueprints | blueprint | card | 3 |
| Technology and terminal software | Computer blueprints | blueprint | card | 3 |
| Technology and terminal software | Gadget models | blueprint | card | 3 |
| Technology and terminal software | Automata blueprints | blueprint | card | 4 |
| Technology and terminal software | Blank floppy | blank | floppy | 1 |
| Technology and terminal software | Blank card | blank | card | 3 |
| Technology and terminal software | Salvaged disc | data | floppy | 1 |
| Technology and terminal software | Mail client | program | floppy | 1 |
| Technology and terminal software | Labels disc | program | floppy | 1 |
| Technology and terminal software | Pixel paint | program | floppy | 1 |
| Technology and terminal software | Mines | program | floppy | 1 |
| Technology and terminal software | Stocktake Pro | program | floppy | 1 |
| Technology and terminal software | Ledger disc | program | floppy | 2 |
| Technology and terminal software | Price board disc | program | floppy | 2 |
| Technology and terminal software | Scrub disc | program | floppy | 2 |
| Technology and terminal software | Overclock disc | program | floppy | 2 |
| Technology and terminal software | Wholesale client | program | floppy | 2 |
| Technology and terminal software | Diagnostics disc | program | floppy | 2 |
| Technology and terminal software | Dock manifest disc | program | floppy | 2 |
| Technology and terminal software | Forecast card | program | card | 3 |
| Technology and terminal software | Automation card | program | card | 3 |
| Technology and terminal software | Cracker disc | program | floppy | 3 |
| Technology and terminal software | Night client | program | floppy | 3 |
| Technology and terminal software | Model store card | program | card | 3 |
| Technology and terminal software | Tracker and chess | program | floppy | 1 |
| Technology and terminal software | Utility disc | program | floppy | 3 |
| Food | Hydro greens | recipe | floppy | 1 |
| Food | Vat staples | recipe | floppy | 2 |
| Food | Vat bakery | recipe | floppy | 2 |
| Food | Vat dairy | recipe | floppy | 2 |
| Food | Vat charcuterie | recipe | floppy | 2 |
| Food | Vat gourmet | recipe | card | 3 |
| Food | Hydro orchard | recipe | card | 3 |
| Food | Bio cultures | recipe | card | 4 |
| Life support | Algae strains | recipe | floppy | 2 |
| Life support | Scrubber profiles | recipe | floppy | 2 |
| Medicine | Chem basics | recipe | floppy | 2 |
| Medicine | Analgesics | recipe | floppy | 2 |
| Medicine | Sedatives | recipe | floppy | 2 |
| Medicine | Stimulants | recipe | floppy | 2 |
| Medicine | Antibiotics | recipe | card | 3 |
| Medicine | Narcotics | recipe | floppy | 3 |
| Medicine | Regenerative | recipe | card | 4 |
| Luxury | Vintner | recipe | floppy | 2 |
| Luxury | Garments | recipe | floppy | 2 |
| Luxury | Fire blueprints | blueprint | floppy | 2 |
| Luxury | Perfumery | recipe | floppy | 3 |
| Luxury | Jewellery | blueprint | card | 3 |
| Luxury | Model art | blueprint | card | 3 |


## Fabrication

### Hardware blueprints (`disc_fab_bp_hardware`) — blueprint · floppy · phase 2
**What it is:** Blue-labelled floppy of stamped plans: bolts, rivets, hinges, pipe thread, tins and crates.
**Function:** Required by 5 recipes on: Fabricator, Autofab. Makes Fasteners, Tin can, Pipe, Hinge, Polymer crate.
**Chain:** `Comes from:` upgrade 'Hardware blueprints disc' for 500 credits (needs Fabricator owned; delivery mail); salvage. `Unlocks / leads to:` Fasteners, Tin can, Pipe, Hinge, Polymer crate; feeds into Kitchen knife, Loupe, Spine overalls, Jam kit, Water filter and 14 more; wanted by orders: Vat valves, Packing stock.

### Hand tool blueprints (`disc_fab_bp_tools`) — blueprint · floppy · phase 2
**What it is:** Floppy with a greasy thumbprint on the label.
**Function:** Required by 4 recipes on: Fabricator, Autofab. Makes Kitchen knife, Wrench, Pliers, Cutters.
**Chain:** `Comes from:` upgrade 'Tool blueprints disc' for 600 credits (needs Fabricator owned; delivery mail); walk-in sellers; salvage. `Unlocks / leads to:` Kitchen knife, Wrench, Pliers, Cutters; wanted by orders: Tools for the ducts, Ice cutter parts, Tools for the second shift, Mill bearings.

### Spares blueprints (`disc_fab_bp_spares`) — blueprint · floppy · phase 2
**What it is:** Floppy labelled in marker: spare parts, brackets, springs, gears and device housings.
**Function:** Required by 7 recipes on: Fabricator, Autofab. Makes Bracket, Spring, Gear, Spare part, Device housing.
**Chain:** `Comes from:` upgrade 'Spares blueprints disc' for 700 credits (needs Fabricator owned; delivery mail); salvage. `Unlocks / leads to:` Bracket, Spring, Gear, Spare part, Device housing; feeds into Precision spare, Torque driver, Relay, Wall clock, Polymer flake and 11 more; wanted by orders: Ore crane repair, Reactor spares, Store shelving.

### Precision blueprints (`disc_fab_bp_precision`) — blueprint · card · phase 3
**What it is:** Memory card of tolerance files: bearings, valves, seals, matched spares and the fine tools.
**Function:** Required by 8 recipes on: Precision fabricator, Autofab. Makes Bearing, Valve, Seal, Precision spare, Torque driver, Multitool.
**Chain:** `Comes from:` upgrade 'Precision blueprints disc' for 12,000 credits (needs Precision fabricator owned; delivery mail); salvage. `Unlocks / leads to:` Bearing, Valve, Seal, Precision spare, Torque driver, Multitool; feeds into Loader arm, Crusher, Precision fabricator, Fabricator, Gas regulator and 3 more; wanted by orders: Ore crane repair, Ice cutter parts, Mill bearings, Reactor spares and 2 more.

### Fitting models (`disc_fab_model_fittings`) — blueprint · card · phase 3
**What it is:** Card of printable models: clips, brackets, pipe elbows and device cases.
**Function:** Required by 4 recipes on: 3D printer. Makes Printed clip, Printed bracket, Printed fitting, Device housing.
**Chain:** `Comes from:` upgrade 'Fittings models disc' for 5,500 credits (needs 3D printer owned; delivery mail); salvage; ordered crate. `Unlocks / leads to:` Printed clip, Printed bracket, Printed fitting, Device housing; feeds into Polymer flake, Oil lamp, Refillable lighter, Service drone, Handset and 7 more; wanted by orders: Store shelving.

### Polymer synthesis (`disc_fab_synth_polymer`) — recipe · card · phase 3
**What it is:** Card of chain-growth profiles: carbon and gas into new polymer flake.
**Function:** Required by 2 recipes on: Synthesiser. Makes Polymer flake.
**Chain:** `Comes from:` upgrade 'Polymer synthesis disc' for 14,000 credits (needs Synthesiser owned; delivery mail); salvage. `Unlocks / leads to:` Polymer flake; feeds into Polymer crate, Cutters, Device housing, Kitchen knife, Pliers and 30 more.

### Heavy fab blueprints (`disc_fab_bp_heavy`) — blueprint · card · phase 4
**What it is:** Card of structural plans in company grey: hull plate, beams, frames.
**Function:** Required by 2 recipes on: Autofab. Makes Hull plate, Structural beam.
**Chain:** `Comes from:` upgrade 'Heavy blueprints disc' for 110,000 credits (needs Autofab owned; delivery mail); salvage. `Unlocks / leads to:` Hull plate, Structural beam; feeds into Loader arm; wanted by orders: Company contract.

### Refinery profiles (`disc_fab_refine`) — recipe · card · phase 4
**What it is:** Licensed card of recovery profiles: rare earths and noble metal from boards, chips and e-waste.
**Function:** Required by 5 recipes on: Refinery. Makes Copper scrap, Polymer flake, Rare dust, Noble flake, Grit, Rare-earth ingot.
**Chain:** `Comes from:` upgrade 'Refining profiles disc' for 130,000 credits (needs Refinery owned; delivery mail). `Unlocks / leads to:` Copper scrap, Polymer flake, Rare dust, Noble flake, Grit, Rare-earth ingot; feeds into Copper bar, Spare part, Copper wire, Signet ring, Polymer crate and 57 more.
**Note:** Not copyable, licensed (the copier refuses it unless cracked).


## Machines and consumables

### Machine blueprints I (`disc_mach_bp_machines_1`) — blueprint · floppy · phase 2
**What it is:** Drawings for the first machines: bench, smelter, charger, sealer.
**Function:** Required by 10 recipes on: Fabricator, Autofab. Makes Workbench, Smelter, Recycler, Crusher, Purifier, Charger, Box sealer, Slip printer, Scanner, Radio.
**Chain:** `Comes from:` upgrade 'Machine plans, first disc' for 1,500 credits (needs Fabricator owned; delivery mail); walk-in sellers; salvage. `Unlocks / leads to:` Workbench, Smelter, Recycler, Crusher, Purifier, Charger, Box sealer, Slip printer, Scanner, Radio.

### Machine blueprints II (`disc_mach_bp_machines_2`) — blueprint · card · phase 3
**What it is:** Close-tolerance drawings for fabricators, kilns, scrubbers and chillers.
**Function:** Required by 5 recipes on: Precision fabricator, Autofab. Makes Fabricator, Extruder, Kiln, Scrubber, Chiller.
**Chain:** `Comes from:` upgrade 'Machine plans, second disc' for 15,000 credits (needs Precision fabricator owned; delivery mail); salvage. `Unlocks / leads to:` Fabricator, Extruder, Kiln, Scrubber, Chiller.

### Machine blueprints III (`disc_mach_bp_machines_3`) — blueprint · card · phase 4
**What it is:** A card of assembly plates for the big machines: precision cabinet, annealer drum.
**Function:** Required by 2 recipes on: Autofab. Makes Precision fabricator, Annealer.
**Chain:** `Comes from:` upgrade 'Machine plans, third disc' for 120,000 credits (needs Autofab owned; delivery mail); mail attachment on order 'Company contract' (wants Hull plate x1, Structural beam x2, Loader arm x1). `Unlocks / leads to:` Precision fabricator, Annealer.

### Filter blueprints (`disc_mach_bp_filters`) — blueprint · floppy · phase 2
**What it is:** Moulds and sleeve drawings for water filters and air cartridges.
**Function:** Required by 2 recipes on: Fabricator, Autofab. Makes Water filter, Air cartridge.
**Chain:** `Comes from:` upgrade 'Filter blueprints disc' for 650 credits (needs Fabricator owned; delivery mail); walk-in sellers. `Unlocks / leads to:` Water filter, Air cartridge; feeds into Sealed rebreather; wanted by orders: Scrubber bank is down.

### Consumable recipes (`disc_mach_consumables`) — recipe · floppy · phase 2
**What it is:** A chemist's sheet in pencil: coolant, lubricant, sealant, with the ratios crossed out and redone.
**Function:** Required by 3 recipes on: Chem bench. Makes Coolant, Lubricant, Sealant.
**Chain:** `Comes from:` upgrade 'Consumables disc' for 550 credits (needs Chem bench owned; delivery mail); salvage. `Unlocks / leads to:` Coolant, Lubricant, Sealant; wanted by orders: Tools for the second shift, Mill bearings, Reactor spares, Coolant, weekly and 1 more.

### Ring label set (`disc_mach_labels_ring`) — recipe · floppy · phase 2
**What it is:** A grade stamp and a script font lifted from a Ring catalogue.
**Function:** Required by 2 recipes on: Labeller (Label ring grade, Monogram goods); they modify existing goods rather than make new items.
**Chain:** `Comes from:` upgrade 'Ring labels disc' for 800 credits (needs Labeller owned; delivery mail); walk-in sellers. `Unlocks / leads to:` nothing downstream (no recipe outputs).

### Company label set (`disc_mach_labels_company`) — recipe · card · phase 3
**What it is:** The licence mark and batch numbers the company puts on its own stock.
**Function:** Required by 1 recipes on: Labeller (Label company licence); they modify existing goods rather than make new items.
**Chain:** `Comes from:` upgrade 'Company labels disc' for 7,000 credits (needs Labeller owned; delivery mail); mail attachment on order 'New label standard' (wants nothing). `Unlocks / leads to:` nothing downstream (no recipe outputs).


## Technology and terminal software

### Circuit blueprints (`disc_tech_bp_circuits`) — blueprint · floppy · phase 2
**What it is:** Floppy of etched traces for boards, cables, sensors, motors and relays.
**Function:** Required by 10 recipes on: Fabricator, Autofab. Makes Circuit board, Slag, Cable, Sensor, Motor, Relay, Keypad, Speaker, Screen, Soldering iron.
**Chain:** `Comes from:` upgrade 'Circuit blueprints disc' for 900 credits (needs Fabricator owned; delivery mail); salvage. `Unlocks / leads to:` Circuit board, Slag, Cable, Sensor, Motor, Relay, Keypad, Speaker, Screen, Soldering iron; feeds into Grit, Polymer flake, Rare dust, Copper scrap, Door alarm and 34 more; wanted by orders: Cells and cable, Ore crane repair, Ice cutter parts, Circuit stock and 5 more.

### Lamp blueprints (`disc_tech_bp_lamps`) — blueprint · floppy · phase 2
**What it is:** Yellow-sleeved floppy of tube and base drawings: grow lamps, work lights and the plain torch.
**Function:** Required by 3 recipes on: Fabricator. Makes Grow lamp, Work light, Torch.
**Chain:** `Comes from:` upgrade 'Lamp blueprints disc' for 450 credits (needs Fabricator owned; delivery mail); walk-in sellers. `Unlocks / leads to:` Grow lamp, Work light, Torch; wanted by orders: A lamp for the bunk, Night shift, Office comfort, Farm glass and 1 more.

### Cell chemistry (`disc_tech_bp_cells`) — blueprint · card · phase 3
**What it is:** A company card of electrode ratios and sleeve drawings.
**Function:** Required by 6 recipes on: Cell press. Makes Small cell, Cell, Heavy cell.
**Chain:** `Comes from:` upgrade 'Cell blueprints disc' for 11,000 credits (needs Cell press owned; delivery mail). `Unlocks / leads to:` Small cell, Cell, Heavy cell; feeds into Hearing aid; wanted by orders: A lamp for the bunk, Cells and cable, Cells for the tug, Cells for the crew.
**Note:** Not copyable, licensed (the copier refuses it unless cracked). Licensed on purpose: the cell press is the company's power monopoly. A cracked copy (disc_tech_prog_cracker) breaks it.

### Device blueprints (`disc_tech_bp_devices`) — blueprint · card · phase 3
**What it is:** Card of assembly drawings for handsets, radios, heaters, fans, clocks, locks and alarms.
**Function:** Required by 12 recipes on: Assembler, Autofab. Makes Dongle, Handset, Radio set, Room heater, Fan, Wall clock, Game handheld, Gamepad, Hearing aid, Door lock and 1 more.
**Chain:** `Comes from:` upgrade 'Device blueprints disc' for 9,000 credits (needs Assembler owned; delivery mail); salvage. `Unlocks / leads to:` Dongle, Handset, Radio set, Room heater, Fan, Wall clock, Game handheld, Gamepad, Hearing aid, Door lock and 1 more; wanted by orders: Device models, Quiet goods, Security stores.

### Computer blueprints (`disc_tech_bp_computers`) — blueprint · card · phase 3
**What it is:** Card of board layouts, chip masks and chassis for terminals, laptops and desk units.
**Function:** Required by 6 recipes on: Assembler, Autofab. Makes Chip, Memory module, Modem card, Laptop terminal, Desk unit.
**Chain:** `Comes from:` upgrade 'Computer blueprints disc' for 13,000 credits (needs Assembler owned; delivery mail). `Unlocks / leads to:` Chip, Memory module, Modem card, Laptop terminal, Desk unit; feeds into Grit, Noble flake, Rare dust, Dongle; wanted by orders: Control chips, Black exchange.
**Note:** Not copyable, licensed (the copier refuses it unless cracked). Licensed: chip masks are the company's. Cracking it is the black-market route to cheap computers.

### Gadget models (`disc_tech_model_gadgets`) — blueprint · card · phase 3
**What it is:** Card of printable 3D models: shells, cases, key fobs and the odd plastic gadget.
**Function:** Required by 2 recipes on: 3D printer. Makes Device case, Key fob.
**Chain:** `Comes from:` upgrade 'Gadget models disc' for 6,500 credits (needs 3D printer owned; delivery mail); mail attachment on order 'Device models' (wants Handset x1, Door alarm x2). `Unlocks / leads to:` Device case, Key fob; feeds into Gamepad, Game handheld, Door lock.

### Automata blueprints (`disc_tech_bp_automata`) — blueprint · card · phase 4
**What it is:** Heavy card of drone frames and loader arms, stamped CONCERN ONLY in red.
**Function:** Required by 2 recipes on: Autofab. Makes Service drone, Loader arm.
**Chain:** `Comes from:` upgrade 'Automata blueprints disc' for 150,000 credits (needs Autofab owned; delivery mail). `Unlocks / leads to:` Service drone, Loader arm; wanted by orders: Company contract.
**Note:** Not copyable, licensed (the copier refuses it unless cracked).

### Blank floppy (`disc_tech_blank_floppy`) — blank · floppy · phase 1
**What it is:** A 3.5-inch floppy with nothing on it.
**Function:** Copy target: the copier (`Copier`) writes a copyable floppy onto it; it unlocks no recipe.
**Chain:** `Comes from:` mail attachment on order 'FREE WINE inside' (wants nothing); walk-in sellers; ordered crate. `Unlocks / leads to:` itself wanted by order(s): ord_tech_floppies (res_technician, x3).
**Note:** Not copyable. Carried over from the old blank floppy. Copy target for any copyable floppy.

### Blank card (`disc_tech_blank_card`) — blank · card · phase 3
**What it is:** A stamp-sized memory card, gold contacts and no label.
**Function:** Copy target for cards and the card the Model store writes a purchased model to; it unlocks no recipe.
**Chain:** `Comes from:` walk-in sellers; ordered crate. `Unlocks / leads to:` itself wanted by order(s): ord_black_crack (org_black_market, x2).
**Note:** Not copyable.

### Salvaged disc (`disc_tech_data_lore`) — data · floppy · phase 1
**What it is:** An unlabelled salvaged disc of someone else's diaries, logs and schedules.
**Function:** Data disc: no machine and no recipe. Reading it gives rumours +5% accuracy and makes collectors pay 10% over on media items.
**Chain:** `Comes from:` salvage. `Unlocks / leads to:` nothing downstream (no recipe outputs).
**Note:** src/discs/unlabelled.md. Sells to collectors as a curiosity; also the mild source of rumours.

### Mail client (`disc_tech_prog_mail`) — program · floppy · phase 1
**What it is:** The company's mail disc: orders, attachments and the daily memo.
**Function:** Mail (MAIL.EXE): Mail, orders and attachments. Without a modem it only shows an empty inbox. Effect: Orders can be read and answered: +1 per day (with the modem). Needs: Modem. Runs on: Wired terminal, Workstation.
**Chain:** `Comes from:` the starter kit (start.json); upgrade 'Mail program disc' for 30 credits (needs Wired terminal owned; delivery mail); company issue. `Unlocks / leads to:` nothing downstream (no recipe outputs).

### Labels disc (`disc_tech_prog_labels`) — program · floppy · phase 1
**What it is:** Prints order slips and shelf labels on the slip printer.
**Function:** Labels (LABELS.EXE): Prints order slips and labels on the slip printer, in three sizes. Needs: Slip printer. Runs on: Wired terminal, Workstation.
**Chain:** `Comes from:` the starter kit (start.json); upgrade 'Labels program disc' for 35 credits (needs Wired terminal owned; delivery mail); company issue. `Unlocks / leads to:` nothing downstream (no recipe outputs).

### Pixel paint (`disc_tech_prog_paint`) — program · floppy · phase 1
**What it is:** An orange shareware disc with a brush and a little sun on a hand-drawn label.
**Function:** Paint (PAINT.EXE): Sixteen colours, a pen, a brush and a fill. Pictures save to C: and can be the wallpaper. Novelty program with no game effect. Runs on: Wired terminal, Workstation, Mainframe.
**Chain:** `Comes from:` salvage. `Unlocks / leads to:` nothing downstream (no recipe outputs).
**Note:** src/discs/paint.md. Exempt from the upgrade route (novelty).

### Mines (`disc_tech_prog_mines`) — program · floppy · phase 1
**What it is:** A grey disc, ten kilobytes of dread.
**Function:** Mines (MINES.EXE): Flag the mines on a small grid. A game that fits in a corner of a very small machine. Novelty program with no game effect. Runs on: Wired terminal, Workstation, Mainframe.
**Chain:** `Comes from:` salvage. `Unlocks / leads to:` nothing downstream (no recipe outputs).
**Note:** src/discs/mines.md. Exempt from the upgrade route (novelty).

### Stocktake Pro (`disc_tech_prog_stock`) — program · floppy · phase 1
**What it is:** A green disc in a hard case with a hologram sticker.
**Function:** Stocktake (STOCK.EXE): Counts everything you own, on the floor and in every box, and tells you what it is worth. Runs on: Wired terminal, Workstation, Mainframe.
**Chain:** `Comes from:` walk-in sellers. `Unlocks / leads to:` nothing downstream (no recipe outputs).
**Note:** Not copyable, licensed (the copier refuses it unless cracked). src/discs/stock.md. It starts only with this disc in drive A:, so the licence is the disc.

### Ledger disc (`disc_tech_prog_ledger`) — program · floppy · phase 2
**What it is:** A day-book program: what sold, what moved, what the station did.
**Function:** Ledger (LEDGER.EXE): A day book by need and event: what sold, what moved, what broke. Effect: Trend arrows on the need chips. Runs on: Wired terminal, Workstation. Also enables the terminal job Close the day book (no item output).
**Chain:** `Comes from:` upgrade 'Ledger program disc' for 350 credits (needs Wired terminal owned; delivery mail); salvage. `Unlocks / leads to:` nothing downstream (no recipe outputs).

### Price board disc (`disc_tech_prog_board`) — program · floppy · phase 2
**What it is:** Live need prices and trend arrows, drawn in green on the terminal screen.
**Function:** Price board (BOARD.EXE): Live need prices and trend arrows, redrawn each time a customer pays. Effect: Live numbers on the need chips. Runs on: Wired terminal, Workstation.
**Chain:** `Comes from:` upgrade 'Board program disc' for 500 credits (needs Wired terminal owned; delivery mail). `Unlocks / leads to:` nothing downstream (no recipe outputs).

### Scrub disc (`disc_tech_prog_antivirus`) — program · floppy · phase 2
**What it is:** A white-labelled disc with a stamp: CLEAN.
**Function:** Scrub (SCRUB.EXE): Finds mod_infected on any disc in the tray and strips it. Slow, and thorough. Effect: Infections spread a fifth as often while it runs. Runs on: Wired terminal, Workstation. Also enables the terminal job Scrub a disc (no item output).
**Chain:** `Comes from:` upgrade 'Scrub program disc' for 450 credits (needs Wired terminal owned; delivery mail); walk-in sellers. `Unlocks / leads to:` nothing downstream (no recipe outputs).

### Overclock disc (`disc_tech_prog_overclock`) — program · floppy · phase 2
**What it is:** A scorched-edge disc of timing tables.
**Function:** Overclock (OVERCLK.EXE): Loads into a machine and shortens every job. The machine runs hot and jams more. Effect: Jobs on the loaded machine cost a quarter less energy; Jam chance up by half. Runs on: Wired terminal, Workstation.
**Chain:** `Comes from:` upgrade 'Overclock program disc' for 600 credits (needs Wired terminal owned; delivery mail). `Unlocks / leads to:` nothing downstream (no recipe outputs).

### Wholesale client (`disc_tech_prog_wholesale`) — program · floppy · phase 2
**What it is:** Account disc for the company trade desk: crates at market price, one account number.
**Function:** Wholesale (WHOLESAL.EXE): Trade desk client: order crates at market price against one licensed account. Effect: Crates can be ordered at market price. Needs: Modem. Runs on: Wired terminal, Workstation.
**Chain:** `Comes from:` upgrade 'Wholesale program disc' for 800 credits (needs Wired terminal owned; delivery mail). `Unlocks / leads to:` nothing downstream (no recipe outputs).
**Note:** Not copyable, licensed (the copier refuses it unless cracked).

### Diagnostics disc (`disc_tech_prog_diagnostics`) — program · floppy · phase 2
**What it is:** Polls every machine on the field and lists what is jammed, hot or unplugged.
**Function:** Diagnostics (DIAG.EXE): Polls every machine and lists its status: jammed, hot, unplugged, worn. Effect: Statuses seen early: a tenth fewer surprise jams. Runs on: Wired terminal, Workstation. Also enables the terminal job Poll the machines (no item output).
**Chain:** `Comes from:` upgrade 'Diagnostics program disc' for 700 credits (needs Wired terminal owned; delivery mail). `Unlocks / leads to:` nothing downstream (no recipe outputs).

### Dock manifest disc (`disc_tech_prog_dockmaster`) — program · floppy · phase 2
**What it is:** Manifest disc issued with the dock gantry: what ships, which box, what each one pays.
**Function:** Dock manifest (DOCK.EXE): The dock manifest: what ships, in which box, and what each box pays after fees. Effect: Fees seen before shipping: 5% fewer wasted boxes. Needs: Modem. Runs on: Wired terminal, Workstation.
**Chain:** `Comes from:` upgrade 'Dockmaster program disc' for 550 credits (needs Wired terminal owned; delivery mail); mail attachment on order 'Dock records' (wants nothing); company issue. `Unlocks / leads to:` nothing downstream (no recipe outputs).
**Note:** Sold by an upgrade; also turns up through company and mail.

### Forecast card (`disc_tech_prog_forecast`) — program · card · phase 3
**What it is:** A licensed card that reads the engineers' bands and the board together.
**Function:** Forecast (FORECAST.EXE): Reads the engineers' bands and the board together. Rumours come earlier, and are right more often. Effect: Rumours reach you 2 days earlier; Rumours are right 15% more often. Needs: Modem, Dongle. Runs on: Workstation, Mainframe. Also enables the terminal job Run the forecast (no item output).
**Chain:** `Comes from:` upgrade 'Forecast program disc' for 7,500 credits (needs Workstation owned; delivery mail). `Unlocks / leads to:` nothing downstream (no recipe outputs).
**Note:** Not copyable, licensed (the copier refuses it unless cracked).

### Automation card (`disc_tech_prog_automate`) — program · card · phase 3
**What it is:** A card of scripts that load and start machine jobs in the night.
**Function:** Automate (AUTO.EXE): Scripts that load machines and start their jobs in the night. Needs the room to hold them. Effect: Scripted jobs cost a fifth less energy; Two more machines may run overnight. Runs on: Workstation, Mainframe. Also enables the terminal job Run the scripts (no item output).
**Chain:** `Comes from:` upgrade 'Automate program disc' for 10,000 credits (needs Workstation owned; delivery mail). `Unlocks / leads to:` nothing downstream (no recipe outputs).

### Cracker disc (`disc_tech_prog_cracker`) — program · floppy · phase 3
**What it is:** A hand-labelled disc with no brand and a skull drawn in biro.
**Function:** Cracker (CRACK.EXE): Patches the licence check out of a disc. The copy it makes is yours; so is whatever came with it. Effect: Copies of cracked discs fail one time in ten; Cracked copies carry a virus a quarter of the time. Runs on: Wired terminal, Workstation.
**Chain:** `Comes from:` mail attachment on order 'Cracked tools' (wants Blank card x2). `Unlocks / leads to:` nothing downstream (no recipe outputs).
**Note:** Contraband (software). Task 10 attaches it to mail. The copy it makes of a licensed disc may carry mod_infected.

### Night client (`disc_tech_prog_blackmarket`) — program · floppy · phase 3
**What it is:** Encrypted client for the black-market order board.
**Function:** Night client (NIGHT.EXE): Encrypted client for black-market orders. Pays well, leaves a trail, and asks no questions. Effect: Black-market orders arrive nightly; Security notices the traffic: inspection chance up. Needs: Modem. Runs on: Wired terminal, Workstation, Mainframe.
**Chain:** `Comes from:` mail attachment on order 'Black exchange' (wants Memory module x1). `Unlocks / leads to:` nothing downstream (no recipe outputs).
**Note:** Contraband (software).

### Model store card (`disc_tech_prog_modelstore`) — program · card · phase 3
**What it is:** Licensed shop client for 3D models: pick one, pay, and it is written to a blank card.
**Function:** Model store (MODELS.EXE): Shop client for 3D models: pick one, pay, and it is written to a blank card. Needs: Modem. Runs on: Workstation, Mainframe.
**Chain:** `Comes from:` upgrade 'Model store program disc' for 5,000 credits (needs Workstation owned; delivery mail). `Unlocks / leads to:` nothing downstream (no recipe outputs).
**Note:** Not copyable, licensed (the copier refuses it unless cracked).

### Tracker and chess (`disc_tech_prog_music`) — program · floppy · phase 1
**What it is:** A scuffed disc of module tunes and a chess board.
**Function:** Tracker (TRACKER.EXE): Module tracker: four voices, a grid of notes, and the hum of the terminal fan in time. Novelty program with no game effect. Chess (CHESS.EXE): A chess board against a patient, stupid opponent. Takes whole evenings. Novelty program with no game effect. Runs on: Wired terminal, Workstation, Mainframe.
**Chain:** `Comes from:` upgrade 'Tracker and chess disc' for 40 credits (needs Wired terminal owned; delivery mail); mail attachment on order 'Dock offer' (wants nothing); walk-in sellers; salvage. `Unlocks / leads to:` nothing downstream (no recipe outputs).
**Note:** Sold by an upgrade; also turns up through salvage and seller.

### Utility disc (`disc_tech_prog_utilities`) — program · floppy · phase 3
**What it is:** Three small programs on one disc: a defragmenter, a mail cipher and a bench tuner.
**Function:** Defrag (DEFRAG.EXE): Packs C: tight. A slow program that gives back a tenth of the disk and an hour of your night. Effect: A tenth more room on C:. Cipher (CIPHER.EXE): Scrambles mail and manifests before they leave. Inspectors find less to read. Effect: Inspections come a fifth less often. Needs: Modem. Tuner (TUNER.EXE): Calibrates a device from its own readings. The bench does the same by hand. Effect: Devices made on the loaded assembler sell 15% dearer (mod_tuned). Runs on: Wired terminal, Workstation.
**Chain:** `Comes from:` upgrade 'Utility program disc' for 6,000 credits (needs Workstation owned; delivery mail); walk-in sellers; salvage. `Unlocks / leads to:` nothing downstream (no recipe outputs).
**Note:** Sold by an upgrade; also turns up through salvage and seller.


## Food

### Hydro greens (`disc_food_hydro_greens`) — recipe · floppy · phase 1
**What it is:** Grow charts for leaves, beans, potatoes, herbs and tomatoes on a tray or a rack.
**Function:** Required by 12 recipes on: Hydro tray, Hydro rack. Makes Salad greens, Greens seed, Greywater, Salt cake, Broad beans, Bean seed, Potatoes, Seed potato, Herb bunch, Herb seed and 2 more.
**Chain:** `Comes from:` upgrade 'Hydro greens disc' for 40 credits (needs Hydro tray owned; delivery mail); walk-in sellers; salvage. `Unlocks / leads to:` Salad greens, Greens seed, Greywater, Salt cake, Broad beans, Bean seed, Potatoes, Seed potato, Herb bunch, Herb seed and 2 more; feeds into Biomass paste, Algae mat, Dense algae, Water pouch, Sugar wash and 20 more; wanted by orders: Something fresh.

### Vat staples (`disc_food_vat_staples`) — recipe · floppy · phase 2
**What it is:** Ration bars, paste tubes, protein blocks, sugar, oil, yeast, and the SYNTH-AG apple.
**Function:** Required by 9 recipes on: Vat, Industrial vat. Makes Ration bar, Paste tube, Protein block, Sugar, Plant oil, Yeast culture, Apple.
**Chain:** `Comes from:` upgrade 'Vat staples disc' for 450 credits (needs Vat owned; delivery mail); salvage. `Unlocks / leads to:` Ration bar, Paste tube, Protein block, Sugar, Plant oil, Yeast culture, Apple; feeds into Sliced bread, Cheese spread, Cheese wheel, Fruit jelly, Salami and 16 more; wanted by orders: Water for the row, Weekly rations, Tug stores, Yeast and sugar and 2 more.

### Vat bakery (`disc_food_vat_bakery`) — recipe · floppy · phase 2
**What it is:** Loaves and crackers, with notes on the yeast.
**Function:** Required by 4 recipes on: Vat, Industrial vat. Makes Sliced bread, Crackers.
**Chain:** `Comes from:` upgrade 'Vat bakery disc' for 500 credits (needs Vat owned; delivery mail); salvage. `Unlocks / leads to:` Sliced bread, Crackers; feeds into Slice of bread; wanted by orders: Hall bread.

### Vat dairy (`disc_food_vat_dairy`) — recipe · floppy · phase 2
**What it is:** Cheese wheels and spreads from sugar and a sour culture.
**Function:** Required by 3 recipes on: Vat, Industrial vat. Makes Cheese wheel, Cheese spread.
**Chain:** `Comes from:` upgrade 'Vat dairy disc' for 650 credits (needs Vat owned; delivery mail). `Unlocks / leads to:` Cheese wheel, Cheese spread; feeds into Cheese wedge, Herb cheese.

### Vat charcuterie (`disc_food_vat_charcuterie`) — recipe · floppy · phase 2
**What it is:** Salami and sausage cured overnight in the vat.
**Function:** Required by 3 recipes on: Vat, Industrial vat. Makes Salami, Sausage.
**Chain:** `Comes from:` upgrade 'Vat charcuterie disc' for 700 credits (needs Vat owned; delivery mail). `Unlocks / leads to:` Salami, Sausage; feeds into Salami slice.

### Vat gourmet (`disc_food_vat_gourmet`) — recipe · card · phase 3
**What it is:** Ring-grade terrine, herb cheese and jelly for the industrial vat.
**Function:** Required by 3 recipes on: Industrial vat. Makes Terrine, Herb cheese, Fruit jelly.
**Chain:** `Comes from:` upgrade 'Vat gourmet disc' for 9,000 credits (needs Industrial vat owned; delivery mail). `Unlocks / leads to:` Terrine, Herb cheese, Fruit jelly; feeds into Ring dinner.
**Note:** Licensed (the copier refuses it unless cracked).

### Hydro orchard (`disc_food_hydro_orchard`) — recipe · card · phase 3
**What it is:** Dwarf stock for the rack: apples, citrus and berries, grown the real way.
**Function:** Required by 3 recipes on: Hydro rack. Makes Apple, Apple graft, Citrus, Citrus graft, Berries, Berry cutting.
**Chain:** `Comes from:` upgrade 'Hydro orchard disc' for 7,000 credits (needs Hydro rack owned; delivery mail). `Unlocks / leads to:` Apple, Apple graft, Citrus, Citrus graft, Berries, Berry cutting; feeds into Ring dinner, Tinned apple, Fruit jelly; wanted by orders: Something fresh.

### Bio cultures (`disc_food_bio_cultures`) — recipe · card · phase 4
**What it is:** Culture mats and steak, grown from sludge and starter in the bioreactor tank.
**Function:** Required by 3 recipes on: Bioreactor. Makes Culture mat, Greywater, Culture steak.
**Chain:** `Comes from:` upgrade 'Bio cultures disc' for 90,000 credits (needs Bioreactor owned; delivery mail). `Unlocks / leads to:` Culture mat, Greywater, Culture steak; feeds into Biomass paste, Salt cake, Broad beans, Salad greens, Potatoes and 8 more.
**Note:** Licensed (the copier refuses it unless cracked).


## Life support

### Algae strains (`disc_life_algae_strains`) — recipe · floppy · phase 2
**What it is:** Scratched floppy from the lung halls: a dense strain and a salt-eating one for the tank.
**Function:** Required by 2 recipes on: Algae tank. Makes Dense algae, Algae mat, Water pouch.
**Chain:** `Comes from:` upgrade 'Algae strains disc' for 600 credits (needs Algae tank owned; delivery mail); salvage. `Unlocks / leads to:` Dense algae, Algae mat, Water pouch; feeds into Biomass paste, Greywater, Culture mat, Nutrient mix, Moonshine and 25 more; wanted by orders: Water for the row, A hot week, Tug stores, Algae tanks.

### Scrubber profiles (`disc_life_scrubber_profiles`) — recipe · floppy · phase 2
**What it is:** Gas-sorting tables on a grey floppy: deep strip, puck regeneration, oxygen candle sintering.
**Function:** Required by 3 recipes on: Scrubber. Makes Carbon dust, Gas bladder, Air puck, Oxygen candle.
**Chain:** `Comes from:` upgrade 'Scrubber profiles disc' for 550 credits (needs Scrubber owned; delivery mail); salvage. `Unlocks / leads to:` Carbon dust, Gas bladder, Air puck, Oxygen candle; feeds into Biomass paste, Polymer flake, Crucible liner, Cloth banner, Playing cards and 19 more; wanted by orders: Last puck on row C, Scrubber bank is down.


## Medicine

### Chem basics (`disc_med_chem_basics`) — recipe · floppy · phase 2
**What it is:** Floppy of the bench primer: purifying, ethanol, antiseptic, acids and bases, by the numbers.
**Function:** Required by 10 recipes on: Chem bench, Still. Makes Purified reagent, Biomass paste, Ethanol, Antiseptic, Acid flask, Base flask, Solvent, Burn gel.
**Chain:** `Comes from:` upgrade 'Chemistry basics disc' for 700 credits (needs Chem bench owned; delivery mail); salvage. `Unlocks / leads to:` Purified reagent, Biomass paste, Ethanol, Antiseptic, Acid flask, Base flask, Solvent, Burn gel; feeds into Anti-radiation tab, Blue ampoule, Burn tab, Calmer, Dream tab and 34 more; wanted by orders: Burn kit, Shift meds, Wound table, Clinic staples and 1 more.

### Analgesics (`disc_med_analgesics`) — recipe · floppy · phase 2
**What it is:** Dosage tables and die settings for painkillers and burn tabs.
**Function:** Required by 2 recipes on: Pill press. Makes Painkiller, Burn tab.
**Chain:** `Comes from:` upgrade 'Analgesics disc' for 600 credits (needs Pill press owned; delivery mail); walk-in sellers. `Unlocks / leads to:` Painkiller, Burn tab; feeds into Painkiller blister, Burn tab blister; wanted by orders: Burn kit, Shift meds, Ward stock, Clinic staples.

### Sedatives (`disc_med_sedatives`) — recipe · floppy · phase 2
**What it is:** Press settings for sleeping pills and calmers, with a dosage warning typed in capitals.
**Function:** Required by 2 recipes on: Pill press. Makes Sleeping pill, Calmer.
**Chain:** `Comes from:` upgrade 'Sedatives disc' for 650 credits (needs Pill press owned; delivery mail); walk-in sellers. `Unlocks / leads to:` Sleeping pill, Calmer; feeds into Sleeping blister; wanted by orders: Ward stock.

### Stimulants (`disc_med_stimulants`) — recipe · floppy · phase 2
**What it is:** Bench sheets for stims and energy tabs.
**Function:** Required by 2 recipes on: Chem bench. Makes Stim, Energy tab.
**Chain:** `Comes from:` upgrade 'Stimulants disc' for 800 credits (needs Chem bench owned; delivery mail); salvage. `Unlocks / leads to:` Stim, Energy tab; wanted by orders: Night shift.

### Antibiotics (`disc_med_antibiotics`) — recipe · card · phase 3
**What it is:** Synthesis card for antibiotics and antivirals.
**Function:** Required by 3 recipes on: Synthesiser. Makes Antibiotic, Purified reagent, Biomass paste, Salt cake, Grit, Antiviral, Carbon dust, Anti-radiation tab.
**Chain:** `Comes from:` upgrade 'Antibiotics disc' for 13,000 credits (needs Synthesiser owned; delivery mail); mail attachment on order 'Antibiotic trial' (wants Antibiotic x8, Antibiotic blister x2). `Unlocks / leads to:` Antibiotic, Purified reagent, Biomass paste, Salt cake, Grit, Antiviral, Carbon dust, Anti-radiation tab; feeds into Antibiotic blister, Blue ampoule, Burn tab, Calmer, Dream tab and 59 more; wanted by orders: Ward stock, Antirad for the crew, Free ward, Antibiotic trial and 1 more.
**Note:** Licensed (the copier refuses it unless cracked).

### Narcotics (`disc_med_narcotics`) — recipe · floppy · phase 3
**What it is:** Unmarked floppy, handwritten label peeled half off.
**Function:** Required by 3 recipes on: Synthesiser, Chem bench. Makes Dream tab, Blue ampoule.
**Chain:** `Comes from:` mail attachment on order 'Narcotics notes' (wants Dream tab x10, Blue ampoule x2); walk-in sellers. `Unlocks / leads to:` Dream tab, Blue ampoule; feeds into Dream blister; wanted by orders: Dream tabs, Narcotics notes.
**Note:** Contraband (drug). Exempt from the upgrade route (ids.json upgrade_exempt_discs). Needs an order attachment or a seller.

### Regenerative (`disc_med_regenerative`) — recipe · card · phase 4
**What it is:** Ring medicine card: regrowth gel and gene patch cultures.
**Function:** Required by 2 recipes on: Synthesiser. Makes Regrowth gel, Gene patch.
**Chain:** `Comes from:` upgrade 'Regenerative disc' for 100,000 credits (needs Synthesiser owned; delivery mail); mail attachment on order 'Regrowth cases' (wants Regrowth gel x2, Gene patch x1). `Unlocks / leads to:` Regrowth gel, Gene patch; wanted by orders: Regrowth cases.
**Note:** Licensed (the copier refuses it unless cracked).


## Luxury

### Vintner (`disc_lux_vintner`) — recipe · floppy · phase 2
**What it is:** A floppy of cellar tables: must ratios, bottling times, how long a still may run before the cap sweats.
**Function:** Required by 2 recipes on: Still. Makes Wine bottle, Spirit bottle.
**Chain:** `Comes from:` upgrade 'Vintner disc' for 900 credits (needs Still owned; delivery mail); walk-in sellers. `Unlocks / leads to:` Wine bottle, Spirit bottle; wanted by orders: Wine for tonight, The ring dinner, Founders feast.

### Garments (`disc_lux_garments`) — recipe · floppy · phase 2
**What it is:** Patterns for overalls, gloves, coats, blankets and curtains, in cut lines and seam counts.
**Function:** Required by 8 recipes on: Loom. Makes Spine overalls, Work gloves, Ring coat, Scarf, Blanket, Cushion, Curtain, Woven rug.
**Chain:** `Comes from:` upgrade 'Garment patterns disc' for 700 credits (needs Loom owned; delivery mail); salvage. `Unlocks / leads to:` Spine overalls, Work gloves, Ring coat, Scarf, Blanket, Cushion, Curtain, Woven rug; feeds into Fasteners, Cloth, Rags; wanted by orders: Office comfort.

### Fire blueprints (`disc_lux_bp_fire`) — blueprint · floppy · phase 2
**What it is:** A scratched floppy with no label but a flame drawn on it in marker.
**Function:** Required by 6 recipes on: Fabricator. Makes Candle, Match, Disposable lighter, Refillable lighter, Polymer flake, Flint striker, Oil lamp.
**Chain:** `Comes from:` mail attachment on order 'Fire plans' (wants Candle x3, Match x6); walk-in sellers. `Unlocks / leads to:` Candle, Match, Disposable lighter, Refillable lighter, Polymer flake, Flint striker, Oil lamp; feeds into Polymer crate, Cutters, Device housing, Kitchen knife, Pliers and 30 more; wanted by orders: A real flame, Lighters, Fire plans.
**Note:** Contraband (fire). Exempt from the upgrade route (ids.json upgrade_exempt_discs). Needs an order attachment or a seller.

### Perfumery (`disc_lux_perfumery`) — recipe · floppy · phase 3
**What it is:** Distillation notes for scents, soaps and pastes, with ring-grade proportions marked in red.
**Function:** Required by 2 recipes on: Chem bench. Makes Scent vial, Cosmetic pot.
**Chain:** `Comes from:` upgrade 'Perfumery disc' for 6,500 credits (needs Chem bench owned; delivery mail). `Unlocks / leads to:` Scent vial, Cosmetic pot; wanted by orders: The ring dinner.
**Note:** Licensed (the copier refuses it unless cracked).

### Jewellery (`disc_lux_jewellery`) — blueprint · card · phase 3
**What it is:** A card of settings, link gauges and casting loads for rings, chains and lockets.
**Function:** Required by 5 recipes on: Jeweller's bench. Makes Copper ring, Signet ring, Gold chain, Locket.
**Chain:** `Comes from:` upgrade 'Jewellery models disc' for 8,500 credits (needs Jeweller's bench owned; delivery mail); salvage. `Unlocks / leads to:` Copper ring, Signet ring, Gold chain, Locket; wanted by orders: Old paper, Gifts of state.

### Model art (`disc_lux_model_art`) — blueprint · card · phase 3
**What it is:** A card of polygon models: figures, scrolls and ornaments sized for the large printer.
**Function:** Required by 2 recipes on: 3D printer. Makes Polymer sculpture, Gilt ornament.
**Chain:** `Comes from:` upgrade 'Art models disc' for 5,200 credits (needs 3D printer owned; delivery mail); mail attachment on order 'Model for a print' (wants Art print x1, Polymer sculpture x1). `Unlocks / leads to:` Polymer sculpture, Gilt ornament; wanted by orders: Model for a print, Gifts of state.
**Note:** Licensed (the copier refuses it unless cracked).
