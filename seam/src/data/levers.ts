// Appendix F: levers. Each costs a step and some attention, and shows its effect in the Level entry once pulled.

import type { Prop } from '../model/state.ts'

export interface Lever {
  id: string
  name: string
  tool?: string          // must be on the belt
  wear?: number          // what pulling it takes off that tool
  spend?: [string, number] // used up from the pack
  belt?: [Prop, number]  // needs at least this much on the belt
  attention: number      // on the lever's level
  effect: string         // what the Level entry shows once it's been pulled
}

export const LEVERS: Record<string, Lever> = Object.fromEntries(([
  { id: 'heatValve', name: 'Heat Valve', attention: 5, effect: "Turns the Galleries' heat off (2 → 0) or on again." },
  { id: 'conduitTap', name: 'Conduit Tap', spend: ['liveWire', 1], attention: 10, effect: "Feeds the Seam's Charger 3 Cells a night while tapped; +10 attention a night on the Galleries. The wire stays in it: off and on again freely." },
  { id: 'bulkhead', name: 'Bulkhead', tool: 'prybar', wear: 10, attention: 10, effect: 'Opens or closes the way between the Galleries and the Glass Stair.' },
  { id: 'sluice', name: 'Sluice', attention: 10, effect: 'Drains the Ducts, or floods them again. Drained, the eels die, and the shaft and the Drowned Cache open.' },
  { id: 'mothLure', name: 'Moth Lure', spend: ['scrap', 3], attention: 5, effect: "Moths come to the Works and eat at the Masons: a course less building for 10 nights, and the moths boom on what they strip. Needs moths." },
  { id: 'sabotage', name: 'Sabotage', tool: 'prybar', wear: 20, attention: 25, effect: 'A course less building for 3 nights. Masons notice: one may come.' },
  { id: 'tower', name: 'Audit Tower', belt: ['SIGNAL', 1], attention: 0, effect: 'The Stair\'s attention +60: past 100, the Auditors sweep it tonight. Leave before night.' },
  { id: 'resonancePipe', name: 'Resonance Pipe', tool: 'cutter', wear: 30, attention: 40, effect: 'Silences the Choir. It stops singing at once, and dies over ten nights.' },
] as Lever[]).map(l => [l.id, l]))
