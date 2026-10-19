# Medicine (med) reader's guide

These are the 38 medical items: chemicals, pills, wound-care supplies, packed medical kits and a few contraband drugs. Almost all are tagged to the `need_medicine` market need, so they are goods you make and sell, mostly to clinic and ward customers (the Clinic, orderlies, smelter hands, fitters, engineers) and, for the drugs, to the fence and the black market.

In the overall loop (scrap -> crusher/recycler -> materials -> machines -> goods -> sold), medicine sits at the goods end. Its raw input is mostly reagent dregs, biomass paste, carbon dust and glass vials, which come out of scrap processing; the Chem bench and Still refine them into purified reagent, flasks and solvents, the Pill press and Synthesiser turn those into pills, and hand recipes pack pills into blister cards and cards into kits and crates.

Two things to know when reading the chains. First, blister cards are reversible: a filled blister can be punched back out into its pills and an empty card. Second, most recipes here need a discipline (blueprint disc) such as Chem basics, Analgesics, Sedatives, Antibiotics, Stimulants, Narcotics or Regenerative.

Groups below: chemicals and reagents, pills, blister packaging, wound care, packed kits, ring-grade products, contraband.

## Chemicals and reagents

### Ethanol (`it_med_ethanol`) — tier 1 · 1x2 · worth 6$
**What it is:** Clear lab spirit in a stoppered 1x2 vial; it wipes wounds and is drunk by the desperate.
**Function:** An intermediate: the base for antiseptic and for scent. Not wanted by any order.
**Chain:** `Comes from:` Three recipes make it: Distil ethanol (Chem bench, Chem basics) from reagent dregs plus a glass vial; Distil sugar (Still, Chem basics) from sugar plus a vial; Ferment paste (Still, no disc, takes nights) from biomass paste plus a vial. Also found in the Clinic back room (about 30% weight, 1 unit). `Goes into:` Mix antiseptic (Chem bench, Chem basics) makes 2 Antiseptic from 1 ethanol and a vial; Blend scent (Chem bench, Perfumery) uses it to make a Scent vial.
**Note:** Fermenting paste on the Still needs no discipline; the other two do.

### Purified reagent (`it_med_reagent_pure`) — tier 1 · 1x1 · worth 6$
**What it is:** A sealed vial of clear, decanted reagent, pharmacy grade or near enough.
**Function:** The main feedstock for pills: pressing and brewing recipes consume it. Not wanted by orders directly.
**Chain:** `Comes from:` Purify reagent (Chem bench, Chem basics): 3 reagent dregs -> 3 purified reagent. Crack paste to reagent (Chem bench): 2 biomass paste + carbon dust -> 2 purified reagent and 1 paste back. It is also a by-product of Synthesise antibiotics and Synthesise antivirals. `Goes into:` Press painkillers, Press burn tabs, Press sleeping pills, Press calmers (all Pill press), Brew stims (Chem bench) and Synthesise anti-radiation tabs, and Synthesise dream tabs/blue ampoules (Narcotics); 8 recipes in all, so it is the hub of the whole domain.

### Acid flask (`it_med_acid`) — tier 2 · 1x2 · worth 8$
**What it is:** An etched glass flask of reagent and salts with a waxed stopper; it burns skin and clears scale.
**Function:** An intermediate used only to make antibiotics.
**Chain:** `Comes from:` Cook acid (Chem bench, Chem basics): 2 reagent dregs + salt cake + 2 glass vials -> 2 acid flasks. `Goes into:` Synthesise antibiotics (Synthesiser, Antibiotics): 2 acid flasks + 2 biomass paste -> 10 antibiotics. That is its only use.

### Base flask (`it_med_base`) — tier 2 · 1x2 · worth 8$
**What it is:** A flask of reagent cooked with carbon ash; a slick lye handled with tongs.
**Function:** An intermediate used only to make antivirals.
**Chain:** `Comes from:` Cook base (Chem bench, Chem basics): 2 reagent dregs + carbon dust + 2 glass vials -> 2 base flasks. `Goes into:` Synthesise antivirals (Synthesiser, Antibiotics): 2 base flasks + rare dust + biomass paste -> 10 antivirals. Only use.

### Solvent (`it_med_solvent`) — tier 2 · 1x2 · worth 9$
**What it is:** Sharp-smelling spirit thinned with gas and bottled; it strips paint and dissolves resin.
**Function:** An intermediate whose only use is the narcotic route to Blue ampoules.
**Chain:** `Comes from:` Mix solvent (Chem bench, Chem basics): reagent dregs + gas bladder + glass vial -> 1 solvent. `Goes into:` Cook blue ampoules (Chem bench, Narcotics): solvent + vial -> 2 blue ampoules. No orders want it directly.

