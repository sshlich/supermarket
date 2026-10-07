# 00. Reading guide

This folder is a pile of ore. It is about **383,000 words across seventeen files**: roughly 25 hours of reading at an
easy pace, or a few weeks of evenings. None of it is decided. It was written to be panned: you read, you keep the
nuggets, you throw the rest back, and what you keep moves into `../LORE.md` or `../IDEAS.md`, where decisions live.

Three things to know before you start.

**1. Only the canon brief is fixed.** `00-canon-brief.md` holds what you had already settled (the Stack, 104 floors, the
bands, Halden, the Works, the drowning and who caused it, water licensing, VOID, the factions' names, the timeline Y0 / Y41 /
Y57 / Y86, the money words) plus a small set of working assumptions picked so the writers could agree with each other. Every
other file stands on it. If something in a later file contradicts the brief, the brief wins. If something in a later file
contradicts another later file, nobody has won yet: that is a question for you (collected at the end of this guide).

**2. The files mark what they offer.** Plain text is the main version. **Alternative:** is another version of the same thing,
often just as good. **Hook:** is a mystery or a story seed with no answer attached. **In play:** says how a piece of lore turns
up in the game: as an item, a machine, a slip, a client, a price, an event or a choice. The **In play** paragraphs are where the
lore meets your systems, and they are the fastest way to pan a file (see "Panning tools" below).

**3. The files may still disagree in small ways.** Fifteen writers worked in parallel off the same brief. A continuity pass
then found 172 contradictions (dates, names used twice, floor numbers, prices) and fixed them in the files. `99-glossary.md`
records the resolved forms and marks the losers "retired variant". Some drift is bound to remain. Where you see two
versions of the same fact, check the glossary for the proposed winner, then treat it as your call. Dates after Y86 are
projections (things scheduled or promised), not history.

---

## Panning tools

The markers make the corpus greppable. From this folder:

```sh
# every In play paragraph in a file (the lore-to-game joins)
awk 'BEGIN{RS=""} /^\*\*In play/' 04-economy.md

# every Hook across the corpus
grep -n '^\*\*Hook' *.md

# everything about one thing, everywhere
grep -n -i 'requisition' *.md
```

| File | Words | In play | Hooks | Alternatives |
|---|---:|---:|---:|---:|
| 00-canon-brief | 1,900 | | | |
| 01-history | 20,600 | 31 | 13 | 12 |
| 02-the-stack | 19,000 | 34 | 14 | 6 |
| 03-water | 19,700 | 32 | 18 | 4 |
| 04-economy | 23,300 | 42 | 16 | 6 |
| 05-law | 20,600 | 40 | 13 | 7 |
| 06a-factions | 28,800 | 13 | 25 | 4 |
| 06b-factions | 34,100 | 18 | 32 | 1 |
| 07-outside | 24,400 | 41 | 19 | 5 |
| 08-daily-life | 24,800 | 25 | 9 | 2 |
| 09-tech | 19,900 | 31 | 17 | 5 |
| 10-items-and-chains | 21,600 | 34 | 10 | 5 |
| 11-contracts-and-clients | 28,400 | 103 | 18 | 4 |
| 12-voices | 31,100 | 100 | 13 | 2 |
| 13-player-and-endings | 26,500 | 40 | 16 | 5 |
| 14-hooks-and-mysteries | 22,800 | 20 | 21 | 29 |
| 99-glossary | 15,300 | | | |

(The 06 files put most of their gameplay inside per-faction "What they want, offer, buy and sell" and "Example slips"
sections rather than In play paragraphs, so their low In play count undersells them.)

---

## Reading order

The numbering is the order the files were written in, which is roughly from foundations to surface. It is not the best
order to read them in. The order below starts with people, then the building, then the past, then the systems that make
the shop work, then the world outside it, then you, then the secrets.

