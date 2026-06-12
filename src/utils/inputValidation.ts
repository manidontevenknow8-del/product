/** Shared input limits - keep in sync with supabase/functions/_shared/security/validation.ts */

export const INPUT_LIMITS = {
  email: 254,
  name: 120,
  title: 200,
  notes: 2000,
  description: 4000,
  breed: 120,
  message: 5000,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string): string | null {
  const normalized = normalizeEmail(email);
  if (!normalized || normalized.length > INPUT_LIMITS.email) {
    return 'Enter a valid email address.';
  }
  if (!EMAIL_RE.test(normalized)) return 'Enter a valid email address.';
  return null;
}

export function trimField(value: string | null | undefined, max: number): string {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return '';
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

export function validateRequiredText(
  value: string,
  fieldLabel: string,
  max: number,
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return `${fieldLabel} is required.`;
  if (trimmed.length > max) {
    return `${fieldLabel} must be ${max} characters or fewer.`;
  }
  return null;
}

export function validateOptionalText(value: string | null | undefined, max: number): string {
  return trimField(value, max);
}
