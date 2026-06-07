import { isSupabaseConfigured } from '@/services/supabase/config';
import { mockHealthRecordService } from './mockHealthRecordService';
import { supabaseHealthRecordService } from './supabaseHealthRecordService';

export type {
  IHealthRecordService,
  HealthRecord,
  HealthRecordType,
  HealthRecordSeverity,
  CreateHealthRecordInput,
  UpdateHealthRecordInput,
} from './healthRecordTypes';
export {
  HEALTH_RECORD_TYPES,
  healthRecordTypeLabels,
  healthRecordSeverityLabels,
} from './healthRecordTypes';
export { mockHealthRecordService } from './mockHealthRecordService';
export { supabaseHealthRecordService } from './supabaseHealthRecordService';
export {
  mapHealthRecordRow,
  formatHealthRecordDate,
  defaultCreateHealthRecordInput,
  deriveProfileHealthSummary,
  type ProfileHealthSummary,
} from './healthRecordMappers';

export function getHealthRecordService() {
  return isSupabaseConfigured() ? supabaseHealthRecordService : mockHealthRecordService;
}

export const healthRecordService = getHealthRecordService();
