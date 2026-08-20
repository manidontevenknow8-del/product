import { Routes, Route } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';
import { ProtectedRoute, GuestRoute } from '@/auth';
import { LandingPage } from '@/pages/LandingPage';
import { CommercialLandingPage } from '@/pages/commercial/CommercialLandingPage';
import { lazyRoute, RouteFallback } from '@/routes/lazyRoute';

const OnboardingPage = lazyRoute(() => import('@/pages/OnboardingPage'), 'OnboardingPage');
const DashboardPage = lazyRoute(() => import('@/pages/DashboardPage'), 'DashboardPage');
const PetProfilePage = lazyRoute(() => import('@/pages/PetProfilePage'), 'PetProfilePage');
const ScanPage = lazyRoute(() => import('@/pages/ScanPage'), 'ScanPage');
const TimelinePage = lazyRoute(() => import('@/pages/TimelinePage'), 'TimelinePage');
const EmergencyPassportPage = lazyRoute(() => import('@/pages/EmergencyPassportPage'), 'EmergencyPassportPage');
const PublicEmergencyPassportPage = lazyRoute(
  () => import('@/pages/PublicEmergencyPassportPage'),
  'PublicEmergencyPassportPage',
);
const EmergencyProfilePage = lazyRoute(
  () => import('@/pages/public/EmergencyProfilePage'),
  'EmergencyProfilePage',
);
const QRGeneratorPage = lazyRoute(
  () => import('@/pages/tools/QRGeneratorPage'),
  'QRGeneratorPage',
);
const VaccineSchedulerPage = lazyRoute(
  () => import('@/pages/tools/VaccineSchedulerPage'),
  'VaccineSchedulerPage',
);
const ToolDownloadPage = lazyRoute(
  () => import('@/pages/tools/ToolDownloadPage'),
  'ToolDownloadPage',
);
const ToolsDownloadsHubPage = lazyRoute(
  () => import('@/pages/tools/ToolDownloadPage'),
  'ToolsDownloadsHubPage',
);
const PublicPetStoryPage = lazyRoute(
  () => import('@/pages/PublicPetStoryPage'),
  'PublicPetStoryPage',
);
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
const HouseholdInvitePage = lazyRoute(() => import('@/pages/HouseholdInvitePage'), 'HouseholdInvitePage');
const FamilyAccessRedirect = lazyRoute(() => import('@/pages/FamilyAccessRedirect'), 'FamilyAccessRedirect');
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
const GuidesTwoSegmentPage = lazyRoute(
  () => import('@/pages/guides/GuidesTwoSegmentPage'),
  'GuidesTwoSegmentPage',
);
const LifecycleGuidePage = lazyRoute(
  () => import('@/pages/guides/lifecycle/LifecycleGuidePage'),
  'LifecycleGuidePage',
);
const ResourcesHubPage = lazyRoute(
  () => import('@/pages/resources/ResourcesHubPage'),
  'ResourcesHubPage',
);
const ResourceCityTopicPage = lazyRoute(
  () => import('@/pages/resources/ResourceCityTopicPage'),
  'ResourceCityTopicPage',
);
const RelocationHubPage = lazyRoute(
  () => import('@/pages/relocation/RelocationRoutePage'),
  'RelocationHubPage',
);
const RelocationRoutePage = lazyRoute(
  () => import('@/pages/relocation/RelocationRoutePage'),
  'RelocationRoutePage',
);
const B2BAgencyPage = lazyRoute(
  () => import('@/pages/solutions/B2BAgencyPage'),
  'B2BAgencyPage',
);
const B2BBreederPage = lazyRoute(
  () => import('@/pages/solutions/B2BBreederPage'),
  'B2BBreederPage',
);
const LearnIndexPage = lazyRoute(() => import('@/pages/learn/LearnIndexPage'), 'LearnIndexPage');
const LearnArticlePage = lazyRoute(() => import('@/pages/learn/LearnArticlePage'), 'LearnArticlePage');
const ContentExamplesIndexPage = lazyRoute(
  () => import('@/pages/examples/ContentExamplesIndexPage'),
  'ContentExamplesIndexPage',
);
const BreedsHubPage = lazyRoute(() => import('@/pages/breeds/BreedsHubPage'), 'BreedsHubPage');
const BreedHealthGuidePage = lazyRoute(
  () => import('@/pages/breeds/BreedHealthGuidePage'),
  'BreedHealthGuidePage',
);
const VaultHubPage = lazyRoute(() => import('@/pages/vault/VaultHubPage'), 'VaultHubPage');
const LifeLogisticsHubPage = lazyRoute(
  () => import('@/pages/life-logistics/LifeLogisticsHubPage'),
  'LifeLogisticsHubPage',
);
const ExampleBreedHealthPage = lazyRoute(
  () => import('@/pages/examples/ExampleBreedHealthPage'),
  'ExampleBreedHealthPage',
);
const ExampleSymptomGuidePage = lazyRoute(
  () => import('@/pages/examples/ExampleSymptomGuidePage'),
  'ExampleSymptomGuidePage',
);
const ExampleVaccinationSchedulePage = lazyRoute(
  () => import('@/pages/examples/ExampleVaccinationSchedulePage'),
  'ExampleVaccinationSchedulePage',
);
const ExampleEmergencyGuidePage = lazyRoute(
  () => import('@/pages/examples/ExampleEmergencyGuidePage'),
  'ExampleEmergencyGuidePage',
);
const ExampleRecordsVaultPage = lazyRoute(
  () => import('@/pages/examples/ExampleRecordsVaultPage'),
  'ExampleRecordsVaultPage',
);
const ExampleLifeLogisticsPage = lazyRoute(
  () => import('@/pages/examples/ExampleLifeLogisticsPage'),
  'ExampleLifeLogisticsPage',
);
const ExampleComparisonPage = lazyRoute(
  () => import('@/pages/examples/ExampleComparisonPage'),
  'ExampleComparisonPage',
);
const ExampleToolPage = lazyRoute(() => import('@/pages/examples/ExampleToolPage'), 'ExampleToolPage');
const VaccinationsIndexPage = lazyRoute(
  () => import('@/pages/vaccinations/VaccinationsIndexPage'),
  'VaccinationsIndexPage',
);
const VaccinationSchedulePage = lazyRoute(
  () => import('@/pages/vaccinations/VaccinationSchedulePage'),
  'VaccinationSchedulePage',
);
const EmergencyHubPage = lazyRoute(
  () => import('@/pages/emergency/EmergencyHubPage'),
  'EmergencyHubPage',
);
const EmergencyGuidePage = lazyRoute(
  () => import('@/pages/emergency/EmergencyGuidePage'),
  'EmergencyGuidePage',
);
const SymptomsIndexPage = lazyRoute(
  () => import('@/pages/symptoms/SymptomsIndexPage'),
  'SymptomsIndexPage',
);
const SymptomGuidePage = lazyRoute(
  () => import('@/pages/symptoms/SymptomGuidePage'),
  'SymptomGuidePage',
);

