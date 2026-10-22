# The Workshop (`inventory-v3`)

What is built. Since 2026-10-13 this branch is a clean slate: **the field, two counters above it, the handling, containers in
floating windows and the tooltip**, plus the dev tools to make items (the sprite editor and the gallery). The old items, rules,
machines, liquids, uses, clock and money were cut, along with the design notes (`IDEAS.md`, `LORE.md`, `SPECULATIVE/`). Since
then: customers in a line who buy, sell and swap, money, a first seed of items and liquids (below). The field starts empty.

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
- Nothing sits under the field but a line for notes. Spawning things, strict mode, sound and a new game are in the menu
  (see "Menu and debug" below).
- The layout is saved in the browser (`field-v3`); `settle` repairs a saved layout when kinds change (unknown kinds go,
  things whose slot is gone go to the field, overlaps get re-placed; what fits nowhere on its own place goes to the field,
  then a counter, and only with no room anywhere is it lost, with what is in it). A broken save (a container inside itself,
  an id twice) is mended, not thrown away.

## Handling (the game page)

- **Turning is four-way.** `rot` on an item is quarter turns clockwise (0-3), so upside down is a real state. While
  dragging: `R` turns clockwise, `Q` back, right-click clockwise. It turns about its own centre, which stays where it was on screen. Squares can
  turn too (only the sprite changes). Auto-turning to fit (relaxed mode) only tries orientations with a different
  footprint. Old saves (`true`/`false`) are converted on load.

- **Selection.** Sweep a rectangle on empty ground to pick everything it touches (Shift or Cmd/Ctrl adds), Cmd/Ctrl-click
  toggles one, Shift-click toggles on release, `Cmd/Ctrl+A` picks all, `Esc` clears, `Delete` removes the picked. Grabbing
  one of several picked things moves them all, keeping their arrangement (a group cannot be turned).
- **Strict mode** (`S`, or in the menu; remembered): a drop is accepted only if every square is free and
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
- The page shrinks its squares until everything from the outside counter to the note line under the field is on screen.

## Containers and windows (2026-10-13)

- A kind with `slots` is a container. Each slot is a small grid (`w`, `h`, optional `name`, `accepts` / `rejects` tags).
  Items inside carry `in: { host, slot }`, and their x, y are in that slot's grid.
- Containers do not go in containers, except kinds tagged `vessel`, and never more than two levels (`MAX_NEST`).
- Dropping a thing onto a container that would take it puts it inside (blue light, brighter under the pointer); a full one
  refuses it (red) and nothing gets shoved; one that never takes it is just another thing to rearrange. **Several selected
  things** dropped onto a container (or into its open window where they will not go as they lie) are **packed in**
  (2026-10-20, `pack` in grid.ts: biggest first, turned where they must be, a bounded search), around what is in it, or
  failing that with what is in it shifted about too.
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

## Customers, the line and money (2026-10-14)