## Pills

### Painkiller (`it_med_painkiller`) — tier 1 · 1x1 · worth 2$
**What it is:** A white scored tablet that takes the edge off a sore back and a long shift.
**Function:** A sold medicine and the basic pill; also the filling for painkiller blisters.
**Chain:** `Comes from:` Press painkillers (Pill press, Analgesics): 1 purified reagent -> 10 painkillers. Punch out painkillers (by hand) from a painkiller blister gives 6 plus a blister card. Also found in the Clinic back room (about 50% weight, 1-2). `Goes into:` Orders: Shift meds (smelter hand, 4), Ward stock (orderly, 6), Clinic staples (Clinic, 10). Fill painkiller blister (by hand) packs 6 into a card.

### Antibiotic (`it_med_antibiotic`) — tier 2 · 1x1 · worth 5$
**What it is:** A yellow capsule-shaped tablet; a course is six and the clinic counts them back.
**Function:** A sold medicine for clinic orders; the main clinic product.
**Chain:** `Comes from:` Synthesise antibiotics (Synthesiser, Antibiotics): 2 acid flasks + 2 biomass paste -> 10 antibiotics, plus a purified reagent, paste, salt cake and grit back. Punch out antibiotics (by hand) from a blister gives 6. `Goes into:` Orders: Ward stock (3), Free ward (3), Antibiotic trial (8), Fever ward rush (4), from the orderly and the Clinic. Fill antibiotic blister (by hand) packs 6 into a card.

### Sleeping pill (`it_med_sleeping_pill`) — tier 1 · 1x1 · worth 3$
**What it is:** A small blue tablet for eight dull hours and a clear head.
**Function:** A sedative sold as medicine; low value.
**Chain:** `Comes from:` Press sleeping pills (Pill press, Sedatives): 1 purified reagent -> 10 pills. `Goes into:` Order: Ward stock (orderly, 2). Fill sleeping blister (by hand) packs 6 into a card.

### Burn tab (`it_med_burn_tab`) — tier 2 · 1x1 · worth 3$
**What it is:** A grey tablet of carbon and reagent that eases scald and weld-flash pain.
**Function:** A sold wound medicine for fitters and smelter hands.
**Chain:** `Comes from:` Press burn tabs (Pill press, Analgesics): purified reagent + carbon dust -> 10 burn tabs. `Goes into:` Orders: Burn kit (fitter, 4), Shift meds (smelter hand, 2). Fill burn tab blister (by hand) packs 6 into a card.

### Calmer (`it_med_calmer`) — tier 2 · 1x1 · worth 6$
**What it is:** A salty white tablet that unwinds the jaw and ends a stim early.
**Function:** A sedative that clears the 'wired' status. No order wants it and nothing consumes it, so it is sold to the market only.
**Chain:** `Comes from:` Press calmers (Pill press, Sedatives): purified reagent + salt cake -> 5 calmers. `Goes into:` Nothing: no recipe or order uses it.
**Note:** The data says ending a stim early costs the +1 energy already spent rather than refunding it.

### Stim (`it_med_stim`) — tier 2 · 1x1 · worth 8$
**What it is:** An orange, bitter tablet: a shift of borrowed energy repaid with interest next morning.
**Function:** The strong stimulant, a drug for the market. No order wants it.
**Chain:** `Comes from:` Brew stims (Chem bench, Stimulants): 1 purified reagent -> 5 stims. `Goes into:` Nothing: no recipe or order uses it.
**Note:** Pressed at only 5 per reagent so the margin stays high on purpose; the data calls it the dear end of the bench.

### Energy tab (`it_med_energy_tab`) — tier 1 · 1x1 · worth 2$
**What it is:** Sugar and a pinch of reagent pressed into a sweet tablet.
**Function:** The mild stimulant: a small lift with no status and no crash.
**Chain:** `Comes from:` Press energy tabs (Chem bench, Stimulants): sugar + reagent dregs -> 10 energy tabs. `Goes into:` Order: Night shift (engineer, 6). No recipe uses it.
**Note:** Gives +1 energy now and no status, so no crash; cheap enough to be a habit.

### Antiviral (`it_med_antiviral`) — tier 3 · 1x1 · worth 10$
**What it is:** A pale green tablet with rare earth in the binder; ring clinics stock it by the tray.
**Function:** A ring-grade medicine; the dearest pill.
**Chain:** `Comes from:` Synthesise antivirals (Synthesiser, Antibiotics): 2 base flasks + rare dust + biomass paste -> 10 antivirals, plus purified reagent, carbon dust and grit back. `Goes into:` Fill antiviral blister (by hand) packs 6 into a card. No order wants the loose pill.

