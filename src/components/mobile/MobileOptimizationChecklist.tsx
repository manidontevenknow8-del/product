import { MOBILE_OPTIMIZATION_ITEMS } from '@/data/launchReadinessData';
import styles from './MobileOptimizationChecklist.module.css';

export function MobileOptimizationChecklist() {
  const passed = MOBILE_OPTIMIZATION_ITEMS.filter((i) => i.status === 'pass').length;
  const total = MOBILE_OPTIMIZATION_ITEMS.length;

  return (
    <article className={styles.checklist}>
      <h2 className={styles.title}>Mobile optimization checklist</h2>
      <p className={styles.subtitle}>
        Platform-wide responsive refinements applied across navigation, forms, cards, and modals.
      </p>

      <ul className={styles.list}>
        {MOBILE_OPTIMIZATION_ITEMS.map((item) => (
          <li key={item.id} className={styles.item}>
            <span
              className={`${styles.status} ${item.status === 'pass' ? styles.pass : styles.partial}`}
              aria-hidden="true"
            >
              {item.status === 'pass' ? '✓' : '~'}
            </span>
            <div className={styles.content}>
              <div className={styles.itemTitle}>{item.title}</div>
              <div className={styles.itemDesc}>{item.description}</div>
            </div>
          </li>
        ))}
      </ul>

      <p className={styles.summary}>
        <strong>{passed}/{total}</strong> mobile checks complete for V1 launch.
      </p>
    </article>
  );
}
