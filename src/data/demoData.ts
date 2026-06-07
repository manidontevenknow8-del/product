/**
 * Central toggles for mock/demo data.
 * Replace each flag with real API responses after backend integration.
 *
 * Set VITE_DEMO_TIMELINE=true in .env to preview timeline mock data locally.
 */
export const DEMO_DATA = {
  timeline: import.meta.env.VITE_DEMO_TIMELINE === 'true',
  dashboardActivity: import.meta.env.VITE_DEMO_DASHBOARD === 'true',
  profileDocuments: import.meta.env.VITE_DEMO_PROFILE_DOCS === 'true',
} as const;

export type DemoDataKey = keyof typeof DEMO_DATA;

export function isDemoDataEnabled(key: DemoDataKey): boolean {
  return DEMO_DATA[key];
}
