import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/auth/AuthProvider';
import { useAnalytics } from '@/analytics';
import { ROUTES } from '@/routes/paths';
import { PAGE_IMG } from '@/data/pageImages';
import styles from './AuthPages.module.css';

export function SignupPage() {
  const { signUp } = useAuth();
  const { track } = useAnalytics();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fromPetMatch = searchParams.get('from') === 'pet-match';

  useEffect(() => {
    track('signup_started', fromPetMatch ? { source: 'pet_match' } : undefined);
  }, [track, fromPetMatch]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const referralCode = searchParams.get('ref');
    const result = await signUp({ name, email, password, referralCode: referralCode ?? undefined });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    track('signup_completed', { pendingVerification: !!result.pendingVerification });

    if (result.pendingVerification) {
      navigate(ROUTES.VERIFY_EMAIL, { state: { email: result.email ?? email } });
      return;
    }

    const onboardingPath = fromPetMatch
      ? `${ROUTES.ONBOARDING}?from=pet-match`
      : ROUTES.ONBOARDING;
    navigate(result.needsOnboarding === false ? ROUTES.DASHBOARD : onboardingPath);
  };

  return (
    <AuthLayout
      visualImage={PAGE_IMG.auth.signup}
      visualTitle="Start your pet's care journey"
      footer={
        <>
          Already have an account? <Link to={ROUTES.LOGIN}>Sign in</Link>
        </>
      }
    >
      <div className={styles.header}>
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>
          {fromPetMatch
            ? 'Your breed matches are waiting — create a free journal for your future companion.'
            : 'Start caring for your companion with clarity'}
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}
        <Input
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          autoComplete="name"
        />
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
          placeholder="At least 8 characters"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <Button variant="primary" size="lg" fullWidth type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
}
