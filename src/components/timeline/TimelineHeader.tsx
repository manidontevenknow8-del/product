import { Button } from '@/components/ui';
import { getAvatarInitials } from '@/services/pets/petUtils';
import type { TimelineStats } from '@/types/timeline';
import styles from './TimelineHeader.module.css';

type TimelineHeaderProps = {
  petName: string;
  petPhotoUrl?: string | null;
  petBreed?: string | null;
  stats: TimelineStats;
  onAddEvent?: () => void;
};

export function TimelineHeader({
  petName,
  petPhotoUrl,
  petBreed,
  stats,
  onAddEvent,
}: TimelineHeaderProps) {
  const initials = getAvatarInitials(petName);
  const subtitle = petBreed
    ? `${petBreed} · ${stats.totalMoments} moments · ${stats.daysRemembered} days remembered`
    : `${stats.totalMoments} moments captured across ${stats.daysRemembered} days`;

  const statItems = [
    { value: stats.totalMoments, label: 'Moments' },
    { value: stats.milestones, label: 'Milestones' },
    { value: stats.documents, label: 'Documents' },
    { value: stats.daysRemembered, label: 'Days' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.hero}>
        <div className={styles.heroBackdrop} aria-hidden="true">
          {petPhotoUrl ? (
            <img src={petPhotoUrl} alt="" className={styles.heroBackdropImage} />
          ) : (
            <div className={styles.heroBackdropFallback} />
          )}
        </div>

        <div className={styles.heroContent}>
          <div className={styles.identity}>
            <div className={styles.avatarWrap}>
              {petPhotoUrl ? (
                <img src={petPhotoUrl} alt={petName} className={styles.avatarPhoto} />
              ) : (
                <span className={styles.avatarInitials}>{initials}</span>
              )}
            </div>
            <div className={styles.identityText}>
              <span className={styles.eyebrow}>Pet life story</span>
              <h1 className={styles.title}>{petName}&apos;s timeline</h1>
              <p className={styles.subtitle}>{subtitle}</p>
            </div>
          </div>

          <Button variant="secondary" size="sm" onClick={onAddEvent} className={styles.addBtn}>
            Add moment
          </Button>
        </div>
      </div>

      <div className={styles.stats}>
        {statItems.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>
    </header>
  );
}
