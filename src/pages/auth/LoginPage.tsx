import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button, Input, LoadingState } from '@/components/ui';
import { AuthDivider, GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { useAuth } from '@/auth/AuthProvider';
import { getPostAuthPath } from '@/auth/postAuthRedirect';
import { useAnalytics } from '@/analytics';
import { ROUTES } from '@/routes/paths';
import { PAGE_IMG } from '@/data/pageImages';
import styles from './AuthPages.module.css';

const LOGIN_VISUAL = {
  visualImage: PAGE_IMG.auth.login,
  visualTitle: "Your pet's health, beautifully organized",
} as const;

export function LoginPage() {
  const { signIn, signInWithGoogle, signOut, isAuthenticated, user, isLoading } = useAuth();
  const { track } = useAnalytics();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? ROUTES.DASHBOARD;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Only skip the login form when redirected here from a protected route
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const fromProtected = (location.state as { from?: string })?.from;
    if (!fromProtected) return;

    navigate(getPostAuthPath(user, fromProtected), { replace: true });
  }, [isAuthenticated, user, navigate, from, location.state]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signIn({ email, password });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    track('login_completed');

    if (result.emailVerified === false) {
      navigate(ROUTES.VERIFY_EMAIL, { replace: true });
      return;
    }

    navigate(result.needsOnboarding ? ROUTES.ONBOARDING : from, { replace: true });
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    const result = await signInWithGoogle();
    setGoogleLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.emailVerified === undefined) return;

    if (result.emailVerified === false) {
      navigate(ROUTES.VERIFY_EMAIL, { replace: true });
      return;
    }

    navigate(result.needsOnboarding ? ROUTES.ONBOARDING : from, { replace: true });
  };

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    setLoading(false);
  };

  if (isLoading) {
    return (
      <AuthLayout {...LOGIN_VISUAL}>
        <LoadingState message="Loading" />
      </AuthLayout>
    );
  }

  if (isAuthenticated && user) {
    const continuePath = getPostAuthPath(user, ROUTES.DASHBOARD);

    return (
      <AuthLayout
        {...LOGIN_VISUAL}
        footer={
          <>
            Don&apos;t have an account? <Link to={ROUTES.SIGNUP}>Sign up</Link>
          </>
        }
      >
        <div className={styles.success}>
          <div className={styles.successIcon}>
            <div className={styles.check} />
          </div>
          <h1 className={styles.successTitle}>You&apos;re already signed in</h1>
          <p className={styles.successText}>
            Signed in as <strong>{user.email}</strong>.
            {user.needsOnboarding
              ? ' Continue pet setup or sign out to use a different account.'
              : ' Continue to your dashboard or sign out to use a different account.'}
          </p>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate(continuePath)}
          >
            {user.needsOnboarding ? 'Continue setup' : 'Go to dashboard'}
          </Button>
          <p className={styles.linkRow}>
            <button
              type="button"
              className={styles.textButton}
              onClick={handleSignOut}
              disabled={loading}
            >
              {loading ? 'Signing out…' : 'Sign out and use another account'}
            </button>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      {...LOGIN_VISUAL}
      footer={
        <>
          Don&apos;t have an account? <Link to={ROUTES.SIGNUP}>Sign up</Link>
        </>
      }
    >
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to your PetClues account</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}
        <GoogleSignInButton onClick={handleGoogleSignIn} loading={googleLoading} disabled={loading} />
        <AuthDivider />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          required
          autoComplete="current-password"
        />
        <div className={styles.forgot}>
          <Link to={ROUTES.FORGOT_PASSWORD}>Forgot password?</Link>
        </div>
        <Button variant="primary" size="lg" fullWidth type="submit" disabled={loading || googleLoading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  );
}
