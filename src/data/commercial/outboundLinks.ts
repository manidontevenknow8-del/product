import { ROUTES } from '@/routes/paths';
import type { CommercialRelatedLink } from './types';

/** Extra outbound links merged into each commercial page at registry time. */
export const COMMERCIAL_OUTBOUND_EXTRAS: Record<string, CommercialRelatedLink[]> = {
  [ROUTES.PET_HEALTH_RECORDS]: [
    { href: `${ROUTES.BLOG}/digital-pet-health-record-template-guide`, label: 'Digital health record template' },
    { href: `${ROUTES.BLOG}/pet-sitter-instructions-medical-emergency-info`, label: 'Sitter medical instructions' },
    { href: ROUTES.LEARN, label: 'PetClues Learn hub' },
    { href: ROUTES.GUIDES, label: 'Care guides & templates' },
    { href: ROUTES.COMPARE, label: 'Compare pet health tools' },
  ],
  [ROUTES.DIGITAL_PET_PASSPORT]: [
    { href: `${ROUTES.BLOG}/pet-sitter-instructions-medical-emergency-info`, label: 'Sitter emergency instructions' },
    { href: `${ROUTES.BLOG}/organize-pet-medical-records-online`, label: 'Organize medical records' },
    { href: ROUTES.GUIDES, label: 'Emergency checklists' },
    { href: ROUTES.LEARN, label: 'Learn hub' },
    { href: ROUTES.FOUNDING_MEMBERS, label: 'Founding members' },
  ],
  [ROUTES.PET_VACCINATION_RECORDS]: [
    { href: `${ROUTES.BLOG}/cat-vaccination-schedule-guide`, label: 'Cat vaccination schedule' },
    { href: `${ROUTES.BLOG}/heartworm-prevention-schedule-reminder-dogs`, label: 'Heartworm prevention schedule' },
    { href: ROUTES.GUIDES, label: 'Breed vaccination guides' },
    { href: ROUTES.LEARN, label: 'Learn hub' },
    { href: ROUTES.SIGNUP, label: 'Create free account' },
  ],
  [ROUTES.PET_MEDICAL_HISTORY]: [
    { href: `${ROUTES.BLOG}/digital-pet-health-record-template-guide`, label: 'Health record template guide' },
    { href: `${ROUTES.BLOG}/pet-medication-reminder-guide`, label: 'Medication reminder guide' },
    { href: ROUTES.BEST, label: 'Best pet health apps' },
    { href: ROUTES.GUIDES, label: 'Health record templates' },
    { href: ROUTES.FOUNDING_MEMBERS, label: 'Founding members' },
  ],
  [ROUTES.PET_HEALTH_TRACKER]: [
    { href: `${ROUTES.BLOG}/organize-pet-medical-records-online`, label: 'Organize pet medical records' },
    { href: `${ROUTES.BLOG}/best-pet-health-tracker-app-2026`, label: 'Health tracker comparison' },
    { href: ROUTES.LEARN, label: 'Learn hub' },
    { href: ROUTES.BLOG, label: 'Pet health blog' },
    { href: ROUTES.SIGNUP, label: 'Create free account' },
  ],
};

export function mergeCommercialOutboundLinks(
  path: string,
  relatedLinks: CommercialRelatedLink[],
): CommercialRelatedLink[] {
  const extras = COMMERCIAL_OUTBOUND_EXTRAS[path] ?? [];
  const seen = new Set<string>();
  const merged: CommercialRelatedLink[] = [];

  for (const link of [...relatedLinks, ...extras]) {
    if (seen.has(link.href)) continue;
    seen.add(link.href);
    merged.push(link);
  }

  return merged;
}
