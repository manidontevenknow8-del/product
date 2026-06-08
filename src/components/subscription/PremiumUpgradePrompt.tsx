import { Button } from '@/components/ui';
import { PRO_UPGRADE_COPY } from '@/data/proUpgradeCopy';
import type { PremiumFeature } from '@/subscription/featureGates';
import styles from './PremiumUpgradePrompt.module.css';

type PremiumUpgradePromptProps = {
  feature: PremiumFeature;
  onUpgrade?: () => void;
  compact?: boolean;
  /** Optional override for the emotional line (e.g. pet name). */
  emotionalOverride?: string;
};

export function PremiumUpgradePrompt({
  feature,
  onUpgrade,
  compact = false,
  emotionalOverride,
}: PremiumUpgradePromptProps) {
  const copy = PRO_UPGRADE_COPY[feature];

  return (
    <div className={`${styles.prompt} ${compact ? styles.compact : ''}`}>
      <div className={styles.content}>
        <span className={styles.badge}>Pro</span>
        <h3 className={styles.title}>{copy.headline}</h3>
        <p className={styles.description}>
          {emotionalOverride ?? copy.emotional}
        </p>
        <p className={styles.disclaimer}>{copy.disclaimer}</p>
      </div>
      {onUpgrade && (
        <Button variant="primary" onClick={onUpgrade}>
          Upgrade to Pro
        </Button>
      )}
    </div>
  );
}
