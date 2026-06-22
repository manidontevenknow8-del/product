import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import {
  getAnnualMembershipDisplay,
  getFoundingDiscountedDisplay,
} from '@/config/razorpayConfig';
import { isPaymentsLive, PAYMENTS_COMING_SOON_MESSAGE } from '@/config/paymentsConfig';
import { useBillingRegion } from '@/hooks/useBillingRegion';
import { useAuth } from '@/auth/AuthProvider';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import { PLAN_LABELS } from '@/subscription/entitlements';
import type { CheckoutPlan } from '@/types/subscription';
import styles from './UpgradeModal.module.css';
import { getUserFacingError } from '@/utils/userFacingErrors';

type UpgradeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  targetPlan?: CheckoutPlan;
};

export function UpgradeModal({
  isOpen,
  onClose,
  onSuccess,
  targetPlan = 'pro',
}: UpgradeModalProps) {
  const { user } = useAuth();
  const { currency, countryCode } = useBillingRegion();
  const { startCheckout, refresh } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    setError(null);
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const paymentsLive = isPaymentsLive();
  const planLabel = PLAN_LABELS[targetPlan];
  const priceDisplay =
    targetPlan === 'pro' && user?.foundingLifetimeDiscount
      ? `${getFoundingDiscountedDisplay(currency)} / year`
      : getAnnualMembershipDisplay(targetPlan, currency);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      await startCheckout(targetPlan, currency, { countryCode });
      await refresh();
      onSuccess?.();
      onClose();
    } catch (err) {
      const message = getUserFacingError(err, 'payment', 'Checkout failed');
      if (message !== 'Checkout canceled') {
        setError(message);
      }
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <h2 className={styles.title}>Join PetClues {planLabel}</h2>
          <p className={styles.subtitle}>
            {targetPlan === 'plus'
              ? 'Annual membership for organized pet parents — records, reminders, and family sharing.'
              : 'Annual membership with AI insights, priority support, and future premium features.'}
          </p>
        </div>

        <div className={styles.priceDisplay}>
          <div className={styles.priceAmount}>{priceDisplay}</div>
          <div className={styles.priceNote}>Billed annually · Secure Razorpay checkout</div>
        </div>

        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <Button variant="ghost" size="lg" fullWidth onClick={onClose}>
            Not now
          </Button>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleUpgrade}
            disabled={loading || !paymentsLive}
          >
            {loading ? 'Opening checkout…' : paymentsLive ? 'Pay with Razorpay' : 'Coming soon'}
          </Button>
        </div>

        <p className={styles.note}>
          {paymentsLive
            ? 'Secure checkout powered by Razorpay. Manage your membership from Billing.'
            : PAYMENTS_COMING_SOON_MESSAGE}
        </p>
      </div>
    </div>
  );
}
