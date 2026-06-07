import { isSupabaseConfigured } from '@/services/supabase/config';
import { mockReminderService } from './mockReminderService';
import { supabaseReminderService } from './supabaseReminderService';

export type { IReminderService, ReminderRow, ReminderRowWithPet } from './reminderTypes';
export { mockReminderService } from './mockReminderService';
export { supabaseReminderService } from './supabaseReminderService';
export {
  defaultCreateReminderInput,
  mapReminderRow,
  reminderInputToRow,
  reminderUpdateToRow,
  computeNextDueDate,
} from './reminderMappers';

export function getReminderService() {
  return isSupabaseConfigured() ? supabaseReminderService : mockReminderService;
}

export const reminderService = getReminderService();
