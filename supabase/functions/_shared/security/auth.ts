/** Constant-time string comparison for secrets (best-effort in Deno). */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export function bearerToken(req: Request): string | null {
  const auth = req.headers.get('Authorization') ?? '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? null;
}

/** Read role claim from a Supabase JWT (signature must already be verified by the gateway). */
function serviceRoleFromJwt(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(b64)) as { role?: string; iss?: string };
    return payload.role === 'service_role' && Boolean(payload.iss?.includes('supabase'));
  } catch {
    return false;
  }
}

/**
 * @param jwtVerified When true, accept a verified service_role JWT (for functions with verify_jwt = true).
 */
export function isServiceRoleRequest(req: Request, jwtVerified = false): boolean {
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const token = bearerToken(req);
  if (!token) return false;
  if (serviceKey && timingSafeEqual(token, serviceKey)) return true;
  return jwtVerified && serviceRoleFromJwt(token);
}

/** Cron jobs and internal callers must present CRON_SECRET or service role. */
export function isInternalCaller(req: Request): boolean {
  if (isServiceRoleRequest(req)) return true;
  const cronSecret = Deno.env.get('CRON_SECRET');
  const provided = req.headers.get('x-cron-secret') ?? '';
  if (!cronSecret || !provided) return false;
  return timingSafeEqual(provided, cronSecret);
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return req.headers.get('cf-connecting-ip') ?? req.headers.get('x-real-ip') ?? 'unknown';
}
