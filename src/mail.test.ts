import assert from 'node:assert/strict'
import { accept, catchUp, decline, isOpen, jobOf, offer, packed, slipFor, wanted, when } from './mail.ts'
import { advance, applyDrop, find, intoHost, lift, spawn, start, type State } from './world.ts'

/** The same rolls every run. */
const seeded = (seed: number) => () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }

// A new game gets the how-to notice, the first week's rent and a morning batch of offers.
{
  const s = start()
  catchUp(s, seeded(1))
  const mail = s.mail!
  assert.equal(s.mailAt, 0)
  assert.equal(mail[0].type, 'notice')
  const rent = mail.filter(m => m.type === 'bill')
  assert.equal(rent.length, 1)
  assert.equal(rent[0].amount, 125)
  assert.equal(when(rent[0].due!), 'day 7 · 19:00')
  const offers = mail.filter(m => m.type === 'offer')
  assert.ok(offers.length >= 2 && offers.length <= 4)
  for (const o of offers) {
    assert.ok(o.terms!.want.length >= 1 && o.terms!.pay > 0 && o.terms!.due > 0 && o.expires! > 0)
    assert.equal(o.state, 'new')
  }
  // bringing it up again without time passing changes nothing
  catchUp(s, seeded(2))
  assert.equal(s.mail!.length, mail.length)
}

// Hours pass: open offers expire at their time, and the next morning brings a new batch.
{
  const s = start()
  catchUp(s, seeded(3))
  const first = s.mail!.filter(m => m.type === 'offer')
  advance(s, 12)
  catchUp(s, seeded(4))
  for (const o of first) assert.equal(o.state, 'expired') // every offer stays open at most 10 hours
  assert.ok(s.mail!.some(m => m.type === 'offer' && m.at === 12 && isOpen(m)))
  assert.equal(s.mailAt, 12)
}

// Rent rises 2% a month, rounded up: the bill on day 29 is for week 5.
{
  const s = start()
  catchUp(s, seeded(5))
  advance(s, 28 * 12)
  catchUp(s, seeded(6))
  const bills = s.mail!.filter(m => m.type === 'bill')
  assert.equal(bills.length, 5)
  assert.equal(bills[4].amount, Math.ceil(125 * 1.02))
  assert.match(bills[4].subject, /week 5/)
}

// Accepting prints the slip on free squares of the board; it can only be done once, and declined offers stay closed.
{
  const s = start()
  const o = offer(s, 0, seeded(7))
  const slip = accept(s, o.id)
  assert.ok(typeof slip !== 'string')
  assert.equal(slip.kind, 'slip')
  assert.equal(slip.in, undefined)
  assert.equal(jobOf(s, slip), o)
  assert.equal(slipFor(s, o.id), slip)
  assert.equal(o.state, 'accepted')
  assert.equal(typeof accept(s, o.id), 'string')
  const o2 = offer(s, 0, seeded(8))
  decline(s, o2.id)
  assert.equal(o2.state, 'declined')
  assert.equal(typeof accept(s, o2.id), 'string')
}

// No room on the board: no slip, and the offer stays open.
{
  const s: State = { items: [], next: 1 }
  while (spawn(s, 'cell')) { /* fill every square */ }
  const o = offer(s, 0, seeded(9))
  assert.equal(typeof accept(s, o.id), 'string')
  assert.equal(o.state, 'new')
}

// What is packed with a slip counts toward its job; a slip lying on the board is not packed.
{
  const s = start()
  const o = offer(s, 0, seeded(10))
  o.terms!.want = [{ kind: 'cell', where: { charge: '>=80' }, n: 2, label: 'charged cell (80+)', short: 'cell' }]
  const slip = accept(s, o.id)
  assert.ok(typeof slip !== 'string')
  assert.deepEqual(packed(s, slip)!.lines.map(l => l.have), [0])
  assert.equal(packed(s, slip)!.packed, false)
  const crate = s.items.find(i => i.kind === 'crate')!
  const cells = s.items.filter(i => i.kind === 'cell')
  cells.forEach((c, i) => { c.p!.charge = i === 0 ? 50 : 100 }) // one too flat to count
  for (const id of [slip.id, ...cells.map(c => c.id)]) applyDrop(s, lift(s, id)!, intoHost(s, lift(s, id)!, crate.id)!)
  assert.equal(find(s, slip.id)!.in?.host, crate.id)
  const p = packed(s, slip)!
  assert.equal(p.packed, true)
  assert.deepEqual(p.lines.map(l => l.have), [2]) // three would do, but it only wants two
  assert.equal(wanted(s, o).length, 3)
}

console.log('mail ok')
