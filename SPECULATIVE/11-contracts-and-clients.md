# 11. Contracts and clients

*Speculative. Rocks and soil. Plain text is the main version, **Alternative:** is another version of the same thing,
**Hook:** is a story seed, **In play:** is how it surfaces in the game. Names, floors, numbers and the timeline follow
`00-canon-brief.md`. Prices, Standing, lanes and fees follow `04-economy.md`; shafts, risers, gates and the board on 17 follow
`02-the-stack.md`; faction tokens and standing follow `06a`/`06b`. Where this file adds a rule, it says so.*

Scale, so every number below can be checked: a Mills labourer earns **30 cr a day**. A Vitabrick is **3 cr**. A certified
tomato is **14 cr** in the Terraces and **20 cr** in the Crown. A single lane ticket from floor 17 costs **3 cr + 0.2 per
floor**, so 17 to the Sixty Walk is about 11.6 cr and 17 to the Postern on 93 about 18.2 cr. The starter drone (Halden
"Wren") has a **3x2 bay**: six squares. Every paper that rides in it takes one of those six.

---

## 1. What a contract is

### The slip is the contract

There is no contract in the Stack apart from the slip. Nobody signs anything else, nobody keeps a second copy that matters,
and the Ledger, when it books a delivery, books it against the number printed on the slip. If the slip is lost, the contract
is lost. If the slip rides in the bay, the contract rides with it. This is the rule `IDEAS.md` proposed for the game ("packing
the slip into the drone assigns the contract"), and in the world it is a rule people learned the hard way: in the early lane
years, couriers who sent goods without the slip were paid for nothing, because the client's pad had nothing to read.

The Company's name for a slip is a **Consignment Order**. Its own form is the **CO-3**, a grey card printed in the Count House
with a Ledger number down the left edge in a type that a pad reader can see through a closed bay lid. Everything else people
call slips (embossed cards, cyclostyled forms, chalked plate, knotted string) is either a CO-3 dressed up by its client, or
not a Consignment Order at all, in which case the Ledger has never heard of it.

That division runs through everything below:

- **Grid slips** are CO-3 Consignment Orders, posted through **Halden Consignment Services** (HCS), pinned on the board's steel
  grid, booked on the Ledger, settled through pay posts, and protected (in the narrow way Halden protects anything) by the HCS
  Claims Desk. They count for Standing: +4 on time, −10 late, −25 failed (see 04).
- **Fringe slips** are everything else. They are pinned on the board's frame, on the wall around it, on the lift-lobby pillar,
  slipped under your shutter, tucked into your returning bay, or said aloud by a vent kid. They pay in chits, kind, water,
  favours and tokens. They do not touch Standing, except through a pay post report (+2, see 04), and they are protected by
  nothing but the client's memory and your floor's opinion of the client.

**In play:** a slip is a 1x1 item (a few are bigger: below). Grid slips carry a small Ledger stripe; Fringe slips don't. The
stripe is the whole difference in the rules: it decides whether the delivery touches Standing, whether HCS settles the pay, and
whether a dispute has anywhere to go. The player learns to read the stripe before the text.

### The anatomy of a CO-3

A CO-3 has eleven printed fields. Clients fill them by hand, by stamp, or (above 60) by printer. Not every field is always
filled, and an empty field means something.

| Field | What it says | Notes |
|---|---|---|
| **Ledger No.** | `CO3-86-17-04417`: year, posting floor, sequence | The pad reads this. Never fill it in yourself. |
| **From** | Client name, lease, floor | Crown households write the household, never the person. |
| **To** | Drop point: "Postern cradle 14", "Hatch 18", "Perch at 5", "Lease 44-B shutter" | A drop point is a place, not a person. |
| **Wanted** | Goods by tag or kind, count, grade, status | "Tomato, R✓, 12" or "any protein, 8 kg" |
| **By** | Deadline: an hour, "the Whistle", "low water", a day | Blank means "no hurry", which means "we may withdraw it". |
| **Pay** | cr / sc / mixed | Written `60 cr`, `40 cr + 30 sc`, `90 sc`. |
| **Return** | What goes back in the bay | Optional. The best slips are the ones where this field is filled in by hand. |
| **Std.** | Minimum Standing | Printed in the corner as a pip. Visible even when you cannot take the slip. |
| **Accepts** | Status clauses: "Licensed only", "Prov. req.", "No questions" | See the glossary below. |
| **Route** | "Lane only", "Any route", "No chute", "Chit enclosed" | The client's rule, not the Company's. |
| **Terms** | Part delivery, lateness, surplus | Most clients leave the HCS defaults (section 2). |

**In play:** the slip is the contract screen. No other panel is needed. Hovering a field explains it; empty fields show their
default ("By: none. The client may withdraw at any time.").

### Slips look like where they come from

`IDEAS.md` wants slips styled by origin, and 06a adds that factions have their own hands. A full catalogue by origin, so an
artist and a writer can work from the same list:

| Origin | Stock | Marks | Smell, feel, sound | Size |
|---|---|---|---|---|
| **The Crown** (90–104) | Heavy cream card, deckled edge, blind-embossed crest | A household's device in coloured ink; steward's initials; never a person's name | Faint citrus or cedar; stiff; does not fold | 1x1, rigid (cannot be crushed into a gap) |
| **Crown staff** (the Pantry) | The back of a menu card, a laundry tag, a torn paper napkin | Pencil; a kitchen's grease thumbprint | Smells of real butter, which is unsettling | 1x1, crumpled |
| **The Terraces** (60–89) | Laminated print on CO-3 stock, the client's letterhead overprinted | A Ledger reference printed, not written; a clinic's or office's logo | Clean, slick, cold | 1x1 |
| **The Middle** (30–59) | Plain CO-3 filled in by hand, rubber-stamped, with a carbon behind it | Shop stamps, licence numbers, "please" and "thank you" | Smells of carbon paper; neat block capitals | 1x1, carbon attached |
| **The Mills** (10–29) | Cyclostyled, pencilled, printed on the back of something else | A floor and lease number; a Co-op wheat-and-cell stamp; a thumb | Crumpled, soft, often damp | 1x1, crumpled |
| **The Sump** (4–9) | Chalk on a scrap of hatch plate; a Vitabrick wrapper; nothing | A gang's mark; a drop described by landmark ("the pump with the candle") | Wet, rust-stained | 1x2 (plate), or no item at all (spoken) |
| **The Flats** | Oilcloth, a knotted cord with a shell, a sentence said by a kid | A berth's knot; a tide window instead of an hour | Salt and mud | 1x2 (cord) |
| **Halden itself** | Grey CO-3 with the gear-and-tower in the corner | "Service Order"; a department code | Smells of nothing; perfectly flat | 1x1 |
| **The Dark Floors** | Works requisition stock, dot-matrix type, Y41 forms | "STORES 17-C" | Warm, as if it has been near something running | 1x1 |
| **Other towers** (late) | Each tower its own: Vantage white polymer; St. Ober's pale blue; Greenhold paper with a seed watermark | Tower seal; a crossing number | Varies | 1x1 |

**In play:** the look tells the player the band and the hand before they read a word, and the size tells them what it costs
in the bay. A Crown card's rigidity matters in packing: it cannot be bent around a corner, so it takes a full square where a
crumpled Mills slip can be squeezed into a gap left by a round item. (A small, true, physical cost of serving the rich: even
their paper takes more room.)

---

## 2. The board, and how slips are posted, taken and paid

### The board on 17

The board at the lift lobby on 17 is the Works' **shift board** from Line Four: a steel grid two metres wide with **48
numbered clips** in six rows of eight, under a hooded lamp, with a pay-post reader bolted to its right-hand stile. In the
Works years each clip held a worker's shift card, and the rows were the line's six stations. Halden kept the grid and
changed the rows. Since the **Board Rationalisation** of Y66 (the same year the lanes were sold), HCS pins Grid slips by
destination band, top row to bottom row, so the board reads like the tower: the top row is the Crown, the bottom row is the
Sump. On most mornings the top row is empty, or holds one or two ghost slips the player cannot take yet.

| Row | HCS label (stencilled) | What it usually holds on 17 |
|---|---|---|
| 1 | CROWN 90+ | 0–2 slips; Std. 800+; ghosts for most of the game |
| 2 | TERRACE 60–89 | 1–3 slips; Std. 600+ |
| 3 | MIDDLE 30–59 | 2–4 slips; Std. 400+ |
| 4 | MILLS 20–29 | 2–4 slips |
| 5 | MILLS 10–19 | 3–6 slips |
| 6 | SERVICE | Halden's own Service Orders; scrip work |

There is no Sump row. HCS does not post below Ten ("service ends at Ten"). Every slip going down comes by the Fringe.

The **Fringe** is the board's wooden surround (a frame the Co-op fitted in Y62 to keep the lamp from burning the wall) and
about three square metres of lobby wall on either side. It is nails, drawing pins, a strip of cork somebody salvaged from a
Middle noticeboard, chalk, and the pillar opposite. HCS's rule is that the Fringe is cleared each morning at the pin. In
practice the Pinner clears whatever she was not paid to leave.

### The Pinner

**Noor Halvorsen**, HCS Pinner for floors 14 to 19, forty-one, Middle-born, lives on 33. She rides Old Two down at 06:15 with a
canvas satchel of slips sorted by floor, starts on 19 and works down, and reaches 17 at 07:00 with the Works Whistle still
in the air. She pins Grid slips on the clips, unpins yesterday's expired ones and stamps them EXPIRED into her satchel, takes
down the Fringe, and goes. She is paid by the board (2.40 cr a board a day), fined for every slip pinned late, and paid nothing
for the Fringe, which is why she leaves some of it up for a chit tucked under the frame.

**In play:** the 07:00 pin is the start of the contract day: the game day begins at 08:00, so the board is already full when
the player wakes. The Pinner is a background presence with one small lever: pay her (1 cr chit) and a Fringe slip you posted
yourself (a buying slip, see section 2's "Posting your own") stays up a second day.

**Hook:** Noor has stopped clearing one corner of the Fringe. Slips pinned there are in a hand nobody on 17 recognises,
on paper that is not quite any band's, and they are always taken by the next morning, though nobody admits taking one.

### How many slips, and which

Each morning the board on a floor shows, roughly:

- **Grid:** 8 to 14 slips, weighted toward the floor's own band and the bands either side, and **filtered by Standing**: slips
  above the player's Standing are pinned as **ghosts**: visible, readable, greyed, with the Std. pip lit red. You can read a
  Crown slip at Standing 300. You cannot take it.
- **Fringe:** 2 to 6 slips, from the floor and from below. More on rent day (everyone is selling), more after a Morning Fall that
  went badly (everyone is buying), more in the Blows.
- **Bay slips** (see below): addressed slips that arrive in your own returning drones from clients who know you. These are
  never on the board.

**Repinning.** A Grid slip that nobody claims by its deadline (or by the end of its first day, if it has no deadline) is not
destroyed. HCS **repins** it the next morning **one band lower**: its Std. pip falls to that band's floor, its pay is cut by a
quarter, and it gains a red REPINNED stamp across the corner. A Terraces job nobody in the Middle would take for 80 cr reaches
the Mills the next day at 60, and the Sump never, because there is no Sump row. Mills people call these **fall-downs**. The
work falls down the tower like everything else.

**In play:** repinning is a clean way to let early players touch upper-band work: a fall-down from the Terraces at Std. 400
is the first time most players see a cream-adjacent card in their own hands. And it tells them, at a glance, what the
Terraces think a job is worth compared with what the Mills will be paid for it.

**Brokered slips.** Middle shops take Terraces and Crown slips they cannot fill and re-post them on Mills boards under their
own stamp, at a fraction of the pay. A **brokered slip** shows two origins: the Middle broker's stamp printed over a Terraces
slip, or a CO-3 with "per Ambler & Daughters" beside the client's name. The broker keeps the difference and gives you the
access. Held to the board lamp, a brokered Crown card still shows its blind-embossing under the overprint, and sometimes the
original pay, pressed into the card by a steward's pen.

**In play:** brokered slips are a Standing workaround with a visible cost. The slip's gate is the broker's (lower), the pay
is the broker's (lower), and the reward field is usually crossed out (the broker keeps the reward too). A **spectro wand** or
a **lamp** (any light item) on the slip reveals the original pay. Knowing it changes nothing on this slip and everything about
how you feel about the broker. **Hook:** deliver a brokered slip directly to the original client, bypassing the broker, and
the client may start sending you slips directly. The broker will notice within a week.

### Taking a slip

1. **Lift it off the clip.** A Grid slip is perforated along the top: the **stub** (with the clip number and the Ledger
   number) stays on the clip, so the board shows the job as taken. The slip comes away in your hand.
2. **Touch your tally to the board's reader.** The Ledger logs the **claim**. HCS charges a **claim registration** of 0.5 cr
   ("to secure your exclusive right to fulfil"). From this moment a failure to deliver counts against Standing.
3. **Fringe slips:** take it. Custom on 17 is to chalk your **board mark** (every lease has one: a shape, a letter, a little
   drawing) beside the empty nail so the client knows who took it. Taking a Fringe slip without marking is how fights start.

**In play:** the claim is the commitment point. Claimed slips go into the player's inventory as items and can sit there,
unlaunched, until the deadline, but each claimed Grid slip is a −25 waiting to happen. A claimed slip can be **handed back**
(return it to its clip before 12:00 the same day) for a **withdrawal fee** of 2 cr and −2 Standing, "to reflect the cost to the
client of the delay". Fringe slips can be put back for nothing, and your board mark scrubbed off by the next person.

### Posting your own

The board runs both ways. A player (or any tenant) can post a **buying slip**: a request for goods from suppliers. Grid
posting costs a fee by origin band (Mills 0.5 cr, Middle 2 cr, Terraces 5 cr; Crown households are not charged, "as a
courtesy") plus the HCS levy on settlement. Fringe posting costs a nail and a chit for the Pinner.

**In play:** a buying slip is the supplier side of the same system: post "Wanted: broken clocks, any condition, 0.5 cr each,
by the Swap" on the Fringe, and over the next days sellers turn up at the counter or drones land at your pad with clocks in
the bay. It lets the player pull a specific input without waiting for the chute.

### Launching against a slip

The slip goes into the drone's bay with the goods. The drone's transponder (if it has one) reads the slip's Ledger number at
launch and logs the consignment. Then the route (section 4).

- **One slip per bay** by default. Two slips for the same client and drop point can share a bay ("co-loading"). Two slips
  for different drop points cannot, unless the drone has a **multi-drop controller** (a later part, see 09), in which case the
  drone lands at each in floor order and a delay at the first makes the second late.
- **Papers ride with the slip**: lane permits, clearance cards, provenance slips, certificates, insurance slips, tokens. Each
  takes a square. A Crown run in a Wren is a 3x2 bay with the slip, the Terraces permit and the Vellacott card in it: three
  squares left for goods.

### Paying

When the drone lands at the drop point:

1. The client (or the client's pad, or the Postern clerk) checks the goods against the slip.
2. **Grid:** the pad books the delivery against the Ledger number. HCS settles the pay to the player's account, less the
   **settlement levy** of 4% ("assurance"). The Ledger's thumb rounds down. A slip paying 60 cr lands as 57.
3. **Fringe:** the client pays however they pay: chits in the bay, kind in the bay, a pay-post transfer later (which reports
   +2 Standing for the player, if the client bothers), or a promise.
4. The client packs the **Return** into the bay, plus whatever paper comes back: a **receipt stub** (Grid), a **rejection slip**,
   a **remainder stub**, a counter-note, a new slip.
5. The drone flies home and lands on your pad. **Unpacking the bay** is the reward moment `IDEAS.md` describes: a small mystery
   box, unpacked with the same handling as everything else.

Pay comes in many forms, and the slip says which:

| Pay | Written | Where it goes | Note |
|---|---|---|---|
| Credits | `60 cr` | Ledger | levy and thumb apply |
| Scrip | `90 sc` | bundle of notes in the bay (1x1, dated) | 90 days to spend at the store |
| Mixed | `40 cr + 30 sc` | both | Halden and its brands' favourite |
| Chits | `20 cr (chits)` | chit roll in the bay | can be looted on the way home |
| Greens chits | `30 gc` | Co-op chits in the bay | food and Crib time only (06a) |
| Kind | `Kind: 4 kg greens` | goods in the bay | the bay must have room on the way back |
| Water | `20 L` or `Pool credit 40 L` | can in the bay, or a credit on a Pool tap | |
| Labour | `1 shift` | a worker turns up next morning | a hireling for a day (04) |
| Tokens | `2 Rainmarks` | tokens in the bay | faction standing (06a) |
| Information | `copies`, `a name`, `a route` | paper in the bay | Archivists, Static, rats |
| Favour | `a turn owed` | a 1x1 IOU card with the client's mark | redeemable once (04, "turns") |

**In play:** "the bay must have room on the way back" is a real rule. A client paying in kind fills the bay the drone
returns with, so a drone packed with a bulky return cannot also carry home something else (a second pickup, a bought part).
A player who packs a cold liner into the bay for the outbound load gets the client's return in a cold bay, which some clients
notice and pay for (a Crown kitchen that sends back cream).

---

## 3. Deadlines, partial deliveries, lateness, wrong goods, disputes

### Deadlines

Deadlines are written in the tower's own clock, and the player learns it the way tenants do (02, the building's day):

| Written | Means |
|---|---|
| `by 18:00` | the hour; booked at the pad |
| `by the Whistle` | 14:00 (the old day-shift whistle); on Works clocks, four minutes early |
| `by the Night Whistle` | 22:00; for Crown slips this is also the Ninety Gate's closing |
| `by the Fall` | before 06:00 tomorrow; i.e. overnight |
| `by low water` | Flats and Sump slips; the hour moves 50 minutes a day |
| `before the window` | divers' slips: before slack water, when they go down |
| `W/E` | week ending: rent day |
| `by the Swap` | the Co-op's seventh-day swap table |
| `standing, weekly` | a standing order; a new slip arrives each week in the bay |
| (blank) | no deadline; the client may withdraw it whenever |

### Late

The HCS default **late scale**, printed on the back of every CO-3: pay is docked **10% for each hour late**, to a floor of
50%, until the **drop-dead hour** (default: deadline + 6 hours, or the next 07:00, whichever comes first). After the
drop-dead hour the delivery is **refused**: the goods come back (or don't, see below), the pay is nothing, and the Ledger books
a failure (−25). Late but accepted books −10.

Clients can write their own terms over the default. The Crown never accepts late: the Ninety Gate closes at 22:00 and a
drone that arrives at 22:01 waits in the holding bay until 06:00 and is refused at 06:01. Lantern Row kitchens write
"**NO LATE**" in red, because a lunch service does not wait. Mills clients usually write nothing and grumble. Sump clients
pay what they think it was worth.

### Partial deliveries

Every CO-3 has one of three boxes ticked under **Terms**:

- **Whole only.** All of it, or nothing. Short bays are refused; the goods come back.
- **Pro rata.** Each unit pays its share. The Return is withheld unless the delivery is whole.
- **Part, remainder by ___.** The client accepts what came and packs a **remainder stub** in the returning bay: a new, smaller
  slip for the rest, with its own deadline, at the same unit rate. The remainder stub is a Grid slip already claimed in your
  name.

**In play:** partial delivery is a packing decision made visible. If twelve tomatoes do not fit with the paper, a Pro rata
slip lets you send nine now; a Part slip lets you send nine now and three tomorrow (a second launch, a second fee); a Whole
only slip makes you go up a frame size or leave it. The **remainder stub** is a good little item: proof of a half-kept
promise, sitting in the inventory with a ticking hour.

### Surplus

Over-delivery is not rewarded in the upper bands. The defaults, stamped on the back of the CO-3 in descending courtesy:

- **Crown and Terraces:** "Surplus retained." Extra goods are kept and not paid for.
- **Middle:** "Surplus credited at 50%, or returned carriage forward." The client chooses.
- **Mills:** paid at the slip rate, or sent back, usually with a note.
- **Sump:** kept, and remembered fondly.

### Wrong goods, wrong grade, wrong papers

What happens when the goods are not what the slip says depends entirely on where they land:

| Destination | What happens to rejected goods | What comes back in the bay |
|---|---|---|
| **The Postern (93)** | The Assay fails them. A disposal valet slashes or stamps them VOID and drops them down the North Chute. | A printed **rejection slip**: the reason, the Assay number, nothing else. |
| **Orchard Pad (96)** | The gardener hands them back. | The goods, and a pencilled note. (The Vellacotts' gardener is kinder than the Assay.) |
| **Terraces** | "**Returned, carriage forward.**" | The goods, and a bill for the return lane ticket, deducted from your account. |
| **Middle** | "**Held pending.**" The client keeps the goods. | A counter-slip: accept 50% for them, or pay a collection fee to have them flown back. |
| **Mills** | The client keeps what they can use. | A note: "took 8, paid 8, 4 back". |
| **Sump** | Kept. | Whatever the client thinks is fair, which can be more than the slip. |

**In play:** the Crown's rejection is the harshest rule in the contract system and the cleanest image of the divide: wrong
goods sent up do not come back, they come down, through the chute, voided, and might land in the player's own catch the next
morning with a VOID stamp on them. (A tomato cannot be stamped VOID. It is crushed. It lands as **crushed produce**: feed for
the insect bin.)

### Disputes

Where a contract argument can go, from the most formal to the least:

1. **The HCS Claims Desk** at Thirty Station (floor 30). For Grid slips only. Form **CD-4, Notice of Delivery Dispute**, 5 cr,
   filed by drone or in person within 48 hours. Ruled in three days, on the papers. The evidence HCS will look at:
   - the **pad log** (lane flights only: the transponder logged the bay's weight at launch and at each gate);
   - the **bay seal** number (a numbered single-use tag, 1 cr, which must arrive unbroken);
   - the **manifest carbon** (a carbon copy of the packing list, if the player kept one; see Items below).
   HCS does not publish its rulings. It is known on every floor that when the evidence is even, HCS rules for the party with the
   higher Standing, "as a matter of assurance". The Claims Desk clerks call it **the tiebreak**.
2. **The Arbiter** (floor 77), for disputes over 500 cr, under Charter Clause 41 (see 05). Sixty days, 60 cr fee, costs to
   the loser. The Register board on 19 shows four contract disputes from Mills tenants in eleven years. All four went
   against the tenant, with costs; the best of them cost only 140 cr.
3. **The Drop board** on 20, "by chalk", for anything involving shaft rats: both sides write their account on the wall, and
   for a week anyone passing adds a mark (06a).
4. **The Co-op's Floor meeting** (monthly, on 19), for disputes between members.
5. **The Old Post** on 8, first of the month, where the Sump gangs settle borders and debts (05). A Sump client who shorted
   you can be raised there, for a cut to whoever raises it.
6. **The reckoner's slate**, for the Flats. If your name is on the slate as owed, you are owed. If it is not, you are not.

**In play:** disputes are rare, deliberate choices, and their odds can be shown honestly. A CD-4 against a client with
higher Standing shows "Evidence even: the client is favoured". Each piece of evidence the player holds (a seal, a carbon, a
pad log) moves the odds by a visible step. On a **free shaft** there is no pad log, ever, and the Mutual's exclusions mean
there is no insurance either, so a dispute about a free-shaft delivery is word against word. That is a reason to fly the lanes
that no tooltip has to explain.

**Hook:** a client disputes a delivery the player knows was whole. The pad log at the Thirty read shows the bay lost 340 grams
between Thirty and Sixty. Something in the Tube opens bays. HCS says the reader is "within tolerance".

### Cancellations

Clients may withdraw a slip at any time before the drone lands. HCS stamps it WITHDRAWN. If the player's drone is already in
flight, it lands, finds nobody, and comes home with the goods. The default **withdrawal compensation** on a CO-3 is the claim
registration fee (0.5 cr) refunded, and nothing else. The Crown withdraws without explanation ("The household no longer
requires.") more often than any other band, usually because a party was cancelled or the steward changed. The Mills withdraw
because the client was evicted.

### Standing orders and supply contracts

A **standing order** is a slip that renews. The first is pinned on the board; after that, the client puts the next week's
slip into the bay on each delivery. Standing orders are how a player becomes **someone's supplier** rather than someone who
took a job, and they are the first sign of a client relationship. Miss one, and the client stops sending the next.

A **supply contract** is a standing order with a clause. The client promises a fixed volume and price for a season; the
player promises **exclusivity** (no sales of that good to anyone else), or a minimum, or a grade. Orrin, Vey and the
Glasshouses write supply contracts. They are generous for exactly one season (02, the Real-Blend hook) and then the price is
"reviewed".

**In play:** a standing order is a slip that sits in the inventory and reissues itself in the returning bay. A supply contract
is a 1x2 document (the **supply agreement**) that must be kept on the field, in a wall container or a drawer, for as long as it
runs. Its exclusivity clause is checked the simplest way possible: if the player sells that good through the counter or to
another slip, the next delivery to the supply client comes back with a **breach notice** and the agreement ends.

### Gates

What stands between a slip and the player, all in one place (Standing values from 04):

| Gate | Shown how | Where it applies |
|---|---|---|
| **Standing** | the Std. pip on the slip's corner; ghost slips above it | all Grid slips: Mills 200–400, Middle 400–600, Terraces 600–800, Crown 800+ |
| **Licence** | "Lic. FH req." (Food Handling), "Grow Cert.", "Reseller (Vey)" | Orrin, Vey, Grading-dependent slips |
| **Papers in the bay** | "Prov. req.", "Cert. req.", "Permit T" | upper slips; checked at band gates and on landing |
| **Bay type** | "Cold carry", "Sealed bay", "Upright" | food, medicine, live insects |
| **Frame** | "Tube gauge only" (lanes); "crossing frame" (towers) | route-dependent |
| **Faction standing** | the slip shows only at *Known* or above; a token in the bay | Church, Co-op, Guild, rats, Tide Folk (06a) |
| **Client standing** | the slip arrives in the bay or not at all | clients in section 6 |

**In play:** these gates are deliberately all things the player can **see**: a pip, a printed clause, a paper that must take a
square. No gate is a hidden number. The player who wants a Vey slip knows exactly what it needs (Standing 600, a sealed liner,
a Reseller licence), and can price the climb.

### Bay slips: the client relationship as an item

The best slips never reach the board. A client who has had three good deliveries from the player begins to put **the next
slip into the returning bay**, addressed to the player's lease, bypassing the board, the Pinner, the claim fee and (for Grid
clients) the posting fee. A bay slip is already claimed in the player's name.

**In play:** this is how clients are *had*. A player's regular clients are the ones whose slips come home in the drone. Bay
slips also say something about the client's mood in their tone (a Crown steward who adds "with the household's thanks" is
warm; one who adds "as before" is cooling). Fail a bay slip and the client goes back to the board, where everyone can see their
slips and nobody has to know why.

---

## 4. Routes and risks, from the contract's side

The routes themselves are in `02-the-stack.md` Part five: the four **Tube** lanes (T-North, T-East, T-South, T-West) with gates
at 30, 60 and 90; the eight **risers** (free shafts); the **Empty**; the **Gap**; **Old Two** with a freight chit; the
**chutes** (down only); and the **outside**. This section is about what a slip says about routes, and what routes do to
contracts.

### Route clauses on slips

| Clause | Means | Who writes it |
|---|---|---|
| **Lane only** | The client will refuse goods without a pad log. A free-shaft drone is turned away at the drop. | Crown, Terraces, Vey, Orrin, anyone with a pad |
| **Any route** | The client does not care how it got there. | most Middle and Mills slips |
| **No chute** | Chute-dived goods are refused (they are known by the dents and the Bale Hall smell). | Mills clients who want eggs whole |
| **Chit enclosed** | The client has paid for a Lift Guild freight chit and it is pinned to the slip. The drone rides a car. | Guild-friendly clients; anyone shipping fragile goods |
| **Grille hand** | The goods go up a free shaft to 89 and a Pantry hand carries them in (02). | Pantry staff slips only |
| **Perch at 5** / **the Knot** | The Sump drop points; the client tells you which toll you'll pay. | Moat clients |
| **Landing, low water** | Drop at the Landing on 4 within the tide window. | Flats clients |
| **Crossing window** | A date and an hour band; the Sounding's forecast is attached. | other towers (late) |

### What trouble costs a contract

Trouble on a free shaft is never a fight (02). From the contract's side, every kind of trouble is one of six outcomes, each
of which the slip's terms then judge:

| Trouble | Where | What happens to the contract |
|---|---|---|
| **Toll** | Knot (R7 at 9; R1, R3 at 6); toll nets | Pay docked on landing (5–20%). The contract still counts as delivered. |
| **One item lost** | Toll nets (kids take food first); pickers (chute); looters | The delivery is short: Whole only → refused; Pro rata → paid short; Part → remainder stub. |
| **Soiled** | Soot jams, the Wet One (R4) | Food in an open bay drops a grade. R✓ goods become R, and fail an Assay. |
| **Turned back** | Rat hole rewelded at a comb; Crown Comb at 89 | The drone comes home with everything; the slip is now late. |
| **Held** | Gate scan at 30, 60, 90 | The bay is held for an hour or confiscated (grey goods above their band, see 05). |
| **Lost** | Cell failure in the Empty; a looted drone | Everything gone, slip failed, frame gone. Free shafts are excluded from Mutual cover. |

**In play:** this table is the reason slip **terms** matter for route choice. A Pro rata slip tolerates a free shaft; a Whole
only slip punishes it. A slip with "Lane only" removes the choice. A cheap, Any route, Pro rata Mills slip is the natural
first contract to send up a riser, because the worst a toll net can do to it is a kid eating a tomato.

### What each band's slips do to your route

- **Crown slips** are lane only, always, and need the Terraces permit (90 cr a week, Std. 650) or a single ticket (about 18 cr
  from 17), plus whatever card the household issues. The cost of the route is a real share of the pay. A 60 cr Crown slip is
  worth 40 after the ticket and the levy, which is still more than a day's labour, and it brings a Crown return.
- **Terraces slips** are mostly lane only. A few (the orchid grower on 61, the Glasshouses' heirloom buyer) accept free-shaft
  delivery to a ledge or a service hatch, unofficially, at a better price.
- **Middle slips** are mostly Any route. The Thirty comb has holes; the Gap at 41 lets a riser drone skip the Turnstile. Middle
  shops like rats because rats are cheaper, and fear rats because the Thirty read is where brand agents wait.
- **Mills slips** are Any route and short. Most go along a floor or one or two floors up the Three. Many go **by hand**: a vent
  kid carries the goods along the floor for 1 cr, which costs a launch nothing and an hour of the kid.
- **Sump slips** have no safe route (02). The choice is toll (riser), time (Old Two), or damage (chute).
- **Flats slips** go down to the Landing, and the tide decides whether there is anybody there to receive them.

### Weather and the crossing (later)

Between towers, the route is the bay (07). Inter-tower slips arrive late in the game, through the **Long Pads** on the Shelf
(02, 07), and they add three risks that the tower's shafts do not have:

- **Wind.** Flights with the wind take the table's hours; into it, an hour or two more and more charge (07). A slip that says
  "by the draw" (the morning land breeze) is a hint about when to launch.
- **Storm holds.** In the Blows, outside routes close on storm days. A crossing slip claimed before a storm is announced has
  its deadline suspended only if it is a Grid slip **and** the client is above 60. Everyone else's deadline runs. (The
  Sounding's Premium bulletin, seventy-two hours out, is what makes crossing work possible at all.)
- **Poachers.** Open-water boats with nets and long poles who take drones out of the air over the bay. In contract terms, a
  poached drone is a **lost** outcome: bay, frame and slip, with no cover. Poachers do not work in the Murk (they cannot see
  either) or in the Blows (they cannot stay afloat), which is why those two seasons are the smuggling seasons and the
  crossing season is the dangerous one.

**In play:** inter-tower slips are the far end of the same system: the same slip, a longer clock, a bigger bay, more paper,
and a risk table that changes with the season instead of the shaft.

---
## 5. Reading a slip: the shorthand

Slips are written fast by people who write a lot of them. The shorthand is consistent across the tower because HCS taught it
to everyone in Y66 with a printed card, the **Slip Key**, which still hangs on the side of most boards, yellowed and annotated.

| Shorthand | Means |
|---|---|
| **R✓** | Real, certified (lead tag from the Grading House) |
| **R** | Real, uncertified |
| **RB** | Real-Blend (a branded mix; Orrin only) |
| **S** | Synthetic |
| **F** / **first-fit** | Founding-era part |
| **Any cond.** | Broken is fine; the client wants the part, not the thing |
| **Lic. only** | Licensed goods only: no grey, no restored, no counterfeit |
| **Prov. req.** | A provenance slip must ride with the goods (05) |
| **Cert. req.** | A Grading House certificate must ride with the goods |
| **No questions** | The client will not ask about status; the client also will not complain about it, which is the point |
| **Cold carry** | Insulated bay (cold liner) |
| **Sealed bay** | Airtight liner; Vey and most medicine |
| **Upright** | Must ride upright: liquids, eggs, seedlings |
| **Live** | Living goods: insects, seedlings, a hen. Dies if the flight is long or the bay is sealed. |
| **Ret. bay** | The client will pack a return; leave room |
| **Ret. casks** | Bring the client's empty vessels back on the next run |
| **Kind** | Payment in goods |
| **gc** | Greens chits (Co-op) |
| **sc ok** | The client will pay in scrip if you prefer (and at a better face value) |
| **NO LATE** | No late scale; late is refused |
| **W/O** | Whole only |
| **P/R** | Pro rata |
| **Pt.** | Part accepted; remainder stub follows |
| **std.** (lowercase) | Standing order; the next slip comes in the bay |
| **c/o** | Care of: a broker or an intermediary is between you and the client |
| **staff cons.** | Staff consignment (the Pantry's back door) |
| **H.** | "Household": a Crown slip that names no person |
| **DNB** | "Do not bring": a Fringe note added by a neighbour, warning that the client does not pay |

The last line is not on the Slip Key. It is chalked on the Fringe beside a slip by people who have been burned. Three DNBs
and the slip stays up all week, untouched.

**In play:** the shorthand is the slip's tag language. Each shorthand maps to a tag or a check in the delivery code (grade,
status, liner, upright, live), so the slip text and the rules are the same thing.

---

## 6. Slips: the Crown and the Terraces

Each slip below is given as its text, in its origin's hand, then an **In play** note with what it wants (as tags), what the
bay needs, the route, the pay and the return. Numbers are working numbers; the pattern matters more than the figure.

### The Crown (90–104)

**S-01. Orchard House, floor 96.** *Heavy cream card, deckled, a quince blind-embossed in the top corner, the Vellacott
device (a green tree in a ring) in ink. Initials only: "H. — C.A." Smells faintly of lemon peel.*

> The Household requires, for the spring pollination: brushes, two, hair of a real animal, soft, the head not wider than a
> thumb; cloches, glass, two, clear, unchipped. To the Orchard Pad, Seaward, 96, between ten and four. Clearance enclosed.
> Return: as the season allows.

**In play:** Wants `brush` (tag: real fibre) ×2 and `cloche` (glass, unchipped) ×2. Bay: the slip, the **Vellacott clearance
card** (1x1, enclosed, must come back), a Terraces permit or a ticket; four goods squares needed in a 3x2 Wren, so the player
must fit two paper items and four goods into six squares exactly, or use a bigger frame. Route: Tube, lane only, Orchard Pad.
Pay: 120 cr. Std. 800; because it needs the card, this slip is one of the few Crown slips a Middle broker cannot resell, so it is often repinned instead. Return: two lemons (R, Crown)
in a cloth. "As the season allows" means the return is a roll on the household's mood: in a good spring, a quince.

**S-02. Orchard House, floor 96.** *Same card. A second line in pencil under the printed text, in a gardener's hand.*

> Compost, ten kilos, made from real food only: no insect frass, no Orrin Blue, no paper. Dry enough to hold in a fist and
> break. To the Pad. *(pencil:)* the old stuff is from the Glasshouses and smells of their nutrient. The Apple doesn't like it.
> — C.

**In play:** Wants `compost` with grade R (the player's compost made from a Crown-chute catch of real peelings; compost made
from insect frass or Orrin Blue feed is grade S and fails). Bay: a 2x2 sack. Pay: 80 cr. Return: **Apple prunings**: a
bundle of real-wood sticks (1x3), which is fuel to a Mills baker, kindling to the Ovens, and **scion wood** to a seed saver,
who will graft it onto anything and pay the player in heirloom seed for a single stick. Nobody on the Pad knows this.
**Hook:** the gardener (Corin Asch; see client C-01) does.

**S-03. Household of Daunt, floor 95.** *Cream card, a black border, a silver hound. Printed, not written: the Daunt steward
prints everything.*

> The Long Table, Founders' Night. Flowers, real, white only, forty stems, not open. Cold carry. Postern, cradle 14, by
> 14:00. Assay. H.

**In play:** Wants `flower` (R✓, colour: white, stage: bud) ×40. Bay: cold liner required; forty stems is a 2x4 bundle that
does not fit a Wren at all. A **Kestrel** (4x3) with a cold liner is the minimum. Route: lane only, Postern; the Assay adds an
hour. Pay: 400 cr. Std. 850 and a Founders' Night clearance stamped by the household on the slip itself. Return: a **stained
tablecloth** (real linen, red wine; 2x2), "for your trouble". The Daunts mean it kindly. A Middle laundry pays 60 cr for it
clean, the Voided pay 40 as it is, and a seamstress on 15 cuts it into twelve napkins and sells them back up to 44 as "Crown
linen".

**S-04. The Postern, cradle 22, for Household of Sabe, floor 98.** *Cream card, plain, very expensive and very plain. One line.*

> Eggs, hen's, brown, twelve, matched. Upright. Postern 22. H.

**In play:** Wants `egg` ×12 with the visible trait **shell: brown** (the chicken idea in `IDEAS.md`: one visible inherited trait
that orders can ask for), all of one size class. Bay: upright; eggs do not survive a chute or a soot jam. Route: lane only.
Pay: 25 cr each, 300 cr. Std. 850. Return: the **egg box** comes back with the next order: a real-wood box with twelve straw
cups (2x2), which is worth 30 cr itself and is the only proper way to carry eggs. **In play:** "matched" is the hard word.
Twelve brown eggs of one size is a week of a good coop.

**S-05. Lantern Facilities, floor 103 (Halden family apartments).** *Grey Halden CO-3 with the Lantern's gold edge.
Department code LF-3. Typed.*

> Live crickets, wild line (not Orrin colony; they upset the animal), 1 kg, in a breathing container. For the children's
> lizard. Lane only. 90 cr. Return: as attached.

**In play:** Wants `insect` (live, wild-line, not Orrin) 1 kg. Bay: not sealed (a sealed liner kills them), not cold; a
**breathing container** (a mesh box, 1x2). Route: lane only, Postern, then carried up by Lantern staff. Pay: 90 cr, at
Std. 800. Return "as attached": a child's **toy drone**, broken (1x1). It is a palm-sized Halden model with a founding-era
controller chip inside, because the Lantern's toys are made from the Lantern's spares. Analysed (an analyser, see `IDEAS.md`),
the toy shows a **first-fit controller** worth 900 cr in the Mills.

**Hook:** the Lantern sends the same slip every month. The lizard is real. The toys keep coming.

**S-06. The Pantry, floor 90.** *The back of a printed menu card (Thursday: "Hand-dived scallops, sea herbs, brown butter").
Pencil. A thumbprint of real butter.*

> pickles. the sour Mills ones in the brown jar, 2 jars. NOT orrin. cook says the household's are all vinegar and no bite.
> staff cons., grille at 89, ask for Benet. 12 in chits

**In play:** Wants `pickle` (Mills-made, any grade) ×2. Bay: upright. Route: up R1 or R8 to 89, then a **grille hand** (02):
no lane, no gate, no Assay. Pay: 12 cr in chits, which is low. Return: **kitchen leftovers** (a 2x2 bundle in a cloth):
the carcass of a real roast bird, butter ends, the heel of a real loaf, half a lemon. Worth more than the pay many times over,
and it rots within a day: eat it, sell it at the counter before noon, or render the carcass for stock. Std.: none; a Fringe
slip that arrives by vent kid. **In play:** the Pantry slips are the earliest way to touch the Crown, and the leftovers are
the player's first taste of what real food is worth.

**S-07. The Pantry, floor 90.** *A laundry tag with "B." on it, and on the reverse:*

> gin. Sump gin from the one on 6 with the blue cap. 1 L. no label. *don't* put it in a Skywater bottle, they check those.
> 20 chits.

**In play:** Wants `spirit` (Sump, grey) 1 L, **without** a label and not in a branded bottle. Route: grille hand. Pay: 20 cr
in chits. Return: a pair of real-leather gloves with one finger cut off (VOID by the Crown, 1x1), which a Mills cobbler
restores for 6 cr and sells for 40. Risk: if the grille hand is caught, the bottle comes back with a note, no pay, and the
Pantry goes quiet for a week.

**S-08. The Assembly Library, floor 100.** *Cream card with a reading lamp blind-embossed. Written by a librarian in brown
ink.*

> The Assembly will purchase books printed before the Drowning, any subject, paper intact, dry. Four volumes. 50 cr the
> volume on acceptance. Water-damaged volumes will be returned. Postern 9.

**In play:** Wants `book` (pre-Y57, dry) ×4. Each book is a 1x2. Route: lane only. Pay: 200 cr for four. Std. 800. Return:
a **deaccessioned** volume stamped WITHDRAWN on the flyleaf: the library culls its duplicates, and sends one down with each
purchase as a courtesy. The Archivists want every pre-Drowning book they can get and pay in copies and favours, not credits;
the Assembly pays credits and puts the books on a shelf in a room most of the Crown never enters. **In play:** a direct
choice between two buyers for the same item, at the price of a faction's opinion (06a, Archivists).

**S-09. Household of Daunt, floor 95, the morning after.** *Cream card, black border. The printing is hurried. A coffee ring.*

> Linen to be returned by the Fall: thirty napkins, two cloths, wine and gravy. Do not bleach. Do not lose one. Collection
> from Postern 14 at 09:00. 150 cr on return complete.

**In play:** A **service slip**: the goods come **down** to the player in the client's bay (a 2x3 bundle of real linen,
stained), and the job is to clean them (a wash tub, water, soap, an hour or three) and send them back up. Wants: the same 32
items, `linen` with status **clean**, returned W/O ("do not lose one"). Pay: 150 cr. Water: a lot of it, which is the real
cost. Return: none. Risk: a toll net on a free shaft taking one napkin fails the whole job. **Hook:** count the napkins when
they arrive. There are thirty-one.

### The Terraces (60–89)

**S-10. Hob Seventy-Five, Lantern Row, floor 75.** *Laminated print, a blue flame logo, the chef's initials M.I. in grease
pencil, and a line in red.*

> Basil, R✓, 6 bunches, Genovese only, leaves unbruised. Cold carry. **NO LATE.** By 11:30. Service door, 75 Seaward.

**In play:** Wants `herb` (basil, R✓) ×6. Bay: cold liner; the certificate rides with the goods (1x1). Route: lane only.
Pay: 60 cr. Std. 600. Deadline 11:30: the player must launch by about 09:30 from 17. Return: a **staff meal** (a 1x1 tin of
whatever the line cooks ate: noodles with a real egg in them) and, on the third good delivery, a bay slip. This is the
classic first contract above 60 (02).

**S-11. Vey Sixty-Four, Supplies, floor 64.** *Laminated, the Vey cross-in-circle, a Ledger reference printed in magenta.*

> Chitin flake, washed and dried, from wild-line or registered colony, 2 kg. Sealed bay. Lic. FH req. Lot traceability:
> rancher's herd ticket to accompany. 140 cr. Return: sample stock.

**In play:** Wants `chitin` (an insect by-product: the shells sifted out of the grinder, washed and dried) 2 kg. Bay: sealed
liner; herd ticket (1x1, 06a) rides with it. Licence: Food Handling. Route: lane only. Pay: 140 cr. Std. 600. Return:
**sample stock**: a strip of expired Vey wound film (worth 3 cr each in the Mills) and, once, a full DoseLock dispenser with
one cartridge, a month from expiry. **In play:** the chitin is what Vey makes **wound film** from. A Mills player is selling
Vey the shells of the insects the Mills eat, and buying the film back at 4 cr a strip. Nobody says this. The slip just asks.

**S-12. Skywater Hall, floor 88.** *Heavy green-tinted card with a raised wax-seal motif printed (not real wax) and the Varne
& Daughters script.*

> Recovery of bottles. Skywater bottles, green, 0.5 L, necks intact, any condition, any quantity. 0.50 cr per bottle on
> receipt. Skywater thanks you for keeping Calder's rain in safe hands.

**In play:** Wants `bottle` (Skywater, neck intact), any count. Route: any; Skywater is the only Terraces client that will take
a free-shaft drone, because it is cheaper to take bottles from looters' routes than to let counterfeiters have them. Pay:
0.50 cr each, against 2 cr from a counterfeiter in the Middle (02). Std. 300 (Skywater posts this slip on every board in the
tower, at Mills Standing, on purpose). Return: a printed card of thanks and +1 Standing per 20 bottles as a Ledger "civic
contribution". **In play:** a quiet moral choice priced exactly: a quarter of the money, legal, and a little Standing; or four
times the money, grey, and the Middle's fake rain business stays in bottles.

**S-13. The Grading House, floor 68.** *A printed CO-3 with the Grading House seal (scales over a leaf). Clerical, neutral.*

> Reference samples required for instrument calibration: tomatoes, uncertified, grown on service water, 3. Leaf greens,
> uncertified, grown under expired Brightline lamp, 1 bunch. 20 cr. Samples will not be returned.

**In play:** Wants `tomato` (R, uncertified, flagged "service water") ×3 and `greens` (R, uncertified, flagged "expired lamp")
×1. Pay: 20 cr. Std. 400. Return: nothing, except the knowledge, if the player thinks about it, that the Grading House needs
bad produce to recognise bad produce, and that the samples it is buying are the evidence it will use to fail the player's
next certification. A Mills grower who supplies the Grading House's calibration samples gets a little Standing and a little
less luck at the Grading House. **Alternative:** a Mills grower sends deliberately "clean" samples labelled as service water,
and the instrument drifts. Certifications get easier for a season. Nobody can prove why.

**S-14. Mr L. Pryor, floor 61.** *An embossed card, but cheap embossing, done by a Middle printer: Pryor wants to look like
the Crown. The handwriting is anxious.*

> Bark, real, any tree, 2 kg, or cork. For mounting. Also rain if you know where. Will collect from the bird spikes on the
> ledge, 61 Landward, if you prefer that to the door. 90 cr the bark. Rain separately.

**In play:** Wants `bark` (real wood, any) 2 kg; real wood comes from Crown chute offcuts (furniture, planters, pruning).
Route: lane to his door, or **free shaft to the ledge**: up R1 through both combs to a riser hatch at 61, then a few metres
outside along the Landward face to the bird spikes. Outside flight without skin clearance is an offence above 10, and the wind
on the ledge is real. Pay: 90 cr. Std. 600 at the door; no Standing check at the ledge, because ledges do not have
pads. Return: an orchid **keiki** (a baby plant, live, 1x1) now and then, which Pryor gives instead of a tip, and which is
worth 200 cr to the right buyer in the Crown and nothing to anyone else. **Hook:** "rain if you know where" (see client C-09).

**S-15. The Glasshouses, floor 85.** *Printed on Greenhold licence stock: a seed watermark visible against the light, and a
patent notice in the footer of every slip, even this one.*

> Edible flowers: nasturtium, mixed colours, 30 heads, open, unwilted. R✓. Cold carry. For the fish place's 'wild' plate.
> 120 cr. Greenhold Agricultural Licence 7714 applies: the supplier warrants the seed is not Greenhold stock.

**In play:** Wants `flower` (nasturtium, R✓, open) ×30. Bay: cold liner. Route: lane only. Pay: 120 cr. Std. 650. Return:
**spent rockwool** (a 2x2 slab of used growing medium) "for your beds", which the Glasshouses must legally destroy and
instead pass down to suppliers as a perk. Seed savers sift spent rockwool for seed that slipped the count (02). The
**warranty clause** is the trap: if the player's nasturtiums were grown from seed a saver lifted from Glasshouse waste, the
player has just sold Greenhold its own patent, and Greenhold's licence agents read the Glasshouses' supplier list.

**S-16. Lady Fenwick-Orrell, floor 77.** *Lilac card, embossed with a coronet she is not entitled to, written by her own hand
in violet ink, generous loops.*

> Dear Tenant. A shawl, cashmere, the moth has had it in three places. I am told the Mills can mend so it does not show. If
> it does not show I shall be grateful in the way that counts. If it shows, please do not send it back; I could not bear it.
> M. F-O.

**In play:** A **service slip**: the shawl comes down in her bay (1x2, real fibre, damaged). Wants: the same shawl, status
**mended (invisible)**: a sewing kit and a mending skill or a seamstress hired for a shift. Pay: 80 cr. Std. 500 (she sets her
own gates low). Return: "in the way that counts" is **sponsorship** (04): a letter offering to sponsor the player's Standing
(+150 for a year) for a quarterly fee. "Please do not send it back" means a failed mend keeps the shawl: a cashmere shawl with
three holes, worth 50 cr to the Voided. See client C-08.

**S-17. Nettlefold Settlement, floor 70.** *Laminated CO-3 with a navy stripe and a small grey clause in every margin.*

> Conveyance of recovered goods. Six items, tagged NS-4471 to NS-4476, from lease 15-K (floor 15, Winding Floor) to the
> Recovery Store, floor 30. Items are released to the carrier by HPS attendant at 10:00. Lane only. 25 cr. Carrier is
> liable for loss.

**In play:** Wants: **not your goods**. Six yellow-tagged items (a neighbour's coat, a hotplate, a radio, a chit tin, a child's
shoes, a grow lamp) put into your bay by an HPS attendant at the lease door on 15. Deliver them W/O to the Recovery Store.
Pay: 25 cr. Std. 400. Return: nothing. The neighbour may be a client. Taking the slip earns Halden-side Standing like any Grid
job; refusing it costs nothing; taking it and "losing" one item to a toll net that was not there costs the player the item's
value as "carrier liability" and gives the neighbour back a radio. **In play:** the bay as conscience, priced in squares.

**S-18. Halden Select, floor 70.** *A glossy CO-3 with the Select's own monogram, a photograph of a basket printed on the
reverse as a specification.*

> Mills Heritage line: woven baskets, cable-strip, as illustrated, 12, uniform size and colour, no stains, no repair marks.
> 3 cr each. Packaging by Select. Retail at Select: 40 cr.

**In play:** Wants `basket` (Mills-made, cable-strip, uniform) ×12. Twelve baskets are a 4x3 that nest into a 2x2 if they
are uniform, which is why the slip demands uniformity. Pay: 36 cr. Std. 500. Return: a **Select bag** (paper with string
handles, 1x2, "Halden Select: Heritage of the Stack") that Mills people reuse for years as a sign of nothing. "Retail at
Select: 40 cr" is printed on the slip because the Select's buyers include it on every slip, for reasons they have never
examined.

---

## 7. Slips: the Middle

**S-19. Ambler & Daughters, Grocers, floor 44.** *A neat Middle CO-3, stamped with a wheelbarrow, carbon copy attached, the
word "quietly" underlined twice.*

> Tomatoes, real, uncertified, 20. *Quietly.* Any route. Pro rata. 4.50 each. We'll take more Thursdays.

**In play:** Wants `tomato` (R) ×20. Route: any; the Gap at 41 is three floors from the Ambler shop. Terms: P/R. Pay: 90 cr.
Std. 400. Return: a carbon of the sale ticket (Ambler & Daughters sell them as "Real" in the Middle with a hand-lettered card;
uncertified real is legal to sell, not legal to call "certified"). Standing order on Thursdays. See client C-12.

**S-20. Laundry Thirty-Four, floor 34.** *Middle CO-3, very clean, every field filled, a licence number in the corner.*

> Soap, insect-fat, unscented, hard, 10 bars. Must not mark white cotton. Any route. 30 cr. Licence D-0331.

**In play:** Wants `soap` (insect fat + ash, cured) ×10. Pay: 30 cr. Std. 400. Return: a jug of **laundry grey** (soft grey
water, 10 L, 03) that a grow bed will take. The licence number means the laundry is a Class D certified water user (03), and
it is buying Mills soap because Halden Select's soap is perfumed and clogs its filters. See client C-13.

**S-21. The Halden School, floor 50, Science.** *A CO-3 with the school crest, filled in by a teacher in green ink, with a
correction.*

> Specimens for Year 4: live insects, three kinds, ~~labelled~~ labelled in Latin please, in a viewing jar each. 20 cr + 10 sc.
> Return: as the department can.

**In play:** Wants three `insect` (live, different kinds) in `jar` (glass) with **labels**. Pay: 20 cr + 10 sc. Std. 450.
Return: a bundle of **old exam papers** (1x1, paper; packing filler, stove fuel) and, once a year, an **exam entry waiver**
for a Mills child (a 1x1 card), worth a year's rent to a family on 15. **Hook:** "labelled in Latin". Only the Archivists have a
book that does that.

**S-22. Car House, Lift Guild, floor 45.** *Printed in triplicate, Guild stamp (a car between two arrows), Ride Book ref.,
carbons.*

> Shaft lamp cells, charged, certified (no grey charge), 12, by 19:00. Delivery by car only: chit enclosed. 40 cr + 2
> freight chits.

**In play:** Wants `cell` (charged, **certified**: a grey charge flags "Uncertified" on the cell, 04) ×12. Route: the enclosed
**freight chit** sends the drone up a lift car: slow, safe, logged in the Ride Book. Pay: 40 cr and 2 chits. Std. 400. The Guild
never posts lane-only; it posts **car-only**, and a drone that arrives by lane is accepted with a frown and a note in the Ride
Book. See client C-14.

**S-23. "Mr Dace," floor 52.** *A Middle CO-3 that is too polite, too clean, with no shop stamp at all.*

> Buying: Vey DoseLock antibiotic courses, cracked or whole, any condition, any quantity, cash. 25 cr a course, no
> questions. Discreet delivery to lease 52-H.

**In play:** A **sting** (03 has the Skywater version). Delivering cracked DoseLock doses (grey, 04) to this slip triggers a
brand protection charge: −50 Standing, a fine, the goods seized. The tells are all on the slip: Middle, too polite, no stamp,
pays above the grey price (cracked courses sell for 20 in the Mills), "no questions" in a Middle hand. Std. 400. A player who
has learned to read slips will see it. **DNB** chalked beside it by the second day, if anyone on the floor got burned.

**S-24. Nan Okpara's, the Shelf Market, floor 30.** *The back of a fish-paste label, written in marker, then put into a CO-3
sleeve because Shelf traders have to post through HCS.*

> Salt 5 kg any (flats fine), insect oil 2 L. By the Fall. Any route. 22 cr. Ret. casks.

**In play:** Wants `salt` 5 kg (Flats salt is fine), `oil` (insect fat) 2 L. Deadline: overnight; the stall opens at 05:30.
Pay: 22 cr. Std. 300 (the Shelf is a Middle floor at Mills prices). Return: last week's **oil casks** (empty, 1x1 each), and a
pot of fish paste (food, 1x1, smells). Standing order if delivered three times. See client C-15.

**S-25. The Ashdown-Kerr household, floor 29 (Middle, Transitional).** *A new CO-3, filled in very correctly, with a sentence
added at the bottom in a different, firmer hand.*

> A child's cot, second-hand acceptable, cleaned, safe, no sharp edges. 45 cr. *No VOID marks or "mended" items please. We
> checked last time.*

**In play:** Wants `cot` (furniture, child's, status: **clean**, **not restored**). Pay: 45 cr. Std. 500. Route: any; it's twelve
floors. The family is one of the first on the Chalk (02): Middle people paying Middle rent in a hall that was a Mills
workshop a year ago, buying Mills goods by slip at Mills prices with Middle rules attached. "We checked last time" means
another Mills shop sent a restored one. Return: none, but their slips come every week now, and they are the first sign on the
board that the Chalk is coming down (see section 13, reclassification). See client C-16.

**S-26. A nurse, Vey Forty-One dispensary, floor 41.** *A CO-3 filled in hastily, the Vey pen still in the same hand, then
crossed through and re-addressed. Not a company slip; a person using company paper.*

> Gut tabs, Vey, 30 (sealed packs please). For my mother, Ifeoma Ade, lease 15-R. She won't take them from me. Don't say
> they're from me. 20 cr.

**In play:** Wants `medicine` (Vey gut tabs, sealed, licensed) ×30, delivered **down** to 15-R, not to the poster. The poster
pays (20 cr; gut tabs cost 6 cr for ten in the Mills, so this is at cost plus two). Std. 300. Route: two floors from 17; a vent
kid can carry it. Return: none from the nurse. From Ifeoma Ade, next week, a Fringe slip in her own hand (see S-37), because
now she knows the player's board mark.

**S-27. Brisk & Lowe, floor 48.** *Cream card with a navy border (05), a collector's code, printed.*

> Occupancy confirmation required: lease 17-K, registered occupant T. Saar. Confirm presence, hours, and visible assets on
> lease. 15 cr on confirmation. Reply by drone, sealed.

**In play:** An **informing slip**. Wants: a **report** (a paper item the player writes: 1x1). Tobin Saar is the keeper of
the Eight Squares (06b), on the player's own floor. Pay: 15 cr. Std. 400. Return: nothing. Delivering it sends a collector to 17
within the week. Not delivering it costs nothing, unless the player claimed it at the board, in which case the failure costs
−25 Standing, and Halden has just charged the player for refusing to inform. **In play:** claim registration as a moral trap:
read before you tear.

---
## 8. Slips: the Mills

**S-28. Hester Moyle, warden, floor 17.** *A strip torn from the bottom of a warden report form (the yellow carbon), in a
small, exact inspector's hand.*

> Clock key, the little square kind, size 6 or 7. Crystal for a wall clock, 18 cm, any cond. Corridor, not drone. 3 cr.

**In play:** Wants `clock part` ×2. Route: **by hand** along the floor (a vent kid or the player). Pay: 3 cr. Std.: none
(Fringe). Return: the **Warden's regard** pip next to the board goes up (05). Hester's slips are the cheapest, most frequent
slips on 17 and the ones that matter least on the Ledger and most on the floor. See client C-17.

**S-29. Mattias Orme, Litho Run, floor 17.** *Pencil, on the back of a Works lithography mask envelope from Y31, the
handwriting of someone who learned to write in block capitals for forms.*

> MAGNIFIER 10X, GLASS NOT PLASTIC. LOUPE OR STAND. ANY COND IF THE LENS IS GOOD. WILL PAY IN WORK.

**In play:** Wants `lens` (glass, 10x) ×1. Pay: **labour**: Mattias will read one item (the analyser's job, done by an Old Hand
over an afternoon): a relic's hidden features, a founding-era fault code, a cell's real cycle count. Std.: none. Return: the
reading, written on a card in the same capitals, and a clock-number scratched inside the item's housing (06a, clock-signing),
which raises the item's price in the Middle. See client C-18.

**S-30. Yusra Dimitriou, Wet Run, floor 17.** *A Co-op cyclostyled form with the wheat-and-cell stamp, filled in with a
marker that is running dry.*

> Soft grey, 20 L, for the beds, by 09:00 (before the taps shut). Real soil if you have any, 5 kg, Crown planter waste
> preferred. Pay: 30 gc or 4 kg produce, your pick.

**In play:** Wants `water` (soft grey or better) 20 L, optionally `soil` (R) 5 kg. Route: across the floor, Wet Run is one
sector over. Pay: greens chits or **kind** (4 kg of whatever Yusra cut that morning: greens, beans, chillies). Std.: none;
Co-op standing *Known* to see it. Return: the produce, and a Co-op standing step. See client C-19.

**S-31. Tamsin Gale, the Ovens, floor 16.** *Floury fingerprints on a CO-3 she bought a pad of years ago and still uses, one
floor down, because a Grid slip gets her Standing and she wants to move to 29.*

> Fuel for Oven 4: real wood or charcoal, 10 kg. Dead scrip accepted as kindling at 1 kg per bundle of 50 notes. By 05:00.
> 8 cr + 2 loaves.

**In play:** Wants `fuel` (real wood, charcoal, or **dead scrip**) 10 kg equivalent. A use for expired scrip, priced: fifty
dead notes (one 1x1 bundle) count as a kilo. Route: **one floor down**, the smallest launch in the game (02 calls it the
tutorial run). Pay: 8 cr + 2 loaves of Co-op bread (food, 2x1 each, goes stale in two days). Std. 200. Standing order. See
client C-20.

**S-32. The Eight Squares, floor 17 (Tobin Saar, keeper).** *Printed on the back of a hot-bunk tag, then a second tag stapled
on because the message didn't fit.*

> Sheets 20, washed & dry, back by 13:30 for the two o'clock. Bring the wet ones back if you can't dry them, we'll hang them.
> 10 cr. Gus pays Fridays.

**In play:** A **service slip**: twenty sheets (a 2x2 bundle, soiled) come in the morning by hand; they go back washed. Water
and a wash tub, then a drying rack (a machine, hours). Pay: 10 cr, "Gus pays Fridays": the pay comes in a lump on the week's
fifth day, from the sublet baron, not the keeper. Std.: none. Return: Tobin's gratitude, which is worth a lot on 17 (he knows
who sleeps where, and he hears everything at changeover). See client C-21.

**S-33. Orrin Provisions, the Press, floor 11.** *A grey CO-3 with Orrin's green leaf, printed by the depot's machine, with
"PRICE UNDER REVIEW" stamped on every slip this quarter.*

> Live insect intake: registered colony stock only (Orrin Protein Starter or licensed descendant), live weight 20 kg. Herd
> ticket required. Depot hours 06:00–12:00. 30 cr + 20 sc (supply credit). PRICE UNDER REVIEW.

**In play:** Wants `insect` (live, **registered**: an Orrin colony with its tag) 20 kg. Wild-line insects are refused at the
depot. Bay: a 3x3 of bin totes; a Kestrel at least, or two Wren runs (a **Part** slip). Route: six floors down the Three, or by
Old Two with a chit. Pay: 30 cr + 20 sc. Std. 300, Lic. FH. Return: an **Orrin Protein Starter colony** "as a gesture of
partnership" (1x1, crashes after six generations, 04), which is the joke at the centre of the insect chain: the depot pays you
partly in the thing that makes you need the depot. See client C-22.

**S-34. Sabine Corr, Overhum, floor 27.** *A sheet of brown paper torn from a mushroom spawn bag, in purple wax crayon,
because it is dark where she works.*

> Spent bedding from your bins, 10 kg, the wetter the better. Frass in it is fine. No Orrin feed in it (the blue kills my
> spawn). I pay in mushrooms. Bring it up the Three, I'm at the top of it practically.

**In play:** Wants `bedding (spent)` 10 kg (the waste of the insect chain, which otherwise goes to compost or to the chute).
Status check: no Orrin Blue in it. Pay: **kind**, 1 kg mushrooms (R) per 10 kg, which sell for 12 cr per 200 g in the Terraces.
Std.: none. A clean loop: insect waste in, real food out, ten floors up. See client C-23. **Hook:** her lease includes the old
Line Nine control room. The bricks are warm.

**S-35. Mother Ivy Okonkwo, the Long Shift, floor 12.** *Crumpled print, a hot-bunk house's own form ("ROOM REQUISITION"),
in a careful hand.*

> Bunk powder, the Tide Folk kind (ground shell and something), 1 kg. Mattress ticking, 4 m, any colour. By Friday. 14 cr
> or 4 shifts' sleep, your choice.

**In play:** Wants `powder` (Flats-made, from the Landing) and `fabric` 4 m. A slip that sends the player to buy from the
Flats in order to sell to the Mills. Pay: 14 cr or **4 hot-bunk shifts** (a 1x1 "shift tag": redeemable for a hireling's
sleep, or a day's rest that the player can give to a hired hand instead of a wage). Std.: none. (06b covers the houses.)

**S-36. Piet Arkwright, cell grader, the Exchange, floor 28.** *A printed CO-3 with a stamp showing a cell with a tick in it:
"ARKWRIGHT GRADED". Very small, very neat print.*

> End-of-Service H-cells, 10, any condition. 5 cr each. I grade, you get the grades back with your pay. Any route. P/R.

**In play:** Wants `cell` (status: End of Service) ×10. Pay: 50 cr P/R. Std. 300. Return: a **grade card** for each cell
(1x1, paper): the real remaining capacity of each one. Arkwright buys End-of-Service cells at 5, grades them, and sells the
85%-good ones for 12 to the Middle; the grade cards tell the player which of their own cells they should have kept. See
client C-24.

**S-37. Ifeoma Ade, lease 15-R, Winding Floor.** *A Fringe slip on the back of a Vey gut-tab pack, in shaky, beautiful
handwriting. She found the player's board mark.*

> Thread, black, strong. Needles, size 3, six. I mend for the Rest and the Long Shift. I will pay in mending: three pieces,
> invisible, or five that show.

**In play:** Wants `thread` and `needle` ×6. Pay: **labour**: Ifeoma mends three items invisibly or five visibly; the player
sends the items down in the next bay. Invisible mending is what restores a VOID X on a shirt (04, the X) and what Lady
Fenwick-Orrell's shawl needs (S-16). Std.: none. The thread of S-26 continues: a nurse in the Middle paid for her mother's
tablets; her mother now works for the player.

**S-38. Lasse Kowal, Co-op delegate, floor 21 (Underhum).** *Co-op form, but annotated in the margins with numbers: dates and
temperatures, a column of them.*

> Thermometers, any kind that reads to a degree, 4. We want to log the ceiling at night. Also a clock that keeps Company time
> (NOT synced; the synced ones are four minutes fast). 20 gc + copies of what we find.

**In play:** Wants `thermometer` ×4 and `clock` (unsynced). Pay: 20 gc + **information**: copies of Lasse's heat log of the Dark
Floors' underside, which is a Hook item (14) and which the Archivists and Static will each pay for. Std.: none; Co-op
*Known*. **Hook:** after the player delivers, Lasse's next slip asks for something to measure **vibration**.

**S-39. The Underhum Ranch, floor 21.** *Crumpled print on the back of an Orrin herd ticket carbon.*

> Bin lids, steel, to fit Works tote 600×400, 6. The warm ceiling sweats on them at night and the plastic lids buckle. Pay
> 2 kg wild-line crickets, live, or 12 cr.

**In play:** Wants `lid` (steel, Works tote) ×6; these come from the chute, from the Reclaim's back door on 58, or from the
Sump. Pay: live crickets (a wild-line starter, the colony that never crashes) or credits. Std.: none. A cheap path into wild
insect stock that is not Orrin's.

**S-40. Crane & Ossory, produce brokers, the Exchange, floor 28.** *A CO-3 printed at a Middle press, with "c/o" in the
client field: brokers.*

> Chillies, any colour, 200. Leaf greens, R, 30 bunches. By 15:00. 30 cr + 45 cr. P/R. c/o Shelf Market stalls.

**In play:** Wants `chilli` ×200 and `greens` (R) ×30. Pay: 75 cr P/R, against perhaps twice that on the Shelf if the player
could sell there (they can't: Shelf pitches are let by the season, 06b). Std. 350. Return: a **market report** (1x1, a carbon of
the morning's Shelf prices), which is real information: it tells the player what the brokers are making. See client C-25.

**S-41. Wren, vent kid, floor 17.** *Chalk on the bottom of a tin lid, pushed under the shutter.*

> rope 10m. strong. for the net on 13. ill get you through free. 1 week.

**In play:** Wants `rope` 10 m (a 1x2 coil). Pay: **passage**: for a week, the R5 and R3 kids' toll nets between 10 and 14 let
the player's drones through untouched. A Fringe slip from an eleven-year-old that is worth more than most Grid slips to a
player who flies free. Wren also chalks the tide tables by the socket boards (02): see client C-26.

---

## 9. Slips: the Sump, the Flats, Halden, the strange, and the other towers

### The Sump (4–9)

**S-42. Mag Tolley, floor 8.** *No paper. A knot of blue string, delivered by a vent kid who says the words.* "Mag says:
protein, twenty kilos, any, pressings fine, to the Perch at five. She says bay full on the way back."

**In play:** Wants `protein` (Vitabrick or pressings, any) 20 kg: a big, cheap, heavy load. Route: R3 down to the Perch (the
Knot's toll on landing, softened by a Co-op tag or a tide cord). Pay: **salvage**, Mag's pick: "bay full on the way back" means
the drone comes back as full as it left, with wet salvage from the drowned floors: mostly scrap, a few usable parts, and now and
then a **first-fit** part worth more than the whole load. Std.: none. Mag also lends water at interest (03). See client C-27.

**S-43. The pump fixers at Saint Pump, the Moat, floor 5.** *Chalk on a scrap of hatch plate (1x2), with a drawing of the
pump and the candle.*

> GASKET SHEET RUBBER REAL NOT FOAM 1 SQ M. PERCH. 30 CHITS. +A BOLT FROM THE SAINT

**In play:** Wants `rubber sheet` (real) 1 m² (a 2x2). Pay: 30 cr in chits, and **a bolt from Saint Pump** (1x1): a founding-era
bolt from the shrine, which divers leave before they go down. The Sump believes a bolt from the Saint brings a drone home. It is
a token: packed in a bay on a Sump route, it softens the trouble roll at the Knot, because the Knot's men believe it too. Std.:
none.

**S-44. The Kostyk crew, Dive Hall, floor 7.** *A greasy square of oilcloth with the crew's mark (a K on a rope) and a time.*

> Mask straps 4, hose clamps 10 (stainless if God loves you), a cell for the lamp. Before the window (slack water today
> 13:40). Share of the dive.

**In play:** Wants `strap` ×4, `clamp` ×10, `cell` ×1. Deadline: **before the window** (slack water; the tide strip shows it).
Pay: a **share of the dive**: the crew's next haul is split, and the player's share comes back in a later bay, wet, unsorted,
with the crew's mark on it. A share can be nothing. A share can be a tray of founding-era chips from Line One's racks. Std.:
none. See client C-28.

**S-45. The Wet Widows, Sixes, floor 6.** *A crate label with a wax mark (a closed eye) and a string tag.*

> Three crates, Widows-marked, from Sixes to the Exchange (28), unopened, by 18:00. 40 chits. The seal is your safe
> conduct. Break it and don't come down.

**In play:** **Carriage**, not goods. Three sealed 2x2 crates go into the player's bay (a Kestrel is required) and go up 22
floors to a dealer on the Exchange. Pay: 40 cr in chits. The **Widows' seal** makes the crates untouchable in the Sump's
shafts (no Knot toll, no looting by anyone who knows the mark), and makes them very interesting to a lane scan at 30 if the
player tries to send them by lane. Std.: none. What is inside is never said. **Hook:** the crates are heavy for their size, and
warm.

**S-46. Peder Gall, the Drum, floor 7.** *A hot-bunk tag with a wet-tide stain at the bottom, as all of the Drum's tags have.*

> Blankets, dry, any, 10. Nothing dries down here. Swap you 10 wet ones (good wool in some) for 10 dry. Plus 10 chits.

**In play:** An **exchange slip**: send ten dry blankets down, receive ten wet ones back (a 2x3 bundle each way). Dry them
(drying rack, hours) and sell; some are real wool. Pay: 10 cr in chits. Std.: none. The Sump lives in a wet that the Mills can
fix with squares and hours, and the slip turns that into a trade.

**S-47. The Pumpmen, floor 6.** *Chalk on the riser wall of R1 at 6, copied onto a scrap by whoever relays it.*

> Red-strip cartridges, 10, for the gate pumps. A month off the tithe.

**In play:** Wants `filter cartridge` (red-strip, half-used, grey) ×10. Pay: **passage**: the Knot's toll waived for a month on
every riser where the Pumpmen collect (R1 and R3 at 6). Std.: none. The pump tithe paid in kind (05).

**S-48. Bale pickers, the Bale Hall, floor 8.** *Said by a kid at the Three Grate.* "The Jaws want gloves. Six pair, any, thick.
The bales have needles in them now. First pick of a sack."

**In play:** Wants `gloves` ×6. Pay: **first pick** of one unsold bale bound for the Spill Door (a 3x3 mystery container that arrives in the bay:
the leavings of every catch in the tower, sorted by nobody). Std.: none. The needles are from the Vey clinics' sharps tubes
splitting in the Long Drop: a hint the South Chute's seals are failing.

### The Flats

**S-49. Ruben Vass, the Landing, floor 4.** *A knotted cord with a scallop shell and a short oilcloth tag, said aloud by the
kid who brings it.* "Ruben wants rope, fifty metres, and two tins of sealant. Landing, low water, between ten and one."

**In play:** Wants `rope` 50 m (a 2x2 coil) and `sealant` ×2. Deadline: a **tide window** (low water, hours 10–13 today; 50
minutes later tomorrow). Route: down R3 and out to the Landing's drone shelf. Pay: Flats salt (2 kg) and **one knot** on the
player's tide cord (06a). Std.: none. At five knots, kin-price at the Landing. See client C-29.

**S-50. Ma Senna Duku, the Strand post office roof.** *A cord with three knots tied fast and a red thread through them:
urgent.* "Ma Senna needs clean water, twenty litres, and boiled cloths, ten. A birth. Tonight."

**In play:** Wants `water` (drinking grade or better) 20 L, `cloth` (boiled) ×10. Deadline: tonight, which means before the 20:00
end of the game day. Route: to the Landing; at night the Landing is dark but Ma Senna's people are there. Pay: a **frass
poultice** (1x1, does something), a jar of pan salt, and a knot. Std.: none. A slip that pays almost nothing and that the Flats
remember for a generation. See client C-30.

**S-51. The Lowtide magnet crew, Rope Street berth.** *A slip of oilcloth with three drawings: a magnet, a coil, a hand
pointing down.*

> Magnets, strong, 2. Line 30 m. Pay: what the magnets bring up on their first ebb.

**In play:** Wants `magnet` ×2 (35 cr each in the Mills, 04) and `line`. Pay: the **first ebb's haul** (a 2x2 wet mystery bay
in a day or two, decided by a magnet-fishing table: nails, cutlery, a VOID-stamped Crown watch, a meter seal, a founding-era
connector). But the Tide Folk rule says **the first find of each ebb goes back to the water** (06a), so the crew sends the
**second** find, and says so on the tag. Std.: none.

**S-52. Gull, floor 4 Landward, the barnacle line.** *No slip. Gull comes up the stairs himself and says it.* "Paper and a
pencil. The good kind that doesn't run. I'll give you the lows for a month, to the minute."

**In play:** Wants `paper` and `pencil`. Pay: **a month of perfect tide strip** (the tide table item from 07, better: the exact
minute of every low, which is when the Great Ebb market's best goods show). Std.: none. A child's slip that improves every Flats
and Sump contract for a month.

### Halden and its brands

**S-53. Halden Facilities, Mills Section, Service Order SO-17-0912.** *Grey Halden CO-3, SERVICE row. The gear-and-tower
mark. Typed.*

> Chute clearance assistance: removal of 20 kg obstruction debris from catch 17-C to the Bale Hall (8). Carrier to supply
> own bay. 30 sc. The Company appreciates your partnership in keeping the Stack flowing.

**In play:** Catch 17-C is **the player's own catch**. The Company is paying the player in scrip to remove a jam from the
player's own hatch, which the player would have had to clear anyway. Wants: `debris` 20 kg out of the catch (the player gets
first look at what jammed it). Route: chute dive is "not authorised"; riser down. Pay: 30 sc. Std. 200. **In play:** Service
Orders are scrip work, and scrip is good only at the store; this one is worth taking because the debris is sometimes a whole
founding-era item too big to fall (a jam is a gift with a delivery charge).

**S-54. Halden Survey and Allocation, Service Order SA-17-0044.** *Grey CO-3 with an orange stripe: Survey.*

> Assistance with measurement: lease frontage and depth, leases 17-C-01 to 17-C-08 (Stores Run). Laser measure supplied
> (return in bay). 15 sc. Survey and Allocation thanks you for your accuracy.

**In play:** Wants: a **report** (paper) of eight leases' dimensions, including the player's own. A laser measure arrives in the
bay (1x1, must go back). Pay: 15 sc. Std. 300. What the survey is for is not said. It is the first step of a **rationalisation**
(04): a reclassification or a lease cut. Taking it means the player measured their own neighbours for the Chalk. **Hook:** the
measurements the player sends could be wrong. Survey checks one in ten.

**S-55. The Hatch, floor 18.** *Grey CO-3, SERVICE row, a store stamp.*

> Restock carriage: 8 crates Vitabrick from Old Two stop (17) to the Hatch (18). 20 sc + 4 cr. Today, by the 12:00 car.

**In play:** Carriage, one floor up, eight 1x2 crates: four Wren runs or two Kestrel runs. Pay: 20 sc + 4 cr. Std. 200. The
smallest, safest Service Order: the Company paying in scrip to move its own scrip-bought goods. Every Mills shop does this when
the week is thin.

**S-56. Orrin Provisions, Supply Agreement OP-SA-86-117.** *A 1x2 document on cream-grey stock, three pages folded, a green
leaf watermark, and a CO-3 clipped to the front.*

> Supply of wild-line insect protein (live weight), 50 kg per week, for one season (thirteen weeks). Price: 2.10 cr per kg,
> fixed for the season. Exclusivity: the Supplier will not sell live or processed wild-line insects to any party other than
> Orrin Provisions during the term. Renewal at Orrin's discretion; price subject to review on renewal.

**In play:** A **supply contract** (section 3). Wants 50 kg a week, which is most of a mid-game insect operation. Pay: 105 cr
a week, guaranteed; more than the player would make selling slab in the Mills. Exclusivity: the player may not sell slab,
paste, live crickets or pressings to anyone else for thirteen weeks. On renewal, the price is reviewed (to 1.40). Std. 500,
Lic. FH. **In play:** the classic brand deal: generous for one season, until you have no other buyers left. See section 11.

**S-57. Halden Lane Services, Survey Order LS-T-East-86.** *Grey CO-3, blue stripe: Lanes. With a small sealed unit
attached.*

> Lane condition survey: carry the enclosed logger (sealed; do not open) on all launches for seven days. 25 cr on return of
> logger. Lane Services thanks you for helping us keep the lanes safe.

**In play:** The **logger** (1x1, sealed) rides in the player's bay for a week. Pay: 25 cr. Std. 400. It logs every route the
drone flies, including free shafts. At the end of the week Lane Services knows which rat holes the player uses, and those holes
are rewelded within a fortnight. Rat standing falls if the rats find out (they will: the Drop board notices when three holes
close in a row on one route). **Alternative:** the logger can be opened. Inside is a founding-era clock chip, which is worth more
than the 25 cr, and which the Old Hands say can be re-flashed to log nothing.

### The strange

**S-58. STORES 17-C.** *Works requisition stock, Y41 form, dot-matrix type, warm to the touch. Pinned overnight to clip 48,
the last clip on the SERVICE row, which HCS leaves empty because the stile's reader half covers it. Nobody pinned it (02).*

> REQN 41-17-C-00873. ITEM: GLOVE, CLEANROOM, NITRILE, LINE 4 ISSUE. QTY: 12 PR. COND: ANY. DELIVER: CALL PLATE, LIFT ZERO,
> 21. AUTH: CC/AUTO.

**In play:** Wants `glove` (cleanroom, Line 4) ×12 pairs; Line 4 gloves hang on the **Glove Wall** on 17, grey, forty years
old, and taking them down is a small transgression on the floor. Route: the goods go to the call plate on 21 by hand or drone;
the slot takes them overnight. Pay: arrives in the player's **next returning bay** from any client: fresh HW-9 cells (with this
year's date code), a founding-era part, or a sealed roll of Y40 Works scrip. Std.: none. The Dark Floors are a client
(02, 14).

**S-59. Static (the pirate radio).** *Nothing on the board. A voice on the receiver at 23:00 reads it out, twice, with a
lease number that is the player's.*

> "To the stores on seventeen, a request from the station: tape, any kind, five rolls; a cell, the big founding kind if you
> have one, small if you don't. Leave it on the ledge in the Empty at thirty-three, the one with the box chalked around a
> 33. And thanks. You'll hear about it."

**In play:** Wants `tape` ×5 and `cell` ×1. Route: the **Empty** (Freight One's dead well) to a ledge at 33. Pay: **news**:
for a week, Static mentions things a day before they happen (an inspection, a lift strike, a Crown party, a storm) and the
player's event strip shows them a day early. Std.: none. A founding-era cell instead of an H-cell makes the station's signal
reach the Hulk, and that week other towers' slips appear on the Long Pads a day early too. See client C-31.

**S-60. Clip 0.** *A slip in the corner of the Fringe that Noor no longer clears. The paper is like nothing else: thin, grey,
with a faint grid printed in it. The handwriting is very young or very old.*

> Seeds of anything that will grow in the dark. Anything. Leave them in the left glove of the Glove Wall, third row.

**In play:** Wants `seed` (any) ×1 or more. Route: by hand, to the Glove Wall. Pay: none, at first. The seed is gone the next
morning. A week later, something is left in the same glove: a tiny, pale, perfect mushroom of a kind no one in the Mills has
seen, or a sprig of a plant with white leaves. Std.: none. **Hook:** what grows in the dark, and who is growing it. (14 owns
this mystery; this file only posts the slip.)

**S-61. The Archivists, Reading Room.** *A photocopy of a founding drawing with one detail circled in red and a note
typed on an index card stapled to it.*

> The service tile under your counter (lease 17-C, square C4) should carry a maker's stamp on its underside. Make a rubbing.
> Graphite, not chalk. Payment in copies: Drawing S-17-02, Line Four Stores, Rev. B.

**In play:** Wants: a **rubbing** (a paper item made by lifting a service tile on the player's own lease and rubbing it; 1x1).
Lifting the tile opens the **underfloor** container (02) for an hour. Pay: a copy of **Drawing S-17-02**, the founding plan of
the player's own lease, which shows the **stores hoist** under the floor (02, floor 16's hook). Std.: none; Archivist reader's
card in the bay. A slip that is a key.

### The other towers (late game)

These appear on the board only once the player has a **crossing frame** (a drone with the cells and the frame to fly the
bay, 09) and only on the **Long Pads** board on the Shelf (floor 30), which is where inter-tower slips are pinned.

**S-62. St. Ober's Spire, Procurement.** *Pale blue card, a hospital cross over a wave, printed in two languages, one of
which nobody in the Stack reads any more.*

> Plasma, frozen, sealed units, 12, chain of custody form attached. Cold carry, sealed bay. Crossing window: the draw,
> 06:00–09:00. 600 cr on receipt. St. Ober's thanks its partners in care.

**In play:** Wants `plasma` (sealed, frozen) ×12; the player is carrying **what the plasma buyers bought from the Mills at 15 cr
a bag** (04). Route: the crossing, two hours south-east (07). Pay: 600 cr. Std. 700. Return: a **chain of custody form**,
countersigned, which the Mutual demands for its one prompt kind of claim (04): losses on drones carrying goods to St. Ober's
are paid in full. **Hook:** why that one kind.

**S-63. The Sounding.** *A narrow strip of thermal paper torn off a forecast printer, smudged.*

> Fresh greens, any, weekly, 2 kg. The cook's gums are bleeding. Pay: Premium bulletin, one week per delivery. Crossing:
> 7 hours each way, outer bay. Not in a blow.

**In play:** Wants `greens` (R, any) 2 kg weekly. Route: the longest crossing in the bay. Pay: a week of the **Premium
bulletin** (72-hour forecasts, storm names; 60 cr a week to buy, 07) per delivery. Std. 500. Return: the bulletin slips in the
bay. A slip where the pay is the thing that makes every other crossing safer.

**S-64. The Hulk.** *Painted on a square of plastic sheeting with a finger, and photographed by Static, who read it out.*

> Water 40 L. Cells 10. Pay: whatever you want from the twelfth floor, if you can carry it.

**In play:** Wants `water` 40 L and `cell` ×10. Route: one hour east (07), to a half-collapsed tower. Pay: **pick from a
floor**: the drone returns with a bay packed by the squatters from a list the player sends (a "pick list" item: the hireling
plan idea from `IDEAS.md`, done by someone else), with a **left-behind list** for what did not fit. Std.: none.

**S-65. Greenhold Licensing.** *Greenhold paper, seed watermark, a patent number in the header, very polite.*

> Greenhold is pleased to purchase heirloom seed of varieties not on the Greenhold Register, for preservation. 400 cr per
> variety, five seeds minimum. Varieties purchased will be registered and protected.

**In play:** Wants `seed` (heirloom, unregistered) ×5. Pay: 400 cr: a lot. Std. 600. What "registered and protected" means: the
variety becomes Greenhold's, and every seed saver growing it becomes an infringer. The player can sell the seed savers' whole
life's work for 400 cr. **In play:** the clearest betrayal slip in the game, with the highest pay on the board for a 1x1 item.

**S-66. Vantage, Residency Office.** *White polymer, almost weightless, cut perfectly, with a hologram that shows the Stack
tilting away.*

> Vantage invites applications for residence from Stack tenants of Standing 700 or above with a clean record. Send: Ledger
> extract, a character reference from a Terraces account, and a 300 cr application fee. Applications are assessed within
> 90 days.

**In play:** Not a delivery: an **exit**. Wants three paper items (a Ledger extract from the Count House, 10 cr; a reference
from a Terraces client the player has served, which is the reward of a long client arc; and 300 cr in a sealed envelope). Std.
700. Return, after ninety game days: an acceptance, a refusal, or a request for a further fee. Leaving for Vantage is one of the
endings (13). Vantage's slip is the only slip in the game that asks the player to send themselves.

---
## 10. Clients

A client is someone whose slips keep coming. Each entry below gives: who they are and where; how their slips look; what they
**like** (pay a premium for), **accept** (pay the rate for) and **refuse** (send back or fail); how they pay; the gate; quirks;
what comes back in the bay; and an **arc**: three or four steps of a relationship, which the player walks by delivering, or
doesn't.

The arcs are not quests. They are what happens to a client who keeps getting good deliveries, told in the slips that come in the
bay. Every arc can be dropped at any step by simply not taking the next slip.

### Client standing, in one rule

Every regular client keeps a small **client ledger** on the player, exactly as factions do (06a): *Unknown*, *Tried*,
*Regular*, *Trusted*. It moves only with deliveries: on time and whole moves it up a step every few deliveries; late moves it
nowhere; failed or refused moves it down. *Regular* means bay slips (section 3). *Trusted* means the client's best slips, its
return field filled in by hand, and the arc's last step. One word per client on one ledger page; nothing hidden.

---

### The Crown

#### C-01. Orchard House (the Vellacott household), floors 96–97, through Corin Asch

*Cream card, quince embossed, "H. — C.A."* The household never writes to suppliers. Its head gardener does, on household card,
with the household's initial and his own. **Corin Asch** is in his forties, Crown-employed, lives in the Pantry on 90 like the
rest of the staff, and is, secretly, the Rain Church's best Wet Hand in the Crown (06a): the man who knows which gutters run.

- **Likes:** real fibre (brushes, twine), glass (cloches, jars), real compost, Flats seaweed for mulch, grafting tools, anything
  for the trees.
- **Accepts:** R produce for the staff table (not the household's), uncertified, by the back of the Pad.
- **Refuses:** anything synthetic for the trees; compost with frass or Orrin Blue; Glasshouse nutrient.
- **Pay:** 80–150 cr per slip; generous, steady.
- **Gate:** Std. 800 and the **Vellacott clearance card**, issued with each slip, returned with each drone. At *Trusted*, a
  standing card (kept, not returned): the player can land at the Orchard Pad without a slip, once a week.
- **Quirks:** writes in pencil under the printed text, which the household never sees. Delivers his own "returns" in
  cloth, never in Crown packaging. Always asks, in pencil, about the weather in the Mills (whether it rained into the risers).
- **Returns:** lemons, a quince in a good year, Apple prunings (scion wood), spent cloches with a chip, a pair of worn real-
  leather gardening gloves. At *Trusted*: **one real apple**, in late Ninth Month, worth more than any contract (02).
- **Arc:**
  1. **Brushes and compost** (S-01, S-02). Practical, polite, good pay.
  2. **"The drainage."** A pencilled slip asks for something odd: a length of founding-era pipe of a particular bore, and an
     Old Hand's opinion on a valve "that has got warm". The Apple's planter drains into a line that now runs warm from below
     (02's hook).
  3. **The fruit.** The Apple has not set fruit in three years; the autumn table's apples come from Greenhold. Corin asks the
     player, in pencil, for heirloom apple scion wood from the seed savers, to graft a branch the household will not notice.
     If it takes, the player has helped keep a Crown secret and a Crown tree, and has given the savers' wood to the top of the
     tower, which the savers will feel either way.
  4. **The Church.** At *Trusted*, Corin's slips begin to carry rain: a "compost sack" that is half wet cloth around a
     two-litre bottle of Founders' rain. The player is now in the Rain Church's chain whether they meant to be or not.

**In play:** Orchard House is the Crown client most players will have first, because its gardener is kind and its card makes
the route. It is also the one most likely to turn into a secret.

#### C-02. The Household of Daunt, floor 95, through Steward Philippa Quennell

*Cream card, black border, a silver hound, all printed.* The Daunts are old board money: a seat on Halden's board since the
Landlord Years, and the household that gives the **Long Table** on Founders' Night at the Assembly (100), the party the Crown
kept after the Company cancelled Founding Day in Y57 (01). The steward, **Philippa Quennell**, sixty, prints everything,
because a printed slip cannot be accused of a tone.

- **Likes:** white flowers, matched sets, linen, ice in the Still, anything that can be described at table ("from the
  Mills, you know").
- **Accepts:** R✓ only, certificate in the bay.
- **Refuses:** uncertified anything; late anything; anything with a mark; anything that has been "near" a Sump route (the
  Assay can smell the Wet One's condensate on a bay).
- **Pay:** high (300–500 cr) and seasonal: almost nothing for months, then six slips in a week before a party.
- **Gate:** Std. 850, a party clearance stamped on the slip.
- **Quirks:** the household **withdraws** more slips than any other, without explanation. The morning after a party it sends
  service slips (S-09) at short notice and pays well for speed.
- **Returns:** stained linen, half-burnt beeswax candles (real wax: candle ends are worth 4 cr each to the Rain Church's
  funerals), the leftover ice from a party in a cold bay, flower stems past their best (which go to a Mills widow on 15
  who dries them and sells them back up to 44).
- **Arc:**
  1. **Flowers for the Long Table** (S-03). A Kestrel, a cold liner, a certificate: the whole kit.
  2. **The morning after** (S-09): napkins, one missing, or one extra.
  3. **The guest.** A slip asks for "a Mills craftsperson to demonstrate repair at table": a person, not a good. The player (or
     a hireling) is invited up to the Long Table as entertainment for one evening. Pay: 200 cr and a day pass to 95. What
     the player sees there is a Crown dinner from the side of the room.
  4. **The list.** At *Trusted*, Quennell puts the player on the household's **supplier list**, which is printed and circulated
     between stewards. The player's board fills with Crown ghosts that are no longer ghosts. Being on a steward's list is
     the most valuable thing a supplier can have (02); losing it is one late delivery away.

#### C-03. The Household of Sabe, floor 98

*Cream card, unembossed, uncrested, almost severe.* New money: the Sabes bought a title on 98 in Y79 with a fortune made in
Vantage, and they over-correct. Their slips have no crest because "old families do not need crests", which the old families
have noticed. There is no named steward; slips are signed **H.**

- **Likes:** matched things. Twelve eggs of one size, eight identical glass jars, paired gloves, a set. Brown eggs specifically
  (S-04), because a magazine in Vantage said so.
- **Accepts:** R✓; never R.
- **Refuses:** odd numbers; near-matches; anything mended, even invisibly ("the household does not wear repairs").
- **Pay:** high per unit, strict.
- **Gate:** Std. 850.
- **Quirks:** returns the packaging. The egg box comes back with every order (S-04) and must go up again full.
- **Returns:** packaging, scrupulously; and once a year, an entire wardrobe of perfectly good clothes, VOID-slashed by a
  valet, down the North Chute. The Sabes do not send these to the player. They arrive in the catch anyway.
- **Arc:**
  1. **The eggs.** Twelve brown, matched. Hard.
  2. **The set.** Eight jars, ground stoppers, identical; the player needs the chute, the Reclaim and an Old Hand.
  3. **The Vantage cousin.** A slip asks for a **reference letter** about the player from the household's Ledger account "for a
     relative's application", which is the reverse of S-66: the Sabes want a Stack supplier's testimony that their cousin
     in Vantage "was known to the Stack's trades". Pay: 300 cr for a signature. It is false.

#### C-04. The Pantry, floor 90, through Benet Kayode

*Backs of menu cards, laundry tags, napkins; pencil; butter.* **Benet Kayode**, twenty-nine, an under-cook from the Middle
(born on 37), cooks for a household on 92 and sleeps in a Pantry bunk under the cistern drip. He orders for the staff, for the
cooks' own table, and sometimes for a household that wants something it would never order in its own name.

- **Likes:** Mills pickles, Sump gin, chilli paste, real Vitabrick (the staff eat it for nostalgia), mended clothes, cheap
  cells.
- **Accepts:** anything, any grade, any status, if it is small.
- **Refuses:** anything that needs a lane; anything with a label that a Crown Detail sniffer arm would find interesting.
- **Pay:** low (8–25 cr), in chits.
- **Gate:** none; Fringe; arrives by vent kid or grille hand.
- **Quirks:** writes on whatever is on the pass that night, so his slips are a running record of the Crown's menus
  ("Thursday: hand-dived scallops"). Collect them and you know what the Crown eats each week.
- **Returns:** **kitchen leftovers**: real food in a cloth, rich and perishable. The best rewards per square in the early game.
- **Arc:**
  1. **Pickles and gin** (S-06, S-07).
  2. **The household's request.** "The lady on 92 wants 'real Mills food' for a theme dinner. Bring Vitabrick, a slab,
     noodles, and a jar of the brown pickles. She'll serve them on silver." Pay: 60 cr. The Crown eats the Mills as a costume.
  3. **The grille.** The grille hand Benet uses is caught and loses her post. Benet asks the player to fly the next consignments
     by **lane**, as staff consignment through the Postern, which needs Standing the player may not have, or to find a new
     grille hand, which is a person the player must recruit (a client of their own: a cleaner on 89).
  4. **Benet goes down.** Dismissed for theft (a bottle), Benet arrives on 17 looking for work. A hireling who knows how the
     Crown orders.

#### C-05. Lantern Facilities, floor 103, department LF-3

*Grey Halden CO-3 with a gold edge; typed; department code.* The Halden family's own household office: not a steward but a
Company department, staffed by Terraces clerks who ride the Cradle up every morning. The clerk who handles slips below 60 is
**Imogen Tuttle**, who has never been below 70 and writes "please find enclosed" on everything.

- **Likes:** wild-line live insects (the lizard), toy repairs, "authentic" Mills crafts for the children's education.
- **Accepts:** lane-only, licensed, certified.
- **Refuses:** anything the Lantern's own sniffer flags.
- **Pay:** good (60–120 cr), on time, through HCS.
- **Gate:** Std. 800.
- **Returns:** broken toys built from founding-era spares (S-05), the children's discarded learning screens, a drawing of a
  lizard.
- **Arc:**
  1. **The lizard** (S-05), monthly.
  2. **The toys.** Each return is a broken toy; analysed, each holds a founding-era part: a controller, a cell, a sensor. A player
     who notices starts to depend on the lizard.
  3. **The school project.** A slip asks for "an authentic Mills tool, with a written history of its use" for the youngest
     Halden child's school project. The player's own oldest tool, or an Old Hand's clock-signed spanner, goes to the Lantern.
     The return is a letter of thanks on Lantern stationery, which is worth 300 cr to a Middle collector and a lot more as
     **leverage**: a Halden child's handwriting, saying thank you to a stinker's neighbour.

**Hook:** the Lantern's spares are the Company's last stock of founding-era parts, kept "for no one else" (02). The family's
children break them for fun.

---

### The Terraces

#### C-06. Hob Seventy-Five, Lantern Row, floor 75, Chef Maren Ilves

*Laminated print, a blue flame, grease pencil, red NO LATE.* **Maren Ilves** is forty-four, grew up in the Middle, trained in
Orrin's test kitchen on 80, and left to cook food that tastes of something. Hob is the small restaurant between the Provisions
Room and the fish place; it seats twenty-two and charges what a Mills labourer earns in a month for a dinner.

- **Likes:** herbs, greens, mushrooms, eggs, chillies, edible flowers: small, fresh, real, often. Unusual varieties from seed
  savers (she pays double for something nobody else on the Row has).
- **Accepts:** R✓ for the menu; R uncertified "for the staff meal" at half rate.
- **Refuses:** late anything; bruised leaves; anything that rode in an open bay through soot (the grade drops, 02).
- **Pay:** 40–120 cr; quick.
- **Gate:** Std. 600, Grow Certificate.
- **Quirks:** her deadlines are lunch and dinner service: 11:30 and 17:30. Her slips are short and in the imperative. She
  writes a one-word review on the receipt stub ("good", "limp", "again").
- **Returns:** staff meals, kitchen offcuts (the ends of real things), and, at *Trusted*, a **recipe card**: a real use for a
  Mills ingredient she has made famous on 75 (a chilli paste, a pickled stem), which the player can then make and sell.
- **Arc:**
  1. **Basil** (S-10).
  2. **The heirloom.** She hears a seed saver's tomato exists and asks the player to grow it. To get it, the player must be
     *Known* to the savers. To sell it to Hob, it must be certified. To certify it, the Grading House will read its variety, and
     the variety is not on Greenhold's register (S-65).
  3. **The menu line.** The player's name, or their floor ("tomatoes from Seventeen"), appears on Hob's menu. Crown households
     read it. Ghost slips on the player's board turn real.

#### C-07. Vey Sixty-Four, Supplies Office, floor 64, Halvard Steen

*Laminated, cross-in-circle, magenta Ledger refs.* **Halvard Steen**, fifty, Supplies Officer for Vey's private clinic: clean
hands, a clean desk, a policy for everything. He buys raw materials Vey needs and cannot make in the Terraces: chitin, insect
fat for salves, certain dried herbs, sterile water in some forms.

- **Likes:** traceable things. Herd tickets, provenance slips, certificates.
- **Accepts:** sealed bay only; Food Handling; exact counts.
- **Refuses:** grey anything, unsealed anything, a lot without paperwork.
- **Pay:** high and slow (paid "within the review period": three days after delivery).
- **Gate:** Std. 600, sealed liner (120 cr).
- **Quirks:** every slip comes with a **supplier questionnaire** (1x1) that must be returned filled in. The questions get more
  personal as the player rises ("Do you or members of your household sell plasma?").
- **Returns:** expired stock: wound film, a DoseLock at the edge of expiry, mould-lung inhaler refills a month out. All of
  which sell in the Mills for more than the slip paid.
- **Arc:**
  1. **Chitin** (S-11).
  2. **The fat.** Insect fat for a salve base; the player's insect chain becomes a pharmaceutical supply.
  3. **The trial.** Steen asks for volunteers for a "mould-lung trial" from the Mills, paid 40 cr a head, carried by the
     player's drone as **paper** (consent forms) down and up. The player is now recruiting their neighbours for Vey.
  4. **The supply agreement.** Exclusive, one season, generous (as Orrin's, section 11).

#### C-08. Lady Fenwick-Orrell, floor 77

*Lilac card, a coronet, violet ink.* **Lady Mirabel Fenwick-Orrell**, seventy-something, widow of a Halden director, holds a
large Terraces flat on 77 and no title above it: the family's Crown title was sold to pay a debt nobody mentions. She sponsors
forty tenants' Standing at once (04) and the Count House has never asked why.

- **Likes:** mending, old things made to look new, gossip from below, lavender (none exists in the tower; she accepts any
  scent).
- **Accepts:** anything, if it is beautifully done.
- **Refuses:** anything that "shows".
- **Pay:** modest in credits; generous in something else.
- **Gate:** Std. 500 (she sets her gates herself, low, to reach the people she wants).
- **Quirks:** her slips are letters. She asks after the player's health. She remembers names.
- **Returns:** a sponsorship offer (+150 Standing for a year) for a quarterly fee (about 375 cr a quarter, the market
  price, 04); then, at *Trusted*, a sponsorship **without a fee**, in exchange for a favour named later.
- **Arc:**
  1. **The shawl** (S-16).
  2. **The sponsorship**, at the market price.
  3. **The forty.** Her slip asks the player to carry **sealed envelopes** to five of her other sponsored tenants on Mills floors.
     The player meets them: each is someone she is quietly paying to stay where they are (a widow on 15, a Co-op grower, an
     Old Hand). She is not running a scheme. She is paying, a little at a time, for something her husband did. (A Hook for 14:
     what did Director Fenwick-Orrell sign in Y56?)
  4. **The favour.** At *Trusted*, the free sponsorship, and the favour: "When I die, please make sure the clocks in my flat go
     to the man on seventeen who reads them." Aldo Moyle (05).

#### C-09. Lucan Pryor, orchid grower, floor 61

*Cheap embossing, anxious hand.* **Lucan Pryor**, thirty-eight, a Terraces junior (Ledger operations, floor 71) who lives at the
very bottom of the Terraces and grows orchids under lamps in a flat he cannot afford. He sells keikis to the Crown through a
penthouse fixer. He wants to be Crown so badly that it shows in his stationery.

- **Likes:** bark, cork, real wood, **rain** (orchids hate Halden Pure's salts), fine mesh, humidity.
- **Accepts:** free-shaft deliveries to his ledge, at a better price, because he is behind on his permit.
- **Refuses:** nothing in the first season. Then everything, when he is frightened.
- **Pay:** 60–180 cr; sometimes late (he pays when the fixer pays him).
- **Gate:** Std. 600 at the door; none at the ledge.
- **Returns:** orchid keikis (live, 1x1): worthless below the Terraces, 200 cr to a Crown fixer.
- **Arc:**
  1. **Bark** (S-14), then **rain**: 20 L weekly in the wet season, 180 cr (03's orchid grower; this is him).
  2. **The ledge.** Pryor asks for all deliveries at the ledge "for now". He is behind on his lane fees and his Standing is
     falling. He works on the Ledger, and he knows what is happening to his own number.
  3. **The fall.** Pryor's flat is "adjusted" (a row taken, 05). His slip asks the player to take his orchids into storage "for
     a week or two". A 3x3 of live plants on the player's field, needing water and lamp, with no pay until he is back up.
  4. **Either** he gets back up (and the player is his only supplier, at *Trusted*, with a Terraces reference for S-66), **or**
     he comes down to the Mills, and the orchids are the player's.

#### C-10. The Glasshouses, floors 84–87, buyer Agnieszka Thorne

*Greenhold licence stock, seed watermark, patent footer.* **Agnieszka Thorne**, a Greenhold employee seconded to the
Glasshouses, buys what the Glasshouses cannot grow in volume: heirloom herbs, edible flowers, live insects for the fish place.
She is the most careful buyer in the Stack because her employer audits every supplier for patent contamination.

- **Likes:** odd, specific, beautiful produce. Flowers. Wild-line live insects (for "wild" menus).
- **Accepts:** R✓ with a seed declaration (a 1x1 form: where the seed came from).
- **Refuses:** anything grown from Greenhold seed outside a licence; anything grown from seed that came from Glasshouse waste.
- **Pay:** high.
- **Gate:** Std. 650, Grow Certificate, seed declaration.
- **Quirks:** her payment is held for seven days "pending varietal verification": the Glasshouses' lab checks every delivery
  against Greenhold's register.
- **Returns:** spent rockwool slabs (seed savers sift them), out-of-licence nutrient concentrate (too strong for anything but a
  very careful grower).
- **Arc:**
  1. **Nasturtiums** (S-15).
  2. **The verification.** A delivery fails verification: the variety matches a Greenhold line. Thorne writes privately: she can
     record it as a contamination (a fine for the player, a hunt for the source) or as a sampling error (nothing), and she would
     like, in return, to know where the seed came from.
  3. **Thorne's own seed.** At *Trusted*, Thorne asks the player to grow something for her, outside the Glasshouses, from seed
     she slips into the bay: a Greenhold line she believes is being let die in the vault. She is a seed saver too. Or she is
     testing the player for Greenhold. The slip does not say which.

#### C-11. Orrin House test kitchen, floor 80, Clement Abara

*Orrin grey-green, leaf watermark.* **Clement Abara**, Orrin's "Grower Relations Officer" (a post created for the Real-Blend
trial, 02), thirty-six, warm, persuasive, carries a pen with a real wood barrel to every meeting. His job is to find Mills
growers who can pass the Grading House, and to sign them.

- **Likes:** volume. Consistent, certified greens and herbs, by the crate.
- **Accepts:** R✓ only for Real-Blend; "below-spec" R at 30% for "internal tasting".
- **Refuses:** exclusivity breaches.
- **Pay:** the season's best price, guaranteed.
- **Gate:** Std. 500, Grow Certificate, Food Handling.
- **Returns:** Real-Blend tins, test flavours of Vitabrick (labelled with numbers, not names: some are good), Orrin branded
  crates (the crate is worth having).
- **Arc:**
  1. **Tasting samples.** Small, generous, flattering.
  2. **The agreement.** A supply agreement for certified herbs at 15% of the Real-Blend brick: one season, exclusive (section 11).
  3. **The review.** The price falls by a third on renewal. The player's grow beds now produce for Orrin and nobody else, Hob
     Seventy-Five has found another grower, and Abara is warm and sorry and has a new pen.

---

### The Middle

#### C-12. Ambler & Daughters, Grocers, floor 44, Rosa Ambler

*Neat CO-3, wheelbarrow stamp, carbon, "quietly".* The **Ambler family** has kept the plank bridge over the Gap on 41 since
Y64 (02); one branch kept the bridge, the other opened a grocery on 44 with the bridge money. **Rosa Ambler**, fifty-two, runs
the shop with two daughters. They broker Co-op greens to the Middle (06a) and buy uncertified produce "quietly" from anyone.

- **Likes:** uncertified real produce (R) at Mills prices, to sell as "Real" with a hand-lettered card; eggs; chillies.
- **Accepts:** anything food, any route (the Gap is theirs).
- **Refuses:** VOID-marked goods (brand agents shop on 44); counterfeits.
- **Pay:** fair, in credits, Thursdays.
- **Gate:** Std. 400; less if the drone comes through the Gap (the family lets the player's drones skip the stair checks free).
- **Returns:** a carbon of each sale ticket, Middle groceries the Mills can't buy (real salt, store tea), and, now and then,
  a crossing of the Gap: a **Gap token** (1x1) that lets a riser drone skip the Turnstile at 41 for nothing.
- **Arc:**
  1. **Tomatoes, quietly** (S-19), Thursdays.
  2. **The Co-op problem.** The Co-op's greens slip goes to Ambler too (06a); Rosa offers the player a better rate to undercut
     the Co-op. The Co-op will know.
  3. **The bridge.** The Company announces it will "restore" the South Stair landing at 41, which ends the Amblers' toll. Rosa
     asks the player to carry petitions (Form A-1, 05) to the Arbiter. A small, losing fight the player can join.

#### C-13. Laundry Thirty-Four, floor 34, Mrs Agatha Lusk

*Every field filled; licence D-0331.* **Agatha Lusk**, sixty-five, licensed Class D water user (03), runs the laundry that does
the Lift Guild's uniforms and the Halden School's linen. Respectable, anxious, two missed rents from the Mills like everyone
in the Middle (02). Her slips are the most correct in the tower.

- **Likes:** insect-fat soap (unscented), wooden pegs, soft-line grey for pre-rinse, starch.
- **Accepts:** Mills goods with any status that does not show on cotton.
- **Refuses:** perfumed anything (clogs her licensed filters), anything that could be seen by the inspector as "unlicensed
  water" (she checks).
- **Pay:** small, exact, on time.
- **Gate:** Std. 400.
- **Returns:** laundry grey (10 L per delivery), lost property from the wash: a button of real horn, a Guild pin, a tally
  band with no account on it (**Hook**).
- **Arc:**
  1. **Soap** (S-20).
  2. **The overflow.** The Laundry gets a Crown contract (the Daunts' morning after, S-09, comes to her first) and cannot manage
     the volume; she subcontracts half to the player, in the bay, at a third of the pay.
  3. **The inspection.** A Water Wellbeing Office audit finds her draw is below her licensed baseline (because she used the
     player's grey). She can blame the player's water to save her licence.

#### C-14. Car House, the Lift Guild, floor 45, Quartermaster Ferris Dunmore

*Triplicate, Guild stamp, Ride Book ref.* **Ferris Dunmore**, fifty-eight, Guild quartermaster for the cars in cores B and C,
third-generation Guild (seats are inherited, 04). Dislikes drones on principle and uses them every day.

- **Likes:** founding-grade grease (LM), cable, certified cells, bearings, anything with a Works part number.
- **Accepts:** deliveries **by car** with the enclosed chit; lane deliveries grudgingly.
- **Refuses:** anything that came up a riser. He can tell (soot in the bay seams).
- **Pay:** credits plus **freight chits** (the Guild's token, 06a): each chit is a safe, slow, logged trip for a drone.
- **Gate:** Std. 400 and Guild standing *Known*.
- **Returns:** freight chits; worn lift cable (1x3, real steel, worth 20 cr to a Sump fixer); a Guild uniform (status: grey
  once worn by a non-member).
- **Arc:**
  1. **Lamp cells** (S-22).
  2. **The grease** (06a's "Grease for E"): founding-grade grease only comes from the drowned floors or a Crown fixer.
  3. **The hatch list.** Dunmore offers the player 25 cr per unlicensed hatch reported between 14 and 21 (06a, "Report a hatch").
     The Three Grate is one of them. Wren is the kid who uses it.

#### C-15. Nan Okpara's, the Shelf Market, floor 30

*A fish-paste label in a CO-3 sleeve.* **Nan Okpara**, forty, runs a fish-paste kitchen on the Shelf: smoked eels from the Flats
(by way of the Ovens on 16), salt, insect oil, chillies, ground into a paste sold by the spoon on a cracker to people from both
sides of the Turnstile. Shelf traders have to post through HCS because the Shelf is a Middle floor; they pay at Mills prices
because their customers are half Mills.

- **Likes:** salt, oil, chillies, smoked fish, crackers, empty jars.
- **Accepts:** anything cheap, any status.
- **Refuses:** nothing; she cooks it.
- **Pay:** small, daily, reliable.
- **Gate:** Std. 300.
- **Returns:** fish paste (food that keeps a week), empty casks, **gossip** from the Shelf: the price of everything this
  morning, who got evicted, which Crown household's staff came down to shop.
- **Arc:**
  1. **Salt and oil** (S-24), overnight.
  2. **The pitch.** A Shelf pitch next to Nan's falls vacant. Nan offers to sublet the player half of her own tarp (06b's barons
     would charge more): a second shop front, on the Shelf, two hours a day, at Middle frontage rates. The counter idea from
     `IDEAS.md`, transplanted to the Shelf.
  3. **The Long Pads.** Nan's stall is next to the inter-tower pads. Her slips start to include messages for couriers from
     other towers. She is the player's first introduction to crossing work.

#### C-16. The Ashdown-Kerr household, floor 29 (Middle, Transitional)

*New CO-3s, very correct, a firm postscript.* **Daniel and Priya Ashdown-Kerr**, both Halden office staff on 70, with two small
children, moved down to 29 from 41 when the Chalk reached 29 and the new Middle leases there were cheaper than their old ones.
They are the gentrification of the Mills, one family at a time, and they are frightened of the floor they live on.

- **Likes:** clean, safe, new or at least not mended; Middle brands; things for the children.
- **Accepts:** Mills goods only if they can't tell.
- **Refuses:** VOID marks, mended items, anything from the chute, pressings, stinker water.
- **Pay:** Middle pay for Mills goods, which is good.
- **Gate:** Std. 500.
- **Returns:** nothing but more slips, and their discarded Middle goods (a child's lamp, outgrown clothes, real-cotton) go
  down their new catch, which is the player's chute table getting better.
- **Arc:**
  1. **The cot** (S-25), and weekly slips for children's things.
  2. **The air.** The air meters on 29 are connected (02). Priya's slip asks for an air filter that "actually works, not the
     store's". She is asking for a grey filter housing (04) in the politest way possible.
  3. **The petition.** The Ashdown-Kerrs ask the player to support a petition for "standards" on 28 and 27: no stills and no
     insect bins on any floor that has a family lease. The petition is how the Chalk moves down a floor (section 13,
     reclassification). Signing it puts the player on the Middle's side of the line. Refusing puts the player on their list.

---

### The Mills

#### C-17. Hester Moyle, warden of floor 17

*Yellow carbon strips, an inspector's hand.* Sixty-one, warden for nineteen years, former Works line inspector (05). Files four
reports a month because the Lease Office pays for a "healthy irregularity rate", and almost all of them are against Gus
Tanaka-Breen. Takes clocks for her brother Aldo, who reads them.

- **Likes:** clock parts: keys, crystals, springs, balance wheels, hands, whole broken clocks. Founding-era synced clocks most
  of all (the backs carry the sync node's serial).
- **Accepts:** anything small that she asked for.
- **Refuses:** money for favours. She takes clocks; she does not take bribes. The difference matters to her.
- **Pay:** 1–5 cr. Never more.
- **Gate:** none. Corridor, not drone.
- **Returns:** the **Warden's regard** pip (05), which lowers the chance that the next inspection on 17 is warden-triggered;
  once in a while, "Tasters are on fifteen" at seven in the morning.
- **Arc:**
  1. **Clock parts** (S-28), weekly.
  2. **Quota week** (05): Hester is one report short at the month's end. She offers the player a choice: a letter of concern
     against the player for something trivial, or a report on a neighbour. The neighbour is a client.
  3. **The map.** Aldo's pencil map of the sync nodes needs one more clock: a synced one from the Dark Floors' side of floor
     21, behind Lasse Kowal's bulkhead. Hester asks without asking.
  4. **The replacement.** Hester falls ill (the Mills cough). Her post is advertised. The player can put a name forward, or
     watch **Pim Okafor** (05) take it.

#### C-18. Mattias Orme, Old Hand, Litho Run, floor 17

*Block capitals on Works mask envelopes.* Ninety, lithographer on Line Four from Y12 to the Last Shift (02). Lives on
Litho Run in a lease with a working safelight he will not let anyone paint over.

- **Likes:** glass lenses, fine tools, founding-era optics, lens tissue, tea, Stinker spirit, being asked properly.
- **Accepts:** payment in kind for his work.
- **Refuses:** to write things down (06a), to work for Halden, to touch anything from the Dark Floors ("not mine to touch").
- **Pay:** in **work**: readings, repairs, clock-signing. Rarely credits; when he does pay credits it is because he wants you
  to know he could.
- **Gate:** Old Hands standing *Known*; a clock badge in the bay for jobs by drone.
- **Returns:** a **reading card** (an item's hidden features, written out), a clock-signed repair, an introduction to another
  Old Hand.
- **Arc:**
  1. **The magnifier** (S-29).
  2. **The stores cage.** Mattias tells the player what their lease was: the Line Four stores, where he collected his masks
     every morning for twenty-nine years. He remembers the stores hoist (02). He remembers the requisition forms.
  3. **The requisitions.** When the first STORES 17-C slip appears (S-58), Mattias reads it and goes very quiet. Then he
     tells the player what the authorisation code "CC/AUTO" meant on Line Four.
  4. **The apprentice.** At *Trusted*, Mattias offers to teach. A slow arc: once a week, a day of the player's hours for a
     permanent improvement in what the player can read on an item without an analyser.

#### C-19. Yusra Dimitriou, Co-op grower, Wet Run, floor 17

*Co-op forms, a dying marker.* Thirty-eight, eight grow beds on a founding-era drain trough, two Hanging Boxes under 17's best
cut window (02). A Ledger-wing Co-op member (06a): careful, legal, bitter about it.

- **Likes:** soft grey, real soil, compost, seed, Brightline lamps (even expired), Crib time.
- **Accepts:** any water above grey, for the beds.
- **Refuses:** Font water ("not in my beds; the inspectors know what rain does to a meter reading").
- **Pay:** greens chits or produce.
- **Gate:** Co-op *Known*.
- **Returns:** produce (greens, beans, chillies, a tomato), a lend of a seed packet (06a's lending packet), labour on a busy
  day (she sends her son).
- **Arc:**
  1. **Water and soil** (S-30), every morning before the taps shut.
  2. **The certificate.** Yusra wants a Grow Certificate (20 cr a quarter per bed, 04) and cannot afford the Grading House fee.
     She asks the player to send her samples with theirs, under the player's name. Fraud, small, sympathetic.
  3. **The split.** The Co-op argues over the Split (06a: chute food waste to bins or to compost). Yusra asks the player to
     vote with the growers at the Floor meeting. The insect ranchers ask the opposite.

#### C-20. Tamsin Gale, baker, the Ovens, floor 16

*Floury CO-3s.* Forty-nine, bakes in Oven 4 with Co-op grain and anything else that can be called flour. Posts on the Grid
because she wants Standing: her daughter has passed the Halden School exam and Tamsin needs Std. 500 to lease on 29, where
the school places Mills children "with suitable housing".

- **Likes:** fuel (real wood, charcoal, dead scrip), grain, salt, insect fat, eggs (rare).
- **Accepts:** anything that burns cleanly.
- **Refuses:** painted wood (the fumes), Orrin feed sacks as kindling (they smoulder blue).
- **Pay:** small credits plus bread.
- **Gate:** Std. 200.
- **Returns:** loaves; oven time (a service: bake your grain, dry your herbs, smoke your fish, 02); the Ovens' gossip.
- **Arc:**
  1. **Fuel** (S-31), standing.
  2. **The oven.** Tamsin offers the player a share of Oven 4's overnight time: an off-field machine slot the player can use by
     drone (send dough down, bread comes up), for a weekly fee.
  3. **The move.** Tamsin reaches Std. 500 and leaves for 29. Oven 4 is up for lease. The player can take it: squares on 16,
     a second site, the first expansion that is not on 17.

#### C-21. The Eight Squares, floor 17 (Tobin Saar, keeper; Gus Tanaka-Breen, owner)

*Hot-bunk tags.* Gus's hot-bunk house sleeps twenty at the far end of Glove Run (02, 06b). **Tobin Saar**,
twenty-four, keeper, sleeps in the hatch cupboard and is paid 20 cr a week and a bed. Gus pays the house's bills on Fridays.

- **Likes:** laundry, cells for the bunk lamps, cheap food in bulk, bedbug powder, earplugs (the hum on 21 does not reach 17,
  but the changeover does).
- **Accepts:** anything cheap.
- **Refuses:** nothing Gus doesn't have to pay for twice.
- **Pay:** low, weekly, by Gus, sometimes short.
- **Gate:** none.
- **Returns:** bunk shifts (a place for a hireling to sleep), Tobin's knowledge of who sleeps where.
- **Arc:**
  1. **Sheets** (S-32).
  2. **The collector.** Brisk & Lowe's informing slip about Tobin (S-27) appears on the board. Whatever the player does, Tobin
     finds out.
  3. **Hester's reports.** Hester's quota-week choice (C-17) is Gus or the player. If Gus, an occupancy count closes six bunks
     and Tobin asks the player to sleep three of the displaced on the shop floor for a week (a corner of the player's board,
     taken by sleepers at night).
  4. **Tobin's own house.** At *Trusted*, Tobin asks for a loan to open a house of his own on 15. The player becomes a backer
     of a hot-bunk house, which is how sublet barons start (06b).

#### C-22. Orrin Provisions, the Press depot, floor 11, clerk Wilmot Ekwueme

*Orrin grey-green CO-3s, PRICE UNDER REVIEW.* **Wilmot Ekwueme**, thirty-one, depot clerk at the Press, the Mills' biggest buyer
of insects. He is paid a bonus per kilo intake and docked per kilo rejected, so he is lenient on Mondays and strict on Fridays.

- **Likes:** registered colony stock, by the tote, on time.
- **Accepts:** live weight with a herd ticket; paste at a lower rate.
- **Refuses:** wild-line stock (unregistered), pressings, anything without a ticket.
- **Pay:** credits + supply credit (Orrin's scrip: better than store scrip because Orrin pays on time, 04).
- **Gate:** Std. 300, Food Handling.
- **Returns:** Orrin Protein Starter colonies (the joke, S-33), Orrin crates, Vitabrick seconds (misshapen bricks: legal to
  eat, not to sell as Vitabrick).
- **Arc:**
  1. **Intake** (S-33).
  2. **The agreement** (S-56).
  3. **The registration.** Wilmot quietly tells the player how to register a wild-line colony as an Orrin "licensed
     descendant": one herd ticket from a registered bin, a 30 cr fee, and a question nobody asks. Grey made legal at the stroke
     of a pen, the way the Stinkers' licence works (03).

#### C-23. Sabine Corr, mushroom grower, Overhum, floor 27

*Purple wax crayon on spawn bags.* Fifty-three, grows mushrooms in the dark and warm of the old Line Nine control room (02),
whose window onto the Clean Core is bricked with warm bricks. Asks no questions about her lease and expects the same.

- **Likes:** spent insect bedding, straw, cardboard (unprinted), coffee grounds (real, from the Terraces chute), darkness.
- **Accepts:** any organic waste without Orrin Blue.
- **Refuses:** light. Her slips say "don't open the bay on the landing, bring it in".
- **Pay:** mushrooms (R): 12 cr per 200 g in the Terraces.
- **Gate:** none.
- **Returns:** mushrooms; spent mushroom compost (very good for grow beds); once, a pale mushroom she did not grow.
- **Arc:**
  1. **Bedding** (S-34).
  2. **The warm wall.** Sabine asks for a thermometer and a notebook. Her mushrooms grow faster against the bricks, and she wants
     to know why, without knowing why.
  3. **The pale one.** A mushroom grows through a crack in the brick from the Clean Core side. Sabine sends it to the player in
     a sealed jar and asks the player to find out what it is (an analyser, the Archivists, the Glasshouses' lab), and to tell
     nobody where it came from. It matches the mushroom left in the Glove Wall (S-60).

#### C-24. Piet Arkwright, cell grader, the Exchange, floor 28

*Tiny neat print, a cell-with-tick stamp.* Sixty, ex-Works quality control (formation line, Clock 4940; not an Old Hand by
temperament, he says, "just old"). Buys End-of-Service cells, grades them on a founding-era test rig, and sells the good ones.

- **Likes:** End-of-Service cells, clipped cells, dead banks, any founding-era cell even if dead (the case alone is worth
  money).
- **Accepts:** any cell.
- **Refuses:** grey-charged cells unless declared (they ruin his rig's calibration).
- **Pay:** fair credits.
- **Gate:** Std. 300.
- **Returns:** **grade cards** (each cell's real capacity), a graded cell now and then as a bonus.
- **Arc:**
  1. **Cells** (S-36).
  2. **The fresh one.** The player sends Arkwright one of the fresh HW-9 cells that came from the STORES 17-C requisitions.
     His grade card comes back with one word written over the grade: "WHERE?"
  3. **The date code.** Arkwright tells the player that this year's date code on a Works cell means it was made this year, on
     a Works line, by a Works machine. He would like to buy every one the player gets. So would Halden, he adds.

#### C-25. Crane & Ossory, produce brokers, the Exchange, floor 28

*A CO-3 with "c/o".* **Hollis Crane** and **Ottilie Ossory**, Middle people priced off the Shelf (02), now brokers on the
Exchange, buying Mills produce and selling it to Shelf stalls and Middle grocers. They are the brokered-slip trade (section
2) in person.

- **Likes:** volume, any R produce, chillies by the hundred, steady supply.
- **Accepts:** R and S produce; pro rata always.
- **Refuses:** exclusivity (they never sign it; they ask for it).
- **Pay:** half what the Shelf pays; on time; in credits.
- **Gate:** Std. 350.
- **Returns:** **market reports** (the morning's Shelf prices), which tell the player what the brokers make.
- **Arc:**
  1. **Chillies and greens** (S-40).
  2. **The undercut.** A player with Nan Okpara's half-pitch (C-15) is selling on the Shelf directly. Crane & Ossory's slips
     double, at a better price, until the player stops.
  3. **The partnership.** At *Trusted*, they offer the player a share of their Exchange lease in exchange for exclusive supply:
     the player becomes a broker. The ending text for "the Landlord" (06b) has a cousin here: the Middleman.

#### C-26. Wren, vent kid, floor 17

*Chalk on tin lids, under the shutter.* Eleven. Chalks the tide tables beside every socket board on 17 for 1 cr a board a week
(02). Knows the Three Grate, the underfloor, the drip rights and who sleeps where. Runs messages and small goods along the
floor by hand.

- **Likes:** rope, chalk, food (any), a cell for her lamp, being paid in advance.
- **Accepts:** errands; any slip that can be carried in two hands.
- **Refuses:** to go below 10 (her brother went; 06a's Gullet).
- **Pay:** **passage** (toll nets on 10–14 let the player's drones through), errands, news.
- **Gate:** none.
- **Returns:** passage, messages from the Fringe that never got pinned, a found thing every so often ("it was on a ledge").
- **Arc:**
  1. **Rope** (S-41).
  2. **The hand route.** Wren offers to carry the player's floor deliveries by hand for 1 cr each, which saves launches on every
     slip within 17.
  3. **The hatch list.** Dunmore's informing slip (C-14) names the Three Grate. Wren asks the player straight out whether they
     took it.
  4. **The school.** At *Trusted*, Wren asks for the one thing she wants: the Halden School exam entry waiver the Science
     department gives once a year (S-21). The player can give it to her, or sell it.

---

### The Sump

#### C-27. Mag Tolley, floor 8

*Blue string, spoken words.* Sixty, wet-debt lender (03): she lends water by the litre and is paid back in litres with
interest, or "a favour to be named". Lives behind the Bale Hall in a dry room the Wet Widows let her keep. Buys bulk for half
the Sump.

- **Likes:** protein in bulk (any), filters, cells, dry clothes, seed (she grows nothing; she resells it to the Flats).
- **Accepts:** anything; any grade; any status.
- **Refuses:** Halden goods with a tracking strip (SureSeal cans; they get her raided).
- **Pay:** **salvage**, "bay full on the way back", or chits; or a **water debt** cancelled.
- **Gate:** none. Tide cord or Co-op tag in the bay lowers the Knot's toll on her runs.
- **Returns:** wet salvage, often scrap, sometimes first-fit.
- **Arc:**
  1. **Protein** (S-42).
  2. **The loan.** Mag offers the player water on credit during a shortage (section 13): 200 L now, 240 in a month, or a favour.
  3. **The favour.** It is named: carry three Widows-marked crates up to the Exchange (S-45). Mag does not ask what is in them
     either.

#### C-28. The Kostyk crew, Dive Hall, floor 7

*Oilcloth, a K on a rope.* A diving family of five: **Bohdan Kostyk** (diver, fifty, lungs going), **Lida** (diver, twenty-six,
his daughter), two cousins on the pumps, and a grandmother who keeps the rope count. They dive Line One's racks and the motor
rooms at slack water.

- **Likes:** straps, clamps, hose, cells for lamps, weighted belts, masks, food for after.
- **Accepts:** deliveries before the window only (slack water, shown on the tide strip).
- **Refuses:** anything late: after the window, they are underwater.
- **Pay:** **a share of the dive**: unpredictable, wet, sometimes extraordinary.
- **Gate:** none.
- **Returns:** dive shares: Works parts, chips in trays, a sealed Works tin of grease, a stair-door plate with a number on it.
- **Arc:**
  1. **Kit before the window** (S-44).
  2. **The motor room.** Bohdan wants to reach the motor room under Fan Room Three (02's late-game chain). He needs a better
     mask and a longer hose than they own. The player can fund the dive for a big share.
  3. **Bohdan stops diving.** His lungs. Lida asks the player to buy the crew's kit from her father so he can pay his water debt
     to Mag Tolley (C-27). The player now owns a dive kit, which they cannot use (no expeditions), and can lend.

---

### The Flats

#### C-29. Ruben Vass, the Landing, floor 4

*Cord and shell; the kid says it.* Ruben is not Tide Folk though born on the Strand (06a); he runs the Landing, the steel
platform where Flats boats tie up and the Tide Folk trade. Everything bought from the Flats goes through him, and he takes a
cut of everything.

- **Likes:** rope, sealant, waders, cells, water, medicine, Vitabrick.
- **Accepts:** any goods at the Landing within the tide window.
- **Refuses:** deliveries outside the window ("the Landing is a boat at high water and a ladder at low").
- **Pay:** salt, wrack (dried seaweed: packing filler, mulch, insect feed), salvage, knots on the tide cord.
- **Gate:** none; tide cord knots for better rates (kin-price at five).
- **Returns:** pan salt, wrack bundles, magnet finds, eel (to smoke on 16).
- **Arc:**
  1. **Rope and sealant** (S-49).
  2. **The Great Ebb.** Ruben offers the player a pitch at the Great Ebb market on the Exchange steps for one ebb: a temporary
     counter with Flats goods on one side and the player's on the other.
  3. **The Wall Book.** Ruben brokers between Hesper Quill and anyone who will buy the Wall Book (06a). He asks the player to
     carry a page, sealed, to the Archivists, as a sample.

#### C-30. Ma Senna Duku, salt-boiler and midwife, the Strand

*Cords with red thread: urgent.* Runs the brine pans on the roof of the old Strand post office (06a), boils salt, delivers
babies on the Flats. Her slips come rarely and matter completely.

- **Likes:** clean water, boiled cloth, soap, Vey fever tabs, wound film, cells for a lamp at night.
- **Accepts:** anything clean.
- **Refuses:** nothing offered for a birth.
- **Pay:** salt, poultices, knots, and the Flats' memory.
- **Gate:** none.
- **Returns:** frass poultices, pan salt, and, years later in game time, a Flats client who says "Ma Senna says you're good".
- **Arc:**
  1. **A birth** (S-50).
  2. **The fever.** In the Still, the Red blooms (07) and the Flats fall ill. Ma Senna asks for fever tabs by the hundred. Vey's
     price is 6 cr for ten in the Mills. Cracked DoseLock doses (grey) are cheaper and partly crushed. The player chooses what to
     send.
  3. **The salt.** Ma Senna offers the player her salt, regularly, at kin-price: the Flats salt chain (pan salt, rinsed twice,
     tastes of metal, 04) as a supply for curing, cheese, pickles.

---

### The strange

#### C-31. Static, the pirate radio, through Mina Szabo

*No paper; a voice at 23:00.* Static broadcasts from somewhere in the shafts (06b). Its notices and money are taken by **Mina
Szabo**, "the book", from a stall on the Shelf where she sells receivers (06b). Requests come over the air, with a lease number.

- **Likes:** tape, cells (founding-era best), aerial wire, receivers to give away, information (logs, readings, determinations).
- **Accepts:** deliveries to ledges in the Empty (never twice the same ledge).
- **Refuses:** to say where it is.
- **Pay:** **news**: events shown a day early; mentions on air that bring Fringe slips; the receiver itself (a 1x1 item that
  shows Static's broadcasts as an event feed).
- **Gate:** a **receiver** on the player's field (12 cr, 04) to hear requests at all.
- **Arc:**
  1. **Tape and a cell** (S-59).
  2. **The heat log.** Static wants Lasse Kowal's Dark Floors log (S-38) and asks the player to fetch it.
  3. **The broadcast.** If the player has delivered the requisitions (S-58) and kept a fresh cell, Static asks for it: to read
     the date code on air. What happens next is 14's to write.

#### C-32. STORES 17-C (the Clean Core, the Dark Floors, 22–26)

*Works requisition stock, warm.* Not a person, or not one anyone has met (02's main version: the Clean Core's automated
procurement still sends requisitions to Line Four stores, which is the player's lease).

- **Likes:** Line Four consumables: cleanroom gloves, lung plates, sync clocks, lens tissue, Works-numbered parts.
- **Accepts:** "ANY COND." always.
- **Refuses:** nothing; it never sends anything back.
- **Pay:** in the **next returning bay** from any client: fresh HW-9 cells, founding-era parts, Y40 Works scrip.
- **Gate:** the player's lease being the old stores cage.
- **Arc:** see 14. This file's job is the slip (S-58) and the pay: the requisitions pay better than any client in the Mills,
  in the one currency no client can offer (new founding-era stock), and every delivery makes the player a supplier to the
  thing behind the welded doors.

#### C-33. "Mr Dace", floor 52

*Too polite, no stamp.* A Brand Integrity Bureau agent (05) who posts **sting slips** across the Middle under different names:
"Dace" for Skywater bottles (03), "Mr Dace" for DoseLock (S-23), "Miss Dacey" for restored leather.

- **Likes:** grey goods, counterfeits, restored branded goods, offered for sale.
- **Accepts:** everything, and pays above the grey rate. That is the tell.
- **Refuses:** nothing.
- **Pay:** a charge: −50 Standing, a fine, goods seized (05).
- **Gate:** Std. 400 (a sting has to look like a Grid slip).
- **Arc:**
  1. **The sting** (S-23). Learn the tells.
  2. **The turn.** A player caught once is offered a deal by the Bureau: post Dace slips on Mills Fringes for them, and the charge
     is reduced. The player becomes the sting.

---

### The Company and the far clients

#### C-34. Halden Facilities, Mills Section, supervisor Gideon Pratt

*Grey Service Orders.* **Gideon Pratt**, forty-six, supervises chute clearing, lift greasing and meter rounds for the Mills
from a cubicle at the Hatch on 18. Posts the SERVICE row on every Mills board. Pays in scrip because the budget is in scrip.

- **Likes:** carriage, clearance, measurement, surveys, small repairs to Company plant by unlicensed hands it can deny.
- **Accepts:** anything on time.
- **Refuses:** invoices.
- **Pay:** scrip, mostly; "bonuses" in scrip that make the face value larger.
- **Gate:** Std. 200.
- **Returns:** store vouchers, a Service Commendation (+5 Standing, 1x1, a paper certificate that must stay on the field to
  count), and once a quarter a **permit day** (a free lane day).
- **Arc:**
  1. **Chute clearance and restock carriage** (S-53, S-55).
  2. **The survey** (S-54), then the logger (S-57). Pratt does not know what either is for. He is told to post them.
  3. **The offer.** At *Trusted*, Pratt offers the player a **Halden Service Contract**: a weekly scrip retainer for being the
     Company's handy shop on 17. Steady money, store money, and the floor watches the player become Halden's.

#### C-35. St. Ober's Spire, Procurement (late)

*Pale blue card, two languages.* The hospital tower, run by a charity that charges like a bank (00). Its procurement office buys
blood products, sterile supplies and, oddly, Mills-grown greens for its private wards.

- **Likes:** plasma (sealed, frozen, with chain of custody), sterile cloth, real greens for the private wards.
- **Accepts:** crossing-frame deliveries only, cold and sealed.
- **Refuses:** anything without a chain of custody form.
- **Pay:** very high, slow.
- **Gate:** Std. 700, a crossing frame, sealed cold bay.
- **Returns:** chain of custody forms (insurance gold, 04), expired surgical kit, a **referral card**: a Mills tenant sent to
  St. Ober's with this card is seen without the deposit.
- **Arc:**
  1. **Plasma** (S-62).
  2. **The referral.** The player can use the referral card for a neighbour, or sell it: 400 cr to anyone who needs an operation.
  3. **The buyers.** St. Ober's asks the player to take over a plasma route from a buyer who "is no longer with us". The plasma
     buyers (06b) are a faction, and they want to know why the hospital is talking to a workshop on 17.

---

## 11. Supply agreements: how the brands hold a supplier

Three clients write supply agreements: **Orrin** (insects, certified herbs), **Vey** (chitin, fat), and the **Glasshouses**
(on Greenhold's paper). All three use the same founding-era template, so all three behave the same way:

1. **Season one.** A fixed price above the open market, a guaranteed volume, and an **exclusivity clause**. The supplier stops
   selling that good to anyone else. Other buyers find other suppliers.
2. **Review.** At renewal the price is "reviewed" to 60–70% of the original, because there is no other buyer left at the old
   price and the brand knows it.
3. **Volume clause.** The agreement sets a minimum weekly volume. Short weeks are carried forward as a **shortfall** owed in
   the next week, at the agreement price, with a 10% "supply assurance" deduction.
4. **Exit.** Ending the agreement early costs a **termination fee**: four weeks' value.

**In play:** a supply agreement is a big, visible trade: steady money in exchange for a chain locked to one buyer. The player
can see every number in advance, including the review clause, which is printed. The trick is not hidden. It is just very
attractive in week one. **Alternative:** the review is not automatic but a slip that arrives at the season's end ("Orrin is
pleased to offer renewal at…"), with the option to refuse; refusing leaves the player with a chain built for a buyer who has
gone, and four weeks to find new ones on the board.

**Hook:** the Orrin template's small print still carries the founding-era Works supplier clause: "the Supplier may refer any
dispute to the Works Grievance procedure". The Old Hands say the Grievance Box (05, the Arbiter's third version) still reads
that clause, and has ruled for a supplier twice in eighty years.

---
## 12. What comes back in the bay

`IDEAS.md`: the drone "comes back with the pay and a reward in its bay (something to upgrade, to buy, or late on to fit
yourself)", and unpacking it is "a small mystery box played with the same handling". The lore rule that makes rewards
consistent is simple: **a client returns what it has and you don't.** The rich have offcuts of real things and the Company's
spares; the Middle has licensed goods and paper; the Mills have produce and labour; the Sump has the drowned plant; the Flats
have the bay.

### By band

| From | Typical returns | Rare returns | Why |
|---|---|---|---|
| **Crown** | real fruit (a lemon, a quince), real-wood boxes, glass jars with ground stoppers, stained real linen, candle ends (beeswax), party ice, kitchen leftovers (Pantry) | an apple; a toy with a founding-era controller; Apple scion wood; a supplier-list entry | the Crown throws out whole things it no longer wants, and its idea of a tip is a thing it would have thrown out |
| **Terraces** | staff meals, expired Vey stock, spent rockwool, Select bags, orchid keikis, receipt reviews | a recipe card; a referral; a Terraces reference letter; a sponsorship | Terraces people give services and paper, and things that have just expired |
| **Middle** | carbons, store groceries the Mills can't buy, laundry grey, lost property, exam papers | a Gap token; an exam entry waiver; a Middle client's discarded furniture | the Middle gives what its licences let it give |
| **Mills** | produce, greens chits, bread, mushrooms, labour (a mend, a reading, a shift), grade cards, market reports | a lending seed packet; an oven slot; a clock-signed repair | the Mills pay in work and food because they have no money |
| **Sump** | wet salvage, chits, a bolt from Saint Pump, a Spill bale | first-fit parts; a Ninefold or Widows seal; a dive share with Line One chips | the Sump has the drowned plant under it |
| **Flats** | salt, wrack, eel, magnet finds, poultices, tide-cord knots | a page of the Wall Book; a crate of Flats goods at kin-price | the Flats have the bay |
| **Halden** | scrip, vouchers, commendations, permit days | a Service Contract | the Company pays in itself |
| **The strange** | fresh HW-9 cells, Y40 scrip, founding-era parts, news | a pale mushroom; a drawing of your own floor | the Clean Core pays in what it makes |
| **Other towers** | Premium bulletins, chain of custody forms, Hulk salvage by pick-list | a Vantage acceptance | each tower pays in what it sells |

### Return paper

Some of what comes back is paper, and paper is items (05):

- **Receipt stub** (1x1). A Grid delivery's proof. Keep it for a dispute; burn it as fuel; or not. Ten receipt stubs from one
  client are what HCS asks for if the player ever wants that client as a sponsor.
- **Rejection slip** (1x1). The Assay's reason, printed: "Uncertified." "Grade S." "Trace salt." "Bay contaminated (R4
  condensate)." The single most useful piece of feedback in the game, and the most humiliating.
- **Remainder stub** (1x1). A half-kept promise with a clock on it.
- **Counter-slip** (1x1). The Middle's "held pending" offer.
- **Bay slip** (1x1). The next job, already claimed.
- **Thank-you card** (1x1). Crown and Terraces only, embossed, worthless to the player and worth **2–4 cr to the Voided**,
  who need real Crown card stock to forge Crown slips and provenance (section 1: card is hard to fake).
- **Spent Crown slip** (1x1). After delivery, the Crown card itself comes back with the receipt punched through it. Same value
  to the Voided as a thank-you card. A player who sells spent Crown cards to forgers is feeding the counterfeit slips that
  turn up on the Fringe with a crest on them and no household behind them.

**In play:** return paper is how the system teaches. A rejection slip says exactly why. A receipt review says how the client
felt. A bay slip says "again". The player reads their bay like a letter.

### How rewards are packed

Clients pack returns themselves, and they pack them like the people they are:

- **Crown staff** pack beautifully: cloth wrapping, straw, everything upright, every corner used. A Crown return fills the bay
  to the square and leaves nothing loose.
- **Terraces clerks** pack to policy: a sealed pouch, a printed list.
- **Middle shops** pack with carbons on top, the goods underneath.
- **Mills clients** pack what they have, loose, and sometimes the produce is crushed.
- **Sump clients** fill the bay. "Bay full on the way back" means the drone may come home heavier than it left and land with a
  thump.
- **Flats clients** pack wet. Wet salvage must dry before it can be analysed (06a).

**In play:** the unpacking puzzle varies by client for free: a Crown bay is a tidy grid to take apart, a Sump bay is a heap.

---

## 13. Events that change contracts

Every event below is announced (05's rule: the player is never blindsided without a rule to point at), and each changes the
board in a way the player can read the next morning. Most are read off the building's own clock (02) or the season (07).

### Outages

- **Slack hour** (twice a day at slack water, drifting with the tide). Mills sockets shed. Launch pads on the Mills grid cannot
  charge. Drones launched in the hour before must carry charge for the round trip. **Board:** none. **Contract effect:** an
  11:30 Lantern Row deadline in a week when slack falls at 09:00 is a different job.
- **Dawn slack** (unpredictable). Sockets dead until 09:00. The first launch of the day is late for everyone; HCS does not extend
  deadlines. **Board:** Fringe slips for charged cells appear by 08:00 at 3 cr a cell over price.
- **Gate down.** A band gate's reader fails ("Thirty read offline"). Lane traffic queues for hours. HCS declares **force
  majeure** for Grid slips whose **client** is above 60. Mills clients' deadlines run. **Board:** riser slips multiply; rats
  double their price; the Drop board writes "GATE DOWN" in letters a metre high.
- **A Dark** (a rerun of the Long Dark of Y70, 01; rare). The Bus fails below 30 for a day or more. Lanes are dead; risers are
  the only way. **Board:** HCS does not post. The Fringe is the board. Everything in demand is light, cells, food that keeps,
  water.

### Inspections and enforcement

- **Tasters on fifteen** (food and water inspectors working the Mills, 02). For the day, slips that would put grey water or
  pressings on a shelf are risky; slips that send them **away** in a drone are suddenly popular (05: a drone in flight is off
  the field). **Board:** Fringe slips for "a bay, any destination, today" at 5 cr.
- **Clean Lanes Week.** HPS and the Bureau scan every bay at every gate, not just samples. **Board:** Middle and Terraces slips
  that accept grey goods vanish; Lane only slips pay 20% more because fewer suppliers risk them; riser slips multiply.
- **Bureau clearance day** (02). A West Chute event: an evidence room voided and dumped. **Board:** the next morning, Fringe
  slips from the Voided for restorers, and Hester's regard pip twitches.
- **Courtesy inspection notice.** The slip arrives the morning before. **Contract effect:** a contract that would take the
  player's still off the field for the inspection hours (the still packed in a bay as cargo and flown to a client who "holds"
  it) is a classic grey job.

### The Crown's parties

The Crown's social calendar is the contract board's weather above 90:

- **Founders' Night** (the old Founding Day, first week of the year). The Daunts' **Long Table** at the Assembly. Two weeks of
  Crown slips for white flowers, linen, ice, eggs, real butter, candles; the Postern's Assay queue doubles; the Ninety Gate
  stays open until **23:00** for one night only. The morning after, the North and East Chutes drop the richest catch of the
  year. **Board:** Crown ghosts multiply; repinned Crown fall-downs reach the Middle and the Mills a day later at three
  quarters of the pay.
- **Quince Night** (late in the Ninth Month, the Turn). The Vellacotts' autumn table at Orchard House: fruit, real. The Apple
  has not set fruit in three years; the household orders Greenhold apples by courier and needs a supplier who will not ask (C-01).
- **The Lantern Ball** (the Ninth Month, Halden's own). Lane traffic for the Lantern takes priority; Mills lane launches are held
  for an hour at each gate all afternoon. Mills clients' deadlines run.
- **Christenings and weddings** (unscheduled; announced by Static before the Crown's own staff know). One household's slips at
  a time: real water (03), flowers, real cloth, a cake that needs eggs.
- **The day after.** Any Crown party is followed by service slips (S-09): laundry, mending, glass repair (a chipped crystal
  glass, sent down to be ground smooth). Good pay, short deadlines, real goods passing through Mills hands and back up.

**In play:** the Crown's parties are the rich days of the year for a player who can serve the top, and they are announced
weeks ahead on the Crown ghosts. A player who prepares (a Kestrel, a cold liner, a certificate, Std. 850) gets one big week.

### Festivals and days below

- **Rain days** (forecast a day ahead by the Sounding, 07). Rain Church slips flood the board (06a); vessels, carriers, Fonts;
  the Wet Sabbath. **Board:** empty vessels are worth twice their price for a day. Skywater posts "unauthorised abstraction"
  reward slips (report a catch, 10 cr) at the same time.
- **The Great Ebb** (twice a month at springs). The Flats' deep streets show. Flats slips multiply: rope, magnets, waders,
  lamps. Salvage arrives in quantity the next day; salvage prices fall in the Stack.
- **Wall Night** (the 19th of the Third Month, the Drowning's anniversary). Flats berths light lamps on every roof. **Board:**
  candles, tallow, lamp cells, by the hundred, to the Landing, by low water. Pay in salt and knots. The Company posts nothing.
- **The Swap** (every seventh day, 19). Co-op slips for "bring to the Swap" goods; the buying slips on the Fringe for chute finds
  fill up the day before.
- **Catch Day** (the anniversary of Chute Day, Y60, 01). The Mills' own holiday: catches are left unemptied for one morning and
  everything that falls is shared on the floor. **Board:** the Fringe is full of slips that ask nothing and offer food.
- **Founders' Day Offers** (the Company's version of Founding Day, below 90): the store and Halden Facilities post Service
  Orders with "Founders' bonus" scrip (+20% face value, 30-day expiry instead of 90).
- **Heritage Week** (the Company's; irregular since Y76, 01). Halden Select posts "Mills Heritage" slips (baskets, carved toys,
  "authentic Mills tools") at 3 cr a piece.

### Money days

- **Rent day** (every seventh day; 04). The Fringe swells with selling slips ("Selling: a grow lamp, 20 cr, today"): the floor
  is short of money. Buying slips pay less. **In play:** rent day is the best day to buy and the worst to sell.
- **Halden payday** (days 1 and 15). Scrip floods the Mills. Slips that pay "sc ok" multiply; the street rate falls.
- **Store restock** (day 10). Store goods are back; the grey prices for filters and cells dip.

### Strikes, shortages, recalls

- **Lift strike** (Y78 precedent: twelve days, 01). Old Two stops. Machines cannot arrive. Every small thing moves by drone.
  **Board:** lane fees triple; HCS posts three times the slips; rats are booked out; freight chits are worthless for the strike.
  The best weeks of a drone owner's life.
- **Co-op rent strike** (06a's "Hold your rent"). The Co-op slips stop paying in credits. The Lift Guild posts "Strike notices"
  carriage (Co-op standing to *Hostile* if you take it). Halden posts "Essential services" Service Orders at double scrip.
- **Water shortage** (a Waterhouse fault, the Red in the Still). Water slips at every band; Mag Tolley's wet loans; the Rain
  Church gives, Skywater raises prices, Middle laundries buy grey at any price.
- **Vey recall.** A batch of DoseLock is recalled. Cracked DoseLock doses (grey, 04) double in price for a week; Dace slips (C-33)
  appear the same morning.
- **Orrin price review.** Every quarter. PRICE UNDER REVIEW stamps appear on the Press's slips a week ahead. Insect intake prices
  fall; slab and pressings slips on the Fringe rise as ranchers look for other buyers.

### Reclassification: the Chalk moves

The biggest slow event (02, 04). When the Chalk moves a floor down, the board changes before the rent card does:

1. **First,** Middle-styled slips appear on the Mills rows from the new floor's tenants: Middle rules, Mills goods, Mills prices
   (S-25).
2. **Then,** Survey and Allocation Service Orders (S-54): measuring.
3. **Then,** petitions for "standards" (C-16): no stills, no bins on family floors.
4. **Then,** the rate card.
5. **Then,** Mills clients on the reclassified floor post **removal slips**: carriage of a whole lease's goods down to a cheaper
   floor. Good pay, a full bay, and the player is helping the neighbourhood leave.

**In play:** reclassification is visible on the board weeks before it hits the rent, so a player who reads slips can see it
coming and choose: serve the newcomers (Middle pay), serve the leavers (removal carriage), or move down early before the rate
card catches up.

### Storms and seasons (outside routes)

From 07: the **Blows** close outside routes on storm days and fill the board with storm-repair slips (filters, sealant, cells);
the **Murk** is smuggling season (poachers blind, crossings slow, Lee contracts); the **Still** brings Crown luxury slips, Pier
contracts and cold-bay work; the **Turn** is the crossing and salvage season. A crossing slip's deadline is suspended for storms
only for Grid clients above 60.

---

## 14. Contract paper and kit: the items

Everything the contract system adds to the inventory, so 10 can list it with the rest:

| Item | Size | Where from | What it does |
|---|---|---|---|
| **Slip** (Grid / Fringe) | 1x1 (Crown rigid; Sump plate 1x2; Flats cord 1x2) | the board, the bay | the contract; packed in the bay to assign it |
| **Stub** | on the board | the clip | shows a Grid slip is taken |
| **Remainder stub** | 1x1 | returning bay | a partial delivery's rest, with its own deadline |
| **Receipt stub** | 1x1 | returning bay | proof of delivery; dispute evidence |
| **Rejection slip** | 1x1 | returning bay | the reason a delivery failed |
| **Bay seal** | 1x1 (fitted) | the store, 1 cr | numbered single-use tag; evidence; required by the Mutual |
| **Consignment carbons** (pad of 20) | 1x1 | the store, 2 cr | write a manifest, pack the top copy, keep the carbon: dispute evidence |
| **Form CD-4** | 1x1 | Thirty Station, 5 cr | Notice of Delivery Dispute |
| **Supply agreement** | 1x2 | Orrin, Vey, Glasshouses | must stay on the field while it runs |
| **Supplier questionnaire** | 1x1 | Vey | must go back filled in |
| **Seed declaration** | 1x1 | Glasshouses | rides with R✓ produce to Greenhold buyers |
| **Clearance card** (Vellacott, party) | 1x1 rigid | Crown households | lets a drone past the Postern to a household pad; must come back |
| **Freight chit** | 1x1 | Lift Guild | the drone rides a car |
| **Gap token** | 1x1 | the Amblers | a riser drone skips the Turnstile at 41 |
| **Bolt from Saint Pump** | 1x1 | the Moat | softens the Knot's trouble roll |
| **Passage** (Wren, the Pumpmen) | none; a timed state | Fringe slips | toll nets / the Knot let the player through for a week / a month |
| **Market report** | 1x1 | Crane & Ossory | the Shelf's morning prices |
| **Grade card** | 1x1 | Arkwright | a cell's real capacity |
| **Reading card** | 1x1 | Mattias Orme | an item's hidden features, read by hand |
| **Thank-you card / spent Crown slip** | 1x1 | Crown, Terraces | 2–4 cr to the Voided |
| **Logger** | 1x1 sealed | Lane Services | logs every route flown |
| **Board mark** | chalk | the player | marks a Fringe slip as taken |

---

## 15. A morning at the board

07:00 on floor 17, a Thursday in the Turn. The Whistle has gone (four minutes early) and the Morning Fall has banged through
every catch on the floor. The tap queue at 17-C3 is still forty long. Noor Halvorsen comes off Old Two with her satchel,
nods at Hester (who is already standing by the board, as she does every morning, with her hands behind her back), and pins.

Row one, CROWN 90+: a single cream card with a silver hound, red pip, 850. *The Long Table is in three weeks*, the player
thinks; there will be more. Row two: Hob Seventy-Five, basil, NO LATE in red, a 600 pip that is still red. A Vey slip for
chitin, also red. Row three: Ambler & Daughters, tomatoes, quietly, a white pip; the Ashdown-Kerrs, a cot, "we checked last
time"; a Middle slip with no stamp at all asking for DoseLock, and the player's eye slides over it the way it now slides over
anything too polite. Row four: Crane & Ossory, chillies by the two hundred, c/o. Row five: Tamsin's fuel, with flour on it;
the Press, PRICE UNDER REVIEW; Piet Arkwright's tiny neat print. Row six: SERVICE, Halden Facilities, the player's own catch is
jammed again and the Company will pay thirty scrip for the player to clear it.

The Fringe: a tin lid with chalk on it from Wren (rope, a week of passage); a Co-op form from Yusra (soft grey, before nine);
a warden's yellow carbon (a clock key, size 6 or 7); a strip of Static's thermal paper somebody copied from last night's
broadcast and pinned up for whoever it was meant for; a Vitabrick wrapper that says *Mag says protein twenty kilos* with DNB
chalked beside it twice and crossed out once. In the corner Noor doesn't clear, a grey slip with a faint grid in the paper,
in a hand that is very young or very old, asking for seeds of anything that will grow in the dark.

Clip 48, which HCS never uses, has a slip on it. Dot-matrix. Warm.

The player has a Wren with a 3x2 bay, Standing 340, 61 credits, 30 scrip that expires in nine days, a catch full of
somebody's party, and twelve hours.

---

## Loose threads (for the designer)

- **One number or many?** This file assumes one Standing (04) plus a light client ledger (four words) and faction standing
  (06a). If that is too many ledgers, client standing can collapse into "has sent a bay slip / has not".
- **How many slips a morning?** 8–14 Grid plus 2–6 Fringe is a guess. A Wren can fill one or two a day; the board should
  always offer more than the player can do, so choosing is the game.
- **Repinning (fall-downs)** is new in this file. It needs a check against 04's prices: does a repinned Crown slip at three
  quarters of the pay still beat Mills work after the lane ticket?
- **Service slips** (goods come down, are worked, go back up) are new: laundry, mending, linen. They make the bay a two-way
  container and turn the workshop into a service. Worth testing whether this is one mechanic too many.
- **The claim registration fee and the informing slips** (S-27) make claiming a moral act; is that too punishing in a game
  where reading the slip before tearing it is the only defence?
