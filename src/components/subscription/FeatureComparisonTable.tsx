import {
  COMING_SOON_FEATURES,
  ENTERPRISE_EXCLUSIVE_FEATURES,
  FEATURE_COMPARISON,
  type MatrixCell,
} from '@/data/pricingMatrix';
import { CUSTOM_LIMITS_EMAIL } from '@/subscription/entitlements';
import styles from './FeatureComparisonTable.module.css';

function CellValue({ value }: { value: MatrixCell }) {
  if (value === true) {
    return (
      <span className={styles.check} aria-label="Included">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <path d="M4 9l3.5 3.5L14 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (value === false) {
    return <span className={styles.dash} aria-label="Not included">—</span>;
  }
  if (value === 'launching') {
    return <span className={styles.launching}>Included</span>;
  }
  if (value === 'enterprise-only') {
    return <span className={styles.enterpriseTag}>Enterprise</span>;
  }
  return <span className={styles.text}>{value}</span>;
}

export function FeatureComparisonTable() {
  return (
    <section className={styles.section} aria-labelledby="feature-comparison-title">
      <h2 id="feature-comparison-title" className={styles.title}>
        Complete feature comparison
      </h2>
      <p className={styles.subtitle}>
        Professional pet care management — compare every plan in detail.
      </p>

      {/* Desktop table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Feature</th>
              <th scope="col">Free</th>
              <th scope="col">Plus</th>
              <th scope="col" className={styles.proCol}>Pro</th>
              <th scope="col">Enterprise</th>
            </tr>
          </thead>
          <tbody>
            {FEATURE_COMPARISON.map((row) => (
              <tr key={row.id}>
                <th scope="row">{row.label}</th>
                <td><CellValue value={row.free} /></td>
                <td><CellValue value={row.plus} /></td>
                <td className={styles.proCol}><CellValue value={row.pro} /></td>
                <td><CellValue value={row.enterprise} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className={styles.mobileCards}>
        {(['free', 'plus', 'pro', 'enterprise'] as const).map((plan) => (
          <article key={plan} className={`${styles.mobileCard} ${plan === 'pro' ? styles.mobileCardPro : ''}`}>
            <h3 className={styles.mobilePlanName}>
              {plan.charAt(0).toUpperCase() + plan.slice(1)}
            </h3>
            <ul className={styles.mobileList}>
              {FEATURE_COMPARISON.map((row) => (
                <li key={row.id} className={styles.mobileRow}>
                  <span className={styles.mobileLabel}>{row.label}</span>
                  <CellValue value={row[plan]} />
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className={styles.detailSections}>
        <div className={styles.detailBlock}>
          <h3 className={styles.detailTitle}>Launching Soon</h3>
          <p className={styles.detailIntro}>Included with Pro and Enterprise.</p>
          <ul className={styles.detailList}>
            {COMING_SOON_FEATURES.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
        <div className={styles.detailBlock}>
          <h3 className={styles.detailTitle}>Enterprise exclusive</h3>
          <ul className={styles.detailList}>
            {ENTERPRISE_EXCLUSIVE_FEATURES.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
        <p className={styles.enterpriseNote}>
          Need more than 10 pets? Contact{' '}
          <a href={`mailto:${CUSTOM_LIMITS_EMAIL}`}>{CUSTOM_LIMITS_EMAIL}</a> for custom pricing.
        </p>
      </div>
    </section>
  );
}
