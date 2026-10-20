# Luxury and comfort: cloth, paper, drink, art and fire

This domain holds everything people buy for comfort and show rather than survival: textiles and bedding, paper and printed matter, perfume and soap, drink, ceramics, jewellery, art, and the banned fire goods. Raw fibre (lint, rags) becomes paper, yarn and cloth, which become garments, furnishings and prints. Sugar, algae and water become drink. Noble flakes and copper become jewellery.

In the game's loop (scrap -> crusher/recycler -> materials -> machines -> goods -> sold), these sit near the end. Fibre and other materials arrive from scrap; machines such as the Pulper, Loom, Document printer, Kiln, Still and Jeweller's bench turn them into goods; and the goods sell to the comfort and luxury needs. Tier 1 items are cheap staples and tier 3 to 4 items are Ring-grade showpieces. Fire items (candles, matches, lighters) and unlicensed moonshine are contraband: they sell mostly through the fence, the black market and collectors. A handful of heirlooms have no recipe at all and enter only through salvage, scavenging or sellers.

## Paper and printing

### Paper (`it_lux_paper`) — tier 1 · 2x2 · worth 2$
**What it is:** A grey pressed sheet with the fibre still visible in the grain.
**Function:** The base material for everything printed, folded or burnt; also sold to clerks.
**Chain:** `Comes from:` the Pulper: Pulp lint (1 Fibre lint -> 2) and Pulp rags (1 Rags -> 4). `Goes into:` Press pasteboard (Pulper), Print book and Print pamphlets (Document printer), Print art (Banner printer), Cut matches (Fabricator, Fire blueprints) and Fold matchbox by hand, and 5 more including service manuals, label rolls and order slips; orders from the Clerk (paper x3, store repair x4).

### Pasteboard (`it_lux_board`) — tier 2 · 2x2 · worth 8$
**What it is:** Paper pressed three deep and dried flat, stiff enough for covers and cards.
**Function:** An intermediate for playing cards.
**Chain:** `Comes from:` Press pasteboard at the Pulper (3 Paper -> 1). `Goes into:` Print cards (Document printer, with Carbon dust -> 2 Playing cards). Nothing else.

### Printed book (`it_lux_printed_book`) — tier 2 · 2x3 · worth 14$
**What it is:** Machine-set pages in a board cover, the ink sharp.
**Function:** Sold to the luxury need (0.88); the craft version of the old book.
**Chain:** `Comes from:` Print book at the Document printer (3 Paper + 1 Carbon dust). `Goes into:` nothing; no order names it.

### Pamphlet (`it_lux_pamphlet`) — tier 2 · 1x2 · worth 6.5$
**What it is:** Two folded sheets printed on one side.
**Function:** A small comfort item (0.25).
**Chain:** `Comes from:` Print pamphlets at the Document printer (4 Paper + 1 Carbon dust -> 2). `Goes into:` nothing.

### Playing cards (`it_lux_cards`) — tier 2 · 1x1 · worth 6$
**What it is:** A deck of fifty-two board squares, soft at the corners.
**Function:** A comfort item (1.5) found in every spine bunk.
**Chain:** `Comes from:` Print cards at the Document printer (1 Pasteboard + 1 Carbon dust -> 2). `Goes into:` nothing.

### Art print (`it_lux_print`) — tier 3 · 2x3 · worth 24$
**What it is:** Black ink on pressed paper, showing a planet nobody on the station has seen.
**Function:** A luxury art item (1.5), wanted by collectors.
**Chain:** `Comes from:` Print art at the Banner printer (4 Paper + 1 Carbon dust). `Goes into:` the Collector's art order (x1).

## Fibre, yarn and cloth

### Spun yarn (`it_lux_yarn`) — tier 1 · 1x1 · worth 2$
**What it is:** A hank of fibre twisted tight on the bench.
**Function:** An intermediate for cloth, scarves, wicks and suture kits.
**Chain:** `Comes from:` Spin yarn at the Workbench (1 Fibre lint -> 2). `Goes into:` Weave yarn (Loom, 2 -> 1 Cloth), Twist wicks (Workbench, 1 -> 5 Wick), Knit scarf (Loom, Garments disc) and Pack suture kit by hand.

