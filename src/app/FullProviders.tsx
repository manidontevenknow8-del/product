import type { ReactNode } from 'react';
import { AuthProvider } from '@/auth';
import { PetProvider } from '@/pets';
import { DocumentProvider } from '@/documents';
import { HealthRecordProvider } from '@/healthRecords';
import { SubscriptionProvider } from '@/subscription';
import { ReminderProvider } from '@/reminders';
import { GrowthProvider } from '@/growth';
import { DailyCheckInProvider } from '@/dailyCheckIn';
import { SymptomLogProvider } from '@/symptomLog';
import { PetMomentProvider } from '@/petMoments';
import { PetCareScoreProvider } from '@/petCareScore';
import { SettingsProvider } from '@/settings';
import { HouseholdProvider } from '@/household';
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
        <HouseholdProvider>
          <PetProvider>
          <DocumentProvider>
            <ReminderProvider>
              <HealthRecordProvider>
                <GrowthProvider>
                  <DailyCheckInProvider>
                    <SymptomLogProvider>
                      <PetMomentProvider>
                      <PetCareScoreProvider>
                        <SettingsProvider>
                          <AnalyticsProvider>
                            <SEOProvider>{children}</SEOProvider>
                          </AnalyticsProvider>
                        </SettingsProvider>
                      </PetCareScoreProvider>
                      </PetMomentProvider>
                    </SymptomLogProvider>
                  </DailyCheckInProvider>
                </GrowthProvider>
              </HealthRecordProvider>
            </ReminderProvider>
          </DocumentProvider>
        </PetProvider>
        </HouseholdProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}
