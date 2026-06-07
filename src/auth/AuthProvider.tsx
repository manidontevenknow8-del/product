import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { eventTracker } from '@/analytics/EventTracker';
import { authService, type IAuthService } from '@/services/auth/authService';
import { queueWelcomeEmail } from '@/services/email/queueWelcomeEmail';
import type { AuthSession, SignInInput, SignUpInput, User } from '@/types/auth';

type SignUpResult = {
  error?: string;
  pendingVerification?: boolean;
  email?: string;
  needsOnboarding?: boolean;
};

type SignInResult = {
  error?: string;
  emailVerified?: boolean;
  needsOnboarding?: boolean;
};

type AuthContextValue = {
  user: User | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  pendingVerificationEmail: string | null;
  signUp: (input: SignUpInput) => Promise<SignUpResult>;
  signIn: (input: SignInInput) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (password: string) => Promise<{ error?: string }>;
  completeOnboarding: () => Promise<void>;
  verifyEmail: () => Promise<void>;
  refreshSession: () => Promise<AuthSession | null>;
  resendVerificationEmail: (email: string) => Promise<{ error?: string; success?: boolean }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
  authService?: IAuthService;
};

export function AuthProvider({
  children,
  authService: service = authService,
}: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const emailVerifiedTracked = useRef(false);
  const previousEmailVerified = useRef<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = service.onAuthStateChange((nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setIsLoading(false);

      const isVerified = nextSession?.user.emailVerified ?? false;
      if (isVerified && !emailVerifiedTracked.current) {
        emailVerifiedTracked.current = true;
        eventTracker.track('email_verified');
      }

      if (isVerified && previousEmailVerified.current === false) {
        void queueWelcomeEmail();
      }
      previousEmailVerified.current = isVerified ? true : false;
    });

    // Safety net — never leave the app stuck on "Loading"
    const timeout = window.setTimeout(() => {
      if (mounted) setIsLoading(false);
    }, 5000);

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
      unsubscribe();
    };
  }, [service]);

  const signUp = useCallback(
    async (input: SignUpInput): Promise<SignUpResult> => {
      const result = await service.signUp(input);
      if (!result.success) {
        return { error: result.error.message };
      }

      if ('pendingVerification' in result && result.pendingVerification) {
        setSession(null);
        setPendingVerificationEmail(result.email);
        return { pendingVerification: true, email: result.email };
      }

      if (!result.session) {
        return { error: 'Unable to create account. Please try again.' };
      }

      setSession(result.session);
      setPendingVerificationEmail(null);
      void queueWelcomeEmail();
      return {
        needsOnboarding: result.session.user.needsOnboarding,
      };
    },
    [service],
  );

  const signIn = useCallback(
    async (input: SignInInput): Promise<SignInResult> => {
      const result = await service.signIn(input);
      if (!result.success) {
        return { error: result.error.message };
      }

      if (!result.session) {
        return { error: 'Unable to sign in. Please try again.' };
      }

      setSession(result.session);
      setPendingVerificationEmail(null);
      return {
        emailVerified: result.session.user.emailVerified,
        needsOnboarding: result.session.user.needsOnboarding,
      };
    },
    [service],
  );

  const signOut = useCallback(async () => {
    await service.signOut();
    setSession(null);
    setPendingVerificationEmail(null);
  }, [service]);

  const resetPassword = useCallback(
    async (email: string) => {
      const result = await service.resetPassword(email);
      if (!result.success) return { error: result.error };
      return {};
    },
    [service],
  );

  const updatePassword = useCallback(
    async (password: string) => {
      const result = await service.updatePassword(password);
      if (!result.success) return { error: result.error };
      const updated = await service.refreshSession();
      setSession(updated);
      return {};
    },
    [service],
  );

  const refreshSession = useCallback(async () => {
    const updated = await service.refreshSession();
    setSession(updated);
    return updated;
  }, [service]);

  const completeOnboarding = useCallback(async () => {
    if (!session?.user.id) return;
    await service.completeOnboarding(session.user.id);
    const updated = await service.refreshSession();
    setSession(updated);
  }, [service, session?.user.id]);

  const verifyEmail = useCallback(async () => {
    if (!session?.user.id) return;
    await service.verifyEmail(session.user.id);
    const updated = await service.refreshSession();
    setSession(updated);
  }, [service, session?.user.id]);

  const resendVerificationEmail = useCallback(
    async (email: string) => {
      const result = await service.resendVerificationEmail(email);
      if (!result.success) return { error: result.error };
      return { success: true };
    },
    [service],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      isLoading,
      isAuthenticated: !!session?.user,
      pendingVerificationEmail,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
      completeOnboarding,
      verifyEmail,
      refreshSession,
      resendVerificationEmail,
    }),
    [
      session,
      isLoading,
      pendingVerificationEmail,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
      completeOnboarding,
      verifyEmail,
      refreshSession,
      resendVerificationEmail,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
