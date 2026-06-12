import type { HealthRecord } from '@/services/healthRecords/healthRecordTypes';
import type { PetDocumentRecord } from '@/services/documents/documentTypes';
import { formatHealthRecordDate } from '@/services/healthRecords/healthRecordMappers';
import { MONTHLY_REPORT_IMG } from '@/data/monthlyReportImages';
import type { Reminder } from '@/types/reminder';
import type { DailyCheckIn } from '@/types/dailyCheckIn';
import { checkInsInMonth } from '@/services/dailyCheckIn';
import type {
  MonthlyPetLifeReport,
  MonthlyReportActivityItem,
  MonthlyReportEngineInput,
  MonthlyReportMilestone,
  MonthlyReportMetric,
  MonthlyReportStorySection,
} from '@/types/monthlyReport';

function parseMonthKey(monthKey: string): { year: number; monthIndex: number } {
  const match = monthKey.match(/^(\d{4})-(\d{2})$/);
  if (!match) throw new Error(`Invalid monthKey: ${monthKey}`);
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  return { year, monthIndex };
}

function monthRange(monthKey: string): { start: Date; endExclusive: Date; label: string } {
  const { year, monthIndex } = parseMonthKey(monthKey);
  const start = new Date(year, monthIndex, 1, 0, 0, 0, 0);
  const endExclusive = new Date(year, monthIndex + 1, 1, 0, 0, 0, 0);
  const label = start.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  return { start, endExclusive, label };
}

function inRange(iso: string | null | undefined, start: Date, endExclusive: Date): boolean {
  if (!iso) return false;
  const date = new Date(iso);
  return date >= start && date < endExclusive;
}

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function clampDelta(delta: number): number {
  if (!Number.isFinite(delta)) return 0;
  return Math.max(-99, Math.min(99, delta));
}

function scoreForMonth(
  history: { date: string; score: number }[],
  start: Date,
  endExclusive: Date,
): { start: number | null; end: number | null; delta: number | null } {
  const points = history
    .map((p) => ({ ...p, dateObj: new Date(`${p.date}T00:00:00`) }))
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  const inMonth = points.filter((p) => p.dateObj >= start && p.dateObj < endExclusive);
  if (inMonth.length === 0) return { start: null, end: null, delta: null };

  const first = inMonth[0]!.score;
  const last = inMonth[inMonth.length - 1]!.score;
  return { start: first, end: last, delta: clampDelta(last - first) };
}

function milestoneId(prefix: string, monthKey: string, suffix: string) {
  return `${prefix}:${monthKey}:${suffix}`;
}

function collectMilestones(args: {
  monthKey: string;
  remindersCompleted: Reminder[];
  healthRecordsAdded: HealthRecord[];
  documentsUploaded: PetDocumentRecord[];
  scoreDelta: number | null;
}): MonthlyReportMilestone[] {
  const { monthKey, remindersCompleted, healthRecordsAdded, documentsUploaded, scoreDelta } = args;
  const milestones: MonthlyReportMilestone[] = [];

  if (documentsUploaded.length >= 3) {
    milestones.push({
      id: milestoneId('docs', monthKey, 'vault_builder'),
      title: 'Vault builder',
      description: `Uploaded ${documentsUploaded.length} documents - your pet's story is getting richer.`,
    });
  }

  const vaccinations = healthRecordsAdded.filter((r) => r.recordType === 'vaccination').length;
  if (vaccinations > 0) {
    milestones.push({
      id: milestoneId('health', monthKey, 'vaccination'),
      title: 'Protection in progress',
      description: `Added ${vaccinations} vaccination record${vaccinations === 1 ? '' : 's'} this month.`,
    });
  }

  const weightRecords = healthRecordsAdded.filter((r) => r.recordType === 'weight').length;
  if (weightRecords > 0) {
    milestones.push({
      id: milestoneId('health', monthKey, 'weight'),
      title: 'Weight check milestone',
      description: `Logged ${weightRecords} weight update${weightRecords === 1 ? '' : 's'} - consistency matters.`,
    });
  }

  if (remindersCompleted.length >= 5) {
    milestones.push({
      id: milestoneId('reminders', monthKey, 'streak'),
      title: 'Routine streak',
      description: `Completed ${remindersCompleted.length} reminders - small moments, big impact.`,
    });
  }

  if (scoreDelta != null && scoreDelta >= 5) {
    milestones.push({
      id: milestoneId('score', monthKey, 'up'),
      title: 'PetCare Score breakthrough',
      description: `Your score rose by +${scoreDelta} points this month.`,
    });
  } else if (scoreDelta != null && scoreDelta <= -5) {
    milestones.push({
      id: milestoneId('score', monthKey, 'down'),
      title: 'A gentle reset',
      description: `Your score dipped by ${Math.abs(scoreDelta)} points - next month is a fresh start.`,
    });
  }

  return milestones.slice(0, 6);
}

