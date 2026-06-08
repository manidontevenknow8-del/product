import { useState, type ReactNode } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import type { PremiumFeature } from '@/subscription/featureGates';
import { hasPremiumAccess } from '@/subscription/featureGates';
import { PremiumUpgradePrompt } from './PremiumUpgradePrompt';
import { UpgradeModal } from './UpgradeModal';
import styles from './PremiumGate.module.css';

type PremiumFeatureGuardProps = {
  feature: PremiumFeature;
  children: ReactNode;
  compact?: boolean;
  fallback?: ReactNode;
};

/**
 * Locks premium features unless profiles.subscription_status is active
 * (with subscription_tier fallback for founding/manual grants).
 */
export function PremiumFeatureGuard({
  feature,
  children,
  compact = false,
  fallback,
}: PremiumFeatureGuardProps) {
  const { user } = useAuth();
  const { canAccess } = useSubscription();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const allowed =
    hasPremiumAccess({
      subscriptionStatus: user?.subscriptionStatus,
      subscriptionTier: user?.subscriptionTier,
    }) && canAccess(feature);

  if (allowed) {
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
