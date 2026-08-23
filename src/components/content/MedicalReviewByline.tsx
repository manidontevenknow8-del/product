import { Link } from 'react-router-dom';
import {
  getPrimaryMedicalReviewer,
  MEDICAL_CONTENT_LAST_REVIEWED,
  MEDICAL_DISCLAIMER_SHORT,
} from '@/data/editorialBoard';
import styles from './MedicalReviewByline.module.css';

export type MedicalReviewBylineProps = {
  showReviewer?: boolean;
  lastReviewed?: string;
  variant?: 'health' | 'general';
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function MedicalReviewByline({
  showReviewer = true,
  lastReviewed = MEDICAL_CONTENT_LAST_REVIEWED,
  variant = 'health',
}: MedicalReviewBylineProps) {
  const reviewer = getPrimaryMedicalReviewer();

  return (
    <aside className={styles.byline} aria-label="Editorial review information">
      <div className={styles.meta}>
        {showReviewer ? (
          <>
            <span className={styles.label}>Editorial review</span>
            <span className={styles.separator} aria-hidden>·</span>
          </>
        ) : null}
        <span>Updated {formatDate(lastReviewed)}</span>
        <span className={styles.separator} aria-hidden>·</span>
        <Link to="/about#editorial-standards" className={styles.link}>
          {reviewer.name}
        </Link>
      </div>
      <p className={styles.disclaimer}>
        {variant === 'health'
          ? 'Not a substitute for veterinary care. ' + MEDICAL_DISCLAIMER_SHORT
          : MEDICAL_DISCLAIMER_SHORT}
      </p>
    </aside>
  );
}
