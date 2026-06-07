import { useEffect, useState } from 'react';
import { useDocuments } from '@/documents';
import styles from './TimelineEventMedia.module.css';

type TimelineEventMediaProps = {
  imageUrl?: string;
  thumbnailDocumentId?: string;
  alt: string;
  variant?: 'card' | 'milestone' | 'hero';
};

export function TimelineEventMedia({
  imageUrl,
  thumbnailDocumentId,
  alt,
  variant = 'card',
}: TimelineEventMediaProps) {
  const { getDocumentUrl } = useDocuments();
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(imageUrl ?? null);
  const [loading, setLoading] = useState(Boolean(thumbnailDocumentId && !imageUrl));

  useEffect(() => {
    if (imageUrl) {
      setResolvedUrl(imageUrl);
      setLoading(false);
      return;
    }

    if (!thumbnailDocumentId) {
      setResolvedUrl(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getDocumentUrl(thumbnailDocumentId)
      .then((url) => {
        if (!cancelled) setResolvedUrl(url);
      })
      .catch(() => {
        if (!cancelled) setResolvedUrl(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [imageUrl, thumbnailDocumentId, getDocumentUrl]);

  if (!resolvedUrl && !loading && !thumbnailDocumentId && !imageUrl) {
    return null;
  }

  return (
    <div className={`${styles.media} ${styles[variant]}`}>
      {loading && <div className={styles.shimmer} aria-hidden="true" />}
      {resolvedUrl ? (
        <img src={resolvedUrl} alt={alt} className={styles.image} loading="lazy" />
      ) : (
        !loading && <div className={styles.fallback} aria-hidden="true" />
      )}
    </div>
  );
}
