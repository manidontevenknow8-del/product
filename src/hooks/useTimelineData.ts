import { useMemo } from 'react';
import { usePets } from '@/pets';
import { useHealthRecords } from '@/healthRecords';
import { useDocuments } from '@/documents';
import { useReminders } from '@/reminders';
import { buildTimelineFromSources } from '@/services/timeline/timelineBuilder';
import { isDemoDataEnabled } from '@/data/demoData';
import {
  mockTimelineEvents,
  mockMilestones,
  mockTimelineStats,
  emptyTimelineStats,
} from '@/data/timelineData';

export function useTimelineData() {
  const { activePet } = usePets();
  const { records, isLoading: recordsLoading } = useHealthRecords();
  const { documents, isLoading: docsLoading } = useDocuments();
  const { reminders, isLoading: remindersLoading } = useReminders();

  const isLoading = recordsLoading || docsLoading || remindersLoading;

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
    });
  }, [activePet, records, documents, reminders]);

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
