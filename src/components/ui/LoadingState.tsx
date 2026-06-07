import styles from './LoadingState.module.css';

type LoadingStateProps = {
  message?: string;
  fullPage?: boolean;
};

export function LoadingState({
  message = 'Loading',
  fullPage = false,
}: LoadingStateProps) {
  const content = (
    <div className={styles.loading} role="status" aria-live="polite">
      <div className={styles.spinner} aria-hidden="true">
        <span className={styles.spinnerRing} />
      </div>
      <p className={styles.message}>{message}</p>
    </div>
  );

  if (fullPage) {
    return <div className={styles.fullPage}>{content}</div>;
  }

  return content;
}
