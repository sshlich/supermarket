import type { Command, Content, Instance, Reward, Run, Transition } from '../packages/sim/src/model';
import { canPlace, definition } from '../packages/sim/src/geometry';
import { commandOptions, dispatch, itemValue, rewardTargets, upgradeTarget } from '../packages/sim/src/run';

export type InputCommand = Command extends infer C
  ? C extends Command
    ? Omit<C, 'version' | 'revision'>
    : never
  : never;
export type DragSource = { kind: 'owned' | 'offer' | 'reward'; id: string };
export type Destination =
  | { location: 'board' | 'stash'; position: number; itemId?: string }
  | { location: 'sell' };
export interface DropPreview {
  ok: boolean;
  message: string;
  upgradeId?: string;
}
export function rewardFor(content: Content, run: Run, id: string): Reward | undefined {
  return commandOptions(content, run).find((r) => r.id === id);
}
export function offeredInstance(
  content: Content,
  id: string,
  defId: string,
  tier?: Instance['tier'],
  enchantment: string | null = null,
): Instance {
  return {
    id,
    defId,
    tier: tier ?? definition(content, defId).startingTier,
    enchantment,
    location: 'board',
    position: 0,
    acquired: 0,
    modifiers: [],
    addedTypes: [],
    memory: {},
    counters: {},
    provenance: 'preview',
  };
}
export function dragItem(content: Content, run: Run, source: DragSource): Instance | undefined {
  if (source.kind === 'owned') return run.items.find((i) => i.id === source.id);
  if (source.kind === 'offer') {
    const o = run.offers.find((o) => o.id === source.id);
    return o && offeredInstance(content, o.id, o.defId, o.tier, o.enchantment);
  }
  const r = rewardFor(content, run, source.id);
  return r?.item ? offeredInstance(content, r.id, r.item, r.tier, r.enchantment ?? null) : undefined;
}
export function sellPrice(content: Content, run: Run, item: Instance): number {
  return (
    itemValue(content, run, item, 'sell').value +
    (run.phase === 'shop' ? (content.encounters.find((e) => e.id === run.selected)?.sellBonus ?? 0) : 0)
  );
}
export function previewDrop(
  content: Content,
  run: Run,
  source: DragSource,
  destination: Destination,
  locked = false,
): DropPreview {
  const fail = (message: string): DropPreview => ({ ok: false, message });
  if (locked || ['start', 'combat', 'victory', 'defeat'].includes(run.phase))
    return fail('The board is locked.');
  const item = dragItem(content, run, source);
  if (destination.location === 'sell') {
    return source.kind === 'owned' && item
      ? {
          ok: true,
          message: `Sell ${definition(content, item.defId).name} for ${sellPrice(content, run, item)} gold`,
        }
      : fail('Only owned items can be sold.');
  }
  if (source.kind === 'reward') {
    const reward = rewardFor(content, run, source.id);
    if (run.phase !== 'choice' || !reward) return fail('This reward is no longer available.');
    if (reward.target) {
      const target = rewardTargets(content, run, reward).find((i) => i.id === destination.itemId);
      return target
        ? {
            ok: true,
            message: `${reward.label}: ${definition(content, target.defId).name}`,
            upgradeId: target.id,
          }
        : fail('Drop this reward onto an eligible item.');
    }
  }
  if (!item) return fail('This item is no longer available.');
  if (source.kind === 'offer') {
    const offer = run.offers.find((o) => o.id === source.id);
    if (run.phase !== 'shop' || !offer || offer.sold) return fail('This offer is no longer available.');
    if (run.gold < offer.price) return fail(`Need ${offer.price - run.gold} more gold.`);
  }
  if (source.kind !== 'owned') {
    const upgrade = upgradeTarget(run, item.defId);
    if (upgrade)
      return destination.itemId === upgrade.id
        ? {
            ok: true,
            message: `Upgrade ${definition(content, item.defId).name}${source.kind === 'offer' ? ` · ${run.offers.find((o) => o.id === source.id)!.price} gold` : ''}`,
            upgradeId: upgrade.id,
          }
        : fail(`Drop onto your ${definition(content, item.defId).name} to upgrade it.`);
  }
  const capacity = destination.location === 'board' ? run.capacity : content.rules.stashCapacity;
  if (canPlace(content, run.items, item, destination.location, destination.position, capacity))
    return {
      ok: true,
      message: `${source.kind === 'owned' ? 'Move' : 'Collect'} ${definition(content, item.defId).name} → ${destination.location}${source.kind === 'offer' ? ` · ${run.offers.find((o) => o.id === source.id)!.price} gold` : ''}`,
    };
  if (source.kind === 'owned') {
    const swap = run.items.find(
      (i) =>
        i.id !== item.id &&
        i.location === destination.location &&
        i.position === destination.position &&
        definition(content, i.defId).size === definition(content, item.defId).size,
    );
    const remaining = run.items.filter((i) => i.id !== item.id && i.id !== swap?.id);
    if (
      swap &&
      canPlace(
        content,
        remaining,
        swap,
        item.location,
        item.position,
        item.location === 'board' ? run.capacity : content.rules.stashCapacity,
      )
    )
      return { ok: true, message: `Swap with ${definition(content, swap.defId).name}` };
  }
  return fail(`Needs ${definition(content, item.defId).size} clear slots. Equal-size items can swap.`);
}
/** Stage every command on immutable copies; the caller commits once, only after all succeed. */
export function commitDrop(
  content: Content,
  run: Run,
  source: DragSource,
  destination: Destination,
): Transition {
  const preview = previewDrop(content, run, source, destination);
  if (!preview.ok) throw new Error(preview.message);
  const apply = (state: Run, command: InputCommand) =>
    dispatch(content, state, { version: 1, revision: state.revision, ...command });
  if (destination.location === 'sell') return apply(run, { type: 'sell', item: source.id });
  if (source.kind === 'owned')
    return apply(run, {
      type: 'move',
      item: source.id,
      location: destination.location,
      position: destination.position,
    });
  const first = apply(
    run,
    source.kind === 'offer'
      ? { type: 'buy', offer: source.id }
      : { type: 'choose', choice: source.id, ...(destination.itemId ? { target: destination.itemId } : {}) },
  );
  if (preview.upgradeId) return first;
  const item = first.state.items.find(
    (i) =>
      !run.items.some((previous) => previous.id === i.id) &&
      i.defId === dragItem(content, run, source)?.defId,
  );
  if (!item) throw new Error('The acquired item could not be placed. Nothing was spent.');
  if (item.location === destination.location && item.position === destination.position) return first;
  const second = apply(first.state, {
    type: 'move',
    item: item.id,
    location: destination.location,
    position: destination.position,
  });
  return { ...second, events: [...first.events, ...second.events] };
}
