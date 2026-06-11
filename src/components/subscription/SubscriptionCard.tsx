import { Button } from '@/components/ui';
import {
  ANNUAL_BADGE,
  CUSTOM_LIMITS_EMAIL,
  getAnnualSavingsLabel,
  getPlanPriceLabel,
} from '@/config/pricingConfig';
import type { BillingInterval, SubscriptionPlan } from '@/types/subscription';
import styles from './SubscriptionCard.module.css';

type SubscriptionCardProps = {
  plan: SubscriptionPlan;
  interval: BillingInterval;
  isCurrent?: boolean;
  onSelect?: () => void;
  loading?: boolean;
  ctaLabel?: string;
};

function defaultCta(plan: SubscriptionPlan): string {
  if (plan.id === 'free') return 'Get Started';
  if (plan.contactOnly) return 'Contact Sales';
  if (plan.id === 'plus') return 'Upgrade to Plus';
  if (plan.id === 'pro') return 'Upgrade to Pro';
  return `Choose ${plan.name}`;
}

function cardVariant(plan: SubscriptionPlan): string {
  if (plan.contactOnly) return styles.enterprise;
  if (plan.highlighted) return styles.pro;
  if (plan.id === 'plus') return styles.plus;
  return styles.free;
}

export function SubscriptionCard({
  plan,
  interval,
  isCurrent = false,
  onSelect,
  loading = false,
  ctaLabel,
}: SubscriptionCardProps) {
  const label = ctaLabel ?? defaultCta(plan);
  const isEnterprise = plan.contactOnly;
  const isFree = plan.id === 'free';

  let priceMain = plan.priceDisplay;
  let priceSub = '';

  if (!isFree && !isEnterprise) {
    priceMain = getPlanPriceLabel(plan.id as 'plus' | 'pro', interval);
    if (interval === 'yearly') {
      priceSub = '/year';
    } else {
      priceSub = '/month';
    }
  } else if (isFree) {
    priceMain = '₹0';
    priceSub = '/month';
  } else {
    priceMain = 'Custom';
  }

  const savings =
    interval === 'yearly' && (plan.id === 'plus' || plan.id === 'pro')
      ? getAnnualSavingsLabel(plan.id)
      : null;

  return (
    <article className={`${styles.card} ${cardVariant(plan)}`}>
      {plan.highlighted && (
        <span className={styles.badge}>Most Popular</span>
      )}

      <h3 className={styles.name}>{plan.name}</h3>
      <p className={styles.description}>{plan.description}</p>

      <div className={styles.priceBlock}>
        <div className={styles.price}>
          <span className={styles.amount}>{priceMain}</span>
          {priceSub && <span className={styles.period}>{priceSub}</span>}
        </div>
        {interval === 'yearly' && !isFree && !isEnterprise && (
          <span className={styles.annualNote}>{ANNUAL_BADGE}</span>
        )}
        {savings && <span className={styles.savings}>{savings}</span>}
        {isEnterprise && (
          <span className={styles.contactNote}>Contact Sales</span>
        )}
      </div>

      <ul className={styles.features}>
        {plan.features.map((feature) => (
          <li key={feature} className={styles.feature}>
            <span className={styles.check} aria-hidden>✓</span>
            {feature}
          </li>
        ))}
      </ul>

      <div className={styles.cta}>
        {isCurrent ? (
          <Button variant="secondary" size="lg" fullWidth disabled>
            Current plan
          </Button>
        ) : isEnterprise ? (
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            className={styles.enterpriseBtn}
            onClick={() => {
              window.location.href = `mailto:${CUSTOM_LIMITS_EMAIL}?subject=PetClues%20Enterprise`;
            }}
          >
            {label}
          </Button>
        ) : (
          <Button
            variant={plan.highlighted ? 'primary' : 'secondary'}
            size="lg"
            fullWidth
            onClick={onSelect}
            disabled={loading || !onSelect}
          >
            {label}
          </Button>
        )}
      </div>
    </article>
  );
}
