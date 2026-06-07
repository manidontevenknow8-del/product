import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { Button, Badge } from '@/components/ui';
import { PageHeroBand } from '@/components/visual';
import { PAGE_IMG } from '@/data/pageImages';
import { isPaymentsLive, PAYMENTS_COMING_SOON_MESSAGE } from '@/config/paymentsConfig';
import { UpgradeModal } from '@/components/subscription';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import { ROUTES } from '@/routes/paths';
import styles from './BillingPage.module.css';

export function BillingPage() {
  const { subscription, usage, invoices, isPremium, openBillingPortal, refresh } = useSubscription();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const checkout = searchParams.get('checkout');
    if (checkout === 'success') {
      void refresh();
      setBanner('Welcome to Premium! Your subscription is active.');
      searchParams.delete('checkout');
      setSearchParams(searchParams, { replace: true });
    } else if (checkout === 'canceled') {
      setBanner('Checkout canceled — no changes were made.');
      searchParams.delete('checkout');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, refresh]);

  const planLabel = subscription?.plan === 'premium' ? 'Premium' : 'Free';
  const paymentsLive = isPaymentsLive();

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      await openBillingPortal();
    } catch {
      setPortalLoading(false);
    }
  };

  return (
    <AppLayout flushContent>
      <div className={styles.page}>
        <PageHeroBand
          compact
          image={PAGE_IMG.app.billing}
          imageAlt=""
          eyebrow="Subscription"
          title="Billing"
          subtitle="Manage your plan, usage, and subscription."
        />

        <div className={styles.body}>
          {banner && (
            <div className={styles.banner} role="status">
              {banner}
            </div>
          )}

          {!paymentsLive && (
            <div className={styles.banner} role="status">
              {PAYMENTS_COMING_SOON_MESSAGE}
            </div>
          )}

          <div className={styles.planCard}>
            <div className={styles.planInfo}>
              <div className={styles.planName}>
                {planLabel} plan{' '}
                {isPremium && <Badge variant="accent">Active</Badge>}
                {subscription?.cancelAtPeriodEnd && (
                  <Badge variant="warning">Canceling</Badge>
                )}
              </div>
              <p className={styles.planMeta}>
                {subscription?.renewalDate
                  ? subscription.cancelAtPeriodEnd
                    ? `Access until ${subscription.renewalDate}`
                    : `Renews ${subscription.renewalDate}`
                  : 'No renewal — free forever'}
              </p>
            </div>
            {!isPremium ? (
              <Button
                variant="primary"
                onClick={() => setUpgradeOpen(true)}
                disabled={!paymentsLive}
              >
                {paymentsLive ? 'Upgrade' : 'Coming soon'}
              </Button>
            ) : (
              <div className={styles.planActions}>
                <Button
                  variant="secondary"
                  onClick={() => void handleManage()}
                  disabled={portalLoading || !paymentsLive}
                >
                  {portalLoading ? 'Opening…' : paymentsLive ? 'Manage subscription' : 'Billing portal soon'}
                </Button>
                <Link to={ROUTES.PRICING}>
                  <Button variant="ghost">View plans</Button>
                </Link>
              </div>
            )}
          </div>

          {isPremium && (
            <section className={styles.support}>
              <h2 className={styles.supportTitle}>Priority support</h2>
              <p className={styles.supportText}>
                Premium members get priority help at{' '}
                <a href="mailto:founder@petclues.com">founder@petclues.com</a>.
              </p>
            </section>
          )}

          {usage && (
            <section className={styles.usage}>
              <h2 className={styles.usageTitle}>Usage</h2>
              <div className={styles.usageGrid}>
                <div className={styles.usageItem}>
                  <div className={styles.usageLabel}>Pets</div>
                  <div className={styles.usageValue}>
                    {usage.pets.used}
                    {usage.pets.limit != null ? ` / ${usage.pets.limit}` : ' · Unlimited'}
                  </div>
                </div>
                <div className={styles.usageItem}>
                  <div className={styles.usageLabel}>AI decodes</div>
                  <div className={styles.usageValue}>
                    {usage.scans.used}
                    {usage.scans.limit != null ? ' · Premium only' : ' · Unlimited'}
                  </div>
                </div>
                <div className={styles.usageItem}>
                  <div className={styles.usageLabel}>Documents</div>
                  <div className={styles.usageValue}>Basic vault</div>
                </div>
              </div>
            </section>
          )}

          <section className={styles.invoices}>
            <h2 className={styles.invoicesTitle}>Invoices</h2>
            {isPremium ? (
              <div className={styles.invoiceEmpty}>
                Billing history will appear here once Razorpay checkout and subscription
                management are live. Premium access can be granted manually until then.
              </div>
            ) : invoices.length === 0 ? (
              <div className={styles.invoiceEmpty}>
                No invoices yet — upgrade to Premium to see billing history here.
              </div>
            ) : (
              <div className={styles.invoiceList}>
                {invoices.map((inv) => (
                  <div key={inv.id} className={styles.invoice}>
                    <span>{inv.date}</span>
                    <span>{inv.amount}</span>
                    <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>
                      {inv.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </section>

          <UpgradeModal
            isOpen={upgradeOpen}
            onClose={() => setUpgradeOpen(false)}
            onSuccess={() => setUpgradeOpen(false)}
          />
        </div>
      </div>
    </AppLayout>
  );
}
