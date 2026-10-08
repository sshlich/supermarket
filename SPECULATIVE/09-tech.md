# 09. Technology and machines

> "New things are built to be replaced. Old things were built to be repaired. Nobody builds anything to be understood."
> (chalked over the Works Benches on Stores Run, floor 17; nobody admits to writing it)

This file is about the things that hum, drip, whine and click in the Stack: what they are made of, how they work, how they
break, who can fix them, and what it costs to own one. It leans on the rest of the folder: the building's plant is laid out in
`02-the-stack.md`, water treatment in `03-water.md`, prices and licences in `04-economy.md`, the Old Hands and the Archivists
in `06a-factions.md`. Here the depth is on the machines themselves, ending in a catalogue of machines a player can buy.

---

## 1. Three kinds of kit

Everything with a motor or a chip in the Stack belongs to one of three families, and anyone who has lived a year in the
Mills can tell which from across a room.

### 1.1 First-fit: the founding era (Y0 to Y41)

**First-fit** is the Mills word for anything made by Halden Works or its founding suppliers before the Last Shift: the
lifts, the meters, the Lung plates, the service tiles, the Works Benches, the Halden Cell No. 4, the clock-in machines, the
compactors in the Bale Hall. The Company calls it "heritage infrastructure" in documents and "legacy" on invoices.

What makes it first-fit, physically:

- **Weight.** Founding-era housings are cast, not moulded. A first-fit meter weighs four times its plastic replacement. People
  heft things before they look at them.
- **Trefoils.** The Works used one fastener everywhere: a three-lobed recessed screw head the Old Hands call a **trefoil**, driven
  by a **Works key**, a steel driver with a three-lobed tip that was issued to every maintenance worker and returned at the
  end of each shift. Trefoils were never sold to the public. A good Works key is worth 30 cr in the Mills; a Works key with a
  clock number stamped on the handle is worth three times that to the person whose number it is. Grey copies are filed from
  hex keys and round off a trefoil in two turns. A housing with a rounded trefoil has been opened by somebody who should not
  have.
- **The part number.** Every first-fit part carries an etched or cast **HW number**: `HW-2-40817-C`. The first digit after HW is
  the department (the same as the Old Hands' clock ranges: 2 is building services, 3 utilities, 4 cells, 0 the clean rooms).
  The last letter is the revision. The Archivists can match an HW number to a drawing; the Old Hands can match it to a smell.
- **Every lid opens.** Marrow Teague's founding rule (see 01). A first-fit machine has access panels, labelled test points,
  replaceable modules on rails. It was built for trained maintainers with a manual. It assumes somebody, somewhere, knows.
- **No clock inside.** First-fit electronics predate the Retirement Signal. They never brick, never ask for a licence, never
  "phone home" to the Ledger except where they were built to (the meters, the lease studs, the Tube gates). They simply run
  until something physical wears out.
- **Materials nobody makes.** Slow-cast lattice, Mendstone, the "not-quite-metal" sheath of the Bus, the glass-ceramic
  electrolyte of the No. 4 cell, the electret film of a Lung plate. The recipes were Halden's, the lines that made them were
  retooled for cells after Y0, and the people who ran those lines are dead.

What first-fit is like to own: it is heavy, it is old, every repair takes a part that has to be found rather than bought, and
it works better than anything new. The phrase in the Mills is **"first-fit, last forever"**, said with irony, because nothing
lasts forever, and with envy, because it lasts longer than you will.

### 1.2 Company-new: licensed kit (Y41 to now)

Everything on the Hatch's painted catalogue on 18: Halden-branded, made under contract (mostly at Bastion, some in Vantage's
supply chain, some nobody will say), sold through the company store, registered on the Ledger at the till.

What makes it Company-new:

- **Moulded shells, glued seams.** No access panels. "No user-serviceable parts inside" is printed on everything, and is
  true, because the parts inside are glued to each other.
- **The licence chip.** Every licensed device carries a small chip that holds its registration, its owner's Ledger account,
  its permitted uses and its **Retirement date** (see 04: screens 3 years, slates 4, drone controllers 5, grow lamps on a
  90-day spectrum key, cells on a 300-cycle counter). When the date comes, the Company's network sends the Retirement Signal
  and the device stops. The hardware is usually fine.
- **Pairing.** Company-new devices pair with each other: a transponder to a frame, a cell to a charger, a filter to a housing.
  An unpaired part works badly or not at all, "for your safety".
- **Brightness.** Company-new kit is white, rounded and friendly, with a status light that is green when it is working and
  amber when it would like to sell you something.

What Company-new is like to own: cheap to buy, dear to keep, perfectly reliable until a date somebody else picked, and legal.
Nobody inspects a Halden grinder.

### 1.3 Grey: rebuilt, cannibalised, Sump-made

Everything else. A **grey** machine is one that was made, mended or modified outside the licence: a Terraces dehumidifier
pulled from the chute with its cord cut and spliced back; a shaft-rat frame of three dead drones; a charger built from a
Works rectifier and a cooking pot; a grow bed made of a bathtub. Most of the working machinery in the Mills is grey, in whole
or in part.

What makes it grey:

- **Cable ties and tape.** "Sump stitches."
- **Mixed origin.** A grey machine is often a Company-new shell with first-fit guts, or the reverse. The Mills call the first a
  **sheep** (a wolf in a sheep's coat: legal-looking outside, illegal inside) and the second a **ram**.
- **No licence, so no Retirement.** A grey machine with its licence chip cut out ("**chipped**", the commonest grey operation)
  will never be bricked by the network. It also will not be allowed on a licensed lane, a licensed socket schedule, or a
  licensed inspection.
- **Character.** Every grey machine is different, because every one was made from what was to hand. This is why machines in
  the game are one-of-a-kind: most of them are.

**In play:** every machine and many parts carry an **origin** (First-fit, Company, Grey) alongside the F / R / S / Rc grade
marks from 04. Origin decides three things the player feels:

- **Who can fix it:** First-fit needs an Old Hand or a manual; Company needs the store (paid service, or replacement); Grey needs
  whoever made it, or a fixer on 6, or you.
- **What the law does to it:** Company is safe; Grey is a fine when an inspector sees it in a regulated role (water, food,
  charging, lanes); First-fit is legal but attracts buyers, some of them in uniform.
- **How it dies:** Company dies on a date; Grey dies of its weakest part, unpredictably; First-fit fades slowly and dies of a
  part nobody has.

---

## 2. Power and cells

### 2.1 The socket board

Every lease in the Mills has one **socket board**: a founding-era wall plate on the nearest pillar, four outlets and a meter
drum, with a ceramic fuse block behind a cover that only a Halden fitter's key opens (it is a trefoil, so it opens to a Works
key too). The board is rated for **3 hu an hour** across all four outlets. Draw more and the fuse goes; a Halden fitter
replaces it for 12 cr and a "load advisory" on the account. A second board is a lease upgrade (40 cr fitting, 0.50 cr a day).

That is the shop's power budget, physically: **four plugs and three hu an hour**. A grow bed's lamp (0.2), two insect-bin heaters
(0.6), a grinder (0.8) and a charger (0.5 per cell) fit; add a pot still and a heat gun and the board trips in the hour you
most need it.

- **Spiders.** Grey multi-way adaptors that turn one outlet into four. Legal to own, fine to use (8 cr, "unsafe load practice").
  They do not raise the 3 hu limit; they just let you trip it with more things.
- **Back-feeds.** Cable under the tiles from a neighbour's board, usually paid by the hour. See 02 and 04.
- **Slack hour.** When the Steps shed the Mills (tide, Dark Floors), the board goes dead: every plugged machine stops in the
  hour, and resumes when power returns. Machines that lose power mid-cycle react in their own ways (see the catalogue): a grow
  bed just waits; an insect bin cools; a pot still's run is ruined; a charger loses nothing; a Company grinder must be "reset"
  by holding a button for ten seconds, which costs the hour.

**In play:** the socket board is a 1x1 fixed machine with **four outlet slots** and a **load gauge**. Every machine on the
field is either plugged (occupies an outlet, bills per hour, stops in slack) or celled (has a cell in its own cell slot, runs
free until the cell is flat, ignores slack). The outlet count is a packing problem in its own right: four plugs is a real
limit, and a second board is a purchase that feels like more space.

### 2.2 The H-cell (Company-new)

The Stack's everyday battery, the size of a brick of Vitabrick and about as heavy as two: a grey moulded case, a carry-loop
at one end, two recessed terminals at the other, a status pip, and a sticker with the Halden mark, a date code and a plant code.
It holds **2 hu** charged.

**Chemistry, as people understand it.** A liquid-electrolyte cell in a wound "jelly roll", descended from the Works' own
Line One designs but made cheaper: thinner separator, less cathode, a sweet-smelling solvent electrolyte. It works well when
young and degrades in all the ways cells do:

- **Fade:** capacity drops a little with every cycle. A new H-cell holds 2 hu; at 150 cycles about 1.8; at 300 about 1.7 (the
  "85%" in 04). Fade accelerates past 400.
- **Self-discharge:** about 2% of its charge a day sitting on a shelf, more in heat. A charged cell bought on Monday and used on
  Friday has lost a tenth.
- **Cold sag:** below about 5 °C the cell delivers half its rated draw. Only matters on the Seaward face in winter, in the
  Flats, and in an insulated cold bay with ice in it.
- **Swell:** gas builds inside an old or over-charged cell and the case bulges. A **swollen** cell still works, does not fit
  standard slots without force, and is one bad knock from a fire. Every Mills household knows the sound of a swollen cell
  hitting the floor (a soft pop, then a hiss, then everybody out).
- **Sweat:** the case's seal weeps electrolyte, leaving a sticky, sweet, slightly caustic film. A **sweating** cell eats the
  contacts of whatever slot it sits in.

**The counter.** Each H-cell's chip counts its charge cycles. At 300 it declares itself **End of Service** to any licensed
charger, which refuses it (04). Grey chargers ignore the counter. Licensed machines run a grey-charged cell at 70% draw
("Certified Recharge Only").

**Plant codes.** The sticker's code says where the cell was made, and the codes are an argument:

| Code | Means | Seen |
|---|---|---|
| **BX** | Bastion, under contract | most store cells; the official answer |
| **CR** | Halden Certified Renewed, no plant named | since Y85; cheap; Old Hands open them and argue (see 01) |
| **HW-9** | Halden Works, Line Nine | "should not exist"; turns up in the North and West Chutes (see 02) |
| *(none)* | counterfeit sticker, or a Sump rebuild | everywhere below 10 |

**Alternative:** plant codes are not on the sticker at all but in the cell's chip, readable only on a licensed charger or an
analyser. Then nobody knows what they hold until they test it, which makes a cell tester (see section 9) more valuable and
the HW-9 rumour quieter.

**In play:** the H-cell is a **1x1** item with a visible **charge gauge** (0 to 2 hu) and hidden features shown as "?" until
tested: cycle count, plant code, condition (good / tired / swollen / sweating). A swollen cell becomes a **1x2** item (it
literally no longer fits) and refuses standard slots. A sweating cell in a machine's slot lowers that machine's condition by a
step a day. Nothing spreads to neighbours on the field: the damage is to the slot it sits in.

### 2.3 The Halden Cell No. 4 (first-fit)

The founding-era cell, made on Lines One to Three and packed on Lines Seven and Eight from Y0 to Y41, and the thing "everyone
in the province had in something" (01). The Mills say "a Number Four", or just "a Four". A Four is a squat steel cylinder a
hand high, knurled for grip, with a brass cap and a small round window in the cap: the **charge eye**, a glass lens over a
strip of founding-era indicator film that shows a band of colour from dark (empty) to pale gold (full). No chip. No counter.

Why a Four is prized:

- **The electrolyte is glass.** A Four's electrolyte is a glass-ceramic wafer, not a liquid. It cannot leak, cannot swell, does
  not burn when punctured (people have tried, at parties). The Works made the glass on Line Three's dry-room floor (now Three
  Hall on 14, whose "dry rooms leak now") from a powder nobody has a recipe for.
- **It lasts.** A Four takes roughly ten thousand cycles before it fades below 80%. A Four bought in Y20 and used every day since
  is still at about 85%. Most Fours in circulation are at 70 to 95%.
- **It holds 3 hu** in a body smaller than an H-cell, and loses less than 1% a month on a shelf. A Four is a savings account
  that runs a grow lamp.
- **It shrugs off the wet.** The Wet One (R4) shorts H-cells in drone mounts; a Four does not care.
- **The eye tells the truth.** You can see a Four's charge without a meter. Nobody can fake the eye; Sump counterfeiters have
  tried with painted film and the colour never moves.
- **No licence.** A Four was never registered on the Ledger and will never be retired. It is also, technically, an
  "unregistered power source", and a licensed charger will not touch it (it has no chip to talk to). It needs a **grey
  charger** or a first-fit one.

Why there are few: the Works stopped making them in Y41, the Company bought back every one it could find through the Y60s as a
"heritage recovery scheme" (paying in scrip), and Crown households keep them in their emergency lighting. The ones the Mills
have are ones that hid: in tool drawers, in old Works lamps, under tiles, in the Old Hands' own homes.

**Variants:**
- **No. 4 (standard):** 3 hu, the one everyone knows.
- **No. 4L ("long Four"):** twice the height, 6 hu. Made for the Works' floor carts. Rare; a 1x2 item.
- **No. 2 ("button"):** a coin-sized founding cell from clocks, meters and lease studs. Tiny charge (it runs a clock for twenty
  years), valued by Old Hands because every founding-era clock and Sorrel meter has one. A meter whose button dies stops
  reporting, and the bill becomes an estimate.
- **No. 9 ("the Nine"):** a high-density cell from Line Nine, Y26 to Y38: 5 hu in a Four's body. Nobody below the Terraces has
  held one. The Old Hands say there were never more than a few thousand. The HW-9 H-cells that fall down the chute are not
  Nines; they are H-cells with a Line Nine chip, which is a different mystery.

