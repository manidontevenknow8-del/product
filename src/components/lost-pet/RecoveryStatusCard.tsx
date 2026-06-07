import type { LostPetCase, RecoveryStats } from '@/types/lostPet';
import { formatLastUpdated } from '@/utils/lostPetUtils';
import styles from './RecoveryStatusCard.module.css';

const phaseLabels: Record<RecoveryStats['phase'], string> = {
  activated: 'Recovery activated',
  sharing: 'Sharing in progress',
  monitoring: 'Monitoring sightings',
  found: 'Pet recovered',
};

type RecoveryStatusCardProps = {
  activeCase: LostPetCase;
  stats: RecoveryStats;
};

export function RecoveryStatusCard({ activeCase, stats }: RecoveryStatusCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Recovery status</span>
          <h2 className={styles.phase}>{phaseLabels[stats.phase]}</h2>
        </div>
        <span className={styles.updated}>
          Updated {formatLastUpdated(activeCase.lastUpdatedAt)}
        </span>
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${stats.progressPercent}%` }}
        />
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.sightingsCount}</span>
          <span className={styles.statLabel}>Sightings</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.reportsReceived}</span>
          <span className={styles.statLabel}>Reports</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{stats.sharesCount}</span>
          <span className={styles.statLabel}>Shares</span>
        </div>
      </div>
    </article>
  );
}
