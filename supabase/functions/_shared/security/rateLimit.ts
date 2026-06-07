import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.49.1';

export const DEFAULT_RATE_LIMIT = {
  maxRequests: 5,
  windowMinutes: 30,
} as const;

const RATE_LIMIT_MESSAGE =
  'Too many requests. Please wait a few minutes and try again.';

export function rateLimitResponse(
  corsHeaders: Record<string, string>,
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error: RATE_LIMIT_MESSAGE,
      code: 'rate_limit_exceeded',
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': '1800',
      },
    },
  );
}

/**
 * Returns null when allowed; otherwise a 429 Response.
 * Uses atomic DB counter via check_rate_limit RPC (service role).
 */
export async function enforceRateLimit(
  admin: SupabaseClient,
  key: string,
  corsHeaders: Record<string, string>,
  options: { maxRequests?: number; windowMinutes?: number } = {},
): Promise<Response | null> {
  const maxRequests = options.maxRequests ?? DEFAULT_RATE_LIMIT.maxRequests;
  const windowMinutes = options.windowMinutes ?? DEFAULT_RATE_LIMIT.windowMinutes;

  const { data, error } = await admin.rpc('check_rate_limit', {
    p_key: key,
    p_max_requests: maxRequests,
    p_window_minutes: windowMinutes,
  });

  if (error) {
    console.error('rate_limit_check_failed', { key: key.split(':')[0] });
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Service temporarily unavailable. Please try again shortly.',
      }),
      {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }

  if (data !== true) {
    console.info('rate_limit_exceeded', { key: key.split(':')[0] });
    return rateLimitResponse(corsHeaders);
  }

  return null;
}

export function rateLimitKey(
  action: string,
  userId?: string | null,
  ip?: string | null,
): string {
  if (userId) return `${action}:user:${userId}`;
  return `${action}:ip:${ip ?? 'unknown'}`;
}
