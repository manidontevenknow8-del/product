import { getSupabaseClient } from '@/services/supabase/client';
import type { NotificationSettings } from '@/types/settings';
import { buildDefaultSettings } from '@/data/settingsData';
import type { ISettingsService } from './settingsService';

function notificationsFromJson(raw: unknown, fallback: NotificationSettings): NotificationSettings {
  if (!raw || typeof raw !== 'object') return fallback;
  return { ...fallback, ...(raw as NotificationSettings) };
}

export const supabaseSettingsService: ISettingsService = {
  async getSettings(userId, name, email) {
    const supabase = getSupabaseClient();
    const defaults = buildDefaultSettings(name, email);

    const { data, error } = await supabase
      .from('profiles')
      .select('name, email, avatar_url, notification_preferences')
      .eq('user_id', userId)
      .single();

    if (error || !data) return defaults;

    return {
      ...defaults,
      account: {
        name: data.name ?? name,
        email: data.email ?? email,
        profilePhotoUrl: data.avatar_url ?? null,
      },
      notifications: notificationsFromJson(data.notification_preferences, defaults.notifications),
    };
  },

  async updateSettings(userId, settings) {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('profiles')
      .update({
        name: settings.account.name,
        avatar_url: settings.account.profilePhotoUrl,
        notification_preferences: settings.notifications,
      })
      .eq('user_id', userId);

    if (error) throw new Error(error.message);

    // Keep localStorage cache for offline reads
    localStorage.setItem(`petclues_user_settings_${userId}`, JSON.stringify(settings));
    return settings;
  },
};
