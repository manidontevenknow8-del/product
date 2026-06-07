import { Button } from '@/components/ui';
import styles from './EmptyFallback.module.css';

type EmptyFallbackProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function EmptyFallback({
  title = 'Unable to load content',
  message = 'This might be a temporary network issue. Check your connection and try again.',
  onRetry,
  retryLabel = 'Retry',
}: EmptyFallbackProps) {
  return (
    <div className={styles.fallback} role="alert">
      <div className={styles.icon} aria-hidden="true">
        <div className={styles.iconInner} />
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
