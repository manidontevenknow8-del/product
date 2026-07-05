import { getSupabaseClient } from '@/services/supabase/client';
import type { CreateSymptomLogInput, ISymptomLogService, SymptomLogRow } from './symptomLogTypes';
import { mapSymptomLogRow } from './symptomLogTypes';
import { resolveSymptomPhotoUrl } from './symptomLogPhotoService';

const SELECT =
  'id, pet_id, symptoms_json, note, photo_url, logged_at, logged_by_user_id, created_at';

export const supabaseSymptomLogService: ISymptomLogService = {
  async getLogsByPet(_ownerId, petId) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('pet_symptom_logs')
      .select(SELECT)
      .eq('pet_id', petId)
      .order('logged_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as SymptomLogRow[]).map(mapSymptomLogRow);
  },

  async createLog(ownerId, input: CreateSymptomLogInput) {
    const supabase = getSupabaseClient();
    const logId = crypto.randomUUID();
    const photoUrl = await resolveSymptomPhotoUrl(ownerId, input.petId, logId, input.photoUrl);

    const payload = {
      id: logId,
      pet_id: input.petId,
      symptoms_json: input.symptoms,
      note: input.note?.trim() || null,
      photo_url: photoUrl,
      logged_by_user_id: ownerId,
    };

    const { data, error } = await supabase
      .from('pet_symptom_logs')
      .insert(payload)
      .select(SELECT)
      .single();

    if (error) throw new Error(error.message);
    return mapSymptomLogRow(data as SymptomLogRow);
  },

  async deleteLog(_ownerId, logId) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('pet_symptom_logs').delete().eq('id', logId);
    if (error) throw new Error(error.message);
  },
};
