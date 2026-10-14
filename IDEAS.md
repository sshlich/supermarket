# Ideas (`inventory-v3`)

Notes for later, with an evaluation each. Nothing here is built; `DESIGN.md` is what is.

## A wired terminal: a computer you can sit at (the user's idea, 2026-10-14)

**The note.** A wired terminal is an item: a computer. Double-click it and it opens in a panel that can go full screen (like
the reader). Inside is a miniature imitation of a computer, with a slight fisheye and a dark Windows 98 interface: a
desktop, and programs that do something real. It could be a whole world. The handling of things could play out there too:
files, viruses, mail, services, contacts. A playground.

**Evaluation: worth doing, as the shop's second counter.** What makes it good, and what to watch.

What fits:
1. **Most of the parts exist.** Floating windows, a panel that toggles between floating and full screen (the reader), typed
   text (the customer terminal). On the `drones` branch there is already a dark-98 mail terminal with printable papers
   (`src/terminal.css`), and a written-up "terminal as a desktop": programs you collect (Mail, Ledger, Boards, Prices,
   Contacts, Files...).
2. **Files as things is the strongest part.** The grid already does everything a file manager needs. Folders are
   containers, a file's size is its footprint, disk space is a grid's area, and dragging works between windows. A desktop
   is just another place for things to sit. A **virus** would be the first thing in the game that acts on its own: it
   spreads into its neighbours, corrupts them, or eats space. Dealing with it uses the game's core skill, arranging: cut it
   off, or quarantine it in a folder that rejects everything else.
3. **A second way to trade, without walking.** Mail orders, and a board of listings, are customers who do not come in.
   Contacts are the people you have dealt with, which could be the lever that decides how long the line is (parked as
   random for now). Services sell something that is not a thing: a repair, a delivery.
4. **Information as goods.** Manuals, maps, recipes and logs as files are the books' digital cousins: knowledge worth
   money. A customer could want a file.

What to watch:
1. **A second game inside the first.** You were wary of making two games (management and battle). Keep the computer a lens
   on the same economy: everything it does should end at a counter, the money dial or the field. A program that moves no
   goods, money or people is decoration.
2. **"A whole world" never stops growing.** The drones note already has the answer: programs are things you get. Start with
   one, then find, buy or be sent the others on chips. That gives you progression and a limit in one move.
3. **Scale.** A desk computer is furniture, and furniture must not share the item grid (decided 2026-09-27: it breaks the
   sense of scale). Either the wired terminal is a portable machine (laptop-sized, about 3x2, that can be bought, sold or
   broken), or it sits beside the field like the customer terminal and is not an item at all. You called it an item, so:
   portable. "Wired" could mean it only works plugged in at the shop.
4. **Fisheye on live controls.** Truly bending live HTML (an SVG displacement filter) moves the click targets near the edges
   away from where they appear. A faked curve does the job with exact clicks: rounded glass, vignette, scanlines, a soft
   bulge of highlight. Real distortion could be kept for full screen, and kept slight.
5. **Two kinds of window.** Windows on the computer's desktop and windows over the shop (containers, the reader, debug) need
   one clear rule. Proposed: computer windows live inside the screen. Dragging a file off the screen onto the field
   **prints** it, as a paper or a slip (drones had printed slips). That is the bridge between the two worlds.

**Decided (2026-10-14):** an item, sellable; later maybe customised (part slots, the case and configuration, even
screens). First, a small version to feel it out: CRT-styled, a power switch, a disc tray you put floppies into and read
on the screen, discs being shards of information worth finding, things introduced a little at a time. Built: see
`DESIGN.md`, "The wired terminal".

Open questions:
- Is "wired" a resource (power, a connection) or just flavour?
- Which first program earns its place: Mail (orders from outside) or Files (with a virus to deal with)?
- Could the computer bring the line in (a notice posted on a board brings more customers)?
