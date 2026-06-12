import type { UserSettings } from '@/types/settings';
import { buildDefaultSettings } from '@/data/settingsData';
import { isSupabaseConfigured } from '@/services/supabase/config';
import { supabaseSettingsService } from './supabaseSettingsService';

const STORAGE_KEY = 'petclues_user_settings';

/**
 * Settings service - persists notification preferences to Supabase profiles when configured.
 *
 * Email delivery reads `notification_preferences` from the same profile row
 * via the `process-email-jobs` edge function (Resend).
 */
export interface ISettingsService {
  getSettings(userId: string, name: string, email: string): Promise<UserSettings>;
  updateSettings(userId: string, settings: UserSettings): Promise<UserSettings>;
}

export const mockSettingsService: ISettingsService = {
  async getSettings(userId, name, email) {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    if (stored) return JSON.parse(stored) as UserSettings;
    return buildDefaultSettings(name, email);
  },

  async updateSettings(userId, settings) {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(settings));
    return settings;
  },
};

export function getSettingsService(): ISettingsService {
  return isSupabaseConfigured() ? supabaseSettingsService : mockSettingsService;
}

export const settingsService = getSettingsService();
