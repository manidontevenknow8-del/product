import { useState } from 'react';
import { Button } from '@/components/ui';
import { redeemPromoCode } from '@/services/promo/promoCodeService';
import styles from './PromoCodeForm.module.css';

type PromoCodeFormProps = {
  disabled?: boolean;
  onSuccess?: (message: string) => void;
  onRedeemed?: () => void;
};

export function PromoCodeForm({ disabled = false, onSuccess, onRedeemed }: PromoCodeFormProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await redeemPromoCode(code);
      if (!result.success) {
        setError(result.error);
        return;
      }

      const ends = result.trialEndsAt
        ? new Date(result.trialEndsAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })
        : null;

      const message = ends
        ? `Promo applied! You have ${result.trialDays} days of ${result.plan.toUpperCase()} access until ${ends}.`
        : `Promo applied! You have ${result.trialDays} days of ${result.plan.toUpperCase()} access.`;

      setCode('');
      onSuccess?.(message);
      onRedeemed?.();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={styles.section} aria-labelledby="promo-code-heading">
      <h2 id="promo-code-heading" className={styles.title}>
        Have a promo code?
      </h2>
      <p className={styles.lead}>Redeem a code for a free Pro trial: no payment required.</p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="promo-code-input">
          Promo code
        </label>
        <div className={styles.row}>
          <input
            id="promo-code-input"
            name="promoCode"
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="6QDZ-LC4A"
            className={styles.input}
            autoComplete="off"
            spellCheck={false}
            disabled={disabled || submitting}
          />
          <Button type="submit" variant="secondary" disabled={disabled || submitting || !code.trim()}>
            {submitting ? 'Applying…' : 'Apply'}
          </Button>
        </div>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}
