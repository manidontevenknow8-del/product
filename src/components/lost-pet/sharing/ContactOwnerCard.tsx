import type { EmergencyContact } from '@/types/lostPet';
import styles from './ContactOwnerCard.module.css';

type ContactOwnerCardProps = {
  contacts: EmergencyContact[];
};

export function ContactOwnerCard({ contacts }: ContactOwnerCardProps) {
  return (
    <article className={styles.card}>
      <h2 className={styles.title}>Emergency contacts</h2>
      <div className={styles.list}>
        {contacts.map((contact) => (
          <div key={contact.phone} className={styles.contact}>
            <div className={styles.info}>
              <p className={styles.name}>{contact.name}</p>
              <p className={styles.role}>{contact.role}</p>
            </div>
            <a href={`tel:${contact.phone.replace(/\D/g, '')}`} className={styles.phone}>
              Call
            </a>
          </div>
        ))}
      </div>
    </article>
  );
}
