import { evaluate, type EvalContext } from '../packages/sim/src/evaluate';
import { definition } from '../packages/sim/src/geometry';
import type { Selector } from '../packages/sim/src/model';

function targetText(target: Selector): string {
  if (target.side === 'owner') return 'you';
  if (target.side === 'enemy') return 'your opponent';
  if (target.side === 'self') return 'this item';
  const side = target.side === 'enemyItems' ? 'enemy' : 'allied';
  return `${target.count ?? 'all'} ${target.order === 'random' ? 'random ' : ''}${target.other ? 'other ' : ''}${side} ${target.filters?.some((p) => p.field === 'cooldown') ? 'cooldown ' : ''}item${target.count === 1 ? '' : 's'}`;
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
  for (const ability of enchantment.abilities ?? []) {
    const trigger =
      ability.trigger.event === 'activate'
        ? 'On use'
        : ability.trigger.event === 'item.bought'
          ? 'When you purchase an item'
          : `On ${ability.trigger.event}`;
    for (const action of ability.actions) {
      const amount = action.amount === 'full' ? 'full' : evaluate(ctx, action.amount ?? 0),
        target = targetText(action.target);
      if (action.kind === 'status') {
        const timed = ['haste', 'slow', 'freeze'].includes(action.status!);
        lines.push(
          `${trigger}: ${timed ? `${action.status} ${target} for ${Number(amount) / 1000}s` : `apply ${amount} ${action.status} to ${target}`}.${action.target.preferUnstatus ? ` Prefers items without ${action.target.preferUnstatus}.` : ''}`,
        );
      } else if (action.kind === 'modify')
        lines.push(
          `${trigger}: ${action.scope === 'permanent' ? 'permanently ' : ''}add ${amount} ${action.attribute === 'sell' ? 'sell value' : action.attribute} to ${target}.`,
        );
      else lines.push(`${trigger}: ${action.kind} ${amount} → ${target}.`);
    }
  }
  return lines;
}
