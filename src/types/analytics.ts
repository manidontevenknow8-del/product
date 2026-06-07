export type AnalyticsEventName =
  | 'signup_started'
  | 'signup_completed'
  | 'email_verified'
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'login_completed'
  | 'pet_created'
  | 'pet_updated'
  | 'reminder_created'
  | 'reminder_completed'
  | 'automation_reminder_created'
  | 'document_uploaded'
  | 'health_record_created'
  | 'vet_bill_decoded'
  | 'vet_bill_approved'
  | 'vet_bill_report_deleted'
  | 'timeline_entry_created'
  | 'passport_viewed'
  | 'passport_exported'
  | 'waitlist_joined'
  | 'referral_shared'
  | 'referral_invited'
  | 'referral_converted'
  | 'referral_completed'
  | 'pricing_viewed'
  | 'upgrade_clicked'
  | 'premium_started'
  | 'subscription_started'
  | 'daily_check_in_logged'
  | 'monthly_report_generated'
  | 'monthly_report_saved'
  | 'monthly_report_downloaded'
  | 'page_view'
  | 'feedback_submitted'
  | 'error_occurred';

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  properties?: Record<string, string | number | boolean | null>;
  timestamp: string;
  userId?: string;
  sessionId: string;
};

export type AnalyticsAdapterName =
  | 'console'
  | 'localStorage'
  | 'posthog'
  | 'plausible'
  | 'google_analytics'
  | 'mixpanel';
