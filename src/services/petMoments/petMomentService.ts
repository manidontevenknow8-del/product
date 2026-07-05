import { isSupabaseConfigured } from '@/services/supabase/config';
import type { IPetMomentService } from './petMomentTypes';
import { mockPetMomentService } from './mockPetMomentService';
import { supabasePetMomentService } from './supabasePetMomentService';

export function getPetMomentService(): IPetMomentService {
  return isSupabaseConfigured() ? supabasePetMomentService : mockPetMomentService;
}

export type {
  CreatePetMomentInput,
  IPetMomentService,
  PetMoment,
  PetMomentType,
} from './petMomentTypes';
