import type { EmergencyGuidePageRecord } from '@content-types/emergency';
import batch01 from '@content-data/generated/emergencies/batch-01.json';
import batch02 from '@content-data/generated/emergencies/batch-02.json';
import batch03 from '@content-data/generated/emergencies/batch-03.json';
import batch04 from '@content-data/generated/emergencies/batch-04.json';
import batch05 from '@content-data/generated/emergencies/batch-05.json';
import batch06 from '@content-data/generated/emergencies/batch-06.json';
import batch07 from '@content-data/generated/emergencies/batch-07.json';

const batches: EmergencyGuidePageRecord[][] = [
  batch01 as EmergencyGuidePageRecord[],
  batch02 as EmergencyGuidePageRecord[],
  batch03 as EmergencyGuidePageRecord[],
  batch04 as EmergencyGuidePageRecord[],
  batch05 as EmergencyGuidePageRecord[],
  batch06 as EmergencyGuidePageRecord[],
  batch07 as EmergencyGuidePageRecord[],
];

export const emergencyGuidePages: EmergencyGuidePageRecord[] = batches.flat();

export function getEmergencyGuidePageBySlug(slug: string): EmergencyGuidePageRecord | undefined {
  return emergencyGuidePages.find((p) => p.slug === slug);
}

export function listEmergencyGuidePaths(): string[] {
  return emergencyGuidePages.map((p) => `/emergency/${p.slug}`);
}

export function listEmergencyGuidePagesForCore(
  coreSlug: string,
  excludeSlug?: string,
): EmergencyGuidePageRecord[] {
  return emergencyGuidePages.filter(
    (p) => p.core_slug === coreSlug && p.slug !== excludeSlug,
  );
}
