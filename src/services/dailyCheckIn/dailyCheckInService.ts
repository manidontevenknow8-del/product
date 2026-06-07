import { isSupabaseConfigured } from '@/services/supabase/config';
import { mockDailyCheckInService } from './mockDailyCheckInService';
import { supabaseDailyCheckInService } from './supabaseDailyCheckInService';

export type { IDailyCheckInService } from './dailyCheckInTypes';
export { mockDailyCheckInService, supabaseDailyCheckInService };
export {
  todayDateKey,
  computeCheckInStreak,
  summarizeCheckInWeek,
  checkInsInMonth,
} from './checkInUtils';

export function getDailyCheckInService() {
  return isSupabaseConfigured() ? supabaseDailyCheckInService : mockDailyCheckInService;
}
