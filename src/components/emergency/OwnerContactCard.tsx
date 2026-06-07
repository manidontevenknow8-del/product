import type { OwnerContact } from '@/types/passport';
import styles from './OwnerContactCard.module.css';

type OwnerContactCardProps = {
  contacts: OwnerContact;
};

export function OwnerContactCard({ contacts }: OwnerContactCardProps) {
  const entries = [
    {
      role: 'Primary owner',
      name: contacts.primaryOwner.name,
      details: [contacts.primaryOwner.phone, contacts.primaryOwner.email],
    },
    {
      role: 'Secondary contact',
      name: contacts.secondaryContact.name,
      details: [
        contacts.secondaryContact.phone,
        contacts.secondaryContact.relationship,
      ],
    },
    {
      role: 'Emergency contact',
      name: contacts.emergencyContact.name,
      details: [
        contacts.emergencyContact.phone,
        contacts.emergencyContact.relationship,
      ],
    },
  ];

  return (
    <section className={styles.card} aria-labelledby="owner-contact-title">
      <h2 id="owner-contact-title" className={styles.title}>
        Owner & contacts
      </h2>

      <div className={styles.contacts}>
        {entries.map((entry) => (
          <div key={entry.role} className={styles.contact}>
            <span className={styles.role}>{entry.role}</span>
            <p className={styles.name}>{entry.name}</p>
            {entry.details.map((detail, i) =>
              i === 0 && detail.startsWith('+') ? (
                <a key={detail} href={`tel:${detail}`} className={styles.phone}>
                  {detail}
                </a>
              ) : (
                <p key={detail} className={styles.detail}>
                  {detail}
                </p>
              ),
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
