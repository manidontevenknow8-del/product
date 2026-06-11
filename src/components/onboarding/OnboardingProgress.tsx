import { ONBOARDING_STEPS, type OnboardingStepId } from '@/types/onboarding';
import styles from './OnboardingProgress.module.css';

type OnboardingProgressProps = {
  currentStep: OnboardingStepId;
};

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  const currentIndex = ONBOARDING_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div
      className={`${styles.progress} ${styles.editorial}`}
      role="progressbar"
      aria-valuenow={currentIndex + 1}
      aria-valuemin={1}
      aria-valuemax={ONBOARDING_STEPS.length}
      aria-label="Onboarding progress"
    >
      {ONBOARDING_STEPS.map((step, i) => (
        <span
          key={step.id}
          className={`${styles.segment} ${i <= currentIndex ? styles.segmentComplete : ''}`.trim()}
          aria-hidden
        />
      ))}
    </div>
  );
}
