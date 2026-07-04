import { useCallback, useState } from 'react';
import { ArrowRight, FileText, Shield } from 'lucide-react';
import {
  getGenesisVaultPaymentUrl,
  getGenesisVaultPriceDisplay,
} from '@/config/genesisVaultConfig';
import { isPaymentsLive } from '@/config/paymentsConfig';
import { isSupabaseConfigured } from '@/services/supabase/config';
import { useBillingRegion } from '@/hooks/useBillingRegion';
import { genesisVaultCheckoutService } from '@/services/payments/genesisVaultCheckoutService';
import { getUserFacingError } from '@/utils/userFacingErrors';
import styles from './GenesisOffer.module.css';

export function GenesisOffer() {
  const { currency } = useBillingRegion();
  const paymentLink = getGenesisVaultPaymentUrl();
  const priceDisplay = getGenesisVaultPriceDisplay(currency);
  const checkoutReady = isPaymentsLive() && isSupabaseConfigured();

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleCheckout = useCallback(async () => {
    if (paymentLink) {
      window.open(paymentLink, '_blank', 'noopener,noreferrer');
      return;
    }

    if (!checkoutReady) {
      setStatus('error');
      setStatusMessage('Checkout is temporarily unavailable. Email support@petclues.com to secure your allocation.');
      return;
    }

    setStatus('loading');
    setStatusMessage(null);

    try {
      await genesisVaultCheckoutService.startCheckout({
        currency,
        onSuccess: () => {
          setStatus('success');
          setStatusMessage(
            'Payment confirmed. Our concierge team will reach out within 24 hours to begin your vault digitization.',
          );
        },
        onDismiss: () => {
          setStatus('idle');
        },
      });
    } catch (error) {
      const message = getUserFacingError(error, 'payment', 'Checkout could not be completed');
      if (message === 'Checkout canceled') {
        setStatus('idle');
        return;
      }
      setStatus('error');
      setStatusMessage(message);
    }
  }, [checkoutReady, currency, paymentLink]);

  const ctaDisabled = status === 'loading' || status === 'success';
  const ctaLabel =
    status === 'loading'
      ? 'Opening secure checkout…'
      : status === 'success'
        ? 'Allocation secured'
        : `Secure Genesis Vault — ${priceDisplay}`;

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <nav className={styles.nav} aria-label="Genesis Vault">
          <div className={styles.brand}>P E T C L U E S</div>
          <div className={styles.badge}>[ INVITATION ONLY ]</div>
        </nav>

        <main className={styles.main}>
          <div className={styles.pitch}>
            <p className={styles.eyebrow}>The Genesis Vault — Limited Allocation</p>

            <h1 className={styles.title}>True luxury is the absence of friction.</h1>

            <p className={styles.lead}>
              You provide the sanctuary; we handle the science. Secure your companion&apos;s
              biological legacy with a pristine, frictionless digital archive. For our founding
              members, we eliminate the data entry entirely.
            </p>

            <div className={styles.features}>
              <div className={styles.feature}>
                <FileText size={18} className={styles.featureIcon} strokeWidth={1.5} aria-hidden />
                <div>
                  <h3 className={styles.featureTitle}>White-Glove Digitization</h3>
                  <p className={styles.featureCopy}>
                    Hand us the messy PDFs. We manually build your pristine architecture.
                  </p>
                </div>
              </div>
              <div className={styles.feature}>
                <Shield size={18} className={styles.featureIcon} strokeWidth={1.5} aria-hidden />
                <div>
                  <h3 className={styles.featureTitle}>Lifetime Security</h3>
                  <p className={styles.featureCopy}>
                    Zero recurring subscriptions. Your archive is secured forever.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.ctaRow}>
              <button
                type="button"
                className={styles.ctaButton}
                onClick={() => void handleCheckout()}
                disabled={ctaDisabled}
              >
                {ctaLabel}
                {status !== 'loading' && status !== 'success' ? (
                  <ArrowRight size={14} aria-hidden />
                ) : null}
              </button>
              <span className={styles.scarcity}>Only 14 allocations remaining</span>
            </div>

            {statusMessage ? (
              <p
                className={`${styles.statusMessage} ${
                  status === 'error' ? styles.statusError : styles.statusSuccess
                }`}
                role={status === 'error' ? 'alert' : 'status'}
              >
                {statusMessage}
              </p>
            ) : null}
          </div>

          <div className={styles.proof}>
            <div className={styles.proofInner}>
              <p className={styles.eyebrow}>[ THE ARCHITECTURE ]</p>
              <div className={styles.architectureCard}>
                <div className={styles.architectureHeader}>
                  <div>
                    <p className={styles.architectureLabel}>Vault Integrity</p>
                    <p className={styles.architectureValue}>100%</p>
                  </div>
                  <span className={styles.architectureStatus}>Secured</span>
                </div>
                <div className={styles.matrix}>
                  <div className={styles.matrixRow}>
                    <span>Vaccination Matrix</span>
                    <span className={styles.matrixValue}>Active</span>
                  </div>
                  <div className={styles.matrixRow}>
                    <span>Clinical Records</span>
                    <span className={styles.matrixValue}>Digitized</span>
                  </div>
                  <div className={styles.matrixRow}>
                    <span>Travel Passport</span>
                    <span className={styles.matrixValue}>Compliant</span>
                  </div>
                </div>
              </div>
            </div>

            <img
              src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800"
              alt="Two companions running together"
              className={styles.heroImage}
              width={800}
              height={600}
              decoding="async"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
