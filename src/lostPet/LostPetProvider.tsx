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
import {
  mockLostPetService,
  type ILostPetService,
} from '@/services/lostPet/lostPetService';
import { LOST_PET_EMERGENCY_CONTACTS } from '@/data/lostPetData';
import { getAvatarInitials } from '@/services/pets/petUtils';
import type {
  ActivateLostPetInput,
  LostPetCase,
  RecoveryStats,
  ReportSightingInput,
  Sighting,
} from '@/types/lostPet';
import { getRecoveryStats } from '@/utils/lostPetUtils';

type LostPetContextValue = {
  activeCase: LostPetCase | null;
  sightings: Sighting[];
  recoveryStats: RecoveryStats | null;
  emergencyContacts: typeof LOST_PET_EMERGENCY_CONTACTS;
  isLoading: boolean;
  isActive: boolean;
  activate: (input: ActivateLostPetInput) => Promise<void>;
  resolve: () => Promise<void>;
  reportSighting: (input: ReportSightingInput) => Promise<void>;
  markSightingReviewed: (sightingId: string) => Promise<void>;
  refresh: () => Promise<void>;
  getCaseById: (caseId: string) => Promise<LostPetCase | null>;
};

const LostPetContext = createContext<LostPetContextValue | null>(null);

type LostPetProviderProps = {
  children: ReactNode;
  lostPetService?: ILostPetService;
};

export function LostPetProvider({
  children,
  lostPetService = mockLostPetService,
}: LostPetProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const { activePet } = usePets();
  const [activeCase, setActiveCase] = useState<LostPetCase | null>(null);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user?.id || !activePet?.id) {
      setActiveCase(null);
      setSightings([]);
      return;
    }
    setIsLoading(true);
    const active = await lostPetService.getActiveCase(user.id, activePet.id);
    setActiveCase(active);
    if (active) {
      const list = await lostPetService.getSightings(active.id);
      setSightings(list);
    } else {
      setSightings([]);
    }
    setIsLoading(false);
  }, [user?.id, activePet?.id, lostPetService]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      refresh();
    } else {
      setActiveCase(null);
      setSightings([]);
    }
  }, [isAuthenticated, user?.id, refresh]);

  const activate = useCallback(
    async (input: ActivateLostPetInput) => {
      if (!user?.id || !activePet?.id) throw new Error('No active pet');
      await lostPetService.activate(user.id, activePet.id, {
        ...input,
        petName: activePet.name,
        breed: activePet.breed ?? 'Breed not set',
        avatarInitials: getAvatarInitials(activePet.name),
      });
      await refresh();
    },
    [user?.id, activePet, lostPetService, refresh],
  );

  const resolve = useCallback(async () => {
    if (!user?.id || !activeCase) return;
    await lostPetService.resolve(user.id, activeCase.id);
    await refresh();
  }, [user?.id, activeCase, lostPetService, refresh]);

  const reportSighting = useCallback(
    async (input: ReportSightingInput) => {
      if (!activeCase) throw new Error('No active case');
      await lostPetService.reportSighting(activeCase.id, input);
      await refresh();
    },
    [activeCase, lostPetService, refresh],
  );

  const markSightingReviewed = useCallback(
    async (sightingId: string) => {
      if (!activeCase) return;
      await lostPetService.markSightingReviewed(activeCase.id, sightingId);
      await refresh();
    },
    [activeCase, lostPetService, refresh],
  );

  const getCaseById = useCallback(
    (caseId: string) => lostPetService.getCaseById(caseId),
    [lostPetService],
  );

  const recoveryStats = useMemo(
    () => (activeCase ? getRecoveryStats(activeCase) : null),
    [activeCase],
  );

  const value = useMemo<LostPetContextValue>(
    () => ({
      activeCase,
      sightings,
      recoveryStats,
      emergencyContacts: LOST_PET_EMERGENCY_CONTACTS,
      isLoading,
      isActive: activeCase?.status === 'active',
      activate,
      resolve,
      reportSighting,
      markSightingReviewed,
      refresh,
      getCaseById,
    }),
    [
      activeCase,
      sightings,
      recoveryStats,
      isLoading,
      activate,
      resolve,
      reportSighting,
      markSightingReviewed,
      refresh,
      getCaseById,
    ],
  );

  return (
    <LostPetContext.Provider value={value}>{children}</LostPetContext.Provider>
  );
}

export function useLostPet(): LostPetContextValue {
  const ctx = useContext(LostPetContext);
  if (!ctx) throw new Error('useLostPet must be used within LostPetProvider');
  return ctx;
}
