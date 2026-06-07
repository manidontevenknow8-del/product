import type {
  TimelineEventItem,
  Milestone,
  TimelineStats,
  LifeStorySummary,
} from '@/types/timeline';

/** Demo-only — requires VITE_DEMO_TIMELINE=true */
export const mockTimelineStats: TimelineStats = {
  totalMoments: 32,
  milestones: 8,
  documents: 12,
  daysRemembered: 640,
  careMoments: 18,
  memoryMoments: 14,
};

export const emptyTimelineStats: TimelineStats = {
  totalMoments: 0,
  milestones: 0,
  documents: 0,
  daysRemembered: 0,
  careMoments: 0,
  memoryMoments: 0,
};

export const mockMilestones: Milestone[] = [
  {
    id: '1',
    title: 'Adoption day',
    date: 'May 2022',
    description: 'The day Luna found her forever home',
    eventType: 'adoption',
  },
  {
    id: '2',
    title: 'First healthy checkup',
    date: 'June 2022',
    description: 'A strong start and a happy heart',
    eventType: 'vaccination',
  },
  {
    id: '3',
    title: 'First annual vaccine complete',
    date: 'May 2023',
    description: 'Core vaccinations completed with confidence',
    eventType: 'vaccination',
  },
  {
    id: '4',
    title: 'Weight milestone reached',
    date: 'March 2025',
    description: 'Reached a stable and healthy adult weight',
    eventType: 'weight_milestone',
  },
  {
    id: '5',
    title: 'PetCare Score breakthrough',
    date: 'September 2025',
    description: 'Crossed 80+ with consistent routine and care',
    eventType: 'petcare_score_milestone',
  },
  {
    id: '6',
    title: 'Birthday celebration',
    date: 'May 2025',
    description: 'Celebrated with a long park walk',
    eventType: 'adoption',
  },
];

export const mockTimelineEvents: TimelineEventItem[] = [
  {
    id: '1',
    type: 'health_record',
    date: '2026-05-28',
    displayDate: 'May 28, 2026',
    monthGroup: 'May 2026',
    title: 'Annual health check',
    description:
      'A calm clinic visit where Luna stayed relaxed. Vitals looked great and energy levels were excellent.',
    hasAttachment: true,
    meta: 'Wellness',
  },
  {
    id: '2',
    type: 'document_uploaded',
    date: '2026-05-28',
    displayDate: 'May 28, 2026',
    monthGroup: 'May 2026',
    title: 'Wellness report saved',
    description: "Luna's report was added to her memory vault with key notes for future visits.",
    hasAttachment: true,
    meta: 'PDF',
  },
  {
    id: '3',
    type: 'petcare_score_milestone',
    date: '2026-05-20',
    displayDate: 'May 20, 2026',
    monthGroup: 'May 2026',
    title: 'PetCare Score reached 86',
    description: 'Consistent reminders and records pushed Luna into her strongest wellness streak.',
    meta: 'Score 86',
  },
  {
    id: '4',
    type: 'reminder_completed',
    date: '2026-05-18',
    displayDate: 'May 18, 2026',
    monthGroup: 'May 2026',
    title: 'Skin check reminder completed',
    description: 'A small routine moment that kept Luna comfortable and itch-free.',
    meta: 'Grooming',
  },
  {
    id: '5',
    type: 'vaccination',
    date: '2026-05-15',
    displayDate: 'May 15, 2026',
    monthGroup: 'May 2026',
    title: 'Flea prevention administered',
    description: 'Monthly prevention was completed right on time.',
    meta: 'Vaccination',
  },
  {
    id: '6',
    type: 'weight_milestone',
    date: '2026-04-28',
    displayDate: 'April 28, 2026',
    monthGroup: 'April 2026',
    title: 'Healthy weight milestone',
    description: 'Luna held a steady 28 kg for the third month in a row.',
    meta: 'Weight',
  },
  {
    id: '7',
    type: 'health_record',
    date: '2026-04-10',
    displayDate: 'April 10, 2026',
    monthGroup: 'April 2026',
    title: 'Allergy follow-up',
    description: 'Follow-up notes confirmed symptoms had settled after routine adjustments.',
    meta: 'Allergy',
  },
  {
    id: '8',
    type: 'vaccination',
    date: '2026-03-12',
    displayDate: 'March 12, 2026',
    monthGroup: 'March 2026',
    title: 'Rabies booster completed',
    description: "A confident clinic day. Luna is fully up to date on core protection.",
    hasAttachment: true,
    meta: 'Vaccination',
  },
  {
    id: '9',
    type: 'adoption',
    date: '2022-05-16',
    displayDate: 'May 16, 2022',
    monthGroup: 'May 2022',
    title: 'Welcome home, Luna',
    description: 'The first day together. New leash, new bed, and a forever friend.',
    meta: 'Origin story',
  },
];

export function groupEventsByMonth(
  events: TimelineEventItem[],
): { month: string; events: TimelineEventItem[] }[] {
  const groups = new Map<string, TimelineEventItem[]>();

  for (const event of events) {
    const existing = groups.get(event.monthGroup) ?? [];
    existing.push(event);
    groups.set(event.monthGroup, existing);
  }

  return Array.from(groups.entries()).map(([month, items]) => ({
    month,
    events: items,
  }));
}

export function buildLifeStorySummary(
  events: TimelineEventItem[],
  petName: string,
  stats: TimelineStats,
  petMeta?: { breed?: string | null; species?: string },
): LifeStorySummary {
  if (events.length === 0) {
    return {
      headline: `${petName}'s story starts here`,
      detail: 'Upload a document, log a health record, or complete a reminder — each action becomes a chapter automatically.',
      highlights: [],
    };
  }

  const adoption = events.find((e) => e.type === 'adoption');
  const latest = events[0];
  const breedNote = petMeta?.breed ? ` · ${petMeta.breed}` : '';

  const headline = `${petName}'s living archive${breedNote}`;

  const detail = adoption
    ? `Since ${adoption.displayDate}, you've captured ${stats.totalMoments} moments across ${stats.daysRemembered} days. Latest update: ${latest.title} (${latest.displayDate}).`
    : `${stats.totalMoments} moments logged across ${stats.daysRemembered} days. Latest: ${latest.title} on ${latest.displayDate}.`;

  const highlights = [
    { label: 'Care moments', value: String(stats.careMoments) },
    { label: 'Memories', value: String(stats.memoryMoments) },
    { label: 'Documents', value: String(stats.documents) },
    { label: 'Milestones', value: String(stats.milestones) },
  ].filter((h) => h.value !== '0');

  return { headline, detail, highlights };
}

/** @deprecated Use buildLifeStorySummary */
export function generateLifeStorySummary(
  events: TimelineEventItem[],
  petName: string,
): string {
  const summary = buildLifeStorySummary(events, petName, emptyTimelineStats);
  return summary.detail;
}
