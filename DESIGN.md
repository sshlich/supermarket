# Inventory manager: design

A workshop toy grown into a game. The good parts of the toy stay: drag handling (shove, swap, turn, split), and
items that react to where they sit and what they touch. Everything else is being rethought.

## Decided (defaults, change any of them)

- **Containers are items.** A chest, jar, furnace or lockbox is an item with a `box` spec: inner size, an `accepts`
  filter (tags), and environment props. A container can sit inside another container, or on the field.
- **The field is the workshop surface**, a big grid (container 0). Containers snap to cells on it; no fixed boxes.
- **Shapes are not all rectangles.** Some items (an axe, tongs) have irregular footprints. The grid code has to
  place, rotate, shove and pack shapes, not just boxes. (M2)
- **Nesting is two levels at most** (`MAX_NEST`, enforced in `accepts`): a bottle in a distillery. Usually one. No
  infinite space by chests in chests.
- **Environment flows inward.** Props (`cold`, `dry`, `airy`, `damp`, `dark`, `sealed`, `fire`) of a container reach
  everything inside it, through the nesting, unless a container `seals` that prop out. `lit` / `smoky` are worked out
  each night from what is burning.
- **Rules read props, not box names.** The night asks "is this cold, damp, lit?", so a new container is data.
- **Neighbours** are items sharing an edge inside the same container.
- **Convenience is a rule:** nesting must never cost clicks. Hover-to-open, drop onto a container to put it inside,
  shift-click sends to the best match, panels stay pinned.
- **Look:** default black theme is fine; the character comes from item accent colours by material (blue for water,
  brown for wood, ...). Not glowing-AI dark mode.

## The game (from the design chat)

The push is **expenses against profit**. Two flavours are open, and they can share one spine:
- *Survive and thrive*: rent is due, and you have to earn it.
- *Numbers up*: money buys upgrades, machines, tools, more floor.

**Money comes from contracts**: accept an order, make the goods, deliver by the deadline. That can grow a delivery
layer (getting goods to the client, not just making them). Contracts are what make the storage puzzle matter: the
right thing must survive the night in the right container until it is due.

## Milestones (one at a time, play each)

1. Container model + props-based rules. (done)
2. The floor, irregular shapes, drop-into and hover-to-open, finer 2x grid, environment effects. (done)
3. Contracts, rent, shop. (done, untuned)
   - 3 offers a day, up to 4 active; deliver from the **Dispatch** container; goods still age there.
   - Rent every 7 days (30g, +12g each time); miss it and the run ends. Shop sells containers onto the floor.
4. Liquids and a first machine. (done)
   - Liquids are stackable units (`seawater`, `freshWater`) and solid storage `rejects` them; a **bottle** takes only liquids.
   - Bottles in the basket come back full from the shore. On an open fire the bottled water boils away; loose on the hearth it leaves salt.
   - The **still** (fire + `still` prop) distils seawater to fresh water, through the nesting: still > bottle > water.
   - Later: more machines, upgrades, more items and contract kinds.
5. Restyle: item art fit, material accent colours, less default UI.

## Open

- Balance: prices, rent growth, offer pool. Handed to the player, not tuned.
- Delivery as a layer (getting goods to the client) is not built; contracts are hand-over-at-the-door for now.
- Liquids: volume on a slot, or items with an amount?
- Whether the floor scrolls or an upgrade grows it.
