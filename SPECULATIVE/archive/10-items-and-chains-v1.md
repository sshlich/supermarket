> **Archived 2026-10-09.** First pass of file 10, kept because other files cite its item numbers and its grade, VOID and condition
> rules. It was replaced by `../10-items-and-chains.md`, which follows the game as built; this version assumes a rented
> square is 2x2 item cells (superseded: a square is a square of the board).

# 10. Items and production chains

The catalogue: what a thing in the Stack *is* when it sits on your grid, what it says about itself, who makes it, who needs
it, and which chain it is a step in. The prices used here follow `04-economy.md` (section 12); water names and grades
follow `03-water.md`. Machines are listed as items (their size, their slots, what they eat); how they work inside and how
they fail is file 09's job.

Two rules ran the whole time this was written. **Every item is needed by someone or is a step in a chain**: if an item could
be deleted without breaking a chain or emptying a client's slip, it was deleted. And **the tags do the work**: the same
tomato is three different items depending on its grade, condition and who is checking, so variety comes from the tags a
thing carries, not from inventing a fourth tomato.

---

## Part one: what an item carries

Every item is a **kind** (what it is) plus a short row of **tags** (what is true about this one). Contracts, drone bays,
machines, shelves and inspectors read the tags. The player reads them on the item as marks (the IDEAS "effects" mark),
and an unknown tag shows as **?** until something reveals it.

### 1.1 Kind families

The families are working groups for the data, not shelves in the world. They matter because contracts sometimes ask by
family ("any protein, 2 kg") and machines accept by family (a grinder takes *insects* and *grain*, not a cell).

| Family | Covers | Typical buyer direction |
|---|---|---|
| **Protein** | live insects, paste, blocks, roasted, rendered fat | down |
| **Produce** | anything grown: fruit, greens, herbs, sprouts, mushrooms, seed crops | up |
| **Pantry** | ferments, preserves, salt, store food, bread | sideways (Mills to Middle) |
| **Water and drink** | water by grade, brews, spirit, vinegar | everywhere, at different grades |
| **Growing** | seed, medium, soil, keys, feed for beds | inward (your own beds) and up (seed savers) |
| **Power** | cells, packs, cable, light | down and sideways; cells are also money |
| **Salvage** | parts, scrap, VOID goods, founding-era pieces | from the chute, out to Old Hands and fixers |
| **Drone** | frames, rotors, liners, transponders, seals, crates, dunnage | inward (your fleet) and to shaft rats |
| **Body** | medicine, dressings, salves, masks | down |
| **Cloth and household** | garments, felt, boots, glass, soap, furniture | down (mended) and up (restored real) |
| **Paper** | slips, licences, certificates, tickets, markers, tags | everywhere; light, small, fragile when wet |
| **Machines** | bought relics with slots | inward |
| **Tools** | carried, used on items | inward |

### 1.2 Origin and grade

Three different questions get folded together by buyers who do not know better, and pulled apart by buyers who do.

**What it is made of (the mark).** From 04, unchanged:
- **R✓ Certified Real**: grown from licensed seed, in a certified bed, on Halden Pure, with a Grow Certificate on file.
- **R Real**: actually grown, not certified.
- **H Heirloom**: a sub-mark on R for a named old variety from saved seed. Can never be R✓ honestly.
- **RB Real-Blend**: synthetic base with a stated share of real.
- **S Synthetic**: paste, printed fibre, pressed board, flavoured base.
- **Rc Reclaimed**: recovered from refuse: undone VOID, washed, mended, refilled.
- **F Founding**: made by Halden Works or its suppliers before Y41.

Water carries the water grade instead (Real / Pure / Certified / Clean / Grey / Brack, file 03). A water vessel shows the
grade of what is in it, and **the grade of a mix is the worst grade poured in**. One cup of Grey into a cask of Clean makes a
cask of Grey. Every Mills child knows this, and every Mills adult has done it anyway at the end of a long day.

**How it came to you (the make).**
- **new**: from the store, the Hatch, or a licensed maker, in its packaging.
- **refurbished**: was broken or retired, was fixed by someone, works. Refurbished is a word for things with parts.
- **salvaged**: came out of the chute, the Spill, the Flats or a strip-out, as found. Not yet judged.
- **founding**: a make in itself; overrides the others. A founding-era valve wheel pulled from the bay is still founding.

**Whose name is on it (the brand).**
- **branded**: carries a licensed brand mark (Orrin, Vey, Halden Pure, Skywater, Brightline, Halden Works). Branded goods
  carry the brand's rules with them (expiry strips, cycle counters, Retirement dates, deposits).
- **unbranded**: honest plain goods. Slab is unbranded. Most of what you make is unbranded.
- **bootleg**: a copy of a branded thing sold *as itself, without the mark*: a Vitabrick-weight brick in a plain wrapper, a
  Brightline-pattern key with no hologram. Not illegal to own; illegal to sell under the brand's name.
- **counterfeit**: a copy sold *with* the mark. A refilled Skywater bottle is counterfeit the moment it goes on a shelf with
  the green label facing out.

**In play:** grade and brand are separate marks on the sprite: a small letter badge (R✓, R, H, RB, S, Rc, F) in one corner,
a brand pip (an Orrin wheatsheaf, a Vey cross, a Halden H) in another. A bootleg shows no pip; a counterfeit shows a pip
with a hairline crack that only a **spectro wand** or a **lens** makes visible. Without the tool, the counterfeit shows a
clean pip, which is the point.

### 1.3 Condition

Condition is one ladder for things with parts, and one overlay for things that were killed on purpose.

**The ladder:** `mint → good → worn → poor → scrap`.
- **mint**: unused, in packaging. Only new goods start here, and a seal broken once is never mint again.
- **good**: used, works fully.
- **worn**: works, visibly. Sells at about 70% of good. Most Mills goods live here forever.
- **poor**: works badly or sometimes. A poor machine has a fault roll; a poor garment has a hole; a poor cell holds half.
- **scrap**: does not work. Sold by weight, or stripped for parts. Scrap is a condition, not a destination: a scrap kettle
  is a motor, an element and a lid.

**The VOID overlay** (from 04, section 9.4): a branded good killed under BIDS carries **VOID** plus its **method**: Stamp,
Cancel, X, Puncture, Snap, Brick, Clip, Blue, Crush, Leg. The overlay sits on top of the ladder, so a silk shirt can be
`good` underneath and `VOID (X)` on top. Undoing the overlay replaces it with a **repair state** that stays visible
forever: `mended`, `resealed`, `re-legged`, `re-terminated`, `reflashed`, `washed`. A repair state is a mark buyers
read: the Middle pays for `mended`; the Terraces will not touch it in public; the Crown does not know it exists.

**Bad valet** goods (04): the VOID is cosmetic. Shown as `VOID (X) ?` until a tool reveals `VOID (cosmetic)`, at which point
the overlay comes off with a rag and an hour.

**States of one item.** IDEAS liked depth from states over new items. Many kinds have a short ladder of their own instead
of (or as well as) condition, and every rung has a use:

| Kind | States | The use at each rung |
|---|---|---|
| Tomato | green → ripe → soft → split | green travels (slow ripening in a bay); ripe sells up; soft goes to the brew crock or paste; split goes to the insect bin |
| Bread (Crown) | blue → washed → stale → crust | blue is insect feed; washed is grey food; stale is crust for the brew crock; crust is fuel for nothing (eaten) |
| Cell | full → part → flat; certified / uncertified; count n/300 | full is money; flat is work for the charger; at 300 it becomes End of Service |
| Filter cartridge | fresh → strip red → spent | fresh in licensed housings; red in grey housings; spent is char for the char oven |
| Insects | live → stunned (cold) → dead | live sells to bins and the Flats; stunned is how they travel and grind cleanly; dead grinds at lower yield |
| Garment | whole → VOID (X) → mended / unmendable → fibre | mended sells; unmendable is felting fibre |
| Glass bottle | whole → punctured → resealed / cullet | resealed holds still liquid; cullet goes to the glass-blower on 16 |
| Grow medium | fresh → spent → mushroom-spent | fresh grows R; spent grows mushrooms; mushroom-spent is soil amendment |
| Chilli paste | fresh → working → Red → old Red | gains value only in a crock (1.6, age) |

### 1.4 Handling

Handling tags are about the body of the thing: what happens to it when it is carried, packed, launched and landed. They are
read by **containers** (bays, crates, cases, shelves, the chute bin), never by neighbours on the open field; IDEAS forbids
proximity rules, and none are needed, because every place a thing can be hurt is a container with its own rule.

- **fragile**: breaks on a rough landing (a free-shaft trouble roll, a dropped crate). A fragile item in a bay is safe if the
  bay is **snug** (no empty cells: packed tight, gaps filled with dunnage) or if the item sits in a **cradle tray**. This is
  a bay rule, not a neighbour rule: the bay checks itself for empty cells. Glass, eggs, screens, ripe soft fruit, seed vials.
- **liquid**: the item has a **top**. Rotated so its top faces sideways or down, an unsealed liquid spills its contents (to
  the container's floor, lost, or into a drain square on the field). A **sealed** liquid can lie any way. Every vessel in the
  game carries this, which makes the 1x2 bottle the most-rotated and most-regretted shape in the Stack.
- **perishable (Nh / Nd)**: has a clock in hours or days. The clock runs on the open field and on ordinary shelves, pauses in a
  cold case or a cold bay, and is reset to a new kind (not destroyed) when it runs out: ripe to soft, fresh paste to sour
  paste. Perishables never simply vanish; they become the next rung down.
- **cold**: must travel in a cold bay (cold liner fitted) or its perishable clock runs at double rate in flight, and some
  clients reject it on arrival ("received warm"). Greens to the Terraces, live colonies going up, Vey biologics, plasma.
- **live**: a creature or a culture. Needs air: a live item in a sealed bay dies in flight unless the bay has a **vent lid**.
  Some live items need feed for long flights (a **feed pouch** in the bay counts). Colonies, crickets, spawn jars,
  sourdough-like mothers, hens (very rarely).
- **hazardous (flam / corr / tox / charge)**: licensed lanes refuse hazardous cargo unless an **orange tag** (Dangerous Goods
  declaration, store, 2 cr, single use) rides in the bay; free shafts do not ask. On a trouble roll, an untagged hazardous
  item can **leak** into the bay (corr/tox: damages one other item in the same bay at random; flam: nothing, unless it is
  also with a charge item, which is a bay rule the Mutual will happily quote). Trike, lye, pale spirit, drone packs, solvent.
- **heavy**: counts against a drone's lift. Each heavy item adds an hour to a flight, or above the frame's limit the drone
  will not launch. Water is heavy. Cells are heavy. Brass is heavy. Real soil is heavy. The things the poor need are heavy and
  the things the rich buy are light, which is why going down costs more flight time per credit earned.
- **sealed**: tamper-evident. Breaking a seal is one-way. Sealed goods do not stale (water), do not spill, and some slips
  require them ("unopened", "batch stamped"). A broken seal is visible forever.

**In play:** handling tags are the packing puzzle's texture. A Middle slip for "6 jars sour greens, 4 L Certified, 2
punnets mushrooms" is a bay of liquids that must stand upright, fragile glass that wants the bay snug, and perishables that
want a short flight. The same slip in a cold bay with dunnage and a bay seal is a pleasure; in a bare Wren up the Three
Grate it is a gamble you chose.

### 1.5 Legal status

Legal status is not what the item is but what you may do with it, and it is read by **inspectors, brand agents, wardens and
lane scanners** at events, and by licensed machines every hour.

| Status | Meaning | Who reads it, and what happens |
|---|---|---|
| **licensed** | made, held or sold under a valid licence or certificate | nobody objects; licensed machines run it at full rate |
| **unlicensed** | legal to own, illegal to *make, sell or use* without a licence you lack (stinker water, a still, saved seed sold as seed, a grey charger) | inspection events roll against unlicensed items on your field and shelves; drone bays are only scanned on lanes |
| **grey** | restored-from-VOID or otherwise in breach of brand rules (Rc branded goods, re-terminated cells, reflashed slates) | brand sweeps fine you if found on a shelf or frontage square; buyers on lanes may refuse; grey clients pay well |
| **counterfeit** | carries a brand mark it has no right to | the worst: Standing hit, confiscation, a brand-protection case at the Arbiter |
| **company property** | belongs to Halden whatever your lease says (Halden totes, meter seals, the Works benches, a transponder is leased, every founding-era fitting that is still *attached*) | selling CP is theft; returning a CP item found in the chute gives a small reward (the **recovery chit**, 1–5 cr) and +2 Standing; fixers buy it for more |
| **recalled** | the brand has called it back (a Vey batch, a Brightline model, a colony line) | licensed buyers refuse it; Halden pays a **recall bounty** (a fixed small sum, often in scrip) to hand it in; the grey market sells it at a discount and the Mills use it anyway |

**In play:** legal status is the reason the game has two ways to sell the same object. A re-terminated cell on your shelf is
a fine waiting for a brand sweep; the same cell in a bay going to floor 7 is simply 10 cr. Most grey work belongs in drone
bays and on the counter with a known client, never on frontage. The shelf is the place where the law can see you.

### 1.6 Age

Age means three different things in the Stack, and the game should keep them apart because the tower does.

1. **Real age**: how long a thing has existed, and what that does to it. Most real-age changes are slow and mostly bad
   (stale, soft, rusted), but a handful **only gain** and only inside the right special container (IDEAS: cellar ageing that
   never falls):
   - **Red** (fermented chilli paste) in a crock: fresh → working (3 days) → Red (10 days) → old Red (30 days). Value rises
     each rung and never falls. A crock of old Red is how a Mills family saves without the Ledger seeing.
   - **Soap** curing on a rack: green soap (harsh, sells at half) → cured (14 days) → stays cured.
   - **Vinegar** with its mother: strengthens up to a cap; a strong mother is worth more than the vinegar.
   - **A saved seed line**: each generation saved adds a line count to the seed's tag ("Sallow Gold, line 31"). Seed savers
     and the Crown's fixers pay by the count, because a long line is provenance.
   - **Founding-era goods**: do not age at all, in the sense that matters. A Works cell from Y20 holds its charge. That is
     the whole legend.
2. **Printed age**: dates the brand set, which have nothing to do with the thing's real state. Expiry strips (30 days on a
   Halden cartridge), unit-of-use dating (Vey: 60 days opened, 180 manufactured), spectrum keys (90 days), scrip notes (90
   days), Retirement dates on electronics (screens 3 years, slates 4, controllers 5). Printed age is read by licensed
   machines and licensed buyers, never by the thing itself. A red-strip cartridge filters as well as yesterday.
3. **Counted age**: cycle and fill counters built into branded goods. H-cells count to 300 charges; SureSeal cans count to
   40 fills; Orrin starter colonies count six generations. Counted age is printed age that pretends to be physics.

