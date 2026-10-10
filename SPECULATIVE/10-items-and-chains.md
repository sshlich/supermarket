# 10. Items and chains

Speculative. Plain text is the main version; **Alternative:** marks another version of the same thing; **Hook:** marks a
story seed; **In play:** marks where it shows up in the game. Prices are credits (cr), placeholders from `IDEAS.md`'s first
batch unless a line says otherwise.

**Rewritten 2026-10-09 to match the game as built.** The first pass of this file (21,000 words: grades and marks, a VOID
overlay, condition ladders, legal status, three age clocks, 170 numbered items) is kept in
`archive/10-items-and-chains-v1.md`. It described a game with a lot of tags and no board. The designer's plan
(`IDEAS.md`, "Items: the plan") is one small loop that plays first, so this file starts from what exists: the 25 x 20 board,
the 46 kinds in `src/kinds.json`, properties, slots, rules in hours. Everything that does not exist yet is marked *proposal*.

Three rules ran the rewrite.

1. **Every item is a thing someone needs or a step in a chain.** If it can be deleted without breaking a chain, it is gone.
2. **Variety comes from properties and rules, not from new names.** A cell with 37 charge and a cell with 100 are the same kind.
   A clipped cell is a cell with a mark. Nothing here invents a fourth tomato.
3. **A square is a square of the board.** Every size below is in squares, and follows the drawing.

---

## Part one: how an item works in the game

### 1.1 Squares and footprints

The board is **25 squares across and 20 down**, 500 squares. An item is a **kind** (what it is) with a footprint of squares:
a rectangle (a cell is 1x1, a charger rack 3x3, a crate 4x4), or rows of `#` and `.` for an odd shape (the knapsack is
`.##./####/####/####/####`; a cured ham was `.##/###/##.`). Footprints follow the drawing, so odd shapes interlock: an egg
fits in the hole of a ring sausage. Items turn in quarter turns (`R`, `Q`, right-click) and sit straight on the grid with no
backing.

Sizes are not true scale. They keep their order inside a family (knife < pickaxe < shovel; rope < bucket < knapsack) and that
is all. In this file a cell is 1x1, a hand tool 1x2 to 1x4, a sack 2x2, a machine 3x3, and the biggest thing you can carry
is the crate at 4x4. The pickaxe (5x6) and the shovel (3x7) are too big and are flagged in the game's own notes.

### 1.2 Properties

A kind can declare **properties** (`props`); an item carries their values. A value runs from 0 to a `max`, starts as a
number or rolled from a range, can be **hidden** (shown as `?` until something reads it), and is drawn as a number, a gauge
in the tooltip, or a **strip** up the item's right edge on the field. A property with `gone` set uses the item up at 0.

Two exist today:
- **charge** on a cell: 0 to 100, rolled when the cell appears, hidden, a green strip.
- **burn** on fuel: coal 6 hours, log 3, split log 2, kindling 1; it counts down in a hearth and the item is gone at 0.

**In play:** a property is how one kind stands for many conditions. Nothing needs a "flat cell", a "half cell" and a "full
cell" as three kinds. One cell with a number and a mark covers it, and a gauge turns the `?` into a number.

### 1.3 Containers and slots

A kind may have **slots**: a name, a size in squares, and `accepts` / `rejects` tags. Things inside carry the slot they are
in, and use its own small grid. Containers do not go in containers, except kinds tagged `vessel` (a bottle): one extra level.
Double-click a container to open it as a panel; up to four panels dock beside the board. Dropping a thing on a container that
accepts it puts it inside (blue squares while you drag).

### 1.4 Liquids

A liquid is a property of a **vessel**, not an item: a kind with a `capacity` in ml, an item carrying `{type, ml}`. A bottle
holds 750 ml, one liquid at a time, corked so nothing spills. Pouring is a built-in use on the vessel tag and moves as much
as fits; pouring a different liquid in is refused. Machines take liquid through a vessel put in a slot that accepts
`vessel`, and read and write the vessel by the hour.

### 1.5 Machines and the clock

