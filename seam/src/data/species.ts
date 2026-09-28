// Appendix B: what lives in the Accretion. The night sim reads mass, diet, r, d, vuln, migrates, habitat and the
// rule flags (sings, printed, signed, raids); the encounter fields and text are for runs and the Bestiary.

import type { Props } from '../model/state.ts'

export type Behaviour = 'skittish' | 'territorial' | 'hunter' | 'scavenger' | 'indifferent'

export interface Species {
  id: string
  name: string
  icon: string                   // game-icons name
  mass: number                   // biomass per individual
  diet: Record<string, number>   // food → preference weight; foods are 'film', 'scrap', 'corpses' or a species id
  r: number                      // growth when fed
  d: number                      // death when starving
  vuln: number                   // share of its biomass predators can reach
  migrates: boolean
  habitat?: 'flooded'
  sings?: number                 // eats this share of its diet on its level and one open connection away, each night (6.3.7)
  printed?: number               // the city prints this many per unit of corpse biomass each night (6.3.6)
  signed?: true                  // carries a Signature: sweeps pass it by
  raids?: true                   // hunts people through the hatch (6.6)
  detect: number
  pack: number
  aware: number
  threat: number
  hp: number
  behaviour: Behaviour
  props: Props
  drops: Record<string, number>  // Harvest
  text: string
}

export const SPECIES: Species[] = [
  {
    id: 'grub', name: 'Tallow Grub', icon: 'maggot', mass: 1, diet: { film: 1 }, r: 0.25, d: 0.30, vuln: 0.2 /* doc 0.5 */, migrates: true,
    detect: 0.3, pack: 6, aware: 0, threat: 0, hp: 2, behaviour: 'skittish', props: { ROT: 1 },
    drops: { grubCarcass: 1 }, // or a Tallow Brick with the Cutter
    text: 'Pale, soft, the length of a forearm. It eats the film and becomes fat. Everything eats it. You will too.',
  },
  {
    id: 'moth', name: 'Rust Moth', icon: 'fly', mass: 0.2, diet: { scrap: 1 }, r: 0.35, d: 0.40, vuln: 0.05 /* doc 0.4 */, migrates: true,
    // A swarm is one encounter. Its threat is −10 cond to every metal tool on the belt instead of HP.
    detect: 0.05, pack: 20, aware: 1, threat: 1, hp: 1, behaviour: 'hunter', props: { ROT: 1 },
    drops: {},
    text: 'A cloud of flakes that turns out to be alive. Wherever the Masons shed metal, they come to eat it, including off your tools.',
  },
  {
    id: 'crab', name: 'Lantern Crab', icon: 'crab', mass: 2, diet: { moth: 0.7, film: 0.3 }, r: 0.08 /* doc 0.12 */, d: 0.20, vuln: 0.1 /* doc 0.3 */, migrates: false,
    detect: 0.5, pack: 2, aware: 1, threat: 1, hp: 4, behaviour: 'territorial', props: { LIGHT: 2 },
    drops: { crabShell: 1 },
    text: 'Carries its light in its back like a grudge. Eats moths; hates company.',
  },
  {
    id: 'eel', name: 'Cable Eel', icon: 'eel', mass: 4, diet: { grub: 0.6, crab: 0.4 }, r: 0.08, d: 0.15, vuln: 0.2, migrates: false, habitat: 'flooded',
    detect: 0.6, pack: 1, aware: 2, threat: 3, hp: 8, behaviour: 'hunter', props: { CHARGE: 2 },
    drops: { liveWire: 1 },
    text: 'Two metres of muscle that hums. It lives in the flooded ducts and anything that touches the water is its business.',
  },
  {
    id: 'hound', name: 'Glasshound', icon: 'hound', mass: 6, diet: { grub: 0.5, crab: 0.3 }, r: 0.2 /* doc 0.10 */, d: 0.20, vuln: 0.15, migrates: true, raids: true,
    detect: 1.0, pack: 4, aware: 3, threat: 3, hp: 10, behaviour: 'hunter', props: { COLD: 1 },
    drops: { glassTooth: 2 },
    text: 'Long, cold, quiet, and never alone. The Choir keeps them few. Nobody knows what would keep them few without it.',
  },
  {
    // Met only at the Nave (its lair). It feeds by song, not in the eating step, and has no births or deaths.
    id: 'choir', name: 'The Choir', icon: 'sing', mass: 80, diet: { hound: 1 }, r: 0, d: 0, vuln: 0, migrates: false, sings: 0.15 /* doc 0.08 */, signed: true,
    detect: 1, pack: 1, aware: 2, threat: 8, hp: 120, behaviour: 'indifferent', props: { SIGNAL: 3, CHARGE: 3 },
    drops: { choirHeart: 1 }, // when silenced
    text: 'It does not move. It sings, and hounds walk to it from floors away, and do not walk back.',
  },
  {
    id: 'scourer', name: 'Scourer', icon: 'vacuum-cleaner', mass: 1, diet: { corpses: 1 }, r: 0, d: 0.50, vuln: 0.4, migrates: true, printed: 0.05 /* doc 0.02 */, signed: true,
    detect: 0.4, pack: 8, aware: 1, threat: 1, hp: 3, behaviour: 'scavenger', props: { ROT: -2 },
    drops: {},
    text: "The city's janitors. Printed where the dead pile up; gone when the floor is clean. They don't distinguish between a corpse and a pack left lying on the floor.",
  },
  {
    // Not a population: present on a level for 2 days after a sweep, at encounter weight 5. Hunts unless authorised.
    id: 'auditor', name: 'Auditor', icon: 'android-mask', mass: 0, diet: {}, r: 0, d: 0, vuln: 0, migrates: false,
    detect: 5, pack: 3, aware: 3, threat: 6, hp: 30, behaviour: 'hunter', props: { SIGNAL: 3 },
    drops: { fragment: 1 }, // only sometimes (T.huskChance); the husk itself isn't an item
    text: 'Tall, thin, polite. It asks for your Signature. It does not ask twice.',
  },
  {
    // Not a population: met at Mason Works sites. Indifferent, but hits back.
    id: 'mason', name: 'Mason', icon: 'robot-golem', mass: 0, diet: {}, r: 0, d: 0, vuln: 0, migrates: false,
    detect: 0, pack: 1, aware: 0, threat: 4, hp: 60, behaviour: 'indifferent', props: { MASS: 2 },
    drops: { masonPlate: 1 },
    text: 'A walking building site. It has never seen you. It never will.',
  },
]

export const SP: Record<string, Species> = Object.fromEntries(SPECIES.map(sp => [sp.id, sp]))
