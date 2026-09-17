import { attribute, evaluate, type EvalContext } from '../packages/sim/src/evaluate';
import { definition } from '../packages/sim/src/geometry';
import type { Ability, Action, Aura, Expr, ModifierOp, Predicate, Selector } from '../packages/sim/src/model';

const seconds = (value: number) => `${value / 1000}s`;
const comparison = { eq: '=', ne: '≠', lt: '<', lte: '≤', gt: '>', gte: '≥' };
export function statName(key: string): string {
  return (
    { ammo: 'Max Ammo', crit: 'Crit chance', sell: 'Sell value', maxHealth: 'Max Health' }[key] ??
    key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
  );
}
function predicateText(p: Predicate): string {
  const prefix = p.not ? 'without ' : '';
  if (p.field === 'type') return `${prefix}${p.value} type`;
  if (p.field === 'capability' || p.field === 'reference') return `${prefix}${p.value} ${p.field}`;
  if (p.field === 'cooldown') return p.not ? 'no cooldown' : 'a cooldown';
  if (p.field === 'status') return `${prefix}${p.key}`;
  if (p.field === 'ammo') return `${prefix}${typeof p.value === 'string' ? `${p.value} ` : ''}Ammo`;
  if (p.field === 'relativeSize') return `size ${comparison[p.compare ?? 'eq']} this item's size`;
  return `${prefix}${p.key ?? p.field} ${comparison[p.compare ?? 'eq']} ${p.value}`;
}
export function targetText(target: Selector): string {
  if (target.side === 'owner') return 'you';
  if (target.side === 'enemy') return 'your opponent';
  if (target.side === 'self') return 'this item';
  if (target.side === 'eventSource') return 'the triggering item';
  if (target.side === 'eventTargets') return 'the triggering event’s targets';
  if (target.side === 'previous') return 'the previously selected targets';
  const side = target.side === 'enemyItems' ? 'enemy' : target.side === 'allItems' ? '' : 'allied';
  const space = {
    left: 'the left neighbor',
    right: 'the right neighbor',
    adjacent: 'adjacent items',
    leftmost: 'the leftmost item',
    rightmost: 'the rightmost item',
  };
  let text = target.spatial
    ? `${space[target.spatial]} on the ${side || 'either'} board`
    : `${target.count === undefined ? 'all' : `up to ${target.count}`} ${target.order === 'random' ? 'random ' : ''}${target.other ? 'other ' : ''}${side} item${target.count === 1 ? '' : 's'}`;
  if (target.filters?.length) text += ` with ${target.filters.map(predicateText).join(', ')}`;
  if (target.order === 'highest' || target.order === 'lowest')
    text += `, ${target.order} ${statName(target.attribute ?? 'damage')} first`;
  if (target.location) text += ` (${target.location.join(' / ')})`;
  return text;
}

