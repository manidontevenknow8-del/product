import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button, LoadingState } from '@/components/ui';
import { PAGE_IMG } from '@/data/pageImages';
import { useAuth } from '@/auth/AuthProvider';
import { queueWelcomeEmail } from '@/services/email/queueWelcomeEmail';
import { ROUTES } from '@/routes/paths';
import styles from './AuthPages.module.css';

function readOAuthError(searchParams: URLSearchParams): string | null {
  const fromQuery =
    searchParams.get('error_description') ?? searchParams.get('error');
  if (fromQuery) return decodeURIComponent(fromQuery.replace(/\+/g, ' '));

  const hash = typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '';
  if (!hash) return null;

  const hashParams = new URLSearchParams(hash);
  const fromHash =
    hashParams.get('error_description') ?? hashParams.get('error');
  return fromHash ? decodeURIComponent(fromHash.replace(/\+/g, ' ')) : null;
}

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshSession } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      const oauthError = readOAuthError(searchParams);
      if (oauthError) {
        setError(oauthError);
        return;
      }

      const session = await refreshSession();
      const type = searchParams.get('type');

      if (type === 'recovery') {
        navigate(ROUTES.RESET_PASSWORD, { replace: true });
        return;
      }

      if (!session?.user) {
        setError('Unable to complete sign in. Please try again.');
        return;
      }

      if (session.user.emailVerified) {
        void queueWelcomeEmail();

        const fromPetMatch = searchParams.get('from') === 'pet-match';
        const onboardingPath = fromPetMatch
          ? `${ROUTES.ONBOARDING}?from=pet-match`
          : ROUTES.ONBOARDING;

        navigate(
          session.user.needsOnboarding ? onboardingPath : ROUTES.DASHBOARD,
          { replace: true },
        );
        return;
      }

      navigate(ROUTES.VERIFY_EMAIL, { replace: true });
    }

    void handleCallback();
  }, [navigate, refreshSession, searchParams]);

  if (error) {
    return (
      <AuthLayout
        visualImage={PAGE_IMG.auth.login}
        visualTitle="Sign in interrupted"
        visualSubtitle="We couldn't finish connecting your Google account."
      >
        <div className={styles.header}>
          <h1 className={styles.title}>Sign in failed</h1>
          <p className={styles.subtitle}>Please try again or use email and password.</p>
        </div>
        <div className={styles.error}>{error}</div>
        <Button variant="primary" size="lg" fullWidth onClick={() => navigate(ROUTES.LOGIN)}>
          Back to sign in
        </Button>
        <p className={styles.linkRow}>
          New here? <Link to={ROUTES.SIGNUP}>Create an account</Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      visualImage={PAGE_IMG.auth.login}
      visualTitle="Almost there"
      visualSubtitle="We're confirming your account - you'll be redirected in a moment."
    >
      <LoadingState message="Confirming your account" />
    </AuthLayout>
  );
}
