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
import {
  mockFamilySharingService,
  type IFamilySharingService,
} from '@/services/familySharing/familySharingService';
import type {
  Caretaker,
  CaretakerPermission,
  InviteCaretakerInput,
  SharedPet,
} from '@/types/familySharing';

type FamilySharingContextValue = {
  sharedPets: SharedPet[];
  caretakers: Caretaker[];
  isLoading: boolean;
  inviteCaretaker: (input: InviteCaretakerInput) => Promise<Caretaker>;
  updatePermission: (caretakerId: string, permission: CaretakerPermission) => Promise<void>;
  removeCaretaker: (caretakerId: string) => Promise<void>;
  resendInvitation: (caretakerId: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const FamilySharingContext = createContext<FamilySharingContextValue | null>(null);

type FamilySharingProviderProps = {
  children: ReactNode;
  familySharingService?: IFamilySharingService;
};

export function FamilySharingProvider({
  children,
  familySharingService = mockFamilySharingService,
}: FamilySharingProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [sharedPets, setSharedPets] = useState<SharedPet[]>([]);
  const [caretakers, setCaretakers] = useState<Caretaker[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setSharedPets([]);
      setCaretakers([]);
      return;
    }
    setIsLoading(true);
    const [pets, members] = await Promise.all([
      familySharingService.getSharedPets(user.id),
      familySharingService.getCaretakers(user.id),
    ]);
    setSharedPets(pets);
    setCaretakers(members);
    setIsLoading(false);
  }, [user?.id, familySharingService]);

  const inviteCaretaker = useCallback(
    async (input: InviteCaretakerInput) => {
      if (!user?.id) throw new Error('Not authenticated');
      const caretaker = await familySharingService.inviteCaretaker(user.id, input);
      setCaretakers((prev) => [...prev, caretaker]);
      return caretaker;
    },
    [user?.id, familySharingService],
  );

  const updatePermission = useCallback(
    async (caretakerId: string, permission: CaretakerPermission) => {
      if (!user?.id) return;
      const updated = await familySharingService.updatePermission(
        user.id,
        caretakerId,
        permission,
      );
      setCaretakers((prev) =>
        prev.map((c) => (c.id === caretakerId ? updated : c)),
      );
    },
    [user?.id, familySharingService],
  );

  const removeCaretaker = useCallback(
    async (caretakerId: string) => {
      if (!user?.id) return;
      await familySharingService.removeCaretaker(user.id, caretakerId);
      setCaretakers((prev) => prev.filter((c) => c.id !== caretakerId));
    },
    [user?.id, familySharingService],
  );

  const resendInvitation = useCallback(
    async (caretakerId: string) => {
      if (!user?.id) return;
      await familySharingService.resendInvitation(user.id, caretakerId);
    },
    [user?.id, familySharingService],
  );

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      void refresh();
    } else {
      setSharedPets([]);
      setCaretakers([]);
    }
  }, [isAuthenticated, user?.id, refresh]);

  const value = useMemo(
    () => ({
      sharedPets,
      caretakers,
      isLoading,
      inviteCaretaker,
      updatePermission,
      removeCaretaker,
      resendInvitation,
      refresh,
    }),
    [
      sharedPets,
      caretakers,
      isLoading,
      inviteCaretaker,
      updatePermission,
      removeCaretaker,
      resendInvitation,
      refresh,
    ],
  );

  return (
    <FamilySharingContext.Provider value={value}>
      {children}
    </FamilySharingContext.Provider>
  );
}

export function useFamilySharing(): FamilySharingContextValue {
  const ctx = useContext(FamilySharingContext);
  if (!ctx) throw new Error('useFamilySharing must be used within FamilySharingProvider');
  return ctx;
}
