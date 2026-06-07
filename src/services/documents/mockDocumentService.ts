import type { IDocumentService } from './documentTypes';
import { buildStoragePath, mapDocumentRow } from './documentMappers';
import type { PetDocumentRow } from './documentTypes';

const METADATA_KEY = 'petclues_pet_documents';
const BLOB_KEY = 'petclues_pet_document_blobs';

type BlobStore = Record<string, string>;

function loadMetadata(): PetDocumentRow[] {
  try {
    const raw = localStorage.getItem(METADATA_KEY);
    return raw ? (JSON.parse(raw) as PetDocumentRow[]) : [];
  } catch {
    return [];
  }
}

function saveMetadata(rows: PetDocumentRow[]) {
  localStorage.setItem(METADATA_KEY, JSON.stringify(rows));
}

function loadBlobs(): BlobStore {
  try {
    const raw = localStorage.getItem(BLOB_KEY);
    return raw ? (JSON.parse(raw) as BlobStore) : {};
  } catch {
    return {};
  }
}

function saveBlobs(blobs: BlobStore) {
  localStorage.setItem(BLOB_KEY, JSON.stringify(blobs));
}

function readFileWithProgress(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 90));
      }
    };
    reader.onload = () => {
      onProgress?.(100);
      resolve(reader.result as string);
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

export const mockDocumentService: IDocumentService = {
  async listByPet(_ownerId, petId) {
    return loadMetadata()
      .filter((row) => row.pet_id === petId)
      .sort((a, b) => b.uploaded_at.localeCompare(a.uploaded_at))
      .map(mapDocumentRow);
  },

  async upload(ownerId, petId, file, onProgress) {
    onProgress?.(5);
    const documentId = crypto.randomUUID();
    const storagePath = buildStoragePath(ownerId, petId, documentId, file.name);
    const now = new Date().toISOString();
    const normalizedType = file.type === 'image/jpg' ? 'image/jpeg' : file.type;

    const dataUrl = await readFileWithProgress(file, onProgress);

    const row: PetDocumentRow = {
      id: documentId,
      pet_id: petId,
      file_name: file.name,
      file_type: normalizedType,
      storage_path: storagePath,
      uploaded_at: now,
      created_at: now,
    };

    const rows = loadMetadata();
    rows.push(row);
    saveMetadata(rows);

    const blobs = loadBlobs();
    blobs[documentId] = dataUrl;
    saveBlobs(blobs);

    return mapDocumentRow(row);
  },

  async delete(_ownerId, documentId) {
    saveMetadata(loadMetadata().filter((row) => row.id !== documentId));
    const blobs = loadBlobs();
    delete blobs[documentId];
    saveBlobs(blobs);
  },

  async getDownloadUrl(_ownerId, documentId) {
    return loadBlobs()[documentId] ?? null;
  },
};
