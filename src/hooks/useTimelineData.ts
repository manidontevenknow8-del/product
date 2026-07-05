import { useEffect, useMemo, useState } from 'react';
import { usePets } from '@/pets';
import { useHealthRecords } from '@/healthRecords';
import { useDocuments } from '@/documents';
import { useReminders } from '@/reminders';
import { usePetMoments } from '@/petMoments';
import { buildTimelineFromSources } from '@/services/timeline/timelineBuilder';
import { getScoreSnapshotsForPet } from '@/services/petCareScore/petCareScoreSnapshotService';
import type { StoredScoreSnapshot } from '@/services/petCareScore/petCareScoreTypes';
import { isDemoDataEnabled } from '@/data/demoData';
import {
  mockTimelineEvents,
  mockMilestones,
  mockTimelineStats,
  emptyTimelineStats,
} from '@/data/timelineData';

export function useTimelineData() {
  const { activePet, pets } = usePets();
  const { records, isLoading: recordsLoading } = useHealthRecords();
  const { documents, isLoading: docsLoading } = useDocuments();
  const { reminders, isLoading: remindersLoading } = useReminders();
  const { moments: petMoments, isLoading: momentsLoading } = usePetMoments();
  const [scoreHistory, setScoreHistory] = useState<StoredScoreSnapshot[]>([]);
  const [scoreHistoryLoading, setScoreHistoryLoading] = useState(false);

  const petIds = useMemo(() => pets.map((pet) => pet.id), [pets]);

  useEffect(() => {
    if (!activePet || isDemoDataEnabled('timeline')) {
      setScoreHistory([]);
      setScoreHistoryLoading(false);
      return;
    }

    let cancelled = false;
    setScoreHistoryLoading(true);

    void getScoreSnapshotsForPet(activePet.id, { migratePetIds: petIds })
      .then((history) => {
        if (!cancelled) setScoreHistory(history);
      })
      .catch(() => {
        if (!cancelled) setScoreHistory([]);
      })
      .finally(() => {
        if (!cancelled) setScoreHistoryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activePet, petIds]);

  const isLoading =
    recordsLoading || docsLoading || remindersLoading || scoreHistoryLoading || momentsLoading;

  const built = useMemo(() => {
    if (!activePet || isDemoDataEnabled('timeline')) {
      return null;
    }

    const petRecords = records.filter((r) => r.petId === activePet.id);
    const petDocuments = documents.filter((d) => d.petId === activePet.id);
    const petReminders = reminders.filter((r) => r.petId === activePet.id);

    return buildTimelineFromSources({
      pet: activePet,
      healthRecords: petRecords,
      documents: petDocuments,
      reminders: petReminders,
      scoreHistory,
      petMoments,
    });
  }, [activePet, records, documents, reminders, scoreHistory, petMoments]);

  if (isDemoDataEnabled('timeline')) {
    return {
      events: mockTimelineEvents,
      milestones: mockMilestones,
      stats: mockTimelineStats,
      isLoading: false,
      isDemo: true,
    };
  }

  return {
    events: built?.events ?? [],
    milestones: built?.milestones ?? [],
    stats: built?.stats ?? emptyTimelineStats,
    isLoading,
    isDemo: false,
  };
}
