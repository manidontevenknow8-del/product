import { useState } from 'react';
import type { PetAgeProfile, AgeTranslation } from '@/types/ageTranslator';
import { buildShareUrl } from '@/utils/ageTranslatorUtils';
import styles from './AgeShareCard.module.css';

type AgeShareCardProps = {
  pet: PetAgeProfile;
  translation: AgeTranslation;
};

export function AgeShareCard({ pet, translation }: AgeShareCardProps) {
  const [copied, setCopied] = useState(false);
  const message = `${translation.shareMessage} Discover your pet's age at PetClues.`;

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className={styles.card}>
      <div className={styles.avatar}>{pet.avatarInitials}</div>
      <h2 className={styles.headline}>{translation.storyHeadline}</h2>
      <p className={styles.message}>{translation.shareMessage}</p>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{translation.petAge.years}</span>
          <span className={styles.statLabel}>Pet years</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{translation.humanEquivalent}</span>
          <span className={styles.statLabel}>Human years</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{translation.lifeStageLabel.split(' ')[0]}</span>
          <span className={styles.statLabel}>Life stage</span>
        </div>
      </div>

      <span className={styles.brand}>PetClues · Pet Age Translator</span>

      <div className={styles.actions}>
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={copyMessage}>
          {copied ? 'Copied!' : 'Copy message'}
        </button>
        <a
          href={buildShareUrl(message, 'whatsapp')}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.btn}
        >
          WhatsApp
        </a>
        <a
          href={buildShareUrl(message, 'twitter')}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.btn}
        >
          Share on X
        </a>
      </div>
    </article>
  );
}