### Cloth (`it_lux_cloth`) — tier 1 · 2x2 · worth 4$
**What it is:** A plain, slightly stiff undyed woven bolt.
**Function:** The base of garments, bandages, banners and furnishings.
**Chain:** `Comes from:` the Loom: Weave lint (1 -> 1), Weave rags (1 Rags -> 2), Weave yarn (2 Yarn -> 1); unpicking Spine overalls (-> 2 Cloth + 2 Fasteners) or a Blanket (-> 3 Cloth) by hand; found at Ring service corridor (0.6). `Goes into:` Sew overalls, gloves, curtain and Tailor ring coat, Knit scarf, Stitch blanket, Stuff cushion (all Loom with the Garments disc), and Print banner; 8 consuming recipes are listed in the ledger.

### Wick (`it_lux_wick`) — tier 1 · 1x1 · worth 0.5$
**What it is:** A braided yarn thread, stiff with use.
**Function:** A component for candles and lamps.
**Chain:** `Comes from:` Twist wicks at the Workbench (1 Spun yarn -> 5). `Goes into:` Dip candles and Build oil lamp (Fabricator with the Fire blueprints disc).

## Garments and furnishings

### Spine overalls (`it_lux_overalls`) — tier 2 · 2x3 · worth 18$
**What it is:** Heavy patched cloth fastened with salvage, standard below the Mid Decks.
**Function:** Spine-grade comfort (1.12).
**Chain:** `Comes from:` Sew overalls at the Loom (Garments disc; 2 Cloth + 2 Fasteners). `Goes into:` Unpick overalls by hand (-> 2 Cloth + 2 Fasteners). No order wants it.

### Work gloves (`it_lux_gloves`) — tier 2 · 1x2 · worth 12$
**What it is:** Cloth palms lined with polymer that stop a hot pipe burning the skin.
**Function:** A comfort item (3.0, the highest ratio for its price).
**Chain:** `Comes from:` Sew gloves at the Loom (Garments disc; 1 Cloth + 1 Polymer flake). `Goes into:` nothing.

### Ring coat (`it_lux_ring_coat`) — tier 3 · 3x3 · worth 110$
**What it is:** A long straight-cut coat of real dense cloth, never worn on the spine.
**Function:** A Ring-grade luxury item (1.72).
**Chain:** `Comes from:` Tailor ring coat at the Loom (Garments disc; 4 Cloth + 1 Polymer sheet). `Goes into:` nothing.

### Scarf (`it_lux_scarf`) — tier 2 · 1x3 · worth 10$
**What it is:** A long knitted strip of yarn and cloth, grey on grey.
**Function:** A comfort item (2.5).
**Chain:** `Comes from:` Knit scarf at the Loom (Garments disc; 1 Cloth + 1 Spun yarn); found at Ring service corridor (0.4). `Goes into:` nothing.

### Blanket (`it_lux_blanket`) — tier 2 · 3x2 · worth 24$
**What it is:** Three bolts of cloth stitched into one.
**Function:** A comfort item (1.5).
**Chain:** `Comes from:` Stitch blanket at the Loom (Garments disc; 3 Cloth). `Goes into:` Unpick blanket by hand (-> 3 Cloth); the Clerk's comfort order (x1).

### Cushion (`it_lux_cushion`) — tier 2 · 2x2 · worth 12$
**What it is:** A cloth case stuffed with lint.
**Function:** A comfort item (3.0).
**Chain:** `Comes from:` Stuff cushion at the Loom (Garments disc; 1 Cloth + 1 Fibre lint). `Goes into:` the Clerk's comfort order (x2).

### Curtain (`it_lux_curtain`) — tier 2 · 2x4 · worth 22$
**What it is:** Cloth hung on a polymer rail that gives a bunk a door.
**Function:** A comfort item (1.38).
**Chain:** `Comes from:` Sew curtain at the Loom (Garments disc; 2 Cloth + 1 Polymer flake). `Goes into:` nothing.

### Woven rug (`it_lux_rug`) — tier 2 · 3x2 · worth 24$
**What it is:** Old rag strips woven tight into a mat.
**Function:** Spine-grade comfort (1.88).
**Chain:** `Comes from:` Weave rug at the Loom (Garments disc; 2 Rags). `Goes into:` Unravel rug by hand (-> 2 Rags). No order wants it.

### Cloth banner (`it_lux_banner`) — tier 3 · 3x2 · worth 26$
**What it is:** Printed cloth hung from a pole, with a crew colour or slogan.
**Function:** A comfort and art item (1.62).
**Chain:** `Comes from:` Print banner at the Banner printer (2 Cloth + 1 Carbon dust). `Goes into:` nothing.

## Hygiene and scent

