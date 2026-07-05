import type {
  ActivityEventRow,
  AppendActivityLogInput,
  IActivityEventService,
} from './activityEventTypes';
import {
  formatActivityTimestamp,
  mapActivityEventRow,
  toActivityEventPayload,
} from './activityEventTypes';

const STORAGE_KEY = 'petclues_activity_log';
const MAX_ENTRIES = 100;

type LegacyActivityLogEntry = {
  id: string;
  petId: string;
  type: AppendActivityLogInput['type'];
  title: string;
  description: string;
  timestamp: string;
  createdAt: string;
};

function isLegacyEntry(value: unknown): value is LegacyActivityLogEntry {
  return (
    typeof value === 'object'
    && value != null
    && 'petId' in value
    && typeof (value as LegacyActivityLogEntry).petId === 'string'
  );
}

function legacyToRow(entry: LegacyActivityLogEntry): ActivityEventRow {
  return {
    id: entry.id,
    household_id: 'local-household',
    pet_id: entry.petId,
    actor_user_id: null,
    event_type: entry.type,
    payload_json: {
      title: entry.title,
      description: entry.description,
      displayTimestamp: entry.timestamp,
    },
    created_at: entry.createdAt,
  };
}

function loadRows(): ActivityEventRow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return [];
    if (parsed.length > 0 && isLegacyEntry(parsed[0])) {
      return (parsed as LegacyActivityLogEntry[]).map(legacyToRow);
    }
    return parsed as ActivityEventRow[];
  } catch {
    return [];
  }
}

function saveRows(rows: ActivityEventRow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows.slice(0, MAX_ENTRIES)));
}

export const mockActivityEventService: IActivityEventService = {
  async getForPet(petId, limit = 10) {
    return loadRows()
      .filter((row) => row.pet_id === petId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit)
      .map(mapActivityEventRow);
  },

  async append(input: AppendActivityLogInput) {
    const createdAt = input.createdAt ?? new Date().toISOString();
    const payload = toActivityEventPayload(input, createdAt);
    const row: ActivityEventRow = {
      id: crypto.randomUUID(),
      household_id: 'local-household',
      pet_id: input.petId,
      actor_user_id: null,
      event_type: input.type,
      payload_json: payload,
      created_at: createdAt,
    };

    saveRows([row, ...loadRows()]);
    return mapActivityEventRow(row);
  },

  async migrateFromLocalStorage() {
    // Mock mode reads legacy entries directly in loadRows().
  },
};

export { formatActivityTimestamp };
