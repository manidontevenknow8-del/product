import { Link } from 'react-router-dom';
import { PetCareScoreCard } from '@/components/pet-care-score';
import { usePetCareScore } from '@/petCareScore';
import { getEncouragingMessage } from '@/utils/petCareScoreUtils';
import { ROUTES } from '@/routes/paths';
import styles from './PetCareScoreWidget.module.css';

export function PetCareScoreWidget() {
  const { data, isLoading } = usePetCareScore();

  if (isLoading || !data) {
    return (
      <article className={styles.widget}>
        <PetCareScoreCard
          snapshot={{
            score: 0,
            label: 'Loading',
            summary: '',
            trend: 'stable',
            trendDelta: 0,
            lastUpdated: '…',
          }}
          compact
        />
      </article>
    );
  }

  return (
    <Link to={ROUTES.PET_CARE_SCORE} className={styles.widget}>
      <PetCareScoreCard snapshot={data.snapshot} compact />
      <div className={styles.footer}>
        <span className={styles.encouragement}>
          {getEncouragingMessage(data.snapshot)}
        </span>
        <span className={styles.link}>View full score →</span>
      </div>
    </Link>
  );
}
