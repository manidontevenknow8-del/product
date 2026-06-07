import styles from './PetMatchProgress.module.css';

type PetMatchProgressProps = {
  currentStep: number;
  totalSteps: number;
};

export function PetMatchProgress({ currentStep, totalSteps }: PetMatchProgressProps) {
  const progress = Math.round((currentStep / totalSteps) * 100);
  return (
    <div className={styles.wrapper} aria-label="Questionnaire progress">
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${progress}%` }} />
      </div>
      <span className={styles.label}>{progress}% complete</span>
    </div>
  );
}
