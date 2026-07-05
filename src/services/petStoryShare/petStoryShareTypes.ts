import type {
  LifeStorySummary,
  Milestone,
  TimelineEventType,
  TimelineStats,
} from '@/types/timeline';

export type PublicStoryEvent = {
  id: string;
  type: TimelineEventType;
  date: string;
  displayDate: string;
  monthGroup: string;
  title: string;
  description: string;
  imageUrl?: string;
  meta?: string;
};

export type PublicStoryMilestone = {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUrl?: string;
  eventType: Milestone['eventType'];
};

export type PetStorySnapshot = {
  summary: LifeStorySummary;
  milestones: PublicStoryMilestone[];
  events: PublicStoryEvent[];
  stats: TimelineStats;
  freeTimelineDays: number;
  lockedMomentsCount: number;
};

export type PetStoryShareRecord = {
  id: string;
  petId: string;
  publicToken: string;
  snapshot: PetStorySnapshot;
  sharedWithFullHistory: boolean;
  updatedAt: string;
  revokedAt: string | null;
};

export type PublicPetStory = {
  petName: string;
  species: string;
  breed: string;
  photoUrl: string | null;
  updatedAt: string;
  sharedWithFullHistory: boolean;
  snapshot: PetStorySnapshot;
};

export type PetStoryShareRow = {
  id: string;
  pet_id: string;
  public_token: string;
  story_snapshot_json: PetStorySnapshot;
  shared_with_full_history: boolean;
  updated_at: string;
  revoked_at: string | null;
};

export function mapPetStoryShareRow(row: PetStoryShareRow): PetStoryShareRecord {
  return {
    id: row.id,
    petId: row.pet_id,
    publicToken: row.public_token,
    snapshot: normalizeStorySnapshot(row.story_snapshot_json),
    sharedWithFullHistory: row.shared_with_full_history,
    updatedAt: row.updated_at,
    revokedAt: row.revoked_at,
  };
}

export function normalizeStorySnapshot(
  value: Partial<PetStorySnapshot> | null | undefined,
): PetStorySnapshot {
  return {
    summary: {
      headline: value?.summary?.headline ?? 'Pet life story',
      detail: value?.summary?.detail ?? '',
      highlights: value?.summary?.highlights ?? [],
      accessNote: value?.summary?.accessNote,
    },
    milestones: value?.milestones ?? [],
    events: value?.events ?? [],
    stats: value?.stats ?? {
      totalMoments: 0,
      milestones: 0,
      documents: 0,
      daysRemembered: 0,
      careMoments: 0,
      memoryMoments: 0,
    },
    freeTimelineDays: value?.freeTimelineDays ?? 30,
    lockedMomentsCount: value?.lockedMomentsCount ?? 0,
  };
}

export function generatePublicToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function buildPublicStoryUrl(token: string): string {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : (import.meta.env.VITE_APP_URL as string | undefined) ?? '';
  const base = origin.replace(/\/$/, '');
  return base ? `${base}/s/${token}` : `/s/${token}`;
}
