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
