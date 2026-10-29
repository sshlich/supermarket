# Probably Stolen — full release datamine (2026-10-28)

Build: Steam app 4348910, buildid 26284217, `Application.version` **0.46D**, Unity 2021.3.45f2, Questing Goose Studio.
Install (CrossOver bottle "Steam"): `game/` symlink → `.../steamapps/common/Probably Stolen`.

**The big change from the demo: the release is a Mono build, not IL2CPP.** `Managed/Assembly-CSharp.dll` decompiles
to full C# with method bodies (`src/`), so every constant, formula and string is readable directly.

## Workspace

| Path | What |
|---|---|
| `src/Assembly-CSharp/` | 928 decompiled classes (ilspycmd 8.2) |
| `src/Assembly-CSharp-firstpass/` | plugins (Steamworks etc.) |
| `data/loc_en/*.json` | all 14 English string tables, 6,683 strings (`extract_loc.py`) |
| `data/items.csv` | 586 item factories: id, directory, name, value, types, desc, flavor (`extract_items.py`) |
| `data/paper/*.json` | the 4 built-in Paper documents (guide, business card, tutorial sheet, blank) |
| `notes_new_types_vs_demo.txt` | 252 class names missing from the demo's IL2CPP metadata |
| `ref/probably-stolen-modding/` | official modding repo (ModdingGuide.md, example LearnerMod, trust-list.json) |
| `UNUSED.md`, `data/unused/` | unused / experimental / ghost content report (`mine_report.py`) |
| `data/static/` | code cross-reference: registered ids, factory callers, classes, strings (`mine_static.py`) |
| `data/assets/` | attached scripts, sprites + PNG exports, audio, loot tables (`mine_assets.py`) |
| `data/runtime/` | live dump from the PSDataDump mod (`mod/PSDataDump`) |

Rebuild: `.venv/bin/python extract_loc.py && .venv/bin/python extract_items.py && .venv/bin/python mine_static.py && .venv/bin/python mine_assets.py && .venv/bin/python mine_report.py`.

Runtime dump: build `mod/PSDataDump` (`dotnet build -c Release -o out`), copy `manifest.xml` + `out/PSDataDump.dll` to
`game/Mods/PSDataDump/`, enable + approve it in Mods, restart, then **load a save** (it hooks `OnGameLoadedLate`, which a
new game does not fire). Output: `<persistentDataPath>/ModData/ps_datadump/` → copy to `data/runtime/`. Loot registry is
empty at that point; loot comes from the LootTable assets instead (`data/assets/loot_tables.json`).
Decompile again after a patch:
`DOTNET_ROOT=~/.dotnet DOTNET_ROLL_FORWARD=Major ~/.dotnet/tools/ilspycmd -p -o src/Assembly-CSharp "game/Probably Stolen_Data/Managed/Assembly-CSharp.dll"`

## New since the demo (by class name; approximate, IL2CPP stripping can hide unused types)

- **Mod system** (Harmony 2, Steam Workshop, capability scanner, signed trust list). See below.
- **Afterhour**: night locations `dumping_ground`, `dr_jackson`, `commissary`, with weekly/random events.
- **Endings**: buy the store (cash, or mortgage) = win; arrest = loss. Run stats and run summary screen.
- **Difficulty tiers** (cozy/normal/hard/challenge), moddable via `Difficulty.Register`.
- **Paper**: JSON-defined documents/books with an in-game editor (dev panel → Modding → Paper Editor).
- **Machinery UI** widget kit (sliders, tabs, intakes, progress bars) for machine panels, also usable by mods.
- New machines: Auto Butcher, Evaporator, Meat Culture. Gun orders (LL / Merc / UL tiers). Aquafarmer start.
- New store client lists: Church (live). Command (empty) and Procurement (2 offers) exist but nothing calls them.
  Serpico storyline, "The Butcher" questline.

## Dev tools (no mod needed)

`DevTools.cs`: put an empty **`dev.txt`** next to `Probably Stolen.exe` → **F9 debug panel, F8 Quantum Console**.
`1dev.txt` = full mode (adds Legacy, Marketing and Story panels, developer-only panels).

- Debug panel: credits (+500/+10000/zero), max/min rep, buy store + deed, instant win/lose endings, skip night,
  item spawner, spawn kits (aquaculture, hydroponic, plant DNA, gun, rat), sprite and customer viewers,
  afterhour event panel, modding panel, Butcher test mode.
- Console commands: `afterhour-event-start/end`, `afterhour-events`, `loot-list`, `loot-roll`, `gun-order-test`,
  `gun-service-test`, `paper-open/edit/list/reload/item/close`, `mod-scan`, `mod-trust*`, `serpico-test`,
  `tutorial-bubble`, `client-faces`, `loc-*`.
- "Toggle Verbose Log" turns on the game's Debug.Log output (off by default).

## Mod system

- Folder: `<game>/Mods/<ModFolder>/manifest.xml` (+ Workshop items). Manifest fields: ID, Name, Author,
  ModVersion, Description, GameVersions, Prerequisites, Assemblies, Capabilities.
- Content folders read automatically: `Assemblies/*.dll` (Harmony `PatchAll` runs on each), `LootTables/*.json`,
  `Textures/Items|Paper/*.png|jpg`, `Localization/*.csv`, `Sounds/`. Config saved to `persistentDataPath/ModConfigs/<id>.json`.
