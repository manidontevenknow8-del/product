export type ExtractionConfidence = 'high' | 'medium' | 'low';

export type VetBillDetailedReport = {
  overview: string;
  visitContext: string;
  financialSummary?: string;
  clinicalNarrative: string;
  keyFindings: string[];
  careRecommendations: string[];
  watchFor?: string[];
  dataQualityNotes: string;
};

type ExtractedItemBase = {
  id: string;
  title: string;
  description: string;
  explanation?: string;
  sourceExcerpt?: string;
  ownerAction?: string;
  confidence: ExtractionConfidence;
  approved: boolean;
};

export type ExtractedVaccination = ExtractedItemBase & {
  dateRecorded?: string;
  nextDueDate?: string;
};

export type ExtractedMedication = ExtractedItemBase & {
  dateRecorded?: string;
  endDate?: string;
};

export type ExtractedDiagnosis = ExtractedItemBase & {
  dateRecorded?: string;
};

export type ExtractedFollowUp = ExtractedItemBase & {
  followUpDate: string;
};

export type ExtractedReminder = ExtractedItemBase & {
  dueDate: string;
  category?: string;
};

export type VetBillExtractionResult = {
  documentSummary: string;
  documentTypeGuess: string;
  detailedReport?: VetBillDetailedReport;
  vaccinations: ExtractedVaccination[];
  medications: ExtractedMedication[];
  diagnoses: ExtractedDiagnosis[];
  followUpDates: ExtractedFollowUp[];
  reminderDates: ExtractedReminder[];
};

export function resolveDetailedReport(result: VetBillExtractionResult): VetBillDetailedReport {
  if (result.detailedReport?.overview) {
    return result.detailedReport;
  }

  return {
    overview: result.documentSummary || 'No detailed overview available for this extraction.',
    visitContext: 'Visit details were not captured in this older extraction.',
    clinicalNarrative: result.documentSummary || 'Review the original document for clinical details.',
    keyFindings: [],
    careRecommendations: [],
    watchFor: [],
    dataQualityNotes: 'This report was generated before detailed reporting was available.',
  };
}

export type VetBillExtractionStatus =
  | 'saved'
  | 'approved'
  | 'partially_approved'
  | 'rejected';

/** Legacy DB value — treated as saved in the app */
export type LegacyVetBillExtractionStatus = VetBillExtractionStatus | 'pending_review';

const KNOWN_STATUSES: VetBillExtractionStatus[] = [
  'saved',
  'approved',
  'partially_approved',
  'rejected',
];

export function normalizeExtractionStatus(status: string): VetBillExtractionStatus {
  if (status === 'pending_review') return 'saved';
  if (KNOWN_STATUSES.includes(status as VetBillExtractionStatus)) {
    return status as VetBillExtractionStatus;
  }
  return 'saved';
}

export function extractionStatusHeadline(status: string): { label: string; tone: string } {
  const normalized = normalizeExtractionStatus(status);
  const labels: Record<VetBillExtractionStatus, { label: string; tone: string }> = {
    saved: { label: 'Report saved', tone: 'saved' },
    approved: { label: 'On timeline', tone: 'success' },
    partially_approved: { label: 'Partially on timeline', tone: 'success' },
    rejected: { label: 'Report only', tone: 'muted' },
  };
  return labels[normalized];
}

export type VetBillExtractionRecord = {
  id: string;
  userId: string;
  petId: string;
  documentId: string;
  status: VetBillExtractionStatus;
  extractionResult: VetBillExtractionResult;
  approvedSnapshot: VetBillExtractionResult | null;
  modelUsed: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

export type ApplyExtractionResult = {
  healthRecordsCreated: number;
  remindersCreated: number;
};
