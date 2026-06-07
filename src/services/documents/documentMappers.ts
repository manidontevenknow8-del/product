import type { PetDocumentRecord, PetDocumentRow } from './documentTypes';

export function mapDocumentRow(row: PetDocumentRow): PetDocumentRecord {
  return {
    id: row.id,
    petId: row.pet_id,
    fileName: row.file_name,
    fileType: row.file_type,
    storagePath: row.storage_path,
    uploadedAt: row.uploaded_at,
    createdAt: row.created_at,
  };
}

export function buildStoragePath(
  ownerId: string,
  petId: string,
  documentId: string,
  fileName: string,
): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${ownerId}/${petId}/${documentId}/${safeName}`;
}

export function formatFileTypeLabel(fileType: string): string {
  if (fileType === 'application/pdf') return 'PDF';
  if (fileType === 'image/jpeg' || fileType === 'image/jpg') return 'JPEG';
  if (fileType === 'image/png') return 'PNG';
  return fileType.split('/').pop()?.toUpperCase() ?? 'File';
}

export function formatDocumentUploadDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function formatDocumentVaultDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function validateDocumentFile(file: File): string | null {
  const accepted = ['application/pdf', 'image/jpeg', 'image/png'];
  const normalizedType =
    file.type === 'image/jpg' ? 'image/jpeg' : file.type;

  if (!accepted.includes(normalizedType)) {
    return 'Only PDF, JPG, and PNG files are supported.';
  }

  if (file.size > 10 * 1024 * 1024) {
    return 'File must be 10 MB or smaller.';
  }

  return null;
}
