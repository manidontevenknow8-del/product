export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

export class SupabaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupabaseConfigError';
  }
}

/** Whether Supabase env vars are present (enables real auth). */
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  return Boolean(url && anonKey);
}

/** Returns validated config or throws — use when Supabase is required. */
export function getSupabaseConfig(): SupabaseConfig {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    throw new SupabaseConfigError(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them to your .env file.',
    );
  }

  return { url, anonKey };
}

export function getAuthRedirectUrl(path = '/auth/callback'): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }
  return path;
}
