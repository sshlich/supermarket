# Food: reader's guide

Food is the game's "need_food" goods: edible items that are sold or delivered to residents of the station, plus the seeds, staples and tinned stock that feed them. Almost all of it is made rather than scavenged. The ledger lists no scavenge sites for any food item. It is built from Biomass paste (a material from the recycler side of the loop), plus Sugar, Plant oil, Salt cake, Water pouches and Nutrient mix.

The loop here: scrap goes through the crusher/recycler to materials, and Biomass paste goes into the Vat (and, later, the Industrial vat) for staples, dairy and cured meat. The Hydro tray and Hydro rack grow produce from seeds. The Galley cooks meals and cans them. Your hands do the instant cutting, slicing and stacking. The Bioreactor turns sludge back into food in phase 4. Finished food is then sold to a need (`need_food`, or `need_luxury` for ring-grade items) or handed to resident orders.

Progression runs from spine-grade synthetic staples (phase 2), through hydro crops (phase 1 trays, phase 3 racks), up to ring-grade luxuries (phase 3) and cultured meat (phase 4).

## Staples and vat basics

### Ration bar (`it_food_ration_bar`) — tier 1 · 2x1 · worth 4$
**What it is:** Grey paste pressed into a bar; a flavourless synthetic ration.
**Function:** The basic food staple, sold to the food need (0.5) and wanted by orders.
**Chain:** `Comes from:` Vat "Press ration bars" (4 Biomass paste into 2 bars, phase 2); Industrial vat "Batch ration bars" (12 paste into 6, phase 3). Also sold at the Spine swap stall (x1.2 price). `Goes into:` no recipe uses it. Orders: Bunker water (x2), Bunker rations (x6), Hauler stores (x8).
**Note:** Terminal good, only sold or delivered.

### Paste tube (`it_food_paste_tube`) — tier 1 · 1x2 · worth 3$
**What it is:** Brown paste in a squeeze tube, eaten straight from the nozzle.
**Function:** Cheap synthetic staple for the food need (0.4).
**Chain:** `Comes from:` Vat "Squeeze paste tubes" (3 Biomass paste into 2 tubes, phase 2). `Goes into:` no recipe uses it; wanted by the Bunker rations order (x2).

### Protein block (`it_food_protein_block`) — tier 2 · 2x1 · worth 6$
**What it is:** A dense, salted, chewy block of pressed paste.
**Function:** Synthetic protein staple for the food need (0.75).
**Chain:** `Comes from:` Vat "Press protein blocks" (5 Biomass paste + 1 Salt cake into 2, phase 2); Industrial vat "Batch protein blocks" (15 paste + 3 Salt cake into 6, phase 3). `Goes into:` no recipe, no order.
**Note:** Dead end: only sellable to the food need.

### Crackers (`it_food_crackers`) — tier 1 · 2x1 · worth 5$
**What it is:** A foil pack of dry, salted vat crackers.
**Function:** Shelf-stable snack/bread for the food need (0.4).
**Chain:** `Comes from:` Vat "Bake crackers" (1 Biomass paste + 2 Plant oil into 2, phase 2); Industrial vat batch (3 paste + 6 oil into 6, phase 3). `Goes into:` no recipe, no order.
**Note:** Dead end: only sellable to the food need.

## Feedstock (ingredients, not meals)

### Sugar (`it_food_sugar`) — tier 1 · 1x1 · worth 2.5$
**What it is:** White crystals in a twist of foil.
**Function:** Mainly an ingredient for the vat, the still and the galley; also food need 0.2. The ledger notes it feeds luxury goods, medicine and food.
**Chain:** `Comes from:` Vat "Refine sugar" (1 Biomass paste into 1 Sugar); Galley "Press potato sugar" (3 Potatoes into 3 Sugar + 1 paste + 2 Greywater). `Goes into:` Yeast culture, vat apples, Sliced bread, Cheese wheel (each single and batch), plus cheese spread, salami, fruit jelly and non-food recipes (sugar wash, candles, ethanol, rehydration mix, energy tabs): 16 recipes in all. Orders: Smelter yeast (x4).
**Note:** One of the most widely used food inputs; it is a vat-made intermediate, not scavenged.