**Hook:** a Four's charge eye goes gold when full. Ruth Amadi (0412) says the film in the eye was made on Line Four, her line,
and that the film has a second band that nobody was ever told about, which shows a different colour when the cell has been
charged "from the Bus directly". Some Fours in the Mills have a faint blue band at the edge of the eye. Nobody has charged them
from the Bus.

**Prices** (04 sets them; here for convenience): a Four at an Old Hand's bench, 400 cr; in the Middle, 700; from a penthouse
fixer to a Crown buyer with a provenance certificate, 1,200. A long Four, double. A button, 15 to 40. A Nine: name your price.

**In play:** the Four is the first-fit item a player is most likely to own early: a 1x1 cell with a visible gauge (the eye),
3 hu, no counter, no swell, no sweat, and a hidden **health** ("?" until tested, but usually high). It is also the clearest
temptation in the game: sell it up for the price of a month's rent, or keep it in the grinder's slot so slack hour never
touches you again.

### 2.4 Grey cells

- **Re-terminated cells (Rc):** H-cells from the chute with their terminals clipped by a disposal valet (the VOID Clip, see 04),
  re-soldered on a jig. Work as well as the cell's age allows. Flag "Uncertified" on licensed machines.
- **Bricks:** packs of four to eight dead-ish H-cells strapped together and wired in parallel, so that six tired cells make
  one sad big one. 2x2, 4 to 8 hu, heavy, and every one has one cell in it that will swell first.
- **Pot cells:** Sump rebuilds. A swollen or dead H-cell is opened, its jelly roll dried and re-wetted with reclaimed electrolyte
  (cut from the Waterhouse's spent cartridges, or from heads off a still, depending on who you ask), resealed with resin.
  Holds 1 to 1.5 hu, sweats within a month, sometimes catches fire. Sold in the Sump for 4 cr. "Pot cell" is also an insult
  for a person who promises a lot and goes flat.
- **Tide banks:** big rebuilt packs (2x3 and up) that charge during the Race's surges and run machines through slack hour. Some
  Mills halls share one, Co-op style.
- **Counterfeit Fours:** steel tubes with an H-cell inside and a painted eye. Fool nobody who knows, everybody who does not. A
  counterfeit Four sold to a Crown buyer is the kind of thing a penthouse fixer is paid to prevent, and paid more to arrange.

### 2.5 Charging

Charging is slow, safe if done right, and naturally overnight. Every cell charges at its own rate: an H-cell takes about four
hours on a licensed charger, a Four about three (it accepts charge faster than its draw), a brick all night.

- **Licensed chargers** (Halden ChargeDock and kin) read the cell's chip, refuse End of Service cells, refuse Fours, refuse
  grey cells, log every charge to the Ledger and bill it through the socket. They never cause fires.
- **Grey chargers** charge anything with terminals. They are faster or slower depending on the build, they do not stop at full
  unless somebody built that in, and they are why swollen cells exist.
- **The exchange:** the company store swaps a flat H-cell for a charged one, 2.80 cr (04). The cell you get back is not the one
  you gave; its cycle count is whatever the pool's is. Store exchange cells average 200 cycles. The Mills say "the exchange gives
  you someone else's old age".
- **Sump charging:** a stall on 6 or 7 with a stolen line off the Waterhouse perimeter and a rack of grey chargers. 1 to 1.60 cr
  a cell. You leave your cell and come back; sometimes it is your cell.

**In play:** charging belongs in the **overnight** block: a charger with cells in its slots runs all night and the cells are
full in the morning. Charged by day, a charger competes for outlets and the 3 hu budget. Running a grey charger overnight
unattended carries a small chance of a swollen cell in the morning; tending it by day (an hour step spent watching it) removes
the risk. This is the day/night split in its simplest form.

### 2.6 Light

Light in the Mills is a power cost, so people are careful with it:

- **Strip lamps:** cheap LED strips on a cell or a socket, 0.05 hu an hour. Every lease has some.
- **Works lamps:** first-fit hanging lamps from the halls, cast housings, a Four in the base. Many still hang from the gantry
  rails; many are empty sockets now, their Fours long gone.
- **Safelights:** the amber founding-era fittings of Litho Run (17) and Five Hall (18), painted over in blue on 17 and still
  amber on 18, where plants grow badly under them (02).
- **Tallow candles:** insect fat, the Sump's light (04). In the Mills, for blackouts and shrines.
- **Grow light** is a separate thing (section 4).

---

## 3. Drones

### 3.1 What a drone is

A drone in the Stack is a **flying box**: a frame, four (sometimes six) ducted rotors, a controller, a cell mount, a cargo
bay, and, if it flies the lanes, a transponder. It carries goods up and down the inside of a concrete tower where there is no
sky, no satellite, no radio signal that reaches more than two floors through the steel, and in most places no light. It flies
itself on a route set before launch, because in a free shaft nobody can talk to it. (The licensed lanes are different; see 3.6.)

The parts, as a buyer meets them:

- **Frame.** The skeleton and the bay floor. Company frames are moulded composite; shaft-rat frames are whatever was strong and
  light enough: aluminium tube, old Works cable tray, the carbon spars of a Terraces folding chair. First-fit frames do not exist
  as such (the Works had no drones), but frames built on founding-era parts (a Tube capsule as a bay, lattice-composite struts
  from a strip-out) are the best in the tower.
- **Rotors.** Always ducted (a bare propeller in a riser is a propeller that has met a wall). Four ducts at the corners, folding
  on Tube-gauge frames so the drone can enter an 80 cm bore. Licensed rotors carry a chip the transponder checks; grey rotors
  fly identically and will not arm a lane (04).
- **Controller.** The brain: a sealed board that reads the sensors, holds the route and flies the motors. Company controllers
  retire at five years. **Founding-era controllers** are not drone controllers at all: they are Works **cart controllers** from
  Lines Seven and Eight, which guided floor carts through the halls on painted lines, and which shaft rats discovered in the Y60s
  will fly a drone more steadily than anything made since (the "range and steadiness" in 04). Nobody fully understands why. The
  Old Hands say the inertial unit in a cart controller was calibrated by hand, on Line Eight, by a woman named **Ilse Brannock**
  who did nothing else for nineteen years.
- **Cell mount.** One or two cells. Range is charge. A Wren on one H-cell climbs about sixty floors and comes home; on a Four, ninety.
- **Bay.** The container. Its grid size and shape are the drone's real stat.
- **Transponder.** The lane permit, in a box the size of a matchbox, paired to one frame.

### 3.2 Classes

The Stack's shafts sort drones into classes by what they can fit through, and the classes are as much law as engineering.

| Class | Fits | Typical bay | Who flies them |
|---|---|---|---|
| **Tube gauge** | the 80 cm Tube bore, rotors folded | 3x2 to 5x4 | anyone with a lane permit |
| **Riser class** | the two-metre risers, R1 to R8 | up to 6x5, odd shapes | shaft rats, Mills workshops |
| **Empty class** | Freight One's dead well (4 to 60) | 8x6 and up | almost nobody; slow, power-hungry, one bad cell from the water |
| **Skin frames** | outside the facade | sealed, small | licensed outside couriers, Crown craft, Flats runners |
| **Pocket drones** | crawlspaces, Lung trunks | 1x2 or 2x2 | vent kids, informants, the Rain Church |
| **Hoppers** | grille to grille, stairwells and riser stubs, about eight floors at most | 1x1 to 2x1 | everyone: shops, halls, households, kids (3.9) |

The Company's frames are all Tube gauge, because a Tube-gauge frame can fly anywhere and a riser-class frame can only fly free
(04 has Wren, Kestrel and Heron). Bigger bays are a **free-shaft privilege**: the most a Mills worker can move in one launch, she
moves illegally.

### 3.3 Frames you will meet

Company:
- **Halden Wren** (3x2 bay). The starter drone, sold with the shop loan. Light, quick, forgiving. The bay is exactly one Vitabrick
  crate and a slip.
- **Halden Kestrel** (4x3 bay). The working drone of the Middle. Two cell mounts.
- **Halden Heron** (5x4 bay, cold liner fitted). Standing 600 to buy. Long range, slow to spin up (3 hu per launch).
- **Halden Sparrow** (2x1 bay, document sleeve). A courier drone for paper: contracts, certificates, licences, Arbiter filings. The
  Terraces own them by the dozen. The Sparrow can enter a Tube spur without folding, which makes it the quickest thing in the
  lanes, and its bay is too small for anything but paper and a small vial. Chute Sparrows (bricked at five years) are common;
  re-flashed, they are a shaft rat's message drone.

Grey and rat-built (each one different; examples):
- **Tray-back.** A riser frame built on a length of founding-era cable tray: a long, thin 6x2 bay, very strong, heavy, slow to
  turn. Good for poles, pipe, lattice struts, rolled mesh.
- **The Ell.** A Kestrel with a broken quarter cut away and a second frame bolted on sideways: an L-shaped bay, 4x3 with a 2x2
  notch. Every Ell is a packing puzzle.
- **Strut-through.** A frame with a structural spar running through the middle of the bay: two 2x3 halves with a fixed 1-wide gap.
  Cheap and strong, and nothing longer than two squares fits.
- **Bucket.** A round-bottomed riser drone made from a Works process drum: a deep bay (counts as two layers for liquids, no
  corners). Slops less. Shaft rats use them for water and paste.
- **Capsule frame.** A Tube capsule from the old pneumatic post (a first-fit sealed cylinder) mounted as the bay. Sealed, padded,
  airtight, light, 3x2 in a pill shape with rounded corners (the corner squares are dead). Lane-legal if the transponder is
  honest. The best bay in the Stack for anything that must not get wet or be opened, and every capsule frame was made from a
  capsule somebody stole from a Tube station.

**Hook:** Halden has the capsule inventory from the Works days: 4,800 Tube capsules. The Company has been buying back capsule
frames since Y70 at good prices, in scrip, no questions. Nobody knows what it does with them. The Old Hands think the Company
wants to reopen the Tube as a pneumatic post for the Crown alone, and is quietly short of capsules.

### 3.4 Bays and inserts

The bay is a container with its own grid. Inserts change what the grid accepts; most are bought, a few are rewards.

- **Plain bay:** the frame's own floor and walls. Takes anything. Mutual will not insure it.
- **Mutual liner** (12 cr): a fitted bag. Insurable. Changes nothing else.
- **Cold liner** (90 cr): insulated, holds a cold pack slot. Required for live insects going up and R✓ greens to the Crown (04).
  Costs one square of bay for the cold pack.
- **Sealed liner** (120 cr): airtight. Vey contracts require it; soot and wet do not get in (riser jams cannot soil goods).
- **Crash liner** (40 cr, grey): foam. Required for chute dives (02); halves damage. Costs a square of bay on every side, so a 4x3
  bay becomes 2x1 inside, which is the joke and the point.
- **Bottle rack** (15 cr): a fixed insert of upright cups. Bottles in the rack cannot spill or break; nothing else fits in those
  squares. Takes a 2x2 of bay for four bottles.
- **Live box** (25 cr): vented, meshed. Insects, hens, a cat. Live things outside a live box arrive "stressed" (lower grade) or
  dead.
- **Document sleeve** (5 cr): a flat pocket on the bay lid that holds paper (slips, permits, certificates) without using bay squares.
  Two items maximum. The Crown's three-paper contracts (02) are hard without one. **In play:** this is the cheapest upgrade in
  the game and one of the most useful.
- **Dividers:** thin walls that turn one bay into fixed compartments, so a hard landing does not slide everything into one corner.
  Optional, and only matter if landings shake the bay.

**In play:** inserts make "odd-shaped bays, cold or sealed bays" (IDEAS) a matter of what you buy and fit. An insert occupies
squares of the bay grid and gives them a rule. The bay-size progression is: buy a bigger frame (Company), buy a stranger frame
(rat-built), or fit inserts.

### 3.5 Transponders and firmware locks

A **lane transponder** is a sealed box bolted to the frame. It holds the frame's serial, the owner's Ledger account, the permits
paid for, and a log of every gate it has passed. A Tube gate reads it in passing; a pad reads it on landing (which books the
pay to the Ledger, 04). The transponder is paired to one frame (re-pair at the store, 25 cr) and checks the rotors' chips
before it arms.

The locks Company firmware puts on a licensed drone:

- **Lane lock:** the drone will not enter a lane it has no permit for. It hovers at the spur hatch for ninety seconds, then comes
  home. ("Bounced at the spur.")
- **Weight lock:** a load cell in the bay floor reports weight; the Thirty read weighs the bay against the slip's manifest (02).
  A drone that weighs wrong is held.
- **Quiet Glass lock:** a geofence in the controller that refuses any route within twenty metres of the Crown's glass.
- **Curfew lock:** a licensed drone will not launch on a Crown route after 21:00 ("to respect the quiet hours"). You can still
  launch; you just cannot launch toward the people who would be woken.
- **Retirement:** the controller's five-year date.
- **Seal check:** the bay-seal tag (1 cr, single use) is read on landing; a broken seal voids insurance and fails "sealed delivery"
  contracts.

And what the Mills do about them:

- **Chipping:** cutting the licence chip out of a controller. The drone flies; the transponder will not pair; free shafts only.
- **Sheeping:** keeping the licensed shell and transponder for lane trips and swapping in a grey controller for free-shaft ones.
  Two controllers, one frame, one hour to swap. Illegal, common.
- **Ghost transponders:** cloned transponders reading as somebody else's frame (usually a dead tenant's). A ghost lets a drone fly a
  lane on another account. The account's owner pays the fees. If the owner is dead, the Ledger keeps billing a dead person, which the
  Ledger does anyway.
- **Ballast:** packing inert weight to match the manifest at the Thirty read when the real cargo weighs less (or swapping heavy
  contraband for light goods). 04's chute **ballast** sacks have this use.

### 3.6 How a drone finds its way in a shaft

There is no sky in the Stack. Satellite positioning does not reach through the lattice; radio dies within two floors in a steel
riser. A drone flies a **route** loaded before launch and checks itself against the shaft as it goes. How it knows where it is:

- **Pressure.** A barometer in the controller counts floors by air pressure. Good to a floor in still air; fooled by the Lung's
  drafts, by the Morning Fall's air push in the core, and by the R6 updraft at night.
