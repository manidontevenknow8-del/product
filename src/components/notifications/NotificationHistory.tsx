import { EmptyNotificationsState } from '@/components/empty-states';
import { LoadingState } from '@/components/ui';
import { NotificationCard } from './NotificationCard';
import { useNotifications } from '@/notifications';
import styles from './NotificationHistory.module.css';

type NotificationHistoryProps = {
  showSearchPlaceholder?: boolean;
};

export function NotificationHistory({
  showSearchPlaceholder = true,
}: NotificationHistoryProps) {
  const { groups, markAsRead, isLoading, notifications } = useNotifications();

  if (isLoading) {
    return <LoadingState message="Loading notifications" />;
  }

  if (notifications.length === 0) {
    return <EmptyNotificationsState />;
  }

  return (
    <div className={styles.history}>
      {showSearchPlaceholder && (
        <div className={styles.searchPlaceholder}>
          <div className={styles.searchLabel}>Search notifications</div>
          <div className={styles.searchHint}>
            Search by pet, category, or date - coming soon
          </div>
        </div>
      )}

      {groups.map((group) => (
        <section key={group.dateKey} className={styles.group}>
          <h3 className={styles.dateLabel}>{group.dateLabel}</h3>
          <div className={styles.list}>
            {group.items.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onRead={markAsRead}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
