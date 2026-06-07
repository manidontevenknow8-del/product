export type {
  VetBillExtractionRecord,
  VetBillExtractionResult,
  VetBillExtractionStatus,
  VetBillDetailedReport,
  ExtractedVaccination,
  ExtractedMedication,
  ExtractedDiagnosis,
  ExtractedFollowUp,
  ExtractedReminder,
  ApplyExtractionResult,
  ExtractionConfidence,
} from './vetBillDecoderTypes';
export {
  resolveDetailedReport,
  normalizeExtractionStatus,
  extractionStatusHeadline,
} from './vetBillDecoderTypes';
export {
  getVetBillDecoderService,
  isVetBillDecoderMockMode,
  applyApprovedExtraction,
  countApprovedItems,
  resolveReviewStatus,
  type IVetBillDecoderService,
} from './vetBillDecoderService';
