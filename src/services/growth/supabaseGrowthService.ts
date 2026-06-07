import {
  getReferralService,
  type ReferralMemberInput,
} from '@/services/referrals/referralService';
import type { IGrowthService } from './growthService';

const REFERRAL_KEY = 'petclues_pending_referral';

export function createSupabaseGrowthService(
  user: ReferralMemberInput | null,
): IGrowthService {
  const referralService = getReferralService();

  return {
    async getCurrentMember() {
      if (!user) return null;
      return referralService.provisionMember(user);
    },

    async joinWaitlist(input, _referralCode?) {
      if (!user) {
        throw new Error('Sign in to get your referral link.');
      }
      return referralService.provisionMember({
        userId: user.userId,
        name: input.name.trim() || user.name,
        email: input.email.trim() || user.email,
      });
    },

    async getLeaderboard(period, member) {
      const { entries } = await referralService.getLeaderboard(period);
      if (member && member.referralCount > 0 && !entries.some((e) => e.isCurrentUser)) {
        const first = member.name.trim().split(/\s+/)[0] || 'Member';
        entries.push({
          rank: entries.length + 1,
          name: `${first} (you)`,
          referralCount: member.referralCount,
          isCurrentUser: true,
        });
      }
      return entries;
    },

    async getCommunityStats() {
      const { communityStats } = await referralService.getLeaderboard('alltime');
      return communityStats;
    },

    async trackShare(channel) {
      await referralService.trackShare(channel);
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
}
