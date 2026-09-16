import type {
  Ability,
  Aura,
  CombatState,
  Content,
  Entity,
  Expr,
  Fighter,
  Modifier,
  Predicate,
  Selector,
  SimEvent,
} from './model';
import { definition, neighbors } from './geometry';
import { canonical, compareText, roll } from './determinism';

export type Target = Entity | Fighter;
export interface EvalContext {
  content: Content;
  state: CombatState;
  source: Entity;
  event?: SimEvent;
  target?: Target;
  previous?: Target[];
  trace?: (kind: string, targets: string[], payload: Record<string, number | string | boolean>) => void;
}
export const isEntity = (target: Target): target is Entity => 'defId' in target;
export function abilities(content: Content, entity: Entity): Ability[] {
  const def = definition(content, entity.defId);
  return [
    ...def.abilities,
    ...(entity.enchantment ? (def.enchantments[entity.enchantment]?.abilities ?? []) : []),
  ];
}
export function traits(content: Content, entity: Entity) {
  const def = definition(content, entity.defId);
  const enchant = entity.enchantment ? def.enchantments[entity.enchantment] : undefined;
  return {
    types: [...new Set([...def.types, ...entity.addedTypes])].sort(),
    capabilities: entity.destroyed
      ? []
      : [...new Set([...def.capabilities, ...(enchant?.capabilities ?? [])])].sort(),
    references: def.references,
    protections: entity.destroyed ? [] : (enchant?.protections ?? []),
  };
}
export function compare(
  left: number | string | boolean,
  op: string,
  right: number | string | boolean,
): boolean {
  switch (op) {
    case 'eq':
      return left === right;
    case 'ne':
      return left !== right;
    case 'lt':
      return left < right;
    case 'lte':
      return left <= right;
    case 'gt':
      return left > right;
    case 'gte':
      return left >= right;
    default:
      throw new Error(`Unknown comparison ${op}`);
  }
}
export interface AttributeExplanation {
  value: number;
  base: number;
  steps: { layer: string; source: string; op: string; amount: number; before: number; after: number }[];
}
export function applyModifiers(base: number, modifiers: Modifier[]): number {
  return modifierSteps(base, modifiers, 'modifier').value;
}
function scaled(value: number, basisPoints: number): number {
  const numerator = BigInt(value) * BigInt(basisPoints),
    denominator = 10000n;
  const quotient = numerator / denominator;
  return Number(quotient - (numerator < 0n && numerator % denominator !== 0n ? 1n : 0n));
}
function modifierSteps(
  base: number,
  modifiers: Modifier[],
  layer: string,
): Pick<AttributeExplanation, 'value' | 'steps'> {
  const order = ['set', 'add', 'percent', 'multiply', 'min', 'max'];
  const sorted = [...modifiers].sort(
    (a, b) => order.indexOf(a.op) - order.indexOf(b.op) || compareText(a.id, b.id),
  );
  let value = base;
  const steps: AttributeExplanation['steps'] = [];
  for (const m of sorted) {
    const before = value;
    if (m.op === 'set') value = m.value;
    if (m.op === 'add') value += m.value;
    if (m.op === 'percent') value = scaled(value, 10000 + m.value);
    if (m.op === 'multiply') value = scaled(value, m.value);
    if (m.op === 'min') value = Math.min(value, m.value);
    if (m.op === 'max') value = Math.max(value, m.value);
    value = Math.max(-100000000, Math.min(100000000, value));
    steps.push({ layer, source: m.sourceId, op: m.op, amount: m.value, before, after: value });
  }
  return { value, steps };
}
function auraList(content: Content, entity: Entity): Aura[] {
  const def = definition(content, entity.defId);
  return [
    ...(def.auras ?? []),
    ...(entity.enchantment ? (def.enchantments[entity.enchantment]?.auras ?? []) : []),
  ];
}
export function attribute(
  ctx: EvalContext,
  target: Target,
  key: string,
  baseOnly = false,
): AttributeExplanation {
  if (!isEntity(target)) {
    const base =
      key === 'maxHealth'
        ? target.baseMaxHealth
        : typeof (target as unknown as Record<string, unknown>)[key] === 'number'
          ? (target as unknown as Record<string, number>)[key]
          : (target.meters[key] ?? target.counters[key] ?? 0);
    let result = modifierSteps(
      base,
      target.modifiers.filter(
        (m) => m.attribute === key && (m.expires === undefined || m.expires > ctx.state.time),
      ),
      'player',
    );
    const auraModifiers: Modifier[] = [];
    if (!baseOnly)
      for (const source of ctx.state.entities) {
        if (source.destroyed) continue;
        for (const aura of auraList(ctx.content, source)) {
          if (aura.attribute !== key || !aura.locations.includes(source.location)) continue;
          const ac = { ...ctx, source, trace: undefined };
          if (aura.conditions?.some((c) => !compare(evaluate(ac, c.left), c.op, evaluate(ac, c.right))))
            continue;
          if (select(ac, aura.target, true).some((t) => t.id === target.id)) {
            auraModifiers.push({
              id: `${source.id}/${aura.id}`,
              sourceId: source.id,
              attribute: key,
              op: aura.op,
              value: aura.value,
              scope: 'combat',
            });
          }
        }
      }
    const auraStep = modifierSteps(result.value, auraModifiers, 'aura');
    result = { value: auraStep.value, steps: [...result.steps, ...auraStep.steps] };
    return { base, ...result };
  }
  const def = definition(ctx.content, target.defId);
  const base = def.tiers[target.tier]?.[key] ?? (key === 'multicast' ? 1 : 0);
  let result: AttributeExplanation = { base, value: base, steps: [] };
  const layers: [string, Modifier[]][] = [['permanent', target.modifiers.filter((m) => m.attribute === key)]];
  const bonus = target.enchantment ? def.enchantments[target.enchantment]?.attributes?.[key] : undefined;
  if (bonus !== undefined)
    layers.push([
      'enchantment',
      [
        {
          id: 'enchantment',
          sourceId: target.enchantment!,
          attribute: key,
          op: 'add',
          value: bonus,
          scope: 'permanent',
        },
      ],
    ]);
  if (!baseOnly) {
    const auras: Modifier[] = [];
    for (const source of ctx.state.entities) {
      if (source.destroyed) continue;
      for (const aura of auraList(ctx.content, source)) {
        if (aura.attribute !== key || !aura.locations.includes(source.location)) continue;
        const ac = { ...ctx, source, trace: undefined };
        if (aura.conditions?.some((c) => !compare(evaluate(ac, c.left), c.op, evaluate(ac, c.right))))
          continue;
        if (select(ac, aura.target, true).some((t) => t.id === target.id)) {
          auras.push({
            id: `${source.id}/${aura.id}`,
            sourceId: source.id,
            attribute: key,
            op: aura.op,
            value: aura.value,
            scope: 'combat',
          });
        }
      }
    }
    layers.push(['aura', auras]);
    layers.push([
      'runtime',
      target.runtime.filter(
        (m) => m.attribute === key && (m.expires === undefined || m.expires > ctx.state.time),
      ),
    ]);
    // Notes are slot state, separate from visible types and item statuses.
    const owner = ctx.state.players.find((p) => p.id === target.owner)!;
    const note = owner.slots[`${target.position}:note`];
    if (key === 'cooldown' && note && traits(ctx.content, target).types.includes(note)) {
      layers.push([
        'slot note',
        [
          {
            id: 'note',
            sourceId: `${owner.id}:slot:${target.position}`,
            attribute: key,
            op: 'percent',
            value: -1000,
            scope: 'combat',
          },
        ],
      ]);
    }
  }
  for (const [layer, mods] of layers) {
    const step = modifierSteps(result.value, mods, layer);
    result = { base, value: step.value, steps: [...result.steps, ...step.steps] };
  }
  const minimum =
    key === 'cooldown' && base > 0 ? ctx.content.rules.minCooldown : key === 'multicast' ? 1 : 0;
  if (result.value < minimum) {
    result.steps.push({
      layer: 'rule floor',
      source: 'rules',
      op: 'max',
      amount: minimum,
      before: result.value,
      after: minimum,
    });
    result.value = minimum;
  }
  return result;
}
export function matches(ctx: EvalContext, item: Entity, predicate: Predicate, baseOnly = false): boolean {
  const def = definition(ctx.content, item.defId),
    tags = traits(ctx.content, item);
  const val = predicate.value ?? true,
    key = predicate.key ?? '';
  let result = false;
  switch (predicate.field) {
    case 'type':
      result = tags.types.includes(String(val));
      break;
    case 'capability':
      result = tags.capabilities.includes(String(val));
      break;
    case 'reference':
      result = tags.references.includes(String(val));
      break;
    case 'size':
      result = compare(def.size, predicate.compare ?? 'eq', val);
      break;
    case 'relativeSize':
      result = compare(def.size, predicate.compare ?? 'eq', definition(ctx.content, ctx.source.defId).size);
      break;
    case 'cooldown':
      result = (def.tiers[item.tier]?.cooldown ?? 0) > 0;
      break;
    case 'attribute':
      result = compare(attribute(ctx, item, key, baseOnly).value, predicate.compare ?? 'eq', val);
      break;
    case 'ammo': {
      const max = attribute(ctx, item, 'ammo', baseOnly).value;
      result =
        item.ammo !== null &&
        (val === 'full'
          ? item.ammo >= max
          : val === 'empty'
            ? item.ammo === 0
            : val === 'notFull'
              ? item.ammo < max
              : true);
      break;
    }
    case 'status':
      result =
        key === 'destroyed'
          ? item.destroyed
          : key === 'flying'
            ? item.flying
            : (item.statuses[key] ?? 0) > ctx.state.time;
      break;
  }
  return predicate.not ? !result : result;
}
export function select(ctx: EvalContext, selector: Selector, baseOnly = false): Target[] {
  const { state, source } = ctx;
  let candidates: Target[];
  switch (selector.side) {
    case 'self':
      candidates = [source];
      break;
    case 'owner':
      candidates = state.players.filter((p) => p.id === source.owner);
      break;
    case 'enemy':
      candidates = state.players.filter((p) => p.id !== source.owner);
      break;
    case 'previous':
      candidates = ctx.previous ?? [];
      break;
    case 'eventSource':
      candidates = [...state.entities, ...state.players].filter((e) => e.id === ctx.event?.sourceId);
      break;
    case 'eventTargets':
      candidates = [...state.entities, ...state.players].filter((e) => ctx.event?.targets.includes(e.id));
      break;
    default:
      candidates = state.entities.filter(
        (e) =>
          e.location !== 'skills' &&
          (selector.side === 'allItems' ||
            (selector.side === 'allyItems' ? e.owner === source.owner : e.owner !== source.owner)),
      );
  }
  const rejected: string[] = [];
  candidates = candidates.filter((t) => {
    if (!isEntity(t)) return true;
    let reason = '';
    if (selector.other && t.id === source.id) reason = 'self excluded';
    if (
      !['self', 'previous', 'eventSource', 'eventTargets'].includes(selector.side) &&
      !(selector.location ?? ['board']).includes(t.location)
    )
      reason = 'location';
    if (selector.location && !selector.location.includes(t.location)) reason = 'location';
    if (selector.filters?.some((p) => !matches(ctx, t, p, baseOnly))) reason = 'predicate';
    if (selector.excludeProtected && traits(ctx.content, t).protections.includes(selector.excludeProtected))
      reason = 'protected';
    if (reason) rejected.push(`${t.id}:${reason}`);
    return !reason;
  });
  if (selector.spatial && ['left', 'right', 'adjacent'].includes(selector.spatial)) {
    const ns = neighbors(
      state.entities.filter((e) => e.owner === source.owner),
      source,
    );
    const ids =
      selector.spatial === 'left'
        ? [ns.left?.id]
        : selector.spatial === 'right'
          ? [ns.right?.id]
          : [ns.left?.id, ns.right?.id];
    candidates = candidates.filter((t) => ids.includes(t.id));
  }
  candidates.sort((a, b) => {
    const pa = isEntity(a) ? a.position : -1,
      pb = isEntity(b) ? b.position : -1;
    return (
      (isEntity(a) && isEntity(b) ? compareText(a.owner, b.owner) : 0) || pa - pb || compareText(a.id, b.id)
    );
  });
  if (selector.spatial === 'leftmost') candidates = candidates.slice(0, 1);
  if (selector.spatial === 'rightmost') candidates = candidates.slice(-1);
  if (selector.order === 'highest' || selector.order === 'lowest') {
    const sign = selector.order === 'highest' ? -1 : 1;
    candidates.sort(
      (a, b) =>
        sign *
        (attribute(ctx, a, selector.attribute ?? 'damage', baseOnly).value -
          attribute(ctx, b, selector.attribute ?? 'damage', baseOnly).value),
    );
  }
  let selected: Target[] = [];
  if (selector.order === 'random') {
    if (baseOnly) throw new Error('Random aura targeting is not permitted');
    const bag = [...candidates];
    while (bag.length && selected.length < (selector.count ?? bag.length + selected.length)) {
      const preferred = selector.preferUnstatus
        ? bag.filter((t) => isEntity(t) && (t.statuses[selector.preferUnstatus!] ?? 0) <= state.time)
        : bag;
      const pool = preferred.length ? preferred : bag;
      const rng = roll(state.seed, state.rng, 'targets', pool.length);
      const picked = pool[rng.value];
      ctx.trace?.('rng', [picked.id], {
        stream: 'targets',
        raw: rng.raw,
        roll: rng.value,
        candidates: pool.map((t) => t.id).join(','),
      });
      selected.push(picked);
      bag.splice(bag.indexOf(picked), 1);
    }
  } else selected = candidates.slice(0, selector.count ?? candidates.length);
  ctx.trace?.(
    'targets',
    selected.map((t) => t.id),
    {
      selector: canonical(selector),
      eligible: candidates.map((t) => t.id).join(','),
      rejected: rejected.join(';'),
      explanation: selected.length
        ? 'Stable candidates; selection resolved'
        : 'Empty selection; this action fizzles',
    },
  );
  return selected;
}
export function evaluate(ctx: EvalContext, expr: Expr): number {
  if (typeof expr === 'number') return expr;
  if ('count' in expr) {
    if (expr.count.order === 'random') throw new Error('Expression counts cannot consume randomness');
    const targets = select({ ...ctx, trace: undefined }, expr.count);
    return expr.distinctTypes
      ? new Set(targets.flatMap((t) => (isEntity(t) ? traits(ctx.content, t).types : []))).size
      : targets.length;
  }
  if ('ref' in expr) {
    const owner = ctx.state.players.find((p) => p.id === ctx.source.owner)!;
    switch (expr.ref) {
      case 'source':
        return attribute(ctx, ctx.source, expr.key).value;
      case 'target':
        return attribute(ctx, ctx.target ?? ctx.source, expr.key).value;
      case 'owner':
        return attribute(ctx, owner, expr.key).value;
      case 'enemy':
        return attribute(ctx, ctx.state.players.find((p) => p.id !== owner.id) ?? owner, expr.key).value;
      case 'event':
        return Number(ctx.event?.payload[expr.key] ?? 0) || 0;
      case 'counter':
        return owner.counters[expr.key] ?? 0;
      case 'tier':
        return definition(ctx.content, ctx.source.defId).tiers[ctx.source.tier]?.[expr.key] ?? 0;
    }
  }
  const values = expr.args.map((x) => evaluate(ctx, x));
  let value = values[0] ?? 0;
  for (const v of values.slice(1)) {
    if (expr.op === 'add') value += v;
    if (expr.op === 'sub') value -= v;
    if (expr.op === 'mul') value *= v;
    if (expr.op === 'div') {
      if (!v) throw new Error('Expression division by zero');
      value = Math.floor(value / v);
    }
    if (expr.op === 'min') value = Math.min(value, v);
    if (expr.op === 'max') value = Math.max(value, v);
    if (!Number.isSafeInteger(value)) throw new Error('Expression intermediate overflow');
  }
  if (!Number.isSafeInteger(value)) throw new Error('Expression overflow');
  return Math.max(-100000000, Math.min(100000000, value));
}
