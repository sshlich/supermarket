# SEED: the station data set

The brief every worker reads, with `ids.json` (the reserved registry) and `/Users/sshlich/Projects/supermarket/STATION.md`
(the agreed design). Nothing in this data set is final design: it is a large, consistent first pass for the user to inspect,
visualise, simulate and react to. Volume and connectivity matter more than polish, but every entry must be valid and
must connect.

## 1. Goals, and what "done" looks like

1. **Everything in data.** Items, materials, machines, recipes, discs, programs, statuses, modifiers, upgrades, residents,
   orders, events: plain JSON, no code, no comments.
2. **A closed matter loop with ports.** Matter is conserved inside recipes (section 7.1). It enters only through declared
   inflows (haul, crates, sellers, salvage, mail, company) and leaves only through declared outflows (the vent port,
   exported parcels, the tithe, residents consuming needs). Credits are not conserved: wages in, rent and tithe out.
   Energy comes in as cell charge (the charger, billed at the power price) and leaves as heat (not modelled as matter).
3. **Dense connectivity.** Every item has a source and a use; every machine and disc is obtainable and unlocks
   something; every upgrade's requirements can be met; every need, deck and system is wired to items, people and events.
4. **Done** = `node data/station/validate.mjs` prints **0 errors** with all files present, counts are inside the target
   ranges (section 9), and warnings are few and explainable (left as `notes` on the entry).

## 2. The model in one page

| Quantity | Unit | Notes |
|---|---|---|
| Matter | material units (`mat_*`), decimals to 0.01 | An item's `composition`. 1 unit is roughly a hand-sized lump. |
| Worth | credits, decimals to 0.01 | `value` is the base worth at price index 1.0. Market price = value x the index of the item's `market_need`. |
| Energy | integer points per day (start 7) | The player's. Spent to start a machine job *now*. Overnight jobs cost 0 energy but hold the machine till morning. |
| Cell charge | charge units | Machines' fuel. A cell item has `cell.capacity`; a job drains `cells` charge. Charger refills for credits. |
| Time | days, nights | No clock. A job is `instant` (hands), `job` (energy now or free overnight), or `nights` (only overnight, N nights). |
| Need | resident-days | 1 need unit = one resident's daily need. A ration bar is `need_food: 0.5`. |

Loops (STATION.md section 10): matter (scrap -> recycler -> materials -> machines -> goods -> sold, worn, scrap); power (cells
-> machines -> charger); need (residents drain gauges, gauges set prices, sales refill them); orders (mail -> stock ->
box -> dock -> pay on delivery); growth (net -> upgrades -> machines and discs -> wider loops).

Phases (ECONOMY.md section 6): `phase_1` Scraps, `phase_2` Trade, `phase_3` Workshop, `phase_4` Concern. Item `tier` 1-4
matches the phase where the item first matters; a typical item's worth is about x4 per tier (4 / 16 / 64 / 256).
Upgrade prices follow ECONOMY.md's x10 per phase (`ids.json` phases[].upgrade_cost).

## 3. Files and who owns them

All files live in `data/station/`. **One owner per file; never write another worker's file.** Each file is one JSON
array of objects (except `start.json`, one object). Domain files are split so parallel workers never collide.

| File | Owner (task) | Holds |
|---|---|---|
| materials.json, needs.json, systems.json, decks.json, phases.json, boxes.json, carriers.json | 1-core | the frame |
| items.core.json, recipes.core.json | 1-core | raw inflows, unit items, waste; crusher, digester, vent recipes |
| items.food.json, recipes.food.json, discs.food.json | 2-food | food: hydro, vat, galley, cutting |
| items.life.json, recipes.life.json, discs.life.json | 3-life | water and air: purifier, electrolyser, scrubber, algae |
| items.fab.json, recipes.fab.json, discs.fab.json | 4-fab | metals, polymer, glass, parts, tools |
| items.tech.json, recipes.tech.json, discs.tech.json, programs.json | 5-tech | cells, electronics, devices, computers, programs, blank media |
| items.med.json, recipes.med.json, discs.med.json | 6-med | medicine and chemistry |
| items.lux.json, recipes.lux.json, discs.lux.json | 7-lux | comfort, luxury, heirlooms, contraband fire, paper, cloth, drink |
| machines.json, statuses.json, modifiers.json, items.mach.json, recipes.mach.json, discs.mach.json | 8-machines | machines, statuses, modifiers, machine consumables, machine-building and generic do/modify recipes |
| upgrades.json, start.json, items.fit.json, recipes.fit.json | 9-progression | sinks, the start state, placed fittings |
| residents.json, orgs.json, orders.json, events.json | 10-people | people, mail, events and rumors |

