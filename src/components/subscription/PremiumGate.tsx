import { useState, type ReactNode } from 'react';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import type { PremiumFeature } from '@/subscription/featureGates';
import { PremiumUpgradePrompt } from './PremiumUpgradePrompt';
import { UpgradeModal } from './UpgradeModal';
import styles from './PremiumGate.module.css';

type PremiumGateProps = {
  feature: PremiumFeature;
  children: ReactNode;
  compact?: boolean;
  fallback?: ReactNode;
};

export function PremiumGate({
  feature,
  children,
  compact = false,
  fallback,
}: PremiumGateProps) {
  const { canAccess } = useSubscription();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  if (canAccess(feature)) {
    return <>{children}</>;
  }

  const prompt = fallback ?? (
    <PremiumUpgradePrompt
      feature={feature}
      compact={compact}
      onUpgrade={() => setUpgradeOpen(true)}
    />
  );

  return (
    <>
      {compact ? (
        prompt
      ) : (
        <div className={styles.premiumGate}>
          <div className={styles.locked}>{children}</div>
          <div className={styles.overlay}>{prompt}</div>
        </div>
      )}
      <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </>
  );
}
