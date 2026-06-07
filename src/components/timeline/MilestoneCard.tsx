import type { Milestone } from '@/types/timeline';
import { TimelineEventMedia } from './TimelineEventMedia';
import styles from './MilestoneCard.module.css';

type MilestoneCardProps = {
  milestone: Milestone;
};

export function MilestoneCard({ milestone }: MilestoneCardProps) {
  const hasMedia = Boolean(milestone.imageUrl || milestone.thumbnailDocumentId);

  return (
    <article className={styles.card} data-event-type={milestone.eventType}>
      {hasMedia ? (
        <TimelineEventMedia
          imageUrl={milestone.imageUrl}
          thumbnailDocumentId={milestone.thumbnailDocumentId}
          alt={milestone.title}
          variant="milestone"
        />
      ) : (
        <div className={styles.icon} aria-hidden="true">
          <span className={styles.iconInner} />
        </div>
      )}

      <time className={styles.date}>{milestone.date}</time>
      <h3 className={styles.title}>{milestone.title}</h3>
      <p className={styles.description}>{milestone.description}</p>
    </article>
  );
}
