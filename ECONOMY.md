# The economy (`inventory-v3`): a design, nothing here is built

Agreed 2026-10-14. `DESIGN.md` is what exists; this is where the money is going. Numbers are **starting guesses to be
tuned by the sim (section 9)**, not decisions. What the user decided, in their words: customers should be probability
driven and end each day in "economics, adjusted profits, margins"; swap must work; hoarding then dumping must be a
real, limited move; markets and events that disrupt or give a chance to sell with extra markup; ads are later; "general
economy" over relations (no regulars or standing); money sinks must feel good and change how you play; a day may run on
hours. Nothing here brings back spoilage, appraisal or a real-time clock.

## 1. The one idea

Today everything is reactive and memoryless: each customer is a fresh dice roll, a flip doubles your money, cash goes
nowhere. The fix is **a market that remembers what you did** (prices, demand), **a day that ends in numbers**, and
**things to spend on that change how you play**. Three loops, each feeding the next:

- **Trade loop** (per customer): acquire from sellers and traders, sell to buyers; margin comes from the spread.
- **Market loop** (per hour): your sales and dismissals move prices and demand; events shock them; both revert.
- **Growth loop** (per day): net profit buys sinks (capability, information, space, tiers) that widen the trade loop.

## 2. Time: hours without a clock

A **day is 10 hours; an hour passes when a customer leaves** (served or dismissed). So time moves only by serving people,
which keeps "no clock", and the dial gives a day a visible end. The closing summary (section 7) fires after hour 10. Later
things that need time (candles burning down) hang off the hour tick.

## 3. The market (`market.ts`, pure like `customers.ts`)

Per tag `t` (food, drink, alcohol, medicine, light, book, fuel, valuable) the state holds:

| Symbol | Meaning | Start |
|---|---|---|
| `p_t` | price index; a thing is worth `worth × p_t` (worth is the kind's base price plus parts, as now) | 1.0 |
| `u_t` | unmet pressure: customers of this tag who left with nothing | 0 |
| `D_t, S_t` | demand and supply multipliers from live events | 1 |
| `flow_t` | expected $ of this tag moving per day (scales with phase and customers, makes impact scale-free) | by phase |

Each hour, for every tag:

```
target_t = clamp( D_t / S_t * (1 + u_t), 0.5, 2.5 )
p_t     += 0.25 * (target_t - p_t) + noise(sigma ~ 0.03)        # half-life about 2.4 hours
u_t     *= 0.9                                                    # fades; +0.06 per customer of t sent away empty
```

When you deal `value` (in worth × p_t) in a tag: `p_t -= eta * value / flow_t` for what you sell (supply into their need
lowers demand pressure), `p_t += eta * value / flow_t` for what you buy from sellers (you bid for goods). `eta ~ 0.5`.
Because impact is a fraction of the day's flow, the same rule works in every phase.

**Arrivals.** The next customer's tag draw is weighted by `w_t = D_t * (1 + u_t) * ad_t` (ads are later; 1 for now), so
unserved need brings more of those buyers, and a surge steals customers from the other tags (a fixed pool, so no tag is
always best). A seller's goods are drawn by `p_t / price` (they bring what is currently pricey, cheap things more often,
as now), and **weighted by your bank** so a $48 cheese wheel does not walk in when you hold $50.

**Roles.** Buyer / seller / trader keep today's mix at the start (50/30/20). When your stock of a tag is empty, buyers of
that tag still come (that is the missed sale you see in the summary); when the inside counter is flooded, sellers thin out
(you are not buying).

## 4. The deal: ceilings, asks, counter-offers (fixes rigid customers and swap)

Today a buyer pays `worth × rate` flat, a seller asks a flat fraction, a trader needs 80% of what they brought and says
nothing useful when it fails. Replace with ranges drawn per customer and answers that show the gap:

- **Buyer:** a hidden *ceiling* `c = worth * p_t * (1 + m)`, `m ~ N(0.25, 0.12)` clamped to [0, 0.6]; their `budget` still
  caps it. They pay `c` for what they want. If budget is short they say how much they have (as now).
- **Seller:** asks `worth * p_t * (1 - d)`, `d ~ N(0.20, 0.10)` clamped to [0, 0.4], for the lot (as now).
- **Trader:** gives X for Y at market (`p_t`); accepts if `value_in >= value_out * (1 - slack)`, `slack ~ [0.1, 0.3]`, and
  **the gap is paid in cash either way** (you top up, or they do). A near miss is never a dead end.
- **Every no says why and how far:** "add about 6$ more", "I only want the medicine, not the book". The button's tooltip
  shows the live gap before you press (the interactive-visibility technique).

The sim sets the realized margin: target **35% gross at the start**, rising with information and the workbench.

## 5. Events (a tag shock, a duration, a rumor)

One shape for all: `{ tags, demand: D, supply: S, hours, rumor? }`. The shock is full for its first third and decays
linearly to 1. Frequency about one per day, at most three at once (live or announced).

