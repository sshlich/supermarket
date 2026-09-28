// Appendix A: the levels of the Vertical Slice, how they connect, their sites, and the Masons' schedule (6.5).

export type SiteType = 'gallery' | 'nest' | 'cache' | 'terminal' | 'lever' | 'tower' | 'works' | 'connection'

export interface SiteDef {
  id: string
  name: string
  type: SiteType
  hazard?: string            // at the start (Appendix E)
  levers?: string[]          // Appendix F
  to?: string[]              // connections that leave from here
  lair?: string              // the species met here
  loot?: string[]            // a cache's fixed contents; 'relic' is a roll on the relic table
  requires?: 'drained'
}

export interface LevelDef {
  id: string
  name: string
  floor: string
  survival: { cls: number; safety: string; stability: 'Stable' | 'Unstable'; entities: string }
  heat: 0 | 1 | 2
  flooded: boolean
  F: number
  Fmax: number
  S: number
  M: number
  N: Record<string, number>
  buries?: true              // its Masons build toward the Seam (6.5)
  appears?: number           // the day the Masons register it
  home?: true                // next to the Seam: the villagers hear it through the walls
  palette: string[]          // dithering palette, darkest first (13.3)
  at: [number, number]       // where it sits on the Atlas, 0-100 (up is higher floors)
  sites: SiteDef[]
  text: string
}

export interface ConnectionDef {
  id: string
  a: string                  // 'seam' is home, not a level
  b: string
  type: string
  cost: number               // steps
  open: boolean
  requires?: 'drained'       // passable only while neither end is flooded
  appears?: number
}

