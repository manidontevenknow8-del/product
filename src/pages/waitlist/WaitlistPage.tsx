import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { PageContainer, Badge } from '@/components/ui';
import {
  WaitlistForm,
  WaitlistSuccess,
} from '@/components/waitlist';
import {
  LaunchCountdown,
  CommunityGrowthStats,
  UpcomingFeaturesTeaser,
} from '@/components/growth';
import { ShareReferralModal } from '@/components/referral';
import { useGrowth } from '@/growth';
import { useAnalytics } from '@/analytics';
import styles from './WaitlistPage.module.css';

export function WaitlistPage() {
  const [searchParams] = useSearchParams();
  const {
    member,
    isOnWaitlist,
    joinWaitlist,
    pendingReferral,
    setPendingReferral,
    referralUrl,
    trackShare,
  } = useGrowth();
  const { track } = useAnalytics();

  const [shareOpen, setShareOpen] = useState(false);
  const [justJoined, setJustJoined] = useState(false);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setPendingReferral(ref);
  }, [searchParams, setPendingReferral]);

  const handleJoin = async (input: { name: string; email: string }) => {
    await joinWaitlist(input);
    track('waitlist_joined', { hasReferral: !!pendingReferral });
    setJustJoined(true);
  };

  const showSuccess = isOnWaitlist && (justJoined || member);

  return (
    <PublicLayout>
      <PageContainer size="full" className={styles.page}>
        <div className={styles.hero}>
          <Badge variant="accent" className={styles.eyebrow}>
            Early access
          </Badge>
          <h1 className={styles.title}>Join the PetClues waitlist</h1>
          <p className={styles.subtitle}>
            Be among the first to experience calm, intelligent pet care.
            Invite friends to move up and unlock founding member rewards.
          </p>
        </div>

        <div className={styles.extras}>
          <LaunchCountdown />
        </div>

        <div className={styles.content}>
          {showSuccess && member ? (
            <WaitlistSuccess
              member={member}
              onShare={() => setShareOpen(true)}
            />
          ) : (
            <WaitlistForm
              onSubmit={handleJoin}
              pendingReferral={pendingReferral}
            />
          )}
        </div>

        <div className={styles.extras}>
          <CommunityGrowthStats />
          <UpcomingFeaturesTeaser />
        </div>
      </PageContainer>

      {member && referralUrl && (
        <ShareReferralModal
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          member={member}
          referralUrl={referralUrl}
          onShare={(channel) => {
            trackShare(channel);
            track('referral_shared', { channel });
          }}
        />
      )}
    </PublicLayout>
  );
}
