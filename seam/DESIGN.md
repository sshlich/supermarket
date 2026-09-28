# SEAM

*A game about living in the gap of a city that builds itself.*

Design document, v0.1, 2026-09-28. Working title. Status: ready to build the **Vertical Slice** (sections 15 and 16).

---

## 0. How to use this document (for the implementer)

- **Build in `seam/`.** It is its own Vite root: `npx vite seam --port 5175`. TypeScript strict, plain DOM and CSS, no framework. That matches the rest of this repo.
- **Read sections 1 to 4 for intent**, then build the milestones in section 15 **in order**. Each milestone has acceptance checks. Don't start the next one until they pass.
- **Content lives in the appendices** (levels, species, items, relics, hazards, levers, text). Treat it as data: put it in `seam/src/data/*.ts`, never hard-code it in logic.
- **Numbers are starting values.** Tune them freely, but keep the scenario tests in Appendix J passing. If you change a target, write down why in the test.
- **When this document is silent**, pick the simplest thing that respects the pillars (section 2) and leave a `// TODO(design): …` comment with the question.
- **Reuse our own code** from `workshop/` (the 2D grid handling). Never copy code or assets from decompiled or commercial games. The inspirations in section 3.7 are influences only: **don't use their names, terms or characters.**
- Commit after each milestone, with a message that says what a player can now do.

---

## 1. The pitch

> The Accretion builds itself, forever, and deletes anyone who has no right to be in it. Forty people live in the Seam, a forgotten gap between two floors. They need food, water and light. The machines that build the Accretion are slowly building over them.
>
> You can't fight the Accretion. You can learn it: which valve feeds what, which door leads the hunters away, whose permission opens what. Every table you fill in is a lever. Every lever you pull gets noticed.

**In one line:** *you can't fight the city; you can only learn which wire to cut.*

**What the player does:**
- goes out on runs through strange levels, site by site
- brings back supplies and relics nobody understands
- studies them at home
- keeps forty people alive
- pulls levers in a living ecosystem, where every change spreads further than expected

The progress is **knowledge**. Knowledge becomes **access**, and access becomes **power**, at a price.

---

## 2. Pillars

These are also the tests for every feature. If a feature fails one, cut it or change it.

1. **The world runs without you.** Every level holds a live population simulation: species eat, breed, starve and migrate whether you're there or not. You never see a "respawn". What you meet on a run is drawn from what actually lives there.
2. **Force is not the verb.** One person can't kill two hundred of anything. You matter through **levers** (valves, doors, bait, sluices), **access** (permissions to the city's systems), **time** (things you set in motion) and **care** (who you protect). Fighting exists, but it's small, noisy and expensive.
3. **Understanding is power.** Every table in the game starts as `???`. You fill it by watching, testing, reading terminals and taking risks. A filled table shows you where the levers are. At the highest access, some tables become **writable**.
4. **Every property feeds a decision; every item has a way out.** Nothing exists only to be tracked. Every item is eaten, burned, used, traded or fed to something. If a number never changes what the player does, delete it.
5. **Somber, with a dry laugh.** The world is vast, indifferent and beautiful. The humour comes from the machine's bureaucratic voice (MAINT) and the Authority's glossy adverts from a future that never arrived.

**Standing decisions, and the reasons behind them:**

| Decision | Why |
|---|---|
| **Turn-based.** Time moves in steps on a run and in nights at home. | The simulation stays readable. The player plans and doesn't rush. |
| **No walking character.** You play through a terminal: windows, tables, site cards and grids. | Chosen by the user. The screen *is* the world's interface. |
| **Grids hold items only.** Rooms and furniture are never items on the same grid. | Mixing them breaks the sense of scale. |
| **No money in the Vertical Slice.** | When everything converts to coin, items become coin. Here, value is what a thing does. |
| **Hauling is by hand at first.** Automation is earned later. | Being inconvenienced first is what makes automation feel good. |
| **Runs are visible**, as site cards and encounters where your items act. | Invisible expeditions remove the payoff of having good gear. |
| **Knowledge outlives you.** When a runner dies, the Catalog stays. | Somber, and it works as progression. |
| **Tables are the interface.** | The user loves tables and stats. The game should reward reading. |
| **No moisture or wetness stat.** | It added tedium in the earlier toy without adding depth. |

---

## 3. The world

### 3.1 The Accretion
The Accretion is a structure with no known edges. Its floors are numbered downward from a surface nobody has seen. The Seam sits at −213½.
- It is mostly silent.
- Its halls are big enough to hold weather. Its heating pipes are as wide as streets. Its stairs run for kilometres.
- Its lights come on for no one.
- It is still being built.

### 3.2 The Masons
The Masons are building machines, patient as glaciers. They lay new floors, bury old ones, reroute shafts and seal rooms with people still in them. They don't hate anyone and they don't notice anyone. They follow a construction schedule that lost its purpose thousands of years ago. Where they work they shed **scrap**, and scrap feeds a whole food chain.

### 3.3 The Auditors and the Signature
The Accretion was once governed through a network that only people carrying a **Signature** (a credential in the body) could use. The **Authority** ran it. The Authority is gone, and so is everyone's Signature.

The **Auditors** are the city's immune system. They still check credentials. When enough "noise" builds up on a level (noise, violence, unauthorised access), the Auditors **sweep** it: anything without a Signature is reclassified as debris.

Pieces of old Signatures survive as **Signature Fragments**. Presented at a terminal, they grant access, one tier at a time.

### 3.4 MAINT
A maintenance process still runs, degraded and talking to itself. You read its log on your terminal. It reports populations, schedules and sweeps in flat, lowercase log lines. It doesn't know you exist until you present a Fragment, and then it greets you as `[NAME NOT FOUND]`. MAINT is the game's narrator. It isn't evil. It's worse: it's diligent.

### 3.5 The Seam and its people
Forty people live in a crawlspace between floors: the Seam. They stay hidden by being quiet.
- They grow moss under lamps.
- They condense water from warm air.
- They burn salvaged power cells for light.

The current **runner** (the player) is whoever holds the salvaged terminal and the key to the hatch. When a runner dies, someone else picks up the terminal. The people have names. They talk about what they hear through the walls.

### 3.6 Relics and Drift
The Accretion makes things nobody understands:
- a coil that is always cold inside
- a candle that never burns down
- two plates that hold nothing apart

These are **relics**. They do real, useful, dangerous things, and nobody knows what until they're tested. Carrying them changes you slowly. This is **Drift**, and it's measured. At 100 Drift, the Accretion keeps you.

### 3.7 Tone and influences
**Tone:** vast, quiet, indifferent, occasionally breathtaking. Hunger is close. People are small and stubborn. The machine is polite. The adverts are glossy and wrong.

**Influences (for feel only, never copy names or content):**
- a lawless megastructure manga about an endless city and its security system
- a Soviet novel about Zones full of alien litter and the people who go in for it
- a LitRPG about a dungeon with a living ecosystem and a sardonic system voice
- a manga about a layered abyss with graded relics
- the Backrooms (levels with rule sheets)
- STALKER (a simulated world, and artifacts worn on a belt)
- Cogmind (a living dungeon with an alert level)
- Pathologic (dread driven by scarcity)
- Obra Dinn (a one-bit dithered look; deduction)
- Souls games (lore told through items)
- Frutiger Aero (the glossy 2004–2013 look, used here as satire)

---

## 4. The shape of play

### 4.1 The day
```
DAWN ─ at the Seam: read tables, plan, pack the kit, run the lab, cook and craft (no time passes)
   │
   ├─ go out: a RUN (12 steps per day; moving between sites and actions cost steps)
   │     sites → bolts → hazards → encounters → loot → levers → terminals
   │     come back before night, or camp (dangerous)
   │
DUSK ─ back at the Seam: unload, store, craft, set the lab stimulus
   │
NIGHT ─ the world moves (section 6.7): the village eats, species live, Masons build,
        Auditors sweep, the lab reports. MAINT writes the log. Autosave.
```

### 4.2 The long arc (Vertical Slice)
- **The clock:** the Masons are building toward the Seam. The **Burial** meter goes from 0 to 100. If you do nothing, the Seam is sealed around day 20 to 26 and the game is lost.
- **The goal:** reach the end of **day 30** with Burial below 100 and at least one person alive. The screen reads *"The Seam holds. For now."* Play can continue as a sandbox afterwards.
- **The ways to slow the Masons**, several routes on purpose:
  - lure rust moths onto a Mason work site (they corrode the Masons)
  - sabotage the work site
  - fire the Unbuilder relic
  - put a maintenance hold on it (WRITE access)
