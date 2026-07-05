import type { WeeklyPetSummary } from './types.ts';
import { computeCheckInStreak } from './checkInStreak.ts';
import type { PetCareScoreEmailSummary } from './petCareScoreForEmail.ts';

type ReminderRow = {
  id: string;
  pet_id: string;
  title: string;
  category: string;
  due_date: string;
};

type PetRow = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  photo_url: string | null;
};

type CheckInRow = {
  pet_id: string;
  check_in_date: string;
};

type StreakCheckInRow = {
  pet_id: string;
  check_in_date: string;
};

function normalizePhotoUrlForEmail(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('data:')) return null;
  if (trimmed.startsWith('https://')) return trimmed;
  return null;
}

function getAvatarInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return trimmed.slice(0, 2).toUpperCase();
}

function formatSpeciesLabel(species: string, breed: string | null): string {
  const speciesLabel = species.charAt(0).toUpperCase() + species.slice(1);
  if (breed?.trim()) return `${speciesLabel} · ${breed.trim()}`;
  return speciesLabel;
}

export function daysUntilDue(dueDate: string, today: Date): number {
  const [y, m, d] = dueDate.split('-').map(Number);
  const due = Date.UTC(y, m - 1, d);
  const t = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.round((due - t) / 86_400_000);
}

export function formatDueLabel(dueDate: string, today: Date): string {
  const diff = daysUntilDue(dueDate, today);
  if (diff < 0) {
    const days = Math.abs(diff);
    return days === 1 ? '1 day overdue' : `${days} days overdue`;
  }
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Tomorrow';
  if (diff <= 7) return `In ${diff} days`;
  return dueDate;
}

export function buildWeeklyPetSummaries(input: {
  pets: PetRow[];
  reminders: ReminderRow[];
  checkIns: CheckInRow[];
  streakCheckIns?: StreakCheckInRow[];
  careScoresByPetId?: Record<string, PetCareScoreEmailSummary | null | undefined>;
  today: Date;
  baseUrl: string;
}): WeeklyPetSummary[] {
  const { pets, reminders, checkIns, streakCheckIns, careScoresByPetId, today, baseUrl } = input;
  const weekAgo = new Date(today);
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);
  const weekAgoIso = weekAgo.toISOString().slice(0, 10);

  return pets.map((pet) => {
    const petReminders = reminders.filter((r) => r.pet_id === pet.id);
    const upcomingList: Array<{ title: string; dueLabel: string; category: string; dueDate: string }> = [];
    const overdueList: Array<{ title: string; dueLabel: string; category: string; dueDate: string }> = [];
    let upcomingCount = 0;
    let overdueCount = 0;
    let nextReminder: ReminderRow | undefined;

    for (const reminder of petReminders) {
      const days = daysUntilDue(reminder.due_date, today);
      if (days < 0) {
        overdueCount += 1;
        overdueList.push({
          title: reminder.title,
          dueLabel: formatDueLabel(reminder.due_date, today),
          category: reminder.category,
          dueDate: reminder.due_date,
        });
      } else {
        upcomingCount += 1;
        if (days <= 7) {
          upcomingList.push({
            title: reminder.title,
            dueLabel: formatDueLabel(reminder.due_date, today),
            category: reminder.category,
            dueDate: reminder.due_date,
          });
        }
      }

      if (!nextReminder || reminder.due_date < nextReminder.due_date) {
        nextReminder = reminder;
      }
    }

    const upcomingReminders = upcomingList
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 3)
      .map(({ dueDate: _dueDate, ...rest }) => rest);

    const overdueReminders = overdueList
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 3)
      .map(({ dueDate: _dueDate, ...rest }) => rest);

    const checkInsThisWeek = checkIns.filter(
      (c) => c.pet_id === pet.id && c.check_in_date >= weekAgoIso,
    ).length;

    const streakDates = (streakCheckIns ?? checkIns)
      .filter((c) => c.pet_id === pet.id)
      .map((c) => c.check_in_date);
    const currentStreak = computeCheckInStreak(streakDates);

    const careScore = careScoresByPetId?.[pet.id] ?? null;

    return {
      id: pet.id,
      name: pet.name,
      speciesLabel: formatSpeciesLabel(pet.species, pet.breed),
      photoUrl: normalizePhotoUrlForEmail(pet.photo_url),
      avatarInitials: getAvatarInitials(pet.name),
      upcomingCount,
      overdueCount,
      checkInsThisWeek,
      currentStreak,
      careScore: careScore?.score,
      scoreLabel: careScore?.scoreLabel,
      scoreTrend: careScore?.trend,
      scoreTrendDelta: careScore?.trendDelta,
      weeklyInsight: careScore?.weeklyInsight,
      upcomingReminders,
      overdueReminders,
      nextReminderTitle: nextReminder?.title,
      nextReminderDue: nextReminder
        ? formatDueLabel(nextReminder.due_date, today)
        : undefined,
      profileUrl: `${baseUrl}/pet-profile`,
      insightsUrl: `${baseUrl}/pet-care-score`,
    };
  });
}

export function summarizeWeeklyTotals(pets: WeeklyPetSummary[]) {
  return pets.reduce(
    (acc, pet) => ({
      upcoming: acc.upcoming + pet.upcomingCount,
      overdue: acc.overdue + pet.overdueCount,
      checkIns: acc.checkIns + pet.checkInsThisWeek,
      petCount: acc.petCount + 1,
    }),
    { upcoming: 0, overdue: 0, checkIns: 0, petCount: 0 },
  );
}

export function weeklySummarySubject(pets: WeeklyPetSummary[], totals: { overdue: number }, weekLabel: string): string {
  if (!pets.length) return `Your PetClues week · ${weekLabel}`;

  const names = pets.map((p) => p.name);
  const namePart =
    names.length === 1
      ? names[0]
      : names.length === 2
        ? `${names[0]} & ${names[1]}`
        : `${names[0]} +${names.length - 1} more`;

  if (totals.overdue > 0) {
    const overdueLabel = totals.overdue === 1 ? '1 overdue task' : `${totals.overdue} overdue tasks`;
    return `${namePart} · ${overdueLabel} · ${weekLabel}`;
  }

  return `Your week with ${namePart} · ${weekLabel}`;
}
