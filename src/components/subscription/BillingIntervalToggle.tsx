import { ANNUAL_BADGE } from '@/config/pricingConfig';
import type { BillingInterval } from '@/types/subscription';
import styles from './BillingIntervalToggle.module.css';

type BillingIntervalToggleProps = {
  value: BillingInterval;
  onChange: (interval: BillingInterval) => void;
};

export function BillingIntervalToggle({ value, onChange }: BillingIntervalToggleProps) {
  return (
    <div className={styles.wrap} role="group" aria-label="Billing interval">
      <div className={styles.toggle}>
        <button
          type="button"
          className={`${styles.btn} ${value === 'monthly' ? styles.active : ''}`}
          onClick={() => onChange('monthly')}
          aria-pressed={value === 'monthly'}
        >
          Monthly
        </button>
        <button
          type="button"
          className={`${styles.btn} ${value === 'yearly' ? styles.active : ''}`}
          onClick={() => onChange('yearly')}
          aria-pressed={value === 'yearly'}
        >
          Annual
          <span className={styles.badge}>{ANNUAL_BADGE}</span>
        </button>
      </div>
    </div>
  );
}
