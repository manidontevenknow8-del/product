import { Button } from '@/components/ui';
import type { LostPetCase } from '@/types/lostPet';
import { formatDateTime } from '@/utils/lostPetUtils';
import type { EmergencyContact } from '@/types/lostPet';
import styles from './LostPetPoster.module.css';

type LostPetPosterProps = {
  activeCase: LostPetCase;
  primaryContact: EmergencyContact;
  onDownload?: () => void;
};

export function LostPetPoster({
  activeCase,
  primaryContact,
  onDownload,
}: LostPetPosterProps) {
  return (
    <section aria-label="Lost pet poster preview">
      <div className={styles.poster}>
        <div className={styles.header}>
          <p className={styles.missing}>Missing pet</p>
          <h2 className={styles.petName}>{activeCase.petName}</h2>
        </div>

        <div className={styles.body}>
          <div className={styles.photo}>{activeCase.avatarInitials}</div>

          <div className={styles.details}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Breed</span>
              <br />
              {activeCase.breed}
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Last seen</span>
              <br />
              {activeCase.lastSeenLocation}
              <br />
              <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
                {formatDateTime(activeCase.lastSeenAt)}
              </span>
            </div>
            {activeCase.notes && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Description</span>
                <br />
                {activeCase.notes}
              </div>
            )}
          </div>

          <div className={styles.contact}>
            <span className={styles.detailLabel}>If found, contact</span>
            <p className={styles.contactPhone}>{primaryContact.phone}</p>
            <span>{primaryContact.name}</span>
          </div>
        </div>

        <div className={styles.footer}>
          PetClues Recovery · Scan QR for full details
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" size="md" onClick={onDownload}>
          Download poster (demo)
        </Button>
      </div>
    </section>
  );
}
