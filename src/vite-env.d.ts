/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_DEMO_TIMELINE?: string;
  readonly VITE_DEMO_DASHBOARD?: string;
  readonly VITE_PAYMENTS_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
