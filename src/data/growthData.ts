import type { ReferralReward, UpcomingFeature } from '@/types/growth';

/** Launch target for countdown - update for campaigns */
export const LAUNCH_DATE = new Date('2026-09-15T09:00:00');

export const SPOTS_PER_REFERRAL = 5;

export const REFERRAL_REWARDS: ReferralReward[] = [
  {
    id: 'reward-1',
    type: 'early_access',
    title: 'Early access',
    description: 'Unlock bonus Premium days when your first friend signs up.',
    referralsRequired: 1,
  },
  {
    id: 'reward-2',
    type: 'premium_trial',
    title: 'Premium trial',
    description: '30 days of Premium - unlimited pets and advanced scans.',
    referralsRequired: 3,
  },
  {
    id: 'reward-3',
    type: 'exclusive_features',
    title: 'Premium perks',
    description: 'Extended Premium trial and priority feature previews.',
    referralsRequired: 5,
  },
  {
    id: 'reward-4',
    type: 'founder_badge',
    title: 'Champion badge',
    description: 'A permanent badge on your profile - you helped grow PetClues.',
    referralsRequired: 10,
  },
  {
    id: 'reward-5',
    type: 'priority_onboarding',
    title: 'Priority onboarding',
    description: 'White-glove setup with our team when you join.',
    referralsRequired: 25,
  },
];

export const UPCOMING_FEATURES: UpcomingFeature[] = [
  {
    id: 'feat-1',
    title: 'Vet Bill Decoder+',
    description: 'Deeper AI analysis of invoices, labs, and prescriptions.',
    eta: 'Soon',
  },
  {
    id: 'feat-2',
    title: 'Check-in streak insights',
    description: 'Longer trends for feeding and walk patterns across pets.',
    eta: 'Q3 2026',
  },
  {
    id: 'feat-3',
    title: 'Richer monthly reports',
    description: 'More chapters, custom branding, and print-ready layouts.',
    eta: '2026',
  },
];

export const PARTNERSHIP_PLACEHOLDERS = [
  {
    id: 'ambassador',
    label: 'Ambassador program',
    description: 'For passionate pet parents who want to represent PetClues in their community.',
  },
  {
    id: 'creator',
    label: 'Creator partnerships',
    description: 'Collaborate on content with pet influencers and educators.',
  },
  {
    id: 'vet',
    label: 'Vet referral program',
    description: 'Help clinics offer PetClues to clients with dedicated onboarding.',
  },
  {
    id: 'community',
    label: 'Pet community partnerships',
    description: 'Rescue groups, breeders, and clubs - grow together.',
  },
];
