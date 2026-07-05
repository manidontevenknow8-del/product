import type { ScoreFactor, ScoreFactorId } from '@/types/petCareScore';

export type ScoreDisplayMetric = {
  id: string;
  label: string;
  value: number;
};

export function getFactorScore(factors: ScoreFactor[], id: ScoreFactorId): number {
  return factors.find((factor) => factor.id === id)?.score ?? 0;
}

/**
 * Compact score bars for Dashboard and Insights — derived only from petCareScoreEngine factors.
 * Vaccination coverage is reflected in passport_completeness (not a separate formula).
 */
export function buildScoreDisplayMetrics(factors: ScoreFactor[]): ScoreDisplayMetric[] {
  const reminderPct = Math.round(
    (getFactorScore(factors, 'upcoming_reminder_coverage') +
      getFactorScore(factors, 'reminder_completion_rate')) /
      2,
  );

  return [
    {
      id: 'health_records_count',
      label: 'Health records',
      value: getFactorScore(factors, 'health_records_count'),
    },
    {
      id: 'document_completeness',
      label: 'Documents',
      value: getFactorScore(factors, 'document_completeness'),
    },
    {
      id: 'reminders',
      label: 'Reminders on track',
      value: reminderPct,
    },
    {
      id: 'passport_completeness',
      label: 'Passport & vaccines',
      value: getFactorScore(factors, 'passport_completeness'),
    },
  ];
}
