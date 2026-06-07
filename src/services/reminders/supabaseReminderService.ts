import { getSupabaseClient } from '@/services/supabase/client';
import type { CreateReminderInput } from '@/types/reminder';
import { computeStats } from '@/utils/reminderUtils';
import type { IReminderService } from './reminderTypes';
import {
  computeNextDueDate,
  mapReminderRow,
  reminderInputToRow,
  reminderUpdateToRow,
} from './reminderMappers';
import type { ReminderRowWithPet } from './reminderTypes';

const REMINDER_SELECT = `
  id,
  pet_id,
  title,
  category,
  due_date,
  notes,
  priority,
  recurring,
  completed,
  completed_at,
  source_health_record_id,
  created_at,
  updated_at,
  pets!inner ( name )
`;

export const supabaseReminderService: IReminderService = {
  async list(userId) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('reminders')
      .select(REMINDER_SELECT)
      .order('due_date', { ascending: true });

    if (error) throw new Error(error.message);
    return (data as ReminderRowWithPet[]).map((row) => mapReminderRow(row, userId));
  },

  async create(userId, input) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('reminders')
      .insert(reminderInputToRow(input))
      .select(REMINDER_SELECT)
      .single();

    if (error) throw new Error(error.message);
    return mapReminderRow(data as ReminderRowWithPet, userId, input.petName);
  },

  async update(userId, id, input) {
    const supabase = getSupabaseClient();
    const patch = reminderUpdateToRow(input);
    const { data, error } = await supabase
      .from('reminders')
      .update(patch)
      .eq('id', id)
      .select(REMINDER_SELECT)
      .single();

    if (error) throw new Error(error.message);
    return mapReminderRow(
      data as ReminderRowWithPet,
      userId,
      input.petName,
    );
  },

  async complete(userId, id) {
    const supabase = getSupabaseClient();
    const { data: existing, error: fetchError } = await supabase
      .from('reminders')
      .select(REMINDER_SELECT)
      .eq('id', id)
      .single();

    if (fetchError) throw new Error(fetchError.message);

    const row = existing as ReminderRowWithPet;
    const now = new Date().toISOString();

    const { data: completed, error: completeError } = await supabase
      .from('reminders')
      .update({ completed: true, completed_at: now })
      .eq('id', id)
      .select(REMINDER_SELECT)
      .single();

    if (completeError) throw new Error(completeError.message);

    if (row.recurring !== 'none') {
      const nextDue = computeNextDueDate(row.due_date, row.recurring as CreateReminderInput['repeatFrequency']);
      const { error: createError } = await supabase.from('reminders').insert({
        pet_id: row.pet_id,
        title: row.title,
        category: row.category,
        due_date: nextDue,
        notes: row.notes,
        priority: row.priority,
        recurring: row.recurring,
        completed: false,
        completed_at: null,
      });

      if (createError) throw new Error(createError.message);
    }

    return mapReminderRow(completed as ReminderRowWithPet, userId);
  },

  async reschedule(userId, id, dueDate) {
    return this.update(userId, id, { dueDate });
  },

  async delete(_userId, id) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('reminders').delete().eq('id', id);

    if (error) throw new Error(error.message);
  },

  async getStats(userId) {
    const reminders = await this.list(userId);
    return computeStats(reminders);
  },
};
