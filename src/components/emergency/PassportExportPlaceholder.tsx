import { Button } from '@/components/ui';
import styles from './PassportExportPlaceholder.module.css';

export function PassportExportPlaceholder() {
  return (
    <section className={styles.card} aria-labelledby="passport-export-title">
      <div className={styles.header}>
        <h2 id="passport-export-title" className={styles.title}>
          Export passport
        </h2>
        <span className={styles.badge}>Coming soon</span>
      </div>
      <p className={styles.description}>
        Download a printable PDF of {`your pet's`} emergency passport — ideal for travel,
        boarding, and vet visits.
      </p>
      <div className={styles.actions}>
        <Button variant="secondary" size="md" disabled>
          Download PDF
        </Button>
        <p className={styles.hint}>PDF export will include identity, health records, and documents.</p>
      </div>
    </section>
  );
}
