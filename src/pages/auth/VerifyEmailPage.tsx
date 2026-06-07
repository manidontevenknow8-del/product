import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui';
import { useAuth } from '@/auth/AuthProvider';
import { queueWelcomeEmail } from '@/services/email/queueWelcomeEmail';
import { ROUTES } from '@/routes/paths';
import { PAGE_IMG } from '@/data/pageImages';
import styles from './AuthPages.module.css';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    pendingVerificationEmail,
    refreshSession,
    resendVerificationEmail,
  } = useAuth();

  const stateEmail = (location.state as { email?: string } | null)?.email;
  const email = user?.email ?? pendingVerificationEmail ?? stateEmail ?? '';

  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [continueLoading, setContinueLoading] = useState(false);
  const [continueError, setContinueError] = useState('');

  useEffect(() => {
    if (!email) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const handleResend = async () => {
    if (!email) return;
    setResendError('');
    setResendMessage('');
    setResendLoading(true);
    const result = await resendVerificationEmail(email);
    setResendLoading(false);
    if (result.error) {
      setResendError(result.error);
      return;
    }
    setResendMessage('Verification email sent. Please check your inbox.');
  };

  const handleContinue = async () => {
    setContinueError('');
    setContinueLoading(true);
    const session = await refreshSession();
    setContinueLoading(false);

    if (!session?.user.emailVerified) {
      setContinueError('Your email is not verified yet. Check your inbox and try again.');
      return;
    }

    void queueWelcomeEmail();

    navigate(session.user.needsOnboarding ? ROUTES.ONBOARDING : ROUTES.DASHBOARD, {
      replace: true,
    });
  };

  return (
    <AuthLayout
      visualImage={PAGE_IMG.auth.recovery}
      visualTitle="Verify your email to continue"
      footer={<Link to={ROUTES.LOGIN}>Sign in instead</Link>}
    >
      <div className={styles.success}>
        <div className={styles.successIcon}>
          <div className={styles.check} />
        </div>
        <h1 className={styles.successTitle}>Verify your email</h1>
        <p className={styles.successText}>
          We sent a verification link to{' '}
          <strong>{email || 'your email'}</strong>.
          Please check your inbox and confirm your address before continuing.
        </p>

        {continueError && <div className={styles.error}>{continueError}</div>}
        {resendError && <div className={styles.error}>{resendError}</div>}
        {resendMessage && <p className={styles.resendSuccess}>{resendMessage}</p>}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleContinue}
          disabled={continueLoading}
        >
          {continueLoading ? 'Checking verification…' : 'Continue to setup'}
        </Button>

        <p className={styles.linkRow}>
          <button
            type="button"
            className={styles.textButton}
            onClick={handleResend}
            disabled={resendLoading || !email}
          >
            {resendLoading ? 'Sending…' : 'Resend verification email'}
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
