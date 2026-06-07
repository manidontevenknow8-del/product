const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LIMITS = {
  email: 254,
  name: 120,
  title: 200,
  notes: 2000,
  description: 4000,
  breed: 120,
  referralSource: 120,
  message: 5000,
} as const;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  return normalized.length > 0 && normalized.length <= LIMITS.email && EMAIL_RE.test(normalized);
}

export function trimTo(value: string | null | undefined, max: number): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

export function requireUuid(value: string | undefined, field: string): string {
  const v = value?.trim();
  if (!v || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)) {
    throw new Error(`Invalid ${field}`);
  }
  return v;
}
