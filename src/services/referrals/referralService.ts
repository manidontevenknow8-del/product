import { getSupabaseClient } from '@/services/supabase/client';
import { isSupabaseConfigured } from '@/services/supabase/config';
import { parseFunctionInvokeError } from '@/services/supabase/parseFunctionInvokeError';
import type {
  CommunityStats,
  LeaderboardEntry,
  LeaderboardPeriod,
  ShareChannel,
  WaitlistMember,
} from '@/types/growth';

export type ReferralStats = {
  invitations: number;
  signups: number;
  conversions: number;
  eligiblePremiumMonths: number;
};

export type ReferralMemberInput = {
  userId: string;
  name: string;
  email: string;
};

export type IReferralService = {
  provisionMember(input: ReferralMemberInput): Promise<WaitlistMember>;
  getMyReferralCode(userId: string): Promise<string>;
  sendInvite(userId: string, inviteeEmail: string, referralSource?: string): Promise<void>;
  getStats(userId: string): Promise<ReferralStats>;
  getLeaderboard(period: LeaderboardPeriod): Promise<{
    entries: LeaderboardEntry[];
    communityStats: CommunityStats;
  }>;
  trackShare(channel: ShareChannel): Promise<void>;
};

const LOCAL_KEY = 'petclues_referrals_v1';
const LOCAL_CODE_KEY = 'petclues_referral_code';

type LocalReferral = {
  inviterUserId: string;
  inviteeEmail: string;
  status: 'invited' | 'signed_up' | 'converted';
  createdAt: string;
};

