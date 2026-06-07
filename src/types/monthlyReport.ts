import type { HealthRecord } from '@/services/healthRecords/healthRecordTypes';
import type { PetDocumentRecord } from '@/services/documents/documentTypes';
import type { Reminder } from '@/types/reminder';
import type { DailyCheckIn } from '@/types/dailyCheckIn';

export type MonthlyReportMetric = {
  label: string;
  value: string;
  hint?: string;
};

export type MonthlyReportMilestone = {
  id: string;
  title: string;
  description: string;
};

export type MonthlyReportActivityItem = {
  id: string;
  title: string;
  detail: string;
  dateLabel: string;
  category: 'reminder' | 'health' | 'document' | 'checkin';
};

export type MonthlyReportStorySection = {
  id: string;
  title: string;
  intro: string;
  body: string;
  image: string;
  imageAlt: string;
  bullets?: string[];
};

export type MonthlyPetLifeReport = {
  id: string;
  petId: string;
  petName: string;
  monthKey: string;
  monthLabel: string;
  generatedAt: string;

  remindersCompleted: number;
  healthRecordsAdded: number;
  documentsUploaded: number;
  dailyCheckInsCount?: number;
  totalWalkKm?: number;

  petCareScore: {
    start: number | null;
    end: number | null;
    delta: number | null;
  };

  milestones: MonthlyReportMilestone[];
  highlights: string[];
  metrics: MonthlyReportMetric[];

  narrativeIntro: string;
  careScoreNarrative: string;
  storySections: MonthlyReportStorySection[];
  activityItems: MonthlyReportActivityItem[];
};

export type MonthlyReportEngineInput = {
  petId: string;
  petName: string;
  monthKey: string;
  reminders: Reminder[];
  healthRecords: HealthRecord[];
  documents: PetDocumentRecord[];
  dailyCheckIns: DailyCheckIn[];
  petCareScoreHistory: { date: string; score: number }[];
};