### Plant oil (`it_food_oil`) — tier 1 · 1x2 · worth 3$
**What it is:** Pale pressed oil in a plastic flask; the flask is polymer.
**Function:** Frying and curing ingredient, also used in salves and soap; food need 0.2.
**Chain:** `Comes from:` Vat "Press plant oil" (4 Biomass paste + 1 Polymer flake into 4 oil, phase 2). `Goes into:` Crackers, Salami, Sausage, Terrine, Culture steak, Dumplings, and non-food soap, cosmetic and burn gel: 11 recipes in all.
**Note:** The only food item needing a Polymer flake as input.

### Yeast culture (`it_food_yeast`) — tier 1 · 1x1 · worth 2$
**What it is:** A cloudy grey culture in a stoppered tube.
**Function:** Starter for bread and cheese and for the bioreactor; food need 0.05.
**Chain:** `Comes from:` Vat "Culture yeast" (1 Sugar into 5 yeast, phase 2). `Goes into:` Sliced bread (Vat, Industrial vat), Cheese wheel (both), Culture mat from sludge (Bioreactor). Orders: Smelter yeast (x6), Union bread (x8).

### Stock cube (`it_food_stock_cube`) — tier 1 · 1x1 · worth 3$
**What it is:** A hard grey cube of salt and boiled paste that dissolves into broth.
**Function:** Flavour base for galley soups and stews; food need 0.1.
**Chain:** `Comes from:` Galley "Boil stock cubes" (2 Salt cake + 2 Biomass paste into 4 cubes). `Goes into:` Galley "Cook stew" (Hot stew) and "Boil noodles" (Noodle bowl). No orders.

### Cheese spread (`it_food_cheese_spread`) — tier 2 · 1x2 · worth 5$
**What it is:** Pale cheese paste in a tube.
**Function:** Eaten as a food (need 0.4) and the base of herb cheese.
**Chain:** `Comes from:` Vat "Mix cheese spread" (2 Biomass paste + 1 Sugar into 2). `Goes into:` Industrial vat "Make herb cheese" (with a Herb bunch). No orders.

## Bread and cold cuts (cut and stacked by hand)

### Sliced bread (`it_food_bread`) — tier 1 · 3x2 · worth 8$
**What it is:** A vat loaf in cling film, sliced eight ways.
**Function:** Food need 0.8, and the source of bread slices for sandwiches.
**Chain:** `Comes from:` Vat "Bake loaf" (3 Biomass paste + 1 Sugar + 1 Yeast culture into 1); Industrial vat batch (6 paste + 2 Sugar + 2 Yeast into 2). `Goes into:` Your hands "Cut loaf" (into 8 Slices of bread). Order: Union bread (x4).

### Slice of bread (`it_food_bread_slice`) — tier 1 · 2x2 · worth 1$
**What it is:** One slice of vat bread.
**Function:** Sandwich ingredient; edible on its own (need 0.1).
**Chain:** `Comes from:` Your hands "Cut loaf" (1 loaf into 8, instant). `Goes into:` the three hand-stacked sandwiches (Sandwich, Cheese sandwich, Double sandwich), 2 slices each.

### Cheese wheel (`it_food_cheese_wheel`) — tier 2 · 4x3 · worth 48$
**What it is:** A pressed wheel of vat cheese in red wax, eight wedges' worth.
**Function:** Sold to the food need (2.4), or cut up into wedges.
**Chain:** `Comes from:` Vat "Culture cheese wheel" (5 Biomass paste + 3 Sugar + 1 Yeast into 1, nights, phase 2); Industrial vat batch (10 paste + 6 Sugar + 2 Yeast into 2, phase 3). `Goes into:` Your hands "Cut cheese wheel" (into 8 Cheese wedges). No orders.
**Note:** The ledger says a cellar can add an "aged" modifier over nights; that mechanic is not shown in the recipe data.

### Cheese wedge (`it_food_cheese_wedge`) — tier 2 · 3x2 · worth 6$
**What it is:** An eighth of a cheese wheel.
**Function:** Food need 0.3; stepping stone to slices.
**Chain:** `Comes from:` Your hands "Cut cheese wheel" (instant). `Goes into:` Your hands "Cut cheese wedge" (into 6 Cheese slices). No orders.

