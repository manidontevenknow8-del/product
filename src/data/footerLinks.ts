import { ROUTES } from '@/routes/paths';

export type FooterLink = {
  label: string;
  to: string;
};

/** Launch footer - legal & trust links only (no product clutter). */
export const FOOTER_LEGAL_LINKS: FooterLink[] = [
  { label: 'Privacy Policy', to: ROUTES.PRIVACY },
  { label: 'Terms of Service', to: ROUTES.TERMS },
  { label: 'Cookie Policy', to: ROUTES.COOKIES },
  { label: 'Security', to: ROUTES.SECURITY },
  { label: 'Data Deletion', to: ROUTES.DATA_DELETION },
  { label: 'Export Data', to: ROUTES.DATA_EXPORT },
];

export const FOOTER_COMPANY_LINKS: FooterLink[] = [
  { label: 'About Us', to: ROUTES.ABOUT },
  { label: 'Contact', to: ROUTES.CONTACT },
];

export const FOOTER_PRODUCT_LINKS: FooterLink[] = [
  { label: 'Pricing', to: ROUTES.PRICING },
  { label: 'Pet Match Quiz', to: ROUTES.PET_MATCH },
  { label: 'Founding Members', to: ROUTES.FOUNDING_MEMBERS },
];

export const FOOTER_RESOURCE_LINKS: FooterLink[] = [
  { label: 'Learn', to: ROUTES.LEARN },
  { label: 'Guides', to: ROUTES.GUIDES },
  { label: 'Best', to: ROUTES.BEST },
  { label: 'Blog', to: ROUTES.BLOG },
  { label: 'Compare', to: ROUTES.COMPARE },
  { label: 'FAQ', to: ROUTES.FAQ },
];

export const FOOTER_SOLUTION_LINKS: FooterLink[] = [
  { label: 'Pet health records', to: ROUTES.PET_HEALTH_RECORDS },
  { label: 'Digital pet passport', to: ROUTES.DIGITAL_PET_PASSPORT },
  { label: 'Vaccination records', to: ROUTES.PET_VACCINATION_RECORDS },
  { label: 'Medical history', to: ROUTES.PET_MEDICAL_HISTORY },
  { label: 'Health tracker', to: ROUTES.PET_HEALTH_TRACKER },
];

/** Flat list for audits and sitemap cross-checks. */
export const FOOTER_LAUNCH_LINKS: FooterLink[] = [
  ...FOOTER_PRODUCT_LINKS,
  ...FOOTER_SOLUTION_LINKS,
  ...FOOTER_LEGAL_LINKS,
  ...FOOTER_COMPANY_LINKS,
  ...FOOTER_RESOURCE_LINKS,
];
