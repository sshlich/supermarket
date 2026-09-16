import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { simulate } from '../packages/sim/src/combat';
import { hash } from '../packages/sim/src/determinism';
import { importReplay } from '../packages/sim/src/run';
import { validateContent, validateReplay } from '../packages/sim/src/validation';
import type { Content, Replay } from '../packages/sim/src/model';
describe('language-neutral golden replay contract', () => {
  for (const name of [
    'ordering',
    'ammo-ready',
    'reaction-network',
    'destroy-repair',
    'transform',
    'scopes-and-meters',
  ])
    it(name, () => {
      const golden = JSON.parse(readFileSync(`tests/golden/${name}.json`, 'utf8')) as {
        content: Content;
        contentHash: string;
        replay: Replay;
      };
      validateContent(golden.content);
      validateReplay(golden.content, golden.replay);
      expect(hash(golden.content)).toBe(golden.contentHash);
      const result = simulate(golden.content, golden.replay.initial, golden.replay.seed).replay;
      expect(result.events).toEqual(golden.replay.events);
      expect(result.finalHash).toBe(golden.replay.finalHash);
      expect(result.digest).toBe(golden.replay.digest);
      expect(importReplay(golden.content, JSON.stringify(golden.replay))?.replay.finalHash).toBe(
        result.finalHash,
      );
      if (name === 'ammo-ready') {
        const reload = result.events.find((e) => e.kind === 'ammo.reloaded' && e.time === 11000)!;
        expect(reload.payload.progress).toBe(6200);
        expect(
          result.events.some(
            (e) => e.kind === 'use.started' && e.sourceId === 'p0:left-0' && e.time === 11000,
          ),
        ).toBe(true);
      }
      if (name === 'scopes-and-meters')
        for (const kind of [
          'rage.gained',
          'enrage.started',
          'enrage.ended',
          'tempo.gained',
          'slot.started',
          'chilled.expired',
        ])
          expect(
            result.events.some((e) => e.kind === kind),
            kind,
          ).toBe(true);
    });
});