### Cheese slice (`it_food_cheese_slice`) — tier 1 · 2x2 · worth 1$
**What it is:** One thin slice of cheese.
**Function:** Sandwich ingredient; food need 0.05.
**Chain:** `Comes from:` Your hands "Cut cheese wedge" (1 wedge into 6, instant). `Goes into:` Cheese sandwich and Double sandwich.

### Salami (`it_food_salami`) — tier 2 · 4x2 · worth 16$
**What it is:** A cured vat salami tied with string, eight slices' worth.
**Function:** Food need 0.8, or cut into slices.
**Chain:** `Comes from:` Vat "Cure salami" (2 Biomass paste + 1 Sugar + 1 Plant oil into 1, nights, phase 2); Industrial vat batch (into 2, phase 3). `Goes into:` Your hands "Cut salami" (into 8 Salami slices). No orders.

### Salami slice (`it_food_salami_slice`) — tier 1 · 2x2 · worth 2$
**What it is:** One deep red slice of cured salami.
**Function:** Sandwich ingredient; food need 0.1.
**Chain:** `Comes from:` Your hands "Cut salami" (instant). `Goes into:` Sandwich and Double sandwich.

### Sandwich (`it_food_sandwich`) — tier 1 · 2x2 · worth 4$
**What it is:** Two bread slices and one salami slice.
**Function:** Snack/meal for the food need (0.4).
**Chain:** `Comes from:` Your hands "Stack sandwich" (2 Slices of bread + 1 Salami slice, instant). `Goes into:` Galley "Toast sandwich" (Toasted sandwich). No orders.

### Cheese sandwich (`it_food_sandwich_cheese`) — tier 1 · 2x2 · worth 4$
**What it is:** Two bread slices and a cheese slice.
**Function:** Snack for the food need (0.25).
**Chain:** `Comes from:` Your hands "Stack cheese sandwich" (2 Slices of bread + 1 Cheese slice, instant). `Goes into:` nothing; no orders.
**Note:** Same $4 as the Sandwich but only 0.25 food need versus 0.4.

### Double sandwich (`it_food_sandwich_double`) — tier 2 · 2x2 · worth 7$
**What it is:** Bread, salami and cheese in one stack.
**Function:** Snack for the food need (0.35).
**Chain:** `Comes from:` Your hands "Stack double sandwich" (2 Slices of bread + 1 Salami slice + 1 Cheese slice, instant). `Goes into:` nothing; no orders.

### Sausage (`it_food_sausage`) — tier 2 · 3x1 · worth 14$
**What it is:** Vat sausage in a plastic casing, a chain of four.
**Function:** Meat protein for the food need (0.7).
**Chain:** `Comes from:` Vat "Stuff sausage" (2 Biomass paste + 1 Plant oil into 1, phase 2). `Goes into:` no recipe, no order.
**Note:** Dead end: only sellable to the food need.

## Galley meals

### Porridge pot (`it_food_porridge`) — tier 1 · 2x2 · worth 5$
**What it is:** Warm paste and water stirred smooth in a tin pot.
**Function:** Cheap meal for the food need (0.75).
**Chain:** `Comes from:` Galley "Cook porridge" (2 Biomass paste + 1 Water pouch). `Goes into:` nothing. Orders: Scavenger meal (x2), Union bread (x6).

### Hot stew (`it_food_stew`) — tier 2 · 2x2 · worth 18$
**What it is:** Potatoes and protein in brown broth.
**Function:** Full meal for the food need (1.0); can be canned.
**Chain:** `Comes from:` Galley "Cook stew" (1 Potatoes + 2 Biomass paste + 1 Stock cube); or Your hands "Open tinned stew" (returns the Tin can). `Goes into:` Galley "Can stew" (Tinned stew). Orders: Smelter stew (x3), Engineer night shift (x2).

### Noodle bowl (`it_food_noodles`) — tier 2 · 2x2 · worth 12$
**What it is:** Paste noodles in stock with a pinch of salt.
**Function:** Meal for the food need (1.0).
**Chain:** `Comes from:` Galley "Boil noodles" (2 Biomass paste + 1 Water pouch + 1 Stock cube). `Goes into:` nothing. Order: Smelter stew (x2).

