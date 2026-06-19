import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { AuthSession, User } from '@/types/auth';
import type { ProfileRow } from '@/services/supabase/database.types';
import { extractDisplayName } from './extractDisplayName';

export function mapToAuthSession(
  session: Session,
  profile: ProfileRow | null,
): AuthSession {
  return {
    user: mapToUser(session.user, profile, { hasActiveSession: true }),
    accessToken: session.access_token,
  };
}

/** True when Supabase has confirmed the email, or the user holds a valid session. */
export function isEmailVerified(
  supabaseUser: SupabaseUser,
  hasActiveSession = false,
): boolean {
  if (supabaseUser.email_confirmed_at) return true;
  if (supabaseUser.confirmed_at) return true;

  const identityVerified = supabaseUser.identities?.some(
    (identity) => identity.identity_data?.email_verified === true,
  );
  if (identityVerified) return true;

  // When "Confirm email" is off in Supabase, legacy users may lack
  // email_confirmed_at but still receive a session after sign-in.
  if (hasActiveSession) return true;

  return false;
}

export function mapToUser(
  supabaseUser: SupabaseUser,
  profile: ProfileRow | null,
  options?: { hasActiveSession?: boolean },
): User {
  const metadataName = extractDisplayName(supabaseUser);

  return {
    id: supabaseUser.id,
    name: profile?.name?.trim() ? profile.name : metadataName,
    email: supabaseUser.email ?? profile?.email ?? '',
    emailVerified: isEmailVerified(supabaseUser, options?.hasActiveSession ?? false),
    needsOnboarding: !(profile?.onboarding_completed ?? false),
    foundingMember: profile?.founding_member ?? false,
    foundingTrialEndsAt: profile?.founding_trial_ends_at ?? null,
    foundingLifetimeDiscount: profile?.founding_lifetime_discount ?? false,
    subscriptionTier: profile?.subscription_tier ?? 'free',
    subscriptionPlan: profile?.subscription_plan ?? 'free',
    subscriptionStatus: profile?.subscription_status ?? 'inactive',
    createdAt: supabaseUser.created_at,
  };
}

export function mapAuthError(message: string, code = 'auth_error'): { code: string; message: string } {
  const normalized = message.toLowerCase();

  if (normalized.includes('already registered') || normalized.includes('already exists')) {
    return { code: 'email_exists', message: 'An account with this email already exists.' };
  }

  if (normalized.includes('invalid login credentials')) {
    return { code: 'invalid_credentials', message: 'Invalid email or password.' };
  }

  if (normalized.includes('email not confirmed')) {
    return {
      code: 'email_not_confirmed',
      message: 'Please verify your email before signing in.',
    };
  }

  return { code, message };
}
