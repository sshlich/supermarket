# Tech items: reader's guide

The tech group is the station's electronics layer: power cells, small electronic components (boards, chips, motors, sensors, wiring parts), lamps and tools, printed paper goods, and the finished devices built from them. In the overall loop (scrap -> crusher/recycler -> materials -> machines -> goods -> sold), these sit mostly at the "machines -> goods" end. Raw inputs (copper, rare dust, polymer, grit, lithium salt, scrap) come out of the refinery chain and are turned by the Fabricator into components, then by the Assembler (and the Autofab at night) into devices. Devices are mostly sold to satisfy comfort, parts, air or medicine needs, or handed over for resident and faction orders. A few items are fuel (cells), a few are tools, and a few are consumables used by other rules (order slips).

Orders below are named from their ledger ids (for example "the engineer's cell order"); the data has no display names for orders, shops, sites or residents.

## Power cells

### Small cell (`it_tech_cell_s`) — tier 1 · 1x1 · worth 6$
**What it is:** A thumb-thick cell in a grey sleeve, stamped 10, holding capacity 10.
**Function:** Fuel. Runs a hot plate or printer for a morning; sold to the power need (0.3). Also an ingredient of hearing aids and is what a torch takes in the field.
**Chain:** `Comes from:` crate stock from phase 1 (also brought by walk-in sellers); Works hardware sells it (x1.1); Cell press with Cell chemistry makes 10 from 2 lithium salt, 3 iron scrap, 2 reagent dregs (normal job or overnight). `Goes into:` Assembler hearing aids (1 cell each); wanted by the bunker lamp order (x2), scavenger cell order (x3) and engineer cell order (x4).
**Note:** Replaces coal as phase 1 fuel. A spent cell is not a separate item; charge is state.

### Cell (`it_tech_cell_m`) — tier 2 · 1x2 · worth 18$
**What it is:** A ribbed steel case with a charge gauge scratched in; capacity 30.
**Function:** Fuel for the mid-size machines for a day; sold to the power need (1).
**Chain:** `Comes from:` crate stock from phase 2 until the cell press can make it; Cell press makes 5 from 3 lithium salt, 3 iron scrap, 3 reagent dregs (job or overnight). `Goes into:` no recipe uses it; wanted by the hauler cell order (x3) and engineer cell order (x2).
**Note:** Not sold in any shop.

### Heavy cell (`it_tech_cell_l`) — tier 3 · 2x2 · worth 60$
**What it is:** A forearm-sized sealed lithium cell in a light-metal jacket; capacity 100.
**Function:** Fuel for a press or a mainframe; sold to the power need (3).
**Chain:** `Comes from:` Cell press makes 2 from 4 lithium salt, 2 light scrap, 3 reagent dregs (job or overnight). No crate, shop or scavenge source. `Goes into:` no recipe; wanted by the hauler cell order (x1).
**Note:** Only obtainable by pressing it.

## Core components

### Circuit board (`it_tech_circuit`) — tier 2 · 2x1 · worth 24$
**What it is:** A hand-soldered green board; every device starts from one.
**Function:** The central component. Used in 20 recipes; also wanted by orders.
**Chain:** `Comes from:` Fabricator (Circuit blueprints) etches 10 from 3 copper ore, 1 rare dust, 3 polymer sheet, plus 1 slag; Autofab does 20 in bulk overnight. `Goes into:` machine builds (slip printer, scanner, radio, fabricator, precision fabricator), computer and device assemblies (memory module, modem card, laptop, desk unit, handset, radio set, hearing aid, door lock/alarm and others), drones and loader arms; and 4 orders (technician circuits x3, engineer reactor repair x2, clerk store repair x2, household solar repair x1); and 2 more.
**Note:** The Refinery can strip 10 boards back to copper scrap, rare dust, polymer flake and grit. No shop or scavenge source.

