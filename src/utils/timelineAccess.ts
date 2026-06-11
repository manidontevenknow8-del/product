import { FREE_TIMELINE_DAYS } from '@/subscription/featureGates';
import type { TimelineEventItem } from '@/types/timeline';

export function getTimelineCutoffDate(): Date {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - FREE_TIMELINE_DAYS);
  cutoff.setHours(0, 0, 0, 0);
  return cutoff;
}

export function partitionTimelineEvents(events: TimelineEventItem[]): {
  visible: TimelineEventItem[];
  locked: TimelineEventItem[];
} {
  const cutoff = getTimelineCutoffDate();
  const visible: TimelineEventItem[] = [];
  const locked: TimelineEventItem[] = [];

  for (const event of events) {
    const ts = new Date(event.date);
    if (ts >= cutoff) visible.push(event);
    else locked.push(event);
  }

  return { visible, locked };
}
