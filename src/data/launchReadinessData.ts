export type AuditStatus = 'pass' | 'partial' | 'fail';
export type AuditSeverity = 'low' | 'medium' | 'high';

export type AuditItem = {
  id: string;
  category: string;
  title: string;
  description: string;
  status: AuditStatus;
  severity: AuditSeverity;
  recommendation?: string;
};

export type MobileCheckItem = {
  id: string;
  title: string;
  description: string;
  status: 'pass' | 'partial';
};

export const MOBILE_OPTIMIZATION_ITEMS: MobileCheckItem[] = [
  {
    id: 'nav-bottom',
    title: 'Bottom navigation touch targets',
    description: '44px minimum tap areas, safe-area padding, aria-current on active routes.',
    status: 'pass',
  },
  {
    id: 'nav-sidebar',
    title: 'Sidebar collapse on tablet/mobile',
    description: 'Sidebar hidden below 900px; hamburger menu provides full navigation.',
    status: 'pass',
  },
  {
    id: 'nav-menu',
    title: 'Mobile menu accessibility',
    description: 'Escape to close, body scroll lock, aria-modal and labeled close button.',
    status: 'pass',
  },
  {
    id: 'forms-touch',
    title: 'Touch-friendly form inputs',
    description: 'Inputs use 44px min-height on mobile; focus rings for keyboard users.',
    status: 'pass',
  },
  {
    id: 'forms-keyboard',
    title: 'Keyboard-safe layouts',
    description: 'Modals scroll internally; bottom sheet pattern on small screens.',
    status: 'pass',
  },
  {
    id: 'cards-stack',
    title: 'Card mobile stacking',
    description: 'Grid layouts collapse to single column at 768–900px breakpoints.',
    status: 'pass',
  },
  {
    id: 'modals-sheet',
    title: 'Mobile-friendly modals',
    description: 'Bottom sheet on mobile, centered on desktop; overlay tap to close.',
    status: 'pass',
  },
  {
    id: 'overflow',
    title: 'No horizontal scrolling',
    description: 'Global overflow-x hidden; min-width 0 on flex children.',
    status: 'pass',
  },
  {
    id: 'bottom-nav-density',
    title: 'Bottom nav item density',
    description: 'Six primary items fit on small screens; consider "More" menu in V2.',
    status: 'partial',
  },
];