- **Other pressure:**
  - the village's daily needs
  - glasshounds, if you let them out
  - Auditor sweeps, if you're loud
  - Drift

### 4.3 Losing, and what carries over
- **A runner dies** (Health 0 or Drift 100): their pack and belt stay at that site as a cache. The village loses a person, and a new runner takes over. Nothing else resets.
- **The Seam falls** (buried, everyone gone, or audited empty): the run ends. **The Catalog, meaning all knowledge, persists** into the next game. The framing: *years later, another pocket finds the old terminal.*

---

## 5. Time

| Unit | Rule |
|---|---|
| Step | The unit of time on a run. A day has **12 steps** (0–3 Dawn, 4–7 Day, 8–11 Dusk). |
| Move to an adjacent site | 1 step |
| Cross a connection to another level | the connection's cost (1–3 steps) |
| Search, harvest, pull a lever, use a terminal | 1 step each |
| Encounter | no extra time |
| Actions at the Seam | free |
| **End Day** (at the Seam) | runs the night |
| Step 12 reached away from the Seam | **Camp**: the night runs, with a night encounter roll where you are; you continue next Dawn |
| Returning to the Seam | walk back along known sites. The UI offers the shortest known path and its step cost. |

---

## 6. The simulation: the world underneath

All of it lives in `seam/src/model/sim.ts`. It's pure, deterministic from the state's RNG, and never touches the DOM. It must run headless (section 14.5).

### 6.1 Levels
Each level has:
- **resources:** Film `F` (warm biofilm, the base of the food chain), Scrap `S` (Mason debris), Corpses `C` (biomass)
- **conditions:** `heat` (0, 1 or 2), `flooded` (true or false)
- **Mason activity** `M` (0–3)
- **attention** `A` (0–100+)
- **species populations** `N[s]` (floats; shown rounded)
- **sites** (section 11)
- **connections** to other levels (open or closed)

### 6.2 Species
Each species has:
- `mass` (biomass per individual)
- `diet` (food → preference weight)
- `r` (growth when fed) and `d` (death when starving)
- `vuln` (the share of its biomass predators can reach)
- `migrates`, `habitat` (for example `flooded`)
- encounter fields (section 11.5)

See Appendix B.

