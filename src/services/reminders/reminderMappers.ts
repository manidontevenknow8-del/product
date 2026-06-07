import type { CreateReminderInput, Reminder, UpdateReminderInput } from '@/types/reminder';
import { INPUT_LIMITS, trimField, validateRequiredText } from '@/utils/inputValidation';
import type { ReminderRowWithPet } from './reminderTypes';
import { addDays } from '@/utils/reminderUtils';

const REMINDER_CATEGORIES = new Set([
  'vaccination',
  'medication',
  'grooming',
  'vet_visit',
  'custom',
]);

function assertIsoDate(value: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error('Invalid due date.');
  }
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function defaultCreateReminderInput(
  petId: string,
  petName: string,
): CreateReminderInput {
  return {
    petId,
    petName,
    title: '',
    category: 'custom',
    dueDate: daysFromNow(7),
    repeatFrequency: 'none',
    notes: '',
    priority: 'medium',
  };
}

export function mapReminderRow(
  row: ReminderRowWithPet,
  userId: string,
  petNameOverride?: string,
): Reminder {
  const petName = petNameOverride ?? row.pets?.name ?? 'Pet';

  return {
    id: row.id,
    userId,
    petId: row.pet_id,
    petName,
    title: row.title,
    category: row.category as Reminder['category'],
    dueDate: row.due_date,
    repeatFrequency: row.recurring as Reminder['repeatFrequency'],
    notes: row.notes ?? undefined,
    priority: row.priority as Reminder['priority'],
    completedAt: row.completed_at ?? undefined,
    sourceHealthRecordId: row.source_health_record_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function reminderInputToRow(input: CreateReminderInput) {
  const titleError = validateRequiredText(input.title, 'Title', INPUT_LIMITS.title);
  if (titleError) throw new Error(titleError);
  if (!REMINDER_CATEGORIES.has(input.category)) throw new Error('Invalid reminder category.');
  assertIsoDate(input.dueDate);

  return {
    pet_id: input.petId,
    title: trimField(input.title, INPUT_LIMITS.title),
    category: input.category,
    due_date: input.dueDate,
    notes: input.notes ? trimField(input.notes, INPUT_LIMITS.notes) || null : null,
    priority: input.priority,
    recurring: input.repeatFrequency,
    completed: false,
    completed_at: null,
    source_health_record_id: input.sourceHealthRecordId ?? null,
  };
}

export function reminderUpdateToRow(input: UpdateReminderInput): Partial<{
  pet_id: string;
  title: string;
  category: string;
  due_date: string;
  notes: string | null;
  priority: string;
  recurring: string;
}> {
  const patch: Partial<{
    pet_id: string;
    title: string;
    category: string;
    due_date: string;
    notes: string | null;
    priority: string;
    recurring: string;
  }> = {};

  if (input.petId !== undefined) patch.pet_id = input.petId;
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.category !== undefined) patch.category = input.category;
  if (input.dueDate !== undefined) patch.due_date = input.dueDate;
  if (input.notes !== undefined) patch.notes = input.notes.trim() || null;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.repeatFrequency !== undefined) patch.recurring = input.repeatFrequency;

  return patch;
}

export function computeNextDueDate(
  currentDue: string,
  frequency: Reminder['repeatFrequency'],
): string {
  switch (frequency) {
    case 'daily':
      return addDays(currentDue, 1);
    case 'weekly':
      return addDays(currentDue, 7);
    case 'monthly':
      return addDays(currentDue, 30);
    case 'quarterly':
      return addDays(currentDue, 90);
    case 'yearly':
      return addDays(currentDue, 365);
    default:
      return currentDue;
  }
}
