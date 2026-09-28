// Appendix C: supplies, materials and tools; the containers of the Seam (10.3); recipes (C.3); the starting stock (9.3).
// Relics (Appendix D) are in relics.ts and share this shape.

import type { Props } from '../model/state.ts'

export interface Kind {
  id: string
  name: string
  icon: string                   // game-icons name
  color: string
  w: number
  h: number
  stack: number
  props: Props                   // the property language (10.1)
  food?: number                  // what it's worth to the village a night
  water?: number
  power?: number
  fresh?: number                 // nights before it rots
  tool?: true                    // wears (cond 100 → 0) and breaks into scrap
  metal?: true                   // rust moths eat at it
  weapon?: number                // fight bonus on the belt
  bait?: string[]                // species it lures (C.2)
  relic?: true
  dims?: number                  // runs out on the belt before its light dies
  text: [string, string]         // what it looks like; what it seems to do
  uses: string                   // its ways out, for the Catalog
}

const K = (k: Omit<Kind, 'props'> & { props?: Props }): Kind => ({ props: {}, ...k })

export const KINDS: Record<string, Kind> = Object.fromEntries([
  K({ id: 'tallow', name: 'Tallow Brick', icon: 'clay-brick', color: '#e8d9a8', w: 1, h: 1, stack: 4, food: 2, fresh: 8, bait: ['scourer', 'hound'],
    text: ['A grey brick of rendered grub fat, waxy and faintly sweet.', 'FOOD 2. Keeps the better part of a week.'], uses: 'eaten; bait for scourers and hounds' }),
  K({ id: 'moss', name: 'Moss Cake', icon: 'algae', color: '#86b35e', w: 1, h: 1, stack: 4, food: 1, fresh: 3,
    text: ['A flat cake of lamp-grown moss, pressed damp.', 'FOOD 1. Gone bad in three nights.'], uses: 'eaten' }),
  K({ id: 'grubCarcass', name: 'Grub Carcass', icon: 'meat', color: '#d9b49a', w: 2, h: 1, stack: 1, food: 1, fresh: 2, props: { ROT: 1 }, bait: ['hound', 'eel'],
    text: ['A whole grub, still soft, already turning.', 'Eaten raw if you must. A Cutter renders it into something that keeps.'], uses: 'eaten raw; the Cutter makes a Tallow Brick; bait for hounds and eels' }),
  K({ id: 'water', name: 'Water Canister', icon: 'water-flask', color: '#6fb6d9', w: 1, h: 2, stack: 1, water: 2,
    text: ['A dented canister of water wrung from warm air.', 'WATER 2.'], uses: 'drunk' }),
  K({ id: 'cell', name: 'Cell', icon: 'battery-100', color: '#f2d15c', w: 1, h: 1, stack: 4, power: 1,
    text: ['A salvaged power cell, heavy and faintly warm.', 'POWER 1. Burned for lamps and machines, it empties.'], uses: 'burned for light and machines, becoming an Empty Cell' }),
  K({ id: 'emptyCell', name: 'Empty Cell', icon: 'battery-0', color: '#8a8a80', w: 1, h: 1, stack: 4,
    text: ['A power cell with nothing left in it.', 'The Charger fills it again, given something to fill it with.'], uses: 'charged in the Charger' }),
  K({ id: 'film', name: 'Film Scrapings', icon: 'dripping-goo', color: '#a3c47c', w: 1, h: 1, stack: 5, food: 0, fresh: 3, bait: ['grub', 'crab'],
    text: ['A smear of warm biofilm scraped off a pipe.', 'Nothing a person can live on. Things that graze want it.'], uses: 'bait for grubs and crabs' }),
  K({ id: 'scrap', name: 'Scrap', icon: 'nails', color: '#a0968a', w: 1, h: 1, stack: 6, props: { MASS: 1 }, bait: ['moth'],
    text: ['Offcuts the Masons dropped and never missed.', 'Moths come for it. The Workbench can use it.'], uses: 'bait for moths (Moth Lure); Workbench recipes' }),
  K({ id: 'liveWire', name: 'Live Wire', icon: 'wire-coil', color: '#e0a040', w: 1, h: 2, stack: 1, props: { CHARGE: 1 },
    text: ['A length of eel-nerve that still twitches with current.', 'Tapped into the conduit, it feeds the Charger. It also fills one Empty Cell.'], uses: 'the Conduit Tap; charges an Empty Cell' }),
  K({ id: 'glassTooth', name: 'Glass Tooth', icon: 'tooth', color: '#cfe8f0', w: 1, h: 1, stack: 8, props: { COLD: 1 },
    text: ['A glasshound tooth, cold as a window in winter.', 'Food beside it keeps. Three of them edge a spear.'], uses: 'the Glass Spear; keeps food beside it' }),
  K({ id: 'crabShell', name: 'Crab Shell', icon: 'crab-claw', color: '#e07a4a', w: 2, h: 2, stack: 1, props: { LIGHT: 1 },
    text: ['A lantern crab\'s back, still faintly lit from inside.', 'A Cutter could make a lamp of it.'], uses: 'the Cutter makes a Shell Lamp' }),
  K({ id: 'masonPlate', name: 'Mason Plate', icon: 'metal-plate', color: '#8f9aa6', w: 2, h: 2, stack: 1, props: { MASS: 2 },
    text: ['A plate of a Mason\'s hide, warm and seamless.', 'A Pry Bar breaks it into scrap. Loudly.'], uses: 'the Pry Bar makes Scrap ×4' }),
  K({ id: 'bolt', name: 'Bolt', icon: 'bolt-drop', color: '#b4b4bc', w: 1, h: 1, stack: 12, props: { MASS: 1 },
    text: ['A heavy bolt, good for throwing ahead of you.', 'Where it lands tells you what waits there. Sometimes you get it back.'], uses: 'thrown to reveal a hazard' }),
  K({ id: 'cutter', name: 'Cutter', icon: 'box-cutter', color: '#d4d8de', w: 1, h: 2, stack: 1, tool: true, metal: true,
    text: ['A folding blade that has been sharpened to a sliver.', 'Harvests kills and cuts things into better things. Wears as it works.'], uses: 'Harvest; tool-on-item recipes; the Resonance Pipe' }),
  K({ id: 'prybar', name: 'Pry Bar', icon: 'crowbar', color: '#9a6a48', w: 1, h: 3, stack: 1, tool: true, metal: true,
    text: ['A length of bar bent at one end by someone strong.', 'Opens what was shut and breaks what was whole.'], uses: 'the Bulkhead; Sabotage; Mason Plate into Scrap' }),
  K({ id: 'rebarSpear', name: 'Rebar Spear', icon: 'stone-spear', color: '#8f7262', w: 1, h: 4, stack: 1, weapon: 2,
    text: ['A rod of rebar ground to a point.', 'On the belt, it hits for 2 more. Glass teeth would edge it.'], uses: 'fighting, on the belt; the Glass Spear' }),
  K({ id: 'glassSpear', name: 'Glass Spear', icon: 'ice-spear', color: '#bfe6f2', w: 1, h: 4, stack: 1, weapon: 3, props: { COLD: 1 },
    text: ['A rebar spear edged with three glass teeth.', 'On the belt, it hits for 3 more. Cold to hold.'], uses: 'fighting, on the belt' }),
  K({ id: 'shellLamp', name: 'Shell Lamp', icon: 'lantern', color: '#f0b86a', w: 2, h: 1, stack: 1, props: { LIGHT: 1 }, dims: 10,
    text: ['A crab shell cut into a lamp. It needs no power.', 'On the belt, it shows what waits where you step. It dims with every run.'], uses: 'light on the belt' }),
  K({ id: 'brochure', name: 'Authority Brochure', icon: 'folded-paper', color: '#7ed957', w: 1, h: 1, stack: 1, props: { SIGNAL: 0 },
    text: ['A glossy leaflet, sky-blue, bright as the day it was printed.', 'Somebody wanted you to read this, very much, a long time ago.'], uses: 'lore' }),
  K({ id: 'fragment', name: 'Signature Fragment', icon: 'crystal-shine', color: '#c8f2ff', w: 1, h: 1, stack: 1, props: { SIGNAL: 1 },
    text: ['A chip of something that was once part of a person\'s right to exist here.', 'Presented at a terminal, it is spent, and the city listens a little more.'], uses: 'presented at a terminal for access' }),
].map(k => [k.id, k]))