- **Ring counting.** Every riser is ribbed with founding-era bracket rings, one per floor, at the slab line. A drone's downward-
  looking rangefinder counts rings as it climbs. A missing ring (R2 at 47, where the riser collapsed) or an extra one (rat-hole
  welds at the Combs that read as rings) means a drone that thinks it is on 31 when it is on 30.
- **Beacon ribs.** The Tube lanes have founding-era position strips at every station and spur: a pattern of raised ribs in the
  tube wall that a lane drone reads like a barcode as it passes. They are why lane drones never get lost. Some ribs are worn
  smooth; Halden paints the pattern on with conductive paint, which flakes.
- **The route card.** A strip of electret film (the same stuff as a Lung plate, section 6), charged at the Drop's plate charger
  with the Drop board's picture of one riser: which comb holes are open this week, where the nets and drips are, when the Turn
  falls. It slots into the controller and the controller trusts it. The film leaks, so a card is good for about six days (four
  in the wet R4). A stale card is not blank; it still says the comb hole at 30 is open, after Halden rewelded it on day three,
  and the drone flies at it with total confidence. That is why rats bin their cards after five days (06a).
- **The flight log.** Every drone keeps a log of what it met: pressure spikes (a Turn draught, a netted stop), ring miscounts,
  wet flags, how long it hovered at a comb. The pad copies it on landing. It is what a rat reads at the hatch, and where all
  the Drop's knowledge about the shafts comes from.
- **The feeder (lanes only).** The Tube lanes carry a leaky-feeder cable along the bore, founding-era, the kind mines use: a
  coax that radiates a short-range signal along its length. It is why a lane drone can be talked to and a free-shaft drone
  cannot. It is why Halden Lane Services employs **lane pilots**, who sit at the lane desk on 47 and hand-steer lane drones
  through spurs, hand-land them where there is no call box, and recall them when a gate fails. It is why a lane is also a
  leash: the same cable carries the Company's recalls.
