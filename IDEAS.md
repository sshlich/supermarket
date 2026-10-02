# Ideas (brainstorm, 2026-09-30 / 10-01)

Where the brainstorm stands: rules that came out of it, what was liked, parked or turned down, and what to pick up next.
Nothing here is built. `DESIGN.md` stays the record of what is.

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
- The rush is the structure; the look stays open (Qud-weird, techno-fantasy). Nearest existing: Moonlighter (merchant village
  by dungeon gates), SteamWorld Dig (western mining town over ancient tech), so no cowboy look.

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
