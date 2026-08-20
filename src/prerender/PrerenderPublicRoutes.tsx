import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { LandingPage } from '@/pages/LandingPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { PetProfilePage } from '@/pages/PetProfilePage';
import { ScanPage } from '@/pages/ScanPage';
import { TimelinePage } from '@/pages/TimelinePage';
import { EmergencyPassportPage } from '@/pages/EmergencyPassportPage';
import { PublicEmergencyPassportPage } from '@/pages/PublicEmergencyPassportPage';
import { EmergencyProfilePage } from '@/pages/public/EmergencyProfilePage';
import { QRGeneratorPage } from '@/pages/tools/QRGeneratorPage';
import { VaccineSchedulerPage } from '@/pages/tools/VaccineSchedulerPage';
import { ToolDownloadPage, ToolsDownloadsHubPage } from '@/pages/tools/ToolDownloadPage';
import { PublicPetStoryPage } from '@/pages/PublicPetStoryPage';
import { PetMatchPage } from '@/pages/PetMatchPage';
import { RemindersPage } from '@/pages/RemindersPage';
import { InsightsPage } from '@/pages/InsightsPage';
import { VetPortalPage } from '@/pages/VetPortalPage';
import { MonthlyReportPage } from '@/pages/MonthlyReportPage';
import { MonthlyReportArchivePage } from '@/pages/MonthlyReportArchivePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { DeferredRedirect } from '@/pages/DeferredRedirect';
import { FamilyAccessRedirect } from '@/pages/FamilyAccessRedirect';
import { HouseholdInvitePage } from '@/pages/HouseholdInvitePage';
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
import { GuidesTwoSegmentPage } from '@/pages/guides/GuidesTwoSegmentPage';
import { LifecycleGuidePage } from '@/pages/guides/lifecycle/LifecycleGuidePage';
import { ResourcesHubPage } from '@/pages/resources/ResourcesHubPage';
import { ResourceCityTopicPage } from '@/pages/resources/ResourceCityTopicPage';
import {
  RelocationHubPage,
  RelocationRoutePage,
} from '@/pages/relocation/RelocationRoutePage';
import { B2BAgencyPage } from '@/pages/solutions/B2BAgencyPage';
import { B2BBreederPage } from '@/pages/solutions/B2BBreederPage';
import { LearnIndexPage } from '@/pages/learn/LearnIndexPage';
import { LearnArticlePage } from '@/pages/learn/LearnArticlePage';
import { CommercialLandingPage } from '@/pages/commercial/CommercialLandingPage';
import { EmergencyHubPage } from '@/pages/emergency/EmergencyHubPage';
import { EmergencyGuidePage } from '@/pages/emergency/EmergencyGuidePage';
import { ProtectedRoute, GuestRoute } from '@/auth';

/** Synchronous route tree for build-time SSR (no lazy/Suspense). */
export function PrerenderPublicRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.LANDING} element={<LandingPage marketingShell />} />
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
      <Route path={`${ROUTES.GUIDES}/:breed/lifecycle/:stage`} element={<LifecycleGuidePage />} />
      <Route path={`${ROUTES.GUIDES}/:breed/:condition`} element={<GuidesTwoSegmentPage />} />
      <Route path={ROUTES.RESOURCES} element={<ResourcesHubPage />} />
      <Route path={`${ROUTES.RESOURCES}/:city/:topic`} element={<ResourceCityTopicPage />} />
      <Route path={ROUTES.RELOCATION} element={<RelocationHubPage />} />
      <Route path={`${ROUTES.RELOCATION}/:route`} element={<RelocationRoutePage />} />
      <Route path={ROUTES.FOR_AGENCIES} element={<B2BAgencyPage />} />
      <Route path={ROUTES.RELOCATION_PARTNERS} element={<B2BAgencyPage />} />
      <Route path={ROUTES.FOR_BREEDERS} element={<B2BBreederPage />} />
      <Route path={ROUTES.BREEDER_PARTNERS} element={<B2BBreederPage />} />
      <Route path={ROUTES.LEARN} element={<LearnIndexPage />} />
      <Route path={`${ROUTES.LEARN}/:slug`} element={<LearnArticlePage />} />
      <Route path="/emergency" element={<EmergencyHubPage />} />
      <Route path="/emergency/:slug" element={<EmergencyGuidePage />} />
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
      <Route path={`${ROUTES.EMERGENCY_PUBLIC}/:token`} element={<PublicEmergencyPassportPage />} />
      <Route path={`${ROUTES.PUBLIC_TRIAGE}/:publicId`} element={<EmergencyProfilePage />} />
      <Route path={`${ROUTES.STORY_PUBLIC}/:token`} element={<PublicPetStoryPage />} />
      <Route path={ROUTES.TOOLS_VACCINE_SCHEDULER} element={<VaccineSchedulerPage />} />
      <Route path={ROUTES.TOOLS_QR_GENERATOR} element={<ProtectedRoute><QRGeneratorPage /></ProtectedRoute>} />
      <Route path={ROUTES.TOOLS_DOWNLOADS} element={<ToolsDownloadsHubPage />} />
      <Route path={`${ROUTES.TOOLS_DOWNLOADS}/:slug`} element={<ToolDownloadPage />} />
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
      <Route path={ROUTES.FAMILY_ACCESS} element={<ProtectedRoute><FamilyAccessRedirect /></ProtectedRoute>} />
      <Route path={`${ROUTES.FAMILY_INVITE}/:token`} element={<HouseholdInvitePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
