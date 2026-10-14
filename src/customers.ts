// Customers at the counter: who they are, what kinds of thing they are after (as tags), and what they say. Pure data and
// rules, no page; the terminal in main.ts draws it. A special customer would be a Customer with its own `choices` and
// `react`; for now everybody is the same simple sort.

/** The tags a customer can want (the same tags kinds carry): what people need to get by, not what things feel like. Each has a word for the tooltip and what a customer says about it. */
export const TAGS: Record<string, { label: string; desc: string; say: string }> = {
  food: { label: 'food', desc: 'Something to eat.', say: 'something to eat' },
  drink: { label: 'drink', desc: 'Something to drink.', say: 'something to drink' },
  alcohol: { label: 'alcohol', desc: 'A drink with alcohol in it.', say: 'something with alcohol in it' },
  medicine: { label: 'medicine', desc: 'Pills, dressings, anything that treats.', say: 'medicine' },
  light: { label: 'light', desc: 'Something to see by in the dark.', say: 'a light for the dark' },
  book: { label: 'book', desc: 'Something to read.', say: 'something to read' },
  fuel: { label: 'fuel', desc: 'Something to burn: for a lamp or a stove.', say: 'fuel for a lamp' },
  valuable: { label: 'valuable', desc: 'Worth something to someone: to keep, or to trade on.', say: 'something of value' },
}

export interface Customer { id: number; name: string; wants: string[]; mood: number }

const NAMES = ['Mara', 'Odell', 'Pim', 'Ines', 'Tobias', 'Wren', 'Hollis', 'Bea', 'Corvin', 'Dot', 'Ansel', 'Yuki']

/** A new customer: one to three different wants. */
export function arrive(id: number, rand: () => number = Math.random): Customer {
  const pool = Object.keys(TAGS)
  const wants: string[] = []
  for (let n = 1 + Math.floor(rand() * 3); n > 0; n--) wants.push(...pool.splice(Math.floor(rand() * pool.length), 1))
  return { id, name: NAMES[Math.floor(rand() * NAMES.length)], wants, mood: 0 }
}

/** Their first words: they say what they are after. */
export function greeting(c: Customer): string {
  const w = c.wants.map(t => TAGS[t]?.say ?? t)
  return `Hello. I'm looking for ${w.length > 1 ? `${w.slice(0, -1).join(', ')} and ${w[w.length - 1]}` : w[0]}.`
}

/** What is offered (the tags of each thing on the inside counter) against what they want: which wants are met, what they say, and whether they buy (everything they want is there). */
export function judge(c: Customer, offered: string[][]): { met: string[]; say: string; sold: boolean } {
  if (!offered.length) return { met: [], say: 'The counter is empty. Is this a joke?', sold: false }
  const have = new Set(offered.flat())
  const met = c.wants.filter(t => have.has(t))
  if (met.length === c.wants.length) return { met, say: 'Yes, that is just what I wanted. I will take it.', sold: true }
  if (met.length) return { met, say: `Some of it. I still want ${c.wants.filter(t => !met.includes(t)).map(t => TAGS[t]?.say ?? t).join(' and ')}.`, sold: false }
  return { met, say: 'None of this is what I came for.', sold: false }
}
