import type { AgeTranslation } from '@/types/ageTranslator';
import type { LifeStageInsight } from '@/types/ageTranslator';
import styles from './LifeStageCard.module.css';

const stageProgress: Record<string, number> = {
  puppy: 15,
  young_adult: 35,
  adult: 55,
  mature: 78,
  senior: 92,
};

type LifeStageCardProps = {
  translation: AgeTranslation;
  insight: LifeStageInsight;
};

export function LifeStageCard({ translation, insight }: LifeStageCardProps) {
  const progress = stageProgress[translation.lifeStage] ?? 50;

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Life stage</span>
          <h2 className={styles.stage}>{translation.lifeStageLabel}</h2>
        </div>
        <span className={styles.badge}>{translation.lifeStageLabel}</span>
      </div>

      <p className={styles.tagline}>{translation.lifeStageTagline}</p>
      <p className={styles.meaning}>{insight.meaning}</p>

      <div className={styles.progress}>
        <div className={styles.progressLabel}>
          <span>Life journey</span>
          <span>{progress}%</span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      </div>
    </article>
  );
}
