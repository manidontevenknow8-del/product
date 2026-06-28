import { Link } from 'react-router-dom';
import { PAGE_IMG } from '@/data/pageImages';
import type { FeatureAccessResult } from '@/subscription/planLimits';
import { ROUTES } from '@/routes/paths';
import styles from '../../DashboardPage.module.css';

const ACTIONS = [
  {
    id: 'scan',
    label: 'Scan vet bill',
    desc: 'Decode charges and file them to the archive.',
    path: ROUTES.SCAN,
    image: PAGE_IMG.scan.report,
    featured: true,
    isDecoder: true,
  },
  {
    id: 'record',
    label: 'Add health record',
    desc: 'Vaccinations, visits, and clinical notes.',
    path: ROUTES.PET_PROFILE,
    image: PAGE_IMG.profile.health,
    featured: false,
  },
  {
    id: 'document',
    label: 'Upload document',
    desc: 'Certificates, labs, and visit summaries.',
    path: ROUTES.SCAN,
    image: PAGE_IMG.scan.docs,
    featured: false,
  },
  {
    id: 'reminder',
    label: 'Create reminder',
    desc: 'Schedule the next meaningful care moment.',
    path: `${ROUTES.REMINDERS}?create=true`,
    image: PAGE_IMG.reminders.notify,
    featured: false,
  },
] as const;

function decoderNote(
  decoderAccess: FeatureAccessResult,
  isEnterprise: boolean,
  isMonthlyQuota: boolean,
): string | null {
  if (isEnterprise || decoderAccess.usageLimit === 'unlimited') return null;
  const limit = decoderAccess.usageLimit;
  if (typeof limit !== 'number') return null;
  const remaining = Math.max(0, limit - decoderAccess.currentUsage);
  if (isMonthlyQuota) return `${remaining} scans remaining this month`;
  return `${remaining} scan${remaining === 1 ? '' : 's'} remaining`;
}

type ConciergeStripProps = {
  decoderAccess: FeatureAccessResult;
  isEnterprise: boolean;
  isMonthlyDecoderQuota: boolean;
};

export function ConciergeStrip({
  decoderAccess,
  isEnterprise,
  isMonthlyDecoderQuota,
}: ConciergeStripProps) {
  const scanNote = decoderNote(decoderAccess, isEnterprise, isMonthlyDecoderQuota);
  const featured = ACTIONS.find((a) => a.featured)!;
  const others = ACTIONS.filter((a) => !a.featured);
  const featuredLocked = featured.isDecoder && !decoderAccess.isAllowed;

  return (
    <section className={styles.chapterConcierge} aria-labelledby="chapter-concierge">
      <div className={styles.chapterInner}>
        <header className={styles.chapterHeader}>
          <p className={styles.sectionEyebrowGold}>Concierge</p>
          <h2 id="chapter-concierge" className={styles.chapterTitle}>
            What would you like to do next?
          </h2>
        </header>

        <div className={styles.conciergeLayout}>
          <Link
            to={featuredLocked ? `${ROUTES.PRICING}?plan=pro` : featured.path}
            className={`${styles.conciergeFeatured} ${featuredLocked ? styles.conciergeLocked : ''}`}
          >
            <img src={featured.image} alt="" className={styles.conciergeFeaturedImg} aria-hidden />
            <div className={styles.conciergeFeaturedBody}>
              <span className={styles.conciergeFeaturedLabel}>{featured.label}</span>
              <p className={styles.conciergeFeaturedDesc}>{featured.desc}</p>
              {scanNote && <span className={styles.conciergeNote}>{scanNote}</span>}
            </div>
          </Link>

          <div className={styles.conciergeList}>
            {others.map((action) => (
              <Link key={action.id} to={action.path} className={styles.conciergeItem}>
                <img src={action.image} alt="" className={styles.conciergeItemImg} aria-hidden />
                <div>
                  <span className={styles.conciergeItemLabel}>{action.label}</span>
                  <p className={styles.conciergeItemDesc}>{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
