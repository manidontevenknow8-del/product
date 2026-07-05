import { isSupabaseConfigured } from '@/services/supabase/config';
import { getSupabaseClient } from '@/services/supabase/client';

const STORAGE_KEY = 'petclues_vet_visit_exports';

type StoredExport = {
  id: string;
  user_id: string;
  pet_id: string;
  created_at: string;
};

function loadAll(): StoredExport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredExport[]) : [];
  } catch {
    return [];
  }
}

function saveAll(rows: StoredExport[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function monthStartIso(): string {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function enforceMockQuota(userId: string, plan: string) {
  if (!['plus', 'pro', 'enterprise'].includes(plan)) {
    throw new Error('Vet visit export requires Plus or above.');
  }
  if (plan === 'plus') {
    const monthStart = monthStartIso();
    const monthlyCount = loadAll().filter(
      (row) => row.user_id === userId && row.created_at >= monthStart,
    ).length;
    if (monthlyCount >= 1) {
      throw new Error(
        'Monthly vet visit export limit reached. Upgrade to Pro for unlimited exports.',
      );
    }
  }
}

export interface IVetVisitExportService {
  reserveExport(userId: string, petId: string, plan: string): Promise<string>;
}

export const supabaseVetVisitExportService: IVetVisitExportService = {
  async reserveExport(_userId, petId) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('reserve_vet_visit_export', {
      p_pet_id: petId,
    });

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Could not reserve vet visit export.');
    return String(data);
  },
};

export const mockVetVisitExportService: IVetVisitExportService = {
  async reserveExport(userId, petId, plan) {
    enforceMockQuota(userId, plan);
    const rows = loadAll();
    const created: StoredExport = {
      id: crypto.randomUUID(),
      user_id: userId,
      pet_id: petId,
      created_at: new Date().toISOString(),
    };
    rows.push(created);
    saveAll(rows);
    return created.id;
  },
};

export function getVetVisitExportService(): IVetVisitExportService {
  return isSupabaseConfigured()
    ? supabaseVetVisitExportService
    : mockVetVisitExportService;
}

export function countMockVetVisitExportsForUser(userId: string, monthOnly: boolean): number {
  const rows = loadAll().filter((row) => row.user_id === userId);
  if (!monthOnly) return rows.length;
  const monthStart = monthStartIso();
  return rows.filter((row) => row.created_at >= monthStart).length;
}
