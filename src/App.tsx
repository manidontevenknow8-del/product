import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { ProtectedRoute, GuestRoute } from '@/auth';
import { LandingPage } from '@/pages/LandingPage';
import { lazyRoute, RouteFallback } from '@/routes/lazyRoute';

const OnboardingPage = lazyRoute(() => import('@/pages/OnboardingPage'), 'OnboardingPage');
const DashboardPage = lazyRoute(() => import('@/pages/DashboardPage'), 'DashboardPage');
const PetProfilePage = lazyRoute(() => import('@/pages/PetProfilePage'), 'PetProfilePage');
const ScanPage = lazyRoute(() => import('@/pages/ScanPage'), 'ScanPage');
const TimelinePage = lazyRoute(() => import('@/pages/TimelinePage'), 'TimelinePage');
const EmergencyPassportPage = lazyRoute(() => import('@/pages/EmergencyPassportPage'), 'EmergencyPassportPage');
const PetMatchPage = lazyRoute(() => import('@/pages/PetMatchPage'), 'PetMatchPage');
const RemindersPage = lazyRoute(() => import('@/pages/RemindersPage'), 'RemindersPage');
const InsightsPage = lazyRoute(() => import('@/pages/InsightsPage'), 'InsightsPage');
const VetPortalPage = lazyRoute(() => import('@/pages/VetPortalPage'), 'VetPortalPage');
const MonthlyReportPage = lazyRoute(() => import('@/pages/MonthlyReportPage'), 'MonthlyReportPage');
const MonthlyReportArchivePage = lazyRoute(
  () => import('@/pages/MonthlyReportArchivePage'),
  'MonthlyReportArchivePage',
);
const SettingsPage = lazyRoute(() => import('@/pages/SettingsPage'), 'SettingsPage');
const NotFoundPage = lazyRoute(() => import('@/pages/NotFoundPage'), 'NotFoundPage');
const DeferredRedirect = lazyRoute(() => import('@/pages/DeferredRedirect'), 'DeferredRedirect');
const LoginPage = lazyRoute(() => import('@/pages/auth/LoginPage'), 'LoginPage');
const SignupPage = lazyRoute(() => import('@/pages/auth/SignupPage'), 'SignupPage');
const ForgotPasswordPage = lazyRoute(() => import('@/pages/auth/ForgotPasswordPage'), 'ForgotPasswordPage');
const VerifyEmailPage = lazyRoute(() => import('@/pages/auth/VerifyEmailPage'), 'VerifyEmailPage');
const AuthCallbackPage = lazyRoute(() => import('@/pages/auth/AuthCallbackPage'), 'AuthCallbackPage');
const ResetPasswordPage = lazyRoute(() => import('@/pages/auth/ResetPasswordPage'), 'ResetPasswordPage');
const PricingPage = lazyRoute(() => import('@/pages/subscription/PricingPage'), 'PricingPage');
const BillingPage = lazyRoute(() => import('@/pages/subscription/BillingPage'), 'BillingPage');
const AccountSettingsPage = lazyRoute(() => import('@/pages/settings/AccountSettingsPage'), 'AccountSettingsPage');
const ProfileSettingsPage = lazyRoute(() => import('@/pages/settings/ProfileSettingsPage'), 'ProfileSettingsPage');
const ReferralsPage = lazyRoute(() => import('@/pages/waitlist/ReferralsPage'), 'ReferralsPage');
const FoundingMembersPage = lazyRoute(() => import('@/pages/FoundingMembersPage'), 'FoundingMembersPage');
const PrivacyPolicyPage = lazyRoute(() => import('@/pages/legal/PrivacyPolicyPage'), 'PrivacyPolicyPage');
const TermsOfServicePage = lazyRoute(() => import('@/pages/legal/TermsOfServicePage'), 'TermsOfServicePage');
const CookiePolicyPage = lazyRoute(() => import('@/pages/legal/CookiePolicyPage'), 'CookiePolicyPage');
const ContactPage = lazyRoute(() => import('@/pages/legal/ContactPage'), 'ContactPage');
const AboutPage = lazyRoute(() => import('@/pages/legal/AboutPage'), 'AboutPage');
const SecurityPage = lazyRoute(() => import('@/pages/legal/SecurityPage'), 'SecurityPage');
const DataDeletionPage = lazyRoute(() => import('@/pages/legal/DataDeletionPage'), 'DataDeletionPage');
const DataExportPage = lazyRoute(() => import('@/pages/legal/DataExportPage'), 'DataExportPage');
const FaqHubPage = lazyRoute(() => import('@/pages/faq/FaqHubPage'), 'FaqHubPage');
const FaqItemPage = lazyRoute(() => import('@/pages/faq/FaqItemPage'), 'FaqItemPage');
const BlogIndexPage = lazyRoute(() => import('@/pages/blog/BlogIndexPage'), 'BlogIndexPage');
const BlogPostPage = lazyRoute(() => import('@/pages/blog/BlogPostPage'), 'BlogPostPage');
const CompareIndexPage = lazyRoute(() => import('@/pages/compare/CompareIndexPage'), 'CompareIndexPage');
const ComparePage = lazyRoute(() => import('@/pages/compare/ComparePage'), 'ComparePage');
const BestIndexPage = lazyRoute(() => import('@/pages/best/BestIndexPage'), 'BestIndexPage');
const BestIntentPage = lazyRoute(() => import('@/pages/best/BestIntentPage'), 'BestIntentPage');
const GuidesHubPage = lazyRoute(() => import('@/pages/guides/GuidesHubPage'), 'GuidesHubPage');
const GuidesCollectionPage = lazyRoute(() => import('@/pages/guides/GuidesCollectionPage'), 'GuidesCollectionPage');
const GuidesDetailPage = lazyRoute(() => import('@/pages/guides/GuidesDetailPage'), 'GuidesDetailPage');
const LearnIndexPage = lazyRoute(() => import('@/pages/learn/LearnIndexPage'), 'LearnIndexPage');
const LearnArticlePage = lazyRoute(() => import('@/pages/learn/LearnArticlePage'), 'LearnArticlePage');
const CommercialLandingPage = lazyRoute(
  () => import('@/pages/commercial/CommercialLandingPage'),
  'CommercialLandingPage',
);

export function App() {
  return (
    <RouteFallback>
      <Routes>
        {/* Public - keep landing synchronous for fastest first paint */}
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

        <Route path={ROUTES.FOUNDING_MEMBERS} element={<FoundingMembersPage />} />
        <Route path={ROUTES.PET_HEALTH_RECORDS} element={<CommercialLandingPage />} />
        <Route path={ROUTES.DIGITAL_PET_PASSPORT} element={<CommercialLandingPage />} />
        <Route path={ROUTES.PET_VACCINATION_RECORDS} element={<CommercialLandingPage />} />
        <Route path={ROUTES.PET_MEDICAL_HISTORY} element={<CommercialLandingPage />} />
        <Route path={ROUTES.PET_HEALTH_TRACKER} element={<CommercialLandingPage />} />
        <Route path={ROUTES.WAITLIST} element={<DeferredRedirect to={ROUTES.SIGNUP} />} />
        <Route path={ROUTES.LOST_PET_REPORT} element={<DeferredRedirect to={ROUTES.LANDING} />} />

        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.SIGNUP} element={<GuestRoute><SignupPage /></GuestRoute>} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
        <Route path={ROUTES.AUTH_CALLBACK} element={<AuthCallbackPage />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />

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
    </RouteFallback>
  );
}
