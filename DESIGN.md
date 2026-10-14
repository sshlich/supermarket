# The Workshop (`inventory-v3`)

What is built. Since 2026-10-13 this branch is a clean slate: **the field, two counters above it, the handling, containers in
floating windows and the tooltip**, plus the dev tools to make items (the sprite editor and the gallery). The old items, rules,
machines, liquids, uses, clock and money were cut, along with the design notes (`IDEAS.md`, `LORE.md`, `SPECULATIVE/`). Since
then: a customer terminal and a first seed of items (below). The field starts empty.

Where the rest went: `inventory-v2` holds everything up to the drone work (items, sprites, the rules engine, the brainstorm
and the lore); `drones` is the same plus mail, job slips, papers, a drone and a launch pad, and `DRONES.md` (real-life drone
notes). The code here started from `12a606f` ("Items step A") with those systems taken out.

## Field

- A 25 x 20 grid: dark aubergine with a slightly lighter grid and a muted copper outline. Things sit straight on the grid
  with no backing.
- Irregular shapes: the grid handles a thing's real squares (a kind's `cells`, rows of `#` and `.`). Shoving moves a
  neighbour a cell at a time until its actual squares are clear (not whole boxes), so an L slides past another's empty
  corner. A fuzz test drops 300 random shapes and checks every result is a valid layout; a stats run over 2,000 nudges found
  half moved nothing and only 5 moved anything more than 4 cells. The geometry is `src/grid.ts`.
- The tray under the field puts any kind on it (first free spot, turned if that is the only way it fits), plus strict mode,
  "clear the field" and "start over". With no kinds it points to the editor.
- The layout is saved in the browser (`field-v3`); `settle` repairs a saved layout when kinds change (unknown kinds go,
  things whose slot is gone go to the field, overlaps get re-placed).

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

## Counters (2026-10-13)

Two counters above the field, for trading with customers (nothing trades yet: they are places to put things). Each is the
width of the field and four squares deep, with a brass rim and its name to the left.
- **Outside** (top): what a customer wants to sell you will be unloaded here.
- **Inside** (below it, nearer the field): what you want to sell to the customer goes here.
- The two sit close together (they belong to each other) and further from the field.
- They are places like the field: anything goes on them (containers too), and dragging, shoving, turning, strict mode,
  sweeping and dropping into containers work there the same. An item on one carries `at: 'outside' | 'inside'` (`COUNTERS` in
  `world.ts` holds their sizes). A save keeps them; anything that no longer fits a counter goes to the field.
- The page shrinks its squares until everything from the outside counter to the tray is on screen.

## Containers and windows (2026-10-13)

- A kind with `slots` is a container. Each slot is a small grid (`w`, `h`, optional `name`, `accepts` / `rejects` tags).
  Items inside carry `in: { host, slot }`, and their x, y are in that slot's grid.
- Containers do not go in containers, except kinds tagged `vessel`, and never more than two levels (`MAX_NEST`).
- Dropping a thing onto a container that would take it puts it inside (blue light, brighter under the pointer); a full one
  refuses it (red) and nothing gets shoved; one that never takes it is just another thing to rearrange.
- **Double-click a container to open it in a window.** The window floats over the page beside the container (right of it, or
  left if there is no room). Its body is the container's insides: one grid per slot, with the slot's name and tag rules
  above it. Everything the field does works inside it (drag in and out, between windows, shove, sweep, strict mode).
- **Windows float freely:** drag one by its header anywhere (part of it always stays on screen); touching a window brings it to
  the front. Where windows overlap each other or the field, only the topmost counts for dropping.
- **Fold** (–) shrinks a window to a tab in the rack along the top edge; clicking the tab brings it back where it was.
  **Close** (✕) shuts it. Double-clicking a container whose window is open brings that window to the front (and unfolds it)
  with a flash.
- **At most four windows** are open at once (`MAX_WINDOWS`); a fifth is refused with a note under the field.
- A window **stays open** when its container is moved, even into another container. It closes only when you close it or
  the container is deleted. Windows that are kept off the screen by a resize are moved back onto it.
- State: `windows: [{ id, x, y, folded }]` (screen pixels, the last one on top), saved with the layout. Old saves' docked
  panels are dropped.
- Known small thing: while dragging, the blue light on a container that sits under a window still shows through that window
  (the lights are drawn above everything, so they show through the held thing).

## Tooltip

Beside the hovered item (left of it if there is no room), never while dragging, sweeping or moving a window: the name,
[tags] in teal, the description, and "double-click to open" for containers. A dark panel with a muted red-brown border.

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
- **One by one:** each kind sits on a patch of field one square bigger all round. Under it: its id, size, footprint, slots
  and tags, and a fit line.
- **One field:** everything is packed onto one field as wide as the window, biggest first, each in the first free spot, the
  way `spawn` places things.
- **Controls:** square size, turn everything (`R`), tint the footprints, group by tag, and filter by name, id or tag. The
  view is remembered between visits, and the page reloads when a sprite or an item changes.
