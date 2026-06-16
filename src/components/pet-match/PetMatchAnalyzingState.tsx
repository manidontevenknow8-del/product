import styles from './PetMatchAnalyzingState.module.css';

export function PetMatchAnalyzingState() {
  return (
    <div className={styles.wrap}>
      <div className={styles.dots} aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={styles.dot}
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
      <p className={styles.eyebrow}>Pet Match Engine</p>
      <h2 className={styles.title}>Analyzing lifestyle compatibility…</h2>
      <p className={styles.lead}>
        Cross-referencing your sanctuary, rhythm, and care capacity with our breed library.
      </p>
    </div>
  );
}
