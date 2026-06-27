import type { Milestone } from '@/types/timeline';
import { TimelineEventMedia } from './TimelineEventMedia';
import styles from './MilestoneCard.module.css';

type MilestoneCardProps = {
  milestone: Milestone;
  petInitial?: string;
};

function MilestoneIcon({ eventType }: { eventType: Milestone['eventType'] }) {
  if (eventType === 'weight_milestone') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3v18M8 7h8M9 11h6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    );
  }
  if (eventType === 'adoption') {
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 11 12 4l8 7v9H4v-9Z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}

export function MilestoneCard({ milestone, petInitial = 'P' }: MilestoneCardProps) {
  const hasMedia = Boolean(milestone.imageUrl || milestone.thumbnailDocumentId);
  const initial = petInitial.charAt(0).toUpperCase();

  return (
    <article className={styles.card} data-event-type={milestone.eventType}>
      <div className={styles.mediaArea}>
        {!hasMedia && (
          <>
            <span className={styles.ghostLetter} aria-hidden>
              {initial}
            </span>
            <div className={styles.iconWrap}>
              <MilestoneIcon eventType={milestone.eventType} />
            </div>
          </>
        )}
        {hasMedia && (
          <TimelineEventMedia
            imageUrl={milestone.imageUrl}
            thumbnailDocumentId={milestone.thumbnailDocumentId}
            alt={milestone.title}
            variant="milestone"
          />
        )}
      </div>

      <div className={styles.body}>
        <time className={styles.date}>{milestone.date}</time>
        <h3 className={styles.title}>{milestone.title}</h3>
        <p className={styles.description}>{milestone.description}</p>
      </div>
    </article>
  );
}
