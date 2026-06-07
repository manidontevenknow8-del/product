import type { AuditStatus, AuditSeverity } from '@/data/launchReadinessData';

export type BetaAuditItem = {
  id: string;
  audit: 'routing' | 'components' | 'accessibility' | 'mobile' | 'seo' | 'analytics';
  title: string;
  description: string;
  status: AuditStatus;
  severity: AuditSeverity;
  isBlocker?: boolean;
  recommendation?: string;
};

export const BETA_RELEASE_AUDIT: BetaAuditItem[] = [
  {
    id: 'route-coverage',
    audit: 'routing',
    title: 'Route coverage',
    description: 'All 30+ routes registered with protected/public guards. 404 catch-all added.',
    status: 'pass',
    severity: 'low',
  },
  {
    id: 'route-legal',
    audit: 'routing',
    title: 'Legal page routes',
    description: 'Privacy, Terms, and Cookie policies accessible at dedicated URLs.',
    status: 'pass',
    severity: 'low',
  },
  {
    id: 'route-redirects',
    audit: 'routing',
    title: 'Legacy settings redirects',
    description: 'Old settings URLs redirect to unified settings hub.',
    status: 'pass',
    severity: 'low',
  },
  {
    id: 'component-errors',
    audit: 'components',
    title: 'Global error boundary',
    description: 'ErrorBoundary wraps app with friendly GlobalErrorPage fallback.',
    status: 'pass',
    severity: 'low',
  },
  {
    id: 'component-empty',
    audit: 'components',
    title: 'Empty state system',
    description: 'Unified empty states across dashboard, timeline, reminders, documents, notifications.',
    status: 'pass',
    severity: 'low',
  },
  {
    id: 'component-mock',
    audit: 'components',
    title: 'Mock backend dependencies',
    description: 'Auth, reminders, scores, notifications use localStorage mocks.',
    status: 'partial',
    severity: 'high',
    isBlocker: true,
    recommendation: 'Connect Supabase before production GA — acceptable for closed beta.',
  },
  {
    id: 'a11y-focus',
    audit: 'accessibility',
    title: 'Focus indicators',
    description: 'Global focus-visible styles on interactive elements.',
    status: 'pass',
    severity: 'low',
  },
  {
    id: 'a11y-labels',
    audit: 'accessibility',
    title: 'Form labels',
    description: 'Shared Input/Textarea components include visible labels.',
    status: 'pass',
    severity: 'low',
  },
  {
    id: 'a11y-contrast',
    audit: 'accessibility',
    title: 'Contrast audit',
    description: 'Muted text passes on light backgrounds; accent text needs automated verification.',
    status: 'partial',
    severity: 'medium',
    recommendation: 'Run axe or Lighthouse accessibility audit pre-launch.',
  },
  {
    id: 'mobile-nav',
    audit: 'mobile',
    title: 'Mobile navigation',
    description: 'Bottom nav, hamburger menu, 44px touch targets, safe-area padding.',
    status: 'pass',
    severity: 'low',
  },
  {
    id: 'mobile-modals',
    audit: 'mobile',
    title: 'Mobile modals',
    description: 'Bottom sheet pattern on small screens across modals.',
    status: 'pass',
    severity: 'low',
  },
  {
    id: 'mobile-density',
    audit: 'mobile',
    title: 'Bottom nav density',
    description: 'Six primary nav items fit but are tight on smallest screens.',
    status: 'partial',
    severity: 'low',
  },
  {
    id: 'seo-meta',
    audit: 'seo',
    title: 'Per-route metadata',
    description: 'SEOProvider sets title, description, canonical, and robots per route.',
    status: 'pass',
    severity: 'low',
  },
  {
    id: 'seo-og',
    audit: 'seo',
    title: 'Open Graph & Twitter cards',
    description: 'OG and Twitter meta tags applied dynamically on route change.',
    status: 'pass',
    severity: 'low',
  },
  {
    id: 'seo-structured',
    audit: 'seo',
    title: 'Structured data',
    description: 'JSON-LD placeholders on landing and pricing pages.',
    status: 'pass',
    severity: 'low',
  },
  {
    id: 'seo-sitemap',
    audit: 'seo',
    title: 'Sitemap & robots.txt',
    description: 'Not yet generated for deployment.',
    status: 'partial',
    severity: 'medium',
    recommendation: 'Add public/sitemap.xml and robots.txt at deploy time.',
  },
  {
    id: 'analytics-layer',
    audit: 'analytics',
    title: 'Centralized event tracking',
    description: 'EventTracker with adapter pattern; 15+ event types defined.',
    status: 'pass',
    severity: 'low',
  },
  {
    id: 'analytics-providers',
    audit: 'analytics',
    title: 'Third-party analytics',
    description: 'PostHog, Plausible, GA, Mixpanel adapters stubbed — not yet connected.',
    status: 'partial',
    severity: 'medium',
    recommendation: 'Enable one analytics provider for beta cohort measurement.',
  },
  {
    id: 'analytics-coverage',
    audit: 'analytics',
    title: 'Event instrumentation',
    description: 'Key auth, product, and growth events wired in core flows.',
    status: 'pass',
    severity: 'low',
  },
  {
    id: 'legal-review',
    audit: 'components',
    title: 'Legal page review',
    description: 'Privacy, Terms, Cookie policies are placeholders requiring legal counsel.',
    status: 'partial',
    severity: 'high',
    isBlocker: true,
    recommendation: 'Required before public marketing launch; OK for closed beta with consent.',
  },
];

export function getBetaReadinessScore(): number {
  const weights = { pass: 1, partial: 0.5, fail: 0 };
  const total = BETA_RELEASE_AUDIT.reduce((s, i) => s + weights[i.status], 0);
  return Math.round((total / BETA_RELEASE_AUDIT.length) * 100);
}

export function getProductionReadinessScore(): number {
  const blockers = BETA_RELEASE_AUDIT.filter((i) => i.isBlocker);
  const nonBlockers = BETA_RELEASE_AUDIT.filter((i) => !i.isBlocker);
  const weights = { pass: 1, partial: 0.5, fail: 0 };

  const blockerScore = blockers.every((b) => b.status !== 'fail')
    ? blockers.reduce((s, i) => s + weights[i.status], 0) / Math.max(blockers.length, 1)
    : 0;

  const generalScore =
    nonBlockers.reduce((s, i) => s + weights[i.status], 0) / Math.max(nonBlockers.length, 1);

  return Math.round((blockerScore * 0.4 + generalScore * 0.6) * 100);
}

export function getLaunchBlockers() {
  return BETA_RELEASE_AUDIT.filter((i) => i.isBlocker && i.status !== 'pass');
}

export function getCriticalIssues() {
  return BETA_RELEASE_AUDIT.filter(
    (i) => i.severity === 'high' && i.status !== 'pass',
  );
}

export const AUDIT_SECTIONS = [
  'routing',
  'components',
  'accessibility',
  'mobile',
  'seo',
  'analytics',
] as const;

export const AUDIT_SECTION_LABELS: Record<(typeof AUDIT_SECTIONS)[number], string> = {
  routing: 'Routing audit',
  components: 'Component audit',
  accessibility: 'Accessibility audit',
  mobile: 'Mobile audit',
  seo: 'SEO audit',
  analytics: 'Analytics audit',
};
