/**
 * Pick related peers in a ring around the current item so every node gets
 * inbound links (unlike always taking the first N of a sorted list).
 */
export function pickRingNeighbors<T>(
  items: readonly T[],
  currentIndex: number,
  limit: number,
): T[] {
  if (items.length <= 1 || limit <= 0 || currentIndex < 0) return [];
  const out: T[] = [];
  const n = items.length;
  let step = 1;
  while (out.length < limit && step < n) {
    const left = (currentIndex - step + n) % n;
    const right = (currentIndex + step) % n;
    if (left !== currentIndex) out.push(items[left]!);
    if (out.length >= limit) break;
    if (right !== currentIndex && right !== left) out.push(items[right]!);
    step += 1;
  }
  return out;
}

function hashKey(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function pickRingNeighborsByKey<T>(
  items: readonly T[],
  keyOf: (item: T) => string,
  currentKey: string,
  limit: number,
): T[] {
  if (items.length === 0 || limit <= 0) return [];
  const sorted = [...items].sort((a, b) => keyOf(a).localeCompare(keyOf(b)));
  let idx = sorted.findIndex((item) => keyOf(item) === currentKey);
  if (idx < 0) {
    idx = hashKey(currentKey) % sorted.length;
  }
  return pickRingNeighbors(sorted, idx, limit).filter((item) => keyOf(item) !== currentKey);
}
