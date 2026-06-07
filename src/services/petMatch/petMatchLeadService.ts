import type { PetMatchAnswers, PetMatchResult } from '@/types/petMatch';

type SavedPetMatch = {
  id: string;
  createdAt: string;
  userId: string | null;
  answers: PetMatchAnswers;
  result: PetMatchResult;
};

const STORAGE_KEY = 'petclues_pet_match_saves';

function readAll(): SavedPetMatch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedPetMatch[]) : [];
  } catch {
    return [];
  }
}

function writeAll(records: SavedPetMatch[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, 25)));
}

export function savePetMatchRecommendation(
  userId: string | null,
  answers: PetMatchAnswers,
  result: PetMatchResult,
): SavedPetMatch {
  const record: SavedPetMatch = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    userId,
    answers,
    result,
  };

  const existing = readAll();
  writeAll([record, ...existing]);
  return record;
}
