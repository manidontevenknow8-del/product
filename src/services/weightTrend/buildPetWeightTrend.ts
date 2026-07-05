import { shiftDateKey, todayDateKey } from '@/services/dailyCheckIn/checkInUtils';
import { formatCheckInWeightLabel } from '@/services/dailyCheckIn/syncCheckInWeightRecord';
import type { HealthRecord } from '@/services/healthRecords/healthRecordTypes';
import type { DailyCheckIn } from '@/types/dailyCheckIn';

export const MIN_WEIGHT_TREND_POINTS = 3;

const STABLE_PCT_THRESHOLD = 2;
const STABLE_KG_THRESHOLD = 0.3;
const STABLE_LOOKBACK_DAYS = 30;
const TREND_PCT_THRESHOLD = 2;

export type WeightTrendPoint = {
  date: string;
  weightKg: number;
  source: 'check-in' | 'record';
};

export type PetWeightTrend = {
  points: WeightTrendPoint[];
  trendValues: number[];
  summary: string;
  hasEnoughData: boolean;
};

export function parseWeightKg(value: string | null | undefined): number | null {
  if (!value?.trim()) return null;
  const match = value.match(/(\d+(?:\.\d+)?)\s*kg/i);
  if (match) {
    const parsed = Number.parseFloat(match[1]!);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
  const bare = Number.parseFloat(value);
  return Number.isFinite(bare) && bare > 0 ? bare : null;
}

function daysBetween(start: string, end: string): number {
  const startMs = new Date(`${start}T12:00:00`).getTime();
  const endMs = new Date(`${end}T12:00:00`).getTime();
  return Math.round((endMs - startMs) / (24 * 60 * 60 * 1000));
}

function formatPeriod(days: number): string {
  if (days >= 14) {
    const weeks = Math.max(1, Math.round(days / 7));
    return weeks === 1 ? '1 week' : `${weeks} weeks`;
  }
  return days === 1 ? '1 day' : `${days} days`;
}

function isStableRange(weights: number[]): boolean {
  if (weights.length < 2) return false;
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const mid = (min + max) / 2;
  const pctRange = mid > 0 ? ((max - min) / mid) * 100 : 0;
  return max - min <= STABLE_KG_THRESHOLD || pctRange <= STABLE_PCT_THRESHOLD;
}

function linearRegression(points: WeightTrendPoint[]): { slope: number; intercept: number } {
  const origin = points[0]!.date;
  const xs = points.map((point) => daysBetween(origin, point.date));
  const ys = points.map((point) => point.weightKg);
  const n = points.length;
  const sumX = xs.reduce((total, value) => total + value, 0);
  const sumY = ys.reduce((total, value) => total + value, 0);
  const sumXY = xs.reduce((total, value, index) => total + value * ys[index]!, 0);
  const sumXX = xs.reduce((total, value) => total + value * value, 0);
  const denom = n * sumXX - sumX * sumX;

  if (denom === 0) {
    return { slope: 0, intercept: sumY / n };
  }

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function fittedTrendValues(points: WeightTrendPoint[]): number[] {
  const { slope, intercept } = linearRegression(points);
  const origin = points[0]!.date;
  return points.map((point) => {
    const x = daysBetween(origin, point.date);
    return Math.round((slope * x + intercept) * 10) / 10;
  });
}

function buildSummary(petName: string, points: WeightTrendPoint[]): string {
  const first = points[0]!;
  const last = points[points.length - 1]!;
  const spanDays = daysBetween(first.date, last.date);
  const today = todayDateKey();
  const windowStart = shiftDateKey(today, -STABLE_LOOKBACK_DAYS);
  const recent = points.filter((point) => point.date >= windowStart && point.date <= today);

  if (recent.length >= 2 && isStableRange(recent.map((point) => point.weightKg))) {
    return `Weight has been stable for the last ${STABLE_LOOKBACK_DAYS} days.`;
  }

  if (spanDays >= 7 && first.weightKg > 0) {
    const pct = ((last.weightKg - first.weightKg) / first.weightKg) * 100;
    if (Math.abs(pct) >= TREND_PCT_THRESHOLD) {
      const direction = pct > 0 ? 'gained' : 'lost';
      return `${petName} has ${direction} ${Math.abs(Math.round(pct))}% over ${formatPeriod(spanDays)}.`;
    }
  }

  if (spanDays >= 1 && isStableRange(points.map((point) => point.weightKg))) {
    return `Weight has been stable over the last ${formatPeriod(spanDays)}.`;
  }

  return `${petName} weighs ${formatCheckInWeightLabel(last.weightKg)} (latest reading).`;
}

function mergeWeightPoints(
  records: HealthRecord[],
  checkIns: DailyCheckIn[],
): WeightTrendPoint[] {
  const byDate = new Map<string, WeightTrendPoint>();

  for (const checkIn of checkIns) {
    if (checkIn.weightKg == null || !Number.isFinite(checkIn.weightKg) || checkIn.weightKg <= 0) {
      continue;
    }
    byDate.set(checkIn.checkInDate, {
      date: checkIn.checkInDate,
      weightKg: checkIn.weightKg,
      source: 'check-in',
    });
  }

  for (const record of records) {
    if (record.recordType !== 'weight') continue;
    if (byDate.has(record.dateRecorded)) continue;

    const weightKg = parseWeightKg(record.description) ?? parseWeightKg(record.title);
    if (weightKg == null) continue;

    byDate.set(record.dateRecorded, {
      date: record.dateRecorded,
      weightKg,
      source: 'record',
    });
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function buildPetWeightTrend(args: {
  petName: string;
  records: HealthRecord[];
  checkIns: DailyCheckIn[];
}): PetWeightTrend {
  const points = mergeWeightPoints(args.records, args.checkIns);
  const hasEnoughData = points.length >= MIN_WEIGHT_TREND_POINTS;

  if (!hasEnoughData) {
    return {
      points,
      trendValues: [],
      summary: '',
      hasEnoughData: false,
    };
  }

  return {
    points,
    trendValues: fittedTrendValues(points),
    summary: buildSummary(args.petName, points),
    hasEnoughData: true,
  };
}
