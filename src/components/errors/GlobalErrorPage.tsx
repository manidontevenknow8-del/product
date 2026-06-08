import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ROUTES } from '@/routes/paths';
import styles from './GlobalErrorPage.module.css';

type GlobalErrorPageProps = {
  error?: Error | null;
  onRetry?: () => void;
  title?: string;
  message?: string;
};

export function GlobalErrorPage({
  error,
  onRetry,
  title = 'Something unexpected happened',
  message = 'We hit a small bump. Your data is safe - try refreshing or return to the dashboard.',
}: GlobalErrorPageProps) {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon} aria-hidden="true">
          <div className={styles.iconInner} />
        </div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          {onRetry && (
            <Button variant="primary" onClick={onRetry}>
              Try again
            </Button>
          )}
          <Link to={ROUTES.DASHBOARD}>
            <Button variant="secondary">Go to dashboard</Button>
          </Link>
          <a href="mailto:hello@petclues.com?subject=PetClues%20issue%20report">
            <Button variant="ghost" size="sm">
              Report this issue
            </Button>
          </a>
        </div>
        {import.meta.env.DEV && error && (
          <pre className={styles.devError}>{error.message}</pre>
        )}
      </div>
    </div>
  );
}