export type Box = 'stores' | 'cold' | 'lead' | 'charger' | 'lab' | 'workbench' | 'pack' | 'belt'

export interface BoxDef { id: Box; name: string; w: number; h: number; env: string; icon: string; blurb: string }
/** The Seam's furniture (10.3) and the runner's kit (10.5). Rooms are fixed; only items go in grids. */
export const BOXES: Record<Box, BoxDef> = {
  stores: { id: 'stores', name: 'Stores', w: 8, h: 5, env: 'none', icon: 'wooden-crate', blurb: 'Food spoils here as it would anywhere. What carries Signal leaks from here into the walls.' },
  cold: { id: 'cold', name: 'Cold Locker', w: 4, h: 3, env: 'COLD 2 · needs 1 POWER', icon: 'snowflake-2', blurb: 'Food doesn\'t spoil while it runs. Unpowered, it\'s just a box.' },
  lead: { id: 'lead', name: 'Lead Box', w: 3, h: 2, env: 'SEAL', icon: 'locked-chest', blurb: 'What\'s inside affects nothing outside, and nothing leaks.' },
  charger: { id: 'charger', name: 'Charger', w: 3, h: 2, env: 'CHARGE source', icon: 'battery-pack', blurb: 'Fills Empty Cells: 3 a night from the Galleries conduit, if it\'s tapped, and more from anything charged inside.' },
  lab: { id: 'lab', name: 'Lab Bench', w: 3, h: 3, env: 'stimulus dial', icon: 'microscope', blurb: 'Tests one property of a relic each night.' },
  workbench: { id: 'workbench', name: 'Workbench', w: 4, h: 3, env: 'none', icon: 'anvil', blurb: 'Drag a tool onto an item, or one item onto another, to make something. It works in the pack too.' },
  pack: { id: 'pack', name: 'Pack', w: 6, h: 4, env: 'carried', icon: 'backpack', blurb: 'It carries things. Only bolts and bait can be used from the pack.' },
  belt: { id: 'belt', name: 'Belt', w: 6, h: 1, env: 'active', icon: 'belt', blurb: 'What\'s on the belt is in hand: tools work, weapons count, relics act.' },
}
/** The Seam's own furniture, which stays home when the runner goes out. */
export const HOME: Box[] = ['stores', 'cold', 'lead', 'charger', 'lab', 'workbench']

