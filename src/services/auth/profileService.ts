import { getSupabaseClient } from '@/services/supabase/client';
import type { ProfileRow } from '@/services/supabase/database.types';

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.warn('[profiles] fetch failed:', error.message);
    return null;
  }

  return data;
}

export async function ensureProfile(
  userId: string,
  email: string,
  name: string,
): Promise<ProfileRow | null> {
  const existing = await fetchProfile(userId);
  if (existing) return existing;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      email,
      name,
      onboarding_completed: false,
      subscription_tier: 'free',
      subscription_plan: 'free',
      subscription_status: 'inactive',
    })
    .select('*')
    .single();

  if (error) {
    console.warn('[profiles] ensure failed:', error.message);
    return null;
  }

  return data;
}

export async function updateProfileOnboarding(
  userId: string,
  completed: boolean,
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: completed })
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}
