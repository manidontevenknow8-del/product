import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { usePets } from '@/pets';
import { useHealthRecords } from '@/healthRecords';
import { useDocuments } from '@/documents';
import { useReminders } from '@/reminders';
import { computePetCareScoreFromSources } from '@/services/petCareScore/petCareScoreEngine';
import type { PetCareScoreData } from '@/types/petCareScore';

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
  const { activePet, isLoading: petsLoading, error: petsError, refreshPets } = usePets();
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const { records, isLoading: healthLoading, refreshRecords } = useHealthRecords();
  const { documents, isLoading: docsLoading, refreshDocuments } = useDocuments();
  const { reminders, isLoading: remindersLoading, refresh: refreshReminders } = useReminders();

  const isLoading =
    petsLoading || healthLoading || docsLoading || remindersLoading;

  const petReminders = useMemo(
    () => (activePet ? reminders.filter((r) => r.petId === activePet.id) : []),
    [reminders, activePet],
  );

  const data = useMemo(() => {
    if (!isAuthenticated || !activePet) return null;
    return computePetCareScoreFromSources({
      pet: activePet,
      healthRecords: records,
      documents,
      reminders: petReminders,
    });
  }, [isAuthenticated, activePet, records, documents, petReminders]);

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
    } catch (err) {
      setRefreshError(
        err instanceof Error ? err.message : 'Failed to load PetCare Score data',
      );
    }
  }, [refreshPets, refreshRecords, refreshDocuments, refreshReminders]);

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