| Event | Shock | For the player |
|---|---|---|
| Fever | medicine D x2 | stock up before, sell dear during |
| Convoy | one tag S x2.5 | sellers flood in: a buying window, prices crash |
| Cold snap | fuel and food D x1.7, light D x1.3 | co-moving tags |
| Blockade | one tag S x0.4 | what you hold gains value |
| Festival | alcohol and valuable D x1.8 | |
| Raid | one tag D x0.5 and sellers dump it | a bad stretch to wait out |

**Rumors.** A rumor reaches the terminal 2 to 4 hours before some events, and is wrong about 25% of the time (a rumor of
a fever that never comes). That makes hoarding a decision under risk, not a trick; the dump impact in section 3 caps what
a hoard can win.

## 6. Progression: four decades

Equal time per order of magnitude is what feels like steady progress. **Target: net/day x10 every 8 days**, so
`net(day) ~ 20 * 10^(day/8)`, bank at 2 to 5 days of net, ending near the cash dial's 6-digit limit (~$800k) after a
32-day campaign.

| Phase | Net / day | Bank | New | What constrains you |
|---|---|---|---|---|
| I Scraps | 20 to 200 | 50 to 800 | flipping, the starting goods | capital, cells |
| II Trade | 200 to 2k | to 8k | market board, events, rumors, wholesale | information, timing |
| III Workshop | 2k to 20k | to 80k | workbench, ads, the expensive tier | throughput, space |
| IV Concern | 20k to 200k | to 800k | top tier, staff, big events | market depth |

Each decade's x10 is a **growth budget** shared by levers, none carrying it alone: goods tier ~x4 (goods must scale about
x4 per phase, roughly $4 / $40 / $400 / $4000 for a typical thing; the current $1 to $60 ladder covers phases I and II, the
rest is content to make), customers per day ~x1.5 (10 to 25), margin ~x1.5 (35% to 60%). Overhead (rent) steps with the
premises: about 5 / 50 / 500 / 5000 per day, roughly a quarter of the median net.

## 7. Sinks: new verbs and new sights, not percentages

Principle: **field cells are the scarce resource**, so a bought thing is a placed item that competes with stock for room
(workbench or ten more potions). **It arrives as a crate on the outside counter an hour after you order it on the
terminal; you unpack and place it.** Price of the n-th sink about `2 to 4 x net at unlock x 1.5^n`; income sinks pay back in
4 to 8 days, capability sinks need not.

| Sink | Kind | Phase | Price | Effect (the visible number) |
|---|---|---|---|---|
| Extra window | handling | I | 30 | `MAX_WINDOWS` 4 to 5, 6 |
| Radio | information | I | 40 | rumors 1 hour earlier and 10% likelier right |
| Display case 2x3 | local multiplier | I | 60 | what is inside raises buyers' ceilings 10% |
| Workbench 3x2 | new verb | I | 150 | refill, bundle, repair: +25% worth on made goods |
| Ledger program | information | II | 200 | the day summary by tag and event |
| Market board | information | II | 350 | live `p_t` and trend arrows on every tag chip |
| Wholesale account | a channel | II | 300 + 8% a deal | order any tag at `p_t`, delivered next hour (a price ceiling) |
| Ads | demand lever | III | ~50 a block | `ad_t` x1.6 for one tag for 6 hours |
| Forecast program | information | III | 1,200 | rumors 4 hours early, 85% right |
| Bigger shop | space | III | 12,000 | field 25x20 to 30x24, rent steps up |
| Hireling | handling | IV | 6,000 | serves a fixed tag at a fixed rate while you do something else |

## 8. Making the numbers visible

- **Bank dial**: counts up to the new figure, a `+12$` floater per deal; a thin **goal bar** under it shows progress to
  the cheapest sink you do not own. Always something within 1 to 2 days.
- **Tag chips** show a price arrow (needs the board); the **news line** on the terminal shows events and rumors.
- **Tooltips**: an item shows what you paid and the margin if sold at the current ceiling; a customer's reply shows the
  gap; a hoard shows what dumping it would do to the price.
