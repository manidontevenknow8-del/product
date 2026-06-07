import { useGrowth } from '@/growth';
import styles from './CommunityGrowthStats.module.css';

export function CommunityGrowthStats() {
  const { communityStats } = useGrowth();

  if (!communityStats || communityStats.waitlistTotal === 0) return null;

  const stats = [
    {
      value: communityStats.waitlistTotal.toLocaleString(),
      label: 'Pet parents joined',
    },
    {
      value: communityStats.referralsThisWeek.toLocaleString(),
      label: 'Referrals this week',
    },
    {
      value: communityStats.spotsClaimedToday.toLocaleString(),
      label: 'Joined today',
    },
    {
      value: String(communityStats.countriesRepresented),
      label: 'Countries',
    },
  ];

  return (
    <section className={styles.section} aria-label="Community growth">
      <h2 className={styles.title}>Community momentum</h2>
      <div className={styles.grid}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <span className={styles.value}>{stat.value}</span>
            <span className={styles.label}>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
