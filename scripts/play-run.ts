import { content } from '../packages/content';
import {
  dispatch,
  newRun,
  commandOptions,
  rewardTargets,
  itemValue,
  saveRun,
  loadRun,
} from '../packages/sim/src/run';
import { firstFit, definition } from '../packages/sim/src/geometry';
import type { Command, Instance, Reward, Run } from '../packages/sim/src/model';

type Input = Command extends infer C ? (C extends Command ? Omit<C, 'version' | 'revision'> : never) : never;
/** Deterministic, deliberately simple build policy used for whole-run integration and balance checks. */
export function playRun(seed: string): Run {
  let run = newRun(content, seed),
    dirty = false;
  const send = (input: Input) => {
    run = dispatch(content, run, { version: 1, revision: run.revision, ...input }).state;
  };
  const score = (item: Instance) => {
    const def = definition(content, item.defId),
      stats = def.tiers[item.tier] ?? {},
      cd = stats.cooldown ?? 5000;
    return (
      ((((stats.damage ?? 0) * 1000) / cd) * (stats.multicast ?? 1) +
        (stats.poison ?? 0) * 2.3 +
        (stats.burn ?? 0) * 2 +
        ((stats.heal ?? 0) * 350) / cd +
        ((stats.shield ?? 0) * 350) / cd +
        (stats.regen ?? 0) * 1.5 +
        (item.defId === 'spring-magazine' ? 5 : 0)) /
      def.size
    );
  };
  const arrange = () => {
    if (!dirty) return;
    dirty = false;
    let space = run.capacity;
    const chosen: string[] = [];
    for (const item of [...run.items].sort((a, b) => score(b) - score(a) || a.acquired - b.acquired))
      if (definition(content, item.defId).size <= space) {
        chosen.push(item.id);
        space -= definition(content, item.defId).size;
      }
    for (const item of [...run.items]) if (!chosen.includes(item.id)) send({ type: 'sell', item: item.id });
    for (const id of chosen) {
      const item = run.items.find((i) => i.id === id)!;
      if (item.location === 'stash') continue;
      const position = firstFit(content, run.items, item, 'stash', 10);
      if (position >= 0) send({ type: 'move', item: id, location: 'stash', position });
    }
    let position = 0;
    for (const id of chosen) {
      const item = run.items.find((i) => i.id === id)!;
      send({ type: 'move', item: id, location: 'board', position });
      position += definition(content, item.defId).size;
    }
  };
  const rewardScore = (r: Reward) => {
    if (r.target === 'upgrade') return 80;
    if (r.skill === 'cinder-memory' || r.skill === 'opening-cushion') return 65;
    if (r.item) {
      const duplicate = run.items.find((i) => i.defId === r.item);
      if (duplicate) return 75;
      const d = definition(content, r.item),
        stats = d.tiers[r.tier ?? d.startingTier] ?? {};
      return (stats.poison ?? 0) * 4 + (stats.damage ?? 0) + (stats.burn ?? 0) * 3 - 10;
    }
    if (r.target === 'enchant') return 45;
    if (r.health) return r.health / 2;
    if (r.income) return r.income * 12;
    if (r.gold) return r.gold * 2;
    if (r.xp) return r.xp * 4;
    return 0;
  };
  for (let step = 0; step < 1200 && !['victory', 'defeat'].includes(run.phase); step++) {
    if (run.phase === 'start') {
      send({ type: 'start', choice: 'economy' });
      dirty = true;
      continue;
    }
    arrange();
    if (run.phase === 'encounter') {
      if (run.activeOpponent) {
        send({ type: 'fight' });
        continue;
      }
      if (run.hour === 2 || run.hour === 5) {
        const candidates = run.candidates.map((id) => content.opponents.find((o) => o.snapshot.id === id)!);
        candidates.sort((a, b) => a.snapshot.difficulty - b.snapshot.difficulty);
        send({ type: 'select', id: candidates[0].snapshot.id });
      } else {
        const shop = run.candidates.find(
          (id) => content.encounters.find((e) => e.id === id)?.category === 'shop',
        );
        const event = run.candidates.find(
          (id) => id === 'repair-bench' || id === 'quiet-table' || id === 'night-school',
        );
        const gift = run.candidates.find((id) => id === 'gift-crate');
        send({
          type: 'select',
          id: run.gold >= 8 && shop ? shop : (event ?? gift ?? run.candidates.at(-1)!),
        });
      }
    } else if (run.phase === 'shop') {
      const offers = run.offers
        .filter((o) => !o.sold && o.price <= run.gold)
        .map((o) => ({
          offer: o,
          score:
            score({
              id: o.id,
              defId: o.defId,
              tier: o.tier,
              enchantment: o.enchantment,
              location: 'board',
              position: 0,
              acquired: 0,
              modifiers: [],
              addedTypes: [],
              counters: {},
              memory: {},
              provenance: 'offer',
            }) + (run.items.some((i) => i.defId === o.defId) ? 20 : 0),
        }))
        .sort((a, b) => b.score - a.score);
      const best = offers[0];
      if (best && best.score >= 4) {
        send({ type: 'buy', offer: best.offer.id });
        dirty = true;
      } else send({ type: 'leave' });
    } else if (run.phase === 'choice') {
      const reward = [...commandOptions(content, run)].sort((a, b) => rewardScore(b) - rewardScore(a))[0];
      const targets = rewardTargets(content, run, reward).sort((a, b) => score(b) - score(a));
      send({ type: 'choose', choice: reward.id, ...(targets[0] ? { target: targets[0].id } : {}) });
      dirty = true;
    } else if (run.phase === 'result') send({ type: 'continue' });
    if (step % 20 === 0) run = loadRun(content, saveRun(content, run));
  }
  return run;
}
if (process.argv[1]?.endsWith('play-run.ts')) {
  const run = playRun(process.argv[2] ?? 'lantern-47');
  console.log(
    JSON.stringify(
      {
        seed: run.seed,
        phase: run.phase,
        day: run.day,
        wins: run.wins,
        prestige: run.prestige,
        level: run.level,
        commands: run.commands.length,
        board: run.items
          .filter((i) => i.location === 'board')
          .map(
            (i) =>
              `${definition(content, i.defId).name} (${i.tier}, D=${itemValue(content, run, i, 'damage').value})`,
          ),
      },
      null,
      2,
    ),
  );
  if (run.phase !== 'victory') process.exitCode = 1;
}
