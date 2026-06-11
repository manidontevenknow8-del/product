import { isSupabaseConfigured } from '@/services/supabase/config';
import { mockPetService } from './mockPetService';
import { supabasePetService } from './supabasePetService';
import type { IPetService } from './petTypes';

export type { IPetService, PetRecord, CreatePetInput, UpdatePetInput, EditPetForm, PetSpecies, PetGender } from './petTypes';
export { mockPetService } from './mockPetService';
export { supabasePetService } from './supabasePetService';
export { normalizePhotoUrlFromDb, resolvePetPhotoUrl } from './petPhotoService';
export {
  petRecordToPet,
  petRecordToPetProfile,
  petRecordToPassportMeta,
  petRecordToEditPetForm,
  editPetFormToUpdateInput,
  onboardingToCreatePetInput,
  formatPetAge,
  getAvatarInitials,
  petRecordToAgeProfile,
} from './petUtils';

export function getPetService(): IPetService {
  return isSupabaseConfigured() ? supabasePetService : mockPetService;
}

export const petService = getPetService();