### Soap bar (`it_lux_soap`) — tier 2 · 1x1 · worth 4$
**What it is:** Grey fat boiled with salts and cut square, smelling of nothing.
**Function:** A small comfort item (0.5).
**Chain:** `Comes from:` Boil soap at the Chem bench (1 Plant oil + 1 Salt cake -> 2); found at Ring service corridor (0.5, one or two); Ring concierge sells it (x1.5). `Goes into:` nothing.

### Scent vial (`it_lux_scent`) — tier 2 · 1x1 · worth 40$
**What it is:** Spirit, petal oil and glass in a thumb-sized vial.
**Function:** A Ring-grade luxury item (2.5).
**Chain:** `Comes from:` Blend scent at the Chem bench (Perfumery disc; 1 Ethanol + 1 Glass vial + 1 Biomass paste); Ring concierge sells it (x1.5). `Goes into:` the Household's dinner order (x1).

### Cosmetic pot (`it_lux_cosmetic`) — tier 2 · 1x1 · worth 22$
**What it is:** Soot and fat, ground fine and sealed in glass.
**Function:** A Ring-grade luxury item (1.38).
**Chain:** `Comes from:` Grind cosmetic at the Chem bench (Perfumery disc; 1 Plant oil + 1 Carbon dust + 1 Glass vial); found at Ring service corridor (0.4). `Goes into:` nothing.

## Drink

### Wine must (`it_lux_must`) — tier 2 · 1x2 · worth 8$
**What it is:** Sweet cloudy mash in a flask that becomes wine if left alone.
**Function:** An intermediate for wine.
**Chain:** `Comes from:` Mix must by hand (6 Water pouch + 1 Biomass paste + 1 Reagent dregs -> 2). `Goes into:` Bottle wine (Still, Vintner disc, with a Bottle).

### Sugar wash (`it_lux_wash`) — tier 2 · 1x2 · worth 8$
**What it is:** Sugar and grey water gone sour, sharp and thin.
**Function:** An intermediate for the spirit still.
**Chain:** `Comes from:` Mix sugar wash by hand (2 Sugar + 3 Greywater -> 1). `Goes into:` Distil spirit (Still, Vintner disc, with a Bottle).

### Wine bottle (`it_lux_wine`) — tier 2 · 1x3 · worth 30$
**What it is:** A dark green glass bottle of wine, no year on it.
**Function:** A luxury drink (2.0).
**Chain:** `Comes from:` Bottle wine at the Still (Vintner disc; 1 Wine must + 1 Bottle). `Goes into:` the Household's wine (x2) and dinner (x2) orders and the Ring Council festival (x6).
**Note:** The empty glass vessel returns through the recycler.

### Spirit bottle (`it_lux_spirit`) — tier 2 · 1x3 · worth 45$
**What it is:** Clear, strong spirit run twice through the still, sold sealed with a company stamp.
**Function:** A licensed luxury drink (2.81, the highest drink value).
**Chain:** `Comes from:` Distil spirit at the Still (Vintner disc; 1 Sugar wash + 1 Bottle). `Goes into:` the Household's wine order (x1) and the Ring Council festival (x3).
**Note:** Tagged licensed.

### Moonshine (`it_lux_moonshine`) — tier 2 · 1x3 · worth 20$
**What it is:** Algae mash run through a still nobody admits to.
**Function:** Cheap spine-grade drink, sold to luxury (0.75) and comfort (0.5).
**Chain:** `Comes from:` Run moonshine at the Still, no disc needed (3 Algae mat + 1 Bottle); sellers on the Spine and Dock decks bring it (phase 2). `Goes into:` the Fence's moonshine order (x4) and the black market's spirits order (x6).
**Note:** Contraband (unlicensed).

## Ceramics

### Clay cup (`it_lux_cup`) — tier 1 · 1x1 · worth 1$
**What it is:** Fired grit, rough inside and plain outside.
**Function:** A minor comfort item (0.25) and a vessel.
**Chain:** `Comes from:` Fire cups at the Kiln (1 Grit -> 2); found at Ring service corridor (0.5). `Goes into:` nothing.
**Note:** Its worth of 1 is deliberately below the usual tier floor.

### Glazed vase (`it_lux_vase`) — tier 2 · 2x2 · worth 5.5$
**What it is:** A kiln-fired, green-glazed vase.
**Function:** A luxury and art item (0.88).
**Chain:** `Comes from:` Fire vase at the Kiln (3 Grit); found at Ring service corridor (0.2). `Goes into:` nothing.

## Games

