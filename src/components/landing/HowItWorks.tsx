import { LANDING_IMG } from '@/data/landingImages';
import { OptimizedImage } from '@/components/ui';
import styles from './HowItWorks.module.css';

const steps = [
  {
    number: '01',
    title: 'Add your pet',
    description:
      'Create a profile in minutes - breed, age, photo, and care preferences become the foundation for everything else.',
  },
  {
    number: '02',
    title: 'Scan & upload records',
    description:
      'Upload vet bills, lab results, and vaccination certificates. PetClues builds a searchable pet health timeline automatically.',
  },
  {
    number: '03',
    title: 'Set reminders',
    description:
      'Set pet vaccination reminders and medication alerts. Email and in-app nudges arrive 7, 3, and 1 day before each due date.',
  },
  {
    number: '04',
    title: 'Share when it matters',
    description:
      'Emergency Passport puts critical details in the right hands - sitters, family, or clinics when seconds count.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className={styles.section}>
      <div className="container">
        <div className={styles.layout}>
          <div className={styles.visual}>
            <OptimizedImage
              src={LANDING_IMG.how}
              alt="Couple relaxing at home with their dog and cat"
              className={styles.visualImg}
            />
          </div>

          <div className={styles.content}>
            <span className={`label ${styles.eyebrow}`}>How it works</span>
            <h2 className={styles.title}>Simple by design</h2>
            <p className={styles.subtitle}>
              From first profile to peace of mind - four calm steps that mirror how you already
              care for your pet, with less mental load.
            </p>

            <ol className={styles.steps}>
              {steps.map((step) => (
                <li key={step.number} className={styles.step}>
                  <span className={styles.stepNumber}>{step.number}</span>
                  <div className={styles.stepBody}>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepDesc}>{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
