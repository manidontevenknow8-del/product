import { FunctionsHttpError } from '@supabase/supabase-js';

/** Surfaces JSON `{ error, code }` from edge function non-2xx responses. */
export async function parseFunctionInvokeError(
  error: unknown,
  fallback = 'Request failed',
): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = (await error.context.json()) as { error?: string; code?: string };
      if (body?.error) return body.error;
    } catch {
      // ignore parse failures
    }
    return `${fallback} (HTTP ${error.context.status})`;
  }

  if (error instanceof Error) return error.message;
  return fallback;
}
