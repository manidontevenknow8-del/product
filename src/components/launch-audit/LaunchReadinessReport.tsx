import {
  LAUNCH_READINESS_AUDIT,
  AUDITED_PAGES,
  getReadinessSummary,
  type AuditItem,
} from '@/data/launchReadinessData';
import { MobileOptimizationChecklist } from '@/components/mobile';
import styles from './LaunchReadinessReport.module.css';

function AuditRow({ item }: { item: AuditItem }) {
  const statusClass =
    item.status === 'pass'
      ? styles.itemPass
      : item.status === 'partial'
        ? styles.itemPartial
        : styles.itemFail;

  const badgeClass =
    item.status === 'pass'
      ? styles.badgePass
      : item.status === 'partial'
        ? styles.badgePartial
        : styles.badgeFail;

  return (
    <article className={`${styles.item} ${statusClass}`}>
      <span className={styles.category}>{item.category}</span>
      <div className={styles.itemHeader}>
        <h3 className={styles.itemTitle}>{item.title}</h3>
        <span className={`${styles.badge} ${badgeClass}`}>{item.status}</span>
      </div>
      <p className={styles.itemDesc}>{item.description}</p>
      {item.recommendation && (
        <p className={styles.recommendation}>→ {item.recommendation}</p>
      )}
    </article>
  );
}

export function LaunchReadinessReport() {
  const summary = getReadinessSummary();

  const grouped = LAUNCH_READINESS_AUDIT.reduce<Record<string, AuditItem[]>>(
    (acc, item) => {
      acc[item.category] = acc[item.category] ?? [];
      acc[item.category]!.push(item);
      return acc;
    },
    {},
  );

  return (
    <div className={styles.report}>
      <header className={styles.hero}>
        <div className={styles.score}>{summary.score}%</div>
        <p className={styles.scoreLabel}>{summary.label}</p>
        <div className={styles.stats}>
          <span className={styles.stat}>
            <strong>{summary.pass}</strong> passed
          </span>
          <span className={styles.stat}>
            <strong>{summary.partial}</strong> partial
          </span>
          <span className={styles.stat}>
            <strong>{summary.fail}</strong> needs work
          </span>
          <span className={styles.stat}>
            <strong>{summary.high}</strong> high severity
          </span>
        </div>
      </header>

      <MobileOptimizationChecklist />

      {Object.entries(grouped).map(([category, items]) => (
        <section key={category} className={styles.section}>
          <h2 className={styles.sectionTitle}>{category}</h2>
          <div className={styles.list}>
            {items.map((item) => (
              <AuditRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Pages audited</h2>
        <div className={styles.pages}>
          {AUDITED_PAGES.map((page) => (
            <span key={page} className={styles.pageTag}>
              {page}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
