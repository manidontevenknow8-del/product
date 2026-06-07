export {
  getSupabaseConfig,
  getAuthRedirectUrl,
  isSupabaseConfigured,
  SupabaseConfigError,
  type SupabaseConfig,
} from './config';
export { getSupabaseClient, tryGetSupabaseClient } from './client';
export type { Database, ProfileRow, SubscriptionTier } from './database.types';
