import type { ActivityItem } from '@/types/dashboard';

export type ActivityEventType = ActivityItem['type'];

export type ActivityEventPayload = {
  title: string;
  description: string;
  displayTimestamp?: string;
};

export type ActivityLogEntry = {
  id: string;
  petId: string;
  type: ActivityEventType;
  title: string;
  description: string;
  timestamp: string;
  createdAt: string;
};

export type ActivityEventRow = {
  id: string;
  household_id: string;
  pet_id: string;
  actor_user_id: string | null;
  event_type: ActivityEventType;
  payload_json: ActivityEventPayload;
  created_at: string;
};

export type AppendActivityLogInput = {
  petId: string;
  type: ActivityEventType;
  title: string;
  description: string;
  timestamp?: string;
  createdAt?: string;
};

export interface IActivityEventService {
  getForPet(petId: string, limit?: number): Promise<ActivityLogEntry[]>;
  append(input: AppendActivityLogInput): Promise<ActivityLogEntry>;
  migrateFromLocalStorage(petIds: string[]): Promise<void>;
}

export function formatActivityTimestamp(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function mapActivityEventRow(row: ActivityEventRow): ActivityLogEntry {
  const payload = row.payload_json;
  return {
    id: row.id,
    petId: row.pet_id,
    type: row.event_type,
    title: payload.title,
    description: payload.description,
    timestamp: payload.displayTimestamp ?? formatActivityTimestamp(row.created_at),
    createdAt: row.created_at,
  };
}

export function toActivityEventPayload(
  input: AppendActivityLogInput,
  createdAt: string,
): ActivityEventPayload {
  return {
    title: input.title,
    description: input.description,
    displayTimestamp: input.timestamp ?? formatActivityTimestamp(createdAt),
  };
}
