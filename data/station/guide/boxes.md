# Shipping boxes (boxes) reader's guide

There are three box sizes: small (2x2), medium (3x2) and large (4x4). Orders ship in them: you pack the goods, attach the order's slip and seal the box, then leave it in the dock for the carrier to collect. Payment arrives on delivery.

In the overall loop (scrap -> crusher/recycler -> materials -> machines -> goods -> sold), boxes are the last step: they are the outflow wrapper around the goods you sold. They are not made from scrap by any recipe in the ledger. You buy them ahead as crates on the terminal, and you also start with a few (3 small, 2 medium, 1 large).

Each order names which box sizes it accepts (small 44 orders, medium 37, large 12 of 87). A box also has an inner grid (storage space for goods) and a shipping fee, shown per entry. Sealing needs sealing tape and the Box sealer.

Groups: smallest to largest.

## Boxes

### Small box (`box_s`) — tier 1 · 2x2 · worth 1$
**What it is:** Flat-pack fibreboard, 2 by 2, with a 4x4 inner grid.
**Function:** A container: holds a few small parts and the slip. Fee 2, buy price 1.
**Chain:** `Comes from:` No recipe makes it. It is bought ahead on the terminal (crate channel, from phase 1); you start with 3. `Goes into:` Accepted by 44 orders, e.g. Water for the row, Last puck on row C and Weekly rations (all from the bunker). Seal small box (Box sealer) uses 1 sealing tape to make it shippable.
**Note:** A box ships only sealed with its slip inside. Cheapest per box but the highest fee per square; the description says space is thin.

### Medium box (`box_m`) — tier 1 · 3x2 · worth 1.5$
**What it is:** Taped fibreboard, 3 by 2, with a 6x4 inner grid.
**Function:** A container: the usual size for a parts order or a bottle with its packing. Fee 2.5, buy price 1.5.
**Chain:** `Comes from:` No recipe makes it. Bought ahead on the terminal (crate channel, phase 1); you start with 2. `Goes into:` Accepted by 37 orders. Seal medium box (Box sealer) uses 1 sealing tape.
**Note:** Must be sealed with its slip to ship.

### Large box (`box_l`) — tier 1 · 4x4 · worth 3$
**What it is:** Reinforced crate, 4 by 4, with an 8x8 inner grid.
**Function:** A container for the biggest orders. Fee 6, buy price 3; the lowest fee per square.
**Chain:** `Comes from:` No recipe makes it. Bought ahead on the terminal (crate channel, phase 1); you start with 1. `Goes into:` Accepted by 12 orders. Seal large box (Box sealer) uses 2 sealing tape.
**Note:** Needs a floor to stack on. Must be sealed with its slip to ship.
