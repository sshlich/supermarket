# Ideas (brainstorm, 2026-09-30 / 10-01)

Where the brainstorm stands: rules that came out of it, what was liked, parked or turned down, and what to pick up next.
Nothing here is built. `DESIGN.md` stays the record of what is.

## Rules for new systems (from the discussion)

- **No proximity rules outside machines and special containers.** Nothing happens because two things sit near each other on the
  field. Heat, cold, ageing, growth, rot all live in a machine's slots or a special container (cellar, salt box, coop...).
- **Deep, not wide.** A few items with many layers, not long chains of new items. Every system has to touch others and give a
  real benefit for engaging with it.
- **No DIY crafting trees** (build the machines from crafted parts). Leftovers pile up and play ends once everything is made.
  It stays one possible angle, on hold.
- **Realism.** "A lamp next to a plant makes it grow" was rejected as unrealistic.
- **No tedium.** Hidden or untrackable complexity (genetics you cannot see or steer) is tedium. Spoilage only if it has a
  purpose (salt it, or use it for something else before it is useless).
- **Time:** a step currently means a day (not intended, but that is how it plays). Things that take days fit (ageing,
  steeping, curing, growing, hatching). Things that take minutes (a still's cuts) would need a real-time clock and an
  animation so that pressing the time button feels tactile.

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
