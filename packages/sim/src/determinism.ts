import type { Numbers, Task } from './model';

/** Canonical JSON: lexicographic ASCII keys; integer numbers; no undefined values. */
export function canonical(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'number' && !Number.isSafeInteger(value))
      throw new Error('Non-integer in portable state');
    if (value === undefined) throw new Error('Undefined in portable state');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .filter((k) => record[k] !== undefined)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${canonical(record[k])}`)
    .join(',')}}`;
}
/** FNV-1a over UTF-16 code units. Non-cryptographic, portable unsigned 32-bit hash. */
export function hashText(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619) >>> 0;
  return h;
}
export function hash(value: unknown): string {
  return hashText(canonical(value)).toString(16).padStart(8, '0');
}
export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
export function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
/** xorshift32. Fork names do not advance or consume any other stream. */
export function roll(
  seed: string,
  streams: Numbers,
  stream: string,
  limit: number,
): { value: number; raw: number } {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 4294967296) throw new Error('Invalid RNG limit');
  let x = streams[stream] ?? (hashText(`${seed}/${stream}`) || 1);
  // Rejection sampling removes modulo bias; every consumed word is deterministic.
  const ceiling = Math.floor(4294967296 / limit) * limit;
  do {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
  } while (x >= ceiling);
  streams[stream] = x;
  return { value: x % limit, raw: x };
}
export function compareTasks(a: Task, b: Task): number {
  return (
    a.time - b.time ||
    a.phase - b.phase ||
    a.priority - b.priority ||
    a.owner - b.owner ||
    a.position - b.position ||
    a.seq - b.seq
  );
}
/** Sorted insertion keeps a serializable queue; ordinary boards have only tens of pending tasks. */
export function enqueue(queue: Task[], task: Task): void {
  let lo = 0,
    hi = queue.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (compareTasks(queue[mid], task) <= 0) lo = mid + 1;
    else hi = mid;
  }
  queue.splice(lo, 0, task);
}