- **Closing summary (the day's numbers)**: revenue, cost of goods, gross margin %, overhead, **net**, change in stock
  value, **missed sales** (3 wanted medicine, you had none), and which event moved what ("fever +40% medicine").
  Each item gets a `cost` when acquired (price paid, or 0.7 x worth for the starting goods), so margin is per sale.

## 9. Tuning: the sim, the targets, the objective

`scripts/econ-sim.ts` drives `customers.ts` and `market.ts` headless (no page) with four bots: **accept everything**,
**max margin**, **speculator** (uses rumors) and **idle**. It runs 10,000 customers and prints the table below; the loop
is "change a knob, rerun, read the table", then a random search over the knobs
(spread `m, d`, customers per day, `sigma`, event rate, `eta`, sink multiplier, tier step) minimizing
`sum w_i (metric_i - target_i)^2`.

| Metric | Target |
|---|---|
| Time per x10 in net | 8 days, +/- 2, the same in all four decades |
| Day 1 net from the $50 start | about +20 |
| Bank / daily net ("runway") | 2 to 5; over 8: sinks too few or cheap; near 1: starving |
| Losing days, normal play | 5 to 10% |
| Skill spread (max margin vs accept everything) | 2x to 3x, and accept everything stays positive |
| Top tag's share of profit | under 40% |
| Customers served (got what they came for) | over 70% |
| Events per day / share of upside a prepared player takes | about 1 / 40% or more |
| A hoard held versus flipped (non-event) | flipping wins; the hoard wins only on rarer events |

Failure modes the sim has to catch: **runaway compounding** (impact per tag caps it, so growth must come from variety and
tiers), **a dominant flip**, **soft-lock** (cash zero and nothing sellable: there is always a cheap seller and starting
stock), **plateau** (sinks outrun income), **a pile of cash** (nothing to spend on).

## 10. Build order (stop and play after each)

0. **Swap and the deal** (section 4): ranges, gap readout, cash top-up. The smallest, and it fixes what is broken.
1. **The sim on today's rules**: the baseline numbers (a flip doubles money now; this measures it).
2. **`market.ts`**: `p_t`, impact, reversion, weighted arrivals; saved with the field. Chips show nothing yet.
3. **Hours, the day, cost basis and the closing summary**; rent.
4. **Events and rumors** with the news line.
5. **Sinks, one flavor at a time**: radio (information), then workbench (verb), then display case (multiplier); crates
   arrive on the counter. Market board and wholesale with the second phase.
6. **Higher goods tiers** (content) and capital-weighted flow.

## Open questions, with defaults

- Does a hoard come out of the stock you can *see* (the field only), or is there off-field storage? Default: field only.
- Do trader customers also need ceilings, or is the slack enough? Default: the slack.
- Ads: price per block or a subscription? Default: per block, subscriptions later.
- The wired terminal hosts Ledger, Board, Forecast and the order form as programs: one program each on a disc (the
  discs exist). Default: yes.

## 11. First sim results (2026-10-14; `npm run sim [days] [runs] [market] [customers per day]`)

Built so far: the deal rewrite of section 4 (`customers.ts`, live in the game, not yet play-tested), `market.ts` (not wired
into the game), and `scripts/econ-sim.ts` with three bots (`all`: accept everything; `smart`: takes only good asks and
offers the best fitting item; `spec`: smart plus rumors and holding). 300 runs x 12 days, 10 customers a day, $50 start.

| | Old rules | New deal rules | + market, `all` bot |
|---|---|---|---|
| Round-trip spread (buy from a seller, sell to a buyer) | 2.0x | 1.56x | same |
| Gross margin, realized | 40% (smart) | 35% | 33 to 35% |
| Net / day, day 1 -> day 12 | 4 -> 16 | 5 -> 12 | 6 -> 14 |
| Buyers who got everything they asked for | 10 to 20% | 10 to 18% | 9 to 13% |
| Cash at day 12 | 160 | 128 | 163 |

What it says:

1. **There is no growth engine.** Net per day is flat at about $10 to 15 for twelve days, and cash just piles up (an idle
   $320 by day 12 at 20 customers). That is the missing sink side, now measured: without things to buy, a good day 1 is a good
   day 12. This confirms sections 6 and 7 as the next real work.
2. **The constraint is matching, not margin.** Only 10 to 18% of buyers leave with everything they came for, because
   they ask for one to three of eight tags and the bot's stock rarely covers them. Cutting the spread to 35% hardly changed
   net. What moves it is volume and coverage: **net scales with customers per day almost exactly** (10 customers: $14, 20:
   $31 by day 12). So the real knobs are customers per day, wants per customer, and how many kinds cover each tag
   (`valuable` and `book` have one or two kinds each and make 2 to 3% of revenue: there is nothing to sell).
3. **The targets in section 9 were too rich for the phase I goods.** With a $1 to $60 ladder (typical item $4) and 10
   customers, day 1 supports about +$6, not +$20; 20 customers gives +$16. Revised phase I targets: **day-1 net +10 to 15
   at 15 to 20 customers a day**, or keep 10 and make the starting goods dearer. Decide in the next milestone.
4. **The market is calm until an event hits** (medicine alone, 100,000 hours): the index sits at 0.95 to 1.04 for half the
   time, 1.61 at the 95th percentile, 2.39 at the highest, 0.50 at the lowest. About 0.75 events a day, with a rumor
   showing 17% of the time. The clamps are both reached, which is the intended range.
5. **Speculating on rumors pays a little, and picky play loses to volume.** With the market on, `spec` earns about 10%
   more than `smart`, but the naive `all` bot beats both (about +40% over `smart`): taking every deal and selling to anyone
   beats waiting for good asks, because volume is the constraint. Rumors and holding need a bigger payoff (larger
   shocks, or stock that cannot be replaced) before they matter, and the dump brake is not yet binding (eta may be too
   small, or `FLOW` too big, for hoards this small).
6. **Services you are not yet measuring:** hoarding, the sink prices, losing days (near zero: 0 to 3%, below the 5 to 10%
   target, so there is not enough risk yet), and the day-end overhead.

Next knobs to try with the sim: customers per day and wants per customer (volume), a few more kinds per thin tag, larger
event shocks, a smaller `FLOW`, and a rent that makes a bad day cost something.
