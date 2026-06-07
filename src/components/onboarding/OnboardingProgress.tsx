import { ONBOARDING_STEPS, type OnboardingStepId } from '@/types/onboarding';
import styles from './OnboardingProgress.module.css';

type OnboardingProgressProps = {
  currentStep: OnboardingStepId;
};

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  const currentIndex = ONBOARDING_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemin={1} aria-valuemax={ONBOARDING_STEPS.length}>
      <div className={styles.progress}>
        {ONBOARDING_STEPS.map((step, i) => (
          <div
            key={step.id}
            className={`${styles.segment} ${
              i < currentIndex
                ? styles.segmentComplete
                : i === currentIndex
                  ? styles.segmentActive
                  : ''
            }`}
          />
        ))}
      </div>
      <div className={styles.labels}>
        {ONBOARDING_STEPS.map((step, i) => (
          <span
            key={step.id}
            className={`${styles.stepLabel} ${
              i === currentIndex
                ? styles.stepLabelActive
                : i < currentIndex
                  ? styles.stepLabelComplete
                  : ''
            }`}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
}
