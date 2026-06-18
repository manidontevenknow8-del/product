import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { ProtectedRoute, GuestRoute } from '@/auth';
import {
  LandingPage,
  OnboardingPage,
  DashboardPage,
  PetProfilePage,
  ScanPage,
  TimelinePage,
  EmergencyPassportPage,
  PetMatchPage,
} from '@/pages';
import { RemindersPage } from '@/pages/RemindersPage';
import { InsightsPage } from '@/pages/InsightsPage';
import { VetPortalPage } from '@/pages/VetPortalPage';
import { MonthlyReportPage } from '@/pages/MonthlyReportPage';
import { MonthlyReportArchivePage } from '@/pages/MonthlyReportArchivePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { DeferredRedirect } from '@/pages/DeferredRedirect';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { AuthCallbackPage } from '@/pages/auth/AuthCallbackPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { PricingPage } from '@/pages/subscription/PricingPage';
import { BillingPage } from '@/pages/subscription/BillingPage';
import { AccountSettingsPage } from '@/pages/settings/AccountSettingsPage';
import { ProfileSettingsPage } from '@/pages/settings/ProfileSettingsPage';
import { ReferralsPage } from '@/pages/waitlist/ReferralsPage';
import { FoundingMembersPage } from '@/pages/FoundingMembersPage';
import { PrivacyPolicyPage } from '@/pages/legal/PrivacyPolicyPage';
import { TermsOfServicePage } from '@/pages/legal/TermsOfServicePage';
import { CookiePolicyPage } from '@/pages/legal/CookiePolicyPage';
import { ContactPage } from '@/pages/legal/ContactPage';
import { AboutPage } from '@/pages/legal/AboutPage';
import { SecurityPage } from '@/pages/legal/SecurityPage';
import { DataDeletionPage } from '@/pages/legal/DataDeletionPage';
import { DataExportPage } from '@/pages/legal/DataExportPage';
import { FaqHubPage } from '@/pages/faq/FaqHubPage';
import { FaqItemPage } from '@/pages/faq/FaqItemPage';
import { BlogIndexPage } from '@/pages/blog/BlogIndexPage';
import { BlogPostPage } from '@/pages/blog/BlogPostPage';
import { CompareIndexPage } from '@/pages/compare/CompareIndexPage';
import { ComparePage } from '@/pages/compare/ComparePage';
import { BestIndexPage } from '@/pages/best/BestIndexPage';
import { BestIntentPage } from '@/pages/best/BestIntentPage';
import { GuidesHubPage } from '@/pages/guides/GuidesHubPage';
import { GuidesCollectionPage } from '@/pages/guides/GuidesCollectionPage';
import { GuidesDetailPage } from '@/pages/guides/GuidesDetailPage';
import { LearnIndexPage } from '@/pages/learn/LearnIndexPage';
import { LearnArticlePage } from '@/pages/learn/LearnArticlePage';

