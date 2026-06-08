import { ROUTES, PROTECTED_ROUTES, AUTH_ROUTES } from '@/routes/paths';

export type SEOConfig = {
  title: string;
  description: string;
  canonical?: string;
  ogType?: 'website' | 'article';
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  noIndex?: boolean;
  keywords?: string;
  articleAuthor?: string;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleSection?: string;
};

const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://petclues.com';

export const HOME_TITLE = 'PetClues | AI-Powered Pet Health & Life Management';
export const HOME_DESCRIPTION =
  'Track health records, reminders, vaccinations, life stories, monthly reports, pet passports, and AI-powered pet insights in one place.';
export const HOME_KEYWORDS =
  'pet health tracker, pet passport, pet reminders, pet vaccinations, pet records, pet care app, pet health management, AI pet care, dog health tracker, cat health tracker, exotic pet care';
export const HOME_OG_TITLE = 'PetClues';
export const HOME_OG_DESCRIPTION = 'Everything your pet needs. Remembered.';
export const BRAND_THEME_COLOR = '#2C3E35';
export const BRAND_BG_COLOR = '#F7F4EF';

/** Square brand logo - used for OG, Twitter, Organization schema, and PWA icons. */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`;
const OG_IMAGE_ALT = 'PetClues logo';

const DEFAULT: SEOConfig = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  ogType: 'website',
  ogTitle: HOME_OG_TITLE,
  ogDescription: HOME_OG_DESCRIPTION,
  ogImage: DEFAULT_OG_IMAGE,
  ogImageAlt: OG_IMAGE_ALT,
  keywords: HOME_KEYWORDS,
};

/** Public routes that should be indexed and included in sitemap. */
export const INDEXABLE_PUBLIC_ROUTES = [
  ROUTES.LANDING,
  ROUTES.PRICING,
  ROUTES.PET_MATCH,
  ROUTES.FOUNDING_MEMBERS,
  ROUTES.BLOG,
  ROUTES.PRIVACY,
  ROUTES.TERMS,
  ROUTES.COOKIES,
  ROUTES.CONTACT,
  ROUTES.ABOUT,
  ROUTES.SECURITY,
  ROUTES.DATA_DELETION,
  ROUTES.DATA_EXPORT,
  ROUTES.FAQ,
] as const;

const INDEXABLE_SET = new Set<string>(INDEXABLE_PUBLIC_ROUTES);

/** Routes that must never be indexed even if they fall through to defaults. */
const FORCE_NOINDEX_ROUTES = new Set<string>([
  ...PROTECTED_ROUTES,
  ...AUTH_ROUTES,
  ROUTES.AUTH_CALLBACK,
  ROUTES.RESET_PASSWORD,
  ROUTES.WAITLIST,
  ROUTES.REFERRALS,
  ROUTES.BETA_FEEDBACK,
  ROUTES.LAUNCH_READINESS,
  ROUTES.BETA_RELEASE,
  ROUTES.ANALYTICS,
  ROUTES.NOTIFICATIONS,
  ROUTES.FAMILY_ACCESS,
  ROUTES.LOST_PET,
  ROUTES.LOST_PET_REPORT,
  ROUTES.AGE_TRANSLATOR,
  ROUTES.FOUNDING_MEMBERS,
]);

FORCE_NOINDEX_ROUTES.delete(ROUTES.FOUNDING_MEMBERS);

export const SEO_PAGES: Record<string, SEOConfig> = {
  [ROUTES.LANDING]: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    ogTitle: HOME_OG_TITLE,
    ogDescription: HOME_OG_DESCRIPTION,
    keywords: HOME_KEYWORDS,
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: OG_IMAGE_ALT,
  },
  [ROUTES.PRICING]: {
    title: 'PetClues Pricing - Free Pet Health App & Premium Plans',
    description:
      'Free pet health records, reminders, and emergency passport for one pet. Premium adds Vet Bill Decoder AI, unlimited pets, and monthly report exports.',
    keywords: 'pet health app pricing, free pet records app, pet care subscription',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues pricing - free and premium pet health plans',
  },
  [ROUTES.PET_MATCH]: {
    title: 'Pet Match Quiz - Find Your Ideal Companion | PetClues',
    description:
      'Take the free PetClues pet match quiz to discover dog and cat breeds that fit your lifestyle - then organize their health records in one app.',
    keywords: 'pet match quiz, best dog breed for me, cat breed quiz',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues pet match quiz',
  },
  [ROUTES.FOUNDING_MEMBERS]: {
    title: 'Founding Members - Early Access to PetClues',
    description:
      'Join PetClues founding members for early access, premium trial benefits, and a permanent founding badge. Help shape the future of pet care organization.',
    keywords: 'petclues founding members, early access pet health app',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues founding members program',
  },
  [ROUTES.BLOG]: {
    title: 'Pet Health Blog - Vaccination Guides, Records & Care Tips | PetClues',
    description:
      'Free pet health guides: puppy & cat vaccination schedules, medication reminders, vet bill organization, emergency pet information, and daily care habits.',
    keywords:
      'pet health blog, puppy vaccination schedule, cat vaccination schedule, organize pet medical records, pet medication reminder',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues pet health blog',
  },
  [ROUTES.PRIVACY]: {
    title: 'Privacy Policy - PetClues',
    description: 'How PetClues collects, uses, and protects your pet health data.',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues privacy policy',
  },
  [ROUTES.TERMS]: {
    title: 'Terms of Service - PetClues',
    description: 'Terms and conditions for using PetClues.',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues terms of service',
  },
  [ROUTES.COOKIES]: {
    title: 'Cookie Policy - PetClues',
    description: 'How PetClues uses cookies and similar technologies.',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues cookie policy',
  },
  [ROUTES.CONTACT]: {
    title: 'Contact - PetClues',
    description: 'Get in touch with PetClues support for account help, feedback, and data requests.',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'Contact PetClues support',
  },
  [ROUTES.ABOUT]: {
    title: 'About Us - PetClues',
    description: 'Why PetClues exists - calm, premium pet care organization for modern pet parents.',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'About PetClues',
  },
  [ROUTES.SECURITY]: {
    title: 'Security - PetClues',
    description: 'How PetClues protects your account and pet data with access controls and safeguards.',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues security practices',
  },
  [ROUTES.DATA_DELETION]: {
    title: 'Delete Your Data - PetClues',
    description: 'Request deletion of your PetClues account and associated pet data.',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'Delete your PetClues data',
  },
  [ROUTES.DATA_EXPORT]: {
    title: 'Export Your Data - PetClues',
    description: 'Request a copy of your PetClues account and pet records.',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'Export your PetClues data',
  },
  [ROUTES.FAQ]: {
    title: 'FAQ - PetClues',
    description: 'Frequently asked questions about PetClues pet care organization.',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues frequently asked questions',
  },
  [ROUTES.WAITLIST]: {
    title: 'Join the Waitlist - PetClues',
    description: 'Be first to access PetClues - premium pet health intelligence for modern pet parents.',
    noIndex: true,
  },
  [ROUTES.REFERRALS]: {
    title: 'Refer Friends - PetClues Pet Health App',
    description:
      'Share PetClues with fellow pet parents and earn referral rewards when friends organize their pet health records.',
    keywords: 'pet app referral, share pet health app',
    noIndex: true,
  },
  [ROUTES.LOGIN]: {
    title: 'Sign In - PetClues',
    description: 'Sign in to your PetClues pet health records account.',
    noIndex: true,
  },
  [ROUTES.SIGNUP]: {
    title: 'Create Free Account - PetClues Pet Health Records App',
    description:
      'Create a free PetClues account - organize pet vaccinations, vet bills, medication reminders, and emergency info for one pet.',
    keywords: 'sign up pet health app, free pet records account',
    noIndex: true,
  },
  [ROUTES.DASHBOARD]: {
    title: 'Dashboard - PetClues',
    description: 'Your pet care command center.',
    noIndex: true,
  },
  [ROUTES.PET_PROFILE]: {
    title: 'Pet Profile - PetClues',
    description: "View and manage your pet's profile and health records.",
    noIndex: true,
  },
  [ROUTES.REMINDERS]: {
    title: 'Reminders - PetClues',
    description: 'Stay on top of vaccinations, medications, and vet visits.',
    noIndex: true,
  },
  [ROUTES.SCAN]: {
    title: 'Scan Documents - PetClues',
    description: 'Upload and organize pet health documents.',
    noIndex: true,
  },
  [ROUTES.TIMELINE]: {
    title: 'Timeline - PetClues',
    description: "Your pet's health story, beautifully organized.",
    noIndex: true,
  },
  [ROUTES.EMERGENCY_PASSPORT]: {
    title: 'Emergency Passport - PetClues',
    description: 'Critical pet information ready when seconds matter.',
    noIndex: true,
  },
  [ROUTES.PET_CARE_SCORE]: {
    title: 'PetCare Score - PetClues',
    description: "See how organized your pet's care is and what to improve next.",
    noIndex: true,
  },
  [ROUTES.BETA_FEEDBACK]: {
    title: 'Beta Feedback - PetClues',
    description: 'Help us improve PetClues during the beta period.',
    noIndex: true,
  },
};

export function isBlogArticlePath(pathname: string): boolean {
  return pathname.startsWith('/blog/') && pathname.length > '/blog/'.length;
}

export function isIndexablePublicPath(pathname: string): boolean {
  if (pathname === ROUTES.LANDING) return true;
  if (isBlogArticlePath(pathname)) return true;
  return INDEXABLE_SET.has(pathname);
}

function buildCanonical(pathname: string): string {
  if (pathname === '/') return SITE_URL;
  return `${SITE_URL}${pathname}`;
}

function shouldNoIndex(pathname: string, explicit?: boolean): boolean {
  if (explicit === true) return true;
  if (explicit === false) return false;
  if (FORCE_NOINDEX_ROUTES.has(pathname)) return true;
  if (isIndexablePublicPath(pathname)) return false;
  return true;
}

export function getPageSEO(pathname: string): SEOConfig {
  if (isBlogArticlePath(pathname)) {
    return {
      ...DEFAULT,
      title: 'PetClues Blog',
      description: 'Pet health guides and care tips from PetClues.',
      canonical: buildCanonical(pathname),
      ogType: 'article',
      noIndex: false,
    };
  }

  const pageConfig = SEO_PAGES[pathname];
  const merged: SEOConfig = {
    ...DEFAULT,
    ...pageConfig,
    canonical: buildCanonical(pathname),
    noIndex: shouldNoIndex(pathname, pageConfig?.noIndex),
  };

  return merged;
}

export const SITE_META = {
  siteName: 'PetClues',
  siteUrl: SITE_URL,
  logoUrl: `${SITE_URL}/logo.png`,
  twitterHandle: '@petclues',
  locale: 'en_US',
  defaultOgImage: DEFAULT_OG_IMAGE,
  defaultOgImageAlt: OG_IMAGE_ALT,
  themeColor: BRAND_THEME_COLOR,
  backgroundColor: BRAND_BG_COLOR,
  organizationDescription: 'AI-powered pet health and life management platform.',
  softwareDescription:
    'Pet health records, reminders, passports, AI insights, monthly reports, and life story management.',
};