export function App() {
  return (
    <RouteFallback>
      <Routes>
        {/* Public - keep landing synchronous for fastest first paint */}
        <Route path={ROUTES.LANDING} element={<LandingPage />} />
        <Route path="/breeds" element={<BreedsHubPage />} />
        <Route path="/breeds/:breedSlug/:stageSlug" element={<BreedHealthGuidePage />} />
        <Route path="/vault" element={<VaultHubPage />} />
        <Route path="/life-logistics" element={<LifeLogisticsHubPage />} />
        <Route path="/examples" element={<ContentExamplesIndexPage />} />
        <Route path="/examples/breed-health/:slug" element={<ExampleBreedHealthPage />} />
        <Route path="/examples/symptom/:slug" element={<ExampleSymptomGuidePage />} />
        <Route path="/examples/vaccination/:slug" element={<ExampleVaccinationSchedulePage />} />
        <Route path="/examples/emergency/:slug" element={<ExampleEmergencyGuidePage />} />
        <Route path="/examples/vault/:slug" element={<ExampleRecordsVaultPage />} />
        <Route path="/examples/life-logistics/:slug" element={<ExampleLifeLogisticsPage />} />
        <Route path="/examples/compare/:slug" element={<ExampleComparisonPage />} />
        <Route path="/examples/tools/:slug" element={<ExampleToolPage />} />
        <Route path="/symptoms" element={<SymptomsIndexPage />} />
        <Route path="/symptoms/:species/:slug" element={<SymptomGuidePage />} />
        <Route path="/vaccinations" element={<VaccinationsIndexPage />} />
        <Route path="/vaccinations/:slug" element={<VaccinationSchedulePage />} />
        <Route path="/emergency" element={<EmergencyHubPage />} />
        <Route path="/emergency/:slug" element={<EmergencyGuidePage />} />
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
        <Route path={ROUTES.LAUNCH_READINESS} element={<ProtectedRoute><DeferredRedirect /></ProtectedRoute>} />
        <Route path={ROUTES.BETA_RELEASE} element={<ProtectedRoute><DeferredRedirect /></ProtectedRoute>} />
        <Route path={ROUTES.ANALYTICS} element={<ProtectedRoute><DeferredRedirect /></ProtectedRoute>} />
        <Route path={ROUTES.BETA_FEEDBACK} element={<ProtectedRoute><DeferredRedirect /></ProtectedRoute>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </RouteFallback>
  );
}
