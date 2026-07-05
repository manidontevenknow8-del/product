/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_POSTHOG_KEY?: string;
  readonly VITE_POSTHOG_HOST?: string;
  readonly VITE_DEMO_TIMELINE?: string;
  readonly VITE_DEMO_DASHBOARD?: string;
  readonly VITE_PAYMENTS_ENABLED?: string;
  readonly VITE_RAZORPAY_KEY_ID?: string;
  readonly VITE_GENESIS_RAZORPAY_PAYMENT_LINK?: string;
  readonly VITE_VAPID_PUBLIC_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
