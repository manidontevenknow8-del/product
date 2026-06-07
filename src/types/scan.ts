export type RecentScanItem = {
  id: string;
  fileName: string;
  uploadDate: string;
  documentType: string;
};

export type ScanExtraction = {
  fileName: string;
  documentType: string;
  extractedDates: { label: string; value: string }[];
  reminders: { title: string; dueLabel: string }[];
  summary: string;
};

export type SupportedDocumentType = {
  id: string;
  label: string;
  description: string;
};