function buildHighlights(args: {
  petName: string;
  remindersCompletedCount: number;
  documentsUploadedCount: number;
  healthRecordsAddedCount: number;
  dailyCheckInsCount: number;
  scoreDelta: number | null;
  monthLabel: string;
}): string[] {
  const {
    petName,
    remindersCompletedCount,
    documentsUploadedCount,
    healthRecordsAddedCount,
    dailyCheckInsCount,
    scoreDelta,
    monthLabel,
  } = args;

  const highlights: string[] = [];
  highlights.push(`${monthLabel} was a month of care for ${petName}.`);

  if (remindersCompletedCount > 0) {
    highlights.push(
      `You completed ${remindersCompletedCount} reminders - a steady routine builds confidence.`,
    );
  } else {
    highlights.push('No reminders were completed this month - next month is a clean slate.');
  }

  if (healthRecordsAddedCount > 0) {
    highlights.push(
      `You added ${healthRecordsAddedCount} health record${healthRecordsAddedCount === 1 ? '' : 's'} to keep the story accurate.`,
    );
  }

  if (documentsUploadedCount > 0) {
    highlights.push(
      `You saved ${documentsUploadedCount} document${documentsUploadedCount === 1 ? '' : 's'} in the vault for future visits.`,
    );
  }

  if (dailyCheckInsCount > 0) {
    highlights.push(
      `You logged ${dailyCheckInsCount} daily check-in${dailyCheckInsCount === 1 ? '' : 's'} - feeding and walks on record.`,
    );
  }

  if (scoreDelta != null) {
    if (scoreDelta > 0) highlights.push(`PetCare Score moved up by +${scoreDelta}.`);
    else if (scoreDelta < 0) highlights.push(`PetCare Score moved down by ${scoreDelta}.`);
    else highlights.push('PetCare Score held steady - consistency is a win.');
  }

  return highlights.slice(0, 6);
}

function buildMetrics(args: {
  remindersCompleted: number;
  healthRecordsAdded: number;
  documentsUploaded: number;
  dailyCheckIns: number;
  totalWalkKm: number;
  scoreDelta: number | null;
  scoreStart: number | null;
  scoreEnd: number | null;
}): MonthlyReportMetric[] {
  const {
    remindersCompleted,
    healthRecordsAdded,
    documentsUploaded,
    dailyCheckIns,
    totalWalkKm,
    scoreDelta,
    scoreStart,
    scoreEnd,
  } = args;

  const scoreValue =
    scoreDelta == null
      ? '-'
      : scoreStart != null && scoreEnd != null
        ? `${scoreStart} → ${scoreEnd} (${scoreDelta >= 0 ? '+' : ''}${scoreDelta})`
        : `${scoreDelta >= 0 ? '+' : ''}${scoreDelta}`;

  return [
    { label: 'Daily check-ins', value: String(dailyCheckIns), hint: 'Feeding & walk logs' },
    { label: 'Reminders completed', value: String(remindersCompleted), hint: 'Marked done this month' },
    { label: 'Health records added', value: String(healthRecordsAdded), hint: 'New entries in the profile' },
    { label: 'Documents uploaded', value: String(documentsUploaded), hint: 'Saved to your vault' },
    {
      label: 'Walk distance',
      value: totalWalkKm > 0 ? `${totalWalkKm} km` : '-',
      hint: 'Total logged this month',
    },
    {
      label: 'PetCare Score',
      value: scoreValue,
      hint: 'Change across the month from saved history',
    },
  ];
}