export function App() {
  return (
    <Routes>
      {/* Public - V1 acquisition */}
      <Route path={ROUTES.LANDING} element={<LandingPage />} />
      <Route path={ROUTES.PRICING} element={<PricingPage />} />
      <Route path={ROUTES.PET_MATCH} element={<PetMatchPage />} />
      <Route path={ROUTES.BLOG} element={<BlogIndexPage />} />
      <Route path={`${ROUTES.BLOG}/:slug`} element={<BlogPostPage />} />
      <Route path={ROUTES.COMPARE} element={<CompareIndexPage />} />
      <Route path={`${ROUTES.COMPARE}/:slug`} element={<ComparePage />} />
      <Route path={ROUTES.BEST} element={<BestIndexPage />} />
      <Route path={`${ROUTES.BEST}/:slug`} element={<BestIntentPage />} />
      <Route path={ROUTES.GUIDES} element={<GuidesHubPage />} />
      <Route path={`${ROUTES.GUIDES}/:collection`} element={<GuidesCollectionPage />} />
      <Route path={`${ROUTES.GUIDES}/:collection/:slug`} element={<GuidesDetailPage />} />
      <Route path={ROUTES.LEARN} element={<LearnIndexPage />} />
      <Route path={`${ROUTES.LEARN}/:slug`} element={<LearnArticlePage />} />
      <Route path={ROUTES.REFERRALS} element={<ProtectedRoute><ReferralsPage /></ProtectedRoute>} />
      <Route path={ROUTES.PRIVACY} element={<PrivacyPolicyPage />} />
      <Route path={ROUTES.TERMS} element={<TermsOfServicePage />} />
      <Route path={ROUTES.COOKIES} element={<CookiePolicyPage />} />
      <Route path={ROUTES.CONTACT} element={<ContactPage />} />
      <Route path={ROUTES.ABOUT} element={<AboutPage />} />
      <Route path={ROUTES.SECURITY} element={<SecurityPage />} />
      <Route path={ROUTES.DATA_DELETION} element={<DataDeletionPage />} />
      <Route path={ROUTES.DATA_EXPORT} element={<DataExportPage />} />
      <Route path={ROUTES.FAQ} element={<FaqHubPage />} />
      <Route path={`${ROUTES.FAQ}/:slug`} element={<FaqItemPage />} />

      {/* Deferred public routes → landing */}
      <Route path={ROUTES.FOUNDING_MEMBERS} element={<FoundingMembersPage />} />
      <Route path={ROUTES.WAITLIST} element={<DeferredRedirect to={ROUTES.SIGNUP} />} />
      <Route path={ROUTES.LOST_PET_REPORT} element={<DeferredRedirect to={ROUTES.LANDING} />} />

      {/* Auth */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.SIGNUP} element={<GuestRoute><SignupPage /></GuestRoute>} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
      <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
      <Route path={ROUTES.AUTH_CALLBACK} element={<AuthCallbackPage />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />

      {/* Protected - V1 core */}
      <Route path={ROUTES.ONBOARDING} element={<ProtectedRoute requireOnboardingComplete={false}><OnboardingPage /></ProtectedRoute>} />
      <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path={ROUTES.PET_PROFILE} element={<ProtectedRoute><PetProfilePage /></ProtectedRoute>} />
      <Route path={ROUTES.SCAN} element={<ProtectedRoute><ScanPage /></ProtectedRoute>} />
      <Route path={ROUTES.TIMELINE} element={<ProtectedRoute><TimelinePage /></ProtectedRoute>} />
      <Route path={ROUTES.REMINDERS} element={<ProtectedRoute><RemindersPage /></ProtectedRoute>} />
      <Route path={ROUTES.EMERGENCY_PASSPORT} element={<ProtectedRoute><EmergencyPassportPage /></ProtectedRoute>} />
      <Route path={ROUTES.PET_CARE_SCORE} element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
      <Route path={ROUTES.VET_PORTAL} element={<ProtectedRoute><VetPortalPage /></ProtectedRoute>} />
      <Route path={ROUTES.MONTHLY_REPORT} element={<ProtectedRoute><MonthlyReportPage /></ProtectedRoute>} />
      <Route path={ROUTES.MONTHLY_REPORT_ARCHIVE} element={<ProtectedRoute><MonthlyReportArchivePage /></ProtectedRoute>} />
      <Route path={ROUTES.SETTINGS} element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path={ROUTES.BILLING} element={<ProtectedRoute><BillingPage /></ProtectedRoute>} />
      <Route path={ROUTES.SETTINGS_ACCOUNT} element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />
      <Route path={ROUTES.SETTINGS_PROFILE} element={<ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>} />

      {/* Deferred protected routes → dashboard */}
      <Route path={ROUTES.LOST_PET} element={<ProtectedRoute><DeferredRedirect /></ProtectedRoute>} />
      <Route path={ROUTES.AGE_TRANSLATOR} element={<ProtectedRoute><DeferredRedirect /></ProtectedRoute>} />
      <Route path={ROUTES.NOTIFICATIONS} element={<ProtectedRoute><DeferredRedirect /></ProtectedRoute>} />
      <Route path={ROUTES.FAMILY_ACCESS} element={<ProtectedRoute><DeferredRedirect /></ProtectedRoute>} />
      <Route path={ROUTES.LAUNCH_READINESS} element={<ProtectedRoute><DeferredRedirect /></ProtectedRoute>} />
      <Route path={ROUTES.BETA_RELEASE} element={<ProtectedRoute><DeferredRedirect /></ProtectedRoute>} />
      <Route path={ROUTES.ANALYTICS} element={<ProtectedRoute><DeferredRedirect /></ProtectedRoute>} />
      <Route path={ROUTES.BETA_FEEDBACK} element={<ProtectedRoute><DeferredRedirect /></ProtectedRoute>} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
