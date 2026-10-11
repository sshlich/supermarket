# Ideas (brainstorm, 2026-09-30 / 10-01)

Where the brainstorm stands: rules that came out of it, what was liked, parked or turned down, and what to pick up next.
Nothing here is built. `DESIGN.md` stays the record of what is.

## Items: the plan (agreed 2026-10-09)

Before more items: one small loop that plays. Stuff comes in, you work it, it goes out for money, and something pushes back.
Sprites are game-icons glyphs until an item has proven itself.

- **Step A, the base (built; see `DESIGN.md`, "Properties and rules"):** properties on items (a value on the item, changed by
  machines and uses, not a different kind per state); the tooltip; one rule format for machines and uses; the clock in hours;
  tested on the cell chain (cell, cell gauge, charger rack).
- **Step B, the loop (next):** the catch (a bin that fills each morning from a table), the insect chain (food waste, insect bin
  with a cell as its heat, chirps, press, slab), a value on every item, a buyer hatch that pays at the end of the day (until
  contracts and drones replace it), credits and rent.
- **Then:** the mail view and the first drone ("Mail and drones: the first version" below).
- **Decided:** a job missing an input pauses and keeps its progress; running costs are taken every hour and the main input
  at the end; no machine settings for now (slow/fast charging waits); no wear (friction without depth); rules and properties
  are edited as JSON until the format settles; the farm and food kinds stay in the data but leave the tray.
- **Left out for now:** grades and marks, VOID, legality, brands, condition, the day/night split, metered bills. Good material
  in `SPECULATIVE/`, to add one at a time once the loop plays.

## First item batch (proposal, 2026-10-09; not built, waiting for answers)

Pulled from `SPECULATIVE/10-items-and-chains.md`, filtered by the rules: practical, interwoven, salvage at the core, no farm.
Prices are the speculative file's Mills prices, as placeholders.

```
the catch (each morning) ─┬─ food waste ──► insect bin ──► chirps ─(hand grinder)─► paste ─(press)─► slabs
                          │                  ▲  ▲   └──► frass
                          │      cell (heat) ┘  └ jerrycan (water) ◄── tap
                          ├─ ? / clipped cells ─(gauge, soldering iron)─► charger ─► cells: bin heat, or sell
                          ├─ old kettle / desk fan ─(driver kit)─► element, motor, cable ─► copper, scrap
                          └─ ballast ─► costs money to get rid of
everything ─► buyer hatch (pays at the end of the day)
```

- **Input:** the catch (3x3, fills at 08:00 from a random table; left full, it skips the next fill); food waste sack 2x2 (2);
  ballast sack 1x1 (the hatch charges 2 to take it); clipped cell 1x1 (0, 10 once re-terminated); old kettle 2x2 (1);
  desk fan 2x2 (1).
- **Cells:** soldering iron 1x3 (25): re-terminates a clipped cell in an hour. A cell's value follows its charge (1 to 3).
- **Salvage:** driver kit 1x2 (8): strips an appliance in an hour. Heating element 1x2 (2), small motor 1x1 (3), cable coil
  1x1 (4; strips to copper), copper bundle 1x1 (3), scrap sack 2x2 (1).
- **Protein:** insect bin 3x3 (colony + feed + water + a cell for heat → chirps, plus frass); chirp colony 1x2 (15, stays in
  the bin); chirps tub 2x2 (6); hand grinder 2x2 (30; a tool, chirps → paste, costs your hour); paste tub 2x2 (4); press 3x3
  (paste → 4 slabs in 2 hours); slab 1x1 (2); frass sack 2x2 (2).
- **Water and selling:** tap 2x2 (fills its vessel 1 L an hour and counts the litres); jerrycan 2x2 (10 L, 6); buyer hatch
  3x3 (what is in it at the end of the day is sold for its value).

Engine additions it needs: `value` on kinds (can follow a property); a rule that runs at a given hour and fills from a
weighted random table (the catch); a yes/no property shown as a mark (`clipped`, a small stand-in for VOID); water counted at
the tap like power; the hatch and a credits counter (step B).

