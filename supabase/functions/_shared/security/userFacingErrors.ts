/** Safe user-facing errors for edge function JSON responses (no DB/schema leaks). */

const GENERIC = 'Something went wrong. Please try again in a moment.';
const SERVER = 'Our servers are having trouble. Please try again in a few minutes.';
const DECODE = 'We could not read this document right now. Please try again later.';
const RATE_LIMIT = 'Too many requests. Please wait a moment and try again.';
const PREMIUM = 'Vet Bill Decoder is a Premium feature. Upgrade to unlock it.';
const NOT_FOUND = 'That document could not be found. Try uploading it again.';
const AUTH = 'Please sign in to continue.';

const SAFE = [
  /^please sign in/i,
  /^document not found/i,
  /^that document could not/i,
  /^documentid and petid/i,
  /^vet bill decoder is a premium/i,
  /^too many/i,
  /^something went wrong/i,
  /^we could not/i,
];

const TECHNICAL =
  /row-level security|check constraint|violates|sqlstate|supabase|npx|vet_bill_extractions|pet_documents|relation\s+"|unknown error|bucket not found/i;

export function sanitizeEdgeUserError(message: string, context: 'decode' | 'generic' = 'generic'): string {
  const trimmed = message.trim();
  if (!trimmed) return context === 'decode' ? DECODE : GENERIC;
  if (SAFE.some((re) => re.test(trimmed))) return trimmed;
  if (/429|rate.?limit/i.test(trimmed)) return RATE_LIMIT;
  if (/401|unauthorized/i.test(trimmed)) return AUTH;
  if (/403|premium|subscription/i.test(trimmed) && context === 'decode') return PREMIUM;
  if (/document not found/i.test(trimmed)) return NOT_FOUND;
  if (TECHNICAL.test(trimmed)) return context === 'decode' ? DECODE : SERVER;
  if (context === 'decode') return DECODE;
  return GENERIC;
}
