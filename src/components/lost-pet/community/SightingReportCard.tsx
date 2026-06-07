import { Badge, Button } from '@/components/ui';
import type { Sighting } from '@/types/lostPet';
import { formatLastUpdated } from '@/utils/lostPetUtils';
import styles from './SightingReportCard.module.css';

type SightingReportCardProps = {
  sighting: Sighting;
  onMarkReviewed?: (id: string) => void;
  showActions?: boolean;
};

export function SightingReportCard({
  sighting,
  onMarkReviewed,
  showActions = true,
}: SightingReportCardProps) {
  const isNew = sighting.status === 'new';

  return (
    <article className={`${styles.card} ${isNew ? styles.new : ''}`}>
      <div className={styles.header}>
        <div>
          <p className={styles.location}>{sighting.location}</p>
          <p className={styles.meta}>
            {formatLastUpdated(sighting.reportedAt)}
            {sighting.distance && ` · ${sighting.distance} away`}
          </p>
        </div>
        {isNew && (
          <Badge variant="danger" className={styles.badge}>
            New
          </Badge>
        )}
      </div>

      {sighting.notes && <p className={styles.notes}>{sighting.notes}</p>}

      <div className={styles.footer}>
        <span className={styles.reporter}>
          Reported by {sighting.reporterName ?? 'Community member'}
        </span>
        {sighting.hasPhoto && (
          <span className={styles.photoTag}>Photo attached (demo)</span>
        )}
      </div>

      {showActions && isNew && onMarkReviewed && (
        <div className={styles.actions}>
          <Button variant="secondary" size="sm" onClick={() => onMarkReviewed(sighting.id)}>
            Mark reviewed
          </Button>
        </div>
      )}
    </article>
  );
}
