import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

type EmptyStateProps = {
  title: string;
  description?: string;
  hint?: string;
  icon?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({ title, description, hint, icon, action }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      {icon ?? (
        <div className={styles.icon} aria-hidden="true">
          <div className={styles.iconInner} />
        </div>
      )}
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
      {hint && <span className={styles.hint}>{hint}</span>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
