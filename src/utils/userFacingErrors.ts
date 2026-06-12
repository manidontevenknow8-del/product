/**
 * Maps internal/technical errors to safe, user-friendly copy for the deployed app.
 * Never surface Postgres, RLS, migration, or stack-trace details to end users.
 */

export type UserErrorContext =
  | 'generic'
  | 'upload'
  | 'decode'
  | 'payment'
  | 'subscription'
  | 'reminder'
  | 'healthRecord'
  | 'pet'
  | 'export'
  | 'auth';

export const USER_FACING_ERRORS = {
  generic: 'Something went wrong. Please try again in a moment.',
  network: 'We could not reach our servers. Check your connection and try again.',
  upload: 'We could not upload your file. Please try again.',
  uploadType: 'That file type is not supported. Use PDF, JPG, or PNG.',
  uploadSize: 'That file is too large. Maximum size is 10 MB.',
  decode: 'We could not read this document right now. Please try again later.',
  decodePremium: 'Vet Bill Decoder is a Premium feature. Upgrade to unlock it.',
  documentNotFound: 'That document could not be found. Try uploading it again.',
  payment: 'Payment could not be completed. Please try again.',
  paymentVerify: 'We could not verify your payment. Contact support if you were charged.',
  subscription: 'We could not update your subscription. Please try again.',
  authRequired: 'Please sign in to continue.',
  forbidden: 'You do not have permission to do that.',
  petRequired: 'Select a pet before continuing.',
  reminder: 'We could not save your reminder. Please try again.',
  healthRecord: 'We could not save this health record. Please try again.',
  petSave: 'We could not save your pet profile. Please try again.',
  export: 'Export failed. Please try again.',
  notFound: 'We could not find what you were looking for.',
  rateLimit: 'Too many requests. Please wait a moment and try again.',
  server: 'Our servers are having trouble. Please try again in a few minutes.',
} as const;

/** Messages already written for users - safe to show as-is. */
const SAFE_MESSAGE_PATTERNS: RegExp[] = [
  /^please sign in/i,
  /^select a pet/i,
  /^that file type/i,
  /^that file is too large/i,
  /^vet bill decoder is a premium/i,
  /^payment could not/i,
  /^document not found/i,
  /^that document could not/i,
  /^invalid email or password/i,
  /^an account with this email/i,
  /^please verify your email/i,
  /^free plan allows/i,
  /^upgrade to premium/i,
  /^pet name is required/i,
  /^title is required/i,
  /^something went wrong/i,
  /^we could not/i,
  /^too many/i,
  /^export failed/i,
  /^upload failed/i,
  /^checkout canceled/i,
  /^payments are coming soon/i,
  /^document vault limit reached/i,
  /^pet limit reached/i,
  /^reminder limit reached/i,
  /^health record limit reached/i,
];

