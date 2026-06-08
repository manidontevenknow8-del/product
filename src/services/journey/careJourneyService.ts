import { ROUTES } from '@/routes/paths';
import type { HealthRecord } from '@/services/healthRecords/healthRecordTypes';
import type { PetDocumentRecord } from '@/services/documents/documentTypes';
import type { PetRecord } from '@/services/pets/petTypes';
import type { Reminder } from '@/types/reminder';

export type CareJourneyStepId =
  | 'profile'
  | 'scan'
  | 'records'
  | 'reminders'
  | 'score'
  | 'timeline'
  | 'monthly_report'
  | 'premium';

export type CareJourneyStep = {
  id: CareJourneyStepId;
  title: string;
  description: string;
  path: string;
  completed: boolean;
  premiumTease?: string;
};

export type CareJourneyInput = {
  pet: PetRecord | null;
  documents: PetDocumentRecord[];
  healthRecords: HealthRecord[];
  reminders: Reminder[];
  timelineEventCount: number;
  monthlyReportCount: number;
  petCareScore: number | null;
};

export function computeCareJourney(input: CareJourneyInput): CareJourneyStep[] {
  const pet = input.pet;
  const profileDone = Boolean(pet?.name && pet.species);
  const hasDocs = input.documents.length > 0;
  const hasRecords = input.healthRecords.length > 0;
  const hasReminders = input.reminders.length > 0;
  const hasScore = input.petCareScore != null && input.petCareScore > 0;
  const hasTimeline = input.timelineEventCount > 1;
  const hasMonthly = input.monthlyReportCount > 0;

  return [
    {
      id: 'profile',
      title: 'Meet your pet',
      description: 'Profile and basics — the foundation of every care decision.',
      path: ROUTES.PET_PROFILE,
      completed: profileDone,
    },
    {
      id: 'scan',
      title: 'Scan a vet document',
      description: 'Upload bills or records; PetClues extracts dates and follow-ups.',
      path: ROUTES.SCAN,
      completed: hasDocs,
      premiumTease: 'Premium: AI vet bill decoder with one-tap approval',
    },
    {
      id: 'records',
      title: 'Build health history',
      description: 'Vaccinations, wellness visits, and meds in one timeline-ready vault.',
      path: ROUTES.PET_PROFILE,
      completed: hasRecords,
    },
    {
      id: 'reminders',
      title: 'Never miss care',
      description: 'Reminders from your records — automation creates the next due date.',
      path: ROUTES.REMINDERS,
      completed: hasReminders,
    },
    {
      id: 'score',
      title: 'See your PetCare Score',
      description: 'A calm score that shows what is organized and what needs attention.',
      path: ROUTES.PET_CARE_SCORE,
      completed: hasScore,
    },
    {
      id: 'timeline',
      title: 'Read their life story',
      description: 'Every scan, record, and win becomes a chapter in their story.',
      path: ROUTES.TIMELINE,
      completed: hasTimeline,
    },
    {
      id: 'monthly_report',
      title: 'Share a monthly moment',
      description: 'Instagram-ready monthly report — celebrate consistency.',
      path: ROUTES.MONTHLY_REPORT,
      completed: hasMonthly,
      premiumTease: 'Premium: unlimited exports & archive',
    },
    {
      id: 'premium',
      title: 'Unlock PetClues Pro',
      description: 'AI decoding, premium passport, and priority features.',
      path: ROUTES.PRICING,
      completed: false,
      premiumTease: 'Upgrade to Pro with Razorpay — unlock Vet Bill Decoder and AI insights',
    },
  ];
}

export function careJourneyProgress(steps: CareJourneyStep[]): {
  completed: number;
  total: number;
  percent: number;
  nextStep: CareJourneyStep | null;
} {
  const core = steps.filter((s) => s.id !== 'premium');
  const completed = core.filter((s) => s.completed).length;
  const nextStep = core.find((s) => !s.completed) ?? null;
  return {
    completed,
    total: core.length,
    percent: core.length ? Math.round((completed / core.length) * 100) : 0,
    nextStep,
  };
}
