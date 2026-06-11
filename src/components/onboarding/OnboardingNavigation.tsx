import { Button } from '@/components/ui';
import styles from './OnboardingNavigation.module.css';

type OnboardingNavigationProps = {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  showBack?: boolean;
  nextDisabled?: boolean;
  isIntro?: boolean;
};

export function OnboardingNavigation({
  onBack,
  onNext,
  nextLabel = 'Save & continue',
  showBack = true,
  nextDisabled = false,
  isIntro = false,
}: OnboardingNavigationProps) {
  if (isIntro) {
    return (
      <div className={`${styles.nav} ${styles.navSingle}`}>
        <Button variant="primary" size="lg" fullWidth onClick={onNext}>
          {nextLabel}
        </Button>
      </div>
    );
  }

  const hasBack = showBack && Boolean(onBack);

  return (
    <div className={`${styles.nav} ${hasBack ? '' : styles.navEnd}`.trim()}>
      {hasBack && onBack && (
        <Button variant="ghost" size="lg" onClick={onBack} className={styles.backBtn}>
          Back
        </Button>
      )}
      <Button
        variant="primary"
        size="lg"
        fullWidth={hasBack}
        onClick={onNext}
        disabled={nextDisabled}
      >
        {nextLabel}
      </Button>
    </div>
  );
}
