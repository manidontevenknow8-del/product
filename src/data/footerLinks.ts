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

export const FOOTER_RESOURCE_LINKS: FooterLink[] = [
  { label: 'Blog', to: ROUTES.BLOG },
  { label: 'FAQ', to: ROUTES.FAQ },
];

/** Flat list for audits and sitemap cross-checks. */
export const FOOTER_LAUNCH_LINKS: FooterLink[] = [
  ...FOOTER_LEGAL_LINKS,
  ...FOOTER_COMPANY_LINKS,
  ...FOOTER_RESOURCE_LINKS,
];
