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

export function isServiceRoleRequest(req: Request): boolean {
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const token = bearerToken(req);
  if (!serviceKey || !token) return false;
  return timingSafeEqual(token, serviceKey);
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
