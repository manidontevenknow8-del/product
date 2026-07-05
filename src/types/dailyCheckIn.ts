export type DailyCheckIn = {
  id: string;
  petId: string;
  checkInDate: string;
  feeding: string;
  walkDistanceKm: number | null;
  weightKg: number | null;
  notes: string | null;
  loggedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UpsertDailyCheckInInput = {
  petId: string;
  checkInDate: string;
  feeding: string;
  walkDistanceKm?: number | null;
  weightKg?: number | null;
  notes?: string | null;
};

export type DailyCheckInWeekSummary = {
  daysLogged: number;
  totalWalkKm: number;
  avgWalkKm: number | null;
};

/** Derived from daily_check_ins only — no separate streak store */
export type CheckInStreakStatus =
  | 'checked_in'
  | 'ends_today'
  | 'open_today'
  | 'no_streak';

export type CheckInStreakStats = {
  current: number;
  best: number;
  status: CheckInStreakStatus;
  hasCheckedInToday: boolean;
};
