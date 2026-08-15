import { getSupabaseClient } from '@/services/supabase/client';
import type {
  EmergencyCriticalFields,
  EmergencyPassportRecord,
  EmergencyPassportRow,
  PublicEmergencyPassport,
  PublicEmergencyTriage,
} from './emergencyPassportTypes';
import {
  generatePublicToken,
  mapEmergencyPassportRow,
  normalizeCriticalFields,
  toPublicEmergencyTriage,
} from './emergencyPassportTypes';

const SELECT = 'id, pet_id, public_token, critical_fields_json, updated_at, revoked_at';

export interface IEmergencyPassportService {
  getForPet(petId: string): Promise<EmergencyPassportRecord | null>;
  ensureForPet(
    petId: string,
    seedFields: EmergencyCriticalFields,
  ): Promise<EmergencyPassportRecord>;
  updateCriticalFields(
    petId: string,
    fields: EmergencyCriticalFields,
  ): Promise<EmergencyPassportRecord>;
  regenerateToken(petId: string): Promise<EmergencyPassportRecord>;
  revoke(petId: string): Promise<void>;
  getPublicByToken(token: string): Promise<PublicEmergencyPassport | null>;
  /** Triage-only public profile for QR tags (`/p/:publicId`). */
  getTriageByPublicId(publicId: string): Promise<PublicEmergencyTriage | null>;
}

export const supabaseEmergencyPassportService: IEmergencyPassportService = {
  async getForPet(petId) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('emergency_passports')
      .select(SELECT)
      .eq('pet_id', petId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return null;
    return mapEmergencyPassportRow(data as EmergencyPassportRow);
  },

  async ensureForPet(petId, seedFields) {
    const existing = await supabaseEmergencyPassportService.getForPet(petId);
    if (existing && !existing.revokedAt) return existing;

    const supabase = getSupabaseClient();
    const payload = {
      pet_id: petId,
      public_token: generatePublicToken(),
      critical_fields_json: normalizeCriticalFields(seedFields),
      revoked_at: null,
    };

    const { data, error } = await supabase
      .from('emergency_passports')
      .upsert(payload, { onConflict: 'pet_id' })
      .select(SELECT)
      .single();

    if (error) throw new Error(error.message);
    return mapEmergencyPassportRow(data as EmergencyPassportRow);
  },

  async updateCriticalFields(petId, fields) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('emergency_passports')
      .update({
        critical_fields_json: normalizeCriticalFields(fields),
        revoked_at: null,
      })
      .eq('pet_id', petId)
      .select(SELECT)
      .single();

    if (error) throw new Error(error.message);
    return mapEmergencyPassportRow(data as EmergencyPassportRow);
  },

  async regenerateToken(petId) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('emergency_passports')
      .update({
        public_token: generatePublicToken(),
        revoked_at: null,
      })
      .eq('pet_id', petId)
      .select(SELECT)
      .single();

    if (error) throw new Error(error.message);
    return mapEmergencyPassportRow(data as EmergencyPassportRow);
  },

  async revoke(petId) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('emergency_passports')
      .update({ revoked_at: new Date().toISOString() })
      .eq('pet_id', petId);

    if (error) throw new Error(error.message);
  },

  async getPublicByToken(token) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('get_emergency_passport_public', {
      p_token: token,
    });

    if (error) throw new Error(error.message);
    if (!data || typeof data !== 'object') return null;

    const payload = data as {
      petName?: string;
      species?: string;
      breed?: string;
      photoUrl?: string | null;
      criticalFields?: Partial<EmergencyCriticalFields>;
      updatedAt?: string;
    };

    return {
      petName: payload.petName ?? 'Pet',
      species: payload.species ?? '',
      breed: payload.breed ?? '',
      photoUrl: payload.photoUrl ?? null,
      criticalFields: normalizeCriticalFields(payload.criticalFields),
      updatedAt: payload.updatedAt ?? new Date().toISOString(),
    };
  },

  async getTriageByPublicId(publicId) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('get_emergency_triage_public', {
      p_token: publicId,
    });

    // Prefer the whitelisted RPC; fall back to strip-on-client if migration not applied yet.
    if (!error && data && typeof data === 'object') {
      const payload = data as Partial<PublicEmergencyTriage> & {
        severeAllergies?: unknown;
      };

      const allergies = Array.isArray(payload.severeAllergies)
        ? payload.severeAllergies.map((line) => String(line).trim()).filter(Boolean)
        : [];

      return {
        petName: payload.petName ?? 'Pet',
        species: payload.species ?? '',
        breed: payload.breed ?? '',
        photoUrl: payload.photoUrl ?? null,
        ownerPhonePrimary: payload.ownerPhonePrimary?.trim() || null,
        ownerPhoneSecondary: payload.ownerPhoneSecondary?.trim() || null,
        severeAllergies: allergies,
        rabiesTagNumber: payload.rabiesTagNumber?.trim() || null,
        vetName: payload.vetName?.trim() || null,
        vetPhone: payload.vetPhone?.trim() || null,
        updatedAt: payload.updatedAt ?? new Date().toISOString(),
      };
    }

    const legacy = await supabaseEmergencyPassportService.getPublicByToken(publicId);
    if (!legacy) return null;
    return toPublicEmergencyTriage(
      legacy.petName,
      legacy.species,
      legacy.breed,
      legacy.photoUrl,
      legacy.criticalFields,
      legacy.updatedAt,
    );
  },
};
