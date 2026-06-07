import { REFERRAL_REWARDS } from '@/data/growthData';
import type { ReferralReward } from '@/types/growth';
import styles from './ReferralRewards.module.css';

type ReferralRewardsProps = {
  earnedRewards: ReferralReward[];
  referralCount: number;
};

export function ReferralRewards({ earnedRewards, referralCount }: ReferralRewardsProps) {
  const earnedIds = new Set(earnedRewards.map((r) => r.id));

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Referral rewards</h2>
      <p className={styles.subtitle}>
        Unlock exclusive perks as you help grow the PetClues community.
      </p>

      <div className={styles.list}>
        {REFERRAL_REWARDS.map((reward) => {
          const earned = earnedIds.has(reward.id);
          return (
            <div
              key={reward.id}
              className={`${styles.reward} ${earned ? styles.earned : styles.locked}`}
            >
              <div className={styles.icon}>{earned ? '✓' : '○'}</div>
              <div className={styles.content}>
                <h3 className={styles.rewardTitle}>{reward.title}</h3>
                <p className={styles.rewardDesc}>{reward.description}</p>
              </div>
              <span className={styles.meta}>
                {earned ? 'Unlocked' : `${reward.referralsRequired} refs`}
              </span>
            </div>
          );
        })}
      </div>

      {referralCount === 0 && (
        <p className={styles.subtitle} style={{ marginTop: 'var(--space-4)', marginBottom: 0 }}>
          Share your link to start unlocking rewards.
        </p>
      )}
    </section>
  );
}
