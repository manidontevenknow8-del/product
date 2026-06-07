/** Public paths for scan page imagery */
export const SCAN_IMG = {
  hero: '/images/scan/scan-hero.png',
  docs: '/images/scan/scan-docs.png',
  report: '/images/scan/scan-report.png',
  docBill: '/images/scan/scan-doc-bill.png',
  docVaccine: '/images/scan/scan-doc-vaccine.png',
  docRx: '/images/scan/scan-doc-rx.png',
  docMedical: '/images/scan/scan-doc-medical.png',
  docInsurance: '/images/scan/scan-doc-insurance.png',
  docLabel: '/images/scan/scan-doc-label.png',
} as const;

/** Rotating thumbnails for saved report cards */
export const REPORT_THUMB_IMAGES = [
  '/images/scan/scan-thumb-1.png',
  '/images/scan/scan-thumb-2.png',
  '/images/scan/scan-thumb-3.png',
  '/images/scan/scan-thumb-4.png',
  '/images/scan/scan-thumb-5.png',
  '/images/scan/scan-thumb-6.png',
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
