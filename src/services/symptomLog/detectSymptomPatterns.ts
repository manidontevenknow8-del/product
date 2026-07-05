import type { SymptomLog } from './symptomLogTypes';

export type SymptomPattern = {
  id: string;
  symptom: string;
  count: number;
  windowDays: number;
  message: string;
};

const DEFAULT_WINDOW_DAYS = 30;
const MIN_OCCURRENCES = 2;

function daysSince(dateKey: string): number {
  const logged = new Date(`${dateKey}T12:00:00`).getTime();
  const today = new Date(`${new Date().toISOString().slice(0, 10)}T12:00:00`).getTime();
  return Math.max(0, Math.round((today - logged) / (24 * 60 * 60 * 1000)));
}

function formatSymptomLabel(symptom: string): string {
  return symptom
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/**
 * Surfaces recurring symptoms from structured logs for Pro foresight.
 */
export function detectSymptomPatterns(
  logs: SymptomLog[],
  windowDays = DEFAULT_WINDOW_DAYS,
  minOccurrences = MIN_OCCURRENCES,
): SymptomPattern[] {
  const counts = new Map<string, number>();

  for (const log of logs) {
    if (daysSince(log.loggedAt.slice(0, 10)) > windowDays) continue;
    for (const symptom of log.symptoms) {
      counts.set(symptom, (counts.get(symptom) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .filter(([, count]) => count >= minOccurrences)
    .sort((a, b) => b[1] - a[1])
    .map(([symptom, count]) => {
      const label = formatSymptomLabel(symptom);
      const timesLabel = count === 1 ? 'once' : `${count} times`;
      return {
        id: `${symptom}-${windowDays}`,
        symptom,
        count,
        windowDays,
        message: `${label} logged ${timesLabel} in the last ${windowDays} days — worth monitoring.`,
      };
    });
}
