import { describe, expect, it } from 'vitest';
import { content, instance } from '../packages/content';
import { clone, hash } from '../packages/sim/src/determinism';
import { dispatch, newRun } from '../packages/sim/src/run';
import { commitDrop, previewDrop } from '../src/interactions';

function setup() {
  const run = dispatch(content, newRun(content, 'drag'), {
    version: 1,
    revision: 0,
    type: 'start',
    choice: 'economy',
  }).state;
  run.phase = 'shop';
  run.selected = 'open-stalls';
  run.gold = 50;
  run.offers = [
    { id: 'offer', defId: 'folding-buckler', tier: 'bronze', enchantment: null, price: 4, sold: false },
  ];
  return run;
}
describe('drag transactions, with no item-selection state', () => {
  it('moves an item to an exact contiguous stash footprint', () => {
    const run = setup(),
      before = hash(run);
    const result = commitDrop(
      content,
      run,
      { kind: 'owned', id: run.items[0].id },
      { location: 'stash', position: 6 },
    );
    expect(result.state.items[0]).toMatchObject({ location: 'stash', position: 6 });
    expect(hash(run)).toBe(before);
  });
  it('swaps equal-size items and allows an inverse move for undo', () => {
    const run = setup();
    run.items.push(instance('ember-kettle', 'other', 2));
    const id = run.items[0].id;
    const moved = commitDrop(content, run, { kind: 'owned', id }, { location: 'board', position: 2 }).state;
    expect(moved.items.map((i) => i.position)).toEqual([2, 0]);
    const undone = commitDrop(
      content,
      moved,
      { kind: 'owned', id },
      { location: 'board', position: 0 },
    ).state;
    expect(undone.items).toEqual(run.items);
  });
  it('does not charge gold or consume an offer after an invalid drop', () => {
    const run = setup(),
      before = hash(run);
    expect(() =>
      commitDrop(content, run, { kind: 'offer', id: 'offer' }, { location: 'board', position: 0 }),
    ).toThrow('clear slots');
    expect(hash(run)).toBe(before);
  });
  it('buys and places as one staged transaction, recording both validated commands', () => {
    const run = setup(),
      before = hash(run);
    const result = commitDrop(
      content,
      run,
      { kind: 'offer', id: 'offer' },
      { location: 'stash', position: 8 },
    );
    expect(result.state.items.at(-1)).toMatchObject({
      defId: 'folding-buckler',
      location: 'stash',
      position: 8,
    });
    expect(result.state.gold).toBe(46);
    expect(result.state.commands.slice(-2).map((c) => c.type)).toEqual(['buy', 'move']);
    expect(hash(run)).toBe(before);
  });
  it('rolls back the staged purchase if a buy trigger fills the chosen destination', () => {
    const catalog = clone(content),
      run = setup();
    run.items.push({ ...instance('copper-ledger', 'ledger', 0), location: 'stash' });
    catalog.pools.occupier = ['rivet-lance'];
    catalog.definitions.find((d) => d.id === 'copper-ledger')!.abilities = [
      {
        id: 'occupy',
        trigger: { event: 'item.bought', relation: 'owner' },
        locations: ['stash'],
        actions: [{ kind: 'generate', target: { side: 'owner' }, pool: 'occupier' }],
      },
    ];
    const before = hash(run),
      source = { kind: 'offer' as const, id: 'offer' },
      destination = { location: 'board' as const, position: 4 };
    expect(previewDrop(catalog, run, source, destination).ok).toBe(true);
    expect(() => commitDrop(catalog, run, source, destination)).toThrow('occupied');
    expect(hash(run)).toBe(before);
  });
  it('requires dropping a duplicate on the actual upgrade recipient', () => {
    const run = setup();
    run.offers[0].defId = 'rivet-lance';
    expect(
      previewDrop(content, run, { kind: 'offer', id: 'offer' }, { location: 'board', position: 2 }).ok,
    ).toBe(false);
    const result = commitDrop(
      content,
      run,
      { kind: 'offer', id: 'offer' },
      { location: 'board', position: 0, itemId: run.items[0].id },
    );
    expect(result.state.items).toHaveLength(1);
    expect(result.state.items[0].tier).toBe('silver');
  });
  it('previews sale proceeds and only sells owned items', () => {
    const run = setup(),
      source = { kind: 'owned' as const, id: run.items[0].id };
    expect(previewDrop(content, run, source, { location: 'sell' }).message).toMatch(/gold/);
    expect(previewDrop(content, run, { kind: 'offer', id: 'offer' }, { location: 'sell' }).ok).toBe(false);
    expect(commitDrop(content, run, source, { location: 'sell' }).state.items).toHaveLength(0);
  });
  it('rejects locked combat, exhausted funds and out-of-bounds drops', () => {
    const run = setup();
    expect(
      previewDrop(
        content,
        run,
        { kind: 'owned', id: run.items[0].id },
        { location: 'stash', position: 0 },
        true,
      ).ok,
    ).toBe(false);
    run.gold = 0;
    expect(
      previewDrop(content, run, { kind: 'offer', id: 'offer' }, { location: 'stash', position: 0 }).message,
    ).toMatch(/more gold/);
    expect(
      previewDrop(content, run, { kind: 'owned', id: run.items[0].id }, { location: 'board', position: 4 })
        .ok,
    ).toBe(false);
  });
  it('applies targeted rewards by dropping onto an eligible item', () => {
    const run = setup();
    run.phase = 'choice';
    run.afterChoices = 'shop';
    run.pending = [
      { reason: 'fixture', rewards: [{ id: 'upgrade', label: 'Upgrade', text: '', target: 'upgrade' }] },
    ];
    const target = { location: 'board' as const, position: 0, itemId: run.items[0].id };
    expect(commitDrop(content, run, { kind: 'reward', id: 'upgrade' }, target).state.items[0].tier).toBe(
      'silver',
    );
  });
});
