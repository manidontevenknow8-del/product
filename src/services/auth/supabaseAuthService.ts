import type { AuthSession } from '@/types/auth';
import { getAuthRedirectUrl } from '@/services/supabase/config';
import { getSupabaseClient } from '@/services/supabase/client';
import type { IAuthService } from './types';
import { extractDisplayName } from './extractDisplayName';
import { mapAuthError, mapToAuthSession } from './mapAuthUser';
import {
  ensureProfile,
  fetchProfile,
  updateProfileOnboarding,
} from './profileService';

async function syncProfileForSession(userId: string, email: string, name: string) {
  await ensureProfile(userId, email, name);
  return fetchProfile(userId);
}

async function buildSessionFromAuth(): Promise<AuthSession | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.warn('[auth] getSession failed:', error.message);
    return null;
  }

  if (!data.session) return null;

  const profile = await syncProfileForSession(
    data.session.user.id,
    data.session.user.email ?? '',
    extractDisplayName(data.session.user),
  );
  return mapToAuthSession(data.session, profile);
}

export const supabaseAuthService: IAuthService = {
  async signUp({ name, email, password, referralCode }) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, referral_code: referralCode ?? null },
        emailRedirectTo: getAuthRedirectUrl(),
      },
    });

    if (error) {
      return { success: false, error: mapAuthError(error.message) };
    }

    if (!data.user) {
      return {
        success: false,
        error: { code: 'signup_failed', message: 'Unable to create account. Please try again.' },
      };
    }

    await ensureProfile(data.user.id, email, name);

    if (!data.session) {
      return {
        success: true,
        session: null,
        pendingVerification: true,
        email,
      };
    }

    const profile = await fetchProfile(data.user.id);
    return {
      success: true,
      session: mapToAuthSession(data.session, profile),
    };
  },

  async signIn({ email, password }) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { success: false, error: mapAuthError(error.message) };
    }

    if (!data.session) {
      return {
        success: false,
        error: { code: 'signin_failed', message: 'Unable to sign in. Please try again.' },
      };
    }

    const profile = await syncProfileForSession(
      data.session.user.id,
      data.session.user.email ?? '',
      extractDisplayName(data.session.user),
    );
    return {
      success: true,
      session: mapToAuthSession(data.session, profile),
    };
  },

  async signInWithGoogle({ referralCode, fromPetMatch } = {}) {
    const supabase = getSupabaseClient();
    const params = new URLSearchParams();
    if (referralCode) params.set('ref', referralCode);
    if (fromPetMatch) params.set('from', 'pet-match');
    const query = params.toString();
    const callbackPath = query ? `/auth/callback?${query}` : '/auth/callback';

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getAuthRedirectUrl(callbackPath),
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });

    if (error) {
      return { success: false, error: mapAuthError(error.message) };
    }

    return { success: true };
  },

  async signOut() {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
  },

  async resetPassword(email) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl('/auth/callback?type=recovery'),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  getSession: buildSessionFromAuth,

  refreshSession: buildSessionFromAuth,

  async completeOnboarding(userId) {
    await updateProfileOnboarding(userId, true);
  },

  async verifyEmail(_userId) {
    await supabaseAuthService.refreshSession();
  },

  async resendVerificationEmail(email) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  async updatePassword(password) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  onAuthStateChange(listener) {
    const supabase = getSupabaseClient();

    const notify = (session: AuthSession | null) => {
      listener(session);
    };

    const buildFromSession = (session: NonNullable<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']>) => {
      // Defer async work - awaiting inside onAuthStateChange can deadlock getSession()
      setTimeout(() => {
        void syncProfileForSession(
          session.user.id,
          session.user.email ?? '',
          extractDisplayName(session.user),
        )
          .then((profile) => notify(mapToAuthSession(session, profile)))
          .catch(() => notify(mapToAuthSession(session, null)));
      }, 0);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        notify(null);
        return;
      }
      buildFromSession(session);
    });

    // Initial session load (separate from the listener to avoid auth lock contention)
    void supabase.auth
      .getSession()
      .then(async ({ data, error }) => {
        if (error || !data.session) {
          notify(null);
          return;
        }
        const profile = await syncProfileForSession(
          data.session.user.id,
          data.session.user.email ?? '',
          extractDisplayName(data.session.user),
        );
        notify(mapToAuthSession(data.session, profile));
      })
      .catch(() => notify(null));

    return () => subscription.unsubscribe();
  },
};
