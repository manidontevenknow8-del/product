import type { WaitlistMember } from '@/types/growth';
import type { ReferralReward } from '@/types/growth';
import styles from './WaitlistPositionCard.module.css';

type WaitlistPositionCardProps = {
  member: WaitlistMember;
  nextReward: ReferralReward | null;
  milestoneProgress: number;
  spotsPerReferral?: number;
};

export function WaitlistPositionCard({
  member,
  nextReward,
  milestoneProgress,
  spotsPerReferral = 5,
}: WaitlistPositionCardProps) {
  const spotsMoved = member.initialPosition - member.position;

  return (
    <article className={styles.card}>
      <span className={styles.eyebrow}>Your waitlist position</span>
      <div className={styles.position}>#{member.position.toLocaleString()}</div>
      <p className={styles.positionLabel}>
        {spotsMoved > 0
          ? `You've moved up ${spotsMoved} spots through referrals`
          : 'Invite friends to move up the list'}
      </p>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{member.referralCount}</span>
          <span className={styles.statLabel}>Referrals</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{spotsMoved}</span>
          <span className={styles.statLabel}>Spots gained</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{spotsPerReferral}</span>
          <span className={styles.statLabel}>Spots per invite</span>
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
