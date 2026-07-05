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
  canEditHousehold,
  canManageHouseholdMembers,
  getHouseholdService,
  type HouseholdInvite,
  type HouseholdMember,
  type HouseholdSummary,
  type IncomingHouseholdInvite,
  type InviteRole,
} from '@/services/household';

type HouseholdContextValue = {
  household: HouseholdSummary | null;
  members: HouseholdMember[];
  outgoingInvites: HouseholdInvite[];
  incomingInvites: IncomingHouseholdInvite[];
  isLoading: boolean;
  error: string | null;
  canEdit: boolean;
  canManageMembers: boolean;
  refresh: () => Promise<void>;
  inviteMember: (email: string, role: InviteRole) => Promise<HouseholdInvite>;
  revokeInvite: (inviteId: string) => Promise<void>;
  updateMemberRole: (userId: string, role: InviteRole) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  acceptInvite: (token: string) => Promise<void>;
  declineInvite: (token: string) => Promise<void>;
};

const HouseholdContext = createContext<HouseholdContextValue | null>(null);

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const service = useMemo(() => getHouseholdService(), []);
  const [household, setHousehold] = useState<HouseholdSummary | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [outgoingInvites, setOutgoingInvites] = useState<HouseholdInvite[]>([]);
  const [incomingInvites, setIncomingInvites] = useState<IncomingHouseholdInvite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setHousehold(null);
      setMembers([]);
      setOutgoingInvites([]);
      setIncomingInvites([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [primary, incoming] = await Promise.all([
        service.getPrimaryHousehold(),
        service.listIncomingInvites(),
      ]);
      setHousehold(primary);
      setIncomingInvites(incoming);

      if (primary) {
        const [memberRows, inviteRows] = await Promise.all([
          service.listMembers(primary.id),
          primary.myRole === 'owner' ? service.listOutgoingInvites(primary.id) : Promise.resolve([]),
        ]);
        setMembers(memberRows);
        setOutgoingInvites(inviteRows);
      } else {
        setMembers([]);
        setOutgoingInvites([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load household.');
      setHousehold(null);
      setMembers([]);
      setOutgoingInvites([]);
      setIncomingInvites([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, service, user]);

  useEffect(() => {
    void refresh();
  }, [refresh, user?.id]);

  const inviteMember = useCallback(
    async (email: string, role: InviteRole) => {
      if (!household) throw new Error('No household loaded.');
      const invite = await service.createInvite(household.id, email, role);
      await refresh();
      return invite;
    },
    [household, refresh, service],
  );

  const revokeInvite = useCallback(
    async (inviteId: string) => {
      await service.revokeInvite(inviteId);
      await refresh();
    },
    [refresh, service],
  );

  const updateMemberRole = useCallback(
    async (userId: string, role: InviteRole) => {
      if (!household) throw new Error('No household loaded.');
      await service.updateMemberRole(household.id, userId, role);
      await refresh();
    },
    [household, refresh, service],
  );

  const removeMember = useCallback(
    async (userId: string) => {
      if (!household) throw new Error('No household loaded.');
      await service.removeMember(household.id, userId);
      await refresh();
    },
    [household, refresh, service],
  );

  const acceptInvite = useCallback(
    async (token: string) => {
      await service.acceptInvite(token);
      await refresh();
    },
    [refresh, service],
  );

  const declineInvite = useCallback(
    async (token: string) => {
      await service.declineInvite(token);
      await refresh();
    },
    [refresh, service],
  );

  const value = useMemo<HouseholdContextValue>(
    () => ({
      household,
      members,
      outgoingInvites,
      incomingInvites,
      isLoading,
      error,
      canEdit: canEditHousehold(household?.myRole ?? null),
      canManageMembers: canManageHouseholdMembers(household?.myRole ?? null),
      refresh,
      inviteMember,
      revokeInvite,
      updateMemberRole,
      removeMember,
      acceptInvite,
      declineInvite,
    }),
    [
      household,
      members,
      outgoingInvites,
      incomingInvites,
      isLoading,
      error,
      refresh,
      inviteMember,
      revokeInvite,
      updateMemberRole,
      removeMember,
      acceptInvite,
      declineInvite,
    ],
  );

  return <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>;
}

export function useHousehold(): HouseholdContextValue {
  const context = useContext(HouseholdContext);
  if (!context) {
    throw new Error('useHousehold must be used within HouseholdProvider');
  }
  return context;
}
