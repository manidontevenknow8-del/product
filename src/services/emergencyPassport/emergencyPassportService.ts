import { isSupabaseConfigured } from '@/services/supabase/config';
import type {
  EmergencyCriticalFields,
} from './emergencyPassportTypes';
import {
  generatePublicToken,
  mapEmergencyPassportRow,
  normalizeCriticalFields,
} from './emergencyPassportTypes';
import type { IEmergencyPassportService } from './supabaseEmergencyPassportService';
import { supabaseEmergencyPassportService } from './supabaseEmergencyPassportService';

const STORAGE_KEY = 'petclues_emergency_passports';

type StoredPassport = {
  id: string;
  pet_id: string;
  public_token: string;
  critical_fields_json: EmergencyCriticalFields;
  updated_at: string;
  revoked_at: string | null;
};

function loadAll(): StoredPassport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredPassport[]) : [];
  } catch {
    return [];
  }
}

function saveAll(rows: StoredPassport[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export const mockEmergencyPassportService: IEmergencyPassportService = {
  async getForPet(petId) {
    const row = loadAll().find((entry) => entry.pet_id === petId) ?? null;
    return row ? mapEmergencyPassportRow(row) : null;
  },

  async ensureForPet(petId, seedFields) {
    const rows = loadAll();
    const index = rows.findIndex((entry) => entry.pet_id === petId);
    const now = new Date().toISOString();

    if (index >= 0 && !rows[index]!.revoked_at) {
      return mapEmergencyPassportRow(rows[index]!);
    }

    const created: StoredPassport = {
      id: crypto.randomUUID(),
      pet_id: petId,
      public_token: generatePublicToken(),
      critical_fields_json: normalizeCriticalFields(seedFields),
      updated_at: now,
      revoked_at: null,
    };

    if (index >= 0) {
      rows[index] = created;
    } else {
      rows.push(created);
    }

    saveAll(rows);
    return mapEmergencyPassportRow(created);
  },

  async updateCriticalFields(petId, fields) {
    const rows = loadAll();
    const index = rows.findIndex((entry) => entry.pet_id === petId);
    if (index < 0) throw new Error('Emergency passport not found.');

    rows[index] = {
      ...rows[index]!,
      critical_fields_json: normalizeCriticalFields(fields),
      updated_at: new Date().toISOString(),
      revoked_at: null,
    };
    saveAll(rows);
    return mapEmergencyPassportRow(rows[index]!);
  },

  async regenerateToken(petId) {
    const rows = loadAll();
    const index = rows.findIndex((entry) => entry.pet_id === petId);
    if (index < 0) throw new Error('Emergency passport not found.');

    rows[index] = {
      ...rows[index]!,
      public_token: generatePublicToken(),
      updated_at: new Date().toISOString(),
      revoked_at: null,
    };
    saveAll(rows);
    return mapEmergencyPassportRow(rows[index]!);
  },

  async revoke(petId) {
    const rows = loadAll();
    const index = rows.findIndex((entry) => entry.pet_id === petId);
    if (index < 0) return;
    rows[index] = {
      ...rows[index]!,
      revoked_at: new Date().toISOString(),
    };
    saveAll(rows);
  },

  async getPublicByToken(token) {
    const row = loadAll().find(
      (entry) => entry.public_token === token && !entry.revoked_at,
    );
    if (!row) return null;

    return {
      petName: 'Pet',
      species: '',
      breed: '',
      photoUrl: null,
      criticalFields: normalizeCriticalFields(row.critical_fields_json),
      updatedAt: row.updated_at,
    };
  },
};

export type { IEmergencyPassportService } from './supabaseEmergencyPassportService';

export function getEmergencyPassportService(): IEmergencyPassportService {
  return isSupabaseConfigured()
    ? supabaseEmergencyPassportService
    : mockEmergencyPassportService;
}
