import { isSupabaseConfigured } from '@/services/supabase/config';
import type { ActivityItem } from '@/types/dashboard';
import { mockActivityEventService } from './mockActivityEventService';
import { supabaseActivityEventService } from './supabaseActivityEventService';
import type {
  ActivityLogEntry,
  AppendActivityLogInput,
  IActivityEventService,
} from './activityEventTypes';

export type { ActivityLogEntry } from './activityEventTypes';

function getActivityEventService(): IActivityEventService {
  return isSupabaseConfigured() ? supabaseActivityEventService : mockActivityEventService;
}

export async function getActivityLogForPet(
  petId: string,
  limit = 10,
  options?: { petIdsForMigration?: string[] },
): Promise<ActivityLogEntry[]> {
  const service = getActivityEventService();
  if (options?.petIdsForMigration?.length) {
    await service.migrateFromLocalStorage(options.petIdsForMigration);
  }
  return service.getForPet(petId, limit);
}

export async function appendActivityLogEntry(
  entry: AppendActivityLogInput,
): Promise<ActivityLogEntry> {
  return getActivityEventService().append(entry);
}

export async function logAutomationReminderCreated(params: {
  petId: string;
  reminderTitle: string;
  dueDate: string;
  ruleLabel: string;
}): Promise<ActivityLogEntry> {
  return appendActivityLogEntry({
    petId: params.petId,
    type: 'automation',
    title: 'Reminder created automatically',
    description: `${params.reminderTitle} · ${params.ruleLabel} · due ${params.dueDate}`,
  });
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
