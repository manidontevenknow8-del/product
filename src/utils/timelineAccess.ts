import { FREE_TIMELINE_MONTHS } from '@/subscription/featureGates';
import type { TimelineEventItem } from '@/types/timeline';

export function getTimelineCutoffDate(): Date {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - FREE_TIMELINE_MONTHS);
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
