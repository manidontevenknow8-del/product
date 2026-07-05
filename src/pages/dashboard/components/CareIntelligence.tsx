import { Link } from 'react-router-dom';
import { useFeatureAccess } from '@/subscription/useFeatureAccess';
import { clampPercent } from '../utils';
import { ROUTES } from '@/routes/paths';
import type { MonthlyPetLifeReport } from '@/types/monthlyReport';
import type { Reminder } from '@/types/reminder';
import { formatDueLabel } from '@/utils/reminderUtils';
import styles from '../../DashboardPage.module.css';

type CareIntelligenceProps = {
  petName: string;
  metrics: { id: string; label: string; value: number }[];
  score: number | null;
  scoreLabel?: string;
  trendText: string;
  isLoading: boolean;
  report: MonthlyPetLifeReport;
  insightTitle: string;
  insightBody: string;
  scoreLoading: boolean;
  upcomingReminders: Reminder[];
};

export function CareIntelligence({
  petName,
  metrics,
  score,
  scoreLabel,
  trendText,
  isLoading,
  report,
  insightTitle,
  insightBody,
  scoreLoading,
  upcomingReminders,
}: CareIntelligenceProps) {
  const foresightBasics = useFeatureAccess('petCareScore');
  const proInsights = useFeatureAccess('advancedHealthInsights');
  const monthMetrics = report.metrics.slice(0, 3);

  return (
    <section className={styles.chapterCare} aria-labelledby="chapter-care">
      <div className={styles.chapterInner}>
        <header className={styles.chapterHeader}>
          <p className={styles.sectionEyebrowGold}>Care intelligence</p>
          <h2 id="chapter-care" className={styles.chapterTitle}>
            How {petName} is doing
          </h2>
          <p className={styles.chapterLead}>Score, rhythm, and signal — drawn from your real records.</p>
        </header>

        <div className={styles.careLayout}>
          <div className={styles.carePrimary}>
            {isLoading || score == null ? (
              <p className={styles.mutedText}>Calculating your care picture…</p>
            ) : (
              <>
                <div className={styles.scoreBlock}>
                  <span className={styles.scoreNumber}>{score}</span>
                  {scoreLabel && <span className={styles.scoreLabel}>{scoreLabel}</span>}
                </div>
                <div className={styles.metricTable}>
                  {metrics.map((m) => (
                    <div key={m.id} className={styles.metricRow}>
                      <span className={styles.metricRowLabel}>{m.label}</span>
                      <div className={styles.metricTrack}>
                        <div
                          className={styles.metricFill}
                          style={{ width: `${clampPercent(m.value)}%` }}
                        />
                      </div>
                      <span className={styles.metricPct}>{m.value}%</span>
                    </div>
                  ))}
                </div>
                <p className={styles.scoreFoot}>
                  {trendText && <span>{trendText} · </span>}
                  <Link to={ROUTES.PET_CARE_SCORE} className={styles.inlineLink}>
                    Full breakdown
                  </Link>
                </p>
              </>
            )}
          </div>

          <aside className={styles.careAside}>
            <article className={styles.monthCard}>
              <p className={styles.monthEyebrow}>{report.monthLabel.toUpperCase()}</p>
              <h3 className={styles.monthTitle}>{petName}&apos;s month</h3>
              <div className={styles.monthStats}>
                {monthMetrics.map((m) => (
                  <div key={m.label}>
                    <p className={styles.monthStatValue}>{m.value}</p>
                    <p className={styles.monthStatLabel}>{m.label}</p>
                  </div>
                ))}
              </div>
              <Link to={ROUTES.MONTHLY_REPORT} className={styles.monthLink}>
                View monthly report →
              </Link>
            </article>

            {upcomingReminders.length > 0 && (
              <article className={styles.scheduleCard}>
                <p className={styles.scheduleEyebrow}>Coming up</p>
                <ul className={styles.scheduleList}>
                  {upcomingReminders.map((r) => (
                    <li key={r.id} className={styles.scheduleItem}>
                      <span className={styles.scheduleTitle}>{r.title}</span>
                      <span className={styles.scheduleDue}>{formatDueLabel(r.dueDate)}</span>
                    </li>
                  ))}
                </ul>
                <Link to={ROUTES.REMINDERS} className={styles.inlineLinkDark}>
                  All reminders →
                </Link>
              </article>
            )}

            {foresightBasics.isAllowed ? (
              <article className={styles.insightCard}>
                <p className={styles.sectionEyebrowGold}>
                  {proInsights.isAllowed ? 'Pro insight' : 'Health Foresight · Plus'}
                </p>
                <h3 className={styles.insightTitle}>{insightTitle}</h3>
                {scoreLoading ? (
                  <p className={styles.insightBody}>Reading your care data…</p>
                ) : (
                  <p className={styles.insightBody}>{insightBody}</p>
                )}
                <Link to={ROUTES.PET_CARE_SCORE} className={styles.inlineLinkDark}>
                  Open foresight →
                </Link>
              </article>
            ) : (
              <article className={styles.insightCard}>
                <p className={styles.sectionEyebrowGold}>Health Foresight · Plus</p>
                <h3 className={styles.insightTitle}>Predictive care journal</h3>
                <p className={styles.insightBody}>
                  Plus unlocks your PetCare score with explanation, a real weight trend from check-ins,
                  and vaccine-due predictions. Upgrade to Pro for symptom pattern detection, weekly
                  digest, and multi-pet comparisons.
                </p>
                <Link to={`${ROUTES.PRICING}?plan=plus`} className={styles.inlineLinkDark}>
                  Upgrade to Plus →
                </Link>
              </article>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
