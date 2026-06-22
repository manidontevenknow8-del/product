import { ROUTES } from '@/routes/paths';
import type { InferredBlogCluster } from './mappings';

export type CommercialLinkTarget = {
  href: string;
  label: string;
};

const CLUSTER_TO_COMMERCIAL: Record<InferredBlogCluster, CommercialLinkTarget> = {
  vaccinations: {
    href: ROUTES.PET_VACCINATION_RECORDS,
    label: 'Pet vaccination records',
  },
  'health-records': {
    href: ROUTES.PET_HEALTH_RECORDS,
    label: 'Pet health records',
  },
  'medical-history': {
    href: ROUTES.PET_MEDICAL_HISTORY,
    label: 'Pet medical history',
  },
  'pet-passports': {
    href: ROUTES.DIGITAL_PET_PASSPORT,
    label: 'Digital pet passport',
  },
  'pet-travel': {
    href: ROUTES.DIGITAL_PET_PASSPORT,
    label: 'Digital pet passport',
  },
  'medication-management': {
    href: ROUTES.PET_HEALTH_TRACKER,
    label: 'Pet health tracker',
  },
  'emergency-preparedness': {
    href: ROUTES.DIGITAL_PET_PASSPORT,
    label: 'Digital pet passport',
  },
  'pet-organization': {
    href: ROUTES.PET_HEALTH_RECORDS,
    label: 'Pet health records',
  },
  'breed-specific-care': {
    href: ROUTES.PET_HEALTH_RECORDS,
    label: 'Pet health records',
  },
  'senior-pet-care': {
    href: ROUTES.PET_MEDICAL_HISTORY,
    label: 'Pet medical history',
  },
  'new-pet-owner-guides': {
    href: ROUTES.PET_VACCINATION_RECORDS,
    label: 'Pet vaccination records',
  },
  'exotic-pets': {
    href: ROUTES.PET_HEALTH_RECORDS,
    label: 'Pet health records',
  },
};

export function commercialLinkForCluster(cluster: InferredBlogCluster): CommercialLinkTarget {
  return CLUSTER_TO_COMMERCIAL[cluster];
}

export const ALL_COMMERCIAL_LINKS: CommercialLinkTarget[] = [
  { href: ROUTES.PET_HEALTH_RECORDS, label: 'Pet health records' },
  { href: ROUTES.DIGITAL_PET_PASSPORT, label: 'Digital pet passport' },
  { href: ROUTES.PET_VACCINATION_RECORDS, label: 'Vaccination records' },
  { href: ROUTES.PET_MEDICAL_HISTORY, label: 'Medical history' },
  { href: ROUTES.PET_HEALTH_TRACKER, label: 'Health tracker' },
];
