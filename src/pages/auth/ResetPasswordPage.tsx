import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/auth/AuthProvider';
import { ROUTES } from '@/routes/paths';
import { PAGE_IMG } from '@/data/pageImages';
import styles from './AuthPages.module.css';

export function ResetPasswordPage() {
  const { updatePassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await updatePassword(password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    navigate(isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN, { replace: true });
  };

  return (
    <AuthLayout
      visualImage={PAGE_IMG.auth.recovery}
      footer={<Link to={ROUTES.LOGIN}>Back to sign in</Link>}
    >
      <div className={styles.header}>
        <h1 className={styles.title}>Set a new password</h1>
        <p className={styles.subtitle}>Choose a strong password for your PetClues account</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}
        <Input
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <Input
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <Button variant="primary" size="lg" fullWidth type="submit" disabled={loading}>
          {loading ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </AuthLayout>
  );
}
