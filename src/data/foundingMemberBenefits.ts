import {
  FOUNDING_DISCOUNT_PERCENT,
  FOUNDING_DISCOUNTED_PRICE_DISPLAY,
  PRO_MONTHLY_PRICE_DISPLAY,
} from '@/config/razorpayConfig';
import { PAGE_IMG } from '@/data/pageImages';

export type FoundingBenefit = {
  id: string;
  title: string;
  description: string;
  detail: string;
  image: string;
  imageAlt: string;
};

export const FOUNDING_BENEFITS: FoundingBenefit[] = [
  {
    id: 'early-access',
    title: 'Early access',
    description: 'Be first to try new features before public launch.',
    detail: 'Founding members see beta features and product updates ahead of the wider community.',
    image: PAGE_IMG.app.onboarding,
    imageAlt: 'Early access to new PetClues features',
  },
  {
    id: 'premium-trial',
    title: '30-day Pro trial',
    description: 'Full Pro access the moment you create your account.',
    detail: 'Unlimited pets, Vet Bill Decoder, advanced insights, and premium timeline - free for 30 days.',
    image: PAGE_IMG.app.score,
    imageAlt: 'PetCare Score and Pro features preview',
  },
  {
    id: 'founding-badge',
    title: 'Founding badge',
    description: 'A permanent badge on your profile and dashboard.',
    detail: 'Applied automatically when you sign up with the same email you used on the founding list.',
    image: PAGE_IMG.app.dashboardWelcome,
    imageAlt: 'Founding member badge on PetClues profile',
  },
  {
    id: 'lifetime-discount',
    title: `${FOUNDING_DISCOUNT_PERCENT}% lifetime discount`,
    description: 'A permanent thank-you on Pro when you subscribe.',
    detail: `Founding members pay ${FOUNDING_DISCOUNTED_PRICE_DISPLAY}/month instead of ${PRO_MONTHLY_PRICE_DISPLAY} - locked in for life.`,
    image: PAGE_IMG.app.billing,
    imageAlt: 'Lifetime founding discount on Pro subscription',
  },
  {
    id: 'feature-voting',
    title: 'Feature voting',
    description: 'Help decide what PetClues builds next.',
    detail: 'Vote on upcoming features from your Settings once your account is live.',
    image: PAGE_IMG.app.referrals,
    imageAlt: 'Shape the PetClues product roadmap',
  },
];

export const FOUNDING_TRIAL_DAYS = 30;

export {
  FOUNDING_DISCOUNT_PERCENT,
  FOUNDING_DISCOUNTED_PRICE_DISPLAY,
} from '@/config/razorpayConfig';
