# Life support: water, air and feed

These are the items that keep the bunks breathing and drinking: water in several grades, the gas canisters and filters that go with it, and the nutrient and algae chain that feeds the hydroponic trays. Most of them are cheap, bulky and tier 1 or 2, and they sell to the basic needs (water, air, power, food) rather than to luxury buyers.

In the game's loop (scrap -> crusher/recycler -> materials -> machines -> goods -> sold), almost none of this comes from crushed scrap. It enters as salvage (brine, foul air, spent pucks, dented canisters) or from ice and greywater already circulating in the loop. Machines (Purifier, Still, Scrubber, Algae tank) turn it into goods, and a lot of the recipes are done by hand with no machine. Several items are only stepping stones: water feeds hydro trays, algae feeds nutrient and paste, and foul air feeds the scrubber and the algae tank. The finished goods are mostly sold to bunk residents, the Ring Council and technicians.

## Water

### Water pouch (`it_life_water`) — tier 1 · 1x2 · worth 1.5$
**What it is:** A litre of clean drinking water in a heat-sealed polymer pouch.
**Function:** The staple of the water need (market need: water). It is also the main input of the hydro trays and racks, and it is packed into rations and jugs.
**Chain:** `Comes from:` Purifier recipes from Greywater (4 -> 4), Ice block (1 -> 2, plus a Gas bladder), Meltwater (2 -> 4) and Brine (2 -> 2, plus Salt cake); the Still makes it as a by-product of Evaporate brine feed; by hand from decanting Water jugs. `Goes into:` orders from the Bunker (x4), Hauler (x4) and Scavenger (x2); hydro tray and rack grow recipes for greens, potatoes, herbs and tomatoes; Distil water, Fill water jugs and Pack water rations. 19 recipes consume it in all, and 4 more are not named here.
**Note:** Many recipes also return a pouch as a by-product, so it circulates through the whole feed chain.

### Meltwater (`it_life_meltwater`) — tier 1 · 1x2 · worth 2.5$
**What it is:** Ice melted in a bag and strained once, hard, grey and tasting of iron.
**Function:** Cheap raw water that still counts toward the water need, and the feed for the purifier's filtering step.
**Chain:** `Comes from:` Melt ice at the Purifier (1 Ice block -> 1 Meltwater plus a Gas bladder). `Goes into:` Filter meltwater at the Purifier (2 -> 4 Water pouch). Nothing else uses it.
**Note:** It is worth more than the pouch it becomes per unit, but filtering doubles the count.

### Water ration (`it_life_water_ration`) — tier 1 · 2x1 · worth 3.5$
**What it is:** A flat sachet holding a day of water, stamped with a bunk number.
**Function:** Sold as spine-grade water (counts as 1 unit of the water need).
**Chain:** `Comes from:` Pack water rations by hand (10 Water pouch + 1 Polymer flake -> 5 rations). `Goes into:` the Bunker's charity air order (x2). No recipe consumes it.

### Water jug (`it_life_water_jug`) — tier 1 · 2x3 · worth 7$
**What it is:** A four-litre sealed polymer jug with a tap.
**Function:** A container for bulk water; it counts as 2 units of the water need.
**Chain:** `Comes from:` Fill water jugs by hand (8 Water pouch + 1 Polymer flake -> 2 jugs). `Goes into:` Decant jugs by hand (2 jugs -> 8 pouches + 1 Polymer flake). No order wants it.
**Note:** The fill and decant recipes are a loop; it is a way to store water, not a gain.

### Distilled water (`it_life_distilled`) — tier 2 · 1x2 · worth 5$
**What it is:** Water boiled off and recaptured in glass tubing, pure and mineral-free.
**Function:** An intermediate for bottled water and saline, and it also sells to the water need.
**Chain:** `Comes from:` Distil water at the Still (2 Water pouch -> 2); Distil brine at the Still (2 Brine -> 2, plus 2 Salt cake); Pour out bottle by hand. `Goes into:` Bottle water (with a Bottle) and Mix saline (with Salt cake).

### Saline water (`it_life_saline`) — tier 2 · 1x2 · worth 8$
**What it is:** Distilled water with a measured pinch of salt, bottled for the clinic.
**Function:** Sold to both the water need (0.5) and the medicine need (0.25); the clinic is its steady buyer.
**Chain:** `Comes from:` Mix saline by hand (5 Distilled water + 1 Salt cake -> 5). `Goes into:` Hang saline drip by hand (1 Saline + 1 Polymer tube -> Saline drip). No orders name it.

