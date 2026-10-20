// The night is outside (STATION.md 8b). The line is over; you go out after hours to one place, with what is on you: a pack on
// your back and two hands, each holding one thing, tools among them (places beside the field, see world.ts). The places are the station's
// (data/station/outside.json, which the sim plays too):
// - A **site** has a number of searches; each one turns up a find on the ground there, drawn from its loot table, and you
//   take what you want into the pack or your hands. A locked site needs its tool in a hand (a refill is used up going in);
//   at an open one a bonus tool finds more. Going home, what you left is gone (the site fills again by tomorrow night) and
//   the tools in your hands that served have worn a night.
// - A **shop** is a counter where you are the customer: tonight's stock is on it (a daily restock), each thing at its
//   price. Taking one into your pack or a hand buys it; one of yours laid on their counter sells it at their floor price, if they buy
//   that sort of thing.
// Going out costs no energy and nothing counts time: a night is one outing.

import OUT from '../data/station/outside.json' with { type: 'json' }
import DECKS from '../data/station/decks.json' with { type: 'json' }
import { contents, find, inSpace, KINDS, look, remove, spaceOf, spawn, worn, type Buys, type Item, type Space, type State } from './world.ts'

/** What a search can turn up: a kind, how likely (`w`, a weight against the others), and how many of it (`n`, a range). */
export interface Find { kind: string; w: number; n: [number, number] }
/** A tool's part in a visit: `searches` it adds, `wear` (nights it uses up), `consume` (how many of it a visit uses: a refill). */
export interface Gear { tool: string; searches?: number; wear?: number; consume?: number }
export interface Site { id: string; name: string; deck: string; desc: string; searches: number; lock?: Gear; bonus: Gear[]; finds: Find[] }
export interface Shop { id: string; name: string; deck: string; desc: string; buys: Buys; sells: { kind: string; perDay: number }[] }

const deckName = (id: string) => (DECKS as { id: string; name: string }[]).find(d => d.id === id)?.name ?? id
const known = (kind: string) => !!KINDS[kind]
export const SITES: Site[] = (OUT.sites as any[]).map(x => ({
  id: x.id, name: x.name, deck: deckName(x.deck), desc: x.desc, searches: x.searches,
  ...(x.gate && known(x.gate.tool) ? { lock: x.gate as Gear } : {}), bonus: (x.bonus ?? []).filter((b: Gear) => known(b.tool)),
  finds: x.loot.filter((l: any) => known(l.id)).map((l: any) => ({ kind: l.id, w: l.w, n: l.n })),
})).filter(x => x.finds.length)
export const SHOPS: Shop[] = (OUT.shops as any[]).map(x => ({ id: x.id, name: x.name, deck: deckName(x.deck), desc: x.desc, buys: x.buys, sells: x.sells.filter((g: any) => known(g.id)).map((g: any) => ({ kind: g.id, perDay: g.per_day })) }))
export const siteOf = (id: string | undefined) => SITES.find(x => x.id === id)
export const shopOf = (id: string | undefined) => SHOPS.find(x => x.id === id)
/** Every tool a site locks on or rewards. */
export const GEAR = new Set(SITES.flatMap(x => [x.lock?.tool, ...x.bonus.map(b => b.tool)]).filter((t): t is string => !!t))

/** What is in your hands (one thing a hand, any size). */
export const inHands = (s: State) => inSpace(s, { at: 'hand' })
/** Is one of your hands holding this kind? */
const holding = (s: State, kind: string | undefined) => inHands(s).find(o => o.kind === kind)
const toolName = (kind: string) => KINDS[kind]?.name.toLowerCase() ?? kind
const bonusOf = (s: State, site: Site) => site.bonus.filter(b => holding(s, b.tool)).sort((a, b) => (b.searches ?? 0) - (a.searches ?? 0))[0]
/** How many searches a visit gives, with what is in your hands now. */
export const searchesFor = (s: State, site: Site) => site.searches + (bonusOf(s, site)?.searches ?? 0) + (site.lock && holding(s, site.lock.tool) ? site.lock.searches ?? 0 : 0)
/** Why you cannot go there tonight (no pack on your back, the wrong thing in your hand), or null if you can. */
export function barred(s: State, place: Site | Shop): string | null {
  if (!worn(s)) return 'put a pack on your back first'
  if ('lock' in place && place.lock && !holding(s, place.lock.tool)) return `locked: it needs ${an(toolName(place.lock.tool))} in a hand`
  return null
}
/** What a site tends to turn up, likeliest first; what a shop sells (for the map). */
export const tends = (site: Site, n = 4) => [...site.finds].sort((a, b) => b.w - a.w).slice(0, n).map(f => KINDS[f.kind].name.toLowerCase())
export const sells = (shop: Shop) => shop.sells.map(g => KINDS[g.kind].name.toLowerCase())
/** What a shop pays for one of yours (its floor: a share of what it is worth), or null if it does not buy that sort of thing. */
export function floorFor(buys: Buys, it: Item): number | null {
  const k = KINDS[it.kind], tags = look(it).tags
  const takes = buys.any || (buys.needs ?? []).includes(k.need ?? '') || tags.some(t => (buys.tags ?? []).includes(t))
  return takes ? Math.max(0, Math.floor(look(it).price * buys.mult)) : null
}
/** What a shop asks for one of its things. */
/** What every shop adds over worth when it sells to you (outside.json `markup`): the night's counters and the Company Store. */
export const SHOP_MARKUP: number = OUT.markup
export const askFor = (kind: string) => Math.max(1, Math.ceil((KINDS[kind].price ?? 0) * (1 + SHOP_MARKUP)))

