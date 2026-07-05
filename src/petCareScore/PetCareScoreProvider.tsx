import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { usePets } from '@/pets';
import { useHealthRecords } from '@/healthRecords';
import { useDocuments } from '@/documents';
import { useReminders } from '@/reminders';
import { useDailyCheckIn } from '@/dailyCheckIn';
import { computePetCareScoreFromSources } from '@/services/petCareScore/petCareScoreEngine';
import {
  appendScoreSnapshotIfNeeded,
  getScoreSnapshotsForPet,
} from '@/services/petCareScore/petCareScoreSnapshotService';
import type { PetCareScoreData } from '@/types/petCareScore';
import { getUserFacingError } from '@/utils/userFacingErrors';

type PetCareScoreContextValue = {
  data: PetCareScoreData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const PetCareScoreContext = createContext<PetCareScoreContextValue | null>(null);

type PetCareScoreProviderProps = {
  children: ReactNode;
};

export function PetCareScoreProvider({ children }: PetCareScoreProviderProps) {
  const { isAuthenticated } = useAuth();
  const { activePet, pets, isLoading: petsLoading, error: petsError, refreshPets } = usePets();
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [data, setData] = useState<PetCareScoreData | null>(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const { records, isLoading: healthLoading, refreshRecords } = useHealthRecords();
  const { documents, isLoading: docsLoading, refreshDocuments } = useDocuments();
  const { reminders, isLoading: remindersLoading, refresh: refreshReminders } = useReminders();
  const { checkIns } = useDailyCheckIn();

  const isLoading =
    petsLoading || healthLoading || docsLoading || remindersLoading || scoreLoading;

  const petReminders = useMemo(
    () => (activePet ? reminders.filter((r) => r.petId === activePet.id) : []),
    [reminders, activePet],
  );

  const petIds = useMemo(() => pets.map((pet) => pet.id), [pets]);

  const loadScore = useCallback(async () => {
    if (!isAuthenticated || !activePet) {
      setData(null);
      setScoreLoading(false);
      return;
    }

    setScoreLoading(true);
    try {
      let history = await getScoreSnapshotsForPet(activePet.id, {
        migratePetIds: petIds,
      });

      const result = computePetCareScoreFromSources(
        {
          pet: activePet,
          healthRecords: records,
          documents,
          reminders: petReminders,
          dailyCheckIns: checkIns,
        },
        history,
      );

      if (result.snapshotToPersist) {
        history = await appendScoreSnapshotIfNeeded(activePet.id, result.snapshotToPersist);
        const refreshed = computePetCareScoreFromSources(
          {
            pet: activePet,
            healthRecords: records,
            documents,
            reminders: petReminders,
            dailyCheckIns: checkIns,
          },
          history,
        );
        setData(refreshed.data);
      } else {
        setData(result.data);
      }
    } catch {
      setData(null);
    } finally {
      setScoreLoading(false);
    }
  }, [
    isAuthenticated,
    activePet,
    petIds,
    records,
    documents,
    petReminders,
    checkIns,
  ]);

  useEffect(() => {
    void loadScore();
  }, [loadScore]);

  const error = petsError ?? refreshError;

  const refresh = useCallback(async () => {
    setRefreshError(null);
    try {
      await Promise.all([
        refreshPets(),
        refreshRecords(),
        refreshDocuments(),
        refreshReminders(),
      ]);
      await loadScore();
    } catch (err) {
      setRefreshError(
        getUserFacingError(err, 'generic', 'Failed to load PetCare Score data'),
      );
    }
  }, [refreshPets, refreshRecords, refreshDocuments, refreshReminders, loadScore]);

  const value = useMemo(
    () => ({ data, isLoading, error, refresh }),
    [data, isLoading, error, refresh],
  );

  return (
    <PetCareScoreContext.Provider value={value}>{children}</PetCareScoreContext.Provider>
  );
}

export function usePetCareScore(): PetCareScoreContextValue {
  const ctx = useContext(PetCareScoreContext);
  if (!ctx) throw new Error('usePetCareScore must be used within PetCareScoreProvider');
  return ctx;
}
