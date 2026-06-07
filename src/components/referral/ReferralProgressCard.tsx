import type { WaitlistMember } from '@/types/growth';
import type { ReferralReward } from '@/types/growth';
import styles from './ReferralProgressCard.module.css';

type ReferralProgressCardProps = {
  member: WaitlistMember;
  nextReward: ReferralReward | null;
  milestoneProgress: number;
};

export function ReferralProgressCard({
  member,
  nextReward,
  milestoneProgress,
}: ReferralProgressCardProps) {
  return (
    <article className={styles.card}>
      <span className={styles.eyebrow}>Your referral progress</span>
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{member.referralCount}</span>
          <span className={styles.statLabel}>Friends joined</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{member.referralCode}</span>
          <span className={styles.statLabel}>Your code</span>
        </div>
      </div>

      {nextReward && (
        <div className={styles.progress}>
          <div className={styles.progressHeader}>
            <span>Next: {nextReward.title}</span>
            <span>
              {member.referralCount}/{nextReward.referralsRequired} referrals
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${milestoneProgress}%` }}
            />
          </div>
        </div>
      )}
    </article>
  );
}
