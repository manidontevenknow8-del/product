import type { User as SupabaseUser } from '@supabase/supabase-js';

/** Resolve a display name from Supabase user metadata (email signup or OAuth). */
export function extractDisplayName(supabaseUser: SupabaseUser): string {
  const meta = supabaseUser.user_metadata ?? {};

  const candidates = [
    meta.name,
    meta.full_name,
    [meta.given_name, meta.family_name].filter((part) => typeof part === 'string' && part).join(' '),
  ];

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  const email = supabaseUser.email?.split('@')[0];
  return email?.trim() || 'PetClues User';
}
