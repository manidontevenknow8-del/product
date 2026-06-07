import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '@/notifications';
import { NotificationCenter } from './NotificationCenter';
import styles from './NotificationBell.module.css';

export function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className={styles.container} ref={ref}>
      <button
        type="button"
        className={styles.bell}
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
      >
        <span className={styles.icon} aria-hidden="true" />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <NotificationCenter limit={5} />
        </div>
      )}
    </div>
  );
}
