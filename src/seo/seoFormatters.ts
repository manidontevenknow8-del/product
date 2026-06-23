/** Consistent page title suffix for all indexable routes. */
export const BRAND_SUFFIX = 'PetClues';

const META_DESC_MIN = 140;
const META_DESC_MAX = 160;

const BRAND_SUFFIX_RE = /\s*(\||-)\s*PetClues(\s+\w+)?\s*$/i;

/**
 * Build a unique page title: "{Page headline} | PetClues"
 * Strips any existing brand suffix before re-appending.
 */
export function formatPageTitle(pageTitle: string): string {
  const trimmed = pageTitle.trim();
  if (/\|\s*PetClues\s*$/i.test(trimmed)) return trimmed;
  if (/-\s*PetClues\s*$/i.test(trimmed)) {
    return trimmed.replace(/-\s*PetClues\s*$/i, ` | ${BRAND_SUFFIX}`);
  }

  const cleaned = trimmed.replace(BRAND_SUFFIX_RE, '').trim();
  const full = `${cleaned} | ${BRAND_SUFFIX}`;
  if (full.length <= 60) return full;

  const maxHeadline = Math.max(20, 60 - ` | ${BRAND_SUFFIX}`.length - 1);
  return `${cleaned.slice(0, maxHeadline).trim()}… | ${BRAND_SUFFIX}`;
}

/**
 * Normalize meta descriptions to 140-160 characters for SERP snippets.
 */
export function formatMetaDescription(text: string, contextHint = ''): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return formatMetaDescription(
      contextHint ||
        'Organize pet health records, vaccination reminders, emergency passports, and daily care in one calm app.',
      '',
    );
  }

  if (normalized.length >= META_DESC_MIN && normalized.length <= META_DESC_MAX) {
    return normalized;
  }

  if (normalized.length > META_DESC_MAX) {
    const slice = normalized.slice(0, META_DESC_MAX - 1);
    const lastSpace = slice.lastIndexOf(' ');
    const cut = lastSpace > META_DESC_MIN ? slice.slice(0, lastSpace) : slice;
    return cut.endsWith('.') ? cut : `${cut}.`;
  }

  let expanded = normalized;
  if (!expanded.endsWith('.')) expanded += '.';

  if (expanded.length < META_DESC_MIN) {
    const tail =
      ' Organize pet health records, vaccination reminders, emergency passports, and daily care with PetClues.';
    const hint = contextHint.replace(BRAND_SUFFIX_RE, '').trim();
    expanded += hint && !expanded.toLowerCase().includes(hint.toLowerCase().slice(0, 16))
      ? ` ${hint}.`
      : tail;
  }

  if (expanded.length > META_DESC_MAX) {
    const slice = expanded.slice(0, META_DESC_MAX - 1);
    const lastSpace = slice.lastIndexOf(' ');
    const cut = lastSpace > META_DESC_MIN ? slice.slice(0, lastSpace) : slice;
    return cut.endsWith('.') ? cut : `${cut}.`;
  }

  if (expanded.length < META_DESC_MIN) {
    expanded = `${expanded} Trusted by pet parents for everyday care organization.`.slice(0, META_DESC_MAX);
  }

  return expanded.slice(0, META_DESC_MAX);
}

export function isMetaDescriptionValid(text: string): boolean {
  const len = text.trim().length;
  return len >= META_DESC_MIN && len <= META_DESC_MAX;
}
