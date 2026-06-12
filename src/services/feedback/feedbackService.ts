import type { FeedbackInput, FeedbackType } from '@/types/feedback';

const STORAGE_KEY = 'petclues_feedback';

/**
 * Feedback service - swap for Supabase, Intercom, or Linear integration.
 */
export interface IFeedbackService {
  submit(input: FeedbackInput): Promise<{ success: boolean; id: string }>;
  list(): Promise<FeedbackInput[]>;
}

export const mockFeedbackService: IFeedbackService = {
  async submit(input) {
    const stored = localStorage.getItem(STORAGE_KEY);
    const items: FeedbackInput[] = stored ? JSON.parse(stored) : [];
    const id = `fb_${Date.now()}`;
    items.unshift({ ...input, id, submittedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 100)));
    return { success: true, id };
  },

  async list() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },
};

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  bug: 'Report an issue',
  feature: 'Feature request',
  general: 'General feedback',
};
