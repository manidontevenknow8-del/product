import { UPCOMING_FEATURES } from '@/data/growthData';
import styles from './UpcomingFeaturesTeaser.module.css';

export function UpcomingFeaturesTeaser() {
  return (
    <section className={styles.section} aria-label="Upcoming features">
      <h2 className={styles.title}>What&apos;s coming</h2>
      <p className={styles.subtitle}>
        What we&apos;re building next for PetClues members.
      </p>

      <div className={styles.list}>
        {UPCOMING_FEATURES.map((feature) => (
          <article key={feature.id} className={styles.item}>
            <span className={styles.eta}>{feature.eta}</span>
            <h3 className={styles.itemTitle}>{feature.title}</h3>
            <p className={styles.itemDesc}>{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
