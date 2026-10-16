# The station (`inventory-v3`): a setting and its systems, nothing built

Agreed 2026-10-15 in conversation. `DESIGN.md` is what exists; `ECONOMY.md` is the earlier economy design. This replaces
ECONOMY.md's *source of prices* (random tags and dice events become station stocks and breakdowns) and keeps its deal
(section 4), market formula (section 3), event shape (section 5), sim (section 9) and sinks idea (section 7). All numbers
are starting guesses for the sim. **Stationary first**: you run one stall; moving between decks is a later option.

## 1. The setting

A space station: a closed loop for matter, open at the edges for energy, goods and money. You run a stall in it. The
station is techno-dystopian and the divide is physical: the ring (gravity, light, real plants) and the spine (recycled air,
bunks). A resident has a deck, and the deck sets what they want and what they can pay. No travel for now.

## 2. What it changes in the game

- Prices come from the station's condition, not dice: scarcity is a cause (section 3).
- Items are made of materials, and a recycler gives them back (section 4).
- Machines are placed verbs on the grid; they cost cells to run and your energy to start (sections 5, 6).
- Customers still walk in, and now **orders arrive by mail** on the wired terminal and ship in real parcels (7, 8).
- Money and matter cross the station's edge, so the loop never rests (section 9).

## 3. Needs and prices

The market's eight tags become **needs**: air, water, food, power, medicine, parts, comfort, luxury. Each is a gauge of how
well the station is supplied. The price index keeps ECONOMY.md's reversion formula, but `D` (demand) and `S` (supply)
come from consumption and stock, so a shortage moves prices because it is a shortage. **Events are breakdowns** (a scrubber
fails, a convoy lands, a strike stops parts), one event shape as before, with a rumor from the engineers by mail. Your
sales and dismissals still move prices and fade, so the market still remembers what you did.

## 4. Items: everything is made of materials

Every item has a short composition (ration bar = biomass 2; filter = polymer 1 + metal 1; tool = metal 3), shown on hover.
- **Tiers:** raw (scrap, ice or greywater, biomass, ore), processed (bar, clean water, paste, cell, polymer), made (ration,
  filter, tool, part, medicine, comfort goods). Value is chain depth, roughly x4 per step: scrap 1, bar 4, part 16.
- **The recycler gives materials back**, with about 10% lost as sludge each pass; the digester turns sludge into biomass.
- **Existing items, reread:** fire is dangerous on a station, so matches, lighters, candles and zippos are banned
  luxuries; books are paper and so heirlooms; wine is a distillate; sandwich and salami are vat food; ore, ingot and
  furnace stay as they are.
- **Your own stock is always usable.** Sell it, process it, or use it (eat a ration for energy back, burn a cell,
  fit a filter). Every item is a decision, and none is dead stock.

## 5. Machines

A machine is a container with slots (input, cells, output), like the furnace. It is placed on the grid and competes with
stock for room. It has its own panel with buttons; the terminal is the remote (section 7).

| Machine | Does | Needs |
|---|---|---|
| Smelter (the furnace) | two ore into one bar | cell |
| Recycler | junk or goods into materials (-10% to sludge) | cell |
| Purifier | greywater or ice into clean water | cell, filter (wears) |
| Hydro tray | seed + water + lamp + time into crops | lamp, water |
| Vat | biomass paste into ration, salami, cheese | cell, recipe disc |
| Fabricator | bars + polymer into filters, tools, parts | cell, blueprint disc |
| Charger | refills spent cells | station power |
| Digester | sludge into biomass | cell |

Three kinds of machine: **produce** (inputs to outputs), **modify** (change an item that exists: tune, temper, label,
upgrade) and **do** (scan, broadcast, vent, clear a jam). A **disc in a machine's tray sets its recipe**, so unlocking is
finding or buying a disc, which makes progression items and not menus. Statuses on machines: *Jammed* (costs energy to
clear), *Overclocked* (cheaper, risks a jam), *Hot*. Consumables: coolant, lubricant, filters.

## 6. Energy and cells (two costs, kept apart)

- **Cells** are the machines' fuel and replace coal: a thing in a slot that drains (the way a coal lump burns down) and
  can be recharged. Cell price follows the power gauge, so overhead is physical.
- **Energy** is yours: a number per day (guess 6 to 8) that refills when you sleep. Starting a machine job costs energy
  (the job is instant in game terms, with a short animation as fluff). **Overnight** is the free alternative: load the
  machine and sleep; it runs through the night, costs no energy, and holds the machine and its room until morning. Energy
  buys time: it turns "tomorrow" into "now".
- Raise the cap or refill with: a better bunk, food (eating your own stock), stimulants, an assistant, a program.
- Statuses on you: *Tired* (-1 energy), *Wired* (+1 now, a crash tomorrow).
- Customers still move the day's hours as in ECONOMY.md section 2; energy limits what you do inside it. (Name: the first
  guess was "shifts", rejected; "hands" was offered; the user chose plain *energy*.)

## 7. Mail and orders (the wired terminal's first real job)

Orders arrive as **mail**: a sender deck, what they want, the price, a due day. For example, a spine clinic wants 2 filters
and a ration for 40 by day 3. Accepting is free and so is declining; a counter-offer is a text choice that shows its gap
(the deal logic of ECONOMY.md section 4). The terminal needs power, so with no cells there is no mail and orders lapse.

