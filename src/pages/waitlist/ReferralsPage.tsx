import { AppLayout } from '@/layouts/AppLayout';
import { PageHeroBand } from '@/components/visual';
import { PAGE_IMG } from '@/data/pageImages';
import { ReferralDashboard } from '@/components/referral';
import styles from './ReferralsPage.module.css';

export function ReferralsPage() {
  return (
    <AppLayout flushContent>
      <div className={styles.page}>
        <PageHeroBand
          compact
          image={PAGE_IMG.app.referrals}
          imageAlt=""
          eyebrow="Community"
          title="Referrals"
          subtitle="Share PetClues with fellow pet parents and unlock rewards as friends sign up."
        />

        <div className={styles.body}>
          <ReferralDashboard />
        </div>
      </div>
    </AppLayout>
  );
}
