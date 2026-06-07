export type FeedbackType = 'bug' | 'feature' | 'general';

export type FeedbackInput = {
  id?: string;
  type: FeedbackType;
  message: string;
  email?: string;
  page?: string;
  submittedAt?: string;
};