### 6.3 Nightly species update, per level
1. **Film.** If `heat == 0`: `F *= 0.75`. Otherwise `F += 0.25·heat·F·(1 − F/Fmax) + 2`.
2. **Scrap.** `S += 2·M`.
3. **Eating.** Go through consumer species by `mass`, largest first (the Choir doesn't eat here; it feeds by song in step 7):
   - demand: `D = N·mass·0.15`
   - for each food `f` in the diet, availability `A_f` is `F`, `S` or `C` for resources, and `N_f·mass_f·vuln_f` for prey
   - split `D` across the diet by preference, re-normalised over foods with `A_f > 0`
   - eat at most half of `A_f` per food per night: `eat_f = min(want_f, 0.5·A_f)`
   - subtract the eaten biomass (prey: `N_f -= eat_f / mass_f`)
   - `sat = Σeat_f / D`, between 0 and 1
4. **Births and deaths.**
   - If `sat ≥ 0.6`: `births = N·r·(sat − 0.6)/0.4`. Otherwise `starved = N·d·(0.6 − sat)/0.6`.
   - Natural deaths: `N·0.01`.
   - `N += births − starved − natural`. If `N < 0.5`, set `N = 0` (locally extinct).
   - `C += (starved + natural)·mass`.
5. **Habitat.** A species with `habitat: flooded` on a level that isn't flooded loses 40% per night. Those deaths go to `C`.
6. **Scourers.** Janitors are printed on demand: `N_scourer += 0.02·C / mass_scourer`. They eat Corpses like any other consumer (step 3). Corpses decay: `C *= 0.9`.
7. **The Choir's song** (only if the Choir is alive and not silenced): 8% of the glasshounds on every level within one open connection of the Choir Hall, and in the Hall itself, are drawn in and eaten. No corpses.
8. **Migration** (species with `migrates: true`):
   - Estimate carrying capacity: `K_est = Σ_f (A_f·w_f) / (mass·0.15)`.
   - If `sat < 0.4` or `N > 1.3·K_est`, move 25% of `N` through an **open** connection to the neighbouring level with the best food per head for that species, but only if it beats the current level.
   - Record a migration event (feeds rumours and knowledge).

### 6.4 Attention and Auditor sweeps
- **Actions add attention** to the level they happen on (table in section 11.8). Signal leaks add attention at the Seam (section 10.3).
- **Each night:** `A *= 0.8`.
- **When `A ≥ 100`, a sweep happens:**
  - every species except Scourers and the Choir drops to 40%
  - the killed biomass goes to `C`
  - `A = 30`
  - Auditors stay on that level for 2 days (encounter weight 5)
  - the first sweep in a game always leaves an **Auditor Husk** site-loot with a **Signature Fragment**; later sweeps do so 15% of the time
  - MAINT logs the sweep
- **The Seam has its own attention `A_S`**, fed by leaked Signal, loud crafting, and lights when not blacked out (+1 a night). When `A_S ≥ 100`, **the Seam is audited:**
  - 4 villagers are lost
  - each item in Stores has a 30% chance of being lost
  - `A_S = 30`

### 6.5 Masons and Burial
- **Burial** (0–100) rises each night by `1.5 × (M of Warm Galleries + M of Drowned Ducts)`. Those are the two levels next to the Seam.
- **The schedule** raises `M`:
  - day 8: Warm Galleries +1
  - day 16: Drowned Ducts +1
  - day 24: Warm Galleries +1

  If you do nothing, the Seam is buried around day 23. Tuning target: between day 20 and 26.
- **What reduces `M`** (it can't go below 0):
  - moth lure at a Mason Works site: −1 for 10 nights
  - sabotage: −1 for 3 nights
  - WRITE maintenance hold: `M = 0` for 10 nights
  - the Unbuilder: −1 permanently
- **Day 15 event:** the Masons register a new level, **UNNAMED-0041**, attached to the upper Glass Stair (Appendix A). MAINT announces it. It shows the world growing.

### 6.6 People as part of the food web
Glasshounds hunt people.
- **Raids.** If the Warm Galleries hold 6 or more glasshounds at night and the Seam is **not** in blackout, they find the hatch. The Seam loses `ceil(hounds/6)` people (at most 3). The hounds count as fed that night.
- **Blackout** (a toggle in the Ledger) stops raids and adds no light attention. But no lamps means no moss and no condenser. The choice is: hidden and hungry, or lit and at risk.

### 6.7 Night order (whole world)
1. Seam: consumption and production (section 9).
2. Container effects at the Seam (section 10.3): spoilage, cooling, charging, Signal leaks, lab stimulus.
3. Species update for every level (6.3).
4. Attention decay and sweeps (6.4).
5. Masons: scrap, Burial, the schedule, the new level (6.5).
6. Raid check (6.6).
7. Rumours and knowledge feeds (section 7.4).
8. MAINT log lines for the night.
9. Autosave.

### 6.8 Determinism
All randomness comes from a seeded RNG (mulberry32 is fine) stored in the state. The same state and the same actions must always give the same result. The whole state is plain, JSON-serialisable data.

---

## 7. Knowledge: the tables

### 7.1 Cells have knowledge states
Every fact the UI can show has a state: **unknown** (`???`), **rough** (a band or range, with the day it was seen), or **exact** (with the day it was seen).

| Table | Facts |
|---|---|
| Bestiary | name, size, behaviour, diet (per food), threat, HP, drops, properties, population per level, trend |
| Atlas / Level entry | Survival class line (Safety, Stability, Entities), sites, connections, hazards per site, levers, terminals, Film, Scrap, heat, flooded |
| Catalog: items | name, use, spoil time, bait-for |
| Catalog: relics | each property's value, Class, lab effect, belt effect |

### 7.2 How knowledge is gained

| Source | Reveals |
|---|---|
| Visiting a site | the site, its connections and levers (a lever's effect shows as `???` until pulled once), the Entities band |
| First encounter with a species | name, size, behaviour; its population band for that level |
| Watching a "feeding" event (flavour events on runs) | one diet entry |
| Killing or harvesting | HP, drops |
| A bolt, or LIGHT on the belt | the hazard at a site |
| Stepping into an unrevealed hazard | the hazard, the hard way |
| Surviving a few nights of observation | Stability (level) |
| A Terminal with READ access | exact populations, Film, Scrap, heat, `M` and attention for that level (a snapshot), and the **projected Burial day** |
| The lab (section 10.4) | one relic property per night |
| Using an item once | its hidden uses (for example "bait for grubs") |

**Population bands:** none (0), few (1–5), some (6–20), many (21–80), swarm (81+).

### 7.3 Staleness
Rough and exact values show their age: `some · d12`. On **Unstable** levels, hazard knowledge older than 3 nights reverts to `???`.

### 7.4 Rumours and feeds
- **Rumours.** Villagers turn the hidden state into hints in the Ledger's "Word in the Seam" panel. Examples:
  - hounds in the Galleries ≥ 3 → *"Pell heard claws in the Galleries."*
  - Film in the Galleries below 30% → *"The Galleries have gone cold."*
  - a migration event → *"Something big moved on the Stair."*
- **Feeds.** Levels you've **READ** become subscribed. Every night MAINT reports changes above 25% in their populations: `maint: -213 grub −42% (48h)`.

### 7.5 The Catalog persists
Knowledge is saved separately from the game (`seam-catalog-v1`) and kept when a game ends. Permissions and items are not.

---

## 8. Access: the Signature

**Fragments are presented at any terminal.** A fragment is used up, and access rises for the rest of the game.

| Fragments | Tier | Grants |
|---|---|---|
| 0 | GUEST | The terminal shows MAINT chatter only. |
| 1 | READ | Exact tables for that terminal's level. The level becomes a subscribed feed. You see the Burial projection. |
| 2 | NOTE | Tag sites: tagged caches aren't stripped by Scourers. Subscribe to one more level from any terminal. |
| 4 | WRITE | One write per terminal visit, each adding +30 attention on the target level (see below). |
| 7 | ROOT | After the Vertical Slice (section 17). |

**WRITE actions:**
- **Maintenance hold** (a level): `M = 0` for 10 nights.
- **Disposal request** (a level): Scourers +20 there. They clear Corpses but strip untagged caches.
- **Reroute** (a connection of that level): open or close it.

In the UI, **writable cells show a pencil** in the Level entry table. Editing the world's table is the late-game payoff.

**Fragments in the Vertical Slice:** Drowned Cache (Ducts, only when drained), Reliquary (Choir Hall), the first Auditor Husk, and the UNNAMED-0041 cache. That's four, enough for WRITE if you get all of them.

---

## 9. The Seam: home

### 9.1 The village
- Population starts at **40**, with names from Appendix H.
- **Needs per night:** FOOD `ceil(pop/10)`, WATER `ceil(pop/10)`, POWER 2 for lamps (0 in blackout).
- **Machines** each take 1 POWER per night when running: Moss Racks, Condenser, Cold Locker.
- Consumption draws **items** automatically from the Stores (and from the Cold Locker for food), freshest-last: food that spoils soonest goes first.
- **Shortfall:** each missing FOOD or WATER unit costs one person that night (they leave or die). MAINT is silent about it; the Ledger isn't.

### 9.2 Production
- **Moss Racks:** 2 Moss Cakes (FOOD 1 each) a night if powered.
- **Condenser:** 1 Water Canister (2 WATER) a night if powered.
- **Charger:** turns Empty Cells into Cells. Up to 3 a night if the Galleries conduit is tapped, plus `floor(CHARGE/2)` for each CHARGE relic inside it.
- POWER is paid in **Cells** (a Cell becomes an Empty Cell). **Power is the Seam's central shortage.**

### 9.3 Starting stock
- 12 FOOD's worth (4 Tallow Bricks, 4 Moss Cakes)
- 10 WATER (5 canisters)
- 8 Cells, 4 Empty Cells
- the kit: Bolts ×12, Cutter, Pry Bar, Film Scrapings ×3

### 9.4 The Ledger window
A table with:
- population
- stock / daily need / days left for FOOD, WATER and POWER
- production
- the blackout toggle
- Burial %, with the projected day if known (READ)
- attention for the Seam and for each known level (as bars)
- rumours

---

## 10. Items, properties, containers

### 10.1 One property language
Everything physical speaks the same small language. **Rules act on properties, never on specific items.** This is what gives many results from few rules.

| Property | Range | In short |
|---|---|---|
| HEAT | 0–4 | warms, dries, cooks, resists cold |
| COLD | 0–4 | preserves, numbs, resists heat |
| CHARGE | 0–4 | powers, shocks, attracts eels |
| MASS | −4 to 4 | weighs, anchors, resists gravity; negative is lightness |
| LIGHT | 0–4 | reveals, attracts moths and crabs |
| SIGNAL | 0–4 | talks to the city: attention, terminals, Auditors |
| ROT | −4 to 4 | positive decays neighbours; negative preserves and heals |
| SEAL | 0–1 | blocks its container's contents from affecting the outside |

Items, relics, species and hazards all carry these.

### 10.2 Items
- Items live in **grids**. Each has a size, a stack limit, properties, tags and uses (Appendix C).
- Food spoils: `fresh` counts down one per night unless it's COLD or next to ROT < 0. At 0 it becomes Rotten, which is ROT +1 and spreads to anything it touches.
- **Tool on item:** drag a tool onto an item for an instant change (recipes in Appendix C.3). Example: Cutter on Grub Carcass gives a Tallow Brick. Tools lose `cond` with use.
- **Item on item:** drop one item onto another that it has a recipe with.

### 10.3 Containers at the Seam
Rooms are fixed furniture; only items go in grids.

| Container | Grid | Environment | Effects each night |
|---|---|---|---|
| Stores | 8×5 | none | food spoils normally; loose Signal leaks (+SIGNAL×3 to `A_S`) |
| Cold Locker | 4×3 | COLD 2 (needs 1 POWER) | food doesn't spoil; unpowered, it's just a box |
| Lead Box | 3×2 | SEAL | contents affect nothing outside and leak nothing |
| Charger | 3×2 | CHARGE source | charges Empty Cells (9.2) |
| Lab Bench | 3×3 | a stimulus dial (10.4) | tests one relic property per night |
| Workbench | 4×3 | none | tool-on-item and item-on-item recipes happen here (they also work in the pack) |

**Neighbour effects** (between items in the same container):
- COLD ≥ 1 next to food: that food doesn't spoil.
- HEAT ≥ 2 next to food: +1 spoil.
- ROT > 0: neighbours spoil +1. ROT < 0: neighbours spoil −1.
- CHARGE next to an Empty Cell: it charges when the CHARGE is 3 or more.

Every effect must show as a forecast when you hover or drag, as the workshop toy already does.

### 10.4 The lab: identifying relics
- A relic starts as `Unknown Relic`, with every property `???`.
- Put it on the Lab Bench, set the dial, and End Day. The next morning one property is revealed exactly.

| Dial | Reveals |
|---|---|
| Heat plate | HEAT or COLD |
| Coil | CHARGE |
| Scale | MASS |
| Dark box | LIGHT |
| Receiver | SIGNAL (also adds attention to `A_S` equal to SIGNAL×5: testing is loud) |
| Culture dish | ROT |

- When all properties are known, the relic's **Class** appears: D (curio), C (useful), B (changes a life), A (changes a level). Class is computed from total magnitude and the rarest property.
- The same knowledge also comes, riskier, from **wearing it**. Belt events reveal properties ("the air around you frosts: COLD ≥ 1").

### 10.5 Pack and belt
- **Pack:** a 6×4 grid. It carries things. Only bolts and bait are usable from the pack.
- **Belt:** a **6×1 row**. Items on the belt are **active**: tools work, weapons count, relics apply their belt effects. Long items take belt space (the Rebar Spear is 4 long). This is the Bazaar-style board, and it's the hook for the belt battles planned later (section 17).

**Belt effects come from properties** (so relics never need a second design):

| Property on belt (total) | Effect |
|---|---|
| HEAT n | resist COLD hazards up to n |
| COLD n | resist HEAT hazards up to n |
| CHARGE n | +n fight damage against organic species; eels are drawn to you (encounter weight ×(1+n/2)) |
| MASS n | resist MASS hazards up to \|n\|; negative MASS: moves add no attention |
| LIGHT n | the current site's hazard is revealed when you enter (n ≥ 1); +10% evade per point; moths and crabs are drawn (×(1+n/2)) |
| SIGNAL n | terminals act as READ even at GUEST (n ≥ 2); +10% evade per point against Auditors; +n attention to the level per step |
| ROT n | negative: +1 HP per 2 steps, resist ROT hazards up to \|n\| |
| any relic | **Drift** +1 per step per relic, or +Class bonus (A: +3, B: +2); SEAL items give none |

### 10.6 Drift
- Drift runs 0–100, per runner, and shows in the Kit window.
- It recovers 2 per night at the Seam, and never below the runner's lifetime peak minus 20.
- At 100 the runner is lost.
- Some flavour events and hazards add Drift.
- After the Vertical Slice, Drift thresholds grant **Marks** (mutations, both good and bad).

---

## 11. Runs

### 11.1 The Atlas
The Atlas is a graph of levels (nodes) and connections (edges), drawn in a Win98 window. Each connection has a type, a cost in steps, and a state (open, closed, or `impassable: condition`). Clicking a level opens its **Level entry** (section 13.2).

### 11.2 Sites
Each level holds 5–7 **sites**, connected like a small graph. Vertical Slice layouts are hand-made (Appendix A); UNNAMED-0041 is generated from a template. A site has:
- a type: Gallery, Shaft, Nest, Cache, Terminal, Lever site, Audit Tower, Mason Works, Connection
- a hidden hazard (or none)
- loot rolls, used by Search
- remains (from kills)
- an optional lever or terminal

### 11.3 The Run window
- **The current site card:** a dithered vista (section 13.3), a title, 1–3 lines of text, and the hazard state.
- **Exits** (sites and connections), each with **Throw bolt** (1 bolt: reveals that exit's hazard) and **Go** (with its step cost).
- **Actions:** Search, Harvest (needs the Cutter, on remains), the site's lever or terminal, Camp, Return.
- The pack and belt are shown alongside (drag handling from the workshop).

### 11.4 Hazards
Entering a site with a hazard applies it unless your belt resists it (10.5). Details in Appendix E. Hazards **reroll every 3 nights on Unstable levels.**

### 11.5 Encounters
- **Chance** on entering a site: `1 − exp(−Σ w_s / 40)`, capped at 0.85, where `w_s = N_s(level) × detect_s × draw-multipliers`.
- **Which species:** chosen with weights `w_s`. Group size is `min(N, pack)` × a random factor from 0.5 to 1.5, at least 1.
- **The card** shows the species (or "something" if unknown), the group size, and behaviour. Odds are shown when the relevant facts are known.

| Choice | Resolution |
|---|---|
| **Evade** | `p = clamp(0.75 − 0.12·awareness + LIGHT·0.1 − recentNoise/100, 0.05, 0.95)`. On a fail, the group attacks for one round and attention +10. |
| **Fight** | Up to 3 rounds. You deal `1 + weapon + belt bonus`: kills are `floor(total damage / hp_s)`. The group deals `ceil(threat × alive × 0.5)`. After round 1 you may Evade. Kills lower `N`, leave **remains** at the site, and add corpses to the level. Attention +15, +3 per kill. |
| **Lure** | Needs bait in the pack matching the species' diet (Appendix C). Pick an adjacent site or a connected level. The group moves there; at level scale that's `N −= group` here and `+=` there. Luring onto a hazard or an Audit Tower is a real tactic. |
| **Use** | Item-specific actions (Appendix C/D), for example: *Stub Candle* flare scatters moths and crabs; the *Chime Shard* in front of Auditors. |
| **Back off** | Return to the previous site (costs its step). |

Behaviours:
- **skittish:** flees on sight 50% of the time, so no card
- **territorial:** attacks only in Nests
- **hunter:** always attacks if not evaded
- **scavenger:** ignores you unless you carry remains or food over 4 FOOD
- **indifferent:** the Choir, Masons

### 11.6 Levers
Levers are site actions that change the simulation. They are the heart of play. There are 8 in the Vertical Slice (Appendix F).

Every lever:
- costs a step
- adds attention
- shows its known effect in the Level entry after the first pull

The Level entry also offers a **"what would happen"** projection: the sim runs forward 7 nights on a copy of the world (the workshop's forecast idea at world scale), using **only the numbers the player knows**. Unknown cells show `???`. **Better knowledge gives better projections.** That makes knowledge directly worth having.

### 11.7 Death and caches
- At HP 0 or Drift 100, the pack and belt become a **cache** at that site.
- Scourers strip one item a night if there are 5 or more on the level, unless the site is tagged (NOTE).
- Screen text: *"Oda did not come back."* Pick the next runner from three villagers.

### 11.8 Attention sources (added to the current level)

| Action | Attention |
|---|---|
| Move | +1 (0 with negative MASS on the belt) |
| Bolt | +1 |
| Fight | +15, +3 per kill |
| Failed evade | +10 |
| Lever | per lever (Appendix F) |
| Terminal WRITE | +30 |
| SIGNAL on the belt | +n per step |
| Conduit tap active | +10 per night on the Galleries |
| Unbuilder | set to 100 (an instant sweep that night) |

---

## 12. Voice and writing

### 12.1 MAINT
- Lowercase, timestamped, flat.
- It never says "you". It logs facts, schedules and outcomes.
- It sometimes glitches into almost-feeling, then discards it.
- Format: `[c1284017·d03 night] maint: <line>`

More in Appendix H.

### 12.2 Item and relic text
- Two lines: what it looks like, then what it seems to do.
- Relics add a **finder's quote**, signed by the runner who first brought one home (the game fills this in with the actual runner's name).
- Keep it short: about Souls-style description length.

### 12.3 The Authority's adverts (Frutiger Aero)
- The dead Authority's promotions: glossy, sky-blue and green, bubbles, water, lens flare, cheerful humanist sans-serif.
- They appear:
  - as the boot splash
  - as screensavers on terminals you find
  - as pop-ups when you reach a new access tier
  - as collectible **brochures** (lore items)
- **They are the lie.** Keep them rare, so each one lands. Copy in Appendix I.

### 12.4 Site text
Present tense, second person, one image per line. Example: *"The pipe here is warm as a sleeping animal. Something has licked it clean."*

---

## 13. Presentation

### 13.1 The terminal desktop (STRATA/98)
- The whole game is a salvaged terminal running **STRATA/98**, a Win98-like OS.
- Use **98.css** (npm `98.css`, MIT) for windows, buttons, tabs, trees, tables and progress bars.
- The desktop has icons, a taskbar with the day/step clock, an **End Day** or **Camp** button, and a tray for MAINT balloon notifications.
- **Windows** (draggable, stackable, remembering where they were):

| Window | What it holds |
|---|---|
| **Seam** | the containers: Stores, Cold Locker, Lead Box, Charger, Workbench |
| **Kit** | pack, belt, runner stats (HP, Drift) |
| **Lab** | the Lab Bench grid, the stimulus dial, last night's reading |
| **Atlas** | the level graph and Level entries |
| **Bestiary** | the species table (7.1) with a per-level population sparkline |
| **Catalog** | items and relics, as tables |
| **Ledger** | the village (9.4) |
| **MAINT** | a green-on-black log with scrollback and a filter |
| **Run** | only while you're out (11.3) |
| **Terminal** | when you use one in a level: a nested DOS-like console with commands `read`, `note`, `write …`, `present fragment` |

- **Tables everywhere:** sortable columns, `???` cells in a dithered grey, rough cells in italics with an age tag, exact cells plain, writable cells with a pencil.
- **Tooltips** are Win98 yellow boxes. Every number explains where it came from.

### 13.2 Level entry (Backrooms-style page)
```
WARM GALLERIES   (-213)
Survival class 1 · Safe · Stable · Many entities
────────────────────────────────────────────
<dithered vista>
Heating conduits as wide as streets. Film grows where the pipes sweat.
Sites · Connections · Hazards · Species (bands, trends) · Levers · Terminals
Film 71% · Scrap some · Heat 2 · Masons ██░ · Attention ▓░░░
[what would happen…]
```

### 13.3 Dithering: the reality layer
- **`art/dither.ts`:** Bayer 8×8 ordered dithering of a canvas to a 2–4 colour palette. Scale it up 2–3× with `image-rendering: pixelated`.
- **Palettes per level:**
  - Galleries: `#140b07 #7a3b1c #e39a55 #f6e0b5`
  - Ducts: `#051216 #144652 #5fb3c4 #d9f2f2`
  - Stair: `#0b0b10 #3a3f55 #9aa6c9 #eef1ff`
  - Choir: `#0f0a12 #4b2240 #c46a9a #f7e6f0`
  - The Seam: `#0d0d0b #3c3a2c #a39f7a #efe9cf`
- **`art/vista.ts`:** seeded procedural vistas per site type. Layered silhouettes (colonnades, pipes, stair flights, voids, tiny human figure for scale), a vertical gradient and noise, then dithered. **Scale is the point.** Always include something enormous and something small.
- **Item icons:** rasterise game-icons SVGs (CC BY 3.0, credited, the same pipeline as the workshop) to 32 px, then dither to 1-bit plus the item's colour. The look becomes deliberately pixel-crafted, not glossy.
- **Relic portraits:** a larger dithered icon with a slow palette-cycling shimmer (swap 2 colours every 600 ms). Relics feel alive.

### 13.4 The Aero layer: the lie
Only Authority material uses real gradients, gloss, bubbles, sky and water, rounded panels and a smooth sans. The jump from dithered grit to glossy blue should feel like a sugar rush, and a little sickening.

### 13.5 CRT and motion
- An optional CRT overlay (scanlines, slight curvature, vignette), toggled in a Settings window. Off by default in dev.
- **Motion rules:**
  - window open and close: 120 ms
  - FLIP glides for items (from the workshop)
  - a MAINT balloon slides from the tray
  - a sweep night: the whole desktop flickers once, and the level's Atlas node goes static for a second
  - `prefers-reduced-motion` must turn animation off

### 13.6 Sound (optional in the Vertical Slice)
- A WebAudio drone per level: a low sine plus filtered noise, pitch from palette index.
- Distant Mason thuds at night. The Choir as a chord you hear from the Stair.
- A mute toggle.

---

## 14. Architecture

### 14.1 Layout
```
seam/
  DESIGN.md
  index.html
  tsconfig.json
  scripts/icons.ts           # copies game-icons SVGs named in data (pattern from workshop/scripts/icons.ts)
  sim/cli.ts                 # headless runner (14.5)
  scenarios/*.json           # scripted action lists for tests (Appendix J)
  src/
    main.ts                  # boot: load save, mount desktop
    model/                   # PURE: no DOM, deterministic
      state.ts               # types (14.2), newGame()
      rng.ts
      sim.ts                 # night update (section 6)
      seam.ts                # village needs/production (section 9)
      containers.ts          # grid items: plan/apply drop, stow, send, tidy, split (adapted from workshop/src/world.ts)
      grid.ts                # copied from workshop/src/grid.ts with its tests
      items.ts               # properties, spoilage, recipes, belt effects (section 10)
      run.ts                 # sites, moves, bolts, hazards, encounters, levers, loot (section 11)
      knowledge.ts           # cells, sources, staleness, rumours (section 7)
      access.ts              # fragments, tiers, WRITE (section 8)
      apply.ts               # apply(state, action) -> events: the ONLY way the view changes state
      project.ts             # "what would happen": sim on a knowledge-filtered copy
    data/                    # content (Appendices A–I)
    view/                    # DOM only: windows, tables, grids, run cards, dialogs
    art/                     # dither.ts, vista.ts, icons rasteriser, aero.css
    style.css
```

### 14.2 State (sketch)
```ts
type Prop = 'HEAT'|'COLD'|'CHARGE'|'MASS'|'LIGHT'|'SIGNAL'|'ROT'|'SEAL'
type Props = Partial<Record<Prop, number>>

interface Item { id: number; kind: string; x: number; y: number; rot: boolean; n: number;
  fresh?: number; cond?: number; charge?: number; rotten?: boolean }
interface Grid { w: number; h: number; items: Item[] }

interface LevelState { id: string; F: number; S: number; C: number; heat: 0|1|2; flooded: boolean;
  M: number; mHolds: { until: number; delta: number }[]; A: number; N: Record<string, number>;
  sites: SiteState[]; auditorsUntil?: number; choirSilenced?: boolean }
interface SiteState { id: string; hazard?: string; hazardRolledDay: number; loot: Item[];
  remains: { species: string; n: number }[]; searched: boolean; tagged?: boolean; cache?: Item[] }
interface Connection { id: string; a: string; b: string; cost: number; open: boolean; requires?: 'drained' }

interface Runner { name: string; hp: number; drift: number; driftPeak: number }
interface RunState { level: string; site: string; step: number; path: string[]; recentNoise: number }

interface Knowledge { [factKey: string]: { state: 'rough'|'exact'; value: unknown; day: number } }

interface State {
  version: 1; seed: number; rng: number; day: number; step: number
  pop: number; villagers: string[]; runner: Runner; run?: RunState
  containers: Record<'stores'|'cold'|'lead'|'charger'|'lab'|'workbench'|'pack'|'belt', Grid>
  labDial?: 'heat'|'coil'|'scale'|'dark'|'receiver'|'culture'
  blackout: boolean; conduitTapped: boolean; burial: number; seamA: number
  levels: Record<string, LevelState>; connections: Connection[]
  access: { fragments: number; tier: 'GUEST'|'READ'|'NOTE'|'WRITE'|'ROOT'; subscribed: string[] }
  log: { day: number; text: string; kind: 'maint'|'rumour'|'event' }[]
  flags: Record<string, boolean>   // scripted beats
}
// Knowledge is stored separately (persists across games).
```

### 14.3 Actions
The view only ever calls `apply(state, action)`, which returns events for the UI (animations, log lines, dialogs). Actions include:
- containers: `moveItem`, `splitItem`, `sendItem`, `tidy`, `useToolOn`, `combine`
- home: `setLabDial`, `toggleBlackout`, `endDay`
- runs: `startRun`, `move`, `throwBolt`, `search`, `harvest`, `encounterChoice`, `pullLever`, `camp`, `returnHome`
- terminals: `terminal.read`, `terminal.note`, `terminal.write`, `terminal.present`
- after death: `chooseRunner`

### 14.4 Saves
- `localStorage['seam-save-v1']` holds the State JSON, written at every night.
- `localStorage['seam-catalog-v1']` holds the knowledge.
- Wrap every read and write in try/catch. The game must run without storage.

### 14.5 Headless sim and tests
- `node seam/sim/cli.ts --seed 7 --days 60 [--scenario scenarios/silence-choir.json]` prints a population table per level every 5 nights, plus events (sweeps, migrations, raids, burial).
- Tests are plain node `assert` scripts, the repo's style: `node seam/src/model/*.test.ts`.
- **Required:** grid (copied), containers, sim scenarios (Appendix J), encounters (odds formulas), knowledge (staleness, bands), access (tiers), and that the same seed with the same actions produces the same state.

### 14.6 Dependencies
Allowed: `98.css`. Nothing else at runtime. Icons come from the existing `@iconify-json/game-icons` dev dependency, copied into `seam/src/icons/` by the script, and credited in CREDITS.md.

---

## 15. Milestones (build in this order)

**M0: Scaffold.**
- The `seam/` Vite root, `98.css`, rng, the test script, and `grid.ts` plus its test copied from the workshop.
- ✅ `npx vite seam` shows an empty STRATA/98 desktop with a taskbar clock. Tests pass.

**M1: The world, headless.**
- `state.ts`, `sim.ts` (all of section 6 except raids that need the Seam), the data for Appendices A and B, `cli.ts`, the scenarios.
- ✅ Appendix J scenarios S1–S6 pass. The CLI output reads well.

**M2: Reading the world.**
- The Atlas, Level entry, Bestiary, Ledger (read-only) and MAINT windows, driven by the live state through the knowledge filter.
- **End Day** runs the night.
- Save and load.
- A debug toggle (`?omniscient`) shows every fact.
- ✅ With the debug toggle, running nights visibly moves the tables. Without it, everything is `???` apart from the home levels' Entities bands from rumours.

**M3: The Seam.**
- Containers with the workshop handling (drag, shove, swap, split, shift-send, tidy), items (Appendix C), spoilage, the Cold Locker, the Lead Box, the Charger.
- Village consumption and production, and the blackout toggle.
- Raids (6.6).
- Tool-on-item and item-on-item recipes.
- ✅ A village left alone with the starting stock shows shortfalls in the Ledger by about day 4 and loses people. Blackout stops raids in a scripted test.

**M4: Runs.**
- The Run window, sites, moves and steps, bolts, hazards, encounters (Evade, Fight, Back off), Search and loot, Harvest, remains, Camp, Return.
- Death and caches, and choosing the next runner.
- Knowledge gained from runs (7.2).
- ✅ You can walk the Galleries and the Ducts, fight grubs, get food home, and see the Bestiary fill in. Killing grubs on a run shows up in the next night's numbers.

**M5: Levers and the living world.**
- Lure; the 8 levers (Appendix F); attention and sweeps with Auditor encounters.
- The Choir's song; Masons and Burial; the day-15 new level.
- Terminals at GUEST and READ, and fragments.
- The "what would happen" projection.
- ✅ Scenario S7 passes. In play: silencing the Choir with the bulkhead open leads to hound raids on the Seam within about 10 days, which you can see coming in the Bestiary trends and the rumours.

**M6: Relics and access.**
- The lab and identification, belt effects from properties, Drift, relic Class, all relics in Appendix D.
- NOTE and WRITE, the Unbuilder.
- ✅ Each relic can be identified in 6 nights or fewer. Its belt effect matches its properties with no special-case code, apart from the explicit *Use* actions.

**M7: The look and the voice.**
- Dithering, vistas, pixel icons, relic shimmer, the Aero layer (boot splash, brochures, tier pop-ups), all Appendix H and I text wired in, the CRT toggle, optional sound.
- ✅ A screenshot of any window reads as one authored world.

**Vertical Slice complete** = M0 to M7. A 30-day game, winnable and losable, that teaches itself through its tables.

---

## 16. Vertical Slice checklist (the player's view)

- [ ] I can survive by reading tables and pulling two or three good levers, without fighting much.
- [ ] Doing nothing buries the Seam around days 20 to 26.
- [ ] At least three different strategies work: moth lure plus sabotage, reaching WRITE for holds, and the Unbuilder plus a quiet life.
- [ ] Every relic has a lab use and a belt use, and I had to choose between them at least once.
- [ ] I was surprised by a cascade I caused, and in hindsight I could have predicted it from the tables.
- [ ] The Seam feels like forty people, not one number: names, rumours, losses in the Ledger.
- [ ] I never had to open a spreadsheet outside the game.

---

## 17. After the slice (direction, not specs)

- **Belt battles.** Real fights become Bazaar-style auto-battles on the 6×1 belt: items with cooldowns and neighbour synergies, species as opponent boards. The old `bazaar-like` combat engine is a reference for behaviour, not code to paste.
- **Procedural strata.** The Masons keep adding generated levels from templates. The map grows while you sleep.
- **ROOT and the endings.** Seven fragments open the Root Console deep in the Accretion. What do you ask the city for? (Stop the Masons, restore the Auditors, open the surface, or something stranger.) Keep it somber.
- **Migration.** When Burial is inevitable, pack the whole Seam into grids and move to a Hollow you found. Hoarding and packing decide who survives.
- **Marks.** Drift mutations: benefits with costs, readable in tables.
- **Other pockets.** Other enclaves with needs, barter, rumours and feuds.
- **Automation, earned.** Porter frames, pipe runs and sorters made from Mason plates, linking containers so the Seam runs while you're away. This comes only after a long stretch of hauling by hand.
- **The Choir's secret.** It isn't an animal.

---

## 18. Open questions (decide by playing)

1. Is 12 steps a day the right amount of pressure?
2. Should rough population bands be even rougher (none / some / many), so READ access feels bigger?
3. Is a separate Scourer species enough of a "janitor", or should corpses also attract hounds?
4. Should Drift be visible to the player as an exact number or only as a symptom list?
5. How much should MAINT talk? Start quiet. It gets louder as your access rises.

---

# Appendices: content for the Vertical Slice

## A. Levels

**Connections**

| Id | From | To | Type | Cost | Starts |
|---|---|---|---|---|---|
| hatch | Seam | Warm Galleries | hatch | 1 | open |
| stairs | Warm Galleries | Drowned Ducts | stairs down | 2 | open |
| bulkhead | Warm Galleries | Glass Stair | bulkhead | 2 | **closed** (Pry Bar opens) |
| shaft | Drowned Ducts | Glass Stair | flooded shaft | 3 | passable only when Ducts are drained |
| stairhead | Glass Stair | Choir Hall | stair flight | 3 | open |
| new | Glass Stair | UNNAMED-0041 | fresh accretion | 2 | appears on day 15 |

**Level starting values**

| Level | Floor | Survival class | Heat | Flooded | F / Fmax | S | M | Species (N) |
|---|---|---|---|---|---|---|---|---|
| Warm Galleries | −213 | 1 · Safe · Stable · Many | 2 | no | 300 / 400 | 60 | 1 | grub 80, moth 150, crab 10, scourer 5 |
| Drowned Ducts | −214 | 2 · Unsafe · Stable · Some | 1 | **yes** | 120 / 200 | 30 | 1 | grub 40, crab 12, eel 6, scourer 3 |
| Glass Stair | −212…−189 | 3 · Unsafe · **Unstable** · Many | 1 | no | 150 / 250 | 10 | 0 | grub 50, crab 8, hound 12, scourer 4 |
| Choir Hall | −188 | 4 · Unsafe · Stable · Few (one vast) | 1 | no | 60 / 120 | 5 | 0 | grub 15, crab 6, hound 4, choir 1, scourer 2 |
| UNNAMED-0041 | ? | 3 · Unsafe · Unstable · Some | 0 | no | 40 / 150 | 40 | 1 | crab 5, hound 3, scourer 6 |

**Sites** (`→` marks a connection; *italics* mark a hazard at the start)

- **Warm Galleries:**
  - Hatch (→ Seam)
  - Long Gallery
  - Valve Gallery, with the **Heat Valve** and **Conduit Tap** levers; *Arc Field*
  - Grub Nest (Nest); *Rot Bloom*
  - Mason Works (**Moth Lure** and **Sabotage** levers)
  - Stairs Down (→ Ducts)
  - Bulkhead (→ Stair; **Bulkhead** lever)
- **Drowned Ducts:**
  - Stairs Up
  - Flooded Hall (eels live here)
  - Pump Office (**Terminal**)
  - Sluice Room (**Sluice** lever)
  - Drowned Cache (reachable only when drained; Signature Fragment and a relic roll)
  - Flooded Shaft (→ Stair when drained); *Frost Vent*
- **Glass Stair:**
  - Bulkhead Landing (→ Galleries)
  - Middle Landing
  - Glass Fall; *Glass Rain*
  - Hound Den (Nest)
  - Audit Tower 7 (**Tower** lever)
  - Shaft Mouth (→ Ducts)
  - Upper Landing (→ Choir Hall; → UNNAMED-0041 from day 15); *Gravity Well*
- **Choir Hall:**
  - Stair Head
  - Nave (the Choir is encountered here)
  - Pipe Organ (**Resonance Pipe** lever); *Signal Hum*
  - Console (**Terminal**)
  - Reliquary (Cache: Signature Fragment, the **Unbuilder**, 2 relic rolls)
- **UNNAMED-0041** (generated from a template): 5 sites in a line, all with fresh vistas.
  - Raw Floor
  - Scaffold
  - Unlit Room; *Gravity Well*
  - Mason Nest (Mason Works, M 1)
  - Sealed Office (Cache: Signature Fragment, relic roll)

**Level text:**
- **Warm Galleries:** "Heating conduits as wide as streets. Film grows where the pipes sweat, and everything that lives here lives on the film."
- **Drowned Ducts:** "The water is warm and perfectly still. Your lamp shows a second ceiling beneath it. Things move between the two."
- **Glass Stair:** "A flight of stairs that climbs for twenty floors through a shaft of cracked glass. It sings in the wind from below. Sometimes the steps are somewhere else."
- **Choir Hall:** "A nave built for a congregation of thousands. Something at the far end is singing, and has been for a very long time."
- **UNNAMED-0041:** "It wasn't here last week. The concrete is still warm. The lights are already on."

## B. Species

| Id | Name | Mass | Diet (weight) | r | d | Vuln | Migrates | Habitat | Detect | Pack | Aware | Threat | HP | Behaviour | Props | Drops (Harvest) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| grub | Tallow Grub | 1 | film 1 | 0.25 | 0.30 | 0.5 | yes | any | 0.3 | 6 | 0 | 0 | 2 | skittish | ROT 1 | Grub Carcass (whole), or Tallow Brick with the Cutter |
| moth | Rust Moth | 0.2 | scrap 1 | 0.35 | 0.40 | 0.4 | yes | any | 0.05 | 20 | 1 | 1* | 1 | hunter (as a swarm: one encounter) | ROT 1 | nothing (dust) |
| crab | Lantern Crab | 2 | moth 0.7, film 0.3 | 0.12 | 0.20 | 0.3 | no | any | 0.5 | 2 | 1 | 1 | 4 | territorial | LIGHT 2 | Crab Shell |
| eel | Cable Eel | 4 | grub 0.6, crab 0.4 | 0.08 | 0.15 | 0.2 | no | flooded | 0.6 | 1 | 2 | 3 | 8 | hunter | CHARGE 2 | Live Wire |
| hound | Glasshound | 6 | grub 0.5, crab 0.3 | 0.10 | 0.20 | 0.15 | yes | any | 1.0 | 4 | 3 | 3 | 10 | hunter | COLD 1 | Glass Tooth ×2 |
| choir | The Choir | 80 | hounds (by song, 6.3.7) | 0 | 0 | 0 | no | Choir Hall | Nave only | 1 | 2 | 8 | 120 | indifferent | SIGNAL 3, CHARGE 3 | Choir Heart (when silenced) |
| scourer | Scourer | 1 | corpses 1 | (spawned) | 0.50 | 0.4 | yes | any | 0.4 | 8 | 1 | 1 | 3 | scavenger | ROT −2 | nothing |
| auditor | Auditor | — | — | — | — | — | — | sweeps | 5 (after a sweep) | 3 | 3 | 6 | 30 | hunter (unless authorised) | SIGNAL 3 | Auditor Husk (sometimes a fragment) |
| mason | Mason | — | — | — | — | — | — | Mason Works | — | 1 | 0 | 4 | 60 | indifferent (hits back) | MASS 2 | Mason Plate |

\* Rust Moth damage: −10 `cond` to every metal tool on the belt instead of HP.

**Bestiary text:**
- **Tallow Grub:** "Pale, soft, the length of a forearm. It eats the film and becomes fat. Everything eats it. You will too."
- **Rust Moth:** "A cloud of flakes that turns out to be alive. Wherever the Masons shed metal, they come to eat it, including off your tools."
- **Lantern Crab:** "Carries its light in its back like a grudge. Eats moths; hates company."
- **Cable Eel:** "Two metres of muscle that hums. It lives in the flooded ducts and anything that touches the water is its business."
- **Glasshound:** "Long, cold, quiet, and never alone. The Choir keeps them few. Nobody knows what would keep them few without it."
- **The Choir:** "It does not move. It sings, and hounds walk to it from floors away, and do not walk back."
- **Scourer:** "The city's janitors. Printed where the dead pile up; gone when the floor is clean. They don't distinguish between a corpse and a pack left lying on the floor."
- **Auditor:** "Tall, thin, polite. It asks for your Signature. It does not ask twice."
- **Mason:** "A walking building site. It has never seen you. It never will."

## C. Items

### C.1 Supplies, materials, tools

| Id | Name | Size | Stack | Props / values | Fresh | Uses and ways out |
|---|---|---|---|---|---|---|
| tallow | Tallow Brick | 1×1 | 4 | FOOD 2 | 8 | eaten; bait for scourers |
| moss | Moss Cake | 1×1 | 4 | FOOD 1 | 3 | eaten |
| grubCarcass | Grub Carcass | 2×1 | 1 | FOOD 1, ROT 1 | 2 | eaten raw; Cutter makes a Tallow Brick; bait for hounds and eels |
| water | Water Canister | 1×2 | 1 | WATER 2 | — | drunk |
| cell | Cell | 1×1 | 4 | POWER 1 | — | burned for light and machines, becoming an Empty Cell |
| emptyCell | Empty Cell | 1×1 | 4 | — | — | charged in the Charger |
| film | Film Scrapings | 1×1 | 5 | FOOD 0 | 3 | bait for grubs and crabs |
| scrap | Scrap | 1×1 | 6 | MASS 1 | — | bait for moths (Moth Lure lever); Workbench recipes |
| liveWire | Live Wire | 1×2 | 1 | CHARGE 1 | — | needed for the Conduit Tap |
| glassTooth | Glass Tooth | 1×1 | 8 | COLD 1 | — | Glass Spear recipe |
| crabShell | Crab Shell | 2×2 | 1 | LIGHT 1 | — | Cutter makes a Shell Lamp |
| masonPlate | Mason Plate | 2×2 | 1 | MASS 2 | — | Pry Bar makes Scrap ×4 |
| bolt | Bolt | 1×1 | 12 | MASS 1 | — | thrown to reveal a hazard (50% can be picked up again when you enter that site) |
| cutter | Cutter | 1×2 | 1 | cond 100 | — | Harvest; tool-on-item; Resonance Pipe lever |
| prybar | Pry Bar | 1×3 | 1 | cond 100 | — | Bulkhead, Sabotage; Mason Plate → Scrap |
| rebarSpear | Rebar Spear | 1×4 | 1 | weapon +2 | — | Fight (on the belt) |
| glassSpear | Glass Spear | 1×4 | 1 | weapon +3, COLD 1 | — | Fight (on the belt) |
| shellLamp | Shell Lamp | 2×1 | 1 | LIGHT 1 | — | belt light (no power needed; dims: −1 LIGHT after 10 runs) |
| brochure | Authority Brochure | 1×1 | 1 | — | — | lore (opens an Aero page); SIGNAL 0 |

### C.2 Bait
Bait matches a species' diet: grub ← film; crab ← film; moth ← scrap; eel ← grubCarcass; hound ← grubCarcass or tallow; scourer ← any rotten item or tallow.

### C.3 Recipes (tool on item, or item on item)

| Drag | Onto | Gives | Tool wear |
|---|---|---|---|
| Cutter | Grub Carcass | Tallow Brick | −2 |
| Cutter | Crab Shell | Shell Lamp | −5 |
| Pry Bar | Mason Plate | Scrap ×4 | −5 |
| Glass Tooth ×3 (a pile) | Rebar Spear | Glass Spear | — |
| Live Wire | Empty Cell | Cell (the Live Wire is used up) | — |

## D. Relics

Every relic's belt effect comes from its properties (10.5). Anything extra is listed as *Use*.

| Id | Name | Class | Size | Props | Lab / home effect | *Use* |
|---|---|---|---|---|---|---|
| stillCoil | Still Coil | C | 1×1 | COLD 2 | neighbouring food doesn't spoil (a fridge without power) | — |
| stubCandle | Stub Candle | C | 1×1 | LIGHT 2, HEAT 1 | lights the Seam: counts as 1 POWER for lamps | *Flare* (once a day): moths and crabs scatter, group removed from the site |
| hollowPair | Hollow Pair | B | 2×1 | MASS −2 | nothing, until you notice the scale reads less with it nearby | — |
| hummingKnot | Humming Knot | B | 1×1 | CHARGE 3 | in the Charger: +1 Cell a night | — |
| wetLung | Wet Lung | C | 1×2 | ROT −2 | neighbouring food spoils 1 night slower | — |
| chimeShard | Chime Shard | B | 1×1 | SIGNAL 3 | loose at the Seam: +9 `A_S` a night (keep it in the Lead Box) | *Present*: an Auditor pauses; evade automatically once, then the shard cracks to SIGNAL 1 |
| choirHeart | Choir Heart | A | 2×2 | CHARGE 4, SIGNAL 2 | in the Charger: +2 Cells a night; loose: +6 `A_S` a night | — |
| unbuilder | Unbuilder | A | 1×3 | MASS 3, SIGNAL 2 | — | *Fire* (1 charge) at a Mason Works: that level's `M` −1 permanently; everything at the site dies; attention 100 |
| fragment | Signature Fragment | — | 1×1 | SIGNAL 1 | — | *Present* at a terminal (8) |

**Relic rolls** (Cache sites): stillCoil 25, stubCandle 25, wetLung 20, hollowPair 15, hummingKnot 10, chimeShard 5. The Choir Heart and Unbuilder are fixed placements.

**Relic text:**
- **Still Coil:** "A spring of dull metal wound so tight it hums below hearing. Frost grows on its inside, never its outside." Finder's quote: *"Kept my fish a week. Kept my hand numb a month."*
- **Stub Candle:** "A candle end, lit, that has not gotten shorter since anyone has owned it. The flame leans toward exits." Finder's quote: *"It doesn't want to go out. I don't blame it."*
- **Hollow Pair:** "Two copper discs, a hand apart, held by nothing. Put your finger between them and feel nothing, very firmly." Finder's quote: *"Lighter to carry than it should be. So is everything near it."*
- **Humming Knot:** "A fist of wire tied in a knot that has no ends. It is warm, and it wants to touch other metal." Finder's quote: *"The cells fill up by morning. So do my teeth, with that sound."*
- **Wet Lung:** "Grey, soft, and breathing, slowly, on its own. Things near it keep." Finder's quote: *"I sleep with it by the bread. Don't tell anyone."*
- **Chime Shard:** "A sliver of something that rings when nobody touches it. Terminals wake up when it's near." Finder's quote: *"The tall ones stopped and listened to it. Then they looked at me."*
- **Choir Heart:** "It is still singing, very quietly, to no one." Finder's quote: *"We have light now. We don't talk about how."*
- **Unbuilder:** "A Mason's tool, maybe, or a Mason's opposite. Holding it makes the floor feel temporary." Finder's quote: *"I used it once. The quiet afterwards was the loudest thing I've heard."*

## E. Hazards

| Id | Name | Prop | Level | Effect if not resisted | Reveal text |
|---|---|---|---|---|---|
| arc | Arc Field | CHARGE | 2 | HP −3; each charged Cell in the pack has a 50% chance to drain | "The bolt jumps sideways and sparks before it lands." |
| rotBloom | Rot Bloom | ROT | 2 | HP −1; food in the pack spoils 2 nights | "The bolt lands soft, and comes up furred." |
| frost | Frost Vent | COLD | 2 | HP −2 (food in the pack gets +1 fresh, a small mercy) | "The bolt rings like it's frozen." |
| glassRain | Glass Rain | MASS | 2 | HP −3 | "Something above lets go of a shard for every sound you make." |
| gravity | Gravity Well | MASS | 3 | HP −4; the heaviest pack item is dropped at the site | "The bolt falls faster than it should, and doesn't bounce." |
| signalHum | Signal Hum | SIGNAL | 2 | attention +20; Drift +5 | "The bolt hums on landing, and something far away hums back." |

Resisting: the belt's total of the matching property (for MASS, the absolute value of a negative) must be at least the hazard's level.

## F. Levers

| Id | Site | Needs | Effect | Attention |
|---|---|---|---|---|
| heatValve | Valve Gallery | — | Galleries heat switches 2 ↔ 0 | +5 |
| conduitTap | Valve Gallery | Live Wire (used up) | the Seam's Charger gets up to 3 Cells a night; toggle off anytime | +10 per night while on |
| bulkhead | Bulkhead (either side) | Pry Bar (cond −10) | opens or closes Galleries ↔ Stair | +10 |
| sluice | Sluice Room | — | Ducts drained ↔ flooded (eels die off while drained; the shaft and Drowned Cache become reachable) | +10 |
| mothLure | Mason Works | Scrap ×3 (used up) | 40% of the level's moths move here; that level's `M` −1 for 10 nights; the moth population booms on the scrap | +5 |
| sabotage | Mason Works | Pry Bar (cond −20) | `M` −1 for 3 nights; Mason encounter, 50% | +25 |
| tower | Audit Tower 7 | SIGNAL ≥ 1 on the belt | Stair `A` +60 (a sweep tonight if it reaches ≥ 100). **Leave before night.** | as stated |
| resonancePipe | Pipe Organ | Cutter (cond −30) | **silences the Choir**: no more song; it dies over 10 nights and then drops the Choir Heart at the Nave | +40 |

**The terminal** (Pump Office, Console, and a MAINT kiosk at UNNAMED-0041 only after WRITE): commands as in section 8.

## G. Loot tables (Search, 2–4 rolls)

| Level | Table |
|---|---|
| Galleries | Scrap 30, Empty Cell 20, Film Scrapings 20, Cell 10, Tallow Brick 10, Bolt ×3 10 |
| Ducts | Water Canister 25, Cell 20, Scrap 15, Empty Cell 15, Brochure 10, Relic roll 5, Bolt ×3 10 |
| Stair | Glass Tooth 25, Cell 15, Scrap 15, Relic roll 15, Brochure 10, Water Canister 10, Bolt ×3 10 |
| Choir Hall | Relic roll 30, Cell 20, Brochure 20, Glass Tooth 15, Water Canister 15 |
| UNNAMED-0041 | Mason Plate 30, Scrap 25, Cell 20, Relic roll 15, Brochure 10 |

A site can be searched once. Nests: Harvest on remains only. Caches are fixed (Appendix A).

## H. MAINT lines and villager names

**Villager names (40):** Oda, Pell, Marrow, Ines, Tamsin, Kett, Lio, Ashe, Brann, Mirel, Sef, Quill, Hollis, Wren, Dace, Imre, Tove, Rook, Sabel, Fenn, Carra, Joss, Lune, Maud, Nils, Orla, Piet, Rhee, Sato, Tibb, Ulla, Vey, Wick, Yann, Zora, Abe, Bel, Cato, Dru, Elka.

**MAINT (examples; build more in the same voice):**
```
maint: stratum -213 thermal nominal. film coverage 71%.
maint: unregistered biomass detected: 38 units. logging. not actioning.
maint: accretion schedule advanced: -213 +1 course. registered residents affected: 0.
maint: audit tower 7 reports noise. escalation pending.
maint: sweep complete. 214 units reclassified as debris. disposal requested.
maint: disposal complete. floor clean. thank you for keeping the accretion tidy.
maint: signature fragment presented. 1 of 7. access: READ. welcome, [NAME NOT FOUND].
maint: it has been 11,408 years since the last authorised login.
maint: hello? (query malformed. discarding.)
maint: new stratum registered: UNNAMED-0041. occupancy: 0. lighting: on.
maint: choir resonance lost. -188 acoustic profile: silent. this was not scheduled.
maint: glasshound density -213: 7. predator control: none assigned.
maint: residence detected between -213 and -214. no permit on file. (logging.) (not actioning.) (yet.)
maint: maintenance hold accepted. masons idle. productivity -100%. is this intended? y/n
maint: n
maint: understood.
```

**Rumours (Word in the Seam):**
- "Pell heard claws in the Galleries."
- "The Galleries have gone cold. The film's gone grey."
- "The water in the Ducts went down in the night. Sabel says there's a door under it."
- "Something big moved on the Stair."
- "It's too quiet up past the Stair. The singing stopped."
- "Kett swears the hatch was warm this morning. Masons, she says."

**Site text samples:**
- Long Gallery: "The pipe here is warm as a sleeping animal. Something has licked it clean."
- Grub Nest: "The floor gives slightly underfoot. It is not the floor."
- Flooded Hall: "Your lamp finds the water and the water finds your lamp."
- Middle Landing: "Two hundred steps up, two hundred down. The glass shows you from every side."
- Nave: "The song arrives before the sight of it, and stays after you stop listening."
- Raw Floor: "No dust. No footprints. Yours are the first."

## I. The Authority's adverts (Aero copy)

- **Boot splash:** "STRATA/98 · licensed by the ACCRETION AUTHORITY · *Building Tomorrow, Forever.*"
- **READ tier pop-up:** "Welcome back, Citizen! Your Signature makes the city *yours*. See more. Know more. Belong."
- **Brochure 1:** "Your stratum has been selected for **Expansion**! More space. More light. More life. Relocation is automatic."
- **Brochure 2:** "HYDRA·LUX Film Farms: clean warmth, living walls, and a snack in every corridor."
- **Brochure 3:** "Masons never sleep, so you can. 🌿"
- **Brochure 4:** "Lost your Signature? Don't worry! An Auditor will be with you shortly."
- **WRITE tier pop-up:** "Congratulations! You are now a Contributor. Every edit makes the Accretion better."

Style: sky gradients (`#bfe8ff → #eaf8ff`), glossy pill buttons, water bubbles, grass-green accents (`#7ed957`), soft white panels with a highlight, a humanist sans (`Frutiger, "Segoe UI", "Myriad Pro", sans-serif`), and a subtle lens flare.

## J. Scenario tests (sim, headless, seed 7)

Compare against the baseline (S1) at the same night unless stated. Tolerances are part of the tuning job.

| Id | Script | Assert |
|---|---|---|
| S1 | no actions, 60 nights | no species goes extinct on its starting level; every starting population ends between 0.4× and 2.5× its start |
| S2 | silence the Choir on night 5 | Stair hounds on night 25 ≥ 2× S1's Stair hounds on night 25 |
| S3 | S2, plus open the bulkhead on night 5 | Galleries hounds ≥ 6 by night 30; at least one Seam raid by night 35 (no blackout) |
| S4 | close the Heat Valve on night 3 | Galleries Film ≤ 30% of S1 by night 10; Galleries grubs ≤ 40% of S1 by night 15 |
| S5 | drain the sluice on night 3 | Ducts eels ≤ 10% of their start by night 8; Ducts scourers ≥ 3× their start on some night between 4 and 12 |
| S6 | set Stair `A` = 100 on night 10 | Stair hounds on night 11 ≤ 45% of night 10; Stair scourers rise over nights 11–15 |
| S7 | Burial | no actions: buried between nights 20 and 26. With a hold on the Galleries on nights 6 and 16 and a moth lure on night 10: Burial < 100 on night 30 |
| S8 | determinism | any scenario run twice from seed 7 gives byte-identical final state JSON |

---

*Build it small, play it early, and let the tables surprise us.*
