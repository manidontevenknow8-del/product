import { EmptyRemindersState } from '@/components/empty-states';
import type { ComponentProps } from 'react';
import styles from './ReminderEmptyState.module.css';

type ReminderEmptyStateProps = ComponentProps<typeof EmptyRemindersState>;

/** @deprecated Use EmptyRemindersState from @/components/empty-states */
export function ReminderEmptyState(props: ReminderEmptyStateProps) {
  return (
    <div className={styles.wrap}>
      <EmptyRemindersState {...props} />
    </div>
  );
}