export const LEVELS: Record<string, LevelDef> = {
  galleries: {
    id: 'galleries', name: 'Warm Galleries', floor: '-213',
    survival: { cls: 1, safety: 'Safe', stability: 'Stable', entities: 'Many' },
    heat: 2, flooded: false, F: 300, Fmax: 400, S: 60, M: 1, buries: true, home: true,
    palette: ['#140b07', '#7a3b1c', '#e39a55', '#f6e0b5'], at: [34, 60],
    N: { grub: 80, moth: 150, crab: 10, scourer: 5 },
    sites: [
      { id: 'hatch', name: 'Hatch', type: 'connection', to: ['hatch'] },
      { id: 'longGallery', name: 'Long Gallery', type: 'gallery' },
      { id: 'valveGallery', name: 'Valve Gallery', type: 'lever', levers: ['heatValve', 'conduitTap'], hazard: 'arc' },
      { id: 'grubNest', name: 'Grub Nest', type: 'nest', lair: 'grub', hazard: 'rotBloom' },
      { id: 'masonWorks', name: 'Mason Works', type: 'works', levers: ['mothLure', 'sabotage'] },
      { id: 'stairsDown', name: 'Stairs Down', type: 'connection', to: ['stairs'] },
      { id: 'bulkhead', name: 'Bulkhead', type: 'connection', to: ['bulkhead'], levers: ['bulkhead'] },
    ],
    text: 'Heating conduits as wide as streets. Film grows where the pipes sweat, and everything that lives here lives on the film.',
  },
  ducts: {
    id: 'ducts', name: 'Drowned Ducts', floor: '-214',
    survival: { cls: 2, safety: 'Unsafe', stability: 'Stable', entities: 'Some' },
    heat: 1, flooded: true, F: 120, Fmax: 200, S: 30, M: 1, buries: true, home: true,
    palette: ['#051216', '#144652', '#5fb3c4', '#d9f2f2'], at: [34, 90],
    N: { grub: 40, crab: 12, eel: 6, scourer: 3 },
    sites: [
      { id: 'stairsUp', name: 'Stairs Up', type: 'connection', to: ['stairs'] },
      { id: 'floodedHall', name: 'Flooded Hall', type: 'gallery', lair: 'eel' },
      { id: 'pumpOffice', name: 'Pump Office', type: 'terminal' },
      { id: 'sluiceRoom', name: 'Sluice Room', type: 'lever', levers: ['sluice'] },
      { id: 'drownedCache', name: 'Drowned Cache', type: 'cache', loot: ['fragment', 'relic'], requires: 'drained' },
      { id: 'floodedShaft', name: 'Flooded Shaft', type: 'connection', to: ['shaft'], hazard: 'frost' },
    ],
    text: 'The water is warm and perfectly still. Your lamp shows a second ceiling beneath it. Things move between the two.',
  },
  stair: {
    id: 'stair', name: 'Glass Stair', floor: '-212…-189',
    survival: { cls: 3, safety: 'Unsafe', stability: 'Unstable', entities: 'Many' },
    heat: 1, flooded: false, F: 150, Fmax: 250, S: 10, M: 0,
    palette: ['#0b0b10', '#3a3f55', '#9aa6c9', '#eef1ff'], at: [66, 40],
    N: { grub: 50, crab: 8, hound: 12, scourer: 4 },
    sites: [
      { id: 'bulkheadLanding', name: 'Bulkhead Landing', type: 'connection', to: ['bulkhead'] },
      { id: 'middleLanding', name: 'Middle Landing', type: 'gallery' },
      { id: 'glassFall', name: 'Glass Fall', type: 'gallery', hazard: 'glassRain' },
      { id: 'houndDen', name: 'Hound Den', type: 'nest', lair: 'hound' },
      { id: 'auditTower', name: 'Audit Tower 7', type: 'tower', levers: ['tower'] },
      { id: 'shaftMouth', name: 'Shaft Mouth', type: 'connection', to: ['shaft'] },
      { id: 'upperLanding', name: 'Upper Landing', type: 'connection', to: ['stairhead', 'new'], hazard: 'gravity' },
    ],
    text: 'A flight of stairs that climbs for twenty floors through a shaft of cracked glass. It sings in the wind from below. Sometimes the steps are somewhere else.',
  },
  hall: {
    id: 'hall', name: 'Choir Hall', floor: '-188',
    survival: { cls: 4, safety: 'Unsafe', stability: 'Stable', entities: 'Few (one vast)' },
    heat: 1, flooded: false, F: 60, Fmax: 120, S: 5, M: 0,
    palette: ['#0f0a12', '#4b2240', '#c46a9a', '#f7e6f0'], at: [66, 10],
    N: { grub: 15, crab: 6, hound: 4, choir: 1, scourer: 2 },
    sites: [
      { id: 'stairHead', name: 'Stair Head', type: 'connection', to: ['stairhead'] },
      { id: 'nave', name: 'Nave', type: 'gallery', lair: 'choir' },
      { id: 'pipeOrgan', name: 'Pipe Organ', type: 'lever', levers: ['resonancePipe'], hazard: 'signalHum' },
      { id: 'console', name: 'Console', type: 'terminal' },
      { id: 'reliquary', name: 'Reliquary', type: 'cache', loot: ['fragment', 'unbuilder', 'relic', 'relic'] },
    ],
    text: 'A nave built for a congregation of thousands. Something at the far end is singing, and has been for a very long time.',
  },
  // ponytail: the listed sites, not a generator; generated strata come after the slice (section 17).
  u0041: {
    id: 'u0041', name: 'UNNAMED-0041', floor: '?',
    survival: { cls: 3, safety: 'Unsafe', stability: 'Unstable', entities: 'Some' },
    // Barren on purpose: at heat 0 its film only decays, so what arrives with it starves or leaves.
    heat: 0, flooded: false, F: 40, Fmax: 150, S: 40, M: 1, appears: 15,
    // Not in 13.3: fresh concrete under lights that are already on.
    palette: ['#0c0c0b', '#3b3b36', '#95958a', '#f2f2e6'], at: [92, 22],
    N: { crab: 5, hound: 3, scourer: 6 },
    sites: [
      { id: 'rawFloor', name: 'Raw Floor', type: 'gallery', to: ['new'] },
      { id: 'scaffold', name: 'Scaffold', type: 'gallery' },
      { id: 'unlitRoom', name: 'Unlit Room', type: 'gallery', hazard: 'gravity' },
      { id: 'masonNest', name: 'Mason Nest', type: 'works', levers: ['mothLure', 'sabotage'] },
      { id: 'sealedOffice', name: 'Sealed Office', type: 'cache', loot: ['fragment', 'relic'] },
    ],
    text: "It wasn't here last week. The concrete is still warm. The lights are already on.",
  },
}

export const CONNECTIONS: ConnectionDef[] = [
  { id: 'hatch', a: 'seam', b: 'galleries', type: 'hatch', cost: 1, open: true },
  { id: 'stairs', a: 'galleries', b: 'ducts', type: 'stairs down', cost: 2, open: true },
  { id: 'bulkhead', a: 'galleries', b: 'stair', type: 'bulkhead', cost: 2, open: false }, // the Pry Bar opens it
  { id: 'shaft', a: 'ducts', b: 'stair', type: 'flooded shaft', cost: 3, open: true, requires: 'drained' },
  { id: 'stairhead', a: 'stair', b: 'hall', type: 'stair flight', cost: 3, open: true },
  { id: 'new', a: 'stair', b: 'u0041', type: 'fresh accretion', cost: 2, open: true, appears: 15 },
]

/** Home, for the Atlas and its dithering. */
export const SEAM = { name: 'The Seam', floor: '-213½', palette: ['#0d0d0b', '#3c3a2c', '#a39f7a', '#efe9cf'], at: [34, 75] as [number, number] }

/** The Masons' construction schedule: on these days a level's activity rises by one. */
export const SCHEDULE = [
  { day: 8, level: 'galleries' },
  { day: 16, level: 'ducts' },
  { day: 24, level: 'galleries' },
]
