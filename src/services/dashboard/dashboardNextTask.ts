import type { HealthRecord } from '@/services/healthRecords/healthRecordTypes';
import type { PetDocumentRecord } from '@/services/documents/documentTypes';
import type { Reminder } from '@/types/reminder';
import { ROUTES } from '@/routes/paths';
import { formatDueLabel, getReminderStatus } from '@/utils/reminderUtils';

export type DashboardNextTask = {
  id: string;
  title: string;
  description: string;
  urgency: 'overdue' | 'today' | 'soon' | 'setup' | 'calm';
  dueLabel?: string;
  ctaLabel: string;
  ctaPath: string;
  isPositive?: boolean;
};

export function pickDashboardNextTask(params: {
  reminders: Reminder[];
  documents: PetDocumentRecord[];
  healthRecords: HealthRecord[];
}): DashboardNextTask {
  const { reminders, documents, healthRecords } = params;
  const open = reminders.filter((r) => !r.completedAt);

  const overdue = open
    .filter((r) => getReminderStatus(r) === 'overdue')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  if (overdue[0]) {
    const r = overdue[0];
    return {
      id: `reminder-${r.id}`,
      title: r.title,
      description: 'This reminder is overdue. A quick check-in keeps care on track.',
      urgency: 'overdue',
      dueLabel: formatDueLabel(r.dueDate),
      ctaLabel: 'View reminder',
      ctaPath: ROUTES.REMINDERS,
    };
  }

  const dueToday = open.filter((r) => getReminderStatus(r) === 'due_today');
  if (dueToday[0]) {
    const r = dueToday[0];
    return {
      id: `reminder-${r.id}`,
      title: r.title,
      description: 'Due today — one small action keeps the week calm.',
      urgency: 'today',
      dueLabel: 'Due today',
      ctaLabel: 'Open reminders',
      ctaPath: ROUTES.REMINDERS,
    };
  }

  const soon = open
    .filter((r) => getReminderStatus(r) === 'upcoming')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  if (soon[0]) {
    const r = soon[0];
    const isVaccine = /vaccin|booster|shot/i.test(r.title + (r.category ?? ''));
    return {
      id: `reminder-${r.id}`,
      title: isVaccine ? `Vaccination coming up: ${r.title}` : r.title,
      description: 'Your next scheduled care item is on the horizon.',
      urgency: 'soon',
      dueLabel: formatDueLabel(r.dueDate),
      ctaLabel: 'View schedule',
      ctaPath: ROUTES.REMINDERS,
    };
  }

  if (documents.length === 0) {
    return {
      id: 'upload-doc',
      title: 'Upload your first vet document',
      description: 'A bill, vaccine certificate, or visit summary unlocks your timeline.',
      urgency: 'setup',
      ctaLabel: 'Upload document',
      ctaPath: ROUTES.SCAN,
    };
  }

  if (healthRecords.length === 0) {
    return {
      id: 'add-record',
      title: 'Add a health record',
      description: 'Vaccinations and visit notes build a complete care picture.',
      urgency: 'setup',
      ctaLabel: 'Add record',
      ctaPath: ROUTES.PET_PROFILE,
    };
  }

  return {
    id: 'all-clear',
    title: 'Nothing urgent right now',
    description: 'You are caught up. Enjoy a calm day with your pet.',
    urgency: 'calm',
    ctaLabel: 'View timeline',
    ctaPath: ROUTES.TIMELINE,
    isPositive: true,
  };
}