`*.example.json` files are illustrations; the validator ignores them unless run with `--examples`.

## 4. IDs

- **Form:** lowercase snake_case, `^[a-z][a-z0-9_]*$`, at most 40 characters, English, no numbers unless they mean
  something (`ctier_2`, `cell_s`).
- **Prefix per type** (table in `ids.json` `namespaces`): `mat_ need_ sys_ deck_ phase_ box_ ctier_ it_ rcp_ disc_ mach_
  stat_ mod_ prog_ upg_ res_ org_ ord_ evt_`.
- **Items, recipes and discs carry their domain** after the type prefix: `it_food_ration_bar`, `rcp_fab_roll_sheet`,
  `disc_med_analgesics`. A worker may only create IDs inside its own domain prefix (`ids.json` `domains`).
- **Reserved IDs** (`ids.json`): materials, needs, decks, phases, systems, boxes, carrier tiers, residents, orgs, all 50
  machines, all 64 discs, 22 programs, key statuses and modifiers, and about 100 shared items. Anyone may reference them.
  The owner must define every reserved ID in its file and **copy the pinned fields exactly** (name may be refined; `w`,
  `h`, `tier`, `depth`, `value`, `composition`, and for machines `kind`, `phase`, `tray`, `max_inputs`, `transmutes`,
  `port`, `generic`, `virtual`). The validator errors on a mismatch.
- **Referencing another worker's IDs:** only reserved IDs, plus anything in a file that already exists when you start
  (wave B, section 12). Never guess an unreserved ID in someone else's domain. If you need a thing that is not
  reserved and not yours, make your own version inside your domain, or leave a `notes` line saying what you wanted.
- Workers may add more machines, statuses, modifiers or programs only if they own that file; new discs only inside their
  own `disc_<domain>_` prefix.

## 5. Common types

| Type | Shape | Rule |
|---|---|---|
| `Ref` | string ID | Must resolve to an entity defined in a file, or reserved in `ids.json`. |
| `Qty` | `{ "id": Ref, "qty": int >= 1 }` | Items, discs, boxes, machines. Optional `"chance": 0-1` on recipe outputs only. |
| `Composition` | `{ "mat_x": number > 0, ... }` | Material units, 2 decimals max. Every thing has one (machines, discs, boxes too), except `mach_hands`. |
| `Effect` | `{ "stat": key, "op": "add"\|"mul"\|"set", "value": number, "scope": {...}?, "text": "..." }` | `stat` from `ids.json` `stats`. `scope` may hold `deck`, `need`, `machine`, `tag`, `item`. `text` is the visible number, e.g. "+1 energy per day". |
| `Requires` | `[Ref, ...]` | AND of conditions. Allowed prefixes: `phase_` (phase reached), `mach_ disc_ it_ prog_` (you own one), `upg_` (bought), `ctier_` (tier reached). |
| `Phase` | `"phase_1"`..`"phase_4"` | |
| `Tier` | int 1-4 | |
| `Depth` | int 0-4 | Processing steps that matter: 0 raw, 1 processed, 2 made, 3 assembled, 4 top. |

### 5.1 The thing core (items, machines, discs, boxes all have it)

| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | Ref | yes | |
| `name` | string | yes | 1-3 words, Sentence case. |
| `desc` | string | yes | One line, at most 110 characters (section 11). |
| `w`, `h` | int 1-8 | yes | Footprint on the grid. Respect existing sizes (`src/kinds.json`); a named footprint is fixed. |
| `tier` | Tier | yes | |
| `value` | number >= 0 | yes | Base worth in credits. |
| `composition` | Composition | yes | |
| `tags` | [string] | yes | From `ids.json` `tags` (unknown tags warn). |
| `notes` | string | no | Free text for the user: doubts, alternatives, why a warning is fine. |

## 6. Schemas

### 6.1 materials.json (`mat_`)
`id, name, desc, state ("solid"|"liquid"|"gas"), base_value (pinned), unit_item (pinned), inflow: [channel], outflow: [ "vent"|"export"|"tithe"|"consumed" ], recycle_rate (0-1, default 0.9), notes`.
`inflow` channels are the keys of `ids.json` `inflow_channels`.

### 6.2 needs.json (`need_`)
`id, name, desc, old_tags (pinned), gauge_start (0-1), per_capita (need units per resident per day, usually 1), price_floor (0.5), price_cap (2.5), elasticity (0.5-2: how hard a shortage moves price), systems: [sys_], shortage_text, glut_text`.

