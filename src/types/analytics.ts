export type AnalyticsEventName =
  | 'signup_started'
  | 'signup_completed'
  | 'email_verified'
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'login_completed'
  | 'google_oauth_started'
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
  | 'dashboard_viewed'
  | 'timeline_viewed'
  | 'pet_profile_viewed'
  | 'insights_viewed'
  | 'story_share_published'
  | 'story_share_refreshed'
  | 'story_share_regenerated'
  | 'story_share_copied'
  | 'passport_viewed'
  | 'passport_exported'
  | 'waitlist_joined'
  | 'referral_shared'
  | 'referral_invited'
  | 'referral_converted'
  | 'referral_completed'
  | 'pet_match_viewed'
  | 'pet_match_completed'
  | 'pricing_viewed'
  | 'checkout_started'
  | 'checkout_completed'
  | 'upgrade_clicked'
  | 'premium_started'
  | 'subscription_started'
  | 'premium_checkout_started'
  | 'premium_payment_success'
  | 'premium_payment_failed'
  | 'premium_subscription_activated'
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