### Chip (`it_tech_chip`) — tier 3 · 1x1 · worth 100$
**What it is:** A processor in a black package; the reason rare earths are worth carrying.
**Function:** Component for computer parts and dongles; sold to the parts need.
**Chain:** `Comes from:` Assembler (Computer blueprints) bakes 20 from 4 rare dust, 2 grit, 1 noble flake; Autofab makes 40 overnight; scavenged at Junked terminals (weight 0.2, 1 piece). `Goes into:` memory modules (2), modem cards (1), dongles (1), Refinery chip metal recovery (10 chips give rare dust, grit, a half chance of noble flake); wanted by the engineer chip order (x4).
**Note:** None.

### Motor (`it_tech_motor`) — tier 2 · 2x2 · worth 30$
**What it is:** A small electric motor, copper winding round an iron rotor.
**Function:** Machine part; fans, belts and loaders turn on it.
**Chain:** `Comes from:` Fabricator (Circuit blueprints) winds 2 from 1 copper bar and 1 iron bar. `Goes into:` 12 recipes, chiefly machine builds (recycler, crusher, box sealer, slip printer, fabricator, extruder and more), fans, service drones and loader arms; wanted by hauler crane repair, hauler ice cutters, household solar repair and union vat repair orders (x1 each).
**Note:** No shop or scavenge source.

### Sensor (`it_tech_sensor`) — tier 2 · 1x1 · worth 18$
**What it is:** A pinhole-glass sensor reading gas, heat or light.
**Function:** Component for scanners, scrubbers and alarms; also consumed by a Workbench modify recipe.
**Chain:** `Comes from:` Fabricator makes 10 from 2 copper wire, 1 rare dust, 1 grit. `Goes into:` 10 recipes: scanner, kiln, scrubber, precision fabricator, annealer, hearing aid, door alarm, service drone, loader arm, and Workbench "Tune a device"; orders for technician circuits (x2), technician algae repair (x1) and household solar repair (x2).
**Note:** None.

### Cable (`it_tech_cable`) — tier 1 · 1x2 · worth 5$
**What it is:** A metre of copper inside grey polymer sheathing.
**Function:** Joining component for many builds.
**Chain:** `Comes from:` hand-crafted instantly (2 copper wire + 1 polymer flake gives 2); Fabricator draws 8 from 8 copper wire and 4 polymer flake; scavenged at Junked terminals (weight 0.6, 1-2). `Goes into:` charger, radio, work light, modem card, radio set, fan, gamepad; wanted by the scavenger cell order (x2).
**Note:** One of the few items craftable by hand.

### Screen (`it_tech_screen`) — tier 2 · 3x2 · worth 30$
**What it is:** A green phosphor screen in a cracked polymer frame.
**Function:** Component for terminals and handhelds.
**Chain:** `Comes from:` Fabricator blows 10 from 5 glass pane, 1 rare dust, 5 polymer sheet. `Goes into:` laptop terminal, desk unit, game handheld; wanted by the clerk store repair order (x1).
**Note:** None.

### Switch (`it_tech_switch`) — tier 1 · 1x1 · worth 4$
**What it is:** A thumb switch with brass blade and polymer rocker.
**Function:** Small component.
**Chain:** `Comes from:` hand-crafted instantly (copper wire, fasteners, polymer flake gives 4); scavenged at Junked terminals (weight 0.4, 1). `Goes into:` keypads (6 per batch), torches, room heaters, fans; wanted by the technician circuits order (x4).
**Note:** None.

### Relay (`it_tech_relay`) — tier 2 · 1x1 · worth 19$
**What it is:** A coil round a sprung blade in a clear case.
**Function:** Component for door locks; also consumed by Workbench "Refurbish a device".
**Chain:** `Comes from:` Fabricator winds 4 from 4 copper wire, 2 spring, 1 polymer flake; scavenged at Junked terminals (weight 0.3, 1). `Goes into:` door locks; Workbench refurbish.
**Note:** No order wants it.

