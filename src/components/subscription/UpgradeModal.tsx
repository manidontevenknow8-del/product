import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { PRO_MONTHLY_PRICE_DISPLAY } from '@/config/razorpayConfig';
import { isPaymentsLive, PAYMENTS_COMING_SOON_MESSAGE } from '@/config/paymentsConfig';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import styles from './UpgradeModal.module.css';

type UpgradeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function UpgradeModal({ isOpen, onClose, onSuccess }: UpgradeModalProps) {
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

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      await startCheckout('monthly');
      await refresh();
      onSuccess?.();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Checkout failed';
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
          <h2 className={styles.title}>Upgrade to PetClues Pro</h2>
          <p className={styles.subtitle}>
            Unlock Vet Bill Decoder, unlimited pets, advanced AI insights, and monthly report exports.
          </p>
        </div>

        <div className={styles.priceDisplay}>
          <div className={styles.priceAmount}>{PRO_MONTHLY_PRICE_DISPLAY}</div>
          <div className={styles.priceNote}>Billed monthly · 30-day access · Secure Razorpay checkout</div>
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
            ? 'Secure checkout powered by Razorpay. Manage your subscription from Billing.'
            : PAYMENTS_COMING_SOON_MESSAGE}
        </p>
      </div>
    </div>
  );
}
