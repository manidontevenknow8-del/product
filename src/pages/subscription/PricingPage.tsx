import { Fragment, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { Badge } from '@/components/ui';
import { useAuth } from '@/auth/AuthProvider';
import { useSubscription } from '@/subscription/SubscriptionProvider';
import { useAnalytics } from '@/analytics';
import { isPaymentsLive, PAYMENTS_COMING_SOON_MESSAGE } from '@/config/paymentsConfig';
import {
  ANNUAL_BADGE,
  CUSTOM_LIMITS_EMAIL,
  FOUNDING_DISCOUNT_PERCENT,
  getAnnualSavingsLabel,
  getPlanPriceLabel,
  PLUS_MONTHLY_INR,
  PRO_MONTHLY_INR,
} from '@/config/pricingConfig';
import { PET_LIMITS } from '@/subscription/entitlements';
import {
  COMING_SOON_FEATURES,
  FEATURE_COMPARISON,
  type ComparisonRow,
  type MatrixCell,
} from '@/data/pricingMatrix';
import { LANDING_IMG } from '@/data/landingImages';
import type { CommercialPlan } from '@/subscription/entitlements';
import type { BillingInterval, CheckoutPlan } from '@/types/subscription';
import { ROUTES } from '@/routes/paths';
import { FeaturePageLinks } from '@/components/seo/FeaturePageLinks';
import { getUserFacingError } from '@/utils/userFacingErrors';
import styles from './PricingPage.module.css';

const PRO_HERO_IMAGE = LANDING_IMG.score;
const PLUS_IMAGE = LANDING_IMG.passport;
const FREE_IMAGE = LANDING_IMG.checkin;

const PRO_HIGHLIGHTS = [
  {
    title: 'Health Foresight AI',
    description: 'Spot patterns across records, scans, and check-ins before small issues become emergencies.',
  },
  {
    title: 'One-Click Emergency Mode',
    description: 'Instant vet contacts, allergies, medications, and passport - ready when seconds matter.',
  },
  {
    title: 'Vet Collaboration Portal',
    description: 'Share structured history with clinics so every visit starts informed, not from scratch.',
  },
  {
    title: 'Priority support',
    description: 'Skip the queue. Real humans who understand pet care, when you need answers fast.',
  },
] as const;

const PRICING_FAQ = [
  {
    q: 'Can I start free and upgrade later?',
    a: 'Yes. Every account begins on Free with one pet. Upgrade to Plus or Pro anytime - your records and timeline come with you.',
  },
  {
    q: 'What makes Pro worth it over Plus?',
    a: 'Pro is built for households that need foresight: up to 10 pets, 30 AI scans per month, emergency mode, vet portal access, unlimited caregivers, and every Launching Soon feature as it ships.',
  },
  {
    q: 'Is annual billing really cheaper?',
    a: `Annual plans include ${ANNUAL_BADGE.toLowerCase()} - you pay for 10 months and get 12 months of coverage.`,
  },
  {
    q: 'Can I switch plans or cancel?',
    a: 'Manage upgrades, downgrades, and billing anytime from your account. Changes apply on your next billing cycle.',
  },
] as const;

type SecondaryPlan = {
  id: 'free' | 'plus';
  name: string;
  headline: string;
  image: string;
  features: string[];
};

const SECONDARY_PLANS: SecondaryPlan[] = [
  {
    id: 'free',
    name: 'Free',
    headline: 'Start organized',
    image: FREE_IMAGE,
    features: [
      `${PET_LIMITS.free} pet profile`,
      'Basic health records & reminders',
      '30-day timeline',
      '2 lifetime AI scans',
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    headline: 'For growing households',
    image: PLUS_IMAGE,
    features: [
      `Up to ${PET_LIMITS.plus} pets`,
      'Pet passports & monthly reports',
      '5 AI scans per month',
      '2 caregivers · full timeline',
    ],
  },
];

function formatTierPrice(
  plan: CommercialPlan,
  interval: BillingInterval,
  foundingDiscount: boolean,
): string {
  if (plan === 'free') return '₹0';
  if (plan === 'enterprise') return 'Custom';
  const label = getPlanPriceLabel(plan, interval, foundingDiscount);
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
        Annual
        <span className={styles.billingSavings}>{ANNUAL_BADGE}</span>
      </button>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className={styles.checkIcon} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M4 10.5 8 14.5 16 6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MatrixValue({ value, pro = false }: { value: MatrixCell; pro?: boolean }) {
  if (value === true) {
    return (
      <span className={`${styles.matrixCheck} ${pro ? styles.matrixCheckPro : ''}`} aria-label="Included">
        <CheckIcon />
      </span>
    );
  }
  if (value === false) {
    return <span className={styles.matrixDash} aria-label="Not included">—</span>;
  }
  if (value === 'launching') {
    return <span className={styles.matrixBadge}>Launching Soon</span>;
  }
  if (value === 'enterprise-only') {
    return <span className={styles.matrixBadgeDark}>Enterprise</span>;
  }
  return <span className={pro ? styles.matrixTextPro : styles.matrixText}>{value}</span>;
}

function FeatureMatrix() {
  let lastCategory: string | undefined;

  return (
    <section className={styles.matrixSection} aria-labelledby="compare-plans-heading">
      <div className={styles.matrixHeader}>
        <p className={styles.sectionEyebrow}>Compare plans</p>
        <h2 id="compare-plans-heading" className={styles.sectionTitle}>
          Everything you get with Pro
        </h2>
        <p className={styles.sectionLead}>
          Pro unlocks the full PetClues experience - from everyday organization to emergency readiness.
        </p>
      </div>

      <div className={styles.matrixWrap}>
        <table className={styles.matrix}>
          <thead>
            <tr>
              <th scope="col">Feature</th>
              <th scope="col">Free</th>
              <th scope="col">Plus</th>
              <th scope="col" className={styles.matrixProCol}>
                Pro
              </th>
            </tr>
          </thead>
          <tbody>
            {FEATURE_COMPARISON.map((row: ComparisonRow) => {
              const showCategory = row.category && row.category !== lastCategory;
              if (showCategory) lastCategory = row.category;

              return (
                <Fragment key={row.id}>
                  {showCategory && (
                    <tr className={styles.matrixCategoryRow}>
                      <th colSpan={4} scope="colgroup">
                        {row.category}
                      </th>
                    </tr>
                  )}
                  <tr className={row.id === 'coming-soon' ? styles.matrixHighlightRow : ''}>
                    <th scope="row">{row.label}</th>
                    <td><MatrixValue value={row.free} /></td>
                    <td><MatrixValue value={row.plus} /></td>
                    <td className={styles.matrixProCol}>
                      <MatrixValue value={row.pro} pro />
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type HighlightedPlan = 'plus' | 'pro';

function parseHighlightedPlan(value: string | null): HighlightedPlan | null {
  if (value === 'plus' || value === 'pro') return value;
  return null;
}

export function PricingPage() {
  const { isAuthenticated, user } = useAuth();
  const { currentPlan, startCheckout, openBillingPortal } = useSubscription();
  const { track } = useAnalytics();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const proSectionRef = useRef<HTMLElement>(null);
  const plusCardRef = useRef<HTMLElement>(null);
  const highlightedPlan = parseHighlightedPlan(searchParams.get('plan'));
  const foundingDiscount = Boolean(user?.foundingLifetimeDiscount);

  useEffect(() => {
    track('pricing_viewed', highlightedPlan ? { highlightedPlan } : undefined);
  }, [track, highlightedPlan]);

  useEffect(() => {
    const targetRef = highlightedPlan === 'plus' ? plusCardRef : proSectionRef;
    if (!highlightedPlan) return;

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
    if (!isAuthenticated) {
      if (planId === 'pro') return 'Get Pro';
      if (planId === 'plus') return 'Get Plus';
      return 'Start free';
    }
    if (planId === currentPlan) return 'Current plan';
    if (planId === 'free') return 'Manage plan';
    if (currentPlan === 'pro' && planId === 'plus') return 'Downgrade via billing';
    if (planId === 'pro') return 'Upgrade to Pro';
    return 'Choose Plus';
  };

  const proPrice = formatTierPrice('pro', interval, foundingDiscount);
  const proIsCurrent = isAuthenticated && currentPlan === 'pro';

  const content = (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="pricing-hero-title">
        <img src={PRO_HERO_IMAGE} alt="" className={styles.heroImg} fetchPriority="high" />
        <div className={styles.heroScrim} aria-hidden />
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <Badge variant="accent" className={styles.heroBadge}>
              PetClues Pro
            </Badge>
            <h1 id="pricing-hero-title" className={styles.heroTitle}>
              Peace of mind for every pet you love
            </h1>
            <p className={styles.heroLead}>
              Advanced AI, emergency readiness, and priority support - the plan serious pet parents
              choose when health records are not optional.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>{PET_LIMITS.pro}</span>
                <span className={styles.heroStatLabel}>pets</span>
              </div>
              <div className={styles.heroStatDivider} aria-hidden />
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>30</span>
                <span className={styles.heroStatLabel}>AI scans / mo</span>
              </div>
              <div className={styles.heroStatDivider} aria-hidden />
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>24h</span>
                <span className={styles.heroStatLabel}>priority support</span>
              </div>
            </div>
            <button
              type="button"
              className={styles.heroCta}
              disabled={loading || proIsCurrent}
              onClick={() => void handleSelect('pro')}
            >
              {ctaLabel('pro')}
            </button>
          </div>
        </div>
      </section>

      <div className={styles.main}>
        <div className="container">
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}

          <div className={styles.toggleRow}>
            <BillingToggle value={interval} onChange={setInterval} />
            {foundingDiscount && (
              <p className={styles.foundingNote}>
                Founding Member: {FOUNDING_DISCOUNT_PERCENT}% lifetime discount on Pro at checkout
              </p>
            )}
          </div>

          <section
            ref={proSectionRef}
            className={`${styles.proSpotlight} ${highlightedPlan === 'pro' ? styles.proSpotlightHighlighted : ''}`}
            aria-labelledby="pro-plan-heading"
          >
            <div className={styles.proSpotlightGlow} aria-hidden />
            <div className={styles.proSpotlightInner}>
              <div className={styles.proVisual}>
                <img
                  src={LANDING_IMG.trust}
                  alt="Pet parent reviewing health records with confidence"
                  className={styles.proVisualImg}
                  loading="lazy"
                />
                <div className={styles.proVisualBadge}>
                  <span>Most chosen</span>
                </div>
              </div>

              <div className={styles.proContent}>
                <p className={styles.proEyebrow}>Recommended</p>
                <h2 id="pro-plan-heading" className={styles.proTitle}>
                  Pro
                </h2>
                <p className={styles.proTagline}>
                  Absolute certainty for households who leave nothing to chance.
                </p>

                <div className={styles.proPriceBlock}>
                  <span className={styles.proPrice}>{proPrice}</span>
                  {interval === 'yearly' && (
                    <span className={styles.proPriceNote}>{getAnnualSavingsLabel('pro')}</span>
                  )}
                  {interval === 'monthly' && (
                    <span className={styles.proPriceNote}>
                      or {getPlanPriceLabel('pro', 'yearly', foundingDiscount)}/year
                    </span>
                  )}
                  {foundingDiscount && interval === 'monthly' && (
                    <span className={styles.proFoundingBadge}>
                      Founding price applied
                    </span>
                  )}
                </div>

                <ul className={styles.proFeatureList}>
                  <li>
                    <CheckIcon />
                    Up to {PET_LIMITS.pro} pets &amp; unlimited caregivers
                  </li>
                  <li>
                    <CheckIcon />
                    30 AI scans per month &amp; advanced PetCare Score
                  </li>
                  <li>
                    <CheckIcon />
                    Health Foresight AI &amp; vet collaboration portal
                  </li>
                  <li>
                    <CheckIcon />
                    One-Click Emergency Mode
                  </li>
                  <li>
                    <CheckIcon />
                    Priority support &amp; all Launching Soon features
                  </li>
                </ul>

                <button
                  type="button"
                  className={styles.proCta}
                  disabled={loading || proIsCurrent}
                  onClick={() => void handleSelect('pro')}
                >
                  {ctaLabel('pro')}
                </button>
                <p className={styles.proGuarantee}>
                  Start free anytime. Upgrade when your household is ready.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.secondarySection} aria-labelledby="other-plans-heading">
            <div className={styles.secondaryHeader}>
              <h2 id="other-plans-heading" className={styles.secondaryTitle}>
                Other plans
              </h2>
              <p className={styles.secondaryLead}>
                Start free, or choose Plus if you need more pets without the full Pro toolkit.
              </p>
            </div>

            <div className={styles.secondaryGrid}>
              {SECONDARY_PLANS.map((plan) => {
                const isCurrent = isAuthenticated && plan.id === currentPlan;
                const isHighlighted = highlightedPlan === plan.id;

                return (
                  <article
                    key={plan.id}
                    ref={plan.id === 'plus' ? plusCardRef : undefined}
                    className={`${styles.secondaryCard} ${isHighlighted ? styles.secondaryCardHighlighted : ''}`}
                  >
                    <div className={styles.secondaryVisual}>
                      <img src={plan.image} alt="" className={styles.secondaryImg} loading="lazy" />
                    </div>
                    <div className={styles.secondaryBody}>
                      <p className={styles.secondaryPlan}>{plan.name}</p>
                      <h3 className={styles.secondaryHeadline}>{plan.headline}</h3>
                      <p className={styles.secondaryPrice}>
                        {formatTierPrice(plan.id, interval, false)}
                      </p>
                      {interval === 'yearly' && plan.id === 'plus' && (
                        <p className={styles.secondaryPriceNote}>{getAnnualSavingsLabel('plus')}</p>
                      )}
                      <ul className={styles.secondaryFeatures}>
                        {plan.features.map((feature) => (
                          <li key={feature}>{feature}</li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        className={styles.secondaryCta}
                        disabled={loading || isCurrent}
                        onClick={() => void handleSelect(plan.id)}
                      >
                        {ctaLabel(plan.id)}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <FeatureMatrix />

        <div className="container">
          <section className={styles.whyPro} aria-labelledby="why-pro-heading">
            <div className={styles.whyProHeader}>
              <p className={styles.sectionEyebrow}>Why Pro</p>
              <h2 id="why-pro-heading" className={styles.sectionTitle}>
                Built for the moments that matter
              </h2>
            </div>
            <div className={styles.whyProGrid}>
              {PRO_HIGHLIGHTS.map((item) => (
                <article key={item.title} className={styles.whyProCard}>
                  <h3 className={styles.whyProCardTitle}>{item.title}</h3>
                  <p className={styles.whyProCardDesc}>{item.description}</p>
                </article>
              ))}
            </div>

            <div className={styles.comingSoon}>
              <p className={styles.comingSoonLabel}>Included with Pro as they launch</p>
              <ul className={styles.comingSoonList}>
                {COMING_SOON_FEATURES.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className={styles.faq} aria-labelledby="pricing-faq-heading">
            <div className={styles.faqHeader}>
              <p className={styles.sectionEyebrow}>Questions</p>
              <h2 id="pricing-faq-heading" className={styles.sectionTitle}>
                Pricing FAQ
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

          <section className={styles.finalCta} aria-labelledby="final-cta-heading">
            <div className={styles.finalCtaInner}>
              <h2 id="final-cta-heading" className={styles.finalCtaTitle}>
                Ready for absolute certainty?
              </h2>
              <p className={styles.finalCtaLead}>
                Join pet parents who refuse to scramble for records when it counts.
              </p>
              <button
                type="button"
                className={styles.finalCtaBtn}
                disabled={loading || proIsCurrent}
                onClick={() => void handleSelect('pro')}
              >
                {ctaLabel('pro')}
              </button>
              {!isAuthenticated && (
                <p className={styles.finalCtaNote}>
                  Or{' '}
                  <Link to={ROUTES.SIGNUP} className={styles.finalCtaLink}>
                    start free
                  </Link>{' '}
                  with one pet - no card required.
                </p>
              )}
            </div>
          </section>

          <section className={styles.enterprise} aria-labelledby="enterprise-heading">
            <p className={styles.sectionEyebrowLight}>Enterprise</p>
            <h2 id="enterprise-heading" className={styles.enterpriseTitle}>
              Clinics &amp; organizations
            </h2>
            <p className={styles.enterpriseLead}>
              Unlimited pets, clinic dashboards, staff accounts, API access, and dedicated support
              for veterinary groups and large operations.
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

          <p className={styles.footnote}>
            Plus from {formatInrDisplay(PLUS_MONTHLY_INR)}/mo · Pro from{' '}
            {formatInrDisplay(PRO_MONTHLY_INR)}/mo · Prices in INR · Cancel anytime
          </p>
        </div>
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
