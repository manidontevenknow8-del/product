import { useDailyCheckIn } from '@/dailyCheckIn';
import type { CheckInStreakStats } from '@/types/dailyCheckIn';
import styles from './StreakModule.module.css';

export type StreakModuleProps = {
  petName: string;
  ctaHref?: string;
  ctaLabel?: string;
};

function streakMessage(stats: CheckInStreakStats, petName: string): string {
  const { current, best, status } = stats;

  switch (status) {
    case 'checked_in':
      if (current === 1) {
        return `Today's check-in is logged — you're building a rhythm for ${petName}.`;
      }
      return `${current}-day streak and counting. Nice steady care for ${petName}.`;
    case 'ends_today':
      return `Your ${current}-day streak is still yours today — a quick check-in keeps the rhythm going.`;
    case 'open_today':
      return `You're on a ${current}-day streak. Log today's check-in when you have a moment.`;
    case 'no_streak':
      if (best > 0) {
        return `Your best streak is ${best} ${best === 1 ? 'day' : 'days'}. Log today to start fresh.`;
      }
      return `Log today's check-in to start ${petName}'s first streak.`;
    default:
      return '';
  }
}

export function StreakModule({
  petName,
  ctaHref = '#ritual',
  ctaLabel = "Log today's check-in",
}: StreakModuleProps) {
  const { streakStats, isLoading } = useDailyCheckIn();
  const message = streakMessage(streakStats, petName);
  const showEndsToday = streakStats.status === 'ends_today';

  return (
    <section
      className={`${styles.band} ${showEndsToday ? styles.urgent : ''}`}
      aria-label="Check-in streak"
    >
      <div className={styles.inner}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{isLoading ? '—' : streakStats.current}</span>
            <span className={styles.statLabel}>Current streak</span>
          </div>
          <div className={styles.divider} aria-hidden />
          <div className={styles.stat}>
            <span className={styles.statValue}>{isLoading ? '—' : streakStats.best}</span>
            <span className={styles.statLabel}>Best streak</span>
          </div>
        </div>

        <div className={styles.messageBlock}>
          {showEndsToday && <p className={styles.badge}>Streak ends today</p>}
          <p className={styles.message}>{message}</p>
          {!streakStats.hasCheckedInToday && !isLoading && (
            <a href={ctaHref} className={styles.cta}>
              {ctaLabel}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
