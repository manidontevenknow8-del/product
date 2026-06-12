import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { useAuth } from '@/auth/AuthProvider';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import { useAnalytics } from '@/analytics';
import { isPaymentsLive, PAYMENTS_COMING_SOON_MESSAGE } from '@/config/paymentsConfig';
import {
  CUSTOM_LIMITS_EMAIL,
  getAnnualSavingsLabel,
  getPlanPriceLabel,
  PLUS_MONTHLY_INR,
  PRO_MONTHLY_INR,
} from '@/config/pricingConfig';
import type { CommercialPlan } from '@/subscription/entitlements';
import type { BillingInterval, CheckoutPlan } from '@/types/subscription';
import { ROUTES } from '@/routes/paths';
import { getUserFacingError } from '@/utils/userFacingErrors';
import styles from './PricingPage.module.css';

const TIER_IMAGES = {
  free: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1400&q=80',
  plus: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1400&q=80',
  pro: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1400&q=80',
} as const;

type TierConfig = {
  id: CommercialPlan;
  name: string;
  tagline: string;
  emphasis: string[];
  image: string;
  featured?: boolean;
};

const TIERS: TierConfig[] = [
  {
    id: 'free',
    name: 'The Foundation',
    tagline: 'Professional organization for your first companion.',
    emphasis: [
      '1 pet profile',
      '30-day memory timeline',
      '2 lifetime AI scans',
      'Basic reminders & document vault',
    ],
    image: TIER_IMAGES.free,
  },
  {
    id: 'plus',
    name: 'The Household',
    tagline: 'Complete care management for growing families.',
    emphasis: [
      '3 pets',
      'Unlimited timeline',
      '5 AI scans per month',
      '2 caregivers · passports & monthly reports',
    ],
    image: TIER_IMAGES.plus,
  },
  {
    id: 'pro',
    name: 'Absolute Certainty',
    tagline: 'Advanced foresight for households who leave nothing to chance.',
    emphasis: [
      '10 pets',
      '30 AI scans per month',
      'Unlimited caregivers',
      'Health Foresight AI',
      'Vet Portal',
      'One-Click Emergency Mode',
    ],
    image: TIER_IMAGES.pro,
    featured: true,
  },
];

const TIER_CARD_CLASS: Record<'free' | 'plus' | 'pro', string> = {
  free: styles.tierCardFree,
  plus: styles.tierCardPlus,
  pro: styles.tierCardPro,
};

function formatTierPrice(plan: CommercialPlan, interval: BillingInterval): string {
  if (plan === 'free') return '₹0';
  if (plan === 'enterprise') return 'Custom';
  const label = getPlanPriceLabel(plan, interval);
  if (interval === 'monthly' && (plan === 'plus' || plan === 'pro')) {
    return `${label}/mo`;
  }
  if (interval === 'yearly' && (plan === 'plus' || plan === 'pro')) {
    return `${label}/yr`;
  }
  return label;
}

function BillingToggle({
  value,
  onChange,
}: {
  value: BillingInterval;
  onChange: (v: BillingInterval) => void;
}) {
  return (
    <div className={styles.billingToggle} role="group" aria-label="Billing interval">
      <button
        type="button"
        className={`${styles.billingBtn} ${value === 'monthly' ? styles.billingBtnActive : ''}`}
        onClick={() => onChange('monthly')}
        aria-pressed={value === 'monthly'}
      >
        Monthly
      </button>
      <button
        type="button"
        className={`${styles.billingBtn} ${value === 'yearly' ? styles.billingBtnActive : ''}`}
        onClick={() => onChange('yearly')}
        aria-pressed={value === 'yearly'}
      >
        Annual · 2 months free
      </button>
    </div>
  );
}

type HighlightedPlan = 'plus' | 'pro';

function parseHighlightedPlan(value: string | null): HighlightedPlan | null {
  if (value === 'plus' || value === 'pro') return value;
  return null;
}