export interface Recipe { drag: string; onto: string; gives: string; n: number; wear?: number; spend?: number; loud?: number }
/** C.3: drag the first onto the second. Wear is taken off a tool; spend is how many of the dragged pile it uses up. */
export const RECIPES: Recipe[] = [
  { drag: 'cutter', onto: 'grubCarcass', gives: 'tallow', n: 1, wear: 2 },
  { drag: 'cutter', onto: 'crabShell', gives: 'shellLamp', n: 1, wear: 5 },
  { drag: 'prybar', onto: 'masonPlate', gives: 'scrap', n: 4, wear: 5, loud: 5 },
  { drag: 'glassTooth', onto: 'rebarSpear', gives: 'glassSpear', n: 1, spend: 3 },
  { drag: 'liveWire', onto: 'emptyCell', gives: 'cell', n: 1, spend: 1 },
]

/** 9.3: 12 FOOD, 10 WATER, 8 Cells and 4 empty, and the kit. */
export const START: { box: Box; kind: string; n: number }[] = [
  { box: 'stores', kind: 'tallow', n: 4 },
  { box: 'stores', kind: 'moss', n: 4 },
  { box: 'stores', kind: 'water', n: 5 },
  { box: 'stores', kind: 'cell', n: 8 },
  { box: 'stores', kind: 'emptyCell', n: 4 },
  { box: 'belt', kind: 'prybar', n: 1 },
  { box: 'belt', kind: 'cutter', n: 1 },
  { box: 'pack', kind: 'bolt', n: 12 },
  { box: 'pack', kind: 'film', n: 3 },
]
