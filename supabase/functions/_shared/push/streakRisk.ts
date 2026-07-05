/** Streak-at-risk detection for push (mirrors app checkInUtils / CHECK_IN_LATE_HOUR). */

export const CHECK_IN_LATE_HOUR = 18;
export const STREAK_PUSH_WINDOW_END_HOUR = 20;

export function todayDateKeyUtc(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function shiftDateKey(dateKey: string, days: number): string {
  const d = new Date(`${dateKey}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function computeCheckInStreak(checkInDates: string[], today: string): number {
  const dates = new Set(checkInDates);
  if (dates.size === 0) return 0;

  let cursor = dates.has(today) ? today : shiftDateKey(today, -1);
  if (!dates.has(cursor)) return 0;

  let streak = 0;
  while (dates.has(cursor)) {
    streak += 1;
    cursor = shiftDateKey(cursor, -1);
  }
  return streak;
}

export function isStreakAtRisk(checkInDates: string[], today: string): boolean {
  const hasCheckedInToday = checkInDates.includes(today);
  if (hasCheckedInToday) return false;
  return computeCheckInStreak(checkInDates, today) > 0;
}

export type LocalTimeParts = {
  dateKey: string;
  hour: number;
};

/** Local calendar date (YYYY-MM-DD) and hour (0–23) for a timezone. */
export function getLocalTimeParts(timezone: string, now = new Date()): LocalTimeParts {
  const safeTz = timezone?.trim() || 'UTC';
  try {
    const dateFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: safeTz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const hourFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: safeTz,
      hour: 'numeric',
      hour12: false,
    });
    const dateKey = dateFormatter.format(now);
    const hour = Number.parseInt(hourFormatter.format(now), 10);
    return { dateKey, hour: Number.isFinite(hour) ? hour % 24 : 0 };
  } catch {
    return { dateKey: todayDateKeyUtc(now), hour: now.getUTCHours() };
  }
}

export function isInStreakPushWindow(hour: number): boolean {
  return hour >= CHECK_IN_LATE_HOUR && hour < STREAK_PUSH_WINDOW_END_HOUR;
}

export function streakRiskNotificationCopy(petName: string, streak: number): {
  title: string;
  body: string;
} {
  const streakLabel = streak === 1 ? '1-day' : `${streak}-day`;
  return {
    title: `Keep ${petName}'s ${streakLabel} streak`,
    body: `A quick check-in tonight keeps the rhythm going — no pressure, just a gentle nudge.`,
  };
}