**In play:** the three ages are three item fields: a **real-age clock** (with the kind's state ladder), a **printed date**
(checked by machines and slips that say "in date"), and a **counter** (n of max). Showing all three on one item (a cell:
charge 80%, printed "End of Service", counter 300/300) is a whole argument about the tower in one tooltip.

### 1.7 Hidden features and the instruments

Salvage arrives with questions. Following IDEAS (the analyser), unknown features show as **?** and are revealed by
instruments, quick by day, deep overnight:

| Unknown | Revealed by | Time |
|---|---|---|
| a cell's real charge and certified flag | **cell gauge** (tool) | instant |
| a cell's counter and whether it is founding | **charger rack** reading, or an Old Hand | one charger hour |
| real vs real-washed (R vs S dressed as R) | **spectro wand** (tool) | instant |
| counterfeit brand pip | spectro wand, or a **lens** for printed marks | instant |
| bad-valet VOID | lens, or an hour on the bench | 1 hour |
| a water sample's grade | PS-4 strip (rough, instant), **cress twist** (2 days, honest), **test bench** (overnight, all) | varies |
| seed fertility | **rag test** (germination in damp cloth) | 2 days |
| a device's Retirement state and fault | **bench** with a flash rig, or an Old Hand | 1–3 hours |
| a founding-era part's function | Old Hand, Archivist, or a **Works test bench** (Old Hands' hall, floor 19) | a visit, a turn |

Blind goods sell at a discount and buy at a discount. **In play:** a crate of `?` cells bought on Gutter Row at 3 cr each
is a gauge-and-sort job worth two hours and somewhere between 0 and 1,200 cr.

### 1.8 How contracts, bays and machines read all this

**A contract slip** lists lines in one grammar, whatever its style (embossed card, Middle form, crumpled print):

> `6 × tomato · R✓ · ripe · cold` &nbsp;&nbsp; `4 L water · Certified or better · sealed` &nbsp;&nbsp; `1 × slate · working · any make`

Each line names a kind or family, a count or weight, and any tags it insists on. Grades accept **"or better"** in their own
ladder (R✓ satisfies R; Pure satisfies Certified). Tags the slip does not mention are free. On landing, the bay is checked
line by line: a missing line fails that line (partial pay if the slip allows, nothing if it says "complete only"); a wrong
grade fails it and costs Standing ("received S as R"); extra goods are kept by the client, unpaid, and nobody ever
mentions them again.

**A drone bay** reads handling: cold (liner), live (vent lid), sealed (sealed liner + bay seal), hazardous (orange tag on
lanes), heavy (lift), fragile (snug or cradled). It also reads **legal status on lanes only**: a lane scan at the spur gate
can roll against grey and counterfeit cargo. Free shafts read nothing and take what they like.

**A machine** reads tags in its slots:
- **accepts**: a family or kind (the grinder accepts protein and grain; the press accepts paste).
- **grade in, grade out**: most machines pass the worst input grade through (Halden Pure + OneCrop + certificate = R✓;
  any one missing = R).
- **licence checks**: licensed machines read the certified flag on cells (throttle to 70% on uncertified), the printed date
  on cartridges (refuse red strips), the key in the lamp (maintenance spectrum without one).
- **condition**: a machine run on poor inputs gives poor outputs (a press fed sour paste makes nightslab).

**A shelf or frontage square** reads legal status for sweeps, and perishable clocks keep running there (a **cold case** is a
shelf that pauses them).

### 1.9 Sizes: the reasoning

The game uses one grid for everything, and sizes are **relative to each other**, set by what the thing is and by the bays
it must fit. In the world, the standard is set by the bays: when Halden licensed the Wren as the tower's starter drone, every
crate maker in the Stack started building to its 3x2 bay, and **bay-true** became the word for a box that fills a bay with
nothing wasted. A Wren crate is 3x2 because a Wren is. A Kestrel takes two Wren crates side by side.

| Class | Sizes | What lives here |
|---|---|---|
| **Pocket** | 1x1 to 2x2 | a brick, a cell, a tomato, a bottle (1x2, upright), a seed packet, a 20 L can (2x2) |
| **Pack** | up to 3x3 | crates, sacks, folded liners, a garment, a chair (3x3, awkward on purpose) |
| **Tools** | up to 2x5 | long things: a spectro wand (1x3), a soldering iron (1x3), a lamp bar (1x4), a chute pole (1x5) |
| **Machines** | 3x3 to 4x3 | anything with slots that runs over hours: bins, beds, presses, stills, chargers |
| **Special containers** | 1x2 to 3x3 | vessels that change their contents with time but are not machines: crocks, jars, soap racks, seed boxes |

Rule of thumb that keeps the catalogue honest: **a pocket good fits a Wren bay six times over; a pack good fits it once; a
tool fits it diagonally never** (rotation is 90°, so a 1x4 lamp bar cannot ride in a Wren at all, which is a real reason to
want a Kestrel). Machines do not fly; they come up by the Lift Guild's goods lift or on Old Two, and their delivery is a
toll, not a contract.

**The scale problem, stated plainly.** File 04 starts the player on a 24-square lease with an insect bin, a grow bed and a
grinder. At one item cell per rented square, those three machines alone (3x3 + 4x3 + 3x3) need 30 squares. So one of these
has to give:
- **Main version (recommended here): a rented square is a 2x2 of item cells.** A founding stud square is 80 cm; a hand is
  about 15 to 20, so four "hands" to a stud side is generous, and 2x2 keeps the arithmetic simple. The 24-square lease is a
  12x8 field of cells; a 3x3 machine stands on two and a quarter squares (billed as three, because the Ledger rounds up, which
  is very Halden). Bays stay in item cells (a Wren is 3x2 cells).
- **Alternative:** one cell per square, and machines shrink to the 2x2 and 1x2 footprints file 03 uses; pocket goods then
  stay 1x1 and the tool/pack classes compress. Simpler, but a 1x1 brick and a 2x2 still on one rent scale makes rent
  feel arbitrary.
- **Alternative:** the starting lease grows to 48 squares and the rent per square halves. Same money, same picture, bigger
  number on the slip.

---

## Part two: the catalogue

Sizes in grid cells (width x height). Tags in short form: **frag** fragile, **liq** liquid, **per** perishable (with its
clock), **cold**, **live**, **haz** hazardous (flam / corr / tox / charge), **hvy** heavy, **seal** sealed; legal status
in words when it is not plainly legal. Marks (R✓, R, H, RB, S, Rc, F) where the kind can carry one. Prices are Mills
prices from file 04 unless given.

### 2.1 Protein

The insect halls on 11 to 13 run three lines, and so can you. They are different animals, and that is the whole point of
having three: each eats something the others cannot.

- **Chirps** (crickets): the Orrin line and the best paste. Eat dry feed (bran, dried food waste, ground greens), want warmth,
  drink little (a damp sponge or gel). Slow-ish, clean, loud.
- **Mealies** (mealworms): eat bran, dry crusts and, famously, **foam packaging**, which goes through them and comes out as
  frass. Slow, quiet, tolerant of cold. The Mills' answer to the chute's mountains of moulded foam.
- **Soldiers** (black soldier fly larvae): eat wet rot, including **blue** food, peel, plate waste and spoiled paste, fast,
  and crawl out of the bin on their own when they are ready. Fatty: the best render. Ugly to sell whole; nobody does.

| # | Item | Size | Tags | What it is | From → To |
|---|---|---|---|---|---|
| 1 | **Live chirps, tub** (1 kg) | 2x2 | live, per 2d, S | A lidded tub of adult crickets, chirping. 6 cr. | insect bin → grinder, roasting tray, other ranchers' bins, Flats bait buyers |
| 2 | **Live mealies, tray** (1 kg) | 2x2 | live, per 4d, S | Mealworms in bran. Survive a cold flight better than anything alive. 5 cr. | mealie bin → grinder (paste, lower yield), new bins, the Co-op's foam bins |
| 3 | **Soldier grubs, bucket** (1 kg) | 2x2 | live, per 1d, S | Self-harvested larvae that climbed the ramp into the catch bucket overnight. 3 cr. | soldier bin → render pot (fat), grinder (rough paste), hen feed |
| 4 | **Stunned chirps, bag** | 2x2 | per 6h, cold, S | Crickets chilled still in a cold case for an hour. They grind clean and travel quiet. | cold case → grinder; cold bay → Middle ranchers |
| 5 | **Insect paste, tub** (1 kg) | 2x2 | per 1d (fresh → sour), S | The grey-brown paste out of the grinder, smelling of toast and ammonia. 4 cr. | grinder → press; sour paste → nightslab or back to the soldiers |
| 6 | **Slab** (250 g) | 1x1 | S, unbranded | A protein block in any shape but the Vitabrick's. A day's protein. 2 cr; 1.50 in the Sump. | press → shelves, Mills and Sump slips, hot-bunk breakfasts |
| 7 | **Nightslab** (250 g) | 1x1 | S, crumbly | Pressed overnight, unattended, from paste that sat too long: crumbles at the corners, sells at 1.20. The Sump buys it by the crate and calls it "honest". | press (overnight setting) → Sump slips, hot-bunk houses, Foundation-adjacent charity runs |
| 8 | **Vitabrick** (250 g) | 1x1 | S, branded (Orrin), licensed | The brick, the shape, the baseline price of the tower (3 cr). Making it needs an Orrin die *and* a press licence. | store, Orrin press houses on 11 → everywhere below 60 |
| 9 | **Chirps, paper cone** | 1x1 | per 3d, S | Roasted crickets with Mills Red, sold hot at the lift lobby. "Chirps" is both the animal and the snack. 1 cr. | roasting tray → frontage, Ledge, Whistle-hour sleepers |
| 10 | **Chirp fat, jar** (0.5 L) | 1x2 | liq (when warm), S | Rendered insect fat; 04's "insect-fat oil". Sets white in the cold. 5 cr. | render pot → frying (stalls), tallow candles, soap, fat salve, rotor bearing grease |
| 11 | **Cracklings** | 1x1 | per 5d, S | What is left in the render pot's strainer: crisp, salty, the best thing a Mills child is ever given. | render pot → shelves, or back into paste for RB-style "rich slab" |
| 12 | **Frass, sack** (5 kg) | 2x2 | hvy | Insect droppings and spent bedding, dry, fine as flour. The single most useful waste in the Mills. 2 cr. | every bin → grow beds (fertiliser), frass tea, mushroom mix, frass poultice |
| 13 | **Moults, bag** | 1x1 | light | Cast skins sieved from chirp and mealie bins. Weigh nothing, stink faintly. 0.50 cr. | bin sieve → lye boil → clearing flakes (water) |
| 14 | **Insect feed, sack** (5 kg) | 2x2 | per 3d, Rc | Food waste, blue fine, sorted from the catch. Legal as feed. 2 cr. | chute → bins (soldiers take it wet, chirps dried) |
| 15 | **Bran, sack** | 2x2 | S/R | The husk sieved off flour at the Ovens on 16. Mealie bedding and chirp feed. 1.50 cr. | floor 16 bakers → mealie bins, chirp bins |
| 16 | **Orrin Protein Starter colony** | 1x2 | live, counted (6 gen), licensed | A sterile chirp line in a branded box. Crashes after six generations. 35 cr. | store → your bin; its slab can carry the Orrin licence |
| 17 | **Wild-line colony** | 1x2 | live | A rancher's line that never crashes and never can be called Orrin. 15 cr. | ranchers on 11–13 → your bin; the reward in many Co-op slips |
| 18 | **Herd ticket** | 1x1 | paper | The Orrin depot's receipt for weighed live insects, paid out in scrip on Halden payday. | Orrin depot on 11 → the Hatch, the street (sold at the scrip rate) |

**In play:** the three lines make the insect side a choice about *which waste you have*. A South Chute catch thick with clinic
plastics and moulded foam wants mealies; an East Chute catch dripping with market peel wants soldiers; a bran contract with the
Ovens wants chirps. Each line has its own bin settings, its own slip buyers and its own byproducts, and all three meet at the
grinder.

**Hook:** a mealie line on floor 12 eats foam twice as fast as any other. Its keeper, **Petra Koss**, says it is a line her
grandmother took from a Works lab bench the week of the Last Shift, where somebody had been "teaching worms to eat the
packaging". Greenhold has sent two letters asking to buy it. Halden has sent none, which worries her more.

### 2.2 Produce

All grown, all needing water every hour, all real. The grade is decided in the bed (seed, water, certificate), not by the
plant.

| # | Item | Size | Tags | What it is | From → To |
|---|---|---|---|---|---|
| 19 | **Tomato** | 1x1 | per (ripe 2d → soft), frag when ripe, R✓/R/H | The tower's classic up-contract good. 5 cr (R) to 20 (Crown, R✓). States: green, ripe, soft, split. | grow bed → up-slips, Middle cooks, brew crock (soft), insect bin (split) |
| 20 | **Leaf greens, bunch** | 1x1 | per 1d, cold (going up), R✓/R | Fast, cheap, thirsty. Wilts on the open field in a day; keeps three in a cold case. | grow bed (3-day crop) → Terraces kitchens, sour greens jars, Co-op wages |
| 21 | **Chillies, string of 10** | 1x2 | per 10d → dried (keeps), R | Grows in anything, under anything. Hung to dry, keeps for months. Small change on the Ledge. | grow bed → Red crocks, roasting, wages, the Sump (where they hide the taste of everything) |
| 22 | **Sprouts, jar** | 1x2 | per 2d, liq (rinse water), R | Cress or mung sprouted in a jar in two days, no light, little water. The only real food the Mills eat every week. | sprout rack → Mills shelves, hot-bunk houses, Rain Church kitchens |
| 23 | **Mushrooms, punnet** (200 g) | 1x1 | per 2d, frag, R | Oyster mushrooms grown in the dark on spent bedding and medium. 3 cr Mills, 12 up. | dark box → Middle cooks, Terraces "foraged-style" menus (which is a joke nobody up there gets) |
| 24 | **Herbs, bunch** | 1x1 | per 2d, R✓/R | Basil, mint, coriander. The cheap way into RB (a pinch in a press of paste). | grow bed → Terraces, the press (RB slab), tinctures, the drying cabinet |
| 25 | **Herb twist, dried** | 1x1 | R | Dried herbs in a paper twist. Keeps a season. | drying cabinet / the Ovens → tinctures, fat salve, kof-cutting, RB slab |
| 26 | **Beans, pouch** (dry) | 1x1 | R | Pole beans grown up a string in a bed, dried in the pod. Each bean is also a seed, which is why OneCrop does not sell beans. | grow bed → pantry, seed savers, the Co-op's seed shelf |
| 27 | **Heirloom strawberries, punnet** | 1x1 | per 1d, frag, cold, H | The Crown's favourite fraud: saved-seed fruit certified by bribery. 120 cr to the Crown. | heirloom bed → penthouse fixers, Crown slips |
| 28 | **Hen's egg** | 1x1 | frag, per 10d, R✓/R | One of about two hundred hens in the tower lays it. 12 cr up, 25 in the Crown. | the Co-op's coop on 19 (a reward, a contract) → Crown and Terraces slips, never the Mills |
| 29 | **Seed fruit** (blue) | 1x1 | Rc, per 2d | A Crown plate-waste fruit (a pepper, a melon end, a tomato) sprayed blue, whose seeds may be heirloom and fertile. | catch / Crown sack → seed-cleaning (2.4 chain) |

