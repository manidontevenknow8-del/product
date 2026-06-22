import { getCommercialPageByPath, isCommercialPath } from '@/data/commercial';
import { ORGANIZATION_SAME_AS } from '@/data/socialProfiles';
import { ROUTES, PROTECTED_ROUTES, AUTH_ROUTES } from '@/routes/paths';
import { formatMetaDescription, formatPageTitle } from '@/seo/seoFormatters';

export const ROBOTS_INDEX = 'index, follow';
export const ROBOTS_NOINDEX = 'noindex, nofollow';

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

const SITE_URL =
  import.meta.env?.VITE_SITE_URL ||
  (typeof process !== 'undefined' ? process.env.VITE_SITE_URL : undefined) ||
  'https://petclues.com';

export const HOME_TITLE = 'PetClues | AI-Powered Pet Health & Life Management';
export const HOME_DESCRIPTION =
  'Track health records, reminders, vaccinations, life stories, monthly reports, pet passports, and AI-powered pet insights in one place.';
export const HOME_KEYWORDS =
  'pet health tracker, pet passport, pet reminders, pet vaccinations, pet records, pet care app, pet health management, AI pet care, dog health tracker, cat health tracker, exotic pet care';
export const HOME_OG_TITLE = HOME_TITLE;
export const HOME_OG_DESCRIPTION = HOME_DESCRIPTION;
export const BRAND_THEME_COLOR = '#2C3E35';
export const BRAND_BG_COLOR = '#F7F4EF';

