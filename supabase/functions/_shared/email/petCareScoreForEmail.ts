/**
 * Pet Care Score + weekly insight for digest emails.
 * Mirrors app logic in petCareScoreEngine.ts without React/route dependencies.
 */

type ScoreFactorId =
  | 'profile_completeness'
  | 'health_records_count'
  | 'document_completeness'
  | 'upcoming_reminder_coverage'
  | 'reminder_completion_rate'
  | 'passport_completeness';

type FactorStatus = 'excellent' | 'good' | 'fair' | 'needs_attention';

type ScoreFactor = {
  id: ScoreFactorId;
  label: string;
  score: number;
  maxContribution: number;
  status: FactorStatus;
  description: string;
  suggestion?: string;
};

export type WeeklyInsightEmail = {
  title: string;
  message: string;
  highlight?: string;
};

export type PetCareScoreEmailSummary = {
  score: number;
  scoreLabel: string;
  trend: 'up' | 'down' | 'stable';
  trendDelta: number;
  weeklyInsight: WeeklyInsightEmail;
};

type PetRow = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  birth_date: string | null;
  weight: string | null;
  gender: string | null;
  photo_url: string | null;
};

type HealthRecordRow = {
  pet_id: string;
  record_type: string;
  severity: string | null;
};

type ReminderRow = {
  pet_id: string;
  due_date: string;
  completed_at: string | null;
};

type CheckInRow = {
  pet_id: string;
  check_in_date: string;
};

type SnapshotRow = {
  pet_id: string;
  score: number;
  factors_json: Record<string, number> | null;
  recorded_at: string;
};

const FACTOR_WEIGHT = 100 / 6;

const FACTOR_LABELS: Record<ScoreFactorId, string> = {
  profile_completeness: 'Profile completeness',
  health_records_count: 'Health records',
  document_completeness: 'Document completeness',
  upcoming_reminder_coverage: 'Upcoming reminder coverage',
  reminder_completion_rate: 'Reminder completion rate',
  passport_completeness: 'Passport completeness',
};

function statusFromScore(score: number): FactorStatus {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'needs_attention';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Getting Started';
}

function computeOverallFromFactors(factors: ScoreFactor[]): number {
  const totalWeight = factors.reduce((sum, factor) => sum + factor.maxContribution, 0);
  if (totalWeight === 0) return 0;
  const weighted = factors.reduce((sum, factor) => sum + factor.score * factor.maxContribution, 0);
  return Math.round(weighted / totalWeight);
}

function daysUntilDueUtc(dueDate: string, today: Date): number {
  const [y, m, d] = dueDate.split('-').map(Number);
  const due = Date.UTC(y, m - 1, d);
  const t = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.round((due - t) / 86_400_000);
}

function reminderStatus(
  reminder: ReminderRow,
  today: Date,
): 'completed' | 'overdue' | 'due_today' | 'upcoming' {
  if (reminder.completed_at) return 'completed';
  const days = daysUntilDueUtc(reminder.due_date, today);
  if (days < 0) return 'overdue';
  if (days === 0) return 'due_today';
  return 'upcoming';
}

function scoreProfileCompleteness(pet: PetRow): number {
  let points = 0;
  if (pet.name?.trim()) points += 20;
  if (pet.species) points += 15;
  if (pet.breed?.trim()) points += 15;
  if (pet.birth_date) points += 15;
  if (pet.weight?.trim()) points += 15;
  if (pet.gender) points += 10;
  if (pet.photo_url) points += 10;
  return points;
}

function scoreHealthRecordsCount(count: number): number {
  if (count === 0) return 0;
  if (count === 1) return 40;
  if (count <= 3) return 60;
  if (count <= 5) return 80;
  return 100;
}

function scoreDocumentCompleteness(count: number): number {
  if (count === 0) return 0;
  if (count === 1) return 50;
  if (count === 2) return 70;
  if (count <= 4) return 85;
  return 100;
}

function scoreUpcomingReminderCoverage(reminders: ReminderRow[], today: Date): number {
  const active = reminders.filter((r) => !r.completed_at);
  if (active.length === 0) return 0;

  const covered = active.filter((r) => {
    const status = reminderStatus(r, today);
    return status === 'upcoming' || status === 'due_today';
  });

  if (covered.length === 0) return 25;
  if (covered.length === 1) return 60;
  if (covered.length === 2) return 80;
  return 100;
}

