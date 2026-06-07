import styles from './SmartSuggestionsPlaceholder.module.css';

/**
 * Placeholder for future AI/automation integrations.
 * Connect breed-based rules, scan detection, and smart suggestions here.
 */
export function SmartSuggestionsPlaceholder() {
  return (
    <section className={styles.section} aria-label="Coming soon features">
      <h2 className={styles.title}>Smarter reminders, coming soon</h2>
      <p className={styles.subtitle}>
        PetClues will learn from your pet&apos;s profile, breed, and scanned documents
        to suggest the right reminders at the right time.
      </p>

      <div className={styles.grid}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>AI</span>
          <h3 className={styles.cardTitle}>Smart suggestions</h3>
          <p className={styles.cardText}>
            Personalized reminders based on your pet&apos;s age, breed, and health history.
          </p>
          <span className={styles.comingSoon}>Integration point: recommendation engine</span>
        </div>

        <div className={styles.card}>
          <span className={styles.cardLabel}>Breed</span>
          <h3 className={styles.cardTitle}>Breed-based care</h3>
          <p className={styles.cardText}>
            Pre-built schedules for common breed-specific care needs and seasonal tasks.
          </p>
          <span className={styles.comingSoon}>Integration point: breed care library</span>
        </div>

        <div className={styles.card}>
          <span className={styles.cardLabel}>Scan</span>
          <h3 className={styles.cardTitle}>Document detection</h3>
          <p className={styles.cardText}>
            Automatically create reminders from vaccination records and vet invoices.
          </p>
          <span className={styles.comingSoon}>Integration point: scan → reminder pipeline</span>
        </div>
      </div>
    </section>
  );
}
