# Task 5: tech (power cells, electronics, devices, computers, programs, media)

Read first: `../SEED.md`, `../ids.json`, `STATION.md` sections 5-7, `IDEAS.md` (the wired terminal and "Computers and
devices, round two": programs as things and modifiers, stats over grids, printers by size, the copying problem),
`src/programs.ts` (existing programs) and `src/discs/*.md` (existing discs). Wave A.

## You own and write
`items.tech.json`, `recipes.tech.json`, `discs.tech.json`, `programs.json`.

## Scope and targets
| File | Target | Schema |
|---|---|---|
| items.tech.json | 35-45 (11 reserved + new) | SEED 6.8 |
| recipes.tech.json | 45-60 | 6.10 |
| discs.tech.json | the 26 reserved `disc_tech_*` (+ up to 3) | 6.11 |
| programs.json | 22-28 (22 reserved + new) | 6.12 |

Content: cells (small, standard, heavy; a dead-cell variant is not an item, charge is state), electronics (boards, chips,
sensors, motors, cables, screens, keypads, relays, a modem card, a memory module), devices residents buy (handset, torch:
the legal light, since fire is banned, radio set, a room heater, a fan, a clock, a game handheld, hearing aid, a door
lock), a dongle (hardware key, `licensed` software), a label roll, slips, printed manuals and posters (with the medium
printer), computers as items to sell (a cheap laptop terminal, a ring desk unit: devices, not machines). Programs: the 22
reserved plus a few novelty or modifier programs.

## Machines you use
`mach_fabricator` (circuits, lamps with `disc_tech_bp_circuits` / `_lamps`), `mach_assembler` (p3), `mach_cell_press`
(p3), `mach_printer_3d` (p3), `mach_autofab` (p4), `mach_printer_s`, `mach_printer_m`, `mach_bench` (repair, refurbish),
`mach_hands`. Hosts for programs: `mach_terminal`, `mach_terminal_pro`, `mach_mainframe`; `mach_modem`, `mach_radio`,
`mach_broadcaster` are effect machines whose effects task 8 writes. `mach_copier` is a generic rule (SEED 7.2).

## Reserved IDs you depend on
`it_fab_wire`, `it_fab_sheet`, `it_fab_housing`, `it_fab_polymer_sheet`, `it_fab_glass_pane`, `it_fab_bar_copper`,
`it_fab_bar_light`, `it_core_lithium_salt`, `it_core_reagent_dregs`, `it_core_rare_dust`, `it_core_noble_flake`,
`it_lux_paper` (printing), `mod_licensed`, `mod_cracked`, `mod_infected`, `mod_bad_sector`, `mod_tuned`,
`stat_overclocked`, `stat_infected`.

## Connectivity duties
- Cells: `cell.capacity` as pinned (10 / 30 / 100), `market_need: "need_power"`, `needs.need_power`. The cell press makes
  all three; small cells also arrive by `crate` and `seller` (phase 1 fuel must exist from day 1).
- Programs: `runs_on` a terminal; modifier programs (`prog_overclock`, `prog_automate`) also `loads_into` machines and
  `adds` statuses; information programs carry `effects` with stats (`price_visibility`, `rumor_lead_days`,
  `rumor_accuracy`, `orders_per_day`, `job_energy_mult`). `prog_mail` and `prog_labels` are phase 1 and `requires`
  `mach_modem` / `mach_printer_s`.
- Every non-exempt disc: `found` includes `"upgrade"`. Exempt ones (`ids.json` `upgrade_exempt_discs`): paint and mines
  `salvage`, stock `seller`, cracker and blackmarket `mail` (task 10 attaches them) and `contraband: "software"`.
- Blank media: `found: ["crate", "seller"]`; data lore disc: `salvage`, `data_effects` (e.g. sells to collectors).

## Tricky parts
- Copying is a cost, not free (IDEAS.md): media, time, market memory, licences. Express it as program/disc fields
  (`licensed`, `copyable`, `size_kb`) and statuses; do not write copy recipes.
- Keep program stats plausible for a 640K, 2048K, speed-8 terminal (`src/kinds.json` computer).
- A slip is printed: printer_s takes `it_lux_paper` and outputs several slips (paper 0.5 fibre -> 5 slips of 0.1).