**In play:** produce is where the player feels the divide most directly: a bunch of greens that costs 2 cr of water to grow
sells for 2 cr on the Ledge and 11 in the Terraces, if it gets there cold, in under a day, in a drone with a Lane Permit.
Every handling tag on produce is a reason to upgrade the bay.

### 2.3 Pantry

Preserves are how the Mills cheat perishability: a few hours of work turns a clock into a shelf life.

| # | Item | Size | Tags | What it is | From → To |
|---|---|---|---|---|---|
| 30 | **Sour greens, jar** | 1x2 | liq, frag, seal, R | Greens packed in brine and vinegar, sealed; keeps 60 days. Middle families buy them for winter like their grandparents did. | brine crock → Middle slips, shelves, Sump (luxury) |
| 31 | **Mills Red, crock** | 2x2 | special container, R | Fermented chilli paste. Gains value with age (fresh → working → Red → old Red). A full crock is a savings account with a lid. | Red crock → chirps, slab sauce, Middle cooks; old Red to Terraces "heritage" buyers |
| 32 | **Red, pot** | 1x1 | R | A small pot portioned from the crock. Taking a pot leaves the crock smaller and still ageing (IDEAS: cut a wedge). | crock → shelves, frontage, gifts |
| 33 | **Bay salt, bag** (1 kg) | 1x1 | hvy | Grey bitter salt scraped from ledge-still trays and brine pans. Tastes of metal. 1.50 cr. | still trays → brine crocks, Red, fat salve, soap, the Sump |
| 34 | **Store salt, bag** (1 kg) | 1x1 | hvy, branded | White Orrin salt. 3 cr. Upper slips that say "salt" mean this one. | store → up-slips, pickling for the Middle |
| 35 | **Bluewashed bread, loaf** | 2x1 | per 2d → stale, Rc, grey as food | Crown bread scrubbed of Orrin Blue with vinegar water. Mildly toxic, very popular. 2 cr. | wash basin → Sump and Mills buyers who know; brew crock (stale) |
| 36 | **Crusts, bag** | 1x1 | Rc | Stale bread ends, blue or not. | catch, stale bread → brew crock (crust), mealie feed |
| 37 | **Orrin noodle brick** | 1x1 | S, branded | Dried noodles in a block. 2 cr. Mills dinners twice a week. | store → shelves, hot-bunk houses |
| 38 | **Real-Blend tin** | 1x1 | RB, branded, deposit 0.20 | 8% real, 92% the same paste you make. 9 cr. The empty tin is a deposit item refundable on alternate Tuesdays in the Middle. | store → Middle; the empty tin → tin collectors, Mills canisters |
| 39 | **Kof, pouch** (100 g) | 1x1 | S, branded | Orrin's synthetic coffee. Tastes of toast. 4 cr. Cut with roasted chirp meal in the Sump ("Sump kof", 1.50). | store → everyone below 60 |
| 40 | **Flatbread, stack of 6** | 2x1 | per 2d, R/S | Baked in the Ovens on 16 from Co-op flour cut with bran. The Mills' bread. | floor 16 bakers → shelves, sandwich makers at the Whistle |

### 2.4 Growing

| # | Item | Size | Tags | What it is | From → To |
|---|---|---|---|---|---|
| 41 | **OneCrop seed packet** (10) | 1x1 | licensed, sterile | Orrin hybrid seed. Grows once; sets seed that looks perfect and never sprouts. 6–25 cr by crop. | store → grow beds (the only path to R✓) |
| 42 | **Saved seed, twist** (5) | 1x1 | fertile, unlicensed to sell as seed | Seed saved from R plants, labelled in pencil with variety and line count. 40 cr (tomato). | seed savers, your own harvest → grow beds (R only), the Co-op seed shelf |
| 43 | **Heirloom seed, vial** | 1x1 | frag, H, line count | A named variety: **Sallow Gold** tomato, **Widow's Lace** lettuce, **Bayside Ox-heart**, **Hollis Pole** bean. 150–400 cr. | seed savers, Crown seed fruit → heirloom beds, penthouse fixers |
| 44 | **Orrin grow medium, bag** | 2x2 | hvy | Coir and mineral wool loaded with nutrient for one crop. 8 cr. Re-used at half yield ("unsupported use"). | store → grow beds; spent → dark box |
| 45 | **Spent medium, bag** | 2x2 | hvy | Medium after one crop: roots, salts, exhaustion. | grow bed → dark box (mushrooms), or re-fed with frass tea |
| 46 | **Real soil, bag** (1 kg) | 1x1 | hvy, R | Crown planter soil from the catch, with worms in it sometimes. Grow beds love it; the Crown threw it out because the colour was wrong. 12 cr. | catch, Crown sacks → grow beds (a yield bonus that never exhausts), gifts, savings |
| 47 | **Frass tea, jug** | 1x2 | liq, per 3d | Frass steeped in grey water for a day. Restores spent medium to near-fresh for one more crop. | steep jar → grow beds |
| 48 | **Spectrum key** (Brightline) | 1x1 | licensed, dated 90d | A chip that tells a Brightline lamp which crop it is lighting. Without it: maintenance spectrum, half growth. 10 cr. | store → lamp slot |
| 49 | **Cracked key** | 1x1 | unlicensed | A key with its expiry burned out by a Sump fixer. 6 cr. Found on inspection: lamp confiscated. | Gutter Row → lamp slot |
| 50 | **Spawn jar** | 1x2 | live, frag | Oyster mushroom mycelium on grain. Seeds a dark box. Kept alive by splitting one jar into three. | the Co-op, a dark box → dark box |
| 51 | **Grow Certificate** | 1x1 | paper, licensed, dated 90d | The paper that turns R into R✓, for one bed, one season, inspected. 20 cr a quarter and a visit. | Food Standards Delegation → pinned to a grow bed (a slot) |

**In play:** the Grow Certificate as a 1x1 item that sits in a bed's **paper slot** makes certification legible: you can see
which bed is certified, lend the certificate to a Co-op member's bed for a batch ("pooling", 04), and lose it in an
inspection.

### 2.5 Water and drink

Water is file 03's subject; these are the vessels and the drinks as items, so the catalogue is complete.

| # | Item | Size | Tags | What it is | From → To |
|---|---|---|---|---|---|
| 52 | **Halden Pure bottle** (1 L) | 1x2 | liq, seal, Pure, branded, deposit 0.50 | The blue cap. 2.50 cr. Upper slips that say "unopened, batch stamped" mean this. | store → clinics, Terraces slips; empty → refill (counterfeit if labelled) |
| 53 | **SureSeal can** (20 L) | 2x2 | liq, hvy, counted (40 fills) | Halden's can with a valve chip that counts fills and locks at 40 or on any non-Halden flow. | store, delivery → bulk water; locked → chute |
| 54 | **Drilled can** (20 L) | 2x2 | liq, hvy, Rc | A locked SureSeal with its valve drilled out and a Mills cap. Holds anything. 8 cr. | catch → the Mills' standard water vessel |
| 55 | **Jerrycan** (10 L) | 2x2 | liq, hvy | The Co-op's square can, stamped with a sprout. Returned when empty, or it is 6 cr. | Co-op → your tap draw, bed vessels, still feed |
| 56 | **Skywater bottle** (0.75 L) | 1x2 | liq, frag, seal, Real, branded, one-way valve | Rain from the roof in green glass. 18 cr in the Mills, which is to say never. | Skywater Hall → Terraces, Crown; empty → drilled refills (counterfeit) |
| 57 | **Lowbeer, flask** (1 L) | 1x2 | liq, per 3d | Two per cent ferment from trimmings and sugar scraps. Safer to drink than most water, which is the point. 2 cr a cup. | brew crock → hot-bunk houses, labourers, the pot still (pale) |
| 58 | **Crust, jug** (1 L) | 1x2 | liq, per 3d | Bread-crust ferment, sour and cloudy. 0.60 cr. | brew crock → Mills drinkers, vinegar |
| 59 | **Vinegar, jug** | 1x2 | liq, corr (mild) | Over-soured crust or lowbeer, with its mother. Pickling, and the only thing that lifts Orrin Blue cheaply. | vinegar crock → brine crock, wash basin (bluewash), cleaning |
| 60 | **Pale, bottle** | 1x2 | liq, haz (flam) | Raw spirit run from lowbeer in a pot still. Tinctures, wound wash, stove fuel, and on a bad night, drink. Unlicensed. | pot still → tinctures, dressings, Middle workshop cleaners |
| 61 | **Trike, bottle** | 1x2 | liq, haz (flam, tox) | The first cut of a still run: 03's "heads". Poison to drink. The best stamp remover in the tower. | pot still → VOID (Stamp) undoing, parts cleaning, Middle workshops |
| 62 | **PS-4 strip** | 1x1 | licensed, dated | A Halden test strip for a water sample. 2 cr licensed; 4–6 black market, half useless. | store → test, contract proof ("logged strip") |
| 63 | **Cress twist** (30 seeds) | 1x1 | R | Cress sown on a water sample: green in two days means drinkable. Honest, slow. 1 cr. | seed savers, Co-op → cress tray; the grown cress → sprouts |
| 64 | **Charcoal fill** (crate char) | 1x2 | — | A cloth sleeve of charcoal for a column. Good for 30 L. 3 cr. | char oven → charcoal column, refilled cartridges |
| 65 | **Clearing flakes, twist** | 1x1 | — | Chitosan flakes made from insect moults boiled in lye: a pinch clears a drum of brack in half the settling time. | lye boil → settling drum (faster, less silt in the next step) |
| 66 | **Silt, block** | 1x1 | hvy, per (wet → dry) | What a settling drum drops. Heavy, wet, toxic. The potters on 16 temper it into glaze. | settling drum → floor 16 kiln, or the drain (a bylaw fine) |
| 67 | **Jug ticket** | 1x1 | paper/plastic | A litre owed at a named still, cut from a SureSeal can and punched. Money until the still is sealed. | stills → payment, savings |

**Hook:** pale and trike come out of the same still, a few hours apart, and look the same in the same bottle. Every Mills
shop has a story about a bottle mislabelled. The Old Hands mark trike with three knife-notches on the cap, a habit from the
Works' solvent stores, where it saved lives. The habit is dying with them.

### 2.6 Power and light

| # | Item | Size | Tags | What it is | From → To |
|---|---|---|---|---|---|
| 68 | **H-cell** | 1x1 | hvy, haz (charge), counted (300), certified flag, branded | The Halden standard cell: 2 hu, a cycle counter, a flag. 18 cr new; the yardstick of the street (a full cell ≈ a Vitabrick). | store, charger rack → machine slots, drone packs, payment below 20 |
| 69 | **End-of-Service cell** | 1x1 | hvy, counted (300/300) | Hit its counter, holds 85%. Legal to own, grey to charge. 5 cr. | chute, Middle → grey charger, Mills machines (unlicensed ones run it at full) |
| 70 | **Clipped cell** | 1x1 | hvy, VOID (Clip) | Terminals snipped, casing dented. Charge inside, no way out. | Terraces chute → re-terminating jig |
| 71 | **Re-terminated cell** | 1x1 | hvy, Rc, grey | A clipped cell with new tabs soldered on. Uncertified, works, lasts. 10 cr. | jig → grey clients, your own machines, Sump slips paid in cells |
| 72 | **Works cell** | 1x1 | hvy, F | A founding-era cell: no counter, no flag, no Retirement. Holds most of its charge after eighty years. 400 (Old Hand) to 1,200 (fixer). Called "a pension". | chute (once in a long while), the Spill, hocks → Old Hands, fixers, under your bunk |
| 73 | **H-pack** (4-cell drone pack) | 2x2 | hvy, haz (charge), licensed | Halden's sealed four-cell pack for Wren and Kestrel frames. Reads each cell's flag; refuses one uncertified cell by refusing all four. 90 cr. | store → drone frames |
| 74 | **Mills four** (grey pack) | 2x2 | hvy, haz (charge), grey | Four cells of any kind in a riveted frame with a bus bar. Flies on shafts; a lane transponder will not arm on it. 30 cr plus cells. | pack frame (bench) → shaft-rat drones, your second drone |
| 75 | **Cell gauge** | 1x1 | tool | A thumb-sized needle dial. Turns a `?` cell into a number. 8 cr. | Gutter Row, the Hatch → every trader's pocket |
| 76 | **Tallow candle, bundle of 5** | 1x1 | S | Chirp-fat candles. 0.60 cr each. The Sump's light; the Mills' light when the socket is shed. | candle mould → Sump slips, Rain Church vigils, shed hours |
| 77 | **Brightline lamp bar** | 1x4 | branded, key slot | The licensed grow lamp. 85 cr. Fits a grow bed's lamp rail. | store → grow beds |
| 78 | **Expired lamp bar** | 1x4 | Rc | A Brightline with a dead key and perfect LEDs. 20 cr. Runs maintenance spectrum unless keyed, cracked or stripped. | Middle chute → grow beds (slow), strip lights |
| 79 | **Strip lights, coil** | 1x1 | Rc | LED strips peeled from expired lamp bars, re-soldered to a cell clip. A Mills lamp; also a grow light with no spectrum lock, weaker, unlicensed. | bench → Mills homes, hot-bunk houses, sprout racks, dark boxes (none needed) |
| 80 | **Cable, coil** (5 m) | 1x1 | — | Copper in grey sheath. 4 cr. Stolen by the metre from Common Load. | store, stripped appliances → machine hookups, packs |
| 81 | **Solder, reel** | 1x1 | — | Tin-lead from the store, tin-and-something from the Sump. 3 cr. | store → jig, bench, rotor repair |

**In play:** the cell is the hinge of the whole power side. It is money (a Sump slip pays "3 charged cells"), fuel (a machine
slot), freight (a drone pack), and a puzzle (a crate of `?` cells). The **charger rack** is the machine that turns flat money
into full money, and its day/night settings (3.4) are one of the clearest tended-versus-overnight choices in the game.

### 2.7 Salvage and electronics

The chute's real yield. The Terraces bricked it, the Middle retired it, the Crown ripped it out because it was dated.

