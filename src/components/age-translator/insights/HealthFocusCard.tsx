import type { HealthFocus } from '@/types/ageTranslator';
import styles from './HealthFocusCard.module.css';

type HealthFocusCardProps = {
  items: HealthFocus[];
};

export function HealthFocusCard({ items }: HealthFocusCardProps) {
  return (
    <article className={styles.card}>
      <h2 className={styles.title}>Health focus now</h2>
      <div className={styles.list}>
        {items.map((item) => (
          <div
            key={item.title}
            className={`${styles.item} ${item.priority === 'primary' ? styles.itemPrimary : ''}`}
          >
            <h3 className={styles.itemTitle}>{item.title}</h3>
            <p className={styles.itemDesc}>{item.description}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
