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
import { petRecordToAgeProfile } from '@/services/pets/petService';
import {
  mockAgeTranslatorService,
  type IAgeTranslatorService,
} from '@/services/ageTranslator/ageTranslatorService';
import type {
  AgeTranslation,
  HealthFocus,
  Milestone,
  PetAgeProfile,
} from '@/types/ageTranslator';
import type { BreedInsight, LifeStageInsight } from '@/types/ageTranslator';

type AgeTranslatorContextValue = {
  pets: PetAgeProfile[];
  selectedPet: PetAgeProfile | null;
  translation: AgeTranslation | null;
  lifeStageInsight: LifeStageInsight | null;
  breedInsights: BreedInsight[];
  healthFocus: HealthFocus[];
  milestones: Milestone[];
  isLoading: boolean;
  selectPet: (petId: string) => void;
  refresh: () => Promise<void>;
};

const AgeTranslatorContext = createContext<AgeTranslatorContextValue | null>(null);

type AgeTranslatorProviderProps = {
  children: ReactNode;
  ageTranslatorService?: IAgeTranslatorService;
};

export function AgeTranslatorProvider({
  children,
  ageTranslatorService = mockAgeTranslatorService,
}: AgeTranslatorProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const { pets: ownedPets } = usePets();
  const [pets, setPets] = useState<PetAgeProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [translation, setTranslation] = useState<AgeTranslation | null>(null);
  const [lifeStageInsight, setLifeStageInsight] = useState<LifeStageInsight | null>(null);
  const [breedInsights, setBreedInsights] = useState<BreedInsight[]>([]);
  const [healthFocus, setHealthFocus] = useState<HealthFocus[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const selectedPet = useMemo(
    () => pets.find((p) => p.id === selectedPetId) ?? pets[0] ?? null,
    [pets, selectedPetId],
  );

  const loadPetData = useCallback(
    async (pet: PetAgeProfile) => {
      const [trans, insight, breeds, health, ms] = await Promise.all([
        ageTranslatorService.translate(pet),
        ageTranslatorService.getLifeStageInsight(pet),
        ageTranslatorService.getBreedInsights(pet),
        ageTranslatorService.getHealthFocus(pet),
        ageTranslatorService.getMilestones(pet),
      ]);
      setTranslation(trans);
      setLifeStageInsight(insight);
      setBreedInsights(breeds);
      setHealthFocus(health);
      setMilestones(ms);
    },
    [ageTranslatorService],
  );

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setPets([]);
      setTranslation(null);
      return;
    }
    setIsLoading(true);
    const available =
      ownedPets.length > 0
        ? ownedPets.map(petRecordToAgeProfile)
        : await ageTranslatorService.getAvailablePets(user.id);
    setPets(available);
    const pet = available.find((p) => p.id === selectedPetId) ?? available[0];
    if (pet) {
      setSelectedPetId(pet.id);
      await loadPetData(pet);
    }
    setIsLoading(false);
  }, [user?.id, ownedPets, ageTranslatorService, selectedPetId, loadPetData]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      void refresh();
    } else {
      setPets([]);
      setTranslation(null);
    }
  }, [isAuthenticated, user?.id, refresh]);

  const selectPet = useCallback(
    async (petId: string) => {
      setSelectedPetId(petId);
      const pet = pets.find((p) => p.id === petId);
      if (pet) {
        setIsLoading(true);
        await loadPetData(pet);
        setIsLoading(false);
      }
    },
    [pets, loadPetData],
  );

  const value = useMemo<AgeTranslatorContextValue>(
    () => ({
      pets,
      selectedPet,
      translation,
      lifeStageInsight,
      breedInsights,
      healthFocus,
      milestones,
      isLoading,
      selectPet,
      refresh,
    }),
    [
      pets,
      selectedPet,
      translation,
      lifeStageInsight,
      breedInsights,
      healthFocus,
      milestones,
      isLoading,
      selectPet,
      refresh,
    ],
  );

  return (
    <AgeTranslatorContext.Provider value={value}>{children}</AgeTranslatorContext.Provider>
  );
}

export function useAgeTranslator(): AgeTranslatorContextValue {
  const ctx = useContext(AgeTranslatorContext);
  if (!ctx) throw new Error('useAgeTranslator must be used within AgeTranslatorProvider');
  return ctx;
}