| # | Item | Size | Tags | What it is | From → To |
|---|---|---|---|---|---|
| 82 | **Bricked slate** | 1x2 | frag, VOID (Brick) | A Terrace office slate, perfect hardware, licence erased by the Retirement Signal. | West Chute/South Chute → flash rig, or strip for screen and board |
| 83 | **Fourer slate** | 1x2 | frag, Rc, grey, refurbished | A reflashed slate with a Works key: boots, never receives a Retirement date again. Named after Four Hall, where most of them are done. 35 cr in the Mills, 60 in the Middle (grey). | bench + flash rig → shaft rats (route logs), stinkers (inspection schedules), Middle clerks moonlighting |
| 84 | **Cracked screen** | 2x2 | frag | A panel with a crack in one corner and a working backlight. Odile Fenn buys every one. 4 cr. | catch → heat gun separation → panel salvage, Odile |
| 85 | **Board, stripped** | 1x2 | — | A circuit board with its useful chips lifted. Copper and gold traces, by weight. | bench → scrap buyers, the Spill |
| 86 | **Works chip** | 1x1 | F, frag | A founding-era control chip from Lines Four to Eight, recognisable by its gold lid and its date code. Mattias Orme can name the line by the solder. | catch (rare), Crown strip-outs → Old Hands, controllers, meters, the Dark Floors' requisitions (file 02) |
| 87 | **Small motor** | 1x1 | hvy | A brushless motor out of a fan or a kettle base. The heart of a grey rotor. 3 cr. | stripped appliances → motor rewinding → rotor arms |
| 88 | **Out-of-support appliance** | 2x2 | Rc, worn | A kettle, fan, heater or grow lamp the Middle retired working. Fix it or strip it. | East Chute/West Chute → bench (fixed: shelves), stripping (motor, element, cable) |
| 89 | **Heating element** | 1x2 | — | A coil from a kettle or heater. The spare part an insect bin always needs. 2 cr. | stripped appliances → insect bin heater, render pot, drying cabinet |
| 90 | **Brass fitting** | 1x1 | hvy, F | A valve wheel, a door handle, a light rose, a tap head, from a Crown renovation. "0.00 MISC SALVAGE" on the Ledger; 900 cr to an Old Hand for the right wheel. | North Chute, the Spill, Crown sacks → Old Hands, spile smiths, penthouse fixers (who sell it back to the Crown as "restored period") |
| 91 | **Copper, bundle** | 1x1 | hvy | Wire stripped from cable and motors. Sold by weight. | stripping → scrap buyers, motor rewinding |
| 92 | **Scrap, sack** | 2x2 | hvy | Mixed metal. Halden Reclaim pays by the kilo; the Spill pays better and asks less. | everything at `scrap` → the scale |
| 93 | **Halden tote** | 3x2 | company property | A grey Halden logistics crate, bay-true. Belongs to the Company wherever it is found. Return it: 2 cr recovery chit and +2 Standing. Keep it: the best crate you will ever own. | the Hatch, chute → returned, or kept (risk) |

### 2.8 Drone parts and packing

| # | Item | Size | Tags | What it is | From → To |
|---|---|---|---|---|---|
| 94 | **Licensed rotor set** | 2x2 | branded, licensed | Four rotors with chips the transponder checks. 60 cr. | store → frames (lane-capable) |
| 95 | **Grey rotor set** | 2x2 | grey | Four rebalanced rotors on rewound motors. Fly perfectly; cannot arm a transponder. 25 cr. | rotor stand → shaft-rat frames, your shaft drone |
| 96 | **Chipped blade** | 1x2 | frag | One rotor blade with a nick. Unbalanced, it shakes a drone apart in a week. | crashes, chute → rotor stand (file, balance, refit) |
| 97 | **Lane transponder** | 1x1 | licensed, company property (leased), paired | Paired to one frame. Re-pairing at the store: 25 cr. Lets a drone enter licensed lanes. 140 cr. | store → frame slot |
| 98 | **Bay seal** | 1x1 | licensed, single use | A numbered tag proving the bay was not opened. 1 cr. The Mutual will not pay without one. | store → bay |
| 99 | **Orange tag** | 1x1 | licensed, single use | Dangerous Goods declaration. 2 cr. Lets hazardous cargo onto a lane. | store → bay |
| 100 | **Vent lid** | 1x1 | — | A mesh insert for a bay lid. Live cargo breathes; sealed bays become unsealed. 6 cr. | the Hatch, any tinker → bay |
| 101 | **Cold liner** (Halden) | 2x2 folded | branded | Insulated bay liner with a cold-pack pocket. 90 cr. Turns a bay cold. | store → bay |
| 102 | **Foil liner** (Mills) | 2x2 folded | Rc | Mill felt quilted between two sheets of foil from Terraces food packaging, with a gel brick frozen in the pocket. Holds cold for half the flight a Halden liner does. 20 cr. | bench (felt + foil) → your bay, shaft rats, the plasma buyers' second-rate runs |
| 103 | **Sealed liner** | 2x2 folded | branded | Airtight bay liner. Vey contracts require it. 120 cr. | store → bay |
| 104 | **Wren crate** | 3x2 | — | The bay-true box. Slatted, stackable, returnable. 4 cr. Every Mills hall has a crate maker. | crate makers (Leg-voided furniture wood, pallet) → bays, shelves, slips that say "crated" |
| 105 | **Cradle tray** | 2x1 | — | Moulded pulp tray for eggs, tomatoes, bottles on their sides. Fragile items in a cradle survive a rough landing. 0.50 cr. | catch (Terraces packaging), pulp press → bays |
| 106 | **Dunnage, sack** | 1x1 | light | Shredded packaging. Fills empty bay cells so the bay is snug. 0.30 cr. Some slips ask for it as ballast. | shredder → bays |
| 107 | **Feed pouch** | 1x1 | per 2d | A twist of bran and a gel cube. Keeps live cargo alive on long flights. | bench → bays with live cargo |
| 108 | **Works controller** | 1x1 | F | A founding-era drone controller: range and steadiness no new one has. 900 cr Mills. | Old Hands, hocks, Crown strip-outs → frames; the late-game "fit yourself" reward |
| 109 | **Pack frame** | 2x2 | tool | A riveting jig for building a Mills four from loose cells. 15 cr. | Gutter Row → bench |

**In play:** drone parts come back in bays as **rewards** more than anything else, because the people who pay in parts are
the people who have parts and not cash: shaft rats pay in grey rotors, Old Hands in a Works chip, the Mutual's agent in a
cold liner "from a claim we settled". Unpacking a reward bay full of drone parts is the mystery box IDEAS wanted.

### 2.9 Body

| # | Item | Size | Tags | What it is | From → To |
|---|---|---|---|---|---|
| 110 | **Vey gut tabs** (10) | 1x1 | branded, dated | The most-bought medicine in the Mills, because of the water. 6 cr. | store, clinic → Mills, Sump slips |
| 111 | **Vey fever tabs** (10) | 1x1 | branded, dated | 6 cr. Fever is mould, water or both. | store → Mills, Sump |
| 112 | **Mould-lung inhaler** | 1x1 | branded, Continuity priced | 8 cr the first time, 22 the refill. | store → people who breathe in the Mills |
| 113 | **Wound film, strip** | 1x1 | branded, seal | Vey's clear dressing. 4 cr. | store → workshops, the Sump |
| 114 | **DoseLock dispenser** | 1x1 | branded, locked, dated, sometimes recalled | A Vey timed-cap dispenser thrown out with doses still inside. Opening it breaks some of them. | South Chute → chisel bench → cracked doses |
| 115 | **Cracked doses, twist** | 1x1 | Rc, grey | Pills chiselled from dispensers, sorted by stamp, folded in paper with the name pencilled on. 20 cr a course. | bench → Sump clinics, Mills families, plasma buyers' customers |
| 116 | **Frass poultice** | 1x1 | per 3d | A Tide Folk remedy: frass, bay salt and herb in a cloth, warmed. Does something. 1 cr. | steep jar → Flats, Sump, Mills grandmothers |
| 117 | **Fat salve, tin** | 1x1 | R/S | Chirp fat thickened with dried herb and a splash of pale; no wax, because there are no bees in the Stack. For cracked hands, burns, rotor cuts. 3 cr. | salve pot → workshops, Ledge, Rain Church |
| 118 | **Herb tincture, vial** | 1x1 | liq, frag | Dried herb steeped in pale for ten days. Mint for the gut, thyme for the chest. Unlicensed medicine; licensed "flavouring". 4 cr. | steep jar → Mills shelves, Sump, the Middle's "natural" buyers |
| 119 | **Boiled cloth, roll** | 1x1 | seal (once wrapped) | Strips cut from unmendable cotton, boiled, dried, rolled in paper. The Mills' dressing. 1 cr. | wash basin + boil → workshops, the Sump, the hot-bunk houses |
| 120 | **Felt mask** | 1x1 | Rc | A mask of Mill felt with a charcoal pad sewn in. Changes the odds on mould-lung for people who work the catch. 2 cr. | felting bench → pickers, Spill crews, insect bin hands |

**In play:** body goods are the most down-flowing family. Their slips come crumpled and pay in cells, jug tickets and
markers. Medicine also carries the sharpest legal choice: a twist of cracked doses is grey, cheap to make, and the thing a
floor 8 slip most wants; a Vey inspector on a lane scan reads it as counterfeit.

### 2.10 Cloth and household