A `>_ customers` button on the side of the field opens a terminal beside it (`src/customers.ts` holds the customers and the
rules of a deal, `src/terminal.ts` draws the terminal and plays the deal out on the counters, with what it needs from the
page handed in by `main.ts`; the terminal's state is saved apart from the field, as `field-v3-terminal`).
- **The line.** Customers wait in a line and are served one by one; there is no clock. "let them in" opens the door when
  nobody is waiting, and a line of 3 to 7 forms (random for now: later something in the game should decide it). The header
  shows who is at the counter and how many are waiting. *next customer* calls the next one (whoever was there leaves);
  *dismiss* sends them away.
- **Customers are residents of the station** (2026-10-20, `data/station/residents.json`, the phase-1 ones): a bunk tenant
  from the Spine, a duct scavenger, a dock hauler, a foundry fitter, a smelter hand, a technician, a clinic orderly, a
  reactor engineer, a company clerk, a ring household, a fence. The header says who and from which deck (hover: what they
  are), and they open with a line of their own. Each comes in as a buyer, seller or trader by the **mix** (`MIX` in
  customers.ts: 40% buyers, 40% sellers, 20% traders), and then a resident who comes as that, as often as they do.
- **Three sorts of customer**, one big button that changes its word:
  - a **buyer** wants one or two **needs** (the station's: air, water, food, power, medicine, parts, comfort, luxury), those
    of the things on their own buy list (a fitter wants parts, an orderly medicine, a household food and luxury). Anything
    that serves the need counts (every thing names its need), less what their sort avoids (the ring avoids synthetic,
    the bunk luxury), unless it is on their own list. **SELL**: they take what they want from the inside counter and pay
    its worth plus their **markup**: drawn from 10 to 40% (`MARKUP`), nearer the top the richer their deck. The top fifth
    of the range are **nobles**: they carry half again the money and talk with manners ("Good day to you. I find myself in
    want of..."). A **package** (a container that comes full: a blister, a bag of bread) goes whole, with what is in it.
    Any other container is just itself: a food buyer takes the apple out of a cabinet and leaves the cabinet. Every buyer
    has a **budget** (their resident's range, shown as "has N$"); short of money for all of it they take what they can pay
    for, the dearest first. They **stay** and keep buying (SELL stays live) while they have money; the needs they have
    bought are lit in the header.
  - a **seller** unloads one to three things from their own sell list on the outside counter and asks for the lot (worth
    times 0.6 to 1.0, about 0.8). **BUY**: if you have the money, it is yours, and it slides across to the inside counter.
  - a **trader** unloads things from their list and wants needs. **SWAP**: they take what they want from the inside counter
    (by the same rule as a buyer) if it is worth at least 70 to 90% of what they brought (their slack), and the difference is
    paid in cash either way: you top up, or they do. Short of it, they say how much more it would take.
- **What they bring is never quite new**: cheaper kinds more often (a cabinet rarely), any property (synthetic apples, any
  pill), vessels part full of any liquid, blisters with pills already gone, cheese already cut into (never a sandwich:
  those are made). Their things stay theirs until a deal (the tooltip says so, and they cannot be offered back to them):
  you can move them about and open them to look, but not take anything out of them, put anything in them, put them in a
  container, or cut, pour or build on them. Dismissed or sent off with *next*, they take them back from wherever you moved
  them. They unload only when nothing is being dragged, and a reload while they are stepping up finishes it.
- **Nobody leaves on their own**: after a deal they stay at the counter until you dismiss them or call the next one. The
  big button greys out when they have nothing more to deal (a buyer with no money left, a seller or trader after their deal).
- The screen types their words (with soft key clicks; a redraw of the page carries on where it was), lights the wants that
  are met, and is wiped when they go (a scan line sweeps down).
- **Numbers where a decision needs them.** An item's tooltip has its worth in green with what it is made of (`7$ · 1 + 6
  lamp oil · storage · 1×3`) and what the customer at the counter makes of it ("Wren would pay 11$", "does not want this",
  "theirs: part of a 20$ lot"). Each counter has a **dial** to its left (black, green digits, like the money's): the total
  worth on it, and under that what the customer makes of it ("Hollis asks 20$" outside; "Wren pays 14$" inside, with a `!`
  when their money does not run to all of it). (A hover tooltip on the counters was tried first and dropped: it fought the items' own.)
- **Money** is a number on the main screen, left of the field: a black dial, green terminal digits with the leading
  zeros dim, and a `$` at the end. It counts to the new sum after a deal and glows (green up, red down). Saved with the
  field as `cash`; a new game starts with 50.

## Days and the trash (2026-10-14)

- **A day is one line of customers** (the user's rule): it starts when the door opens and a line comes in, and it is over
  when the last of them has gone (sent off with *next* or dismissed, nobody left waiting). Then the page goes dark, "day N
  is over / you sleep", the trash is taken out, and it lifts on the next day ("morning", or how many things went out).
  Nothing else counts time: there are no hours, and customers are never held back by time (an hours plan from ECONOMY.md
  section 2 was tried and reverted). `day` is saved with the field (`sleep` in `world.ts`); a small dial under the money
  shows it; a new game starts on day 1.
- **The trash**: a button under the day dial, like the customers' one, opens a small bin under it (5x6), a place like a
  counter (`at: 'trash'`; `PLACES` in `world.ts` holds it with the counters). Anything goes in, containers too, and comes
  back out until you sleep; then it is gone with whatever is in it. The button counts what is in it, a thing's tooltip says
  it is in the trash, a customer's things cannot go in, and open or shut is remembered.

## The furnace: the first machine (2026-10-14)

Built like the computer: a thing on the field whose window is the machine itself. For now it does one job: **two lumps of
ore (2x2) melt into one bar (3x2, lying flat)**. The rules are `src/furnace.ts` (pure, tested in `furnace.test.ts`).
- **Kinds** (`materials` and `machines` in the debug panel): **ore** (2x2, iron 3$ or copper 4$, the `metal` property: broken
  rock in lit facets banded with rust-red hematite or green malachite, glinting where it broke), **ingot** (3x2, iron 10$ or
  copper 13$: a cast bar seen from above and a little in front, four sloped sides, a hollow where it cooled, a stamp),
  **coal** (1x1, 1$, fuel: burns 15 seconds; as the small cell, a minute since 2026-10-20, so a bar pays) and the **furnace** (3x4, 40$, cast iron: a stovepipe, riveted bands, an arched
  crucible door with a mica window, the firebox door with its vents, an ash pan, feet). Its `fire` property lights it on
  the field: the mica and the vents glow, flames move behind the mica and smoke leaves the pipe. Customers now also want
  **metal** (a new tag, for bars); ore is wanted by nobody until it is melted.
- **The window**: the pipe (smoking when lit), the iron front with four rivets and a brass plate (MERROW FOUNDRY No 2), the
  **crucible** (4x2, takes ore) in an arched firebrick mouth, a heat dial whose needle swings with the heat, a line saying
  what it is doing ("cold. Drop a match or a lighter on the firebox.", "melting iron: 53% · last coal"), and the
  **firebox** (4x1, takes coal) behind its open door, the coal on a grate. Lit, the bricks glow from below, sparks go up
  from the crucible, flames lick up behind the coal and glow between the grate's bars, and the whole front warms.
- **Lighting**: drag a match, a lighter or the refillable lighter onto the furnace (on the field) or onto the firebox (in
  its window); both light blue while you hold it. A match is used up; a lighter goes back. No coal: "nothing to burn".
- **Burning in real time** while the game is open (never in the background, never held back by customers): the lump
  burning first, then the next; with none left the fire goes out. Two lumps of the same ore heat together (24 seconds of
  fire) and become one bar in the crucible, which comes out white-hot and cools to its colour, with a ring and a hiss.
  The fire going out keeps how far they got; ore taken out of the crucible starts again from cold; what is in hand is not
  burnt. The heat (the dial, the glow) comes up over 6 seconds and fades over 25.
- **The gauge** on anything in the fire: the sprite goes dark, and a white line rises from the bottom with its own colours
  below it (`heat` on the item, 0 to 1, saved).
- Sounds: a match striking and the fire taking, soft crackles while its window is open, the fire dying, a bar cast; ore
  knocks like rock, coal is gritty, the furnace clanks.

## Items, the first seed (2026-10-13)

Twelve kinds in three categories plus storage, in `src/kinds.json`; the debug panel lists them by category. Each kind
has a `cat` and a `price` (coins); the tooltip shows what a thing is worth (its price plus whatever is inside it).

| Category | Item | Size | Tags | Price |
|---|---|---|---|---|
| food | Apple (property `origin`: real, or synthetic) | 2x2 | food (+ synthetic) | 4 (synthetic 2) |
| food | Sliced bread | 3x2 | food, bread | 8 |
| food | Wine bottle (dark glass, comes full of wine) | 1x3, holds 4 | from its liquid | 1 + liquid |
| sundries | Candle (a tall taper, standing, lit) | 1x3 | light | 2 |
| sundries | Book | 2x3 | book | 7 |
| sundries | Locket | 1x2 | valuable | 15 |
| medicine | Pill (property `type`: painkiller, antibiotic, sleeping) | 1x1 | medicine | 2 / 5 / 3 |
| medicine | Blister (property `type`), a container | 2x1, holds 3x2 (six pills) | | 1 + its pills |
| medicine | Bandage (a fat roll standing on its end) | 1x2 | medicine | 4 |
| medicine | Antiseptic | 1x2 | medicine | 6 |
| storage | Bottle (clear glass, cork) | 1x3, holds 3 | from its liquid | 1 + liquid |
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
- **Liquids** (`LIQUIDS` in `world.ts`): water (drink), wine (drink, alcohol), spirit (alcohol, medicine), lamp oil (fuel),
  each with a colour, how see-through it is, tags and a price a unit. A kind with `holds` is a vessel: an item carries
  `fill: { liquid, amount }` in whole units, one liquid at a time; `liquid` on a kind makes a new one come full. A vessel takes
  its liquid's tags (a bottle of water sells as a drink) and is worth its own price plus the liquid. **Pouring:** drag a
  vessel onto another that is empty or holds the same liquid (they light blue, brighter under the pointer): all that fits
  goes across, the one in hand goes back where it was, and a note under the field says how much. No mixing.
- **State-based sprites for vessels.** The game sets `--fill` (0 to 1), `--liquid` and `--liquid-o` on a vessel's sprite.
  The sprite clips a block of liquid to the inside of the glass and slides it down by how empty it is, with a lit surface on
  top. The clear bottle shows the liquid plainly; the dark wine bottle shows it darkly, and a light line marks the level.
  `--fill` is a registered CSS property, so after a pour both bottles' levels glide to their new height. A vessel turned on
  its side keeps its level drawn along the bottle (the liquid does not settle yet).

## Books (2026-10-14)

Books can be opened and read. Each book is a Markdown file in `src/books/`: copy `_template.md`, give it a `title`,
`author`, `cover` (a hex colour) and a `blurb` between the `---` lines, then write. Blank lines part paragraphs, `# ` starts
a chapter on a new page, `*words*` are italics. Files whose names start with `_` are left out. `src/books.ts` reads them
all and makes each one a value of the book kind's `title` property: a book on the field is one particular book, with its
title as its name, `By <author>. <blurb>` as its description and its cover colour swapped into the sprite's leather (light,
middle, dark, spine and worn corners are worked out from the one colour). The debug panel has a button per book, and customers
bring any of them. Three to start: *On Keeping Water* (a manual), *The Lamplighter* (a short story) and *A Ledger of Small
Trades* (a shopkeeper's notebook).

**Double-click a book to read it** (`src/reader.ts`). It opens over the page as a two-page spread on its cover: the
endpaper (the cover colour, patterned) and a title page first, then the text in a book face (the best serif the system
has: Iowan Old Style, Palatino, Georgia), justified and hyphenated, with a running head, page numbers, chapter headings in
small caps and a drop cap at each chapter. The text is cut into pages by measuring as it fills: a paragraph that does not
fit carries on overleaf without an indent (the cut line is set full width). Click the right page or press → / space to go on, the left page or ← to go back;
Esc or a click outside closes it. **float** puts the book in a window of its own beside the field (moved by its header,
smaller pages, the field still works; only the arrows turn its pages), **full** puts it back over the page; the choice and
the window's place are remembered. Resizing the window re-cuts the pages. A page turns as a leaf falling over the spine, with its next page on its back and a
shadow that is darkest when it stands upright. While a book is open its keys do nothing on the field.

## Sounds (2026-10-14)

All made on the spot with Web Audio in `src/sound.ts`: short tones and filtered noise, a little different every time.
Things sound like what they are made of (several picked up or put down together: each material once, the most common
first, at most three, a beat apart and softer, so they stay clear rather than muddy): a kind's `sound` in `kinds.json` names its material (glass, paper, metal, foil,
pill, food, wrap, cloth, wax, gold; anything else is a plain thing), and each material has a sound for being picked up, put
down and used. Glass clinks and pours in glugs, a book rustles and thuds, the cabinet clanks and its grate rattles, foil
crinkles, pills tick, the locket's chain jingles. The shop has its own: a bell when a line comes in, coins in and out,
a dull buzz when a drop is refused, the terminal's keys, the wipe, a customer leaving with their things, a page turning.
On/off and volume are in the menu (remembered). The rule: quiet, soft and never in the way, but each one recognisable; a
gentle low-pass on everything keeps the highs from being shrill (glass is a low, round clink, not a ping).

## Menu and debug (2026-10-14)

The bottom of the field is clean: only the note line. `src/menu.ts` holds the rest.
- **Menu**: the "≡ menu" button in the top left corner, or **Esc** (when nothing is selected; Esc first clears a
  selection). A small panel over the page: sound effects (on/off and a volume slider), music (none yet), strict handling,
  the debug panel (on the dev server only, not in a build), and a new game (click twice: it empties the shop). Esc or a
  click outside closes it.
- **Debug panel**: a window over the page, moved by its header and left where it was put, opened from the menu. Money
  (**+100$**), the field (clear it), and every kind of thing to spawn, by category: one row each with its colour, name,
  size and price, and a button per variant (real or synthetic apple, each pill type and blister, each book, a bottle empty
  or full of each liquid). New things go on the field, on the first free spot.

## The wired terminal: a computer, and discs (2026-10-14)

A first, small version of the computer idea (`IDEAS.md`): the feel, the CRT, the power switch, and a disc tray.
- **The wired terminal** (`computer` kind, 3x3, 60$, tech; sellable, tagged valuable): an all-in-one CRT in a beige case.
  Its `power` property swaps the sprite's colours, so on the field it shows a green screen and a lit light when it is on,
  and lines of text that step up the screen while the bottom one types itself out: in bursts and pauses, each line its
  own length and its own while (eight lines a loop, generated from a fixed rhythm), a small cursor riding the typing. Double-click opens its **window**: the CRT in its bezel, and under it the power switch, the light,
  the maker's name and the **disc tray**, the machine's one slot (2x2, takes things tagged `disc`), handled like any place.
  The window can **fill the page** (⤢ in its header; everything else dims around it) and back (⤡); filling the page,
  the switch, the light, the maker's name and the drive grow with the screen, and the whole machine fits the window.
- **The screen** (`src/computer.ts`): off, dark glass. Switched on, a soft thunk and the tube's hum, then a few lines of BIOS
  typed out, a check of the drive, and a small desktop in the dark-98 look: one icon, A:, and a taskbar ("A: ready" or
  "empty"). Opening A: makes the drive click and whirr for a moment and lists the disc's files with their sizes; with no
  disc it is the old "A:\ is not accessible. The device is not ready." A file opens in Notepad. The picture is a fixed
  320x240 display scaled up; the glass is curved at the corners, darker at the edges, with scanlines, a soft glare and a
  faint flicker, so it reads as a tube without bending where clicks land. What the screen is doing is kept by machine in
  memory, so the field redrawing does not reset it; a machine left on comes back at its desktop after a reload.
- **Discs** (`disc` kind, a 2x2 floppy, 3$: drawn as a real 3.5-inch disk, label side: a cut corner, the insert arrow,
  a brushed shutter in its channel with the brown disc behind its window, a paper label with a printed band, ruled and
  written on in pen, the write-protect window and the density hole): each one is a Markdown file in `src/discs/` (copy `_template.md`): its label, the
  colour of its plastic, a line for the tooltip, then its files, each under `# NAME.TXT`. `src/discs.ts` makes each one a
  value of the disc kind's `content` property (its name, blurb and plastic colour). Three to start, shards of the world:
  *SYNTH-AG / BATCH QC* (a synthetic-food plant's last records), *MERROW ST. LIGHTING* (the town's lamp schedule, and a
  complaint), and an unlabelled disc (a shopkeeper's diary, a corrupted file, a price list). Customers bring discs
  (they are cheap, so they come often); a seller never brings a machine switched on.
- Later (`IDEAS.md`): parts, a case and configuration, screens; more programs; files as things.

## A bigger screen, and programs as things (2026-10-16)

The computer's second step (`IDEAS.md`, "Computers and devices, round two"): the screen grows, and programs become files
with stats that come on discs.
- **The screen is 640x480** (it was 320x240), scaled to fit: in a window as big as leaves room for the field (never past its
  own size), filling the page as big as fits. The boot lists the machine's processor, memory and disk.
- **A machine has stats** (its kind's `computer`: `memory` K, `disk` K, `speed` MHz; the WT-2 is 640K, 2048K, 8 MHz),
  shown on hover with how much of its disk is free. The system (WT-DOS) takes 160K of memory and 520K of disk.
- **Two drives.** A: is the disc in the tray: read only, 1440K. C: is the machine's own disk, kept on the item
  (`item.drive`: files with a name and a program, a text or a picture), so files go where the machine goes, sold with it.
- **Programs are files with stats** (`src/programs.ts`): size (K on a disk), memory (K while running), the speed they want,
  and licensed or not. Four are in the machine itself: **Files** (A: and C:: open, copy to C:, delete, set a picture as
  wallpaper), **Notepad** (read a text, write and save your own on C:), **Prompt** (DIR, A: and C:, TYPE, COPY, DEL, REN,
  MEM, VER, CLS, EXIT, a program's or file's name to run or open it; up and down for history) and **System** (memory, C:
  and A: as bars, what takes what). The rest come on discs, a file named like the program (`# PAINT.EXE`): **Paint** (
  shareware, 8$: 160x120 in sixteen colours, a pen, a brush, a fill; saves .PIC to C:; any picture can be the desktop's
  wallpaper), **Stocktake Pro** (licensed, 25$: everything you own on the field and in what is on it, counted and valued;
  pointing at a line lights those things up on the field) and **Mines** (5$: nine by nine, ten mines). Discs can have a
  `price`.
- **Running one** takes its memory; if there is not enough, it says how much it needs and how much is free. It loads from
  the drive it is on, at that drive's speed (a floppy 200K a second, the hard disk 900K), slower on a machine slower than it
  wants, with a bar on the taskbar and the floppy whirring; one thing at a time, the rest waiting their turn. **Copying to
  C:** takes time at the floppy's speed and room on C:; taking the disc out halfway fails it. A **licensed** program starts
  only with its own disc in A:, so a copy on C: loads faster but is no use without the original (copying it does not make a
  second one to sell). Shareware runs from C: alone.
- **The desktop:** icons for A:, C:, the four built in and every program on C:; windows that move by their title bars
  within the screen, minimise and close; a taskbar with what is running (in the order it was started), what is loading,
  the memory left and the drive. Alerts are modal. A new window takes the keys; whatever is typed in survives the field
  being redrawn (`keepFocus` in main.ts).
- Not yet (`IDEAS.md`): writing to discs (blank media, and what copying costs), devices plugged in (printer, modem), more
  programs and computers, patches, viruses.

## The boot, picture discs, and the Wire (2026-10-16)

- **The boot, after the old machines'** (`computer.ts`, about five and a half seconds, a click skips it once the tube is
  warm): the tube warms up (a line of light opens into a grey glow), the BIOS checks the machine in green on black with the
  maker's mark top right (a tube with a bolt, "WIRED SAVES POWER"), the memory counting up to 640K and OK, the drives, and
  "Press DEL to enter SETUP" at the foot; then the system's splash (a view from a station window: stars, a planet's lit edge,
  WT-DOS 3.1 in italic serif, a rainbow bar sliding along the bottom) with a soft start-up chord; then the desktop. Off, the
  picture collapses to a bright line and a dot. A program loading from a disc for more than a moment shows its **splash**
  (its name as sold, a line, a bar): Pixel Paint 2.1, Stocktake Pro 4 ("licensed to serial ..."), Mines.
- **Picture discs** (`scripts/pics.py` makes them): twenty public-domain pictures from Wikimedia Commons, each fitted into
  160x120 and dithered to the sixteen colours, packed in base64 as `# NAME.PIC` files with an INDEX.TXT of captions.
  *EARTH, AS PAINTED* (6$): the Great Wave, the Starry Night, the Mona Lisa, the Scream, the Girl with a Pearl Earring, the
  Wanderer, Hunters in the Snow, Impression Sunrise, Sunflowers, the Hay Wain. *THE LONG WAY OUT* (6$): Earthrise, the Blue
  Marble, Aldrin on the Moon, a bootprint, Saturn, Jupiter, the Pillars of Creation, the Crab Nebula, the ISS, Columbia
  leaving. **Pictures** (built in) shows a drive's pictures with their captions, one after another, copies one to C:, sets
  one as wallpaper, or opens it in Paint.
- **The Wire** (`web.ts`): the station's network, and **Wirewalk**, the browser the machine comes with (192K). The first
  page dials up (a box with the steps, and a muffled modem: seven soft tone pairs, a carrier, a hiss); the line stays up
  until the machine is switched off (a "Wire" light on the taskbar). Back, forward, reload, home, an address bar (type
  `swap.wire` and Enter), a globe that turns while a page comes in a band at a time, a status line. Pages look like the old
  web: Times, blue underlined links (purple once followed), bevelled grey buttons, a ticker, hit counters, an under
  construction bar. Sites:
  - **home.wire**, the portal: where to go, today's day and the decks' temperatures, the picture of the day, a search box.
  - **store.company**, the Company Store: everything new with a price, by category, drawn with its real sprite, at the
    shops' markup over its worth (`markup` in outside.json, 5%; `worthOf`, orders.ts: what a new one is worth, made and thrown away).
  - **swap.wire**, Swapline: eight listings a day from residents (made as customers' goods are: used, part full, cut into),
    at their own prices, by seller and deck, with a line each; and two WANTED notices. Bought, a listing says SOLD.
  - **soft.wire**, the Software Cellar: shareware downloads straight to C: over the line (16K a second, at the taskbar's
    bar; it needs room), and the licensed Stocktake as its key disc, ordered.
  - **gallery.wire**, the Gallery: both picture discs to look through free, one picture to take home for 1$, the whole
    disc ordered for 6$, and a picture of the day free.
  - **news.wire**, Station News: four stories a day from a pool (scrubbers, lettuce, the tithe, the convoy, a lost cat).
  - **bank.company**, Company Credit: the balance, what is on its way and when, and what was paid on the Wire.
  - **seek.wire**, Seek: a search over the Wire's pages. **ring.wire**, the Spine Ring: homepages made by hand, with a
    ring bar on each (Tomas's lamp collection and his **guestbook**, which you can sign and which keeps what you wrote;
    Mira's hydro corner; Pip's Mines high scores). Anything else: Not Found.
- **Buying** (`orders.ts`): every shop shares one cart (**cart.wire**; kept while the page is open). Paying takes the money
  now (declined if there is not enough) and places an order: by **drone** (3$, lands in 45 seconds) or by **freight**
  (free, the next morning). It lands on the outside counter, or the field, or the inside counter, wherever there is room;
  what has no room waits and comes when there is. A bell and a note say what came. Orders and the Wire's memory (order
  numbers, swap listings sold, the guestbook, the bank's lines) are saved with the field.

## Mail orders and shipping, selling on Swapline, the printer, flying bread (2026-10-16)

The computer's work for the shop (`STATION.md` sections 7 and 8, the other session's `data/station` boxes and orders as
the shape: box sizes and fees, wants with counts, due days, late pay):
- **Wiremail** (built in, 96K; on the desktop, and the taskbar's envelope says how much is unread): the mail is on the Wire,
  so it dials first. Folders: all, new orders, jobs, done. **Every morning two or three orders come** (`orders.ts`), from
  people on the station by deck, each with what it wants (drawn, with how many you have of each, whole), what it pays on
  delivery, its due day, and which box it would fit. The bunk tenant on the Spine pays thin and gives days; the clinic
  orderly wants dressings fast; the Ring household pays well for real food and wants it in two days; the collector pays
  double for old things. Now and then spam (a free cell, a cheap licence from the Fence). The first morning brings the
  Company's welcome, which says how it all works. Accept or decline; an order nobody takes lapses after its day.
- **The printer** (`printer` kind, 3x2, 30$): drop it on a computer to plug it in (two ports; drop again to unplug), drop
  a **ream** (`paper`, 2x2, 5$, fifty sheets) on it to load it. Programs print through it (a few seconds, soft dot-matrix
  ticks, a sheet a print): Notepad prints the text (a **printed page**, which double-click reads like a book), Pictures and
  Paint print the picture (a **print**, 3$, landscape on fanfold paper, the picture itself drawn on it), Wiremail prints an
  order's **slip** (1x1, a card with a punched hole and a bar code). A sheet comes out below the printer.
- **Boxes** (`box_s` 2x2 holding 4x4, 1$, fee 2$; `box_m` 3x2 holding 6x4, 2$, fee 3$; `box_l` 4x4 holding 8x8, 3$, fee
  6$): pack the goods and the slip in. The **tape gun** (`sealer`, 2x1, 4$) dropped on a box tapes it shut: brown tape
  along the seam, nothing in or out, no window. A knife on a sealed box cuts the tape. Hovering a box says what it holds
  and, with a slip in it, what it would pay if it shipped tonight.
- **The dock** (a button under the trash, like the bin: an 8x6 place that takes boxes only): sealed boxes with their slips
  go with the carrier **at night**, and are paid **on delivery**, in the morning, for what they held of the order (whole
  things: an uncut bread bag, a full bottle), four fifths if late, less the box's fee. The line under the dock says what is
  ready and what it will pay; the morning says what was delivered and how many orders came; the carrier's mail says what
  each paid. A box without its slip, or not sealed, stays.
- **Selling on Swapline** (`swap.wire/sell`): what is on your floor and free to go, by name, with its worth; set a price
  and list one. How soon it sells is shown as you price it (likely in a minute or two at a kind price, unlikely high).
  Every twenty seconds each listing has its chance; sold, the thing is gone (a courier), the money comes less Swapline's
  tenth (a dollar at least), and a mail says who bought it. A listed thing says so on hover; take it down any time.
- **Flying bread**: a computer left alone for a minute saves its screen. Slices of bread with white wings, and the odd
  slice of toast, fly down and across a black screen, flapping. Moving over the screen, or a key, wakes it; `SAVER` at the
  prompt starts it now.
- The debug panel can **sleep now** (end the day), to see the night's pickup without serving a line.


## The station's items: every thing in the game is a station thing (2026-10-19)

The game's kinds now come from the station data (`data/station`, made for `STATION.md`): **441 kinds** (318 items, 49
machines, 3 boxes, 67 discs, and 4 of the game's own with no station thing: the pack, the computer's disc, a printed sheet,
the tape gun).
- **`node scripts/station-kinds.ts`** writes `src/kinds.json`. Each station thing is a kind by its station id
  (`it_food_apple`, `mach_smelter`). The station owns its name (for new things), size, worth (`price` is the station
  `value`), tags, what it is made of (`made`), the need it serves (`need`), its tier and its slots. The game keeps what it
  added: colour, sound, sprite, behaviour (cutting, pouring, smelting, a computer's insides) and properties. Run it again
  whenever the station data changes; it rewrites only the station's fields. New kinds get a colour and a sound from their
  main material, a store category from their domain and tags, and the game's want tags (`metal` for bars, `valuable` for
  luxuries and heirlooms, `fuel` for cells, `tool` for whatever the night's places lock on).
- **The old kinds moved** to their station ids (`src/aliases.ts`): a kind that was one thing with a property became one
  station item per value (iron and copper ore; three pills; three filled blisters), its colours baked into a copy of its
  sprite. Old saves are mended on load (`settle`): items, orders on their way and mail orders' wants. Coal became the small
  cell (it burns in the smelter's firebox for now); the furnace is the smelter; the computer is the terminal.
- **Sprites for everything.** About 330 new ones, drawn to the station footprints in the existing flat style, checked by
  `node scripts/check-sprites.mjs [ids or prefix*] [--sheet out.png]` (the file, the viewBox, and in a real browser every
  taken square at least 15% drawn and nothing in a free one; `--sheet` lays them out on squares to look at). Every floppy
  disc shares the disc sprite and every memory card one card sprite (`sprite` on the kind). The printer is 2x2 now, as the
  station has it. Prices are the station's, so some are fractions (slag is worth 0.2).
- **Customers** bring any item, but not machines, fittings, blueprints or contraband. Mail orders want station items.
- Not yet: the station's machines and recipes do not run (only the smelter, which is the old furnace); needs, residents,
  events and upgrades are not in the game.

## Substances and more (2026-10-20)

Nineteen more station items, mostly what people take to get through a shift, after real ones (in `data/station`, with
sprites): **hydro smokes** (cigarettes; fire, so contraband), a **vapour pen** (licensed nicotine), a **chew tin** (snus),
**algae beer**, a **gas whip** (nitrous), **coffee brick** (real ring coffee), **cough syrup** (codeine), **desk strips**
(the Hub's licensed focus strips), **painwash** (a morphine auto-injector, licensed), and contraband: **tray leaf**
(cannabis), **miner's leaf** (khat and coca), **duct caps** (mushrooms), **crank** (meth), **ring snow** (cocaine),
**dock candy** (MDMA), **blotter** (LSD), **black resin** (opium), **spacer spice** (synthetic cannabinoid) and a **glass
pipe**. Each has a station `use` (energy, wired, crash...) for when using your own stock comes in.
- The legal ones come by crate (the Company Store, which never stocks contraband); the rest through walk-ins: the fence,
  the scavenger, the smelter hand and the hauler sell them (residents who deal in contraband now bring it to the counter),
  and the sites turn some up (caps in the ducts and the sump, smokes and spice in the dark bunks, syrup at the clinic).
  The spine swap stall sells beer and chew; the ring concierge coffee and vape pens.
- Residents buy them for their reasons: the Works chews and drinks, clerks and technicians want coffee and strips, the
  orderly wants painwash and syrup, the ring household coffee and snow, the fence the dear contraband.

## Machines run: the station's recipes, energy, cells, overnight jobs (2026-10-19)

`STATION.md` sections 5 and 6, built (`machines.ts`). Every station machine with recipes runs (31 of them, 302 recipes in
`src/recipes.json`, written by `scripts/station-kinds.ts`), and the recycler and the charger do their generic jobs. The
smelter is still the old furnace (real-time fire, see furnace.ts); the computer and the printer do what they did.
- **A machine is a container with slots by role**: input, output (take out only), cell, tray (a disc), tool. Double-click
  it: under its slots, its window says what it is doing and **what it can make** with what is in it: the ready recipes
  first, each with what comes out, then the nearest with what is still missing (inputs, a tool, charge). A recipe on a disc
  shows once its disc is in the tray.
- **Now or overnight.** A ready job runs **now** for its energy (the dial under the day: **7 a day**, full again when you
  sleep), done at once; or **overnight**, free, the machine held till morning (nothing in or out of it). A growing recipe
  takes nights (hydro greens: three). Outputs go to the output slots, else the input slots, else the field beside it; a
  job whose outputs would find no room does not run, and nothing changes.
- **Cells** in the cell slots hold charge (a small cell 10, a medium 30, a large 100); a job drains it, the emptiest cell
  first; a flat cell stays (the tooltip says how much is left) and the **charger** fills it for 0.2$ a unit. Tools a
  recipe needs must be in the machine and wear a use a job.
- **The recycler** gives anything with materials back as unit items (iron scrap, polymer flake...), nine tenths, the tenth
  as sludge; part-units stay in the machine for the next job.
- The station's slot tags are widened where they would refuse their own machine's recipes (the hydro bed takes nutrient),
  and an input slot grows to fit the biggest thing its recipes need (a bottle in the still).
- Saved: a job overnight (`job`: the recipe, the nights to go, what will come out), a cell's `charge`, the recycler's
  `residue`, your `energy`. The morning says which machines finished.
- Mail orders now also come from a fab hall foreman (bars, sheet, wire), a spine row warden (clean water) and a ring cook
  (herbs, greens); the fab hall loading bay buys bars, sheet, wire and parts at 75% at night.
- Not yet: hand recipes (`mach_hands`), modify and do recipes, the copier, statuses (jammed, hot), automation.

## The window: an advertising space (2026-10-21)

A pane of glass (12x3, a teal rim, a `window` dial to its left) above the counters (`glass` in `PLACES`, world.ts). It takes goods
(not boxes, machines or furniture; a fixture tagged `glass` is made for it) and is the shop's advert: what is out draws the
people who need it. A thing in the window pulls twice as hard as one on the inside counter (`pull`: +0.2 weight on its need,
x2 in the window, +0.2 on the counter), and a resident who comes to buy is picked by the mean pull over what their list needs
(`liked` in `arrive`, customers.ts); a full window brings people too (`footfall`: one more for every three things in it, at
most two, on top of the line's 3 to 7). Things in the window are shown, not sold: take one down to the counter to sell it.
Not yet (ideas): fixtures that give bonuses while in the window (a coin tray, a lamp), printed ads (scanned from items or a
disc image), reputation per deck, and a bigger or better window as an upgrade.

## The night outside: the map, sites, shops, a pack and one tool (2026-10-19)

The night of `STATION.md` 8b (`outside.ts`), from the station data's `data/station/outside.json` (the sim plays the same file):
- **The evening.** When the last customer of the line has gone, the door shuts (no new line forms until morning) and the
  terminal's place shows **the map**: ten sites and five shops. Each site lists its searches (counting the tool in your hand
  now), its lock, what it tends to turn up; each shop what it sells and what it buys; a button: go, or why not. Below them
  is **stay in and sleep**. Going out costs no energy and nothing counts time: a night is one outing, to one place.
- **You** (a button under the dock, always open at night): a body. The **back** takes one pack (tagged `pack`); the
  **hands** are two **flex slots** (2026-10-20): each holds one thing of any size, drawn shrunk to fit its square frame (a
  furnace too). Hand to hand, the two swap. A tool in either hand opens a site's lock or adds its bonus, and each that
  served wears a night. Out at night the hands are in reach like the pack: carry a big find home in them, or buy into
  them at a shop. What you leave on you is there tomorrow, so the last kit is remembered for free. A new game starts with a **canvas pack** on your back (3x3, a 4x4 inside).
- **Sites** (searches; lock or bonus): Spine ducts (6; a torch +2), Dark bunks (3; torch), Works slag heap (8; a wrench +2),
  Dead scrubber bay (5; a mask refill, used up going in), Core cableway (3; wrench), Sealed hatch row (3; cutters), Flooded
  sump (4; rebreather), Ring service corridor (3; a key fob), Clinic back room (4; a loupe +2), Junked terminals (4; a
  soldering iron +2). Their loot is salvage: scrap, junk, spent filters, chemicals, heirlooms now and then.
- **Out at a site** the field and the counters dim and are out of reach. The panel shows the **ground** (an 8x8 place) and
  the pack's window opens. **Search** turns up one find, drawn by weight from the site's table, onto the ground, and you drag
  what you want into the pack. A search with no room on the ground is not spent. Only the ground and the inside of the pack
  on your back take or give anything until you go home.
- **Shops**: the scrap yard (buys anything at 35% of its worth), the dock counter (ore, ice, greywater, gas; buys parts at
  50%), works hardware (the torch, the wrench, refills, cells, cutters, a loupe, a soldering iron, a rebreather; buys tools
  at 50%), the ring concierge (a key fob, soap, scent; buys luxury and comfort goods at 60%) and the spine swap stall
  (rations and refills; buys food and water at 50%). Out at a shop, the ground is **their counter** with tonight's stock
  (each kind's daily restock, as many as fit), each thing at its worth plus the shops' markup (`markup` in outside.json, 5%; hover). **Taking one into your pack buys it** (the
  money goes; you cannot take what you cannot pay for); taken back out it is theirs again and the money comes back. **One of
  yours laid on their counter sells it** at their floor price, if they buy that sort of thing (hover says what they would
  pay), and it is gone.
- **Go home and sleep**: what is left on the ground stays there (the site fills again by tomorrow night; a shop restocks).
  The tool in your hand has had a night if it served the place (a lock or a bonus): a tool `wears` (the torch 12 nights, the
  wrench 20, cutters 20...), its tooltip and the you panel say how many are left, and one worn through is gone. Then you
  sleep as before (the trash, the carrier, the morning's mail), and the morning says what came home in the pack.
- Saved with the field: being out (`out`: the place, the searches left, a shop's buy rule), the evening (`night`), the
  things on the ground with their prices, a tool's `used`. The debug panel's **sleep now** ends the night too, bringing you
  home first if you are out.
- The game shows every place; the station data puts the five newer sites and the concierge in phase 2 (the sim's phase 1
  plays the first five sites and three shops). Not yet: phases in the game, varied nights (rumors, finds that follow
  shortages), bigger packs.

## How a game starts: presets (2026-10-20)

A new game no longer starts empty. The first load with no save, and *start over* in the menu, show **a new stall**: a card
per preset, with what it brings drawn at the field's scale, its cash, and what it all is worth. A pick starts the game over
with it (the morning's mail comes at once); from the menu there is also *back to the game*. Nothing is saved until the first
pick, so a reload before it shows the cards again.
- The presets are `presets` in `data/station/start.json` (each: `credits`, `things` put on the field biggest first, a
  `hand` tool), read by `start()` in `world.ts`. The sim still plays the file's `things` (the company issue).
- **Smelter** (30$): the furnace, 4 copper and 4 iron ore, 6 coal, a lighter; a wrench in hand (the slag heap +2).
  **Deli** (40$): a cheddar wheel, 2 salami, 3 bread, a knife. **Mail order** (20$): the wired terminal, the printer, paper,
  boxes, a tape gun, bread and bandages for the first orders. **Scavenger** (50$): cutters and a wrench, a torch in hand, and a life: gloves, a mask refill, a ration, a water ration, a bandage, a spare cell and some salvage from the last trip (scrap, duct junk, spent filters). Also **Clinic orderly** (40$: chem bench, first-aid and dressings, a loupe in hand), **Grower** (35$: hydro tray, work light, seeds) and **Tinker** (40$: workbench, circuits and parts, a soldering iron in hand); the first three each got a few more things of their trade.
  The pack is on your back in all of them.

## Shelves that show what is on them, and one clock (2026-10-14)

- **Furniture** (a category): a **disc holder** (2x3, black plastic, 12$) and a **bookshelf** (4x4, wood, 24$). Their
  sprites are drawn from what is in them (`src/fill.ts`: a kind with a painter has an empty `<g class="fill"></g>` in its
  sprite, filled from its contents by where each thing sits and its colour):
  - the disc holder's inside is 4x8: eight shallow shelves, one 2x2 disc each (row by row, left to right). A disc lies flat
    on its shelf, so the front shows only its thin edge, in the disc's own colour, with the label wrapped over it.
  - the bookshelf has two shelves, each 12x3 inside (six books standing). A standing book shows its spine where it stands,
    in its cover colour, with gilt bands, a little taller or shorter than its neighbours; a book turned to lie down shows
    as a flat block where it lies.
- **One clock for looping animations.** Everything that loops (the terminal's lines, the screen's flicker, the cursor)
  starts its loop at minus the time since the page loaded: main.ts sets `--clock` on whatever it draws (the page, the copy
  in hand while dragging, a machine's screen) and the animations use it as their delay. A redraw or a drag carries on in
  step instead of starting over.

## Things you take apart, and lighters (2026-10-14)

Painted sprites (`src/fill.ts`) now mark their painted part with `<!--fill-->` and `<!--/fill-->`. What the file has there
is the thing as it comes, written by `node scripts/fills.ts` from the painters themselves (a new one spawned, full), so the
gallery and the footprint check see the whole thing; the game paints over it from each item. Painters run before the
item's ids are made its own, so they can use the sprite's gradients. A slot's `fill` can say how many it comes with
(`count`), and a vessel can take only some liquids (`liquids`).
- **Sliced bread** is a bag of eight 2x2 slices, not a container: double-click it and a slice lands beside it; drag a slice
  onto the bag (it turns blue) and it goes back, if the bag has room to grow. The footprint follows the slices: 3x2 with five
  or more, 2x2 with fewer, and an empty bag stays as a crumpled 2x2 (a `cut` kind with `keeps`). The loaf is as long as the
  slices left, cut lines between them, its heel rounded and its cut end square and pale; the bag shortens round it and the
  twist rides on its end. Its printed label shows while six or more are left.
- **The knife, the first tool** (tools; 1x3, a kitchen knife, `cuts`): while you hold it, everything it can cut lights blue
  (bright under the pointer); drop it on one and a piece comes off, with a soft slicing sound, and the knife goes back.
  Things cut with it (`cut` on the kind) are not containers: they hold a count (`left` on the item) and shrink as it
  goes, from the side the pieces come off, the rest staying where it was (however it is turned). The last cut splits the
  two that are left, and the thing is gone. Pieces go on the free spots nearest the side they came off, in the same place
  (or the field), as old as what they came from; no room, no cut. **A cut thing is worth its pieces** (what is left times
  a piece's worth, at its age), so cutting neither makes nor loses money.
- **Cheddar wheel** (4x3) of eight wedges: a squat cylinder seen a little from above, its sides bulging out a touch, its top
  a touch domed. What is left is the part to the right (wedges come off the left): one sector of top and wall for each
  wedge left, a notch in the top where the back is gone, the pale cut face where one faces you. Size: 8 to 6 left 4x3, 5
  left 3x3, 4 to 2 left 2x3.
- **Cheddar wedge** (3x2) of six slices, drawn after a photo of a good wedge: a little from above and in front, its front
  (a cut face) a rectangle the full height of the wheel, its top the wheel's top tapering to the thin end at the right, the
  rind a narrow band along the back and down the left. Smooth golden paste with a soft lit edge, a few round holes shaded
  inside with a lit lower lip (one usually breaking the front edge), faint knife-scrape arcs on top; the holes and scrapes
  are each wedge's own (from its seed). Slices come off the thin end: 6 and 5 left 3x2, 4 and 3 left 2x2, 2 left 1x2 (drawn narrower, still
  the full two squares tall).
  Once cut, the thin end is a face of paste with the next slice's holes on it, as hollows, in perspective.
- **The cut face is the next slice.** A thing cut with the knife shows, on its cut end, exactly the slice that will come
  off next: the face is drawn from `faceSeed(item, left)` and the knife gives that seed to the slice it cuts, so the slice
  in your hand is the face you were looking at, and a new face shows under it.
- **Slices are generated, every one its own** (from their `seed`, else their id, `src/fill.ts`): a **slice of cheese** is a slightly uneven
  square with three to seven holes right through it (the field shows through; a mask, not paint), varied in size, some
  biting into its edge, each with a darker rim and a lit lip. A **slice of salami** is deep red, darker toward its edge,
  flecked with fat (up to 46 flecks, mostly small, a few large, never touching, each an uneven little shape) and a few
  peppercorns, inside a rim of casing that is the same on every slice; its outline wanders slightly, never a perfect circle.
- **Salami** (4x2, was the ham) of eight slices, cut off its right end: dark cured casing dusted with white bloom, string
  round it and tied at its ends; cut, its end shows the next slice, turned a little toward you. 8 to 6 left 4x2, 5 and 4 left 3x2, 3 and 2 left 2x2.
- **Age** (for later): cheese carries an `age` in days; its colours mix from pale cheddar to orange with it (`aged()`),
  and from `AGE_DAYS` (10) on it is called aged and is worth half as much again. That is reckoned on the smallest piece
  (a cut thing is worth its pieces), so with whole dollars an aged slice is 2$ (1.5, rounded), an aged wedge 12$ and an
  aged wheel 96$: aged cheese is worth about twice fresh for now. Nothing counts days yet; the debug panel spawns cheese
  fresh or aged.
- **Sandwiches.** Drag a slice of cheese or salami onto a slice of bread (on the field or a counter, not in its bag): the
  bread turns blue like anything the held thing can be used on, and dropped there the slice is laid on it and the bread is
  an open sandwich. Up to four fillings, in the order laid; a second slice of bread on top finishes it (it needs at least
  one filling: bread on bread is not a sandwich). Double-click an open one to take the top off: it lands beside it, the very
  slice that went on (its seed and age are kept on the sandwich, `layers`). Finished, it stays as it is. Worth its makings
  a fifth more open and half again finished (`stack` on the kind; rounded up, so the making always shows), and its tooltip
  says how much of that is the making. Drawn from its layers: a little from above, its bread at the bottom and each slice on
  it as itself (cheese holes show what is under them), each slid off the middle a different way (2026-10-20) so the ones below show; the top one whole.
  Sandwiches are made, not spawned (not in the debug panel).
- Pieces cut off, and a slice taken off a sandwich, land on the free spot nearest the thing's right side.
- **Matchbox** (2x1) of ten matches (1x1): its drawer is slid half out from the printed sleeve, one match for each in it.
- **Disposable lighter** (1x2, standing): every one is its own, picked from its id (a test drive for seeded looks): one of
  twelve plastic colours and solid, two-toned, striped, spotted, banded or swirled. Same hood, wheel and button on all.
- **Refillable lighter** (2x2, brushed chrome, a lid that clicks): a vessel of 2 that takes only lamp oil or spirit, comes
  full of lamp oil, and has no window, so how much is in it is only in the tooltip.
- Sounds: a matchbox's matches shift inside it; the refillable lighter clicks and rings faintly.

Overlays (the menu, a book) are taken away reliably: closing one stops it catching clicks at once and removes it when its
fade ends or shortly after anyway (a tab in the background never finishes its animations, and an invisible menu left on
top used to swallow every click).