function buildNarrativeIntro(
  petName: string,
  monthLabel: string,
  totals: { reminders: number; health: number; docs: number },
): string {
  const activity = totals.reminders + totals.health + totals.docs;
  if (activity === 0) {
    return `${monthLabel} was a quieter chapter for ${petName} - a good time to plan gentle routines, log a wellness note, or scan a recent vet visit so next month's story has more to celebrate.`;
  }
  return `This is ${petName}'s PetClues life report for ${monthLabel} - a visual recap of the care you showed through reminders, health records, documents, and your PetCare Score journey. Every entry below is drawn from your real activity in the app.`;
}

function buildCareScoreNarrative(
  petName: string,
  score: { start: number | null; end: number | null; delta: number | null },
): string {
  if (score.start == null || score.end == null || score.delta == null) {
    return `We don't have enough PetCare Score snapshots for ${petName} this month yet. Keep using reminders and logging health updates - the score will start reflecting your rhythm.`;
  }
  if (score.delta > 0) {
    return `${petName}'s PetCare Score grew from ${score.start} to ${score.end} (+${score.delta}) - proof that small, steady actions compound into confidence.`;
  }
  if (score.delta < 0) {
    return `${petName}'s PetCare Score moved from ${score.start} to ${score.end} (${score.delta}). Life gets busy; use next month to rebuild one habit at a time.`;
  }
  return `${petName}'s PetCare Score held at ${score.end} all month - stability is its own kind of win.`;
}

function buildActivityItems(args: {
  remindersCompleted: Reminder[];
  healthRecordsAdded: HealthRecord[];
  documentsUploaded: PetDocumentRecord[];
  dailyCheckIns: DailyCheckIn[];
}): MonthlyReportActivityItem[] {
  const items: (MonthlyReportActivityItem & { sort: number })[] = [];

  for (const r of args.remindersCompleted) {
    if (!r.completedAt) continue;
    items.push({
      id: `reminder-${r.id}`,
      title: r.title,
      detail: 'Reminder completed',
      dateLabel: formatShortDate(r.completedAt),
      category: 'reminder',
      sort: new Date(r.completedAt).getTime(),
    });
  }

  for (const h of args.healthRecordsAdded) {
    items.push({
      id: `health-${h.id}`,
      title: h.title,
      detail: `${h.recordType.charAt(0).toUpperCase()}${h.recordType.slice(1)} record added`,
      dateLabel: formatHealthRecordDate(h.dateRecorded),
      category: 'health',
      sort: new Date(h.createdAt).getTime(),
    });
  }

  for (const d of args.documentsUploaded) {
    items.push({
      id: `doc-${d.id}`,
      title: d.fileName,
      detail: 'Uploaded to document vault',
      dateLabel: formatShortDate(d.uploadedAt),
      category: 'document',
      sort: new Date(d.uploadedAt).getTime(),
    });
  }

  for (const c of args.dailyCheckIns) {
    const walk =
      c.walkDistanceKm != null ? ` · ${c.walkDistanceKm} km walk` : '';
    items.push({
      id: `checkin-${c.id}`,
      title: c.feeding,
      detail: `Daily check-in${walk}`,
      dateLabel: formatShortDate(c.checkInDate),
      category: 'checkin',
      sort: new Date(`${c.checkInDate}T12:00:00`).getTime(),
    });
  }

  return items
    .sort((a, b) => b.sort - a.sort)
    .slice(0, 10)
    .map(({ sort: _s, ...rest }) => rest);
}

