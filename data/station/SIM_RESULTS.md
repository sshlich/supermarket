# Station sim, first results (2026-10-16)

`node scripts/station-sim.ts [phase] [days] [runs] [sellerMult] [customerMult]` plays the phase slice
(`data/station/slices/phaseN.json`) with three bots over 14 days: `walkin` (trades with the line), `orders` (also fills mail
orders from stock), `maker` (also runs machines and buys the ones that pay). It models residents, needs-driven buyers,
sellers, budgets, rent, orders with boxes and transit, recipes with energy and cells, and upgrades. It does **not** model
events, the market index, the tithe, traders, the recycler or the charger, nor any sourcing channel for salvage, haul or crate
items (the data names the channels but gives them no rate). The numbers are a first read, not tuning.

Phase 1, 100 runs, 12 customers a day, rent 5, start 50 credits and 141 of stock:

| | walkin | orders | maker |
|---|---|---|---|
| Day 1 net | +42 | +41 | -58 (buys bench, smelter, purifier) |
| Steady net per day (days 4 to 14) | +3 to 5 | +2 to 5 | about 0 |
| Gross sales per day (steady) | 22 to 29 | 20 to 26 | 20 to 25 |
| Cash on day 14 (median) | 228 | 234 | 31 |
| Runs that went negative | 0% | 0% | 26% |
| Wants a customer left without | 14 a day | 15 a day | 15 a day |
| Mail orders filled | 0 | 0 | 0 |

What it says:
1. **There is no growth engine in phase 1.** After the starting stock sells off on day 1, a stall nets +3 to 5 a day. The
   ECONOMY.md target is 20 to 200. Same finding as the old sim, now on the new data.
2. **Machines do not pay back in 14 days.** The maker buys the bench, smelter and purifier on day 1 (210 credits of 50 plus the
   stock sale) and ends with less cash than walkin, with no extra income. Median recipe margin in phase 1 is 1.33x and the
   outputs still have to be sold through the same line.
3. **No mail order is ever filled.** About 3 arrive a day; 1.4 expire a day. The bots hold the right items by chance only,
   and no machine makes what the orders ask for. Orders need a directed way to get the goods (a crate or wholesale channel
   the player can order from, or orders that want one or two common things).
4. **Volume is the lever, as before.** Doubling the line to 24 customers a day roughly triples steady net (+10 to 14);
   tripling gives +17 to 23 for walkin, and the maker then pulls ahead of nothing but starts to make jobs (1.7 a day).
   More sellers (x2, x4) did nothing: supply is not the limit, demand per unmet need and margin are.
5. **The data names channels with no rate.** 35 items arrive by `salvage`, 9 by `crate`, 6 by `haul`. Nothing says how many
   a day, at what price, or by what action. The sim cannot play them. This is the design gap to close next.

Decisions this points to: how raw goods reach the player (a daily salvage sweep, a terminal crate order, haul deliveries),
how big the line is in phase 1 (10 to 14 is too small at these prices; 20+ shows growth), and whether machine jobs should
have a better margin or cheaper crates in phase 1.

## Night outside, wired in (2026-10-16, searches and the tool slot 2026-10-19)

The sim plays STATION.md 8b from `data/station/outside.json` (on by default; a sixth argument of `0` turns it off).
Going out costs **no energy** (it is after hours). Every bot makes one outing a night, to one site or one shop, and brings
one pack home.
- **Sites have searches.** Each search draws one entry from the loot table by weight. All the finds are revealed, and the
  pack takes the dearest per square at the end.
- **The body has two slots: the pack and one tool.** A locked site needs its tool in the slot. At an open site the slot can
  hold a bonus tool for more searches. Tools wear one use a visit, and a refill is used up.

| Site | Lock | Searches | Per search | Mean visit |
|---|---|---|---|---|
| Spine ducts | open (torch: +2) | 6 (8) | 2.45 | 14.7 (19.6) |
| Dark bunks | torch | 3 | 7.14 | 21.4 |
| Works slag heap | open (wrench: +2) | 8 (10) | 1.78 | 14.3 (17.8), but 3 squares a search fills the pack |
| Dead scrubber bay | mask refill, used up | 5 | 2.71 | 13.6, less 4.4 for the refill |
| Core cableway | wrench | 3 | 6.20 | 18.6 |

- **The pack** starts at 4x4. It is counted in squares, not packed as a grid. Upgrades are 5x5 for 45 and 6x6 for 140,
  bought after two nights home full.
- **Three shops.** The scrap yard takes anything at 0.35x. The dock counter sells haul goods at worth with a daily restock
  and takes parts at 0.5x. Works hardware sells the torch, the wrench, refills and cells at 1.1x and takes tools at 0.5x.
  A shop visit buys at most one tool, the one that makes the best night.
- **The Company Store** sells crate goods at 1.25x by freight the next morning, and is not an outing (the maker only).
- A bot keeps 4 of each thing for the line and its orders; the rest is surplus for a shop's floor. Finds have no cost basis,
  so `net` counts them only once they sell. `held` is everything in stock at its value.

Phase 1, 200 runs, the line at 3 to 7 (phases.json); steady means days 4 to 14:

| | walkin | orders | maker |
|---|---|---|---|
| Steady net per day, outside off | +0.1 | +1.0 | -2.6 |
| Steady net per day, outside on | **+16** | **+18** | +1 |
| Gross sales per day (on) | 30 | 31 | 31 |
| Cash on day 14, median (off / on) | 167 / 321 | 174 / 315 | 40 / 71 |
| Finds brought home a night | 22 | 21 | 21 |
| Stock held on day 14, at value | 151 | 151 | 234 |
| Line doubled (6 to 14): steady net | +24 | +26 | +12 |

What it says:
1. **Outside carries phase 1.** With no trips a 3 to 7 line nets nothing after the starting stock; one outing a night gives
   +16 to +18 a day, just under ECONOMY.md's 20 to 200. Day 1 is -11 because every bot spends its first night and 31
   credits buying the torch.
2. **One site still wins.** The outings went to the dark bunks 93% and hardware 7%, and nothing else was ever worth a night.
   The bunks (21.4) beat the ducts with a torch (18.7 after wear) and the cableway (18.1), and the bot always takes the
   best. Even with the options close, nothing changes from one night to the next, so the pick never changes either. The
   searches and the tool slot are the levers for tuning; what makes nights differ is a design question (STATION.md 8b,
   open).
3. **The tool slot settles the buy.** Every bot buys the torch, and almost none buys the wrench (1%), since with one slot
   the second tool only helps on a night it would beat the torch.
4. **The maker is still behind** (+1 a day). Its outputs go through the same small line, as before.
5. **Mail orders are still never filled.** Nothing at the sites matches what the orders want.

Not modelled yet: needs gauges moving shop prices, machines bought in person (second-hand, with statuses), real grid
packing, site danger or events, and phase 2 to 4 sites (cell husks, dead appliances and the zippo are phase-2 salvage with
no site).
