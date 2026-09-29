# Field

Started over from nothing. The field is a 30 x 20 grid of cells with a few things on it. You can pick things up,
turn them (R or right-click), drop them, and whatever is in the way gives way. No tooltips, no rules, no game yet.

Kept from before: the geometry in `src/grid.ts` (shove, hop, reflow, irregular shapes) and the flat, dark look.
Everything else (containers, nightly rules, contracts, money) is on the `inventory-manager` branch if it is wanted back.

## Sprites and the editor

Each kind has an SVG in `src/sprites/<kind>.svg`. Its viewBox is the item's footprint at 32 units per cell (a 4 x 2 item is
128 x 64), and it draws in `currentColor` so the game tints it with the item's accent. The game loads them by glob and
updates live when one is saved.

`/editor.html` (dev server only) edits them: pick an item, edit the SVG source, see it on the field exactly as the game
draws it (big with cell / quarter-cell / footprint guides, and at game size), turn it 90 degrees, insert shape snippets,
save. `npm run sprites` writes a starting sprite from the game-icons icon for any kind that has none (`-- --all` to redo all).
The editor's save endpoint lives in `vite.config.ts`.
