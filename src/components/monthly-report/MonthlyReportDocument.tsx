import { forwardRef } from 'react';
import { monthlyReportImageUrl } from '@/data/monthlyReportImages';
import { MONTHLY_REPORT_IMG } from '@/data/monthlyReportImages';
import type { MonthlyPetLifeReport } from '@/types/monthlyReport';
import {
  resolveCareScoreNarrative,
  resolveNarrativeIntro,
  resolveStorySections,
} from './legacyReportContent';
import styles from './MonthlyReportDocument.module.css';

type MonthlyReportDocumentProps = {
  report: MonthlyPetLifeReport;
};

export const MonthlyReportDocument = forwardRef<HTMLDivElement, MonthlyReportDocumentProps>(
  function MonthlyReportDocument({ report }, ref) {
    const storySections = resolveStorySections(report);
    const narrativeIntro = resolveNarrativeIntro(report);
    const careScoreNarrative = resolveCareScoreNarrative(report);
    const activityItems = report.activityItems ?? [];

    return (
      <article ref={ref} className={styles.document} aria-label="Monthly pet life report">
        <div className={styles.introPanel}>
          <p className={styles.introText}>{narrativeIntro}</p>
          <div className={styles.metrics}>
            {report.metrics.map((metric) => (
              <div key={metric.label} className={styles.metric}>
                <span className={styles.metricValue}>{metric.value}</span>
                <span className={styles.metricLabel}>{metric.label}</span>
                {metric.hint && <span className={styles.metricHint}>{metric.hint}</span>}
              </div>
            ))}
          </div>
        </div>

        <figure className={styles.featureStrip}>
          <img
            src={monthlyReportImageUrl(MONTHLY_REPORT_IMG.celebration)}
            alt=""
            className={styles.featureImg}
            loading="lazy"
            aria-hidden
          />
          <figcaption className={styles.featureCaption}>
            {report.petName}&apos;s {report.monthLabel} — built from your real PetClues activity
          </figcaption>
        </figure>

        {storySections.map((section, index) => (
          <section
            key={section.id}
            className={`${styles.chapter} ${index % 2 === 1 ? styles.chapterReversed : ''}`}
            aria-labelledby={`chapter-${section.id}`}
          >
            <div className={styles.chapterGrid}>
              <div className={styles.chapterCopy}>
                <p className={styles.chapterIntro}>{section.intro}</p>
                <h2 id={`chapter-${section.id}`} className={styles.chapterTitle}>
                  {section.title}
                </h2>
                <p className={styles.chapterBody}>{section.body}</p>
                {section.bullets && section.bullets.length > 0 && (
                  <ul className={styles.chapterList}>
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
              <figure className={styles.chapterVisual}>
                <img
                  src={monthlyReportImageUrl(section.image)}
                  alt={section.imageAlt}
                  className={styles.chapterImg}
                  loading="lazy"
                />
              </figure>
            </div>
          </section>
        ))}

        {report.milestones.length > 0 && (
          <section className={styles.milestones} aria-labelledby="monthly-milestones">
            <div className={styles.milestonesHead}>
              <div>
                <p className={styles.chapterIntro}>Wins worth celebrating</p>
                <h2 id="monthly-milestones" className={styles.chapterTitle}>
                  Milestones reached
                </h2>
              </div>
              <img
                src={monthlyReportImageUrl(MONTHLY_REPORT_IMG.milestones)}
                alt=""
                className={styles.milestonesThumb}
                loading="lazy"
                aria-hidden
              />
            </div>
            <div className={styles.milestoneGrid}>
              {report.milestones.map((m) => (
                <article key={m.id} className={styles.milestoneCard}>
                  <h3 className={styles.milestoneTitle}>{m.title}</h3>
                  <p className={styles.milestoneDesc}>{m.description}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {activityItems.length > 0 && (
          <section className={styles.timeline} aria-labelledby="monthly-timeline">
            <div className={styles.timelineHead}>
              <img
                src={monthlyReportImageUrl(MONTHLY_REPORT_IMG.scan)}
                alt=""
                className={styles.timelineThumb}
                loading="lazy"
                aria-hidden
              />
              <div>
                <p className={styles.chapterIntro}>Chronological highlights</p>
                <h2 id="monthly-timeline" className={styles.chapterTitle}>
                  Activity timeline
                </h2>
                <p className={styles.timelineSub}>
                  The latest moments you logged for {report.petName} this month.
                </p>
              </div>
            </div>
            <ol className={styles.timelineList}>
              {activityItems.map((item) => (
                <li key={item.id} className={styles.timelineItem}>
                  <span className={styles.timelineDate}>{item.dateLabel}</span>
                  <div className={styles.timelineBody}>
                    <span className={`${styles.timelineBadge} ${styles[`badge_${item.category}`]}`}>
                      {item.category}
                    </span>
                    <strong className={styles.timelineTitle}>{item.title}</strong>
                    <span className={styles.timelineDetail}>{item.detail}</span>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className={styles.scorePanel} aria-labelledby="monthly-score-panel">
          <img
            src={monthlyReportImageUrl(MONTHLY_REPORT_IMG.notify)}
            alt=""
            className={styles.scoreVisual}
            loading="lazy"
            aria-hidden
          />
          <div className={styles.scoreCopy}>
            <p className={styles.chapterIntro}>Closing reflection</p>
            <h2 id="monthly-score-panel" className={styles.chapterTitle}>
              PetCare Score reflection
            </h2>
            <p className={styles.chapterBody}>{careScoreNarrative}</p>
          </div>
        </section>

        <footer className={styles.footer}>
          <span>Generated {new Date(report.generatedAt).toLocaleDateString()}</span>
          <span>PetClues · Private by default</span>
        </footer>
      </article>
    );
  },
);
