# Machine consumables (mach) reader's guide

These 15 items keep the station's machines and shop running: coolant, grease, filters, fuses and belts, tools such as the jam kit and service manual, and packing supplies (tape, padding, label rolls). Most are tagged to the `need_parts` market need, so besides their machine use they sell to workers, fitters, engineers and the union; the air cartridge serves `need_air` directly and the label roll `need_comfort`.

In the overall loop (scrap -> crusher/recycler -> materials -> machines -> goods -> sold), this is the machines' own supply line. They are made from processed scrap materials (reagent dregs, polymer, carbon dust, fibre, copper wire) at the Chem bench, Workbench, Fabricator or by hand, then either fed back into machine recipes (as inputs or as worn tools) or sold.

A loop worth noticing: the two filter types come back as 'spent' items that a Workbench rinse turns back into working filters.

Groups: fluids and chemicals, filters, parts and tools, packing supplies.

## Fluids and chemicals

### Coolant (`it_mach_coolant`) — tier 1 · 1x2 · worth 6$
**What it is:** Pale blue fluid in a ribbed flask that takes the heat and the fault off a hot machine.
**Function:** A machine consumable and a sold good.
**Chain:** `Comes from:` Brew coolant (Chem bench, Consumable recipes): 4 greywater + 2 reagent dregs + polymer flake -> 4 coolant (four flasks per batch). `Goes into:` Chill overnight (Chiller, takes nights) consumes one. Orders: Mill bearings (fitter, 2), Reactor spares (engineer, 2), Coolant, weekly (engineer, 4).
**Note:** Works and core residents buy it for their own kit.

### Lubricant (`it_mach_lubricant`) — tier 1 · 1x1 · worth 4$
**What it is:** A squeeze tube of clear grease that keeps a feed from jamming.
**Function:** A consumable for workbench repairs and a sold good.
**Chain:** `Comes from:` Brew lubricant (Chem bench, Consumable recipes): 5 reagent dregs + polymer flake -> 10 tubes. `Goes into:` Refurbish a tool (Workbench) and Swap worn parts (Workbench) each use one. Orders: Tools for the second shift (fitter, 2), Coolant, weekly (engineer, 2), Vat valves (union, 3).
**Note:** The data mentions a cheaper carbon route through the chem bench that is 'not written'.

### Sealant (`it_mach_sealant`) — tier 1 · 1x1 · worth 4$
**What it is:** Grey putty in a squeeze tube that sets hard over a seam and holds water and gas.
**Function:** A sold good; spine bunks patch pipes with it.
**Chain:** `Comes from:` Mix sealant (Chem bench, Consumable recipes): 2 polymer flake + reagent dregs -> 4 tubes. `Goes into:` nothing: no recipe or order uses it.

### Cleaning kit (`it_mach_cleaning_kit`) — tier 1 · 1x1 · worth 7$
**What it is:** A rag, brush and vial of solvent in a pouch for lifting dust and gum from machine works.
**Function:** A sold hygiene good.
**Chain:** `Comes from:` Pack cleaning kits (Workbench): rags + reagent dregs -> 2 kits. `Goes into:` nothing: no recipe or order uses it.
**Note:** Households buy it too, which is why it is tagged comfort as well.

## Filters

### Water filter (`it_mach_water_filter`) — tier 1 · 1x2 · worth 8$
**What it is:** A grey carbon-and-mesh cartridge in a polymer sleeve; the purifier runs through it and it clogs slowly.
**Function:** A machine part and a sold good; spine bunks fit one over the tap.
**Chain:** `Comes from:` Fabricate water filters (Fabricator, Filter blueprints): polymer sheet + carbon dust + fasteners -> 2 filters. Rinse water filter (Workbench): a spent filter + water pouch gives one back, plus sludge and greywater. `Goes into:` nothing: no recipe or order uses it directly. Its spent form is the Spent water filter.

### Spent water filter (`it_mach_water_filter_spent`) — tier 1 · 1x2 · worth 1.2$
**What it is:** A clogged, heavy brown cartridge.
**Function:** The raw input of the rinse loop; also sold back to filter-return orders.
**Chain:** `Comes from:` Turns up in salvage lots (inflow channel salvage) and is found at the Dead scrubber bay (about 50% weight, 1-2). `Goes into:` Rinse water filter (Workbench): with a water pouch it returns a water filter, sludge and greywater. Orders: Spent water filters (fitter, 4), Filter returns (union, 6).
**Note:** No recipe makes it; its source is salvage and scavenging only. It can also go to the recycler.

