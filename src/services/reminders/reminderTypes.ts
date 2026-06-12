import type {
  CreateReminderInput,
  Reminder,
  ReminderStats,
  UpdateReminderInput,
} from '@/types/reminder';

export type ReminderRow = {
  id: string;
  pet_id: string;
  title: string;
  category: string;
  due_date: string;
  notes: string | null;
  priority: string;
  recurring: string;
  completed: boolean;
  completed_at: string | null;
  source_health_record_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ReminderRowWithPet = ReminderRow & {
  pets: { name: string } | null;
};

/**
 * Reminder service interface - swap mock for Supabase + cron/edge functions.
 *
 * Future notification integration points:
 * - create/update/complete/reschedule → call notification scheduler
 * - scheduleNotifications() → push, email, SMS providers
 * - processDueReminders() → cron job for automated delivery
 */
export interface IReminderService {
  list(userId: string): Promise<Reminder[]>;
  create(userId: string, input: CreateReminderInput): Promise<Reminder>;
  update(userId: string, id: string, input: UpdateReminderInput): Promise<Reminder>;
  complete(userId: string, id: string): Promise<Reminder>;
  reschedule(userId: string, id: string, dueDate: string): Promise<Reminder>;
  delete(userId: string, id: string): Promise<void>;
  getStats(userId: string): Promise<ReminderStats>;
}
