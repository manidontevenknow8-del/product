import { Link } from 'react-router-dom';
import { eventTypeLabels, type TimelineEventItem } from '@/types/timeline';
import { ROUTES } from '@/routes/paths';
import { TimelineEventMedia } from './TimelineEventMedia';
import styles from './TimelineEventCard.module.css';

type TimelineEventCardProps = {
  event: TimelineEventItem;
  featured?: boolean;
};

function eventHref(event: TimelineEventItem): string | null {
  switch (event.sourceKind) {
    case 'document':
      return ROUTES.SCAN;
    case 'health_record':
      return ROUTES.PET_PROFILE;
    case 'reminder':
      return ROUTES.REMINDERS;
    case 'profile':
      return ROUTES.PET_PROFILE;
    default:
      return null;
  }
}

export function TimelineEventCard({ event, featured = false }: TimelineEventCardProps) {
  const href = eventHref(event);
  const showMedia = Boolean(event.imageUrl || event.thumbnailDocumentId);
  const isHighlight = featured || event.type === 'adoption';

  const card = (
    <article
      className={`${styles.card} ${isHighlight ? styles.cardHighlight : ''}`}
      data-event-type={event.type}
    >
      <div className={styles.accent} aria-hidden="true" />

      <div className={styles.body}>
        <div className={styles.header}>
          <div className={styles.typeGroup}>
            <span className={styles.type}>{eventTypeLabels[event.type]}</span>
            {event.meta && <span className={styles.meta}>{event.meta}</span>}
          </div>
          <time className={styles.date} dateTime={event.date}>
            {event.displayDate}
          </time>
        </div>

        <h3 className={styles.title}>{event.title}</h3>
        <p className={styles.description}>{event.description}</p>

        {showMedia && (
          <TimelineEventMedia
            imageUrl={event.imageUrl}
            thumbnailDocumentId={event.thumbnailDocumentId}
            alt={event.title}
            variant={isHighlight ? 'hero' : 'card'}
          />
        )}

        {event.hasAttachment && event.attachmentName && (
          <div className={styles.footer}>
            <span className={styles.attachment}>
              <span className={styles.attachmentIcon} aria-hidden="true" />
              {event.attachmentName}
            </span>
          </div>
        )}
      </div>
    </article>
  );

  if (href) {
    return (
      <Link to={href} className={styles.cardLink}>
        {card}
      </Link>
    );
  }

  return card;
}
