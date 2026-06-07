import type { Reminder } from '@/types/reminder';
import type {
  AttentionItem,
  CareRecommendation,
  FactorStatus,
  HealthInsight,
  PetCareScoreData,
  PositiveProgress,
  ScoreFactor,
  ScoreFactorId,
  ScoreHistoryPoint,
  WeeklyInsight,
} from '@/types/petCareScore';
import { buildPassportSummary } from '@/services/passport/passportSummaryService';
import { getReminderStatus } from '@/utils/reminderUtils';
import {
  computeOverallFromFactors,
  getScoreLabel,
} from '@/utils/petCareScoreUtils';
import type { PetCareScoreInput, StoredScoreSnapshot } from './petCareScoreTypes';
import { formatPassportUpdatedAt } from '@/services/pets/petUtils';

const HISTORY_KEY_PREFIX = 'petclues_score_history_';
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

function scoreProfileCompleteness(pet: PetCareScoreInput['pet']): number {
  let points = 0;
  if (pet.name.trim()) points += 20;
  if (pet.species) points += 15;
  if (pet.breed?.trim()) points += 15;
  if (pet.birthDate) points += 15;
  if (pet.weight?.trim()) points += 15;
  if (pet.gender) points += 10;
  if (pet.photoUrl) points += 10;
  return points;
}

function scoreHealthRecordsCount(records: PetCareScoreInput['healthRecords']): number {
  const count = records.length;
  if (count === 0) return 0;
  if (count === 1) return 40;
  if (count <= 3) return 60;
  if (count <= 5) return 80;
  return 100;
}

function scoreDocumentCompleteness(documents: PetCareScoreInput['documents']): number {
  const count = documents.length;
  if (count === 0) return 0;
  if (count === 1) return 50;
  if (count === 2) return 70;
  if (count <= 4) return 85;
  return 100;
}

function scoreUpcomingReminderCoverage(reminders: Reminder[]): number {
  const active = reminders.filter((r) => !r.completedAt);
  if (active.length === 0) return 0;

  const covered = active.filter((r) => {
    const status = getReminderStatus(r);
    return status === 'upcoming' || status === 'due_today';
  });

  if (covered.length === 0) return 25;
  if (covered.length === 1) return 60;
  if (covered.length === 2) return 80;
  return 100;
}

function scoreReminderCompletionRate(reminders: Reminder[]): number {
  if (reminders.length === 0) return 0;
  const completed = reminders.filter((r) => r.completedAt).length;
  return Math.round((completed / reminders.length) * 100);
}

