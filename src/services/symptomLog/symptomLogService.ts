import { isSupabaseConfigured } from '@/services/supabase/config';
import type { ISymptomLogService } from './symptomLogTypes';
import { mockSymptomLogService } from './mockSymptomLogService';
import { supabaseSymptomLogService } from './supabaseSymptomLogService';

export function getSymptomLogService(): ISymptomLogService {
  return isSupabaseConfigured() ? supabaseSymptomLogService : mockSymptomLogService;
}
