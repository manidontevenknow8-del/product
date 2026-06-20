/**
 * Normalize dates for Schema.org JSON-LD.
 * Google Q&A requires datePublished with timezone (ISO 8601); date-only values trigger GSC warnings.
 */
const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATETIME_NO_TZ =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?$/;
const ISO_DATETIME_WITH_TZ =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

export const SCHEMA_DATETIME_FALLBACK = '2026-06-18T00:00:00Z';

export function normalizeSchemaDateTime(value?: string | null): string {
  if (!value?.trim()) return SCHEMA_DATETIME_FALLBACK;

  const trimmed = value.trim();

  if (ISO_DATE_ONLY.test(trimmed)) {
    return `${trimmed}T00:00:00Z`;
  }

  if (ISO_DATETIME_NO_TZ.test(trimmed)) {
    return `${trimmed}Z`;
  }

  if (ISO_DATETIME_WITH_TZ.test(trimmed)) {
    return trimmed.endsWith('z') ? trimmed.replace(/z$/, 'Z') : trimmed;
  }

  const parsed = Date.parse(trimmed);
  if (!Number.isNaN(parsed)) {
    return new Date(parsed).toISOString();
  }

  return SCHEMA_DATETIME_FALLBACK;
}

/** True when value is safe for Schema.org datePublished / dateModified. */
export function isValidSchemaDateTime(value: string): boolean {
  return ISO_DATETIME_WITH_TZ.test(value);
}