### Dice (`it_lux_dice`) — tier 1 · 1x1 · worth 1.5$
**What it is:** Two polymer cubes with hand-drilled dots, one running a little heavy.
**Function:** A minor comfort item (0.25).
**Chain:** `Comes from:` Carve dice at the Workbench (1 Polymer flake -> 2). `Goes into:` nothing.

## Jewellery

### Copper ring (`it_lux_ring_copper`) — tier 2 · 1x1 · worth 12$
**What it is:** A plain band cut from wire, which turns the finger green.
**Function:** Spine-grade comfort (0.75).
**Chain:** `Comes from:` Set copper ring at the Jeweller's bench (Jewellery disc; 2 Copper wire -> 2). `Goes into:` nothing.

### Locket (`it_lux_locket`) — tier 2 · 1x2 · worth 40$
**What it is:** A gold locket whose hinge still closes, with someone else's keepsake inside.
**Function:** A heirloom-luxury item (2.5).
**Chain:** `Comes from:` salvage inflow (phase 1), found at Dark bunks (0.08) and Flooded sump (0.12); Set locket at the Jeweller's bench (Jewellery disc; 1 Noble flake -> 2). `Goes into:` the Collector's books order (x1).

### Signet ring (`it_lux_signet`) — tier 3 · 1x1 · worth 130$
**What it is:** A heavy gold-and-copper ring with a blank face for a name.
**Function:** A Ring-grade luxury item (2.03).
**Chain:** `Comes from:` Cast signet at the Jeweller's bench (Jewellery disc; 1 Noble flake + 1 Copper scrap); rarely found at Flooded sump (0.06). `Goes into:` the Ring Council gifts order (x2).

### Gold chain (`it_lux_chain`) — tier 3 · 1x2 · worth 125$
**What it is:** A single hand-set strand of noble metal.
**Function:** A Ring-grade luxury item (1.95).
**Chain:** `Comes from:` Draw chain at the Jeweller's bench (Jewellery disc; 1 Noble flake). `Goes into:` the Ring Council gifts order (x1).

### Wristwatch (`it_lux_watch`) — tier 3 · 1x1 · worth 200$
**What it is:** A wound steel-cased watch that runs eleven minutes slow.
**Function:** The top heirloom-luxury item (3.0).
**Chain:** `Comes from:` no recipe; seller inflow (collectors, phase 3), or a very rare find at Ring service corridor (0.02). `Goes into:` the Collector's watch order (x1).

## Art and heirlooms

### Polymer sculpture (`it_lux_sculpture`) — tier 3 · 2x3 · worth 80$
**What it is:** A figure printed layer by layer with the layer lines left in.
**Function:** A luxury art item (1.25).
**Chain:** `Comes from:` Print sculpture at the 3D printer (Model art disc; 4 Polymer sheet). `Goes into:` the Collector's art order (x1).

### Gilt ornament (`it_lux_ornament`) — tier 4 · 2x2 · worth 140$
**What it is:** A printed polymer scroll with a skin of noble metal.
**Function:** Ring-grade decoration (0.55).
**Chain:** `Comes from:` Print gilt ornament at the 3D printer (Model art disc; 2 Polymer sheet + 1 Noble flake). `Goes into:` the Ring Council gifts order (x1).
**Note:** Its need value is low for its price, so it is valued as a gift.

### Book (`it_lux_book`) — tier 2 · 2x3 · worth 20$
**What it is:** An old leather-bound book with the title worn off.
**Function:** A heirloom-luxury item (1.0).
**Chain:** `Comes from:` no recipe; salvage inflow (phase 1), found at Dark bunks (0.15). `Goes into:` the Collector's books order (x2).
**Note:** Nobody makes these; the Printed book is the craft version.

### Old photograph (`it_lux_photograph`) — tier 2 · 1x1 · worth 30$
**What it is:** A silvered paper print of an unknown face.
**Function:** A heirloom-luxury item (1.5).
**Chain:** `Comes from:` no recipe; salvage inflow (phase 1), found at Spine ducts (0.04), Dark bunks (0.2) and Sealed hatch row (0.1). `Goes into:` the Collector's books order (x1).

### Wooden horse (`it_lux_wooden_horse`) — tier 2 · 2x2 · worth 45$
**What it is:** A toy horse carved from one piece of real wood, wheels long gone.
**Function:** A heirloom toy (2.0).
**Chain:** `Comes from:` no recipe; seller inflow (phase 2). `Goes into:` nothing.
**Note:** Wood no longer grows aboard.