- **The fit line** is the rule from `npm run footprints` (taken squares 15%+ drawn, free ones under 2%), measured in the
  browser, so nothing needs installing. Hover the line for the coverage of every square. It agrees with the script.
- **Compare styles:** other versions of a sprite live in `src/sprites/styles/<style>/<kind>.svg`. The game never loads
  them. This view puts every version of a kind side by side, each with its own fit line. The style buttons draw
  "one by one" and "one field" in that style, falling back to the drawn sprite where a kind has no version.

## Tests

`npm test` runs `grid.test.ts`, `world.test.ts`, `editor/geom.test.ts` and `customers.test.ts`. `world.test.ts` brings
its own kinds rather than the game's: the old kinds as a fixture (`src/test/kinds.json`) and the old starting field. It covers dropping, shoving, turning,
strict mode, groups, irregular shapes, spawning, the counters, containers (filters, nesting, cascade, turning to fit), settling old saves,
and windows (closing with their container, settling, the cap).

## Customer terminal (2026-10-13)

A `>_ customers` button on the side of the field opens a terminal beside it (`src/customers.ts` holds the data and rules,
`main.ts` draws it; the terminal's state is saved apart from the field, as `field-v3-terminal`).
- One customer at the counter at a time. Opening it with nobody there calls the first. The header shows what they want as
  **text tags** (hover one for its meaning; `TAGS` in `customers.ts`): survival needs (food, drink, alcohol, medicine, light,
  book, valuable), not how things feel. The screen is the conversation from their side: a
  dim "customer N at the counter..." line, then their words typed out a letter at a time.
- **Controls** under the screen: on the left *dismiss* and *next customer*, on the right a big **SELL**. Sell judges the tags
  of what is on the **inside** counter (containers' contents included): wants that are met light up green and they say how it
  went. If everything they want is there they buy: they finish speaking, then go. Otherwise they stay and say what is
  missing. Nothing is taken from the counter yet (there is no money).
- **The screen is wiped after every customer** (dismiss, a sale, or next): a scan line sweeps down and the words fade behind
  it, then it is blank ("nobody at the counter"). The next customer's wants fade in one by one. Moves overlap safely
  (`seq` in `main.ts`: a slower one still going gives up when something newer happened).
- A special customer would be a `Customer` with its own behaviour; for now everybody is the same sort. "Start over" clears the
  terminal too. (The icons were dropped: game-icons, `src/icons/` and their script wiring are gone.)

## Items, the first seed (2026-10-13)

Eleven kinds in three categories plus storage, in `src/kinds.json`; the tray under the field is grouped by category. Each kind
has a `cat` and a `price` (coins); the tooltip shows what a thing is worth (its price plus whatever is inside it).

| Category | Item | Size | Tags | Price |
|---|---|---|---|---|
| food | Apple (property `origin`: real, or synthetic) | 2x2 | food (+ synthetic) | 4 (synthetic 2) |
| food | Sliced bread | 4x2 | food | 3 |
| food | Wine | 1x3 | drink, alcohol | 8 |
| sundries | Candle | 1x2 | light | 2 |
| sundries | Book | 2x3 | book | 7 |
| sundries | Locket | 1x2 | valuable | 15 |
| medicine | Pill (property `type`: painkiller, antibiotic, sleeping) | 1x1 | medicine | 2 / 5 / 3 |
| medicine | Blister (property `type`), a container | 2x1, holds 3x2 (six pills) | | 1 + its pills |
| medicine | Bandage (a roll standing on its end) | 1x2 | medicine | 4 |
| medicine | Antiseptic | 1x2 | medicine | 6 |
| storage | Steel cabinet, a container (front view: roller grate, ring pull) | 3x3, holds 5x8 | | 25 |

- **Properties.** A kind can list `props`: each property has values, the first the default, and each value an `Effect` (another
  name, description or price, more tags, and colours swapped in the sprite: hex to hex, or `none` to hide what had that colour).
  An item stores only the values that are not the default (`props: { origin: 'synthetic' }`). The synthetic apple is the
  same item as the apple: the property turns the muted, speckled, bruised skin into a flawless artificial red, hides the
  imperfections and makes the sheen a hard white gloss. A pill's type sets its two capsule colours (and its name and price).
- **The blister** spawns full: its slot has `fill: 'pill'`, so a new blister comes with six pills, which take on its `type`.
  The slot is `out` (take out only): nothing goes in, not even a pill back to another pocket of it. Its sprite shows each
  pocket as it is: a pill under a clear dome, or a torn hole where one was pushed out (the sprite reads `--in<n>` per square
  of the slot, which the game sets to 0 for empty ones). It is tagged `vessel`, so it goes into the cabinet.
- **Sprites** are drawn by hand as SVG (no icon silhouettes): muted colours, gradients, small imperfections, light from the
  top left, one cell = 32 units. Every gradient id is made unique per thing on the page, since two apples of different
  properties must not share one.
- Selling is unchanged: SELL judges tags (a thing's own and its properties'), and nothing is taken or paid yet.
