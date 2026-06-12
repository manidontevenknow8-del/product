import type {
  CommunityStats,
  JoinWaitlistInput,
  LeaderboardEntry,
  LeaderboardPeriod,
  ShareChannel,
  WaitlistMember,
} from '@/types/growth';
import { computePosition, generateReferralCode } from '@/utils/growthUtils';

const WAITLIST_KEY = 'petclues_waitlist';
const MEMBER_KEY = 'petclues_waitlist_member';
const REFERRAL_KEY = 'petclues_pending_referral';

function loadWaitlist(): WaitlistMember[] {
  try {
    const raw = localStorage.getItem(WAITLIST_KEY);
    return raw ? (JSON.parse(raw) as WaitlistMember[]) : [];
  } catch {
    return [];
  }
}

function saveWaitlist(members: WaitlistMember[]): void {
  localStorage.setItem(WAITLIST_KEY, JSON.stringify(members));
}

function saveCurrentMember(member: WaitlistMember): void {
  localStorage.setItem(MEMBER_KEY, JSON.stringify(member));
}

function loadCurrentMember(): WaitlistMember | null {
  try {
    const raw = localStorage.getItem(MEMBER_KEY);
    return raw ? (JSON.parse(raw) as WaitlistMember) : null;
  } catch {
    return null;
  }
}

function isWithinDays(iso: string, days: number): boolean {
  const joined = new Date(iso).getTime();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return joined >= cutoff;
}

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

function maskName(name: string, isYou: boolean): string {
  const first = name.trim().split(/\s+/)[0] || 'Member';
  return isYou ? `${first} (you)` : `${first}.`;
}

function buildLeaderboard(
  members: WaitlistMember[],
  period: LeaderboardPeriod,
  current?: WaitlistMember | null,
): LeaderboardEntry[] {
  const pool =
    period === 'weekly'
      ? members.filter((m) => isWithinDays(m.joinedAt, 7))
      : members;

  const ranked = [...pool]
    .filter((m) => m.referralCount > 0)
    .sort((a, b) => b.referralCount - a.referralCount)
    .slice(0, 5)
    .map((m, index) => ({
      rank: index + 1,
      name: maskName(m.name, current?.id === m.id),
      referralCount: m.referralCount,
      isCurrentUser: current?.id === m.id,
    }));

  if (
    current &&
    current.referralCount > 0 &&
    !ranked.some((entry) => entry.isCurrentUser)
  ) {
    ranked.push({
      rank: ranked.length + 1,
      name: maskName(current.name, true),
      referralCount: current.referralCount,
      isCurrentUser: true,
    });
  }

  return ranked;
}

/**
 * Growth service - swap for Supabase + edge functions for production.
 */
export interface IGrowthService {
  getCurrentMember(): Promise<WaitlistMember | null>;
  joinWaitlist(input: JoinWaitlistInput, referralCode?: string): Promise<WaitlistMember>;
  getLeaderboard(period: LeaderboardPeriod, member?: WaitlistMember | null): Promise<LeaderboardEntry[]>;
  getCommunityStats(): Promise<CommunityStats>;
  trackShare(channel: ShareChannel): Promise<void>;
  setPendingReferral(code: string): void;
  getPendingReferral(): string | null;
  clearPendingReferral(): void;
}

function creditReferrer(code: string, members: WaitlistMember[]): WaitlistMember[] {
  const referrerIndex = members.findIndex((m) => m.referralCode === code);
  if (referrerIndex === -1) return members;

  const referrer = members[referrerIndex];
  const updatedReferrer: WaitlistMember = {
    ...referrer,
    referralCount: referrer.referralCount + 1,
    position: computePosition(referrer.initialPosition, referrer.referralCount + 1),
  };
  members[referrerIndex] = updatedReferrer;

  const current = loadCurrentMember();
  if (current?.id === referrer.id) {
    saveCurrentMember(updatedReferrer);
  }

  return members;
}

export const mockGrowthService: IGrowthService = {
  async getCurrentMember() {
    const stored = loadCurrentMember();
    if (!stored) return null;

    const members = loadWaitlist();
    const fresh = members.find((m) => m.id === stored.id);
    if (fresh) {
      saveCurrentMember(fresh);
      return fresh;
    }
    return stored;
  },

  async joinWaitlist(input, referralCode) {
    const members = loadWaitlist();
    const existing = members.find(
      (m) => m.email.toLowerCase() === input.email.toLowerCase(),
    );
    if (existing) {
      saveCurrentMember(existing);
      return existing;
    }

    const initialPosition = members.length + 1;
    const code = generateReferralCode(input.name);

    let member: WaitlistMember = {
      id: crypto.randomUUID(),
      email: input.email.toLowerCase(),
      name: input.name.trim(),
      referralCode: code,
      referralCount: 0,
      initialPosition,
      position: initialPosition,
      referredBy: referralCode,
      joinedAt: new Date().toISOString(),
    };

    if (referralCode) {
      member = {
        ...member,
        position: computePosition(initialPosition, 1),
      };
    }

    let updated = [...members, member];
    if (referralCode) {
      updated = creditReferrer(referralCode, updated);
    }

    saveWaitlist(updated);
    saveCurrentMember(member);
    return member;
  },

  async getLeaderboard(period, member) {
    return buildLeaderboard(loadWaitlist(), period, member);
  },

  async getCommunityStats() {
    const members = loadWaitlist();
    return {
      waitlistTotal: members.length,
      referralsThisWeek: members.filter(
        (m) => m.referredBy && isWithinDays(m.joinedAt, 7),
      ).length,
      spotsClaimedToday: members.filter((m) => isToday(m.joinedAt)).length,
      countriesRepresented: members.length > 0 ? 1 : 0,
    };
  },

  async trackShare(_channel) {
    // Future: POST /api/analytics/share
  },

  setPendingReferral(code) {
    sessionStorage.setItem(REFERRAL_KEY, code);
  },

  getPendingReferral() {
    return sessionStorage.getItem(REFERRAL_KEY);
  },

  clearPendingReferral() {
    sessionStorage.removeItem(REFERRAL_KEY);
  },
};