### Anti-radiation tab (`it_med_antirad`) — tier 3 · 1x1 · worth 10$
**What it is:** A chalky lithium tablet taken before a shift near the core.
**Function:** A sold medicine for core crews.
**Chain:** `Comes from:` Synthesise anti-radiation tabs (Synthesiser, Antibiotics): purified reagent + 2 lithium salt + salt cake -> 10 tabs. `Goes into:` Order: Antirad for the crew (engineer, 6). Fill anti-rad blister (by hand) packs 6 into a card.

## Blister cards (empty and filled)

### Blister card (`it_med_blister`) — tier 1 · 2x1 · worth 1$
**What it is:** An empty foil card of six pockets; pills push out through the back and do not go back in.
**Function:** Packaging: the container every filled blister is built from.
**Chain:** `Comes from:` Press blister cards (Pill press, no disc): polymer flake + light scrap -> 10 cards. Also returned whenever a filled blister is punched out by hand (painkiller, antibiotic, dream). Found in the Clinic back room (about 40% weight, 1). `Goes into:` 7 fill recipes (painkiller, antibiotic, sleeping, antiviral, anti-rad, burn tab, dream) each take one card plus 6 pills. No order wants the empty card.
**Note:** Despite 'does not go back in', the punch-out recipes do hand the card back.

### Painkiller blister (`it_med_fb_painkiller`) — tier 1 · 2x1 · worth 13$
**What it is:** Six white tablets in a foil card; they only come out.
**Function:** A 2x1 packed form of painkillers, worth far more than six loose pills.
**Chain:** `Comes from:` Fill painkiller blister (by hand): blister card + 6 painkillers. `Goes into:` Punch out painkillers reverses it; Pack ward crate (by hand) uses 2 of these plus 2 antibiotic blisters and a polymer crate to make a Ward pack. No order wants it directly.

### Antibiotic blister (`it_med_fb_antibiotic`) — tier 2 · 2x1 · worth 31$
**What it is:** Six yellow tablets in foil: a full course, if nobody shares.
**Function:** Packed antibiotics; one order asks for them in this form.
**Chain:** `Comes from:` Fill antibiotic blister (by hand): blister card + 6 antibiotics. `Goes into:` Order: Antibiotic trial (Clinic, 2). Pack ward crate uses 2; Punch out antibiotics reverses it.

### Sleeping blister (`it_med_fb_sleeping_pill`) — tier 1 · 2x1 · worth 19$
**What it is:** Six blue tablets in foil: six nights of sleep, or one very long one.
**Function:** Packed sleeping pills, for sale only.
**Chain:** `Comes from:` Fill sleeping blister (by hand): blister card + 6 sleeping pills. `Goes into:` Nothing: no recipe or order uses it, and there is no punch-out recipe for it.
**Note:** Unlike painkiller, antibiotic and dream blisters, this one cannot be unpacked by any recipe in the ledger.

### Burn tab blister (`it_med_fb_burn_tab`) — tier 2 · 2x1 · worth 19$
**What it is:** Six grey tablets in foil; works crews carry one in the overalls.
**Function:** Packed burn tabs, mainly an ingredient of the Burn pack.
**Chain:** `Comes from:` Fill burn tab blister (by hand): blister card + 6 burn tabs. `Goes into:` Pack burn tub (by hand) uses 2 of them with 2 burn gel and a polymer tub to make a Burn pack. No order wants it directly; no punch-out recipe.

### Antiviral blister (`it_med_fb_antiviral`) — tier 3 · 2x1 · worth 61$
**What it is:** Six pale green tablets in foil with a ring pharmacy stamp.
**Function:** Packed antivirals; ring-grade product.
**Chain:** `Comes from:` Fill antiviral blister (by hand): blister card + 6 antivirals. `Goes into:` Order: Isolation ward (orderly, 2). No other use.

### Anti-rad blister (`it_med_fb_antirad`) — tier 3 · 2x1 · worth 61$
**What it is:** Six chalky tablets in foil; core crews buy them by the strip.
**Function:** Packed anti-radiation tabs, for sale only.
**Chain:** `Comes from:` Fill anti-rad blister (by hand): blister card + 6 anti-radiation tabs. `Goes into:` Nothing: no recipe or order uses it.

## Wound care

