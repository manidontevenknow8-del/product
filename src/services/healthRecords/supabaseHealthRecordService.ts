import { getSupabaseClient } from '@/services/supabase/client';
import type { IHealthRecordService } from './healthRecordTypes';
import {
  healthRecordInputToRow,
  healthRecordUpdateToRow,
  mapHealthRecordRow,
} from './healthRecordMappers';
import type { HealthRecordRowWithDocument } from './healthRecordTypes';

const RECORD_SELECT = `
  id,
  pet_id,
  source_document_id,
  record_type,
  title,
  description,
  date_recorded,
  next_due_date,
  severity,
  created_at,
  updated_at,
  pet_documents (
    file_name,
    uploaded_at
  )
`;

export const supabaseHealthRecordService: IHealthRecordService = {
  async getRecordsByPet(_ownerId, petId) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('health_records')
      .select(RECORD_SELECT)
      .eq('pet_id', petId)
      .order('date_recorded', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as HealthRecordRowWithDocument[]).map(mapHealthRecordRow);
  },

  async getRecordsByType(_ownerId, petId, recordType) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('health_records')
      .select(RECORD_SELECT)
      .eq('pet_id', petId)
      .eq('record_type', recordType)
      .order('date_recorded', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as HealthRecordRowWithDocument[]).map(mapHealthRecordRow);
  },

  async createRecord(_ownerId, input) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('health_records')
      .insert(healthRecordInputToRow(input))
      .select(RECORD_SELECT)
      .single();

    if (error) throw new Error(error.message);
    return mapHealthRecordRow(data as HealthRecordRowWithDocument);
  },

  async updateRecord(_ownerId, recordId, input) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('health_records')
      .update(healthRecordUpdateToRow(input))
      .eq('id', recordId)
      .select(RECORD_SELECT)
      .single();

    if (error) throw new Error(error.message);
    return mapHealthRecordRow(data as HealthRecordRowWithDocument);
  },

  async deleteRecord(_ownerId, recordId) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('health_records').delete().eq('id', recordId);
    if (error) throw new Error(error.message);
  },
};