### Keypad (`it_tech_keypad`) — tier 2 · 2x1 · worth 18$
**What it is:** Twelve polymer keys on a switch mat.
**Function:** Component for terminals, phones, locks and game gear.
**Chain:** `Comes from:` Fabricator stamps 4 from 2 polymer sheet and 6 switches. `Goes into:` 6 recipes: laptop terminal, handset (and bulk), game handheld, gamepad, door lock.
**Note:** No order wants it.

### Speaker (`it_tech_speaker`) — tier 2 · 1x1 · worth 30$
**What it is:** A paper cone with a rare-earth magnet in a polymer ring.
**Function:** Component for sound devices.
**Chain:** `Comes from:` Fabricator forms 4 from 2 copper wire, 1 rare dust, 3 polymer flake. `Goes into:` handset (and bulk), radio set, hearing aid, door alarm.
**Note:** No order wants it.

### Device case (`it_tech_case`) — tier 3 · 2x1 · worth 10$
**What it is:** A printed polymer shell with a light-metal core.
**Function:** Shell for handhelds and gamepads.
**Chain:** `Comes from:` 3D printer (Gadget models) prints 2 from 2 polymer flake and 1 light scrap. `Goes into:` game handheld, gamepad.
**Note:** None.

### Key fob (`it_tech_fob`) — tier 3 · 1x1 · worth 10$
**What it is:** A printed polymer tag with a metal core; opens one lock only.
**Function:** Component for door locks.
**Chain:** `Comes from:` 3D printer prints 3 from 2 polymer flake and 2 light scrap; Ring concierge sells it (x4.0); it also gates the Ring service corridor site. `Goes into:` door locks (2 each).
**Note:** None.

## Lamps and tools

### Grow lamp (`it_tech_lamp`) — tier 1 · 1x2 · worth 12$
**What it is:** A glass tube on a copper base, a hydro light.
**Function:** A tool that dims a little every night it burns; hydro trays need one from day one. Also an ingredient.
**Chain:** `Comes from:` crate from phase 1; Fabricator (Lamp blueprints) casts 10 from 4 copper wire, 5 grit, 1 rare dust. `Goes into:` work lights, torches; wanted by bunker lamp (x1), clerk comfort (x2) and council farm repair (x3) orders.
**Note:** Wear: dims nightly.

### Soldering iron (`it_tech_soldering_iron`) — tier 2 · 1x2 · worth 26$
**What it is:** A copper tip in a polymer grip on a coiled lead.
**Function:** A tool: joins boards and wakes dead handsets.
**Chain:** `Comes from:` Fabricator forges 2 from 2 copper wire, 2 fasteners, 1 polymer flake; Works hardware sells it (x1.1); bonus tool at the Junked terminals site. `Goes into:` no recipe or order uses it.
**Note:** Tool only.

### Work light (`it_tech_work_light`) — tier 2 · 1x2 · worth 78$
**What it is:** A caged lamp on a clamp with two metres of cable.
**Function:** Sold to the comfort need (1).
**Chain:** `Comes from:` Fabricator mounts one from a grow lamp, a light-metal sheet and 2 cable. `Goes into:` nothing; no order wants it.
**Note:** Sale-only end product.

### Torch (`it_tech_torch`) — tier 2 · 1x2 · worth 28$
**What it is:** A polymer tube with a switch and a lamp, no flame.
**Function:** Sold to the comfort need (1); the lawful alternative to candles and matches (contraband fire).
**Chain:** `Comes from:` Fabricator makes one from a grow lamp, a switch and a polymer tube; Works hardware sells it (x1.1); bonus tool at Spine ducts; gates the Dark bunks site. `Goes into:` engineer night shift order (x1) and security requisition order (x2).
**Note:** Takes a small cell in the field.

## Paper goods

