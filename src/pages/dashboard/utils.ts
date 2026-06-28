export function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatWeightNumber(weight: string | null | undefined): string {
  if (!weight) return '—';
  const match = weight.match(/^([\d.]+)/);
  return match ? match[1] : weight.replace(/\s*kg/i, '').trim();
}

export function clampPercent(n: number): number {
  return Math.max(0, Math.min(100, n));
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
