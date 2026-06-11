import { getSupabaseClient } from '@/services/supabase/client';
import { throwUserFacingError } from '@/utils/userFacingErrors';
import type { IDocumentService } from './documentTypes';
import { DOCUMENT_BUCKET } from './documentTypes';
import { buildStoragePath, mapDocumentRow } from './documentMappers';
import type { PetDocumentRow } from './documentTypes';

export const supabaseDocumentService: IDocumentService = {
  async listByPet(_ownerId, petId) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('pet_documents')
      .select('*')
      .eq('pet_id', petId)
      .order('uploaded_at', { ascending: false });

    if (error) throwUserFacingError(error.message, 'upload');
    return (data as PetDocumentRow[]).map(mapDocumentRow);
  },

  async upload(ownerId, petId, file, onProgress) {
    const supabase = getSupabaseClient();
    const documentId = crypto.randomUUID();
    const storagePath = buildStoragePath(ownerId, petId, documentId, file.name);
    const normalizedType = file.type === 'image/jpg' ? 'image/jpeg' : file.type;

    onProgress?.(10);

    const { error: uploadError } = await supabase.storage
      .from(DOCUMENT_BUCKET)
      .upload(storagePath, file, {
        contentType: normalizedType,
        upsert: false,
      });

    if (uploadError) throwUserFacingError(uploadError.message, 'upload');

    onProgress?.(70);

    const now = new Date().toISOString();
    const { data, error: insertError } = await supabase
      .from('pet_documents')
      .insert({
        id: documentId,
        pet_id: petId,
        file_name: file.name,
        file_type: normalizedType,
        storage_path: storagePath,
        uploaded_at: now,
      })
      .select('*')
      .single();

    if (insertError) {
      await supabase.storage.from(DOCUMENT_BUCKET).remove([storagePath]);
      throwUserFacingError(insertError.message, 'upload');
    }

    onProgress?.(100);
    return mapDocumentRow(data as PetDocumentRow);
  },

  async delete(_ownerId, documentId) {
    const supabase = getSupabaseClient();

    const { data: row, error: fetchError } = await supabase
      .from('pet_documents')
      .select('storage_path')
      .eq('id', documentId)
      .single();

    if (fetchError) throwUserFacingError(fetchError.message, 'upload');

    const { error: deleteRowError } = await supabase
      .from('pet_documents')
      .delete()
      .eq('id', documentId);

    if (deleteRowError) throwUserFacingError(deleteRowError.message, 'upload');

    const { error: deleteFileError } = await supabase.storage
      .from(DOCUMENT_BUCKET)
      .remove([(row as { storage_path: string }).storage_path]);

    if (deleteFileError) throwUserFacingError(deleteFileError.message, 'upload');
  },

  async getDownloadUrl(_ownerId, documentId) {
    const supabase = getSupabaseClient();

    const { data: row, error: fetchError } = await supabase
      .from('pet_documents')
      .select('storage_path')
      .eq('id', documentId)
      .single();

    if (fetchError) throwUserFacingError(fetchError.message, 'upload');

    const { data, error } = await supabase.storage
      .from(DOCUMENT_BUCKET)
      .createSignedUrl((row as { storage_path: string }).storage_path, 3600);

    if (error) throwUserFacingError(error.message, 'upload');
    return data.signedUrl;
  },
};
