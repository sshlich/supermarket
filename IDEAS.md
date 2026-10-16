# Ideas (`inventory-v3`)

Notes for later, with an evaluation each. Nothing here is built; `DESIGN.md` is what is.

## Sandwiches, further (the user's, 2026-10-14)

- **Sauces and processing**: butter or mustard poured onto bread (the pour that bottles already do), toasting.
- **Other breads**: a sub, where you just dump the fillings in (no order, no lid), next to sliced bread's careful stack.
- **Taller**: four fillings for now; one day a hundred-layer sandwich (the cap is `max` on the kind; the drawing would
  need to grow or squash past a dozen).
- **Customers asking for one**: "cheese and salami", a named sandwich, rather than just food.

Evaluation: this is where the shop turns into a kitchen and the player into a restaurant: buy whole things, cut them,
make something worth more than its parts. Sauces fit the vessels already there; a sub is a second way to build the same
thing, worth having once the first one is played with.

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

## Computers and devices, round two (pitched 2026-10-15, the user's verdicts 2026-10-16)

**The core, approved:** a computer holds programs and files, and programs and files are things you get. That opens
different computers and machines, better ones or ones for other jobs, and devices that read media (a 3D printer fed a
memory card of models). Programs can be **modifiers**: loaded into a machine, they change what it does.

What was decided or leaned:
- **Storage and memory are plain stats, not grids.** A file manager is the usual list with a capacity bar; running
  programs take memory. Computers and programs get stats of all kinds (memory, storage, speed, ports, power draw; a
  program's size, the memory it needs, the speed it wants).
- **Opening the case to fit parts** (memory, drives, cards) is liked and **parked as too early**.
- **No connection by touching.** Wiring as a puzzle only makes sense as its own layer (cables drawn over the field, things
  can sit on them, no effect on items), and only if inputs and outputs are meant to be limited with a clear upgrade path.
  Simplest: ports are a stat, and plugging a device in is a verb.
- **Printer, done properly:** printers by print surface (small for slips, labels and receipts; medium for documents,
  manuals, posters; large for banners and art), so customers can later order art and banners. The label printer is just
  the small printer. A **3D printer** reads models from a memory card (STATION's fabricator with a blueprint disc).
- **Modem: yes** (mail, orders, boards).
- **Boxes and the sealer: yes.** A sealed box cannot be opened; a knife cuts it open, and the sealer closes it again.
- **Scanner:** good, early. **Radio scanner:** only worth it if it feels like sorting garbage for the one useful thing,
  and then it is a big thing of its own. Parked.
- **Programs on discs, including novelties:** a paint disc, a game, music; sometimes useful (an encrypted client for a
  black market, a 3D model store). Endless room.
- **Command line: yes**, as one more way to act on things. **Automation** (scripts that drive machines): yes.
- **Viruses:** wanted, the shape is open. Leaning: a **cursed modifier** on a file, hidden until scanned, that rides
  along on every copy and shows first by its symptoms (slower, space missing, a machine jams).
- **Your own desktop** (icons, wallpaper, notes, printing them): yes. It gives junk files a use and has an aesthetic of
  its own.
- **The screen gets bigger** (more pixels), so working in it is comfortable.
- Not a second game, a part of this one.

**The open problem: copying.** If copies are free, programs, models and disc contents stop being worth anything. Proposal:
copying is a production step with costs, not a free action:
1. **Media:** a copy needs a blank disc or card with room for it, bought like any item; bigger programs need bigger media.
2. **Time:** copying is a job for the computer, at its drive's speed (energy now, or free overnight, as STATION section 6).
3. **The market remembers:** each title has a price that falls as you sell copies of it (the market already moves with
   your sales).
4. **Licences:** Company software runs only on the machine it is paired with, or with a hardware key (a dongle is a thing
   and cannot be copied). A cracker program removes the check, comes from the black market and may carry a virus. Cracked
   copies sell cheap to the spine; the ring wants licensed ones.
5. Maybe **generation loss:** a copy of a copy can pick up a bad-sector modifier.
That makes good drives and fast computers worth chasing, which is the user's own instinct ("the reason you want to chase
good storage").

How programs move between machines and get modified: carried on media (a disc or a card is a thing you carry), or sent
by modem; modified by **patches**, files dropped on a program to change its stats (a cracker is a patch).
