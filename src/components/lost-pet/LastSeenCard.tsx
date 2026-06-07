import type { LostPetCase } from '@/types/lostPet';
import { formatDateTime } from '@/utils/lostPetUtils';
import styles from './LastSeenCard.module.css';

type LastSeenCardProps = {
  activeCase: LostPetCase;
};

export function LastSeenCard({ activeCase }: LastSeenCardProps) {
  return (
    <article className={styles.card}>
      <span className={styles.eyebrow}>Last seen</span>
      <p className={styles.location}>{activeCase.lastSeenLocation}</p>
      <p className={styles.datetime}>{formatDateTime(activeCase.lastSeenAt)}</p>
      {activeCase.notes && (
        <div className={styles.notes}>
          <span className={styles.notesLabel}>Notes</span>
          {activeCase.notes}
        </div>
      )}
    </article>
  );
}
