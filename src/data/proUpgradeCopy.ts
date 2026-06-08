import type { PremiumFeature } from '@/subscription/featureGates';
import { HEALTH_DISCLAIMER } from '@/data/legalConfig';

export type ProUpgradeCopy = {
  headline: string;
  emotional: string;
  /** Short legal/trust line shown at upgrade gates (not veterinary advice). */
  disclaimer: string;
};

export const PRO_UPGRADE_COPY: Record<PremiumFeature, ProUpgradeCopy> = {
  unlimitedPets: {
    headline: 'Every pet deserves their own story',
    emotional:
      'Free covers one companion. Pro lets you add every dog, cat, or critter in your family - each with their own timeline, reminders, and health records.',
    disclaimer: HEALTH_DISCLAIMER,
  },
  unlimitedReminders: {
    headline: 'Never miss what matters',
    emotional:
      'You can keep two active reminders on Free - enough for the essentials. Pro unlocks unlimited reminders so vaccines, meds, and vet visits never slip through the cracks.',
    disclaimer: HEALTH_DISCLAIMER,
  },
  unlimitedHealthRecords: {
    headline: 'Build a complete health history',
    emotional:
      'Free covers three health records - enough to start. Pro unlocks unlimited entries so vaccinations, diagnoses, medications, and vet visits stay organized in one place.',
    disclaimer: HEALTH_DISCLAIMER,
  },
  vetBillDecoder: {
    headline: 'Decode vet bills in seconds',
    emotional:
      'Upload a bill and get plain-language breakdowns of charges and line items - so you know what you paid for before the next visit.',
    disclaimer: HEALTH_DISCLAIMER,
  },
  advancedHealthInsights: {
    headline: 'Deeper care insights',
    emotional:
      "See patterns in feeding, walks, and check-ins that help you stay consistent - personalized suggestions to support your pet's wellbeing.",
    disclaimer: HEALTH_DISCLAIMER,
  },
  unlimitedMonthlyReports: {
    headline: 'Download & share their story',
    emotional:
      "You can browse this month's report on Free. Pro lets you download a beautiful PNG to share with family, your sitter, or your vet folder.",
    disclaimer: HEALTH_DISCLAIMER,
  },
  premiumTimeline: {
    headline: 'Their full life story',
    emotional:
      "Free shows the last six months of memories. Pro unlocks your pet's complete timeline - every milestone, document, and moment from day one.",
    disclaimer: HEALTH_DISCLAIMER,
  },
  advancedPetCareScore: {
    headline: 'See what your care is really building',
    emotional:
      "Your snapshot score is only the surface. Pro reveals trends, gaps, and gentle next steps - the deeper picture most pet parents wish they had sooner.",
    disclaimer: HEALTH_DISCLAIMER,
  },
  futureAiCompanion: {
    headline: 'Your AI care companion',
    emotional: "Early access to guided care conversations tailored to your pet's routine.",
    disclaimer: HEALTH_DISCLAIMER,
  },
  futureBreedIntelligence: {
    headline: 'Breed-aware intelligence',
    emotional: "Insights tuned to your pet's breed and life stage - coming to Pro first.",
    disclaimer: HEALTH_DISCLAIMER,
  },
  prioritySupport: {
    headline: 'Priority support',
    emotional: 'Get faster help when something urgent comes up for your pet.',
    disclaimer: HEALTH_DISCLAIMER,
  },
  futurePremium: {
    headline: "What's next for Pro",
    emotional: 'Be first in line for new AI tools and care features as we ship them.',
    disclaimer: HEALTH_DISCLAIMER,
  },
};
