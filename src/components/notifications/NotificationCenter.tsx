import { Link } from 'react-router-dom';
import { useNotifications } from '@/notifications';
import { EmptyNotificationsState } from '@/components/empty-states';
import { ROUTES } from '@/routes/paths';
import { NotificationCard } from './NotificationCard';
import styles from './NotificationCenter.module.css';

type NotificationCenterProps = {
  limit?: number;
  showViewAll?: boolean;
};

export function NotificationCenter({
  limit,
  showViewAll = true,
}: NotificationCenterProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  const displayed = limit ? notifications.slice(0, limit) : notifications;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Notifications</h2>
        {unreadCount > 0 && (
          <button type="button" className={styles.markAll} onClick={markAllAsRead}>
            Mark all read
          </button>
        )}
      </div>

      {displayed.length === 0 ? (
        <EmptyNotificationsState compact />
      ) : (
        <div className={styles.list}>
          {displayed.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onRead={markAsRead}
              compact={!!limit}
            />
          ))}
        </div>
      )}

      {showViewAll && limit && (
        <div className={styles.footer}>
          <Link to={ROUTES.NOTIFICATIONS} className={styles.viewAll}>
            View all notifications →
          </Link>
        </div>
      )}
    </div>
  );
}
