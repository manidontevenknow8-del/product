import type { MonthlyPetLifeReport } from '@/types/monthlyReport';

const KEY = 'petclues_monthly_reports';

type StoredMonthlyReport = MonthlyPetLifeReport & {
  userId: string;
};

function safeRead(): StoredMonthlyReport[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredMonthlyReport[]) : [];
  } catch {
    return [];
  }
}

function safeWrite(records: StoredMonthlyReport[]) {
  localStorage.setItem(KEY, JSON.stringify(records.slice(0, 60)));
}

export function saveMonthlyReport(userId: string, report: MonthlyPetLifeReport): void {
  const records = safeRead();
  const next: StoredMonthlyReport = { ...report, userId };

  const dedup = records.filter(
    (r) => !(r.userId === userId && r.petId === report.petId && r.monthKey === report.monthKey),
  );
  safeWrite([next, ...dedup]);
}

export function listMonthlyReports(userId: string, petId?: string): MonthlyPetLifeReport[] {
  const records = safeRead().filter((r) => r.userId === userId && (!petId || r.petId === petId));
  return records
    .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
    .map(({ userId: _userId, ...report }) => report);
}

export function getMonthlyReport(
  userId: string,
  petId: string,
  monthKey: string,
): MonthlyPetLifeReport | null {
  const record = safeRead().find((r) => r.userId === userId && r.petId === petId && r.monthKey === monthKey);
  if (!record) return null;
  const { userId: _userId, ...report } = record;
  return report;
}

