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
  things whose slot is gone go to the field, overlaps get re-placed).

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

## Customers, the line and money (2026-10-14)

A `>_ customers` button on the side of the field opens a terminal beside it (`src/customers.ts` holds the customers and the
rules of a deal, `main.ts` draws it and moves the things; the terminal's state is saved apart from the field, as
`field-v3-terminal`).
- **The line.** Customers wait in a line and are served one by one; there is no clock. "let them in" opens the door when
  nobody is waiting, and a line of 3 to 7 forms (random for now: later something in the game should decide it). The header
  shows who is at the counter and how many are waiting. *next customer* calls the next one (whoever was there leaves);
  *dismiss* sends them away.
- **Three sorts of customer**, one big button that changes its word:
  - a **buyer** wants tags (survival needs: food, drink, alcohol, medicine, light, fuel, book, valuable). **SELL**: they
    take everything on the inside counter with a tag they still want (a container counts its contents) and pay its worth
    times their rate (1.2 to 1.6), even if some wants are left; nothing they want there, no sale. About two in three count
    their money: a **budget** (5 to 40$, shown as "has N$" and said in their greeting) they cannot go over; the rest have
    plenty. They **stay** after buying, wants already bought lit in the header, and buy again until they have it all.
  - a **seller** unloads one to three things on the outside counter and asks for the lot (worth times 0.5 to 0.9).
    **BUY**: if you have the money, it is yours, and it slides across to the inside counter (whatever fits there).
  - a **trader** unloads things and wants tags. **SWAP**: they take what they want from the inside counter if it is worth
    at least 80% of what they brought, and no money moves; what they brought slides across to the inside counter.
- **What they bring is never quite new**: cheaper kinds more often (a cabinet rarely), any property (synthetic apples, any
  pill), vessels part full of any liquid, blisters with pills already gone. Their things stay theirs until a deal (the
  tooltip says so, and they cannot be offered back to them); dismissed or sent off with *next*, they take them back from
  wherever you moved them.
- **Nobody leaves on their own**: after a deal they stay at the counter until you dismiss them or call the next one. The
  big button greys out when they have nothing more to deal (a buyer with everything, a seller or trader after their deal).
- The screen types their words (with soft key clicks), lights the wants that are met, and is wiped when they go (a scan line
  sweeps down).
- **Tooltips that do the sums** (show what a decision needs, on hover): an item's tooltip has its worth in green with what
  it is made of (`7$ · 1 + 6 lamp oil · storage · 1×3`) and what the customer at the counter makes of it ("Wren would pay
  11$", "does not want this", "theirs: part of a 20$ lot"). Hovering a counter's empty squares shows its own tooltip: the
  total worth on it, how many things, whose, and what the customer would pay for (or take of) what is there.
- **Money** is a number on the main screen, left of the counters: a black dial, green terminal digits with the leading
  zeros dim, and a `$` at the end. It counts to the new sum after a deal and glows (green up, red down). Saved with the
  field as `cash`; a new game starts with 50.

## Items, the first seed (2026-10-13)

Twelve kinds in three categories plus storage, in `src/kinds.json`; the debug panel lists them by category. Each kind
has a `cat` and a `price` (coins); the tooltip shows what a thing is worth (its price plus whatever is inside it).

| Category | Item | Size | Tags | Price |
|---|---|---|---|---|
| food | Apple (property `origin`: real, or synthetic) | 2x2 | food (+ synthetic) | 4 (synthetic 2) |
| food | Sliced bread | 4x2 | food | 3 |
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
Things sound like what they are made of: a kind's `sound` in `kinds.json` names its material (glass, paper, metal, foil,
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
  the debug panel, and a new game (click twice: it empties the shop). Esc or a click outside closes it.
- **Debug panel**: a window over the page, moved by its header and left where it was put, opened from the menu. Money
  (**+100$**), the field (clear it), and every kind of thing to spawn, by category: one row each with its colour, name,
  size and price, and a button per variant (real or synthetic apple, each pill type and blister, each book, a bottle empty
  or full of each liquid). New things go on the field, on the first free spot.