/** Social share image (1200x630). Square brand mark: /logo.png (from /logo-source.png). */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
export const BRAND_LOGO_URL = `${SITE_URL}/logo.png`;
const OG_IMAGE_ALT = 'PetClues - AI-powered pet health management';

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
  ROUTES.COMPARE,
  ROUTES.BEST,
  ROUTES.GUIDES,
  ROUTES.LEARN,
  ROUTES.PRIVACY,
  ROUTES.TERMS,
  ROUTES.COOKIES,
  ROUTES.CONTACT,
  ROUTES.ABOUT,
  ROUTES.SECURITY,
  ROUTES.DATA_DELETION,
  ROUTES.DATA_EXPORT,
  ROUTES.FAQ,
  ROUTES.PET_HEALTH_RECORDS,
  ROUTES.DIGITAL_PET_PASSPORT,
  ROUTES.PET_VACCINATION_RECORDS,
  ROUTES.PET_MEDICAL_HISTORY,
  ROUTES.PET_HEALTH_TRACKER,
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
    title: formatPageTitle('PetClues Membership — Annual Pet Health Plans'),
    description: formatMetaDescription(
      'Annual memberships for organized pet parents. Free tier for one pet. Plus and Pro include health records, reminders, passports, and AI insights — billed once per year.',
    ),
    keywords: 'pet health app pricing, annual pet membership, pet care plans, pet records app',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues annual membership plans',
  },
  [ROUTES.PET_MATCH]: {
    title: formatPageTitle('Pet Match Quiz - Find Your Ideal Companion'),
    description: formatMetaDescription(
      'Take the free PetClues pet match quiz to discover dog and cat breeds that fit your lifestyle, then organize their health records in one app.',
    ),
    keywords: 'pet match quiz, best dog breed for me, cat breed quiz',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues pet match quiz',
  },
  [ROUTES.FOUNDING_MEMBERS]: {
    title: formatPageTitle('Founding Members - Early Access to PetClues'),
    description: formatMetaDescription(
      'Join PetClues founding members for early access, premium trial benefits, and a permanent founding badge. Help shape the future of pet care organization.',
    ),
    keywords: 'petclues founding members, early access pet health app',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues founding members program',
  },
  [ROUTES.BLOG]: {
    title: formatPageTitle('Pet Health Blog - Vaccination Guides, Records & Care Tips'),
    description: formatMetaDescription(
      'Free pet health guides: puppy and cat vaccination schedules, medication reminders, vet bill organization, emergency pet information, and daily care habits.',
    ),
    keywords:
      'pet health blog, puppy vaccination schedule, cat vaccination schedule, organize pet medical records, pet medication reminder',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues pet health blog',
  },
  [ROUTES.COMPARE]: {
    title: 'PetClues Comparisons - Pet Health Apps vs Spreadsheets & Alternatives | PetClues',
    description:
      'Compare PetClues with Google Drive, Excel, Notion, PetDesk, paper records, and 45+ alternatives for pet health records and vaccination reminders.',
    keywords:
      'petclues vs, best pet health record app, alternative to spreadsheets pet records, pet health app comparison',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues comparison guides',
  },
  [ROUTES.BEST]: {
    title: 'Best Pet Health Apps & Tools (2026) – Intent Guides | PetClues',
    description:
      'Authoritative guides for the best pet health record apps, vaccination trackers, reminder apps, digital passports, and pet care platforms.',
    keywords:
      'best pet health record app, best pet reminder app, pet vaccination tracker, digital pet passport, pet medical record organizer',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues best pet health app guides',
  },
  [ROUTES.GUIDES]: {
    title: 'Pet Care Guides & Templates – Vaccines, Travel, Emergency | PetClues',
    description:
      'Programmatic pet care guides: dog and cat vaccination schedules by breed, travel checklists by country, emergency checklists, and health record templates.',
    keywords:
      'dog vaccination schedule by breed, cat vaccination schedule, pet travel checklist, pet emergency checklist, pet health record template',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues programmatic pet care guides',
  },
  [ROUTES.LEARN]: {
    title: 'PetClues Learn - Pet Health Records, Vaccines & Care Guides',
    description:
      '50+ expert guides on pet health records, vaccinations, emergency passports, travel documents, medication tracking, and everyday pet organization.',
    keywords:
      'pet health guides, pet vaccination help, pet emergency passport, organize pet records, pet medication tracking',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues Learn knowledge base',
  },
  [ROUTES.PRIVACY]: {
    title: formatPageTitle('Privacy Policy'),
    description: formatMetaDescription(
      'How PetClues collects, uses, stores, and protects your pet health data, account information, uploaded documents, and AI-assisted features.',
    ),
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues privacy policy',
  },
  [ROUTES.TERMS]: {
    title: formatPageTitle('Terms of Service'),
    description: formatMetaDescription(
      'Terms and conditions for using PetClues, including accounts, subscriptions, pet health records, AI features, and acceptable use of the platform.',
    ),
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues terms of service',
  },
  [ROUTES.COOKIES]: {
    title: formatPageTitle('Cookie Policy'),
    description: formatMetaDescription(
      'How PetClues uses cookies and similar technologies for authentication, analytics, preferences, and improving your pet care organization experience.',
    ),
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues cookie policy',
  },
  [ROUTES.CONTACT]: {
    title: formatPageTitle('Contact'),
    description: formatMetaDescription(
      'Contact PetClues support for account help, billing questions, data requests, feedback, and partnership inquiries. We respond as quickly as we can.',
    ),
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'Contact PetClues support',
  },
  [ROUTES.ABOUT]: {
    title: formatPageTitle('About Us'),
    description: formatMetaDescription(
      'Why PetClues exists: calm, premium pet care organization for modern pet parents. Learn our mission, values, and approach to health records and reminders.',
    ),
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'About PetClues',
  },
  [ROUTES.SECURITY]: {
    title: formatPageTitle('Security'),
    description: formatMetaDescription(
      'How PetClues protects your account and pet data with access controls, encryption in transit, secure storage practices, and ongoing security safeguards.',
    ),
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues security practices',
  },
  [ROUTES.DATA_DELETION]: {
    title: formatPageTitle('Delete Your Data'),
    description: formatMetaDescription(
      'Request deletion of your PetClues account and associated pet health records, documents, reminders, and profile data. Step-by-step instructions included.',
    ),
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'Delete your PetClues data',
  },
  [ROUTES.DATA_EXPORT]: {
    title: formatPageTitle('Export Your Data'),
    description: formatMetaDescription(
      'Request a copy of your PetClues account data, pet profiles, health records, documents, and reminders. Export instructions for pet parents and clinics.',
    ),
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'Export your PetClues data',
  },
  [ROUTES.FAQ]: {
    title: formatPageTitle('Pet Health FAQ - Records, Vaccines, Travel & Emergency Prep'),
    description: formatMetaDescription(
      '200+ searchable answers on organizing pet records, vaccination storage, pet passports, travel documents, medications, and emergencies.',
    ),
    keywords:
      'pet health faq, organize pet records, vaccination records, pet passport, travel with pet',
    ogImage: DEFAULT_OG_IMAGE,
    ogImageAlt: 'PetClues pet health FAQ center',
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

export function isCompareArticlePath(pathname: string): boolean {
  return pathname.startsWith('/compare/') && pathname.length > '/compare/'.length;
}

export function isComparePath(pathname: string): boolean {
  return pathname === ROUTES.COMPARE || isCompareArticlePath(pathname);
}

export function isBestArticlePath(pathname: string): boolean {
  return pathname.startsWith('/best/') && pathname.length > '/best/'.length;
}

export function isBestPath(pathname: string): boolean {
  return pathname === ROUTES.BEST || isBestArticlePath(pathname);
}

export function isGuidesCollectionPath(pathname: string): boolean {
  if (!pathname.startsWith(`${ROUTES.GUIDES}/`)) return false;
  const rest = pathname.slice(`${ROUTES.GUIDES}/`.length);
  return rest.length > 0 && !rest.includes('/');
}

export function isGuidesDetailPath(pathname: string): boolean {
  if (!pathname.startsWith(`${ROUTES.GUIDES}/`)) return false;
  const rest = pathname.slice(`${ROUTES.GUIDES}/`.length);
  return rest.includes('/');
}

export function isGuidesPath(pathname: string): boolean {
  return pathname === ROUTES.GUIDES || pathname.startsWith(`${ROUTES.GUIDES}/`);
}

export function isLearnArticlePath(pathname: string): boolean {
  return pathname.startsWith('/learn/') && pathname.length > '/learn/'.length;
}

export function isLearnPath(pathname: string): boolean {
  return pathname === ROUTES.LEARN || isLearnArticlePath(pathname);
}

export function isFaqArticlePath(pathname: string): boolean {
  return pathname.startsWith('/faq/') && pathname.length > '/faq/'.length;
}

export function isFaqPath(pathname: string): boolean {
  return pathname === ROUTES.FAQ || isFaqArticlePath(pathname);
}

export function isIndexablePublicPath(pathname: string): boolean {
  if (pathname === ROUTES.LANDING) return true;
  if (isCommercialPath(pathname)) return true;
  if (isBlogArticlePath(pathname)) return true;
  if (isCompareArticlePath(pathname)) return true;
  if (isBestArticlePath(pathname)) return true;
  if (isGuidesDetailPath(pathname) || isGuidesCollectionPath(pathname)) return true;
  if (isLearnArticlePath(pathname)) return true;
  if (isFaqArticlePath(pathname)) return true;
  return INDEXABLE_SET.has(pathname);
}

function buildCanonical(pathname: string): string {
  if (pathname === '/') return SITE_URL;
  return `${SITE_URL}${pathname}`;
}

function shouldNoIndex(pathname: string, explicit?: boolean): boolean {
  if (explicit === true) return true;
  if (explicit === false) return false;
  if (isCommercialPath(pathname)) return false;
  if (FORCE_NOINDEX_ROUTES.has(pathname)) return true;
  if (isIndexablePublicPath(pathname)) return false;
  return true;
}

function getCommercialPageSEO(pathname: string): SEOConfig | null {
  const page = getCommercialPageByPath(pathname);
  if (!page) return null;

  return finalizeSEO(
    {
      title: page.title,
      description: page.metaDescription,
      keywords: [page.primaryKeyword, ...page.secondaryKeywords].join(', '),
      canonical: buildCanonical(pathname),
      ogType: 'website',
      ogImage: DEFAULT_OG_IMAGE,
      ogImageAlt: page.heroImageAlt,
      noIndex: false,
    },
    pathname,
  );
}

function finalizeSEO(config: SEOConfig, pathname?: string): SEOConfig {
  const title =
    pathname === ROUTES.LANDING || config.title === HOME_TITLE
      ? config.title
      : formatPageTitle(config.title);

  return {
    ...config,
    title,
    description: formatMetaDescription(config.description, title),
    ogTitle: config.ogTitle
      ? pathname === ROUTES.LANDING
        ? config.ogTitle
        : formatPageTitle(config.ogTitle)
      : undefined,
    ogDescription: config.ogDescription
      ? formatMetaDescription(config.ogDescription, title)
      : undefined,
  };
}

export function getPageSEO(pathname: string): SEOConfig {
  const commercialSeo = getCommercialPageSEO(pathname);
  if (commercialSeo) return commercialSeo;

  if (isBlogArticlePath(pathname)) {
    return finalizeSEO(
      {
        ...DEFAULT,
        title: 'PetClues Blog',
        description: 'Pet health guides and care tips from PetClues.',
        canonical: buildCanonical(pathname),
        ogType: 'article',
        noIndex: false,
      },
      pathname,
    );
  }

  if (isCompareArticlePath(pathname)) {
    return finalizeSEO(
      {
        ...DEFAULT,
        title: 'PetClues Comparison',
        description: 'Compare PetClues with alternatives for pet health records and reminders.',
        canonical: buildCanonical(pathname),
        ogType: 'article',
        noIndex: false,
      },
      pathname,
    );
  }

  if (isBestArticlePath(pathname)) {
    return finalizeSEO(
      {
        ...DEFAULT,
        title: 'Best Pet Health App Guide',
        description: 'Authoritative guide comparing pet health record apps, reminders, and care tools.',
        canonical: buildCanonical(pathname),
        ogType: 'article',
        noIndex: false,
      },
      pathname,
    );
  }

  if (isGuidesDetailPath(pathname) || isGuidesCollectionPath(pathname)) {
    return finalizeSEO(
      {
        ...DEFAULT,
        title: 'Pet Care Guide',
        description: 'Programmatic pet care guide for vaccinations, travel, emergency prep, and health records.',
        canonical: buildCanonical(pathname),
        ogType: 'article',
        noIndex: false,
      },
      pathname,
    );
  }

  if (isLearnArticlePath(pathname)) {
    return finalizeSEO(
      {
        ...DEFAULT,
        title: 'PetClues Learn',
        description: 'Pet health knowledge base guides from PetClues.',
        canonical: buildCanonical(pathname),
        ogType: 'article',
        noIndex: false,
      },
      pathname,
    );
  }

  if (isFaqArticlePath(pathname)) {
    return finalizeSEO(
      {
        ...DEFAULT,
        title: 'PetClues FAQ',
        description: 'Pet health questions answered by PetClues.',
        canonical: buildCanonical(pathname),
        ogType: 'article',
        noIndex: false,
      },
      pathname,
    );
  }

  const pageConfig = SEO_PAGES[pathname];
  const merged: SEOConfig = {
    ...DEFAULT,
    ...pageConfig,
    canonical: buildCanonical(pathname),
    noIndex: shouldNoIndex(pathname, pageConfig?.noIndex),
  };

  if (pageConfig && pageConfig.ogTitle === undefined) {
    merged.ogTitle = undefined;
  }
  if (pageConfig && pageConfig.ogDescription === undefined) {
    merged.ogDescription = undefined;
  }

  return finalizeSEO(merged, pathname);
}

export { ORGANIZATION_SAME_AS } from '@/data/socialProfiles';

export const SITE_META = {
  siteName: 'PetClues',
  siteUrl: SITE_URL,
  logoUrl: BRAND_LOGO_URL,
  sameAs: ORGANIZATION_SAME_AS,
  twitterHandle: '@petclues',
  locale: 'en_US',
  defaultOgImage: DEFAULT_OG_IMAGE,
  defaultOgImageAlt: OG_IMAGE_ALT,
  themeColor: BRAND_THEME_COLOR,
  backgroundColor: BRAND_BG_COLOR,
  organizationDescription:
    'Premium digital biological archive and concierge medical records management for pets.',
  softwareDescription:
    'Pet data management software for health records, vaccination tracking, digital pet passports, reminders, and concierge document extraction.',
};