### Dumpling (`it_food_dumplings`) — tier 2 · 2x1 · worth 9$
**What it is:** A fried dumpling stuffed with herbs and paste.
**Function:** Snack/meal for the food need (0.7).
**Chain:** `Comes from:` Galley "Fry dumplings" (2 Biomass paste + 1 Herb bunch + 1 Plant oil into 2). `Goes into:` nothing; no orders.
**Note:** The only galley meal that uses herbs apart from the luxury items.

### Toasted sandwich (`it_food_toastie`) — tier 1 · 2x2 · worth 7$
**What it is:** A Sandwich pressed hot on the galley plate.
**Function:** Meal for the food need (0.4).
**Chain:** `Comes from:` Galley "Toast sandwich" (1 Sandwich). `Goes into:` nothing; no orders.
**Note:** Toasting lifts the worth from 4$ to 7$ without extra ingredients.

## Tinned food (cans reusable)

### Tinned beans (`it_food_tin_beans`) — tier 2 · 1x1 · worth 7$
**What it is:** Broad beans sealed in a can with brine.
**Function:** Storable staple for the food need (0.6).
**Chain:** `Comes from:` Galley "Can beans" (1 Broad beans + 1 Tin can). `Goes into:` Your hands "Open tinned beans" (returns Tin can + Broad beans). Order: Hauler stores (x4).
**Note:** Canning is reversible and returns the can; the can adds iron to the item's composition.

### Tinned stew (`it_food_tin_stew`) — tier 2 · 1x1 · worth 24$
**What it is:** Hot stew sealed into a tin.
**Function:** Storable meal for the food need (1.0).
**Chain:** `Comes from:` Galley "Can stew" (1 Hot stew + 1 Tin can). `Goes into:` Your hands "Open tinned stew" (returns Tin can + Hot stew). No orders.
**Note:** Worth 24$ against 18$ for the open stew.

### Tinned apple (`it_food_tin_apple`) — tier 2 · 1x1 · worth 9$
**What it is:** Apple halves in syrup, sealed in a can.
**Function:** Storable fruit for the food need (0.5).
**Chain:** `Comes from:` Galley "Can apples" (2 Apples + 1 Tin can). `Goes into:` Your hands "Open tinned apple" (returns Tin can + 2 Apples). No orders.

## Seeds and grafts (crop stock; all arrive by crate)

Each grow recipe returns the seed it consumed, so a tray or rack keeps its own stock. The only inflow channel listed for every seed is crate (phase 1, except Tomato seed phase 2 and the three ring grafts phase 3).

### Greens seed (`it_food_seed_greens`) — tier 1 · 1x1 · worth 1$
**What it is:** A paper twist of pale seed, enough for one tray.
**Function:** Planted in Hydro to grow Salad greens.
**Chain:** `Comes from:` crates (phase 1); also returned (with a chance, per the ledger) by every greens grow. `Goes into:` Hydro tray "Grow greens" (and clean-water variant) and Hydro rack "Rack greens", which each give back the seed.

### Bean seed (`it_food_seed_beans`) — tier 1 · 1x1 · worth 1$
**What it is:** Dry broad beans in a twist of paper.
**Function:** Planted to grow Broad beans.
**Chain:** `Comes from:` crates (phase 1). `Goes into:` Hydro tray "Grow beans", Hydro rack "Rack beans"; seed returned each time.

### Seed potato (`it_food_seed_potato`) — tier 1 · 1x1 · worth 1$
**What it is:** Wrinkled sprouting tubers the size of thumbs.
**Function:** Planted to grow Potatoes.
**Chain:** `Comes from:` crates (phase 1). `Goes into:` Hydro tray "Grow potatoes" (greywater or clean-water version), Hydro rack "Rack potatoes"; seed returned.

### Herb seed (`it_food_seed_herbs`) — tier 2 · 1x1 · worth 2$
**What it is:** Fine black seed in a screw of foil, roughly parsley.
**Function:** Planted to grow Herb bunches.
**Chain:** `Comes from:` crates (phase 1). `Goes into:` Hydro tray "Grow herbs", Hydro rack "Rack herbs"; seed returned. Herbs need clean Water pouches, not greywater.

### Tomato seed (`it_food_seed_tomato`) — tier 2 · 1x1 · worth 2$
**What it is:** Flat yellow seed pressed between two cards.
**Function:** Planted to grow Tomatoes; wants clean water.
**Chain:** `Comes from:` crates (phase 2). `Goes into:` Hydro tray "Grow tomatoes", Hydro rack "Rack tomatoes"; seed returned.