Later batches, as options: fat and light (render pot, chirp fat, candle mould, tallow candles, strip lights from dead lamp
bars); the grow bed (seed, greens, tomatoes; uses the frass; needs plants that grow inside the bed's slot); store goods
(Vitabrick, Halden Pure, gut tabs, kof), only once contracts ask for them.

Open questions:
1. Scope: this batch as listed, or swap something in from the later ones?
2. Clipped cell as a yes/no property with a mark?
3. The grinder as a hand tool that costs your hour (proposed), or a powered machine?
4. Stripping: fixed yields (proposed for now), or a chance (some motors are dead)?
5. Build the hatch with this batch, so things can be traded?

## Rules for new systems (from the discussion)

- **No proximity rules outside machines and special containers.** Nothing happens because two things sit near each other on the
  field. Heat, cold, ageing, growth, rot all live in a machine's slots or a special container (cellar, salt box, coop...).
- **Width is good when it interweaves** (was "deep, not wide"; changed 2026-10-01). Every system has to touch others and give
  a real benefit for engaging with it; a new thing comes from one system and feeds another. Long chains of new items that
  touch nothing else are still out.
- **No DIY crafting trees** (build the machines from crafted parts). Leftovers pile up and play ends once everything is made.
  It stays one possible angle, on hold.
- **Realism.** "A lamp next to a plant makes it grow" was rejected as unrealistic.
- **No tedium.** Hidden or untrackable complexity (genetics you cannot see or steer) is tedium. Spoilage only if it has a
  purpose (salt it, or use it for something else before it is useless).
- **Time:** a step currently means a day (not intended, but that is how it plays). Things that take days fit (ageing,
  steeping, curing, growing, hatching). Things that take minutes (a still's cuts) would need a real-time clock and an
  animation so that pressing the time button feels tactile. Proposed 2026-10-01: **hours**. A day is a run of hour steps
  that move machines, shelves and deliveries; the night is measured in light and stamina, not steps.

## Mail and drones: the first version (agreed 2026-10-11)

The setting is paused ("let's focus on concrete stuff"). These are the two systems with no world attached: mail is where work
comes from, drones are how it gets done. Placeholder numbers; the fuller versions are in "Drones as the core" below.

**Decided:**
- **The terminal is a separate view:** its own menu or screen beside the board, not an item on the board. (This replaces the
  Wire's "machine on the board with a printer tray and chip slots" below.)
- **A drone that is out is a timer** for now. A map where you watch it fly comes later.
- **One slip per trip** for now; several slips in one drone later.
- **The slip stays a physical 1x1 item** on the board, so the job lives where you pack it. Considered and dropped the same
  day: no slips, with the job picked on the drone's panel.
- **A printed slip lands on the first free squares** of the board.

**Mail:**
- A message has a sender, a type, text and an expiry in hours. A job also has terms: what, where, by when, and the pay.
- Types: **offer** (a job for pay), **order** (someone wants to buy something you have), **bill** (rent, due on a day),
  **notice** (information, no action).
- Accept, decline, or let it expire. Accepting a job prints its slip onto the board.
- New messages come with the clock: a batch each morning, a few during the day, drawn from tables. More than you can take,
  on purpose.
- Tools, in the order they are needed: sort (pay, deadline, distance); filter (type, sender); mark and archive. Later: a "can
  I do this" column worked out from your drones and stock, and inbox rules.
- An address is a name and a distance for now.
- The view can also list the drones that are out, with the hours left, since the timer has to show somewhere.

**Drones:**
- A drone is a container kind with a cargo slot and a cell slot. Stats: capacity (the cargo slot's size), range, speed.
- The **launch pad** is a machine. Put the slip and the goods in the cargo, the drone on the pad, launch. It leaves the board
  for distance / speed hours. On landing the job is checked: the right goods on time are paid (credits, or items left in the
  cargo); wrong or late is not paid.
- Distance costs charge from the cell, which ties drones to the cell chain.
- Jobs: **deliver** (take goods out), **fetch** (bring goods back); then **scavenge** (go to a place, come back with random
  finds: the fishing drone).
- Later: the frame as a grid of parts, program cards, other chassis.

**Build order:**
1. The terminal view: an inbox with offers, bills and notices; accepting prints a slip.
2. One drone kind with fixed stats, one launch pad, the timer.
3. Credits; pay on return; rent as a bill.
4. Sort and filter; then the frame grid.

**Open:** none yet.

**Floating windows (the user's idea; settled 2026-10-11).** Slips and other notes open as papers floating over the
view, not as docked panels. A paper has no grid and no docking, and is dragged by its edge. Its controls:
- **Close (x).** The paper closes; the slip item stays where it is on the board.
- **Pin.** The paper stays open and on top when you switch views. Unpinned papers belong to the view that opened them.
- **Fold.** The paper collapses to its top line ("Dock 4 · cells 2/4 · due 14:00"), which is
  what you want to see while packing. Folded papers stack along the edge like tabs.

What opens one:
- Double-click a slip on the board. The paper is a view of the item, not a second thing.
- From the terminal, pull out a message (a bill, a notice, a long offer) as a paper to keep in view. These are only papers,
  not items, because nothing packs them.

What an open slip paper does:
- It shows the terms and a live count of the goods packed with it.
- Hovering it lights up the matching goods on the board.
- After launch it shows the drone's countdown ("back 14:00"). On landing it is stamped paid or refused.

The material shows the type: a job slip is card with a punched hole, a bill a carbon copy with a stamped due date, a notice a
thin printed sheet, a flight log a thermal strip that curls. Later, your own note is a torn scrap you write on.

Also settled: container panels stay docked (grids need room and line up with the board); no cap on open papers (folding
handles it); pinned papers keep their place in a save.

## Drones and contracts (the user's idea, 2026-10-07; liked, the current direction)

Orders are contracts, and you fulfil them by sending drones. A drone is a container: you pack it with the goods and launch it;
it is gone for some hours and comes back with the pay and a reward in its bay (something to upgrade, to buy, or late on to
fit yourself). Night trips and hunting are parked; this is the loop for now.

Why it fits:
- Packing becomes the core action. Space is the constraint everywhere, and fitting a whole contract into one bay is a new
  puzzle each time, played with the handling already built.
- It answers the worry about a forced daily customer routine: you choose which contracts to take, and the hours fill with
  making, packing and launching. It is also the delivery layer `inventory-manager` never had, and it replaces the shipping route.
- Progression stays about space: bigger bays, odd-shaped bays, cold or sealed bays, more range.
- The return trip carries the reward, so unpacking it is a small mystery box played with the same handling.
- Tension to settle: machines are bought, never built (rule above). "Make your own drone late in the game" should mean fitting
  salvaged or bought parts to a frame, not a crafting tree.

How it could be built in the current code (proposal, nothing built):
- **Drone:** a kind with a cargo slot (like the knapsack), and stats in `kinds.json`: range, speed, special bays (cold, sealed).
- **Contract:** a physical manifest slip. Packing the slip into the drone assigns the contract, so no extra screen is needed.
  It lists the goods wanted (kind or tag, count, maybe quality), destination and distance, deadline in hours, pay and reward.
- **Launch pad:** a machine in `advance()`. A launched drone leaves the field for distance / speed hours; on landing the game
  checks the cargo against the slip, pays, removes what was delivered, puts the reward in the bay and returns the drone.
- **Contract board:** a few slips each morning; you pick which to take.
- Later, if more pressure is wanted: weight, partial deliveries, lost or looted drones.
- `world.test.ts` covers the delivery check, like the sheath and pocket.

Setting (2026-10-07): drones do not force a change, but the user now leans to a **vertical slum**: gritty and bad, not an
arcology (an arcology sounds utopian, people caring about ecology). Wanted: show dystopian capitalism, inequality, the divide.
Ideas for showing it through mechanics, not only flavour (proposed, not judged):
- **Height is class.** The tower (working name: the Stack) has floors; the higher, the richer. Contracts going up pay more but
  need clearance: a licence, a permit, a better drone. Going down pays little and risks tolls, jamming or looting.
- **Everything is metered:** water, air, power, light. The water-from-air machine is a lower-floor necessity; upper floors
  get rain collectors and real daylight. Rent is charged per square of your floor, so space, the game's constraint, is
  literally what you pay for.
- **The same order, two worlds.** Upper floors order real things (fresh fruit, real wood, natural fibre); lower floors order
  water filters, medicine, protein blocks, spare parts. Same kinds in "real" and "synthetic" grades. Who you serve is your call.
- **Trash flows down.** Your raw material is what the floors above throw away: garbage chutes and scrap are the suppliers. The
  poor live off the rich's waste, and the production chains start there.
- **Company money:** wages in tower scrip, spendable only at company stores; buying your shop is a loan with interest;
  a credit rating gates which contracts you see.
- **Rent climbs** as the upper floors expand downward (gentrification): the pressure that keeps the loop moving.
- **Airspace is owned:** licensed lanes up top, tolled or contested shafts below; drone routes as a vertical map of the divide.
- Looks: contract slips styled by origin (embossed card from above, crumpled print from below); the field's backdrop shows
  your floor; light gets better as you rise.

Food, and how the divide works as mechanics (2026-10-07; the user: no forests or foraging in a tower, fresh food is only
grown, with precious water; protein blocks are ground insects and food waste from the upper floors):
- **Real food (sells up):** a grow bed is a machine. Seed in, water drawn every hour (ml from the vessel in its slot), the
  plant grows and its footprint grows inside the bed (shoving the others in the slot); harvest gives real produce. Costs water
  and time, pays well up top.
- **Synthetic food (sells down):** food waste into an insect bin (a machine: needs warmth and a little water, grows insects over
  hours), a grinder makes paste, a press makes protein blocks. Cheap, bulk.
- **Rent per square:** the field is no longer a fixed 25x20. You rent a block of squares at a rate per square, due every N
  days; renting more rows means more room and a bigger bill. The game's constraint becomes the thing you pay for.
  *Decided 2026-10-10 (the user): rent is a fixed number that increases each month, not a sum worked out per square. Rows can still
  add a flat step to the number. See `LORE.md`, "Money", and `SPECULATIVE/04-economy.md` section 3.*
- **Rent climbs:** the rate rises on a schedule, faster near the rich floors (they expand downward). Moving down is the way
  out: cheaper rent, worse trash, worse routes.
- **Trash flows down:** a garbage chute is a special container on your field that fills every morning from a table set by who
  lives above you (better floors throw out better things). Left full, it stops filling: you pay in space or lose supply.
  Sorting it is a packing job, and it feeds the insect bin and the salvage chains.
- **Metering:** water and power (maybe air) come from the tower through a tap and a socket, machines on your field; every ml
  or unit drawn goes on your bill. Your own air-well and charged cells run free but take squares, which cost rent. Always
  pay the tower or spend space. Grow beds and insect bins draw every hour, so production has a running cost.
- **Grades:** an item can carry a grade (real or synthetic) that changes its value. Contracts name the grade they accept:
  upper floors real only, lower floors either but pay little. Shown on the item as a mark (see the effects idea).
- **Height is class:** each contract has a destination floor. The floor difference sets flight time; pay rises with height,
  and so do the requirements: a drone needs enough clearance, or a permit packed in its bay, past a given floor.
- **Routes:** at launch, a licensed lane (costs a fee or a permit, safe) or a free shaft (costs nothing, rolls for trouble on
  landing: a toll off the pay, or one item from the bay lost to looters). Packing decides what is worth risking.
- **Company money:** credits (a plain number) and scrip (some contracts pay in it; it only spends at the company store, which
  sells drones, machines and parts). Buying the shop is a loan with daily interest. A credit rating, one number, rises with
  on-time deliveries and falls with late ones or missed rent; each contract on the board has a minimum rating.
- **Looks follow the data:** a slip's style from its origin floor, the field's backdrop and light from your floor.
- Smallest version that shows the divide: rent per square, the garbage chute, the two food chains, and contracts with a
  destination floor.

## Drones as the core (proposal, 2026-10-11; the user: "it's good, at least for the ideas")

*Written while the setting was still the tower: the mechanics stand; the places (shafts, lanes, the Spill, the Flats, the
Dark Floors) change with the setting below.*

Make the drone the main object you work on, and let the rest feed it. Every new system below is the same verb the game
already has: put things on a grid of squares and let rules read the grid (the board, a drone frame, a robot chassis, a
part's ports and cables, a card strip, a terminal's chip slots). Placeholder numbers throughout.

### The loop: fit, pack, route, fly, unpack

- **Fit.** A drone is a frame: a container with rotor sockets (arms, outside the grid) and one grid. Controller, cells,
  transponder, sensors and inserts are items in that grid; what is left is the bay. More cells, more range, less cargo.
- **Pack.** The contract slip (1x1 paper) is the address: no slip, no launch. Permits, route cards, insurance notes and
  faction tokens take squares too. Bay rules (a bay is a special container, so they are allowed): liquids ride upright,
  fragile things want an empty or padded neighbour, tollers take what sits nearest the **hatch edge**.
- **Route.** Lane (transponder and a permit or a ticket; safe, logged, recallable), free shaft (pick a riser, each with its
  own trouble table), lift freight (a chit; slow, insured), the outside face (weather). Hours, cost and odds shown before launch.
- **Fly.** The drone leaves the board; a **sky strip** beside the board shows it climb hour by hour. Charge drains each hour;
  several drones in the air turn the day into a schedule (this fills the idle hours file 10's worked day found). Events only
  blink on the strip; the details wait for the log.
- **Unpack.** The bay comes back as a panel: pay, a reward from the destination's table, back-haul, what went wrong (a missing
  item, wet goods, a cracked rotor), and the **flight log** (1x1 paper). Full, partial, late or failed; a lost drone opens a
  recovery contract.

### The Wire: making and viewing deals

The deals interface is an in-world network on a terminal (a machine on the board with a printer tray and chip slots) or a
slate. It is the one big screen that is not a grid, and it should feel like a dirty old terminal.

- **Layers:** Ledger Mail (the Company: licensed offers, bills, notices; logged and read), the Underwire (grey, anonymous,
  scams and stings; costs chits), Nine (the rats' radio; only near a hatch or a relay), Static (pirate broadcast feed), boards
  (floors, the Co-op, the Drop). Signal is geography: strong above 30, patchy in the Mills, dead in the Sump unless you place
  relays.
- **Message types:** offers, standing orders, subcontracts, auctions, board posts, personal mail, notices and bills, flight
  logs (auto-filed), feeds, spam, scams, stings.
- **Deals:** accept (the slip prints at the terminal: deals are made in the Wire and fulfilled on the grid), counter (a few
  moves: +20%, an advance, a later deadline, another route; clients answer by personality), subcontract to a rat, post your
  own offers, bid in auctions, arbitrage between floors.
- **Populating it:** a roster of senders (floor, faction, voice, needs table, reliability, a relationship meter; 06a, 06b
  and 11 already hold about 60 named people), templates filled from needs and world events (fever season, the Chalk moving, a
  storm), threads that reply and follow up, noise that grows with your reputation, a look per origin (crested and formal from
  the Crown, all caps from Nine, voice-transcribed from the Sump).
- **Taming the chaos, as progression:** folders, sort, search, pin; a **FIT** column computed from your fleet (can do / can do
  if refitted / cannot); views (offers on the tower strip by floor, accepted jobs and flights on a timeline, threads);
  **inbox rules written as the same cards drones use** (`IF type = log` → folder; `IF grey AND unknown` → Spam?); **chips**
  (sorter, spam, auto-reply, decrypt) in the terminal's slots; a hired **Pinner** who triages by hand; reading costs a little
  of the day. Early you read everything; mid game you drown; late game your rules and chips run the inbox.

### Drone depth

- **Frame grid:** typed squares: **core** (the controller goes here), **hatch edge**, **bottom row** (nets and water reach it
  first); rotor sockets on arms; the controller has a fixed number of **ports**.
- **Parts:** rotor (grey 1.2 kg thrust, licensed 1.5, founding-era 1.8), controller (program slots, ports, stops, nav, packing
  smarts), cell, transponder, rangefinder (riser nav), camera (reads kind and tag), gauge sensor (reads hidden properties),
  grab arm (1x2, finds 2x2 and up), winch and magnet (2x1, fishing), cold liner, crash foam, plating, relay, cable segments.
- **Stats, all derived:** mass (needs a `kg` on kinds: slab 0.3, cell 0.5, paste tub 1.2, full jerrycan 10.5); thrust;
  **lift margin** = thrust / mass (under 1.25 will not launch; 1.25 to 1.5 sluggish); drain = 4 + 1.5 × mass an hour (a cell is
  100); range = charge / drain; speed by frame, margin and route; stability; profile (how often looters and spotters notice).
- **Balance:** a centre-of-mass dot against the frame's centre; off-centre costs drain and stability, far off-centre will not
  launch or tips the hatch-edge item out. Heavy in the middle, slips at the edges.
- **Ports and cables:** a sensor needs a port; adjacent connects, otherwise lay cable segments (each takes a square). Signal
  weakens per segment and per join (a weak camera misreads tags); motors next to a cable add noise (the one proximity rule,
  inside a frame); amplifiers and shielding are parts.
- **Damage by side:** nets hit the bottom row, wall scrapes a side column, tollers the hatch edge, drips the top row, hard
  landings everything except what sits beside foam. Plating soaks a side. Damaged parts work worse until swapped at the bench
  (salvage feeds it). No passive wear, per the rule above.
- **Provenance:** licensed (known stats, retires on a date, needed for lanes), grey (cheap, loud, cannot arm a transponder),
  founding-era (better, with **hidden traits** shown as `?`, revealed by a gauge, a test stand or an Old Hand).
- **Frames as roles:** hopper 2x2, Wren 4x3, Kestrel 5x4, Ell (L), Strut-through (a dead column), Bucket (liquids need no
  upright rule), Capsule (sealed), Heron 6x5 (cold, heavy), rat frames (random grey shapes).

### Programs: cards on a strip

- The controller has a strip of card slots (5 on a Wren). Cards are items; the strip runs left to right.
  `[GO: the Spill] [KEEP: cell] [KEEP: metal] [UNTIL: full or charge 30] [HOME]` is a fishing drone.
- **Cards:** GO, SEARCH (one find an hour from the site's table, like the catch), FISH, KEEP and SKIP (a kind, a tag, or a
  hidden value if a sensor can read it; a KEEP card is the rule matcher's `Match`), UNTIL (full, charge, hour, found), DROP
  (multi-stop), WAIT, HOME, IF tolled: HOME. Later: IF, ELSE, LOOP, counters, sensor inputs; a **card punch** sets numbers and
  copies strips; **chips** burn a whole strip into one tradeable item.
- **The drone packs dumbly:** first free spot, no turning; a better controller packs tighter. You repack on return.
- **The flight log is the debugger:** every find, what was kept, what was skipped and why, when it turned home.
- **Sites:** the Spill and the Bale Hall, the Hooks' drops (a fee per item), riser ledges (downed drones), the Flats at low
  tide (fishing, tide hours), the drowned floors (sealed frames), the Hulk (late).
- **Routines:** a hawker hopper that sells breakfast at the Whistle, milk runs between neighbours' hatches, standing orders
  launched on their own.

### The chassis family

One idea, several bodies: a grid with sockets and ports.

| Chassis | Moves | Reaches | Good at | Bad at |
|---|---|---|---|---|
| Drone | air | shafts, lanes, outside | fast, vertical | mass, noise |
| Roach | legs or tracks | vents, crawlspaces, pipes | heavy loads, quiet, opens hatches | slow, no shafts |
| Rail crawler | lift guide rails | between floors | quiet, cheap | the Guild owns the rails |
| Swimmer | tethered, sealed | the drowned floors, the Flats | where nothing else goes | slow, tether length |
| Arm | none | your board | moves items between machines on a program | its reach |

- **Signal:** three ways to talk to a machine. **Program** (cards; works anywhere), **tether** (a cable on a reel: live control
  each hour within its length; snags), **relay** (boxes on hatches make a mesh you build and maintain; they draw power and get
  stolen). Signal strength exists inside a chassis (cables) and across the tower (relay hops).
- **Assembly, not crafting** (the rules above stand): chassis + parts + cables + cards, at the **bench**; a **test stand** shows
  live stats and reveals hidden traits. Production chains supply parts and cargo.
- The roach answers file 14's "seeing inside the Dark Floors, never on foot": a roach with a relay goes in; you read its log.
- **Robot battles (optional, last):** machine against machine on programs, auto-resolved (Gladiabots-like). The Pit in the
  Sump as gambling, the Pleasure Pier's duels, looters' hunter drones in the shafts. The canon brief has combat out of scope,
  so this is the designer's call.

### What changes, and what stays

- The player becomes a mover more than a merchant: reads the world through the Wire, makes deals, builds the means, moves
  things, learns from logs, automates what is solved, builds relays. The board stays the home (hangar and workshop), rent
  still pushes, the catch, salvage and insect chains supply cargo and parts, the counter is optional.
- Grades, VOID and brands return later as **cargo properties** that routes and clients read.

### Build order (each step playable)

1. The Wire, minimal (offers; accept prints a slip; FIT) + one drone, one pad, one route.
2. Drone depth: mass, thrust, range, balance, rotor sockets, three frames.
3. Routes and events; damage by side; repair at the bench.
4. Cards: GO, SEARCH, KEEP, UNTIL, HOME; one scavenging site; flight logs.
5. Wire tools: views, inbox rules as cards, the first chip.
6. Ports and cables inside frames; signal strength; sensors.
7. The roach; tethers and relays; the Dark Floors.
8. The Pit, optional.

Open: how much of the shop survives; whether the counter stays; how fast the layers arrive; whether battles belong at all.

## Setting pitch: the Grounding (2026-10-11, rejected)

Rejected by the user the same day: the storms copied Fulgora; a company would recall a fleet to its depots before switching
it off, not let it fall; and "the Dark Floors still build drones for a network that never answers" made no sense (a factory
needs orders, inputs and power, and nobody pays for output that goes nowhere). Also decided: **drop the tower**, **no storms**.

## Setting pitch: the Lockout (2026-10-11, rejected)

Rejected by the user the same day, and so was a broad brainstorm of other settings that followed. Setting work is paused;
see "Mail and drones: the first version".

A civilisation built on the remnants of the previous one. Each link has to hold on its own:

- **The machines were rented, not owned.** The old economy ran on fleets: delivery drones, warehouse crawlers, farm machines,
  security units, cars. Almost all of it was leased and checked its licence with its owner's servers every few days (the old
  lore's Retirement Signal, made universal).
- **The owners failed slowly.** A long collapse: defaults, mergers, services cut, regions written off. Winding down a region,
  an operator does what any operator does: **recalls the fleet to its depots** and parks it. Then the servers went dark.
- **The Lockout.** At its next licence check every parked machine locked itself. Nothing was broken. Depots, warehouses,
  car parks and farms are full of intact machines that will not start. Homes too: locked appliances, locked doors.
- **Nobody can make new ones.** Chips and cells needed fabs and a world-wide supply chain; that went with the old economy.
  The old stock is the only stock. Repair and cannibalise, like the old lore's founding-era parts, but for everything.
- **So the new civilisation is crackers and fitters.** Local controllers are simple boards built from salvaged simple chips,
  programmed with physical card strips because there is no cloud and no app store. Cracking an original controller (better,
  but locked) is slow and skilled. Fitting old frames with local parts is everyday work.
- **Drones carry things because the ground is bad.** Roads and bridges went unmaintained, fuel went with the supply chains,
  electricity is local (salvaged panels and cells). Drones need no road and no fuel. Heavy things go by crawler or cart.
- **The network is a mesh of salvaged radios.** The old internet is gone; settlements run store-and-forward relays: text only,
  low bandwidth, delayed by hops. That is why the deals interface is mail (the Wire), and why signal strength is real:
  relays you place, relays you lose.
- **The divide: the Keyholders.** Whoever ended up with the licence keys (bought in the bankruptcy sales, or seized with a
  working licence server) can unlock machines legally, and sells unlocks, re-licences and network access. They call cracking
  theft and hunt crackers. The IP outlived the companies, so the rent-seeking did too.
- **Home is a dead fulfilment depot.** A huge warehouse turned town: people live in the racks, trade on the dock floor, work
  in the old charging bays; the original fleet sits locked in sealed bays nobody has cracked. The player rents a bay on the
  floor (the board, 25 x 20), rent fixed and rising monthly, from whoever holds the depot.
- **Places to go:** other depots and towns, a data centre (cold, sealed, chips), a port of container stacks, solar farms,
  dead suburbs, highways and car parks of locked cars, farms with locked harvesters, a Keyholder enclave.
- **Carries over** from `SPECULATIVE/`: Halden (as one of the dead fleet owners), the Retirement Signal and VOID (now
  central), the rats' courier culture, the Old Hands (now the people who remember how the old machines worked), the Co-op,
  insect protein, rent, scrip, the Wire. **Does not:** the tower, its floors and shafts, the drowned city, the Dark Floors.
- Open: what ended the old economy (a slow collapse is the default; a war or a deliberate exit are options); how long ago (a
  generation, so some people remember); what the depot town is called.

## Shop and expeditions (the user's pitch, 2026-10-01; in discussion)

Drawn from Probably Stolen's loop (the shopkeeper game the handling reference comes from), to iterate on, not to copy.

- **Expeditions** (liked from the day-scale set): go somewhere; the gear you carry decides what can happen; several rolls of
  random encounters; you can find things. A mountain: wander long enough and you find a collapsed entrance; work it with the
  pickaxe three times and it opens, with more encounters inside. Battle encounters could come later; out of scope now.
- **The shop:** zones customers use: an outside and an inside counter (sell, buy arriving goods, put things down for a deal,
  maybe other interactions) and a show window (its own container).
- **Customers** arrive each day in a random number, set by the day's events, the shop's reputation/popularity, and what is in
  the show window.
- **Goal:** pay the rent, eventually buy the shop. Later maybe buy other shops with different benefits, clients and amenities
  (leans incremental; a point for later).
- **Money:** buy from suppliers (scavengers, thieves...), sell to consumers (average joes, workers, security, nobles...) at a
  markup. Prices move with events (water or food shortage).
- **Machines** are bought only from special vendors; you never build them.
- **Night expeditions,** after the last customer and closing; three kinds. On each you see your inventory: a back slot (flex:
  any container that can go on a back; backpacks come in tiers) and a flex slot per hand (for what does not fit the
  backpack). Every expedition screen has a ground container (a vendor has two counters instead, buy and sell).
  - **Commissary:** buy with commissary-ticket points; redeem lottery.
  - **Junkyard:** a ground field and a Scavenge button, N times; each is a loot-table roll: junk (smelts into low-quality
    ingots), microschemes (material to upgrade some devices), modules (their own mechanic: change machines' stats), backpacks...
    On top: a **Walk** that fills the ground with random items and materials, and tools from the backpack gather or change
    them, up to hunting (a boar, with a gun or a spear). Equipment and carried things modify the rolls; potions used out there
    change rolls or give more; rolls could be stamina (another layer; character stats and equipment beyond that).
  - **Dr. Jackson:** sells modules, machines, gadgets, batteries; buys materials such as ingots.
- **Worry:** a forced customer loop every day is repetitive, if somewhat meditative. Is there a better way?

The pitch is a baseline to condense, not a build list. Where it stands after the first round:
- **Out:** modules (machines simply differ in stats instead) and microschemes. Junkyard specifics: still cooking, not copied yet.
- **Hands** are two flex slots; a bulky thing (a bought machine, a big tool) takes one whole hand.
- **Tools work from wherever you carry them** (needing one in hand is fiddly). The limit is backpack room, so bulky tools ride
  in hands. Worn gear can add tagged slots: a belt or sheath with a knife slot (bought from a leatherworker).
- **Gear** decides which encounters are possible and tilts the ground rolls toward them.
- **Go deeper:** better tables (minerals, ore), a chance of monsters.
- **Lantern:** lit, better finds; when it goes out, monsters and mobs come. Hunting is done without one.
- **The ground is lost when you leave,** unless something is meant to stay overnight (traps).
- **Stamina** is a character stat (there may be others); food and potions modify stats. A separate discussion.
- **Customers:** no fixed counter routine. Shelves you stock sell on their own; restock mid-day when something sells out;
  shelf space to upgrade; ads and promotions raise appeal; serving at the counter stays a free choice; shipping packages is a
  route alongside. The danger is a day with nothing to do, hence hours (see Time above).
- **Dropped:** a guard spotting stolen goods at the counter (that is Probably Stolen's heat and inspection system; see
  `research/probably-stolen`). Handling (relaxed as in the Bazaar, strict as in Probably Stolen) and pouring are universal.

Condensed:
1. Space is the constraint everywhere; each half has its own clock (day: hours; night: light and stamina). Most progression
   is more or better space: shelves, backpack tiers, belt slots, a bigger shop.
2. By day the shop sells in the background and the workshop is the foreground. The counter is a choice, never a duty. Each
   hour should offer something worth doing, or let you skip to the next thing that does.
3. Three ways to sell, each paid with a different resource: shelves cost space, the counter costs your hours, shipping costs
   packing and lead time. So they coexist as styles; none is the solved best.
4. Shop furniture is containers (shelf, glass case, cold case, bargain bin): special containers with their own rules. Upgrading
   the shop is buying and arranging them.
5. The night is push-your-luck and your pack is its build: gear opens encounters, light is the fuse, deeper is richer and
   worse. (Darkest Dungeon's torch is the reverse, darker is richer; here you find more when you can see, and the dark is
   for hunting.)
6. Machines are relics, not recipes: bought, each one different (speed, capacity, fuel, quality), the depth in their
   interfaces (a setting you choose, e.g. the still's heat: faster or finer). Hours make the parked still work: swap the
   receiving bottle at the right hour.
7. Everything comes from one half and feeds the other. A boar from the dark is butchered, smoked and shelved; its hide goes to
   the leatherworker and comes back as a sheath (a knife slot). Cheese from the shop baits an overnight trap.

Setting (proposal, being argued):
- The user leans to a ruined techno world (Caves of Qud's traders), but an organised society (rent, nobles, security, a
  commissary) is hard to picture in one. Medieval lacks exciting machines; techno uses more of the sprites, and machine
  interfaces are the exciting part; generic things (crates, chests) fit anywhere.
- **A rush town over a buried machine city.** Ruin one place, not the world. An old city is uncovered; a boom town grows at its
  rim within a year (a company on the main shafts, prospectors, tinkers who wake relics, merchants). You sell the shovels and
  dig a little at night. Boom towns organise fast (Dawson City in the Klondike; company towns paying in scrip at the company
  store = the commissary and its tickets).
- Every rule gets a reason: rent (gouged lots; own yours), nobles (claim barons, buyers from the old cities), security (company
  guards, the marshal), workers (diggers), suppliers (independents, night diggers), machines bought not built (relics nobody
  can make; each an original, so stats differ), night (the company works the shafts by day), deeper (older layers), shortages
  (the rush outgrows the road), shipping (relics pay best in the old cities), rustic items (the frontier town's daily life;
  the tech comes out of the ground).
- The rush is the structure. Nearest existing: Moonlighter (merchant village by dungeon gates), SteamWorld Dig (western mining
  town over ancient tech), so no cowboy look.
- 2026-10-02: liked ("not bad"). **Look:** keep the current one; practical, just enough to get the message across.
- **Worry: it all turns on digging; where is the variety?** Digging is why the town exists, not what everyone does:
  - Below is a city, not a mine: districts are different nights with their own goods, dangers and buyers (homes: tableware,
    clocks; a hospital: instruments, medicine; the works: machines, ore; an archive: records, maps; gardens gone wild: seeds,
    plants, animals; a drowned quarter: bail it out, fish in it).
  - Not every night goes down: the wilds (hunting, foraging, the river), the road (a caravan), your traps.
  - A boom town is full of trades: cooks, launderers, saloon keepers, freighters, surveyors, collectors from the old cities,
    doctors, preachers, con men, families. Each wants different things.
  - The rush has an arc: tents and shortages, then the boom (company money, luxury), then it settles (families, everyday
    needs) or busts (the upper layers run dry). Mine trouble (cave-ins, floods, bad air) varies the days.
- **Name** for what is buried (what it is stays open): **Godsink** (favourite; shaft diggers really are "sinkers"), the Hum,
  Gravewell, Mainspring, Old Thunder.

Day and night (2026-10-02):
- **12 hour steps** a day (8 to 20), with a skip to the next thing that needs you. Agreed.
- The user's point: machines then split into what they do by day and by night, with outcomes of different value.
  - By day machines are attended: fast, skilled work done by hand, hour by hour (the still's cuts, smelting, cooking); better output.
  - At night they run unattended while you are out; the house's night passes in one block. Slow, patient processes belong
    there (dough proving, mash fermenting, curing, smoking, ageing, charging, a banked fire burning down to embers). Some
    machines will not run alone (a still is a fire risk); others do bulk-grade work.
  - So goods get tiers: tended work is fine (nobles), overnight batches are bulk (workers).
  - The evening is the hinge: two packing jobs, the kit for the night out and the house for the night in.

Asks to be added (proposed 2026-10-02, not judged):
1. **Light is a product.** Boar fat rendered in the hearth into tallow: candles and lamp oil. It is the next night's fuse and a
   staple every digger buys (miners bought their own candles).
2. **Wounds take space.** A monster puts a wound item in your kit (a 2x1 gash in the pack, a sprained wrist blocking a hand);
   it pushes loot out; a bandage or salve used on it shrinks it (honey is a real antiseptic). Risk in the same currency as
   the reward, no battle system.
3. **Your claim.** A claim deed makes one place below yours: its ground and traps persist, shoring timber (a hand per beam)
   lets you go deeper there safely, a lamp post holds the dark back; claim jumpers when you are away.
4. **The counter is where you hear things.** Shelves pay in money, the counter in information: rumours, a hand-drawn map, a
   commission. A map in the pack is gear that tilts the night's rolls toward its landmark.
5. **Tables in the world:** a price board at the company office, your ledger (what sold, at what hour, to whom).
6. **Hirelings as plans** (the user: "hirelings are just plans"). Pack their kit (their own back and two hands) and give a
   plan: where, how deep, when to turn back (lamp at half, first wound), what to keep (value per square, or tags). Same rolls
   as yours, but they choose by the plan, so they are worse at greed. They go when you cannot (by day while you keep shop, or
   to a second place at night): the scaling layer. They return with their kit packed and a **left-behind list** ("brass
   clock: no room"), which teaches you to pack for them. A map from the counter steers them too; wounds come back in their
   kit; they eat from your stock and want wages. Picking = `pack()` over the ground in the plan's order.
7. **The analyser** (the user: hidden features are "just another instrument"). A machine with a slot: a relic goes in and its
   hidden features are revealed one at a time over hours (charges left, what it is tuned for, a defect, a maker's mark).
   Unknown features show as "?" on the item: hidden, but visible and steerable. Analysers differ like any machine, including
   in what they can reveal (scale: metal and weight; lens: marks; test bench: function). Analysed sells at full price,
   blind at a discount; a relic machine's own stats can be hidden too (a night digger's unanalysed still is a cheap gamble).
   A quick scan by day, a deep scan overnight.
- Calibration: a mechanic is not a copy; only a specific build and presentation would be (the user, 2026-10-02).
- **Name:** Godsink stays. The diggers are not "sinkers": one T away from "stinkers". They stay diggers.

## Liked

- **Ageing that only gains value** (cheese). No peak and decline.
  - Ages only in a **cellar** (special container with rack slots). Value rises, slower over time, never falls.
  - The tension is space: every wheel held is a slot not producing. Sell now or keep holding.
  - Optional: an aged wheel loses moisture and **shrinks** (3x3 -> 2x2), giving room back.
  - Turning the wheel over (the upside-down `rot`) as a rind-quality bonus, never a punishment.
- **Chicken coop as a machine.** Slots: hens, feed (grain), nest (output). A hen eats one grain every N ticks and lays an egg;
  no feed, no eggs; a full nest waits. **Incubator** as a second machine: fertile egg + warmth over days -> chick -> hen.
  Keep it simple: **breeds with fixed, visible traits** (lays often/small, rarely/big...) rather than genetics; or at most one
  visible inherited trait (shell colour on the sprite) that orders can ask for.
- **Plants in a bed or pot (a machine)**, realistic: seed + water (poured in) + time, maybe a fertiliser bag. A growing plant's
  bigger footprint **shoves its neighbours inside the bed's slot** (the shove rule, kept inside the machine).

## Latest pitches (after going through the game-icons set visually)

The set is full of one object in several states: empty/full buckets (wood and metal), unlit/lit candelabra, hourglass/empty,
ice cube/melting, padlock/open, box/closed, glass/cracked/broken, bread/sliced/slice, sausage/sliced, orange/slice,
lemon/cut, banana/peeled/peel, apple -> core -> seeds (+ maggot), log -> axe-in-log -> half-log -> stick-splitting -> wood-stick,
match -> small fire -> campfire -> fire -> embers. Depth from **states of one item, changed by handling**, not more items.

1. **Cutting and portioning** (strongest). The knife cuts things into real pieces on the grid.
   - A **cheese wheel** (3x3) ages in the cellar; **cut a wedge** to sell now and the wheel becomes an **irregular L footprint**
     that keeps ageing (the irregular-shape code as gameplay).
   - A **loaf** (4x2) -> 1x2 slices; a sausage -> rounds. Pieces pack more flexibly but go stale faster than whole ones;
     stale still has a use.
   - Every cut is "a little now, or the whole thing later".
2. **Building a fire inside the hearth.** The axe splits a log into half-logs, then sticks. A fire is built small to big: match
   lights sticks -> half-logs -> logs. The fire has a strength (small fire -> fire) that sets what the hearth can do (warm,
   boil, charcoal). Overnight it falls to embers; the `bellows` revives embers without a match. Fuel pieces are different
   shapes, so filling the fuel slot is a packing puzzle.
3. **Vessels with a material**, one property on the liquid code: a metal bucket can sit over the fire (boil water), a wooden
   one cannot, glass **cracks** if heated, an amphora keeps things cool. Existing vessels get different jobs, no new machines.
4. **Shopkeeping with price tags** (the repo is called supermarket). A **shop counter** is a special container; using a
   `price-tag` on an item sets its price; overnight customers buy what is priced right for its value; **coins are items**
   (coins -> coins-pile -> money-stack, strongbox) that need storage too. The reason to own everything else.

Suggested start: **1 + 4** (cheese to age and cut, a counter to sell it from).

## Earlier pitches, with the verdicts

- **Heat spreading on the field from the hearth** (warm neighbours boil, dry, melt). Rejected: proximity rule.
- **Power through touching gears** (water mill / windmill -> cogs edge to edge -> millstone, spinning wheel, pump).
  Interesting, **parked for later**.
- **Facing matters**: uncorked vessel upside down spills; pipes/valves with in and out sides; an **hourglass** you turn to restart
  a timer. Hourglass liked, but it clashes with step time; a reason to add a separate real-time timer (pausable driver that
  calls `advance(state, 1)`, step button kept). Could later be a flavour item (turn it to fast-forward N ticks).
- **Flowers that need a lantern nearby to grow.** Rejected: unrealistic (and proximity). Reworked as the plant bed above.
- **Spoilage with contagion** (rot spreads to neighbours in a container). Contagion dropped. Spoilage only as
  **transformation with a use at each stage**: milk -> sour -> cheese; overripe fruit -> mash for the vat (feeds the still);
  rotten food -> fertiliser; meat or fish in a **salt box** or the hearth's **smoking slot** stops ageing and is worth more.
  Slow and visible (a tint now, the tooltip gauge later).
- **The big resource web** (log, charcoal, water, grain + straw, eggs, hens, salt, brew, vinegar, spirit, flowers, honey and wax,
  milk, hide, sand, ore, compost; crates, leather knapsack, glass, metal tools as rewards; heat tiers where charcoal gates glass
  and smelting). Rejected as too wide and too much DIY processing; individual pieces may come back.
- **The still, done properly**: liquids with strength/flavour/harshness; a run gives heads -> hearts -> tails and you choose when to
  swap the receiving bottle; heat trade-off; mash recipe; casks; blending by volume; heads and tails recycled. Liked the depth,
  but no elegant way with day steps (it is minutes, not days). A step-based version (each tick drips into whatever bottle is
  in the output; cut early = less but purer) was offered; parked.
- **Hens with individual genetics** (lay rate, size, colour, temper, pecking order inside the coop, breeding). Too much
  tedium unless it can be seen and steered; see the coop above.
- **Packing orders** for a shaky cart ride (weight, fragility, bottles upright, straw fills gaps, paid by condition). Not
  discussed further.
- **Day-scale set**: cask and cellar (big barrel vessel with a tap, angel's share), **jars that steep** (liquid + solid,
  sealed, N days: tincture, pickles, liqueur, cordial; vials need a funnel), **orders and money as items** (a letter in the
  mailbox each morning, deliver goods + letter in a dispatch crate, coins take space), **expeditions in a knapsack** (pack
  gear and food, gone N days, destination + gear decide the haul), beehive (honey, wax for seals and candles), box trap
  with bait, soap curing (hearth ash + fat), matryoshka joke item. Pitched from icon names only, without looking at the
  icons; the pushback was about that, so these were never judged on their merits. Orders/coins and the cellar carried into the pitches above.
- **Ending the day feels tactile**: if a step is a day, the button is "end the day" and plays one short overnight sequence
  (gauges fill, ages tick, jars finish, the letter drops in, the knapsack comes home).

## Open questions

- What the player is ultimately after: orders and rent (as on `inventory-manager`), growing the place, or both.
- Real-time clock vs. day steps (or both: real time within a day, a step to end it).
- How a liquid's or cheese's quality is shown before tooltips exist.

## Icons

`node_modules/@iconify-json/game-icons` (4,134 icons; the editor's browser also has seven more sets). Useful groups seen:
- **Kitchen and food:** cooking-pot, camp-cooking-pot, saucepan, wok, cauldron, kebab-spit, ladle, whisk, dough-roller,
  kitchen-knives, cleaver, kitchen-scale, pestle-mortar, manual-juicer, manual-meat-grinder; bread, cheese-wedge, butter,
  ham-shank, bacon, sausage, steak, charcuterie, meat-hook, fish-smoking, salt-shaker, honey-jar, pickle, raw-egg, fried-eggs.
- **Vessels:** jug, amphora, water-flask, waterskin, wine/beer/brandy/sake/square/spiral bottles, round-bottom-flask,
  erlenmeyer, vial, corked-tube, mason-jar, covered-jar, cloth-jar, barrel, cellar-barrels, jerrycan, oil-can, beer-stein,
  wine-glass, teapot, coffee-pot, moka-pot, funnel, tap, valve, pipes, tee-pipe, leak, spill.
- **Fire and light:** match-head, matchbox, flint-spark, lighter, small-fire, campfire, fire, burning-embers, bellows,
  fireplace, chimney, candles, candle-holder, lit/unlit-candelabra, lantern, old-lantern, torch.
- **Animals and growing:** chicken, rooster, egg-clutch, nest-eggs, incubator, goat, cow, udder, sheep, pig, rabbit, rat, cat,
  duck, goose, bee, beehive, honeycomb; seedling, sprout, plant-seed, flower-pot, greenhouse, watering-can, fertilizer-bag,
  wheat, grain, oat, hops, most vegetables and fruit.
- **Fishing:** fishing-pole, hook, lure, net, worms, fish-bucket, salmon, eel, crab, mussel, oyster, oyster-pearl, scallop.
- **Money and trade:** coins, two-coins, coins-pile, gold-stack, money-stack, banknote, wallet, pouch-with-beads, piggy-bank,
  strongbox, price-tag, shop, hanging-sign, tavern-sign, mailbox, envelope, wax-seal, stamper, post-stamp, contract.
- **Time:** hourglass, empty-hourglass, sands-of-time, pocket-watch, alarm-clock, sundial, calendar.
- **Locks:** key, keyring, skeleton-key, padlock, padlock-open, combination-lock, locked-chest, lockpicks.
- Not in game-icons: tongs, whetstone, plain candle, oil lamp, oven, millstone, churn, loom, compost.
