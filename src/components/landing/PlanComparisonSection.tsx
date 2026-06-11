import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import {
  formatInr,
  PLUS_MONTHLY_INR,
  PRO_MONTHLY_INR,
} from '@/config/pricingConfig';
import { PET_LIMITS } from '@/subscription/entitlements';
import { ROUTES } from '@/routes/paths';
import styles from './PlanComparisonSection.module.css';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: '',
    petLimit: `${PET_LIMITS.free} Pet`,
    features: ['Basic Records', 'Basic Reminders'],
    cta: 'Get Started',
    href: ROUTES.SIGNUP,
    variant: 'minimal' as const,
  },
  {
    id: 'plus',
    name: 'Plus',
    price: formatInr(PLUS_MONTHLY_INR),
    period: '/mo',
    petLimit: `${PET_LIMITS.plus} Pets`,
    features: ['Passports', 'Reports', 'AI Features'],
    cta: 'Upgrade to Plus',
    href: ROUTES.PRICING,
    variant: 'plus' as const,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: formatInr(PRO_MONTHLY_INR),
    period: '/mo',
    petLimit: `${PET_LIMITS.pro} Pets`,
    features: ['Everything in Plus', 'Priority Support', 'Advanced AI', 'Coming Soon Features'],
    cta: 'Upgrade to Pro',
    href: ROUTES.PRICING,
    variant: 'pro' as const,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    petLimit: '10+ Pets',
    features: ['Clinic Tools', 'Team Access', 'Custom Solutions'],
    cta: 'Contact Sales',
    href: 'mailto:support@petclues.com?subject=PetClues%20Enterprise',
    variant: 'enterprise' as const,
  },
];

export function PlanComparisonSection() {
  return (
    <section className={styles.section} id="plans" aria-labelledby="plan-comparison-title">
      <div className="container">
        <header className={styles.header}>
          <h2 id="plan-comparison-title" className={styles.title}>
            Choose the plan that fits your pet&apos;s journey.
          </h2>
          <p className={styles.subtitle}>
            Start free. Upgrade when you need more pets, deeper insights, and advanced care tools.
          </p>
        </header>

        <div className={styles.grid}>
          {PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`${styles.card} ${styles[plan.variant]}`}
            >
              {plan.variant === 'pro' && (
                <span className={styles.badge}>Most Popular</span>
              )}
              <h3 className={styles.planName}>{plan.name}</h3>
              <div className={styles.priceRow}>
                <span className={styles.price}>{plan.price}</span>
                {plan.period && <span className={styles.period}>{plan.period}</span>}
              </div>
              <p className={styles.petLimit}>{plan.petLimit}</p>
              <ul className={styles.features}>
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              {plan.href.startsWith('mailto:') ? (
                <Button
                  variant={plan.variant === 'enterprise' ? 'secondary' : 'primary'}
                  size="lg"
                  fullWidth
                  onClick={() => { window.location.href = plan.href; }}
                >
                  {plan.cta}
                </Button>
              ) : (
                <Link to={plan.href} className={styles.ctaLink}>
                  <Button
                    variant={plan.variant === 'pro' ? 'primary' : 'secondary'}
                    size="lg"
                    fullWidth
                  >
                    {plan.cta}
                  </Button>
                </Link>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
