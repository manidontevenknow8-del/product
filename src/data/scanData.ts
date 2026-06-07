import type {
  RecentScanItem,
  ScanExtraction,
  SupportedDocumentType,
} from '@/types/scan';

export const mockRecentScans: RecentScanItem[] = [
  {
    id: '1',
    fileName: 'vaccination_certificate.pdf',
    uploadDate: 'May 28, 2026',
    documentType: 'Vaccine card',
  },
  {
    id: '2',
    fileName: 'wellness_report_may.pdf',
    uploadDate: 'May 15, 2026',
    documentType: 'Medical report',
  },
  {
    id: '3',
    fileName: 'clinic_invoice.pdf',
    uploadDate: 'May 1, 2026',
    documentType: 'Vet bill',
  },
];

export const mockScanExtraction: Omit<ScanExtraction, 'fileName'> = {
  documentType: 'Vaccination record',
  extractedDates: [
    { label: 'Date administered', value: 'March 12, 2026' },
    { label: 'Next due', value: 'March 12, 2027' },
    { label: 'Document date', value: 'March 14, 2026' },
  ],
  reminders: [
    { title: 'Rabies booster due', dueLabel: 'In 9 months' },
    { title: 'Annual wellness check', dueLabel: 'Recommended Jun 2026' },
  ],
  summary:
    'Rabies and DHPP vaccinations administered at Westside Veterinary Clinic. Luna is current on core vaccines. Next rabies booster scheduled for March 2027.',
};

export const supportedDocumentTypes: SupportedDocumentType[] = [
  {
    id: 'bill',
    label: 'Vet bills',
    description: 'Invoices and payment receipts from clinics',
  },
  {
    id: 'vaccine',
    label: 'Vaccine cards',
    description: 'Vaccination certificates and immunization records',
  },
  {
    id: 'prescription',
    label: 'Prescriptions',
    description: 'Medication orders and pharmacy documents',
  },
  {
    id: 'report',
    label: 'Medical reports',
    description: 'Lab results, wellness checks, and diagnostic reports',
  },
  {
    id: 'insurance',
    label: 'Pet insurance',
    description: 'Policy documents and claim forms',
  },
  {
    id: 'medication',
    label: 'Medication labels',
    description: 'Package inserts and dosage instructions',
  },
];

export function buildExtractionFromFile(fileName: string): ScanExtraction {
  return {
    fileName,
    ...mockScanExtraction,
  };
}