### Order slip (`it_tech_slip`) — tier 1 · 1x1 · worth 0.2$
**What it is:** A strip of thermal paper with sender, goods and pay on delivery.
**Function:** Consumed by the box rule: a box leaves the dock only with one inside (not by a recipe).
**Chain:** `Comes from:` Slip printer makes 5 from 1 paper. `Goes into:` wanted by the clerk slips order (x20); the recycler is its only other use.
**Note:** A recycle-only warning is expected for it.

### Handbook (`it_tech_handbook`) — tier 2 · 1x2 · worth 13$
**What it is:** Twenty stapled pages of exploded drawings and warnings.
**Function:** Ingredient and order item.
**Chain:** `Comes from:` Document printer makes 2 from 3 paper and 1 carbon dust. `Goes into:` room heaters, wall clocks; technician manuals order (x1).
**Note:** None.

### Notice poster (`it_tech_notice`) — tier 2 · 2x3 · worth 9.5$
**What it is:** A one-colour hard-print poster pinned in spine corridors.
**Function:** Sold to the comfort need (0.25).
**Chain:** `Comes from:` Document printer makes 2 from 2 paper and 1 carbon dust. `Goes into:` clerk paper order (x1); no recipe.
**Note:** None.

## Computer parts and computers

### Memory module (`it_tech_memory_module`) — tier 3 · 1x1 · worth 490$
**What it is:** A strip of black chips on a green board.
**Function:** Component for computers; also sold or ordered.
**Chain:** `Comes from:` Assembler (Computer blueprints) from 1 circuit board and 2 chips; scavenged at Junked terminals (weight 0.06, rare). `Goes into:` laptop terminal, desk unit; engineer chip order (x1) and black market program order (x1).
**Note:** Rarely found by scavenging.

### Modem card (`it_tech_modem_card`) — tier 3 · 2x1 · worth 370$
**What it is:** A card with a line jack and a speaker for the handshake.
**Function:** Sold to the parts need (1).
**Chain:** `Comes from:` Assembler from circuit board, chip and cable. `Goes into:` nothing; no order wants it.
**Note:** Dead end (sale only).

### Dongle (`it_tech_dongle`) — tier 3 · 1x1 · worth 290$
**What it is:** A thumb-sized hardware key for licensed software.
**Function:** Sold to the parts need (0.5); licensed programs may require it.
**Chain:** `Comes from:` Assembler (Device blueprints) from chip, copper wire, polymer flake. `Goes into:` fence stolen-goods order (x1).
**Note:** Licensed tag; a cracked program ignores it (the forecast program requires it).

### Laptop terminal (`it_tech_laptop`) — tier 3 · 3x2 · worth 500$
**What it is:** A folding terminal with green screen and cell slot.
**Function:** Sold to the comfort need (2).
**Chain:** `Comes from:` Assembler from 2 circuit boards, memory module, screen, keypad. `Goes into:` nothing.
**Note:** A device to sell, not a machine: it does not run the player's programs.

### Desk unit (`it_tech_desk_unit`) — tier 4 · 3x3 · worth 2570$
**What it is:** A ring desk machine in light metal and gold trim.
**Function:** Sold to the luxury need (1); ring grade.
**Chain:** `Comes from:` Assembler from 2 circuit boards, 2 memory modules, a screen, a noble bar. `Goes into:` nothing.
**Note:** A device to sell, not a machine; the noble bar makes it dear.

## Household and comfort devices

### Handset (`it_tech_handset`) — tier 3 · 1x2 · worth 500$
**What it is:** A cradle phone with keypad.
**Function:** Sold to the comfort need (1.5).
**Chain:** `Comes from:` Assembler from circuit board, speaker, keypad, device housing; Autofab makes 4 at a time overnight. `Goes into:` technician gadget models order (x1).
**Note:** None.

### Radio set (`it_tech_radio_set`) — tier 3 · 2x2 · worth 500$
**What it is:** A portable set with a telescopic whip.
**Function:** Sold to the comfort need (1.5).
**Chain:** `Comes from:` Assembler from circuit board, 2 speakers, device housing, cable. `Goes into:` nothing.
**Note:** Sale only.

