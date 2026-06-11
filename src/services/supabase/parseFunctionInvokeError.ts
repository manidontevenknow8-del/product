import { FunctionsHttpError } from '@supabase/supabase-js';
import {
  getUserFacingError,
  sanitizeUserFacingError,
  type UserErrorContext,
} from '@/utils/userFacingErrors';

/** Surfaces JSON `{ error, code }` from edge function non-2xx responses. */
export async function parseFunctionInvokeError(
  error: unknown,
  fallback = 'Request failed',
  context: UserErrorContext = 'generic',
): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = (await error.context.json()) as { error?: string; code?: string };
      if (body?.error) return sanitizeUserFacingError(body.error, context);
    } catch {
      // ignore parse failures
    }
    return sanitizeUserFacingError(fallback, context);
  }

  return getUserFacingError(error, context, fallback);
}
