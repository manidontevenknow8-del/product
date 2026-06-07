import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { LoadingState } from '@/components/ui';
import { PageHeroBand } from '@/components/visual';
import { PAGE_IMG } from '@/data/pageImages';
import {
  SettingsNav,
  AccountSettingsCard,
  NotificationSettingsCard,
  PrivacySettingsCard,
  SecuritySettingsCard,
} from '@/components/settings';
import { useSettings } from '@/settings';
import type { SettingsSection } from '@/types/settings';
import styles from './SettingsPage.module.css';

const VALID_SECTIONS: SettingsSection[] = [
  'account',
  'notifications',
  'privacy',
  'security',
];

function parseSection(value: string | null): SettingsSection {
  if (value && VALID_SECTIONS.includes(value as SettingsSection)) {
    return value as SettingsSection;
  }
  return 'account';
}

export function SettingsPage() {
  const { isLoading } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const [section, setSection] = useState<SettingsSection>(() =>
    parseSection(searchParams.get('section')),
  );

  useEffect(() => {
    setSection(parseSection(searchParams.get('section')));
  }, [searchParams]);

  const handleSectionChange = (next: SettingsSection) => {
    setSection(next);
    setSearchParams({ section: next }, { replace: true });
  };

  if (isLoading) {
    return (
      <AppLayout flushContent>
        <div className={styles.page}>
          <div className={styles.loadingWrap}>
            <LoadingState message="Loading settings" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout flushContent>
      <div className={styles.page}>
        <PageHeroBand
          compact
          image={PAGE_IMG.app.settings}
          imageAlt=""
          eyebrow="Account"
          title="Settings"
          subtitle="Manage your account, notifications, privacy, and security."
        />

        <div className={styles.body}>
          <div className={styles.layout}>
            <SettingsNav active={section} onChange={handleSectionChange} />
            <div className={styles.content}>
              {section === 'account' && <AccountSettingsCard />}
              {section === 'notifications' && <NotificationSettingsCard />}
              {section === 'privacy' && <PrivacySettingsCard />}
              {section === 'security' && <SecuritySettingsCard />}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
