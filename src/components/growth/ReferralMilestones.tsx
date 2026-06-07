import type { ReferralReward } from '@/types/growth';
import styles from './ReferralMilestones.module.css';

type ReferralMilestonesProps = {
  referralCount: number;
  nextReward: ReferralReward | null;
  milestoneProgress: number;
};

export function ReferralMilestones({
  referralCount,
  nextReward,
  milestoneProgress,
}: ReferralMilestonesProps) {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <span>Referral milestones</span>
        <span>{referralCount} referrals</span>
      </div>

      {nextReward ? (
        <>
          <h3 className={styles.title}>Next reward: {nextReward.title}</h3>
          <div className={styles.bar}>
            <div className={styles.fill} style={{ width: `${milestoneProgress}%` }} />
          </div>
          <p className={styles.next}>
            {nextReward.referralsRequired - referralCount} more referral
            {nextReward.referralsRequired - referralCount === 1 ? '' : 's'} to unlock
          </p>
        </>
      ) : (
        <>
          <h3 className={styles.title}>All milestones unlocked</h3>
          <div className={styles.bar}>
            <div className={styles.fill} style={{ width: '100%' }} />
          </div>
          <p className={styles.next}>You&apos;ve earned every founding reward.</p>
        </>
      )}
    </article>
  );
}
