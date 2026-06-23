import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { useAuth } from '@/auth/AuthProvider';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import { useAnalytics } from '@/analytics';
import { isPaymentsLive, PAYMENTS_COMING_SOON_MESSAGE } from '@/config/paymentsConfig';
import {
  ANNUAL_BILLING_LABEL,
  CUSTOM_LIMITS_EMAIL,
  FOUNDING_DISCOUNT_PERCENT,
  getAnnualPriceParts,
} from '@/config/pricingConfig';
import { useBillingRegion } from '@/hooks/useBillingRegion';
import type { CommercialPlan } from '@/subscription/entitlements';
import type { CheckoutPlan } from '@/types/subscription';
import { ROUTES } from '@/routes/paths';
import { FeaturePageLinks } from '@/components/seo/FeaturePageLinks';
import { getUserFacingError } from '@/utils/userFacingErrors';
import styles from './PricingPage.module.css';

const PLUS_FEATURES = [
  'Health records',
  'Vaccination history',
  'Care timeline',
  'Document storage',
  'Pet reminders',
  'Monthly reports',
  'Emergency information',
  'Family sharing',
] as const;

const PRO_FEATURES = [
  'Everything in Plus',
  'AI-powered insights',
  'Premium exports',
  'Advanced health tracking',
  'Priority support',
  'Future premium features',
] as const;

const TRUST_POINTS = [
  'Secure payments',
  'Cancel anytime',
  'International cards accepted',
] as const;

const PRICING_FAQ = [
  {
    q: 'How does membership work?',
    a: 'PetClues memberships are billed once per year. One payment gives you twelve months of full access.',
  },
  {
    q: 'Can I start free and upgrade later?',
    a: 'Yes. Every account begins on Free with one pet. Upgrade to Plus or Pro anytime, your records and timeline come with you.',
  },
  {
    q: 'Can I cancel?',
    a: 'Your membership stays active through your renewal date. Contact support anytime to manage your account.',
  },
] as const;

type MembershipPlan = {
  id: CheckoutPlan;
  name: string;
  tagline: string;
  features: readonly string[];
  highlighted?: boolean;
};

const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'plus',
    name: 'Plus',
    tagline: 'For organized pet parents.',
    features: PLUS_FEATURES,
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For those who want complete peace of mind.',
    features: PRO_FEATURES,
    highlighted: true,
  },
];

