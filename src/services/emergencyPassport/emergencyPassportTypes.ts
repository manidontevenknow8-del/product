export type EmergencyCriticalFields = {
  allergies: string[];
  medications: string[];
  vetName: string | null;
  vetPhone: string | null;
  insuranceProvider: string | null;
  insurancePolicyNumber: string | null;
  microchipId: string | null;
  /** Primary guardian click-to-call number for QR triage tags */
  ownerPhonePrimary: string | null;
  /** Secondary guardian / backup contact */
  ownerPhoneSecondary: string | null;
  /** Rabies tag / certificate number for ER handoff */
  rabiesTagNumber: string | null;
};

/**
 * Whitelisted public triage payload for `/p/:publicId`.
 * Intentionally excludes insurance, medications, vault docs, billing, and private notes.
 */
export type PublicEmergencyTriage = {
  petName: string;
  species: string;
  breed: string;
  photoUrl: string | null;
  ownerPhonePrimary: string | null;
  ownerPhoneSecondary: string | null;
  severeAllergies: string[];
  rabiesTagNumber: string | null;
  vetName: string | null;
  vetPhone: string | null;
  updatedAt: string;
};

export type EmergencyPassportRecord = {
  id: string;
  petId: string;
  publicToken: string;
  criticalFields: EmergencyCriticalFields;
  updatedAt: string;
  revokedAt: string | null;
};

export type PublicEmergencyPassport = {
  petName: string;
  species: string;
  breed: string;
  photoUrl: string | null;
  criticalFields: EmergencyCriticalFields;
  updatedAt: string;
};

export type EmergencyPassportRow = {
  id: string;
  pet_id: string;
  public_token: string;
  critical_fields_json: EmergencyCriticalFields;
  updated_at: string;
  revoked_at: string | null;
};

export type HouseholdRole = 'owner' | 'editor' | 'viewer';

export const EMPTY_CRITICAL_FIELDS: EmergencyCriticalFields = {
  allergies: [],
  medications: [],
  vetName: null,
  vetPhone: null,
  insuranceProvider: null,
  insurancePolicyNumber: null,
  microchipId: null,
  ownerPhonePrimary: null,
  ownerPhoneSecondary: null,
  rabiesTagNumber: null,
};

export function mapEmergencyPassportRow(row: EmergencyPassportRow): EmergencyPassportRecord {
  return {
    id: row.id,
    petId: row.pet_id,
    publicToken: row.public_token,
    criticalFields: {
      ...EMPTY_CRITICAL_FIELDS,
      ...row.critical_fields_json,
    },
    updatedAt: row.updated_at,
    revokedAt: row.revoked_at,
  };
}

export function normalizeCriticalFields(
  value: Partial<EmergencyCriticalFields> | null | undefined,
): EmergencyCriticalFields {
  return {
    allergies: (value?.allergies ?? []).map((line) => line.trim()).filter(Boolean),
    medications: (value?.medications ?? []).map((line) => line.trim()).filter(Boolean),
    vetName: value?.vetName?.trim() || null,
    vetPhone: value?.vetPhone?.trim() || null,
    insuranceProvider: value?.insuranceProvider?.trim() || null,
    insurancePolicyNumber: value?.insurancePolicyNumber?.trim() || null,
    microchipId: value?.microchipId?.trim() || null,
    ownerPhonePrimary: value?.ownerPhonePrimary?.trim() || null,
    ownerPhoneSecondary: value?.ownerPhoneSecondary?.trim() || null,
    rabiesTagNumber: value?.rabiesTagNumber?.trim() || null,
  };
}

/** Strip sensitive fields for the public QR triage surface. */
export function toPublicEmergencyTriage(
  petName: string,
  species: string,
  breed: string,
  photoUrl: string | null,
  fields: EmergencyCriticalFields,
  updatedAt: string,
): PublicEmergencyTriage {
  return {
    petName,
    species,
    breed,
    photoUrl,
    ownerPhonePrimary: fields.ownerPhonePrimary,
    ownerPhoneSecondary: fields.ownerPhoneSecondary,
    severeAllergies: fields.allergies,
    rabiesTagNumber: fields.rabiesTagNumber,
    vetName: fields.vetName,
    vetPhone: fields.vetPhone,
    updatedAt,
  };
}

export function generatePublicToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function resolveAppOrigin(): string {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : (import.meta.env.VITE_APP_URL as string | undefined) ?? '';
  return origin.replace(/\/$/, '');
}

export function buildPublicEmergencyUrl(token: string): string {
  const base = resolveAppOrigin();
  return base ? `${base}/e/${token}` : `/e/${token}`;
}

/** QR collar / crate / wallet tags resolve to the triage-only public profile. */
export function buildPublicTriageUrl(publicId: string): string {
  const base = resolveAppOrigin();
  return base ? `${base}/p/${publicId}` : `/p/${publicId}`;
}
