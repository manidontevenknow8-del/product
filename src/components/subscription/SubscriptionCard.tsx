import { Button } from '@/components/ui';
import type { BillingInterval, SubscriptionPlan } from '@/types/subscription';
import styles from './SubscriptionCard.module.css';

type SubscriptionCardProps = {
  plan: SubscriptionPlan;
  interval: BillingInterval;
  isCurrent?: boolean;
  onSelect?: () => void;
  loading?: boolean;
};

export function SubscriptionCard({
  plan,
  interval,
  isCurrent = false,
  onSelect,
  loading = false,
}: SubscriptionCardProps) {
  const period = plan.id === 'free' ? '' : interval === 'yearly' ? '/ year' : '/ month';
  const priceLabel = plan.id === 'free' ? 'Free' : plan.priceDisplay;

  return (
    <article
      className={`${styles.card} ${plan.highlighted ? styles.highlighted : ''}`}
    >
      {plan.highlighted && <span className={styles.badge}>Most popular</span>}

      <h3 className={styles.name}>{plan.name}</h3>
      <p className={styles.description}>{plan.description}</p>

      <div className={styles.price}>
        <span className={styles.amount}>{priceLabel}</span>
        {period && <span className={styles.period}> {period}</span>}
      </div>

      <ul className={styles.features}>
        {plan.features.map((feature) => (
          <li key={feature} className={styles.feature}>
            <span className={styles.featureDot} aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>

      <div className={styles.cta}>
        {isCurrent ? (
          <Button variant="secondary" size="lg" fullWidth disabled>
            Current plan
          </Button>
        ) : (
          <Button
            variant={plan.highlighted ? 'primary' : 'secondary'}
            size="lg"
            fullWidth
            onClick={onSelect}
            disabled={loading || !onSelect}
          >
            {plan.id === 'free' ? 'Stay on Free' : 'Upgrade to Pro'}
          </Button>
        )}
      </div>
    </article>
  );
}
