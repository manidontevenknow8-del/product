import { getSupabaseClient } from '@/services/supabase/client';
import { isSupabaseConfigured } from '@/services/supabase/config';

export const PET_AVATAR_BUCKET = 'pet-avatars';

export function isDataUrl(value: string): boolean {
  return value.trim().startsWith('data:');
}

/**
 * Returns a URL safe for <img src>. Rejects data URLs truncated by the legacy 2048-char DB cap.
 */
export function normalizePhotoUrlFromDb(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('data:')) {
    return trimmed.length > 2048 ? trimmed : null;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return null;
}

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

export async function uploadPetAvatar(
  ownerId: string,
  petId: string,
  dataUrl: string,
): Promise<string> {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) throw new Error('Invalid photo data.');

  const supabase = getSupabaseClient();
  const ext = extensionForMime(parsed.mime);
  const path = `${ownerId}/${petId}/avatar.${ext}`;

  const { error } = await supabase.storage.from(PET_AVATAR_BUCKET).upload(path, parsed.bytes, {
    contentType: parsed.mime,
    upsert: true,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(PET_AVATAR_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Upload data URLs to storage; pass through http(s); mock mode keeps data URLs. */
export async function resolvePetPhotoUrl(
  ownerId: string,
  petId: string,
  photo: string | null | undefined,
): Promise<string | null> {
  if (!photo?.trim()) return null;
  const trimmed = photo.trim();

  if (isDataUrl(trimmed)) {
    if (!isSupabaseConfigured()) return trimmed;
    return uploadPetAvatar(ownerId, petId, trimmed);
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return null;
}
