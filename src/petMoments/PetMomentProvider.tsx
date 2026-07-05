import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { eventTracker } from '@/analytics/EventTracker';
import { useAuth } from '@/auth/AuthProvider';
import { usePets } from '@/pets';
import {
  getPetMomentService,
  type CreatePetMomentInput,
  type IPetMomentService,
  type PetMoment,
} from '@/services/petMoments';

type PetMomentContextValue = {
  moments: PetMoment[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  createMoment: (input: Omit<CreatePetMomentInput, 'petId'>) => Promise<PetMoment>;
};

const PetMomentContext = createContext<PetMomentContextValue | null>(null);

type PetMomentProviderProps = {
  children: ReactNode;
  service?: IPetMomentService;
};

export function PetMomentProvider({
  children,
  service = getPetMomentService(),
}: PetMomentProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const { activePet } = usePets();
  const [moments, setMoments] = useState<PetMoment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user?.id || !activePet?.id) {
      setMoments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const list = await service.getMomentsByPet(user.id, activePet.id);
      setMoments(list);
    } catch {
      setMoments([]);
    } finally {
      setIsLoading(false);
    }
  }, [service, user?.id, activePet?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id && activePet?.id) {
      void refresh();
    } else {
      setMoments([]);
    }
  }, [isAuthenticated, user?.id, activePet?.id, refresh]);

  const createMoment = useCallback(
    async (input: Omit<CreatePetMomentInput, 'petId'>) => {
      if (!user?.id || !activePet?.id) {
        throw new Error('Sign in and select a pet to save a moment.');
      }

      const saved = await service.createMoment(user.id, {
        petId: activePet.id,
        ...input,
      });
      eventTracker.track('timeline_entry_created', {
        petId: activePet.id,
        source: 'manual_moment',
        hasPhoto: Boolean(input.photoUrl),
      });
      await refresh();
      return saved;
    },
    [user?.id, activePet?.id, service, refresh],
  );

  const value = useMemo(
    () => ({
      moments,
      isLoading,
      refresh,
      createMoment,
    }),
    [moments, isLoading, refresh, createMoment],
  );

  return <PetMomentContext.Provider value={value}>{children}</PetMomentContext.Provider>;
}

export function usePetMoments(): PetMomentContextValue {
  const context = useContext(PetMomentContext);
  if (!context) {
    throw new Error('usePetMoments must be used within PetMomentProvider');
  }
  return context;
}