- `IMod`: `Init(manifest)`, `OnEnable()`, `OnDisable()`.
- `ModHook` events (every handler is wrapped in try/catch): item directory init; customer generation
  (VeryEarly→VeryLate); game loaded; shutter open/close; sleep/wake; leave/return store; nightly services;
  tooltips (and dev tooltips); loot tables loaded/rolled; paper opened; network upgrade unlocked; new game;
  difficulty applied; afterhour arrive/leave/event start/end.
- `ModScanner` reads the IL and flags undeclared capabilities: `files`, `network`, `process`, `dynamic-code`,
  `native`, `reflection-external`. Each mod is fingerprinted and must be approved again when its hash changes.
- `ModTrustList` is fetched from `raw.githubusercontent.com/dragonpan2/probably-stolen-modding/main/trust-list.json`.
  It is RSA-signed: block list, verified list, and a **remote kill switch** (`allMods`, `exceptVerified`).
  Current payload (issued 2026-10-16): nothing blocked, kill switch off.

## Difficulty (`Difficulty.cs`)

| | Cozy "Price Gouge" | Normal "Mark Up" | Hard "Thin Margins" | Challenge "Red Ink" |
|---|---|---|---|---|
| Retail markup | 20% | 15% | 0 | 0 |
| Rent increase each time | +2.5% | +5% | +10% | +10% |
| Power / insurance cost | ×1 / ×1 | ×1 / ×1 | ×2 / ×2 | ×2 / ×3 |
| Vendor permit | 500 | 1500 | 2000 | 3000 |
| Upgrade prices | ×1 | ×1 | ×1.5 | ×2 |
| Supplier markup | ×1 | ×1 | ×2 | ×3 |
| Inventor (Dr Jackson) markup | 0 | 15% | 50% | 100% |
| Store price (base, +/day, cap) | 12,000 +25 (cap 3,000) | 12,000 +50 (cap 5,000) | 24,000 +50 (cap 10,000) | 36,000 +100 (cap 20,000) |
| Mortgage (interest, weeks, down) | 25%, 8 wk, 20% | 50%, 12 wk, 15% | 75%, 16 wk, 12.5% | 100%, 16 wk, 20% |
| Rep gain / loss | ×1.5 / ×0.5 | ×1 / ×1 | ×0.75 / ×1.25 | ×0.5 / ×2 |
| Aug presence: kill drop / alive rise | 25 / 10 | 25 / 10 | 10 / 15 | 8 / 16 |
| Game over at full aug presence | no | no | yes | yes |
| Wild bailout and reminders | yes | yes | no | no |

## Starts and perks

- Playable: apprentice, water_merchant, fence, rock_bottom (extreme), hydroponic_farmer, gunsmith, chemist,
  rancher, **aquafarmer** (RAS system, tilapia, higher rent).
- Stubbed as "coming soon": junker, organ_trader, street_food_vendor; hidden: moonshiner, pharmacist.
- 48 perks with point costs in `StartingPerkList.cs`, e.g. ascetic −4, awful_negotiator −3, sentinel −3,
  well_connected +2, alert +2, vending +2, working_pipes +2.

## Afterhour events (`VanillaAfterhourEvents.cs`)

| Event | Where | When | Effect |
|---|---|---|---|
| fresh_dump | dumping ground | Wednesdays | junk −50%, injury +25% |
| georgio_assistance | dumping ground | triggered (Georgio paid 50/day, 3 days) | no injuries, +5 scav attempts |
| jackson_closed | Dr Jackson | Mondays, unless Special Stock bought | closed |
| special_stock | Dr Jackson | Mondays, with JACKSON_SPECIAL_STOCK | rare stock, prices +150% |
| jackson_discount | Dr Jackson | Sundays | prices −10% |
| commissary_burglary | commissary | random | reduced stock |
| fresh_restock | commissary | Fridays | restock 35% of max |

## Network upgrade costs (`NetworkUpgradeList.cs`, before difficulty multiplier)

Brewer 200, Chemist 250, Pharma 300, Miner 250. Shareholder: Brewer 1450, Miner 900, Chemist 1440, Pharma 2500.
Landlord grace 100, Sec grace 250, Inspection informant 300, Wild fixer 350/450/550 (fee 25/45/70, 15/20/25%,
flat 50/150/400). Evidence removal 500, buy/sell referral 200 each, criminal network 350, power hijack 300,
commercial power 350, showcase I/II 200/500, Gutterflow tap 250, Rustwater tap 350, ruined machine unlock 300.
Gun permit I/II/III need rep 20/50/80.

## Cut or dormant content

- `UnusedDirectory`: 59 items, never spawned. Loot boxes, pill bottles (oxycodone, phagimycin…), pouches,
  modular backpacks, organs (heart, lung, kidney, liver) and transport container, revolvers, ammo box,
  Titan armor set, molotov, safe, lockpicks, mirage generator, loan contract, codebook, inspection book.
- `Space*Trigger` (20 encounters: merchant, pirates, ghost ship, distress signal…) and `TraderStation*Trigger`:
  hardcoded English, not localized, picked up only by reflection (`PriorityTrigger`). Looks like a leftover
  space-trader prototype layer (`EmporiumMenu` scene name, ship/raid/combat managers). *(inferred, not traced to a call site)*
- Hireling expeditions **are** live (hirelings leave with gear and report back via the store counter).
