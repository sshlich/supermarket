# Research: tropes and mechanics for the whole game (2026-10-15)

Asked for after several rounds of suggestions that had no mechanics behind them. This covers eight strands of web research
over about 90 games, talks and postmortems:
- customers,
- trading economies,
- items,
- setting and long-term structure,
- processing machines,
- grid containers,
- shop and restoration sims,
- hands-on machine interfaces.

Everything is filtered through this game's own rules.

Each finding comes with the evidence for it and the way it fails. Key sources are listed under each section. Some sources
are thin: the research tools ran out of search quota on Kenshi, Mount & Blade, Port Royale and word-of-mouth mechanics, and
*Probably Stolen* has no reviews yet (it is out 2026-10-28).

**Nothing here is decided.** Section 4 lists proposals; section 5 says where I would start.

---

## 1. Where the game stands, measured against the research

| System | Today | What the research says is missing |
|---|---|---|
| **Customers** | Random, faceless, wants given as tag chips, no memory | A few written characters inside a random line (Papers, Please's Jorji), wants phrased as words, lines chosen to fit the moment |
| **Economy** | The sim shows flat net with cash piling up; only 10–18% of buyers matched; "accept every deal" beats speculation | A rising bill (Recettear, Luck be a Landlord), big shortages announced well ahead (Drug Wars), holding stock that costs something, matching you can act on |
| **World** | Told only in 3 books and 3 discs; the shop never touches the town | A town that changes with what you sell (Stardew's Community Center, Death and Taxes), news each morning (Papers, Please), shortages that tell the town's decline (Pathologic 2) |
| **Items** | Good states (fill, cuts, age, seeds); price is the kind's price | Provenance (Caves of Qud, Dark Souls), materials that machines read (Breath of the Wild, Prey), value that depends on who needs it (This War of Mine) |
| **Machines** | The furnace: a timer with no choice in it and a generic buyer | Inputs that steer the output, orders only a machine can fill, value per cell, optional hand work |
| **Feel** | A dial that counts up | A sale played out item by item with a climbing total (Balatro, Peggle); losses never celebrated |
| **Structure** | Endless days, no frame | Chapters that end on dated town events, then an endless mode (Recettear); rent as a clock counted in days |

---

## 2. Findings by system

### 2.1 Customers

- **A random line with written characters who come back.**
  - **Papers, Please:** the system "made it easy to interleave scripted encounters with fully or partially-random ones".
    Jorji, who keeps coming back, is the most-loved character: a familiar face stands out because the line around him is
    anonymous.
  - **Citizen Sleeper** is built "like a TV show": a character can go quiet and come back.
  - **Death and Taxes** has profiles that appear only once their conditions are met.
  - **The risk:** Pope's "network of dependencies" grows with every scripted character.
- **News each morning that changes the day.**
  - **Papers, Please:** a bulletin and a newspaper; each day a new rule.
  - **Death and Taxes:** each verdict moves four world values, and you see the result in the next morning's news.
  - **Headliner** shows the results as graffiti in the street.
  - **Pope's warning:** "the bulletin is basically ignored when you've got someone to talk to right away", so news goes on
    a quiet screen before anyone is in line.
- **Storylets, picked by what fits.** Emily Short and Failbetter: small pieces of story with a condition and an effect,
  picked from a large pool by how well they fit the current state. They are "atomic, robust, recombinable", and you can add
  more without branching. Wildermyth puts written bookends around a procedural middle.
  - **The risk:** characters acting out of character (Wildermyth's GDC talk).
- **How a want is said.**
  - **Strange Horticulture:** requests by property or riddle.
  - **VA-11 Hall-A:** "read the patron and serve what you think they want".
  - **Vague requests backfire:** players complain about Coffee Talk's and Potion Craft's.
  - **The fix:** words for the tone, tags underneath for fairness.
- **Stakes without a timer.**
  - **VA-11 Hall-A:** a misread patron may leave, and that part of their story is gone. Coffee Talk without stakes: "click
    buttons until you get it right".
  - **Mars After Midnight** gets "too easy" after four or five visitors; one odd merchant breaks the pattern.
  - **That's Not My Neighbor's** fame rests on one odd recurring figure.
- **Faceless sim customers are hated as chores.** Supermarket Simulator players ask to automate customers away. TCG Card
  Shop's smelly customers are a trait that is only a nuisance. **Every trait must change a decision.**
- **Haggling.**
  - **Recettear:** a budget is a hard cap, and you get a bonus for the exact price and for chains of sales on the first
    offer.
  - **Moonlighter:** a face reacts and a notebook logs prices. Critics found it "not that strategic" and stale over time.
  - **Potionomics:** haggling as a card game; the best part of that game, but "frantic, stressful" early.

Sources:
- https://www.gamedeveloper.com/design/designing-the-bleak-genius-of-i-papers-please-i-
- https://inverse.com/gaming/citizen-sleeper-gareth-martin-interview
- https://www.articy.com/en/showcase/death-and-taxes/
- https://emshort.blog/2019/11/29/storylets-you-want-them/
- https://emshort.blog/2016/04/12/beyond-branching-quality-based-and-salience-based-narrative-structures/
- https://gdcvault.com/play/1027614/Independent-Games-Summit-Session-Getting
- https://www.cgmagonline.com/articles/previews/va-11-hall-a-explores-the-dystopian-cyberpunk-future-of-bartending/
- https://adrianhon.substack.com/p/mars-after-midnight
- https://recettear.fandom.com/wiki/Pricing_Strategies
- https://www.gamedeveloper.com/road-to-igf-2023/how-potionomics-turned-price-haggling-into-a-card-game

### 2.2 Trading and the economy

- **One shared price that every sale moves.** Soren Johnson merged Age of Kings' separate buy and sell prices into one,
  and only then did players "start taking advantage of buying low and selling high". Offworld also has one market that
  cannot be crashed, so a dump has a floor. Patrician gives each town a steady consumption that grows. Elite Dangerous
  fails: supply is effectively endless, so more than half of goods are never traded.
- **Why accepting every deal beats speculation.** It wins when spikes are small next to turnover, holding is free, and
  rumours give no time to act.
  - Drug Wars works because spikes are many times the price, the hold is small, and a full hold draws trouble.
  - Johnson: "players will optimize the fun out of a game"; the fix is a choice that is right only sometimes.
  - **What to do:** shocks of x3–5, a lead time of 2–3 days, space as the cost of holding, and wrong rumours that are
    wrong about *which* need rather than whether something happens.
- **A rising bill.**
  - Drug Wars has a debt that grows every day. Recettear has weekly payments that keep rising, and missing one keeps your
    progress.
  - Luck be a Landlord's rent rises after each payment; LocalThunk names it as the root of Balatro.
  - Taipan! starts with a choice: borrow, or start with no debt.
  - **What it does:** a bill is growth pressure you can see.
- **Growth engines and plateaus.**
  - Idle-game maths: costs grow exponentially, and milestone multipliers "bump you back up".
  - Universal Paperclips: every plateau ends with a new verb.
  - Stardew fails: millions with nothing to buy.
  - **Lesson:** space and new verbs are the growth engine, not bigger numbers.
- **Interest with a cap** (Balatro: $1 per $5, capped). Saving up to the cap is a skill, and money above it begs to be
  spent. It answers a cash pile directly, but it is gamey for Merrow's tone.
- **The sale as a show.**
  - Balatro hides the score preview because the fun is watching the machine you set up go off.
  - Peggle's Extreme Fever began as a joke placeholder and became the defining moment of each level.
  - **The ethics:** slot machines play win sounds on "losses disguised as wins", which inflates how often players think
    they win (Waterloo). Only real profit gets the fanfare.

Sources:
- https://www.designer-notes.com/otc-designer-notes-2-free-markets/
- https://www.designer-notes.com/otc-designer-notes-12-offworld-market/
- https://www.designer-notes.com/game-developer-column-17-water-finds-a-crack/
- https://en.wikipedia.org/wiki/Drug_Wars_(video_game)
- https://reactormag.com/recettear-capitalism-ho/
- https://www.pcgamer.com/i-dont-play-poker-at-all-says-solo-developer-who-made-the-poker-roguelike-i-cant-stop-playing/
- https://www.gamedeveloper.com/design/the-math-of-idle-games-part-i
- https://gmtk.substack.com/p/balatros-cursed-design-problem
- https://pcgamer.com/the-making-of-peggle/2
- https://uwaterloo.ca/news/news/music-gamblers-ears

### 2.3 Items

- **A few rules that apply to everything.** Breath of the Wild's "multiplicative gameplay" (GDC 2017) uses a handful of
  elements on a handful of materials, so experiments feel like the player's own idea. Prey's recycler makes every banana
  peel worth something; a launch exploit that doubled its output shows how a universal converter can break an economy.
- **One thing, many real uses.** Project Zomboid: a sheet becomes rags, a dirty rag is washed, a clean one boiled. Every
  step is something a real person would do. Prey's GLOO is one verb with five uses.
- **Value depends on who needs it.**
  - This War of Mine: each trader values things differently.
  - Pathologic 2: "who a person is determines what items they will barter". Children trade precious things for
    "worthless" trinkets, and Edge calls them the town's hidden king-makers.
  - Metro's ammo is both a weapon and money, and the dilemma only works if both uses are live.
- **Provenance and history.**
  - Dark Souls item text has a narrator who is "authorial but not omniscient", and you read it while managing equipment,
    so it never interrupts.
  - Caves of Qud generates relics from history.
  - Dwarf Fortress shows value as base x material x quality: a readable formula with memorable outliers.
  - Dark Souls II's failure was lore that pointed at "faraway lands".
- **A lot is a biography.** Unpacking tells a life through about 1,000 objects, with the rule "No item? No trait!".
- **Against crafting** (Margini, Kill Screen): crafting is waiting, a crafted set feels "all-too-ordinary", and found
  things carry history. Keep making to single steps; meaning goes into what is found.
- **Wear only where it creates a choice.** Breath of the Wild's breakage was the most-cited complaint, and Tears of the
  Kingdom's fusing was seen as the fix.

Sources:
- https://www.thumbsticks.com/gdc-17-breath-of-the-wild-science-lies
- https://prey.fandom.com/wiki/Fabricators
- https://pzfans.com/how-to-make-sterilized-bandages-in-project-zomboid/
- https://this-war-of-mine.fandom.com/wiki/Items?oldid=6748
- https://en.wikipedia.org/wiki/Pathologic_2
- https://www.firstpersonscholar.com/?p=2844
- https://gamasutra.com/design/tapping-into-the-potential-of-procedural-generation-in-caves-of-qud
- https://dwarffortresswiki.org/index.php/DF2014:Quality
- https://www.gamedeveloper.com/gdc2022/gdc-2022-unpacking-a-narrative-through-1-000-household-items
- https://www.killscreen.com/against-crafting/

### 2.4 Setting and long-term structure

- **A dying town told through prices.**
  - Pathologic 2: matches cost 30 on day 1 and 90 by day 6, panic buying follows the plague, and the trains stop.
  - An academic paper argues the economy itself creates the dread. Critics also say its survival systems smother its
    ideas (Metacritic 67), so keep the curve and drop the grind.
  - Sunless Sea: trade was thin and the stories were the real currency.
- **A town that shows what you did.**
  - Stardew: players find the Community Center "much more satisfying" than Joja even when its rewards are weaker, because
    they can see the town change.
  - Frostpunk: the best move for the town is not always the right one.
  - Moonlighter's town upgrades are praised, but the grind for the late ones is "staggering".
- **The tone.**
  - Night in the Woods: a rust-belt town treated with empathy, not "ruin porn".
  - Night Vale: strangeness reported as calm routine.
  - Disco Elysium: the world told through "a crack in the pavement".
  - The lamplighter already does the Night in the Woods move.
- **A mystery that arrives over the counter.** In Strange Antiquities (84 on OpenCritic) the objects you hand over steer
  the ending. Her Story's search box makes the player's imagination part of the story. Obra Dinn checks answers three at a
  time so you cannot brute-force them.
- **Long-term structure.**
  - Papers, Please has 31 days and 20 endings, though critics call many of them "simple failure screens".
  - Recettear's campaign is followed by endless modes.
  - Cultist Simulator's legacies let you die and go on in the same world.
  - Players increasingly dislike stat meta-progression and prefer "sideways" unlocks.
  - Citizen Sleeper: precarity tuned down, because "if the game was too harsh players wouldn't give it the time".

Sources:
- https://pathologic.fandom.com/wiki/Match
- https://www.hardcoregaming101.net/pathologic/pathologic2.htm
- https://steamcommunity.com/app/413150/discussions/0/1484356232251074053
- https://www.destructoid.com/?p=198043
- https://creators.vice.com/en/article/z4k4kx/night-in-the-woods-is-an-affecting-portrait-of-a-rust-belt-community
- https://www.nintendolife.com/reviews/switch-eshop/strange-antiquities
- https://www.thumbsticks.com/gdc-2016-how-player-imagination-was-used-to-tell-her-story/
- https://Techraptor.net/gaming/interview/becoming-cult-leader-we-talk-with-alexis-kennedy-and-lottie-bevan-about-cultist
- https://www.rascal.news/flatmates-in-space-gareth-damian-martin-talks-genre-and-citizen-sleepers-tabletop-destiny/

### 2.5 Machines and containers (condensed from the first round)

- **A good machine has a job.** It reveals something hidden, raises quality where you can see it, converts junk into
  stock, or fills an order that names a property.
- **What works:**
  - inputs that steer the output (the crock pot, the scav case, brewing modifiers);
  - holding things back for value (the cask);
  - value per cell (DREDGE);
  - a byproduct that blocks the machine if ignored;
  - arrangement inside the machine's own grid (Atelier);
  - readable feedback (the colour of the glow);
  - optional hand work where failure costs time, not materials (Spiritfarer's bellows, VotV's repair: a minigame, a kit,
    or a robot);
  - the machine growing through items rather than menus (Hypnospace, Exapunks' zines).
- **What fails:**
  - refuelling as pure upkeep (Valheim's auto-refuel mods);
  - quality that does not carry through a machine (Stardew's jar);
  - opaque failure (KCD2: "never tells me what I'm doing wrong");
  - gates that add steps without choices (oak resin);
  - many timers you can miss (Cultist Simulator);
  - controls that are only decoration (Pope cut a lamp that players kept clicking).

Sources:
- https://dontstarve.wiki.gg/wiki/Cooking
- https://primagames.com/tips/are-scav-cases-worth-it-in-escape-from-tarkov
- https://wiki.stardewvalley.net/Cask
- https://dredge.wiki.gg/wiki/Fish
- https://satisfactory.wiki.gg/wiki/Heavy_Oil_Residue
- https://rpgamer.com/review/atelier-sophie-the-alchemist-of-the-mysterious-book-review-pc/
- https://guidestrats.com/spiritfarer-foundry/
- https://voicesofthevoid.wiki.gg/wiki/Guides/Gameplay
- https://hypnospace.wiki.gg/wiki/Development_of_Hypnospace_Outlaw
- https://thunderstore.io/c/valheim/p/potto007/OttoFuel/v/1.6.5/
- https://www.killscreen.com/peek-behind-scenes-papers-please-reveals-baggage-search-and-gun-fights/

---

## 3. The filter: this game's rules, and where the research rubs against them

**Rules that hold:**
- No hours: a day is a line of customers.
- No proximity effects on the field.
- Realism.
- Practical items over junk variety.
- Not a farm story.
- Machines are bought, not built.
- Aging only gains value.
- Hidden complexity is tedium.
- Steer away from Probably Stolen's core: legality, police, factions, the divided city.

**What the user loves:**
- the meditative loop;
- the ka-ching of a full counter;
- hoarding, then selling into a shortage;
- making something valuable with machines.

**Where the research rubs:**
1. **ECONOMY.md's events and rumours are measured in hours** (a rumour 2 to 4 hours early). Since hours are gone, they
   have to be restated in days or lines. The research says 2–3 days of lead time anyway.
2. **"General economy over relations: no regulars or standing"** versus written characters who come back. These are
   compatible only if a returner is **story only**: no discount, no reputation, no standing.
3. **Appraisal was cut.** Inspection tools, such as a loupe or cutting an apple to see if it is synthetic, are appraisal
   in another coat. Left out.
4. **Probably Stolen overlaps:** rising rent, rumours and tips about prices, reputation, appraisal. Rent and rumours are
   genre-wide (Drug Wars, Recettear) and fine. What makes this game its own:
   - a town you can see,
   - physical barter across two counters,
   - machines with their own windows,
   - provenance.
5. **Interest on cash** is effective but reads as a game mechanic, not Merrow. Kept as a lever only.

---

## 4. Proposals

They are grouped by what they do for the game, not by system. Each says where it comes from, what it fixes, and what it
touches.

### A. Merrow's numbers: the town as a ledger *(the spine)*
- **What:** a handful of town values you can see, each tied to a need:
  - **lamps lit** (light, fuel),
  - **clean water** (drink),
  - **the plant** (food: synthetic stock running down),
  - **the clinic** (medicine),
  - **the cold** (fuel).
- **How it moves:** each value drifts with the days, toward decline. A need sold into the town pulls its value back: lamp
  oil sold raises the lamp count. Prices follow the values.
- **Where you see it:** a **morning slip** under the door, before the first customer: "Lamps lit: 11. The plant has cut
  the filters at Hall 2 from Thursday."
- **What it fixes:**
  - shortages get **2–3 days of warning from the world itself**, so hoarding pays;
  - shocks are large, because a filter cut is a real crisis;
  - the economy and the story become the same thing.
- **From:** Pathologic 2's price curve, Papers, Please's bulletin, Death and Taxes' world values, Stardew's visible town,
  Night in the Woods' tone.
- **Touches:** `market.ts` (built, not wired: town values drive `D_t, S_t`), a slip on the night overlay or the terminal,
  ECONOMY §5 events restated as town events.

### B. Customers with words, and a few who come back
- **Wants said as a phrase, tags settling underneath:** "something to get through the dark months" over the chips
  `light · fuel`. Lines are picked by what fits (storylets): the town values, today's news, the customer's kind, what is on
  the counter.
- **6–10 written returners mixed into the random line**, for the story only:
  - the widow selling her house off piece by piece;
  - the plant's last chemist;
  - the lamplighter, who buys oil and tells you the count.
  
  They come back every few days. **Their belongings arrive over the counter in lots, and their story comes together on
  your grid.** The unlabelled diary disc could be one of them.
- **One odd visitor a day** (a riddle buyer, a child trading trinkets) breaks up the pattern, as in Mars After Midnight.
- **Orders that come back** (from the first round): a customer asks for something by what it is, and returns in a later
  line.
- **Stakes:** a badly served returner leaves mid-sentence; that part of their story is gone (VA-11 Hall-A). No penalty in
  money.
- **Touches:** customers.ts (returners and orders), terminal.ts (phrases, a slip), a storylet folder like `src/books/`.

### C. Items that carry where they came from
- **One line of half-knowledge on every kind,** pointing inward at Merrow, never at far-off lore. For example: "Door
  knocker, brass. The screw holes are still bright."
- **Seeded provenance** (the lighters already have seeds): some items carry a former owner, an engraved name. That owner,
  or their kin, can turn up and want it back.
- **Material tags that only machines read** (metal, glass, cloth, fat, paper): the furnace melts by metal, not by "ore".
  A few rules, many things.
- **One thing, two live needs:**
  - coal for the furnace, or for the customer who needs fuel today;
  - a shirt to sell, or rags for a lamp wick;
  - the children's "worthless" trinkets.
- **Touches:** kinds.json (a `lore` line, `material`), seeds, the furnace's `charge`.

### D. Fixing the three problems the sim found
| Problem | Fix from the research | Where from |
|---|---|---|
| No growth engine, cash piles up | **Rent that steps up with each phase,** with a soft fail (progress kept; the story bends). **Space as the main sink:** each extra stretch of field is a visible milestone, and each phase opens a new verb. | Recettear, Luck be a Landlord, Universal Paperclips, Citizen Sleeper's tuning |
| Only 10–18% of buyers matched | **Wants shown as the line forms** (the header lists what is coming); **substitution within a need** at a lower price (a candle for lamp oil); the morning slip says what the day will want | Moonlighter, Recettear, Papers, Please |
| Accepting every deal beats speculation | **Shocks of x3–5 with days of warning** (A); **space is the cost of holding**, so accepting everything fills the field before a shortage; **prices fall with each unit sold**, so a dump is spread over days; one buyer who never crashes (the convoy) as a floor | Drug Wars, Offworld, Patrician |

### E. The ka-ching, played out
- **A full counter sells item by item:** each thing lifts, its price ticks, and the total climbs.
- **A dump into a shortage** gets the big moment (Peggle's Extreme Fever).
- **A sale at a loss sounds flat.**
- **A first-offer chain** (several buyers served without a "no") is noted.
- **From:** Balatro, Peggle, Recettear; the Waterloo work on "losses disguised as wins".
- **Touches:** main.ts (the sale), sounds.

### F. Machines (from the first round, unchanged)
- **The bellows:** optional hand work; burns coal for time.
- **The furnace melts scrap by material** (overlaps with C).
- **Programs arrive on discs:** the ledger, the market board, the forecast, the town's numbers.
- **Value per cell** shown on items.
- **The second machine:** pick the shape first, then the name. Either it works **overnight** (sleep is the only slow
  clock), or **arrangement inside its window matters**.

### G. Structure
- **The four phases become chapters,** each ending on a dated town event, for example:
  - the last batch drained from the plant;
  - the lamps going out on Merrow Street;
  - the water filters cut.
- **After the last chapter,** an endless "keeping" mode.
- **Rent is a clock counted in days.**
- **Optional:** the next keeper inherits the ledger you wrote (Cultist Simulator's legacies).

---

## 5. Where I would start

**A (the town's numbers and the morning slip)**:
- it gives events, hoarding, the customers' lines and the items' lore one shared source;
- it is mostly wiring `market.ts`, which is already written and tested in the sim;
- it is the most distinctly *this game's own* direction.

**Then B's first slice:**
- wants as phrases;
- two or three returners, the lamplighter first, since the book and the disc already set him up.

**D's rent and space sinks** fall out of ECONOMY's build order and can be tuned in the sim.

## 6. Night scavenging, search counts and the embark screen (2026-10-19)

Asked for after STATION.md 8b went into the sim: sites with a fixed number of searches, equipment that changes them, and a
prepare-to-go-out screen.

- **This War of Mine:** one scavenger and one site a night. The pack is set by the character (Boris 17 slots, Bruno 10)
  and never upgrades. Tools take pack slots and gate spots: a crowbar is reusable, lockpicks are used up, a sawblade fits
  one machine. Loot persists between visits, so you return over several nights, and the radio warns of sites changing.
  Reviewers name "you need everything but can only carry so much" as the core.
  ([guide](https://gamersdecide.com/articles/this-war-of-mine-beginner-guide), [packs](https://steamcommunity.com/app/282070/discussions/0/611702631246683612))
- **Darkest Dungeon:** the provisioning screen buys per region (shovels for the Weald, keys and holy water for the Ruins), and
  anything not used is lost when the run ends. Curios can be tried bare-handed at worse odds (loot or a debuff); the right
  item makes the outcome good. Players praise the regional choice and call the town side "tedious".
  ([provisions](https://darkestdungeon.wiki.gg/wiki/Provisions), [curios](https://darkestdungeon.wiki.gg/wiki/Curios))
- **DREDGE:** equipment sits in the same grid as the catch, so better gear means less cargo. Rods say what they catch, and
  lights make the night bearable. Fishing spots run down and come back within a day or two.
  ([equipment](https://dredge.wiki.gg/wiki/Equipment))
- **Extraction games:** rebuilding a kit every run is busywork. Tarkov's loadout presets were among its most asked-for
  features, and ARC Raiders' always-free default kit is read as the cure for gear fear.
  ([ARC Raiders](https://www.gfinityesports.com/article/how-arc-raiders-solves-extraction-shooter-gear-fear-with-free-loadouts))
- **Pacific Drive:** you scan junctions on a map for resources and hazards before going. Critics flag the "cascade of
  menus within menus". **Moonlighter** (shop by day, dungeon by night): the loop goes stale, and bag management "feels too
  time-consuming". ([PCGamesN](https://www.pcgamesn.com/pacific-drive/review), [RPG Site](https://rpgsite.net/review/7210-moonlighter-review))
- **Fixed search counts:**
  - **Animal Crossing:** a rock gives 8 hits a day, unseen, and your setup changes the take.
  - **Monster Hunter:** a gathering point allows a hidden number of gathers. The Gathering skill on armour sometimes adds
    more, at the price of a combat skill. Pickaxes break.
  - **Atelier Ryza:** the tool changes what a node gives, not how much (a sickle gets bark), and Ryza 2 shows the yields first.
  - ([MH](https://www.monsterhunterwiki.org/wiki/Gathering_(MHGU)), [Ryza](https://techraptor.net/gaming/guides/atelier-ryza-3-gathering-tool-guide))
- **Pitfall:** a pure stat bump is equipped every time and stops being a choice; a sidegrade with a cost stays one
  ([Game Wisdom](https://game-wisdom.com/?p=8499)).

Lessons for this game:
1. Equipment should change *what* and *where* more than *how many*; anything that adds searches costs room or wears.
2. Tools in the carry grid compete with finds for room: that gives them a cost with no time or energy meter.
3. The embark screen remembers the last kit; one click to go.
4. A gated spot can be tried without the tool, at worse odds, rather than being a hard lock.
5. Show each site's searches, gate and kind of find before leaving.
6. Sites that refill every night still need something that varies them, or one dominates (the sim already shows it).
7. Keep pack handling about choices, not chores.
