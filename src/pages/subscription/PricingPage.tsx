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
import styles from './PricingPage.module.css';

export function PricingPage() {
  const { isAuthenticated } = useAuth();
  const { isPremium, startCheckout, openBillingPortal } = useSubscription();
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
        track('upgrade_clicked', { interval: 'monthly', plan: 'pro' });
        await startCheckout('monthly');
      } else if (isPremium) {
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
      subtitle="Start free with everything you need for one pet. Upgrade to Pro for Vet Bill Decoder, AI insights, and unlimited pets."
    />
  );

  const pricingBody = (
    <div className={styles.body}>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}

      <div className={styles.grid}>
        {PLANS.map((plan) => (
          <SubscriptionCard
            key={plan.id}
            plan={plan}
            interval="monthly"
            isCurrent={isAuthenticated && (plan.id === 'premium' ? isPremium : !isPremium)}
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