### Bottled water (`it_life_water_bottle`) — tier 2 · 1x3 · worth 10$
**What it is:** Distilled water in a real glass bottle with a cork.
**Function:** Ring-grade drinking water (1 unit of the water need); Ring households keep them for show.
**Chain:** `Comes from:` Bottle water by hand (1 Bottle + 2 Distilled water); the Spine swap stall also sells it (price x1.2). `Goes into:` Pour out bottle by hand, which returns the Bottle and 2 Distilled water. No order wants it.

### Brine (`it_life_brine`) — tier 1 · 1x2 · worth 2$
**What it is:** Salt water in a stoppered flask, left over from the cooling loops.
**Function:** A raw input; nobody drinks it. It feeds the purifier, the still and the brine algae strain.
**Chain:** `Comes from:` no recipe makes it. Salvage inflow (phase 1), found at Dead scrubber bay (weight 0.5) and Flooded sump (0.6), one at a time. `Goes into:` Desalt brine (Purifier, -> Water pouch + Salt cake); Distil brine (Still, -> Distilled water + Salt cake); Evaporate brine feed (Still, -> Nutrient mix + Water pouch); Grow brine strain (Algae tank, needs the Algae strains disc).
**Note:** It is the main source of Salt cake in this domain.

## Air and gas

### Gas canister (`it_life_canister`) — tier 1 · 1x2 · worth 2$
**What it is:** A dented steel canister with a screw valve, relabelled, sold empty.
**Function:** A reusable vessel for oxygen or hydrogen: fill, use, empty, repeat.
**Chain:** `Comes from:` salvage inflow (phase 1), found at Dark bunks (0.3), Dead scrubber bay (0.5, one or two) and Flooded sump (0.4); also returned by Empty oxygen canister and Empty hydrogen canister. `Goes into:` Fill oxygen canister and Fill hydrogen canister, each with a Gas bladder, by hand.
**Note:** No recipe makes a canister from nothing; you only get them from salvage.

### Oxygen canister (`it_life_oxygen`) — tier 1 · 1x2 · worth 4$
**What it is:** A full canister of breathing gas with a green band at the neck.
**Function:** Sold to the air need (1 unit); the Clinic and Works stock racks of them.
**Chain:** `Comes from:` Fill oxygen canister by hand (1 Gas canister + 1 Gas bladder). `Goes into:` Empty oxygen canister, which returns the canister and bladder. No orders name it.

### Hydrogen canister (`it_life_hydrogen`) — tier 1 · 1x2 · worth 5$
**What it is:** A canister of hydrogen with a red band, fuel for reactor crews and cell shops.
**Function:** Sold to the power need (0.5).
**Chain:** `Comes from:` Fill hydrogen canister by hand (1 Gas canister + 1 Gas bladder). `Goes into:` Empty hydrogen canister. No orders name it.
**Note:** The Gas regulator's note says it is a tool in the hydrogen fill, but the fill recipe in this ledger does not list it.

### Foul air bladder (`it_life_foul_air`) — tier 1 · 1x2 · worth 0.5$
**What it is:** A bladder of warm, sour exhaled air collected from bunk vents.
**Function:** Waste feedstock: the scrubber strips its carbon and the algae tank eats it.
**Chain:** `Comes from:` no recipe makes it; salvage inflow (phase 1), collected by scavengers. `Goes into:` Scrub foul air (Scrubber, 3 -> 1 Carbon dust + 2 Gas bladder); Strip foul air deep (Scrubber, with the Scrubber profiles disc, 4 -> 3 Carbon dust + 1 bladder); Grow algae on breath, Grow algae full feed, Grow dense strain and Grow brine strain (Algae tank). Six recipes in all.

### Mask refill (`it_life_mask_refill`) — tier 1 · 1x1 · worth 4$
**What it is:** A thumb-sized cartridge of breathing gas that clips into a mask.
**Function:** A consumable sold to the air need (0.5).
**Chain:** `Comes from:` Fill mask refills by hand (4 Gas bladder + 1 Polymer flake -> 4); sold at Works hardware (x1.1) and the Spine swap stall (x1.3); a gated find at Dead scrubber bay. `Goes into:` nothing; it is an end product.

### Air puck (`it_life_air_puck`) — tier 1 · 1x1 · worth 5$
**What it is:** A grey puck of salt and carbon that sits in a bunk vent and softens the air.
**Function:** Spine-grade air filter (1 unit of the air need), spent in about a month.
**Chain:** `Comes from:` Press air pucks by hand (5 Salt cake + 5 Carbon dust + 1 Polymer flake -> 5); Regenerate pucks at the Scrubber (needs the Scrubber profiles disc, 2 Spent puck -> 2 Air puck + 1 Gas bladder). `Goes into:` orders from the Bunker (charity air x2, rush filters x2). No recipe consumes it.

