// The Wire: the station's network, and Wirewalk, the browser the wired terminal comes with. The first page dials up (a
// modem's handshake, muffled), then pages load over the line, a band at a time. Everything here is a page drawn from the
// game's state: shops that sell real things (paid from your money, delivered by drone or freight: orders.ts), a swap board
// that changes every day, software to download onto C:, a gallery of pictures, the news, your account, a search engine,
// and a ring of homepages made by hand, with a guestbook. One cart is shared by every shop on the Wire.
//
// A page is a function of the address: `page()` gives its title and HTML; links and buttons are `data-act` (go:ADDRESS,
// add:, pay...), handled by the browser's `act`. Nothing here imports a program's values (programs.ts imports this).

import { bring, type Goods } from './customers.ts'
import { DISCS } from './discs.ts'
import { esc } from './html.ts'
import { chance, DRONE_FEE, forSale, placeOrder, quote, stockOf, worthOf } from './orders.ts'
import { PIC_SIZE, picUrl } from './pics.ts'
import type { Os, Program, Win } from './programs.ts'
import { contents, isBox, KINDS, look, worth, type Item, type Mail, type WebData } from './world.ts'

// ---------------------------------------------------------------- small things

/** A link on a page: underlined blue, purple once followed (in this window). */
const a = (w: Win, url: string, text: string) => `<a class="${w.st.seen?.includes(url) ? 'vis' : ''}" data-act="go:${esc(url)}">${text}</a>`
const button = (act: string, label: string, extra = '') => `<button class="wb" data-act="${esc(act)}"${extra}>${label}</button>`
/** A number from a seed, always the same for the same seed (a day's news, a day's listings). */
function seeded(seed: number) { let x = (seed * 2654435761) >>> 0 || 1; return () => { x = (x ^ (x << 13)) >>> 0; x = (x ^ (x >>> 17)) >>> 0; x = (x ^ (x << 5)) >>> 0; return x / 4294967296 } }
const pick = <T,>(xs: T[], r: () => number) => xs[Math.floor(r() * xs.length)]
const dayOf = (os: Os) => os.state().day ?? 1
const webOf = (os: Os): WebData => os.state().web ??= {}
const hostOf = (url: string) => url.split(/[/?]/)[0]
/** An address as typed: no scheme, no trailing slash, the host in small letters. */
function clean(url: string) {
  const u = url.trim().replace(/^[a-z]+:\/\//i, '').replace(/\/+$/, '')
  const i = u.search(/[/?]/)
  return i < 0 ? u.toLowerCase() : u.slice(0, i).toLowerCase() + u.slice(i)
}
const HOME = 'home.wire'

// ---------------------------------------------------------------- the cart: one for every shop on the Wire

interface Line { name: string; goods: Goods; price: number; shop: string; key?: string }
const carts = new Map<number, Line[]>()
const cartOf = (os: Os) => carts.get(os.id) ?? (carts.set(os.id, []), carts.get(os.id)!)
const cartTotal = (os: Os) => cartOf(os).reduce((n, l) => n + l.price, 0)
const cartLink = (os: Os, w: Win) => { const c = cartOf(os); return `<div class="cartlink">${a(w, 'cart.wire', `&#128722; Cart: ${c.length} thing${c.length === 1 ? '' : 's'}, ${cartTotal(os)}$`)}</div>` }
/** What a buyer sees of a thing: its picture as it is drawn on the field. */
/** A thing's look as it would be made (its name, its description). */
const lookOf = (g: Goods) => look({ id: 0, x: 0, y: 0, rot: 0, kind: g.kind, ...(g.props ? { props: g.props } : {}), ...(g.age ? { age: g.age } : {}), ...(g.left !== undefined ? { left: g.left } : {}) })
const art = (os: Os, g: Goods) => { const k = KINDS[g.kind]; return `<span class="wart" style="--kw:${k.w};--kh:${k.h}">${os.art(g)}</span>` }

// ---------------------------------------------------------------- the Company store

const CATS: [string, string, string[]][] = [['food', 'Food', ['food']], ['sundries', 'Sundries', ['sundries']], ['medicine', 'Medicine', ['medicine']], ['tools', 'Tools & storage', ['tools', 'storage']], ['tech', 'Tech', ['tech']], ['home', 'Furniture', ['furniture']], ['raw', 'Materials', ['materials']], ['machines', 'Machines', ['machines']]]
/** What the Company sells: anything new with a price (not a sandwich, which is made; not a disc, which has its own shops), a quarter over what it is worth. */
const stocked = (cats: string[]) => Object.entries(KINDS).filter(([kind, k]) => k.price && !k.stack && kind !== 'disc' && cats.includes(k.cat ?? '')).map(([kind]) => ({ kind } as Goods))
const companyPrice = (g: Goods) => Math.max(1, Math.ceil(worthOf(g) * 1.25))
function store(os: Os, w: Win, path: string) {
  const cat = CATS.find(([id]) => id === path) ?? CATS[0]
  const tabs = CATS.map(([id, label]) => id === cat[0] ? `<b>${label}</b>` : a(w, `store.company/${id}`, label)).join(' | ')
  const rows = stocked(cat[2]).map(g => {
    const l = lookOf(g), p = companyPrice(g)
    return `<tr><td class="wart-cell">${art(os, g)}</td><td><b>${esc(l.name)}</b><br><small>${esc(l.desc ?? '')}</small></td><td class="price">${p}$</td><td>${button(`add:${JSON.stringify({ name: l.name, goods: g, price: p, shop: 'Company Store' })}`, 'Add to cart')}</td></tr>`
  }).join('')
  return { title: `Company Store - ${cat[1]}`, html: `<div class="site store">${cartLink(os, w)}<div class="store-head"><span class="co">&#9673;</span><div><b>COMPANY STORE</b><small>Everything for station life. Delivered.</small></div></div>
    <div class="tabs">${tabs}</div><table class="cat">${rows}</table>
    <p class="fine">Prices include the Company's handling. Drone delivery ${DRONE_FEE}$, in about a minute; freight is free and comes the next morning. Everything arrives on your outside counter.</p></div>` }
}

// ---------------------------------------------------------------- Swapline: what residents sell, a new board every day

const SELLERS = ['Wren', 'Odell', 'Ines', 'Hollis', 'Bea', 'Corvin', 'Dot', 'Ansel', 'Yuki', 'Marek', 'Saoirse', 'Tam', 'Lio', 'Pell']
const WHY = ['Moving to the ring, cannot take it.', 'Need water money.', 'Clearing my late father\'s locker.', 'Never used. Well, once.', 'Swapped for it, do not need it.', 'Rent is due.', 'Bought two by mistake.', 'Make me an offer. No, the price is the price.', 'Found it in the recycling, works fine.', 'Has a story. Ask me.']
const WANTED = ['WANTED: antiseptic, any amount. Clinic, spine 6.', 'WANTED: a working lighter. No questions.', 'WANTED: books, any. Will trade bread.', 'WANTED: metal in bars, paying fair. Fabrication, ring 3.', 'WANTED: someone who can fix a wired terminal.', 'WANTED: candles. You know why.']
/** Today's listings: what residents bring, at their own prices, by seller and deck. */
function listings(day: number) {
  const r = seeded(day * 7919 + 13)
  return Array.from({ length: 8 }, (_, i) => {
    const goods = bring(r)
    const price = Math.max(1, Math.round(worthOf(goods) * (0.55 + r() * 0.6)))
    return { key: `${day}:${i}`, goods, price, who: pick(SELLERS, r), deck: r() < 0.6 ? `spine ${1 + Math.floor(r() * 9)}` : `ring ${1 + Math.floor(r() * 4)}`, why: pick(WHY, r) }
  })
}
function swap(os: Os, w: Win) {
  const day = dayOf(os), sold = new Set(webOf(os).sold ?? []), inCart = new Set(cartOf(os).map(l => l.key))
  const rows = listings(day).map(l => {
    const name = lookOf(l.goods).name
    const state = sold.has(l.key) ? '<span class="sold">SOLD</span>' : inCart.has(l.key) ? '<span class="sold">in your cart</span>' : button(`add:${JSON.stringify({ name, goods: l.goods, price: l.price, shop: `Swapline (${l.who})`, key: l.key })}`, 'Buy')
    return `<li><span class="wart-cell">${art(os, l.goods)}</span><div><b>FOR SALE: ${esc(name)}</b> &mdash; ${l.price}$<br><small>${esc(l.who)}, ${l.deck}. "${esc(l.why)}"</small></div>${state}</li>`
  }).join('')
  const r = seeded(day * 31 + 5)
  const wanted = [pick(WANTED, r), pick(WANTED, r)].filter((x, i, xs) => xs.indexOf(x) === i).map(x => `<li class="wanted">${esc(x)}</li>`).join('')
  return { title: 'Swapline', html: `<div class="site swap">${cartLink(os, w)}<h1>SWAPLINE</h1><p class="sub">Residents buying and selling. New board every morning. Day ${day}.</p>
    <p>${a(w, 'swap.wire/sell', '&raquo; Sell something of yours')}</p>
    <ul class="ads">${rows}${wanted}</ul><p class="fine">Swapline takes no responsibility for anything. Couriers come in the morning.</p></div>` }
}
/** About how long a listing takes to sell at this price, as words. */
const odds = (price: number, value: number) => { const c = chance(price, value); if (c <= 0) return 'will not sell'; const min = 20 / c / 60; return min < 1.5 ? 'likely within a minute or two' : min < 6 ? `likely in ${Math.round(min)} minutes or so` : min < 20 ? 'slow: a quarter of an hour, maybe' : 'unlikely at that price' }
/** Your things, to sell: what is on your floor and free to go (not listed yet, not a box, not something with things in it), by name. */
function yours(os: Os) {
  const s = os.state(), groups = new Map<string, Item[]>()
  for (const it of s.items) {
    if (it.listed || isBox(it) || it.kind === 'it_tech_slip' || !forSale(s, it) || contents(s, it.id).length || worth(s, it) <= 0) continue
    const name = look(it).name
    groups.set(name, [...groups.get(name) ?? [], it])
  }
  return [...groups.entries()].sort((x, y) => x[0].localeCompare(y[0]))
}
function sell(os: Os, w: Win) {
  const s = os.state()
  const mine = yours(os).map(([name, its]) => {
    const it = its[0], value = worth(s, it), key = `price:${name}`, price = Math.max(1, Math.round(Number(w.st[key] ?? value)) || value)
    return `<tr><td class="wart-cell">${art(os, goodsOf(it))}</td><td><b>${esc(name)}</b>${its.length > 1 ? ` &times;${its.length}` : ''}<br><small>worth ${value}$ &middot; at ${price}$: ${odds(price, value)}</small></td>
      <td><input class="wfield price-in" data-in="${esc(key)}" data-focus="${os.id}:${w.pid}:${esc(key)}" value="${price}" size="4">$</td><td>${button(`list:${name}`, 'List one')}</td></tr>`
  }).join('') || '<tr><td>Nothing on your floor to sell.</td></tr>'
  const listed = s.items.filter(o => o.listed).map(it => {
    const value = worth(s, it)
    return `<tr><td class="wart-cell">${art(os, goodsOf(it))}</td><td><b>${esc(look(it).name)}</b> &mdash; ${it.listed}$<br><small>worth ${value}$ &middot; ${forSale(s, it) ? odds(it.listed!, value) : 'not on your floor: it cannot go'}</small></td><td colspan="2">${button(`unlist:${it.id}`, 'Take it down')}</td></tr>`
  }).join('') || '<tr><td>Nothing listed.</td></tr>'
  return { title: 'Swapline - sell yours', html: `<div class="site swap"><p>${a(w, 'swap.wire', '&laquo; the board')}</p><h1>SELL YOURS</h1>
    <p class="sub">List it at your price. Someone comes for it in time: sooner when the price is kind. A courier collects; Swapline keeps a tenth.</p>
    <h3>Your listings</h3><table class="cat">${listed}</table><h3>On your floor</h3><table class="cat">${mine}</table></div>` }
}
/** A thing as goods, to draw it as it is. */
const goodsOf = (it: Item): Goods => ({ kind: it.kind, ...(it.props ? { props: it.props } : {}), ...(it.left !== undefined ? { left: it.left } : {}), ...(it.fill ? { fill: it.fill } : { fill: null }), ...(it.age ? { age: it.age } : {}) })
function swapPage(os: Os, w: Win, path: string) {
  return path === 'sell' ? sell(os, w) : swap(os, w)
}

// ---------------------------------------------------------------- the Software Cellar: download shareware, order a licence

/** How fast the line is: 16K a second. */
export const LINE = 16
const SOFT: { prog: string; disc: string; note: string }[] = [
  { prog: 'paint', disc: 'paint', note: 'Sixteen colours, a pen, a brush and a fill. Make your own wallpaper.' },
  { prog: 'mines', disc: 'mines', note: 'Nine by nine, ten mines. Every terminal has a copy somewhere.' },
  { prog: 'stock', disc: 'stock', note: 'Counts and values everything you own. Licensed: ships on its key disc.' },
]
function soft(os: Os, w: Win) {
  const rows = SOFT.map(({ prog, disc, note }) => {
    const p = os.program(prog)!, d = DISCS[disc]
    const get = p.licensed ? button(`add:${JSON.stringify({ name: `Disc "${d.label}"`, goods: { kind: 'disc', props: { content: disc } }, price: d.price ?? 3, shop: 'Software Cellar' })}`, `Order the disc, ${d.price}$`)
      : button(`dl:${prog}`, `Download (${p.size}K, about ${Math.ceil(p.size / LINE)} s)`)
    return `<tr><td><b>${esc(p.file)}</b><br><small>${p.licensed ? 'licensed' : 'shareware'}</small></td><td>${esc(note)}<br><small>${p.size}K on disk · runs in ${p.memory}K · wants ${p.speed} MHz</small></td><td>${get}</td></tr>`
  }).join('')
  return { title: 'The Software Cellar', html: `<div class="site soft">${cartLink(os, w)}<h1>The Software Cellar</h1><p class="sub">shareware &middot; freeware &middot; the occasional licence</p>
    <table class="files">${rows}</table><p>Downloads go straight to your C: drive, over your line at ${LINE}K a second. Make room first.</p>
    <p class="fine">Coming soon: a ledger, a modem dialler, more games. Upload your own? Not yet.</p></div>` }
}

// ---------------------------------------------------------------- the Gallery: look for free, take one for 1$, or the whole disc

const SETS = ['earth', 'sky']
const picsOf = (disc: string) => (DISCS[disc]?.files ?? []).filter(f => f.pic !== undefined)
const captionIn = (disc: string, name: string) => DISCS[disc]?.files.flatMap(f => f.text.split('\n')).find(l => l.startsWith(`${name} `))?.slice(name.length).trim() ?? ''
/** The free picture today, from all of them. */
const ofTheDay = (day: number) => { const all = SETS.flatMap(d => picsOf(d).map(f => ({ disc: d, f }))); return all[day % all.length] }
function gallery(os: Os, w: Win, path: string) {
  const [set, name] = path.split('/')
  const day = dayOf(os)
  if (set && name) {
    const f = picsOf(set).find(o => o.name === name)
    if (!f) return notFound(os, w, `gallery.wire/${path}`)
    const free = ofTheDay(day).f.name === name
    return { title: `The Gallery - ${name}`, html: `<div class="site gallery"><p>${a(w, `gallery.wire/${set}`, `&laquo; back to ${esc(DISCS[set].label)}`)}</p>
      <div class="frame"><img src="${picUrl(f.pic!)}" alt=""></div><p class="cap">${esc(captionIn(set, name))}</p>
      <p>${button(`pic:${set}/${name}:${free ? 0 : 1}`, free ? `Download ${name}, free today` : `Download ${name} for 1$`)} <small>${PIC_SIZE}K, to your C: drive</small></p></div>` }
  }
  if (set && DISCS[set]) {
    const d = DISCS[set]
    const thumbs = picsOf(set).map(f => `<a class="thumb" data-act="go:gallery.wire/${set}/${f.name}"><img src="${picUrl(f.pic!)}" alt=""><small>${esc(f.name)}</small></a>`).join('')
    return { title: `The Gallery - ${d.label}`, html: `<div class="site gallery">${cartLink(os, w)}<p>${a(w, 'gallery.wire', '&laquo; the Gallery')}</p><h1>${esc(d.label)}</h1><p class="sub">${esc(d.blurb)}</p>
      <div class="thumbs">${thumbs}</div><p>Look at any of them for free. Take one home for 1$, or all ten on the disc: ${button(`add:${JSON.stringify({ name: `Disc "${d.label}"`, goods: { kind: 'disc', props: { content: set } }, price: d.price ?? 6, shop: 'The Gallery' })}`, `Order the disc, ${d.price}$`)}</p></div>` }
  }
  const pod = ofTheDay(day)
  const sets = SETS.map(s => `<div class="set" data-act="go:gallery.wire/${s}"><img src="${picUrl(picsOf(s)[0].pic!)}" alt=""><b>${esc(DISCS[s].label)}</b><small>${picsOf(s).length} pictures</small></div>`).join('')
  return { title: 'The Gallery', html: `<div class="site gallery">${cartLink(os, w)}<h1>The Gallery</h1><p class="sub">Pictures worth keeping.</p><div class="sets">${sets}</div>
    <h2>Picture of the day</h2><div class="pod" data-act="go:gallery.wire/${pod.disc}/${pod.f.name}"><img src="${picUrl(pod.f.pic!)}" alt=""><span>${esc(captionIn(pod.disc, pod.f.name))}<br><small>Free to download today.</small></span></div></div>` }
}

// ---------------------------------------------------------------- Station News

const NEWS: [string, string][] = [
  ['Scrubber 4 back online after two days', 'Engineers on the spine say the air on decks 5 to 7 will be back to normal by tonight. Residents who felt dizzy are asked not to report it.'],
  ['Hydro deck reports record lettuce', 'Tray 12 grew a head of lettuce the size of a helmet. It was eaten before it could be photographed.'],
  ['Company announces tithe review', 'The Company will review the tithe "in light of the station\'s excellent results". Nobody expects it to go down.'],
  ['Convoy expected within the week', 'The ore convoy is due, with ice, mail and a crate of real coffee that has already been spoken for.'],
  ['Ring residents complain of noise from the spine', 'A petition from ring 2 asks for "quiet hours" on the pipes below. The pipes were not consulted.'],
  ['Lift 3 stuck for an hour, nobody hurt', 'Eleven people spent an hour in lift 3 between the ring and the spine. They report it was "honestly fine" and "a bit warm".'],
  ['Clinic asks for antiseptic donations', 'The spine 6 clinic is low on antiseptic and dressings. Shops that can spare stock are asked to call.'],
  ['Old terminals still the most reliable, says engineer', 'Wired terminals older than the station\'s second ring are "unkillable", according to a technician who asked not to be named.'],
  ['Power rationing on deck 9 lifted', 'Cells are back on the shelves after the charger fault. Prices are expected to settle by the end of the week.'],
  ['Lost: a grey cat named Fuse', 'Last seen near the recycler on spine 4. Answers to nothing. Reward: a sandwich.'],
  ['Festival lights approved, candles still banned', 'The Company has approved electric lights for the festival. Candles, matches and lighters remain banned on all decks.'],
  ['Water quality "fine", say tests', 'The latest water tests are "fine". The Company did not publish the numbers.'],
]
function news(os: Os, w: Win) {
  const day = dayOf(os), r = seeded(day * 104729 + 7)
  const items = [...NEWS].sort(() => r() - 0.5).slice(0, 4)
  const top = items[0]
  return { title: `Station News - day ${day}`, html: `<div class="site news"><div class="masthead"><b>STATION NEWS</b><small>Day ${day} &middot; all the news the Company allows</small></div>
    <h1>${esc(top[0])}</h1><p>${esc(top[1])}</p><hr>${items.slice(1).map(([h, t]) => `<h3>${esc(h)}</h3><p>${esc(t)}</p>`).join('')}
    <hr><p class="fine">${a(w, HOME, 'Back to the Wire')} &middot; Read something wrong? ${a(w, 'swap.wire', 'Sell it on Swapline')}.</p></div>` }
}

// ---------------------------------------------------------------- Company Credit: your money and what is on its way

function bank(os: Os, w: Win) {
  const web = webOf(os), orders = os.state().orders ?? [], now = Date.now(), day = dayOf(os)
  const eta = (o: (typeof orders)[number]) => o.by === 'drone' ? (o.at <= now ? 'landing now' : `lands in ${Math.ceil((o.at - now) / 1000)} s`) : (o.at <= day ? 'this morning' : `day ${o.at}, morning`)
  const way = orders.map(o => `<tr><td>#${o.id}</td><td>${esc(o.from)}</td><td>${o.goods.length} thing${o.goods.length === 1 ? '' : 's'}</td><td>${o.by}, ${eta(o)}</td></tr>`).join('') || '<tr><td colspan="4">Nothing on its way.</td></tr>'
  const log = (web.log ?? []).slice().reverse().map(l => `<tr><td>day ${l.day}</td><td>${esc(l.text)}</td><td class="price">${l.amount < 0 ? '' : '+'}${l.amount}$</td></tr>`).join('') || '<tr><td colspan="3">No payments yet.</td></tr>'
  return { title: 'Company Credit', html: `<div class="site bank"><div class="store-head"><span class="co">&#9673;</span><div><b>COMPANY CREDIT</b><small>Account 0441-7782 &middot; shopkeeper, licensed</small></div></div>
    <div class="balance">Balance: <b>${os.cash()}$</b></div><h3>On its way</h3><table class="ledger">${way}</table><h3>Paid on the Wire</h3><table class="ledger">${log}</table>
    <p class="fine">Company Credit is the only bank on the station. Thank you for banking with us.</p></div>` }
}

// ---------------------------------------------------------------- the cart and paying

function cart(os: Os, w: Win, path: string) {
  if (path.startsWith('ok/')) {
    const o = (os.state().orders ?? []).find(x => String(x.id) === path.slice(3))
    return { title: 'WireCart - thank you', html: `<div class="site cart"><h1>Thank you.</h1><p>Order <b>#${esc(path.slice(3))}</b> is paid and on its way${o ? (o.by === 'drone' ? ': a drone brings it in about a minute' : ': freight brings it tomorrow morning') : ''}. It comes to your outside counter.</p>
      <p>${a(w, 'bank.company', 'Follow it at Company Credit')} &middot; ${a(w, HOME, 'Back to the Wire')}</p></div>` }
  }
  const lines = cartOf(os), sub = cartTotal(os), ship = w.st.ship ?? 'freight', fee = ship === 'drone' ? DRONE_FEE : 0
  const rows = lines.map((l, i) => `<tr><td class="wart-cell">${art(os, l.goods)}</td><td>${esc(l.name)}<br><small>${esc(l.shop)}</small></td><td class="price">${l.price}$</td><td>${button(`rm:${i}`, 'Remove')}</td></tr>`).join('')
  const choose = (k: string, label: string) => `<label class="ship${ship === k ? ' on' : ''}" data-act="ship:${k}"><i></i>${label}</label>`
  return { title: 'WireCart', html: `<div class="site cart"><h1>WireCart</h1><p class="sub">One cart for every shop on the Wire.</p>
    ${lines.length ? `<table class="cat">${rows}</table>
    <div class="ships">${choose('freight', 'Freight: free, tomorrow morning')}${choose('drone', `Drone: ${DRONE_FEE}$, in about a minute`)}</div>
    <div class="total">Things ${sub}$ + delivery ${fee}$ = <b>${sub + fee}$</b><br><small>Your account: ${os.cash()}$</small></div>
    <p>${button('pay', `Pay ${sub + fee}$`, os.cash() < sub + fee ? ' disabled' : '')}</p>` : `<p>Your cart is empty. ${a(w, 'store.company', 'The Company Store')} &middot; ${a(w, 'swap.wire', 'Swapline')} &middot; ${a(w, 'gallery.wire', 'The Gallery')}</p>`}</div>` }
}

// ---------------------------------------------------------------- Seek: the Wire's search engine

const INDEX: [string, string, string][] = [
  [HOME, 'The Wire', 'home portal directory start everything'],
  ['store.company', 'Company Store', 'buy shop food medicine tools tech furniture apple bread cheese salami knife cabinet computer furnace ore candle'],
  ['swap.wire', 'Swapline', 'swap sell buy used cheap classifieds wanted residents'],
  ['soft.wire', 'The Software Cellar', 'software programs download shareware paint mines stocktake licence'],
  ['gallery.wire', 'The Gallery', 'pictures images paintings earth sky photos wallpaper art'],
  ['news.wire', 'Station News', 'news scrubber lettuce tithe convoy lift clinic power water festival cat'],
  ['bank.company', 'Company Credit', 'bank money account balance orders payments credit'],
  ['ring.wire', 'The Spine Ring', 'homepages personal ring webring pages'],
  ['home.wire/~tomas', "Tomas's Lamp Page", 'lamps candles light collection earth fire guestbook'],
  ['home.wire/~mira', "Mira's Hydro Corner", 'hydro tomatoes growing plants lamp garden spine'],
  ['home.wire/~pip', "PIP'S MINES PAGE", 'mines game high scores kid'],
]
function seek(os: Os, w: Win, path: string) {
  const q = decodeURIComponent(path.replace(/^\?q=/, '')).trim()
  const words = q.toLowerCase().split(/\s+/).filter(Boolean)
  const hits = words.length ? INDEX.filter(([u, t, k]) => words.some(x => `${u} ${t} ${k}`.toLowerCase().includes(x))) : []
  const results = !words.length ? '<p class="fine">Try: tomatoes, mines, earth, cheese, bank.</p>' : hits.length ? hits.map(([u, t, k]) => `<div class="hit">${a(w, u, esc(t))}<br><small>${esc(u)} &mdash; ${esc(k.split(' ').slice(0, 8).join(', '))}</small></div>`).join('') : `<p>Nothing on the Wire matches "${esc(q)}".</p>`
  return { title: q ? `Seek: ${q}` : 'Seek', html: `<div class="site seek"><h1>Seek<span>!</span></h1><div class="searchbox"><input class="wfield" data-in="q" data-focus="${os.id}:${w.pid}:q" value="${esc(w.st.q ?? q)}" placeholder="what are you looking for?">${button('search', 'Seek')}</div>${results}</div>` }
}

// ---------------------------------------------------------------- the Spine Ring: homepages made by hand

const RING = [['home.wire/~tomas', "Tomas's Lamp Page"], ['home.wire/~mira', "Mira's Hydro Corner"], ['home.wire/~pip', "PIP'S MINES PAGE"]]
function ringNav(w: Win, url: string) {
  const i = RING.findIndex(([u]) => u === url)
  const prev = RING[(i + RING.length - 1) % RING.length][0], next = RING[(i + 1) % RING.length][0]
  return `<div class="ringnav">${a(w, prev, '&laquo; prev')} | ${a(w, 'ring.wire', 'The Spine Ring')} | ${a(w, next, 'next &raquo;')}</div>`
}
const counter = (n: number) => `<span class="hits98">${String(n).padStart(6, '0').split('').map(d => `<i>${d}</i>`).join('')}</span>`
const construction = '<div class="construction"><span>UNDER CONSTRUCTION</span></div>'
const DEFAULT_BOOK = [{ name: 'Mira', text: 'Lovely lamps! The brass one is my favourite. Come and see my tomatoes.', day: 0 }, { name: 'pip', text: 'cool page. no mines tho', day: 0 }, { name: 'Hollis', text: 'My gran had one like the third one. Thank you for this.', day: 0 }]
function homepage(os: Os, w: Win, who: string, url: string) {
  const day = dayOf(os)
  if (who === 'tomas' || who === 'tomas/guestbook') {
    if (who.endsWith('guestbook')) {
      const book = [...DEFAULT_BOOK, ...(webOf(os).book ?? [])].reverse()
      return { title: "Tomas's Guestbook", html: `<div class="site tomas"><h1>Sign my guestbook!</h1><p>${a(w, 'home.wire/~tomas', '&laquo; back to the lamps')}</p>
        <div class="book-form"><label>Name <input class="wfield" data-in="bname" data-focus="${os.id}:${w.pid}:bname" value="${esc(w.st.bname ?? '')}" maxlength="20"></label><label>Message <input class="wfield wide" data-in="btext" data-focus="${os.id}:${w.pid}:btext" value="${esc(w.st.btext ?? '')}" maxlength="120"></label>${button('sign', 'Sign')}</div>
        ${book.map(b => `<div class="entry"><b>${esc(b.name)}</b>${b.day ? ` <small>day ${b.day}</small>` : ''}<br>${esc(b.text)}</div>`).join('')}</div>` }
    }
    return { title: "Tomas's Lamp Page", html: `<div class="site tomas"><h1 class="glow">~ TOMAS'S LAMP PAGE ~</h1><p class="mid"><span class="blink">NEW!</span> Lamp No. 7 added!</p>
      <p>Hello and welcome. Fire is not allowed on the station, so I collect what used to hold it: lamps, from Earth, the real kind. Oil lamps, a brass storm lantern, a little glass one for a candle that I will never light.</p>
      <ol><li>Brass storm lantern (my first, from a convoy man)</li><li>Clay oil lamp, very old, cracked</li><li>Glass candle lamp with a tin top</li><li>Railway lantern, red glass</li><li>A paraffin lamp with no chimney (looking for one!)</li><li>Miner's lamp, dented</li><li>NEW! A hurricane lamp. Still smells of oil.</li></ol>
      <p>Photos coming soon when I get a scanner.</p>${construction}
      <p class="mid">You are visitor ${counter(3120 + day * 7)}</p><p class="mid">${a(w, 'home.wire/~tomas/guestbook', 'Sign my guestbook!')} &middot; ${a(w, 'home.wire/~tomas/guestbook', 'View my guestbook')}</p>${ringNav(w, url)}</div>` }
  }
  if (who === 'mira') return { title: "Mira's Hydro Corner", html: `<div class="site mira"><h1>Mira's Hydro Corner</h1><p class="mid"><i>growing things where nothing grows</i></p>
    <pre class="ascii">    \\|/  \\|/
   --o----o--
     |    |
  ~~~~~~~~~~~~ </pre>
    <h3>Tomatoes under a spine lamp</h3><ul><li>They like the warm side of the pipe. Not touching it.</li><li>Twelve hours of lamp. They know if you cheat.</li><li>Shake the stems when you pass. No wind up here, so you are the wind.</li><li>Grey water is fine if you let it stand a day.</li></ul>
    <h3>This month</h3><p>Four tomatoes, one pepper, and a basil plant that will not die no matter what the air does. I gave the pepper to the clinic nurse.</p>
    <p class="mid">${counter(880 + day * 3)}</p>${ringNav(w, url)}</div>` }
  if (who === 'pip') return { title: "PIP'S MINES PAGE", html: `<div class="site pip"><h1><span class="blink">*</span> PIP'S MINES PAGE <span class="blink">*</span></h1><p class="mid">the best game on any terminal!!! get it at ${a(w, 'soft.wire', 'the software cellar')}</p>
    <h3>HIGH SCORES (9x9, ten mines)</h3><table class="scores"><tr><th>#</th><th>name</th><th>time</th></tr><tr><td>1</td><td>pip</td><td>41s</td></tr><tr><td>2</td><td>pip</td><td>44s</td></tr><tr><td>3</td><td>my brother</td><td>1m 9s (he cheated)</td></tr><tr><td>4</td><td>Mr Odell from the shop</td><td>2m 30s</td></tr></table>
    <p>TIPS: corners are bad. a 1 next to a 1 on a wall means the next one is safe. if u lose its ok.</p><p>can u beat me??? sign Tomas's guestbook and say ur time</p>${construction}${ringNav(w, url)}</div>` }
  return notFound(os, w, url)
}
function ring(_: Os, w: Win) {
  return { title: 'The Spine Ring', html: `<div class="site ring"><h1>The Spine Ring</h1><p class="sub">Homepages made by hand, by people who live below the ring.</p><ul>${RING.map(([u, t]) => `<li>${a(w, u, esc(t))}</li>`).join('')}</ul>
    <p>Want to join? Make a page, put the ring's links on it, and tell Mira.</p><p class="fine">${a(w, HOME, 'Back to the Wire')}</p></div>` }
}

// ---------------------------------------------------------------- the portal

function home(os: Os, w: Win) {
  const day = dayOf(os), r = seeded(day * 104729 + 7), headline = [...NEWS].sort(() => r() - 0.5)[0][0]
  const pod = ofTheDay(day)
  const dir: [string, string, string][] = [['store.company', 'Company Store', 'everything new, delivered'], ['swap.wire', 'Swapline', "residents' buy & sell, new every day"], ['soft.wire', 'Software Cellar', 'programs to download'], ['gallery.wire', 'The Gallery', 'pictures worth keeping'], ['news.wire', 'Station News', `day ${day}`], ['bank.company', 'Company Credit', 'your account, your orders'], ['seek.wire', 'Seek', 'search the Wire'], ['ring.wire', 'The Spine Ring', 'homepages']]
  return { title: 'The Wire', html: `<div class="site home"><div class="wire-head"><b>THE WIRE</b><small>everything on the station, one line away</small></div>
    <div class="ticker"><span>+++ ${esc(headline)} +++ Swapline has a new board for day ${day} +++ Picture of the day at the Gallery +++</span></div>
    <table class="two"><tr><td><h3>Where to</h3><ul class="dir">${dir.map(([u, t, d]) => `<li>${a(w, u, t)}<br><small>${d}</small></li>`).join('')}</ul></td>
    <td class="rcol"><h3>Today</h3><p>Day ${day}.<br>Ring: 21&deg;C, lights on at six.<br>Spine: 27&deg;C, air fair.</p><h3>Picture of the day</h3><div class="pod small" data-act="go:gallery.wire/${pod.disc}/${pod.f.name}"><img src="${picUrl(pod.f.pic!)}" alt=""></div>
    <div class="searchbox"><input class="wfield" data-in="q" data-focus="${os.id}:${w.pid}:q" value="${esc(w.st.q ?? '')}" placeholder="Seek the Wire">${button('search', 'Seek')}</div></td></tr></table>
    ${construction}<p class="mid fine">You are visitor ${counter(48213 + day * 211)} &middot; Best viewed with Wirewalk at 640x480</p></div>` }
}

function notFound(_: Os, w: Win, url: string) {
  return { title: '404 Not Found', html: `<div class="site plain"><h1>Not Found</h1><p>The address <b>${esc(url)}</b> is not on the Wire.</p><hr><p>${a(w, HOME, 'Back to the Wire')} &middot; ${a(w, `seek.wire/?q=${encodeURIComponent(hostOf(url).split('.')[0])}`, 'Seek it')}</p></div>` }
}

/** The page at an address. */
function page(os: Os, w: Win, url: string): { title: string; html: string } {
  const host = hostOf(url), path = url.slice(host.length).replace(/^\//, '')
  if (host === HOME && path.startsWith('~')) return homepage(os, w, path.slice(1), url)
  const sites: Record<string, () => { title: string; html: string }> = {
    [HOME]: () => home(os, w), 'store.company': () => store(os, w, path), 'swap.wire': () => swapPage(os, w, path), 'soft.wire': () => soft(os, w),
    'gallery.wire': () => gallery(os, w, path), 'news.wire': () => news(os, w), 'bank.company': () => bank(os, w), 'cart.wire': () => cart(os, w, path),
    'seek.wire': () => seek(os, w, path), 'ring.wire': () => ring(os, w),
  }
  return (sites[host] ?? (() => notFound(os, w, url)))()
}

// ---------------------------------------------------------------- the browser

/** Dialling: what the box says, and when (ms from the start). Connected at the end. */
const DIAL: [number, string][] = [[0, 'Dialling 555-0144 ...'], [1100, 'Verifying user name and password ...'], [2000, 'Logging on to the Wire ...'], [2800, 'Connected at 28,800 bps.']]
const DIAL_MS = 3300
const GLOBE = '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="#1f4a6a" stroke="#c9c3d6" stroke-width=".7"/><path d="M1.5 8h13M8 1.5c-3 3-3 10 0 13M8 1.5c3 3 3 10 0 13M2.8 4.5h10.4M2.8 11.5h10.4" fill="none" stroke="#8fe0a6" stroke-width=".6"/></svg>'

/** Bring the line up: the modem dials (a few seconds, with its box), then `then`. A window dials once at a time. */
function dial(os: Os, st: { dial: number | null }, then: () => void) {
  if (st.dial !== null) return
  st.dial = performance.now()
  os.sound('dial')
  for (let t = 300; t <= DIAL_MS + 300; t += 300) setTimeout(() => {
    if (st.dial === null) return
    if (performance.now() - st.dial >= DIAL_MS || os.online()) { os.connect(); st.dial = null; then() } else os.repaint()
  }, t)
}
/** The dialler's box, while it dials. */
const dialHtml = (st: { dial: number }) => { const t = performance.now() - st.dial; return `<div class="pane98 dialer"><div class="w98 active dialbox"><div class="w98-bar"><span>Connect to the Wire</span></div><div class="w98-body"><div class="dial-art">${GLOBE}<span class="dots">${'&middot;'.repeat(1 + Math.floor(t / 250) % 6)}</span>${GLOBE}</div>${DIAL.filter(([at]) => t >= at).map(([, l]) => `<div>${l}</div>`).join('')}</div></div></div>` }

/** Go to an address: dial first if the line is down, then load it (a page takes a moment, more for a big one). */
function go(os: Os, w: Win, url: string, push = true) {
  const st = w.st
  url = clean(url) || HOME
  if (push) { st.hist = [...st.hist.slice(0, st.i + 1), url]; st.i = st.hist.length - 1 }
  st.url = url; st.addr = url
  st.seen = [...new Set([...(st.seen ?? []), url])]
  if (!os.online()) { dial(os, st, () => go(os, w, st.url, false)); return os.repaint() }
  st.t0 = performance.now(); st.ms = 450 + Math.round(Math.random() * 600)
  setTimeout(() => os.repaint(), st.ms + 30)
  os.repaint()
}

export const browser: Program = {
  id: 'web', file: 'WIREWALK.EXE', name: 'Wirewalk', size: 0, memory: 192, speed: 1, rom: true, w: 610, h: 440, icon: GLOBE,
  start: () => ({ url: '', addr: HOME, hist: [] as string[], i: -1, t0: 0, ms: 0, dial: null as number | null, seen: [] as string[], ship: 'freight' }),
  title: w => `${w.st.dial !== null || !w.st.url ? 'Connecting' : w.st.title ?? 'Wirewalk'} - Wirewalk`,
  body(os, w) {
    const st = w.st
    if (!st.url && st.dial === null) queueMicrotask(() => go(os, w, HOME)) // a new window goes home
    const busy = st.dial !== null || performance.now() - st.t0 < st.ms
    const nav = `<div class="bar98 nav98">${['back:&lt; Back', 'fwd:Forward &gt;', 'reload:Reload', 'home:Home'].map(x => { const [k, l] = x.split(':'); return `<button class="b98" data-act="${k}"${(k === 'back' && st.i <= 0) || (k === 'fwd' && st.i >= st.hist.length - 1) ? ' disabled' : ''}>${l}</button>` }).join('')}
      <input class="in98 addr" data-in="addr" data-focus="${os.id}:${w.pid}:addr" value="http://${esc(st.addr)}" spellcheck="false"><button class="b98" data-act="addr">Go</button><span class="throb${busy ? ' on' : ''}">${GLOBE}</span></div>`
    if (st.dial !== null) return `${nav}${dialHtml(st)}<div class="status98">Dialling ...</div>`
    if (!st.url) return `${nav}<div class="pane98"></div><div class="status98">&nbsp;</div>`
    const p = page(os, w, st.url)
    st.title = p.title
    const e = performance.now() - st.t0, loading = e < st.ms
    return `${nav}<div class="pane98 page98${loading ? ' loading' : ''}" data-scroll="${os.id}:${w.pid}:${esc(st.url)}"${loading ? ` style="--t:-${Math.round(e)}ms;--ms:${st.ms}ms"` : ''}>${p.html}</div>
      <div class="status98">${loading ? `Transferring data from ${esc(hostOf(st.url))} ... ${Math.round(100 * e / st.ms)}%` : 'Document: Done'}<span class="grow"></span>${os.online() ? '&#9679; online' : ''}</div>`
  },
  act(os, w, what) {
    const st = w.st
    const [verb, ...rest] = what.split(':'), arg = rest.join(':')
    if (verb === 'go') return go(os, w, arg)
    if (verb === 'addr') return go(os, w, st.addr)
    if (verb === 'home') return go(os, w, HOME)
    if (verb === 'reload') return go(os, w, st.url, false)
    if (verb === 'back' && st.i > 0) { st.i--; return go(os, w, st.hist[st.i], false) }
    if (verb === 'fwd' && st.i < st.hist.length - 1) { st.i++; return go(os, w, st.hist[st.i], false) }
    if (verb === 'search') return go(os, w, `seek.wire/?q=${encodeURIComponent(st.q ?? '')}`)
    if (verb === 'add') { cartOf(os).push(JSON.parse(arg)); os.sound('menu'); return os.repaint() }
    if (verb === 'rm') { cartOf(os).splice(+arg, 1); return os.repaint() }
    if (verb === 'ship') { st.ship = arg; return os.repaint() }
    if (verb === 'pay') return pay(os, w)
    if (verb === 'dl') { const p = os.program(arg); if (p) os.download(p.file, { prog: p.id }, p.size, LINE); return }
    if (verb === 'pic') return getPic(os, arg)
    if (verb === 'list') {
      const its = yours(os).find(([name]) => name === arg)?.[1]
      if (!its) return
      const value = worth(os.state(), its[0])
      its[0].listed = Math.max(1, Math.round(Number(st[`price:${arg}`] ?? value)) || value)
      os.save(); os.sound('menu')
      return os.repaint()
    }
    if (verb === 'unlist') { const it = os.state().items.find(o => o.id === +arg); if (it) delete it.listed; os.save(); return os.repaint() }
    if (verb === 'sign') {
      const name = (st.bname ?? '').trim(), text = (st.btext ?? '').trim()
      if (!name || !text) return os.alert('A guestbook entry needs a name and a message.')
      const web = webOf(os)
      web.book = [...web.book ?? [], { name, text, day: dayOf(os) }].slice(-30)
      st.btext = ''
      os.save()
      return os.repaint()
    }
  },
  key(os, w, e) {
    if (e.key !== 'Enter') return false
    const f = (e.target as HTMLElement).dataset.in
    e.preventDefault()
    if (f === 'addr') browser.act!(os, w, 'addr')
    else if (f === 'q') browser.act!(os, w, 'search')
    else if (f === 'bname' || f === 'btext') browser.act!(os, w, 'sign')
    else if (f?.startsWith('price:')) browser.act!(os, w, `list:${f.slice(6)}`)
    return true
  },
}

/** Pay for the cart: the money goes now, the order is placed, the cart empties, swap listings are sold. */
function pay(os: Os, w: Win) {
  const lines = cartOf(os), fee = w.st.ship === 'drone' ? DRONE_FEE : 0, total = cartTotal(os) + fee
  if (!lines.length) return
  if (!os.pay(total, `WireCart: ${lines.length} thing${lines.length === 1 ? '' : 's'}${fee ? ', by drone' : ''}`)) return os.alert(`Payment declined. It comes to ${total}$; your account has ${os.cash()}$.`, 'Company Credit')
  const web = webOf(os)
  web.sold = [...web.sold ?? [], ...lines.flatMap(l => l.key ? [l.key] : [])].slice(-200)
  const from = [...new Set(lines.map(l => l.shop.replace(/ \(.*/, '')))].join(', ')
  const o = placeOrder(os.state(), lines.map(l => l.goods), w.st.ship === 'drone' ? 'drone' : 'freight', from)
  carts.set(os.id, [])
  os.save()
  go(os, w, `cart.wire/ok/${o.id}`)
}
/** Take a picture from the Gallery: 1$ (or free, the picture of the day), then it comes down the line to C:. */
function getPic(os: Os, arg: string) {
  const [path, cost] = arg.split(':'), [set, name] = path.split('/')
  const f = picsOf(set).find(o => o.name === name)
  if (!f) return
  if (+cost && !os.pay(+cost, `The Gallery: ${name}.PIC`)) return os.alert(`Payment declined. Your account has ${os.cash()}$.`, 'Company Credit')
  os.download(name, { pic: f.pic! }, PIC_SIZE, LINE)
}

// ---------------------------------------------------------------- Wiremail: orders by mail

const ENVELOPE = '<svg viewBox="0 0 16 16"><rect x="1.5" y="3.5" width="13" height="9" fill="#e8e4da" stroke="#2a2a30" stroke-width=".6"/><path d="M1.5 3.5L8 9l6.5-5.5" fill="none" stroke="#c25a3c" stroke-width=".9"/></svg>'
const FOLDERS: [string, string, (m: Mail) => boolean][] = [
  ['all', 'All', () => true],
  ['open', 'New orders', m => m.job?.state === 'open'],
  ['taken', 'Jobs', m => m.job?.state === 'taken'],
  ['done', 'Done', m => !!m.job && ['done', 'lapsed', 'declined'].includes(m.job.state)],
]
const STATE: Record<string, string> = { open: 'new', taken: 'job', done: 'paid', lapsed: 'lapsed', declined: 'declined' }
const who = (m: Mail) => m.from.split(/[,(]/)[0].trim()
/** Roughly which box an order wants: by the squares its things take, and one for the slip. */
function boxFor(m: Mail) {
  const area = 1 + m.job!.wants.reduce((n, w) => n + KINDS[w.kind].w * KINDS[w.kind].h * w.n, 0)
  return area <= 16 ? 'a small box' : area <= 24 ? 'a medium box' : area <= 64 ? 'a large box' : 'more than one box'
}
function letter(os: Os, m: Mail) {
  const day = dayOf(os), s = os.state()
  let out = `<div class="mail-head"><b>${esc(m.subject)}</b><br><small>From ${esc(m.from)} &middot; day ${m.day}</small></div><div class="mail-text">${esc(m.text).replace(/\n/g, '<br>')}</div>`
  if (!m.job) return out
  const j = m.job
  const rows = j.wants.map(x => { const have = stockOf(s, x.kind); return `<tr><td class="wart-cell">${art(os, { kind: x.kind })}</td><td>${esc(KINDS[x.kind].name)}</td><td>${x.n}</td><td class="${have >= x.n ? 'ok' : 'short'}">you have ${have}</td></tr>` }).join('')
  const left = j.due - day
  out += `<table class="wants">${rows}</table><div class="terms">Pays <b>${j.pay}$</b> on delivery &middot; due day ${j.due} (${left > 0 ? `in ${left} day${left === 1 ? '' : 's'}` : left === 0 ? 'today' : 'past due'}) &middot; late pays four fifths &middot; fits ${boxFor(m)}</div>`
  const boxes = s.items.filter(o => isBox(o)).map(b => quote(s, b)).filter(q => q?.mail.id === m.id)
  if (j.state === 'open') out += `<div class="btns98">${btn98('accept', 'Accept')}${btn98('decline', 'Decline')}</div>`
  else if (j.state === 'taken') out += `<div class="btns98">${btn98('slip', 'Print slip')}</div><div class="hint98">${boxes.length ? boxes.map(q => `A box has its slip: ${q!.have} of ${q!.wanted} things${q!.ships ? ', taped' : ', not taped yet'}; pays ${q!.pay - q!.fee}$ after the fee.`).join('<br>') : 'Print the slip, pack it with the things in a box, tape it shut, and put it in the dock. The carrier comes at night.'}</div>`
  else out += `<div class="hint98">${j.state === 'done' ? `Delivered and paid: ${j.paid}$.` : j.state === 'lapsed' ? 'Lapsed: nobody is waiting for it now.' : 'Declined.'}</div>`
  return out
}
const btn98 = (act: string, label: string) => `<button class="b98" data-act="${act}">${label}</button>`
export const mailer: Program = {
  id: 'mail', file: 'WIREMAIL.EXE', name: 'Wiremail', size: 0, memory: 96, speed: 1, rom: true, w: 600, h: 420, icon: ENVELOPE,
  start: () => ({ folder: 'all', sel: null as number | null, dial: null as number | null }),
  title: () => 'Wiremail',
  body(os, w) {
    const st = w.st
    if (!os.online()) {
      if (st.dial === null) queueMicrotask(() => dial(os, st, () => os.repaint())) // the mail is on the Wire: the line comes up first
      return st.dial !== null ? dialHtml(st) : '<div class="pane98 note98">Connecting...</div>'
    }
    const all = [...os.state().mail ?? []].reverse()
    const folder = FOLDERS.find(f => f[0] === st.folder) ?? FOLDERS[0]
    const list = all.filter(folder[2])
    const tabs = FOLDERS.map(([id, label, test]) => { const n = all.filter(test).filter(m => !m.read).length; return `<button class="tab98${id === folder[0] ? ' on' : ''}" data-act="folder:${id}">${label}${n ? ` (${n})` : ''}</button>` }).join('')
    const sel = all.find(m => m.id === st.sel)
    const rows = list.map(m => `<button class="row98 mailrow${m.id === st.sel ? ' on' : ''}${m.read ? '' : ' unread'}" data-act="read:${m.id}"><i>${m.kind === 'order' ? ENVELOPE : m.kind === 'spam' ? '&#9888;' : '&#9993;'}</i><span><b>${esc(who(m))}</b><br><small>${esc(m.subject)}</small></span><em>${m.job ? STATE[m.job.state] : `day ${m.day}`}</em></button>`).join('') || '<div class="note98">Nothing here.</div>'
    return `<div class="bar98">${tabs}</div><div class="mailbox"><div class="pane98 list98 maillist">${rows}</div><div class="pane98 letter" data-scroll="${os.id}:${w.pid}:${st.sel}">${sel ? letter(os, sel) : '<div class="note98">Pick a message.</div>'}</div></div>
      <div class="status98">${all.length} message${all.length === 1 ? '' : 's'} &middot; ${all.filter(m => !m.read).length} unread &middot; new orders come every morning</div>`
  },
  act(os, w, what) {
    const st = w.st, [verb, arg] = what.split(':'), mail = os.state().mail ?? []
    const m = mail.find(x => x.id === st.sel)
    if (verb === 'folder') st.folder = arg
    else if (verb === 'read') { st.sel = +arg; const r = mail.find(x => x.id === +arg); if (r && !r.read) { r.read = true; os.save() } }
    else if (verb === 'accept' && m?.job?.state === 'open') { m.job.state = 'taken'; os.save(); os.sound('menu') }
    else if (verb === 'decline' && m?.job?.state === 'open') { m.job.state = 'declined'; os.save() }
    else if (verb === 'slip' && m?.job?.state === 'taken') return os.print({ job: m.id, title: `Order #${m.id}` }, `slip #${m.id}`)
    os.repaint()
  },
}
