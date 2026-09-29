# Inventory manager: design

A workshop toy grown into a game. The good parts of the toy stay: drag handling (shove, swap, turn, split), and
items that react to where they sit and what they touch. Everything else is being rethought.

## Decided (defaults, change any of them)

- **Containers are items.** A chest, jar, furnace or lockbox is an item with a `box` spec: inner size, an `accepts`
  filter (tags), and environment props. A container can sit inside another container, or on the field.
- **The field is the workshop surface**, a big grid (container 0). Containers snap to cells on it; no fixed boxes.
- **Environment flows inward.** Props (`cold`, `dry`, `airy`, `damp`, `dark`, `sealed`, `fire`) of a container reach
  everything inside it, through any nesting, unless a container `seals` that prop out. `lit` / `smoky` are worked out
  each night from what's burning.
- **Rules read props, not box names.** The night asks "is this cold, damp, lit?", so a new container is data.
- **Neighbours** are items sharing an edge inside the same container.
- **Convenience is a rule:** nesting must never cost clicks. Hover-to-open, drop onto a container to put it inside,
  shift-click sends to the best match, panels stay pinned.
- **Pressure (to build):** small carry space, spoilage, and a deadline of orders for finished goods.
- **Look (to build):** warm, tactile, paper-and-ink; not the default dark UI.

## Milestones (one at a time, play each)

1. Container model + props-based rules + tests. The old seven boxes are now kinds; UI still shows them as panels.
2. The field: place containers, open and close them, nest by dragging; transfer QoL.
3. The loop: orders, deadlines, carry pressure.
4. Liquids, more containers (bottle, furnace, lockbox filters) and items.
5. Restyle.

## Open

- Liquids: volume on a slot, or items with an amount? (deferred to M4)
- Whether the field scrolls or a workshop upgrade grows it.
