import type { Content, Instance, Location } from './model';
export function definition(content: Content, id: string) {
  const found = content.definitions.find((d) => d.id === id);
  if (!found) throw new Error(`Unknown definition: ${id}`);
  return found;
}
export function occupied(content: Content, item: Instance): number[] {
  return Array.from({ length: definition(content, item.defId).size }, (_, i) => item.position + i);
}
export function ordered(items: Instance[], location: Location): Instance[] {
  return items
    .filter((i) => i.location === location)
    .sort((a, b) => a.position - b.position || a.acquired - b.acquired || (a.id < b.id ? -1 : 1));
}
export function neighbors(items: Instance[], item: Instance): { left?: Instance; right?: Instance } {
  if (item.location !== 'board') return {};
  const list = ordered(items, 'board');
  const index = list.findIndex((i) => i.id === item.id);
  return index < 0 ? {} : { left: list[index - 1], right: list[index + 1] };
}
export function canPlace(
  content: Content,
  items: Instance[],
  item: Instance,
  location: Location,
  position: number,
  capacity: number,
): boolean {
  const width = definition(content, item.defId).size;
  return (
    Number.isInteger(position) &&
    position >= 0 &&
    position + width <= capacity &&
    !items.some(
      (i) =>
        i.id !== item.id &&
        i.location === location &&
        position < i.position + definition(content, i.defId).size &&
        position + width > i.position,
    )
  );
}
export function firstFit(
  content: Content,
  items: Instance[],
  item: Instance,
  location: Location,
  capacity: number,
): number {
  for (let p = 0; p < capacity; p++) if (canPlace(content, items, item, location, p, capacity)) return p;
  return -1;
}
export function validateGeometry(
  content: Content,
  items: Instance[],
  capacity: number,
  stashCapacity: number,
): void {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) throw new Error(`Duplicate instance ID: ${item.id}`);
    seen.add(item.id);
    if (
      item.location !== 'skills' &&
      !canPlace(
        content,
        items,
        item,
        item.location,
        item.position,
        item.location === 'board' ? capacity : stashCapacity,
      )
    ) {
      throw new Error(`Invalid ${item.location} placement: ${item.id}`);
    }
  }
}
