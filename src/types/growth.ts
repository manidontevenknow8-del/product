export type RewardType =
  | 'early_access'
  | 'premium_trial'
  | 'exclusive_features'
  | 'founder_badge'
  | 'priority_onboarding';

export type ReferralReward = {
  id: string;
  type: RewardType;
  title: string;
  description: string;
  referralsRequired: number;
};

export type WaitlistMember = {
  id: string;
  email: string;
  name: string;
  referralCode: string;
  referralCount: number;
  position: number;
  initialPosition: number;
  referredBy?: string;
  joinedAt: string;
};

export type JoinWaitlistInput = {
  name: string;
  email: string;
};

export type LeaderboardPeriod = 'weekly' | 'alltime';

export type LeaderboardEntry = {
  rank: number;
  name: string;
  referralCount: number;
  isCurrentUser?: boolean;
};

export type CommunityStats = {
  waitlistTotal: number;
  referralsThisWeek: number;
  spotsClaimedToday: number;
  countriesRepresented: number;
};

export type ShareChannel =
  | 'copy'
  | 'whatsapp'
  | 'instagram'
  | 'twitter'
  | 'email';

export type UpcomingFeature = {
  id: string;
  title: string;
  description: string;
  eta: string;
};

export type ReferralMilestone = {
  referralsRequired: number;
  label: string;
  reward: ReferralReward;
};
