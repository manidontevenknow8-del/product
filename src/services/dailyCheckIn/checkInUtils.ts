import type { DailyCheckIn, DailyCheckInWeekSummary, CheckInStreakStats } from '@/types/dailyCheckIn';

/** Local hour (0–23) after which a missing check-in is surfaced gently as "ends today". */
export const CHECK_IN_LATE_HOUR = 18;

export function todayDateKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function shiftDateKey(dateKey: string, days: number): string {
  const d = new Date(`${dateKey}T12:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function computeCheckInStreak(checkIns: DailyCheckIn[], today = todayDateKey()): number {
  const dates = new Set(checkIns.map((c) => c.checkInDate));
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

export function isCheckInDayGettingLate(now = new Date()): boolean {
  return now.getHours() >= CHECK_IN_LATE_HOUR;
}

/** Longest consecutive run of check-in dates in history. */
export function computeBestCheckInStreak(checkIns: DailyCheckIn[]): number {
  const dates = [...new Set(checkIns.map((c) => c.checkInDate))].sort();
  if (dates.length === 0) return 0;

  let best = 1;
  let run = 1;

  for (let i = 1; i < dates.length; i += 1) {
    const previous = dates[i - 1]!;
    const current = dates[i]!;
    if (shiftDateKey(previous, 1) === current) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }

  return best;
}

export function buildCheckInStreakStats(
  checkIns: DailyCheckIn[],
  today = todayDateKey(),
  now = new Date(),
): CheckInStreakStats {
  const current = computeCheckInStreak(checkIns, today);
  const best = Math.max(computeBestCheckInStreak(checkIns), current);
  const hasCheckedInToday = checkIns.some((c) => c.checkInDate === today);

  let status: CheckInStreakStats['status'];
  if (hasCheckedInToday) {
    status = 'checked_in';
  } else if (current > 0 && isCheckInDayGettingLate(now)) {
    status = 'ends_today';
  } else if (current > 0) {
    status = 'open_today';
  } else {
    status = 'no_streak';
  }

  return { current, best, status, hasCheckedInToday };
}

export function summarizeCheckInWeek(checkIns: DailyCheckIn[]): DailyCheckInWeekSummary {
  const today = todayDateKey();
  const weekStart = shiftDateKey(today, -6);
  const inWeek = checkIns.filter((c) => c.checkInDate >= weekStart && c.checkInDate <= today);
  const walks = inWeek
    .map((c) => c.walkDistanceKm)
    .filter((v): v is number => v != null && Number.isFinite(v));
  const totalWalkKm = walks.reduce((sum, v) => sum + v, 0);

  return {
    daysLogged: inWeek.length,
    totalWalkKm: Math.round(totalWalkKm * 10) / 10,
    avgWalkKm: walks.length > 0 ? Math.round((totalWalkKm / walks.length) * 10) / 10 : null,
  };
}

export function checkInsInMonth(checkIns: DailyCheckIn[], monthKey: string): DailyCheckIn[] {
  return checkIns.filter((c) => c.checkInDate.startsWith(`${monthKey}-`));
}
