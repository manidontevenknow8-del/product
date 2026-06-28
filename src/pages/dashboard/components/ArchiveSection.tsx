import { Link } from 'react-router-dom';
import { PremiumGate } from '@/components/ui';
import { formatShortDate } from '../utils';
import { ROUTES } from '@/routes/paths';
import type { DashboardMoment } from '@/services/dashboard/dashboardMoments';
import { partitionMomentsByHistoryWindow } from '@/services/dashboard/dashboardMoments';
import type { FeatureAccessResult } from '@/subscription/planLimits';
import type { PetDocumentRecord } from '@/services/documents/documentTypes';
import styles from '../../DashboardPage.module.css';

type ArchiveSectionProps = {
  moments: DashboardMoment[];
  documents: PetDocumentRecord[];
  timelineAccess: FeatureAccessResult;
};

export function ArchiveSection({ moments, documents, timelineAccess }: ArchiveSectionProps) {
  const { recentMoments, historicalMoments } = partitionMomentsByHistoryWindow(moments);
  const recentDocs = [...documents]
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
    .slice(0, 4);

  return (
    <section className={styles.chapterArchive} aria-labelledby="chapter-archive">
      <div className={styles.chapterInner}>
        <header className={styles.chapterHeaderRow}>
          <div>
            <p className={styles.sectionEyebrowGold}>Archive</p>
            <h2 id="chapter-archive" className={styles.chapterTitle}>
              Recent moments
            </h2>
          </div>
          <Link to={ROUTES.TIMELINE} className={styles.archiveCta}>
            Open full timeline →
          </Link>
        </header>

        <div className={styles.archiveLayout}>
          <div className={styles.archiveFeed}>
            {moments.length === 0 ? (
              <p className={styles.mutedText}>
                Vaccinations, uploads, and milestones will appear here as you build the record.
              </p>
            ) : (
              <ul className={styles.momentList}>
                {recentMoments.map((m) => (
                  <li key={m.id} className={styles.momentRow}>
                    <span className={styles.momentDot} aria-hidden />
                    <div className={styles.momentContent}>
                      <div className={styles.momentHead}>
                        <p className={styles.momentTitle}>{m.title}</p>
                        <time className={styles.momentDate} dateTime={m.occurredAt}>
                          {m.when}
                        </time>
                      </div>
                      <p className={styles.momentDesc}>{m.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {!timelineAccess.isAllowed && historicalMoments.length > 0 && (
              <div className={styles.archivePremium}>
                <PremiumGate
                  requiredTier="Plus"
                  title="Complete archive"
                  description="Upgrade to Plus for your pet's full permanent history."
                >
                  <ul className={styles.momentList} aria-hidden>
                    {historicalMoments.slice(0, 3).map((m) => (
                      <li key={m.id} className={styles.momentRow}>
                        <span className={styles.momentDot} aria-hidden />
                        <p className={styles.momentTitle}>{m.title}</p>
                      </li>
                    ))}
                  </ul>
                </PremiumGate>
              </div>
            )}
          </div>

          <aside className={styles.docPanel} aria-label="Recent documents">
            <p className={styles.docPanelEyebrow}>Recent documents</p>
            {recentDocs.length === 0 ? (
              <p className={styles.mutedText}>Uploaded files will appear here.</p>
            ) : (
              <ul className={styles.docList}>
                {recentDocs.map((doc) => (
                  <li key={doc.id}>
                    <Link to={ROUTES.SCAN} className={styles.docRow}>
                      <span className={styles.docName}>{doc.fileName}</span>
                      <span className={styles.docDate}>{formatShortDate(doc.uploadedAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link to={ROUTES.SCAN} className={styles.inlineLinkDark}>
              Upload or scan →
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
