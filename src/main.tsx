import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { initPostHog } from '@/analytics/posthog';
import { AuthProvider } from '@/auth';
import { PetProvider } from '@/pets';
import { DocumentProvider } from '@/documents';
import { HealthRecordProvider } from '@/healthRecords';
import { SubscriptionProvider } from '@/subscription';
import { ReminderProvider } from '@/reminders';
import { GrowthProvider } from '@/growth';
import { LostPetProvider } from '@/lostPet';
import { AgeTranslatorProvider } from '@/ageTranslator';
import { DailyCheckInProvider } from '@/dailyCheckIn';
import { PetCareScoreProvider } from '@/petCareScore';
import { SettingsProvider } from '@/settings';
import { NotificationProvider } from '@/notifications';
import { FamilySharingProvider } from '@/familySharing';
import { AnalyticsProvider } from '@/analytics';
import { SEOProvider } from '@/seo';
import { ErrorBoundary } from '@/components/errors';
import { App } from './App';
import '@/styles/global.css';

initPostHog();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <SubscriptionProvider>
            <PetProvider>
            <DocumentProvider>
              <ReminderProvider>
                <HealthRecordProvider>
                <GrowthProvider>
                  <LostPetProvider>
                    <AgeTranslatorProvider>
                      <PetCareScoreProvider>
                        <DailyCheckInProvider>
                        <SettingsProvider>
                          <NotificationProvider>
                            <FamilySharingProvider>
                              <AnalyticsProvider>
                                <SEOProvider>
                                  <App />
                                </SEOProvider>
                              </AnalyticsProvider>
                            </FamilySharingProvider>
                          </NotificationProvider>
                        </SettingsProvider>
                        </DailyCheckInProvider>
                      </PetCareScoreProvider>
                    </AgeTranslatorProvider>
                  </LostPetProvider>
                </GrowthProvider>
                </HealthRecordProvider>
              </ReminderProvider>
            </DocumentProvider>
            </PetProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
);