Mail also carries rumors and breakdown warnings, rent and tithe notices, company memos, discs and blueprints as
attachments, and spam or bad attachments (the route for a virus into a machine, IDEAS.md). Machines have a port to the
terminal: queue overnight jobs, see all machines and the station's gauges, and, as a program on a disc, **automate** loading
and starting jobs (saving energy).

**Walk-ins and orders compete** for the same stock and the same energy: serve the person in front of you now, or fill the
big order that pays more by Friday. That tension is the point of keeping both.

**The tithe is a recurring order from the company**, with a due day, a size and a penalty. It is not free to ignore, and
how nasty the penalty is can be tuned later with no redesign. This answers the quota question for now (soft by default).

## 8. Parcels and boxes

Orders ship in boxes, and boxes are a real decision.
- **Box types are sizes**: 2x2, 3x2 and 4x4 for now. The fee per box rises with size but falls per square. An order may
  need a size, or a deadline that rules some out. Who carries them and how is outsourced: not modelled, not drawn.
- **You buy boxes ahead.** They are items with a footprint, so a stack of boxes takes room, and running out mid-order costs
  a rush. How many to hold of which kind is a stocking decision.
- **Pack and seal.** You put goods in a box, attach the order's slip (printed by the terminal), and seal it.
- **The dock is a container you open, like the customer terminal.** It is a panel beside the counters whose grid takes
  **boxes only** (a filter, like the existing container filters). That is the restriction: its size is how much can ship
  per pickup, and **the field upgrades later** (a bigger dock grid is a sink). A sealed box left anywhere else does not
  ship. It is the outflow port; ordered crates also arrive through it, or on the outside counter.
- **Pickup takes everything in the dock.** The carrier collects on a schedule and the sealed boxes leave the grid; the
  panel shows when the next pickup is, what is loaded, and what each box will pay (hover).
- **Delivery takes time.** A box has a pickup time and a transit time (guess: days, and further for some decks). Payment
  arrives **on delivery**, so cash lags what you shipped: ship Monday, paid Wednesday. An order's due day means delivered
  by, so transit is part of the deadline. A late box pays less (or nothing).
- **Standing with the carrier.** The total you spend on shipping raises a tier (a spend threshold, kept), and each tier
  gives faster pickup, shorter transit and lower fees. It is a sink that pays back, and the one standing in the game that
  is about money spent, not people (no relations with customers).

## 9. Inflow and outflow (the loop is not terminal)

| | In | Out |
|---|---|---|
| Energy | sunlight and the reactor, as cells | waste heat |
| Matter | ore and ice hauled in; crates on the dock | vented sludge; exported parcels; the company's tithe |
| People | arrivals | departures and deaths (customers who stop coming) |
| Credits | wages (issued by the owner) | rent and tithe (leave the station) |

Credits are **not conserved**, so a wage cut or a rent hike is a macro event that moves every customer's budget. Matter
loops inside (scrap, recycler, smelter, vat, fabricator, goods, wear, scrap) and only leaks at the edges, which is why the
tithe makes the loop need constant inflow. The pressure that keeps the economy moving is the owner taking his share.

## 10. The loops

- **Matter:** scrap in, recycled to materials, made into goods, sold or shipped, worn out, back to scrap.
- **Power:** cells run machines, you recharge them, the cell price follows the power gauge.
- **Need:** residents drain stocks, stocks set prices, prices pull customers toward what is scarce, your sales refill stocks.
- **Orders:** mail brings a request, stock and machines meet it, a parcel ships, pay arrives, the tithe takes its share.
- **Growth:** net buys machines, discs and programs, which widen the matter loop (ECONOMY.md section 7's sinks, each now a
  machine or a disc).

## 11. The divide, felt at a stationary stall

Each resident's deck sets their wants and budget, and the line is a mix. Spine residents ask for water, filters and rations
on thin budgets; ring residents ask for parts, comfort and luxury on fat ones. In orders, ring mail pays well and wants
luxuries and repairs on short deadlines; spine mail wants staples at thin margins, and often it is what keeps someone
alive. Selling cheap to the poor costs margin; nothing forces it. No standing or regulars (the general economy stays
primary), so this is per customer and per order.

## 12. What carries over from what exists

The grid, containers, nesting, the knife and cutting, the furnace (now the smelter; coal becomes cells), the discs and
the wired terminal (recipes, blueprints, programs), the deal and gap tooltip, the market module (needs fed by stocks), the
sim, sandwiches (vat food and made-up meals), the print bridge for slips.

## 13. Open questions, with defaults

- Is the tithe a hard deadline or soft pressure? Default: soft (a recurring order with a penalty).
- Do machines run real-time (as the furnace) or tick per customer? Default: real-time, with energy as the shortcut and
  overnight as the free way (section 6).
- Does the shipper charge you per box, or does the order's buyer pay the freight? Default: you pay.
- Is transit the same for every destination? Default: it depends on the deck, so far decks are slow (open until decks have numbers).
- Personal needs (eating, sleeping) beyond energy? Default: only eating as a way to buy energy.
- How many conserved materials? Default: about six, to keep the sim tractable. A closed loop can spiral; let a collapse be
  an event and the story and not a bug to hide.
- What do the first ten minutes look like with this setting, given the current items? Not yet drawn.

## 14. Not doing

No spoilage, no appraisal (as decided for v3). No standing or relations with customers. No travel between decks yet. Nothing
about the terminal that does not end at a counter, a machine or the money dial.
