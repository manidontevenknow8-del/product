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
import { capturePostHogEvent } from '@/analytics/posthog';
import { useAuth } from '@/auth/AuthProvider';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import { canAddPet, FREE_PET_LIMIT } from '@/subscription/featureGates';
import {
  getPetService,
  onboardingToCreatePetInput,
  type CreatePetInput,
  type IPetService,
  type PetRecord,
  type UpdatePetInput,
} from '@/services/pets/petService';
import type { OnboardingPetData } from '@/types/onboarding';

const ACTIVE_PET_KEY = 'petclues_active_pet';

function getStoredActivePetId(userId: string): string | null {
  return localStorage.getItem(`${ACTIVE_PET_KEY}_${userId}`);
}

function storeActivePetId(userId: string, petId: string) {
  localStorage.setItem(`${ACTIVE_PET_KEY}_${userId}`, petId);
}

type PetContextValue = {
  pets: PetRecord[];
  activePet: PetRecord | null;
  activePetId: string | null;
  isLoading: boolean;
  error: string | null;
  hasPets: boolean;
  refreshPets: () => Promise<void>;
  setActivePet: (petId: string) => void;
  createPet: (input: CreatePetInput) => Promise<PetRecord>;
  createPetFromOnboarding: (data: OnboardingPetData) => Promise<PetRecord>;
  updatePet: (petId: string, input: UpdatePetInput) => Promise<PetRecord>;
};

const PetContext = createContext<PetContextValue | null>(null);

type PetProviderProps = {
  children: ReactNode;
  petService?: IPetService;
};

export function PetProvider({ children, petService: service = getPetService() }: PetProviderProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { subscription } = useSubscription();
  const [pets, setPets] = useState<PetRecord[]>([]);
  const [activePetId, setActivePetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPets = useCallback(async () => {
    if (!user?.id) {
      setPets([]);
      setActivePetId(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const list = await service.getPets(user.id);
      setPets(list);

      const stored = getStoredActivePetId(user.id);
      const nextActive =
        stored && list.some((pet) => pet.id === stored) ? stored : (list[0]?.id ?? null);

      setActivePetId(nextActive);
      if (nextActive) storeActivePetId(user.id, nextActive);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pets');
      setPets([]);
      setActivePetId(null);
    } finally {
      setIsLoading(false);
    }
  }, [service, user?.id]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !user?.id) {
      setPets([]);
      setActivePetId(null);
      setIsLoading(false);
      return;
    }
    void refreshPets();
  }, [authLoading, isAuthenticated, user?.id, refreshPets]);

  const setActivePet = useCallback(
    (petId: string) => {
      setActivePetId(petId);
      if (user?.id) storeActivePetId(user.id, petId);
    },
    [user?.id],
  );

  const createPet = useCallback(
    async (input: CreatePetInput) => {
      if (!user?.id) throw new Error('Not authenticated');
      const tier = subscription?.plan ?? 'free';
      if (!canAddPet(tier, pets.length)) {
        throw new Error(
          `Free plan includes ${FREE_PET_LIMIT} pet. Upgrade to Premium for unlimited pets.`,
        );
      }
      const pet = await service.createPet(user.id, input);
      eventTracker.track('pet_created', { species: pet.species });
      capturePostHogEvent('pet_created', { species: pet.species });
      await refreshPets();
      setActivePet(pet.id);
      return pet;
    },
    [service, user?.id, subscription?.plan, pets.length, refreshPets, setActivePet],
  );

  const createPetFromOnboarding = useCallback(
    async (data: OnboardingPetData) => createPet(onboardingToCreatePetInput(data)),
    [createPet],
  );

  const updatePet = useCallback(
    async (petId: string, input: UpdatePetInput) => {
      if (!user?.id) throw new Error('Not authenticated');
      const updated = await service.updatePet(user.id, petId, input);
      eventTracker.track('pet_updated', { species: updated.species });
      setPets((prev) => prev.map((pet) => (pet.id === petId ? updated : pet)));
      return updated;
    },
    [service, user?.id],
  );

  const activePet = useMemo(
    () => pets.find((pet) => pet.id === activePetId) ?? null,
    [pets, activePetId],
  );

  const value = useMemo<PetContextValue>(
    () => ({
      pets,
      activePet,
      activePetId,
      isLoading,
      error,
      hasPets: pets.length > 0,
      refreshPets,
      setActivePet,
      createPet,
      createPetFromOnboarding,
      updatePet,
    }),
    [
      pets,
      activePet,
      activePetId,
      isLoading,
      error,
      refreshPets,
      setActivePet,
      createPet,
      createPetFromOnboarding,
      updatePet,
    ],
  );

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>;
}

export function usePets(): PetContextValue {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error('usePets must be used within PetProvider');
  return ctx;
}
