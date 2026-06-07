import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeroBand } from '@/components/visual';
import { PAGE_IMG } from '@/data/pageImages';
import { SubscriptionCard } from '@/components/subscription';
import { PLANS } from '@/data/subscriptionData';
import { useAuth } from '@/auth/AuthProvider';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import { useAnalytics } from '@/analytics';
import { isPaymentsLive, PAYMENTS_COMING_SOON_MESSAGE } from '@/config/paymentsConfig';
import { ROUTES } from '@/routes/paths';
import type { BillingInterval } from '@/types/subscription';
import styles from './PricingPage.module.css';

export function PricingPage() {
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const { isAuthenticated } = useAuth();
  const { subscription, startCheckout, openBillingPortal } = useSubscription();
  const { track } = useAnalytics();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    track('pricing_viewed');
  }, [track]);

  const handleSelect = async (planId: 'free' | 'premium') => {
    if (!isAuthenticated) {
      navigate(ROUTES.SIGNUP);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (planId === 'premium') {
        if (!isPaymentsLive()) {
          setError(PAYMENTS_COMING_SOON_MESSAGE);
          setLoading(false);
          return;
        }
        track('upgrade_clicked', { interval, plan: 'premium' });
        await startCheckout(interval);
        track('premium_started', { interval, plan: 'premium' });
        track('subscription_started', { interval, plan: 'premium' });
      } else if (subscription?.plan === 'premium') {
        await openBillingPortal();
      } else {
        navigate(ROUTES.BILLING);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  const hero = (
    <PageHeroBand
      compact
      image={PAGE_IMG.app.billing}
      imageAlt=""
      eyebrow="Plans"
      title="Simple, honest pricing"
      subtitle="Start free with everything you need for one pet. Upgrade when you're ready for Vet Bill Decoder, advanced insights, and unlimited pets."
    />
  );

  const pricingBody = (
    <div className={styles.body}>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}

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
          <span className={styles.savings}>Save 27%</span>
        </button>
      </div>

      <div className={styles.grid}>
        {PLANS.map((plan) => (
          <SubscriptionCard
            key={plan.id}
            plan={plan}
            interval={interval}
            isCurrent={isAuthenticated && subscription?.plan === plan.id}
            onSelect={() => void handleSelect(plan.id)}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );

  const page = (
    <div className={styles.page}>
      {hero}
      {pricingBody}
    </div>
  );

  if (isAuthenticated) {
    return <AppLayout flushContent>{page}</AppLayout>;
  }

  return <PublicLayout>{page}</PublicLayout>;
}
