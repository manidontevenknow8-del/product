import { useEffect, useMemo, useState } from 'react';
import type { HealthRecord } from '@/services/healthRecords/healthRecordTypes';
import type { PetRecord } from '@/services/pets/petTypes';
import { buildCriticalFieldsFromSources } from '@/services/emergencyPassport/buildCriticalFields';
import {
  getEmergencyPassportService,
  type IEmergencyPassportService,
} from '@/services/emergencyPassport/emergencyPassportService';
import type {
  EmergencyCriticalFields,
  EmergencyPassportRecord,
  HouseholdRole,
} from '@/services/emergencyPassport/emergencyPassportTypes';
import {
  canEditHouseholdPet,
  getHouseholdRoleForPet,
} from '@/services/household/householdService';

type UseEmergencyPassportResult = {
  passport: EmergencyPassportRecord | null;
  householdRole: HouseholdRole | null;
  canEdit: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  saveCriticalFields: (fields: EmergencyCriticalFields) => Promise<EmergencyPassportRecord>;
  regenerateToken: () => Promise<EmergencyPassportRecord>;
  revokeLink: () => Promise<void>;
  syncFromRecords: () => Promise<EmergencyPassportRecord>;
  ensureLink: () => Promise<EmergencyPassportRecord>;
};

export function useEmergencyPassport(
  pet: PetRecord | null,
  records: HealthRecord[],
  service: IEmergencyPassportService = getEmergencyPassportService(),
): UseEmergencyPassportResult {
  const [passport, setPassport] = useState<EmergencyPassportRecord | null>(null);
  const [householdRole, setHouseholdRole] = useState<HouseholdRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const petRecords = useMemo(
    () => (pet ? records.filter((record) => record.petId === pet.id) : []),
    [pet, records],
  );

  const refresh = async () => {
    if (!pet) {
      setPassport(null);
      setHouseholdRole(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const role = await getHouseholdRoleForPet(pet.id).catch(() => null);
      setHouseholdRole(role);

      const existing = await service.getForPet(pet.id);
      if (existing && !existing.revokedAt) {
        setPassport(existing);
        return;
      }

      if (canEditHouseholdPet(role)) {
        const seeded = buildCriticalFieldsFromSources(pet, petRecords);
        const created = await service.ensureForPet(pet.id, seeded);
        setPassport(created);
      } else {
        setPassport(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load emergency passport.');
      setPassport(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, [pet?.id, petRecords.length]);

  const saveCriticalFields = async (fields: EmergencyCriticalFields) => {
    if (!pet) throw new Error('No active pet.');
    const saved = await service.updateCriticalFields(pet.id, fields);
    setPassport(saved);
    return saved;
  };

  const regenerateToken = async () => {
    if (!pet) throw new Error('No active pet.');
    const next = await service.regenerateToken(pet.id);
    setPassport(next);
    return next;
  };

  const revokeLink = async () => {
    if (!pet) throw new Error('No active pet.');
    await service.revoke(pet.id);
    setPassport(null);
  };

  const syncFromRecords = async () => {
    if (!pet) throw new Error('No active pet.');
    const merged = buildCriticalFieldsFromSources(
      pet,
      petRecords,
      passport?.criticalFields,
    );
    return saveCriticalFields(merged);
  };

  const ensureLink = async () => {
    if (!pet) throw new Error('No active pet.');
    const seeded = buildCriticalFieldsFromSources(
      pet,
      petRecords,
      passport?.criticalFields,
    );
    const created = await service.ensureForPet(pet.id, seeded);
    setPassport(created);
    return created;
  };

  return {
    passport,
    householdRole,
    canEdit: canEditHouseholdPet(householdRole),
    isLoading,
    error,
    refresh,
    saveCriticalFields,
    regenerateToken,
    revokeLink,
    syncFromRecords,
    ensureLink,
  };
}
