# Presentation redesign · September 2026

The original UI exposed the simulation but did not establish an inviting game space. This pass replaces its dashboard layout and selection/forms interaction model while preserving the deterministic simulator.

## Reference lessons, not copied assets

- [The Bazaar gameplay](https://store.steampowered.com/app/1617400/The_Bazaar/): the active board is the persistent visual anchor; encounters and combat occupy the stage above it. Item identity, size and timing must read visually.
- [Backpack Battles reference screen](https://data.xxlgamer.com/galleries/927/GdKb1lYw4wklwc-full.jpg): merchandise is recognizable objects, shops feel like places, prices and destinations are visible at the moment of dragging. The reference screenshot is not a project asset.

Original direction: a hand-painted, lantern-lit curiosity stall. Warm amber and copper against indigo cloth, a walnut worktable, a silver-haired merchant, and distinct illustrated objects. Legible cream labels and strong silhouettes; decoration stays behind the interaction plane. No borrowed game artwork or characters.

## Interaction contract

- No item-selection state. Left-click does not select or inspect items.
- Left-drag owned items between contiguous board/stash slots. Equal-size occupied items swap. Larger overlaps explain why a drop cannot fit.
- Drag shop merchandise to an empty footprint to buy, or onto the indicated owned copy to upgrade. Gold changes only on a valid committed drop.
- Drag owned items to the sell area; the payout is shown while dragging. Releasing elsewhere is harmless.
- Right-click an item, skill, reward item or opponent item to open its detailed view. Escape or the close button dismisses it. Shift+F10/Context Menu provide the keyboard equivalent, not a selection mode.
- Escape, pointer cancellation or loss of focus cancels a drag. Geometry previews and command validation agree. No partial purchase on a failed placement.
- Undo reverses the last rearrangement through normal move commands; purchases, sales, rewards and encounter changes clear arrangement history. It does not rewind random outcomes.
- Targeted upgrade/enchantment/Transform rewards are dragged onto eligible owned items.
- The immediate decision, your board and stash remain visible at ordinary desktop sizes. Save/import/export live in a menu.
- Combat controls remain mounted while events play. Space pauses, the timeline scrubs, and the optional inspector retains focus and filter text. Right-click inspection pauses playback.

## Verification bar

Browser checks must exercise real pointer drags, cancelled/invalid drops, swaps, purchase placement, duplicate upgrades, selling, right-click details, undo and focused playback controls. Screenshots must be inspected at 1440×900 and 1280×800, not just full-page captures. Existing simulation golden hashes must remain unchanged.
