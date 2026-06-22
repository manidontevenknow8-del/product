import type { CommercialPageConfig } from './types';
import { PET_HEALTH_RECORDS_PAGE } from './pages/petHealthRecords';
import { DIGITAL_PET_PASSPORT_PAGE } from './pages/digitalPetPassport';
import { PET_VACCINATION_RECORDS_PAGE } from './pages/petVaccinationRecords';
import { PET_MEDICAL_HISTORY_PAGE } from './pages/petMedicalHistory';
import { PET_HEALTH_TRACKER_PAGE } from './pages/petHealthTracker';
import { mergeCommercialOutboundLinks } from './outboundLinks';

function withOutboundLinks(page: CommercialPageConfig): CommercialPageConfig {
  return {
    ...page,
    relatedLinks: mergeCommercialOutboundLinks(page.path, page.relatedLinks),
  };
}

const RAW_PAGES: CommercialPageConfig[] = [
  PET_HEALTH_RECORDS_PAGE,
  DIGITAL_PET_PASSPORT_PAGE,
  PET_VACCINATION_RECORDS_PAGE,
  PET_MEDICAL_HISTORY_PAGE,
  PET_HEALTH_TRACKER_PAGE,
];

export const COMMERCIAL_PAGES: CommercialPageConfig[] = RAW_PAGES.map(withOutboundLinks);

const BY_PATH = new Map(COMMERCIAL_PAGES.map((page) => [page.path, page]));

export function listCommercialPages(): CommercialPageConfig[] {
  return COMMERCIAL_PAGES;
}

export function getCommercialPageByPath(pathname: string): CommercialPageConfig | null {
  return BY_PATH.get(pathname) ?? null;
}

export function isCommercialPath(pathname: string): boolean {
  return BY_PATH.has(pathname);
}

export type { CommercialPageConfig } from './types';