### Air cartridge (`it_mach_air_filter`) — tier 1 · 2x1 · worth 10$
**What it is:** A flat carbon-packed cartridge with a fibre pre-screen that slots into a scrubber.
**Function:** Serves the air need directly: one cartridge is one resident-day of cleaner air for a bunk.
**Chain:** `Comes from:` Fabricate air cartridges (Fabricator, Filter blueprints): polymer sheet + 2 carbon dust + fibre lint -> 2. Rinse air cartridge (Workbench) from a spent one. `Goes into:` Assemble rebreather (by hand) uses one with polymer sheet and fibre lint to make a Sealed rebreather. Order: Scrubber bank is down (bunker resident, 3).

### Spent air cartridge (`it_mach_air_filter_spent`) — tier 1 · 2x1 · worth 1.3$
**What it is:** A black, full carbon bed that rattles when shaken.
**Function:** The raw input of the air-cartridge rinse loop.
**Chain:** `Comes from:` Turns up in salvage lots and at the Dead scrubber bay (about 60% weight, 1-2). `Goes into:` Rinse air cartridge (Workbench): with a water pouch it returns an air cartridge, sludge and greywater. Order: Filter returns (union, 6).
**Note:** No recipe makes it; salvage and scavenging only. It can also be sent to the recycler.

## Parts and tools

### Fuse (`it_mach_fuse`) — tier 1 · 1x1 · worth 4$
**What it is:** A glass tube with a thin copper filament packed in grit; it dies first so the machine does not.
**Function:** A part that clears a tripped breaker.
**Chain:** `Comes from:` Pack fuses (Workbench): 2 copper wire + grit -> 2 fuses. `Goes into:` nothing: no recipe or order uses it in the ledger.

### Drive belt (`it_mach_drive_belt`) — tier 1 · 2x1 · worth 10$
**What it is:** A loop of ribbed polymer woven with fibre; every drum and roller on the station turns on one.
**Function:** A part for drum and roller machines.
**Chain:** `Comes from:` Braid drive belts (Workbench): 2 polymer sheet + fibre lint -> 2 belts. `Goes into:` Fit a new belt (Workbench) consumes one. No order wants it.
**Note:** It sits in the consumable slot of drum and roller machines.

### Jam kit (`it_mach_jam_kit`) — tier 1 · 1x2 · worth 8$
**What it is:** A roll of picks, a bent probe and a squeeze of grease that frees a clogged feed without a wrench.
**Function:** A tool (not consumed per use).
**Chain:** `Comes from:` Assemble jam kits (Workbench): 2 fasteners + polymer flake -> 2 kits. `Goes into:` Used as a tool by the clear-jam recipe. Order: Tools for the second shift (fitter, 1).
**Note:** A tool that wears out after four jobs.

### Service manual (`it_mach_manual`) — tier 2 · 2x2 · worth 12$
**What it is:** Forty printed pages of exploded drawings and torque figures, grease-thumbed.
**Function:** A tool used by the realign recipe; also sold.
**Chain:** `Comes from:` Print service manuals (Document printer): 4 paper + carbon dust -> 2 manuals. `Goes into:` Orders: Manuals and a handbook (technician, 2), Hall manuals (union, 3).
**Note:** Tagged book, so collectors may want an old copy.

## Packing supplies

### Sealing tape (`it_mach_tape`) — tier 1 · 1x1 · worth 2$
**What it is:** A reel of grey polymer tape with a hard adhesive; a box sealed with it opens only under a knife.
**Function:** The input of the box sealer.
**Chain:** `Comes from:` Wind sealing tape (Workbench): polymer sheet -> 2 tape. `Goes into:` Seal small box and Seal medium box (Box sealer) use 1; Seal large box uses 2; Hide goods under padding (by hand) uses 1. Orders: Tools for the ducts (scavenger, 2), Packing stock (carrier, 4).

### Padding (`it_mach_padding`) — tier 1 · 2x1 · worth 2$
**What it is:** Shredded rag packed in a flat bag that keeps a box from arriving dented.
**Function:** Packing filler; also used to hide goods in a box.
**Chain:** `Comes from:` Shred rags to padding (by hand): 1 rags -> 4 padding. `Goes into:` Pack padding in, Hide goods under padding and Fit splint (all by hand; the splint makes a Splint). Order: Packing stock (carrier, 6).

### Label roll (`it_mach_label_roll`) — tier 1 · 1x1 · worth 6$
**What it is:** A roll of gummed blank paper strips with a hole for the labeller spindle.
**Function:** The input of the labeller.
**Chain:** `Comes from:` Cut label roll (Slip printer): 1 paper -> 1 roll (one roll per label). `Goes into:` Label ring grade and Label company licence (Labeller) use 1; Monogram goods uses 2. Order: Form slips (clerk, 2).
