import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig, isSupabaseConfigured } from './config';
import type { Database } from './database.types';

let client: SupabaseClient<Database> | null = null;

/** Singleton Supabase client — only available when env vars are configured. */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  if (!client) {
    const { url, anonKey } = getSupabaseConfig();
    client = createClient<Database>(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return client;
}

/** Safe accessor for optional Supabase usage (e.g. health checks). */
export function tryGetSupabaseClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) return null;
  return getSupabaseClient();
}
