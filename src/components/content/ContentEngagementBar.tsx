import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import type { RelatedLinkItem } from './RelatedLinks';
import styles from './ContentEngagementBar.module.css';

const DISMISS_KEY = 'petclues_engbar_dismissed';

export type ContentEngagementBarProps = {
  nextItem?: RelatedLinkItem;
  ctaText?: string;
  ctaHref?: string;
};

export function ContentEngagementBar({
  nextItem,
  ctaText = 'Save for free',
  ctaHref = ROUTES.SIGNUP,
}: ContentEngagementBarProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === '1') {
        setDismissed(true);
      }
    } catch { /* SSR or private mode */ }
  }, []);

  useEffect(() => {
    if (dismissed || !nextItem) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [dismissed, nextItem]);

  if (dismissed || !nextItem) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch { /* ignore */ }
  };

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" style={{ height: 0, overflow: 'hidden' }} />
      <div
        className={`${styles.bar} ${visible ? styles.visible : ''}`}
        role="complementary"
        aria-label="Continue exploring"
      >
        <Link to={nextItem.href} className={styles.nextLink}>
          <span className={styles.arrow} aria-hidden="true">&#8594;</span>
          <span className={styles.nextLabel}>{nextItem.label}</span>
        </Link>
        <a href={ctaHref} className={styles.ctaLink}>{ctaText}</a>
        <button
          type="button"
          className={styles.dismiss}
          onClick={handleDismiss}
          aria-label="Dismiss"
        >
          &#215;
        </button>
      </div>
    </>
  );
}
