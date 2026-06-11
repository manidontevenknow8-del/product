import type { FeatureAccessResult } from '@/subscription/planLimits';
import styles from './DecoderUsageBar.module.css';

type DecoderUsageBarProps = {
  decoderAccess: FeatureAccessResult;
  isEnterprise: boolean;
  isMonthlyQuota: boolean;
};

function usageCopy(
  decoderAccess: FeatureAccessResult,
  isMonthlyQuota: boolean,
): { label: string; used: number; total: number } | null {
  if (decoderAccess.usageLimit === 'unlimited') return null;
  const total = decoderAccess.usageLimit;
  if (typeof total !== 'number') return null;

  const used = decoderAccess.currentUsage;
  if (isMonthlyQuota) {
    return {
      label: 'scans this month',
      used,
      total,
    };
  }
  return {
    label: 'lifetime scans used',
    used,
    total,
  };
}

export function DecoderUsageBar({
  decoderAccess,
  isEnterprise,
  isMonthlyQuota,
}: DecoderUsageBarProps) {
  if (isEnterprise) return null;

  const usage = usageCopy(decoderAccess, isMonthlyQuota);
  if (!usage) return null;

  const dots = Array.from({ length: usage.total }, (_, i) => i < usage.used);

  return (
    <div className={styles.root} aria-label="Decoder scan usage">
      <p className={styles.label}>AI extractions</p>
      <div className={styles.metrics}>
        <div className={styles.dots} aria-hidden>
          {dots.map((filled, index) => (
            <span
              key={index}
              className={`${styles.dot} ${filled ? styles.dotFilled : ''}`.trim()}
            />
          ))}
        </div>
        <p className={styles.count}>
          <span className={styles.countStrong}>
            {usage.used}/{usage.total}
          </span>{' '}
          <span className={styles.countMuted}>{usage.label}</span>
        </p>
      </div>
    </div>
  );
}
