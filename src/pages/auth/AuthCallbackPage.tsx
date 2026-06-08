import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { LoadingState } from '@/components/ui';
import { PAGE_IMG } from '@/data/pageImages';
import { useAuth } from '@/auth/AuthProvider';
import { queueWelcomeEmail } from '@/services/email/queueWelcomeEmail';
import { ROUTES } from '@/routes/paths';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshSession } = useAuth();
  useEffect(() => {
    async function handleCallback() {
      const session = await refreshSession();
      const type = searchParams.get('type');

      if (type === 'recovery') {
        navigate(ROUTES.RESET_PASSWORD, { replace: true });
        return;
      }

      if (session?.user.emailVerified) {
        void queueWelcomeEmail();
        navigate(
          session.user.needsOnboarding ? ROUTES.ONBOARDING : ROUTES.DASHBOARD,
          { replace: true },
        );
        return;
      }

      navigate(ROUTES.VERIFY_EMAIL, { replace: true });
    }

    void handleCallback();
  }, [navigate, refreshSession, searchParams]);

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
