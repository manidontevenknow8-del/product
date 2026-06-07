import type { HealthRecord } from '@/services/healthRecords/healthRecordTypes';
import type { IReminderService } from '@/services/reminders/reminderTypes';
import type { Reminder } from '@/types/reminder';
import {
  automationNoteTag,
  buildAutomatedReminderInput,
  getMatchingAutomationRule,
  type AutomationRuleId,
} from './automationRules';

export type AutomationAction = 'created' | 'updated' | 'skipped';

export type AutomationEngineResult = {
  action: AutomationAction;
  ruleId?: AutomationRuleId;
  reminderId?: string;
  reminderTitle?: string;
  dueDate?: string;
  skipReason?: 'no_rule' | 'duplicate' | 'unchanged';
};

export type AutomationEngineContext = {
  ownerId: string;
  record: HealthRecord;
  petName: string;
  reminders: Reminder[];
  reminderService: IReminderService;
};

function findLinkedReminder(record: HealthRecord, reminders: Reminder[]): Reminder | undefined {
  return reminders.find(
    (reminder) =>
      reminder.sourceHealthRecordId === record.id ||
      reminder.notes?.includes(automationNoteTag(record.id)),
  );
}

function reminderNeedsUpdate(
  existing: Reminder,
  record: HealthRecord,
  petName: string,
): boolean {
  const match = getMatchingAutomationRule(record);
  if (!match) return false;

  const next = buildAutomatedReminderInput(record, petName, match);
  return (
    existing.dueDate !== next.dueDate ||
    existing.title !== next.title ||
    existing.category !== next.category
  );
}

export async function runHealthRecordAutomation(
  ctx: AutomationEngineContext,
): Promise<AutomationEngineResult> {
  const match = getMatchingAutomationRule(ctx.record);

  if (!match) {
    return { action: 'skipped', skipReason: 'no_rule' };
  }

  const existing = findLinkedReminder(ctx.record, ctx.reminders);

  if (existing) {
    if (!reminderNeedsUpdate(existing, ctx.record, ctx.petName)) {
      return {
        action: 'skipped',
        skipReason: 'unchanged',
        ruleId: match.ruleId,
        reminderId: existing.id,
      };
    }

    const input = buildAutomatedReminderInput(ctx.record, ctx.petName, match);
    const updated = await ctx.reminderService.update(ctx.ownerId, existing.id, {
      title: input.title,
      category: input.category,
      dueDate: input.dueDate,
      repeatFrequency: input.repeatFrequency,
      priority: input.priority,
      notes: input.notes,
      petName: input.petName,
    });

    return {
      action: 'updated',
      ruleId: match.ruleId,
      reminderId: updated.id,
      reminderTitle: updated.title,
      dueDate: updated.dueDate,
    };
  }

  const input = buildAutomatedReminderInput(ctx.record, ctx.petName, match);
  const created = await ctx.reminderService.create(ctx.ownerId, input);

  return {
    action: 'created',
    ruleId: match.ruleId,
    reminderId: created.id,
    reminderTitle: created.title,
    dueDate: created.dueDate,
  };
}
