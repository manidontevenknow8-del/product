import { Link } from 'react-router-dom';
import { eventTypeLabels, type TimelineEventItem } from '@/types/timeline';
import { timelineEventHref } from '@/services/timeline/timelineEventHref';
import { TimelineEventMedia } from './TimelineEventMedia';
import styles from './TimelineEventCard.module.css';

type TimelineEventCardProps = {
  event: TimelineEventItem;
  featured?: boolean;
  petName?: string;
};

function DocumentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d="M14 2v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.25" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3v12M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M4 21h16" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function TimelineEventCard({ event, featured = false, petName = 'your pet' }: TimelineEventCardProps) {
  const href = timelineEventHref(event);
  const isDocument = event.type === 'document_uploaded';
  const isManualMoment = event.type === 'manual_moment';
  const hasMedia = Boolean(event.imageUrl || event.thumbnailDocumentId);
  const isPdfDocument = isDocument && !event.thumbnailDocumentId;
  const isHighlight =
    featured ||
    event.type === 'adoption' ||
    (isManualMoment && hasMedia) ||
    (isDocument && hasMedia);

  const card = (
    <article
      className={`${styles.card} ${isHighlight ? styles.cardHighlight : ''} ${
        isManualMoment ? styles.cardMemory : ''
      }`}
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

        {hasMedia && (
          <TimelineEventMedia
            imageUrl={event.imageUrl}
            thumbnailDocumentId={event.thumbnailDocumentId}
            alt={event.title}
            variant="card"
          />
        )}

        {isPdfDocument ? (
          <div className={styles.titleRow}>
            <div className={styles.docIcon}>
              <DocumentIcon />
            </div>
            <div>
              <h3 className={styles.title}>{event.title}</h3>
              <p className={styles.docSub}>
                PDF archived for {petName} on {event.displayDate}
              </p>
            </div>
          </div>
        ) : (
          <>
            <h3 className={styles.title}>{event.title}</h3>
            <p className={styles.description}>{event.description}</p>
          </>
        )}

        {event.hasAttachment && event.attachmentName && (
          <div className={styles.attachmentRow}>
            <span className={styles.attachmentInfo}>
              <LockIcon />
              <span className={styles.attachmentName}>{event.attachmentName}</span>
            </span>
            <span className={styles.downloadIcon}>
              <DownloadIcon />
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