function scoreReminderCompletionRate(reminders: ReminderRow[]): number {
  if (reminders.length === 0) return 0;
  const completed = reminders.filter((r) => r.completed_at).length;
  return Math.round((completed / reminders.length) * 100);
}

function scorePassportCompleteness(
  records: HealthRecordRow[],
  documentCount: number,
  checkInCount: number,
  hasWeight: boolean,
): number {
  let points = 0;
  if (records.some((r) => r.record_type === 'vaccination')) points += 22;
  if (records.some((r) => r.record_type === 'allergy')) points += 12;
  if (records.some((r) => r.record_type === 'medication')) points += 18;
  if (records.some((r) => r.record_type === 'diagnosis')) points += 12;
  if (records.some((r) => r.record_type === 'wellness')) points += 8;
  if (documentCount > 0) points += 13;
  if (records.some((r) => r.record_type === 'weight') || hasWeight) points += 8;
  if (checkInCount > 0) points += 7;
  return Math.min(100, points);
}

function buildFactor(
  id: ScoreFactorId,
  score: number,
  description: string,
  suggestion?: string,
): ScoreFactor {
  return {
    id,
    label: FACTOR_LABELS[id],
    score,
    maxContribution: Math.round(FACTOR_WEIGHT),
    status: statusFromScore(score),
    description,
    suggestion,
  };
}

function compareFactorChanges(
  factors: ScoreFactor[],
  previous?: Partial<Record<string, number>>,
): { increased: string[]; decreased: string[] } {
  const increased: string[] = [];
  const decreased: string[] = [];
  if (!previous) return { increased, decreased };

  for (const factor of factors) {
    const prev = previous[factor.id];
    if (prev === undefined) continue;
    const delta = factor.score - prev;
    if (delta >= 5) {
      increased.push(`${factor.label} improved (+${delta} pts)`);
    } else if (delta <= -5) {
      decreased.push(`${factor.label} dipped (${delta} pts)`);
    }
  }

  return { increased, decreased };
}

function buildWeeklyInsight(
  petName: string,
  snapshot: { score: number; label: string; trend: 'up' | 'down' | 'stable'; trendDelta: number },
  changes: { increased: string[]; decreased: string[] },
  weakest: ScoreFactor | undefined,
): WeeklyInsightEmail {
  if (changes.increased.length > 0 && snapshot.trend === 'up') {
    return {
      title: 'Score moving up',
      message: `${petName}'s care score is ${snapshot.score} (${snapshot.label.toLowerCase()}). ${changes.increased[0] ?? 'Recent activity strengthened your score.'}`,
      highlight: snapshot.trendDelta > 0 ? `+${snapshot.trendDelta} pts` : undefined,
    };
  }

  if (changes.decreased.length > 0) {
    return {
      title: 'A few areas slipped',
      message: `${changes.decreased[0]}. ${weakest?.suggestion ?? 'Focus on one improvement this week.'}`,
      highlight:
        snapshot.trend === 'down'
          ? `-${snapshot.trendDelta} pts`
          : snapshot.trendDelta > 0
            ? `+${snapshot.trendDelta} pts`
            : undefined,
    };
  }

  return {
    title: 'Steady care',
    message: weakest
      ? `${petName}'s score is ${snapshot.score}. ${weakest.suggestion ?? 'Keep building your care record.'}`
      : `${petName}'s care organization looks solid. Keep up the consistent tracking.`,
    highlight: weakest ? 'Top opportunity' : undefined,
  };
}

function snapshotAtOrBefore(snapshots: SnapshotRow[], isoDate: string): SnapshotRow | undefined {
  const target = isoDate.slice(0, 10);
  let match: SnapshotRow | undefined;
  for (const row of snapshots) {
    const date = row.recorded_at.slice(0, 10);
    if (date <= target) match = row;
    else break;
  }
  return match;
}