function buildStorySections(args: {
  petName: string;
  monthLabel: string;
  remindersCompleted: Reminder[];
  healthRecordsAdded: HealthRecord[];
  documentsUploaded: PetDocumentRecord[];
  monthCheckIns: DailyCheckIn[];
  totalWalkKm: number;
  score: { start: number | null; end: number | null; delta: number | null };
  highlights: string[];
}): MonthlyReportStorySection[] {
  const {
    petName,
    monthLabel,
    remindersCompleted,
    healthRecordsAdded,
    documentsUploaded,
    monthCheckIns,
    totalWalkKm,
    score,
    highlights,
  } = args;

  const reminderBullets = remindersCompleted.slice(0, 6).map((r) => {
    const when = r.completedAt ? formatShortDate(r.completedAt) : '';
    return when ? `${r.title} · completed ${when}` : r.title;
  });

  const healthBullets = healthRecordsAdded.slice(0, 6).map((h) => {
    const type = h.recordType.replace(/_/g, ' ');
    return `${h.title} · ${type} · ${formatHealthRecordDate(h.dateRecorded)}`;
  });

  const docBullets = documentsUploaded.slice(0, 6).map(
    (d) => `${d.fileName} · uploaded ${formatShortDate(d.uploadedAt)}`,
  );

  const checkInBullets = monthCheckIns.slice(0, 6).map((c) => {
    const walk = c.walkDistanceKm != null ? ` · ${c.walkDistanceKm} km` : '';
    return `${formatShortDate(c.checkInDate)} · ${c.feeding}${walk}`;
  });

  const sections: MonthlyReportStorySection[] = [
    {
      id: 'overview',
      title: 'Month at a glance',
      intro: `${monthLabel} in one view`,
      body: `Across ${monthLabel}, you logged ${monthCheckIns.length} daily check-in${monthCheckIns.length === 1 ? '' : 's'}, ${remindersCompleted.length} completed reminder${remindersCompleted.length === 1 ? '' : 's'}, ${healthRecordsAdded.length} health record${healthRecordsAdded.length === 1 ? '' : 's'}, and ${documentsUploaded.length} vault document${documentsUploaded.length === 1 ? '' : 's'} for ${petName}.`,
      image: MONTHLY_REPORT_IMG.overview,
      imageAlt: 'Pet care score overview',
      bullets: highlights.slice(0, 4),
    },
    {
      id: 'checkins',
      title: 'Daily rituals',
      intro: 'Feeding & walks',
      body:
        monthCheckIns.length > 0
          ? `${petName}'s daily rhythm shows up in ${monthCheckIns.length} check-in${monthCheckIns.length === 1 ? '' : 's'}${totalWalkKm > 0 ? ` and ${totalWalkKm} km of walks logged` : ''}.`
          : `No daily check-ins in ${monthLabel} yet - log feeding and walks from your dashboard to enrich next month's story.`,
      image: MONTHLY_REPORT_IMG.checkIn,
      imageAlt: 'Daily feeding and walk check-in',
      bullets: checkInBullets.length > 0 ? checkInBullets : undefined,
    },
    {
      id: 'reminders',
      title: 'Routine & reminders',
      intro: 'The rhythm of daily care',
      body:
        remindersCompleted.length > 0
          ? `You closed ${remindersCompleted.length} reminder${remindersCompleted.length === 1 ? '' : 's'} this month - each one a small promise kept for ${petName}.`
          : `No reminders were marked complete in ${monthLabel}. Consider setting gentle nudges for meds, grooming, or vet follow-ups.`,
      image: MONTHLY_REPORT_IMG.reminders,
      imageAlt: 'Reminders and routines',
      bullets: reminderBullets.length > 0 ? reminderBullets : undefined,
    },
    {
      id: 'health',
      title: 'Health & wellness',
      intro: 'Records that tell the truth',
      body:
        healthRecordsAdded.length > 0
          ? `${healthRecordsAdded.length} new health ${healthRecordsAdded.length === 1 ? 'entry' : 'entries'} joined ${petName}'s profile - vaccinations, weights, diagnoses, and notes that clinics will thank you for.`
          : `No new health records were added in ${monthLabel}. Scan a vet bill or add a quick wellness note to enrich next month's report.`,
      image: MONTHLY_REPORT_IMG.health,
      imageAlt: 'Health records',
      bullets: healthBullets.length > 0 ? healthBullets : undefined,
    },
    {
      id: 'vault',
      title: 'Document vault',
      intro: 'Paper trails, preserved',
      body:
        documentsUploaded.length > 0
          ? `You archived ${documentsUploaded.length} document${documentsUploaded.length === 1 ? '' : 's'} - bills, labels, and reports that stay searchable when you need them.`
          : `The vault stayed quiet this month. Upload a vaccine certificate or insurance letter anytime from Scan.`,
      image: MONTHLY_REPORT_IMG.vault,
      imageAlt: 'Document vault',
      bullets: docBullets.length > 0 ? docBullets : undefined,
    },
    {
      id: 'score',
      title: 'PetCare Score journey',
      intro: 'How consistency adds up',
      body: buildCareScoreNarrative(petName, score),
      image: MONTHLY_REPORT_IMG.journey,
      imageAlt: 'Care journey',
      bullets:
        score.start != null && score.end != null
          ? [
              `Month open: ${score.start}`,
              `Month close: ${score.end}`,
              score.delta != null
                ? `Net change: ${score.delta >= 0 ? '+' : ''}${score.delta}`
                : 'Net change: -',
            ]
          : undefined,
    },
  ];

  return sections;
}

