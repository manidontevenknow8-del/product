/**
 * Full SaaS feature comparison matrix for pricing page.
 */

export type MatrixCell = string | boolean | 'launching' | 'enterprise-only';

export type ComparisonRow = {
  id: string;
  label: string;
  category?: string;
  free: MatrixCell;
  plus: MatrixCell;
  pro: MatrixCell;
  enterprise: MatrixCell;
};

export const COMING_SOON_FEATURES = [
  'Medical Timeline Intelligence',
  'AI Health Summary Reports',
  'Cross-Pet Insights',
  'Care Pattern Analysis',
  'Advanced Passport Exports',
  'Vet Collaboration Tools',
  'Multi-Caregiver Workspaces',
  'Emergency Care Mode',
] as const;

export const ENTERPRISE_EXCLUSIVE_FEATURES = [
  'Clinic Dashboard',
  'Staff Accounts',
  'Organization Management',
  'Bulk Pet Import',
  'Clinic Branding',
  'Custom Reports',
  'Dedicated Account Manager',
  'API Access',
] as const;

export const FEATURE_COMPARISON: ComparisonRow[] = [
  {
    id: 'pets',
    label: 'Pet profiles',
    category: 'Core',
    free: '1 pet',
    plus: '3 pets',
    pro: '10 pets',
    enterprise: 'Custom',
  },
  {
    id: 'health-records',
    label: 'Health record storage',
    free: 'Basic',
    plus: 'Unlimited',
    pro: 'Unlimited',
    enterprise: 'Unlimited',
  },
  {
    id: 'reminders',
    label: 'Reminders',
    free: 'Basic reminders',
    plus: 'Advanced reminders',
    pro: 'Advanced reminders',
    enterprise: 'Advanced reminders',
  },
  {
    id: 'passport',
    label: 'Pet passports',
    free: false,
    plus: true,
    pro: true,
    enterprise: true,
  },
  {
    id: 'monthly-reports',
    label: 'Monthly reports',
    free: false,
    plus: true,
    pro: true,
    enterprise: true,
  },
  {
    id: 'timeline',
    label: 'Timeline',
    free: 'Basic',
    plus: 'Full',
    pro: 'Full',
    enterprise: 'Full',
  },
  {
    id: 'petcare-score',
    label: 'PetCare Score',
    free: false,
    plus: 'Yes',
    pro: 'Advanced',
    enterprise: 'Advanced',
  },
  {
    id: 'ai',
    label: 'AI features',
    free: false,
    plus: 'Basic AI',
    pro: 'Advanced AI',
    enterprise: 'Advanced AI',
  },
  {
    id: 'family',
    label: 'Family sharing',
    free: false,
    plus: '2 members',
    pro: 'Unlimited',
    enterprise: 'Unlimited',
  },
  {
    id: 'priority-support',
    label: 'Priority support',
    free: false,
    plus: false,
    pro: true,
    enterprise: 'Dedicated',
  },
  {
    id: 'coming-soon',
    label: 'Launching Soon features',
    free: false,
    plus: false,
    pro: 'launching',
    enterprise: 'launching',
  },
  {
    id: 'enterprise-exclusive',
    label: 'Enterprise exclusive',
    free: false,
    plus: false,
    pro: false,
    enterprise: 'enterprise-only',
  },
];
