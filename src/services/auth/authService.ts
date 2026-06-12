/**
 * Auth service entry point - selects Supabase when configured, otherwise mock.
 */

import { isSupabaseConfigured } from '@/services/supabase/config';
import { mockAuthService } from './mockAuthService';
import { supabaseAuthService } from './supabaseAuthService';
import type { IAuthService } from './types';

export type { IAuthService } from './types';
export { mockAuthService } from './mockAuthService';
export { supabaseAuthService } from './supabaseAuthService';

export function getAuthService(): IAuthService {
  return isSupabaseConfigured() ? supabaseAuthService : mockAuthService;
}

/** Active auth service used by the application. */
export const authService = getAuthService();
