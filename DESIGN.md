# Field

Irregular shapes are back (since the item manager): the grid handles a thing's real squares. Shoving moves a neighbour a
cell at a time until its actual squares are clear (not whole boxes), so an L slides past another's empty corner; a fuzz
test drops 300 random shapes and checks every result is a valid layout, and a stats run over 2,000 nudges found half moved
nothing and only 5 moved anything more than 4 cells. The game has a tray under the field to put any kind of thing on it.

Started over from nothing. The field is a 30 x 20 grid of cells with a few things on it. You can pick things up,
turn them (R or right-click), drop them, and whatever is in the way gives way. No tooltips, no rules, no game yet.

Kept from before: the geometry in `src/grid.ts` (shove, hop, reflow, irregular shapes) and the flat, dark look.
Everything else (containers, nightly rules, contracts, money) is on the `inventory-manager` branch if it is wanted back.

## Sprites and the editor

Each kind has an SVG in `src/sprites/<kind>.svg`. Its viewBox is the item's footprint at 32 units per cell (a 4 x 2 item is
128 x 64), and it draws in `currentColor` so the game tints it with the item's accent. The game loads them by glob and
updates live when one is saved.

`/editor.html` (dev server only) edits them, so nobody has to write SVG by hand:
- **Pick and drag.** Click a shape in the picture or the layers list; drag to move (snapped), drag a corner to resize
  (alt = free stretch), arrow keys nudge, `[` `]` scale.
- **Add.** Shape generators with parameters (rectangle, rounded, circle, ellipse, ring, line, zigzag, triangle, diamond,
  polygon, star, cross, arrow, chevron, glyph); new shapes take the item colour by default.
- **Item tab** (the game item you picked in the list, not a shape): name and accent colour (both saved to `src/kinds.json`,
  the toolbar colour saves too), the footprint summary, and sliders that move, size and turn the *whole drawing* together
  (X, Y, size as a share of the footprint, turn), plus centre / fit / flip / turn 90.
- **Shape tab** (was Properties, for the selected shape). Sliders (each with a number box) for edge width, opacity, X, Y, width, height and turn, colour swatches
  for fill and edge (item colour, none, a palette, any colour), keep-ratio, quick flip/turn/centre/fit buttons. Sliders
  show the effect live and keep it on release.
- **Layers.** Front first; per layer: hide, bring forward, send back, duplicate, delete; drag rows to reorder;
  double-click a name to rename it (stored as `data-name`); `⌘↑` `⌘↓` (`⇧` for all the way).
- **In-game preview.** Only the selected item, on field squares, as large as the window beside the big picture allows
  (it drops below the picture if there is no room to the right); follows the "turn view" toggle.
- **Effects.** Glow, drop shadow, blur, fades, hatching, outline, dashes, a shadow copy; they write real SVG filters and
  gradients into `<defs>` and unused ones are cleaned up.
- **Operations.** Flip, turn, scale, fit, align to the footprint, mirror copies, duplicate, z-order, ungroup, delete.
- **Pen tools.** Connect the dots (closed polygon), open line, and freehand (simplified as you let go; thickness, detail
  and an optional smooth curve). Select a polygon or line to edit its points: drag a point, click a "+" to add one,
  double-click a point to remove it; operations can smooth it into a curve or reduce its points.
- **Footprint painter.** A 12 x 12 patch of squares: press and drag to switch squares on or off (the first square decides
  whether the drag paints or erases), plus clear / invert / reset / fill a rectangle. Any shape is allowed; the box, the
  count and a warning for pieces that do not touch are shown. Apply keeps the drawing where it is (or scales it to the new
  box) and saves to `src/kinds.json` (`w`, `h`, and `cells` rows of `#`/`.` when it is not a plain rectangle). Saved layouts
  are repaired on load.
- **Item manager.** New item (blank footprint outline, or a copy of another), duplicate, delete (click twice), a filter
  box, and fields: name, description (for tooltips), private notes, tags. All in `kinds.json`; the editor checks it all
  again on the server.
- **Library.** Drop or paste SVGs (they are cleaned of scripts and outside links, and kept in `src/imports/`), and add
  any of them to the sprite or replace it; "use the item colour" makes imports follow the item.
- **Speed.** Selection boxes come from exact path maths (`parsePath` / `pathBounds` in `src/editor/geom.ts`: curves parsed
  once, extremes solved), not from asking the browser, which was about 100x slower (a nudge on the crate went from ~1000 ms
  to ~7 ms); only the visible tab is rebuilt on each change.
