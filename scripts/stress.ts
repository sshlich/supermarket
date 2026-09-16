import { content, snapshot } from '../packages/content';
import { simulate } from '../packages/sim/src/combat';
import { validateContent } from '../packages/sim/src/validation';
validateContent(content);
const count = Number(process.argv[2] ?? 10000);
if (!Number.isSafeInteger(count) || count < 1) throw new Error('Pass a positive combat count');
const builds = [
  ['rivet-lance', 'folding-buckler'],
  ['bitter-vial', 'spring-magazine'],
  ['ember-kettle', 'warm-coil'],
  ['echo-anvil', 'tea-tray'],
  ['velvet-leech', 'winter-fan'],
  ['rivet-lance', 'workbench', 'minute-hand'],
];
let maxEvents = 0,
  maxTime = 0;
const outcomes: Record<string, number> = {};
const started = performance.now();
for (let i = 0; i < count; i++) {
  const initial: [ReturnType<typeof snapshot>, ReturnType<typeof snapshot>] = [
    snapshot('a', 'Stress A', builds[i % builds.length], 130),
    snapshot('b', 'Stress B', builds[(Math.floor(i / builds.length) + 1) % builds.length], 130),
  ];
  const a = simulate(content, initial, `stress-${i}`).replay,
    b = simulate(content, initial, `stress-${i}`).replay;
  if (
    a.final.outcome === 'error' ||
    a.final.outcome === 'ongoing' ||
    a.digest !== b.digest ||
    a.finalHash !== b.finalHash
  )
    throw new Error(`Stress failure ${i}: ${a.final.error ?? 'divergence'}`);
  maxEvents = Math.max(maxEvents, a.events.length);
  maxTime = Math.max(maxTime, a.final.time);
  outcomes[a.final.outcome] = (outcomes[a.final.outcome] ?? 0) + 1;
  if ((i + 1) % 1000 === 0)
    console.log(
      `${i + 1}/${count} paired deterministic combats; max events=${maxEvents}; elapsed=${Math.round((performance.now() - started) / 1000)}s`,
    );
}
console.log(
  JSON.stringify(
    {
      combats: count,
      simulations: count * 2,
      divergences: 0,
      errors: 0,
      maxEvents,
      maxTime,
      outcomes,
      elapsedSeconds: Math.round((performance.now() - started) / 1000),
    },
    null,
    2,
  ),
);
