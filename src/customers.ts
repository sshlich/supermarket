// Customers at the counter: who they are, what kinds of thing they are after (as tags), and what they say. Pure data and
// rules, no page; the terminal in main.ts draws it. A special customer would be a Customer with its own `choices` and
// `react`; for now everybody is the same simple sort.

/** The tags a customer can want (the same tags kinds carry), each with an icon (game-icons name, see scripts/icons.ts), a word for the tooltip, and what a customer says about it. */
export const TAGS: Record<string, { icon: string; label: string; desc: string; say: string }> = {
  drink: { icon: 'beer-bottle', label: 'drink', desc: 'Something to drink.', say: 'something to drink' },
  food: { icon: 'bread', label: 'food', desc: 'Something to eat.', say: 'something to eat' },
  tool: { icon: 'wrench', label: 'tool', desc: 'A tool, for making or mending.', say: 'a tool for a job' },
  fragile: { icon: 'cracked-glass', label: 'fragile', desc: 'Breaks easily: glass, china, eggs.', say: 'something delicate' },
  shiny: { icon: 'gems', label: 'shiny', desc: 'Bright and pretty, worth a look.', say: 'something shiny' },
  book: { icon: 'open-book', label: 'book', desc: 'Something to read.', say: 'something to read' },
  warm: { icon: 'campfire', label: 'warm', desc: 'Keeps the cold off.', say: 'something to keep warm' },
  soft: { icon: 'pillow', label: 'soft', desc: 'Soft to the touch.', say: 'something soft' },
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

/** What is offered (the tags of each thing on the inside counter) against what they want: which wants are met, and what they say. */
export function judge(c: Customer, offered: string[][]): { met: string[]; say: string } {
  if (!offered.length) return { met: [], say: 'The counter is empty. Is this a joke?' }
  const have = new Set(offered.flat())
  const met = c.wants.filter(t => have.has(t))
  if (met.length === c.wants.length) return { met, say: 'Yes, that is just what I wanted.' }
  if (met.length) return { met, say: `Some of it. I still want ${c.wants.filter(t => !met.includes(t)).map(t => TAGS[t]?.say ?? t).join(' and ')}.` }
  return { met, say: 'None of this is what I came for.' }
}
