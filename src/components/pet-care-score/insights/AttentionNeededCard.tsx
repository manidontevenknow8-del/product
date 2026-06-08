import type { AttentionItem } from '@/types/petCareScore';
import styles from './AttentionNeededCard.module.css';

type AttentionNeededCardProps = {
  items: AttentionItem[];
};

export function AttentionNeededCard({ items }: AttentionNeededCardProps) {
  if (items.length === 0) return null;

  return (
    <article className={styles.card}>
      <h2 className={styles.title}>Gentle reminders</h2>
      <p className={styles.subtitle}>
        Small opportunities to strengthen your care score - no pressure, just helpful nudges.
      </p>
      <div className={styles.list}>
        {items.map((item) => (
          <div key={item.id} className={styles.item}>
            <h3 className={styles.itemTitle}>{item.title}</h3>
            <p className={styles.itemDesc}>{item.description}</p>
          </div>
        ))}
      </div>
    </article>
  );
}
