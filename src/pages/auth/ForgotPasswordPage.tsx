import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/auth/AuthProvider';
import { ROUTES } from '@/routes/paths';
import { PAGE_IMG } from '@/data/pageImages';
import styles from './AuthPages.module.css';

const RECOVERY_VISUAL = {
  visualImage: PAGE_IMG.auth.recovery,
} as const;

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <AuthLayout {...RECOVERY_VISUAL} footer={<Link to={ROUTES.LOGIN}>Back to sign in</Link>}>
        <div className={styles.success}>
          <div className={styles.successIcon}>
            <div className={styles.check} />
          </div>
          <h1 className={styles.successTitle}>Check your email</h1>
          <p className={styles.successText}>
            If an account exists for {email}, we&apos;ve sent password reset instructions.
          </p>
          <Link to={ROUTES.LOGIN}>
            <Button variant="secondary" size="md">Return to sign in</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout {...RECOVERY_VISUAL} footer={<Link to={ROUTES.LOGIN}>Back to sign in</Link>}>
      <div className={styles.header}>
        <h1 className={styles.title}>Reset password</h1>
        <p className={styles.subtitle}>We&apos;ll send you a link to reset your password</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        <Button variant="primary" size="lg" fullWidth type="submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
    </AuthLayout>
  );
}
