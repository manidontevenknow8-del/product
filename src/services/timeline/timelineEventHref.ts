import { ROUTES } from '@/routes/paths';
import type { TimelineEventItem } from '@/types/timeline';

export const TIMELINE_DEEP_LINK_PARAMS = {
  record: 'record',
  document: 'document',
  reminder: 'reminder',
} as const;

function pageFallback(event: TimelineEventItem): string | null {
  switch (event.sourceKind) {
    case 'document':
      return ROUTES.SCAN;
    case 'health_record':
      return ROUTES.PET_PROFILE;
    case 'reminder':
      return ROUTES.REMINDERS;
    case 'profile':
      return ROUTES.PET_PROFILE;
    default:
      return null;
  }
}

/** Deep-link to a timeline event's source record when possible. */
export function timelineEventHref(event: TimelineEventItem): string | null {
  const sourceId = event.sourceId?.trim();
  if (!sourceId) return pageFallback(event);

  switch (event.sourceKind) {
    case 'health_record':
      return `${ROUTES.PET_PROFILE}?${TIMELINE_DEEP_LINK_PARAMS.record}=${encodeURIComponent(sourceId)}`;
    case 'document':
      return `${ROUTES.PET_PROFILE}?${TIMELINE_DEEP_LINK_PARAMS.document}=${encodeURIComponent(sourceId)}`;
    case 'reminder':
      return `${ROUTES.REMINDERS}?${TIMELINE_DEEP_LINK_PARAMS.reminder}=${encodeURIComponent(sourceId)}`;
    case 'profile':
      return ROUTES.PET_PROFILE;
    default:
      return null;
  }
}
