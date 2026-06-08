import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, EmptyState, LoadingState } from '@/components/ui';
import { EmptyFallback } from '@/components/errors/EmptyFallback';
import { useAuth } from '@/auth/AuthProvider';
import { isSupabaseConfigured } from '@/services/supabase/config';
import { ReferralCard } from './ReferralCard';
import { ReferralLeaderboard } from './ReferralLeaderboard';
import { ReferralRewards } from './ReferralRewards';
import { ShareReferralModal } from './ShareReferralModal';
import { ReferralInviteForm } from './ReferralInviteForm';
import {
  SocialShareCard,
  ReferralMilestones,
  CommunityGrowthStats,
  UpcomingFeaturesTeaser,
  PartnershipsPlaceholder,
} from '@/components/growth';
import { WaitlistForm } from '@/components/waitlist';
import { ReferralProgressCard } from './ReferralProgressCard';
import { useGrowth } from '@/growth';
import styles from './ReferralDashboard.module.css';

export function ReferralDashboard() {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const autoProvisionStarted = useRef(false);
  const {
    member,
    isLoading,
    referralUrl,
    nextReward,
    earnedRewards,
    milestoneProgress,
    leaderboard,
    leaderboardPeriod,
    setLeaderboardPeriod,
    trackShare,
    joinWaitlist,
    refresh,
    pendingReferral,
    setPendingReferral,
    error,
  } = useGrowth();

  const [shareOpen, setShareOpen] = useState(false);
  const useSupabase = isSupabaseConfigured();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setPendingReferral(ref);
  }, [searchParams, setPendingReferral]);

  useEffect(() => {
    if (!isAuthenticated || !user?.email || member || isLoading || autoProvisionStarted.current) {
      return;
    }
    autoProvisionStarted.current = true;
    void joinWaitlist({ name: user.name, email: user.email }).catch(() => {
      autoProvisionStarted.current = false;
    });
  }, [isAuthenticated, user, member, isLoading, joinWaitlist]);

  if (isLoading || (isAuthenticated && !member && !error)) {
    return (
      <div className={styles.stateWrap}>
        <LoadingState message="Loading your referral dashboard" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.stateWrap}>
        <EmptyFallback
          title="Couldn't load referrals"
          message={error}
          onRetry={() => void refresh()}
        />
      </div>
    );
  }

  if (!member || !referralUrl) {
    if (useSupabase && isAuthenticated) {
      return (
        <div className={styles.stateWrap}>
          <EmptyState
            title="Setting up your referral link"
            description="If this takes more than a moment, retry or check that referral edge functions are deployed."
            action={
              <Button variant="primary" size="md" onClick={() => void refresh()}>
                Retry
              </Button>
            }
          />
        </div>
      );
    }

    return (
      <div className={styles.stateWrap}>
        <EmptyState
          title="Get your referral link"
          description="Share PetClues with fellow pet parents and unlock rewards as friends sign up."
          action={
            <WaitlistForm
              onSubmit={async (input) => {
                await joinWaitlist(input);
              }}
              pendingReferral={pendingReferral}
            />
          }
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Referral dashboard</h1>
        <p className={styles.subtitle}>
          Share PetClues with people who&apos;d genuinely love it - friends who sign up count toward
          your rewards.
        </p>
      </header>

      <ReferralProgressCard
        member={member}
        nextReward={nextReward}
        milestoneProgress={milestoneProgress}
      />

      <div className={styles.grid}>
        <div className={styles.main}>
          <ReferralCard
            member={member}
            referralUrl={referralUrl}
            onShare={() => setShareOpen(true)}
          />
          {useSupabase && <ReferralInviteForm />}
          <SocialShareCard
            referralUrl={referralUrl}
            onShare={() => setShareOpen(true)}
          />
          <ReferralMilestones
            referralCount={member.referralCount}
            nextReward={nextReward}
            milestoneProgress={milestoneProgress}
          />
        </div>

        <div className={styles.side}>
          <ReferralRewards
            earnedRewards={earnedRewards}
            referralCount={member.referralCount}
          />
          <ReferralLeaderboard
            entries={leaderboard}
            period={leaderboardPeriod}
            onPeriodChange={setLeaderboardPeriod}
          />
        </div>
      </div>

      <CommunityGrowthStats />
      <UpcomingFeaturesTeaser />
      <PartnershipsPlaceholder />

      <ShareReferralModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        member={member}
        referralUrl={referralUrl}
        onShare={trackShare}
      />
    </div>
  );
}
