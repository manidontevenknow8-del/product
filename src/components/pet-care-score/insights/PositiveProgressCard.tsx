import type { PositiveProgress } from '@/types/petCareScore';
import styles from './PositiveProgressCard.module.css';

type PositiveProgressCardProps = {
  items: PositiveProgress[];
};

export function PositiveProgressCard({ items }: PositiveProgressCardProps) {
  return (
    <article className={styles.card}>
      <h2 className={styles.title}>Your progress</h2>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <span className={styles.check} aria-hidden="true">✓</span>
            {item.message}
          </li>
        ))}
      </ul>
    </article>
  );
}