/** Go out to a site or a shop: the evening is over. At a site you have its searches; at a shop, tonight's stock is on the counter. The reason if you cannot. */
export function goOut(s: State, id: string): string | null {
  if (s.out) return 'you are out already'
  const site = siteOf(id), shop = shopOf(id)
  if (!site && !shop) return 'no such place'
  const why = barred(s, (site ?? shop)!)
  if (why) return why
  s.night = true
  if (site) {
    s.out = { site: id, left: searchesFor(s, site) }
    const t = holding(s, site.lock?.tool)
    if (t && site.lock?.consume) remove(s, [t.id]) // a refill is used up going in
    return null
  }
  s.out = { site: id, left: 0, buys: shop!.buys }
  // tonight's stock, each kind in turn until the counter is full or the day's restock is out
  const left = shop!.sells.map(g => g.perDay)
  for (let more = true; more;) {
    more = false
    shop!.sells.forEach((g, i) => { if (left[i] <= 0) return; const it = spawn(s, g.kind, { at: 'site' }); if (!it) { left[i] = 0; return } it.sale = askFor(g.kind); left[i]--; more = true })
  }
  return null
}
/** One search at a site: what turned up (on the ground there), or why nothing did. */
export function search(s: State, rand = Math.random): Item[] | 'done' | 'full' {
  const site = siteOf(s.out?.site)
  if (!site || !s.out || s.out.left <= 0) return 'done'
  let k = rand() * site.finds.reduce((n, f) => n + f.w, 0), f = site.finds[site.finds.length - 1]
  for (const x of site.finds) if ((k -= x.w) <= 0) { f = x; break }
  const made: Item[] = []
  const n = f.n[0] + Math.floor(rand() * (f.n[1] - f.n[0] + 1))
  for (let i = 0; i < n; i++) { const it = spawn(s, f.kind, { at: 'site' }); if (it) made.push(it) }
  if (!made.length) return 'full' // no room on the ground: the search is not spent
  s.out.left--
  return made
}
/**
 * Things that moved between the ground and your pack at a shop: one of theirs taken into the pack is bought (its price leaves
 * your money), and taken back out it is theirs again (and the money comes back); one of yours laid on their counter is sold at
 * their floor and goes. What changed hands, for a note.
 */
export function trade(s: State, moves: { it: Item; from: Space }[]): { bought: Item[]; back: Item[]; sold: { name: string; paid: number }[]; cost: number; paid: number } {
  const out = { bought: [] as Item[], back: [] as Item[], sold: [] as { name: string; paid: number }[], cost: 0, paid: 0 }
  if (!s.out?.buys) return out
  const pack = worn(s)
  const onGround = (sp: Space) => !!sp && 'at' in sp && sp.at === 'site'
  const inPack = (sp: Space) => !!sp && ('host' in sp ? sp.host === pack?.id : sp.at === 'hand') // the pack, or a hand
  for (const { it, from } of moves) {
    const to = spaceOf(it)
    if (onGround(from) && inPack(to) && it.sale !== undefined && !it.bought) { s.cash = (s.cash ?? 0) - it.sale; it.bought = true; out.bought.push(it); out.cost += it.sale }
    else if (inPack(from) && onGround(to) && it.bought) { s.cash = (s.cash ?? 0) + it.sale!; delete it.bought; out.back.push(it); out.cost -= it.sale! }
    else if (inPack(from) && onGround(to) && it.sale === undefined) {
      const paid = floorFor(s.out.buys, it) ?? 0
      s.cash = (s.cash ?? 0) + paid
      out.sold.push({ name: look(it).name.toLowerCase(), paid }); out.paid += paid
      remove(s, [it.id])
    }
  }
  return out
}
/**
 * Come home: what is left on the ground stays there (unsold stock, finds left behind), each tool in your hands that served
 * the place (a lock or a bonus) has had a night, and one that is worn through is gone. What came home in the pack or your
 * hands stays there, paid for. What was left, and the worn-out tools.
 */
export function goHome(s: State): { left: number; spent: Item[] } {
  const ground = inSpace(s, { at: 'site' }), site = siteOf(s.out?.site)
  remove(s, ground.map(o => o.id))
  const pack = worn(s)
  for (const o of [...pack ? contents(s, pack.id) : [], ...inHands(s)]) { delete o.sale; delete o.bought }
  const spent: Item[] = []
  for (const t of inHands(s)) {
    if (!KINDS[t.kind]?.wears || !site || !(site.lock?.tool === t.kind || site.bonus.some(b => b.tool === t.kind))) continue
    t.used = (t.used ?? 0) + 1
    if (t.used >= KINDS[t.kind].wears!) { spent.push({ ...t }); remove(s, [t.id]) }
  }
  delete s.out
  return { left: ground.length, spent }
}
/** How many nights a tool has left in it, for its tooltip. */
export const nightsLeft = (it: Item) => { const w = KINDS[it.kind]?.wears; return w ? w - (it.used ?? 0) : null }
const an = (name: string) => `${/^[aeiou]/.test(name) ? 'an' : 'a'} ${name}`
/** A find's name for a note: "a candle", "an ingot", "2 matches". */
export function named(made: Item[]) {
  const name = look(made[0]).name.toLowerCase()
  if (made.length > 1) return `${made.length} ${name}${/(s|x|z|ch|sh)$/.test(name) ? 'es' : 's'}`
  return an(name)
}
export { find }
