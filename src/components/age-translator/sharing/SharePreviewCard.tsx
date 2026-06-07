import type { PetAgeProfile, AgeTranslation } from '@/types/ageTranslator';
import styles from './SharePreviewCard.module.css';

type SharePreviewCardProps = {
  pet: PetAgeProfile;
  translation: AgeTranslation;
};

export function SharePreviewCard({ pet, translation }: SharePreviewCardProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.preview} aria-label="Instagram story preview">
        <div className={styles.avatar}>{pet.avatarInitials}</div>
        <div className={styles.humanAge}>{translation.humanEquivalent}</div>
        <span className={styles.label}>Human years</span>
        <p className={styles.quote}>
          &ldquo;{pet.name} is {translation.humanEquivalent} in human years
          and {translation.lifeStageTagline.toLowerCase()}&rdquo;
        </p>
        <span className={styles.brand}>petclues.app</span>
      </div>
      <p className={styles.caption}>Story preview · 9:16 format</p>
    </div>
  );
}
