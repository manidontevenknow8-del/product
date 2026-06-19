import type { ReactNode } from 'react';
import { AuthProvider } from '@/auth';
import { PetProvider } from '@/pets';
import { DocumentProvider } from '@/documents';
import { HealthRecordProvider } from '@/healthRecords';
import { SubscriptionProvider } from '@/subscription';
import { ReminderProvider } from '@/reminders';
import { GrowthProvider } from '@/growth';
import { DailyCheckInProvider } from '@/dailyCheckIn';
import { PetCareScoreProvider } from '@/petCareScore';
import { SettingsProvider } from '@/settings';
import { AnalyticsProvider } from '@/analytics';
import { SEOProvider } from '@/seo';

type FullProvidersProps = {
  children: ReactNode;
};

/** App-wide providers for authenticated and deep marketing routes. */
export function FullProviders({ children }: FullProvidersProps) {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <PetProvider>
          <DocumentProvider>
            <ReminderProvider>
              <HealthRecordProvider>
                <GrowthProvider>
                  <PetCareScoreProvider>
                    <DailyCheckInProvider>
                      <SettingsProvider>
                        <AnalyticsProvider>
                          <SEOProvider>{children}</SEOProvider>
                        </AnalyticsProvider>
                      </SettingsProvider>
                    </DailyCheckInProvider>
                  </PetCareScoreProvider>
                </GrowthProvider>
              </HealthRecordProvider>
            </ReminderProvider>
          </DocumentProvider>
        </PetProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}
