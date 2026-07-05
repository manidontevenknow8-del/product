import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { LoadingState } from '@/components/ui';
import { PAGE_IMG } from '@/data/pageImages';
import {
  SettingsNav,
  AccountSettingsCard,
  NotificationSettingsCard,
  PrivacySettingsCard,
  SecuritySettingsCard,
} from '@/components/settings';
import { HouseholdMembersPanel } from '@/components/household';
import { FoundingBenefitsCard } from '@/components/founding';
import { useSettings } from '@/settings';
import type { SettingsSection } from '@/types/settings';
import styles from './SettingsPage.module.css';

const VALID_SECTIONS: SettingsSection[] = [
  'account',
  'household',
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
        <div className="ed-page">
          <div className={styles.loadingWrap}>
            <LoadingState message="Loading settings" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout flushContent>
      <div className="ed-page">
        <header className="ed-hero ed-hero--compact">
          <img className="ed-hero__bg" src={PAGE_IMG.app.settings} alt="" aria-hidden />
          <div className="ed-hero__wash" aria-hidden />
          <div className="ed-hero__texture" aria-hidden />
          <div className="ed-hero__inner">
            <div className="ed-hero__top" />
            <div className="ed-hero__grid">
              <div className="ed-hero__text">
                <p className="ed-hero__kicker">Account</p>
                <h1 className="ed-hero__title">Settings</h1>
                <p className="ed-hero__subtitle">
                  Manage your account, notifications, privacy, and security — all in one calm place.
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="ed-body">
          <div className={styles.layout}>
            <div className={styles.nav}>
              <SettingsNav active={section} onChange={handleSectionChange} />
            </div>
            <div className={styles.content}>
              {section === 'account' && (
                <>
                  <FoundingBenefitsCard />
                  <AccountSettingsCard />
                </>
              )}
              {section === 'household' && <HouseholdMembersPanel />}
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
