import { Link } from 'react-router-dom';
import { usePetCareScore } from '@/petCareScore';
import { ROUTES } from '@/routes/paths';
import styles from './WeeklyInsightWidget.module.css';

export function WeeklyInsightWidget() {
  const { data } = usePetCareScore();

  if (!data) return null;

  const { weeklyInsight } = data;

  return (
    <article className={styles.card}>
      <span className={styles.eyebrow}>Weekly insight</span>
      <h2 className={styles.title}>{weeklyInsight.title}</h2>
      {weeklyInsight.highlight && (
        <span className={styles.highlight}>{weeklyInsight.highlight}</span>
      )}
      <p className={styles.message}>{weeklyInsight.message}</p>
      <Link to={ROUTES.PET_CARE_SCORE} className={styles.link}>
        Explore your score →
      </Link>
    </article>
  );
}
