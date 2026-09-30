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

## Handling (the game page)

- **Selection.** Sweep a rectangle on empty ground to pick everything it touches (Shift or Cmd/Ctrl adds), Cmd/Ctrl-click
  toggles one, Shift-click toggles on release, `Cmd/Ctrl+A` picks all, `Esc` clears, `Delete` removes the picked. Grabbing
  one of several picked things moves them all, keeping their arrangement (a group cannot be turned).
- **Strict mode** (`S`, or the button under the field; remembered): a drop is accepted only if every square is free and
  nothing else ever moves. Otherwise it is refused. Hold **Shift** while dragging to do the opposite for that one move: in
  strict mode Shift lets the shuffle-to-fit happen, and outside it Shift makes one move strict.
- **Feedback.** While dragging, the whole inventory glows green where the drop will work and red where it will not; ghosts
  show where each thing lands (and, dashed, what gives way).
- **The field** is 25 x 20: dark aubergine with a slightly lighter grid and a Schluter orange outline round the whole inventory.