### Spent puck (`it_life_puck_spent`) — tier 1 · 1x1 · worth 2$
**What it is:** An air puck gone dark and heavy with breath.
**Function:** Raw material for regeneration, and the Union wants some back.
**Chain:** `Comes from:` no recipe makes it; salvage inflow (phase 1), found at Dark bunks (0.4, one or two). `Goes into:` Regenerate pucks (Scrubber); the Union's order for returned filters (x6).

### Sealed rebreather (`it_life_rebreather`) — tier 2 · 2x2 · worth 30$
**What it is:** A full-face mask with its own cartridge and a polymer skirt stitched to cloth.
**Function:** A high-value air item (3 units of the air need) that gets you through a leak.
**Chain:** `Comes from:` Assemble rebreather by hand (1 Polymer sheet + 1 Air cartridge + 1 Fibre lint); Works hardware sells it (x1.2); a gated find at Flooded sump. `Goes into:` nothing.

### Oxygen candle (`it_life_oxygen_candle`) — tier 2 · 1x2 · worth 12$
**What it is:** A salt-and-iron block that burns without flame inside its tin and gives off oxygen.
**Function:** An emergency air item (2 units of the air need).
**Chain:** `Comes from:` Sinter oxygen candle at the Scrubber (needs the Scrubber profiles disc; 2 Salt cake + 1 Iron scrap). `Goes into:` nothing.
**Note:** A chemical candle, not a flame: legal (not contraband), though security glances at it.

## Feed, algae and tools

### Nutrient mix (`it_life_nutrient`) — tier 1 · 1x1 · worth 2$
**What it is:** Grey salts with a little paste stirred in, sold in a twist of film.
**Function:** Hydroponic feed; it has no market need of its own and is used as an input.
**Chain:** `Comes from:` Mix nutrient by hand (5 Salt cake + 1 Biomass paste -> 5); Mix nutrient with algae by hand (10 Salt cake + 2 Algae mat); Evaporate brine feed at the Still. `Goes into:` 20 recipes, mostly hydro tray and rack crops (greens, beans, potatoes, herbs, tomatoes) and algae growing; orders from the Technician (x3) and the Ring Council farm repair (x4).

### Fruiting mix (`it_life_nutrient_rich`) — tier 2 · 1x1 · worth 8$
**What it is:** Nutrient mix with reagent worked in, blue-tinged, for plants that have to flower.
**Function:** Intended orchard and rack feed.
**Chain:** `Comes from:` Mix fruiting feed by hand (5 Nutrient mix + 1 Biomass paste + 1 Reagent dregs -> 5). `Goes into:` nothing in the ledger.
**Note:** Dead end for now: its own note says food recipes are expected to use it, and until then it is recyclable.

### Algae mat (`it_life_algae`) — tier 1 · 2x1 · worth 2$
**What it is:** A wet green mat lifted from the algae tank.
**Function:** Vat feedstock that also cleans the air; sold in orders.
**Chain:** `Comes from:` the Algae tank: Grow algae (5 Nutrient mix + 3 Greywater -> 6), Grow algae on breath (4 Foul air + 2 Greywater -> 4), Grow algae full feed (-> 10) and Grow brine strain (with the Algae strains disc). `Goes into:` Press algae (-> Biomass paste + Water pouch); Mix nutrient with algae; Culture mat from algae (Bioreactor); Run moonshine (Still, with a Bottle); the Technician's algae repair order (x2).

### Dense algae (`it_life_algae_dense`) — tier 2 · 2x1 · worth 7$
**What it is:** A pressed block of deep-green algae from a fast strain, twice the biomass.
**Function:** An input for biomass paste.
**Chain:** `Comes from:` Grow dense strain at the Algae tank (Algae strains disc; 4 Foul air + 1 Greywater -> 2). `Goes into:` Press dense algae by hand (2 -> 4 Biomass paste + 1 Water pouch).

### Water tester (`it_life_tester_strip`) — tier 1 · 1x1 · worth 2$
**What it is:** A paper strip that turns from yellow to blue in clean water.
**Function:** A single-use information item for the water readout.
**Chain:** `Comes from:` Cut tester strips by hand (3 Fibre lint + 1 Salt cake -> 10). `Goes into:` nothing.
**Note:** The data says it has no stat effect yet.

### Gas regulator (`it_life_regulator`) — tier 2 · 1x2 · worth 24$
**What it is:** A valve and short pipe brazed into a pressure regulator.
**Function:** A tool for the hydrogen fill that wears down to scrap.
**Chain:** `Comes from:` Braze regulator by hand (1 Valve + 1 Pipe). `Goes into:` no recipe lists it as an input or tool in this ledger.
**Note:** Its description says hydrogen only goes through one, yet Fill hydrogen canister does not require it here.
