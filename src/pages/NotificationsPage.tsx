import { AppLayout } from '@/layouts/AppLayout';
import { PageContainer, SectionHeader } from '@/components/ui';
import {
  NotificationHistory,
  NotificationPreferences,
} from '@/components/notifications';
import styles from './NotificationsPage.module.css';

export function NotificationsPage() {
  return (
    <AppLayout>
      <PageContainer size="xl" className={styles.page}>
        <SectionHeader
          title="Notifications"
          subtitle="Stay gently updated on your pet's care - nothing overwhelming."
        />

        <div className={styles.grid}>
          <NotificationHistory />
          <NotificationPreferences />
        </div>
      </PageContainer>
    </AppLayout>
  );
}
