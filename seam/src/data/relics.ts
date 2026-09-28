// Appendix D: relics. Their belt and home effects come from their properties alone; only Use actions are special.

import type { Kind } from './items.ts'

export interface Relic extends Kind { quote: string; use?: string; charges?: number }

const R = (r: Omit<Relic, 'stack' | 'relic'>): Relic => ({ stack: 1, relic: true, ...r })

export const RELICS: Record<string, Relic> = Object.fromEntries([
  R({ id: 'stillCoil', name: 'Still Coil', icon: 'spring', color: '#bfe3ff', w: 1, h: 1, props: { COLD: 2 },
    text: ['A spring of dull metal wound so tight it hums below hearing.', 'Frost grows on its inside, never its outside.'],
    quote: 'Kept my fish a week. Kept my hand numb a month.', uses: 'keeps food beside it; resists heat on the belt' }),
  R({ id: 'stubCandle', name: 'Stub Candle', icon: 'candle-flame', color: '#ffd27a', w: 1, h: 1, props: { LIGHT: 2, HEAT: 1 }, use: 'flare',
    text: ['A candle end, lit, that has not gotten shorter since anyone has owned it.', 'The flame leans toward exits.'],
    quote: "It doesn't want to go out. I don't blame it.", uses: 'lights the Seam; shows what waits on the belt; a flare scatters moths and crabs' }),
  R({ id: 'hollowPair', name: 'Hollow Pair', icon: 'metal-disc', color: '#d9a066', w: 2, h: 1, props: { MASS: -2 },
    text: ['Two copper discs, a hand apart, held by nothing.', 'Put your finger between them and feel nothing, very firmly.'],
    quote: 'Lighter to carry than it should be. So is everything near it.', uses: 'on the belt, steps make no noise and heavy things fall slower' }),
  R({ id: 'hummingKnot', name: 'Humming Knot', icon: 'knot', color: '#f0d060', w: 1, h: 1, props: { CHARGE: 3 },
    text: ['A fist of wire tied in a knot that has no ends.', 'It is warm, and it wants to touch other metal.'],
    quote: 'The cells fill up by morning. So do my teeth, with that sound.', uses: 'in the Charger, a Cell a night; on the belt, a harder hit' }),
  R({ id: 'wetLung', name: 'Wet Lung', icon: 'lungs', color: '#c98a9a', w: 1, h: 2, props: { ROT: -2 },
    text: ['Grey, soft, and breathing, slowly, on its own.', 'Things near it keep.'],
    quote: "I sleep with it by the bread. Don't tell anyone.", uses: 'food beside it keeps a night longer; on the belt, it heals' }),
  R({ id: 'chimeShard', name: 'Chime Shard', icon: 'windchimes', color: '#e6d8ff', w: 1, h: 1, props: { SIGNAL: 3 }, use: 'present',
    text: ['A sliver of something that rings when nobody touches it.', 'Terminals wake up when it\'s near.'],
    quote: 'The tall ones stopped and listened to it. Then they looked at me.', uses: 'terminals read for it; an Auditor pauses for it once' }),
  R({ id: 'choirHeart', name: 'Choir Heart', icon: 'heart-organ', color: '#e88ab8', w: 2, h: 2, props: { CHARGE: 4, SIGNAL: 2 },
    text: ['It is still singing, very quietly, to no one.', 'Anything charged near it fills.'],
    quote: "We have light now. We don't talk about how.", uses: 'in the Charger, two Cells a night' }),
  R({ id: 'unbuilder', name: 'Unbuilder', icon: 'hammer-drop', color: '#ff8a6a', w: 1, h: 3, props: { MASS: 3, SIGNAL: 2 }, use: 'fire', charges: 1,
    text: ["A Mason's tool, maybe, or a Mason's opposite.", 'Holding it makes the floor feel temporary.'],
    quote: "I used it once. The quiet afterwards was the loudest thing I've heard.", uses: 'fired at a Mason Works: the Masons there lose a course for good' }),
].map(r => [r.id, r]))

/** What a relic roll at a cache turns up (Appendix D), by weight. */
export const RELIC_ROLLS: [string, number][] = [['stillCoil', 25], ['stubCandle', 25], ['wetLung', 20], ['hollowPair', 15], ['hummingKnot', 10], ['chimeShard', 5]]

export type Dial = 'heat' | 'coil' | 'scale' | 'dark' | 'receiver' | 'culture'
/** The Lab Bench's stimulus dial (10.4): each setting tests a relic for one property, overnight. */
export const DIALS: Record<Dial, { name: string; props: ('HEAT' | 'COLD' | 'CHARGE' | 'MASS' | 'LIGHT' | 'SIGNAL' | 'ROT')[]; blurb: string }> = {
  heat: { name: 'Heat plate', props: ['HEAT', 'COLD'], blurb: 'Warms it slowly and watches the frost: HEAT or COLD.' },
  coil: { name: 'Coil', props: ['CHARGE'], blurb: 'Wraps it in wire and counts the sparks: CHARGE.' },
  scale: { name: 'Scale', props: ['MASS'], blurb: 'Weighs it against a brick that never changes: MASS.' },
  dark: { name: 'Dark box', props: ['LIGHT'], blurb: 'Shuts it away from every light: LIGHT.' },
  receiver: { name: 'Receiver', props: ['SIGNAL'], blurb: 'Listens to it all night: SIGNAL. Loud: the Seam\'s attention rises by its SIGNAL ×5.' },
  culture: { name: 'Culture dish', props: ['ROT'], blurb: 'Sets it beside a dish of film: ROT.' },
}
/** The properties the lab can test; knowing all of them shows a relic's Class. */
export const TESTED = ['HEAT', 'COLD', 'CHARGE', 'MASS', 'LIGHT', 'SIGNAL', 'ROT'] as const