const TECHNICAL_PATTERNS: { pattern: RegExp; context?: UserErrorContext }[] = [
  { pattern: /row-level security|violates.*policy/i },
  { pattern: /check constraint|violates.*constraint/i },
  { pattern: /foreign key|duplicate key|unique constraint/i },
  { pattern: /relation\s+"[^"]+"\s+(does not exist|violates)/i },
  { pattern: /sqlstate|postgres|supabase db push|npx supabase/i },
  { pattern: /\bvet_bill_extractions\b|\bpet_documents\b|\bstorage\.objects\b/i },
  { pattern: /bucket not found|bucket.*missing/i, context: 'upload' },
  { pattern: /jwt|token.*expired|invalid.*session/i, context: 'auth' },
  { pattern: /network|fetch failed|failed to fetch/i },
  { pattern: /429|rate.?limit|too many requests/i },
  { pattern: /401|unauthorized/i, context: 'auth' },
  { pattern: /403|forbidden|premium|subscription/i, context: 'decode' },
  { pattern: /404|not found/i },
  { pattern: /5\d{2}|internal server/i },
  { pattern: /unknown error/i },
  { pattern: /http\s*\d{3}/i },
  { pattern: /\(SQLSTATE/i },
  { pattern: /at\s+\w+\s+\(/ }, // stack trace fragment
];

function defaultForContext(context: UserErrorContext): string {
  switch (context) {
    case 'upload':
      return USER_FACING_ERRORS.upload;
    case 'decode':
      return USER_FACING_ERRORS.decode;
    case 'payment':
      return USER_FACING_ERRORS.payment;
    case 'subscription':
      return USER_FACING_ERRORS.subscription;
    case 'reminder':
      return USER_FACING_ERRORS.reminder;
    case 'healthRecord':
      return USER_FACING_ERRORS.healthRecord;
    case 'pet':
      return USER_FACING_ERRORS.petSave;
    case 'export':
      return USER_FACING_ERRORS.export;
    case 'auth':
      return USER_FACING_ERRORS.authRequired;
    default:
      return USER_FACING_ERRORS.generic;
  }
}

function mapTechnicalMessage(message: string, context: UserErrorContext): string {
  const lower = message.toLowerCase();

  if (/429|rate.?limit|too many/.test(lower)) return USER_FACING_ERRORS.rateLimit;
  if (/401|unauthorized|sign in/.test(lower)) return USER_FACING_ERRORS.authRequired;
  if (/403|forbidden/.test(lower) && context === 'decode') return USER_FACING_ERRORS.decodePremium;
  if (/403|forbidden|premium|subscription/.test(lower) && context === 'subscription') {
    return USER_FACING_ERRORS.subscription;
  }
  if (/403|forbidden/.test(lower)) return USER_FACING_ERRORS.forbidden;
  if (/document vault limit reached/i.test(lower)) {
    return 'Document Vault Limit Reached. Upgrade to Plus to unlock unlimited secure medical document storage.';
  }
  if (/pet limit reached/i.test(lower)) {
    return message;
  }
  if (/reminder limit reached/i.test(lower)) {
    return message;
  }
  if (/health record limit reached/i.test(lower)) {
    return message;
  }
  if (/document not found|that document/.test(lower)) return USER_FACING_ERRORS.documentNotFound;
  if (/404|not found/.test(lower)) return USER_FACING_ERRORS.notFound;
  if (/network|fetch failed|failed to fetch/.test(lower)) return USER_FACING_ERRORS.network;
  if (/invalid payment|payment signature|verification/.test(lower)) {
    return USER_FACING_ERRORS.paymentVerify;
  }
  if (/payment|razorpay|checkout/.test(lower) && context === 'payment') {
    return USER_FACING_ERRORS.payment;
  }
  if (/bucket|mime|file type|allowed_mime/.test(lower) && context === 'upload') {
    return USER_FACING_ERRORS.uploadType;
  }
  if (/size|too large|10\s*mb|10485760/.test(lower) && context === 'upload') {
    return USER_FACING_ERRORS.uploadSize;
  }
  if (
    /row-level security|check constraint|violates|sqlstate|supabase|npx|relation\s+"/i.test(
      message,
    )
  ) {
    return USER_FACING_ERRORS.server;
  }

  return defaultForContext(context);
}

export function isTechnicalError(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) return true;
  if (SAFE_MESSAGE_PATTERNS.some((re) => re.test(trimmed))) return false;
  return TECHNICAL_PATTERNS.some(({ pattern }) => pattern.test(trimmed));
}

/** Returns a safe string for UI - never leaks DB/schema/internal details. */
export function sanitizeUserFacingError(
  message: string | null | undefined,
  context: UserErrorContext = 'generic',
): string {
  const trimmed = (message ?? '').trim();
  if (!trimmed) return defaultForContext(context);
  if (!isTechnicalError(trimmed)) return trimmed;
  return mapTechnicalMessage(trimmed, context);
}

/** Extract and sanitize any thrown value for display in the UI. */
export function getUserFacingError(
  err: unknown,
  context: UserErrorContext = 'generic',
  fallback?: string,
): string {
  if (typeof err === 'string') {
    return sanitizeUserFacingError(err, context) || fallback || defaultForContext(context);
  }
  if (err instanceof Error) {
    return sanitizeUserFacingError(err.message, context) || fallback || defaultForContext(context);
  }
  return fallback ?? defaultForContext(context);
}

/** Throw an Error with a sanitized message (for service layers). */
export function throwUserFacingError(
  message: string,
  context: UserErrorContext = 'generic',
): never {
  throw new Error(sanitizeUserFacingError(message, context));
}
