import type { DailyCheckInRow } from '@/services/supabase/database.types';
import type { DailyCheckIn, UpsertDailyCheckInInput } from '@/types/dailyCheckIn';

export type { DailyCheckInRow };

export interface IDailyCheckInService {
  getCheckInsByPet(ownerId: string, petId: string): Promise<DailyCheckIn[]>;
  upsertCheckIn(ownerId: string, input: UpsertDailyCheckInInput): Promise<DailyCheckIn>;
  deleteCheckIn(ownerId: string, checkInId: string): Promise<void>;
}

export function mapDailyCheckInRow(row: DailyCheckInRow): DailyCheckIn {
  return {
    id: row.id,
    petId: row.pet_id,
    checkInDate: row.check_in_date,
    feeding: row.feeding,
    walkDistanceKm: row.walk_distance_km,
    weightKg: row.weight_kg ?? null,
    notes: row.notes,
    loggedByUserId: row.logged_by_user_id ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
