import { Button } from '@/components/ui';
import type { DashboardReminder } from '@/types/dashboard';
import styles from './NextReminderCard.module.css';

type NextReminderCardProps = {
  reminder: DashboardReminder;
  onAction?: () => void;
};

export function NextReminderCard({ reminder, onAction }: NextReminderCardProps) {
  return (
    <article className={`${styles.card} ${styles.accent}`}>
      <span className={styles.label}>Next due</span>
      <h2 className={styles.title}>{reminder.title}</h2>
      <p className={styles.due}>
        <span className={styles.dueDate}>{reminder.dueLabel}</span>
        <span>· {reminder.dueDate}</span>
      </p>
      <div className={styles.footer}>
        <span className={styles.category}>{reminder.category}</span>
        <Button variant="secondary" size="sm" onClick={onAction}>
          Mark done
        </Button>
      </div>
    </article>
  );
}