function CheckIcon() {
  return (
    <svg className={styles.checkIcon} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M4 10.5 8 14.5 16 6.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function parseHighlightedPlan(value: string | null): CheckoutPlan | null {
  if (value === 'plus' || value === 'pro') return value;
  return null;
}

export function PricingPage() {
  const { isAuthenticated, user } = useAuth();
  const { currentPlan, startCheckout, openBillingPortal } = useSubscription();
  const { track } = useAnalytics();
  const { currency, countryCode, isLoading: regionLoading } = useBillingRegion();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const highlightedPlan = parseHighlightedPlan(searchParams.get('plan'));
  const foundingDiscount = Boolean(user?.foundingLifetimeDiscount);

  useEffect(() => {
    if (regionLoading) return;
    track('pricing_viewed', {
      currency,
      country: countryCode,
      ...(highlightedPlan ? { highlightedPlan } : {}),
    });
  }, [track, highlightedPlan, currency, countryCode, regionLoading]);

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
      track('upgrade_clicked', { plan: planId, currency, country: countryCode });
      await startCheckout(planId as CheckoutPlan, currency, { countryCode });
    } catch (err) {
      setError(getUserFacingError(err, 'subscription', 'Something went wrong'));
      setLoading(false);
    }
  };

  const ctaLabel = (planId: CommercialPlan): string => {
    if (!isAuthenticated) {
      if (planId === 'pro') return 'Join Pro';
      if (planId === 'plus') return 'Join Plus';
      return 'Start free';
    }
    if (planId === currentPlan) return 'Current membership';
    if (planId === 'free') return 'Manage membership';
    if (currentPlan === 'pro' && planId === 'plus') return 'Manage via billing';
    if (planId === 'pro') return 'Upgrade to Pro';
    return 'Choose Plus';
  };

  const content = (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="pricing-hero-title">
        <div className={styles.heroGlow} aria-hidden />
        <div className={`container ${styles.heroInner}`}>
          <p className={styles.eyebrow}>Annual membership</p>
          <h1 id="pricing-hero-title" className={styles.heroTitle}>
            The Digital Home For Everything That Matters
          </h1>
          <p className={styles.heroLead}>
            Health records, medical history, reminders, documents, boarding readiness, travel
            records, and life&apos;s most important moments, beautifully organized in one place.
          </p>
        </div>
      </section>

      <div className={styles.main}>
        <div className="container">
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}

          {foundingDiscount && (
            <p className={styles.foundingNote}>
              Founding Member: {FOUNDING_DISCOUNT_PERCENT}% lifetime discount on Pro at checkout
            </p>
          )}

          <div className={styles.planGrid}>
            {MEMBERSHIP_PLANS.map((plan) => {
              const isCurrent = isAuthenticated && currentPlan === plan.id;
              const isHighlighted = highlightedPlan === plan.id || plan.highlighted;
              const { amount, period } = getAnnualPriceParts(
                plan.id,
                currency,
                plan.id === 'pro' && foundingDiscount,
              );
              const features =
                plan.id === 'pro' && foundingDiscount
                  ? [...plan.features, 'Founding Member benefits']
                  : plan.features;

              return (
                <article
                  key={plan.id}
                  className={`${styles.planCard} ${isHighlighted ? styles.planCardHighlighted : ''}`}
                >
                  {plan.highlighted && <span className={styles.planBadge}>Recommended</span>}

                  <div className={styles.priceBlock}>
                    <div className={styles.priceRow}>
                      <span className={styles.planPriceAmount}>
                        {regionLoading ? '…' : amount}
                      </span>
                      {!regionLoading && (
                        <span className={styles.planPricePeriod}>{period}</span>
                      )}
                    </div>
                    <p className={styles.planBillingNote}>{ANNUAL_BILLING_LABEL}</p>
                  </div>

                  <div className={styles.planHeader}>
                    <h2 className={styles.planName}>{plan.name}</h2>
                    <p className={styles.planTagline}>{plan.tagline}</p>
                  </div>

                  <ul className={styles.featureList}>
                    {features.map((feature) => (
                      <li key={feature}>
                        <CheckIcon />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    className={plan.highlighted ? styles.planCtaPrimary : styles.planCtaSecondary}
                    disabled={loading || isCurrent || regionLoading}
                    onClick={() => void handleSelect(plan.id)}
                  >
                    {ctaLabel(plan.id)}
                  </button>
                </article>
              );
            })}
          </div>

          <ul className={styles.trustRow} aria-label="Membership assurances">
            {TRUST_POINTS.map((point) => (
              <li key={point}>
                <CheckIcon />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <p className={styles.freeNote}>
            Not ready yet?{' '}
            {isAuthenticated ? (
              <Link to={ROUTES.DASHBOARD}>Continue with Free</Link>
            ) : (
              <Link to={ROUTES.SIGNUP}>Start free, one pet, no card required</Link>
            )}
          </p>
        </div>

        <div className="container">
          <section className={styles.faq} aria-labelledby="pricing-faq-heading">
            <div className={styles.faqHeader}>
              <p className={styles.sectionEyebrow}>Questions</p>
              <h2 id="pricing-faq-heading" className={styles.sectionTitle}>
                Membership FAQ
              </h2>
            </div>
            <dl className={styles.faqList}>
              {PRICING_FAQ.map((item) => (
                <div key={item.q} className={styles.faqItem}>
                  <dt className={styles.faqQuestion}>{item.q}</dt>
                  <dd className={styles.faqAnswer}>{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={styles.enterprise} aria-labelledby="enterprise-heading">
            <p className={styles.sectionEyebrow}>Enterprise</p>
            <h2 id="enterprise-heading" className={styles.enterpriseTitle}>
              Clinics &amp; organizations
            </h2>
            <p className={styles.enterpriseLead}>
              Unlimited pets, clinic dashboards, staff accounts, and dedicated support for
              veterinary groups and large operations.
            </p>
            <button
              type="button"
              onClick={() => void handleSelect('enterprise')}
              className={styles.enterpriseBtn}
            >
              Contact {CUSTOM_LIMITS_EMAIL}
            </button>
          </section>

          <FeaturePageLinks />
        </div>
      </div>
    </div>
  );

  if (isAuthenticated) {
    return <AppLayout flushContent>{content}</AppLayout>;
  }

  return <PublicLayout>{content}</PublicLayout>;
}
