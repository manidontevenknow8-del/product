export type TimelineFilter =
  | 'all'
  | 'care'
  | 'memory'
  | 'documents'
  | 'milestones';

export type TimelineEventType =
  | 'adoption'
  | 'health_record'
  | 'reminder_completed'
  | 'vaccination'
  | 'document_uploaded'
  | 'weight_milestone'
  | 'petcare_score_milestone'
  | 'manual_moment';

export type TimelineEventSourceKind =
  | 'document'
  | 'health_record'
  | 'reminder'
  | 'profile'
  | 'score'
  | 'moment';

export type TimelineEventItem = {
  id: string;
  type: TimelineEventType;
  date: string;
  displayDate: string;
  monthGroup: string;
  title: string;
  description: string;
  /** Pet profile photo or other direct image URL */
  imageUrl?: string;
  /** Load preview via document service when set */
  thumbnailDocumentId?: string;
  hasAttachment?: boolean;
  attachmentName?: string;
  sourceId?: string;
  sourceKind?: TimelineEventSourceKind;
  meta?: string;
};

export type Milestone = {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUrl?: string;
  thumbnailDocumentId?: string;
  eventType: TimelineEventType;
};

export type TimelineStats = {
  totalMoments: number;
  milestones: number;
  documents: number;
  daysRemembered: number;
  careMoments: number;
  memoryMoments: number;
};

export type LifeStorySummary = {
  headline: string;
  detail: string;
  highlights: { label: string; value: string }[];
  accessNote?: string;
};

export type TimelineSummaryAccess = {
  hasFullTimeline: boolean;
  lockedMomentsCount: number;
  freeTimelineDays: number;
};

export const filterLabels: Record<TimelineFilter, string> = {
  all: 'All',
  care: 'Care',
  memory: 'Memories',
  documents: 'Documents',
  milestones: 'Milestones',
};

export const eventTypeLabels: Record<TimelineEventType, string> = {
  adoption: 'Welcome home',
  health_record: 'Health record',
  reminder_completed: 'Reminder done',
  vaccination: 'Vaccination',
  document_uploaded: 'Document',
  weight_milestone: 'Weight check',
  petcare_score_milestone: 'PetCare Score',
  manual_moment: 'Memory',
};

export function eventMatchesFilter(
  event: TimelineEventItem,
  filter: TimelineFilter,
): boolean {
  if (filter === 'all') return true;

  const careTypes: TimelineEventType[] = [
    'health_record',
    'vaccination',
    'reminder_completed',
  ];

  const memoryTypes: TimelineEventType[] = [
    'adoption',
    'document_uploaded',
    'manual_moment',
  ];

  const milestoneTypes: TimelineEventType[] = [
    'weight_milestone',
    'vaccination',
    'petcare_score_milestone',
    'adoption',
  ];

  switch (filter) {
    case 'care':
      return careTypes.includes(event.type);
    case 'memory':
      return memoryTypes.includes(event.type);
    case 'documents':
      return event.type === 'document_uploaded';
    case 'milestones':
      return milestoneTypes.includes(event.type);
    default:
      return true;
  }
}

export function countEventsForFilter(
  events: TimelineEventItem[],
  filter: TimelineFilter,
): number {
  return events.filter((e) => eventMatchesFilter(e, filter)).length;
}