A **tick is an hour.** A day is twelve ticks, 08:00 to 19:00, and the next tick is the next morning. The clock button runs
time forward; some uses take an hour of it.

A machine is a kind with named slots and **rules**. A rule runs every hour and has one of two shapes:
- **forEach:** every match in a slot, every hour. The charger rack: every cell below 100 gets +17 charge.
- **a job:** `needs` (what each slot must hold) and `hours` (how long), with `hourly` costs and a `done` step that uses up
  the main input and makes the output. A job runs only while every slot holds a match. **Missing an input pauses it and keeps
  the progress.** Running costs are paid each hour; the main input is taken at the end; a full output waits.
- **flow:** moves liquid between two slots' vessels (the still: 100 ml in an hour, half that out as spirit).

**power** is counted per running hour in `hu` (a charged cell holds 2 hu in the lore; the game counts it for now and bills
nothing). The panel header and the tooltip show what each rule is doing: "charging 2", "burning 1/3 h", "waiting: fuel (1/3 h
done)", "output full", "idle".

### 1.6 Uses

A **use** is a verb a held kind can do to a target kind or tag: `read` a cell with a gauge, `carve` a log with a knife, `pour`
one vessel into another. While you hold something, everything it can be used on lights up blue. A use can change properties
(`"+17"`, `"-4"`, `"=0"`), reveal hidden ones, use up the target or the held thing, make new things beside the target, and cost
hours. A use that does none of those says it "does nothing yet".

### 1.7 Value and the hatch (next: step B)

Not built: a **value** on every kind, which can follow a property (a cell is worth more charged); a **buyer hatch** that pays
at the end of the day for what is in it; **credits** and **rent** to push back. Until contracts and drones arrive, the hatch is
the only way anything becomes money.

### 1.8 What is shelved

Left out on purpose, by the designer's plan ("good material in `SPECULATIVE/`, to add one at a time once the loop plays").
Each is a real idea with real lore; none is in the game, and none is needed to test the loop.

| Shelved idea | What it would add | Where the lore lives |
|---|---|---|
| **Grades and marks** (real, reclaimed, synthetic, founding) | goods that look the same but sell to different buyers | 04 §9–10; the v1 file |
| **VOID** | rich brands ruin goods before the chute; undoing it is a trade | 04 §9.4, 05 §4 |
| **Legality, brands, licences, the Retirement date** | licensed and grey kit; devices that die on a date | 04, 05, 09 §1 |
| **Condition** (new, worn, poor) | wear as friction | decided against: "no wear (friction without depth)" |
| **Age** (real age, printed date, counter) | goods that gain or lose value by the clock | v1 §1.6 |
| **Hidden features and instruments** | `?` properties beyond charge, and tools that read them | 09 §10; the gauge is the first |
| **Day and night split** | tended work by day, bulk work overnight | IDEAS |
| **Metered bills** | water and power charged by the hour | 04 §4 |
| **Handling tags** (upright, fragile, cold) | bay rules for drones | 09 §3.4 |

---

## Part two: what the game has today

Forty-six kinds. Many came from the earlier shop prototype and wear game-icons glyphs. The plan says sprites stay glyphs "until
an item has proven itself". This part gives each group a job in the Stack, or says it has none.

### 2.1 Fire and fuel

**Log** 5x1, **split log** 4x1, **kindling** 3x2, **coal** 2x2, **matchbox** 2x1, **bellows** 4x2, **fuel chest** 3x2, **hearth**
4x3.

Wood is a Crown material. In the Mills it is pallet beam, packing-crate slat and the offcuts that come down the North Chute
after a Crown renovation. Coal here means **charcoal**, the Mills's fuel and its filter medium (03). The fuel burns down by
the hour: coal 6, log 3, split log 2, kindling 1.

The **hearth** is a Works canteen range, one of the few still lit on floor 16 (the Ovens). Its rule: with wood in the `input`
slot and fuel in the `fuel` slot it burns for 3 hours (fuel loses 1 burn an hour), uses up the wood and puts charcoal in the
`output` slot. An open flame is a standards matter on most floors; the Ovens are where the Mills bake, smoke and fire, so a
hearth on 17 is a risk the player chooses.

