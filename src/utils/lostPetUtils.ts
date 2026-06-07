import type { LostPetCase, RecoveryPhase, RecoveryStats } from '@/types/lostPet';

export function formatMissingSince(isoDate: string, now = new Date()): string {
  const start = new Date(isoDate);
  const diffMs = Math.max(0, now.getTime() - start.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;

  if (days > 0) {
    return `${days}d ${remHours}h`;
  }
  if (hours > 0) {
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    return `${hours}h ${minutes}m`;
  }
  const minutes = Math.floor(diffMs / (1000 * 60));
  return `${minutes}m`;
}

export function formatLastUpdated(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function formatDateTime(isoDate: string): string {
  return new Date(isoDate).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getRecoveryPhase(activeCase: LostPetCase): RecoveryPhase {
  if (activeCase.status === 'resolved') return 'found';
  if (activeCase.sightingsCount >= 2) return 'monitoring';
  if (activeCase.reportsReceived > 0) return 'sharing';
  return 'activated';
}

export function getRecoveryStats(activeCase: LostPetCase): RecoveryStats {
  const phase = getRecoveryPhase(activeCase);
  const progressMap: Record<RecoveryPhase, number> = {
    activated: 25,
    sharing: 50,
    monitoring: 75,
    found: 100,
  };

  return {
    sightingsCount: activeCase.sightingsCount,
    reportsReceived: activeCase.reportsReceived,
    sharesCount: activeCase.reportsReceived,
    phase,
    progressPercent: activeCase.status === 'resolved' ? 100 : progressMap[phase],
  };
}

export function buildRecoveryLink(petName: string, caseId: string, origin?: string): string {
  const base =
    origin ?? (typeof window !== 'undefined' ? window.location.origin : 'https://petclues.app');
  const slug = petName.toLowerCase().replace(/\s+/g, '-');
  return `${base}/lost-pet/report?case=${caseId}&pet=${slug}`;
}

export function toDatetimeLocalValue(isoDate: string): string {
  const d = new Date(isoDate);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function nowDatetimeLocalValue(): string {
  return toDatetimeLocalValue(new Date().toISOString());
}
