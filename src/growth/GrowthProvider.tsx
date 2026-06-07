import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { eventTracker } from '@/analytics/EventTracker';
import { useAuth } from '@/auth/AuthProvider';
import { isSupabaseConfigured } from '@/services/supabase/config';
import {
  mockGrowthService,
  type IGrowthService,
} from '@/services/growth/growthService';
import { createSupabaseGrowthService } from '@/services/growth/supabaseGrowthService';
import { getReferralService } from '@/services/referrals/referralService';
import type {
  CommunityStats,
  JoinWaitlistInput,
  LeaderboardEntry,
  LeaderboardPeriod,
  ReferralReward,
  ShareChannel,
  WaitlistMember,
} from '@/types/growth';
import {
  getEarnedRewards,
  getMilestoneProgress,
  getNextReward,
  getReferralUrl,
} from '@/utils/growthUtils';

type GrowthContextValue = {
  member: WaitlistMember | null;
  isLoading: boolean;
  isOnWaitlist: boolean;
  referralUrl: string | null;
  nextReward: ReferralReward | null;
  earnedRewards: ReferralReward[];
  milestoneProgress: number;
  communityStats: CommunityStats | null;
  leaderboard: LeaderboardEntry[];
  leaderboardPeriod: LeaderboardPeriod;
  setLeaderboardPeriod: (period: LeaderboardPeriod) => void;
  joinWaitlist: (input: JoinWaitlistInput) => Promise<WaitlistMember>;
  refresh: () => Promise<void>;
  trackShare: (channel: ShareChannel) => Promise<void>;
  sendInvite: (email: string) => Promise<void>;
  pendingReferral: string | null;
  setPendingReferral: (code: string) => void;
  error: string | null;
};

const GrowthContext = createContext<GrowthContextValue | null>(null);

type GrowthProviderProps = {
  children: ReactNode;
  growthService?: IGrowthService;
};

export function GrowthProvider({ children, growthService: growthServiceOverride }: GrowthProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [member, setMember] = useState<WaitlistMember | null>(null);
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<LeaderboardPeriod>('weekly');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingReferral, setPendingReferralState] = useState<string | null>(null);
  const previousConversions = useRef<number | null>(null);

  const growthService = useMemo<IGrowthService>(() => {
    if (growthServiceOverride) return growthServiceOverride;
    if (isSupabaseConfigured() && isAuthenticated && user) {
      return createSupabaseGrowthService({
        userId: user.id,
        name: user.name,
        email: user.email,
      });
    }
    return mockGrowthService;
  }, [growthServiceOverride, isAuthenticated, user]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const current = await growthService.getCurrentMember();
      const [stats, board] = await Promise.all([
        growthService.getCommunityStats(),
        growthService.getLeaderboard(leaderboardPeriod, current),
      ]);
      setMember(current);
      setCommunityStats(stats);
      setLeaderboard(board);
      setPendingReferralState(growthService.getPendingReferral());

      if (user?.id) {
        const referralStats = await getReferralService().getStats(user.id);
        if (
          previousConversions.current !== null &&
          referralStats.conversions > previousConversions.current
        ) {
          eventTracker.track('referral_converted', {
            conversions: referralStats.conversions,
            delta: referralStats.conversions - previousConversions.current,
          });
        }
        previousConversions.current = referralStats.conversions;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load referrals');
      setMember(null);
      setCommunityStats(null);
      setLeaderboard([]);
    } finally {
      setIsLoading(false);
    }
  }, [growthService, leaderboardPeriod, user?.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!member) return;
    growthService
      .getLeaderboard(leaderboardPeriod, member)
      .then(setLeaderboard)
      .catch(() => {
        /* refresh handles errors */
      });
  }, [leaderboardPeriod, member, growthService]);

  const joinWaitlist = useCallback(
    async (input: JoinWaitlistInput) => {
      setError(null);
      try {
        const ref = growthService.getPendingReferral() ?? undefined;
        const joined = await growthService.joinWaitlist(input, ref);
        growthService.clearPendingReferral();
        setPendingReferralState(null);
        await refresh();
        return joined;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to join';
        setError(message);
        throw err;
      }
    },
    [growthService, refresh],
  );

  const setPendingReferral = useCallback(
    (code: string) => {
      growthService.setPendingReferral(code);
      setPendingReferralState(code);
    },
    [growthService],
  );

  const trackShare = useCallback(
    async (channel: ShareChannel) => {
      await growthService.trackShare(channel);
    },
    [growthService],
  );

  const sendInvite = useCallback(
    async (email: string) => {
      if (!user?.id) throw new Error('Sign in to send invites');
      await getReferralService().sendInvite(user.id, email, 'in_app');
      eventTracker.track('referral_invited', { channel: 'in_app' });
      await refresh();
    },
    [user?.id, refresh],
  );

  const nextReward = useMemo(
    () => (member ? getNextReward(member.referralCount) : null),
    [member],
  );

  const earnedRewards = useMemo(
    () => (member ? getEarnedRewards(member.referralCount) : []),
    [member],
  );

  const milestoneProgress = useMemo(
    () => (member ? getMilestoneProgress(member.referralCount, nextReward) : 0),
    [member, nextReward],
  );

  const referralUrl = useMemo(
    () => (member ? getReferralUrl(member.referralCode) : null),
    [member],
  );

  const value = useMemo<GrowthContextValue>(
    () => ({
      member,
      isLoading,
      isOnWaitlist: !!member,
      referralUrl,
      nextReward,
      earnedRewards,
      milestoneProgress,
      communityStats,
      leaderboard,
      leaderboardPeriod,
      setLeaderboardPeriod,
      joinWaitlist,
      refresh,
      trackShare,
      sendInvite,
      pendingReferral,
      setPendingReferral,
      error,
    }),
    [
      member,
      isLoading,
      referralUrl,
      nextReward,
      earnedRewards,
      milestoneProgress,
      communityStats,
      leaderboard,
      leaderboardPeriod,
      joinWaitlist,
      refresh,
      trackShare,
      sendInvite,
      pendingReferral,
      setPendingReferral,
      error,
    ],
  );

  return <GrowthContext.Provider value={value}>{children}</GrowthContext.Provider>;
}

export function useGrowth(): GrowthContextValue {
  const ctx = useContext(GrowthContext);
  if (!ctx) throw new Error('useGrowth must be used within GrowthProvider');
  return ctx;
}