- **Room to work.** Both side panels fold to a slim rail; the Items / Footprint / Layers sections and the key help fold
  (remembered between visits); the big picture fits itself to the room there is until you drag the zoom (button "fit"
  turns it back on).
- **Cutting pieces.** In the icon browser, "Choose parts" splits a picture into its shapes (and each shape of a compound
  path) and lets you click parts away before adding. In a sprite, "Break into pieces" (Ops) splits a compound path or a
  whole group into separate layers you can delete, move or recolour.
- **Icon browser** (Library tab, "Open the big browser"): full-screen, ~60,000 icons from eight Iconify sets (game-icons,
  Pixelarticons, Fluent Emoji outline, Material Design Icons, Material Symbols, Tabler, Lucide, Phosphor) plus your
  imports; search by name, thumbnail size slider, endless scroll, a big tinted preview with the licence, keyboard
  navigation, add / add and close / replace / keep.
- **QoL.** Undo/redo, drafts kept across reloads, optional autosave to the game, snap size, copy another item's sprite as
  a starting point, "original icon" reset, the SVG source always visible in its tab.
`npm run sprites` writes a starting sprite from the game-icons icon for any kind that has none (`-- --all` to redo all).
The save endpoint lives in `vite.config.ts`; shape maths and matrices are in `src/editor/geom.ts` (tested).

`/gallery.html` (dev server only, `src/gallery.ts`) shows every kind at once, drawn with the game's own item markup and styles.
- **One by one:** each kind sits on a patch of field one square bigger all round. Under it: its id, size, footprint, slots,
  machine and tags, and a fit line.
- **One field:** everything is packed onto one field as wide as the window, biggest first, each in the first free spot, the
  way `spawn` places things.
- **Controls:** square size, turn everything (`R`), tint the footprints, group by tag, and filter by name, id or tag. The
  view is remembered between visits, and the page reloads when a sprite or an item changes.
- **The fit line** is the rule from `npm run footprints` (taken squares 15%+ drawn, free ones under 2%), measured in the
  browser, so nothing needs installing. Hover the line for the coverage of every square. It agrees with the script.
- **Compare styles:** other versions of a sprite live in `src/sprites/styles/<style>/<kind>.svg`. The game never loads
  them. This view puts every version of a kind side by side, each with its own fit line. The style buttons draw
  "one by one" and "one field" in that style, falling back to the drawn sprite where a kind has no version.

Two less realistic styles, being compared (2026-10-02, 10 kinds each: crate, axe, hearth, still, coin stacks, ham, hen,
coop, bucket, knapsack). Same footprints and silhouettes as the drawn ones:
- **simple:** one shade and one light per part, no textures (no dots, netting, stitches, grain, mesh or rivets), essential
  features only, about half the layers.
- **flat:** solid shapes and one hard-edged tone, no light at all. Parts are separated by real gaps, cut with a `<mask>`
  so the grid shows through. Closest to icon art.

Verdict on the sprites so far (the user, 2026-10-02; to fix next, nothing changed yet):
- Some liked, some hated. The **ham at 45°** is awkward: it should lie flat. It was tilted to fill a 3x3 square with a
  staircase footprint, copying the diagonal pose of the game-icons reference.
- **Hens** should take a square and be rounder, not a letter-shaped footprint with empty squares (`#.#/###/.##`).
- Some sprites are still **placeholders**: log, coal, bottle, knife, fuel chest, well, mash vat (crate, axe, hearth and
  still have new versions in `styles/`).
- Some things are **too big**: the pickaxe (5x6) and the shovel (3x7).
- **Shapes are all over the place.** The footprints followed every outline literally, and items sit in whatever pose
  fitted the grid.

## Handling (the game page)

- **Turning is four-way.** `rot` on an item is quarter turns clockwise (0-3), so upside down is a real state. While
  dragging: `R` turns clockwise, `Q` back, right-click clockwise. It turns about its own centre, which stays where it was on screen. Squares can
  turn too (only the sprite changes). Auto-turning to fit (relaxed mode) only tries orientations with a different
  footprint. Old saves (`true`/`false`) are converted on load.

