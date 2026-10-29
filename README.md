# Probably Stolen datamine (v0.46D, full release)

Reference data for the supermarket game, mined from Probably Stolen (Questing Goose Studio, Steam app 4348910,
build 26284217, Unity 2021.3.45f2, Mono). Unrelated to the game code on the other branches.

Three sources:

- **Code**: the decompiled `Assembly-CSharp.dll`. Not committed; regenerate it with the command in `NOTES.md`.
- **Assets**: `resources.assets`, `sharedassets*`, `level0/1`, read with UnityPy and the type trees generated from the game's DLLs.
- **Runtime**: `mod/PSDataDump`, a mod for the game's own modding harness. It builds every registered directory entry and
  list factory in the live game and writes them to JSON.

## Start here

| File | What |
|---|---|
| `UNUSED.md` | unused, experimental and ghost content, readable |
| `NOTES.md` | build facts, mod system, dev tools, difficulty table, how to rebuild everything |
| `data/items.csv` | 586 item factories: id, directory, name, value, types, description, flavor |
| `data/loc_en/` | all 14 English string tables (6,683 strings) |
| `data/runtime/` | live dump: `directories/<EntryType>/<Directory>.json`, `lists/<Class>.json` (store clients, events, operations, perks, network upgrades...), `registries/` (difficulty, plants, traits, appraisal, paper, options) |
| `data/assets/loot_tables.json` | all 13 vanilla loot tables and 2 table groups with probabilities, plus the scene wiring |
| `data/assets/attached_scripts.json` | every MonoBehaviour class and which scene/asset file attaches it |
| `data/assets/sprites.json`, `audio.json` | every sprite/clip and whether code, the AudioDirectory or a scene object references it |
| `data/assets/sprites/` | PNGs: `orphan/` (art nothing uses), `unused_items/` (art of cut items), `orphan_variants/` (fill levels and sizes built at runtime) |
| `data/static/` | code cross-reference: `registered_ids.json`, `list_factories.json` (callers), `classes.json`, `loc_unreferenced.json`, `code_sprite_refs.json` |
| `data/unused/` | one JSON per section of `UNUSED.md` |
| `data/paper/` | the 4 built-in Paper documents |

## Headline findings

- **7 item/ability directories are never loaded.** They're attached to no GameObject and named nowhere, and the runtime dump confirms none
  of them register: `UnusedDirectory` (59 items: lootboxes, pill bottles, injector pouches, organs, Titan armor set,
  revolvers, mirage generator, test waters...) and the whole combat layer (`StandardCombatAbilityDirectory` with the five
  **Experimental Injectors**, the effect directories, and `NpcCharacterItemDirectory` with 22 raider, pirate, deserter and xeno NPCs).
- **Cut storylines:** the **Grandpa Cheng** arc (7 scenes: intro, referral, illness, Sawyer and Wild crossovers), Loan Clerk
  (3 scenes), Off-duty Officer, Billy (3 + security officer), the trailer-era clients (cultist, Greytide, chemist,
  gun buyer, codeword client), Revolution manifesto, 8 faction statuses (crackdown, checkpoint, lockdown...) and 3
  threat events (blockade, pirate raid, Republic marines). Their dialogue is quoted in `UNUSED.md`.
- **Space prototype ghost:** 72 Space/Ship/Raid/Combat/Expedition classes from the space-trading game this grew out of.
  The 23 `Space*Trigger` events (ghost ship, drug ship, refugee ship, navy supply...) are still built by reflection each run,
  but they can only fire while flying the ship, and no scene contains the ship.
- **Disabled loot:** `sup_keycard` and `sci_keycard` sit in `accessCardTable` switched off.
- **Unreachable live items:** 35 registered items that nothing references, e.g. MBS Nerve Gas, Test Gizmo, Box Dispenser,
  Blank Module, Streamlining Module, Attachable Extended Barrel, Old Lottery Ticket and 9 unused perks.
- **Art:** 307 orphan sprites (peanut butter colors, stick and smoke grenades, fire axe, sandal weapon, STANAG mags,
  handmade SMG, wine labels, broken-machine minigame pieces...) and 97 sprites of cut items. All 276 audio clips are wired
  to something (AudioDirectory, a scene AudioSource or a component field), so no audio is unused.

Every "unused" claim is a lead, not proof: IDs that the code assembles from parts at runtime can look unreferenced.
The runtime dump and the scene and asset checks remove most of those false positives, and `UNUSED.md` says which check each entry failed.

## Rebuild

From a workspace with `game/` symlinked to the install and `src/Assembly-CSharp/` decompiled (see `NOTES.md`):

```
.venv/bin/python extract_loc.py && .venv/bin/python extract_items.py
.venv/bin/python mine_static.py && .venv/bin/python mine_assets.py && .venv/bin/python mine_report.py
```

Runtime dump: build `mod/PSDataDump`, install it into `game/Mods/PSDataDump/`, enable and approve it in the Mods menu,
restart the game, **load a save**, then copy `<persistentDataPath>/ModData/ps_datadump/` to `data/runtime/`.
