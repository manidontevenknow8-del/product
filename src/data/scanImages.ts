/** Public paths for scan page imagery */
export const SCAN_IMG = {
  hero: '/images/scan/scan-hero.webp',
  docs: '/images/scan/scan-docs.webp',
  report: '/images/scan/scan-report.webp',
  docBill: '/images/scan/scan-doc-bill.webp',
  docVaccine: '/images/scan/scan-doc-vaccine.webp',
  docRx: '/images/scan/scan-doc-rx.webp',
  docMedical: '/images/scan/scan-doc-medical.webp',
  docInsurance: '/images/scan/scan-doc-insurance.webp',
  docLabel: '/images/scan/scan-doc-label.webp',
} as const;

/** Rotating thumbnails for saved report cards */
export const REPORT_THUMB_IMAGES = [
  '/images/scan/scan-thumb-1.webp',
  '/images/scan/scan-thumb-2.webp',
  '/images/scan/scan-thumb-3.webp',
  '/images/scan/scan-thumb-4.webp',
  '/images/scan/scan-thumb-5.webp',
  '/images/scan/scan-thumb-6.webp',
  SCAN_IMG.report,
  SCAN_IMG.docs,
] as const;

export function reportThumbForRecord(recordId: string, listIndex = 0): string {
  let hash = listIndex;
  for (let i = 0; i < recordId.length; i++) {
    hash = (hash + recordId.charCodeAt(i)) % 997;
  }
  return REPORT_THUMB_IMAGES[hash % REPORT_THUMB_IMAGES.length];
}

export const SUPPORTED_DOC_IMAGES: Record<string, string> = {
  bill: SCAN_IMG.docBill,
  vaccine: SCAN_IMG.docVaccine,
  prescription: SCAN_IMG.docRx,
  report: SCAN_IMG.docMedical,
  insurance: SCAN_IMG.docInsurance,
  medication: SCAN_IMG.docLabel,
};
