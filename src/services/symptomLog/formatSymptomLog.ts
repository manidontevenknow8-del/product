import { formatHealthRecordDate } from '@/services/healthRecords/healthRecordMappers';
import type { SymptomLog } from './symptomLogTypes';

export function formatSymptomLogSummary(log: SymptomLog): string {
  const parts = [...log.symptoms];
  if (log.note?.trim()) parts.push(log.note.trim());
  return parts.join(' · ');
}

export function formatSymptomLogDate(log: SymptomLog): string {
  return formatHealthRecordDate(log.loggedAt.slice(0, 10));
}

export function formatSymptomLogDateTime(log: SymptomLog): string {
  const date = new Date(log.loggedAt);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