function readLocal(): LocalReferral[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as LocalReferral[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(records: LocalReferral[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(records.slice(0, 200)));
}

function mockCodeForUser(userId: string): string {
  const stored = localStorage.getItem(`${LOCAL_CODE_KEY}_${userId}`);
  if (stored) return stored;
  const code = `PET${userId.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
  localStorage.setItem(`${LOCAL_CODE_KEY}_${userId}`, code);
  return code;
}

async function buildMockMember(input: ReferralMemberInput): Promise<WaitlistMember> {
  const code = mockCodeForUser(input.userId);
  const stats = await mockReferralService.getStats(input.userId);
  return {
    id: input.userId,
    email: input.email,
    name: input.name,
    referralCode: code,
    referralCount: stats.signups,
    position: 1,
    initialPosition: 1,
    joinedAt: new Date().toISOString(),
  };
}

export const supabaseReferralService: IReferralService = {
  async provisionMember(input) {
    const code = await supabaseReferralService.getMyReferralCode(input.userId);
    const stats = await supabaseReferralService.getStats(input.userId);

    const supabase = getSupabaseClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('created_at')
      .eq('user_id', input.userId)
      .maybeSingle();

    return {
      id: input.userId,
      email: input.email,
      name: input.name,
      referralCode: code,
      referralCount: stats.signups,
      position: 1,
      initialPosition: 1,
      joinedAt: profile?.created_at ?? new Date().toISOString(),
    };
  },

  async getMyReferralCode(userId) {
    const supabase = getSupabaseClient();

    const { data: existing, error: readError } = await supabase
      .from('referral_codes')
      .select('code')
      .eq('user_id', userId)
      .maybeSingle();

    if (readError) {
      throw new Error(readError.message);
    }
    if (existing?.code) {
      return String(existing.code);
    }

    const { data, error } = await supabase.functions.invoke('get-referral-code', { body: {} });
    if (error) {
      throw new Error(await parseFunctionInvokeError(error, 'Unable to load referral code'));
    }
    if (data?.error) throw new Error(String(data.error));
    if (!data?.code) throw new Error('Referral code not returned');
    return String(data.code);
  },

  async sendInvite(_userId, inviteeEmail, referralSource) {
    const supabase = getSupabaseClient();
    const { error, data } = await supabase.functions.invoke('send-referral-invite', {
      body: { email: inviteeEmail, referralSource: referralSource ?? 'in_app' },
    });
    if (error) {
      throw new Error(await parseFunctionInvokeError(error, 'Unable to send invite'));
    }
    if (data?.error) throw new Error(String(data.error));
  },

  async getStats(userId) {
    const supabase = getSupabaseClient();
    const [{ count: invitations }, { count: signups }, { count: conversions }] = await Promise.all([
      supabase
        .from('referrals')
        .select('id', { count: 'exact', head: true })
        .eq('inviter_user_id', userId)
        .eq('status', 'invited'),
      supabase
        .from('referrals')
        .select('id', { count: 'exact', head: true })
        .eq('inviter_user_id', userId)
        .in('status', ['signed_up', 'converted']),
      supabase
        .from('referrals')
        .select('id', { count: 'exact', head: true })
        .eq('inviter_user_id', userId)
        .eq('status', 'converted'),
    ]);

    return {
      invitations: invitations ?? 0,
      signups: signups ?? 0,
      conversions: conversions ?? 0,
      eligiblePremiumMonths: conversions ?? 0,
    };
  },

  async getLeaderboard(period) {
    const supabase = getSupabaseClient();
    const emptyStats: CommunityStats = {
      waitlistTotal: 0,
      referralsThisWeek: 0,
      spotsClaimedToday: 0,
      countriesRepresented: 0,
    };

    try {
      const { data, error } = await supabase.functions.invoke('get-referral-leaderboard', {
        body: { period },
      });
      if (error) {
        throw new Error(await parseFunctionInvokeError(error, 'Unable to load leaderboard'));
      }
      if (data?.error) throw new Error(String(data.error));

      return {
        entries: (data?.entries ?? []) as LeaderboardEntry[],
        communityStats: (data?.communityStats ?? emptyStats) as CommunityStats,
      };
    } catch {
      const { count: memberCount } = await supabase
        .from('referral_codes')
        .select('id', { count: 'exact', head: true });

      return {
        entries: [],
        communityStats: {
          ...emptyStats,
          waitlistTotal: memberCount ?? 0,
          countriesRepresented: (memberCount ?? 0) > 0 ? 1 : 0,
        },
      };
    }
  },

  async trackShare(channel) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.functions.invoke('track-referral-share', {
      body: { channel },
    });
    if (error) {
      // Share tracking is non-critical; don't block the user flow.
      console.warn('referral_share_track_failed', await parseFunctionInvokeError(error));
    }
  },
};

export const mockReferralService: IReferralService = {
  async provisionMember(input) {
    return buildMockMember(input);
  },

  async getMyReferralCode(userId) {
    return mockCodeForUser(userId);
  },

  async sendInvite(userId, inviteeEmail) {
    const records = readLocal();
    const normalized = inviteeEmail.trim().toLowerCase();
    const next: LocalReferral = {
      inviterUserId: userId,
      inviteeEmail: normalized,
      status: 'invited',
      createdAt: new Date().toISOString(),
    };
    writeLocal([next, ...records]);
  },

  async getStats(userId) {
    const records = readLocal().filter((r) => r.inviterUserId === userId);
    const invitations = records.filter((r) => r.status === 'invited').length;
    const signups = records.filter((r) => r.status === 'signed_up' || r.status === 'converted').length;
    const conversions = records.filter((r) => r.status === 'converted').length;
    return {
      invitations,
      signups,
      conversions,
      eligiblePremiumMonths: conversions,
    };
  },

  async getLeaderboard(period) {
    const { mockGrowthService } = await import('@/services/growth/growthService');
    const member = await mockGrowthService.getCurrentMember();
    const entries = await mockGrowthService.getLeaderboard(period, member);
    const communityStats = await mockGrowthService.getCommunityStats();
    return { entries, communityStats };
  },

  async trackShare() {
    // no-op in mock mode
  },
};

export function getReferralService(): IReferralService {
  return isSupabaseConfigured() ? supabaseReferralService : mockReferralService;
}
