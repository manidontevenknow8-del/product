import { Button } from '@/components/ui';
import { FEATURE_LABELS, type PremiumFeature } from '@/subscription/featureGates';
import styles from './PremiumUpgradePrompt.module.css';

type PremiumUpgradePromptProps = {
  feature: PremiumFeature;
  onUpgrade?: () => void;
  compact?: boolean;
};

export function PremiumUpgradePrompt({
  feature,
  onUpgrade,
  compact = false,
}: PremiumUpgradePromptProps) {
  return (
    <div className={`${styles.prompt} ${compact ? styles.compact : ''}`}>
      <div className={styles.content}>
        <span className={styles.badge}>Premium</span>
        <h3 className={styles.title}>{FEATURE_LABELS[feature]}</h3>
        <p className={styles.description}>
          Upgrade to Premium to unlock {FEATURE_LABELS[feature].toLowerCase()} and the full
          PetClues experience.
        </p>
      </div>
      {onUpgrade && (
        <Button variant="primary" onClick={onUpgrade}>
          Upgrade to Premium
        </Button>
      )}
    </div>
  );
}
