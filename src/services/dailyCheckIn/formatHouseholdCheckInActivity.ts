import type { HouseholdMember } from '@/services/household/householdTypes';
import type { DailyCheckIn } from '@/types/dailyCheckIn';
import { shiftDateKey, todayDateKey } from './checkInUtils';

export const HOUSEHOLD_ACTIVITY_LOOKBACK_DAYS = 7;
export const HOUSEHOLD_ACTIVITY_MAX_ITEMS = 3;

function formatActivityTime(iso: string): string {
  const date = new Date(iso);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const h12 = hours % 12 || 12;
  const ampm = hours < 12 ? 'am' : 'pm';
  if (minutes === 0) return `${h12}${ampm}`;
  return `${h12}:${String(minutes).padStart(2, '0')}${ampm}`;
}

function memberActivityName(member: HouseholdMember, currentUserId: string): string {
  if (member.userId === currentUserId) return 'You';
  const first = member.name.trim().split(/\s+/)[0];
  if (first) return first;
  const emailLocal = member.email.split('@')[0]?.trim();
  return emailLocal || 'Someone';
}

function hasCheckInActivity(checkIn: DailyCheckIn): boolean {
  return (
    Boolean(checkIn.feeding?.trim()) ||
    (checkIn.walkDistanceKm != null && Number.isFinite(checkIn.walkDistanceKm)) ||
    (checkIn.weightKg != null && checkIn.weightKg > 0)
  );
}

function formatCheckInActivityPhrase(checkIn: DailyCheckIn, petName: string): string {
  const fed = Boolean(checkIn.feeding?.trim());
  const walked = checkIn.walkDistanceKm != null && Number.isFinite(checkIn.walkDistanceKm);
  const weighed = checkIn.weightKg != null && checkIn.weightKg > 0;

  const parts: string[] = [];
  if (fed) parts.push(`fed ${petName}`);
  if (walked) parts.push('logged a walk');
  if (weighed) parts.push(`logged weight for ${petName}`);

  if (parts.length === 0) return 'logged a check-in';
  if (parts.length === 1) return parts[0]!;
  const last = parts[parts.length - 1]!;
  const rest = parts.slice(0, -1).join(', ');
  return `${rest} and ${last}`;
}

function formatCheckInSnippet(
  checkIn: DailyCheckIn,
  petName: string,
  actor: string,
): string {
  const phrase = formatCheckInActivityPhrase(checkIn, petName);
  const time = formatActivityTime(checkIn.updatedAt);
  return `${actor} ${phrase} at ${time}`;
}

function pickRecentCheckIns(checkIns: DailyCheckIn[], maxItems: number): DailyCheckIn[] {
  const sorted = [...checkIns].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const picked: DailyCheckIn[] = [];
  const seenUsers = new Set<string>();

  for (const checkIn of sorted) {
    const userId = checkIn.loggedByUserId;
    if (!userId || seenUsers.has(userId)) continue;
    picked.push(checkIn);
    seenUsers.add(userId);
    if (picked.length >= maxItems) return picked;
  }

  for (const checkIn of sorted) {
    if (picked.includes(checkIn)) continue;
    if (!checkIn.loggedByUserId) continue;
    picked.push(checkIn);
    if (picked.length >= maxItems) break;
  }

  return picked;
}

/** Recent household check-in lines for the Home activity strip. */
export function buildHouseholdCheckInActivities(args: {
  checkIns: DailyCheckIn[];
  petName: string;
  members: HouseholdMember[];
  currentUserId: string;
  maxItems?: number;
  lookbackDays?: number;
}): string[] {
  const {
    checkIns,
    petName,
    members,
    currentUserId,
    maxItems = HOUSEHOLD_ACTIVITY_MAX_ITEMS,
    lookbackDays = HOUSEHOLD_ACTIVITY_LOOKBACK_DAYS,
  } = args;

  if (members.length <= 1) return [];

  const memberById = new Map(members.map((member) => [member.userId, member]));
  const cutoff = shiftDateKey(todayDateKey(), -(lookbackDays - 1));

  const eligible = checkIns.filter(
    (checkIn) =>
      checkIn.checkInDate >= cutoff &&
      checkIn.loggedByUserId &&
      hasCheckInActivity(checkIn),
  );

  if (eligible.length === 0) return [];

  const selected = pickRecentCheckIns(eligible, maxItems);

  return selected.map((checkIn) => {
    const member = memberById.get(checkIn.loggedByUserId!);
    const actor = member ? memberActivityName(member, currentUserId) : 'Someone';
    return formatCheckInSnippet(checkIn, petName, actor);
  });
}