### Gauze pad (`it_med_gauze`) — tier 1 · 1x1 · worth 1.5$
**What it is:** A square of loose-woven gauze folded twice, sterile until opened.
**Function:** The raw dressing material; sold directly or rolled into bandages.
**Chain:** `Comes from:` Weave gauze (Loom): 1 fibre lint -> 4 pads. Weave gauze from rags (Loom): 1 rags -> 8 pads. Found in the Clinic back room (about 70% weight, 1-2). `Goes into:` Roll bandage (by hand): 2 pads -> 1 bandage. Orders: Wound table (orderly, 6), Clinic staples (8), Weekly dressings (Clinic, 6).

### Bandage (`it_med_bandage`) — tier 1 · 1x2 · worth 4$
**What it is:** A gauze roll with a steel clip, boiled and re-rolled until it frays.
**Function:** The standard wound dressing; sold and used in kits.
**Chain:** `Comes from:` Weave bandage roll (Loom): 1 fibre lint -> 2 bandages. Roll bandage (by hand) from 2 gauze pads. Unpacking a First-aid kit or Wound pack also returns bandages. Found in the Clinic back room (about 50%, 1). `Goes into:` Orders: Burn kit (fitter, 2), Wound table (4), Clinic staples (6), Weekly dressings (4). Pack first-aid kit and Pack wound tub use it.

### Antiseptic (`it_med_antiseptic`) — tier 1 · 1x2 · worth 6$
**What it is:** A brown dropper bottle of ethanol and iodine salts; it stings, which is the point.
**Function:** A wound-care liquid sold directly and packed into kits.
**Chain:** `Comes from:` Mix antiseptic (Chem bench, Chem basics): ethanol + vial -> 2. Cut antiseptic (Chem bench): reagent dregs + 2 vials -> 2 (no ethanol needed). Also from unpacking kits. Found in the Clinic back room (about 20%, 1). `Goes into:` Orders: Shift meds (smelter hand, 1), Wound table (2), Clinic staples (3), Weekly dressings (2). Pack first-aid kit and Pack wound tub use it.

### Burn gel (`it_med_burn_gel`) — tier 2 · 1x2 · worth 8$
**What it is:** A cool clear gel in a squeeze tube, oil and reagent; goes on scalds and weld burns.
**Function:** A burn treatment and the feedstock for regrowth gel.
**Chain:** `Comes from:` Mix burn gel (Chem bench, Chem basics): plant oil + reagent dregs -> 2 gel. `Goes into:` Order: Burn kit (fitter, 2). Pack burn tub uses 2 per Burn pack; Synthesise regrowth gel (Synthesiser, Regenerative) takes 5 gel plus rare dust.

### Suture kit (`it_med_suture_kit`) — tier 2 · 1x1 · worth 12$
**What it is:** A curved needle, waxed thread and a sealed wipe for a cut that will not close.
**Function:** A wound item, sold for orderly orders.
**Chain:** `Comes from:` Pack suture kit (by hand): spun yarn + fasteners -> 1 kit. `Goes into:` Order: Wound table (orderly, 1). No recipe uses it.

### Splint (`it_med_splint`) — tier 2 · 1x3 · worth 24$
**What it is:** A light-alloy strip with a padded lining and two straps, to hold a broken arm straight.
**Function:** A wound item for sale; the dearest of the basic wound goods.
**Chain:** `Comes from:` Fit splint (by hand): light scrap + padding -> 1 splint. `Goes into:` Nothing: no recipe or order uses it.

### Saline drip (`it_med_saline_drip`) — tier 2 · 1x2 · worth 14$
**What it is:** A soft bag of sterile saline with a line and a clamp.
**Function:** A clinic good.
**Chain:** `Comes from:` Hang saline drip (by hand): saline water + polymer tube -> 1 drip. `Goes into:` Orders: Free ward (Clinic, 2), Fever ward rush (Clinic, 2).

### Rehydration mix (`it_med_rehydration_mix`) — tier 1 · 1x1 · worth 5$
**What it is:** A sachet of sugar and salt to stir into a pouch of water.
**Function:** A cheap clinic good that ends the shakes after a vent shift.
**Chain:** `Comes from:` Mix rehydration sachets (by hand): sugar + salt cake -> 2 sachets. `Goes into:` Orders: Free ward (Clinic, 4), Fever ward rush (Clinic, 4).

## Packed kits and bulk packs

