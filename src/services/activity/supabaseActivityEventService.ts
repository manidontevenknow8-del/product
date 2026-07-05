import { getSupabaseClient } from '@/services/supabase/client';
import type {
  ActivityEventRow,
  AppendActivityLogInput,
  IActivityEventService,
} from './activityEventTypes';
import {
  mapActivityEventRow,
  toActivityEventPayload,
} from './activityEventTypes';

const SELECT =
  'id, household_id, pet_id, actor_user_id, event_type, payload_json, created_at';

const LEGACY_STORAGE_KEY = 'petclues_activity_log';
const MIGRATION_FLAG_KEY = 'petclues_activity_log_migrated_v1';

type LegacyActivityLogEntry = {
  id: string;
  petId: string;
  type: AppendActivityLogInput['type'];
  title: string;
  description: string;
  timestamp: string;
  createdAt: string;
};

function loadLegacyEntries(): LegacyActivityLogEntry[] {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LegacyActivityLogEntry[]) : [];
  } catch {
    return [];
  }
}

async function resolvePetHouseholdId(petId: string): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('pets')
    .select('household_id')
    .eq('id', petId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data?.household_id) {
    throw new Error('Pet household not found for activity event.');
  }

  return data.household_id;
}

export const supabaseActivityEventService: IActivityEventService = {
  async getForPet(petId, limit = 10) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('activity_events')
      .select(SELECT)
      .eq('pet_id', petId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data as ActivityEventRow[]).map(mapActivityEventRow);
  },

  async append(input) {
    const householdId = await resolvePetHouseholdId(input.petId);
    const createdAt = input.createdAt ?? new Date().toISOString();
    const payload = toActivityEventPayload(input, createdAt);

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('activity_events')
      .insert({
        household_id: householdId,
        pet_id: input.petId,
        event_type: input.type,
        payload_json: payload,
        created_at: createdAt,
      })
      .select(SELECT)
      .single();

    if (error) throw new Error(error.message);
    return mapActivityEventRow(data as ActivityEventRow);
  },

  async migrateFromLocalStorage(petIds) {
    if (typeof localStorage === 'undefined') return;
    if (localStorage.getItem(MIGRATION_FLAG_KEY)) return;

    const legacy = loadLegacyEntries();
    if (legacy.length === 0) {
      localStorage.setItem(MIGRATION_FLAG_KEY, '1');
      return;
    }

    const petIdSet = new Set(petIds);
    const toMigrate = legacy.filter((entry) => petIdSet.has(entry.petId));
    if (toMigrate.length === 0) {
      localStorage.setItem(MIGRATION_FLAG_KEY, '1');
      return;
    }

    try {
      for (const entry of toMigrate) {
        await supabaseActivityEventService.append({
          petId: entry.petId,
          type: entry.type,
          title: entry.title,
          description: entry.description,
          timestamp: entry.timestamp,
          createdAt: entry.createdAt,
        });
      }
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // Best-effort: leave local data in place for a later attempt.
      return;
    }

    localStorage.setItem(MIGRATION_FLAG_KEY, '1');
  },
};
