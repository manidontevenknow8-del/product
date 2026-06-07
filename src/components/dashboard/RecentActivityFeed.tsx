import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import type { ActivityItem } from '@/types/dashboard';
import styles from './RecentActivityFeed.module.css';

type RecentActivityFeedProps = {
  items: ActivityItem[];
};

export function RecentActivityFeed({ items }: RecentActivityFeedProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Recent activity</h2>

      {items.length === 0 ? (
        <p className={styles.empty}>No recent activity yet.</p>
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <div key={item.id} className={styles.item}>
              <div className={styles.iconWrap}>
                <div className={styles.icon} />
              </div>
              <div className={styles.content}>
                <div className={styles.itemTitle}>{item.title}</div>
                <div className={styles.itemDesc}>{item.description}</div>
              </div>
              <span className={styles.timestamp}>{item.timestamp}</span>
            </div>
          ))}
        </div>
      )}

      <Link to={ROUTES.TIMELINE} className={styles.viewAll}>
        View full timeline →
      </Link>
    </section>
  );
}