function scorePassportCompleteness(passport: PetCareScoreInput['passport']): number {
  let points = 0;
  if (passport.vaccinations.length > 0) points += 25;
  if (passport.allergies.length > 0) points += 15;
  if (passport.medications.length > 0) points += 20;
  if (passport.conditions.length > 0) points += 15;
  if (passport.emergencyNotes !== 'No emergency notes recorded.') points += 10;
  if (passport.documents.length > 0) points += 15;
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

function loadHistory(petId: string): StoredScoreSnapshot[] {
  try {
    const raw = localStorage.getItem(`${HISTORY_KEY_PREFIX}${petId}`);
    return raw ? (JSON.parse(raw) as StoredScoreSnapshot[]) : [];
  } catch {
    return [];
  }
}

/** Exposed for timeline milestones and analytics */
export function loadPetCareScoreHistory(petId: string): StoredScoreSnapshot[] {
  return loadHistory(petId);
}

function saveHistory(petId: string, snapshots: StoredScoreSnapshot[]) {
  localStorage.setItem(`${HISTORY_KEY_PREFIX}${petId}`, JSON.stringify(snapshots.slice(-12)));
}

function appendHistory(
  petId: string,
  score: number,
  factorScores: Record<string, number>,
): StoredScoreSnapshot[] {
  const history = loadHistory(petId);
  const today = new Date().toISOString().slice(0, 10);
  const last = history[history.length - 1];

  if (last?.date === today && last.score === score) return history;

  const next = [...history, { date: today, score, factorScores }];
  saveHistory(petId, next);
  return next;
}

function historyToChart(history: StoredScoreSnapshot[]): ScoreHistoryPoint[] {
  if (history.length === 0) return [{ date: 'Today', score: 0, label: 'Today' }];

  return history.slice(-6).map((point, index, arr) => {
    const date = new Date(`${point.date}T00:00:00`);
    const label =
      index === arr.length - 1
        ? 'Today'
        : date.toLocaleDateString(undefined, { month: 'short' });
    return { date: point.date, score: point.score, label };
  });
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

function buildRecommendations(factors: ScoreFactor[]): CareRecommendation[] {
  const recs: CareRecommendation[] = [];

  for (const factor of factors) {
    if (factor.status === 'excellent') continue;
    if (!factor.suggestion) continue;

    const paths: Partial<Record<ScoreFactorId, { label: string; path: string }>> = {
      profile_completeness: { label: 'Edit profile', path: '/pet-profile' },
      health_records_count: { label: 'Add health record', path: '/pet-profile' },
      document_completeness: { label: 'Upload document', path: '/scan' },
      upcoming_reminder_coverage: { label: 'Add reminder', path: '/reminders?create=true' },
      reminder_completion_rate: { label: 'View reminders', path: '/reminders' },
      passport_completeness: { label: 'Open passport', path: '/passport' },
    };

    const action = paths[factor.id];
    recs.push({
      id: `rec-${factor.id}`,
      title: factor.label,
      description: factor.suggestion,
      impact: factor.status === 'needs_attention' ? 'high' : factor.status === 'fair' ? 'medium' : 'low',
      actionLabel: action?.label,
      actionPath: action?.path,
    });
  }

  return recs.slice(0, 4);
}

function buildWeeklyInsight(
  petName: string,
  snapshot: PetCareScoreData['snapshot'],
  changes: { increased: string[]; decreased: string[] },
  weakest: ScoreFactor | undefined,
): WeeklyInsight {
  if (changes.increased.length > 0 && snapshot.trend === 'up') {
    return {
      id: 'weekly-trend-up',
      title: 'Score moving up',
      message: `${petName}'s care score is ${snapshot.score} (${snapshot.label.toLowerCase()}). ${changes.increased[0] ?? 'Recent activity strengthened your score.'}`,
      highlight: snapshot.trendDelta > 0 ? `+${snapshot.trendDelta} pts` : undefined,
    };
  }

  if (changes.decreased.length > 0) {
    return {
      id: 'weekly-trend-down',
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
    id: 'weekly-steady',
    title: 'Steady care',
    message: weakest
      ? `${petName}'s score is ${snapshot.score}. ${weakest.suggestion ?? 'Keep building your care record.'}`
      : `${petName}'s care organization looks solid. Keep up the consistent tracking.`,
    highlight: weakest ? 'Top opportunity' : undefined,
  };
}

export function computePetCareScore(input: PetCareScoreInput): PetCareScoreData {
  const profileScore = scoreProfileCompleteness(input.pet);
  const healthScore = scoreHealthRecordsCount(input.healthRecords);
  const documentScore = scoreDocumentCompleteness(input.documents);
  const coverageScore = scoreUpcomingReminderCoverage(input.reminders);
  const completionScore = scoreReminderCompletionRate(input.reminders);
  const passportScore = scorePassportCompleteness(input.passport);

  const factors: ScoreFactor[] = [
    buildFactor(
      'profile_completeness',
      profileScore,
      profileScore >= 85
        ? 'Core profile fields are filled in.'
        : `${profileScore}% of profile fields complete.`,
      profileScore < 85 ? 'Add breed, weight, photo, or birth date to complete the profile.' : undefined,
    ),
    buildFactor(
      'health_records_count',
      healthScore,
      input.healthRecords.length === 0
        ? 'No health records logged yet.'
        : `${input.healthRecords.length} health record${input.healthRecords.length === 1 ? '' : 's'} on file.`,
      healthScore < 70 ? 'Add vaccinations, medications, or wellness visits from the profile.' : undefined,
    ),
    buildFactor(
      'document_completeness',
      documentScore,
      input.documents.length === 0
        ? 'No documents uploaded yet.'
        : `${input.documents.length} document${input.documents.length === 1 ? '' : 's'} stored in vault.`,
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
      input.reminders.length === 0
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
        ? 'Fill vaccinations, allergies, medications, and notes on the passport.'
        : undefined,
    ),
  ];

  const overallScore = computeOverallFromFactors(factors);
  const factorScores = Object.fromEntries(factors.map((f) => [f.id, f.score]));

  const historyBefore = loadHistory(input.pet.id);
  const previousOverall =
    input.previousOverallScore ?? historyBefore[historyBefore.length - 1]?.score;
  const previousFactors =
    input.previousFactorScores ?? historyBefore[historyBefore.length - 1]?.factorScores;

  const history = appendHistory(input.pet.id, overallScore, factorScores);
  const chartHistory = historyToChart(history);

  let trendDelta = 0;
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (previousOverall !== undefined) {
    trendDelta = overallScore - previousOverall;
    if (trendDelta > 0) trend = 'up';
    else if (trendDelta < 0) trend = 'down';
  }

  const monthAgo = history.length >= 2 ? history[Math.max(0, history.length - 2)] : null;
  if (monthAgo && trend === 'stable') {
    trendDelta = overallScore - monthAgo.score;
    if (trendDelta > 0) trend = 'up';
    else if (trendDelta < 0) trend = 'down';
  }

  const changes = compareFactorChanges(factors, previousFactors);
  const helping = factors.filter((f) => f.status === 'excellent' || f.status === 'good');
  const improving = factors.filter((f) => f.status === 'fair' || f.status === 'needs_attention');
  const weakest = improving.sort((a, b) => a.score - b.score)[0];

  const snapshot = {
    score: overallScore,
    label: getScoreLabel(overallScore),
    summary: buildSummary(overallScore, helping.length, improving.length),
    trend,
    trendDelta: Math.abs(trendDelta),
    lastUpdated: formatPassportUpdatedAt(new Date().toISOString()),
  };

  const insights: HealthInsight[] = [
    ...helping.slice(0, 2).map((f, i) => ({
      id: `ins-pos-${i}`,
      message: f.description,
      type: 'positive' as const,
      category: f.label,
    })),
    ...improving.slice(0, 2).map((f, i) => ({
      id: `ins-sug-${i}`,
      message: f.suggestion ?? f.description,
      type: 'suggestion' as const,
      category: f.label,
    })),
  ];

  const positiveProgress: PositiveProgress[] = [
    ...changes.increased.map((msg, i) => ({ id: `pos-${i}`, message: msg })),
    ...(helping.length >= 3
      ? [{ id: 'pos-strong', message: `${helping.length} care areas are in great shape.` }]
      : []),
  ];

  const attentionItems: AttentionItem[] = improving.slice(0, 3).map((f) => ({
    id: `att-${f.id}`,
    title: f.label,
    description: f.suggestion ?? f.description,
    gentle: f.status !== 'needs_attention',
  }));

  const suggestions = improving
    .map((f) => f.suggestion)
    .filter((s): s is string => Boolean(s))
    .slice(0, 3);

  return {
    snapshot,
    factors,
    breakdown: {
      helping,
      improving,
      suggestions,
      increasedBecause: changes.increased,
      decreasedBecause: changes.decreased,
    },
    history: chartHistory,
    insights,
    recommendations: buildRecommendations(improving),
    positiveProgress,
    attentionItems,
    weeklyInsight: buildWeeklyInsight(input.pet.name, snapshot, changes, weakest),
  };
}

function buildSummary(score: number, helpingCount: number, improvingCount: number): string {
  if (score >= 85) {
    return `${helpingCount} areas are strong${improvingCount > 0 ? ` · ${improvingCount} ready to improve` : '.'}`;
  }
  if (score >= 60) {
    return 'Solid foundation — targeted updates will lift your score quickly.';
  }
  return 'Getting started — add profile details, records, and reminders to build momentum.';
}

/** Convenience wrapper when passport is not pre-built. */
export function computePetCareScoreFromSources(
  input: Omit<PetCareScoreInput, 'passport'>,
): PetCareScoreData {
  const passport = buildPassportSummary(input.pet, input.healthRecords, input.documents);
  return computePetCareScore({ ...input, passport });
}

export function clearScoreHistory(petId: string) {
  localStorage.removeItem(`${HISTORY_KEY_PREFIX}${petId}`);
}
