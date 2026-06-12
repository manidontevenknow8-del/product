/** Free-tier visible history window - shared across Dashboard & Scan */
export const TIMELINE_HISTORY_DAYS = 30;

export function partitionByHistoryWindow<T>(
  items: T[],
  getTimestamp: (item: T) => string,
): { recentItems: T[]; historicalItems: T[] } {
  const cutoff = Date.now() - TIMELINE_HISTORY_DAYS * 24 * 60 * 60 * 1000;
  const recentItems: T[] = [];
  const historicalItems: T[] = [];

  for (const item of items) {
    const at = new Date(getTimestamp(item)).getTime();
    if (Number.isNaN(at) || at >= cutoff) {
      recentItems.push(item);
    } else {
      historicalItems.push(item);
    }
  }

  return { recentItems, historicalItems };
}