If you only have one evening: **08 (Part one), 02 (Parts four and five), 11 (sections 1 and 2), 13 (Part one and "How an
ending works"), 14 (Part one and the Dark Floors).** That is the world in five cuts.

If you want the gameplay-first route: **10, 11, 04, 09, 05 (section 15), 13 (Parts two and three)**, then everything else
as background.

### 1. `00-canon-brief.md`: the bedrock

Ten minutes. Read it again even though you know it, because it is the only list of what the writers were told, and it
explains the working assumptions they all lean on: Halden Works made cells and chips (which is why cells are everywhere and
why the poison is what it is), the Dark Floors are 22 to 26, the player starts on floor 17, the drowning was groundwater
pumping plus a starved seawall plus the Works' slurry reservoir, and the official story is "unprecedented storm" and
"illegal wells". Its last section, the writing rules, is why every later file keeps saying "In play".

### 2. `08-daily-life.md`: ten days in ten lives (start here)

The best way into the world, because it is people before it is systems. Part one is ten single days, one or more per band:
Linnet Aubrey, seventeen, on floor 95; Yetunde Farr, a Vey nurse in the Terraces; Anselm Dray, a licensed repairer on 46
who quietly buys restored goods; Dee Kasprzak, insect rancher on 12; Mikkel Arno, who works nights in the Terraces and
sleeps on 17; Nell Gauntlett, a fixer on Gutter Row in the Sump; Caddy Rourke, a magnet fisher on the Flats; Tallow, a ten-year-old
vent kid; Oona Fairweather, seventy-four, an Old Hand with a clock number; and Roz Achebe, a cook in the Pantry, the Crown's back
door on 90. Every one of them is written so they can walk onto the contract board as a client, a supplier or a source. After
the lives, the file goes topic by topic: the shape of a day (Whistle, Morning Fall, tap hours, slack hour), food by band
and the Vitabrick in culture, the three shifts that outlived their factory and hot-bunking, the cough everyone below 30 has,
children and Tally Day, death and the Carry (bodies carried down the stairs by landings, with candles), faith, gambling on
the Fall count, "crossing" (the voided X worn as a style), the calendar, accents, a glossary and a page of proverbs, and
what each band sounds and smells like. **Best in it:** Roz and the Pantry (Crown jobs paid in kitchen leftovers), Tallow's
day (the vent kids as the player's cheapest labour and best information), the crossing fashion (the Crown buying back voided
Mills shirts, mended with a visible X, at absurd prices), proverbs as tooltips ("A full catch catches nothing"), and the closing
section's list of standing demand and life-event slips, which is a ready-made seed list for the board.

### 3. `02-the-stack.md`: the building as a machine and a place

The tower from bottom to top, and how things move through it. Part one is the building as plant: the Plinth (the industrial
base, 0 to 29) and the Shaft above it, the founding materials (including a living wall culture that once healed cracks and
is now dying), the lift cores and Old Two (the freight car that delivers your bought machines on a timetable), the four
garbage chutes and the Reclaim on 59 where the night's refuse is held for the 06:00 Morning Fall, water going down, the
Lungs (air plants on 30, 60 and 90), the power Bus and meters, the facade and the roof. Part two walks each band, with named
places that become destinations: the Postern on 93 where Crown deliveries land and the Assay tests real against synthetic, the
Orchard Pad on 96 and the Apple that no longer fruits, Lantern Row's kitchens, the Grading House, the Shelf, the Moat on 5.
Part three is the Dark Floors from outside. Part four is floor 17 and its neighbours: Four Hall, the player's cage on Stores
Run, the Ovens on 16 (the safest first contract is a one-floor hop to bake your grain), the Hatch on 18. Part five flies a
drone from 17 to 96 and from 17 to 5, riser by riser. Part six is the building's day hour by hour. **Best in it:** the
requisitions on Works stock addressed to STORES 17-C (the player's own cage), the rule that going down has **no safe
route**, "left full, the catch stops filling and your share goes to the floor below", Weep events (a ceiling drip that fills
a vessel for free), daylit squares as a property of squares rather than proximity, the neighbours on 17 as a cast of clients
and rivals, and the idea that the day clock is "read off the building", not invented per event.

### 4. `01-history.md`: Calder and the Stack, Y−12 to Y86

The long file to read once properly and then come back to as reference. It runs from the town before the Works (the
Sweetwater Beds, the Accord, the prospectus *A City Stood On End*) through the building of the tower (the architect Marrow
Teague, the founding-era kit, the Forty), the boom and the Union, the groundwater and the lagoon, the Pell Report of Y29 that
predicted subsidence, Programme Daylight and the Last Shift (the gloves pinned to the Glove Wall on 17), the Landlord Years
and Metered Fairness, the wells and the seawall, the Harrow Memo, and then the Drowning of 19.III.Y57 hour by hour, including
the Stair Doors (shut from above while the Gate Floor drowned, held open seven minutes by one man) and the 412 rich guests
safe at the Founding Reception in the Glasshouse. Then the press release, the Inquiry, the Partition that cut the tower into
squares, the Water Licence, and a year-by-year chronicle from Y57 to now (Chute Day, the Long Dark, the Meter Strike, the
Lift Strike, the Lowerings). It ends with a "contested points" table, which is a gift: every place the file kept two
versions open. **Best in it:** dates in a slip's own format telling you who wrote it (Halden Years above, weekdays in the
Mills, tide times from the Flats), the Seven Minutes as a phrase meaning "bend a rule for me", the Tally ("a Name for the
Tally" as a contract that pays no credits), the Partition as the reason your lease is a list of tile numbers, the Long Dark as
the template for a blackout event, and the 22:00 to 06:00 light under the welds, which keeps Works shift hours.

### 5. `03-water.md`: the one thing nobody can argue about

A person needs three litres a day and there is no free litre in sight. This file follows water all the way: what is in the
bay and why boiling does not help, how people test water (a drop on glass, a coin left overnight, a cress test), the
Waterhouse with its failing founding-era membranes, the three lines (sweet, salt, soft) and the tap hours they force on
the Mills, the Ordinance and its licence classes, the stinkers and the letter that turns one into a "certified safe provider",
Halden Pure and Skywater, the meters and how to cheat them (the "slow stone"), the button and the red tag that throttle an
indebted tap, then every other way to get a drink: air-wells, fog nets, ledge stills, rain stolen from the Crown's gutters,
recycled urine, ferments, ice, hydrogel. It ends with grades, prices, culture, crimes, events, a machine and item
catalogue, contract slips and "a litre's round trip". **Best in it:** the still that drips heads, heart and tails by the
hour (swapping the vessel at the right hour is the skill), the Inspection Sweep (contraband is found unless it is inside a
closed container at the visit hour), gel bricks as the way to ship water without a sealed bay, wet debts repaid in litres,
the arrears button turning rent pressure straight into production pressure, and Process Line 3, the pipe that takes a sixth
of the tower's clean water up to the Dark Floors.

### 6. `04-economy.md`: money, rent and the Ledger

The spine of the systems side, and the file whose numbers every other file was told to obey: **a Mills labourer earns about
30 cr a day, a Vitabrick is 3 cr, a litre of Halden Pure at a Mills tap is 1.20 cr, a square on 17 is 5 cr a week, and the
starting lease is 24 squares.** It covers credits and the Ledger, chits (physical credits, so "coins as items" has a reason),
scrip and the street rate, the company store, rent per square with frontage and pillars and pipe runs, re-cut events, rent day
and the Creep (the long clock of rising rent), meters and the bill, Standing (the credit rating) and what it gates, the
Proprietor Pathway (the shop loan, 5,200 cr, which ends in held title), the Mutual (insurance that never pays), fees and
licences, the chute economy and VOID, planned obsolescence, real and synthetic grades, a full price list, wages by band, and
the informal economy (cells as currency, jug tickets, markers, favours called "turns", the hock, sublets, Foundation vouchers,
blood). Section 15 pulls it all into one system: the player's books on day 1, the calendar, pressures and levers, events,
progression in money, and a "smallest version". **Best in it:** the Ledger's thumb (every fraction rounded against you,
visibly), the inquiry penalty (applying for things costs Standing, so you never apply speculatively), frontage squares as
the only ones where shelves sell, the rent-day trickle (arrears felt as machines starving), sponsored Standing sold on the
quiet, and the loose stones at the end, especially the Count House clock running eleven minutes off the wall clocks.

### 7. `05-law.md`: a lease instead of a law

There is no city, so there is no law: there is a lease, and everything that looks like law is a clause in it. The file covers
the Emergency Stewardship Order of Y57 and the Occupancy Charter (a 2x3 paper you must keep on your field and cannot sell
or bin: the first lesson in the game's tone), HPS and its subscription tiers, the inspectors, brand protection and the
stampers, floor wardens (Hester Moyle on 17, who can be kept sweet with broken clocks), the arrears ladder and the debt
firms and the boat to Bastion, three versions of the Arbiter, the full Bylaws in ten Parts, an offences schedule,
reassignment, justice band by band, the Sump's four gangs (the Pumpmen, the Hooks, the Ninefold, the Wet Widows), the
Co-op's Round, corruption with a price list, notable cases, and a closing section on the law in play. **Best in it:** the
licence wall (licences are framed items that take rented squares, so the most legal shop is the least spacious), the
collector who tags your highest value-per-square items (a packing puzzle by inversion), losing a row of your field to
arrears with the tape left on the floor, reassignment as fail-forward instead of game over, bylaws "under review" each
month as a cheap seasoning system, bribes as Foundation gifts that leave receipts you can keep as leverage, and section 15's
note on how this replaces the dropped guard-at-the-counter heat system.

### 8. `06a-factions.md`: the ten that formed around a thing

Rain, tides, tools, memory, paper, lifts, shafts, stills, seed, insects: the Rain Church, the Tide Folk, the Mills Co-op, the
Old Hands, the Archivists, the Lift Guild, the shaft rats, the Stinkers, the seed savers and the insect ranchers. Each gets
an origin, beliefs, what they do, structure, named people, what they want and sell, example slips, how they treat the player,
relations and their endings. The opening sets the machinery all factions share: a five-step standing (Hostile, Wary, Known,
Trusted, Kin) kept on a ledger page, and **tokens**, credentials you pack into a bay that change a route or a buyer. The
closing sections are the best part: a relations web, "pressure points" where one choice moves many ledgers at once (the strike
week, the Wall Book auction, the Font in the laundry, weigh day, the Red Binder), a faction calendar, a table of endings, and
a sketch of a new tenant's first fortnight on 17. **Best in it:** the Bench as an analyser made of people (Old Hands reveal
hidden features, one per hand who looks), manuals as tools that reveal a machine's hidden setting permanently, rat-chalk,
the Co-op's greens chits as a third money, the Fade counter on licensed insect stock against wild lines, and badge 0001
clocking in at 02:00.

### 9. `06b-factions.md`: the ten that formed around a gap, and six new ones

The longest file. Its ten canon groups are the businesses of the gaps: a square nobody used for eight hours (sublet barons),
a bed empty while its sleeper worked (hot-bunk houses), the Crown's charity (the Foundation and its vouchers), a vein with
blood in it (plasma buyers), a signal nobody was sending (Static), a valet's careless cut (the Voided), a claim nobody
wanted to pay (the insurance syndicate), plus penthouse fixers, vent kids, and the Flats divers and magnet fishers. Then six
**new** factions, clearly marked, to keep or cut: the Period Club (Company middle managers who sell early sight of the rate
card), the Amenity (the Crown's residents' committee), the Green Bands (floor wardens trading quotas), the Stillcars (families
living in dead lift cars parked at 44), the Roll (licensed refurbishers who hunt the Voided) and the Thursday People (debt
labourers back from Bastion). **Best in it:** hour leases (a baron's squares appear on your field as a hatched block for a
window, then vanish), the kid run (a parcel through the crawlspaces with no drone, no lane and no toll), the insurance
Standard as a packing constraint, the Amenity's "odour of origin" bay rule, the Period Club's pencil drafts (next Period's
rate card fourteen days early), and the many hooks that circle back to the Dark Floors.

### 10. `09-tech.md`: the things that hum, drip and click

Three families of kit (first-fit from the founding era, Company-new, and grey), and what living with each is like. Then
power: the socket board (four outlets and 3 hu an hour, which is a packing problem of its own), the Company H-cell with its
hidden cycle count, the Halden No. 4 "Four" (a first-fit cell with a charge eye, the clearest temptation in the game: sell
it for a month's rent or keep it), grey cells, charging, light. Then drones (classes, frames, bays and inserts,
transponders and firmware locks, how a drone finds its way in a shaft, how drones fail, pads), growing, protein machines, air,
small electronics, how founding-era systems fail (four patterns), repair culture and manuals, instruments for seeing hidden
features, and a full machine catalogue with prices and slots. It closes with a day on Stores Run told by the machines,
cross-chain notes and starting kit by past. **Best in it:** plugged versus celled (slack hour kills one and spares the
other), the "missing part" as the nearest thing to crafting that still respects "machines are bought", three buyers for
every first-fit part, the electret film that links the Lung plates, the Four's charge eye and rat-chalk, and route cards in
the controller slot.

### 11. `10-items-and-chains.md`: the catalogue

What a thing is when it sits on your grid. Part one is the item model: kind families, origin and grade, condition,
handling tags (upright, fragile, perishable, snug), legal status, age as **three** clocks (real age, printed date, counter),
hidden features, and how contracts, bays and machines read all that. Section 1.9 states the scale problem plainly (24 squares
cannot hold the three starting machines at one cell per square) and recommends a 2x2 of item cells per rented square. Part
two is the catalogue by family. Part three is sixteen production chains: the catch, three insect lines, fat (render, candle,
soap, salve), cells, grow beds, the dark box and the spent-medium loop, seed, water reclamation, ferments, undoing the void,
screens, drone parts, filters, medicine, packing. Part four is what each band buys. **Best in it:** "the tags do the work"
(the same tomato is three items by grade, condition and who is checking), the Grow Certificate in a bed's paper slot as the
difference between a 240 cr crop and a 672 cr crop, the insect lines chosen by which waste your chute gives you, the dark
box that makes waste valuable twice, "bay-true" crates, and the buzz wand (Terraces toothbrushes pollinating the tomatoes that
go back up to the Terraces).

### 12. `11-contracts-and-clients.md`: the board, the slip and who sends it

The richest file for the core loop, and the one with the most In play paragraphs. The slip is the contract (lose the slip,
lose the job). Grid slips are Company CO-3 forms booked on the Ledger and counted for Standing; Fringe slips are everything
else, pinned round the edge, paid in chits, kind, water, favours and tokens. It gives the CO-3's eleven fields, a table of
slip styles by origin (stock, marks, smell, size), the board on 17 (the old Line Four shift board, 48 clips, rows by
destination band, Crown row on top and usually empty), Noor the Pinner at 07:00, ghost slips you can read but not take,
repinning, brokered slips, claiming, posting your own buying slips, co-loading, every form of pay, then deadlines,
partials, disputes, bay slips, route clauses, and a shorthand glossary. After that come hundreds of example slips by band and
a long roster of named clients, supply agreements, what comes back in the bay, events that change contracts, and "a morning
at the board". **Best in it:** repinning (an unclaimed slip falls one band lower at three quarters of the pay, so "the work
falls down the tower like everything else"), the Crown card that is rigid and cannot be squeezed into a gap, brokered slips
whose original pay shows under a lamp, "the bay must have room on the way back" when you are paid in kind, and the ghost
row as the visible top of the tower.

### 13. `12-voices.md`: the world's own paper (dip in anywhere)

An anthology: Company notices, the water Ordinance's unframed sections, arrears and eviction paper, advertisements for every
brand, five Arbiter determinations, the residents' summary of the Drowning, Rain Church hymns and catechism, Static's
programmes at five hours of the night, Tide Folk sayings and a working song, graffiti, letters between floors (a mother on 17
and her Scholar son on 62, chute mail, notes between neighbours, letters from Bastion), overheard talk, a contract dispute
from slip to settlement, job postings, two menus from the same night, internal brand memos, the Foundation's appeal,
children's rhymes and small paper (a pawn ticket, a chit, a Grow Certificate, the last thing in a dead man's pocket). Read it
between the heavier files. **Best in it:** the 20:00 ledger slip (the thumb shown in brackets on every line), name
rationalisation (the Ledger's 24-character limit renaming the Flats-born), Vey's memo on retiring in-date stock, Static's
"Dial" at 05:00 reading the Fall and the rate, the requisition that asks for a person, and almost every piece as a 1x1 item
spec.

### 14. `07-outside.md`: the bay, the Flats and the other towers

Everything outside the walls and how it reaches floor 17. The bay's shape, tides (two lows a day, fifty minutes later each
day, springs and neaps), wind, seasons, the Sounding's bulletins, the colour of the water, gulls. Old Calder under the water,
landmark by landmark (Mercer's strongroom, the Sleepers, the Regal, the Pans, the Knuckle). The Flats: who lives there, how
they build, eat, drink, trade, worship and die, and a day by the tide. The six salvage crafts, magnet fishing done properly,
kit, dangers and how salvage climbs the tower with every cut it pays. The drowned plant as a dive site. The other towers in
depth, plus four invented ones (the Frame, Coldharbour, the Lee, Ferrybridge). Crossing the bay (the legal door, crossing
frames, Drifters, kite Lines, boats, smugglers, poachers, storms, gulls), and the late-game trade unlock as four keys and a
ladder of stages. **Best in it:** the tide strip as a second clock that drives slack hour, Flats windows and the Great Ebb;
the cell cradle (range against cargo, decided at the launch pad); the gull tax on open bays; care parcels to Bastion; findspot
tags on salvage that change who wants it; and the Sounding Certificate that, once, makes the insurer pay.

### 15. `13-player-and-endings.md`: you

Who you were, what you are handed, how you climb, what the tower asks of you, and how it stops. Part one is fourteen pasts
(the Heir, Whistle-born, Brownglass, the Drop, Mudfoot, Off the boat, the Scholar who came back, the Valet, the Grounded Rat,
the Tagger, the Kettle's grandchild, the Ex-Attendant, Bin hands, the Copyist) and seven more in a line each. Each past gives
the same five things: a skill, contacts, a debt, an enemy and a starting thing in your move-in crate. Part two is the first
day hour by hour, the cage square by square, the neighbours, the first week and month. Part three is climbing on two ladders.
Part four is the recurring choices (reporting neighbours, voided goods, counterfeiting, serving up or down, water, debt,
squares over people, answering the requisitions) with **no conscience meter**: only other people's ledgers. Part five is the
faction arcs. Part six is around thirty endings in ten groups (Staying, Climbing, Together, Business, Leaving, Becoming,
Keeping, Truth, Falling, Not ending). **Best in it:** the PRIOR REGISTRATION box (and its crueller alternatives: a sealed past, or a
past the Lease Office assigns from your first week), the move-in crate as the first packing problem, endings as an offer to
"close the books" on the 20:00 statement, told only by a document, the next morning's board and "What became of them", the
Stores ending (clock number 0000, paid one cell), and the Final Statement with its lifetime rounding line.

### 16. `14-hooks-and-mysteries.md`: what it all adds up to

Read last. It gathers the hooks the other files left lying around and works out what they could mean, under one rule: **the
mysteries are made of the same stuff as the economy.** A clue is an item with a size, a condition and a buyer. Every mystery
climbs four rungs: Talk, Trace (a clue item with "?" features), Proof (traces packed together in one bay and sent to someone
who can read them as a set, which returns a **collation**) and Use. Hot documents carry a heat mark and raise the stakes of
every inspection. It then works through eleven mysteries: the Dark Floors (main version **Upkeep**: the Core is still
making the tower's own founding-era spares on a schedule written in Y0, the Company skims it, and the requisitions come to
your cage because the system thinks Stores is still there), the Foreman (the founding building system that never heard the
Works closed), the Backrun (meters that run backwards, and the hidden Return column), Wall Night, the roof and the
ninth-night craft, Marrow's Ninth, the missing, the Pale Garden, the Old Hands' silences, the poison that isn't history, and
twenty small ones. Then story seeds by place, a recurring calendar from daily to world-scale, where the clues meet, and the
longest list of open questions. **Best in it:** the collation as a packing job, "one truth per run" as an option, the Return
claim through the Grievance Box, the Roll Call night, and the line about the requisitions: "the player is keeping the
building alive and nobody will ever thank them, which is the most Mills thing in the game".

### 17. `99-glossary.md`: the reference

Not for reading through. Every proper name and coined term in the corpus, one line each, with the files it appears in, plus a
timeline from before the founding to the projected future. Its most useful job is continuity: where files disagree, it gives
a resolved form and marks the other as a "retired variant". Keep it open in a second window while you read anything else.

---

## Richest veins

Twenty-five of the strongest ideas, chosen for how well they tie the world to the game. One line each, with where to find them.

1. **The requisitions.** The Dark Floors send Works requisition slips to STORES 17-C, your cage; fill them for strange pay, refuse three and something founding-era on 17 breaks. (02, 14, 13)
2. **Fall-downs.** Unclaimed Grid slips are repinned one band lower at 75% pay; work falls down the tower like everything else. (11)
3. **The Ledger's thumb.** Every amount is rounded against you with the true figure in brackets, and the Final Statement adds up your lifetime rounding. (04, 12, 13)
4. **Paper takes squares.** Permits, clearance cards, insurance slips and tokens all ride in the bay; a Crown card is rigid and costs a full square. (11, 05)
5. **The licence wall.** Licences are framed items standing on rented squares, so the most legal shop is the least spacious. (05)
6. **The Inspection Sweep.** Contraband is found unless it is inside a closed container at the visit hour, which makes the law a packing puzzle. (03, 05)
7. **The collector's tags.** Debt collection tags your highest value-per-square items with a deadline in hours; arrears past that take a row of your field and leave the tape on the floor. (05)
8. **The paper slot.** A Grow Certificate sitting in a bed's slot is the difference between a 240 cr and a 672 cr crop, and can be lent to a neighbour's bed. (10, 04)
9. **The licence trick.** The same still and the same water become "certified safe" when the fee is paid; the letter offering it is a mid-game choice. (03, 06a)
10. **VOID has a method.** A slashed X, a puncture, a bricked chip, a clipped cell or blued bread are each undone by a different tool, and the result sells only to some buyers. (04, 10)
11. **Rejects fall.** Goods that fail the Crown Assay on 93 are voided down the North Chute and can land in your own catch. (02, 11)
12. **The catch that stops.** The chute bin left full stops filling and your share goes to the floor below, and each of the four trunks has its own character. (01, 02, 04)
13. **Four plugs.** The socket board's four outlets and 3 hu an hour, plugged against celled machines, and a slack hour that drifts with the tide. (09, 02)
14. **The cell is everything.** Money, fuel, freight and puzzle in one 1x1 item; the founding-era Four is the first big sell-or-keep choice. (09, 10, 04)
15. **Three buyers.** Every first-fit part can go to the Company (scrip, safe), the Old Hands (fair, the tower is better for it) or a fixer (rich, and it vanishes upward). (09, 01)
16. **People as analysers.** The Old Hands' Bench reveals one hidden feature per hand who looks; a manual on your shelf reveals a setting on every machine of its type, permanently. (06a, 09)
17. **Tokens are cargo.** Faction credentials packed into a bay change the route or the buyer, and are lost when a free-shaft drone is looted. (06a, 06b)
18. **Mysteries made of goods.** Talk, then Trace, then Proof (a collation of clue items packed in one bay), then Use, with heat marks on hot paper. (14)
19. **The Return column.** Meters sometimes run backwards, the Ledger has silently kept the count since Y0, and a Y0 grievance form can claim it. (14, 05)
20. **Close the books.** Endings arrive as an offer on the 20:00 statement and are told by one document, the next morning's board and "What became of them". (13)
21. **PRIOR REGISTRATION.** A past is a skill, contacts, a debt, an enemy and a starting thing, delivered in a move-in crate that is the first packing problem. (13)
22. **The tide strip.** A second clock that sets slack hour, Flats delivery windows and the Great Ebb market, so Flats slips are dated by low water. (07, 06a, 01)
23. **The Chalk moves.** The line where floors are reclassified upward moves down the tower; new Middle-styled slips appear on your board before the new rate card does. (02, 04, 01)
24. **The insurer's Standard.** Cover adds packing rules (one clear square round fragile goods, liquids upright) and never pays on free shafts. (06b, 04)
25. **Reassignment.** Fail-forward without a game over: the lease moves down a few floors and the backdrop, chute table, rent and board all change. (05, 13)

Close runners-up worth a look: the Pantry back door paid in kitchen leftovers (02, 08); Weep events (02); wet debts in litres
(03); the rent-day trickle (04); hour leases (06b); the kid run (06b); the cell cradle (07); brokered slips under a lamp (11);
the Stores ending (13); the Roll Call (14); proverbs as tooltips (08); the dark box loop (10).

---

## Open questions for the designer

These are gathered from every file's own question and loose-thread sections and from the writers' notes, merged and
deduplicated. Where `99-glossary.md` already proposes an answer, it is given as **Glossary:**, which means "proposed by the
continuity pass, not yet applied to the files, still yours to confirm".

### A. Scale and numbers

1. **Square size.** 01 has 1.2 m service tiles, 02 used 1.2 m tiles with a brass stud at a corner, 04 has lease studs 80 cm apart. **Glossary:** 80 cm.
2. **Cells per square.** The 24-square starting lease cannot hold a 3x3 bin, a 4x3 bed and a 3x3 grinder at one item cell per square. Options: a rented square is 2x2 item cells (lease = 12x8 field; 10 recommends this), machines shrink to 2x2 and 1x2, or the lease doubles to 48 squares at half the rate. (10, 04, 01)
3. **The money scale.** 04 fixes a 30 cr labourer's day, a 3 cr Vitabrick, 1.20 cr a litre and 5 cr a square a week. 03 was written near this; 05 drifted to about 15 cr a day ("60 cr is four days' wages"). Confirm 04's four numbers win, and whether these feel right (about 30 cr a day for a labourer, 380 cr for a Wren, relics at 900 to 3,000 cr). (03, 04, 05, 09, 12)
4. **An inverted water tariff?** Should tap water cost more per litre lower down the tower, or is that too on the nose? (03)
5. **Historical prices.** Is a Works-era currency scale wanted (Y20 wages of 1,900 cr a month, about four times today's in real terms), or should old prices stay vague? (01)
6. **Population.** No file fixes the tower's population; 03 used litres per person by band instead. Do you want a number? (03)
7. **Time compression.** Crickets in 48 hours and tomatoes fruiting in six days, or slower chains so one crop spans a rent week? (10)
8. **Tide constants.** Fix a tide range as a game constant (about 5.5 m at springs, 2.5 m at neaps, Gate Floor 3 always under, floor 4 wet at springs)? (07)
9. **Lease tile scale.** A Y57 Lifeline bed was "six squares". Does that match a 24-square starting shop? (01)

### B. Collisions between files (mostly decisions of fact, not taste)

10. **Morning Fall.** 02 has it at 06:00 with the Whistle, 04 has the bin full at 08:00 and a 04:00 "Drop", 06a uses "the Drop" for the shaft rats' meeting room on 20. **Glossary and 14:** the Fall at 06:00, held overnight at Reclaim on 59; "the Drop" retired as the name of the daily release.
11. **Chute names.** Chutes A to D (04) against North, East, South and West trunks (02); "diverter" against "catch". **Glossary:** North ("the Crown Chute"), East ("the Kitchen"), South ("the Long Drop"), West ("the Paper Chute"); Chutes A to D retired.
12. **Which chute floor 17 sits on.** East (02, food waste, feeds insects), Chute D (04, clinic and Vey waste), or North (voided high-value goods, feeds repair)? Or a choice at the start? (02, 04, 10, 13)
13. **Lifts.** 02 has five groups (Freights or Old Two, Locals, Express, the Cradle, Lift Zero); 06a has six cores A to F. **Glossary and 14:** the Cradle in core A, core D dead since Y70 (the Stillcars), Lift Zero behind core E, Old Two on core F.
14. **Air plants.** The Lungs on 30, 60 and 90 (01, 02) against a Mills air plant on 10 to 12 (04). **Glossary:** 30, 60, 90.
15. **The Arbiter's floor.** 66 or 77. **Glossary:** 77.
16. **The Lift Guild's hall.** The Guildhall on 34 (02) or Car House on 45 (06a). **Glossary:** Car House, 45. 12 put Halden Lane Services on 47 to avoid both.
17. **The Co-op's patrol.** The Walk or the Round. **Glossary:** the Round.
18. **"The Mutual".** 04 uses it for the insurer, 06a for Local 9's strike fund, and 06b called the insurer "the Syndicate" in the Mills and "the Nine" on the Flats (but "the Nine" is also the Co-op's nine founding families). **Glossary:** insurer is the Calder Mutual Assurance Syndicate, "the Mutual"; the strike fund becomes "the Fund". The 06b nicknames need a look.
19. **Subletting.** 04 says Clause 31 forbids it; 05 says Clause 112 allows it with a 200 cr Sublet Licence. 06b reconciled the two (a Y61 "licence to occupy" ruling plus a Sublet Licence from Y69). Accept that?
20. **The arrears ladder** differs between 04 and 05. Pick one.
21. **Skywater voiding.** Snapped necks (03, 12) or crushed flat (05)?
22. **The water tap.** A fixed machine on your field (03, 04, IDEAS) or a shared post you carry vessels to in tap hours (02)? 13 used a metered hose branch that only runs in tap hours.
23. **Wall Night and Drowning Night.** 01 names 19.III "Wall Night"; the brief says "Drowning Night". 08 made Wall Night primary. **Glossary:** Wall Night is the Tide Folk's (and Old Hands') name, Drowning Night the Mills'. Is a name that marks who is speaking wanted?
24. **People and places that doubled.** Gus Tanaka-Breen's house is the Eight Squares (02) or Seventeen Rest (06b); **Glossary:** the Eight Squares. Odile Fenn is a refurbisher on 17 (02) and a sitter on 28 (06b); **Glossary/13:** the sitter is Odile Prentice. The Glove Wall is on 17 (02) or 15 (08); **Glossary:** 17. The Co-op was founded in Y47, Y60 or Y61; **Glossary:** Y60. The Old Hands meet on 14 or 19; 14 suggests both (they eat at the Canteen on 14, keep the hall on 19).
25. **"Wren"** is both the starter drone (04) and the eleven-year-old vent kid on 17 (02). Rename one?
26. **H-series and H-cell.** The scrapped founding cell line and today's Company cell share a name. 14 makes it a clue (the Company reused the name in Y44). Keep or rename?
27. **Dark Floor tenants.** 05 places a still and an Orrin bin on floor 23, inside the sealed Dark Floors. Move them to 21 or 27.
28. **Oona Fairweather's dates** in 08 do not add up (hired at nineteen, 22 years to Y41, aged 74). Fix her bio.
29. **Smaller date drifts** the glossary flags: the Foundation's founding year (Y58 against Y68 in 01), the pension suspension (Y62 against Y57 in 06a), the Fringe frame (Y62 against Y52 in 11).

### C. Space, rent and the lease

30. **The Creep.** A steady baseline (+2% every 30 days), rare brutal reclassification jumps (+30% overnight), or both? (04)
31. **Lowerings as a clock.** The Glass Line has moved from 80 to 60 since the founding. Should a fourth Lowering be a mid-game clock felt as rising rent? (01)
32. **Lease shape as a mechanic.** Re-cut events, offcuts around pillars, frontage squares: should the world be able to take the outline of your field itself? (04)
33. **The Pathway.** Rent and the loan at the same time (harsher, sharper satire) or a mortgage that replaces rent? (04)
34. **Arrears severity.** Is losing a row of your field to arrears too punishing, or the right picture of "space is what you pay for"? (05)
35. **Failure without game over.** Reassignment down the tower (05), the baron's "turned" licensee offer, or running a business from a hot-bunk locker (06b)? Which soft states do you want?
36. **Sleeping on the lease.** A real choice (occupancy irregularity, warden attention, a Domestic add-on) or invisible? (08)
37. **Sublet baron as a path.** Can the player earn passive income from titled squares, or is that too incremental? (04)
38. **A Sump lease.** Can the player move there (gang tithes instead of Company fines), or only send contracts? (05)
39. **The Stores cage.** Is the player's lease the old Line Four stores cage (so the requisitions are addressed to you, a personal mystery), or a neighbour's lease you inherit later? (02)

### D. Money and Standing

40. **Chits.** Physical credits (so coins are items), or the Sump and Flats run only on cells and barter? (04)
41. **How many currencies.** Credits and scrip only, or also cells, jug tickets, markers, greens chits and Co-op hours as separate counters? (04, 06a, 10)
42. **Cells as money.** A first-class currency on low-floor slips, or flavour? (10, 04)
43. **Standing.** One number with a short log (IDEAS, 04's main), or three bars (Payments, Deliveries, Conduct) gating different clients? (04)
44. **Ledgers in total.** One Standing, one standing per faction, plus a four-word client ledger (11): too many? Client standing could collapse to "sends you bay slips or doesn't".
45. **Faction standing** as a visible number on a ledger page, or only physical (tokens kept, names remembered)? (06a)
46. **Buying debts.** Can the player buy someone else's debt (a Wells Forty debt, say) and tear it up? (05, 04)
47. **The price table.** Should prices be a literal data table (base value x destination band x grade multiplier) in `kinds.json`? (04)
48. **Air.** Billed at all: a flat levy line, a damp value and a filter machine, or left out? (04)
49. **Payment forms in a first build.** Only cr, sc and kind, or also chits, labour, passage, information and favours? (11)

### E. Water

50. **Water as an item.** Is liquid water a game item with a grade (Real, Pure, Certified, Clean, Grey, Brack, Stale), and do liquids need sealed bays (with gel bricks as the way round)? (03)
51. **Tap hours.** Should the Mills tap run only in windows (06:00–09:00 and 18:00–21:00, giving one plus two in-game hours), forcing storage vessels, or is that too much friction? (03)
52. **Billing.** Machines drawing from the tap with per-litre hourly billing, or only vessels you fill and pour by hand? (03)
53. **The licence.** A separate licence system (a plate on a machine, renewed yearly), or the Alternative where "licensed" just means a Halden meter on every legal source? (03, 05)
54. **Licensed at start?** Unlicensed, licensed, or a choice? Is the certification letter a mid-game choice? (03)
55. **Real water.** Should rain and Skywater be the only Real water, and should the Rain Church's blessing be a tracked reputation? (03)

### F. Power and machines

56. **Power budget.** Is the socket board (four outlets, 3 hu an hour, a second board as an upgrade) a real constraint, or should power only be a bill? (09)
57. **Plugged or celled.** A slot on every machine, or only on some (heaters, lamps, chargers)? (09)
58. **Slack hour.** A daily power cut that drifts with the tide, beside 04's fixed Peak Window, or the Alternative where the tide shows up as price? (02)
59. **Machine origin.** Surface First-fit / Company / Grey as a mark beside the grades, or keep it as flavour? (09)
60. **Tended and overnight.** Should some machines refuse to run overnight (Mincer M8, screw press, bench work), or run overnight at Bulk quality? (09)
61. **The missing part.** A relic that runs badly until you find a specific HW-numbered part: a core repair loop? (09)
62. **How rare are Fours?** As written, a Four is often your first first-fit item. (09)
63. **Route cards and call boxes.** One per free-shaft destination: fun packing or tedium? (09)
64. **Shop-wide states.** Damp, dust, the smell of a soldier bin, chirping: they are properties of the lease, not neighbour effects, but one machine affects the whole shop. Inside the no-proximity rule? (09)

### G. Items and chains

65. **Three insect lines** (chirps, mealies, soldiers, each eating different waste), or only chirps and soldiers? (10)
66. **Distilling spirit.** IDEAS parked the still for minute-scale reasons. Is "pale" in scope as a tended four-hour run with fixed cuts? (10)
67. **Kinds or tags.** Which item states are separate kinds and which are tags on one kind (tomato green/ripe/soft/split, cell full/part/flat, bread blue/washed/stale)? (10)
68. **Legal status and grade.** One mark or two (licensed/grey/void/restored/counterfeit beside real/synthetic)? (05)
69. **A third produce grade.** Named heirloom varieties beside real and synthetic, or noise? (06a)
70. **The Fade counter** on licensed insect stock: fun pressure or chore? (06a)
71. **The Stinker pattern.** Should "same machine, better grade, monthly fee" repeat for food and brand licences? (06a)
72. **Mend style** (invisible or crossed) as a second grade-like property? (08)
73. **Packing texture.** Should the "snug" rule (no empty cells protects fragile cargo) and the "liquid has a top" rule go in early? (10)
74. **The Grow Certificate** as a physical 1x1 item in a paper slot (lendable, losable) or a flag on the bed? (10)
75. **Undoing VOID.** Does it need the bench as a machine with tool slots, or do tools act straight from the rack? (10)

### H. Law and enforcement

76. **The replacement for the dropped heat system.** Scheduled, announced visits that check specific container types and leave slips (05), the Inspection Sweep with its "inside a closed container" rule (03): different enough from Probably Stolen's guard-at-the-counter?
77. **Bribes** as visible choices at enforcement events, with Foundation receipts as evidence and leverage: in or out? (05)
78. **Band gates.** Should 02 and 09 adopt 05's gates at 30, 60 and 90 (passes and lane scans)? (05)
79. **Animals.** Bylaw 82 bans everything except registered insects. If the chicken coop returns, add a livestock licence, or loosen the bylaw? (05)
80. **Hidden requirements.** 12's dispute turns on grade proof rather than grade. Can slips fail on requirements not printed on them, or must every requirement be on the slip? (12)
81. **A crackdown.** Is there a late point where the Company stops tolerating the factions? (06a)

### I. Contracts, the board and paper

82. **Repinning.** Wanted? It needs a price check: does a repinned Crown slip at 75% still beat Mills work after the lane ticket? (11)
83. **Board volume.** 8 to 14 Grid and 2 to 6 Fringe slips a morning, so there is always more than you can do? (11)
84. **Service slips.** Goods come down in the client's bay, are washed or mended, and go back up. One mechanic too many? (11)
85. **The claim fee and informing slips.** Do they make taking a slip a moral commitment, or are they too punishing? (11)
86. **A second board.** Inter-tower slips post only on the Long Pads board on the Shelf. A second board, or bay slips only? (11)
87. **Bay pay from STORES 17-C** arrives "in the next returning bay from any client". Keep that channel? (11, 14)
88. **Paper as items.** Should most documents be 1x1 field items, or should some live only as board, receiver or tooltip text? How much reading do you want? (12, 05)
89. **Static's receiver.** A 1x1 item that gives forecasts, chute reports and rates a day early, or a contact, or a subscription? (12, 06b)
90. **The insurance Standard** as a packing constraint: yes, no, or simplified? (06b)
91. **Odour of origin.** The Amenity's rule (Crown goods fail if the same bay carries insect, frass or compost items) is a rule inside a container, not on the field. Within the no-proximity rule? (06b) The same question applies to 03's brine events that spoil floor-level open containers.

### J. Factions

92. **Tokens.** Packable credentials that change a route or a buyer, or plain keepsakes? (06a)
93. **New factions.** Which of the six to keep: the Period Club, the Amenity, the Green Bands, the Stillcars, the Roll, the Thursday People? (06b)
94. **The Green Bands armband** (warden of 17, 30% rent rebate, Co-op expulsion) is the biggest rent cut in the game. A real option or too strong? (06b)
95. **Old Hands' deaths.** One per season, scripted, so their silences break in a known order: good pressure or too heavy? (06a, 14)

### K. Drones, routes and the outside

96. **Tube gauge.** Should the 80 cm bore cap the size of lane drones, so bigger bays have to fly free shafts or outside routes? (02)
97. **No safe way down.** Licensed lanes stop at floor 10. Keep going down always a risk? (02)
98. **Does the player ever leave in person?** The Great Ebb market crate, the Canteen, a Pier excursion, the Dry Barge ending, or is everything drone- and contract-mediated? (06a, 07)
99. **The drowned floors.** Supply-only for good (divers and middlemen), or later a place you send hirelings? Divers as hirelings with plans (pack their kit, write a plan, get a left-behind list)? (02, 06b)
100. **The tide strip.** Worth a second clock? Free, or partly gated behind a tide table item? (06a, 07)
101. **Range.** The cell cradle (cells take their own squares and spill into the cargo bay on long routes), or range as a plain stat? (07)
102. **Landing Duty.** Taxing the reward bay coming home: sharp or punishing? (07)
103. **The slow alternative.** Drifters, pods on kite Lines, crate freight on boats, or all three? (07)
104. **The Bodge.** An early illegal Mills access to the Lines: a good teaser or too early? (07)
105. **Other towers.** Keep all four invented places (the Frame, Coldharbour, the Lee, Ferrybridge), or cut so the canon towers get more weight? (07)
106. **Loss.** Should loss always be recoverable for a fee (buy-back on the Rail, the Lost and Found), or sometimes final? (07)
107. **Samphire.** A crop on seawater breaks "fresh food only with fresh water". Keep it or drop it? (07)

### L. The player and the endings

108. **The past.** Chosen, sealed (revealed piece by piece like an analysed relic), or assigned by the Lease Office from your first week? (13)
109. **Name, face, gender.** 13 avoids all three so every past works for anyone. Keep it that way? (13)
110. **Endings as stops or modes.** Is "close the books" an end screen, or do some endings (Held Title, the Armband) continue as new modes? (13)
111. **First build endings.** Suggested: Held Title, Glass, the Charter, Bought Out, Going wet, the Rail. (13)
112. **Failure endings.** Gentle as written (the Rail, the Boat, Lapsed), or harder? (13)
113. **The Stores ending.** The Works reclassifies your cage as Works property, rent-free, and it also unlocks the Charter and the Pension. Too strong a key? (13)
114. **The Crown's price.** 240,000 cr makes it nearly impossible by design. Is the Pantry title on 90 (60,000 cr, no daylight) the intended joke ending? (13)
115. **Moral feedback.** Should the warden's regard, faction steps and "What became of them" lines be the only moral feedback, with no conscience meter? (13)
116. **Penhallow's offer** (the full pension for those who vanish): a route the player can take, or only something that happens to others? (14)

### M. History and mysteries

117. **The Dark Floors' default truth.** Upkeep (14's main), the Contract, the Tenant, the Empty Room or the House, or a hidden truth seed per run? 01 kept three readings open (still making cells; a cooling plant on a timer; making the tower's own chips), and 02 four for the requisitions (automated procurement, a person inside, a Company engineer, nothing). Should the mystery end with one answer at all? (01, 02, 14)
118. **Seeing inside.** Even through one drone's bay? 14 says once, late, optional, never on foot. (14)
119. **The requisitions' reach.** Should filling them have visible world effects (fewer air days, fewer lift failures), and is the Core a client with standing or outside the client system? Is the requisition that asks for a person too far? (14, 12)
120. **The nineteen minutes.** Which explanation does tech lean on: electret film (plates, charge eyes, chalk, lease studs), Kessin drive chips, or open? How many Dark Floor threads should run through the factions (Old Hands, Lift Guild, Co-op, ranchers)? (09, 06a, 06b)
121. **The Foreman.** One founding-era mind running everything is tidy for clues and edges toward an AI story. Right glue, or wrong tone? (14)
122. **The Arbiter.** A secret panel, the old lawyer Ambrose Hale-Fennick, or the founding-era Grievance Box (combinable with the panel)? If it is a machine, are scarce Y0 forms too exploitable? 12's A/86/0377 already leans toward the machine. (05, 12, 14)
123. **The Return column.** A debt to tenants, a fund paid to Holdings, or both? A visible reverse tick on the meter? Is a whole-floor claim a Co-op ending or too big? (14)
124. **Wall Night's culprits.** Faces (Edmund Varne in the margin, LR-2, the switchboard) or a pattern with no single culprit? Which version of the Stair Doors: a phone order from the Glasshouse, Ivo Kastelic at the north door, or the Foreman hammering the latch? Is the moral ambiguity right (shutting them killed the Gate Floor and saved the tower), or should the Company be plainly guilty? (01, 14)
125. **The Glasshouse reception.** 412 rich guests safe during the storm explains why the rich "moved up". Too on the nose, or the right understatement? (01)
126. **The seawall.** Halden held the Wall from Y0 under the Accord's Clause 14 and moved it into Halden Civil in Y44 (06a, 01), against the brief's "held the maintenance contract". Is the cleaner blame better? (01)
127. **Inquiries.** Keep both the Company's Wells Inquiry (and the Wells Forty, Y58) and the provincial Vance Inquiry (Y57 to Y59), or merge them? (01, 05)
128. **The seabed.** Halden Civil legally owns old Calder and everything Flats divers raise. Fits 07's Flats economy, or too much Company reach? (01)
129. **The roof.** Lantern cough (the Haldens poisoned by their own warm riser): fitting or too much poetic justice? Where does the ninth-night craft, Moorhen, fly: Vantage, Bastion, or inward with raw materials? Is the first cell in the Lantern still charged, and does it matter? (14)
130. **People in the mysteries.** Moth: one person, two who never meet, or nobody? Kwame Amadi alive on 102: one scene, or melodrama? (14)
131. **The sinking tower** (Gull's barnacle line): keep as a hook or make canon? (06a)
132. **Repose boxes.** What is in them (a constant 250 g)? 08 points at Remains Recovery's "process water". (08, 03)
133. **One mystery or many.** Should 14 tie Bastion, the Crown Pad's 03:00 ninth-night craft, Coldharbour's Bay 9 and the Dark Floors into one, or keep them separate? How many mysteries per run: all eleven seeded thinly, or two or three chosen per run with the rest left as Talk? How many burning documents can one run hold? (07, 14)
134. **The Roll Call.** A yearly founding-era self-test on the night of 30.III: should it reveal one hidden feature on your founding-era machines for free? (14)

### N. Tone checks

135. **Children.** Vent kids hireable with no registration fee: acceptable as a mechanic or flavour only? Is sending a nine-year-old into the Dark Floors too dark even as an optional choice? (06b, 08)
136. **The body.** Plasma selling with a punched donor card, A/B/C grades that show your water quality, and the Rain Church shunning the "dried": right tone, or is the body off-limits as a mechanic? (06b)
137. **Burial plots** on the Knuckle (the only dry ground) against the Tide Folk's ebb burials: a theme, or too dark? (07)
138. **The crossing fashion.** The Crown buying back voided Mills shirts at 300 cr: the right dark humour, or too knowing? (08)
139. **Small gambling.** A 1 cr Fall-count bet each morning and chirp matches: player-facing or background? (08)
140. **Song and sound.** Rhymes, hymns and work songs mean singing, and Bylaw 81 makes singing noise. Shown in the game, or text only? Should daily sounds (Whistle, Fall, pump horn, slack blink, a silent bin, the Hum) become gameplay cues? (12, 08)

### O. Calendar and pacing

141. **The months.** Twelve numbered months of thirty days, northern seasons (midsummer in VI to VII, Lamp Night in XII): acceptable? (08)
142. **Where the game starts in the year.** Wall Night (19.III), Resilience Day (22.III) and Founding Day (1.IV) early, so the player meets the history in their first season, or late, so they have something at stake? (01, 14)
143. **Rhythms.** The seven-day week, the fortnightly tide, the thirty-day month, the Period card every 90 days, and a nine-day ninth-night cycle that lines up with the week every 63 days (a "long Seventh"): one rhythm too many? (14)

---

## What to do with what you keep

When something in here becomes a decision, move it out: setting and history into `../LORE.md`, mechanics into `../IDEAS.md`.
Then, if you like, add a line to `00-canon-brief.md` so any later writing pass stands on it too. The files in this folder can
stay as they are: they are the spoil heap, and the spoil heap is allowed to contradict itself.
