import type { ActivityItem } from '@/types/dashboard';

export type ActivityLogEntry = {
  id: string;
  petId: string;
  type: ActivityItem['type'];
  title: string;
  description: string;
  timestamp: string;
  createdAt: string;
};

const STORAGE_KEY = 'petclues_activity_log';
const MAX_ENTRIES = 100;

function loadEntries(): ActivityLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ActivityLogEntry[]) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: ActivityLogEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

function formatActivityTimestamp(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function appendActivityLogEntry(
  entry: Omit<ActivityLogEntry, 'id' | 'createdAt' | 'timestamp'> & {
    timestamp?: string;
  },
): ActivityLogEntry {
  const createdAt = new Date().toISOString();
  const full: ActivityLogEntry = {
    id: crypto.randomUUID(),
    createdAt,
    timestamp: entry.timestamp ?? formatActivityTimestamp(createdAt),
    petId: entry.petId,
    type: entry.type,
    title: entry.title,
    description: entry.description,
  };

  saveEntries([full, ...loadEntries()]);
  return full;
}

export function logAutomationReminderCreated(params: {
  petId: string;
  reminderTitle: string;
  dueDate: string;
  ruleLabel: string;
}): ActivityLogEntry {
  return appendActivityLogEntry({
    petId: params.petId,
    type: 'automation',
    title: 'Reminder created automatically',
    description: `${params.reminderTitle} · ${params.ruleLabel} · due ${params.dueDate}`,
  });
}

export function getActivityLogForPet(petId: string, limit = 10): ActivityLogEntry[] {
  return loadEntries().filter((entry) => entry.petId === petId).slice(0, limit);
}

export function activityLogToDashboardItems(entries: ActivityLogEntry[]): ActivityItem[] {
  return entries.map((entry) => ({
    id: entry.id,
    type: entry.type,
    title: entry.title,
    description: entry.description,
    timestamp: entry.timestamp,
  }));
}
