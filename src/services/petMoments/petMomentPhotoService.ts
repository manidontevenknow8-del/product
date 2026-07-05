import { getSupabaseClient } from '@/services/supabase/client';
import { isSupabaseConfigured } from '@/services/supabase/config';
import { isDataUrl } from '@/services/pets/petPhotoService';

function extensionForMime(mime: string): string {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/gif') return 'gif';
  return 'jpg';
}

function parseDataUrl(dataUrl: string): { mime: string; bytes: Uint8Array } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  try {
    const binary = atob(match[2]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return { mime: match[1], bytes };
  } catch {
    return null;
  }
}

export async function resolvePetMomentPhotoUrl(
  ownerId: string,
  petId: string,
  momentId: string,
  photo: string | null | undefined,
): Promise<string | null> {
  if (!photo?.trim()) return null;
  const trimmed = photo.trim();

  if (isDataUrl(trimmed)) {
    if (!isSupabaseConfigured()) return trimmed;

    const parsed = parseDataUrl(trimmed);
    if (!parsed) throw new Error('Invalid photo data.');

    const supabase = getSupabaseClient();
    const ext = extensionForMime(parsed.mime);
    const path = `${ownerId}/${petId}/moments/${momentId}.${ext}`;

    const { error } = await supabase.storage.from('pet-avatars').upload(path, parsed.bytes, {
      contentType: parsed.mime,
      upsert: true,
    });
    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from('pet-avatars').getPublicUrl(path);
    return data.publicUrl;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return null;
}