### Wooden bowl (`it_lux_wooden_bowl`) — tier 2 · 2x2 · worth 55$
**What it is:** A hand-turned bowl of real wood.
**Function:** A heirloom comfort item (2.5).
**Chain:** `Comes from:` no recipe; seller inflow (phase 2). `Goes into:` nothing.

### Music box (`it_lux_music_box`) — tier 4 · 2x2 · worth 220$
**What it is:** A brass comb and pinned drum with a hand crank that plays one flat tune.
**Function:** The most valuable item here (3.0).
**Chain:** `Comes from:` no recipe; seller inflow (phase 3). `Goes into:` the Collector's watch order (x1).

## Fire goods (all contraband: fire)

### Candle (`it_lux_candle`) — tier 1 · 1x3 · worth 6$
**What it is:** A taper of wax and wick that gives light when the power is out.
**Function:** Light and comfort (0.75); the fence trades them.
**Chain:** `Comes from:` Dip candles at the Fabricator (Fire blueprints disc; 1 Sugar + 1 Wick -> 2); salvage inflow (phase 1), found at Dark bunks (0.35). `Goes into:` the Collector's fire order (x2) and the black market's fire order (x3).
**Note:** Fire is banned aboard; residents buy them quietly.

### Matchbox (`it_lux_matchbox`) — tier 1 · 2x1 · worth 1$
**What it is:** A small box that holds ten matches.
**Function:** A container and comfort item (0.25).
**Chain:** `Comes from:` Fold matchbox by hand (2 Paper -> 5); salvage inflow (phase 1), found at Dark bunks (0.3). `Goes into:` the Collector's fire order (x1).

### Match (`it_lux_match`) — tier 1 · 1x1 · worth 0.2$
**What it is:** A single strike's worth of light.
**Function:** A small comfort item (0.1).
**Chain:** `Comes from:` Cut matches at the Fabricator (Fire blueprints disc; 1 Paper -> 10); salvage inflow (phase 1), found at Spine ducts (0.3, up to 3). `Goes into:` the black market's fire order (x6). No recipe uses it.

### Disposable lighter (`it_lux_lighter`) — tier 1 · 1x2 · worth 4$
**What it is:** A cheap plastic lighter that is rubbish once empty.
**Function:** Comfort (0.5), traded through the fence.
**Chain:** `Comes from:` Mould lighters at the Fabricator (Fire blueprints disc; 3 Polymer sheet + 1 Reagent dregs -> 10); salvage inflow (phase 1), found at Dark bunks (0.25). `Goes into:` the Fence's lighters order (x3).

### Refillable lighter (`it_lux_zippo`) — tier 2 · 2x2 · worth 30$
**What it is:** A brushed chrome lighter with a click lid.
**Function:** Luxury (1.0) and comfort (0.5); holds one flask of fluid, and spirit also works.
**Chain:** `Comes from:` Press zippo cases at the Fabricator (Fire blueprints disc; 2 Device housing -> 4 Refillable lighters + 1 Polymer flake); salvage inflow (phase 2), rarely at Ring service corridor (0.08). `Goes into:` the Collector's fire order (x1).

### Lighter fluid (`it_lux_lighter_fluid`) — tier 2 · 1x1 · worth 4$
**What it is:** A flask of thin, sweet-smelling solvent.
**Function:** Refills a lighter or feeds a lamp; comfort (0.5).
**Chain:** `Comes from:` Mix lighter fluid at the Chem bench (3 Reagent dregs + 1 Gas bladder -> 4). `Goes into:` the Fence's lighters order (x2). No recipe consumes it.

### Flint striker (`it_lux_striker`) — tier 2 · 1x2 · worth 22$
**What it is:** A bar of iron and rare earth with a steel scraper that throws sparks.
**Function:** A durable spine alternative to matches; comfort (0.5).
**Chain:** `Comes from:` Forge strikers at the Fabricator (Fire blueprints disc; 1 Iron bar + 1 Rare dust -> 5). `Goes into:` the Fence's lighters order (x1).

### Oil lamp (`it_lux_oil_lamp`) — tier 2 · 1x3 · worth 30$
**What it is:** A glass-chimney lamp on a light-metal body with a braided wick, giving a real flame.
**Function:** Comfort (1.5); burns lamp oil or fluid (food oil also burns).
**Chain:** `Comes from:` Build oil lamp at the Fabricator (Fire blueprints disc; 1 Device housing + 1 Glass vial + 1 Wick). `Goes into:` nothing.