export function MonthlyReportEngine(input: MonthlyReportEngineInput): MonthlyPetLifeReport {
  const { start, endExclusive, label } = monthRange(input.monthKey);

  const remindersCompleted = input.reminders.filter(
    (r) => r.petId === input.petId && Boolean(r.completedAt) && inRange(r.completedAt, start, endExclusive),
  );

  const healthRecordsAdded = input.healthRecords.filter(
    (r) => r.petId === input.petId && inRange(r.createdAt, start, endExclusive),
  );

  const documentsUploaded = input.documents.filter(
    (d) => d.petId === input.petId && inRange(d.uploadedAt, start, endExclusive),
  );

  const score = scoreForMonth(input.petCareScoreHistory, start, endExclusive);

  const milestones = collectMilestones({
    monthKey: input.monthKey,
    remindersCompleted,
    healthRecordsAdded,
    documentsUploaded,
    scoreDelta: score.delta,
  });

  const monthCheckIns = checkInsInMonth(
    input.dailyCheckIns.filter((c) => c.petId === input.petId),
    input.monthKey,
  );
  const totalWalkKm = Math.round(
    monthCheckIns
      .map((c) => c.walkDistanceKm)
      .filter((v): v is number => v != null && Number.isFinite(v))
      .reduce((sum, v) => sum + v, 0) * 10,
  ) / 10;

  const highlights = buildHighlights({
    petName: input.petName,
    remindersCompletedCount: remindersCompleted.length,
    healthRecordsAddedCount: healthRecordsAdded.length,
    documentsUploadedCount: documentsUploaded.length,
    dailyCheckInsCount: monthCheckIns.length,
    scoreDelta: score.delta,
    monthLabel: label,
  });

  const metrics = buildMetrics({
    remindersCompleted: remindersCompleted.length,
    healthRecordsAdded: healthRecordsAdded.length,
    documentsUploaded: documentsUploaded.length,
    dailyCheckIns: monthCheckIns.length,
    totalWalkKm,
    scoreDelta: score.delta,
    scoreStart: score.start,
    scoreEnd: score.end,
  });

  const narrativeIntro = buildNarrativeIntro(input.petName, label, {
    reminders: remindersCompleted.length,
    health: healthRecordsAdded.length,
    docs: documentsUploaded.length,
  });

  const careScoreNarrative = buildCareScoreNarrative(input.petName, score);

  const activityItems = buildActivityItems({
    remindersCompleted,
    healthRecordsAdded,
    documentsUploaded,
    dailyCheckIns: monthCheckIns,
  });

  const storySections = buildStorySections({
    petName: input.petName,
    monthLabel: label,
    remindersCompleted,
    healthRecordsAdded,
    documentsUploaded,
    monthCheckIns,
    totalWalkKm,
    score,
    highlights,
  });

  return {
    id: crypto.randomUUID(),
    petId: input.petId,
    petName: input.petName,
    monthKey: input.monthKey,
    monthLabel: label,
    generatedAt: new Date().toISOString(),
    remindersCompleted: remindersCompleted.length,
    healthRecordsAdded: healthRecordsAdded.length,
    documentsUploaded: documentsUploaded.length,
    dailyCheckInsCount: monthCheckIns.length,
    totalWalkKm,
    petCareScore: score,
    milestones,
    highlights,
    metrics,
    narrativeIntro,
    careScoreNarrative,
    storySections,
    activityItems,
  };
}
