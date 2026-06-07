export type PetDocumentRecord = {
  id: string;
  petId: string;
  fileName: string;
  fileType: string;
  storagePath: string;
  uploadedAt: string;
  createdAt: string;
};

export type UploadProgressCallback = (progress: number) => void;

export type PetDocumentRow = {
  id: string;
  pet_id: string;
  file_name: string;
  file_type: string;
  storage_path: string;
  uploaded_at: string;
  created_at: string;
};

export interface IDocumentService {
  listByPet(ownerId: string, petId: string): Promise<PetDocumentRecord[]>;
  upload(
    ownerId: string,
    petId: string,
    file: File,
    onProgress?: UploadProgressCallback,
  ): Promise<PetDocumentRecord>;
  delete(ownerId: string, documentId: string): Promise<void>;
  getDownloadUrl(ownerId: string, documentId: string): Promise<string | null>;
}

export const DOCUMENT_BUCKET = 'pet-documents';

export const ACCEPTED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
] as const;

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;
