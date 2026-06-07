import {
  BETA_RELEASE_AUDIT,
  AUDIT_SECTIONS,
  AUDIT_SECTION_LABELS,
  getBetaReadinessScore,
  getProductionReadinessScore,
  getLaunchBlockers,
  getCriticalIssues,
  type BetaAuditItem,
} from '@/data/betaReleaseAudit';
import { BUILD_INFO } from '@/data/buildInfo';
import styles from './BetaReleaseCandidateReport.module.css';

function AuditItemRow({ item }: { item: BetaAuditItem }) {
  const statusClass =
    item.status === 'pass'
      ? styles.itemPass
      : item.status === 'partial'
        ? styles.itemPartial
        : styles.itemFail;

  return (
    <article className={`${styles.item} ${statusClass}`}>
      <h4 className={styles.itemTitle}>
        {item.title}
        {item.isBlocker && (
          <span className={`${styles.badge} ${styles.badgeBlocker}`}>Blocker</span>
        )}
      </h4>
      <p className={styles.itemDesc}>{item.description}</p>
      {item.recommendation && (
        <p className={styles.rec}>→ {item.recommendation}</p>
      )}
    </article>
  );
}

const POST_BETA_MILESTONES = [
  'Connect Supabase auth, database, and storage',
  'Enable production analytics (PostHog or Plausible recommended)',
  'Legal counsel review of Privacy, Terms, and Cookie policies',
  'Deploy to staging with sitemap.xml, robots.txt, and OG image assets',
  'Set up error monitoring (Sentry) and uptime checks',
  'Beta cohort onboarding with feedback loop via BetaFeedbackPage',
  'Performance audit: code-splitting for 500KB+ bundle',
  'Feature flags for gradual rollout of premium features',
];

export function BetaReleaseCandidateReport() {
  const betaScore = getBetaReadinessScore();
  const prodScore = getProductionReadinessScore();
  const blockers = getLaunchBlockers();
  const critical = getCriticalIssues();

  return (
    <div className={styles.report}>
      <div className={styles.scores}>
        <div className={styles.scoreCard}>
          <div className={`${styles.scoreValue} ${styles.scoreBeta}`}>{betaScore}%</div>
          <div className={styles.scoreLabel}>Beta readiness score</div>
          <div className={styles.scoreDesc}>
            v{BUILD_INFO.version} · {BUILD_INFO.releaseChannel}
          </div>
        </div>
        <div className={styles.scoreCard}>
          <div className={`${styles.scoreValue} ${styles.scoreProd}`}>{prodScore}%</div>
          <div className={styles.scoreLabel}>Production readiness score</div>
          <div className={styles.scoreDesc}>
            Weighted by launch blockers
          </div>
        </div>
      </div>

      {blockers.length > 0 && (
        <section className={styles.blockers}>
          <h3 className={styles.blockersTitle}>Launch blockers ({blockers.length})</h3>
          <div className={styles.list}>
            {blockers.map((item) => (
              <AuditItemRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {critical.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Critical issues</h3>
          <div className={styles.list}>
            {critical.map((item) => (
              <AuditItemRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {AUDIT_SECTIONS.map((section) => {
        const items = BETA_RELEASE_AUDIT.filter((i) => i.audit === section);
        return (
          <section key={section} className={styles.section}>
            <h3 className={styles.sectionTitle}>{AUDIT_SECTION_LABELS[section]}</h3>
            <div className={styles.list}>
              {items.map((item) => (
                <AuditItemRow key={item.id} item={item} />
              ))}
            </div>
          </section>
        );
      })}

      <section className={styles.milestones}>
        <h3 className={styles.milestonesTitle}>Recommended milestones after beta</h3>
        <div className={styles.milestoneList}>
          {POST_BETA_MILESTONES.map((m) => (
            <p key={m} className={styles.milestone}>{m}</p>
          ))}
        </div>
      </section>
    </div>
  );
}
