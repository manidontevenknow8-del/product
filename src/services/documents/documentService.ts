import { isSupabaseConfigured } from '@/services/supabase/config';
import { mockDocumentService } from './mockDocumentService';
import { supabaseDocumentService } from './supabaseDocumentService';

export type {
  IDocumentService,
  PetDocumentRecord,
  UploadProgressCallback,
} from './documentTypes';
export {
  DOCUMENT_BUCKET,
  ACCEPTED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
} from './documentTypes';
export { mockDocumentService } from './mockDocumentService';
export { supabaseDocumentService } from './supabaseDocumentService';
export {
  mapDocumentRow,
  buildStoragePath,
  formatFileTypeLabel,
  formatDocumentUploadDate,
  formatDocumentVaultDate,
  validateDocumentFile,
} from './documentMappers';

export function getDocumentService() {
  return isSupabaseConfigured() ? supabaseDocumentService : mockDocumentService;
}

export const documentService = getDocumentService();