export const LAUNCH_READINESS_AUDIT: AuditItem[] = [
  {
    id: 'empty-states',
    category: 'UI States',
    title: 'Empty state system',
    description: 'Unified empty states for dashboard, timeline, reminders, documents, and notifications.',
    status: 'pass',
    severity: 'low',
  },
  {
    id: 'loading-states',
    category: 'UI States',
    title: 'Loading states',
    description: 'Most pages show loading text; no global skeleton system yet.',
    status: 'partial',
    severity: 'medium',
    recommendation: 'Add shared LoadingState skeleton component before public launch.',
  },
  {
    id: 'error-states',
    category: 'UI States',
    title: 'Error boundaries & error UI',
    description: 'No React error boundaries or network error fallbacks.',
    status: 'fail',
    severity: 'high',
    recommendation: 'Add ErrorBoundary and retry UI for failed API calls.',
  },
  {
    id: 'mock-data',
    category: 'Content',
    title: 'Placeholder / mock data',
    description: 'Core features use localStorage mocks — auth, reminders, scores, notifications, family sharing.',
    status: 'partial',
    severity: 'high',
    recommendation: 'Connect Supabase backend before production users.',
  },
  {
    id: 'auth-flow',
    category: 'Navigation',
    title: 'Auth & onboarding flow',
    description: 'Login, signup, verify email, onboarding routes wired and protected.',
    status: 'pass',
    severity: 'low',
  },
  {
    id: 'nav-consistency',
    category: 'Navigation',
    title: 'Navigation path consistency',
    description: 'All primary routes reachable via sidebar, bottom nav, or mobile menu.',
    status: 'pass',
    severity: 'low',
  },
  {
    id: 'settings-redirect',
    category: 'Navigation',
    title: 'Legacy settings redirects',
    description: '/settings/account and /settings/profile redirect to unified settings hub.',
    status: 'pass',
    severity: 'low',
  },
  {
    id: 'component-consistency',
    category: 'Design System',
    title: 'Shared UI components',
    description: 'Button, Input, Card, EmptyState, SectionHeader used consistently.',
    status: 'pass',
    severity: 'low',
  },
  {
    id: 'duplicate-empty',
    category: 'Design System',
    title: 'Duplicate empty state patterns',
    description: 'Legacy ReminderEmptyState and timeline empty state consolidated into empty-states module.',
    status: 'pass',
    severity: 'low',
  },
  {
    id: 'focus-states',
    category: 'Accessibility',
    title: 'Focus indicators',
    description: 'Global focus-visible styles added for buttons, links, and inputs.',
    status: 'pass',
    severity: 'low',
  },
  {
    id: 'form-labels',
    category: 'Accessibility',
    title: 'Form labels',
    description: 'Input component includes visible labels; some custom toggles use aria-label.',
    status: 'pass',
    severity: 'low',
  },
  {
    id: 'contrast',
    category: 'Accessibility',
    title: 'Color contrast',
    description: 'Muted text meets WCAG AA on light backgrounds; accent gold on white may need review.',
    status: 'partial',
    severity: 'medium',
    recommendation: 'Run automated contrast audit on accent-colored text.',
  },
  {
    id: 'mobile-passport',
    category: 'Mobile',
    title: 'Emergency passport mobile layout',
    description: 'Passport page uses multi-column layout; verified responsive breakpoints.',
    status: 'pass',
    severity: 'low',
  },
  {
    id: 'premium-placeholders',
    category: 'Production',
    title: 'Coming soon placeholders',
    description: 'Multiple "coming soon" CTAs (2FA, data export, AI features) — acceptable for V1 beta.',
    status: 'partial',
    severity: 'medium',
    recommendation: 'Disable or hide non-functional destructive actions until backend ready.',
  },
  {
    id: 'seo-meta',
    category: 'Production',
    title: 'SEO & meta tags',
    description: 'Basic index.html title; no per-route meta or OG tags.',
    status: 'partial',
    severity: 'low',
    recommendation: 'Add react-helmet or similar for public pages.',
  },
];

export const AUDITED_PAGES = [
  'Landing',
  'Login / Signup / Forgot password / Verify email',
  'Onboarding',
  'Dashboard',
  'Pet Profile',
  'Scan',
  'Timeline',
  'Reminders',
  'Emergency Passport',
  'Lost Pet / Lost Pet Report',
  'Pet Age Translator',
  'PetCare Score',
  'Settings',
  'Notifications',
  'Family Access',
  'Billing / Pricing',
  'Waitlist / Referrals',
  'Launch Readiness (internal)',
] as const;

export function calculateReadinessScore(): number {
  const weights: Record<AuditStatus, number> = { pass: 1, partial: 0.5, fail: 0 };
  const total = LAUNCH_READINESS_AUDIT.reduce((sum, item) => sum + weights[item.status], 0);
  return Math.round((total / LAUNCH_READINESS_AUDIT.length) * 100);
}

export function getReadinessSummary() {
  const score = calculateReadinessScore();
  const pass = LAUNCH_READINESS_AUDIT.filter((i) => i.status === 'pass').length;
  const partial = LAUNCH_READINESS_AUDIT.filter((i) => i.status === 'partial').length;
  const fail = LAUNCH_READINESS_AUDIT.filter((i) => i.status === 'fail').length;
  const high = LAUNCH_READINESS_AUDIT.filter((i) => i.severity === 'high').length;

  let label: string;
  if (score >= 85) label = 'Launch ready (V1 beta)';
  else if (score >= 70) label = 'Near ready — address high-severity items';
  else label = 'Not ready — critical gaps remain';

  return { score, pass, partial, fail, high, label };
}
