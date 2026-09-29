# Field

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
- **Properties.** Fill, edge, opacity, position and size of the selection.
- **Effects.** Glow, drop shadow, blur, fades, hatching, outline, dashes, a shadow copy; they write real SVG filters and
  gradients into `<defs>` and unused ones are cleaned up.
- **Operations.** Flip, turn, scale, fit, align to the footprint, mirror copies, duplicate, z-order, ungroup, delete.
- **Pen tools.** Connect the dots (closed polygon), open line, and freehand (simplified as you let go; thickness, detail
  and an optional smooth curve). Select a polygon or line to edit its points: drag a point, click a "+" to add one,
  double-click a point to remove it; operations can smooth it into a curve or reduce its points.
- **Footprint.** Pick the item's size in cells (up to 12 x 12); the drawing is moved or scaled with it, and the size is
  saved to `src/kinds.json` (item data now lives there, not in `world.ts`). Saved layouts are repaired on load.
- **Library.** Drop or paste SVGs (they are cleaned of scripts and outside links, and kept in `src/imports/`), search the
  4,000 game-icons, and add any of them to the sprite or replace it; "use the item colour" makes imports follow the item.
- **QoL.** Undo/redo, drafts kept across reloads, optional autosave to the game, snap size, copy another item's sprite as
  a starting point, "original icon" reset, the SVG source always visible in its tab.
`npm run sprites` writes a starting sprite from the game-icons icon for any kind that has none (`-- --all` to redo all).
The save endpoint lives in `vite.config.ts`; shape maths and matrices are in `src/editor/geom.ts` (tested).
