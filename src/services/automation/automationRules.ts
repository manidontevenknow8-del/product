import type { HealthRecord } from '@/services/healthRecords/healthRecordTypes';
import type { CreateReminderInput, ReminderCategory } from '@/types/reminder';

export type AutomationRuleId =
  | 'vaccination_due'
  | 'medication_end'
  | 'wellness_followup';

export type AutomationRuleMatch = {
  ruleId: AutomationRuleId;
  dueDate: string;
  category: ReminderCategory;
  titleSuffix: string;
};

export const AUTOMATION_NOTE_PREFIX = 'petclues:auto:health_record:';

export function automationNoteTag(healthRecordId: string): string {
  return `${AUTOMATION_NOTE_PREFIX}${healthRecordId}`;
}

function hasDueDate(record: HealthRecord): record is HealthRecord & { nextDueDate: string } {
  return Boolean(record.nextDueDate?.trim());
}

/** Vaccination + next_due_date → reminder */
export function matchVaccinationDue(record: HealthRecord): AutomationRuleMatch | null {
  if (record.recordType !== 'vaccination' || !hasDueDate(record)) return null;
  return {
    ruleId: 'vaccination_due',
    dueDate: record.nextDueDate,
    category: 'vaccinations',
    titleSuffix: 'due',
  };
}

/** Medication + end date (stored as next_due_date) → reminder */
export function matchMedicationEnd(record: HealthRecord): AutomationRuleMatch | null {
  if (record.recordType !== 'medication' || !hasDueDate(record)) return null;
  return {
    ruleId: 'medication_end',
    dueDate: record.nextDueDate,
    category: 'medication',
    titleSuffix: 'end date',
  };
}

/** Wellness + follow-up date (stored as next_due_date) → reminder */
export function matchWellnessFollowUp(record: HealthRecord): AutomationRuleMatch | null {
  if (record.recordType !== 'wellness' || !hasDueDate(record)) return null;
  return {
    ruleId: 'wellness_followup',
    dueDate: record.nextDueDate,
    category: 'vet_visits',
    titleSuffix: 'follow-up',
  };
}

const RULE_MATCHERS = [matchVaccinationDue, matchMedicationEnd, matchWellnessFollowUp];

export function getMatchingAutomationRule(record: HealthRecord): AutomationRuleMatch | null {
  for (const matcher of RULE_MATCHERS) {
    const match = matcher(record);
    if (match) return match;
  }
  return null;
}

export function buildAutomatedReminderInput(
  record: HealthRecord,
  petName: string,
  match: AutomationRuleMatch,
): CreateReminderInput {
  return {
    petId: record.petId,
    petName,
    title: `${record.title} ${match.titleSuffix}`,
    category: match.category,
    dueDate: match.dueDate,
    repeatFrequency: match.ruleId === 'vaccination_due' ? 'yearly' : 'none',
    priority: match.ruleId === 'vaccination_due' ? 'high' : 'medium',
    notes: `${automationNoteTag(record.id)} · Created automatically from health record.`,
    sourceHealthRecordId: record.id,
  };
}

export const automationRuleLabels: Record<AutomationRuleId, string> = {
  vaccination_due: 'Vaccination due date',
  medication_end: 'Medication end date',
  wellness_followup: 'Wellness follow-up',
};
