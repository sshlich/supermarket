// Presentation mapping only: simulation content has no asset dependency.
export const itemArt = [
  'rivet-lance',
  'folding-buckler',
  'ember-kettle',
  'bitter-vial',
  'spring-magazine',
  'paced-courier',
  'winter-fan',
  'tar-roller',
  'minute-hand',
  'tea-tray',
  'moss-jar',
  'echo-anvil',
  'velvet-leech',
  'kite-engine',
  'scrap-magnet',
  'patch-drone',
  'clearwater-flask',
  'copper-ledger',
  'survey-kit',
  'warm-coil',
  'workbench',
  'prism-box',
  'tuning-pin',
  'second-bell',
  'rain-stitch',
  'lift-ribbon',
  'sand-hourglass',
  'return-token',
  'sealed-star',
  'coins',
];
const skillArt: Record<string, string> = {
  'opening-cushion': 'folding-buckler',
  'cinder-memory': 'ember-kettle',
  'careful-hands': 'patch-drone',
  'spare-change': 'coins',
  'steady-aim': 'rivet-lance',
  'soothing-hum': 'tea-tray',
  'field-notes': 'survey-kit',
  'weather-eye': 'clearwater-flask',
};
export function art(id: string, extraClass = ''): string {
  const index = Math.max(0, itemArt.indexOf(skillArt[id] ?? id));
  return `<span class="item-art ${extraClass}" aria-hidden="true" style="background-position:${(index % 6) * 20}% ${Math.floor(index / 6) * 25}%"></span>`;
}
export function icon(name: string, className = ''): string {
  const paths: Record<string, string> = {
    coin: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 8v8"/>',
    heart: '<path d="M12 21 3 12C-2 4 8-1 12 6c4-7 14-2 9 6Z"/>',
    shield: '<path d="m12 2 9 4-2 11-7 5-7-5L3 6Z"/>',
    flame: '<path d="M13 2c2 7-6 6-4 12 1-3 4-3 5-7 7 7 7 15-2 15S1 13 6 8c0 4 3 3 7-6Z"/>',
    poison: '<path d="M8 2h8M9 2v6L3 18q-1 4 3 4h12q4 0 3-4L15 8V2M6 16h12"/>',
    sword: '<path d="m20 2 2 2L10 17l-3-3ZM4 13l7 7M7 17l-4 4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
    star: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/>',
    bag: '<path d="M8 2h8l-1 5q10 8 5 14H4Q-1 15 9 7ZM8 7h8"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    close: '<path d="m5 5 14 14M19 5 5 19"/>',
    arrow: '<path d="M3 12h17m-7-7 7 7-7 7"/>',
    undo: '<path d="M9 4 3 10l6 6M3 10h10c10 0 10 11 0 11"/>',
    eye: '<path d="M2 12q10-15 20 0-10 15-20 0Z"/><circle cx="12" cy="12" r="3"/>',
    mouse: '<rect x="6" y="2" width="12" height="20" rx="6"/><path d="M12 2v8h6"/>',
    trophy: '<path d="M7 2h10v7q0 7-5 7T7 9ZM7 5H2q0 7 6 7M17 5h5q0 7-6 7M12 16v5m-5 1h10"/>',
    play: '<path d="m7 3 14 9-14 9Z"/>',
    pause: '<path d="M8 3v18M16 3v18"/>',
    moon: '<path d="M20 16A10 10 0 0 1 8 3a10 10 0 1 0 12 13Z"/>',
  };
  return `<svg class="icon ${className}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name] ?? paths.star}</svg>`;
}
