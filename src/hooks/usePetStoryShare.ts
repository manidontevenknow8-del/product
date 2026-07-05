import { useCallback, useEffect, useState } from 'react';
import type { PetRecord } from '@/services/pets/petTypes';
import { buildPetStorySnapshot } from '@/services/petStoryShare/buildPetStorySnapshot';
import {
  getPetStoryShareService,
  type IPetStoryShareService,
} from '@/services/petStoryShare/petStoryShareService';
import type { PetStoryShareRecord } from '@/services/petStoryShare/petStoryShareTypes';
import {
  canEditHouseholdPet,
  getHouseholdRoleForPet,
  type HouseholdRole,
} from '@/services/household/householdService';
import { FREE_TIMELINE_DAYS } from '@/subscription/featureGates';
import type { TimelineEventItem, TimelineStats } from '@/types/timeline';

type UsePetStoryShareInput = {
  pet: PetRecord | null;
  events: TimelineEventItem[];
  stats: TimelineStats;
  hasFullTimeline: boolean;
  resolveDocumentUrl?: (documentId: string) => Promise<string | null>;
};

type UsePetStoryShareResult = {
  share: PetStoryShareRecord | null;
  householdRole: HouseholdRole | null;
  canEdit: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  ensureLink: () => Promise<PetStoryShareRecord>;
  refreshSnapshot: () => Promise<PetStoryShareRecord>;
  regenerateToken: () => Promise<PetStoryShareRecord>;
  revokeLink: () => Promise<void>;
};

async function resolveTimelineImages(
  events: TimelineEventItem[],
  resolveDocumentUrl?: (documentId: string) => Promise<string | null>,
): Promise<Record<string, string | undefined>> {
  if (!resolveDocumentUrl) return {};

  const documentIds = new Set<string>();
  for (const event of events) {
    if (event.thumbnailDocumentId) documentIds.add(event.thumbnailDocumentId);
  }

  const resolved: Record<string, string | undefined> = {};
  await Promise.all(
    [...documentIds].map(async (documentId) => {
      try {
        resolved[documentId] = (await resolveDocumentUrl(documentId)) ?? undefined;
      } catch {
        resolved[documentId] = undefined;
      }
    }),
  );

  return resolved;
}

export function usePetStoryShare(
  input: UsePetStoryShareInput,
  service: IPetStoryShareService = getPetStoryShareService(),
): UsePetStoryShareResult {
  const { pet, events, stats, hasFullTimeline, resolveDocumentUrl } = input;
  const [share, setShare] = useState<PetStoryShareRecord | null>(null);
  const [householdRole, setHouseholdRole] = useState<HouseholdRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildSnapshot = useCallback(async () => {
    if (!pet) throw new Error('No active pet.');
    const resolvedImages = await resolveTimelineImages(events, resolveDocumentUrl);
    return buildPetStorySnapshot({
      pet,
      events,
      stats,
      hasFullTimeline,
      freeTimelineDays: FREE_TIMELINE_DAYS,
      resolvedImages,
    });
  }, [pet, events, stats, hasFullTimeline, resolveDocumentUrl]);

  const refresh = useCallback(async () => {
    if (!pet) {
      setShare(null);
      setHouseholdRole(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const role = await getHouseholdRoleForPet(pet.id).catch(() => null);
      setHouseholdRole(role);

      const existing = await service.getForPet(pet.id);
      if (existing && !existing.revokedAt) {
        setShare(existing);
        return;
      }

      setShare(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load story share.');
      setShare(null);
    } finally {
      setIsLoading(false);
    }
  }, [pet, service]);

  useEffect(() => {
    void refresh();
  }, [refresh, pet?.id, events.length]);

  const ensureLink = useCallback(async () => {
    if (!pet) throw new Error('No active pet.');
    const snapshot = await buildSnapshot();
    const saved = await service.ensureForPet(pet.id, snapshot, hasFullTimeline);
    setShare(saved);
    return saved;
  }, [pet, buildSnapshot, service, hasFullTimeline]);

  const refreshSnapshot = useCallback(async () => {
    if (!pet) throw new Error('No active pet.');
    const snapshot = await buildSnapshot();
    const saved = await service.updateSnapshot(pet.id, snapshot, hasFullTimeline);
    setShare(saved);
    return saved;
  }, [pet, buildSnapshot, service, hasFullTimeline]);

  const regenerateToken = useCallback(async () => {
    if (!pet) throw new Error('No active pet.');
    const next = await service.regenerateToken(pet.id);
    setShare(next);
    return next;
  }, [pet, service]);

  const revokeLink = useCallback(async () => {
    if (!pet) throw new Error('No active pet.');
    await service.revoke(pet.id);
    setShare(null);
  }, [pet, service]);

  return {
    share,
    householdRole,
    canEdit: canEditHouseholdPet(householdRole),
    isLoading,
    error,
    refresh,
    ensureLink,
    refreshSnapshot,
    regenerateToken,
    revokeLink,
  };
}