### Room heater (`it_tech_heater`) — tier 3 · 2x2 · worth 300$
**What it is:** A bar of hot wire behind a grille.
**Function:** Sold to the comfort need (2).
**Chain:** `Comes from:` Assembler from device housing, 4 copper wire, 2 switches, a handbook. `Goes into:` nothing.
**Note:** Described as drinking cells like water.

### Fan (`it_tech_fan`) — tier 3 · 2x2 · worth 91$
**What it is:** A grille, motor and three blades.
**Function:** Sold to the air need (0.5) and comfort need (0.5).
**Chain:** `Comes from:` Assembler from motor, light-metal sheet, switch, cable. `Goes into:` nothing.
**Note:** Sale only.

### Wall clock (`it_tech_clock`) — tier 3 · 2x2 · worth 58$
**What it is:** A round face behind a pane, one hand missing.
**Function:** Sold to the comfort need (0.5).
**Chain:** `Comes from:` Assembler from circuit board, 2 gears, glass pane, handbook. `Goes into:` nothing.
**Note:** Sale only.

### Game handheld (`it_tech_handheld`) — tier 3 · 1x2 · worth 380$
**What it is:** A grey brick with a small screen and keys that stacks blocks.
**Function:** Sold to the comfort need (2); toy.
**Chain:** `Comes from:` Assembler from circuit board, screen, keypad, device case. `Goes into:` nothing.
**Note:** Sale only.

### Gamepad (`it_tech_gamepad`) — tier 3 · 1x1 · worth 63$
**What it is:** A polymer pad with keys and a lead to the terminal's port bay.
**Function:** Sold to the comfort need (0.75).
**Chain:** `Comes from:` Assembler from device case, keypad, cable. `Goes into:` nothing.
**Note:** Occupies one terminal port.

## Security, medical and automation devices

### Hearing aid (`it_tech_hearing_aid`) — tier 3 · 1x1 · worth 300$
**What it is:** A polymer bud with microphone and a cell sealed inside.
**Function:** Sold to the medicine need (1).
**Chain:** `Comes from:` Assembler from circuit board, speaker, sensor, small cell. `Goes into:` nothing; no order wants it.
**Note:** Sale only.

### Door lock (`it_tech_door_lock`) — tier 3 · 1x2 · worth 460$
**What it is:** A bolt on a relay with keypad and two fobs.
**Function:** Sold to the parts need (1).
**Chain:** `Comes from:` Assembler from circuit board, relay, 2 key fobs, keypad. `Goes into:` security requisition order (x1).
**Note:** None.

### Door alarm (`it_tech_alarm`) — tier 3 · 1x1 · worth 120$
**What it is:** A sensor and siren in a white shell.
**Function:** Sold to the parts need (1).
**Chain:** `Comes from:` Assembler from 2 sensors, speaker, circuit board. `Goes into:` technician gadget models order (x2) and security requisition order (x2).
**Note:** Shouts when its cell dies.

### Service drone (`it_tech_drone`) — tier 4 · 3x2 · worth 600$
**What it is:** A flat rotor frame on a sensor eye that crawls ducts.
**Function:** Sold to the parts need (2).
**Chain:** `Comes from:` Autofab overnight (Automata blueprints) from 2 motors, 2 circuit boards, 2 sensors, device housing, rare-earth ingot. `Goes into:` nothing; no order wants it.
**Note:** Overnight Autofab only.

### Loader arm (`it_tech_loader_arm`) — tier 4 · 4x2 · worth 420$
**What it is:** A jointed arm on bearings that lifts a crate; bolts above a dock lane.
**Function:** Sold to the parts need (2).
**Chain:** `Comes from:` Autofab overnight from 2 motors, 4 bearings, circuit board, structural beam, sensor. `Goes into:` company contract order (x1).
**Note:** Overnight Autofab only.
