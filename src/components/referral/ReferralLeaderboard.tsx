import type { LeaderboardEntry, LeaderboardPeriod } from '@/types/growth';
import styles from './ReferralLeaderboard.module.css';

type ReferralLeaderboardProps = {
  entries: LeaderboardEntry[];
  period: LeaderboardPeriod;
  onPeriodChange: (period: LeaderboardPeriod) => void;
};

export function ReferralLeaderboard({
  entries,
  period,
  onPeriodChange,
}: ReferralLeaderboardProps) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Leaderboard</h2>
        <div className={styles.tabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={period === 'weekly'}
            className={`${styles.tab} ${period === 'weekly' ? styles.tabActive : ''}`}
            onClick={() => onPeriodChange('weekly')}
          >
            This week
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={period === 'alltime'}
            className={`${styles.tab} ${period === 'alltime' ? styles.tabActive : ''}`}
            onClick={() => onPeriodChange('alltime')}
          >
            All time
          </button>
        </div>
      </div>

      <div className={styles.list}>
        {entries.length === 0 ? (
          <p className={styles.empty}>
            No referrals on the board yet. Share your link to start climbing.
          </p>
        ) : entries.map((entry) => (
          <div
            key={`${entry.rank}-${entry.name}`}
            className={`${styles.row} ${entry.isCurrentUser ? styles.rowYou : ''}`}
          >
            <span
              className={`${styles.rank} ${entry.rank <= 3 ? styles.rankTop : ''}`}
            >
              {entry.rank}
            </span>
            <span className={styles.name}>{entry.name}</span>
            <span className={styles.count}>
              <span className={styles.countValue}>{entry.referralCount}</span> referrals
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
