# Task 10: people, mail and events (residents, orgs, orders, events and rumors)

Read first: `../SEED.md` (6.17-6.20, 8), `../ids.json`, `STATION.md` sections 3, 7, 8, 11, `ECONOMY.md` sections 3-5.
**Wave B: start only after tasks 1-9 have written their files.** Read every `items.*.json`, `discs.*.json` and
`systems.json` that exists; reference their IDs freely.

## You own and write
`residents.json`, `orgs.json`, `orders.json`, `events.json`.

## Scope and targets
| File | Target | Schema |
|---|---|---|
| residents.json | the 12 reserved | SEED 6.17 |
| orgs.json | the 7 reserved | 6.18 |
| orders.json | 70-90 | 6.19 |
| events.json | 45-60 | 6.20 |

## Residents
Copy the deck; write roles, budget (phase 1 credits; spine 3-12, ring 40-150), wants over all 8 needs (deck-shaped),
`prefers_tags`, `buys` (5-12 named favourites each), `sells` (sellers and traders: 8-20 items each), `contraband`
stance (`res_fence` both, `res_collector` buys fire, `res_clerk` reports), 2-4 `lines` in their voice.

## Orders (mail)
Kinds: plain orders, bulk (union, clinic), rush (ring, short due, high price_mult), standing (`recurring_days`),
charity (spine, price_mult 0.8-0.95: someone stays alive), repair (wants a system's `repair_items`), black
(`org_black_market`, contraband, `attachments` of exempt discs), the **tithe** (`org_company`, recurring 7 days, a
`penalty`), memos (rent notices, wage changes; no wants), spam (an `attachments` disc that carries `mod_infected`: say so
in notes). Every deck gets 6+ orders; every resident with `sends_mail` 3+; every org 2+. Wants must fit the largest
allowed box by area (validator). Ship-by math is the calendar's: `due_days` includes the deck's transit.

## Events
Breakdowns of every system (2+ each: scrubber bank fails, reactor scram, ice haul late, foundry strike), convoys
(supply up), blockades, epidemics (medicine demand), festivals (ring luxury), inspections (`org_security`, contraband),
macro (wage cut: `budget_mult` on a deck; rent hike: `rent_mult`), accidents, windfalls. Shocks in ECONOMY.md's shape
(demand/supply multipliers 0.4-2.5). Most have a `rumor` (lead 1-3 days, accuracy 0.6-0.9, via mail or radio). Chain
some with `followups` and `spawns_orders` (a scrubber failure spawns a filter rush order).

## Connectivity duties (validator checks 6, 11 and the inflow checks)
- Every item with `inflow.channel: "seller"` appears in some resident's `sells`; every `"mail"` item or disc in some
  order's `attachments`; every disc with `found` seller/mail likewise.
- Every need is wanted by a resident and shocked by an event; every deck has a resident and orders; every system is
  named by 2+ events.
- Every carried-over contraband item (candle, matches, lighter, zippo) has a buyer and a seller.

## Tricky parts
- Exempt discs (`ids.json` `upgrade_exempt_discs`) have no upgrade route: you are their only source besides salvage.
- Price numbers: `price_mult` on market worth, not credits. The tithe's size scales by phase (`phase_from`/`phase_to`
  variants: one tithe template per phase).
- No relations or standing with customers (STATION section 14): no reputation fields.