### Apple graft (`it_food_seed_apple`) — tier 3 · 1x1 · worth 10$
**What it is:** A dwarf apple graft in a wet sleeve with a ring nursery mark.
**Function:** Reusable stock for the orchard recipe that grows real Apples.
**Chain:** `Comes from:` crates (phase 3), described as nearly unobtainable. `Goes into:` Hydro rack "Grow apples" (2 Water pouch + 2 Nutrient mix into 4 Apples), always returned.

### Citrus graft (`it_food_seed_citrus`) — tier 3 · 1x1 · worth 10$
**What it is:** A bare citrus stem in a wet sleeve with a ring nursery tag.
**Function:** Reusable stock for growing Citrus.
**Chain:** `Comes from:` crates (phase 3). `Goes into:` Hydro rack "Grow citrus" (into 3 Citrus), returned each time.

### Berry cutting (`it_food_seed_berry`) — tier 3 · 1x1 · worth 10$
**What it is:** A bundle of cut canes in damp moss, ring stock.
**Function:** Reusable stock for growing Berries.
**Chain:** `Comes from:` crates (phase 3). `Goes into:` Hydro rack "Grow berries" (into 4 Berries), returned each time.

## Produce (hydro-grown)

### Salad greens (`it_food_greens`) — tier 1 · 2x2 · worth 4$
**What it is:** Pale, limp, bitter leaves grown under a lamp.
**Function:** Fresh produce for the food need (0.3).
**Chain:** `Comes from:` Hydro tray "Grow greens" (1 seed + 2 Greywater + 1 Nutrient mix; a clean-water variant exists) and Hydro rack "Rack greens" (3 greens per run). Both also output a Salt cake. `Goes into:` no recipe, no order.
**Note:** Dead end for crafting; its by-product Salt cake is the real prize.

### Broad beans (`it_food_beans`) — tier 1 · 2x1 · worth 5$
**What it is:** Fat pods shelled by hand; plain grown protein.
**Function:** Food need (0.5), and the contents of Tinned beans.
**Chain:** `Comes from:` Hydro tray "Grow beans", Hydro rack "Rack beans" (3 per run); also recovered by Your hands "Open tinned beans". `Goes into:` Galley "Can beans" (Tinned beans). No orders.

### Potatoes (`it_food_potatoes`) — tier 1 · 2x2 · worth 3$
**What it is:** Knobbly tubers in a mesh sack.
**Function:** Food need (0.5); ingredient in stew and a sugar source.
**Chain:** `Comes from:` Hydro tray "Grow potatoes" (greywater or clean water), Hydro rack "Rack potatoes" (3 per run). `Goes into:` Galley "Cook stew" (Hot stew) and "Press potato sugar" (3 Potatoes into 3 Sugar + paste + Greywater). No orders.

### Herb bunch (`it_food_herbs`) — tier 2 · 1x2 · worth 12$
**What it is:** A tied bunch of green herbs.
**Function:** Flavouring for luxury and fried food; food need only 0.1.
**Chain:** `Comes from:` Hydro tray "Grow herbs" (1 per run), Hydro rack "Rack herbs" (3 per run); both also output a Salt cake. `Goes into:` Terrine, Herb cheese, Culture steak, Fry dumplings. Order: Household fresh (x2).

### Tomatoes (`it_food_tomatoes`) — tier 2 · 2x1 · worth 14$
**What it is:** Small hard hydro-grown tomatoes.
**Function:** Fresh produce for the food need (0.4).
**Chain:** `Comes from:` Hydro tray "Grow tomatoes" (2 Water pouch), Hydro rack "Rack tomatoes" (3 per run). `Goes into:` no recipe. Order: Household fresh (x2).

### Apple (`it_food_apple`) — tier 2 · 2x2 · worth 8$
**What it is:** Ring fruit, bruised and speckled; the vat version is perfectly red.
**Function:** Fresh fruit for the food need (0.25); ingredient in canned fruit and ring dinner.
**Chain:** `Comes from:` Vat "Grow vat apples" (1 Sugar + 1 Water pouch into 2, phase 2); Hydro rack "Grow apples" (needs Apple graft, 4 per run, phase 3); Your hands "Open tinned apple". `Goes into:` Galley "Can apples" (Tinned apple) and "Plate ring dinner" (2 per dinner). Order: Household fresh (x2).
**Note:** Listed as tier 2 though the real orchard apple needs a tier 3 graft; the vat apple is the phase 2 route.