### First-aid kit (`it_med_first_aid_kit`) — tier 2 · 3x2 · worth 22$
**What it is:** A 3x2 clip-lid tub holding two bandages and a bottle of antiseptic.
**Function:** A packed good; bundling lifts value (22 against 14 for the contents).
**Chain:** `Comes from:` Pack first-aid kit (by hand): polymer tub + 2 bandages + antiseptic. `Goes into:` Order: Isolation ward (orderly, 1). Unpack first-aid kit reverses it.

### Wound pack (`it_med_pack_wound`) — tier 2 · 2x2 · worth 35$
**What it is:** A sealed tub of four bandages and two antiseptic bottles; the standing order of every works clinic.
**Function:** Bulk pack for clinic and orderly customers.
**Chain:** `Comes from:` Pack wound tub (by hand): polymer tub + 4 bandages + 2 antiseptic. `Goes into:` No order in the ledger wants it; Unpack wound tub reverses it.
**Note:** Described as a bulk pack for the Clinic and orderlies, yet no listed order names it.

### Burn pack (`it_med_pack_burn`) — tier 3 · 2x2 · worth 64$
**What it is:** A tub of two gel tubes and two cards of burn tabs, labelled for the foundry deck.
**Function:** Bulk pack for works and core decks; dead end.
**Chain:** `Comes from:` Pack burn tub (by hand): polymer tub + 2 burn gel + 2 burn tab blisters. `Goes into:` Nothing: no recipe or order uses it. Sold only.

### Ward pack (`it_med_pack_ward`) — tier 3 · 3x2 · worth 110$
**What it is:** A taped crate of painkiller and antibiotic cards packed for a clinic ward; ships as one line on the manifest.
**Function:** Bulk pack for orderly orders.
**Chain:** `Comes from:` Pack ward crate (by hand): polymer crate + 2 painkiller blisters + 2 antibiotic blisters. `Goes into:` Order: Isolation ward (orderly, 1).

## Ring-grade products

### Regrowth gel (`it_med_regrowth_gel`) — tier 4 · 1x2 · worth 70$
**What it is:** A faintly warm gel in a lined tube seeded with rare earth; it closes a deep wound in days.
**Function:** A ring-grade treatment and the stepping stone to gene patches.
**Chain:** `Comes from:` Synthesise regrowth gel (Synthesiser, Regenerative, takes nights): 5 burn gel + rare dust -> 5 gel. `Goes into:` Order: Regrowth cases (Clinic, 2). Print gene patches (Synthesiser, Regenerative) uses 5 gel plus a noble flake.

### Gene patch (`it_med_gene_patch`) — tier 4 · 1x1 · worth 450$
**What it is:** A square skin patch of cultured cells and noble-metal contacts.
**Function:** The top medicine in the domain, sold to the Clinic.
**Chain:** `Comes from:` Print gene patches (Synthesiser, Regenerative, takes nights): 5 regrowth gel + noble flake -> 5 patches. `Goes into:` Order: Regrowth cases (Clinic, 1). No recipe uses it.

## Contraband

### Dream tab (`it_med_dream_tab`) — tier 2 · 1x1 · worth 4$
**What it is:** An unmarked white tablet with a soft sweet taste.
**Function:** A contraband drug sold through the fence and the black market.
**Chain:** `Comes from:` Synthesise dream tabs (Synthesiser, Narcotics): purified reagent + biomass paste + carbon dust -> 10 tabs. Punch out dream tabs (by hand) from a dream blister gives 6. `Goes into:` Orders: Dream tabs (fence, 6), Narcotics notes (black market, 10). Fill dream blister packs 6 into a card.
**Note:** Contraband (drug); the premium is in the market, not in its listed value.

### Dream blister (`it_med_fb_dream_tab`) — tier 2 · 2x1 · worth 25$
**What it is:** Six unmarked tablets in plain foil with no stamp and no maker.
**Function:** Packed dream tabs, contraband.
**Chain:** `Comes from:` Fill dream blister (by hand): blister card + 6 dream tabs. `Goes into:` Order: Dream tabs (fence, 2). Punch out dream tabs reverses it.
**Note:** Contraband (drug).

### Blue ampoule (`it_med_blue_ampoule`) — tier 3 · 1x1 · worth 18$
**What it is:** A sealed glass ampoule of blue solution that makes the station go quiet for an hour.
**Function:** The strong contraband drug.
**Chain:** `Comes from:` Cook blue ampoules (Chem bench, Narcotics): solvent + vial -> 2. Synthesise blue ampoules (Synthesiser, Narcotics): purified reagent + gas bladder + 2 vials -> 2. `Goes into:` Order: Narcotics notes (black market, 2). No recipe uses it.
**Note:** Contraband (drug); +2 energy now with the same crash tomorrow.
