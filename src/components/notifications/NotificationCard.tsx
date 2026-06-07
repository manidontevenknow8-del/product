import { Link } from 'react-router-dom';
import type { AppNotification } from '@/types/notifications';
import {
  formatNotificationTime,
  getNotificationCategoryLabel,
} from '@/utils/notificationUtils';
import styles from './NotificationCard.module.css';

type NotificationCardProps = {
  notification: AppNotification;
  onRead?: (id: string) => void;
  compact?: boolean;
};

export function NotificationCard({
  notification,
  onRead,
  compact = false,
}: NotificationCardProps) {
  const handleClick = () => {
    if (!notification.read) onRead?.(notification.id);
  };

  const content = (
    <>
      <div className={styles.icon} aria-hidden="true">
        <div className={styles.iconInner} />
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.title}>{notification.title}</span>
          <time className={styles.time} dateTime={notification.timestamp}>
            {formatNotificationTime(notification.timestamp)}
          </time>
        </div>
        {!compact && (
          <p className={styles.message}>{notification.message}</p>
        )}
        <div className={styles.meta}>
          <span className={styles.category}>
            {getNotificationCategoryLabel(notification.category)}
          </span>
          {notification.petName && (
            <span className={styles.pet}>{notification.petName}</span>
          )}
        </div>
      </div>
    </>
  );

  const className = `${styles.card} ${!notification.read ? styles.cardUnread : ''}`;

  if (notification.actionPath) {
    return (
      <Link
        to={notification.actionPath}
        className={className}
        onClick={handleClick}
      >
        {content}
      </Link>
    );
  }

  return (
    <article className={className} onClick={handleClick} role="button" tabIndex={0}>
      {content}
    </article>
  );
}
