import type { AnalyticsEvent } from '@/types/analytics';

const BLOCKED_KEY = /email|password|token|secret|phone|address|ssn|credit|card|api[_-]?key/i;

function looksLikeEmail(value: string): boolean {
  return value.includes('@') && value.includes('.');
}

/** Strip potentially sensitive fields before analytics adapters receive them. */
export function sanitizeEventProperties(
  properties?: AnalyticsEvent['properties'],
): AnalyticsEvent['properties'] | undefined {
  if (!properties) return undefined;

  const clean: NonNullable<AnalyticsEvent['properties']> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (BLOCKED_KEY.test(key)) continue;
    if (key === 'name' || key === 'petName' || key === 'fileName') continue;
    if (typeof value === 'string' && looksLikeEmail(value)) continue;
    clean[key] = value;
  }

  return Object.keys(clean).length > 0 ? clean : undefined;
}
