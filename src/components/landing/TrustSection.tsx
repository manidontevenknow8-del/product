import { LANDING_IMG } from '@/data/landingImages';
import { OptimizedImage } from '@/components/ui';
import styles from './TrustSection.module.css';

const trustPoints = [
  {
    title: 'Peace of mind',
    description:
      'Pet allergies, medications, and vet contacts stay safe, current, and ready - online or in an emergency.',
  },
  {
    title: 'Organized records',
    description:
      'Scattered vet bills and paper folders become one searchable pet medical records vault.',
  },
  {
    title: 'Smart reminders',
    description:
      'Pet medication reminders and vaccine due-date alerts - timely, unobtrusive, never overwhelming.',
  },
  {
    title: 'Easy sharing',
    description:
      'Share what matters with sitters, family, or emergency clinics in a single tap.',
  },
];

export function TrustSection() {
  return (
    <section id="trust" className={styles.section}>
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.visual}>
            <OptimizedImage
              src={LANDING_IMG.trust}
              alt="Trusted pet care items including stethoscope and resting cat"
              className={styles.visualImg}
            />
          </div>

          <div className={styles.content}>
            <span className={`label ${styles.eyebrow}`}>Why PetClues</span>
            <h2 className={styles.title}>Care you can trust, designed with intention</h2>
            <p className={styles.lead}>
              We built PetClues for pet parents who want clarity without complexity - a calm
              companion for every stage of your pet&apos;s life, from playful years to gentle
              seniors.
            </p>

            <div className={styles.grid}>
              {trustPoints.map((point) => (
                <article key={point.title} className={styles.trustCard}>
                  <h3 className={styles.trustTitle}>{point.title}</h3>
                  <p className={styles.trustDesc}>{point.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
