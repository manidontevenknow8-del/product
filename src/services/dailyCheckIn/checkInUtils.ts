import type { DailyCheckIn, DailyCheckInWeekSummary } from '@/types/dailyCheckIn';

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