The **bellows** and the **matchbox** do nothing yet. They are waiting for a rule (embers, lighting).

### 2.2 Water, mash and spirit

**Bottle** 2x4 (750 ml), **well** 3x3, **mash vat** 3x3, **still** 3x3.

The bottle is the vessel. The **well** is a small air-well (03): it fills the bottle in its slot with water, 250 ml an hour.
The **vat** fills a bottle with mash (the Mills's weak ferment, lowbeer) at the same rate. The **still** is a pot still: it takes
a bottle of mash and a bottle for the spirit and turns 100 ml of mash an hour into 50 ml of spirit (pale, 03). In the lore a
still is "unlicensed water treatment" whatever it makes, 250 cr and the apparatus taken (05); that part is shelved.

### 2.3 Cells

**Cell** 1x1, **cell gauge** 1x1, **charger rack** 3x3. Built as the test of the rule format (2026-10-09).

- The **cell** is the Stack's everyday battery (the H-cell, 09 §2.2). Its `charge` is rolled from 0 to 100 and hidden: a
  yellow cell with a `?` strip.
- The **gauge** is a thumb-sized needle dial. Hold it over a hidden cell and use `read`: the number appears.
- The **charger rack** has one 2x2 `cells` bay (four cells). Each cell below 100 gets +17 charge an hour, flat to full in six
  hours, and the rack draws 0.5 hu per cell-hour.

The starting field has the rack, four cells and the gauge along the bottom row.

### 2.4 Things that hold things

**Crate** 4x4 (a 6x5 slot), **wooden bucket** 3x3, **strongbox** 3x2, **knapsack** 4x5 (a 5x4 pack and a 2x2 pocket),
**knife belt** 5x4 (one 1x4 sheath that accepts `blade`).

The crate is the Stack's unit of shipping: a Vitabrick crate, a Hatch crate, a displaced-goods crate. The knapsack and the belt
are the night kit (see 2.6). The strongbox and the bucket are shop furniture.

### 2.5 Money and the counter

**Coin** 1x1, **coin stacks** 3x3, **price tag** 2x1, **key** 3x1, **padlock** 2x2.

Coins are **chits** (04 §1.2): bearer tokens issued by Halden itself, because a company that owns every square still wants a
cut of the trades it cannot see. The price tag is for the counter. The key and the padlock belong to the strongbox.

### 2.6 The night kit, parked

**Knife** 1x4, **axe** 4x6, **pickaxe** 5x6, **shovel** 3x7, **rope** 3x2, plus the knapsack and belt above.

Night trips and combat are out of scope for now. If they come back, these are the Sump's and the Flats's kit: the diver's knife
and line, the pickers' hook, the rope, the knapsack that goes with a hireling. For now they are placeholders: the axe, pickaxe
and shovel are off scale and the axe has an old flat glyph.

### 2.7 Light and time

**Lantern** 2x3, **candle** 1x2, **hourglass** 2x3.

A candle is a **tallow candle**, the Sump's light and the Rain Church's vigil. The lantern is a Works hand lamp. The hourglass
has no job; the clock button replaced it.

### 2.8 Farm and food, legacy

**Cheese wheel, cheese wedge, cured ham, ring sausage, loaf, slice of bread, egg, apple, honey jar, flour sack, hen, chicken
coop, seedling.** The kinds stay in the data and in old saves but are out of the tray (`"legacy": true`).

The Stack has no farm: fresh food is grown only with precious water, and the chain that feeds most people is waste to insects to
paste to slab. Real food is a Crown luxury. If any of these come back they come back as expensive things the Mills do not eat:
an egg, an apple, a honey jar. Their sprites (the ham, the sausage, the hen) are good art waiting for a world that wants them.

---

## Part three: the first batch, in the world

Stuff comes in, you work it, it goes out for money, and something pushes back. This is the first batch from `IDEAS.md` ("First
item batch", a proposal, not built), told in the Stack. Sizes and values are the proposal's; where a number is mine it is
marked.

```
the catch (each morning) ─┬─ food waste ──► insect bin ──► chirps ─(hand grinder)─► paste ─(press)─► slabs
                          │                  ▲  ▲   └──► frass
                          │      cell (heat) ┘  └ jerrycan (water) ◄── tap
                          ├─ ? / clipped cells ─(gauge, soldering iron)─► charger ─► cells: bin heat, or sell
                          ├─ old kettle / desk fan ─(driver kit)─► element, motor, cable ─► copper, scrap
                          └─ ballast ─► costs money to get rid of
everything ─► buyer hatch (pays at the end of the day)
```

### 3.1 The catch

Where it all starts. Under the floor of your cage, in the corner, a steel flap and a **diverter bin**: your one-in-twelve share
of the East Chute, which the Mills call the Kitchen because it falls past Lantern Row's restaurants and Orrin's test kitchen
before it gets to you. At 06:00 the Morning Fall comes down and the catch bangs. When the shop opens at 08:00 the bin is full.

**The catch** is a 3x3 container (nine squares) and the first puzzle of every day.

*Proposal for its rule:* at 08:00 it fills from a weighted table, drawing entries until the next one will not fit in its nine
squares. Left full, it skips the next fill ("a full catch catches nothing") and floor 16 gets your share. What does not fit
is somebody else's morning.

| Weight | What lands | Size | What it is |
|---|---|---|---|
| 30 | **food waste sack** | 2x2 | peel, plate scrapings, bread ends from a kitchen above |
| 24 | **ballast sack** | 1x1 | inert rubbish: card, tape, film. Worth nothing, and Halden charges to take it |
| 14 | **clipped cell** | 1x1 | a cell with its terminals cut |
| 12 | **cell** (charge hidden) | 1x1 | a cell nobody has read |
| 10 | **old kettle** | 2x2 | a Terraces kettle that stopped boiling |
| 10 | **desk fan** | 2x2 | an office fan, one blade cracked |

That is an **East Chute** table: markets and kitchens, so food waste leads. A **South Chute** table (clinics and offices) would
swap in slates, medicine dispensers and bins of paper; a **North Chute** table (the Crown's) is where wine bottles with the
neck snapped and real wood come from. The player's chute is a choice of which kind of rubbish to live on.

**In play:** the catch is a packing puzzle before it is a sorting one. Nine squares, a 2x2 kettle and a 2x2 fan already take
eight of them. **Alternative:** the catch fills at a random hour, announced by the rumble, so no two mornings begin alike.

### 3.2 Cells

The Stack runs on cells. A cell is the one thing that is small, valuable, the same everywhere, and needed by every lamp, drone,
bin and rack in the building. The Works made them for forty years, and the Dark Floors still do.

| Item | Size | Value | What it is |
|---|---|---|---|
| **cell** | 1x1 | 1 to 3, by charge | the H-cell. Charge 0 to 100, rolled and hidden |
| **clipped cell** | 1x1 | 0 | a cell with a cut contact. A yes/no mark on a cell, a small stand-in for VOID |
| **cell gauge** | 1x1 | built | `read` on a hidden cell shows its charge |
| **soldering iron** | 1x3 | 25 | `re-terminate` a clipped cell: 1 hour, the mark is gone |
| **charger rack** | 3x3 | built | four bays; +17 charge an hour; 0.5 hu per cell-hour |

**Why cells come clipped.** Halden retires its own cells on a date and clips the terminals of the ones it throws away so they
cannot go back into a licensed dock. The cell inside is fine. A clipped cell is a good cell with a bad contact, and a
soldering iron and an hour make it good again. That is a whole Mills trade in one step.

**The chain.** Clipped cell, an hour with the iron, a cell of unknown charge, the gauge, the charger, a full cell. A full cell
runs a bin for a day (3.4), or goes to the hatch at 3.

*Open (see Part six):* the proposal gives a re-terminated cell a value of 10 and also says a cell's value follows its charge,
1 to 3. They disagree.

### 3.3 Salvage: kettle, fan, driver kit

The Terraces throw out working appliances with one broken part, because the people who live there do not mend things. The chute
brings them down to you.

| Item | Size | Value | What it is |
|---|---|---|---|
| **old kettle** | 2x2 | 1 | the element still heats; the switch is dead |
| **desk fan** | 2x2 | 1 | the motor turns; a blade is cracked |
| **driver kit** | 1x2 | 8 | a roll of small screwdrivers and a magnet. `strip` an appliance: 1 hour |
| **heating element** | 1x2 | 2 | a heater: it would warm a bin off the socket instead of a cell |
| **small motor** | 1x1 | 3 | for drone rotors, later |
| **cable coil** | 1x1 | 4 | a metre of good cable |
| **copper bundle** | 1x1 | 3 | what a cable coil strips down to |
| **scrap sack** | 2x2 | 1 | what is left: housing, screws, plastic. It sells by weight |

*Proposal for the rule (fixed yields, for now):* the driver kit on a kettle gives an element, a cable coil and a scrap sack; on a
fan gives a motor, a cable coil and a scrap sack; on a cable coil gives a copper bundle. One hour each. The appliance is used up.

**In play:** a kettle is worth 1 and strips into 7 worth of parts. The margin is the hour and the 8 cr kit. This is the Old Hands'
trade at its smallest, and where a player first learns that a thing's value is what it becomes. **Alternative:** stripping is a
chance, not a fixed yield (some motors are dead), which gives the hour a gamble.

### 3.4 Protein: the insect bin to the slab

The decided chain (canon): food waste, warmth and a little water make insects; a grinder makes paste; a press makes blocks.
People below the Terraces eat it every day, and the people who eat it are poor, so the margin is thin by design.

| Item | Size | Value | What it is |
|---|---|---|---|
| **insect bin** | 3x3 | store | a steel cabinet of trays on legs; slots for colony, feed, water and a cell |
| **chirp colony** | 1x2 | 15 | the crickets, in the bin, and they stay there |
| **food waste sack** | 2x2 | 2 | what the bin eats |
| **jerrycan** | 2x2 | 6 | a 10-litre vessel. The bin's water, and the tap's customer |
| **chirps tub** | 2x2 | 6 | a harvest of live chirps |
| **hand grinder** | 2x2 | 30 | a tool. `grind` a chirps tub: costs your hour |
| **paste tub** | 2x2 | 4 | grey paste |
| **press** | 3x3 | store | a ram on a screw, turned by a small motor |
| **slab** | 1x1 | 2 | the Stack's food: a block of pressed paste |
| **frass sack** | 2x2 | 2 | what the crickets leave; the grow bed's food, later |

*Proposal for the rules (hours are mine; the numbers are placeholders):*

- **Insect bin.** `needs` a colony, a food waste sack, a vessel of water and a cell (the heat). A cycle is **24 hours**, two
  game days. Each hour it draws 100 ml from the jerrycan (2.4 L a cycle) and 4 charge from the cell (a full cell is a day's
  heat, and a cell is worth about 3). At the end it uses up the food waste and makes a chirps tub and a frass sack in its
  output slot. If the water or the heat runs out, the cycle pauses and keeps its progress.
- **Hand grinder.** `grind`: a chirps tub becomes a paste tub, 1 hour of yours.
- **Press.** `needs` a paste tub in its slot; 2 hours; 0.6 hu an hour; makes 4 slabs.

**Per cycle:** food waste (2), water at the Mills tap price (about 3) and a cell's heat (about 2: the cell comes out nearly
flat) go in. A chirps tub (6) and a frass sack (2) come out, or 4 slabs (8) and a frass sack (2) once ground and pressed. It is
thin on purpose: the work is for the poor, and the margin is in having more than one bin. **Why chirps.** Crickets grow on waste, fast, in a warm box, with a thimble of water.
A hen would want a farm.

**In play:** the bin is the first machine you have to feed, not just wait for. The cell for heat is the link that ties it to
the cell chain: a clipped cell from the catch, an hour with the iron, a charge, and it keeps a colony warm for a day.

### 3.5 Water: the tap and the jerrycan

| Item | Size | Value | What it is |
|---|---|---|---|
| **tap** | 2x2 | store | a tap post: fills its vessel 1 L an hour and **counts the litres** |
| **jerrycan** | 2x2 | 6 | 10 L; the bin's water |

*Proposal:* water is counted at the tap like power is counted at the rack, and shown. In the lore every drop passes a meter and a
price: Halden Pure at a Mills tap is **1.20 cr a litre** (04), and the game does not bill it yet.
**Alternative:** the tap only runs in **tap hours** (the Mills tap runs twice a day), so in a 12-hour day it gives water at 08:00
and again at 18:00. Two litres a day is enough for one bin and no more, which makes water the first reason to want a well.

### 3.6 The buyer hatch

A 3x3 container. At the end of the day, whatever is in it is sold for its value, and a credits counter goes up. The
proposal puts it in step B so things can be traded before contracts exist.

In the world it is a **broker's hatch**: a steel flap cut into your frontage counter. The floor's broker, the only buyer who
comes below 30 every evening, empties it at 19:00 with a scale and a sack and pays by weight and by what it looks like. He sees
everything you made and pays low. He is the placeholder for the whole tower's buying, and he goes when the contracts and the
drones arrive.

**In play:** the hatch shows the day: the takings, the ballast charge, what he refused. A shop's first lesson is what the hatch
likes. *Proposal:* ballast costs 2 each to be taken; everything else is its value.

### 3.7 One day of the loop

Day 3, 08:00. The bin finished its cycle overnight (it started on the morning of day 1). The catch has filled. Your rack holds
two full cells from yesterday. The jerrycan has 7.6 L left. Nothing here is built; the numbers are the proposal's.

| Hour | What you do | What runs |
|---|---|---|
| 08:00, no time | The catch holds an old kettle, a clipped cell, a `?` cell and two ballast sacks. Read the `?` cell with the gauge (it says 52). Drag the finished chirps tub and frass sack out of the bin. Put yesterday's spare waste sack, one of the rack's two full cells and the jerrycan into the bin: it starts a new cycle. Put the `?` cell in the rack. Put both ballast sacks in the hatch. | the bin: cycle 1 of 24 |
| 08:00 to 09:00 | `grind` the chirps tub: it becomes paste. | bin 2/24; the cell charges 52 to 69 |
| 09:00 to 10:00 | Put the paste in the press. Hold the iron over the clipped cell: it is a cell again. Put it in the rack. | press 1/2; bin 3/24; the `?` cell at 86 |
| 10:00 to 11:00 | The driver kit on the kettle: an element, a cable coil, a scrap sack. | press done: 4 slabs; the `?` cell reaches 100; bin 4/24 |
| 11:00 to 12:00 | The driver kit on the cable coil: a copper bundle. | the other cell charges; the bin runs on |
| 12:00 to the end of the day | Nothing needs your hands. Wait, or fetch and carry. | the rack tops up the last cell |
| Before the last hour | Put the 4 slabs, the frass sack, the element, the copper, the scrap sack and the two charged cells in the hatch. Keep the other full cell for the bin. | the hatch pays at the end of the day |

The takings: 4 slabs (8), frass (2), element (2), copper (3), scrap sack (1), two cells (6), less the ballast (4): about **18 cr**.
Rent on floor 17 is 125 cr a week, 18 a day. A good day pays the rent of that day and nothing more.

Two things this shows the designer. The loop leaves **eight idle hours** on a day like this one: the answer is a second bin, and
a reason to want it. And it is **break-even on purpose**: the floor above throws out enough to live on, and the rent is
exactly what it is worth.

---

## Part four: later batches

Options, in the order `IDEAS.md` lists them. Each is the same loop one step wider: something from the chains above feeds it,
and something it makes feeds another.

### 4.1 Fat and light

The soldier-fly grubs of the old lore are out; chirps do the job. Fat is the next thing to make from the same tub.

| Item | Size | Value | What it is |
|---|---|---|---|
| **render pot** | 3x3 | store | a lidded pot with a cell slot for heat |
| **chirp fat** | 1x2 | 5 | a jar of rendered fat, clear |
| **cracklings** | 1x1 | 1 | what is left in the pot; a snack that sells |
| **candle mould** | 2x3 | store | a tin block of eight wicks |
| **candle** | 1x2 | 2 | already in the game: a tallow candle |
| **dead lamp bar** | 1x4 | 1 | a strip light from a ceiling, thrown out with its power supply dead |
| **strip light** | 1x3 | 4 | what a lamp bar strips down to, with a driver kit |

*Proposal for the rules:* the render pot takes a chirps tub and a cell, runs 3 hours, and makes a chirp fat jar and a cracklings
item; the candle mould takes a fat jar and makes four candles in 6 hours.

**Who needs it.** Candles are the Sump's light and the Rain Church's vigil (06a); fat is also salve, soap and a waterproofing
for waders, which is later. A strip light is what a grow bed wants (4.2). This batch gives the chirps tub a second use, so the
bin has a choice: grind it for slab, or render it for fat.

### 4.2 The grow bed

The decided other food chain: seed and water every hour make real produce, which sells up. A grow bed needs four things at
once, which makes it the first machine with a real shopping list.

| Item | Size | Value | What it is |
|---|---|---|---|
| **grow bed** | 4x3 | store | a tray on legs: slots for seed, medium, water and light |
| **seed packet** | 1x1 | 3 | a licensed seed, sealed (the patent is on the packet) |
| **seedling** | 2x2 | built (legacy) | a plant in the bed, still growing |
| **greens** | 1x2 | 12 | a harvest of leaf greens |
| **frass sack** | 2x2 | 2 | the bed's medium, from the bin |

*Proposal:* the seedling is a plant that **grows inside the bed**: its footprint goes from 1x1 to 2x2 to 3x3 over 24 hours as
long as it has water, light and medium, and it is picked when it is full. `needs` seed, a frass sack, a vessel of water and a
strip light, with the water drawn at 100 ml an hour and the light at 0.4 hu. Missing anything pauses the growth and keeps it.

**Why it is dear.** Real food is grown only with precious water and sells up. Greens at 12 against a slab at 2 is the divide in
two numbers. The player's bin feeds the bed with frass, and the bed's trimmings feed the bin, which is the one place where
two chains hold each other up.

### 4.3 Store goods

Only once contracts ask for them. The Hatch (the store branch behind a grille on 18) sells them at store prices, and a slip will
want them delivered: **Vitabrick** 1x1 (3 cr; Orrin's licensed slab), **Halden Pure** (a bottle with water, 1.20 cr a litre),
**gut tabs** 1x1 (6 cr for ten; the most-bought medicine in the Mills, because of the water), **kof** 1x2 (5 cr a tin).

### 4.4 Drones and contracts

The step after the hatch, and the loop the game is for (`IDEAS.md`, "Drones and contracts"). *Proposal, nothing built.*

| Item | Size | What it is |
|---|---|---|
| **hopper** | 2x2, bay 2x1 | a cheap one-box errand drone; about eight floors of range (09 §3.9) |
| **Wren** | bay 3x2 | the courier frame you start with; sold with the shop loan |
| **launch pad** | 3x3 | a cradle with a charging plate: put a drone in it and launch |
| **contract slip** | 1x1 | a physical manifest: what is wanted, where, by when, for how much. Packing it into the bay assigns it |
| **route card** | 1x1 | a strip of charged film in the controller slot (09 §3.6); later |
| **dummy disc** | 1x1 | a tin tag stamped with your lease; a hopper carries one (Bylaw 61) |

A drone is a container with a cargo slot and stats (range, speed, special bays: cold, sealed). The launch pad is a machine: a
launched drone leaves the board for distance over speed hours, and on landing the game checks the cargo against the slip, pays,
takes what was delivered and puts the reward in the bay. Hoppers fit the first errands (a spare cell to a neighbour, 2 cr); the Wren
is the first long run.

### 4.5 What file 15 adds

The underside (15) is items too. None of it is combat: a **wand cell** (a cell with a tag the Mills get nervous about), pills as
three-way kinds (**licensed**, **cracked**, **counterfeit**), a **pass** with a warm or cold mark, a **twist** (a small
package a hopper carries), a **hot** tag that makes a drone bay uninsurable. They land when contracts do.

---

## Part five: who buys what

The hatch pays the same price whoever you are. Contracts will not. This is the shopping list, in plain words, for when they come
(file 11 has the clients).

**The Crown (90 and up).** Almost nothing from the Mills by name, and a great deal through **penthouse fixers**, who take the
Mills's work and sell it as "sourced": small, perfect, cold real produce; rain in glass; old brass restored and polished as
"period". Never anything mended that they recognise. The top of the price table and the bottom of the volume table.

**The Terraces (60 to 89).** Real produce for anything eaten, in bulk; unopened Halden Pure; Vey medicine in date. Quietly, repair:
a Middle broker brings Terraces slates to Four Hall to be reflashed before they die on their date, and the owners never know. The
tightest deadlines in the tower.

**The Middle (30 to 59).** The widest list. Respectable and anxious: they want to look up and spend like down. Blended slab for
daily eating, mended goods for interviews, water by the standing order, licensed cells and filters. This is where most of the
player's mid-game money comes from, and where the brand agents walk.

**The Mills (10 to 29).** Slab, chirps, candles, clean water, cells of any kind, parts, and each other's inputs: frass, colonies,
seed, an element for a bin. Small, cheap, reliable orders paid in things the player needs for another chain: cells, chits, produce,
turns.

**The Sump (4 to 9).** The worst food and the most patched goods at the lowest prices, carried down the hardest routes. Paid in
cells and salvage, not credits. A player who serves the Sump gets the Spill's goods first.

**The Flats.** Whatever survives the water. Live chirps as bait for the eel lines; felt and fat for waders; rope. Paid in salvage:
brass, Works parts, and sometimes a sealed crate from the drowned plant.

**Inside the tower:** the Old Hands buy Works chips, cells and brass and pay in repairs and a reading of a `?` part; the Mills Co-op
buys frass, seed and hours and pays in produce and press time; insect ranchers buy colonies, elements and gel bricks; shaft rats buy
grey rotors and packs and pay in route knowledge; hot-bunk houses buy slab and candles at the Whistle; the Rain Church buys glass
and candles and pays in cups of rain; Halden buys back its own property and scrap at Reclaim.

---

## Part six: questions

From `IDEAS.md`:
1. **Scope.** This batch as listed, or swap something in from the later ones (4.1 to 4.3)?
2. **Clipped cell** as a yes/no property with a mark?
3. **The grinder** as a hand tool that costs your hour (proposed), or a powered machine?
4. **Stripping:** fixed yields (proposed for now), or a chance (some motors are dead)?
5. **The hatch:** build it with this batch, so things can be traded?

Raised by this rewrite:
6. **Cell values.** A re-terminated clipped cell is "10" in the proposal and a cell's value "follows its charge, 1 to 3". Which?
7. **Stripping a cable coil (4) gives a copper bundle (3).** A loss, on purpose or not?
8. **The bin cycle.** The proposal's insect cycle is 24 hours, two game days, because a day is twelve ticks. Is two days too long
   for the first machine a player meets?
9. **Eight idle hours.** The worked day (3.7) has four hours of work and eight of waiting. Is the answer a second bin, a reason to
   fetch and carry, or a shorter cycle?
10. **Tap hours.** Water all day (proposed) or twice a day (the lore)? The second makes water the first reason to want a well.
11. **The starting block.** The board is 25 x 20 and rent is a fixed 125 cr a week, rising each month; is that where the game
    starts, or on a smaller block you grow by renting rows? (README, A.2.)
12. **The hearth.** The lore treats open flame as a risk. Does the hearth stay in the starting loop, or does it move to a later
    floor (16, the Ovens)?
