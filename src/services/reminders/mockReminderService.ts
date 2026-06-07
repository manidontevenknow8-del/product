import type { Reminder } from '@/types/reminder';
import { computeStats } from '@/utils/reminderUtils';
import type { IReminderService } from './reminderTypes';
import {
  computeNextDueDate,
  reminderInputToRow,
  reminderUpdateToRow,
} from './reminderMappers';

const STORAGE_KEY = 'petclues_reminders';

type StoredReminder = Reminder;

function loadAll(): StoredReminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredReminder[]) : [];
  } catch {
    return [];
  }
}

function saveAll(reminders: StoredReminder[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

export const mockReminderService: IReminderService = {
  async list(userId) {
    return loadAll().filter((r) => r.userId === userId);
  },

  async create(userId, input) {
    const now = new Date().toISOString();
    const row = reminderInputToRow(input);
    const reminder: Reminder = {
      id: crypto.randomUUID(),
      userId,
      petId: row.pet_id,
      petName: input.petName,
      title: row.title,
      category: row.category as Reminder['category'],
      dueDate: row.due_date,
      repeatFrequency: row.recurring as Reminder['repeatFrequency'],
      notes: row.notes ?? undefined,
      priority: row.priority as Reminder['priority'],
      sourceHealthRecordId: input.sourceHealthRecordId,
      createdAt: now,
      updatedAt: now,
    };
    const all = loadAll();
    all.push(reminder);
    saveAll(all);
    return reminder;
  },

  async update(userId, id, input) {
    const all = loadAll();
    const index = all.findIndex((r) => r.id === id && r.userId === userId);
    if (index === -1) throw new Error('Reminder not found');

    const patch = reminderUpdateToRow(input);
    const current = all[index];
    const updated: Reminder = {
      ...current,
      ...(patch.pet_id !== undefined ? { petId: patch.pet_id } : {}),
      ...(input.petName !== undefined ? { petName: input.petName } : {}),
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.category !== undefined
        ? { category: patch.category as Reminder['category'] }
        : {}),
      ...(patch.due_date !== undefined ? { dueDate: patch.due_date } : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes ?? undefined } : {}),
      ...(patch.priority !== undefined
        ? { priority: patch.priority as Reminder['priority'] }
        : {}),
      ...(patch.recurring !== undefined
        ? { repeatFrequency: patch.recurring as Reminder['repeatFrequency'] }
        : {}),
      updatedAt: new Date().toISOString(),
    };
    all[index] = updated;
    saveAll(all);
    return updated;
  },

  async complete(userId, id) {
    const all = loadAll();
    const index = all.findIndex((r) => r.id === id && r.userId === userId);
    if (index === -1) throw new Error('Reminder not found');

    const reminder = all[index];
    const now = new Date().toISOString();
    const completed: Reminder = {
      ...reminder,
      completedAt: now,
      updatedAt: now,
    };
    all[index] = completed;

    if (reminder.repeatFrequency !== 'none') {
      const nextDue = computeNextDueDate(reminder.dueDate, reminder.repeatFrequency);
      all.push({
        ...reminder,
        id: crypto.randomUUID(),
        dueDate: nextDue,
        completedAt: undefined,
        createdAt: now,
        updatedAt: now,
      });
    }

    saveAll(all);
    return completed;
  },

  async reschedule(userId, id, dueDate) {
    return this.update(userId, id, { dueDate });
  },

  async delete(userId, id) {
    const all = loadAll().filter((r) => !(r.id === id && r.userId === userId));
    saveAll(all);
  },

  async getStats(userId) {
    const reminders = await this.list(userId);
    return computeStats(reminders);
  },
};
