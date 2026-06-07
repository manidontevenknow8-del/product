export type ScoreFactorId =
  | 'profile_completeness'
  | 'health_records_count'
  | 'document_completeness'
  | 'upcoming_reminder_coverage'
  | 'reminder_completion_rate'
  | 'passport_completeness';

export type FactorStatus = 'excellent' | 'good' | 'fair' | 'needs_attention';

export type ScoreTrend = 'up' | 'down' | 'stable';

export type ScoreFactor = {
  id: ScoreFactorId;
  label: string;
  score: number;
  maxContribution: number;
  status: FactorStatus;
  description: string;
  suggestion?: string;
};

export type ScoreSnapshot = {
  score: number;
  label: string;
  summary: string;
  trend: ScoreTrend;
  trendDelta: number;
  lastUpdated: string;
};

export type ScoreHistoryPoint = {
  date: string;
  score: number;
  label?: string;
};

export type HealthInsight = {
  id: string;
  message: string;
  type: 'positive' | 'neutral' | 'suggestion';
  category: string;
};

export type CareRecommendation = {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionLabel?: string;
  actionPath?: string;
};

export type PositiveProgress = {
  id: string;
  message: string;
};

export type AttentionItem = {
  id: string;
  title: string;
  description: string;
  gentle: boolean;
};

export type ScoreBreakdown = {
  helping: ScoreFactor[];
  improving: ScoreFactor[];
  suggestions: string[];
  increasedBecause: string[];
  decreasedBecause: string[];
};

export type WeeklyInsight = {
  id: string;
  title: string;
  message: string;
  highlight?: string;
};

export type PetCareScoreData = {
  snapshot: ScoreSnapshot;
  factors: ScoreFactor[];
  breakdown: ScoreBreakdown;
  history: ScoreHistoryPoint[];
  insights: HealthInsight[];
  recommendations: CareRecommendation[];
  positiveProgress: PositiveProgress[];
  attentionItems: AttentionItem[];
  weeklyInsight: WeeklyInsight;
};