- **Selection.** Sweep a rectangle on empty ground to pick everything it touches (Shift or Cmd/Ctrl adds), Cmd/Ctrl-click
  toggles one, Shift-click toggles on release, `Cmd/Ctrl+A` picks all, `Esc` clears, `Delete` removes the picked. Grabbing
  one of several picked things moves them all, keeping their arrangement (a group cannot be turned).
- **Strict mode** (`S`, or the button under the field; remembered): a drop is accepted only if every square is free and
  nothing else ever moves. Otherwise it is refused. Hold **Shift** while dragging to do the opposite for that one move: in
  strict mode Shift lets the shuffle-to-fit happen, and outside it Shift makes one move strict.
- **Feedback while dragging** (from the reference video; no glow, and the held thing stays opaque):
  - *Strict mode:* the squares it would take light up green if all are free, red if not, one filled shape per thing
    (an irregular footprint is one piece). Releasing on red sends it back where it came from.
  - *Relaxed mode:* no green or red. A plain outline shows where it lands, dashed outlines show what gives way, and
    only if there is truly no way to place it (even by shoving) does it go red.
  - The lights are drawn above the thing in hand, so they show through it.
  - Items have no backing: they sit straight on the grid. *Hover* and *selected* both tint the footprint tan (no outline,
    no glow).
- **The field** is 25 x 20: dark aubergine with a slightly lighter grid and a muted copper outline; things sit straight on the grid with no backing.

## Uses (interactions), the skeleton

From the video: while holding something, everything it can be *used on* gets blue squares (brighter under the pointer),
e.g. pouring water into another container, slaughtering a rabbit with a knife, applying one thing to another.
- Data: a kind's `uses` in `kinds.json`: `[{ on: <kind id or tag>, verb }]`, one way (the held kind names its targets).
  Edited in the editor's Item tab ("Can be used on", one `verb: target` per line). `interaction(held, target)` and
  `targetsFor(state, held)` in `world.ts`. Placeholders in the data now: knife carve -> log, axe chop -> log, bottle pour -> bottle.
- Behaviour now: targets light up blue while dragging; letting go with the pointer over a target uses it instead of
  placing (the held thing goes back, a note under the field says what happened). Uses can now have effects: see
  "Properties and rules" below.

## Tooltip (postponed; notes, from the reference video, twice over so it is not lost)

- Opens on hover, to the **right of the hovered item / beside the inventory**, top edge near the item; dark panel with a
  muted red-brown border; clipped by the screen edge in the video, so keep it inside the viewport.
- Content, top to bottom: **name** (bold, light); **[category]** in teal (ours: from `tags`); `Est. Value: N, Base ...` and
  `Purchase Price: N` (needs new item fields: value, base/purchase price); a **gauge** `[      ] 0 ml / 300` for things that
  hold an amount (containers/liquids; needs a capacity field and a current amount on the item); the **description**
  (ours: `desc`); a blue action hint, e.g. `Double-Click To ...` (a per-kind action, tied to uses/interactions).
- The hovered item's footprint is tinted tan while the tooltip is up.
- Open questions for later: which fields every item has (value, price), how amounts are stored, which action a
  double-click means, and whether the tooltip shows notes (no: notes stay private).

## Containers, panels, machines (agreed 2026-09-29)
- A kind may have `slots` (each: w, h, accepts/rejects tags, optional name). Items inside carry `in: {host, slot}`; x, y are in that slot's grid.
- Containers do not go in containers, except kinds tagged `vessel` (bottle): one extra level, `MAX_NEST` 2. Double-click a container to open it as a panel; up to 4 docks (two each side), drag a panel header onto another dock to swap. Dropping an item onto an accepting container puts it inside (blue light).
- Machines are kinds with several named slots and `machine.rules` (see "Properties and rules" below); the clock button runs `advance(state, ticks)`.

## Liquids (2026-09-29)
- A liquid is a property of a vessel (kind `capacity`, in ml; item `liquid: {type, ml}`), not an item. Corked: nothing spills. One liquid per vessel; pouring a different one is refused. Pour = a `uses` verb on `vessel`, moves as much as fits.
- Machines take liquid through vessels put in a slot accepting `vessel` (the flex slot); they read and write the vessel, at an hourly rate (well/vat 250 ml, still 100 ml in, 2:1), written as rules. Mixing table: later, one lookup in `pour`.