function dynamic(expr: Expr): boolean {
  return (
    typeof expr !== 'number' &&
    ('ref' in expr
      ? ['target', 'event'].includes(expr.ref)
      : 'op' in expr
        ? expr.args.some(dynamic)
        : ['eventSource', 'eventTargets', 'previous'].includes(expr.count.side))
  );
}
function expressionText(ctx: EvalContext, expr: Expr): string {
  if (!dynamic(expr)) return String(evaluate(ctx, expr));
  if (typeof expr === 'number') return String(expr);
  if ('ref' in expr) return `${expr.ref === 'target' ? 'target’s' : 'event’s'} ${statName(expr.key)}`;
  if ('op' in expr) return `${expr.op}(${expr.args.map((e) => expressionText(ctx, e)).join(', ')})`;
  return `number of ${expr.distinctTypes ? 'distinct types among ' : ''}${targetText(expr.count)}`;
}
function modifierText(key: string, op: ModifierOp, amount: string): string {
  const n = Number(amount),
    value = Number.isFinite(n)
      ? key === 'cooldown'
        ? seconds(n)
        : ['crit', 'lifesteal'].includes(key)
          ? `${n / 100}%`
          : amount
      : amount;
  if (op === 'percent')
    return `${Number.isFinite(n) ? `${n >= 0 ? '+' : ''}${n / 100}` : `(${amount} ÷ 100)`}% ${statName(key)}`;
  if (op === 'multiply')
    return `multiply ${statName(key)} by ${Number.isFinite(n) ? n / 10000 : `(${amount} ÷ 10000)`}`;
  if (op === 'set') return `set ${statName(key)} to ${value}`;
  if (op === 'min' || op === 'max')
    return `${op === 'min' ? 'cap' : 'raise'} ${statName(key)} ${op === 'min' ? 'at' : 'to at least'} ${value}`;
  return `${n >= 0 ? '+' : ''}${value} ${statName(key)}`;
}
function actionText(ctx: EvalContext, action: Action): string {
  const amount = action.amount === 'full' ? 'full' : expressionText(ctx, action.amount ?? 0),
    target = targetText(action.target),
    timedAmount = Number.isFinite(Number(amount)) ? seconds(Number(amount)) : amount,
    scope =
      action.scope === 'permanent' || action.scope === 'run'
        ? ' permanently'
        : action.scope === 'day'
          ? ' for the day'
          : action.scope === 'timed'
            ? ` for ${seconds(action.duration ?? 1000)}`
            : action.scope === 'activation'
              ? ' for this cast'
              : ' for the fight';
  switch (action.kind) {
    case 'damage':
      return `Deal ${amount} Damage to ${target}${action.bypassShield ? ', bypassing Shield' : ''}.`;
    case 'shield':
      return `Grant ${amount} Shield to ${target}.`;
    case 'heal':
      return `Heal ${target} for ${amount}${action.cleanses === false ? ' without cleansing' : ''}.`;
    case 'status':
      return ['haste', 'slow', 'freeze'].includes(action.status!)
        ? `${statName(action.status!)} ${target} for ${timedAmount}.`
        : `Apply ${amount} ${statName(action.status!)} to ${target}.`;
    case 'cleanse':
      return `Remove ${action.mode === 'all' ? 'all' : `${amount}${action.mode === 'percent' ? '%' : ''} of`} ${(action.statuses ?? ['burn', 'poison']).join(' and ')} from ${target}.`;
    case 'charge':
      return `Charge ${target} by ${timedAmount}.`;
    case 'reload':
      return amount === 'full' ? `Fully reload ${target}.` : `Restore ${amount} Ammo to ${target}.`;
    case 'modify':
      return `${modifierText(action.attribute!, action.op ?? 'add', amount)} on ${target}${scope}.`;
    case 'forceUse':
      return `Force ${target} to activate.`;
    case 'destroy':
      return `Destroy ${target}.`;
    case 'repair':
      return `Repair ${target}.`;
    case 'transform':
      return `Transform ${target} into a random same-size item from ${action.pool}${scope}.`;
    case 'flying':
      return `${action.value === false ? 'Stop' : 'Start'} Flying on ${target}.`;
    case 'resource':
      return `Grant ${amount} ${statName(action.attribute!)} to ${target}.`;
    case 'type':
      return action.mode === 'all'
        ? `Remove the added ${action.value} type from ${target}${scope}.`
        : `Give ${target} the ${action.value} type${scope}.`;
    case 'meter':
      return `Change ${action.attribute} by ${amount} on ${target}.`;
    case 'slot':
      return action.value === false
        ? `Remove ${action.attribute} from the first occupied slot of ${target}.`
        : `Set ${action.attribute} to ${action.value} on the first occupied slot of ${target}.`;
    case 'enchant':
      return `Apply ${action.value} to ${target}.`;
    case 'upgrade':
      return `Upgrade ${target} by one tier.`;
    case 'generate':
      return `Generate an item from ${action.pool} for ${target}.`;
    case 'publish':
      return action.event === 'sandstorm.start'
        ? 'Start the Sandstorm.'
        : `Publish ${action.event} for ${target}.`;
  }
}
export interface AbilityDescription {
  title: string;
  text: string;
  notes: string;
}
export function auraDescription(ctx: EvalContext, aura: Aura): string {
  const conditions = aura.conditions
    ?.map((c) => `${expressionText(ctx, c.left)} ${comparison[c.op]} ${expressionText(ctx, c.right)}`)
    .join(' and ');
  return `While active from ${aura.locations.join(' or ')}${conditions ? ` and ${conditions}` : ''}: ${modifierText(aura.attribute, aura.op, String(aura.value))} on ${targetText(aura.target)}.`;
}
export function abilityDescription(ctx: EvalContext, ability: Ability): AbilityDescription {
  const trigger = ability.trigger;
  const events: Record<string, string> = {
    activate: 'On each cast',
    'combat.start': 'At combat start',
    'item.used': 'When an item is used',
    'item.bought': 'When an item is purchased',
    'merchant.visited': 'When you visit a merchant',
    'hour.completed': 'When an hour ends',
    'burn.applied': 'When Burn is applied',
    'poison.applied': 'When Poison is applied',
    'shield.gained': 'When Shield is gained',
    'death.proposed': 'When death is proposed',
    'health.threshold': 'At half Health',
  };
  const notes = [
    `Active from ${ability.locations.join(' or ')}.`,
    trigger.relation && trigger.relation !== 'any'
      ? `${{ self: 'This item only', other: 'Other allied items only', owner: 'Your events only', enemy: 'Enemy events only' }[trigger.relation]}.`
      : '',
    trigger.source?.length ? `Source must have ${trigger.source.map(predicateText).join(', ')}.` : '',
    trigger.every ? `Every ${trigger.every} matching events.` : '',
    trigger.first ? `Up to ${trigger.first} times per ${trigger.scope ?? 'combat'}.` : '',
    trigger.oncePer ? `At most once per ${trigger.oncePer}.` : '',
    ability.internalCooldown ? `${seconds(ability.internalCooldown)} internal cooldown.` : '',
    ...(ability.conditions ?? []).map(
      (c) => `Requires ${expressionText(ctx, c.left)} ${comparison[c.op]} ${expressionText(ctx, c.right)}.`,
    ),
    ...ability.actions
      .filter((a) => a.target.preferUnstatus)
      .map((a) => `Prefers targets without ${a.target.preferUnstatus}.`),
  ].filter(Boolean);
  return {
    title: `${ability.quest ? `Quest · ${ability.quest.required} matches · ` : ''}${events[trigger.event] ?? `On ${trigger.event}`}`,
    text: ability.actions.map((a) => actionText(ctx, a)).join(' '),
    notes: notes.join(' '),
  };
}
/** Include attributes introduced by enchantments/auras even when not printed at this tier. */
export function inspectedAttributes(ctx: EvalContext): string[] {
  const def = definition(ctx.content, ctx.source.defId);
  const enchantment = ctx.source.enchantment ? def.enchantments[ctx.source.enchantment] : undefined;
  const candidates = new Set([
    ...Object.keys(def.tiers[ctx.source.tier] ?? {}),
    ...Object.keys(enchantment?.attributes ?? {}),
    ...ctx.source.modifiers.map((m) => m.attribute),
    ...ctx.source.runtime.map((m) => m.attribute),
    ...ctx.state.entities.flatMap((e) => {
      const d = definition(ctx.content, e.defId);
      return [...(d.auras ?? []), ...(e.enchantment ? (d.enchantments[e.enchantment]?.auras ?? []) : [])].map(
        (a) => a.attribute,
      );
    }),
  ]);
  return [...candidates].filter(
    (key) =>
      key !== 'buy' &&
      (key in (def.tiers[ctx.source.tier] ?? {}) || attribute(ctx, ctx.source, key).steps.length > 0),
  );
}
/** Describes the actual host-specific enchantment data, not a second name-based rules catalog. */
export function enchantmentLines(ctx: EvalContext): string[] {
  const { source } = ctx;
  const enchantment =
    source.enchantment && definition(ctx.content, source.defId).enchantments[source.enchantment];
  if (!enchantment) return [];
  const lines = Object.entries(enchantment.attributes ?? {}).map(([key, value]) =>
    key === 'crit' || key === 'lifesteal'
      ? `+${value / 100}% ${key}.`
      : key === 'multicast'
        ? `+${value} additional cast per use.`
        : `+${value} ${key === 'sell' ? 'gold sell value' : key}.`,
  );
  if (enchantment.protections?.length) lines.push(`Absorbs ${enchantment.protections.join(', ')} effects.`);
  for (const aura of enchantment.auras ?? []) lines.push(auraDescription(ctx, aura));
  for (const ability of enchantment.abilities ?? []) {
    const description = abilityDescription(ctx, ability);
    lines.push(`${description.title}: ${description.text} ${description.notes}`);
  }
  return lines;
}
