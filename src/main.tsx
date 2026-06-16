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
import { DailyCheckInProvider } from '@/dailyCheckIn';
import { PetCareScoreProvider } from '@/petCareScore';
import { SettingsProvider } from '@/settings';
import { AnalyticsProvider } from '@/analytics';
import { SEOProvider } from '@/seo';
import { ErrorBoundary } from '@/components/errors';
import { App } from './App';
import '@/styles/global.css';

initPostHog();

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker is a performance enhancement only.
    });
  });
}

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
                      <PetCareScoreProvider>
                        <DailyCheckInProvider>
                          <SettingsProvider>
                            <AnalyticsProvider>
                              <SEOProvider>
                                <App />
                              </SEOProvider>
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
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
);