## New items, drawn by hand (2026-10-01, branch `inventory-v2-items`)
27 kinds, art and footprints only (no slots, uses or machines yet). Footprints follow the drawing, so odd shapes interlock:
an egg fits in the ring sausage's hole, coins in the steps of the coin stacks, a price tag over the cheese wedge.
- **Food:** cheese wheel 4x3, cheese wedge 3x2 `..#/###`, cured ham 3x3 `.##/###/##.`, ring sausage 3x3 `###/#.#/#.#`,
  loaf 4x2, slice of bread 2x2, egg 1x1, apple 1x1, honey jar 2x2, flour sack 3x3 `.#./###/###`.
- **Farm:** hen 3x3 `#.#/###/.##`, chicken coop 5x4 `.###./#####/#####/#####`, seedling 2x2.
- **Fire and light:** bellows 4x2 `###./.###` (drawn at a slant), kindling 3x2, split log 4x1, matchbox 2x1, lantern 2x3,
  candle 1x2.
- **Vessels, time, money:** wooden bucket 3x3, hourglass 2x3, coin 1x1, coin stacks 3x3 `#../##./###`, price tag 2x1,
  strongbox 3x2, key 3x1, padlock 2x2.
- Tags are descriptive (food, meat, money...), except kindling and split log, which carry `fuel` and `wood`. The fuel chest
  and the hearth's slots accept them, but they do not burn yet (`FUEL` only knows coal and log).

