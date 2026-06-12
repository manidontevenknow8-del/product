import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { Button, Badge } from '@/components/ui';
import { PageHeroBand } from '@/components/visual';
import { PAGE_IMG } from '@/data/pageImages';
import {
  PLUS_MONTHLY_PRICE_DISPLAY,
  PRO_MONTHLY_PRICE_DISPLAY,
} from '@/config/razorpayConfig';
import { isPaymentsLive, PAYMENTS_COMING_SOON_MESSAGE } from '@/config/paymentsConfig';
import { UpgradeModal } from '@/components/subscription';
import { useAuth } from '@/auth/AuthProvider';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import {
  FOUNDING_DISCOUNT_PERCENT,
  FOUNDING_DISCOUNTED_PRICE_DISPLAY,
} from '@/config/razorpayConfig';
import { CUSTOM_LIMITS_EMAIL, PLAN_LABELS } from '@/subscription/entitlements';
import type { CheckoutPlan } from '@/types/subscription';
import { ROUTES } from '@/routes/paths';
import styles from './BillingPage.module.css';

export function BillingPage() {
  const { user } = useAuth();
  const {
    subscription,
    usage,
    invoices,
    currentPlan,
    planLabel,
    nextUpgradePlan,
    upgradeCta,
    upgradeHeadline,
    isLoading,
    refresh,
  } = useSubscription();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const paymentsLive = isPaymentsLive();
  const statusLabel =
    subscription?.subscriptionStatus === 'active'
      ? 'Active'
      : subscription?.subscriptionStatus === 'trialing'
        ? 'Trial'
        : 'Inactive';

  const upgradeTarget: CheckoutPlan | undefined =
    nextUpgradePlan === 'plus' || nextUpgradePlan === 'pro' ? nextUpgradePlan : 'pro';

  const priceNote =
    currentPlan === 'plus'
      ? `${PLUS_MONTHLY_PRICE_DISPLAY}/month`
      : currentPlan === 'pro'
        ? user?.foundingLifetimeDiscount
          ? `${FOUNDING_DISCOUNTED_PRICE_DISPLAY}/month`
          : `${PRO_MONTHLY_PRICE_DISPLAY}/month`
        : null;

  return (
    <AppLayout flushContent>
      <div className={styles.page}>
        <PageHeroBand
          compact
          image={PAGE_IMG.app.billing}
          imageAlt=""
          eyebrow="Subscription"
          title="Billing"
          subtitle="Manage your plan, usage, and payment history."
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

          {user?.foundingLifetimeDiscount && currentPlan === 'free' && (
            <div className={styles.banner} role="status">
              Founding Member pricing: Pro at {FOUNDING_DISCOUNTED_PRICE_DISPLAY}/month (
              {FOUNDING_DISCOUNT_PERCENT}% lifetime discount applied at checkout).
            </div>
          )}

          {currentPlan !== 'enterprise' && nextUpgradePlan && (
            <div className={styles.banner} role="status">
              {upgradeHeadline}
            </div>
          )}

          <div className={styles.planCard}>
            <div className={styles.planInfo}>
              <div className={styles.planName}>
                {planLabel} plan{' '}
                <Badge variant={currentPlan !== 'free' ? 'accent' : 'default'}>{statusLabel}</Badge>
              </div>
              <p className={styles.planMeta}>
                {currentPlan !== 'free' && subscription?.renewalDate
                  ? `Renews ${subscription.renewalDate}`
                  : currentPlan !== 'free' && priceNote
                    ? `${planLabel} - ${priceNote}`
                    : 'No active subscription'}
              </p>
              {subscription?.startedAt && currentPlan !== 'free' && (
                <p className={styles.planMeta}>
                  Started{' '}
                  {new Date(subscription.startedAt).toLocaleDateString('en-IN', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
            {currentPlan === 'enterprise' ? (
              <Button
                variant="secondary"
                onClick={() => {
                  window.location.href = `mailto:${CUSTOM_LIMITS_EMAIL}?subject=PetClues%20Enterprise%20support`;
                }}
              >
                Contact support
              </Button>
            ) : nextUpgradePlan === 'enterprise' ? (
              <div className={styles.planActions}>
                <Button
                  variant="primary"
                  onClick={() => {
                    window.location.href = `mailto:${CUSTOM_LIMITS_EMAIL}?subject=PetClues%20Enterprise`;
                  }}
                >
                  {upgradeCta}
                </Button>
                <Link to={ROUTES.PRICING}>
                  <Button variant="ghost">View plans</Button>
                </Link>
              </div>
            ) : currentPlan === 'free' || nextUpgradePlan ? (
              <Button
                variant="primary"
                onClick={() => setUpgradeOpen(true)}
                disabled={!paymentsLive}
              >
                {paymentsLive ? upgradeCta : 'Coming soon'}
              </Button>
            ) : (
              <div className={styles.planActions}>
                <Button variant="secondary" onClick={() => setUpgradeOpen(true)} disabled={!paymentsLive}>
                  Renew / extend
                </Button>
                <Link to={ROUTES.PRICING}>
                  <Button variant="ghost">View plans</Button>
                </Link>
              </div>
            )}
          </div>

          {currentPlan !== 'free' && (
            <section className={styles.support}>
              <h2 className={styles.supportTitle}>Manage subscription</h2>
              <p className={styles.supportText}>
                To cancel or change billing, email{' '}
                <a href="mailto:founder@petclues.com">founder@petclues.com</a>. Your {planLabel} access
                remains active until the renewal date shown above.
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
                    {usage.pets.used} / {usage.pets.limit ?? '∞'}
                  </div>
                </div>
                <div className={styles.usageItem}>
                  <div className={styles.usageLabel}>AI decodes</div>
                  <div className={styles.usageValue}>
                    {usage.scans.used}
                    {usage.scans.limit != null ? ` / ${usage.scans.limit} per month` : ' · Unlimited'}
                  </div>
                </div>
                <div className={styles.usageItem}>
                  <div className={styles.usageLabel}>Reminders</div>
                  <div className={styles.usageValue}>
                    {usage.reminders.used}
                    {usage.reminders.limit != null ? ` / ${usage.reminders.limit}` : ' · Unlimited'}
                  </div>
                </div>
                <div className={styles.usageItem}>
                  <div className={styles.usageLabel}>Timeline</div>
                  <div className={styles.usageValue}>
                    {usage.timelineMonths.limit != null ? `${usage.timelineMonths.limit} months` : 'Full history'}
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className={styles.invoices}>
            <h2 className={styles.invoicesTitle}>Payment history</h2>
            {isLoading ? (
              <div className={styles.invoiceEmpty}>Loading payment history…</div>
            ) : invoices.length === 0 ? (
              <div className={styles.invoiceEmpty}>
                {currentPlan !== 'free'
                  ? 'No payment records yet.'
                  : 'No payments yet - upgrade to see billing history here.'}
              </div>
            ) : (
              <div className={styles.invoiceList}>
                {invoices.map((inv) => (
                  <div key={inv.id} className={styles.invoice}>
                    <span>{inv.date}</span>
                    <span>{inv.plan ? PLAN_LABELS[inv.plan as keyof typeof PLAN_LABELS] ?? inv.plan : ''}</span>
                    <span>{inv.amount}</span>
                    <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>
                      {inv.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </section>

          {nextUpgradePlan && nextUpgradePlan !== 'enterprise' && (
            <UpgradeModal
              isOpen={upgradeOpen}
              onClose={() => setUpgradeOpen(false)}
              targetPlan={upgradeTarget}
              onSuccess={() => {
                setBanner(`Welcome to ${PLAN_LABELS[upgradeTarget]}! Your subscription is active.`);
                void refresh();
              }}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
