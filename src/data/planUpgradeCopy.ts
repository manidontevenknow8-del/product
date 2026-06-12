import type { CommercialPlan, PlanFeature, PremiumFeature } from '@/subscription/entitlements';
import {
  CUSTOM_LIMITS_EMAIL,
  FEATURE_MIN_PLAN,
  LEGACY_FEATURE_MAP,
  PLAN_LABELS,
} from '@/subscription/entitlements';
import { HEALTH_DISCLAIMER } from '@/data/legalConfig';

export type PlanUpgradeCopy = {
  badge: string;
  headline: string;
  emotional: string;
  disclaimer: string;
  cta: string;
};

const FEATURE_COPY: Partial<Record<PlanFeature, Omit<PlanUpgradeCopy, 'badge' | 'cta'>>> = {
  addPet: {
    headline: 'Every pet deserves their own story',
    emotional: 'Your current plan has a pet limit. Upgrade to add more companions - each with their own timeline, reminders, and health records.',
    disclaimer: HEALTH_DISCLAIMER,
  },
  petPassport: {
    headline: 'Professional pet passports',
    emotional: 'Create and share emergency pet passports - a trusted summary for vets, sitters, and travel. Available on Plus and above.',
    disclaimer: HEALTH_DISCLAIMER,
  },
  vetBillDecoder: {
    headline: 'Decode vet bills in seconds',
    emotional: 'Upload a bill and get plain-language breakdowns of charges and line items - available on Plus and above.',
    disclaimer: HEALTH_DISCLAIMER,
  },
  basicAi: {
    headline: 'AI-powered care insights',
    emotional: 'Get basic AI assistance for organizing care and understanding health patterns - included with Plus.',
    disclaimer: HEALTH_DISCLAIMER,
  },
  advancedAiInsights: {
    headline: 'Advanced AI for deeper care',
    emotional: 'Unlock advanced AI health insights, pattern analysis, and personalized recommendations - a Pro feature.',
    disclaimer: HEALTH_DISCLAIMER,
  },
  monthlyReportExport: {
    headline: 'Professional monthly reports',
    emotional: 'Free lets you preview reports. Plus and above unlock complete exports for family, sitters, or your vet folder.',
    disclaimer: HEALTH_DISCLAIMER,
  },
  premiumTimeline: {
    headline: 'Their full life story',
    emotional: 'Free shows a basic timeline. Plus unlocks your pet\'s complete care history from day one.',
    disclaimer: HEALTH_DISCLAIMER,
  },
  petCareScore: {
    headline: 'Track your care with PetCare Score',
    emotional: 'See how consistently you\'re meeting your pet\'s care needs - available on Plus and above.',
    disclaimer: HEALTH_DISCLAIMER,
  },
  advancedPetCareScore: {
    headline: 'Advanced PetCare Score insights',
    emotional: 'Pro reveals trends, gaps, and gentle next steps beyond the basic score snapshot.',
    disclaimer: HEALTH_DISCLAIMER,
  },
  familySharing: {
    headline: 'Share care with your household',
    emotional: 'Invite partners and sitters with scoped access - Plus includes 2 members, Pro is unlimited.',
    disclaimer: HEALTH_DISCLAIMER,
  },
  prioritySupport: {
    headline: 'Priority support',
    emotional: 'Get faster help when something urgent comes up for your pet - included with Pro.',
    disclaimer: HEALTH_DISCLAIMER,
  },
  comingSoonFeatures: {
    headline: 'Launching Soon features',
    emotional: 'Medical Timeline Intelligence, AI Health Summary Reports, and more - included with Pro and Enterprise.',
    disclaimer: HEALTH_DISCLAIMER,
  },
  enterprisePetVolume: {
    headline: 'Need more than 10 pets?',
    emotional: `Enterprise supports clinics and large households with custom pet limits. Contact ${CUSTOM_LIMITS_EMAIL} for pricing.`,
    disclaimer: HEALTH_DISCLAIMER,
  },
  enterpriseExclusive: {
    headline: 'Enterprise clinic tools',
    emotional: 'Clinic dashboards, staff accounts, and organization management - contact our team for a custom solution.',
    disclaimer: HEALTH_DISCLAIMER,
  },
};

export function getUpgradeCopyForFeature(
  _currentPlan: CommercialPlan,
  feature: PlanFeature | PremiumFeature,
): PlanUpgradeCopy {
  const planFeature: PlanFeature =
    feature in LEGACY_FEATURE_MAP
      ? LEGACY_FEATURE_MAP[feature as PremiumFeature]
      : (feature as PlanFeature);

  const required = FEATURE_MIN_PLAN[planFeature];
  const requiredLabel = PLAN_LABELS[required];
  const base = FEATURE_COPY[planFeature] ?? {
    headline: `Unlock ${requiredLabel}`,
    emotional: `This feature requires ${requiredLabel} or above.`,
    disclaimer: HEALTH_DISCLAIMER,
  };

  return {
    badge: requiredLabel,
    headline: base.headline,
    emotional: base.emotional,
    disclaimer: base.disclaimer,
    cta:
      required === 'enterprise'
        ? 'Contact Enterprise Sales'
        : `Upgrade to ${requiredLabel}`,
  };
}

/** @deprecated Use getUpgradeCopyForFeature */
export const PRO_UPGRADE_COPY = Object.fromEntries(
  (Object.keys(LEGACY_FEATURE_MAP) as PremiumFeature[]).map((key) => {
    const copy = getUpgradeCopyForFeature('free', key);
    return [key, { headline: copy.headline, emotional: copy.emotional, disclaimer: copy.disclaimer }];
  }),
) as Record<PremiumFeature, { headline: string; emotional: string; disclaimer: string }>;