How they are drawn, so more can match:
- A three-quarter view, light from the top left. The silhouette is one shape in `currentColor` (the item's accent). Form
  comes from see-through overlays on top: black at .14 to .3 for shade, white at .14 to .5 for light. So an item can be
  recoloured and keeps its shading.
- Other materials use fixed colours, mostly the editor's palette: iron `#3a3a44`, brass `#c9975a`, flame `#ff9a3c` and
  `#ffe08a`, leaf `#7fb069`, bone and trim `#f0ece2`, rope `#c9975a` / `#e6d3a8`.
- Gaps are real transparency (`fill-rule="evenodd"`), so the grid and the hover tan show through them. Shading that
  could run past the outline is clipped to it with a `clipPath`.
- Every layer has a `data-name` ("rind", "netting", "wing feathers"...), so the editor lists them by name. Repeated parts
  (coins, staves, sticks) are a single path per layer.
- Footprints were checked by rasterising each sprite and measuring each square. Every square in a footprint is covered
  at least 15% (the thin parts: a handle, a nozzle, a wedge's tip; most squares are over 25%). Squares outside the
  footprint get under 2%. `npm run footprints -- [kind...]` runs that check (needs `rsvg-convert`) and prints a
  coverage map for whatever fails, or for the kinds named. It currently fails the old placeholders (coal, axe, hearth,
  well, still) and the cheese wedge, whose tip square is 14% covered.

The "put on the field" tray wraps to more rows as kinds are added; `fitTray()` shrinks the squares after drawing until all
of it is on screen (at 1280x720 they go from 28px to 24px).

## The night kit (2026-10-02)
Five things for going out at night, drawn to the rules above. Sizes keep relative order rather than true scale: small things
near true size, big ones compressed, but the order holds within a family (knife < pickaxe < shovel; rope < bucket < knapsack).
- **Knapsack** 4x5 `.##./####/####/####/####`: olive duck canvas, a flap held by two buckled straps, a grab loop, shoulder
  straps showing at the sides, a front pocket, and an outfitter's stencil on the flap (Fluent Emoji's hammer and pick, the
  map symbol for a mine). The narrow top leaves both top corners free. Slots `pack` 5x4 and `pocket` 2x2; tags
  `container`, `back`.
- **Pickaxe** 5x6, a T (`#####` over a one-square haft): redrawn from the flat 3x3 glyph. The whole head stays in the top row,
  so every square is clearly in or out.
- **Shovel** 3x7 `.#.` x4, `###` x2, `.#.`: D grip and haft in the middle column, then the blade three wide and its point.
- **Rope** 3x2: a flat coil of turns with twisted strands and a whipped end.
- **Knife belt** 5x4 `#####/#####/...#./...#.`: a buckled belt standing as a loop, a sheath hanging from it. Slot `sheath`
  1x4, accepts `blade` (the knife now carries `tool` and `blade`); tags `container`, `waist`.
- Containers still do not nest, so the belt cannot go in the knapsack; it is meant to be worn (zones, later).
- Checked in the game (headless Chrome): saved contents load in the pack and the pocket, the knife dropped on the belt goes
  into the sheath, a log or the belt itself is refused as contents, the pickaxe turns while held. `world.test.ts` covers the
  sheath and the pocket.
- Off in scale or style, left for later: the axe (4x6, an old flat glyph, as tall as the pickaxe), a chicken coop barely bigger
  than a hen, and the other old placeholders (crate, log, coal, bottle, knife, fuel chest, hearth, well, vat, still).
- Tried and dropped: game-icons' rope coil as the rope's body. It stacks into a dome and reads as a basket at game size.

## Properties and rules (2026-10-09)

Step A of the items plan (`IDEAS.md`, "Items: the plan"). Items carry properties, and machines and uses are data in
`kinds.json`, edited as JSON for now. The hard-coded hearth, well, vat and still are gone: they are rules too.

- **Properties.** A kind declares them (`props`); an item carries the values (`p`) and which are still unread (`hidden`).
  `{ "max": 100, "start": [0, 100], "show": "strip", "hidden": true, "color": "#7fb069" }`: `start` is a number or a range to
  roll in; `show` is `number`, `gauge` (a bar in the tooltip) or `strip` (the bar, and a strip up the item's right edge on the
  field, or a "?" while hidden); `gone` means the item is used up at 0. Values stay between 0 and `max`. Old saves get the
  properties their kinds gained on load.
- **Matching** (rules and uses): `kind` or `tag`; `where: { "charge": "<100" }` (`<`, `<=`, `>`, `>=`, `=`; `"?"` means
  still hidden); for vessels `liquid` (one or several; `"none"` is empty), `ml` and `free` (room left).
- **Effects** on one item: a property by `"+17"`, `"-4"` or `"=0"`; `ml` the same for its liquid (`liquid` names what fills an
  empty vessel); `reveal: ["charge"]`.
- **Machine rules,** every hour (`machine.rules`; slots are named by their `name`):
  - `forEach: { slot, ...match }` + `hourly: { slot: effects }`: every match in the slot, every hour (the charger rack).
  - `needs: { slot: match }` + `hours` + `hourly: { slot: effects }` + `flow` + `done: { useUp: [slots], make: { slot: kind } }`:
    a job. It runs only while every slot holds a match. Missing an input pauses it and **keeps the progress**; running costs
    are paid every hour and the main input is taken at the end; a full output waits. No `hours` means it just runs (the well).
  - `flow: { from, to, ml, ratio, liquid }` moves liquid between two slots' vessels (the still: 100 ml in, half out as spirit).
  - `power` is counted per running hour (per item for `forEach`) in `state.power`, shown on the clock. Nothing bills it yet.
  - `label` names what it is doing; the panel head and the tooltip show each rule's state: "charging 2", "burning 1/3 h",
    "waiting: fuel (1/3 h done)", "output full", or "idle".
- **Uses:** `{ verb, on, where, target: effects, held: effects, useUp: ["target" | "held"], make: { kind: n }, hours }`.
  Made things go beside the target; no room means nothing happens. A use with none of these says it "does nothing yet".
  `pour` stays a built-in verb. The editor's "Can be used on" box and the server keep a use's effects when it saves.
- **Clock:** a tick is an hour; a day is twelve, 08:00 to 19:00, and the next tick is the next morning (`clock(tick)`).
- **Tooltip:** beside the hovered item (left of it if there is no room), never while dragging or sweeping. Name, [tags] in
  teal, the liquid and the shown properties ("?" while hidden), a machine's state, the description, then hints in blue
  (`drop onto a cell: read`, `double-click to open`). Value and price wait for step B.
- **Legacy kinds:** `"legacy": true` keeps a kind in the data and in old saves but out of the tray. Set on the farm and
  food kinds (cheese, ham, sausage, loaf, slice, egg, apple, hen, coop, flour sack, seedling, honey jar).
- **New kinds** (game-icons glyphs for now): **cell** 1x1 (`charge` 0-100, rolled, hidden), **cell gauge** 1x1 (`read` on a
  hidden cell reveals it), **charger rack** 3x3 (one 2x2 bay slot; +17 charge an hour, 0.5 hu per cell). Fuel burns down:
  coal 6 hours, log 3, split log 2, kindling 1. The starting field has the rack, four cells and the gauge along the bottom.
- `world.test.ts` covers rolling and reading, the charger and its power, a job that stalls and resumes, a full output, the
  clock, and old saves.
