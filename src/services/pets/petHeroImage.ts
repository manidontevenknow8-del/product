import { PAGE_IMG } from '@/data/pageImages';
import { normalizePhotoUrlFromDb } from './petPhotoService';

export type PetHeroBackground = {
  src: string;
  isPetPhoto: boolean;
};

/** Hero background: active pet photo when available, otherwise the editorial fallback. */
export function resolvePetHeroBackground(photoUrl?: string | null): PetHeroBackground {
  const petPhoto = normalizePhotoUrlFromDb(photoUrl);
  return {
    src: petPhoto ?? PAGE_IMG.app.hero,
    isPetPhoto: Boolean(petPhoto),
  };
}

/** @deprecated Use resolvePetHeroBackground */
export function petHeroBackgroundUrl(photoUrl?: string | null): string {
  return resolvePetHeroBackground(photoUrl).src;
}