- **The landing call.** At the destination, the pad (or the Perch, or the client's hatch) chirps a call tone on a short-range
  frequency. The drone homes on the call for the last few metres. No call, no landing: the drone hovers until its reserve cell
  says go home.

**In play:** most of this stays under the hood as **route trouble tables**, but two pieces surface as items:
- a **route card** (1x1, charged film, fitted in the controller slot; the **Drop card** of 06a is the same item) that holds a
  riser route; cheap ones for well-known routes, dear ones for odd floors; a drone without the right card cannot fly free to
  that floor; a fresh card softens the trouble roll, a stale one hardens it;
- the **pad's call**, which is why the destination needs a pad: contracts to floors without one need the client to have a **call
  box** (some low-floor slips include "we have no call; the drone must be landed by hand", which means a longer hover and a
  bigger chance of trouble).

### 3.7 How drones fail

Drones fail in ways people have names for. Each is a trouble result, a wear state, or a story.

- **Bounced:** turned back at a spur or gate for a permit, rotor or transponder mismatch. No loss but time.
- **Miscount:** landed on the wrong floor (a ring miscount, or a stale card). The cargo is now on somebody else's floor; their honesty decides
  what comes back.
- **Sag-out:** the cell ran low on the climb and the drone turned for home early (cold cell, old cell, overloaded bay). A
  drone that sags out in the Empty does not turn for home. It falls to 4.
- **Wet short:** condensation in R4 or a leaking bay shorts the cell mount. The drone drops to the nearest ledge and waits for a
  vent kid to find it. The kid charges a finder's fee.
- **Sooted:** rotors choked with riser soot. Speed falls a step until cleaned. Cleaning is an hour of a brush and a pin.
- **Netted:** caught in a toll net; one item from the bay lost (02).
- **Bricked in the bore:** a controller retired mid-flight. The Company says the Signal is only sent to drones on a pad. Shaft
  rats have pulled Company drones out of R1 with their controllers dead and their retirement date that morning.
- **Updrafted:** R6 at night lifts a light drone faster than its controller expects; it overshoots, sometimes to the Crown Comb, and
  comes back with a film on its rotors and its clock four minutes fast (02).
- **Wear:** every flight adds hours to the rotors' bearings. Bearings whine at about 300 flight hours and seize at about 500. A
  **rotor rebuild** (new bearings, 15 cr in parts, or an hour at Pavel Lisko's bench, see 06a) resets them.

**In play:** a drone carries a **condition** (rotor hours, frame knocks) shown as a small gauge; worse condition means slower
flights and worse trouble rolls. Maintenance is a short tended job on the bench (one hour), not a crafting step. A drone is a
container you fly, and a machine you look after.

### 3.8 Pads

A drone launches from and lands on a **pad**: a ring-shaped cradle with a charging plate, a transponder reader (licensed) and
a landing-call beacon. On the Mills floors, pads face the spur hatch (lanes) or the nearest grate (risers), and a short
**drone run** of clear squares connects them.

Pad types are in the catalogue (Halden LP-2, rat pad, Tube station cradle). Every pad has a **launch draw** (spin-up, 1 to 3 hu)
and a **capacity** (how many drones can rest on it, usually one). A second pad is the way to fly two contracts at once.

### 3.9 How common drones are

Drones are not a trade in the Stack. They are an appliance, the way bicycles are in a flat city. The lifts are slow, owned and
tolled, the stairs are long, and the Works left Calder Bay drowning in cells and rotor motors, so a **hopper** (a box, four
small ducted rotors, a cell, a cheap controller and a hook) costs a day or two of Mills wages and does the job of a
runner. On floor 17, with its three thousand people and 430 leases, about one lease in three owns one; in the Middle, nearly
every shop does; the Terraces own them by the dozen and never say so.

- **What a hopper carries on a Tuesday:** a hot lunch from the crust hall on 16 to a shop on 17; a spare cell between neighbours;
  a rent slip to the warden's box (the caged slot on every landing); a note to the mender; a child's pocket-money errand at
  1 cr a hop; the day's mail for a hot-bunk house; a screw, a fuse, a cup of sugar.
- **Where they live:** a **hopper rail** at the stairwell hatch on each landing, a charging strip along a pipe, where drones
  perch like pigeons. A hall with forty leases has thirty drones and one rail with a queue for the strip.
- **What they cannot do:** climb more than eight floors or so on a cell; fly a lane (it carries a tin dummy disc, not a transponder;
  see below); cross a band gate (the gates are netted, and the Company says so out loud); carry more than two kilos.
  Anything that needs a longer reach, a bigger bay, a lane permit or a sealed liner needs a courier frame, which is the
  price jump (a Wren is 380 cr, about twelve days of a labourer's pay) that makes the player's drone a business and not a
  toy.
- **Why the Guild tolerates them:** it taxes what climbs, and a hopper does not climb far enough to be noticed. The Guild's
  anger is for the boxes that go forty floors without paying, and the people who build them.
- **Trouble:** a hopper stolen from the air in a stairwell by a kid with a net; a hopper that fails and falls, which in a
  stairwell is a brick on a head and is why landings have a bell; a neighbour who 'borrows' yours. Bylaw 61 says every drone
  from a lease below 30 must display a lane transponder 'whether or not it uses a lane', so every hopper carries a **dummy
  disc**, a tin tag stamped with the lease number, 1 cr at any hatch. The warden counts discs when bored. Nobody has ever
  tested whether the Company can read one.

**In play:** hoppers are the world's background and the player's first tutorial. Early slips on the board are hopper-sized
errands within the player's own floor ('Spare cell, 17 to 14, 2 cr'); the player's Wren is what turns those into long-haul
contracts. Neighbours' hoppers appear on screen as small shapes moving between hatches, so the tower looks inhabited.

---

## 4. Growing: beds, medium and light

Fresh food in the Stack is grown under lamps or in the few squares of daylight there are, in beds that drink water every hour.
Everything in this section is a cost against water and power that the produce has to pay back.

### 4.1 What a grow bed is

A grow bed is a **tray of medium** (soil, coir, or mineral wool), a **water feed** (a vessel slot and a drip line, or a
reservoir and a wick), a **lamp slot** (optional, on a stand over the tray), and a **plant grid** where seeds go and plants grow
in footprint (IDEAS: the plant's footprint grows inside the bed and shoves the others). Most beds also have a **drain** that
collects what the medium does not hold, which is the difference between a bed that wastes water and one that does not.

Ways of holding water, from thirstiest to thriftiest:

- **Drip-to-waste:** water drips onto the medium and drains away. Simple, forgiving of dirty water, wastes a third. Company
  beds work this way, because Company beds are sold by a company that sells water.
- **Wick beds:** a reservoir under the medium; cotton or felt wicks draw water up as the medium dries. Loses almost nothing to
  drain. Slow to correct (overfill the reservoir and the roots drown for a day). The Mills' default.
- **Ebb trays:** the tray floods from a reservoir once an hour and drains back, pumped. Saves the most water and needs power for
  the pump (0.05 hu an hour) and a clean reservoir (dirty water fouls the pump). Co-op showpieces.
- **Drain troughs:** Wet Run's founding-era wafer-rinse troughs on 17, with drains: beds set on them get free drainage and can
  share one feed line. A property of the squares, not a machine (02).

### 4.2 Medium

- **Orrin grow medium:** sterile, light, loaded with a nutrient charge that **exhausts after one crop** (04). Reused at half yield.
- **Real soil** (from Crown planters, sold down; 04): R grade's friend. Heavy. Holds water. Full of the Crown's old roots.
- **Frass mix:** insect frass (droppings and shed skins from the insect bins) cut with coir or shredded paper. The Mills'
  fertiliser, and the place where the two food chains meet: bins make frass, beds eat it. Frass-fed beds yield as well as Orrin
  medium on its first crop, forever, but the produce cannot carry R✓ (the Grow Certificate requires Orrin medium).
- **Mineral wool:** the Works' own insulation, pulled from walls and boiled. Sterile, holds water, carries nothing. Itchy for
  weeks.
- **Spent medium:** what is left after a crop: into the insect bin as bedding, or into the frass mix.

**In play:** medium is an item that sits in a bed's **medium slot** with a **charge** (crops left at full yield). Frass is the
cheapest way to recharge it. This is the interweave that makes both food chains richer: insects feed plants, plant waste feeds
insects.

### 4.3 Grow lights

Plants need light of the right colour, for long enough, every day. In the Mills, light is a lamp on a socket or a cell.

- **Brightline** lamps (Company, 85 cr): good LED panels, 0.2 hu an hour, with a **spectrum key** per crop (90-day licence,
  10 cr, 04). Without a valid key, a **maintenance spectrum** that keeps plants alive and halves growth. A Brightline with a
  **cracked key** runs full spectrum forever, and is confiscated if found.
- **Chute Brightlines:** expired lamps from the Middle, perfectly good LEDs on maintenance spectrum. 20 cr. Many are chipped and
  re-flashed in the Sump to run full spectrum, which makes them grey.
- **Strip grow:** cheap pink strip lamps (Sump-made, from LED strip and a cell holder). 0.1 hu, two-thirds of Brightline growth.
  The light that makes Mills windows glow magenta at night.
- **Safelight:** the amber founding-era fittings on 18. Plants under them stretch and fail. (18 grows badly; 02.)
- **Daylight:** a **cut window** (02) tags squares **daylit**: a bed standing on daylit squares needs no lamp during daylight
  hours (roughly 09:00 to 16:00 in summer, 10:00 to 14:00 in winter) and grows a little better (real light has a spectrum no
  lamp quite matches; daylit produce gets a quality bump). Hanging Boxes (02) live on daylight and rain entirely.
- **Common light pipes** (first-fit): the founders lit the Plinth's halls through light pipes from skylights in the Common
  (02). When the Common was leased in Y63, most pipes were capped by stalls above. A few still run, ending in a frosted
  dome in a Mills ceiling that glows faintly at midday. A lease under a live light pipe is worth fighting for. **Hook:** the
  light-pipe map is in the Archive (A-number unknown); the Co-op wants it to know which domes could be uncapped from below.

**In play:** a lamp is an item that goes in a bed's **lamp slot** (never "near" the bed: the rule). Its spectrum and draw set
the bed's growth rate. Daylit squares and light pipes are properties of the squares a bed stands on, read by the bed.

### 4.4 What grows

Kept short (food chains are in 10). The crops the Stack grows are fast, compact, high-value per square: leaf greens (three to
four weeks), herbs, radishes, beans on strings, peppers and tomatoes (months, footprint grows large), strawberries (the Crown's
favourite, the Mills' torment), mushrooms (no light at all, in the dark and warm: Overhum's control room, 02), and sprouts and
microgreens (days, in a tray, the fastest real food there is). Grain is grown by the Co-op in a few halls and is precious.

---

## 5. Protein: insect bins, grinders, presses

### 5.1 The insect bin

An insect bin is a stack of shallow tubs in a frame, each tub a colony: substrate (bran, spent medium, shredded paper),
food (food waste from the chute, peel, crusts, East Chute scraps), a little moisture (a wet sponge, a gel brick, a cut
potato), and warmth. The tubs nest; the bottom one catches **frass** that falls through mesh. A heater mat under the stack keeps
the colony at 26 to 30 °C. Insects grow from egg to harvestable larva in weeks, so a bin is run in staggered tubs: one hatching,
one growing, one ready.

What is farmed in the Stack:

- **Mealworms** ("meals"): beetle larvae. Slow, forgiving, eat dry food and paper, do not smell much. The Orrin standard.
- **Crickets** ("chirps"): faster, noisier, need more water and more warmth, smell. The Chirp on 11 to 13 is named for them.
- **Soldier larvae** ("soldiers"): black soldier fly larvae. Eat anything wet and rotten, including what other insects will not
  (Orrin Blue does not bother them; 04), and turn it into fat and protein fastest of all. Climb out of their tubs when ready,
  which makes harvesting easy. Smell terrible. Halden classes soldier bins as "waste processing" and charges a separate
  licence for them, which is ignored below 20.
- **Roaches** ("blacks"): Sump-farmed, eat everything, survive anything. Nobody admits to eating them. Vitabrick from the Sump
  presses is suspected.

Bins fail in recognisable ways:

- **Too cold:** growth stops. Slack hour, a dead heater, a winter **air day** (in the other direction: air days make the Mills
  hot, which bins like; 02).
- **Too wet:** mould, then mites, then a die-off. The bin smells sweet, then sour.
- **Too dry:** cannibalism (meals eat their pupae). The yield falls.
- **Mites:** a dusting of moving grey on the substrate; a bin with mites must be stripped and restarted, losing a cycle.
- **Crash:** Orrin Protein Starter colonies crash after six generations (04), by design. Wild-line colonies from a rancher never
  crash.
- **Escape:** crickets get out. A lease with escaped crickets loses nothing but sleep; the neighbours lose more, and say so.

**In play:** the bin is a machine with slots: **colony** (the stock item, with a generation count), **food** (food waste items,
consumed hourly by weight), **water** (a gel brick or vessel, drawn slowly), **heat** (plugged or celled heater; or a warm floor,
02), and outputs **insects** (live, by weight, into an output slot) and **frass** (into a frass slot that fills). Left full, the
frass slot stops the bin, so the bin has the same "empty me or lose supply" rule as the chute. Overnight is its natural time.

### 5.2 Killing, cleaning, drying

Live insects are not paste. The steps between, each one a place for a cheap machine or an hour's work:

1. **Sift:** separate larvae from substrate and frass (a sieve, by hand; a rotary sifter if you own one).
2. **Purge:** a day without food so the gut empties. Skipped by bad ranchers; tastes like it.
3. **Kill:** by cold (a chiller, slow, the humane way and the Orrin way) or scald (a pot of boiling water, fast, costs water and
   power). Live insects sell to ranchers and to Crown "heritage cuisine" kitchens; dead ones go to the grinder.
4. **Dry (optional):** a dehydrator turns larvae into dry, light, shelf-stable "crisps" for the Middle's snack trade, or for flour.
5. **Grind.**

### 5.3 Grinders

A grinder turns insects (plus waste food, plus water) into **paste**. Two kinds:

- **Blade grinders:** a spinning blade in a jug. Fast, coarse, hot (heat spoils paste if run too long). Company grinders are
  blade grinders.
- **Plate mills:** a worm screw pushes material through a perforated plate against a turning knife (a meat grinder, in short).
  Finer paste, slower, cooler. First-fit pulpers from the Works (they were built to pulp separator paper, not insects) are
  plate mills of unusual quality.

Paste grades by fineness: **coarse** (bulk Vitabrick for the Sump), **smooth** (standard), **fine** (the Middle's "Vitamousse",
spreadable, sold in tubs). Fineness depends on the grinder and on how it is run: two passes on a blade grinder approach smooth
and cook a little.

### 5.4 Presses

A press turns paste into **blocks**. Pressing squeezes water out (the "press liquor", which is fed back into bins or sold as
"broth" in the Sump) and compacts the paste into a shape that keeps.

- **Screw presses:** a hand-turned screw over a mould. One block at a time; an hour of a person's labour per few blocks; good
  blocks.
- **Lever presses:** quicker, cruder. Sump-made.
- **Hydraulic presses:** a pump-driven ram, a tray of moulds. Bulk.
- **Die presses:** Orrin's licensed Vitabrick shape. A die press stamps the brand into the block. Pressing Vitabrick shape
  without a licence is infringement; pressing any other shape is legal and sells for less, "because people trust the shape" (04).

After pressing, blocks **cure**: a day on a rack in dry air firms the crust and stops them sweating. Uncured blocks go soft in a
drone bay. Curing is overnight work by nature.

**In play:** the protein chain is bin → (sift, kill) → grinder → press → (cure) → block. The machines in the catalogue each own
one step, and each step has a tended and an overnight version: grinding tended is finer; pressing tended makes better-shaped
blocks; binning and curing are overnight things.

---

## 6. Air: wells, filters and plates

Air-wells, as water machines, are in `03-water.md` (Breathe-2, Drybox, Atmos Mk I). Here, the air side.

### 6.1 The shop's air

The Mills breathe the 30 Lung's downward feed, mixed with twenty floors' return air (02): warm, dusty, damp in summer, dry
in winter, flecked with old Works dust that lifts every time a hall is swept. A lease's **vent** is a founding-era grille in
the floor tiles or the pillar casing, and a lease with a vent can fit a filter over it.

What bad air does in a workshop (if the designer wants air as a mechanic at all; 04 offers it as optional):
- **Damp** (a shop property) grows mould on stored food, paper and cloth. Mould is a state that halves value (04).
- **Dust** fouls fine work: a dusty bench makes chip repair slower and lowers the grade of reflowed boards.
- **People** stay in on bad-air days and shop less (02's Air Day).

### 6.2 Filters

- **Plate cloths:** layered cloth hung over a vent, washed weekly. Mills households make them from old workwear. Steady seller
  down the tower (02).
- **Halden filter stacks:** a Company vent machine with cartridges (30-day expiry strip; 04). Logged to the vent register in the
  Middle, unregistered and merely sold in the Mills.
- **Dust masks:** paper, cloth, or a Works respirator (first-fit, rubber gone hard, still the best; Old Hands wear theirs to
  sweep).
- **Lung plates:** the founding-era electrostatic plates from the Lungs. A plate is a 2x2 frame of film charged to hold dust,
  which works without a fan in still air and very well with one. A **spent plate** (discarded by the Company) has lost its charge
  and is caked with forty years of dust. Washed (water, a lot of it) and **recharged** (a founding-era plate charger, or an Old
  Hand who knows how to do it off a Four and a coil), it works for months. Mills households with a recharged plate over their
  vent have the cleanest air below 30.

**Hook:** the Lung plates are made of an electret film that the Works also used, cut small, in the charge eye of the No. 4
cell and in the Drop's route cards. A shaft rat who strips a spent plate for card film is stripping the same stuff that tells a Four's charge.
Somebody on 6 has noticed that a pinch of plate film mixed into fake eye paint makes a counterfeit Four's eye move a little.

### 6.3 The Lungs as a system (summary from 02, for the catalogue)

Three Lungs on 30, 60, 90; four fan rooms each; plates, scrubbers, humidity wheels; Fan Room Three of the 30 Lung dead since
Y79. When a second fan room trips, the Mills get an Air Day. The 30 Lung runs on cannibalised parts. Its plates are washed and
recharged by a three-person Company crew who are paid a bonus for every plate they declare spent, which is why spent plates
fall down the chute that still have half their life in them.

---

## 7. Screens, slates and small electronics

Near-future, cheap, everywhere, and built to die.

- **Slates:** hand-sized screens with a radio, a camera and a Ledger account. Everyone above 30 has one; most of the Mills have
  one; the Sump shares them. A slate shows your balance, your bill, your Standing, Halden Notices (a scrolling ribbon of
  Company announcements at the top that cannot be turned off), and whatever the Tower Net carries this week. Retirement at four
  years (04). A slate is a 1x1 item.
- **Boards:** the lobby board on 17 is a founding-era shift board with steel clips (02); newer floors have **notice screens**,
  big cheap displays on pillars that show the Company's posted prices, contract summaries and Halden Notices, and that die in the
  damp in two years. Dead notice screens are the commonest thing in the West Chute.
- **The Tower Net:** a Company network that reaches every floor through the Bus's data lines (first-fit) and repeaters in the
  core. It is slow below 30, dead in the Sump, and logs everything. It carries the Ledger, the Notices, the Retirement Signal,
  and a few channels of entertainment: the **Lantern Hour** (Crown news, read by a woman with a perfect voice), the **Rate
  Card** (prices), and **Calder Classics** (old films of old Calder, licensed by the hour).
- **Static receivers:** cheap radios (12 cr; 04) that pick up the pirate station from somewhere in the shafts. Radio carries
  in the risers when nothing else does, because the risers are long steel pipes. A Static receiver works best held to a riser
  grate.
- **Tallies:** the small personal tags tenants carry to clock in and out of the Turnstile and the Sixty Gate (05 may have more).
  A tally is a chip in a card, first-fit pattern, Company-made.
- **Refurbishing:** Odile Fenn on 17 (02) is the archetype. A chute screen usually has one of three faults: cracked glass (a new
  pane, salvaged from a worse screen), a dead backlight (an LED strip, an hour with a heat gun), or **Retirement** (a flash rig and
  a master key, or a chipped licence chip and a grey firmware load; 04). Refurbished screens sell in the Mills and the Sump, and
  a refurbished screen showing the Tower Net without the Notices ribbon is the most popular grey good in Four Hall.

**In play:** small electronics are the main **repair** loop that does not involve food: chute item in, a tended hour or two on a
bench with the right tool, a working item out at Rc grade, sold to grey clients. Screens are also the **reward** most often in
low-floor drone bays: a Sump client pays in a cracked slate.

---

## 8. The founding-era systems, and how they fail

### 8.1 What made them special

The founders (Marrow Teague's office and Halden's own engineers, see 01) built the Stack's plant with four habits that
nothing since has shared:

1. **Overbuilt.** Everything was rated for twice its load and five times its life. A Sorrel meter was meant to last two
   centuries (04). The Bus was sized for a Works twice as big.
2. **Self-reporting.** Every tile, meter, tap and fan reported to the engineers through the Bus. The tower was built to tell
   somebody what was wrong with it. Since Y41 it has been telling the Ledger, which only listens to the numbers that bill.
3. **Self-healing where possible.** Mendstone grew calcite into its own cracks (02). Lung plates could be recharged in place.
   Kessin cars rerouted around a dead motor segment. The founders designed for a tower that would be maintained, and they
   designed the maintenance to be small.
4. **Knowledge kept in a room.** "Documentation stays in Document Control" (06a). The machines were open; the manuals were
   locked. The Works trusted its own staff with the parts and nobody with the whole.

The fourth habit is why the first three are failing. A self-reporting tower reports to nobody who understands the reports. A
self-healing wall needs a nutrient wash that nobody has the recipe for (the M-FEED tanks; 02). An overbuilt machine outlives
everybody who knew how it worked.

### 8.2 How first-fit fails: the four patterns

Old Hands describe founding-era failure in four ways, and once you hear them you notice them everywhere.

- **The long fade.** A first-fit system does not stop; it drifts. Meters over-read by 3 to 8 per cent (04). Lung plates hold
  less dust each year. The grey's seams turn from white to tan to brown (02). Kessin cars take a second longer at each stop.
  Nobody notices any single year. Over forty, the tower has slowed, dimmed and soured, and the Company bills for the same
  service.
- **The orphan.** A system works until one part fails for which there is no spare: a drive chip, a fan bearing, a membrane
  cartridge (03). Then it stops completely and forever, unless a part is found. Freight One (Y71) and Fan Room Three (Y79)
  are orphans. Every orphan makes the parts of its own body valuable: Freight One's rails keep Old Two running.
- **The cannibal loop.** Parts are taken from one failing system to keep another going, which makes the first fail faster,
  which frees more parts. The 30 Lung runs on Fan Room Three's parts. The Locals run on Freight One's. The Company calls this
  "consolidation of heritage assets". The Old Hands call it "eating the house".
- **The wrong fix.** A first-fit part is replaced with a Company-new one that fits the hole but not the system. A plastic meter
  on a founding-era pipe; a steel bracket on a cracked lattice member (the lattice does not like steel; 01); a Bastion bearing in
  a Kessin motor. The new part fails differently and takes something founding-era with it. Hollis Brandt (3307) keeps a list.

### 8.3 System by system

**The Sorrel meters.** A brass-faced counter with a glass eye: inside, a ring of numbered drums turned by a tiny impeller
(water), an induction disc (power) or a vane (air), and an optical reader under the eye that reports each drum turn up the
Bus. A No. 2 button cell keeps its clock. Failure: drift (always upward), seal breakage in the damp (fine; 04), button death
(stops reporting: estimated billing; 02), impeller scale (water meters over-read by more as they scale; Mills water is hard).
**In play:** a meter is a fixed machine on your lease with a hidden **drift** ("?") that an analyser or Hollis Brandt can
reveal; a meter with known high drift is a grievance you can take to the Meter Hall on 38 (a contract with yourself as client,
a morning of hours, a small refund in credit notes).

**The Kessin lifts.** Linear-motor cars on magnetic rail segments, each segment with its own drive chip. Failure: a segment's
chip dies and the car cannot pass it; the Guild bypasses it by hand with a crank, which takes four men and an hour, or replaces
the segment with one cannibalised from a dead core (02, 06a). Drive chips were made on Line Six. **Hook:** Line Six's chip
masks were among the drawings the Lunch Tin clerks did not save. If the Clean Core makes chips (the Alternative in 01), it could
make Kessin drive chips. The Lift Guild has thought of this.

**The Lungs.** Fans, plates, humidity wheels, scrubbers. Failure: fan bearings (orphan parts), plate charge (long fade), wheel
seals (wrong fix: the Company's replacement seals leak, so humidity in the Middle has crept up for twenty years). **In play:**
Fan Room Three (02) is the late-game chain.

**The chute compactors (the Jaws, floor 8).** Three founding-era compactors in the Bale Hall, each a steel box the size of a
room with a hydraulic ram, built to bale recyclables for the Works. They still run on the tide surges. Failure: the rams'
seals leak hydraulic fluid into the Sump (the "red" in the Bale Hall's puddles), the timing has drifted so that the jaws close
eleven seconds early (bale pickers have lost fingers to the eleven seconds), and Jaw Two stalls on anything with a founding-era
lattice strut in it, which it cannot crush. **Hook:** Jaw Two's stall is how the Bale Hall finds first-fit salvage: when it stops,
there is something in it worth stopping for. A "Jaw Two stop" is a thing bale pickers listen for.

**The Reclaim sorters (59).** Founding-era magnetic and optical sorters, built to pull Works-numbered parts out of the refuse
stream for reuse. They still pull anything with an HW number, which means the Company takes first pick of every first-fit part
anybody throws away. A **Reclaim Fault** (02) lets them through to the Mills. Failure: optical sorter lenses fogging (long fade),
so year by year more HW parts slip past. The Reclaim crews have noticed. So have the Mills catch-holders on 28 and 29.

**The Tube gates.** Transponder readers bolted into the founding-era capsule stations. The gates are Company-new; the stations
are first-fit; the beacon ribs are first-fit. Failure: worn ribs (drones misread stations), and the gates' readers fail in the
damp, at which point the gate "fails closed" and holds every drone (a **Gate Hold** event: lanes stop for hours, free shafts
fill up, shaft rats charge double).

**The Bus and the Steps.** Covered in 02. Failure is rationing, not breakdown: the Steps shed load from the bottom (slack hour,
dawn slack). The Bus itself has never failed, and nobody alive knows what its sheath is made of.

**The Dark Floors, as machinery.** What a lights-out line needs to run for forty-five years without people: robotic handling,
self-cleaning, spares on hand, a supply of ultrapure water (Process Line 3, 02), power (the Bus at night), raw materials (the
unanswered question), and somebody, somewhere, who replaces the parts that robots cannot. Ruth Amadi's clue (06a): the
cycle in there is nineteen minutes, not the forty of cell formation. Things with a nineteen-minute cycle in a cell-and-chip
works: wafer exposure in lithography; the electret charging of film (Lung plates, charge eyes, route cards all share it); a
Kessin drive chip's burn-in. **Hook:** not one of those is a cell.

---

## 9. Repair culture

### 9.1 Who repairs

- **The Old Hands** (06a): founding-era, by ear and by hand, signed with a clock number. Slow, cheap in credits, dear in favours,
  and getting fewer every season.
- **Fourers:** the repair trades of floor 17. Chip work under magnifier arms at the Works Benches, screen refurbishing, cell
  re-terminating, controller swaps. Licensed shops in the Middle charge ten times a Fourer's rate and send the hard jobs down to
  Four Hall anyway.
- **Sump fixers:** grey builders. They do not repair things so much as make new grey things from old pieces. A Sump fixer will
  build you a charger, a pad, a drone, a still. It will work. It will be unlike anything else.
- **Halden Service:** the company store's repair desk on 18 and 27. Replaces whole units at a "service exchange" price, about
  60% of new. Does not repair first-fit ("not supported"), does not repair grey ("unsafe"), does not repair anything past its
  Retirement date ("end of life").
- **You.** The player's bench work: tended hours, the right tool or machine, a part if needed.

### 9.2 Manuals

The Works printed manuals for every system, kept them in Document Control, and pulped most of them in Y41 (06a). The ones
that survive are the Lunch Tin copies in the Archive, wet binders from the drowned floors, and a few that walked home in a
lunch tin and were never handed in.

A manual tells you: what the test points are, what the settings are, what the parts are called (with HW numbers), and what
is supposed to happen. It does not tell you what was changed on the floor and never drawn. For that you need the margin notes
(the **Red Binder**; 06a) or an Old Hand.

Manual types the player could hold (each a **1x2 or 2x2 binder**, per 06a's rule that a manual reveals one hidden setting or
feature on every machine of its type you own):
- **Sorrel Meter Service Manual (HW-3-M02):** reveals meter drift on your own meter; teaches the seal-safe button change.
- **No. 4 Cell Handling Card (HW-4-C11):** a single laminated card, not a binder. Reveals a Four's health at a glance. Old Hands
  carried them in their top pockets. 1x1.
- **Cart Controller Calibration (HW-7-K40):** reveals the hidden steadiness of a founding-era controller; lets you swap one into a
  frame without losing it.
- **Works Pulper Maintenance (HW-1-P19):** the toolroom manual for the separator-paper pulpers; doubles a pulper's life.
- **Lung Plate Recovery Procedure (HW-2-L07):** how to wash and recharge a plate. The most copied manual in the Archive.
- **Tube Station Operations (HW-2-T01):** the pneumatic post's manual. Explains the beacon ribs. Shaft rats would pay for it;
  the Company would pay more to stop them.
- **Line Nine Process Book, vol. 3 (no HW number):** **Hook.** Nobody has seen it. Drawing Set 22's companion.

### 9.3 Cannibalising

Parts come from other machines. The Mills have a vocabulary for it:

- **Donor:** a dead machine kept for parts. A lease with a donor in the corner is a lease with spares.
- **Strip-out:** the removal of founding-era fittings when a Middle or Terraces flat is "refreshed" (renovated). Strip-outs are
  the main legal source of first-fit parts: the Company owns them, sells them through the Reclaim, and fitters pocket the
  small ones.
- **Pulling:** taking a part from something in use, usually something public. Pulling a lease stud darkens a square (02).
  Pulling a Tube capsule makes a capsule frame. Pulling a Works lamp's Four leaves a hall darker.
- **Matching:** finding a part from a different machine that fits. The toolroom (1000s) Old Hands are masters of it: "There
  are no new Type 9 bearings. There is a Type 9 bearing inside every Kessin door motor, and there are a lot of doors that
  don't open any more."

**In play:** a machine can carry a **missing part** (a hidden feature revealed by an analyser or an Old Hand: "needs HW-1-B09,
bearing, Type 9"). Missing-part machines run at a penalty or not at all. The fix is finding the part (chute, salvage, Exchange
dealers on 28, a contract reward) and an hour at the bench. This is a repair loop, not crafting: the machine is bought and
whole; it is just broken.

### 9.4 Rules and risks

- **Clause 9 (socket terms, 04):** no unlicensed charging. Grey chargers are a breach.
- **Clause 11 (fixtures):** the Works Benches and all founding-era fixtures belong to the Company. Opening a fixture (a meter,
  a vent, a tap post) is "interference with Company plant". Fixing one is also interference.
- **Brand protection** (04, 05): restoring a voided branded device is illegal to sell.
- **"Heritage recovery":** any first-fit part found is, in law, Company property. The Company pays a **recovery bounty** in
  scrip for parts handed in (a Four: 120 scrip; a capsule: 80; a Lung plate: 40), which is a third of what the Old Hands pay and
  a sixth of what a fixer gets. Handing in is safe and boosts Standing a little. Selling elsewhere is not.

**In play:** every first-fit part the player finds has **three buyers** with three prices and three consequences: the Company
(low, scrip, safe, Standing), the Old Hands or the Co-op (middle, credits and favours, the tower is better for it), a penthouse
fixer (high, credits, the part goes up to the Crown and its system below runs one part shorter). The game never says which is
right.

---

## 10. Instruments: seeing what is hidden

The IDEAS analyser (a machine with a slot that reveals hidden features over hours, each kind of analyser revealing different
things) fits the Stack exactly, because the Stack is full of things that lie: meters, cells, grades, voids, provenance. Every
item may carry hidden features shown as "?" until revealed. Instruments reveal them.

### 10.1 What can be hidden

| On a... | Hidden features |
|---|---|
| Cell | charge (H-cell, without a gauge), cycle count, health, plant code, swollen inside, counterfeit |
| Founding-era part | HW number legibility, revision, wear, missing sub-part, a clock number inside |
| Machine | missing part, a setting you did not know it had, drift, a grey chip under a Company shell (a sheep) |
| Food | real or real-washed (04), Orrin Blue residue, mould starting, pesticide (Greenhold seed) |
| Water | grade, trike, metals (03) |
| VOIDed goods | bad-valet void (near-whole underneath; 04), the stamp shadow |
| Paper | legibility (wet), A-number match, forgery |
| Drone | rotor hours, transponder pairing, controller retirement date, a ghost transponder |

### 10.2 Instruments people carry

Tools work from wherever they are carried (IDEAS): these are **tools**, not machines, and give a quick, partial reveal.

- **Cell sipper** (Mills slang for a load tester): a probe and a needle gauge. Touch it to a cell's terminals for a few seconds;
  it shows true charge and whether the cell sags under load (a tired cell). 1x1, 15 cr. Reveals charge and health, not cycle count.
- **Eye glass:** a jeweller's loupe. Reveals marks: HW numbers, date codes, clock numbers scratched inside, stamp shadows,
  solder style (Mattias Orme can tell first-fit from copy by solder alone). 1x1, 6 cr; a first-fit Works loupe, 40 cr.
- **UV torch:** shows VOID stamp shadows on "almost new" goods, Orrin Blue residue, and some forged certificates (the Archive's
  stamp ink fluoresces; copies do not). 1x1, 20 cr.
- **Spectro wand** (04): checks real versus synthetic. 120 cr. Penthouse fixers carry the good ones.
- **Sounding rod:** a steel rod and an ear. Put one end on a housing and the other to your skull (the Old Hands' screwdriver
  trick, 06a, made into a tool). Reveals bearing wear and, on some machines, the missing part. Free, if you know how; useless
  if you do not (it needs a skill unlocked by an Old Hand's teaching).
- **Surveyor's wand:** reads lease studs (02). Company issue. Grey copies exist and find dark squares.
- **Scale:** weighs. Reveals counterfeit Fours (too light), water content in paste, ballast in a bay. Every shop has one.

### 10.3 Analyser machines

The machines are in the catalogue (Sorter's scale, Lens box, Test bench, the Works QA cabinet, the Cress tray in 03). They take
an item into a slot and reveal **one hidden feature per hour** when tended (a quick scan) or **all their kind of features
overnight** (a deep scan). Each kind sees different things: a scale sees weight and metal; a lens sees marks; a bench sees
function; a QA cabinet sees nearly everything, slowly.

**Analysed** items sell at full price; blind items sell at a discount to careful buyers and full price to careless ones. A
penthouse fixer will not buy a first-fit part without either an analysis slip or a provenance certificate.

**Living analysers:** the Old Hands' Bench at the Canteen (06a), reached by drone with a clock badge in the bay; the Archive's
provenance service; and the **cell graders** of the Exchange on 28, who will grade a box of cells in an afternoon for 1 cr a
cell and write the grade on each in grease pencil.

---

## 11. The machine catalogue

Machines are **bought, never built**. Each one is a unit on the field with a footprint, slots, a power and water draw, a speed,
a capacity and an output quality, and it behaves differently when **tended** (by day, an hour step at a time, with the player's
attention) and **overnight** (the night passes in one block, unattended). Company machines are identical to each other; relics
and grey machines are one-of-a-kind, so every entry for those is "a typical one", and the one the player finds will differ.

**Conventions used below:**
- **Size** is the footprint on the shop grid, in squares. Every square costs rent.
- **Draw** is power in hu per hour while running (Mills tariff 0.80 cr/hu, Peak Window 1.20; 04). "Celled" means it has a cell
  slot and can run off a cell instead of an outlet.
- **Water** is litres per hour drawn from a vessel in its slot (Halden Pure costs 1.20 cr/L at the Mills tap; 03).
- **Quality** of output: **Bulk** (Sump and Mills buyers), **Standard** (the Middle), **Fine** (Terraces and Crown). Tended work
  tends to Fine; overnight work tends to Bulk (IDEAS).
- **Origin:** Company / Grey / First-fit (section 1).
- **Where:** the Hatch on 18 (Company stock, delivered on Old Two in one to three days; 02), the Exchange on 28 (dealers in
  first-fit and used), Sump fixers (6 and 7), Old Hands' estates (when one dies; 06a), contract rewards (in a drone bay, if it
  fits), Flats salvage (07).
- **Price:** Mills credits, new or typical.

### Power

#### 1. Halden ChargeDock 4 *(Company)*
**Size** 2x1 · **Slots** 4 cell slots · **Draw** 0.5 hu per cell per hour · **Speed** H-cell full in 4 hours
- **Tended:** nothing to gain; it cannot be hurried.
- **Overnight:** fills every H-cell in it. Never swells a cell. Logs every charge to the Ledger.
- **Quirks:** refuses End of Service cells, Fours, re-terminated cells and anything without a chip ("Cell not recognised. Please
  visit your Halden store."). **Eco Pause:** during the Peak Window it pauses charging "to help you save", which cannot be turned
  off, so a dock loaded at 17:00 is two hours behind by morning. A cell charged on it reads **Certified** to every licensed
  machine.
- **Lore:** the store's best-selling machine. Most Mills households have one and a grey charger behind it.
- **Price:** 95 cr.
- **In play:** the safe default, and the reason players learn what "Certified" means: a grey-charged cell runs a Brightline at
  70%, a dock-charged one at 100%.

#### 2. The Leech *(Grey)*
**Size** 1x1 · **Slots** 3 cell slots (any cell with terminals) · **Draw** 0.7 hu per cell per hour (wasteful) · **Speed** H-cell in
3 hours, a Four in 2, a brick in 6
- **Tended:** watch it and nothing goes wrong. A tended Leech can also **top** a Four (charge it slowly to 100% instead of the
  usual 95%).
- **Overnight:** charges anything, does not stop at full. Each night, each H-cell left in it has a small chance (about 1 in 15)
  of coming out **swollen**. Fours never swell.
- **Quirks:** hums in B flat. Charges End of Service cells. Cells it charges flag "Uncertified".
- **Lore:** named for the Sump stall on 7 where the pattern comes from, which charges cells off a stolen line from the
  Waterhouse perimeter. Every fixer on 6 and 7 makes Leeches; no two have the same case. Most are Works rectifier blocks in a
  cooking pot with holes drilled for air.
- **Price:** 35 cr in the Sump, 45 in the Mills.
- **In play:** the first grey machine most players own: cheap, useful, illegal (Clause 9), risky only if you leave it alone.

#### 3. Rack 40 (formation rack segment) *(First-fit)*
**Size** 3x1 · **Slots** 6 cell slots · **Draw** 1.2 hu per hour while running · **Speed** slow: one full cycle overnight
- **Tended:** none. It runs a programme; it does not want company.
- **Overnight:** charges any cell gently and fully, **and re-forms** a tired cell: once in a cell's life, a night in the Rack
  restores a tenth of its lost capacity (a 1.6 hu H-cell comes out at 1.75). Charges Fours to a true 100% with a gold eye.
  Reads each cell's health on a row of founding-era lamps above the slots, so it doubles as a **cell analyser** for health.
- **Quirks:** runs on Works time (four minutes fast, from its sync node). Will not start a cycle after 22:04 Works time, the old
  night-shift cutoff; load it before then or it waits until the next evening. Warm along its whole length.
- **Lore:** a segment of the long heated shelving where new cells took their first charge on Line One, on floors 11 to 13 (02).
  The insect ranchers ripped most of it out after Y58 for bin shelving. The Old Hands saved a few segments. Every surviving Rack
  has a Line One shift number painted on its end.
- **Price:** 1,100 cr at the Exchange, if one is there. Ranchers will pay more to put bins on it.
- **Missing part (common):** a Rack segment often lacks its **controller card** (HW-4-F22) and will only charge, not re-form, until
  one is found.
- **In play:** the relic that makes cells an investment. Everything else in the cell chain sells cells; the Rack keeps them.

#### 4. Tide bank *(Grey, Co-op pattern)*
**Size** 2x3 · **Slots** 2 outlets of its own, 1 charge line · **Holds** 20 hu · **Draw** 3 hu per hour while charging
- **Tended:** switching it by hand lets the player charge at exactly the surge hours and discharge at exactly slack.
- **Overnight:** a timer (chalked tide table, set each evening) charges it in the night's surge. If the timer is wrong (the
  tide drifts fifty minutes a day; 02), it charges at the wrong hour and runs flat in the morning.
- **Quirks:** charging at 3 hu an hour uses the whole socket board's budget for that hour. It is heavy, ugly and wonderful: two
  outlets that never go dead during slack.
- **Lore:** the Co-op builds them from strapped bricks in a steel locker. The pattern came out of Two Hall in Y61, the Dry Year,
  when the Co-op ran its first block tank pumps off one.
- **Alternative:** if the designer takes 02's Alternative (power as price, cheap at surge and dear at slack), the tide bank becomes
  a pure arbitrage machine: buy at half, use at double.
- **Price:** 420 cr, or 300 cr plus Co-op standing.
- **In play:** the answer to slack hour and dawn slack that costs squares instead of a Four.

### Drones and pads

#### 5. Halden LP-2 launch pad *(Company)*
**Size** 2x2 · **Slots** 1 drone · **Draw** 2 hu per launch; 0.5 hu per hour charging a docked drone's cell
- **Tended:** a pre-flight check (one hour) reveals the drone's condition and any bay-seal problem before launch.
- **Overnight:** charges the docked drone. Will not launch on Crown routes after 21:00 (curfew lock).
- **Quirks:** reads the transponder, books the pay to the Ledger on landing, logs every launch and every return; refuses to
  launch a drone with grey rotors into the spur (it will launch it toward a grate, logged as "non-lane departure", which is
  information a warden can buy). Landing call beacon built in.
- **Lore:** sold with the Wren in the shop loan bundle (04: 540 cr for both).
- **Price:** 160 cr alone.

#### 6. Rat pad *(Grey)*
**Size** 2x2 · **Slots** 1 drone · **Draw** 1 hu per launch (a "throw start": a spring arm pitches the drone into the air, so the
rotors need less spin-up)
- **Tended:** hand-launching is safe and quiet.
- **Overnight:** n/a; it does not charge.
- **Quirks:** no transponder reader, no Ledger booking (free-shaft contracts pay in the bay, in chits or goods). The landing call is
  a bell on a string and a chalk ring. About one landing in twenty misses the pad and comes down on the floor next to it: the bay is
  shaken (fragile goods may break; liquids in a bottle rack are safe).
- **Lore:** every shaft rat has one, built from a drum lid and a door spring.
- **Price:** 60 cr.
- **In play:** the pad that makes free-shaft flying cheap and invisible to the Ledger. Owning one and an LP-2 is owning two
  routes.

#### 7. Tube station cradle *(First-fit)*
**Size** 3x2 · **Slots** 2 drones (the old in and out cradles) · **Draw** 1 hu per launch with its pneumatic assist working; 2 without
- **Tended:** a tended landing runs the cradle's **trim cycle**: the beacon ribs in the cradle mouth recalibrate the drone's
  controller, and the drone's condition improves by one step per landing (rotor hours do not drop; steadiness does).
- **Overnight:** holds and charges two drones. Its pneumatic assist needs compressed air from a tank that refills slowly from
  its own pump (0.2 hu per hour, overnight only).
- **Quirks:** it is a capsule station. It wants capsules. A drone with a capsule bay docks perfectly; others dock "loose" and get no
  trim. It still listens for a founding-era dispatch code on the Bus, and once in a while it opens both cradles for eight seconds
  as if receiving a capsule, which no one has sent.
- **Lore:** the Tube had a station every ten floors; the Company bolted gates into most of them in Y58 and removed the cradles.
  A few cradles were sold as scrap, a few were stolen, one is in the Old Hands' hall on 19, and one is in the lease of whoever
  can afford it.
- **Price:** 2,400 cr at the Exchange. The Company buys them back "at heritage rates" (900 scrip).
- **Hook:** the eight-second openings come in sequences. Somebody has written them down on 19: they match the old Tube dispatch
  codes for "Stores, 17-C".

#### 8. Rotor bench *(Company / Grey)*
**Size** 2x2 · **Slots** 1 drone, 1 part · **Draw** 0.2 hu per hour
- **Tended:** an hour on the bench cleans soot (speed back), checks bearings, and with a bearing kit (a part item, 15 cr) resets
  rotor hours. Swapping a controller (sheeping; section 3.5) is also an hour here.
- **Overnight:** nothing. Bench work is attention.
- **Lore:** a stand with clamps and a spin tester; Pavel Lisko's (2210) has a sounding rod bolted to it.
- **Price:** 70 cr.

### Growing

#### 9. Orrin GrowBed G1 *(Company)*
**Size** 2x3 · **Inside** a 4x2 plant grid · **Slots** vessel (water), medium, lamp, certificate · **Water** 0.3 L/h (drip-to-waste) ·
**Draw** whatever lamp is fitted
- **Tended:** pruning and training (an hour) lets a large plant's footprint grow upward rather than outward in the grid: less
  shoving.
- **Overnight:** waters and grows. The lamp runs on a timer (lights off from 22:00 to 06:00, by the Orrin schedule, "matching
  natural rhythm"; it cannot be changed).
- **Quirks:** reads the chip on an Orrin seed packet and logs the variety to the Grow Certificate. Saved seed in a G1 is not
  refused; it is **logged as "unregistered variety"**, which voids the Certificate on that bed for the quarter. The drain dumps a
  third of the water.
- **Lore:** the bed Orrin sells with every Grow Certificate. White, rounded, a green status light.
- **Price:** 220 cr; 300 with a Brightline fitted.
- **In play:** the only bed that can give R✓ produce without fraud (Orrin medium + OneCrop seed + Halden Pure + Certificate). Pays for
  itself only if you sell up.

#### 10. Wick tub *(Grey)*
**Size** 2x2 · **Inside** a 3x2 plant grid · **Slots** reservoir (holds 10 L), medium, lamp · **Water** 0.15 L/h, nearly no waste
- **Tended:** topping up the reservoir exactly prevents the overfill drown.
- **Overnight:** grows steadily. If the reservoir was overfilled in the evening, the roots drown: growth stops for the night.
- **Quirks:** takes any water (grey water works, at a quality cost). Slow to respond: a bed dried out takes a day to recover.
- **Lore:** a bathtub, a water tank, a Works parts tray. The commonest bed in the Mills; Wet Run is lined with them.
- **Price:** 40 cr.

#### 11. Two Hall ebb tray *(Grey, Co-op pattern)*
**Size** 3x2 · **Inside** a 5x2 plant grid · **Slots** reservoir (20 L), lamp ×2, medium (mineral wool or frass mix) ·
**Water** 0.1 L/h · **Draw** 0.05 hu pump + lamps
- **Tended:** draining and cleaning the reservoir (an hour, every few days) keeps the pump clean and growth at its best.
- **Overnight:** floods and drains every hour. If the reservoir water is grey and dirty, the pump **fouls** (a status: no flooding,
  the bed dries) by the third night.
- **Quirks:** the best water-per-produce of any bed. Fragile: slack hour stops the pump, and a long slack dries the bed.
- **Lore:** Yusra Dimitriou (02) has eight of them on Wet Run. The Co-op lends the pattern to members and the pumps come from the
  Crib.
- **Price:** 260 cr, or a Co-op loan against produce.

#### 12. Teague planter *(First-fit)*
**Size** 2x2 · **Inside** a 3x3 plant grid · **Slots** soil (real soil only), reservoir (40 L, sealed) · **Water** 0.05 L/h
· **Draw** none
- **Tended:** none needed; turning the soil (an hour) gives a small quality bump.
- **Overnight:** waters itself through a founding-era capillary ceramic that loses almost nothing.
- **Quirks:** no lamp slot. It was built for the sky. On daylit squares or under a light pipe, it grows at full rate and its produce
  carries a **quality bump** (Fine is possible); under no light at all, nothing grows. A grey lamp arm can be clamped to it, which
  works and which every Old Hand who sees it finds offensive.
- **Lore:** cast for the Common (the Shelf, floor 30) in Y0, one of 120, Marrow Teague's own design, with "THE COMMON" cast on one
  face. When the Common was leased in Y63 the planters were sold off; most went up to the Crown's heritage gardens. A few stayed in
  the Mills.
- **Price:** 900 cr; a Crown fixer pays 1,500.
- **In play:** a reason to rent a cut window. Also a choice: it is worth more as a sale up than as a bed, unless you have the
  daylight.

#### 13. Sprout drum *(Company)*
**Size** 1x2 · **Slots** seed (any), water (vessel) · **Water** 0.05 L/h · **Draw** 0.05 hu (turning motor) · **Speed** 2 days
- **Tended:** rinsing by hand (an hour) gives Fine sprouts.
- **Overnight:** turns, rinses, sprouts.
- **Quirks:** no light. Sprouts are real (R) produce with a short life (they go stale in a day). The fastest real food.
- **Lore:** Orrin sells it as the "Kitchen Garden" to the Middle. The Crown buys sprouts as "living garnish" by the tray.
- **Price:** 55 cr.
- **In play:** the first real food a player can sell up, and the lesson that real food spoils.

#### 14. Mushroom cabinet *(Grey)*
**Size** 2x2 · **Slots** substrate ×4 (spent grow medium, spent insect substrate, paper pulp, coffee grounds), spawn ·
**Water** 0.05 L/h (misting) · **Draw** 0.1 hu
- **Tended:** picking at the right hour (a flush peaks for one hour) gives Fine caps.
- **Overnight:** grows; a flush left unpicked overnight opens and drops to Standard.
- **Quirks:** dark and humid inside. The substrate is the waste of the other two chains, which is the point. On a warm floor it
  needs no heat.
- **Lore:** the grower in the old Line Nine control room on 27 (02) runs twelve of them and asks no questions.
- **Price:** 120 cr.

### Protein

#### 15. Orrin Bin B3 *(Company)*
**Size** 2x2 · **Slots** colony, food (3 kg), water (gel brick), heater (built in), frass drawer (holds 2 days' frass), output ·
**Draw** 0.3 hu heater (celled: one cell slot can run the heater instead) · **Speed** a tub ready about every 2 days in rotation, about 1 kg live insects each
- **Tended:** sifting by hand (an hour) gives clean larvae (Standard instead of Bulk at the grinder).
- **Overnight:** the natural mode: eats, grows, warms.
- **Quirks:** the frass drawer is small; a full drawer stops the bin. Warranty void with non-Orrin colonies (it works anyway). Plugged,
  the heater cuts out in slack hour and the bin's growth stops for that hour; celled, it runs on.
- **Lore:** Orrin's starter bin, sold in the shop loan bundle (04).
- **Price:** 180 cr.

#### 16. Rancher's stack *(Grey)*
**Size** 2x3 · **Slots** colony ×6 tubs, food (6 kg), water, heat (an empty slot for a heater mat item), frass tray (big) ·
**Draw** 0.3 hu with a mat; 0 on a warm floor · **Speed** 0.5 kg per tub per 2 days
- **Tended:** turning tubs and culling dead ones keeps the stack from mites.
- **Overnight:** grows. Without heat it grows at a third.
- **Quirks:** crickets escape from it (a lease state: **chirping**, harmless to the player, costly to Gus Tanaka-Breen's sleepers
  next door, who complain to the warden). Six colonies means six different lines can be kept at once, wild or Orrin.
- **Lore:** shelving from the Chirp, often from a gutted Rack 40, which is a small tragedy if you know.
- **Price:** 90 cr; on floor 21 they come with the lease.

#### 17. Soldier tower *(Grey)*
**Size** 2x2 · **Slots** food (8 kg, anything wet: rot, Blue-voided food, mouldy goods, press liquor), output (larvae
self-harvest), leachate (a liquid outlet) · **Draw** 0.1 hu · **Speed** fastest of all bins: about 1.5 kg larvae per day at full feed
- **Tended:** nothing; it tends itself, the larvae climb a ramp into the output when ready.
- **Overnight:** eats everything.
- **Quirks:** smells. A lease with a soldier tower carries a **smell** state that lowers shelf sales to Middle-bound passers by a
  step (a shop property, like damp). Its **leachate** ("tower tea") is a liquid fertiliser that doubles as medium recharge for a bed.
  Halden licenses soldier towers as "waste processing", 15 cr a month, ignored below 20.
- **Lore:** the Sump's favourite bin. Soldier larvae do not care about Orrin Blue (04), so a tower turns the Crown's denatured food
  into protein.
- **Price:** 140 cr.
- **In play:** the bin that eats what nothing else can, and the moral edge of it: insects fed on Blue-voided bread are legal feed,
  and the paste made from them is legal paste.

#### 18. Mincer M8 *(Company, made by Pryce & Mund under Halden licence)*
**Size** 1x2 · **Slots** hopper (4 kg), output (paste) · **Draw** 0.8 hu while running · **Speed** 4 kg per hour
- **Tended:** the only mode. One hour per batch, coarse paste. A second pass (another hour) gives smooth paste, but cooks it a little
  (smooth with a "cooked" note that lowers the press's yield).
- **Overnight:** refuses. An **auto-shutoff** stops it after ten minutes unattended ("for your safety").
- **Quirks:** after slack hour or any power cut it must be **reset** by holding a button for ten seconds, which in game terms costs the
  next hour. Blade wears; the store sells blades (12 cr, every 200 kg).
- **Lore:** Pryce & Mund are a Vantage-tower appliance maker licensed into the Stack. Their name on a Halden machine is something
  Middle buyers find reassuring and Mills buyers find suspicious.
- **Price:** 220 cr.

#### 19. Works pulper *(First-fit, Oduya Process)*
**Size** 2x2 · **Slots** hopper (10 kg), water feed, output · **Draw** 0.5 hu · **Speed** 3 kg per hour tended; 10 kg overnight
- **Tended:** fine paste in one pass, cool, no cooking. The plate can be changed (three plates come with a complete unit: coarse,
  smooth, fine; most units are missing one).
- **Overnight:** a slow, steady run: up to 10 kg of smooth paste by morning.
- **Quirks:** it was built to pulp **separator paper**, not insects, and it still pulps paper: shredded chute paper and cardboard
  come out as pulp for frass mix, mushroom substrate or the Archive's paper repair. Often carries a hidden **missing part**: the
  Type 9 bearing (section 9.3). Without it, it runs at half speed and shrieks.
- **Lore:** made for Line Three by **Oduya Process**, a founding supplier on the mainland that drowned with old Calder. The Works
  had forty. The Press on 11 (Orrin's first line) used six until Y70; Orrin replaced them with its own and sold the pulpers as
  scrap to the Mills.
- **Price:** 1,400 cr complete; 600 without its plates.

#### 20. Screw press *(Grey)*
**Size** 1x1 · **Slots** paste in, die, blocks out · **Draw** none
- **Tended:** one hour, 4 blocks, well shaped and dense (Standard; Fine with fine paste).
- **Overnight:** cannot run. A screw is turned by hand.
- **Quirks:** takes any die. The press liquor drips out of a spout into whatever vessel is under it in its own liquor slot.
- **Lore:** every grandmother on Wet Run has one. Made from a Works vice.
- **Price:** 30 cr.

#### 21. Ram Six hydraulic press *(Company)*
**Size** 2x2 · **Slots** paste hopper (12 kg), die tray (12 moulds), blocks out, liquor out · **Draw** 0.4 hu
- **Tended:** 12 blocks an hour, Standard.
- **Overnight:** a 24-block batch, Bulk (no one checks the fill, so some blocks are short).
- **Quirks:** the **die tray** is a slot: plain die (legal), an **Orrin die** (Vitabrick shape; licensed, 40 cr a month; unlicensed
  is infringement), or custom dies cut by a Fourer (the Co-op's sprout-stamped block, which sells to Co-op members for more because
  they trust that shape).
- **Lore:** "Six" because Orrin's first line had six rams. This one is the domestic model.
- **Price:** 380 cr.

#### 22. Orrin DryRack D2 *(Company)*
**Size** 2x2 · **Slots** 6 trays · **Draw** 0.3 hu · **Speed** 8 hours a batch
- **Tended:** turning trays halfway (an hour) evens the dry: Fine crisps and herbs.
- **Overnight:** the natural mode. Cures pressed blocks (stops them sweating in a bay), dries insects into crisps, herbs into dried
  herbs (which keep and sell up), mushrooms into dried caps.
- **Quirks:** the trays are slow to clean; insect oil goes rancid on them if left a week (a status that taints the next batch).
- **Price:** 110 cr.

#### 23. Halden Coldsafe *(Company)*
**Size** 2x2 · **Slots** 6 cold slots, cold-pack charger · **Draw** 0.25 hu
- **Tended:** nothing needed.
- **Overnight:** keeps. Greens in a cold slot stop ageing; live insects are chilled to stillness (the humane kill, Orrin method,
  takes a night); cold packs for the cold liner charge overnight.
- **Quirks:** in slack hour it warms: greens lose a step of freshness per hour of slack.
- **Lore:** the Middle's kitchen fridge, sold down.
- **Price:** 260 cr.
- **In play:** the bridge between growing and the cold liner: a player who sells greens to the Crown needs one.

### Air

#### 24. Halden FS-1 vent stack *(Company)*
**Size** 1x2, on a vent square · **Slots** cartridge · **Draw** 0.1 hu
- **Tended:** nothing.
- **Overnight:** filters. Lowers the shop's **damp** and **dust** by a step each.
- **Quirks:** cartridges carry the 30-day expiry strip (04); a red-strip cartridge is refused even though it would filter fine.
  A grey housing (40 cr; 04) takes any cartridge.
- **Price:** 140 cr.

#### 25. Plate charger *(First-fit)*
**Size** 2x2 · **Slots** 1 Lung plate (2x2 item), wash tray (water vessel) · **Draw** 1.5 hu over the night · **Water** 10 L per wash
- **Tended:** washing the plate (an hour, 10 litres) is the first step and must be done by day.
- **Overnight:** recharges a washed plate. A recharged plate fitted over the shop's vent (no stack needed) lowers damp and dust two
  steps for about 60 days.
- **Quirks:** charges electret film of any kind: a strip of plate film for a **Drop card**, and, with the right card, the charge
  eye film of a No. 4 cell. A Four with a faded eye comes out readable again.
- **Lore:** a Lung maintenance unit from the 30 Lung's plate room, HW-2. The Company crew has three and denies a fourth existed.
- **Price:** 1,600 cr; the Co-op would give a great deal of standing for one.
- **In play:** a machine that sells clean air (recharged plates) both up (reconditioned, to the Company for scrip) and down (to the
  Co-op's vent on 13).

(Air-wells: see 03, **Breathe-2**, **Drybox**, **Atmos Mk I**.)

### Repair, refurbishing and sorting

#### 26. Works Bench *(First-fit, fixed)*
**Size** 2x3, bolted to the floor · **Slots** a workpiece, a magnifier arm, a tool rack (holds 4 tools without using shop squares) ·
**Draw** 0.1 hu (lamp and ground)
- **Tended:** board and chip repair is one hour faster here than anywhere else, and grounded work never "pops" a chip (a static
  death that Company benches occasionally cause).
- **Overnight:** n/a.
- **Quirks:** it cannot be bought or moved. It belongs to the Company (Clause 11). A lease with one rents at x1.2 (02).
- **Lore:** the ESD benches of Line Four. About a hundred remain on 17.
- **In play:** a reason to choose a lease, not a purchase: "bench rights".

#### 27. Fenn's plate (reflow station) *(Grey)*
**Size** 1x2 · **Slots** workpiece, tool (heat gun) · **Draw** 0.6 hu
- **Tended:** screens and boards: re-glass a screen (with a donor pane), replace a backlight, re-seat a chip. One hour each.
- **Overnight:** n/a; it is a hot plate, and left on it burns the bench.
- **Lore:** Odile Fenn (02) builds them and sells them to anyone she is not competing with.
- **Price:** 85 cr.

#### 28. Flash rig *(Grey)*
**Size** 1x1 · **Slots** device, key (a founding-era master key chip; 04)
- **Tended:** one hour unbricks a Retired device (slate, screen, controller, lamp) into a working, unlicensed one. Without a master
  key in the key slot, it can only wipe a device, not revive it.
- **Overnight:** a slow "deep flash" revives devices that a tended flash could not (corrupt chips), with a chance of nothing.
- **Lore:** the rig is cheap; the key is not (2,000+ cr; the Archivists know where some are; 04). A rig without a key is a box.
- **Price:** 300 cr.

#### 29. Clipper's bench *(Grey)*
**Size** 1x2 · **Slots** clipped cell, solder (consumable) · **Draw** 0.1 hu
- **Tended:** one hour per cell: re-terminates a VOID-clipped cell into a working Rc cell (Uncertified).
- **Overnight:** n/a.
- **Lore:** the re-terminating jig in 04, bolted to a board with a vice and a lamp.
- **Price:** 45 cr.

#### 30. Suit Room treadle *(First-fit)*
**Size** 2x2 · **Slots** garment, thread, patch cloth · **Draw** none (treadle)
- **Tended:** undoes the X (the VOID cut, 04) on three garments an hour, with a near-invisible seam: "mended" garments come out one
  value step higher than hand-sewn.
- **Overnight:** n/a.
- **Quirks:** it sews clean-room suit fabric, which nothing else in the tower can (a Crown silk is easy after that).
- **Lore:** from the Works Suit Room on 20, where clean-room suits were made and mended. Built by a sewing-machine firm on the mainland
  whose name is worn off every surviving one. Fewer than thirty left; the Voided own most.
- **Price:** 240 cr.

#### 31. Magnet drum *(Company surplus)*
**Size** 2x3 · **Slots** hopper (mixed scrap), three outputs (ferrous, non-ferrous, rest) · **Draw** 0.5 hu
- **Tended:** watching the drum (an hour) catches small first-fit parts in the rest pile (the drum pulls steel; HW brass and the
  composite parts go to "rest"), so tended sorting **flags** any HW-numbered item it passes.
- **Overnight:** sorts a full hopper into three piles.
- **Quirks:** cells stick to the drum. Any cell in the scrap comes out in the ferrous pile, sometimes dented.
- **Lore:** a Reclaim sorter unit retired from 59 when the Company bought optical sorters for the Middle catches.
- **Price:** 300 cr.
- **In play:** turns the morning chute sort (a packing job) from all-by-hand into partly-by-machine, at the cost of six squares.

#### 32. Blotter press *(Grey)*
**Size** 2x2 · **Slots** 8 sheets (or 1 wet binder, which takes all 8) · **Draw** none · **Speed** days: wet paper dries in 4 nights
- **Tended:** turning the sheets daily (an hour) raises the number of legible pages.
- **Overnight:** dries.
- **Lore:** the Archive's method (06a). A screw press with blotting board between the plates.
- **Price:** 70 cr.

### Analysers

#### 33. Sorter's scale *(Company)*
**Size** 1x2 · **Slots** 1 item · **Draw** 0.05 hu
- **Tended:** reveals weight and metal content in an hour (counterfeit Fours, ballast, water in paste, brass versus brass-plated).
- **Overnight:** n/a; it is instant or nothing.
- **Price:** 60 cr.

#### 34. Lens box *(Grey)*
**Size** 2x1 · **Slots** 1 item · **Draw** 0.1 hu
- **Tended:** reveals one **mark** an hour: an HW number, a date or plant code, a clock number inside a housing, a stamp shadow.
- **Overnight:** reveals every mark on the item.
- **Lore:** a magnifier, a lamp, a UV tube and a slate's camera in a box, built on Litho Run. Mattias Orme (02) has a better one he
  will not sell.
- **Price:** 150 cr.

#### 35. Works QA cabinet *(First-fit)*
**Size** 2x3 · **Slots** 1 item (up to 2x2) · **Draw** 1 hu overnight
- **Tended:** one feature an hour, any kind.
- **Overnight:** reveals **every** hidden feature on the item, including what nothing else sees: a sheep's grey chip, a cell's true
  cycle count, a missing part's HW number, whether a "first-fit" part is a copy.
- **Quirks:** prints its report on a strip of Works QA paper with a pass or fail stamp. A QA strip packed with an item works like an
  analysis slip for penthouse fixers, and the Archive accepts it toward a provenance certificate at half the fee. Once in a while
  it fails an item for a reason that is not on any manual's list of codes: **FAIL 9-19**.
- **Lore:** from the Works' outgoing quality hall. The Company scrapped every one it found after Y60 because they kept failing the
  Company's own Certified Renewed cells.
- **Price:** 3,000 cr, from a dead Old Hand's estate, if the Company does not get there first.
- **Hook:** FAIL 9-19 comes up on HW-9 cells, on some Fours with a blue band in the eye, and on drones that have flown R6.

(Water analysers, the **Cress tray** and the **Test bench**, are in 03.)

### 11.1 The catalogue at a glance

| # | Machine | Origin | Size | Draw | Tended | Overnight | Price |
|---|---|---|---|---|---|---|---|
| 1 | ChargeDock 4 | Company | 2x1 | 0.5/cell | — | charges, Certified | 95 |
| 2 | The Leech | Grey | 1x1 | 0.7/cell | safe, tops Fours | charges anything; swell risk | 45 |
| 3 | Rack 40 | First-fit | 3x1 | 1.2 | — | re-forms tired cells | 1,100 |
| 4 | Tide bank | Grey | 2x3 | 3 charging | hand-switch | timer, tide drift | 420 |
| 5 | LP-2 pad | Company | 2x2 | 2/launch | pre-flight check | charges drone | 160 |
| 6 | Rat pad | Grey | 2x2 | 1/launch | hand launch | — | 60 |
| 7 | Station cradle | First-fit | 3x2 | 1/launch | trim cycle | 2 drones, pneumatics | 2,400 |
| 8 | Rotor bench | Company | 2x2 | 0.2 | clean, rebuild, sheep | — | 70 |
| 9 | GrowBed G1 | Company | 2x3 | lamp | prune | grows; R✓ possible | 220 |
| 10 | Wick tub | Grey | 2x2 | lamp | top up | grows; drown risk | 40 |
| 11 | Ebb tray | Grey | 3x2 | 0.05 + lamps | clean reservoir | floods hourly | 260 |
| 12 | Teague planter | First-fit | 2x2 | none | turn soil | self-waters; daylight only | 900 |
| 13 | Sprout drum | Company | 1x2 | 0.05 | rinse: Fine | sprouts in 2 days | 55 |
| 14 | Mushroom cabinet | Grey | 2x2 | 0.1 | pick on the hour | grows | 120 |
| 15 | Orrin Bin B3 | Company | 2x2 | 0.3 | sift | grows | 180 |
| 16 | Rancher's stack | Grey | 2x3 | 0–0.3 | cull | grows | 90 |
| 17 | Soldier tower | Grey | 2x2 | 0.1 | — | eats anything | 140 |
| 18 | Mincer M8 | Company | 1x2 | 0.8 | coarse, 4 kg/h | refuses | 220 |
| 19 | Works pulper | First-fit | 2x2 | 0.5 | fine, 3 kg/h | 10 kg smooth | 1,400 |
| 20 | Screw press | Grey | 1x1 | none | 4 good blocks | — | 30 |
| 21 | Ram Six | Company | 2x2 | 0.4 | 12 blocks/h | 24 Bulk | 380 |
| 22 | Orrin DryRack D2 | Company | 2x2 | 0.3 | turn trays | dries, cures | 110 |
| 23 | Coldsafe | Company | 2x2 | 0.25 | — | keeps, chills, packs | 260 |
| 24 | FS-1 vent stack | Company | 1x2 | 0.1 | — | filters | 140 |
| 25 | Plate charger | First-fit | 2x2 | 1.5/night | wash | recharges plates, eyes | 1,600 |
| 26 | Works Bench | First-fit | 2x3 | 0.1 | faster repairs | — | leased |
| 27 | Fenn's plate | Grey | 1x2 | 0.6 | screens, boards | — | 85 |
| 28 | Flash rig | Grey | 1x1 | 0.1 | unbrick (with key) | deep flash | 300 |
| 29 | Clipper's bench | Grey | 1x2 | 0.1 | re-terminate cells | — | 45 |
| 30 | Suit Room treadle | First-fit | 2x2 | none | mend the X ×3/h | — | 240 |
| 31 | Magnet drum | Company surplus | 2x3 | 0.5 | flags HW parts | sorts | 300 |
| 32 | Blotter press | Grey | 2x2 | none | turn sheets | dries | 70 |
| 33 | Sorter's scale | Company | 1x2 | 0.05 | weight, metal | — | 60 |
| 34 | Lens box | Grey | 2x1 | 0.1 | one mark/h | all marks | 150 |
| 35 | Works QA cabinet | First-fit | 2x3 | 1 | one feature/h | everything | 3,000 |

---

## 12. How the machines live together

### 12.1 A day on Stores Run, by machine

What a mid-game lease on 17 might sound like, hour by hour, with a modest kit: an LP-2 and a rat pad, a ChargeDock and a Leech,
two wick tubs and a G1, an Orrin bin and a rancher's stack, a Mincer M8, a screw press, a DryRack, a tide bank, one Four.
Slack hour this week falls around 11:00.

- **Overnight (20:00 to 08:00).** The ChargeDock fills three H-cells (it paused for the Peak Window and started at 20:00). The Leech
  is empty: you do not trust it alone. The bins eat. The DryRack cures yesterday's blocks. The tide bank charged in the 02:00 surge.
  The G1's lamp goes off at 22:00 by Orrin schedule; the wick tubs run on strip grow off the tide bank until it reaches half.
  At 05:00 the Steps shed the Mills for a Dark Floors run: dawn slack. The Orrin bin's heater dies for three hours; the tide bank
  keeps the stack's mat warm. At 06:00 the Whistle and the Morning Fall.
- **08:00.** Empty the catch (02). The chute sort: food waste to the bins, two clipped cells to the Clipper's bench pile, a dead
  slate to Fenn's plate pile, a voided shirt, a Works lamp housing with an empty socket (first-fit, no Four in it; the eye glass
  shows HW-2-30114-B).
- **09:00.** The Mincer M8 must be reset after dawn slack (an hour lost). Meanwhile the frass drawer on the Orrin bin is full; empty
  it into the frass mix for the wick tubs.
- **10:00.** Grind: 4 kg coarse paste. Socket load: 0.8 grinder + 0.3 bin + 0.2 lamp = 1.3 of 3.
- **11:00.** Slack hour. Sockets dead. The Mincer has no cell slot, so it stops where it is; the Four goes into the Orrin bin's
  heater instead. Work by hand: the screw press needs no power. 4 blocks.
- **12:00.** Power back. Pack a Wren for floor 34: 12 blocks, cured, a slip, a document-sleeve Middle lane ticket. Launch from the LP-2
  (2 hu, on the bill).
- **13:00.** Re-terminate the two clipped cells (Clipper's bench, two hours).
- **15:00.** The rat pad's bell: a free-shaft drone back from the Perch on 5, with a toll taken (one block short of the pay) and the
  reward in the bay: a pot cell (Sump, sweating) and a wet Works binder.
- **16:00.** The binder into the blotter press. The pot cell into the bin; you do not put sweating cells in machine slots.
- **17:00.** Peak Window. Everything that can stop, stops. Pack and launch instead: a Crown slip for sprouts needs the Coldsafe you do
  not have, so the slip goes back on the board.
- **19:00.** The Wren returns from 34: 38 cr and a reward in the bay, a chute Brightline with its spectrum key expired.
- **20:00.** Load the ChargeDock. Load the DryRack with today's blocks. Top up the wick tubs exactly. The night block.

The machines decide the hours, and the hours decide which machines are worth their squares.

### 12.2 Chains that cross

The tech in this file touches every other system. The crossings worth keeping:

- **Chute → cells → power.** Clipped cells from the West Chute become Rc cells on the Clipper's bench; Rc cells run machines through
  slack or sell to the Sump. Swollen cells go to the Sump's pot-cell makers. HW-9 cells go to the Archive or, quietly, nowhere.
- **Insects → frass → beds → spent medium → mushrooms → spent substrate → insects.** The two food chains joined at the waste end.
- **Chute paper → pulper → pulp → frass mix / mushroom substrate / Archive paper repair.**
- **Voided devices → flash rig / Fenn's plate → Rc devices → grey clients; rewards from low-floor drones are often more of them.**
- **Lung plates → plate charger → clean air (shop damp down), reconditioned plates (Company scrip), Drop cards (shaft rats).**
- **First-fit parts → three buyers** (Company, Old Hands/Co-op, penthouse fixer), each a different future for the tower.
- **Drones → wear → rotor bench; pads → which routes; inserts → which contracts.**
- **Instruments → hidden features → price.** Analysed sells full, blind sells cheap, and the analyser is a machine competing for
  squares with the machines that make things.

### 12.3 Tech contracts and clients

Slips that come out of this file, in the voice of their origin (06a's convention).

1. **The Exchange, floor 28, a cell grader** (grease-pencil on a cell box lid): "Forty chute H-cells, any state, graded by us on
   arrival. 1.50 cr a cell, 3 for good ones." Pays in grades as much as credits: the box comes back with every cell marked.
2. **Halden Heritage Recovery Office, floor 71** (Company letterhead, embossed): "Founding-era items surrendered by tenants will be
   compensated at heritage rates. Lung plate: 40 scrip. No. 4 cell: 120 scrip. Tube capsule: 80 scrip. Tenants are reminded that
   retention of Company heritage items is an offence." A standing slip. Pays scrip and a little Standing.
3. **The Lift Guild, Old Two machine room** (a Guild form, two signatures): "Kessin rail segment, HW-2-K series, any revision, sound.
   220 cr. Delivery by freight chit only." The Guild will not let a drone touch their lift, except to deliver to it.
4. **Pavel Lisko, 2210** (pencil): "Six rotor bearings, the good ones out of chute Sparrows. 4 cr each. Bring the Sparrows too, I'll
   take them." The shaft rats' message drones start here.
5. **A penthouse fixer, floor 93** (cream card, no name, a phone-number-shaped string of digits): "A No. 4, eye gold, with a
   provenance certificate. 1,100 cr. Delivery to the Postern by licensed lane, sealed." Every Four that goes up is one fewer Works
   lamp lit in the Mills.
6. **Ruth Amadi, 0412** (dictated, written by somebody else): "Put an HW-9 in the QA cabinet if you have one. Bring me the strip.
   Read it to me." Pays in what Ruth says when she hears the code.
7. **A Sump fixer, floor 7** (chalk on a board, delivered by a vent kid): "Swollen cells. Any. 0.50 each. Wrapped." The pot-cell trade's
   supply. Sending them by chute dive is fast and very much not advised.
8. **A Middle repair firm, floor 41** (a printed work order): "Twelve Retired slates for unbricking. Return working, Notices ribbon
   intact (we are licensed). 8 cr each." Doing it without the ribbon is quicker. They will notice.
9. **Odile Fenn, two leases down** (a note on the back of a screen box): "Lend me your rig for the night, I'll give you the West catch
   tomorrow." A trade of machine time for supply.
10. **STORES 17-C requisition** (Works stock, dot-matrix; 02): "CELL, NO. 4, 2 EA, ANY COND." / "PLATE, LUNG, ELECTROSTATIC, 1 EA."
    / "BEARING, TYPE 9, 32MM, 4 EA." / "CARD, CONTROLLER, HW-4-F22, 1 EA." The last one is the part a Rack 40 needs. Whoever is on the
    Dark Floors keeps a Rack 40 too.
11. **The Mills Co-op, Two Hall** (sprout stamp): "Tide bank for the Glove Run tank pump. Loan us yours for the next tap drought; we return it
    charged and pay 40 litre-chits." A machine as a loan.
12. **A shaft rat, R3 at 17** (a note on your grate): an arrow, a 9, a circle. Means: R1's comb hole at 30 is closed; use the
    Nine (R8) tonight. Not a contract; a gift, to be returned.
13. **Vey Clinic, floor 64** (sterile form, sealed): "Cold chain delivery. Coldsafe-charged packs, sealed liner, 12 vials." Requires two
    pieces of tech the player must own.
14. **The Archivists** (index card): "Works QA strips, any, with legible codes. 6 cr a strip." They are collecting fail codes.

### 12.4 Tech events

- **Retirement Wave:** a production batch of slates (or Brightline keys, or Wren controllers) reaches its date on the same day. A
  floor goes dark on its screens at 06:00. The flash rig's queue is a week long; chute devices triple.
- **Spectrum Revision:** Orrin revokes a crop's spectrum key early "to deliver an improved growth profile". Every Brightline on that
  crop drops to maintenance spectrum until a new key is bought.
- **Gate Hold:** a Tube gate fails closed; lanes stop for hours; free shafts crowd; shaft rats double their rates.
- **Reclaim Fault:** the sorters at 59 are down (02): first-fit parts and cells fall to the Mills catches all morning.
- **Heritage Drive:** the Company runs a recovery sweep. Inspectors with surveyor's wands and lens boxes walk the floor; any first-fit
  part in plain view is "recovered" at scrip rates, whether or not you agreed. Underfloor squares are not searched unless a warden
  reported you.
- **An Old Hand dies:** an estate sale at the Canteen within the week. Machines, manuals, a Works key with a clock number on it. The
  sublet baron is already measuring the flat (06a).
- **Swell Night:** a heat wave or an Air Day: every H-cell in a grey charger that night has double the swell chance. Somewhere on the
  floor, one goes up. Everyone carries their cells out into the aisle.
- **Bus Surge:** a founding-era protection trip on the Bus throws a surge through the Steps; unprotected grey chargers die; Company
  machines survive (they are fused); first-fit machines do not notice.

### 12.5 Starting kit, by past

Who the player was is open (canon); the machines they start with can say it without saying it. Offerings, not decisions:

- **Shop-loan standard:** a Wren and LP-2, an Orrin bin, a G1, a Mincer M8 (04's bundle). Everything Company, everything legal,
  everything on the loan.
- **A Fourer's child:** the same, but with a Works key in the toolbox and a lens box instead of the G1.
- **An Old Hand's heir:** a screw press, a Leech, a wick tub, a Works pulper missing its bearing, and a debt.
- **Out of the Sump:** a rat pad, a rat-built Ell, a Leech, two pot cells and a soldier tower. No licence for anything.
- **Down from the Middle:** a Kestrel (repossessable), a Coldsafe, a sprout drum, and a slate with eleven months left on its date.

---

## 13. Loose threads

More hooks, unattached, to pan through.

- **Hook:** the trefoil was a registered Works design, renewed every ten years by Document Control. Nobody renewed it in Y81.
  Anyone may legally make Works keys now, and nobody in the Mills knows. The Company has filed to restore it as "heritage security
  infrastructure"; the Archive holds the lapse notice.
- **Hook:** Ilse Brannock (section 3.1), who calibrated cart controllers on Line Eight for nineteen years, kept a calibration log
  with a serial number for every unit. The best shaft-rat drones in the Stack are flying her controllers. The log would say which
  ones she calibrated on a good day.
- **Hook:** every founding-era clock and Sorrel meter runs off a No. 2 button. The buttons were made to last twenty-five years. Most
  were replaced in a Company programme in Y58. Those that were not are dying now, all at once, in the Mills. In a year, every Mills
  meter not yet replaced will stop reporting and go to estimated billing.
- **Hook:** the Company has never once sold a Tube capsule. It buys them back. It has 4,800 on the inventory. The Old Hands count the
  capsule frames flying the risers and the ones in the Company's store, and the numbers do not add up to 4,800. Something is using
  capsules.
- **Hook:** the plate charger also charges "eye film". The founding-era lease studs answer a surveyor's wand with a faint signal
  (02). The stud's signal comes from a sliver of the same film. Recharged, a dark square's dead stud could be made to answer to a
  different number.
- **Hook:** a cart controller retired from a drone and put back on a cart (the Works carts still exist, rusted in a corner of Twenty,
  Line Seven's old hall) will follow the painted lines that are still there on the floor, under forty years of grime. They lead to the Line Seven
  goods lift, which is welded. The cart waits at the weld, every time, as if expecting it to open.
- **Hook:** Bastion's cells (BX) are good. Too good for a prison line, say the Old Hands. Bastion's line runs Halden Works machines
  shipped there after the Drowning (05). Somebody on Bastion knows how to run them, and nobody in the Stack does.
- **Alternative (on why first-fit cannot be made):** it can. The Company has the masks, the recipes and the drawings in a vault in
  the Crown that the Drowning never reached, and it chooses not to make first-fit again, because a tower that lasts forever pays for
  itself once. The Archivists suspect this and cannot prove it. The Old Hands do not believe it, because it would mean their pension
  was a decision too.
- **Alternative (on drones):** the Works did have drones: tiny **line runners** that carried wafers between bays in the Clean Core.
  They are all inside the Dark Floors. Some nights, a shaft rat in R6 sees one.
- **Alternative (on cells):** the No. 4 is not glass-electrolyte but a cell whose chemistry the Works never fully understood
  either, made by a process discovered by accident on Line Two in Y3 and kept going by imitation. That would explain why nobody can
  make it: nobody ever could, on purpose.
