export type DailyCheckIn = {
  id: string;
  petId: string;
  checkInDate: string;
  feeding: string;
  walkDistanceKm: number | null;
  weightKg: number | null;
  notes: string | null;
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
