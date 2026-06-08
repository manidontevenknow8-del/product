import type { AgeTranslation } from '@/types/ageTranslator';
import styles from './HumanEquivalentCard.module.css';

type HumanEquivalentCardProps = {
  petName: string;
  translation: AgeTranslation;
};

export function HumanEquivalentCard({ petName, translation }: HumanEquivalentCardProps) {
  return (
    <article className={styles.card}>
      <span className={styles.eyebrow}>Human equivalent</span>
      <div className={styles.humanAge}>{translation.humanEquivalent}</div>
      <p className={styles.subtitle}>
        If {petName} were a person, they&apos;d be about {translation.humanEquivalent} years
        old - {translation.lifeStageTagline.toLowerCase()}.
      </p>
      <blockquote className={styles.story}>
        &ldquo;{translation.shareMessage}&rdquo;
      </blockquote>
      <p className={styles.disclaimer}>
        Educational estimate only - not medical advice. Every pet ages uniquely.
      </p>
    </article>
  );
}
