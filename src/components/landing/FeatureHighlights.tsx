import { LANDING_IMG } from '@/data/landingImages';
import { OptimizedImage } from '@/components/ui';
import styles from './FeatureHighlights.module.css';

type FeatureSpan = 'wide' | 'trio' | 'full';

const features: {
  title: string;
  description: string;
  image: string;
  alt: string;
  span: FeatureSpan;
}[] = [
  {
    title: 'PetClues Scan',
    description:
      'Upload vet bills, lab results, and prescriptions. PetClues organizes pet health documents into a searchable digital vault.',
    image: LANDING_IMG.scan,
    alt: 'Pet parent scanning dog health records with a smartphone app',
    span: 'wide',
  },
  {
    title: 'Emergency Passport',
    description:
      'Critical allergies, medications, and vet contacts - ready to share with sitters, groomers, or emergency clinics in one tap.',
    image: LANDING_IMG.passport,
    alt: 'Pet emergency passport with medical details and ID information',
    span: 'wide',
  },
  {
    title: 'Smart reminders',
    description:
      'Pet vaccination reminders, medication alerts, and vet visit due dates - with email nudges 7, 3, and 1 day before.',
    image: LANDING_IMG.reminders,
    alt: 'Pet vaccination and medication reminder calendar on phone',
    span: 'trio',
  },
  {
    title: 'PetCare Score',
    description:
      'See how organized your pet health records are - profile completeness, reminders, documents, and care gaps at a glance.',
    image: LANDING_IMG.score,
    alt: 'Pet wellness score dashboard showing organized dog health records',
    span: 'trio',
  },
  {
    title: 'Daily check-in',
    description:
      'Log feeding and walk distance in under a minute. Build daily pet care habits and richer monthly health reports.',
    image: LANDING_IMG.checkin,
    alt: 'Daily dog feeding and walk check-in tracker on mobile',
    span: 'trio',
  },
  {
    title: 'Timeline / Memory Feed',
    description:
      'Every vet visit, vaccination, medication change, and milestone in one chronological pet health timeline.',
    image: LANDING_IMG.timeline,
    alt: 'Chronological pet health timeline with vet visits and milestones',
    span: 'full',
  },
];

const SPAN_CLASS: Record<FeatureSpan, string> = {
  wide: styles.featureWide,
  trio: styles.featureTrio,
  full: styles.featureFull,
};

export function FeatureHighlights() {
  return (
    <section id="features" className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <span className={`label ${styles.eyebrow}`}>Pet health app features</span>
          <h2 className={styles.title}>All-in-one pet health records &amp; care tools</h2>
          <p className={styles.subtitle}>
            Vaccination reminders, medical records, daily check-ins, and emergency passports -
            seven tools that work together so dog and cat parents stay organized.
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((feature) => (
            <article
              key={feature.title}
              className={`${styles.feature} ${SPAN_CLASS[feature.span]}`}
            >
              <div className={styles.media}>
                <OptimizedImage src={feature.image} alt={feature.alt} className={styles.image} />
              </div>
              <div className={styles.copy}>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