| # | Item | Size | Tags | What it is | From → To |
|---|---|---|---|---|---|
| 121 | **VOID garment** | 2x2 | VOID (X), grade varies | A shirt or coat with two cuts across the front. Synthetic from the Terraces, natural fibre from the Crown. | catch → sewing kit (mended) or felting (unmendable) |
| 122 | **Mended shirt** | 2x2 | Rc, mended | The X closed with a patch inside. Synthetic 6 cr; Crown silk mended invisibly, 45 in the Middle. | bench → Middle interview wardrobes, Mills shelves |
| 123 | **Fibre, sack** | 2x2 | light | Unmendable garments cut to rags and carded. | carding → felting |
| 124 | **Mill felt, sheet** | 2x2 | — | Wet-felted synthetic and natural fibre, grey, dense. Filters, masks, liners, insulation, boots. | felting tub → filter pads, foil liners, masks, bin insulation |
| 125 | **Felt filter pad** | 1x2 | Rc | A pad cut to fit a Halden air stack. The stack logs it as "unfiltered". It filters. | felting bench → vent squares, grey air stacks |
| 126 | **Halden air cartridge** | 1x2 | branded, dated 30d | The licensed air filter. 14 cr. | store → licensed air stack |
| 127 | **Halden water cartridge** | 1x2 | branded, dated 30d | The licensed water filter. 14 cr. Red strip at 30 days, used or not. | store → licensed housings; red → grey housings, refills |
| 128 | **Mills refill** | 1x2 | Rc, grey | A red-strip cartridge cracked open, its spent char replaced with fresh crate char, re-welded with a hot knife, strip cut away. 5 cr. | bench + charcoal → grey housings everywhere below 20 |
| 129 | **Punctured bottle** (real glass) | 1x2 | frag, VOID (Puncture) | A Crown wine or spirit bottle with a star-crack at the base. | Crown sacks, Spill → resin plug (resealed), cullet (16's glass-blower) |
| 130 | **Resealed bottle** | 1x2 | frag, Rc | Resin-plugged and polished. Holds still liquid, not pressure. | bench → water and pale bottling, "Real" rain for the Crown (the christening slip, 03) |
| 131 | **Ovens jar** | 1x2 | frag, seal (with lid) | A preserving jar blown on floor 16 from melted Skywater bottles, green-tinted. 2 cr. | floor 16 → sour greens, tinctures, spawn, seed storage |
| 132 | **Soap, bar** | 1x1 | green → cured (14d) | Chirp fat and ash lye, cured on a rack. Lifts Orrin Blue (with vinegar), washes dressings, sells. 1.50 cr cured. | soap rack → wash basin, shelves, hot-bunk houses |
| 133 | **Ash, bucket** | 1x2 | — | Wood ash, scrip ash, crate ash from the char oven and stoves. | char oven, Ovens on 16 → lye boil |
| 134 | **Lye, jug** | 1x2 | liq, haz (corr) | Ash leached in water. Burns skin. Makes soap, makes clearing flakes, cleans drains. | lye boil → soap, moults (flakes) |
| 135 | **Real-wood chair** (VOID, Leg) | 3x3 | hvy, R, VOID (Leg) | Legs sawn at four heights. Re-legged, 160 cr to the Middle; cut down, offcuts are crate slats and charcoal. | North Chute, Crown sacks → bench, crate maker, char oven |
| 136 | **Boots, stitched** | 2x2 | — | Store boots with bonded soles, cut away and re-stitched by a Mills cobbler. Outlive the brand. 20 cr. | cobblers → Mills, Flats divers (who pay in salvage) |

### 2.11 Paper the chains read

Paper is covered across files 04, 05 and 11. These are the pieces production depends on.

| # | Item | Size | Tags | What it is | From → To |
|---|---|---|---|---|---|
| 137 | **Food handling licence** | 1x1 | licensed, dated | Lets a press make anything sold as food above 30. 120 cr a season. | Food Standards Delegation → pinned to a press |
| 138 | **Press licence and die** (Orrin) | 2x2 | licensed, branded | The Vitabrick die and the right to use it. Comes with Orrin's supply contracts and a quota. | Orrin depot, 11 → press die slot |
| 139 | **Disposal Rebate slip** | 1x1 | paper | The receipt a Reclaim Station gives a Terrace household for certified-voided goods. Forged ones fetch a tenth of the rebate on the street. | Reclaim Stations → Terraces; forged → the Voided, a canceller |
| 140 | **Recall notice** | 1x1 | paper | A Vey or Brightline recall listing batch numbers. Makes items in your stock read `recalled`. | Static, the Hatch board, chute (a stack of them) → your stock check |

---

### 2.12 Machines

Bought, never built (IDEAS). Each one is an original with its own numbers; the rows below give the common pattern and one or
two named variants so the vendor screens have something to differ on. File 09 has how they work and fail. Draw is per hour
running; "tended" and "overnight" are the two ways a machine can run (Part three uses them everywhere).

| # | Machine | Size | Slots | Draw | Tended (by day) | Overnight | Price |
|---|---|---|---|---|---|---|---|
| 141 | **Insect bin** | 3x3 | colony, feed, water (vessel or gel), heat (socket or cell), frass tray, output | 0.1–0.3 hu (heater cycles), 0.05 L | feed and mist by the hour: +25% yield | runs alone at base rate; the bin's natural home | Orrin **Bin B3**: 180 cr, service contract, thermostat. Rancher's **crate bin**: 45 cr, no thermostat, runs hot or cold with the hall |
| 142 | **Soldier ramp bin** | 3x3 | feed (wet), water, output bucket, frass tray | 0.1 hu | little to do | grubs climb the ramp into the bucket overnight: harvests itself | 60 cr, Mills-made; never sold at the store because Orrin has no soldier line |
| 143 | **Grinder** | 3x3 | hopper, output tub, setting (coarse / fine) | 0.8 hu | fine paste (press-grade); coarse twice as fast | **will not run unattended** (jams, overheats; the Mutual's exclusion 4) | store **Mincer M8**: 220 cr. Gutter Row **hand-crank conversion**: 30 cr, no power, takes your hours |
| 144 | **Press** | 3x3 | paste in, die, paper (licence), output | 0.4 hu | **true blocks**, clean edges, Middle-grade slab or (with die and licence) Vitabricks | **nightslab**: a slow ram, crumbly blocks, no attention, Sump grade | Co-op hall press by the hour (share hours); store **Ram Six** with die: 380 cr and the licence |
| 145 | **Render pot** | 3x3 | grubs or fat scraps, strainer, output jar | 0.5 hu | clear fat (candle, salve, soap grade) | cloudy fat (frying grade) and more cracklings | 50 cr, an old Works solvent pot with a new element |
| 146 | **Grow bed** | 4x3 | 4 plant slots (plants grow and shove inside), water vessel, lamp rail, medium, paper (certificate) | 0.2 hu (lamp, 16 h a day), 0.05 L per plant | pollinate (buzz wand), prune, train: +fruit set, trimmings | grows at base rate under the lamp; nothing is tended; plants need the dark hours to set fruit anyway | **Orrin GrowBed G1**: 220 cr; 300 with a Brightline fitted. A Co-op **trough bed** on a drain: 70 cr, no lamp, needs a cut window or strip lights |
| 147 | **Sprout rack** | 3x3 | 6 jar slots, rinse vessel | none | rinse twice a day: no mould | unrinsed overnight: one jar in six moulds (to the soldiers) | 20 cr; any shelf with holes |
| 148 | **Dark box** | 3x3 | 4 block slots, spawn, humidity vessel | 0.05 hu (fan) | pick at the right hour: firm caps (up-grade) | caps open and flatten overnight: Mills grade | Grey **mushroom cabinet**: 120 cr; a dead fridge with a fan in the door |
| 149 | **Charger rack** | 3x3 | 4 cell slots, setting (slow / fast / condition) | 0.5 hu per cell-hour | **fast**: a cell in 3 hours, more heat, +1 extra count on the counter; **condition**: a 6-hour deep cycle that recovers a poor cell to worn | **slow**: a cell in 6 hours at off-peak rates, gentlest on cells | store **Halden ChargeDock 4**: 95 cr, refuses End-of-Service and Uncertified. Grey **Leech**: 45 cr, charges anything, marks everything Uncertified |
| 150 | **Pot still** (three-pot) | 3x3 | feed vessel, receiving vessel, heat setting, charcoal column port | 1 hu | swap the receiving bottle at the right hours: trike, then Clean or pale, then tails | **banked**: low heat, no cuts, everything into one vessel: Grey-grade water or harsh pale | 80–150 cr, scrap-built; file 03 has the variants |
| 151 | **Settling drum** | 3x3 | brack in, settled out, silt tray, flakes slot | none | stir and skim: no gain | 6 hours does it; clearing flakes halve it | 30 cr |
| 152 | **Char oven** | 3x3 | wood, shells or spent char in; charcoal out; ash tray | none (burns its own fuel after lighting) | — | **overnight only**: a banked burn of 10 hours. Must sit on floor 16 or a drain square with a vent (bylaw) | 60 cr; or a slot in one of the Ovens on 16 by the night |
| 153 | **Drying cabinet** | 3x3 | 6 tray slots, element | 0.3 hu | turn trays: even dry, keeps colour (sells up) | dries everything, browns herbs (Mills grade) | Orrin **DryRack D2**: 110 cr; or the Ovens by the tray |
| 154 | **Shredder** | 3x3 | in, out | 0.6 hu | — | **will not run unattended** (bylaw: shredders are a fire risk; really, a finger risk) | 55 cr, a Terraces office shredder with its Retirement chip cut out |
| 155 | **Carder and felting table** | 4x3 | fibre in, soap, hot water vessel, felt out | 0.2 hu | rolled and fulled by hand: dense felt (filters, liners) | a sheet left to soak and mat: loose felt (insulation, dunnage-grade) | 70 cr, from a dead garment works on 28 |
| 156 | **Rotor stand** | 3x3 | blade or set, motor, balance gauge | 0.2 hu | balance blade by blade: a grey set that flies true | — (needs hands) | **Rotor bench**: 70 cr; Litho Run has three |
| 157 | **Workbench** | 4x3 | 3 tool slots, item slot, socket | per tool | every undo-VOID and refurbish job happens here | a long job (a deep flash, a cure) can be left on the bench overnight | the **Works bench**: fixed, company property, leased at x1.2. A free-standing Mills bench: 40 cr, wobbles |
| 158 | **Wash basin** | 3x3 | item slot, water vessel, vinegar/soap slot, drain | water per wash | scrub: blue off peel, bread, glass; boil cloth | soak overnight: blue lifts from fabric, labels slide off bottles | 25 cr; must sit on a drain square |
| 159 | **Cold case** | 3x3 | 6 shelf slots | 0.4 hu | — | pauses perishable clocks day and night | Halden **Coldsafe**: 260 cr store; 60 for a voided Terrace fridge, re-legged |
| 160 | **Launch pad** | 4x3 | drone, slip | 2 hu a launch | — | — | part of the lease on 17 (the 17-C spur) |
| 161 | **Test bench** | 4x3 | sample or device slot, three instrument slots | 0.3 hu | quick read: one hidden feature | deep read: all hidden features by morning | 300 cr grey; the Old Hands' one on 19 by the turn |

### 2.13 Special containers

Not machines: no power, few slots, but they change what is inside them over time (IDEAS: jars that steep, cellars that
age). They pack like goods and sit on shelves.

| # | Container | Size | What it does |
|---|---|---|---|
| 162 | **Brew crock** | 2x2 | water + trimmings/crusts + sugar scraps → lowbeer or crust in 48–72 hours; left a week, vinegar |
| 163 | **Red crock** | 2x2 | chillies + bay salt → Red; ages up the rungs, never down; can be portioned |
| 164 | **Brine crock** | 2x2 | greens + brine + vinegar → sour greens in 3 days, then jarred |
| 165 | **Steep jar** | 1x2 | liquid + solid, sealed, N days: tincture (pale + herb, 10d), frass tea (grey + frass, 1d), poultice base |
| 166 | **Soap rack** | 2x3 | green soap → cured in 14 days; 6 bars |
| 167 | **Seed box** | 2x2 | keeps seed dry; without one, seed in a damp shop loses a line-count rung each season |
| 168 | **Candle mould** | 1x2 | chirp fat → 5 tallow candles in 6 hours |
| 169 | **Cress tray** | 1x1 | water sample + cress twist → verdict in 2 days, and the cress |
| 170 | **The catch** (diverter bin) | 3x3, fixed | fills each morning from the chute's table; full, it jams (IDEAS) |

### 2.14 Tools

Tools work from wherever you carry them (IDEAS) and live in tool slots on the bench or in a rack. A tool is what turns one
state into the next.

| # | Tool | Size | What it undoes or makes | Price |
|---|---|---|---|---|
| 171 | **Sewing kit** | 1x2 | VOID (X) → mended; patches; liner quilting | 6 cr |
| 172 | **Soldering iron** | 1x3 | re-termination, board work, strip lights, motor leads | 25 cr |
| 173 | **Heat gun** | 1x2 | screen separation, label lifting, shrink-wrap on refills | 18 cr (or Odile's, on a good day) |
| 174 | **Hot knife** | 1x2 | cartridge opening and re-welding, foil liner seams | 10 cr |
| 175 | **Re-terminating jig** | 2x2 | VOID (Clip) → re-terminated cell | 45 cr, grey |
| 176 | **Flash rig** | 2x2 | VOID (Brick) → reflashed, with a master key in its key slot | 300 cr, grey |
| 177 | **Resin plug kit** | 1x1 | VOID (Puncture) → resealed bottle | 12 cr |
| 178 | **Chisel set** | 1x2 | DoseLock dispensers → cracked doses (with a loss roll); meter seals, regrettably | 8 cr |
| 179 | **Spectro wand** | 1x3 | reveals real vs real-washed, counterfeit pips | 120 cr |
| 180 | **Lens** | 1x1 | reveals printed marks, bad-valet VOID, date codes on Works chips | 15 cr |
| 181 | **Buzz wand** | 1x2 | a Terraces electric toothbrush with the head cut off: vibrates tomato and chilli flowers so they set fruit. Every Mills grower owns one. | 2 cr from the catch |
| 182 | **Bin sieve** | 2x2 | separates frass, moults and insects | 5 cr |
| 183 | **Hanging scale** | 1x2 | weighs scrap, paste, insects for herd tickets; without it you are paid by someone else's scale | 12 cr |
| 184 | **Chute pole** | 1x5 | clears a jammed catch from below; also how vent kids fish things out of the Three Grate | 4 cr |
| 185 | **Canceller** | 2x2 | punches VOID through card or tin. Illegal outside licensed disposal; used to fake Disposal Rebates, and by Halden to make sure | 70 cr, grey |

**Hook:** the buzz wand is the cleanest small joke in the Mills economy: the Terraces throw away toothbrushes on a
three-month schedule (a Vey dental licence), and those toothbrushes pollinate the tomatoes that go back up to the Terraces.
A Middle broker once tried to sell "pollination services" to the Co-op. They showed him a box of four hundred toothbrushes.

---

## Part three: production chains

How things become other things. Times are in game hours; the day is twelve hour steps (08:00–20:00) and the night is one
block of twelve. **Tended** means it happens in day hours with the player's attention (an hour step spent on it, or a
machine run while the player is in the shop to swap and adjust). **Overnight** means it runs alone in the night block.
IDEAS settled the split: tended work is finer and sells up; overnight work is bulk and sells down. Every chain below says
which steps are which, and where the choice lies.

Costs use file 04's Mills tariffs: water 1.20 cr a litre (Pure, Commercial), service water 0.15, power 0.80 cr a hu
(1.20 in the Peak Window, 17:00–20:00). Times are compressed from real life on purpose (a cricket takes six weeks to grow,
not two days); the ratios between chains are what matter.

### 3.1 The catch: where most chains start

**Input:** the diverter bin, full every morning (the Morning Fall comes at 06:00; the bin is full when the shop opens). A
3x3 special container, filled from the table for your chute and floor (file 04, 9.2–9.3).

**What a morning catch on floor 17 looks like** (one roll of a South Chute table, the clinic-and-office side, as an example):

| Cell(s) | Item | Goes to |
|---|---|---|
| 2x2 | insect feed (blue plate waste, peel) | soldier bin (wet) or drying tray then chirp bin |
| 1x2 | 2 DoseLock dispensers, one with doses rattling | chisel bench |
| 1x1 | clipped cell | jig |
| 1x1 | `?` cell | gauge |
| 2x2 | moulded foam packaging | mealie bin, or shredder (dunnage) |
| 1x1 | pulp egg tray | keep (cradle tray) |
| 1x2 | bricked slate | bench (flash or strip) |
| 1x1 | Vey wound film, sealed, in date | shelf (grey: branded, from refuse) |
| 1x1 | ballast (inert card, tape, film) | ballast sack or shredder |

**Steps:**
1. **Sort (tended, 1 hour).** Empty the catch onto the field, sort into streams. The catch is a packing job: what goes where,
   what is worth a square today, what goes to ballast. A **picker** hired for the morning does this in the first hour
   while you do something else, by a plan ("keep cells, slates, food; ballast the rest"), and leaves a **left-behind pile**
   for you to check.
2. **Reveal (tended, instant to 1 hour).** Gauge the `?` cells, lens the VOIDs for bad-valet work, wand anything that claims
   to be real.
3. **Route.** Each stream to its chain below.

**Byproducts:** ballast (1x1 sacks of inert rubbish). Halden charges 2 cr a sack to take it away. Some drone slips want it
as bay filler; the shredder turns the better half into dunnage.

**Day versus night:** sorting is always tended. Leaving the catch full overnight is the IDEAS rule: it jams, and tomorrow's
Drop goes past you to floor 16, whose tenants know exactly which leases on 17 are lazy.

**In play:** the catch is the daily mystery box and the first hour of every day. Its table is the reason to care which chute
you are on. An East Chute catch (markets) feeds insect chains; West Chute and South Chute (Terraces) feed salvage, medicine and electronics;
a North Chute catch (the Crown's) would feed everything. **Alternative:** the catch
fills at a random hour, announced by the rumble, so the morning is not always the same.

### 3.2 Insect protein

The decided chain (canon): food waste + warmth + a little water → insects → grinder → paste → press → blocks.

**Inputs per bin cycle (48 hours, one bin):** 2 kg feed (dried for chirps, wet for soldiers, bran or foam for mealies), 2.4 L
water (gel bricks work and do not slosh), heat (the bin's heater cycles: about 0.1 hu an hour in a Mills hall, 0.3 in a cold
one, so 5–14 hu a cycle).

**Steps:**
1. **Start a colony (once).** Orrin starter (licensed, crashes after six generations, its slab can be branded) or wild line
   (never crashes, never branded). A colony is a 1x2 live item in the bin's colony slot.
2. **Grow (overnight-friendly, 48 h for chirps, 96 for mealies, 24 for soldiers).** The bin draws feed and water each hour.
   **Tended:** mist and feed in small amounts by the hour step: +25% yield. **Untended:** base yield. Empty feed or water slot
   for six hours: the colony stalls; twelve hours: dies back one rung (the colony item shows a weakened state, which recovers
   over a cycle if fed).
3. **Harvest (tended, 1 hour).** Sieve: live insects (2 kg chirps per cycle per bin), frass to the tray, moults to a bag.
   Soldiers harvest themselves overnight into the catch bucket.
4. **Stun (optional, 1 hour in a cold case).** Stunned insects grind cleaner (+10% paste) and travel quieter.
5. **Grind (tended only, 1 hour per tub, 0.8 hu).** Fine setting: press-grade paste. Coarse: twice as fast, makes only
   nightslab-grade. The grinder will not run alone.
6. **Press (tended or overnight).** Tended: 1 hour per tub, four **true slab** with clean edges (Middle and Mills shelves).
   With the Orrin die, a press licence and an Orrin colony behind the paste, the same hour makes four Vitabricks. Overnight:
   the press ram runs slow on up to three tubs of paste (including sour), making twelve **nightslab**.
7. **Sell.** Slab and nightslab down; live chirps sideways to other ranchers and down to the Flats as bait; Vitabricks
   anywhere below 60 at 3 cr, through Orrin's quota.

**Outputs per bin cycle:** 2 kg live chirps → 2 tubs paste → 8 slab (16 cr) or 8 nightslab (9.60 cr).
**Cost per cycle:** water 2.90 cr, power 4–11 cr, feed free from the catch (or 2 cr a sack). Thin. Protein is cheap
because the people who eat it are poor, and the margin is in volume, in owning the heat (floor 21's warm ceiling, file 02)
or in soldiers, which need no heat at all.
**Byproducts:** frass (a sack every two cycles), moults (a bag a week), dead colony (when it crashes: grinds at half yield).
**Feeds:** grow beds (frass), frass tea, the dark box (frass + bedding), poultices, clearing flakes (moults), the render
pot (soldiers), hens (soldiers), the Flats (bait).

**The RB step:** the press has room for an **additive**: a pinch of real herb or a spoon of tomato pulp per tub makes **RB
slab** ("with real herbs", the wrapper says, honestly), which sells to the Middle at x1.5. This is the cheapest climb from
S to anything better, and the reason a grower and a rancher on the same lease make more than either alone.

**In play:** the protein chain is the player's floor, not their ceiling: steady, cheap, sells to everyone below 30 every day,
and its byproducts feed the chains that pay. A shop that only makes slab survives; a shop that makes slab and sells the frass
to its own beds climbs.

**Hook:** Orrin's six-generation crash is a clock, and the whole Mills knows when the big Orrin batches were sold, so the
crash week (economy event 11) can be predicted to the day by anyone who keeps a notebook. **Petra Koss** keeps one. Ranchers
who switched to wild lines the week before the last crash bought their squares on 21 with what they made.

### 3.3 Fat: render, candle, soap, salve

**Inputs:** soldier grubs (best), chirp offcuts, cracklings' leftovers; ash from the char oven or the Ovens on 16; dried herb.

**Steps:**
1. **Render (tended for clear, overnight for cloudy, 3 hours, 0.5 hu an hour).** 1 kg grubs → 0.4 L chirp fat + a 1x1 of
   cracklings. Tended: skim and strain, clear fat (candle, salve, soap grade). Overnight: cloudy fat (frying grade) and more
   cracklings.
2. **Candles (candle mould, 6 hours, any time).** 0.5 L fat → 2 bundles of 5 tallow candles.
3. **Lye (steep jar, overnight).** A bucket of ash leached in 2 L of grey water → a jug of lye. Service water works; brack does
   not (the salt fights the soap).
4. **Soap (render pot, tended, 2 hours stirring to trace).** 0.5 L fat + 1 jug lye → 6 bars green soap. **Soap rack, 14
   days:** cured. Green soap sells at half and stings.
5. **Salve (render pot, tended, 1 hour).** 0.25 L clear fat + 1 herb twist + a splash of pale → 4 tins fat salve.

**Outputs:** candles (the Sump's light, the Rain Church's vigils), soap (wash basin, dressings, bluewashing, shelves), salve
(workshops, the Ledge). **Byproducts:** cracklings (a snack that sells), spent lye (drain cleaner; the Co-op buys it for the
drain troughs on Wet Run).
**Feeds:** the wash basin (soap undoes Blue with vinegar), medicine (salve, boiled cloth), grow beds (cold ash, a little,
for potash).

**In play:** the fat chain is three days of hour steps spread across two weeks, with a cure that ages on a rack, and every
output goes to a different client. It is the kind of small interwoven chain IDEAS asks for: it starts in the soldier bin
(a protein chain), uses ash from the char oven (a water chain), and ends in the wash basin (the VOID chain).

### 3.4 Cells and charging

**Inputs:** cells from the catch (clipped, End of Service, `?`), cells bought, cells paid to you by Sump clients; power from
the socket.

**Steps:**
1. **Gauge (instant).** Every `?` cell becomes a charge, a flag and (on a charger read) a count. Works cells reveal
   themselves here: no counter at all.
2. **Re-terminate clipped cells (bench + jig + soldering iron, tended, 1 hour per cell).** Clipped → re-terminated (Rc,
   grey, uncertified). One in six is dead inside; the jig shows it in the first ten minutes.
3. **Charge (charger rack).**
   - **Slow, overnight:** 6 hours a cell at off-peak rates; four slots, so eight cells in a night block. The gentle setting:
     no extra wear.
   - **Fast, tended:** 3 hours a cell. Hot. Each fast charge counts as two on a branded counter. Worth it when a launch
     needs a pack at 15:00.
   - **Condition, tended or overnight, 6 hours:** a deep cycle that lifts a `poor` cell to `worn`. The cell repair the
     store does not sell.
   - A licensed **Halden ChargeDock 4** refuses End-of-Service and Uncertified cells. A **Leech** charges anything and flags
     everything it touches Uncertified, including your certified cells. Most Mills shops own one of each and know which cell
     goes where.
4. **Assemble packs (bench + pack frame, 1 hour).** Four cells + copper bus bar → a **Mills four** for a shaft drone. An
   H-pack takes only certified cells and will not arm on a mix.
5. **Store.** Cells leak 1% a week on a shelf. Works cells do not leak.

**Costs:** 2 hu to charge a cell from flat (1.60 cr off-peak, 2.40 in the Peak Window). A charged cell is worth 2.40–3 cr on
the street, 2.80 as a store exchange. The margin on charging alone is nothing; the margin is in **re-terminating**
(clipped cell from the catch, worth 0 → 10 cr) and in **who you charge for**: a Sump client paying in cells pays at the
Sump rate (a cell buys more down there).
**Byproducts:** dead cells (scrap by weight; a Halden Reclaim rebate of 0.20 cr each, which is the only legal way to dispose
of one), heat (nothing uses it: no proximity rules).
**Feeds:** every powered machine's cell slot, drone packs, Sump payments, Works-cell savings.

**In play:** charging is the cleanest **day or night** choice in the game: slow overnight is cheap and kind, fast by day is
dear and wearing and sometimes the only way to make a launch. The Peak Window (17:00–20:00) makes the evening the wrong time
to charge and the right time to pack.

### 3.5 Grow beds

The decided chain (canon): seed + water every hour → real produce.

**Inputs for one tomato crop (one bed, four plants, 12 days):** 4 seeds; one bag of medium (or Mills mix, 3.6); 0.2 L water
an hour for the bed (about 58 L for the crop); the lamp, 16 hours a day at 0.2 hu (about 38 hu); optionally a frass sack,
a spectrum key, a Grow Certificate.

**Steps:**
1. **Sow (tended, 1 hour).** Seeds into the bed's plant slots. OneCrop for R✓ (with Pure and a certificate) or saved seed for
   R (and the chance of a line count).
2. **Grow (runs day and night, 6 days to first fruit).** The plant's footprint grows inside the bed and shoves its neighbours
   (IDEAS: the shove rule inside the machine). Each hour the bed draws from its vessel; a dry vessel for 4 hours wilts the
   plants one rung.
3. **Tend (optional hour steps).** **Pollinate** with the buzz wand: +50% fruit set. **Prune**: trimmings (a 1x1 of green
   stuff for the brew crock or the soldiers) and bigger fruit. **Train** up a string: the plant's footprint grows upward
   in the slot instead of out, leaving room for the neighbour. A tended bed sells up; an untended bed sells sideways.
4. **Harvest (tended, every 12 hours for 6 days).** Each plant gives one tomato per 12 hours: 48 a crop. Green tomatoes
   ripen in a bay over a long flight, which is a packing trick: send them green to the Crown on a slow lane and they land
   ripe.
5. **Turn over (tended, 1 hour).** Spent medium out (to the dark box), roots and stems to the soldiers, frass in.

**Grades:** OneCrop + Halden Pure + certificate in the paper slot = **R✓**. Any one missing = **R**. Saved heirloom seed =
**H** (never R✓ honestly; the Crown pays for it anyway through fixers).

**The arithmetic of the divide:**

| | On Halden Pure | On service water |
|---|---|---|
| Water | 58 L × 1.20 = 70 cr | 58 L × 0.15 = 9 cr |
| Lamp | 38 hu ≈ 30 cr | 30 cr |
| Seed, medium | 1.20 × 4 + 8 = 13 cr | saved seed + Mills mix ≈ 3 cr |
| Certificate share | 20 cr a quarter ÷ 7 crops ≈ 3 cr | — |
| **Cost** | **≈ 116 cr** | **≈ 42 cr** |
| 48 tomatoes sold | R✓ to the Terraces at 14: **672 cr** | R to the Middle at 5: **240 cr** |

Both pay. The certified bed pays five times as much and needs a Lane Permit, a cold bay, a certificate inspection, a
Standing high enough to see Terrace slips, and enough cash to float 116 cr for twelve days. The service-water bed needs none
of that. The game should let both be good.

**Other crops** (same bed, different clocks):
- **Leaf greens:** 3-day crop, 8 bunches per bed, very thirsty (0.3 L an hour), perishable in a day, cold going up.
- **Chillies:** 8 days to first string, then a string every 2 days for a long time; drink little; dry to keep.
- **Herbs:** 4 days to first cut, a bunch every day after; cut-and-come-again; the RB additive.
- **Beans:** 10 days, dry in the pod, every bean also a seed (the reason OneCrop does not sell beans).
- **Heirloom strawberries:** 14 days, 1 punnet per plant per 2 days, fragile, cold, the Crown's.

**Byproducts:** trimmings, spent medium, roots, seed (from R plants only). **Feeds:** the brew crock (trimmings, soft
fruit), the soldier bin (split fruit, roots), the dark box (spent medium), seed saving (3.7), the press (RB), the brine crock,
the Red crock.

**In play:** the grow bed is the clearest picture of "the same work, two worlds". Every grow bed on your field carries a
small paper slot, and that slot is the difference between a 240 cr crop and a 672 cr crop. Lend the certificate to a
neighbour's bed for one crop (pooling) and the inspector event rolls against you both.

### 3.6 The dark box and the spent-medium loop

**Inputs:** spent grow medium, frass, shredded card (from the shredder), a spawn jar, a little water.

**Steps:**
1. **Mix a block (tended, 1 hour).** Spent medium + half a sack of frass + a sack of shredded card + a third of a spawn jar →
   a 2x2 **substrate block**. (A spawn jar split three ways keeps the spawn going: one third to the block, two thirds back
   into two new jars, which grow out in 4 days.)
2. **Colonise (overnight-friendly, 4 days, dark box).** The block goes white.
3. **Fruit (3 days per flush, three flushes).** **Tended:** pick at the right hour, firm caps, sells up (12 cr a punnet
   upstairs). **Overnight:** caps open and flatten, Mills grade (3 cr). Two punnets per block per flush.
4. **Retire the block.** After three flushes the block is **mushroom-spent**: crumbly, dark, alive with roots.
5. **Mills mix (tended, 1 hour).** Mushroom-spent block + a sack of frass + a bag of real soil if you have one → a bag of
   **Mills mix**, a grow medium that never exhausts in one crop. It cannot carry R✓ (Orrin's certificate names Orrin
   medium) and it grows tomatoes as well as anything Orrin sells.

**Outputs:** 6 punnets per block over 9 days; one bag of Mills mix. **Byproducts:** none worth naming; the loop eats them.
**Feeds:** grow beds (Mills mix closes the medium loop), up-slips (firm mushrooms), the Middle ("foraged-style", as the
menus on 44 call it).

**In play:** the dark box is the chain that makes waste valuable twice: the grow bed's spent medium grows mushrooms, and the
mushrooms' spent block grows the next tomatoes. A player who builds this loop stops buying medium from the store, which is
exactly what Orrin's packaging calls "unsupported use".

### 3.7 Seed: saving, cleaning, lines

**Inputs:** R fruit from your own beds (not OneCrop), seed fruit from the catch or a Crown sack (blue), beans, vinegar,
water.

**Steps (tomato and pepper seed from Crown seed fruit):**
1. **Wash (wash basin, tended, 1 hour).** Vinegar water lifts the Blue from the skin. The fruit is now `washed seed fruit`
   (Rc, not food, by law).
2. **Scrape and ferment (steep jar, 2 days, any time).** Tomato seed sits in its own pulp and a little water until a skin of
   mould forms: the old way to strip the gel that stops germination. Pepper seed skips this.
3. **Rinse and dry (drying cabinet, overnight).** Tended drying keeps more seeds alive; overnight is fine for beans.
4. **Rag test (cress-tray style, 2 days).** Ten seeds in a damp cloth. The count that sprout is the twist's fertility,
   printed on it. A OneCrop fruit's seeds score zero, which is how you learn the Crown buys OneCrop too.
5. **Grow out (one crop in a bed).** A Crown seed's **variety is `?`** until it fruits. Most are ordinary R. One in many is
   an heirloom, and the **seed savers** will name it (a visit, or a slip), at which point the twist becomes **H** with
   **line 1**.
6. **Keep the line.** Each crop grown from saved seed and saved again adds a line count. Seed in a **seed box** keeps its
   line; seed on a shelf in a damp shop loses a rung each season.

**Outputs:** saved seed twists (40 cr for tomato), heirloom vials (150–400 cr), fertile beans. **Byproducts:** seed pulp
(soldiers), washed skins (soldiers).
**Feeds:** your own beds (no store seed), the Co-op seed shelf (share hours), seed savers, penthouse fixers (heirlooms for
the Crown, which is the Crown's own seed coming back at a hundred times its price).

**In play:** seed saving is a slow, quiet ladder of value that lives in a 2x2 box and a pencil count. It is also the
sharpest legal line in the growing side: saved seed is legal to grow, legal to own, and **illegal to sell as seed** under
OneCrop's licence; seed savers trade it as "gifts" and take "donations". **Hook:** the line counts written on old twists in
the Co-op seed shelf go back past Y57. The oldest, a bean called **Hollis Pole**, is at line 86: one generation a year since
the founding. Somebody planted it the year the tower opened.

### 3.8 Water reclamation (the item view)

File 03 is the depth on water; this is the chain as items moving across machines, so it can be wired to the rest.

**Inputs:** brack (salt-line outlet, free) or grey (service water, wash water, soft grey if you know a soft tapper); clearing
flakes; charcoal fills; PS-4 strips or cress twists; power.

**Steps:**
1. **Settle (settling drum, 6 hours, overnight-friendly).** Brack → settled brack + a silt block. **Clearing flakes** (from
   insect moults, 3.3's lye) halve the time and the silt carried forward.
2. **Still (pot still, tended for cuts).** Settled brack → first hour **trike** (discard or keep as solvent: three
   notches on the cap), then **Clean**, then **tails** (to the drain). **Banked overnight:** no cuts, one vessel, Grey-grade
   water that needs a second pass.
3. **Polish (charcoal column, an hour per 10 L).** Clean → polished Clean. Each fill is good for 30 L, then spent.
4. **Test.** PS-4 strip (instant, rough, licensed) or a cress twist (2 days, honest). Contracts that pay for Certified want
   the logged strip, which only a licence holder can log.
5. **Store.** Drilled cans, jerrycans; sealed vessels do not stale.

**Outputs:** Clean water (the Mills' drink), Grey for beds and washing, trike. **Byproducts:** silt (to the kiln on 16 for
glaze), salt crust from ledge stills (bay salt, 2.3), spent charcoal (back to the char oven, 3.13), tails.
**Feeds:** the insect bins, the grow beds (R grade), the brew crock, the wash basin, every water slip below 30.

**In play:** water is the costliest input of every other chain, so this chain decides the margin of all the others. A shop
that makes its own Clean grows R-grade produce at a fraction of the Pure price, and loses the R✓ grade for it. The Licence
(file 03) is what makes this a choice instead of an obvious win.

### 3.9 Ferments: brew, vinegar, pale, Red, sour greens

**Inputs:** trimmings, soft fruit, crusts, sugar scraps (sweet wrappers, Orrin "Sweet Ration" sachets, syrup dregs from
Middle chute packaging), chillies, greens, bay salt, water.

**Steps:**
1. **Brew (brew crock, 48–72 hours, overnight-friendly).** 10 L water + a 1x1 of trimmings or crusts + a 1x1 of sugar scraps
   → 10 L lowbeer (trimmings) or crust (bread). A brew is safer than its water because the yeast and the acid do part of
   the cleaning; the Mills drank this way through the Dry Year.
2. **Vinegar (leave the crock a week).** Lowbeer or crust → vinegar, with a **mother** that forms on top. The mother is the
   valuable part: a strong mother turns a new crock to vinegar in three days.
3. **Pale (pot still, tended, 4 hours).** 10 L lowbeer → first cut trike (keep for solvent), then about 1 L pale, then tails.
   Unlicensed. A still that runs pale smells different from a still that runs water, and wardens have noses.
4. **Red (Red crock, ageing).** 2 strings chillies + a bag of bay salt, crushed → fresh Red. Working at 3 days, Red at 10,
   old Red at 30. Portion it into pots as you go.
5. **Sour greens (brine crock, 3 days, then jars).** 4 bunches greens + brine + vinegar → 4 jars, sealed, 60-day shelf.

**Outputs:** lowbeer, crust, vinegar, mother, pale, Red, sour greens. **Byproducts:** spent mash (soldiers), trike (VOID
undoing, parts cleaning), tails (drain).
**Feeds:** the wash basin (vinegar lifts Blue), tinctures (pale), salve (pale), dressings (pale wash), pickling, drinkers,
the Middle's pantry.

**In play:** ferments are the "a little now or a lot later" chains that IDEAS liked in the cheese. A crock of Red sitting on
a shelf is space not producing; every day it sits, it is worth more. The **mother** is a live item worth trading on its own:
a Co-op slip asks for "one strong mother" and pays 15 cr, and it is a jelly in a jar.

**Hook:** the Rain Church brews nothing. They say rain should not be made into anything. The Tide Folk brew with bay water
cut half and half with rain, and call it **tide beer**, and it should not be safe, and the Flats drink it every night.

### 3.10 Undoing the void

The richest small chain in the game (file 04, 9.6), as steps by method. All undone goods are **Rc** with a visible repair
state, and all branded ones are **grey**.

| VOID method | Bench work | Machine / tool | Hours | Result | Fetches |
|---|---|---|---|---|---|
| **Stamp** | trike on a rag | bench, trike | 1 tended | stamp shadow under light | 70% of new |
| **Cancel** (packaging) | not worth it; contents into plain packaging | — | 0.5 | plain-packed goods | 50% |
| **X** (garment) | close the cuts with a patch inside | bench, sewing kit | 1–2 tended | `mended` | 40% (synthetic); Crown silk mended invisibly is the Middle's interview shirt |
| **Puncture** (glass) | resin plug, polish | bench, resin plug kit | 1 tended + overnight cure | `resealed`, holds still liquid | 30% |
| **Snap** (device) | splint, solder | bench, soldering iron | 2 tended | working, ugly | 30–50% |
| **Brick** (electronics) | reflash with a Works master key | bench, flash rig | 3 tended, or overnight deep flash | `reflashed`, Fourer slate | 60%, grey only |
| **Clip** (cell) | re-terminate | bench, jig, iron | 1 tended | `re-terminated` | 70% of a new cell, grey |
| **Blue** (food) | vinegar wash, peel, soap for non-food | wash basin | 1 tended, or overnight soak (fabric, glass) | `washed`: insect feed if honest, food if not | feed full price; food illegal |
| **Crush** | nothing | — | — | grey paste, to the drain | 0 |
| **Leg** (furniture) | new legs, or cut the rest to match | bench, the crate maker's saw | 2 | `re-legged`, a lower chair | 50% of real wood, a lot |

**The master key problem.** A flash rig without a Works master key in its slot is a 300 cr box. Master keys are
founding-era firmware chips (2,000 cr and up, Archivists know where some are). Most Mills reflashers do not own one: they
send bricked slates to someone who does (Mattias Orme on Litho Run, by the turn), or they rent an hour of one. **In play:**
the master key is a reward-bay item late on, and owning one changes the chute: every bricked slate becomes 35 cr.

**Where undone goods go:** never the shelf during a brand sweep (economy event 12). Drone bays to grey clients, the counter
to known faces, the Voided's buyers (with a **red thread** token in the bay, file 06b). **Restore or report** (04, 15.6):
every VOID item can instead be handed to a brand agent's slip for a small reward and +5 Standing.

### 3.11 Screens, slates and parts

**Inputs:** bricked slates, cracked screens, out-of-support appliances, dead boards.

**Steps:**
1. **Triage (lens, gauge, test bench).** Is this a flash job, a strip job or scrap?
2. **Flash (3.10)**, if there is a key.
3. **Strip (bench, tended, 1 hour per device).** A slate yields: a screen (often cracked), a small cell (gauge it), a board.
   A kettle yields: an element, a small motor (in its base), cable, a lid. A fan: a motor, a guard, cable. A grow lamp: a
   strip of LEDs, a driver board, a lamp bar shell.
4. **Separate screens (heat gun, 1 hour).** A cracked screen's backlight and panel come apart; a good backlight is a
   lamp, a good panel is Odile Fenn's.
5. **Lift chips (bench, iron, 1 hour).** A board's useful chips into a tin; the stripped board goes by weight. A chip with a
   gold lid and a Works date code is not useful: it is **a Works chip**, and it goes to the Old Hands.
6. **Rebuild.** Strip lights (LEDs + cell clip), Fourer slates (reflashed), Mills lamps, a kettle that works again for the
   shelf.

**Outputs:** Fourer slates, strip lights, elements, small motors, copper, boards, chips. **Byproducts:** cases (shredder:
plastic dunnage), glass (cullet), dead cells (scrap).
**Feeds:** drone parts (motors), insect bins (elements), grow and dark boxes (strip lights), the Old Hands (Works chips),
grey clients (slates).

**In play:** electronics salvage is where a West Chute or South Chute lease earns its x1.1 premium. It also carries the strangest rule
of the tower as an item tag: the Retirement date. A **Retirement wave** (economy event 8) fills the chute with perfect hardware
for a week, and a player with a flash rig and a key has the best week of the season.

**Hook:** some bricked slates in the Terraces chute were never retired: they were bricked by hand, on purpose, the day
after a person was let go, so that their files went down with the hardware. A reflashed slate sometimes boots into a
stranger's last week of work. Static pays for those.

### 3.12 Drone parts: rotors, packs, liners

The late game wants "fit your own drone" to mean parts on a frame, not a crafting tree (IDEAS). The parts themselves come
through chains like any other good.

**Rotors.**
1. **Motors** from stripped kettles and fans (3.11).
2. **Rewind (bench, tended, 2 hours).** A small motor with fresh copper on its windings: grey motor.
3. **Blades.** Chipped blades from crashes (shaft rats sell them by the bucket), or **cut from locked SureSeal cans**: the
   can's polycarbonate is the toughest plastic that comes down the chute, and four blades cut from one can is the Mills
   standard. A locked can (2 cr) becomes a drilled can (water) or four blades (drones); it cannot be both.
4. **Balance (rotor stand, tended only, 1 hour per blade).** Filed, weighed, refit. Four balanced blades + four grey motors
   → a **grey rotor set**.

**Packs.** Four cells + a pack frame + a copper bus bar (bench, 1 hour) → a Mills four (3.4).

**Liners.**
1. **Felt** from the felting table (3.13).
2. **Foil** from Terraces food packaging (the catch).
3. **Quilt (bench, sewing kit and hot knife, 2 hours).** Felt between foil → a **foil liner**, with a pocket for a frozen gel
   brick. Half the cold of a Halden liner. Enough for greens to the Middle; not enough for the Crown.

**Frames** are not made. A shaft-rat frame is bought (150–220 cr, every one different), and a Works controller is found,
won or paid for in turns.

**Outputs:** grey rotors (25 cr a set), Mills fours, foil liners (20 cr). **Feeds:** your own shaft drone; shaft rats, who
are the biggest buyers and who pay in route knowledge (file 11) and chipped blades.

**In play:** a player who builds this chain has a second drone that cannot use lanes and costs a quarter of a Wren. It is
also the path to a late-game frame: a bought shaft-rat frame + a Works controller + a Mills four + grey rotors is a drone
with odd stats that no store sells, which is the IDEAS "fit salvaged or bought parts to a frame". **Hook:** lane
transponders check rotor chips, pack flags and frame pairing. They do not check the controller. A Works controller in a
licensed frame has flown lanes for forty years without a single scan noticing, and some shaft rats say the lane gates
were built to *trust* Works controllers, and still do.

### 3.13 Filters: cartridges, char, felt and masks

**Inputs:** red-strip cartridges (catch, 3 cr bought), spent charcoal, crate wood or shells, unmendable garments.

**Steps (water cartridges):**
1. **Open (bench, hot knife, 0.5 hour).** Red-strip cartridge → empty shell + spent char.
2. **Reactivate (char oven, overnight only).** Spent char re-burned in a banked oven comes out nearly as good as new; a
   load of crate wood (chair offcuts, broken crates) or Flats shells makes new char. 10 hours, a sack in, a sack and a bucket
   of ash out.
3. **Fill and weld (bench, hot knife, 0.5 hour).** Fresh char into the shell, weld the seam, cut the strip away. **Mills
   refill.** It fits a grey housing and nothing licensed.

**Steps (felt and air):**
1. **Card (carder, tended, 1 hour per sack).** Unmendable garments cut to rag and carded → fibre.
2. **Felt (felting table).** Tended: rolled, soaped, fulled by hand, 2 hours: **dense felt** (filters, liners, masks).
   Overnight: a sheet left to soak and mat: **loose felt** (insulation for insect bins, cold cases, dunnage).
3. **Cut (bench, sewing kit).** Dense felt → 4 filter pads for an air stack, or 6 masks with a char pad sewn in.

**Outputs:** Mills refills (5 cr), char fills, felt pads, masks, loose felt. **Byproducts:** ash (to lye, 3.3), lint.
**Feeds:** water stills (char fills), every grey housing below 20, the air vents (pads), the catch pickers and Spill crews
(masks), the insect bins (loose felt insulation lowers heater draw), foil liners.

**In play:** the filter chain is a direct answer to a printed date: a cartridge that is red at day 30 is reopened and filled
and runs another 30. Halden's air stacks log felt pads as "unfiltered" and charge the Standard tier anyway (04), so a felt pad
saves no money, only lungs. Which is why the masks sell better than the pads.

### 3.14 Medicine

The Mills cannot make Vey's chemistry. It can recover it, stretch it, and make the old things.

**Recovered doses.**
1. **Chisel (bench, chisel set, tended, 1 hour per dispenser).** A DoseLock with doses inside → loose pills; one in three is
   crushed by the cap's lock (the loss roll).
2. **Sort (lens, 0.5 hour).** By stamp: gut, fever, antibiotic, the rare thing nobody can name (shown `?` until an Old Hand
   or a Vey technician moonlighting on 14 reads it).
3. **Twist.** A course in a paper twist, name in pencil. **Recalled** batches (recall notice) are flagged; the Sump takes them
   anyway.

**Old things.**
- **Tincture (steep jar, 10 days):** herb twist + pale → 6 vials. Mint, thyme, chilli (for chest rubs).
- **Fat salve (3.3).**
- **Frass poultice (steep jar, 1 day):** frass + bay salt + herb in boiled cloth.
- **Boiled cloth (wash basin with an element, tended, 2 hours):** cotton from unmendable garments, cut to strips, boiled in
  soapy water, dried overnight, rolled in paper. The roll counts as sealed until opened.

**Outputs:** cracked doses (20 cr a course), tinctures, salves, poultices, dressings. **Feeds:** Sump and Mills slips, the
hot-bunk houses, the plasma buyers' donors (who need iron and fever tabs to keep coming back), the Rain Church's sick
room.

**In play:** medicine is the family where a slip's origin changes everything. A Middle slip for "Vey gut tabs, in date,
sealed" wants the store's product and pays a delivery margin. A floor 8 slip for "anything for the gut, ten courses" wants
cracked doses and mint tincture and pays in cells. The same chemistry, two worlds.

**Hook:** the unnamed `?` pills from South Chute come from one Terrace clinic on floor 74, always the same stamp, always in
DoseLocks prescribed to the same patient number, always three doses left. Somebody up there is being given something they
do not take.

### 3.15 Packing materials: crates, dunnage, cradles

Every chain ends in a bay, and bays eat packing.

1. **Dunnage (shredder, tended only, 1 hour per 2x2 of packaging).** Foam, card, film → 4 sacks of dunnage. Foam is better
   given to the mealies; card is better in the dark box. The shredder takes what neither wants.
2. **Cradle trays (press with a tray die, tended, 1 hour).** Card soaked to pulp in the wash basin overnight, pressed into
   trays: 6 per hour. Or take them whole from the Terraces' packaging in the catch.
3. **Wren crates.** The crate maker on 14, **Ibbo Saltash**, swaps a crate for four chair legs or six pallet slats, or 4 cr.
   Re-legged chair offcuts, broken crates and Leg-voided tables are his timber; his offcuts go to the char oven.
4. **Ballast.** Inert rubbish in sacks. A few slips want it (a light drone flies badly in the Up-draught of riser R3, and
   shaft rats weight their bays), and Halden charges to take it away.

**In play:** packing materials are cheap, but a bay that is snug is a bay that survives the Three Grate. The first time a
player loses three jars of sour greens to a rough landing in a half-empty Wren is the day dunnage becomes a product.

### 3.16 How the chains feed each other

Read across: what each chain's byproducts become.

| Chain | Gives to |
|---|---|
| The catch | everything: feed (protein), cells (charging), slates (electronics), garments (felt, mended), bottles (resealed, jars), dispensers (medicine), foam (mealies), card (dark box, dunnage), seed fruit (seed), chairs (crates, char), cans (water, rotor blades) |
| Protein | frass → beds, dark box, poultice; moults → clearing flakes (water); grubs → fat; live chirps → Flats bait |
| Fat | candles → Sump; soap → wash basin; salve → medicine |
| Cells | power for every machine; packs for drones; money below 20 |
| Grow beds | trimmings → brew; soft fruit → brew, paste (RB); split → soldiers; spent medium → dark box; seed → seed saving; herbs → press (RB), tinctures, salve |
| Dark box | Mills mix → grow beds |
| Seed | fertile seed → beds; heirlooms → the Crown via fixers |
| Water | Clean → every chain; trike → VOID stamps; silt → kiln; salt crust → Red, brine, soap |
| Ferments | vinegar → bluewash, brine; pale → tincture, salve, dressing; spent mash → soldiers |
| VOID | mended, resealed, re-legged, reflashed, re-terminated goods → grey clients; unmendable → felt; offcuts → char |
| Electronics | motors → rotors; elements → bins; LEDs → strip lights; Works chips → Old Hands |
| Drone parts | your second drone; shaft rats' payments |
| Filters | char → stills; felt → liners, masks, bin insulation |
| Medicine | Sump and Mills slips; plasma donors |
| Packing | every bay |

**In play:** there is no chain the player must run, and none that runs alone. The smallest closed loop is four machines (catch → soldier bin → render pot → wash basin, with the frass to one grow
bed), which on the 2x2-cells-per-square reading of 1.9 fits inside the starting lease with room for a shelf, and that loop alone touches
protein, fat, soap, food and the VOID trade.

---

## Part four: what each band buys

Who wants what, at which grade, in which condition, packed how, and what they pay with. Slip lines are written in the
grammar of 1.8 so they can be lifted into data. File 11 has the contracts and clients in depth; this is the shopping list.

### 4.1 The Crown (90–104)

**Buys:** almost nothing from the Mills by name, and a great deal through **penthouse fixers**, who take the Mills' work
and sell it as "sourced".
- R✓ produce, small, perfect, cold: strawberries, herbs, greens, tomatoes on the vine. H heirlooms "certified by
  arrangement".
- **Real** water in glass (rain, resealed bottles, wax-sealed): christenings, dinners, gifts.
- **Founding** fittings back: the brass their renovators threw out last season, restored and polished, as "period".
- Eggs. Real soil for the gardens, sometimes (their own, back).
- Never anything mended. The Crown does not buy back anything it recognises, unless a fixer has made it unrecognisable.

**Handling demands:** cold, sealed, fragile, small. Every Crown slip wants a cold liner, a bay seal and a Crown Lane
clearance; most want glass.

**Pays in:** credits, high; sometimes a **reward bay** of things only the Crown has (a Works cell "from grandfather's
desk", a bottle of olive oil, a book).

**Example lines:** `12 × tomato · R✓ · ripe · on the vine · cold` / `6 × 0.75 L water · Real · glass · sealed` /
`1 × valve wheel · Founding · polished`.

**In play:** the Crown is the top of the price table and the bottom of the volume table. One slip a week, if your
Standing can see it.

### 4.2 The Terraces (60–89)

**Buys:** R✓ for anything eaten, R for "artisanal" gifts and office plants; Pure water in bulk; Vey in date; services.
- Greens, herbs, tomatoes, mushrooms (firm, tended), sour greens as a gift-hamper novelty.
- Halden Pure, unopened, batch-stamped (you buy it at the store and deliver it: a margin and a lane fee).
- Orchid growers and clinic gardens buy **rain**, **real soil** and **Mills mix** (unbranded, "for the planters", nobody
  asks).
- Clinics buy **Vey only**. Clinic *staff* buy cracked doses for their own families, through a courier on 59.
- Repair, quietly: a Middle broker brings Terrace slates to Four Hall to be reflashed before the Retirement date, and the
  owners never know their device was ever dead.

**Handling demands:** cold for produce; sealed for water; on time. Terrace slips have the tightest deadlines.

**Pays in:** credits; tips to licensed couriers (never to Mills transponders); occasionally scrip from Terrace offices
paying for Halden-adjacent work.

**Example lines:** `8 × greens · R✓ · cold · by 12:00` / `12 L water · Pure · unopened · batch stamped` /
`20 kg Mills mix · unbranded · bagged` (from an orchid grower on 61).

### 4.3 The Middle (30–59)

**Buys:** the widest list in the tower. Respectable and anxious: they want to look up and spend like down.
- RB slab and Real-Blend for daily eating; R produce cheap ("from a grower I know"); R✓ for occasions.
- **Rc goods**, the Middle is the main market: mended shirts for interviews, re-legged real-wood chairs, refilled
  Skywater (knowingly or not), Fourer slates for the kids, resealed bottles.
- Water at Certified grade, by the standing order (laundries, restaurants).
- Sour greens, Red (old Red as a "heritage" condiment on 44), mushrooms, herbs, kof.
- Cells and chargers (licensed), filter cartridges (licensed, and red-strip ones from the Mills when nobody is looking).
- Parts cleaner (trike), for licensed workshops who buy it as "solvent, unbranded".

**Handling demands:** moderate; liquids upright; brand-safe packaging (a Middle client does not want a VOID shadow
visible on their own shelf).

**Pays in:** credits, some scrip (shop assistants are paid part in scrip), markers on each other.

**Example lines:** `20 L water · Certified or better · sealed · weekly` / `4 × shirt · mended · men's · grey` /
`6 × sour greens · jar` / `1 × slate · working · any make`.

**In play:** the Middle is where most of the player's mid-game income comes from, and where the brand agents walk. Its slips
are the ones most likely to be a **sting** (03's floor 52 slip).

### 4.4 The Mills (10–29)

**Buys:** S and Rc for living; R for birthdays and funerals; tools and parts for work.
- Slab, nightslab, noodles, flatbread, chirps, sprouts, Red.
- Clean water, jug tickets, drilled cans.
- Cells (any flag), chargers (grey), Mills fours, grey rotors (shaft rats).
- Mills refills, felt masks, soap, candles for shed hours, boiled cloth, salve, gut tabs (store) and cracked doses (not).
- Production inputs from each other: frass, Mills mix, spawn, colonies, saved seed, mothers, bran, crates, dunnage.
- Repairs: a kettle, a fan, a heater element for the bin.

**Handling demands:** few. One-floor hops, a kid run through the Under (06b's sucker token), the Three Grate.

**Pays in:** credits, chits, cells, jug tickets, Co-op share hours, produce, turns.

**Example lines:** `12 × slab · any` / `1 × element · works · for a B3` / `40 L water · drinkable · any over grey · by
18:00` / `1 × mother · strong` / `2 sacks frass`.

**In play:** the Mills is the player's neighbourhood market and supplier at once: most Mills slips are small, cheap,
reliable, and pay in things the player needs for another chain.

### 4.5 The Sump (4–9)

**Buys:** S of the worst kind and Rc of every kind, at the lowest prices, carried down through the hardest routes.
- Nightslab by the crate, Sump kof, tallow candles, bay salt.
- Drinkable water at any grade over grey; gel bricks (pack as solids, do not slosh down a shaft).
- Cracked doses, recalled stock, tinctures, poultices, boiled cloth.
- Cells (a cell buys more here), Mills fours, grey chargers, re-terminated cells.
- Felt masks (Spill crews), boots (stitched), waders patched with felt and fat.

**Handling demands:** hazardous goods ride free shafts; heavy goods are most of the order; deliveries go to a gang's
landing, not a dock. **Gangs take a cut** of everything that lands (file 05: the Pumpmen, the Hooks, the Ninefold, the Wet
Widows).

**Pays in:** cells, chits, jug tickets, **salvage** (a bay of whatever came off the Spill this week), turns.

**Example lines:** `30 × nightslab · any shape` / `10 × gut course · any` / `6 × charged cell` / `20 × candle`.

**In play:** Sump slips pay badly in credits and well in cells and salvage. A player who serves the Sump gets the Spill's
goods first, which includes Crown sacks, which includes Works cells, which is the reason anyone flies down.

### 4.6 The Flats

**Buys:** what survives the water: sealed things, salt-tolerant things, things that float or do not matter if they sink.
- Clean water in barrels (03: 120–180 cr a barrel, three times the Mills price, paid in salvage).
- Live chirps and mealies as **bait** for the magnet fishers' eel lines; soldier grubs for the crab pots.
- Felt and fat for waders; boots; masks; rope (file 07).
- Cells and grey chargers for the divers' lamps.
- Tide beer's other half (rain), which they buy from the Rain Church at a price the Church calls a gift.

**Pays in:** salvage, picked by them, in a bay: "pay: salvage, we pick" (03). Brass, Works parts, old Calder things, the
occasional sealed founding-era crate from the drowned plant.

**In play:** the Flats are the only buyers who pay in the raw material of the Old Hands' and fixers' trades. A bait run
pays in brass.

### 4.7 Other buyers inside the tower

| Buyer | Wants from your chains | Pays in |
|---|---|---|
| **Old Hands** (19) | Works chips, Works cells, brass fittings, membrane cartridges, Works benches' spare parts | turns, repairs, a reading of a `?` part |
| **Archivists** | papers found in the catch, date-coded parts (for the record), a flash rig's logs | copies, blueprints, the location of a master key |
| **Mills Co-op** | frass, Mills mix, mothers, spawn, saved seed, water for the beds, hours of labour | share hours, produce, press time |
| **Insect ranchers** (11–13, 21) | colonies, elements, gel bricks, loose felt (insulation) | live insects, frass, herd tickets |
| **Seed savers** | Crown seed fruit, line counts, seed boxes | named varieties, fertile seed |
| **Shaft rats** | grey rotors, Mills fours, foil liners, dunnage | chipped blades, route knowledge, free runs |
| **The Voided** | everything you undo | full grey price with a red thread in the bay |
| **Rain Church** | resealed glass (for giving rain away in), candles, boiled cloth | Church standing, cups of rain (Real) |
| **Tide Folk** | bait, salt, rain-and-brack for tide beer, poultice ingredients | salvage, Flats knowledge |
| **Hot-bunk houses** | slab, sprouts, chirps, soap, candles, at the Whistle hours | chits, regular custom |
| **Plasma buyers** | cold liners, fever and gut tabs for donors, cold bay runs | credits, donor cards |
| **Penthouse fixers** | heirlooms, Real water in glass, restored brass, real wood | credits (high), and silence |
| **Halden** itself | returned company property, scrap at Reclaim, chute-clearing labour, recall hand-ins | recovery chits, scrip, Standing |

### 4.8 Other towers (late)

When tower trade opens (file 07), each tower is a buyer with one obsession:
- **Vantage** buys nothing grey and everything founding: it wants Works chips and Works cells to reverse-engineer.
- **St. Ober's Spire** buys plasma, sterile dressings (boiled cloth only if sealed and logged), and cold-chain runs.
- **Greenhold** buys heirloom seed (to patent) and wild-line colonies (to sterilise and resell).
- **The Hulk** buys Clean water and cells, pays in salvage of a whole dead tower.
- **Bastion** buys nothing; its prisoners make cells, and its wardens buy Red and slab for the canteen at a markup they
  pass on.
- **The Pleasure Pier** buys "authentic Mills slab" served on silver as a novelty (04), old Red, Mills-made candles for
  ambience, and Real water in green glass.
- **The Sounding** buys spare parts for its instruments, and sells forecasts that tell you when rain will fall and the Flats
  will be dry.

---

## Part five: loose stones

Item ideas and small rules that did not fit a chain, for panning.

- **The deposit economy.** Halden Pure bottles (0.50), Real-Blend tins (0.20, alternate Tuesdays), jerrycans (Co-op, 6 cr),
  Halden totes (company property). A shelf of empties is a shelf of small money that needs a trip to collect. **In play:**
  a "deposit run" drone slip to the Orrin collection point on alternate Tuesdays: a bay full of empty tins, pays 0.20 each,
  minus the launch.
- **Herd tickets as scrip.** The Orrin depot pays ranchers in herd tickets that redeem in scrip on payday. Ranchers sell
  them on the Ledge at the scrip rate minus a little. A slip that pays "40 herd tickets" pays in Orrin's own money.
- **The trike notch.** Three knife-notches on a cap means poison. A player who marks trike gets a small Standing with the
  Old Hands; a player who sells unmarked trike in a pale bottle to a Mills drinker gets an event.
- **Bay salt and the salt box.** IDEAS has a salt box for curing. The Mills could salt Flats fish (smoked on 16) and
  cracklings in bay salt to stop the clock. **Alternative:** salt-cured chirps ("salt chirps") as the Sump's travel food:
  1x1, keeps 30 days.
- **Real soil as savings.** A bag of Crown soil does not lose anything on a shelf, does not leak like a cell, and every grower
  will buy it. Mills grandmothers keep a sack under the bunk.
- **The OneCrop paradox.** OneCrop seed from the Crown's plate waste scores zero on the rag test. The Crown buys OneCrop like
  everyone else; the heirlooms are only what their fixers bring them. Which means some of the H seed fruit in the catch is
  Mills seed, grown on 17, sold up as heirloom, eaten in the Crown, thrown down the North Chute, and caught again.
- **The empty Vitabrick wrapper.** Printed card with Orrin's mark. Worthless, except that wrapping slab in one makes it a
  counterfeit Vitabrick. A sack of clean wrappers from the catch is a temptation in a 1x1.
- **Gel bricks as packing.** A frozen gel brick in a foil liner is the cold; thawed, it is 3 L of Clean that does not slosh;
  dried, it is gel sand again. One item, three jobs, three chains (03, drone parts, water).
- **Moulded foam.** The Terraces' packaging is so plentiful in West Chute and South Chute that it sets the mealie economy. **Hook:** a
  Terraces supplier switches to card packaging one season; the mealie halls on 12 lose half their feed; the Co-op sends a
  delegation to the supplier with a petition asking them to please keep wasting.
- **The Works bench's magnifier arm.** Company property, bolted to the floor, and the best lens in the Mills. A player whose
  lease has one gets the lens's reveals for free on that bench. A player who unbolts it gets a Clause 11 problem.
- **Recall bounties in scrip.** Halden pays recall hand-ins in scrip, which spends only at the store, which sells the
  replacement. **In play:** a recall event turns a shelf of DoseLocks into a choice: scrip and +Standing (hand in), or
  cracked doses (grey, more value, down the shafts).
- **Spectrum keys as a calendar.** Keys expire in waves every 90 days (04's calendar); the week after a wave, the chute is
  full of expired lamp bars, and strip lights get cheap.
- **Founding-era tools.** Not every founding piece is a part. A Works torque driver, a Works crimp tool, a Works
  ESD wrist strap. Tools with no brand clocks, that never wear out, that every Old Hand recognises across a room. **In
  play:** a founding tool in a tool slot speeds every job it touches by an hour. Rare, unsellable to anyone but Old Hands
  (who will not resell), and the best reward-bay item in the game.
- **Line counts on colonies.** A wild-line colony could carry a generation count like saved seed. **Alternative:** colonies
  carry a named line ("Koss foam line", "Underhum black") with one visible trait each (eats foam faster, tolerates cold,
  breeds in a cooler hall), per IDEAS' "breeds with fixed, visible traits".
- **The membrane cartridge** (03) as the one item every chain wants and nobody can make: a working one changes the Mills'
  tap hours. It belongs in the catalogue only as a standing request from the Old Hands that never expires.
