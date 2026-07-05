import { buildLifeStorySummary } from '@/data/timelineData';
import { buildMilestonesFromEvents } from '@/services/timeline/timelineBuilder';
import { partitionTimelineEvents } from '@/utils/timelineAccess';
import type { PetRecord } from '@/services/pets/petTypes';
import type { Milestone, TimelineEventItem, TimelineStats } from '@/types/timeline';
import type { PetStorySnapshot, PublicStoryEvent, PublicStoryMilestone } from './petStoryShareTypes';

export type BuildStorySnapshotInput = {
  pet: PetRecord;
  events: TimelineEventItem[];
  stats: TimelineStats;
  hasFullTimeline: boolean;
  freeTimelineDays: number;
  resolvedImages?: Record<string, string | undefined>;
};

function toPublicEvent(
  event: TimelineEventItem,
  resolvedImages?: Record<string, string | undefined>,
): PublicStoryEvent {
  const imageUrl =
    event.imageUrl ??
    (event.thumbnailDocumentId ? resolvedImages?.[event.thumbnailDocumentId] : undefined);

  return {
    id: event.id,
    type: event.type,
    date: event.date,
    displayDate: event.displayDate,
    monthGroup: event.monthGroup,
    title: event.title,
    description: event.description,
    imageUrl,
    meta: event.meta,
  };
}

function toPublicMilestone(
  milestone: Milestone,
  resolvedImages?: Record<string, string | undefined>,
): PublicStoryMilestone {
  const imageUrl =
    milestone.imageUrl ??
    (milestone.thumbnailDocumentId ? resolvedImages?.[milestone.thumbnailDocumentId] : undefined);

  return {
    id: milestone.id,
    title: milestone.title,
    date: milestone.date,
    description: milestone.description,
    imageUrl,
    eventType: milestone.eventType,
  };
}

export function buildPetStorySnapshot(input: BuildStorySnapshotInput): PetStorySnapshot {
  const { pet, events, stats, hasFullTimeline, freeTimelineDays, resolvedImages } = input;
  const partition = hasFullTimeline
    ? { visible: events, locked: [] as TimelineEventItem[] }
    : partitionTimelineEvents(events);

  const lockedMomentsCount = partition.locked.length;
  const visibleEvents = partition.visible.map((event) => toPublicEvent(event, resolvedImages));
  const milestones = buildMilestonesFromEvents(
    hasFullTimeline ? events : partition.visible,
  ).map((milestone) => toPublicMilestone(milestone, resolvedImages));

  const summary = buildLifeStorySummary(events, pet.name, stats, {
    breed: pet.breed,
    species: pet.species,
  }, {
    hasFullTimeline,
    lockedMomentsCount,
    freeTimelineDays,
  });

  return {
    summary,
    milestones,
    events: visibleEvents,
    stats,
    freeTimelineDays,
    lockedMomentsCount,
  };
}
