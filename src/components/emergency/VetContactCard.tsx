import type { VetContact } from '@/types/passport';
import styles from './VetContactCard.module.css';

type VetContactCardProps = {
  contact: VetContact;
};

export function VetContactCard({ contact }: VetContactCardProps) {
  return (
    <section className={styles.card} aria-labelledby="vet-contact-title">
      <h2 id="vet-contact-title" className={styles.title}>
        Veterinarian
      </h2>

      <div className={styles.field}>
        <span className={styles.label}>Vet name</span>
        <p className={styles.value}>{contact.vetName}</p>
      </div>
      <div className={styles.field}>
        <span className={styles.label}>Clinic</span>
        <p className={styles.value}>{contact.clinic}</p>
      </div>
      <div className={styles.field}>
        <span className={styles.label}>Phone</span>
        <a href={`tel:${contact.phone}`} className={styles.phone}>
          {contact.phone}
        </a>
      </div>

      <div className={styles.hotline}>
        <span className={styles.label}>Emergency hotline</span>
        <a href={`tel:${contact.emergencyHotline}`} className={styles.phone}>
          {contact.emergencyHotline}
        </a>
      </div>
    </section>
  );
}