### 6.3 systems.json (`sys_`)
The station's own big plant, off the field. Events break them; their output feeds the gauges.
`id, name, desc, deck, supply: [{ "need": need_, "share": 0-1 }]` (share of daily demand covered when healthy; per need the shares across systems sum to 0.7-0.95, the rest is the market's gap that the player fills), `repair_items: [it_ Ref]` (what the station buys when it breaks; orders use this), `notes`.

### 6.4 decks.json (`deck_`)
`id, name, desc, wealth (pinned), population_share (pinned), transit_days (pinned), wants: { need_: weight 0-3 }, prefers_tags: [tag], avoids_tags: [tag], contraband_tolerance (0-1), notes`.

### 6.5 phases.json (`phase_`)
`id, name` plus every pinned field in `ids.json` `phases`, plus `budget_scale` (resident budget multiplier: 1, 4, 16, 64), `orders_per_day` [min,max], `events_per_day` (about 1), `unlock_text` (what reaching it feels like), `notes`.

### 6.6 boxes.json (`box_`)
Thing core (pinned w, h, composition) plus `inner_w, inner_h, price, fee` (pinned), `max_contents_value` (optional cap), `tags` includes `"container"`, `"packaging"`. Boxes are bought ahead (inflow `crate`) and filled by hand. A box ships only sealed (`mod_sealed`) and with an order slip (`it_tech_slip`) inside.

### 6.7 carriers.json (`ctier_`)
`id, name, spend (pinned), pickups_per_day, transit_delta_days (<= 0), fee_mult (<= 1), effects: [Effect], desc`.

### 6.8 Items: items.<domain>.json (`it_<domain>_`)
Thing core, plus:

| Field | Type | Req | Notes |
|---|---|---|---|
| `depth` | Depth | yes | |
| `market_need` | need_ | yes | The gauge its price follows (a bar follows `need_parts`, a wine `need_luxury`). |
| `needs` | `{ need_: amount }` | no | What it serves when a resident consumes it (resident-days). Present = residents buy it to use it. |
| `decks` | `{ deck_: weight 0-3 }` | no | Where demand is (default from deck wants). |
| `value_basis` | `"craft"`\|`"rarity"` | no | Default craft. Rarity skips the value-depth check (heirlooms, art). |
| `contraband` | `false` or a class from `contraband_classes` | no | Default false. |
| `heirloom` | bool | no | Old, unmakeable or nearly so; value by rarity. |
| `inflow` | `{ "channel": key, "phase": Phase, "decks": [deck_]? }` | no | Declares a source from outside the loop. |
| `wear` | `{ "uses": int, "becomes": it_ Ref \| null }` | no | Tools and filters: one use per job it is a `tool` in. `null` = it is used up (to sludge). |
| `use` | `{ "target": "self"\|"machine", "effects": [Effect], "adds": [stat_], "clears": [stat_], "consumed": bool }` | no | Eating, stims, coolant on a machine. |
| `cell` | `{ "capacity": number }` | no | Power cells only. |
| `container` | `{ "slots": [{ "name", "w", "h", "accepts_tags": [tag]? }], "fill": [Qty]? }` | no | Composition is the empty shell. `fill` is what it holds when new. |
| `fixture` | `{ "effects": [Effect] }` | no | Placed fittings (bunk, display case). Effect applies while placed on the field. |
| `recyclable` | bool | no | Default true. |
| `carried_from` | string | no | The old `src/kinds.json` key (section 10). |
| `mods` | [mod_] | no | Modifiers this item commonly carries or can take. |

Filled vessels are separate items whose composition includes the vessel (`it_lux_wine` includes its glass). A recipe that
empties one returns the empty vessel as an output.

### 6.9 machines.json (`mach_`)
Thing core (machines are placed things) plus the pinned registry fields, plus:

| Field | Type | Notes |
|---|---|---|
| `kind` | `"produce"`\|`"modify"`\|`"do"` | Pinned. |
| `phase` | Phase | Pinned. When it can first be had. |
| `tray`, `max_inputs`, `transmutes`, `port`, `generic`, `virtual` | | Pinned (section 7.1, 7.4). |
| `slots` | `[{ "name", "role": "input"\|"output"\|"cell"\|"tray"\|"tool"\|"consumable", "w", "h", "accepts_tags": [tag]? }]` | Like the furnace's crucible and firebox. |
| `cells_per_job` | number | Default drain if a recipe gives none. |
| `energy_per_job` | int 0-4 | Default energy if a recipe gives none. |
| `jobs` | `["job"\|"nights"]` | Which time modes it runs. |
| `statuses` | [stat_] | Statuses it can get. |
| `consumables` | [it_] | Things its tool/consumable slots take (filters, lamps, coolant). |
| `effects` | [Effect] | Passive effects while placed and powered (radio, modem, broadcaster). |
| `upgrades_to` | mach_ \| null | The next model (vat -> industrial vat). |
| `requires` | Requires | Unlock requirement beyond phase (e.g. a carrier tier). |

### 6.10 Recipes: recipes.<domain>.json (`rcp_<domain>_`)

| Field | Type | Req | Notes |
|---|---|---|---|
| `id, name` | | yes | Name says the verb: "Smelt iron", "Cut cheese wheel". |
| `kind` | `"produce"`\|`"modify"`\|`"do"` | yes | |
| `machine` | mach_ | yes | `mach_hands` for hand work. |
| `disc` | disc_ \| null | yes | Required disc in the tray. The machine must have `tray: true` and the disc must list the machine. |
| `inputs` | [Qty] | yes | Consumed. Distinct lines <= machine `max_inputs`. |
| `tools` | [it_] | no | Needed, not consumed; each wears one use (knife, lamp, filter, wrench). |
| `outputs` | [Qty] | yes for produce | Byproducts (slag, sludge) are outputs too. `chance` makes an output probabilistic (mass balance uses the expected value). |
| `loss` | Composition | no | Matter that leaves the loop in the job. At most 10% of input units unless the machine is a port. Prefer sludge/slag outputs. |
| `energy` | int 0-4 | yes | Energy to run it now. 0 only for `instant`. |
| `cells` | number >= 0 | yes | Charge drained. 0 for hands and bench. |
| `time` | `"instant"`\|`"job"`\|`"nights"` | yes | `instant` only on `mach_hands`/`mach_bench`. |
| `nights` | int 1-7 | if nights | |
| `credits` | number | no | A fee paid to the station (vent fee, licence fee). |
| `target` | `{ "ids": [Ref]?, "tags": [tag]? }` | modify | What it modifies (not consumed; the same item comes out). |
| `mods_add`, `mods_remove` | [mod_] | modify | |
| `effects` | [Effect] | do | What it does (clear a status, broadcast, scan). |
| `clears`, `risks` | [stat_], `{ stat_: chance }` | no | Statuses it clears on the machine, and chances it causes. |
| `phase` | Phase | yes | When the recipe matters (normally max of machine and disc phase). |
| `notes` | string | no | |

### 6.11 Discs: discs.<domain>.json (`disc_`)
Thing core with `w, h, composition` from `ids.json` `media` (floppy 2x2, card 1x1), plus:
`kind` ("recipe"|"blueprint"|"program"|"blank"|"data"), `media`, `phase`, `machines: [mach_]` (pinned), `programs: [prog_]` (program discs), `copyable` (bool), `licensed` (bool: copier refuses unless cracked), `contraband` (false or class), `found: [channel]` (inflow channels: where it turns up; `upgrade` if sold as a sink), `data_effects: [Effect]` (data discs only), `label` (what is written on it, capitals, like `src/discs/*.md`).
A recipe or blueprint disc is obtainable through its `found` channels or an upgrade; the validator checks that something
actually provides it (section 8).

### 6.12 programs.json (`prog_`)
`id, name, file (8.3 name, pinned for existing), desc, size_kb, memory_kb, speed (min computer speed), licensed, rom (built in), runs_on: [mach_], loads_into: [mach_] (when it is a machine modifier), effects: [Effect], adds: [stat_], requires: Requires, contraband (false|class), novelty (bool), phase`.
Existing programs (`src/programs.ts`: files, notepad, prompt, system, paint, stock, mines) keep their names and files.

### 6.13 statuses.json (`stat_`)
`id, name, desc, applies_to ("machine"|"player"|"station"), effects: [Effect], duration_days (number | null = until cleared), caused_by: [Ref] (recipes, programs, events, items), cleared_by: [Ref] (items, recipes, machines, programs) or the string "sleep"`.

### 6.14 modifiers.json (`mod_`)
`id, name, desc, applies_to_tags: [tag], value_mult, effects: [Effect], adds_tags, removes_tags, hidden (bool: shows only after a scan), contraband (false|class), applied_by: [Ref], removed_by: [Ref]`.

### 6.15 upgrades.json (`upg_`): sinks
Sinks are placed things or discs, not percentages (ECONOMY.md section 7): each grants something you own or a visible stat.

| Field | Type | Notes |
|---|---|---|
| `id, name, desc` | | |
| `phase` | Phase | |
| `kind` | `"capability"`\|`"information"`\|`"space"`\|`"handling"`\|`"energy"`\|`"logistics"`\|`"channel"`\|`"security"`\|`"cosmetic"` | |
| `cost` | `{ "credits": number, "items": [Qty]? }` | Inside the phase's `upgrade_cost` band. |
| `requires` | Requires | Must be satisfiable at or before `phase`. |
| `grants` | [Ref] | Things delivered (machines, discs, `it_fit_*`, programs). |
| `effects` | [Effect] | The visible number. At least one of `grants`/`effects`. |
| `tiers` | `[{ "cost": {...}, "effects": [Effect] }]` | Repeatable steps (dock 2 -> 3 -> 4); optional. |
| `delivery` | `"crate"`\|`"mail"`\|`"instant"` | Crates arrive on the outside counter (ECONOMY.md section 7). |
| `payback_days` | number | Income sinks: estimate. |

**Fixed purchase routes, so parallel workers agree without seeing each other's files:**
- Every machine except `mach_hands` is sold by exactly one crate upgrade with ID `upg_` + the machine ID minus `mach_`
  prefix: `mach_vat` -> `upg_mach_vat`. Its `phase` is the machine's phase; `grants: ["mach_vat"]`.
- Every disc of kind recipe, blueprint or program is sold by one upgrade `upg_` + disc ID: `disc_food_vat_staples` ->
  `upg_disc_food_vat_staples`, phase = the disc's phase, `delivery: "mail"` (it arrives as an attachment), except the
  discs in `ids.json` `upgrade_exempt_discs` (contraband and the novelty discs), which turn up only through sellers, salvage
  and mail. Disc owners put `"upgrade"` in `found` for every non-exempt disc, and may add other channels.
- Blueprint recipes that *build* machines (task 8) are a second route, not a replacement.

### 6.16 start.json (one object)
`credits, energy_cap, phase, carrier (ctier_), field {w,h}, dock {w,h}, things: [Qty], programs: [prog_], notes`. The reachability seed.

### 6.17 residents.json (`res_`)
`id, name, deck (pinned), desc, phase_from, roles {buyer, seller, trader} (weights sum to 1), budget [min,max] (phase 1 credits; scaled by phase budget_scale), wants {need_: weight}, prefers_tags, avoids_tags, buys: [it_] (named favourites), sells: [it_ | disc_ | mach_] (what they bring as sellers/traders), contraband ("buys"|"sells"|"both"|"reports"|"none"), sends_mail (bool), lines: [string] (2-4 sample lines)`.

### 6.18 orgs.json (`org_`)
`id, name, desc, deck, sends: [order kind], notes`.

### 6.19 orders.json (`ord_`): mail order templates

| Field | Type | Notes |
|---|---|---|
| `id, name` | | |
| `kind` | `"order"`\|`"bulk"`\|`"rush"`\|`"standing"`\|`"charity"`\|`"repair"`\|`"black"`\|`"tithe"`\|`"memo"`\|`"spam"` | |
| `sender` | res_ \| org_ | |
| `deck` | deck_ | Destination (sets transit). |
| `phase_from`, `phase_to` | Phase | |
| `wants` | `[{ "id": Ref, "qty" } \| { "tag", "qty", "min_tier"? } \| { "need", "value" }]` | |
| `price_mult` | number | On market worth of the wants (spine 0.9-1.1, ring 1.3-2.0). |
| `due_days` | int | Delivered by; includes transit. |
| `boxes` | [box_] | Allowed sizes. Wants must fit the largest by area. |
| `late` | `{ "pay_mult": 0-1 }` | |
| `penalty` | `{ "credits"?: n, "effects"?: [Effect] }` | Tithe, standing orders. |
| `attachments` | [Ref] | Discs or items mailed with it (a source!). |
| `recurring_days` | int \| null | Standing orders, the tithe. |
| `contraband` | false \| class | |
| `weight` | number | Draw weight. |
| `text` | string | The mail body, 1-2 lines, in the sender's voice. |

### 6.20 events.json (`evt_`)
`id, name, kind ("breakdown"|"convoy"|"strike"|"blockade"|"festival"|"epidemic"|"policy"|"accident"|"raid"|"inspection"|"macro"|"windfall"), phase_from, weight, duration_days, systems: [sys_], decks: [deck_] (empty = all), shocks: [{ "need", "demand", "supply" }] (multipliers, ECONOMY.md section 5 shape), effects: [Effect], spawns_orders: [ord_], adds: [stat_], rumor: { "lead_days", "accuracy" (0-1), "via": "mail"|"radio"|"board", "text" } | null, mail_text, followups: [evt_], requires: Requires`.

## 7. Rules

### 7.1 Mass balance (no value from nothing)
For every `produce` recipe: sum of input units = sum of output units (expected, with `chance`) + `loss`, within
`max(5% of input, 0.05)`. Container `fill` is not counted: a recipe that consumes or makes a container lists its contents
as separate lines. Tools are not consumed. Per material, an output may exceed its input only through the machine's
`transmutes` pairs `[from, to]` (the digester turns sludge into biomass; the still turns biomass into reagent); the created
amount must be covered by consumption of the `from` materials. `loss` <= 10% of input units except on `port` machines
(the vent). `modify` and `do` recipes only need outputs <= inputs.

### 7.2 Generic machines (no recipes written)
- **Recycle** (`mach_recycler`): any item with `recyclable != false` -> its composition as unit items (`materials[].unit_item`),
  x0.9; the other 10% becomes `it_core_sludge`. Fractions accumulate in the machine. 1 energy, 1 charge, or overnight.
- **Copy** (`mach_copier`): a `copyable`, unlicensed (or `mod_cracked`) disc + a blank of the same media -> two discs. A copy
  of a copy may get `mod_bad_sector`; `mod_infected` always rides along.
- **Charge** (`mach_charger`): a cell refills; costs credits = capacity x power price. No matter moves.

### 7.3 Value
Expected value = sum(composition x material base_value) x 4^depth. Craft items should land in 0.3x-3x of it, and in their
tier's band (`ids.json` `tiers`). A `produce` recipe's output value should be at least 0.8x and at most about 6x its input
value (recycle, digester and vent excepted). Contraband sells at a premium through the market, not through a higher value.

### 7.4 Machines, energy, cells, time
- Phase 1 machines: 1-2 charge and 1-2 energy per job; phase 4 up to 30 charge and 3-4 energy. Never more than 4 energy.
- `nights` jobs (growth, aging, digestion) cost no energy and hold the machine; 1-7 nights.
- A machine with `tray: true` needs a disc for any recipe that names one; recipes with `disc: null` run without one.
- `virtual` (`mach_hands` only): not a thing, always owned. Hand recipes: `time: "instant"`, `energy: 0`, `cells: 0`.
- Statuses: Jammed (energy to clear, `rcp_mach_*` writes the clear recipe), Overclocked, Hot, Worn, Infected. Each machine
  lists which it can get; each risky recipe lists `risks`.

### 7.5 Needs and the market
Every item has a `market_need`. An item with `needs` is consumed by residents. Old tags map to needs (`ids.json`
`needs[].old_tags`). Need amounts: staples about 0.25-1 per item; comfort and luxury amount about value / tier typical.

### 7.6 Contraband
Fire (candles, matches, lighters, zippos), drugs, cracked software, stolen or counterfeit goods. Contraband items still
need a source and a use; `res_fence` and `org_black_market` trade them; `org_security` inspection events threaten them.

### 7.7 Inflow and outflow, checked
An item with `inflow.channel` = `seller` must be in some resident's `sells`; `mail` must be in some order's
`attachments`; `haul` items should be tied to `sys_ore_haul`/`sys_ice_haul` in their notes. Matter leaves via
`mach_vent` recipes (`loss`), shipped orders, the tithe, and needs consumption.

## 8. Connectivity: what the validator checks

Errors (must be zero):
1. Bad JSON, wrong top-level shape, missing required field, wrong type, unknown enum value.
2. Bad ID form, wrong prefix for the file, an ID outside your domain prefix, duplicates across all files.
3. Dangling references (not defined and not reserved).
4. Reserved entity whose pinned fields differ from `ids.json`.
5. Recipe: unknown machine; disc on a trayless machine or a disc that does not list the machine; too many input lines;
   mass imbalance; creation without a transmute; loss over 10%; `instant` off the hands/bench.
6. Item with **no source**: not a recipe output (incl. recycler unit items), not `inflow`, not sold by a resident, not granted
   by an upgrade, not in `start.json`, not an order attachment.
7. Item with **no sink at all** (not even recyclable).
8. Unreachable from `start.json` (fixpoint over phases 1-4, section 8.1): any item, machine, disc, program, upgrade, recipe.
9. A recipe, blueprint or program disc not sold by an upgrade (unless exempt). Machine with no use (no recipe, no `generic`, no `effects`, no program runs on it). Disc that unlocks nothing (no recipe
   names it, no programs, no `data_effects`, not a blank).
10. Upgrade whose `requires` cannot be met by its own phase.
11. A need served by fewer than 3 items; (when people files exist) a deck with no resident or no order, a need no resident
    wants, a system no event names; an order whose wants do not fit its largest box by area.

Warnings (keep few, explain in `notes`): recycle-only sink, value outside band, recipe value destroyed or outsized, item
reachable only after its tier's phase, reserved-but-undefined, unknown tag, status never caused or never cleared, modifier
never applied, seller-inflow item no resident sells, counts outside targets.

### 8.1 Reachability
Start with `start.json` things, `mach_hands`, and `phase_1`. For each phase k: add inflow items (`inflow.phase` <= k),
resident `sells` (`phase_from` <= k), order attachments (`phase_from` <= k), upgrades (phase <= k, requires met: grants
become owned), recipe outputs (machine owned, disc owned or null, inputs and tools reachable), recycler unit items. Repeat
until nothing changes. Machines, discs and programs bought as upgrades count as owned; machines a recipe outputs count too.

## 9. Target volumes

| File(s) | Target | Phase/tier spread |
|---|---|---|
| materials | 16 (fixed) | |
| needs / systems / decks / phases | 8 / 12 / 7 / 4 (fixed) | |
| boxes / carriers | 3 / 5 (fixed) | |
| items, all domains | **250-320** | tier 1: 25-35%, 2: 30-35%, 3: 20-25%, 4: 10-15% |
| ... core / food / life / fab / tech / med / lux / mach / fit | 28-34 / 40-50 / 22-28 / 40-50 / 35-45 / 30-40 / 40-50 / 14-20 / 18-26 | |
| recipes, all domains | **340-450** | |
| ... core / food / life / fab / tech / med / lux / mach / fit | 22-30 / 60-75 / 30-40 / 60-75 / 45-60 / 40-50 / 40-55 / 40-55 / 0-10 | |
| machines | 50 (reserved; may add up to 4) | phase 1: 14, 2: 19, 3: 13, 4: 4 |
| discs | 64 reserved (may add up to 3 per domain) | |
| programs | 22-28 | |
| statuses / modifiers | 25-35 / 18-28 | |
| upgrades | **120-150** | 49 machine crates + about 50 disc sales (section 6.15) + 25-45 others; spread by phase like the machines and discs |
| residents / orgs | 12 / 7 (fixed) | |
| orders | **70-90** | every deck >= 6, every resident who sends mail >= 3, every org >= 2 |
| events | **45-60** | every system >= 2, every need >= 3 |

## 10. Carried-over items (STATION.md section 4)

`ids.json` `carried_over` maps each old `src/kinds.json` key to its new ID. Re-skin, do not reinvent: keep footprints and the
spirit of the old descriptions, set `carried_from`. Fire is dangerous on a station, so matches, matchbox, lighter, candle and
zippo become contraband luxuries (`contraband: "fire"`); books are paper and so heirlooms; wine is a distillate; bread,
sandwich, cheese and salami are vat food; ore, ingot and the furnace (now the smelter) stay; coal becomes the small cell;
the computer is the wired terminal; the blank floppy is `disc_tech_blank_floppy`. The pill's three variants are three items.
The apple's synthetic variant is `mod_synthetic` on `it_food_apple` (vat apples, see `src/discs/synth-ag.md`).

## 11. Tone and style

- **Names:** 1-3 words, concrete nouns, Sentence case: "Ration bar", "Scrubber cartridge", "Heavy cell". No brands of real
  companies, no puns, no jokes in names. Fictional company marks are fine sparingly (SYNTH-AG exists).
- **Descriptions:** one line, at most 110 characters, present tense, physical and specific: what it is made of, what it looks
  like, what it is for. Dry, techno-dystopian, never winking. Good: "Grey paste pressed into a bar. Tastes of nothing. Keeps
  a body going." Bad: "A delicious futuristic snack!"
- British spelling (colour, grey, litre), as in `src/kinds.json`. No em dashes; use colons and commas.
- Mail text in the sender's voice: the spine is short and practical, the ring polite and impatient, the company a memo.
- The divide is physical: ring things are real, clean, heavy; spine things are recycled, patched, synthetic.

## 12. How to work

- **Wave A** (parallel): tasks 1-9. They reference only `ids.json` and their own files. **Wave B**: task 10 (people) reads
  every items/discs file that exists and writes residents, orgs, orders, events. Then a short merge pass (ADVISOR_NOTES.md).
- Read: this file, `ids.json`, `STATION.md`, your task brief, and `src/kinds.json` if you carry items over.
- Write valid JSON, arrays sorted roughly by tier then chain. 2-space indent. No trailing commas.
- Run `node data/station/validate.mjs --mine=<your files, comma-separated>` often (`--all` lifts the 40-per-category cap). With only some files present it reports missing files and checks what it can.
  Fix every error that involves your IDs; leave others' errors alone.
- Do not edit `SEED.md`, `ids.json`, another worker's file, or anything outside `data/station/`.
- Finish with a short report: counts, any reserved ID you could not honour, open questions.
