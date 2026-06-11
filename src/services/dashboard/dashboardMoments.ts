import type { ActivityLogEntry } from '@/services/activity/activityLogService';
import type { ActivityItem } from '@/types/dashboard';
import { partitionByHistoryWindow } from '@/utils/timelineHistoryWindow';

export type DashboardMoment = {
  id: string;
  kind: 'vaccination' | 'reminder' | 'document' | 'health' | 'automation' | 'score' | 'report' | 'update';
  title: string;
  description: string;
  when: string;
  /** ISO timestamp for tier-based history filtering */
  occurredAt: string;
};

function kindFromType(type: ActivityItem['type']): DashboardMoment['kind'] {
  switch (type) {
    case 'scan':
      return 'document';
    case 'reminder':
      return 'reminder';
    case 'note':
      return 'health';
    case 'automation':
      return 'automation';
    case 'update':
      return 'update';
    default:
      return 'update';
  }
}

export function partitionMomentsByHistoryWindow(moments: DashboardMoment[]): {
  recentMoments: DashboardMoment[];
  historicalMoments: DashboardMoment[];
} {
  const { recentItems, historicalItems } = partitionByHistoryWindow(
    moments,
    (moment) => moment.occurredAt,
  );
  return { recentMoments: recentItems, historicalMoments: historicalItems };
}

export function activityToMoments(entries: ActivityLogEntry[]): DashboardMoment[] {
  return entries.map((entry) => ({
    id: entry.id,
    kind: kindFromType(entry.type),
    title: entry.title,
    description: entry.description,
    when: entry.timestamp,
    occurredAt: entry.createdAt,
  }));
}

export function completenessMetrics(params: {
  healthRecords: number;
  documents: number;
  overdueCount: number;
  hasVaccination: boolean;
  profileHasPhoto: boolean;
}): { id: string; label: string; value: number }[] {
  const recordsPct = Math.min(params.healthRecords * 12, 100);
  const docsPct = Math.min(params.documents * 15, 100);
  const remindersPct = params.overdueCount > 0 ? 40 : 100;
  const vaccinesPct = params.hasVaccination ? 100 : params.healthRecords > 0 ? 50 : 0;

  return [
    { id: 'records', label: 'Health records', value: recordsPct },
    { id: 'documents', label: 'Documents', value: docsPct },
    { id: 'reminders', label: 'Reminders on track', value: remindersPct },
    { id: 'vaccines', label: 'Vaccinations', value: vaccinesPct },
  ];
}

export function heroStatusChip(params: {
  overdueCount: number;
  score: number | null;
}): { label: string; tone: 'calm' | 'attention' | 'great' } {
  if (params.overdueCount > 0) {
    return { label: 'Needs attention', tone: 'attention' };
  }
  if (params.score != null && params.score >= 86) {
    return { label: 'Doing great', tone: 'great' };
  }
  return { label: 'On track', tone: 'calm' };
}
