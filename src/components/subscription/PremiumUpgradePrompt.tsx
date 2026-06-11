import { Button } from '@/components/ui';
import { getUpgradeCopyForFeature } from '@/data/planUpgradeCopy';
import type { CommercialPlan, PlanFeature, PremiumFeature } from '@/subscription/entitlements';
import styles from './PremiumUpgradePrompt.module.css';

type PremiumUpgradePromptProps = {
  feature: PremiumFeature | PlanFeature;
  currentPlan?: CommercialPlan;
  onUpgrade?: () => void;
  compact?: boolean;
  emotionalOverride?: string;
};

export function PremiumUpgradePrompt({
  feature,
  currentPlan = 'free',
  onUpgrade,
  compact = false,
  emotionalOverride,
}: PremiumUpgradePromptProps) {
  const copy = getUpgradeCopyForFeature(currentPlan, feature);

  return (
    <div className={`${styles.prompt} ${compact ? styles.compact : ''}`}>
      <div className={styles.content}>
        <span className={styles.badge}>{copy.badge}</span>
        <h3 className={styles.title}>{copy.headline}</h3>
        <p className={styles.description}>
          {emotionalOverride ?? copy.emotional}
        </p>
        <p className={styles.disclaimer}>{copy.disclaimer}</p>
      </div>
      {onUpgrade && (
        <Button variant="primary" onClick={onUpgrade}>
          {copy.cta}
        </Button>
      )}
    </div>
  );
}
