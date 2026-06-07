import type { AppNotification, NotificationGroup } from '@/types/notifications';

export function groupNotificationsByDate(
  notifications: AppNotification[],
): NotificationGroup[] {
  const groups = new Map<string, AppNotification[]>();

  for (const notification of notifications) {
    const date = new Date(notification.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateKey: string;

    if (isSameDay(date, today)) {
      dateKey = formatDateKey(today);
    } else if (isSameDay(date, yesterday)) {
      dateKey = formatDateKey(yesterday);
    } else {
      dateKey = formatDateKey(date);
    }

    const existing = groups.get(dateKey) ?? [];
    existing.push(notification);
    groups.set(dateKey, existing);
  }

  return Array.from(groups.entries())
    .map(([dateKey, items]) => ({
      dateKey,
      dateLabel: getDateLabel(items[0]!.timestamp),
      items: items.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    }))
    .sort(
      (a, b) =>
        new Date(b.items[0]!.timestamp).getTime() -
        new Date(a.items[0]!.timestamp).getTime(),
    );
}

function getDateLabel(timestamp: string): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatNotificationTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getNotificationCategoryLabel(
  category: AppNotification['category'],
): string {
  const labels: Record<AppNotification['category'], string> = {
    reminder: 'Reminder',
    reminder_completed: 'Completed',
    passport: 'Passport',
    shared_pet: 'Shared care',
    product: 'Update',
  };
  return labels[category];
}
