import type { ScoreSnapshot, ScoreTrend } from '@/types/petCareScore';

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Getting Started';
}

export function getTrendLabel(trend: ScoreTrend, delta: number): string {
  if (trend === 'up') return `+${delta} pts`;
  if (trend === 'down') return `${delta} pts`;
  return 'Steady';
}

export function getFactorStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Room to grow',
    needs_attention: 'Gentle nudge',
  };
  return labels[status] ?? status;
}

export function computeOverallFromFactors(
  factors: { score: number; maxContribution: number }[],
): number {
  const totalWeight = factors.reduce((s, f) => s + f.maxContribution, 0);
  const weighted = factors.reduce((s, f) => s + (f.score * f.maxContribution) / 100, 0);
  return Math.round((weighted / totalWeight) * 100);
}

export function formatLastUpdated(date: string): string {
  return date;
}

export function getEncouragingMessage(snapshot: ScoreSnapshot): string {
  if (snapshot.trend === 'up' && snapshot.trendDelta >= 5) {
    return `You've improved ${snapshot.trendDelta} points — keep building on what's working.`;
  }
  if (snapshot.score >= 85) {
    return "You're doing wonderfully. Small refinements keep momentum going.";
  }
  return 'Every small step adds up. Focus on one improvement at a time.';
}
