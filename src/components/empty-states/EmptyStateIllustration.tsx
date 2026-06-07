import styles from './EmptyStateIllustration.module.css';

export type EmptyStateVariant =
  | 'dashboard'
  | 'timeline'
  | 'reminders'
  | 'documents'
  | 'notifications';

type EmptyStateIllustrationProps = {
  variant: EmptyStateVariant;
  compact?: boolean;
};

const iconClass: Record<EmptyStateVariant, string> = {
  dashboard: styles.iconDashboard,
  timeline: styles.iconTimeline,
  reminders: styles.iconReminders,
  documents: styles.iconDocuments,
  notifications: styles.iconNotifications,
};

export function EmptyStateIllustration({
  variant,
  compact = false,
}: EmptyStateIllustrationProps) {
  return (
    <div
      className={`${styles.emptyStateIllustration} ${styles[variant]} ${compact ? styles.compact : ''}`}
      aria-hidden="true"
    >
      <span className={iconClass[variant]} />
    </div>
  );
}