### Citrus (`it_food_citrus`) — tier 3 · 2x2 · worth 22$
**What it is:** A yellow, thick-rinded fruit with a real scent.
**Function:** Sold to both food (0.3) and luxury (0.2) needs; ingredient in ring dinner.
**Chain:** `Comes from:` Hydro rack "Grow citrus" only (needs Citrus graft, 3 per run, phase 3). `Goes into:` Galley "Plate ring dinner". No orders.
**Note:** Tagged "real" and "ring_grade": the ring sells it by the piece.

### Berries (`it_food_berries`) — tier 3 · 2x1 · worth 12$
**What it is:** A handful of dark berries in a paper cone.
**Function:** Primarily a luxury good (market need is luxury, 0.3; food 0.1).
**Chain:** `Comes from:` Hydro rack "Grow berries" only (needs Berry cutting, 4 per run, phase 3). `Goes into:` Industrial vat "Set fruit jelly" (2 per jar). No orders.

## Ring-grade luxuries

### Terrine (`it_food_terrine`) — tier 3 · 3x1 · worth 80$
**What it is:** Vat meat set with herbs and oil in a mould.
**Function:** Luxury meat; sold to the luxury need (0.4, plus food 0.8); ingredient in ring dinner.
**Chain:** `Comes from:` Industrial vat "Set terrine" (2 Biomass paste + 1 Plant oil + 1 Herb bunch, nights, phase 3). `Goes into:` Galley "Plate ring dinner". No orders.

### Herb cheese (`it_food_cheese_herb`) — tier 3 · 2x2 · worth 50$
**What it is:** A soft round cheese folded through with fresh herbs.
**Function:** Luxury dairy for the luxury need (0.4, plus food 0.6).
**Chain:** `Comes from:` Industrial vat "Make herb cheese" (1 Cheese spread + 1 Herb bunch, nights, phase 3). `Goes into:` no recipe, no order.

### Fruit jelly (`it_food_fruit_jelly`) — tier 3 · 1x1 · worth 40$
**What it is:** Berry jelly set in a glass jar.
**Function:** Luxury gift for the luxury need (0.4, plus food 0.2).
**Chain:** `Comes from:` Industrial vat "Set fruit jelly" (1 Sugar + 2 Berries + 1 Glass vial, nights, phase 3). `Goes into:` no recipe, no order.
**Note:** The glass jar is the Glass vial consumed by the recipe.

### Ring dinner (`it_food_ring_dinner`) — tier 4 · 3x2 · worth 200$
**What it is:** Terrine, apple and citrus plated as a full ring-table meal.
**Function:** The top food/luxury sale (food 1.0, luxury 0.6) and a household order.
**Chain:** `Comes from:` Galley "Plate ring dinner" (1 Terrine + 2 Apples + 1 Citrus, phase 3). `Goes into:` nothing. Order: Household dinner (x2).
**Note:** First reachable in phase 3 and needs the orchard fruit as well as industrial-vat meat.

## Cultured (phase 4)

### Culture mat (`it_food_culture_mat`) — tier 4 · 2x2 · worth 40$
**What it is:** A dense, wet, edible mat grown from sludge in the bioreactor.
**Function:** Food need (0.9) and the base for Culture steak; closes the loop by turning sludge into food.
**Chain:** `Comes from:` Bioreactor "Culture mat from sludge" (4 Sludge + 5 Yeast culture + 2 Nutrient mix into 2) or "Culture mat from algae" (3 Sludge + 3 Algae mat + 1 Nutrient mix into 2 + Greywater); both phase 4. `Goes into:` Bioreactor "Grow culture steak". No orders.

### Culture steak (`it_food_culture_steak`) — tier 4 · 2x1 · worth 120$
**What it is:** Cultured protein, grained and seared like meat.
**Function:** Sold to the food need (1.0) as the Concern's answer to the ring's table.
**Chain:** `Comes from:` Bioreactor "Grow culture steak" (2 Sludge + 1 Culture mat + 1 Herb bunch + 1 Plant oil into 2, phase 4). `Goes into:` nothing; no orders.
