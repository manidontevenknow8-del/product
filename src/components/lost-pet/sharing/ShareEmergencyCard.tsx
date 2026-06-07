import type { LostPetCase } from '@/types/lostPet';
import styles from './ShareEmergencyCard.module.css';

type ShareEmergencyCardProps = {
  activeCase: LostPetCase;
  onCopyLink?: () => void;
};

export function ShareEmergencyCard({ activeCase, onCopyLink }: ShareEmergencyCardProps) {
  const copyLink = async () => {
    await navigator.clipboard.writeText(activeCase.recoveryLink);
    onCopyLink?.();
  };

  return (
    <article className={styles.card}>
      <p className={styles.eyebrow}>Share card</p>
      <h2 className={styles.title}>{activeCase.petName} is missing</h2>
      <p className={styles.breed}>{activeCase.breed}</p>

      <div className={styles.avatar}>{activeCase.avatarInitials}</div>

      <p className={styles.cta}>
        Help us bring {activeCase.petName} home safely.
        Share this card with your local community.
      </p>

      <div className={styles.actions}>
        <button type="button" className={styles.btn} onClick={copyLink}>
          Copy recovery link
        </button>
        <button type="button" className={`${styles.btn} ${styles.btnOutline}`} disabled>
          Social image
        </button>
      </div>

      <p className={styles.placeholder}>
        Social-ready image export coming soon
      </p>
    </article>
  );
}
