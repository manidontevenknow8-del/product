import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { isPaymentsLive, PAYMENTS_COMING_SOON_MESSAGE } from '@/config/paymentsConfig';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import type { BillingInterval } from '@/types/subscription';
import styles from './UpgradeModal.module.css';

type UpgradeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function UpgradeModal({ isOpen, onClose, onSuccess }: UpgradeModalProps) {
  const { startCheckout } = useSubscription();
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    setError(null);
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const price = interval === 'yearly' ? 79 : 9;
  const paymentsLive = isPaymentsLive();

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      await startCheckout(interval);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <h2 className={styles.title}>Upgrade to Premium</h2>
          <p className={styles.subtitle}>
            Unlock Vet Bill Decoder, unlimited pets, advanced PetCare Score, and more.
          </p>
        </div>

        <div className={styles.toggle}>
          <button
            type="button"
            className={`${styles.toggleBtn} ${interval === 'monthly' ? styles.toggleBtnActive : ''}`}
            onClick={() => setInterval('monthly')}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${interval === 'yearly' ? styles.toggleBtnActive : ''}`}
            onClick={() => setInterval('yearly')}
          >
            Yearly
          </button>
        </div>

        <div className={styles.priceDisplay}>
          <div className={styles.priceAmount}>${price}</div>
          <div className={styles.priceNote}>
            {interval === 'yearly' ? 'Billed annually · Save $29/year' : 'Billed monthly · Cancel anytime'}
          </div>
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
            {loading ? 'Redirecting…' : paymentsLive ? 'Continue to checkout' : 'Coming soon'}
          </Button>
        </div>

        <p className={styles.note}>
          {paymentsLive
            ? 'Secure checkout powered by Razorpay. Manage or cancel anytime from Billing.'
            : PAYMENTS_COMING_SOON_MESSAGE}
        </p>
      </div>
    </div>
  );
}