export function buildPetCareScoreEmailSummary(input: {
  pet: PetRow;
  healthRecords: HealthRecordRow[];
  documentCount: number;
  reminders: ReminderRow[];
  checkIns: CheckInRow[];
  snapshots: SnapshotRow[];
  today: Date;
}): PetCareScoreEmailSummary | null {
  const { pet, healthRecords, documentCount, reminders, checkIns, snapshots, today } = input;
  const petRecords = healthRecords.filter((r) => r.pet_id === pet.id);
  const petReminders = reminders.filter((r) => r.pet_id === pet.id);
  const petCheckIns = checkIns.filter((c) => c.pet_id === pet.id);
  const petSnapshots = snapshots
    .filter((s) => s.pet_id === pet.id)
    .sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));

  const healthCount = petRecords.length;
  const profileScore = scoreProfileCompleteness(pet);
  const healthScore = scoreHealthRecordsCount(healthCount);
  const documentScore = scoreDocumentCompleteness(documentCount);
  const coverageScore = scoreUpcomingReminderCoverage(petReminders, today);
  const completionScore = scoreReminderCompletionRate(petReminders);
  const passportScore = scorePassportCompleteness(
    petRecords,
    documentCount,
    petCheckIns.length,
    Boolean(pet.weight?.trim()),
  );

  const factors: ScoreFactor[] = [
    buildFactor(
      'profile_completeness',
      profileScore,
      `${profileScore}% of profile fields complete.`,
      profileScore < 85 ? 'Add breed, weight, photo, or birth date to complete the profile.' : undefined,
    ),
    buildFactor(
      'health_records_count',
      healthScore,
      healthCount === 0
        ? 'No health records logged yet.'
        : `${healthCount} health record${healthCount === 1 ? '' : 's'} on file.`,
      healthScore < 70 ? 'Add vaccinations, medications, or wellness visits from the profile.' : undefined,
    ),
    buildFactor(
      'document_completeness',
      documentScore,
      documentCount === 0
        ? 'No documents uploaded yet.'
        : `${documentCount} document${documentCount === 1 ? '' : 's'} stored in vault.`,
      documentScore < 70 ? 'Upload a vet bill, vaccine card, or prescription from Scan.' : undefined,
    ),
    buildFactor(
      'upcoming_reminder_coverage',
      coverageScore,
      coverageScore === 0
        ? 'No active reminders scheduled.'
        : 'Upcoming care reminders are on the calendar.',
      coverageScore < 70 ? 'Create reminders for vaccinations, meds, or vet visits.' : undefined,
    ),
    buildFactor(
      'reminder_completion_rate',
      completionScore,
      petReminders.length === 0
        ? 'No reminder history yet.'
        : `${completionScore}% of reminders marked complete.`,
      completionScore < 70 ? 'Mark finished reminders done to track consistency.' : undefined,
    ),
    buildFactor(
      'passport_completeness',
      passportScore,
      passportScore >= 85
        ? 'Emergency passport sections are well populated.'
        : 'Passport is missing key emergency details.',
      passportScore < 85
        ? 'Fill vaccinations, allergies, medications, daily check-ins, and weight on the passport.'
        : undefined,
    ),
  ];

  const overallScore = computeOverallFromFactors(factors);
  const helping = factors.filter((f) => f.status === 'excellent' || f.status === 'good');
  const improving = factors.filter((f) => f.status === 'fair' || f.status === 'needs_attention');
  const weakest = improving.sort((a, b) => a.score - b.score)[0];

  const weekAgo = new Date(today);
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);
  const weekAgoIso = weekAgo.toISOString().slice(0, 10);

  const previousSnapshot =
    snapshotAtOrBefore(petSnapshots, weekAgoIso) ??
    (petSnapshots.length >= 2 ? petSnapshots[petSnapshots.length - 2] : undefined);

  const previousOverall = previousSnapshot?.score;
  const previousFactors = previousSnapshot?.factors_json ?? undefined;

  let trendDelta = 0;
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (previousOverall !== undefined) {
    trendDelta = overallScore - previousOverall;
    if (trendDelta > 0) trend = 'up';
    else if (trendDelta < 0) trend = 'down';
  }

  const changes = compareFactorChanges(factors, previousFactors);
  const snapshot = {
    score: overallScore,
    label: getScoreLabel(overallScore),
    trend,
    trendDelta: Math.abs(trendDelta),
  };

  if (overallScore === 0 && healthCount === 0 && documentCount === 0 && petCheckIns.length === 0) {
    return null;
  }

  return {
    ...snapshot,
    weeklyInsight: buildWeeklyInsight(pet.name, snapshot, changes, weakest),
  };
}
