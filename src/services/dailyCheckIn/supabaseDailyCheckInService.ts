import { getSupabaseClient } from '@/services/supabase/client';
import type { UpsertDailyCheckInInput } from '@/types/dailyCheckIn';
import type { DailyCheckInRow, IDailyCheckInService } from './dailyCheckInTypes';
import { mapDailyCheckInRow } from './dailyCheckInTypes';

const SELECT =
  'id, pet_id, check_in_date, feeding, walk_distance_km, weight_kg, notes, logged_by_user_id, created_at, updated_at';

export const supabaseDailyCheckInService: IDailyCheckInService = {
  async getCheckInsByPet(_ownerId, petId) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('daily_check_ins')
      .select(SELECT)
      .eq('pet_id', petId)
      .order('check_in_date', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as DailyCheckInRow[]).map(mapDailyCheckInRow);
  },

  async upsertCheckIn(ownerId, input: UpsertDailyCheckInInput) {
    const supabase = getSupabaseClient();
    const payload = {
      pet_id: input.petId,
      check_in_date: input.checkInDate,
      feeding: input.feeding.trim(),
      walk_distance_km: input.walkDistanceKm ?? null,
      weight_kg: input.weightKg ?? null,
      notes: input.notes?.trim() || null,
      logged_by_user_id: ownerId,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('daily_check_ins')
      .upsert(payload, { onConflict: 'pet_id,check_in_date' })
      .select(SELECT)
      .single();

    if (error) throw new Error(error.message);
    return mapDailyCheckInRow(data as DailyCheckInRow);
  },

  async deleteCheckIn(_ownerId, checkInId) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('daily_check_ins').delete().eq('id', checkInId);
    if (error) throw new Error(error.message);
  },
};