export function PricingPage() {
  const { isAuthenticated } = useAuth();
  const { currentPlan, startCheckout, openBillingPortal } = useSubscription();
  const { track } = useAnalytics();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const plusCardRef = useRef<HTMLElement>(null);
  const proCardRef = useRef<HTMLElement>(null);
  const highlightedPlan = parseHighlightedPlan(searchParams.get('plan'));

  useEffect(() => {
    track('pricing_viewed', highlightedPlan ? { highlightedPlan } : undefined);
  }, [track, highlightedPlan]);

  useEffect(() => {
    if (!highlightedPlan) return;

    const isStackedLayout = window.matchMedia('(max-width: 899px)').matches;
    if (!isStackedLayout) return;

    const targetRef = highlightedPlan === 'plus' ? plusCardRef : proCardRef;
    const frame = window.requestAnimationFrame(() => {
      targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [highlightedPlan]);

  const handleSelect = async (planId: CommercialPlan) => {
    if (!isAuthenticated) {
      navigate(ROUTES.SIGNUP);
      return;
    }

    if (planId === 'enterprise') {
      window.location.href = `mailto:${CUSTOM_LIMITS_EMAIL}?subject=PetClues%20Enterprise`;
      return;
    }

    if (planId === 'free') {
      if (currentPlan !== 'free') {
        await openBillingPortal();
      } else {
        navigate(ROUTES.BILLING);
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!isPaymentsLive()) {
        setError(PAYMENTS_COMING_SOON_MESSAGE);
        setLoading(false);
        return;
      }
      track('upgrade_clicked', { interval, plan: planId });
      await startCheckout(planId as CheckoutPlan, interval);
    } catch (err) {
      setError(getUserFacingError(err, 'subscription', 'Something went wrong'));
      setLoading(false);
    }
  };

  const ctaLabel = (planId: CommercialPlan): string => {
    if (!isAuthenticated) return 'Get started';
    if (planId === currentPlan) return 'Current plan';
    if (planId === 'free') return 'Manage plan';
    if (currentPlan === 'pro' && planId === 'plus') return 'Downgrade via billing';
    return `Choose ${planId === 'plus' ? 'Plus' : 'Pro'}`;
  };

  const content = (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Membership</p>
        <h1 className={styles.title}>Care, elevated.</h1>
        <p className={styles.lead}>
          A concierge approach to pet health - start free, then grow into the household and
          foresight tiers as your family expands.
        </p>
        <div className={styles.toggleWrap}>
          <BillingToggle value={interval} onChange={setInterval} />
        </div>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
      </header>

      <div className={styles.body}>
        <div className={styles.tierGrid}>
          {TIERS.map((tier) => {
            const isCurrent = isAuthenticated && tier.id === currentPlan;
            const planKey = tier.id as 'free' | 'plus' | 'pro';
            const isHighlighted = highlightedPlan === tier.id;
            const cardRef =
              tier.id === 'plus' ? plusCardRef : tier.id === 'pro' ? proCardRef : undefined;

            return (
              <article
                key={tier.id}
                ref={cardRef}
                className={[
                  styles.tierCard,
                  TIER_CARD_CLASS[planKey],
                  isHighlighted ? styles.tierCardHighlighted : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {tier.featured && (
                  <span className={styles.tierBadge}>Recommended</span>
                )}

                <div className={styles.tierVisual}>
                  <img src={tier.image} alt="" className={styles.tierImg} loading="lazy" />
                  <div className={styles.tierImgScrim} aria-hidden />
                </div>

                <div className={styles.tierBody}>
                  <p className={styles.tierPlan}>
                    {tier.id === 'free' ? 'Free' : tier.id === 'plus' ? 'Plus' : 'Pro'}
                  </p>
                  <h2 className={styles.tierName}>{tier.name}</h2>
                  <p className={styles.tierPrice}>{formatTierPrice(tier.id, interval)}</p>
                  {interval === 'yearly' && (tier.id === 'plus' || tier.id === 'pro') && (
                    <p className={styles.tierPriceNote}>{getAnnualSavingsLabel(tier.id)}</p>
                  )}
                  {interval === 'monthly' && tier.id === 'plus' && (
                    <p className={styles.tierPriceNote}>
                      or {getPlanPriceLabel('plus', 'yearly')}/year
                    </p>
                  )}
                  {interval === 'monthly' && tier.id === 'pro' && (
                    <p className={styles.tierPriceNote}>
                      or {getPlanPriceLabel('pro', 'yearly')}/year
                    </p>
                  )}
                  <p className={styles.tierTagline}>{tier.tagline}</p>
                  <ul className={styles.featureList}>
                    {tier.emphasis.map((item) => (
                      <li key={item} className={styles.featureItem}>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    disabled={loading || isCurrent}
                    onClick={() => void handleSelect(tier.id)}
                    className={`${styles.cta} ${
                      tier.featured ? styles.ctaPrimary : styles.ctaSecondary
                    }`}
                  >
                    {ctaLabel(tier.id)}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <section className={styles.enterprise}>
          <p className={styles.eyebrow}>Enterprise</p>
          <h2 className={styles.enterpriseTitle}>Clinics &amp; organizations</h2>
          <p className={styles.enterpriseLead}>
            Unlimited pets, API access, custom domains, and dedicated support for veterinary
            groups and large households.
          </p>
          <button
            type="button"
            onClick={() => void handleSelect('enterprise')}
            className={styles.enterpriseLink}
          >
            Contact {CUSTOM_LIMITS_EMAIL}
          </button>
        </section>

        <p className={styles.footnote}>
          Plus from {formatInrDisplay(PLUS_MONTHLY_INR)}/mo · Pro from{' '}
          {formatInrDisplay(PRO_MONTHLY_INR)}/mo · Prices in INR
        </p>
      </div>
    </div>
  );

  if (isAuthenticated) {
    return <AppLayout flushContent>{content}</AppLayout>;
  }

  return <PublicLayout>{content}</PublicLayout>;
}

function formatInrDisplay(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
